import { createHmac, timingSafeEqual } from 'node:crypto'

export const CARRIER_PROTOCOL_VERSION = '1' as const
export const MAX_JSON_FRAME = 262_144
export const STREAM_INITIAL_CREDITS = 4
export const STREAM_QUEUE_CAPACITY = 16
export const AUTH_HANDSHAKE_TIMEOUT_MS = 5_000
export const FRAME_COMPLETION_TIMEOUT_MS = 5_000
export const CLIENT_AUTH_DOMAIN = 'shaco-forge/client-auth/v1'
export const SERVER_AUTH_DOMAIN = 'shaco-forge/server-auth/v1'

const ENDPOINT_SEGMENT = /^[A-Za-z0-9_$.-]+$/

export interface AuthTranscriptFields {
  protocolVersion: string
  workerInstanceId: string
  endpointId: string
  credentialEpoch: string
  challengeId: string
  serverNonce: string
  clientNonce: string
  clientInstanceId: string
}

export function canonicalTranscript(domain: string, fields: AuthTranscriptFields): Buffer {
  const values = [
    domain,
    fields.protocolVersion,
    fields.workerInstanceId,
    fields.endpointId,
    fields.credentialEpoch,
    fields.challengeId,
    fields.serverNonce,
    fields.clientNonce,
    fields.clientInstanceId,
  ]
  const chunks: Buffer[] = []
  for (const value of values) {
    const encoded = Buffer.from(value, 'utf8')
    const length = Buffer.allocUnsafe(4)
    length.writeUInt32LE(encoded.byteLength)
    chunks.push(length, encoded)
  }
  return Buffer.concat(chunks)
}

export function createAuthProof(secret: Uint8Array, domain: string, fields: AuthTranscriptFields): string {
  return createHmac('sha256', secret).update(canonicalTranscript(domain, fields)).digest('hex')
}

export function verifyAuthProof(secret: Uint8Array, domain: string, fields: AuthTranscriptFields, proof: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(proof)) return false
  const expected = Buffer.from(createAuthProof(secret, domain, fields), 'hex')
  const received = Buffer.from(proof, 'hex')
  return expected.byteLength === received.byteLength && timingSafeEqual(expected, received)
}

export function encodeJsonFrame(value: unknown): Buffer {
  const payload = Buffer.from(JSON.stringify(value), 'utf8')
  if (payload.byteLength === 0 || payload.byteLength > MAX_JSON_FRAME) {
    throw new RangeError(`JSON frame length ${payload.byteLength} is outside 1..${MAX_JSON_FRAME}`)
  }
  const frame = Buffer.allocUnsafe(4 + payload.byteLength)
  frame.writeUInt32LE(payload.byteLength, 0)
  payload.copy(frame, 4)
  return frame
}

export class JsonFrameDecoder {
  #buffer = Buffer.alloc(0)
  #expectedLength: number | undefined

  push(chunk: Uint8Array): unknown[] {
    if (chunk.byteLength === 0) return []
    this.#buffer = Buffer.concat([this.#buffer, Buffer.from(chunk)])
    const values: unknown[] = []
    for (;;) {
      if (this.#expectedLength === undefined) {
        if (this.#buffer.byteLength < 4) break
        this.#expectedLength = this.#buffer.readUInt32LE(0)
        this.#buffer = this.#buffer.subarray(4)
        if (this.#expectedLength === 0 || this.#expectedLength > MAX_JSON_FRAME) {
          throw new RangeError(`JSON frame length ${this.#expectedLength} is outside 1..${MAX_JSON_FRAME}`)
        }
      }
      if (this.#buffer.byteLength < this.#expectedLength) break
      const payload = this.#buffer.subarray(0, this.#expectedLength)
      this.#buffer = this.#buffer.subarray(this.#expectedLength)
      this.#expectedLength = undefined
      try {
        values.push(JSON.parse(payload.toString('utf8')) as unknown)
      } catch {
        throw new SyntaxError('Malformed JSON carrier frame')
      }
    }
    if (this.#buffer.byteLength > MAX_JSON_FRAME) throw new RangeError('Carrier frame buffer exceeded limit')
    return values
  }

  get pendingBytes(): number {
    return this.#buffer.byteLength
  }
}

export interface ClientRequestEnvelope {
  type: 'client-request'
  rpcId: string
  method: string
  payload: Record<string, unknown>
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateEndpoint(endpoint: string): string {
  const segments = endpoint.split('/')
  if (segments.some(segment => segment === '' || segment === '.' || segment === '..' || !ENDPOINT_SEGMENT.test(segment))) {
    throw new TypeError('Invalid Harness endpoint')
  }
  return endpoint
}

export function validateClientRequestEnvelope(value: unknown, endpoint: string): ClientRequestEnvelope {
  if (!isRecord(value)
    || value.type !== 'client-request'
    || typeof value.rpcId !== 'string'
    || value.rpcId.length === 0
    || value.method !== endpoint
    || !isRecord(value.payload)
    || !Object.hasOwn(value.payload, 'args')) {
    throw new TypeError('Invalid client-request envelope')
  }
  const encoded = Buffer.byteLength(JSON.stringify(value), 'utf8')
  if (encoded > MAX_JSON_FRAME) throw new RangeError('Client request exceeds MAX_JSON_FRAME')
  return value as unknown as ClientRequestEnvelope
}

export interface NormalizedRendererRequest {
  channel: '/api'
  endpoint: string
  envelope: ClientRequestEnvelope
}

export function normalizeRendererRequest(input: {
  url: string
  method: string
  contentType: string
  body: string
}): NormalizedRendererRequest {
  if (input.method !== 'POST') throw new TypeError('Only POST is accepted')
  if (input.contentType.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
    throw new TypeError('Only application/json is accepted')
  }
  const url = new URL(input.url)
  const accepted = (url.protocol === 'shaco-forge:' && url.hostname === 'client')
    || (url.protocol === 'http:' && url.hostname === 'dsh.internal' && url.port === '')
  if (!accepted || (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) || url.search !== '' || url.hash !== '') {
    throw new TypeError('Renderer transport URL is not allowlisted')
  }
  const endpoint = validateEndpoint(decodeURIComponent(url.pathname.slice('/api/'.length)))
  if (Buffer.byteLength(input.body, 'utf8') > MAX_JSON_FRAME) throw new RangeError('Renderer body exceeds MAX_JSON_FRAME')
  let value: unknown
  try {
    value = JSON.parse(input.body)
  } catch {
    throw new SyntaxError('Renderer body is malformed JSON')
  }
  return { channel: '/api', endpoint, envelope: validateClientRequestEnvelope(value, endpoint) }
}

export function validateStreamOpen(endpoint: unknown, payload: unknown): { endpoint: string; payload: Record<string, unknown> } {
  if (typeof endpoint !== 'string' || !isRecord(payload) || !Object.hasOwn(payload, 'args')) {
    throw new TypeError('Invalid stream open request')
  }
  validateEndpoint(endpoint)
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > MAX_JSON_FRAME) throw new RangeError('Stream payload exceeds MAX_JSON_FRAME')
  return { endpoint, payload }
}
