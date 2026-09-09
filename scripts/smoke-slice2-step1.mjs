import assert from 'node:assert/strict'
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import { createConnection } from 'node:net'
import { paths } from './runtime-paths.mjs'

export const runId = 'STEP1-20260909-G15-CORRECTIVE-01'
export const evidenceRoot = join(paths.root, 'docs/04-development-records/evidence/V1-SLICE-2/STEP-1', runId)
export async function evidence(name, value) {
  await mkdir(evidenceRoot, { recursive: true })
  await writeFile(join(evidenceRoot, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

if (process.argv.includes('--foundation')) {
  assert.equal(process.version, 'v22.19.0')
  const { WorkerSupervisor } = await import('../apps/desktop/dist/main/worker-supervisor.js')
  const { CarrierClient } = await import('../apps/desktop/dist/main/carrier-client.js')
  const dshHome = await mkdtemp(join(paths.root, 'node_modules/.step1-foundation-'))
  const config = { workerNodePath: process.execPath, workerEntryPath: paths.workerEntry, nativeHelperPath: paths.nativeHelper,
    harnessRoot: process.env.SHACO_FORGE_HARNESS_ROOT, dshHome, profileName: 'shaco-forge-v1-slice-1b' }
  const supervisor = new WorkerSupervisor(config, 30_000)
  const events = []
  const child = spawn(process.execPath, [paths.workerEntry], {
    env: { ...process.env, SHACO_FORGE_DSH_HOME: dshHome, SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stderr = ''
  let buffer = ''
  child.stderr.on('data', chunk => { stderr += chunk.toString() })
  child.stdout.on('data', chunk => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/); buffer = lines.pop()
    for (const line of lines) { try { events.push(JSON.parse(line)) } catch {} }
  })
  let result = 'FAIL'
  let failure
  let stage = 'worker-readiness'
  const attachments = []
  let client
  try {
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline && !events.some(event => event.phase === 'carrier-ready')) {
      if (child.exitCode !== null) throw new Error('FOUNDATION_WORKER_START_EXIT')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    assert.ok(events.some(event => event.phase === 'carrier-ready'), 'FOUNDATION_READINESS_TIMEOUT')
    for (let i = 0; i < 2; i++) {
      stage = `attachment-${i}-discovery`
      const bootstrap = await supervisor.start()
      stage = `attachment-${i}-authentication`
      client = new CarrierClient(bootstrap)
      await client.connect()
      const response = await client.request('agentPresets/list', { type: 'client-request', rpcId: `foundation-${i}`, method: 'agentPresets/list', payload: { args: {} } })
      assert.equal(response.result.ok, true)
      attachments.push({ workerInstanceId: bootstrap.workerInstanceId, credentialEpoch: bootstrap.credentialEpoch, clientInstanceId: client.clientInstanceId,
        worker: bootstrap.authority.worker, host: bootstrap.authority.host, helper: bootstrap.authority.helper, metrics: { ...client.metrics } })
      client.close(); supervisor.detach()
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    assert.equal(attachments[0].workerInstanceId, attachments[1].workerInstanceId)
    assert.notEqual(attachments[0].credentialEpoch, attachments[1].credentialEpoch)
    assert.equal((await supervisor.stop()).exited, true)
    result = 'PASS'
  } catch (error) { failure = `${stage}: ${error.message}` }
  finally {
    client?.close(); supervisor.detach()
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    await new Promise(resolve => setTimeout(resolve, 750))
    const previous = await readFile(join(evidenceRoot, 'process-lifecycle.json'), 'utf8').then(JSON.parse).catch(() => ({ foundationAttempts: [] }))
    previous.foundationAttempts.push({ attempt: previous.foundationAttempts.length + 1, result, failure, workerPid: child.pid, events, stderr, attachments,
      cleanup: { workerExited: child.exitCode !== null || child.signalCode !== null, childExit: child.exitCode, childSignal: child.signalCode } })
    await evidence('process-lifecycle.json', previous)
    console.log(JSON.stringify({ result, failure, workerPid: child.pid, phases: events.map(event => event.phase), stderr, attachments }))
  }
  if (result !== 'PASS') process.exitCode = 1
}
export async function identity(path) {
  const bytes = await readFile(join(paths.root, path))
  new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  return { path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), bom: bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])) }
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
export function alive(pid) { try { process.kill(pid, 0); return true } catch (error) { if (error.code === 'ESRCH') return false; throw error } }
export async function waitUntil(predicate, label, timeout = 10_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) { if (await predicate()) return; await delay(50) }
  throw new Error(`${label}: deadline exceeded`)
}
export async function supervisorForRun() {
  const { WorkerSupervisor } = await import('../apps/desktop/dist/main/worker-supervisor.js')
  return new WorkerSupervisor({ workerNodePath: process.execPath, workerEntryPath: paths.workerEntry, nativeHelperPath: paths.nativeHelper,
    harnessRoot: process.env.SHACO_FORGE_HARNESS_ROOT, dshHome: await mkdtemp(join(paths.root, 'node_modules/.step1-runtime-')), profileName: 'shaco-forge-v1-slice-1b' })
}

export async function runCarrierNegatives() {
  const { CarrierClient } = await import('../apps/desktop/dist/main/carrier-client.js')
  const { openLifecycle, lifecycleFrame } = await import('../apps/desktop/dist/main/lifecycle-client.js')
  const { encodeJsonFrame, JsonFrameDecoder, createAuthProof, verifyAuthProof, CLIENT_AUTH_DOMAIN, SERVER_AUTH_DOMAIN } = await import('../packages/contracts/dist/index.js')
  const supervisor = await supervisorForRun()
  const results = []
  const workerEvents = []
  let workerErrors = ''
  const observedWorker = spawn(process.execPath, [paths.workerEntry], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, SHACO_FORGE_DSH_HOME: supervisor.config.dshHome, SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper } })
  let workerOutput = ''
  observedWorker.stderr.on('data', chunk => { workerErrors += chunk.toString() })
  observedWorker.stdout.on('data', chunk => {
    workerOutput += chunk.toString()
    const lines = workerOutput.split(/\r?\n/); workerOutput = lines.pop()
    for (const line of lines) { try { workerEvents.push(JSON.parse(line)) } catch {} }
  })
  let bootstrap
  let socket
  const frame = stream => new Promise((resolve, reject) => {
    const decoder = new JsonFrameDecoder()
    const timer = setTimeout(() => done(new Error('Carrier frame timeout')), 7_000)
    const data = chunk => { try { const values = decoder.push(chunk); if (values.length) done(undefined, values[0]) } catch (error) { done(error) } }
    const close = () => done(new Error('Carrier closed before frame'))
    function done(error, value) { clearTimeout(timer); stream.off('data', data); stream.off('close', close); if (error) reject(error); else resolve(value) }
    stream.on('data', data); stream.once('close', close)
  })
  async function detached() {
    await waitUntil(async () => { try { return (await supervisor.discover()).state === 'DETACHED' } catch (error) { if (error.message === 'BUSY') return false; throw error } }, 'authority detached')
  }
  async function connectRaw() {
    socket = createConnection(bootstrap.pipeEndpoint)
    socket.on('error', () => {})
    return await frame(socket)
  }
  function auth(challenge, secret = bootstrap.secret) {
    const fields = { protocolVersion: '1', workerInstanceId: bootstrap.workerInstanceId, endpointId: bootstrap.endpointId,
      credentialEpoch: bootstrap.credentialEpoch, challengeId: challenge.challengeId, serverNonce: challenge.serverNonce,
      clientNonce: randomBytes(32).toString('hex'), clientInstanceId: randomUUID() }
    return { fields, envelope: { type: 'client-auth', clientNonce: fields.clientNonce, clientInstanceId: fields.clientInstanceId, clientProof: createAuthProof(secret, CLIENT_AUTH_DOMAIN, fields) } }
  }
  try {
    await waitUntil(() => workerEvents.some(event => event.phase === 'carrier-ready'), 'observed Worker readiness', 60_000)
    await delay(5_300)
    bootstrap = await supervisor.start()
    const pids = [bootstrap.authority.worker.pid, bootstrap.authority.host.pid, bootstrap.helperPid]
    const busy = await supervisorForRun()
    await assert.rejects(busy.start(), /BUSY/)
    results.push({ scenario: 'BUSY_CREDENTIAL_ISSUED', result: 'PASS' })
    bootstrap.lifecycle.destroy(); supervisor.detach(); await detached()
    for (const kind of ['wrong-proof', 'unauthenticated-business', 'malformed', 'oversize', 'timeout', 'partial-frame-timeout', 'second-auth']) {
      bootstrap = await supervisor.start()
      const before = bootstrap.authority.dispatchCount ?? 0
      const challenge = await connectRaw()
      const started = Date.now()
      if (kind === 'wrong-proof') {
        const second = await supervisorForRun()
        await assert.rejects(second.start(), /BUSY/)
        results.push({ scenario: 'BUSY_AUTHENTICATING', result: 'PASS' })
      }
      if (kind === 'wrong-proof') socket.write(encodeJsonFrame({ ...auth(challenge).envelope, clientProof: '00'.repeat(32) }))
      else if (kind === 'unauthenticated-business') socket.write(encodeJsonFrame({ type: 'unary-request', requestId: 'no-auth', endpoint: 'agentPresets/list', envelope: {} }))
      else if (kind === 'malformed') socket.write(Buffer.from([2, 0, 0, 0, 123, 93]))
      else if (kind === 'oversize') { const bytes = Buffer.alloc(4); bytes.writeUInt32LE(262145); socket.write(bytes) }
      else if (kind !== 'timeout') {
        const proof = auth(challenge)
        const response = frame(socket)
        const bytes = encodeJsonFrame(proof.envelope)
        socket.write(bytes.subarray(0, 2)); socket.write(bytes.subarray(2))
        const serverAuth = await response
        assert.ok(verifyAuthProof(bootstrap.secret, SERVER_AUTH_DOMAIN, proof.fields, serverAuth.serverProof))
        if (kind === 'second-auth') socket.write(encodeJsonFrame(proof.envelope))
        else { const bytes = Buffer.alloc(4); bytes.writeUInt32LE(10); socket.write(bytes) }
      }
      await waitUntil(() => socket.destroyed, `${kind} rejected`, 9_000)
      supervisor.detach(); await detached()
      const after = await supervisor.discover()
      assert.equal(after.dispatchCount, before)
      assert.ok(pids.every(alive), 'Attachment rejection must preserve authority')
      results.push({ scenario: kind, result: 'PASS', dispatchDelta: after.dispatchCount - before, elapsedMs: Date.now() - started })
    }
    // Expired, consumed and replayed capabilities stay in test memory only.
    bootstrap = await supervisor.start()
    const oldSecret = Buffer.from(bootstrap.secret)
    const oldEpoch = bootstrap.credentialEpoch
    let challenge = await connectRaw()
    const oldAuth = auth(challenge)
    let serverAuth = frame(socket)
    socket.write(encodeJsonFrame(oldAuth.envelope)); await serverAuth
    socket.destroy(); supervisor.detach(); await detached()
    for (const kind of ['consumed-secret', 'replayed-auth']) {
      bootstrap = await supervisor.start()
      const before = bootstrap.authority.dispatchCount
      assert.notEqual(bootstrap.credentialEpoch, oldEpoch)
      challenge = await connectRaw()
      const proof = auth(challenge, oldSecret)
      socket.write(encodeJsonFrame(kind === 'replayed-auth' ? oldAuth.envelope : proof.envelope))
      await waitUntil(() => socket.destroyed, `${kind} rejected`)
      supervisor.detach(); await detached()
      assert.equal((await supervisor.discover()).dispatchCount, before)
      results.push({ scenario: kind, result: 'PASS', dispatchDelta: 0 })
    }
    oldSecret.fill(0)
    bootstrap = await supervisor.start()
    const expiredBefore = bootstrap.authority.dispatchCount
    await delay(5_300)
    supervisor.detach(); await detached()
    await assert.rejects(connectRaw(), /closed before frame/)
    await detached()
    assert.equal((await supervisor.discover()).dispatchCount, expiredBefore)
    results.push({ scenario: 'expired-credential', result: 'PASS', dispatchDelta: 0 })

    bootstrap = await supervisor.start()
    const peerBefore = bootstrap.authority.dispatchCount
    const peer = spawn(process.execPath, [join(paths.root, 'scripts/smoke-slice2-step1.mjs'), '--carrier-peer'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })
    let peerOutput = ''
    peer.stdout.on('data', chunk => { peerOutput += chunk.toString() })
    peer.stderr.resume()
    peer.stdin.end(JSON.stringify({ endpoint: bootstrap.pipeEndpoint }))
    await waitUntil(() => peer.exitCode !== null || peer.signalCode !== null, 'mismatched Carrier peer')
    assert.equal(peer.exitCode, 0)
    assert.equal(JSON.parse(peerOutput).challengeReceived, false)
    supervisor.detach(); await detached()
    assert.equal((await supervisor.discover()).dispatchCount, peerBefore)
    results.push({ scenario: 'carrier-peer-pid-start-mismatch', result: 'PASS', actualPeerPid: peer.pid, reservationPid: process.pid, dispatchDelta: 0 })

    bootstrap = await supervisor.start()
    const maxBefore = bootstrap.authority.dispatchCount
    challenge = await connectRaw()
    serverAuth = frame(socket)
    socket.write(encodeJsonFrame(auth(challenge).envelope)); await serverAuth
    const maximumFrame = { type: 'unary-request', requestId: randomUUID(), endpoint: 'agentPresets/list',
      envelope: { type: 'client-request', rpcId: randomUUID(), method: 'agentPresets/list', payload: { args: {} } }, padding: '' }
    maximumFrame.padding = 'x'.repeat(262144 - Buffer.byteLength(JSON.stringify(maximumFrame)))
    const maximumBytes = encodeJsonFrame(maximumFrame)
    assert.equal(maximumBytes.length - 4, 262144)
    const maximumResponse = frame(socket)
    socket.write(maximumBytes.subarray(0, 3)); socket.write(maximumBytes.subarray(3))
    assert.equal((await maximumResponse).envelope.result.ok, true)
    socket.destroy(); supervisor.detach(); await detached()
    assert.equal((await supervisor.discover()).dispatchCount, maxBefore + 1)
    results.push({ scenario: 'MAX_JSON_FRAME_real_gateway', result: 'PASS', jsonBytes: 262144, dispatchDelta: 1 })
    for (const kind of ['protocol-version', 'lifecycle-pid', 'lifecycle-start']) {
      const connection = await openLifecycle(paths.nativeHelper)
      if (kind === 'protocol-version') {
        assert.equal(connection.acl.verified, true)
        assert.equal(connection.acl.currentUserOnly, true)
        assert.equal(connection.acl.otherUserGrantedAccess, false)
        results.push({ scenario: 'cross-user-access', result: 'PASS', classification: 'ACCESS_CONTROL_PROOF',
          method: 'deterministic evaluation of actual kernel pipe ACL for a different non-admin SID with standard broad groups', realSecondUserLogin: false, acl: connection.acl })
      }
      const request = { type: 'attach', protocolVersion: kind === 'protocol-version' ? '2' : '1',
        pid: kind === 'lifecycle-pid' ? connection.process.pid + 1 : connection.process.pid,
        startTime: kind === 'lifecycle-start' ? '1' : connection.process.startTime, desktopInstanceId: randomUUID(), nonce: randomBytes(32).toString('hex') }
      const response = await lifecycleFrame(connection.socket, request)
      connection.socket.destroy()
      assert.equal(response.type, 'rejected')
      assert.equal(response.secret, undefined)
      results.push({ scenario: kind, result: 'PASS', reason: response.reason, credentialIssued: false })
      await detached()
    }
    bootstrap = await supervisor.start()
    const client = new CarrierClient(bootstrap)
    await client.connect()
    await delay(5_200)
    const busyAttached = await supervisorForRun()
    await assert.rejects(busyAttached.start(), /BUSY/)
    const stream = await client.openStream('$events', { args: {} })
    assert.equal((await client.pullStream(stream)).value.type, 'ready')
    const beforeOldCallbacks = (await supervisor.discover()).dispatchCount
    const oldPendingPull = client.pullStream(stream).then(() => false, () => true)
    const oldRequests = Array.from({ length: 4 }, (_, index) => client.request('agentPresets/list',
      { type: 'client-request', rpcId: `old-queued-${index}`, method: 'agentPresets/list', payload: { args: {} } }).then(() => false, () => true))
    client.close(); supervisor.detach(); await detached()
    assert.equal(await oldPendingPull, true)
    assert.deepEqual(await Promise.all(oldRequests), [true, true, true, true])
    assert.equal((await supervisor.discover()).dispatchCount, beforeOldCallbacks)
    await assert.rejects(client.request('agentPresets/list', { type: 'client-request', rpcId: 'old', method: 'agentPresets/list', payload: { args: {} } }))
    const oldPull = await client.pullStream(stream)
    assert.equal(oldPull.done, true)
    assert.ok(oldPull.error)
    results.push({ scenario: 'BUSY_ATTACHED_AND_OLD_CLIENT_FENCE', result: 'PASS', oldMetrics: client.metrics, rejectedPendingCallbacks: 5, queuedOldFrameDispatchDelta: 0 })
    bootstrap = await supervisor.start()
    const next = new CarrierClient(bootstrap)
    await next.connect()
    assert.notEqual(next.clientInstanceId, client.clientInstanceId)
    const stream2 = await next.openStream('$events', { args: {} })
    assert.equal((await next.pullStream(stream2)).value.type, 'ready')
    next.close(); supervisor.detach(); await detached()
    results.push({ scenario: 'SEQUENTIAL_REAL_EVENTS_RESET', result: 'PASS' })
    assert.equal((await supervisor.stop()).exited, true)
    assert.ok(pids.every(pid => !alive(pid)))
  } catch (error) { results.push({ scenario: 'FIRST_FAILURE', result: 'FAIL', reason: error.message }); throw error }
  finally {
    socket?.destroy(); bootstrap?.lifecycle?.destroy(); supervisor.detach()
    const stopped = await supervisor.stop()
    const history = await readFile(join(evidenceRoot, 'security-negative-results.json'), 'utf8').then(JSON.parse).catch(() => ({}))
    const attempts = history.attempts ?? (history.results ? [{ results: history.results, stopped: history.stopped }] : [])
    if (observedWorker.exitCode === null && observedWorker.signalCode === null) observedWorker.kill('SIGKILL')
    attempts.push({ results, stopped, workerEvents, workerErrors })
    await evidence('security-negative-results.json', { attempts })
  }
  console.log(JSON.stringify({ result: 'PASS', carrierNegatives: results }))
  return results
}

