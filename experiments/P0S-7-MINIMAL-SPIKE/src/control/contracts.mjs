// NOT_PRODUCTION — shared structural checks; these checks do not grant authority.
import { reject } from "./phase-a-policy.mjs";

const LABEL = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const CONTENT_REF = /^sha256:[a-f0-9]{64}$/;
const SID = /^S-1-(?:\d+-){1,14}\d+$/;

export function assertPlainRecord(value, requiredKeys, optionalKeys = [], operation = "RECORD") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    reject("MALFORMED_INPUT", operation);
  }
  const prototype = Object.getPrototypeOf(value);
  const allowed = new Set([...requiredKeys, ...optionalKeys]);
  const keys = Reflect.ownKeys(value);
  if ((prototype !== Object.prototype && prototype !== null)
    || keys.some(key => typeof key !== "string" || !allowed.has(key))
    || requiredKeys.some(key => !keys.includes(key))) {
    reject("UNKNOWN_OR_MISSING_FIELD", operation);
  }
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")) {
      reject("ACCESSOR_OR_HIDDEN_FIELD_REJECTED", operation);
    }
  }
  return value;
}

export function assertLabel(value, operation = "LABEL") {
  if (typeof value !== "string" || !LABEL.test(value)) reject("INVALID_LABEL", operation);
  return value;
}

export function assertContentRef(value, operation = "CONTENT_REF") {
  if (typeof value !== "string" || !CONTENT_REF.test(value)) {
    reject("INVALID_CONTENT_REF", operation);
  }
  return value;
}

export function assertWindowsSid(value, operation = "WINDOWS_SID") {
  if (typeof value !== "string" || !SID.test(value)) reject("INVALID_WINDOWS_SID", operation);
  return value;
}

export function assertPositiveInteger(value, operation = "POSITIVE_INTEGER") {
  if (!Number.isSafeInteger(value) || value < 1) reject("INVALID_INTEGER", operation);
  return value;
}

export function assertKnownDecision(result, operation) {
  assertPlainRecord(result, ["status", "subjectRef", "proofRef", "checkerRef"], [], operation);
  if (result.status !== "ALLOW") reject("GATE_NOT_ALLOWED", operation, [result.status]);
  assertContentRef(result.subjectRef, operation);
  assertContentRef(result.proofRef, operation);
  assertContentRef(result.checkerRef, operation);
  return Object.freeze({ ...result });
}

export function assertCapability(value, name, methods) {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) {
    reject("REQUIRED_CAPABILITY_MISSING", name, [name]);
  }
  for (const method of methods) {
    if (typeof value[method] !== "function") {
      reject("REQUIRED_CAPABILITY_MISSING", name, [name + "." + method]);
    }
  }
  return value;
}

export function parseTrustedUtc(value, operation) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
    reject("INVALID_TRUSTED_TIME", operation);
  }
  const epoch = Date.parse(value);
  if (!Number.isFinite(epoch)) reject("INVALID_TRUSTED_TIME", operation);
  return epoch;
}

export function assertValidityWindow({ notBeforeUtc, expiresAtUtc }, observedAtUtc, operation) {
  const observed = parseTrustedUtc(observedAtUtc, operation);
  const notBefore = parseTrustedUtc(notBeforeUtc, operation);
  const expires = parseTrustedUtc(expiresAtUtc, operation);
  if (notBefore >= expires || observed < notBefore || observed >= expires) {
    reject("TRUST_INPUT_EXPIRED_OR_NOT_YET_VALID", operation);
  }
}

export function immutableCopy(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(immutableCopy));
  if (value && typeof value === "object") {
    const copy = {};
    for (const key of Object.keys(value)) copy[key] = immutableCopy(value[key]);
    return Object.freeze(copy);
  }
  return value;
}
