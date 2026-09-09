# V1-SLICE-2 Step 2 Shared Source Extension Scope Clarification Decision

Decision ID: `V1-SLICE-2-STEP2-SHARED-SOURCE-EXTENSION-CLARIFICATION-20260909-01`

Document Type: `ARCHITECTURE_OWNER_EXECUTION_SCOPE_CLARIFICATION`

Status: `OWNER_CLARIFIED_STEP2_SHARED_SOURCE_EXTENSION`

Date: `2026-09-09`

## 1. Decision

The Architecture Owner clarifies the execution meaning of the
[Step 2 Entry and Implementation Authorization Decision](V1-SLICE-2-STEP2-ENTRY-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md).
Step 1 historical acceptance remains frozen, but Product source shared by Step
1 and a later formally authorized Step is not permanently byte-immutable.

```text
STEP1_ACCEPTANCE_BASELINE = FROZEN
STEP1_CAPABILITY_CONTRACT = MUST_NOT_REGRESS
STEP1_REOPEN_REQUIRED = NO
STEP1_ADDITIONAL_IMPLEMENTATION_AUTHORIZATION = NONE
SHARED_PRODUCT_SOURCE_BYTES_ACROSS_LATER_AUTHORIZED_STEPS = MAY_CHANGE
V1_SLICE_2_STEP2_SHARED_PRODUCT_SOURCE_EXTENSION = AUTHORIZED
LATER_STEP_SHARED_SOURCE_CHANGE_REQUIRES_CUMULATIVE_REGRESSION = YES
```

This is not a Step 1 reopen, a new Step 1 implementation authority or a Step 2
scope expansion. It resolves only the execution ambiguity between historical
acceptance immutability and later shared-source evolution.

## 2. Step 1 acceptance and capability semantics

Step 1 remains `PASS / CLOSED / FROZEN`. Its historical acceptance facts are
not reopened, and no additional Step 1 implementation is authorized. The
frozen capability contract remains mandatory and must not regress.

```text
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
STEP1_ACCEPTANCE_BASELINE = FROZEN
STEP1_CAPABILITY_CONTRACT = MUST_NOT_REGRESS
STEP1_REOPEN_REQUIRED = NO
STEP1_ADDITIONAL_IMPLEMENTATION_AUTHORIZATION = NONE
STEP1_CAPABILITY_REGRESSION = FORBIDDEN
```

`FROZEN` therefore means a frozen capability and acceptance baseline. It does
not mean that every Product source byte that existed during Step 1 is forbidden
from evolving in every later authorized Step.

## 3. Byte-immutable Step 1 historical assets

The following Step 1 historical assets remain strictly `BYTE_IMMUTABLE`:

- both formal Evidence roots, `STEP1-20260909-IMPLEMENTATION-01` and
  `STEP1-20260909-G15-CORRECTIVE-01`;
- the Step 1 Implementation Record,
  `V1-SLICE-2-STEP1-WORKER-AUTHORITY-TRUSTED-DISCOVERY-IMPLEMENTATION-RECORD.md`;
- [REVIEW-023](../05-reviews/architecture/AUDIT-023-V1-SLICE-2-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md);
- the [Step 1 Owner Closure and Freeze Decision](V1-SLICE-2-STEP1-OWNER-CLOSURE-AND-FREEZE-DECISION.md);
- the prior Step 1 Blocked Record;
- Step 1 historical probe Evidence; and
- Step 1 frozen review artifacts.

Step 2 must not rewrite, regenerate, normalize or replace these historical
assets.

```text
STEP1_HISTORICAL_ARTIFACTS = BYTE_IMMUTABLE
STEP1_HISTORICAL_EVIDENCE_REWRITE = FORBIDDEN
STEP1_HISTORICAL_REVIEW_OR_CLOSURE_REWRITE = FORBIDDEN
```

## 4. Shared Product source evolution

Product modules that existed during Step 1 are not permanently byte-immutable
when they are shared implementation seams reasonably required by a later
authorized Step. This includes, without limiting the rule to these examples:

- `apps/desktop/src/main/main.ts`;
- `apps/desktop/src/main/carrier-client.ts`;
- `apps/desktop/src/main/worker-supervisor.ts`;
- `apps/desktop/src/main/lifecycle-client.ts`;
- `apps/worker/**`; and
- other shared Product implementation that Step 2 reasonably depends on.

