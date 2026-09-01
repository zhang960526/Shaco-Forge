/**
 * NOT_PRODUCTION P0.S-4 non-listening Layer C compatibility service.
 * Uses the package-root preview export and deliberately constructs no
 * BrowserAuth, token URL, HTTP listener, or stock Web application.
 */
import { HostConnectionService } from '@deepseek-ai/dsh-client-connection'

export const name = 'p0s4-connection-compatibility'
export const inject = ['typertGateway']

const noBrowserAuth = Object.freeze({
  isAuthenticated() {
    return false
  },
  authorizeIndex(_request, response) {
    response.writeHead(401, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('NOT_PRODUCTION carrier has no browser authentication lane')
    return false
  },
  authenticatedUrl() {
    throw new Error('NOT_PRODUCTION carrier never mints a browser token URL')
  },
})

export default class P0S4ConnectionCompatibility extends HostConnectionService {
  static inject = inject

  constructor(ctx) {
    super(ctx, [], noBrowserAuth)
  }
}

