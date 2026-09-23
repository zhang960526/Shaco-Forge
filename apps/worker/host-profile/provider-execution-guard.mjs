import { LlmError } from '@deepseek-ai/dsh-llm'

export const DEFAULT_PRODUCT_MODEL_DISPATCH_BUDGET = 32

const ERRORS = Object.freeze({
  exhausted: Object.freeze({
    code: 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED',
    message: 'This run reached its safe model-call limit. Send a new message to start a new bounded run.',
  }),
  missing: Object.freeze({
    code: 'PROVIDER_EXECUTION_AUTHORITY_MISSING',
    message: 'This run has no live model-call authority. Send a new message to start a bounded run.',
  }),
  stale: Object.freeze({
    code: 'PROVIDER_EXECUTION_AUTHORITY_STALE',
    message: 'This run\'s model-call authority is no longer active. Send a new message to start a new bounded run.',
  }),
  retry: Object.freeze({
    code: 'PROVIDER_EXECUTION_RETRY_POLICY_UNBOUNDED',
    message: 'This acceptance run uses an unbounded retry policy and cannot start.',
  }),
  p8: Object.freeze({
    code: 'PROVIDER_EXECUTION_P8_PROFILE_INELIGIBLE',
    message: 'This acceptance run does not match the authorized text-only provider profile.',
  }),
})

export const name = 'shaco-forge-provider-execution-guard'
export const inject = ['llm', 'agents', 'sessions']

function llmError(kind) {
  const failure = ERRORS[kind]
  return new LlmError(failure.message, failure.code)
}

function normalizeConfig(config = {}) {
  const budget = config.budget ?? DEFAULT_PRODUCT_MODEL_DISPATCH_BUDGET
  if (!Number.isSafeInteger(budget) || budget < 0) {
    throw new Error('provider-execution-guard: budget must be a non-negative safe integer')
  }
  const p8 = config.p8Acceptance
  if (p8 !== undefined && typeof p8 !== 'boolean' && (typeof p8 !== 'object' || p8 === null)) {
    throw new Error('provider-execution-guard: p8Acceptance must be a boolean or object')
  }
  const p8Enabled = p8 === true || (typeof p8 === 'object' && p8.enabled === true)
  const authorizationId = typeof p8 === 'object' ? p8.authorizationId : undefined
  const scenarioId = typeof p8 === 'object' ? p8.scenarioId : undefined
  const retryMaxRetries = typeof p8 === 'object' ? p8.retryMaxRetries : undefined
  if (p8Enabled && (typeof authorizationId !== 'string' || typeof scenarioId !== 'string'
    || (retryMaxRetries !== 0 && retryMaxRetries !== 1))) {
    throw new Error('provider-execution-guard: P8 activation identity and retry ceiling are required')
  }
  return Object.freeze({
    budget,
    p8: Object.freeze({
      enabled: p8Enabled,
      provider: typeof p8 === 'object' && typeof p8.provider === 'string'
        ? p8.provider : 'deepseek-official',
      model: typeof p8 === 'object' && typeof p8.model === 'string'
        ? p8.model : 'deepseek-v4-flash',
      authorizationId,
      scenarioId,
      retryMaxRetries,
    }),
  })
}

function hasImage(options) {
  return options.messages?.some(message => (
    message?.content?.some(block => block?.type === 'image') === true
  )) === true
}

/**
 * Build the process-local guard. The returned snapshot is diagnostic/test-only;
 * authority state never crosses the Host boundary or enters session storage.
 */
