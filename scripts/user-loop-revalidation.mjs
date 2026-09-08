// A single, byte-bound Owner exception. This never sends a business request.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { open, readFile, rename } from 'node:fs/promises'
import { join } from 'node:path'

export const AUTHORITY_ID = 'V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-20260908-01'
export const DECISION_PATH = 'docs/04-development-records/V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-OWNER-DECISION.md'
export const DECISION_SHA256 = 'aa286888e7e8479481cbae3de71e1217cdfa1572a90bb2757dd439f87a5ad6bc'
export const RUNTIME_ROOT = 'docs/04-development-records/evidence/V1-SLICE-1C/runtime'
export const FIRST_RUN = '54e248ff-305c-4fa3-bcab-a616872a0a3f'
export const PRODUCT_HEAD = '2dcc47ff6ca393a4334cc6d7135d8c0b38f2f854'
export const HARNESS_HEAD = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
const digest = value => createHash('sha256').update(value).digest('hex')
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
const isRun = value => typeof value === 'string' && /^[a-f0-9-]{36}$/.test(value)
export const REQUIRED_CHECKS = ['typecheck', 'build', 'affected-tests', 'full-units', 'smoke-carrier', 'smoke-worker', 'smoke-electron', 'smoke-failure', 'session-setup-only', 'verify-static', 'verify-theme', 'verify-hygiene', 'git-diff-check']

export function assertCorrectiveEligibility(budget, proof) {
  const first = budget.attempts?.[0]
  assert.equal(budget.attempts?.length, 1, 'CORRECTIVE_REQUIRES_ONE_CONSUMED_ATTEMPT')
  assert.equal(proof?.authorityId, AUTHORITY_ID, 'OWNER_DECISION_ID_INVALID')
  assert.equal(proof.decisionSha256, DECISION_SHA256, 'OWNER_DECISION_BYTES_INVALID')
  assert.equal(first.number, 1)
  assert.equal(first.runId, FIRST_RUN)
  assert.equal(first.outcome, 'SHACO_IMPLEMENTATION_FAILURE', 'CORRECTIVE_FAILURE_CLASS_INELIGIBLE')
  assert.equal(first.diagnosticCorrection?.reason, 'SAME_CONTEXT_FOLLOW_OBSERVATION_CAPTURE_FAILED')
  assert.equal(digest(JSON.stringify(first)), proof.attempt1RecordSha256, 'ATTEMPT_1_HISTORY_CHANGED')
  for (const key of ['attempt1Submitted', 'postmortemReadSucceeded', 'postmortemMarkerMatch', 'postmortemTurnCompleted', 'observerCorrective', 'affectedTestsPassed', 'fullUnitsPassed', 'zeroPromptFollowBound', 'frozenClean', 'frozenDocumentsUnchanged', 'noStaging', 'noResidualProcesses']) assert.equal(proof[key], true, `CORRECTIVE_PREFLIGHT_REQUIRED:${key}`)
  assert.equal(proof.attempt1GateResult, 'NOT_PROVEN')
  assert.equal(proof.attempt1FailureClass, 'EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE')
  assert.equal(budget.correctiveRevalidation?.attempt2AuthorizationConsumed ?? false, false, 'OWNER_AUTHORITY_ALREADY_CONSUMED')
  assert.equal(proof.attempt2AuthorizationConsumed, false, 'OWNER_AUTHORITY_ALREADY_CONSUMED')
}

export function assertNewCorrectiveIdentities(budget, proof, identity, requestHash) {
  assertCorrectiveEligibility(budget, proof)
  assert.ok(isRun(identity.runId) && identity.runId !== FIRST_RUN, 'NEW_RUN_REQUIRED')
  for (const key of ['workspaceHash', 'workspacePathHash', 'markerSha256', 'sessionHash']) {
    assert.ok(isHash(identity[key]), `NEW_IDENTITY_REQUIRED:${key}`)
    assert.notEqual(identity[key], proof.firstIdentities[key], `NEW_IDENTITY_REQUIRED:${key}`)
  }
  if (requestHash !== undefined) {
    assert.ok(isHash(requestHash), 'NEW_REQUEST_REQUIRED')
    assert.notEqual(requestHash, budget.attempts[0].requestHash, 'NEW_REQUEST_REQUIRED')
  }
}

