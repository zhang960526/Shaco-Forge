import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { paths } from './runtime-paths.mjs'

const rendererRoot = join(paths.root, 'apps/desktop/src/renderer')
const tokenPath = join(rendererRoot, 'theme/tokens.css')
const themePath = join(rendererRoot, 'theme/themes.css')
const controllerPath = join(rendererRoot, 'theme/theme.ts')
const allowedColorFiles = [tokenPath, themePath]
const scannedHardcodeFiles = [
  join(paths.root, 'apps/desktop/index.html'),
  join(rendererRoot, 'styles.css'),
  join(rendererRoot, 'main.ts'),
  join(rendererRoot, 'global.d.ts'),
  join(rendererRoot, 'node-module-stub.ts'),
]
const requiredTokens = [
  'surface-app',
  'surface-sidebar',
  'surface-primary',
  'surface-secondary',
  'surface-elevated',
  'text-primary',
  'text-secondary',
  'text-muted',
  'border-default',
  'border-subtle',
  'border-focus',
  'hover-background',
  'selection-background',
  'focus-ring',
  'status-success',
  'status-warning',
  'status-error',
  'status-neutral',
  'accent-primary',
  'accent-hover',
]

const [tokens, themes, controller, ...hardcodeTexts] = await Promise.all([
  readFile(tokenPath, 'utf8'),
  readFile(themePath, 'utf8'),
  readFile(controllerPath, 'utf8'),
  ...scannedHardcodeFiles.map(path => readFile(path, 'utf8')),
])
for (const token of requiredTokens) {
  assert.match(tokens, new RegExp(`@property\\s+--${token}\\b`), `Semantic token declaration is missing: ${token}`)
  assert.equal((themes.match(new RegExp(`--${token}\\s*:`, 'g')) ?? []).length, 2, `Light/dark mapping count must be two: ${token}`)
}
assert.match(controller, /export type ThemeMode = 'light' \| 'dark' \| 'system'/)
assert.match(controller, /class RootThemeController/)
assert.match(controller, /#mode: ThemeMode = 'light'/)
assert.match(controller, /root\.dataset\.theme = this\.#resolvedTheme/)
assert.match(await readFile(join(rendererRoot, 'main.ts'), 'utf8'), /matchMedia\('\(prefers-color-scheme: dark\)'\)/)

const hardcodedColor = /#[\da-f]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/i
const violations = scannedHardcodeFiles.flatMap((path, index) => hardcodedColor.test(hardcodeTexts[index] ?? '') ? [path] : [])
assert.deepEqual(violations, [], `Hardcoded theme colors outside token mapping: ${violations.join(', ')}`)
const page = hardcodeTexts[0] ?? ''
assert.doesNotMatch(page, /appearance|外观|theme switch|主题切换/i)

process.stdout.write(`${JSON.stringify({
  result: 'PASS',
  semanticTokenCount: requiredTokens.length,
  lightMapping: true,
  darkMapping: true,
  modes: ['light', 'dark', 'system'],
  initialTheme: 'light',
  allowedColorFiles: allowedColorFiles.map(path => path.slice(paths.root.length + 1)),
  hardcodeScanScope: scannedHardcodeFiles.map(path => path.slice(paths.root.length + 1)),
  violations,
})}\n`)
