/** NOT_PRODUCTION: lock-before-discovery guard and side-effect counters. */

export class SingleInstanceAdapter {
  constructor(lifecycle) {
    this.lifecycle = lifecycle
    this.lockDecided = false
    this.lockAcquired = false
  }

  decide(acquired) {
    if (this.lockDecided) throw new Error('Single-instance lock was decided twice')
    this.lockDecided = true
    this.lockAcquired = acquired
    this.lifecycle.record(acquired ? 'single_instance_lock_acquired' : 'single_instance_lock_denied')
  }

  requireOwnership(operation) {
    if (!this.lockDecided || !this.lockAcquired) {
      throw new Error(`${operation} attempted before single-instance ownership`)
    }
  }

  count(operation, counter) {
    this.requireOwnership(operation)
    this.lifecycle.increment(counter)
  }
}
