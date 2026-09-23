const EVENTS_ENDPOINT = '$events'
const EVENTS_PAYLOAD = Object.freeze({ args: Object.freeze({}) })
const DEFAULT_TIMEOUT_MS = 1_500
const CLEANUP_TIMEOUT_MS = 500

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(value, expected) {
  const keys = Reflect.ownKeys(value)
  return keys.length === expected.length && expected.every(key => Object.hasOwn(value, key))
}

function isReadyRecord(value) {
  return isRecord(value)
    && hasExactKeys(value, ['type', 'clientId', 'host'])
    && value.type === 'ready'
    && typeof value.clientId === 'string'
    && value.clientId.length > 0
    && isRecord(value.host)
    && hasExactKeys(value.host, ['home'])
    && typeof value.host.home === 'string'
}

function bounded(promise, timeoutMs, description) {
  let timeout
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`${description} timed out`)), timeoutMs)
    }),
  ]).finally(() => clearTimeout(timeout))
}

/**
 * Open the public Gateway `$events` wire stream and prove its real opening frame.
 * The returned evidence contains no Host identity, Client identity, or carrier secret.
 */
export async function probeEventsRoute(wireStream, options = {}) {
  if (typeof wireStream?.open !== 'function') throw new Error('$events preflight wire stream is unavailable')
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError('$events preflight timeout is invalid')

  const controller = new AbortController()
  const deadline = Date.now() + timeoutMs
  let iterator
  let opened = false
  let readyObserved = false
  let readyShapeValid = false
  let iteratorClosed = false
  let activeStreams = 0
  let primaryError
  let cleanupError

  const withinDeadline = (promise, description) => {
    const remaining = deadline - Date.now()
    if (remaining <= 0) return Promise.reject(new Error(`${description} timed out`))
    return bounded(promise, remaining, description)
  }

  try {
    const source = await withinDeadline(
      wireStream.open(EVENTS_ENDPOINT, EVENTS_PAYLOAD, controller.signal),
      '$events route open',
    )
    opened = true
    if (source === null || typeof source !== 'object' || typeof source[Symbol.asyncIterator] !== 'function') {
      throw new Error('$events route did not return an AsyncIterable')
    }
    iterator = source[Symbol.asyncIterator]()
    if (iterator === null || typeof iterator !== 'object' || typeof iterator.next !== 'function') {
      throw new Error('$events route did not return an AsyncIterator')
    }
    activeStreams = 1
    const first = await withinDeadline(iterator.next(), '$events ready record')
    if (first === null || typeof first !== 'object' || first.done === true) {
      throw new Error('$events stream ended before its ready record')
    }
    readyObserved = true
    readyShapeValid = isReadyRecord(first.value)
    if (!readyShapeValid) throw new Error('$events stream returned an invalid ready record')
  } catch (error) {
    primaryError = error
  } finally {
    controller.abort(new Error('$events preflight completed'))
    if (iterator !== undefined) {
      if (typeof iterator.return !== 'function') {
        cleanupError = new Error('$events preflight iterator cannot be closed')
      } else {
        try {
          await bounded(iterator.return(), Math.min(timeoutMs, CLEANUP_TIMEOUT_MS), '$events iterator cleanup')
          iteratorClosed = true
          activeStreams = 0
        } catch (error) {
          cleanupError = error
        }
      }
    }
  }

  if (cleanupError !== undefined) {
    throw new Error('$events preflight cleanup failed', { cause: cleanupError })
  }
  if (primaryError !== undefined) throw primaryError
  if (!opened || !readyObserved || !readyShapeValid || !controller.signal.aborted || !iteratorClosed || activeStreams !== 0) {
    throw new Error('$events preflight did not produce complete readiness evidence')
  }

  return {
    endpoint: EVENTS_ENDPOINT,
    opened: true,
    readyObserved: true,
    readyShapeValid: true,
    cancelled: true,
    iteratorClosed: true,
    activeStreamsAfterCleanup: 0,
    eventSubscriptionRetained: false,
    clientRuntimeMetricCounted: false,
    businessOperationsPerformed: 0,
  }
}
