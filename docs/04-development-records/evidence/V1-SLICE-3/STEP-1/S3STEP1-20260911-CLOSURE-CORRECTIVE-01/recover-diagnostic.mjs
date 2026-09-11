import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '../../../../../..')
const { packagedRoot } = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const { lifecycleRequest, inspectLocalPlatform } = await import(pathToFileURL(join(root, 'apps/desktop/dist/main/lifecycle-client.js')))
const helper = join(packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
const { status, socket } = await lifecycleRequest(helper, 'discover')
socket.destroy()
assert.equal(status.workerRuntime.executable, join(packagedRoot, 'runtime/node.exe'))
const result = { reason: 'Diagnostic exited while detached packaged Worker initialization was still in flight; late authority recovered using exact packaged runtime identity.', worker: status.worker, host: status.host, workerRuntime: status.workerRuntime }
const stopped = await lifecycleRequest(helper, 'stop-authority', status.workerInstanceId)
stopped.socket.destroy()
for (let i = 0; i < 100 && (await inspectLocalPlatform(helper)).mutexExists; i++) await new Promise(r => setTimeout(r, 100))
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
result.noAuthority = true
await writeFile(join(import.meta.dirname, 'diagnostic-authority-recovery.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(result, null, 2))
