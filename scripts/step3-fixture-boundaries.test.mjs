// NOT_PRODUCTION_TEST_ONLY: exercise the actual profile materializer gates.
import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { materializeHarnessProfile } from '../apps/worker/dist/profile.js'

test('default and singly enabled Host profiles cannot load test-only RPC; double opt-in copies exact fixture', async () => {
  const root=await mkdtemp(join(process.cwd(),'node_modules/.review026-profile-test-'))
  const prior=process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF
  try {
    for (const [index,profileName,enabled,expected] of [
      [0,'shaco-forge-v1-slice-1b',false,false],
      [1,'shaco-forge-v1-slice-1b',true,false],
      [2,'shaco-forge-step3-lifecycle-proof',false,false],
      [3,'shaco-forge-step3-lifecycle-proof',true,true],
    ]) {
      if(enabled)process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF='1'
      else delete process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF
      const home=join(root,String(index)),overlay=join(home,'runtime/node_modules'),scope=join(overlay,'@deepseek-ai')
      const source=join(home,'module.mjs')
      await mkdir(scope,{recursive:true});await writeFile(source,'export {}\n','utf8')
      await writeFile(join(home,'upgrade-drain.mjs'),'export {}\n','utf8')
      const profile=await materializeHarnessProfile(home,profileName,source,source,source,source,scope,overlay)
      const bundle=join(profile,'node_modules/@shaco-forge/harness-bootstrap')
      const manifest=JSON.parse(await readFile(join(bundle,'package.json'),'utf8'))
      const patch=await readFile(join(bundle,'cordis.patch.yml'),'utf8')
      assert.equal(Object.hasOwn(manifest.exports,'./step3-interactions'),expected)
      assert.equal(patch.includes('shaco-step3-test-only-interactions'),expected)
      if(expected) assert.deepEqual(await readFile(join(bundle,'step3-interactions.mjs')),await readFile('apps/worker/test-fixtures/step3-interactions.mjs'))
      else await assert.rejects(access(join(bundle,'step3-interactions.mjs')),{code:'ENOENT'})
    }
  } finally {
    if(prior===undefined)delete process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF
    else process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF=prior
    assert.ok(resolve(root).startsWith(resolve('node_modules')+'\\'))
    await rm(root,{recursive:true,force:true})
  }
})
