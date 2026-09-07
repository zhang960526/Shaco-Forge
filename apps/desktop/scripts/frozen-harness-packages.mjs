import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

function visitPackages(root, relativeRoot, depth, output) {
  const start = join(root, relativeRoot)
  if (!existsSync(start)) return
  const queue = [{ path: start, remaining: depth }]
  while (queue.length > 0) {
    const current = queue.shift()
    const manifestPath = join(current.path, 'package.json')
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      if (typeof manifest.name === 'string') output.set(manifest.name, { root: current.path, manifest, manifestPath })
    }
    if (current.remaining === 0) continue
    for (const item of readdirSync(current.path, { withFileTypes: true })) {
      if (!item.isDirectory() || ['node_modules', 'lib', 'src', 'tests'].includes(item.name)) continue
      queue.push({ path: join(current.path, item.name), remaining: current.remaining - 1 })
    }
  }
}

export function indexFrozenHarnessPackages(harnessRoot) {
  const output = new Map()
  visitPackages(harnessRoot, 'apps', 1, output)
  visitPackages(harnessRoot, 'packages', 2, output)
  visitPackages(harnessRoot, 'vendor', 3, output)
  return output
}

function targetOf(value) {
  if (typeof value === 'string') return value
  if (typeof value !== 'object' || value === null) return undefined
  return value.browser ?? value.import ?? value.default
}

export function resolvePublicExport(packageIndex, specifier, overlayNodeModules) {
  const match = specifier.match(/^(@[^/]+\/[^/]+|[^/]+)(.*)$/)
  if (!match) return undefined
  const packageName = match[1]
  const suffix = match[2]
  const record = packageIndex.get(packageName)
  if (!record) return undefined
  const subpath = suffix === '' ? '.' : `.${suffix}`
  const exports = record.manifest.exports
  let target = exports === undefined && subpath === '.' ? record.manifest.main : targetOf(exports?.[subpath] ?? (subpath === '.' ? exports : undefined))
  if (target === undefined && exports && typeof exports === 'object') {
    for (const [key, value] of Object.entries(exports)) {
      if (!key.endsWith('/*') || !subpath.startsWith(key.slice(0, -1))) continue
      const wildcard = subpath.slice(key.length - 1)
      const candidate = targetOf(value)
      if (candidate !== undefined) target = candidate.replace('*', wildcard)
    }
  }
  if (typeof target !== 'string') return undefined
  if (target.includes('/src/') || target.startsWith('./src/')) throw new Error(`Production deep source export rejected: ${specifier} -> ${target}`)
  const packageRoot = overlayNodeModules === undefined
    ? record.root
    : join(overlayNodeModules, ...packageName.split('/'))
  const absolute = resolve(packageRoot, target)
  if (!existsSync(absolute)) throw new Error(`Built public export is missing: ${specifier} -> ${absolute}`)
  return absolute
}
