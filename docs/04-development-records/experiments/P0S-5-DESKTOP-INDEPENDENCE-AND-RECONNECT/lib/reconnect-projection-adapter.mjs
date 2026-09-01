/**
 * NOT_PRODUCTION: Desktop-equivalent invalidation, repull, and Host rebuild.
 * Every action is causally linked to a real transport, identity, generation,
 * authentication, or `$events.ready` record supplied by Electron Main.
 */
export class ReconnectProjectionAdapter {
  constructor({ lifecycle, desktopIdentity }) {
    this.lifecycle = lifecycle
    this.desktopIdentity = desktopIdentity
    this.state = 'EMPTY'
    this.workerIdentity = null
    this.generation = null
    this.harnessClientId = null
    this.projection = null
  }

  context(overrides = {}) {
    return {
      workerIdentity: overrides.workerIdentity ?? this.workerIdentity,
      desktopIdentity: this.desktopIdentity,
      oldGeneration: overrides.oldGeneration ?? this.generation,
      newGeneration: overrides.newGeneration ?? this.generation,
      oldHarnessClientId: overrides.oldHarnessClientId ?? this.harnessClientId,
      newHarnessClientId: overrides.newHarnessClientId ?? this.harnessClientId,
    }
  }

  invalidate(sourceEvent, overrides = {}) {
    const allowed = new Set([
      'transport_loss',
      'worker_identity_lost',
      'worker_identity_replaced',
      'authenticated_generation_replacement',
    ])
    if (!sourceEvent?.recordId || !allowed.has(sourceEvent.type)) {
      throw new Error('Projection invalidation requires an allowed real source event')
    }
    const previous = this.state
    this.state = 'INVALIDATED'
    this.projection = null
    return this.lifecycle.record('projection_invalidated', {
      causedByRecordId: sourceEvent.recordId,
      causedBySourceSequence: sourceEvent.sourceSequence,
      sourceEventType: sourceEvent.type,
      previousProjectionState: previous,
      resultingProjectionState: this.state,
      adapterClassification: 'NOT_PRODUCTION',
      ...this.context(overrides),
    })
  }

  replaceWorker(sourceEvent, workerIdentity) {
    if (sourceEvent?.type !== 'worker_identity_replaced') {
      throw new Error('Worker replacement requires a real identity replacement event')
    }
    this.workerIdentity = workerIdentity
  }

  replaceGeneration(sourceEvent, { generation, harnessClientId, workerIdentity }) {
    if (sourceEvent?.type !== 'harness_events_ready') {
      throw new Error('Generation replacement requires a real $events.ready source')
    }
    const oldGeneration = this.generation
    const oldHarnessClientId = this.harnessClientId
    this.workerIdentity = workerIdentity
    this.generation = generation
    this.harnessClientId = harnessClientId
    return this.lifecycle.record('authenticated_generation_replacement', {
      causedByRecordId: sourceEvent.recordId,
      causedBySourceSequence: sourceEvent.sourceSequence,
      sourceEventType: sourceEvent.type,
      workerIdentity,
      desktopIdentity: this.desktopIdentity,
      oldGeneration,
      newGeneration: generation,
      oldHarnessClientId,
      newHarnessClientId: harnessClientId,
      resultingProjectionState: this.state,
    })
  }

  requestRepull(sourceEvent) {
    if (sourceEvent?.type !== 'harness_events_ready') {
      throw new Error('Projection repull requires a real $events.ready source')
    }
    const previous = this.state
    this.state = 'REPULLING'
    return this.lifecycle.record('projection_repull_requested', {
      causedByRecordId: sourceEvent.recordId,
      causedBySourceSequence: sourceEvent.sourceSequence,
      sourceEventType: sourceEvent.type,
      previousProjectionState: previous,
      resultingProjectionState: this.state,
      adapterClassification: 'NOT_PRODUCTION',
      ...this.context(),
    })
  }

  rebuild(sourceEvent, hostTruth) {
    if (sourceEvent?.type !== 'host_truth_received') {
      throw new Error('Host truth rebuild requires a real Host truth response')
    }
    this.projection = hostTruth
    this.state = 'CURRENT'
    return this.lifecycle.record('host_truth_rebuilt', {
      causedByRecordId: sourceEvent.recordId,
      causedBySourceSequence: sourceEvent.sourceSequence,
      sourceEventType: sourceEvent.type,
      resultingProjectionState: this.state,
      adapterClassification: 'NOT_PRODUCTION',
      ...this.context(),
      hostTruth,
    })
  }

  snapshot() {
    return {
      state: this.state,
      workerIdentity: this.workerIdentity,
      generation: this.generation,
      harnessClientId: this.harnessClientId,
      projection: this.projection,
    }
  }
}
