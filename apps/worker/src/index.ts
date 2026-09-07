import { spawn, type ChildProcessByStdio } from 'node:child_process'
import { dirname, join } from 'node:path'
import type { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import {
  BOOTSTRAP_PROTOCOL_VERSION,
  type BootstrapEvent,
  type BootstrapPhase,
} from '@shaco-forge/contracts'
import {
  EXPECTED_HARNESS_COMMIT,
  EXPECTED_HARNESS_PACKAGE,
  EXPECTED_HARNESS_RELEASE,
  EXPECTED_WORKER_NODE_VERSION,
  readWorkerConfig,
} from './config.js'
import { materializeHarnessProfile } from './profile.js'
import { materializeFrozenHarnessRuntime } from './harness-runtime.js'

const sourceDir = dirname(fileURLToPath(import.meta.url))
let host: ChildProcessByStdio<null, Readable, Readable> | undefined
let stopping = false

function emit(phase: BootstrapPhase, extra: Partial<BootstrapEvent> = {}): void {
  const event: BootstrapEvent = {
    protocolVersion: BOOTSTRAP_PROTOCOL_VERSION,
    phase,
    timestamp: new Date().toISOString(),
    workerPid: process.pid,
    parentPid: process.ppid,
    workerNodeVersion: process.version,
    workerExecutable: process.execPath,
    workerArgv: process.argv.slice(1),
    harnessPackage: EXPECTED_HARNESS_PACKAGE,
    harnessRelease: EXPECTED_HARNESS_RELEASE,
    harnessCommit: EXPECTED_HARNESS_COMMIT,
    ...extra,
  }
  process.stdout.write(`${JSON.stringify(event)}\n`)
}

async function stop(exitCode = 0): Promise<void> {
  if (stopping) return
  stopping = true
  const current = host
  if (current !== undefined && current.exitCode === null && current.signalCode === null) {
    current.kill('SIGTERM')
    await Promise.race([
      new Promise<void>(resolve => current.once('exit', () => resolve())),
      new Promise<void>(resolve => setTimeout(resolve, 5_000)),
    ])
    if (current.exitCode === null && current.signalCode === null) {
      current.kill('SIGKILL')
      await Promise.race([
        new Promise<void>(resolve => current.once('exit', () => resolve())),
        new Promise<void>(resolve => setTimeout(resolve, 2_000)),
      ])
    }
  }
  emit('worker-stopped', { hostPid: current?.pid, exitCode })
  process.exit(exitCode)
}

async function main(): Promise<void> {
  if (process.version !== EXPECTED_WORKER_NODE_VERSION) {
    throw new Error(`Worker requires ${EXPECTED_WORKER_NODE_VERSION}; received ${process.version}`)
  }
  const config = readWorkerConfig(process.env)
  const runtime = await materializeFrozenHarnessRuntime(config.harnessRoot, config.dshHome)
  emit('worker-starting', {
    dshHome: config.dshHome,
    harnessCliPath: runtime.cliPath,
    harnessSourceRoot: config.harnessRoot,
    profileName: config.profileName,
  })

  const readinessModulePath = join(sourceDir, 'harness-readiness.js')
  const harnessScopePath = join(runtime.overlayNodeModules, '@deepseek-ai')
  const profilePath = await materializeHarnessProfile(
    config.dshHome,
    config.profileName,
    readinessModulePath,
    harnessScopePath,
    runtime.overlayNodeModules,
  )
  const hostLaunchArgv = [runtime.cliPath, '--profile', config.profileName]
  host = spawn(process.execPath, hostLaunchArgv, {
    cwd: dirname(runtime.cliPath),
    env: {
      ...process.env,
      DSH_HOME: config.dshHome,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  emit('host-starting', {
    hostPid: host.pid,
    hostLaunchArgv: [process.execPath, ...hostLaunchArgv],
    profileName: config.profileName,
    profilePath,
    dshHome: config.dshHome,
    harnessCliPath: runtime.cliPath,
    harnessSourceRoot: config.harnessRoot,
  })

  let stdoutBuffer = ''
  host.stdout.setEncoding('utf8')
  host.stdout.on('data', (chunk: string) => {
    stdoutBuffer += chunk
    const lines = stdoutBuffer.split(/\r?\n/)
    stdoutBuffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('SHACO_FORGE_HOST_READY ')) continue
      const payload = JSON.parse(line.slice('SHACO_FORGE_HOST_READY '.length)) as {
        gatewayPresetCount: number
        standardPresetPresent: boolean
      }
      emit('host-ready', {
        hostPid: host?.pid,
        hostLaunchArgv: [process.execPath, ...hostLaunchArgv],
        profileName: config.profileName,
        profilePath,
        dshHome: config.dshHome,
        harnessCliPath: runtime.cliPath,
        harnessSourceRoot: config.harnessRoot,
        readiness: {
          gatewayPresetCount: payload.gatewayPresetCount,
          standardPresetPresent: payload.standardPresetPresent,
        },
      })
    }
  })
  host.stderr.setEncoding('utf8')
  host.stderr.on('data', (chunk: string) => process.stderr.write(chunk))
  host.once('exit', (exitCode, signal) => {
    emit('host-exited', { hostPid: host?.pid, exitCode, signal })
    if (!stopping) void stop(exitCode ?? 1)
  })
}

process.once('SIGTERM', () => void stop(0))
process.once('SIGINT', () => void stop(0))

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  emit('worker-failed', { error: message })
  void stop(1)
})
