import { isRecord } from '@shaco-forge/contracts'

export const HOST_READINESS_PREFIX = 'SHACO_FORGE_HOST_READY '

export interface HostReadinessMarker {
  type: 'shaco-forge-host-ready'
  gatewayPresetCount: number
  standardPresetPresent: true
  P8_ENABLED?: boolean
  SCENARIO_ID?: string
  AUTHORIZATION_ID?: string
  SCENARIO_BUDGET_INITIAL?: number
  SCENARIO_BUDGET_REMAINING?: number
  PROVIDER?: string
  MODEL?: string
  INPUT_CLASS?: string
  RESOLVED_RETRY_MODE?: string
  RESOLVED_MAX_RETRIES?: number
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
    || value.standardPresetPresent !== true
    || value.P8_ENABLED !== undefined && typeof value.P8_ENABLED !== 'boolean') {
    throw new TypeError('Host readiness envelope is invalid')
  }
  if (value.P8_ENABLED === true && (
    typeof value.SCENARIO_ID !== 'string'
    || typeof value.AUTHORIZATION_ID !== 'string'
    || !Number.isSafeInteger(value.SCENARIO_BUDGET_INITIAL)
    || !Number.isSafeInteger(value.SCENARIO_BUDGET_REMAINING)
    || value.PROVIDER !== 'deepseek-official'
    || value.MODEL !== 'deepseek-v4-flash'
    || value.INPUT_CLASS !== 'text-only'
    || value.RESOLVED_RETRY_MODE !== 'normal'
    || value.RESOLVED_MAX_RETRIES !== 0 && value.RESOLVED_MAX_RETRIES !== 1
  )) throw new TypeError('Host P8 effective-state envelope is invalid')
  return value as unknown as HostReadinessMarker
}
