import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { CONTRACT_SHA256, HARNESS_COMMIT, RELEASE_LAYOUT, artifactIdentity, inventory, jsonBytes, releasePath, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { packagedChildEnvironment, validateHarnessModuleReferences } from '../apps/worker/dist/packaged-config.js'
import './harness-production-closure.test.mjs'

async function fixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'shaco-package-identity-'))
  // This fixture is identity-only. Actual PE/runtime tests use the real package.
  const release = { ProductVersion: '1.0.0-dev.1', DesktopVersion: '1.0.0-dev.1', WorkerVersion: '1.0.0-dev.1', CarrierVersion: 1,
    HarnessBaselineVersion: '0.1.2-alpha.1', ControlStoreSchemaVersion: 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES', ElectronVersion: '35.7.5', WorkerNodeVersion: '22.19.0', Platform: 'win32', Architecture: 'x64', HarnessPackage: '@deepseek-ai/dsh@0.1.2-alpha.1', HarnessCommit: HARNESS_COMMIT, ProductionProfileIdentity: 'shaco-forge', SourceCommit: '19f200851c47d5ce1b93026e07d88a6d583ef7f5', FrozenContractIdentity: CONTRACT_SHA256, PackagedRuntimeLayoutVersion: 1, ReleaseTrustMode: 'GITHUB_OPEN_SOURCE_UNSIGNED', ProductionSignerPolicy: { certificateSha256: [], timestampRequired: true }, layout: RELEASE_LAYOUT }
  try {
    for (const path of Object.values(RELEASE_LAYOUT).filter(path => path !== RELEASE_LAYOUT.profile)) {
      const full = join(root, path)
      await mkdir(dirname(full), { recursive: true })
      await writeFile(full, path === RELEASE_LAYOUT.harnessManifest ? jsonBytes({ name: '@deepseek-ai/dsh', version: '0.1.2-alpha.1' }) : 'fixture-bytes', 'utf8')
    }
    async function seal() {
      const bytes = jsonBytes(release)
      await writeFile(join(root, 'release-manifest.json'), bytes, 'utf8')
      const files = jsonBytes({ schemaVersion: 1, algorithm: 'SHA-256', files: await inventory(root) })
      await writeFile(join(root, 'packaged-files.json'), files, 'utf8')
      await writeFile(join(root, 'artifact-identity.json'), jsonBytes(artifactIdentity(bytes, files)), 'utf8')
    }
    await seal()
    await fn({ root, release, seal })
  } finally {
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + '\\shaco-package-identity-'))
    await rm(root, { recursive: true, force: true })
  }
}

