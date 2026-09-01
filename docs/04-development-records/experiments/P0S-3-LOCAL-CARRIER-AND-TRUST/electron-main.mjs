/**
 * NOT_PRODUCTION P0.S-3 Electron Main carrier probe.
 * The Renderer receives one allowlisted IPC method and no pipe or credential.
 */
import { app, BrowserWindow, ipcMain } from 'electron'
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const experimentRoot = dirname(fileURLToPath(import.meta.url))
const outputFile = requiredEnvironment('P0S3_ELECTRON_RESULT_FILE')
const userDataPath = requiredEnvironment('P0S3_ELECTRON_USER_DATA')
const pipeName = requiredEnvironment('P0S3_PIPE_NAME')
const ephemeralSecret = requiredEnvironment('P0S3_EPHEMERAL_SECRET')
const workerId = requiredEnvironment('P0S3_WORKER_ID')
const endpointId = requiredEnvironment('P0S3_ENDPOINT_ID')
const userSid = requiredEnvironment('P0S3_USER_SID')
const workerCarrierPid = Number(requiredEnvironment('P0S3_WORKER_PROCESS_ID'))
const dshPid = Number(requiredEnvironment('P0S3_DSH_PROCESS_ID'))
const pipePath = `\\\\.\\pipe\\${pipeName}`
const protocolVersion = 1
const maxFrameBytes = 262144
const observedFrameSizes = []
let runStarted = false
let fatalError = null

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
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class FramedPipeConnection {
  constructor(socket) {
    this.socket = socket
    this.buffer = Buffer.alloc(0)
    this.messages = []
    this.waiters = []
    this.writeChain = Promise.resolve()
    this.stats = {
      inboundDataChunks: 0,
      parserPartialWaits: 0,
      logicalFramesReceived: 0,
      logicalFramesSent: 0,
      fragmentedFrameSends: 0,
    }
    socket.on('data', chunk => this.onData(chunk))
    socket.on('error', error => this.rejectAll(error))
    socket.on('close', () => this.rejectAll(new Error('Named Pipe connection closed')))
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
      try {
        message = JSON.parse(payload.toString('utf8'))
      } catch (error) {
        this.rejectAll(error)
        this.socket.destroy()
        return
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
    const raw = JSON.stringify(value)
    const payload = Buffer.from(raw, 'utf8')
    observedFrameSizes.push({
      purpose: metadata.purpose ?? value.type,
      payloadProbeBytes: metadata.payloadProbeBytes ?? null,
      jsonBytes: payload.length,
      prefixBytes: 4,
      framedBytes: payload.length + 4,
      envelopeOverheadBytes: metadata.payloadProbeBytes == null
        ? null
        : payload.length - metadata.payloadProbeBytes,
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
        await new Promise((resolve, reject) => {
          this.socket.write(fragment, error => error ? reject(error) : resolve())
        })
        if (fragmented) await sleep(2)
      }
      this.stats.logicalFramesSent += 1
      if (fragmented) this.stats.fragmentedFrameSends += 1
    })
    return this.writeChain
  }

  sendMalformed(raw) {
    return this.sendPayload(Buffer.from(raw, 'utf8'), true)
  }

  async sendOversizeHeader(length) {
    await this.writeChain
    const header = Buffer.alloc(4)
    header.writeUInt32LE(length, 0)
    await new Promise((resolve, reject) => {
      this.socket.write(header, error => error ? reject(error) : resolve())
    })
  }

  async close() {
    if (this.socket.destroyed) return
    this.socket.end()
    await Promise.race([
      new Promise(resolve => this.socket.once('close', resolve)),
      sleep(1000),
    ])
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
  if (lastError || !socket || socket.destroyed) {
    throw lastError ?? new Error('Named Pipe connection retry budget exhausted')
  }
  const connection = new FramedPipeConnection(socket)
  const challenge = await connection.waitFor(message => message.type === 'server-challenge')
  return { connection, challenge }
}

function createProof({ secret, requestId, clientNonce, serverNonce, worker = workerId, endpoint = endpointId, sid = userSid }) {
  const canonical = [
    String(protocolVersion), sid, worker, endpoint, requestId, clientNonce, serverNonce,
  ].join('\n')
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
    type: 'client-auth',
    protocolVersion,
    requestId,
    workerId: worker,
    endpointId: endpoint,
    userSid: sid,
    clientNonce,
    serverNonce,
    proof: createProof({ secret, requestId, clientNonce, serverNonce, worker, endpoint, sid }),
  }
}