export async function readExistingBudget(path) {
  // Missing state is an error, including on process restart. Never initialize it.
  const bytes = await readFile(path)
  const budget = JSON.parse(bytes.toString('utf8'))
  assert.ok(Array.isArray(budget.attempts), 'INVALID_PROVIDER_LEDGER')
  return { bytes, budget }
}

async function writeOnceDurable(path, bytes) {
  const file = await open(path, 'wx')
  try { await file.writeFile(bytes); await file.sync() } finally { await file.close() }
}

export async function replaceBudgetDurably(path, expectedBytes, budget) {
  assert.equal(digest(await readFile(path)), digest(expectedBytes), 'PROVIDER_LEDGER_CHANGED')
  const temporary = `${path}.pending`
  await writeOnceDurable(temporary, `${JSON.stringify(budget, null, 2)}\n`)
  await rename(temporary, path)
}

export async function reserveCorrective(path, proof, identity) {
  const { bytes, budget } = await readExistingBudget(path)
  assertNewCorrectiveIdentities(budget, proof, identity)
  const authority = budget.correctiveRevalidation
  assert.equal(authority?.ownerRevalidationAuthorityId, AUTHORITY_ID)
  assert.equal(authority?.decisionSha256, DECISION_SHA256)
  const reservation = { number: 2, outcome: 'SUBMITTING', reservationId: `${AUTHORITY_ID}:ATTEMPT_2`, timestamp: Date.now(), ...identity }
  // Fixed exclusive claim survives a crash even if replacing the ledger fails.
  // Never delete or reconcile this second-attempt claim into another submission.
  await writeOnceDurable(`${path}.attempt2-claim.json`, `${JSON.stringify({ authorityId: AUTHORITY_ID, reservation }, null, 2)}\n`)
  budget.correctiveRevalidation = { ...authority, attempt2AuthorizationConsumed: true, state: 'RESERVED', reservationId: reservation.reservationId, runId: identity.runId }
  budget.attempts.push(reservation)
  await replaceBudgetDurably(path, bytes, budget)
  return reservation
}

export async function recordCorrectiveOutcome(path, identity, changes) {
  const { bytes, budget } = await readExistingBudget(path)
  assert.equal(budget.attempts.length, 2)
  assert.equal(budget.attempts[1].runId, identity.runId)
  assert.equal(budget.correctiveRevalidation.attempt2AuthorizationConsumed, true)
  budget.attempts[1] = { ...budget.attempts[1], ...changes }
  budget.correctiveRevalidation.state = changes.promptEmitted ? 'CONSUMED' : budget.correctiveRevalidation.state
  await replaceBudgetDurably(path, bytes, budget)
}

