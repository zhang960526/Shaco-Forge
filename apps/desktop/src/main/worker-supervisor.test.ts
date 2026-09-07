import assert from 'node:assert/strict'
import test from 'node:test'
import { readSupervisorConfig } from './worker-supervisor.js'

test('Supervisor refuses PATH-based implicit runtime lookup', () => {
  assert.throws(() => readSupervisorConfig({}), /SHACO_FORGE_WORKER_NODE is required/)
})

test('Supervisor accepts explicit controlled runtime paths', () => {
  const config = readSupervisorConfig({
    SHACO_FORGE_WORKER_NODE: 'C:\\Runtime\\node.exe',
    SHACO_FORGE_WORKER_ENTRY: 'C:\\Product\\worker.js',
    SHACO_FORGE_HARNESS_ROOT: 'C:\\Product\\harness',
    SHACO_FORGE_DSH_HOME: 'C:\\Data\\dsh',
  })
  assert.match(config.workerNodePath, /node\.exe$/)
})
