import assert from 'node:assert/strict'
import test from 'node:test'
import { isSecureRendererConfiguration, rendererSecurityPreferences } from './security.js'

test('BrowserWindow renderer security baseline is fail-closed', () => {
  assert.equal(isSecureRendererConfiguration(), true)
  assert.deepEqual(rendererSecurityPreferences, {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
  })
})
