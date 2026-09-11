import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import electron from 'electron'
import { paths } from './runtime-paths.mjs'
import { evidence as writeStep1Evidence } from './smoke-slice2-step1.mjs'
import { inspectLocalPlatform } from '../apps/desktop/dist/main/lifecycle-client.js'

const workerNode = process.env.SHACO_FORGE_WORKER_NODE
if (!workerNode) throw new Error('SHACO_FORGE_WORKER_NODE is required')
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (!harnessRoot) throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const platform = await inspectLocalPlatform(paths.nativeHelper)
assert.equal(platform.mutexExists, false, 'ISOLATED_SMOKE_REQUIRES_NO_PREEXISTING_AUTHORITY')
assert.equal(platform.lifecycleBusy, false)
const dshHome = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-1b-electron-'))
const evidenceRoot = join(paths.root, 'node_modules/.step1-electron-regression')
await mkdir(evidenceRoot, { recursive: true })
const injectCarrierFailure = process.argv.includes('--inject-carrier-failure')
  || process.env.SHACO_FORGE_SMOKE_INJECT_CARRIER_FAILURE === '1'
const evidenceStem = injectCarrierFailure ? 'carrier-failure-runtime' : 'electron-runtime'
const evidencePath = join(evidenceRoot, `${evidenceStem}.json`)
const screenshotPath = join(evidenceRoot, `${evidenceStem}.png`)
const child = spawn(electron, [`--user-data-dir=${join(dshHome, 'electron-profile')}`, paths.desktopRoot], {
  env: {
    ...process.env,
    SHACO_FORGE_WORKER_NODE: workerNode,
    SHACO_FORGE_WORKER_ENTRY: paths.workerEntry,
    SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper,
    SHACO_FORGE_HARNESS_ROOT: harnessRoot,
    SHACO_FORGE_DSH_HOME: dshHome,
    SHACO_FORGE_HARNESS_PROFILE_NAME: 'shaco-forge-v1-slice-1b',
    SHACO_FORGE_EVIDENCE_PATH: evidencePath,
    SHACO_FORGE_SCREENSHOT_PATH: screenshotPath,
    SHACO_FORGE_EVIDENCE_INJECT_CARRIER_FAILURE: injectCarrierFailure ? '1' : '0',
    SHACO_FORGE_USER_LOOP: '0',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
})
let stdout = ''
let stderr = ''
child.stdout.setEncoding('utf8')
child.stderr.setEncoding('utf8')
child.stdout.on('data', chunk => { stdout += chunk })
child.stderr.on('data', chunk => { stderr += chunk })
const exitCode = await new Promise(resolve => child.once('exit', code => resolve(code)))
assert.equal(exitCode, 0, `Electron failed. stdout=${stdout} stderr=${stderr}`)
const evidence = JSON.parse(await readFile(evidencePath, 'utf8'))
await writeStep1Evidence('electron-regression.json', evidence)
assert.equal(evidence.result, 'PASS', JSON.stringify(evidence, null, 2))
assert.equal(evidence.desktop.electronVersion, '35.7.5')
assert.equal(evidence.renderer.harnessClient.package, '@deepseek-ai/dsh-client-web@0.1.2-alpha.1')
assert.equal(evidence.renderer.harnessClient.runResolved, true)
assert.equal(evidence.renderer.harnessClient.fixtureOrMockPresent, false)
assert.equal(evidence.carrier.security.aclProtected, true)
assert.equal(evidence.carrier.security.firstPipeInstance, true)
assert.equal(evidence.carrier.security.randomEntropyBits, 128)
assert.equal(evidence.carrier.hostPreflight.eventsRouteReady, true)
assert.deepEqual(evidence.carrier.hostPreflight.eventsRouteProbe, {
  endpoint: '$events', opened: true, readyObserved: true, readyShapeValid: true,
  cancelled: true, iteratorClosed: true, activeStreamsAfterCleanup: 0,
  eventSubscriptionRetained: false, clientRuntimeMetricCounted: false,
  businessOperationsPerformed: 0,
})
assert.equal(evidence.carrier.metrics.mainAuthenticatedCarrier, true)
assert.equal(evidence.carrier.metrics.serverAuthenticatedToMain, true)
assert.equal(evidence.renderer.transport.fetchUsed, true)
assert.equal(evidence.renderer.transport.realEventsStream, true)
assert.equal(evidence.renderer.transport.realEventsReady, true)
assert.equal(evidence.carrier.metrics.eventsReadyObserved, 1)
assert.equal(evidence.carrier.metrics.finalActiveStreams, 0)
assert.equal(evidence.carrier.metrics.finalPendingUnary, 0)
assert.equal(evidence.renderer.security.pipeAccess, false)
assert.equal(evidence.bootstrapSupervisorChannel.businessTraffic, 0)
assert.equal(evidence.renderer.theme.architecture, 'MODE_PLUS_TEMPLATE')
assert.equal(evidence.renderer.harnessClient.appWebEntryCount, 0)
assert.equal(evidence.renderer.harnessClient.optionB.rootOwner, 'SHACO')
assert.equal(evidence.renderer.harnessClient.optionB.harnessActive, 28)
assert.equal(evidence.renderer.harnessClient.optionB.reactRoots, 1)
assert.deepEqual(evidence.renderer.theme.supportedModes, ['light', 'dark', 'system'])
assert.equal(evidence.renderer.theme.initial.mode, 'light')
assert.equal(evidence.renderer.theme.initial.resolved, 'light')
assert.equal(evidence.renderer.theme.initial.rootTheme, 'light')
assert.equal(evidence.renderer.theme.rootSwitchSmoke.requested, true)
assert.equal(evidence.renderer.theme.rootSwitchSmoke.pass, true)
assert.deepEqual(evidence.renderer.theme.rootSwitchSmoke.changedSemanticTokens.sort(), [
  'appSurface',
  'border',
  'composerSurface',
  'primaryText',
  'selectedRow',
  'sidebarSurface',
])
assert.equal(evidence.renderer.theme.rootSwitchSmoke.finalMode, 'light')
assert.equal(evidence.renderer.theme.rootSwitchSmoke.finalRootTheme, 'light')
assert.equal(evidence.renderer.theme.visibleAppearanceSettings, false)
assert.equal(evidence.tcpListenersOwnedByObservedProductProcesses.length, 0)
assert.equal(evidence.cleanup.exited, true)
assert.equal(stderr.includes('Object has been destroyed'), false, stderr)
const hostReadyIndex = evidence.bootstrapSupervisorChannel.events.findIndex(event => event.phase === 'host-ready')
const carrierReadyIndex = evidence.bootstrapSupervisorChannel.events.findIndex(event => event.phase === 'carrier-ready')
assert.ok(hostReadyIndex >= 0 && carrierReadyIndex > hostReadyIndex, 'CARRIER_READY must follow Host readiness and events preflight')
if (injectCarrierFailure) {
  assert.equal(evidence.failureTruthfulness.injectedCarrierFailure, true)
  assert.equal(evidence.failureTruthfulness.carrierFailedObserved, true)
  assert.equal(evidence.failureTruthfulness.finalProjectionPhase, 'disconnected')
  assert.equal(evidence.failureTruthfulness.failurePhaseBeforeCleanup, 'failed')
  assert.equal(evidence.failureTruthfulness.method, 'EVIDENCE_ONLY_FENCE_THEN_PHYSICAL_HELPER_TERMINATION')
  assert.ok(Object.values(evidence.failureTruthfulness.failureUI).every(Boolean))
  assert.equal(evidence.failureTruthfulness.automaticWorkerRestart, false)
  assert.equal(evidence.failureTruthfulness.automaticCarrierRecreation, false)
  assert.equal(evidence.failureTruthfulness.implicitAgentCancel, false)
  assert.equal(evidence.failureTruthfulness.shacoRecovery, false)
}
await rm(dshHome, { recursive: true, force: true })
process.stdout.write(`${JSON.stringify({ result: 'PASS', evidencePath, screenshotPath, mainPid: evidence.desktop.mainPid, events: evidence.bootstrapSupervisorChannel.events, theme: evidence.renderer.theme, dshHomeRemoved: true, stderr }, null, 2)}\n`)
