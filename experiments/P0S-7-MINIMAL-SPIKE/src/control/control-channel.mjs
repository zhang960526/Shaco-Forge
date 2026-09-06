// NOT_PRODUCTION — Driver's authenticated one-shot control channel facade.
import { assertCapability, assertContentRef, assertLabel } from "./contracts.mjs";
import { reject } from "./phase-a-policy.mjs";

export function createDriverControlChannel({ session } = {}) {
  assertCapability(session, "AUTHENTICATED_DRIVER_IPC_SESSION", ["send", "receive"]);
  let readyObserved = false;
  let acceptedObserved = false;
  let releaseSent = false;
  let resultObserved = false;
  let stopSent = false;
  let stopAckObserved = false;

  return Object.freeze({
    async awaitWorkerReady({ correlationId, timeoutMs }) {
      if (readyObserved) reject("DUPLICATE_REQUEST", "WORKER_READY");
      assertLabel(correlationId, "WORKER_READY_CORRELATION");
      const message = await session.receive({ expectedTypes: ["WORKER_READY"], timeoutMs });
      if (message.correlationId !== correlationId || message.payload.state !== "READY") {
        reject("REQUEST_MISMATCH", "WORKER_READY");
      }
      readyObserved = true;
      return message;
    },

    async awaitTaskAccepted({ correlationId, timeoutMs }) {
      if (!readyObserved || acceptedObserved) reject("DUPLICATE_REQUEST", "TASK_ACCEPTED");
      const message = await session.receive({
        expectedTypes: ["TASK_ACCEPTED", "REJECT", "ERROR"], timeoutMs,
      });
      if (message.type !== "TASK_ACCEPTED" || message.correlationId !== correlationId) {
        reject("REQUEST_MISMATCH", "TASK_ACCEPTED");
      }
      acceptedObserved = true;
      return message;
    },

    async releaseOnce({ correlationId, executionIntentRef }) {
      if (!acceptedObserved || releaseSent) reject("DUPLICATE_RELEASE", "TASK_RELEASE");
      assertLabel(correlationId, "TASK_RELEASE_CORRELATION");
      assertContentRef(executionIntentRef, "EXECUTION_INTENT_REF");
      releaseSent = true;
      return session.send("RELEASE", "WORKER", {
        operation: "SUM3",
        executionIntentRef,
      });
    },

    async awaitResult({ correlationId, timeoutMs }) {
      if (!releaseSent || resultObserved) reject("DUPLICATE_RESULT", "TASK_RESULT");
      const message = await session.receive({
        expectedTypes: ["RESULT", "REJECT", "ERROR"], timeoutMs,
      });
      if (message.type !== "RESULT" || message.correlationId !== correlationId) {
        reject("REQUEST_MISMATCH", "TASK_RESULT");
      }
      resultObserved = true;
      return Object.freeze({ ...message.payload, correlationId: message.correlationId });
    },

    async stopOnce({ correlationId, reason }) {
      if (stopSent) reject("DUPLICATE_REQUEST", "WORKER_STOP");
      assertLabel(correlationId, "WORKER_STOP_CORRELATION");
      stopSent = true;
      return session.send("STOP", "WORKER", { reason });
    },

    async awaitStopAck({ correlationId, timeoutMs }) {
      if (!stopSent || stopAckObserved) reject("DUPLICATE_REQUEST", "WORKER_STOP_ACK");
      const message = await session.receive({
        expectedTypes: ["STOP_ACK", "REJECT", "ERROR"], timeoutMs,
      });
      if (message.type !== "STOP_ACK" || message.correlationId !== correlationId
        || message.payload.state !== "STOP_REQUESTED"
        || message.payload.osExitObserved !== false) {
        reject("REQUEST_MISMATCH", "WORKER_STOP_ACK");
      }
      stopAckObserved = true;
      return message;
    },

    inspect() {
      return Object.freeze({
        readyObserved, acceptedObserved, releaseSent,
        resultObserved, stopSent, stopAckObserved,
      });
    },
  });
}
