import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { CarrierClient } from '../apps/desktop/dist/main/carrier-client.js'
import { supervisorForRun, alive } from './smoke-slice2-step1.mjs'

assert.equal(process.version, 'v22.19.0')
const supervisor = await supervisorForRun()
let client
let authority
try {
  const bootstrap = await supervisor.start()
  authority = bootstrap.authority
  assert.equal(authority.healthy, true)
  assert.equal(authority.workerRuntime.nodeVersion, 'v22.19.0')
  assert.equal(new Set([process.pid, authority.worker.pid, authority.host.pid, authority.helper.pid]).size, 4)
  assert.deepEqual(bootstrap.hostPreflight.eventsRouteProbe, {
    endpoint: '$events', opened: true, readyObserved: true, readyShapeValid: true,
    cancelled: true, iteratorClosed: true, activeStreamsAfterCleanup: 0,
    eventSubscriptionRetained: false, clientRuntimeMetricCounted: false, businessOperationsPerformed: 0,
  })
  const profilePatch = await readFile(join(supervisor.config.dshHome, 'profiles/shaco-forge-v1-slice-1b/node_modules/@shaco-forge/harness-bootstrap/cordis.patch.yml'), 'utf8')
  assert.deepEqual(profilePatch.match(/@deepseek-ai\/dsh-host-directory-picker-[a-z-]+/g), ['@deepseek-ai/dsh-host-directory-picker-browse'])
  assert.ok(profilePatch.indexOf('id: workspace-controller') < profilePatch.indexOf('id: directory-picker-browse'))
  assert.ok(profilePatch.indexOf('id: directory-picker-browse') < profilePatch.indexOf('id: api-remotes'))
  assert.equal(profilePatch.match(/id: subagent-model-selection-settings\b/g)?.length, 1)
  assert.equal(profilePatch.match(/@deepseek-ai\/dsh-tool-subagent\/model-selection-settings/g)?.length, 1)
  assert.match(profilePatch, /id: api-remotes[\s\S]*id: subagent-model-selection-settings\n      name: '@deepseek-ai\/dsh-tool-subagent\/model-selection-settings'\n\n    - id: agent-presets/)
  assert.doesNotMatch(profilePatch, /allowedModels|enabled:|\/src\//)
  client = new CarrierClient(bootstrap)
  await client.connect()
  client.close()
  assert.equal((await supervisor.stop()).exited, true)
  assert.ok(['worker', 'host', 'helper'].every(role => !alive(authority[role].pid)))
  console.log(JSON.stringify({ result: 'PASS', authority, profilePatchSha256: createHash('sha256').update(profilePatch).digest('hex'), cleanup: 'NO_ORPHAN', providerCalls: 0 }))
} finally {
  client?.close()
  await supervisor.stop()
  if (authority && alive(authority.worker.pid)) process.kill(authority.worker.pid, 'SIGKILL')
}
