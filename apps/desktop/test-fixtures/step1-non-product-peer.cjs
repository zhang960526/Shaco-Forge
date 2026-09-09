// Diagnostic fixture only. This never imports or starts Shaco Product code.
const { connect } = require('node:net')

const deadline = setTimeout(() => process.exit(2), 8000)
const peer = connect(process.env.SHACO_STEP1_IDENTITY_PROBE_PIPE)
peer.on('connect', () => {
  // These public, client-selected values cannot establish Product identity.
  peer.write('non-product-identity-probe\n')
})
peer.on('data', () => peer.end())
peer.on('end', () => {
  clearTimeout(deadline)
  process.exit(0)
})
peer.on('error', () => {
  clearTimeout(deadline)
  process.exit(3)
})
