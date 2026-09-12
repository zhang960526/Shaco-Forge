// Source-bound Release Trust Corrective gate ledger. Never runs Provider, signing or an installer.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

assert.equal(process.version, 'v22.19.0')
const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-3/RELEASE-TRUST-CORRECTIVE/S3RTC-20260912-01')
const command = process.argv[2]
const required = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure',
  'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'test:full-shaco', 'smoke:full-shaco',
  'package:runtime', 'test:packaged-runtime', 'smoke:packaged-runtime', 'test:slice3-step2', 'smoke:slice3-step2', 'package:installer', 'test:installer', 'verify:f05']
assert.ok(required.includes(command), 'COMMAND_OUTSIDE_RELEASE_TRUST_CORRECTIVE_MATRIX')

const node = process.execPath
const pnpm = 'C:/Users/18902/AppData/Local/node/corepack/v1/pnpm/11.7.0/bin/pnpm.cjs'
const harness = 'D:/Project/Shaco-Forge-Upstream/deepseek-harness'
const electronZipDir = 'C:/Users/18902/AppData/Local/electron/Cache/091145cafe56050876f1d18a63e2cd89dbfc75bba207f769653cb22455d90b4e'
const powershell = 'C:/Users/18902/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe'
const git = execFileSync('where.exe', ['git.exe'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0]
const env = { ...process.env, SHACO_FORGE_HARNESS_ROOT: harness, SHACO_FORGE_WORKER_NODE: node, SHACO_FORGE_PNPM_ENTRY: pnpm,
  SHACO_FORGE_GIT: git, SHACO_FORGE_ELECTRON_ZIP_DIR: electronZipDir, SHACO_FORGE_POWERSHELL: powershell }
for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
env.PATH = `${dirname(node)};${join(env.ProgramFiles, 'dotnet')};${dirname(git)};${dirname(powershell)};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
delete env.ELECTRON_RUN_AS_NODE

async function sourceInventory() {
  const files = execFileSync(git, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root }).toString('utf8').split('\0')
    .filter(path => path && (/^(apps|packages|scripts)\//.test(path) || ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json'].includes(path))).sort()
  return Promise.all(files.map(async path => ({ path, sha256: createHash('sha256').update(await readFile(join(root, path))).digest('hex') })))
}
const rowsBefore = await sourceInventory()
const sourceBytes = JSON.stringify(rowsBefore, null, 2) + '\n'
const sourceBefore = createHash('sha256').update(sourceBytes).digest('hex')
await mkdir(join(evidence, 'logs'), { recursive: true })
const inventoryPath = join(evidence, 'final-source-inventory.json')
const existingInventory = await readFile(inventoryPath, 'utf8').catch(error => { if (error.code === 'ENOENT') return undefined; throw error })
if (existingInventory === undefined) await writeFile(inventoryPath, sourceBytes, 'utf8')
else assert.equal(existingInventory, sourceBytes, 'FINAL_SOURCE_INVENTORY_CHANGED')

const summaryPath = join(evidence, 'command-matrix.json')
const summary = await readFile(summaryPath, 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return { commands: [] }; throw error })
const attempt = summary.commands.filter(row => row.command === command).length + 1
const run = join(evidence, 'runs', `${command.replaceAll(':', '-')}-${attempt}`)
env.SHACO_FORGE_STEP1_EVIDENCE_ROOT = join(run, 'step1')
env.SHACO_FORGE_STEP2_EVIDENCE_ROOT = join(run, 'step2')
env.SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT = join(evidence, 'composition')
env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT = run
env.SHACO_FORGE_PACKAGED_LOCATION = join(root, 'dist/packaged-runtime-location.json')
await mkdir(env.SHACO_FORGE_STEP1_EVIDENCE_ROOT, { recursive: true })
await mkdir(env.SHACO_FORGE_STEP2_EVIDENCE_ROOT, { recursive: true })
const args = command === 'test' ? [pnpm, 'test'] : [pnpm, 'run', command]
const startedAt = new Date().toISOString()
const child = spawn(node, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString(); process.stdout.write(chunk) })
const exitCode = await new Promise(done => { child.once('error', error => { output += String(error); done(1) }); child.once('exit', done) })
const rowsAfter = await sourceInventory()
const sourceAfter = createHash('sha256').update(JSON.stringify(rowsAfter, null, 2) + '\n').digest('hex')
const log = `logs/${command.replaceAll(':', '-')}-${attempt}.log`
await writeFile(join(evidence, log), output, 'utf8')
summary.commands.push({ command, phase: 'FINAL_REGRESSION', attempt, sourceBefore, sourceAfter, sourceHead: execFileSync(git, ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  executable: node, args, startedAt, endedAt: new Date().toISOString(), exitCode, result: exitCode === 0 && sourceBefore === sourceAfter ? 'PASS' : 'FAIL', log })
await writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8')
process.exitCode = exitCode === 0 && sourceBefore === sourceAfter ? 0 : 1
