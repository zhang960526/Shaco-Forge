/**
 * NOT_PRODUCTION P0.S-5 Host lifecycle fixture and stdio carrier adapter.
 * The fixture uses public Gateway, Agent, Approval, Question, and Connection
 * surfaces only. Its deterministic controls exist solely for Spike evidence.
 */
import { randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { createInterface } from 'node:readline'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'

export const name = 'p0s5-carrier-gateway'
export const inject = ['typertGateway', 'agentPresets', 'connection', 'agents', 'approval', 'userQuestions']

const RESPONSE_PREFIX = 'P0S5_FRAME '
const INPUT_PREFIX = 'P0S5_IN '
const STREAM_CREDIT_LIMIT = 4

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  renameSync(temporary, path)
}

let hostSequence = 0
function hostEvent(type, details = {}) {
  const eventFile = process.env.P0S5_HOST_EVENTS_FILE
  const value = {
    recordId: randomUUID(),
    source: 'host-harness',
    sourceSequence: ++hostSequence,
    monotonicTicks: process.hrtime.bigint().toString(),
    utc: new Date().toISOString(),
    workerInstanceId: process.env.P0S5_WORKER_INSTANCE_ID,
    type,
    ...details,
  }
  appendFileSync(eventFile, `${JSON.stringify(value)}\n`, 'utf8')
  return value
}

async function writeLine(line) {
  if (process.stdout.write(line)) return
  await new Promise(resolve => process.stdout.once('drain', resolve))
}

async function send(value) {
  const json = JSON.stringify(value)
  await writeLine(`${RESPONSE_PREFIX}${Buffer.from(json, 'utf8').toString('base64')}\n`)
}

