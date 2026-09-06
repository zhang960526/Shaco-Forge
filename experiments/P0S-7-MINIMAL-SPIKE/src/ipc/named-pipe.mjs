// NOT_PRODUCTION — broker-backed Windows Named Pipe factories; no import-time I/O.
import {
  assertCapability, assertContentRef, assertLabel, assertPlainRecord,
  assertPositiveInteger, immutableCopy,
} from "../control/contracts.mjs";
import { reject } from "../control/phase-a-policy.mjs";
import { MAX_FRAME_BYTES, PROTOCOL } from "./protocol.mjs";
import { createClientHandshake } from "./session.mjs";

export const NAMED_PIPE_BOUNDARY = Object.freeze({
  protocol: PROTOCOL,
  carrier: "WINDOWS_NAMED_PIPE",
  state: "EXPLICIT_FACTORY_ONLY",
  maxFrameBytes: MAX_FRAME_BYTES,
  authentication: "OS_PEER_IDENTITY_PLUS_SESSION_HANDSHAKE_REQUIRED",
  brokerHelper: "REQUIRED_FAIL_CLOSED_IF_UNAVAILABLE",
  fallback: "FORBIDDEN",
});

function validateEndpoint(endpoint) {
  assertPlainRecord(endpoint, [
    "carrier", "pipeName", "endpointId", "generation",
  ], [], "NAMED_PIPE_ENDPOINT");
  if (endpoint.carrier !== "WINDOWS_NAMED_PIPE"
    || typeof endpoint.pipeName !== "string"
    || !/^\\\\\.\\pipe\\[A-Za-z0-9._-]{1,128}$/.test(endpoint.pipeName)) {
    reject("INVALID_NAMED_PIPE_ENDPOINT", "NAMED_PIPE_ENDPOINT");
  }
  assertLabel(endpoint.endpointId, "NAMED_PIPE_ENDPOINT_ID");
  assertPositiveInteger(endpoint.generation, "NAMED_PIPE_GENERATION");
  return immutableCopy(endpoint);
}

function requireBroker(brokerClient, methods, operation) {
  if (!brokerClient) reject("WINDOWS_HELPER_UNAVAILABLE", operation, ["B04"]);
  return assertCapability(brokerClient, "WINDOWS_NAMED_PIPE_BROKER", methods);
}

export function createNamedPipeClientFactory({
  brokerClient,
  windowsControl,
  credentialProvider,
  proofProvider,
} = {}) {
  assertCapability(windowsControl, "WINDOWS_CONTROL", ["attestNamedPipePeer"]);
  assertCapability(credentialProvider, "PROTECTED_CREDENTIAL_PROVIDER", ["takeForSession", "destroy"]);
  assertCapability(proofProvider, "SESSION_PROOF_PROVIDER", ["prove"]);

  return Object.freeze({
    createClient({
      endpoint,
      endpointPolicyRef,
      localIdentity,
      expectedBrokerIdentity,
      session,
    }) {
      const selectedEndpoint = validateEndpoint(endpoint);
      assertContentRef(endpointPolicyRef, "NAMED_PIPE_ENDPOINT_POLICY");
      let connection = null;
      let authenticatedSession = null;

      return Object.freeze({
        async connect({ timeoutMs }) {
          if (connection !== null) reject("DUPLICATE_REQUEST", "NAMED_PIPE_CONNECT");
          const broker = requireBroker(brokerClient, ["openNamedPipeClient"], "NAMED_PIPE_CONNECT");
          connection = await broker.openNamedPipeClient({
            endpoint: selectedEndpoint,
            maximumFrameBytes: MAX_FRAME_BYTES,
            tcpHttpFallback: "FORBIDDEN",
          });
          if (connection?.carrier !== "WINDOWS_NAMED_PIPE"
            || typeof connection.connectionId !== "string") {
            reject("NAMED_PIPE_CARRIER_MISMATCH", "NAMED_PIPE_CONNECT");
          }
          authenticatedSession = createClientHandshake({
            connection,
            windowsControl,
            credentialProvider,
            proofProvider,
            localIdentity,
            expectedBrokerIdentity,
            endpointPolicyRef,
            session,
          });
          return authenticatedSession.establish({ timeoutMs });
        },

        send(type, target, payload) {
          if (!authenticatedSession) reject("AUTHENTICATION_BLOCKED", "NAMED_PIPE_SEND");
          return authenticatedSession.send(type, target, payload);
        },

        receive(options) {
          if (!authenticatedSession) reject("AUTHENTICATION_BLOCKED", "NAMED_PIPE_RECEIVE");
          return authenticatedSession.receive(options);
        },

        close(reason) {
          if (!authenticatedSession) reject("AUTHENTICATION_BLOCKED", "NAMED_PIPE_CLOSE");
          return authenticatedSession.close(reason);
        },
      });
    },
  });
}

export function createNamedPipeServerFactory({ brokerClient, windowsControl } = {}) {
  assertCapability(windowsControl, "WINDOWS_CONTROL", [
    "createProtectedPipe", "attestNamedPipePeer",
  ]);

  return Object.freeze({
    createServer({ endpoint, endpointPolicy, expectedPeers, credentialPolicyRef, onPeer }) {
      const selectedEndpoint = validateEndpoint(endpoint);
      assertContentRef(credentialPolicyRef, "CREDENTIAL_POLICY_REF");
      if (!Array.isArray(expectedPeers) || expectedPeers.length === 0 || expectedPeers.length > 3) {
        reject("EXPECTED_PEER_ROSTER_MISSING_OR_UNBOUNDED", "NAMED_PIPE_SERVER");
      }
      if (typeof onPeer !== "function") reject("PEER_HANDLER_MISSING", "NAMED_PIPE_SERVER");
      let listened = false;

      return Object.freeze({
        async listen() {
          if (listened) reject("DUPLICATE_REQUEST", "NAMED_PIPE_LISTEN");
          listened = true;
          const broker = requireBroker(brokerClient, ["listenProtectedNamedPipe"], "NAMED_PIPE_LISTEN");
          const protectedEndpoint = await windowsControl.createProtectedPipe(endpointPolicy);
          if (protectedEndpoint.endpointId !== selectedEndpoint.endpointId) {
            reject("ENDPOINT_POLICY_MISMATCH", "NAMED_PIPE_LISTEN");
          }
          return broker.listenProtectedNamedPipe({
            endpoint: selectedEndpoint,
            protectedEndpoint,
            expectedPeers: immutableCopy(expectedPeers),
            credentialPolicyRef,
            maximumFrameBytes: MAX_FRAME_BYTES,
            protocol: PROTOCOL,
            onAuthenticatedPeer: async peer => {
              const expected = expectedPeers.find(item => item.role === peer.claimedRole);
              if (!expected) reject("WRONG_ROUTE", "NAMED_PIPE_PEER");
              const attestation = await windowsControl.attestNamedPipePeer({
                connectionId: peer.connectionId,
                expectedIdentity: expected.processIdentity,
                endpointPolicyRef: endpointPolicy.policyRef,
              });
              if (attestation.status !== "OS_IDENTITY_VERIFIED") {
                reject("OS_PEER_IDENTITY_NOT_VERIFIED", "NAMED_PIPE_PEER");
              }
              return onPeer(Object.freeze({
                role: expected.role,
                componentRef: expected.componentRef,
                attestation,
                channel: peer.channel,
              }));
            },
          });
        },
      });
    },
  });
}
