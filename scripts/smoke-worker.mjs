import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { paths } from './runtime-paths.mjs'

const workerNode = process.env.SHACO_FORGE_WORKER_NODE
if (!workerNode) throw new Error('SHACO_FORGE_WORKER_NODE is required')
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (!harnessRoot) throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const dshHome = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-1b-worker-'))
const child = spawn(workerNode, [paths.workerEntry], {
  env: { ...process.env, SHACO_FORGE_DSH_HOME: dshHome, SHACO_FORGE_HARNESS_ROOT: harnessRoot, SHACO_FORGE_HARNESS_PROFILE_NAME: 'shaco-forge-v1-slice-1b', SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper },
  stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
  windowsHide: true,
})
const bootstrap = Buffer.from(JSON.stringify({ type: 'helper-bootstrap', secret: randomBytes(32).toString('hex'), workerInstanceId: randomUUID(), credentialEpoch: randomUUID() }))
const bootstrapFrame = Buffer.alloc(4 + bootstrap.length)
bootstrapFrame.writeUInt32LE(bootstrap.length)
bootstrap.copy(bootstrapFrame, 4)
child.stdio[3].end(bootstrapFrame)
let privateBytes = Buffer.alloc(0)
child.stdio[4].on('data', chunk => { privateBytes = Buffer.concat([privateBytes, chunk]) })
let stdout = ''
let stderr = ''
child.stdout.setEncoding('utf8')
child.stderr.setEncoding('utf8')
child.stdout.on('data', chunk => { stdout += chunk })
child.stderr.on('data', chunk => { stderr += chunk })
const deadline = Date.now() + 25_000
let ready
let carrierReady
while (Date.now() < deadline) {
  ready = stdout.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line) } catch { return undefined } }).find(event => event?.phase === 'host-ready')
  if (privateBytes.length >= 4 && privateBytes.length >= 4 + privateBytes.readUInt32LE(0)) {
    const value = JSON.parse(privateBytes.subarray(4, 4 + privateBytes.readUInt32LE(0)).toString('utf8'))
    carrierReady = { type: value.type, helperPid: value.helper?.helperPid, pipeEndpointRedacted: true, security: {
      aclProtected: value.helper?.aclProtected, firstPipeInstance: value.helper?.firstPipeInstance,
      randomEntropyBits: value.helper?.randomEntropyBits, postCreateInspection: value.helper?.postCreateInspection,
    }, host: value.host }
  }
  if (ready && carrierReady) break
  if (child.exitCode !== null) break
  await new Promise(resolve => setTimeout(resolve, 100))
}
assert.ok(ready, `Host did not become ready. stdout=${stdout} stderr=${stderr}`)
assert.equal(carrierReady?.type, 'carrier-ready', `Carrier preflight did not become ready. stderr=${stderr}`)
assert.deepEqual(carrierReady?.host?.eventsRouteProbe, {
  endpoint: '$events', opened: true, readyObserved: true, readyShapeValid: true,
  cancelled: true, iteratorClosed: true, activeStreamsAfterCleanup: 0,
  eventSubscriptionRetained: false, clientRuntimeMetricCounted: false,
  businessOperationsPerformed: 0,
})
assert.equal(ready.workerNodeVersion, 'v22.19.0')
assert.notEqual(ready.workerPid, ready.hostPid)
assert.equal(ready.parentPid, process.pid)
const profilePatch = await readFile(join(dshHome, 'profiles/shaco-forge-v1-slice-1b/node_modules/@shaco-forge/harness-bootstrap/cordis.patch.yml'), 'utf8')
assert.deepEqual(profilePatch.match(/@deepseek-ai\/dsh-host-directory-picker-[a-z-]+/g), ['@deepseek-ai/dsh-host-directory-picker-browse'])
assert.ok(profilePatch.indexOf('id: workspace-controller') < profilePatch.indexOf('id: directory-picker-browse'))
assert.ok(profilePatch.indexOf('id: directory-picker-browse') < profilePatch.indexOf('id: api-remotes'))
const pickerComposition = { backend: '@deepseek-ai/dsh-host-directory-picker-browse', profilePatchSha256: createHash('sha256').update(profilePatch).digest('hex'), nativeAdded: false, autoAdded: false }
assert.equal(profilePatch.match(/id: subagent-model-selection-settings\b/g)?.length, 1)
assert.equal(profilePatch.match(/@deepseek-ai\/dsh-tool-subagent\/model-selection-settings/g)?.length, 1)
assert.match(profilePatch, /id: api-remotes[\s\S]*id: subagent-model-selection-settings\n      name: '@deepseek-ai\/dsh-tool-subagent\/model-selection-settings'\n\n    - id: agent-presets/)
assert.doesNotMatch(profilePatch, /allowedModels|enabled:|\/src\//)
const standardPresetSettings = { module: '@deepseek-ai/dsh-tool-subagent/model-selection-settings', entryId: 'subagent-model-selection-settings', count: 1, beforeAgentPresets: true, defaultsChanged: false }
child.kill('SIGTERM')
await Promise.race([new Promise(resolve => child.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 8_000))])
if (child.exitCode === null && child.signalCode === null) {
  child.kill('SIGKILL')
  await Promise.race([new Promise(resolve => child.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 3_000))])
}
assert.ok(child.exitCode !== null || child.signalCode !== null, 'Worker did not exit during cleanup')
await rm(dshHome, { recursive: true, force: true })
process.stdout.write(`${JSON.stringify({ result: 'PASS', ready, carrierReady, pickerComposition, standardPresetSettings, cleanup: { workerExited: child.exitCode !== null || child.signalCode !== null, exitCode: child.exitCode, signalCode: child.signalCode }, stderr }, null, 2)}\n`)
