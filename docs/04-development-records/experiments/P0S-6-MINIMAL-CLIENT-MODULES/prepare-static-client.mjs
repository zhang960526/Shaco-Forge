import { createHash } from 'node:crypto'
import {
  cpSync,
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const EXPECTED_HARNESS_COMMIT = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
const EXPECTED_HARNESS_VERSION = '0.1.2-alpha.1'
const EXPECTED_HARNESS_LOCK_SHA256 = '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1'
const SPIKE_ROOT = import.meta.dirname
const HARNESS_ROOT = resolve(process.env.P0S6_HARNESS_ROOT || 'D:/Project/Shaco-Forge-Upstream/deepseek-harness')
const WEB_ROOT = join(HARNESS_ROOT, 'apps/web')
const OUT_DIR = join(SPIKE_ROOT, 'client-dist')
const SRC_DIR = join(SPIKE_ROOT, 'src')
const ROSTER_PATH = join(SPIKE_ROOT, 'contract-roster.json')
const REV = 'p0s6-cd5ef81-fixed'
const EXPECTED_REQUIRED = [
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
  '@deepseek-ai/dsh-client-ui-input-trigger',
  '@deepseek-ai/dsh-client-ui-commands',
  '@deepseek-ai/dsh-client-ui-subagent',
  '@deepseek-ai/dsh-client-ui-model-selection',
  '@deepseek-ai/dsh-client-ui-permission-presets',
  '@deepseek-ai/dsh-client-ui-user-questions',
]
const EXPECTED_SUPPORT = [
  '@deepseek-ai/dsh-typert-registry',
  '@deepseek-ai/dsh-api-gateway',
  '@deepseek-ai/dsh-api-session-controller',
  '@deepseek-ai/dsh-api-workspace-controller',
]
const EXPECTED_PLATFORM_SEED = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
]
const OMITTED = [
  '@deepseek-ai/dsh-cordis-host-runner',
  '@deepseek-ai/dsh-cordis-client-runner',
  '@deepseek-ai/dsh-client-ui-cordis',
  '@deepseek-ai/dsh-tool-cordis',
]

function fail(message) {
  throw new Error(`P0.S-6 static preparation stopped: ${message}`)
}

function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function sha256File(path) {
  return sha256Bytes(readFileSync(path))
}

function sameArray(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && actual.every((value, index) => value === expected[index])
}

