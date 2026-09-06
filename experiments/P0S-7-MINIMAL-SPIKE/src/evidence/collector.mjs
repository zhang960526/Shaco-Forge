// NOT_PRODUCTION — collector composition; requires explicit fact source and sinks.
import { assertCapability, assertLabel, assertPlainRecord } from "../control/contracts.mjs";
import { SpikeRejection, reject } from "../control/phase-a-policy.mjs";
import { createEvidenceEnvelope } from "./envelope.mjs";
import { reduceFinalization } from "./finalization.mjs";

const CATEGORY_BY_KIND = Object.freeze({
  LAUNCH_INTENT: "startup",
  WORKER_READY: "startup",
  DESKTOP_STARTED: "startup",
  GATE_DECISION: "startup",
  EXECUTION_INTENT: "runtime",
  TASK_ACCEPTED: "runtime",
  EXECUTION_INTENT_CONFIRMED: "runtime",
  WORKER_RESULT: "runtime",
  RESULT: "runtime",
  DESKTOP_CLOSED_WORKER_STABLE: "runtime",
  WORKER_OS_EXIT: "runtime",
  STOP_INTENT: "runtime",
  FAILURE: "failure",
  RECOVERY_DISPOSITION: "recovery",
  FINALIZATION: "runtime",
});

export function createEvidenceCollector({ writer, factSource } = {}) {
  assertCapability(writer, "APPEND_ONLY_EVIDENCE_WRITER", ["assertReady", "appendAndFlush", "status"]);
  assertCapability(factSource, "INDEPENDENT_RUNTIME_FACT_SOURCE", [
    "nextEventContext", "nextFinalizationContext",
  ]);
  const events = [];
  const sourceSequences = new Map();
  const eventIds = new Set();
  let globalSequence = 0;
  let firstFailureCode = null;

  function validateContext(context) {
    assertPlainRecord(context, [
      "identity", "source", "timestamp", "runtimeIdentity", "references",
    ], [], "EVIDENCE_FACT_CONTEXT");
    if (eventIds.has(context.identity?.eventId)) {
      reject("DUPLICATE_EVIDENCE_EVENT", "EVIDENCE_COLLECTOR");
    }
    const producer = context.source?.producerRef;
    const expected = (sourceSequences.get(producer) ?? 0) + 1;
    if (context.source?.sourceSequence !== expected) {
      reject("EVIDENCE_SOURCE_SEQUENCE_INVALID", "EVIDENCE_COLLECTOR");
    }
    return context;
  }

  async function record(kind, state, facts, failureCode = null) {
    const category = CATEGORY_BY_KIND[kind];
    if (!category) reject("UNKNOWN_EVIDENCE_KIND", "EVIDENCE_COLLECTOR");
    const context = validateContext(await factSource.nextEventContext({ kind, state, facts }));
    globalSequence += 1;
    if (firstFailureCode === null && failureCode !== null) firstFailureCode = failureCode;
    const common = {
      category,
      identity: context.identity,
      source: { ...context.source, globalSequence },
      timestamp: context.timestamp,
      lifecycle: {
        stateBefore: state,
        stateAfter: state,
        boundaryReached: kind,
      },
      runtimeIdentity: context.runtimeIdentity,
      references: context.references,
      disposition: {
        subjectOutcome: "OUTCOME_PENDING",
        validationVerdict: "INCONCLUSIVE",
        evidenceStatus: "COMPLETE",
        firstFailureCode,
      },
      details: { kind, facts },
    };
    const primaryRecord = createEvidenceEnvelope(common);
    const fallbackRecord = createEvidenceEnvelope({
      ...common,
      category: "failure",
      disposition: {
        ...common.disposition,
        subjectOutcome: "OUTCOME_UNKNOWN",
        validationVerdict: "INCONCLUSIVE",
        evidenceStatus: "INCOMPLETE",
        firstFailureCode: firstFailureCode ?? "PRIMARY_EVIDENCE_WRITE_FAILURE",
      },
      details: { kind: "PRIMARY_EVIDENCE_WRITE_FAILURE", originalKind: kind },
    });
    const persisted = await writer.appendAndFlush({ primaryRecord, fallbackRecord });
    if (persisted.status !== "DURABLE") reject("EVIDENCE_NOT_DURABLE", kind);
    eventIds.add(context.identity.eventId);
    sourceSequences.set(context.source.producerRef, context.source.sourceSequence);
    events.push(persisted.disposition === "FALLBACK_ONLY_NO_BUSINESS_CONTINUATION"
      ? fallbackRecord.envelope : primaryRecord.envelope);
    if (persisted.disposition === "FALLBACK_ONLY_NO_BUSINESS_CONTINUATION") {
      if (firstFailureCode === null) firstFailureCode = "PRIMARY_EVIDENCE_WRITE_FAILURE";
      reject("PRIMARY_EVIDENCE_WRITE_FAILURE", kind);
    }
    return persisted;
  }

  return Object.freeze({
    assertReady(policy) {
      return writer.assertReady(policy);
    },

    recordGateDecisionAndFlush({ gateId, caseId, decision }) {
      assertLabel(gateId, "GATE_ID");
      assertLabel(caseId, "CASE_ID");
      return record("GATE_DECISION", gateId, { caseId, decision });
    },

    recordAndFlush({ kind, state, facts }) {
      return record(kind, state, facts);
    },

    recordFailureAndFlush({ error, state, caseId, correlationId }) {
      assertLabel(caseId, "CASE_ID");
      assertLabel(correlationId, "CORRELATION_ID");
      const code = error instanceof SpikeRejection ? error.code : "INTERNAL_REJECTION";
      if (firstFailureCode !== null && firstFailureCode !== code) {
        return record("FAILURE", state, {
          caseId, correlationId, code, preservedFirstFailureCode: firstFailureCode,
        }, firstFailureCode);
      }
      return record("FAILURE", state, { caseId, correlationId, code }, code);
    },

    async finalize(input) {
      const finalContext = await factSource.nextFinalizationContext(input);
      // Preserve the Driver failure even when recording its evidence failed before collection.
      const suppliedFailureCode = input.firstFailure instanceof SpikeRejection
        ? input.firstFailure.code : input.firstFailure != null ? "INTERNAL_REJECTION" : null;
      const finalization = reduceFinalization({
        ...input,
        ...finalContext,
        events: Object.freeze([...events]),
        firstFailure: firstFailureCode ?? suppliedFailureCode,
      });
      const encoded = new TextEncoder().encode(JSON.stringify(finalization) + "\n");
      const fallbackFinalization = {
        ...finalization,
        evidenceStatus: "INCOMPLETE",
        comparison: { ...finalization.comparison, evidenceStatus: "INCOMPLETE" },
      };
      const fallback = new TextEncoder().encode(JSON.stringify(fallbackFinalization) + "\n");
      const result = await writer.appendAndFlush({
        primaryRecord: { bytes: encoded },
        fallbackRecord: { bytes: fallback },
      });
      if (result.status !== "DURABLE") reject("FINALIZATION_NOT_DURABLE", "FINALIZATION");
      return result.disposition === "FALLBACK_ONLY_NO_BUSINESS_CONTINUATION"
        ? Object.freeze(fallbackFinalization) : finalization;
    },

    inspect() {
      return Object.freeze({
        eventCount: events.length,
        firstFailureCode,
        writer: writer.status(),
      });
    },
  });
}
