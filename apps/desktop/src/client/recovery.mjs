// Nonvisual static Product row. All reads use the frozen public Client faces.
// Reloading the document discards this observer together with the old Context.
export const inject = ['connection', 'workspaces', 'sessions', 'uiWorkspace']
export function apply(ctx) {
  let disposed = false
  let observedSession
  let unsubscribeSession = () => {}
  let lastReport = ''
  const observe = () => {
    if (disposed) return
    const connection = ctx.connection.generation.getSnapshot()
    const workspaces = ctx.workspaces.list.getSnapshot()
    const sessions = ctx.sessions.list.getSnapshot()
    const binding = sessions.current === undefined ? undefined : ctx.sessions.binding(sessions.current)
    const session = binding?.session
    if (session !== observedSession) {
      unsubscribeSession()
      observedSession = session
      unsubscribeSession = session?.subscribe(observe) ?? (() => {})
    }
    const snapshot = session?.getSnapshot()
    const report = {
      clientGenerationReady: connection !== undefined,
      workspaceReady: workspaces.phase === 'ready' && workspaces.state !== 'error',
      sessionRosterReady: sessions.phase === 'ready',
      currentSessionPresent: sessions.current !== undefined,
      currentSessionReady: sessions.phase === 'ready' && (sessions.current === undefined || snapshot?.openState === 'open'),
      projectionFailed: workspaces.state === 'error' || snapshot?.openState === 'error',
    }
    const serialized = JSON.stringify(report)
    if (serialized === lastReport) return
    lastReport = serialized
    // No identity, path, history content, credential or event result crosses IPC.
    void window.shacoForge.bootstrap.reportProjection(report).catch(() => {})
  }
  const unsubscribers = [ctx.connection.generation.subscribe(observe), ctx.workspaces.list.subscribe(observe), ctx.sessions.list.subscribe(observe)]
  observe()
  ctx.effect(() => () => {
    disposed = true
    unsubscribeSession()
    for (const unsubscribe of unsubscribers) unsubscribe()
  }, 'shaco.recovery.observation')
}
