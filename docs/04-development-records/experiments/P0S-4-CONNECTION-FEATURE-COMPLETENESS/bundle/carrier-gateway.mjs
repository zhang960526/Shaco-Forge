/**
 * NOT_PRODUCTION P0.S-4 Host completeness fixture and carrier adapter.
 * Calls use public Connection/Gateway surfaces. Deterministic fixture behavior
 * exists only to make edge cases reproducible.
 */
import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { Remote, TypertRemoteFailure, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

export const name = 'p0s4-carrier-gateway'
export const inject = ['typertGateway', 'agentPresets', 'connection', 'agents', 'approval', 'userQuestions']

const RESPONSE_PREFIX = 'P0S4_FRAME '
const BINARY_PREFIX = 'P0S4_BINARY '
const INPUT_PREFIX = 'P0S4_IN '
const MAX_BINARY_BYTES = 2 * 1024 * 1024
const BINARY_CHUNK_BYTES = 16 * 1024
const STREAM_CREDIT_LIMIT = 4

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writeLine(line) {
  if (process.stdout.write(line)) return
  await new Promise(resolve => process.stdout.once('drain', resolve))
}

async function send(value) {
  const json = JSON.stringify(value)
  await writeLine(`${RESPONSE_PREFIX}${Buffer.from(json, 'utf8').toString('base64')}\n`)
}

async function sendBinary(streamId, chunk) {
  await writeLine(`${BINARY_PREFIX}${streamId} ${Buffer.from(chunk).toString('base64')}\n`)
}

function methodContext(name, initializers) {
  return {
    kind: 'method', name, static: false, private: false,
    access: { has: object => name in object, get: object => object[name] },
    addInitializer(initializer) { initializers.push(initializer) },
  }
}

const fixtureInitializers = []

class P0S4CompletenessFixture extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'p0s4CompletenessFixture', { namespace: 'p0s4Fixture' })
    this.ctx = ctx
    this.handles = new Map()
    this.approvalSettlements = 0
    this.questionSettlements = 0
    this.cancelCompletions = 0
    this.streamOpens = 0
    this.streamReturns = 0
    for (const initialize of fixtureInitializers) initialize.call(this)
    ctx.effect(() => async () => {
      await Promise.all([...this.handles.values()].map(handle => handle.dispose()))
      this.handles.clear()
    })
  }

  async ensureAgent(label) {
    const current = this.handles.get(label)
    if (current) return current.agent
    const handle = await this.ctx.agents.create({
      sessionId: randomUUID(),
      meta: { cwd: process.cwd(), agentPreset: 'standard' },
    })
    this.handles.set(label, handle)
    return handle.agent
  }

  async *streamScenario(request, signal) {
    this.streamOpens += 1
    const count = Number.isSafeInteger(request?.count) ? request.count : 0
    const label = typeof request?.label === 'string' ? request.label : 'stream'
    try {
      for (let index = 0; index < count; index += 1) {
        if (signal.aborted) throw signal.reason
        yield { label, index, value: `${label}:${index}` }
      }
      if (request?.mode === 'producer-error') {
        throw new TypertRemoteFailure({
          code: 'p0s4-producer-error',
          message: 'P0.S-4 deterministic producer failure',
          details: { afterItems: count },
        })
      }
      if (request?.mode === 'pending') {
        await new Promise(resolve => {
          if (signal.aborted) resolve()
          else signal.addEventListener('abort', resolve, { once: true })
        })
        if (signal.aborted) throw signal.reason
      }
    } finally {
      this.streamReturns += 1
    }
  }

  async approvalRoundTrip(request) {
    const agent = await this.ensureAgent(String(request?.label ?? 'approval'))
    const turn = 1 + agent.session.events.filter(event => event.type === 'turn/start').length
    agent.session.append('turn/start', { turn })
    try {
      const outcome = await this.ctx.approval.request({
        agent,
        toolName: 'p0s4-not-production-fixture',
        reason: 'P0.S-4 real approval carrier round-trip',
      })
      this.approvalSettlements += 1
      return { outcome, sessionId: agent.id, settlementCount: this.approvalSettlements }
    } finally {
      agent.session.append('turn/end', { turn, reason: { kind: 'completed' } })
    }
  }

  async questionRoundTrip(request) {
    const agent = await this.ensureAgent(String(request?.label ?? 'question'))
    const answer = await this.ctx.userQuestions.ask({
      agent,
      questions: [{
        id: 'p0s4-choice', header: 'P0.S-4',
        question: 'Choose the deterministic completeness answer.',
        options: [
          { label: 'Alpha', description: 'First deterministic answer.' },
          { label: 'Beta', description: 'Second deterministic answer.' },
        ],
      }],
    })
    this.questionSettlements += 1
    return { answer, sessionId: agent.id, settlementCount: this.questionSettlements }
  }

  async cancellableOperation(request) {
    const agent = await this.ensureAgent(String(request?.label ?? 'cancel'))
    let abortCount = 0
    const result = await agent.runMaintenance(signal => new Promise(resolve => {
      const finish = () => {
        abortCount += 1
        resolve({ aborted: signal.aborted, causeKind: signal.reason?.kind ?? null })
      }
      if (signal.aborted) finish()
      else signal.addEventListener('abort', finish, { once: true })
    }))
    this.cancelCompletions += 1
    await agent.whenIdle()
    return {
      ...result, sessionId: agent.id, agentStatus: agent.status,
      abortCount, completionCount: this.cancelCompletions,
    }
  }

  status() {
    return {
      approvalSettlements: this.approvalSettlements,
      questionSettlements: this.questionSettlements,
      cancelCompletions: this.cancelCompletions,
      streamOpens: this.streamOpens,
      streamReturns: this.streamReturns,
      agents: [...this.handles.entries()].map(([label, handle]) => ({
        label, sessionId: handle.agent.id, status: handle.agent.status,
        approvalDecisions: handle.agent.session.events.filter(event => event.type === 'approval/decided').length,
      })),
    }
  }
}

