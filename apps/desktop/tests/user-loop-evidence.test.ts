import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createUserLoopObserver, classifyFailure } from '../src/renderer/user-loop-evidence.js'
import { createHarnessTransport, createRendererTransportEvidence } from '../src/renderer/transport.js'

const marker = '0123456789abcdef0123456789abcdef'
const envelope = (args: unknown) => JSON.stringify({ type: 'client-request', rpcId: 'request', payload: { args } })
const requestEnvelope = (request: unknown) => envelope({ request })
const response = (value: unknown) => JSON.stringify({ result: { ok: true, value } })
async function scenario() {
  const observer = createUserLoopObserver()
  await observer.configureMarker(marker)
  const request = observer.request('session/prompt', requestEnvelope({ sessionId: 'session', requestId: 'prompt', content: [{ type: 'text', text: 'private prompt' }] }))
  observer.response('session/prompt', response({ accepted: true }), request)
  observer.open('stream', 'session/follow', { args: { request: { address: { kind: 'session', sessionId: 'session' } } } })
  let seq = 0
  const event = (type: string, data: Record<string, unknown> = {}) => observer.item('stream', 'session/follow', { type: 'event', event: { type, seq: ++seq, time: 100, data: { turn: 1, step: 1, ...data } } })
  return { observer, event }
}

