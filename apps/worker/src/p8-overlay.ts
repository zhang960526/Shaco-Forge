import { createHash } from 'node:crypto'
import { lstat, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import type { P8Activation } from '@shaco-forge/contracts/p8-activation'

export const P8_OVERLAY_FILENAME = 'p8-acceptance-overlay.cordis.yml'

export interface P8Overlay {
  path: string
  sha256: string
}

function overlayBytes(activation: P8Activation): string {
  return [
    '- id: shaco-forge-provider-execution-guard',
    '  config:',
    `    budget: ${activation.modelDispatchBudget}`,
    '    p8Acceptance:',
    '      enabled: true',
    '      provider: deepseek-official',
    '      model: deepseek-v4-flash',
    `      scenarioId: ${JSON.stringify(activation.scenarioId)}`,
    `      authorizationId: ${JSON.stringify(activation.authorizationId)}`,
    `      retryMaxRetries: ${activation.maxRetries}`,
    '',
    '- id: llm-deepseek',
    '  config:',
    '    retryPolicy:',
    '      mode: normal',
    `      maxRetries: ${activation.maxRetries}`,
    '',
  ].join('\n')
}

async function assertCanonicalControlParent(dshHome: string): Promise<string> {
  const parent = resolve(dirname(dshHome), 'control')
  if (!isAbsolute(parent)) throw new Error('P8_OVERLAY_PARENT_NOT_ABSOLUTE')
  const info = await lstat(parent)
  if (!info.isDirectory() || info.isSymbolicLink() || await realpath(parent) !== parent) {
    throw new Error('P8_OVERLAY_PARENT_IDENTITY_REJECTED')
  }
  return parent
}

export async function assertP8OverlayTargetCompatible(overlayNodeModules: string): Promise<void> {
  const patchPath = join(overlayNodeModules, '@deepseek-ai', 'dsh-base', 'cordis.patch.yml')
  const lines = (await readFile(patchPath, 'utf8')).split(/\r?\n/)
  const indexes = lines.flatMap((line, index) => line === '    - id: llm-deepseek' ? [index] : [])
  if (indexes.length !== 1) throw new Error('P8_OVERLAY_DEEPSEEK_ROW_IDENTITY_REJECTED')
  const start = indexes[0]!
  let end = lines.length
  for (let index = start + 1; index < lines.length; index++) {
    if (lines[index]?.startsWith('    - id: ')) { end = index; break }
  }
  const row = lines.slice(start, end)
  if (!row.includes("      name: '@deepseek-ai/dsh-llm-deepseek'")
    || row.some(line => line.trimStart().startsWith('config:'))) {
    throw new Error('P8_OVERLAY_DEEPSEEK_CONFIG_REPLACEMENT_UNSAFE')
  }
}

export async function assertP8OverlayPreflight(
  dshHome: string,
  overlayNodeModules: string,
): Promise<string> {
  const parent = await assertCanonicalControlParent(dshHome)
  await assertP8OverlayTargetCompatible(overlayNodeModules)
  return join(parent, P8_OVERLAY_FILENAME)
}

async function assertTargetAbsent(target: string): Promise<void> {
  const existing = await lstat(target).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return undefined
    throw error
  })
  if (existing !== undefined) throw new Error('P8_OVERLAY_STALE_OR_COLLISION')
}

export async function createP8Overlay(
  dshHome: string,
  overlayNodeModules: string,
  activation: P8Activation,
): Promise<P8Overlay> {
  const path = await assertP8OverlayPreflight(dshHome, overlayNodeModules)
  await assertTargetAbsent(path)
  const bytes = overlayBytes(activation)
  const sha256 = createHash('sha256').update(bytes, 'utf8').digest('hex')
  try {
    await writeFile(path, bytes, { encoding: 'utf8', flag: 'wx', flush: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error('P8_OVERLAY_STALE_OR_COLLISION')
    throw error
  }
  const info = await lstat(path)
  if (!info.isFile() || info.isSymbolicLink() || await realpath(path) !== path) {
    throw new Error('P8_OVERLAY_TARGET_IDENTITY_REJECTED')
  }
  const actual = createHash('sha256').update(await readFile(path)).digest('hex')
  if (actual !== sha256) throw new Error('P8_OVERLAY_SHA256_BINDING_FAILED')
  return Object.freeze({ path, sha256 })
}

export async function cleanupP8Overlay(overlay: P8Overlay): Promise<void> {
  const info = await lstat(overlay.path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return undefined
    throw error
  })
  if (info === undefined) return
  if (!info.isFile() || info.isSymbolicLink() || await realpath(overlay.path) !== overlay.path) {
    throw new Error('P8_OVERLAY_CLEANUP_IDENTITY_REJECTED')
  }
  const actual = createHash('sha256').update(await readFile(overlay.path)).digest('hex')
  if (actual !== overlay.sha256) throw new Error('P8_OVERLAY_CLEANUP_SHA256_MISMATCH')
  await rm(overlay.path)
}
