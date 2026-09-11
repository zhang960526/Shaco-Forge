import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { calculateProductionClosure, dependencyEdges, discoverProductionRoots, FORBIDDEN_PACKAGES, materializeProductionClosure, packageContentPlan, verifyProductionClosure } from './harness-production-closure.mjs'

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'shaco-closure-unit-'))
  const overlay = join(root, 'overlay/node_modules')
  await mkdir(overlay, { recursive: true })
  async function pkg(name, extra = {}, files = {}, source = join(overlay, name)) {
    await mkdir(source, { recursive: true })
    await writeFile(join(source, 'package.json'), JSON.stringify({ name, version: '1.0.0', main: 'index.js', ...extra }), 'utf8')
    for (const [file, content] of Object.entries({ 'index.js': 'export default 1\n', ...files })) {
      await mkdir(join(source, file, '..'), { recursive: true })
      await writeFile(join(source, file), content, 'utf8')
    }
    return source
  }
  const calc = (roots = [{ name: 'app', version: '1.0.0', source: join(overlay, 'app') }]) => calculateProductionClosure({ roots, overlay, allowedSourceRoots: [root] })
  try { await run({ root, overlay, pkg, calc }) }
  finally {
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + '\\shaco-closure-unit-'))
    await rm(root, { recursive: true, force: true })
  }
}

