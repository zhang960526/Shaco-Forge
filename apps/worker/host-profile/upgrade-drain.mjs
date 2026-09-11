// Consume public Harness lifecycle/durability seams without inspecting or
// copying any Session contents. The final backup boundary is process exit.
export async function drainHarness(ctx, pendingUnary, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  async function bounded(promise) {
    let timer
    try {
      return await Promise.race([promise, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('DRAIN_TIMEOUT')), Math.max(1, deadline - Date.now()))
      })])
    } finally { clearTimeout(timer) }
  }
  while (pendingUnary.size !== 0) {
    if (Date.now() >= deadline) throw new Error('DRAIN_TIMEOUT')
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  // Includes child agents and maintenance, not just the Desktop's current tab.
  for (;;) {
    if (Date.now() >= deadline) throw new Error('DRAIN_TIMEOUT')
    const agents = ctx.agents.list()
    await bounded(Promise.all(agents.map(agent => agent.whenIdle())))
    const current = ctx.agents.list()
    if (current.length !== agents.length || current.some(agent => !agents.includes(agent) || agent.status !== 'idle')) continue
    const sessions = ctx.sessions.list()
    const flushed = await bounded(Promise.all(sessions.map(session => ctx.sessions.flush(session))))
    if (flushed.some(value => value !== true)) throw new Error('DRAIN_DURABILITY_UNPROVEN')
    if (ctx.agents.list().some(agent => agent.status !== 'idle')) continue
    return { idleAgents: current.length, flushedSessions: sessions.length, pendingUnary: 0, boundary: 'PUBLIC_WHEN_IDLE_AND_SESSION_FLUSH' }
  }
}
