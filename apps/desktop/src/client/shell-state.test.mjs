import test from 'node:test'
import assert from 'node:assert/strict'
import { createShellState } from './shell-state.mjs'
import { readSettings, saveProfile, removeProfile, userConfiguredProviders, writeCredential } from './settings.mjs'
import { Sidebar } from './sidebar.mjs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

function source(initial) {
  let value = initial
  const listeners = new Set()
  return { getSnapshot: () => value, subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) }, set: next => { value = next; for (const listener of listeners) listener() } }
}
function setup({ blank = false } = {}) {
  const calls = []
  const generation = source(1)
  const workspaces = source({ items: [{ workspaceId: 'w', title: 'Project', sessionIds: ['s'] }], phase: 'ready', archivedSessionIds: [] })
  const sessions = source({ current: undefined, ids: ['s'], byId: { s: { id: 's', blank, displayTitle: 'Chat' } }, phase: 'ready' })
  const binding = { session: { rename: async title => {
    calls.push(['renameSession', title])
    const accepted = title.trim()
    sessions.set({ ...sessions.getSnapshot(), byId: { s: { ...sessions.getSnapshot().byId.s, displayTitle: accepted } } })
    return accepted ? { ok: true, value: { title: accepted, seq: 2 } } : { ok: false, error: { code: 'bad-request' } }
  } } }
  const ctx = { connection: { generation }, workspaces: { list: workspaces, create: async input => { calls.push(['createWorkspace', input]); return workspaces.getSnapshot().items[0] },
      rename: async (id, title) => { calls.push(['renameWorkspace', id, title]); const accepted = title.trim(); if (!accepted) throw new Error('workspace rename failed: bad-request: blank'); const row = { ...workspaces.getSnapshot().items[0], title: accepted }; workspaces.set({ ...workspaces.getSnapshot(), items: [row] }); return row },
      delete: async id => { calls.push(['deleteWorkspace', id]); workspaces.set({ ...workspaces.getSnapshot(), items: [] }) },
      archiveSession: async id => { calls.push(['archiveSession', id]); workspaces.set({ ...workspaces.getSnapshot(), archivedSessionIds: [id] }) } },
    sessions: { list: sessions, binding: id => id === 's' ? binding : undefined, open: id => calls.push(['open', id]), clear: () => { calls.push(['clear']); sessions.set({ ...sessions.getSnapshot(), current: undefined }) }, refresh: async () => calls.push(['refresh']) },
    uiWorkspace: { connectWorkspace: async id => { calls.push(['connect', id]); return 's' } } }
  const native = { pickDirectory: async () => { calls.push(['picker']); return 'C:/disposable' } }
  const shell = createShellState(ctx, native)
  return { ctx, shell, calls, native, generation, workspaces, sessions }
}
test('Sidebar preserves public source method receivers and renders the single navigation surface', () => {
  const { shell, ctx } = setup()
  const workspaces = ctx.workspaces.list
  const snapshot = workspaces.getSnapshot()
  workspaces.getSnapshot = function () { assert.equal(this, workspaces); return snapshot }
  const markup = renderToStaticMarkup(createElement(Sidebar, { shell, workspaces, sessions: ctx.sessions.list, collapsed: false, toggleSidebar() {} }))
  assert.match(markup, /Shaco Forge/)
  const brandMarkup = markup.slice(markup.indexOf('<header class="brand">'), markup.indexOf('</header>') + '</header>'.length)
  assert.match(brandMarkup, /class="collapse-sidebar"[^>]+aria-label="收起侧栏"/)
  assert.match(markup, /data-testid="new-chat"/)
  assert.match(markup, /Project/)
  assert.match(markup, /project-title[^>]+aria-label="折叠 Project"[^>]+aria-expanded="true"/)
  assert.match(markup, /在 Project 中新建对话/)
  assert.match(markup, /更多项目操作 Project/)
  assert.doesNotMatch(markup, /重命名项目 Project|移除项目 Project/)
  shell.dispose()
})
test('Sidebar renders only the current blank as unmanaged New Chat and keeps persisted actions', () => {
  const { shell, workspaces, sessions } = setup({ blank: true })
  workspaces.set({ ...workspaces.getSnapshot(), items: [{ ...workspaces.getSnapshot().items[0], sessionIds: ['s', 'hidden-blank', 'persisted'] }] })
  sessions.set({
    ...sessions.getSnapshot(),
    current: 's',
    ids: ['s', 'hidden-blank', 'persisted'],
    byId: {
      s: sessions.getSnapshot().byId.s,
      'hidden-blank': { id: 'hidden-blank', blank: true, displayTitle: 'Hidden Blank' },
      persisted: { id: 'persisted', blank: false, displayTitle: 'Persisted Chat' },
    },
  })

  let markup = renderToStaticMarkup(createElement(Sidebar, { shell, workspaces, sessions, collapsed: false, toggleSidebar() {} }))
  assert.match(markup, />新对话</)
  assert.doesNotMatch(markup, /Hidden Blank/)
  assert.doesNotMatch(markup, /重命名对话 Chat|归档对话 Chat/)
  assert.match(markup, />Persisted Chat</)
  assert.match(markup, /重命名对话 Persisted Chat/)
  assert.match(markup, /归档对话 Persisted Chat/)

  sessions.set({ ...sessions.getSnapshot(), current: 'persisted' })
  markup = renderToStaticMarkup(createElement(Sidebar, { shell, workspaces, sessions, collapsed: false, toggleSidebar() {} }))
  assert.doesNotMatch(markup, />新对话</)
  assert.doesNotMatch(markup, />Chat</)
  assert.match(markup, />Persisted Chat</)

  sessions.set({ ...sessions.getSnapshot(), current: 's', byId: { ...sessions.getSnapshot().byId, s: { ...sessions.getSnapshot().byId.s, blank: false } } })
  markup = renderToStaticMarkup(createElement(Sidebar, { shell, workspaces, sessions, collapsed: false, toggleSidebar() {} }))
  assert.match(markup, />Chat</)
  assert.match(markup, /重命名对话 Chat/)
  assert.match(markup, /归档对话 Chat/)
  shell.dispose()
})
test('New Chat selected Workspace uses public connect and open, allowing blank reuse', async () => {
  const { shell, calls, sessions } = setup({ blank: true })
  shell.select('w'); await shell.newChat(); await shell.newChat()
  assert.deepEqual(calls, [['connect', 'w'], ['open', 's'], ['connect', 'w'], ['open', 's']])
  assert.equal(sessions.getSnapshot().byId.s.blank, true)
  shell.dispose()
})
test('Project add action creates a chat in the hovered Workspace and selects it', async () => {
  const { shell, calls } = setup()
  await shell.newChatIn('w')
  assert.deepEqual(calls, [['connect', 'w'], ['open', 's']])
  assert.equal(shell.getSnapshot().selected, 'w')
  shell.dispose()
})
test('blank Session management is a no-op without dialog or Host mutation', async () => {
  const { shell, calls } = setup({ blank: true })
  shell.manageSession('rename-session', 'w', 's')
  assert.equal(shell.getSnapshot().dialog, null)
  await shell.submitDialog()
  shell.manageSession('archive-session', 'w', 's')
  assert.equal(shell.getSnapshot().dialog, null)
  await shell.submitDialog()
  assert.deepEqual(calls, [])
  shell.dispose()
})
test('no selection goes through native picker even when recent Workspace exists', async () => {
  const { shell, calls } = setup()
  await shell.newChat()
  assert.deepEqual(calls.map(item => item[0]), ['picker', 'createWorkspace', 'connect', 'open'])
  shell.dispose()
})
test('picker cancellation makes no mutation and native failure is truthful', async () => {
  const { shell, native, calls } = setup()
  native.pickDirectory = async () => null
  await shell.newChat(); assert.equal(calls.length, 0)
  native.pickDirectory = async () => { throw new Error('NATIVE_PICKER_FAILED') }
  await shell.newChat(); assert.match(shell.getSnapshot().error, /NATIVE_PICKER_FAILED/)
  assert.equal(calls.length, 0); shell.dispose()
})
test('late picker and late connect are fenced, state cleared on generation change', async () => {
  for (const step of ['pick', 'connect']) {
    const { shell, native, ctx, generation, calls } = setup()
    let release
    const pending = new Promise(resolve => { release = resolve })
    if (step === 'pick') native.pickDirectory = () => pending
    else { shell.select('w'); ctx.uiWorkspace.connectWorkspace = () => pending }
    shell.setSearch('old'); shell.toggle('w'); shell.settings(true)
    const work = shell.newChat()
    generation.set(2); release(step === 'pick' ? 'C:/disposable' : 's'); await work
    assert.deepEqual(calls, [])
    assert.deepEqual(shell.getSnapshot(), { selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '', dialog: null })
    shell.dispose()
  }
})
test('directory follows Harness changes, correct-session navigation and unknown outcomes never replay', async () => {
  const { shell, ctx, calls, sessions } = setup()
  sessions.set({ ...sessions.getSnapshot(), current: 's' })
  assert.equal(shell.getSnapshot().selected, 'w')
  await shell.openSession('w', 'wrong'); assert.deepEqual(calls, [])
  await shell.openSession('w', 's'); assert.deepEqual(calls, [['open', 's']])
  ctx.uiWorkspace.connectWorkspace = async () => { calls.push(['unknown']); throw new Error('OUTCOME_UNKNOWN') }
  await shell.newChat()
  assert.equal(calls.filter(item => item[0] === 'unknown').length, 1)
  assert.equal(calls.filter(item => item[0] === 'refresh').length, 1)
  assert.match(shell.getSnapshot().error, /OUTCOME_UNKNOWN/)
  shell.dispose()
})
test('Workspace and Session rename settle only from public authoritative projections', async () => {
  const { shell, calls, workspaces, sessions } = setup()
  shell.manageWorkspace('rename-workspace', 'w'); shell.setDialogTitle(' Renamed Project '); await shell.submitDialog()
  assert.equal(workspaces.getSnapshot().items[0].title, 'Renamed Project')
  assert.equal(shell.getSnapshot().dialog, null)
  shell.manageSession('rename-session', 'w', 's'); shell.setDialogTitle(' Renamed Chat '); await shell.submitDialog()
  assert.equal(sessions.getSnapshot().byId.s.displayTitle, 'Renamed Chat')
  assert.deepEqual(calls.filter(item => item[0].startsWith('rename')), [
    ['renameWorkspace', 'w', ' Renamed Project '], ['renameSession', ' Renamed Chat '],
  ])
  assert.equal(calls.filter(item => item[0] === 'refresh').length, 0)
  shell.dispose()
})
test('Session rename waits for delayed public list projection via one authoritative refresh', async () => {
  const { shell, ctx, calls, sessions } = setup()
  const binding = { session: { rename: async title => {
    calls.push(['renameSessionDelayed', title])
    return { ok: true, value: { title: title.trim(), seq: 2 } }
  } } }
  ctx.sessions.binding = id => id === 's' ? binding : undefined
  ctx.sessions.refresh = async () => {
    calls.push(['refresh'])
    sessions.set({ ...sessions.getSnapshot(), byId: { s: { ...sessions.getSnapshot().byId.s, displayTitle: 'Renamed Chat' } } })
  }

  shell.manageSession('rename-session', 'w', 's')
  shell.setDialogTitle(' Renamed Chat ')
  await shell.submitDialog()

  assert.equal(calls.filter(item => item[0] === 'renameSessionDelayed').length, 1)
  assert.equal(calls.filter(item => item[0] === 'refresh').length, 1)
  assert.equal(sessions.getSnapshot().byId.s.displayTitle, 'Renamed Chat')
  assert.equal(shell.getSnapshot().dialog, null)
  assert.equal(shell.getSnapshot().error, '')
  shell.dispose()
})
test('Session rename reports unknown without replay when authoritative refresh fails', async () => {
  const { shell, ctx, calls } = setup()
  const binding = { session: { rename: async title => {
    calls.push(['renameSessionRefreshFailure', title])
    return { ok: true, value: { title: title.trim(), seq: 2 } }
  } } }
  ctx.sessions.binding = id => id === 's' ? binding : undefined
  ctx.sessions.refresh = async () => { calls.push(['refresh']); throw new Error('refresh failed') }

  shell.manageSession('rename-session', 'w', 's')
  shell.setDialogTitle(' Renamed Chat ')
  await shell.submitDialog()

  assert.equal(calls.filter(item => item[0] === 'renameSessionRefreshFailure').length, 1)
  assert.equal(calls.filter(item => item[0] === 'refresh').length, 1)
  assert.ok(shell.getSnapshot().dialog)
  assert.match(shell.getSnapshot().error, /OUTCOME_UNKNOWN/)
  shell.dispose()
})
test('Session rename reports unknown without replay when refreshed authoritative title is still stale', async () => {
  const { shell, ctx, calls, sessions } = setup()
  const binding = { session: { rename: async title => {
    calls.push(['renameSessionStillStale', title])
    return { ok: true, value: { title: title.trim(), seq: 2 } }
  } } }
  ctx.sessions.binding = id => id === 's' ? binding : undefined
  ctx.sessions.refresh = async () => { calls.push(['refresh']) }

  shell.manageSession('rename-session', 'w', 's')
  shell.setDialogTitle(' Renamed Chat ')
  await shell.submitDialog()

  assert.equal(calls.filter(item => item[0] === 'renameSessionStillStale').length, 1)
  assert.equal(calls.filter(item => item[0] === 'refresh').length, 1)
  assert.equal(sessions.getSnapshot().byId.s.displayTitle, 'Chat')
  assert.ok(shell.getSnapshot().dialog)
  assert.match(shell.getSnapshot().error, /OUTCOME_UNKNOWN/)
  shell.dispose()
})
test('Session rename post-refresh completion is fenced by generation and binding identity', async () => {
  const staleGeneration = setup()
  let generationBindingReads = 0
  const generationBinding = { session: { rename: async title => {
    staleGeneration.calls.push(['renameSessionGenerationFence', title])
    return { ok: true, value: { title: title.trim(), seq: 2 } }
  } } }
  staleGeneration.ctx.sessions.binding = id => {
    generationBindingReads += 1
    return id === 's' ? generationBinding : undefined
  }
  let signalGenerationRefresh
  const generationRefreshStarted = new Promise(resolve => { signalGenerationRefresh = resolve })
  let releaseGenerationRefresh
  staleGeneration.ctx.sessions.refresh = () => {
    staleGeneration.calls.push(['refresh'])
    signalGenerationRefresh()
    return new Promise(resolve => { releaseGenerationRefresh = resolve })
  }
  staleGeneration.shell.manageSession('rename-session', 'w', 's')
  staleGeneration.shell.setDialogTitle(' Renamed Chat ')
  const generationPending = staleGeneration.shell.submitDialog()
  await generationRefreshStarted
  staleGeneration.generation.set(2)
  releaseGenerationRefresh()
  await generationPending
  assert.equal(staleGeneration.calls.filter(item => item[0] === 'renameSessionGenerationFence').length, 1)
  assert.equal(staleGeneration.calls.filter(item => item[0] === 'refresh').length, 1)
  assert.equal(generationBindingReads, 2)
  assert.equal(staleGeneration.sessions.getSnapshot().byId.s.displayTitle, 'Chat')
  staleGeneration.shell.dispose()

  const replacedBinding = setup()
  const originalBinding = { session: { rename: async title => {
    replacedBinding.calls.push(['renameSessionBindingFence', title])
    return { ok: true, value: { title: title.trim(), seq: 2 } }
  } } }
  const replacementBinding = { session: { rename: async () => { throw new Error('must not run') } } }
  let activeBinding = originalBinding
  replacedBinding.ctx.sessions.binding = id => id === 's' ? activeBinding : undefined
  let signalBindingRefresh
  const bindingRefreshStarted = new Promise(resolve => { signalBindingRefresh = resolve })
  let releaseBindingRefresh
  replacedBinding.ctx.sessions.refresh = () => {
    replacedBinding.calls.push(['refresh'])
    signalBindingRefresh()
    return new Promise(resolve => { releaseBindingRefresh = resolve })
  }
  replacedBinding.shell.manageSession('rename-session', 'w', 's')
  replacedBinding.shell.setDialogTitle(' Renamed Chat ')
  const bindingPending = replacedBinding.shell.submitDialog()
  await bindingRefreshStarted
  activeBinding = replacementBinding
  releaseBindingRefresh()
  await bindingPending
  assert.equal(replacedBinding.calls.filter(item => item[0] === 'renameSessionBindingFence').length, 1)
  assert.equal(replacedBinding.calls.filter(item => item[0] === 'refresh').length, 1)
  assert.equal(replacedBinding.sessions.getSnapshot().byId.s.displayTitle, 'Chat')
  assert.ok(replacedBinding.shell.getSnapshot().dialog)
  replacedBinding.shell.dispose()
})
test('Session rename keeps Host rejection distinct and never refreshes or replays it', async () => {
  const { shell, ctx, calls } = setup()
  const binding = { session: { rename: async title => {
    calls.push(['renameSessionRejected', title])
    return { ok: false, error: { code: 'bad-request' } }
  } } }
  ctx.sessions.binding = id => id === 's' ? binding : undefined

  shell.manageSession('rename-session', 'w', 's')
  shell.setDialogTitle(' Rejected Chat ')
  await shell.submitDialog()

  assert.equal(calls.filter(item => item[0] === 'renameSessionRejected').length, 1)
  assert.equal(calls.filter(item => item[0] === 'refresh').length, 0)
  assert.ok(shell.getSnapshot().dialog)
  assert.match(shell.getSnapshot().error, /Host 拒绝/)
  assert.doesNotMatch(shell.getSnapshot().error, /OUTCOME_UNKNOWN/)
  shell.dispose()
})
test('safe remove and archive clear only the affected current selection after Host success', async () => {
  const archived = setup()
  archived.sessions.set({ ...archived.sessions.getSnapshot(), current: 's' })
  archived.shell.manageSession('archive-session', 'w', 's')
  const confirmation = renderToStaticMarkup(createElement(Sidebar, { shell: archived.shell, workspaces: archived.workspaces, sessions: archived.sessions, collapsed: false, toggleSidebar() {} }))
  assert.match(confirmation, /从 Shaco Forge 的对话列表中消失；会话记录不会删除/)
  assert.doesNotMatch(confirmation, /已归档|恢复|Restore|Unarchive|永久删除|Permanent Delete/)
  await archived.shell.submitDialog()
  assert.deepEqual(archived.workspaces.getSnapshot().archivedSessionIds, ['s'])
  assert.deepEqual(archived.calls.filter(item => ['archiveSession', 'clear'].includes(item[0])), [['archiveSession', 's'], ['clear']])
  assert.equal(archived.sessions.getSnapshot().current, undefined)
  assert.deepEqual(archived.workspaces.getSnapshot().items[0].sessionIds, ['s'])
  assert.ok(archived.sessions.getSnapshot().byId.s)
  assert.equal('openArchivedSession' in archived.shell, false)
  archived.shell.dispose()

  const removed = setup()
  removed.sessions.set({ ...removed.sessions.getSnapshot(), current: 's' })
  removed.shell.manageWorkspace('remove-workspace', 'w'); await removed.shell.submitDialog()
  assert.deepEqual(removed.workspaces.getSnapshot().items, [])
  assert.deepEqual(removed.calls.filter(item => ['deleteWorkspace', 'clear'].includes(item[0])), [['deleteWorkspace', 'w'], ['clear']])
  removed.shell.dispose()
})
test('archive settles against the latest current selection and never clears without authoritative success', async () => {
  const switched = setup()
  let releaseArchive
  switched.ctx.workspaces.archiveSession = id => new Promise(resolve => {
    switched.calls.push(['archiveSession', id])
    releaseArchive = () => {
      switched.workspaces.set({ ...switched.workspaces.getSnapshot(), archivedSessionIds: [id] })
      resolve()
    }
  })
  switched.sessions.set({
    ...switched.sessions.getSnapshot(),
    current: 's',
    ids: ['s', 'other-session'],
    byId: { ...switched.sessions.getSnapshot().byId, 'other-session': { id: 'other-session', blank: false, displayTitle: 'Other Chat' } },
  })
  switched.shell.manageSession('archive-session', 'w', 's')
  const pending = switched.shell.submitDialog()
  switched.sessions.set({ ...switched.sessions.getSnapshot(), current: 'other-session' })
  releaseArchive()
  await pending
  assert.equal(switched.sessions.getSnapshot().current, 'other-session')
  assert.deepEqual(switched.calls.filter(item => ['archiveSession', 'clear'].includes(item[0])), [['archiveSession', 's']])
  switched.shell.dispose()

  const rejected = setup()
  rejected.ctx.workspaces.archiveSession = async id => { rejected.calls.push(['archiveSessionRejected', id]); throw new Error('rejected') }
  rejected.sessions.set({ ...rejected.sessions.getSnapshot(), current: 's' })
  rejected.shell.manageSession('archive-session', 'w', 's')
  await rejected.shell.submitDialog()
  assert.equal(rejected.sessions.getSnapshot().current, 's')
  assert.equal(rejected.calls.some(item => item[0] === 'clear'), false)
  rejected.shell.dispose()

  const unconfirmed = setup()
  unconfirmed.ctx.workspaces.archiveSession = async id => { unconfirmed.calls.push(['archiveSessionUnconfirmed', id]) }
  unconfirmed.sessions.set({ ...unconfirmed.sessions.getSnapshot(), current: 's' })
  unconfirmed.shell.manageSession('archive-session', 'w', 's')
  await unconfirmed.shell.submitDialog()
  assert.equal(unconfirmed.sessions.getSnapshot().current, 's')
  assert.equal(unconfirmed.calls.some(item => item[0] === 'clear'), false)
  assert.match(unconfirmed.shell.getSnapshot().error, /OUTCOME_UNKNOWN/)
  unconfirmed.shell.dispose()
})
test('archived Session remains authoritative but is completely absent from Shaco UI', () => {
  const { shell, ctx, workspaces, sessions } = setup()
  sessions.set({ ...sessions.getSnapshot(), byId: { s: { ...sessions.getSnapshot().byId.s, blank: false } } })
  workspaces.set({ ...workspaces.getSnapshot(), archivedSessionIds: ['s'] })
  let markup = renderToStaticMarkup(createElement(Sidebar, { shell, workspaces, sessions: ctx.sessions.list, collapsed: false, toggleSidebar() {} }))
  assert.equal(workspaces.getSnapshot().items[0].sessionIds.includes('s'), true)
  assert.ok(sessions.getSnapshot().byId.s)
  assert.deepEqual(workspaces.getSnapshot().archivedSessionIds, ['s'])
  assert.doesNotMatch(markup, />Chat</)
  assert.doesNotMatch(markup, /已归档|archived-row|恢复|Restore|Unarchive|永久删除|Permanent Delete/)
  shell.manageWorkspace('remove-workspace', 'w')
  markup = renderToStaticMarkup(createElement(Sidebar, { shell, workspaces, sessions: ctx.sessions.list, collapsed: false, toggleSidebar() {} }))
  assert.match(markup, /不会删除项目目录、其中的文件或任何会话记录/)
  assert.match(markup, /重新添加同一目录会创建一个空项目分组/)
  shell.dispose()
})
test('known rejection, transport unknown outcome and stale completion remain distinct without replay', async () => {
  const rejected = setup()
  rejected.shell.manageWorkspace('rename-workspace', 'w'); rejected.shell.setDialogTitle('   '); await rejected.shell.submitDialog()
  assert.match(rejected.shell.getSnapshot().error, /Host 拒绝/)
  assert.ok(rejected.shell.getSnapshot().dialog)
  rejected.shell.dispose()

  const unknown = setup()
  unknown.ctx.workspaces.rename = async () => { unknown.calls.push(['lostRename']); throw new Error('transport lost') }
  unknown.shell.manageWorkspace('rename-workspace', 'w'); await unknown.shell.submitDialog()
  assert.match(unknown.shell.getSnapshot().error, /OUTCOME_UNKNOWN/)
  assert.equal(unknown.calls.filter(item => item[0] === 'lostRename').length, 1)
  assert.ok(unknown.shell.getSnapshot().dialog)
  unknown.shell.dispose()

  const stale = setup()
  let release
  stale.ctx.workspaces.rename = () => new Promise(resolve => { release = resolve })
  stale.shell.manageWorkspace('rename-workspace', 'w')
  const pending = stale.shell.submitDialog()
  stale.generation.set(2)
  release({ ...stale.workspaces.getSnapshot().items[0], title: 'late' })
  await pending
  assert.equal(stale.shell.getSnapshot().error, '')
  assert.equal(stale.shell.getSnapshot().dialog, null)
  stale.shell.dispose()
})
function settingsContext() {
  const calls = []
  const ok = value => ({ ok: true, value })
  const view = { writable: true, namespaces: [{ ns: 'llm-pi-ai', revision: 4, value: {} }] }
  const describe = { ensure: async () => {}, getSnapshot: () => ({ view }), acceptView: value => calls.push(['accept', value]) }
  const ctx = { settingsScope: { describe: () => describe, bind: () => ({ getSnapshot: () => ({ mode: 'host', writable: true }) }) }, remote: {
    llm: { listProviders: async () => ok([]), listConfigurableProviders: async () => ok([]) },
    settings: { mutate: async (...args) => { calls.push(['mutate', ...args]); return ok(view.namespaces[0]) }, describe: async () => { calls.push(['describe']); return ok(view) } },
    credentials: { set: async () => { calls.push(['credentialSet']); return ok(null) }, unset: async () => ok(null), describe: async () => { calls.push(['credentialDescribe']); return ok({ KEY: { configured: true } }) } } } }
  const shell = { token: () => 1, current: token => token === 1 }
  return { ctx, shell, calls }
}
test('Settings local directory reads and profile mutations preserve exact revision and namespace', async () => {
  const { ctx, shell, calls } = settingsContext()
  assert.equal((await readSettings(ctx, shell)).view.writable, true)
  await saveProfile(ctx, shell, 'llm-pi-ai', ['providers', 'relay'], { baseURL: 'https://example.invalid', api: 'openai-completions', models: [{ id: 'local' }] }, 4)
  assert.equal(calls[0][0], 'mutate'); assert.equal(calls[0][1], 'llm-pi-ai'); assert.equal(calls[0][3], 4)
  await assert.rejects(saveProfile(ctx, shell, 'llm-pi-ai', ['providers', 'relay'], {}, undefined), /REVISION_UNAVAILABLE/)
})
test('Settings rejection is not success and lost response rereads without replay', async () => {
  const { ctx, shell, calls } = settingsContext()
  ctx.remote.settings.mutate = async () => ({ ok: false, error: {} })
  await assert.rejects(saveProfile(ctx, shell, 'llm-pi-ai', ['providers', 'relay'], {}, 4), /HARNESS_FAILURE/)
  ctx.remote.settings.mutate = async () => { calls.push(['sent']); throw new Error('lost') }
  await assert.rejects(saveProfile(ctx, shell, 'llm-pi-ai', ['providers', 'relay'], {}, 4), /OUTCOME_UNKNOWN/)
  assert.equal(calls.filter(item => item[0] === 'sent').length, 1)
  assert.equal(calls.filter(item => item[0] === 'describe').length, 1)
})
test('Credential uses set only, metadata reread and no blind replay on unknown result', async () => {
  const { ctx, shell, calls } = settingsContext()
  await writeCredential(ctx, shell, 'KEY', 'test-only-disposable')
  assert.deepEqual(calls.map(item => item[0]), ['credentialSet', 'credentialDescribe'])
  ctx.remote.credentials.set = async () => { calls.push(['lost']); throw new Error('lost') }
  await assert.rejects(writeCredential(ctx, shell, 'KEY', 'test-only-disposable'), /OUTCOME_UNKNOWN/)
  assert.equal(calls.filter(item => item[0] === 'lost').length, 1)
  assert.equal(calls.filter(item => item[0] === 'credentialDescribe').length, 2)
})

