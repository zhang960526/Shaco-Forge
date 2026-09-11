import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
test('actual Host gateway rejects new mutation/stream during drain and awaits pending route opens', async () => {
  const child = spawn(process.execPath, ['scripts/slice3-step2-gateway-fixture.mjs'], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'] })
  const timeout = setTimeout(() => child.kill(), 10000)
  const rows = []; let bytes = Buffer.alloc(0), output = '', errors = ''
  child.stdout.on('data', data => { output += data }); child.stderr.on('data', data => { errors += data })
  child.stdio[4].on('data', data => {
    bytes = Buffer.concat([bytes, data])
    while (bytes.length >= 4 && bytes.length >= bytes.readUInt32LE(0) + 4) {
      const size = bytes.readUInt32LE(0); rows.push(JSON.parse(bytes.subarray(4, size + 4))); bytes = bytes.subarray(size + 4)
    }
  })
  const send = value => { const payload = Buffer.from(JSON.stringify(value)); const header = Buffer.alloc(4); header.writeUInt32LE(payload.length); child.stdio[3].write(Buffer.concat([header, payload])) }
  const request = frame => { send({ type: 'attachment-frame', clientInstanceId: 'test' }); send(frame) }
  const until = async predicate => {
    const deadline = Date.now() + 5000
    while (!predicate()) { if (Date.now() > deadline || child.exitCode !== null) throw new Error('GATEWAY_FIXTURE_TIMEOUT ' + errors); await new Promise(done => setTimeout(done, 10)) }
  }
  try {
    await until(() => rows.some(row => row.type === 'host-carrier-preflight'))
    send({ type: 'attachment-start', clientInstanceId: 'test' })
    request({ type: 'unary-request', requestId: 'old', endpoint: 'test', envelope: { rpcId: 'old' } })
    request({ type: 'stream-open', streamId: 'old-stream', endpoint: 'test', payload: {}, initialCredits: 1 })
    send({ type: 'upgrade-drain' })
    request({ type: 'unary-request', requestId: 'new', endpoint: 'test', envelope: { rpcId: 'new' } })
    request({ type: 'stream-open', streamId: 'new-stream', endpoint: 'test', payload: {}, initialCredits: 1 })
    await until(() => rows.some(row => row.type === 'stream-error' && row.streamId === 'new-stream'))
    assert.equal(rows.some(row => row.type === 'upgrade-drained'), false)
    assert.equal(rows.find(row => row.requestId === 'new').envelope.result.error.message, 'UPGRADE_IN_PROGRESS')
    assert.equal(rows.find(row => row.streamId === 'new-stream').error.message, 'UPGRADE_IN_PROGRESS')
    child.stdin.end('release')
    await until(() => rows.some(row => row.type === 'upgrade-drained'))
    child.stdio[3].end() // Same close-after-proof boundary used by real Worker.
    if (child.exitCode === null) await new Promise(done => child.once('exit', done))
    assert.equal(child.exitCode, 0, errors)
    assert.deepEqual(JSON.parse(output), { writes: 1, streamOpens: 1 })
  } finally { clearTimeout(timeout); if (child.exitCode === null) child.kill() }
})
