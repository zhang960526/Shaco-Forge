import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { WorkerSupervisor } from '../apps/desktop/dist/main/worker-supervisor.js'
import { CarrierClient } from '../apps/desktop/dist/main/carrier-client.js'
import { inspectLocalPlatform } from '../apps/desktop/dist/main/lifecycle-client.js'
import { paths } from './runtime-paths.mjs'
import { evidence, evidenceRoot } from './step2-evidence.mjs'

assert.equal(process.version, 'v22.19.0')
const beforePlatform = await inspectLocalPlatform(paths.nativeHelper)
assert.equal(beforePlatform.mutexExists, false)
const supervisor = new WorkerSupervisor({ workerNodePath: process.execPath, workerEntryPath: paths.workerEntry, nativeHelperPath: paths.nativeHelper,
  harnessRoot: process.env.SHACO_FORGE_HARNESS_ROOT, dshHome: await mkdtemp(join(paths.root, 'node_modules/.step2-replacement-probe-')), profileName: 'shaco-forge-v1-slice-1b' })
const alive = pid => { try { process.kill(pid, 0); return true } catch { return false } }
let old
let fresh
let client
let outcome
let failure
try {
  old = await supervisor.start()
  client = new CarrierClient(old)
  await client.connect()
  const lost = new Promise(resolve => client.onFailure(resolve))
  supervisor.carrierReady()
  process.kill(old.authority.worker.pid, 'SIGKILL')
  await lost
  const pidsAtLoss = ['worker', 'host', 'helper'].map(role => ({ role, alive: alive(old.authority[role].pid) }))
  try {
    fresh = await supervisor.recover()
    outcome = { result: 'PASS', pidsAtLoss, newWorkerIdentity: fresh.workerInstanceId !== old.workerInstanceId }
  } catch (error) {
    failure = error.message.replace(/[A-Za-z]:[\\/][^\r\n]*/g, '[path]')
    const after = await inspectLocalPlatform(paths.nativeHelper).catch(() => undefined)
    outcome = { result: 'FAIL', originalError: failure, pidsAtLoss, oldProcessesAfter: ['worker', 'host', 'helper'].map(role => ({ role, alive: alive(old.authority[role].pid) })),
      platform: after ? { mutexExists: after.mutexExists, lifecycleBusy: after.lifecycleBusy } : undefined, workerLaunchAttempts: supervisor.workerLaunchAttempts }
  }
} finally {
  client?.close()
  fresh?.lifecycle?.destroy()
  fresh?.secret.fill(0)
  const cleanup = await supervisor.stop()
  for (const bootstrap of [old, fresh]) if (bootstrap && alive(bootstrap.authority.worker.pid)) process.kill(bootstrap.authority.worker.pid, 'SIGKILL')
  const previous = await readFile(join(evidenceRoot, 'worker-replacement.json'), 'utf8').then(JSON.parse).catch(() => ({ diagnosticAttempts: [] }))
  previous.diagnosticAttempts.push({ ...outcome, cleanup: { exited: cleanup.exited }, providerRuns: 0 })
  await evidence('worker-replacement.json', previous)
  console.log(JSON.stringify(outcome))
}
if (failure) process.exitCode = 1
