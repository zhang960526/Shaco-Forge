import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

const taskRoot = resolve(process.env.SHACO_FORGE_TEST_ROOT ?? '../Shaco-Forge-Test/V1-FUNCTIONAL-COMPLETION')
const runRoot = join(taskRoot, 'functional-completion')
assert.ok(runRoot.startsWith(taskRoot + sep), 'test run must stay inside the task root')

const overlay = resolve('node_modules/.shaco-forge-build/runtime-overlay/node_modules/@deepseek-ai')
const publicEntry = name => pathToFileURL(join(overlay, name, 'lib/index.js')).href
const { Context } = await import(publicEntry('cordis'))
const { Storage } = await import(publicEntry('dsh-storage'))
const { apply: storageJson } = await import(publicEntry('dsh-storage-json'))
const { apply: storageDomain } = await import(publicEntry('dsh-storage-domain'))
const { SessionStore, SessionId } = await import(publicEntry('dsh-session'))
const { JsonlSessionPersistence } = await import(publicEntry('dsh-session-persistence-jsonl'))
const { SessionTitleService, foldSessionTitle } = await import(publicEntry('dsh-session-title'))
const { WorkspaceRegistry } = await import(publicEntry('dsh-workspace'))
const { WorkspaceController: HostWorkspaceController } = await import(publicEntry('dsh-api-workspace-controller'))

storageJson.inject = ['storage']
storageDomain.inject = ['storage']

async function loadPublicWorkspaceClient() {
  const source = await readFile(join(overlay, 'dsh-api-workspace-controller/lib/client.js'), 'utf8')
  let plugin
  const cordis = await import(publicEntry('cordis'))
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load: value => { plugin = value.factory(id => {
      if (id === '@deepseek-ai/cordis') return cordis
      if (id === '@deepseek-ai/dsh-client-store') return { notifySubscribers: listeners => { for (const listener of [...listeners]) listener() } }
      if (id === '@deepseek-ai/dsh-api-gateway/client') return {}
      throw new Error(`unexpected public client dependency: ${id}`)
    }) } } },
    queueMicrotask,
    AbortController,
    Error,
    Map,
    Set,
  }, { filename: 'dsh-api-workspace-controller/lib/client.js' })
  return plugin
}

const { ClientWorkspaceModel, WorkspaceController: ClientWorkspaceController } = await loadPublicWorkspaceClient()

const sha256 = value => createHash('sha256').update(value).digest('hex').toUpperCase()

async function hashTree(root) {
  const parts = []
  async function visit(directory, prefix = '') {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = prefix === '' ? entry.name : `${prefix}/${entry.name}`
      if (entry.isDirectory()) await visit(join(directory, entry.name), relative)
      else if (entry.isFile()) parts.push(`${relative}\0${sha256(await readFile(join(directory, entry.name)))}`)
    }
  }
  await visit(root)
  return sha256(parts.join('\n'))
}

async function compose(storageRoot, sessionRoot) {
  const ctx = new Context()
  await ctx.plugin(Storage)
  await ctx.plugin(storageJson, { root: storageRoot })
  await ctx.plugin(storageDomain, { backend: 'json', routes: {} })
  await ctx.plugin(SessionStore)
  await ctx.plugin(JsonlSessionPersistence, {
    root: sessionRoot,
    packChunks: false,
    compression: 'none',
    preparedSessionCacheSize: 8,
    writeBatchMaxDelayMs: 1,
  })
  await ctx.plugin(SessionTitleService, { fallbackMaxWords: 5, fallbackMaxBytes: 80, maxTitleBytes: 120 })
  await ctx.plugin(WorkspaceRegistry)
  const host = new HostWorkspaceController(ctx)
  return { ctx, host }
}

async function baseline(host) {
  const abort = new AbortController()
  const iterator = host.follow(abort.signal)[Symbol.asyncIterator]()
  try {
    const first = await iterator.next()
    assert.equal(first.done, false)
    assert.equal(first.value.type, 'baseline')
    return first.value.value
  } finally {
    abort.abort()
    await iterator.return?.()
  }
}

function remoteFor(host) {
  const result = async operation => {
    try { return { ok: true, value: await operation() } }
    catch (error) {
      return { ok: false, error: error?.failure ?? { code: 'internal', message: error instanceof Error ? error.message : String(error), details: {} } }
    }
  }
  return {
    create: request => result(() => host.create(request)),
    rename: request => result(() => host.rename(request)),
    delete: request => result(() => host.delete(request)),
    insertBefore: request => result(() => host.insertBefore(request)),
    insertSessionBefore: request => result(() => host.insertSessionBefore(request)),
    archiveSession: request => result(() => host.archiveSession(request)),
  }
}

async function publicClient(host) {
  const ctx = new Context()
  const model = new ClientWorkspaceModel(remoteFor(host))
  const workspaces = new ClientWorkspaceController(ctx, model)
  model.replaceBaseline(await baseline(host))
  return { ctx, model, workspaces }
}

