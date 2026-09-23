// NOT_PRODUCTION_TEST_ONLY. Actual Electron controls and captured Product source.
import assert from 'node:assert/strict'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { clipboard, nativeTheme } from 'electron'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function waitFor(window, expression) {
  for(let i=0;i<100;i++){if(await window.webContents.executeJavaScript(expression))return;await delay(100)}
  throw new Error('REAL_CONTROL_PROJECTION_TIMEOUT')
}
export async function verifyControls(window) {
  await waitFor(window, `!!document.querySelector('[data-testid="shaco-model"]')&&!document.querySelector('[data-testid="shaco-model"]').disabled`)
  const before=await window.webContents.executeJavaScript(`({permission:document.querySelector('[data-testid="shaco-permission"]').value})`)
  const openModelRoot=async()=>{
    await window.webContents.executeJavaScript(`(() => {const trigger=document.querySelector('[data-testid="shaco-model"]');if(!trigger||trigger.disabled)throw new Error('REAL_MODEL_TRIGGER_REQUIRED');trigger.click()})()`)
    await waitFor(window, `!!document.querySelector('.model-menu[aria-label="模型与推理强度"]')`)
  }
  const openModelPanel=async (label,menuLabel)=>{
    await openModelRoot()
    await window.webContents.executeJavaScript(`(() => {const menu=document.querySelector('.model-menu[aria-label="模型与推理强度"]');const row=[...menu.querySelectorAll('.model-menu-row')].find(element=>element.querySelector('.model-menu-label')?.textContent.trim()===${JSON.stringify(label)});if(!row)throw new Error('REAL_MODEL_MENU_ROW_REQUIRED');row.click()})()`)
    await waitFor(window, `!!document.querySelector(${JSON.stringify(`.model-menu[aria-label="${menuLabel}"]`)})`)
  }
  const readCheckedOption=async menuLabel=>window.webContents.executeJavaScript(`(() => {const menu=document.querySelector(${JSON.stringify(`.model-menu[aria-label="${menuLabel}"]`)});const option=menu?.querySelector('.model-option[aria-checked="true"]');const label=option?.querySelector('.model-option-name')?.textContent.trim();if(!label)throw new Error('REAL_CHECKED_MODEL_OPTION_REQUIRED');return label})()`)
  const readAlternateOption=async (menuLabel,excluded=[])=>window.webContents.executeJavaScript(`(() => {const menu=document.querySelector(${JSON.stringify(`.model-menu[aria-label="${menuLabel}"]`)});const excluded=${JSON.stringify(excluded)};const option=[...menu.querySelectorAll('.model-option')].find(element=>{const label=element.querySelector('.model-option-name')?.textContent.trim();return element.getAttribute('aria-checked')!=='true'&&!element.disabled&&!excluded.includes(label)});const label=option?.querySelector('.model-option-name')?.textContent.trim();if(!label)throw new Error('REAL_DIFFERENT_MODEL_OPTION_REQUIRED');return label})()`)
  const clickModelOption=async (menuLabel,label)=>{
    await window.webContents.executeJavaScript(`(() => {const menu=document.querySelector(${JSON.stringify(`.model-menu[aria-label="${menuLabel}"]`)});const options=[...menu.querySelectorAll('.model-option')].filter(element=>element.querySelector('.model-option-name')?.textContent.trim()===${JSON.stringify(label)});if(options.length!==1)throw new Error('REAL_MODEL_OPTION_REQUIRED');options[0].click()})()`)
    await waitFor(window, `!document.querySelector('.model-menu')`)
    await waitFor(window, `!document.querySelector('[data-testid="shaco-model"]').disabled`)
  }
  const waitForCheckedOption=async (menuLabel,label)=>waitFor(window, `document.querySelector(${JSON.stringify(`.model-menu[aria-label="${menuLabel}"] .model-option[aria-checked="true"] .model-option-name`)})?.textContent.trim()===${JSON.stringify(label)}`)
  const closeModelMenu=async()=>{
    await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-model"]').click()`)
    await waitFor(window, `!document.querySelector('.model-menu')`)
  }
  const choosePermission=async value=>{
    await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-permission"]').click()`)
    await waitFor(window, `!!document.querySelector('.permission-menu')`)
    await window.webContents.executeJavaScript(`document.querySelector('[data-permission-value=${JSON.stringify(value)}]').click()`)
  }
  await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-permission"]').click()`)
  await waitFor(window, `!!document.querySelector('.permission-menu')`)
  const permissionMenuShot=await captureVisual(window,'permission-menu-expanded')
  await window.webContents.executeJavaScript(`document.querySelector('[data-permission-value="read-only"]').click()`)
  await waitFor(window, `document.querySelector('[data-testid="shaco-permission"]').value==='read-only'&&!document.querySelector('[data-testid="shaco-permission"]').disabled`)
  await choosePermission('danger-full-access');await delay(100)
  const confirmation=await window.webContents.executeJavaScript(`({visible:!!document.querySelector('.shaco-confirmation'),confirmDisabled:document.querySelector('.shaco-confirmation .primary').disabled,current:document.querySelector('[data-testid="shaco-permission"]').value})`)
  assert.equal(confirmation.visible,true);assert.equal(confirmation.confirmDisabled,true);assert.equal(confirmation.current,'read-only')
  const confirmationShot=await captureVisual(window,'full-access-confirmation')
  await window.webContents.executeJavaScript(`document.querySelector('.shaco-confirmation button').click()`)
  if(before.permission!=='read-only')await choosePermission(before.permission)
  await waitFor(window, `document.querySelector('[data-testid="shaco-permission"]').value===${JSON.stringify(before.permission)}&&!document.querySelector('[data-testid="shaco-permission"]').disabled`)
  await openModelPanel('模型','选择模型')
  const modelBefore=await readCheckedOption('选择模型')
  const modelNext=await readAlternateOption('选择模型')
  await clickModelOption('选择模型',modelNext)
  await openModelPanel('模型','选择模型')
  await waitForCheckedOption('选择模型',modelNext)
  await clickModelOption('选择模型',modelBefore)
  await openModelPanel('模型','选择模型')
  await waitForCheckedOption('选择模型',modelBefore)
  await closeModelMenu()
  await openModelRoot()
  const hasReasoning=await window.webContents.executeJavaScript(`[...document.querySelectorAll('.model-menu[aria-label="模型与推理强度"] .model-menu-row')].some(element=>element.querySelector('.model-menu-label')?.textContent.trim()==='推理强度')`)
  await closeModelMenu()
  let reasoning=null
  if(hasReasoning) {
    await openModelPanel('推理强度','选择推理强度')
    reasoning={before:await readCheckedOption('选择推理强度')}
    reasoning.next=await readAlternateOption('选择推理强度',['默认强度'])
    await clickModelOption('选择推理强度',reasoning.next)
    await openModelPanel('推理强度','选择推理强度')
    await waitForCheckedOption('选择推理强度',reasoning.next)
    await clickModelOption('选择推理强度',reasoning.before)
    await openModelPanel('推理强度','选择推理强度')
    await waitForCheckedOption('选择推理强度',reasoning.before)
    await closeModelMenu()
  }
  return {result:'PASS',permissionRoundTrip:true,permissionMenuShot,explicitFullAccessConfirmation:confirmation,confirmationShot,modelSelectionRoundTrip:true,reasoningSelectionRoundTrip:reasoning!==null,modelChanged:modelNext!==modelBefore,providerRuns:0}
}
export async function captureVisual(window, name) {
  assert.match(name, /^[a-z0-9-]+$/)
  window.restore(); window.showInactive(); window.webContents.setBackgroundThrottling(false)
  await window.webContents.executeJavaScript('document.fonts.ready.then(() => true)')
  await delay(200)
  const ui = await window.webContents.executeJavaScript(`(() => {
    const root=document.querySelector('[data-testid="shaco-root"]');
    const style=getComputedStyle(document.documentElement);
    const geometry=selector=>{const element=document.querySelector(selector);if(!element)return null;const rect=element.getBoundingClientRect();return {width:rect.width,center:rect.x+rect.width/2,maxWidth:getComputedStyle(element).maxWidth};};
    return {rootCount:document.querySelectorAll('[data-testid="shaco-root"]').length,sidebarCount:document.querySelectorAll('[data-testid="shaco-sidebar"]').length,
      forbiddenBrand:/探索未至之境|Preview|Harness/i.test(document.body.innerText), harnessSeats:document.querySelectorAll('[data-slot="sidebar"],[data-slot="conversation"]').length,
      template:document.documentElement.dataset.themeTemplate,mode:document.documentElement.dataset.themeMode,
      viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      presentation:Object.fromEntries(['.app-shell','.shaco-sidebar','.brand','.brand-mark','.shaco-workbar','.connection-status','.shaco-conversation','.message-user','.message-assistant','.message-user .message-body','.message-assistant .message-body','.message-avatar','.message-footer','.message-copy','.shaco-tool','.turn-detail-list','.composer-dock','.shaco-composer','.shaco-composer>textarea','.composer-controls select','.composer-controls .primary','.shaco-interaction','.shaco-confirmation','.shaco-settings'].map(selector=>{const el=document.querySelector(selector);if(!el)return [selector,null];const css=getComputedStyle(el);return [selector,Object.fromEntries(['display','position','width','max-width','min-height','padding','margin','gap','font-family','font-size','font-weight','line-height','color','background-color','background-image','border','border-radius','box-shadow'].map(key=>[key,css.getPropertyValue(key)]))]})),
      fonts:document.documentElement.dataset.themeTemplate==='FAMICOM'?Object.fromEntries(['Shaco FAMICOM Pixel','Shaco FAMICOM Noto','Shaco FAMICOM Mono'].map(font=>[font,document.fonts.check('16px "'+font+'"')])):null,
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
    if(document.querySelector('.attachment-list img'))return;
    const bytes=Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6D1sAAAAASUVORK5CYII='),c=>c.charCodeAt(0));
    const transfer=new DataTransfer();transfer.items.add(new File([bytes],'theme-continuity.png',{type:'image/png'}));
    const input=document.querySelector('input[type="file"]');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  })()`)
  await waitFor(window, `document.querySelectorAll('.attachment-list img').length===1`)
  await window.webContents.executeJavaScript(`(() => {
    const input=document.querySelector('[data-testid="shaco-draft"]');
    if(!input)throw new Error('REAL_SHACO_COMPOSER_REQUIRED');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'保留的主题切换草稿');input.dispatchEvent(new Event('input',{bubbles:true}));
  })()`)
  await delay(500)
  await window.webContents.executeJavaScript(`(() => {
    window.__fullShacoTest={check:window.__SHACO_PRESENTATION__.captureContinuity(),root:document.querySelector('[data-testid="shaco-root"]'),session:document.querySelector('[data-testid="shaco-session"]'),composer:document.querySelector('[data-testid="shaco-composer"]'),draft:document.querySelector('[data-testid="shaco-draft"]'),
      attachments:[...document.querySelectorAll('.attachment-list img')].map(el=>el.src),
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
      sameAttachments:JSON.stringify(old.attachments)===JSON.stringify([...document.querySelectorAll('.attachment-list img')].map(el=>el.src)),
      promptsUnchanged:old.prompts===window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.userLoop.evidence.prompts.length,connectionUnchanged:old.events===window.__SHACO_FORGE_TRANSPORT_EVIDENCE__.eventsReady};})()`)
    assert.equal(proof.template,template)
    for(const [key,value] of Object.entries(proof)) if(key!=='template'&&key!=='truth')assert.equal(value,true,key)
    assert.ok(Object.values(proof.truth).every(Boolean),JSON.stringify(proof.truth))
    steps.push(proof)
    const modes=[]
    for(const mode of ['dark','system','light']) {
      await window.webContents.executeJavaScript(`(() => {const select=document.querySelector('[data-testid="theme-mode"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,${JSON.stringify(mode)});select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
      if(mode==='system'&&template==='BRAUN') {
        const original=nativeTheme.themeSource
        try { for(const resolved of ['dark','light']) { nativeTheme.themeSource=resolved;await waitFor(window,`document.documentElement.dataset.theme===${JSON.stringify(resolved)}`) } }
        finally { nativeTheme.themeSource=original }
      }
      const value=await window.webContents.executeJavaScript(`({mode:document.documentElement.dataset.themeMode,resolved:document.documentElement.dataset.theme,template:document.documentElement.dataset.themeTemplate,truth:window.__fullShacoTest.check(),surface:getComputedStyle(document.documentElement).getPropertyValue('--surface-primary')})`)
      assert.equal(value.mode,mode);assert.equal(value.template,template);assert.ok(Object.values(value.truth).every(Boolean));modes.push(value)
      if(name==='representative') steps.push(await captureVisual(window,template.toLowerCase()+'-mode-'+mode))
    }
    assert.notEqual(modes[0].surface,modes[2].surface)
    steps.push({template,modes})
    await window.webContents.executeJavaScript(`document.querySelector('.shaco-settings header button').click()`)
    steps.push(await captureVisual(window,template.toLowerCase()+'-'+name))
    if(name.endsWith('-pending')) {
      const bounds=window.getBounds()
      window.setMinimumSize(320,500);window.setContentSize(650,780)
      await window.webContents.executeJavaScript(`document.querySelector('.collapse-sidebar').click()`)
      await delay(200)
      const reachable=await window.webContents.executeJavaScript(`(() => {const el=document.querySelector('[data-testid="submit-question"],[data-testid="allow-approval"]');const r=el.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()`)
      assert.equal(reachable,true,'NARROW_PENDING_SUBMIT_REACHABLE')
      steps.push(await captureVisual(window,template.toLowerCase()+'-narrow-'+name))
      window.setMinimumSize(760,600);window.setBounds(bounds)
      await window.webContents.executeJavaScript(`document.querySelector('.brand-expand').click()`)
      await delay(180)
    }
    if(template==='FAMICOM') {await window.webContents.executeJavaScript(`document.querySelector('[data-testid="settings"]').click()`);await delay(300)}
  }
  await window.webContents.executeJavaScript('delete window.__fullShacoTest')
  await window.webContents.executeJavaScript(`document.querySelector('[aria-label="移除 theme-continuity.png"]').click()`)
  return {result:'PASS',steps,providerRuns:0}
}

async function selectTemplate(window, template) {
  await window.webContents.executeJavaScript(`document.querySelector('[data-testid="settings"]').click()`)
  await waitFor(window, `!!document.querySelector('[data-testid="theme-template"]')`)
  await window.webContents.executeJavaScript(`(() => {const select=document.querySelector('[data-testid="theme-template"]');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,${JSON.stringify(template)});select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await window.webContents.executeJavaScript(`document.querySelector('.shaco-settings header button').click()`)
  await window.webContents.executeJavaScript('document.fonts.ready')
  await delay(180)
}

export async function captureFamicom(window, name) {
  await selectTemplate(window, 'FAMICOM')
  const shot = await captureVisual(window, 'famicom-' + name)
  await selectTemplate(window, 'BRAUN')
  return shot
}

export const verifyFamicomPresentation = (window, stage) => verifyTemplatePresentation(window, stage, 'FAMICOM')
export const verifyBraunPresentation = (window, stage) => verifyTemplatePresentation(window, stage, 'BRAUN')

async function verifyTemplatePresentation(window, stage, template) {
  const initialBounds=window.getBounds()
  if(stage==='result')window.setContentSize(1363,936)
  await selectTemplate(window, template)
  window.show(); window.focus(); await delay(250)
  const shots = []
  const take = async name => { const shot=await captureVisual(window,template.toLowerCase()+'-'+name);shots.push(shot);return shot }
  // Exact public text seeded by the existing zero-provider Host fixture.
  const expected = {
    user: '检查项目结构，并说明主界面的实现与验证顺序。',
    assistant: '已检查项目结构。\n\n1. 保留现有会话与工具执行语义。\n2. 完成 Shaco 工作区与双主题展示。\n3. 验证连接恢复和显式交互。\n\n**本地验证记录**：此内容由非 Provider fixture 生成。',
  }
  const copy = async kind => {
    const selector=`.message-${kind} .message-copy`
    await window.webContents.executeJavaScript(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest'})`)
    await window.webContents.executeJavaScript(`document.querySelector(${JSON.stringify(selector)}).click()`,true)
    await waitFor(window, `document.querySelector('.message-${kind} [data-copy-state]')?.dataset.copyState==='copied'`)
    let matches=false, native=''
    // Windows CF_UNICODETEXT normalizes line endings; no other text is normalized.
    for(let i=0;i<10&&!matches;i++){await delay(100);native=clipboard.readText();matches=native.replaceAll('\r\n','\n')===expected[kind]}
    assert.equal(matches,true,`${kind.toUpperCase()}_NATIVE_CLIPBOARD_PUBLIC_TEXT_ONLY: length=${native.length}, expected=${expected[kind].length}, CRLF=${(native.match(/\r\n/g)??[]).length}`)
    await take(`${stage}-${kind}-copy-success`)
  }
  await copy('assistant')
  if(stage==='streaming') {
    assert.equal(await window.webContents.executeJavaScript(`!!document.querySelector('.message-assistant [data-streaming="true"]')`),true)
    await selectTemplate(window,'BRAUN')
    return {result:'PASS',streamingVisibleSnapshot:true,shots}
  }
  await copy('user')
  await take('expanded-sidebar-conversation')
  if(template==='BRAUN') {
    const skin=await window.webContents.executeJavaScript(`(() => {const root=getComputedStyle(document.documentElement);const style=selector=>getComputedStyle(document.querySelector(selector));return {surface:root.getPropertyValue('--surface-primary').trim(),sidebar:root.getPropertyValue('--surface-sidebar').trim(),font:root.getPropertyValue('--font-ui'),mono:root.getPropertyValue('--font-mono'),noto:document.fonts.check('16px "Shaco FAMICOM Noto"'),bubble:style('.message-body').borderRadius,composer:style('.shaco-composer').borderRadius,footer:style('.message-footer').display,selected:style('.chat-management-row:has([aria-selected="true"])').boxShadow,scope:document.documentElement.dataset.themeTemplate}})()`)
    assert.equal(skin.scope,'BRAUN');assert.equal(skin.surface,'rgb(246, 245, 241)');assert.equal(skin.sidebar,'rgb(238, 238, 232)')
    assert.match(skin.font,/Neue Haas Grotesk/);assert.match(skin.font,/Shaco FAMICOM Noto/);assert.match(skin.mono,/IBM Plex Mono/);assert.equal(skin.noto,true)
    assert.equal(skin.bubble,'6px');assert.equal(skin.composer,'7px');assert.equal(skin.footer,'flex');assert.notEqual(skin.selected,'none')
    const beforeFocus=await window.webContents.executeJavaScript(`(() => {const el=document.querySelector('.message-copy');const r=el.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`)
    window.webContents.sendInputEvent({type:'mouseMove',...beforeFocus});await take('hover-copy')
    await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-draft"]').focus()`)
    const focus=await window.webContents.executeJavaScript(`getComputedStyle(document.querySelector('.shaco-composer')).borderColor`)
    assert.equal(focus,'rgb(166, 75, 48)');await take('composer-focus')
    const controls=await verifyControls(window);assert.equal(controls.result,'PASS')
    const savedDraft=await window.webContents.executeJavaScript(`(() => {const el=document.querySelector('[data-testid="shaco-draft"]');const value=el.value;Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,'');el.dispatchEvent(new Event('input',{bubbles:true}));return value})()`)
    await waitFor(window, `document.querySelector('[data-testid="shaco-send"]').disabled`)
    const disabled=await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-send"]').disabled`)
    assert.equal(disabled,true);await take('composer-disabled-selected')
    await window.webContents.executeJavaScript(`(() => {const el=document.querySelector('[data-testid="shaco-draft"]');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,${JSON.stringify(savedDraft)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`)
  }
  const expanded = await window.webContents.executeJavaScript(`document.querySelector('.shaco-sidebar').getBoundingClientRect().width`)
  assert.equal(expanded,307)
  await window.webContents.executeJavaScript(`document.querySelector('.collapse-sidebar').click()`)
  await waitFor(window, `document.querySelector('.shaco-sidebar').getBoundingClientRect().width===72`)
  const collapsed = await window.webContents.executeJavaScript(`({sidebar:document.querySelector('.shaco-sidebar').getBoundingClientRect().width,workspaceX:document.querySelector('.workspace').getBoundingClientRect().x})`)
  assert.equal(collapsed.sidebar,72);assert.equal(collapsed.workspaceX,72)
  await take('collapsed-sidebar')
  await window.webContents.executeJavaScript(`document.querySelector('.brand-expand').focus()`)
  await delay(150)
  const focus = await window.webContents.executeJavaScript(`getComputedStyle(document.querySelector('.expand-glyph')).opacity`)
  assert.equal(focus,'1');await take('logo-focus-expand')
  await window.webContents.executeJavaScript(`document.querySelector('[aria-label="搜索项目与对话"]').click()`)
  await waitFor(window, `document.activeElement===document.querySelector('input[type="search"]')`)
  await take('search-expanded-focus')
  const projectPoint=await window.webContents.executeJavaScript(`(() => {const r=document.querySelector('.project-row').getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`)
  const projectRest=await window.webContents.executeJavaScript(`(() => {const s=getComputedStyle(document.querySelector('.project-title'));return {background:s.backgroundColor,color:s.color}})()`)
  window.webContents.sendInputEvent({type:'mouseMove',...projectPoint})
  await waitFor(window, `getComputedStyle(document.querySelector('.project-new-chat')).opacity==='1'`)
  const projectHover=await window.webContents.executeJavaScript(`(() => {const s=getComputedStyle(document.querySelector('.project-title'));return {background:s.backgroundColor,color:s.color}})()`)
  assert.equal(projectHover.background,projectRest.background,'PROJECT_HOVER_MUST_NOT_PAINT_BACKGROUND')
  assert.notEqual(projectHover.color,projectRest.color,'PROJECT_HOVER_MUST_CHANGE_TITLE_COLOR')
  await take('project-hover-actions')
  await window.webContents.executeJavaScript(`document.querySelector('.project-title').click()`)
  await waitFor(window, `document.querySelector('.project-title').getAttribute('aria-expanded')==='false'`)
  assert.equal(await window.webContents.executeJavaScript(`document.querySelector('.project-group > [role="group"]')===null`),true,'PROJECT_TITLE_COLLAPSES_GROUP')
  await take('project-title-collapsed')
  await window.webContents.executeJavaScript(`document.querySelector('.project-title').click()`)
  await waitFor(window, `document.querySelector('.project-title').getAttribute('aria-expanded')==='true'`)
  await window.webContents.executeJavaScript(`document.querySelector('[aria-label^="更多项目操作 "]').click()`)
  await waitFor(window, `!!document.querySelector('.project-actions-menu')`)
  await take('project-actions-menu')
  await window.webContents.executeJavaScript(`document.querySelector('.project-actions-menu [role="menuitem"]').click()`)
  const dialogContrast=await window.webContents.executeJavaScript(`(() => {const s=getComputedStyle(document.querySelector('.management-dialog .primary'));return {background:s.backgroundColor,color:s.color,accent:getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()}})()`)
  assert.notEqual(dialogContrast.background,'rgba(0, 0, 0, 0)');assert.notEqual(dialogContrast.background,dialogContrast.color)
  await take('management-dialog')
  await window.webContents.executeJavaScript(`document.querySelector('.management-dialog button').click()`)
  await take('turn-disclosure-closed')
  await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-tool"] summary').click()`)
  await take('turn-disclosure-open')
  await window.webContents.executeJavaScript(`document.querySelector('[data-testid="shaco-tool"] summary').click()`)
  await window.webContents.executeJavaScript(`Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('TEST_CLIPBOARD_DENIED'))})`)
  try {
    await window.webContents.executeJavaScript(`document.querySelector('.message-user .message-copy').click()`,true)
    await waitFor(window, `document.querySelector('.message-user [data-copy-state]')?.dataset.copyState==='failed'`)
    const feedback=await window.webContents.executeJavaScript(`document.querySelector('.message-user .message-copy-feedback [role="status"]').textContent`)
    assert.equal(feedback,'复制失败，请重试');await take('copy-failure')
  } finally { await window.webContents.executeJavaScript(`delete navigator.clipboard.writeText`) }
  await window.webContents.executeJavaScript(`document.querySelector('[data-testid="settings"]').click()`)
  await take('settings')
  await window.webContents.executeJavaScript(`document.querySelector('.shaco-settings header button').click()`)
  const bounds=window.getBounds()
  window.setMinimumSize(320,500)
  for(const width of [921,920,681,680,651,650,480]) {
    window.setContentSize(width,780);await delay(200)
    if(await window.webContents.executeJavaScript(`!!document.querySelector('.collapse-sidebar')`))await window.webContents.executeJavaScript(`document.querySelector('.collapse-sidebar').click()`)
    const controls=await window.webContents.executeJavaScript(`(() => {
      const selectors=['[aria-label="搜索项目与对话"]','[data-testid="open-project"]','[data-testid="new-chat"]','[data-testid="shaco-model"]','[data-testid="shaco-permission"]','[aria-label="添加图片"]','[data-testid="shaco-send"]','[data-testid="settings"]'];
      if(document.querySelector('[aria-label="推理强度"]'))selectors.push('[aria-label="推理强度"]');
      return selectors.map(selector=>{const el=document.querySelector(selector),r=el?.getBoundingClientRect();return {selector,reachable:!!r&&r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}});
    })()`)
    assert.ok(controls.every(row=>row.reachable),JSON.stringify(controls))
    const shot=await take('narrow-'+width);assert.equal(shot.ui.horizontalOverflow,false)
    await window.webContents.executeJavaScript(`document.querySelector('.brand-expand').click()`)
    await delay(180)
    const expandedReachable=await window.webContents.executeJavaScript(`['input[type="search"]','.collapse-sidebar','[data-testid="open-project"]','[data-testid="new-chat"]'].every(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return r.width>0&&r.right<=innerWidth&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})`)
    assert.equal(expandedReachable,true,'NARROW_EXPANDED_NAVIGATION_REACHABLE')
    assert.equal(await window.webContents.executeJavaScript(`document.querySelector('.workspace').getBoundingClientRect().x`),width<=650?60:width<=920?72:307,'NARROW_EXPANDED_WORKSPACE_RETAINS_SECOND_COLUMN')
    await take('narrow-'+width+'-expanded')
    await window.webContents.executeJavaScript(`document.querySelector('.collapse-sidebar').click()`)
    await delay(180)
  }
  window.setMinimumSize(760,600);window.setBounds(bounds)
  await window.webContents.executeJavaScript(`document.querySelector('.brand-expand').click()`)
  await selectTemplate(window,'BRAUN')
  window.setBounds(initialBounds)
  return {result:'PASS',userCopy:true,assistantCopy:true,copyFailureTruthful:true,sidebar:{expanded,collapsed,focus},narrowControls:true,shots}
}
