/** NOT_PRODUCTION: authenticated framed Named Pipe client. */
import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import net from 'node:net'

const PROTOCOL_VERSION = 1
const MAX_FRAME_BYTES = 262144

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class FramedPipeConnection {
  constructor(socket) {
    this.socket = socket
    this.buffer = Buffer.alloc(0)
    this.messages = []
    this.waiters = []
    this.writeChain = Promise.resolve()
    this.closed = new Promise(resolve => socket.once('close', resolve))
    socket.on('data', chunk => this.onData(chunk))
    socket.on('error', error => this.rejectAll(error))
    socket.on('close', () => this.rejectAll(new Error('Named Pipe transport closed')))
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    for (;;) {
      if (this.buffer.length < 4) return
      const length = this.buffer.readUInt32LE(0)
      if (length <= 0 || length > MAX_FRAME_BYTES) {
        this.socket.destroy(new Error('Invalid carrier frame length'))
        return
      }
      if (this.buffer.length < length + 4) return
      const payload = this.buffer.subarray(4, length + 4)
      this.buffer = this.buffer.subarray(length + 4)
      let message
      try {
        message = JSON.parse(payload.toString('utf8'))
      } catch (error) {
        this.socket.destroy(error)
        return
      }
      this.dispatch(message)
    }
  }

  dispatch(message) {
    const index = this.waiters.findIndex(waiter => waiter.predicate(message))
    if (index >= 0) {
      const [waiter] = this.waiters.splice(index, 1)
      clearTimeout(waiter.timer)
      waiter.resolve(message)
      return
    }
    this.messages.push(message)
  }

  rejectAll(error) {
    for (const waiter of this.waiters.splice(0)) {
      clearTimeout(waiter.timer)
      waiter.reject(error)
    }
  }

  waitFor(predicate, timeoutMs = 30000) {
    const index = this.messages.findIndex(predicate)
    if (index >= 0) return Promise.resolve(this.messages.splice(index, 1)[0])
    return new Promise((resolve, reject) => {
      const waiter = { predicate, resolve, reject, timer: null }
      waiter.timer = setTimeout(() => {
        const pending = this.waiters.indexOf(waiter)
        if (pending >= 0) this.waiters.splice(pending, 1)
        reject(new Error('Timed out waiting for carrier frame'))
      }, timeoutMs)
      this.waiters.push(waiter)
    })
  }

  sendObject(value) {
    const payload = Buffer.from(JSON.stringify(value), 'utf8')
    if (payload.length > MAX_FRAME_BYTES) throw new Error('Client refused oversize frame')
    const header = Buffer.alloc(4)
    header.writeUInt32LE(payload.length, 0)
    this.writeChain = this.writeChain.then(async () => {
      for (const fragment of [header.subarray(0, 2), header.subarray(2), payload.subarray(0, 11), payload.subarray(11)]) {
        if (fragment.length === 0) continue
        await new Promise((resolve, reject) => this.socket.write(fragment, error => error ? reject(error) : resolve()))
      }
    })
    return this.writeChain
  }

  async close() {
    if (this.socket.destroyed) return
    this.socket.end()
    await Promise.race([this.closed, sleep(1000)])
    if (!this.socket.destroyed) this.socket.destroy()
  }
}

