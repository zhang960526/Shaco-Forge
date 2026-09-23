import { spawn } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { createConnection, type Socket } from 'node:net'
import { encodeJsonFrame, isRecord, JsonFrameDecoder } from '@shaco-forge/contracts'

export interface ProcessIdentity { pid: number; startTime: string }
export interface AuthorityStatus {
  type: 'authority-status'
  protocolVersion: string
  workerInstanceId: string
  worker: ProcessIdentity
  host: ProcessIdentity
  helper: ProcessIdentity
  healthy: boolean
  state: string
  compatibility?: import('@shaco-forge/contracts/compatibility').SixIdentities
  dshHome?: string
  upgradeState?: string
  hostPreflight: Record<string, unknown>
  workerRuntime: { nodeVersion: string; executable: string; argv: string[]; parentPid: number }
}

async function nativeOperation(helperPath: string, args: string[], pipe?: Socket): Promise<Record<string, unknown>> {
  const child = spawn(helperPath, args, { windowsHide: true, env: {}, stdio: pipe === undefined ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe', pipe] })
  let stdout = ''
  child.stdout!.setEncoding('utf8')
  child.stdout!.on('data', (chunk: string) => { stdout += chunk; if (stdout.length > 16_384) child.kill() })
  child.stderr!.resume()
  return await new Promise((resolveValue, rejectValue) => {
    const timer = setTimeout(() => { child.kill(); rejectValue(new Error('Native lifecycle inspection timed out')) }, 5_000)
    child.once('error', () => { clearTimeout(timer); rejectValue(new Error('Native lifecycle inspection failed')) })
    child.once('exit', code => {
      clearTimeout(timer)
      try {
        if (code !== 0) throw new Error('Native lifecycle inspection rejected')
        const value: unknown = JSON.parse(stdout)
        if (!isRecord(value)) throw new Error('Native lifecycle inspection invalid')
        resolveValue(value)
      } catch { rejectValue(new Error('Native lifecycle inspection rejected')) }
    })
  })
}

export async function inspectLocalPlatform(helperPath: string): Promise<{ process: ProcessIdentity; lifecycleName: string; mutexExists: boolean; lifecycleBusy: boolean }> {
  return await nativeOperation(helperPath, ['--platform', String(process.pid)]) as unknown as { process: ProcessIdentity; lifecycleName: string; mutexExists: boolean; lifecycleBusy: boolean }
}

export function lifecycleFrame(socket: Socket, request: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolveFrame, rejectFrame) => {
    const decoder = new JsonFrameDecoder()
    const timer = setTimeout(() => finish(new Error('Lifecycle response timed out')), 5_000)
    const onData = (chunk: Buffer): void => {
      try {
        const frames = decoder.push(chunk)
        if (frames.length === 0) return
        if (frames.length !== 1 || !isRecord(frames[0])) throw new Error('Lifecycle response invalid')
        finish(undefined, frames[0])
      } catch { finish(new Error('Lifecycle response invalid')) }
    }
    const onClose = (): void => finish(new Error('Lifecycle connection lost'))
    function finish(error?: Error, value?: Record<string, unknown>): void {
      clearTimeout(timer); socket.off('data', onData); socket.off('close', onClose)
      if (error) { socket.destroy(); rejectFrame(error) } else resolveFrame(value!)
    }
    socket.on('data', onData); socket.once('close', onClose)
    // child_process pauses streams passed as inherited stdio. Native inspection
    // only queried the handle; return read ownership to Main before the request.
    socket.resume()
    socket.write(encodeJsonFrame(request), error => { if (error) finish(new Error('Lifecycle write failed')) })
  })
}

export async function openLifecycle(helperPath: string): Promise<{ socket: Socket; process: ProcessIdentity; peer: ProcessIdentity; acl: Record<string, unknown> }> {
  const platform = await inspectLocalPlatform(helperPath)
  if (platform.lifecycleBusy) throw new Error('BUSY')
  const socket = createConnection(`\\\\.\\pipe\\${platform.lifecycleName}`)
  socket.on('error', () => {})
  try {
    await new Promise<void>((resolveConnect, rejectConnect) => {
      const timer = setTimeout(() => { socket.destroy(); rejectConnect(new Error('AUTHORITY_DISCOVERY_TIMEOUT')) }, 3_000)
      socket.once('connect', () => { clearTimeout(timer); resolveConnect() })
      socket.once('error', error => {
        clearTimeout(timer)
        const code = (error as NodeJS.ErrnoException).code
        rejectConnect(new Error(code === 'ENOENT' && !platform.mutexExists ? 'WORKER_NOT_FOUND' : code === 'EBUSY' ? 'BUSY' : 'AUTHORITY_AMBIGUOUS_FAIL_CLOSED'))
      })
    })
    const inspected = await nativeOperation(helperPath, ['--inspect-pipe'], socket)
    if (!isRecord(inspected.acl) || inspected.acl.verified !== true || !isRecord(inspected.peer)) throw new Error('Lifecycle server inspection rejected')
    return { socket, process: platform.process, peer: inspected.peer as unknown as ProcessIdentity, acl: inspected.acl }
  } catch (error) { socket.destroy(); throw error }
}

export function validateAuthority(value: unknown, peer: ProcessIdentity): AuthorityStatus {
  if (!isRecord(value) || value.type !== 'authority-status' || value.protocolVersion !== '1'
    || typeof value.workerInstanceId !== 'string' || value.healthy !== true
    || !isRecord(value.helper) || value.helper.pid !== peer.pid || value.helper.startTime !== peer.startTime
    || !isRecord(value.worker) || !isRecord(value.host) || !isRecord(value.hostPreflight)) throw new Error('AUTHORITY_IDENTITY_OR_HEALTH_REJECTED')
  return value as unknown as AuthorityStatus
}

export async function lifecycleRequest(helperPath: string, type: 'discover' | 'attach' | 'stop-authority' | 'upgrade-drain', workerInstanceId?: string, controls: Record<string, unknown> = {}): Promise<{ response: Record<string, unknown>; socket: Socket; status?: AuthorityStatus }> {
  const connection = await openLifecycle(helperPath)
  try {
    const response = await lifecycleFrame(connection.socket, {
      type, protocolVersion: '1', pid: connection.process.pid, startTime: connection.process.startTime,
      desktopInstanceId: randomUUID(), nonce: randomBytes(32).toString('hex'), workerInstanceId, ...controls,
    })
    if (response.type === 'rejected') throw new Error(typeof response.reason === 'string' ? response.reason : 'LIFECYCLE_REJECTED')
    if (type === 'stop-authority' || type === 'upgrade-drain') { connection.socket.destroy(); return { response, socket: connection.socket } }
    const status = validateAuthority(type === 'attach' ? response.status : response, connection.peer)
    if (type === 'discover') connection.socket.destroy()
    return { response, socket: connection.socket, status }
  } catch (error) { connection.socket.destroy(); throw error }
}
