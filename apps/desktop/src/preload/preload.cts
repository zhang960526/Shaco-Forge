import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('__SHACO_FORGE_EVIDENCE_MODE__', process.argv.includes('--shaco-evidence-observer'))

interface BootstrapProjection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
  generation: number
  documentEpoch: number
}

// Bound once per document. Old closures cannot borrow a replacement Carrier.
const documentContext: Promise<BootstrapProjection> = ipcRenderer.invoke('bootstrap:get-state')
const generation = documentContext.then(state => state.generation)

const api = Object.freeze({
  lifecycle: Object.freeze({
    stopWorker: async (): Promise<void> => {
      const state = await documentContext
      await ipcRenderer.invoke('lifecycle:stop-worker', state.generation, state.documentEpoch)
    },
    exitProduct: async (): Promise<void> => {
      const state = await documentContext
      await ipcRenderer.invoke('lifecycle:exit-product', state.generation, state.documentEpoch)
    },
  }),
  workspace: Object.freeze({
    pickDirectory: async (): Promise<string | null> => ipcRenderer.invoke('workspace:pick-directory', await generation),
  }),
  appearance: Object.freeze({
    setTitleBar: async (resolved: 'light' | 'dark', template: 'BRAUN' | 'FAMICOM'): Promise<void> =>
      ipcRenderer.invoke('appearance:set-title-bar', { resolved, template }),
  }),
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
