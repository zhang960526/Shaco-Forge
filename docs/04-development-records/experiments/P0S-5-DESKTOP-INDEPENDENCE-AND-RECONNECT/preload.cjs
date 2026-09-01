/* NOT_PRODUCTION: allowlisted P0.S-5 Electron preload. */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('p0s5Bridge', Object.freeze({
  snapshot() {
    return Object.freeze({
      contextIsolated: process.contextIsolated,
      sandboxed: process.sandboxed,
      preloadPid: process.pid,
      pipePathExposed: false,
      reusableCredentialExposed: false,
      arbitraryFilesystemAccess: false,
    })
  },
  onProjection(listener) {
    ipcRenderer.on('p0s5:projection', (_event, value) => listener(value))
  },
  submit(value) {
    return ipcRenderer.invoke('p0s5:submit', value)
  },
}))
