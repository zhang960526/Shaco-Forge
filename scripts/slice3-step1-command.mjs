// Step1 build/test ledger. Never executes Provider, signing or installer commands.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

assert.equal(process.version, 'v22.19.0')
const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01')
const command = process.argv[2]
const allowed = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'test:full-shaco', 'smoke:full-shaco', 'package:runtime', 'test:packaged-runtime', 'smoke:packaged-runtime', 'packaged-startup-probe', 'composition', 'install-packager']
assert.ok(allowed.includes(command), 'Command outside Step1 non-Provider allowlist')
const pnpm = process.env.SHACO_FORGE_PNPM_ENTRY
assert.ok(pnpm)
const env = { ...process.env, SHACO_FORGE_HARNESS_ROOT: 'D:/Project/Shaco-Forge-Upstream/deepseek-harness', SHACO_FORGE_WORKER_NODE: process.execPath }
env.SHACO_FORGE_GIT = process.env.SHACO_FORGE_GIT ?? execFileSync('where.exe', ['git.exe'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0]
for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
env.PATH = `${dirname(process.execPath)};${join(env.ProgramFiles, 'dotnet')};${dirname(env.SHACO_FORGE_GIT)};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
delete env.ELECTRON_RUN_AS_NODE
const summaryPath = join(evidence, 'test-summary.json')
const summary = await readFile(summaryPath, 'utf8').then(JSON.parse).catch(() => ({ commands: [] }))
const attempt = summary.commands.filter(row => row.command === command).length + 1
const run = join(evidence, 'runs', `${command.replaceAll(':', '-')}-${attempt}`)
env.SHACO_FORGE_STEP1_EVIDENCE_ROOT = join(run, 'step1')
env.SHACO_FORGE_STEP2_EVIDENCE_ROOT = join(run, 'step2')
env.SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT = join(evidence, 'composition')
env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT = run
for (const dir of [env.SHACO_FORGE_STEP1_EVIDENCE_ROOT, env.SHACO_FORGE_STEP2_EVIDENCE_ROOT, join(evidence, 'logs')]) await mkdir(dir, { recursive: true })
const args = command === 'install-packager' ? [pnpm, 'add', '-Dw', '--save-exact', '--store-dir', 'D:/.pnpm-store', '@electron/packager@18.3.6']
  : command === 'packaged-startup-probe' ? ['scripts/smoke-packaged-runtime.mjs', '--startup-only']
  : command === 'composition' ? ['scripts/step3-final-composition.mjs', '--freeze']
    : [pnpm, ...(command === 'test' ? ['test'] : ['run', command])]
const startedAt = new Date().toISOString()
async function sourceIdentity() {
  const files = execFileSync(env.SHACO_FORGE_GIT, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root }).toString('utf8').split('\0')
    .filter(path => path && (/^(apps|packages|scripts)\//.test(path) || ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json'].includes(path))).sort()
  const rows = await Promise.all(files.map(async path => ({ path, sha256: createHash('sha256').update(await readFile(join(root, path))).digest('hex') })))
  return createHash('sha256').update(JSON.stringify(rows, null, 2) + '\n').digest('hex')
}
const sourceBefore = await sourceIdentity()
const log = `logs/${command.replaceAll(':', '-')}-${attempt}.log`
const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString(); process.stdout.write(chunk) })
const exitCode = await new Promise(resolveExit => {
  child.once('error', error => { output += String(error); resolveExit(1) })
  child.once('exit', resolveExit)
})
await writeFile(join(evidence, log), output, 'utf8')
summary.commands.push({ command, phase: process.env.SHACO_FORGE_STEP1_FINAL === '1' ? 'FINAL_REGRESSION' : 'DEVELOPMENT',
  sourceBefore, sourceAfter: await sourceIdentity(), executable: process.execPath, args, attempt, startedAt, endedAt: new Date().toISOString(), sourceHead: execFileSync(env.SHACO_FORGE_GIT, ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), exitCode, result: exitCode === 0 ? 'PASS' : 'FAIL', log })
await writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8')
process.exitCode = exitCode ?? 1
