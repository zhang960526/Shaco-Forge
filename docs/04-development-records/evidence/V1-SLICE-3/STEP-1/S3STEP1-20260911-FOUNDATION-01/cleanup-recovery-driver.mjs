import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, realpath, rm, rmdir, unlink, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01')
const startedAt = new Date().toISOString()
const summary = JSON.parse(await readFile(join(evidence, 'test-summary.json'), 'utf8'))
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const { inspectLocalPlatform } = await import('../apps/desktop/dist/main/lifecycle-client.js')
assert.equal((await inspectLocalPlatform(join(location.packagedRoot, 'native/ShacoForge.NativeCarrier.exe'))).mutexExists, false)
const ps = 'C:/Users/18902/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe'
const inspectScript = String.raw`$rows = @(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like 'D:\Project\Shaco-Forge\*ShacoForge.NativeCarrier.exe' -or $_.ExecutablePath -like 'D:\Project\Shaco-Forge\dist\packaging\*\Shaco Forge.exe' -or $_.ExecutablePath -like 'D:\Project\Shaco-Forge\dist\packaging\*\runtime\node.exe' -or $_.CommandLine -match 'Shaco-Forge[\\/]apps[\\/]worker[\\/]dist[\\/]index.js' } | Select-Object ProcessId,ParentProcessId,ExecutablePath); ConvertTo-Json -InputObject $rows -Compress`
const productProcesses = JSON.parse(execFileSync(ps, ['-NoProfile', '-Command', inspectScript], { encoding: 'utf8', windowsHide: true }))
assert.deepEqual(productProcesses, [])
const firstRuntime = Date.parse(summary.commands.find(row => row.command === 'smoke:worker').startedAt)
const remainingTemporaryRoots = []
for (const entry of await readdir(join(root, 'node_modules'), { withFileTypes: true })) {
  if (!/^\.(?:step1-(?:runtime|foundation|electron|overlap)|step2-runtime|review026-interactions|full-shaco-visual)-[A-Za-z0-9_-]{6}$/.test(entry.name)) continue
  const path = join(root, 'node_modules', entry.name)
  if ((await lstat(path)).birthtimeMs >= firstRuntime) remainingTemporaryRoots.push(path)
}
assert.deepEqual(remainingTemporaryRoots, [])
const archivedFinalElectronArtifacts = []
for (const [command, stem] of [['smoke:electron', 'electron-runtime'], ['smoke:failure', 'carrier-failure-runtime']]) {
  const row = summary.commands.filter(row => row.command === command).at(-1)
  const run = join(evidence, 'runs', command.replaceAll(':', '-') + '-' + row.attempt, 'step1')
  assert.deepEqual(JSON.parse(await readFile(join(run, stem + '.json'), 'utf8')), JSON.parse(await readFile(join(run, 'electron-regression.json'), 'utf8')))
  for (const ext of ['json', 'png']) {
    const path = join(run, stem + '.' + ext)
    archivedFinalElectronArtifacts.push({ path, sha256: createHash('sha256').update(await readFile(path)).digest('hex') })
    await assert.rejects(lstat(join(root, 'node_modules/.step1-electron-regression', stem + '.' + ext)), { code: 'ENOENT' })
  }
}
const failedInstallStore = join(root, '.pnpm-store')
assert.equal(await realpath(failedInstallStore), failedInstallStore)
assert.ok(failedInstallStore.startsWith(root + sep))
const install = summary.commands.find(row => row.command === 'install-packager')
const directoryInventory = []
const fileInventory = []
async function inspect(path) {
  assert.equal(await realpath(path), path)
  const stat = await lstat(path)
  assert.ok(!stat.isSymbolicLink())
  assert.ok(stat.birthtimeMs >= Date.parse(install.startedAt) && stat.birthtimeMs <= Date.parse(install.endedAt), path)
  if (stat.isDirectory()) {
    directoryInventory.push(path)
    for (const name of await readdir(path)) await inspect(join(path, name))
  } else {
    assert.ok(stat.isFile())
    fileInventory.push({ path, bytes: stat.size })
  }
}
await inspect(failedInstallStore)
assert.deepEqual(fileInventory.map(row => row.path), [join(failedInstallStore, 'v11/index.db')])
await rm(join(failedInstallStore, 'v11/files'), { recursive: true })
await unlink(join(failedInstallStore, 'v11/index.db'))
await rmdir(join(failedInstallStore, 'v11'))
await rmdir(failedInstallStore)
const retainedBuildOutputs = (await readdir(join(root, 'dist/packaging'), { withFileTypes: true })).filter(row => row.isDirectory()).map(row => join(root, 'dist/packaging', row.name))
const result = { command: 'node dist/recover-step1-cleanup.mjs', attempt: 2, startedAt, endedAt: new Date().toISOString(), exitCode: 0, result: 'PASS',
  noAuthority: true, productProcesses, tempCreationBoundary: new Date(firstRuntime).toISOString(), remainingTemporaryRoots,
  priorAttempt: 'cleanup-attempt-1.json', originalCleanupDriver: 'cleanup-attempt-1-driver.mjs',
  archivedFinalElectronArtifacts, removedFailedInstallStore: { path: failedInstallStore, directoryInventory, fileInventory },
  retainedBuildOutputs, retentionReason: 'Reviewable final package and failed/intermediate packaging diagnostics; not mutable user data',
  dedicatedCleanup: 'runs/smoke-packaged-runtime-2/cleanup.json', delayedFailedProbeCleanup: 'probe-4-recovery.json', providerRuns: 0, signingRuns: 0 }
await writeFile(join(evidence, 'final-cleanup.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify({ result: 'PASS', remainingTemporaryRoots: 0, removedStoreDirectories: directoryInventory.length, retainedBuildOutputs: retainedBuildOutputs.length }))
