// Verification only. No installer is launched and no real Product Data Root is touched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { hashFile, jsonBytes, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { verifyInstallerReleaseTrust } from '../apps/worker/dist/installer-release-trust.js'
import { inspectAuthenticode } from '../apps/worker/dist/signature-verification.js'

assert.equal(process.version, 'v22.19.0')
const root = resolve(import.meta.dirname, '..')
const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
const candidate = JSON.parse(await readFile(join(root, 'dist/installer-candidate-location.json'), 'utf8'))
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const release = await verifyPackagedRuntime(location.packagedRoot)
const identity = JSON.parse(await readFile(join(location.packagedRoot, 'artifact-identity.json'), 'utf8'))
assert.equal(release.ReleaseTrustMode, 'GITHUB_OPEN_SOURCE_UNSIGNED')
assert.equal(candidate.result, 'GITHUB_OPEN_SOURCE_UNSIGNED_INSTALLER_CANDIDATE')
assert.equal(candidate.releaseTrustMode, release.ReleaseTrustMode)
assert.equal(candidate.releaseTrustPolicySatisfied, true)
assert.equal(candidate.authenticodeRequired, false)
assert.equal(candidate.publisherAuthenticity, 'NOT_PROVIDED')
assert.equal(candidate.windowsTrustedPublisherIdentity, 'NOT_PROVIDED')
assert.equal(candidate.smartScreenReputation, 'NOT_GUARANTEED')
assert.equal(candidate.step2ReviewPending, true)
assert.equal(candidate.finalReleaseReady, false)
assert.equal(candidate.packagedArtifactDigest, identity.digest)
assert.equal(candidate.releaseManifestDigest, identity.releaseManifestSha256)
assert.equal(await hashFile(candidate.path), candidate.sha256)

const binding = JSON.parse(await readFile(join(candidate.evidence, 'release-trust-binding.json'), 'utf8'))
assert.deepEqual(binding, { schemaVersion: 1, releaseTrustMode: candidate.releaseTrustMode,
  installerPath: candidate.path, installerSha256: candidate.sha256, releaseManifestDigest: candidate.releaseManifestDigest,
  packagedArtifactDigest: candidate.packagedArtifactDigest, publisherAuthenticity: 'NOT_PROVIDED', authenticodeRequired: false })

const helper = join(location.packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
const unsignedResult = await verifyInstallerReleaseTrust({ release, installer: candidate.path, digest: candidate.sha256, nativeHelper: helper })
assert.deepEqual(unsignedResult, { releaseTrustMode: 'GITHUB_OPEN_SOURCE_UNSIGNED', installer: candidate.path, digest: candidate.sha256,
  authenticodeRequired: false, publisherAuthenticity: 'NOT_PROVIDED' })
await assert.rejects(verifyInstallerReleaseTrust({ release, installer: candidate.path, digest: '0'.repeat(64), nativeHelper: helper }), /INSTALLER_ARTIFACT_DIGEST_MISMATCH/)
await assert.rejects(verifyInstallerReleaseTrust({ release: { ...release, ReleaseTrustMode: 'TRUSTED_AUTHENTICODE' }, installer: candidate.path, digest: candidate.sha256, nativeHelper: helper }), /SIGNATURE_MISSING/)
const signature = await inspectAuthenticode(candidate.path, helper)
assert.equal(signature.status, 'NotSigned')

const compiler = join(root, 'dist/installer-toolchain/nsis-3.12-verified/nsis-3.12/makensis.exe')
const script = join(root, 'apps/installer/installer.nsi')
const base = ['/INPUTCHARSET', 'UTF8', '/OUTPUTCHARSET', 'UTF8', `/DSOURCE=${root}`, `/DPAYLOAD=\\\\?\\${location.packagedRoot}`]
const preprocess = mode => execFileSync(compiler, [...base, ...(mode ? [`/DRELEASE_TRUST_MODE=${mode}`] : []), '/PPO', script], { cwd: root, encoding: 'utf8', windowsHide: true })
const unsignedPreprocessed = preprocess('GITHUB_OPEN_SOURCE_UNSIGNED')
const trustedPreprocessed = preprocess('TRUSTED_AUTHENTICODE')
assert.doesNotMatch(unsignedPreprocessed, /--verify-installer|Authenticode verification failed/)
assert.match(trustedPreprocessed, /--verify-installer/)
assert.match(trustedPreprocessed, /Authenticode verification failed/)
assert.throws(() => preprocess(undefined), /RELEASE_TRUST_MODE is required/)
assert.throws(() => preprocess('UNKNOWN_RELEASE_TRUST_MODE'), /Unknown RELEASE_TRUST_MODE/)

const trustedFixture = join(root, 'dist/installer-fixtures', `trusted-authenticode-${Date.now()}.exe`)
await mkdir(join(root, 'dist/installer-fixtures'), { recursive: true })
execFileSync(compiler, ['/V2', ...base, '/DRELEASE_TRUST_MODE=TRUSTED_AUTHENTICODE', `/DOUTPUT=${trustedFixture}`, script], {
  cwd: root, windowsHide: true, stdio: 'inherit', timeout: 600_000,
})
assert.ok((await stat(trustedFixture)).size > 0)
const productionSources = await Promise.all(['apps/installer/installer.nsi', 'apps/worker/src/installer-entry.ts', 'apps/worker/src/installer-operations.ts',
  'apps/worker/src/installer-release-trust.ts', 'scripts/package-installer.mjs', 'scripts/package-runtime.mjs'].map(path => readFile(join(root, path), 'utf8')))
assert.doesNotMatch(productionSources.join('\n'), /--skip-signature|ALLOW_UNSIGNED|DISABLE_SIGNATURE|SHACO_TRUST_MODE|disable-signature/i)

const verification = { result: 'PASS', githubUnsignedReleasePolicyVerified: true, installerSha256AndReleaseManifestBound: true,
  signingIntegrationVerified: true, trustedAuthenticodeRegression: true, userRuntimeTrustModeToggle: 'ABSENT',
  nsis: { githubUnsignedMandatoryAuthenticodePathCompiled: false, trustedAuthenticodeEnforcementCompiled: true,
    missingModeBuildFailsClosed: true, unknownModeBuildFailsClosed: true, trustedFixture, trustedFixtureSha256: await hashFile(trustedFixture) },
  candidate, signature, binding, realProductDataRootTouched: false, providerRuns: 0, signingRuns: 0 }
await writeFile(join(evidence, 'installer-verification.json'), jsonBytes(verification), 'utf8')
console.log(jsonBytes(verification))
