// NOT_SHIPPED explicit test container. Product modules, assets, Node and Harness
// remain exact packaged bytes. Only this container's startup selects test roots.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { cp, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fixture, workerBridge, isolatedProfileLinks } from './slice3-step2-fixtures.mjs'
import { ControlStore } from '../apps/worker/dist/control-store.js'
import { RELEASE_LAYOUT, hashFile, jsonBytes, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { inspectLocalPlatform, lifecycleRequest } from '../apps/desktop/dist/main/lifecycle-client.js'
import { sixIdentities } from '../packages/contracts/dist/compatibility.js'
import { durableInventory } from '../apps/worker/dist/durable-files.js'
import { randomUUID } from 'node:crypto'
import { verifyProductionClosure } from './harness-production-closure.mjs'

const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence); await mkdir(evidence, { recursive: true })
const location = JSON.parse(await readFile('dist/packaged-runtime-location.json', 'utf8'))
const root = location.packagedRoot, manifest = await verifyPackagedRuntime(root)
const helper = join(root, RELEASE_LAYOUT.nativeHelper)
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const pristine = await hashFile(join(root, 'artifact-identity.json'))
for (let directory = root; ; directory = dirname(directory)) {
  const children = await readdir(directory)
  assert.equal(children.includes('node_modules'), false, 'PACKAGED_ANCESTRY_MUST_NOT_SUPPLY_DEVELOPMENT_MODULES')
  if (dirname(directory) === directory) break
}
const closureFile = join(location.evidence, 'harness-production-closure.json')
assert.equal(await hashFile(closureFile), manifest.BuildProvenance.harnessProductionClosureSha256)
const closure = await verifyProductionClosure(join(root, 'harness/node_modules'), JSON.parse(await readFile(closureFile, 'utf8')))
const env = { ...process.env }
for (const key of Object.keys(env)) if (/^(DSH_|SHACO_FORGE_|NODE_|ELECTRON_|NPM_|PNPM_|COREPACK_)/i.test(key) || key.toLowerCase() === 'path') delete env[key]
env.PATH = join(process.env.SystemRoot, 'System32') + ';' + process.env.SystemRoot
env.DSH_HOME = join(evidence, 'forbidden-ambient-home')
env.SHACO_FORGE_DSH_HOME = join(evidence, 'forbidden-caller-home')
env.LOCALAPPDATA = join(evidence, 'forbidden-ambient-localappdata')
const nodeIdentity = JSON.parse(execFileSync(join(root, RELEASE_LAYOUT.node), ['-p', 'JSON.stringify({version:process.version,platform:process.platform,arch:process.arch,execPath:process.execPath})'], { env, encoding: 'utf8', windowsHide: true }))
assert.equal(nodeIdentity.version, 'v22.19.0')
assert.equal(nodeIdentity.execPath, join(root, RELEASE_LAYOUT.node))
// Production preflight cannot silently bootstrap a missing store or use caller
// roots. This machine has never received an authorized signed Step2 install.
assert.throws(() => execFileSync(join(root, RELEASE_LAYOUT.node), [join(root, RELEASE_LAYOUT.workerEntry), '--preflight'], { env, windowsHide: true, stdio: 'pipe' }), error => /CONTROL_SCHEMA_UNSUPPORTED|RESTORE_REQUIRED|PRODUCT_RELEASE_MISMATCH/.test(String(error.stderr)))
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)

const f = await fixture('packaged-desktop')
// Actual production Electron bootstrap must complete its fail-closed startup,
// rather than deadlocking its ESM load on app.whenReady(). UI profile is isolated.
const productionEvidence = join(evidence, 'production-desktop-prewrite-refusal.json')
console.log('PRODUCTION_DESKTOP_PREWRITE_BEGIN')
const productionDesktop = spawn(join(root, RELEASE_LAYOUT.desktop), ['--no-error-dialogs', `--user-data-dir=${join(f.root, 'production-entry-ui-profile')}`], {
  env: { ...env, SHACO_FORGE_EVIDENCE_PATH: productionEvidence }, cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
})
let productionDiagnostics = ''
for (const stream of [productionDesktop.stdout, productionDesktop.stderr]) stream.on('data', bytes => { productionDiagnostics = (productionDiagnostics + String(bytes)).slice(-8192) })
const productionTimer = setTimeout(() => productionDesktop.kill(), 90000)
const productionExit = await new Promise((done, reject) => { productionDesktop.once('error', reject); productionDesktop.once('exit', done) })
clearTimeout(productionTimer)
await writeFile(join(evidence, 'production-desktop-exit.json'), jsonBytes({ exitCode: productionExit,
  errors: productionDiagnostics.split(/\r?\n/).filter(line => /error|failed|REJECTED|MISMATCH|UNSUPPORTED/i.test(line)).map(line => line.slice(0,500)) }), 'utf8')
