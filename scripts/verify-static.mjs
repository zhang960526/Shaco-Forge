import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { paths } from './runtime-paths.mjs'

const extensions = new Set(['.ts', '.cts', '.mjs', '.js', '.json', '.html', '.css', '.yaml', '.yml'])
const ignored = new Set(['node_modules', 'dist', '.generated-client', '.git'])
const files = []
async function walk(root) {
  for (const item of await readdir(root, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue
    const path = join(root, item.name)
    if (item.isDirectory()) await walk(path)
    else if (extensions.has(extname(path))) files.push(path)
  }
}
for (const root of [join(paths.root, 'apps'), join(paths.root, 'packages'), join(paths.root, 'scripts')]) await walk(root)
const texts = await Promise.all(files.map(async path => [path, await readFile(path, 'utf8')]))
const joined = texts.map(([path, text]) => `${path}\n${text}`).join('\n')
assert.doesNotMatch(joined, /packages[\\/]\*\*[\\/]src|@deepseek-ai\/[^'"\s]+\/src\//)
assert.doesNotMatch(joined, /D:\\Project\\Shaco-Forge-Upstream/i)
const productText = texts.filter(([path]) => path.includes(`${join(paths.root, 'apps')}`) || path.includes(`${join(paths.root, 'packages')}`)).map(([path, text]) => `${path}\n${text}`).join('\n')
assert.doesNotMatch(productText, /[?]fixture|fixtureConnection|mockConnection|fakeRpc/i, 'Production source must not include fixture/mock RPC behavior')
const renderedPage = await readFile(join(paths.root, 'apps/desktop/index.html'), 'utf8')
assert.doesNotMatch(renderedPage, /Automation|Agent Collaboration|Knowledge Base|自动化|Agent 协作|知识库/)
const mojibakeMarkers = ['\uFFFD', '\u953F\u65A4\u62F7', '\u00C3', '\u00C2']
for (const marker of mojibakeMarkers) assert.ok(!joined.includes(marker), `Mojibake marker found: U+${marker.codePointAt(0)?.toString(16)}`)
process.stdout.write(`${JSON.stringify({ result: 'PASS', scannedFiles: files.length })}\n`)
