import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { paths } from './runtime-paths.mjs'
import { evidence, evidenceRoot } from './step2-evidence.mjs'

assert.equal(process.version, 'v22.19.0')
const command = process.argv[2]
assert.ok(['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions'].includes(command))
const pnpm = process.env.SHACO_FORGE_PNPM_ENTRY
assert.equal(execFileSync(process.execPath, [pnpm, '--version'], { encoding: 'utf8' }).trim(), '11.7.0')
const env = { ...process.env, SHACO_FORGE_WORKER_NODE: process.execPath }
env.SHACO_FORGE_GIT = execFileSync('where.exe', ['git.exe'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0]
for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
env.PATH = `${dirname(process.execPath)};${join(env.ProgramFiles, 'dotnet')};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
for (const key of ['SHACO_FORGE_USER_LOOP', 'ELECTRON_RUN_AS_NODE', 'SHACO_FORGE_EVIDENCE_PATH', 'SHACO_FORGE_EVIDENCE_INJECT_CARRIER_FAILURE']) delete env[key]
env.SHACO_FORGE_STEP1_EVIDENCE_ROOT = join(paths.root, 'node_modules/.step2-validation/step1')
const startedAt = new Date().toISOString()
const child = spawn(process.execPath, [pnpm, ...(command === 'test' ? ['test'] : ['run', command])], { cwd: paths.root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString(); process.stdout.write(chunk) })
const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve) })
await mkdir(join(paths.root, 'node_modules/.step2-validation'), { recursive: true })
await writeFile(join(paths.root, 'node_modules/.step2-validation', `${command.replaceAll(':', '-')}.log`), output, 'utf8')
const summary = await readFile(join(evidenceRoot, 'test-summary.json'), 'utf8').then(JSON.parse).catch(() => ({ commands: [], correctiveHistory: [] }))
summary.commands.push({ command: command === 'test' ? 'pnpm test' : `pnpm run ${command}`, startedAt, endedAt: new Date().toISOString(), exitCode, result: exitCode === 0 ? 'PASS' : 'FAIL' })
await evidence('test-summary.json', summary)
process.exitCode = exitCode ?? 1
