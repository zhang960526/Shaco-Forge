import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, net, protocol } from 'electron'
import type { BootstrapEvent } from '@shaco-forge/contracts'
import { isSecureRendererConfiguration, rendererSecurityPreferences } from './security.js'
import { readSupervisorConfig, WorkerSupervisor } from './worker-supervisor.js'

protocol.registerSchemesAsPrivileged([{ scheme: 'shaco-forge', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }])

const currentDir = dirname(fileURLToPath(import.meta.url))
const rendererRoot = resolve(currentDir, '..', 'renderer')
const preloadPath = resolve(currentDir, '..', 'preload', 'preload.cjs')
const evidencePath = process.env.SHACO_FORGE_EVIDENCE_PATH
const screenshotPath = process.env.SHACO_FORGE_SCREENSHOT_PATH
const execFileAsync = promisify(execFile)

interface Projection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
}

let projection: Projection = { phase: 'worker-starting', message: 'Worker Starting', mainPid: process.pid }
let rendererEvidence: Record<string, unknown> | undefined
let supervisor: WorkerSupervisor | undefined
let mainWindow: BrowserWindow | undefined
let finalizing = false

function mime(path: string): string {
  return ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' } as Record<string, string>)[extname(path)] ?? 'application/octet-stream'
}

function updateProjection(event: BootstrapEvent): void {
  const messages: Record<string, string> = {
    'worker-starting': 'Worker Starting',
    'host-starting': 'Harness Host Starting',
    'host-ready': 'Harness Host Ready · Carrier Not Connected',
    'host-exited': 'Harness Host Disconnected',
    'worker-failed': 'Worker Failed',
    'worker-stopped': 'Worker Stopped',
  }
  projection = {
    phase: event.phase,
    message: event.error === undefined ? messages[event.phase] ?? event.phase : `${messages[event.phase] ?? event.phase}: ${event.error.split('\n')[0]}`,
    mainPid: process.pid,
    workerPid: event.workerPid,
    hostPid: event.hostPid,
  }
  mainWindow?.webContents.send('bootstrap:state', projection)
  void maybeFinalizeEvidence()
}

