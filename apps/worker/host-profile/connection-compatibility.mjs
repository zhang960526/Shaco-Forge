import { HostConnectionService } from '@deepseek-ai/dsh-client-connection'

export const name = 'shaco-forge-connection-compatibility'
export const inject = ['typertGateway']

const noBrowserAuth = Object.freeze({
  isAuthenticated() { return false },
  authorizeIndex(_request, response) {
    response.writeHead(401, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Shaco Forge carrier does not expose BrowserAuth')
    return false
  },
  authenticatedUrl() { throw new Error('Shaco Forge carrier never creates a browser token URL') },
})

export default class ShacoForgeConnectionCompatibility extends HostConnectionService {
  static inject = inject
  constructor(ctx) { super(ctx, [], noBrowserAuth) }
}