async function authenticate(overrides = {}) {
  const { connection, challenge } = await openPipe()
  const auth = overrides.staleFrame ?? buildAuth(challenge, overrides)
  const pending = connection.waitFor(message => (
    message.type === 'authentication-complete' || message.type === 'authentication-rejected'
  ))
  await connection.sendObject(auth, { purpose: 'client-auth' })
  const outcome = await pending
  return { connection, challenge, auth, outcome }
}

async function runNegativeTests() {
  const results = []

  {
    const { connection } = await openPipe()
    const requestId = randomUUID()
    const pending = connection.waitFor(message => message.type === 'authentication-rejected')
    await connection.sendObject({
      type: 'rpc-call', requestId, channel: '/api', endpoint: 'agentPresets/list', payload: { args: {} },
    }, { purpose: 'unauthenticated-rpc' })
    const outcome = await pending
    results.push({ test: 'unauthenticated-request', reason: outcome.reason, gatewayDispatchCount: outcome.gatewayForwardedCount })
    await connection.close()
  }

  {
    const attempt = await authenticate({ secret: randomBytes(32).toString('hex') })
    results.push({ test: 'wrong-proof', reason: attempt.outcome.reason, gatewayDispatchCount: attempt.outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }

  {
    const attempt = await authenticate({ workerId: randomUUID() })
    results.push({ test: 'wrong-worker-identity', reason: attempt.outcome.reason, gatewayDispatchCount: attempt.outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }

  {
    const attempt = await authenticate({ endpointId: randomUUID() })
    results.push({ test: 'wrong-endpoint-identity', reason: attempt.outcome.reason, gatewayDispatchCount: attempt.outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }

  {
    const attempt = await authenticate({ userSid: 'S-1-5-18' })
    results.push({ test: 'wrong-user-sid', reason: attempt.outcome.reason, gatewayDispatchCount: attempt.outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }

  {
    const { connection } = await openPipe()
    const pending = connection.waitFor(message => message.type === 'authentication-rejected')
    await connection.sendMalformed('{not-json')
    const outcome = await pending
    results.push({ test: 'malformed-frame', reason: outcome.reason, gatewayDispatchCount: outcome.gatewayForwardedCount })
    await connection.close()
  }

  {
    const { connection } = await openPipe()
    const pending = connection.waitFor(message => message.type === 'authentication-rejected')
    await connection.sendOversizeHeader(maxFrameBytes + 1)
    const outcome = await pending
    results.push({ test: 'oversize-frame', reason: outcome.reason, gatewayDispatchCount: outcome.gatewayForwardedCount })
    await connection.close()
  }

  let capturedAuth
  {
    const attempt = await authenticate()
    if (attempt.outcome.type !== 'authentication-complete') throw new Error('Valid auth-only handshake failed')
    capturedAuth = attempt.auth
    await attempt.connection.close()
  }

  {
    const attempt = await authenticate({ staleFrame: capturedAuth })
    results.push({ test: 'replayed-handshake', reason: attempt.outcome.reason, gatewayDispatchCount: attempt.outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }

  {
    const attempt = await authenticate()
    if (attempt.outcome.type !== 'authentication-complete') throw new Error('Endpoint allowlist auth failed')
    const requestId = randomUUID()
    const pending = attempt.connection.waitFor(message => message.type === 'authentication-rejected')
    await attempt.connection.sendObject({
      type: 'rpc-call',
      requestId,
      channel: '/api',
      endpoint: 'credentials/set',
      payload: { args: { ref: 'forbidden-probe' } },
    }, { purpose: 'wrong-business-endpoint' })
    const outcome = await pending
    results.push({ test: 'wrong-business-endpoint', reason: outcome.reason, gatewayDispatchCount: outcome.gatewayForwardedCount })
    await attempt.connection.close()
  }

  const statusAttempt = await authenticate()
  if (statusAttempt.outcome.type !== 'authentication-complete') throw new Error('Pre-Gateway status authentication failed')
  const status = await diagnosticStatus(statusAttempt.connection)
  await statusAttempt.connection.close()
  return { results, preGatewayStatus: status }
}

async function diagnosticStatus(connection) {
  const requestId = randomUUID()
  const pending = connection.waitFor(message => (
    message.type === 'diagnostic-status-response' && message.requestId === requestId
  ))
  await connection.sendObject({ type: 'diagnostic-status', requestId }, { purpose: 'diagnostic-status' })
  return pending
}

function createRpc(connection) {
  return Object.freeze({
    async call(channel, endpoint, payload, options = {}) {
      const requestId = randomUUID()
      const frame = {
        type: 'rpc-call',
        requestId,
        channel,
        endpoint,
        payload,
        probeId: options.probeId ?? requestId,
        probeDelayMs: options.probeDelayMs ?? 0,
        probePayloadBytes: options.probePayloadBytes ?? 0,
      }
      const pending = connection.waitFor(message => (
        message.type === 'rpc-response' && message.requestId === requestId
      ))
      await connection.sendObject(frame, {
        purpose: options.purpose ?? 'rpc-call',
        payloadProbeBytes: options.probePayloadBytes ?? 0,
      })
      return pending
    },
  })
}

async function openBasicStream(connection, channelOrdinal, itemCount) {
  const requestId = randomUUID()
  const streamId = randomUUID()
  const channelLabel = `channel-${channelOrdinal}`
  await connection.sendObject({
    type: 'stream-open',
    requestId,
    streamId,
    endpoint: 'p0s3/basic-stream',
    channelLabel,
    channelOrdinal,
    itemCount,
  }, { purpose: 'stream-open' })
  const items = []
  for (;;) {
    const frame = await connection.waitFor(message => (
      message.streamId === streamId
      && (message.type === 'stream-item' || message.type === 'stream-end')
    ))
    if (frame.type === 'stream-end') {
      return { streamIdHashPrefix: hashPrefix(streamId), channelLabel, items, endCount: frame.itemCount }
    }
    items.push({ index: frame.index, value: frame.value, channelLabel: frame.channelLabel })
  }
}

async function runPositiveTests(connection) {
  const rpc = createRpc(connection)
  const unary = await rpc.call('/api', 'agentPresets/list', { args: {} }, {
    probeId: 'unary-canary', purpose: 'gateway-unary-canary',
  })
  const unaryPass = unary.result?.ok === true
    && Array.isArray(unary.result.value?.presets)
    && unary.result.value.presets.some(preset => preset?.id === 'standard')

  const concurrentCount = 24
  const requestOrder = Array.from({ length: concurrentCount }, (_, index) => `concurrent-${index}`)
  const completionOrder = []
  const concurrentResponses = await Promise.all(requestOrder.map((probeId, index) => rpc.call(
    '/api',
    'agentPresets/list',
    { args: {}, probePadding: 'c'.repeat(index * 3) },
    { probeId, probeDelayMs: (concurrentCount - index) * 3, purpose: 'concurrent-unary' },
  ).then(response => {
    completionOrder.push(response.probeId)
    return response
  })))
  const gatewayDispatchOrder = [...concurrentResponses]
    .sort((left, right) => left.gatewayDispatchOrdinal - right.gatewayDispatchOrdinal)
    .map(response => response.probeId)
  const concurrentPass = concurrentResponses.every((response, index) => (
    response.requestId
    && response.probeId === requestOrder[index]
    && response.result?.ok === true
  )) && new Set(concurrentResponses.map(response => response.requestId)).size === concurrentCount

  const payloadSizes = [0, 1024, 16384, 65536, 196608]
  const payloadResults = []
  for (const payloadBytes of payloadSizes) {
    const response = await rpc.call('/api', 'agentPresets/list', {
      args: {}, probePadding: 'p'.repeat(payloadBytes),
    }, {
      probeId: `payload-${payloadBytes}`,
      probePayloadBytes: payloadBytes,
      purpose: `payload-${payloadBytes}`,
    })
    payloadResults.push({
      payloadBytes,
      correlated: response.probeId === `payload-${payloadBytes}`,
      gatewayOk: response.result?.ok === true,
    })
  }

  const mixedUnaryIds = Array.from({ length: 8 }, (_, index) => `mixed-unary-${index}`)
  const mixedUnaryPromises = mixedUnaryIds.map((probeId, index) => rpc.call(
    '/api',
    'agentPresets/list',
    { args: {}, probePadding: 'm'.repeat(128 + index) },
    { probeId, probeDelayMs: (index % 4) * 2, purpose: 'mixed-unary-stream' },
  ))
  const streamPromises = [0, 1, 2].map(index => openBasicStream(connection, index, 20))
  const [mixedUnary, streams] = await Promise.all([
    Promise.all(mixedUnaryPromises),
    Promise.all(streamPromises),
  ])
  const streamOrderPass = streams.every(stream => (
    stream.items.length === stream.endCount
    && stream.items.every((item, index) => item.index === index && item.value === `${stream.channelLabel}:${index}`)
  ))
  const streamIsolationPass = streams.every(stream => (
    stream.items.every(item => item.channelLabel === stream.channelLabel)
  ))
  const mixedUnaryPass = mixedUnary.every((response, index) => (
    response.probeId === mixedUnaryIds[index] && response.result?.ok === true
  ))

  const status = await diagnosticStatus(connection)
  return {
    unary: {
      pass: unaryPass,
      endpoint: 'agentPresets/list',
      channel: '/api',
      standardPresetObserved: unaryPass,
      correlationIdPresent: Boolean(unary.requestId),
    },
    concurrentUnary: {
      pass: concurrentPass,
      concurrentCount,
      uniqueCorrelationIds: new Set(concurrentResponses.map(response => response.requestId)).size,
      responseOrderDifferentFromRequestOrder: JSON.stringify(completionOrder) !== JSON.stringify(requestOrder),
      requestOrder,
      gatewayDispatchOrder,
      promiseResultOrder: completionOrder,
    },
    payloads: {
      pass: payloadResults.every(result => result.correlated && result.gatewayOk),
      results: payloadResults,
    },
    mixedUnaryAndStreams: {
      pass: mixedUnaryPass && streamOrderPass && streamIsolationPass,
      concurrentUnaryCount: mixedUnary.length,
      streamChannelCount: streams.length,
      itemsPerStream: streams.map(stream => stream.items.length),
      streamOrderPass,
      streamIsolationPass,
      streams,
    },
    postStatus: status,
  }
}

function snapshotTcpListeners(processIds) {
  const wanted = new Set(processIds.filter(Number.isInteger).map(String))
  let output = ''
  try {
    output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8', windowsHide: true })
  } catch {
    return { probeError: true, matching: [] }
  }
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
  if (renderer.requireType !== 'undefined' || renderer.processType !== 'undefined') {
    throw new Error('Renderer unexpectedly exposes Node globals')
  }
  if (JSON.stringify(renderer.bridgeNames) !== JSON.stringify(['p0s3Bridge'])) {
    throw new Error('Renderer bridge surface is not minimal')
  }
  if (JSON.stringify(renderer.bridgeKeys) !== JSON.stringify(['run'])) {
    throw new Error('Renderer bridge method allowlist changed')
  }
  if (renderer.transportGlobalPresent || renderer.cookie !== '') {
    throw new Error('Renderer unexpectedly exposes transport or cookie state')
  }
  if (!preload.contextIsolated || !preload.sandboxed
      || preload.pipePathExposed || preload.reusableCredentialExposed) {
    throw new Error('Preload isolation evidence failed')
  }
  return { renderer, preload }
}

async function executeProbe(rendererEvidence, senderPid) {
  const memoryBefore = process.memoryUsage()
  const negative = await runNegativeTests()
  if (negative.results.some(result => result.gatewayDispatchCount !== 0)) {
    throw new Error('A negative request reached the Gateway forwarding boundary')
  }
  if (negative.preGatewayStatus.gatewayDispatchCount !== 0) {
    throw new Error('Frozen Harness carrier Gateway counter was not zero after negative tests')
  }

  const finalAuth = await authenticate()
  if (finalAuth.outcome.type !== 'authentication-complete' || !finalAuth.outcome.authenticated) {
    throw new Error('Final authenticated connection failed')
  }
  const positive = await runPositiveTests(finalAuth.connection)
  const finishRequestId = randomUUID()
  const finishPending = finalAuth.connection.waitFor(message => (
    message.type === 'carrier-finished' && message.requestId === finishRequestId
  ))
  await finalAuth.connection.sendObject({ type: 'carrier-finish', requestId: finishRequestId }, { purpose: 'carrier-finish' })
  const finish = await finishPending
  await finalAuth.connection.close()

  const appPids = app.getAppMetrics().map(metric => metric.pid)
  const tcp = snapshotTcpListeners([...appPids, workerCarrierPid, dshPid])
  const memoryAfter = process.memoryUsage()
  const allPass = positive.unary.pass
    && positive.concurrentUnary.pass
    && positive.payloads.pass
    && positive.mixedUnaryAndStreams.pass
    && finish.gatewayForwardedCount === positive.postStatus.gatewayDispatchCount
    && finish.streamForwardedCount === positive.postStatus.streamProbeOpenCount
    && tcp.matching.length === 0

  return {
    classification: 'NOT_PRODUCTION',
    result: allPass ? 'PASS' : 'FAIL',
    processTopology: {
      electronMainPid: process.pid,
      rendererPid: senderPid,
      workerCarrierPid,
      dshWorkerPid: dshPid,
      electronApplicationPids: appPids,
      independentMainAndWorker: process.pid !== workerCarrierPid && process.pid !== dshPid,
      dshProfileEntry: 'dsh --profile shaco-host',
    },
    rendererIsolation: {
      ...rendererEvidence,
      pipeEndpointExposed: false,
      reusableWorkerCredentialExposed: false,
      arbitraryIpcExposed: false,
      directNamedPipeAccess: false,
    },
    authentication: {
      protocolVersion,
      explicitCompletionState: finalAuth.outcome.authenticated === true,
      currentUserSid: userSid,
      workerIdentityHashPrefix: hashPrefix(workerId),
      endpointIdentityHashPrefix: hashPrefix(endpointId),
      pipeEndpointHashPrefix: hashPrefix(pipeName),
      pipeEndpointRedacted: true,
      ephemeralSecretBytes: ephemeralSecret.length / 2,
      ephemeralPerStartMaterial: true,
      secretPersisted: false,
      browserAuthCookieUsed: false,
      negative,
    },
    positive,
    framing: {
      protocol: 'uint32-le byte length + UTF-8 JSON',
      prefixBytes: 4,
      maxFrameBytes,
      observedFrameSizes,
      clientParser: finalAuth.connection.stats,
      partialWritesDeliberatelyFragmented: true,
    },
    memory: {
      mainRssBytesBefore: memoryBefore.rss,
      mainRssBytesAfter: memoryAfter.rss,
      mainObservedRssPeakBytes: Math.max(memoryBefore.rss, memoryAfter.rss),
    },
    stockWebExclusion: {
      browserAuthCookieUsed: false,
      stockDshWebAppStarted: false,
      tcpListenerProbeError: tcp.probeError,
      matchingTcpListeners: tcp.matching,
    },
    finish,
  }
}

async function main() {
  await app.whenReady()
  ipcMain.handle('p0s3:run', async (event, value) => {
    try {
      if (runStarted) throw new Error('P0.S-3 probe is single-shot')
      runStarted = true
      const rendererEvidence = validateRendererEnvelope(value)
      const result = await executeProbe(rendererEvidence, event.sender.getOSProcessId())
      await writeJson(outputFile, result)
      setTimeout(() => BrowserWindow.fromWebContents(event.sender)?.close(), 100)
      return result.result
    } catch (error) {
      await writeJson(outputFile, {
        classification: 'NOT_PRODUCTION',
        result: 'FAIL',
        stage: 'renderer-ipc-probe',
        error: sanitizeError(error),
      })
      setTimeout(() => app.exit(1), 100)
      throw error
    }
  })

  const window = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(experimentRoot, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: false,
    },
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.once('did-finish-load', () => {
    window.webContents.on('will-navigate', event => event.preventDefault())
  })
  await window.loadFile(join(experimentRoot, 'index.html'))
}

process.on('uncaughtException', async error => {
  fatalError = sanitizeError(error)
  await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', error: fatalError })
  app.exit(1)
})

process.on('unhandledRejection', async error => {
  fatalError = sanitizeError(error)
  await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', error: fatalError })
  app.exit(1)
})

app.on('window-all-closed', () => {
  app.quit()
})

main().catch(async error => {
  fatalError = sanitizeError(error)
  await writeJson(outputFile, { classification: 'NOT_PRODUCTION', result: 'FAIL', error: fatalError })
  app.exit(1)
})
