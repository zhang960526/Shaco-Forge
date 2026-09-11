import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { declaration, sixIdentities, assertCompatibility, MISMATCH_ACTIONS, NO_STORE, STEP1_ARTIFACT, transactionBlock } from '../packages/contracts/dist/compatibility.js'
import { HARNESS_COMMIT, CONTRACT_SHA256, RELEASE_LAYOUT, hashFile } from '../packages/contracts/dist/packaged-runtime.js'
import { ControlStore } from '../apps/worker/dist/control-store.js'
import { UpdateTransaction } from '../apps/worker/dist/update-transaction.js'
import { VerifiedBackup } from '../apps/worker/dist/durable-files.js'
import { uninstall, readUninstallInventory } from '../apps/worker/dist/uninstall.js'
import { acceptSignature } from '../apps/worker/dist/signature-verification.js'
import { assertControlReady, assertPackagedControl } from '../apps/worker/dist/control-preflight.js'
import { drainHarness } from '../apps/worker/host-profile/upgrade-drain.mjs'

const testRoot = resolve('dist/slice3-step2-isolated-tests')
await mkdir(testRoot, { recursive: true })
const target = { artifactDigest: 'a'.repeat(64), releaseManifestDigest: 'b'.repeat(64), productVersion: '1.0.0-dev.1', dshHome: 'C:\\isolated-shaco-test\\dsh' }
const source = { ...target, artifactDigest: STEP1_ARTIFACT }
const manifest = { ...sixIdentities({ ProductVersion: target.productVersion, DesktopVersion: target.productVersion, WorkerVersion: target.productVersion, CarrierVersion: 1, HarnessBaselineVersion: '0.1.2-alpha.1', ControlStoreSchemaVersion: '1' }),
  HarnessCommit: HARNESS_COMMIT, HarnessPackage: '@deepseek-ai/dsh@0.1.2-alpha.1', FrozenContractIdentity: CONTRACT_SHA256, layout: RELEASE_LAYOUT, Compatibility: declaration(target.productVersion, STEP1_ARTIFACT) }
const context = () => ({ dshHome: target.dshHome, attestedDshHome: target.dshHome, transactionState: 'IDLE', integrity: true })

test('six identities; positive compatibility admits exactly the explicit tuple', () => {
  assert.equal(Object.keys(sixIdentities(manifest)).length, 6)
  assertCompatibility(manifest, sixIdentities(manifest), context())
})
const mismatches = {
  PRODUCT_RELEASE_MISMATCH: (m, i) => { i.ProductVersion = 'unknown' },
  DESKTOP_TOO_OLD: (m, i) => { i.DesktopVersion = '0.9.0' },
  WORKER_TOO_OLD: (m, i) => { i.WorkerVersion = '0.9.0' },
  WORKER_TOO_NEW: (m, i) => { i.WorkerVersion = '2.0.0' },
  DESKTOP_WORKER_MISMATCH: (m, i) => { i.DesktopVersion = '1.0.0-unlisted' },
  CARRIER_UNSUPPORTED: (m, i) => { i.CarrierVersion = 2 },
  HARNESS_BASELINE_MISMATCH: m => { m.HarnessCommit = '0'.repeat(40) },
  CONTROL_SCHEMA_UNSUPPORTED: (m, i) => { i.ControlStoreSchemaVersion = '2' },
  DSH_HOME_MISMATCH: (m, i, c) => { c.dshHome = 'C:\\other-home' },
  UPGRADE_IN_PROGRESS: (m, i, c) => { c.transactionState = 'DRAINING' },
  RESTORE_REQUIRED: (m, i, c) => { c.transactionState = 'INSTALLING' },
  RELEASE_INTEGRITY_FAILURE: (m, i, c) => { c.integrity = false },
}
for (const [code, change] of Object.entries(mismatches)) test(`compatibility ${code}: no credential, no Harness write, no fallback`, () => {
  const m = structuredClone(manifest), i = sixIdentities(m), c = context()
  change(m, i, c)
  let credentials = 0, harnessWrites = 0, fallback = 0
  assert.throws(() => { assertCompatibility(m, i, c); credentials++; harnessWrites++ }, error => error.code === code && error.message.includes(MISMATCH_ACTIONS[code]))
  assert.deepEqual({ credentials, harnessWrites, fallback }, { credentials: 0, harnessWrites: 0, fallback: 0 })
})
test('unknown/missing identities and unlisted tuples all refuse before writes', () => {
  assert.throws(() => assertCompatibility(manifest, { ...sixIdentities(manifest), SeventhIdentity: 'forbidden' }, context()))
  for (const key of Object.keys(sixIdentities(manifest))) for (const value of [undefined, null, '', {}, 'unknown']) {
    assert.throws(() => assertCompatibility(manifest, { ...sixIdentities(manifest), [key]: value }, context()))
  }
  assert.throws(() => assertCompatibility({ ...manifest, Compatibility: { ...manifest.Compatibility, allowedTuples: [] } }, sixIdentities(manifest), context()))
})