test('closure traverses only production declarations; required peers, optional policy and determinism', () => fixture(async ({ pkg, calc }) => {
  await pkg('app', { dependencies: { runtime: '^1', shared: '^1' }, devDependencies: { dev: '*', shared: '*' }, peerDependencies: { peer: '^1', optionalPeer: '*' }, peerDependenciesMeta: { optionalPeer: { optional: true } }, optionalDependencies: { absent: '*', platform: '*', present: '^1' } })
  for (const name of ['runtime', 'shared', 'dev', 'peer', 'optionalPeer', 'present', ...FORBIDDEN_PACKAGES]) await pkg(name)
  await pkg('platform', { os: ['linux'] })
  const closure = await calc()
  assert.deepEqual(closure.packages.map(row => row.name).sort(), ['app', 'peer', 'present', 'runtime', 'shared'])
  assert.equal(closure.edges.find(row => row.name === 'peer').type, 'requiredPeerDependencies')
  assert.equal(closure.edges.find(row => row.name === 'shared').type, 'dependencies')
  assert.deepEqual(closure.skipped.map(row => row.reason).sort(), ['OPTIONAL_NOT_APPLICABLE_TO_TARGET', 'OPTIONAL_NOT_INSTALLED'])
  assert.deepEqual(await calc(), closure)
}))
test('optionalDependencies override dependencies, while optional peers do not enter the graph', () => {
  assert.deepEqual(dependencyEdges({ dependencies: { absent: '*' }, optionalDependencies: { absent: '*' }, peerDependencies: { optional: '*' }, peerDependenciesMeta: { optional: { optional: true } } }), [{ name: 'absent', type: 'optionalDependencies', requested: '*' }])
})
for (const type of ['dependencies', 'peerDependencies']) test(`missing ${type} fails closed`, () => fixture(async ({ pkg, calc }) => {
  await pkg('app', { [type]: { missing: '*' } })
  await assert.rejects(calc(), /MISSING_REQUIRED_DEPENDENCY/)
}))
for (const [field, value, expected] of [['name', 'impostor', /WRONG_RESOLVED_NAME/], ['version', '2.0.0', /WRONG_RESOLVED_VERSION/]]) test(`wrong resolved ${field} fails closed`, () => fixture(async ({ pkg, calc }) => {
  await pkg('app', { dependencies: { dep: '^1.0.0' } })
  await pkg('dep', { [field]: value })
  await assert.rejects(calc(), expected)
}))
test('present optional dependency with wrong identity fails closed', () => fixture(async ({ pkg, calc }) => {
  await pkg('app', { optionalDependencies: { dep: '^1' } })
  await pkg('dep', { name: 'wrong' })
  await assert.rejects(calc(), /WRONG_RESOLVED_NAME/)
}))
test('ambiguous production roots fail closed', () => fixture(async ({ pkg, calc }) => {
  const source = await pkg('app')
  const row = { name: 'app', version: '1.0.0', source }
  await assert.rejects(calc([row, row]), /AMBIGUOUS_PRODUCTION_ROOTS/)
}))
test('forbidden package through a production edge fails with the complete parent chain', () => fixture(async ({ pkg, calc }) => {
  await pkg('app', { dependencies: { middle: '*' } })
  await pkg('middle', { dependencies: { vitest: '*' } })
  await pkg('vitest')
  await assert.rejects(calc(), /FORBIDDEN_PRODUCTION_CHAIN_REQUIRES_PROOF.*app.*middle.*vitest/)
}))
test('materialization preserves distinct versions and cycles; every actual package must match its production graph', () => fixture(async ({ root, overlay, pkg, calc }) => {
  await pkg('app', { dependencies: { a: '*', b: '*' } })
  await pkg('a', { dependencies: { dep: '^1', app: '*' } })
  await pkg('b', { dependencies: { dep: '^2' } })
  await pkg('dep')
  await pkg('dep', { version: '2.0.0' }, {}, join(overlay, 'b/node_modules/dep'))
  const closure = await calc()
  const output = join(root, 'package/node_modules')
  Object.assign(closure, await materializeProductionClosure(closure, output))
  assert.equal((await verifyProductionClosure(output, closure)).outsideClosure, 0)
  assert.ok(closure.placements.some(row => row.path.endsWith('/node_modules/dep')))
  const extra = join(output, 'intruder')
  await pkg('intruder', {}, {}, extra)
  await assert.rejects(verifyProductionClosure(output, closure), /PACKAGE_OUTSIDE_CLOSURE/)
  await rm(extra, { recursive: true })
  await rm(join(output, 'a'), { recursive: true })
  await assert.rejects(verifyProductionClosure(output, closure), /CLOSURE_PACKAGE_MISSING/)
}))
test('pruning removes obvious test/dev artifacts and preserves licenses and executable src entry points', () => fixture(async ({ pkg }) => {
  const source = await pkg('source-runtime', { main: 'src/main.js', exports: './src/main.js' }, { 'src/main.js': 'export default 2', 'src/tests/example.js': 'test', 'coverage/a': 'coverage', 'lib/a.test.js': 'test', 'lib/a.tsbuildinfo': '{}', 'test-fixtures/a': 'fixture', '.git/config': 'git', 'LICENSE': 'license', 'tsconfig.json': '{}' })
  const plan = await packageContentPlan(source)
  assert.ok(plan.retained.some(row => row.path === 'src/main.js'))
  assert.ok(plan.retained.some(row => row.path === 'LICENSE'))
  assert.equal(plan.excluded.length, 7)
  assert.equal(plan.srcDisposition, 'RETAIN_RUNTIME_REFERENCED_SRC')
}))
test('src policy preserves runtime references and excludes unreferenced source trees', () => fixture(async ({ pkg }) => {
  const unused = await pkg('built', {}, { 'src/unused.ts': 'source' })
  assert.ok((await packageContentPlan(unused)).excluded.some(row => row.path === 'src/unused.ts'))
  const used = await pkg('runtime', {}, { 'index.js': "export {default} from './src/runtime.js'", 'src/runtime.js': 'export default 1' })
  assert.ok((await packageContentPlan(used)).retained.some(row => row.path === 'src/runtime.js'))
}))
test('explicit runtime target under a test directory fails closed instead of silently breaking runtime', () => fixture(async ({ pkg }) => {
  const source = await pkg('runtime', { main: 'test/entry.js' }, { 'test/entry.js': 'export default 1' })
  await assert.rejects(packageContentPlan(source), /PRUNING_RUNTIME_TARGET/)
}))
test('runtime import into a test-only directory prevents unsafe pruning', () => fixture(async ({ pkg }) => {
  const source = await pkg('runtime-import', {}, { 'index.js': "import './fixtures/data.js'", 'fixtures/data.js': 'export default 1' })
  await assert.rejects(packageContentPlan(source), /PRUNING_RUNTIME_IMPORT/)
}))
test('generated browser/system tests, unexported test support and standalone test runners are excluded', () => fixture(async ({ pkg }) => {
  const source = await pkg('generated-tests', {}, { 'build/esm/browser-test/test.browser.js': 'test', 'build/cjs/system-test/test.install.d.ts': 'test', 'dist/test-support/test-agent.js': 'test', 'test-core-js.js': 'test', 'tests.js': 'test', 'lib/example.test.d.ts.map': '{}', 'benchmarks/run.js': "import '../test/data.js'", 'LICENSE': 'license' })
  const plan = await packageContentPlan(source)
  assert.equal(plan.excluded.length, 7)
  assert.ok(plan.retained.some(row => row.path === 'LICENSE'))
}))
test('public testing and mock runtime APIs are preserved without treating a name as proof of test-only content', () => fixture(async ({ pkg }) => {
  const source = await pkg('public-api', { exports: { '.': './index.js', './testing': './testing/index.js', './test-utils': './test-utils.js' } }, { 'testing/index.js': 'export default 1', 'lib/mock/client.js': 'export default 2', 'test-utils.js': 'export default 3' })
  const plan = await packageContentPlan(source)
  assert.equal(plan.excluded.length, 0)
  assert.ok(plan.retained.some(row => row.path === 'testing/index.js'))
}))
test('runtime src imports into excluded generated test support fail closed', () => fixture(async ({ pkg }) => {
  const source = await pkg('runtime-src', { main: 'src/index.js' }, { 'src/index.js': "import '../test-support/data.js'", 'test-support/data.js': 'export default 1' })
  await assert.rejects(packageContentPlan(source), /PRUNING_RUNTIME_IMPORT/)
}))

test('actual production root inventory is stable and comes from CLI/profile/bootstrap entry bytes', { skip: !process.env.SHACO_FORGE_PACKAGED_LOCATION }, async () => {
  const path = process.env.SHACO_FORGE_PACKAGED_LOCATION
  const location = JSON.parse(await readFile(path, 'utf8'))
  const closure = JSON.parse(await readFile(join(location.evidence, 'harness-production-closure.json'), 'utf8'))
  const bootstrap = closure.roots.find(row => row.name === '@shaco-forge/harness-bootstrap').source
  const profile = resolve(bootstrap, '../../..')
  const overlay = resolve(closure.roots.find(row => row.name === '@deepseek-ai/dsh').source, '../..')
  const actual = await discoverProductionRoots({ overlay, profile, bootstrap })
  assert.deepEqual(actual, closure.roots)
  assert.deepEqual(await discoverProductionRoots({ overlay, profile, bootstrap }), actual)
  assert.ok(actual.every(row => row.reasons.length > 0 && row.reasons.every(reason => reason.entrySha256)))
  assert.equal((await verifyProductionClosure(join(location.packagedRoot, 'harness/node_modules'), closure)).outsideClosure, 0)
})
