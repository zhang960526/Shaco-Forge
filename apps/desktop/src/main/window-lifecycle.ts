export interface ProjectionWebContents {
  isDestroyed(): boolean
  send(channel: string, value: unknown): void
  getURL(): string
}

export interface ProjectionWindow {
  isDestroyed(): boolean
  webContents: ProjectionWebContents
}

export function sendProjectionIfAlive(window: ProjectionWindow | undefined, projection: unknown): boolean {
  if (window === undefined || window.isDestroyed() || window.webContents.isDestroyed()) return false
  window.webContents.send('bootstrap:state', projection)
  return true
}

export function snapshotLoadingUrl(window: ProjectionWindow | undefined): string | undefined {
  if (window === undefined || window.isDestroyed() || window.webContents.isDestroyed()) return undefined
  return window.webContents.getURL()
}
