import assert from 'node:assert/strict'
import test from 'node:test'
import { createHarnessTransport, createRendererTransportEvidence, type RendererTransportBridge } from '../src/renderer/transport.js'

function bridgeWithItems(items: unknown[]): RendererTransportBridge & { cancels: string[]; pulls: number } {
  return {
    cancels: [], pulls: 0,
    async fetch() { return { status: 200, contentType: 'application/json', body: '{}' } },
    async openStream() { return 'stream-1' },
    async pullStream() {
      this.pulls += 1
      return items.length === 0 ? { done: true } : { done: false, value: items.shift() }
    },
    async cancelStream(_streamId, reason) { this.cancels.push(reason) },
  }
}

test('Renderer AsyncIterable pulls only when consumer advances and iterator.return cancels', async () => {
  const bridge = bridgeWithItems([1, 2])
  const evidence = createRendererTransportEvidence()
  const iterator = createHarnessTransport(bridge, evidence).openStream('workspace/follow', { args: {} })[Symbol.asyncIterator]()
  assert.deepEqual(await iterator.next(), { done: false, value: 1 })
  assert.equal(bridge.pulls, 1)
  await iterator.return?.()
  assert.deepEqual(bridge.cancels, ['iterator-return'])
  assert.equal(evidence.iteratorCancels, 1)
})

test('Renderer AsyncIterable maps AbortSignal to bounded stream cancel', async () => {
  const bridge = bridgeWithItems([{ type: 'ready' }])
  const evidence = createRendererTransportEvidence()
  const controller = new AbortController()
  const iterator = createHarnessTransport(bridge, evidence).openStream('$events', { args: {} }, controller.signal)[Symbol.asyncIterator]()
  await iterator.next()
  controller.abort()
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(bridge.cancels, ['abort-signal'])
  assert.equal(evidence.abortCancels, 1)
  assert.equal(evidence.eventsReady, 1)
  await iterator.return?.()
})

test('Renderer forwards interaction traffic unchanged without observing private identity or settlement', async () => {
  let privateReads = 0
  const frame = Object.freeze({ type: 'waterfall', event: 'approval/request',
    get eventId() { privateReads++; throw new Error('PRIVATE_ID_READ') } })
  const bridge = bridgeWithItems([frame])
  const evidence = createRendererTransportEvidence()
  evidence.userLoop.open = () => { throw new Error('UNEXPECTED_INTERACTION_OBSERVER') }
  evidence.userLoop.item = () => { throw new Error('UNEXPECTED_INTERACTION_OBSERVER') }
  const transport = createHarnessTransport(bridge, evidence)
  const iterator = transport.openStream('$events', { args: {} })[Symbol.asyncIterator]()
  assert.equal((await iterator.next()).value, frame)
  assert.equal((await iterator.next()).done, true)
  const body = JSON.stringify({ payload: { args: { eventId: 'private-id', outcome: { kind: 'result', value: 'allowed-once' } } } })
  bridge.fetch = async request => {
    assert.equal(request.body, body)
    return { status: 200, contentType: 'application/json', body: '{"result":{"ok":true,"value":{}}}' }
  }
  const reply = await transport.fetch('shaco-forge://client/api/$events/result', { method: 'POST', body })
  assert.equal(reply.status, 200)
  assert.equal(privateReads, 0)
  assert.equal(evidence.userLoop.evidence.observerErrors, 0)
  assert.equal(Object.hasOwn(evidence.userLoop.evidence, 'interactions'), false)
  assert.doesNotMatch(JSON.stringify(evidence.userLoop.evidence), /private-id|allowed-once/)
})
