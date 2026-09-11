// Bounded non-Provider test runner. Each invocation preserves its own log.
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import assert from 'node:assert/strict'

assert.equal(process.version, 'v22.19.0')
const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260911-FULL-SHACO-DUAL-THEME-01')
const command = process.argv[2]
const scripts = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).scripts
const focused = command === 'focused-bootstrap'
assert.ok(focused || Object.hasOwn(scripts, command), 'Only existing scripts or the focused bootstrap test are allowed')
const pnpm = process.env.SHACO_FORGE_PNPM_ENTRY
assert.ok(pnpm)
const env = { ...process.env, SHACO_FORGE_HARNESS_ROOT: 'D:/Project/Shaco-Forge-Upstream/deepseek-harness', SHACO_FORGE_WORKER_NODE: process.execPath }
const pathKeys = Object.keys(env).filter(key => key.toLowerCase() === 'path')
for (const key of pathKeys) delete env[key]
env.PATH = `${dirname(process.execPath)};${join(env.ProgramFiles, 'dotnet')};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
delete env.ELECTRON_RUN_AS_NODE
const args = focused ? ['--test', 'apps/desktop/tests/presentation-lifecycle.test.mjs'] : [pnpm, ...(command === 'test' ? ['test'] : ['run', command])]
const startedAt = new Date().toISOString()
const summaryPath = join(evidence, 'test-summary.json')
const summary = await readFile(summaryPath, 'utf8').then(JSON.parse).catch(() => ({ commands: [] }))
const attempt = summary.commands.filter(row => row.command === command).length + 1
env.SHACO_FORGE_STEP1_EVIDENCE_ROOT = join(evidence, 'runs', `${command.replaceAll(':', '-')}-${attempt}`, 'step1')
env.SHACO_FORGE_STEP2_EVIDENCE_ROOT = join(evidence, 'runs', `${command.replaceAll(':', '-')}-${attempt}`, 'step2')
env.SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT = evidence
// A caller-supplied evidence root must exist before Electron writes its first PNG.
await mkdir(env.SHACO_FORGE_STEP1_EVIDENCE_ROOT, { recursive: true })
await mkdir(env.SHACO_FORGE_STEP2_EVIDENCE_ROOT, { recursive: true })
const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString(); process.stdout.write(chunk) })
const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve) })
await mkdir(join(evidence, 'logs'), { recursive: true })
const log = `logs/${command.replaceAll(':', '-')}-${attempt}.log`
await writeFile(join(evidence, log), output, 'utf8')
summary.commands.push({ command, phase: process.env.SHACO_FORGE_FULL_SHACO_FINAL === '1' ? 'FINAL_REGRESSION' : 'DEVELOPMENT', exactCommand: focused ? `node --test ${args.at(-1)}` : `pnpm ${command === 'test' ? 'test' : `run ${command}`}`, executable: process.execPath, args, attempt, startedAt, endedAt: new Date().toISOString(), exitCode, result: exitCode === 0 ? 'PASS' : 'FAIL', log })
await writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8')
process.exitCode = exitCode ?? 1
