// NOT_PRODUCTION — bounded evidence envelope; no clock, PID, file, or verdict is generated here.
import {
  assertContentRef, assertLabel, assertPlainRecord, immutableCopy,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";

export const MAX_EVIDENCE_EVENT_BYTES = 64 * 1024;
export const EVIDENCE_CATEGORIES = Object.freeze([
  "startup", "runtime", "failure", "recovery",
]);

const SECRET_KEY = /^(?:credential|credentialId|nonce|secret|privateKey|accessToken|refreshToken|rawEnvironment)$/i;

function sanitize(value, depth = 0) {
  if (depth > 8) reject("EVIDENCE_VALUE_TOO_DEEP", "EVIDENCE_REDACTION");
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.length > 2048) reject("EVIDENCE_STRING_TOO_LARGE", "EVIDENCE_REDACTION");
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 128) reject("EVIDENCE_ARRAY_TOO_LARGE", "EVIDENCE_REDACTION");
    return value.map(item => sanitize(item, depth + 1));
  }
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    const keys = Reflect.ownKeys(value);
    if ((prototype !== Object.prototype && prototype !== null) || keys.length > 128
      || keys.some(key => typeof key !== "string" || key.length > 128)) {
      reject("EVIDENCE_OBJECT_REJECTED", "EVIDENCE_REDACTION");
    }
    const result = {};
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")) {
        reject("EVIDENCE_ACCESSOR_REJECTED", "EVIDENCE_REDACTION");
      }
      result[key] = SECRET_KEY.test(key) ? "[REDACTED]" : sanitize(descriptor.value, depth + 1);
    }
    return result;
  }
  reject("EVIDENCE_VALUE_TYPE_REJECTED", "EVIDENCE_REDACTION");
}

function validateEnvelope(input) {
  assertPlainRecord(input, [
    "category", "identity", "source", "timestamp", "lifecycle", "runtimeIdentity",
    "references", "disposition", "details",
  ], [], "EVIDENCE_ENVELOPE");
  if (!EVIDENCE_CATEGORIES.includes(input.category)) {
    reject("UNKNOWN_EVIDENCE_CATEGORY", "EVIDENCE_ENVELOPE");
  }
  assertPlainRecord(input.identity, [
    "eventId", "caseId", "correlationId", "invocationId",
  ], [], "EVIDENCE_IDENTITY");
  for (const value of Object.values(input.identity)) assertLabel(value, "EVIDENCE_IDENTITY");
  assertPlainRecord(input.source, [
    "producerRole", "producerRef", "collectorRef", "sourceSequence", "globalSequence",
  ], [], "EVIDENCE_SOURCE");
  assertLabel(input.source.producerRole, "EVIDENCE_PRODUCER_ROLE");
  assertContentRef(input.source.producerRef, "EVIDENCE_PRODUCER_REF");
  assertContentRef(input.source.collectorRef, "EVIDENCE_COLLECTOR_REF");
  for (const key of ["sourceSequence", "globalSequence"]) {
    if (!Number.isSafeInteger(input.source[key]) || input.source[key] < 1) {
      reject("INVALID_EVIDENCE_SEQUENCE", "EVIDENCE_SOURCE");
    }
  }
  assertPlainRecord(input.timestamp, [
    "utc", "monotonicTick", "clockSourceRef",
  ], [], "EVIDENCE_TIMESTAMP");
  if (typeof input.timestamp.utc !== "string" || input.timestamp.utc.length > 64
    || typeof input.timestamp.monotonicTick !== "string"
    || !/^\d{1,32}$/.test(input.timestamp.monotonicTick)) {
    reject("INVALID_EVIDENCE_TIMESTAMP", "EVIDENCE_TIMESTAMP");
  }
  assertContentRef(input.timestamp.clockSourceRef, "EVIDENCE_CLOCK_SOURCE");
  assertPlainRecord(input.lifecycle, [
    "stateBefore", "stateAfter", "boundaryReached",
  ], [], "EVIDENCE_LIFECYCLE");
  assertPlainRecord(input.references, [
    "sourceRef", "runtimeRef", "inputRef", "approvalRef", "causedBy",
  ], [], "EVIDENCE_REFERENCES");
  for (const key of ["sourceRef", "runtimeRef", "inputRef", "approvalRef"]) {
    assertContentRef(input.references[key], "EVIDENCE_REFERENCES");
  }
  if (input.references.causedBy !== null) assertLabel(input.references.causedBy, "EVIDENCE_CAUSALITY");
  assertPlainRecord(input.disposition, [
    "subjectOutcome", "validationVerdict", "evidenceStatus", "firstFailureCode",
  ], [], "EVIDENCE_DISPOSITION");
  return input;
}

export function createEvidenceEnvelope(rawInput) {
  const input = validateEnvelope(rawInput);
  const envelope = immutableCopy({
    schemaVersion: 1,
    recordType: "SHACO_SPIKE_EVIDENCE_EVENT_V1",
    ...input,
    runtimeIdentity: sanitize(input.runtimeIdentity),
    details: sanitize(input.details),
  });
  const bytes = new TextEncoder().encode(JSON.stringify(envelope) + "\n");
  if (bytes.byteLength > MAX_EVIDENCE_EVENT_BYTES) {
    reject("EVIDENCE_EVENT_SIZE_LIMIT", "EVIDENCE_ENVELOPE");
  }
  return Object.freeze({ envelope, bytes });
}
