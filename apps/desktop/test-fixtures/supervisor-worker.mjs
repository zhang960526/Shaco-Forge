import { createReadStream, createWriteStream } from 'node:fs'

const input = createReadStream('', { fd: 3, autoClose: true })
const output = createWriteStream('', { fd: 4, autoClose: false })
const profile = process.env.SHACO_FORGE_HARNESS_PROFILE_NAME

input.resume()
input.once('end', () => {
  if (profile === 'test-timeout') return
  const payload = Buffer.from(JSON.stringify({
    type: 'carrier-ready',
    helper: {
      pipeEndpoint: '\\\\.\\pipe\\test-only', endpointId: 'test-endpoint', pipeEndpointHashPrefix: '00000000', helperPid: process.pid,
    },
    host: { profilePluginLoaded: true },
  }), 'utf8')
  const frame = Buffer.alloc(4 + payload.byteLength)
  frame.writeUInt32LE(payload.byteLength)
  payload.copy(frame, 4)
  output.write(frame)
  if (profile === 'test-unexpected') setTimeout(() => process.exit(23), 80)
})

setInterval(() => {}, 10_000)
