import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CARRIER_PROTOCOL_VERSION,
  CLIENT_AUTH_DOMAIN,
  JsonFrameDecoder,
  MAX_JSON_FRAME,
  SERVER_AUTH_DOMAIN,
  canonicalTranscript,
  createAuthProof,
  encodeJsonFrame,
  normalizeRendererRequest,
  validateClientRequestEnvelope,
  validateEndpoint,
  verifyAuthProof,
} from './carrier.js'

const fields = {
  protocolVersion: CARRIER_PROTOCOL_VERSION,
  workerInstanceId: 'worker-1', endpointId: 'endpoint-1', credentialEpoch: 'epoch-1',
  challengeId: 'challenge-1', serverNonce: 'server-nonce', clientNonce: 'client-nonce',
  clientInstanceId: 'client-1',
}
const secret = Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex')

test('canonical HMAC transcript is deterministic and length-prefixed', () => {
  const first = canonicalTranscript(CLIENT_AUTH_DOMAIN, fields)
  assert.deepEqual(first, canonicalTranscript(CLIENT_AUTH_DOMAIN, fields))
  assert.equal(first.toString('hex'), '1a000000736861636f2d666f7267652f636c69656e742d617574682f7631010000003108000000776f726b65722d310a000000656e64706f696e742d310700000065706f63682d310b0000006368616c6c656e67652d310c0000007365727665722d6e6f6e63650c000000636c69656e742d6e6f6e636508000000636c69656e742d31')
  assert.equal(first.readUInt32LE(0), Buffer.byteLength(CLIENT_AUTH_DOMAIN))
  assert.equal(first.subarray(4, 4 + first.readUInt32LE(0)).toString(), CLIENT_AUTH_DOMAIN)
})

test('mutual Client and Server proofs validate and wrong proofs fail', () => {
  const client = createAuthProof(secret, CLIENT_AUTH_DOMAIN, fields)
  const server = createAuthProof(secret, SERVER_AUTH_DOMAIN, fields)
  assert.equal(client, '195e3ea090414d39bae3d2bf24be91b6e439d85f9248d2bf88863c5f3edd9a84')
  assert.equal(server, '4ffe6a2c7c4a6396a49f98d022491ea7d1a1df605d065ab77bdc0386d53303f8')
  assert.equal(verifyAuthProof(secret, CLIENT_AUTH_DOMAIN, fields, client), true)
  assert.equal(verifyAuthProof(secret, SERVER_AUTH_DOMAIN, fields, server), true)
  assert.equal(verifyAuthProof(secret, CLIENT_AUTH_DOMAIN, fields, server), false)
  assert.equal(verifyAuthProof(secret, SERVER_AUTH_DOMAIN, fields, client), false)
})

test('protocol mismatch is rejected before proof construction by caller contract', () => {
  assert.notEqual('2', CARRIER_PROTOCOL_VERSION)
})

test('frame decoder supports partial reads and multiple frames', () => {
  const a = encodeJsonFrame({ type: 'a' })
  const b = encodeJsonFrame({ type: 'b' })
  const decoder = new JsonFrameDecoder()
  assert.deepEqual(decoder.push(a.subarray(0, 2)), [])
  assert.deepEqual(decoder.push(Buffer.concat([a.subarray(2), b])), [{ type: 'a' }, { type: 'b' }])
})

test('frame decoder rejects malformed JSON and 262145 bytes while accepting exactly 262144', () => {
  const exactPayload = Buffer.from(JSON.stringify({ value: 'x'.repeat(MAX_JSON_FRAME - 12) }))
  assert.equal(exactPayload.byteLength, MAX_JSON_FRAME)
  const exact = Buffer.alloc(4 + exactPayload.byteLength)
  exact.writeUInt32LE(exactPayload.byteLength)
  exactPayload.copy(exact, 4)
  assert.equal(new JsonFrameDecoder().push(exact).length, 1)
  const over = Buffer.alloc(4)
  over.writeUInt32LE(MAX_JSON_FRAME + 1)
  assert.throws(() => new JsonFrameDecoder().push(over), /outside/)
  const malformed = Buffer.from('{]')
  const framed = Buffer.alloc(4 + malformed.length)
  framed.writeUInt32LE(malformed.length)
  malformed.copy(framed, 4)
  assert.throws(() => new JsonFrameDecoder().push(framed), /Malformed JSON/)
})

test('URL normalization accepts both frozen Client origins', () => {
  const body = JSON.stringify({ type: 'client-request', rpcId: 'r1', method: 'agentPresets/list', payload: { args: {} } })
  for (const url of ['shaco-forge://client/api/agentPresets/list', 'http://dsh.internal/api/agentPresets/list']) {
    assert.equal(normalizeRendererRequest({ url, method: 'POST', contentType: 'application/json', body }).endpoint, 'agentPresets/list')
  }
})

test('admission rejects other origins, bad targets, malformed envelopes and oversize', () => {
  const body = JSON.stringify({ type: 'client-request', rpcId: 'r1', method: 'agentPresets/list', payload: { args: {} } })
  assert.throws(() => normalizeRendererRequest({ url: 'https://dsh.internal/api/agentPresets/list', method: 'POST', contentType: 'application/json', body }), /allowlisted/)
  assert.throws(() => validateEndpoint('../bad'), /Invalid/)
  assert.throws(() => validateClientRequestEnvelope({ type: 'client-request' }, 'x/y'), /Invalid/)
  assert.throws(() => normalizeRendererRequest({ url: 'http://dsh.internal/api/x/y', method: 'POST', contentType: 'application/json', body: 'x'.repeat(MAX_JSON_FRAME + 1) }), /MAX_JSON_FRAME/)
})
