// Bounded finalization runner: existing commands, separate Evidence, no Provider.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
const root = process.cwd(), evidence = import.meta.dirname
assert.equal(process.version, 'v22.19.0')
const pnpm = process.env.SHACO_FORGE_PNPM_ENTRY
assert.ok(pnpm)
const phase = process.argv[2], selected = process.argv[3]
const preflight = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'test:full-shaco', 'focused']
const final = [...preflight.filter(x => x !== 'focused'), 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'smoke:full-shaco']
assert.ok(['preflight', 'freeze', 'final'].includes(phase))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const env = { ...process.env, SHACO_FORGE_WORKER_NODE: process.execPath,
  SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT: evidence,
  SHACO_FORGE_POWERSHELL: process.env.SHACO_FORGE_POWERSHELL ?? join(process.env.ProgramFiles, 'PowerShell/7/pwsh.exe') }
for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
env.PATH = `${dirname(process.execPath)};${join(env.ProgramFiles, 'dotnet')};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
for (const key of ['ELECTRON_RUN_AS_NODE', 'SHACO_FORGE_USER_LOOP', 'SHACO_FORGE_FULL_SHACO_FINAL', 'SHACO_FORGE_STEP3_LIFECYCLE_PROOF', 'SHACO_FORGE_EVIDENCE_PATH', 'SHACO_FORGE_EVIDENCE_INJECT_CARRIER_FAILURE']) delete env[key]
Object.assign(process.env, env)
async function source() {
  const files = execFileSync(env.SHACO_FORGE_GIT, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root }).toString('utf8').split('\0').filter(p => p && (/^(apps|packages|scripts)\//.test(p) || p === 'package.json')).sort()
  return Promise.all(files.map(async path => ({ path, sha256: sha(await readFile(join(root, path))) })))
}
async function guard() { assert.deepEqual(await source(), JSON.parse(await readFile(join(evidence, 'source-guard.json'), 'utf8')), 'EXTERNAL_CHANGE_CONFLICT') }
const summaryPath = join(evidence, 'test-summary.json')
const summary = await readFile(summaryPath, 'utf8').then(JSON.parse).catch(() => ({ commands: [] }))
await mkdir(join(evidence, 'logs'), { recursive: true })
const { verifyFrozen } = await import(pathToFileURL(join(root, 'scripts/step3-final-composition.mjs')))
async function execute(command, args) {
  await guard()
  const attempt = summary.commands.filter(row => row.phase === phase && row.command === command).length + 1
  const run = join(evidence, 'runs', `${phase}-${command.replaceAll(':', '-')}-${attempt}`)
  env.SHACO_FORGE_STEP1_EVIDENCE_ROOT = join(run, 'step1')
  env.SHACO_FORGE_STEP2_EVIDENCE_ROOT = join(run, 'step2')
  await mkdir(env.SHACO_FORGE_STEP1_EVIDENCE_ROOT, { recursive: true })
  await mkdir(env.SHACO_FORGE_STEP2_EVIDENCE_ROOT, { recursive: true })
  const before = phase === 'final' ? await verifyFrozen() : undefined
  const startedAt = new Date().toISOString()
  process.stdout.write(`START ${phase} ${command} attempt=${attempt}\n`)
  const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  for (const stream of [child.stdout, child.stderr]) { stream.setEncoding('utf8'); stream.on('data', chunk => { output += chunk }) }
  const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve) })
  const log = `logs/${phase}-${command.replaceAll(':', '-')}-${attempt}.log`
  await writeFile(join(evidence, log), output, 'utf8')
  let frozenUnchanged = null, guardFailure
  try { await guard(); if (phase === 'final') { await verifyFrozen(); frozenUnchanged = true } } catch (error) { guardFailure = error.message; frozenUnchanged = false }
  summary.commands.push({ phase, command, exactCommand: args[0] === pnpm ? `pnpm ${command === 'test' ? 'test' : `run ${command}`}` : `node ${args.join(' ')}`, args, executable: process.execPath, attempt, startedAt, endedAt: new Date().toISOString(), exitCode, result: exitCode === 0 && !guardFailure ? 'PASS' : 'FAIL', log, frozenAt: before?.generatedAt, identitySha256: before ? sha(JSON.stringify(before.identity)) : undefined, frozenUnchanged, guardFailure })
  await writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8')
  process.stdout.write(`END ${phase} ${command} attempt=${attempt} exit=${exitCode} result=${summary.commands.at(-1).result}\n`)
  if (exitCode !== 0) process.stdout.write(output.slice(-3500))
  assert.equal(exitCode, 0, 'COMMAND_FAILED')
  assert.ok(!guardFailure, guardFailure)
}
if (phase === 'freeze') {
  for (const name of preflight) assert.ok(summary.commands.some(row => row.phase === 'preflight' && row.command === name && row.result === 'PASS'), `PREFLIGHT_REQUIRED:${name}`)
  await guard()
  await writeFile(join(evidence, 'source-stabilization.json'), JSON.stringify({ state: 'STABLE_FOR_CONTROLLED_COMPOSITION', at: new Date().toISOString(), source: await source() }, null, 2) + '\n', 'utf8')
  await execute('controlled-composition', ['scripts/step3-final-composition.mjs', '--freeze'])
  await verifyFrozen()
} else {
  const commands = phase === 'preflight' && !selected ? preflight : [selected]
  for (const command of commands) {
    assert.ok((phase === 'preflight' ? preflight : final).includes(command))
    const args = command === 'focused' ? ['--test', 'apps/desktop/dist-tests/tests/user-loop-evidence.test.js', 'apps/desktop/dist-tests/tests/transport.test.js', 'apps/desktop/tests/full-shaco-boundaries.test.mjs', 'scripts/step3-interaction.test.mjs', 'scripts/step3-fixture-boundaries.test.mjs', 'scripts/user-loop-policy.test.mjs'] : [pnpm, ...(command === 'test' ? ['test'] : ['run', command])]
    await execute(command, args)
  }
}
