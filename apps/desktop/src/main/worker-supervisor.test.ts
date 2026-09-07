import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import test from 'node:test'
import { mapWorkerTerminal, readSupervisorConfig, WorkerSupervisor, WorkerTerminationState, type SupervisorConfig } from './worker-supervisor.js'

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

test('Worker startup timeout fails closed and cleans the child', async () => {
  const supervisor = new WorkerSupervisor(fixtureConfig('test-timeout'), 80)
  await assert.rejects(supervisor.start(), /startup timed out after 80 ms/)
  assert.equal((await supervisor.stop()).exited, true)
})

test('deliberate Supervisor.stop does not notify Carrier Failure listeners', async () => {
  const supervisor = new WorkerSupervisor(fixtureConfig('test-deliberate'), 1_000)
  const failures: string[] = []
  supervisor.onCarrierFailure(reason => failures.push(reason))
  await supervisor.start()
  assert.equal((await supervisor.stop()).exited, true)
  assert.deepEqual(failures, [])
})

test('unexpected live Worker exit notifies Carrier Failure listeners', async () => {
  const supervisor = new WorkerSupervisor(fixtureConfig('test-unexpected'), 1_000)
  const failure = new Promise<string>(resolveFailure => supervisor.onCarrierFailure(resolveFailure))
  await supervisor.start()
  assert.match(await failure, /23/)
  assert.equal((await supervisor.stop()).exited, true)
})
