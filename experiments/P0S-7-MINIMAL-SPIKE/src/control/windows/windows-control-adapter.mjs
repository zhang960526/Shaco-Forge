// NOT_PRODUCTION — explicit boundary to a preselected Windows broker/helper.
import {
  assertCapability, assertContentRef, assertLabel, assertPlainRecord,
  assertPositiveInteger, assertWindowsSid, immutableCopy,
} from "../contracts.mjs";
import { reject } from "../phase-a-policy.mjs";

export const REQUIRED_WINDOWS_CAPABILITIES = Object.freeze([
  "PROCESS_IDENTITY_PID_START_PATH",
  "PROCESS_PARENT_IDENTITY",
  "PROCESS_TOKEN_SID",
  "NAMED_PIPE_CLIENT_PROCESS_ID",
  "NAMED_PIPE_SERVER_PROCESS_ID",
  "CURRENT_USER_ONLY_PIPE_ENDPOINT",
  "JOB_OBJECT_RESOURCE_OWNERSHIP",
  "BOUNDED_STOP_AND_EXIT_OBSERVATION",
]);

function validateProcessIdentity(identity, operation) {
  assertPlainRecord(identity, [
    "pid", "processStartTimeFileTime", "executablePath", "executableRef",
    "tokenSid", "parent", "generation",
  ], [], operation);
  assertPositiveInteger(identity.pid, operation);
  if (typeof identity.processStartTimeFileTime !== "string"
    || !/^[1-9]\d{0,19}$/.test(identity.processStartTimeFileTime)) {
    reject("INVALID_PROCESS_START_TIME", operation);
  }
  if (typeof identity.executablePath !== "string"
    || !/^[A-Za-z]:\\[^\0]+$/.test(identity.executablePath)) {
    reject("INVALID_EXECUTABLE_PATH", operation);
  }
  assertContentRef(identity.executableRef, operation);
  assertWindowsSid(identity.tokenSid, operation);
  assertPositiveInteger(identity.generation, operation);
  assertPlainRecord(identity.parent, [
    "pid", "processStartTimeFileTime", "executablePath", "executableRef",
  ], [], operation + "_PARENT");
  assertPositiveInteger(identity.parent.pid, operation + "_PARENT");
  if (typeof identity.parent.processStartTimeFileTime !== "string"
    || !/^[1-9]\d{0,19}$/.test(identity.parent.processStartTimeFileTime)
    || typeof identity.parent.executablePath !== "string") {
    reject("INVALID_PARENT_IDENTITY", operation);
  }
  assertContentRef(identity.parent.executableRef, operation + "_PARENT");
  return immutableCopy(identity);
}

function validateAttestation(attestation, operation) {
  assertPlainRecord(attestation, [
    "status", "connectionId", "peer", "observerRef", "endpointPolicyRef",
  ], [], operation);
  if (attestation.status !== "OS_IDENTITY_VERIFIED") {
    reject("OS_PEER_IDENTITY_NOT_VERIFIED", operation);
  }
  assertLabel(attestation.connectionId, operation);
  assertContentRef(attestation.observerRef, operation);
  assertContentRef(attestation.endpointPolicyRef, operation);
  return Object.freeze({ ...attestation, peer: validateProcessIdentity(attestation.peer, operation) });
}

function validateSelection(selection) {
  assertPlainRecord(selection, [
    "helperSourceRef", "helperExecutableRef", "helperExecutablePath", "hostAbiRef",
    "contractRef",
  ], [], "WINDOWS_HELPER_SELECTION");
  for (const key of ["helperSourceRef", "helperExecutableRef", "hostAbiRef", "contractRef"]) {
    assertContentRef(selection[key], "WINDOWS_HELPER_SELECTION");
  }
  if (typeof selection.helperExecutablePath !== "string"
    || !/^[A-Za-z]:\\[^\0]+$/.test(selection.helperExecutablePath)) {
    reject("WINDOWS_HELPER_PATH_INVALID", "WINDOWS_HELPER_SELECTION");
  }
  return immutableCopy(selection);
}

