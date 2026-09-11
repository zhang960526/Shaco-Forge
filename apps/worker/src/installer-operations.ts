import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, lstat, mkdir, readFile, readdir, rmdir, unlink } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { NO_STORE, STEP1_ARTIFACT, assertCompatibility, sixIdentities } from '@shaco-forge/contracts/compatibility'
import { hashFile, jsonBytes, verifyPackagedRuntime, type ReleaseManifest, RELEASE_LAYOUT } from '@shaco-forge/contracts/packaged-runtime'
import { ControlStore, type ReleaseControl } from './control-store.js'
import { assertCanonical, VerifiedBackup } from './durable-files.js'
import { verifyAuthenticode, type SignerPolicy } from './signature-verification.js'
import type { TransactionRecord, UpdateOperations } from './update-transaction.js'

export interface InstallerBoundary {
  protect(path: string): Promise<void>
  verifyAcl(path: string): Promise<void>
  publishJournal(record: TransactionRecord): Promise<void>
  fence(operation: 'capture' | 'apply' | 'verify' | 'release' | 'processes' | 'close-desktop', dacl?: string): Promise<{ dacl?: string; processCount?: number }>
  register(target: ReleaseControl): Promise<void>
  assertRegistrationClear(): Promise<void>
  rollbackRegistration(): Promise<void>
  validationEntry?(runtime: string): Promise<string>
}
export interface InstallerPaths { payload: string; runtime: string; dsh: string; control: string; backup: string }
interface Authority { workerInstanceId: string; worker: { pid: number }; host: { pid: number }; helper: { pid: number }; workerRuntime: { executable: string }; compatibility?: unknown }
interface Lifecycle {
  inspectLocalPlatform(helper: string): Promise<{ mutexExists: boolean; lifecycleBusy: boolean }>
  lifecycleRequest(helper: string, type: string, workerId?: string, extra?: Record<string, unknown>): Promise<{ response: { type?: string }; status?: Authority; socket: { destroy(): void } }>
}
const delay = (ms: number) => new Promise<void>(done => setTimeout(done, ms))

