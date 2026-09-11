import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, lstat, realpath, readdir, rm } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '../../../../../..')
const { packagedRoot } = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const { inspectLocalPlatform } = await import(pathToFileURL(join(root, 'apps/desktop/dist/main/lifecycle-client.js')))
const helper = join(packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const known = JSON.parse(execFileSync(helper, ['--inspect-product-home'], { encoding: 'utf8', windowsHide: true }))
const target = resolve(known.localApplicationData, 'Shaco Forge')
assert.equal(target, join(known.localApplicationData, 'Shaco Forge'))
assert.equal(await realpath(target), target)
const stat = await lstat(target)
assert.ok(stat.isDirectory() && !stat.isSymbolicLink())
const summary = JSON.parse(await readFile(join(import.meta.dirname, 'test-summary.json'), 'utf8'))
const priorCleanup = JSON.parse(await readFile(join(import.meta.dirname, 'runs/packaged-startup-probe-2/cleanup.json'), 'utf8'))
assert.equal(priorCleanup.preexistingHomePreserved, false)
assert.ok(stat.birthtimeMs >= Date.parse(summary.commands.find(row => row.command === 'packaged-startup-probe' && row.attempt === 2).endedAt))
assert.deepEqual(await readdir(target), ['dsh'])
assert.equal(await realpath(join(target, 'dsh/profiles/shaco-forge')), join(packagedRoot, 'harness/profiles/shaco-forge'))
const result = { result: 'PASS', target, creationTime: stat.birthtime.toISOString(), source: 'DIAGNOSTIC_CREATED_AFTER_CONFIRMED_EMPTY_HOME', approvedProfileTarget: join(packagedRoot, 'harness/profiles/shaco-forge'), noAuthority: true }
await rm(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
await writeFile(join(import.meta.dirname, 'diagnostic-home-cleanup.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(result))
