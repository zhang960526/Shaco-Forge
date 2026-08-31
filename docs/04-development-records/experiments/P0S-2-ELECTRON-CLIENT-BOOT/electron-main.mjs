import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFile, readFile, writeFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { extname, join, normalize, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, BrowserWindow, ipcMain, protocol } from 'electron'

const NOT_PRODUCTION = true
const HARNESS_COMMIT = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
const HARNESS_VERSION = '0.1.2-alpha.1'
const SETTINGS_NS = 'p0s2-canary'
const SPIKE_ROOT = import.meta.dirname
const HARNESS_ROOT = resolve(process.env.P0S2_HARNESS_ROOT || 'D:/Project/Shaco-Forge-Upstream/deepseek-harness')
const CLIENT_DIST = join(SPIKE_ROOT, 'client-dist')
const RUNTIME_DATA = join(SPIKE_ROOT, 'runtime-data')
const EVIDENCE_DIR = join(SPIKE_ROOT, 'evidence')
const SETTINGS_PATH = join(RUNTIME_DATA, 'settings.yaml')
const runModeArg = process.argv.find((arg) => arg.startsWith('--run-mode='))
const runMode = runModeArg?.slice('--run-mode='.length)
const canaryArg = process.argv.find((arg) => arg.startsWith('--canary='))
const canary = canaryArg?.slice('--canary='.length)
if (!['write', 'read'].includes(runMode) || typeof canary !== 'string' || canary.length < 8 || canary.length > 200) {
  throw new Error('run requires --run-mode=write|read and a bounded --canary value')
}

protocol.registerSchemesAsPrivileged([{
  scheme: 'shaco-forge',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: false,
    stream: true,
  },
}])

await mkdir(RUNTIME_DATA, { recursive: true })
await mkdir(EVIDENCE_DIR, { recursive: true })
const clientBuildManifest = JSON.parse(await readFile(join(CLIENT_DIST, 'build-manifest.json'), 'utf8'))
const diagnosticPath = join(EVIDENCE_DIR, `${runMode}-diagnostic.log`)
await writeFile(diagnosticPath, `[P0S2] main started ${new Date().toISOString()}\n`, 'utf8')
const diagnostic = async (message) => {
  await appendFile(diagnosticPath, `[P0S2] ${message} ${new Date().toISOString()}\n`, 'utf8')
}
app.setPath('userData', join(RUNTIME_DATA, `electron-user-data-${runMode}`))
app.commandLine.appendSwitch('disable-breakpad')

const settingsPackage = join(HARNESS_ROOT, 'packages/settings/settings-file/package.json')
const settingsRequire = createRequire(settingsPackage)
const { Context } = await import(pathToFileURL(settingsRequire.resolve('@deepseek-ai/cordis')).href)
const schemaModule = await import(pathToFileURL(settingsRequire.resolve('@deepseek-ai/schemastery')).href)
const z = schemaModule.default
const { FileSettingsProvider } = await import(pathToFileURL(join(HARNESS_ROOT, 'packages/settings/settings-file/lib/index.js')).href)
const { settingsNamespace } = await import(pathToFileURL(settingsRequire.resolve('@deepseek-ai/dsh-settings')).href)

const settingsContext = new Context()
const settingsFiber = settingsContext.plugin(FileSettingsProvider, { path: SETTINGS_PATH, watch: false })
await settingsFiber
console.log(`[P0S2] Harness FileSettingsProvider ready (${runMode})`)
await diagnostic('Harness FileSettingsProvider ready')
settingsContext.settings.register(settingsNamespace(SETTINGS_NS), z.object({
  canary: z.string().default(''),
}))

function namespaceView(descriptor) {
  return {
    ns: String(descriptor.ns),
    schema: descriptor.schema,
    value: descriptor.value,
    ...(descriptor.base === undefined ? {} : { base: descriptor.base }),
    ...(descriptor.user === undefined ? {} : { user: descriptor.user }),
    applies: descriptor.applies,
    secrets: (descriptor.secrets ?? []).map((secret) => ({ path: [...secret.path], set: secret.set })),
    revision: descriptor.revision,
  }
}

function describeSettings() {
  return {
    writable: settingsContext.settings.writable,
    hasDocument: settingsContext.settings.documentPath !== undefined,
    namespaces: settingsContext.settings.describe({ redactSecrets: true }).map(namespaceView),
  }
}

