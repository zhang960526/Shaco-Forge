import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { hashFile, jsonBytes, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'

assert.equal(process.version, 'v22.19.0')
const root = resolve(import.meta.dirname, '..')
const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
const archive = join(root, 'dist/installer-toolchain/nsis-3.12-archive.zip')
assert.equal(await hashFile(archive), '56581f90db321581c5381193d796fffcf2d24b2f8fed2160a6c6a3baa67f2c4f')
const compiler = join(root, 'dist/installer-toolchain/nsis-3.12-verified/nsis-3.12/makensis.exe')
assert.equal(execFileSync(compiler, ['/VERSION'], { encoding: 'utf8', windowsHide: true }).trim(), 'v3.12')
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const release = await verifyPackagedRuntime(location.packagedRoot)
assert.equal(release.ControlStoreSchemaVersion, '1')
assert.deepEqual(release.ProductionSignerPolicy, JSON.parse(await readFile(join(root, 'apps/installer/signer-policy.json'), 'utf8')))
const output = join(root, 'dist/installers', `Shaco-Forge-${release.ProductVersion}-${Date.now()}-unsigned.exe`)
await mkdir(join(root, 'dist/installers'), { recursive: true })
await mkdir(evidence, { recursive: true })
execFileSync(compiler, ['/V3', '/INPUTCHARSET', 'UTF8', '/OUTPUTCHARSET', 'UTF8', `/DSOURCE=${root}`, `/DPAYLOAD=\\\\?\\${location.packagedRoot}`, `/DOUTPUT=${output}`, join(root, 'apps/installer/installer.nsi')], {
  cwd: root, windowsHide: true, stdio: 'inherit', timeout: 600_000,
})
const identity = JSON.parse(await readFile(join(location.packagedRoot, 'artifact-identity.json'), 'utf8'))
const result = { result: 'UNSIGNED_INSTALLER_CANDIDATE', releaseReady: false, productionSigned: false,
  path: output, bytes: (await stat(output)).size, sha256: await hashFile(output),
  packagedArtifactDigest: identity.digest, releaseManifestDigest: identity.releaseManifestSha256,
  installerTool: { name: 'NSIS', version: '3.12', archiveSha256: await hashFile(archive) },
  target: 'WINDOWS_X64_PER_USER', signingRuns: 0, providerRuns: 0 }
await writeFile(join(evidence, 'installer-candidate.json'), jsonBytes(result), 'utf8')
await writeFile(join(root, 'dist/installer-candidate-location.json'), jsonBytes({ ...result, evidence }), 'utf8')
await writeFile(join(evidence, 'OWNER_SIGNING_HANDOFF.json'), jsonBytes({
  unsignedInstallerPath: output, unsignedInstallerDigest: result.sha256,
  releaseManifestDigest: result.releaseManifestDigest, packagedArtifactDigest: result.packagedArtifactDigest,
  expectedSignerPolicy: release.ProductionSignerPolicy,
  verificationSeam: 'apps/worker/src/signature-verification.ts verifyAuthenticode / native helper --verify-installer',
  ownerActions: ['Provide the accepted PUBLIC certificate SHA-256 identity in signer-policy.json, then rebuild and rerun affected source-bound gates before signing.',
    'Authorize and execute signing under Owner control; collect certificate public identity, timestamp metadata, signature validation and final signed installer SHA-256.'],
  signingExecutionAuthorization: 'NO', signingRuns: 0, releaseReady: false,
}), 'utf8')
console.log(jsonBytes(result))
