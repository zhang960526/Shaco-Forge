import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import test from 'node:test'
import { mapWorkerTerminal, readSupervisorConfig, WorkerSupervisor, WorkerTerminationState, type SupervisorConfig } from './worker-supervisor.js'
import { validateAuthority } from './lifecycle-client.js'

function fixtureConfig(profileName: string): SupervisorConfig {
  return {
    workerNodePath: process.execPath,
    workerEntryPath: resolve(process.cwd(), 'apps/desktop/test-fixtures/supervisor-worker.mjs'),
    nativeHelperPath: process.execPath,
    harnessRoot: process.cwd(),
    dshHome: process.cwd(),
    profileName,
  }
}

test('Supervisor refuses PATH-based implicit runtime lookup', () => {
  assert.throws(() => readSupervisorConfig({}), /SHACO_FORGE_WORKER_NODE is required/)
})

test('Supervisor accepts explicit controlled runtime paths', () => {
  const config = readSupervisorConfig({
    SHACO_FORGE_WORKER_NODE: 'C:\\Runtime\\node.exe',
    SHACO_FORGE_WORKER_ENTRY: 'C:\\Product\\worker.js',
    SHACO_FORGE_NATIVE_HELPER: 'C:\\Product\\ShacoForge.NativeCarrier.exe',
    SHACO_FORGE_HARNESS_ROOT: 'C:\\Product\\harness',
    SHACO_FORGE_DSH_HOME: 'C:\\Data\\dsh',
  })
  assert.match(config.workerNodePath, /node\.exe$/)
})

test('Supervisor validates absolute input semantics before resolve', () => {
  assert.throws(() => readSupervisorConfig({
    SHACO_FORGE_WORKER_NODE: '.\\node.exe',
    SHACO_FORGE_WORKER_ENTRY: 'C:\\Product\\worker.js',
    SHACO_FORGE_NATIVE_HELPER: 'C:\\Product\\ShacoForge.NativeCarrier.exe',
    SHACO_FORGE_HARNESS_ROOT: 'C:\\Product\\harness',
    SHACO_FORGE_DSH_HOME: 'C:\\Data\\dsh',
  }), /absolute input path/)
})

test('Worker child terminal maps to a truthful failure', () => {
  assert.match(mapWorkerTerminal(7, null), /7/)
  assert.match(mapWorkerTerminal(null, 'SIGTERM'), /SIGTERM/)
})

test('deliberate Supervisor stop does not publish Carrier Failure', () => {
  const termination = new WorkerTerminationState()
  termination.beginDeliberateStop()
  assert.equal(termination.unexpectedFailure(null, 'SIGTERM'), undefined)
})

test('unexpected Worker child exit still publishes Carrier Failure', () => {
  const termination = new WorkerTerminationState()
  assert.match(termination.unexpectedFailure(23, null) ?? '', /23/)
})

test('Unavailable native discovery fails closed before starting a Worker', async () => {
  const supervisor = new WorkerSupervisor(fixtureConfig('test-timeout'), 80)
  await assert.rejects(supervisor.start(), /Native lifecycle inspection rejected/)
  assert.equal((await supervisor.stop()).exited, true)
})

test('S2G18 recovery also fails closed on unverified native discovery and launches no replacement', async () => {
  const supervisor = new WorkerSupervisor(fixtureConfig('test-recovery-unverified'), 80)
  await assert.rejects(supervisor.recover(), /Native lifecycle inspection rejected/)
  assert.equal(supervisor.workerLaunchAttempts, 0)
  assert.equal((await supervisor.stop()).exited, true)
})

test('Desktop detach does not notify authority failure or require an owned child', async () => {
  const supervisor = new WorkerSupervisor(fixtureConfig('test-deliberate'), 1_000)
  const failures: string[] = []
  supervisor.onCarrierFailure(reason => failures.push(reason))
  supervisor.detach()
  assert.equal((await supervisor.stop()).exited, true)
  assert.deepEqual(failures, [])
})

test('Discovery rejects a reused PID, unhealthy authority and incompatible version', () => {
  const peer = { pid: 42, startTime: '100' }
  const status = { type: 'authority-status', protocolVersion: '1', workerInstanceId: 'authority', healthy: true,
    helper: peer, worker: { pid: 41, startTime: '90' }, host: { pid: 43, startTime: '110' }, hostPreflight: {} }
  assert.equal(validateAuthority(status, peer).workerInstanceId, 'authority')
  assert.throws(() => validateAuthority(status, { ...peer, startTime: '101' }), /IDENTITY_OR_HEALTH/)
  assert.throws(() => validateAuthority({ ...status, healthy: false }, peer), /IDENTITY_OR_HEALTH/)
  assert.throws(() => validateAuthority({ ...status, protocolVersion: '2' }, peer), /IDENTITY_OR_HEALTH/)
})