test('complete composition and deterministic byte-derived manifests, without a self-hash cycle', () => fixture(async ({ root, release, seal }) => {
  assert.deepEqual(await verifyPackagedRuntime(root), release)
  const before = await readFile(join(root, 'artifact-identity.json'), 'utf8')
  await seal()
  assert.equal(await readFile(join(root, 'artifact-identity.json'), 'utf8'), before)
  const rows = await inventory(root)
  assert.ok(rows.some(row => row.path === 'release-manifest.json'))
  assert.ok(rows.every(row => Number.isSafeInteger(row.bytes) && /^[a-f0-9]{64}$/.test(row.sha256)))
  assert.ok(!rows.some(row => ['packaged-files.json', 'artifact-identity.json'].includes(row.path)))
}))
for (const value of [undefined, 'UNKNOWN_RELEASE_TRUST_MODE']) test(`${String(value)} ReleaseTrustMode fails closed`, () => fixture(async ({ root, release, seal }) => {
  if (value === undefined) delete release.ReleaseTrustMode
  else release.ReleaseTrustMode = value
  await seal()
  await assert.rejects(verifyPackagedRuntime(root), /RELEASE_INTEGRITY_FAILURE/)
}))
test('TRUSTED_AUTHENTICODE ReleaseTrustMode is valid', () => fixture(async ({ root, release, seal }) => {
  release.ReleaseTrustMode = 'TRUSTED_AUTHENTICODE'
  await seal()
  assert.equal((await verifyPackagedRuntime(root)).ReleaseTrustMode, 'TRUSTED_AUTHENTICODE')
}))
for (const [name, path, operation] of [
  ['missing Node', RELEASE_LAYOUT.node, 'missing'], ['missing Harness', RELEASE_LAYOUT.harness, 'missing'],
  ['missing Desktop', RELEASE_LAYOUT.desktopEntry, 'missing'], ['modified critical bytes', RELEASE_LAYOUT.client, 'modified'],
  ['unexpected critical file', 'runtime/unexpected.dll', 'modified'],
]) test(`${name} fails closed`, () => fixture(async ({ root }) => {
  if (operation === 'missing') await rm(join(root, path))
  else await writeFile(join(root, path), 'changed-by-negative-fixture', 'utf8')
  await assert.rejects(verifyPackagedRuntime(root), /RELEASE_INTEGRITY_FAILURE/)
}))
for (const [field, value] of [['WorkerNodeVersion', '24.0.0'], ['HarnessCommit', '0'.repeat(40)], ['HarnessPackage', '@deepseek-ai/dsh@wrong'], ['ProductionProfileIdentity', 'shaco-forge-v1-slice-1b'], ['Platform', 'linux'], ['Architecture', 'arm64'], ['FrozenContractIdentity', '0'.repeat(64)]]) {
  test(`wrong ${field} rejected even with recomputed manifests`, () => fixture(async ({ root, release, seal }) => {
    release[field] = value
    await seal()
    await assert.rejects(verifyPackagedRuntime(root), /RELEASE_INTEGRITY_FAILURE/)
  }))
}
test('wrong actual Harness package identity rejected even with recomputed inventory', () => fixture(async ({ root, seal }) => {
  await writeFile(join(root, RELEASE_LAYOUT.harnessManifest), jsonBytes({ name: '@deepseek-ai/dsh', version: 'wrong' }), 'utf8')
  await seal()
  await assert.rejects(verifyPackagedRuntime(root), /RELEASE_INTEGRITY_FAILURE/)
}))
test('identity envelope modification rejected', () => fixture(async ({ root }) => {
  await writeFile(join(root, 'artifact-identity.json'), '{}', 'utf8')
  await assert.rejects(verifyPackagedRuntime(root), /RELEASE_INTEGRITY_FAILURE/)
}))
test('critical directory junction rejected without following it', () => fixture(async ({ root }) => {
  await symlink(join(root, 'runtime'), join(root, 'redirected'), 'junction')
  await assert.rejects(verifyPackagedRuntime(root), /RELEASE_INTEGRITY_FAILURE/)
}))
test('inventory path traversal, alternate separator and ADS rejected', () => {
  for (const path of ['../outside', '/absolute', 'runtime\\node.exe', 'runtime/node.exe:stream', 'runtime/./node.exe']) assert.throws(() => releasePath('D:/package', path), /RELEASE_INTEGRITY_FAILURE/)
})

test('packaged child rejects ambient runtime overrides and loads native binaries in place', () => {
  const env = packagedChildEnvironment({ DSH_HOME: 'wrong', SHACO_FORGE_DSH_HOME: 'wrong', NODE_OPTIONS: '--require wrong',
    NARB_DISABLE_NATIVE_CACHE: '0', NARB_NATIVE_CACHE_DIR: 'wrong', NARB_BACKEND: 'wrong', SystemRoot: 'C:\\Windows' })
  assert.deepEqual(env, { SystemRoot: 'C:\\Windows', NARB_DISABLE_NATIVE_CACHE: '1' })
})

test('Harness fallback container cannot redirect writes; only package-owned leaf references are accepted', () => fixture(async ({ root }) => {
  const modules = join(root, 'harness/node_modules')
  const references = join(root, 'home/profiles/node_modules')
  await mkdir(dirname(references), { recursive: true })
  await symlink(modules, references, 'junction')
  await assert.rejects(validateHarnessModuleReferences(references, modules), /MODULE_ROOT_REPARSE_REJECTED/)
  await rm(references)
  await mkdir(join(references, '@deepseek-ai'), { recursive: true })
  await symlink(join(modules, '@deepseek-ai/dsh'), join(references, '@deepseek-ai/dsh'), 'junction')
  await validateHarnessModuleReferences(references, modules)
  await symlink(join(root, 'runtime'), join(references, 'unexpected'), 'junction')
  await assert.rejects(validateHarnessModuleReferences(references, modules), /MODULE_REFERENCE_REJECTED/)
}))
