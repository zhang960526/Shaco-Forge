import { createReadStream, createWriteStream } from 'node:fs'
import { probeEventsRoute } from './events-route-preflight.mjs'
import { drainHarness } from './upgrade-drain.mjs'

export const name = 'shaco-forge-carrier-gateway'
export const inject = ['typertGateway', 'connection', 'agentPresets', 'agents', 'sessions']

const MAX_JSON_FRAME = 262_144
const STREAM_CREDIT_LIMIT = 4

function encode(value) {
  const payload = Buffer.from(JSON.stringify(value), 'utf8')
  if (payload.length === 0 || payload.length > MAX_JSON_FRAME) throw new Error('Host bridge frame exceeds limit')
  const frame = Buffer.allocUnsafe(4 + payload.length)
  frame.writeUInt32LE(payload.length)
  payload.copy(frame, 4)
  return frame
}

function createDecoder(dispatch) {
  let buffer = Buffer.alloc(0)
  let expected
  return chunk => {
    buffer = Buffer.concat([buffer, chunk])
    for (;;) {
      if (expected === undefined) {
        if (buffer.length < 4) return
        expected = buffer.readUInt32LE(0)
        buffer = buffer.subarray(4)
        if (expected === 0 || expected > MAX_JSON_FRAME) throw new Error('Host bridge frame length is invalid')
      }
      if (buffer.length < expected) return
      const payload = buffer.subarray(0, expected)
      buffer = buffer.subarray(expected)
      expected = undefined
      dispatch(JSON.parse(payload.toString('utf8')))
    }
  }
}

