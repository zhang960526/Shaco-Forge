import { spawn, type ChildProcessByStdio } from 'node:child_process'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Readable } from 'node:stream'
import { parseBootstrapEvent, type BootstrapEvent } from '@shaco-forge/contracts'

export interface SupervisorConfig {
  workerNodePath: string
  workerEntryPath: string
  harnessRoot: string
  dshHome: string
  profileName: string
}

function requiredPath(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]
  if (value === undefined || value.trim() === '') throw new Error(`${key} is required for development bootstrap`)
  return resolve(value)
}

export function readSupervisorConfig(env: NodeJS.ProcessEnv): SupervisorConfig {
  return {
    workerNodePath: requiredPath(env, 'SHACO_FORGE_WORKER_NODE'),
    workerEntryPath: requiredPath(env, 'SHACO_FORGE_WORKER_ENTRY'),
    harnessRoot: requiredPath(env, 'SHACO_FORGE_HARNESS_ROOT'),
    dshHome: requiredPath(env, 'SHACO_FORGE_DSH_HOME'),
    profileName: env.SHACO_FORGE_HARNESS_PROFILE_NAME?.trim() || 'shaco-forge-v1-slice-1a',
  }
}

export class WorkerSupervisor {
  readonly events: BootstrapEvent[] = []
  #child: ChildProcessByStdio<null, Readable, Readable> | undefined
  #listeners = new Set<(event: BootstrapEvent) => void>()

  constructor(readonly config: SupervisorConfig) {}

  onEvent(listener: (event: BootstrapEvent) => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  async start(): Promise<void> {
    if (this.#child !== undefined) throw new Error('Worker is already started')
    await Promise.all([
      access(this.config.workerNodePath),
      access(this.config.workerEntryPath),
      access(this.config.harnessRoot),
    ])
    const child = spawn(this.config.workerNodePath, [this.config.workerEntryPath], {
      env: {
        ...process.env,
        SHACO_FORGE_DSH_HOME: this.config.dshHome,
        SHACO_FORGE_HARNESS_ROOT: this.config.harnessRoot,
        SHACO_FORGE_HARNESS_PROFILE_NAME: this.config.profileName,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    this.#child = child
    let buffer = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
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
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (chunk: string) => process.stderr.write(`[worker] ${chunk}`))
  }

  async stop(): Promise<{ workerPid?: number; exited: boolean }> {
    const child = this.#child
    if (child === undefined) return { exited: true }
    const workerPid = child.pid
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
    await Promise.race([
      new Promise<void>(resolveExit => child.once('exit', () => resolveExit())),
      new Promise<void>(resolveTimeout => setTimeout(resolveTimeout, 7_000)),
    ])
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
