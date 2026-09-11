import { startShaco, type ShacoPresentation } from './shaco-bootstrap.mjs'
import './theme/tokens.css'
import './theme/themes.css'
import './styles.css'
import { RootThemeController } from './theme/theme.js'

const HARNESS_PACKAGE = '@deepseek-ai/dsh-client-web@0.1.2-alpha.1'
const HARNESS_EXPORT = 'OPTION_B_PUBLIC_LOWER_LEVEL_CLIENT_BOOTSTRAP'
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
const themeController = new RootThemeController(document.documentElement, {
  matchesDark: () => systemThemeMedia.matches,
  subscribe: listener => {
    systemThemeMedia.addEventListener('change', listener)
    return () => systemThemeMedia.removeEventListener('change', listener)
  },
})
function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error('Shaco Forge mount is missing')
  return element
}
const truthfulState = requiredElement<HTMLElement>('[data-testid="truthful-state"]')
const mountRoot = requiredElement<HTMLElement>('#harness-client-root')
let entry: ShacoPresentation | undefined
let runResolved = false
let runFailure: string | undefined
let projection: BootstrapProjection | undefined
let failed = false
function displayState(): void {
  const connected = runResolved && !failed && projection?.connectionState === 'CONNECTED'
  mountRoot.hidden = !connected
  mountRoot.inert = !connected
  mountRoot.style.visibility = connected ? 'visible' : 'hidden'
  truthfulState.hidden = connected
  if (!connected) {
    const heading = document.createElement('strong')
    const detail = document.createElement('span')
    heading.textContent = 'Shaco Forge'
    detail.textContent = failed ? '工作空间暂不可用，请重新打开窗口。' : projection?.connectionState === 'RECONNECTING' || projection?.connectionState === 'CONNECTION_LOST' ? '连接已断开，正在重新连接…' : '正在准备工作空间…'
    truthfulState.replaceChildren(heading, detail)
  }
}
const presentation = {
  harnessReady: false,
  theme: themeController,
  failClosed: (_reason: string): void => {
    failed = true; displayState()
    queueMicrotask(() => { const old = entry; entry = undefined; void old?.dispose().catch(() => {}) })
  },
  beforeRootRevoke: (): void => {},
}
window.__SHACO_PRESENTATION__ = presentation
function projectBootstrap(state: BootstrapProjection): void {
  projection = state
  if (['CONNECTION_LOST', 'RECONNECTING', 'FAILED', 'INCOMPATIBLE', 'DISCONNECTED'].includes(state.connectionState ?? '')) {
    const old = entry; entry = undefined
    void old?.dispose()
  }
  if (['worker-failed', 'host-exited', 'carrier-failed'].includes(state.phase) || ['FAILED', 'INCOMPATIBLE'].includes(state.connectionState ?? '')) failed = true
  displayState()
}
projectBootstrap(await window.shacoForge.bootstrap.getState())
const unsubscribeBootstrap = window.shacoForge.bootstrap.subscribe(projectBootstrap)
window.addEventListener('pagehide', () => {
  unsubscribeBootstrap(); themeController.dispose(); void entry?.dispose()
}, { once: true })
const fatalEvents: Array<{ kind: string; message: string }> = []
window.addEventListener('error', () => fatalEvents.push({ kind: 'error', message: 'RENDERER_ERROR' }))
window.addEventListener('unhandledrejection', () => fatalEvents.push({ kind: 'unhandledrejection', message: 'RENDERER_PROMISE_REJECTED' }))
entry = startShaco(mountRoot, presentation)
try {
  await entry.run()
  runResolved = true
} catch {
  runFailure = 'SHACO_BOOTSTRAP_FAILED'
  failed = true
}
displayState()

const afterRender = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
await afterRender()
const transportDeadline = Date.now() + 10_000
while (Date.now() < transportDeadline
  && (window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.eventsReady === 0
    || window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.fetchEndpoints.length === 0)) {
  await new Promise(resolve => setTimeout(resolve, 100))
}
const shellText = document.body.textContent ?? ''
const rootText = mountRoot.textContent ?? ''
const renderedClientIdentity = mountRoot.children.length > 0
const themeSmokeRequested = new URLSearchParams(location.search).get('theme-smoke') === '1'
const semanticTokenNames = {
  appSurface: '--surface-app',
  sidebarSurface: '--surface-sidebar',
  primaryText: '--text-primary',
  border: '--border-default',
  selectedRow: '--selection-background',
  composerSurface: '--surface-elevated',
} as const

function readSemanticThemeValues(): Record<keyof typeof semanticTokenNames, string> {
  const computed = getComputedStyle(document.documentElement)
  return Object.fromEntries(Object.entries(semanticTokenNames).map(([name, token]) => [name, computed.getPropertyValue(token).trim()])) as Record<keyof typeof semanticTokenNames, string>
}

