import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFile, access } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { paths } from './runtime-paths.mjs'

const git = args => execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd: paths.root, encoding: 'utf8', windowsHide: true }).trim()
const files = [...new Set([...git(['diff', '--name-only', '--diff-filter=ACMRT']).split('\n'), ...git(['ls-files', '--others', '--exclude-standard']).split('\n')].filter(Boolean))]
const decoder = new TextDecoder('utf-8', { fatal: true })
const markers = ['\uFFFD', '\u951F\u65A4\u62F7', '\u00C3', '\u00C2']
let markdownLinks = 0
for (const file of files) {
  if (!['.ts', '.cts', '.mjs', '.js', '.json', '.md', '.css', '.html'].includes(extname(file)) && file !== '.gitignore') continue
  const path = resolve(paths.root, file)
  const bytes = await readFile(path)
  assert.ok(!(bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191), `BOM: ${file}`)
  const text = decoder.decode(bytes)
  for (const marker of markers) assert.ok(!text.includes(marker), `Suspicious text: ${file}`)
  if (file.endsWith('.md')) {
    const prose = text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '').replace(/`[^`\r\n]*`/g, '')
    for (const match of prose.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0]
      if (!target || /^[a-z]+:/i.test(target)) continue
      await access(resolve(dirname(path), decodeURIComponent(target)))
      markdownLinks++
    }
  }
}
const frozen = [
  'docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md',
  'docs/03-v1.0-plan/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-CONTRACT.md',
  'docs/04-development-records/V1-SLICE-1C-FROZEN-HARNESS-USER-LOOP-SOURCE-CONFIRMATION.md',
  'docs/04-development-records/V1-SLICE-1C-IMPLEMENTATION-AUTHORIZATION-OWNER-DECISION.md',
  'docs/05-reviews/architecture/AUDIT-015-V1-SLICE-1C-ARCHITECTURE-CHALLENGE.md',
  'docs/05-reviews/architecture/AUDIT-016-V1-SLICE-1C-CONTRACT-TARGETED-DELTA-REVIEW.md',
]
for (const file of frozen) {
  const baseline = execFileSync('git', ['show', `HEAD:${file}`], { cwd: paths.root, windowsHide: true })
  // Git may normalize CRLF at checkout; compare against the initial worktree's
  // existing checkout convention without rewriting either file.
  const current = await readFile(resolve(paths.root, file))
  assert.equal(decoder.decode(current).replaceAll('\r\n', '\n'), decoder.decode(baseline).replaceAll('\r\n', '\n'), `Frozen document changed: ${file}`)
}
assert.equal(git(['diff', '--cached', '--name-only']), '')
assert.ok(!files.some(file => /lock\.yaml$|lock\.json$|pnpm-lock/.test(file)))
const whitespace = spawnSync('git', ['diff', '--check'], { cwd: paths.root, encoding: 'utf8', windowsHide: true })
assert.equal(whitespace.status, 0, whitespace.stdout)
for (const file of git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean)) {
  const check = spawnSync('git', ['-c', 'core.safecrlf=false', 'diff', '--no-index', '--check', '--', 'NUL', file], { cwd: paths.root, encoding: 'utf8', windowsHide: true })
  assert.ok(check.status <= 1, check.stdout)
}
process.stdout.write(`${JSON.stringify({ result: 'PASS', changedFiles: files.length, strictUtf8: true, bom: 0, suspiciousText: 0, markdownLinks, frozenDocumentsUnchanged: frozen.length, stagedFiles: 0, lockfileUnchanged: true })}\n`)
