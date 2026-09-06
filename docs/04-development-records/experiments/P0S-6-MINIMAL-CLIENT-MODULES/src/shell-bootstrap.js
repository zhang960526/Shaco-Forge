(function installP0S6ShellBootstrap() {
  'use strict'

  const fatal = []
  const record = (kind, value) => {
    if (fatal.length >= 20) return
    fatal.push({ kind, message: String(value ?? 'unknown').slice(0, 1000) })
  }
  addEventListener('error', (event) => record('error', event.message || event.error))
  addEventListener('unhandledrejection', (event) => record('unhandledrejection', event.reason))

  const safetyTimer = setTimeout(() => {
    void globalThis.p0s6Bridge?.complete({
      ok: false,
      failure: 'renderer evidence safety deadline reached before AppWebEntry completion',
      fatalEvents: [...fatal],
    })
  }, 35_000)

  Object.defineProperty(globalThis, '__P0S6_CAPTURE__', {
    value: Object.freeze({ fatal, safetyTimer }),
    configurable: false,
    enumerable: false,
    writable: false,
  })
  Object.defineProperty(globalThis, '__zod_globalConfig', {
    value: Object.freeze({ jitless: true }),
    configurable: false,
    enumerable: false,
    writable: false,
  })
  Object.defineProperty(globalThis, '__DSH_TRANSPORT__', {
    value: Object.freeze({ ownsHost: true }),
    configurable: false,
    enumerable: false,
    writable: false,
  })
})()

