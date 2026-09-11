import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, copyFile, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import packager from '@electron/packager'
import { CONTRACT_SHA256, HARNESS_COMMIT, RELEASE_LAYOUT, artifactIdentity, hashFile, inventory, jsonBytes, sha256, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { materializeHarnessProfile } from '../apps/worker/dist/profile.js'
import { assertToolchain } from './tool-runner.mjs'
import { discoverProductionRoots, calculateProductionClosure, excludedTopLevelPackages, materializeProductionClosure, verifyProductionClosure, comparePreviousPackage } from './harness-production-closure.mjs'

assertToolchain()
assert.equal(process.platform, 'win32')
assert.equal(process.arch, 'x64')
const root = resolve(import.meta.dirname, '..')
const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
const harness = process.env.SHACO_FORGE_HARNESS_ROOT
assert.ok(harness)
const git = process.env.SHACO_FORGE_GIT ?? 'git'
assert.ok(process.env.SHACO_FORGE_ELECTRON_ZIP_DIR, 'OFFLINE_ELECTRON_ZIP_DIR_REQUIRED')
await readFile(join(process.env.SHACO_FORGE_ELECTRON_ZIP_DIR, 'electron-v35.7.5-win32-x64.zip'))
const upstreamGit = args => execFileSync(git, ['-c', `safe.directory=${harness.replaceAll('\\', '/')}`, '-C', harness, ...args], { encoding: 'utf8' }).trim()
assert.equal(upstreamGit(['rev-parse', 'HEAD']), HARNESS_COMMIT)
assert.equal(upstreamGit(['status', '--porcelain=v1']), '')
assert.equal(await hashFile(join(root, 'docs/03-v1.0-plan/V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md')), CONTRACT_SHA256)
const sourceCommit = execFileSync(git, ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const product = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const attempt = Date.now().toString()
const work = join(root, 'dist/packaging', attempt)
const app = join(work, 'app')
await mkdir(app, { recursive: true })
const utf8 = (path, value) => writeFile(path, value, 'utf8')
// The staging tree is new for every attempt; failed attempts remain available.
for (const name of ['desktop', 'worker']) {
  await cp(join(root, `apps/${name}/dist`), join(app, name, 'dist'), { recursive: true,
    filter: path => !/\.(test\.js|test\.d\.ts|tsbuildinfo)$/.test(path) })
  const manifest = JSON.parse(await readFile(join(root, `apps/${name}/package.json`), 'utf8'))
  await utf8(join(app, name, 'package.json'), jsonBytes({ ...manifest, shacoRuntimeMode: 'packaged' }))
}
await cp(join(root, 'packages/contracts/dist'), join(app, 'node_modules/@shaco-forge/contracts/dist'), { recursive: true, filter: path => !/\.(test\.js|test\.d\.ts|tsbuildinfo)$/.test(path) })
await copyFile(join(root, 'packages/contracts/package.json'), join(app, 'node_modules/@shaco-forge/contracts/package.json'))
await utf8(join(app, 'package.json'), jsonBytes({ name: 'shaco-forge', productName: 'Shaco Forge', version: product.version, type: 'module', main: 'desktop-launch.mjs' }))
await utf8(join(app, 'desktop-launch.mjs'), `import { app } from 'electron'
import { dirname } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { verifyPackagedRuntime } from '@shaco-forge/contracts/packaged-runtime'
try {
  await verifyPackagedRuntime(dirname(process.execPath))
  await import('./desktop/dist/main/main.js')
} catch (error) {
  if (process.env.SHACO_FORGE_EVIDENCE_PATH) await writeFile(process.env.SHACO_FORGE_EVIDENCE_PATH, JSON.stringify({ result: 'FAIL', startupFailure: String(error) }), 'utf8')
  app.exit(1)
}
`)
await utf8(join(app, 'worker-launch.mjs'), `import { fileURLToPath } from 'node:url'
import { verifyPackagedRuntime } from '@shaco-forge/contracts/packaged-runtime'
await verifyPackagedRuntime(fileURLToPath(new URL('../../', import.meta.url)))
await import('./worker/dist/index.js')
`)
// A release under the development repository can resolve omitted optional peers
// from its ancestor node_modules. Build the reviewable package in an isolated
// temporary install root, and prove that ordinary Node lookup has no such source.
const releaseOutput = join(tmpdir(), 'shaco-forge-s3s1-packages', attempt, 'output')
for (let dir = resolve(releaseOutput); ; dir = dirname(dir)) {
  const ancestorModules = join(dir, 'node_modules')
  const present = await lstat(ancestorModules).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error })
  assert.equal(present, false, `ISOLATED_RELEASE_ANCESTOR_REQUIRED: ${ancestorModules}`)
  if (dirname(dir) === dir) break
}
const output = await packager({ dir: app, out: releaseOutput, name: 'Shaco Forge', executableName: 'Shaco Forge',
  platform: 'win32', arch: 'x64', electronVersion: '35.7.5', appVersion: product.version,
  asar: false, prune: false, overwrite: false, tmpdir: join(work, 'packager-tmp'),
  electronZipDir: process.env.SHACO_FORGE_ELECTRON_ZIP_DIR,
  win32metadata: { CompanyName: 'Shaco Forge', ProductName: 'Shaco Forge', FileDescription: 'Shaco Forge Desktop' },
  // windowsSign is intentionally absent. No installer or signing action occurs.
})
assert.equal(output.length, 1)
const packagedRoot = await realpath(output[0])
await mkdir(join(packagedRoot, 'runtime'), { recursive: true })
await copyFile(process.execPath, join(packagedRoot, RELEASE_LAYOUT.node))
const nodeIdentity = JSON.parse(execFileSync(join(packagedRoot, RELEASE_LAYOUT.node), ['-p', 'JSON.stringify({version:process.version,platform:process.platform,arch:process.arch,modules:process.versions.modules})'], { env: {}, encoding: 'utf8', windowsHide: true }))
assert.deepEqual({ ...nodeIdentity, modules: undefined }, { version: 'v22.19.0', platform: 'win32', arch: 'x64', modules: undefined })
// Runtime self-contained .NET publication prevents the native helper from
// silently depending on a machine-wide dotnet installation.
execFileSync('dotnet', ['publish', 'apps/native-carrier/ShacoForge.NativeCarrier.csproj', '--no-restore', '-c', 'Release', '-r', 'win-x64', '--self-contained', 'true', '-o', join(packagedRoot, 'native')], { cwd: root, windowsHide: true, stdio: 'inherit' })

