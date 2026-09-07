import { randomBytes, randomUUID } from 'node:crypto'
import { createConnection, type Socket } from 'node:net'
import {
  AUTH_HANDSHAKE_TIMEOUT_MS,
  CARRIER_PROTOCOL_VERSION,
  CLIENT_AUTH_DOMAIN,
  JsonFrameDecoder,
  SERVER_AUTH_DOMAIN,
  STREAM_INITIAL_CREDITS,
  STREAM_QUEUE_CAPACITY,
  createAuthProof,
  encodeJsonFrame,
  isRecord,
  verifyAuthProof,
  type AuthTranscriptFields,
  type ClientRequestEnvelope,
} from '@shaco-forge/contracts'
import type { CarrierBootstrap } from './worker-supervisor.js'

export type StreamPullResult = { done: false; value: unknown } | { done: true } | { done: true; error: string }

interface UnaryState {
  resolve(value: unknown): void
  reject(error: Error): void
  timeout: NodeJS.Timeout
}

interface StreamState {
  queue: unknown[]
  pull?: { resolve(value: StreamPullResult): void; reject(error: Error): void }
  terminal?: StreamPullResult
  cancelled: boolean
}

export class PullStreamBuffer {
  readonly queue: unknown[] = []
  #pull: { resolve(value: StreamPullResult): void; reject(error: Error): void } | undefined
  #terminal: StreamPullResult | undefined

  get terminalObserved(): boolean {
    return this.#terminal !== undefined
  }

