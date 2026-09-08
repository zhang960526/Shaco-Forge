import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomUUID, createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { paths } from './runtime-paths.mjs'
import { AUTHORITY_ID, RUNTIME_ROOT, REQUIRED_CHECKS, readOwnerHistory, readExistingBudget, verifyBaseline, assertNoProductProcesses, implementationFingerprint, verifySessionOnly } from './user-loop-revalidation.mjs'

assert.equal(process.version, 'v22.19.0')
const root = join(paths.root, RUNTIME_ROOT)
const runId = randomUUID()
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const certificate = { authorityId: AUTHORITY_ID, runId, result: 'NOT_PROVEN', checks: [] }
const history = await readOwnerHistory(paths.root)
const { budget } = await readExistingBudget(join(root, 'provider-budget.json'))
assert.equal(budget.attempts.length, 1, 'PREFLIGHT_REQUIRES_ONE_REMAINING_ATTEMPT')
assert.deepEqual(budget.attempts[0], history.original.attempts[0])
assert.equal(budget.correctiveRevalidation?.attempt2AuthorizationConsumed ?? false, false)
await verifyBaseline(paths.root, process.env.SHACO_FORGE_HARNESS_ROOT)
assertNoProductProcesses(paths.root)
const unitArgs = JSON.parse(await readFile(join(paths.root, 'package.json'), 'utf8')).scripts.test.split(' && node ')[1].split(' ')
const commands = [
  ['typecheck', ['scripts/typecheck.mjs']],
  ['build', ['scripts/build.mjs']],
  ['affected-tests', ['--test', '--test-reporter=spec', 'apps/desktop/dist-tests/tests/user-loop-evidence.test.js', 'scripts/user-loop-policy.test.mjs']],
  ['full-units', [unitArgs[0], '--test-reporter=spec', ...unitArgs.slice(1)]],
  ['smoke-carrier', ['scripts/smoke-carrier.mjs']],
  ['smoke-worker', ['scripts/smoke-worker.mjs']],
  ['smoke-electron', ['scripts/smoke-electron.mjs']],
  ['smoke-failure', ['scripts/smoke-electron.mjs', '--inject-carrier-failure']],
  ['session-setup-only', ['scripts/smoke-user-loop.mjs', '--session-setup-only']],
  ['verify-static', ['scripts/verify-static.mjs']],
  ['verify-theme', ['scripts/verify-theme.mjs']],
  ['verify-hygiene', ['scripts/verify-user-loop-hygiene.mjs']],
  ['git-diff-check', ['diff', '--check'], 'git'],
]
assert.deepEqual(commands.map(row => row[0]), REQUIRED_CHECKS)
try {
  for (const [name, args, executable = process.execPath] of commands) {
    process.stdout.write(`START ${name}\n`)
    if (name === 'session-setup-only') certificate.budgetHashBeforeSession = hash(await readFile(join(root, 'provider-budget.json')))
    const result = spawnSync(executable, args, { cwd: paths.root, env: process.env, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024, timeout: 600_000 })
    const bytes = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}`)
    const log = `${runId}-${name}.log`
    await writeFile(join(root, log), bytes, { flag: 'wx' })
    const row = { name, executable, args, exitCode: result.status, log, sha256: hash(bytes), outputBytes: bytes.length }
    if (name.endsWith('tests') || name === 'full-units') row.testCount = Number(result.stdout?.match(/tests (\d+)/)?.[1] ?? 0)
    certificate.checks.push(row)
    process.stdout.write(`${JSON.stringify(row)}\n`)
    assert.equal(result.status, 0, `PREFLIGHT_FAILED:${name}; see ${log}`)
    if (name === 'session-setup-only') {
      certificate.budgetHashAfterSession = hash(await readFile(join(root, 'provider-budget.json')))
      const summary = JSON.parse(await readFile(join(root, 'latest-summary.json'), 'utf8'))
      const runtime = JSON.parse(await readFile(join(root, `${summary.runId}.json`), 'utf8'))
      verifySessionOnly(runtime, summary, certificate.budgetHashBeforeSession, certificate.budgetHashAfterSession)
      certificate.sessionRunId = summary.runId
    }
  }
  await verifyBaseline(paths.root, process.env.SHACO_FORGE_HARNESS_ROOT)
  assertNoProductProcesses(paths.root)
  assert.deepEqual((await readExistingBudget(join(root, 'provider-budget.json'))).budget, budget)
  certificate.implementationFingerprint = await implementationFingerprint(paths.root)
  certificate.result = 'PASS'
} finally {
  await writeFile(join(root, `${runId}-preflight.json`), `${JSON.stringify(certificate, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
  await writeFile(join(root, 'corrective-preflight.json'), `${JSON.stringify(certificate, null, 2)}\n`, 'utf8')
  process.stdout.write(`${JSON.stringify({ result: certificate.result, runId, checks: certificate.checks.length })}\n`)
}
