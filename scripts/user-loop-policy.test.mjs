import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ToolProofAttempts, assessAttempt, snapshotWorkspace, compareWorkspace, findControlledWorkspace, classifySessionCreation, multiAgentObservation, reconcileUnsubmittedReservation, sha256 } from './user-loop-policy.mjs'
import { materializeHarnessProfile } from '../apps/worker/dist/profile.js'
import { AUTHORITY_ID, DECISION_SHA256, FIRST_RUN, assertCorrectiveEligibility, assertNewCorrectiveIdentities, readExistingBudget, reserveCorrective, recordCorrectiveOutcome, verifySessionOnly } from './user-loop-revalidation.mjs'

function correctiveFixture() {
  const first = { number: 1, outcome: 'SHACO_IMPLEMENTATION_FAILURE', runId: FIRST_RUN, sessionHash: sha256('first-session'), requestHash: sha256('first-request'), reportedOutcome: 'HARNESS_PROVIDER_OR_NETWORK_FAILURE', reservationHistory: [{ outcome: 'SUBMITTING', disposition: 'NOT_SUBMITTED_UI_FAILURE' }], diagnosticCorrection: { reason: 'SAME_CONTEXT_FOLLOW_OBSERVATION_CAPTURE_FAILED', retryAuthorized: false } }
  const budget = { attempts: [first], correctiveRevalidation: { ownerRevalidationAuthorityId: AUTHORITY_ID, decisionSha256: DECISION_SHA256, attempt2AuthorizationConsumed: false } }
  const proof = { authorityId: AUTHORITY_ID, decisionSha256: DECISION_SHA256, attempt1RecordSha256: sha256(JSON.stringify(first)), attempt1Submitted: true, postmortemReadSucceeded: true, postmortemMarkerMatch: true, postmortemTurnCompleted: true, attempt1GateResult: 'NOT_PROVEN', attempt1FailureClass: 'EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE', observerCorrective: true, affectedTestsPassed: true, fullUnitsPassed: true, zeroPromptFollowBound: true, frozenClean: true, frozenDocumentsUnchanged: true, noStaging: true, noResidualProcesses: true, attempt2AuthorizationConsumed: false,
    firstIdentities: { workspaceHash: sha256('old-workspace'), workspacePathHash: sha256('old-path'), markerSha256: sha256('old-marker'), sessionHash: first.sessionHash } }
  const identity = { runId: '11111111-2222-4333-8444-555555555555', workspaceHash: sha256('new-workspace'), workspacePathHash: sha256('new-path'), markerSha256: sha256('new-marker'), sessionHash: sha256('new-session') }
  return { budget, proof, identity, requestHash: sha256('new-request') }
}

test('Owner exception admits exactly the second capture revalidation without modifying first history', () => {
  const { budget, proof, identity, requestHash } = correctiveFixture()
  const original = JSON.stringify(budget.attempts[0])
  const attempts = new ToolProofAttempts(budget.attempts)
  assert.throws(() => attempts.begin(identity.sessionHash, requestHash), /NOT_ALLOWED/)
  assert.equal(attempts.beginCorrective(identity.sessionHash, requestHash, proof, identity).number, 2)
  assert.equal(attempts.finish('PASS'), 'PASS')
  assert.equal(JSON.stringify(attempts.attempts[0]), original)
  assert.equal(JSON.stringify(budget.attempts[0]), original)
  assert.throws(() => attempts.begin('s3', 'r3'), /NOT_ALLOWED/)
  assert.throws(() => attempts.beginCorrective(sha256('s3'), sha256('r3'), proof, identity))
})

test('corrective route rejects missing, invalid or consumed Owner authority and every missing prerequisite', () => {
  const { budget, proof } = correctiveFixture()
  for (const change of [undefined, { ...proof, authorityId: 'different' }, { ...proof, decisionSha256: sha256('different') }, { ...proof, attempt2AuthorizationConsumed: true }, { ...proof, attempt1GateResult: 'PASS' }, { ...proof, attempt1FailureClass: 'ordinary failure' }]) assert.throws(() => assertCorrectiveEligibility(budget, change))
  for (const key of ['attempt1Submitted', 'postmortemReadSucceeded', 'postmortemMarkerMatch', 'postmortemTurnCompleted', 'observerCorrective', 'affectedTestsPassed', 'fullUnitsPassed', 'zeroPromptFollowBound', 'frozenClean', 'frozenDocumentsUnchanged', 'noStaging', 'noResidualProcesses']) assert.throws(() => assertCorrectiveEligibility(budget, { ...proof, [key]: false }))
  budget.correctiveRevalidation.attempt2AuthorizationConsumed = true
  assert.throws(() => assertCorrectiveEligibility(budget, proof), /ALREADY_CONSUMED/)
})

