import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
export function frozenRoster(contract) {
  assert.equal(sha256(contract), '6cad09319e8793c4cebf95c4dfae4cd04f644adbed1b0c51647e93901e42721b', 'FROZEN_CONTRACT_IDENTITY')
  return [...contract.toString('utf8').matchAll(/\| (\d+) \| `([^`]+)` \| `([^`]+)` \| `([a-f0-9]{64})` \|/g)]
    .map(m => ({ id: m[2], publicExport: m[3], sha256: m[4] }))
}
export function validateComposition(rows, graph, pins, bundles) {
  assert.equal(rows.length, 29, 'TOTAL_ROWS_NOT_29')
  assert.equal(new Set(rows.map(row => row.id)).size, 29, 'DUPLICATE_ROW')
  assert.equal(pins.length, 28, 'MISSING_REQUIRED_FROZEN_ROW')
  const expected = [...pins.map(row => row.id), '@shaco-forge/desktop']
  assert.deepEqual(rows.map(row => row.id), expected, 'WRONG_ROW_ORDER_OR_MISSING_REQUIRED_FROZEN_ROW')
  assert.deepEqual(graph.entries.map(row => row.id), expected, 'GRAPH_BATCH_INCONSISTENCY')
  assert.deepEqual(graph.batches.map(batch => batch.entries), [expected.slice(0, 1), expected.slice(1)], 'GRAPH_BATCH_INCONSISTENCY')
  for (const [i, row] of rows.entries()) {
    assert.equal(row.publicExport ?? `${row.id}/client`, `${row.id}/client`, 'PUBLIC_EXPORT_MISMATCH')
    if (i < 28) assert.equal(row.bundleSha256, pins[i].sha256, 'FROZEN_BUNDLE_MISMATCH')
    assert.equal(row.rev, graph.rev, 'GRAPH_BATCH_INCONSISTENCY')
    assert.deepEqual(graph.entries[i], Object.fromEntries(Object.entries(row).filter(([key]) => !['bundlePath', 'bundleBytes', 'bundleSha256', 'publicExport'].includes(key))), 'GRAPH_BATCH_INCONSISTENCY')
  }
  for (const [i, batch] of graph.batches.entries()) {
    assert.equal(batch.rev, graph.rev, 'GRAPH_BATCH_INCONSISTENCY')
    assert.equal(batch.phase, i === 0 ? 'bootstrap' : 'application', 'GRAPH_BATCH_INCONSISTENCY')
    assert.equal(batch.url, `shaco-forge://client/static/${batch.phase}.js?rev=${graph.rev}`, 'GRAPH_BATCH_INCONSISTENCY')
  }
  const factories = []
  const window = { __ModuleLoader__: { load: entry => { assert.equal(typeof entry.factory, 'function'); factories.push(entry.id) } } }
  for (const bytes of bundles) runInNewContext(bytes.toString('utf8'), { window }, { timeout: 2000 })
  assert.equal(new Set(factories).size, factories.length, 'DUPLICATE_FACTORY')
  assert.deepEqual(factories, expected, 'FACTORY_ROSTER_MISMATCH')
}