test('actual SQLite/journal preflight rejects incomplete state and identity before creating Harness data', async () => {
  const root = await mkdtemp(join(testRoot, 'preflight-')), control = join(root, 'control'), dsh = join(root, 'dsh')
  await mkdir(control)
  const current = { ...target, dshHome: dsh }
  const store = new ControlStore(join(control, 'state.sqlite'), { kind: 'FRESH_INSTALL', sourceSchema: NO_STORE, target: current }); store.close()
  await writeFile(join(root, 'artifact-identity.json'), JSON.stringify({ digest: target.artifactDigest, releaseManifestSha256: target.releaseManifestDigest }), 'utf8')
  assertPackagedControl(root, manifest, control, dsh)
  for (const state of ['CHECKING', 'DRAINING', 'BACKING_UP', 'INSTALLING', 'MIGRATING', 'VALIDATING', 'FAILED', 'RESTORING', 'RESTORE_FAILED', 'unknown']) {
    await writeFile(join(control, 'upgrade-journal.json'), JSON.stringify({ state }), 'utf8')
    assert.throws(() => assertPackagedControl(root, manifest, control, dsh), new RegExp(transactionBlock(state)))
    assert.deepEqual(await readdir(root), ['artifact-identity.json', 'control'])
  }
  await rm(join(control, 'upgrade-journal.json'))
  assert.throws(() => assertControlReady(control, manifest, dsh + '-other'), /DSH_HOME_MISMATCH/)
  await writeFile(join(root, 'artifact-identity.json'), JSON.stringify({ digest: '0'.repeat(64) }), 'utf8')
  assert.throws(() => assertPackagedControl(root, manifest, control, dsh), /PRODUCT_RELEASE_MISMATCH/)
  assert.deepEqual(await readdir(root), ['artifact-identity.json', 'control'])
})

test('drain waits for inflight work, all public agents idle and successful session flush; timeout fails closed', async () => {
  const pending = new Set(['inflight']), calls = []
  const agent = { status: 'idle', whenIdle: async () => { calls.push('idle') } }
  const ctx = { agents: { list: () => [agent] }, sessions: { list: () => ['reference'], flush: async () => { calls.push('flush'); return true } } }
  const draining = drainHarness(ctx, pending, 1000)
  await new Promise(done => setTimeout(done, 20)); assert.deepEqual(calls, [])
  pending.clear(); assert.equal((await draining).flushedSessions, 1); assert.deepEqual(calls, ['idle', 'flush'])
  await assert.rejects(drainHarness(ctx, new Set(['stuck']), 20), /DRAIN_TIMEOUT/)
  ctx.sessions.flush = async () => false
  await assert.rejects(drainHarness(ctx, new Set(), 1000), /DRAIN_DURABILITY_UNPROVEN/)
})

test('backup rejects actual capacity exhaustion, late durable writes and lost Worker quiescence', async () => {
  for (const fault of ['disk-full', 'late-write', 'worker-crash']) {
    const root = await mkdtemp(join(testRoot, fault + '-'))
    const paths = { dsh: join(root, 'dsh'), runtime: join(root, 'runtime'), controlStore: join(root, 'control/state.sqlite') }
    for (const p of [paths.dsh, paths.runtime, join(root, 'control')]) await mkdir(p)
    await writeFile(join(paths.dsh, 'durable.bin'), 'original', 'utf8')
    let quiescenceChecks = 0
    const backup = new VerifiedBackup(join(root, 'backup'), {
      protect: p => mkdir(p, { recursive: true }), verifyAcl: async () => {},
      availableBytes: async () => fault === 'disk-full' ? 0 : 1e12,
      assertQuiescent: async () => {
        if (++quiescenceChecks === 2) {
          if (fault === 'worker-crash') throw new Error('WORKER_NOT_QUIESCENT')
          if (fault === 'late-write') await writeFile(join(paths.dsh, 'durable.bin'), 'latewrite', 'utf8')
        }
      },
    })
    await assert.rejects(backup.create('11111111-1111-1111-1111-111111111111', source.artifactDigest, paths),
      new RegExp({ 'disk-full': 'BACKUP_DISK_FULL', 'late-write': 'BACKUP_SOURCE_CHANGED', 'worker-crash': 'WORKER_NOT_QUIESCENT' }[fault]))
    assert.deepEqual(await readdir(paths.runtime), [])
  }
})

