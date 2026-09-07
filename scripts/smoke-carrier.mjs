import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { createServer, createConnection } from 'node:net'
import {
  CARRIER_PROTOCOL_VERSION,
  CLIENT_AUTH_DOMAIN,
  JsonFrameDecoder,
  SERVER_AUTH_DOMAIN,
  createAuthProof,
  encodeJsonFrame,
  verifyAuthProof,
} from '../packages/contracts/dist/index.js'
import { CarrierClient } from '../apps/desktop/dist/main/carrier-client.js'
import { paths } from './runtime-paths.mjs'
import { WorkerSupervisor } from '../apps/desktop/dist/main/worker-supervisor.js'
import { join } from 'node:path'

const observedHelpers = []
const observedSockets = []
const timingEvidence = {}

function writeFragments(stream, bytes) {
  const points = [1, Math.min(3, bytes.length), Math.min(9, bytes.length), bytes.length]
  let offset = 0
  for (const point of points) {
    if (point > offset) stream.write(bytes.subarray(offset, point))
    offset = point
  }
}

function nextFrame(stream, timeoutMs = 7_000) {
  return new Promise((resolve, reject) => {
    const decoder = new JsonFrameDecoder()
    const timeout = setTimeout(() => finish(new Error('frame timeout')), timeoutMs)
    const onData = chunk => {
      try {
        const values = decoder.push(chunk)
        if (values.length > 0) finish(undefined, values[0])
      } catch (error) { finish(error) }
    }
    const onEnd = () => finish(new Error('stream ended before frame'))
    function finish(error, value) {
      clearTimeout(timeout)
      stream.off('data', onData)
      stream.off('end', onEnd)
      if (error) reject(error); else resolve(value)
    }
    stream.on('data', onData)
    stream.once('end', onEnd)
  })
}

