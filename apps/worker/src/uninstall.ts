import { lstat, readFile, readdir, rmdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { hashFile, releasePath, type FileIdentity } from '@shaco-forge/contracts/packaged-runtime'
import { assertCanonical } from './durable-files.js'

export interface UninstallOperations {
  drain(): Promise<void>
  assertQuiescent(): Promise<void>
  // Production currently offers retention only. A future purge UI must supply
  // separate confirmation; direct tests use only their isolated data root.
  purgeConfirmedData(): Promise<void>
}
// The caller verifies the signed installer payload first. Bind installed identity
// envelopes to that payload while allowing unrelated entries to remain present.
export async function readUninstallInventory(installRoot: string, verifiedPayload: string): Promise<FileIdentity[]> {
  await assertCanonical(installRoot)
  for (const name of ['release-manifest.json', 'packaged-files.json', 'artifact-identity.json']) {
    const file = join(installRoot, name), info = await lstat(file)
    if (!info.isFile() || info.isSymbolicLink() || !(await readFile(file)).equals(await readFile(join(verifiedPayload, name)))) throw new Error('UNINSTALL_RELEASE_IDENTITY_MISMATCH')
  }
  const inventory = (JSON.parse(await readFile(join(verifiedPayload, 'packaged-files.json'), 'utf8')) as { files: FileIdentity[] }).files
  for (const path of ['packaged-files.json', 'artifact-identity.json']) inventory.push({ path, bytes: (await lstat(join(installRoot, path))).size, sha256: await hashFile(join(installRoot, path)) })
  return inventory
}
export async function uninstall(installRoot: string, owned: FileIdentity[], operations: UninstallOperations,
  choice: { purge?: boolean; confirmed?: boolean } = {}): Promise<{ retainedUnowned: string[]; durableDataRetained: boolean }> {
  if (choice.purge && choice.confirmed !== true) throw new Error('DATA_PURGE_CONFIRMATION_REQUIRED')
  await assertCanonical(installRoot)
  const unique = new Set<string>()
  const ownedDirectories = new Set<string>()
  for (const entry of owned) {
    const full = releasePath(installRoot, entry.path)
    if (unique.has(entry.path.toLowerCase())) throw new Error('UNINSTALL_MANIFEST_INVALID')
    unique.add(entry.path.toLowerCase())
    const parts = entry.path.split('/')
    for (let depth = 1; depth < parts.length; depth++) ownedDirectories.add(parts.slice(0, depth).join('/'))
    const info = await lstat(full)
    if (!info.isFile() || info.isSymbolicLink() || info.size !== entry.bytes || await hashFile(full) !== entry.sha256) throw new Error('UNINSTALL_MANIFEST_IDENTITY_MISMATCH')
  }
  await operations.drain()
  await operations.assertQuiescent()
  for (const entry of owned) await unlink(releasePath(installRoot, entry.path))
  const retainedUnowned: string[] = []
  async function empty(path: string, prefix = ''): Promise<void> {
    for (const item of await readdir(path, { withFileTypes: true })) {
      const relative = prefix + item.name, full = join(path, item.name)
      if (item.isDirectory() && !(await lstat(full)).isSymbolicLink()) {
        await empty(full, relative + '/')
        if ((await readdir(full)).length === 0) {
          if (ownedDirectories.has(relative)) await rmdir(full)
          else retainedUnowned.push(relative + '/')
        }
      } else retainedUnowned.push(relative)
    }
  }
  await empty(installRoot)
  if (choice.purge) await operations.purgeConfirmedData()
  return { retainedUnowned, durableDataRetained: !choice.purge }
}
