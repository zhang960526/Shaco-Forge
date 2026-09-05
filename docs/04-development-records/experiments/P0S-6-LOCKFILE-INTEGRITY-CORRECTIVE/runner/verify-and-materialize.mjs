export const RUNNER_VERSION = "P0S6-FINAL-VERIFICATION-RUNNER-0.1.0";

export const AUTHORITY_BLOCKED = "AUTHORITY_BLOCKED";
const GATE_PASSED = "GATE_PASSED";

export const EXECUTOR_IDENTITY = Object.freeze({
  implementation: "Node.js",
  version: "v24.18.0",
  resolution: "FROZEN_ABSOLUTE_PATH_ONLY",
  dynamicPathLookup: "PROHIBITED",
});

export const INVOCATION_COMPATIBILITY = Object.freeze({
  contractId: "P0S6-LICC-20260904-01",
  invocationId: "P0S6-FINAL-VERIFICATION-INVOCATION-20260904-01",
  consumedState: "NOT_CONSUMED",
  startBoundary: "NOT_CROSSED",
  retry: "PROHIBITED",
  resume: "PROHIBITED",
  reuse: "PROHIBITED",
});

export const REQUIRED_AUTHORITY_STATE = Object.freeze({
  futureVerificationExecutionAuthority: "YES",
  futureVerificationExecuted: "NO",
  p0s7Allowed: "NO",
});

export const RUNNER_SCOPE = Object.freeze({
  purpose: "P0.S-6 Final Verification Acceptance",
  allowed: Object.freeze([
    "READ_FROZEN_INPUT_MANIFEST",
    "RUN_PREFLIGHT_CHECKS",
    "VERIFY_REGISTRY_METADATA_IDENTITY",
    "VERIFY_TARBALL_INTEGRITY",
    "MATERIALIZE_CORRECTED_LOCKFILE_CANDIDATE",
    "GENERATE_EVIDENCE",
  ]),
  prohibited: Object.freeze([
    "MODIFY_SOURCE_LOCKFILE",
    "REPLACE_OFFICIAL_PACKAGE_LOCK",
    "RUN_NPM_INSTALL",
    "RUN_NPM_CI",
    "RETRY",
    "RESUME",
    "ENTER_DEPENDENCY_PREPARATION",
    "ENTER_RUNTIME",
    "ENTER_P0S7",
    "CREATE_CHILD_PROCESS",
  ]),
});

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expectedKeys) {
  if (!isRecord(value)) {
    return false;
  }

  const actualKeys = Object.keys(value).sort();
  const requiredKeys = [...expectedKeys].sort();

  return (
    actualKeys.length === requiredKeys.length &&
    actualKeys.every((key, index) => key === requiredKeys[index])
  );
}

export function checkInvocationCompatibility(invocation) {
  const keys = [
    "contractId",
    "invocationId",
    "consumedState",
    "startBoundary",
    "retry",
    "resume",
    "reuse",
  ];

  if (!hasExactKeys(invocation, keys)) {
    return AUTHORITY_BLOCKED;
  }

  for (const key of keys) {
    if (invocation[key] !== INVOCATION_COMPATIBILITY[key]) {
      return AUTHORITY_BLOCKED;
    }
  }

  return GATE_PASSED;
}

export function checkAuthorityState(authorityState) {
  const keys = [
    "futureVerificationExecutionAuthority",
    "futureVerificationExecuted",
    "p0s7Allowed",
  ];

  if (!hasExactKeys(authorityState, keys)) {
    return AUTHORITY_BLOCKED;
  }

  for (const key of keys) {
    if (authorityState[key] !== REQUIRED_AUTHORITY_STATE[key]) {
      return AUTHORITY_BLOCKED;
    }
  }

  return GATE_PASSED;
}

export function checkExecutorIdentity(executorIdentity) {
  const keys = ["implementation", "version", "resolution", "dynamicPathLookup"];

  if (process.version !== EXECUTOR_IDENTITY.version) {
    return AUTHORITY_BLOCKED;
  }

  if (!hasExactKeys(executorIdentity, keys)) {
    return AUTHORITY_BLOCKED;
  }

  for (const key of keys) {
    if (executorIdentity[key] !== EXECUTOR_IDENTITY[key]) {
      return AUTHORITY_BLOCKED;
    }
  }

  return GATE_PASSED;
}

export function readFrozenInputManifest(_manifestIdentity) {
  // Preparation-stage skeleton: no manifest bytes may be read until this
  // placeholder is replaced under a separately frozen authorization.
  return AUTHORITY_BLOCKED;
}

export function runPreflight(context) {
  if (!isRecord(context)) {
    return AUTHORITY_BLOCKED;
  }

  if (checkExecutorIdentity(context.executorIdentity) !== GATE_PASSED) {
    return AUTHORITY_BLOCKED;
  }

  if (checkInvocationCompatibility(context.invocation) !== GATE_PASSED) {
    return AUTHORITY_BLOCKED;
  }

  if (checkAuthorityState(context.authorityState) !== GATE_PASSED) {
    return AUTHORITY_BLOCKED;
  }

  return readFrozenInputManifest(context.manifestIdentity);
}

export function placeholderExecutionEntry(context) {
  if (runPreflight(context) !== GATE_PASSED) {
    return AUTHORITY_BLOCKED;
  }

  // Verification and materialization are intentionally absent in this
  // preparation-stage skeleton. The default and terminal result stays closed.
  return AUTHORITY_BLOCKED;
}

const result = placeholderExecutionEntry(undefined);

if (result !== AUTHORITY_BLOCKED) {
  throw new Error("FAIL_CLOSED_INVARIANT_VIOLATION");
}

process.stdout.write(`${AUTHORITY_BLOCKED}\n`);
process.exitCode = 2;
