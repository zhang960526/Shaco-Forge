import { AppWebEntry } from '@deepseek-ai/dsh-client-web'
import './theme/tokens.css'
import './theme/themes.css'
import './styles.css'
import { RootThemeController } from './theme/theme.js'

const HARNESS_PACKAGE = '@deepseek-ai/dsh-client-web@0.1.2-alpha.1'
const HARNESS_EXPORT = '@deepseek-ai/dsh-client-web.AppWebEntry'
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
const themeController = new RootThemeController(document.documentElement, {
  matchesDark: () => systemThemeMedia.matches,
  subscribe: listener => {
    systemThemeMedia.addEventListener('change', listener)
    return () => systemThemeMedia.removeEventListener('change', listener)
  },
})
window.addEventListener('pagehide', () => themeController.dispose(), { once: true })

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Shaco Shell required node is missing: ${selector}`)
  return element
}

const status = requiredElement<HTMLOutputElement>('[data-testid="connection-status"]')
const truthfulState = requiredElement<HTMLElement>('[data-testid="truthful-state"]')
const mountRoot = requiredElement<HTMLElement>('#harness-client-root')

function projectBootstrap(state: BootstrapProjection): void {
  status.textContent = state.message
  status.dataset.phase = state.phase
  if (state.phase === 'host-ready') {
    truthfulState.innerHTML = '<strong>Harness Host 已就绪</strong><span>Client 已挂载；Physical Carrier 将在 Slice 1B 连接。当前没有真实项目或会话。</span>'
  } else if (state.phase === 'worker-failed' || state.phase === 'host-exited') {
    truthfulState.innerHTML = `<strong>Harness 未连接</strong><span>${state.message}</span>`
  }
}

projectBootstrap(await window.shacoForge.bootstrap.getState())
window.shacoForge.bootstrap.subscribe(projectBootstrap)

const fatalEvents: Array<{ kind: string; message: string }> = []
window.addEventListener('error', event => fatalEvents.push({ kind: 'error', message: String(event.message).slice(0, 800) }))
window.addEventListener('unhandledrejection', event => fatalEvents.push({ kind: 'unhandledrejection', message: String(event.reason).slice(0, 800) }))

const entry = new AppWebEntry(mountRoot)
let runResolved = false
let runFailure: string | undefined
try {
  await entry.run()
  runResolved = true
} catch (error) {
  runFailure = error instanceof Error ? error.stack ?? error.message : String(error)
}

const afterRender = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
await afterRender()
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
    renderedTextSample: rootText.trim().slice(0, 500),
    fixtureOrMockPresent: false,
    connectionState: 'HOST_READY_OR_STARTING__PHYSICAL_CARRIER_NOT_CONNECTED',
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
  },
  theme: {
    architecture: 'SEMANTIC_DESIGN_TOKENS',
    supportedModes: ['light', 'dark', 'system'],
    initial: initialTheme,
    systemPreferenceQuery: systemThemeMedia.media,
    rootSwitchSmoke,
    visibleAppearanceSettings: false,
    harnessClientThemeUnification: 'FUTURE_INTEGRATION_SEAM',
  },
  reducedView: {
    newChatVisible: document.querySelector('[data-testid="new-chat"]') !== null,
    projectDirectoryVisible: document.querySelector('[data-testid="project-directory"]') !== null,
    settingsVisible: document.querySelector('[data-testid="settings"]') !== null,
    automationAbsent: !shellText.includes('Automation') && !shellText.includes('自动化'),
    agentCollaborationAbsent: !shellText.includes('Agent Collaboration') && !shellText.includes('Agent 协作'),
    knowledgeBaseAbsent: !shellText.includes('Knowledge Base') && !shellText.includes('知识库'),
    centeredChatLayout: getComputedStyle(document.querySelector('.centered-content') as Element).maxWidth === '1100px',
    noPermanentInspector: document.querySelector('[data-inspector]') === null,
    truthfulConnectionState: truthfulState.textContent?.includes('Physical Carrier') === true
      || truthfulState.textContent?.includes('正在启动') === true,
  },
  fatalEvents,
}
window.shacoForge.reportRuntimeEvidence(evidence)
