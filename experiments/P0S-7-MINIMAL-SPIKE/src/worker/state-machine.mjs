// NOT_PRODUCTION — single-request Worker control; OS exit remains externally observed.
import {
  assertCapability, assertContentRef, assertKnownDecision, assertPlainRecord,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";
import { validateMessage } from "../ipc/protocol.mjs";
import { executeSum3 } from "../stub/sum3.mjs";

export const WORKER_STATES = Object.freeze([
  "STARTING", "IDLE", "AWAITING_RELEASE", "EXECUTING", "RESULT_DURABLE",
  "STOP_REQUESTED", "FAILED",
]);

function assertPeer(peer, expectedRole, operation) {
  assertPlainRecord(peer, [
    "role", "componentRef", "osAttestationRef", "sessionId", "generation",
  ], [], operation);
  if (peer.role !== expectedRole) reject("WRONG_ROUTE", operation);
  assertContentRef(peer.componentRef, operation);
  assertContentRef(peer.osAttestationRef, operation);
  if (typeof peer.sessionId !== "string" || !Number.isSafeInteger(peer.generation)
    || peer.generation < 1) {
    reject("OS_PEER_IDENTITY_NOT_VERIFIED", operation);
  }
  return peer;
}

export function createWorkerStateMachine({ authorization, evidence, intentVerifier } = {}) {
  assertCapability(authorization, "WORKER_ACTION_AUTHORIZATION", ["verify"]);
  assertCapability(evidence, "WORKER_EVIDENCE", ["recordAndFlush"]);
  assertCapability(intentVerifier, "EXECUTION_INTENT_VERIFIER", ["verify"]);
  let state = "STARTING";
  let correlationId = null;
  let pendingValues = null;
  let requestUsed = false;
  let releaseUsed = false;
  let executionConsumed = false;
  let resultDispatchStarted = false;
  let stopUsed = false;

  async function persist(kind, facts) {
    const result = await evidence.recordAndFlush({ kind, state, facts });
    if (result?.status !== "DURABLE" || typeof result.eventRef !== "string") {
      reject("EVIDENCE_NOT_DURABLE", kind);
    }
    return result;
  }

  return Object.freeze({
    inspect() {
      return Object.freeze({
        state,
        correlationId,
        requestUsed,
        releaseUsed,
        executionConsumed,
        resultDispatchStarted,
        stopUsed,
        osExitObserved: false,
      });
    },

    async markReady(launchContext) {
      if (state !== "STARTING") reject("UNEXPECTED_STATE", "WORKER_READY");
      const decision = assertKnownDecision(
        await authorization.verify({ action: "WORKER_READY", launchContext }), "WORKER_READY",
      );
      await persist("WORKER_READY", { decision });
      state = "IDLE";
      return Object.freeze({ state: "READY" });
    },

    async acceptRequest(rawMessage, rawPeer) {
      const peer = assertPeer(rawPeer, "DESKTOP_MAIN", "WORKER_REQUEST_PEER");
      const message = validateMessage(rawMessage);
      if (message.type !== "REQUEST" || message.source.role !== peer.role
        || message.source.componentRef !== peer.componentRef
        || message.session.sessionId !== peer.sessionId
        || message.session.generation !== peer.generation) {
        reject("REQUEST_MISMATCH", "WORKER_REQUEST");
      }
      if (state !== "IDLE" || requestUsed) reject("DUPLICATE_REQUEST", "WORKER_REQUEST");
      assertKnownDecision(await authorization.verify({
        action: "WORKER_ACCEPT_REQUEST", message, peer,
      }), "WORKER_ACCEPT_REQUEST");
      requestUsed = true;
      correlationId = message.correlationId;
      pendingValues = Object.freeze([...message.payload.values]);
      state = "AWAITING_RELEASE";
      const accepted = await persist("TASK_ACCEPTED", {
        correlationId,
        taskInputRef: message.payload.taskInputRef,
      });
      return Object.freeze({
        operation: "SUM3",
        state: "AWAITING_RELEASE",
        acceptanceEvidenceRef: accepted.eventRef,
      });
    },

    async release(rawMessage, rawPeer) {
      const peer = assertPeer(rawPeer, "DRIVER", "WORKER_RELEASE_PEER");
      const message = validateMessage(rawMessage);
      if (message.type !== "RELEASE" || message.source.role !== peer.role
        || message.source.componentRef !== peer.componentRef
        || message.session.sessionId !== peer.sessionId
        || message.session.generation !== peer.generation
        || message.correlationId !== correlationId) {
        reject("REQUEST_MISMATCH", "WORKER_RELEASE");
      }
      if (state !== "AWAITING_RELEASE" || releaseUsed || executionConsumed) {
        reject("DUPLICATE_RELEASE", "WORKER_RELEASE");
      }
      releaseUsed = true;
      const intentDecision = assertKnownDecision(await intentVerifier.verify({
        executionIntentRef: message.payload.executionIntentRef,
        correlationId,
        peer,
      }), "WORKER_EXECUTION_INTENT");
      await persist("EXECUTION_INTENT_CONFIRMED", { intentDecision, correlationId });
      state = "EXECUTING";
      executionConsumed = true;
      let result;
      try {
        result = executeSum3(pendingValues);
      } catch (error) {
        state = "FAILED";
        throw error;
      }
      const durable = await persist("WORKER_RESULT", { correlationId, result });
      state = "RESULT_DURABLE";
      return Object.freeze({ result, evidenceRef: durable.eventRef });
    },

    beginResultDispatch() {
      if (state !== "RESULT_DURABLE" || resultDispatchStarted) {
        reject("DUPLICATE_RESULT", "WORKER_RESULT_DISPATCH");
      }
      resultDispatchStarted = true;
    },

    async acceptStop(rawMessage, rawPeer) {
      const peer = assertPeer(rawPeer, "DRIVER", "WORKER_STOP_PEER");
      const message = validateMessage(rawMessage);
      if (message.type !== "STOP" || message.source.role !== peer.role
        || message.source.componentRef !== peer.componentRef
        || message.session.sessionId !== peer.sessionId
        || message.session.generation !== peer.generation
        || (correlationId !== null && message.correlationId !== correlationId)) {
        reject("REQUEST_MISMATCH", "WORKER_STOP");
      }
      if (state === "EXECUTING" || state === "STOP_REQUESTED" || stopUsed) {
        reject("DUPLICATE_REQUEST", "WORKER_STOP");
      }
      stopUsed = true;
      await persist("STOP_INTENT", { reason: message.payload.reason, correlationId });
      state = "STOP_REQUESTED";
      pendingValues = null;
      return Object.freeze({ state: "STOP_REQUESTED", osExitObserved: false });
    },
  });
}