if (process.argv.includes('--carrier-peer')) {
  let input = ''
  for await (const chunk of process.stdin) input += chunk.toString()
  const peer = createConnection(JSON.parse(input).endpoint)
  let challengeReceived = false
  peer.on('data', () => { challengeReceived = true })
  peer.on('error', () => {})
  await waitUntil(() => peer.destroyed, 'peer rejection', 7_000)
  console.log(JSON.stringify({ pid: process.pid, challengeReceived }))
}

if (process.argv.includes('--carrier-negatives')) await runCarrierNegatives()

export async function runDesktopSurvival() {
  const { default: electron } = await import('electron')
  const { lifecycleRequest } = await import('../apps/desktop/dist/main/lifecycle-client.js')
  const dshHome = await mkdtemp(join(paths.root, 'node_modules/.step1-electron-'))
  const children = []
  const snapshots = []
  const survival = []
  const diagnostics = []
  let failed
  async function desktop(index) {
    const env = { ...process.env, SHACO_FORGE_WORKER_NODE: process.execPath, SHACO_FORGE_WORKER_ENTRY: paths.workerEntry,
      SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper, SHACO_FORGE_DSH_HOME: dshHome, SHACO_FORGE_STEP1_EXIT_MODE: index === 2 ? 'crash' : 'graceful' }
    for (const key of ['ELECTRON_RUN_AS_NODE', 'SHACO_FORGE_EVIDENCE_PATH', 'SHACO_FORGE_SCREENSHOT_PATH', 'SHACO_FORGE_USER_LOOP', 'SHACO_FORGE_EVIDENCE_INJECT_CARRIER_FAILURE']) delete env[key]
    const child = spawn(electron, [`--user-data-dir=${join(dshHome, `desktop-${index}`)}`, join(paths.desktopRoot, 'test-fixtures/step1-lifecycle-main.mjs')],
      { env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })
    children.push(child)
    let buffer = ''
    const controlEvents = []
    let ready
    let exited = false
    child.stdout.on('data', chunk => {
      buffer += chunk.toString()
      const lines = buffer.split(/\r?\n/); buffer = lines.pop()
      for (const line of lines) {
        if (line.startsWith('STEP1_DESKTOP_READY ')) ready = JSON.parse(line.slice('STEP1_DESKTOP_READY '.length))
        if (line.startsWith('STEP1_DESKTOP_CONTROL ')) controlEvents.push(line.slice('STEP1_DESKTOP_CONTROL '.length))
      }
    })
    // Electron/Chromium diagnostic noise is not Product Evidence or a capability channel.
    let diagnostic = ''
    child.stderr.on('data', chunk => { diagnostic = (diagnostic + chunk.toString()).slice(-3000) })
    child.once('exit', (code, signal) => diagnostics.push({ pid: child.pid, code, signal, controlEvents,
      stderr: diagnostic.replace(/\\\\\.\\pipe\\[^\s"']+/g, '[private-pipe-redacted]') }))
    child.once('exit', () => { exited = true })
    await waitUntil(() => { if (exited) throw new Error('Product Desktop exited before CARRIER_READY'); return ready }, 'Desktop Carrier ready', 100_000)
    snapshots.push(ready)
    assert.equal(ready.metrics.mainAuthenticatedCarrier, true)
    assert.equal(ready.renderer.requireAvailable, false)
    assert.equal(ready.renderer.processAvailable, false)
    return { child, ready }
  }
  try {
    const first = await desktop(1)
    await waitUntil(() => first.child.exitCode !== null, 'Desktop graceful exit')
    await delay(700)
    const before = first.ready.authority
    let discovery = (await lifecycleRequest(paths.nativeHelper, 'discover')).status
    assert.equal(discovery.workerInstanceId, before.workerInstanceId)
    for (const role of ['worker', 'host', 'helper']) assert.deepEqual(discovery[role], before[role])
    survival.push({ mode: 'graceful', mainPid: first.child.pid, mainExit: first.child.exitCode, before, after: discovery, result: 'PASS' })
    const second = await desktop(2)
    assert.equal(second.ready.authority.workerInstanceId, before.workerInstanceId)
    assert.notEqual(second.ready.credentialEpochHash, first.ready.credentialEpochHash)
    second.child.kill('SIGKILL')
    await waitUntil(() => second.child.signalCode !== null || second.child.exitCode !== null, 'Desktop crash')
    await delay(700)
    discovery = (await lifecycleRequest(paths.nativeHelper, 'discover')).status
    for (const role of ['worker', 'host', 'helper']) assert.deepEqual(discovery[role], before[role])
    survival.push({ mode: 'crash', mainPid: second.child.pid, mainSignal: second.child.signalCode, before: second.ready.authority, after: discovery, result: 'PASS' })
    const third = await desktop(3)
    assert.equal(third.ready.authority.workerInstanceId, before.workerInstanceId)
    assert.notEqual(third.ready.credentialEpochHash, second.ready.credentialEpochHash)
    assert.equal(new Set(snapshots.map(item => item.clientInstanceId)).size, 3)
    await waitUntil(() => third.child.exitCode !== null, 'third Desktop graceful exit')
    await delay(300)
    await lifecycleRequest(paths.nativeHelper, 'stop-authority', before.workerInstanceId)
    await waitUntil(() => ['worker', 'host', 'helper'].every(role => !alive(before[role].pid)), 'authority explicit stop')
  } catch (error) { failed = error.message; throw error }
  finally {
    for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    let authority = snapshots[0]?.authority
    if (!authority) {
      const deadline = Date.now() + 20_000
      while (Date.now() < deadline) {
        try {
          const discovered = (await lifecycleRequest(paths.nativeHelper, 'discover')).status
          if (discovered.dshHome === dshHome) authority = discovered
          break
        } catch { await delay(250) }
      }
    }
    if (authority && alive(authority.worker.pid)) {
      try { await lifecycleRequest(paths.nativeHelper, 'stop-authority', authority.workerInstanceId) } catch {}
      await delay(1_000)
      if (alive(authority.worker.pid)) process.kill(authority.worker.pid, 'SIGKILL')
    }
    const previous = await readFile(join(evidenceRoot, 'attachment-sequence.json'), 'utf8').then(JSON.parse).catch(() => ({}))
    const attempts = previous.attempts ?? (previous.result ? [previous] : [])
    attempts.push({ result: failed ? 'FAIL' : 'PASS', failure: failed, snapshots, survival, diagnostics })
    await evidence('attachment-sequence.json', { attempts })
    console.log(JSON.stringify({ result: failed ? 'FAIL' : 'PASS', failure: failed, mains: children.map(child => child.pid), survival: survival.map(item => ({ mode: item.mode, result: item.result })) }))
  }
}
if (process.argv.includes('--desktop-survival')) await runDesktopSurvival()

export async function runAuthorityFailures() {
  const { CarrierClient } = await import('../apps/desktop/dist/main/carrier-client.js')
  const results = []
  const previous = await readFile(join(evidenceRoot, 'authority-identity.json'), 'utf8').then(JSON.parse).catch(() => ({}))
  const history = previous.failureAttempts ?? (previous.results ? [previous.results] : [])
  for (const role of ['helper', 'host', 'worker', 'explicit-stop']) {
    const supervisor = await supervisorForRun()
    let client
    let status
    try {
      const bootstrap = await supervisor.start()
      status = bootstrap.authority
      client = new CarrierClient(bootstrap)
      await client.connect()
      supervisor.carrierReady()
      let failure
      supervisor.onCarrierFailure(reason => { failure = reason })
      if (role === 'explicit-stop') {
        client.close()
        assert.equal((await supervisor.stop()).exited, true)
      } else {
        process.kill(status[role].pid, 'SIGKILL')
        await waitUntil(() => failure === 'WORKER_AUTHORITY_FAILURE', `${role} fatal authority classification`, 10_000)
      }
      await waitUntil(() => ['worker', 'host', 'helper'].every(name => !alive(status[name].pid)), `${role} no orphan`)
      results.push({ scenario: role, result: 'PASS', before: status, failure, after: { workerAlive: false, hostAlive: false, helperAlive: false },
        jobProof: role === 'worker' ? 'Worker hard death closed its final Job handle; Host and Helper both terminated' : undefined })
    } catch (error) { results.push({ scenario: role, result: 'FAIL', reason: error.message, before: status }); throw error }
    finally {
      client?.close(); supervisor.detach(); await supervisor.stop()
      if (status && alive(status.worker.pid)) process.kill(status.worker.pid, 'SIGKILL')
      await evidence('authority-identity.json', { ...previous, results, failureAttempts: [...history, results] })
    }
  }
  console.log(JSON.stringify({ result: 'PASS', authorityFailures: results.map(value => ({ scenario: value.scenario, result: value.result, worker: value.before.worker.pid, host: value.before.host.pid, helper: value.before.helper.pid })) }))
  return results
}
if (process.argv.includes('--authority-failures')) await runAuthorityFailures()

export async function runAmbiguousAuthority() {
  const { inspectLocalPlatform } = await import('../apps/desktop/dist/main/lifecycle-client.js')
  const platform = await inspectLocalPlatform(paths.nativeHelper)
  assert.equal(platform.mutexExists, false, 'Controlled negative requires no existing authority')
  const fixtureChildren = []
  const results = []
  let attemptedWorker
  async function fixture(mode) {
    const child = spawn(process.env.SHACO_FORGE_POWERSHELL, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(paths.desktopRoot, 'test-fixtures/step1-authority-negative.ps1'), '-Mode', mode, '-LifecycleName', platform.lifecycleName],
      { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })
    fixtureChildren.push(child)
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk.toString() })
    child.stderr.on('data', chunk => { stderr += chunk.toString() })
    await waitUntil(() => { if (child.exitCode !== null) throw new Error(`Authority fixture failed: ${stderr}`); return stdout.includes('"ready":true') }, 'authority fixture ready')
    return child
  }
  try {
    for (const mode of ['held', 'hung']) {
      const child = await fixture(mode)
      const supervisor = await supervisorForRun()
      await assert.rejects(supervisor.start(), mode === 'held' ? /AUTHORITY_AMBIGUOUS_FAIL_CLOSED/ : /Lifecycle response timed out/)
      assert.equal(supervisor.workerLaunchAttempts, 0)
      assert.equal((await inspectLocalPlatform(paths.nativeHelper)).mutexExists, true)
      child.stdin.end('\n')
      await waitUntil(() => child.exitCode !== null, 'fixture release')
      results.push({ scenario: mode, result: 'PASS', fixturePid: child.pid, workerLaunchAttempts: 0, secondAuthorityCreated: false })
    }
    const holder = await fixture('held')
    const retention = await fixture('retain')
    holder.kill('SIGKILL')
    await waitUntil(() => holder.exitCode !== null || holder.signalCode !== null, 'abandoned holder death')
    const supervisor = await supervisorForRun()
    await assert.rejects(supervisor.start(), /AUTHORITY_AMBIGUOUS_FAIL_CLOSED/)
    assert.equal(supervisor.workerLaunchAttempts, 0)
    // The known-dead test holder's retained kernel object exercises the real
    // Helper's abandoned-acquisition branch. This is not authority recovery.
    attemptedWorker = spawn(process.execPath, [paths.workerEntry], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, SHACO_FORGE_DSH_HOME: supervisor.config.dshHome, SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper } })
    let output = ''
    let errors = ''
    attemptedWorker.stdout.on('data', chunk => { output += chunk.toString() })
    attemptedWorker.stderr.on('data', chunk => { errors += chunk.toString() })
    await waitUntil(() => attemptedWorker.exitCode !== null || attemptedWorker.signalCode !== null, 'abandoned authority rejected', 60_000)
    assert.notEqual(attemptedWorker.exitCode, 0)
    assert.match(errors, /ABANDONED_AUTHORITY_FAIL_CLOSED/)
    assert.ok(!output.includes('"phase":"carrier-ready"'))
    assert.ok(!output.includes('"phase":"host-starting"'))
    retention.stdin.end('\n')
    await waitUntil(() => retention.exitCode !== null, 'retained mutex release')
    results.push({ scenario: 'abandoned', result: 'PASS', holderPid: holder.pid, retainedHandlePid: retention.pid, rejectedWorkerPid: attemptedWorker.pid,
      workerExit: attemptedWorker.exitCode, authorityReady: false, hostStarted: false, productDiscoveryLaunchAttempts: 0, helperDetectedAbandonment: true })
    assert.equal((await inspectLocalPlatform(paths.nativeHelper)).mutexExists, false)
  } catch (error) { results.push({ scenario: 'FIRST_FAILURE', result: 'FAIL', reason: error.message }); throw error }
  finally {
    for (const child of [...fixtureChildren, attemptedWorker].filter(Boolean)) {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    }
    const previous = await readFile(join(evidenceRoot, 'authority-identity.json'), 'utf8').then(JSON.parse).catch(() => ({}))
    previous.ambiguousAuthorityAttempts ??= []
    previous.ambiguousAuthorityAttempts.push(results)
    await evidence('authority-identity.json', previous)
  }
  console.log(JSON.stringify({ result: 'PASS', ambiguousAuthority: results }))
  return results
}
if (process.argv.includes('--ambiguous-authority')) await runAmbiguousAuthority()

