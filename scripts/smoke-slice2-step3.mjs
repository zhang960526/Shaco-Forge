import {mkdtemp,rm} from 'node:fs/promises'
import {join} from 'node:path'
import {root,verifyFrozen} from './step3-final-composition.mjs'

const evidenceRootKey='SHACO_FORGE_STEP2_EVIDENCE_ROOT'
const callerEvidenceRoot=process.env[evidenceRootKey]
const wrapperEvidenceRoot=callerEvidenceRoot===undefined
  ? await mkdtemp(join(root,'node_modules/.step3-smoke-evidence-'))
  : undefined

if(wrapperEvidenceRoot!==undefined) process.env[evidenceRootKey]=wrapperEvidenceRoot

try {
  await verifyFrozen()
  process.env.SHACO_FORGE_STEP3_MODE='1'
  await import('./smoke-slice2-step2.mjs')
  await verifyFrozen()
} finally {
  if(callerEvidenceRoot===undefined) delete process.env[evidenceRootKey]
  else process.env[evidenceRootKey]=callerEvidenceRoot
  if(wrapperEvidenceRoot!==undefined) await rm(wrapperEvidenceRoot,{recursive:true,force:true})
}
