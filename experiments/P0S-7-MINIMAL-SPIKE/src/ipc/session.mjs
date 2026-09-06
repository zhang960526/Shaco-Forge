// NOT_PRODUCTION — authenticated session state machine; credential is not OS identity.
import {
  assertCapability, assertContentRef, assertLabel, assertPlainRecord,
  assertPositiveInteger, immutableCopy,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";
import { createMessage, validateMessage } from "./protocol.mjs";

export const HANDSHAKE_STATES = Object.freeze([
  "NEW", "OS_PEER_VERIFIED", "HELLO_SENT", "CHALLENGE_RECEIVED",
  "PROOF_SENT", "AUTHENTICATED", "CLOSED", "REJECTED",
]);

function validateSession(session) {
  assertPlainRecord(session, ["sessionId", "generation", "correlationId"], [], "IPC_SESSION");
  assertLabel(session.sessionId, "IPC_SESSION_ID");
  assertPositiveInteger(session.generation, "IPC_SESSION_GENERATION");
  assertLabel(session.correlationId, "IPC_SESSION_CORRELATION");
  return immutableCopy(session);
}

function validateLocalIdentity(identity) {
  assertPlainRecord(identity, ["role", "componentRef"], [], "IPC_LOCAL_IDENTITY");
  assertLabel(identity.role, "IPC_LOCAL_ROLE");
  assertContentRef(identity.componentRef, "IPC_LOCAL_COMPONENT_REF");
  return immutableCopy(identity);
}

export function createClientHandshake({
  connection,
  windowsControl,
  credentialProvider,
  proofProvider,
  localIdentity,
  expectedBrokerIdentity,
  endpointPolicyRef,
  session,
} = {}) {
  assertCapability(connection, "NAMED_PIPE_CONNECTION", ["send", "receive", "close"]);
  assertCapability(windowsControl, "WINDOWS_CONTROL", ["attestNamedPipePeer"]);
  assertCapability(credentialProvider, "PROTECTED_CREDENTIAL_PROVIDER", ["takeForSession", "destroy"]);
  assertCapability(proofProvider, "SESSION_PROOF_PROVIDER", ["prove"]);
  const local = validateLocalIdentity(localIdentity);
  const sessionFacts = validateSession(session);
  assertContentRef(endpointPolicyRef, "ENDPOINT_POLICY_REF");
  let state = "NEW";
  const outboundSequences = new Map();
  const inboundSequences = new Map();
  let credential = null;
  let brokerAttestation = null;

  function nextMessage(type, target, payload) {
    const sequence = (outboundSequences.get(target) ?? 0) + 1;
    outboundSequences.set(target, sequence);
    return createMessage({
      type,
      source: local,
      target,
      session: {
        sessionId: sessionFacts.sessionId,
        generation: sessionFacts.generation,
      },
      correlationId: sessionFacts.correlationId,
      sequence,
      payload,
    });
  }

  function acceptInbound(raw, expectedTypes) {
    const message = validateMessage(raw);
    if (message.session.sessionId !== sessionFacts.sessionId
      || message.session.generation !== sessionFacts.generation) {
      reject("STALE_SESSION", "IPC_SESSION");
    }
    if (message.correlationId !== sessionFacts.correlationId
      || message.target !== local.role
      || !expectedTypes.includes(message.type)) {
      reject("REQUEST_MISMATCH", "IPC_SESSION");
    }
    const sourceKey = message.source.role + ":" + message.source.componentRef;
    const previousSequence = inboundSequences.get(sourceKey) ?? 0;
    if (message.sequence !== previousSequence + 1) {
      reject("DUPLICATE_REQUEST", "IPC_SEQUENCE");
    }
    inboundSequences.set(sourceKey, message.sequence);
    return message;
  }

  async function rejectAndClose(code) {
    state = "REJECTED";
    if (credential !== null) await credentialProvider.destroy(credential);
    credential = null;
    await connection.close({ reason: code });
    reject(code, "IPC_HANDSHAKE");
  }

  return Object.freeze({
    inspect() {
      return Object.freeze({
        state,
        outboundRoutes: outboundSequences.size,
        inboundSources: inboundSequences.size,
      });
    },

    async establish({ timeoutMs }) {
      if (state !== "NEW") reject("UNEXPECTED_STATE", "IPC_HANDSHAKE");
      if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) {
        reject("UNBOUNDED_OR_INVALID_TIMEOUT", "IPC_HANDSHAKE");
      }
      try {
        brokerAttestation = await windowsControl.attestNamedPipePeer({
          connectionId: connection.connectionId,
          expectedIdentity: expectedBrokerIdentity,
          endpointPolicyRef,
        });
        if (brokerAttestation.status !== "OS_IDENTITY_VERIFIED") {
          return rejectAndClose("OS_PEER_IDENTITY_NOT_VERIFIED");
        }
        state = "OS_PEER_VERIFIED";
        credential = await credentialProvider.takeForSession({
          session: sessionFacts,
          localIdentity: local,
          brokerAttestation,
        });
        assertPlainRecord(credential, ["credentialId", "secretBytes"], [], "SESSION_CREDENTIAL");
        assertLabel(credential.credentialId, "SESSION_CREDENTIAL_ID");
        if (!(credential.secretBytes instanceof Uint8Array) || credential.secretBytes.byteLength < 32) {
          return rejectAndClose("AUTHENTICATION_BLOCKED");
        }

        await connection.send(nextMessage("HELLO", "WINDOWS_BROKER", {
          role: local.role,
          componentRef: local.componentRef,
          credentialId: credential.credentialId,
        }));
        state = "HELLO_SENT";
        const challenge = acceptInbound(await connection.receive({ timeoutMs }), ["CHALLENGE"]);
        if (challenge.payload.credentialId !== credential.credentialId) {
          return rejectAndClose("AUTHENTICATION_BLOCKED");
        }
        state = "CHALLENGE_RECEIVED";
        const proof = await proofProvider.prove({
          secretBytes: credential.secretBytes,
          challenge: challenge.payload.challenge,
          nonceId: challenge.payload.nonceId,
          session: sessionFacts,
          localIdentity: local,
        });
        if (typeof proof !== "string" || !/^[a-f0-9]{64}$/.test(proof)) {
          return rejectAndClose("AUTHENTICATION_BLOCKED");
        }
        await connection.send(nextMessage("PROOF", "WINDOWS_BROKER", {
          credentialId: credential.credentialId,
          nonceId: challenge.payload.nonceId,
          proof,
        }));
        state = "PROOF_SENT";
        const ready = acceptInbound(await connection.receive({ timeoutMs }), ["SESSION_READY"]);
        await credentialProvider.destroy(credential);
        credential = null;
        state = "AUTHENTICATED";
        return Object.freeze({
          status: "AUTHENTICATED",
          brokerOsIdentity: brokerAttestation.peer,
          brokerObserverRef: brokerAttestation.observerRef,
          peerAttestationRef: ready.payload.peerAttestationRef,
        });
      } catch (error) {
        if (state !== "REJECTED") {
          try {
            if (credential !== null) await credentialProvider.destroy(credential);
            credential = null;
            await connection.close({ reason: "AUTHENTICATION_BLOCKED" });
          } finally {
            state = "REJECTED";
          }
        }
        throw error;
      }
    },

    async send(type, target, payload) {
      if (state !== "AUTHENTICATED") reject("AUTHENTICATION_BLOCKED", "IPC_SEND");
      const message = nextMessage(type, target, payload);
      await connection.send(message);
      return message;
    },

    async receive({ expectedTypes, timeoutMs }) {
      if (state !== "AUTHENTICATED") reject("AUTHENTICATION_BLOCKED", "IPC_RECEIVE");
      if (!Array.isArray(expectedTypes) || expectedTypes.length === 0) {
        reject("MESSAGE_TYPE_EXPECTATION_MISSING", "IPC_RECEIVE");
      }
      return acceptInbound(await connection.receive({ timeoutMs }), expectedTypes);
    },

    async close(reason = "CONTROLLED_STOP") {
      if (state === "CLOSED") reject("DUPLICATE_REQUEST", "IPC_CLOSE");
      await connection.close({ reason });
      state = "CLOSED";
    },
  });
}