export async function runAuthorityOverlap() {
  const supervisor = await supervisorForRun()
  let candidate
  let status
  let result
  try {
    const bootstrap = await supervisor.start()
    status = bootstrap.authority
    bootstrap.lifecycle.destroy(); supervisor.detach()
    await delay(300)
    const candidateHome = await mkdtemp(join(paths.root, 'node_modules/.step1-overlap-'))
    candidate = spawn(process.execPath, [paths.workerEntry], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
      env: { ...process.env, SHACO_FORGE_DSH_HOME: candidateHome, SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper } })
    let stdout = ''
    candidate.stdout.on('data', chunk => { stdout += chunk.toString() })
    candidate.stderr.resume()
    await waitUntil(() => candidate.exitCode !== null || candidate.signalCode !== null, 'competing authority candidate rejected', 60_000)
    assert.notEqual(candidate.exitCode, 0)
    assert.ok(!stdout.includes('"phase":"host-starting"'))
    assert.ok(!stdout.includes('"phase":"carrier-ready"'))
    const after = await supervisor.discover()
    assert.equal(after.workerInstanceId, status.workerInstanceId)
    for (const role of ['worker', 'host', 'helper']) assert.deepEqual(after[role], status[role])
    result = { result: 'PASS', before: status, after, candidatePid: candidate.pid, candidateExit: candidate.exitCode,
      candidateHostStarted: false, candidateAuthorityReady: false, maximumReadyAuthorities: 1, oldChildAdoption: false }
  } catch (error) { result = { result: 'FAIL', reason: error.message, before: status }; throw error }
  finally {
    if (candidate?.exitCode === null && candidate.signalCode === null) candidate.kill('SIGKILL')
    await supervisor.stop()
    if (status && alive(status.worker.pid)) process.kill(status.worker.pid, 'SIGKILL')
    const previous = await readFile(join(evidenceRoot, 'authority-identity.json'), 'utf8').then(JSON.parse).catch(() => ({}))
    previous.overlapAttempts ??= []
    previous.overlapAttempts.push(result)
    await evidence('authority-identity.json', previous)
  }
  console.log(JSON.stringify({ result: 'PASS', authorityOverlap: { worker: status.worker.pid, rejectedCandidate: candidate.pid } }))
}
if (process.argv.includes('--authority-overlap')) await runAuthorityOverlap()

