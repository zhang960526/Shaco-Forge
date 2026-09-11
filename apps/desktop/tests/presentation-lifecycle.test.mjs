import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PRODUCT_ROW, ROOT_ID, startPresentation } from '../src/renderer/presentation-lifecycle.mjs'

function fixture(options = {}) {
  const log = [], rows = Array.from({ length: 28 }, (_, i) => ({ id: `@deepseek-ai/test-${i}`, immediately: i === 0 }))
  rows.push({ id: PRODUCT_ROW })
  const entries = new Map(), services = new Map(), slot = { options: { id: ROOT_ID, priority: -1 } }
  let onError, onRootChange, onServiceLoss
  const container = { inert: false, hidden: true, replaceChildren() { log.push('clear') } }
  const bridge = { harnessReady: false, failClosed(reason) { log.push(reason) } }
  let winner = slot
  class Context {
    constructor() {
      this.fiber = { dispose: async () => { bridge.beforeRootRevoke(); log.push('context-dispose') } }
      this.plugin = async () => {}
      this.get = name => options.missing === name ? undefined : services.get(name) ?? {}
      this.loader = {
        create: async ({ name }) => {
          if (name === PRODUCT_ROW) { assert.equal(bridge.harnessReady, true); assert.equal(entries.size, 28) }
          const id = String(entries.size)
          entries.set(id, { options: { name }, fiber: { state: name === options.inactive ? 'PENDING' : 'ACTIVE' } })
          log.push(name); return id
        },
        resolve: id => entries.get(id), await: async () => {},
      }
      this.slots = {
        entriesOfSlot: () => [winner],
        onEntryError: listener => { onError = listener; return () => {} },
        subscribe: (_, listener) => { onRootChange = listener; return () => {} },
      }
      this.uiRenderer = { mount: () => { log.push('mount'); options.duringMount?.(() => onError('root')); return () => log.push('unmount') } }
      this.inject = (_, apply) => {
        apply({ effect: setup => { onServiceLoss = setup() } })
        return { dispose: async () => { onServiceLoss(); log.push('watch-dispose') } }
      }
    }
  }
  let creates = 0
  const app = startPresentation({ container, bridge, Context, Loader: {}, activeState: 'ACTIVE', staticModules: {},
    target: { create: () => { creates++; return { manifest: { plugins: rows }, prefetch: async () => {} } } } })
  return { app, log, container, bridge, creates: () => creates,
    rootError: () => onError('root'), loseService: () => onServiceLoss(),
    loseRoot: () => { winner = { options: { id: 'other', priority: 0 } }; onRootChange() } }
}

test('all 28 Harness rows active before Product/root; single facade, context and mount', async () => {
  const f = fixture(); await f.app.run()
  assert.equal(f.creates(), 1)
  assert.deepEqual(f.app.diagnostics(), { clientModuleSystems: 1, contexts: 1, reactRoots: 1, mountCalls: 1, harnessActive: 28, productActive: true, rootOwner: 'SHACO', failed: false, disposed: false })
  await assert.rejects(f.app.run(), /ALREADY_STARTED/)
  await f.app.dispose(); await f.app.dispose()
  assert.ok(f.log.indexOf('unmount') < f.log.indexOf('context-dispose'))
  assert.equal(f.log.filter(x => x === 'context-dispose').length, 1)
})
test('quiescence does not authorize an inactive required row', async () => {
  const f = fixture({ inactive: '@deepseek-ai/test-13' }); await assert.rejects(f.app.run(), /NOT_ACTIVE/)
  assert.equal(f.log.includes('mount'), false); assert.equal(f.log.includes(PRODUCT_ROW), false)
})
test('required business service absence prevents Product/root activation', async () => {
  const f = fixture({ missing: 'uiConversation' }); await assert.rejects(f.app.run(), /SERVICE_MISSING/)
  assert.equal(f.log.includes('mount'), false)
})
for (const event of ['rootError', 'loseRoot', 'loseService']) test(`${event} synchronously conceals before async root teardown`, async () => {
  const f = fixture(); await f.app.run(); f[event]()
  assert.equal(f.container.hidden, true); assert.equal(f.container.inert, true)
  assert.equal(f.bridge.harnessReady, false)
  await f.app.dispose()
  assert.ok(f.log.indexOf('unmount') < f.log.indexOf('context-dispose'))
})
test('slot error during synchronous React mount fails closed and disposes root', async () => {
  const f = fixture({ duringMount: fail => fail() }); await assert.rejects(f.app.run(), /REVOKED/)
  assert.equal(f.container.hidden, true); assert.equal(f.app.diagnostics().reactRoots, 0)
  assert.equal(f.log.filter(x => x === 'unmount').length, 1)
})
