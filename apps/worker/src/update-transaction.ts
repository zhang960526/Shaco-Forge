import { randomUUID } from 'node:crypto'
import type { UpgradeState, ReleaseControl } from './control-store.js'

export interface TransactionRecord {
  id: string; state: UpgradeState; source: ReleaseControl; target: ReleaseControl
  installed: boolean; backupDigest?: string; errorCode?: string; runtimeDacl?: string
  events: Array<{ state: UpgradeState; at: string; errorCode?: string }>
}
export interface UpdateOperations {
  readJournal(): Promise<TransactionRecord | undefined>
  // Must atomically publish and flush in the protected Shaco control directory.
  persist(record: TransactionRecord): Promise<void>
  check(source: ReleaseControl, target: ReleaseControl): Promise<void>
  prepareDrain?(): Promise<{ runtimeDacl: string }>
  establishSourceFence?(): Promise<void>
  releaseSafety?(): Promise<void>
  cancelBeforeInstall?(): Promise<void>
  drain(): Promise<void>
  backup(id: string): Promise<string>
  verifyBackup(id: string, digest: string): Promise<void>
  assertQuiescent(): Promise<void>
  install(): Promise<void>
  migrate(): Promise<void>
  validate(target: ReleaseControl): Promise<void>
  commit(target: ReleaseControl): Promise<void>
  stopNewRuntime(): Promise<void>
  restoreRuntimeAndData(id: string, digest: string): Promise<void>
  validateRestore(source: ReleaseControl): Promise<void>
}
const next: Record<UpgradeState, UpgradeState[]> = {
  IDLE: ['CHECKING'], CHECKING: ['DRAINING', 'FAILED', 'ABORTED'], DRAINING: ['BACKING_UP', 'FAILED', 'ABORTED'],
  BACKING_UP: ['INSTALLING', 'FAILED', 'ABORTED'], INSTALLING: ['MIGRATING', 'FAILED'], MIGRATING: ['VALIDATING', 'FAILED'],
  VALIDATING: ['COMMITTED', 'FAILED'], COMMITTED: [], FAILED: ['RESTORING', 'ABORTED'], RESTORING: ['RESTORED', 'RESTORE_FAILED'], RESTORED: [], RESTORE_FAILED: [], ABORTED: [],
}
function code(error: unknown): string {
  const text = error instanceof Error ? error.message.split(':')[0]! : ''
  return /^[A-Z0-9_]{1,80}$/.test(text) ? text : 'UPDATE_OPERATION_FAILED'
}
// Dependencies are Product-owned operations, not a runtime flag disabling policy.
// Tests inject isolated adapters directly; installer entry constructs only its
// signature-verifying production adapter and exposes no unsigned option.
export class UpdateTransaction {
  #record!: TransactionRecord
  constructor(readonly operations: UpdateOperations) {}
  private async transition(state: UpgradeState, errorCode?: string): Promise<void> {
    if (state === 'ABORTED' && this.#record.installed) throw new Error('POST_INSTALL_ABORT_FORBIDDEN')
    if (!next[this.#record.state].includes(state)) throw new Error('UPDATE_TRANSITION_REJECTED')
    const value = structuredClone(this.#record)
    value.state = state
    if (state === 'INSTALLING') value.installed = true
    if (errorCode) value.errorCode = errorCode
    value.events.push({ state, at: new Date().toISOString(), ...(errorCode ? { errorCode } : {}) })
    await this.operations.persist(value)
    this.#record = value
  }
  async run(source: ReleaseControl, target: ReleaseControl, cancelled: () => boolean = () => false): Promise<TransactionRecord> {
    const prior = await this.operations.readJournal()
    if (prior && !['IDLE', 'COMMITTED', 'RESTORED', 'ABORTED'].includes(prior.state)) throw new Error('RESTORE_REQUIRED')
    this.#record = { id: randomUUID(), state: 'IDLE', source, target, installed: false, events: [] }
    await this.transition('CHECKING')
    try {
      await this.operations.check(source, target)
      if (cancelled()) { await this.transition('ABORTED'); await this.operations.releaseSafety?.(); return this.#record }
      if (this.operations.prepareDrain) {
        Object.assign(this.#record, await this.operations.prepareDrain())
        // The legacy source does not understand this journal. Persist its ACL
        // restoration metadata, then fence launch and prove it stopped before
        // publishing DRAINING as an authority that rejects new mutations.
        await this.operations.persist(structuredClone(this.#record))
        await this.operations.establishSourceFence?.()
      }
      await this.transition('DRAINING')
      await this.operations.drain()
      await this.transition('BACKING_UP')
      await this.operations.assertQuiescent()
      this.#record.backupDigest = await this.operations.backup(this.#record.id)
      await this.operations.verifyBackup(this.#record.id, this.#record.backupDigest)
      await this.operations.assertQuiescent()
      if (cancelled()) { await this.transition('ABORTED'); await this.operations.releaseSafety?.(); return this.#record }
      // Persist INSTALLING before the first install byte can be changed.
      await this.transition('INSTALLING')
      await this.operations.install()
      await this.transition('MIGRATING')
      await this.operations.migrate()
      await this.transition('VALIDATING')
      await this.operations.validate(target)
      await this.operations.commit(target)
      await this.transition('COMMITTED')
    } catch (error) {
      if (this.#record.state === 'ABORTED') throw error // Preserve durable cancellation if safety release needs retry.
      await this.transition('FAILED', code(error))
      if (this.#record.installed) await this.restore()
      // A pre-install failure stays fail-closed until explicit recovery; it is
      // never mislabeled ABORTED and never invokes an unverified data backup.
    }
    return structuredClone(this.#record)
  }
  async recover(): Promise<TransactionRecord> {
    const prior = await this.operations.readJournal()
    if (!prior) throw new Error('NO_UPDATE_TRANSACTION')
    this.#record = prior
    if (['IDLE', 'COMMITTED', 'RESTORED', 'ABORTED'].includes(prior.state)) {
      if (prior.state === 'RESTORED' || prior.state === 'ABORTED') await this.operations.releaseSafety?.()
      return prior
    }
    if (!prior.installed) {
      if (!this.operations.cancelBeforeInstall) throw new Error('UPGRADE_IN_PROGRESS: pre-install inspection required')
      await this.operations.cancelBeforeInstall()
      if (prior.state !== 'FAILED') await this.transition('FAILED', 'INTERRUPTED_PRE_INSTALL')
      await this.transition('ABORTED')
      await this.operations.releaseSafety?.()
      return structuredClone(this.#record)
    }
    if (prior.state === 'RESTORE_FAILED') throw new Error('RESTORE_REQUIRED: recovery failed')
    if (prior.state !== 'RESTORING') {
      if (prior.state !== 'FAILED') await this.transition('FAILED', 'INTERRUPTED_UPDATE')
    }
    await this.restore()
    return structuredClone(this.#record)
  }
  private async restore(): Promise<void> {
    if (this.#record.state !== 'RESTORING') await this.transition('RESTORING')
    try {
      if (!this.#record.backupDigest) throw new Error('BACKUP_IDENTITY_MISSING')
      await this.operations.stopNewRuntime()
      await this.operations.verifyBackup(this.#record.id, this.#record.backupDigest)
      await this.operations.restoreRuntimeAndData(this.#record.id, this.#record.backupDigest)
      await this.operations.validateRestore(this.#record.source)
    } catch (error) { await this.transition('RESTORE_FAILED', code(error)); return }
    // Publish the completed pair before releasing its persistent execution fence.
    // A crash after this point must only retry release, never overwrite data again.
    await this.transition('RESTORED')
    await this.operations.releaseSafety?.()
  }
}