const providerSchema = { hasPath: (value, path) => {
  const parent = path.slice(0, -1).reduce((item, key) => item?.[key], value)
  return parent !== undefined && parent !== null && Object.hasOwn(parent, path.at(-1))
} }
const providerDirectory = [
  { provider: 'root-adapter', settingsNs: 'root-ns', settingsPath: [] },
  { provider: 'shipped-adapter', settingsNs: 'multi-ns', settingsPath: ['providers', 'shipped-adapter'], declared: false },
  { provider: 'custom-relay', settingsNs: 'multi-ns', settingsPath: ['providers', 'custom-relay'], declared: true },
]

test('Fresh settings never promote registered adapters, catalog entries or resolved defaults into user rows', async () => {
  const { ctx, shell } = settingsContext()
  ctx.settingsSchema = providerSchema
  ctx.remote.llm.listProviders = async () => ({ ok: true, value: [{ id: 'root-adapter' }] })
  ctx.remote.llm.listConfigurableProviders = async () => ({ ok: true, value: providerDirectory })
  const view = { namespaces: [
    { ns: 'root-ns', base: { apiKeyEnv: 'SHIPPED_KEY' }, value: { apiKeyEnv: 'SHIPPED_KEY', models: [] } },
    { ns: 'multi-ns', base: { providers: {} }, value: { providers: { 'shipped-adapter': {} } } },
  ] }
  ctx.settingsScope.describe = () => ({ ensure: async () => {}, getSnapshot: () => ({ view }) })
  const data = await readSettings(ctx, shell)
  assert.deepEqual(data.configured, [])
  assert.equal(data.registered.length, 1)
  assert.deepEqual(data.declared, providerDirectory)
})

