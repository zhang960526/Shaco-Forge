import assert from 'node:assert/strict'
import { execFile, spawn, spawnSync } from 'node:child_process'
import { copyFile, lstat, mkdir, readFile, realpath, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { RELEASE_LAYOUT, hashFile, jsonBytes, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'
import { verifyProductionClosure } from './harness-production-closure.mjs'
import { inspectLocalPlatform, lifecycleRequest } from '../apps/desktop/dist/main/lifecycle-client.js'

const run = promisify(execFile)
const root = resolve(import.meta.dirname, '..')
const { packagedRoot, evidence: packageEvidence } = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
if (JSON.parse(await readFile(join(packagedRoot, 'release-manifest.json'), 'utf8')).ControlStoreSchemaVersion === '1') {
  await import('./smoke-packaged-step2.mjs')
  process.exit(0)
}
const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence)
await mkdir(evidence, { recursive: true })
const results = []
const record = async (id, value) => {
  results.push({ id, ...value })
  await writeFile(join(evidence, 'dedicated-results.json'), jsonBytes({ results, providerRuns: 0, signingRuns: 0 }), 'utf8')
}
const environment = { ...process.env }
for (const key of Object.keys(environment)) if (/^(DSH_|SHACO_FORGE_|NODE_|ELECTRON_|NPM_|PNPM_|COREPACK_)/i.test(key) || key.toLowerCase() === 'path') delete environment[key]
environment.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`
environment.DSH_HOME = join(evidence, 'forbidden-ambient-home')
environment.SHACO_FORGE_DSH_HOME = join(evidence, 'forbidden-caller-home')
environment.LOCALAPPDATA = join(evidence, 'forbidden-ambient-localappdata')
const helper = join(packagedRoot, RELEASE_LAYOUT.nativeHelper)
const node = join(packagedRoot, RELEASE_LAYOUT.node)
const desktop = join(packagedRoot, RELEASE_LAYOUT.desktop)
const knownFolders = JSON.parse((await run(helper, ['--inspect-product-home'], { env: environment, windowsHide: true })).stdout)
const expectedProductRoot = join(knownFolders.localApplicationData, 'Shaco Forge')
const expectedHome = join(expectedProductRoot, 'dsh')
const homeExisted = await lstat(expectedHome).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error })
const productExisted = await lstat(expectedProductRoot).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error })
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false, 'PACKAGED_GATE_REQUIRES_NO_PREEXISTING_AUTHORITY')
const children = []
try {
const manifest = await verifyPackagedRuntime(packagedRoot)
for (let dir = dirname(packagedRoot); ; dir = dirname(dir)) {
  const present = await lstat(join(dir, 'node_modules')).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error })
  assert.equal(present, false, `AMBIENT_ANCESTOR_NODE_MODULES: ${dir}`)
  if (dirname(dir) === dir) break
}
await record('ISOLATED_RELEASE_ANCESTRY', { result: 'PASS', ancestorNodeModules: 'ABSENT', runtimeDependencyFallbackToDevelopmentRepository: false })
const closurePath = join(packageEvidence, 'harness-production-closure.json')
assert.equal(await hashFile(closurePath), manifest.BuildProvenance.harnessProductionClosureSha256)
await record('PRODUCTION_DEPENDENCY_CLOSURE', await verifyProductionClosure(join(packagedRoot, 'harness/node_modules'), JSON.parse(await readFile(closurePath, 'utf8'))))
assert.equal(manifest.ProductionProfileIdentity, 'shaco-forge')
assert.doesNotMatch(JSON.stringify(manifest), /V1-SLICE-|shaco-forge-v1-slice-|shaco-v1-slice-/)
for (const name of ['node', 'pnpm', 'dsh']) {
  const probe = spawnSync(join(process.env.SystemRoot, 'System32/where.exe'), [name], { env: environment, encoding: 'utf8', windowsHide: true })
  assert.notEqual(probe.status, 0)
}
const nodeIdentity = JSON.parse((await run(node, ['-p', 'JSON.stringify({version:process.version,platform:process.platform,arch:process.arch,execPath:process.execPath})'], { env: environment, windowsHide: true })).stdout)
assert.equal(nodeIdentity.version, 'v22.19.0')
assert.equal(nodeIdentity.execPath, node)
await record('COMPOSITION_AND_NO_PATH_TOOLCHAIN', { result: 'PASS', nodeIdentity, path: environment.PATH })

// Each negative attempt alters only this generated package and restores the exact
// bytes in finally. A real Desktop launch must fail before any Worker is started.
async function desktopAttempt(name, fullObserver = false) {
  const startedAt = Date.now()
  const path = join(evidence, `${name}.json`)
  const child = spawn(desktop, [`--user-data-dir=${join(evidence, 'electron-profile')}`], { cwd: evidence, env: { ...environment,
    SHACO_FORGE_EVIDENCE_PATH: path, SHACO_FORGE_SCREENSHOT_PATH: join(evidence, `${name}.png`),
    SHACO_FORGE_EVIDENCE_OBSERVER: fullObserver ? '1' : '0' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  children.push(child)
  let output = ''
  for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString() })
  const timer = setTimeout(() => child.kill(), 150_000)
  const code = await new Promise((resolveExit, rejectExit) => { child.once('error', rejectExit); child.once('exit', resolveExit) })
  clearTimeout(timer)
  // Runtime logs are not retained verbatim: selected bounded evidence is the
  // authoritative record. Do not retain raw Harness business/credential content.
  const value = await readFile(path, 'utf8').then(JSON.parse).catch(() => ({ result: 'FAIL', evidenceMissing: true, processOutputBytes: Buffer.byteLength(output) }))
  const selectedStartupDiagnostics = {
    errorCodes: [...new Set(output.match(/\b(?:ERR_[A-Z0-9_]+|[A-Z][A-Z0-9_]*(?:FAILURE|REJECTED|MISMATCH|TIMEOUT))\b/g) ?? [])],
    missingModules: [...output.matchAll(/Cannot find (?:module|package) ['"]([^'"\r\n]+)['"]/g)].map(match => match[1]),
    processOutputBytes: Buffer.byteLength(output), evidenceMissing: value.evidenceMissing === true,
    elapsedMs: Date.now() - startedAt, timedOut: code === null,
  }
  if (code === null) {
    try {
      const { status, socket } = await lifecycleRequest(helper, 'discover')
      socket.destroy()
      selectedStartupDiagnostics.authorityAtTimeout = { state: status?.state, worker: status?.worker, host: status?.host, workerRuntime: status?.workerRuntime }
    } catch (error) { selectedStartupDiagnostics.discoveryError = error.message }
  }
  await record(name, { result: value.result, exitCode: code, evidence: `${name}.json`, selectedStartupDiagnostics })
  return { code, value }
}
for (const [id, path, kind] of (process.argv.includes('--startup-only') ? [] : [['MISSING_NODE', RELEASE_LAYOUT.node, 'missing'], ['WRONG_NODE', RELEASE_LAYOUT.node, 'modified'],
  ['MISSING_HARNESS', RELEASE_LAYOUT.harness, 'missing'], ['WRONG_HARNESS', RELEASE_LAYOUT.harnessManifest, 'modified'],
  ['MODIFIED_CRITICAL', RELEASE_LAYOUT.client, 'modified'], ['MISSING_CRITICAL', RELEASE_LAYOUT.nativeHelper, 'missing'],
  ['UNEXPECTED_CRITICAL', 'runtime/unexpected-critical.dll', 'extra']])) {
  const target = join(packagedRoot, path)
  const backup = join(evidence, `${id}.original`)
  if (kind !== 'extra') await copyFile(target, backup)
  try {
    if (kind === 'missing') await unlink(target)
    else await writeFile(target, 'NEGATIVE_PACKAGE_IDENTITY_FIXTURE', 'utf8')
    await assert.rejects(verifyPackagedRuntime(packagedRoot), /RELEASE_INTEGRITY_FAILURE/)
    const attempt = await desktopAttempt(id)
    assert.notEqual(attempt.code, 0)
    assert.match(attempt.value.startupFailure, /RELEASE_INTEGRITY_FAILURE/)
    await record(`${id}_FAIL_CLOSED`, { result: 'PASS', actualStartupResult: 'FAIL', fallback: false })
  } finally {
    if (kind === 'extra') await unlink(target)
    else { await copyFile(backup, target); await unlink(backup) }
  }
}
await verifyPackagedRuntime(packagedRoot)

// Native path-negative operations validate before creating or writing the home.
for (const [name, expected] of [['INSTALL_ROOT', packagedRoot], ['CWD', evidence], ['TEMP', process.env.TEMP], ['SHARED', 'C:\\Users\\Public\\Shaco Forge\\dsh']]) {
  await assert.rejects(run(helper, ['--product-home', packagedRoot, evidence, expected], { env: environment, windowsHide: true }))
  await record(`HOME_REJECT_${name}`, { result: 'PASS', writePathEntered: false })
}
const junction = join(evidence, 'redirected-home')
await symlink(packagedRoot, junction, 'junction')
try {
  await assert.rejects(run(helper, ['--product-home', packagedRoot, evidence, junction], { env: environment, windowsHide: true }))
  await record('HOME_REJECT_JUNCTION', { result: 'PASS', writePathEntered: false })
} finally { await unlink(junction) }
if (!productExisted) {
  await symlink(evidence, expectedProductRoot, 'junction')
  try {
    await assert.rejects(run(helper, ['--product-home', packagedRoot, evidence], { env: environment, windowsHide: true }), /DSH_HOME_REPARSE_REJECTED/)
    await record('HOME_REJECT_ACTUAL_KNOWN_FOLDER_JUNCTION', { result: 'PASS', writePathEntered: false })
  } finally { await unlink(expectedProductRoot) }
}

// First real Worker boot resolves/injects the current Windows known-folder home.
const worker = spawn(node, [join(packagedRoot, RELEASE_LAYOUT.workerEntry)], { cwd: packagedRoot, env: environment, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
children.push(worker)
const events = []
let workerErrorBytes = 0
worker.stderr.on('data', chunk => { workerErrorBytes += chunk.length })
let pending = ''
worker.stdout.on('data', chunk => {
  pending += chunk.toString()
  const lines = pending.split(/\r?\n/); pending = lines.pop() ?? ''
  for (const line of lines) { try { const value = JSON.parse(line); if (value.protocolVersion === 1) events.push(value) } catch {} }
})
let home
try {
  const deadline = Date.now() + 100_000
  while (!events.some(row => row.phase === 'host-ready') && worker.exitCode === null && Date.now() < deadline) await new Promise(resolveDelay => setTimeout(resolveDelay, 100))
  await writeFile(join(evidence, 'worker-startup.json'), jsonBytes({ events, exitCode: worker.exitCode, stderrBytes: workerErrorBytes }), 'utf8')
  const ready = events.find(row => row.phase === 'host-ready')
  assert.ok(ready, 'REAL_PACKAGED_HARNESS_NOT_READY: see worker-startup.json')
  home = ready.dshHome
  assert.equal(home, expectedHome)
  assert.equal(await realpath(home), home)
  assert.notEqual(home, environment.DSH_HOME)
  assert.notEqual(home, environment.SHACO_FORGE_DSH_HOME)
  assert.ok(home.endsWith('\\Shaco Forge\\dsh'))
  const proof = JSON.parse((await run(helper, ['--runtime-processes', `${worker.pid},${ready.hostPid}`], { env: environment, windowsHide: true })).stdout)
  assert.ok(proof.every(row => row.executable === node))
  assert.deepEqual(ready.hostLaunchArgv, [node, join(packagedRoot, RELEASE_LAYOUT.harness), '--profile', 'shaco-forge'])
  assert.equal(ready.profilePath, join(packagedRoot, RELEASE_LAYOUT.profile))
  assert.equal(await realpath(join(home, 'profiles/shaco-forge')), ready.profilePath)
  await record('REAL_WORKER_HARNESS_AND_CONTROLLED_HOME', { result: 'PASS', home, canonicalHome: await realpath(home),
    testEnvironment: process.env.SHACO_FORGE_DESKTOP_TEST_ENVIRONMENT ?? 'CALLER_CONTEXT', proof, ready })
} finally {
  if (worker.exitCode === null) worker.kill()
  await new Promise(resolveDelay => setTimeout(resolveDelay, 2000))
}
await verifyPackagedRuntime(packagedRoot)
for (const mode of [false, true]) {
  const { code, value } = await desktopAttempt(mode ? 'EVIDENCE_OBSERVER_STARTUP' : 'ORDINARY_STARTUP', mode)
  assert.equal(code, 0)
  assert.equal(value.result, 'PASS', JSON.stringify(value))
  assert.equal(value.renderer.transport.fullObserverInstalled, mode)
  assert.equal(value.cleanup.exited, true)
  assert.equal(value.desktop.packaged, true)
  assert.ok(value.topology.packagedProcessProof.every(row => row.executable.startsWith(packagedRoot + '\\')))
}
await verifyPackagedRuntime(packagedRoot)
assert.equal(await lstat(environment.LOCALAPPDATA).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error }), false,
  'PACKAGED_NATIVE_RUNTIME_USED_AMBIENT_CACHE')
await record('FINAL_INTEGRITY_AND_CLEANUP', { result: 'PASS', productDataHomePreserved: home, tempScope: evidence,
  packageBytesRestored: true, noProvider: true, noSigning: true })
console.log(jsonBytes({ result: 'PASS', evidence, gates: results.length, home }))
} finally {
  for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill()
  // A timed-out Desktop can leave its detached Worker in initialization. Keep
  // discovering within one bounded cleanup window, then stop only this package's
  // authenticated authority. A transient busy pipe must not end the cleanup try.
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    try {
      const { status, socket } = await lifecycleRequest(helper, 'discover')
      socket.destroy()
      assert.equal(status?.workerRuntime.executable, node, 'UNRELATED_AUTHORITY_PRESERVED')
      const stopped = await lifecycleRequest(helper, 'stop-authority', status.workerInstanceId)
      stopped.socket.destroy()
    } catch (error) {
      if (!['WORKER_NOT_FOUND', 'BUSY', 'AUTHORITY_AMBIGUOUS_FAIL_CLOSED'].includes(error.message)) throw error
    }
    if (!(await inspectLocalPlatform(helper)).mutexExists) break
    await new Promise(resolveDelay => setTimeout(resolveDelay, 250))
  }
  assert.equal((await inspectLocalPlatform(helper)).mutexExists, false, 'PACKAGED_PROCESS_CLEANUP_FAILED')
  if (!homeExisted) {
    const owned = productExisted ? expectedHome : expectedProductRoot
    assert.equal(resolve(owned), join(knownFolders.localApplicationData, 'Shaco Forge', ...(productExisted ? ['dsh'] : [])))
    assert.ok(resolve(owned).startsWith(resolve(knownFolders.localApplicationData) + '\\'))
    await rm(owned, { recursive: true, force: true })
  }
  await rm(join(evidence, 'electron-profile'), { recursive: true, force: true })
  await writeFile(join(evidence, 'cleanup.json'), jsonBytes({ noAuthority: true, preexistingHomePreserved: homeExisted,
    newlyCreatedTestHomeRemoved: !homeExisted, knownFolders, expectedHome, providerRuns: 0, signingRuns: 0 }), 'utf8')
}