function validateSettingsPayload(endpoint, payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) throw new Error('payload must be an object')
  const args = payload.args
  if (typeof args !== 'object' || args === null || Array.isArray(args)) throw new Error('payload.args must be an object')
  if (endpoint !== 'settings/describe') {
    if (args.ns !== SETTINGS_NS) throw new Error(`namespace is not allowlisted: ${String(args.ns)}`)
    if (args.expectedRevision !== undefined && (!Number.isInteger(args.expectedRevision) || args.expectedRevision < 0)) {
      throw new Error('expectedRevision must be a non-negative integer')
    }
  }
  return args
}

async function settingsRpc(endpoint, payload) {
  try {
    const args = validateSettingsPayload(endpoint, payload)
    if (endpoint === 'settings/describe') return { ok: true, value: describeSettings() }
    const ns = settingsNamespace(args.ns)
    if (endpoint === 'settings/update') await settingsContext.settings.update(ns, args.patch, args.expectedRevision)
    else if (endpoint === 'settings/replace') await settingsContext.settings.replace(ns, args.section, args.expectedRevision)
    else if (endpoint === 'settings/mutate') {
      if (!Array.isArray(args.ops) || args.ops.length < 1 || args.ops.length > 8) throw new Error('ops must contain 1..8 items')
      for (const op of args.ops) {
        if (op?.op !== 'set' || !Array.isArray(op.path) || op.path.length !== 1 || op.path[0] !== 'canary'
          || typeof op.value !== 'string' || op.value.length < 8 || op.value.length > 200) {
          throw new Error('only a bounded set operation for p0s2-canary.canary is allowed')
        }
      }
      await settingsContext.settings.mutate(ns, args.ops, args.expectedRevision)
    } else throw new Error(`endpoint is not allowlisted: ${endpoint}`)
    const descriptor = settingsContext.settings.describe({ redactSecrets: true }).find((row) => row.ns === ns)
    if (descriptor === undefined) throw new Error(`settings namespace disappeared: ${ns}`)
    return { ok: true, value: namespaceView(descriptor) }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'settings-rejected',
        message: error instanceof Error ? error.message : String(error),
        details: { ns: SETTINGS_NS },
      },
    }
  }
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ')

function resolveClientPath(urlText) {
  const url = new URL(urlText)
  if (url.protocol !== 'shaco-forge:' || url.hostname !== 'client') throw new Error('untrusted custom-scheme authority')
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)
  const candidate = resolve(CLIENT_DIST, `.${normalize(pathname.replaceAll('/', sep))}`)
  const child = relative(CLIENT_DIST, candidate)
  if (child.startsWith('..') || resolve(candidate) === resolve(CLIENT_DIST)) throw new Error('path escaped client-dist')
  return candidate
}

