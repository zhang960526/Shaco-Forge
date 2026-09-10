import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { paths } from './runtime-paths.mjs'

export const runId = process.env.SHACO_FORGE_STEP2_RUN_ID ?? `STEP2-REGRESSION-${new Date().toISOString().replaceAll(':', '-')}`
export const evidenceRoot = process.env.SHACO_FORGE_STEP2_EVIDENCE_ROOT ?? join(paths.root, 'node_modules/.step2-regression', runId)
export async function evidence(name, value) {
  await mkdir(evidenceRoot, { recursive: true })
  await writeFile(join(evidenceRoot, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
export async function identity(path) {
  const bytes = await readFile(join(paths.root, path))
  return { path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
}
if (process.argv.includes('--baseline')) {
  assert.equal(process.version, 'v22.19.0')
  await assert.rejects(readFile(join(evidenceRoot, 'run-manifest.json')), { code: 'ENOENT' })
  const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  const historical = tracked.filter(path => /(?:STEP-1\/|STEP1|AUDIT-02[0-3]|step1-(?:identity|server-attestation|non-product))/.test(path)
    || /(?:V1-SLICE-2-.*(?:CONTRACT|AMENDMENT)|SHACO-FORGE-SECURITY-MODEL|V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT|CUMULATIVE-REGRESSION-CLOSURE-GATE)/.test(path))
  const source = tracked.filter(path => /^(?:apps|packages|scripts)\//.test(path) || path === 'package.json')
  await evidence('run-manifest.json', {
    runId, startedAt: new Date().toISOString(), result: 'IN_PROGRESS',
    baseline: { branch: 'master', productHead: 'f6349029fe87a1333c2e6c57cfaba1d512d86c02', productState: 'CLEAN', staged: 'NONE', untracked: 'NONE', harnessHead: 'cd5ef8148158c3a752a658978873241fdf8e2bbc', harnessState: 'CLEAN' },
    historicalPre: await Promise.all(historical.map(identity)), sourcePre: await Promise.all(source.map(identity)),
    toolchain: { node: process.version, pnpm: '11.7.0', dotnet: '10.0.302', electron: '35.7.5' },
    providerRuns: 0, commit: false, push: false,
  })
  console.log(JSON.stringify({ result: 'BASELINE_CAPTURED', historicalFiles: historical.length, sourceFiles: source.length }))
}