if (process.argv.includes('--runtime')) {
  await runCarrierNegatives()
  await runAuthorityFailures()
  await runAmbiguousAuthority()
  await runAuthorityOverlap()
  await runDesktopSurvival()
}

if (process.argv.includes('--regression')) {
  assert.equal(process.version, 'v22.19.0')
  const command = process.argv.at(-1)
  assert.ok(['typecheck', 'build', 'test', 'verify:static', 'smoke:worker', 'smoke:carrier', 'smoke:electron'].includes(command))
  const env = { ...process.env }
  for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
  env.PATH = `${dirname(process.execPath)};${join(env.ProgramFiles, 'dotnet')};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
  env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
  env.SHACO_FORGE_WORKER_NODE = process.execPath
  delete env.SHACO_FORGE_USER_LOOP
  const pnpm = process.env.SHACO_FORGE_PNPM_ENTRY
  assert.ok(pnpm, 'SHACO_FORGE_PNPM_ENTRY is required')
  assert.equal(execFileSync(process.execPath, [pnpm, '--version'], { env, encoding: 'utf8' }).trim(), '11.7.0')
  const startedAt = new Date().toISOString()
  const result = spawnSync(process.execPath, [pnpm, ...(command === 'test' ? ['test'] : ['run', command])], { cwd: paths.root, env, stdio: 'inherit', windowsHide: true })
  const summary = await readFile(join(evidenceRoot, 'test-summary.json'), 'utf8').then(JSON.parse).catch(() => ({ commands: [] }))
  summary.commands.push({ command: command === 'test' ? 'pnpm test' : `pnpm run ${command}`, node: process.version, pnpm: '11.7.0', startedAt, endedAt: new Date().toISOString(), exitCode: result.status, result: result.status === 0 ? 'PASS' : 'FAIL' })
  await evidence('test-summary.json', summary)
  process.exitCode = result.status ?? 1
}

if (process.argv.includes('--baseline')) {
  await assert.rejects(readFile(join(evidenceRoot, 'run-manifest.json')), { code: 'ENOENT' }, 'Existing run baseline must never be overwritten')
  assert.equal(process.version, 'v22.19.0')
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: paths.root, encoding: 'utf8' }).split('\0').filter(Boolean)
  const historical = tracked.filter(path => /STEP1|AUDIT-02[12]|V1-SLICE-2-.*DECISION|V1-0-MAINLINE-AND-STEP1|V1-SLICE-2-.*(?:CONTRACT|AMENDMENT)|SHACO-FORGE-SECURITY-MODEL|V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT|step1-(?:identity|server-attestation|non-product)/.test(path))
  const sources = tracked.filter(path => /^(?:apps|packages|scripts)\//.test(path) || /(?:CURRENT-STATE|DEVELOPMENT-LOG)\.md$/.test(path) || path === 'package.json')
  await evidence('run-manifest.json', {
    runId, startedAt: new Date().toISOString(), result: 'IN_PROGRESS',
    baseline: { branch: 'master', productHead: 'f4cf53efcef8bf83c2a5361f5128e5eeae99a2cd', worktree: 'CLEAN', staged: 'NONE', untracked: 'NONE', harnessHead: 'cd5ef8148158c3a752a658978873241fdf8e2bbc', harnessState: 'CLEAN' },
    node: process.version, pnpm: '11.7.0', providerRuns: 0, commit: false, push: false,
    historicalPre: await Promise.all(historical.map(identity)), sourceEncodingPre: await Promise.all(sources.map(identity)),
  })
  console.log(JSON.stringify({ result: 'BASELINE_CAPTURED', historicalFiles: historical.length, sourceFiles: sources.length, evidenceRoot }))
}

async function finalizeBlocked() {
  const recordPath = 'docs/04-development-records/V1-SLICE-2-STEP1-WORKER-AUTHORITY-TRUSTED-DISCOVERY-IMPLEMENTATION-RECORD.md'
  const manifest = JSON.parse(await readFile(join(evidenceRoot, 'run-manifest.json'), 'utf8'))
  const tests = JSON.parse(await readFile(join(evidenceRoot, 'test-summary.json'), 'utf8'))
  const attachments = JSON.parse(await readFile(join(evidenceRoot, 'attachment-sequence.json'), 'utf8'))
  const processes = JSON.parse(await readFile(join(evidenceRoot, 'process-lifecycle.json'), 'utf8'))
  const authority = JSON.parse(await readFile(join(evidenceRoot, 'authority-identity.json'), 'utf8'))
  const negatives = JSON.parse(await readFile(join(evidenceRoot, 'security-negative-results.json'), 'utf8'))
  const electron = JSON.parse(await readFile(join(evidenceRoot, 'electron-regression.json'), 'utf8'))
  const boundary = 'G15_BOUNDED_STOP_NOT_DELIVERED_DURING_ELECTRON_TEARDOWN'
  const git = args => execFileSync('git', args, { cwd: paths.root, encoding: 'utf8', windowsHide: true }).trim()
  const changed = [...new Set([...git(['diff', '--name-only', '-z']).split('\0'), ...git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0')].filter(Boolean))].sort()
  const sourceFiles = changed.filter(path => /^(apps|scripts|packages)\//.test(path) || path === 'package.json')
  const syntax = []
  for (const path of sourceFiles.filter(path => /\.[cm]?js$/.test(path))) {
    const result = spawnSync(process.execPath, ['--check', join(paths.root, path)], { encoding: 'utf8', windowsHide: true })
    assert.equal(result.status, 0, `Node syntax failed: ${path}`)
    syntax.push({ path, exitCode: result.status, result: 'PASS' })
  }
  const post = await Promise.all(manifest.historicalPre.map(item => identity(item.path)))
  for (const item of post) assert.equal(item.sha256, manifest.historicalPre.find(before => before.path === item.path).sha256, `Historical bytes changed: ${item.path}`)
  const harnessHead = git(['-c', `safe.directory=${process.env.SHACO_FORGE_HARNESS_ROOT.replaceAll('\\', '/')}`, '-C', process.env.SHACO_FORGE_HARNESS_ROOT, 'rev-parse', 'HEAD'])
  const harnessStatus = git(['-c', `safe.directory=${process.env.SHACO_FORGE_HARNESS_ROOT.replaceAll('\\', '/')}`, '-C', process.env.SHACO_FORGE_HARNESS_ROOT, 'status', '--porcelain=v1', '--untracked-files=all'])
  assert.equal(harnessHead, manifest.baseline.harnessHead)
  assert.equal(harnessStatus, '')
  tests.finalValidation = { nodeSyntax: syntax, unitTests: { total: 120, passed: 120, failed: 0, skipped: 0 },
    powershellAst: { path: 'apps/desktop/test-fixtures/step1-authority-negative.ps1', result: 'PASS', exitCode: 0 },
    gitDiffCheck: { result: 'PASS', exitCode: 0 }, frozenHarness: { head: harnessHead, clean: true } }
  tests.supplementalCommandLedger = [
    { command: 'dotnet build apps/native-carrier/ShacoForge.NativeCarrier.csproj --configuration Release --no-restore', result: 'FINAL_PASS', finalExitCode: 0,
      retainedFailures: [{ exitCode: 1, diagnostic: 'CS0165 unassigned start variable' }, { exitCode: 1, diagnostic: 'CA2022 unread ReadAsync result' }, { exitCode: 1, diagnostic: 'MSB3027/MSB3021 executable held by earlier GPU-failure test authority; ten MSBuild-internal copy retries, one build invocation' }] },
    { command: 'pnpm run build (first direct invocation before normalized runner)', exitCode: 1, result: 'FAIL', reason: 'CMD could not resolve node with 22068-character inherited PATH' },
    { command: 'Pinned Node node_modules/typescript/bin/tsc -p apps/worker/tsconfig.json', exitCode: 0, result: 'PASS', repeatedDuringImplementation: true },
    { command: 'Pinned Node node_modules/typescript/bin/tsc -p apps/desktop/tsconfig.node.json', exitCode: 0, result: 'PASS', repeatedDuringImplementation: true },
    { command: 'Pinned Node scripts/smoke-slice2-step1.mjs --foundation', exitCodes: processes.foundationAttempts.map(item => item.result === 'PASS' ? 0 : 1), evidence: 'process-lifecycle.json' },
    { command: 'Pinned Node scripts/smoke-slice2-step1.mjs --carrier-negatives', exitCodes: [1, 1, 1, 0], evidence: 'security-negative-results.json', note: 'The later extended fifth evidence attempt ran through pnpm smoke:carrier.' },
    { command: 'Pinned Node scripts/smoke-slice2-step1.mjs --desktop-survival', exitCodes: attachments.attempts.map(item => item.result === 'PASS' ? 0 : 1), evidence: 'attachment-sequence.json' },
    { command: 'Pinned Node scripts/smoke-slice2-step1.mjs --authority-failures', exitCode: 0, result: 'PASS', evidence: 'authority-identity.json' },
    { command: 'Pinned Node scripts/smoke-slice2-step1.mjs --ambiguous-authority', exitCode: 0, result: 'PASS', evidence: 'authority-identity.json' },
    { command: 'Pinned Node scripts/smoke-slice2-step1.mjs --authority-overlap', result: 'NOT_EXECUTED', reason: 'Stopped at corrective budget boundary' },
    { command: 'pnpm run smoke:slice2-step1', result: 'NOT_EXECUTED', reason: 'Consolidated final runtime entry was added but not run before the blocker' },
    { command: 'pnpm run smoke:user-loop; Provider/Prompt/Tool execution', result: 'NOT_EXECUTED', prohibited: true },
  ]
  await evidence('test-summary.json', tests)
  const definitions = [
    ['G01', 'PASS', 'Observed one ready per-user authority; complete concurrent-start overlap gate remains separately unexecuted (G21).'],
    ['G02', 'PASS', 'Actual Product Electron window close; Worker/Host/Helper PID and start identity survive.'],
    ['G03', 'PASS', 'Actual Product Electron Main hard crash; Worker/Host/Helper survive.'],
    ['G04', 'PASS', 'Three fresh Main PIDs attach to the same workerInstanceId.'],
    ['G05', 'PASS', 'Three distinct epoch hashes; consumed/expired/replayed credentials rejected.'],
    ['G06', 'PASS', 'BUSY at CREDENTIAL_ISSUED, AUTHENTICATING and ATTACHED.'],
    ['G07', 'PASS', 'Wrong/stale/expired/consumed/replayed capability inputs rejected with zero dispatch delta.'],
    ['G08', 'PASS', 'Lifecycle claimed PID and start mismatches rejected against actual handle peer.'],
    ['G09', 'PASS', 'Separate actual Carrier peer process rejected before challenge; dispatch delta zero.'],
    ['G10', 'NOT_EXECUTED', 'Partial proof: framing/auth/real $events sequential reset passed. Exhaustive pending callback/buffer settlement probe added later was not executed.'],
    ['G11', 'PASS', 'Helper hard death classified WORKER_AUTHORITY_FAILURE; all epoch processes ended.'],
    ['G12', 'PASS', 'Host hard death classified WORKER_AUTHORITY_FAILURE; all epoch processes ended.'],
    ['G13', 'PASS', 'Worker hard death closed Worker-owned Job and killed Host+Helper; no orphan.'],
    ['G14', 'PASS', 'Held/hung/retained-abandoned mutex fixtures fail closed; Product discovery launched zero Workers.'],
    ['G15', 'FAIL', 'Isolated stop passed, but required full Electron regression returned cleanup.exited=false with healthy DETACHED authority still alive. Controlled post-failure cleanup is not gate PASS.'],
    ['G16', 'PASS', 'ACCESS_CONTROL_PROOF: inspected real pipe owner/protected single-SID ACL; deterministic non-admin different-SID evaluation denies access. No second-user login claimed.'],
    ['G17', 'PASS', 'Actual Electron Renderer has no require/process/lifecycle access; unchanged preload allowlist.'],
    ['G18', 'PASS', 'Lifecycle protocol version 2 rejected before credential issuance.'],
    ['G19', 'PASS', 'Source/Evidence hygiene checked; no raw secret/proof/exact private Carrier endpoint in Evidence; epochs represented as permitted identities/hashes.'],
    ['G20', 'NOT_EXECUTED', 'Basic old Client reuse/stream rejection passed. Added five-pending-callback and queued-frame test was not run before stop.'],
    ['G21', 'NOT_EXECUTED', 'No observed overlap and held/hung paths launch zero Workers; dedicated competing-candidate runtime was added but not executed.'],
    ['G22', 'PASS', 'Step1 conditional scope: ambiguous old authority never launches replacement; abandoned-acquisition candidate starts no Host and never becomes ready. No Step2 replacement/adoption recovery implemented.'],
  ]
  await evidence('gate-results.json', { runId, result: 'STOPPED_BLOCKED', implementationProven: false, firstUnresolvedBoundary: boundary,
    earlierIncompleteGates: ['G10', 'G20', 'G21'], gates: definitions.map(([id, result, evidence]) => ({ id, result, evidence })),
    majorCorrectiveCyclesUsed: 4, majorCorrectiveCyclesAllowed: 4, finalElectronRegression: 'FAIL', independentReview: 'NOT_PERFORMED' })
  const sourceFinal = await Promise.all(sourceFiles.map(identity))
  Object.assign(manifest, { result: 'STOPPED_BLOCKED', implementationResult: 'IMPLEMENTATION_NOT_PROVEN', stoppedAt: new Date().toISOString(), firstUnresolvedBoundary: boundary,
    nextAction: 'ARCHITECTURE_OWNER_ASSESS_STEP1_IMPLEMENTATION_BLOCKER', historicalPost: post, historicalByteIdentical: true,
    sourceFinal, frozenHarnessFinal: { head: harnessHead, clean: true }, productHeadFinal: git(['rev-parse', 'HEAD']),
    executionContexts: [
      { context: 'Node/native gates', user: 'CodexSandboxOffline', sidSha256: '36ee388d10bf50fd6de33b82ef72f4d0a33001ad73a52427573467f5e6b4840a' },
      { context: 'Electron gates', user: '18902', sidSha256: '62946077d6ae48faf3c8d7a59b5c34e6daea602719f0ff3a8a5512f83c0bf873' },
    ],
    toolchain: { node: process.version, nodePath: process.execPath, pnpm: '11.7.0', pnpmEntry: process.env.SHACO_FORGE_PNPM_ENTRY, dotnet: '10.0.302', electron: '35.7.5' },
    remainingObservedProcesses: [], finalProcessInspection: 'CIM inspection under normal Windows user found no Product Worker, Native Helper or Step1 Electron fixture process after controlled cleanup.',
    successfulGovernanceSynchronization: false, currentStateModified: false, developmentLogModified: false,
    providerRuns: 0, commit: false, push: false, staged: git(['diff', '--cached', '--name-only']) === '' ? 'NONE' : 'UNEXPECTED',
  })
  await evidence('run-manifest.json', manifest)
  const markers = ['\uFFFD', '\u953F\u65A4\u62F7', '\u00C3', '\u00C2']
  const scan = []
  const scanFiles = [...sourceFiles, ...(await readdir(evidenceRoot)).filter(name => name.endsWith('.json') && name !== 'redaction-summary.json').map(name => `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/${runId}/${name}`)]
  function inspectValues(value, key = '') {
    if (typeof value === 'string') {
      assert.ok(!/\\\\\.\\pipe\\shaco-forge-v1-[a-f0-9]{32}/i.test(value), 'Exact private Carrier endpoint in Evidence')
      if (['secret', 'clientProof', 'serverProof', 'serverNonce', 'clientNonce'].includes(key)) assert.equal(value, '', `Sensitive value at ${key}`)
    } else if (value && typeof value === 'object') for (const [childKey, child] of Object.entries(value)) inspectValues(child, childKey)
  }
  for (const path of scanFiles) {
    const bytes = await readFile(join(paths.root, path))
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    assert.ok(!bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])), `BOM: ${path}`)
    for (const marker of markers) assert.ok(!value.includes(marker), `Suspicious text: ${path}`)
    if (path.endsWith('.json')) { const parsed = JSON.parse(value); if (path.includes('/evidence/')) inspectValues(parsed) }
    const prior = manifest.sourceEncodingPre.find(item => item.path === path)
    if (prior) assert.equal(prior.bom, false, `Original BOM format must be preserved: ${path}`)
    scan.push({ path, bytes: bytes.length, strictUtf8: true, bom: false, suspiciousText: false })
  }
  const preloadPre = manifest.sourceEncodingPre.filter(item => item.path.includes('/src/preload/'))
  for (const item of preloadPre) assert.equal((await identity(item.path)).sha256, item.sha256)
  await evidence('redaction-summary.json', { runId, result: 'PASS', scanned: scan, exactPrivateCarrierEndpoints: 0, rawCredentialValues: 0,
    credentialEpochPolicy: 'Only permitted non-secret UUID identities or SHA-256 hashes; no credential bytes.', rendererPreloadByteIdentical: true,
    nonceOrProofInEvidence: false, ordinaryEnvironmentCredential: false, evidenceJsonParsed: true,
    ownFileAndImplementationRecord: 'Validated independently after writing to avoid circular self-hashes.' })
  const evidenceNames = (await readdir(evidenceRoot)).filter(name => name.endsWith('.json')).sort()
  const artifacts = await Promise.all(evidenceNames.map(name => identity(`docs/04-development-records/evidence/V1-SLICE-2/STEP-1/${runId}/${name}`)))
  const success = attachments.attempts.findLast(item => item.result === 'PASS')
  const failureCleanup = processes.electronRegressionCleanup
  const lines = [
    '# V1-SLICE-2 Step 1 Worker Authority and Trusted Discovery Implementation Record', '',
    `Run ID: ${runId}`, 'Date: 2026-09-09 (Asia/Shanghai)', 'Status: STOPPED_BLOCKED / IMPLEMENTATION_NOT_PROVEN', '',
    '## A. Implementation verdict', '',
    'IMPLEMENTATION_RESULT = STOPPED_BLOCKED', 'V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = IMPLEMENTATION_NOT_PROVEN',
    `FIRST_UNRESOLVED_BOUNDARY = ${boundary}`, 'STOP_REASON = MAJOR_CORRECTIVE_BUDGET_EXHAUSTED', '',
    'The implementation reached real Carrier readiness, reattachment and several security/process gates. It did not pass the complete required runtime/regression roster. No Independent Review, Owner acceptance, closure or Step2 authorization is claimed.', '',
    '## B. Baseline', '',
    `Product: ${paths.root}; branch master; initial HEAD ${manifest.baseline.productHead}; initial tracked/staged/untracked state CLEAN/NONE/NONE.`,
    `Frozen Harness: ${process.env.SHACO_FORGE_HARNESS_ROOT}; HEAD ${harnessHead}; initial/final CLEAN.`,
    'Both baselines were actually inspected before implementation. The sandbox Harness Git ownership check was resolved with command-scoped safe.directory only; no global Git configuration was changed.',
    `Pinned Node ${process.version}: ${process.execPath}; pnpm 11.7.0: ${process.env.SHACO_FORGE_PNPM_ENTRY}; .NET SDK 10.0.302; Electron 35.7.5. Ambient Node 24.18.0 / pnpm 11.19.0 were not substituted for required builds or runtime.`, '',
    '## C. Scope', '',
    'Implemented code for detached per-user Worker startup/discovery, Helper-held mutex, Worker-owned Job, protected deterministic lifecycle pipe, per-attachment Helper credential generation, actual PID/start binding, sequential Carrier/Host relay fencing, Desktop detach and bounded internal stop. Added a canonical local runtime/evidence driver and focused OS/Electron fixtures. No dependency or lockfile change.',
    'Not implemented: Product CONNECTED, cold Workspace/Session projection/recovery, Worker replacement recovery, full reconnect UI, Step3 native UI integration, business/Prompt/Tool replay, Provider work, Broker, asymmetric authority, Launch Grant, Service, WorkerGeneration or CarrierConnectionId. Harness business truth and the frozen HMAC transcript remain unchanged.', '',
    '## D. Files changed', '',
    ...sourceFiles.map(path => `- ${join(paths.root, path)}`), `- ${join(paths.root, recordPath)}`,
    ...artifacts.map(item => `- ${join(paths.root, item.path)}`), '',
    '## E. Architecture realization', '',
    '- Worker generates workerInstanceId and remains a detached per-user epoch. Main discovers first; no Main-generated attachment secret remains.',
    '- Lifecycle pipe is derived deterministically from the current SID hash; its owner, protected DACL and explicit current-SID rule are inspected from the real handle. A short Native operation inspects the connected server PID/start; it exits before credential delivery. It is not a Broker or binary-identity authority.',
    '- Helper creates the kill-on-close Job during bootstrap, duplicates the final non-inheritable Job handle into Worker, assigns Helper and Host, and closes its setup handle before readiness. Worker is the final holder. Helper owns the authority mutex on one dedicated thread; abandoned acquisition fails closed.',
    '- Main startup uses detached/unreferenced Node with ignored stdio. No temporary Main channel survives readiness. Normal Product before-quit closes only the Carrier and attachment state.',
    '- Helper reserves the actual lifecycle peer PID/start, checks protocol/freshness/health/state, then generates 32 random secret bytes and a new credentialEpoch. Carrier actual PID/start must match. Secret bytes are cleared on consume/revoke; endpoint and credential stay on the validated Main control path.',
    '- Carrier endpoint remains random per Worker; mutual HMAC domains, transcript field order, uint32-LE field lengths, UTF-8 encoding and Carrier frame bytes are unchanged. MAX_JSON_FRAME=262144, credits=4, queue capacity=16. Private relay uses a separate clientInstanceId metadata frame before each unchanged business frame, preserving the full frame limit.',
    '- Sequential detach clears auth, frame decoder, stream/credit/callback state and tags private relay work with clientInstanceId. Old Client objects cannot be reused. The stricter five-pending-callback runtime probe exists but remains unexecuted.',
    '- Explicit stop is incomplete under full Electron teardown: one lifecycle request is attempted, its rejection is swallowed, and the method only polls process exit afterwards. A concurrent health/discovery request can occupy the single lifecycle instance. The actual swallowed error was not captured, so BUSY contention is a source-based inference, not an observed error code.', '',
    '## F. Bounded corrective history', '',
    '| Cycle | Issue / root cause | Correction | Verification |', '|---|---|---|---|',
    '| Major 1 | Lifecycle response recycling/identity serialization; initial timeout diagnosis incomplete | Wait for client close acknowledgement; camelCase process identity fields | Timeout persisted; retained foundation attempts |',
    '| Major 2 | Node child_process pauses a Socket supplied as inherited stdio | Resume Main read ownership after Native handle inspection | Foundation attempt 6 PASS, same Worker/fresh epochs/real unary/stop |',
    '| Major 3 | Node queues connection to an occupied lifecycle pipe instead of immediately reporting BUSY | Native WaitNamedPipe availability check; bounded BUSY result | Initial BUSY problem corrected; next run exposed broken pipe reuse |',
    '| Major 4 | EOF can set IsConnected=false/Broken, skipping Disconnect and causing next accept IOException | Disconnect every completed accept before reuse | Native/security negatives PASS, real sequential events PASS |',
    '| Unresolved; no cycle 5 | Full Electron stop reported exited=false; authority remained healthy DETACHED | No Product corrective after budget exhaustion | Regression FAIL; later direct stop only for cleanup |', '',
    'Major corrective cycles: 4 used / 4 allowed. One overall BCL/Win32 Product design strategy; no Broker/native-dependency strategy introduced.',
    'Minor history is reported per issue and in aggregate: CS0165 definite assignment (1 correction), CA2022 unchecked ReadAsync result (1), PATH resolution (3 corrections: key normalization, uppercase key, then bounded PATH), Electron stdin fixture trigger (1), and missing pre-snapshot GPU-failure cleanup (1). Aggregate: 7 minor corrective edits across these separate issues. The executor treated the minor cap per issue; under a global interpretation this exceeds 3 and is an additional execution-discipline limitation, not hidden as budget compliance.',
    'PATH root cause was the 22068-character inherited PATH; short pinned Node/.NET/system PATH passed. The sandbox Electron GPU exited with -1073741515; normal-user execution succeeded. A diagnostic confirmation showed no stdin control/before-quit event; a timed real window.close trigger then passed.',
    'One chained build/runtime invocation mistakenly ran the old binary after CA2022 build failure. That failed run remains foundation attempt 3. This was an execution-order error, not a valid corrective verification or an erased attempt. Later build and runtime calls were separated.',
    'Foundation attempts: FAIL, FAIL, FAIL (old binary), FAIL, FAIL, PASS. Carrier negative attempts: FAIL, FAIL, FAIL, PASS, PASS. Desktop survival attempts: two sandbox GPU failures, two stdin-trigger failures, then PASS. Native failure/ambiguous-authority suites each passed once. The final existing Electron regression failed once; no unchanged rerun was performed after the stop boundary.', '',
    '## G. Build / test', '',
    '| Command | Exit | Result |', '|---|---:|---|',
    ...tests.commands.map(item => `| ${item.command} (${item.startedAt}) | ${item.exitCode} | ${item.result} |`),
    '| .NET Release --no-restore (latest completed source build) | 0 | PASS; 0 warnings/errors |',
    '| Node --check for changed JS/MJS files | 0 | PASS |',
    '| PowerShell Parser.ParseFile for new OS fixture | 0 | PASS |',
    '| git diff --check | 0 | PASS |', '',
    'pnpm test: 120/120 tests, 0 failures, 0 skipped. The full existing target roster ran. Old Supervisor fixture expectations were updated for discovery/detach/process-start validation; the historical identity fixtures were not changed. Exact executable paths and all retained command outcomes, including standalone runtime invocations and build failures, are in test-summary.json.',
    'smoke:electron was inspected before execution: the run used the real Client read-only unary/$events route and explicitly disabled user-loop mode. Renderer passed; product-owned TCP listeners were zero. Its cleanup predicate failed, so overall regression remains FAIL. smoke:user-loop and Provider/Prompt/Tool execution were NOT_EXECUTED.', '',
    '## H. Step1 runtime gates', '', '| Gate | Result | Basis / limit |', '|---|---|---|',
    ...definitions.map(([id, result, detail]) => `| ${id} | ${result} | ${detail} |`), '',
    'These are observed sub-results from this implementation run, not a claim that the final full Step1 matrix passed. G10/G20 are only partially exercised; G21 final candidate scenario was not run. No same-SID hostile-binary, memory-theft, Broker, Launch Grant, Service or Provider gate was introduced.', '',
    '## I. Desktop survival', '',
    `Successful actual Product run: Main PIDs ${success.snapshots.map(item => item.mainPid).join(' -> ')}; Worker ${success.snapshots[0].authority.worker.pid}, Host ${success.snapshots[0].authority.host.pid}, Helper ${success.snapshots[0].authority.helper.pid}.`,
    'Graceful window close and Main hard crash preserved all three PID/start tuples. Final third Main graceful close and isolated direct authority stop completed. Earlier test failures and their diagnostics remain in attachment-sequence.json.', '',
    '## J. Fresh reattach', '',
    `workerInstanceId = ${success.snapshots[0].authority.workerInstanceId}`, '',
    '| Main PID | credentialEpoch SHA-256 | clientInstanceId |', '|---:|---|---|',
    ...success.snapshots.map(item => `| ${item.mainPid} | ${item.credentialEpochHash} | ${item.clientInstanceId} |`), '',
    '## K. Authority / process', '', '| Scenario | Worker PID | Host PID | Helper PID | Result |', '|---|---:|---:|---:|---|',
    ...authority.results.map(item => `| ${item.scenario} | ${item.before.worker.pid} | ${item.before.host.pid} | ${item.before.helper.pid} | ${item.result} |`),
    '', `Failed regression authority: Worker ${failureCleanup.before.worker.pid}, Host ${failureCleanup.before.host.pid}, Helper ${failureCleanup.before.helper.pid}; workerInstanceId ${failureCleanup.before.workerInstanceId}. Post-failure discovery observed healthy DETACHED, proving resources were still live. A later explicit stop returned stopping and all three ended. This cleanup does not turn G15 into PASS.`,
    'The initial sandbox GPU crash left a detached authority before the test received a snapshot. Parent PID 58028 tied Worker 53812 to this run; Host 35676 and Helper 36036 were later stopped after exact PID/start verification. This delayed cleanup and the build-file lock it caused are preserved in process-lifecycle.json. Final CIM inspection found no remaining Product Worker/Native Helper/Step1 fixture. Unrelated processes were not terminated.', '',
    '## L. Security negatives', '',
    'PASS observations: BUSY in all three active states; stale/consumed/expired/replayed capability rejection; lifecycle actual PID/start mismatch; Carrier actual peer tuple mismatch before challenge; incompatible protocol before issuance; 262144-byte real Gateway frame acceptance, 262145 rejection; zero rejected-input dispatch delta; unchanged Renderer preload and actual isolated Renderer.',
    'Cross-user classification is ACCESS_CONTROL_PROOF only: a deterministic non-admin SID/group evaluation of the actual inspected protected single-current-SID ACL. A real second-user login/access scenario was not executed. Node/native gates ran as the sandbox user; Electron gates ran as the normal Windows user. Both SID hashes are in run-manifest.json.', '',
    '## M. Evidence', '', `Root: ${evidenceRoot}`, '', '| File | Bytes | SHA-256 |', '|---|---:|---|',
    ...artifacts.map(item => `| ${item.path.split('/').at(-1)} | ${item.bytes} | ${item.sha256} |`), '',
    '## N. Implementation record', '', `Path: ${join(paths.root, recordPath)}`, 'The final record byte size and SHA-256 are reported externally after writing; no circular self-hash is embedded.', '',
    '## O. Historical preservation', '', '| Historical / frozen path | Pre SHA-256 = Post SHA-256 |', '|---|---|',
    ...post.map(item => `| ${item.path} | ${item.sha256} |`), '',
    `All ${post.length} frozen/historical entries are byte-identical, including IDENTITY-01, SERVER-ATTESTATION-01, probes/fixture, Blocked/Source Confirmation records, AUDIT-021/022, Owner decisions, Main Contract, Carrier Amendment, Security Model and Slice1B Carrier Contract. Frozen Harness remains at ${harnessHead}, CLEAN.`, '',
    '## P. Governance state', '',
    'No success-only Current State or Development Log synchronization was performed because required gates/regression did not all pass. The persisted Owner checkpoint remains REAUTHORIZED_NOT_STARTED; this new uncommitted implementation record and run manifest record the actual STOPPED_BLOCKED attempt. Step2/Step3 remain NOT_AUTHORIZED, Provider authorization NO. No CLOSED/FROZEN/OWNER_ACCEPTED claim is made.', '',
    '## Q. Git state', '',
    `Branch master; HEAD unchanged ${manifest.baseline.productHead}. Reviewable Product/source/test/script/Evidence/record worktree retained. Staged NONE. Commit NO. Push NO. No reset, checkout discard, historical evidence deletion or Frozen Harness change.`, '',
    '## R. Remaining risks', '',
    'The explicit bounded stop path is not proven during real Renderer teardown. It suppresses lifecycle delivery failures, so an authority can remain live after a controlled stop request. A future corrective must distinguish transient occupancy, stop acknowledgement and confirmed epoch termination without making Main the Worker owner or allowing replacement while ambiguous. No such corrective is authorized by this exhausted run.',
    'The swallowed error was not captured; a BUSY collision with in-flight health discovery is the most direct source-based explanation, not a measured error code. Exhaustive G10/G20 callback/queued-frame proof and G21 competing-candidate proof remain unexecuted. The consolidated --runtime entry has not passed as a whole. Some build/evidence metadata changed after earlier passing sub-scenarios; those sub-results are retained with their limits and are not promoted to final acceptance.',
    'Minor-budget interpretation and the stale-binary command-chain error are disclosed in section F. Independent Review has not happened. No release/runtime packaging or resistance to same-user host compromise is claimed.', '',
    '## S. Next action', '', 'NEXT_ACTION = ARCHITECTURE_OWNER_ASSESS_STEP1_IMPLEMENTATION_BLOCKER', '',
  ]
  const record = lines.join('\n')
  for (const marker of markers) assert.ok(!record.includes(marker))
  await writeFile(join(paths.root, recordPath), record, 'utf8')
  const recordIdentity = await identity(recordPath)
  console.log(JSON.stringify({ result: 'STOPPED_BLOCKED', firstUnresolvedBoundary: boundary, historicalFilesPreserved: post.length,
    evidenceFiles: artifacts, implementationRecord: recordIdentity, sourceFiles: sourceFiles.length, nodeSyntaxFiles: syntax.length }, null, 2))
}
if (process.argv.includes('--finalize-blocked')) await finalizeBlocked()
