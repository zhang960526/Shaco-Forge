// Privileged packaging utilities, separate from the frozen Carrier public API.
import { createHash } from 'node:crypto'
import { declaration, STEP1_ARTIFACT } from './compatibility.js'
import { createReadStream } from 'node:fs'
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'

export const RELEASE_LAYOUT = Object.freeze({
  desktop: 'Shaco Forge.exe',
  desktopEntry: 'resources/app/desktop/dist/main/main.js',
  workerEntry: 'resources/app/worker-launch.mjs',
  workerMain: 'resources/app/worker/dist/index.js',
  node: 'runtime/node.exe',
  harness: 'harness/node_modules/@deepseek-ai/dsh/lib/bin.js',
  harnessManifest: 'harness/node_modules/@deepseek-ai/dsh/package.json',
  profile: 'harness/profiles/shaco-forge',
  nativeHelper: 'native/ShacoForge.NativeCarrier.exe',
  client: 'resources/app/desktop/dist/renderer/index.html',
})
export const HARNESS_COMMIT = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
export const CONTRACT_SHA256 = '35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76'
export interface ReleaseManifest {
  ProductVersion: string; DesktopVersion: string; WorkerVersion: string
  CarrierVersion: number; HarnessBaselineVersion: string; ControlStoreSchemaVersion: string
  ElectronVersion: string; WorkerNodeVersion: string; Platform: string; Architecture: string
  HarnessPackage: string; HarnessCommit: string; ProductionProfileIdentity: string
  SourceCommit: string; FrozenContractIdentity: string; PackagedRuntimeLayoutVersion: number
  layout: typeof RELEASE_LAYOUT
  [key: string]: unknown
}
export interface FileIdentity { path: string; bytes: number; sha256: string }
export function sha256(bytes: string | Buffer): string { return createHash('sha256').update(bytes).digest('hex') }
export function jsonBytes(value: unknown): string { return JSON.stringify(value, null, 2) + '\n' }
export function releasePath(root: string, path: string): string {
  if (!path || isAbsolute(path) || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..' || part.includes(':'))) throw new Error('RELEASE_INTEGRITY_FAILURE: unsafe path')
  const target = resolve(root, path)
  if (relative(root, target).startsWith('..')) throw new Error('RELEASE_INTEGRITY_FAILURE: path escape')
  return target
}
export async function hashFile(path: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}
// Only the two identity envelopes are excluded. The release manifest itself is
// inventoried. Neither envelope claims to hash itself or a future installer.
export async function inventory(root: string): Promise<FileIdentity[]> {
  const files: Array<{ path: string; bytes: number }> = []
  if ((await lstat(root)).isSymbolicLink() || await realpath(root) !== resolve(root)) throw new Error('RELEASE_INTEGRITY_FAILURE: redirected root')
  async function walk(path: string): Promise<void> {
    for (const entry of await readdir(path ? releasePath(root, path) : root, { withFileTypes: true })) {
      const child = path ? `${path}/${entry.name}` : entry.name
      if (!path && ['packaged-files.json', 'artifact-identity.json'].includes(entry.name)) continue
      const full = releasePath(root, child)
      const stat = await lstat(full)
      if (stat.isSymbolicLink()) throw new Error(`RELEASE_INTEGRITY_FAILURE: reparse ${child}`)
      if (stat.isDirectory()) await walk(child)
      else if (stat.isFile()) files.push({ path: child, bytes: stat.size })
      else throw new Error(`RELEASE_INTEGRITY_FAILURE: special file ${child}`)
    }
  }
  await walk('')
  // Bound filesystem concurrency while hashing every byte. Enumeration and the
  // final ordinal sort preserve deterministic inventory order; no hash is cached.
  const rows: FileIdentity[] = new Array(files.length)
  let next = 0
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < files.length) {
      const index = next++
      const file = files[index]!
      rows[index] = { ...file, sha256: await hashFile(releasePath(root, file.path)) }
    }
  }))
  return rows.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
}
export function artifactIdentity(release: Buffer | string, files: Buffer | string) {
  const binding = { format: 'SHACO_FORGE_PACKAGED_ARTIFACT_V1', releaseManifestSha256: sha256(release), fileManifestSha256: sha256(files) }
  return { ...binding, digest: sha256(jsonBytes(binding)), scope: 'PACKAGED_RUNTIME_BYTES_EXCLUDING_IDENTITY_ENVELOPES', signing: 'NOT_PERFORMED' }
}
export function validateRelease(manifest: ReleaseManifest): void {
  if (manifest.Platform !== 'win32' || manifest.Architecture !== 'x64'
    || manifest.WorkerNodeVersion !== '22.19.0' || manifest.ElectronVersion !== '35.7.5'
    || manifest.HarnessPackage !== '@deepseek-ai/dsh@0.1.2-alpha.1'
    || manifest.HarnessBaselineVersion !== '0.1.2-alpha.1' || manifest.HarnessCommit !== HARNESS_COMMIT
    || manifest.ProductionProfileIdentity !== 'shaco-forge' || manifest.FrozenContractIdentity !== CONTRACT_SHA256
    || manifest.PackagedRuntimeLayoutVersion !== 1 || !/^[a-f0-9]{40}$/.test(manifest.SourceCommit)
    || JSON.stringify(manifest.layout) !== JSON.stringify(RELEASE_LAYOUT)
    || !manifest.ProductVersion || manifest.DesktopVersion !== manifest.ProductVersion || manifest.WorkerVersion !== manifest.ProductVersion
    || manifest.CarrierVersion !== 1 || !['NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES', '1'].includes(manifest.ControlStoreSchemaVersion)) {
    throw new Error('RELEASE_INTEGRITY_FAILURE: release identity')
  }
  if (manifest.ControlStoreSchemaVersion === '1') {
    if (JSON.stringify(manifest.Compatibility) !== JSON.stringify(declaration(manifest.ProductVersion, STEP1_ARTIFACT))) throw new Error('RELEASE_INTEGRITY_FAILURE: compatibility declaration')
    const policy = manifest.ProductionSignerPolicy as { certificateSha256?: unknown; timestampRequired?: unknown } | undefined
    if (!policy || policy.timestampRequired !== true || !Array.isArray(policy.certificateSha256)
      || policy.certificateSha256.some(value => typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))) throw new Error('RELEASE_INTEGRITY_FAILURE: signer policy')
  }
}
export async function verifyPackagedRuntime(root: string): Promise<ReleaseManifest> {
  try {
    for (const name of ['release-manifest.json', 'packaged-files.json', 'artifact-identity.json']) {
      const stat = await lstat(join(root, name))
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('redirected identity envelope')
    }
    const release = await readFile(join(root, 'release-manifest.json'))
    const files = await readFile(join(root, 'packaged-files.json'))
    const identity = JSON.parse(await readFile(join(root, 'artifact-identity.json'), 'utf8')) as unknown
    const manifest = JSON.parse(release.toString('utf8')) as ReleaseManifest
    validateRelease(manifest)
    if (JSON.stringify(identity) !== JSON.stringify(artifactIdentity(release, files))) throw new Error('artifact binding')
    const expected = JSON.parse(files.toString('utf8')) as { schemaVersion: number; files: FileIdentity[] }
    if (expected.schemaVersion !== 1 || JSON.stringify(expected.files) !== JSON.stringify(await inventory(root))) throw new Error('file inventory')
    for (const path of Object.values(RELEASE_LAYOUT).filter(path => path !== RELEASE_LAYOUT.profile)) {
      if (!expected.files.some(row => row.path === path)) throw new Error('required file absent')
    }
    const harness = JSON.parse(await readFile(releasePath(root, RELEASE_LAYOUT.harnessManifest), 'utf8')) as { name: string; version: string }
    if (harness.name !== '@deepseek-ai/dsh' || harness.version !== '0.1.2-alpha.1') throw new Error('Harness identity')
    return manifest
  } catch (error) {
    throw new Error(`RELEASE_INTEGRITY_FAILURE: ${error instanceof Error ? error.message : 'invalid package'}`)
  }
}
