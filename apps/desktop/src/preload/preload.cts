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
  transport: Object.freeze({
    fetch: (request: { url: string; method: string; contentType: string; body: string }): Promise<{ status: number; contentType: string; body: string }> =>
      ipcRenderer.invoke('transport:fetch', request),
    openStream: (endpoint: string, payload: Record<string, unknown>): Promise<string> =>
      ipcRenderer.invoke('transport:open-stream', { endpoint, payload }),
    pullStream: (streamId: string): Promise<{ done: boolean; value?: unknown; error?: string }> =>
      ipcRenderer.invoke('transport:pull-stream', streamId),
    cancelStream: (streamId: string, reason: string): Promise<void> =>
      ipcRenderer.invoke('transport:cancel-stream', streamId, reason),
  }),
  reportRuntimeEvidence: (evidence: Record<string, unknown>): void => {
    ipcRenderer.send('runtime:evidence', evidence)
  },
})

contextBridge.exposeInMainWorld('shacoForge', api)
