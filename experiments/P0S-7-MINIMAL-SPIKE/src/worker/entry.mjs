// NOT_PRODUCTION — independent Worker entry; no listener or connection at import.
import {
  assertCapability, assertKnownDecision, assertPlainRecord, immutableCopy,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";
import { createWorkerStateMachine } from "./state-machine.mjs";

function validateRuntimeContext(context) {
  assertPlainRecord(context, [
    "authorizationContext", "endpoint", "endpointPolicyRef", "localIdentity",
    "expectedBrokerIdentity", "session", "launchContext", "timeoutMs", "maximumMessages",
  ], [], "WORKER_RUNTIME_CONTEXT");
  if (!Number.isSafeInteger(context.timeoutMs) || context.timeoutMs < 1 || context.timeoutMs > 30_000
    || context.maximumMessages !== 3) {
    reject("UNBOUNDED_OR_INVALID_WORKER_LIMIT", "WORKER_RUNTIME_CONTEXT");
  }
  return context;
}

function peerFromMessage(message, peerDirectory) {
  const peer = peerDirectory.lookup({
    role: message.source.role,
    componentRef: message.source.componentRef,
    sessionId: message.session.sessionId,
    generation: message.session.generation,
  });
  assertPlainRecord(peer, [
    "role", "componentRef", "osAttestationRef", "sessionId", "generation",
  ], [], "WORKER_PEER_DIRECTORY");
  return immutableCopy(peer);
}

export function createWorkerEntry({
  ipcClientFactory,
  launchGuard,
  authorization,
  evidence,
  intentVerifier,
  peerDirectory,
} = {}) {
  assertCapability(ipcClientFactory, "WORKER_IPC_CLIENT_FACTORY", ["createClient"]);
  assertCapability(launchGuard, "WORKER_LAUNCH_GUARD", ["verify"]);
  assertCapability(peerDirectory, "AUTHENTICATED_PEER_DIRECTORY", ["lookup"]);
  let started = false;

  return Object.freeze({
    async start(rawContext) {
      if (started) reject("DUPLICATE_REQUEST", "WORKER_START");
      started = true;
      const context = validateRuntimeContext(rawContext);
      assertKnownDecision(
        await launchGuard.verify(context.authorizationContext), "WORKER_LAUNCH_GUARD",
      );
      const client = ipcClientFactory.createClient({
        endpoint: context.endpoint,
        endpointPolicyRef: context.endpointPolicyRef,
        localIdentity: context.localIdentity,
        expectedBrokerIdentity: context.expectedBrokerIdentity,
        session: context.session,
      });
      const authenticated = await client.connect({ timeoutMs: context.timeoutMs });
      if (authenticated?.status !== "AUTHENTICATED") {
        reject("AUTHENTICATION_BLOCKED", "WORKER_IPC_CONNECT");
      }
      const machine = createWorkerStateMachine({ authorization, evidence, intentVerifier });
      await machine.markReady(context.launchContext);
      await client.send("WORKER_READY", "DRIVER", { state: "READY" });
      let served = false;

      return Object.freeze({
        inspect: machine.inspect,

        async serveSingleTask() {
          if (served) reject("DRIVER_RETRY_RESUME_REUSE_FORBIDDEN", "WORKER_SERVE");
          served = true;
          for (let handled = 0; handled < context.maximumMessages; handled += 1) {
            const state = machine.inspect().state;
            const expectedTypes = state === "IDLE"
              ? ["REQUEST", "STOP"]
              : state === "AWAITING_RELEASE" ? ["RELEASE", "STOP"] : ["STOP"];
            const message = await client.receive({ expectedTypes, timeoutMs: context.timeoutMs });
            const peer = peerFromMessage(message, peerDirectory);
            if (message.type === "REQUEST") {
              const accepted = await machine.acceptRequest(message, peer);
              await client.send("TASK_ACCEPTED", "DESKTOP_MAIN", accepted);
              await client.send("TASK_ACCEPTED", "DRIVER", accepted);
              continue;
            }
            if (message.type === "RELEASE") {
              const produced = await machine.release(message, peer);
              machine.beginResultDispatch();
              await client.send("RESULT", "DESKTOP_MAIN", produced.result);
              await client.send("RESULT", "DRIVER", produced.result);
              continue;
            }
            if (message.type === "STOP") {
              const acknowledgement = await machine.acceptStop(message, peer);
              await client.send("STOP_ACK", "DRIVER", acknowledgement);
              await client.close("STOP_ACKNOWLEDGED");
              return Object.freeze({
                status: "STOP_ACKNOWLEDGED_OS_EXIT_UNOBSERVED",
                processExitRequested: false,
              });
            }
          }
          reject("WORKER_MESSAGE_LIMIT_REACHED", "WORKER_SERVE");
        },
      });
    },
  });
}
