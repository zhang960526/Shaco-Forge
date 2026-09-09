import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, protocol, type IpcMainInvokeEvent } from 'electron'
import {
  isRecord,
  normalizeRendererRequest,
  validateStreamOpen,
  type BootstrapEvent,
} from '@shaco-forge/contracts'
import { CarrierClient } from './carrier-client.js'
import { isSecureRendererConfiguration, rendererSecurityPreferences } from './security.js'
import { sendProjectionIfAlive, snapshotLoadingUrl } from './window-lifecycle.js'
import { readSupervisorConfig, WorkerSupervisor, type CarrierBootstrap } from './worker-supervisor.js'

protocol.registerSchemesAsPrivileged([{ scheme: 'shaco-forge', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }])

const currentDir = dirname(fileURLToPath(import.meta.url))
const rendererRoot = resolve(currentDir, '..', 'renderer')
const preloadPath = resolve(currentDir, '..', 'preload', 'preload.cjs')
const evidencePath = process.env.SHACO_FORGE_EVIDENCE_PATH
const screenshotPath = process.env.SHACO_FORGE_SCREENSHOT_PATH || undefined
const injectCarrierFailure = process.env.SHACO_FORGE_EVIDENCE_INJECT_CARRIER_FAILURE === '1'
const userLoopRequested = process.env.SHACO_FORGE_USER_LOOP === '1'
const execFileAsync = promisify(execFile)

interface Projection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
  helperPid?: number
}

let projection: Projection = { phase: 'worker-starting', message: 'Worker Starting', mainPid: process.pid }
let rendererEvidence: Record<string, unknown> | undefined
let supervisor: WorkerSupervisor | undefined
let carrier: CarrierClient | undefined
let carrierBootstrap: CarrierBootstrap | undefined
let mainWindow: BrowserWindow | undefined
let finalizing = false
let userLoopEvidence: Record<string, unknown> | undefined

// Main-only observation for the bounded non-Provider lifecycle runtime driver.
// This export is never imported by preload or published to Renderer.
export function observeStep1Lifecycle(): Record<string, unknown> {
  return {
    mainPid: process.pid, phase: projection.phase, authority: carrierBootstrap?.authority,
    credentialEpoch: carrierBootstrap?.credentialEpoch, clientInstanceId: carrier?.clientInstanceId,
    metrics: carrier?.metrics, rendererSecurity: rendererSecurityPreferences,
  }
}

function mime(path: string): string {
  return ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' } as Record<string, string>)[extname(path)] ?? 'application/octet-stream'
}

function publishProjection(next: Projection): void {
  projection = next
  const window = mainWindow
  sendProjectionIfAlive(window, projection)
  void maybeFinalizeEvidence()
}

function updateProjection(event: BootstrapEvent): void {
  const messages: Record<string, string> = {
    'worker-starting': 'Worker Starting',
    'host-starting': 'Harness Host Starting',
    'host-ready': 'Harness Host Ready · Carrier Authenticating',
    'carrier-ready': 'Authenticated Physical Carrier Ready',
    'carrier-failed': 'Carrier Failed',
    'host-exited': 'Harness Host Disconnected',
    'worker-failed': 'Worker Failed',
    'worker-stopped': 'Worker Stopped',
  }
  publishProjection({
    phase: event.phase,
    message: event.error === undefined ? messages[event.phase] ?? event.phase : `${messages[event.phase] ?? event.phase}: ${event.error.split('\n')[0]}`,
    mainPid: process.pid,
    workerPid: event.workerPid,
    hostPid: event.hostPid,
    helperPid: carrierBootstrap?.helperPid,
  })
}

function assertTrustedRenderer(event: IpcMainInvokeEvent): void {
  const url = event.senderFrame?.url
  if (url === undefined) throw new Error('Renderer frame is unavailable')
  if (!url.startsWith('shaco-forge://client/')) throw new Error('Renderer origin is not trusted for transport capability')
}

function requireCarrier(): CarrierClient {
  if (carrier === undefined) throw new Error('CARRIER_FAILED: Carrier is unavailable')
  return carrier
}

