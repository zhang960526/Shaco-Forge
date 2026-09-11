import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {join} from 'node:path'
import {sha256,frozenRoster,validateComposition} from '../apps/desktop/scripts/composition-identity.mjs'
export const root=join(import.meta.dirname,'..')
export const evidenceRoot=process.env.SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT??join(root,'docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026-CORRECTIVE-01')
export async function composition() {
  const base=join(root,'apps/desktop/.generated-client')
  const manifestBytes=await readFile(join(base,'harness-client-manifest.json'))
  const manifest=JSON.parse(manifestBytes)
  const graph=JSON.parse(await readFile(join(base,'composition-graph.json')))
  const bootstrap=await readFile(join(base,'static/bootstrap.js'))
  const application=await readFile(join(base,'static/application.js'))
  const pins=frozenRoster(await readFile(join(root,'docs/03-v1.0-plan/V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-CONTRACT-GATE.md')))
  const rows=graph.entries.map((row,i)=>({...row,publicExport:manifest.artifacts[i].publicExport,bundleSha256:manifest.artifacts[i].sha256}))
  validateComposition(rows,graph,pins,[bootstrap,application])
  assert.equal(sha256(bootstrap),manifest.generated.bootstrapSha256)
  assert.equal(sha256(application),manifest.generated.applicationSha256)
  assert.ok(!manifestBytes.includes('sourcePackagePath'))
  const files=execFileSync(process.env.SHACO_FORGE_GIT??'git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root}).toString('utf8').split('\0').filter(p=>p&&(/^(apps|packages|scripts)\//.test(p)||p==='package.json')).sort()
  const source=[]
  for(const path of files) source.push({path,sha256:sha256(await readFile(join(root,path)))})
  return {state:'FROZEN',graphRevision:graph.rev,totalRows:29,rows:manifest.artifacts,manifestSha256:sha256(manifestBytes),bootstrapSha256:sha256(bootstrap),applicationSha256:sha256(application),source}
}
export async function verifyFrozen() {
  const frozen=JSON.parse(await readFile(join(evidenceRoot,'composition-identity.json')))
  assert.deepEqual(await composition(),frozen.identity,'SOURCE_OR_COMPOSITION_CHANGED_REGENERATE_BEFORE_RUNTIME')
  return frozen
}
if(process.argv.includes('--freeze')) {
  const identity=await composition()
  await mkdir(evidenceRoot,{recursive:true})
  const history=await readFile(join(evidenceRoot,'composition-history.json'),'utf8').then(JSON.parse).catch(()=>[])
  const entry={generatedAt:new Date().toISOString(),identity}
  history.push(entry)
  await writeFile(join(evidenceRoot,'composition-history.json'),JSON.stringify(history,null,2)+'\n','utf8')
  await writeFile(join(evidenceRoot,'composition-identity.json'),JSON.stringify(entry,null,2)+'\n','utf8')
  console.log('S3G02 CONTROLLED_FINAL_COMPOSITION_GENERATION FROZEN')
}
