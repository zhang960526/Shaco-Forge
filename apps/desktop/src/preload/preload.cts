import { contextBridge, ipcRenderer } from 'electron'

interface BootstrapProjection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
  generation: number
}

// Bound once per document. Old closures cannot borrow a replacement Carrier.
const generation = ipcRenderer.invoke('bootstrap:get-state').then((state: BootstrapProjection) => state.generation)

const api = Object.freeze({
  bootstrap: Object.freeze({
    getState: (): Promise<BootstrapProjection> => ipcRenderer.invoke('bootstrap:get-state'),
    reportProjection: async (report: Record<string, boolean>): Promise<void> => ipcRenderer.invoke('bootstrap:projection-ready', await generation, report),
    subscribe: (listener: (state: BootstrapProjection) => void): (() => void) => {
      const wrapped = (_event: Electron.IpcRendererEvent, state: BootstrapProjection): void => listener(state)
      ipcRenderer.on('bootstrap:state', wrapped)
      return () => ipcRenderer.removeListener('bootstrap:state', wrapped)
    },
  }),
  transport: Object.freeze({
    fetch: async (request: { url: string; method: string; contentType: string; body: string }): Promise<{ status: number; contentType: string; body: string }> =>
      ipcRenderer.invoke('transport:fetch', request, await generation),
    openStream: async (endpoint: string, payload: Record<string, unknown>): Promise<string> =>
      ipcRenderer.invoke('transport:open-stream', { endpoint, payload }, await generation),
    pullStream: async (streamId: string): Promise<{ done: boolean; value?: unknown; error?: string }> =>
      ipcRenderer.invoke('transport:pull-stream', streamId, await generation),
    cancelStream: async (streamId: string, reason: string): Promise<void> =>
      ipcRenderer.invoke('transport:cancel-stream', streamId, reason, await generation),
  }),
  reportRuntimeEvidence: (evidence: Record<string, unknown>): void => {
    ipcRenderer.send('runtime:evidence', evidence)
  },
})

contextBridge.exposeInMainWorld('shacoForge', api)
