import test from 'node:test'
import assert from 'node:assert/strict'
import { pickWorkspaceDirectory } from './workspace-picker.js'

const document = () => ({ window: {}, webContents: {}, frame: {}, documentEpoch: 1, generation: 1 })
test('native picker success and cancel retain the authorized document', async () => {
  const current = document()
  assert.equal(await pickWorkspaceDirectory(() => current, async () => ({ canceled: false, filePaths: ['C:/disposable'] })), 'C:/disposable')
  assert.equal(await pickWorkspaceDirectory(() => current, async () => ({ canceled: true, filePaths: [] })), null)
})
test('native errors and malformed/multiple selections return only NATIVE_PICKER_FAILED', async () => {
  const current = document()
  for (const result of [{ canceled: false, filePaths: [] }, { canceled: false, filePaths: ['a', 'b'] }]) {
    await assert.rejects(pickWorkspaceDirectory(() => current, async () => result), /^Error: NATIVE_PICKER_FAILED$/)
  }
  await assert.rejects(pickWorkspaceDirectory(() => current, async () => { throw new Error('sensitive native detail') }), /^Error: NATIVE_PICKER_FAILED$/)
})
test('picker rejects generation, document, frame, window and webContents changes after await', async () => {
  for (const key of ['window', 'webContents', 'frame', 'documentEpoch', 'generation'] as const) {
    let current = document()
    await assert.rejects(pickWorkspaceDirectory(() => current, async () => {
      current = { ...current, [key]: typeof current[key] === 'number' ? 2 : {} }
      return { canceled: false, filePaths: ['C:/disposable'] }
    }), /NATIVE_PICKER_FAILED/)
  }
})
test('untrusted renderer cannot open a picker', async () => {
  let calls = 0
  await assert.rejects(pickWorkspaceDirectory(() => { throw new Error('NATIVE_PICKER_FAILED') }, async () => {
    calls++
    return { canceled: true, filePaths: [] }
  }), /NATIVE_PICKER_FAILED/)
  assert.equal(calls, 0)
})
