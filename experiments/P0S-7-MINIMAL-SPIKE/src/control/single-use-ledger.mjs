// NOT_PRODUCTION — append-only single-use ledger logic; creates no ledger on import.
import {
  assertCapability, assertContentRef, assertLabel, assertPlainRecord, immutableCopy,
} from "./contracts.mjs";
import { reject } from "./phase-a-policy.mjs";

export const LEDGER_RECORD_TYPE = "SHACO_SPIKE_SINGLE_USE_LEDGER_V1";

function validateIdentity(input) {
  assertPlainRecord(input, [
    "planIdentity", "invocationIdentity", "caseId", "authorizationRef", "consumedAtUtc",
  ], [], "LEDGER_IDENTITY");
  assertContentRef(input.planIdentity, "PLAN_IDENTITY");
  assertLabel(input.invocationIdentity, "INVOCATION_IDENTITY");
  assertLabel(input.caseId, "CASE_ID");
  assertContentRef(input.authorizationRef, "AUTHORIZATION_REF");
  if (typeof input.consumedAtUtc !== "string" || input.consumedAtUtc.length > 64) {
    reject("INVALID_TRUSTED_TIME", "LEDGER_CONSUMED_AT");
  }
  return input;
}

function assertReadResult(result, identity) {
  assertPlainRecord(result, ["status", "version", "records"], [], "LEDGER_READ");
  if (result.status !== "KNOWN" || !Number.isSafeInteger(result.version) || result.version < 0
    || !Array.isArray(result.records)) {
    reject("LEDGER_STATE_UNKNOWN", "LEDGER_READ", [identity.planIdentity]);
  }
  if (result.records.some(record => record?.planIdentity === identity.planIdentity
    || record?.invocationIdentity === identity.invocationIdentity)) {
    reject("SINGLE_USE_SLOT_ALREADY_CONSUMED", "LEDGER_RESERVE", [identity.planIdentity]);
  }
  return result;
}

export function createSingleUseLedger({ journal } = {}) {
  assertCapability(journal, "APPEND_ONLY_LEDGER_JOURNAL", [
    "readStable", "appendIfVersion", "flush", "readBack",
  ]);
  let uncertain = false;

  return Object.freeze({
    async reserveOnce(rawIdentity) {
      if (uncertain) reject("LEDGER_STATE_UNKNOWN", "LEDGER_RESERVE");
      const identity = validateIdentity(rawIdentity);
      const before = assertReadResult(await journal.readStable(), identity);
      const record = immutableCopy({
        recordType: LEDGER_RECORD_TYPE,
        state: "CONSUMED_NON_REFUNDABLE",
        planIdentity: identity.planIdentity,
        invocationIdentity: identity.invocationIdentity,
        caseId: identity.caseId,
        authorizationRef: identity.authorizationRef,
        consumedAtUtc: identity.consumedAtUtc,
        retry: "FORBIDDEN",
        resume: "FORBIDDEN",
        reuse: "FORBIDDEN",
      });

      let appendResult;
      try {
        appendResult = await journal.appendIfVersion({
          expectedVersion: before.version,
          record,
        });
      } catch {
        uncertain = true;
        reject("LEDGER_APPEND_OUTCOME_UNKNOWN", "LEDGER_RESERVE", [identity.planIdentity]);
      }
      if (appendResult?.status !== "APPENDED" || appendResult.version !== before.version + 1
        || typeof appendResult.recordRef !== "string") {
        uncertain = appendResult?.status !== "CONFLICT";
        reject(
          uncertain ? "LEDGER_APPEND_OUTCOME_UNKNOWN" : "SINGLE_USE_SLOT_CONFLICT",
          "LEDGER_RESERVE",
          [identity.planIdentity],
        );
      }
      assertContentRef(appendResult.recordRef, "LEDGER_RECORD_REF");
      try {
        const flushResult = await journal.flush(appendResult.version);
        if (flushResult?.status !== "DURABLE") throw new Error("NOT_DURABLE");
        const readBack = await journal.readBack(appendResult.version);
        if (readBack?.status !== "KNOWN" || readBack.record?.planIdentity !== identity.planIdentity
          || readBack.record?.invocationIdentity !== identity.invocationIdentity
          || readBack.record?.state !== "CONSUMED_NON_REFUNDABLE") {
          throw new Error("READBACK_MISMATCH");
        }
      } catch {
        uncertain = true;
        reject("LEDGER_DURABILITY_UNKNOWN", "LEDGER_RESERVE", [identity.planIdentity]);
      }
      return Object.freeze({
        status: "CONSUMED_NON_REFUNDABLE",
        version: appendResult.version,
        recordRef: appendResult.recordRef,
        planIdentity: identity.planIdentity,
        invocationIdentity: identity.invocationIdentity,
      });
    },

    status() {
      return Object.freeze({ state: uncertain ? "UNKNOWN_NO_REUSE" : "READY_UNCONSUMED_UNKNOWN_PLAN" });
    },
  });
}
