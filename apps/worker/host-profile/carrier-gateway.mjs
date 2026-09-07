import { createReadStream, createWriteStream } from 'node:fs'
import { probeEventsRoute } from './events-route-preflight.mjs'

export const name = 'shaco-forge-carrier-gateway'
export const inject = ['typertGateway', 'connection', 'agentPresets']

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

  function send(value) {
    const frame = encode(value)
    writeChain = writeChain.then(() => new Promise((resolve, reject) => {
      output.write(frame, error => error ? reject(error) : resolve())
    }))
    return writeChain
  }

  async function handleUnary(frame) {
    try {
      const response = await sharedFetch.fetch(new Request(`http://dsh.internal/api/${frame.endpoint}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(frame.envelope),
      }))
      const envelope = await response.json()
      await send({ type: 'unary-response', requestId: frame.requestId, envelope })
    } catch (error) {
      await send({
        type: 'unary-response', requestId: frame.requestId,
        envelope: {
          type: 'server-response', rpcId: frame.envelope.rpcId,
          result: { ok: false, error: { code: 'transport', message: String(error?.message ?? error), details: {} } },
        },
      })
    }
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

  async function handleStreamOpen(frame) {
    const state = { controller: new AbortController(), credits: 0, wake: undefined, iterator: undefined }
    streams.set(frame.streamId, state)
    grantCredit(state, frame.initialCredits)
    try {
      const source = await ctx.typertGateway.wireStream.open(frame.endpoint, frame.payload, state.controller.signal)
      const iterator = source[Symbol.asyncIterator]()
      state.iterator = iterator
      for (;;) {
        if (!await takeCredit(state)) return
        const item = await iterator.next()
        if (item.done) {
          await send({ type: 'stream-end', streamId: frame.streamId })
          return
        }
        await send({ type: 'stream-item', streamId: frame.streamId, value: item.value })
      }
    } catch (error) {
      if (state.controller.signal.aborted) {
        await send({ type: 'stream-end', streamId: frame.streamId, cancelled: true })
      } else {
        await send({ type: 'stream-error', streamId: frame.streamId, error: ctx.typertGateway.wireStream.failure(error) })
      }
    } finally {
      streams.delete(frame.streamId)
    }
  }

  async function cancelStream(frame) {
    const state = streams.get(frame.streamId)
    if (state === undefined) return
    state.controller.abort(new Error('Shaco Forge stream consumer cancelled'))
    state.wake?.()
    try { await state.iterator?.return?.() } catch { }
  }

  const decode = createDecoder(frame => {
    if (frame?.type === 'unary-request') void handleUnary(frame)
    else if (frame?.type === 'stream-open' && typeof frame.streamId === 'string') void handleStreamOpen(frame)
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
    for (const state of streams.values()) state.controller.abort(new Error('Carrier bridge closed'))
    streams.clear()
  })
  ctx.effect(() => () => {
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