const overlay = join(root, 'node_modules/.shaco-forge-build/runtime-overlay/node_modules')
const modules = join(packagedRoot, 'harness/node_modules')
// Materialize the existing profile into this attempt's staging tree first, so
// roots are extracted from actual production declarations and shipped imports.
const seam = join(work, 'production-seam')
const stagedProfile = await materializeHarnessProfile(seam, 'shaco-forge', join(root, 'apps/worker/dist/harness-readiness.js'),
  join(root, 'apps/worker/host-profile/connection-compatibility.mjs'), join(root, 'apps/worker/host-profile/carrier-gateway.mjs'),
  join(root, 'apps/worker/host-profile/events-route-preflight.mjs'), join(overlay, '@deepseek-ai'), join(seam, 'node_modules'))
const bootstrap = join(stagedProfile, 'node_modules/@shaco-forge/harness-bootstrap')
await mkdir(evidence, { recursive: true })
const roots = await discoverProductionRoots({ overlay, profile: stagedProfile, bootstrap })
await utf8(join(evidence, 'production-roots.json'), jsonBytes(roots))
const closure = await calculateProductionClosure({ roots, overlay, allowedSourceRoots: [overlay, harness, seam], frozenRoot: harness })
closure.excludedTopLevelPackages = await excludedTopLevelPackages(overlay, closure)
Object.assign(closure, await materializeProductionClosure(closure, modules))
closure.verification = await verifyProductionClosure(modules, closure)
closure.packagedPackageCount = closure.placements.length
closure.previousCandidateComparison = await comparePreviousPackage(join(root, 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/runs/package-runtime-9'), closure)
closure.unreachableCount = closure.previousCandidateComparison.unreachableCount
closure.unreachableBytes = closure.previousCandidateComparison.unreachableBytes
await utf8(join(evidence, 'harness-production-closure.json'), jsonBytes(closure))
const profile = join(packagedRoot, 'harness/profiles/shaco-forge')
await cp(stagedProfile, profile, { recursive: true, filter: path => path !== join(stagedProfile, 'node_modules/@deepseek-ai') })
const cliSource = await readFile(join(harness, 'apps/cli/lib/types/profile-boot.js'), 'utf8')
const rootConfig = cliSource.match(/const PROFILE_ROOT_CONFIG = `([\s\S]*?)`;/)?.[1]
assert.ok(rootConfig && rootConfig.endsWith('[]\n'))
await utf8(join(profile, 'cordis.yml'), rootConfig)
const sourceFiles = execFileSync(git, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root }).toString('utf8').split('\0').filter(path => path && (/^(apps|packages|scripts)\//.test(path) || ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json'].includes(path))).sort()
const sourceInventory = await Promise.all(sourceFiles.map(async path => ({ path, sha256: await hashFile(join(root, path)) })))
const release = {
  ProductVersion: product.version, DesktopVersion: product.version, WorkerVersion: product.version, CarrierVersion: 1,
  HarnessBaselineVersion: '0.1.2-alpha.1', ControlStoreSchemaVersion: 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES',
  ElectronVersion: '35.7.5', WorkerNodeVersion: '22.19.0', Platform: 'win32', Architecture: 'x64',
  HarnessPackage: '@deepseek-ai/dsh@0.1.2-alpha.1', HarnessCommit: HARNESS_COMMIT, ProductionProfileIdentity: 'shaco-forge',
  SourceCommit: sourceCommit, SourceState: 'WORKTREE_OVER_SOURCE_COMMIT_BOUND_BY_SOURCE_INVENTORY', FrozenContractIdentity: CONTRACT_SHA256, PackagedRuntimeLayoutVersion: 1,
  PackagingTool: { name: '@electron/packager', version: '18.3.6' },
  NativeRuntime: { target: 'net10.0-windows', runtime: 'win-x64', selfContained: true, workerNodeAbi: nodeIdentity.modules,
    includedFrameworks: JSON.parse(await readFile(join(packagedRoot, 'native/ShacoForge.NativeCarrier.runtimeconfig.json'), 'utf8')).runtimeOptions.includedFrameworks },
  BuildProvenance: { sourceInventorySha256: sha256(jsonBytes(sourceInventory)), lockfileSha256: await hashFile(join(root, 'pnpm-lock.yaml')),
    harnessLockfileSha256: await hashFile(join(harness, 'pnpm-lock.yaml')), clientCompositionSha256: await hashFile(join(root, 'apps/desktop/.generated-client/harness-client-manifest.json')),
    harnessProductionClosureSha256: await hashFile(join(evidence, 'harness-production-closure.json')) },
  layout: RELEASE_LAYOUT,
}
await utf8(join(packagedRoot, 'release-manifest.json'), jsonBytes(release))
const files = { schemaVersion: 1, algorithm: 'SHA-256', files: await inventory(packagedRoot) }
await utf8(join(packagedRoot, 'packaged-files.json'), jsonBytes(files))
const identity = artifactIdentity(jsonBytes(release), jsonBytes(files))
await utf8(join(packagedRoot, 'artifact-identity.json'), jsonBytes(identity))
await verifyPackagedRuntime(packagedRoot)
await mkdir(evidence, { recursive: true })
for (const name of ['release-manifest.json', 'packaged-files.json', 'artifact-identity.json']) await copyFile(join(packagedRoot, name), join(evidence, name))
await utf8(join(evidence, 'source-inventory.json'), jsonBytes(sourceInventory))
await utf8(join(root, 'dist/packaged-runtime-location.json'), jsonBytes({ packagedRoot, evidence, identity }))
await utf8(join(evidence, 'package-result.json'), jsonBytes({ result: 'PASS', packagedRoot, files: files.files.length, bytes: files.files.reduce((n, row) => n + row.bytes, 0), nodeIdentity, identity, harnessHead: upstreamGit(['rev-parse', 'HEAD']), harnessStatus: upstreamGit(['status', '--porcelain=v1']), providerRuns: 0, signingRuns: 0 }))
console.log(jsonBytes({ result: 'PASS', packagedRoot, digest: identity.digest, files: files.files.length }))
