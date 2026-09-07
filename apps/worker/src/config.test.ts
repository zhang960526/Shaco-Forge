import assert from 'node:assert/strict'
import test from 'node:test'
import { readWorkerConfig } from './config.js'

test('readWorkerConfig requires explicit controlled paths', () => {
  assert.throws(() => readWorkerConfig({}), /SHACO_FORGE_DSH_HOME is required/)
})

test('readWorkerConfig accepts an explicit profile and paths', () => {
  const config = readWorkerConfig({
    SHACO_FORGE_DSH_HOME: 'C:\\Temp\\shaco-dsh-home',
    SHACO_FORGE_HARNESS_ROOT: 'C:\\Product\\harness',
    SHACO_FORGE_NATIVE_HELPER: 'C:\\Product\\ShacoForge.NativeCarrier.exe',
    SHACO_FORGE_HARNESS_PROFILE_NAME: 'shaco-forge-test',
  })
  assert.equal(config.profileName, 'shaco-forge-test')
  assert.match(config.harnessRoot, /harness$/)
})

test('readWorkerConfig validates absolute input before canonicalization', () => {
  assert.throws(() => readWorkerConfig({
    SHACO_FORGE_DSH_HOME: '.\\relative-home',
    SHACO_FORGE_HARNESS_ROOT: 'C:\\Product\\harness',
    SHACO_FORGE_NATIVE_HELPER: 'C:\\Product\\ShacoForge.NativeCarrier.exe',
  }), /absolute input path/)
})
