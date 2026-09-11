// UI-G14: Product-owned source, including bootstrap and transitive local imports.
// Frozen Harness public package implementations remain owned by Harness.
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'

const code = /\.(?:[cm]?[jt]sx?)$/
const testOnly = /(?:^|\/)(?:tests?|test-fixtures|__tests__)(?:\/|$)|\.(?:test|spec)\./
const slash = value => value.replaceAll('\\', '/')

function literal(node) {
  if (node && (ts.isStringLiteralLike(node))) return node.text
  if (node && ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = literal(node.left), right = literal(node.right)
    if (left !== undefined && right !== undefined) return left + right
  }
}

export function inspectProductionSource(path, text) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
  const findings = [], imports = new Set()
  const fail = (node, rule) => findings.push({ path: slash(path), line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, rule })
  function visit(node) {
    const value = ts.isIdentifier(node) ? node.text : literal(node)
    if (value === 'eventId') fail(node, 'INTERNAL_EVENT_ID')
    if (value === '$events/result') fail(node, 'PRIVATE_SETTLEMENT_ROUTE')
    if (value === 'waterfall' || /^(?:.*Waterfall.*|EventFrame|EventResultArgs|PendingApproval|PendingQuestion)$/.test(value ?? '')) fail(node, 'PRIVATE_EVENT_TYPE_OR_WATERFALL')
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && ['$on', '$waterfall'].includes(node.expression.name.text)
      && /^(?:approval|user-questions)\//.test(literal(node.arguments[0]) ?? '')) fail(node, 'INTERACTION_WATERFALL_LISTENER')
    let specifier
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = literal(node.moduleSpecifier)
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) specifier = literal(node.argument.literal)
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      specifier = literal(node.arguments[0])
      if (specifier === undefined) fail(node, 'UNRESOLVED_DYNAMIC_IMPORT')
    }
    if (specifier !== undefined) {
      imports.add(specifier)
      const name = slash(specifier)
      if (testOnly.test(name)) fail(node, 'TEST_ONLY_PRODUCTION_IMPORT')
      if (/(?:^|\/)packages\/(?:[^/]+\/)+src(?:\/|$)/.test(name)) fail(node, 'PRIVATE_PACKAGE_SOURCE_IMPORT')
      if (isAbsolute(specifier) || /(?:^|\/)(?:internal|lib)(?:\/|$)|@deepseek-ai\/[^/]+\/src(?:\/|$)|(?:deepseek-harness|Shaco-Forge-Upstream)/i.test(name)) fail(node, 'PRIVATE_RUNTIME_IMPORT')
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return { findings, imports: [...imports] }
}

export async function scanProductionBoundary(root, harnessRoot) {
  const seeds = ['apps/desktop/src/client', 'apps/desktop/src/renderer']
  const queue = [], visited = new Set(), findings = [], publicImports = new Set()
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (testOnly.test(slash(relative(root, path)))) continue
      if (entry.isDirectory()) await walk(path)
      else if (code.test(path)) queue.push(path)
    }
  }
  for (const seed of seeds) await walk(resolve(root, seed))
  const require = harnessRoot ? createRequire(join(harnessRoot, 'packages/client/web/package.json')) : undefined
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i], name = slash(relative(root, path))
    if (visited.has(name)) continue
    visited.add(name)
    const result = inspectProductionSource(name, await readFile(path, 'utf8'))
    findings.push(...result.findings)
    for (const specifier of result.imports) {
      if (specifier.startsWith('@deepseek-ai/')) {
        publicImports.add(specifier)
        try {
          if (!require) throw new Error('Frozen Harness root required')
          if (/[\\/]src[\\/]/.test(require.resolve(specifier))) throw new Error('Private source resolution')
        } catch { findings.push({ path: name, rule: 'UNRESOLVED_PUBLIC_HARNESS_EXPORT', specifier }) }
      }
      if (!specifier.startsWith('.')) continue
      const target = resolve(dirname(path), specifier)
      if (extname(target) === '.css') continue
      const candidates = [target.replace(/\.js$/, '.ts'), target.replace(/\.mjs$/, '.mts'), target.replace(/\.cjs$/, '.cts'), target]
      let found
      for (const candidate of candidates) if (await stat(candidate).then(s => s.isFile()).catch(() => false)) { found = candidate; break }
      if (!found || !code.test(found) || slash(relative(root, found)).startsWith('../')) findings.push({ path: name, rule: 'UNRESOLVED_LOCAL_PRODUCTION_IMPORT', specifier })
      else queue.push(found) // Imported fixtures are scanned and rejected, never silently excluded.
    }
  }
  return { gate: 'UI-G14', result: findings.length ? 'FAIL' : 'PASS', roots: seeds, files: [...visited].sort(), publicImports: [...publicImports].sort(), findings }
}
