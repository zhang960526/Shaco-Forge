// Only ephemeral navigation state. Workspace/Session rows are read from Harness.
export function createShellState(ctx, native) {
  let generation = ctx.connection.generation.getSnapshot()
  let disposed = false
  let observedCurrent
  let state = { selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '', dialog: null }
  const listeners = new Set()
  const publish = patch => { state = { ...state, ...patch }; for (const listener of listeners) listener() }
  const current = token => !disposed && token !== undefined && generation === token && ctx.connection.generation.getSnapshot() === token
  const check = token => { if (!current(token)) throw new Error('STALE_GENERATION') }
  const reset = () => {
    const next = ctx.connection.generation.getSnapshot()
    if (next === generation) return
    generation = next
    observedCurrent = undefined
    publish({ selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '', dialog: null })
  }
  const synchronizeSelection = () => {
    if (disposed || generation === undefined) return
    const id = ctx.sessions.list.getSnapshot().current
    const workspace = ctx.workspaces.list.getSnapshot().items.find(row => row.sessionIds.includes(id))
    if (workspace && (id !== observedCurrent || state.selected === undefined)) {
      observedCurrent = id
      if (state.selected !== workspace.workspaceId) publish({ selected: workspace.workspaceId })
    }
  }
  const offs = [ctx.connection.generation.subscribe(reset), ctx.sessions.list.subscribe(synchronizeSelection), ctx.workspaces.list.subscribe(synchronizeSelection)]
  synchronizeSelection()
  async function operation(work) {
    if (state.busy) return
    const token = generation
    check(token)
    publish({ busy: true, error: '' })
    try { await work(token); check(token) }
    catch (error) {
      if (current(token)) {
        const unknown = /OUTCOME_UNKNOWN/.test(String(error?.message ?? error))
        publish({ error: unknown ? 'OUTCOME_UNKNOWN：结果未知，请重新读取状态后确认。' : /NATIVE_PICKER_FAILED/.test(String(error)) ? 'NATIVE_PICKER_FAILED：目录选择失败，请重新选择。' : '操作未完成，请检查项目状态或选择其他项目。' })
        if (unknown) await ctx.sessions.refresh().catch(() => {})
      }
    } finally { if (current(token)) publish({ busy: false }) }
  }
  async function mutation(work) {
    if (state.busy) return
    const token = generation
    check(token)
    publish({ busy: true, error: '' })
    try {
      await work(token)
      check(token)
      publish({ dialog: null })
    } catch (error) {
      if (!current(token)) return
      const message = String(error?.message ?? error)
      publish({ error: /OUTCOME_UNKNOWN/.test(message)
        ? 'OUTCOME_UNKNOWN：结果未知；不会自动重试，请等待状态刷新后确认。'
        : '操作被 Host 拒绝，请检查名称或当前状态。' })
    } finally { if (current(token)) publish({ busy: false }) }
  }
  const workspaceCall = async work => {
    try { return await work() }
    catch (error) {
      if (/workspace (?:rename|delete|session archive) failed:/.test(String(error?.message ?? error))) throw new Error('REJECTED')
      throw new Error('OUTCOME_UNKNOWN')
    }
  }
  async function connect(id, token) {
    check(token)
    const sessionId = await ctx.uiWorkspace.connectWorkspace(id)
    check(token)
    ctx.sessions.open(sessionId)
    publish({ selected: id })
  }
  async function pick(token) {
    const path = await native.pickDirectory()
    check(token)
    if (path === null) return
    const workspace = await ctx.workspaces.create({ path })
    check(token)
    await connect(workspace.workspaceId, token)
  }
  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    token: () => generation,
    current,
    setSearch: search => publish({ search }),
    toggle: id => publish({ collapsed: state.collapsed.includes(id) ? state.collapsed.filter(item => item !== id) : [...state.collapsed, id] }),
    settings: settings => publish({ settings }),
    select: id => publish({ selected: id }),
    closeDialog: () => { if (!state.busy) publish({ dialog: null, error: '' }) },
    setDialogTitle: title => { if (!state.busy && state.dialog && 'title' in state.dialog) publish({ dialog: { ...state.dialog, title } }) },
    manageWorkspace: (kind, workspaceId) => {
      if (state.busy) return
      const workspace = ctx.workspaces.list.getSnapshot().items.find(row => row.workspaceId === workspaceId)
      if (!workspace || !['rename-workspace', 'remove-workspace'].includes(kind)) return
      publish({ dialog: kind === 'rename-workspace' ? { kind, workspaceId, title: workspace.title } : { kind, workspaceId }, error: '' })
    },
    manageSession: (kind, workspaceId, sessionId) => {
      if (state.busy) return
      const session = ctx.sessions.list.getSnapshot().byId[sessionId]
      if (!session || !['rename-session', 'archive-session'].includes(kind)) return
      publish({ dialog: kind === 'rename-session' ? { kind, workspaceId, sessionId, title: session.displayTitle } : { kind, workspaceId, sessionId }, error: '' })
    },
    submitDialog: () => {
      const dialog = state.dialog
      if (!dialog) return Promise.resolve()
      return mutation(async token => {
        if (dialog.kind === 'rename-workspace') {
          const renamed = await workspaceCall(() => ctx.workspaces.rename(dialog.workspaceId, dialog.title))
          check(token)
          const currentRow = ctx.workspaces.list.getSnapshot().items.find(row => row.workspaceId === dialog.workspaceId)
          if (!currentRow || currentRow.title !== renamed.title) throw new Error('OUTCOME_UNKNOWN')
          return
        }
        if (dialog.kind === 'remove-workspace') {
          const before = ctx.workspaces.list.getSnapshot().items.find(row => row.workspaceId === dialog.workspaceId)
          if (!before) throw new Error('REJECTED')
          const currentSession = ctx.sessions.list.getSnapshot().current
          await workspaceCall(() => ctx.workspaces.delete(dialog.workspaceId))
          check(token)
          if (ctx.workspaces.list.getSnapshot().items.some(row => row.workspaceId === dialog.workspaceId)) throw new Error('OUTCOME_UNKNOWN')
          if (currentSession && before.sessionIds.includes(currentSession)) ctx.sessions.clear()
          if (state.selected === dialog.workspaceId) publish({ selected: undefined })
          return
        }
        if (dialog.kind === 'rename-session') {
          const binding = ctx.sessions.binding(dialog.sessionId)
          if (!binding) throw new Error('REJECTED')
          const result = await binding.session.rename(dialog.title)
          check(token)
          if (ctx.sessions.binding(dialog.sessionId) !== binding) throw new Error('STALE_GENERATION')
          if (!result.ok) throw new Error(result.error?.code === 'internal' ? 'OUTCOME_UNKNOWN' : 'REJECTED')
          const row = ctx.sessions.list.getSnapshot().byId[dialog.sessionId]
          if (!row || row.displayTitle !== result.value.title) throw new Error('OUTCOME_UNKNOWN')
          return
        }
        if (dialog.kind === 'archive-session') {
          const currentSession = ctx.sessions.list.getSnapshot().current
          await workspaceCall(() => ctx.workspaces.archiveSession(dialog.sessionId))
          check(token)
          if (!ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(dialog.sessionId)) throw new Error('OUTCOME_UNKNOWN')
          if (currentSession === dialog.sessionId) ctx.sessions.clear()
        }
      })
    },
    openProject: () => operation(pick),
    newChat: () => operation(token => state.selected === undefined ? pick(token) : connect(state.selected, token)),
    openSession: (workspaceId, sessionId) => operation(async token => {
      check(token)
      const workspace = ctx.workspaces.list.getSnapshot().items.find(row => row.workspaceId === workspaceId)
      if (!workspace?.sessionIds.includes(sessionId)) throw new Error('HARNESS_FAILURE')
      ctx.sessions.open(sessionId)
      publish({ selected: workspaceId })
    }),
    openArchivedSession: sessionId => operation(async token => {
      check(token)
      const workspaceState = ctx.workspaces.list.getSnapshot()
      if (!workspaceState.archivedSessionIds.includes(sessionId) || !ctx.sessions.list.getSnapshot().byId[sessionId]) throw new Error('HARNESS_FAILURE')
      ctx.sessions.open(sessionId)
      const workspace = workspaceState.items.find(row => row.sessionIds.includes(sessionId))
      publish({ selected: workspace?.workspaceId })
    }),
    dispose: () => { disposed = true; for (const off of offs) off(); listeners.clear(); state = { selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '', dialog: null } },
  }
}
