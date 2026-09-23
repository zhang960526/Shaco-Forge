import assert from 'node:assert/strict'
import test from 'node:test'
import { validateHostCarrierPreflight } from './host-carrier-preflight.js'

function validPreflight(): Record<string, unknown> {
  return {
    type: 'host-carrier-preflight',
    profilePluginLoaded: true,
    fetchHandlerReady: true,
    wireStreamReady: true,
    eventsRouteReady: true,
    eventsRouteProbe: {
      endpoint: '$events', opened: true, readyObserved: true, readyShapeValid: true,
      cancelled: true, iteratorClosed: true, activeStreamsAfterCleanup: 0,
      eventSubscriptionRetained: false, clientRuntimeMetricCounted: false,
      businessOperationsPerformed: 0,
    },
    stockWebStarted: false,
  }
}

test('Worker accepts complete real events route preflight evidence', () => {
  assert.equal(validateHostCarrierPreflight(validPreflight()).eventsRouteProbe.endpoint, '$events')
})

test('Worker rejects literal readiness without probe metadata', () => {
  const value = validPreflight()
  delete value.eventsRouteProbe
  assert.throws(() => validateHostCarrierPreflight(value), /preflight failed/)
})

test('Worker rejects incomplete or fake events probe fields', async t => {
  const invalidValues = [
    ['endpoint', '$fake'], ['opened', false], ['readyObserved', false], ['readyShapeValid', false],
    ['cancelled', false], ['iteratorClosed', false], ['activeStreamsAfterCleanup', 1],
    ['eventSubscriptionRetained', true], ['clientRuntimeMetricCounted', true],
    ['businessOperationsPerformed', 1],
  ] as const
  for (const [field, replacement] of invalidValues) {
    await t.test(field, () => {
      const value = validPreflight()
      const probe = value.eventsRouteProbe as Record<string, unknown>
      probe[field] = replacement
      assert.throws(() => validateHostCarrierPreflight(value), /evidence failed/)
    })
  }
})

test('CARRIER_READY publication remains withheld when events evidence fails', () => {
  const published: unknown[] = []
  const publishCarrierReady = (value: unknown): void => {
    const host = validateHostCarrierPreflight(value)
    published.push({ type: 'carrier-ready', host })
  }
  const value = validPreflight()
  ;(value.eventsRouteProbe as Record<string, unknown>).readyShapeValid = false
  assert.throws(() => publishCarrierReady(value), /evidence failed/)
  assert.equal(published.length, 0)
})
