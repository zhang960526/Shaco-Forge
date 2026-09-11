import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '../../../../../..')
const { packagedRoot } = JSON.parse(await readFile(join(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const { lifecycleRequest, inspectLocalPlatform } = await import(pathToFileURL(join(root, 'apps/desktop/dist/main/lifecycle-client.js')))
const helper = join(packagedRoot, 'native/ShacoForge.NativeCarrier.exe')
assert.equal((await inspectLocalPlatform(helper)).mutexExists, false)
const env = { ...process.env }
for (const key of Object.keys(env)) if (/^(DSH_|SHACO_FORGE_|NODE_|ELECTRON_|NPM_|PNPM_|COREPACK_)/i.test(key) || key.toLowerCase() === 'path') delete env[key]
env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`
env.SHACO_FORGE_EVIDENCE_PATH = join(import.meta.dirname, 'inspector-desktop-result.json')
const child = spawn(join(packagedRoot, 'Shaco Forge.exe'), ['--inspect=127.0.0.1:0', `--user-data-dir=${join(root, 'dist/corrective-inspector-profile')}`], { env, cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString() })
const started = Date.now()
const attempt = process.argv[2] ?? '1'
const result = { purpose: 'READ_ONLY_MAIN_PROCESS_DIAGNOSTIC', attempt, snapshots: [], caughtStartupErrors: [] }
let socket
try {
  while (!output.includes('ws://127.0.0.1:') && Date.now() - started < 15000) await new Promise(r => setTimeout(r, 100))
  const url = output.match(/ws:\/\/127\.0\.0\.1:[0-9]+\/[a-f0-9-]+/)?.[0]
  assert.ok(url, 'LOCAL_INSPECTOR_NOT_AVAILABLE')
  socket = new WebSocket(url)
  await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }) })
  let sequence = 0
  async function request(method, params = {}) {
    const id = ++sequence
    const response = new Promise(ok => {
      const onMessage = event => { const value = JSON.parse(event.data); if (value.id === id) { socket.removeEventListener('message', onMessage); ok(value) } }
      socket.addEventListener('message', onMessage)
    })
    socket.send(JSON.stringify({ id, method, params }))
    return Promise.race([response, new Promise(ok => setTimeout(() => ok({ diagnosticTimeout: true }), 5000))])
  }
  const evaluate = expression => request('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, timeout: 3000 })
  socket.addEventListener('message', async event => {
    const message = JSON.parse(event.data)
    if (message.method !== 'Debugger.paused') return
    const frame = message.params.callFrames[0]
    result.caughtStartupErrors.push(await request('Debugger.evaluateOnCallFrame', { callFrameId: frame.callFrameId,
      expression: '({message:error.message,stack:error.stack})', returnByValue: true }))
    await request('Debugger.resume')
  })
  await request('Debugger.enable')
  result.breakpoint = await request('Debugger.setBreakpointByUrl', { urlRegex: 'recovery-coordinator\\.js$', lineNumber: 75 })
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 12000))
    result.snapshots.push({ elapsedMs: Date.now() - started,
      process: await evaluate('({pid:process.pid,argv:process.argv,resources:process.getActiveResourcesInfo()})') })
  }
  result.result = 'DIAGNOSTIC_CAPTURED'
} catch (error) { result.result = 'FAIL'; result.error = String(error) }
finally {
  socket?.close()
  child.kill()
  const cleanupDeadline = Date.now() + 90000
  while (Date.now() < cleanupDeadline) {
    try {
      const { status, socket: pipe } = await lifecycleRequest(helper, 'discover'); pipe.destroy()
      assert.equal(status.workerRuntime.executable, join(packagedRoot, 'runtime/node.exe'))
      const stopped = await lifecycleRequest(helper, 'stop-authority', status.workerInstanceId); stopped.socket.destroy()
    } catch (error) { result.cleanupDiscovery = error.message }
    if (!(await inspectLocalPlatform(helper)).mutexExists) break
    await new Promise(r => setTimeout(r, 250))
  }
  result.platformAfter = await inspectLocalPlatform(helper)
  result.outputBytes = Buffer.byteLength(output)
  await writeFile(join(import.meta.dirname, `desktop-inspector-diagnostic-${attempt}.json`), JSON.stringify(result, null, 2) + '\n', 'utf8')
  console.log(JSON.stringify(result, null, 2))
}
