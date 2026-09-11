import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { frozenRoster, validateComposition } from '../apps/desktop/scripts/composition-identity.mjs'

const pins = frozenRoster(await readFile('docs/03-v1.0-plan/V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-CONTRACT-GATE.md'))
const manifest = JSON.parse(await readFile('apps/desktop/.generated-client/harness-client-manifest.json', 'utf8'))
const graph = JSON.parse(await readFile('apps/desktop/.generated-client/composition-graph.json', 'utf8'))
const rows = graph.entries.map((entry, i) => ({ ...entry, bundleSha256: manifest.artifacts[i].sha256 }))
const bundles = await Promise.all(['bootstrap', 'application'].map(name => readFile(`apps/desktop/.generated-client/static/${name}.js`)))
test('exact 28 pinned public rows plus one Shaco row and actual factory registrations', () => validateComposition(rows, graph, pins, bundles))
const scenarios = {
  DUPLICATE_ROW: (r, g, b) => { r[28] = r[0] },
  DUPLICATE_FACTORY: (r, g, b) => { b.push(b[0]) },
  MISSING_REQUIRED_FROZEN_ROW: (r, g, b) => { r[10] = { ...r[10], id: 'missing-replacement' } },
  WRONG_ROW_ORDER: (r, g, b) => { [r[8], r[9]] = [r[9], r[8]] },
  GRAPH_BATCH_INCONSISTENCY: (r, g, b) => { g.batches[1].entries.reverse() },
  TOTAL_ROWS_NOT_29: (r, g, b) => { r.pop() },
  WRONG_PUBLIC_EXPORT: (r, g, b) => { r[4].publicExport = 'invalid' },
  WRONG_FROZEN_HASH: (r, g, b) => { r[4].bundleSha256 = 'invalid' },
  WRONG_GRAPH_REVISION: (r, g, b) => { g.entries[4].rev = 'old' },
}
for (const [name, change] of Object.entries(scenarios)) test(`${name} fails closed on actual composition`, () => {
  const r = structuredClone(rows), g = structuredClone(graph), b = [...bundles]
  change(r, g, b)
  assert.throws(() => validateComposition(r, g, pins, b))
})
