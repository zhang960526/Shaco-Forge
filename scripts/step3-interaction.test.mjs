import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {runInNewContext} from 'node:vm'
import {createRequire} from 'node:module'
const require=createRequire(new URL('../apps/desktop/package.json',import.meta.url))
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
const root=process.env.SHACO_FORGE_HARNESS_ROOT
assert.ok(root)
// Frozen public ./client bytes execute without modification. Context adapters
// below are test doubles for public services; pending objects are Harness-owned.
for(const [name,event,request,answer] of [
  ['ui-approval','approval/request',{toolName:'fixture-tool',reason:'Fixture approval'},'allowed-once'],
  ['ui-user-questions','user-questions/request',{questions:[{id:'q',question:'Fixture question',options:[{label:'Yes'}]}]},{answers:[{id:'q',answer:'Yes'}]}],
]) {
  const bytes=await readFile(`${root}/packages/client/${name}/lib/client.js`,'utf8')
  let plugin
  runInNewContext(bytes,{Promise,window:{__ModuleLoader__:{load:row=>{plugin=row.factory(id=>{
    if(id==='@deepseek-ai/dsh-client-store')return {defineStore:value=>value}
    if(id==='@deepseek-ai/dsh-client-ui-primitives')return new Proxy({}, {get:(_,key)=>props=>React.createElement(key==='Button'?'button':'span',{},props.children)})
    return require(id)
  })}}}})
  function fixture() {
    const slots=[],pending=[],handlers=new Map()
    let removed=0
    const ctx={sessions:{scopeOf:owner=>owner.sessionId},locale:{register:()=>()=>{}},effect:fn=>fn(),
      slots:{inject:(seat,fn)=>fn(),register:(options,component)=>slots.push({options,component})},
      remote:{$on:(key,handler)=>handlers.set(key,handler)},
      uiSession:{registerPendingInteraction:()=>value=>{pending.push(value);return()=>{removed++}}}}
    plugin.apply(ctx)
    return {slots,pending,handler:handlers.get(event),removed:()=>removed}
  }
  test(`${name}: public composer remains reachable with exact Session binding and one settlement`,async()=>{
    const f=fixture()
    const response=f.handler.call({sessionId:'session-A'},request,()=>{throw new Error('UNEXPECTED_DELEGATION')})
    const pending=f.pending[0],slot=f.slots[0]
    assert.equal(pending.sessionId,'session-A')
    assert.equal(slot.options.name,'conversation.composer')
    assert.equal(slot.options.select({pendingInteraction:pending}),pending)
    assert.equal(slot.options.select({pendingInteraction:{kind:pending.kind}}),null)
    const markup=renderToStaticMarkup(React.createElement(slot.component,{matched:pending,t:key=>key,renderSlot:()=>null,
      useStore:selector=>selector({progress:{index:0,drafts:[]}}),actions:{replace(){},clear(){}}}))
    assert.match(markup,/button/)
    assert.match(markup,/Fixture/)
    await pending.answer(answer)
    assert.deepEqual(await response,answer)
    await assert.rejects(pending.answer(answer),/already settled/)
    assert.equal(f.removed(),1)
  })
  test(`${name}: unbound request delegates; stale presentation aborts without answer; fresh public request rebuilds`,async()=>{
    const f=fixture()
    assert.equal(await f.handler.call({},request,()=> 'delegated'),'delegated')
    assert.equal(f.pending.length,0)
    const controller=new AbortController()
    const response=f.handler.call({sessionId:'session-A'},{...request,signal:controller.signal},()=>{})
    const rejected=assert.rejects(response)
    controller.abort(new Error('TEST_GENERATION_ENDED'))
    await rejected
    await assert.rejects(f.pending[0].answer(answer),/already settled/)
    const fresh=fixture(),restored=fresh.handler.call({sessionId:'session-A'},request,()=>{})
    assert.equal(fresh.pending[0].sessionId,'session-A')
    assert.notEqual(fresh.pending[0],f.pending[0])
    await fresh.pending[0].answer(answer)
    await restored
  })
}
test('Shaco navigation/settings retain no interaction runtime or generic Renderer native capability',async()=>{
  const client=(await Promise.all(['recovery','shell-state','sidebar','settings'].map(name=>readFile(`apps/desktop/src/client/${name}.mjs`,'utf8')))).join('\n')
  assert.doesNotMatch(client,/eventId|registerPendingInteraction|session\/cancel|agent\/cancel|\.cancel\(|AppWebEntry|new Context|localStorage|indexedDB/)
  assert.match(client,/name: 'root', id: 'shaco-forge-root', priority: -1/)
  for(const name of ['remote', 'remote.session', 'remote.llm', 'remote.settings', 'remote.credentials']) assert.ok(client.includes(`'${name}'`))
  const preload=await readFile('apps/desktop/src/preload/preload.cts','utf8')
  assert.doesNotMatch(preload,/readFile|readdir|fs\.stat|showOpenDialog|sendSync/)
  assert.match(preload,/workspace: Object\.freeze/)
  const main=await readFile('apps/desktop/src/main/security.ts','utf8')
  assert.match(main,/nodeIntegration: false/)
  assert.match(main,/contextIsolation: true/)
  assert.match(main,/sandbox: true/)
})
