import { execFile, spawn } from 'node:child_process'
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { hashFile, jsonBytes, RELEASE_LAYOUT, verifyPackagedRuntime, type FileIdentity } from '@shaco-forge/contracts/packaged-runtime'
import { InstallerOperations } from './installer-operations.js'
import { verifyInstallerReleaseTrust } from './installer-release-trust.js'
import { UpdateTransaction, type TransactionRecord } from './update-transaction.js'
import { uninstall, readUninstallInventory } from './uninstall.js'
import type { ProductControlPaths } from './control-preflight.js'

const run = promisify(execFile)
export async function installerMain(): Promise<void> {
  const [installer, mode] = process.argv.slice(2)
  if (!installer || !['--install', '--recover', '--uninstall'].includes(mode ?? '') || process.argv.length !== 4) throw new Error('INSTALLER_ARGUMENTS_REJECTED')
  if (process.version !== 'v22.19.0' || process.platform !== 'win32' || process.arch !== 'x64') throw new Error('INSTALLER_RUNTIME_REJECTED')
  const payload = resolve(import.meta.dirname, '../../../..')
  const release = await verifyPackagedRuntime(payload)
  const helper = join(payload, RELEASE_LAYOUT.nativeHelper)
  const native = async (args: string[], input?: string): Promise<Record<string, unknown>> => {
    if (input === undefined) return JSON.parse((await run(helper, args, { env: {}, windowsHide: true, timeout: 30_000 })).stdout) as Record<string, unknown>
    return new Promise((done, reject) => {
      const child = spawn(helper, args, { env: {}, windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] })
      let output = ''
      const timer = setTimeout(() => { child.kill(); reject(new Error('NATIVE_OPERATION_TIMEOUT')) }, 30_000)
      child.stdout.on('data', bytes => { output += String(bytes) })
      child.once('error', error => { clearTimeout(timer); reject(error) })
      child.once('exit', code => { clearTimeout(timer); if (code !== 0) reject(new Error('NATIVE_OPERATION_FAILED')); else { try { done(JSON.parse(output) as Record<string, unknown>) } catch (error) { reject(error) } } })
      child.stdin.on('error', () => {}); child.stdin.end(input, 'utf8')
    })
  }
  const releaseTrust = { installer: resolve(installer), digest: await hashFile(installer), nativeHelper: helper }
  await verifyInstallerReleaseTrust({ release, ...releaseTrust })
  const selected = await native(['--select-product-control', payload]) as unknown as ProductControlPaths
  if (!selected.canonical || selected.writes !== 0) throw new Error('DSH_HOME_MISMATCH')
  const runtime = join(selected.installRoot, 'current')
  const paths = { payload, runtime, dsh: selected.dshHome, control: selected.controlRoot, backup: selected.backupRoot }
  const boundary = {
    fence: (operation: 'capture' | 'apply' | 'verify' | 'release' | 'processes' | 'close-desktop', dacl?: string) => native(['--runtime-fence', operation], dacl),
    assertRegistrationClear: async () => {
      await native(['--assert-install-registration-clear'])
      const retained = join(selected.installRoot, 'installer.exe')
      const info = await stat(retained).catch(error => { if (error.code === 'ENOENT') return undefined; throw error })
      if (info && await hashFile(retained) !== releaseTrust.digest) throw new Error('UNOWNED_INSTALLER_FILE')
    },
    rollbackRegistration: async () => { await native(['--rollback-install-registration', currentVersion(release.ProductVersion)]) },
    register: async () => {
      await native(['--protect-product-directory', selected.installRoot])
      const retained = join(selected.installRoot, 'installer.exe')
      if (resolve(installer) !== retained) {
        try { await copyFile(installer, retained, 1) }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || await hashFile(retained) !== releaseTrust.digest) throw error }
      }
      if (await hashFile(retained) !== releaseTrust.digest) throw new Error('INSTALLER_ARTIFACT_DIGEST_MISMATCH')
      await native(['--register-product-install', currentVersion(release.ProductVersion)])
    },
    protect: async (path: string) => { await native(['--protect-product-directory', path]) },
    verifyAcl: async (path: string) => { await native(['--verify-product-tree', path]) },
    publishJournal: async (record: TransactionRecord) => {
      await new Promise<void>((done, reject) => {
        const child = spawn(helper, ['--publish-upgrade-journal', selected.controlRoot], { env: {}, windowsHide: true, stdio: ['pipe', 'ignore', 'ignore'] })
        const timer = setTimeout(() => { child.kill(); reject(new Error('JOURNAL_PUBLICATION_TIMEOUT')) }, 30_000)
        child.once('error', error => { clearTimeout(timer); reject(error) })
        child.once('exit', code => { clearTimeout(timer); code === 0 ? done() : reject(new Error('JOURNAL_PUBLICATION_FAILED')) })
        child.stdin.on('error', () => {})
        child.stdin.end(jsonBytes(record), 'utf8')
      })
    },
  }
  const operations = new InstallerOperations(paths, boundary, releaseTrust)
  if (mode === '--uninstall') {
    const inventory = await readUninstallInventory(runtime, payload)
    const current = release
    await native(['--validate-install-registration', currentVersion(current.ProductVersion)])
    const identity = JSON.parse(await readFile(join(runtime, 'artifact-identity.json'), 'utf8')) as { digest: string; releaseManifestSha256: string }
    const old = await operations.readJournal()
    if (old && !['COMMITTED', 'RESTORED', 'ABORTED', 'IDLE'].includes(old.state)) throw new Error('RESTORE_REQUIRED')
    const releaseControl = { artifactDigest: identity.digest, releaseManifestDigest: identity.releaseManifestSha256, productVersion: current.ProductVersion, dshHome: selected.dshHome }
    const journal: TransactionRecord = { id: randomUUID(), state: 'DRAINING', source: releaseControl, target: releaseControl, installed: false, events: [{ state: 'DRAINING', at: new Date().toISOString() }] }
    await boundary.publishJournal(journal)
    await operations.initialize(true)
    Object.assign(journal, await operations.prepareDrain())
    await operations.persist(journal)
    // The released uninstall UI offers retention only. The separately confirmed
    // purge operation is exercised via the explicit isolated test adapter.
    const result = await uninstall(runtime, inventory, { drain: () => operations.drain(), assertQuiescent: () => operations.assertQuiescent(), purgeConfirmedData: async () => { throw new Error('PRODUCTION_PURGE_NOT_OFFERED') } })
    await native(['--unregister-product-install'])
    journal.state = 'COMMITTED'; journal.events.push({ state: 'COMMITTED', at: new Date().toISOString() }); await operations.persist(journal)
    await operations.releaseSafety()
    process.stdout.write(jsonBytes({ result: 'UNINSTALLED', ...result }))
    return
  }
  const identities = await operations.initialize(mode === '--recover')
  const engine = new UpdateTransaction(operations)
  const result = mode === '--recover' ? await engine.recover() : await engine.run(identities.source, identities.target)
  if (!['COMMITTED', 'RESTORED', 'ABORTED'].includes(result.state)) throw new Error(result.errorCode ?? result.state)
  process.stdout.write(jsonBytes({ result: result.state, transactionId: result.id, providerRuns: 0, signingRuns: 0 }))
}
function currentVersion(value: string): string { if (!/^[0-9A-Za-z.-]{1,60}$/.test(value)) throw new Error('PRODUCT_VERSION_REJECTED'); return value }
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  void installerMain().catch(error => {
    const code = error instanceof Error && /^[A-Z0-9_]+(?::|$)/.test(error.message) ? error.message.split(':')[0] : 'INSTALLER_FAILED'
    process.stderr.write(String(code) + '\n'); process.exitCode = 1
  })
}
