import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, lstat, mkdir, open, readFile, readdir, readlink, realpath, rm, statfs, symlink, unlink, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { hashFile, jsonBytes, releasePath } from '@shaco-forge/contracts/packaged-runtime'

export interface DurableEntry { path: string; kind: 'file' | 'directory' | 'junction'; bytes?: number; sha256?: string; target?: string }
export function contained(root: string, target: string): boolean {
  const rel = relative(resolve(root), resolve(target))
  return rel !== '' && rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel)
}
export async function assertCanonical(path: string): Promise<void> {
  if (!isAbsolute(path) || await realpath(path) !== resolve(path) || (await lstat(path)).isSymbolicLink()) throw new Error('UNSAFE_DATA_PATH')
  for (let parent = dirname(path); ; parent = dirname(parent)) {
    if ((await lstat(parent)).isSymbolicLink()) throw new Error('UNSAFE_DATA_ANCESTOR')
    if (dirname(parent) === parent) break
  }
}
// Only existing, manifest-approved executable profile/module references are
// represented as links. Never follow them while backing up mutable data.
export async function durableInventory(root: string, approvedLinks: ReadonlyMap<string, string> = new Map()): Promise<DurableEntry[]> {
  await assertCanonical(root)
  const entries: DurableEntry[] = []
  async function walk(directory: string, prefix = ''): Promise<void> {
    for (const name of (await readdir(directory)).sort()) {
      const path = prefix + name, full = releasePath(root, path), info = await lstat(full)
      if (info.isSymbolicLink()) {
        const target = await realpath(full)
        if (approvedLinks.get(path) !== target) throw new Error('UNEXPECTED_DATA_REPARSE')
        await readlink(full)
        entries.push({ path, kind: 'junction', target })
      } else if (info.isDirectory()) { entries.push({ path, kind: 'directory' }); await walk(full, path + '/') }
      else if (info.isFile()) entries.push({ path, kind: 'file', bytes: info.size, sha256: await hashFile(full) })
      else throw new Error('UNEXPECTED_DATA_FILE_KIND')
    }
  }
  await walk(root)
  return entries
}
export interface BackupManifest {
  format: 'SHACO_FORGE_BACKUP_V1'; transactionId: string; sourceArtifact: string
  scopes: Array<{ name: 'dsh' | 'control-store' | 'runtime'; entries: DurableEntry[] }>
  requiredBytes: number
}
export interface BackupSafety {
  protect(path: string): Promise<void>
  verifyAcl(path: string): Promise<void>
  assertQuiescent(): Promise<void>
  availableBytes?(path: string): Promise<number>
}
async function copyDurably(input: string, target: string): Promise<void> {
  await copyFile(input, target)
  const copy = await open(target, 'r+')
  try { await copy.sync() } finally { await copy.close() }
}
export class VerifiedBackup {
  constructor(readonly backupRoot: string, readonly safety: BackupSafety) {}
  async create(id: string, sourceArtifact: string, sources: { dsh: string; controlStore: string; runtime: string }, approvedLinks: ReadonlyMap<string, string> = new Map()): Promise<string> {
    if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(sourceArtifact)) throw new Error('BACKUP_METADATA_REJECTED')
    const destination = join(this.backupRoot, id)
    await this.safety.protect(this.backupRoot)
    await assertCanonical(this.backupRoot)
    if (existsSync(destination)) throw new Error('BACKUP_DESTINATION_EXISTS') // Never reuse a partial backup.
    await this.safety.protect(destination)
    await this.safety.verifyAcl(destination)
    await this.safety.assertQuiescent()
    const scopes: BackupManifest['scopes'] = []
    for (const name of ['dsh', 'control-store', 'runtime'] as const) {
      const source = name === 'control-store' ? dirname(sources.controlStore) : sources[name]
      await assertCanonical(source)
      const entries = name === 'control-store'
        ? existsSync(sources.controlStore) ? [{ path: 'state.sqlite', kind: 'file' as const, bytes: (await lstat(sources.controlStore)).size, sha256: await hashFile(sources.controlStore) }] : []
        : await durableInventory(source, name === 'dsh' ? approvedLinks : new Map())
      scopes.push({ name, entries })
    }
    const requiredBytes = scopes.flatMap(s => s.entries).reduce((sum, row) => sum + (row.bytes ?? 0), 0) + 16 * 1024 * 1024
    const capacity = this.safety.availableBytes ? await this.safety.availableBytes(destination)
      : await statfs(destination).then(value => value.bavail * value.bsize)
    if (!Number.isFinite(capacity) || capacity < requiredBytes) throw new Error('BACKUP_DISK_FULL')
    for (const scope of scopes) {
      const output = join(destination, scope.name)
      await mkdir(output)
      for (const entry of scope.entries) {
        const target = releasePath(output, entry.path)
        if (entry.kind === 'directory') await mkdir(target, { recursive: true })
        else if (entry.kind === 'file') {
          await mkdir(dirname(target), { recursive: true })
          const input = scope.name === 'control-store' ? sources.controlStore : releasePath(sources[scope.name], entry.path)
          await copyDurably(input, target)
        }
        // Link metadata is sealed in the backup manifest, not an executable link
        // in the backup directory. Restoring recreates only this exact reference.
      }
    }
    const manifest: BackupManifest = { format: 'SHACO_FORGE_BACKUP_V1', transactionId: id, sourceArtifact, scopes, requiredBytes }
    const bytes = jsonBytes(manifest)
    await writeFile(join(destination, 'backup-manifest.json'), bytes, { encoding: 'utf8', flag: 'wx', flush: true })
    const digest = createHash('sha256').update(bytes).digest('hex')
    await this.safety.assertQuiescent()
    await this.verify(id, digest)
    // A second source census detects a late write, including content changes with
    // unchanged size. Installer cannot enter INSTALL on a changing durable cut.
    for (const scope of scopes) {
      if (scope.name === 'control-store') {
        if (scope.entries.length === 0 ? existsSync(sources.controlStore) : await hashFile(sources.controlStore) !== scope.entries[0]!.sha256) throw new Error('BACKUP_SOURCE_CHANGED')
      } else if (JSON.stringify(await durableInventory(sources[scope.name], scope.name === 'dsh' ? approvedLinks : new Map())) !== JSON.stringify(scope.entries)) throw new Error('BACKUP_SOURCE_CHANGED')
    }
    return digest
  }
  async verify(id: string, digest: string): Promise<BackupManifest> {
    if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(digest)) throw new Error('BACKUP_METADATA_REJECTED')
    const path = join(this.backupRoot, id)
    await assertCanonical(path)
    await this.safety.verifyAcl(path)
    if (await hashFile(join(path, 'backup-manifest.json')) !== digest) throw new Error('BACKUP_INTEGRITY_FAILURE')
    const manifest = JSON.parse(await readFile(join(path, 'backup-manifest.json'), 'utf8')) as BackupManifest
    if (manifest.format !== 'SHACO_FORGE_BACKUP_V1' || manifest.transactionId !== id
      || JSON.stringify(manifest.scopes.map(s => s.name)) !== JSON.stringify(['dsh', 'control-store', 'runtime'])) throw new Error('BACKUP_INTEGRITY_FAILURE')
    for (const scope of manifest.scopes) {
      const actual = await durableInventory(join(path, scope.name))
      const expected = scope.entries.filter(entry => entry.kind !== 'junction')
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('BACKUP_INTEGRITY_FAILURE')
    }
    return manifest
  }
  async restore(id: string, digest: string, targets: { dsh: string; controlStore: string; runtime: string }): Promise<void> {
    const manifest = await this.verify(id, digest)
    await this.safety.assertQuiescent()
    // Runtime is restored before any durable link is materialized.
    for (const name of ['runtime', 'dsh', 'control-store'] as const) {
      const scope = manifest.scopes.find(scope => scope.name === name)!
      const target = name === 'control-store' ? dirname(targets.controlStore) : targets[name]
      await assertCanonical(target)
      if (name === 'control-store') {
        if (scope.entries.length === 0) {
          if (existsSync(targets.controlStore)) await unlink(targets.controlStore)
          continue
        }
        await copyDurably(join(this.backupRoot, id, name, 'state.sqlite'), targets.controlStore)
        if (await hashFile(targets.controlStore) !== scope.entries[0]!.sha256) throw new Error('RESTORE_INTEGRITY_FAILURE')
        continue
      }
      // The adapter must establish exclusive ownership and check unowned files
      // before restore. This method only accepts existing canonical target roots.
      for (const item of await readdir(target)) {
        const child = join(target, item)
        if (!contained(target, child)) throw new Error('RESTORE_PATH_ESCAPE')
        if ((await lstat(child)).isSymbolicLink()) await unlink(child)
        else await rm(child, { recursive: true, force: false })
      }
      for (const entry of scope.entries) {
        const output = releasePath(target, entry.path)
        if (entry.kind === 'directory') await mkdir(output, { recursive: true })
        else if (entry.kind === 'file') { await mkdir(dirname(output), { recursive: true }); await copyDurably(releasePath(join(this.backupRoot, id, name), entry.path), output) }
        else { await mkdir(dirname(output), { recursive: true }); await symlink(entry.target!, output, 'junction') }
      }
      const links = new Map(scope.entries.filter(row => row.kind === 'junction').map(row => [row.path, row.target!]))
      if (JSON.stringify(await durableInventory(target, links)) !== JSON.stringify(scope.entries)) throw new Error('RESTORE_INTEGRITY_FAILURE')
    }
  }
}
