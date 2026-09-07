import assert from 'node:assert/strict'
import test from 'node:test'
import { sendProjectionIfAlive, snapshotLoadingUrl, type ProjectionWindow } from './window-lifecycle.js'

function target(windowDestroyed: boolean, contentsDestroyed: boolean) {
  const calls: string[] = []
  const window: ProjectionWindow = {
    isDestroyed: () => windowDestroyed,
    webContents: {
      isDestroyed: () => contentsDestroyed,
      send: () => calls.push('send'),
      getURL: () => {
        calls.push('getURL')
        return 'shaco-forge://client/'
      },
    },
  }
  return { calls, window }
}

test('destroyed BrowserWindow never receives projection IPC or evidence reads', () => {
  const destroyedWindow = target(true, false)
  assert.equal(sendProjectionIfAlive(destroyedWindow.window, { phase: 'carrier-failed' }), false)
  assert.equal(snapshotLoadingUrl(destroyedWindow.window), undefined)
  assert.deepEqual(destroyedWindow.calls, [])

  const destroyedContents = target(false, true)
  assert.equal(sendProjectionIfAlive(destroyedContents.window, { phase: 'carrier-failed' }), false)
  assert.equal(snapshotLoadingUrl(destroyedContents.window), undefined)
  assert.deepEqual(destroyedContents.calls, [])
})

test('live BrowserWindow receives projection and is snapshotted before destruction', () => {
  const live = target(false, false)
  assert.equal(snapshotLoadingUrl(live.window), 'shaco-forge://client/')
  assert.equal(sendProjectionIfAlive(live.window, { phase: 'carrier-ready' }), true)
  assert.deepEqual(live.calls, ['getURL', 'send'])
})