function runGit(...args) {
  const result = spawnSync('git', ['-c', `safe.directory=${HARNESS_ROOT}`, '-C', HARNESS_ROOT, ...args], {
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.status !== 0) fail(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`)
  return result.stdout.trim()
}

function assertFrozenHarness() {
  const commit = runGit('rev-parse', 'HEAD')
  const status = runGit('status', '--porcelain', '--untracked-files=all')
  const pkg = JSON.parse(readFileSync(join(HARNESS_ROOT, 'package.json'), 'utf8'))
  const lockSha256 = sha256File(join(HARNESS_ROOT, 'pnpm-lock.yaml'))
  if (commit !== EXPECTED_HARNESS_COMMIT) fail(`Harness commit drift: ${commit}`)
  if (status !== '') fail(`Harness worktree is dirty: ${status}`)
  if (pkg.version !== EXPECTED_HARNESS_VERSION) fail(`Harness version drift: ${pkg.version}`)
  if (lockSha256 !== EXPECTED_HARNESS_LOCK_SHA256) fail(`Harness lock drift: ${lockSha256}`)
}

assertFrozenHarness()

const roster = JSON.parse(readFileSync(ROSTER_PATH, 'utf8'))
if (roster.contractId !== 'P0S6-MEC-20260903-01') fail('ContractId mismatch')
if (roster.slice !== 'ONE_FIXED_CLIENT_BOOT_SLICE') fail('Slice mismatch')
if (!sameArray(roster.requiredPackages, EXPECTED_REQUIRED)) fail('REQUIRED package roster drift')
if (!sameArray(roster.supportClosure, EXPECTED_SUPPORT)) fail('Support Closure drift')
if (!sameArray(roster.platformStaticSeed, EXPECTED_PLATFORM_SEED)) fail('platform static seed drift')

const graphSet = new Set([...EXPECTED_REQUIRED, ...EXPECTED_SUPPORT])
if (graphSet.size !== 27) fail(`product graph has ${graphSet.size} unique rows instead of 27`)
for (const id of OMITTED) {
  if (graphSet.has(id)) fail(`omitted component entered product graph: ${id}`)
}

const workspaceManifests = new Map(globSync('packages/*/*/package.json', { cwd: HARNESS_ROOT }).map((item) => {
  const path = join(HARNESS_ROOT, item)
  const pkg = JSON.parse(readFileSync(path, 'utf8'))
  if (typeof pkg.name !== 'string') fail(`workspace package has no name: ${item}`)
  return [pkg.name, { path, pkg }]
}))

const entries = []
for (const id of graphSet) {
  const manifest = workspaceManifests.get(id)
  if (manifest === undefined) fail(`frozen package is missing: ${id}`)
  if (manifest.pkg.version !== EXPECTED_HARNESS_VERSION) fail(`${id} version drift: ${manifest.pkg.version}`)
  const declaration = manifest.pkg.dsh?.client
  if (declaration?.platform !== 'web') fail(`${id} is not a built web Client declaration`)
  const declaredExport = manifest.pkg.exports?.['./client']
  const exportPath = typeof declaredExport === 'string' ? declaredExport : declaredExport?.default
  if (typeof exportPath !== 'string') fail(`${id} has no ./client export`)
  const bundlePath = resolve(dirname(manifest.path), exportPath)
  const bundle = readFileSync(bundlePath)
  if (!bundle.subarray(0, 80).toString('utf8').includes('window.__ModuleLoader__.load')) {
    fail(`${id} built Client artifact is not a loader registration bundle`)
  }
  const inject = declaration.inject === undefined ? [] : [...declaration.inject]
  const external = declaration.external === undefined ? [] : [...declaration.external]
  for (const dependency of inject) {
    if (!graphSet.has(dependency) && !EXPECTED_PLATFORM_SEED.includes(dependency)) {
      fail(`${id} inject dependency escapes the frozen closure: ${dependency}`)
    }
  }
  for (const request of external) {
    const normalized = request.endsWith('/client') ? request.slice(0, -7) : request
    if (!graphSet.has(normalized) && !EXPECTED_PLATFORM_SEED.includes(request)) {
      fail(`${id} external dependency escapes the frozen closure: ${request}`)
    }
  }
  entries.push({
    id,
    bundlePath,
    url: `shaco-forge://client/static/application.js?rev=${REV}`,
    rev: REV,
    ...(inject.length === 0 ? {} : { inject }),
    ...(external.length === 0 ? {} : { external }),
    ...(declaration.immediately === true ? { immediately: true } : {}),
    manifestPath: manifest.path,
  })
}

const modulesManifest = workspaceManifests.get('@deepseek-ai/dsh-client-modules')
if (modulesManifest === undefined) fail('dsh-client-modules manifest disappeared')
const modulesHost = await import(pathToFileURL(join(dirname(modulesManifest.path), 'lib/index.js')).href)
const ordered = modulesHost.orderByModuleGraph(entries)
if (ordered.length !== 27 || new Set(ordered.map((row) => row.id)).size !== 27) fail('ordered graph is not exactly 27 rows')
const modulesIndex = ordered.findIndex((row) => row.id === '@deepseek-ai/dsh-client-modules')
if (modulesIndex !== 0) fail(`dsh-client-modules must be the bootstrap row, observed index ${modulesIndex}`)

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