test('SQLite bootstrap, current schema, ownership, missing/future/older/corrupt refusal', async () => {
  const root = await mkdtemp(join(testRoot, 'store-')), file = join(root, 'state.sqlite')
  assert.throws(() => new ControlStore(file), /CONTROL_SCHEMA_UNSUPPORTED/)
  assert.throws(() => new ControlStore(file, { kind: 'STEP1_NO_STORE', sourceSchema: '0', target }), /CONTROL_SCHEMA_UNSUPPORTED/)
  let store = new ControlStore(file, { kind: 'STEP1_NO_STORE', sourceSchema: NO_STORE, target })
  assert.equal(store.db.prepare('PRAGMA user_version').get().user_version, 1)
  assert.equal(store.db.prepare('SELECT source_schema FROM schema_version').get().source_schema, NO_STORE)
  assert.equal(store.db.prepare('PRAGMA journal_mode').get().journal_mode, 'delete')
  assert.equal(store.db.prepare('PRAGMA synchronous').get().synchronous, 2)
  const schema = store.db.prepare("SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL").all()
  assert.doesNotMatch(JSON.stringify(schema), /conversation|transcript|credential|settings|profile|workspace|automation/i)
  store.migrate(1)
  assert.throws(() => store.migrate(2), /CONTROL_SCHEMA_UNSUPPORTED/)
  store.close()
  store = new ControlStore(file); assert.deepEqual(store.release(), target); store.close()
  for (const version of [0, 2, 999]) {
    const db = new DatabaseSync(file); db.exec(`PRAGMA user_version=${version}`); db.close()
    assert.throws(() => new ControlStore(file), /CONTROL_SCHEMA_UNSUPPORTED/)
  }
  await writeFile(file, 'corrupt SQLite fixture', 'utf8')
  assert.throws(() => new ControlStore(file), /CONTROL_SCHEMA_UNSUPPORTED/)
})
test('SQLite control transaction failure rolls back all fields and event insert', async () => {
  const file = join(await mkdtemp(join(testRoot, 'atomic-')), 'state.sqlite')
  const store = new ControlStore(file, { kind: 'FRESH_INSTALL', sourceSchema: NO_STORE, target })
  const before = store.transaction()
  store.db.exec("CREATE TRIGGER fail_event BEFORE INSERT ON upgrade_events BEGIN SELECT RAISE(ABORT, 'injected'); END")
  assert.throws(() => store.record('11111111-1111-1111-1111-111111111111', 'CHECKING', source.artifactDigest, target.artifactDigest), /injected/)
  assert.deepEqual(store.transaction(), before); assert.equal(store.events().length, 0); store.close()
})

