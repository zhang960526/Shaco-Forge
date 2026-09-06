'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const bridge = Object.freeze({
  securitySnapshot: () => Promise.resolve(Object.freeze({
    contextIsolated: process.contextIsolated === true,
    sandboxed: process.sandboxed === true,
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  })),
  complete: (result) => ipcRenderer.invoke('p0s6:complete', result),
})

contextBridge.exposeInMainWorld('p0s6Bridge', bridge)