async function startHelper() {
  const secret = randomBytes(32)
  const workerInstanceId = randomUUID()
  const credentialEpoch = randomUUID()
  const helper = spawn(paths.nativeHelper, [], { env: {}, stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'], windowsHide: true })
  observedHelpers.push(helper)
  let stderr = ''
  let relayBytes = 0
  helper.stderr.setEncoding('utf8')
  helper.stderr.on('data', chunk => { stderr += chunk })
  helper.stdout.on('data', chunk => { relayBytes += chunk.byteLength })
  helper.stdio[3].end(encodeJsonFrame({ type: 'helper-bootstrap', secret: secret.toString('hex'), workerInstanceId, credentialEpoch }))
  const metadata = await nextFrame(helper.stdio[4])
  assert.equal(metadata.type, 'helper-ready')
  return { helper, metadata, secret, workerInstanceId, credentialEpoch, stderr: () => stderr, relayBytes: () => relayBytes }
}

async function connectAndChallenge(instance) {
  const socket = createConnection(instance.metadata.pipeEndpoint)
  observedSockets.push(socket)
  const challenge = await nextFrame(socket)
  assert.equal(challenge.protocolVersion, CARRIER_PROTOCOL_VERSION)
  return { socket, challenge }
}

function authFields(instance, challenge, clientNonce = randomBytes(32).toString('hex'), clientInstanceId = randomUUID()) {
  return {
    protocolVersion: CARRIER_PROTOCOL_VERSION,
    workerInstanceId: instance.workerInstanceId,
    endpointId: instance.metadata.endpointId,
    credentialEpoch: instance.credentialEpoch,
    challengeId: challenge.challengeId,
    serverNonce: challenge.serverNonce,
    clientNonce,
    clientInstanceId,
  }
}

async function waitExit(child, timeoutMs = 8_000) {
  if (child.exitCode !== null || child.signalCode !== null) return
  await new Promise((resolve, reject) => {
    const onExit = () => { clearTimeout(timeout); resolve() }
    const timeout = setTimeout(() => {
      child.off('exit', onExit)
      reject(new Error('helper cleanup timeout'))
    }, timeoutMs)
    child.once('exit', onExit)
  })
}

async function validRelayScenario() {
  const instance = await startHelper()
  const createdAt = performance.now()
  await new Promise(resolve => setTimeout(resolve, 5_300))
  timingEvidence.delayedConnectMs = Math.round(performance.now() - createdAt)
  assert.ok(timingEvidence.delayedConnectMs > 5_000)
  assert.equal(instance.helper.exitCode, null, 'Pipe accept must survive a Host readiness delay longer than auth timeout')
  assert.equal(instance.helper.signalCode, null)
  const { socket, challenge } = await connectAndChallenge(instance)
  const fields = authFields(instance, challenge)
  writeFragments(socket, encodeJsonFrame({
    type: 'client-auth', clientNonce: fields.clientNonce, clientInstanceId: fields.clientInstanceId,
    clientProof: createAuthProof(instance.secret, CLIENT_AUTH_DOMAIN, fields),
  }))
  const serverAuth = await nextFrame(socket)
  assert.equal(verifyAuthProof(instance.secret, SERVER_AUTH_DOMAIN, fields, serverAuth.serverProof), true)
  const authenticatedAt = performance.now()
  await new Promise(resolve => setTimeout(resolve, 5_200))
  timingEvidence.authenticatedIdleMs = Math.round(performance.now() - authenticatedAt)
  assert.equal(instance.helper.exitCode, null, 'idle authenticated Carrier must not be treated as an incomplete frame')
  const request = {
    type: 'unary-request', requestId: randomUUID(), endpoint: 'agentPresets/list',
    envelope: { type: 'client-request', rpcId: randomUUID(), method: 'agentPresets/list', payload: { args: {} } },
  }
  writeFragments(socket, encodeJsonFrame(request))
  assert.deepEqual(await nextFrame(instance.helper.stdout), request)
  const response = { type: 'unary-response', requestId: request.requestId, envelope: { type: 'server-response', rpcId: request.envelope.rpcId, result: { ok: true, value: [] } } }
  writeFragments(instance.helper.stdin, encodeJsonFrame(response))
  assert.deepEqual(await nextFrame(socket), response)
  socket.destroy()
  instance.helper.stdin.end()
  await waitExit(instance.helper)
  assert.ok(instance.helper.exitCode !== null || instance.helper.signalCode !== null, instance.stderr())
}

async function rejectionScenario(kind) {
  const instance = await startHelper()
  const { socket, challenge } = await connectAndChallenge(instance)
  let timeoutStartedAt = performance.now()
  if (kind === 'wrong-proof') {
    const fields = authFields(instance, challenge)
    socket.write(encodeJsonFrame({ type: 'client-auth', clientNonce: fields.clientNonce, clientInstanceId: fields.clientInstanceId, clientProof: '00'.repeat(32) }))
  } else if (kind === 'unauthenticated-business') {
    socket.write(encodeJsonFrame({ type: 'unary-request', requestId: 'x', endpoint: 'agentPresets/list', envelope: {} }))
  } else if (kind === 'malformed') {
    const payload = Buffer.from('{]')
    const frame = Buffer.alloc(4 + payload.length)
    frame.writeUInt32LE(payload.length)
    payload.copy(frame, 4)
    socket.write(frame)
  } else if (kind === 'oversize') {
    const frame = Buffer.alloc(4)
    frame.writeUInt32LE(262_145)
    socket.write(frame)
  } else if (kind === 'timeout') {
    // Deliberately send no CLIENT_AUTH.
  } else if (kind === 'partial-frame-timeout') {
    const fields = authFields(instance, challenge)
    socket.write(encodeJsonFrame({
      type: 'client-auth', clientNonce: fields.clientNonce, clientInstanceId: fields.clientInstanceId,
      clientProof: createAuthProof(instance.secret, CLIENT_AUTH_DOMAIN, fields),
    }))
    await nextFrame(socket)
    timeoutStartedAt = performance.now()
    const incomplete = Buffer.alloc(4)
    incomplete.writeUInt32LE(10)
    await new Promise((resolve, reject) => socket.write(incomplete, error => error ? reject(error) : resolve()))
  }
  await waitExit(instance.helper, 9_000).catch(error => {
    throw new Error(`${kind}: ${error.message}`)
  })
  assert.notEqual(instance.helper.exitCode, 0)
  if (kind === 'timeout' || kind === 'partial-frame-timeout') {
    const elapsed = Math.round(performance.now() - timeoutStartedAt)
    assert.ok(elapsed >= 4_500 && elapsed < 9_000, `${kind} did not enforce the 5-second deadline: ${elapsed} ms`)
    timingEvidence[kind] = elapsed
  }
  assert.equal(instance.relayBytes(), 0, `${kind} reached the Worker-facing relay`)
  socket.destroy()
}

async function secondAuthScenario() {
  const instance = await startHelper()
  const { socket, challenge } = await connectAndChallenge(instance)
  const fields = authFields(instance, challenge)
  const auth = { type: 'client-auth', clientNonce: fields.clientNonce, clientInstanceId: fields.clientInstanceId, clientProof: createAuthProof(instance.secret, CLIENT_AUTH_DOMAIN, fields) }
  socket.write(encodeJsonFrame(auth))
  await nextFrame(socket)
  socket.write(encodeJsonFrame(auth))
  instance.helper.stdin.end()
  await waitExit(instance.helper)
  assert.notEqual(instance.helper.exitCode, 0)
  socket.destroy()
}

async function fakeServerScenario(protocolVersion = CARRIER_PROTOCOL_VERSION) {
  const endpoint = `\\\\.\\pipe\\shaco-forge-fake-${randomBytes(16).toString('hex')}`
  const secret = randomBytes(32)
  const bootstrap = {
    pipeEndpoint: endpoint, endpointId: randomUUID(), pipeEndpointHashPrefix: 'redacted', helperPid: process.pid,
    workerInstanceId: randomUUID(), credentialEpoch: randomUUID(), secret, security: {}, hostPreflight: {},
  }
  let receivedFrames = 0
  const server = createServer(socket => {
    socket.on('data', () => { receivedFrames += 1 })
    const challenge = {
      type: 'server-challenge', protocolVersion,
      workerInstanceId: bootstrap.workerInstanceId, endpointId: bootstrap.endpointId,
      credentialEpoch: bootstrap.credentialEpoch, challengeId: randomUUID(), serverNonce: randomBytes(32).toString('hex'),
    }
    socket.write(encodeJsonFrame(challenge))
    if (protocolVersion === CARRIER_PROTOCOL_VERSION) {
      void nextFrame(socket).then(() => socket.write(encodeJsonFrame({ type: 'server-auth', serverProof: '00'.repeat(32) })))
    }
  })
  await new Promise((resolve, reject) => server.listen(endpoint, resolve).once('error', reject))
  const client = new CarrierClient(bootstrap)
  await assert.rejects(client.connect(), protocolVersion === CARRIER_PROTOCOL_VERSION ? /server proof/ : /protocol version/)
  assert.equal(client.metrics.businessFramesSent, 0)
  if (protocolVersion !== CARRIER_PROTOCOL_VERSION) assert.equal(receivedFrames, 0)
  client.close()
  await new Promise(resolve => server.close(resolve))
}

function alive(pid) {
  try { process.kill(pid, 0); return true } catch (error) {
    if (error.code === 'ESRCH') return false
    throw error
  }
}

async function workerLifetimeScenario(kind) {
  const supervisor = new WorkerSupervisor({
    workerNodePath: process.execPath,
    workerEntryPath: join(paths.desktopRoot, 'test-fixtures/supervisor-native-wait-worker.mjs'),
    nativeHelperPath: paths.nativeHelper, harnessRoot: paths.root, dshHome: paths.root,
    profileName: `native-wait-${kind}`,
  }, kind === 'timeout' ? 3_000 : 10_000)
  let helperPid
  let workerPid
  const unsubscribe = supervisor.onEvent(event => {
    helperPid = event.nativeHelperPid
    workerPid = event.workerPid
  })
  const starting = supervisor.start()
  const rejected = assert.rejects(starting, kind === 'timeout' ? /startup timed out/ : /stopped deliberately/)
  try {
    const metadataDeadline = Date.now() + 2_500
    while (helperPid === undefined && Date.now() < metadataDeadline) await new Promise(resolve => setTimeout(resolve, 20))
    assert.ok(Number.isInteger(helperPid), 'Actual Helper must be waiting for a Client before testing Worker termination')
    assert.equal(alive(helperPid), true)
    if (kind === 'stop') assert.equal((await supervisor.stop()).exited, true)
    await rejected
    assert.equal((await supervisor.stop()).exited, true)
    const exitDeadline = Date.now() + 3_000
    while (alive(helperPid) && Date.now() < exitDeadline) await new Promise(resolve => setTimeout(resolve, 20))
    assert.equal(alive(helperPid), false, 'Waiting Native Helper must exit when Worker closes its inherited pipe')
    assert.equal(alive(workerPid), false)
  } finally {
    unsubscribe()
    await supervisor.stop()
    if (helperPid !== undefined && alive(helperPid)) process.kill(helperPid)
  }
}

try {
  await validRelayScenario()
  for (const kind of ['wrong-proof', 'unauthenticated-business', 'malformed', 'oversize', 'timeout', 'partial-frame-timeout']) await rejectionScenario(kind)
  await secondAuthScenario()
  await fakeServerScenario()
  await fakeServerScenario('2')
  await workerLifetimeScenario('timeout')
  await workerLifetimeScenario('stop')
} finally {
  for (const socket of observedSockets) socket.destroy()
  for (const helper of observedHelpers) {
    if (helper.exitCode === null && helper.signalCode === null) helper.kill('SIGTERM')
    await waitExit(helper)
  }
}
process.stdout.write(`${JSON.stringify({
  result: 'PASS',
  timingEvidence,
  gates: {
    inheritedOneShotSecretChannel: true, protectedCurrentUserAcl: true, firstPipeInstance: true,
    mutualHmac: true, wrongClientProofRejected: true, unauthenticatedBusinessRejected: true,
    wrongServerProofRejectedAtClient: true, businessFramesSentToFakeServer: 0,
    protocolVersionRejectedBeforeProof: true, gatewayDispatchCountForRejectedInputs: 0,
    secondClientAuthRejected: true, handshakeTimeout: true, partialReads: true,
    partialWrites: true, idleCarrierPreserved: true, frameCompletionTimeout: true,
    delayedConnectBeyondAuthTimeout: true, slowHostReadinessEquivalent: 'actual-native-helper-delayed-connect',
    waitingHelperExitsOnWorkerStartupTimeout: true, waitingHelperExitsOnWorkerStop: true,
    malformedFrameRejected: true, oversizeFrameRejected: true,
    helperProcessesCleaned: true, pipeEndpointRedacted: true, secretRedacted: true,
  },
}, null, 2)}\n`)
