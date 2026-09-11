// Step1 package selection only. No runtime rewrite, bundler or Harness mutation.
import assert from 'node:assert/strict'
import { cp, lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { createRequire, isBuiltin } from 'node:module'
import { dirname, join, relative, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const semver = createRequire(require.resolve('@electron/packager'))('semver')
const ordinal = (a, b) => a < b ? -1 : a > b ? 1 : 0
const slash = path => path.replaceAll('\\', '/')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const within = (root, path) => { const rel = relative(root, path); return rel === '' || (!rel.startsWith('..') && !/^[A-Za-z]:/.test(rel)) }
const packageName = specifier => specifier.match(/^(@[^/]+\/[^/]+|[^/]+)/)?.[1]
const validName = name => /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name) && !['.', '..'].includes(name)
export const FORBIDDEN_PACKAGES = ['@vitest/coverage-v8', 'vitest', 'vite', '@deepseek-ai/dsh-agent-loop-testkit']
const excludedDirs = new Set(['.git', 'test', 'tests', '__tests__', 'coverage', 'fixture', 'fixtures', '__fixtures__', 'test-fixture', 'test-fixtures', '.nyc_output', '__snapshots__', '__mocks__', 'browser-test', 'browser-tests', 'system-test', 'system-tests', 'runtime-tests', 'dist-tests', 'test-support', 'bench', 'benchmark', 'benchmarks', '__benchmarks__'])
export const isTestContent = path => slash(path).split('/').some(part => excludedDirs.has(part.toLowerCase()))
  || /(?:\.tsbuildinfo|\.(?:test|spec)\.[cm]?[jt]sx?(?:\.map)?|\.(?:test|spec)\.d\.[cm]?ts(?:\.map)?)$/i.test(path)
  || /(?:^|\/)(?:tests|test-core-js)\.[cm]?[jt]sx?(?:\.map)?$/i.test(slash(path))

async function exists(path) {
  try { await lstat(path); return true } catch (error) { if (error.code === 'ENOENT') return false; throw error }
}
async function manifest(source) {
  const bytes = await readFile(join(source, 'package.json'))
  const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  assert.ok(validName(value.name) && semver.valid(value.version), `WRONG_PACKAGE_IDENTITY: ${source}`)
  return { value, sha256: hash(bytes) }
}
function imports(text, file) {
  const output = []
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  function visit(node) {
    let specifier
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(tree) === 'require')) {
      specifier = node.arguments[0]
      assert.ok(specifier && ts.isStringLiteralLike(specifier), `DYNAMIC_BOOTSTRAP_IMPORT_REQUIRES_OWNER: ${file}`)
    }
    if (specifier && ts.isStringLiteralLike(specifier)) output.push(specifier.text)
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return [...new Set(output)].sort(ordinal)
}

