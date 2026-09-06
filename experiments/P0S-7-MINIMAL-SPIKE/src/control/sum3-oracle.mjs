// NOT_PRODUCTION — independent ED-C01 oracle; never executes the Worker calculation.
import { assertPlainRecord, assertLabel } from "./contracts.mjs";
import { reject } from "./phase-a-policy.mjs";

export const ED_C01_TASK = Object.freeze({ operation: "SUM3", values: Object.freeze([2, 3, 5]) });
export const ED_C01_EXPECTED = Object.freeze({ operation: "SUM3", count: 3, sum: 10 });

export function compareEdC01Result(result, correlationId) {
  assertLabel(correlationId, "ED_C01_CORRELATION");
  assertPlainRecord(result, ["operation", "count", "sum", "correlationId"], [], "ED_C01_RESULT");
  if (result.correlationId !== correlationId
    || result.operation !== ED_C01_EXPECTED.operation
    || result.count !== ED_C01_EXPECTED.count
    || result.sum !== ED_C01_EXPECTED.sum) {
    reject("SUM3_ORACLE_MISMATCH", "ED_C01_RESULT");
  }
  return Object.freeze({ status: "MATCH", oracle: ED_C01_EXPECTED });
}
