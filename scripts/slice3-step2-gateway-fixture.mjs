// NOT_SHIPPED: controlled public-service substitutes exercise the actual gateway.
import { apply } from '../apps/worker/host-profile/carrier-gateway.mjs'
let release
const hold = new Promise(done => { release = done })
process.stdin.once('data', () => release())
let writes = 0, streamOpens = 0
const cleanups = []
apply({
  connection: { createSharedFetchHandler: () => ({ fetch: async () => {
    writes++; await hold
    return Response.json({ type: 'server-response', rpcId: 'old', result: { ok: true, value: null } })
  } }) },
  typertGateway: { wireStream: {
    open: async endpoint => {
      if (endpoint !== '$events') { streamOpens++; await hold }
      return { async *[Symbol.asyncIterator]() { yield { type: 'ready', clientId: 'test', host: { home: 'isolated' } } } }
    }, failure: error => ({ message: error.message }),
  } },
  agentPresets: { resolve: async () => {} }, agents: { list: () => [] },
  sessions: { list: () => [], flush: async () => true },
  effect: effect => cleanups.push(effect()),
  get: key => key === 'appExit' ? code => {
    process.stdout.write(JSON.stringify({ writes, streamOpens }) + '\n')
    for (const cleanup of cleanups) cleanup()
    setTimeout(() => process.exit(code), 20)
  } : undefined,
})