Step 2 may modify such files only when all of the following are true:

1. the change is genuinely required by the currently authorized Step 2 scope;
2. it does not change the frozen Architecture, Security or Carrier Contract;
3. it does not covertly reimplement the completed Step 1; and
4. cumulative regression proves that the prior Step 1 capability still holds.

```text
SHARED_PRODUCT_SOURCE_BYTES_ACROSS_LATER_AUTHORIZED_STEPS = MAY_CHANGE
V1_SLICE_2_STEP2_SHARED_PRODUCT_SOURCE_EXTENSION = AUTHORIZED
STEP1_CAPABILITY_REGRESSION = FORBIDDEN
```

## 5. Step 1 regression-test protection

Historical Step 1 Evidence remains immutable. Existing Step 1 regression tests
must not be deleted, disabled, skipped, weakened, or bypassed by changing a
fixture so that an old Gate no longer exercises its accepted capability.

Necessary structural adjustment for shared API evolution, additional Step 2
coverage, stronger assertions and test-helper refactoring are allowed only when
the old Step 1 capability retains equivalent or stronger automated validation.

```text
STEP1_TEST_WEAKENING = FORBIDDEN
STEP1_REGRESSION_COVERAGE_REMOVAL = FORBIDDEN
```

## 6. Authorized Step 2 source-mutation scope

The shared Product source extension authority is bounded by the already-frozen
Step 2 scope:

- Connection Recovery;
- Cold Projection;
- Client-generation fencing;
- read-only Workspace and Session repull;
- Worker replacement recovery;
- truthful failure projection; and
- no business replay.

This clarification does not authorize Step 3 UI, Automation, Multi-Agent,
Provider framework, Memory/RAG/Learning, a second Workspace/Session truth,
Broker, Windows Service or a new Agent RPC.

Harness remains the Workspace, Session and Conversation truth owner. Automatic
Prompt, Tool, Agent-turn, Approval, Question, Cancel or implicit mutation replay
remains forbidden.

## 7. Frozen Contract and security preservation

This clarification does not modify the
[Main Slice 2 Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md),
[Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md),
[Security Model](../02-architecture/SHACO-FORGE-SECURITY-MODEL.md), Slice 1B
Contract or Frozen Harness.

```text
V1_SLICE_2_ARCHITECTURE_CONTRACT = FROZEN
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = FROZEN
WIRE_HMAC_CHANGED = NO
V1_LOCAL_TRUST_PRINCIPAL = CURRENT_WINDOWS_USER_SID
FROZEN_HARNESS_CHANGE = NO
```

## 8. Cumulative regression requirement

The normative model is:

```text
frozen capability / acceptance baseline
+ later authorized source evolution
+ mandatory cumulative regression
= future Step Closure
```

Therefore:

```text
FROZEN_BASELINE != ALL_SOURCE_BYTES_FOREVER_IMMUTABLE
LATER_STEP_SHARED_SOURCE_CHANGE_REQUIRES_CUMULATIVE_REGRESSION = YES
CLOSURE_AFTER_SHARED_SOURCE_CHANGE_WITHOUT_PRIOR_STEP_REGRESSION_PASS = FORBIDDEN
```

Step 2 Closure must prove `STEP1_REGRESSION = PASS` through the
`CUMULATIVE_NON_PROVIDER_E2E` required by the frozen
[V1 Cumulative Regression Closure Gate](../00-governance/SHACO-FORGE-V1-CUMULATIVE-REGRESSION-CLOSURE-GATE.md).
It may not merely assume that Step 1 still works or cite historical Step 1
Evidence as though the current Closure reran reproducible capability.

## 9. Preserved authorization state

```text
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP2_ENTRY = APPROVED
V1_SLICE_2_STEP2_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP2 = AUTHORIZED_NOT_STARTED
V1_SLICE_2_STEP2_SHARED_PRODUCT_SOURCE_EXTENSION = AUTHORIZED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V1_CUMULATIVE_CLOSURE_REGRESSION_GATE = FROZEN
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP2_LONG_RUNNING_IMPLEMENTATION_GOAL
```

No Runtime, Provider or Step 2 implementation is performed by this
clarification.
