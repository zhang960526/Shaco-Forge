// Only ephemeral navigation state. Workspace/Session rows are read from Harness.
export function createShellState(ctx, native) {
  let generation = ctx.connection.generation.getSnapshot()
  let disposed = false
  let observedCurrent
  let state = { selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '' }
  const listeners = new Set()
  const publish = patch => { state = { ...state, ...patch }; for (const listener of listeners) listener() }
  const current = token => !disposed && token !== undefined && generation === token && ctx.connection.generation.getSnapshot() === token
  const check = token => { if (!current(token)) throw new Error('STALE_GENERATION') }
  const reset = () => {
    const next = ctx.connection.generation.getSnapshot()
    if (next === generation) return
    generation = next
    observedCurrent = undefined
    publish({ selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '' })
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
    openProject: () => operation(pick),
    newChat: () => operation(token => state.selected === undefined ? pick(token) : connect(state.selected, token)),
    openSession: (workspaceId, sessionId) => operation(async token => {
      check(token)
      const workspace = ctx.workspaces.list.getSnapshot().items.find(row => row.workspaceId === workspaceId)
      if (!workspace?.sessionIds.includes(sessionId)) throw new Error('HARNESS_FAILURE')
      ctx.sessions.open(sessionId)
      publish({ selected: workspaceId })
    }),
    dispose: () => { disposed = true; for (const off of offs) off(); listeners.clear(); state = { selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '' } },
  }
}
