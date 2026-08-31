'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const bridge = Object.freeze({
  runRequest: () => ipcRenderer.invoke('p0s2:run-request'),
  settingsRpc: (endpoint, payload) => ipcRenderer.invoke('p0s2:settings-rpc', endpoint, payload),
  securitySnapshot: () => Promise.resolve(Object.freeze({
    contextIsolated: process.contextIsolated === true,
    sandboxed: process.sandboxed === true,
  })),
  complete: (result) => ipcRenderer.invoke('p0s2:complete', result),
})

contextBridge.exposeInMainWorld('p0s2Bridge', bridge)

