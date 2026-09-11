// Local non-Provider corrective verification only; no smoke or composition entry.
import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import assert from 'node:assert/strict'

assert.equal(process.version, 'v22.19.0')
const command = process.argv[2]
const pnpm = process.env.SHACO_FORGE_PNPM_ENTRY
assert.ok(pnpm)
const commands = {
  'focused-compile': ['node_modules/typescript/bin/tsc', '-p', 'apps/desktop/tsconfig.test.json'],
  focused: ['--test', 'apps/desktop/dist-tests/tests/user-loop-evidence.test.js', 'apps/desktop/dist-tests/tests/transport.test.js', 'apps/desktop/tests/full-shaco-boundaries.test.mjs', 'apps/desktop/tests/presentation-actions.test.mjs', 'scripts/step3-interaction.test.mjs', 'scripts/step3-fixture-boundaries.test.mjs', 'scripts/user-loop-policy.test.mjs'],
}
for (const name of ['typecheck', 'build', 'test', 'verify:static', 'test:full-shaco']) commands[name] = [pnpm, ...(name === 'test' ? ['test'] : ['run', name])]
assert.ok(Object.hasOwn(commands, command))
const args = commands[command]
const env = { ...process.env }
assert.ok(env.SHACO_FORGE_HARNESS_ROOT)
for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
env.PATH = `${dirname(process.execPath)};${join(env.ProgramFiles, 'dotnet')};${join(env.SystemRoot, 'System32')};${env.SystemRoot}`
env.PATHEXT = '.COM;.EXE;.BAT;.CMD'
env.SHACO_FORGE_WORKER_NODE = process.execPath
for (const key of ['ELECTRON_RUN_AS_NODE', 'SHACO_FORGE_USER_LOOP', 'SHACO_FORGE_STEP3_LIFECYCLE_PROOF', 'SHACO_FORGE_FULL_SHACO_FINAL', 'SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT']) delete env[key]
const summaryPath = join(import.meta.dirname, 'focused-tests.json')
const summary = await readFile(summaryPath, 'utf8').then(JSON.parse).catch(() => ({ commands: [] }))
const attempt = summary.commands.filter(row => row.command === command).length + 1
const startedAt = new Date().toISOString()
const child = spawn(process.execPath, args, { cwd: process.cwd(), env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) { stream.setEncoding('utf8'); stream.on('data', chunk => { output += chunk; process.stdout.write(chunk) }) }
const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve) })
const log = `logs/${command.replaceAll(':', '-')}-${attempt}.log`
await writeFile(join(import.meta.dirname, log), output, 'utf8')
summary.commands.push({ command, exactCommand: commands[command][0] === pnpm ? `pnpm ${command === 'test' ? 'test' : `run ${command}`}` : `node ${args.join(' ')}`, attempt, phase: 'FOCUSED_CORRECTIVE', executable: process.execPath, args, startedAt, endedAt: new Date().toISOString(), exitCode, result: exitCode === 0 ? 'PASS' : 'FAIL', log })
await writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8')
process.exitCode = exitCode ?? 1
