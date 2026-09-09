import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { createServer } from 'node:net'
import { encodeJsonFrame } from '../packages/contracts/dist/index.js'
import { CarrierClient } from '../apps/desktop/dist/main/carrier-client.js'
import { runCarrierNegatives } from './smoke-slice2-step1.mjs'

// Negative server fixtures still exercise the actual Product CarrierClient.
for (const protocolVersion of ['1', '2']) {
  const endpoint = `\\\\.\\pipe\\shaco-forge-negative-${randomBytes(16).toString('hex')}`
  const bootstrap = { pipeEndpoint: endpoint, endpointId: randomUUID(), pipeEndpointHashPrefix: 'redacted', helperPid: process.pid,
    workerInstanceId: randomUUID(), credentialEpoch: randomUUID(), secret: randomBytes(32), security: {}, hostPreflight: {} }
  let frames = 0
  const server = createServer(socket => {
    socket.on('error', () => {})
    socket.on('data', () => { frames++; if (protocolVersion === '1') socket.write(encodeJsonFrame({ type: 'server-auth', serverProof: '00'.repeat(32) })) })
    socket.write(encodeJsonFrame({ type: 'server-challenge', protocolVersion, workerInstanceId: bootstrap.workerInstanceId,
      endpointId: bootstrap.endpointId, credentialEpoch: bootstrap.credentialEpoch, challengeId: randomUUID(), serverNonce: randomBytes(32).toString('hex') }))
  })
  await new Promise((resolve, reject) => server.listen(endpoint, resolve).once('error', reject))
  const client = new CarrierClient(bootstrap)
  try {
    await assert.rejects(client.connect(), protocolVersion === '1' ? /server proof/ : /protocol version/)
    assert.equal(client.metrics.businessFramesSent, 0)
    if (protocolVersion === '2') assert.equal(frames, 0)
  } finally { client.close(); await new Promise(resolve => server.close(resolve)) }
}
await runCarrierNegatives()
console.log(JSON.stringify({ result: 'PASS', fakeServerBusinessFrames: 0, incompatibleVersionProofFrames: 0 }))
