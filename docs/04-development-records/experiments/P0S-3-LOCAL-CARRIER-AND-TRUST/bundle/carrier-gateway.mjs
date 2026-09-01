/**
 * NOT_PRODUCTION P0.S-3 Worker-side Gateway and basic stream framing adapter.
 * Unary requests call the real frozen Harness Typert Gateway. The deterministic
 * stream producer is only a P0.S-3 framing stub and makes no P0.S-4 claim.
 */
import { createInterface } from 'node:readline'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export const name = 'p0s3-carrier-gateway'
export const inject = ['typertGateway', 'agentPresets', 'connection']

const RESPONSE_PREFIX = 'P0S3_FRAME '
const INPUT_PREFIX = 'P0S3_IN '

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function send(value) {
  const json = JSON.stringify(value)
  process.stdout.write(`${RESPONSE_PREFIX}${Buffer.from(json, 'utf8').toString('base64')}\n`)
}

function failure(error) {
  return {
    ok: false,
    error: {
      code: 'internal',
      message: error instanceof Error ? error.message : 'Gateway invocation failed',
      details: {},
    },
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function apply(ctx) {
  const readyFile = process.env.P0S3_DSH_READY_FILE
  const summaryFile = process.env.P0S3_DSH_SUMMARY_FILE
  const failureFile = process.env.P0S3_DSH_FAILURE_FILE
  let gatewayDispatchCount = 0
  let streamProbeOpenCount = 0
  let streamItemCount = 0
  let stopping = false

  async function handleRpc(frame) {
    gatewayDispatchCount += 1
    const separator = frame.endpoint.indexOf('/')
    if (frame.probeDelayMs > 0) await sleep(frame.probeDelayMs)
    try {
      const value = await ctx.typertGateway.invoke({
        namespace: frame.endpoint.slice(0, separator),
        method: frame.endpoint.slice(separator + 1),
        args: frame.payload?.args ?? {},
      })
      send({
        type: 'rpc-response',
        requestId: frame.requestId,
        result: { ok: true, value },
        probeId: frame.probeId,
        probePayloadBytes: frame.probePayloadBytes,
        gatewayDispatchOrdinal: gatewayDispatchCount,
      })
    } catch (error) {
      send({
        type: 'rpc-response',
        requestId: frame.requestId,
        result: failure(error),
        probeId: frame.probeId,
        probePayloadBytes: frame.probePayloadBytes,
        gatewayDispatchOrdinal: gatewayDispatchCount,
      })
    }
  }

  async function handleStream(frame) {
    streamProbeOpenCount += 1
    const count = Number.isSafeInteger(frame.itemCount) ? frame.itemCount : 0
    for (let index = 0; index < count; index += 1) {
      await sleep(1 + ((index + frame.channelOrdinal) % 4))
      streamItemCount += 1
      send({
        type: 'stream-item',
        requestId: frame.requestId,
        streamId: frame.streamId,
        channelLabel: frame.channelLabel,
        index,
        value: `${frame.channelLabel}:${index}`,
      })
    }
    send({
      type: 'stream-end',
      requestId: frame.requestId,
      streamId: frame.streamId,
      channelLabel: frame.channelLabel,
      itemCount: count,
    })
  }

  function sendStatus(frame) {
    send({
      type: 'diagnostic-status-response',
      requestId: frame.requestId,
      gatewayDispatchCount,
      streamProbeOpenCount,
      streamItemCount,
    })
  }

  const input = createInterface({ input: process.stdin, terminal: false })
  input.on('line', line => {
    if (line === 'P0S3_CONTROL_STOP') {
      if (stopping) return
      stopping = true
      writeJson(summaryFile, {
        classification: 'NOT_PRODUCTION',
        pid: process.pid,
        gatewayDispatchCount,
        streamProbeOpenCount,
        streamItemCount,
        realGatewayEndpoint: 'agentPresets/list',
        basicStreamEndpoint: 'p0s3/basic-stream',
        browserAuthConstructed: false,
        stockWebStarted: false,
      })
      setTimeout(() => process.emit('SIGTERM'), 20)
      return
    }
    if (!line.startsWith(INPUT_PREFIX)) return
    try {
      const json = Buffer.from(line.slice(INPUT_PREFIX.length), 'base64').toString('utf8')
      const frame = JSON.parse(json)
      if (frame.type === 'rpc-call') {
        void handleRpc(frame)
      } else if (frame.type === 'stream-open') {
        void handleStream(frame)
      } else if (frame.type === 'diagnostic-status') {
        sendStatus(frame)
      }
    } catch (error) {
      writeJson(failureFile, {
        classification: 'NOT_PRODUCTION',
        pid: process.pid,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })

  ctx.effect(() => () => {
    input.close()
  })

  void sleep(750).then(async () => {
    const standard = await ctx.agentPresets.resolve('standard')
    writeJson(readyFile, {
      classification: 'NOT_PRODUCTION',
      pid: process.pid,
      nodeExecutable: process.execPath,
      nodeVersion: process.version,
      profileName: 'shaco-host',
      gatewayInvokePresent: typeof ctx.typertGateway.invoke === 'function',
      gatewayStreamPresent: typeof ctx.typertGateway.stream === 'function',
      gatewayWireStreamPresent: typeof ctx.typertGateway.wireStream?.open === 'function',
      connectionPresent: Boolean(ctx.connection),
      connectionRpcPresent: Boolean(ctx.connection?.rpc),
      standardPresetResolved: standard?.id === 'standard',
      startupGatewayCanaryExecuted: false,
      carrierGatewayDispatchCount: gatewayDispatchCount,
      browserAuthConstructed: false,
      stockWebStarted: false,
    })
  }).catch(error => {
    writeJson(failureFile, {
      classification: 'NOT_PRODUCTION',
      pid: process.pid,
      message: error instanceof Error ? error.message : String(error),
    })
  })
}
