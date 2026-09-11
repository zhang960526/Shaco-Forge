// Only presentation admission/fencing. Harness owns all mutation semantics.
export function bindPresentationActions(ctx, shell, binding) {
  const token = shell.token()
  const id = binding.session.getSnapshot().sessionId
  const current = () => shell.current(token) && ctx.sessions.list.getSnapshot().current === id && ctx.sessions.binding(id) === binding
  const check = () => { if (!current()) throw new Error('STALE_GENERATION_OR_SESSION') }
  const pendingCurrent = pending => current() && ctx.uiSession.pendingInteractions.getSnapshot().get(id) === pending
  const admitted = async work => {
    check()
    const result = await work()
    check()
    if (!result.ok) throw new Error(result.error?.code ?? 'REQUEST_REJECTED')
    return result.value
  }
  return {
    current, pendingCurrent,
    prompt: content => admitted(() => binding.session.prompt(content, 'queue')),
    cancel: () => admitted(() => binding.session.cancel()),
    loadOlder: async () => { check(); await binding.session.loadOlder(); check() },
    imageUrl: async attachment => { check(); const url = await ctx.uiConversation.imageUrl(id, attachment); check(); return url },
    answer: async (pending, answer) => {
      if (!pendingCurrent(pending)) throw new Error('STALE_PENDING_INTERACTION')
      await pending.answer(answer)
      // Do not require pending still present: successful settlement may remove it.
      check()
    },
    selectModel: async (directory, selection) => {
      check()
      if (ctx.modelDirectories.directoryFor(id) !== directory) throw new Error('STALE_MODEL_DIRECTORY')
      await directory.select(selection); check()
    },
    permission: value => {
      check()
      const face = binding.session.projections.faceOf('permissions').getSnapshot()
      if (value === 'custom' || !face?.options.some(row => row.value === value) || !/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('PERMISSION_NOT_SELECTABLE')
      return admitted(() => binding.session.command(`/permission ${value}`))
    },
  }
}
