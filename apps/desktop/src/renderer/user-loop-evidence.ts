// Observes existing transport values only. This module owns no Client, Remote,
// navigation or business state and never issues a request.
const EVENT_LIMIT = 256
const IDENTITY_LIMIT = 32
const SEMANTIC = new Set(['turn/start', 'step/start', 'assistant/chunk', 'tool/call', 'tool/result', 'assistant/message', 'step/end', 'turn/end'])
type Row = Record<string, unknown>
const record = (value: unknown): Row => typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Row : {}
const safeName = (value: unknown): string | undefined => typeof value === 'string' && /^[a-zA-Z0-9_.:/-]{1,100}$/.test(value) ? value : undefined

export function classifyFailure(value: unknown, healthy: boolean): string {
  if (!healthy) return 'SHACO_IMPLEMENTATION_FAILURE'
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (/missing.*(credential|api.?key)|no.*(credential|api.?key)|credential.*(missing|not.?found)/i.test(text)) return 'HUMAN_REQUIRED_PROVIDER_CREDENTIAL'
  if (/401|403|429|5\d\d|ENOTFOUND|ECONN|DNS|TLS|certificate|timeout|timed out|authentication|unauthorized/i.test(text)) return 'HARNESS_PROVIDER_OR_NETWORK_FAILURE'
  if (/model.unavailable|provider.*(invalid|unavailable|not.?found|configuration)|unknown.*(provider|model)/i.test(text)) return 'HARNESS_PROVIDER_CONFIGURATION_BLOCKED'
  return 'UNCLASSIFIED_HARNESS_FAILURE'
}

