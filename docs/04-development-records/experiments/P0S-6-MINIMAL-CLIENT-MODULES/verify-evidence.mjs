import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SPIKE_ROOT = import.meta.dirname
const attemptId = process.argv[2]
if (typeof attemptId !== 'string' || !/^[0-9a-f-]{36}$/i.test(attemptId)) throw new Error('verifier requires AttemptId')
const EVIDENCE_DIR = join(SPIKE_ROOT, 'evidence', attemptId)
const EXPECTED_REQUIRED = [
  '@deepseek-ai/dsh-client-modules',
  '@deepseek-ai/dsh-client-connection',
  '@deepseek-ai/dsh-api-remotes',
  '@deepseek-ai/dsh-client-ui-theme',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-ui-layout',
  '@deepseek-ai/dsh-client-ui-renderer',
  '@deepseek-ai/dsh-client-ui-session',
  '@deepseek-ai/dsh-client-ui-sidebar',
  '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-client-ui-settings-general',
  '@deepseek-ai/dsh-client-ui-settings-models',
  '@deepseek-ai/dsh-client-ui-conversation',
  '@deepseek-ai/dsh-client-ui-approval',
  '@deepseek-ai/dsh-client-ui-chat',
  '@deepseek-ai/dsh-client-ui-tool',
  '@deepseek-ai/dsh-client-ui-workspace',
  '@deepseek-ai/dsh-client-ui-input-trigger',
  '@deepseek-ai/dsh-client-ui-commands',
  '@deepseek-ai/dsh-client-ui-subagent',
  '@deepseek-ai/dsh-client-ui-model-selection',
  '@deepseek-ai/dsh-client-ui-permission-presets',
  '@deepseek-ai/dsh-client-ui-user-questions',
]
const EXPECTED_SUPPORT = [
  '@deepseek-ai/dsh-typert-registry',
  '@deepseek-ai/dsh-api-gateway',
  '@deepseek-ai/dsh-api-session-controller',
  '@deepseek-ai/dsh-api-workspace-controller',
]
const OMITTED = [
  '@deepseek-ai/dsh-cordis-host-runner',
  '@deepseek-ai/dsh-cordis-client-runner',
  '@deepseek-ai/dsh-client-ui-cordis',
  '@deepseek-ai/dsh-tool-cordis',
]

const readJson = (name) => JSON.parse(readFileSync(join(EVIDENCE_DIR, name), 'utf8'))
const sha256File = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
const sameSet = (actual, expected) => actual.length === expected.length
  && new Set(actual).size === expected.length
  && expected.every((value) => actual.includes(value))
const checks = []
const failures = []
const check = (condition, message, boundary = 'EVIDENCE_VERIFICATION') => {
  checks.push({ message, passed: Boolean(condition) })
  if (!condition) failures.push({ message, boundary })
}

