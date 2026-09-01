/**
 * NOT_PRODUCTION P0.S-5 Electron Main lifecycle executor.
 * Main owns discovery, credentials, authentication, generations, and the
 * Desktop-equivalent projection. Renderer owns only explicit UI actions.
 */
import { app, BrowserWindow, ipcMain } from 'electron'
import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DesktopLifecycleAdapter } from './lib/desktop-lifecycle-adapter.mjs'
import { SingleInstanceAdapter } from './lib/single-instance-adapter.mjs'
import { ReconnectProjectionAdapter } from './lib/reconnect-projection-adapter.mjs'
import {
  authenticateWorker,
  createRpc,
  openEventGeneration,
  resultEnvelope,
  waitForWaterfall,
} from './lib/framed-pipe-client.mjs'
import {
  readAndValidateDiscovery,
  readCredential,
  waitForReplacement,
} from './lib/worker-discovery-adapter.mjs'

const experimentRoot = dirname(fileURLToPath(import.meta.url))

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment value: ${name}`)
  return value
}

function optional(name) {
  return process.env[name] || null
}

function hashPrefix(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex').slice(0, 16)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((accept, fail) => {
    resolve = accept
    reject = fail
  })
  return { promise, resolve, reject }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

function ownStartTimeUtc(pwshPath) {
  const script = `$p=Get-Process -Id ${process.pid} -ErrorAction Stop; $p.StartTime.ToUniversalTime().ToString('o')`
  return execFileSync(pwshPath, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8',
    windowsHide: true,
  }).trim()
}

function publicWorkerIdentity(descriptor) {
  return {
    workerInstanceId: descriptor.workerInstanceId,
    carrierPid: descriptor.carrierPid,
    carrierStartTimeUtc: descriptor.carrierStartTimeUtc,
    dshPid: descriptor.dshPid,
    dshStartTimeUtc: descriptor.dshStartTimeUtc,
    endpointIdHashPrefix: hashPrefix(descriptor.endpointId),
    credentialEpochHashPrefix: hashPrefix(descriptor.credentialEpoch),
  }
}

function publicGeneration(desktopInstanceId, ordinal, workerInstanceId, clientId) {
  return {
    workerInstanceId,
    desktopInstanceId,
    localGeneration: ordinal,
    harnessClientId: clientId,
  }
}

const action = required('P0S5_ACTION')
const scenarioId = required('P0S5_SCENARIO_ID')
const resultFile = required('P0S5_DESKTOP_RESULT_FILE')
const eventFile = required('P0S5_DESKTOP_EVENTS_FILE')
const userDataPath = required('P0S5_ELECTRON_USER_DATA')
const discoveryRoot = required('P0S5_DISCOVERY_ROOT')
const pwshPath = required('P0S5_PWSH_PATH')
const desktopInstanceId = randomUUID()
const desktopIdentity = {
  desktopInstanceId,
  electronPid: process.pid,
  processStartTimeUtc: ownStartTimeUtc(pwshPath),
}
const lifecycle = new DesktopLifecycleAdapter({ eventFile, desktopIdentity, scenarioId })
const singleInstance = new SingleInstanceAdapter(lifecycle)
const projection = new ReconnectProjectionAdapter({ lifecycle, desktopIdentity })
let window = null
let currentConnection = null
let currentGeneration = null
let generationOrdinal = 0
let submissionContext = null
let failureWritten = false

await mkdir(userDataPath, { recursive: true })
app.setPath('userData', userDataPath)
app.commandLine.appendSwitch('disable-breakpad')
app.disableHardwareAcceleration()
lifecycle.transition('LOCKING')
const lockAcquired = app.requestSingleInstanceLock({ desktopInstanceId })
singleInstance.decide(lockAcquired)

if (!lockAcquired) {
  lifecycle.transition('SECONDARY_DENIED', 'single-instance-lock-denied')
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION',
    result: 'PASS',
    action,
    scenarioId,
    desktopIdentity,
    lockAcquired: false,
    lifecycle: lifecycle.snapshot(),
  })
  lifecycle.transition('EXITING')
  app.quit()
} else {
  void runPrimary().catch(fail)
}

async function createWindow() {
  window = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(experimentRoot, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: false,
    },
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  await window.loadFile(join(experimentRoot, 'renderer.html'))
}

function rendererSnapshot() {
  return window.webContents.executeJavaScript('globalThis.p0s5Automation.rendererSnapshot()')
}

function publishProjection(value) {
  window.webContents.send('p0s5:projection', value)
}

function createTrackedRpc(connection) {
  return createRpc(connection, endpoint => {
    lifecycle.increment('gatewayDispatchCount')
    lifecycle.record('gateway_dispatch_requested', { endpoint })
  })
}

async function connectAndProject() {
  lifecycle.transition('DISCOVERING_WORKER')
  singleInstance.count('Worker discovery', 'workerDiscoveryCount')
  const descriptor = await readAndValidateDiscovery({ discoveryRoot, pwshPath })
  const workerIdentity = publicWorkerIdentity(descriptor)
  const discovered = lifecycle.record('worker_identity_discovered', { workerIdentity })
  lifecycle.transition('CONNECTING', discovered.recordId)
  singleInstance.count('Credential access', 'credentialAccessCount')
  const credential = await readCredential(descriptor)
  lifecycle.transition('AUTHENTICATING')
  singleInstance.count('Pipe attach', 'pipeAttachCount')
  const authenticated = await authenticateWorker(descriptor, credential)
  if (authenticated.outcome.type !== 'authentication-complete') {
    await authenticated.connection.close()
    throw new Error(`Worker authentication rejected: ${authenticated.outcome.reason}`)
  }
  lifecycle.record('worker_authenticated', {
    workerIdentity,
    credentialEpochHashPrefix: hashPrefix(descriptor.credentialEpoch),
  })
  lifecycle.transition('WAITING_READY')
  const generation = await openEventGeneration(authenticated.connection)
  generationOrdinal += 1
  const generationIdentity = publicGeneration(
    desktopInstanceId,
    generationOrdinal,
    descriptor.workerInstanceId,
    generation.clientId,
  )
  const readySource = lifecycle.record('harness_events_ready', {
    workerIdentity,
    oldGeneration: projection.generation,
    newGeneration: generationIdentity,
    oldHarnessClientId: projection.harnessClientId,
    newHarnessClientId: generation.clientId,
  })
  projection.replaceGeneration(readySource, {
    generation: generationIdentity,
    harnessClientId: generation.clientId,
    workerIdentity,
  })
  lifecycle.transition('REPULLING', readySource.recordId)
  projection.requestRepull(readySource)
  const rpc = createTrackedRpc(authenticated.connection)
  const status = await rpc.call('p0s5Fixture/status', { args: {} })
  if (status.result?.ok !== true) throw new Error('Host truth repull failed')
  const truthSource = lifecycle.record('host_truth_received', {
    workerIdentity,
    generation: generationIdentity,
    harnessClientId: generation.clientId,
    hostTruth: status.result.value,
  })
  projection.rebuild(truthSource, status.result.value)
  lifecycle.transition('READY', truthSource.recordId)
  currentConnection = authenticated.connection
  currentGeneration = { ...generation, identity: generationIdentity, workerIdentity, descriptor, credential, rpc }
  publishProjection({ state: 'CURRENT', hostTruth: status.result.value })
  return currentGeneration
}

async function refreshHostTruth() {
  const status = await currentGeneration.rpc.call('p0s5Fixture/status', { args: {} })
  if (status.result?.ok !== true) throw new Error('Host truth refresh failed')
  const source = lifecycle.record('host_truth_received', {
    workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity,
    harnessClientId: currentGeneration.clientId,
    hostTruth: status.result.value,
  })
  projection.rebuild(source, status.result.value)
  publishProjection({ state: 'CURRENT', hostTruth: status.result.value })
  return status.result.value
}

async function closeDesktop(exitCode = 0) {
  lifecycle.transition('EXITING')
  try {
    await currentGeneration?.stream?.cancel('desktop-exit')
  } catch {
    // A crash/loss path may already have closed the transport.
  }
  try {
    await currentConnection?.close()
  } catch {
    // Exit remains process-scoped even after transport loss.
  }
  window?.destroy()
  app.exit(exitCode)
}

async function waitForControlFile(path) {
  while (!existsSync(path)) await sleep(50)
}

async function runPrimary() {
  lifecycle.transition('STARTING', 'single-instance-lock-acquired')
  app.on('second-instance', () => {
    lifecycle.record('second_instance_focus_existing')
    if (window) {
      if (window.isMinimized()) window.restore()
      window.show()
      window.focus()
    }
  })
  await app.whenReady()
  await createWindow()
  ipcMain.handle('p0s5:submit', handleRendererSubmit)

  if (action === 'hold') await runHold()
  else if (action === 'start-running-close') await runStartRunning(false)
  else if (action === 'start-running-hold') await runStartRunning(true)
  else if (action === 'verify-running') await runVerifyRunning()
  else if (action === 'cancel-running') await runCancelRunning()
  else if (action === 'pending-capture') await runPendingCapture()
  else if (action === 'pending-settle') await runPendingSettle()
  else if (action === 'worker-crash-monitor') await runWorkerCrashMonitor()
  else if (action === 'stale-worker-probes') await runStaleWorkerProbes()
  else if (action === 'graceful-worker-stop') await runGracefulWorkerStop()
  else throw new Error(`Unsupported P0.S-5 Desktop action: ${action}`)
}

async function runHold() {
  await connectAndProject()
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, lockAcquired: true, workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity, renderer: await rendererSnapshot(), lifecycle: lifecycle.snapshot(),
  })
  await waitForControlFile(required('P0S5_CONTROL_FILE'))
  await closeDesktop()
}

async function runStartRunning(hold) {
  await connectAndProject()
  const label = required('P0S5_LABEL')
  const before = await refreshHostTruth()
  const started = await currentGeneration.rpc.call('p0s5Fixture/startRunningTurn', { args: { request: { label } } })
  if (started.result?.ok !== true || started.result.value?.status !== 'running') {
    throw new Error(`Host did not establish a real running turn for ${label}`)
  }
  const after = await refreshHostTruth()
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity, label, runningTurn: started.result.value,
    hostBefore: before, hostAfter: after, projection: projection.snapshot(),
    renderer: await rendererSnapshot(), lifecycle: lifecycle.snapshot(),
  })
  if (hold) {
    const control = optional('P0S5_CONTROL_FILE')
    if (control) {
      await waitForControlFile(control)
      await closeDesktop()
    } else {
      await new Promise(() => {})
    }
  } else {
    await closeDesktop()
  }
}

async function runVerifyRunning() {
  await connectAndProject()
  const label = required('P0S5_LABEL')
  const hostTruth = await refreshHostTruth()
  const running = hostTruth.agents.find(agent => agent.label === label)
  if (!running || running.status !== 'running' || !running.turnId) {
    throw new Error(`Expected running Host turn was not preserved for ${label}`)
  }
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity, runningTurn: running,
    hostTruth, projection: projection.snapshot(), renderer: await rendererSnapshot(),
    lifecycle: lifecycle.snapshot(),
  })
  await closeDesktop()
}

async function runCancelRunning() {
  await connectAndProject()
  const label = required('P0S5_LABEL')
  const before = await refreshHostTruth()
  const target = before.agents.find(agent => agent.label === label)
  if (!target) throw new Error(`Cancelable Host agent not found: ${label}`)
  const result = await currentGeneration.rpc.call('session/cancel', { args: { request: { sessionId: target.sessionId } } })
  if (result.result?.ok !== true) throw new Error('Explicit session/cancel failed')
  await sleep(250)
  const after = await refreshHostTruth()
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity, explicitCancel: result.result.value,
    hostBefore: before, hostAfter: after, lifecycle: lifecycle.snapshot(),
  })
  await closeDesktop()
}

async function handleRendererSubmit(_event, value) {
  if (!submissionContext) throw new Error('Renderer submit has no active pending Host event')
  const expectedAction = submissionContext.kind === 'approval' ? 'approval-result' : 'question-answer'
  if (value?.action !== expectedAction || value.eventId !== submissionContext.eventId) {
    throw new Error('Renderer submission did not match the projected Host event')
  }
  lifecycle.increment('explicitRendererActionCount')
  const envelope = resultEnvelope(currentGeneration.clientId, submissionContext.eventId, value.value)
  lifecycle.record('renderer_result_envelope_created', {
    pendingKind: submissionContext.kind,
    eventId: submissionContext.eventId,
    generation: currentGeneration.identity,
    harnessClientId: currentGeneration.clientId,
    captureOnly: submissionContext.captureOnly,
  })
  if (submissionContext.captureOnly) {
    await writeJson(submissionContext.captureFile, {
      classification: 'NOT_PRODUCTION',
      pendingKind: submissionContext.kind,
      eventId: submissionContext.eventId,
      generation: currentGeneration.identity,
      harnessClientId: currentGeneration.clientId,
      envelope,
    })
    submissionContext.submitted.resolve({ envelope, response: null })
    return { captured: true }
  }
  const response = await currentGeneration.rpc.call(envelope.endpoint, envelope.payload, { probeSource: 'explicit-renderer-action' })
  submissionContext.submitted.resolve({ envelope, response })
  return { captured: false, accepted: response.result?.ok === true }
}

async function projectPending(kind, waterfall) {
  submissionContext = {
    kind,
    eventId: waterfall.eventId,
    captureOnly: false,
    captureFile: null,
    submitted: deferred(),
  }
  publishProjection({ state: 'CURRENT', pendingKind: kind, eventId: waterfall.eventId })
  await sleep(50)
}

async function automateCurrentAction(kind) {
  if (kind === 'approval') {
    await window.webContents.executeJavaScript('globalThis.p0s5Automation.clickApproval()')
  } else {
    await window.webContents.executeJavaScript("globalThis.p0s5Automation.submitQuestion('Beta')")
  }
  return submissionContext.submitted.promise
}

async function runPendingCapture() {
  await connectAndProject()
  const kind = required('P0S5_PENDING_KIND')
  const label = required('P0S5_LABEL')
  const endpoint = kind === 'approval' ? 'p0s5Fixture/approvalRoundTrip' : 'p0s5Fixture/questionRoundTrip'
  const eventName = kind === 'approval' ? 'approval/request' : 'user-questions/request'
  void currentGeneration.rpc.call(endpoint, { args: { request: { label } } }, { timeoutMs: 120000 }).catch(() => null)
  const waterfall = await waitForWaterfall(currentGeneration, eventName, 30000)
  await projectPending(kind, waterfall)
  submissionContext.captureOnly = true
  submissionContext.captureFile = required('P0S5_CAPTURE_FILE')
  const captured = await automateCurrentAction(kind)
  const hostTruth = await refreshHostTruth()
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity, kind, label,
    eventId: waterfall.eventId, capturedEnvelope: captured.envelope,
    hostTruth, renderer: await rendererSnapshot(), lifecycle: lifecycle.snapshot(),
  })
  if (required('P0S5_TERMINATION') === 'close') await closeDesktop()
  else await new Promise(() => {})
}

async function runPendingSettle() {
  await connectAndProject()
  const kind = required('P0S5_PENDING_KIND')
  const eventName = kind === 'approval' ? 'approval/request' : 'user-questions/request'
  const waterfall = await waitForWaterfall(currentGeneration, eventName, 30000)
  const rendererBefore = await rendererSnapshot()
  if (rendererBefore.draftStorageKeys.length !== 0) throw new Error('New Desktop imported a persisted draft')
  const oldCapture = JSON.parse(await readFile(required('P0S5_OLD_ENVELOPE_FILE'), 'utf8'))
  const stale = await currentGeneration.rpc.call(
    oldCapture.envelope.endpoint,
    oldCapture.envelope.payload,
    { probeSource: 'isolated-old-generation-envelope' },
  )
  lifecycle.record('old_generation_envelope_probe', {
    pendingKind: kind,
    oldGeneration: oldCapture.generation,
    oldHarnessClientId: oldCapture.harnessClientId,
    currentGeneration: currentGeneration.identity,
    currentHarnessClientId: currentGeneration.clientId,
    hostAccepted: stale.result?.ok === true,
  })
  await projectPending(kind, waterfall)
  const accepted = await automateCurrentAction(kind)
  const duplicate = await currentGeneration.rpc.call(
    accepted.envelope.endpoint,
    accepted.envelope.payload,
    { probeSource: 'isolated-current-envelope-duplicate' },
  )
  await sleep(100)
  const hostTruth = await refreshHostTruth()
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity, kind,
    eventId: waterfall.eventId, sameEventIdAfterReconnect: waterfall.eventId === oldCapture.eventId,
    oldEnvelopeProbe: { accepted: stale.result?.ok === true, response: stale.result },
    currentEnvelope: { accepted: accepted.response?.result?.ok === true, envelope: accepted.envelope },
    duplicateProbe: { response: duplicate.result },
    hostTruth, rendererBefore, lifecycle: lifecycle.snapshot(),
  })
  await closeDesktop()
}

async function runWorkerCrashMonitor() {
  await connectAndProject()
  const label = required('P0S5_LABEL')
  const worker1 = currentGeneration.workerIdentity
  const descriptor1 = currentGeneration.descriptor
  const started = await currentGeneration.rpc.call('p0s5Fixture/startRunningTurn', { args: { request: { label } } })
  if (started.result?.ok !== true || started.result.value?.status !== 'running') {
    throw new Error('Worker crash precondition did not establish a real running turn')
  }
  const before = await refreshHostTruth()
  await writeJson(required('P0S5_PRECRASH_FILE'), {
    classification: 'NOT_PRODUCTION', result: 'READY', action, scenarioId,
    desktopIdentity, workerIdentity: worker1, generation: currentGeneration.identity,
    runningTurn: started.result.value, hostTruth: before, projection: projection.snapshot(),
    lifecycle: lifecycle.snapshot(),
  })

  await currentConnection.closed
  const transportLoss = lifecycle.record('transport_loss', {
    workerIdentity: worker1,
    generation: currentGeneration.identity,
    harnessClientId: currentGeneration.clientId,
    observation: 'Named Pipe close/error',
  })
  lifecycle.transition('DISCONNECTED', transportLoss.recordId)
  projection.invalidate(transportLoss, {
    workerIdentity: worker1,
    oldGeneration: currentGeneration.identity,
    newGeneration: null,
    oldHarnessClientId: currentGeneration.clientId,
    newHarnessClientId: null,
  })
  const lost = lifecycle.record('worker_identity_lost', {
    workerIdentity: worker1,
    oldGeneration: currentGeneration.identity,
    oldHarnessClientId: currentGeneration.clientId,
    reason: 'transport-and-OS-identity-loss',
  })
  lifecycle.transition('RECONNECTING', lost.recordId)
  publishProjection({ state: 'INVALIDATED', hostTruth: null, running: false })
  await writeJson(required('P0S5_LOST_FILE'), {
    classification: 'NOT_PRODUCTION', result: 'LOST', action, scenarioId,
    desktopIdentity, workerIdentity: worker1, projection: projection.snapshot(),
    connectionLost: true, cancelDelta: 0, completionDelta: 0,
    promptStartResumeResultAnswerDelta: 0, lifecycle: lifecycle.snapshot(),
  })

  const descriptor2 = await waitForReplacement({
    discoveryRoot,
    pwshPath,
    previousWorkerInstanceId: descriptor1.workerInstanceId,
    timeoutMs: 30000,
  })
  const worker2 = publicWorkerIdentity(descriptor2)
  const replaced = lifecycle.record('worker_identity_replaced', {
    oldWorkerIdentity: worker1,
    newWorkerIdentity: worker2,
    oldGeneration: currentGeneration.identity,
    newGeneration: null,
    oldHarnessClientId: currentGeneration.clientId,
    newHarnessClientId: null,
  })
  projection.replaceWorker(replaced, worker2)
  projection.invalidate(replaced, {
    workerIdentity: worker2,
    oldGeneration: currentGeneration.identity,
    newGeneration: null,
    oldHarnessClientId: currentGeneration.clientId,
    newHarnessClientId: null,
  })
  currentConnection = null
  currentGeneration = null
  const reconnected = await connectAndProject()
  const after = await refreshHostTruth()
  const oldProjectionVisible = after.agents.some(agent => agent.sessionId === started.result.value.sessionId && agent.status === 'running')
  if (oldProjectionVisible) throw new Error('Worker 2 Host truth retained the dead Worker 1 running projection')
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, sameElectronProcess: true,
    worker1, worker2: reconnected.workerIdentity,
    oldGeneration: descriptor1.workerInstanceId,
    newGeneration: reconnected.identity,
    oldRunningTurn: started.result.value,
    worker2HostTruth: after,
    oldProjectionVisible,
    automaticStartResumeCount: after.agentStartAuthorityCount + after.agentResumeAuthorityCount,
    projection: projection.snapshot(), lifecycle: lifecycle.snapshot(),
  })
  await closeDesktop()
}

async function runStaleWorkerProbes() {
  await connectAndProject()
  const currentDescriptor = currentGeneration.descriptor
  const currentCredential = currentGeneration.credential
  const oldDescriptor = JSON.parse(await readFile(required('P0S5_OLD_DISCOVERY_FILE'), 'utf8'))
  const oldCredential = JSON.parse(await readFile(required('P0S5_OLD_CREDENTIAL_FILE'), 'utf8'))
  let oldPipeFailed = false
  try {
    const attempt = await authenticateWorker(oldDescriptor, oldCredential, { timeoutMs: 1000 })
    await attempt.connection.close()
  } catch {
    oldPipeFailed = true
  }
  await currentGeneration.stream.cancel('isolated-security-probe')
  await currentConnection.close()
  currentGeneration = null
  currentConnection = null
  const staleCredential = await authenticateWorker(currentDescriptor, oldCredential, {
    secret: oldCredential.secret,
    credentialEpoch: oldCredential.credentialEpoch,
  })
  const staleCredentialRejected = staleCredential.outcome.type === 'authentication-rejected'
  await staleCredential.connection.close()
  const staleIdentity = await authenticateWorker(currentDescriptor, currentCredential, {
    workerInstanceId: oldDescriptor.workerInstanceId,
  })
  const staleIdentityRejected = staleIdentity.outcome.type === 'authentication-rejected'
  await staleIdentity.connection.close()
  await connectAndProject()
  const oldEnvelope = JSON.parse(await readFile(required('P0S5_OLD_ENVELOPE_FILE'), 'utf8'))
  const staleResult = await currentGeneration.rpc.call(
    oldEnvelope.envelope.endpoint,
    oldEnvelope.envelope.payload,
    { probeSource: 'stale-worker-one-result' },
  )
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    oldPipeFailed, staleCredentialRejected, staleIdentityRejected,
    staleResultSafe: staleResult.result?.ok === false,
    lifecycle: lifecycle.snapshot(),
  })
  await closeDesktop()
}

async function runGracefulWorkerStop() {
  await connectAndProject()
  const before = projection.snapshot()
  const requestId = randomUUID()
  const acknowledged = currentConnection.waitFor(message => message.type === 'carrier-finished' && message.requestId === requestId, 5000)
  await currentConnection.sendObject({ type: 'carrier-finish', requestId })
  await acknowledged
  await currentConnection.closed
  const loss = lifecycle.record('transport_loss', {
    workerIdentity: currentGeneration.workerIdentity,
    generation: currentGeneration.identity,
    harnessClientId: currentGeneration.clientId,
    observation: 'graceful Worker Carrier transport close',
    supportingScenarioOnly: true,
  })
  projection.invalidate(loss, {
    workerIdentity: currentGeneration.workerIdentity,
    oldGeneration: currentGeneration.identity,
    newGeneration: null,
    oldHarnessClientId: currentGeneration.clientId,
    newHarnessClientId: null,
  })
  publishProjection({ state: 'INVALIDATED', hostTruth: null, running: false })
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'PASS', action, scenarioId,
    desktopIdentity, workerIdentity: currentGeneration.workerIdentity,
    before, after: projection.snapshot(), supportingScenarioOnly: true,
    usedForWorkerCrashRestartGate: false, lifecycle: lifecycle.snapshot(),
  })
  await closeDesktop()
}

async function fail(error) {
  if (failureWritten) return
  failureWritten = true
  const message = String(error?.stack ?? error?.message ?? error)
  lifecycle.record('desktop_failure', { message })
  await writeJson(resultFile, {
    classification: 'NOT_PRODUCTION', result: 'FAIL', action, scenarioId,
    desktopIdentity, error: message, lifecycle: lifecycle.snapshot(),
  })
  app.exit(1)
}

process.on('uncaughtException', fail)
process.on('unhandledRejection', fail)
app.on('window-all-closed', event => {
  if (lockAcquired && ['hold', 'start-running-hold', 'pending-capture', 'worker-crash-monitor'].includes(action)) {
    event?.preventDefault?.()
    return
  }
  app.quit()
})
