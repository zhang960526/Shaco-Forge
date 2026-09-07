import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import electron from 'electron'
import { paths } from './runtime-paths.mjs'

const workerNode = process.env.SHACO_FORGE_WORKER_NODE
if (!workerNode) throw new Error('SHACO_FORGE_WORKER_NODE is required')
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (!harnessRoot) throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const dshHome = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-1a-electron-'))
const evidenceRoot = join(paths.root, 'docs/04-development-records/evidence/V1-SLICE-1A/runtime')
await mkdir(evidenceRoot, { recursive: true })
const evidencePath = join(evidenceRoot, 'electron-runtime.json')
const screenshotPath = join(evidenceRoot, 'electron-runtime.png')
const child = spawn(electron, [paths.desktopRoot], {
  env: {
    ...process.env,
    SHACO_FORGE_WORKER_NODE: workerNode,
    SHACO_FORGE_WORKER_ENTRY: paths.workerEntry,
    SHACO_FORGE_HARNESS_ROOT: harnessRoot,
    SHACO_FORGE_DSH_HOME: dshHome,
    SHACO_FORGE_HARNESS_PROFILE_NAME: 'shaco-forge-electron-smoke',
    SHACO_FORGE_EVIDENCE_PATH: evidencePath,
    SHACO_FORGE_SCREENSHOT_PATH: screenshotPath,
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
assert.equal(evidence.result, 'PASS', JSON.stringify(evidence, null, 2))
assert.equal(evidence.desktop.electronVersion, '35.7.5')
assert.equal(evidence.renderer.harnessClient.package, '@deepseek-ai/dsh-client-web@0.1.2-alpha.1')
assert.equal(evidence.renderer.harnessClient.runResolved, true)
assert.equal(evidence.renderer.harnessClient.fixtureOrMockPresent, false)
assert.equal(evidence.renderer.theme.architecture, 'SEMANTIC_DESIGN_TOKENS')
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
await rm(dshHome, { recursive: true, force: true })
process.stdout.write(`${JSON.stringify({ result: 'PASS', evidencePath, screenshotPath, mainPid: evidence.desktop.mainPid, events: evidence.bootstrapSupervisorChannel.events, theme: evidence.renderer.theme, dshHomeRemoved: true, stderr }, null, 2)}\n`)
