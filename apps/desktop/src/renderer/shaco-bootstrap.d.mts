export interface ShacoPresentationBridge {
  harnessReady: boolean
  failClosed(reason: string): void
  beforeRootRevoke(): void
}
export interface ShacoPresentation {
  run(): Promise<void>
  dispose(): Promise<void>
  diagnostics(): Record<string, unknown>
}
export function startShaco(container: HTMLElement, bridge: ShacoPresentationBridge): ShacoPresentation
