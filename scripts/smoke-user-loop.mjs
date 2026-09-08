import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { isAbsolute, join, resolve, sep } from 'node:path'
import electron from 'electron'
import { paths } from './runtime-paths.mjs'
import { snapshotWorkspace, compareWorkspace, reconcileUnsubmittedReservation, sha256 } from './user-loop-policy.mjs'
import { AUTHORITY_ID, DECISION_SHA256, loadCorrectiveProof, readExistingBudget, readOwnerHistory, replaceBudgetDurably } from './user-loop-revalidation.mjs'

assert.equal(process.version, 'v22.19.0')
const sessionSetupOnly = process.argv.includes('--session-setup-only')
const correctiveRevalidation = process.argv.includes('--owner-corrective-revalidation')
assert.ok(!(sessionSetupOnly && correctiveRevalidation), 'Choose one validation mode')
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
assert.ok(harnessRoot)
const git = args => execFileSync('git', ['-C', harnessRoot, ...args], { encoding: 'utf8', windowsHide: true }).trim()
assert.equal(git(['rev-parse', 'HEAD']), 'cd5ef8148158c3a752a658978873241fdf8e2bbc')
assert.equal(git(['status', '--porcelain']), '')
const root = join(paths.root, 'docs/04-development-records/evidence/V1-SLICE-1C/runtime')
await mkdir(root, { recursive: true })
const budgetPath = join(root, 'provider-budget.json')
const { budget: existingBudget } = await readExistingBudget(budgetPath)
const originalBudgetBytes = await readFile(budgetPath)
const immutableHistory = await readOwnerHistory(paths.root)
assert.deepEqual(existingBudget.attempts[0], immutableHistory.original.attempts[0], 'ATTEMPT_1_HISTORY_CHANGED_OR_LEDGER_RESET')
if (correctiveRevalidation) {
  try { await access(`${budgetPath}.attempt2-claim.json`); throw new Error('OWNER_AUTHORITY_ALREADY_CLAIMED') } catch (error) { if (error.code !== 'ENOENT') throw error }
}
let correctiveProof
if (correctiveRevalidation) {
  correctiveProof = await loadCorrectiveProof(paths.root, harnessRoot)
  assert.ok(!existingBudget.correctiveRevalidation?.attempt2AuthorizationConsumed)
  existingBudget.correctiveRevalidation = { ownerRevalidationAuthorityId: AUTHORITY_ID, decisionSha256: DECISION_SHA256,
    attempt1OriginalOutcome: existingBudget.attempts[0].outcome, attempt1GateResult: 'NOT_PROVEN',
    attempt1FailureClass: 'EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE', attempt1PostmortemVerified: true,
    attempt2Authorization: 'CORRECTIVE_EVIDENCE_REVALIDATION', attempt2AuthorizationConsumed: false, state: 'ELIGIBLE' }
  await replaceBudgetDurably(budgetPath, originalBudgetBytes, existingBudget)
}
if (existingBudget.attempts.length !== 0 && !sessionSetupOnly && !correctiveRevalidation) {
  const reusable = existingBudget.attempts.length === 1 && existingBudget.attempts[0].outcome === 'NOT_SUBMITTED_UI_FAILURE'
  const audit = reusable ? existingBudget.attempts[0].reservationHistory?.at(-1) : undefined
  if (reusable) assert.match(audit?.runId ?? '', /^[a-f0-9-]{36}$/)
  const summaryBytes = await readFile(join(root, reusable ? `${audit.runId}-summary.json` : 'latest-summary.json'))
  const previousSummary = JSON.parse(summaryBytes.toString('utf8'))
  const previousPath = resolve(previousSummary.runtimeEvidencePath)
  assert.ok(previousPath.startsWith(`${resolve(root)}${sep}`))
  const previousBytes = await readFile(previousPath)
  const previousRuntime = JSON.parse(previousBytes.toString('utf8'))
  for (const pid of Object.values(previousRuntime.topology ?? {}).filter(value => Number.isInteger(value) && value > 0)) {
    try { process.kill(pid, 0); throw new Error('PRIOR_RUNTIME_PROCESS_STILL_EXISTS') } catch (error) { if (error.code !== 'ESRCH') throw error }
  }
  if (reusable) {
    assert.equal(sha256(previousBytes), audit.evidenceSha256)
    reconcileUnsubmittedReservation({ attempts: [{ ...audit, outcome: 'SUBMITTING' }] }, previousRuntime, previousSummary, audit.evidenceSha256)
  } else {
    reconcileUnsubmittedReservation(existingBudget, previousRuntime, previousSummary, sha256(previousBytes))
    await writeFile(join(root, `${previousSummary.runId}-summary.json`), summaryBytes, { flag: 'wx' }).catch(async error => {
      if (error.code !== 'EEXIST') throw error
      assert.equal(sha256(await readFile(join(root, `${previousSummary.runId}-summary.json`))), sha256(summaryBytes))
    })
    await writeFile(budgetPath, `${JSON.stringify(existingBudget, null, 2)}\n`, 'utf8')
  }
}
const runId = randomUUID()
const homeInput = process.env.SHACO_FORGE_DSH_HOME ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
assert.ok(isAbsolute(homeInput), 'Harness home must be an absolute input path')
const dshHome = resolve(homeInput)
const evidencePath = join(root, `${runId}.json`)
// The real Harness owns these files. Never read, copy, inject or print credentials.
const materialized = [join(dshHome, 'profiles/shaco-forge-v1-slice-1b'), join(dshHome, 'runtime-overlay')]
for (const path of materialized) {
  try { await access(path); throw new Error('EXISTING_HARNESS_RUNTIME_OUTPUT_REQUIRES_EXPLICIT_REUSE') } catch (error) { if (error.code !== 'ENOENT') throw error }
}
const workspace = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-slice-1c-'))
const profile = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-1c-electron-'))
await writeFile(join(workspace, 'proof.txt'), randomBytes(16).toString('hex'), 'utf8')
const before = await snapshotWorkspace(workspace)
if (correctiveProof) {
  assert.notEqual(sha256(workspace), correctiveProof.firstIdentities.workspacePathHash)
  assert.notEqual(before.proofSha256, correctiveProof.firstIdentities.markerSha256)
  await writeFile(join(root, `${runId}-authorization.json`), `${JSON.stringify({ proof: correctiveProof, runId, workspacePathHash: sha256(workspace), markerSha256: before.proofSha256 }, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
}
let child
let summary
let stderrBytes = 0
try {
  child = spawn(electron, [`--user-data-dir=${profile}`, join(paths.root, 'scripts/electron-user-loop.mjs')], {
    env: { ...process.env, SHACO_FORGE_WORKER_NODE: process.execPath, SHACO_FORGE_WORKER_ENTRY: paths.workerEntry,
      SHACO_FORGE_NATIVE_HELPER: paths.nativeHelper, SHACO_FORGE_HARNESS_ROOT: harnessRoot, SHACO_FORGE_DSH_HOME: dshHome,
      SHACO_FORGE_HARNESS_PROFILE_NAME: 'shaco-forge-v1-slice-1b', SHACO_FORGE_EVIDENCE_PATH: evidencePath,
      SHACO_FORGE_USER_LOOP: '1', SHACO_FORGE_PROOF_WORKSPACE: workspace, SHACO_FORGE_PROVIDER_BUDGET: budgetPath,
      SHACO_FORGE_USER_LOOP_RUN_ID: runId,
      SHACO_FORGE_SESSION_SETUP_ONLY: sessionSetupOnly ? '1' : '0',
      SHACO_FORGE_CORRECTIVE_REVALIDATION: correctiveRevalidation ? '1' : '0',
      SHACO_FORGE_SCREENSHOT_PATH: '', SHACO_FORGE_EVIDENCE_INJECT_CARRIER_FAILURE: '0' },
    stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true,
  })
  child.stderr.on('data', chunk => { stderrBytes += chunk.length })
  const exitCode = await new Promise((resolveExit, reject) => {
    const timer = setTimeout(() => reject(new Error('USER_LOOP_PROCESS_TIMEOUT')), 480_000)
    child.once('error', reject)
    child.once('exit', code => { clearTimeout(timer); resolveExit(code) })
  })
    const runtime = JSON.parse(await readFile(evidencePath, 'utf8'))
  const pids = Object.values(runtime.topology ?? {}).filter(value => Number.isInteger(value) && value > 0)
  const alive = pid => { try { process.kill(pid, 0); return true } catch (error) { if (error.code === 'ESRCH') return false; throw error } }
  const cleanupDeadline = Date.now() + 5000
  while (pids.some(alive) && Date.now() < cleanupDeadline) await new Promise(resolveDelay => setTimeout(resolveDelay, 100))
  const residualProductPids = pids.filter(alive)
  const after = await snapshotWorkspace(workspace)
  const integrity = compareWorkspace(before, after)
  summary = { runId, result: runtime.userLoop?.result ?? 'SHACO_IMPLEMENTATION_FAILURE', electronExitCode: exitCode,
    sessionSetupOnly,
    runtimeEvidencePath: evidencePath, workspaceHash: sha256(workspace), before, after, integrity, stderrBytes,
    expectedMarkerSha256: before.proofSha256, residualProductPids, providerAttempts: JSON.parse(await readFile(budgetPath, 'utf8')).attempts,
    realUserLoop: runtime.userLoop?.result === 'PASS' ? 'PASS' : 'NOT_PROVEN' }
  if (runtime.nonProviderResult !== 'PASS' || !integrity.fileListUnchanged || !integrity.proofUnchanged) summary.result = 'SHACO_IMPLEMENTATION_FAILURE'
  const metrics = runtime.carrier?.metrics
  if (!metrics || metrics.creditViolations || metrics.duplicateStreamTerminals || metrics.itemsAfterTerminal || metrics.maxQueueDepth > 4 || metrics.maxRendererInflightPullPerStream > 1 || residualProductPids.length) summary.result = 'SHACO_IMPLEMENTATION_FAILURE'
  if (metrics?.maxObservedJsonFrameBytes > 262144) summary.result = 'CARRIER_CONTRACT_AMENDMENT_REQUIRED'
  if (sessionSetupOnly) {
    assert.equal(runtime.userLoop?.observation?.prompts?.length, 0, 'Session-only validation must never submit a Prompt')
    assert.equal(sha256(await readFile(budgetPath)), sha256(originalBudgetBytes), 'Session-only validation must preserve the exact budget bytes')
    summary.providerBudgetUnchanged = true
  }
  if (summary.result !== 'PASS') summary.realUserLoop = 'NOT_PROVEN'
  if (correctiveRevalidation) {
    summary.ownerRevalidationAuthorityId = AUTHORITY_ID
    summary.decisionSha256 = DECISION_SHA256
    summary.attempt3Allowed = false
    const history = await readOwnerHistory(paths.root)
    assert.deepEqual(summary.providerAttempts[0], history.original.attempts[0], 'ATTEMPT_1_HISTORY_CHANGED')
    assert.ok(summary.providerAttempts.length <= 2)
    summary.attempt1HistoryPreserved = true
  }
  assert.equal(runtime.desktop.electronVersion, '35.7.5')
} finally {
  if (child && child.exitCode === null && child.signalCode === null) {
    execFileSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
  }
  // Only run-created exact directories; never recursively remove the Harness home.
  for (const path of [workspace, profile, ...materialized]) {
    const absolute = resolve(path)
    const parent = materialized.includes(path) ? dshHome : resolve(tmpdir())
    assert.ok(absolute.startsWith(`${parent}${sep}`) && absolute !== parent)
    await rm(absolute, { recursive: true, force: true })
  }
  if (summary) {
    summary.controlledWorkspaceRemoved = true
    await writeFile(join(root, `${runId}-summary.json`), `${JSON.stringify(summary, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    await writeFile(join(root, 'latest-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  }
  assert.equal(git(['status', '--porcelain']), '')
}
process.exitCode = summary?.result === 'PASS' || (sessionSetupOnly && summary?.result === 'SESSION_SETUP_PROVEN') ? 0 : 2
