import { DatabaseSync } from 'node:sqlite'
import { existsSync, lstatSync } from 'node:fs'
import { CONTROL_SCHEMA, NO_STORE, fail, transactionBlock } from '@shaco-forge/contracts/compatibility'

export type UpgradeState = 'IDLE' | 'CHECKING' | 'DRAINING' | 'BACKING_UP' | 'INSTALLING' | 'MIGRATING' | 'VALIDATING' | 'COMMITTED' | 'FAILED' | 'RESTORING' | 'RESTORED' | 'RESTORE_FAILED' | 'ABORTED'
export interface ReleaseControl { artifactDigest: string; releaseManifestDigest: string; productVersion: string; dshHome: string }
export interface BootstrapRoute { kind: 'FRESH_INSTALL' | 'STEP1_NO_STORE'; sourceSchema: string; target: ReleaseControl }
const digest = /^[a-f0-9]{64}$/
function validateRelease(value: ReleaseControl): void {
  if (!digest.test(value.artifactDigest) || !digest.test(value.releaseManifestDigest) || !value.productVersion || !value.dshHome) fail('PRODUCT_RELEASE_MISMATCH')
}
// A single database with DELETE journal + synchronous FULL makes a closed store
// a complete backup unit. No Harness business values are accepted by this API.
export class ControlStore {
  readonly db!: DatabaseSync
  constructor(readonly path: string, bootstrap?: BootstrapRoute) {
    const present = existsSync(path)
    if (present && (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink())) fail('CONTROL_SCHEMA_UNSUPPORTED')
    if (!present && (!bootstrap || bootstrap.sourceSchema !== NO_STORE
      || !['FRESH_INSTALL', 'STEP1_NO_STORE'].includes(bootstrap.kind))) fail('CONTROL_SCHEMA_UNSUPPORTED')
    try {
      this.db = new DatabaseSync(path, { enableForeignKeyConstraints: true, enableDoubleQuotedStringLiterals: false })
      this.db.exec('PRAGMA busy_timeout=5000; PRAGMA synchronous=FULL;')
      if (!present) this.bootstrap(bootstrap!)
      if (this.db.prepare('PRAGMA quick_check').get()?.quick_check !== 'ok') fail('CONTROL_SCHEMA_UNSUPPORTED')
      if (this.db.prepare('PRAGMA journal_mode').get()?.journal_mode !== 'delete') fail('CONTROL_SCHEMA_UNSUPPORTED')
      const v = this.db.prepare('PRAGMA user_version').get()?.user_version
      if (v !== Number(CONTROL_SCHEMA)) fail('CONTROL_SCHEMA_UNSUPPORTED')
      const tables = this.db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(row => row.name)
      if (JSON.stringify(tables) !== JSON.stringify(['release_control', 'schema_version', 'upgrade_events', 'upgrade_transaction'])) fail('CONTROL_SCHEMA_UNSUPPORTED')
      if (this.db.prepare('SELECT version FROM schema_version WHERE singleton=1').get()?.version !== v) fail('CONTROL_SCHEMA_UNSUPPORTED')
      const columns: Record<string, string[]> = {
        schema_version: ['singleton', 'version', 'source_schema'],
        release_control: ['singleton', 'artifact_digest', 'manifest_digest', 'product_version', 'dsh_home'],
        upgrade_transaction: ['singleton', 'transaction_id', 'state', 'source_digest', 'target_digest', 'backup_digest', 'error_code'],
        upgrade_events: ['sequence', 'transaction_id', 'state', 'at', 'error_code'],
      }
      for (const [table, expected] of Object.entries(columns)) {
        const actual = this.db.prepare('PRAGMA table_info(' + table + ')').all().map(row => row.name)
        if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('CONTROL_SCHEMA_UNSUPPORTED')
      }
      this.transaction(); this.release()
    } catch (error) {
      // An existing malformed store is never healed/recreated implicitly.
      try { this.db!.close() } catch {}
      if (error instanceof Error && error.message.startsWith('PRODUCT_RELEASE_MISMATCH')) throw error
      fail('CONTROL_SCHEMA_UNSUPPORTED')
    }
  }
  private bootstrap(route: BootstrapRoute): void {
    validateRelease(route.target)
    this.db.exec('PRAGMA journal_mode=DELETE; BEGIN IMMEDIATE;')
    try {
      this.db.exec(`CREATE TABLE schema_version(singleton INTEGER PRIMARY KEY CHECK(singleton=1), version INTEGER NOT NULL, source_schema TEXT NOT NULL);
        CREATE TABLE release_control(singleton INTEGER PRIMARY KEY CHECK(singleton=1), artifact_digest TEXT NOT NULL, manifest_digest TEXT NOT NULL, product_version TEXT NOT NULL, dsh_home TEXT NOT NULL);
        CREATE TABLE upgrade_transaction(singleton INTEGER PRIMARY KEY CHECK(singleton=1), transaction_id TEXT NOT NULL, state TEXT NOT NULL, source_digest TEXT NOT NULL, target_digest TEXT NOT NULL, backup_digest TEXT, error_code TEXT);
        CREATE TABLE upgrade_events(sequence INTEGER PRIMARY KEY, transaction_id TEXT NOT NULL, state TEXT NOT NULL, at TEXT NOT NULL, error_code TEXT);`)
      this.db.prepare('INSERT INTO schema_version VALUES(1, ?, ?)').run(Number(CONTROL_SCHEMA), route.sourceSchema)
      this.db.prepare('INSERT INTO release_control VALUES(1, ?, ?, ?, ?)').run(route.target.artifactDigest, route.target.releaseManifestDigest, route.target.productVersion, route.target.dshHome)
      this.db.prepare('INSERT INTO upgrade_transaction VALUES(1, ?, ?, ?, ?, NULL, NULL)').run('', 'IDLE', '', '')
      this.db.exec(`PRAGMA user_version=${Number(CONTROL_SCHEMA)}; COMMIT;`)
    } catch (error) { this.db.exec('ROLLBACK;'); throw error }
  }
  release(): ReleaseControl {
    const r = this.db.prepare('SELECT * FROM release_control WHERE singleton=1').get()
    if (!r) fail('CONTROL_SCHEMA_UNSUPPORTED')
    const value = { artifactDigest: String(r.artifact_digest), releaseManifestDigest: String(r.manifest_digest), productVersion: String(r.product_version), dshHome: String(r.dsh_home) }
    validateRelease(value); return value
  }
  transaction() { const row = this.db.prepare('SELECT * FROM upgrade_transaction WHERE singleton=1').get(); if (!row) fail('CONTROL_SCHEMA_UNSUPPORTED'); return row }
  assertReady(): void { const block = transactionBlock(this.transaction().state); if (block) fail(block) }
  events() { return this.db.prepare('SELECT * FROM upgrade_events ORDER BY sequence').all() }
  // Forward routes must be explicit and applied in one SQLite transaction. Schema
  // one is the first real schema; there are currently no invented older routes.
  migrate(target: number): void { if (target !== Number(CONTROL_SCHEMA)) fail('CONTROL_SCHEMA_UNSUPPORTED') }
  record(id: string, state: UpgradeState, source: string, target: string, errorCode: string | null = null, backupDigest: string | null = null, release?: ReleaseControl): void {
    if (!/^[0-9a-f-]{36}$/.test(id) || !digest.test(source) || !digest.test(target)
      || errorCode !== null && !/^[A-Z0-9_]{1,80}$/.test(errorCode) || backupDigest !== null && !digest.test(backupDigest)) throw new Error('CONTROL_METADATA_REJECTED')
    if (release) validateRelease(release)
    this.db.exec('BEGIN IMMEDIATE;')
    try {
      this.db.prepare('UPDATE upgrade_transaction SET transaction_id=?, state=?, source_digest=?, target_digest=?, backup_digest=COALESCE(?,backup_digest), error_code=? WHERE singleton=1').run(id, state, source, target, backupDigest, errorCode)
      this.db.prepare('INSERT INTO upgrade_events(transaction_id,state,at,error_code) VALUES(?,?,?,?)').run(id, state, new Date().toISOString(), errorCode)
      if (release) this.db.prepare('UPDATE release_control SET artifact_digest=?,manifest_digest=?,product_version=?,dsh_home=? WHERE singleton=1').run(release.artifactDigest, release.releaseManifestDigest, release.productVersion, release.dshHome)
      this.db.exec('COMMIT;')
    } catch (error) { this.db.exec('ROLLBACK;'); throw error }
  }
  close(): void { this.db.close() }
}