export function apply(ctx) {
  const input = createReadStream(null, { fd: 3, autoClose: false })
  const output = createWriteStream(null, { fd: 4, autoClose: false })
  const sharedFetch = ctx.connection.createSharedFetchHandler('/api')
  const streams = new Map()
  let writeChain = Promise.resolve()
  let currentClient
  let incomingClient
  const unary = new Set()
  let upgrading = false

  function send(value) {
    const frame = value.type === 'attachment-frame'
      ? Buffer.concat([encode({ type: 'attachment-frame', clientInstanceId: value.clientInstanceId }), encode(value.frame)])
      : encode(value)
    writeChain = writeChain.then(() => new Promise((resolve, reject) => {
      output.write(frame, error => error ? reject(error) : resolve())
    }))
    return writeChain
  }

  async function handleUnary(frame, client) {
    const operation = { client }
    unary.add(operation)
    try {
      const response = await sharedFetch.fetch(new Request(`http://dsh.internal/api/${frame.endpoint}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(frame.envelope),
      }))
      const envelope = await response.json()
      if (currentClient === client) await send({ type: 'attachment-frame', clientInstanceId: client, frame: { type: 'unary-response', requestId: frame.requestId, envelope } })
    } catch (error) {
      if (currentClient === client) await send({ type: 'attachment-frame', clientInstanceId: client, frame: {
        type: 'unary-response', requestId: frame.requestId,
        envelope: {
          type: 'server-response', rpcId: frame.envelope.rpcId,
          result: { ok: false, error: { code: 'transport', message: String(error?.message ?? error), details: {} } },
        },
      } })
    } finally { unary.delete(operation) }
  }

  function grantCredit(state, count) {
    if (!Number.isSafeInteger(count) || count <= 0) return
    state.credits = Math.min(STREAM_CREDIT_LIMIT, state.credits + count)
    state.wake?.()
    state.wake = undefined
  }

  async function takeCredit(state) {
    while (state.credits === 0 && !state.controller.signal.aborted) {
      await new Promise(resolve => { state.wake = resolve })
    }
    if (state.controller.signal.aborted) return false
    state.credits -= 1
    return true
  }

  async function handleStreamOpen(frame, client) {
    const opening = { client }
    unary.add(opening)
    const state = { controller: new AbortController(), credits: 0, wake: undefined, iterator: undefined, client }
    const sendCurrent = value => currentClient === client && !state.controller.signal.aborted
      ? send({ type: 'attachment-frame', clientInstanceId: client, frame: value }) : Promise.resolve()
    streams.set(frame.streamId, state)
    grantCredit(state, frame.initialCredits)
    try {
      const source = await ctx.typertGateway.wireStream.open(frame.endpoint, frame.payload, state.controller.signal)
      unary.delete(opening)
      const iterator = source[Symbol.asyncIterator]()
      state.iterator = iterator
      for (;;) {
        if (!await takeCredit(state)) return
        const item = await iterator.next()
        if (item.done) {
          await sendCurrent({ type: 'stream-end', streamId: frame.streamId })
          return
        }
        await sendCurrent({ type: 'stream-item', streamId: frame.streamId, value: item.value })
      }
    } catch (error) {
      if (state.controller.signal.aborted) {
        await sendCurrent({ type: 'stream-end', streamId: frame.streamId, cancelled: true })
      } else {
        await sendCurrent({ type: 'stream-error', streamId: frame.streamId, error: ctx.typertGateway.wireStream.failure(error) })
      }
    } finally {
      unary.delete(opening)
      if (streams.get(frame.streamId) === state) streams.delete(frame.streamId)
    }
  }

  async function cancelStream(frame) {
    const state = streams.get(frame.streamId)
    if (state === undefined) return
    state.controller.abort(new Error('Shaco Forge stream consumer cancelled'))
    state.wake?.()
    try { await state.iterator?.return?.() } catch { }
  }

  async function endAttachment() {
    currentClient = undefined
    const pending = [...streams.values()].map(async state => {
      state.controller.abort(); state.credits = 0; state.wake?.()
      try { await state.iterator?.return?.() } catch {}
    })
    streams.clear()
    await Promise.all(pending)
    await send({ type: 'attachment-reset' })
  }

  const decode = createDecoder(value => {
    let message = value
    if (incomingClient !== undefined) {
      message = { type: 'attachment-frame', clientInstanceId: incomingClient, frame: value }
      incomingClient = undefined
    } else if (value?.type === 'attachment-frame' && typeof value.clientInstanceId === 'string') {
      incomingClient = value.clientInstanceId
      return
    }
    if (message?.type === 'upgrade-drain') {
      if (upgrading) return
      upgrading = true
      void drainHarness(ctx, unary).then(async proof => {
        await send({ type: 'upgrade-drained', proof })
        const exit = ctx.get('appExit')
        if (typeof exit !== 'function') throw new Error('DRAIN_EXIT_UNAVAILABLE')
        exit(0)
      }).catch(() => send({ type: 'upgrade-drain-failed', reason: 'DRAIN_QUIESCENCE_UNPROVEN' }))
      return
    }
    if (message?.type === 'attachment-start' && typeof message.clientInstanceId === 'string') {
      if (currentClient !== undefined) throw new Error('Attachment overlap')
      currentClient = message.clientInstanceId
      return
    }
    if (message?.type === 'attachment-end') {
      if (message.clientInstanceId !== currentClient) return
      void endAttachment()
      return
    }
    if (message?.type !== 'attachment-frame') throw new Error('Host attachment envelope invalid')
    if (currentClient === undefined || message.clientInstanceId !== currentClient) return
    const frame = message.frame
    if (upgrading && (frame?.type === 'unary-request' || frame?.type === 'stream-open')) {
      if (frame.type === 'unary-request') void send({ type: 'attachment-frame', clientInstanceId: currentClient, frame: {
        type: 'unary-response', requestId: frame.requestId, envelope: { type: 'server-response', rpcId: frame.envelope.rpcId,
          result: { ok: false, error: { code: 'transport', message: 'UPGRADE_IN_PROGRESS', details: {} } } } } })
      else void send({ type: 'attachment-frame', clientInstanceId: currentClient, frame: { type: 'stream-error', streamId: frame.streamId, error: ctx.typertGateway.wireStream.failure(new Error('UPGRADE_IN_PROGRESS')) } })
      return
    }
    if (frame?.type === 'unary-request') void handleUnary(frame, currentClient)
    else if (frame?.type === 'stream-open' && typeof frame.streamId === 'string') void handleStreamOpen(frame, currentClient)
    else if (frame?.type === 'stream-credit') {
      const state = streams.get(frame.streamId)
      if (state !== undefined) grantCredit(state, frame.credit)
    } else if (frame?.type === 'stream-cancel') void cancelStream(frame)
    else throw new Error('Host bridge envelope is invalid')
  })

  input.on('data', chunk => {
    try { decode(chunk) }
    catch (error) {
      process.stderr.write(`SHACO_FORGE_HOST_BRIDGE_FAILED ${JSON.stringify({ message: String(error?.message ?? error) })}\n`)
      process.exitCode = 1
      process.emit('SIGTERM')
    }
  })
  input.on('end', () => {
    if (upgrading) return // Product closes the input only after the drain proof.
    for (const state of streams.values()) state.controller.abort(new Error('Carrier bridge closed'))
    streams.clear()
    process.exit(1)
  })
  const heartbeat = setInterval(() => void send({ type: 'authority-heartbeat' }), 500)
  ctx.effect(() => () => {
    clearInterval(heartbeat)
    input.destroy()
    output.end()
    for (const state of streams.values()) state.controller.abort(new Error('Host stopping'))
    streams.clear()
  })

  void Promise.resolve().then(async () => {
    await ctx.agentPresets.resolve('standard')
    const eventsRouteProbe = await probeEventsRoute(ctx.typertGateway.wireStream)
    await send({
      type: 'host-carrier-preflight',
      profilePluginLoaded: true,
      fetchHandlerReady: typeof sharedFetch.fetch === 'function',
      wireStreamReady: typeof ctx.typertGateway.wireStream?.open === 'function',
      eventsRouteReady: eventsRouteProbe.readyShapeValid,
      eventsRouteProbe,
      stockWebStarted: false,
    })
  }).catch(error => {
    process.stderr.write(`SHACO_FORGE_HOST_PREFLIGHT_FAILED ${JSON.stringify({ message: String(error?.message ?? error) })}\n`)
    process.exitCode = 1
    process.emit('SIGTERM')
  })
}