// Inventory comes from the generated production profile, its loaded patch and
// shipped bootstrap modules, plus the frozen CLI's actual bin entry.
export async function discoverProductionRoots({ overlay, profile, bootstrap }) {
  const cli = join(overlay, '@deepseek-ai/dsh')
  const cliManifest = (await manifest(cli)).value
  assert.equal(cliManifest.name, '@deepseek-ai/dsh')
  assert.equal(cliManifest.version, '0.1.2-alpha.1')
  assert.equal(cliManifest.bin.dsh, 'lib/bin.js')
  assert.ok(await exists(join(cli, cliManifest.bin.dsh)))
  const yaml = createRequire(join(cli, 'package.json'))('js-yaml')
  const roots = new Map()
  async function add(name, reason, entry, specifier = name) {
    assert.ok(validName(name), `INVALID_ROOT: ${name}`)
    const source = await realpath(name === '@shaco-forge/harness-bootstrap' ? bootstrap : join(overlay, name))
    const identity = await manifest(source)
    assert.equal(identity.value.name, name, `WRONG_ROOT_IDENTITY: ${name}`)
    const row = roots.get(name) ?? { name, version: identity.value.version, source, manifestSha256: identity.sha256, reasons: [] }
    assert.equal(row.source, source, `AMBIGUOUS_ROOT: ${name}`)
    row.reasons.push({ reason, entry: slash(entry), specifier, entrySha256: hash(await readFile(entry)) })
    roots.set(name, row)
  }
  await add(cliManifest.name, 'OFFICIAL_DSH_CLI_PRODUCTION_BIN', join(cli, cliManifest.bin.dsh))
  const profileManifest = (await manifest(profile)).value
  assert.equal(profileManifest.name, '@shaco-forge/harness-profile')
  assert.deepEqual(profileManifest.dsh.profile.bundles, ['@deepseek-ai/dsh-base', '@shaco-forge/harness-bootstrap'])
  for (const name of profileManifest.dsh.profile.bundles) await add(name, 'PRODUCTION_PROFILE_BUNDLE', join(profile, 'package.json'))
  const patchPath = join(bootstrap, 'cordis.patch.yml')
  const patch = yaml.load(await readFile(patchPath, 'utf8'))
  assert.ok(Array.isArray(patch))
  for (const operation of patch) {
    assert.deepEqual(Object.keys(operation), ['insert'], 'UNRECOGNIZED_PRODUCTION_BOOTSTRAP_PATCH')
    for (const row of operation.insert) {
      assert.ok(typeof row.name === 'string' && !row.disabled)
      await add(packageName(row.name), 'PRODUCTION_PROFILE_INSERT_PLUGIN', patchPath, row.name)
    }
  }
  const scanned = new Set()
  async function scan(file) {
    file = resolve(file)
    assert.ok(within(bootstrap, file), `BOOTSTRAP_IMPORT_ESCAPE: ${file}`)
    if (scanned.has(file)) return
    scanned.add(file)
    for (const specifier of imports(await readFile(file, 'utf8'), file)) {
      if (isBuiltin(specifier)) continue
      if (specifier.startsWith('.')) await scan(resolve(dirname(file), specifier))
      else await add(packageName(specifier), 'SHACO_OWNED_BOOTSTRAP_RUNTIME_IMPORT', file, specifier)
    }
  }
  const bootstrapManifest = (await manifest(bootstrap)).value
  for (const file of Object.values(bootstrapManifest.exports).sort(ordinal)) await scan(join(bootstrap, file))
  return [...roots.values()].sort((a, b) => ordinal(a.name, b.name))
}

export function dependencyEdges(value) {
  const edges = []
  for (const [type, declarations] of [['dependencies', value.dependencies], ['optionalDependencies', value.optionalDependencies], ['requiredPeerDependencies', value.peerDependencies]]) {
    for (const name of Object.keys(declarations ?? {}).sort(ordinal)) {
      if (type === 'dependencies' && Object.hasOwn(value.optionalDependencies ?? {}, name)) continue
      if (type === 'requiredPeerDependencies' && value.peerDependenciesMeta?.[name]?.optional === true) continue
      assert.ok(validName(name) && typeof declarations[name] === 'string', `INVALID_DEPENDENCY: ${value.name} -> ${name}`)
      edges.push({ name, type, requested: declarations[name] })
    }
  }
  return edges
}
function applicable(value, platform, arch) {
  const match = (list, target) => !list || (!list.includes(`!${target}`) && (!list.some(v => !v.startsWith('!')) || list.includes(target) || list.includes('any')))
  return match(value.os, platform) && match(value.cpu, arch)
}
function dependencyIdentity(edge, parent, actual) {
  let expectedName = edge.name
  let range = edge.requested
  if (range.startsWith('npm:')) {
    const alias = range.slice(4).match(/^(@[^/]+\/[^@]+|[^@]+)@(.+)$/)
    assert.ok(alias, `UNSUPPORTED_ALIAS: ${range}`)
    expectedName = alias[1]; range = alias[2]
  }
  if (range.startsWith('workspace:')) {
    range = range.slice(10)
    // workspace:^ expands using the target workspace version, not the parent's.
    // Its exact identity is separately pinned to the built workspace manifest.
    if (['*', '^', '~'].includes(range)) range = range === '*' ? '*' : range + actual.version
  }
  assert.equal(actual.name, expectedName, `WRONG_RESOLVED_NAME: ${parent.name} -> ${edge.name}`)
  assert.ok(semver.validRange(range) && semver.satisfies(actual.version, range, { includePrerelease: true }),
    `WRONG_RESOLVED_VERSION: ${parent.name} -> ${edge.name}@${edge.requested}, actual ${actual.version}`)
}

