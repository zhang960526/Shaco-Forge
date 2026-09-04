# P0.S-6 Verification Execution Activation Decision

## 1. Decision Identity

- Decision ID: `P0S6-VERIFICATION-EXECUTION-ACTIVATION-20260904-01`
- Phase: `P0.S-6`
- Purpose: Approve preparation for one, and only one, controlled P0.S-6 Final Verification Acceptance attempt to determine whether the P0.S-6 Corrective Model is genuinely executable.
- Status: `APPROVED_FOR_SINGLE_VERIFICATION_PREPARATION`

This Decision is an activation decision for preparation. It is not an execution record, and its status is not `EXECUTED`.

## 2. Governance Preconditions

The following governance artifacts are the frozen preconditions for this Decision:

### 2.1 LICC

- Contract ID: `P0S6-LICC-20260904-01`
- Path: `docs/03-v1.0-plan/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE-CONTRACT.md`
- Byte length: `36491`
- SHA-256: `ffdc3ac247e901242c3b87e385a2399ecf5aba05074f299f64754112012f3713`
- Governance state: LICC Corrective `PASS`; LICC Corrective Re-freeze `PASS`

### 2.2 FVPC

- Contract ID: `P0S6-FVPC-20260904-01`
- Path: `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-PLANNING-CONTRACT.md`
- Byte length: `24803`
- SHA-256: `d8e12c470d1acaf2589726cef74364b9344252fa9267bdc5a9d785a09d9b991a`
- Governance state: `OWNER_APPROVED_AND_FROZEN`

### 2.3 FVEAC

- Contract ID: `P0S6-FVEAC-20260904-01`
- Path: `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-EXECUTION-AUTHORIZATION-CONTRACT.md`
- Byte length: `30768`
- SHA-256: `CAF08B1285ED7D2FF4A9DA389C9482214A6DFC2226BC7B1F54DE955C9FD5EE18`
- Governance state: `OWNER_APPROVED_AND_FROZEN`

### 2.4 FVEAR

- Contract ID: `P0S6-FVEAR-20260904-01`
- Path: `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-EXECUTION-AUTHORIZATION-RECORD.md`
- Byte length: `24954`
- SHA-256: `43760b2eb91feb64f47b4a599edd75b9998dfbae21d07d2c9a163767a74a4de5`
- Governance state: `OWNER_APPROVED_AND_FROZEN`

## 3. Scope

This Decision permits preparation for one controlled Verification only:

`P0.S-6 Final Verification Acceptance`

The single Verification is limited to validating:

- registry metadata identity;
- tarball integrity;
- corrected lockfile candidate derivation; and
- evidence generation.

No second invocation, retry, extension, or additional verification scope is authorized by this Decision.

## 4. Explicit Non-Expansion Boundary

This Decision does not include or authorize:

- Runtime;
- Electron;
- Dependency Preparation;
- `npm ci`;
- `npm install`;
- source lockfile modification;
- official lockfile promotion; or
- P0.S-7.

The scope may not expand beyond P0.S-6 Final Verification Acceptance.

## 5. Invocation Decision

- Invocation cardinality: `SINGLE_INVOCATION_ONLY`
- Invocation ID: `<NOT_ASSIGNED>`
- Start boundary: `NOT_STARTED`
- Execution Root: `NOT_CREATED`
- Runner: `NOT_CREATED`

The Invocation ID is a placeholder until a separately authorized preparation step assigns it. This Activation Decision is not the invocation itself, does not start the Verification, does not create an Execution Root, and does not create or launch a Runner.

## 6. Authority Boundary

The current authority state remains:

`P0S6_FUTURE_VERIFICATION_EXECUTION_AUTHORITY = NO`

`P0S6_FUTURE_VERIFICATION_EXECUTED = NO`

`P0S7_ALLOWED = NO`

This Decision allows entry into the final Verification preparation stage only. It does not directly open Execution Authority. Preparation under this Decision must preserve all three states above until a separate, explicit authority action changes the applicable execution state.

## 7. Result Boundary

The final Verification may produce exactly one of the following terminal results:

- `PASS`;
- `INCONCLUSIVE`;
- `INPUT_MISMATCH`; or
- `AUTHORITY_BLOCKED`.

No result automatically authorizes or triggers:

- a retry;
- a new contract;
- Dependency Preparation;
- Runtime;
- P0.S-7; or
- any expansion of P0.S-6.

Each result is terminal for this P0.S-6 final acceptance attempt and must be carried into the final P0.S-6 conclusion.

## 8. Closure Rule

The controlled Verification reserved by this Decision is the `P0.S-6 final acceptance attempt`.

After that single attempt ends with `PASS`, `INCONCLUSIVE`, `INPUT_MISMATCH`, or `AUTHORITY_BLOCKED`:

`P0.S-6 CLOSED`

P0.S-6 must not enter an infinite verification loop. No retry, replacement attempt, or further P0.S-6 expansion follows automatically or by implication.
