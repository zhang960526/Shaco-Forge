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
