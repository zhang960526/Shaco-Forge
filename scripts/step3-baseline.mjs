import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const output = resolve(root, 'docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-IMPLEMENTATION-01')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const contractPath = 'docs/03-v1.0-plan/V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-CONTRACT-GATE.md'
const contract = await readFile(resolve(root, contractPath))
assert.equal(sha(contract), '6cad09319e8793c4cebf95c4dfae4cd04f644adbed1b0c51647e93901e42721b')
const manifestBytes = await readFile(resolve(root, 'apps/desktop/.generated-client/harness-client-manifest.json'))
assert.equal(sha(manifestBytes), '3c84efd8417a8925fd8fb649e64f8b5b96a3f36eb6a371f78be169db8a183eff')
const manifest = JSON.parse(manifestBytes)
const roster = [...contract.toString('utf8').matchAll(/\| (\d+) \| `([^`]+)` \| `([^`]+)` \| `([a-f0-9]{64})` \|/g)].map(m => ({ order: Number(m[1]), id: m[2], publicExport: m[3], sha256: m[4] }))
assert.equal(roster.length, 28)
assert.equal(manifest.artifacts.length, 29)
for (const [i, row] of manifest.artifacts.entries()) {
  if (i < 28) assert.deepEqual({ order: i + 1, id: row.id, publicExport: row.publicExport, sha256: row.sha256 }, roster[i])
  assert.equal(sha(await readFile(resolve(root, 'apps/desktop', row.sourcePackagePath))), row.sha256)
}
for (const artifact of ['bootstrap', 'application']) assert.equal(sha(await readFile(resolve(root, `apps/desktop/.generated-client/static/${artifact}.js`))), manifest.generated[`${artifact}Sha256`])
const all = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString('utf8').split('\0').filter(Boolean)
const immutable = all.filter(p => p.startsWith('docs/') && (p.includes('/evidence/V1-SLICE-2/STEP-') || /STEP[12]|AUDIT-025|CONTRACT-GATE|LIFECYCLE-NATIVE-RECONNECT-CONTRACT|CARRIER-LIFECYCLE-AMENDMENT|SECURITY-MODEL|CUMULATIVE-REGRESSION-CLOSURE-GATE/.test(p)))
const identity = async path => { const bytes = await readFile(resolve(root, path)); return { path, bytes: bytes.length, sha256: sha(bytes) } }
const encodings = []
for (const path of all.filter(p => /^(apps|packages|scripts)\//.test(p) && /\.(ts|cts|mjs|js|json|html|css|md)$/.test(p))) {
  const bytes = await readFile(resolve(root, path))
  new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  encodings.push({ path, encoding: bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])) ? 'UTF-8-BOM' : 'UTF-8' })
}
await mkdir(output, { recursive: true })
await writeFile(resolve(output, 'baseline.json'), JSON.stringify({ result: 'PASS', gate: 'S3G01', startingBranch: 'master', startingHead: '5118053f625d01faba6617cace481df3091ba5be', frozenHarnessHead: manifest.frozenHarness.commit, contractSha256: sha(contract), entryManifestSha256: sha(manifestBytes), entryManifest: manifest, roster, immutable: await Promise.all(immutable.map(identity)), encodings, providerRuns: 0 }, null, 2) + '\n', 'utf8')
console.log('S3G01 PASS; initial UTF-8 and immutable identities captured')
