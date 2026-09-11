// Shaco bootstrap orchestration over the public Client facade, Loader and slots.
// No business source is constructed here. Dependencies are passed for focused tests.
export const PRODUCT_ROW = '@shaco-forge/desktop'
export const ROOT_ID = 'shaco-forge-root'
export const REQUIRED_SERVICES = ['connection', 'workspaces', 'sessions', 'uiWorkspace', 'uiRenderer', 'slots',
  'uiSession', 'uiConversation', 'conversation', 'modelDirectories', 'settingsScope', 'settingsSchema', 'remote', 'remote.session']

export function startPresentation({ container, bridge, target, boot, staticModules, Context, Loader, activeState, loadBundle }) {
  let ctx, modules, unmount, watch, disposed = false, started = false, shuttingDown
  let mounting = false, failed = false
  const offs = []
  const evidence = { clientModuleSystems: 0, contexts: 0, reactRoots: 0, mountCalls: 0, harnessActive: 0, productActive: false, rootOwner: null }
  const guard = () => { if (disposed || failed) throw new Error('SHACO_BOOTSTRAP_REVOKED') }
  const conceal = () => { container.inert = true; container.hidden = true }
  const teardown = async () => {
    if (shuttingDown) return shuttingDown
    disposed = true
    bridge.harnessReady = false
    conceal()
    shuttingDown = (async () => {
      // React root always leaves before the Product root contribution can leave.
      const release = unmount; unmount = undefined
      release?.(); evidence.reactRoots = 0
      for (const off of offs.splice(0)) off()
      await watch?.dispose()
      await ctx?.fiber.dispose()
      evidence.rootOwner = null
    })()
    return shuttingDown
  }
  const fail = reason => {
    if (failed || disposed) return
    failed = true
    bridge.harnessReady = false
    // Synchronous visibility/interaction cut before slot abdication can render a fallback.
    conceal()
    bridge.failClosed(reason)
    queueMicrotask(() => { void teardown().catch(() => {}) })
  }
  bridge.beforeRootRevoke = () => {
    if (!disposed) fail('SHACO_ROOT_REVOKED')
    conceal()
    // Normal disposal reaches this after unmount; unexpected plugin loss is already hidden.
  }
  const winner = () => {
    const entries = ctx.slots.entriesOfSlot('root')
    return entries.length === 1 && entries[0].options.id === ROOT_ID && entries[0].options.priority === -1
  }
  const activate = async rows => {
    const ids = await Promise.all(rows.map(row => ctx.loader.create({ name: row.id })))
    await ctx.loader.await()
    guard()
    for (let i = 0; i < ids.length; i++) {
      const entry = ctx.loader.resolve(ids[i])
      if (entry.options.name !== rows[i].id || entry.fiber?.state !== activeState) throw new Error('SHACO_REQUIRED_PLUGIN_NOT_ACTIVE')
    }
    return ids
  }
  return {
    diagnostics: () => ({ ...evidence, failed, disposed }),
    dispose: teardown,
    async run() {
      if (started) throw new Error('SHACO_BOOTSTRAP_ALREADY_STARTED')
      started = true
      try {
        guard()
        if (!target?.create) throw new Error('SHACO_MODULE_FACADE_MISSING')
        modules = target.create({ boot, staticModules, ...(loadBundle ? { loadBundle } : {}) })
        evidence.clientModuleSystems++
        const rows = modules.manifest.plugins
        const harness = rows.filter(row => row.id !== PRODUCT_ROW)
        if (rows.length !== 29 || harness.length !== 28 || new Set(rows.map(row => row.id)).size !== 29
          || rows.at(-1).id !== PRODUCT_ROW || harness.some(row => !row.id.startsWith('@deepseek-ai/'))) throw new Error('SHACO_COMPOSITION_INVALID')
        ctx = new Context(); evidence.contexts++
        await ctx.plugin(Loader)
        guard()
        // Public ClientModuleLoaderTarget / Loader adapter, as documented by Frozen Harness.
        ctx.loader.internal = modules
        await Promise.all(harness.filter(row => row.immediately).map(row => modules.prefetch(row.id)))
        await activate(harness)
        evidence.harnessActive = 28
        for (const service of REQUIRED_SERVICES) if (ctx.get(service) === undefined) throw new Error('SHACO_REQUIRED_SERVICE_MISSING')
        bridge.harnessReady = true
        await activate(rows.filter(row => row.id === PRODUCT_ROW))
        evidence.productActive = true
        if (!winner()) throw new Error('SHACO_ROOT_OWNERSHIP_MISSING')
        offs.push(ctx.slots.onEntryError((key) => { if (key === 'root') fail('SHACO_ROOT_RENDER_FAILED') }))
        offs.push(ctx.slots.subscribe('root', () => { if (!disposed && !winner()) fail('SHACO_ROOT_OWNERSHIP_LOST') }))
        watch = ctx.inject(REQUIRED_SERVICES, scope => {
          scope.effect(() => () => { if (!disposed) fail('SHACO_REQUIRED_SERVICE_REVOKED') }, 'shaco.required-service-lifetime')
        })
        await watch
        guard()
        if (!winner()) throw new Error('SHACO_ROOT_OWNERSHIP_LOST')
        container.replaceChildren()
        mounting = true
        unmount = ctx.uiRenderer.mount(container)
        mounting = false
        evidence.mountCalls++; evidence.reactRoots = 1
        guard()
        if (!winner()) throw new Error('SHACO_ROOT_OWNERSHIP_LOST')
        evidence.rootOwner = 'SHACO'
        container.hidden = false; container.inert = false
      } catch (error) {
        fail('SHACO_BOOTSTRAP_FAILED')
        if (mounting) mounting = false
        await teardown()
        throw error
      }
    },
  }
}
