// Actual packaged code and Frozen Harness, with explicit non-shipped root/OS
// adapters. No production installer bypass, Provider, or real-user data writes.
import assert from 'node:assert/strict'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fixture, workerBridge, isolatedProfileLinks } from './slice3-step2-fixtures.mjs'
import { UpdateTransaction } from '../apps/worker/dist/update-transaction.js'
import { ControlStore } from '../apps/worker/dist/control-store.js'
import { uninstall, readUninstallInventory } from '../apps/worker/dist/uninstall.js'
import { hashFile, jsonBytes, verifyFrozenStep1PackagedRuntime, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { inspectLocalPlatform } from '../apps/desktop/dist/main/lifecycle-client.js'
import { durableInventory } from '../apps/worker/dist/durable-files.js'

const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
await mkdir(evidence, { recursive: true })
const results = []
async function save(id, value) {
  results.push({ id, ...value })
  await writeFile(join(evidence, 'step2-integration.json'), jsonBytes({ results, testMode: 'EXPLICIT_NON_SHIPPED_DIRECT_ADAPTER', productionDataWrites: 0, providerRuns: 0, signingRuns: 0 }), 'utf8')
  console.log(id + ': ' + value.result)
}

const fresh = await fixture('fresh-install')
assert.equal((await inspectLocalPlatform(join(fresh.paths.payload, 'native/ShacoForge.NativeCarrier.exe'))).mutexExists, false)
const cancelledPair = await fresh.operations.initialize()
const cancelled = await new UpdateTransaction(fresh.operations).run(cancelledPair.source, cancelledPair.target, () => true)
assert.equal(cancelled.state, 'ABORTED')
const { existsSync } = await import('node:fs')
assert.equal(existsSync(fresh.paths.runtime), false); assert.equal(existsSync(fresh.paths.dsh), false)
await save('FRESH_PRE_INSTALL_CANCEL', { result: 'PASS', transaction: cancelled, originalAbsentRuntimeAndDataRestored: true })
const identities = await fresh.operations.initialize()
const transaction = await new UpdateTransaction(fresh.operations).run(identities.source, identities.target)
await save('FRESH_INSTALL', { result: transaction.state === 'COMMITTED' ? 'PASS' : 'FAIL', root: fresh.root, transaction, nativeReceipts: fresh.receipts })
assert.equal(transaction.state, 'COMMITTED', transaction.errorCode)
const store = new ControlStore(join(fresh.paths.control, 'state.sqlite'))
store.assertReady(); assert.deepEqual(store.release(), identities.target); store.close()
await verifyPackagedRuntime(fresh.paths.runtime)
await save('ACTUAL_VALIDATION_DRAIN', { result: 'PASS', receipt: JSON.parse(await readFile(join(fresh.paths.control, 'drain-receipt.json'), 'utf8')) })
const links = await isolatedProfileLinks(fresh.paths.dsh, fresh.paths.runtime)
const drainedBytes = await durableInventory(fresh.paths.dsh, links)
await new Promise(done => setTimeout(done, 300))
assert.deepEqual(await durableInventory(fresh.paths.dsh, links), drainedBytes)
await save('NO_WRITE_AFTER_DRAIN', { result: 'PASS', workerHostHelperGone: true, identicalDurableEntries: drainedBytes.length, observationMs: 300 })

// A validation failure must restore the exact Frozen Step1 runtime and original
// durable bytes. The source package itself stays read-only outside this fixture.
const restore = await fixture('step1-restore', { step1: true })
const before = await hashFile(join(restore.paths.dsh, 'isolated-durable-sentinel.bin'))
const pair = await restore.operations.initialize()
const validateActual = restore.operations.validate.bind(restore.operations)
restore.operations.validate = async () => {
  await writeFile(join(restore.paths.dsh, 'isolated-durable-sentinel.bin'), 'TARGET_VALIDATION_FAULT', 'utf8')
  throw new Error('VALIDATION_FAILURE_INJECTED')
}
const restored = await new UpdateTransaction(restore.operations).run(pair.source, pair.target)
await save('STEP1_PAIR_RESTORE', { result: restored.state === 'RESTORED' ? 'PASS' : 'FAIL', root: restore.root, transaction: restored, nativeReceipts: restore.receipts })
assert.equal(restored.state, 'RESTORED', restored.errorCode)
assert.equal(await hashFile(join(restore.paths.dsh, 'isolated-durable-sentinel.bin')), before)
assert.equal((await verifyFrozenStep1PackagedRuntime(restore.paths.runtime)).ControlStoreSchemaVersion, 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES')
const restarted = await new UpdateTransaction(restore.operations).recover()
assert.equal(restarted.state, 'RESTORED')
await save('RESTORED_RESTART', { result: 'PASS', unchangedOriginalDurableSha256: before, runtimeDataPairValidated: true, harnessDownMigration: false })
await writeFile(join(evidence, 'step1-backup-manifest.json'), await readFile(join(restore.paths.backup, restored.id, 'backup-manifest.json')))
restore.operations.validate = validateActual
const upgradePair = await restore.operations.initialize()
const upgraded = await new UpdateTransaction(restore.operations).run(upgradePair.source, upgradePair.target)
assert.equal(upgraded.state, 'COMMITTED', upgraded.errorCode)
assert.equal(await hashFile(join(restore.paths.dsh, 'isolated-durable-sentinel.bin')), before)
const upgradedStore = new ControlStore(join(restore.paths.control, 'state.sqlite'))
assert.equal(upgradedStore.db.prepare('SELECT source_schema FROM schema_version').get().source_schema, 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES')
upgradedStore.assertReady(); upgradedStore.close()
await save('STEP1_HAPPY_UPGRADE', { result: 'PASS', root: restore.root, transaction: upgraded, originalDurableSha256: before })

await writeFile(join(fresh.paths.runtime, 'user-unowned.txt'), 'UNOWNED_TEST_SENTINEL', 'utf8')
const inventory = await readUninstallInventory(fresh.paths.runtime, fresh.paths.payload)
const journal = { ...transaction, id: randomUUID(), state: 'DRAINING', source: identities.target, target: identities.target, installed: false, events: [] }
Object.assign(journal, await fresh.operations.prepareDrain()); await fresh.operations.persist(journal)
const retainedStore = await hashFile(join(fresh.paths.control, 'state.sqlite'))
const removed = await uninstall(fresh.paths.runtime, inventory, { drain: () => fresh.operations.drain(), assertQuiescent: () => fresh.operations.assertQuiescent(), purgeConfirmedData: async () => { throw new Error('TEST_PURGE_NOT_REQUESTED') } })
assert.equal(removed.durableDataRetained, true)
assert.deepEqual(removed.retainedUnowned, ['harness/profiles/shaco-forge/.dsh-module-fallback/node_modules/', 'user-unowned.txt'])
assert.equal(await hashFile(join(fresh.paths.control, 'state.sqlite')), retainedStore)
await save('REAL_PACKAGE_UNINSTALL', { result: 'PASS', ...removed, durableSqliteSha256: retainedStore, fixtureRoot: fresh.root })
journal.state = 'COMMITTED'; await fresh.operations.persist(journal); await fresh.operations.releaseSafety()
const authorityExists = (await inspectLocalPlatform(join(fresh.paths.payload, 'native/ShacoForge.NativeCarrier.exe'))).mutexExists
assert.equal(authorityExists, false)
await save('CLEANUP', { result: 'PASS', productAuthorityExists: authorityExists, fixturesRetainedForEvidence: [fresh.root, restore.root] })