test('Owner exception cannot authorize Provider, Tool, mutating, subagent, ordinary failure or normal-retry outcomes', () => {
  for (const outcome of ['HARNESS_PROVIDER_OR_NETWORK_FAILURE', 'HARNESS_PROVIDER_CONFIGURATION_BLOCKED', 'TOOL_EXECUTION_FAILED', 'UNAUTHORIZED_MUTATING_TOOL_OBSERVED', 'UNAUTHORIZED_SUBAGENT_TOOL_OBSERVED', 'MODEL_TOOL_SELECTION_NOT_OBSERVED', 'PASS']) {
    const { budget, proof } = correctiveFixture()
    budget.attempts[0].outcome = outcome
    proof.attempt1RecordSha256 = sha256(JSON.stringify(budget.attempts[0]))
    assert.throws(() => assertCorrectiveEligibility(budget, proof), /INELIGIBLE/)
  }
  const { budget, proof } = correctiveFixture()
  budget.attempts[0].diagnosticCorrection.reason = 'ORDINARY_IMPLEMENTATION_FAILURE'
  assert.throws(() => assertCorrectiveEligibility(budget, proof))
})

test('corrective route requires new run, Workspace, path, marker, Session and request identities', () => {
  const { budget, proof, identity, requestHash } = correctiveFixture()
  assertNewCorrectiveIdentities(budget, proof, identity, requestHash)
  for (const key of ['workspaceHash', 'workspacePathHash', 'markerSha256', 'sessionHash']) {
    assert.throws(() => assertNewCorrectiveIdentities(budget, proof, { ...identity, [key]: proof.firstIdentities[key] }, requestHash))
    assert.throws(() => assertNewCorrectiveIdentities(budget, proof, { ...identity, [key]: undefined }, requestHash))
  }
  assert.throws(() => assertNewCorrectiveIdentities(budget, proof, { ...identity, runId: FIRST_RUN }, requestHash))
  assert.throws(() => assertNewCorrectiveIdentities(budget, proof, identity, budget.attempts[0].requestHash))
})