async function transactionFixture(fault, prior) {
  const root = await mkdtemp(join(testRoot, 'transaction-')), journal = join(root, 'journal.json'), calls = []
  if (prior) await writeFile(journal, JSON.stringify(prior), 'utf8')
  const operation = name => async () => { calls.push(name); if (fault === name) throw new Error(name.toUpperCase() + '_INJECTED') }
  let stops = 0
  const operations = {
    readJournal: () => readFile(journal, 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return undefined; throw error }),
    persist: async row => { calls.push(row.state); await writeFile(journal, JSON.stringify(row), { encoding: 'utf8', flush: true }) },
    check: operation('check'), drain: operation('drain'), assertQuiescent: operation('quiescence'),
    backup: async () => { await operation('backup')(); return 'c'.repeat(64) }, verifyBackup: operation('verifyBackup'),
    install: operation('install'), migrate: operation('migrate'), validate: operation('validate'), commit: operation('commit'),
    stopNewRuntime: async () => { stops++; await operation('stopNewRuntime')() }, restoreRuntimeAndData: operation('restore'), validateRestore: operation('validateRestore'),
  }
  return { engine: new UpdateTransaction(operations), operations, calls, journal }
}
test('transaction positive durable transition order and committed restart', async () => {
  const fixture = await transactionFixture()
  const result = await fixture.engine.run(source, target)
  assert.equal(result.state, 'COMMITTED')
  assert.deepEqual(result.events.map(e => e.state), ['CHECKING', 'DRAINING', 'BACKING_UP', 'INSTALLING', 'MIGRATING', 'VALIDATING', 'COMMITTED'])
  assert.equal((await new UpdateTransaction(fixture.operations).recover()).state, 'COMMITTED')
})
for (const fault of ['check', 'drain', 'quiescence', 'backup', 'verifyBackup', 'install', 'migrate', 'validate', 'commit']) test(`transaction failure ${fault} persists and restores only after install`, async () => {
  const fixture = await transactionFixture(fault)
  const result = await fixture.engine.run(source, target)
  const installed = ['install', 'migrate', 'validate', 'commit'].includes(fault)
  assert.equal(result.state, installed ? 'RESTORED' : 'FAILED')
  assert.equal(fixture.calls.includes('INSTALLING'), installed)
  assert.equal(result.events.some(row => row.state === 'ABORTED'), false)
  assert.deepEqual(JSON.parse(await readFile(fixture.journal, 'utf8')), result)
})
test('failure during restore persists RESTORE_FAILED and blocks restart', async () => {
  const f = await transactionFixture('restore')
  f.operations.validate = async () => { throw new Error('VALIDATION_FAILURE') }
  assert.equal((await f.engine.run(source, target)).state, 'RESTORE_FAILED')
  await assert.rejects(f.engine.recover(), /RESTORE_REQUIRED/)
})
test('restart authority for every transaction state; cancellation is only pre-install', async () => {
  for (const state of ['IDLE', 'COMMITTED', 'RESTORED', 'ABORTED']) assert.equal(transactionBlock(state), undefined)
  for (const state of ['CHECKING', 'DRAINING', 'BACKING_UP']) assert.equal(transactionBlock(state), 'UPGRADE_IN_PROGRESS')
  for (const state of ['INSTALLING', 'MIGRATING', 'VALIDATING', 'FAILED', 'RESTORING', 'RESTORE_FAILED', 'unknown', undefined]) assert.equal(transactionBlock(state), 'RESTORE_REQUIRED')
  for (const state of ['INSTALLING', 'MIGRATING', 'VALIDATING', 'RESTORING']) {
    const f = await transactionFixture(undefined, { id: '11111111-1111-1111-1111-111111111111', state, source, target, installed: true, backupDigest: 'c'.repeat(64), events: [] })
    assert.equal((await f.engine.recover()).state, 'RESTORED')
  }
  const f = await transactionFixture()
  assert.equal((await f.engine.run(source, target, () => true)).state, 'ABORTED')
  assert.equal(f.calls.includes('install'), false)
  const releaseFailure = await transactionFixture()
  releaseFailure.operations.releaseSafety = async () => { throw new Error('SAFETY_RELEASE_FAILED') }
  await assert.rejects(releaseFailure.engine.run(source, target, () => true), /SAFETY_RELEASE_FAILED/)
  assert.equal(JSON.parse(await readFile(releaseFailure.journal, 'utf8')).state, 'ABORTED')
})

