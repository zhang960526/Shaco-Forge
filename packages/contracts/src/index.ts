export const BOOTSTRAP_PROTOCOL_VERSION = 1 as const

export type BootstrapPhase =
  | 'worker-starting'
  | 'host-starting'
  | 'host-ready'
  | 'host-exited'
  | 'worker-failed'
  | 'worker-stopped'

export interface BootstrapEvent {
  protocolVersion: typeof BOOTSTRAP_PROTOCOL_VERSION
  phase: BootstrapPhase
  timestamp: string
  workerPid: number
  parentPid: number
  workerNodeVersion: string
  workerExecutable: string
  workerArgv: string[]
  hostPid?: number
  hostLaunchArgv?: string[]
  profileName?: string
  profilePath?: string
  dshHome?: string
  harnessCliPath?: string
  harnessSourceRoot?: string
  harnessPackage?: string
  harnessRelease?: string
  harnessCommit?: string
  readiness?: {
    gatewayPresetCount: number
    standardPresetPresent: boolean
  }
  exitCode?: number | null
  signal?: string | null
  error?: string
}

export function parseBootstrapEvent(input: string): BootstrapEvent | undefined {
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    return undefined
  }
  if (typeof value !== 'object' || value === null) return undefined
  const candidate = value as Partial<BootstrapEvent>
  if (candidate.protocolVersion !== BOOTSTRAP_PROTOCOL_VERSION) return undefined
  if (typeof candidate.phase !== 'string') return undefined
  if (typeof candidate.timestamp !== 'string') return undefined
  if (!Number.isInteger(candidate.workerPid) || !Number.isInteger(candidate.parentPid)) return undefined
  if (typeof candidate.workerNodeVersion !== 'string') return undefined
  if (typeof candidate.workerExecutable !== 'string') return undefined
  if (!Array.isArray(candidate.workerArgv) || candidate.workerArgv.some(item => typeof item !== 'string')) return undefined
  return candidate as BootstrapEvent
}
