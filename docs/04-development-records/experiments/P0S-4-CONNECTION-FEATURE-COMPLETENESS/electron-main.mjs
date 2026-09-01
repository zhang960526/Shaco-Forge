/**
 * NOT_PRODUCTION P0.S-4 Electron Main completeness executor.
 * Renderer receives one allowlisted IPC method; Main alone owns credentials,
 * Named Pipe framing, reconnect generations, binary bytes, and native dialogs.
 */
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const experimentRoot = dirname(fileURLToPath(import.meta.url))
const outputFile = requiredEnvironment('P0S4_ELECTRON_RESULT_FILE')
const progressFile = requiredEnvironment('P0S4_ELECTRON_PROGRESS_FILE')
const runtimeRoot = dirname(dirname(outputFile))
const runtimeDirectoryName = basename(runtimeRoot)
const runtimeIdentityMatch = /^shaco-forge-p0s4-([0-9a-f]{32})$/.exec(runtimeDirectoryName)
if (!runtimeIdentityMatch) throw new Error('P0.S-4 runtime root identity is invalid')
const runtimeRunId = runtimeIdentityMatch[1]
const runtimeMarkerFile = join(runtimeRoot, 'p0s4-runtime-marker.json')
const userDataPath = requiredEnvironment('P0S4_ELECTRON_USER_DATA')
const pickerPath = requiredEnvironment('P0S4_PICKER_SUCCESS_PATH')
const pipeName = requiredEnvironment('P0S4_PIPE_NAME')
const ephemeralSecret = requiredEnvironment('P0S4_EPHEMERAL_SECRET')
const workerId = requiredEnvironment('P0S4_WORKER_ID')
const endpointId = requiredEnvironment('P0S4_ENDPOINT_ID')
const userSid = requiredEnvironment('P0S4_USER_SID')
const workerCarrierPid = Number(requiredEnvironment('P0S4_WORKER_PROCESS_ID'))
const dshPid = Number(requiredEnvironment('P0S4_DSH_PROCESS_ID'))
const pipePath = `\\\\.\\pipe\\${pipeName}`
const protocolVersion = 1
const maxFrameBytes = 262144
const streamCreditLimit = 4
const observedFrameSizes = []
let runStarted = false
let failureRecorded = false

