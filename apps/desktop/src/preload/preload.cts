import { contextBridge, ipcRenderer } from 'electron'

interface BootstrapProjection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
}

const api = Object.freeze({
  bootstrap: Object.freeze({
    getState: (): Promise<BootstrapProjection> => ipcRenderer.invoke('bootstrap:get-state'),
    subscribe: (listener: (state: BootstrapProjection) => void): (() => void) => {
      const wrapped = (_event: Electron.IpcRendererEvent, state: BootstrapProjection): void => listener(state)
      ipcRenderer.on('bootstrap:state', wrapped)
      return () => ipcRenderer.removeListener('bootstrap:state', wrapped)
    },
  }),
  reportRuntimeEvidence: (evidence: Record<string, unknown>): void => {
    ipcRenderer.send('runtime:evidence', evidence)
  },
})

contextBridge.exposeInMainWorld('shacoForge', api)
