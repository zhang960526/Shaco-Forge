import { isRecord } from '@shaco-forge/contracts'

export interface EventsRouteProbeEvidence {
  endpoint: '$events'
  opened: true
  readyObserved: true
  readyShapeValid: true
  cancelled: true
  iteratorClosed: true
  activeStreamsAfterCleanup: 0
  eventSubscriptionRetained: false
  clientRuntimeMetricCounted: false
  businessOperationsPerformed: 0
}

export interface HostCarrierPreflight extends Record<string, unknown> {
  type: 'host-carrier-preflight'
  profilePluginLoaded: true
  fetchHandlerReady: true
  wireStreamReady: true
  eventsRouteReady: true
  eventsRouteProbe: EventsRouteProbeEvidence
  stockWebStarted: false
}

export function validateHostCarrierPreflight(value: unknown): HostCarrierPreflight {
  if (!isRecord(value)
    || value.type !== 'host-carrier-preflight'
    || value.profilePluginLoaded !== true
    || value.fetchHandlerReady !== true
    || value.wireStreamReady !== true
    || value.eventsRouteReady !== true
    || value.stockWebStarted !== false
    || !isRecord(value.eventsRouteProbe)) {
    throw new Error('Host carrier preflight failed')
  }
  const probe = value.eventsRouteProbe
  if (probe.endpoint !== '$events'
    || probe.opened !== true
    || probe.readyObserved !== true
    || probe.readyShapeValid !== true
    || probe.cancelled !== true
    || probe.iteratorClosed !== true
    || probe.activeStreamsAfterCleanup !== 0
    || probe.eventSubscriptionRetained !== false
    || probe.clientRuntimeMetricCounted !== false
    || probe.businessOperationsPerformed !== 0) {
    throw new Error('Host $events route preflight evidence failed')
  }
  return value as HostCarrierPreflight
}
