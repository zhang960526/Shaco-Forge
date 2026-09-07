export interface RendererTransportEvidence {
  fetchEndpoints: string[]
  streamEndpoints: string[]
  abortCancels: number
  iteratorCancels: number
  eventsReady: number
  lastStreamPayloads: Record<string, Record<string, unknown>>
}

export interface RendererTransportBridge {
  fetch(request: { url: string; method: string; contentType: string; body: string }): Promise<{ status: number; contentType: string; body: string }>
  openStream(endpoint: string, payload: Record<string, unknown>): Promise<string>
  pullStream(streamId: string): Promise<{ done: boolean; value?: unknown; error?: string }>
  cancelStream(streamId: string, reason: string): Promise<void>
}

export function createRendererTransportEvidence(): RendererTransportEvidence {
  return { fetchEndpoints: [], streamEndpoints: [], abortCancels: 0, iteratorCancels: 0, eventsReady: 0, lastStreamPayloads: Object.create(null) as Record<string, Record<string, unknown>> }
}

export function createHarnessTransport(bridge: RendererTransportBridge, evidence: RendererTransportEvidence) {
  return Object.freeze({
    ownsHost: true as const,
    async fetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
      const body = init.body ?? (input instanceof Request ? await input.text() : undefined)
      if (typeof body !== 'string') throw new TypeError('Shaco transport accepts JSON string bodies only')
      evidence.fetchEndpoints.push(new URL(url).pathname.replace(/^\/api\//, ''))
      const response = await bridge.fetch({
        url,
        method: init.method ?? (input instanceof Request ? input.method : 'GET'),
        contentType: headers.get('content-type') ?? '',
        body,
      })
      return new Response(response.body, { status: response.status, headers: { 'content-type': response.contentType } })
    },
    openStream(endpoint: string, payload: Record<string, unknown>, signal?: AbortSignal): AsyncIterable<unknown> {
      evidence.streamEndpoints.push(endpoint)
      evidence.lastStreamPayloads[endpoint] = payload
      return {
        async *[Symbol.asyncIterator](): AsyncGenerator<unknown, void, void> {
          const streamId = await bridge.openStream(endpoint, payload)
          let terminal = false
          const abort = (): void => {
            evidence.abortCancels += 1
            void bridge.cancelStream(streamId, 'abort-signal')
          }
          if (signal?.aborted === true) abort()
          else signal?.addEventListener('abort', abort, { once: true })
          try {
            for (;;) {
              const item = await bridge.pullStream(streamId)
              if (item.error !== undefined) throw new Error(item.error)
              if (item.done) {
                terminal = true
                return
              }
              if (endpoint === '$events' && typeof item.value === 'object' && item.value !== null && 'type' in item.value && item.value.type === 'ready') {
                evidence.eventsReady += 1
              }
              yield item.value
            }
          } finally {
            signal?.removeEventListener('abort', abort)
            if (!terminal) {
              evidence.iteratorCancels += 1
              await bridge.cancelStream(streamId, 'iterator-return')
            }
          }
        },
      }
    },
  })
}
