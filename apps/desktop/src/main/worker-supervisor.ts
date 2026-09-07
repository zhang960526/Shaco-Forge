import { spawn, type ChildProcess } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { access } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import type { Readable, Writable } from 'node:stream'
import { encodeJsonFrame, isRecord, JsonFrameDecoder, parseBootstrapEvent, type BootstrapEvent } from '@shaco-forge/contracts'

export const WORKER_STARTUP_TIMEOUT_MS = 90_000

export interface SupervisorConfig {
  workerNodePath: string
  workerEntryPath: string
  nativeHelperPath: string
  harnessRoot: string
  dshHome: string
  profileName: string
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
    profileName: env.SHACO_FORGE_HARNESS_PROFILE_NAME?.trim() || 'shaco-forge-v1-slice-1b',
  }
}

export function mapWorkerTerminal(exitCode: number | null, signal: NodeJS.Signals | null): string {
  return `Worker exited before or after Carrier readiness (${exitCode ?? signal ?? 'unknown'})`
}

export class WorkerTerminationState {
  #deliberateStop = false

  beginDeliberateStop(): void {
    this.#deliberateStop = true
  }

  unexpectedFailure(exitCode: number | null, signal: NodeJS.Signals | null): string | undefined {
    return this.#deliberateStop ? undefined : mapWorkerTerminal(exitCode, signal)
  }
}

function asReadable(value: unknown, name: string): Readable {
  if (value === null || typeof value !== 'object' || !('on' in value)) throw new Error(`${name} readable pipe is unavailable`)
  return value as Readable
}

function asWritable(value: unknown, name: string): Writable {
  if (value === null || typeof value !== 'object' || !('write' in value)) throw new Error(`${name} writable pipe is unavailable`)
  return value as Writable
}

export class WorkerSupervisor {
  readonly events: BootstrapEvent[] = []
  #child: ChildProcess | undefined
  #listeners = new Set<(event: BootstrapEvent) => void>()
  #failureListeners = new Set<(reason: string) => void>()
  #carrierBootstrap: CarrierBootstrap | undefined
  #termination = new WorkerTerminationState()

  constructor(readonly config: SupervisorConfig, readonly startupTimeoutMs = WORKER_STARTUP_TIMEOUT_MS) {}

