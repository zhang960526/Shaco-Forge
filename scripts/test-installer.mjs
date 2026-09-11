// Verification only: unsigned production entry must reject before installation.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { hashFile, jsonBytes, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { inspectAuthenticode } from '../apps/worker/dist/signature-verification.js'
import { inspectLocalPlatform } from '../apps/desktop/dist/main/lifecycle-client.js'
const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
const candidate = JSON.parse(await readFile('dist/installer-candidate-location.json', 'utf8'))
const location = JSON.parse(await readFile('dist/packaged-runtime-location.json', 'utf8'))
const release = await verifyPackagedRuntime(location.packagedRoot)
const identity = JSON.parse(await readFile(join(location.packagedRoot, 'artifact-identity.json'), 'utf8'))
assert.equal(candidate.packagedArtifactDigest, identity.digest)
assert.equal(candidate.releaseManifestDigest, identity.releaseManifestSha256)
assert.equal(await hashFile(candidate.path), candidate.sha256)
const helper = join(location.packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
const signature = await inspectAuthenticode(candidate.path, helper)
assert.equal(signature.status, 'NotSigned')
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const select = () => JSON.parse(execFileSync(helper, ['--select-product-control', location.packagedRoot], { encoding: 'utf8', windowsHide: true }))
const before = select()
const { existsSync } = await import('node:fs')
const paths = [before.controlRoot, before.dshHome, before.installRoot, before.backupRoot]
const existing = paths.map(path => existsSync(path))
const child = spawn(candidate.path, ['/S'], { windowsHide: true, stdio: 'ignore' })
const timer = setTimeout(() => child.kill(), 60000)
const exitCode = await new Promise((done, reject) => { child.once('error', reject); child.once('exit', done) }); clearTimeout(timer)
assert.equal(exitCode, 1)
assert.deepEqual(select(), before)
assert.deepEqual(paths.map(path => existsSync(path)), existing)
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
assert.throws(() => execFileSync(join(location.packagedRoot, 'runtime/node.exe'), [join(location.packagedRoot, 'resources/app/worker/dist/installer-entry.js'), candidate.path, '--install'], { windowsHide: true, stdio: 'pipe' }), error => String(error.stderr).includes('SIGNATURE_MISSING'))
await writeFile(join(evidence, 'installer-verification.json'), jsonBytes({ result: 'PASS', unsignedProductionEntryExitCode: exitCode,
  unsignedDirectProductionEntryRejected: true, candidate, signature, expectedPolicy: release.ProductionSignerPolicy,
  knownFolderCreation: false, workerAuthorityCreated: false, providerRuns: 0, signingRuns: 0 }), 'utf8')
console.log(jsonBytes({ result: 'PASS', productionUnsignedEntryRejected: true, signingRuns: 0 }))
