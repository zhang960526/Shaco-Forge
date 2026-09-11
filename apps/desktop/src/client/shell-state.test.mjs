import test from 'node:test'
import assert from 'node:assert/strict'
import { createShellState } from './shell-state.mjs'
import { readSettings, saveProfile, writeCredential } from './settings.mjs'
import { Sidebar } from './sidebar.mjs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

function source(initial) {
  let value = initial
  const listeners = new Set()
  return { getSnapshot: () => value, subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) }, set: next => { value = next; for (const listener of listeners) listener() } }
}
function setup() {
  const calls = []
  const generation = source(1)
  const workspaces = source({ items: [{ workspaceId: 'w', title: 'Project', sessionIds: ['s'] }], phase: 'ready', archivedSessionIds: [] })
  const sessions = source({ current: undefined, ids: ['s'], byId: { s: { id: 's', blank: true } }, phase: 'ready' })
  const ctx = { connection: { generation }, workspaces: { list: workspaces, create: async input => { calls.push(['createWorkspace', input]); return workspaces.getSnapshot().items[0] } },
    sessions: { list: sessions, open: id => calls.push(['open', id]), refresh: async () => calls.push(['refresh']) },
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
  assert.match(markup, /data-testid="new-chat"/)
  assert.match(markup, /Project/)
  shell.dispose()
})
test('New Chat selected Workspace uses public connect and open, allowing blank reuse', async () => {
  const { shell, calls } = setup()
  shell.select('w'); await shell.newChat(); await shell.newChat()
  assert.deepEqual(calls, [['connect', 'w'], ['open', 's'], ['connect', 'w'], ['open', 's']])
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
    assert.deepEqual(shell.getSnapshot(), { selected: undefined, search: '', collapsed: [], settings: false, busy: false, error: '' })
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
