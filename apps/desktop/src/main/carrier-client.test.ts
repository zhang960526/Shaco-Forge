import assert from 'node:assert/strict'
import test from 'node:test'
import { randomBytes, randomUUID } from 'node:crypto'
import { createServer, type Socket } from 'node:net'
import { CARRIER_PROTOCOL_VERSION, CLIENT_AUTH_DOMAIN, SERVER_AUTH_DOMAIN, JsonFrameDecoder, createAuthProof, encodeJsonFrame, isRecord, verifyAuthProof } from '@shaco-forge/contracts'
import { CarrierClient, PullStreamBuffer } from './carrier-client.js'
import type { CarrierBootstrap } from './worker-supervisor.js'

test('Renderer stream allows at most one in-flight pull and receives no unsolicited push', async () => {
  const buffer = new PullStreamBuffer()
  const first = buffer.pull()
  await assert.rejects(buffer.pull(), /one Renderer pull/)
  assert.equal(buffer.push({ item: 1 }), true)
  assert.deepEqual(await first, { done: false, value: { item: 1 } })
})

test('Renderer queue is bounded by current Carrier credit window', () => {
  const buffer = new PullStreamBuffer()
  for (let index = 0; index < 4; index += 1) assert.equal(buffer.push(index), false)
  assert.throws(() => buffer.push(5), /granted credit/)
})

test('Carrier-loss cleanup rejects pending pull and releases buffered items', async () => {
  const buffer = new PullStreamBuffer()
  buffer.push('buffered')
  assert.deepEqual(await buffer.pull(), { done: false, value: 'buffered' })
  const pending = buffer.pull()
  buffer.fail(new Error('CARRIER_FAILED'))
  await assert.rejects(pending, /CARRIER_FAILED/)
  assert.equal(buffer.queue.length, 0)
})

for (const terminal of [{ done: true }, { done: true, error: 'remote error' }] as const) {
  test(`PullStreamBuffer preserves A/B before remote ${'error' in terminal ? 'error' : 'end'}`, async () => {
    const buffer = new PullStreamBuffer()
    buffer.push('A')
    buffer.push('B')
    buffer.finish(terminal)
    assert.equal(buffer.terminalObserved, true)
    assert.deepEqual(await buffer.pull(), { done: false, value: 'A' })
    assert.deepEqual(await buffer.pull(), { done: false, value: 'B' })
    assert.deepEqual(await buffer.pull(), terminal)
    assert.equal(buffer.queue.length, 0)
  })
}

test('PullStreamBuffer preserves queued undefined before end', async () => {
  const buffer = new PullStreamBuffer()
  buffer.push(undefined)
  buffer.finish({ done: true })
  assert.deepEqual(await buffer.pull(), { done: false, value: undefined })
  assert.deepEqual(await buffer.pull(), { done: true })
  assert.equal(buffer.queue.length, 0)
})

test('PullStreamBuffer delivers end to a pending pull', async () => {
  const buffer = new PullStreamBuffer()
  const pending = buffer.pull()
  buffer.finish({ done: true })
  assert.deepEqual(await pending, { done: true })
})

test('consumer cancel discards queued items even after remote terminal', async () => {
  const buffer = new PullStreamBuffer()
  buffer.push('discard')
  buffer.finish({ done: true, error: 'remote error' })
  buffer.cancel()
  assert.equal(buffer.queue.length, 0)
  assert.deepEqual(await buffer.pull(), { done: true })
})

test('Carrier failure discards queued items immediately', async () => {
  const buffer = new PullStreamBuffer()
  buffer.push('discard')
  buffer.finish({ done: true })
  buffer.fail(new Error('CARRIER_FAILED'))
  assert.equal(buffer.queue.length, 0)
  assert.deepEqual(await buffer.pull(), { done: true, error: 'CARRIER_FAILED' })
})