  onEvent(listener: (event: BootstrapEvent) => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  onCarrierFailure(listener: (reason: string) => void): () => void {
    this.#failureListeners.add(listener)
    return () => this.#failureListeners.delete(listener)
  }

  #publishFailure(reason: string): void {
    for (const listener of this.#failureListeners) listener(reason)
  }

  async start(): Promise<CarrierBootstrap> {
    if (this.#child !== undefined) throw new Error('Worker is already started')
    await Promise.all([
      access(this.config.workerNodePath),
      access(this.config.workerEntryPath),
      access(this.config.nativeHelperPath),
      access(this.config.harnessRoot),
    ])
    const secret = randomBytes(32)
    const workerInstanceId = randomUUID()
    const credentialEpoch = randomUUID()
    const child = spawn(this.config.workerNodePath, [this.config.workerEntryPath], {
      env: {
        ...process.env,
        SHACO_FORGE_DSH_HOME: this.config.dshHome,
        SHACO_FORGE_HARNESS_ROOT: this.config.harnessRoot,
        SHACO_FORGE_HARNESS_PROFILE_NAME: this.config.profileName,
        SHACO_FORGE_NATIVE_HELPER: this.config.nativeHelperPath,
      },
      stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })
    this.#child = child
    const credentialPipe = asWritable(child.stdio[3], 'Worker credential')
    const privateControl = asReadable(child.stdio[4], 'Worker private control')
    credentialPipe.end(encodeJsonFrame({
      type: 'helper-bootstrap',
      secret: secret.toString('hex'),
      workerInstanceId,
      credentialEpoch,
    }))

    let buffer = ''
    const stdout = asReadable(child.stdout, 'Worker stdout')
    stdout.setEncoding('utf8')
    stdout.on('data', (chunk: string) => {
      buffer += chunk
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const event = parseBootstrapEvent(line)
        if (event === undefined) continue
        this.events.push(event)
        for (const listener of this.#listeners) listener(event)
      }
    })
    const stderr = asReadable(child.stderr, 'Worker stderr')
    stderr.setEncoding('utf8')
    stderr.on('data', (chunk: string) => process.stderr.write(`[worker] ${chunk}`))

    return await new Promise<CarrierBootstrap>((resolveReady, rejectReady) => {
      let settled = false
      const timeout = setTimeout(() => {
        if (settled) return
        settled = true
        child.kill('SIGTERM')
        rejectReady(new Error(`Worker startup timed out after ${this.startupTimeoutMs} ms`))
      }, this.startupTimeoutMs)
      const decoder = new JsonFrameDecoder()
      privateControl.on('data', (chunk: Buffer) => {
        try {
          for (const value of decoder.push(chunk)) {
            if (!isRecord(value) || typeof value.type !== 'string') throw new Error('Worker private control envelope is invalid')
            if (value.type === 'carrier-failed') {
              const reason = typeof value.reason === 'string' ? value.reason : 'Carrier failed'
              this.#publishFailure(reason)
              if (!settled) {
                settled = true
                clearTimeout(timeout)
                rejectReady(new Error(reason))
              }
              continue
            }
            if (value.type !== 'carrier-ready'
              || !isRecord(value.helper)
              || !isRecord(value.host)
              || typeof value.helper.pipeEndpoint !== 'string'
              || typeof value.helper.endpointId !== 'string'
              || typeof value.helper.pipeEndpointHashPrefix !== 'string'
              || typeof value.helper.helperPid !== 'number') throw new Error('Carrier ready metadata is invalid')
            if (settled) throw new Error('Duplicate Carrier ready metadata')
            const ready: CarrierBootstrap = {
              pipeEndpoint: value.helper.pipeEndpoint,
              endpointId: value.helper.endpointId,
              pipeEndpointHashPrefix: value.helper.pipeEndpointHashPrefix,
              helperPid: value.helper.helperPid,
              workerInstanceId,
              credentialEpoch,
              secret,
              security: value.helper,
              hostPreflight: value.host,
            }
            this.#carrierBootstrap = ready
            settled = true
            clearTimeout(timeout)
            resolveReady(ready)
          }
        } catch (error) {
          if (!settled) {
            settled = true
            clearTimeout(timeout)
            rejectReady(error)
          } else {
            this.#publishFailure('Worker private control validation failed')
          }
        }
      })
      child.once('exit', (exitCode, signal) => {
        const reason = this.#termination.unexpectedFailure(exitCode, signal)
        if (reason !== undefined) this.#publishFailure(reason)
        if (!settled) {
          settled = true
          clearTimeout(timeout)
          rejectReady(new Error(reason ?? 'Worker stopped deliberately before Carrier readiness'))
        }
      })
      child.once('error', error => {
        const reason = `Worker process failed to start: ${error.message}`
        this.#publishFailure(reason)
        if (!settled) {
          settled = true
          clearTimeout(timeout)
          rejectReady(new Error(reason))
        }
      })
    })
  }

  async stop(): Promise<{ workerPid?: number; exited: boolean }> {
    this.#termination.beginDeliberateStop()
    const child = this.#child
    if (child === undefined) return { exited: true }
    this.#carrierBootstrap?.secret.fill(0)
    this.#carrierBootstrap = undefined
    const workerPid = child.pid
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM')
      await Promise.race([
        new Promise<void>(resolveExit => child.once('exit', () => resolveExit())),
        new Promise<void>(resolveTimeout => setTimeout(resolveTimeout, 7_000)),
      ])
    }
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL')
      await Promise.race([
        new Promise<void>(resolveExit => child.once('exit', () => resolveExit())),
        new Promise<void>(resolveTimeout => setTimeout(resolveTimeout, 3_000)),
      ])
    }
    return { workerPid, exited: child.exitCode !== null || child.signalCode !== null }
  }
}
