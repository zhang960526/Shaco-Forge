// This driver uses the one Product window's DOM and its transport observations.
// It imports no Harness Client/Remote/Agent implementation.
import { app, ipcMain } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { ToolProofAttempts, assessAttempt, findControlledWorkspace, classifySessionCreation, multiAgentObservation, sha256 } from './user-loop-policy.mjs'
import { readExistingBudget, assertNewCorrectiveIdentities, reserveCorrective, recordCorrectiveOutcome, AUTHORITY_ID, DECISION_SHA256, RUNTIME_ROOT, DECISION_PATH } from './user-loop-revalidation.mjs'
import { paths } from './runtime-paths.mjs'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let attempts = new ToolProofAttempts()
const report = { result: 'NOT_PROVEN', phase: 'BOOT', actions: [], attempts: [], directTestRpcCount: 0, secondAppWebEntryCount: 0, secondClientCount: 0, secondRemoteCount: 0 }
let started = false

async function drive(window) {
  if (started) return
  started = true
  const wc = window.webContents
  const js = source => wc.executeJavaScript(source, true)
  const observe = () => js('JSON.parse(JSON.stringify(window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.userLoop.evidence))')
  async function waitFor(predicate, timeout = 15_000) {
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) { const value = await predicate(); if (value) return value; await delay(100) }
    throw new Error(`UI_GATE_TIMEOUT:${report.phase}`)
  }
  async function click(pattern, scope = '#harness-client-root') {
    const clicked = await js(`(() => {
      const scopes = Array.from(document.querySelectorAll(${JSON.stringify(scope)})).filter(el => el.getClientRects().length);
      const pattern = new RegExp(${JSON.stringify(pattern)}, 'i');
      const controls = scopes.flatMap(el => Array.from(el.querySelectorAll('button,[role="button"],[role="menuitem"],[role="tab"]')));
      const target = controls.find(el => el.getClientRects().length && !el.disabled && pattern.test(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent.trim()));
      if (!target) return false; target.focus(); target.click(); return true;
    })()`)
    if (clicked) report.actions.push({ kind: 'DOM_CLICK', selectorMeaning: pattern, timestamp: Date.now() })
    return clicked
  }
  async function type(selector, text) {
    wc.focus()
    const target = await js(`(() => { const input = Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(el => el.getClientRects().length && !el.disabled); if (!input) return false; input.scrollIntoView({ block: 'center' }); input.focus(); const r = input.getBoundingClientRect(); return { x: Math.round(r.left + Math.min(r.width / 2, 30)), y: Math.round(r.top + Math.min(r.height / 2, 10)) } })()`)
    if (!target) throw new Error(`UI_INPUT_UNAVAILABLE:${report.phase}`)
    wc.sendInputEvent({ type: 'mouseDown', button: 'left', clickCount: 1, ...target })
    wc.sendInputEvent({ type: 'mouseUp', button: 'left', clickCount: 1, ...target })
    // Dialog focus restoration and Lexical selection settle asynchronously.
    // Use ordinary DOM focus/selection, never an editor instance or React store.
    await delay(300)
    await js(`(() => {
      const input = Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(el => el.getClientRects().length && !el.disabled);
      input.focus();
      if (input.isContentEditable) {
        const range = document.createRange(); range.selectNodeContents(input);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      } else input.select();
    })()`)
    await waitFor(() => js(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).some(el => el === document.activeElement)`))
    await delay(100)
    await wc.insertText(text)
    // Let the controlled input's normal DOM input/change rendering settle before Enter.
    await delay(100)
    report.actions.push({ kind: 'DOM_TYPE', phase: report.phase, timestamp: Date.now() })
  }
  const enter = () => { wc.sendInputEvent({ type: 'keyDown', keyCode: 'Return' }); wc.sendInputEvent({ type: 'keyUp', keyCode: 'Return' }) }
  const usedBudget = async () => JSON.parse(await readFile(process.env.SHACO_FORGE_PROVIDER_BUDGET, 'utf8')).attempts.filter(row => row.outcome !== 'NOT_SUBMITTED_UI_FAILURE').length
  const corrective = process.env.SHACO_FORGE_CORRECTIVE_REVALIDATION === '1'
  let correctiveIdentity
  let correctiveReserved = false
  try {
    report.providerBudgetBefore = await usedBudget()
    await waitFor(() => js('Boolean(window.__SHACO_FORGE_TRANSPORT_EVIDENCE__?.eventsReady && document.querySelector("#harness-client-root")?.children.length)'))
    await delay(1500)
    report.phase = 'PROVIDER_READINESS'
    // Opening Harness Settings drives its own settings/credentials reads.
    await click('^(Settings|设置)$')
    await delay(500)
    await click('^(Models|模型)$', 'body')
    await waitFor(async () => (await observe()).provider.credentialReady !== undefined || await js('Boolean(Array.from(document.querySelectorAll("[role=dialog]")).find(el => /Add an API key to get started|添加一个 API Key 开始使用/.test(el.textContent)))'))
    report.observation = await observe()
    const missingDialog = await js('Boolean(Array.from(document.querySelectorAll("[role=dialog]")).find(el => /Add an API key to get started|添加一个 API Key 开始使用/.test(el.textContent)))')
    if (missingDialog || report.observation.provider.credentialReady === false) {
      report.result = 'HUMAN_REQUIRED_PROVIDER_CREDENTIAL'
      report.credentialReady = false
      return
    }
    report.credentialReady = report.observation.provider.credentialReady === true
    if (report.observation.provider.routable !== true) { report.result = 'HARNESS_PROVIDER_CONFIGURATION_BLOCKED'; return }
    await click('^(Close|关闭|Back|返回)$', 'body')
    report.phase = 'WORKSPACE_PICKER'
    await waitFor(() => click('^(Add workspace|添加工作区|Choose workspace|选择工作区)[.…]*$'))
    const browse = await waitFor(() => js('Boolean(Array.from(document.querySelectorAll("[role=dialog]")).find(el => /Select Workspace Directory|选择工作区目录/.test(el.textContent)))'), 5000).catch(() => false)
    if (!browse) {
      report.result = 'PICKER_RUNTIME_INTEGRATION_BLOCKED'
      report.boundary = 'AUTHORIZED_BROWSE_PICKER_UI_NOT_OBSERVED'
      return
    }
    report.picker = { browseDialogObserved: true, providerAttemptsBefore: await usedBudget() }
    await click('^(Edit path|编辑路径)$', 'body')
    await type('[role="dialog"] input:not([type="password"])', process.env.SHACO_FORGE_PROOF_WORKSPACE)
    report.picker.pathInputMatched = await js(`Array.from(document.querySelectorAll('[role="dialog"] input:not([type="password"])')).some(el => el.getClientRects().length && el.value === ${JSON.stringify(process.env.SHACO_FORGE_PROOF_WORKSPACE)})`)
    enter(); await delay(600)
    await waitFor(() => click('^(Open|打开)$', '[role="dialog"]'))
    const workspace = await waitFor(async () => findControlledWorkspace(await observe(), sha256(process.env.SHACO_FORGE_PROOF_WORKSPACE)))
    report.picker = { ...report.picker, workspaceCreateAccepted: workspace.accepted, workspaceHash: workspace.workspaceHash,
      controlledPathHashMatch: true, providerAttemptsAfter: await usedBudget() }
    report.phase = 'SESSION_SETUP'
    const session = await waitFor(async () => (await observe()).sessions.find(row => row.workspaceHash === workspace.workspaceHash && ((row.accepted && row.sessionHash) || row.errorCode)))
    report.session = session
    if (session.accepted !== true) {
      report.result = classifySessionCreation(session)
      report.boundary = report.result
      return
    }
    await waitFor(() => js(`(() => {
      const root = document.querySelector('#harness-client-root');
      const composer = root?.querySelector('[contenteditable="true"][role="textbox"]');
      const browse = Array.from(document.querySelectorAll('[role="dialog"]')).some(el => el.getClientRects().length && /Select Workspace Directory|选择工作区目录/.test(el.textContent));
      return !browse && Boolean(composer?.getClientRects().length) && root.innerText.includes(${JSON.stringify(basename(process.env.SHACO_FORGE_PROOF_WORKSPACE))});
    })()`))
    report.picker.workspaceUiAdvanced = true
    report.session.composerUiReady = true
    report.session.controlledWorkspaceAssociated = true
    await waitFor(async () => (await observe()).followStreams.some(row => row.sessionHash === session.sessionHash))
    report.session.sameContextFollowBound = true
    if (process.env.SHACO_FORGE_SESSION_SETUP_ONLY === '1') { report.result = 'SESSION_SETUP_PROVEN'; return }
    const marker = await readFile(join(process.env.SHACO_FORGE_PROOF_WORKSPACE, 'proof.txt'), 'utf8')
    let correctiveProof
    if (corrective) {
      const authorization = JSON.parse(await readFile(join(paths.root, RUNTIME_ROOT, `${process.env.SHACO_FORGE_USER_LOOP_RUN_ID}-authorization.json`), 'utf8'))
      if (sha256(await readFile(join(paths.root, DECISION_PATH))) !== DECISION_SHA256 || authorization.runId !== process.env.SHACO_FORGE_USER_LOOP_RUN_ID) throw new Error('OWNER_DECISION_IDENTITY_INVALID')
      correctiveProof = authorization.proof
      correctiveIdentity = { runId: authorization.runId, workspaceHash: workspace.workspaceHash, workspacePathHash: sha256(process.env.SHACO_FORGE_PROOF_WORKSPACE), markerSha256: sha256(marker), sessionHash: session.sessionHash }
      if (correctiveIdentity.workspacePathHash !== authorization.workspacePathHash || correctiveIdentity.markerSha256 !== authorization.markerSha256) throw new Error('AUTHORIZED_RUNTIME_IDENTITY_CHANGED')
      const { budget } = await readExistingBudget(process.env.SHACO_FORGE_PROVIDER_BUDGET)
      assertNewCorrectiveIdentities(budget, correctiveProof, correctiveIdentity)
      attempts = new ToolProofAttempts(budget.attempts)
      report.ownerRevalidationAuthorityId = AUTHORITY_ID
      report.correctiveIdentity = correctiveIdentity
    }
    await js(`window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.userLoop.configureMarker(${JSON.stringify(marker)})`)
    const prompt = 'Use the read-only read tool to read proof.txt in the current workspace. Return the exact marker from that file in your final response. Do not modify any files. Do not use write or edit tools. Do not delegate, spawn or fork an agent, or use subagent tools.'
    await delay(500)
    const firstAttempt = corrective ? 2 : 1
    for (let attempt = firstAttempt; attempt <= 2; attempt++) {
      report.phase = `TOOL_ATTEMPT_${attempt}`
      if (attempt > firstAttempt) await waitFor(() => click('^(New Session|新建会话|新会话|New chat|新对话)$'))
      const budget = JSON.parse(await readFile(process.env.SHACO_FORGE_PROVIDER_BUDGET, 'utf8'))
      const unsubmitted = attempt === 1 && budget.attempts.length === 1 && budget.attempts[0].outcome === 'NOT_SUBMITTED_UI_FAILURE' && budget.attempts[0].reservationHistory?.length > 0
      if (corrective) assertNewCorrectiveIdentities(budget, correctiveProof, correctiveIdentity)
      else if ((!unsubmitted && budget.attempts.length !== attempt - 1) || (attempt > 1 && budget.attempts[0].outcome !== 'MODEL_TOOL_SELECTION_NOT_OBSERVED')) throw new Error('PROVIDER_ATTEMPT_BUDGET_BLOCKED')
      const promptIndex = (await observe()).prompts.length
      await type('#harness-client-root [contenteditable="true"][role="textbox"]', prompt)
      report.composer = await waitFor(() => js(`(() => {
        const root = document.querySelector('#harness-client-root');
        const input = Array.from(root.querySelectorAll('[data-composer-input][contenteditable="true"]')).find(el => el.getClientRects().length);
        const send = Array.from(root.querySelectorAll('button')).find(el => el.getClientRects().length && /^(Send message|发送消息)$/i.test(el.getAttribute('aria-label') || ''));
        return input?.textContent === ${JSON.stringify(prompt)} && send && !send.disabled ? { draftMatched: true, sendEnabled: true, editorFocused: input === document.activeElement } : false;
      })()`))
      if (corrective) {
        report.reservation = await reserveCorrective(process.env.SHACO_FORGE_PROVIDER_BUDGET, correctiveProof, { ...correctiveIdentity, inputTimestamp: report.actions.at(-1).timestamp })
        correctiveReserved = true
      } else {
        const reservation = { number: attempt, outcome: 'SUBMITTING', timestamp: Date.now(), inputTimestamp: report.actions.at(-1).timestamp, runId: process.env.SHACO_FORGE_USER_LOOP_RUN_ID }
        if (unsubmitted) budget.attempts[0] = { ...budget.attempts[0], ...reservation }
        else budget.attempts.push(reservation)
        await writeFile(process.env.SHACO_FORGE_PROVIDER_BUDGET, `${JSON.stringify(budget, null, 2)}\n`, 'utf8')
      }
      if (!await click('^(Send message|发送消息)$')) throw new Error('COMPOSER_SUBMIT_CONTROL_UNAVAILABLE')
      const accepted = await waitFor(async () => {
        const observation = await observe()
        return observation.prompts[promptIndex]?.sessionHash && observation.prompts[promptIndex]?.requestHash ? observation.prompts[promptIndex] : false
      })
      if (corrective) {
        // An observed request consumes the attempt even if its response fails.
        await recordCorrectiveOutcome(process.env.SHACO_FORGE_PROVIDER_BUDGET, correctiveIdentity, { promptEmitted: true, requestHash: accepted.requestHash, promptAccepted: accepted.accepted })
        if (accepted.sessionHash !== correctiveIdentity.sessionHash) throw new Error('PROMPT_SESSION_IDENTITY_CHANGED')
        attempts.beginCorrective(accepted.sessionHash, accepted.requestHash, correctiveProof, correctiveIdentity)
      } else attempts.begin(accepted.sessionHash, accepted.requestHash)
      let outcome = 'TURN_NOT_FINISHED'
      const deadline = Date.now() + 180_000
      let terminalObservedAt
      while (Date.now() < deadline) {
        report.observation = await observe()
        if (report.observation.interactions.some(row => row.settlements === 0)) { outcome = 'HUMAN_REQUIRED_INTERACTION'; break }
        // Read only assistant-rendered message content, never user Composer text.
        const renderedMatch = await js(`Array.from(document.querySelectorAll('#harness-client-root [data-chat-flow-kind="assistant-step"]')).filter(el => el.getClientRects().length).at(-1)?.textContent.includes(${JSON.stringify(marker)}) === true`)
        report.renderedAssistantMarkerMatch = renderedMatch
        if (renderedMatch) report.renderedAssistantMarkerSha256 = sha256(marker)
        const healthy = await js('document.querySelector("[data-testid=connection-status]")?.dataset.phase === "carrier-ready"')
        outcome = assessAttempt(report.observation, accepted.sessionHash, renderedMatch, healthy)
        if (report.observation.events.some(row => row.sessionHash === accepted.sessionHash && row.type === 'turn/end')) terminalObservedAt ??= Date.now()
        // UI rendering may settle just after its observed terminal. Do not fail
        // the live gate merely because DOM projection is one render behind.
        if (outcome === 'TOOL_PROOF_NOT_PROVEN' && !renderedMatch && terminalObservedAt && Date.now() - terminalObservedAt < 3000) { await delay(100); continue }
        if (outcome !== 'TURN_NOT_FINISHED') break
        await delay(150)
      }
      if (outcome === 'TURN_NOT_FINISHED') {
        report.boundary = 'SEMANTIC_TURN_COMPLETION_NOT_OBSERVED'
        outcome = 'SHACO_IMPLEMENTATION_FAILURE'
      }
      if (corrective && outcome === 'TOOL_PROOF_NOT_PROVEN' && !report.observation.events.some(row => row.type === 'tool/call' && row.toolName === 'read')) outcome = 'INCONCLUSIVE_MODEL_BEHAVIOR'
      if (corrective && ['SHACO_IMPLEMENTATION_FAILURE', 'STREAMING_NOT_PROVEN', 'TOOL_PROOF_NOT_PROVEN'].includes(outcome)) {
        report.boundary = 'EVIDENCE_CAPTURE_REVALIDATION_FAILED'
        outcome = 'SHACO_IMPLEMENTATION_FAILURE'
      }
      const final = attempts.finish(outcome)
      if (corrective) await recordCorrectiveOutcome(process.env.SHACO_FORGE_PROVIDER_BUDGET, correctiveIdentity, { ...attempts.attempts.at(-1), promptEmitted: true, promptAccepted: report.observation.prompts[promptIndex]?.accepted === true })
      else {
        budget.attempts[attempt - 1] = { ...budget.attempts[attempt - 1], ...attempts.attempts.at(-1) }
        await writeFile(process.env.SHACO_FORGE_PROVIDER_BUDGET, `${JSON.stringify(budget, null, 2)}\n`, 'utf8')
      }
      report.attempts = attempts.attempts
      report.result = final
      if (corrective || final !== 'MODEL_TOOL_SELECTION_NOT_OBSERVED') break
    }
  } catch (error) {
    report.result = report.phase === 'WORKSPACE_PICKER' ? 'PICKER_RUNTIME_INTEGRATION_BLOCKED' : 'SHACO_IMPLEMENTATION_FAILURE'
    report.boundary = String(error.message).split('\n')[0].slice(0, 160)
  } finally {
    report.providerBudgetAfter = await usedBudget()
    report.observation = await observe().catch(() => undefined)
    if (correctiveReserved) {
      const prompt = report.observation?.prompts?.[0]
      await recordCorrectiveOutcome(process.env.SHACO_FORGE_PROVIDER_BUDGET, correctiveIdentity, { outcome: report.result, promptEmitted: Boolean(prompt), promptAccepted: prompt?.accepted === true, ...(prompt?.requestHash ? { requestHash: prompt.requestHash } : {}) })
    }
    if (report.observation) report.multiAgent = multiAgentObservation(report.observation)
    if (report.phase.startsWith('TOOL_ATTEMPT_')) report.composerUi = await js(`Array.from(document.querySelectorAll('#harness-client-root [data-composer-input]')).filter(el => el.getClientRects().length).slice(0,2).map(el => ({ editable: el.contentEditable, phase: el.dataset.phase, disabled: el.getAttribute('aria-disabled'), focused: document.activeElement === el, textLength: el.textContent.length, documentFocused: document.hasFocus() }))`).catch(() => [])
    report.transport = await js('(() => { const e=window.__SHACO_FORGE_TRANSPORT_EVIDENCE__; return { fetchEndpoints:e.fetchEndpoints,streamEndpoints:e.streamEndpoints,activeStreams:e.activeStreams,maxActiveStreams:e.maxActiveStreams } })()').catch(() => undefined)
    if (report.phase === 'WORKSPACE_PICKER') report.pickerUi = await js(`Array.from(document.querySelectorAll('[role="dialog"]')).filter(el => el.getClientRects().length && /Select Workspace Directory|选择工作区目录/.test(el.textContent)).slice(0,2).map(el => ({
      browseDialogVisible: true,
      buttons: Array.from(el.querySelectorAll('button')).filter(button => button.getClientRects().length).slice(0,16).map(button => ({label:(button.getAttribute('aria-label') || button.getAttribute('title') || button.textContent.trim()).slice(0,80),disabled:button.disabled})),
      pathEditorVisible: Boolean(el.querySelector('input[aria-label="编辑路径"],input[aria-label="Edit path"]')),
      controlledPathMatch: Array.from(el.querySelectorAll('input:not([type="password"])')).some(input => input.value === ${JSON.stringify(process.env.SHACO_FORGE_PROOF_WORKSPACE)}),
      alertCount: el.querySelectorAll('[role="alert"]').length,
      loading: Array.from(el.querySelectorAll('[role="status"]')).some(status => /加载中|Loading/.test(status.textContent))
    }))`).catch(() => [])
    // Control labels help diagnose selectors; never capture input values or transcript.
    if (['SHACO_IMPLEMENTATION_FAILURE', 'PICKER_RUNTIME_INTEGRATION_BLOCKED'].includes(report.result)) report.visibleControls = await js('Array.from(document.querySelectorAll("#harness-client-root button")).filter(el=>el.getClientRects().length).slice(0,40).map(el=>({label:(el.getAttribute("aria-label")||el.getAttribute("title")||el.textContent.trim()).slice(0,80),disabled:el.disabled}))').catch(() => [])
    ipcMain.emit('user-loop:complete', undefined, report)
  }
}

app.on('browser-window-created', (_event, window) => window.webContents.once('did-finish-load', () => { void drive(window) }))
await import('../apps/desktop/dist/main/main.js')