export async function calculateProductionClosure({ roots, overlay, allowedSourceRoots, frozenRoot, platform = 'win32', arch = 'x64' }) {
  roots = [...roots].sort((a, b) => ordinal(a.name, b.name))
  overlay = await realpath(overlay)
  const boundaries = await Promise.all(allowedSourceRoots.map(path => realpath(path)))
  const nodes = new Map()
  const edges = []
  const skipped = []
  const queue = []
  assert.equal(new Set(roots.map(row => row.name)).size, roots.length, 'AMBIGUOUS_PRODUCTION_ROOTS')
  async function add(source, parentChain) {
    source = await realpath(source)
    assert.ok(boundaries.some(boundary => within(boundary, source)), `UNAPPROVED_PACKAGE_SOURCE: ${source}`)
    if (!nodes.has(source)) {
      const identity = await manifest(source)
      if (frozenRoot && within(overlay, source)) {
        const directory = identity.value.repository?.directory
        assert.ok(directory, `MISSING_FROZEN_WORKSPACE_ORIGIN: ${source}`)
        const original = resolve(frozenRoot, directory)
        assert.ok(within(resolve(frozenRoot), original))
        assert.equal((await manifest(original)).sha256, identity.sha256, `WRONG_FROZEN_WORKSPACE_IDENTITY: ${source}`)
      }
      assert.ok(applicable(identity.value, platform, arch), `INAPPLICABLE_REQUIRED_PACKAGE: ${identity.value.name}`)
      nodes.set(source, { id: slash(source), name: identity.value.name, version: identity.value.version, source,
        manifestSha256: identity.sha256, parentChain, value: identity.value })
      queue.push(source)
    }
    return nodes.get(source)
  }
  async function find(source, name) {
    for (let dir = source; ; dir = dirname(dir)) {
      const path = join(dir, 'node_modules', name)
      if (boundaries.some(boundary => within(boundary, path))) {
        if (await exists(path)) {
          let found = await realpath(path)
          const identity = await manifest(found)
          // pnpm links inside frozen external packages may point to workspace
          // packages. Only their identity-equal built overlay is distributable.
          const built = join(overlay, identity.value.name)
          if (!within(overlay, found) && await exists(built)) {
            const builtSource = await realpath(built)
            if (within(overlay, builtSource)) {
              const builtIdentity = await manifest(builtSource)
              assert.equal(builtIdentity.sha256, identity.sha256, `AMBIGUOUS_BUILT_IDENTITY: ${identity.value.name}`)
              found = builtSource
            }
          }
          return { source: found, lookup: path }
        }
      }
      if (dirname(dir) === dir) return undefined
    }
  }
  for (const root of [...roots].sort((a, b) => ordinal(a.name, b.name))) {
    const node = await add(root.source, [root.name])
    assert.equal(node.name, root.name, 'WRONG_ROOT_NAME')
    assert.equal(node.version, root.version, 'WRONG_ROOT_VERSION')
  }
  for (let i = 0; i < queue.length; i++) {
    const parent = nodes.get(queue[i])
    for (const edge of dependencyEdges(parent.value)) {
      const found = await find(parent.source, edge.name)
      if (!found) {
        assert.equal(edge.type, 'optionalDependencies', `MISSING_REQUIRED_DEPENDENCY: ${parent.parentChain.join(' -> ')} -> ${edge.name} (${edge.type})`)
        skipped.push({ from: parent.id, ...edge, reason: 'OPTIONAL_NOT_INSTALLED' }); continue
      }
      const actual = (await manifest(found.source)).value
      dependencyIdentity(edge, parent.value, actual)
      if (edge.type === 'optionalDependencies' && !applicable(actual, platform, arch)) {
        skipped.push({ from: parent.id, ...edge, source: found.source, version: actual.version, reason: 'OPTIONAL_NOT_APPLICABLE_TO_TARGET', os: actual.os, cpu: actual.cpu }); continue
      }
      if (edge.requested.startsWith('workspace:') && !within(overlay, found.source)) {
        // Native entry workspaces are exposed by the overlay's dependency links;
        // they are not part of its JS workspace copy. Require their exact frozen
        // origin and prebuilt runtime entry, never compile or install them here.
        assert.ok(frozenRoot && actual.repository?.directory, `NON_BUILT_WORKSPACE_DEPENDENCY: ${edge.name}`)
        assert.equal(await realpath(resolve(frozenRoot, actual.repository.directory)), found.source, `WRONG_NATIVE_WORKSPACE_ORIGIN: ${edge.name}`)
        assert.ok(actual.main?.startsWith('lib/') && await exists(join(found.source, actual.main)), `MISSING_PREBUILT_NATIVE_ENTRY: ${edge.name}`)
      }
      const child = await add(found.source, [...parent.parentChain, edge.name])
      edges.push({ from: parent.id, to: child.id, ...edge, lookup: slash(found.lookup), reason: `package.json#${edge.type === 'requiredPeerDependencies' ? 'peerDependencies (optional != true)' : edge.type}` })
    }
  }
  const packages = [...nodes.values()].map(({ value, ...node }) => ({ ...node, ignoredDevDependencies: Object.keys(value.devDependencies ?? {}).sort(ordinal), ignoredOptionalPeers: Object.keys(value.peerDependencies ?? {}).filter(name => value.peerDependenciesMeta?.[name]?.optional === true).sort(ordinal) })).sort((a, b) => ordinal(a.id, b.id))
  const forbidden = packages.filter(row => FORBIDDEN_PACKAGES.includes(row.name))
  assert.equal(forbidden.length, 0, `FORBIDDEN_PRODUCTION_CHAIN_REQUIRES_PROOF: ${JSON.stringify(forbidden.map(row => row.parentChain))}`)
  const identity = node => `${node.name}@${node.version}:${node.manifestSha256}`
  const identities = new Map(packages.map(node => [node.id, identity(node)]))
  // Keep physical paths as auditable evidence, while also exposing a stable
  // graph identity independent of each attempt's generated bootstrap location.
  const semanticGraph = {
    roots: roots.map(row => ({ name: row.name, version: row.version, manifestSha256: row.manifestSha256,
      reasons: (row.reasons ?? []).map(({ entry, ...reason }) => reason) })),
    packages: packages.map(identity).sort(ordinal),
    edges: edges.map(row => ({ from: identities.get(row.from), to: identities.get(row.to), name: row.name, type: row.type, requested: row.requested }))
      .sort((a, b) => ordinal(JSON.stringify(a), JSON.stringify(b))),
  }
  return { schemaVersion: 1, target: { platform, arch }, roots, packages, packageCount: packages.length, uniqueNameVersionCount: new Set(packages.map(row => `${row.name}@${row.version}`)).size, edges, edgeCount: edges.length, skipped,
    deterministicGraphSha256: hash(JSON.stringify(semanticGraph)),
    policy: { roots: 'GENERATED_PRODUCTION_PROFILE_AND_BOOTSTRAP_PLUS_FROZEN_CLI_BIN', edges: ['dependencies', 'optionalDependencies', 'requiredPeerDependencies'], devDependencies: 'NEVER_TRAVERSED', optionalPeers: 'NEVER_TRAVERSED', missingRequired: 'FAIL_CLOSED', resolution: 'NODE_ANCESTRY_FIRST_MATCH_WITH_EXACT_BUILT_WORKSPACE_IDENTITY', order: 'ORDINAL_ROOTS_THEN_BREADTH_FIRST_SORTED_DECLARATIONS' } }
}