test('backup byte integrity, missing/corrupt bytes rejection and runtime/data pair restore', async () => {
  const root = await mkdtemp(join(testRoot, 'backup-'))
  const paths = { dsh: join(root, 'dsh'), controlStore: join(root, 'control/state.sqlite'), runtime: join(root, 'runtime') }
  for (const p of [paths.dsh, join(root, 'control'), paths.runtime]) await mkdir(p)
  await writeFile(join(paths.dsh, 'user-truth.bin'), '隔离测试数据 — preserve exact bytes', 'utf8')
  await writeFile(join(paths.runtime, 'app.bin'), 'old runtime', 'utf8')
  const store = new ControlStore(paths.controlStore, { kind: 'FRESH_INSTALL', sourceSchema: NO_STORE, target: source }); store.close()
  // Direct fixture adapter; Windows ACL proof is a separate native gate.
  const backup = new VerifiedBackup(join(root, 'backup'), { protect: p => mkdir(p, { recursive: true }), verifyAcl: async () => {}, assertQuiescent: async () => {} })
  const id = '11111111-1111-1111-1111-111111111111'
  const digest = await backup.create(id, source.artifactDigest, paths)
  const oldData = await readFile(join(paths.dsh, 'user-truth.bin'))
  await writeFile(join(paths.dsh, 'user-truth.bin'), 'new data', 'utf8')
  await writeFile(join(paths.runtime, 'app.bin'), 'new runtime', 'utf8')
  await backup.restore(id, digest, paths)
  assert.deepEqual(await readFile(join(paths.dsh, 'user-truth.bin')), oldData)
  assert.equal(await readFile(join(paths.runtime, 'app.bin'), 'utf8'), 'old runtime')
  const restored = new ControlStore(paths.controlStore); assert.deepEqual(restored.release(), source); restored.close()
  const copy = join(root, 'backup', id, 'dsh/user-truth.bin')
  await writeFile(copy, 'corrupt', 'utf8')
  await assert.rejects(backup.verify(id, digest), /BACKUP_INTEGRITY_FAILURE/)
})
test('uninstall retains durable and unowned bytes; purge requires separate confirmation', async () => {
  const root = await mkdtemp(join(testRoot, 'uninstall-')), install = join(root, 'install'), data = join(root, 'data')
  await mkdir(install); await mkdir(data)
  await writeFile(join(install, 'owned.bin'), 'owned', 'utf8'); await writeFile(join(install, 'unowned.bin'), 'unowned', 'utf8')
  await writeFile(join(data, 'durable.bin'), 'durable', 'utf8')
  const owned = [{ path: 'owned.bin', bytes: 5, sha256: await hashFile(join(install, 'owned.bin')) }]
  let drained = 0
  const ops = { drain: async () => { drained++ }, assertQuiescent: async () => {}, purgeConfirmedData: async () => { assert.ok(data.startsWith(testRoot + '\\')); await rm(data, { recursive: true }) } }
  await assert.rejects(uninstall(install, owned, ops, { purge: true }), /CONFIRMATION_REQUIRED/)
  assert.equal(drained, 0)
  const retained = await uninstall(install, owned, ops)
  assert.equal(retained.durableDataRetained, true); assert.deepEqual(retained.retainedUnowned, ['unowned.bin'])
  assert.equal(await readFile(join(data, 'durable.bin'), 'utf8'), 'durable')
  const purged = await uninstall(install, [], ops, { purge: true, confirmed: true })
  assert.equal(purged.durableDataRetained, false); assert.deepEqual(await readdir(install), ['unowned.bin'])
})

test('uninstall binds identity to verified payload while preserving unrelated directories', async () => {
  const root = await mkdtemp(join(testRoot, 'uninstall-identity-')), installed = join(root, 'installed'), payload = join(root, 'verified-payload')
  await mkdir(installed); await mkdir(payload); await mkdir(join(installed, 'unowned-empty'))
  for (const name of ['release-manifest.json', 'artifact-identity.json', 'packaged-files.json']) {
    const bytes = name === 'packaged-files.json' ? JSON.stringify({ files: [] }) : 'verified-envelope'
    await writeFile(join(payload, name), bytes, 'utf8'); await writeFile(join(installed, name), bytes, 'utf8')
  }
  assert.equal((await readUninstallInventory(installed, payload)).length, 2)
  await writeFile(join(installed, 'artifact-identity.json'), 'tampered', 'utf8')
  await assert.rejects(readUninstallInventory(installed, payload), /UNINSTALL_RELEASE_IDENTITY_MISMATCH/)
  assert.ok((await readdir(installed)).includes('unowned-empty'))
})
test('signature pure verification: public identity, timestamp, unsigned, invalid, tamper, wrong signer', () => {
  const cert = { sha256: 'a'.repeat(64), subject: 'PUBLIC_FIXTURE', issuer: 'PUBLIC_FIXTURE', serialNumber: '01', notBefore: '2026-01-01', notAfter: '2027-01-01' }
  const signature = { status: 'Valid', signatureType: 'Authenticode', signer: cert, timestamp: { certificate: cert, signingTimes: ['2026-09-11T00:00:00.000Z'], rfc3161Present: false }, fileSha256: 'b'.repeat(64) }
  const policy = { certificateSha256: [cert.sha256], timestampRequired: true }
  assert.deepEqual(acceptSignature(signature, signature.fileSha256, policy), signature)
  assert.throws(() => acceptSignature({ ...signature, status: 'NotSigned', signer: null }, signature.fileSha256, policy), /SIGNATURE_MISSING/)
  for (const status of ['HashMismatch', 'NotTrusted', 'UnknownError']) assert.throws(() => acceptSignature({ ...signature, status }, signature.fileSha256, policy), /SIGNATURE_INVALID/)
  assert.throws(() => acceptSignature(signature, 'c'.repeat(64), policy), /DIGEST_MISMATCH/)
  assert.throws(() => acceptSignature(signature, signature.fileSha256, { ...policy, certificateSha256: [] }), /SIGNER_NOT_ALLOWED/)
  assert.throws(() => acceptSignature({ ...signature, timestamp: { ...signature.timestamp, certificate: null } }, signature.fileSha256, policy), /TIMESTAMP_MISSING/)
})
