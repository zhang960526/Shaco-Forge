// NOT_PRODUCTION — strict protocol model; shape/session claims are not OS identity.
import {
  assertContentRef, assertLabel, assertPlainRecord, assertPositiveInteger, immutableCopy,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";
import { isSum3Input } from "../stub/sum3.mjs";

export const PROTOCOL = "SHACO_SPIKE_IPC_V1";
export const MAX_FRAME_BYTES = 4096;
export const ROLES = Object.freeze({
  desktop: "DESKTOP_MAIN",
  worker: "WORKER",
  driver: "DRIVER",
  broker: "WINDOWS_BROKER",
});
export const MESSAGE_TYPES = Object.freeze([
  "HELLO", "CHALLENGE", "PROOF", "SESSION_READY", "WORKER_READY", "REQUEST",
  "TASK_ACCEPTED", "RELEASE", "RESULT", "ERROR", "REJECT", "STOP", "STOP_ACK",
]);

const HEX_256 = /^[a-f0-9]{64}$/;
// Keep the schema's $defs.error.properties.code.enum identical to this closed list.
export const ERROR_CODES = Object.freeze([
  "EXECUTION_NOT_AUTHORIZED", "AUTHORITY_BLOCKED", "SCOPE_APPROVAL_BLOCKED",
  "SNAPSHOT_BINDING_BLOCKED", "INPUT_IDENTITY_BLOCKED", "RUNTIME_DEFINITION_BLOCKED",
  "ENVIRONMENT_POLICY_BLOCKED", "SINGLE_USE_SLOT_BLOCKED", "EVIDENCE_UNAVAILABLE",
  "WINDOWS_HELPER_UNAVAILABLE", "OS_PEER_IDENTITY_NOT_VERIFIED", "AUTHENTICATION_BLOCKED",
  "MESSAGE_REJECTED", "REQUEST_MISMATCH", "DUPLICATE_REQUEST", "DUPLICATE_RELEASE",
  "DUPLICATE_RESULT", "UNEXPECTED_STATE", "FRAME_LIMIT", "STALE_SESSION",
  "WRONG_ROUTE", "INTERNAL_REJECTION",
]);

const ROUTES = Object.freeze({
  HELLO: ["DESKTOP_MAIN>WINDOWS_BROKER", "WORKER>WINDOWS_BROKER", "DRIVER>WINDOWS_BROKER"],
  CHALLENGE: ["WINDOWS_BROKER>DESKTOP_MAIN", "WINDOWS_BROKER>WORKER", "WINDOWS_BROKER>DRIVER"],
  PROOF: ["DESKTOP_MAIN>WINDOWS_BROKER", "WORKER>WINDOWS_BROKER", "DRIVER>WINDOWS_BROKER"],
  SESSION_READY: ["WINDOWS_BROKER>DESKTOP_MAIN", "WINDOWS_BROKER>WORKER", "WINDOWS_BROKER>DRIVER"],
  WORKER_READY: ["WORKER>DRIVER"],
  REQUEST: ["DESKTOP_MAIN>WORKER"],
  TASK_ACCEPTED: ["WORKER>DESKTOP_MAIN", "WORKER>DRIVER"],
  RELEASE: ["DRIVER>WORKER"],
  RESULT: ["WORKER>DESKTOP_MAIN", "WORKER>DRIVER"],
  ERROR: [
    "DESKTOP_MAIN>DRIVER", "WORKER>DESKTOP_MAIN", "WORKER>DRIVER",
    "DRIVER>DESKTOP_MAIN", "DRIVER>WORKER", "WINDOWS_BROKER>DESKTOP_MAIN",
    "WINDOWS_BROKER>WORKER", "WINDOWS_BROKER>DRIVER",
  ],
  REJECT: [
    "DESKTOP_MAIN>DRIVER", "WORKER>DESKTOP_MAIN", "WORKER>DRIVER",
    "DRIVER>DESKTOP_MAIN", "DRIVER>WORKER", "WINDOWS_BROKER>DESKTOP_MAIN",
    "WINDOWS_BROKER>WORKER", "WINDOWS_BROKER>DRIVER",
  ],
  STOP: ["DRIVER>WORKER"],
  STOP_ACK: ["WORKER>DRIVER"],
});

function assertRole(role, operation) {
  if (!Object.values(ROLES).includes(role)) reject("MESSAGE_REJECTED", operation);
}

function assertHex256(value, operation) {
  if (typeof value !== "string" || !HEX_256.test(value)) reject("MESSAGE_REJECTED", operation);
}

function validatePayload(type, payload) {
  switch (type) {
    case "HELLO":
      assertPlainRecord(payload, ["role", "componentRef", "credentialId"], [], "HELLO_PAYLOAD");
      assertRole(payload.role, "HELLO_ROLE");
      assertContentRef(payload.componentRef, "HELLO_COMPONENT_REF");
      assertLabel(payload.credentialId, "HELLO_CREDENTIAL_ID");
      break;
    case "CHALLENGE":
      assertPlainRecord(payload, ["credentialId", "nonceId", "challenge"], [], "CHALLENGE_PAYLOAD");
      assertLabel(payload.credentialId, "CHALLENGE_CREDENTIAL_ID");
      assertLabel(payload.nonceId, "CHALLENGE_NONCE_ID");
      assertHex256(payload.challenge, "CHALLENGE_BYTES");
      break;
    case "PROOF":
      assertPlainRecord(payload, ["credentialId", "nonceId", "proof"], [], "PROOF_PAYLOAD");
      assertLabel(payload.credentialId, "PROOF_CREDENTIAL_ID");
      assertLabel(payload.nonceId, "PROOF_NONCE_ID");
      assertHex256(payload.proof, "PROOF_BYTES");
      break;
    case "SESSION_READY":
      assertPlainRecord(payload, ["peerAttestationRef"], [], "SESSION_READY_PAYLOAD");
      assertContentRef(payload.peerAttestationRef, "SESSION_READY_ATTESTATION");
      break;
    case "WORKER_READY":
      assertPlainRecord(payload, ["state"], [], "WORKER_READY_PAYLOAD");
      if (payload.state !== "READY") reject("MESSAGE_REJECTED", "WORKER_READY_STATE");
      break;
    case "REQUEST":
      assertPlainRecord(payload, ["operation", "values", "taskInputRef"], [], "REQUEST_PAYLOAD");
      if (payload.operation !== "SUM3" || !isSum3Input(payload.values)) {
        reject("MESSAGE_REJECTED", "TASK_INPUT");
      }
      assertContentRef(payload.taskInputRef, "TASK_INPUT_REF");
      break;
    case "TASK_ACCEPTED":
      assertPlainRecord(payload, [
        "operation", "state", "acceptanceEvidenceRef",
      ], [], "TASK_ACCEPTED_PAYLOAD");
      if (payload.operation !== "SUM3" || payload.state !== "AWAITING_RELEASE") {
        reject("MESSAGE_REJECTED", "TASK_ACCEPTED_STATE");
      }
      assertContentRef(payload.acceptanceEvidenceRef, "TASK_ACCEPTANCE_REF");
      break;
    case "RELEASE":
      assertPlainRecord(payload, [
        "operation", "executionIntentRef",
      ], [], "RELEASE_PAYLOAD");
      if (payload.operation !== "SUM3") reject("MESSAGE_REJECTED", "RELEASE_OPERATION");
      assertContentRef(payload.executionIntentRef, "EXECUTION_INTENT_REF");
      break;
    case "RESULT":
      assertPlainRecord(payload, ["operation", "count", "sum"], [], "RESULT_PAYLOAD");
      if (payload.operation !== "SUM3" || payload.count !== 3 || !Number.isSafeInteger(payload.sum)) {
        reject("MESSAGE_REJECTED", "TASK_RESULT");
      }
      break;
    case "ERROR":
    case "REJECT":
      assertPlainRecord(payload, ["code"], [], type + "_PAYLOAD");
      if (!ERROR_CODES.includes(payload.code)) reject("MESSAGE_REJECTED", "ERROR_CODE");
      break;
    case "STOP":
      assertPlainRecord(payload, ["reason"], [], "STOP_PAYLOAD");
      if (!["COMPLETED", "CONTROLLED_STOP", "FAILURE"].includes(payload.reason)) {
        reject("MESSAGE_REJECTED", "STOP_REASON");
      }
      break;
    case "STOP_ACK":
      assertPlainRecord(payload, ["state", "osExitObserved"], [], "STOP_ACK_PAYLOAD");
      if (payload.state !== "STOP_REQUESTED" || payload.osExitObserved !== false) {
        reject("MESSAGE_REJECTED", "STOP_ACK_STATE");
      }
      break;
    default:
      reject("MESSAGE_REJECTED", "MESSAGE_TYPE");
  }
}

export function validateMessage(message) {
  assertPlainRecord(message, [
    "protocol", "type", "source", "target", "session", "correlationId", "sequence", "payload",
  ], [], "IPC_MESSAGE");
  assertPlainRecord(message.source, ["role", "componentRef"], [], "IPC_SOURCE");
  assertPlainRecord(message.session, ["sessionId", "generation"], [], "IPC_SESSION");
  if (message.protocol !== PROTOCOL || !MESSAGE_TYPES.includes(message.type)) {
    reject("MESSAGE_REJECTED", "PROTOCOL_OR_TYPE");
  }
  assertRole(message.source.role, "SOURCE_ROLE");
  assertRole(message.target, "TARGET_ROLE");
  assertContentRef(message.source.componentRef, "SOURCE_COMPONENT_REF");
  assertLabel(message.session.sessionId, "SESSION_ID");
  assertPositiveInteger(message.session.generation, "SESSION_GENERATION");
  assertLabel(message.correlationId, "CORRELATION_ID");
  assertPositiveInteger(message.sequence, "MESSAGE_SEQUENCE");
  const route = message.source.role + ">" + message.target;
  if (!ROUTES[message.type].includes(route)) reject("WRONG_ROUTE", message.type);
  validatePayload(message.type, message.payload);
  if (message.type === "HELLO"
    && (message.payload.role !== message.source.role
      || message.payload.componentRef !== message.source.componentRef)) {
    reject("MESSAGE_REJECTED", "HELLO_SOURCE_MISMATCH");
  }
  const copy = immutableCopy(message);
  if (new TextEncoder().encode(JSON.stringify(copy) + "\n").byteLength > MAX_FRAME_BYTES) {
    reject("FRAME_LIMIT", "IPC_MESSAGE");
  }
  return copy;
}

export function encodeMessageFrame(message) {
  return new TextEncoder().encode(JSON.stringify(validateMessage(message)) + "\n");
}

export function createMessage({ type, source, target, session, correlationId, sequence, payload }) {
  return validateMessage({
    protocol: PROTOCOL,
    type,
    source,
    target,
    session,
    correlationId,
    sequence,
    payload,
  });
}
