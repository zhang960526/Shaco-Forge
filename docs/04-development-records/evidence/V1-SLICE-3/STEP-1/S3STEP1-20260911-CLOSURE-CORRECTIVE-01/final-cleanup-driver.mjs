// Evidence-only cleanup. Preserve every package and diagnostic build for review.
import assert from 'node:assert/strict'
import { copyFile, lstat, readFile, readdir, realpath, rm, unlink, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const evidence = import.meta.dirname
const receipt = process.argv[2] ?? 'final-cleanup.json'
assert.match(receipt, /^(?:final-cleanup|intermediate-cleanup-cycle-\d+)\.json$/)
const audit = { result: 'IN_PROGRESS', removedTemporaryRoots: [], archivedFinalElectronArtifacts: [] }
const persist = () => writeFile(join(evidence, receipt), JSON.stringify(audit, null, 2) + '\n', 'utf8')
try {
const root = resolve(evidence, '../../../../../..')
const summary = JSON.parse(await readFile(join(evidence, 'test-summary.json'), 'utf8'))
const latest = command => summary.commands.filter(row => row.command === command).at(-1)
assert.equal(latest('smoke:packaged-runtime').exitCode, 0)
assert.equal(latest('smoke:packaged-runtime').phase, 'FINAL_REGRESSION')
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const { inspectLocalPlatform } = await import(pathToFileURL(join(root, 'apps/desktop/dist/main/lifecycle-client.js')))
assert.equal((await inspectLocalPlatform(join(location.packagedRoot, 'native/ShacoForge.NativeCarrier.exe'))).mutexExists, false)
const ps = 'C:/Users/18902/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe'
const inspect = String.raw`$rows = @(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like 'D:\Project\Shaco-Forge\*ShacoForge.NativeCarrier.exe' -or $_.ExecutablePath -like 'D:\Project\Shaco-Forge\dist\packaging\*\Shaco Forge.exe' -or $_.ExecutablePath -like 'D:\Project\Shaco-Forge\dist\packaging\*\runtime\node.exe' -or $_.ExecutablePath -like 'C:\Users\18902\AppData\Local\Temp\shaco-forge-s3s1-packages\*\Shaco Forge.exe' -or $_.ExecutablePath -like 'C:\Users\18902\AppData\Local\Temp\shaco-forge-s3s1-packages\*\runtime\node.exe' -or $_.ExecutablePath -like 'C:\Users\18902\AppData\Local\Temp\shaco-forge-s3s1-packages\*\ShacoForge.NativeCarrier.exe' -or $_.CommandLine -match 'Shaco-Forge[\\/]apps[\\/]worker[\\/]dist[\\/]index.js' } | Select-Object ProcessId,ParentProcessId,ExecutablePath); ConvertTo-Json -InputObject $rows -Compress`
const processes = JSON.parse(execFileSync(ps, ['-NoProfile', '-Command', inspect], { encoding: 'utf8', windowsHide: true }))
assert.deepEqual(processes, [], 'PRESERVE_DATA_WHILE_PRODUCT_PROCESS_REMAINS')
const archived = audit.archivedFinalElectronArtifacts
const modules = join(root, 'node_modules')
assert.equal(await realpath(modules), modules)
for (const [command, stem] of [['smoke:electron', 'electron-runtime'], ['smoke:failure', 'carrier-failure-runtime']]) {
  const row = latest(command)
  const run = join(evidence, 'runs', command.replaceAll(':', '-') + '-' + row.attempt, 'step1')
  const original = join(modules, '.step1-electron-regression', stem + '.json')
  assert.deepEqual(JSON.parse(await readFile(original, 'utf8')), JSON.parse(await readFile(join(run, 'electron-regression.json'), 'utf8')))
  for (const ext of ['json', 'png']) {
    const source = join(modules, '.step1-electron-regression', stem + '.' + ext)
    const destination = join(run, stem + '.' + ext)
    await copyFile(source, destination)
    assert.deepEqual(await readFile(source), await readFile(destination))
    await persist()
    await unlink(source)
    archived.push(destination)
    await persist()
  }
}
const removed = audit.removedTemporaryRoots
async function removeOwned(target, parent, createdAfter) {
  const stat = await lstat(target)
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink())
  const canonical = await realpath(target)
  assert.equal(canonical, target)
  assert.ok(canonical.startsWith(parent + sep) && stat.birthtimeMs >= createdAfter, 'UNPROVEN_TEMPORARY_OWNERSHIP')
  const row = { path: canonical, createdAt: stat.birthtime.toISOString(), removed: false }
  removed.push(row)
  await persist()
  await rm(canonical, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  row.removed = true
  await persist()
}
const firstRuntime = Date.parse(summary.commands.find(row => row.command === 'smoke:worker').startedAt)
for (const entry of await readdir(modules, { withFileTypes: true })) {
  if (!/^\.(?:step1-(?:runtime|foundation|electron|overlap)|step2-runtime|review026-interactions|full-shaco-visual)-[A-Za-z0-9_-]{6}$/.test(entry.name)) continue
  const target = join(modules, entry.name)
  if ((await lstat(target)).birthtimeMs >= firstRuntime) await removeOwned(target, modules, firstRuntime)
}
const firstAttempt = Math.min(...summary.commands.map(row => Date.parse(row.startedAt)))
for (const name of ['corrective-electron-integrity-profile', 'corrective-inspector-profile']) {
  const target = join(root, 'dist', name)
  if (await lstat(target).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error })) await removeOwned(target, join(root, 'dist'), firstAttempt)
}
const dedicatedCleanup = `runs/smoke-packaged-runtime-${latest('smoke:packaged-runtime').attempt}/cleanup.json`
const dedicated = JSON.parse(await readFile(join(evidence, dedicatedCleanup), 'utf8'))
assert.equal(dedicated.noAuthority, true)
assert.equal(dedicated.newlyCreatedTestHomeRemoved, true)
assert.equal(await lstat(dedicated.expectedHome).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error }), false)
const result = { result: 'PASS', noAuthority: true, productProcesses: processes, removedTemporaryRoots: removed,
  tempCreationBoundary: new Date(firstRuntime).toISOString(), archivedFinalElectronArtifacts: archived, dedicatedCleanup,
  diagnosticCleanup: ['diagnostic-authority-recovery.json', 'diagnostic-home-cleanup.json', 'intermediate-cleanup-cycle-1-recovery.json'],
  retained: ['dist/packaging/*', 'dist/corrective-probes/*', 'isolated development and final packages in Temp/shaco-forge-s3s1-packages', 'all corrective evidence and failed attempts'],
  retentionReason: 'Read-only reviewable generated build/artifact evidence; no mutable product test home retained.', finalPackage: location.packagedRoot, providerRuns: 0, signingRuns: 0 }
Object.assign(audit, result)
await persist()
console.log(JSON.stringify({ result: result.result, removedTemporaryRoots: removed.length, archived: archived.length, productProcesses: processes.length }))
} catch (error) {
  Object.assign(audit, { result: 'FAIL', error: String(error), stack: error.stack })
  await persist()
  throw error
}
