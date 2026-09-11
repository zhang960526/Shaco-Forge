import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const evidence = import.meta.dirname
const root = resolve(evidence, '../../../../../..')
const { calculateProductionClosure, discoverProductionRoots } = await import(pathToFileURL(join(root, 'scripts/harness-production-closure.mjs')))
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const stored = JSON.parse(await readFile(join(location.evidence, 'harness-production-closure.json'), 'utf8'))
const harness = 'D:/Project/Shaco-Forge-Upstream/deepseek-harness'
const overlay = join(root, 'node_modules/.shaco-forge-build/runtime-overlay/node_modules')
async function repeat(closure) {
  const bootstrap = closure.roots.find(row => row.name === '@shaco-forge/harness-bootstrap').source
  const profile = resolve(bootstrap, '../../..')
  const roots = await discoverProductionRoots({ overlay, profile, bootstrap })
  assert.deepEqual(roots, closure.roots)
  const graph = await calculateProductionClosure({ roots, overlay, allowedSourceRoots: [overlay, harness, resolve(profile, '../..')], frozenRoot: harness })
  for (const key of ['roots', 'packages', 'edges', 'skipped', 'policy']) assert.deepEqual(graph[key], closure[key], `STORED_GRAPH_RECALCULATION_MISMATCH: ${key}`)
  return graph
}
const actual = await repeat(stored)
assert.equal(actual.deterministicGraphSha256, stored.deterministicGraphSha256)
const earlier = JSON.parse(await readFile(join(evidence, 'runs/package-runtime-2/harness-production-closure.json'), 'utf8'))
const repeatedEarlier = await repeat(earlier)
assert.equal(actual.deterministicGraphSha256, repeatedEarlier.deterministicGraphSha256, 'SEMANTIC_GRAPH_CHANGED_BETWEEN_ISOLATED_ATTEMPTS')
const result = { result: 'PASS', finalEvidence: location.evidence, finalGraphMatchesIndependentRecalculation: true,
  rootsRediscoveredFromRuntimeEntries: true, physicalSourceGraphMatchesStored: true,
  developmentPackage2AndFinalSemanticGraphEqual: true, deterministicGraphSha256: actual.deterministicGraphSha256,
  packageCount: actual.packageCount, edgeCount: actual.edgeCount, network: 'NOT_USED', harness: 'READ_ONLY' }
await writeFile(join(evidence, 'closure-determinism-recheck.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(result))
