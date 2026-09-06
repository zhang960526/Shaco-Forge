import { execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { extname, join, normalize, relative, resolve, sep } from 'node:path'
import { app, BrowserWindow, ipcMain, protocol, session } from 'electron'

const NOT_PRODUCTION = true
const HARD_TIMEOUT_MS = 45_000
const EXPECTED_ELECTRON = '35.7.5'
const EXPECTED_NODE = '22.16.0'
const EXPECTED_CHROME = '134.0.6998.205'
const SPIKE_ROOT = import.meta.dirname
const CLIENT_DIST = join(SPIKE_ROOT, 'client-dist')
const RUNTIME_ROOT = join(SPIKE_ROOT, 'runtime-data')
const attemptArg = process.argv.find((arg) => arg.startsWith('--attempt-id='))
const attemptId = attemptArg?.slice('--attempt-id='.length)
if (typeof attemptId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId)) {
  throw new Error('Electron run requires a version-4 --attempt-id UUID')
}
const EVIDENCE_DIR = join(SPIKE_ROOT, 'evidence', attemptId)
const RUNTIME_DIR = join(RUNTIME_ROOT, attemptId)

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

await mkdir(EVIDENCE_DIR, { recursive: true })
await mkdir(RUNTIME_DIR, { recursive: true })
app.setPath('userData', join(RUNTIME_DIR, 'electron-user-data'))
app.setPath('crashDumps', join(RUNTIME_DIR, 'crash-dumps'))
app.commandLine.appendSwitch('disable-breakpad')

const buildManifest = JSON.parse(await readFile(join(CLIENT_DIST, 'build-manifest.json'), 'utf8'))
const logRows = []
let logBytes = 0
const fatalMain = []
const requestRows = []
const blockedNetworkRequests = []
const MAX_LOG_LINES = 200
const MAX_LOG_BYTES = 64 * 1024

function sanitize(value) {
  return String(value)
    .replaceAll(SPIKE_ROOT, '<SPIKE_ROOT>')
    .replace(/C:\\Users\\[^\\\s]+/gi, '<USER_HOME>')
    .slice(0, 2000)
}

function log(kind, value) {
  if (logRows.length >= MAX_LOG_LINES) return
  const row = `${new Date().toISOString()} ${kind} ${sanitize(value)}`
  const bytes = Buffer.byteLength(`${row}\n`, 'utf8')
  if (logBytes + bytes > MAX_LOG_BYTES) return
  logRows.push(row)
  logBytes += bytes
}

function recordFatal(kind, reason) {
  const row = { kind, message: sanitize(reason instanceof Error ? reason.stack ?? reason.message : reason) }
  if (fatalMain.length < 20) fatalMain.push(row)
  log(kind, row.message)
}

process.on('uncaughtException', (error) => recordFatal('uncaughtException', error))
process.on('unhandledRejection', (reason) => recordFatal('unhandledRejection', reason))

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
  "script-src 'self' 'unsafe-eval'",
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
  return { candidate, pathname }
}

function listeningSocketsForApp() {
  const metrics = app.getAppMetrics()
  const pids = new Set(metrics.map((metric) => metric.pid))
  pids.add(process.pid)
  try {
    const stdout = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8', windowsHide: true })
    const listeners = stdout.split(/\r?\n/).map((line) => line.trim()).filter((line) => {
      if (!/\bLISTENING\b/.test(line)) return false
      return pids.has(Number(line.split(/\s+/).at(-1)))
    })
    return { pids: [...pids].sort((a, b) => a - b), listeners, probeError: null }
  } catch (error) {
    return { pids: [...pids].sort((a, b) => a - b), listeners: [], probeError: sanitize(error) }
  }
}

let completed = false
let finishResolve
const finished = new Promise((resolvePromise) => { finishResolve = resolvePromise })
const startedAtUtc = new Date().toISOString()
const startedMonotonic = performance.now()

ipcMain.handle('p0s6:complete', (_event, rendererResult) => {
  if (completed) return { accepted: false }
  completed = true
  finishResolve({ rendererResult, timeoutTriggered: false })
  return { accepted: true }
})

app.whenReady().then(runElectron).catch((error) => {
  recordFatal('mainBootFailure', error)
  app.exit(1)
})