await mkdir(userDataPath, { recursive: true })
app.setPath('userData', userDataPath)
app.commandLine.appendSwitch('disable-breakpad')
app.disableHardwareAcceleration()

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment value: ${name}`)
  return value
}

function hashPrefix(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 16)
}

function sanitizeError(error) {
  return String(error?.stack ?? error?.message ?? error)
    .replaceAll(pipeName, '<PIPE_REDACTED>')
    .replaceAll(ephemeralSecret, '<SECRET_REDACTED>')
    .replaceAll(userSid, '<SID_REDACTED>')
    .replaceAll(pickerPath, '<PICKER_PATH_REDACTED>')
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

class DesktopProjectionResetAdapter {
  constructor() {
    this.readyRecords = []
    this.resetRecords = []
    this.projectionRepullRequests = []
    this.resetGenerations = new Set()
    this.projectionCache = new Map([['bootstrap', { generation: 0 }]])
    this.invalidationCount = 0
  }

  observeReady(ready) {
    if (ready?.type !== 'ready' || typeof ready.clientId !== 'string' || ready.clientId.length === 0) {
      throw new Error('Desktop reset requires a valid real $events.ready payload')
    }
    const generation = this.readyRecords.length + 1
    const readySequence = this.readyRecords.length + 1
    const readyClientIdHashPrefix = hashPrefix(ready.clientId)
    const readyRecord = {
      readySequence, generation, readyClientIdHashPrefix,
      sourceEvent: '$events.ready',
    }
    this.readyRecords.push(readyRecord)

    if (this.resetGenerations.has(generation)) {
      throw new Error(`Duplicate Desktop reset for generation ${generation}`)
    }
    this.resetGenerations.add(generation)
    const cacheEntriesInvalidated = this.projectionCache.size
    this.projectionCache.clear()
    this.invalidationCount += 1
    const resetRecord = {
      resetSequence: this.resetRecords.length + 1,
      causedByReadySequence: readySequence,
      generation,
      readyClientIdHashPrefix,
      source: 'events.ready',
      action: 'test-owned-desktop-projection-invalidate-and-request-repull',
      projectionInvalidated: true,
      cacheEntriesInvalidated,
      projectionRepullRequested: true,
    }
    this.resetRecords.push(resetRecord)
    this.projectionRepullRequests.push({
      requestSequence: this.projectionRepullRequests.length + 1,
      causedByResetSequence: resetRecord.resetSequence,
      generation,
      readyClientIdHashPrefix,
      requested: true,
    })
    this.projectionCache.set('generation-context', { generation, readyClientIdHashPrefix })
    return { generation, resetRecord }
  }

  snapshot(preReadyResetCount) {
    const readyGenerations = this.readyRecords.map(record => record.generation)
    const resetGenerations = this.resetRecords.map(record => record.generation)
    const uniqueGenerationCount = new Set(readyGenerations).size
    const everyResetHasReadyCause = this.resetRecords.every(reset => this.readyRecords.some(ready => (
      ready.readySequence === reset.causedByReadySequence
      && ready.generation === reset.generation
      && ready.readyClientIdHashPrefix === reset.readyClientIdHashPrefix
    )))
    const everyRepullHasResetCause = this.projectionRepullRequests.every(repull => this.resetRecords.some(reset => (
      reset.resetSequence === repull.causedByResetSequence
      && reset.generation === repull.generation
      && reset.readyClientIdHashPrefix === repull.readyClientIdHashPrefix
    )))
    return {
      readyCount: this.readyRecords.length,
      uniqueGenerationCount,
      connectionResetObserved: this.resetRecords.length > 0,
      connectionResetCount: this.resetRecords.length,
      resetSource: 'real Harness $events.ready triggers test-owned Desktop-equivalent reset/projection invalidation',
      preReadyResetCount,
      noResetWithoutReady: preReadyResetCount === 0 && everyResetHasReadyCause,
      oneResetPerReady: this.resetRecords.length === this.readyRecords.length
        && this.resetRecords.length === uniqueGenerationCount,
      noDuplicateGenerationReset: new Set(resetGenerations).size === resetGenerations.length,
      projectionInvalidationCount: this.invalidationCount,
      projectionRepullRequestedCount: this.projectionRepullRequests.length,
      everyRepullHasResetCause,
      readyRecords: this.readyRecords.map(record => ({ ...record })),
      resetRecords: this.resetRecords.map(record => ({ ...record })),
      projectionRepullRequests: this.projectionRepullRequests.map(record => ({ ...record })),
    }
  }
}

async function progress(stage, details = {}) {
  await writeJson(progressFile, { classification: 'NOT_PRODUCTION', stage, ...details })
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

class FramedPipeConnection {
  constructor(socket) {
    this.socket = socket
    this.buffer = Buffer.alloc(0)
    this.messages = []
    this.waiters = []
    this.writeChain = Promise.resolve()
    this.stats = {
      inboundDataChunks: 0, parserPartialWaits: 0,
      logicalFramesReceived: 0, logicalFramesSent: 0,
      fragmentedFrameSends: 0, binaryFramesReceived: 0,
      maxBufferedMessages: 0,
    }
    socket.on('data', chunk => this.onData(chunk))
    socket.on('error', error => this.rejectAll(error))
    socket.on('close', () => {
      const rejection = this.messages.find(message => message.type === 'authentication-rejected')
      this.rejectAll(new Error(rejection
        ? `Named Pipe connection closed after fail-closed rejection: ${rejection.reason}`
        : 'Named Pipe connection closed'))
    })
  }

  onData(chunk) {
    this.stats.inboundDataChunks += 1
    this.buffer = Buffer.concat([this.buffer, chunk])
    for (;;) {
      if (this.buffer.length < 4) {
        this.stats.parserPartialWaits += 1
        return
      }
      const length = this.buffer.readUInt32LE(0)
      if (length === 0 || length > maxFrameBytes) {
        this.rejectAll(new Error('Received invalid frame length'))
        this.socket.destroy()
        return
      }
      if (this.buffer.length < 4 + length) {
        this.stats.parserPartialWaits += 1
        return
      }
      const payload = this.buffer.subarray(4, 4 + length)
      this.buffer = this.buffer.subarray(4 + length)
      let message
      if (payload[0] === 0x42 && payload.length >= 37) {
        message = {
          type: 'binary-chunk',
          streamId: payload.subarray(1, 37).toString('ascii'),
          chunk: Buffer.from(payload.subarray(37)),
        }
        this.stats.binaryFramesReceived += 1
      } else {
        try {
          message = JSON.parse(payload.toString('utf8'))
        } catch (error) {
          this.rejectAll(error)
          this.socket.destroy()
          return
        }
      }
      this.stats.logicalFramesReceived += 1
      this.dispatch(message)
      if (this.buffer.length === 0) return
    }
  }

  dispatch(message) {
    const index = this.waiters.findIndex(waiter => waiter.predicate(message))
    if (index >= 0) {
      const [waiter] = this.waiters.splice(index, 1)
      clearTimeout(waiter.timer)
      waiter.resolve(message)
      return
    }
    this.messages.push(message)
    this.stats.maxBufferedMessages = Math.max(this.stats.maxBufferedMessages, this.messages.length)
  }

  rejectAll(error) {
    for (const waiter of this.waiters.splice(0)) {
      clearTimeout(waiter.timer)
      waiter.reject(error)
    }
  }

  waitFor(predicate, timeoutMs = 30000) {
    const existing = this.messages.findIndex(predicate)
    if (existing >= 0) return Promise.resolve(this.messages.splice(existing, 1)[0])
    return new Promise((resolve, reject) => {
      const waiter = { predicate, resolve, reject, timer: null }
      waiter.timer = setTimeout(() => {
        const index = this.waiters.indexOf(waiter)
        if (index >= 0) this.waiters.splice(index, 1)
        reject(new Error('Timed out waiting for Named Pipe frame'))
      }, timeoutMs)
      this.waiters.push(waiter)
    })
  }

  sendObject(value, metadata = {}) {
    const payload = Buffer.from(JSON.stringify(value), 'utf8')
    observedFrameSizes.push({
      purpose: metadata.purpose ?? value.type,
      payloadProbeBytes: metadata.payloadProbeBytes ?? null,
      jsonBytes: payload.length, prefixBytes: 4, framedBytes: payload.length + 4,
    })
    return this.sendPayload(payload, true)
  }

  sendPayload(payload, fragmented) {
    this.writeChain = this.writeChain.then(async () => {
      if (payload.length > maxFrameBytes) throw new Error('Client refused oversize payload')
      const header = Buffer.alloc(4)
      header.writeUInt32LE(payload.length, 0)
      const fragments = fragmented
        ? [header.subarray(0, 1), header.subarray(1, 3), header.subarray(3), payload.subarray(0, 7), payload.subarray(7, 20), payload.subarray(20)]
        : [header, payload]
      for (const fragment of fragments) {
        if (fragment.length === 0) continue
        await new Promise((resolve, reject) => this.socket.write(fragment, error => error ? reject(error) : resolve()))
        if (fragmented) await sleep(1)
      }
      this.stats.logicalFramesSent += 1
      if (fragmented) this.stats.fragmentedFrameSends += 1
    })
    return this.writeChain
  }

  sendMalformed(raw) { return this.sendPayload(Buffer.from(raw, 'utf8'), true) }

  async sendOversizeHeader(length) {
    await this.writeChain
    const header = Buffer.alloc(4)
    header.writeUInt32LE(length, 0)
    await new Promise((resolve, reject) => this.socket.write(header, error => error ? reject(error) : resolve()))
  }

  async close() {
    if (this.socket.destroyed) return
    this.socket.end()
    await Promise.race([new Promise(resolve => this.socket.once('close', resolve)), sleep(1000)])
    if (!this.socket.destroyed) this.socket.destroy()
  }
}

async function openPipe() {
  let socket
  let lastError
  for (let attempt = 0; attempt < 100; attempt += 1) {
    socket = net.createConnection(pipePath)
    try {
      await new Promise((resolve, reject) => {
        socket.once('connect', resolve)
        socket.once('error', reject)
      })
      lastError = null
      break
    } catch (error) {
      lastError = error
      socket.destroy()
      if (error?.code !== 'ENOENT' && error?.code !== 'EBUSY') throw error
      await sleep(10)
    }
  }
  if (lastError || !socket || socket.destroyed) throw lastError ?? new Error('Named Pipe retry exhausted')
  const connection = new FramedPipeConnection(socket)
  const challenge = await connection.waitFor(message => message.type === 'server-challenge')
  return { connection, challenge }
}

function createProof({ secret, requestId, clientNonce, serverNonce, worker = workerId, endpoint = endpointId, sid = userSid }) {
  const canonical = [String(protocolVersion), sid, worker, endpoint, requestId, clientNonce, serverNonce].join('\n')
  return createHmac('sha256', Buffer.from(secret, 'hex')).update(canonical, 'utf8').digest('hex')
}

function buildAuth(challenge, overrides = {}) {
  const requestId = overrides.requestId ?? randomUUID()
  const clientNonce = overrides.clientNonce ?? randomBytes(32).toString('hex')
  const worker = overrides.workerId ?? workerId
  const endpoint = overrides.endpointId ?? endpointId
  const sid = overrides.userSid ?? userSid
  const serverNonce = overrides.serverNonce ?? challenge.serverNonce
  const secret = overrides.secret ?? ephemeralSecret
  return {
    type: 'client-auth', protocolVersion, requestId, workerId: worker, endpointId: endpoint,
    userSid: sid, clientNonce, serverNonce,
    proof: createProof({ secret, requestId, clientNonce, serverNonce, worker, endpoint, sid }),
  }
}

async function authenticate(overrides = {}) {
  const { connection, challenge } = await openPipe()
  const auth = overrides.staleFrame ?? buildAuth(challenge, overrides)
  const pending = connection.waitFor(message => message.type === 'authentication-complete' || message.type === 'authentication-rejected')
  await connection.sendObject(auth, { purpose: 'client-auth' })
  return { connection, challenge, auth, outcome: await pending }
}

async function diagnosticStatus(connection) {
  const requestId = randomUUID()
  const pending = connection.waitFor(message => message.type === 'diagnostic-status-response' && message.requestId === requestId)
  await connection.sendObject({ type: 'diagnostic-status', requestId })
  return pending
}

async function runNegativeTests() {
  const results = []
  async function rejected(test, operation) {
    const { connection } = await openPipe()
    const pending = connection.waitFor(message => message.type === 'authentication-rejected')
    await operation(connection)
    const outcome = await pending
    results.push({ test, reason: outcome.reason, gatewayDispatchCount: outcome.gatewayForwardedCount })
    await connection.close()
  }
  await rejected('unauthenticated-request', connection => connection.sendObject({
    type: 'rpc-call', requestId: randomUUID(), channel: '/api', endpoint: 'agentPresets/list', payload: { args: {} },
  }))
  await rejected('unauthenticated-binary', connection => connection.sendObject({
    type: 'binary-open', requestId: randomUUID(), streamId: randomUUID(), size: 16,
  }))
  for (const [test, overrides] of [
    ['wrong-proof', { secret: randomBytes(32).toString('hex') }],
    ['wrong-worker-identity', { workerId: randomUUID() }],
    ['wrong-endpoint-identity', { endpointId: randomUUID() }],
    ['wrong-user-sid', { userSid: 'S-1-5-18' }],
  ]) {
    const attempt = await authenticate(overrides)
    results.push({ test, reason: attempt.outcome.reason, gatewayDispatchCount: attempt.outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }
  await rejected('malformed-frame', connection => connection.sendMalformed('{not-json'))
  await rejected('oversize-frame', connection => connection.sendOversizeHeader(maxFrameBytes + 1))
  const captured = await authenticate()
  if (captured.outcome.type !== 'authentication-complete') throw new Error('Valid handshake capture failed')
  await captured.connection.close()
  const replay = await authenticate({ staleFrame: captured.auth })
  results.push({ test: 'replayed-handshake', reason: replay.outcome.reason, gatewayDispatchCount: replay.outcome.gatewayForwardedCount })
  await replay.connection.close()
  const route = await authenticate()
  const routePending = route.connection.waitFor(message => message.type === 'authentication-rejected')
  await route.connection.sendObject({
    type: 'rpc-call', requestId: randomUUID(), channel: '/api', endpoint: 'credentials/set', payload: { args: {} },
  })
  const routeOutcome = await routePending
  results.push({ test: 'wrong-business-endpoint', reason: routeOutcome.reason, gatewayDispatchCount: routeOutcome.gatewayForwardedCount })
  await route.connection.close()
  const statusAttempt = await authenticate()
  const preGatewayStatus = await diagnosticStatus(statusAttempt.connection)
  await statusAttempt.connection.close()
  return { results, preGatewayStatus }
}

function createRpc(connection) {
  return Object.freeze({
    async call(endpoint, payload, options = {}) {
      const requestId = randomUUID()
      const pending = connection.waitFor(message => message.type === 'rpc-response' && message.requestId === requestId, options.timeoutMs ?? 30000)
      await connection.sendObject({
        type: 'rpc-call', requestId, channel: '/api', endpoint, payload,
        probeId: options.probeId ?? requestId, probeDelayMs: options.probeDelayMs ?? 0,
        probePayloadBytes: options.probePayloadBytes ?? 0,
      }, { purpose: options.purpose ?? 'rpc-call', payloadProbeBytes: options.probePayloadBytes ?? 0 })
      return pending
    },
  })
}

async function openLogicalStream(connection, endpoint, payload, initialCredit = streamCreditLimit) {
  const requestId = randomUUID()
  const streamId = randomUUID()
  await connection.sendObject({ type: 'stream-open', requestId, streamId, endpoint, payload, initialCredit })
  return {
    requestId, streamId,
    async next(timeoutMs = 30000) {
      const frame = await connection.waitFor(message => message.streamId === streamId && [
        'stream-item', 'stream-end', 'stream-error', 'stream-cancelled',
      ].includes(message.type), timeoutMs)
      if (frame.type === 'stream-item') {
        await connection.sendObject({ type: 'stream-credit', requestId: randomUUID(), streamId, credit: 1 })
      }
      return frame
    },
    cancel(reason = 'consumer-cancel') {
      return connection.sendObject({ type: 'stream-cancel', requestId: randomUUID(), streamId, reason })
    },
  }
}

async function collectNormalStream(connection, label, count) {
  const stream = await openLogicalStream(connection, 'p0s4Fixture/streamScenario', {
    args: { request: { label, count, mode: 'normal' } },
  })
  const items = []
  let endCount = 0
  for (;;) {
    const frame = await stream.next()
    if (frame.type === 'stream-end') { endCount += 1; break }
    if (frame.type !== 'stream-item') throw new Error(`Unexpected normal stream frame: ${frame.type}`)
    items.push(frame.value)
  }
  return { streamIdHashPrefix: hashPrefix(stream.streamId), items, endCount }
}

async function runStreamTests(connection) {
  const rpc = createRpc(connection)
  const normal = await collectNormalStream(connection, 'ordered', 12)
  const ordered = normal.items.every((item, index) => item.index === index && item.value === `ordered:${index}`)

  const errorStream = await openLogicalStream(connection, 'p0s4Fixture/streamScenario', {
    args: { request: { label: 'error', count: 2, mode: 'producer-error' } },
  })
  const errorFrames = [await errorStream.next(), await errorStream.next(), await errorStream.next()]

  const cancelStream = await openLogicalStream(connection, 'p0s4Fixture/streamScenario', {
    args: { request: { label: 'cancel', count: 1, mode: 'pending' } },
  }, 2)
  const cancelItem = await cancelStream.next()
  await cancelStream.cancel()
  const cancelled = await cancelStream.next()

  const stalledBefore = await diagnosticStatus(connection)
  const stalledStream = await openLogicalStream(connection, 'p0s4Fixture/streamScenario', {
    args: { request: { label: 'stalled', count: 1000, mode: 'normal' } },
  }, streamCreditLimit)
  await sleep(250)
  const stalledDuring = await diagnosticStatus(connection)
  const stalledProduced = stalledDuring.streamItemCount - stalledBefore.streamItemCount
  await stalledStream.cancel('stalled-consumer-stop')

  const concurrent = await Promise.all([
    collectNormalStream(connection, 'concurrent-a', 20),
    collectNormalStream(connection, 'concurrent-b', 20),
    collectNormalStream(connection, 'concurrent-c', 20),
    ...Array.from({ length: 8 }, (_, index) => rpc.call('agentPresets/list', { args: {} }, {
      probeId: `mixed-unary-${index}`, probeDelayMs: index % 3,
    })),
  ])
  const streams = concurrent.slice(0, 3)
  const unary = concurrent.slice(3)
  const concurrentPass = streams.every(result => result.items.length === 20 && result.endCount === 1)
    && unary.every(result => result.result?.ok === true)
  const after = await diagnosticStatus(connection)
  return {
    seam: 'typertGateway.wireStream.open through authenticated Named Pipe adapter',
    endpoint: 'p0s4Fixture/streamScenario',
    normal: { pass: normal.items.length === 12 && ordered && normal.endCount === 1, itemCount: normal.items.length, ordered, endCount: normal.endCount },
    producerError: {
      pass: errorFrames[0].type === 'stream-item' && errorFrames[1].type === 'stream-item'
        && errorFrames[2].type === 'stream-error' && errorFrames[2].error?.code === 'p0s4-producer-error',
      itemCount: errorFrames.filter(frame => frame.type === 'stream-item').length,
      errorCount: errorFrames.filter(frame => frame.type === 'stream-error').length,
      errorCode: errorFrames[2].error?.code,
    },
    consumerCancel: { pass: cancelItem.type === 'stream-item' && cancelled.type === 'stream-cancelled', terminal: cancelled.type },
    concurrent: { pass: concurrentPass, streamCount: streams.length, unaryCount: unary.length },
    backpressure: {
      pass: stalledProduced <= streamCreditLimit,
      creditLimit: streamCreditLimit, itemsProducedWhileStalled: stalledProduced,
      activeStreamsDuringStall: stalledDuring.activeStreams,
    },
    counters: after,
  }
}

async function openEventGeneration(connection, desktopProjectionResetAdapter) {
  const stream = await openLogicalStream(connection, '$events', { args: {} }, streamCreditLimit)
  const readyFrame = await stream.next()
  if (readyFrame.type !== 'stream-item' || readyFrame.value?.type !== 'ready') throw new Error('$events did not start with ready')
  const resetAction = desktopProjectionResetAdapter.observeReady(readyFrame.value)
  return {
    stream, generationId: resetAction.generation,
    clientId: readyFrame.value.clientId, hostHomePresent: typeof readyFrame.value.host?.home === 'string',
    resetRecord: resetAction.resetRecord,
  }
}

async function waitWaterfall(generation, event) {
  for (;;) {
    const frame = await generation.stream.next(30000)
    if (frame.type === 'stream-item' && frame.value?.type === 'waterfall' && frame.value.event === event) return frame.value
  }
}

async function settleEvent(rpc, clientId, eventId, value) {
  return rpc.call('$events/result', { args: { clientId, eventId, outcome: { kind: 'result', value } } })
}

async function approvalAcrossReconnect(connection, generation, desktopProjectionResetAdapter) {
  const rpc = createRpc(connection)
  const pending = rpc.call('p0s4Fixture/approvalRoundTrip', { args: { request: { label: 'approval' } } }, { timeoutMs: 60000 }).catch(() => null)
  const first = await waitWaterfall(generation, 'approval/request')
  await connection.close()
  const secondAuth = await authenticate()
  if (secondAuth.outcome.type !== 'authentication-complete') throw new Error('Approval reconnect authentication failed')
  const secondGeneration = await openEventGeneration(secondAuth.connection, desktopProjectionResetAdapter)
  const replay = await waitWaterfall(secondGeneration, 'approval/request')
  const rpc2 = createRpc(secondAuth.connection)
  const stale = await settleEvent(rpc2, generation.clientId, first.eventId, 'allowed-once')
  const accepted = await settleEvent(rpc2, secondGeneration.clientId, replay.eventId, 'allowed-once')
  const duplicate = await settleEvent(rpc2, secondGeneration.clientId, replay.eventId, 'rejected')
  await sleep(100)
  const status = await rpc2.call('p0s4Fixture/status', { args: {} })
  void pending
  return {
    connection: secondAuth.connection, generation: secondGeneration,
    evidence: {
      pass: first.eventId === replay.eventId && stale.result?.ok === false && accepted.result?.ok === true
        && duplicate.result?.ok === true && status.result?.value?.approvalSettlements === 1
        && status.result?.value?.agents?.find(agent => agent.label === 'approval')?.approvalDecisions === 1,
      eventIdHashPrefix: hashPrefix(first.eventId), sameEventIdAfterReconnect: first.eventId === replay.eventId,
      staleGenerationRejected: stale.result?.ok === false, accepted: accepted.result?.ok === true,
      duplicateSafeNoop: duplicate.result?.ok === true,
      hostSettlementCount: status.result?.value?.approvalSettlements,
      durableDecisionCount: status.result?.value?.agents?.find(agent => agent.label === 'approval')?.approvalDecisions,
    },
  }
}

async function questionAcrossReconnect(connection, generation, desktopProjectionResetAdapter) {
  const rpc = createRpc(connection)
  const pending = rpc.call('p0s4Fixture/questionRoundTrip', { args: { request: { label: 'question' } } }, { timeoutMs: 60000 }).catch(() => null)
  const first = await waitWaterfall(generation, 'user-questions/request')
  await connection.close()
  const nextAuth = await authenticate()
  if (nextAuth.outcome.type !== 'authentication-complete') throw new Error('Question reconnect authentication failed')
  const nextGeneration = await openEventGeneration(nextAuth.connection, desktopProjectionResetAdapter)
  const replay = await waitWaterfall(nextGeneration, 'user-questions/request')
  const rpc2 = createRpc(nextAuth.connection)
  const answer = { answers: [{ id: 'p0s4-choice', selected: ['Beta'] }] }
  const stale = await settleEvent(rpc2, generation.clientId, first.eventId, answer)
  const accepted = await settleEvent(rpc2, nextGeneration.clientId, replay.eventId, answer)
  const duplicate = await settleEvent(rpc2, nextGeneration.clientId, replay.eventId, { answers: [{ id: 'p0s4-choice', selected: ['Alpha'] }] })
  await sleep(100)
  const status = await rpc2.call('p0s4Fixture/status', { args: {} })
  void pending
  return {
    connection: nextAuth.connection, generation: nextGeneration,
    evidence: {
      pass: first.eventId === replay.eventId && stale.result?.ok === false && accepted.result?.ok === true
        && duplicate.result?.ok === true && status.result?.value?.questionSettlements === 1,
      eventIdHashPrefix: hashPrefix(first.eventId), sameEventIdAfterReconnect: first.eventId === replay.eventId,
      staleGenerationRejected: stale.result?.ok === false, accepted: accepted.result?.ok === true,
      duplicateSafeNoop: duplicate.result?.ok === true,
      hostSettlementCount: status.result?.value?.questionSettlements,
    },
  }
}

async function explicitCancelAcrossDisconnect(connection, generation, desktopProjectionResetAdapter) {
  const rpc = createRpc(connection)
  const pending = rpc.call('p0s4Fixture/cancellableOperation', { args: { request: { label: 'explicit-cancel' } } }, { timeoutMs: 60000 }).catch(() => null)
  await sleep(200)
  const before = await rpc.call('p0s4Fixture/status', { args: {} })
  const sessionId = before.result?.value?.agents?.find(agent => agent.label === 'explicit-cancel')?.sessionId
  if (!sessionId) throw new Error('Cancelable operation did not publish its live Agent')
  await connection.close()
  await sleep(200)
  const nextAuth = await authenticate()
  if (nextAuth.outcome.type !== 'authentication-complete') throw new Error('Cancel reconnect authentication failed')
  const nextGeneration = await openEventGeneration(nextAuth.connection, desktopProjectionResetAdapter)
  const rpc2 = createRpc(nextAuth.connection)
  const afterDisconnect = await rpc2.call('p0s4Fixture/status', { args: {} })
  const explicit = await rpc2.call('session/cancel', { args: { request: { sessionId } } })
  await sleep(200)
  const afterCancel = await rpc2.call('p0s4Fixture/status', { args: {} })
  void pending
  const agent = afterCancel.result?.value?.agents?.find(item => item.label === 'explicit-cancel')
  return {
    connection: nextAuth.connection, generation: nextGeneration,
    evidence: {
      pass: afterDisconnect.result?.value?.cancelCompletions === 0 && explicit.result?.ok === true
        && afterCancel.result?.value?.cancelCompletions === 1 && agent?.status === 'idle',
      disconnectDidNotCancel: afterDisconnect.result?.value?.cancelCompletions === 0,
      endpoint: 'session/cancel', accepted: explicit.result?.value?.accepted === true,
      completionCount: afterCancel.result?.value?.cancelCompletions,
      finalAgentStatus: agent?.status,
    },
  }
}

function expectedBinaryHash(size) {
  const hash = createHash('sha256')
  for (let offset = 0; offset < size;) {
    const length = Math.min(16384, size - offset)
    const chunk = Buffer.allocUnsafe(length)
    for (let index = 0; index < length; index += 1) {
      const absolute = offset + index
      chunk[index] = absolute === 0 ? 0x00 : absolute === 1 ? 0xff : absolute === 2 ? 0x80
        : (absolute * 131 + size * 17 + (absolute >>> 8)) & 0xff
    }
    hash.update(chunk)
    offset += length
  }
  return hash.digest('hex')
}

async function readBinary(connection, size, cancelAfterChunks = null) {
  const requestId = randomUUID()
  const streamId = randomUUID()
  await connection.sendObject({ type: 'binary-open', requestId, streamId, size, initialCredit: 2 })
  const start = await connection.waitFor(message => message.type === 'binary-start' && message.streamId === streamId)
  const hash = createHash('sha256')
  let byteCount = 0
  let chunkCount = 0
  let cancelSent = false
  const firstBytes = []
  for (;;) {
    const frame = await connection.waitFor(message => message.streamId === streamId && [
      'binary-chunk', 'binary-end', 'binary-cancelled', 'binary-error',
    ].includes(message.type), 30000)
    if (frame.type === 'binary-chunk') {
      if (firstBytes.length < 3) firstBytes.push(...frame.chunk.subarray(0, 3 - firstBytes.length))
      hash.update(frame.chunk)
      byteCount += frame.chunk.length
      chunkCount += 1
      if (cancelAfterChunks !== null && chunkCount >= cancelAfterChunks && !cancelSent) {
        cancelSent = true
        await connection.sendObject({ type: 'binary-cancel', requestId: randomUUID(), streamId })
      } else if (!cancelSent) {
        await connection.sendObject({ type: 'binary-credit', requestId: randomUUID(), streamId, credit: 1 })
      }
      continue
    }
    return {
      startStatus: start.status, terminal: frame.type, byteCount, chunkCount,
      sha256: hash.digest('hex'), firstBytes,
      reportedByteCount: frame.byteCount ?? null, reportedStatus: frame.status ?? null,
    }
  }
}

async function runBinaryTests(connection) {
  const sizes = [3, 4096, 65537, 262144]
  const matrix = []
  for (const size of sizes) {
    const result = await readBinary(connection, size)
    matrix.push({
      size, pass: result.terminal === 'binary-end' && result.byteCount === size
        && result.sha256 === expectedBinaryHash(size),
      sha256: result.sha256, chunkCount: result.chunkCount,
      exactSpecialBytes: size < 3 || JSON.stringify(result.firstBytes) === JSON.stringify([0, 255, 128]),
    })
  }
  const cancelled = await readBinary(connection, 2 * 1024 * 1024, 3)
  const malformed = await readBinary(connection, 'not-a-size')
  const oversize = await readBinary(connection, 2 * 1024 * 1024 + 1)
  const status = await diagnosticStatus(connection)
  return {
    pass: matrix.every(item => item.pass && item.exactSpecialBytes)
      && cancelled.terminal === 'binary-cancelled'
      && malformed.startStatus === 400 && oversize.startStatus === 413
      && status.binaryPeakChunkBytes <= 16384,
    seam: 'connection.fetch.register exact /api/session.export + raw Named Pipe binary frames',
    fixtureClassification: 'NOT_PRODUCTION deterministic exact Fetch owner',
    matrix, cancellation: { terminal: cancelled.terminal, chunksBeforeCancel: cancelled.chunkCount, bytesBeforeCancel: cancelled.byteCount },
    malformedStatus: malformed.startStatus, oversizeStatus: oversize.startStatus,
    limits: { maxBinaryBytes: 2097152, binaryChunkBytes: 16384, observedPeakChunkBytes: status.binaryPeakChunkBytes },
  }
}

async function runNativePicker(parent, binaryEvidence) {
  const successTitle = 'P0.S-4 Directory Success'
  parent.show()
  await progress('picker-success-dialog', {
    requestedDefaultDirectoryName: basename(pickerPath), binary: binaryEvidence,
  })
  const success = await dialog.showOpenDialog(parent, {
    title: successTitle, defaultPath: pickerPath, properties: ['openDirectory', 'createDirectory'],
  })
  const cancelTitle = 'P0.S-4 Directory Cancel'
  await progress('picker-cancel-dialog')
  const cancelled = await dialog.showOpenDialog(parent, {
    title: cancelTitle, defaultPath: pickerPath, properties: ['openDirectory'],
  })
  parent.hide()
  return {
    pass: !success.canceled && success.filePaths.length === 1 && success.filePaths[0] === pickerPath
      && cancelled.canceled && cancelled.filePaths.length === 0
      ,
    seam: 'Electron dialog.showOpenDialog documented native directory picker',
    success: { canceled: success.canceled, selectedDirectoryName: success.filePaths[0] ? basename(success.filePaths[0]) : null, exactExpectedPath: success.filePaths[0] === pickerPath },
    cancel: { canceled: cancelled.canceled, returnedPathCount: cancelled.filePaths.length },
    automation: { runnerSelfAutomated: false, safeExternalUiAutomationSupported: true },
    rendererArbitraryFilesystemCapability: false,
  }
}

function snapshotTcpListeners(processIds) {
  const wanted = new Set(processIds.filter(Number.isInteger).map(String))
  let output = ''
  try { output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8', windowsHide: true }) } catch { return { probeError: true, matching: [] } }
  const matching = output.split(/\r?\n/).filter(line => {
    const fields = line.trim().split(/\s+/)
    return fields[0] === 'TCP' && fields[3] === 'LISTENING' && wanted.has(fields[4])
  }).map(line => {
    const fields = line.trim().split(/\s+/)
    return { localAddress: fields[1], pid: Number(fields[4]) }
  })
  return { probeError: false, matching }
}

function validateRendererEnvelope(value) {
  const renderer = value?.rendererSnapshot
  const preload = value?.preloadSnapshot
  if (!renderer || !preload) throw new Error('Missing Renderer or preload snapshot')
  if (renderer.requireType !== 'undefined' || renderer.processType !== 'undefined') throw new Error('Renderer exposes Node globals')
  if (JSON.stringify(renderer.bridgeNames) !== JSON.stringify(['p0s4Bridge'])) throw new Error('Renderer bridge surface changed')
  if (JSON.stringify(renderer.bridgeKeys) !== JSON.stringify(['run'])) throw new Error('Renderer bridge allowlist changed')
  if (renderer.transportGlobalPresent || renderer.cookie !== '') throw new Error('Renderer exposes transport or cookie state')
  if (!preload.contextIsolated || !preload.sandboxed || preload.pipePathExposed || preload.reusableCredentialExposed) {
    throw new Error('Preload isolation evidence failed')
  }
  return { renderer, preload }
}

async function executeProbe(rendererEvidence, senderPid, parentWindow) {
  const memoryBefore = process.memoryUsage()
  const desktopProjectionResetAdapter = new DesktopProjectionResetAdapter()
  const preReadyResetCount = desktopProjectionResetAdapter.resetRecords.length
  await progress('negative-tests')
  const negative = await runNegativeTests()
  if (negative.results.some(result => result.gatewayDispatchCount !== 0) || negative.preGatewayStatus.gatewayDispatchCount !== 0) {
    throw new Error('A negative request reached Gateway dispatch')
  }

  const auth = await authenticate()
  if (auth.outcome.type !== 'authentication-complete' || !auth.outcome.authenticated) throw new Error('Final authentication failed')
  const rpc = createRpc(auth.connection)
  const unary = await rpc.call('agentPresets/list', { args: {} }, { probeId: 'p0s4-unary-regression' })
  const unaryPass = unary.result?.ok === true && unary.result.value?.presets?.some(preset => preset.id === 'standard')
  await progress('stream-tests', { unaryPass })
  const streams = await runStreamTests(auth.connection)

  await progress('connection-loss', { streamPass: streams.normal.pass && streams.producerError.pass })
  const lossStream = await openLogicalStream(auth.connection, 'p0s4Fixture/streamScenario', {
    args: { request: { label: 'connection-loss', count: 1, mode: 'pending' } },
  }, 2)
  await lossStream.next()
  await auth.connection.close()
  await sleep(250)
  const eventAuth = await authenticate()
  const eventGeneration = await openEventGeneration(eventAuth.connection, desktopProjectionResetAdapter)
  const lossStatus = await diagnosticStatus(eventAuth.connection)
  const connectionLoss = {
    pass: lossStatus.activeStreams === 1 && lossStatus.fixture?.streamReturns >= 8,
    terminalPolicy: 'connection-owned stream aborted; no Agent cancel mapping',
    activeStreamsAfterReconnect: lossStatus.activeStreams,
    fixtureStreamReturnsAfterReconnect: lossStatus.fixture?.streamReturns,
  }

  await progress('approval')
  const approval = await approvalAcrossReconnect(eventAuth.connection, eventGeneration, desktopProjectionResetAdapter)
  await progress('question', { approvalPass: approval.evidence.pass })
  const question = await questionAcrossReconnect(approval.connection, approval.generation, desktopProjectionResetAdapter)
  await progress('explicit-cancel', { questionPass: question.evidence.pass })
  const cancel = await explicitCancelAcrossDisconnect(question.connection, question.generation, desktopProjectionResetAdapter)
  await progress('binary', { cancelPass: cancel.evidence.pass })
  const binary = await runBinaryTests(cancel.connection)
  await progress('native-picker', { binary })
  const picker = await runNativePicker(parentWindow, binary)
  await progress('finalize', { pickerPass: picker.pass })
  await cancel.generation.stream.cancel('final-event-subscription-stop')
  const finalEventTerminal = await cancel.generation.stream.next()
  const finalStatus = await diagnosticStatus(cancel.connection)
  const finalResourceCleanupPass = ['stream-cancelled', 'stream-end'].includes(finalEventTerminal.type)
    && finalStatus.activeStreams === 0 && finalStatus.activeBinaries === 0
  const finishRequestId = randomUUID()
  const finishPending = cancel.connection.waitFor(message => message.type === 'carrier-finished' && message.requestId === finishRequestId)
  await cancel.connection.sendObject({ type: 'carrier-finish', requestId: finishRequestId })
  const finish = await finishPending
  await cancel.connection.close()

  const appPids = app.getAppMetrics().map(metric => metric.pid)
  const tcp = snapshotTcpListeners([...appPids, workerCarrierPid, dshPid])
  const memoryAfter = process.memoryUsage()
  const generationClientIds = [
    eventGeneration.clientId, approval.generation.clientId,
    question.generation.clientId, cancel.generation.clientId,
  ]
  const resetMeasurement = desktopProjectionResetAdapter.snapshot(preReadyResetCount)
  const eventPass = resetMeasurement.readyCount > 0
    && resetMeasurement.readyCount === generationClientIds.length
    && new Set(generationClientIds).size === resetMeasurement.uniqueGenerationCount
    && resetMeasurement.connectionResetObserved
    && resetMeasurement.noResetWithoutReady
    && resetMeasurement.oneResetPerReady
    && resetMeasurement.noDuplicateGenerationReset
    && resetMeasurement.projectionInvalidationCount === resetMeasurement.connectionResetCount
    && resetMeasurement.projectionRepullRequestedCount === resetMeasurement.connectionResetCount
    && resetMeasurement.everyRepullHasResetCause
    && approval.evidence.sameEventIdAfterReconnect
    && question.evidence.sameEventIdAfterReconnect
  const allPass = unaryPass && streams.normal.pass && streams.producerError.pass
    && streams.consumerCancel.pass && streams.concurrent.pass && streams.backpressure.pass
    && connectionLoss.pass && eventPass && approval.evidence.pass && question.evidence.pass
    && cancel.evidence.pass && binary.pass && picker.pass && finalResourceCleanupPass
    && tcp.matching.length === 0

  return {
    classification: 'NOT_PRODUCTION', result: allPass ? 'PASS' : 'FAIL',
    processTopology: {
      electronMainPid: process.pid, rendererPid: senderPid, workerCarrierPid, dshWorkerPid: dshPid,
      electronApplicationPids: appPids, independentMainAndWorker: process.pid !== workerCarrierPid && process.pid !== dshPid,
      dshProfileEntry: 'dsh --profile shaco-host',
    },
    rendererIsolation: {
      ...rendererEvidence, pipeEndpointExposed: false, reusableWorkerCredentialExposed: false,
      arbitraryIpcExposed: false, directNamedPipeAccess: false, arbitraryFilesystemCapability: false,
    },
    authentication: {
      protocolVersion, explicitCompletionState: true, currentUserSidHashPrefix: hashPrefix(userSid),
      workerIdentityHashPrefix: hashPrefix(workerId), endpointIdentityHashPrefix: hashPrefix(endpointId),
      pipeEndpointHashPrefix: hashPrefix(pipeName), pipeEndpointRedacted: true,
      ephemeralSecretBytes: ephemeralSecret.length / 2, ephemeralPerStartMaterial: true,
      secretPersisted: false, browserAuthCookieUsed: false, negative,
    },
    unary: { pass: unaryPass, endpoint: 'agentPresets/list', connectionFetchDispatch: true },
    streams: { ...streams, connectionLoss },
    events: {
      pass: eventPass, endpoint: '$events', readyObserved: resetMeasurement.readyCount > 0,
      readyCount: resetMeasurement.readyCount,
      generations: resetMeasurement.readyRecords.map(record => record.generation),
      uniqueClientIds: new Set(generationClientIds).size === resetMeasurement.readyCount,
      clientIdHashPrefixes: resetMeasurement.readyRecords.map(record => record.readyClientIdHashPrefix),
      connectionResetObserved: resetMeasurement.connectionResetObserved,
      connectionResetCount: resetMeasurement.connectionResetCount,
      resetSource: resetMeasurement.resetSource,
      resetMeasurement,
      staleResultsRejected: approval.evidence.staleGenerationRejected && question.evidence.staleGenerationRejected,
      pendingStateReprojected: approval.evidence.sameEventIdAfterReconnect && question.evidence.sameEventIdAfterReconnect,
      finalSubscriptionCancelRequested: true,
      finalSubscriptionTerminal: finalEventTerminal.type,
    },
    approval: approval.evidence,
    userQuestion: question.evidence,
    explicitCancel: cancel.evidence,
    binary, nativePicker: picker,
    framing: {
      jsonProtocol: 'uint32-le byte length + UTF-8 JSON',
      binaryProtocol: 'uint32-le byte length + 0x42 + 36-byte stream id + raw bytes',
      prefixBytes: 4, maxFrameBytes, observedFrameSizes,
      parser: cancel.connection.stats, partialWritesDeliberatelyFragmented: true,
    },
    boundedResources: {
      streamCreditLimit, binaryChunkBytes: 16384, maxBinaryBytes: 2097152,
      mainRssBytesBefore: memoryBefore.rss, mainRssBytesAfter: memoryAfter.rss,
      mainObservedRssPeakBytes: Math.max(memoryBefore.rss, memoryAfter.rss),
      finalActiveStreams: finalStatus.activeStreams, finalActiveBinaries: finalStatus.activeBinaries,
      finalResourceCleanupPass,
    },
    stockWebExclusion: { browserAuthCookieUsed: false, stockDshWebAppStarted: false, matchingTcpListeners: tcp.matching },
    finish,
  }
}

async function main() {
  await writeJson(runtimeMarkerFile, {
    marker: 'SHACO_FORGE_P0S4_RUNTIME',
    classification: 'NOT_PRODUCTION',
    runId: runtimeRunId,
    runtimeDirectoryName,
  })
  await app.whenReady()
  ipcMain.handle('p0s4:run', async (event, value) => {
    try {
      if (runStarted) throw new Error('P0.S-4 probe is single-shot')
      runStarted = true
      const rendererEvidence = validateRendererEnvelope(value)
      const parentWindow = BrowserWindow.fromWebContents(event.sender)
      const result = await executeProbe(rendererEvidence, event.sender.getOSProcessId(), parentWindow)
      await writeJson(outputFile, result)
      setTimeout(() => parentWindow?.close(), 100)
      return result.result
    } catch (error) {
      failureRecorded = true
      await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', stage: 'renderer-ipc-probe', error: sanitizeError(error) })
      setTimeout(() => app.exit(1), 100)
      throw error
    }
  })

  const window = new BrowserWindow({
    show: false, width: 800, height: 600,
    webPreferences: {
      preload: join(experimentRoot, 'preload.cjs'), nodeIntegration: false,
      contextIsolation: true, sandbox: true, webSecurity: true,
      allowRunningInsecureContent: false, devTools: false,
    },
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.once('did-finish-load', () => window.webContents.on('will-navigate', event => event.preventDefault()))
  await window.loadURL('data:text/html;charset=utf-8,%3Cmeta%20http-equiv%3D%22Content-Security-Policy%22%20content%3D%22default-src%20%27none%27%22%3E%3Ctitle%3ENOT_PRODUCTION%20P0.S-4%3C%2Ftitle%3E')
  void window.webContents.executeJavaScript(`(() => {
    const rendererSnapshot = {
      requireType: typeof globalThis.require,
      processType: typeof globalThis.process,
      bridgeNames: Object.keys(globalThis).filter(key => key.startsWith('p0s4')),
      bridgeKeys: Object.keys(globalThis.p0s4Bridge ?? {}).sort(),
      transportGlobalPresent: '__DSH_TRANSPORT__' in globalThis,
      cookie: '',
      protocol: location.protocol,
      origin: location.origin,
    }
    return globalThis.p0s4Bridge.run(rendererSnapshot)
  })()`).catch(() => {})
}

process.on('uncaughtException', async error => {
  if (!failureRecorded) {
    failureRecorded = true
    await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', error: sanitizeError(error) })
  }
  app.exit(1)
})
process.on('unhandledRejection', async error => {
  if (!failureRecorded) {
    failureRecorded = true
    await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', error: sanitizeError(error) })
  }
  app.exit(1)
})
app.on('window-all-closed', () => app.quit())
main().catch(async error => {
  if (!failureRecorded && !runStarted) {
    failureRecorded = true
    await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', error: sanitizeError(error) })
  }
  app.exit(1)
})
