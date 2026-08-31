const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitFor(label, read, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = read()
    if (value !== undefined && value !== null && value !== false) return value
    await delay(50)
  }
  throw new Error(`timed out waiting for ${label}`)
}

function exactText(text) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if (node.children.length === 0 && node.textContent?.trim() === text) return node
  }
  return undefined
}

async function runProbe() {
  const sessionTree = await waitFor('Harness Sessions tree', () =>
    document.querySelector('[role="tree"][aria-label="Sessions"], [role="tree"]'))
  const sessionTitle = await waitFor('fixture session title', () => exactText('Fixture 历史会话'))
  sessionTitle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  const chatMarker = await waitFor('fixture chat content', () => document.querySelector('[data-sample="bash"]'))
  const settings = await waitFor('Harness Settings contract probe', () => globalThis.__P0S2_SETTINGS_RESULT__)
  const security = await globalThis.p0s2Bridge.securitySnapshot()
  const transportHooks = globalThis.__DSH_TRANSPORT__
  const transportHookKeys = transportHooks === undefined ? [] : Object.keys(transportHooks).sort()
  const directTransportFunctionsPresent = ['fetch', 'openStream', 'loadBundle']
    .some((key) => typeof transportHooks?.[key] === 'function')

  const result = {
    ok: settings.ok === true
      && location.protocol === 'shaco-forge:'
      && security.contextIsolated === true
      && security.sandboxed === true
      && typeof globalThis.require === 'undefined'
      && typeof globalThis.process === 'undefined'
      && globalThis.__P0S2_FATAL__.length === 0,
    loading: {
      href: location.href,
      protocol: location.protocol,
      origin: location.origin,
      customScheme: location.protocol === 'shaco-forge:',
      stockHttpOrigin: location.protocol === 'http:' || location.protocol === 'https:',
    },
    harnessClient: {
      appWebEntryMounted: document.querySelector('#root')?.children.length > 0,
      bootGraphEntries: globalThis.__DSH_BOOT__?.entries?.length ?? 0,
      sessionTreeEntered: sessionTree !== null,
      sessionTitle: sessionTitle.textContent?.trim(),
      chatMarker: chatMarker.getAttribute('data-sample'),
      pluginStyleOwners: [...document.head.querySelectorAll('style[data-plugin]')]
        .map((style) => style.getAttribute('data-plugin')),
    },
    settings,
    security: {
      ...security,
      rendererRequireType: typeof globalThis.require,
      rendererProcessType: typeof globalThis.process,
      exposedGlobals: Object.keys(globalThis).filter((key) => key.startsWith('p0s2')),
      workerTransportPresent: '__DSH_WORKER_TRANSPORT__' in globalThis,
      dshTransportHookKeys: transportHookKeys,
      directTransportFunctionsPresent,
      credentialBridgePresent: 'credentials' in globalThis.p0s2Bridge,
    },
    rendererFatalEvents: [...globalThis.__P0S2_FATAL__],
  }
  await globalThis.p0s2Bridge.complete(result)
}

runProbe().catch(async (error) => {
  await globalThis.p0s2Bridge.complete({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    rendererFatalEvents: [...globalThis.__P0S2_FATAL__],
  })
})