async function openPipe(pipeName, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    const socket = net.createConnection(`\\\\.\\pipe\\${pipeName}`)
    try {
      await new Promise((resolve, reject) => {
        socket.once('connect', resolve)
        socket.once('error', reject)
      })
      const connection = new FramedPipeConnection(socket)
      const challenge = await connection.waitFor(message => message.type === 'server-challenge', 5000)
      return { connection, challenge }
    } catch (error) {
      lastError = error
      socket.destroy()
      if (!['ENOENT', 'EBUSY', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE'].includes(error?.code)) throw error
      await sleep(50)
    }
  }
  throw lastError ?? new Error('Named Pipe connect timeout')
}

function proof({ secret, requestId, clientNonce, serverNonce, workerInstanceId, endpointId, userSid }) {
  const canonical = [
    String(PROTOCOL_VERSION), userSid, workerInstanceId, endpointId,
    requestId, clientNonce, serverNonce,
  ].join('\n')
  return createHmac('sha256', Buffer.from(secret, 'hex')).update(canonical, 'utf8').digest('hex')
}

export async function authenticateWorker(descriptor, credential, overrides = {}) {
  const { connection, challenge } = await openPipe(descriptor.pipeName, overrides.timeoutMs ?? 5000)
  const requestId = randomUUID()
  const clientNonce = randomBytes(32).toString('hex')
  const workerInstanceId = overrides.workerInstanceId ?? descriptor.workerInstanceId
  const endpointId = overrides.endpointId ?? descriptor.endpointId
  const userSid = overrides.userSid ?? credential.userSid
  const secret = overrides.secret ?? credential.secret
  const auth = {
    type: 'client-auth',
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    workerInstanceId,
    endpointId,
    userSid,
    clientNonce,
    serverNonce: challenge.serverNonce,
    credentialEpoch: overrides.credentialEpoch ?? credential.credentialEpoch,
    proof: proof({
      secret, requestId, clientNonce, serverNonce: challenge.serverNonce,
      workerInstanceId, endpointId, userSid,
    }),
  }
  const pending = connection.waitFor(message => ['authentication-complete', 'authentication-rejected'].includes(message.type), 5000)
  await connection.sendObject(auth)
  return { connection, challenge, auth, outcome: await pending }
}

export function createRpc(connection, onDispatch = () => {}) {
  return {
    async call(endpoint, payload, options = {}) {
      const requestId = randomUUID()
      onDispatch(endpoint)
      const pending = connection.waitFor(message => message.type === 'rpc-response' && message.requestId === requestId, options.timeoutMs ?? 30000)
      await connection.sendObject({
        type: 'rpc-call', requestId, channel: '/api', endpoint, payload,
        probeSource: options.probeSource ?? null,
      })
      return pending
    },
  }
}

export async function openEventGeneration(connection) {
  const requestId = randomUUID()
  const streamId = randomUUID()
  await connection.sendObject({
    type: 'stream-open', requestId, streamId, endpoint: '$events', payload: { args: {} }, initialCredit: 4,
  })
  const stream = {
    requestId,
    streamId,
    async next(timeoutMs = 30000) {
      const frame = await connection.waitFor(message => message.streamId === streamId && [
        'stream-item', 'stream-end', 'stream-error', 'stream-cancelled',
      ].includes(message.type), timeoutMs)
      if (frame.type === 'stream-item') {
        await connection.sendObject({ type: 'stream-credit', requestId: randomUUID(), streamId, credit: 1 })
      }
      return frame
    },
    cancel(reason = 'desktop-generation-close') {
      return connection.sendObject({ type: 'stream-cancel', requestId: randomUUID(), streamId, reason })
    },
  }
  const readyFrame = await stream.next(10000)
  if (readyFrame.type !== 'stream-item' || readyFrame.value?.type !== 'ready' || !readyFrame.value.clientId) {
    throw new Error('$events did not emit a real ready payload')
  }
  return { stream, clientId: readyFrame.value.clientId, ready: readyFrame.value }
}

export async function waitForWaterfall(generation, eventName, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const frame = await generation.stream.next(Math.max(1, deadline - Date.now()))
    if (frame.type === 'stream-item' && frame.value?.type === 'waterfall' && frame.value.event === eventName) {
      return frame.value
    }
  }
  throw new Error(`Timed out waiting for waterfall ${eventName}`)
}

export function resultEnvelope(clientId, eventId, value) {
  return {
    endpoint: '$events/result',
    payload: { args: { clientId, eventId, outcome: { kind: 'result', value } } },
  }
}
