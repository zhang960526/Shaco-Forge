import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { assertNewCorrectiveIdentities } from './user-loop-revalidation.mjs'

export const MAX_ATTEMPTS = 2
export const sha256 = value => createHash('sha256').update(value).digest('hex')

export function reconcileUnsubmittedReservation(budget, runtime, summary, evidenceSha256) {
  const row = budget.attempts?.[0]
  const loop = runtime.userLoop
  const observation = loop?.observation
  const metrics = runtime.carrier?.metrics
  const eligible = budget.attempts?.length === 1 && row?.number === 1 && row.outcome === 'SUBMITTING'
    && loop?.result === 'SHACO_IMPLEMENTATION_FAILURE' && loop.phase === 'TOOL_ATTEMPT_1'
    && loop.boundary === 'UI_GATE_TIMEOUT:TOOL_ATTEMPT_1'
    && loop.actions?.some(action => action.kind === 'DOM_TYPE' && action.phase === 'TOOL_ATTEMPT_1' && action.timestamp === (row.inputTimestamp ?? row.timestamp))
    && observation?.prompts?.length === 0 && observation.events?.length === 0
    && observation.observerErrors === 0 && observation.droppedMetadata === 0 && observation.pendingHashes === 0
    && loop.transport?.fetchEndpoints?.length > 0 && !loop.transport.fetchEndpoints.includes('session/prompt')
    && runtime.nonProviderResult === 'PASS' && runtime.failureTruthfulness?.finalProjectionPhase === 'carrier-ready'
    && runtime.cleanup?.exited === true && metrics?.finalActiveStreams === 0 && metrics.finalPendingUnary === 0
    && summary.electronExitCode === 0 && summary.residualProductPids?.length === 0
    && summary.controlledWorkspaceRemoved === true && summary.integrity?.fileListUnchanged === true && summary.integrity.proofUnchanged === true
    && summary.providerAttempts?.length === 1 && summary.providerAttempts[0].timestamp === row.timestamp
    && /^[a-f0-9]{64}$/.test(evidenceSha256)
  if (!eligible) throw new Error('UNSUBMITTED_RESERVATION_NOT_PROVEN')
  // Retain the original reservation and failed runtime. Reuse its number only
  // after a closed, healthy transport proves no prompt request ever crossed it.
  row.reservationHistory = [...(row.reservationHistory ?? []), { number: row.number, outcome: row.outcome, timestamp: row.timestamp, inputTimestamp: row.inputTimestamp, runId: summary.runId, evidenceSha256, disposition: 'NOT_SUBMITTED_UI_FAILURE' }]
  row.outcome = 'NOT_SUBMITTED_UI_FAILURE'
  return budget
}

export function findControlledWorkspace(evidence, pathHash) {
  return evidence.workspaces.find(row => row.accepted === true && row.pathHash === pathHash && typeof row.workspaceHash === 'string' && /^[a-f0-9]{64}$/.test(row.workspaceHash))
}

export function classifySessionCreation(session) {
  if (session.accepted === true) return 'PASS'
  if (session.errorCode === 'agent-preset-invalid') {
    const reason = String(session.presetReasonSummary)
    if (reason.includes('@deepseek-ai/dsh-tool-subagent/model-selection-settings')) return 'STANDARD_PRESET_SETTINGS_COMPOSITION_INEFFECTIVE'
    if (session.presetFailureKind === 'MISSING_HOST_SERVICES' || /requires @deepseek-ai\/|Cannot find (package|module)|module not found/i.test(reason)) return 'STANDARD_PRESET_ADDITIONAL_COMPOSITION_REQUIRED'
  }
  return ['HUMAN_REQUIRED_PROVIDER_CREDENTIAL', 'HARNESS_PROVIDER_CONFIGURATION_BLOCKED', 'HARNESS_PROVIDER_OR_NETWORK_FAILURE'].includes(session.failure)
    ? session.failure : 'SHACO_IMPLEMENTATION_FAILURE'
}

export function multiAgentObservation(evidence) {
  const names = evidence.events.filter(row => row.type === 'tool/call').map(row => row.toolName ?? '')
  const forbidden = /(^|[/:_.-])(subagent|subagent_fork|spawn_agent|fork_agent|send_message|interrupt_agent|list_agents)([/:_.-]|$)/i
  return {
    subagentCalls: names.filter(name => name === 'subagent').length,
    subagentForkCalls: names.filter(name => name === 'subagent_fork').length,
    forbiddenCalls: names.filter(name => !/(^|[/:.])list_subagent_models$/.test(name) && forbidden.test(name)).length,
    listSubagentModelsCalls: names.filter(name => name === 'list_subagent_models').length,
    childAgentSpawnsObserved: evidence.childAgentSpawnsObserved ?? 0,
  }
}

