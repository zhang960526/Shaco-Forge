// NOT_PRODUCTION — pure finalization reducer; it does not write or invent runtime facts.
import { assertLabel, assertPlainRecord, immutableCopy } from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";

const TERMINAL_RESOURCE_STATES = new Set(["OS_EXIT_OBSERVED", "RELEASED", "NOT_CREATED"]);

export function reduceFinalization({
  identity,
  timestamp,
  events,
  ledger,
  resources,
  gaps,
  driverState,
  launchStage,
  firstFailure,
}) {
  assertPlainRecord(identity, ["recordId", "caseId", "invocationId"], [], "FINALIZATION_IDENTITY");
  for (const value of Object.values(identity)) assertLabel(value, "FINALIZATION_IDENTITY");
  assertPlainRecord(timestamp, ["utc", "monotonicTick", "clockSourceRef"], [],
    "FINALIZATION_TIMESTAMP");
  if (!Array.isArray(events) || !Array.isArray(resources) || !Array.isArray(gaps)) {
    reject("FINALIZATION_INPUT_MALFORMED", "FINALIZATION");
  }
  if (!["NOT_ATTEMPTED", "STARTING", "STARTED"].includes(launchStage)
    || (driverState === "COMPLETED" && launchStage !== "STARTED")
    || (launchStage === "NOT_ATTEMPTED" && resources.length !== 0)) {
    reject("FINALIZATION_LAUNCH_STAGE_INVALID", "FINALIZATION");
  }
  const eventIds = new Set();
  let expectedGlobalSequence = 1;
  let preservedFailure = firstFailure ?? null;
  for (const event of events) {
    if (event?.recordType !== "SHACO_SPIKE_EVIDENCE_EVENT_V1"
      || event.source?.globalSequence !== expectedGlobalSequence
      || eventIds.has(event.identity?.eventId)) {
      reject("FINALIZATION_EVENT_SEQUENCE_INVALID", "FINALIZATION");
    }
    expectedGlobalSequence += 1;
    eventIds.add(event.identity.eventId);
    if (preservedFailure === null && event.disposition?.firstFailureCode) {
      preservedFailure = event.disposition.firstFailureCode;
    }
  }
  const ledgerKnown = ledger?.status === "CONSUMED_NON_REFUNDABLE"
    && Number.isSafeInteger(ledger?.version) && ledger.version > 0;
  const resourcesKnown = resources.every(resource => TERMINAL_RESOURCE_STATES.has(resource?.terminalState));
  const explicitUnknown = gaps.length > 0
    || events.some(event => event.disposition?.evidenceStatus !== "COMPLETE");
  const evidenceStatus = ledgerKnown && resourcesKnown && !explicitUnknown
    ? "FINALIZED" : "INCOMPLETE";
  const validationVerdict = preservedFailure !== null
    ? "FAIL"
    : evidenceStatus === "FINALIZED" && driverState === "COMPLETED" ? "PASS" : "INCONCLUSIVE";
  const subjectOutcome = preservedFailure !== null
    ? ({ NOT_ATTEMPTED: "BLOCKED", STARTING: "STARTUP_FAILED", STARTED: "RUNTIME_FAILED" })[launchStage]
    : driverState === "COMPLETED" ? "COMPLETED" : "OUTCOME_UNKNOWN";

  return immutableCopy({
    schemaVersion: 1,
    recordType: "SHACO_SPIKE_FINALIZATION_V1",
    identity,
    timestamp,
    artifactIndex: events.map(event => ({
      eventId: event.identity.eventId,
      globalSequence: event.source.globalSequence,
      category: event.category,
    })),
    gaps,
    resources,
    reconciliation: {
      ledger,
      launchStage,
      eventCount: events.length,
      firstFailure: preservedFailure,
    },
    comparison: { subjectOutcome, validationVerdict, evidenceStatus },
    evidenceStatus,
  });
}
