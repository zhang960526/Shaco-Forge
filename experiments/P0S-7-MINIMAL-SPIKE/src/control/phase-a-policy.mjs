// NOT_PRODUCTION — static Phase A source; no execution authority.
export const PHASE_A = Object.freeze({
  implementation: "APPROVED_PHASE_A_IMPLEMENTATION_ONLY",
  execution: "NOT_AUTHORIZED",
  invocationBudget: 0,
  retryBudget: 0,
  resumeBudget: 0,
  recoveryBudget: 0,
});

export class SpikeRejection extends Error {
  constructor(code, operation, blockers = []) {
    super(code);
    this.name = "SpikeRejection";
    this.code = code;
    this.operation = operation;
    this.blockers = Object.freeze([...blockers]);
  }
}

// Deliberately no boolean/configuration override or grant-minting API.
// A future independently approved execution integration must replace this lock.
export function requireExecutionPermission(operation) {
  throw new SpikeRejection("EXECUTION_NOT_AUTHORIZED", operation);
}

export function reject(code, operation, blockers = []) {
  throw new SpikeRejection(code, operation, blockers);
}

export function publicRejection(error) {
  return Object.freeze({
    accepted: false,
    code: error instanceof SpikeRejection ? error.code : "INTERNAL_REJECTION",
    operation: error instanceof SpikeRejection ? error.operation : "UNKNOWN",
    blockers: error instanceof SpikeRejection ? error.blockers : Object.freeze([]),
  });
}
