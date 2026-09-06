// NOT_PRODUCTION — evaluates existing authority in fixed order; never creates approval.
import {
  assertCapability, assertContentRef, assertKnownDecision, assertPlainRecord,
} from "./contracts.mjs";
import { reject } from "./phase-a-policy.mjs";

export const PREFLIGHT_ORDER = Object.freeze([
  "AUTHORITY",
  "SCOPE_APPROVAL",
  "SNAPSHOT_BINDING",
  "INPUT_BYTE_IDENTITY",
  "RUNTIME_DEFINITION",
  "ENVIRONMENT_PERMISSION_POLICY",
  "EVIDENCE_SINK_READINESS",
  "BUDGET_SINGLE_USE_SLOT",
  "LAUNCH_BOUNDARY",
]);

function validateContext(context) {
  assertPlainRecord(context, [
    "authority", "scopeApproval", "snapshotBinding", "inputIdentity",
    "runtimeDefinition", "environmentPolicy", "ledgerIdentity", "evidencePolicy",
    "launchBoundary", "caseId", "ledgerCheckerRef",
  ], [], "PREFLIGHT_CONTEXT");
  assertContentRef(context.ledgerCheckerRef, "LEDGER_CHECKER_REF");
  return context;
}

export function createPreflight({
  authorityVerifier,
  scopeApprovalVerifier,
  snapshotBindingVerifier,
  inputIdentityVerifier,
  runtimeDefinitionVerifier,
  environmentPolicyVerifier,
  ledger,
  evidenceRecorder,
  launchBoundaryVerifier,
} = {}) {
  assertCapability(authorityVerifier, "AUTHORITY_VERIFIER", ["verify"]);
  assertCapability(scopeApprovalVerifier, "SCOPE_APPROVAL_VERIFIER", ["verify"]);
  assertCapability(snapshotBindingVerifier, "SNAPSHOT_BINDING_VERIFIER", ["verify"]);
  assertCapability(inputIdentityVerifier, "INPUT_IDENTITY_VERIFIER", ["verify"]);
  assertCapability(runtimeDefinitionVerifier, "RUNTIME_DEFINITION_VERIFIER", ["verify"]);
  assertCapability(environmentPolicyVerifier, "ENVIRONMENT_POLICY_VERIFIER", ["verify"]);
  assertCapability(ledger, "SINGLE_USE_LEDGER", ["reserveOnce"]);
  assertCapability(evidenceRecorder, "EVIDENCE_RECORDER", [
    "assertReady", "recordGateDecisionAndFlush",
  ]);
  assertCapability(launchBoundaryVerifier, "LAUNCH_BOUNDARY_VERIFIER", ["verify"]);

  let used = false;

  return Object.freeze({
    async evaluate(rawContext) {
      if (used) reject("PREFLIGHT_REUSE_FORBIDDEN", "PREFLIGHT");
      used = true;
      const context = validateContext(rawContext);
      const decisions = [];

      decisions.push(["AUTHORITY", assertKnownDecision(
        await authorityVerifier.verify(context.authority, context), "AUTHORITY",
      )]);
      decisions.push(["SCOPE_APPROVAL", assertKnownDecision(
        await scopeApprovalVerifier.verify(context.scopeApproval, context), "SCOPE_APPROVAL",
      )]);
      decisions.push(["SNAPSHOT_BINDING", assertKnownDecision(
        await snapshotBindingVerifier.verify(context.snapshotBinding, context), "SNAPSHOT_BINDING",
      )]);
      decisions.push(["INPUT_BYTE_IDENTITY", assertKnownDecision(
        await inputIdentityVerifier.verify(context.inputIdentity, context), "INPUT_BYTE_IDENTITY",
      )]);
      decisions.push(["RUNTIME_DEFINITION", assertKnownDecision(
        await runtimeDefinitionVerifier.verify(context.runtimeDefinition, context), "RUNTIME_DEFINITION",
      )]);
      decisions.push(["ENVIRONMENT_PERMISSION_POLICY", assertKnownDecision(
        await environmentPolicyVerifier.verify(context.environmentPolicy, context),
        "ENVIRONMENT_PERMISSION_POLICY",
      )]);

      const readiness = assertKnownDecision(
        await evidenceRecorder.assertReady(context.evidencePolicy, context),
        "EVIDENCE_SINK_READINESS",
      );
      decisions.push(["EVIDENCE_SINK_READINESS", readiness]);

      const slot = await ledger.reserveOnce(context.ledgerIdentity);
      if (slot?.status !== "CONSUMED_NON_REFUNDABLE") {
        reject("SINGLE_USE_SLOT_NOT_DURABLE", "BUDGET_SINGLE_USE_SLOT");
      }
      assertContentRef(slot.recordRef, "BUDGET_SINGLE_USE_SLOT");
      decisions.push(["BUDGET_SINGLE_USE_SLOT", Object.freeze({
        status: "ALLOW",
        subjectRef: context.ledgerIdentity.planIdentity,
        proofRef: slot.recordRef,
        checkerRef: context.ledgerCheckerRef,
      })]);

      const launch = assertKnownDecision(
        await launchBoundaryVerifier.verify(context.launchBoundary, context), "LAUNCH_BOUNDARY",
      );
      decisions.push(["LAUNCH_BOUNDARY", launch]);

      if (decisions.length !== PREFLIGHT_ORDER.length
        || decisions.some(([gate], index) => gate !== PREFLIGHT_ORDER[index])) {
        reject("PREFLIGHT_ORDER_VIOLATION", "PREFLIGHT");
      }
      for (const [gateId, decision] of decisions) {
        const persisted = await evidenceRecorder.recordGateDecisionAndFlush({
          gateId,
          caseId: context.caseId,
          decision,
        });
        if (persisted?.status !== "DURABLE") {
          reject("EVIDENCE_NOT_DURABLE", gateId);
        }
      }
      return Object.freeze({
        status: "ALLOW",
        caseId: context.caseId,
        launchPermitRef: launch.proofRef,
        slotRecordRef: slot.recordRef,
        gateOrder: PREFLIGHT_ORDER,
      });
    },
  });
}