export class ToolProofAttempts {
  constructor(initialAttempts = []) { this.attempts = structuredClone(initialAttempts) }
  begin(sessionHash, requestHash) {
    if (this.attempts.length >= MAX_ATTEMPTS || (this.attempts.length && this.attempts.at(-1).outcome !== 'MODEL_TOOL_SELECTION_NOT_OBSERVED')) throw new Error('TOOL_PROOF_ATTEMPT_NOT_ALLOWED')
    if (!sessionHash || !requestHash || this.attempts.some(row => row.sessionHash === sessionHash || row.requestHash === requestHash)) throw new Error('NEW_SESSION_AND_REQUEST_REQUIRED')
    const row = { number: this.attempts.length + 1, sessionHash, requestHash, outcome: 'RUNNING' }
    this.attempts.push(row)
    return row
  }
  beginCorrective(sessionHash, requestHash, proof, identity) {
    assertNewCorrectiveIdentities({ attempts: this.attempts }, proof, { ...identity, sessionHash }, requestHash)
    const row = { number: 2, sessionHash, requestHash, outcome: 'RUNNING', purpose: 'CORRECTIVE_EVIDENCE_REVALIDATION' }
    this.attempts.push(row)
    return row
  }
  finish(outcome) {
    const row = this.attempts.at(-1)
    if (!row || row.outcome !== 'RUNNING') throw new Error('NO_RUNNING_ATTEMPT')
    row.outcome = outcome === 'MODEL_TOOL_SELECTION_NOT_OBSERVED' && row.number === 2 ? 'INCONCLUSIVE_MODEL_BEHAVIOR' : outcome
    return row.outcome
  }
}

export function assessAttempt(evidence, sessionHash, renderedMarkerMatch, carrierHealthy) {
  const events = evidence.events.filter(row => row.sessionHash === sessionHash)
  const calls = events.filter(row => row.type === 'tool/call')
  const multiAgent = multiAgentObservation(evidence)
  if (multiAgent.forbiddenCalls || multiAgent.childAgentSpawnsObserved) return 'UNAUTHORIZED_SUBAGENT_TOOL_OBSERVED'
  if (calls.some(row => /(^|[/:_.-])(write|edit|str_replace|apply_patch)([/:_.-]|$)/i.test(row.toolName ?? ''))) return 'UNAUTHORIZED_MUTATING_TOOL_OBSERVED'
  if (!carrierHealthy || evidence.orderViolations || evidence.duplicateTerminals || evidence.observerErrors || evidence.droppedMetadata || evidence.maxActiveTurns > 1) return 'SHACO_IMPLEMENTATION_FAILURE'
  if (evidence.pendingHashes) return 'TURN_NOT_FINISHED'
  const end = events.find(row => row.type === 'turn/end')
  if (end?.failure) return end.failure
  if (!end) return 'TURN_NOT_FINISHED'
  if (!end.completed) return 'HARNESS_TURN_NOT_COMPLETED'
  const results = events.filter(row => row.type === 'tool/result')
  if (results.some(row => row.isError)) return 'TOOL_EXECUTION_FAILED'
  const prompt = evidence.prompts.find(row => row.sessionHash === sessionHash && row.accepted)
  if (!prompt || !events.some(row => row.type === 'turn/start') || !events.some(row => row.type === 'assistant/chunk') || !events.some(row => row.type === 'assistant/message')) return 'STREAMING_NOT_PROVEN'
  if (calls.length === 0) return 'MODEL_TOOL_SELECTION_NOT_OBSERVED'
  // The pinned standard preset exposes read; this belongs to the validation
  // gate, never to Product routing or Agent tool selection.
  const read = calls.find(row => row.toolName === 'read')
  const result = results.find(row => row.callHash === read?.callHash && row.resultShapeValid && row.isError === false && row.markerMatch)
  const final = events.filter(row => row.type === 'assistant/message').at(-1)
  const ordered = read && result && final && Number(read.sourceSequence) < Number(result.sourceSequence) && Number(result.sourceSequence) < Number(final.sourceSequence) && Number(final.sourceSequence) < Number(end.sourceSequence)
  if (!prompt || !events.some(row => row.type === 'turn/start') || !events.some(row => row.type === 'assistant/chunk') || !ordered || !final?.markerMatch || !renderedMarkerMatch) return 'TOOL_PROOF_NOT_PROVEN'
  if (evidence.interactions.some(row => row.settlements !== 1 || row.accepted !== true)) return 'HUMAN_REQUIRED_INTERACTION'
  return 'PASS'
}

export async function snapshotWorkspace(root) {
  const files = []
  async function visit(relative = '') {
    for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
      const name = relative ? `${relative}/${entry.name}` : entry.name
      if (entry.isSymbolicLink()) throw new Error('CONTROLLED_WORKSPACE_LINK_OBSERVED')
      if (entry.isDirectory()) { files.push(`${name}/`); await visit(name) }
      else files.push(name)
    }
  }
  await visit()
  const bytes = await readFile(join(root, 'proof.txt'))
  return { files: files.sort(), proofBytes: bytes.length, proofSha256: sha256(bytes) }
}

export function compareWorkspace(before, after) {
  return { fileListUnchanged: JSON.stringify(before.files) === JSON.stringify(after.files), proofUnchanged: before.proofBytes === after.proofBytes && before.proofSha256 === after.proofSha256 }
}