// An authenticated Named Pipe peer drives the real CarrierClient wire decoder.
// No replacement of its production buffer, dispatch, or credit methods is used.
async function withCarrierPeer(run: (peer: {
  client: CarrierClient
  frames: Record<string, unknown>[]
  deliver(values: Record<string, unknown>[]): Promise<void>
}) => Promise<void>): Promise<void> {
  const bootstrap: CarrierBootstrap = {
    pipeEndpoint: `\\\\.\\pipe\\shaco-forge-stream-test-${randomUUID()}`,
    endpointId: randomUUID(), pipeEndpointHashPrefix: 'redacted', helperPid: process.pid,
    workerInstanceId: randomUUID(), credentialEpoch: randomUUID(), secret: randomBytes(32),
    security: {}, hostPreflight: {},
  }
  let socket: Socket | undefined
  const frames: Record<string, unknown>[] = []
  const server = createServer(connection => {
    socket = connection
    const challenge = {
      type: 'server-challenge', protocolVersion: CARRIER_PROTOCOL_VERSION,
      workerInstanceId: bootstrap.workerInstanceId, endpointId: bootstrap.endpointId,
      credentialEpoch: bootstrap.credentialEpoch, challengeId: randomUUID(), serverNonce: randomBytes(32).toString('hex'),
    }
    const decoder = new JsonFrameDecoder()
    connection.on('data', chunk => {
      for (const value of decoder.push(chunk)) {
        assert.ok(isRecord(value))
        if (value.type === 'client-auth') {
          assert.equal(typeof value.clientNonce, 'string')
          assert.equal(typeof value.clientInstanceId, 'string')
          const fields = { ...challenge, clientNonce: value.clientNonce as string, clientInstanceId: value.clientInstanceId as string }
          assert.equal(verifyAuthProof(bootstrap.secret, CLIENT_AUTH_DOMAIN, fields, value.clientProof as string), true)
          connection.write(encodeJsonFrame({ type: 'server-auth', serverProof: createAuthProof(bootstrap.secret, SERVER_AUTH_DOMAIN, fields) }))
        } else {
          frames.push(value)
          if (value.type === 'stream-open' && value.endpoint === 'test/barrier') {
            connection.write(encodeJsonFrame({ type: 'stream-end', streamId: value.streamId }))
          }
        }
      }
    })
    connection.write(encodeJsonFrame(challenge))
  })
  const client = new CarrierClient(bootstrap)
  try {
    await new Promise<void>((resolveListen, rejectListen) => server.listen(bootstrap.pipeEndpoint, resolveListen).once('error', rejectListen))
    await client.connect()
    await run({
      client, frames,
      async deliver(values) {
        assert.ok(socket)
        if (values.length > 0) socket.write(Buffer.concat(values.map(value => encodeJsonFrame(value))))
        // Full duplex barrier: earlier server frames are dispatched and earlier
        // Client credits are recorded before the barrier terminal is delivered.
        const barrier = await client.openStream('test/barrier', { args: {} })
        assert.deepEqual(await client.pullStream(barrier), { done: true })
      },
    })
  } finally {
    client.close()
    socket?.destroy()
    await new Promise<void>(resolveClose => server.close(() => resolveClose()))
  }
}

for (const kind of ['stream-end', 'stream-error'] as const) {
  test(`CarrierClient drains items before ${kind}, grants no terminal credit, and removes state`, { timeout: 10_000 }, async () => {
    await withCarrierPeer(async ({ client, frames, deliver }) => {
      const streamId = await client.openStream('test/items', { args: {} })
      await deliver([
        { type: 'stream-item', streamId, value: 'A' },
        { type: 'stream-item', streamId, value: 'B' },
        { type: kind, streamId, ...(kind === 'stream-error' ? { error: { message: 'remote error' } } : {}) },
      ])
      assert.equal(client.metrics.activeStreams, 1)
      assert.deepEqual(await client.pullStream(streamId), { done: false, value: 'A' })
      assert.deepEqual(await client.pullStream(streamId), { done: false, value: 'B' })
      assert.equal(client.metrics.activeStreams, 1)
      assert.deepEqual(await client.pullStream(streamId), kind === 'stream-error' ? { done: true, error: 'remote error' } : { done: true })
      await deliver([])
      assert.equal(frames.filter(frame => frame.type === 'stream-credit' && frame.streamId === streamId).length, 0)
      assert.equal(client.metrics.activeStreams, 0)
    })
  })
}

test('CarrierClient consumes undefined and grants exactly one credit while active', { timeout: 10_000 }, async () => {
  await withCarrierPeer(async ({ client, frames, deliver }) => {
    const streamId = await client.openStream('test/items', { args: {} })
    await deliver([{ type: 'stream-item', streamId }])
    assert.deepEqual(await client.pullStream(streamId), { done: false, value: undefined })
    await deliver([{ type: 'stream-item', streamId }, { type: 'stream-end', streamId }])
    assert.deepEqual(await client.pullStream(streamId), { done: false, value: undefined })
    assert.deepEqual(await client.pullStream(streamId), { done: true })
    await deliver([])
    assert.deepEqual(frames.filter(frame => frame.type === 'stream-credit' && frame.streamId === streamId), [{ type: 'stream-credit', streamId, credit: 1 }])
    assert.equal(client.metrics.activeStreams, 0)
  })
})

test('CarrierClient cancel clears queued state and sends cancellation', { timeout: 10_000 }, async () => {
  await withCarrierPeer(async ({ client, frames, deliver }) => {
    const streamId = await client.openStream('test/items', { args: {} })
    await deliver([{ type: 'stream-item', streamId, value: 'discard' }])
    await client.cancelStream(streamId)
    await deliver([])
    assert.equal((await client.pullStream(streamId)).done, true)
    assert.equal(frames.filter(frame => frame.type === 'stream-cancel' && frame.streamId === streamId).length, 1)
    assert.equal(client.metrics.activeStreams, 0)
  })
})

test('CarrierClient failure clears queued streams and rejects another pending pull', { timeout: 10_000 }, async () => {
  await withCarrierPeer(async ({ client, deliver }) => {
    const queued = await client.openStream('test/queued', { args: {} })
    const waiting = await client.openStream('test/waiting', { args: {} })
    await deliver([{ type: 'stream-item', streamId: queued, value: 'discard' }])
    const rejection = assert.rejects(client.pullStream(waiting), /CARRIER_FAILED/)
    client.fail('CARRIER_FAILED')
    await rejection
    assert.equal((await client.pullStream(queued)).done, true)
    assert.equal(client.metrics.activeStreams, 0)
  })
})
