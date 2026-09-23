import assert from 'node:assert/strict'
import test from 'node:test'
import { BOOTSTRAP_PROTOCOL_VERSION, parseBootstrapEvent } from './index.js'

test('parseBootstrapEvent accepts the bounded bootstrap protocol', () => {
  const event = parseBootstrapEvent(JSON.stringify({
    protocolVersion: BOOTSTRAP_PROTOCOL_VERSION,
    phase: 'worker-starting',
    timestamp: '2026-09-07T00:00:00.000Z',
    workerPid: 2,
    parentPid: 1,
    workerNodeVersion: 'v22.19.0',
    workerExecutable: 'node.exe',
    workerArgv: ['worker.js'],
  }))
  assert.equal(event?.phase, 'worker-starting')
})

test('parseBootstrapEvent rejects malformed and wrong-version input', () => {
  assert.equal(parseBootstrapEvent('not json'), undefined)
  assert.equal(parseBootstrapEvent(JSON.stringify({ protocolVersion: 2 })), undefined)
})
