import { copyFile, lstat, mkdir, realpath, symlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const utf8 = { encoding: 'utf8' } as const

async function ensureProfileJunction(source: string, target: string): Promise<void> {
  try { await symlink(source, target, 'junction') }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    // Replacement reuses the same Harness home, but never adopts an unexpected
    // directory/link. Only the exact approved runtime/profile target is legal.
    if (!(await lstat(target)).isSymbolicLink() || await realpath(target) !== await realpath(source)) {
      throw new Error('HARNESS_PROFILE_JUNCTION_IDENTITY_MISMATCH')
    }
  }
}

export async function materializeHarnessProfile(
  dshHome: string,
  profileName: string,
  readinessModulePath: string,
  connectionCompatibilityPath: string,
  carrierGatewayPath: string,
  eventsRoutePreflightPath: string,
  harnessScopePath: string,
  overlayNodeModules: string,
): Promise<string> {
  const profilePath = join(dshHome, 'profiles', profileName)
  const bundlePath = join(profilePath, 'node_modules', '@shaco-forge', 'harness-bootstrap')
  await mkdir(bundlePath, { recursive: true })
  await ensureProfileJunction(harnessScopePath, join(profilePath, 'node_modules', '@deepseek-ai'))

  const profilePackage = {
    name: '@shaco-forge/harness-profile',
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
      './connection-compatibility': './connection-compatibility.mjs',
      './carrier-gateway': './carrier-gateway.mjs',
      './events-route-preflight': './events-route-preflight.mjs',
    },
    dsh: {
      bundle: {
        patch: './cordis.patch.yml',
      },
    },
  }
  let patch = [
    '- insert:',
    '    - id: shaco-forge-connection-compatibility',
    "      name: '@shaco-forge/harness-bootstrap/connection-compatibility'",
    '',
    '    - id: workspace',
    "      name: '@deepseek-ai/dsh-workspace'",
    '',
    '    - id: session-reference',
    "      name: '@deepseek-ai/dsh-session-reference'",
    '',
    '    - id: file-reference-local',
    "      name: '@deepseek-ai/dsh-file-reference-local'",
    '',
    '    - id: session-controller',
    "      name: '@deepseek-ai/dsh-api-session-controller'",
    '      config:',
    '        nativeOpen: false',
    '',
    '    - id: settings-controller',
    "      name: '@deepseek-ai/dsh-api-settings-controller'",
    '      config:',
    '        nativeOpen: false',
    '',
    '    - id: workspace-controller',
    "      name: '@deepseek-ai/dsh-api-workspace-controller'",
    '',
    '    - id: directory-picker-browse',
    "      name: '@deepseek-ai/dsh-host-directory-picker-browse'",
    '',
    '    - id: api-remotes',
    "      name: '@deepseek-ai/dsh-api-remotes'",
    '',
    '    - id: subagent-model-selection-settings',
    "      name: '@deepseek-ai/dsh-tool-subagent/model-selection-settings'",
    '',
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
    '    - id: shaco-forge-carrier-gateway',
    "      name: '@shaco-forge/harness-bootstrap/carrier-gateway'",
    '',
  ].join('\n')

  // NOT_PRODUCTION_TEST_ONLY: two explicit gates; the default Host never
  // imports or advertises this fixture. No Product Agent RPC is added.
  if (profileName === 'shaco-forge-step3-lifecycle-proof'
    && process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF === '1') {
    const fixtureName = './step3-interactions.mjs'
    Object.assign(bundlePackage.exports, { './step3-interactions': fixtureName })
    patch += '\n- insert:\n    - id: shaco-step3-test-only-interactions\n'
      + "      name: '@shaco-forge/harness-bootstrap/step3-interactions'\n"
    await copyFile(new URL('../test-fixtures/step3-interactions.mjs', import.meta.url), join(bundlePath, fixtureName))
  }

  await writeFile(join(profilePath, 'package.json'), `${JSON.stringify(profilePackage, null, 2)}\n`, utf8)
  await writeFile(join(profilePath, 'cordis.patch.yml'), '[]\n', utf8)
  await writeFile(join(bundlePath, 'package.json'), `${JSON.stringify(bundlePackage, null, 2)}\n`, utf8)
  await writeFile(join(bundlePath, 'cordis.patch.yml'), patch, utf8)
  await mkdir(dirname(join(bundlePath, 'readiness.js')), { recursive: true })
  await copyFile(readinessModulePath, join(bundlePath, 'readiness.js'))
  await copyFile(connectionCompatibilityPath, join(bundlePath, 'connection-compatibility.mjs'))
  await copyFile(carrierGatewayPath, join(bundlePath, 'carrier-gateway.mjs'))
  await copyFile(eventsRoutePreflightPath, join(bundlePath, 'events-route-preflight.mjs'))
  await mkdir(join(overlayNodeModules, '@shaco-forge'), { recursive: true })
  await ensureProfileJunction(bundlePath, join(overlayNodeModules, '@shaco-forge', 'harness-bootstrap'))
  return profilePath
}
