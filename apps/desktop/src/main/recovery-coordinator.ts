import { isRecord, type ClientRequestEnvelope } from '@shaco-forge/contracts'
import { createHash } from 'node:crypto'
import { CarrierClient, type StreamPullResult } from './carrier-client.js'
import type { CarrierBootstrap, WorkerSupervisor } from './worker-supervisor.js'

export type ConnectionState = 'DISCONNECTED' | 'DISCOVERING' | 'WORKER_STARTING' | 'AUTHENTICATING' | 'CONNECTED'
  | 'CONNECTION_LOST' | 'RECONNECTING' | 'INCOMPATIBLE' | 'FAILED'
export interface RecoveryProjection {
  connectionState: ConnectionState
  generation: number
  authenticatedCarrier: boolean
  clientGenerationReady: boolean
  projectionRebuildComplete: boolean
  continuity: 'INITIAL' | 'SAME_WORKER' | 'REPLACEMENT_CONTINUITY_UNPROVEN'
  failure?: string
}
export interface ClientProjectionReport {
  clientGenerationReady: boolean
  workspaceReady: boolean
  sessionRosterReady: boolean
  currentSessionReady: boolean
  currentSessionPresent: boolean
  projectionFailed: boolean
}

// Main owns attachment readiness only; Harness stores own all business data.
export class RecoveryCoordinator {
  carrier: CarrierClient | undefined
  bootstrap: CarrierBootstrap | undefined
  projection: RecoveryProjection = { connectionState: 'DISCONNECTED', generation: 0, authenticatedCarrier: false,
    clientGenerationReady: false, projectionRebuildComplete: false, continuity: 'INITIAL' }
  readonly transitions: RecoveryProjection[] = []
  readonly metrics = { staleRejected: 0, recoveries: 0, replacements: 0, businessReplays: 0 }
  readonly retiredGenerations: Array<{ generation: number; pendingUnary: number; activeStreams: number }> = []
  readProof = { eventsReady: false, workspaceBaseline: false, sessionRoster: false, sessionSnapshot: false,
    workspaceCount: 0, sessionCount: 0, historyCount: 0, sessionHash: '', workspaceHashes: [] as string[] }
  #stopped = false
  #attempt = 0
  #recovering: Promise<void> | undefined
  #readinessTimer: NodeJS.Timeout | undefined
  #streams = new Map<string, { carrier: CarrierClient; id: string; generation: number; endpoint: string; sessionHash: string }>()
  #lastWorker: string | undefined
  constructor(readonly supervisor: Pick<WorkerSupervisor, 'start' | 'recover' | 'carrierReady' | 'detach'>,
    readonly publish: (state: RecoveryProjection) => void,
    readonly mount: (generation: number) => Promise<void>,
    readonly createCarrier: (bootstrap: CarrierBootstrap) => CarrierClient = bootstrap => new CarrierClient(bootstrap)) {}

