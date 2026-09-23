import assert from 'node:assert/strict'
import test from 'node:test'
import { collectHostReadiness } from './harness-readiness.js'
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

test('P8 effective-state readiness output is validated without secrets', () => {
  const marker = parseHostReadinessMarker(`SHACO_FORGE_HOST_READY ${JSON.stringify({
    type: 'shaco-forge-host-ready', gatewayPresetCount: 4, standardPresetPresent: true,
    P8_ENABLED: true, SCENARIO_ID: 'S-B01', AUTHORIZATION_ID: 'AUTH-01',
    SCENARIO_BUDGET_INITIAL: 2, SCENARIO_BUDGET_REMAINING: 2,
    PROVIDER: 'deepseek-official', MODEL: 'deepseek-v4-flash', INPUT_CLASS: 'text-only',
    RESOLVED_RETRY_MODE: 'normal', RESOLVED_MAX_RETRIES: 1,
  })}`)
  assert.equal(marker?.P8_ENABLED, true)
  assert.equal(marker?.SCENARIO_BUDGET_INITIAL, 2)
  assert.throws(() => parseHostReadinessMarker(`SHACO_FORGE_HOST_READY ${JSON.stringify({
    ...marker, RESOLVED_MAX_RETRIES: 5,
  })}`), /effective-state envelope is invalid/)
})

test('Host readiness projection is derived from the Guard effective state', async () => {
  const effective = {
    P8_ENABLED: true, SCENARIO_ID: 'S-B05', AUTHORIZATION_ID: 'AUTH-READY-01',
    SCENARIO_BUDGET_INITIAL: 3, SCENARIO_BUDGET_REMAINING: 3,
    PROVIDER: 'deepseek-official', MODEL: 'deepseek-v4-flash', INPUT_CLASS: 'text-only',
    RESOLVED_RETRY_MODE: 'normal', RESOLVED_MAX_RETRIES: 0,
  }
  const readiness = await collectHostReadiness({
    agentPresets: { list: () => ['standard'], resolve: async () => ({}) },
    shacoForgeProviderExecutionGuard: { effectiveState: () => effective },
    effect: () => undefined,
  })
  assert.deepEqual({ ...readiness, hostPid: undefined }, {
    type: 'shaco-forge-host-ready', hostPid: undefined, gatewayPresetCount: 1, standardPresetPresent: true, ...effective,
  })
})
