import assert from 'node:assert/strict'
import test from 'node:test'
import { assertLifecycleDocument, ProductLifecycle } from './product-lifecycle.js'
import { RecoveryCoordinator } from './recovery-coordinator.js'
import { CarrierClient } from './carrier-client.js'
import type { CarrierBootstrap, StopResult } from './worker-supervisor.js'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
function setup(stop: () => Promise<StopResult> = async () => ({ exited: true, delivery: 'STOP_DELIVERED' })) {
  const calls: string[] = []
  const control = new ProductLifecycle({ stop() { calls.push('fence') }, async settled() { calls.push('settled') } },
    { async stop() { calls.push('stop-authority'); return await stop() } }, state => calls.push(state), () => calls.push('quit'))
  return { control, calls }
}
test('LIFE-07 Stop fences recovery, awaits it and stops authority while Desktop remains', async () => {
  const { control, calls } = setup()
  await control.stopWorker(() => {})
  assert.deepEqual(calls, ['STOPPING', 'fence', 'settled', 'stop-authority', 'STOPPED'])
  assert.equal(control.state, 'STOPPED')
})
test('LIFE-07 Exit quits only after controlled stop succeeds', async () => {
  const { control, calls } = setup()
  await control.exitProduct(() => {})
  assert.deepEqual(calls, ['STOPPING', 'fence', 'settled', 'stop-authority', 'STOPPED', 'quit'])
})
test('LIFE-07 already stopped Worker permits Exit without a second stop delivery', async () => {
  const { control, calls } = setup()
  await control.stopWorker(() => {})
  await control.exitProduct(() => {})
  assert.equal(calls.filter(value => value === 'stop-authority').length, 1)
  assert.equal(calls.at(-1), 'quit')
})
test('LIFE-07 explicit rejection, undelivered stop and non-exit fail without quitting', async () => {
  for (const result of [
    { exited: false, delivery: 'STOP_DELIVERED_BUT_AUTHORITY_DID_NOT_EXIT' },
    { exited: true, delivery: 'STOP_REJECTED' },
    { exited: true, delivery: 'STOP_DELIVERY_FAILED' },
  ] as StopResult[]) {
    const { control, calls } = setup(async () => result)
    await assert.rejects(control.exitProduct(() => {}), /CONTROLLED_WORKER_STOP_FAILED/)
    assert.equal(control.state, 'STOP_FAILED')
    assert.ok(!calls.includes('quit'))
  }
})
test('LIFE-07 thrown shutdown failure remains retryable, without recovery restart', async () => {
  let fail = true
  const { control, calls } = setup(async () => { if (fail) throw new Error('shutdown failed'); return { exited: true, delivery: 'STOP_DELIVERED' } })
  await assert.rejects(control.exitProduct(() => {}))
  assert.ok(!calls.includes('quit'))
  fail = false
  await control.stopWorker(() => {})
  assert.equal(control.state, 'STOPPED')
})
test('LIFE-07 concurrent Stop and Exit share one stop and do not quit early', async () => {
  const completion = deferred<StopResult>()
  const { control, calls } = setup(() => completion.promise)
  const stop = control.stopWorker(() => {})
  const exit = control.exitProduct(() => {})
  await Promise.resolve()
  assert.ok(!calls.includes('quit'))
  assert.equal(calls.filter(value => value === 'stop-authority').length, 1)
  completion.resolve({ exited: true, delivery: 'STOP_DELIVERED' })
  await Promise.all([stop, exit])
  assert.equal(calls.at(-1), 'quit')
})
test('LIFE-07 stale request is rejected before fencing or stopping anything', async () => {
  const { control, calls } = setup()
  await assert.rejects(control.stopWorker(() => { throw new Error('STALE') }), /STALE/)
  assert.deepEqual(calls, [])
})
test('LIFE-07 navigation during shutdown cannot quit the replacement document', async () => {
  const completion = deferred<StopResult>()
  const { control, calls } = setup(() => completion.promise)
  let current = true
  const exit = control.exitProduct(() => { if (!current) throw new Error('STALE') })
  await Promise.resolve()
  current = false
  completion.resolve({ exited: true, delivery: 'STOP_DELIVERED' })
  await assert.rejects(exit, /STALE/)
  assert.equal(control.state, 'STOPPED')
  assert.ok(!calls.includes('quit'))
})
test('LIFE-07 document guard checks origin, owning WebContents, main frame, loading and both epochs', () => {
  const frame = { url: 'shaco-forge://client/' }
  const contents = { mainFrame: frame, isDestroyed: () => false, isLoadingMainFrame: () => false }
  const window = { webContents: contents, isDestroyed: () => false }
  const event = { sender: contents, senderFrame: frame }
  const check = (e = event, w = window, generation: unknown = 7, epoch: unknown = 3) => assertLifecycleDocument(e as never, w as never, generation, epoch, 7, 3)
  assert.doesNotThrow(() => check())
  assert.throws(() => check(event, window, 6), /STALE/)
  assert.throws(() => check(event, window, 7, 2), /STALE/)
  assert.throws(() => check(event, window, '7'), /STALE/)
  assert.throws(() => check({ ...event, sender: { ...contents } }), /UNTRUSTED/)
  assert.throws(() => check({ ...event, senderFrame: { ...frame } }), /UNTRUSTED/)
  assert.throws(() => check(event, { ...window, isDestroyed: () => true }), /UNTRUSTED/)
  contents.isLoadingMainFrame = () => true
  assert.throws(() => check(), /UNTRUSTED/)
  contents.isLoadingMainFrame = () => false
  frame.url = 'https://untrusted.example/'
  assert.throws(() => check(), /UNTRUSTED/)
})
test('LIFE-07 real recovery fence discards an in-flight replacement before final authority stop', async () => {
  const replacement = deferred<CarrierBootstrap>()
  const first = { workerInstanceId: 'worker-one', secret: Buffer.alloc(32) } as CarrierBootstrap
  const next = { workerInstanceId: 'worker-two', secret: Buffer.alloc(32, 1) } as CarrierBootstrap
  let recoveries = 0, mounts = 0, stops = 0
  class LocalCarrier extends CarrierClient {
    live = false
    override get authenticated() { return this.live }
    override async connect() { this.live = true }
    override close() { this.live = false }
  }
  const supervisor = { async start() { return first }, async recover() { recoveries++; return await replacement.promise },
    carrierReady() {}, detach() {}, async stop(): Promise<StopResult> { stops++; return { exited: true, delivery: 'STOP_DELIVERED' } } }
  const recovery = new RecoveryCoordinator(supervisor, () => {}, async () => { mounts++ }, bootstrap => new LocalCarrier(bootstrap))
  await recovery.start()
  recovery.lost('CARRIER_LOST')
  const control = new ProductLifecycle(recovery, supervisor, () => {}, () => assert.fail('Desktop must remain'))
  const stop = control.stopWorker(() => {})
  await Promise.resolve()
  assert.equal(stops, 0)
  replacement.resolve(next)
  await stop
  recovery.lost('LATE_FAILURE')
  assert.deepEqual({ recoveries, mounts, stops }, { recoveries: 1, mounts: 1, stops: 1 })
  assert.ok(next.secret.every(value => value === 0))
  assert.equal(recovery.projection.connectionState, 'DISCONNECTED')
  assert.throws(() => recovery.assertGeneration(2), /STALE_CLIENT_GENERATION/)
})
