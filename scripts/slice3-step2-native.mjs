// NOT_SHIPPED: Windows OS boundary proof on explicit isolated fixtures.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { inspectAuthenticode, acceptSignature } from '../apps/worker/dist/signature-verification.js'
import { verifyInstallerReleaseTrust } from '../apps/worker/dist/installer-release-trust.js'
import { hashFile, jsonBytes } from '../packages/contracts/dist/packaged-runtime.js'

assert.equal(process.version, 'v22.19.0')
const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
await mkdir(evidence, { recursive: true })
const isolated = resolve('dist/slice3-step2-signature-tests', String(Date.now()))
await mkdir(isolated, { recursive: true })
const helper = resolve('apps/native-carrier/bin/Release/net10.0-windows/ShacoForge.NativeCarrier.exe')
const aclOutput = execFileSync('dotnet', ['run', '--project', 'apps/native-carrier-tests/ShacoForge.Step2.Tests.csproj', '--configuration', 'Release'], { encoding: 'utf8', windowsHide: true })
const acl = JSON.parse(aclOutput.trim().split(/\r?\n/).at(-1))
assert.equal(acl.result, 'PASS')
const original = await inspectAuthenticode(process.execPath, helper)
assert.equal(original.status, 'Valid')
assert.ok(original.signer && original.timestamp.certificate && original.timestamp.signingTimes.length)
const policy = { certificateSha256: [original.signer.sha256], timestampRequired: true }
acceptSignature(original, await hashFile(process.execPath), policy)
const trustedRelease = { ReleaseTrustMode: 'TRUSTED_AUTHENTICODE', ProductionSignerPolicy: policy }
assert.equal((await verifyInstallerReleaseTrust({ release: trustedRelease, installer: process.execPath, digest: original.fileSha256, nativeHelper: helper })).publisherAuthenticity, 'VERIFIED_TRUSTED_AUTHENTICODE')
assert.throws(() => acceptSignature(original, original.fileSha256, { ...policy, certificateSha256: ['0'.repeat(64)] }), /SIGNER_NOT_ALLOWED/)
assert.throws(() => acceptSignature(original, '0'.repeat(64), policy), /DIGEST_MISMATCH/)
const tampered = join(isolated, 'tampered-public-node.exe')
await copyFile(process.execPath, tampered)
const bytes = await readFile(tampered); bytes[2048] ^= 1; await writeFile(tampered, bytes)
const invalid = await inspectAuthenticode(tampered, helper)
assert.notEqual(invalid.status, 'Valid')
assert.throws(() => acceptSignature(invalid, invalid.fileSha256, policy), /SIGNATURE_INVALID|SIGNATURE_MISSING/)
await assert.rejects(verifyInstallerReleaseTrust({ release: trustedRelease, installer: tampered, digest: invalid.fileSha256, nativeHelper: helper }), /SIGNATURE_INVALID|SIGNATURE_MISSING/)
const unsigned = await inspectAuthenticode(helper, helper)
assert.equal(unsigned.status, 'NotSigned')
assert.throws(() => acceptSignature(unsigned, unsigned.fileSha256, policy), /SIGNATURE_MISSING/)
await assert.rejects(verifyInstallerReleaseTrust({ release: trustedRelease, installer: helper, digest: unsigned.fileSha256, nativeHelper: helper }), /SIGNATURE_MISSING/)
assert.equal((await verifyInstallerReleaseTrust({ release: { ...trustedRelease, ReleaseTrustMode: 'GITHUB_OPEN_SOURCE_UNSIGNED' }, installer: helper, digest: unsigned.fileSha256, nativeHelper: helper })).publisherAuthenticity, 'NOT_PROVIDED')
await assert.rejects(verifyInstallerReleaseTrust({ release: { ...trustedRelease, ReleaseTrustMode: 'UNKNOWN' }, installer: helper, digest: unsigned.fileSha256, nativeHelper: helper }), /RELEASE_INTEGRITY_FAILURE/)
const policyFile = join(isolated, 'public-fixture-policy.json')
await writeFile(policyFile, jsonBytes(policy), 'utf8')
const accepted = JSON.parse(execFileSync(helper, ['--verify-installer', process.execPath, policyFile], { encoding: 'utf8', windowsHide: true }))
assert.equal(accepted.status, 'Valid')
await writeFile(policyFile, jsonBytes({ ...policy, certificateSha256: ['0'.repeat(64)] }), 'utf8')
assert.throws(() => execFileSync(helper, ['--verify-installer', process.execPath, policyFile], { windowsHide: true, stdio: 'pipe' }), error => String(error.stderr).includes('SIGNER_NOT_ALLOWED'))
await writeFile(join(evidence, 'native-and-signature-results.json'), jsonBytes({ result: 'PASS', acl,
  publicFixture: { path: process.execPath, ...original }, unsigned, tampered: invalid,
  wrongSignerRejected: true, digestMismatchRejected: true, nativeGatePositive: true,
  productionDataWrites: 0, productionSigningRuns: 0, privateKeyOperations: 0,
  cleanup: { fixturesRetainedForEvidence: isolated, processesExited: true },
}), 'utf8')
console.log(jsonBytes({ result: 'PASS', nativeAcl: true, realAuthenticodeVerification: true, providerRuns: 0, signingRuns: 0 }))
