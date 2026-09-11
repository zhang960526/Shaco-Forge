import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import type { Socket } from 'node:net'
import { isRecord, type BootstrapEvent } from '@shaco-forge/contracts'
import { inspectLocalPlatform, lifecycleRequest, type AuthorityStatus } from './lifecycle-client.js'
import { RELEASE_LAYOUT, releasePath, verifyPackagedRuntime } from '@shaco-forge/contracts/packaged-runtime'

export const WORKER_STARTUP_TIMEOUT_MS = 90_000
export type StopDelivery = 'STOP_DELIVERED' | 'STOP_REJECTED' | 'STOP_PIPE_BUSY' | 'STOP_DELIVERY_FAILED' | 'STOP_DELIVERED_BUT_AUTHORITY_DID_NOT_EXIT'
export interface StopResult { workerPid?: number; exited: boolean; delivery: StopDelivery; reason?: string }
function delay(ms: number): Promise<void> { return new Promise(resolveDelay => setTimeout(resolveDelay, ms)) }
export interface SupervisorConfig {
  packagedRoot?: string
  workerNodePath: string
  workerEntryPath: string
  nativeHelperPath: string
  harnessRoot: string
  dshHome: string
  profileName: string
}
export async function readPackagedSupervisorConfig(root: string): Promise<SupervisorConfig> {
  await verifyPackagedRuntime(root)
  return { packagedRoot: root, workerNodePath: releasePath(root, RELEASE_LAYOUT.node),
    workerEntryPath: releasePath(root, RELEASE_LAYOUT.workerEntry), nativeHelperPath: releasePath(root, RELEASE_LAYOUT.nativeHelper),
    harnessRoot: resolve(root, 'harness'), dshHome: '', profileName: 'shaco-forge' }
}
function workerEnvironment(config: SupervisorConfig): NodeJS.ProcessEnv {
  if (config.packagedRoot === undefined) return {
    ...process.env, SHACO_FORGE_DSH_HOME: config.dshHome, SHACO_FORGE_HARNESS_ROOT: config.harnessRoot,
    SHACO_FORGE_HARNESS_PROFILE_NAME: config.profileName, SHACO_FORGE_NATIVE_HELPER: config.nativeHelperPath,
  }
  return Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(DSH_|SHACO_FORGE_|NODE_|ELECTRON_|NPM_|PNPM_|COREPACK_)/i.test(key)))
}
export interface CarrierBootstrap {
  pipeEndpoint: string
  endpointId: string
  pipeEndpointHashPrefix: string
  helperPid: number
  workerInstanceId: string
  credentialEpoch: string
  secret: Buffer
  security: Record<string, unknown>
  hostPreflight: Record<string, unknown>
  lifecycle?: Socket
  authority?: AuthorityStatus
}
function requiredPath(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]
  if (value === undefined || value.trim() === '') throw new Error(`${key} is required for development bootstrap`)
  if (!isAbsolute(value)) throw new Error(`${key} must be an absolute input path`)
  return resolve(value)
}
export function readSupervisorConfig(env: NodeJS.ProcessEnv): SupervisorConfig {
  return {
    workerNodePath: requiredPath(env, 'SHACO_FORGE_WORKER_NODE'),
    workerEntryPath: requiredPath(env, 'SHACO_FORGE_WORKER_ENTRY'),
    nativeHelperPath: requiredPath(env, 'SHACO_FORGE_NATIVE_HELPER'),
    harnessRoot: requiredPath(env, 'SHACO_FORGE_HARNESS_ROOT'),
    dshHome: requiredPath(env, 'SHACO_FORGE_DSH_HOME'),
    profileName: env.SHACO_FORGE_HARNESS_PROFILE_NAME?.trim() || 'shaco-forge',
  }
}
export function mapWorkerTerminal(exitCode: number | null, signal: NodeJS.Signals | null): string {
  return `Worker exited before or after Carrier readiness (${exitCode ?? signal ?? 'unknown'})`
}
export class WorkerTerminationState {
  #deliberateStop = false
  beginDeliberateStop(): void { this.#deliberateStop = true }
  unexpectedFailure(exitCode: number | null, signal: NodeJS.Signals | null): string | undefined {
    return this.#deliberateStop ? undefined : mapWorkerTerminal(exitCode, signal)
  }
}

// Desktop owns an attachment only. Detached startup has no inherited Main pipe.
export class WorkerSupervisor {
  readonly events: BootstrapEvent[] = []
  workerLaunchAttempts = 0
  #listeners = new Set<(event: BootstrapEvent) => void>()
  #failureListeners = new Set<(reason: string) => void>()
  #bootstrap: CarrierBootstrap | undefined
  #status: AuthorityStatus | undefined
  #healthTimer: NodeJS.Timeout | undefined
  #healthInFlight: Promise<unknown> | undefined
  #attachmentRevision = 0
  constructor(readonly config: SupervisorConfig, readonly startupTimeoutMs = WORKER_STARTUP_TIMEOUT_MS) {}
  onEvent(listener: (event: BootstrapEvent) => void): () => void { this.#listeners.add(listener); return () => this.#listeners.delete(listener) }
  onCarrierFailure(listener: (reason: string) => void): () => void { this.#failureListeners.add(listener); return () => this.#failureListeners.delete(listener) }
  #publish(phase: BootstrapEvent['phase'], error?: string): void {
    if (this.#status === undefined) return
    const event: BootstrapEvent = {
      protocolVersion: 1, phase, timestamp: new Date().toISOString(), workerPid: this.#status.worker.pid,
      hostPid: this.#status.host.pid, parentPid: this.#status.workerRuntime.parentPid, workerNodeVersion: this.#status.workerRuntime.nodeVersion,
      workerExecutable: this.#status.workerRuntime.executable, workerArgv: this.#status.workerRuntime.argv, error,
    }
    this.events.push(event)
    for (const listener of this.#listeners) listener(event)
  }
  async discover(): Promise<AuthorityStatus> {
    return (await lifecycleRequest(this.config.nativeHelperPath, 'discover')).status!
  }
  async start(): Promise<CarrierBootstrap> {
    if (this.#bootstrap !== undefined) throw new Error('Desktop attachment already exists')
    if (this.config.packagedRoot !== undefined) await verifyPackagedRuntime(this.config.packagedRoot)
    await Promise.all([this.config.workerNodePath, this.config.workerEntryPath, this.config.nativeHelperPath, this.config.harnessRoot].map(path => access(path)))
    try { this.#status = await this.discover() }
    catch (error) {
      if (!(error instanceof Error) || error.message !== 'WORKER_NOT_FOUND') throw error
      this.workerLaunchAttempts++
      const child = spawn(this.config.workerNodePath, [this.config.workerEntryPath], {
        detached: true, windowsHide: true, stdio: 'ignore',
        cwd: this.config.packagedRoot ?? undefined,
        env: workerEnvironment(this.config),
      })
      let startupError = false
      child.once('error', () => { startupError = true })
      child.unref()
      const deadline = Date.now() + this.startupTimeoutMs
      while (Date.now() < deadline) {
        if (startupError || child.exitCode !== null || child.signalCode !== null) throw new Error('WORKER_AUTHORITY_FAILURE: startup exited')
        await new Promise(resolveDelay => setTimeout(resolveDelay, 150))
        try { this.#status = await this.discover(); break }
        catch (discoveryError) {
          if (!(discoveryError instanceof Error) || !['WORKER_NOT_FOUND', 'AUTHORITY_AMBIGUOUS_FAIL_CLOSED', 'BUSY'].includes(discoveryError.message)) throw discoveryError
        }
      }
      if (this.#status === undefined) throw new Error(`Worker startup timed out after ${this.startupTimeoutMs} ms; authority replacement forbidden`)
    }
    if (this.config.packagedRoot !== undefined && this.#status?.workerRuntime.executable !== this.config.workerNodePath) {
      throw new Error('RELEASE_INTEGRITY_FAILURE: discovered Worker executable')
    }
    const { response, socket, status } = await lifecycleRequest(this.config.nativeHelperPath, 'attach')
    if (response.type !== 'credential-issued' || !isRecord(response.status)
      || typeof response.pipeEndpoint !== 'string' || !response.pipeEndpoint.startsWith('\\\\.\\pipe\\shaco-forge-v1-')
      || typeof response.endpointId !== 'string' || typeof response.credentialEpoch !== 'string'
      || typeof response.secret !== 'string' || !/^[a-f0-9]{64}$/.test(response.secret)) {
      socket.destroy(); throw new Error('Credential issuance response invalid')
    }
    this.#status = status!
    this.#bootstrap = {
      pipeEndpoint: response.pipeEndpoint, endpointId: response.endpointId, pipeEndpointHashPrefix: response.endpointId.slice(0, 16),
      helperPid: status!.helper.pid, workerInstanceId: status!.workerInstanceId, credentialEpoch: response.credentialEpoch,
      secret: Buffer.from(response.secret, 'hex'), lifecycle: socket, authority: status,
      security: { aclProtected: true, inheritanceDisabled: true, currentUserAllowRule: true, unintendedBroadAllowRule: false, firstPipeInstance: true, randomEntropyBits: 128, postCreateInspection: true },
      hostPreflight: status!.hostPreflight,
    }
    response.secret = ''
    this.#publish('host-ready')
    return this.#bootstrap
  }
  carrierReady(): void {
    const revision = this.#attachmentRevision
    this.#publish('carrier-ready')
    let checking = false
    this.#healthTimer = setInterval(() => {
      if (checking) return
      checking = true
      const probe = this.discover().then(status => {
        if (revision !== this.#attachmentRevision) return
        if (status.workerInstanceId !== this.#status?.workerInstanceId) throw new Error('WORKER_AUTHORITY_FAILURE')
      }).catch((error: unknown) => {
        if (revision !== this.#attachmentRevision) return
        if (error instanceof Error && error.message === 'BUSY') return
        this.detach()
        const reason = 'WORKER_AUTHORITY_FAILURE'
        this.#publish('carrier-failed', reason)
        for (const listener of this.#failureListeners) listener(reason)
      }).finally(() => { checking = false })
      this.#healthInFlight = probe
      void probe.finally(() => { if (this.#healthInFlight === probe) this.#healthInFlight = undefined })
    }, 1_000)
    this.#healthTimer.unref()
  }
  detach(): void {
    this.#attachmentRevision++
    clearInterval(this.#healthTimer)
    this.#bootstrap?.secret.fill(0)
    this.#bootstrap?.lifecycle?.destroy()
    this.#bootstrap = undefined
  }
  // Recovery never starts a candidate while any old process or OS authority
  // remains live/ambiguous. PID reuse is conservatively treated as still live.
  async recover(): Promise<CarrierBootstrap> {
    const old = this.#status
    this.detach()
    if (this.#healthInFlight !== undefined) await Promise.race([this.#healthInFlight, delay(2_000)])
    const deadline = Date.now() + 8_000
    while (Date.now() < deadline) {
      try {
        const status = await this.discover()
        if (old !== undefined && status.workerInstanceId !== old.workerInstanceId && !authorityProcessesGone(old)) {
          throw new Error('AUTHORITY_AMBIGUOUS_FAIL_CLOSED')
        }
        if (status.state !== 'DETACHED') { await delay(250); continue }
        return await this.start()
      } catch (error) {
        const reason = error instanceof Error ? error.message : ''
        if (reason === 'BUSY') { await delay(250); continue }
        if (reason !== 'WORKER_NOT_FOUND') throw error
        if (old !== undefined && !authorityProcessesGone(old)) { await delay(250); continue }
        const platform = await inspectLocalPlatform(this.config.nativeHelperPath)
        if (platform.mutexExists || platform.lifecycleBusy) throw new Error('AUTHORITY_AMBIGUOUS_FAIL_CLOSED')
        this.#status = undefined
        return await this.start()
      }
    }
    throw new Error('RECONNECT_FAILED: authority unavailable or prior death unproven')
  }
  // Bounded internal controlled shutdown; never exposed through preload/Renderer.
  // The controlled stop is serialized against the in-flight health discovery so the
  // single lifecycle pipe cannot reject stop-authority as BUSY. Delivery is reported
  // explicitly instead of being swallowed.
  async stop(): Promise<StopResult> {
    const status = this.#status
    this.detach()
    if (status === undefined) return { exited: true, delivery: 'STOP_DELIVERED' }
    // Wait for the single in-flight health/discovery request to release the lifecycle
    // pipe before sending the unique controlled stop. Bounded; no blind retry loop.
    const inFlight = this.#healthInFlight
    if (inFlight !== undefined) await Promise.race([inFlight.then(() => undefined, () => undefined), delay(2_000)])
    let delivery: StopDelivery
    let reason: string | undefined
    try {
      const { response } = await lifecycleRequest(this.config.nativeHelperPath, 'stop-authority', status.workerInstanceId)
      if (response.type === 'stopping') delivery = 'STOP_DELIVERED'
      else if (response.type === 'rejected') { delivery = 'STOP_REJECTED'; reason = typeof response.reason === 'string' ? response.reason : undefined }
      else { delivery = 'STOP_DELIVERY_FAILED'; reason = `unexpected response ${response.type}` }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message === 'BUSY') {
        // Transient pipe recycling: one bounded synchronization, then a single retry.
        delivery = 'STOP_PIPE_BUSY'
        await delay(250)
        try {
          const { response } = await lifecycleRequest(this.config.nativeHelperPath, 'stop-authority', status.workerInstanceId)
          if (response.type === 'stopping') delivery = 'STOP_DELIVERED'
          else { delivery = 'STOP_DELIVERY_FAILED'; reason = `retry ${response.type}` }
        } catch (retryError) {
          delivery = 'STOP_DELIVERY_FAILED'
          reason = retryError instanceof Error ? retryError.message : String(retryError)
        }
      } else {
        delivery = 'STOP_DELIVERY_FAILED'
        reason = message
      }
    }
    const deadline = Date.now() + 8_000
    while (Date.now() < deadline) {
      if ([status.worker.pid, status.host.pid, status.helper.pid].every(pid => {
        try { process.kill(pid, 0); return false } catch { return true }
      })) return { workerPid: status.worker.pid, exited: true, delivery, reason }
      await new Promise(resolveDelay => setTimeout(resolveDelay, 100))
    }
    if (delivery === 'STOP_DELIVERED') { delivery = 'STOP_DELIVERED_BUT_AUTHORITY_DID_NOT_EXIT' }
    return { workerPid: status.worker.pid, exited: false, delivery, reason }
  }
}

export function authorityProcessesGone(status: AuthorityStatus): boolean {
  return [status.worker.pid, status.host.pid, status.helper.pid].every(pid => {
    try { process.kill(pid, 0); return false }
    catch (error) { return (error as NodeJS.ErrnoException).code === 'ESRCH' }
  })
}
