// NOT_PRODUCTION_TEST_ONLY. Actual Electron controls and captured Product source.
import assert from 'node:assert/strict'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function waitFor(window, expression) {
  for(let i=0;i<100;i++){if(await window.webContents.executeJavaScript(expression))return;await delay(100)}
  throw new Error('REAL_CONTROL_PROJECTION_TIMEOUT')
}
export async function verifyControls(window) {
  await waitFor(window, `document.querySelector('[data-testid="shaco-model"]')?.options.length>1`)
  const before=await window.webContents.executeJavaScript(`({permission:document.querySelector('[data-testid="shaco-permission"]').value,model:document.querySelector('[data-testid="shaco-model"]').value})`)
  const select=async (id,value)=>window.webContents.executeJavaScript(`(() => {const element=document.querySelector('[data-testid="'+${JSON.stringify(id)}+'"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await select('shaco-permission','read-only')
  await waitFor(window, `document.querySelector('[data-testid="shaco-permission"]').value==='read-only'&&!document.querySelector('[data-testid="shaco-permission"]').disabled`)
  await select('shaco-permission','danger-full-access');await delay(100)
  const confirmation=await window.webContents.executeJavaScript(`({visible:!!document.querySelector('.shaco-confirmation'),confirmDisabled:document.querySelector('.shaco-confirmation .primary').disabled,current:document.querySelector('[data-testid="shaco-permission"]').value})`)
  assert.equal(confirmation.visible,true);assert.equal(confirmation.confirmDisabled,true);assert.equal(confirmation.current,'read-only')
  await window.webContents.executeJavaScript(`document.querySelector('.shaco-confirmation button').click()`)
  await select('shaco-permission',before.permission)
  await waitFor(window, `document.querySelector('[data-testid="shaco-permission"]').value===${JSON.stringify(before.permission)}&&!document.querySelector('[data-testid="shaco-permission"]').disabled`)
  const next=await window.webContents.executeJavaScript(`(() => {const select=document.querySelector('[data-testid="shaco-model"]');const prefix=select.selectedOptions[0].textContent.split(' · ')[0];return [...select.options].find(option=>option.value!==select.value&&option.value&&option.textContent.startsWith(prefix+' · '))?.value??select.value})()`)
  await select('shaco-model',next)
  await waitFor(window, `document.querySelector('[data-testid="shaco-model"]').value===${JSON.stringify(next)}&&!document.querySelector('[data-testid="shaco-model"]').disabled`)
  await select('shaco-model',before.model)
  await waitFor(window, `document.querySelector('[data-testid="shaco-model"]').value===${JSON.stringify(before.model)}&&!document.querySelector('[data-testid="shaco-model"]').disabled`)
  return {result:'PASS',permissionRoundTrip:true,explicitFullAccessConfirmation:confirmation,modelSelectionRoundTrip:true,modelChanged:next!==before.model,providerRuns:0}
}
export async function captureVisual(window, name) {
  assert.match(name, /^[a-z0-9-]+$/)
  window.restore(); window.showInactive(); window.webContents.setBackgroundThrottling(false)
  await delay(200)
  const ui = await window.webContents.executeJavaScript(`(() => {
    const root=document.querySelector('[data-testid="shaco-root"]');
    const style=getComputedStyle(document.documentElement);
    const geometry=selector=>{const element=document.querySelector(selector);if(!element)return null;const rect=element.getBoundingClientRect();return {width:rect.width,center:rect.x+rect.width/2,maxWidth:getComputedStyle(element).maxWidth};};
    return {rootCount:document.querySelectorAll('[data-testid="shaco-root"]').length,sidebarCount:document.querySelectorAll('[data-testid="shaco-sidebar"]').length,
      forbiddenBrand:/探索未至之境|Preview|Harness/i.test(document.body.innerText), harnessSeats:document.querySelectorAll('[data-slot="sidebar"],[data-slot="conversation"]').length,
      template:document.documentElement.dataset.themeTemplate,mode:document.documentElement.dataset.themeMode,
      rootVisible:!!root&&root.getBoundingClientRect().height>0, horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
      composer:!!document.querySelector('[data-testid="shaco-composer"]'),approval:!!document.querySelector('[data-approval-key]'),question:!!document.querySelector('[data-question-key]'),
      kinds:[...document.querySelectorAll('[data-message-kind]')].map(el=>el.dataset.messageKind),tools:[...document.querySelectorAll('[data-tool-state]')].map(el=>el.dataset.toolState),
      geometry:{conversation:geometry('[data-testid="shaco-conversation"]'),composer:geometry('.composer-dock'),tool:geometry('[data-testid="shaco-tool"]')},
      lowNoiseWorkbar:!/PID|Port|generation|carrier|[a-f0-9]{32}/i.test(document.querySelector('.shaco-workbar')?.innerText??''),
      bootstrapVisible:!document.querySelector('[data-testid="truthful-state"]')?.hidden,
      plan:!!document.querySelector('[data-plan-review-key]'),
      tokens:Object.fromEntries(['--surface-primary','--surface-sidebar','--accent-primary','--control-radius','--template-decoration-height','--font-display'].map(key=>[key,style.getPropertyValue(key).trim()]))};
  })()`)
  const root = process.env.SHACO_FORGE_STEP2_EVIDENCE_ROOT
  await mkdir(root, { recursive: true })
  const bytes = (await window.webContents.capturePage(undefined, { stayHidden: false, stayAwake: true })).toPNG()
  const path = join(root, `${name}.png`)
  await writeFile(path, bytes)
  const result = { name, path, width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),sha256:createHash('sha256').update(bytes).digest('hex'),ui,source:'REAL_ELECTRON_CURRENT_PRODUCT_WITH_LOCAL_NON_PROVIDER_HOST_FIXTURE' }
  await writeFile(join(root, `${name}.json`), JSON.stringify(result,null,2)+'\n','utf8')
  return result
}

export async function verifyThemeSwitch(window, name) {
  await window.webContents.executeJavaScript(`(() => {
    const input=document.querySelector('[data-testid="shaco-draft"]');
    if(!input)throw new Error('REAL_SHACO_COMPOSER_REQUIRED');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'保留的主题切换草稿');input.dispatchEvent(new Event('input',{bubbles:true}));
  })()`)
  await delay(500)
  await window.webContents.executeJavaScript(`(() => {
    window.__fullShacoTest={check:window.__SHACO_PRESENTATION__.captureContinuity(),root:document.querySelector('[data-testid="shaco-root"]'),session:document.querySelector('[data-testid="shaco-session"]'),composer:document.querySelector('[data-testid="shaco-composer"]'),draft:document.querySelector('[data-testid="shaco-draft"]'),
      prompts:window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.userLoop.evidence.prompts.length,events:window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.eventsReady,fetchCount:window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.fetchEndpoints.length};
    document.querySelector('[data-testid="settings"]').click();
  })()`)
  await delay(600)
  // Settings schema operations are a stateless Cordis service proxy, not a
  // stable business object. Capture the actual described settings snapshot
  // after the first Settings read has completed, before changing the template.
  await window.webContents.executeJavaScript(`void(window.__fullShacoTest.check=window.__SHACO_PRESENTATION__.captureContinuity())`)
  const steps=[]
  for(const template of ['FAMICOM','BRAUN']) {
    await window.webContents.executeJavaScript(`(() => {const select=document.querySelector('[data-testid="theme-template"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,${JSON.stringify(template)});select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
    await delay(150)
    const proof=await window.webContents.executeJavaScript(`(() => {const old=window.__fullShacoTest;return {template:document.documentElement.dataset.themeTemplate,
      sameRoot:old.root===document.querySelector('[data-testid="shaco-root"]'),sameSessionTree:old.session===document.querySelector('[data-testid="shaco-session"]'),sameComposer:old.composer===document.querySelector('[data-testid="shaco-composer"]'),
      sameDraft:old.draft===document.querySelector('[data-testid="shaco-draft"]')&&old.draft.value==='保留的主题切换草稿',truth:old.check(),
      promptsUnchanged:old.prompts===window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.userLoop.evidence.prompts.length,connectionUnchanged:old.events===window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.eventsReady};})()`)
    assert.equal(proof.template,template)
    for(const [key,value] of Object.entries(proof)) if(key!=='template'&&key!=='truth')assert.equal(value,true,key)
    assert.ok(Object.values(proof.truth).every(Boolean),JSON.stringify(proof.truth))
    steps.push(proof)
    const modes=[]
    for(const mode of ['dark','system','light']) {
      await window.webContents.executeJavaScript(`(() => {const select=document.querySelector('[data-testid="theme-mode"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,${JSON.stringify(mode)});select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
      const value=await window.webContents.executeJavaScript(`({mode:document.documentElement.dataset.themeMode,resolved:document.documentElement.dataset.theme,template:document.documentElement.dataset.themeTemplate,truth:window.__fullShacoTest.check(),surface:getComputedStyle(document.documentElement).getPropertyValue('--surface-primary')})`)
      assert.equal(value.mode,mode);assert.equal(value.template,template);assert.ok(Object.values(value.truth).every(Boolean));modes.push(value)
    }
    assert.notEqual(modes[0].surface,modes[2].surface)
    steps.push({template,modes})
    await window.webContents.executeJavaScript(`document.querySelector('.shaco-settings header button').click()`)
    steps.push(await captureVisual(window,template.toLowerCase()+'-'+name))
    if(template==='FAMICOM') {await window.webContents.executeJavaScript(`document.querySelector('[data-testid="settings"]').click()`);await delay(300)}
  }
  await window.webContents.executeJavaScript('delete window.__fullShacoTest')
  return {result:'PASS',steps,providerRuns:0}
}