export async function readOwnerHistory(projectRoot) {
  const base = join(projectRoot, RUNTIME_ROOT)
  const decision = await readFile(join(projectRoot, DECISION_PATH))
  assert.equal(digest(decision), DECISION_SHA256, 'OWNER_DECISION_BYTES_INVALID')
  assert.ok(decision.toString('utf8').includes(`Decision ID: ${AUTHORITY_ID}`))
  const originalBytes = await readFile(join(base, 'attempt1-ledger-before-owner-revalidation.json'))
  assert.equal(digest(originalBytes), 'dbc0b325f30d85695201a6d6629693d20e2387d7236a0d9e81cd5b39b867fecc')
  const original = JSON.parse(originalBytes.toString('utf8'))
  const files = [[`${FIRST_RUN}.json`, '314fb7e3b983e26b54ca7288605a8205bc1e004a0fe8f79d11d3252c55093e25'], [`${FIRST_RUN}-summary.json`, '83d9c57b98dac66b050d43eda5fd51c64ce343c5e52bf3ea4c72dbc6dbc72d35'], ['54e248ff-postmortem.json', '4dbd21b60351e03390bac391b09f978d2e92e9daf2abcfeaa1a0473114950be5']]
  const values = []
  for (const [name, hash] of files) { const b = await readFile(join(base, name)); assert.equal(digest(b), hash, `ATTEMPT_1_ARTIFACT_CHANGED:${name}`); values.push(JSON.parse(b.toString('utf8'))) }
  const [runtime, summary, postmortem] = values
  const first = original.attempts[0]
  const prompt = runtime.userLoop.observation.prompts
  assert.equal(prompt.length, 1)
  assert.equal(prompt[0].accepted, true)
  assert.equal(prompt[0].sessionHash, first.sessionHash)
  assert.equal(prompt[0].requestHash, first.requestHash)
  assert.equal(postmortem.runId, FIRST_RUN)
  assert.equal(postmortem.sessionHash, first.sessionHash)
  assert.equal(postmortem.liveEvidenceResult, 'NOT_PROVEN')
  assert.equal(postmortem.toolCalls.length, 1)
  assert.equal(postmortem.toolCalls[0].name, 'read')
  assert.equal(postmortem.toolResults[0].callHash, postmortem.toolCalls[0].callHash)
  assert.equal(postmortem.toolResults[0].isError, false)
  assert.equal(postmortem.toolResults[0].markerMatch, true)
  assert.equal(postmortem.finalAssistantMarkerMatch, true)
  assert.equal(postmortem.turnEndReason, 'completed')
  return { original, decisionBytes: decision.length, firstIdentities: { workspaceHash: runtime.userLoop.picker.workspaceHash, workspacePathHash: summary.workspaceHash, markerSha256: summary.expectedMarkerSha256, sessionHash: first.sessionHash } }
}

export async function verifyBaseline(projectRoot, harnessRoot) {
  const git = (root, args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true }).trim()
  assert.equal(git(projectRoot, ['rev-parse', 'HEAD']), PRODUCT_HEAD)
  assert.equal(git(projectRoot, ['branch', '--show-current']), 'master')
  assert.equal(git(projectRoot, ['diff', '--cached', '--name-only']), '')
  assert.equal(git(harnessRoot, ['rev-parse', 'HEAD']), HARNESS_HEAD)
  assert.equal(git(harnessRoot, ['status', '--porcelain']), '')
  const baseline = JSON.parse(await readFile(join(projectRoot, RUNTIME_ROOT, 'revalidation-authority-baseline.json'), 'utf8'))
  const decision = await readFile(join(projectRoot, DECISION_PATH), 'utf8')
  for (const row of baseline.frozenBytes) { assert.ok(decision.includes(row.sha256)); assert.equal(digest(await readFile(join(projectRoot, row.path))), row.sha256, 'FROZEN_DOCUMENT_BYTES_CHANGED') }
  const status = git(projectRoot, ['status', '--porcelain'])
  assert.ok(!status.split('\n').some(line => /lock\.yaml|lock\.json|pnpm-lock/.test(line)), 'LOCKFILE_CHANGED')
}

export function assertNoProductProcesses(projectRoot) {
  // Filter entry points, not generic workspace text (Codex tooling may name it).
  const escaped = projectRoot.replaceAll("'", "''")
  const script = `$ErrorActionPreference='Stop'; $taskRoot='${escaped}'; $taskRows=@(Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'ShacoForge.NativeCarrier.exe' -and $_.ExecutablePath.StartsWith($taskRoot,[System.StringComparison]::OrdinalIgnoreCase)) -or ($_.CommandLine -match 'apps[\\/]worker[\\/]dist[\\/]index\\.js|scripts[\\/]electron-user-loop\\.mjs|apps[\\/]desktop[\\/]dist[\\/]main[\\/]main\\.js|--profile[ =]+shaco-forge-v1-slice-1b' -and $_.Name -match '^(node|electron)\\.exe$') }); ConvertTo-Json -Compress -InputObject @($taskRows | ForEach-Object { $_.ProcessId })`
  const rows = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true }).trim())
  assert.equal(rows.length, 0, 'RESIDUAL_PRODUCT_PROCESS')
}

export async function implementationFingerprint(projectRoot) {
  const names = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: projectRoot, encoding: 'utf8', windowsHide: true }).split('\0').filter(name => name && !name.startsWith('docs/'))
  const rows = []
  for (const path of [...new Set(names)].sort()) rows.push([path, digest(await readFile(join(projectRoot, path)))])
  return digest(JSON.stringify(rows))
}

