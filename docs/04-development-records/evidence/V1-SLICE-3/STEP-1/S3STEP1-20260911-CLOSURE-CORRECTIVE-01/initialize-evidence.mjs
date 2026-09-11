import assert from 'node:assert/strict'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { resolve, relative, dirname } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../..')
const evidence = import.meta.dirname
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const utf8 = bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes)
const json = value => JSON.stringify(value, null, 2) + '\n'
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
assert.equal(git(['rev-parse', 'HEAD']), 'bdf0cbfeade58ae288ece1b8b94ba5c91346c97a')
const review = 'docs/05-reviews/architecture/AUDIT-029-V1-SLICE-3-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md'
assert.ok(!(await readdir(resolve(root, 'docs/05-reviews/architecture'))).some(name => name.startsWith('AUDIT-029')))
await writeFile(resolve(root, review), `# REVIEW-029 - V1-SLICE-3 Step1 Independent Implementation Review

Review Source: OWNER_SUPPLIED_INLINE_REVIEW_TRANSCRIPT

Reviewer: DeepSeek Harness

Reviewer Mode: READ_ONLY

This record faithfully persists the Architecture Owner's supplied review summary.
The Executor did not execute this review. No external run ID, artifact SHA,
reviewer-local output path or execution log was supplied or is invented here.

\x60\x60\x60text
REVIEW_VERDICT = FAIL
FIRST_FAILURE_BOUNDARY = PACKAGE_CONTENT_CLOSURE
BLOCKING_FINDINGS = S3S1-IR-001
S3S1_IR_001_SEVERITY = HIGH
S3S1_IR_001_BLOCKING = YES
READY_FOR_ARCHITECTURE_OWNER_STEP1_CLOSURE_ASSESSMENT = NO
STEP2_AUTHORIZATION_RECOMMENDATION = NOT_YET / OWNER_CLOSURE_REQUIRED_FIRST
\x60\x60\x60

The reviewed original candidate is bdf0cbfeade58ae288ece1b8b94ba5c91346c97a,
entered from 19f200851c47d5ce1b93026e07d88a6d583ef7f5. Its historical artifact
digest is 679a92171c047f70b4d607d066f922ec0153d3f516a2fafbef9198d41ab7c2aa.
Original evidence S3STEP1-20260911-FOUNDATION-01 remains unchanged.

## Sole blocking finding: S3S1-IR-001

scripts/package-runtime.mjs first enumerates every non-symlink top-level package
in runtime-overlay/node_modules and materializes all of them, then adds recursive
dependencies. It does not compute a closure from actual dsh and shaco-forge
production roots. The Reviewer measured approximately 803 packages, with about
312 unreachable packages and about 908 MB of unreachable content. These are
Reviewer-supplied measurements, not corrective acceptance constants.

The Reviewer identified @vitest/coverage-v8, vitest,
@deepseek-ai/dsh-agent-loop-testkit and unrelated SDK assets. The Owner's separate
read-only MCP check confirmed coverage-v8 and the testkit in packaged-files.json
and confirmed the copy-all-overlay algorithm. The corrective must derive actual
production roots, traverse dependencies, applicable optionalDependencies and
required peerDependencies, fail closed on required resolution/identity failure,
materialize only the closure and produce auditable graph/content evidence.
All 18 final gates must run again on the corrective source identity.

## Other accepted review conclusions

\x60\x60\x60text
GIT_IDENTITY_VERDICT = PASS
FROZEN_CONTRACT_IDENTITY_VERDICT = PASS
SOURCE_INVENTORY_TO_CANDIDATE_COMMIT_VERDICT = PASS
PACKAGING_TOOL_VERDICT = PASS
BUNDLED_NODE_VERDICT = PASS
PACKAGED_HARNESS_IDENTITY = PASS
PRODUCTION_PROFILE_VERDICT = PASS
CONTROLLED_DSH_HOME_VERDICT = PASS
RELEASE_MANIFEST_VERDICT = PASS
ARTIFACT_INTEGRITY_FOUNDATION_VERDICT = PASS
NF1_REVIEW_DISPOSITION = READY_FOR_OWNER_CLOSURE
NF3_REVIEW_DISPOSITION = READY_FOR_OWNER_CLOSURE
NF4_BOUNDARY_VERDICT = PASS
F05_BOUNDARY_VERDICT = PASS
STEP2_STEP3_SCOPE_CREEP_VERDICT = PASS
CUMULATIVE_REGRESSION_VERDICT = PASS
FAILED_ATTEMPT_HISTORY_VERDICT = PASS
CLEANUP_VERDICT = PASS
PROVIDER_RUNS = 0
SIGNING_RUNS = 0
\x60\x60\x60

## Owner corrective authorization

The Owner accepts S3S1-IR-001 as VALID_BLOCKING_FINDING / CORRECTIVE_AUTHORIZED.
This does not close Step1 or NF-1/NF-3, freeze its baseline or authorize Step2,
Step3, Provider or Signing. Successful Executor correction must stop at
CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW. The historical FAIL is retained;
the Executor must not conduct the targeted independent re-review.
`, 'utf8')
const governance = ['docs/00-governance/SHACO-FORGE-CURRENT-STATE.md', 'docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md', 'docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md', 'docs/04-development-records/DEVELOPMENT-LOG.md', 'docs/05-reviews/REVIEW-INDEX.md', 'docs/07-handover/CURRENT-CHECKPOINT.md']
const originalEncodings = []
for (const path of governance) {
  const bytes = await readFile(resolve(root, path))
  const text = utf8(bytes)
  assert.ok(!bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])))
  assert.doesNotMatch(text, /\uFFFD|\u953F\u65A4\u62F7|\u00C3|\u00C2/)
  originalEncodings.push({ path, encoding: 'UTF8_WITHOUT_BOM', sha256: hash(bytes), crlf: text.includes('\r\n') })
  const link = relative(dirname(resolve(root, path)), resolve(root, review)).replaceAll('\\', '/')
  const current = `<!-- SLICE3_STEP1_CURRENT_START -->
The Owner-supplied [REVIEW-029](${link}) returned **FAIL** with the sole HIGH / BLOCKING finding S3S1-IR-001 (PACKAGE_CONTENT_CLOSURE). The Owner accepted the finding and authorized only its bounded corrective. Original Executor PASS is historical evidence, not final Step1 PASS.

\x60\x60\x60text
V1_SLICE_3 = IN_PROGRESS
V1_SLICE_3_ARCHITECTURE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
V1_SLICE_3_STEP1_INDEPENDENT_REVIEW = FAIL
V1_SLICE_3_STEP1_REVIEW_BLOCKING_FINDINGS = S3S1-IR-001
S3S1_IR_001 = CORRECTIVE_AUTHORIZED
V1_SLICE_3_STEP1 = CORRECTIVE_IN_PROGRESS
V1_SLICE_3_STEP1_CORRECTIVE_RESULT = NOT_YET_VALIDATED
V1_SLICE_3_STEP1_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP1_BASELINE = NOT_FROZEN
NF1_REVIEW_DISPOSITION = READY_FOR_OWNER_CLOSURE
NF3_REVIEW_DISPOSITION = READY_FOR_OWNER_CLOSURE
NF4_STATUS = DEFERRED_TO_SLICE3_STEP3 / NOT_CLOSED
MAX_JSON_FRAME = 262144
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
V1_SLICE_3_STEP2 = NOT_AUTHORIZED
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
PROVIDER_RUN_COUNT = 0
SIGNING_EXECUTION_AUTHORIZATION = NO
SIGNING_RUN_COUNT = 0
V1_CURRENT_NEXT_ACTION = IMPLEMENT_S3S1_IR_001_PACKAGE_CONTENT_CLOSURE_CORRECTIVE
\x60\x60\x60
<!-- SLICE3_STEP1_CURRENT_END -->`
  const updated = text.replace(/<!-- SLICE3_STEP1_CURRENT_START -->[\s\S]*?<!-- SLICE3_STEP1_CURRENT_END -->/, current.replaceAll('\n', text.includes('\r\n') ? '\r\n' : '\n'))
    .replace('## Current - Slice3 Step1 Implemented Waiting Independent Review (2026-09-11)', '## Current - Slice3 Step1 Review FAIL / Corrective In Progress (2026-09-11)')
  assert.notEqual(updated, text)
  await writeFile(resolve(root, path), updated, 'utf8')
}
const indexPath = resolve(root, 'docs/05-reviews/REVIEW-INDEX.md')
const index = utf8(await readFile(indexPath))
await writeFile(indexPath, index.replace('Future implementation reviews', '| REVIEW-029 | V1-SLICE-3 Step1 Independent Implementation Review | FAIL | S3S1-IR-001 HIGH / BLOCKING accepted; bounded corrective authorized; no Step1 closure | [Source](architecture/AUDIT-029-V1-SLICE-3-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md) |\r\n\r\nFuture implementation reviews'), 'utf8')
await writeFile(resolve(evidence, 'entry-baseline.json'), json({ entryHead: git(['rev-parse', 'HEAD']), entryGitStatus: 'CLEAN_BEFORE_CORRECTIVE_EVIDENCE', parentReviewId: 'REVIEW-029', parentReviewVerdict: 'FAIL', finding: 'S3S1-IR-001', originalArtifactDigest: '679a92171c047f70b4d607d066f922ec0153d3f516a2fafbef9198d41ab7c2aa', harnessHead: git(['-c', 'safe.directory=D:/Project/Shaco-Forge-Upstream/deepseek-harness', '-C', 'D:/Project/Shaco-Forge-Upstream/deepseek-harness', 'rev-parse', 'HEAD']), harnessStatus: git(['-c', 'safe.directory=D:/Project/Shaco-Forge-Upstream/deepseek-harness', '-C', 'D:/Project/Shaco-Forge-Upstream/deepseek-harness', 'status', '--porcelain=v1']), originalEncodings, entryInspectionFailures: ['Initial upstream Git inspection rejected sandbox ownership; process-local safe.directory resolved it without config mutation.', 'Initial rg wildcard paths were invalid on Windows; corrected to directory with glob filters.'], providerRuns: 0, signingRuns: 0 }), 'utf8')
console.log('REVIEW-029 persisted; corrective governance entered; original evidence untouched')