test('User membership follows authority namespace and path, including dormant custom and nested empty profiles', () => {
  const data = { declared: providerDirectory, registered: [], view: { namespaces: [
    { ns: 'root-ns', user: { apiKeyEnv: 'USER_KEY' } },
    { ns: 'multi-ns', user: { providers: { 'shipped-adapter': {}, 'custom-relay': { baseURL: 'https://example.invalid' } } } },
  ] } }
  assert.deepEqual(userConfiguredProviders({ settingsSchema: providerSchema }, data), providerDirectory)
  data.view.namespaces[0].user = {}
  delete data.view.namespaces[1].user.providers['shipped-adapter']
  assert.deepEqual(userConfiguredProviders({ settingsSchema: providerSchema }, data), [providerDirectory[2]])
  delete data.view.namespaces[1].user.providers['custom-relay']
  assert.deepEqual(userConfiguredProviders({ settingsSchema: providerSchema }, data), [])
})

test('Provider deletion uses acknowledged public unset with exact namespace, root/nested path and revision', async () => {
  for (const path of [[], ['providers', 'custom-relay']]) {
    const { ctx, shell, calls } = settingsContext()
    await removeProfile(ctx, shell, 'provider-ns', path, 4)
    assert.deepEqual(calls[0], ['mutate', 'provider-ns', [{ op: 'unset', path }], 4])
    assert.equal(calls[1][0], 'accept')
    assert.equal(calls.length, 2)
  }
})

