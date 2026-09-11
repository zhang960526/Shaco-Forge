// Technical candidate only. This command cannot accept or close the Owner gate.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { hashFile, jsonBytes, verifyPackagedRuntime, RELEASE_LAYOUT } from '../packages/contracts/dist/packaged-runtime.js'
import { rendererSecurityPreferences } from '../apps/desktop/dist/main/security.js'
import { composition } from './step3-final-composition.mjs'

const evidence = process.env.SHACO_FORGE_PACKAGED_EVIDENCE_ROOT
assert.ok(evidence); await mkdir(evidence, { recursive: true })
const location = JSON.parse(await readFile('dist/packaged-runtime-location.json', 'utf8'))
await verifyPackagedRuntime(location.packagedRoot)
const html = await readFile(join(location.packagedRoot, RELEASE_LAYOUT.client), 'utf8')
const sourceHtml = await readFile('apps/desktop/index.html', 'utf8')
const main = await readFile('apps/desktop/src/main/main.ts', 'utf8')
const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1]
assert.ok(csp && sourceHtml.includes(csp) && main.includes(csp))
assert.ok(csp.includes("script-src 'self' 'unsafe-eval'"))
assert.ok(csp.includes("style-src 'self' 'unsafe-inline'"))
assert.doesNotMatch(csp, /https?:|\*|script-src[^;]*(?:data:|blob:)|style-src[^;]*(?:data:|blob:)/)
assert.equal(rendererSecurityPreferences.nodeIntegration, false)
assert.equal(rendererSecurityPreferences.contextIsolation, true)
assert.equal(rendererSecurityPreferences.sandbox, true)
const applicationPath = 'apps/desktop/.generated-client/static/application.js'
const application = await readFile(applicationPath, 'utf8')
const callbacks = [...application.matchAll(/schema\.callback = new Function\("return " \+ schema\.callback\)\(\)/g)]
const styleTags = [...application.matchAll(/document\.createElement\("style"\)/g)]
assert.ok(callbacks.length > 0 && styleTags.length > 0)
const currentComposition = await composition()
await writeFile(join(evidence, 'F05-TECHNICAL-DISPOSITION-CANDIDATE.json'), jsonBytes({
  technicalDispositionCandidate: 'RESIDUAL_EXCEPTION_REQUIRED', path: 'B',
  securityDisposition: 'PENDING_ARCHITECTURE_OWNER_ACCEPTANCE', status: 'OPEN_KNOWN_CONSTRAINT',
  exactCsp: csp, unsafeEval: 'PRESENT', unsafeInline: 'PRESENT',
  noExternalScriptSource: true, noExternalStyleSource: true,
  rendererIsolation: rendererSecurityPreferences, composition: currentComposition,
  applicationSha256: await hashFile(applicationPath), serializedSchemaCallbackSites: callbacks.length,
  injectedLocalStyleTagSites: styleTags.length,
  investigation: [
    'Removing unsafe-inline as a CSP-only change blocks the Frozen Client plugin style tags, including the UI theme; these tags have no nonce.',
    'Removing unsafe-eval as a CSP-only change prevents Schemastery serialized callback reconstruction. Its caught exception can silently change public Settings schema behavior.',
    'A general code-generation/CSS-extraction rewrite is not a minimal directive change. The candidate preserves the frozen public Client composition and records the smallest existing directive exceptions.',
  ],
  residualRisk: 'A Renderer injection could use dynamic JavaScript evaluation or injected styles within the trusted Renderer origin. Node isolation and external-source restrictions reduce scope but do not close this risk.',
  releaseImpact: 'Architecture Owner disposition is required before Step2 closure or release readiness.',
  requiredRuntimeEvidence: 'Final source-bound packaged runtime smoke and cumulative non-Provider gates must accompany this candidate.',
  ownerAcceptancePerformed: false, frozenHarnessChanged: false, providerRuns: 0, signingRuns: 0,
}), 'utf8')
console.log(jsonBytes({ result: 'TECHNICAL_CANDIDATE_RECORDED', disposition: 'RESIDUAL_EXCEPTION_REQUIRED', ownerAcceptance: 'PENDING' }))
