# V1-SLICE-2 Step 2 Entry and Implementation Authorization Decision

Decision ID: `V1-SLICE-2-STEP2-ENTRY-AUTHORIZATION-20260909-01`

Document Type: `ARCHITECTURE_OWNER_STEP_ENTRY_AND_IMPLEMENTATION_AUTHORIZATION`

Status: `OWNER_APPROVED_STEP2_IMPLEMENTATION`

Date: `2026-09-09`

## 1. Decision

The Architecture Owner accepts V1-SLICE-2 Step 1 as `PASS / CLOSED / FROZEN`
and approves entry into Step 2. Bounded implementation of
`STEP_2_CONNECTION_RECOVERY_AND_COLD_PROJECTION` is authorized but has not
started at this persistence checkpoint.

This decision does not authorize Step 3 or a real Provider run.

```text
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP1_BASELINE = FROZEN
V1_SLICE_2_STEP2_ENTRY = APPROVED
V1_SLICE_2_STEP2_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP2 = AUTHORIZED_NOT_STARTED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V1_SLICE_2_IMPLEMENTATION = IN_PROGRESS
V1_SLICE_2 = IN_PROGRESS
V1_CURRENT_STEP = V1_SLICE_2_STEP2_AUTHORIZED_NOT_STARTED
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP2_LONG_RUNNING_IMPLEMENTATION_GOAL
```
## 2. Entry basis

1. Step 1 is complete, independently reviewed by
   [REVIEW-023](../05-reviews/architecture/AUDIT-023-V1-SLICE-2-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md)
   as `PASS` with `BLOCKING_FINDINGS = NONE`, Owner-accepted, closed and frozen
   by the
   [Step 1 Owner Closure and Freeze Decision](V1-SLICE-2-STEP1-OWNER-CLOSURE-AND-FREEZE-DECISION.md).
2. The frozen Step 1 baseline supplies the detached Worker, trusted discovery,
   same-Worker reattach, fresh per-attachment credentials, generation-fencing
   foundation, Job/mutex ownership, stale-authority fail-closed behavior, no
   orphan outcome and authenticated Carrier required by Step 2.
3. The frozen
   [V1-SLICE-2 Architecture Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
   already defines Step 2 and the
   [Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
   preserves the required lifecycle and wire boundaries.

```text
NEW_ARCHITECTURE_CHALLENGE_REQUIRED = NO
NEW_SECURITY_MODEL_REQUIRED = NO
CARRIER_WIRE_CHANGE_REQUIRED = NO
FROZEN_HARNESS_CHANGE_REQUIRED = NO
```

## 3. Frozen Step 2 scope

Step 2 is limited to Connection Recovery and Cold Projection:

- Carrier loss and normal detach recovery;
- discovery, reattach and authenticated reconnect;
- creation of a new Client generation;
- stale callback and settlement rejection;
- cleanup and termination of old unary and stream work;
- read-only Workspace and Session repull;
- current Session cold projection;
- Worker crash and replacement handling; and
- truthful failure projection with no business replay.

Product `CONNECTED` is permitted only after all three predicates are true:

```text
AUTHENTICATED_CARRIER
+ CURRENT_CLIENT_GENERATION_READY
+ PROJECTION_REBUILD_COMPLETE
```

## 4. Recovery and replay boundary

```text
CONNECTION_RECOVERY != BUSINESS_REPLAY
```

Automatic recovery is limited to discovery, authentication, bounded reconnect,
read-only repull and follow/list/history rebuild. Automatic Prompt, Tool,
Agent-turn, Approval, Question or Cancel replay is forbidden. Implicit mutation
resume is also forbidden.

When a mutation response is lost, the result is `OUTCOME_UNKNOWN`. The Product
must reread Harness truth and must never blindly resend the mutation.

## 5. Worker replacement and authority

Worker replacement recovery may proceed only after proving that the old
authority is definitely gone. Step 2 must preserve the Step 1 frozen guarantees:

```text
WORKER_AUTHORITY_IDENTITY = workerInstanceId
ONE_AUTHORITY = REQUIRED
AUTHORITY_OVERLAP = ZERO
OLD_CHILD_ADOPTION = FORBIDDEN
```

Ambiguous authority remains fail closed. No replacement may become ready while
old authority ownership or death is uncertain.

## 6. Harness truth ownership

```text
WORKSPACE_TRUTH = HARNESS
SESSION_TRUTH = HARNESS
CONVERSATION_TRUTH = HARNESS
SHACO_STATE = EPHEMERAL_GENERATION_FENCED_PROJECTION
```

Step 2 must not create a Workspace, Session or Conversation database, a second
transcript, a recovery truth store or a new Control Store table.

## 7. Provider and Step 3 gates

The frozen Contract keeps the Provider Gate conditional and assigns its future
ownership to Step 2, but this decision grants no Provider execution authority.
Non-Provider implementation and validation may proceed.

If final acceptance is later found to require an active real Agent turn across
Desktop detach/crash, continued Worker execution, fresh attachment and final
result projection, implementation must stop at
`PROVIDER_GATE_AUTHORIZATION_REQUIRED` and return to the Architecture Owner.

Step 3 remains `NOT_AUTHORIZED`. Outer Sidebar, Outer New Chat, Project
Directory, Global Settings, Native Picker, Approval/Question UI integration and
final Step 3 composition are outside this authorization.

## 8. Frozen baseline preservation

The Step 1 frozen implementation, tests, Evidence, Implementation Record,
REVIEW-023 and Step 1 Owner Closure Decision remain immutable. The Main Slice 2
Contract, Carrier Amendment, Security Model, Slice 1B Contract and Frozen
Harness also remain unchanged.

The authorized Step 2 implementation must build on Product commit
`1e7c1641bad533817052535cd7ab8a306a969184` and Frozen Harness commit
`cd5ef8148158c3a752a658978873241fdf8e2bbc`.

## 9. Final authorization state

```text
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP2_ENTRY = APPROVED
V1_SLICE_2_STEP2_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP2 = AUTHORIZED_NOT_STARTED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V1_CURRENT_STEP = V1_SLICE_2_STEP2_AUTHORIZED_NOT_STARTED
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP2_LONG_RUNNING_IMPLEMENTATION_GOAL
```
