// NOT_PRODUCTION — externally selected Driver/trust bootstrap; no auto-trust sources.
import {
  assertCapability, assertContentRef, assertKnownDecision, assertLabel,
  assertPlainRecord, assertValidityWindow, immutableCopy,
} from "./contracts.mjs";
import { reject } from "./phase-a-policy.mjs";

function validateDriverIdentity(identity) {
  assertPlainRecord(identity, [
    "componentRef", "executableRef", "hostRef", "signerRef", "purpose",
  ], [], "DRIVER_IDENTITY");
  for (const key of ["componentRef", "executableRef", "hostRef", "signerRef"]) {
    assertContentRef(identity[key], "DRIVER_IDENTITY_" + key.toUpperCase());
  }
  if (identity.purpose !== "P0S7_ED_C01_CONTROL") {
    reject("DRIVER_PURPOSE_MISMATCH", "DRIVER_IDENTITY");
  }
  return identity;
}

function validateTrustInputs(inputs, observedAtUtc) {
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 32) {
    reject("TRUST_INPUT_SET_MISSING_OR_UNBOUNDED", "BOOTSTRAP_TRUST_INPUTS");
  }
  const ids = new Set();
  const refs = new Set();
  return Object.freeze(inputs.map(input => {
    assertPlainRecord(input, [
      "inputId", "contentRef", "purpose", "status", "notBeforeUtc", "expiresAtUtc",
    ], [], "BOOTSTRAP_TRUST_INPUT");
    assertLabel(input.inputId, "TRUST_INPUT_ID");
    assertContentRef(input.contentRef, "TRUST_INPUT_REF");
    if (ids.has(input.inputId) || refs.has(input.contentRef)) {
      reject("DUPLICATE_TRUST_INPUT", "BOOTSTRAP_TRUST_INPUTS", [input.inputId]);
    }
    ids.add(input.inputId);
    refs.add(input.contentRef);
    if (input.status !== "SELECTED_EXTERNALLY") {
      reject("UNKNOWN_TRUST_INPUT_STATUS", "BOOTSTRAP_TRUST_INPUT", [input.inputId]);
    }
    if (typeof input.purpose !== "string" || input.purpose.length === 0) {
      reject("TRUST_INPUT_PURPOSE_MISSING", "BOOTSTRAP_TRUST_INPUT", [input.inputId]);
    }
    assertValidityWindow(input, observedAtUtc, "BOOTSTRAP_TRUST_INPUT");
    return immutableCopy(input);
  }));
}

function validateSelection(selection) {
  assertPlainRecord(selection, [
    "selectionId", "observedAtUtc", "driverIdentity", "trustInputs",
    "expectedSnapshotRef", "scopeApprovalRef", "invocationContext",
  ], [], "BOOTSTRAP_SELECTION");
  assertLabel(selection.selectionId, "BOOTSTRAP_SELECTION_ID");
  assertContentRef(selection.expectedSnapshotRef, "EXPECTED_SNAPSHOT_REF");
  assertContentRef(selection.scopeApprovalRef, "SCOPE_APPROVAL_REF");
  const driverIdentity = validateDriverIdentity(selection.driverIdentity);
  const trustInputs = validateTrustInputs(selection.trustInputs, selection.observedAtUtc);
  return { driverIdentity, trustInputs };
}

export function createBootstrap({
  windowsControl,
  trustVerifier,
  prerequisiteVerifier,
  driverFactory,
} = {}) {
  assertCapability(windowsControl, "WINDOWS_CONTROL", ["inspectCurrentProcess"]);
  assertCapability(trustVerifier, "BOOTSTRAP_TRUST_VERIFIER", [
    "verifyDriverIdentity", "verifyTrustInputSet",
  ]);
  assertCapability(prerequisiteVerifier, "BOOTSTRAP_PREREQUISITE_VERIFIER", ["verify"]);
  assertCapability(driverFactory, "SELECTED_DRIVER_FACTORY", ["create"]);
  let invoked = false;

  return Object.freeze({
    async invoke(selection) {
      if (invoked) reject("BOOTSTRAP_REUSE_FORBIDDEN", "BOOTSTRAP");
      invoked = true;
      const validated = validateSelection(selection);
      const observedDriver = await windowsControl.inspectCurrentProcess();
      const driverDecision = assertKnownDecision(await trustVerifier.verifyDriverIdentity({
        selected: validated.driverIdentity,
        observed: observedDriver,
        observedAtUtc: selection.observedAtUtc,
      }), "BOOTSTRAP_DRIVER_IDENTITY");
      const trustDecision = assertKnownDecision(await trustVerifier.verifyTrustInputSet({
        selected: validated.trustInputs,
        expectedSnapshotRef: selection.expectedSnapshotRef,
        scopeApprovalRef: selection.scopeApprovalRef,
        observedAtUtc: selection.observedAtUtc,
      }), "BOOTSTRAP_TRUST_INPUTS");
      const prerequisiteDecision = assertKnownDecision(await prerequisiteVerifier.verify({
        selection,
        observedDriver,
        driverDecision,
        trustDecision,
      }), "BOOTSTRAP_PREREQUISITES");

      const driver = driverFactory.create(Object.freeze({
        selectionId: selection.selectionId,
        driverIdentity: immutableCopy(validated.driverIdentity),
        trustInputRefs: Object.freeze(validated.trustInputs.map(item => item.contentRef)),
        driverProofRef: driverDecision.proofRef,
        trustProofRef: trustDecision.proofRef,
        prerequisiteProofRef: prerequisiteDecision.proofRef,
      }));
      assertCapability(driver, "SELECTED_DRIVER", ["run"]);
      return driver.run(selection.invocationContext);
    },
  });
}
