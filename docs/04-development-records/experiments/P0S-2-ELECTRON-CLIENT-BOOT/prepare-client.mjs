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
const HARNESS_ROOT = resolve(process.env.P0S2_HARNESS_ROOT || 'D:/Project/Shaco-Forge-Upstream/deepseek-harness')
const WEB_ROOT = join(HARNESS_ROOT, 'apps/web')
const OUT_DIR = join(SPIKE_ROOT, 'client-dist')
const SRC_DIR = join(SPIKE_ROOT, 'src')
const REV = 'p0s2-cd5ef81'
const ADAPTER_ID = '@shaco-forge/p0s2-settings-capability-adapter'
const CORDIS_EVALUATOR = `const evaluate = new Function("ctx", "expr", \`
  with (ctx) {
    return eval(expr)
  }
\`);`
const CSP_SAFE_EVALUATOR = `const evaluate = (_ctx, expr) => {
  throw new Error(\`P0.S-2 strict-CSP adapter rejects dynamic loader expression: \${String(expr)}\`);
};`
let cspAdapterApplications = 0
const strictCspLoaderAdapter = {
  name: 'p0s2-strict-csp-loader-adapter',
  enforce: 'pre',
  transform(code, id) {
    if (!id.replaceAll('\\\\', '/').endsWith('/vendor/loader/lib/index.js')) return undefined
    const matches = code.split(CORDIS_EVALUATOR).length - 1
    if (matches !== 1) throw new Error(`strict-CSP loader adapter expected one evaluator, found ${matches}`)
    cspAdapterApplications += 1
    return { code: code.replace(CORDIS_EVALUATOR, CSP_SAFE_EVALUATOR), map: null }
  },
}

function runGit(...args) {
  const result = spawnSync('git', ['-c', `safe.directory=${HARNESS_ROOT}`, '-C', HARNESS_ROOT, ...args], {
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`)
  return result.stdout.trim()
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function assertFrozenHarness() {
  const commit = runGit('rev-parse', 'HEAD')
  const status = runGit('status', '--porcelain')
  const pkg = JSON.parse(readFileSync(join(HARNESS_ROOT, 'package.json'), 'utf8'))
  const lockSha256 = sha256File(join(HARNESS_ROOT, 'pnpm-lock.yaml'))
  if (commit !== EXPECTED_HARNESS_COMMIT) throw new Error(`Harness commit drift: ${commit}`)
  if (status !== '') throw new Error(`Harness worktree is dirty:\n${status}`)
  if (pkg.version !== EXPECTED_HARNESS_VERSION) throw new Error(`Harness version drift: ${pkg.version}`)
  if (lockSha256 !== EXPECTED_HARNESS_LOCK_SHA256) throw new Error(`Harness lock drift: ${lockSha256}`)
}

assertFrozenHarness()

const webRequire = createRequire(join(WEB_ROOT, 'package.json'))
const webBundleRequire = createRequire(join(HARNESS_ROOT, 'packages/bundle/web-app/package.json'))
const { build } = await import(pathToFileURL(webRequire.resolve('vite')).href)
const reactModule = await import(pathToFileURL(webRequire.resolve('@vitejs/plugin-react')).href)
const react = reactModule.default
const modulesHost = await import(pathToFileURL(join(HARNESS_ROOT, 'packages/client/modules/lib/index.js')).href)
const appBoot = await import(pathToFileURL(webBundleRequire.resolve('@deepseek-ai/dsh-app-boot')).href)

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

await build({
  configFile: false,
  root: WEB_ROOT,
  base: './',
  plugins: [strictCspLoaderAdapter, react()],
  resolve: {
    alias: {
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
    rollupOptions: { input: join(WEB_ROOT, 'index.html') },
  },
})
if (cspAdapterApplications !== 1) {
  throw new Error(`strict-CSP loader adapter application count: ${cspAdapterApplications}`)
}

const bundleLayers = [
  {
    manifest: join(HARNESS_ROOT, 'packages/bundle/base/package.json'),
    patch: join(HARNESS_ROOT, 'packages/bundle/base/cordis.patch.yml'),
  },
  {
    manifest: join(HARNESS_ROOT, 'packages/bundle/web-app/package.json'),
    patch: join(HARNESS_ROOT, 'packages/bundle/web-app/cordis.patch.yml'),
  },
]
const workspaceManifests = new Map(globSync('packages/*/*/package.json', { cwd: HARNESS_ROOT }).map((item) => {
  const path = join(HARNESS_ROOT, item)
  const pkg = JSON.parse(readFileSync(path, 'utf8'))
  if (typeof pkg.name !== 'string') throw new Error(`workspace package has no name: ${path}`)
  return [pkg.name, path]
}))

const composed = appBoot.composeEntries(bundleLayers.map((layer) =>
  appBoot.loadOverlayPatches('P0.S-2 Electron Client Boot', layer.patch)))
const plugins = new Map()
for (const entry of composed) {
  if (entry.disabled === true || typeof entry.name !== 'string') continue
  const manifestPath = workspaceManifests.get(entry.name)
  if (manifestPath === undefined) continue
  const pkg = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const declaration = pkg.dsh?.client
  if (declaration?.platform !== 'web') continue
  const declaredExport = pkg.exports?.['./client']
  const exportPath = typeof declaredExport === 'string' ? declaredExport : declaredExport?.default
  if (typeof exportPath !== 'string') throw new Error(`${entry.name} has no ./client export`)
  const bundlePath = resolve(dirname(manifestPath), exportPath)
  plugins.set(entry.name, {
    id: entry.name,
    bundlePath,
    url: `shaco-forge://client/plugins/application.js?rev=${REV}`,
    rev: REV,
    ...(declaration.inject === undefined ? {} : { inject: declaration.inject }),
    ...(declaration.external === undefined ? {} : { external: declaration.external }),
    ...(declaration.immediately === true ? { immediately: true } : {}),
  })
}