test('frozen public Workspace Host/Client and real JSONL persistence survive rename, archive, reconnect, remove and re-add', async () => {
  await rm(runRoot, { recursive: true, force: true })
  const project = join(runRoot, 'real-project')
  const storageRoot = join(runRoot, 'workspace-storage')
  const sessionRoot = join(runRoot, 'session-storage')
  await mkdir(project, { recursive: true })
  await writeFile(join(project, 'KEEP.txt'), 'SAFE_REMOVE_MUST_KEEP_THIS\n', 'utf8')

  const contexts = []
  let hostRuntime
  let clientRuntime
  try {
    hostRuntime = await compose(storageRoot, sessionRoot)
    contexts.push(hostRuntime.ctx)
    clientRuntime = await publicClient(hostRuntime.host)
    contexts.push(clientRuntime.ctx)

    const created = await clientRuntime.workspaces.create({ path: project })
    const workspaceId = created.workspaceId
    const sessionId = SessionId('gate-e-real-session')
    const session = hostRuntime.ctx.sessions.create(sessionId, { meta: { cwd: project } })
    await hostRuntime.ctx.sessionPersistence.ensureMaterialized(session)
    session.append('turn/start', { turn: 1 })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    const acceptedSessionTitle = hostRuntime.ctx.sessionTitle.rename(session, '  Durable Session Title  ')
    assert.equal(acceptedSessionTitle.title, 'Durable Session Title')
    await hostRuntime.ctx.sessions.flush(session)
    await hostRuntime.ctx.workspaceRegistry.get(workspaceId).attachSession(sessionId)
    clientRuntime.model.replaceBaseline(await baseline(hostRuntime.host))

    const renamed = await clientRuntime.workspaces.rename(workspaceId, 'Durable Workspace Title')
    assert.equal(renamed.title, 'Durable Workspace Title')
    assert.equal(clientRuntime.model.getSnapshot().items[0].title, 'Durable Workspace Title')
    await clientRuntime.workspaces.archiveSession(sessionId)
    assert.deepEqual([...clientRuntime.model.getSnapshot().archivedSessionIds], [sessionId])

    const journalPath = hostRuntime.ctx.sessionPersistence.locate(session.header).path
    const projectHashBeforeRemove = await hashTree(project)
    const journalHashBeforeArchiveReload = sha256(await readFile(journalPath))

    await clientRuntime.ctx.fiber.dispose()
    await hostRuntime.ctx.fiber.dispose()
    contexts.length = 0

    hostRuntime = await compose(storageRoot, sessionRoot)
    contexts.push(hostRuntime.ctx)
    clientRuntime = await publicClient(hostRuntime.host)
    contexts.push(clientRuntime.ctx)
    const reloaded = clientRuntime.model.getSnapshot()
    assert.equal(reloaded.items.length, 1)
    assert.equal(reloaded.items[0].workspaceId, workspaceId)
    assert.equal(reloaded.items[0].title, 'Durable Workspace Title')
    assert.deepEqual([...reloaded.archivedSessionIds], [sessionId])
    assert.equal(reloaded.items[0].sessionIds.filter(id => id === sessionId).length, 1)
    const stored = await hostRuntime.ctx.sessionPersistence.inspect(sessionId)
    assert.equal(foldSessionTitle(stored.events)?.title, 'Durable Session Title')
    assert.equal(sha256(await readFile(journalPath)), journalHashBeforeArchiveReload)

    await clientRuntime.workspaces.delete(workspaceId)
    assert.equal(clientRuntime.model.getSnapshot().items.some(item => item.workspaceId === workspaceId), false)
    assert.equal(await hashTree(project), projectHashBeforeRemove)
    assert.equal(sha256(await readFile(journalPath)), journalHashBeforeArchiveReload)

    await clientRuntime.ctx.fiber.dispose()
    await hostRuntime.ctx.fiber.dispose()
    contexts.length = 0

    hostRuntime = await compose(storageRoot, sessionRoot)
    contexts.push(hostRuntime.ctx)
    clientRuntime = await publicClient(hostRuntime.host)
    contexts.push(clientRuntime.ctx)
    assert.equal(clientRuntime.model.getSnapshot().items.length, 0)
    assert.deepEqual([...clientRuntime.model.getSnapshot().archivedSessionIds], [sessionId])

    const recreated = await clientRuntime.workspaces.create({ path: project })
    assert.notEqual(recreated.workspaceId, workspaceId)
    assert.deepEqual([...recreated.sessionIds], [])
    assert.equal(await hashTree(project), projectHashBeforeRemove)
    assert.equal(sha256(await readFile(journalPath)), journalHashBeforeArchiveReload)

    const reconnect = await publicClient(hostRuntime.host)
    contexts.push(reconnect.ctx)
    const finalSnapshot = reconnect.model.getSnapshot()
    assert.equal(finalSnapshot.items.length, 1)
    assert.equal(finalSnapshot.items[0].workspaceId, recreated.workspaceId)
    assert.deepEqual([...finalSnapshot.items[0].sessionIds], [])
    assert.deepEqual([...finalSnapshot.archivedSessionIds], [sessionId])
    assert.equal(new Set(finalSnapshot.archivedSessionIds).size, finalSnapshot.archivedSessionIds.length)
  } finally {
    for (const ctx of contexts.reverse()) await ctx.fiber.dispose()
  }
})