test('outer wrapper yields the single sidebar to the same-context public Product row', async () => {
  const html = await readFile('apps/desktop/index.html', 'utf8')
  assert.doesNotMatch(html, /No Project|No Session|当前没有已连接的项目/)
  assert.doesNotMatch(html, /<aside|data-testid="new-chat"|data-testid="settings"/)
  const client = await readFile('apps/desktop/src/client/recovery.mjs', 'utf8')
  assert.match(client, /name: 'root', id: 'shaco-forge-root', priority: -1/)
  assert.doesNotMatch(client, /slots\.inject\('sidebar'/)
})

test('production bootstrap bundles the tested adapter; no second Client or direct business requests', async () => {
  const bootstrap = await readFile('apps/desktop/src/renderer/shell-bootstrap.ts', 'utf8')
  const source = await readFile('apps/desktop/src/renderer/user-loop-evidence.ts', 'utf8')
  const prepare = await readFile('apps/desktop/scripts/prepare-harness-client.mjs', 'utf8')
  assert.match(bootstrap, /createHarnessTransport/)
  assert.match(prepare, /src\/renderer\/shell-bootstrap.ts/)
  assert.doesNotMatch(source, /new (AppWebEntry|Remote|Client)|bridge\.|\.fetch\(|\.openStream\(/)
  const main = await readFile('apps/desktop/src/renderer/main.ts', 'utf8')
  assert.doesNotMatch(main, /new AppWebEntry\(/)
  assert.equal(main.match(/entry = startShaco\(/g)?.length, 1)
  assert.doesNotMatch(main, /entry\.ctx/)
})

test('prompt acceptance retains hashes and timestamp, never prompt or credentials', async () => {
  const { observer } = await scenario()
  await new Promise(resolve => setTimeout(resolve, 10))
  const text = JSON.stringify(observer.evidence)
  assert.doesNotMatch(text, /private prompt|0123456789abcdef0123456789abcdef|"session"|"prompt"/)
  assert.equal(observer.evidence.prompts[0]?.accepted, true)
  assert.equal(observer.evidence.prompts[0]?.sessionHash, createHash('sha256').update('session').digest('hex'))
  observer.request('credentials/set', envelope({ key: 'secret-value' }))
  observer.response('credentials/describe', response({ PRIVATE_KEY_REFERENCE: { configured: true, source: 'private-source', writable: true } }))
  assert.equal(observer.evidence.provider.credentialReady, true)
  assert.doesNotMatch(JSON.stringify(observer.evidence), /secret-value|PRIVATE_KEY_REFERENCE|private-source/)
})

test('live semantic ordering and pinned nested tool result shape preserve hash match', async () => {
  const { observer, event } = await scenario()
  event('turn/start'); event('step/start'); event('assistant/chunk', { chunk: { type: 'text-delta', text: 'not retained' } })
  event('assistant/message', { message: { content: [] } })
  event('tool/call', { name: 'read', callId: 'call', arguments: '{"path":"proof.txt"}' })
  event('tool/result', { message: { source: { kind: 'tool', callId: 'call' }, content: [{ type: 'tool-result', toolCallId: 'call', isError: false, content: [{ type: 'text', text: marker }] }] } })
  event('step/end'); event('step/start', { step: 2 }); event('assistant/chunk', { step: 2 })
  event('assistant/message', { step: 2, message: { content: [{ type: 'text', text: marker }] } })
  event('step/end', { step: 2 }); event('turn/end', { reason: { kind: 'completed' } })
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(observer.evidence.orderViolations, 0)
  assert.equal(observer.evidence.activeTurns, 0)
  assert.equal(observer.evidence.maxActiveTurns, 1)
  const result = observer.evidence.events.find(row => row.type === 'tool/result')!
  assert.equal(result.toolName, 'read'); assert.equal(result.isError, false); assert.equal(result.markerMatch, true)
  assert.equal(result.markerSha256, createHash('sha256').update(marker).digest('hex'))
  assert.doesNotMatch(JSON.stringify(observer.evidence), /not retained|proof.txt|0123456789abcdef0123456789abcdef/)
})

test('workspace proof observes the pinned nested identity and hashes the requested path even on rejection', async () => {
  const observer = createUserLoopObserver()
  const accepted = observer.request('workspace/create', requestEnvelope({ path: 'controlled-path' }))
  observer.response('workspace/create', response({ workspace: { workspaceId: 'workspace-identity', path: 'controlled-path', title: 'private title' }, created: true }), accepted)
  const rejected = observer.request('workspace/create', requestEnvelope({ path: 'rejected-path' }))
  observer.response('workspace/create', JSON.stringify({ result: { ok: false, error: { code: 'workspace-invalid-path' } } }), rejected)
  await new Promise(resolve => setTimeout(resolve, 10))
  const digest = (value: string) => createHash('sha256').update(value).digest('hex')
  assert.equal(observer.evidence.workspaces[0]?.accepted, true)
  assert.equal(observer.evidence.workspaces[0]?.pathHash, digest('controlled-path'))
  assert.equal(observer.evidence.workspaces[0]?.workspaceHash, digest('workspace-identity'))
  assert.equal(observer.evidence.workspaces[1]?.accepted, false)
  assert.equal(observer.evidence.workspaces[1]?.pathHash, digest('rejected-path'))
  assert.equal(observer.evidence.workspaces[1]?.workspaceHash, undefined)
  assert.doesNotMatch(JSON.stringify(observer.evidence), /controlled-path|rejected-path|workspace-identity|private title/)
})

test('Session creation uses the public request wrapper and redacts preset mount diagnostics', async () => {
  const observer = createUserLoopObserver()
  const request = observer.request('session/create', requestEnvelope({ workspaceId: 'workspace-private' }))
  observer.response('session/create', JSON.stringify({ result: { ok: false, error: { code: 'agent-preset-invalid', message: 'private message', details: {
    agentPreset: 'standard', reason: '1 row(s) did not activate:\ntool-example (@deepseek-ai/dsh-tool-example): waiting for exampleService (C:\\private-path\\preset.yml)',
  } } } }), request)
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(observer.evidence.sessions[0]?.workspaceHash, createHash('sha256').update('workspace-private').digest('hex'))
  assert.equal(observer.evidence.sessions[0]?.presetFailureKind, 'MISSING_HOST_SERVICES')
  assert.deepEqual(observer.evidence.sessions[0]?.presetWaitingRows, [{ row: 'tool-example', package: '@deepseek-ai/dsh-tool-example', services: ['exampleService'] }])
  assert.doesNotMatch(JSON.stringify(observer.evidence), /workspace-private|private message|private-path/)
  observer.response('session/create', JSON.stringify({ result: { ok: false, error: { code: 'agent-preset-invalid', details: { reason: 'credential secret-value' } } } }), request)
  assert.equal(observer.evidence.sessions[0]?.presetReasonSummary, 'CREDENTIAL_RELATED_DETAILS_REDACTED')
  assert.doesNotMatch(JSON.stringify(observer.evidence), /secret-value/)
})

test('accepted Session identity remains associated with its requested controlled Workspace', async () => {
  const observer = createUserLoopObserver()
  const request = observer.request('session/create', requestEnvelope({ workspaceId: 'controlled-workspace' }))
  observer.response('session/create', response({ sessionId: 'created-session', agentPreset: 'standard' }), request)
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(request?.accepted, true)
  assert.equal(request?.sessionHash, createHash('sha256').update('created-session').digest('hex'))
  assert.equal(request?.workspaceHash, createHash('sha256').update('controlled-workspace').digest('hex'))
})

test('follow binding requires the pinned public named request and exposes its hash before Composer submission', async () => {
  const { observer } = await scenario()
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(observer.evidence.followStreams.length, 1)
  assert.equal(observer.evidence.followStreams[0]?.sessionHash, createHash('sha256').update('session').digest('hex'))
  const invalid = createUserLoopObserver()
  invalid.open('bad', 'session/follow', { args: { address: { kind: 'session', sessionId: 'unbound' } } })
  assert.equal(invalid.evidence.followStreams.length, 0)
  assert.equal(invalid.evidence.observerErrors, 1)
})

test('child observations are bounded, deduplicated and limited to controlled prompted parents', async () => {
  const { observer } = await scenario()
  const catalog = (parentSessionId: string, sessionId: string) => observer.response('session/list', response({ items: [{ parentSessionId, sessionId, origin: 'subagent', cwd: 'private-child-path' }] }))
  catalog('unrelated-parent', 'unrelated-child')
  assert.equal(observer.evidence.childAgentSpawnsObserved, 0)
  catalog('session', 'controlled-child')
  observer.open('child-stream', 'session/follow', { args: { request: { address: { kind: 'subagent', parentSessionId: 'session', childSessionId: 'controlled-child' } } } })
  assert.equal(observer.evidence.childAgentSpawnsObserved, 1)
  assert.doesNotMatch(JSON.stringify(observer.evidence), /controlled-child|unrelated-child|private-child-path/)
  for (let i = 0; i < 12; i++) catalog('session', `child-${i}`)
  assert.equal(observer.evidence.childAgentSpawnsObserved, 8)
  assert.ok(observer.evidence.droppedMetadata > 0)
})

test('continuous chunks are counted without accumulating transcript or one row per chunk', async () => {
  const { observer, event } = await scenario()
  event('turn/start'); event('step/start')
  for (let i = 0; i < 10_000; i++) event('assistant/chunk', { chunk: { text: 'private'.repeat(100) } })
  assert.equal(observer.evidence.counts['assistant/chunk'], 10_000)
  assert.equal(observer.evidence.events.length, 3)
  assert.equal(observer.evidence.droppedMetadata, 0)
  assert.ok(JSON.stringify(observer.evidence).length < 4096)
})

test('browse listing evidence keeps only accepted path hashes or error codes, never directory contents', async () => {
  const observer = createUserLoopObserver()
  const listed = observer.request('directoryPicker/list', envelope({ path: 'controlled-path' }))
  observer.response('directoryPicker/list', response({ path: 'controlled-path', home: 'private-home', entries: [{ name: 'private-folder' }] }), listed)
  const failed = observer.request('directoryPicker/list', envelope({ path: 'invalid-path' }))
  observer.response('directoryPicker/list', JSON.stringify({ result: { ok: false, error: { code: 'directory-unreadable', message: 'private error path', details: { path: 'invalid-path' } } } }), failed)
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(observer.evidence.directoryLists[0]?.accepted, true)
  assert.equal(observer.evidence.directoryLists[0]?.listedPathHash, createHash('sha256').update('controlled-path').digest('hex'))
  assert.equal(observer.evidence.directoryLists[1]?.accepted, false)
  assert.equal(observer.evidence.directoryLists[1]?.errorCode, 'directory-unreadable')
  assert.doesNotMatch(JSON.stringify(observer.evidence), /controlled-path|invalid-path|private-home|private-folder|private error path/)
  for (let i = 0; i < 20; i++) observer.request('directoryPicker/list', envelope({}))
  assert.equal(observer.evidence.directoryLists.length, 8)
  assert.ok(observer.evidence.droppedMetadata > 0)
})

test('semantic metadata cap is bounded and fail-visible', async () => {
  const { observer, event } = await scenario()
  for (let i = 0; i < 1000; i++) event('assistant/message', { message: { content: [] } })
  assert.equal(observer.evidence.events.length, 256)
  assert.ok(observer.evidence.droppedMetadata > 0)
})

test('duplicate turn terminal and invalid order are detected', async () => {
  const { observer, event } = await scenario()
  event('turn/start'); event('turn/end', { reason: { kind: 'completed' } }); event('turn/end')
  assert.equal(observer.evidence.duplicateTerminals, 1)
  assert.ok(observer.evidence.orderViolations > 0)
})

test('snapshot history and unprompted Sessions cannot prove live gate', () => {
  const observer = createUserLoopObserver()
  observer.open('s', 'session/follow', { args: { request: { address: { kind: 'session', sessionId: 'old' } } } })
  observer.item('s', 'session/follow', { type: 'snapshot', records: [{ type: 'turn/start' }] })
  observer.item('s', 'session/follow', { type: 'event', event: { type: 'turn/start', seq: 1, data: {} } })
  assert.equal(observer.evidence.events.length, 0)
})

for (const kind of ['approval/request', 'user-questions/request']) test(`${kind} private interaction traffic is ignored by production diagnostics`, () => {
  const observer = createUserLoopObserver()
  const before = JSON.stringify(observer.evidence)
  let privateReads = 0
  observer.item('events', '$events', { type: 'waterfall', event: kind,
    get eventId() { privateReads++; throw new Error('PRIVATE_ID_READ') }, request: { secret: 'private' } })
  const body = envelope({ eventId: 'id', outcome: { kind: 'result', value: 'private-answer' } })
  const request = observer.request('$events/result', body)
  observer.response('$events/result', response({}), request)
  assert.equal(request, undefined)
  observer.request('$events/result', body)
  assert.equal(privateReads, 0)
  assert.equal(JSON.stringify(observer.evidence), before)
  assert.equal(Object.hasOwn(observer.evidence, 'interactions'), false)
})

test('background stream coexistence and iterator cleanup are measured on unchanged values', async () => {
  let id = 0
  const original = Object.freeze({ type: 'ready' })
  const evidence = createRendererTransportEvidence()
  const transport = createHarnessTransport({
    async fetch() { return { status: 200, body: '{}', contentType: 'application/json' } },
    async openStream() { return String(++id) }, async pullStream() { return { done: false, value: original } }, async cancelStream() {},
  }, evidence)
  const iterators = ['$events', 'workspace/follow', 'session/control', 'session/follow'].map(endpoint => transport.openStream(endpoint, { args: {} })[Symbol.asyncIterator]())
  for (const iterator of iterators) assert.equal((await iterator.next()).value, original)
  assert.equal(evidence.maxActiveStreams, 4)
  for (const iterator of iterators) await iterator.return?.()
  assert.equal(evidence.activeStreams, 0)
})

for (const [input, expected] of [
  ['missing API key', 'HUMAN_REQUIRED_PROVIDER_CREDENTIAL'],
  ['provider configuration invalid', 'HARNESS_PROVIDER_CONFIGURATION_BLOCKED'],
  ['HTTP 429', 'HARNESS_PROVIDER_OR_NETWORK_FAILURE'],
  ['TLS certificate failure', 'HARNESS_PROVIDER_OR_NETWORK_FAILURE'],
  ['ENOTFOUND', 'HARNESS_PROVIDER_OR_NETWORK_FAILURE'],
  ['401 unauthorized', 'HARNESS_PROVIDER_OR_NETWORK_FAILURE'],
]) test(`Provider failure classification: ${input}`, () => {
  assert.equal(classifyFailure(input, true), expected)
  assert.equal(classifyFailure(input, false), 'SHACO_IMPLEMENTATION_FAILURE')
})