assert.equal(productionExit, 0, 'PRODUCTION_DESKTOP_MUST_FINISH_PREWRITE_REFUSAL')
const refused = JSON.parse(await readFile(productionEvidence, 'utf8'))
assert.equal(refused.result, 'FAIL')
assert.match(refused.startupFailure, /CONTROL_SCHEMA_UNSUPPORTED|RESTORE_REQUIRED|PRODUCT_RELEASE_MISMATCH/)
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
console.log('PRODUCTION_DESKTOP_PREWRITE_REFUSAL: PASS')
await f.boundary.protect(f.paths.dsh)
const identity = JSON.parse(await readFile(join(root, 'artifact-identity.json'), 'utf8'))
const control = { artifactDigest: identity.digest, releaseManifestDigest: identity.releaseManifestSha256, productVersion: manifest.ProductVersion, dshHome: f.paths.dsh }
const store = new ControlStore(join(f.paths.control, 'state.sqlite'), { kind: 'FRESH_INSTALL', sourceSchema: 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES', target: control }); store.close()
const bridge = await workerBridge(f.root, root, f.paths.dsh)
// Exercise the actual native credential boundary before starting Desktop. Every
// malformed attachment must leave dispatch count and Harness bytes unchanged.
const worker = spawn(join(root, RELEASE_LAYOUT.node), [bridge], { env: {}, cwd: root, windowsHide: true, stdio: 'ignore' })
let authority
const deadline = Date.now() + 110000
try {
  while (Date.now() < deadline && worker.exitCode === null) {
    try { authority = (await lifecycleRequest(helper, 'discover')).status; if (authority?.worker.pid === worker.pid) break } catch {}
    await new Promise(done => setTimeout(done, 200))
  }
  assert.equal(authority?.worker.pid, worker.pid, 'ISOLATED_NATIVE_COMPATIBILITY_WORKER_READY')
  const approvedLinks = await isolatedProfileLinks(f.paths.dsh, root)
  const beforeBytes = await durableInventory(f.paths.dsh, approvedLinks)
  const negatives = []
  for (const key of Object.keys(sixIdentities(manifest))) {
    const observed = { ...sixIdentities(manifest), [key]: key === 'CarrierVersion' ? 999 : 'unknown' }
    await assert.rejects(lifecycleRequest(helper, 'attach', authority.workerInstanceId, { compatibility: observed, dshHome: f.paths.dsh }), /DESKTOP_WORKER_MISMATCH/)
    negatives.push({ identity: key, credentialIssued: false })
  }
  await assert.rejects(lifecycleRequest(helper, 'attach', authority.workerInstanceId, { dshHome: f.paths.dsh }), /DESKTOP_WORKER_MISMATCH/)
  await assert.rejects(lifecycleRequest(helper, 'attach', authority.workerInstanceId, { compatibility: sixIdentities(manifest), dshHome: f.paths.dsh + '-wrong' }), /DSH_HOME_MISMATCH/)
  const after = (await lifecycleRequest(helper, 'discover')).status
  assert.equal(after.dispatchCount, authority.dispatchCount)
  assert.deepEqual(await durableInventory(f.paths.dsh, approvedLinks), beforeBytes)
  await writeFile(join(evidence, 'native-compatibility-prewrite.json'), jsonBytes({ result: 'PASS', negatives,
    missingIdentitiesRejected: true, wrongHomeRejected: true, freshCredentialsIssued: 0,
    agentDispatchDelta: 0, harnessDataChanged: false, inspectedDurableEntries: beforeBytes.length }), 'utf8')
  console.log('NATIVE_COMPATIBILITY_PREWRITE: PASS')
  const id = randomUUID()
  await f.boundary.publishJournal({ id, state: 'DRAINING', source: control, target: control, installed: false, events: [] })
  await lifecycleRequest(helper, 'upgrade-drain', authority.workerInstanceId, { transactionId: id })
  const timer = setTimeout(() => worker.kill(), 45000)
  if (worker.exitCode === null) await new Promise(done => worker.once('exit', done))
  clearTimeout(timer); assert.equal(worker.exitCode, 0)
  await f.boundary.publishJournal({ id, state: 'COMMITTED', source: control, target: control, installed: false, events: [] })
} finally { if (worker.exitCode === null) worker.kill() }
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const container = join(f.root, 'desktop-test-container')
await mkdir(container)
// Keep the exact packaged Electron executable and runtime. The production app
// directory is not copied or modified; a visibly named test bootstrap imports it.
for (const name of await readdir(root)) {
  if (['resources', 'harness', 'native', 'runtime', 'release-manifest.json', 'packaged-files.json', 'artifact-identity.json'].includes(name)) continue
  await cp(join(root, name), join(container, name), { recursive: true })
}
await mkdir(join(container, 'resources/app'), { recursive: true })
for (const name of await readdir(join(root, 'resources'))) if (name !== 'app') await cp(join(root, 'resources', name), join(container, 'resources', name), { recursive: true })
await writeFile(join(container, 'resources/app/package.json'), jsonBytes({ name: 'shaco-forge-explicit-step2-test-container', version: '0.0.0', type: 'module', main: 'isolated-bootstrap.mjs' }), 'utf8')
const config = { packagedRoot: root, workerNodePath: join(root, RELEASE_LAYOUT.node), workerEntryPath: bridge, nativeHelperPath: helper,
  harnessRoot: join(root, 'harness'), dshHome: f.paths.dsh, profileName: 'shaco-forge' }
await writeFile(join(container, 'resources/app/isolated-bootstrap.mjs'), `// NOT_SHIPPED_TEST_CONTAINER\nimport { startDesktop } from ${JSON.stringify(pathToFileURL(join(root, RELEASE_LAYOUT.desktopEntry)).href)}\nvoid startDesktop(${JSON.stringify(config)})\n`, 'utf8')
const resultPath = join(evidence, 'packaged-isolated-desktop.json')
const child = spawn(join(container, RELEASE_LAYOUT.desktop), ['--no-error-dialogs', `--user-data-dir=${join(f.root, 'electron-profile')}`], {
  env: { ...env, SHACO_FORGE_EVIDENCE_PATH: resultPath, SHACO_FORGE_SCREENSHOT_PATH: join(evidence, 'packaged-isolated-desktop.png'), SHACO_FORGE_EVIDENCE_OBSERVER: '1' },
  cwd: container, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
})
let diagnostics = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', bytes => { diagnostics = (diagnostics + String(bytes)).slice(-8192) })
const timer = setTimeout(() => child.kill(), 180000)
const code = await new Promise((done, reject) => { child.once('error', reject); child.once('exit', done) })
clearTimeout(timer)
const result = await readFile(resultPath, 'utf8').then(JSON.parse).catch(() => ({ result: 'FAIL', errors: diagnostics.split(/\r?\n/).filter(line => /error|failed|Cannot find/i.test(line)).map(line => line.slice(0,500)) }))
await writeFile(join(evidence, 'packaged-step2-summary.json'), jsonBytes({ result: result.result, exitCode: code,
  testMode: 'EXPLICIT_NON_SHIPPED_CONTAINER_IMPORTING_EXACT_PRODUCT_MODULES', packagedRoot: root, artifactDigest: identity.digest,
  actualElectronExecutableSha256: await hashFile(join(container, RELEASE_LAYOUT.desktop)), releaseElectronExecutableSha256: await hashFile(join(root, RELEASE_LAYOUT.desktop)),
  nodeIdentity, productionDependencyClosure: closure, productionPreflightRejectedBeforeWorker: true,
  isolatedRoot: f.root, runtime: result, providerRuns: 0, signingRuns: 0, productionDataWrites: 0 }), 'utf8')
assert.equal(code, 0)
assert.equal(result.result, 'PASS', JSON.stringify(result))
assert.equal(await hashFile(join(root, 'artifact-identity.json')), pristine)
await verifyPackagedRuntime(root)
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
console.log(jsonBytes({ result: 'PASS', packagedArtifactDigest: identity.digest, explicitIsolatedAdapter: true, providerRuns: 0, signingRuns: 0 }))
