import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
const evidence = import.meta.dirname
const root = resolve(evidence, '../../../../../..')
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const files = JSON.parse(await readFile(join(location.evidence, 'packaged-files.json'), 'utf8')).files
const knownGap = JSON.parse(await readFile(join(evidence, 'content-pruning-diagnostic-4.json'), 'utf8'))
const actualPaths = new Set(files.map(row => row.path))
for (const row of knownGap.discoveredFiles) assert.ok(!actualPaths.has(row.path), `TEST_ARTIFACT_REMAINS: ${row.path}`)
const retained = [
  ['react-dom/test-utils.js', 'PACKAGE_PUBLIC_EXPORT'],
  ['hono/dist/helper/testing/index.js', 'PACKAGE_PUBLIC_EXPORT'],
  ['@earendil-works/pi-telemetry/dist/testing/index.js', 'PACKAGE_PUBLIC_EXPORT'],
  ['@deepseek-ai/dsh-message-feedback/lib/types/spec.js', 'PRODUCTION_MODULE_IMPORT'],
  ['undici/lib/mock/mock-agent.js', 'PRODUCTION_ENTRY_REFERENCE'],
].map(([path, reason]) => ({ path: 'harness/node_modules/' + path, reason }))
for (const row of retained) assert.ok(actualPaths.has(row.path), `PUBLIC_RUNTIME_MODULE_REMOVED: ${row.path}`)
const imports = []
let scanned = 0
for (const row of files.filter(row => row.path.startsWith('harness/node_modules/') && /\.[cm]?js$/.test(row.path))) {
  const text = await readFile(join(location.packagedRoot, row.path), 'utf8')
  scanned++
  if (/(?:\bfrom\s*|\brequire\s*\(\s*)["'](?:vitest|mocha|tape)(?:["'/])/.test(text)) imports.push(row.path)
}
assert.deepEqual(imports, [], 'RETAINED_TEST_FRAMEWORK_IMPORT_REQUIRES_INSPECTION')
const result = { result: 'PASS', packageEvidence: location.evidence, previouslyMissedFilesNowAbsent: knownGap.discoveredFiles.length,
  previouslyMissedBytesNowAbsent: knownGap.discoveredBytes, retainedPublicRuntimeModules: retained,
  retainedJavaScriptFilesScanned: scanned, directVitestMochaTapeImports: imports,
  policy: 'Remove proven test-only artifacts; keep documented public/runtime modules. No import graph optimization or runtime rewrite.' }
await writeFile(join(evidence, 'final-content-census.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(result))
