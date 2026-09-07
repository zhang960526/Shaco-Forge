interface BootstrapProjection {
  phase: string
  message: string
  mainPid: number
  workerPid?: number
  hostPid?: number
}

interface Window {
  shacoForge: {
    bootstrap: {
      getState(): Promise<BootstrapProjection>
      subscribe(listener: (state: BootstrapProjection) => void): () => void
    }
    reportRuntimeEvidence(evidence: Record<string, unknown>): void
  }
}

declare module '@deepseek-ai/dsh-client-web' {
  export class AppWebEntry {
    constructor(container: HTMLElement)
    run(): Promise<void>
  }
}

declare module '*.css'
