import { createHarnessTransport, createRendererTransportEvidence } from './transport.js'

Object.defineProperty(globalThis, '__zod_globalConfig', { value: Object.freeze({ jitless: true }) })
const evidence = createRendererTransportEvidence()
Object.defineProperty(globalThis, '__SHACO_FORGE_TRANSPORT_EVIDENCE__', { value: evidence })
Object.defineProperty(globalThis, '__DSH_TRANSPORT__', { value: createHarnessTransport(window.shacoForge.transport, evidence) })
