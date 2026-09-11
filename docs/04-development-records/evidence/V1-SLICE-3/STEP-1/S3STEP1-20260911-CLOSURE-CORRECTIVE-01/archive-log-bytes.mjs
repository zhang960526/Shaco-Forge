// Preserve exact command output before whitespace-only display normalization.
import assert from 'node:assert/strict'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
const evidence = import.meta.dirname
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const rows = []
for (const name of (await readdir(join(evidence, 'logs'))).sort()) {
  if (!name.endsWith('.log')) continue
  const path = join(evidence, 'logs', name)
  const bytes = await readFile(path)
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  const display = text.replaceAll('\r\n', '\n').replace(/[\t ]+$/gm, '').replace(/\n+$/, '\n')
  if (display === text) continue
  const restored = Buffer.from(bytes.toString('base64'), 'base64')
  assert.deepEqual(restored, bytes)
  rows.push({ path: `logs/${name}`, originalSha256: sha(bytes), originalBytes: bytes.length, base64: bytes.toString('base64'), displaySha256: sha(Buffer.from(display)), reason: 'WHITESPACE_ONLY_LF_AND_TRAILING_WHITESPACE_DISPLAY_NORMALIZATION_EXACT_ORIGINAL_PRESERVED' })
}
// Write the lossless archive before modifying any display log.
await writeFile(join(evidence, 'raw-command-log-bytes.json'), JSON.stringify({ schemaVersion: 1, policy: 'Original command output is the decoded base64 bytes, identified by originalSha256. The .log file is a whitespace-normalized display copy. No result/error/content words are changed.', rows }, null, 2) + '\n', 'utf8')
for (const row of rows) {
  const original = Buffer.from(row.base64, 'base64').toString('utf8')
  const display = original.replaceAll('\r\n', '\n').replace(/[\t ]+$/gm, '').replace(/\n+$/, '\n')
  assert.equal(sha(Buffer.from(display)), row.displaySha256)
  await writeFile(join(evidence, row.path), display, 'utf8')
}
console.log(JSON.stringify({ result: 'PASS', losslesslyArchivedLogs: rows.length }))
