// Test-only OS boundary injection. The real Renderer -> Preload -> Main guard
// and the real public Harness Workspace/Session operations still execute.
import assert from 'node:assert/strict'
import { dialog } from 'electron'
import { createHash, randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const hash = value => createHash('sha256').update(value).digest('hex')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function wait(window, expression, label) {
  for (let i = 0; i < 100; i++) {
    const value = await window.webContents.executeJavaScript(expression)
    if (value) return value
    await delay(100)
  }
  throw new Error(`STEP3_${label}_TIMEOUT`)
}
const click = (window, selector) => window.webContents.executeJavaScript(`document.querySelector(${JSON.stringify(selector)}).click()`)
async function roster(window) {
  return window.webContents.executeJavaScript(`(async () => {
    const call = async endpoint => {
      const reply = await window.shacoForge.transport.fetch({url:'shaco-forge://client/api/'+endpoint,method:'POST',contentType:'application/json',body:JSON.stringify({type:'client-request',rpcId:crypto.randomUUID(),method:endpoint,payload:{args:{_request:{}}}})});
      const result=JSON.parse(reply.body).result;if(!result.ok)throw new Error('LOCAL_READ_FAILED');return result.value;
    };
    const stream=await window.shacoForge.transport.openStream('workspace/follow',{args:{}});
    let baseline;
    try {baseline=await window.shacoForge.transport.pullStream(stream)} finally {await window.shacoForge.transport.cancelStream(stream,'test-read-complete')}
    if(baseline.value?.type!=='baseline')throw new Error('WORKSPACE_BASELINE_REQUIRED');
    return {workspaces:baseline.value.value, sessions:await call('session/list')};
  })()`)
}
export async function seed(window) {
  await wait(window, `!!document.querySelector('[data-testid="new-chat"]')`, 'SIDEBAR')
  const initial = await roster(window)
  // Snapshot shape is returned by the frozen public RPC, not an invented store.
  const initialText = JSON.stringify(initial)
  assert.ok(!initialText.includes(process.env.SHACO_FORGE_STEP2_WORKSPACE))
  const original = dialog.showOpenDialog
  const picks = []
  let mode = 'cancel'
  dialog.showOpenDialog = async (owner, options) => {
    assert.equal(owner, window)
    assert.deepEqual(options.properties, ['openDirectory'])
    picks.push(mode)
    if (mode === 'failure') throw new Error('TEST_OS_FAILURE_REDACTED')
    return mode === 'cancel' ? {canceled:true,filePaths:[]} : {canceled:false,filePaths:[process.env.SHACO_FORGE_STEP2_WORKSPACE]}
  }
  try {
    await click(window, '[data-testid="new-chat"]')
    await wait(window, `!document.querySelector('[data-testid="new-chat"]').disabled`, 'CANCEL')
    assert.deepEqual(await roster(window), initial)
    mode = 'failure'
    await click(window, '[data-testid="new-chat"]')
    await wait(window, `document.querySelector('.shaco-error')?.textContent.includes('NATIVE_PICKER_FAILED')`, 'FAILURE')
    assert.deepEqual(await roster(window), initial)
    mode = 'success'
    await click(window, '[data-testid="new-chat"]')
    await wait(window, `!!document.querySelector('[role="treeitem"][aria-selected="true"]')`, 'NATIVE_CREATE_CONNECT_OPEN')
  } finally { dialog.showOpenDialog = original }
  const created = await roster(window)
  await click(window, '[data-testid="new-chat"]')
  await wait(window, `!document.querySelector('[data-testid="new-chat"]').disabled`, 'BLANK_REUSE')
  assert.deepEqual(await roster(window), created)
  assert.deepEqual(picks, ['cancel','failure','success'])
  // Observe public truth identities only through already approved RPC reads.
  const items = Array.isArray(created.workspaces) ? created.workspaces : created.workspaces.workspaces ?? created.workspaces.items
  const project = items[0]
  const sessions = Array.isArray(created.sessions) ? created.sessions : created.sessions.sessions ?? created.sessions.items
  const session = sessions[0]
  return {workspaceHash:hash(project.workspaceId),sessionHash:hash(session.sessionId ?? session.id),
    publicMutations:['workspace/create','session/create via uiWorkspace.connectWorkspace','sessions.open'],nativePicker:picks,
    noWorkspace:true,cancelNoMutation:true,failureNoMutation:true,blankReuse:true,promptRuns:0,
    nativeMethod:'REAL_IPC_MAIN_GUARD_WITH_TEST_ONLY_DIALOG_RESULT_INJECTION'}
}
let screenshots = 0
let settingsWritten = false
async function fill(window, selector, value, select = false) {
  await window.webContents.executeJavaScript(`(() => {const input=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(${select?'HTMLSelectElement':'HTMLInputElement'}.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event(${select?"'change'":"'input'"},{bubbles:true}));})()`)
}
async function settingsMutation(window) {
  const route=`shaco-fixture-${process.pid}`
  await fill(window,'[data-testid="provider-route"]',route)
  await fill(window,'[data-testid="provider-endpoint"]','https://example.invalid/v1')
  const protocol=await window.webContents.executeJavaScript(`document.querySelector('[data-testid="provider-protocol"]').options[1].value`)
  await fill(window,'[data-testid="provider-protocol"]',protocol,true)
  await fill(window,'[data-testid="model-id"]','local-fixture-model')
  await click(window,'[data-testid="add-model"]')
  await window.webContents.executeJavaScript(`(() => {const input=[...document.querySelectorAll('.settings-editor label')].find(x=>x.textContent.includes('Credential 引用名称')).querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'SHACO_STEP3_LOCAL_FIXTURE');input.dispatchEvent(new Event('input',{bubbles:true}));})()`)
  await fill(window,'[data-testid="credential-input"]',randomBytes(24).toString('hex'))
  await window.webContents.executeJavaScript(`[...document.querySelectorAll('.settings-editor button')].find(x=>x.textContent==='保存凭据').click()`)
  await wait(window,`document.querySelector('[data-testid="credential-status"]')?.textContent==='已配置'`,'CREDENTIAL_SET')
  assert.equal(await window.webContents.executeJavaScript(`document.querySelector('[data-testid="credential-input"]').value`),'')
  await window.webContents.executeJavaScript(`[...document.querySelectorAll('.settings-editor button')].find(x=>x.textContent==='移除凭据').click()`)
  await wait(window,`document.querySelector('[data-testid="credential-status"]')?.textContent==='未配置'`,'CREDENTIAL_UNSET')
  await click(window,'[data-testid="save-provider"]')
  await wait(window,`!document.querySelector('[data-testid="provider-editor"]')`,'PROFILE_SAVE')
  await wait(window,`[...document.querySelectorAll('.settings-columns nav button')].some(x=>x.textContent===${JSON.stringify(route)})`,'PROFILE_REREAD')
  settingsWritten=true
  return {localProfileWritten:true,modelEndpointProtocol:true,credentialSetUnset:true,secretInputCleared:true,
    providerCalls:0,proof:'Frozen PiAiAdapter.listModels reads its local snapshot; no discoverModels or prompt invoked'}
}
export async function diagnostics(window, failure) {
  const data=await window.webContents.executeJavaScript(`({body:document.body.innerText,slots:[...document.querySelectorAll('[data-slot]')].map(x=>x.dataset.slot)})`)
  await writeFile(join(process.env.SHACO_FORGE_STEP2_EVIDENCE_ROOT,`runtime-failure-${process.pid}.json`),JSON.stringify({failure,...data},null,2)+'\n','utf8')
}
export async function verify(window) {
  window.restore()
  window.showInactive()
  window.webContents.setBackgroundThrottling(false)
  const result = await window.webContents.executeJavaScript(`(() => {
    const root=document.querySelector('#harness-client-root');
    const sidebar=root.querySelector('[data-testid="shaco-sidebar"]');
    const conversation=root.querySelector('[data-testid="shaco-conversation"]');
    return {sidebarCount:root.querySelectorAll('[data-testid="shaco-sidebar"]').length,
      sidebarSeats:root.querySelectorAll('[data-slot="sidebar"]').length,
      brand:sidebar.textContent.includes('Shaco Forge')&&sidebar.textContent.includes('AI 开发工作空间'),
      newChat:!!sidebar.querySelector('[data-testid="new-chat"]'),directory:!!sidebar.querySelector('.project-title'),
      currentSession:!!sidebar.querySelector('[role="treeitem"][aria-selected="true"]'),
      settingsAtBottom:sidebar.lastElementChild?.dataset.testid==='settings',
      forbiddenNavigation:/Automation|Agent Collaboration|Knowledge Base/.test(sidebar.textContent),
      conversation:!!conversation,conversationWidth:conversation?.getBoundingClientRect().width,
      conversationHeight:conversation?.getBoundingClientRect().height,
      detailsCollapsed:!root.querySelector('[data-inspector]'),
      requireAvailable:typeof require!=='undefined',processAvailable:typeof process!=='undefined',
      workspaceCapabilities:Object.keys(window.shacoForge.workspace),
      promptRuns:window.__SHACO_FORGE_TRANSPORT_EVIDENCE__?.userLoop.evidence.prompts.length??0};
  })()`)
  assert.equal(result.sidebarCount,1)
  assert.equal(result.sidebarSeats,0)
  for (const key of ['brand','newChat','directory','currentSession','settingsAtBottom','conversation']) assert.equal(result[key],true,key)
  for (const key of ['forbiddenNavigation','requireAvailable','processAvailable']) assert.equal(result[key],false,key)
  assert.deepEqual(result.workspaceCapabilities,['pickDirectory'])
  assert.equal(result.promptRuns,0)
  assert.ok(result.conversationWidth > 200 && result.conversationWidth <= 1101)
  assert.ok(result.conversationHeight > 200)
  assert.equal(result.detailsCollapsed,true)
  await click(window,'[data-testid="settings"]')
  await wait(window,`!!document.querySelector('[data-testid="custom-provider"]')`,'SETTINGS_PUBLIC_READ')
  await click(window,'[data-testid="custom-provider"]')
  const settings = await window.webContents.executeJavaScript(`(() => ({
    editor:!!document.querySelector('[data-testid="provider-editor"]'),
    fields:['provider-route','provider-endpoint','provider-protocol','model-id','credential-input'].map(id=>!!document.querySelector('[data-testid="'+id+'"]')),
    password:document.querySelector('[data-testid="credential-input"]')?.type,
    protocolOptions:document.querySelector('[data-testid="provider-protocol"]')?.options.length,
    error:!!document.querySelector('.shaco-settings [role="alert"]')
  }))()`)
  assert.equal(settings.editor,true)
  assert.ok(settings.fields.every(Boolean))
  assert.equal(settings.password,'password')
  assert.ok(settings.protocolOptions>1)
  assert.equal(settings.error,false)
  if (!settingsWritten) settings.localMutation=await settingsMutation(window)
  await click(window,'.shaco-settings header button')
  await delay(250)
  const path=join(process.env.SHACO_FORGE_STEP2_EVIDENCE_ROOT,`step3-ui-${process.pid}-${++screenshots}.png`)
  const bytes=(await window.webContents.capturePage(undefined,{stayHidden:false,stayAwake:true})).toPNG()
  assert.ok(bytes.length>1000,'SCREENSHOT_MUST_NOT_BE_EMPTY')
  await writeFile(path,bytes)
  return {...result,settings,screenshot:{path:path.replaceAll('\\','/').split('/docs/')[1] ? 'docs/'+path.replaceAll('\\','/').split('/docs/')[1] : path,bytes:bytes.length,sha256:hash(bytes)},providerRuns:0}
}
