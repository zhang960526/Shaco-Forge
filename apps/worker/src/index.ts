import { spawn, type ChildProcess } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import type { Readable, Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import {
  BOOTSTRAP_PROTOCOL_VERSION,
  JsonFrameDecoder,
  STREAM_INITIAL_CREDITS,
  encodeJsonFrame,
  isRecord,
  type BootstrapEvent,
  type BootstrapPhase,
  validateClientRequestEnvelope,
  validateEndpoint,
  validateStreamOpen,
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
import { parseHostReadinessMarker } from './host-readiness-marker.js'
import { validateHostCarrierPreflight } from './host-carrier-preflight.js'

const sourceDir = dirname(fileURLToPath(import.meta.url))
let host: ChildProcess | undefined
let helper: ChildProcess | undefined
let stopping = false
let carrierReady = false
let privateControl: Writable | undefined

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

function asReadable(value: unknown, name: string): Readable {
  if (value === null || typeof value !== 'object' || !('on' in value)) throw new Error(`${name} readable pipe is unavailable`)
  return value as Readable
}

function asWritable(value: unknown, name: string): Writable {
  if (value === null || typeof value !== 'object' || !('write' in value)) throw new Error(`${name} writable pipe is unavailable`)
  return value as Writable
}

function writeFrame(stream: Writable, value: unknown): Promise<void> {
  const frame = encodeJsonFrame(value)
  return new Promise((resolveWrite, rejectWrite) => {
    stream.write(frame, error => error ? rejectWrite(error) : resolveWrite())
  })
}

function readOneFrame(stream: Readable, timeoutMs: number): Promise<Record<string, unknown>> {
  return new Promise((resolveFrame, rejectFrame) => {
    const decoder = new JsonFrameDecoder()
    const timeout = setTimeout(() => finish(new Error('Private bootstrap frame timeout')), timeoutMs)
    const onData = (chunk: Buffer): void => {
      try {
        const values = decoder.push(chunk)
        if (values.length === 0) return
        const value = values[0]
        if (!isRecord(value)) throw new Error('Private bootstrap envelope is invalid')
        finish(undefined, value)
      } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)))
      }
    }
    const onEnd = (): void => finish(new Error('Private bootstrap channel closed'))
    const finish = (error?: Error, value?: Record<string, unknown>): void => {
      clearTimeout(timeout)
      stream.off('data', onData)
      stream.off('end', onEnd)
      if (error !== undefined) rejectFrame(error)
      else resolveFrame(value as Record<string, unknown>)
    }
    stream.on('data', onData)
    stream.once('end', onEnd)
  })
}

async function stop(exitCode = 0): Promise<void> {
  if (stopping) return
  stopping = true
  for (const child of [helper, host]) {
    if (child !== undefined && child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
  }
  await Promise.race([
    Promise.all([helper, host].filter((child): child is ChildProcess => child !== undefined).map(child => new Promise<void>(resolveExit => {
      if (child.exitCode !== null || child.signalCode !== null) resolveExit()
      else child.once('exit', () => resolveExit())
    }))),
    new Promise<void>(resolveTimeout => setTimeout(resolveTimeout, 5_000)),
  ])
  for (const child of [helper, host]) {
    if (child !== undefined && child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
  }
  emit('worker-stopped', { hostPid: host?.pid, exitCode })
  process.exit(exitCode)
}

async function reportCarrierFailure(reason: string): Promise<void> {
  if (stopping) return
  carrierReady = false
  emit('carrier-failed', { hostPid: host?.pid, error: reason })
  if (privateControl !== undefined) {
    try { await writeFrame(privateControl, { type: 'carrier-failed', reason }) } catch { }
  }
  await stop(1)
}

function validateMainFrame(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || typeof value.type !== 'string') throw new TypeError('Invalid Main carrier envelope')
  if (value.type === 'unary-request') {
    if (typeof value.requestId !== 'string' || typeof value.endpoint !== 'string') throw new TypeError('Invalid unary request')
    validateEndpoint(value.endpoint)
    validateClientRequestEnvelope(value.envelope, value.endpoint)
  } else if (value.type === 'stream-open') {
    if (typeof value.streamId !== 'string' || value.initialCredits !== STREAM_INITIAL_CREDITS) throw new TypeError('Invalid stream open')
    validateStreamOpen(value.endpoint, value.payload)
  } else if (value.type === 'stream-credit') {
    if (typeof value.streamId !== 'string' || value.credit !== 1) throw new TypeError('Invalid stream credit')
  } else if (value.type === 'stream-cancel') {
    if (typeof value.streamId !== 'string') throw new TypeError('Invalid stream cancel')
  } else {
    throw new TypeError('Main carrier envelope type is not allowlisted')
  }
  return value
}

function validateHostFrame(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || typeof value.type !== 'string') throw new TypeError('Invalid Host carrier envelope')
  if (!['unary-response', 'stream-item', 'stream-end', 'stream-error'].includes(value.type)) {
    throw new TypeError('Host carrier envelope type is not allowlisted')
  }
  return value
}