async function runElectron() {
  log('main', 'Electron app ready')
  protocol.handle('shaco-forge', async (request) => {
    try {
      const { candidate, pathname } = resolveClientPath(request.url)
      if (requestRows.length < 100) requestRows.push({ method: request.method, pathname })
      const body = await readFile(candidate)
      const headers = new Headers({
        'Content-Type': mimeTypes[extname(candidate).toLowerCase()] || 'application/octet-stream',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'X-Content-Type-Options': 'nosniff',
      })
      if (extname(candidate).toLowerCase() === '.html') headers.set('Content-Security-Policy', csp)
      return new Response(body, { status: 200, headers })
    } catch (error) {
      log('scheme-error', error)
      return new Response(`P0.S-6 resource unavailable: ${sanitize(error)}`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
  })

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    if (/^https?:/i.test(details.url)) {
      if (blockedNetworkRequests.length < 20) blockedNetworkRequests.push({ resourceType: details.resourceType, protocol: new URL(details.url).protocol })
      callback({ cancel: true })
      return
    }
    callback({ cancel: false })
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
    log(`renderer-console-${String(level)}`, `${message} (${sourceId}:${String(line)})`)
  })
  window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    log('did-fail-load', `${String(errorCode)} ${errorDescription} ${validatedURL} main=${String(isMainFrame)}`)
  })
  window.webContents.on('render-process-gone', (_event, details) => recordFatal('render-process-gone', JSON.stringify(details)))

  let loadFailure = null
  try {
    await window.loadURL('shaco-forge://client/index.html?fixture')
    log('main', 'custom-scheme document loaded')
  } catch (error) {
    loadFailure = sanitize(error)
    recordFatal('loadURL', error)
    if (!completed) {
      completed = true
      finishResolve({ rendererResult: { ok: false, failure: loadFailure }, timeoutTriggered: false })
    }
  }

  const timeout = setTimeout(() => {
    if (completed) return
    completed = true
    finishResolve({
      rendererResult: { ok: false, failure: '45 second Electron hard timeout' },
      timeoutTriggered: true,
    })
  }, HARD_TIMEOUT_MS)
  const outcome = await finished
  clearTimeout(timeout)

  const listeners = listeningSocketsForApp()
  const pluginRequests = requestRows.filter((row) => row.pathname === '/plugins' || row.pathname.startsWith('/plugins/'))
  const evidence = {
    schemaVersion: 1,
    notProduction: NOT_PRODUCTION,
    contractId: 'P0S6-MEC-20260903-01',
    slice: 'ONE_FIXED_CLIENT_BOOT_SLICE',
    attemptId,
    startedAtUtc,
    completedAtUtc: new Date().toISOString(),
    durationMs: Math.round(performance.now() - startedMonotonic),
    hardTimeoutMs: HARD_TIMEOUT_MS,
    timeoutTriggered: outcome.timeoutTriggered,
    runtime: {
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      exactIdentityMatched: process.versions.electron === EXPECTED_ELECTRON
        && process.versions.node === EXPECTED_NODE
        && process.versions.chrome === EXPECTED_CHROME
        && process.platform === 'win32'
        && process.arch === 'x64',
      appProcesses: app.getAppMetrics().map((metric) => ({ pid: metric.pid, type: metric.type, serviceName: metric.serviceName })),
    },
    electronBoundary: {
      customScheme: {
        scheme: 'shaco-forge',
        standard: true,
        secure: true,
        supportFetchAPI: true,
      },
      browserWindowPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      csp,
      preloadExports: ['complete', 'securitySnapshot'],
    },
    customSchemeRequests: requestRows,
    livePluginsRequestCount: pluginRequests.length,
    blockedHttpRequests: blockedNetworkRequests,
    stockWebServerObservation: {
      startedByExperiment: false,
      processAssociatedTcpListeners: listeners,
    },
    processAssociatedListenerObservation: listeners,
    renderer: outcome.rendererResult,
    rendererConsoleErrorCount: logRows.filter((row) => row.includes(' renderer-console-3 ')).length,
    fatalMain,
    loadFailure,
    buildManifestIdentity: {
      productGraphCount: buildManifest.productGraph?.totalCount,
      staticArtifactSemanticTransformation: buildManifest.artifactAssembly?.staticArtifactSemanticTransformation,
    },
    relevantLog: {
      lineCount: logRows.length,
      byteCount: logBytes,
      cap: '200 lines OR 64 KiB, whichever comes first',
    },
  }
  await writeFile(join(EVIDENCE_DIR, 'runtime.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
  await writeFile(join(EVIDENCE_DIR, 'runtime.log'), `${logRows.join('\n')}\n`, 'utf8')
  window.destroy()
  app.exit(outcome.rendererResult?.ok === true && !outcome.timeoutTriggered && fatalMain.length === 0 ? 0 : 1)
}
