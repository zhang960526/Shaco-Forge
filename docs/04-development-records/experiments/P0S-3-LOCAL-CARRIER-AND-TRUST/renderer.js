/* NOT_PRODUCTION: sandboxed Renderer evidence probe. */

const status = document.querySelector('#status')

const rendererSnapshot = {
  requireType: typeof globalThis.require,
  processType: typeof globalThis.process,
  bridgeNames: Object.keys(globalThis).filter(key => key.startsWith('p0s3')),
  bridgeKeys: Object.keys(globalThis.p0s3Bridge ?? {}).sort(),
  transportGlobalPresent: '__DSH_TRANSPORT__' in globalThis,
  cookie: document.cookie,
  protocol: location.protocol,
  origin: location.origin,
}

globalThis.p0s3Bridge.run(rendererSnapshot).then(result => {
  status.textContent = result === 'PASS' ? 'P0.S-3 PASS' : 'P0.S-3 FAIL'
}).catch(error => {
  status.textContent = `P0.S-3 FAIL: ${String(error?.message ?? error)}`
})