export function createProviderExecutionGuard(ctx, rawConfig = {}) {
  const config = normalizeConfig(rawConfig)
  const bootEpoch = Object.freeze({})
  const currentByRoot = new Map()
  const continuableParents = new WeakMap()
  const scenarioPool = config.p8.enabled ? {
    authorizationId: config.p8.authorizationId,
    scenarioId: config.p8.scenarioId,
    bootEpoch,
    initialBudget: config.budget,
    remainingBudget: config.budget,
    usedBudget: 0,
    state: 'ACTIVE',
  } : undefined

  // The continuable manager owns residency and creates registry roots. Bind its
  // unpublished children to exact live parent objects, for this activation only.
  ctx.inject(['subagents'], subCtx => {
    subCtx.subagents.registerContinuableSetup(childCtx => {
      const child = childCtx.agent
      const parent = liveSessionAndAgent(child.session.header.parentSession)
      continuableParents.set(child, {
        childSession: child.session,
        parentAgent: parent.agent,
        parentSession: parent.session,
      })
      return () => { continuableParents.delete(child) }
    })
  })

  function fail(kind) {
    throw llmError(kind)
  }

  function liveSessionAndAgent(sessionId) {
    if (typeof sessionId !== 'string' || sessionId.length === 0) fail('missing')
    const session = ctx.sessions.get(sessionId)
    const agent = ctx.agents.get(sessionId)
    if (session === undefined || agent === undefined || agent.session !== session || agent.id !== session.id) {
      fail('missing')
    }
    const matchingAgents = ctx.agents.list().filter(candidate => candidate.id === sessionId)
    if (matchingAgents.length !== 1 || matchingAgents[0] !== agent) fail('stale')
    return { session, agent }
  }

  function validateRootAgent(agent) {
    const live = liveSessionAndAgent(agent?.id)
    if (live.agent !== agent || live.session.header.parentSession !== undefined) fail('stale')
    const matchingRoots = ctx.agents.roots().filter(candidate => candidate.id === agent.id)
    if (matchingRoots.length !== 1 || matchingRoots[0] !== agent) fail('stale')
    let initiator
    try { initiator = ctx.agents.currentInitiator() }
    catch { fail('missing') }
    if (initiator !== agent) fail('stale')
    return live.session
  }

  function resolveAuthority(options) {
    const leaf = liveSessionAndAgent(options.sessionId)
    let initiator
    try { initiator = ctx.agents.currentInitiator() }
    catch { fail('missing') }
    if (initiator !== leaf.agent) fail('stale')

    const seen = new Set()
    let child = leaf
    for (;;) {
      if (seen.has(child.session.id)) fail('stale')
      seen.add(child.session.id)
      const parentId = child.session.header.parentSession
      if (parentId === undefined) break
      if (typeof parentId !== 'string' || parentId.length === 0) fail('stale')
      const parent = liveSessionAndAgent(parentId)
      if (!ctx.agents.isOwnedBy(child.agent.id, parent.agent)) {
        const binding = continuableParents.get(child.agent)
        if (binding?.childSession !== child.session || binding?.parentAgent !== parent.agent
          || binding?.parentSession !== parent.session || !ctx.agents.roots().includes(child.agent)) fail('stale')
      }
      child = parent
    }

    const roots = ctx.agents.roots().filter(candidate => candidate.id === child.agent.id)
    if (roots.length !== 1 || roots[0] !== child.agent) fail('stale')
    const authority = currentByRoot.get(child.session.id)
    if (authority === undefined) fail('missing')
    if (authority.bootEpoch !== bootEpoch || authority.rootSession !== child.session
      || authority.rootAgent !== child.agent || authority.state === 'TERMINATED') fail('stale')
    if (scenarioPool !== undefined
      && (authority.scenarioPool !== scenarioPool || scenarioPool.bootEpoch !== bootEpoch || scenarioPool.state !== 'ACTIVE')) fail('stale')
    if (authority.state === 'PROVISIONAL'
      && (options.purpose !== 'compaction' || leaf.session !== child.session)) fail('stale')
    return authority
  }

  function admitP8(options) {
    if (!config.p8.enabled) return
    if (options.provider !== config.p8.provider || options.model !== config.p8.model || hasImage(options)) {
      fail('p8')
    }
    let retryPolicy
    try { retryPolicy = ctx.llm.providerRetryPolicy(options.provider) }
    catch { fail('retry') }
    if (retryPolicy?.mode !== 'normal' || retryPolicy.maxRetries !== config.p8.retryMaxRetries) fail('retry')
    return retryPolicy
  }

  async function preStep({ agent, messages, turn, step }, next) {
    const rootHuman = step === 1
      && agent?.session?.header?.parentSession === undefined
      && messages?.some(message => message?.source?.kind === 'user') === true
    if (!rootHuman) return next()

    const rootSession = validateRootAgent(agent)
    const previous = currentByRoot.get(rootSession.id)
    if (previous !== undefined && previous.state !== 'TERMINATED') fail('stale')
    const authority = {
      bootEpoch,
      rootSession,
      rootAgent: agent,
      turn,
      state: 'PROVISIONAL',
      scenarioPool,
      remaining: scenarioPool === undefined ? config.budget : undefined,
      used: scenarioPool === undefined ? 0 : undefined,
    }
    currentByRoot.set(rootSession.id, authority)
    try {
      const decision = await next()
      authority.state = decision?.kind === 'enter' ? 'ACTIVE' : 'TERMINATED'
      return decision
    } catch (error) {
      authority.state = 'TERMINATED'
      throw error
    }
  }

  function stream(options, next) {
    const authority = resolveAuthority(options)
    admitP8(options)
    if (authority.scenarioPool?.remainingBudget === 0 || authority.remaining === 0) fail('exhausted')
    // Synchronous reserve-before-dispatch critical section. There is no await,
    // event emission, adapter work, or promise continuation before decrement.
    if (authority.scenarioPool !== undefined) {
      authority.scenarioPool.remainingBudget -= 1
      authority.scenarioPool.usedBudget += 1
    } else {
      authority.remaining -= 1
      authority.used += 1
    }
    return next()
  }

  function sessionEvent(session, event) {
    if (event?.type !== 'turn/end' || session?.header?.parentSession !== undefined) return
    const authority = currentByRoot.get(session.id)
    if (authority !== undefined && authority.rootSession === session && authority.turn === event.data.turn) {
      authority.state = 'TERMINATED'
    }
  }

  function sessionDisposed(session) {
    const authority = currentByRoot.get(session?.id)
    if (authority !== undefined && authority.rootSession === session) authority.state = 'TERMINATED'
  }

  function snapshot(rootSessionId) {
    const authority = currentByRoot.get(rootSessionId)
    return authority === undefined ? undefined : Object.freeze({
      state: authority.state,
      turn: authority.turn,
      remaining: authority.scenarioPool?.remainingBudget ?? authority.remaining,
      used: authority.scenarioPool?.usedBudget ?? authority.used,
      currentBoot: authority.bootEpoch === bootEpoch,
      scenario: authority.scenarioPool === undefined ? undefined : Object.freeze({
        authorizationId: authority.scenarioPool.authorizationId,
        scenarioId: authority.scenarioPool.scenarioId,
        initialBudget: authority.scenarioPool.initialBudget,
        remainingBudget: authority.scenarioPool.remainingBudget,
        state: authority.scenarioPool.state,
      }),
    })
  }

  function effectiveState() {
    if (scenarioPool === undefined) return Object.freeze({ P8_ENABLED: false })
    const retryPolicy = admitP8({
      provider: config.p8.provider,
      model: config.p8.model,
      messages: [],
    })
    return Object.freeze({
      P8_ENABLED: true,
      SCENARIO_ID: scenarioPool.scenarioId,
      AUTHORIZATION_ID: scenarioPool.authorizationId,
      SCENARIO_BUDGET_INITIAL: scenarioPool.initialBudget,
      SCENARIO_BUDGET_REMAINING: scenarioPool.remainingBudget,
      PROVIDER: config.p8.provider,
      MODEL: config.p8.model,
      INPUT_CLASS: 'text-only',
      RESOLVED_RETRY_MODE: retryPolicy.mode,
      RESOLVED_MAX_RETRIES: retryPolicy.maxRetries,
    })
  }

  return Object.freeze({ preStep, stream, sessionEvent, sessionDisposed, snapshot, effectiveState })
}

export function apply(ctx, config) {
  const guard = createProviderExecutionGuard(ctx, config)
  ctx.provide('shacoForgeProviderExecutionGuard', guard)
  ctx.on('agent/pre-step', guard.preStep, { global: true, prepend: true })
  ctx.on('llm/stream', guard.stream, { global: true, prepend: true })
  ctx.on('session/event', guard.sessionEvent, { global: true })
  ctx.on('session/disposed', guard.sessionDisposed, { global: true })
}
