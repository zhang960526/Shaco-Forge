import { createHash } from 'node:crypto'
import { mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { indexFrozenHarnessPackages, resolvePublicExport } from './frozen-harness-packages.mjs'

const EXPECTED_VERSION = '0.1.2-alpha.1'
const EXPECTED_COMMIT = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
const REVISION = 'shaco-v1-slice-2-step2-cd5ef81'
const REQUIRED = [
  '@deepseek-ai/dsh-client-modules',
  '@deepseek-ai/dsh-client-connection',
  '@deepseek-ai/dsh-api-remotes',
  '@deepseek-ai/dsh-client-ui-theme',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-ui-layout',
  '@deepseek-ai/dsh-client-ui-renderer',
  '@deepseek-ai/dsh-client-ui-session',
  '@deepseek-ai/dsh-client-ui-sidebar',
  '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-client-ui-settings-general',
  '@deepseek-ai/dsh-client-ui-settings-models',
  '@deepseek-ai/dsh-client-ui-conversation',
  '@deepseek-ai/dsh-client-ui-approval',
  '@deepseek-ai/dsh-client-ui-chat',
  '@deepseek-ai/dsh-client-ui-tool',
  '@deepseek-ai/dsh-client-ui-workspace',
  '@deepseek-ai/dsh-client-ui-directory-picker-browse',
  '@deepseek-ai/dsh-client-ui-input-trigger',
  '@deepseek-ai/dsh-client-ui-commands',
  '@deepseek-ai/dsh-client-ui-subagent',
  '@deepseek-ai/dsh-client-ui-model-selection',
  '@deepseek-ai/dsh-client-ui-permission-presets',
  '@deepseek-ai/dsh-client-ui-user-questions',
]
const SUPPORT = [
  '@deepseek-ai/dsh-typert-registry',
  '@deepseek-ai/dsh-api-gateway',
  '@deepseek-ai/dsh-api-session-controller',
  '@deepseek-ai/dsh-api-workspace-controller',
]
const PLATFORM = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
]

