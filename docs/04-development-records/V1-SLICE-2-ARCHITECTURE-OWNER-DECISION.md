# V1-SLICE-2 Architecture Owner Decision

| Field | Value |
|---|---|
| Decision ID | `V1-SLICE-2-ARCHITECTURE-OWNER-20260908-01` |
| Document Type | `ARCHITECTURE_OWNER_DECISION` |
| Status | `OWNER_ACCEPTED_FOR_CONTRACT_PERSISTENCE_WAITING_TARGETED_DELTA_REVIEW` |
| Date | `2026-09-08` |

## 1. Decision

The Architecture Owner accepts Corrective V2 and its Independent Corrective V2
Re-Review as sufficient inputs for repository Contract persistence.

```text
OWNER_ACCEPTS_CORRECTIVE_V2 = YES
OWNER_ACCEPTS_INDEPENDENT_V2_REREVIEW = YES
SLICE2_ARCHITECTURE_BLOCKING_FINDINGS = NONE
SLICE2_ARCHITECTURE_CONTRACT_PERSISTENCE = AUTHORIZED
SLICE2_IMPLEMENTATION_AUTHORIZATION = NO
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
NEXT_ACTION = INDEPENDENT_V1_SLICE_2_CONTRACT_TARGETED_DELTA_REVIEW
```

The persistence authority creates the [main Architecture Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md),
the [Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
and [AUDIT-019](../05-reviews/architecture/AUDIT-019-V1-SLICE-2-CORRECTIVE-V2-ARCHITECTURE-REREVIEW.md),
then synchronizes the prescribed governance indexes. It does not start Step 1,
create an implementation prompt, authorize Product changes or run a Provider.

## 2. Accepted architecture boundary

The Owner accepts the following three-step candidate route and no additional
step:

1. Worker Authority and Trusted Discovery.
2. Connection Recovery and Cold Projection.
3. Outer Shell / Native / Interaction Integration.

The Carrier Lifecycle Amendment is a Step 1 Contract prerequisite. Its
credential semantics change is accepted only with the explicit preservation:

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED = YES
CREDENTIAL_SEMANTIC_AMENDMENT = YES
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
```

The Owner accepts the Corrective V2 resolution of the four prior Blocking
Findings:

```text
B1 = CLOSED
B2 = CLOSED
B3 = CLOSED
B4 = CLOSED
BLOCKING_FINDINGS = NONE
```

## 3. Non-blocking findings

AUDIT-019's seven non-blocking findings are accepted with their recorded
dispositions:

- `NF-S2-1` through `NF-S2-6` are incorporated into the Contract/Amendment as
  mandatory future implementation Gate obligations.
- `NF-S2-7` is satisfied by replacing the external chain as operational
  authority with these repository documents.

They are not represented as fully closed.

## 4. Scope protection

The Owner expressly preserves:

- Harness ownership of Provider, Model, Credential, Workspace, Session,
  Conversation, Tool, Permission, Approval and Question truth.
- Frozen Harness and frozen Slice 1B wire/security semantics.
- Final V1.0 Outer Sidebar, New Chat, Project Directory and Global Settings
  requirements.
- No business replay, no second Workspace/Session truth, no Dynamic Cordis and
  no generic Renderer filesystem capability.
- Packaging, final controlled `DSH_HOME`, installer/update/rollback and Fresh
  Windows acceptance in their later Slice boundaries.

No future bundle hash is asserted by this decision. The Shaco row identity and
bundle hash remain `TO_BE_FROZEN_BEFORE_STEP3_IMPLEMENTATION`.

## 5. Required next review

The next and only authorized action is an independent targeted delta review of
the persisted Contract plus Amendment against Corrective V2 plus AUDIT-019. It
must check scope drift, security drift, UI reduction, finding omission and
wire-contract mutation.

Until that review and a separate later Owner decision:

```text
V1_SLICE_2_ARCHITECTURE = CONTRACT_PERSISTED_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = PERSISTED_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_2_ARCHITECTURE_REREVIEW = PASS
V1_SLICE_2_ARCHITECTURE_BLOCKING_FINDINGS = NONE
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_IMPLEMENTATION_AUTHORIZATION = NO
V1_SLICE_2 = NOT_STARTED
V1_CURRENT_STEP = V1_SLICE_2_ARCHITECTURE_CONTRACT_PERSISTED_WAITING_TARGETED_DELTA_REVIEW
V1_CURRENT_NEXT_ACTION = INDEPENDENT_V1_SLICE_2_CONTRACT_TARGETED_DELTA_REVIEW
```
