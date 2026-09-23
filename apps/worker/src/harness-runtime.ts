import { access, copyFile, lstat, mkdir, readFile, readdir, realpath, rm, symlink } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import { dirname, extname, join } from 'node:path'

interface PackageRecord {
  name: string
  root: string
}

type ExternalPackageIndex = Map<string, string>

async function collectPackages(start: string, remainingDepth: number, output: Map<string, PackageRecord>): Promise<void> {
  let entries: Dirent[]
  try {
    entries = await readdir(start, { withFileTypes: true })
  } catch {
    return
  }
  try {
    const manifest = JSON.parse(await readFile(join(start, 'package.json'), 'utf8')) as { name?: unknown }
    if (typeof manifest.name === 'string') output.set(manifest.name, { name: manifest.name, root: start })
  } catch {
    // A grouping directory does not need a package manifest.
  }
  if (remainingDepth === 0) return
  await Promise.all(entries
    .filter(entry => entry.isDirectory() && !['node_modules', 'lib', 'src', 'tests'].includes(entry.name))
    .map(entry => collectPackages(join(start, entry.name), remainingDepth - 1, output)))
}

async function replaceJunction(target: string, source: string): Promise<void> {
  try {
    await lstat(target)
    await rm(target, { recursive: true, force: true })
  } catch {
    // Target is absent.
  }
  await mkdir(dirname(target), { recursive: true })
  await symlink(source, target, 'junction')
}

async function readPackageIdentity(root: string): Promise<{ name: string; version: string } | undefined> {
  try {
    const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as { name?: unknown; version?: unknown }
    if (typeof manifest.name === 'string' && typeof manifest.version === 'string') {
      return { name: manifest.name, version: manifest.version }
    }
  } catch {
    // Not every pnpm node_modules entry is a package root.
  }
  return undefined
}

async function indexPnpmStore(harnessRoot: string): Promise<ExternalPackageIndex> {
  const output: ExternalPackageIndex = new Map()
  const storeRoot = join(harnessRoot, 'node_modules', '.pnpm')
  for (const storeEntry of await readdir(storeRoot, { withFileTypes: true })) {
    if (!storeEntry.isDirectory()) continue
    const modulesRoot = join(storeRoot, storeEntry.name, 'node_modules')
    let packages: Dirent[]
    try {
      packages = await readdir(modulesRoot, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of packages) {
      if (entry.name.startsWith('@')) {
        const scopeRoot = join(modulesRoot, entry.name)
        for (const child of await readdir(scopeRoot, { withFileTypes: true })) {
          const root = join(scopeRoot, child.name)
          const identity = await readPackageIdentity(root)
          if (identity !== undefined) output.set(`${identity.name}@${identity.version}`, root)
        }
      } else {
        const root = join(modulesRoot, entry.name)
        const identity = await readPackageIdentity(root)
        if (identity !== undefined) output.set(`${identity.name}@${identity.version}`, root)
      }
    }
  }
  return output
}

async function resolveExternalPackage(source: string, externalPackages: ExternalPackageIndex): Promise<string> {
  try {
    return await realpath(source)
  } catch {
    const identity = await readPackageIdentity(source)
    const resolved = identity === undefined ? undefined : externalPackages.get(`${identity.name}@${identity.version}`)
    if (resolved === undefined) throw new Error(`Frozen external package target cannot be resolved: ${source}`)
    return resolved
  }
}

const excludedDirectories = new Set(['node_modules', 'src', 'test', 'tests', '.git'])

async function copyBuiltTree(source: string, target: string): Promise<void> {
  await mkdir(target, { recursive: true })
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) continue
      await copyBuiltTree(join(source, entry.name), join(target, entry.name))
      continue
    }
    if (!entry.isFile() || extname(entry.name) === '.ts') continue
    await copyFile(join(source, entry.name), join(target, entry.name))
  }
}

async function linkExternalDependencies(
  sourcePackage: string,
  targetPackage: string,
  internalPackages: ReadonlySet<string>,
  externalPackages: ExternalPackageIndex,
): Promise<void> {
  const sourceModules = join(sourcePackage, 'node_modules')
  let entries: Dirent[]
  try {
    entries = await readdir(sourceModules, { withFileTypes: true })
  } catch {
    return
  }
  const targetModules = join(targetPackage, 'node_modules')
  for (const entry of entries) {
    if (entry.name === '.bin') continue
    if (entry.name.startsWith('@')) {
      const scope = join(sourceModules, entry.name)
      for (const child of await readdir(scope, { withFileTypes: true })) {
        const packageName = `${entry.name}/${child.name}`
        if (internalPackages.has(packageName)) continue
        const source = join(scope, child.name)
        await replaceJunction(join(targetModules, entry.name, child.name), await resolveExternalPackage(source, externalPackages))
      }
      continue
    }
    const source = join(sourceModules, entry.name)
    await replaceJunction(join(targetModules, entry.name), await resolveExternalPackage(source, externalPackages))
  }
}

async function materializeBuiltPackage(
  record: PackageRecord,
  overlayNodeModules: string,
  internalPackages: ReadonlySet<string>,
  externalPackages: ExternalPackageIndex,
): Promise<void> {
  const target = join(overlayNodeModules, ...record.name.split('/'))
  await rm(target, { recursive: true, force: true })
  await copyBuiltTree(record.root, target)
  await linkExternalDependencies(record.root, target, internalPackages, externalPackages)
}

export async function materializeFrozenHarnessRuntime(
  harnessRoot: string,
  dshHome: string,
): Promise<{ cliPath: string; overlayNodeModules: string }> {
  const rootManifest = JSON.parse(await readFile(join(harnessRoot, 'package.json'), 'utf8')) as { version?: string }
  if (rootManifest.version !== '0.1.2-alpha.1') throw new Error(`Frozen Harness version mismatch: ${rootManifest.version}`)
  const packages = new Map<string, PackageRecord>()
  await Promise.all([
    collectPackages(join(harnessRoot, 'apps'), 1, packages),
    collectPackages(join(harnessRoot, 'packages'), 2, packages),
    collectPackages(join(harnessRoot, 'vendor'), 3, packages),
  ])
  const cli = packages.get('@deepseek-ai/dsh')
  if (cli === undefined) throw new Error('Frozen Harness CLI package is missing')
  const overlayNodeModules = join(dshHome, 'runtime-overlay', 'node_modules')
  await mkdir(overlayNodeModules, { recursive: true })
  const internalPackages = new Set(packages.keys())
  const externalPackages = await indexPnpmStore(harnessRoot)
  for (const record of packages.values()) {
    await materializeBuiltPackage(record, overlayNodeModules, internalPackages, externalPackages)
  }
  const cliPath = join(overlayNodeModules, '@deepseek-ai', 'dsh', 'lib', 'bin.js')
  await access(cliPath)
  return { cliPath, overlayNodeModules }
}
