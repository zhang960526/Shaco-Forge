/** NOT_PRODUCTION: stable-root Worker discovery and exact OS identity checks. */
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
function processSnapshot(pwshPath, pid) {
  const script = [
    `$p=Get-Process -Id ${Number(pid)} -ErrorAction Stop`,
    `[ordered]@{pid=$p.Id;startTimeUtc=$p.StartTime.ToUniversalTime().ToString('o')} | ConvertTo-Json -Compress`,
  ].join('; ')
  return JSON.parse(execFileSync(pwshPath, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8',
    windowsHide: true,
  }))
}

function sameStartTime(expected, actual) {
  return Math.abs(Date.parse(expected) - Date.parse(actual)) <= 10
}

export async function readAndValidateDiscovery({ discoveryRoot, pwshPath }) {
  const descriptorPath = join(discoveryRoot, 'worker-discovery.json')
  const descriptor = JSON.parse(await readFile(descriptorPath, 'utf8'))
  const carrier = processSnapshot(pwshPath, descriptor.carrierPid)
  const dsh = processSnapshot(pwshPath, descriptor.dshPid)
  if (!sameStartTime(descriptor.carrierStartTimeUtc, carrier.startTimeUtc)) {
    throw new Error('Worker Carrier PID/start-time identity mismatch')
  }
  if (!sameStartTime(descriptor.dshStartTimeUtc, dsh.startTimeUtc)) {
    throw new Error('dsh PID/start-time identity mismatch')
  }
  return descriptor
}

export async function waitForReplacement({ discoveryRoot, pwshPath, previousWorkerInstanceId, timeoutMs = 30000 }) {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    try {
      const descriptor = await readAndValidateDiscovery({ discoveryRoot, pwshPath })
      if (descriptor.workerInstanceId !== previousWorkerInstanceId) return descriptor
    } catch (error) {
      lastError = error
    }
    await sleep(100)
  }
  throw new Error(`Timed out waiting for a replacement Worker identity: ${lastError?.message ?? 'unchanged discovery'}`)
}

export async function readCredential(descriptor) {
  const credential = JSON.parse(await readFile(descriptor.credentialPath, 'utf8'))
  if (credential.credentialEpoch !== descriptor.credentialEpoch) {
    throw new Error('Worker credential epoch mismatch')
  }
  return credential
}
