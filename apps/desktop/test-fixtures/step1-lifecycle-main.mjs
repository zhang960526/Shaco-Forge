// Bounded non-Provider driver around the actual Product Electron Main entry.
import { app, BrowserWindow } from 'electron'
import { createHash } from 'node:crypto'
import { observeStep1Lifecycle } from '../dist/main/main.js'

const deadline = Date.now() + 90_000
const timer = setInterval(async () => {
  const observation = observeStep1Lifecycle()
  const window = BrowserWindow.getAllWindows()[0]
  if (observation.phase !== 'carrier-ready' || !window || window.webContents.isLoading()) {
    if (Date.now() > deadline) { clearInterval(timer); process.stdout.write('STEP1_DESKTOP_FAILED\n'); app.exit(1) }
    return
  }
  clearInterval(timer)
  const renderer = await window.webContents.executeJavaScript(`({ requireAvailable: typeof require !== 'undefined', processAvailable: typeof process !== 'undefined', lifecycleAvailable: typeof window.lifecycle !== 'undefined', nodeIntegration: false })`)
  const snapshot = { ...observation, credentialEpoch: undefined,
    credentialEpochHash: createHash('sha256').update(observation.credentialEpoch).digest('hex'), renderer }
  process.stdout.write(`STEP1_DESKTOP_READY ${JSON.stringify(snapshot)}\n`)
  if (process.env.SHACO_FORGE_STEP1_EXIT_MODE === 'graceful') {
    setTimeout(() => { process.stdout.write('STEP1_DESKTOP_CONTROL window-close\n'); window.close() }, 1_000)
  }
}, 100)
app.on('before-quit', () => process.stdout.write('STEP1_DESKTOP_CONTROL before-quit\n'))
app.on('will-quit', () => process.stdout.write('STEP1_DESKTOP_CONTROL will-quit\n'))
