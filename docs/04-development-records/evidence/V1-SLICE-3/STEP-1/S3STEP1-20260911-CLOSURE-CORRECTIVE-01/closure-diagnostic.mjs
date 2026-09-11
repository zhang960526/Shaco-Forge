import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '../../../../../..')
const { materializeHarnessProfile } = await import(pathToFileURL(join(root, 'apps/worker/dist/profile.js')))
const utility = join(root, 'scripts/harness-production-closure.mjs')
const { discoverProductionRoots, calculateProductionClosure, excludedTopLevelPackages } = await import(pathToFileURL(utility))
const attempt = process.argv[2]
if (!/^\d+$/.test(attempt)) throw new Error('Explicit diagnostic attempt required')
const work = join(root, 'dist/corrective-probes', attempt)
const overlay = join(root, 'node_modules/.shaco-forge-build/runtime-overlay/node_modules')
const modules = join(work, 'node_modules')
await mkdir(modules, { recursive: true })
const result = { attempt, utilitySha256: createHash('sha256').update(await readFile(utility)).digest('hex'), phase: 'DEVELOPMENT_DIAGNOSTIC' }
try {
  const profile = await materializeHarnessProfile(work, 'shaco-forge', join(root, 'apps/worker/dist/harness-readiness.js'), join(root, 'apps/worker/host-profile/connection-compatibility.mjs'), join(root, 'apps/worker/host-profile/carrier-gateway.mjs'), join(root, 'apps/worker/host-profile/events-route-preflight.mjs'), join(overlay, '@deepseek-ai'), modules)
  const bootstrap = join(profile, 'node_modules/@shaco-forge/harness-bootstrap')
  const roots = await discoverProductionRoots({ overlay, profile, bootstrap })
  result.roots = roots
  const closure = await calculateProductionClosure({ roots, overlay, allowedSourceRoots: [overlay, 'D:/Project/Shaco-Forge-Upstream/deepseek-harness', work], frozenRoot: 'D:/Project/Shaco-Forge-Upstream/deepseek-harness' })
  closure.excludedTopLevelPackages = await excludedTopLevelPackages(overlay, closure)
  await writeFile(join(import.meta.dirname, `closure-diagnostic-${attempt}-graph.json`), JSON.stringify(closure, null, 2) + '\n', 'utf8')
  Object.assign(result, { result: 'PASS', packageCount: closure.packageCount, edgeCount: closure.edgeCount, excludedTopLevelCount: closure.excludedTopLevelPackages.length })
} catch (error) {
  Object.assign(result, { result: 'FAIL', error: String(error), stack: error.stack })
  process.exitCode = 1
}
await writeFile(join(import.meta.dirname, `closure-diagnostic-${attempt}.json`), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify({ ...result, roots: result.roots?.map(row => row.name) }, null, 2))
