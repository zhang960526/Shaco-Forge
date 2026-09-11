interface BootstrapProjection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
  generation: number
  connectionState?: string
  projectionRebuildComplete?: boolean
}

interface Window {
  __SHACO_PRESENTATION__: import('./shaco-bootstrap.mjs').ShacoPresentationBridge & { theme: import('./theme/theme.js').RootThemeController }
  shacoForge: {
    workspace: { pickDirectory(): Promise<string | null> }
    bootstrap: {
      getState(): Promise<BootstrapProjection>
      reportProjection(report: Record<string, boolean>): Promise<void>
      subscribe(listener: (state: BootstrapProjection) => void): () => void
    }
    transport: {
      fetch(request: { url: string; method: string; contentType: string; body: string }): Promise<{ status: number; contentType: string; body: string }>
      openStream(endpoint: string, payload: Record<string, unknown>): Promise<string>
      pullStream(streamId: string): Promise<{ done: boolean; value?: unknown; error?: string }>
      cancelStream(streamId: string, reason: string): Promise<void>
    }
    reportRuntimeEvidence(evidence: Record<string, unknown>): void
  }
  __SHACO_FORGE_TRANSPORT_EVIDENCE__: {
    fetchEndpoints: string[]
    streamEndpoints: string[]
    abortCancels: number
    iteratorCancels: number
    eventsReady: number
    userLoop: ReturnType<typeof import('./user-loop-evidence.js').createUserLoopObserver>
    activeStreams: number
    maxActiveStreams: number
  }
  __SHACO_RENDERER_TRANSPORT_IMPL__: {
    ownsHost: true
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
    openStream(endpoint: string, payload: Record<string, unknown>, signal?: AbortSignal): AsyncIterable<unknown>
  }
}

declare module '*.css'
