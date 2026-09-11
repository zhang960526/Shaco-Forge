import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve, sep } from 'node:path'
import { inspectProductionSource, scanProductionBoundary } from '../../../scripts/production-boundary.mjs'
import { fileURLToPath } from 'node:url'
assert.ok(process.env.SHACO_FORGE_HARNESS_ROOT)
const require = createRequire(join(process.env.SHACO_FORGE_HARNESS_ROOT,'packages/client/web/package.json'))

test('UI-G14 covers recursive Renderer/Client source and production bootstrap imports', async () => {
  const result = await scanProductionBoundary(fileURLToPath(new URL('../../../', import.meta.url)), process.env.SHACO_FORGE_HARNESS_ROOT)
  assert.deepEqual(result.findings, [])
  for (const name of ['transport.ts', 'user-loop-evidence.ts', 'global.d.ts', 'shell-bootstrap.ts', 'shaco-bootstrap.mjs', 'presentation-lifecycle.mjs', 'main.ts']) {
    assert.ok(result.files.includes(`apps/desktop/src/renderer/${name}`), name)
  }
  assert.ok(result.files.includes('apps/desktop/src/renderer/theme/theme.ts'))
  assert.ok(!result.files.some(name => name.includes('.test.')))
})

test('UI-G14 rejects private identity, settlement, waterfall types and fixture imports in Renderer source', () => {
  for (const source of [
    'const id = args.eventId', 'const { eventId: id } = item', 'hash(item["eventId"])', 'item["event" + "Id"]',
    'request("$events/result", body)', 'item.type === "waterfall"',
    'remote.$on("approval/request", handler)', 'remote.$waterfall("user-questions/request", handler)',
    'let frame: EventFrame', 'let frame: EventWaterfall',
    'import { value } from "@deepseek-ai/dsh-client-web/internal/status"',
    'import { value } from "@deepseek-ai/dsh-client-web/lib/private"',
    'type Frame = import("@deepseek-ai/dsh-api-gateway/internal/events").Frame',
    'import("../test-fixtures/observer.mjs")', 'export { observer } from "../tests/observer.mjs"',
    'const observer = require("../tests/observer.mjs")',
    'import { value } from "../../../../packages/client/web/src/runtime.js"',
    'export { value } from "../../../../packages/api/gateway/src/events.js"',
    'import("../../../../packages/client/web/src/runtime.js")',
  ]) assert.ok(inspectProductionSource('apps/desktop/src/renderer/nested/observer.ts', source).findings.length, source)
  // Documentation and historical evidence strings are not inputs to this source scan.
  assert.deepEqual(inspectProductionSource('diagnostics.ts', '// item.eventId; $events/result\nconst ready = item.type === "ready"').findings, [])
})

test('UI-G14 follows local imports outside seeded roots and rejects reachable test fixtures', async () => {
  const root = await mkdtemp(resolve('node_modules/.ifr01-boundary-'))
  try {
    for (const directory of ['apps/desktop/src/client', 'apps/desktop/src/renderer/nested', 'apps/desktop/src/shared', 'apps/desktop/test-fixtures']) await mkdir(join(root, directory), { recursive: true })
    await writeFile(join(root, 'apps/desktop/src/renderer/nested/entry.ts'), 'export { observe } from "../../shared/observer.js"', 'utf8')
    await writeFile(join(root, 'apps/desktop/src/shared/observer.ts'), 'export { observe } from "../../test-fixtures/observer.mjs"', 'utf8')
    await writeFile(join(root, 'apps/desktop/test-fixtures/observer.mjs'), 'export const observe = item => item.eventId', 'utf8')
    const result = await scanProductionBoundary(root)
    assert.ok(result.findings.some(row => row.rule === 'TEST_ONLY_PRODUCTION_IMPORT'))
    assert.ok(result.findings.some(row => row.rule === 'INTERNAL_EVENT_ID' && row.path.includes('test-fixtures')))
  } finally {
    assert.ok(resolve(root).startsWith(resolve('node_modules') + sep))
    await rm(root, { recursive: true, force: true })
  }
})

test('all Shaco presentation modules use public runtime exports and own no business registries', async () => {
  const directory = new URL('../src/client/', import.meta.url)
  const paths = (await readdir(directory)).filter(name => name.endsWith('.mjs') && !name.endsWith('.test.mjs'))
  const sources = await Promise.all(paths.map(name => readFile(new URL(name,directory),'utf8')))
  const client = sources.join('\n')
  assert.doesNotMatch(client, /registerPendingInteraction|\beventId\b|\$events\/result|new\s+(?:Context|ClientSessions|PendingApproval|PendingQuestion)|createSnapshotStore|new Map\(|indexedDB|localStorage|fetch\(/)
  const bootstrap = await readFile(new URL('../src/renderer/shaco-bootstrap.mjs',import.meta.url),'utf8')
  for(const source of [...sources,bootstrap]) for(const match of source.matchAll(/from ['"](@deepseek-ai\/[^'"]+)['"]/g)) {
    const resolved = require.resolve(match[1])
    assert.doesNotMatch(resolved, /[\\/]src[\\/]/)
    assert.doesNotMatch(match[1], /\/internal|\/lib\/|\/src\//)
  }
  assert.match(client, /uiConversation\.binding\(binding\)/)
  assert.match(client, /conversation\.target\('chat'\)/)
  assert.match(client, /chat\.nodes\.get\(key\)/)
  assert.doesNotMatch(client, /session\.events|events\.reduce|turn\/start|assistant\/chunk/)
})

test('Product declares every presentation service; bootstrap remains the only Context/root owner', async () => {
  const product=await readFile(new URL('../src/client/recovery.mjs',import.meta.url),'utf8')
  const inject=product.match(/export const inject = (\[[^\n]+\])/)[1]
  for(const service of ['uiSession','uiConversation','conversation','modelDirectories','remote.session']) assert.ok(inject.includes(`'${service}'`),service)
  const lifecycle=await readFile(new URL('../src/renderer/presentation-lifecycle.mjs',import.meta.url),'utf8')
  assert.equal((lifecycle.match(/new Context\(/g)??[]).length,1)
  assert.equal((lifecycle.match(/uiRenderer\.mount\(/g)??[]).length,1)
  const main=await readFile(new URL('../src/renderer/main.ts',import.meta.url),'utf8')
  assert.doesNotMatch(main,/AppWebEntry|createRoot\(|new Context\(/)
})