export function createWindowsControlAdapter({ brokerClient } = {}) {
  let initialized = false;
  let capabilityProofRef = null;

  function broker(operation) {
    if (!brokerClient) {
      reject("WINDOWS_HELPER_UNAVAILABLE", operation, ["B04"]);
    }
    return brokerClient;
  }

  function ready(operation) {
    const client = broker(operation);
    if (!initialized) reject("WINDOWS_HELPER_NOT_BOOTSTRAPPED", operation, ["B04"]);
    return client;
  }

  return Object.freeze({
    async initialize(rawSelection) {
      const client = broker("WINDOWS_HELPER_BOOTSTRAP");
      assertCapability(client, "WINDOWS_BROKER_CLIENT", [
        "bootstrap", "inspectCurrentProcess", "inspectProcess", "attestNamedPipePeer",
        "createProtectedPipe", "launchInOwnedJob", "observeExit", "boundedStop",
        "assertResourceOwnership",
      ]);
      const selection = validateSelection(rawSelection);
      const result = await client.bootstrap(selection);
      assertPlainRecord(result, ["status", "capabilities", "capabilityProofRef"], [],
        "WINDOWS_HELPER_BOOTSTRAP");
      if (result.status !== "VERIFIED" || !Array.isArray(result.capabilities)
        || result.capabilities.length !== REQUIRED_WINDOWS_CAPABILITIES.length
        || REQUIRED_WINDOWS_CAPABILITIES.some(item => !result.capabilities.includes(item))) {
        reject("WINDOWS_HELPER_CAPABILITY_MISMATCH", "WINDOWS_HELPER_BOOTSTRAP", ["B04"]);
      }
      assertContentRef(result.capabilityProofRef, "WINDOWS_HELPER_BOOTSTRAP");
      capabilityProofRef = result.capabilityProofRef;
      initialized = true;
      return Object.freeze({ status: "VERIFIED", capabilityProofRef });
    },

    async inspectCurrentProcess() {
      const result = await ready("INSPECT_CURRENT_PROCESS").inspectCurrentProcess();
      return validateProcessIdentity(result, "INSPECT_CURRENT_PROCESS");
    },

    async inspectProcess(expectedIdentity) {
      const expected = validateProcessIdentity(expectedIdentity, "INSPECT_PROCESS_EXPECTED");
      const result = await ready("INSPECT_PROCESS").inspectProcess(expected);
      return validateAttestation(result, "INSPECT_PROCESS");
    },

    async attestNamedPipePeer({ connectionId, expectedIdentity, endpointPolicyRef }) {
      assertLabel(connectionId, "NAMED_PIPE_CONNECTION_ID");
      assertContentRef(endpointPolicyRef, "NAMED_PIPE_ENDPOINT_POLICY");
      const expected = validateProcessIdentity(expectedIdentity, "EXPECTED_PIPE_PEER");
      const result = await ready("ATTEST_NAMED_PIPE_PEER").attestNamedPipePeer({
        connectionId,
        expectedIdentity: expected,
        endpointPolicyRef,
      });
      const attestation = validateAttestation(result, "ATTEST_NAMED_PIPE_PEER");
      if (attestation.endpointPolicyRef !== endpointPolicyRef) {
        reject("ENDPOINT_POLICY_MISMATCH", "ATTEST_NAMED_PIPE_PEER");
      }
      return attestation;
    },

    async createProtectedPipe(policy) {
      assertPlainRecord(policy, [
        "endpointId", "generation", "ownerSid", "maxInstances", "policyRef",
      ], [], "PIPE_ENDPOINT_POLICY");
      assertLabel(policy.endpointId, "PIPE_ENDPOINT_ID");
      assertPositiveInteger(policy.generation, "PIPE_GENERATION");
      assertWindowsSid(policy.ownerSid, "PIPE_OWNER_SID");
      if (policy.maxInstances !== 1) reject("PIPE_INSTANCE_LIMIT_MISMATCH", "PIPE_ENDPOINT_POLICY");
      assertContentRef(policy.policyRef, "PIPE_ENDPOINT_POLICY");
      const result = await ready("CREATE_PROTECTED_PIPE").createProtectedPipe(policy);
      if (result?.status !== "CURRENT_USER_ONLY_ENFORCED"
        || result.policyRef !== policy.policyRef
        || typeof result.connectionToken !== "string") {
        reject("PROTECTED_ENDPOINT_NOT_ENFORCED", "CREATE_PROTECTED_PIPE", ["B04"]);
      }
      return immutableCopy(result);
    },

    async launchControlled(request) {
      const result = await ready("LAUNCH_CONTROLLED_PROCESS").launchInOwnedJob(request);
      assertPlainRecord(result, ["status", "identity", "resourceOwnershipRef"], [],
        "LAUNCH_CONTROLLED_PROCESS");
      if (result.status !== "LAUNCHED_IN_OWNED_JOB") {
        reject("CONTROLLED_LAUNCH_NOT_ESTABLISHED", "LAUNCH_CONTROLLED_PROCESS");
      }
      assertContentRef(result.resourceOwnershipRef, "RESOURCE_OWNERSHIP");
      return Object.freeze({
        status: result.status,
        identity: validateProcessIdentity(result.identity, "LAUNCHED_PROCESS_IDENTITY"),
        resourceOwnershipRef: result.resourceOwnershipRef,
      });
    },

    async assertResourceOwnership(resource) {
      const result = await ready("RESOURCE_OWNERSHIP").assertResourceOwnership(resource);
      if (result?.status !== "OWNERSHIP_VERIFIED") {
        reject("RESOURCE_OWNERSHIP_UNKNOWN", "RESOURCE_OWNERSHIP");
      }
      return immutableCopy(result);
    },

    async observeExit(request) {
      const result = await ready("OBSERVE_PROCESS_EXIT").observeExit(request);
      if (!result || !["OS_EXIT_OBSERVED", "STILL_RUNNING", "IDENTITY_UNKNOWN"].includes(result.status)) {
        reject("PROCESS_EXIT_OBSERVATION_UNKNOWN", "OBSERVE_PROCESS_EXIT");
      }
      return immutableCopy(result);
    },

    async boundedStop(request) {
      assertPlainRecord(request, ["identity", "resourceOwnershipRef", "timeoutMs", "reason"], [],
        "BOUNDED_STOP");
      validateProcessIdentity(request.identity, "BOUNDED_STOP_IDENTITY");
      assertContentRef(request.resourceOwnershipRef, "BOUNDED_STOP_OWNERSHIP");
      if (!Number.isSafeInteger(request.timeoutMs) || request.timeoutMs < 1 || request.timeoutMs > 15_000) {
        reject("UNBOUNDED_STOP", "BOUNDED_STOP");
      }
      const result = await ready("BOUNDED_STOP").boundedStop(request);
      if (!result || !["OS_EXIT_OBSERVED", "CONTAINED_JOB_TERMINATED", "STOP_FAILED"].includes(result.status)) {
        reject("STOP_RESULT_UNKNOWN", "BOUNDED_STOP");
      }
      return immutableCopy(result);
    },

    status() {
      return Object.freeze({
        helper: initialized ? "SOURCE_SELECTED_AND_RUNTIME_VERIFIED" : "UNAVAILABLE_OR_UNVERIFIED",
        capabilityProofRef,
      });
    },
  });
}
