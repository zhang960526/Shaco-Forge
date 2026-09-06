// NOT_PRODUCTION — append/flush contracts only; no sink or file is created on import.
import {
  assertCapability, assertContentRef, assertKnownDecision, assertPlainRecord, immutableCopy,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";

export const PRIMARY_CAPACITY_BYTES = 8 * 1024 * 1024;
export const FALLBACK_CAPACITY_BYTES = 1024 * 1024;

function validateProbe(result, expectedCapacity, operation) {
  assertPlainRecord(result, [
    "status", "mode", "usedBytes", "capacityBytes", "sinkRef", "proofRef", "checkerRef",
  ], [], operation);
  if (result.status !== "READY" || result.mode !== "APPEND_ONLY"
    || !Number.isSafeInteger(result.usedBytes) || result.usedBytes < 0
    || result.capacityBytes !== expectedCapacity || result.usedBytes > result.capacityBytes) {
    reject("EVIDENCE_SINK_NOT_READY", operation);
  }
  assertContentRef(result.sinkRef, operation);
  assertContentRef(result.proofRef, operation);
  assertContentRef(result.checkerRef, operation);
  return result;
}

async function appendDurably(sink, bytes, capacity, operation) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 1 || bytes.byteLength > capacity) {
    reject("EVIDENCE_CAPACITY_EXCEEDED", operation);
  }
  const position = await sink.position();
  if (!position || position.status !== "KNOWN" || !Number.isSafeInteger(position.usedBytes)
    || position.usedBytes < 0 || position.usedBytes + bytes.byteLength > capacity) {
    reject("EVIDENCE_CAPACITY_UNKNOWN_OR_EXCEEDED", operation);
  }
  const appended = await sink.append(bytes);
  if (appended?.status !== "APPENDED" || !Number.isSafeInteger(appended.endOffset)
    || appended.endOffset !== position.usedBytes + bytes.byteLength) {
    reject("EVIDENCE_APPEND_OUTCOME_UNKNOWN", operation);
  }
  assertContentRef(appended.recordRef, operation);
  const flushed = await sink.flush(appended.endOffset);
  if (flushed?.status !== "DURABLE" || flushed.recordRef !== appended.recordRef) {
    reject("EVIDENCE_DURABILITY_UNKNOWN", operation);
  }
  return Object.freeze({ status: "DURABLE", eventRef: appended.recordRef });
}

export function createAppendOnlyEvidenceWriter({ primarySink, fallbackSink } = {}) {
  for (const [name, sink] of [["PRIMARY_EVIDENCE_SINK", primarySink], ["FALLBACK_EVIDENCE_SINK", fallbackSink]]) {
    assertCapability(sink, name, ["probe", "position", "append", "flush"]);
  }
  let primaryFailed = false;
  let terminalUnknown = false;

  return Object.freeze({
    async assertReady(policy) {
      assertPlainRecord(policy, [
        "subjectRef", "primarySinkRef", "fallbackSinkRef",
      ], [], "EVIDENCE_READINESS_POLICY");
      for (const key of ["subjectRef", "primarySinkRef", "fallbackSinkRef"]) {
        assertContentRef(policy[key], "EVIDENCE_READINESS_POLICY");
      }
      if (terminalUnknown) reject("EVIDENCE_SINK_STATE_UNKNOWN", "EVIDENCE_READINESS");
      const primary = validateProbe(
        await primarySink.probe(), PRIMARY_CAPACITY_BYTES, "PRIMARY_EVIDENCE_READINESS",
      );
      const fallback = validateProbe(
        await fallbackSink.probe(), FALLBACK_CAPACITY_BYTES, "FALLBACK_EVIDENCE_READINESS",
      );
      if (primary.sinkRef !== policy.primarySinkRef || fallback.sinkRef !== policy.fallbackSinkRef) {
        reject("EVIDENCE_SINK_IDENTITY_MISMATCH", "EVIDENCE_READINESS");
      }
      return assertKnownDecision({
        status: "ALLOW",
        subjectRef: policy.subjectRef,
        proofRef: primary.proofRef,
        checkerRef: primary.checkerRef,
      }, "EVIDENCE_READINESS");
    },

    async appendAndFlush({ primaryRecord, fallbackRecord }) {
      if (terminalUnknown) reject("EVIDENCE_SINK_STATE_UNKNOWN", "EVIDENCE_APPEND");
      if (!primaryRecord?.bytes || !fallbackRecord?.bytes) {
        reject("EVIDENCE_FALLBACK_RECORD_REQUIRED", "EVIDENCE_APPEND");
      }
      if (!primaryFailed) {
        try {
          return await appendDurably(
            primarySink, primaryRecord.bytes, PRIMARY_CAPACITY_BYTES, "PRIMARY_EVIDENCE_APPEND",
          );
        } catch {
          primaryFailed = true;
        }
      }
      try {
        const result = await appendDurably(
          fallbackSink, fallbackRecord.bytes, FALLBACK_CAPACITY_BYTES, "FALLBACK_EVIDENCE_APPEND",
        );
        return immutableCopy({ ...result, disposition: "FALLBACK_ONLY_NO_BUSINESS_CONTINUATION" });
      } catch {
        terminalUnknown = true;
        reject("ALL_EVIDENCE_SINKS_UNAVAILABLE", "EVIDENCE_APPEND");
      }
    },

    status() {
      return Object.freeze({
        primary: primaryFailed ? "FAILED_NO_RETRY" : "UNOBSERVED_OR_READY",
        fallback: terminalUnknown ? "UNKNOWN_OR_FAILED" : "UNOBSERVED_OR_READY",
        businessContinuation: primaryFailed ? "FORBIDDEN" : "SUBJECT_TO_GATES",
      });
    },
  });
}
