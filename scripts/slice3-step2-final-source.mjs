// Source-bound acceptance; this script neither commits nor closes Owner gates.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const evidence = join(root, 'docs/04-development-records/evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01')
const git = process.env.SHACO_FORGE_GIT ?? 'git'
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const json = value => JSON.stringify(value, null, 2) + '\n'
const entry = '514e1759b4991e950d5ad5169e3fc86dc3cc025f'
const required = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'test:full-shaco', 'smoke:full-shaco', 'package:runtime', 'test:packaged-runtime', 'smoke:packaged-runtime', 'test:slice3-step2', 'smoke:slice3-step2', 'package:installer', 'test:installer', 'verify:f05']
const scope = path => path && (/^(apps|packages|scripts)\//.test(path) || ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json'].includes(path))
const mode = process.argv[2]
assert.ok(['freeze', 'verify-final', 'verify-commit'].includes(mode))
execFileSync(git, ['merge-base', '--is-ancestor', entry, 'HEAD'], { cwd: root })
assert.equal(hash(await readFile(join(root, 'docs/03-v1.0-plan/V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md'))), '35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76')
const upstream = 'D:/Project/Shaco-Forge-Upstream/deepseek-harness'
assert.equal(execFileSync(git, ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim(), 'cd5ef8148158c3a752a658978873241fdf8e2bbc')
assert.equal(execFileSync(git, ['status', '--porcelain'], { cwd: upstream, encoding: 'utf8' }).trim(), '')
const paths = execFileSync(git, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root }).toString('utf8').split('\0').filter(scope).sort()
const source = await Promise.all(paths.map(async path => ({ path, sha256: hash(await readFile(join(root, path))) })))
const digest = hash(json(source))
const frozenPath = join(evidence, 'final-source-inventory.json')
if (mode === 'freeze') {
  const history = await readFile(join(evidence, 'final-source-history.json'), 'utf8').then(JSON.parse).catch(() => [])
  history.push({ at: new Date().toISOString(), digest, source })
  await writeFile(join(evidence, 'final-source-history.json'), json(history), 'utf8')
  await writeFile(frozenPath, json(source), 'utf8')
  await writeFile(join(evidence, 'final-source-identity.json'), json({ entry, digest, fileCount: source.length, required, ownerGatesClosed: false }), 'utf8')
} else {
  assert.deepEqual(source, JSON.parse(await readFile(frozenPath, 'utf8')), 'FINAL_SOURCE_CHANGED')
  if (mode === 'verify-final') {
    const ledger = JSON.parse(await readFile(join(evidence, 'test-summary.json'), 'utf8'))
    const accepted = required.map(command => {
      const row = ledger.commands.findLast(row => row.command === command && row.phase === 'FINAL_REGRESSION' && row.sourceBefore === digest && row.sourceAfter === digest)
      assert.ok(row && row.exitCode === 0 && row.result === 'PASS', 'FINAL_GATE_MISSING_OR_FAILED:' + command)
      return row
    })
    const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
    const release = JSON.parse(await readFile(join(location.packagedRoot, 'release-manifest.json'), 'utf8'))
    assert.equal(release.BuildProvenance.sourceInventorySha256, digest)
    const artifact = JSON.parse(await readFile(join(location.packagedRoot, 'artifact-identity.json'), 'utf8'))
    const installer = JSON.parse(await readFile(join(root, 'dist/installer-candidate-location.json'), 'utf8'))
    assert.equal(installer.packagedArtifactDigest, artifact.digest)
    assert.equal(installer.sha256, hash(await readFile(installer.path)))
    const report = async (command, filename) => {
      const row = accepted.find(row => row.command === command)
      return JSON.parse(await readFile(join(evidence, 'runs', command.replaceAll(':', '-') + '-' + row.attempt, filename), 'utf8'))
    }
    assert.equal((await report('smoke:packaged-runtime', 'packaged-step2-summary.json')).artifactDigest, artifact.digest)
    assert.equal((await report('test:installer', 'installer-verification.json')).candidate.sha256, installer.sha256)
    assert.equal((await report('smoke:slice3-step2', 'step2-integration.json')).results.find(row => row.id === 'FRESH_INSTALL').transaction.target.artifactDigest, artifact.digest)
    await writeFile(join(evidence, 'final-gate-results.json'), json({ result: 'PASS_NON_HUMAN_GATES', sourceDigest: digest, accepted, artifact, installer,
      providerRuns: 0, signingRuns: 0, independentReview: 'NOT_STARTED', ownerClosure: 'NOT_PERFORMED' }), 'utf8')
  } else {
    const committed = execFileSync(git, ['ls-tree', '-r', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(scope).sort()
    assert.deepEqual(committed, source.map(row => row.path))
    for (const row of source) assert.equal(hash(execFileSync(git, ['show', 'HEAD:' + row.path], { cwd: root, maxBuffer: 64 * 1024 * 1024 })), row.sha256, row.path)
    assert.equal(execFileSync(git, ['rev-list', '--count', entry + '..HEAD'], { cwd: root, encoding: 'utf8' }).trim(), '1')
    const commit = execFileSync(git, ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
    await writeFile(join(root, 'dist/slice3-step2-candidate-commit-verification.json'), json({ result: 'PASS', commit, sourceDigest: digest, fileCount: source.length, localCommitCount: 1, push: false }), 'utf8')
  }
}
console.log(json({ result: 'PASS', mode, sourceDigest: digest, fileCount: source.length }))
