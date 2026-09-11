import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import type { CarrierBootstrap } from './worker-supervisor.js'
import { CarrierClient, type StreamPullResult } from './carrier-client.js'
import { RecoveryCoordinator } from './recovery-coordinator.js'
import { MISMATCH_ACTIONS } from '@shaco-forge/contracts/compatibility'

test('Step2 pre-write failures retain actionable taxonomy without mounting an Agent path', async () => {
  for (const [code, action] of Object.entries(MISMATCH_ACTIONS)) {
    let mounted = 0, credentialsConsumed = 0
    const supervisor = { start: async (): Promise<CarrierBootstrap> => { throw new Error(code + ': untrusted diagnostic suffix') },
      recover: async (): Promise<CarrierBootstrap> => { throw new Error('not called') }, carrierReady() {}, detach() {} }
    const coordinator = new RecoveryCoordinator(supervisor, () => {}, async () => { mounted++ }, () => { credentialsConsumed++; throw new Error('must not create carrier') })
    await coordinator.start()
    assert.equal(coordinator.projection.failure, code + ': ' + action)
    assert.equal(coordinator.projection.authenticatedCarrier, false)
    assert.deepEqual({ mounted, credentialsConsumed }, { mounted: 0, credentialsConsumed: 0 })
    coordinator.stop()
  }
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
class ControlledCarrier extends CarrierClient {
  live = false
  closes = 0
  calls = 0
  cancelled: string[] = []
  result: unknown = { result: { ok: true, value: { items: [] } } }
  item: StreamPullResult | Promise<StreamPullResult> = { done: true }
  override get authenticated(): boolean { return this.live }
  override async connect(): Promise<void> { this.live = true }
  override close(): void { this.live = false; this.closes++ }
  override async request(): Promise<unknown> { this.calls++; return await this.result }
  override async openStream(): Promise<string> { return 'reused-id' }
  override async pullStream(): Promise<StreamPullResult> { return await this.item }
  override async cancelStream(id: string): Promise<void> { this.cancelled.push(id) }
}
const ready = { clientGenerationReady: true, workspaceReady: true, sessionRosterReady: true, currentSessionReady: true, currentSessionPresent: false, projectionFailed: false }
const envelope = { type: 'client-request' as const, rpcId: 'read', method: 'session/list', payload: { args: {} } }
function setup(mount: () => Promise<void> = async () => {}) {
  const clients: ControlledCarrier[] = []
  let bootstrap = { workerInstanceId: 'worker-1', secret: Buffer.alloc(32) } as CarrierBootstrap
  let recover: () => Promise<CarrierBootstrap> = async () => bootstrap
  const supervisor = { async start() { return bootstrap }, recover: () => recover(), carrierReady() {}, detach() {} }
  const coordinator = new RecoveryCoordinator(supervisor, () => {}, mount, value => {
    const client = new ControlledCarrier(value); clients.push(client); return client
  })
  return { coordinator, clients, setRecover(value: typeof recover) { recover = value }, replace() { bootstrap = { ...bootstrap, workerInstanceId: 'worker-2' } } }
}
async function repull(coordinator: RecoveryCoordinator, client: ControlledCarrier) {
  const generation = coordinator.projection.generation
  await coordinator.request(generation, 'session/list', envelope)
  for (const [endpoint, value] of [['$events', { type: 'ready' }], ['workspace/follow', { type: 'baseline', value: { items: [] } }]] as const) {
    const handle = await coordinator.openStream(generation, endpoint, { args: {} })
    client.item = { done: false, value }
    await coordinator.pullStream(generation, handle)
  }
}

test('S2G11/S2G12 carrier and Client alone cannot publish CONNECTED; real repull is required', async () => {
  const { coordinator: c, clients } = setup()
  try {
    await c.start()
    await assert.rejects(c.request(1, 'session/create', { ...envelope, method: 'session/create' }), /RECOVERY_READ_ONLY/)
    assert.equal(clients[0]!.calls, 0)
    c.report(1, ready)
    assert.equal(c.projection.projectionRebuildComplete, false)
    await repull(c, clients[0]!)
    c.report(1, { ...ready, currentSessionPresent: true })
    assert.equal(c.projection.projectionRebuildComplete, false)
    const follow = await c.openStream(1, 'session/follow', { args: { request: { address: { kind: 'session', sessionId: 'cold-session' } } } })
    clients[0]!.item = { done: false, value: { type: 'snapshot', records: ['title'] } }
    await c.pullStream(1, follow)
    assert.equal(c.readProof.sessionHash, createHash('sha256').update('cold-session').digest('hex'))
    c.report(1, { ...ready, currentSessionPresent: true })
    assert.equal(c.projection.connectionState, 'CONNECTED')
    c.report(1, ready)
    assert.equal(c.projection.connectionState, 'CONNECTED')
    c.report(1, { ...ready, workspaceReady: false })
    assert.notEqual(c.projection.connectionState, 'CONNECTED')
  } finally { c.stop() }
})

test('S2G01/S2G04/S2G07 healthy loss fences callbacks and reused stream IDs across generations', async () => {
  const { coordinator: c, clients } = setup()
  try {
    await c.start(); await repull(c, clients[0]!); c.report(1, ready)
    const old = await c.openStream(1, 'session/follow', { args: {} })
    c.lost('CARRIER_LOST')
    assert.notEqual(c.projection.connectionState, 'CONNECTED')
    assert.equal(c.projection.projectionRebuildComplete, false)
    await c.settled()
    const fresh = await c.openStream(2, 'session/follow', { args: {} })
    assert.notEqual(old, fresh)
    assert.throws(() => c.report(1, ready), /STALE/)
    await assert.rejects(c.request(1, '$events/result', { ...envelope, method: '$events/result' }), /STALE/)
    await assert.rejects(c.pullStream(2, old), /STALE/)
    await assert.rejects(c.cancelStream(1, old, 'old'), /STALE/)
    assert.equal(clients[1]!.cancelled.length, 0)
    assert.equal(clients[0]!.closes, 1)
  } finally { c.stop() }
})

for (const terminal of [{ done: false, value: 'old' }, { done: true }, { done: true, error: 'old error' }] as StreamPullResult[]) {
  test(`S2G04/S2G14 delayed stream item/end/error cannot cross attachment: ${JSON.stringify(terminal)}`, async () => {
    const { coordinator: c, clients } = setup()
    try {
      await c.start()
      const handle = await c.openStream(1, 'session/follow', { args: {} })
      const pending = deferred<StreamPullResult>()
      clients[0]!.item = pending.promise
      const pulled = assert.rejects(c.pullStream(1, handle), /STALE/)
      c.lost('CARRIER_LOST'); await c.settled()
      pending.resolve(terminal)
      await pulled
      assert.equal(c.readProof.sessionSnapshot, false)
      assert.notEqual(c.projection.connectionState, 'CONNECTED')
    } finally { c.stop() }
  })
}

test('S2G14 late unary completion cannot settle or modify replacement projection', async () => {
  const { coordinator: c, clients } = setup()
  try {
    await c.start()
    const pending = deferred<unknown>()
    clients[0]!.result = pending.promise
    const request = assert.rejects(c.request(1, 'session/list', envelope), /STALE/)
    c.lost('CARRIER_LOST'); await c.settled()
    pending.resolve({ result: { ok: true, value: { items: ['old'] } } })
    await request
    assert.equal(c.readProof.sessionRoster, false)
    assert.equal(clients[1]!.calls, 0)
    assert.equal(c.metrics.businessReplays, 0)
  } finally { c.stop() }
})

test('S2G13/S2G18 ambiguous recovery fails closed without a fresh Carrier', async () => {
  const { coordinator: c, clients, setRecover } = setup()
  try {
    await c.start()
    setRecover(async () => { throw new Error('AUTHORITY_AMBIGUOUS_FAIL_CLOSED') })
    c.lost('WORKER_CRASHED'); await c.settled()
    assert.equal(c.projection.connectionState, 'FAILED')
    assert.equal(c.projection.failure, 'AUTHORITY_AMBIGUOUS_FAIL_CLOSED')
    assert.equal(clients.length, 1)
    assert.equal(c.projection.authenticatedCarrier, false)
  } finally { c.stop() }
})

test('S2G17 replacement loses continuity and clears all prior read proofs', async () => {
  const { coordinator: c, clients, replace } = setup()
  try {
    await c.start(); await repull(c, clients[0]!); c.report(1, ready)
    replace(); c.lost('WORKER_CRASHED'); await c.settled()
    assert.equal(c.projection.generation, 2)
    assert.equal(c.projection.continuity, 'REPLACEMENT_CONTINUITY_UNPROVEN')
    assert.equal(c.readProof.sessionRoster, false)
    assert.equal(c.projection.projectionRebuildComplete, false)
  } finally { c.stop() }
})

test('S2G14 late recovery after Desktop stop cannot mount or authenticate', async () => {
  const { coordinator: c, clients, setRecover } = setup()
  await c.start()
  const pending = deferred<CarrierBootstrap>()
  setRecover(() => pending.promise)
  c.lost('CARRIER_LOST'); c.stop()
  const secret = Buffer.alloc(32, 1)
  pending.resolve({ workerInstanceId: 'late', secret } as CarrierBootstrap)
  await c.settled()
  assert.equal(c.projection.connectionState, 'DISCONNECTED')
  assert.equal(clients.length, 1)
  assert.ok(secret.every(byte => byte === 0))
})

test('S2G01/S2G14 loss during a pending replacement mount fences it and its late completion', async () => {
  const pending = deferred<void>()
  let mounts = 0
  const { coordinator: c, clients } = setup(async () => { if (++mounts > 1) await pending.promise })
  try {
    await c.start()
    c.lost('CARRIER_LOST')
    await new Promise(resolve => setImmediate(resolve))
    await repull(c, clients[1]!)
    c.report(2, ready)
    assert.equal(c.projection.connectionState, 'CONNECTED')
    c.lost('CARRIER_LOST_DURING_MOUNT')
    assert.equal(c.projection.connectionState, 'FAILED')
    assert.equal(c.projection.authenticatedCarrier, false)
    pending.resolve()
    await c.settled()
    assert.equal(c.projection.connectionState, 'FAILED')
  } finally { pending.resolve(); c.stop() }
})

test('S2G13 a public cold projection error is terminal and cannot remain CONNECTED', async () => {
  const { coordinator: c, clients } = setup()
  try {
    await c.start(); await repull(c, clients[0]!); c.report(1, ready)
    c.report(1, { ...ready, projectionFailed: true })
    assert.equal(c.projection.connectionState, 'FAILED')
    assert.equal(c.projection.failure, 'HARNESS_SESSION_RECOVERY_FAILED')
  } finally { c.stop() }
})
