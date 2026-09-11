import assert from 'node:assert/strict'
import { copyFile, lstat, readFile, readdir, realpath, rm, rmdir, unlink, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01')
const summary = JSON.parse(await readFile(join(evidence, 'test-summary.json'), 'utf8'))
const latest = command => summary.commands.filter(row => row.command === command).at(-1)
assert.equal(latest('smoke:packaged-runtime').exitCode, 0)
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const helper = join(location.packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
const { inspectLocalPlatform } = await import('../apps/desktop/dist/main/lifecycle-client.js')
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const ps = 'C:/Users/18902/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe'
const inspectScript = String.raw`$rows = @(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like 'D:\Project\Shaco-Forge\*ShacoForge.NativeCarrier.exe' -or $_.ExecutablePath -like 'D:\Project\Shaco-Forge\dist\packaging\*\Shaco Forge.exe' -or $_.ExecutablePath -like 'D:\Project\Shaco-Forge\dist\packaging\*\runtime\node.exe' -or $_.CommandLine -match 'Shaco-Forge[\\/]apps[\\/]worker[\\/]dist[\\/]index.js' } | Select-Object ProcessId,ParentProcessId,ExecutablePath); ConvertTo-Json -InputObject $rows -Compress`
const processRows = JSON.parse(execFileSync(ps, ['-NoProfile', '-Command', inspectScript], { encoding: 'utf8', windowsHide: true }))
assert.deepEqual(processRows, [], 'Preserve temporary data while a Product process remains')
const firstRuntime = Date.parse(summary.commands.find(row => row.command === 'smoke:worker').startedAt)
const modules = join(root, 'node_modules')
assert.equal(await realpath(modules), modules)
const removed = []
for (const entry of await readdir(modules, { withFileTypes: true })) {
  if (!/^\.(?:step1-(?:runtime|foundation|electron|overlap)|step2-runtime|review026-interactions|full-shaco-visual)-[A-Za-z0-9_-]{6}$/.test(entry.name)) continue
  const target = join(modules, entry.name)
  const stat = await lstat(target)
  if (stat.birthtimeMs < firstRuntime) continue
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink())
  const canonical = await realpath(target)
  assert.equal(canonical, target)
  assert.ok(canonical.startsWith(modules + sep))
  removed.push({ path: target, createdAt: stat.birthtime.toISOString() })
  await rm(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
}
// Archive the current final Electron screenshots beside their per-attempt JSON.
// The shared ignored regression output directory may contain earlier artifacts;
// leave all other contents alone.
const screenshots = []
for (const [command, stem] of [['smoke:electron', 'electron-runtime'], ['smoke:failure', 'carrier-failure-runtime']]) {
  const row = latest(command)
  const run = join(evidence, 'runs', command.replaceAll(':', '-') + '-' + row.attempt, 'step1')
  const original = join(modules, '.step1-electron-regression', stem + '.json')
  const archived = JSON.parse(await readFile(join(run, 'electron-regression.json'), 'utf8'))
  assert.deepEqual(JSON.parse(await readFile(original, 'utf8')), archived)
  for (const ext of ['json', 'png']) {
    const source = join(modules, '.step1-electron-regression', stem + '.' + ext)
    const destination = join(run, stem + '.' + ext)
    await copyFile(source, destination)
    await unlink(source)
    screenshots.push(destination)
  }
}
const retainedBuildOutputs = (await readdir(join(root, 'dist/packaging'), { withFileTypes: true })).filter(row => row.isDirectory()).map(row => join(root, 'dist/packaging', row.name))
const failedInstallStore = join(root, '.pnpm-store')
assert.equal(await realpath(failedInstallStore), failedInstallStore)
assert.deepEqual(await readdir(failedInstallStore), ['v11'])
const failedStoreVersion = join(failedInstallStore, 'v11')
assert.equal(await realpath(failedStoreVersion), failedStoreVersion)
assert.deepEqual(await readdir(failedStoreVersion), ['index.db'])
const failedStoreIndex = join(failedStoreVersion, 'index.db')
const failedIndexStat = await lstat(failedStoreIndex)
assert.ok(failedIndexStat.isFile() && !failedIndexStat.isSymbolicLink())
const installAttempt = summary.commands.find(row => row.command === 'install-packager')
assert.ok(failedIndexStat.birthtimeMs >= Date.parse(installAttempt.startedAt) && failedIndexStat.birthtimeMs <= Date.parse(installAttempt.endedAt))
await unlink(failedStoreIndex)
await rmdir(failedStoreVersion)
await rmdir(failedInstallStore)
const result = { result: 'PASS', noAuthority: true, productProcesses: processRows, tempCreationBoundary: new Date(firstRuntime).toISOString(),
  removedTemporaryRoots: removed, archivedFinalElectronArtifacts: screenshots,
  retainedBuildOutputs, retentionReason: 'Reviewable final package and failed/intermediate packaging diagnostics; not mutable user data',
  dedicatedCleanup: `runs/smoke-packaged-runtime-${latest('smoke:packaged-runtime').attempt}/cleanup.json`,
  delayedFailedProbeCleanup: 'probe-4-recovery.json', removedFailedInstallStore: { path: failedInstallStore, files: ['v11/index.db'], bytes: failedIndexStat.size }, providerRuns: 0, signingRuns: 0 }
await writeFile(join(evidence, 'final-cleanup.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify({ result: 'PASS', removedTemporaryRoots: removed.length, retainedBuildOutputs: retainedBuildOutputs.length }))
