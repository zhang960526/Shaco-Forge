import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bindPresentationActions } from '../src/client/presentation-actions.mjs'

function fixture() {
  let generation = 1, selected = 'session', pending, reply = { ok: true, value: { accepted: true } }
  const calls = []
  const directory = { select: async value => { calls.push(['model', value]) } }
  const binding = { session: { getSnapshot: () => ({ sessionId: 'session' }), projections: { faceOf: () => ({ getSnapshot: () => ({ currentValue: 'custom', options: [{ value: 'read-only' }, { value: 'custom' }] }) }) },
    prompt: async (...args) => { calls.push(['prompt', ...args]); return reply },
    cancel: async () => { calls.push(['cancel']); return reply },
    loadOlder: async () => { calls.push(['older']) },
    command: async line => { calls.push(['command', line]); return reply } } }
  const ctx = { sessions: { list: { getSnapshot: () => ({ current: selected }) }, binding: () => binding },
    uiSession: { pendingInteractions: { getSnapshot: () => new Map([['session', pending]]) } }, modelDirectories: { directoryFor: () => directory } }
  const shell = { token: () => generation, current: value => value === generation }
  return { actions: bindPresentationActions(ctx, shell, binding), calls, binding, directory,
    setPending: value => { pending = value }, stale: () => generation++, changeSession: () => { selected = 'other' }, reply: value => { reply = value } }
}
test('prompt admission uses queue once and cancel never clears queued work', async () => {
  const f = fixture(), content = [{ type: 'text', text: 'local unit fixture' }]
  assert.deepEqual(await f.actions.prompt(content), { accepted: true })
  await f.actions.cancel()
  assert.deepEqual(f.calls, [['prompt', content, 'queue'], ['cancel']])
})
test('unknown outcome is not replayed', async () => {
  const f = fixture(); f.reply({ ok: false, error: { code: 'OUTCOME_UNKNOWN' } })
  await assert.rejects(f.actions.prompt([]), /OUTCOME_UNKNOWN/)
  assert.equal(f.calls.length, 1)
})
test('old generation and another selected session cannot mutate any captured object', async () => {
  for (const invalidate of ['stale', 'changeSession']) {
    const f = fixture(); f[invalidate]()
    await assert.rejects(f.actions.prompt([]), /STALE/)
    await assert.rejects(f.actions.cancel(), /STALE/)
    await assert.rejects(f.actions.loadOlder(), /STALE/)
    await assert.rejects(f.actions.selectModel(f.directory, {}), /STALE/)
    assert.equal(f.calls.length, 0)
  }
})
test('approval/question settles the exact current pending object, never a replaced carrier', async () => {
  const f = fixture(); let count = 0
  const pending = { answer: async answer => { count++; assert.deepEqual(answer, { answers: [{ id: 'q', selected: ['Original label'], custom: 'detail' }] }); f.setPending(undefined) } }
  f.setPending(pending)
  await f.actions.answer(pending, { answers: [{ id: 'q', selected: ['Original label'], custom: 'detail' }] })
  await assert.rejects(f.actions.answer(pending, {}), /STALE_PENDING/)
  assert.equal(count, 1)
})
test('permission choices are Host-owned; custom and unknown choices cannot be submitted', async () => {
  const f = fixture()
  assert.throws(() => f.actions.permission('custom'), /NOT_SELECTABLE/)
  assert.throws(() => f.actions.permission('danger-full-access'), /NOT_SELECTABLE/)
  await f.actions.permission('read-only')
  assert.deepEqual(f.calls, [['command', '/permission read-only']])
})