async function filesIn(source) {
  const files = []
  async function walk(path) {
    for (const entry of (await readdir(join(source, path), { withFileTypes: true })).sort((a, b) => ordinal(a.name, b.name))) {
      if (entry.name === 'node_modules') continue
      const child = path ? `${path}/${entry.name}` : entry.name
      const stat = await lstat(join(source, child))
      assert.ok(!stat.isSymbolicLink(), `PACKAGE_CONTENT_SYMLINK: ${source}/${child}`)
      if (stat.isDirectory()) await walk(child)
      else if (stat.isFile()) files.push({ path: child, bytes: stat.size })
      else assert.fail(`PACKAGE_SPECIAL_FILE: ${source}/${child}`)
    }
  }
  await walk('')
  return files
}

export async function packageContentPlan(source) {
  const value = (await manifest(source)).value
  const files = await filesIn(source)
  const runtimeFields = JSON.stringify({ main: value.main, module: value.module, exports: value.exports, bin: value.bin, dsh: value.dsh })
  const srcReasons = []
  if (/(?:^|["/])src(?:\/|["*])/.test(runtimeFields)) srcReasons.push('MANIFEST_RUNTIME_ENTRY_OR_EXPORT_REFERENCES_SRC')
  // A conservative content check, not an import graph optimizer: no JS is
  // transformed and no runtime module is selectively bundled or reimplemented.
  const runtimeTexts = new Map()
  for (const file of files.filter(row => !isTestContent(row.path) && /\.[cm]?[jt]sx?$/.test(row.path) && !/\.d\.[cm]?ts$/.test(row.path))) {
    const text = await readFile(join(source, file.path), 'utf8')
    runtimeTexts.set(file.path, text)
    if (!file.path.split('/').includes('src') && /["'`][^"'`\r\n]*\bsrc(?:[\/\\]|["'`])/.test(text)) srcReasons.push(`RUNTIME_FILE_REFERENCES_SRC: ${file.path}`)
  }
  // Check retained source entry modules too: an executable src tree may import
  // fixtures just as a built lib tree can. Fail before pruning such a target.
  for (const [path, text] of runtimeTexts) {
    if (path.split('/').includes('src') && srcReasons.length === 0) continue
    for (const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*|\bnew\s+URL\s*\(\s*)["'`]([^"'`\r\n]+)["'`]/g)) {
      if (!match[1].startsWith('.')) continue
      const target = slash(relative(source, resolve(dirname(join(source, path)), match[1])))
      assert.ok(!isTestContent(target), `PRUNING_RUNTIME_IMPORT: ${value.name}/${path} -> ${target}`)
    }
  }
  const retained = []
  const excluded = []
  for (const file of files) {
    let reason
    if (isTestContent(file.path)) reason = 'TEST_FIXTURE_COVERAGE_OR_BUILD_STATE'
    else if (file.path.split('/').includes('src') && srcReasons.length === 0) reason = 'SOURCE_TREE_WITHOUT_RUNTIME_ENTRY_OR_RUNTIME_REFERENCE'
    else if (/(^|\/)(?:tsconfig[^/]*\.json|vitest\.config\.[^/]+|vite\.config\.[^/]+|jest\.config\.[^/]+|\.eslintrc[^/]*|eslint\.config\.[^/]+)$/.test(file.path)) reason = 'DEVELOPMENT_TOOL_CONFIGURATION'
    if (reason) excluded.push({ ...file, reason })
    else retained.push(file)
  }
  // Explicit main/bin/module/exports targets must never be pruned when present.
  function targets(field) { return typeof field === 'string' ? [field] : field && typeof field === 'object' ? Object.values(field).flatMap(targets) : [] }
  for (const target of targets({ main: value.main, module: value.module, exports: value.exports, bin: value.bin })) {
    const clean = target.replace(/^\.\//, '')
    if (!clean.includes('*') && files.some(row => row.path === clean)) assert.ok(retained.some(row => row.path === clean), `PRUNING_RUNTIME_TARGET: ${value.name}/${clean}`)
  }
  return { source, retained, excluded, retainedBytes: retained.reduce((n, row) => n + row.bytes, 0), excludedBytes: excluded.reduce((n, row) => n + row.bytes, 0), srcDisposition: srcReasons.length ? 'RETAIN_RUNTIME_REFERENCED_SRC' : 'EXCLUDE_UNREFERENCED_SOURCE_TREE', srcReasons }
}

// Top-level enumeration is exclusively a negative census, never a root source.
export async function excludedTopLevelPackages(overlay, closure) {
  const reachable = new Set(closure.packages.map(row => row.source))
  const excluded = []
  for (const entry of (await readdir(overlay, { withFileTypes: true })).sort((a, b) => ordinal(a.name, b.name))) {
    if (entry.name.startsWith('.') || entry.name === '@shaco-forge') continue
    const names = entry.name.startsWith('@') ? (await readdir(join(overlay, entry.name))).sort(ordinal).map(name => `${entry.name}/${name}`) : [entry.name]
    for (const name of names) {
      const source = await realpath(join(overlay, name))
      if (reachable.has(source)) continue
      const identity = await manifest(source)
      const files = await filesIn(source)
      excluded.push({ name: identity.value.name, version: identity.value.version, source, manifestSha256: identity.sha256, bytes: files.reduce((n, row) => n + row.bytes, 0), reason: 'UNREACHABLE_FROM_PRODUCTION_ROOTS' })
    }
  }
  return excluded
}

export async function materializeProductionClosure(closure, modules) {
  modules = resolve(modules)
  const placed = new Map()
  const queue = []
  const nodes = new Map(closure.packages.map(row => [row.id, row]))
  const plans = new Map()
  async function place(id, target) {
    assert.ok(within(modules, target))
    if (placed.has(target)) { assert.equal(placed.get(target), id, `AMBIGUOUS_PACKAGE_PLACEMENT: ${target}`); return }
    const node = nodes.get(id)
    const plan = plans.get(id) ?? await packageContentPlan(node.source)
    plans.set(id, plan)
    const kept = new Set(plan.retained.map(row => row.path))
    await cp(node.source, target, { recursive: true, dereference: false, filter: async path => {
      const rel = slash(relative(node.source, path))
      if (rel.split('/').includes('node_modules')) return false
      if ((await lstat(path)).isDirectory()) return rel === '' || [...kept].some(file => file.startsWith(rel + '/'))
      return kept.has(rel)
    } })
    placed.set(target, id)
    queue.push({ id, target })
  }
  function lookup(parent, name) {
    for (let dir = parent; within(modules, dir); dir = dirname(dir)) {
      const target = join(dir, 'node_modules', name)
      if (placed.has(target)) return { target, id: placed.get(target) }
      if (dir === modules) break
    }
    const target = join(modules, name)
    return placed.has(target) ? { target, id: placed.get(target) } : undefined
  }
  for (const root of closure.roots) await place(slash(root.source), join(modules, root.name))
  for (let i = 0; i < queue.length; i++) {
    const parent = queue[i]
    for (const edge of closure.edges.filter(edge => edge.from === parent.id)) {
      if (lookup(parent.target, edge.name)?.id === edge.to) continue
      const target = placed.has(join(modules, edge.name)) ? join(parent.target, 'node_modules', edge.name) : join(modules, edge.name)
      await place(edge.to, target)
    }
  }
  for (const parent of queue) for (const edge of closure.edges.filter(edge => edge.from === parent.id)) assert.equal(lookup(parent.target, edge.name)?.id, edge.to, `PACKAGED_RESOLUTION_MISMATCH: ${parent.target} -> ${edge.name}`)
  return { placements: queue.map(row => ({ packageId: row.id, path: slash(relative(modules, row.target)) })).sort((a, b) => ordinal(a.path, b.path)), pruning: [...plans].map(([id, plan]) => ({ packageId: id, ...plan, retained: undefined })) }
}

export async function verifyProductionClosure(modules, evidence) {
  const expected = new Map(evidence.placements.map(row => [row.path, row.packageId]))
  const nodes = new Map(evidence.packages.map(row => [row.id, row]))
  const reached = new Set(evidence.roots.map(row => slash(row.source)))
  for (let changed = true; changed;) {
    changed = false
    for (const edge of evidence.edges) if (reached.has(edge.from) && !reached.has(edge.to)) { reached.add(edge.to); changed = true }
  }
  assert.equal(reached.size, nodes.size, 'UNREACHABLE_CLOSURE_NODE')
  const seen = []
  const manifests = new Map()
  async function walk(base, prefix = '') {
    for (const entry of await readdir(base, { withFileTypes: true })) {
      assert.ok(!(await lstat(join(base, entry.name))).isSymbolicLink(), 'PACKAGED_LINK_FORBIDDEN')
      if (entry.name.startsWith('@')) { await walk(join(base, entry.name), `${prefix}${entry.name}/`); continue }
      const path = prefix + entry.name
      assert.ok(expected.has(path), `PACKAGE_OUTSIDE_CLOSURE: ${path}`)
      const node = nodes.get(expected.get(path))
      const actual = await manifest(join(base, entry.name))
      manifests.set(path, actual.value)
      assert.equal(actual.sha256, node.manifestSha256, `PACKAGED_MANIFEST_IDENTITY: ${path}`)
      assert.ok(!FORBIDDEN_PACKAGES.includes(actual.value.name))
      for (const file of await filesIn(join(base, entry.name))) assert.ok(!isTestContent(file.path), `TEST_CONTENT_LEAK: ${path}/${file.path}`)
      seen.push(path)
      if (await exists(join(base, entry.name, 'node_modules'))) await walk(join(base, entry.name, 'node_modules'), `${path}/node_modules/`)
    }
  }
  await walk(modules)
  assert.deepEqual(seen.sort(ordinal), [...expected.keys()].sort(ordinal), 'CLOSURE_PACKAGE_MISSING')
  for (const [path, id] of expected) {
    const value = manifests.get(path)
    for (const declaration of dependencyEdges(value)) {
      const edge = evidence.edges.find(edge => edge.from === id && edge.name === declaration.name && edge.type === declaration.type)
      if (!edge) {
        assert.equal(declaration.type, 'optionalDependencies', `MISSING_REQUIRED_GRAPH_EDGE: ${path}/${declaration.name}`)
        assert.ok(evidence.skipped.some(row => row.from === id && row.name === declaration.name && row.type === declaration.type), 'UNEXPLAINED_OPTIONAL_ABSENCE')
        continue
      }
      assert.equal(edge.requested, declaration.requested)
      let actual
      for (let dir = resolve(modules, path); within(resolve(modules), dir); dir = dirname(dir)) {
        actual = expected.get(slash(relative(modules, join(dir, 'node_modules', declaration.name))))
        if (actual || dir === resolve(modules)) break
      }
      actual ??= expected.get(declaration.name)
      assert.equal(actual, edge.to, `ACTUAL_PACKAGE_RESOLUTION_MISMATCH: ${path} -> ${declaration.name}`)
    }
  }
  for (const edge of evidence.edges) {
    const value = manifests.get(evidence.placements.find(row => row.packageId === edge.from)?.path)
    assert.ok(value && dependencyEdges(value).some(row => row.name === edge.name && row.type === edge.type && row.requested === edge.requested), 'NON_PRODUCTION_GRAPH_EDGE')
  }
  return { result: 'PASS', packagedPackageCount: seen.length, reachablePackageIdentities: reached.size, outsideClosure: 0, forbiddenPackages: 'ABSENT', obviousTestContent: 'ABSENT' }
}

export async function comparePreviousPackage(previousEvidence, closure) {
  const previous = JSON.parse(await readFile(join(previousEvidence, 'package-result.json'), 'utf8'))
  const inventory = JSON.parse(await readFile(join(previousEvidence, 'packaged-files.json'), 'utf8')).files
  const packagePath = /^harness\/node_modules\/(?:@[^/]+\/)?[^/]+(?:\/node_modules\/(?:@[^/]+\/)?[^/]+)*\/package\.json$/
  const reachable = new Set(closure.packages.map(row => `${row.name}@${row.version}`))
  const packages = []
  for (const row of inventory.filter(row => packagePath.test(row.path))) {
    const bytes = await readFile(join(previous.packagedRoot, row.path))
    assert.equal(hash(bytes), row.sha256, 'HISTORICAL_PACKAGE_MANIFEST_DRIFT')
    const value = JSON.parse(bytes.toString('utf8'))
    packages.push({ path: row.path.slice(0, -13), name: value.name, version: value.version, bytes: 0, reachable: reachable.has(`${value.name}@${value.version}`) })
  }
  const deepestFirst = [...packages].sort((a, b) => b.path.length - a.path.length)
  for (const file of inventory) {
    const owner = deepestFirst.find(row => file.path.startsWith(row.path + '/'))
    if (owner) owner.bytes += file.bytes
  }
  const unreachable = packages.filter(row => !row.reachable)
  return { previousEvidence, previousArtifactDigest: previous.identity.digest, previousPackageCount: packages.length,
    previousTopLevelPackageCount: packages.filter(row => !row.path.slice('harness/node_modules/'.length).includes('/node_modules/')).length,
    previousUniqueNameVersionCount: new Set(packages.map(row => `${row.name}@${row.version}`)).size,
    unreachableUniqueNameVersionCount: new Set(unreachable.map(row => `${row.name}@${row.version}`)).size,
    previousReleaseFileCount: inventory.length, previousReleaseBytes: inventory.reduce((n, row) => n + row.bytes, 0),
    previousHarnessPackageBytes: packages.reduce((n, row) => n + row.bytes, 0), unreachableCount: unreachable.length,
    unreachableBytes: unreachable.reduce((n, row) => n + row.bytes, 0), unreachablePackages: unreachable,
    measurement: 'Historical sealed manifest paths and identity-verified package manifests; bytes assigned to nearest package owner; unreachable means no production-reachable name/version identity, independent of duplicate placements or content pruning.' }
}
