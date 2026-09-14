import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const entry = join(root, 'apps/worker/dist/installer-entry.js')
const testRoot = process.env.SHACO_FORGE_INSTALLER_DIAGNOSTIC_TEST_ROOT
assert.ok(testRoot, 'SHACO_FORGE_INSTALLER_DIAGNOSTIC_TEST_ROOT is required')
const receiptName = 'Shaco-Forge-Installer-Failure.json'

async function freshCase(name) {
  const directory = join(testRoot, name)
  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })
  return directory
}

function run(directory, args = [], preload) {
  const result = spawnSync(process.execPath, [
    '--no-warnings',
    '--experimental-test-module-mocks',
    ...(preload ? ['--import', pathToFileURL(preload).href] : []),
    entry,
    ...args,
  ], {
    cwd: root,
    env: { ...process.env, TEMP: directory, TMP: directory },
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.error) throw result.error
  return result
}

async function mockPreload(directory, failure) {
  const preload = join(directory, 'preload.mjs')
  const text = `import { mock } from 'node:test'
const failure = ${JSON.stringify(failure)}
mock.module('node:child_process', { namedExports: {
  execFile: (...args) => args.at(-1)(null, { stdout: JSON.stringify({ canonical: true, writes: 0, installRoot: 'C:/install', dshHome: 'C:/dsh', controlRoot: 'C:/control', backupRoot: 'C:/backup' }) }),
  spawn: () => { throw new Error('UNEXPECTED_SPAWN') },
} })
mock.module(${JSON.stringify(new URL('../packages/contracts/dist/packaged-runtime.js', import.meta.url).href)}, { namedExports: {
  RELEASE_LAYOUT: { nativeHelper: 'native/helper.exe' },
  hashFile: async () => 'digest',
  jsonBytes: value => JSON.stringify(value),
  verifyPackagedRuntime: async () => {
    if (failure?.kind === 'error') throw new Error(failure.value)
    if (failure?.kind === 'non-error') throw failure.value
    return { ProductVersion: '1.0.0' }
  },
} })
mock.module(${JSON.stringify(new URL('../apps/worker/dist/installer-release-trust.js', import.meta.url).href)}, { namedExports: { verifyInstallerReleaseTrust: async () => {} } })
mock.module(${JSON.stringify(new URL('../apps/worker/dist/installer-operations.js', import.meta.url).href)}, { namedExports: { InstallerOperations: class { async initialize() { return { source: {}, target: {} } } } } })
mock.module(${JSON.stringify(new URL('../apps/worker/dist/update-transaction.js', import.meta.url).href)}, { namedExports: { UpdateTransaction: class { async run() { return { state: 'COMMITTED', id: 'test' } } } } })
mock.module(${JSON.stringify(new URL('../apps/worker/dist/uninstall.js', import.meta.url).href)}, { namedExports: { uninstall: async () => ({}), readUninstallInventory: async () => ({}) } })
`
  await writeFile(preload, text, 'utf8')
  return preload
}

test('known failure preserves stderr and exit code and writes the bounded receipt', async () => {
  const directory = await freshCase('known-failure')
  const result = run(directory)
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'INSTALLER_ARGUMENTS_REJECTED\n')
  const receiptPath = join(directory, receiptName)
  const bytes = (await stat(receiptPath)).size
  assert.ok(bytes <= 512)
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'))
  assert.deepEqual(Object.keys(receipt), ['format', 'diagnosticOnly', 'capturedAtUtc', 'errorCode', 'errorType'])
  assert.equal(receipt.format, 'SHACO_FORGE_INSTALLER_DIAGNOSTIC_V1')
  assert.equal(receipt.diagnosticOnly, true)
  assert.equal(receipt.errorCode, 'INSTALLER_ARGUMENTS_REJECTED')
  assert.equal(receipt.errorType, 'ERROR')
  assert.equal(new Date(receipt.capturedAtUtc).toISOString(), receipt.capturedAtUtc)
})

test('receipt write failure does not mask the original diagnostic', async () => {
  const directory = await freshCase('blocked-receipt')
  await mkdir(join(directory, receiptName))
  const result = run(directory)
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'INSTALLER_ARGUMENTS_REJECTED\n')
})

test('successful installerMain leaves a stale receipt unchanged', async () => {
  const directory = await freshCase('success')
  const receiptPath = join(directory, receiptName)
  await writeFile(receiptPath, 'stale-receipt', 'utf8')
  const preload = await mockPreload(directory)
  const result = run(directory, ['C:/installer.exe', '--install'], preload)
  assert.equal(result.status, 0)
  assert.equal(result.stderr, '')
  assert.equal(await readFile(receiptPath, 'utf8'), 'stale-receipt')
})

test('adversarial error codes preserve stderr while receipt code remains bounded', async () => {
  const directory = await freshCase('adversarial')
  const longCode = 'A'.repeat(600)
  const preload = await mockPreload(directory, { kind: 'error', value: longCode })
  const result = run(directory, ['C:/installer.exe', '--install'], preload)
  assert.equal(result.status, 1)
  assert.equal(result.stderr, longCode + '\n')
  const receiptPath = join(directory, receiptName)
  assert.ok((await stat(receiptPath)).size <= 512)
  assert.equal(JSON.parse(await readFile(receiptPath, 'utf8')).errorCode, 'INSTALLER_FAILED')
})

test('non-Error throws are classified without copying thrown content', async () => {
  const directory = await freshCase('non-error')
  const preload = await mockPreload(directory, { kind: 'non-error', value: 'secret-shaped-content' })
  const result = run(directory, ['C:/installer.exe', '--install'], preload)
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'INSTALLER_FAILED\n')
  const receipt = await readFile(join(directory, receiptName), 'utf8')
  assert.equal(receipt.includes('secret-shaped-content'), false)
  assert.equal(JSON.parse(receipt).errorType, 'NON_ERROR_THROWN')
})
