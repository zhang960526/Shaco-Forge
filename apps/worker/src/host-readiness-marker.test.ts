import assert from 'node:assert/strict'
import test from 'node:test'
import { parseHostReadinessMarker } from './host-readiness-marker.js'

test('Host readiness marker parses the allowlisted envelope', () => {
  assert.deepEqual(parseHostReadinessMarker('SHACO_FORGE_HOST_READY {"type":"shaco-forge-host-ready","gatewayPresetCount":4,"standardPresetPresent":true}'), {
    type: 'shaco-forge-host-ready', gatewayPresetCount: 4, standardPresetPresent: true,
  })
  assert.equal(parseHostReadinessMarker('ordinary host output'), undefined)
})

test('malformed Host readiness JSON and shape fail closed', () => {
  assert.throws(() => parseHostReadinessMarker('SHACO_FORGE_HOST_READY {]'), /Malformed Host readiness marker JSON/)
  assert.throws(() => parseHostReadinessMarker('SHACO_FORGE_HOST_READY {"type":"wrong"}'), /envelope is invalid/)
})