async function main(): Promise<void> {
  if (process.version !== EXPECTED_WORKER_NODE_VERSION) {
    throw new Error(`Worker requires ${EXPECTED_WORKER_NODE_VERSION}; received ${process.version}`)
  }
  privateControl = createWriteStream('', { fd: 4, autoClose: false })
  const credentialInput = createReadStream('', { fd: 3, autoClose: true })
  const helperBootstrap = await readOneFrame(credentialInput, 5_000)
  credentialInput.destroy()
  if (helperBootstrap.type !== 'helper-bootstrap'
    || typeof helperBootstrap.secret !== 'string'
    || !/^[a-f0-9]{64}$/.test(helperBootstrap.secret)
    || typeof helperBootstrap.workerInstanceId !== 'string'
    || typeof helperBootstrap.credentialEpoch !== 'string') {
    throw new Error('Worker bootstrap credential envelope is invalid')
  }

  const config = readWorkerConfig(process.env)
  await access(config.nativeHelperPath)
  const runtime = await materializeFrozenHarnessRuntime(config.harnessRoot, config.dshHome)
  emit('worker-starting', {
    dshHome: config.dshHome,
    harnessCliPath: runtime.cliPath,
    harnessSourceRoot: config.harnessRoot,
    profileName: config.profileName,
  })

  const readinessModulePath = join(sourceDir, 'harness-readiness.js')
  const hostProfileRoot = resolve(sourceDir, '..', 'host-profile')
  const harnessScopePath = join(runtime.overlayNodeModules, '@deepseek-ai')
  const profilePath = await materializeHarnessProfile(
    config.dshHome,
    config.profileName,
    readinessModulePath,
    join(hostProfileRoot, 'connection-compatibility.mjs'),
    join(hostProfileRoot, 'carrier-gateway.mjs'),
    join(hostProfileRoot, 'events-route-preflight.mjs'),
    harnessScopePath,
    runtime.overlayNodeModules,
  )

  helper = spawn(config.nativeHelperPath, [], {
    cwd: dirname(config.nativeHelperPath),
    env: {},
    stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
    windowsHide: true,
  })
  const helperInput = asWritable(helper.stdin, 'Helper relay input')
  const helperOutput = asReadable(helper.stdout, 'Helper relay output')
  const helperSecret = asWritable(helper.stdio[3], 'Helper secret')
  const helperControl = asReadable(helper.stdio[4], 'Helper control')
  const helperStderr = asReadable(helper.stderr, 'Helper stderr')
  helperStderr.setEncoding('utf8')
  helperStderr.on('data', (chunk: string) => process.stderr.write(`[native-carrier] ${chunk}`))
  await writeFrame(helperSecret, helperBootstrap)
  helperSecret.end()
  helperBootstrap.secret = ''
  const helperMetadataPromise = readOneFrame(helperControl, 10_000)

  const hostLaunchArgv = [runtime.cliPath, '--profile', config.profileName]
  host = spawn(process.execPath, hostLaunchArgv, {
    cwd: dirname(runtime.cliPath),
    env: { ...process.env, DSH_HOME: config.dshHome },
    stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
    windowsHide: true,
  })
  const hostInput = asWritable(host.stdio[3], 'Host bridge input')
  const hostOutput = asReadable(host.stdio[4], 'Host bridge output')
  const hostStdout = asReadable(host.stdout, 'Host stdout')
  const hostStderr = asReadable(host.stderr, 'Host stderr')
  emit('host-starting', {
    hostPid: host.pid,
    hostLaunchArgv: [process.execPath, ...hostLaunchArgv],
    profileName: config.profileName,
    profilePath,
    dshHome: config.dshHome,
    harnessCliPath: runtime.cliPath,
    harnessSourceRoot: config.harnessRoot,
  })

  let hostReadyResolve!: () => void
  let hostReadyReject!: (error: Error) => void
  const hostReadyPromise = new Promise<void>((resolveReady, rejectReady) => {
    hostReadyResolve = resolveReady
    hostReadyReject = rejectReady
  })
  let hostWasReady = false
  let stdoutBuffer = ''
  hostStdout.setEncoding('utf8')
  hostStdout.on('data', (chunk: string) => {
    stdoutBuffer += chunk
    const lines = stdoutBuffer.split(/\r?\n/)
    stdoutBuffer = lines.pop() ?? ''
    for (const line of lines) {
      try {
        const value = parseHostReadinessMarker(line)
        if (value === undefined) continue
        hostWasReady = true
        emit('host-ready', {
          hostPid: host?.pid,
          hostLaunchArgv: [process.execPath, ...hostLaunchArgv],
          profileName: config.profileName,
          profilePath,
          dshHome: config.dshHome,
          harnessCliPath: runtime.cliPath,
          harnessSourceRoot: config.harnessRoot,
          readiness: { gatewayPresetCount: value.gatewayPresetCount, standardPresetPresent: true },
        })
        hostReadyResolve()
      } catch (error) {
        hostReadyReject(error instanceof Error ? error : new Error(String(error)))
        void reportCarrierFailure('Malformed Host readiness marker')
      }
    }
  })
  hostStderr.setEncoding('utf8')
  hostStderr.on('data', (chunk: string) => process.stderr.write(`[host] ${chunk}`))

  let preflightResolve!: (value: Record<string, unknown>) => void
  let preflightReject!: (error: Error) => void
  const hostPreflightPromise = new Promise<Record<string, unknown>>((resolvePreflight, rejectPreflight) => {
    preflightResolve = resolvePreflight
    preflightReject = rejectPreflight
  })
  let hostPreflightSeen = false
  let helperWrite = Promise.resolve()
  const hostDecoder = new JsonFrameDecoder()
  hostOutput.on('data', (chunk: Buffer) => {
    try {
      for (const value of hostDecoder.push(chunk)) {
        if (!hostPreflightSeen) {
          const preflight = validateHostCarrierPreflight(value)
          hostPreflightSeen = true
          preflightResolve(preflight)
          continue
        }
        validateHostFrame(value)
        helperWrite = helperWrite.then(() => writeFrame(helperInput, value))
      }
    } catch (error) {
      preflightReject(error instanceof Error ? error : new Error(String(error)))
      void reportCarrierFailure('Host carrier bridge validation failed')
    }
  })

  let hostWrite = Promise.resolve()
  const helperDecoder = new JsonFrameDecoder()
  helperOutput.on('data', (chunk: Buffer) => {
    try {
      for (const value of helperDecoder.push(chunk)) {
        validateMainFrame(value)
        hostWrite = hostWrite.then(() => writeFrame(hostInput, value))
      }
    } catch {
      void reportCarrierFailure('Native carrier relay validation failed')
    }
  })

  helper.once('exit', (exitCode, signal) => {
    if (!stopping) void reportCarrierFailure(`Native Helper exited (${exitCode ?? signal ?? 'unknown'})`)
  })
  host.once('exit', (exitCode, signal) => {
    emit('host-exited', { hostPid: host?.pid, exitCode, signal })
    if (!stopping) {
      if (!hostWasReady) hostReadyReject(new Error('Host exited before readiness'))
      void reportCarrierFailure(`Harness Host exited (${exitCode ?? signal ?? 'unknown'})`)
    }
  })

  const values = await Promise.all([helperMetadataPromise, hostPreflightPromise, hostReadyPromise])
  const helperMetadata = values[0]
  const hostPreflight = values[1]
  if (helperMetadata.type !== 'helper-ready'
    || typeof helperMetadata.pipeEndpoint !== 'string'
    || typeof helperMetadata.endpointId !== 'string'
    || helperMetadata.postCreateInspection !== true
    || helperMetadata.aclProtected !== true
    || helperMetadata.currentUserAllowRule !== true
    || helperMetadata.unintendedBroadAllowRule !== false
    || helperMetadata.firstPipeInstance !== true
    || helperMetadata.randomEntropyBits !== 128) {
    throw new Error('Native Helper security preflight failed')
  }
  carrierReady = true
  await writeFrame(privateControl, { type: 'carrier-ready', helper: helperMetadata, host: hostPreflight })
  emit('carrier-ready', { hostPid: host.pid })
}

process.once('SIGTERM', () => void stop(0))
process.once('SIGINT', () => void stop(0))

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  emit(carrierReady ? 'carrier-failed' : 'worker-failed', { error: message })
  void stop(1)
})
