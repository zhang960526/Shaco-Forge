/** NOT_PRODUCTION: process-local lifecycle/event recorder. */
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export class DesktopLifecycleAdapter {
  constructor({ eventFile, desktopIdentity, scenarioId }) {
    this.eventFile = eventFile
    this.desktopIdentity = desktopIdentity
    this.scenarioId = scenarioId
    this.sequence = 0
    this.state = 'STARTING'
    this.counters = {
      workerDiscoveryCount: 0,
      credentialAccessCount: 0,
      pipeAttachCount: 0,
      workerSpawnCount: 0,
      gatewayDispatchCount: 0,
      promptRequestCount: 0,
      agentStartRequestCount: 0,
      agentResumeRequestCount: 0,
      automaticResultSendCount: 0,
      oldDraftImportCount: 0,
      explicitRendererActionCount: 0,
    }
    mkdirSync(dirname(eventFile), { recursive: true })
  }

  record(type, details = {}) {
    const record = {
      recordId: randomUUID(),
      source: 'desktop-main',
      sourceSequence: ++this.sequence,
      monotonicTicks: process.hrtime.bigint().toString(),
      utc: new Date().toISOString(),
      scenarioId: this.scenarioId,
      desktopIdentity: this.desktopIdentity,
      type,
      ...details,
    }
    appendFileSync(this.eventFile, `${JSON.stringify(record)}\n`, 'utf8')
    return record
  }

  transition(next, cause = null) {
    const previous = this.state
    this.state = next
    return this.record('desktop_state_transition', { previous, next, cause })
  }

  increment(name, amount = 1) {
    if (!(name in this.counters)) throw new Error(`Unknown Desktop counter: ${name}`)
    this.counters[name] += amount
    this.record('desktop_counter', { counter: name, value: this.counters[name] })
  }

  snapshot() {
    return { state: this.state, counters: { ...this.counters } }
  }
}
