import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { materializeHarnessProfile } from './profile.js'

test('S2G16 same Harness home supports replacement; mismatched profile junction fails closed', async () => {
  const root = await mkdtemp(join(process.cwd(), 'node_modules/.step2-profile-test-'))
  const scope = join(root, 'runtime/node_modules/@deepseek-ai')
  const overlay = join(root, 'runtime/node_modules')
  const source = join(root, 'module.mjs')
  await mkdir(scope, { recursive: true })
  await writeFile(source, 'export {}\n', 'utf8')
  const args = [root, 'test-profile', source, source, source, source, scope, overlay] as const
  try {
    const profile = await materializeHarnessProfile(...args)
    const patch = await readFile(join(profile, 'node_modules/@shaco-forge/harness-bootstrap/cordis.patch.yml'), 'utf8')
    assert.equal(await materializeHarnessProfile(...args), profile)
    assert.equal(await readFile(join(profile, 'node_modules/@shaco-forge/harness-bootstrap/cordis.patch.yml'), 'utf8'), patch)
    const target = join(profile, 'node_modules/@deepseek-ai')
    await rm(target, { recursive: true })
    const unexpected = join(root, 'unexpected')
    await mkdir(unexpected)
    await symlink(unexpected, target, 'junction')
    await assert.rejects(materializeHarnessProfile(...args), /JUNCTION_IDENTITY_MISMATCH/)
  } finally { await rm(root, { recursive: true, force: true }) }
})
