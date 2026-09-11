// NOT_PRODUCTION_TEST_DRIVER_ONLY. Loaded only as the explicit Electron test
// entry. Internal envelopes live in IPC memory and are never written to disk.
import assert from 'node:assert/strict'
import { app, BrowserWindow, ipcMain } from 'electron'
import { createHash } from 'node:crypto'
import { seed, diagnostics, verify } from './step3-shell-driver.mjs'
import { captureVisual, verifyThemeSwitch, verifyControls } from './full-shaco-visual-driver.mjs'

const hash = value => typeof value === 'string' ? createHash('sha256').update(value).digest('hex') : null
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const events = new Map()
let clientId
let lastResult
let uiResults = 0
let probe = false
let forbiddenCalls = 0
let bootstrapCaptured = false
const renderFailures = []
app.on('web-contents-created', (_event, contents) => contents.on('console-message', (_event, _level, message) => {
  // Electron's current event carries the message; older releases use arguments.
  const text = _event.message ?? message ?? ''
  if (/error|not a function|undefined|reading/i.test(text)) renderFailures.push(text.replace(/session "[^"]+"/g,'session "REDACTED"').slice(0,500))
}))
const originalHandle = ipcMain.handle.bind(ipcMain)
ipcMain.handle = (channel, handler) => originalHandle(channel, async (...args) => {
  if (channel === 'bootstrap:get-state' && process.env.SHACO_FORGE_FULL_SHACO_VISUAL === '1') {
    if (!bootstrapCaptured) {
      bootstrapCaptured = true
      // Hold only the test reply so the real initial Shaco DOM can be captured.
      await delay(600)
      const window = BrowserWindow.fromWebContents(args[0].sender)
      await captureVisual(window, 'bootstrap-loading')
    } else await delay(1200)
  }
  if (channel === 'transport:fetch') {
    const input = args[1]
    const envelope = JSON.parse(input.body)
    if (/^session\/(prompt|cancel|updateQueue)$/.test(envelope.method)) {
      forbiddenCalls++
      throw new Error('TEST_FORBIDDEN_AGENT_OPERATION')
    }
    if (envelope.method === '$events/result' && !probe) {
      lastResult = structuredClone(envelope.payload.args)
      uiResults++
    }
  }
  const result = await handler(...args)
  if (channel === 'transport:pull-stream' && result?.value) {
    const item = result.value
    if (item.type === 'ready' && item.clientId) clientId = item.clientId
    if (item.event === 'approval/request' || item.event === 'user-questions/request') events.set(item.event, item)
  }
  return result
})
// The explicit evidence driver needs bounded observer counters for its proofs.
process.env.SHACO_FORGE_EVIDENCE_OBSERVER = '1'
const product = await import('../dist/main/main.js')

async function windowReady() {
  for (let i = 0; i < 600; i++) {
    const window = BrowserWindow.getAllWindows()[0]
    if (window && !window.webContents.isLoading() && product.observeStep2Recovery().recovery?.connectionState === 'CONNECTED') return window
    await delay(100)
  }
  throw new Error('TEST_PRODUCT_CONNECTED_TIMEOUT')
}
async function rpc(window, endpoint, args) {
  return window.webContents.executeJavaScript(`(async () => {
    const endpoint=${JSON.stringify(endpoint)};
    const reply=await window.shacoForge.transport.fetch({url:'shaco-forge://client/api/'+endpoint,method:'POST',contentType:'application/json',
      body:JSON.stringify({type:'client-request',rpcId:crypto.randomUUID(),method:endpoint,payload:{args:${JSON.stringify(args)}}})});
    return JSON.parse(reply.body).result;
  })()`)
}
async function fixture(window, method, request) {
  const result = await rpc(window, 'shacoStep3TestOnly/' + method, request ? { request } : {})
  assert.equal(result.ok, true, 'TEST_HOST_FIXTURE_RPC_FAILED')
  return result.value
}
async function snapshot(window) {
  const observation = product.observeStep2Recovery()
  const authority = observation.authority
  const ui = await window.webContents.executeJavaScript(`({
    projectionVisible:document.querySelector('#harness-client-root')?.style.visibility==='visible',
    selected:!!document.querySelector('[role="treeitem"][aria-selected="true"]'),
    approval:!!document.querySelector('[data-approval-key]'),question:!!document.querySelector('[data-question-key]'),
    requireAvailable:typeof require!=='undefined',processAvailable:typeof process!=='undefined'
  })`)
  return { desktopPid: process.pid, authority: authority ? {worker:authority.worker,host:authority.host,helper:authority.helper,
    workerInstanceIdHash:hash(authority.workerInstanceId)} : null,
    clientInstanceIdHash:hash(observation.clientInstanceId), gatewayClientHash:hash(clientId),
    recovery:observation.recovery, readProof:observation.readProof, ui, uiResults, forbiddenCalls }
}
async function waitPending(window, kind) {
  const event = kind === 'approval' ? 'approval/request' : 'user-questions/request'
  for (let i = 0; i < 150; i++) {
    const value = await snapshot(window)
    if (value.ui[kind] && events.has(event)) {
      const frame = events.get(event)
      return { ...value, eventHash:hash(frame.eventId),
        capture: { clientId, eventId:frame.eventId } }
    }
    await delay(100)
  }
  const error = new Error('TEST_REAL_' + kind.toUpperCase() + '_UI_PENDING_TIMEOUT')
  error.details = { snapshot:await snapshot(window), host:await fixture(window,'status'), expectedEventSeen:events.has(event) }
  throw error
}
async function command(action, payload) {
  const window = await windowReady()
  if (action === 'snapshot') return snapshot(window)
  if (action === 'open-fixture-session') {
    // A fresh user-data directory has no persisted Harness selection. Open
    // the sole fixture Session through the rendered Product sidebar.
    await window.webContents.executeJavaScript(`(() => {
      const rows=document.querySelectorAll('[role="treeitem"]');
      if(rows.length!==1)throw new Error('TEST_EXACTLY_ONE_SESSION_REQUIRED');
      rows[0].click();
    })()`)
    return { action:'REAL_SIDEBAR_SESSION_OPEN' }
  }
  if (action === 'seed') {
    const seeded = await seed(window)
    const list = await rpc(window, 'session/list', { _request:{} })
    assert.equal(list.ok, true)
    const sessions = Array.isArray(list.value) ? list.value : list.value.sessions ?? list.value.items
    assert.equal(sessions.length, 1)
    const sessionId = sessions[0].sessionId ?? sessions[0].id
    const host = await fixture(window, 'ensure', { sessionId })
    assert.equal(host.sessionHash, seeded.sessionHash)
    return { seeded, host }
  }
  if (action === 'status') return fixture(window, 'status')
  if (action === 'controls') return verifyControls(window)
  if (action === 'verify-shell') return verify(window)
  if (action === 'load-older') {
    const result = await window.webContents.executeJavaScript(`(() => {const button=document.querySelector('.load-older');if(!button)throw new Error('OLDER_HISTORY_REQUIRED');const count=document.querySelectorAll('[data-message-kind]').length;button.click();return {before:count};})()`)
    for(let i=0;i<100;i++) {
      await delay(100)
      const after=await window.webContents.executeJavaScript(`document.querySelectorAll('[data-message-kind]').length`)
      if(after>result.before) return {result:'PASS',...result,after,readFromRealSession:true}
    }
    throw new Error('OLDER_HISTORY_DID_NOT_GROW')
  }
  if (action === 'visual-capture') return captureVisual(window, payload.name)
  if (action === 'theme-switch') return verifyThemeSwitch(window, payload?.name ?? 'conversation')
  if (action === 'narrow') { window.setMinimumSize(600,500); window.setSize(780,700); await delay(300); return captureVisual(window,'narrow-window') }
  if (action === 'fail-closed') {
    await window.webContents.executeJavaScript(`window.__SHACO_PRESENTATION__.failClosed('TEST_ROOT_OWNERSHIP_FAILURE')`)
    return captureVisual(window,'shaco-root-error')
  }
  if (action === 'settings-capture') {
    await window.webContents.executeJavaScript(`document.querySelector('[data-testid="settings"]').click()`)
    await delay(500)
    const result = await captureVisual(window,'shaco-settings')
    await window.webContents.executeJavaScript(`document.querySelector('.shaco-settings header button').click()`)
    return result
  }
  if (action === 'presentation') return fixture(window, 'presentation', { state: payload.state })
  if (action === 'expand-tool') {
    await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-tool"] summary').click()`)
    const result = await captureVisual(window,'tool-result-detail')
    await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-tool"] summary').click()`)
    return result
  }
  if (action === 'trigger') return fixture(window, 'trigger', { kind:payload.kind })
  if (action === 'pending') return waitPending(window, ['plan','multi'].includes(payload.kind) ? 'question' : payload.kind)
  if (action === 'probe') {
    probe = true
    try { return await rpc(window, '$events/result', payload) } finally { probe = false }
  }
  if (action === 'settle') {
    const before = uiResults
    if (payload.kind === 'approval') {
      await window.webContents.executeJavaScript(`document.querySelector('[data-testid="allow-approval"]').click()`)
    } else {
      const choices = payload.kind === 'plan' ? ['批准方案'] : payload.kind === 'multi' ? ['Alpha','Beta'] : ['Beta']
      for (const choice of choices) await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('[data-question-key] label')).find(label=>label.textContent.includes(${JSON.stringify(choice)})).querySelector('input').click()`)
      if(payload.kind === 'multi') await window.webContents.executeJavaScript(`(() => {const input=document.querySelectorAll('[data-question-key] textarea')[1];Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'本地验证，无外部调用');input.dispatchEvent(new Event('input',{bubbles:true}));})()`)
      await delay(100)
      await window.webContents.executeJavaScript(`document.querySelector('[data-testid="submit-question"]').click()`)
    }
    for (let i = 0; i < 100; i++) {
      const host = await fixture(window, 'status')
      if (host.states[payload.kind].settlements === 1) {
        assert.equal(uiResults - before, 1)
        return { host, snapshot:await snapshot(window), capture:lastResult }
      }
      await delay(100)
    }
    throw new Error('TEST_HOST_UI_SETTLEMENT_TIMEOUT')
  }
  if (action === 'close') { window.close(); return { closing:true } }
  throw new Error('TEST_UNKNOWN_COMMAND')
}
assert.equal(typeof process.send, 'function', 'TEST_PARENT_IPC_REQUIRED')
process.on('message', async message => {
  try { process.send?.({ id:message.id, result:await command(message.action, message.payload) }) }
  catch (error) {
    const window=BrowserWindow.getAllWindows()[0]
    if(window&&!window.isDestroyed()) {await diagnostics(window,error.message);await captureVisual(window,'failed-'+message.action)}
    process.send?.({ id:message.id, failure:error.message, details:{ ...error.details, renderFailures } })
  }
})
app.on('window-all-closed', () => app.quit())
process.send({ ready:true })