function assertPinnedClientGraph(ordered) {
  const expected = [...REQUIRED, ...SUPPORT]
  if (expected.length !== 28 || new Set(expected).size !== 28
    || ordered.length !== 28 || new Set(ordered.map(row => row.id)).size !== 28
    || ordered.some(row => !expected.includes(row.id))
    || ordered[0]?.id !== '@deepseek-ai/dsh-client-modules') {
    throw new Error('Pinned Harness Client graph ordering failed closed')
  }
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const desktopRoot = dirname(scriptDir)
const outRoot = join(desktopRoot, '.generated-client')
const staticRoot = join(outRoot, 'static')
const require = createRequire(import.meta.url)
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (harnessRoot === undefined || harnessRoot.trim() === '') throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const overlayNodeModules = process.env.SHACO_FORGE_HARNESS_OVERLAY_NODE_MODULES
if (overlayNodeModules === undefined || overlayNodeModules.trim() === '') {
  throw new Error('SHACO_FORGE_HARNESS_OVERLAY_NODE_MODULES is required')
}
const packageIndex = indexFrozenHarnessPackages(harnessRoot)

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

async function loadPackage(id) {
  const record = packageIndex.get(id)
  if (record === undefined) throw new Error(`Frozen Harness package is missing: ${id}`)
  const { manifest, manifestPath } = record
  if (manifest.name !== id || manifest.version !== EXPECTED_VERSION) {
    throw new Error(`Harness package identity mismatch for ${id}: ${manifest.name}@${manifest.version}`)
  }
  const declaration = manifest.dsh?.client
  if (declaration?.platform !== 'web') throw new Error(`${id} has no public web Client declaration`)
  const bundlePath = resolvePublicExport(packageIndex, `${id}/client`)
  const bytes = await readFile(bundlePath)
  if (!bytes.subarray(0, 120).toString('utf8').includes('window.__ModuleLoader__.load')) {
    throw new Error(`${id}/client is not a built loader registration bundle`)
  }
  return {
    id,
    url: `shaco-forge://client/static/application.js?rev=${REVISION}`,
    rev: REVISION,
    inject: declaration.inject ?? [],
    external: declaration.external ?? [],
    immediately: declaration.immediately === true,
    bundlePath,
    bundleBytes: bytes.length,
    bundleSha256: sha256(bytes),
  }
}

await rm(outRoot, { recursive: true, force: true })
await mkdir(staticRoot, { recursive: true })
const rows = await Promise.all([...REQUIRED, ...SUPPORT].map(loadPackage))
const clientModulesEntry = resolvePublicExport(packageIndex, '@deepseek-ai/dsh-client-modules', overlayNodeModules)
if (clientModulesEntry === undefined) throw new Error('Pinned Client Modules public export is missing')
const modules = await import(pathToFileURL(clientModulesEntry).href)
const ordered = modules.orderByModuleGraph(rows)
assertPinnedClientGraph(ordered)

// Preserve the exact frozen 28-row order. Append one nonvisual static Product
// observer through its public ./client export; no dynamic Cordis registration.
const { build } = await import(pathToFileURL(await realpath(require.resolve('vite'))).href)
const observerBuild = await build({ configFile: false, publicDir: false, build: {
  lib: { entry: join(desktopRoot, 'src/client/recovery.mjs'), formats: ['cjs'], fileName: () => 'recovery.cjs' },
  write: false, target: 'es2022', minify: false,
} })
const observerCode = observerBuild[0].output.find(item => item.type === 'chunk').code
const observerBytes = Buffer.from(`window.__ModuleLoader__.load({id: '@shaco-forge/desktop', factory: (require) => { const module = {exports: {}}; const exports = module.exports;\n${observerCode}\nreturn module.exports; }});\n`, 'utf8')
const observerPath = join(desktopRoot, 'dist/client/recovery.js')
await mkdir(dirname(observerPath), { recursive: true })
await writeFile(observerPath, observerBytes)
ordered.push({ id: '@shaco-forge/desktop', url: `shaco-forge://client/static/application.js?rev=${REVISION}`, rev: REVISION,
  inject: ['@deepseek-ai/dsh-client-connection', '@deepseek-ai/dsh-api-workspace-controller', '@deepseek-ai/dsh-api-session-controller', '@deepseek-ai/dsh-client-ui-workspace'],
  external: [], immediately: false, bundlePath: observerPath, bundleBytes: observerBytes.length, bundleSha256: sha256(observerBytes) })

const bootstrap = ordered.slice(0, 1)
const application = ordered.slice(1)
const concatenate = async entries => Buffer.concat((await Promise.all(entries.map(async row => {
  const bytes = await readFile(row.bundlePath)
  return Buffer.concat([bytes, Buffer.from('\n;\n', 'utf8')])
}))))
const bootstrapBytes = await concatenate(bootstrap)
const applicationBytes = await concatenate(application)
await writeFile(join(staticRoot, 'bootstrap.js'), bootstrapBytes)
await writeFile(join(staticRoot, 'application.js'), applicationBytes)

const graph = {
  rev: REVISION,
  entries: ordered.map(({ bundlePath: _bundlePath, bundleBytes: _bytes, bundleSha256: _sha, ...row }) => row),
  batches: [
    { phase: 'bootstrap', url: `shaco-forge://client/static/bootstrap.js?rev=${REVISION}`, rev: REVISION, entries: bootstrap.map(row => row.id) },
    { phase: 'application', url: `shaco-forge://client/static/application.js?rev=${REVISION}`, rev: REVISION, entries: application.map(row => row.id) },
  ],
}
const injections = modules.bootInjections(graph)
const facade = injections.find(row => row.kind === 'script')
const graphGlobal = injections.find(row => row.kind === 'global')
if (facade?.kind !== 'script' || graphGlobal?.kind !== 'global') {
  throw new Error('Pinned Harness public boot injections are incomplete')
}
await writeFile(join(staticRoot, 'boot-facade.js'), `${facade.text}\nwindow.${graphGlobal.name} = ${JSON.stringify(graphGlobal.value)};\n`, 'utf8')
// Bundle the same adapter used by unit tests before the frozen Client evaluates.
await build({
  configFile: false,
  publicDir: false,
  build: {
    lib: { entry: join(desktopRoot, 'src/renderer/shell-bootstrap.ts'), name: 'ShacoBootstrap', formats: ['iife'], fileName: () => 'shell-bootstrap.js' },
    outDir: staticRoot,
    emptyOutDir: false,
    target: 'es2022',
    minify: false,
  },
})

const manifest = {
  schemaVersion: 1,
  productSlice: 'V1-SLICE-2-STEP2',
  frozenHarness: { commit: EXPECTED_COMMIT, release: `dsh-v${EXPECTED_VERSION}`, packageVersion: EXPECTED_VERSION },
  composition: { package: '@deepseek-ai/dsh-client-web', export: 'AppWebEntry', publicExportOnly: true },
  reactResolution: { react: require('react/package.json').version, reactDom: require('react-dom/package.json').version },
  graph: { requiredCount: REQUIRED.length, supportCount: SUPPORT.length, frozenHarnessCount: 28, productCount: 1, totalCount: ordered.length, orderedIds: ordered.map(row => row.id) },
  artifacts: ordered.map(row => ({
    id: row.id,
    publicExport: `${row.id}/client`,
    sourcePackagePath: relative(desktopRoot, row.bundlePath).replaceAll('\\', '/'),
    bytes: row.bundleBytes,
    sha256: row.bundleSha256,
  })),
  generated: {
    bootstrapBytes: bootstrapBytes.length,
    bootstrapSha256: sha256(bootstrapBytes),
    applicationBytes: applicationBytes.length,
    applicationSha256: sha256(applicationBytes),
  },
  fixtureOrMockIncluded: false,
  productionDeepSourceImportIncluded: false,
}
if (manifest.reactResolution.react !== '18.3.1' || manifest.reactResolution.reactDom !== '18.3.1') {
  throw new Error(`React resolution mismatch: ${JSON.stringify(manifest.reactResolution)}`)
}
await writeFile(join(outRoot, 'harness-client-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
process.stdout.write(`${JSON.stringify({ result: 'PREPARED', graphCount: ordered.length, react: manifest.reactResolution.react })}\n`)