function methodContext(name, initializers) {
  return {
    kind: 'method',
    name,
    static: false,
    private: false,
    access: { has: object => name in object, get: object => object[name] },
    addInitializer(initializer) {
      initializers.push(initializer)
    },
  }
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((accept, fail) => {
    resolve = accept
    reject = fail
  })
  return { promise, resolve, reject }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const fixtureInitializers = []

class P0S5LifecycleFixture extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'p0s5LifecycleFixture', { namespace: 'p0s5Fixture' })
    this.ctx = ctx
    this.handles = new Map()
    this.running = new Map()
    this.approvalSettlements = 0
    this.questionSettlements = 0
    this.cancelCompletions = 0
    this.agentStartAuthorityCount = 0
    this.agentResumeAuthorityCount = 0
    for (const initialize of fixtureInitializers) initialize.call(this)
    ctx.effect(() => async () => {
      await Promise.all([...this.handles.values()].map(handle => handle.dispose()))
      this.handles.clear()
    })
  }

  async ensureAgent(label, setup) {
    const current = this.handles.get(label)
    if (current) return current.agent
    const sessionId = randomUUID()
    const handle = await this.ctx.agents.create({
      sessionId,
      meta: { cwd: process.cwd(), agentPreset: 'standard' },
      ...(setup ? { setup } : {}),
    })
    this.handles.set(label, handle)
    this.agentStartAuthorityCount += 1
    hostEvent('agent_start_authority', {
      label,
      sessionId,
      agentId: handle.agent.id,
      authority: 'Host/Harness agents.create',
      origin: 'explicit-test-fixture',
    })
    return handle.agent
  }

  async startRunningTurn(request) {
    const label = String(request?.label ?? 'running')
    if (this.running.has(label)) return this.runningSnapshot(label)
    const entered = deferred()
    const state = {
      label,
      entered: false,
      turn: null,
      step: null,
      turnId: null,
      cancelCount: 0,
    }
    const agent = await this.ensureAgent(label, agentCtx => {
      agentCtx.on('agent/pre-step', async ({ agent: scopedAgent, turn, step, signal }) => {
        state.entered = true
        state.turn = turn
        state.step = step
        state.turnId = `${scopedAgent.id}:turn:${turn}`
        hostEvent('agent_pre_step_blocked', {
          label,
          sessionId: scopedAgent.id,
          agentId: scopedAgent.id,
          turn,
          step,
          turnId: state.turnId,
          agentStatus: scopedAgent.status,
        })
        entered.resolve()
        await new Promise((resolve, reject) => {
          const finish = () => {
            const reasonKind = signal.reason?.kind ?? null
            if (reasonKind !== 'disposed') {
              state.cancelCount += 1
              this.cancelCompletions += 1
              hostEvent('agent_cancel_completion', {
                label,
                sessionId: scopedAgent.id,
                agentId: scopedAgent.id,
                turn,
                turnId: state.turnId,
                reasonKind,
              })
            }
            reject(signal.reason ?? new Error('Agent pre-step aborted'))
          }
          if (signal.aborted) finish()
          else signal.addEventListener('abort', finish, { once: true })
        })
        return { kind: 'reject' }
      })
    })
    this.running.set(label, state)
    agent.followup(createUserMessage({
      content: [{ type: 'text', text: `P0.S-5 deterministic running turn ${label}` }],
      source: { kind: 'user' },
    }))
    await Promise.race([
      entered.promise,
      sleep(10000).then(() => { throw new Error(`Timed out entering real agent/pre-step for ${label}`) }),
    ])
    if (agent.status !== 'running') throw new Error(`Agent ${label} is not running after pre-step entry`)
    return this.runningSnapshot(label)
  }

  runningSnapshot(label) {
    const handle = this.handles.get(label)
    const state = this.running.get(label)
    if (!handle || !state) return null
    return {
      label,
      sessionId: handle.agent.id,
      agentId: handle.agent.id,
      turn: state.turn,
      turnId: state.turnId,
      step: state.step,
      status: handle.agent.status,
      cancelCount: state.cancelCount,
    }
  }

  async approvalRoundTrip(request) {
    const label = String(request?.label ?? 'approval')
    const agent = await this.ensureAgent(label)
    const turn = 1 + agent.session.events.filter(event => event.type === 'turn/start').length
    agent.session.append('turn/start', { turn })
    hostEvent('approval_pending', { label, sessionId: agent.id, agentId: agent.id, turn })
    try {
      const outcome = await this.ctx.approval.request({
        agent,
        toolName: 'p0s5-not-production-fixture',
        reason: 'P0.S-5 deterministic replay proof',
      })
      this.approvalSettlements += 1
      hostEvent('approval_settled', {
        label,
        sessionId: agent.id,
        settlementCount: this.approvalSettlements,
      })
      return { outcome, sessionId: agent.id, settlementCount: this.approvalSettlements }
    } finally {
      agent.session.append('turn/end', { turn, reason: { kind: 'completed' } })
    }
  }

  async questionRoundTrip(request) {
    const label = String(request?.label ?? 'question')
    const agent = await this.ensureAgent(label)
    hostEvent('question_pending', { label, sessionId: agent.id, agentId: agent.id })
    const answer = await this.ctx.userQuestions.ask({
      agent,
      questions: [{
        id: 'p0s5-choice',
        header: 'P0.S-5',
        question: 'Choose the deterministic replay-proof answer.',
        options: [
          { label: 'Alpha', description: 'First deterministic answer.' },
          { label: 'Beta', description: 'Second deterministic answer.' },
        ],
      }],
    })
    this.questionSettlements += 1
    hostEvent('question_settled', {
      label,
      sessionId: agent.id,
      settlementCount: this.questionSettlements,
    })
    return { answer, sessionId: agent.id, settlementCount: this.questionSettlements }
  }

  status() {
    const agents = [...this.handles.entries()].map(([label, handle]) => {
      const turnStarts = handle.agent.session.events.filter(event => event.type === 'turn/start')
      const running = this.running.get(label)
      return {
        label,
        sessionId: handle.agent.id,
        agentId: handle.agent.id,
        status: handle.agent.status,
        turnCreationCount: turnStarts.length,
        currentTurn: running?.turn ?? turnStarts.at(-1)?.data?.turn ?? null,
        turnId: running?.turnId ?? null,
        approvalDecisions: handle.agent.session.events.filter(event => event.type === 'approval/decided').length,
      }
    })
    return {
      workerInstanceId: process.env.P0S5_WORKER_INSTANCE_ID,
      agentStartAuthorityCount: this.agentStartAuthorityCount,
      agentResumeAuthorityCount: this.agentResumeAuthorityCount,
      turnCreationCount: agents.reduce((sum, agent) => sum + agent.turnCreationCount, 0),
      approvalSettlements: this.approvalSettlements,
      questionSettlements: this.questionSettlements,
      cancelCompletions: this.cancelCompletions,
      agents,
    }
  }
}

for (const method of ['startRunningTurn', 'approvalRoundTrip', 'questionRoundTrip', 'status']) {
  Remote(P0S5LifecycleFixture.prototype[method], methodContext(method, fixtureInitializers))
}

