import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { paths } from './runtime-paths.mjs'

const workerNode = process.env.SHACO_FORGE_WORKER_NODE
if (!workerNode) throw new Error('SHACO_FORGE_WORKER_NODE is required')
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (!harnessRoot) throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const dshHome = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-1a-worker-'))
const child = spawn(workerNode, [paths.workerEntry], {
  env: { ...process.env, SHACO_FORGE_DSH_HOME: dshHome, SHACO_FORGE_HARNESS_ROOT: harnessRoot, SHACO_FORGE_HARNESS_PROFILE_NAME: 'shaco-forge-worker-smoke' },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
})
let stdout = ''
let stderr = ''
child.stdout.setEncoding('utf8')
child.stderr.setEncoding('utf8')
child.stdout.on('data', chunk => { stdout += chunk })
child.stderr.on('data', chunk => { stderr += chunk })
const deadline = Date.now() + 25_000
let ready
while (Date.now() < deadline) {
  ready = stdout.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line) } catch { return undefined } }).find(event => event?.phase === 'host-ready')
  if (ready) break
  if (child.exitCode !== null) break
  await new Promise(resolve => setTimeout(resolve, 100))
}
assert.ok(ready, `Host did not become ready. stdout=${stdout} stderr=${stderr}`)
assert.equal(ready.workerNodeVersion, 'v22.19.0')
assert.notEqual(ready.workerPid, ready.hostPid)
assert.equal(ready.parentPid, process.pid)
child.kill('SIGTERM')
await Promise.race([new Promise(resolve => child.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 8_000))])
if (child.exitCode === null && child.signalCode === null) {
  child.kill('SIGKILL')
  await Promise.race([new Promise(resolve => child.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 3_000))])
}
assert.ok(child.exitCode !== null || child.signalCode !== null, 'Worker did not exit during cleanup')
await rm(dshHome, { recursive: true, force: true })
process.stdout.write(`${JSON.stringify({ result: 'PASS', ready, cleanup: { workerExited: child.exitCode !== null || child.signalCode !== null, exitCode: child.exitCode, signalCode: child.signalCode }, stderr }, null, 2)}\n`)
