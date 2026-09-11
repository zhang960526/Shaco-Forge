import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { readFile, writeFile, readdir, lstat, realpath } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '../../../../../..')
const { packagedRoot } = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const { lifecycleRequest, inspectLocalPlatform } = await import(pathToFileURL(join(root, 'apps/desktop/dist/main/lifecycle-client.js')))
const helper = join(packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const known = JSON.parse(execFileSync(helper, ['--inspect-product-home'], { encoding: 'utf8', windowsHide: true }))
const refs = join(known.localApplicationData, 'Shaco Forge/dsh/profiles/node_modules')
const result = { purpose: 'PACKAGED_WORKER_RESTART_DIAGNOSTIC', referenceAnomalies: [], events: [] }
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name)
    const stat = await lstat(child)
    if (stat.isSymbolicLink()) {
      const actual = await realpath(child).catch(error => String(error))
      if (entry.name.startsWith('@') || !actual.startsWith(join(packagedRoot, 'harness/node_modules') + '\\')) result.referenceAnomalies.push({ path: child, actual })
    } else if (stat.isDirectory()) await walk(child)
  }
}
try { await walk(refs) } catch (error) { result.referenceInspectionError = String(error) }
const env = { ...process.env }
for (const key of Object.keys(env)) if (/^(DSH_|SHACO_FORGE_|NODE_|ELECTRON_|NPM_|PNPM_|COREPACK_)/i.test(key) || key.toLowerCase() === 'path') delete env[key]
env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`
const child = spawn(join(packagedRoot, 'runtime/node.exe'), [join(packagedRoot, 'resources/app/worker-launch.mjs')], { env, cwd: packagedRoot, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let pending = ''; let stderrBytes = 0
child.stdout.on('data', chunk => { pending += chunk.toString(); const lines = pending.split(/\r?\n/); pending = lines.pop(); for (const line of lines) { try { const value = JSON.parse(line); if (value.protocolVersion === 1) result.events.push(value) } catch {} } })
child.stderr.on('data', chunk => { stderrBytes += chunk.length })
const end = Date.now() + 60000
while (child.exitCode === null && !result.events.some(row => row.phase === 'carrier-ready') && Date.now() < end) await new Promise(r => setTimeout(r, 100))
result.exitCode = child.exitCode; result.stderrBytes = stderrBytes
try {
  const { status, socket } = await lifecycleRequest(helper, 'discover'); socket.destroy()
  assert.equal(status.workerRuntime.executable, join(packagedRoot, 'runtime/node.exe'))
  const stopped = await lifecycleRequest(helper, 'stop-authority', status.workerInstanceId); stopped.socket.destroy()
} catch (error) { result.cleanupDiscovery = error.message }
if (child.exitCode === null) child.kill()
result.result = result.events.some(row => row.phase === 'carrier-ready') ? 'PASS_RESTART' : 'FAIL_RESTART'
await writeFile(join(import.meta.dirname, 'restart-worker-diagnostic.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(result, null, 2))
process.exitCode = result.result === 'PASS_RESTART' ? 0 : 1