const initialTheme = {
  mode: themeController.getThemeMode(),
  resolved: themeController.getResolvedTheme(),
  rootTheme: document.documentElement.dataset.theme,
  values: readSemanticThemeValues(),
}
let rootSwitchSmoke: Record<string, unknown> = { requested: false, pass: true }
if (themeSmokeRequested) {
  themeController.setThemeMode('dark')
  await afterRender()
  const darkValues = readSemanticThemeValues()
  const changedSemanticTokens = Object.keys(semanticTokenNames).filter(name => initialTheme.values[name as keyof typeof semanticTokenNames] !== darkValues[name as keyof typeof semanticTokenNames])
  themeController.setThemeMode('light')
  await afterRender()
  rootSwitchSmoke = {
    requested: true,
    pass: changedSemanticTokens.length === Object.keys(semanticTokenNames).length,
    lightValues: initialTheme.values,
    darkValues,
    changedSemanticTokens,
    finalMode: themeController.getThemeMode(),
    finalResolved: themeController.getResolvedTheme(),
    finalRootTheme: document.documentElement.dataset.theme,
  }
}
const themeSmokePassed = rootSwitchSmoke.pass === true
const evidence = {
  ok: runResolved && renderedClientIdentity && fatalEvents.length === 0 && themeSmokePassed,
  harnessClient: {
    package: HARNESS_PACKAGE,
    export: HARNESS_EXPORT,
    reactResolution: '18.3.1',
    mountRoot: '#harness-client-root',
    runResolved,
    renderedClientIdentity,
    rootChildCount: mountRoot.children.length,
    bootPagePresent: mountRoot.querySelector('[data-dsh-boot]') !== null,
    renderedTextPresent: rootText.trim().length > 0,
    appWebEntryCount: 0,
    optionB: entry?.diagnostics(),
    fixtureOrMockPresent: false,
    connectionState: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.eventsReady > 0 ? 'AUTHENTICATED_CARRIER_EVENTS_READY' : 'CARRIER_NOT_READY',
    failure: runFailure,
  },
  loading: {
    url: location.href,
    protocol: location.protocol,
    origin: location.origin,
  },
  security: {
    rendererRequireType: typeof (globalThis as { require?: unknown }).require,
    rendererProcessType: typeof (globalThis as { process?: unknown }).process,
    exposedBridgeKeys: Object.keys(window.shacoForge).sort(),
    pipeAccess: false,
    pipeNamePresent: false,
    reusableSecretPresent: false,
    directWorkerTransport: false,
  },
  theme: {
    architecture: 'MODE_PLUS_TEMPLATE',
    supportedModes: ['light', 'dark', 'system'],
    initial: initialTheme,
    systemPreferenceQuery: systemThemeMedia.media,
    rootSwitchSmoke,
    visibleAppearanceSettings: false,
    harnessClientThemeUnification: 'SHACO_TEMPLATE_AUTHORITY',
  },
  reducedView: {
    shellMode: 'FULL_SHACO_PRESENTATION',
    singleSidebar: document.querySelectorAll('[data-testid="shaco-sidebar"]').length === 1 && document.querySelector('[data-shaco-shell] > .sidebar') === null,
    outerActionsEnabled: ['new-chat', 'settings'].every(id => document.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`)?.disabled === false),
    newChatVisible: document.querySelector('[data-testid="new-chat"]') !== null,
    projectDirectoryVisible: document.querySelector('[data-testid="project-directory"]') !== null,
    settingsVisible: document.querySelector('[data-testid="settings"]') !== null,
    automationAbsent: !shellText.includes('Automation') && !shellText.includes('自动化'),
    agentCollaborationAbsent: !shellText.includes('Agent Collaboration') && !shellText.includes('Agent 协作'),
    knowledgeBaseAbsent: !shellText.includes('Knowledge Base') && !shellText.includes('知识库'),
    centeredChatLayout: getComputedStyle(document.querySelector('.centered-content') as Element).maxWidth === '1100px',
    noPermanentInspector: document.querySelector('[data-inspector]') === null,
    truthfulConnectionState: projection?.connectionState === 'CONNECTED'
      || truthfulState.textContent?.includes('正在准备') === true,
  },
  transport: {
    ownsHost: true,
    fetchUsed: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.fetchEndpoints.length > 0,
    fetchEndpoints: [...new Set(window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.fetchEndpoints)],
    openStreamUsed: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.streamEndpoints.length > 0,
    streamEndpoints: [...new Set(window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.streamEndpoints)],
    realEventsStream: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.streamEndpoints.includes('$events'),
    realEventsReady: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.eventsReady > 0,
    abortCancels: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.abortCancels,
    iteratorCancels: window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.iteratorCancels,
  },
  fatalEvents,
}
window.shacoForge.reportRuntimeEvidence(evidence)