  #set(next: Partial<RecoveryProjection>): void {
    this.projection = { ...this.projection, ...next }
    this.transitions.push({ ...this.projection })
    if (this.transitions.length > 128) this.transitions.shift()
    this.publish(this.projection)
  }
  async start(): Promise<void> { await this.#attach(false) }

  async #attach(recover: boolean): Promise<void> {
    const attempt = ++this.#attempt
    const generation = this.projection.generation + 1
    this.readProof = { eventsReady: false, workspaceBaseline: false, sessionRoster: false, sessionSnapshot: false,
      workspaceCount: 0, sessionCount: 0, historyCount: 0, sessionHash: '', workspaceHashes: [] }
    this.#set({ generation, connectionState: recover ? 'RECONNECTING' : 'DISCOVERING', failure: undefined,
      authenticatedCarrier: false, clientGenerationReady: false, projectionRebuildComplete: false })
    let candidate: CarrierClient | undefined
    try {
      const bootstrap = await (recover ? this.supervisor.recover() : this.supervisor.start())
      if (this.#stopped || this.#attempt !== attempt || this.projection.generation !== generation) { bootstrap.secret.fill(0); bootstrap.lifecycle?.destroy(); return }
      this.bootstrap = bootstrap
      const replacement = this.#lastWorker !== undefined && this.#lastWorker !== bootstrap.workerInstanceId
      this.#set({ connectionState: 'AUTHENTICATING', continuity: replacement ? 'REPLACEMENT_CONTINUITY_UNPROVEN' : this.#lastWorker === undefined ? 'INITIAL' : 'SAME_WORKER' })
      if (replacement) this.metrics.replacements++
      candidate = this.createCarrier(bootstrap)
      this.carrier = candidate
      candidate.onFailure(() => { if (this.carrier === candidate && this.projection.authenticatedCarrier) this.lost('CARRIER_LOST') })
      await candidate.connect()
      this.assertGeneration(generation)
      this.#lastWorker = bootstrap.workerInstanceId
      this.#set({ authenticatedCarrier: true })
      this.supervisor.carrierReady()
      this.#readinessTimer = setTimeout(() => {
        if (this.projection.generation === generation && !this.projection.projectionRebuildComplete) this.fail('HARNESS_SESSION_RECOVERY_FAILED')
      }, 30_000)
      await this.mount(generation)
    } catch (error) {
      if (!this.#stopped && this.#attempt === attempt && this.projection.generation === generation) {
        const text = error instanceof Error ? error.message : ''
        this.fail(/version|protocol|incompatible/i.test(text) ? 'WORKER_VERSION_INCOMPATIBLE'
          : /AMBIGUOUS|IDENTITY|prior death/.test(text) ? 'AUTHORITY_AMBIGUOUS_FAIL_CLOSED'
          : this.projection.connectionState === 'AUTHENTICATING' ? 'CARRIER_AUTH_FAILED' : 'RECONNECT_FAILED')
      }
      candidate?.close()
    }
  }
  assertGeneration(generation: unknown): CarrierClient {
    if (generation !== this.projection.generation || !this.carrier?.authenticated || this.#stopped) {
      this.metrics.staleRejected++
      throw new Error('STALE_CLIENT_GENERATION')
    }
    return this.carrier
  }
  report(generation: unknown, value: unknown): void {
    this.assertGeneration(generation)
    if (!isRecord(value) || ['clientGenerationReady', 'workspaceReady', 'sessionRosterReady', 'currentSessionReady', 'currentSessionPresent', 'projectionFailed'].some(key => typeof value[key] !== 'boolean')) throw new Error('Invalid cold projection report')
    if (value.projectionFailed) { this.fail('HARNESS_SESSION_RECOVERY_FAILED'); return }
    if (this.projection.clientGenerationReady && !value.clientGenerationReady) { this.lost('CARRIER_LOST'); return }
    const ready = value.clientGenerationReady === true && value.workspaceReady === true && value.sessionRosterReady === true && value.currentSessionReady === true
      && this.readProof.eventsReady && this.readProof.workspaceBaseline && this.readProof.sessionRoster
      && (!value.currentSessionPresent || this.readProof.sessionSnapshot)
    this.#set({ clientGenerationReady: value.clientGenerationReady === true, projectionRebuildComplete: ready,
      connectionState: ready ? 'CONNECTED' : 'AUTHENTICATING' })
    if (ready) clearTimeout(this.#readinessTimer)
  }
  lost(reason: string): void {
    if (this.#stopped || !this.carrier) return
    // A newly attached Carrier may fail before its mount promise settles.
    // Fence it immediately; an in-flight recovery is never immunity from loss.
    if (this.#recovering !== undefined) { this.fail('RECONNECT_FAILED'); return }
    this.#fence()
    this.#set({ connectionState: 'CONNECTION_LOST', failure: reason })
    this.metrics.recoveries++
    this.#recovering = this.#attach(true).finally(() => { this.#recovering = undefined })
  }
  async settled(): Promise<void> { await this.#recovering }
  #fence(): void {
    this.#attempt++
    clearTimeout(this.#readinessTimer)
    const old = this.carrier
    this.carrier = undefined
    this.#streams.clear()
    this.#set({ connectionState: 'CONNECTION_LOST', authenticatedCarrier: false, clientGenerationReady: false, projectionRebuildComplete: false })
    old?.close()
    if (old !== undefined) {
      this.retiredGenerations.push({ generation: this.projection.generation, pendingUnary: old.metrics.pendingUnary, activeStreams: old.metrics.activeStreams })
      if (this.retiredGenerations.length > 32) this.retiredGenerations.shift()
    }
    this.supervisor.detach()
  }
  fail(reason: string): void {
    this.#fence()
    this.#set({ connectionState: reason === 'WORKER_VERSION_INCOMPATIBLE' ? 'INCOMPATIBLE' : 'FAILED', failure: reason })
  }
  stop(): void { this.#stopped = true; this.#fence(); this.#set({ connectionState: 'DISCONNECTED' }) }
  async request(generation: unknown, endpoint: string, envelope: ClientRequestEnvelope): Promise<unknown> {
    const carrier = this.assertGeneration(generation)
    if (this.projection.connectionState !== 'CONNECTED' && RECOVERY_FORBIDDEN_MUTATIONS.has(endpoint)) {
      throw new Error('CONNECTION_RECOVERY_READ_ONLY: business mutation cannot resume during cold projection')
    }
    const result = await carrier.request(endpoint, envelope)
    this.assertGeneration(generation)
    if (endpoint === 'session/list' && isRecord(result) && isRecord(result.result) && result.result.ok === true
      && isRecord(result.result.value) && Array.isArray(result.result.value.items)) {
      this.readProof.sessionRoster = true
      this.readProof.sessionCount = result.result.value.items.length
    }
    return result
  }
  async openStream(generation: unknown, endpoint: string, payload: Record<string, unknown>): Promise<string> {
    const carrier = this.assertGeneration(generation)
    const id = await carrier.openStream(endpoint, payload)
    this.assertGeneration(generation)
    const handle = `${generation}:${id}`
    const request = isRecord(payload.args) && isRecord(payload.args.request) ? payload.args.request : undefined
    const address = isRecord(request?.address) ? request.address : undefined
    this.#streams.set(handle, { carrier, id, generation: generation as number, endpoint, sessionHash: hashIdentity(address?.kind === 'session' ? address.sessionId : undefined) })
    return handle
  }
  async pullStream(generation: unknown, handle: string): Promise<StreamPullResult> {
    this.assertGeneration(generation)
    const stream = this.#streams.get(handle)
    if (!stream || stream.generation !== generation) throw new Error('STALE_CLIENT_STREAM')
    const item = await stream.carrier.pullStream(stream.id)
    this.assertGeneration(generation)
    if (!item.done && isRecord(item.value)) {
      const value = item.value
      if (stream.endpoint === '$events' && value.type === 'ready') this.readProof.eventsReady = true
      if (stream.endpoint === 'workspace/follow' && value.type === 'baseline' && isRecord(value.value)) {
        this.readProof.workspaceBaseline = true
        const items = Array.isArray(value.value.items) ? value.value.items : []
        this.readProof.workspaceCount = items.length
        this.readProof.workspaceHashes = items.map(item => hashIdentity(isRecord(item) ? item.workspaceId : undefined))
      }
      if (stream.endpoint === 'session/follow' && value.type === 'snapshot') {
        this.readProof.sessionSnapshot = true
        this.readProof.sessionHash = stream.sessionHash
        this.readProof.historyCount = Array.isArray(value.records) ? value.records.length : 0
      }
    }
    if (item.done) this.#streams.delete(handle)
    return item
  }
  async cancelStream(generation: unknown, handle: string, reason: string): Promise<void> {
    this.assertGeneration(generation)
    const stream = this.#streams.get(handle)
    if (!stream || stream.generation !== generation) throw new Error('STALE_CLIENT_STREAM')
    this.#streams.delete(handle)
    await stream.carrier.cancelStream(stream.id, reason)
    this.assertGeneration(generation)
  }
}

function hashIdentity(value: unknown): string {
  return typeof value === 'string' ? createHash('sha256').update(value).digest('hex') : ''
}

const RECOVERY_FORBIDDEN_MUTATIONS = new Set(['session/prompt', 'session/cancel', 'session/create', 'session/fork', 'session/rename',
  'session/updateQueue', 'session/selectModel', 'session/openWorkspacePath', '$events/result', 'commands/execute',
  'workspace/create', 'workspace/rename', 'workspace/delete', 'workspace/archiveSession', 'workspace/insertBefore', 'workspace/insertSessionBefore'])
