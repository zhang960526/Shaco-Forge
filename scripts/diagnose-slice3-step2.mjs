// NOT_SHIPPED, non-Provider startup diagnosis against isolated empty data only.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fixture, workerBridge } from './slice3-step2-fixtures.mjs'
import { ControlStore } from '../apps/worker/dist/control-store.js'
import { inspectLocalPlatform, lifecycleRequest } from '../apps/desktop/dist/main/lifecycle-client.js'
import { jsonBytes } from '../packages/contracts/dist/packaged-runtime.js'

const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence); await mkdir(evidence, { recursive: true })
const f = await fixture('diagnostic')
await f.boundary.protect(f.paths.dsh)
const helper = join(f.paths.payload, 'native/ShacoForge.NativeCarrier.exe')
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const identity = JSON.parse(await readFile(join(f.paths.payload, 'artifact-identity.json'), 'utf8'))
const target = { artifactDigest: identity.digest, releaseManifestDigest: identity.releaseManifestSha256, productVersion: '1.0.0-dev.1', dshHome: f.paths.dsh }
const store = new ControlStore(join(f.paths.control, 'state.sqlite'), { kind: 'FRESH_INSTALL', sourceSchema: 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES', target }); store.close()
const transactionId = randomUUID()
await f.boundary.publishJournal({ id: transactionId, state: 'VALIDATING', installed: true, source: target, target, events: [] })
const bridge = await workerBridge(f.root, f.paths.payload, f.paths.dsh)
const child = spawn(join(f.paths.payload, 'runtime/node.exe'), [bridge, '--validate-upgrade'], { env: {}, cwd: f.paths.payload, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = '', status
for (const stream of [child.stdout, child.stderr]) stream.on('data', bytes => { output = (output + String(bytes)).slice(-32768) })
const deadline = Date.now() + 110000
while (Date.now() < deadline && child.exitCode === null) {
  try { status = (await lifecycleRequest(helper, 'discover')).status; if (status?.worker.pid === child.pid) break } catch {}
  await new Promise(done => setTimeout(done, 200))
}
if (status?.worker.pid === child.pid) await lifecycleRequest(helper, 'upgrade-drain', status.workerInstanceId, { transactionId })
const timer = setTimeout(() => child.kill(), 45000)
if (child.exitCode === null) await new Promise(done => child.once('exit', done))
clearTimeout(timer)
const diagnostic = { result: status ? 'READY_OBSERVED' : 'START_FAILED', exitCode: child.exitCode, root: f.root,
  errors: output.split(/\r?\n/).filter(line => /error|failed|Cannot find|REJECTED|MISMATCH|requires|at file:|exited|stopped|SHACO_FORGE/i.test(line)).map(line => line.slice(0,1000)),
  outputBytes: Buffer.byteLength(output), providerRuns: 0, signingRuns: 0 }
await writeFile(join(evidence, 'startup-diagnostic.json'), jsonBytes(diagnostic), 'utf8')
console.log(jsonBytes(diagnostic))
assert.equal(diagnostic.result, 'READY_OBSERVED')
assert.equal(diagnostic.exitCode, 0)