const ordered = modulesHost.orderByModuleGraph([...plugins.values()]).map(({ id }) => plugins.get(id))
const modulesIndex = ordered.findIndex((row) => row.id === '@deepseek-ai/dsh-client-modules')
const remotesIndex = ordered.findIndex((row) => row.id === '@deepseek-ai/dsh-api-remotes')
if (modulesIndex < 0 || remotesIndex < 0) throw new Error('required Harness Client bootstrap rows are missing')
const adapter = {
  id: ADAPTER_ID,
  bundlePath: join(SRC_DIR, 'settings-capability-adapter.js'),
  url: `shaco-forge://client/plugins/application.js?rev=${REV}`,
  rev: REV,
  inject: ['@deepseek-ai/dsh-client-connection', '@deepseek-ai/dsh-api-remotes'],
  immediately: true,
}
ordered.splice(remotesIndex + 1, 0, adapter)

const bootstrap = ordered.filter((row) => row.id === '@deepseek-ai/dsh-client-modules')
const application = ordered.filter((row) => row.id !== '@deepseek-ai/dsh-client-modules')
const graph = {
  rev: REV,
  entries: ordered.map(({ bundlePath: _bundlePath, ...row }) => row),
  batches: [
    {
      phase: 'bootstrap',
      url: `shaco-forge://client/plugins/bootstrap.js?rev=${REV}`,
      rev: REV,
      entries: bootstrap.map((row) => row.id),
    },
    {
      phase: 'application',
      url: `shaco-forge://client/plugins/application.js?rev=${REV}`,
      rev: REV,
      entries: application.map((row) => row.id),
    },
  ],
}

const pluginDir = join(OUT_DIR, 'plugins')
mkdirSync(pluginDir, { recursive: true })
writeFileSync(join(pluginDir, 'bootstrap.js'), bootstrap.map((row) => readFileSync(row.bundlePath, 'utf8')).join('\n;\n'), 'utf8')
writeFileSync(join(pluginDir, 'application.js'), application.map((row) => readFileSync(row.bundlePath, 'utf8')).join('\n;\n'), 'utf8')

const injectionRows = modulesHost.bootInjections(graph)
const facade = injectionRows.find((row) => row.kind === 'script')
const graphGlobal = injectionRows.find((row) => row.kind === 'global')
if (facade?.kind !== 'script' || graphGlobal?.kind !== 'global') throw new Error('Harness boot injections are incomplete')
writeFileSync(join(OUT_DIR, 'boot-facade.js'), `${facade.text}\nwindow.${graphGlobal.name} = ${JSON.stringify(graphGlobal.value)};\n`, 'utf8')
cpSync(join(SRC_DIR, 'shell-bootstrap.js'), join(OUT_DIR, 'shell-bootstrap.js'))
cpSync(join(SRC_DIR, 'renderer-probe.js'), join(OUT_DIR, 'renderer-probe.js'))

const indexPath = join(OUT_DIR, 'index.html')
const originalIndex = readFileSync(indexPath, 'utf8')
const scripts = [
  '<script src="./boot-facade.js"></script>',
  '<script src="./shell-bootstrap.js"></script>',
  '<script src="./plugins/bootstrap.js"></script>',
].join('')
const withBootstrap = originalIndex.replace('<script type="module"', `${scripts}<script type="module"`)
const finalIndex = withBootstrap.replace('</body>', '<script type="module" src="./renderer-probe.js"></script></body>')
if (finalIndex === originalIndex) throw new Error('failed to inject P0.S-2 boot scripts')
writeFileSync(indexPath, finalIndex, 'utf8')

const artifactRows = ordered.map((row) => ({
  id: row.id,
  source: row.id === ADAPTER_ID
    ? `spike:${relative(SPIKE_ROOT, row.bundlePath).split(sep).join('/')}`
    : `harness:${relative(HARNESS_ROOT, row.bundlePath).split(sep).join('/')}`,
  sha256: sha256File(row.bundlePath),
  customAdapter: row.id === ADAPTER_ID,
}))
writeFileSync(join(OUT_DIR, 'build-manifest.json'), `${JSON.stringify({
  notProduction: true,
  harnessCommit: EXPECTED_HARNESS_COMMIT,
  harnessVersion: EXPECTED_HARNESS_VERSION,
  harnessLockSha256: EXPECTED_HARNESS_LOCK_SHA256,
  graphRevision: REV,
  entryCount: graph.entries.length,
  bootstrapBundleSha256: sha256File(join(pluginDir, 'bootstrap.js')),
  applicationBundleSha256: sha256File(join(pluginDir, 'application.js')),
  compatibilityAdapters: [{
    id: 'p0s2-strict-csp-loader-adapter',
    scope: '@deepseek-ai/cordis-plugin-loader dynamic __jsExpr evaluator',
    behavior: 'reject dynamic loader expressions; preserve script-src self without unsafe-eval',
    applications: cspAdapterApplications,
    harnessCoreModified: false,
  }],
  artifacts: artifactRows,
}, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({ outDir: OUT_DIR, entryCount: graph.entries.length, harnessCommit: EXPECTED_HARNESS_COMMIT }))
