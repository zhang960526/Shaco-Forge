// Final Executor consistency gate; never an Independent Review or closure.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { CONTRACT_SHA256, HARNESS_COMMIT, hashFile, jsonBytes, verifyPackagedRuntime } from '../packages/contracts/dist/packaged-runtime.js'

const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01')
const git = args => execFileSync(process.env.SHACO_FORGE_GIT ?? 'git', args, { cwd: root, encoding: 'utf8' }).trim()
const entry = '19f200851c47d5ce1b93026e07d88a6d583ef7f5'
const required = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'test:full-shaco', 'smoke:full-shaco', 'package:runtime', 'test:packaged-runtime', 'smoke:packaged-runtime']
const summary = JSON.parse(await readFile(join(evidence, 'test-summary.json'), 'utf8'))
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const release = await verifyPackagedRuntime(location.packagedRoot)
const currentSource = JSON.parse(await readFile(join(location.evidence, 'source-inventory.json'), 'utf8'))
for (const row of currentSource) assert.equal(await hashFile(join(root, row.path)), row.sha256, `SOURCE_DRIFT: ${row.path}`)
const gateRows = required.map(command => {
  const row = summary.commands.filter(row => row.command === command).at(-1)
  assert.ok(row, `NOT_RUN: ${command}`)
  assert.equal(row.phase, 'FINAL_REGRESSION', `NOT_FINAL: ${command}`)
  assert.equal(row.exitCode, 0, `FAILED: ${command}`)
  assert.equal(row.sourceBefore, release.BuildProvenance.sourceInventorySha256, `WRONG_SOURCE: ${command}`)
  assert.equal(row.sourceAfter, row.sourceBefore, `SOURCE_CHANGED_DURING: ${command}`)
  return { command, classification: 'REPRODUCIBLE', attempt: row.attempt, result: 'PASS_RERUN_THIS_IMPLEMENTATION', log: row.log, logSha256: null }
})
for (const row of gateRows) row.logSha256 = await hashFile(join(evidence, row.log))
const frozenFiles = [
  'docs/03-v1.0-plan/V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md',
  'docs/04-development-records/V1-SLICE-3-CONTRACT-FREEZE-AND-STEP1-AUTHORIZATION-DECISION.md',
  'docs/00-governance/SHACO-FORGE-V1-CUMULATIVE-REGRESSION-CLOSURE-GATE.md',
  'docs/05-reviews/architecture/AUDIT-028-V1-SLICE-3-ARCHITECTURE-CONTRACT-INDEPENDENT-REVIEW.md',
  'docs/05-reviews/architecture/AUDIT-028B-V1-SLICE-3-S3-AR-001-TARGETED-CORRECTIVE-REREVIEW.md',
  'docs/06-testing-acceptance/evidence/P0-1-HARNESS-BASELINE-MANIFEST.md',
  'docs/06-testing-acceptance/evidence/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-EVIDENCE.md',
  'docs/04-development-records/V1-SLICE-1C-OWNER-CLOSURE-DECISION.md',
  'docs/04-development-records/V1-SLICE-2-OWNER-CLOSURE-AND-FREEZE-DECISION.md',
  'docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260911-IFR01-FINALIZATION-01/composition-identity.json',
  'docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260911-IFR01-FINALIZATION-01/test-summary.json',
  'packages/contracts/src/carrier.ts',
]
const frozen = []
for (const path of frozenFiles) {
  const entryBlob = git(['rev-parse', `${entry}:${path}`])
  assert.equal(git(['hash-object', '--path', path, path]), entryBlob, `FROZEN_DRIFT: ${path}`)
  frozen.push({ path, entryBlob, sha256: await hashFile(join(root, path)), result: 'IDENTITY_VERIFIED', runtimeRerun: 'NOT_RERUN' })
}
assert.equal(frozen[0].sha256, CONTRACT_SHA256)
const harnessRoot = 'D:/Project/Shaco-Forge-Upstream/deepseek-harness'
assert.equal(git(['-c', `safe.directory=${harnessRoot}`, '-C', harnessRoot, 'rev-parse', 'HEAD']), HARNESS_COMMIT)
assert.equal(git(['-c', `safe.directory=${harnessRoot}`, '-C', harnessRoot, 'status', '--porcelain=v1']), '')
const changed = [...new Set([...git(['diff', '--name-only', entry]).split('\n'), ...git(['ls-files', '--others', '--exclude-standard']).split('\n')])].filter(Boolean).sort()
const textExtensions = /\.(ts|cts|mjs|js|cs|csproj|ps1|json|yaml|yml|md|html|css|log)$/
for (const path of changed.filter(path => textExtensions.test(path))) {
  const bytes = await readFile(join(root, path))
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  assert.ok(!bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])), `BOM: ${path}`)
  assert.doesNotMatch(text, /\uFFFD|\u953F\u65A4\u62F7|\u00C3|\u00C2/, `MOJIBAKE: ${path}`)
}
git(['-c', 'core.whitespace=cr-at-eol', 'diff', '--check', entry])
const result = { result: 'PASS', role: 'EXECUTOR_CONSISTENCY_CHECK_ONLY', entryHead: entry, sourceIdentity: release.BuildProvenance.sourceInventorySha256,
  gates: gateRows, frozen, modifiedFiles: changed, encoding: 'UTF8_WITHOUT_BOM_VALIDATED', harness: { head: HARNESS_COMMIT, clean: true, readOnly: true },
  notRun: ['Provider', 'Signing', 'Step2', 'Step3', 'Fresh Windows', 'Independent Review', 'Owner Closure'], providerRuns: 0, signingRuns: 0 }
await writeFile(join(evidence, 'final-validation.json'), jsonBytes(result), 'utf8')
console.log(jsonBytes({ result: result.result, gates: gateRows.length, sourceIdentity: result.sourceIdentity, frozenFiles: frozen.length, changedFiles: changed.length }))