export function verifySessionOnly(runtime, summary, expectedBudgetHash, actualBudgetHash) {
  assert.equal(summary.result, 'SESSION_SETUP_PROVEN')
  assert.equal(summary.sessionSetupOnly, true)
  assert.equal(summary.electronExitCode, 0)
  assert.equal(summary.providerBudgetUnchanged, true)
  assert.equal(expectedBudgetHash, actualBudgetHash, 'ZERO_PROMPT_BUDGET_CHANGED')
  assert.equal(runtime.nonProviderResult, 'PASS')
  const loop = runtime.userLoop
  assert.equal(loop.result, 'SESSION_SETUP_PROVEN')
  for (const key of ['directTestRpcCount', 'secondAppWebEntryCount', 'secondClientCount', 'secondRemoteCount']) assert.equal(loop[key], 0)
  for (const key of ['accepted', 'composerUiReady', 'controlledWorkspaceAssociated', 'sameContextFollowBound']) assert.equal(loop.session[key], true)
  assert.ok(loop.observation.followStreams.some(row => row.sessionHash === loop.session.sessionHash))
  assert.equal(loop.observation.prompts.length, 0)
  for (const key of ['observerErrors', 'droppedMetadata', 'pendingHashes']) assert.equal(loop.observation[key], 0)
  assert.equal(runtime.cleanup.exited, true)
  assert.equal(summary.residualProductPids.length, 0)
  assert.equal(summary.controlledWorkspaceRemoved, true)
}

export async function loadCorrectiveProof(projectRoot, harnessRoot) {
  await verifyBaseline(projectRoot, harnessRoot)
  assertNoProductProcesses(projectRoot)
  const history = await readOwnerHistory(projectRoot)
  const base = join(projectRoot, RUNTIME_ROOT)
  const { budget } = await readExistingBudget(join(base, 'provider-budget.json'))
  assert.deepEqual(budget.attempts[0], history.original.attempts[0], 'ATTEMPT_1_HISTORY_CHANGED')
  const certificate = JSON.parse(await readFile(join(base, 'corrective-preflight.json'), 'utf8'))
  assert.equal(certificate.authorityId, AUTHORITY_ID)
  assert.equal(certificate.result, 'PASS')
  assert.equal(certificate.implementationFingerprint, await implementationFingerprint(projectRoot), 'PREFLIGHT_SOURCE_CHANGED')
  assert.deepEqual(certificate.checks.map(row => row.name), REQUIRED_CHECKS)
  for (const row of certificate.checks) { assert.equal(row.exitCode, 0); assert.ok(/^[a-f0-9-]{36}-[a-z-]+\.log$/.test(row.log)); assert.equal(digest(await readFile(join(base, row.log))), row.sha256) }
  assert.ok(isRun(certificate.sessionRunId))
  const summary = JSON.parse(await readFile(join(base, `${certificate.sessionRunId}-summary.json`), 'utf8'))
  const runtime = JSON.parse(await readFile(join(base, `${certificate.sessionRunId}.json`), 'utf8'))
  verifySessionOnly(runtime, summary, certificate.budgetHashBeforeSession, certificate.budgetHashAfterSession)
  const proof = { authorityId: AUTHORITY_ID, decisionSha256: DECISION_SHA256, attempt1RecordSha256: digest(JSON.stringify(history.original.attempts[0])), firstIdentities: history.firstIdentities,
    attempt1Submitted: true, postmortemReadSucceeded: true, postmortemMarkerMatch: true, postmortemTurnCompleted: true,
    attempt1GateResult: 'NOT_PROVEN', attempt1FailureClass: 'EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE',
    observerCorrective: true, affectedTestsPassed: true, fullUnitsPassed: true, zeroPromptFollowBound: true,
    frozenClean: true, frozenDocumentsUnchanged: true, noStaging: true, noResidualProcesses: true, attempt2AuthorizationConsumed: false }
  assertCorrectiveEligibility(budget, proof)
  return proof
}
