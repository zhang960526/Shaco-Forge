import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { RecoveryCoordinator } from './recovery-coordinator.js'
import type { WorkerSupervisor } from './worker-supervisor.js'

export type ProductLifecycleState = 'RUNNING' | 'STOPPING' | 'STOPPED' | 'STOP_FAILED'

// The preload captures these two values once per document, never from Renderer input.
export function assertLifecycleDocument(event: IpcMainInvokeEvent, window: BrowserWindow | undefined,
  generation: unknown, epoch: unknown, currentGeneration: number | undefined, currentEpoch: number): void {
  if (!window || window.isDestroyed() || window.webContents.isDestroyed()
    || event.sender !== window.webContents || !event.senderFrame
    || event.senderFrame !== window.webContents.mainFrame
    || !event.senderFrame.url.startsWith('shaco-forge://client/')
    || window.webContents.isLoadingMainFrame()) throw new Error('UNTRUSTED_LIFECYCLE_RENDERER')
  if (!Number.isInteger(generation) || generation !== currentGeneration
    || !Number.isInteger(epoch) || epoch !== currentEpoch) throw new Error('STALE_LIFECYCLE_DOCUMENT')
}

export class ProductLifecycle {
  state: ProductLifecycleState = 'RUNNING'
  #stopping: Promise<void> | undefined
  constructor(readonly recovery: Pick<RecoveryCoordinator, 'stop' | 'settled'>,
    readonly supervisor: Pick<WorkerSupervisor, 'stop'>,
    readonly publish: (state: ProductLifecycleState) => void,
    readonly quit: () => void) {}

  #set(state: ProductLifecycleState): void { this.state = state; this.publish(state) }

  async stopWorker(assertCurrent: () => void): Promise<void> {
    assertCurrent()
    if (this.state === 'STOPPED') return
    if (this.#stopping) { await this.#stopping; assertCurrent(); return }
    this.#set('STOPPING')
    // Fence synchronously, before the first await and before physical shutdown.
    this.recovery.stop()
    this.#stopping = (async () => {
      try {
        // A recovery already in progress must finish before stopping its authority.
        await this.recovery.settled()
        assertCurrent()
        const result = await this.supervisor.stop()
        if (!result.exited || result.delivery !== 'STOP_DELIVERED') throw new Error('CONTROLLED_WORKER_STOP_FAILED')
        this.#set('STOPPED')
      } catch {
        this.#set('STOP_FAILED')
        throw new Error('CONTROLLED_WORKER_STOP_FAILED')
      } finally { this.#stopping = undefined }
    })()
    await this.#stopping
  }

  async exitProduct(assertCurrent: () => void): Promise<void> {
    await this.stopWorker(assertCurrent)
    // Navigation during shutdown may finish the old stop, but cannot quit a new document.
    assertCurrent()
    this.quit()
  }
}
