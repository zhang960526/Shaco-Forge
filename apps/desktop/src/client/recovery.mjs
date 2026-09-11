import { createShellState } from './shell-state.mjs'
import { ShacoRoot } from './shaco-root.mjs'
// Same static Product row. All reads use the frozen public Client faces.
// Reloading the document discards this observer together with the old Context.
export const inject = ['connection', 'workspaces', 'sessions', 'uiWorkspace', 'uiSession', 'uiConversation', 'conversation', 'modelDirectories', 'slots', 'layout', 'settingsScope', 'settingsSchema', 'remote', 'remote.session', 'remote.llm', 'remote.settings', 'remote.credentials']
export function apply(ctx) {
  const shell = createShellState(ctx, window.shacoForge.workspace)
  const presentation = window.__SHACO_PRESENTATION__
  if (!presentation?.harnessReady) throw new Error('SHACO_HARNESS_BARRIER_REQUIRED')
  // Read-only continuity evidence. Closures return only equality booleans;
  // no Context, business object, credential, identifier or mutation is exposed.
  presentation.captureContinuity = () => {
    const references = () => {
      const id = ctx.sessions.list.getSnapshot().current
      const binding = id && ctx.sessions.binding(id)
      const directory = id && ctx.modelDirectories.directoryFor(id)
      return { context: ctx, generation: ctx.connection.generation.getSnapshot(), workspaceSource: ctx.workspaces.list,
        sessionSource: ctx.sessions.list, binding, chatTarget: binding && ctx.uiConversation.binding(binding).target('chat'),
        pendingSource: ctx.uiSession.pendingInteractions, pending: ctx.uiSession.pendingInteractions.getSnapshot().get(id),
        modelDirectory: directory, modelSnapshot: directory?.store.getSnapshot(),
        permissionSource: binding?.session.projections.faceOf('permissions'),
        permissionValue: binding?.session.projections.faceOf('permissions').getSnapshot(), settingsSource: ctx.settingsScope.describe(), settingsSnapshot: ctx.settingsScope.describe().getSnapshot() }
    }
    const captured = references()
    const token = shell.token()
    return () => {
      if (!shell.current(token)) return { currentGeneration: false }
      const current = references()
      return Object.fromEntries(Object.keys(captured).map(key => [key, current[key] === captured[key]]))
    }
  }
  const unregister = ctx.slots.register({ name: 'root', id: 'shaco-forge-root', priority: -1,
    inject: () => ({ shell, ctx }) }, ShacoRoot)
  ctx.effect(() => () => { presentation.beforeRootRevoke(); unregister() }, 'shaco.root-ownership')
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
    shell.dispose()
    unsubscribeSession()
    for (const unsubscribe of unsubscribers) unsubscribe()
  }, 'shaco.recovery.observation')
}
