/**
 * NOT_PRODUCTION P0.S-5 non-listening Layer C compatibility service.
 * It constructs no BrowserAuth, token URL, listener, or stock Web app.
 */
import { HostConnectionService } from '@deepseek-ai/dsh-client-connection'

export const name = 'p0s5-connection-compatibility'
export const inject = ['typertGateway']

const noBrowserAuth = Object.freeze({
  isAuthenticated() {
    return false
  },
  authorizeIndex(_request, response) {
    response.writeHead(401, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('NOT_PRODUCTION local carrier has no browser authentication lane')
    return false
  },
  authenticatedUrl() {
    throw new Error('NOT_PRODUCTION local carrier never mints a browser token URL')
  },
})

export default class P0S5ConnectionCompatibility extends HostConnectionService {
  static inject = inject

  constructor(ctx) {
    super(ctx, [], noBrowserAuth)
  }
}