const webRequire = createRequire(join(WEB_ROOT, 'package.json'))
const { build } = await import(pathToFileURL(webRequire.resolve('vite')).href)
await build({
  configFile: false,
  root: SPIKE_ROOT,
  base: './',
  resolve: {
    alias: {
      '@deepseek-ai/dsh-client-web': join(HARNESS_ROOT, 'packages/client/web/lib/index.js'),
      'node:module': join(WEB_ROOT, 'src/node-module-stub.ts'),
    },
  },
  define: {
    'process.env': '{}',
    'process.env.DSH_CLIENT_VERSION': JSON.stringify(EXPECTED_HARNESS_VERSION),
    'process.env.DSH_CLIENT_COMMIT_HASH': JSON.stringify(EXPECTED_HARNESS_COMMIT.slice(0, 7)),
    'process.env.DSH_CLIENT_GIT_DIRTY': JSON.stringify('false'),
    'process.env.CORDIS_SHARED': 'undefined',
    'process.versions.node': JSON.stringify('0.0.0'),
    'process.execArgv': '[]',
  },
  build: {
    target: 'es2022',
    outDir: OUT_DIR,
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: join(SRC_DIR, 'renderer-probe.js'),
      formats: ['es'],
      fileName: () => 'client-shell.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})

const bootstrap = [ordered[0]]
const application = ordered.slice(1)
const statementSeparator = Buffer.from('\n;\n', 'utf8')
const concatenate = (rows) => Buffer.concat(rows.flatMap((row) => [readFileSync(row.bundlePath), statementSeparator]))
mkdirSync(join(OUT_DIR, 'static'), { recursive: true })
writeFileSync(join(OUT_DIR, 'static/bootstrap.js'), concatenate(bootstrap))
writeFileSync(join(OUT_DIR, 'static/application.js'), concatenate(application))

const graph = {
  rev: REV,
  entries: ordered.map(({ bundlePath: _bundlePath, manifestPath: _manifestPath, ...row }) => row),
  batches: [
    {
      phase: 'bootstrap',
      url: `shaco-forge://client/static/bootstrap.js?rev=${REV}`,
      rev: REV,
      entries: bootstrap.map((row) => row.id),
    },
    {
      phase: 'application',
      url: `shaco-forge://client/static/application.js?rev=${REV}`,
      rev: REV,
      entries: application.map((row) => row.id),
    },
  ],
}
const injectionRows = modulesHost.bootInjections(graph)
const facade = injectionRows.find((row) => row.kind === 'script')
const graphGlobal = injectionRows.find((row) => row.kind === 'global')
if (facade?.kind !== 'script' || graphGlobal?.kind !== 'global') fail('Harness boot injections are incomplete')
writeFileSync(join(OUT_DIR, 'boot-facade.js'), `${facade.text}\nwindow.${graphGlobal.name} = ${JSON.stringify(graphGlobal.value)};\n`, 'utf8')
cpSync(join(SRC_DIR, 'shell-bootstrap.js'), join(OUT_DIR, 'shell-bootstrap.js'))

const cssFiles = globSync('**/*.css', { cwd: OUT_DIR }).sort()
const cssLinks = cssFiles.map((path) => `    <link rel="stylesheet" href="./${path.split(sep).join('/')}" />`).join('\n')
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shaco Forge P0.S-6</title>
${cssLinks}
    <script src="./shell-bootstrap.js"></script>
    <script src="./boot-facade.js"></script>
    <script src="./static/bootstrap.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./client-shell.js"></script>
  </body>
</html>
`
writeFileSync(join(OUT_DIR, 'index.html'), indexHtml, 'utf8')

const artifactRows = ordered.map((row) => ({
  id: row.id,
  role: EXPECTED_REQUIRED.includes(row.id) ? 'REQUIRED' : 'SUPPORT_CLOSURE',
  source: `harness:${relative(HARNESS_ROOT, row.bundlePath).split(sep).join('/')}`,
  manifest: `harness:${relative(HARNESS_ROOT, row.manifestPath).split(sep).join('/')}`,
  bundleBytes: readFileSync(row.bundlePath).byteLength,
  bundleSha256: sha256File(row.bundlePath),
  inject: row.inject ?? [],
  external: row.external ?? [],
  immediately: row.immediately === true,
}))
const apiRemotesText = readFileSync(entries.find((row) => row.id === '@deepseek-ai/dsh-api-remotes').bundlePath, 'utf8')
const descriptorMarker = '@deepseek-ai/dsh-cordis-host-runner'
const descriptorMarkerCount = apiRemotesText.split(descriptorMarker).length - 1
if (descriptorMarkerCount < 1 || !apiRemotesText.includes('dynamicCordisRunner')) {
  fail('api-remotes/client no longer contains the disclosed cordis-host-runner descriptor contribution')
}

const manifest = {
  schemaVersion: 1,
  notProduction: true,
  contractId: roster.contractId,
  slice: roster.slice,
  frozenHarness: {
    commit: EXPECTED_HARNESS_COMMIT,
    version: EXPECTED_HARNESS_VERSION,
    lockSha256: EXPECTED_HARNESS_LOCK_SHA256,
  },
  productGraph: {
    requiredCount: EXPECTED_REQUIRED.length,
    supportClosureCount: EXPECTED_SUPPORT.length,
    totalCount: ordered.length,
    orderedIds: ordered.map((row) => row.id),
    requiredRoster: EXPECTED_REQUIRED,
    supportClosure: EXPECTED_SUPPORT,
  },
  platformStaticSeed: EXPECTED_PLATFORM_SEED,
  artifactAssembly: {
    mode: 'RAW_BUILT_CLIENT_ARTIFACT_BYTE_CONCATENATION_WITH_STATEMENT_SEPARATOR',
    staticArtifactSemanticTransformation: false,
    harnessBuiltArtifactsModified: false,
    bootstrapBundleSha256: sha256File(join(OUT_DIR, 'static/bootstrap.js')),
    applicationBundleSha256: sha256File(join(OUT_DIR, 'static/application.js')),
    shellBundleSha256: sha256File(join(OUT_DIR, 'client-shell.js')),
    indexSha256: sha256File(join(OUT_DIR, 'index.html')),
  },
  artifacts: artifactRows,
  omissions: OMITTED.map((id) => ({ id, inGraph: false })),
  apiRemotesCordisHostDescriptorReference: {
    owner: '@deepseek-ai/dsh-api-remotes/client',
    referencedPackage: '@deepseek-ai/dsh-cordis-host-runner/remote',
    builtArtifactMarker: descriptorMarker,
    markerCount: descriptorMarkerCount,
    classification: 'STATIC_DESCRIPTOR_BFF_REFERENCE_ONLY',
    runnerRuntimeActivation: false,
  },
  cspConstraint: {
    requiredByUnmodifiedVendoredLoader: true,
    allowance: "script-src 'self' 'unsafe-eval'",
    semanticArtifactPatchAvoided: true,
  },
  adapterStubInventory: [
    {
      classification: 'STUB',
      surface: '@deepseek-ai/dsh-client-connection built fixture RPC selected by ?fixture',
      reason: 'activate the fixed Client graph without Worker, Host, authentication, Named Pipe, or stock WebServer',
      productGraphModule: false,
      harnessCoreModified: false,
      productionImpact: 'NOT_PRODUCTION; full Session workflow is outside this Gate',
    },
    {
      classification: 'ADAPTER',
      surface: 'P0.S-2 accepted Vite node:module browser path mapping',
      reason: 'bundle the public AppWebEntry shell for a browser Renderer',
      productGraphModule: false,
      harnessCoreModified: false,
      productionImpact: 'NOT_PRODUCTION build-time path mapping',
    },
    {
      classification: 'ADAPTER',
      surface: 'sandboxed preload evidence bridge',
      reason: 'return bounded boot evidence to Electron Main',
      productGraphModule: false,
      harnessCoreModified: false,
      productionImpact: 'NOT_PRODUCTION evidence instrumentation',
    },
  ],
}
writeFileSync(join(OUT_DIR, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({
  result: 'PREPARED',
  requiredCount: EXPECTED_REQUIRED.length,
  supportClosureCount: EXPECTED_SUPPORT.length,
  productGraphCount: ordered.length,
  omittedCount: OMITTED.length,
  staticArtifactSemanticTransformation: false,
}))

