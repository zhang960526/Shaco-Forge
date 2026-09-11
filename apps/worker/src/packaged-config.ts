import { execFile } from 'node:child_process'
import { lstat, mkdir, readFile, readdir, realpath, symlink } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { RELEASE_LAYOUT, releasePath, verifyPackagedRuntime } from '@shaco-forge/contracts/packaged-runtime'
import type { WorkerConfig } from './config.js'

import { controlPreflight } from './control-preflight.js'
const run = promisify(execFile)
export async function validateHarnessModuleReferences(path: string, releaseModules: string): Promise<void> {
  const stat = await lstat(path).catch(error => { if (error.code === 'ENOENT') return undefined; throw error })
  if (stat === undefined) return
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('DSH_HOME_MODULE_ROOT_REPARSE_REJECTED')
  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const child = join(directory, entry.name)
      const item = await lstat(child)
      if (item.isSymbolicLink()) {
        if (!entry.name.startsWith('@') && (await realpath(child)).startsWith(releaseModules + sep)) continue
        throw new Error('DSH_HOME_MODULE_REFERENCE_REJECTED')
      }
      if (item.isDirectory()) await walk(child)
    }
  }
  await walk(path)
}
export function packagedChildEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const clean: NodeJS.ProcessEnv = {}
  for (const [key, value] of Object.entries(env)) {
    if (/^(DSH_|SHACO_FORGE_|NODE_|ELECTRON_|NPM_|PNPM_|COREPACK_|NARB_)/i.test(key)) continue
    clean[key] = value
  }
  // The frozen native loader supports loading sealed binaries in place. Its
  // optional per-user/TEMP extraction cache is inappropriate for release bytes.
  clean.NARB_DISABLE_NATIVE_CACHE = '1'
  return clean
}
export async function readPackagedWorkerConfig(sourceDir: string): Promise<WorkerConfig | undefined> {
  const pkg = JSON.parse(await readFile(join(sourceDir, '../package.json'), 'utf8')) as { shacoRuntimeMode?: string }
  if (pkg.shacoRuntimeMode !== 'packaged') return undefined
  const root = resolve(sourceDir, '../../../..')
  const release = await verifyPackagedRuntime(root)
  if (process.platform !== 'win32' || process.arch !== 'x64' || await realpath(process.execPath) !== releasePath(root, RELEASE_LAYOUT.node)) throw new Error('RELEASE_INTEGRITY_FAILURE: Worker executable')
  const nativeHelperPath = releasePath(root, RELEASE_LAYOUT.nativeHelper)
  const control = await controlPreflight(root, nativeHelperPath, release, process.argv.includes('--validate-upgrade'))
  if (process.argv.includes('--preflight')) return { dshHome: control.dshHome, harnessRoot: join(root, 'harness'), nativeHelperPath, profileName: 'shaco-forge', packagedRoot: root }
  const { stdout } = await run(nativeHelperPath, ['--product-home', root, process.cwd()], {
    env: {}, windowsHide: true, timeout: 15_000,
  })
  const home = JSON.parse(stdout) as { dshHome: string; canonical: boolean; currentUserOnly: boolean; writable: boolean }
  if (!home.canonical || !home.currentUserOnly || !home.writable || await realpath(home.dshHome) !== home.dshHome) throw new Error('DSH_HOME_ATTESTATION_REJECTED')
  const profiles = join(home.dshHome, 'profiles')
  await mkdir(profiles, { recursive: true })
  if ((await lstat(profiles)).isSymbolicLink()) throw new Error('DSH_HOME_PROFILES_REPARSE_REJECTED')
  // The official CLI maintains package references here. A redirected container
  // must be rejected before its healing logic can write through that container.
  await validateHarnessModuleReferences(join(profiles, 'node_modules'), join(root, 'harness/node_modules'))
  const target = join(profiles, 'shaco-forge')
  const approved = releasePath(root, RELEASE_LAYOUT.profile)
  try { await symlink(approved, target, 'junction') }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error }
  // The single approved profile junction is intentional; every other redirection
  // is rejected. It never redirects release bytes into mutable Harness data.
  if (!(await lstat(target)).isSymbolicLink() || await realpath(target) !== approved) throw new Error('RELEASE_PROFILE_JUNCTION_IDENTITY_MISMATCH')
  return { dshHome: home.dshHome, harnessRoot: join(root, 'harness'), nativeHelperPath, profileName: 'shaco-forge', packagedRoot: root }
}

export function packagedHarnessRuntime(root: string) {
  return { cliPath: releasePath(root, RELEASE_LAYOUT.harness), overlayNodeModules: join(root, 'harness/node_modules') }
}
