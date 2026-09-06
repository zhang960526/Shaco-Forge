// NOT_PRODUCTION — template factory only; no event IDs, timestamps, I/O or results.
export const EVIDENCE_CATEGORIES = Object.freeze([
  "startup", "runtime", "failure", "recovery",
]);

export function createEvidenceTemplate(category) {
  if (!EVIDENCE_CATEGORIES.includes(category)) {
    throw new TypeError("UNKNOWN_EVIDENCE_CATEGORY");
  }
  return {
    schemaVersion: 1,
    recordType: "SHACO_SPIKE_EVIDENCE_TEMPLATE",
    artifactStatus: "TEMPLATE_ONLY",
    executionStatus: "NOT_EXECUTED",
    category,
    identity: { eventId: null, caseId: null, requestId: null, invocationId: null },
    source: { producerRole: null, producerRef: null, collectorRef: null, sourceSequence: null },
    timestamp: { utc: null, monotonicTick: null, clockSource: null },
    lifecycle: { stateBefore: null, stateAfter: null, boundaryReached: null },
    runtimeIdentity: { instanceId: null, generation: null, pid: null, processStartTime: null },
    comparison: { expected: null, observed: null, subjectOutcome: null, validationVerdict: null },
    references: { sourceRef: null, runtimeRef: null, inputRef: null, approvalRef: null },
    failure: { code: null, firstFailureBoundary: null },
    recovery: { parentFailureRef: null, authorizationRef: null, disposition: null },
  };
}

