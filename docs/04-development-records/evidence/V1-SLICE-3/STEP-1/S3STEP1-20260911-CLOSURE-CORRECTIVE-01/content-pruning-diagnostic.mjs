import assert from 'node:assert/strict'
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const evidence = import.meta.dirname
const root = resolve(evidence, '../../../../../..')
const attempt = process.argv[2]
assert.match(attempt, /^\d+$/)
const { isTestContent, packageContentPlan } = await import(pathToFileURL(join(root, 'scripts/harness-production-closure.mjs')))
const previous = join(evidence, 'runs/package-runtime-3')
const closure = JSON.parse(await readFile(join(previous, 'harness-production-closure.json'), 'utf8'))
const inventory = JSON.parse(await readFile(join(previous, 'packaged-files.json'), 'utf8'))
const discovered = inventory.files.filter(row => row.path.startsWith('harness/node_modules/') && isTestContent(row.path))
const result = { attempt, purpose: 'EXECUTOR_CONTENT_PRUNING_CORRECTIVE_DIAGNOSTIC', priorCandidateAcceptance: 'FAIL_TEST_ONLY_CONTENT_CENSUS',
  previousPackageEvidence: previous, previousSourceIdentity: 'fb69db2cf42f880e956f5da11369f735a9c97126cb10ec2d79fd0f1e80d07bbd',
  observation: 'Cycle 1 completed 18 command PASS results, but a subsequent content census found generated browser/system tests, SDK test-support, and standalone tape runners. Cycle 1 is retained and is not final acceptance.',
  discoveredFiles: discovered, discoveredBytes: discovered.reduce((n, row) => n + row.bytes, 0),
  proof: ['gaxios package scripts explicitly invoke browser-test and system-test; their JS imports dev-only mocha.', 'object-inspect/test-core-js.js and safer-buffer/tests.js import dev-only tape.', '@agentclientprotocol/sdk dist/test-support is not exported; production modules must not import it (pruning guard enforces this).'],
  preservedPublicRuntimeApis: ['hono ./testing is an explicit package export.', '@earendil-works/pi-telemetry ./testing is an explicit package export.', 'undici lib/mock is exported/referenced by its production entry. No global testing/mock substring deletion.'],
  codeSha256: createHash('sha256').update(await readFile(join(root, 'scripts/harness-production-closure.mjs'))).digest('hex') }
try {
  assert.ok(discovered.length > 0)
  const plans = []
  for (const row of closure.packages) plans.push(await packageContentPlan(row.source))
  Object.assign(result, { result: 'PASS_CORRECTED_CONTENT_PLANS', checkedPackages: plans.length, excludedFiles: plans.reduce((n, row) => n + row.excluded.length, 0), excludedBytes: plans.reduce((n, row) => n + row.excludedBytes, 0) })
} catch (error) {
  Object.assign(result, { result: 'FAIL', error: String(error), stack: error.stack })
  process.exitCode = 1
}
await writeFile(join(evidence, `content-pruning-diagnostic-${attempt}.json`), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify({ ...result, discoveredFiles: discovered.length }))
if (attempt === '1') await copyFile(join(evidence, 'closure-determinism-recheck.json'), join(evidence, 'closure-determinism-recheck-package-3.json'))
