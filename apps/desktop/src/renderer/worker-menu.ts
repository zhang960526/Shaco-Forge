// Desktop controls survive disposal of the disconnected Harness Client root.
export function bindWorkerMenu(root: HTMLElement, lifecycle: Window['shacoForge']['lifecycle']) {
  const trigger = root.querySelector<HTMLButtonElement>('.worker-menu-trigger')!
  const menu = root.querySelector<HTMLElement>('[role="menu"]')!
  const status = root.querySelector<HTMLOutputElement>('output')!
  const stop = root.querySelector<HTMLButtonElement>('[data-testid="stop-worker"]')!
  const exit = root.querySelector<HTMLButtonElement>('[data-testid="exit-product"]')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const controller = new AbortController()
  const options = { signal: controller.signal }
  let projection: BootstrapProjection | undefined
  let busy = false
  const items = () => [stop, exit].filter(button => !button.disabled)
  const close = (restore = false) => {
    menu.hidden = true; trigger.setAttribute('aria-expanded', 'false')
    if (restore) trigger.focus()
  }
  const show = () => {
    menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); items()[0]?.focus()
  }
  const update = (next = projection) => {
    projection = next
    const state = next?.lifecycleState
    const connected = state !== 'STOPPED' && state !== 'STOPPING' && state !== 'STOP_FAILED' && next?.connectionState === 'CONNECTED'
    const label = state === 'STOPPED' ? '已停止' : state === 'STOPPING' ? '正在停止…' : state === 'STOP_FAILED' ? '停止失败'
      : connected ? '已连接' : ['RECONNECTING', 'CONNECTION_LOST'].includes(next?.connectionState ?? '') ? '正在重新连接'
      : ['FAILED', 'INCOMPATIBLE'].includes(next?.connectionState ?? '') ? '连接失败' : '正在连接'
    status.textContent = `Worker · ${label}`
    status.dataset.connected = String(connected)
    root.dataset.lifecycleState = state ?? 'RUNNING'
    stop.disabled = busy || state === 'STOPPING' || state === 'STOPPED' || !next?.generation
    exit.disabled = busy || state === 'STOPPING' || !next?.generation
  }
  const act = async (action: 'stop' | 'exit') => {
    if (busy || (action === 'stop' ? stop.disabled : exit.disabled)) return
    close(true); busy = true; error.hidden = true; update()
    try { await (action === 'stop' ? lifecycle.stopWorker() : lifecycle.exitProduct()) }
    catch {
      error.textContent = action === 'exit' ? '退出未完成：Worker 停止失败或窗口已变更，请确认状态后重试。' : 'Worker 停止未完成，请确认状态后重试。'
      error.hidden = false
    } finally { busy = false; update() }
  }
  trigger.addEventListener('click', () => menu.hidden ? show() : close(), options)
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); show(); if (event.key === 'ArrowUp') items().at(-1)?.focus() }
  }, options)
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); close(true) }
    if (event.key === 'Tab') close()
    if (menu.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const enabled = items(), index = enabled.indexOf(document.activeElement as HTMLButtonElement)
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
      : (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
    enabled[target]?.focus()
  }, options)
  document.addEventListener('pointerdown', event => { if (!root.contains(event.target as Node)) close() }, options)
  stop.addEventListener('click', () => { void act('stop') }, options)
  exit.addEventListener('click', () => { void act('exit') }, options)
  update()
  return { update, dispose: () => controller.abort() }
}
