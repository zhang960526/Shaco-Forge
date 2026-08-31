(function installP0S2ShellBootstrap() {
  'use strict'

  const fatal = []
  addEventListener('error', (event) => {
    fatal.push({ kind: 'error', message: String(event.message || event.error || 'unknown renderer error') })
  })
  addEventListener('unhandledrejection', (event) => {
    fatal.push({ kind: 'unhandledrejection', message: String(event.reason || 'unknown rejection') })
  })
  Object.defineProperty(window, '__P0S2_FATAL__', {
    value: fatal,
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
  Object.defineProperty(window, '__DSH_TRANSPORT__', {
    value: Object.freeze({ ownsHost: true }),
    configurable: false,
    enumerable: false,
    writable: false,
  })
})()