async function productListeners(pids: number[]): Promise<Array<{ localAddress: string; localPort: number; pid: number }>> {
  try {
    const { stdout } = await execFileAsync('netstat.exe', ['-ano', '-p', 'tcp'], { windowsHide: true })
    const wanted = new Set(pids)
    return stdout.split(/\r?\n/).flatMap(line => {
      const match = line.match(/^\s*TCP\s+(\S+):(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$/i)
      if (match === null) return []
      const pid = Number(match[3])
      return wanted.has(pid) ? [{ localAddress: match[1] ?? '', localPort: Number(match[2]), pid }] : []
    })
  } catch {
    return []
  }
}

async function maybeFinalizeEvidence(): Promise<void> {
  if (evidencePath === undefined || rendererEvidence === undefined || supervisor === undefined || finalizing) return
  const terminal = supervisor.events.some(event => event.phase === 'host-ready' || event.phase === 'worker-failed' || event.phase === 'host-exited')
  if (!terminal) return
  finalizing = true
  await new Promise(resolveDelay => setTimeout(resolveDelay, 700))
  if (screenshotPath !== undefined && mainWindow !== undefined && !mainWindow.isDestroyed()) {
    await mkdir(dirname(screenshotPath), { recursive: true })
    const image = await mainWindow.webContents.capturePage()
    await writeFile(screenshotPath, image.toPNG())
  }
  const processIds = [process.pid, ...supervisor.events.flatMap(event => [event.workerPid, event.hostPid].filter((pid): pid is number => pid !== undefined))]
  const listeners = await productListeners([...new Set(processIds)])
  const cleanup = await supervisor.stop()
  const clientManifestPath = resolve(rendererRoot, 'harness-client-manifest.json')
  const clientManifest = JSON.parse(await readFile(clientManifestPath, 'utf8')) as Record<string, unknown>
  const evidence = {
    result: (rendererEvidence.ok === true
      && supervisor.events.some(event => event.phase === 'host-ready')
      && listeners.length === 0
      && cleanup.exited) ? 'PASS' : 'FAIL',
    capturedAt: new Date().toISOString(),
    desktop: {
      electronVersion: process.versions.electron,
      mainPid: process.pid,
      loadingUrl: mainWindow?.webContents.getURL(),
      buildArtifactPath: rendererRoot,
      security: rendererSecurityPreferences,
      secureConfiguration: isSecureRendererConfiguration(),
    },
    bootstrapSupervisorChannel: {
      finalProductCarrier: false,
      events: supervisor.events,
    },
    renderer: rendererEvidence,
    harnessClientManifest: clientManifest,
    tcpListenersOwnedByObservedProductProcesses: listeners,
    cleanup,
    screenshotPath,
  }
  await mkdir(dirname(evidencePath), { recursive: true })
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
  app.quit()
}

async function registerClientProtocol(): Promise<void> {
  protocol.handle('shaco-forge', async request => {
    const url = new URL(request.url)
    if (url.hostname !== 'client') return new Response('Not found', { status: 404 })
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'PHYSICAL_CARRIER_NOT_CONNECTED', slice: 'V1-SLICE-1A' }, { status: 503 })
    }
    const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1))
    const filePath = resolve(rendererRoot, requested)
    if (filePath !== rendererRoot && !filePath.startsWith(`${rendererRoot}${sep}`)) return new Response('Not found', { status: 404 })
    try {
      const body = await readFile(filePath)
      return new Response(body, {
        status: 200,
        headers: {
          'content-type': mime(filePath),
          'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
          'x-content-type-options': 'nosniff',
        },
      })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 760,
    minHeight: 600,
    show: evidencePath === undefined,
    webPreferences: {
      ...rendererSecurityPreferences,
      preload: preloadPath,
      devTools: false,
    },
  })
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', event => {
    if (!event.url.startsWith('shaco-forge://client/')) event.preventDefault()
  })
  if (evidencePath !== undefined) mainWindow.once('ready-to-show', () => mainWindow?.showInactive())
  const loadingUrl = evidencePath === undefined ? 'shaco-forge://client/' : 'shaco-forge://client/?theme-smoke=1'
  await mainWindow.loadURL(loadingUrl)
}

ipcMain.handle('bootstrap:get-state', () => projection)
ipcMain.on('runtime:evidence', (_event, evidence: unknown) => {
  if (typeof evidence !== 'object' || evidence === null || Array.isArray(evidence)) return
  rendererEvidence = evidence as Record<string, unknown>
  void maybeFinalizeEvidence()
})

app.whenReady().then(async () => {
  try {
    await registerClientProtocol()
    supervisor = new WorkerSupervisor(readSupervisorConfig(process.env))
    supervisor.onEvent(updateProjection)
    await supervisor.start()
    await createMainWindow()
  } catch (error) {
    projection = { phase: 'worker-failed', message: error instanceof Error ? error.message : String(error), mainPid: process.pid }
    if (evidencePath === undefined) throw error
    rendererEvidence = { ok: false, startupFailure: projection.message }
    if (supervisor === undefined) {
      await mkdir(dirname(evidencePath), { recursive: true })
      await writeFile(evidencePath, `${JSON.stringify({ result: 'FAIL', desktop: { mainPid: process.pid, electronVersion: process.versions.electron }, startupFailure: projection.message }, null, 2)}\n`, 'utf8')
      app.quit()
    } else {
      void maybeFinalizeEvidence()
    }
  }
})

app.on('window-all-closed', () => {
  if (evidencePath === undefined) app.quit()
})

app.on('before-quit', () => {
  if (!finalizing) void supervisor?.stop()
})
