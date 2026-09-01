/* NOT_PRODUCTION: one-method allowlisted Electron preload. */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('p0s3Bridge', Object.freeze({
  run(rendererSnapshot) {
    const preloadSnapshot = Object.freeze({
      contextIsolated: process.contextIsolated,
      sandboxed: process.sandboxed,
      preloadPid: process.pid,
      exposedKeys: ['run'],
      pipePathExposed: false,
      reusableCredentialExposed: false,
    })
    return ipcRenderer.invoke('p0s3:run', { rendererSnapshot, preloadSnapshot })
  },
}))

