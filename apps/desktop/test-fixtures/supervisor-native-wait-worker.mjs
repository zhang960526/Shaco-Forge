import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { JsonFrameDecoder } from '../../../packages/contracts/dist/index.js'

// Controlled slow-start Worker: starts the actual Native Helper, but never
// publishes carrier-ready or connects a Client. No Harness profile is replaced.
const bootstrapInput = createReadStream('', { fd: 3, autoClose: true })
const helper = spawn(process.env.SHACO_FORGE_NATIVE_HELPER, [], {
  env: {}, stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'], windowsHide: true,
})
bootstrapInput.pipe(helper.stdio[3])
helper.stdout.resume()
helper.stderr.resume()
const decoder = new JsonFrameDecoder()
helper.stdio[4].on('data', chunk => {
  for (const value of decoder.push(chunk)) {
    if (value.type !== 'helper-ready') throw new Error('Native Helper did not create its Pipe')
    process.stdout.write(`${JSON.stringify({
      protocolVersion: 1, phase: 'worker-starting', timestamp: new Date().toISOString(),
      workerPid: process.pid, parentPid: process.ppid, workerNodeVersion: process.version,
      workerExecutable: process.execPath, workerArgv: process.argv.slice(1),
      nativeHelperPid: value.helperPid,
    })}\n`)
  }
})