test('Provider deletion refuses missing revision, read-only settings and stale generations before sending', async () => {
  const { ctx, shell, calls } = settingsContext()
  await assert.rejects(removeProfile(ctx, shell, 'provider-ns', [], undefined), /REVISION_UNAVAILABLE/)
  ctx.settingsScope.bind = () => ({ getSnapshot: () => ({ mode: 'host', writable: false }) })
  await assert.rejects(removeProfile(ctx, shell, 'provider-ns', [], 4), /HARNESS_FAILURE/)
  shell.current = () => false
  await assert.rejects(removeProfile(ctx, shell, 'provider-ns', [], 4), /STALE_GENERATION/)
  assert.deepEqual(calls, [])
})

test('Rejected or uncertain deletion is not accepted locally and is never blindly replayed', async () => {
  const { ctx, shell, calls } = settingsContext()
  ctx.remote.settings.mutate = async () => ({ ok: false, error: {} })
  await assert.rejects(removeProfile(ctx, shell, 'provider-ns', [], 4), /HARNESS_FAILURE/)
  assert.deepEqual(calls, [])
  ctx.remote.settings.mutate = async () => { calls.push(['unset-sent']); throw new Error('lost') }
  await assert.rejects(removeProfile(ctx, shell, 'provider-ns', [], 4), /OUTCOME_UNKNOWN/)
  assert.equal(calls.filter(item => item[0] === 'unset-sent').length, 1)
  assert.equal(calls.filter(item => item[0] === 'describe').length, 1)
})
