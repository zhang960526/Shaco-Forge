import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import test from 'node:test'
import { copyFile, mkdir, readFile, realpath, symlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const taskRoot = resolve(process.env.SHACO_FORGE_TEST_ROOT
  ?? join(process.cwd(), '..', 'Shaco-Forge-Test', 'V1-ON-B-WRITER-20260915'))
const overlayModules = resolve(process.env.SHACO_FORGE_HARNESS_OVERLAY_NODE_MODULES
  ?? join(process.cwd(), 'node_modules/.shaco-forge-build/runtime-overlay/node_modules'))
const deepseekScope = join(overlayModules, '@deepseek-ai')
const fixtureRoot = join(taskRoot, 'runtime-import')
const fixtureBundle = join(fixtureRoot, 'node_modules/@shaco-forge/harness-bootstrap')

async function ensureJunction(source, target) {
  await mkdir(dirname(target), { recursive: true })
  try { await symlink(source, target, 'junction') }
  catch (error) {
    if (error.code !== 'EEXIST' || await realpath(source) !== await realpath(target)) throw error
  }
}

async function runtimeModules() {
  await mkdir(fixtureBundle, { recursive: true })
  await ensureJunction(deepseekScope, join(fixtureRoot, 'node_modules/@deepseek-ai'))
  await copyFile(new URL('./provider-execution-guard.mjs', import.meta.url), join(fixtureBundle, 'provider-execution-guard.mjs'))
  await writeFile(join(fixtureBundle, 'package.json'), '{"name":"@shaco-forge/harness-bootstrap","private":true,"type":"module"}\n', 'utf8')
  const fromPackage = name => import(pathToFileURL(join(deepseekScope, name, 'lib/index.js')).href)
  const [guard, cordis, llm, sessions, agents] = await Promise.all([
    import(`${pathToFileURL(join(fixtureBundle, 'provider-execution-guard.mjs')).href}?run=${process.pid}`),
    fromPackage('cordis'),
    fromPackage('dsh-llm'),
    fromPackage('dsh-session'),
    fromPackage('dsh-agent'),
  ])
  return { guard, cordis, llm, sessions, agents, fromPackage }
}

const runtime = await runtimeModules()
const { Context } = runtime.cordis
const { default: LlmRuntime, LlmAdapter, createUserMessage, resolveRetryPolicy } = runtime.llm
const { default: SessionStore, SessionId } = runtime.sessions
const { default: AgentRegistry, agentEvents } = runtime.agents

function textMessage(text = 'hello') {
  return createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
}

function textResponse(text = 'ok') {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

class CountingAdapter extends LlmAdapter {
  constructor({ policy, outcomes = [] } = {}) {
    super()
    this.calls = 0
    this.requests = []
    this.policy = policy
    this.outcomes = [...outcomes]
  }
  providerRetryPolicy() { return this.policy }
  async * stream(options) {
    this.calls += 1
    this.requests.push(options)
    const outcome = this.outcomes.shift()
    if (outcome instanceof Error) throw outcome
    yield* outcome ?? textResponse()
  }
}

async function makeContext({ budget = 32, p8Acceptance = false, routes = ['mock'], adapter } = {}) {
  const ctx = new Context()
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SessionStore)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(runtime.guard, { budget, p8Acceptance })
  const activeAdapter = adapter ?? new CountingAdapter()
  ctx.llm.registerAdapter(routes, activeAdapter)
  return { ctx, adapter: activeAdapter }
}

function enterAgent(ctx, id, { parent, durableParent = parent?.id } = {}) {
  const session = ctx.sessions.create(SessionId(id), durableParent === undefined
    ? undefined : { meta: { parentSession: SessionId(durableParent) } })
  const agent = { id: session.id, session }
  ctx.agents.enter(agent, parent)
  return agent
}

async function activate(ctx, agent, { turn = 1, decision = { kind: 'enter' }, during } = {}) {
  const messages = [textMessage()]
  return ctx.agents.withInitiator(agent, () => agentEvents(ctx, agent).waterfall(
    'agent/pre-step',
    { messages, turn, step: 1, signal: new AbortController().signal },
    async () => {
      await during?.()
      if (decision instanceof Error) throw decision
      return decision.kind === 'enter' ? { kind: 'enter', messages } : decision
    },
  ))
}

function request(agent, extra = {}) {
  return {
    provider: 'mock',
    model: 'model',
    messages: [textMessage()],
    sessionId: agent.session.id,
    ...extra,
  }
}

function stream(ctx, agent, options = request(agent)) {
  return ctx.agents.withInitiator(agent, () => ctx.llm.stream(options))
}

async function drain(iterable) {
  const chunks = []
  for await (const chunk of iterable) chunks.push(chunk)
  return chunks
}

function expectCode(error, code) {
  assert.equal(error?.name, 'LlmError')
  assert.equal(error?.code, code)
  assert.equal(error?.failure?.code, code)
  assert.ok(typeof error?.message === 'string' && error.message.length > 0)
  return true
}

test('budget N permits exactly N, N+1 and budget zero stop before next/adapter, and reservations never refund', async () => {
  const { ctx, adapter } = await makeContext({ budget: 2 })
  try {
    const root = enterAgent(ctx, 'budget-root')
    await activate(ctx, root)
    await drain(stream(ctx, root))
    await drain(stream(ctx, root))
    assert.throws(() => stream(ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
    assert.equal(adapter.calls, 2)
  } finally { await ctx.fiber.dispose() }

  const zero = await makeContext({ budget: 0 })
  try {
    const root = enterAgent(zero.ctx, 'zero-root')
    await activate(zero.ctx, root)
    assert.throws(() => stream(zero.ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
    assert.equal(zero.adapter.calls, 0)
  } finally { await zero.ctx.fiber.dispose() }

  const failing = new CountingAdapter({ outcomes: [new Error('adapter outcome unknown')] })
  const noRefund = await makeContext({ budget: 1, adapter: failing })
  try {
    const root = enterAgent(noRefund.ctx, 'no-refund-root')
    await activate(noRefund.ctx, root)
    const chunks = await drain(stream(noRefund.ctx, root))
    assert.equal(chunks.at(-1)?.reason?.kind, 'error')
    assert.throws(() => stream(noRefund.ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
    assert.equal(failing.calls, 1)
  } finally { await noRefund.ctx.fiber.dispose() }
})

test('provisional authority counts only same-root compaction and reject/throw terminate without refund', async () => {
  const entered = await makeContext({ budget: 2 })
  try {
    const root = enterAgent(entered.ctx, 'provisional-enter')
    await activate(entered.ctx, root, { during: () => drain(stream(entered.ctx, root, request(root, { purpose: 'compaction' }))) })
    await drain(stream(entered.ctx, root))
    assert.throws(() => stream(entered.ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
    assert.equal(entered.adapter.calls, 2)
  } finally { await entered.ctx.fiber.dispose() }

  for (const [id, decision] of [['reject', { kind: 'reject' }], ['throw', new Error('downstream pre-step failed')]]) {
    const harness = await makeContext({ budget: 2 })
    try {
      const root = enterAgent(harness.ctx, `provisional-${id}`)
      const run = activate(harness.ctx, root, {
        decision,
        during: () => drain(stream(harness.ctx, root, request(root, { purpose: 'compaction' }))),
      })
      if (decision instanceof Error) await assert.rejects(run, /downstream pre-step failed/)
      else assert.equal((await run).kind, 'reject')
      assert.throws(() => stream(harness.ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_STALE'))
      assert.equal(harness.adapter.calls, 1, `${id} refunded provisional compaction`)
    } finally { await harness.ctx.fiber.dispose() }
  }
})

test('main, title, tool continuation, parent-after-child, and explicit retry-shaped dispatches share one authority', async () => {
  const { ctx, adapter } = await makeContext({ budget: 7 })
  try {
    const root = enterAgent(ctx, 'shared-root')
    const child = enterAgent(ctx, 'shared-child', { parent: root })
    await activate(ctx, root)
    await drain(stream(ctx, root))
    await drain(stream(ctx, root, request(root, { purpose: 'session-title' })))
    await drain(stream(ctx, root))
    await drain(stream(ctx, root))
    await drain(stream(ctx, child, request(child)))
    await drain(stream(ctx, root))
    await drain(stream(ctx, root))
    assert.equal(adapter.calls, 7)
    assert.throws(() => stream(ctx, child, request(child)), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
  } finally { await ctx.fiber.dispose() }
})

test('remaining one is synchronously reserved by only one concurrent caller', async () => {
  const { ctx, adapter } = await makeContext({ budget: 1 })
  try {
    const root = enterAgent(ctx, 'concurrent-root')
    await activate(ctx, root)
    const winner = stream(ctx, root)
    assert.throws(() => stream(ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
    await drain(winner)
    assert.equal(adapter.calls, 1)
  } finally { await ctx.fiber.dispose() }
})

test('recursive lineage accepts nested children and fails closed for missing, cycle, owner mismatch, ambiguous, and terminated roots', async () => {
  const legal = await makeContext({ budget: 4 })
  try {
    const root = enterAgent(legal.ctx, 'lineage-root')
    const child = enterAgent(legal.ctx, 'lineage-child', { parent: root })
    const grandchild = enterAgent(legal.ctx, 'lineage-grandchild', { parent: child })
    await activate(legal.ctx, root)
    await drain(stream(legal.ctx, child, request(child)))
    await drain(stream(legal.ctx, grandchild, request(grandchild)))
    await drain(stream(legal.ctx, root))

    const missing = enterAgent(legal.ctx, 'lineage-missing', { parent: root, durableParent: 'absent-parent' })
    assert.throws(() => stream(legal.ctx, missing, request(missing)), error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_MISSING'))

    const other = enterAgent(legal.ctx, 'lineage-other')
    const mismatch = enterAgent(legal.ctx, 'lineage-mismatch', { parent: other, durableParent: root.id })
    assert.throws(() => stream(legal.ctx, mismatch, request(mismatch)), error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_STALE'))

    const cycleSession = legal.ctx.sessions.create(SessionId('lineage-cycle'), { meta: { parentSession: SessionId('lineage-cycle') } })
    const cycle = { id: cycleSession.id, session: cycleSession }
    legal.ctx.agents.enter(cycle, cycle)
    assert.throws(() => stream(legal.ctx, cycle, request(cycle)), error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_STALE'))

    root.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    assert.throws(() => stream(legal.ctx, child, request(child)), error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_STALE'))
  } finally { await legal.ctx.fiber.dispose() }

  const session = { id: 'ambiguous', header: {}, append() {} }
  const agent = { id: 'ambiguous', session }
  const fakeCtx = {
    sessions: { get: id => id === session.id ? session : undefined },
    agents: {
      get: id => id === agent.id ? agent : undefined,
      list: () => [agent, { id: agent.id, session }],
      roots: () => [agent],
      currentInitiator: () => agent,
      isOwnedBy: () => false,
    },
    llm: {},
  }
  const guard = runtime.guard.createProviderExecutionGuard(fakeCtx, { budget: 1 })
  await assert.rejects(guard.preStep({ agent, messages: [textMessage()], turn: 1, step: 1 }, async () => ({ kind: 'enter', messages: [] })),
    error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_STALE'))
})

test('Desktop reconnect retains budget; Host/Worker restart inherits none; a new Human root turn gets a new authority', async () => {
  const first = await makeContext({ budget: 2 })
  try {
    const root = enterAgent(first.ctx, 'restart-root')
    await activate(first.ctx, root)
    await drain(stream(first.ctx, root))
    // A Desktop-only reconnect does not touch Host state.
    await Promise.resolve()
    await drain(stream(first.ctx, root))
    assert.throws(() => stream(first.ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
    root.session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    await activate(first.ctx, root, { turn: 2 })
    await drain(stream(first.ctx, root))
    assert.equal(first.adapter.calls, 3)
  } finally { await first.ctx.fiber.dispose() }

  for (const restart of ['Host', 'Worker']) {
    const fresh = await makeContext({ budget: 1 })
    try {
      const root = enterAgent(fresh.ctx, 'restart-root')
      assert.throws(() => stream(fresh.ctx, root), error => expectCode(error, 'PROVIDER_EXECUTION_AUTHORITY_MISSING'))
      assert.equal(fresh.adapter.calls, 0, `${restart} restart inherited an old authority`)
      await activate(fresh.ctx, root, { turn: 2 })
      await drain(stream(fresh.ctx, root))
      assert.equal(fresh.adapter.calls, 1)
    } finally { await fresh.ctx.fiber.dispose() }
  }
})

test('P8 rejects always before first dispatch while Product custom/pi-ai and image requests remain adapter-neutral', async () => {
  const always = new CountingAdapter({ policy: resolveRetryPolicy({ mode: 'always', backoff: { initialDelayMs: 1, maxDelayMs: 1, jitterRatio: 0 } }, 'test') })
  const p8 = await makeContext({
    budget: 2,
    p8Acceptance: { enabled: true, provider: 'deepseek-official', model: 'deepseek-v4-flash' },
    routes: ['deepseek-official'],
    adapter: always,
  })
  try {
    const root = enterAgent(p8.ctx, 'p8-always')
    await activate(p8.ctx, root)
    assert.throws(() => stream(p8.ctx, root, request(root, { provider: 'deepseek-official', model: 'deepseek-v4-flash' })),
      error => expectCode(error, 'PROVIDER_EXECUTION_RETRY_POLICY_UNBOUNDED'))
    assert.equal(always.calls, 0)
  } finally { await p8.ctx.fiber.dispose() }

  const product = await makeContext({ budget: 3, routes: ['custom', 'pi-ai'] })
  try {
    const root = enterAgent(product.ctx, 'adapter-neutral')
    await activate(product.ctx, root)
    await drain(stream(product.ctx, root, request(root, { provider: 'custom' })))
    await drain(stream(product.ctx, root, request(root, { provider: 'pi-ai' })))
    const image = { type: 'image', attachment: { attachmentId: 'sha256:test', mediaType: 'image/png', bytes: 1, width: 1, height: 1 } }
    await drain(stream(product.ctx, root, request(root, { provider: 'custom', messages: [{ ...textMessage(), content: [image] }] })))
    assert.equal(product.adapter.calls, 3)
  } finally { await product.ctx.fiber.dispose() }
})

test('frozen normal retry re-enters llm/stream and consumes one reservation per attempt', async () => {
  const { default: SystemPrompt } = await runtime.fromPackage('dsh-system-prompt')
  const { default: ToolRuntime } = await runtime.fromPackage('dsh-tools')
  const { default: AgentLoop } = await runtime.fromPackage('dsh-agent-loop')
  const LlmRetry = await runtime.fromPackage('dsh-llm-retry')
  const policy = resolveRetryPolicy({
    mode: 'normal', maxRetries: 2, retryableCodes: ['SERVER'],
    backoff: { initialDelayMs: 1, maxDelayMs: 1, jitterRatio: 0 },
  }, 'test')
  const adapter = new CountingAdapter({ policy, outcomes: [
    [{ type: 'finish', reason: { kind: 'error', failure: { code: 'SERVER', message: 'retry one' } } }],
    [{ type: 'finish', reason: { kind: 'error', failure: { code: 'SERVER', message: 'retry two' } } }],
    textResponse('done'),
  ] })
  const ctx = new Context()
  try {
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(LlmRetry)
    await ctx.plugin(runtime.guard, { budget: 3 })
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('retry-root'), { provider: 'mock', model: 'model' })
    agent.followup(textMessage('retry'))
    await agent.whenIdle()
    assert.equal(adapter.calls, 3)
    assert.equal(agent.session.events.findLast(event => event.type === 'turn/end')?.data.reason.kind, 'completed')
  } finally { await ctx.fiber.dispose() }
})

test('frozen first-prompt title scheduling and main dispatch reserve from the same root authority', async () => {
  const { default: SystemPrompt } = await runtime.fromPackage('dsh-system-prompt')
  const { default: ToolRuntime } = await runtime.fromPackage('dsh-tools')
  const { default: AgentLoop } = await runtime.fromPackage('dsh-agent-loop')
  const { default: SessionTitle } = await runtime.fromPackage('dsh-session-title')
  const ctx = new Context()
  const adapter = new CountingAdapter()
  try {
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(SessionTitle, { fallbackMaxWords: 4, fallbackMaxBytes: 64, maxTitleBytes: 128 })
    await ctx.plugin(runtime.guard, { budget: 2 })
    ctx.llm.registerAdapter(['mock'], adapter)
    ctx.sessionTitle.register({
      id: 'guard-test-title',
      automatic: 'first-prompt',
      async generate({ session, messages, route, signal }) {
        await drain(ctx.llm.stream({
          provider: route.provider,
          model: route.model,
          messages: [textMessage('title')],
          sessionId: session.id,
          purpose: 'session-title',
          signal,
        }))
        return {
          title: 'Guarded title',
          messageSeqs: messages.map(message => message.seq),
          model: route,
        }
      },
    })
    const titleAccepted = new Promise(resolveTitle => {
      const dispose = ctx.on('session/event', (session, event) => {
        if (event.type === 'session/title' && event.data.source.kind === 'provider') {
          dispose()
          resolveTitle(session)
        }
      })
    })
    const agent = ctx.agentLoop.create(SessionId('title-root'), { provider: 'mock', model: 'model' })
    agent.followup(textMessage('first prompt'))
    await Promise.all([agent.whenIdle(), titleAccepted])
    assert.equal(adapter.calls, 2)
    assert.equal(adapter.requests.filter(options => options.purpose === 'session-title').length, 1)
    assert.equal(adapter.requests.filter(options => options.purpose === undefined).length, 1)
    assert.ok(adapter.requests.every(options => options.sessionId === agent.session.id))
    assert.equal(agent.session.events.findLast(event => event.type === 'turn/end')?.data.reason.kind, 'completed')
  } finally { await ctx.fiber.dispose() }
})

test('budget exhaustion is a stable LlmError and frozen AgentLoop settles the turn as error', async () => {
  const { default: SystemPrompt } = await runtime.fromPackage('dsh-system-prompt')
  const { default: ToolRuntime } = await runtime.fromPackage('dsh-tools')
  const { default: AgentLoop } = await runtime.fromPackage('dsh-agent-loop')
  const ctx = new Context()
  const adapter = new CountingAdapter()
  try {
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(runtime.guard, { budget: 0 })
    ctx.llm.registerAdapter(['mock'], adapter)
    const agent = ctx.agentLoop.create(SessionId('error-root'), { provider: 'mock', model: 'model' })
    agent.followup(textMessage('exhaust'))
    await agent.whenIdle()
    const end = agent.session.events.findLast(event => event.type === 'turn/end')
    assert.equal(end?.data.reason.kind, 'error')
    assert.equal(end?.data.reason.error.code, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED')
    assert.equal(end?.data.reason.error.message,
      'This run reached its safe model-call limit. Send a new message to start a new bounded run.')
    assert.notEqual(end?.data.reason.kind, 'completed')
    assert.equal(adapter.calls, 0)
  } finally { await ctx.fiber.dispose() }
})

test('frozen DeepSeek text-only adapter performs at most one loopback /chat/completions request per guarded dispatch', async () => {
  const requests = []
  const server = createServer((req, res) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      requests.push({ url: req.url, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) })
      const events = [
        '{"choices":[{"delta":{"role":"assistant","content":null,"reasoning_content":""}}]}',
        '{"choices":[{"delta":{"content":"hello"}}]}',
        '{"choices":[{"delta":{"content":""},"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":1}}',
        '[DONE]',
      ]
      res.writeHead(200, { 'content-type': 'text/event-stream' })
      res.end(events.map(event => `data: ${event}\n\n`).join(''))
    })
  })
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  try {
    const address = server.address()
    assert.ok(address && typeof address === 'object')
    const deepseek = await import(pathToFileURL(join(deepseekScope, 'dsh-llm-deepseek/lib/index.js')).href)
    const { DeepSeekAdapter } = deepseek
    const options = deepseek.resolveAdapterOptions({
      baseURL: `http://127.0.0.1:${address.port}`,
      models: [{ id: 'deepseek-v4-flash', inputModalities: ['text'] }],
      retryPolicy: { mode: 'normal', maxRetries: 0 },
    })
    const adapter = new DeepSeekAdapter({
      options: () => options,
      resolveApiKey: () => Promise.resolve('invalid-placeholder-key'),
      resolveUserId: () => '00000000-0000-4000-8000-000000000001',
      prepareExtensions: () => Promise.resolve({ fields: {}, accept: () => Promise.resolve() }),
    })
    const harness = await makeContext({
      budget: 1,
      p8Acceptance: { enabled: true, provider: 'deepseek-official', model: 'deepseek-v4-flash' },
      routes: ['deepseek-official'],
      adapter,
    })
    try {
      const root = enterAgent(harness.ctx, 'deepseek-loopback')
      await activate(harness.ctx, root)
      await drain(stream(harness.ctx, root, request(root, {
        provider: 'deepseek-official', model: 'deepseek-v4-flash', messages: [textMessage('tiny synthetic prompt')],
      })))
      assert.equal(requests.length, 1)
      assert.equal(requests[0].url, '/chat/completions')
      assert.equal(requests[0].body.model, 'deepseek-v4-flash')
      assert.equal(JSON.stringify(requests[0].body).includes('image_url'), false)
      assert.throws(() => stream(harness.ctx, root, request(root, {
        provider: 'deepseek-official', model: 'deepseek-v4-flash',
      })), error => expectCode(error, 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'))
      assert.equal(requests.length, 1)
    } finally { await harness.ctx.fiber.dispose() }
  } finally { await new Promise(resolveClose => server.close(resolveClose)) }
})

test('production profile exports, copies, and inserts the guard exactly once and closure resolves its public import', async () => {
  const { materializeHarnessProfile } = await import(new URL('../dist/profile.js', import.meta.url))
  const { discoverProductionRoots } = await import(new URL('../../../scripts/harness-production-closure.mjs', import.meta.url))
  const home = join(taskRoot, 'production-profile')
  const profile = await materializeHarnessProfile(
    home,
    'shaco-forge',
    resolve('apps/worker/dist/harness-readiness.js'),
    resolve('apps/worker/host-profile/connection-compatibility.mjs'),
    resolve('apps/worker/host-profile/carrier-gateway.mjs'),
    resolve('apps/worker/host-profile/events-route-preflight.mjs'),
    deepseekScope,
    overlayModules,
  )
  const bundle = join(profile, 'node_modules/@shaco-forge/harness-bootstrap')
  const manifest = JSON.parse(await readFile(join(bundle, 'package.json'), 'utf8'))
  const patch = await readFile(join(bundle, 'cordis.patch.yml'), 'utf8')
  const copied = await readFile(join(bundle, 'provider-execution-guard.mjs'))
  const source = await readFile('apps/worker/host-profile/provider-execution-guard.mjs')
  assert.equal(manifest.exports['./provider-execution-guard'], './provider-execution-guard.mjs')
  assert.equal(Object.keys(manifest.exports).filter(key => key === './provider-execution-guard').length, 1)
  assert.equal((patch.match(/name: '@shaco-forge\/harness-bootstrap\/provider-execution-guard'/g) ?? []).length, 1)
  assert.equal((patch.match(/budget: 32/g) ?? []).length, 1)
  assert.equal((patch.match(/p8Acceptance: false/g) ?? []).length, 1)
  assert.equal(createHash('sha256').update(copied).digest('hex'), createHash('sha256').update(source).digest('hex'))
  const roots = await discoverProductionRoots({ overlay: overlayModules, profile, bootstrap: bundle })
  assert.ok(roots.some(row => row.name === '@deepseek-ai/dsh-llm'
    && row.reasons.some(reason => reason.reason === 'SHACO_OWNED_BOOTSTRAP_RUNTIME_IMPORT')))
})
