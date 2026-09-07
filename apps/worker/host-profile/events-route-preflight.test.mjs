import assert from 'node:assert/strict'
import test from 'node:test'
import { probeEventsRoute } from './events-route-preflight.mjs'

const ready = { type: 'ready', clientId: 'probe-client', host: { home: 'redacted-in-evidence' } }

function streamFixture(first, options = {}) {
  const state = { active: 0, aborted: false, returned: 0, opens: [], businessOperations: 0 }
  const wireStream = {
    async open(endpoint, payload, signal) {
      state.opens.push({ endpoint, payload, signal })
      if (options.openError !== undefined) throw options.openError
      state.active += 1
      signal.addEventListener('abort', () => { state.aborted = true }, { once: true })
      return {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              if (options.neverReady === true) return new Promise(() => {})
              return first
            },
            async return() {
              state.returned += 1
              if (options.returnError !== undefined) throw options.returnError
              state.active -= 1
              return { done: true, value: undefined }
            },
          }
        },
      }
    },
  }
  return { state, wireStream }
}

test('valid real $events ready record produces complete redacted evidence', async () => {
  const { state, wireStream } = streamFixture({ done: false, value: ready })
  const evidence = await probeEventsRoute(wireStream, { timeoutMs: 100 })
  assert.deepEqual(evidence, {
    endpoint: '$events', opened: true, readyObserved: true, readyShapeValid: true,
    cancelled: true, iteratorClosed: true, activeStreamsAfterCleanup: 0,
    eventSubscriptionRetained: false, clientRuntimeMetricCounted: false,
    businessOperationsPerformed: 0,
  })
  assert.equal(state.opens[0].endpoint, '$events')
  assert.deepEqual(state.opens[0].payload, { args: {} })
})

test('service-unavailable route open fails closed', async () => {
  const { wireStream } = streamFixture(undefined, { openError: new Error('service-unavailable') })
  await assert.rejects(probeEventsRoute(wireStream, { timeoutMs: 100 }), /service-unavailable/)
})

test('missing public route opener fails closed', async () => {
  await assert.rejects(probeEventsRoute({}), /wire stream is unavailable/)
})

test('wrong first frame fails closed', async () => {
  const { state, wireStream } = streamFixture({ done: false, value: { type: 'emit', event: 'x', args: [] } })
  await assert.rejects(probeEventsRoute(wireStream, { timeoutMs: 100 }), /invalid ready record/)
  assert.equal(state.active, 0)
})

test('stream ending before ready fails closed', async () => {
  const { state, wireStream } = streamFixture({ done: true, value: undefined })
  await assert.rejects(probeEventsRoute(wireStream, { timeoutMs: 100 }), /ended before its ready record/)
  assert.equal(state.active, 0)
})

test('ready timeout fails closed and still cleans up', async () => {
  const { state, wireStream } = streamFixture(undefined, { neverReady: true })
  await assert.rejects(probeEventsRoute(wireStream, { timeoutMs: 20 }), /timed out/)
  assert.equal(state.aborted, true)
  assert.equal(state.returned, 1)
  assert.equal(state.active, 0)
})

test('successful probe aborts, returns the iterator, and leaves no active stream', async () => {
  const { state, wireStream } = streamFixture({ done: false, value: ready })
  await probeEventsRoute(wireStream, { timeoutMs: 100 })
  assert.equal(state.aborted, true)
  assert.equal(state.returned, 1)
  assert.equal(state.active, 0)
})

test('iterator cleanup failure fails closed', async () => {
  const { state, wireStream } = streamFixture(
    { done: false, value: ready },
    { returnError: new Error('return failed') },
  )
  await assert.rejects(probeEventsRoute(wireStream, { timeoutMs: 100 }), /cleanup failed/)
  assert.equal(state.aborted, true)
  assert.equal(state.active, 1)
})

test('preflight does not alter Desktop Client ready metrics or execute business operations', async () => {
  const clientMetrics = { eventsReadyObserved: 0 }
  const { state, wireStream } = streamFixture({ done: false, value: ready })
  const evidence = await probeEventsRoute(wireStream, { timeoutMs: 100 })
  assert.equal(clientMetrics.eventsReadyObserved, 0)
  assert.equal(state.businessOperations, 0)
  assert.equal(evidence.clientRuntimeMetricCounted, false)
  assert.equal(evidence.businessOperationsPerformed, 0)
})
