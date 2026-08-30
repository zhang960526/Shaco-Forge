/**
 * NOT_PRODUCTION P0.S-1 Layer C compatibility service.
 *
 * It uses only the package root export of dsh-client-connection. It does not
 * construct BrowserAuth, provide a Cordis webServer service, bind a socket,
 * expose an application URL, or compose the stock Web product.
 */
import { HostConnectionService } from '@deepseek-ai/dsh-client-connection'

export const name = 'p0s1-connection-compatibility'
export const inject = ['typertGateway']

const noBrowserAuth = Object.freeze({
  isAuthenticated() {
    return false
  },
  authorizeIndex(_request, response) {
    response.writeHead(401, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not available in the NOT_PRODUCTION Host-only spike')
    return false
  },
  authenticatedUrl() {
    throw new Error('NOT_PRODUCTION Host-only compatibility service does not mint token URLs')
  },
})

function failure(error) {
  return {
    ok: false,
    error: {
      code: 'internal',
      message: error instanceof Error ? error.message : 'Gateway invocation failed',
      details: {},
    },
  }
}

export default class P0S1ConnectionCompatibility extends HostConnectionService {
  static inject = inject

  constructor(ctx) {
    super(ctx, [], noBrowserAuth)

    this.gatewayDisposer = this.rpc.intercept(
      '/api',
      endpoint => endpoint.includes('/'),
      async (endpoint, payload, signal) => {
        const separator = endpoint.indexOf('/')
        if (separator <= 0 || separator === endpoint.length - 1) {
          return failure(new Error('Remote endpoint must be namespace/method'))
        }
        try {
          const value = await ctx.typertGateway.invoke({
            namespace: endpoint.slice(0, separator),
            method: endpoint.slice(separator + 1),
            args: payload && typeof payload === 'object' ? payload : {},
            signal,
          })
          return { ok: true, value }
        } catch (error) {
          return failure(error)
        }
      },
    )

    ctx.effect(() => async () => {
      await this.gatewayDisposer()
    })
  }
}