function listeningSocketsForApp() {
  const metrics = app.getAppMetrics()
  const pids = new Set(metrics.map((metric) => metric.pid))
  pids.add(process.pid)
  let stdout = ''
  try {
    stdout = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8', windowsHide: true })
  } catch (error) {
    return { pids: [...pids], listeners: [], probeError: error instanceof Error ? error.message : String(error) }
  }
  const listeners = stdout.split(/\r?\n/).map((line) => line.trim()).filter((line) => {
    if (!/\bLISTENING\b/.test(line)) return false
    const pid = Number(line.split(/\s+/).at(-1))
    return pids.has(pid)
  })
  return { pids: [...pids], listeners, probeError: null }
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

await diagnostic('waiting for Electron app ready')
app.whenReady().then(runElectron).catch(async (error) => {
  await diagnostic(`fatal main error: ${error instanceof Error ? error.stack : String(error)}`)
  app.exit(1)
})

async function runElectron() {
console.log(`[P0S2] Electron app ready (${runMode})`)
await diagnostic('Electron app ready')
protocol.handle('shaco-forge', async (request) => {
  try {
    const path = resolveClientPath(request.url)
    const body = await readFile(path)
    const headers = new Headers({
      'Content-Type': mimeTypes[extname(path).toLowerCase()] || 'application/octet-stream',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
    })
    if (extname(path).toLowerCase() === '.html') headers.set('Content-Security-Policy', csp)
    return new Response(body, { status: 200, headers })
  } catch (error) {
    return new Response(`P0.S-2 resource unavailable: ${error instanceof Error ? error.message : String(error)}`, {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
})

const consoleRows = []
const startUtc = new Date().toISOString()
let completed = false
let finishResolve
const finished = new Promise((resolvePromise) => { finishResolve = resolvePromise })

ipcMain.handle('p0s2:run-request', () => ({ runMode, canary }))
ipcMain.handle('p0s2:settings-rpc', (_event, endpoint, payload) => settingsRpc(endpoint, payload))
ipcMain.handle('p0s2:complete', async (_event, rendererResult) => {
  if (completed) return { accepted: false }
  completed = true
  const sockets = listeningSocketsForApp()
  const evidence = {
    schemaVersion: 1,
    notProduction: NOT_PRODUCTION,
    gate: 'P0.S-2',
    runMode,
    canarySha256: sha256(canary),
    startedAtUtc: startUtc,
    completedAtUtc: new Date().toISOString(),
    runtime: {
      platform: process.platform,
      arch: process.arch,
      node: process.versions.node,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      processArgv: process.argv.map((arg) => arg.includes(canary) ? arg.replace(canary, '<P0S2_CANARY>') : arg),
      appMetrics: app.getAppMetrics().map((metric) => ({ pid: metric.pid, type: metric.type, serviceName: metric.serviceName })),
    },
    frozenHarness: {
      root: HARNESS_ROOT,
      commit: HARNESS_COMMIT,
      version: HARNESS_VERSION,
      worktreeMutatedByRuntime: false,
    },
    clientDistIdentity: clientBuildManifest,
    electronBoundary: {
      browserWindowPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      preloadExports: ['runRequest', 'settingsRpc', 'securitySnapshot', 'complete'],
      arbitraryIpcExposed: false,
      filesystemExposed: false,
      shellExposed: false,
      credentialBridgeExposed: false,
      csp,
    },
    settingsPersistence: {
      provider: '@deepseek-ai/dsh-settings-file',
      contract: 'ctx.remote.settings.describe/mutate',
      documentFormat: 'settings.yaml',
      documentPath: SETTINGS_PATH,
      memoryFallback: false,
    },
    network: {
      stockDshWebAppStarted: false,
      loadingOrigin: 'shaco-forge://client',
      tcpListenerProbe: sockets,
    },
    renderer: rendererResult,
    console: consoleRows,
  }
  const target = join(EVIDENCE_DIR, `${runMode}.json`)
  await writeFile(target, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
  finishResolve({ ok: rendererResult?.ok === true && sockets.listeners.length === 0, target })
  return { accepted: true }
})

const window = new BrowserWindow({
  width: 1280,
  height: 900,
  show: false,
  webPreferences: {
    preload: join(SPIKE_ROOT, 'preload.cjs'),
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    devTools: false,
  },
})
window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
window.webContents.on('will-navigate', (event, target) => {
  if (!target.startsWith('shaco-forge://client/')) event.preventDefault()
})
window.webContents.on('console-message', (_event, level, message, line, sourceId) => {
  consoleRows.push({ level, message, line, sourceId })
  void diagnostic(`renderer console level=${level} ${message} (${sourceId}:${line})`)
})
window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
  consoleRows.push({ level: 3, message: `did-fail-load ${errorCode}: ${errorDescription}`, validatedURL, isMainFrame })
  void diagnostic(`did-fail-load ${errorCode}: ${errorDescription} ${validatedURL}`)
})
window.webContents.on('render-process-gone', (_event, details) => {
  consoleRows.push({ level: 3, message: 'render-process-gone', details })
  void diagnostic(`render-process-gone ${JSON.stringify(details)}`)
})

const targetUrl = `shaco-forge://client/index.html?fixture&p0s2Run=${encodeURIComponent(runMode)}`
await window.loadURL(targetUrl)
console.log(`[P0S2] custom-scheme document loaded (${runMode})`)
await diagnostic('custom-scheme document loaded')
const timeout = setTimeout(() => finishResolve({ ok: false, target: null, timeout: true }), 45_000)
const result = await finished
console.log(`[P0S2] renderer result (${runMode}): ${JSON.stringify(result)}`)
await diagnostic(`renderer result ${JSON.stringify(result)}`)
clearTimeout(timeout)
await settingsFiber.dispose()
window.destroy()
app.exit(result.ok ? 0 : 1)
}
