import { isAbsolute, resolve } from 'node:path'

export const EXPECTED_WORKER_NODE_VERSION = 'v22.19.0'
export const EXPECTED_HARNESS_PACKAGE = '@deepseek-ai/dsh@0.1.2-alpha.1'
export const EXPECTED_HARNESS_RELEASE = 'dsh-v0.1.2-alpha.1'
export const EXPECTED_HARNESS_COMMIT = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'

export interface WorkerConfig {
  dshHome: string
  harnessRoot: string
  nativeHelperPath: string
  profileName: string
}

function requiredAbsolutePath(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') throw new Error(`${name} is required`)
  if (!isAbsolute(value)) throw new Error(`${name} must be an absolute input path`)
  return resolve(value)
}

export function readWorkerConfig(env: NodeJS.ProcessEnv): WorkerConfig {
  const profileName = env.SHACO_FORGE_HARNESS_PROFILE_NAME?.trim() || 'shaco-forge-v1-slice-1b'
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(profileName)) {
    throw new Error('SHACO_FORGE_HARNESS_PROFILE_NAME is invalid')
  }
  return {
    dshHome: requiredAbsolutePath('SHACO_FORGE_DSH_HOME', env.SHACO_FORGE_DSH_HOME),
    harnessRoot: requiredAbsolutePath('SHACO_FORGE_HARNESS_ROOT', env.SHACO_FORGE_HARNESS_ROOT),
    nativeHelperPath: requiredAbsolutePath('SHACO_FORGE_NATIVE_HELPER', env.SHACO_FORGE_NATIVE_HELPER),
    profileName,
  }
}
