import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = import.meta.dirname
const readJson = (name) => JSON.parse(readFileSync(join(root, 'evidence', name), 'utf8'))
const write = readJson('write.json')
const read = readJson('read.json')
const settingsText = readFileSync(join(root, 'runtime-data', 'settings.yaml'), 'utf8')
const fail = (message) => { throw new Error(message) }

for (const [label, row] of [['write', write], ['read', read]]) {
  if (row.notProduction !== true || row.gate !== 'P0.S-2') fail(`${label}: missing NOT_PRODUCTION gate`)
  if (row.renderer?.ok !== true) fail(`${label}: renderer probe failed`)
  if (row.renderer?.loading?.protocol !== 'shaco-forge:' || row.renderer?.loading?.stockHttpOrigin !== false) fail(`${label}: loading model mismatch`)
  if (row.renderer?.harnessClient?.appWebEntryMounted !== true || row.renderer?.harnessClient?.sessionTreeEntered !== true) fail(`${label}: Harness Client/session UI missing`)
  if (row.renderer?.harnessClient?.chatMarker !== 'bash') fail(`${label}: session chat marker missing`)
  if (row.renderer?.settings?.ok !== true || row.renderer?.settings?.persistenceMode !== 'host') fail(`${label}: settings contract failed`)
  if (row.renderer?.security?.contextIsolated !== true || row.renderer?.security?.sandboxed !== true) fail(`${label}: renderer isolation mismatch`)
  if (row.renderer?.security?.rendererRequireType !== 'undefined' || row.renderer?.security?.rendererProcessType !== 'undefined') fail(`${label}: Node leaked into renderer`)
  if (row.renderer?.security?.workerTransportPresent !== false
    || row.renderer?.security?.directTransportFunctionsPresent !== false
    || JSON.stringify(row.renderer?.security?.dshTransportHookKeys) !== JSON.stringify(['ownsHost'])
    || row.renderer?.security?.credentialBridgePresent !== false) fail(`${label}: forbidden renderer capability present`)
  if (row.network?.stockDshWebAppStarted !== false || row.network?.tcpListenerProbe?.listeners?.length !== 0) fail(`${label}: listener or stock web app detected`)
  if (row.renderer?.rendererFatalEvents?.length !== 0) fail(`${label}: renderer fatal event detected`)
}
if (write.canarySha256 !== read.canarySha256) fail('independent processes did not use the same canary')
if (write.renderer.settings.revisionAfter <= write.renderer.settings.revisionBefore) fail('write did not advance the Harness settings revision')
if (read.renderer.settings.revisionAfter !== read.renderer.settings.revisionBefore) fail('read process unexpectedly mutated settings')
if (write.renderer.settings.observedCanary !== read.renderer.settings.observedCanary) fail('persisted canary was not recovered by the second process')
if (!settingsText.includes('p0s2-canary:') || !settingsText.includes('canary:')) fail('Harness settings.yaml does not contain the canary namespace')

const summary = {
  schemaVersion: 1,
  notProduction: true,
  gate: 'P0.S-2',
  result: 'PASS',
  independentElectronProcesses: true,
  runPidsDistinct: write.runtime.appMetrics[0]?.pid !== read.runtime.appMetrics[0]?.pid,
  canarySha256: write.canarySha256,
  settingsDocumentSha256: createHash('sha256').update(settingsText).digest('hex'),
  gates: {
    customScheme: true,
    realHarnessClient: true,
    sessionUiEnterable: true,
    harnessSettingsContract: true,
    fileSettingsPersistence: true,
    rendererIsolation: true,
    noWorkerTransport: true,
    noCredentialBridge: true,
    noStockWebApp: true,
    noTcpListener: true,
  },
}
if (!summary.runPidsDistinct) fail('write/read Electron process ids are not distinct')
writeFileSync(join(root, 'evidence', 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(summary))
