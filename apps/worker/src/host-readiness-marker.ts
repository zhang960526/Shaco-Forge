import { isRecord } from '@shaco-forge/contracts'

export const HOST_READINESS_PREFIX = 'SHACO_FORGE_HOST_READY '

export interface HostReadinessMarker {
  type: 'shaco-forge-host-ready'
  gatewayPresetCount: number
  standardPresetPresent: true
}

export function parseHostReadinessMarker(line: string): HostReadinessMarker | undefined {
  if (!line.startsWith(HOST_READINESS_PREFIX)) return undefined
  let value: unknown
  try {
    value = JSON.parse(line.slice(HOST_READINESS_PREFIX.length)) as unknown
  } catch {
    throw new SyntaxError('Malformed Host readiness marker JSON')
  }
  if (!isRecord(value)
    || value.type !== 'shaco-forge-host-ready'
    || !Number.isInteger(value.gatewayPresetCount)
    || value.standardPresetPresent !== true) throw new TypeError('Host readiness envelope is invalid')
  return value as unknown as HostReadinessMarker
}