export function createUserLoopObserver() {
  const evidence = {
    mode: 'OBSERVATION_ONLY',
    counts: Object.create(null) as Record<string, number>,
    events: [] as Row[], prompts: [] as Row[], workspaces: [] as Row[], sessions: [] as Row[], directoryLists: [] as Row[], followStreams: [] as Row[],
    provider: { model: undefined as string | undefined, provider: undefined as string | undefined, routable: undefined as boolean | undefined, credentialReady: undefined as boolean | undefined },
    activeTurns: 0, maxActiveTurns: 0, orderViolations: 0, duplicateTerminals: 0,
    droppedMetadata: 0, observerErrors: 0, pendingHashes: 0,
    childAgentSpawnsObserved: 0,
    expectedMarkerSha256: undefined as string | undefined,
  }
  let marker = ''
  let markerHash = ''
  let sequence = 0
  const hashes = new Map<string, Promise<string>>()
  const streams = new Map<string, { sessionId?: string; lastSeq?: number; active: boolean; step: boolean; chunkSeen: boolean; calls: Map<string, string | undefined> }>()
  const prompted = new Set<string>()
  const observedChildren = new Set<string>()
  function observeChild(parent: unknown, child: unknown): void {
    if (typeof parent !== 'string' || !prompted.has(parent) || typeof child !== 'string' || observedChildren.has(child)) return
    if (observedChildren.size >= 8) { evidence.droppedMetadata++; return }
    observedChildren.add(child)
    evidence.childAgentSpawnsObserved++
  }
  function hash(value: unknown): Promise<string> | undefined {
    if (typeof value !== 'string' || value.length > 1024) return undefined
    const existing = hashes.get(value)
    if (existing !== undefined) return existing
    if (hashes.size >= IDENTITY_LIMIT) { evidence.droppedMetadata++; return undefined }
    evidence.pendingHashes++
    const promise = crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)).then(bytes =>
      Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join(''))
      .finally(() => { evidence.pendingHashes-- })
    hashes.set(value, promise)
    return promise
  }
  function correlate(row: Row, key: string, value: unknown): void {
    const pending = hash(value)
    if (pending) void pending.then(result => { row[key] = result }).catch(() => { evidence.observerErrors++ })
  }
  function append(target: Row[], row: Row, limit = EVENT_LIMIT): void {
    if (target.length < limit) target.push(row)
    else evidence.droppedMetadata++
  }
  function matches(content: unknown): boolean {
    if (!marker || !Array.isArray(content)) return false
    // No stringify/retention of arguments, messages, arbitrary meta or secrets.
    return content.some(part => record(part).type === 'text' && typeof record(part).text === 'string' && (record(part).text as string).includes(marker))
  }
  function observe(action: () => void): void {
    try { action() } catch { evidence.observerErrors++ }
  }
  return {
    evidence,
    async configureMarker(value: string): Promise<void> {
      if (marker || !/^[a-f0-9]{32,64}$/.test(value)) throw new Error('One bounded proof marker is required')
      marker = value
      markerHash = await hash(value)!
      evidence.expectedMarkerSha256 = markerHash
    },
    request(endpoint: string, body: string): Row | undefined {
      let metadata: Row | undefined
      observe(() => {
        if (!['session/prompt', 'session/create', 'workspace/create', 'directoryPicker/list'].includes(endpoint)) return
        const envelope = record(JSON.parse(body))
        const wireArgs = record(record(envelope.payload).args)
        // These public methods each take one named `request` object;
        // directory listing instead uses its direct named arguments.
        const args = ['session/prompt', 'session/create', 'workspace/create'].includes(endpoint) ? record(wireArgs.request) : wireArgs
        metadata = { endpoint, timestamp: Date.now(), accepted: false }
        correlate(metadata, 'requestHash', args.requestId ?? envelope.rpcId)
        correlate(metadata, 'sessionHash', args.sessionId)
        correlate(metadata, 'workspaceHash', args.workspaceId)
        if (endpoint === 'session/prompt') {
          if (typeof args.sessionId === 'string' && prompted.size < 2) prompted.add(args.sessionId)
          append(evidence.prompts, metadata, 2)
        } else if (endpoint === 'workspace/create') {
          correlate(metadata, 'pathHash', args.path)
          append(evidence.workspaces, metadata, 2)
        } else if (endpoint === 'session/create') {
          append(evidence.sessions, metadata, 8)
        } else if (endpoint === 'directoryPicker/list') {
          correlate(metadata, 'pathHash', args.path)
          append(evidence.directoryLists, metadata, 8)
        }
      })
      return metadata
    },
    response(endpoint: string, body: string, metadata?: Row): void {
      observe(() => {
        if (!['session/prompt', 'session/create', 'workspace/create', 'directoryPicker/list', 'session/modelCatalog', 'session/list', 'credentials/describe'].includes(endpoint)) return
        const result = record(record(JSON.parse(body)).result)
        const value = record(result.value)
        if (metadata) {
          metadata.accepted = result.ok === true && (endpoint !== 'session/prompt' || value.accepted === true)
          if (result.ok === false) {
            metadata.failure = classifyFailure(result.error, true)
            metadata.errorCode = safeName(record(result.error).code)
            if (metadata.errorCode === 'agent-preset-invalid') {
              const details = record(record(result.error).details)
              const reason = typeof details.reason === 'string' ? details.reason.slice(0, 4096) : ''
              metadata.presetId = safeName(details.agentPreset)
              metadata.presetReasonSummary = /api.?key|authorization|bearer|credential|secret|sk-[a-z0-9]/i.test(reason)
                ? 'CREDENTIAL_RELATED_DETAILS_REDACTED'
                : reason.replace(/(?:file:\/\/\/|[A-Za-z]:[\\/])[^\r\n)]*/g, '[path]')
                  .replace(/https?:\/\/\S+/g, '[url]').replace(/\b[a-zA-Z0-9_-]{48,}\b/g, '[opaque-value]').slice(0, 640)
              const waiting = [...reason.matchAll(/([a-zA-Z0-9_-]+) \((@deepseek-ai\/[a-zA-Z0-9_./-]+|cordis:[a-z-]+)\): waiting for ([a-zA-Z0-9_, ]+)/g)].slice(0, 16)
              metadata.presetWaitingRows = waiting.map(match => ({ row: match[1], package: match[2], services: match[3]!.split(',').map(name => name.trim()).filter(name => safeName(name)).slice(0, 16) }))
              metadata.presetFailureKind = waiting.length ? 'MISSING_HOST_SERVICES'
                : /composition file is unreadable/.test(reason) ? 'COMPOSITION_UNREADABLE'
                : /Cannot find (package|module)|module not found/i.test(reason) ? 'MODULE_NOT_FOUND'
                : /loader entries failed to apply/.test(reason) ? 'ROW_ACTIVATION_ERROR' : 'UNCLASSIFIED_PRESET_MOUNT_FAILURE'
            }
          }
        }
        if (result.ok !== true) return
        if (endpoint === 'workspace/create') {
          if (metadata) correlate(metadata, 'workspaceHash', record(value.workspace).workspaceId)
        } else if (endpoint === 'session/create') {
          if (metadata) correlate(metadata, 'sessionHash', value.sessionId)
        } else if (endpoint === 'session/list') {
          // Only children of the controlled prompted Sessions count. Never
          // retain unrelated catalog rows, paths, titles or historical children.
          if (Array.isArray(value.items)) for (const item of value.items) {
            const child = record(item)
            if (child.origin === 'subagent') observeChild(child.parentSessionId, child.sessionId)
          }
        } else if (endpoint === 'directoryPicker/list') {
          if (metadata) correlate(metadata, 'listedPathHash', value.path)
        } else if (endpoint === 'session/modelCatalog') {
          const selected = record(value.default)
          evidence.provider.model = safeName(selected.model)
          evidence.provider.provider = safeName(selected.provider)
          evidence.provider.routable = Array.isArray(value.routableProviders) && value.routableProviders.includes(selected.provider)
        }
        // Only reduce redacted credential descriptors that the real Settings UI requested.
        if (endpoint === 'credentials/describe') {
          const infos = Object.values(value).map(record)
          if (infos.length) evidence.provider.credentialReady = infos.some(info => info.configured === true)
        }
      })
    },
    open(streamId: string, endpoint: string, payload: Row): void {
      observe(() => {
        if (endpoint !== 'session/follow') return
        if (streams.size >= 8) { evidence.droppedMetadata++; return }
        const address = record(record(record(payload.args).request).address)
        if (address.kind === 'subagent') { observeChild(address.parentSessionId, address.childSessionId); return }
        if (address.kind !== 'session' || typeof address.sessionId !== 'string') { evidence.observerErrors++; return }
        const metadata: Row = { endpoint, timestamp: Date.now() }
        correlate(metadata, 'sessionHash', address.sessionId)
        append(evidence.followStreams, metadata, 8)
        streams.set(streamId, { sessionId: address.sessionId, active: false, step: false, chunkSeen: false, calls: new Map() })
      })
    },
    item(streamId: string, endpoint: string, input: unknown): void {
      observe(() => {
        const stream = streams.get(streamId)
        if (endpoint !== 'session/follow' || !stream?.sessionId || !prompted.has(stream.sessionId)) return
        const item = record(input)
        // A history snapshot cannot stand in for a new live turn.
        if (item.type !== 'event') return
        const event = record(item.event)
        const type = String(event.type)
        if (typeof event.seq !== 'number' || (stream.lastSeq !== undefined && event.seq !== stream.lastSeq + 1)) evidence.orderViolations++
        if (typeof event.seq === 'number') stream.lastSeq = event.seq
        if (!SEMANTIC.has(type)) return
        evidence.counts[type] = (evidence.counts[type] ?? 0) + 1
        const data = record(event.data)
        const row: Row = { type, orderedSequence: ++sequence, sourceSequence: event.seq, timestamp: event.time }
        correlate(row, 'sessionHash', stream.sessionId)
        if (type === 'turn/start') {
          if (stream.active) evidence.orderViolations++
          stream.active = true; evidence.activeTurns++; evidence.maxActiveTurns = Math.max(evidence.maxActiveTurns, evidence.activeTurns)
        } else if (!stream.active) { evidence.orderViolations++; if (type === 'turn/end') evidence.duplicateTerminals++ }
        if (type === 'step/start') { if (stream.step) evidence.orderViolations++; stream.step = true; stream.chunkSeen = false }
        if (['assistant/chunk', 'assistant/message', 'tool/call', 'tool/result', 'step/end'].includes(type) && !stream.step) evidence.orderViolations++
        if (type === 'step/end') stream.step = false
        if (type === 'turn/end') {
          if (stream.step) evidence.orderViolations++
          if (stream.active) evidence.activeTurns--
          stream.active = false
          const reason = record(data.reason)
          row.completed = reason.kind === 'completed'
          if (reason.kind === 'error') row.failure = classifyFailure(reason.error, true)
        }
        if (type === 'tool/call') {
          row.toolName = safeName(data.name)
          correlate(row, 'callHash', data.callId)
          if (stream.calls.size < 32) stream.calls.set(String(data.callId), safeName(data.name)); else evidence.droppedMetadata++
        }
        if (type === 'tool/result') {
          const message = record(data.message)
          const block = record(Array.isArray(message.content) ? message.content[0] : undefined)
          row.toolName = stream.calls.get(String(block.toolCallId))
          row.isError = block.isError === true
          row.resultShapeValid = block.type === 'tool-result' && typeof block.isError === 'boolean'
          correlate(row, 'callHash', block.toolCallId)
          if (!stream.calls.delete(String(block.toolCallId))) evidence.orderViolations++
          row.markerMatch = matches(block.content)
          if (row.markerMatch) row.markerSha256 = markerHash
        }
        if (type === 'assistant/message') {
          row.markerMatch = matches(record(data.message).content)
          if (row.markerMatch) row.markerSha256 = markerHash
        }
        // Chunks are counted continuously; only the first chunk per step needs a row.
        if (type !== 'assistant/chunk' || !stream.chunkSeen) {
          row.step = data.step; row.turn = data.turn; append(evidence.events, row)
        }
        if (type === 'assistant/chunk') stream.chunkSeen = true
      })
    },
    close(streamId: string): void { streams.delete(streamId) },
  }
}