// Product-owned file transaction, sharing the existing lifecycle implementation.
// Production entry alone resolves known folders and constructs its OS boundary.
export class InstallerOperations implements UpdateOperations {
  #journal: TransactionRecord | undefined
  #release!: ReleaseManifest
  #source!: ReleaseControl
  #lifecycle!: Lifecycle
  #sourceAbsent = false
  readonly backups: VerifiedBackup
  constructor(readonly paths: InstallerPaths, readonly boundary: InstallerBoundary,
    readonly signature: { installer: string; digest: string; policy: SignerPolicy; nativeHelper: string }) {
    this.backups = new VerifiedBackup(paths.backup, { ...boundary, assertQuiescent: () => this.assertQuiescent() })
  }
  private helper(): string { return join(this.paths.payload, RELEASE_LAYOUT.nativeHelper) }
  async readJournal(): Promise<TransactionRecord | undefined> {
    const path = join(this.paths.control, 'upgrade-journal.json')
    if (!existsSync(path)) return undefined
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink() || info.size > 262144) throw new Error('RESTORE_REQUIRED')
    const record = JSON.parse(await readFile(path, 'utf8')) as TransactionRecord
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(record.id) || !record.source || !record.target || !Array.isArray(record.events)
      || typeof record.installed !== 'boolean' || !['IDLE', 'CHECKING', 'DRAINING', 'BACKING_UP', 'INSTALLING', 'MIGRATING', 'VALIDATING', 'COMMITTED', 'FAILED', 'RESTORING', 'RESTORED', 'RESTORE_FAILED', 'ABORTED'].includes(record.state)
      || [record.source, record.target].some(value => !/^[a-f0-9]{64}$/.test(value.artifactDigest) || !/^[a-f0-9]{64}$/.test(value.releaseManifestDigest) || value.dshHome !== this.paths.dsh)) throw new Error('RESTORE_REQUIRED')
    this.#journal = record
    return record
  }
  async persist(record: TransactionRecord): Promise<void> {
    await this.boundary.publishJournal(record)
    this.#journal = structuredClone(record)
  }
  async initialize(recovery = false): Promise<{ source: ReleaseControl; target: ReleaseControl }> {
    // Verify signature before even creating a transaction in Product Data Root.
    await verifyAuthenticode(this.signature.installer, this.signature.digest, this.signature.policy, this.signature.nativeHelper)
    this.#release = await verifyPackagedRuntime(this.paths.payload)
    this.#lifecycle = await import(pathToFileURL(join(this.paths.payload, 'resources/app/desktop/dist/main/lifecycle-client.js')).href) as Lifecycle
    const identity = JSON.parse(await readFile(join(this.paths.payload, 'artifact-identity.json'), 'utf8')) as { digest: string; releaseManifestSha256: string }
    const target = { artifactDigest: identity.digest, releaseManifestDigest: identity.releaseManifestSha256, productVersion: this.#release.ProductVersion, dshHome: this.paths.dsh }
    if (recovery) {
      const prior = await this.readJournal()
      if (!prior || prior.target.artifactDigest !== target.artifactDigest) throw new Error('RESTORE_REQUIRED')
      this.#source = prior.source
      this.#sourceAbsent = prior.source.artifactDigest === '0'.repeat(64)
      return { source: prior.source, target }
    }
    this.#sourceAbsent = !existsSync(this.paths.runtime)
    if (this.#sourceAbsent) {
      if (existsSync(this.paths.dsh) || existsSync(join(this.paths.control, 'state.sqlite'))) throw new Error('UNKNOWN_EXISTING_DURABLE_UNIVERSE')
      this.#source = { ...target, artifactDigest: '0'.repeat(64), releaseManifestDigest: '0'.repeat(64) }
    } else {
      const sourceRelease = await verifyPackagedRuntime(this.paths.runtime)
      const old = JSON.parse(await readFile(join(this.paths.runtime, 'artifact-identity.json'), 'utf8')) as { digest: string; releaseManifestSha256: string }
      if (old.digest !== STEP1_ARTIFACT || sourceRelease.ControlStoreSchemaVersion !== NO_STORE) throw new Error('UNSUPPORTED_SOURCE_RELEASE_ROUTE')
      if (existsSync(join(this.paths.control, 'state.sqlite'))) throw new Error('CONTROL_SCHEMA_UNSUPPORTED')
      this.#source = { artifactDigest: old.digest, releaseManifestDigest: old.releaseManifestSha256, productVersion: sourceRelease.ProductVersion, dshHome: this.paths.dsh }
    }
    await this.boundary.assertRegistrationClear()
    await this.boundary.protect(this.paths.control)
    return { source: this.#source, target }
  }
  async check(source: ReleaseControl, target: ReleaseControl): Promise<void> {
    if (JSON.stringify(source) !== JSON.stringify(this.#source)) throw new Error('SOURCE_IDENTITY_MISMATCH')
    await verifyAuthenticode(this.signature.installer, this.signature.digest, this.signature.policy, this.signature.nativeHelper)
    const release = await verifyPackagedRuntime(this.paths.payload)
    assertCompatibility(release, sixIdentities(release), { dshHome: target.dshHome, attestedDshHome: this.paths.dsh, transactionState: 'IDLE', integrity: true })
    if (this.#sourceAbsent) {
      await this.boundary.protect(this.paths.runtime)
      await this.boundary.protect(this.paths.dsh)
    } else if (await hashFile(join(this.paths.runtime, 'release-manifest.json')) !== source.releaseManifestDigest) throw new Error('SOURCE_IDENTITY_MISMATCH')
  }
  async prepareDrain(): Promise<{ runtimeDacl: string }> {
    const result = await this.boundary.fence('capture')
    if (!result.dacl) throw new Error('RUNTIME_FENCE_METADATA_MISSING')
    return { runtimeDacl: result.dacl }
  }
  async establishSourceFence(): Promise<void> { await this.drain() }
  async releaseSafety(): Promise<void> {
    if (this.#journal?.runtimeDacl && existsSync(this.paths.runtime)) await this.boundary.fence('release', this.#journal.runtimeDacl)
    if (this.#sourceAbsent && this.#journal && ['RESTORED', 'ABORTED'].includes(this.#journal.state)) {
      for (const path of [this.paths.runtime, this.paths.dsh]) if (existsSync(path)) {
        await assertCanonical(path)
        if ((await readdir(path)).length !== 0) throw new Error('FRESH_RESTORE_CLEANUP_REJECTED')
        await rmdir(path)
      }
    }
  }
  async cancelBeforeInstall(): Promise<void> {
    if (!this.#journal || this.#journal.installed) throw new Error('PRE_INSTALL_CANCEL_REJECTED')
    if (!this.#sourceAbsent && await hashFile(join(this.paths.runtime, 'release-manifest.json')) !== this.#source.releaseManifestDigest) throw new Error('SOURCE_IDENTITY_MISMATCH')
    if (!this.#sourceAbsent) await verifyPackagedRuntime(this.paths.runtime)
  }
  async drain(): Promise<void> {
    if (!this.#journal?.runtimeDacl) throw new Error('RUNTIME_FENCE_METADATA_MISSING')
    await this.boundary.fence('apply')
    await this.boundary.fence('close-desktop')
    const platform = await this.#lifecycle.inspectLocalPlatform(this.helper())
    if (!platform.mutexExists && !platform.lifecycleBusy) {
      const deadline = Date.now() + 30_000
      while (Date.now() < deadline) {
        if ((await this.boundary.fence('processes')).processCount === 0) return
        await delay(100)
      }
      throw new Error('DRAIN_DESKTOP_TIMEOUT')
    }
    const { status, socket } = await this.#lifecycle.lifecycleRequest(this.helper(), 'discover')
    socket.destroy()
    if (!status || resolve(status.workerRuntime.executable) !== join(this.paths.runtime, RELEASE_LAYOUT.node)) throw new Error('DRAIN_FOREIGN_AUTHORITY')
    // Frozen Step1 has no quiescence handshake. Never interpret DETACHED, process
    // termination or zero recent frames as proof of settled background work.
    if (!status.compatibility) throw new Error('DRAIN_SOURCE_WORKER_MUST_ALREADY_BE_STOPPED')
    await this.drainAuthority(status)
  }
  private async drainAuthority(status: Authority): Promise<void> {
    if (!this.#journal) throw new Error('TRANSACTION_AUTHORITY_MISSING')
    const reply = await this.#lifecycle.lifecycleRequest(this.helper(), 'upgrade-drain', status.workerInstanceId, { transactionId: this.#journal.id })
    reply.socket.destroy()
    if (reply.response.type !== 'draining') throw new Error('DRAIN_REJECTED')
    const deadline = Date.now() + 40_000
    while (Date.now() < deadline) {
      const gone = [status.worker.pid, status.host.pid, status.helper.pid].every(pid => { try { process.kill(pid, 0); return false } catch { return true } })
      if (gone) {
        const receipt = JSON.parse(await readFile(join(this.paths.control, 'drain-receipt.json'), 'utf8')) as { transactionId: string; workerInstanceId: string; hostExitCode: number; hostGone: boolean }
        if (receipt.transactionId !== this.#journal.id || receipt.workerInstanceId !== status.workerInstanceId || receipt.hostExitCode !== 0 || !receipt.hostGone) throw new Error('DRAIN_RECEIPT_REJECTED')
        await this.assertQuiescent(); return
      }
      await delay(100)
    }
    throw new Error('DRAIN_TIMEOUT')
  }
  async assertQuiescent(): Promise<void> {
    const platform = await this.#lifecycle.inspectLocalPlatform(this.helper())
    if (platform.mutexExists || platform.lifecycleBusy || (await this.boundary.fence('processes')).processCount !== 0) throw new Error('WORKER_NOT_QUIESCENT')
  }
  private async approvedLinks(): Promise<Map<string, string>> {
    // References from the exact Step1 profile are expected release-bound links.
    // All other reparse points are rejected by durableInventory.
    const links = new Map<string, string>()
    if (this.#sourceAbsent) return links
    const { realpath } = await import('node:fs/promises')
    const profile = 'profiles/shaco-forge'
    if (existsSync(join(this.paths.dsh, profile))) links.set(profile, join(this.paths.runtime, RELEASE_LAYOUT.profile))
    const modules = join(this.paths.dsh, 'profiles/node_modules')
    if (existsSync(modules)) {
      if ((await lstat(modules)).isSymbolicLink()) throw new Error('UNEXPECTED_PROFILE_MODULE_REFERENCE')
      const add = async (name: string) => {
        const path = `profiles/node_modules/${name}`, file = join(this.paths.dsh, path)
        const target = await realpath(file), expected = await realpath(join(this.paths.runtime, 'harness/node_modules', name))
        if (!(await lstat(file)).isSymbolicLink() || target !== expected || !target.startsWith(join(this.paths.runtime, 'harness/node_modules') + '\\')) throw new Error('UNEXPECTED_PROFILE_MODULE_REFERENCE')
        links.set(path, target)
      }
      for (const scope of await readdir(modules)) {
        if (!scope.startsWith('@')) { await add(scope); continue }
        if ((await lstat(join(modules, scope))).isSymbolicLink()) throw new Error('UNEXPECTED_PROFILE_MODULE_REFERENCE')
        for (const name of await readdir(join(modules, scope))) await add(`${scope}/${name}`)
      }
    }
    return links
  }
  async backup(id: string): Promise<string> {
    if (!this.#sourceAbsent) {
      await verifyPackagedRuntime(this.paths.runtime)
      const identity = JSON.parse(await readFile(join(this.paths.runtime, 'artifact-identity.json'), 'utf8')) as { digest: string }
      if (identity.digest !== this.#source.artifactDigest) throw new Error('SOURCE_IDENTITY_MISMATCH')
    }
    return this.backups.create(id, this.#source.artifactDigest, { dsh: this.paths.dsh, controlStore: join(this.paths.control, 'state.sqlite'), runtime: this.paths.runtime }, await this.approvedLinks())
  }
  async verifyBackup(id: string, digest: string): Promise<void> {
    const manifest = await this.backups.verify(id, digest)
    if (manifest.sourceArtifact !== this.#source.artifactDigest) throw new Error('BACKUP_SOURCE_IDENTITY_MISMATCH')
  }
  async install(): Promise<void> {
    await this.assertQuiescent()
    await assertCanonical(this.paths.runtime)
    await this.boundary.fence('verify')
    // Source inventory verification ensures this directory contains only the
    // release being replaced. Removal is bounded to its manifest-owned bytes.
    if (!this.#sourceAbsent) {
      await verifyPackagedRuntime(this.paths.runtime)
      const { durableInventory } = await import('./durable-files.js')
      for (const entry of (await durableInventory(this.paths.runtime)).reverse()) if (entry.kind === 'file') await unlink(join(this.paths.runtime, entry.path))
    }
    await cp(this.paths.payload, this.paths.runtime, { recursive: true, dereference: false, errorOnExist: true, force: false })
    await verifyPackagedRuntime(this.paths.runtime)
    // Every old executable is gone; target startup now reads the durable journal.
    await this.releaseSafety()
  }
  async migrate(): Promise<void> {
    if (!this.#journal) throw new Error('TRANSACTION_AUTHORITY_MISSING')
    const store = new ControlStore(join(this.paths.control, 'state.sqlite'), { kind: this.#sourceAbsent ? 'FRESH_INSTALL' : 'STEP1_NO_STORE', sourceSchema: NO_STORE, target: this.#journal.target })
    try { store.migrate(1); store.record(this.#journal.id, 'VALIDATING', this.#journal.source.artifactDigest, this.#journal.target.artifactDigest) } finally { store.close() }
  }
  async validate(target: ReleaseControl): Promise<void> {
    const release = await verifyPackagedRuntime(this.paths.runtime)
    const identity = JSON.parse(await readFile(join(this.paths.runtime, 'artifact-identity.json'), 'utf8')) as { digest: string }
    if (identity.digest !== target.artifactDigest) throw new Error('TARGET_ARTIFACT_MISMATCH')
    assertCompatibility(release, sixIdentities(release), { dshHome: target.dshHome, attestedDshHome: this.paths.dsh, transactionState: 'IDLE', integrity: true })
    const entry = this.boundary.validationEntry ? await this.boundary.validationEntry(this.paths.runtime) : join(this.paths.runtime, RELEASE_LAYOUT.workerEntry)
    const child = spawn(join(this.paths.runtime, RELEASE_LAYOUT.node), [entry, '--validate-upgrade'], {
      env: {}, cwd: this.paths.runtime, windowsHide: true, stdio: 'ignore', detached: true,
    })
    let failed = false; child.once('error', () => { failed = true }); child.unref()
    const deadline = Date.now() + 100_000
    while (Date.now() < deadline) {
      if (failed || child.exitCode !== null) throw new Error('VALIDATION_WORKER_START_FAILED')
      let discovered: Authority | undefined
      try {
        const reply = await this.#lifecycle.lifecycleRequest(this.helper(), 'discover'); reply.socket.destroy(); discovered = reply.status
      } catch (error) {
        if (!(error instanceof Error) || !['WORKER_NOT_FOUND', 'AUTHORITY_AMBIGUOUS_FAIL_CLOSED', 'BUSY', 'AUTHORITY_IDENTITY_OR_HEALTH_REJECTED', 'WORKER_AUTHORITY_FAILURE'].includes(error.message)) throw error
      }
      if (discovered && discovered.worker.pid === child.pid && discovered.workerRuntime.executable === join(this.paths.runtime, RELEASE_LAYOUT.node)) {
        await this.drainAuthority(discovered); return
      }
      await delay(200)
    }
    throw new Error('VALIDATION_WORKER_TIMEOUT')
  }
  async commit(target: ReleaseControl): Promise<void> {
    await this.boundary.register(target)
    const store = new ControlStore(join(this.paths.control, 'state.sqlite'))
    try { store.record(this.#journal!.id, 'COMMITTED', this.#journal!.source.artifactDigest, target.artifactDigest, null, this.#journal!.backupDigest, target) } finally { store.close() }
  }
  async stopNewRuntime(): Promise<void> {
    const platform = await this.#lifecycle.inspectLocalPlatform(this.helper())
    if (!platform.mutexExists && !platform.lifecycleBusy) return
    const { status, socket } = await this.#lifecycle.lifecycleRequest(this.helper(), 'discover'); socket.destroy()
    if (!status || status.workerRuntime.executable !== join(this.paths.runtime, RELEASE_LAYOUT.node)) throw new Error('RESTORE_FOREIGN_AUTHORITY')
    await this.drainAuthority(status)
  }
  async restoreRuntimeAndData(id: string, digest: string): Promise<void> {
    await this.boundary.rollbackRegistration()
    await this.boundary.fence('apply')
    const backup = await this.backups.verify(id, digest)
    const sourceFiles = backup.scopes.find(scope => scope.name === 'runtime')!.entries.filter(row => row.kind === 'file').map(row => row.path)
    const targetFiles = (JSON.parse(await readFile(join(this.paths.payload, 'packaged-files.json'), 'utf8')) as { files: Array<{ path: string }> }).files.map(row => row.path)
    const owned = new Set([...sourceFiles, ...targetFiles, 'artifact-identity.json', 'packaged-files.json'])
    const { durableInventory } = await import('./durable-files.js')
    for (const entry of await durableInventory(this.paths.runtime)) if (entry.kind === 'file' && !owned.has(entry.path)) throw new Error('RESTORE_UNOWNED_INSTALL_ENTRY')
    await this.backups.restore(id, digest, { dsh: this.paths.dsh, controlStore: join(this.paths.control, 'state.sqlite'), runtime: this.paths.runtime })
  }
  async validateRestore(source: ReleaseControl): Promise<void> {
    await this.assertQuiescent()
    if (source.artifactDigest === '0'.repeat(64)) {
      if ((await readdir(this.paths.runtime)).length !== 0 || (await readdir(this.paths.dsh)).length !== 0 || existsSync(join(this.paths.control, 'state.sqlite'))) throw new Error('FRESH_INSTALL_RESTORE_FAILED')
      return
    }
    const release = await verifyPackagedRuntime(this.paths.runtime)
    const identity = JSON.parse(await readFile(join(this.paths.runtime, 'artifact-identity.json'), 'utf8')) as { digest: string }
    if (identity.digest !== source.artifactDigest || release.ControlStoreSchemaVersion !== NO_STORE || release.ProductVersion !== source.productVersion || source.dshHome !== this.paths.dsh) throw new Error('RESTORE_IDENTITY_MISMATCH')
  }
}