  pull(): Promise<StreamPullResult> {
    if (this.#pull !== undefined) return Promise.reject(new Error('Only one Renderer pull may be in flight'))
    if (this.queue.length > 0) return Promise.resolve({ done: false, value: this.queue.shift() })
    if (this.#terminal !== undefined) return Promise.resolve(this.#terminal)
    return new Promise((resolve, reject) => { this.#pull = { resolve, reject } })
  }

  push(value: unknown): boolean {
    if (this.#terminal !== undefined) return false
    const pending = this.#pull
    if (pending !== undefined) {
      this.#pull = undefined
      pending.resolve({ done: false, value })
      return true
    }
    if (this.queue.length >= STREAM_INITIAL_CREDITS || this.queue.length >= STREAM_QUEUE_CAPACITY) {
      throw new Error('Renderer stream queue exceeded granted credit')
    }
    this.queue.push(value)
    return false
  }

  finish(result: StreamPullResult): void {
    if (this.#terminal !== undefined) return
    this.#terminal = result
    const pending = this.#pull
    this.#pull = undefined
    pending?.resolve(result)
  }

  cancel(): void {
    this.queue.length = 0
    this.#terminal = { done: true }
    const pending = this.#pull
    this.#pull = undefined
    pending?.resolve(this.#terminal)
  }

  fail(error: Error): void {
    this.#terminal = { done: true, error: error.message }
    const pending = this.#pull
    this.#pull = undefined
    pending?.reject(error)
    this.queue.length = 0
  }
}

export class CarrierClient {
  #socket: Socket | undefined
  #decoder = new JsonFrameDecoder()
  #authenticated = false
  #failed: Error | undefined
  #unary = new Map<string, UnaryState>()
  #streams = new Map<string, { state: StreamState; buffer: PullStreamBuffer }>()
  #writeChain = Promise.resolve()
  readonly metrics = {
    mainAuthenticatedCarrier: false,
    serverAuthenticatedToMain: false,
    businessFramesSent: 0,
    unaryRequests: 0,
    streamOpens: 0,
    streamPulls: 0,
    streamCancels: 0,
    eventsReadyObserved: 0,
    maxRendererInflightPullPerStream: 0,
    unsolicitedRendererStreamPushes: 0,
    activeStreams: 0,
    pendingUnary: 0,
    finalActiveStreams: 0,
    finalPendingUnary: 0,
  }

  constructor(readonly bootstrap: CarrierBootstrap) {}

  async connect(): Promise<void> {
    if (this.#socket !== undefined) throw new Error('Carrier is already connected')
    const socket = createConnection(this.bootstrap.pipeEndpoint)
    this.#socket = socket
    await new Promise<void>((resolveAuth, rejectAuth) => {
      let stage: 'challenge' | 'server-auth' | 'authenticated' = 'challenge'
      let fields: AuthTranscriptFields | undefined
      const timeout = setTimeout(() => reject(new Error('Carrier mutual authentication timed out')), AUTH_HANDSHAKE_TIMEOUT_MS)
      const reject = (error: Error): void => {
        clearTimeout(timeout)
        socket.destroy()
        this.#fail(error)
        rejectAuth(error)
      }
      socket.on('data', chunk => {
        try {
          for (const value of this.#decoder.push(chunk)) {
            if (!isRecord(value) || typeof value.type !== 'string') throw new Error('Carrier envelope is invalid')
            if (stage === 'challenge') {
              if (value.type !== 'server-challenge') throw new Error('Carrier server challenge is invalid')
              if (value.protocolVersion !== CARRIER_PROTOCOL_VERSION) throw new Error('Carrier protocol version is unsupported')
              if (value.workerInstanceId !== this.bootstrap.workerInstanceId
                || value.endpointId !== this.bootstrap.endpointId
                || value.credentialEpoch !== this.bootstrap.credentialEpoch
                || typeof value.challengeId !== 'string'
                || typeof value.serverNonce !== 'string') {
                throw new Error('Carrier server challenge is invalid')
              }
              const clientNonce = randomBytes(32).toString('hex')
              const clientInstanceId = randomUUID()
              fields = {
                protocolVersion: CARRIER_PROTOCOL_VERSION,
                workerInstanceId: this.bootstrap.workerInstanceId,
                endpointId: this.bootstrap.endpointId,
                credentialEpoch: this.bootstrap.credentialEpoch,
                challengeId: value.challengeId,
                serverNonce: value.serverNonce,
                clientNonce,
                clientInstanceId,
              }
              stage = 'server-auth'
              this.#writeRaw({
                type: 'client-auth', clientNonce, clientInstanceId,
                clientProof: createAuthProof(this.bootstrap.secret, CLIENT_AUTH_DOMAIN, fields),
              }, false).catch(reject)
              continue
            }
            if (stage === 'server-auth') {
              if (value.type !== 'server-auth'
                || fields === undefined
                || typeof value.serverProof !== 'string'
                || !verifyAuthProof(this.bootstrap.secret, SERVER_AUTH_DOMAIN, fields, value.serverProof)) {
                throw new Error('Carrier server proof is invalid')
              }
              stage = 'authenticated'
              this.#authenticated = true
              this.metrics.mainAuthenticatedCarrier = true
              this.metrics.serverAuthenticatedToMain = true
              clearTimeout(timeout)
              resolveAuth()
              continue
            }
            this.#dispatch(value)
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      })
      socket.once('error', error => reject(error))
      socket.once('close', () => {
        if (!this.#failed) this.#fail(new Error('Carrier connection closed'))
      })
    })
  }

  async request(endpoint: string, envelope: ClientRequestEnvelope, signal?: AbortSignal): Promise<unknown> {
    this.#requireAuthenticated()
    const requestId = randomUUID()
    this.metrics.unaryRequests += 1
    return await new Promise<unknown>((resolveRequest, rejectRequest) => {
      const timeout = setTimeout(() => {
        this.#unary.delete(requestId)
        rejectRequest(new Error('Carrier unary request timed out'))
      }, 30_000)
      const state: UnaryState = { resolve: resolveRequest, reject: rejectRequest, timeout }
    this.#unary.set(requestId, state)
      this.metrics.pendingUnary = this.#unary.size
      const abort = (): void => {
        if (!this.#unary.delete(requestId)) return
        clearTimeout(timeout)
        rejectRequest(signal?.reason instanceof Error ? signal.reason : new Error('Unary request aborted'))
      }
      signal?.addEventListener('abort', abort, { once: true })
      this.#writeRaw({ type: 'unary-request', requestId, endpoint, envelope }, true).catch(error => {
        signal?.removeEventListener('abort', abort)
        this.#unary.delete(requestId)
        this.metrics.pendingUnary = this.#unary.size
        clearTimeout(timeout)
        rejectRequest(error)
      })
    })
  }

  async openStream(endpoint: string, payload: Record<string, unknown>): Promise<string> {
    this.#requireAuthenticated()
    const streamId = randomUUID()
    this.#streams.set(streamId, {
      state: { queue: [], cancelled: false },
      buffer: new PullStreamBuffer(),
    })
    this.metrics.activeStreams = this.#streams.size
    this.metrics.streamOpens += 1
    await this.#writeRaw({ type: 'stream-open', streamId, endpoint, payload, initialCredits: STREAM_INITIAL_CREDITS }, true)
    return streamId
  }

  async pullStream(streamId: string): Promise<StreamPullResult> {
    const stream = this.#streams.get(streamId)
    if (stream === undefined) return { done: true, error: 'Unknown stream' }
    this.metrics.streamPulls += 1
    this.metrics.maxRendererInflightPullPerStream = Math.max(this.metrics.maxRendererInflightPullPerStream, 1)
    const result = await stream.buffer.pull()
    if (!result.done) {
      if (!stream.buffer.terminalObserved) await this.#writeRaw({ type: 'stream-credit', streamId, credit: 1 }, true)
    } else {
      this.#streams.delete(streamId)
      this.metrics.activeStreams = this.#streams.size
    }
    return result
  }

  async cancelStream(streamId: string, reason = 'consumer-cancel'): Promise<void> {
    const stream = this.#streams.get(streamId)
    if (stream === undefined || stream.state.cancelled) return
    stream.state.cancelled = true
    this.metrics.streamCancels += 1
    stream.buffer.cancel()
    this.#streams.delete(streamId)
    this.metrics.activeStreams = this.#streams.size
    if (this.#authenticated && this.#failed === undefined) {
      await this.#writeRaw({ type: 'stream-cancel', streamId, reason }, true)
    }
  }

  fail(reason: string): void {
    this.#socket?.destroy()
    this.#fail(new Error(reason))
  }

  close(): void {
    this.#socket?.destroy()
    this.#fail(new Error('Carrier closed by Desktop'))
    this.bootstrap.secret.fill(0)
  }

  #requireAuthenticated(): void {
    if (this.#failed !== undefined) throw this.#failed
    if (!this.#authenticated) throw new Error('Carrier is not mutually authenticated')
  }

  #writeRaw(value: unknown, business: boolean): Promise<void> {
    if (business) {
      this.#requireAuthenticated()
      this.metrics.businessFramesSent += 1
    }
    const socket = this.#socket
    if (socket === undefined || socket.destroyed) return Promise.reject(new Error('Carrier socket is unavailable'))
    const frame = encodeJsonFrame(value)
    this.#writeChain = this.#writeChain.then(() => new Promise<void>((resolveWrite, rejectWrite) => {
      socket.write(frame, error => error ? rejectWrite(error) : resolveWrite())
    }))
    return this.#writeChain
  }

  #dispatch(value: Record<string, unknown>): void {
    if (!this.#authenticated) throw new Error('Business frame received before mutual authentication')
    if (value.type === 'unary-response' && typeof value.requestId === 'string') {
      const state = this.#unary.get(value.requestId)
      if (state === undefined) return
      this.#unary.delete(value.requestId)
      this.metrics.pendingUnary = this.#unary.size
      clearTimeout(state.timeout)
      state.resolve(value.envelope)
      return
    }
    if (typeof value.streamId !== 'string') throw new Error('Carrier stream envelope lacks streamId')
    const stream = this.#streams.get(value.streamId)
    if (stream === undefined) return
    if (value.type === 'stream-item') {
      const consumedImmediately = stream.buffer.push(value.value)
      if (isRecord(value.value) && value.value.type === 'ready') this.metrics.eventsReadyObserved += 1
      if (!consumedImmediately && stream.buffer.queue.length > STREAM_INITIAL_CREDITS) throw new Error('Stream credit invariant violated')
    } else if (value.type === 'stream-end') {
      stream.buffer.finish({ done: true })
    } else if (value.type === 'stream-error') {
      const message = isRecord(value.error) && typeof value.error.message === 'string' ? value.error.message : 'Host stream failed'
      stream.buffer.finish({ done: true, error: message })
    } else {
      throw new Error('Carrier response envelope type is invalid')
    }
  }

  #fail(error: Error): void {
    if (this.#failed !== undefined) return
    this.#failed = error
    this.#authenticated = false
    for (const state of this.#unary.values()) {
      clearTimeout(state.timeout)
      state.reject(error)
    }
    this.#unary.clear()
    this.metrics.pendingUnary = 0
    for (const stream of this.#streams.values()) stream.buffer.fail(error)
    this.#streams.clear()
    this.metrics.activeStreams = 0
    this.metrics.finalActiveStreams = 0
    this.metrics.finalPendingUnary = 0
  }
}
