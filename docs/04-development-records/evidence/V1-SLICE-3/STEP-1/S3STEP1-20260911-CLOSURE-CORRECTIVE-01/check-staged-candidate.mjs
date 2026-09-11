// Read-only pre-commit check. No commit hash is written into its own evidence.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
const evidence = import.meta.dirname
const root = resolve(evidence, '../../../../../..')
const git = args => execFileSync('git', ['-c', 'core.safecrlf=false', ...args], { cwd: root, maxBuffer: 32 * 1024 * 1024 })
assert.equal(git(['rev-parse', 'HEAD']).toString().trim(), 'bdf0cbfeade58ae288ece1b8b94ba5c91346c97a')
const location = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const source = JSON.parse(await readFile(join(location.evidence, 'source-inventory.json'), 'utf8'))
const validation = JSON.parse(await readFile(join(evidence, 'final-validation.json'), 'utf8'))
assert.equal(validation.result, 'PASS')
assert.equal(validation.gates.length, 18)
for (const row of source) assert.equal(createHash('sha256').update(git(['show', `:${row.path}`])).digest('hex'), row.sha256, `STAGED_SOURCE_BYTE_MISMATCH: ${row.path}`)
const allowed = new Set([
  'scripts/harness-production-closure.mjs', 'scripts/harness-production-closure.test.mjs',
  'scripts/package-runtime.mjs', 'scripts/packaged-runtime.test.mjs', 'scripts/smoke-packaged-runtime.mjs',
  'scripts/slice3-step1-command.mjs', 'scripts/windows-desktop-test.ps1', 'scripts/verify-slice3-step1-evidence.mjs',
  'docs/00-governance/SHACO-FORGE-CURRENT-STATE.md', 'docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md',
  'docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md', 'docs/04-development-records/DEVELOPMENT-LOG.md',
  'docs/05-reviews/REVIEW-INDEX.md', 'docs/07-handover/CURRENT-CHECKPOINT.md',
  'docs/05-reviews/architecture/AUDIT-029-V1-SLICE-3-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md',
  'docs/04-development-records/V1-SLICE-3-STEP1-PACKAGE-CONTENT-CLOSURE-CORRECTIVE-IMPLEMENTATION-RECORD.md',
])
const prefix = 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-CLOSURE-CORRECTIVE-01/'
const changed = git(['diff', '--cached', '--name-only', '-z']).toString().split('\0').filter(Boolean)
for (const path of changed) assert.ok(allowed.has(path) || path.startsWith(prefix), `SCOPE_EXPANSION: ${path}`)
assert.equal(git(['diff', '--cached', '--name-only', '--diff-filter=D']).toString(), '')
assert.equal(git(['diff', '--name-only']).toString(), '', 'UNSTAGED_CHANGE')
assert.equal(git(['ls-files', '--others', '--exclude-standard']).toString(), '', 'UNSTAGED_NEW_FILE')
git(['-c', 'core.whitespace=cr-at-eol', 'diff', '--cached', '--check'])
let links = 0
for (const path of changed.filter(path => path.endsWith('.md'))) {
  const added = git(['diff', '--cached', '--unified=0', '--', path]).toString('utf8').split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).join('\n')
  for (const match of added.matchAll(/\[[^\]\n]+\]\(([^)\n]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0]
    if (!target || /^[a-z]+:\/\//i.test(target)) continue
    assert.ok((await stat(resolve(root, dirname(path), target))).isFile(), `MISSING_ADDED_DOCUMENT_LINK: ${path} -> ${target}`)
    links++
  }
}
console.log(JSON.stringify({ result: 'PASS', stagedFiles: changed.length, stagedSourceFilesByteMatched: source.length, addedDocumentLinksChecked: links, scopeExpansion: 'NO', sourceIdentity: validation.sourceIdentity, commit: 'NOT_YET_CREATED_BY_THIS_READ_ONLY_CHECK' }))