test('durable exclusive reservation survives restart, cannot be reused, and leaves Attempt 1 byte-equivalent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'shaco-forge-1c-ledger-unit-'))
  const path = join(root, 'provider-budget.json')
  try {
    await assert.rejects(readExistingBudget(path), { code: 'ENOENT' })
    const { budget, proof, identity, requestHash } = correctiveFixture()
    const original = JSON.stringify(budget.attempts[0])
    await writeFile(path, JSON.stringify(budget), 'utf8')
    const reservation = await reserveCorrective(path, proof, identity)
    assert.equal(reservation.number, 2)
    const reserved = (await readExistingBudget(path)).budget
    assert.equal(reserved.correctiveRevalidation.state, 'RESERVED')
    assert.equal(reserved.correctiveRevalidation.attempt2AuthorizationConsumed, true)
    assert.equal(JSON.stringify(reserved.attempts[0]), original)
    await assert.rejects(reserveCorrective(path, proof, identity))
    await recordCorrectiveOutcome(path, identity, { promptEmitted: true, promptAccepted: true, requestHash, outcome: 'PASS' })
    const restarted = (await readExistingBudget(path)).budget
    assert.equal(restarted.correctiveRevalidation.state, 'CONSUMED')
    assert.equal(JSON.stringify(restarted.attempts[0]), original)
    assert.throws(() => new ToolProofAttempts(restarted.attempts).begin('s3', 'r3'))
    // Simulate a corrupt reset only in this isolated fixture. The durable claim
    // must still prevent a new process from issuing another second submission.
    await writeFile(path, JSON.stringify(budget), 'utf8')
    await assert.rejects(reserveCorrective(path, proof, identity), { code: 'EEXIST' })
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('a failed rejected Prompt still consumes the one-time authority', async () => {
  const root = await mkdtemp(join(tmpdir(), 'shaco-forge-1c-rejected-unit-'))
  const path = join(root, 'provider-budget.json')
  try {
    const { budget, proof, identity, requestHash } = correctiveFixture()
    await writeFile(path, JSON.stringify(budget), 'utf8')
    await reserveCorrective(path, proof, identity)
    await recordCorrectiveOutcome(path, identity, { promptEmitted: true, promptAccepted: false, requestHash, outcome: 'HARNESS_PROVIDER_OR_NETWORK_FAILURE' })
    assert.equal((await readExistingBudget(path)).budget.correctiveRevalidation.state, 'CONSUMED')
    await assert.rejects(reserveCorrective(path, proof, identity))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('zero-Prompt preflight fails closed for budget changes, missing real follow binding or any Prompt', () => {
  const runtime = { nonProviderResult: 'PASS', cleanup: { exited: true }, userLoop: { result: 'SESSION_SETUP_PROVEN', directTestRpcCount: 0, secondAppWebEntryCount: 0, secondClientCount: 0, secondRemoteCount: 0, session: { accepted: true, composerUiReady: true, controlledWorkspaceAssociated: true, sameContextFollowBound: true, sessionHash: 's' }, observation: { followStreams: [{ sessionHash: 's' }], prompts: [], observerErrors: 0, droppedMetadata: 0, pendingHashes: 0 } } }
  const summary = { result: 'SESSION_SETUP_PROVEN', sessionSetupOnly: true, electronExitCode: 0, providerBudgetUnchanged: true, residualProductPids: [], controlledWorkspaceRemoved: true }
  verifySessionOnly(runtime, summary, 'hash', 'hash')
  assert.throws(() => verifySessionOnly(runtime, summary, 'before', 'after'))
  runtime.userLoop.observation.prompts.push({ accepted: false })
  assert.throws(() => verifySessionOnly(runtime, summary, 'hash', 'hash'))
  runtime.userLoop.observation.prompts = []
  runtime.userLoop.observation.followStreams = []
  assert.throws(() => verifySessionOnly(runtime, summary, 'hash', 'hash'))
})

test('live gate waits for pending evidence hashes instead of asserting a premature PASS', () => {
  const evidence = observedLoop()
  evidence.pendingHashes = 1
  assert.equal(assessAttempt(evidence, 's', true, true), 'TURN_NOT_FINISHED')
})

test('actual generated Host profile includes one approved settings entry before standard presets without configuration overrides', async () => {
  const root = await mkdtemp(join(tmpdir(), 'shaco-forge-1c-profile-unit-'))
  try {
    const scope = join(root, 'scope')
    const overlay = join(root, 'overlay')
    await mkdir(scope); await mkdir(overlay)
    const modulePath = join(root, 'observation-module.mjs')
    await writeFile(modulePath, 'export default {}\n', 'utf8')
    await writeFile(join(root, 'provider-execution-guard.mjs'), 'export {}\n', 'utf8')
    await writeFile(join(root, 'upgrade-drain.mjs'), 'export {}\n', 'utf8')
    const profile = await materializeHarnessProfile(root, 'test-profile', modulePath, modulePath, modulePath, modulePath, scope, overlay)
    const patch = await readFile(join(profile, 'node_modules/@shaco-forge/harness-bootstrap/cordis.patch.yml'), 'utf8')
    assert.equal(patch.match(/id: subagent-model-selection-settings\b/g)?.length, 1)
    assert.equal(patch.match(/@deepseek-ai\/dsh-tool-subagent\/model-selection-settings/g)?.length, 1)
    assert.match(patch, /id: api-remotes[\s\S]*id: subagent-model-selection-settings\n      name: '@deepseek-ai\/dsh-tool-subagent\/model-selection-settings'\n\n    - id: agent-presets/)
    assert.deepEqual(patch.match(/@deepseek-ai\/dsh-host-directory-picker-[a-z-]+/g), ['@deepseek-ai/dsh-host-directory-picker-browse'])
    assert.doesNotMatch(patch, /allowedModels|enabled:|\/src\//)
    assert.match(patch, /default: standard\n/)
    const manifest = JSON.parse(await readFile(join(profile, 'package.json'), 'utf8'))
    assert.deepEqual(manifest.dependencies, { '@shaco-forge/harness-bootstrap': '1.0.0-dev.1' })
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Session creation distinguishes ineffective settings, another missing composition, Provider failure and Product failure', () => {
  assert.equal(classifySessionCreation({ accepted: true }), 'PASS')
  assert.equal(classifySessionCreation({ errorCode: 'agent-preset-invalid', presetReasonSummary: 'requires @deepseek-ai/dsh-tool-subagent/model-selection-settings in Host' }), 'STANDARD_PRESET_SETTINGS_COMPOSITION_INEFFECTIVE')
  assert.equal(classifySessionCreation({ errorCode: 'agent-preset-invalid', presetReasonSummary: 'requires @deepseek-ai/example in Host' }), 'STANDARD_PRESET_ADDITIONAL_COMPOSITION_REQUIRED')
  assert.equal(classifySessionCreation({ failure: 'HUMAN_REQUIRED_PROVIDER_CREDENTIAL' }), 'HUMAN_REQUIRED_PROVIDER_CREDENTIAL')
  assert.equal(classifySessionCreation({ errorCode: 'agent-preset-invalid', presetReasonSummary: 'invalid ordinary config' }), 'SHACO_IMPLEMENTATION_FAILURE')
})

test('unsubmitted UI reservation keeps its original number and audit; any prompt or incomplete evidence prevents reuse', () => {
  const reservation = { number: 1, outcome: 'SUBMITTING', timestamp: 123 }
  const runtime = {
    nonProviderResult: 'PASS', cleanup: { exited: true }, failureTruthfulness: { finalProjectionPhase: 'carrier-ready' },
    carrier: { metrics: { finalActiveStreams: 0, finalPendingUnary: 0 } },
    userLoop: { result: 'SHACO_IMPLEMENTATION_FAILURE', phase: 'TOOL_ATTEMPT_1', boundary: 'UI_GATE_TIMEOUT:TOOL_ATTEMPT_1',
      actions: [{ kind: 'DOM_TYPE', phase: 'TOOL_ATTEMPT_1', timestamp: 123 }],
      observation: { prompts: [], events: [], observerErrors: 0, droppedMetadata: 0, pendingHashes: 0 }, transport: { fetchEndpoints: ['workspace/create'] } },
  }
  const summary = { runId: 'unit', electronExitCode: 0, residualProductPids: [], controlledWorkspaceRemoved: true,
    integrity: { fileListUnchanged: true, proofUnchanged: true }, providerAttempts: [{ ...reservation }] }
  const budget = { attempts: [{ ...reservation }] }
  reconcileUnsubmittedReservation(budget, runtime, summary, sha256('evidence'))
  assert.equal(budget.attempts.length, 1)
  assert.equal(budget.attempts[0].number, 1)
  assert.equal(budget.attempts[0].outcome, 'NOT_SUBMITTED_UI_FAILURE')
  assert.equal(budget.attempts[0].reservationHistory[0].timestamp, 123)
  assert.equal(budget.attempts[0].reservationHistory[0].outcome, 'SUBMITTING')
  for (const mutate of [
    value => value.userLoop.observation.prompts.push({ accepted: false }),
    value => value.userLoop.transport.fetchEndpoints.push('session/prompt'),
    value => value.userLoop.observation.events.push({ type: 'turn/start' }),
    value => { value.userLoop.observation.observerErrors = 1 },
    value => { value.cleanup.exited = false },
    value => { value.carrier.metrics.finalActiveStreams = 1 },
  ]) {
    const changed = structuredClone(runtime); mutate(changed)
    assert.throws(() => reconcileUnsubmittedReservation({ attempts: [{ ...reservation }] }, changed, summary, sha256('evidence')), /NOT_PROVEN/)
  }
  assert.throws(() => reconcileUnsubmittedReservation({ attempts: [{ ...reservation }, { number: 2 }] }, runtime, summary, sha256('evidence')), /NOT_PROVEN/)
})

async function compositionGuards(overrides = {}) {
  const source = await readFile('apps/desktop/scripts/prepare-harness-client.mjs', 'utf8')
  const lists = ['REQUIRED', 'SUPPORT'].map(name => source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\]`))[0]).join('\n')
  const functions = ['function assertPinnedClientGraph', 'async function loadPackage'].map(start => {
    const index = source.indexOf(start)
    assert.ok(index >= 0)
    return source.slice(index, source.indexOf('\n}\n', index) + 3)
  }).join('\n')
  // Execute the actual production guards in isolation, with no build or business requests.
  return runInNewContext(`${lists}\n${functions}\n({ REQUIRED, SUPPORT, assertPinnedClientGraph, loadPackage })`, {
    EXPECTED_VERSION: '0.1.2-alpha.1', REVISION: 'unit', packageIndex: new Map(), sha256,
    resolvePublicExport() { throw new Error('Missing public export') },
    readFile() { throw new Error('Missing built loader') }, ...overrides,
  })
}

test('picker Client graph requires exactly 28 unique explicit modules and rejects missing, duplicate or unknown entries', async () => {
  const guards = await compositionGuards()
  const rows = [...guards.REQUIRED, ...guards.SUPPORT].map(id => ({ id }))
  assert.equal(rows.length, 28)
  assert.equal(rows.filter(row => row.id === '@deepseek-ai/dsh-client-ui-directory-picker-browse').length, 1)
  guards.assertPinnedClientGraph(rows)
  assert.throws(() => guards.assertPinnedClientGraph(rows.slice(0, -1)), /failed closed/)
  assert.throws(() => guards.assertPinnedClientGraph([...rows.slice(0, -1), rows[0]]), /failed closed/)
  assert.throws(() => guards.assertPinnedClientGraph([...rows.slice(0, -1), { id: 'unknown' }]), /failed closed/)
  assert.throws(() => guards.assertPinnedClientGraph([...rows.slice(1), rows[0]]), /failed closed/)
  guards.REQUIRED[1] = guards.REQUIRED[0]
  assert.throws(() => guards.assertPinnedClientGraph(rows), /failed closed/)
})

test('production Client package loader retains exact identity, web declaration and public built-export checks', async () => {
  const id = '@deepseek-ai/dsh-client-ui-directory-picker-browse'
  const packageIndex = new Map()
  let bundle = Buffer.from('window.__ModuleLoader__.load()')
  const exportsSeen = []
  const guards = await compositionGuards({ packageIndex, resolvePublicExport(_index, specifier) { exportsSeen.push(specifier); return 'public-built-client' }, async readFile() { return bundle } })
  await assert.rejects(guards.loadPackage(id), /package is missing/)
  const manifest = { name: id, version: '0.1.2-alpha.1', dsh: { client: { platform: 'web' } } }
  packageIndex.set(id, { manifest })
  assert.equal((await guards.loadPackage(id)).id, id)
  assert.deepEqual(exportsSeen, [`${id}/client`])
  manifest.name = 'wrong'; await assert.rejects(guards.loadPackage(id), /identity mismatch/); manifest.name = id
  manifest.version = 'other'; await assert.rejects(guards.loadPackage(id), /identity mismatch/); manifest.version = '0.1.2-alpha.1'
  manifest.dsh.client.platform = 'native'; await assert.rejects(guards.loadPackage(id), /public web Client/); manifest.dsh.client.platform = 'web'
  bundle = Buffer.from('not a loader'); await assert.rejects(guards.loadPackage(id), /built loader registration/)
  const unavailable = await compositionGuards({ packageIndex })
  await assert.rejects(unavailable.loadPackage(id), /Missing public export/)
})

test('generated picker manifest preserves 28 public Harness modules plus one static observer and no native or auto picker', async () => {
  const manifest = JSON.parse(await readFile('apps/desktop/.generated-client/harness-client-manifest.json', 'utf8'))
  const frozen = manifest.graph.orderedIds.filter(id => id.startsWith('@deepseek-ai/'))
  assert.equal(frozen.length, 28)
  assert.equal(new Set(frozen).size, 28)
  assert.equal(manifest.graph.totalCount, 29)
  assert.equal(new Set(manifest.graph.orderedIds).size, 29)
  assert.equal(manifest.graph.orderedIds.at(-1), '@shaco-forge/desktop')
  assert.equal(manifest.artifacts.find(row => row.id === '@shaco-forge/desktop').publicExport, '@shaco-forge/desktop/client')
  const picker = manifest.artifacts.filter(row => row.id.includes('directory-picker'))
  assert.equal(picker.length, 1)
  assert.equal(picker[0].publicExport, '@deepseek-ai/dsh-client-ui-directory-picker-browse/client')
  assert.equal(manifest.productionDeepSourceImportIncluded, false)
  assert.equal(manifest.frozenHarness.commit, 'cd5ef8148158c3a752a658978873241fdf8e2bbc')
})

test('controlled workspace gate requires accepted creation, exact path hash and a returned identity', () => {
  const pathHash = sha256('controlled-path')
  const workspaceHash = sha256('workspace')
  const evidence = { workspaces: [
    { accepted: false, pathHash, workspaceHash },
    { accepted: true, pathHash: sha256('other-path'), workspaceHash },
    { accepted: true, pathHash },
  ] }
  assert.equal(findControlledWorkspace(evidence, pathHash), undefined)
  const correct = { accepted: true, pathHash, workspaceHash }
  evidence.workspaces.push(correct)
  assert.equal(findControlledWorkspace(evidence, pathHash), correct)
})

function observedLoop(tool = true) {
  const events = [
    { type: 'turn/start' }, { type: 'step/start' }, { type: 'assistant/chunk' },
    ...(tool ? [{ type: 'tool/call', toolName: 'read', callHash: 'call' }, { type: 'tool/result', callHash: 'call', isError: false, markerMatch: true, resultShapeValid: true }] : []),
    { type: 'assistant/message', markerMatch: true }, { type: 'step/end' }, { type: 'turn/end', completed: true },
  ].map((row, index) => ({ ...row, sessionHash: 's', sourceSequence: index + 1 }))
  return { events, prompts: [{ sessionHash: 's', accepted: true }], interactions: [], maxActiveTurns: 1, orderViolations: 0 }
}

test('PASS needs correlated real read/result/final and rendered marker plus all stream gates', () => {
  const evidence = observedLoop()
  assert.equal(assessAttempt(evidence, 's', true, true), 'PASS')
  assert.equal(assessAttempt(evidence, 's', false, true), 'TOOL_PROOF_NOT_PROVEN')
  assert.equal(assessAttempt(evidence, 's', true, false), 'SHACO_IMPLEMENTATION_FAILURE')
  evidence.events.find(row => row.type === 'tool/result').callHash = 'unrelated'
  assert.equal(assessAttempt(evidence, 's', true, true), 'TOOL_PROOF_NOT_PROVEN')
})

test('current public transport diagnostics do not require historical interaction telemetry', () => {
  const evidence = observedLoop()
  delete evidence.interactions
  assert.equal(assessAttempt(evidence, 's', true, true), 'PASS')
  // This is a Tool/stream proof only, not Approval/Question settlement proof.
  evidence.events.pop()
  assert.equal(assessAttempt(evidence, 's', true, true), 'TURN_NOT_FINISHED')
})

test('healthy no-tool retry requires accepted prompt and complete semantic stream', () => {
  const evidence = observedLoop(false)
  assert.equal(assessAttempt(evidence, 's', false, true), 'MODEL_TOOL_SELECTION_NOT_OBSERVED')
  evidence.prompts[0].accepted = false
  assert.equal(assessAttempt(evidence, 's', false, true), 'STREAMING_NOT_PROVEN')
})

test('real error, duplicate terminal, missing terminal and interaction duplicates never pass', () => {
  const evidence = observedLoop()
  evidence.events.find(row => row.type === 'tool/result').isError = true
  assert.equal(assessAttempt(evidence, 's', true, true), 'TOOL_EXECUTION_FAILED')
  evidence.events.find(row => row.type === 'tool/result').isError = false
  evidence.duplicateTerminals = 1
  assert.equal(assessAttempt(evidence, 's', true, true), 'SHACO_IMPLEMENTATION_FAILURE')
  evidence.duplicateTerminals = 0
  evidence.interactions.push({ settlements: 2, accepted: true })
  assert.equal(assessAttempt(evidence, 's', true, true), 'HUMAN_REQUIRED_INTERACTION')
  evidence.events.pop()
  assert.equal(assessAttempt(evidence, 's', true, true), 'TURN_NOT_FINISHED')
})

test('healthy no-tool first attempt permits exactly one new Session retry; no attempt three', () => {
  const attempts = new ToolProofAttempts()
  attempts.begin('s1', 'r1')
  assert.throws(() => attempts.begin('s2', 'r2'))
  assert.equal(attempts.finish('MODEL_TOOL_SELECTION_NOT_OBSERVED'), 'MODEL_TOOL_SELECTION_NOT_OBSERVED')
  assert.throws(() => attempts.begin('s1', 'r2'))
  attempts.begin('s2', 'r2')
  assert.equal(attempts.finish('MODEL_TOOL_SELECTION_NOT_OBSERVED'), 'INCONCLUSIVE_MODEL_BEHAVIOR')
  assert.throws(() => attempts.begin('s3', 'r3'))
  assert.equal(attempts.attempts.length, 2)
})

for (const outcome of ['PASS', 'TOOL_EXECUTION_FAILED', 'UNAUTHORIZED_MUTATING_TOOL_OBSERVED', 'UNAUTHORIZED_SUBAGENT_TOOL_OBSERVED', 'SHACO_IMPLEMENTATION_FAILURE', 'HARNESS_PROVIDER_OR_NETWORK_FAILURE']) test(`${outcome} never gains a retry`, () => {
  const attempts = new ToolProofAttempts()
  attempts.begin('s1', 'r1'); attempts.finish(outcome)
  assert.throws(() => attempts.begin('s2', 'r2'))
})

test('delegation or a child observation cannot be hidden by successful read proof; model listing alone is not read proof', () => {
  for (const toolName of ['subagent', 'subagent_fork', 'send_message', 'interrupt_agent', 'list_agents', 'spawn_agent', 'fork_agent', 'tools/subagent']) {
    const evidence = observedLoop()
    evidence.events.push({ type: 'tool/call', toolName, sessionHash: 's' })
    assert.equal(assessAttempt(evidence, 's', true, true), 'UNAUTHORIZED_SUBAGENT_TOOL_OBSERVED')
  }
  const evidence = observedLoop()
  evidence.childAgentSpawnsObserved = 1
  assert.equal(assessAttempt(evidence, 's', true, true), 'UNAUTHORIZED_SUBAGENT_TOOL_OBSERVED')
  delete evidence.childAgentSpawnsObserved
  evidence.events.find(row => row.type === 'tool/call').toolName = 'list_subagent_models'
  assert.equal(multiAgentObservation(evidence).forbiddenCalls, 0)
  assert.equal(assessAttempt(evidence, 's', true, true), 'TOOL_PROOF_NOT_PROVEN')
})

test('write/edit observation fails even when final text matches', () => {
  for (const toolName of ['write', 'edit', 'apply_patch', 'str_replace_editor']) {
    const evidence = { events: [{ sessionHash: 's', type: 'tool/call', toolName }] }
    assert.equal(assessAttempt(evidence, 's', true, true), 'UNAUTHORIZED_MUTATING_TOOL_OBSERVED')
  }
})

test('workspace integrity compares complete listing and proof bytes/hash', async () => {
  const root = await mkdtemp(join(tmpdir(), 'shaco-forge-v1-slice-1c-unit-'))
  try {
    await writeFile(join(root, 'proof.txt'), 'proof', 'utf8')
    const before = await snapshotWorkspace(root)
    assert.deepEqual(compareWorkspace(before, await snapshotWorkspace(root)), { fileListUnchanged: true, proofUnchanged: true })
    await writeFile(join(root, 'added.txt'), 'added', 'utf8')
    assert.equal(compareWorkspace(before, await snapshotWorkspace(root)).fileListUnchanged, false)
    await writeFile(join(root, 'proof.txt'), 'other', 'utf8')
    assert.equal(compareWorkspace(before, await snapshotWorkspace(root)).proofUnchanged, false)
  } finally { await rm(root, { recursive: true, force: true }) }
})