for (const name of ['approvalRoundTrip', 'questionRoundTrip', 'cancellableOperation', 'status']) {
  Remote(P0S4CompletenessFixture.prototype[name], methodContext(name, fixtureInitializers))
}
Remote({ mode: 'stream' })(
  P0S4CompletenessFixture.prototype.streamScenario,
  methodContext('streamScenario', fixtureInitializers),
)

function binaryByte(index, size) {
  if (index === 0) return 0x00
  if (index === 1) return 0xff
  if (index === 2) return 0x80
  return (index * 131 + size * 17 + (index >>> 8)) & 0xff
}

function binaryResponse(request, metrics) {
  const sizeText = new URL(request.url).searchParams.get('size')
  if (!/^\d+$/.test(sizeText ?? '')) return Promise.resolve(new Response('invalid size', { status: 400 }))
  const size = Number(sizeText)
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_BINARY_BYTES) {
    return Promise.resolve(new Response('binary size exceeds fixture limit', { status: 413 }))
  }
  let offset = 0
  metrics.binaryRouteDispatches += 1
  const body = new ReadableStream({
    pull(controller) {
      if (offset >= size) {
        controller.close()
        return
      }
      const length = Math.min(BINARY_CHUNK_BYTES, size - offset)
      const chunk = new Uint8Array(length)
      for (let index = 0; index < length; index += 1) chunk[index] = binaryByte(offset + index, size)
      offset += length
      metrics.binaryPeakChunkBytes = Math.max(metrics.binaryPeakChunkBytes, chunk.byteLength)
      controller.enqueue(chunk)
    },
    cancel() { metrics.binaryProducerCancels += 1 },
  })
  return Promise.resolve(new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/octet-stream',
      'content-length': String(size),
      'x-p0s4-classification': 'NOT_PRODUCTION',
    },
  }))
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function apply(ctx) {
  const readyFile = process.env.P0S4_DSH_READY_FILE
  const summaryFile = process.env.P0S4_DSH_SUMMARY_FILE
  const failureFile = process.env.P0S4_DSH_FAILURE_FILE
  const fixture = new P0S4CompletenessFixture(ctx)
  const sharedFetch = ctx.connection.createSharedFetchHandler('/api')
  const streams = new Map()
  const binaries = new Map()
  const metrics = {
    gatewayDispatchCount: 0, streamOpenCount: 0, streamItemCount: 0,
    streamEndCount: 0, streamErrorCount: 0, streamCancelCount: 0,
    maxStreamCreditsObserved: 0, binaryRouteDispatches: 0,
    binaryChunkCount: 0, binaryPeakChunkBytes: 0, binaryProducerCancels: 0,
    maxBinaryCreditsObserved: 0,
  }
  let stopping = false

  async function connectionCall(endpoint, payload, requestId) {
    const response = await sharedFetch.fetch(new Request(`http://p0s4.invalid/api/${endpoint}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'client-request', rpcId: requestId, method: endpoint, payload }),
    }))
    return response.json()
  }

  async function handleRpc(frame) {
    metrics.gatewayDispatchCount += 1
    if (frame.probeDelayMs > 0) await sleep(frame.probeDelayMs)
    try {
      const response = await connectionCall(frame.endpoint, frame.payload, frame.requestId)
      await send({
        type: 'rpc-response', requestId: frame.requestId, result: response.result,
        probeId: frame.probeId, probePayloadBytes: frame.probePayloadBytes,
        gatewayDispatchOrdinal: metrics.gatewayDispatchCount,
      })
    } catch (error) {
      await send({
        type: 'rpc-response', requestId: frame.requestId,
        result: { ok: false, error: { code: 'internal', message: String(error?.message ?? error), details: {} } },
      })
    }
  }

  function grantCredit(state, credit) {
    if (!Number.isSafeInteger(credit) || credit <= 0) return
    state.credits = Math.min(STREAM_CREDIT_LIMIT, state.credits + credit)
    metrics.maxStreamCreditsObserved = Math.max(metrics.maxStreamCreditsObserved, state.credits)
    state.wake?.()
    state.wake = null
  }

  async function takeCredit(state) {
    while (state.credits === 0 && !state.controller.signal.aborted) {
      await new Promise(resolve => { state.wake = resolve })
    }
    if (state.controller.signal.aborted) return false
    state.credits -= 1
    return true
  }

  async function pumpStream(frame, state) {
    try {
      const source = await ctx.typertGateway.wireStream.open(frame.endpoint, frame.payload, state.controller.signal)
      const iterator = source[Symbol.asyncIterator]()
      state.iterator = iterator
      for (;;) {
        if (!await takeCredit(state)) return
        const result = await iterator.next()
        if (result.done) {
          metrics.streamEndCount += 1
          await send({ type: 'stream-end', requestId: frame.requestId, streamId: frame.streamId })
          return
        }
        metrics.streamItemCount += 1
        await send({ type: 'stream-item', requestId: frame.requestId, streamId: frame.streamId, value: result.value })
      }
    } catch (error) {
      if (state.controller.signal.aborted) {
        await send({
          type: 'stream-cancelled', requestId: frame.requestId,
          streamId: frame.streamId, reason: state.cancelReason,
        })
      } else {
        metrics.streamErrorCount += 1
        await send({
          type: 'stream-error', requestId: frame.requestId,
          streamId: frame.streamId, error: ctx.typertGateway.wireStream.failure(error),
        })
      }
    } finally {
      streams.delete(frame.streamId)
    }
  }

  async function handleStreamOpen(frame) {
    metrics.streamOpenCount += 1
    const state = { controller: new AbortController(), iterator: null, credits: 0, wake: null, cancelReason: null }
    streams.set(frame.streamId, state)
    grantCredit(state, frame.initialCredit ?? 0)
    await pumpStream(frame, state)
  }

  async function handleStreamCancel(frame) {
    const state = streams.get(frame.streamId)
    if (!state) return
    metrics.streamCancelCount += 1
    state.cancelReason = frame.reason ?? 'consumer-cancel'
    state.controller.abort(new Error(`P0.S-4 stream cancelled: ${state.cancelReason}`))
    state.wake?.()
    state.wake = null
    try { await state.iterator?.return?.() } catch { }
  }

  async function handleBinary(frame) {
    const controller = new AbortController()
    const state = { controller, reader: null, credits: 0, wake: null }
    binaries.set(frame.streamId, state)
    state.credits = Math.min(STREAM_CREDIT_LIMIT, frame.initialCredit ?? 0)
    metrics.maxBinaryCreditsObserved = Math.max(metrics.maxBinaryCreditsObserved, state.credits)
    try {
      const response = await sharedFetch.fetch(new Request(
        `http://p0s4.invalid/api/session.export?size=${encodeURIComponent(String(frame.size))}`,
        { method: 'GET', signal: controller.signal },
      ))
      await send({
        type: 'binary-start', requestId: frame.requestId, streamId: frame.streamId,
        status: response.status, contentLength: response.headers.get('content-length'),
        contentType: response.headers.get('content-type'),
      })
      if (!response.ok || response.body === null) {
        await send({ type: 'binary-end', requestId: frame.requestId, streamId: frame.streamId, status: response.status, chunkCount: 0, byteCount: 0 })
        return
      }
      const reader = response.body.getReader()
      state.reader = reader
      let chunkCount = 0
      let byteCount = 0
      for (;;) {
        if (!await takeCredit(state)) throw controller.signal.reason
        const result = await reader.read()
        if (result.done) break
        chunkCount += 1
        byteCount += result.value.byteLength
        metrics.binaryChunkCount += 1
        await sendBinary(frame.streamId, result.value)
      }
      if (controller.signal.aborted) throw controller.signal.reason
      await send({ type: 'binary-end', requestId: frame.requestId, streamId: frame.streamId, status: response.status, chunkCount, byteCount })
    } catch (error) {
      await send({
        type: controller.signal.aborted ? 'binary-cancelled' : 'binary-error',
        requestId: frame.requestId, streamId: frame.streamId,
        message: controller.signal.aborted ? 'consumer-cancel' : String(error?.message ?? error),
      })
    } finally {
      binaries.delete(frame.streamId)
    }
  }

  async function handleBinaryCancel(frame) {
    const state = binaries.get(frame.streamId)
    if (!state) return
    state.controller.abort(new Error('P0.S-4 binary consumer cancellation'))
    state.wake?.()
    state.wake = null
    try { await state.reader?.cancel?.('consumer-cancel') } catch { }
  }

  function sendStatus(frame) {
    return send({
      type: 'diagnostic-status-response', requestId: frame.requestId,
      ...metrics, activeStreams: streams.size, activeBinaries: binaries.size,
      fixture: fixture.status(),
    })
  }

  ctx.connection.fetch.register({
    path: '/api/session.export', methods: ['GET', 'HEAD'],
    fetch: request => binaryResponse(request, metrics),
  })

  const input = createInterface({ input: process.stdin, terminal: false })
  input.on('line', line => {
    if (line === 'P0S4_CONTROL_STOP') {
      if (stopping) return
      stopping = true
      for (const state of streams.values()) state.controller.abort(new Error('P0.S-4 stop'))
      for (const state of binaries.values()) state.controller.abort(new Error('P0.S-4 stop'))
      writeJson(summaryFile, {
        classification: 'NOT_PRODUCTION', pid: process.pid, ...metrics,
        activeStreamsAtStop: streams.size, activeBinariesAtStop: binaries.size,
        fixture: fixture.status(),
        seams: [
          'connection.createSharedFetchHandler(/api)',
          'connection.fetch.register(/api/session.export)',
          'typertGateway.wireStream.open', '$events', '$events/result',
        ],
        browserAuthConstructed: false, stockWebStarted: false,
      })
      setTimeout(() => process.emit('SIGTERM'), 50)
      return
    }
    if (!line.startsWith(INPUT_PREFIX)) return
    try {
      const json = Buffer.from(line.slice(INPUT_PREFIX.length), 'base64').toString('utf8')
      const frame = JSON.parse(json)
      if (frame.type === 'rpc-call') void handleRpc(frame)
      else if (frame.type === 'stream-open') void handleStreamOpen(frame)
      else if (frame.type === 'stream-credit') {
        const state = streams.get(frame.streamId)
        if (state) grantCredit(state, frame.credit)
      } else if (frame.type === 'stream-cancel') void handleStreamCancel(frame)
      else if (frame.type === 'binary-open') void handleBinary(frame)
      else if (frame.type === 'binary-credit') {
        const state = binaries.get(frame.streamId)
        if (state && Number.isSafeInteger(frame.credit) && frame.credit > 0) {
          state.credits = Math.min(STREAM_CREDIT_LIMIT, state.credits + frame.credit)
          metrics.maxBinaryCreditsObserved = Math.max(metrics.maxBinaryCreditsObserved, state.credits)
          state.wake?.()
          state.wake = null
        }
      }
      else if (frame.type === 'binary-cancel') void handleBinaryCancel(frame)
      else if (frame.type === 'diagnostic-status') void sendStatus(frame)
    } catch (error) {
      writeJson(failureFile, {
        classification: 'NOT_PRODUCTION', pid: process.pid,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })

  ctx.effect(() => () => input.close())

  void sleep(1000).then(async () => {
    const standard = await ctx.agentPresets.resolve('standard')
    writeJson(readyFile, {
      classification: 'NOT_PRODUCTION', pid: process.pid,
      nodeExecutable: process.execPath, nodeVersion: process.version,
      profileName: 'shaco-host', gatewayInvokePresent: typeof ctx.typertGateway.invoke === 'function',
      gatewayWireStreamPresent: typeof ctx.typertGateway.wireStream?.open === 'function',
      connectionFetchPresent: typeof ctx.connection.createSharedFetchHandler === 'function',
      exactRoute: '/api/session.export', standardPresetResolved: standard?.id === 'standard',
      streamCreditLimit: STREAM_CREDIT_LIMIT, binaryChunkBytes: BINARY_CHUNK_BYTES,
      maxBinaryBytes: MAX_BINARY_BYTES, browserAuthConstructed: false, stockWebStarted: false,
    })
  }).catch(error => writeJson(failureFile, {
    classification: 'NOT_PRODUCTION', pid: process.pid,
    message: error instanceof Error ? error.message : String(error),
  }))
}
