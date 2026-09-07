import { copyFile, mkdir, symlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const utf8 = { encoding: 'utf8' } as const

export async function materializeHarnessProfile(
  dshHome: string,
  profileName: string,
  readinessModulePath: string,
  harnessScopePath: string,
  overlayNodeModules: string,
): Promise<string> {
  const profilePath = join(dshHome, 'profiles', profileName)
  const bundlePath = join(profilePath, 'node_modules', '@shaco-forge', 'harness-bootstrap')
  await mkdir(bundlePath, { recursive: true })
  await symlink(harnessScopePath, join(profilePath, 'node_modules', '@deepseek-ai'), 'junction')

  const profilePackage = {
    name: '@shaco-forge/harness-profile-v1-slice-1a',
    version: '1.0.0-dev.1',
    private: true,
    dependencies: {
      '@shaco-forge/harness-bootstrap': '1.0.0-dev.1',
    },
    dsh: {
      profile: {
        bundles: ['@deepseek-ai/dsh-base', '@shaco-forge/harness-bootstrap'],
        patchReload: 'startup',
      },
    },
  }
  const bundlePackage = {
    name: '@shaco-forge/harness-bootstrap',
    version: '1.0.0-dev.1',
    private: true,
    type: 'module',
    exports: {
      './readiness': './readiness.js',
    },
    dsh: {
      bundle: {
        patch: './cordis.patch.yml',
      },
    },
  }
  const patch = [
    '- insert:',
    '    - id: agent-presets',
    "      name: '@deepseek-ai/dsh-agent-presets'",
    '      config:',
    '        default: standard',
    '        roots: []',
    '        includeShippedRoot: true',
    '        includeUserRoot: false',
    '',
    '    - id: shaco-forge-host-readiness',
    "      name: '@shaco-forge/harness-bootstrap/readiness'",
    '',
  ].join('\n')

  await writeFile(join(profilePath, 'package.json'), `${JSON.stringify(profilePackage, null, 2)}\n`, utf8)
  await writeFile(join(profilePath, 'cordis.patch.yml'), '[]\n', utf8)
  await writeFile(join(bundlePath, 'package.json'), `${JSON.stringify(bundlePackage, null, 2)}\n`, utf8)
  await writeFile(join(bundlePath, 'cordis.patch.yml'), patch, utf8)
  await mkdir(dirname(join(bundlePath, 'readiness.js')), { recursive: true })
  await copyFile(readinessModulePath, join(bundlePath, 'readiness.js'))
  await mkdir(join(overlayNodeModules, '@shaco-forge'), { recursive: true })
  await symlink(bundlePath, join(overlayNodeModules, '@shaco-forge', 'harness-bootstrap'), 'junction')
  return profilePath
}
