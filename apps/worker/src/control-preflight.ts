import { execFile } from 'node:child_process'
import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { assertCompatibility, fail, sixIdentities, transactionBlock } from '@shaco-forge/contracts/compatibility'
import type { ReleaseManifest } from '@shaco-forge/contracts/packaged-runtime'
import { ControlStore } from './control-store.js'

export interface ProductControlPaths { productDataRoot: string; dshHome: string; controlRoot: string; backupRoot: string; installRoot: string; canonical: boolean; writes: number }
export function assertControlReady(controlRoot: string, release?: ReleaseManifest, dshHome?: string, validation = false): void {
  const journalPath = join(controlRoot, 'upgrade-journal.json')
  if (validation && !existsSync(journalPath)) fail('RESTORE_REQUIRED')
  if (existsSync(journalPath)) {
    try {
      const info = lstatSync(journalPath)
      if (!info.isFile() || info.isSymbolicLink() || info.size > 262144) fail('RESTORE_REQUIRED')
      const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as { state: unknown }
      if (validation && journal.state !== 'VALIDATING') fail('RESTORE_REQUIRED')
      const blocked = transactionBlock(journal.state)
      if (blocked && !(validation && journal.state === 'VALIDATING')) fail(blocked)
    } catch (error) {
      if (error instanceof Error && /^(UPGRADE_IN_PROGRESS|RESTORE_REQUIRED):/.test(error.message)) throw error
      fail('RESTORE_REQUIRED')
    }
  }
  const store = new ControlStore(join(controlRoot, 'state.sqlite'))
  try {
    if (!validation) store.assertReady()
    if (release && dshHome) {
      const control = store.release()
      if (control.productVersion !== release.ProductVersion) fail('PRODUCT_RELEASE_MISMATCH')
      assertCompatibility(release, sixIdentities(release), { dshHome: control.dshHome, attestedDshHome: dshHome, transactionState: validation ? 'IDLE' : store.transaction().state, integrity: true })
    }
  } finally { store.close() }
}
export async function controlPreflight(root: string, helper: string, release: ReleaseManifest, validation = false): Promise<ProductControlPaths> {
  const { stdout } = await promisify(execFile)(helper, ['--select-product-control', root], { env: {}, windowsHide: true, timeout: 15_000 })
  const paths = JSON.parse(stdout) as ProductControlPaths
  if (!paths.canonical || paths.writes !== 0) fail('DSH_HOME_MISMATCH')
  assertPackagedControl(root, release, paths.controlRoot, paths.dshHome, validation)
  return paths
}

export function assertPackagedControl(root: string, release: ReleaseManifest, controlRoot: string, dshHome: string, validation = false): void {
  assertControlReady(controlRoot, release, dshHome, validation)
  const store = new ControlStore(join(controlRoot, 'state.sqlite'))
  const installed = store.release(); store.close()
  const packaged = JSON.parse(readFileSync(join(root, 'artifact-identity.json'), 'utf8')) as { digest: string; releaseManifestSha256: string }
  if (installed.artifactDigest !== packaged.digest || installed.releaseManifestDigest !== packaged.releaseManifestSha256) fail('PRODUCT_RELEASE_MISMATCH')
  if (validation) {
    const journal = JSON.parse(readFileSync(join(controlRoot, 'upgrade-journal.json'), 'utf8')) as { target?: { artifactDigest?: string }; installed?: boolean }
    if (!journal.installed || journal.target?.artifactDigest !== packaged.digest) fail('RESTORE_REQUIRED')
  }
}
