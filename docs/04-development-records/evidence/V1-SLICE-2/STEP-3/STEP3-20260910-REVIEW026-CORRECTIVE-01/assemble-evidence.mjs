// Run from the Product root only after the complete canonical regression.
// No runtime execution, authority mutation, staging, or commit occurs here.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { verifyFrozen } from '../../../../../../scripts/step3-final-composition.mjs'

const root=process.cwd()
const output=import.meta.dirname
const outputRelative=relative(root,output).replaceAll('\\','/')
const runId=outputRelative.split('/').at(-1)
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
const read=async name=>JSON.parse(await readFile(join(output,name),'utf8'))
const write=async(name,value)=>writeFile(join(output,name),JSON.stringify(value,null,2)+'\n','utf8')
const identity=async path=>{const bytes=await readFile(join(root,path));return {path,bytes:bytes.length,sha256:sha(bytes)}}
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim()
assert.equal(git('rev-parse','HEAD'),'5118053f625d01faba6617cace481df3091ba5be')
assert.equal(git('branch','--show-current'),'master')
assert.equal(git('diff','--cached','--name-only'),'')
const frozen=await verifyFrozen()
const baseline=await read('baseline-preservation.json')
const tests=await read('test-summary.json')
const required=['typecheck','build','test','verify:static','verify:theme','smoke:worker','smoke:carrier','smoke:electron','smoke:slice2-step1','smoke:slice2-step2','smoke:slice2-step3','smoke:slice2-step3-interactions']
const finalCommands=required.map(name=>{
  const command=name==='test'?'pnpm test':'pnpm run '+name
  const row=tests.commands.filter(row=>row.command===command).at(-1)
  assert.equal(row?.exitCode,0,command);assert.equal(row?.result,'PASS',command)
  assert.ok(row.startedAt>=frozen.generatedAt,command+' must follow source freeze')
  return row
})
const interaction=await read('s3g16-results.json')
assert.equal(interaction.result,'PASS');assert.equal(interaction.cleanup.noOrphan,true)
const approval=await read('approval-real-host-lifecycle.json')
const question=await read('question-real-host-lifecycle.json')
for(const scenario of [approval,question]) {
  assert.equal(scenario.result,'PASS');assert.equal(scenario.staleReason,'NO_ACTIVE_EVENT_STREAM')
  assert.equal(scenario.finalHost.states[scenario.kind].settlements,1)
  assert.equal(scenario.finalHost.states[scenario.kind].pending,0)
  assert.equal(scenario.finalHost.cancelCalls,0)
}
const cumulative=await read('cumulative-e2e.json')
assert.equal(cumulative.attempts.find(row=>row.scenario==='STEP2_REGRESSION')?.result,'PASS')
assert.equal(cumulative.attempts.find(row=>row.scenario==='STEP3_CUMULATIVE')?.result,'PASS')
const unitLog=await readFile(join(root,'node_modules/.step2-validation/test.log'),'utf8')
const unitCount=Number([...unitLog.matchAll(/^# tests (\d+)\r?$/gm)].at(-1)?.[1])
assert.equal(unitCount,163)
const regressionRoot=join(root,'node_modules/.step2-validation/step1')
const regression={result:'PASS',commands:finalCommands,unit:{tests:unitCount,pass:unitCount,fail:0},sourceIdentity:await identity(outputRelative+'/composition-identity.json')}
for(const name of ['attachment-sequence.json','authority-identity.json','security-negative-results.json']) {
  const value=JSON.parse(await readFile(join(regressionRoot,name),'utf8'))
  // Retain outcomes without copying raw private runtime authority/paths.
  const outcomes=[]
  const visit=(node)=>{
    if(!node||typeof node!=='object')return
    if(typeof node.result==='string')outcomes.push({result:node.result,...(typeof node.scenario==='string'?{scenario:node.scenario}:{}),...(typeof node.mode==='string'?{mode:node.mode}:{})})
    for(const child of Object.values(node))if(typeof child==='object')visit(child)
  }
  const latest=Object.fromEntries(Object.entries(value).map(([key,items])=>
    [key,Array.isArray(items)&&/attempts$/i.test(key)?items.at(-1):items]))
  visit(latest);regression[name]={outcomes,redacted:true,selection:'Latest appended attempt for each history array; earlier cached attempts excluded'}
}
const electron=JSON.parse(await readFile(join(regressionRoot,'electron-regression.json'),'utf8'))
regression.electron={result:electron.result,version:electron.desktop.electronVersion,cleanup:electron.cleanup.exited,
  appWebEntryCount:electron.renderer.harnessClient.appWebEntryCount,eventsReady:electron.renderer.transport.realEventsReady,
  productOwnedTcpListeners:electron.tcpListenersOwnedByObservedProductProcesses.length}
assert.equal(regression.electron.result,'PASS')
await write('regression-summary.json',regression)
const findings={source:'Architecture Owner REVIEW-026 corrective request supplied by the user in this task',
  REVIEW_026:'FAIL',FINAL_STATE:'FAIL_REQUIRES_CORRECTIVE',findings:[
    {id:'F-026-01',severity:'HIGH',status:'OPEN_BLOCKING',meaning:'Original S3G16 SSR/public-bundle/self-created service fixture did not prove real Host pending recovery, Session binding and exactly-once settlement across Desktop disconnect/reconnect/cold rebuild.'},
    {id:'F-026-02',severity:'HIGH',status:'OPEN_REVIEW_REPRODUCTION_GAP',observed:{'smoke:electron':'ENVIRONMENT_BLOCKED','smoke:slice2-step1':'ENVIRONMENT_BLOCKED','smoke:slice2-step2':'ENVIRONMENT_BLOCKED','smoke:slice2-step3':'NOT_EXECUTED / ENVIRONMENT_BLOCKED'},productDefect:'NOT_ESTABLISHED'},
  ],corrective:'APPLIED_WAITING_INDEPENDENT_REREVIEW',findingClosureAuthority:'REVIEW-026B only',rereviewPerformed:false}
await write('review026-findings.json',findings)
const history=[
  {id:'F01',category:'TEST_FIXTURE',problem:'Early Desktop crash can precede detached Worker readiness; original cleanup claimed no orphan too early',rootCause:'Discovery was checked before Host readiness; late-start Worker was then observed',fix:'Wait bounded startup when no authority snapshot exists, verify the final authority-empty state, release test IPC',cycles:1,result:'PASS; initial false cleanup claim retained and explicitly corrected in focused-attempt-01.json'},
  {id:'F02',category:'TEST_FIXTURE',problem:'Fresh Desktop Approval UI wait timed out after first Desktop succeeded',rootCause:'Fresh user-data directory has no persisted Harness current Session; test omitted Session open',fix:'Click the sole real Sidebar Session after cold Workspace/Session roster rebuild; keep a redacted failure snapshot',cycles:1,result:'PASS'},
  {id:'F03',category:'TEST_FIXTURE',problem:'A preliminary PASS only checked stale reply ok=false, using outcome.result instead of outcome.value',rootCause:'Negative test could confuse malformed envelope rejection with old-generation rejection',fix:'Use the frozen transport valid shape and require no-active-event-stream rejection; add profile isolation tests and final source/identity fencing',cycles:1,result:'PASS; preliminary PASS retained as superseded in focused-attempt-03.json'},
]
tests.result='PASS'
tests.finalCommands=finalCommands
tests.unit={tests:unitCount,pass:unitCount,fail:0,skipped:0}
tests.correctiveHistory=history
tests.budget={realHostFixture:{cyclesUsed:3,maxCycles:3,approachesUsed:1,maxApproaches:2},runtimeEnvironment:{cyclesUsed:2,maxCycles:2},productDefectCorrective:{strategiesUsed:0,sourceCyclesUsed:0},unchangedFinalConfirmationReruns:1}
tests.adHocPreflightFailure={command:'Pinned pnpm direct invocation before canonical wrapper',exitCode:1,reason:'node not resolved by child PATH; no Desktop or Host started',retained:true}
tests.evidenceAssembly={initialExitCode:1,reason:'Sandbox Git ownership check on read-only Frozen Harness during final preservation verification',correction:'Command-scoped safe.directory for the exact known Harness path; no global Git configuration or Harness bytes changed',runtimeRerun:false,finalResult:'PASS'}
await write('test-summary.json',tests)
const environment=await read('environment-classification.json')
environment.status='PASS'
environment.REVIEW_026_GPU_FAILURE='REVIEW_ENVIRONMENT_SPECIFIC_NOT_REPRODUCED'
environment.REVIEW_026_POWERSHELL_FAILURE='REVIEW_ENVIRONMENT_SPECIFIC_NOT_REPRODUCED'
environment.normalGpuArguments=true
environment.productDefaultGpuUnchanged=true
environment.powerShell.fixtureApiProbe='PASS'
environment.runtimeCommands=finalCommands.filter(row=>row.command.includes('smoke:'))
await write('environment-classification.json',environment)
const fixtureFiles=['apps/worker/src/profile.ts','apps/worker/test-fixtures/step3-interactions.mjs','apps/desktop/test-fixtures/step3-interactions-main.mjs','scripts/smoke-slice2-step3-interactions.mjs','scripts/step3-fixture-boundaries.test.mjs']
const clientFiles=['apps/desktop/src/client/recovery.mjs','apps/desktop/src/client/shell-state.mjs','apps/desktop/src/client/sidebar.mjs','apps/desktop/src/client/settings.mjs']
for(const path of clientFiles) assert.doesNotMatch(await readFile(join(root,path),'utf8'),/eventId|@deepseek-ai\/dsh-(?:api-)?gateway/)
const observer='apps/desktop/src/renderer/user-loop-evidence.ts'
assert.equal(sha(await readFile(join(root,observer))),sha(execFileSync('git',['show','HEAD:'+observer],{cwd:root})))
await write('host-interaction-fixture-identity.json',{
  classification:'NOT_PRODUCTION_TEST_ONLY_HOST_INTERACTION_FIXTURE',files:await Promise.all(fixtureFiles.map(identity)),
  mount:{profileName:'shaco-forge-step3-lifecycle-proof',environmentFlag:'SHACO_FORGE_STEP3_LIFECYCLE_PROOF=1',bothRequired:true},
  route:'shacoStep3TestOnly/{ensure,trigger,status}',defaultProfileContainsRoute:false,
  defaultIsolationProof:'Actual materializeHarnessProfile tested across default, flag-only, profile-only and double opt-in; no export, patch entry or fixture module in any disabled case.',
  hostServices:['sessionController.resolveAgent','agents.get','agents.roots','approval.request','userQuestions.ask'],
  agentCreation:'Real native-picker/New Chat Harness session.create supplies the Session; test fixture ensures that exact registered live root Agent. Both scenarios use the same real Session.',
  pendingTruth:'Outstanding real Host service Promise and real Gateway waterfall; fixture counters only measure request/settlement, do not resolve or recreate pending.',
  auditEnclosure:'Approval requires turn/start and turn/end audit records. No Agent driver is started, no message is enqueued, no step/Tool/Provider runs.',
  sessionHash:approval.hostBefore.sessionHash,successSettlement:'Real Frozen rendered Approval and Question controls in embedded Main Workspace',
  staleDuplicateDriver:'NOT_PRODUCTION_TEST_DRIVER_ONLY; internal client/event envelopes remain in parent/child IPC memory; only hashes and booleans persisted',
  defaultProductDoesNotLoadDriver:true,clientRowPrivateGatewayImports:false,clientRowEventIdDependency:false,
  existingObservationOnlyIdReads:{path:observer,unchangedFromHead:true,scope:'Existing passive bounded evidence observer; no Product UI/navigation/settlement dependency introduced'},
  productFunctionalCorrective:false,providerRuns:0,
})
cumulative.result='PASS'
cumulative.finalSourceIdentity=await identity(outputRelative+'/composition-identity.json')
cumulative.adjacentRealHostSuite={result:'PASS',approval:'approval-real-host-lifecycle.json',question:'question-real-host-lifecycle.json',gates:'s3g16-results.json',sameFinalSource:true,sameFinalComposition:true,realProductWorkerHostCarrierDesktop:true,providerRuns:0}
cumulative.completeCoverage=['startup','Worker authority','Carrier','CONNECTED','composition','Sidebar','Project Directory','Native Picker','Workspace create/open','New Chat','Session open','Settings','real Approval pending','Desktop disconnect','same Worker reconnect','cold projection','Session open/binding','Approval restored','single UI settlement','real Question pending','Desktop disconnect','same Worker reconnect','Question restored','single UI settlement','stale and duplicate rejection/no-op','no auto answer/replay/cancel','graceful close','crash survival','Carrier recovery','Worker replacement','bounded cleanup']
await write('cumulative-e2e.json',cumulative)
const recordPath='docs/04-development-records/V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-IMPLEMENTATION-RECORD.md'
const recordBytes=await readFile(join(root,recordPath))
const originalRecord=baseline.original.find(row=>row.path===recordPath)
assert.equal(sha(recordBytes.subarray(0,originalRecord.bytes)),originalRecord.sha256)
new TextDecoder('utf-8',{fatal:true}).decode(recordBytes)
const record=recordBytes.toString('utf8')
const addition=[
  '', '## Architecture Owner Authorized REVIEW-026 Corrective', '',
  'Corrective result: PASS. State: IMPLEMENTED_WAITING_INDEPENDENT_REREVIEW. REVIEW-026 remains FAIL / FAIL_REQUIRES_CORRECTIVE. F-026-01 remains HIGH / OPEN_BLOCKING; F-026-02 remains HIGH / OPEN_REVIEW_REPRODUCTION_GAP, with PRODUCT_DEFECT = NOT_ESTABLISHED. Only independent REVIEW-026B can close these findings; it has not been executed.', '',
  'The original Implementation PASS, C01-C08, S3G16 STRUCTURAL_FIXTURE limitation and original 36-path Evidence above are retained as historical claims. They are not retroactively promoted to real Host lifecycle proof. REVIEW-026 was supplied as the Architecture Owner corrective input; no separate REVIEW-026 audit file existed in this baseline.', '',
  `New evidence: [${runId}](evidence/V1-SLICE-2/STEP-3/${runId}/run-manifest.json).`, '',
  'The fixture is loaded only when the exact test profile and explicit lifecycle flag are both present. The actual profile materializer passes all four isolation cases; the default profile contains no test fixture export/module/patch entry. Host calls resolveAgent for the existing real Harness New Chat Session and verifies the exact registered live root Agent. It invokes approval.request and userQuestions.ask directly. Approval uses the required public Session audit enclosure, with zero Agent-driver starts, Prompt, Tool, step or Provider execution. This is test profile integration, not a Product functional corrective.', '',
  'For each interaction a real first Desktop displays the frozen Harness UI, then closes without answering. Worker/Host/Helper PID/start identity survives. A fresh Electron process and fresh AppWebEntry with fresh user-data rebuild Workspace/Session projections; the driver selects the sole real Session through Sidebar. Session/event hashes match, the client identities change, and Host pending stays 1 with settlement 0. Real Harness UI settles once; a valid old-client envelope is rejected specifically because its event stream no longer exists; duplicate current result is a safe no-op. Final Host pending is 0, settlement is exactly 1, cancel/automatic-answer/replay deltas are 0. Approval and Question have independent records.', '',
  'Internal envelope observation/probes exist only in NOT_PRODUCTION_TEST_DRIVER_ONLY and remain in IPC memory. The Shaco client row has no eventId dependency or private Gateway import. The pre-existing passive user-loop evidence observer still reads transport correlation IDs, is byte-identical to HEAD, and is disclosed separately; it performs no navigation or settlement and was not extended by this corrective.', '',
  'Node 22.19.0, pnpm 11.7.0, .NET 10.0.302 and Electron 35.7.5 were used. Get-Command pwsh resolved PowerShell 7.6.5.0; the path was passed explicitly through SHACO_FORGE_POWERSHELL and is recorded only as environment provenance. Sandbox early exit 2147483651 is retained; normal GPU startup succeeds in the compatible desktop environment. Both REVIEW_026_GPU_FAILURE and REVIEW_026_POWERSHELL_FAILURE are REVIEW_ENVIRONMENT_SPECIFIC_NOT_REPRODUCED in that environment; PRODUCT_DEFECT remains NOT_ESTABLISHED.', '',
  'All 12 required canonical commands pass on the final source, including 163 tests, Step1 full regression, Step2 recovery, Step3 dedicated/cumulative gates and the adjacent real Host lifecycle suite. The final lifecycle invocation is the one unchanged-source confirmation. The cumulative suite also retains graceful close, Desktop crash survival, Carrier recovery, Worker replacement and bounded cleanup. No Step1/Step2 test was weakened.', '',
  'Composition hashes and 29 rows are exactly unchanged. A new final source inventory was captured before final focused/runtime acceptance; build/test regeneration was then checked against that identity before and after Step3 and lifecycle acceptance. The new source inventory is distinct from the preserved original one; the original Evidence was never frozen over or rewritten.', '',
  'Budget: Host fixture 3/3 corrective cycles, 1/2 approaches; environment 2/2 cycles; Product functional corrective 0 strategies / 0 source cycles. F01 repaired a premature cleanup claim/startup race; F02 added missing Session opening in a fresh user-data directory; F03 corrected and tightened the stale-envelope test. E01 selected the existing normalized pinned command wrapper; E02 used the compatible desktop execution environment. A pre-existing canonical smoke orphan was verified by exact process identity/dead parent and gracefully stopped. All failed and superseded attempts are retained in new Evidence.', '',
  'Original Step3 Evidence 36/36, frozen authorities 74/74 and historical proof sources 3/3 are exact matches. Frozen Harness remains clean at cd5ef8148158c3a752a658978873241fdf8e2bbc. All modified text remains UTF-8 without BOM and passes the mojibake scan. Provider runs = 0; Stage / Commit / Push = NO. Process cleanup = PASS.', '',
  'NEXT_ACTION = INDEPENDENT_REREVIEW_V1_SLICE_2_STEP3_REVIEW_026_CORRECTIVE', '',
].join('\n')
const expectedRecord=recordBytes.subarray(0,originalRecord.bytes).toString('utf8')+addition
if(record.includes('## Architecture Owner Authorized REVIEW-026 Corrective'))assert.equal(record,expectedRecord,'Existing corrective append must match exactly')
else await writeFile(join(root,recordPath),expectedRecord,'utf8')

const fields={V1_SLICE_2_STEP3_IMPLEMENTATION_RESULT:'PASS',V1_SLICE_2_STEP3_REVIEW_026:'FAIL',
  V1_SLICE_2_STEP3_REVIEW_026_BLOCKING_FINDINGS:'F-026-01_S3G16_NOT_PROVEN, F-026-02_INDEPENDENT_RUNTIME_ENVIRONMENT_BLOCKED',
  V1_SLICE_2_STEP3_REVIEW_026_CORRECTIVE:'APPLIED_WAITING_INDEPENDENT_REREVIEW',
  V1_SLICE_2_STEP3_S3G16_REAL_HOST_LIFECYCLE:'PASS',V1_SLICE_2_STEP3_COMPATIBLE_ENV_CUMULATIVE_E2E:'PASS',
  V1_SLICE_2_STEP3:'IMPLEMENTED_WAITING_INDEPENDENT_REREVIEW',V1_SLICE_2_STEP3_IMPLEMENTATION_AUTHORIZATION:'CONSUMED',
  PROVIDER_GATE_AUTHORIZATION:'NO',V1_CURRENT_STEP:'V1_SLICE_2_STEP3_REVIEW_026_CORRECTIVE_APPLIED_WAITING_REREVIEW',
  V1_CURRENT_NEXT_ACTION:'INDEPENDENT_REREVIEW_V1_SLICE_2_STEP3_REVIEW_026_CORRECTIVE'}
const governance=['docs/00-governance/SHACO-FORGE-CURRENT-STATE.md','docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md','docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md','docs/04-development-records/DEVELOPMENT-LOG.md']
for(const path of governance) {
  const bytes=await readFile(join(root,path));new TextDecoder('utf-8',{fatal:true}).decode(bytes)
  if(bytes.toString('utf8').includes('> Current REVIEW-026 corrective checkpoint')) {
    for(const [key,value] of Object.entries(fields))assert.ok(bytes.toString('utf8').includes(key+' = '+value))
    continue
  }
  assert.equal(sha(bytes),baseline.original.find(row=>row.path===path).sha256)
  let text=bytes.toString('utf8')
  const historicalMarker='## 2026-09-10 - Step3 implementation candidate'
  const start=text.indexOf(historicalMarker)
  const end=start>=0?text.indexOf('\n## ',start+historicalMarker.length):-1
  let historical=''
  if(start>=0) {
    const stop=end<0?text.length:end
    historical=text.slice(start,stop).replace(historicalMarker,'## Historical 2026-09-10 - Original Step3 implementation candidate')
    text=text.slice(0,start)+'@@REVIEW026_ORIGINAL_CHECKPOINT@@'+text.slice(stop)
  }
  text=text.replaceAll('V1_SLICE_2_STEP3_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW',fields.V1_CURRENT_STEP)
    .replaceAll('INDEPENDENT_REVIEW_V1_SLICE_2_STEP3_IMPLEMENTATION',fields.V1_CURRENT_NEXT_ACTION)
    .replaceAll('V1_SLICE_2_STEP3 = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW','V1_SLICE_2_STEP3 = '+fields.V1_SLICE_2_STEP3)
    .replaceAll('Step3 is `IMPLEMENTED_WAITING_INDEPENDENT_REVIEW`','Step3 is `'+fields.V1_SLICE_2_STEP3+'`')
    .replaceAll('Step3 IMPLEMENTED_WAITING_INDEPENDENT_REVIEW','Step3 '+fields.V1_SLICE_2_STEP3)
  text=text.replace('Implementation and final validation are complete; Independent Review has not been performed.',
    'REVIEW-026 remains FAIL with F-026-01 and F-026-02 open. Its authorized corrective and final validation are complete; independent corrective re-review is pending.')
  text=text.split('\n').map(line=>/Step3|STEP_3|implementation candidate/.test(line)
    ? line.replaceAll('awaiting Independent Review','awaiting independent corrective re-review').replaceAll('awaits Independent Review','awaits independent corrective re-review')
    : line).join('\n')
  if(historical)text=text.replace('@@REVIEW026_ORIGINAL_CHECKPOINT@@',historical)
  const recordLink=relative(resolve(root,path,'..'),join(root,recordPath)).replaceAll('\\','/')
  const manifestLink=relative(resolve(root,path,'..'),join(output,'run-manifest.json')).replaceAll('\\','/')
  const block=[
    '> Current REVIEW-026 corrective checkpoint (2026-09-10): Architecture Owner authorized this bounded corrective in the task input.',
    '> REVIEW-026 remains `FAIL / FAIL_REQUIRES_CORRECTIVE`. F-026-01 remains `HIGH / OPEN_BLOCKING`; F-026-02 remains `HIGH / OPEN_REVIEW_REPRODUCTION_GAP`; `PRODUCT_DEFECT = NOT_ESTABLISHED`.',
    '> Real Host Approval/Question lifecycle, compatible-environment cumulative E2E and all final-source regression commands are PASS. Corrective is `APPLIED_WAITING_INDEPENDENT_REREVIEW`; only REVIEW-026B may close the findings.',
    `> [Corrective Implementation Record](${recordLink}) · [New Evidence](${manifestLink}). Original implementation Evidence and structural-fixture limitation remain historical and unchanged.`,
    '', '```text',...Object.entries(fields).map(([key,value])=>key+' = '+value),'```','',
  ].join('\n')
  const firstBreak=text.indexOf('\n\n')
  text=text.slice(0,firstBreak+2)+block+'\n'+text.slice(firstBreak+2)
  await writeFile(join(root,path),text,'utf8')
}

const preserved=[]
for(const before of [...baseline.immutable,...baseline.historical]) {const after=await identity(before.path);assert.deepEqual(after,before);preserved.push(after)}
const candidate=[]
for(const before of baseline.original) {const after=await identity(before.path);candidate.push({path:before.path,before,after,exactMatch:before.sha256===after.sha256&&before.bytes===after.bytes})}
const originalEvidence=candidate.filter(row=>row.path.includes('/STEP3-20260910-IMPLEMENTATION-01/'))
assert.equal(originalEvidence.length,36);assert.ok(originalEvidence.every(row=>row.exactMatch))
const harnessRoot=process.env.SHACO_FORGE_HARNESS_ROOT
assert.ok(harnessRoot)
assert.equal(execFileSync('git',['-c','safe.directory='+harnessRoot,'rev-parse','HEAD'],{cwd:harnessRoot,encoding:'utf8'}).trim(),'cd5ef8148158c3a752a658978873241fdf8e2bbc')
assert.equal(execFileSync('git',['-c','safe.directory='+harnessRoot,'status','--porcelain=v1','--untracked-files=all'],{cwd:harnessRoot,encoding:'utf8'}).trim(),'')
await write('preservation-and-changes.json',{result:'PASS',originalCandidateCount:67,originalEvidenceExactMatches:36,frozenAuthoritiesExactMatches:74,historicalSourcesExactMatches:3,candidate,preserved,harness:'CLEAN'})
const changedRows=execFileSync('git',['status','--porcelain=v1','--untracked-files=all','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)
const bad=['\uFFFD','\u953F\u65A4\u62F7','\u00C3','\u00C2']
for(const row of changedRows) {
  const path=row.slice(3)
  if(!/\.(?:ts|cts|mjs|js|json|md|html|css|vue|wxml|wxss|java|xml|sql)$/.test(path))continue
  const bytes=await readFile(join(root,path));const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes)
  for(const marker of bad)assert.ok(!text.includes(marker),'MOJIBAKE:'+path)
}
await write('redaction-summary.json',{result:'PASS',strictUtf8AndMojibakeScan:'PASS',originalEncodingPreserved:true,newFilesUtf8WithoutBom:true,
  rawCredentials:false,secretValues:false,privateWorkspacePaths:false,userChatContent:false,hmacProof:false,exactPrivateCarrierEndpoint:false,rawInternalEventId:false,
  sessionAndWorkspaceIdentity:'SHA-256 only',powerShellExecutable:'Explicitly required environment provenance; not a canonical Product identity',
  internalTransportEnvelopes:'IPC memory only; not persisted',providerRuns:0})
// Reserve final files before counting; the manifest's own hash is external.
await write('run-manifest.json',{state:'ASSEMBLY_PENDING'})
await write('changed-paths.json',{state:'ASSEMBLY_PENDING'})
const finalRows=execFileSync('git',['status','--porcelain=v1','--untracked-files=all','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)
const finalGit={changedPaths:finalRows.length,tracked:finalRows.filter(row=>row.startsWith(' M ')).length,
  untracked:finalRows.filter(row=>row.startsWith('?? ')).length,staged:'NONE',commit:false,push:false}
await write('changed-paths.json',{...finalGit,paths:finalRows.map(row=>({status:row.slice(0,2),path:row.slice(3)}))})
const files=await readdir(output)
const artifacts=await Promise.all(files.filter(name=>name!=='run-manifest.json').sort().map(name=>identity(outputRelative+'/'+name)))
const manifest={runId,result:'PASS',CORRECTIVE_RESULT:'PASS',completedAt:new Date().toISOString(),
  baseline:{branch:'master',head:baseline.head,initialCandidate:baseline.counts,frozenHarness:'CLEAN',harnessHead:'cd5ef8148158c3a752a658978873241fdf8e2bbc',contractSha256:'6cad09319e8793c4cebf95c4dfae4cd04f644adbed1b0c51647e93901e42721b'},
  REVIEW_026:'FAIL',corrective:'APPLIED_WAITING_INDEPENDENT_REREVIEW',state:'IMPLEMENTED_WAITING_INDEPENDENT_REREVIEW',
  nextAction:fields.V1_CURRENT_NEXT_ACTION,findingsClosed:false,rereviewPerformed:false,ownerClosurePerformed:false,
  gates:interaction.gates,STEP1_REGRESSION:'PASS',STEP2_RECOVERY_REGRESSION:'PASS',STEP3_DEDICATED_GATES:'PASS',CUMULATIVE_NON_PROVIDER_E2E:'PASS',
  composition:{changed:false,sourceInventoryUpdated:true,generatedAt:frozen.generatedAt,shacoSha256:frozen.identity.rows.at(-1).sha256,graphRevision:frozen.identity.graphRevision,manifestSha256:frozen.identity.manifestSha256,bootstrapSha256:frozen.identity.bootstrapSha256,applicationSha256:frozen.identity.applicationSha256},
  testSummary:'test-summary.json',budget:tests.budget,implementationRecord:await identity(recordPath),governance:await Promise.all(governance.map(identity)),artifacts,
  originalEvidence:'36/36 EXACT_MATCH',frozenAuthorities:'74/74 EXACT_MATCH',historicalSources:'3/3 EXACT_MATCH',
  providerRuns:0,cleanup:interaction.cleanup,git:finalGit,
  selfIdentity:'The manifest excludes its own recursive hash; its final path/bytes/SHA-256 are returned by this script and in the task response.'}
await write('run-manifest.json',manifest)
console.log(JSON.stringify({result:'PASS',manifest:await identity(outputRelative+'/run-manifest.json'),implementationRecord:manifest.implementationRecord,artifacts:artifacts.length},null,2))