export function apply(ctx) {
  const readyFile = process.env.P0S5_DSH_READY_FILE
  const summaryFile = process.env.P0S5_DSH_SUMMARY_FILE
  const failureFile = process.env.P0S5_DSH_FAILURE_FILE
  const fixture = new P0S5LifecycleFixture(ctx)
  const sharedFetch = ctx.connection.createSharedFetchHandler('/api')
  const streams = new Map()
  const metrics = {
    gatewayDispatchCount: 0,
    streamOpenCount: 0,
    streamCancelCount: 0,
    maxStreamCreditsObserved: 0,
  }
  let stopping = false

  async function connectionCall(endpoint, payload, requestId) {
    const response = await sharedFetch.fetch(new Request(`http://p0s5.invalid/api/${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'client-request', rpcId: requestId, method: endpoint, payload }),
    }))
    return response.json()
  }

  async function handleRpc(frame) {
    metrics.gatewayDispatchCount += 1
    hostEvent('gateway_rpc_dispatch', {
      endpoint: frame.endpoint,
      requestId: frame.requestId,
      probeSource: frame.probeSource ?? null,
      ordinal: metrics.gatewayDispatchCount,
    })
    try {
      const response = await connectionCall(frame.endpoint, frame.payload, frame.requestId)
      await send({ type: 'rpc-response', requestId: frame.requestId, result: response.result })
    } catch (error) {
      await send({
        type: 'rpc-response',
        requestId: frame.requestId,
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
          await send({ type: 'stream-end', requestId: frame.requestId, streamId: frame.streamId })
          return
        }
        await send({ type: 'stream-item', requestId: frame.requestId, streamId: frame.streamId, value: result.value })
      }
    } catch (error) {
      await send({
        type: state.controller.signal.aborted ? 'stream-cancelled' : 'stream-error',
        requestId: frame.requestId,
        streamId: frame.streamId,
        message: String(error?.message ?? error),
      })
    } finally {
      streams.delete(frame.streamId)
    }
  }

  function handleStreamOpen(frame) {
    metrics.streamOpenCount += 1
    const state = { controller: new AbortController(), iterator: null, credits: 0, wake: null }
    streams.set(frame.streamId, state)
    grantCredit(state, frame.initialCredit ?? 0)
    void pumpStream(frame, state)
  }

  async function handleStreamCancel(frame) {
    const state = streams.get(frame.streamId)
    if (!state) return
    metrics.streamCancelCount += 1
    state.controller.abort(new Error(`P0.S-5 stream cancelled: ${frame.reason ?? 'consumer'}`))
    state.wake?.()
    try {
      await state.iterator?.return?.()
    } catch {
      // Cancellation is already represented by the stream terminal record.
    }
  }

  const input = createInterface({ input: process.stdin, terminal: false })
  input.on('line', line => {
    if (line === 'P0S5_CONTROL_STOP') {
      if (stopping) return
      stopping = true
      for (const state of streams.values()) state.controller.abort(new Error('P0.S-5 graceful stop'))
      writeJson(summaryFile, {
        classification: 'NOT_PRODUCTION',
        pid: process.pid,
        ...metrics,
        fixture: fixture.status(),
        seams: [
          'connection.createSharedFetchHandler(/api)',
          'typertGateway.wireStream.open',
          '$events',
          '$events/result',
          'agents.create',
          'agent/pre-step',
        ],
        browserAuthConstructed: false,
        stockWebStarted: false,
      })
      hostEvent('host_graceful_stop', { activeStreams: streams.size })
      setTimeout(() => process.emit('SIGTERM'), 50)
      return
    }
    if (!line.startsWith(INPUT_PREFIX)) return
    try {
      const frame = JSON.parse(Buffer.from(line.slice(INPUT_PREFIX.length), 'base64').toString('utf8'))
      if (frame.type === 'rpc-call') void handleRpc(frame)
      else if (frame.type === 'stream-open') handleStreamOpen(frame)
      else if (frame.type === 'stream-credit') {
        const state = streams.get(frame.streamId)
        if (state) grantCredit(state, frame.credit)
      } else if (frame.type === 'stream-cancel') void handleStreamCancel(frame)
      else if (frame.type === 'diagnostic-status') {
        void send({
          type: 'diagnostic-status-response',
          requestId: frame.requestId,
          ...metrics,
          activeStreams: streams.size,
          fixture: fixture.status(),
        })
      }
    } catch (error) {
      writeJson(failureFile, {
        classification: 'NOT_PRODUCTION',
        pid: process.pid,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })

  ctx.effect(() => () => input.close())

  void sleep(1000).then(async () => {
    const standard = await ctx.agentPresets.resolve('standard')
    writeJson(readyFile, {
      classification: 'NOT_PRODUCTION',
      pid: process.pid,
      nodeExecutable: process.execPath,
      nodeVersion: process.version,
      profileName: 'shaco-host',
      gatewayInvokePresent: typeof ctx.typertGateway.invoke === 'function',
      gatewayWireStreamPresent: typeof ctx.typertGateway.wireStream?.open === 'function',
      connectionFetchPresent: typeof ctx.connection.createSharedFetchHandler === 'function',
      standardPresetResolved: standard?.id === 'standard',
      streamCreditLimit: STREAM_CREDIT_LIMIT,
      browserAuthConstructed: false,
      stockWebStarted: false,
    })
    hostEvent('host_ready', { pid: process.pid, standardPresetResolved: standard?.id === 'standard' })
  }).catch(error => writeJson(failureFile, {
    classification: 'NOT_PRODUCTION',
    pid: process.pid,
    message: error instanceof Error ? error.message : String(error),
  }))
}
