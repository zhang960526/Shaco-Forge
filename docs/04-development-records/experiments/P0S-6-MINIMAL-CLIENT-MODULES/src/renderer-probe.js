import { AppWebEntry } from '@deepseek-ai/dsh-client-web'

const ACTIVE = 2
const STATE_LABELS = ['pending', 'loading', 'active', 'failed', 'disposed', 'unloading']
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitFor(read, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = read()
    if (value) return value
    await delay(25)
  }
  return undefined
}

async function run() {
  const root = document.getElementById('root')
  if (root === null) throw new Error('P0.S-6 shell is missing #root')
  const bootStartedAt = performance.now()
  const entry = new AppWebEntry(root)
  await entry.run()
  const appNode = await waitFor(() => root.querySelector(':scope > :not([data-dsh-boot])'))

  const loaderEntries = entry.ctx?.loader?.entries?.() ?? []
  const activation = [...loaderEntries].map((row) => ({
    id: row.options?.name,
    stateCode: row.fiber?.state ?? null,
    state: row.fiber === undefined ? 'import-failed' : (STATE_LABELS[row.fiber.state] ?? `unknown-${String(row.fiber.state)}`),
    active: row.fiber?.state === ACTIVE,
    missingServices: row.fiber === undefined
      ? []
      : Object.keys(row.fiber.inject ?? {}).filter((service) => entry.ctx?.get?.(service) === undefined),
  })).sort((a, b) => String(a.id).localeCompare(String(b.id)))

  const graphIds = entry.modules?.manifest?.plugins?.map((row) => row.id) ?? []
  const registration = graphIds.map((id) => ({
    id,
    registered: entry.modules?.loadCache?.has(id) === true || entry.modules?.factories?.has(id) === true,
    materialized: entry.modules?.loadCache?.has(id) === true,
    factoryRetained: entry.modules?.factories?.has(id) === true,
  })).sort((a, b) => a.id.localeCompare(b.id))

  const omittedIds = [
    '@deepseek-ai/dsh-cordis-host-runner',
    '@deepseek-ai/dsh-cordis-client-runner',
    '@deepseek-ai/dsh-client-ui-cordis',
    '@deepseek-ai/dsh-tool-cordis',
  ]
  const omissions = omittedIds.map((id) => ({
    id,
    graph: graphIds.includes(id),
    registration: entry.modules?.loadCache?.has(id) === true || entry.modules?.factories?.has(id) === true,
    activation: activation.some((row) => row.id === id),
  }))

  const security = await globalThis.p0s6Bridge.securitySnapshot()
  clearTimeout(globalThis.__P0S6_CAPTURE__.safetyTimer)
  const result = {
    ok: activation.length === graphIds.length
      && activation.every((row) => row.active)
      && registration.every((row) => row.registered && row.materialized)
      && omissions.every((row) => !row.graph && !row.registration && !row.activation)
      && root.children.length > 0
      && root.querySelector(':scope > [data-dsh-boot]') === null
      && entry.ctx?.get?.('uiRenderer') !== undefined
      && globalThis.__P0S6_CAPTURE__.fatal.length === 0,
    appWebEntry: {
      runResolved: true,
      moduleStageComplete: entry.modules !== undefined && entry.manifest !== undefined,
      pluginActivationStageComplete: activation.length === graphIds.length && activation.every((row) => row.active),
      durationMs: Math.round(performance.now() - bootStartedAt),
    },
    graphIds,
    registration,
    activation,
    omissions,
    checkpoint: {
      uiRendererServicePresent: entry.ctx?.get?.('uiRenderer') !== undefined,
      bootPageReplaced: root.querySelector(':scope > [data-dsh-boot]') === null,
      coreRootMounted: root.children.length > 0 && appNode !== undefined,
      rootChildCount: root.children.length,
    },
    loading: {
      protocol: location.protocol,
      origin: location.origin,
      customScheme: location.protocol === 'shaco-forge:',
      fixtureTransportSelected: new URLSearchParams(location.search).has('fixture'),
    },
    security: {
      ...security,
      rendererRequireType: typeof globalThis.require,
      rendererProcessType: typeof globalThis.process,
      preloadExports: Object.keys(globalThis.p0s6Bridge).sort(),
      directFilesystemCapabilityExposed: false,
      directWorkerCapabilityExposed: false,
    },
    fatalEvents: [...globalThis.__P0S6_CAPTURE__.fatal],
  }
  await globalThis.p0s6Bridge.complete(result)
}

run().catch(async (error) => {
  clearTimeout(globalThis.__P0S6_CAPTURE__?.safetyTimer)
  await globalThis.p0s6Bridge.complete({
    ok: false,
    failure: error instanceof Error ? error.stack ?? error.message : String(error),
    fatalEvents: [...(globalThis.__P0S6_CAPTURE__?.fatal ?? [])],
  })
})