function registerTransportIpc(): void {
  ipcMain.handle('transport:fetch', async (event, input: unknown) => {
    assertTrustedRenderer(event)
    if (!isRecord(input)
      || typeof input.url !== 'string'
      || typeof input.method !== 'string'
      || typeof input.contentType !== 'string'
      || typeof input.body !== 'string') throw new TypeError('Invalid Renderer fetch capability input')
    const normalized = normalizeRendererRequest({
      url: input.url, method: input.method, contentType: input.contentType, body: input.body,
    })
    const envelope = await requireCarrier().request(normalized.endpoint, normalized.envelope)
    return { status: 200, contentType: 'application/json', body: JSON.stringify(envelope) }
  })
  ipcMain.handle('transport:open-stream', async (event, input: unknown) => {
    assertTrustedRenderer(event)
    if (!isRecord(input)) throw new TypeError('Invalid Renderer stream capability input')
    const validated = validateStreamOpen(input.endpoint, input.payload)
    return await requireCarrier().openStream(validated.endpoint, validated.payload)
  })
  ipcMain.handle('transport:pull-stream', async (event, streamId: unknown) => {
    assertTrustedRenderer(event)
    if (typeof streamId !== 'string') throw new TypeError('Invalid Renderer stream id')
    return await requireCarrier().pullStream(streamId)
  })
  ipcMain.handle('transport:cancel-stream', async (event, streamId: unknown, reason: unknown) => {
    assertTrustedRenderer(event)
    if (typeof streamId !== 'string' || typeof reason !== 'string' || reason.length > 80) throw new TypeError('Invalid Renderer stream cancellation')
    await requireCarrier().cancelStream(streamId, reason)
  })
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
  if (userLoopRequested && userLoopEvidence === undefined) return
  const carrierFailureObserved = supervisor.events.some(event => event.phase === 'carrier-failed')
  const terminal = injectCarrierFailure
    ? carrierFailureObserved
    : supervisor.events.some(event => event.phase === 'carrier-ready' || event.phase === 'carrier-failed' || event.phase === 'worker-failed' || event.phase === 'host-exited')
  if (!terminal) return
  finalizing = true
  await new Promise(resolveDelay => setTimeout(resolveDelay, 700))
  const evidenceWindow = mainWindow
  const loadingUrl = snapshotLoadingUrl(evidenceWindow)
  if (screenshotPath !== undefined
    && evidenceWindow !== undefined
    && !evidenceWindow.isDestroyed()
    && !evidenceWindow.webContents.isDestroyed()) {
    await mkdir(dirname(screenshotPath), { recursive: true })
    const image = await evidenceWindow.webContents.capturePage()
    await writeFile(screenshotPath, image.toPNG())
  }
  const processIds = [
    process.pid,
    carrierBootstrap?.helperPid,
    ...supervisor.events.flatMap(event => [event.workerPid, event.hostPid]),
  ].filter((pid): pid is number => pid !== undefined)
  const listeners = await productListeners([...new Set(processIds)])
  const carrierEvidence = carrier === undefined || carrierBootstrap === undefined ? undefined : {
    helperPid: carrierBootstrap.helperPid,
    pipeEndpointRedacted: true,
    pipeEndpointHashPrefix: carrierBootstrap.pipeEndpointHashPrefix,
    security: {
      aclProtected: carrierBootstrap.security.aclProtected,
      inheritanceDisabled: carrierBootstrap.security.inheritanceDisabled,
      currentUserAllowRule: carrierBootstrap.security.currentUserAllowRule,
      unintendedBroadAllowRule: carrierBootstrap.security.unintendedBroadAllowRule,
      firstPipeInstance: carrierBootstrap.security.firstPipeInstance,
      randomEntropyBits: carrierBootstrap.security.randomEntropyBits,
      postCreateInspection: carrierBootstrap.security.postCreateInspection,
    },
    hostPreflight: carrierBootstrap.hostPreflight,
    metrics: carrier.metrics,
    secretRedacted: true,
  }
  if (evidenceWindow !== undefined && !evidenceWindow.isDestroyed()) {
    evidenceWindow.destroy()
    mainWindow = undefined
    await new Promise(resolveDelay => setTimeout(resolveDelay, 200))
  }
  carrier?.close()
  const cleanup = await supervisor.stop()
  const clientManifestPath = resolve(rendererRoot, 'harness-client-manifest.json')
  const clientManifest = JSON.parse(await readFile(clientManifestPath, 'utf8')) as Record<string, unknown>
  const result = rendererEvidence.ok === true
    && supervisor.events.some(event => event.phase === 'carrier-ready')
    && carrierEvidence?.metrics.mainAuthenticatedCarrier === true
    && carrierEvidence.metrics.serverAuthenticatedToMain === true
    && carrierEvidence.metrics.unaryRequests > 0
    && carrierEvidence.metrics.streamOpens > 0
    && carrierEvidence.metrics.eventsReadyObserved > 0
    && listeners.length === 0
    && cleanup.exited
    && (!injectCarrierFailure || carrierFailureObserved)
  const evidence = {
    result: userLoopRequested ? (result && userLoopEvidence?.result === 'PASS' ? 'PASS' : 'NOT_PROVEN') : (result ? 'PASS' : 'FAIL'),
    nonProviderResult: result ? 'PASS' : 'FAIL',
    capturedAt: new Date().toISOString(),
    desktop: {
      electronVersion: process.versions.electron,
      mainPid: process.pid,
      loadingUrl,
      buildArtifactPath: rendererRoot,
      security: rendererSecurityPreferences,
      secureConfiguration: isSecureRendererConfiguration(),
    },
    topology: {
      mainPid: process.pid,
      workerPid: supervisor.events.at(-1)?.workerPid,
      hostPid: [...supervisor.events].reverse().find((event: BootstrapEvent) => event.hostPid !== undefined)?.hostPid,
      nativeHelperPid: carrierBootstrap?.helperPid,
      independentProcesses: true,
    },
    bootstrapSupervisorChannel: { finalProductCarrier: false, businessTraffic: 0, events: supervisor.events },
    carrier: carrierEvidence,
    failureTruthfulness: {
      injectedCarrierFailure: injectCarrierFailure,
      carrierFailedObserved: carrierFailureObserved,
      finalProjectionPhase: projection.phase,
      automaticWorkerRestart: false,
      automaticCarrierRecreation: false,
      implicitAgentCancel: false,
      shacoRecovery: false,
    },
    renderer: rendererEvidence,
    userLoop: userLoopEvidence,
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
      return Response.json({ error: 'CUSTOM_TRANSPORT_REQUIRED', slice: 'V1-SLICE-1B' }, { status: 503 })
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
    webPreferences: { ...rendererSecurityPreferences, preload: preloadPath, devTools: false },
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
// Main-process smoke driver completion; never exposed as a Renderer capability.
ipcMain.once('user-loop:complete', (_event, evidence: unknown) => {
  if (!userLoopRequested || !isRecord(evidence)) return
  userLoopEvidence = evidence
  void maybeFinalizeEvidence()
})
ipcMain.on('runtime:evidence', (_event, evidence: unknown) => {
  if (!isRecord(evidence)) return
  rendererEvidence = evidence
  if (injectCarrierFailure && carrierBootstrap !== undefined) {
    process.kill(carrierBootstrap.helperPid, 'SIGTERM')
  }
  void maybeFinalizeEvidence()
})
registerTransportIpc()

app.whenReady().then(async () => {
  try {
    await registerClientProtocol()
    supervisor = new WorkerSupervisor(readSupervisorConfig(process.env))
    supervisor.onEvent(updateProjection)
    supervisor.onCarrierFailure(reason => {
      carrier?.fail(reason)
      publishProjection({ ...projection, phase: 'carrier-failed', message: `Carrier Failed: ${reason}` })
    })
    carrierBootstrap = await supervisor.start()
    carrier = new CarrierClient(carrierBootstrap)
    await carrier.connect()
    supervisor.carrierReady()
    publishProjection({ ...projection, phase: 'carrier-ready', message: 'Authenticated Physical Carrier Ready', helperPid: carrierBootstrap.helperPid })
    await createMainWindow()
    if (evidencePath !== undefined) {
      setTimeout(() => {
        if (rendererEvidence !== undefined || finalizing) return
        rendererEvidence = { ok: false, rendererEvidenceTimeout: true }
        void maybeFinalizeEvidence()
      }, 20_000)
    }
  } catch (error) {
    projection = { phase: 'worker-failed', message: error instanceof Error ? error.message : String(error), mainPid: process.pid }
    if (evidencePath === undefined) throw error
    rendererEvidence = { ok: false, startupFailure: projection.message }
    const cleanup = supervisor === undefined ? undefined : await supervisor.stop()
    await mkdir(dirname(evidencePath), { recursive: true })
    await writeFile(evidencePath, `${JSON.stringify({
      result: 'FAIL',
      capturedAt: new Date().toISOString(),
      desktop: { mainPid: process.pid, electronVersion: process.versions.electron },
      startupFailure: projection.message,
      bootstrapSupervisorChannel: {
        finalProductCarrier: false,
        businessTraffic: 0,
        events: supervisor?.events ?? [],
      },
      cleanup,
      secretRedacted: true,
      pipeEndpointRedacted: true,
    }, null, 2)}\n`, 'utf8')
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (evidencePath === undefined) app.quit()
})

app.on('before-quit', () => {
  carrier?.close()
  supervisor?.detach()
})
