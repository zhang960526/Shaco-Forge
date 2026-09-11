// Real Product runtime proof; no Provider/Prompt/Tool/Agent execution.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import electron from 'electron'
import { paths } from './runtime-paths.mjs'
import { evidence } from './step2-evidence.mjs'
import { inspectLocalPlatform, lifecycleRequest } from '../apps/desktop/dist/main/lifecycle-client.js'
import { verifyFrozen, composition } from './step3-final-composition.mjs'

assert.equal(process.version, 'v22.19.0')
const frozenRun=!process.argv.includes('--development')
if(frozenRun)await verifyFrozen()
const entryComposition=await composition()
const root = await mkdtemp(join(paths.root, 'node_modules/.full-shaco-visual-'))
const workspace = join(root, 'workspace')
await mkdir(workspace)
const children = []
const authorities = []
const desktopExits = []
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const alive = pid => { try { process.kill(pid, 0); return true } catch (error) { if (error.code === 'ESRCH') return false; throw error } }
async function until(predicate, label, timeout = 15000) {
  const end = Date.now() + timeout
  while (Date.now() < end) { if (await predicate()) return; await delay(150) }
  throw new Error('TEST_TIMEOUT_' + label)
}
async function desktop(index) {
  const child = spawn(electron, [`--user-data-dir=${join(root, 'desktop-' + index)}`, join(paths.desktopRoot, 'test-fixtures/step3-interactions-main.mjs')], {
    env: { ...process.env, SHACO_FORGE_WORKER_NODE:process.execPath, SHACO_FORGE_WORKER_ENTRY:paths.workerEntry,
      SHACO_FORGE_NATIVE_HELPER:paths.nativeHelper, SHACO_FORGE_DSH_HOME:join(root,'harness'),
      SHACO_FORGE_HARNESS_PROFILE_NAME:'shaco-forge-step3-lifecycle-proof', SHACO_FORGE_STEP3_LIFECYCLE_PROOF:'1',
      SHACO_FORGE_STEP2_WORKSPACE:workspace, SHACO_FORGE_FULL_SHACO_VISUAL:index===1?'1':'0' }, windowsHide:true, stdio:['ignore','pipe','pipe','ipc'],
  })
  children.push(child)
  child.stdout.resume()
  let diagnostics = ''
  child.stderr.on('data', data => { diagnostics=(diagnostics+data.toString()).slice(-2000) })
  let ready = false
  let sequence = 0
  const pending = new Map()
  child.on('message', message => {
    if (message.ready) ready = true
    const operation = pending.get(message.id)
    if (operation) {
      pending.delete(message.id); clearTimeout(operation.timer)
      if (message.failure) operation.reject(Object.assign(new Error(message.failure),{details:message.details})); else operation.resolve(message.result)
    }
  })
  child.on('exit', code => {
    desktopExits.push({ code, gpuDiagnostic:/gpu.*(?:crash|unusable)|GPU process/i.test(diagnostics),
      sandboxDiagnostic:/sandbox|access.*denied|permission/i.test(diagnostics),
      ipcDiagnostic:/TEST_PARENT_IPC_REQUIRED/.test(diagnostics) })
    for (const operation of pending.values()) { clearTimeout(operation.timer); operation.reject(new Error('DESKTOP_EARLY_EXIT:' + code)) }
    pending.clear()
  })
  await until(() => {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error('DESKTOP_EARLY_EXIT:' + (child.exitCode ?? child.signalCode)
        + (/gpu.*(?:crash|unusable)|GPU process/i.test(diagnostics) ? ':GPU_DIAGNOSTIC_PRESENT' : ''))
    }
    return ready
  }, 'DESKTOP_IPC', 15000)
  return { child, command:(action,payload) => new Promise((resolve,reject) => {
    const id=++sequence
    const timer=setTimeout(() => {pending.delete(id); reject(new Error('TEST_COMMAND_TIMEOUT_'+action))}, 90000)
    pending.set(id,{resolve,reject,timer}); child.send({id,action,payload})
  }) }
}
function retain(snapshot) {
  if (!authorities.some(authority => authority.worker.pid === snapshot.authority.worker.pid)) authorities.push(snapshot.authority)
  assert.equal(snapshot.recovery.connectionState, 'CONNECTED')
  assert.equal(snapshot.recovery.projectionRebuildComplete, true)
  assert.equal(snapshot.ui.projectionVisible, true)
  assert.equal(snapshot.ui.requireAvailable, false)
  assert.equal(snapshot.ui.processAvailable, false)
  assert.equal(snapshot.forbiddenCalls, 0)
}
function safePending(value) { const {capture,...safe}=value; return safe }
function hostPending(host, kind, sessionHash) {
  assert.equal(host.sessionHash,sessionHash)
  assert.equal(host.exactLiveAgent,true)
  assert.equal(host.rootAgent,true)
  assert.equal(host.states[kind].pending,1)
  assert.equal(host.states[kind].settlements,0)
  assert.equal(host.states[kind].calls,1)
  assert.equal(host.states[kind].failures,0)
  assert.equal(host.cancelCalls,0)
  assert.equal(host.agentExecutionCalls,0)
  assert.equal(host.stepStarts,0)
}
let result='FAIL'
let failure
let failureDetails
let current
let cleanup
const scenarios={}
const visuals=[]
const themeSwitches=[]
const capture=async name=>{const shot=await current.command('visual-capture',{name});visuals.push(shot);assert.equal(shot.ui.forbiddenBrand,false);assert.equal(shot.ui.harnessSeats,0);assert.equal(shot.ui.rootCount,1);assert.equal(shot.ui.sidebarCount,1);assert.equal(shot.ui.horizontalOverflow,false);return shot}
try {
  const platform=await inspectLocalPlatform(paths.nativeHelper)
  assert.equal(platform.mutexExists,false,'NO_PREEXISTING_AUTHORITY_REQUIRED')
  assert.equal(platform.lifecycleBusy,false)
  current=await desktop(1)
  const initial=await current.command('snapshot'); retain(initial)
  await capture('no-project')
  const seeded=await current.command('seed')
  await delay(700)
  await capture('project-blank-chat')
  scenarios.settings=await current.command('verify-shell')
  scenarios.controls=await current.command('controls')
  for (const [index,kind] of ['approval','question'].entries()) {
    await current.command('trigger',{kind})
    const before=await current.command('pending',{kind}); retain(before)
    const hostBefore=await current.command('status'); hostPending(hostBefore,kind,seeded.seeded.sessionHash)
    assert.equal(before.readProof.sessionHash,hostBefore.sessionHash)
    assert.equal(before.ui.selected,true)
    await capture(kind+'-pending')
    themeSwitches.push(await current.command('theme-switch',{name:kind+'-pending'}))
    hostPending(await current.command('status'),kind,hostBefore.sessionHash)
    await evidence(kind+'-real-host-lifecycle.json',{result:'IN_PROGRESS',firstDesktop:safePending(before),hostBefore})
    await current.command('close')
    await until(() => current.child.exitCode!==null,'DESKTOP_CLOSE')
    await delay(700)
    const status=(await lifecycleRequest(paths.nativeHelper,'discover')).status
    for (const role of ['worker','host','helper']) assert.deepEqual(status[role],before.authority[role])
    current=await desktop(index+2)
    const fresh=await current.command('snapshot'); retain(fresh)
    hostPending(await current.command('status'),kind,hostBefore.sessionHash)
    await current.command('open-fixture-session')
    const restored=await current.command('pending',{kind}); retain(restored)
    const hostRestored=await current.command('status'); hostPending(hostRestored,kind,hostBefore.sessionHash)
    assert.equal(restored.authority.workerInstanceIdHash,before.authority.workerInstanceIdHash)
    assert.equal(restored.authority.host.pid,before.authority.host.pid)
    assert.notEqual(restored.clientInstanceIdHash,before.clientInstanceIdHash)
    assert.notEqual(restored.gatewayClientHash,before.gatewayClientHash)
    assert.equal(restored.readProof.sessionHash,hostBefore.sessionHash)
    assert.equal(restored.eventHash,before.eventHash)
    assert.equal(restored.uiResults,0)
    await capture(kind+'-cold-rebuild')
    const outcome={kind:'result',value:kind==='approval'?'allowed-once':{answers:[{id:'review026-choice',selected:['Beta']}]}}
    const stale=await current.command('probe',{...before.capture,outcome})
    assert.equal(stale.ok,false)
    assert.ok(stale.error?.message.includes('no active event stream'),'VALID_ENVELOPE_MUST_FAIL_ON_OLD_CLIENT_IDENTITY')
    hostPending(await current.command('status'),kind,hostBefore.sessionHash)
    const settled=await current.command('settle',{kind})
    assert.equal(settled.host.states[kind].settlements,1)
    const duplicate=await current.command('probe',settled.capture)
    assert.equal(duplicate.ok,true)
    await delay(250)
    const finalHost=await current.command('status')
    const finalDesktop=await current.command('snapshot')
    assert.equal(finalHost.states[kind].settlements,1)
    assert.equal(finalHost.states[kind].pending,0)
    assert.equal(finalHost.cancelCalls,0)
    assert.equal(finalHost.agentExecutionCalls,0)
    assert.equal(finalHost.states[kind].calls,1)
    assert.equal(finalHost.states[kind].failures,0)
    assert.equal(finalDesktop.ui[kind],false)
    if(kind==='approval') {assert.equal(finalHost.approvalDecided,1);assert.equal(finalHost.states[kind].outcome,'allowed-once')}
    else assert.equal(finalHost.states[kind].expectedAnswer,true)
    scenarios[kind]={result:'PASS',kind,firstDesktop:safePending(before),hostBefore,
      disconnectedAuthoritySurvived:true,freshDesktop:safePending(restored),hostRestored,finalHost,finalDesktop,
      staleRejected:true,staleReason:'NO_ACTIVE_EVENT_STREAM',duplicateSafeNoop:true,duplicateDelta:0,implicitCancelDelta:0,automaticAnswerDelta:0,replayDelta:0,
      successPath:'REAL_SHACO_UI_CONTROL_WITH_FROZEN_HARNESS_PUBLIC_PENDING_ANSWER',providerRuns:0}
    await evidence(kind+'-real-host-lifecycle.json',scenarios[kind])
  }
  for(const kind of ['plan','multi']) {
    await current.command('trigger',{kind});await current.command('pending',{kind});await capture(kind+'-pending')
    themeSwitches.push(await current.command('theme-switch',{name:kind+'-pending'}))
    const settled=await current.command('settle',{kind})
    assert.equal(settled.host.states[kind].settlements,1);assert.equal(settled.host.states[kind].expectedAnswer,true)
    scenarios[kind]={result:'PASS',host:settled.host,completeAnswers:true,automaticAnswer:0}
  }
  for(const state of ['streaming','tool','result','error']) {
    await current.command('presentation',{state}); await delay(700)
    const shot=await capture('conversation-'+state)
    if(state==='streaming') {assert.ok(shot.ui.kinds.includes('user'));assert.ok(shot.ui.kinds.includes('assistant-step'))}
    if(state==='tool')assert.ok(shot.ui.tools.includes('running'))
    if(state==='result')assert.ok(shot.ui.tools.includes('settled'))
    if(state==='result')visuals.push(await current.command('expand-tool'))
    if(state==='error')assert.ok(shot.ui.kinds.includes('turn-error'))
  }
  themeSwitches.push(await current.command('theme-switch',{name:'representative'}))
  visuals.push(await current.command('settings-capture'))
  const narrow=await current.command('narrow');visuals.push(narrow);assert.equal(narrow.ui.horizontalOverflow,false)
  const failed=await current.command('fail-closed');visuals.push(failed);assert.equal(failed.ui.forbiddenBrand,false)
  await current.command('presentation',{state:'history'})
  await current.command('close');await until(()=>current.child.exitCode!==null,'HISTORY_DESKTOP_CLOSE')
  current=await desktop(4);retain(await current.command('snapshot'))
  await current.command('open-fixture-session');await delay(700)
  scenarios.history=await current.command('load-older')
  const history=await capture('history-cold-rebuild')
  assert.ok(history.ui.kinds.includes('assistant-step'));assert.ok(history.ui.kinds.includes('turn-error'))
  await current.command('close')
  await until(() => current.child.exitCode!==null,'FINAL_DESKTOP_CLOSE')
  result='PASS'
} catch(error) {failure=error.message;failureDetails=error.details}
finally {
  for(const child of children) if(child.exitCode===null && child.signalCode===null) child.kill('SIGKILL')
  // Desktop may crash while the detached Worker is still building the Host.
  // Discovery is unavailable until ready; allow that bounded startup to finish
  // before declaring cleanup. The initial authority-empty guard precedes spawn.
  if(children.length && !authorities.length) await delay(30000)
  else await delay(700)
  try {
    const status=(await lifecycleRequest(paths.nativeHelper,'discover')).status
    if(status.dshHome===join(root,'harness')) {
      if(!authorities.some(authority=>authority.worker.pid===status.worker.pid)) authorities.push(status)
      await lifecycleRequest(paths.nativeHelper,'stop-authority',status.workerInstanceId)
    }
  } catch {}
  await delay(1200)
  for(const authority of authorities) if(alive(authority.worker.pid)) process.kill(authority.worker.pid,'SIGKILL')
  await until(()=>authorities.every(authority=>['worker','host','helper'].every(role=>!alive(authority[role].pid))),'BOUNDED_CLEANUP')
  cleanup={noOrphan:true,authorityCount:authorities.length,desktopProcessesExited:children.every(child=>child.exitCode!==null||child.signalCode!==null)}
  if(children.length) {
    const platform=await inspectLocalPlatform(paths.nativeHelper)
    cleanup.noOrphan=!platform.mutexExists && !platform.lifecycleBusy
    if(!cleanup.noOrphan) {result='FAIL';failure='TEST_CLEANUP_AUTHORITY_REMAINS'}
  }
  const gates=Object.fromEntries(['APPROVAL','QUESTION','SESSION_BINDING','SINGLE_SETTLEMENT','DUPLICATE_PREVENTION','NO_AUTO_ANSWER','NO_AUTO_REPLAY','DISCONNECT_NOT_CANCEL'].map(name=>['S3G16_'+name,result==='PASS'?'PASS':'NOT_PROVEN']))
  await evidence('full-shaco-results.json',{result,failure,failureDetails,gates,cleanup,desktopExits,providerRuns:0,scenarios,visuals,themeSwitches,composition:entryComposition,finalFrozenComposition:frozenRun})
  console.log(JSON.stringify({result,failure,gates,cleanup,desktopExits,providerRuns:0}))
  for(const child of children) {if(child.connected)child.disconnect();child.unref()}
}
if(result!=='PASS') process.exitCode=1
else { assert.deepEqual(await composition(),entryComposition,'SOURCE_CHANGED_DURING_RUNTIME');if(frozenRun)await verifyFrozen() }