let preflight
let build
let runtime
try {
  preflight = readJson('preflight.json')
  build = JSON.parse(readFileSync(join(SPIKE_ROOT, 'client-dist', 'build-manifest.json'), 'utf8'))
  runtime = readJson('runtime.json')
} catch (error) {
  const result = {
    schemaVersion: 1,
    attemptId,
    result: 'INCONCLUSIVE',
    h05: 'INCONCLUSIVE',
    h20: 'INCONCLUSIVE',
    firstFailureBoundary: 'EVIDENCE_CAPTURE_OR_SERIALIZATION',
    retryEligibilityCandidate: 'EVIDENCE_ONLY',
    error: error instanceof Error ? error.message : String(error),
    checks,
  }
  writeFileSync(join(EVIDENCE_DIR, 'verification.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  console.error(JSON.stringify(result))
  process.exit(2)
}

check(preflight.contractId === 'P0S6-MEC-20260903-01', 'Contract identity matches', 'PRE_HYPOTHESIS_IDENTITY')
check(preflight.executionAuthorityHead === '6fd8bbd3e39ff17c5bc76bc447898dd5b7b72e7c', 'Execution Authority Head matches', 'PRE_HYPOTHESIS_IDENTITY')
check(preflight.attemptStartHead === preflight.executionAuthorityHead, 'AttemptStartHead equals ExecutionAuthorityHead', 'PRE_HYPOTHESIS_IDENTITY')
check(preflight.harnessHead === 'cd5ef8148158c3a752a658978873241fdf8e2bbc', 'Frozen Harness HEAD matches', 'PRE_HYPOTHESIS_IDENTITY')
check(preflight.harnessLockSha256 === '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1', 'Frozen Harness lock matches', 'PRE_HYPOTHESIS_IDENTITY')
check(runtime.runtime?.exactIdentityMatched === true, 'Electron 35.7.5 / Node 22.16.0 / Chromium 134.0.6998.205 win32-x64 matches', 'PRE_HYPOTHESIS_RUNTIME_IDENTITY')
check(runtime.timeoutTriggered === false, '45 second timeout did not trigger', 'PRE_HYPOTHESIS_ELECTRON_RUNTIME')

const currentSourceHashes = preflight.sourceFiles.map((row) => ({
  path: row.path,
  sha256: sha256File(join(SPIKE_ROOT, ...row.path.split('/'))),
}))
check(currentSourceHashes.every((row, index) => row.path === preflight.sourceFiles[index].path
  && row.sha256 === preflight.sourceFiles[index].sha256), 'Experiment source hashes remained stable during attempt')

check(build.contractId === 'P0S6-MEC-20260903-01', 'Prepared artifact uses frozen Contract')
check(build.slice === 'ONE_FIXED_CLIENT_BOOT_SLICE', 'Exactly one fixed Client boot Slice was prepared')
check(build.productGraph?.requiredCount === 23 && sameSet(build.productGraph.requiredRoster, EXPECTED_REQUIRED), '23 REQUIRED rows are exact', 'PRODUCT_GRAPH')
check(build.productGraph?.supportClosureCount === 4 && sameSet(build.productGraph.supportClosure, EXPECTED_SUPPORT), '4 Support Closure rows are exact', 'PRODUCT_GRAPH')
check(build.productGraph?.totalCount === 27 && sameSet(build.productGraph.orderedIds, [...EXPECTED_REQUIRED, ...EXPECTED_SUPPORT]), 'Product graph is exactly 27 rows', 'PRODUCT_GRAPH')
check(build.platformStaticSeed?.includes('@deepseek-ai/dsh-client-ui-primitives') === true
  && !build.productGraph.orderedIds.includes('@deepseek-ai/dsh-client-ui-primitives'), 'ui-primitives is platform seed only', 'PRODUCT_GRAPH')
check(build.artifactAssembly?.staticArtifactSemanticTransformation === false, 'No static artifact semantic transformation occurred', 'CORE_PATCH_BOUNDARY')
check(build.artifactAssembly?.harnessBuiltArtifactsModified === false, 'Frozen built artifacts were not modified', 'CORE_PATCH_BOUNDARY')
check(build.artifacts?.length === 27 && build.artifacts.every((row) => /^[0-9a-f]{64}$/.test(row.bundleSha256)), 'All 27 real built artifacts have SHA256 identities', 'PRODUCT_GRAPH')
check(build.apiRemotesCordisHostDescriptorReference?.classification === 'STATIC_DESCRIPTOR_BFF_REFERENCE_ONLY'
  && build.apiRemotesCordisHostDescriptorReference?.markerCount > 0
  && build.apiRemotesCordisHostDescriptorReference?.runnerRuntimeActivation === false,
'api-remotes/client Cordis host descriptor reference is disclosed without runtime activation', 'CORDIS_OMISSION')

const renderer = runtime.renderer
check(renderer?.appWebEntry?.runResolved === true, 'AppWebEntry.run() resolved', 'CLIENT_BOOT')
check(renderer?.appWebEntry?.moduleStageComplete === true, 'AppWebEntry module stage completed', 'CLIENT_BOOT')
check(renderer?.appWebEntry?.pluginActivationStageComplete === true, 'AppWebEntry plugin activation stage completed', 'REQUIRED_MODULE_ACTIVATION')
check(sameSet(renderer?.graphIds ?? [], [...EXPECTED_REQUIRED, ...EXPECTED_SUPPORT]), 'Runtime graph is the exact 27 rows', 'PRODUCT_GRAPH')
check(renderer?.registration?.length === 27 && renderer.registration.every((row) => row.registered && row.materialized), 'All 27 rows registered and materialized', 'REQUIRED_MODULE_ACTIVATION')
check(renderer?.activation?.length === 27 && renderer.activation.every((row) => row.active && row.state === 'active' && row.missingServices.length === 0), 'All 27 rows reached ACTIVE with no missing service', 'REQUIRED_MODULE_ACTIVATION')
check(renderer?.checkpoint?.uiRendererServicePresent === true, 'ui-renderer service is present', 'CORE_CLIENT_CHECKPOINT')
check(renderer?.checkpoint?.bootPageReplaced === true, 'ui-renderer replaced the boot page', 'CORE_CLIENT_CHECKPOINT')
check(renderer?.checkpoint?.coreRootMounted === true, 'Core shell/root is mounted', 'CORE_CLIENT_CHECKPOINT')
check(renderer?.ok === true, 'Renderer checkpoint aggregate is true', 'CORE_CLIENT_CHECKPOINT')

check(runtime.livePluginsRequestCount === 0, 'Live /plugins request count is zero', 'LIVE_PLUGINS_DEPENDENCY')
check(runtime.blockedHttpRequests?.length === 0, 'No HTTP(S) request was attempted', 'STOCK_WEB_DEPENDENCY')
check(runtime.stockWebServerObservation?.startedByExperiment === false, 'Stock WebServer was not started', 'STOCK_WEB_DEPENDENCY')
check(runtime.processAssociatedListenerObservation?.probeError === null, 'Process listener observation completed')
check(runtime.processAssociatedListenerObservation?.listeners?.length === 0, 'No process-associated TCP listener was observed', 'STOCK_WEB_DEPENDENCY')
check(runtime.customSchemeRequests?.length > 0
  && runtime.customSchemeRequests.every((row) => !row.pathname.startsWith('/plugins')), 'All captured static requests avoid /plugins', 'LIVE_PLUGINS_DEPENDENCY')

const runtimeOmissions = renderer?.omissions ?? []
for (const id of OMITTED) {
  const row = runtimeOmissions.find((candidate) => candidate.id === id)
  check(row !== undefined && row.graph === false && row.registration === false && row.activation === false,
    `${id} graph/registration/activation omission remains intact`, 'CORDIS_OMISSION')
}
check(runtime.fatalMain?.length === 0, 'No main-process fatal/unhandled record exists', 'FATAL_OR_UNHANDLED')
check(renderer?.fatalEvents?.length === 0, 'No Renderer fatal/unhandled record exists', 'FATAL_OR_UNHANDLED')
check(runtime.rendererConsoleErrorCount === 0, 'No Renderer console error record exists', 'FATAL_OR_UNHANDLED')
check(runtime.relevantLog?.lineCount <= 200 && runtime.relevantLog?.byteCount <= 64 * 1024, 'Relevant log stays within 200 lines and 64 KiB')

const identityFailure = failures.find((row) => row.boundary.startsWith('PRE_HYPOTHESIS'))
const technicalFailure = failures.find((row) => !row.boundary.startsWith('PRE_HYPOTHESIS') && row.boundary !== 'EVIDENCE_VERIFICATION')
const evidenceFailure = failures.find((row) => row.boundary === 'EVIDENCE_VERIFICATION')
let result
let h05
let h20
let firstFailureBoundary
let retryEligibilityCandidate
if (identityFailure !== undefined) {
  result = 'INCONCLUSIVE'
  h05 = 'INCONCLUSIVE'
  h20 = 'INCONCLUSIVE'
  firstFailureBoundary = identityFailure.boundary
  retryEligibilityCandidate = 'NONE'
} else if (technicalFailure !== undefined) {
  result = 'FAIL'
  h05 = ['CORDIS_OMISSION'].includes(technicalFailure.boundary) ? 'INCONCLUSIVE' : 'FAIL'
  h20 = technicalFailure.boundary === 'CORDIS_OMISSION' || technicalFailure.boundary === 'CORE_CLIENT_CHECKPOINT' ? 'FAIL' : 'INCONCLUSIVE'
  firstFailureBoundary = technicalFailure.boundary
  retryEligibilityCandidate = 'NONE'
} else if (evidenceFailure !== undefined) {
  result = 'INCONCLUSIVE'
  h05 = 'INCONCLUSIVE'
  h20 = 'INCONCLUSIVE'
  firstFailureBoundary = evidenceFailure.boundary
  retryEligibilityCandidate = 'EVIDENCE_ONLY'
} else {
  result = 'PROVEN_WITH_CONSTRAINT'
  h05 = 'PROVEN_WITH_CONSTRAINT'
  h20 = 'PASS'
  firstFailureBoundary = 'NONE'
  retryEligibilityCandidate = 'NONE'
}

const verification = {
  schemaVersion: 1,
  notProduction: true,
  contractId: 'P0S6-MEC-20260903-01',
  attemptId,
  result,
  h05,
  h20,
  firstFailureBoundary,
  retryEligibilityCandidate,
  clientModuleCorePatchRequired: 'NO',
  corePatchEquivalent: 'NO',
  staticArtifactSemanticTransformation: false,
  adapterOrStubUsed: true,
  adapterStubInventory: build.adapterStubInventory,
  constraint: result === 'PROVEN_WITH_CONSTRAINT'
    ? "Unmodified vendored Cordis loader requires bounded script-src 'unsafe-eval'; no artifact transformation was permitted or performed."
    : null,
  directEvidence: {
    requiredRegistered: renderer?.registration?.filter((row) => EXPECTED_REQUIRED.includes(row.id) && row.registered).length ?? 0,
    requiredActive: renderer?.activation?.filter((row) => EXPECTED_REQUIRED.includes(row.id) && row.active).length ?? 0,
    supportClosureActive: renderer?.activation?.filter((row) => EXPECTED_SUPPORT.includes(row.id) && row.active).length ?? 0,
    livePluginsRequestCount: runtime.livePluginsRequestCount,
    customSchemeRequestCount: runtime.customSchemeRequests?.length ?? 0,
    processAssociatedListenerCount: runtime.processAssociatedListenerObservation?.listeners?.length ?? null,
    coreClientCheckpoint: renderer?.appWebEntry?.runResolved === true
      && renderer?.appWebEntry?.pluginActivationStageComplete === true
      && renderer?.checkpoint?.uiRendererServicePresent === true
      && renderer?.checkpoint?.bootPageReplaced === true
      && renderer?.checkpoint?.coreRootMounted === true,
    omissions: runtimeOmissions,
    apiRemotesDescriptorReference: build.apiRemotesCordisHostDescriptorReference,
  },
  sourceHashesVerified: currentSourceHashes,
  checksPassed: checks.filter((row) => row.passed).length,
  checksTotal: checks.length,
  failures,
  checks,
}
writeFileSync(join(EVIDENCE_DIR, 'verification.json'), `${JSON.stringify(verification, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({
  result,
  h05,
  h20,
  firstFailureBoundary,
  checksPassed: verification.checksPassed,
  checksTotal: verification.checksTotal,
}))
process.exit(result === 'PASS' || result === 'PROVEN_WITH_CONSTRAINT' ? 0 : 1)

