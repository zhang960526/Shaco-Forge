# V1-SLICE-1 Scope Reconciliation Decision

| Field | Value |
|---|---|
| Decision ID | `V1-SLICE-1-SCOPE-RECONCILIATION-20260908-01` |
| Document Type | `OWNER_SCOPE_RECONCILIATION_DECISION` |
| Status | `OWNER_ACCEPTED_WAITING_INDEPENDENT_SLICE1_CLOSURE_AUDIT` |
| Decision Date | `2026-09-08` |
| Decision Owner | Architecture Owner |
| Product Implementation | `NO_CHANGE` |

## 1. Decision

The Architecture Owner accepts the external read-only Final Gate Assessment and
reconciles the post-1C scope allocation without closing V1-SLICE-1, starting
V1-SLICE-2, reducing the final V1.0 scope or authorizing Product implementation.

```text
V1_SLICE_1_CORE_GOAL = REAL_HARNESS_USER_LOOP
V1_SLICE_1_CORE_GOAL_RESULT = PASS
V1_SLICE_1_SCOPE_RECONCILIATION = COMPLETED
V1_SLICE_1_CLOSURE_CANDIDATE = PASS_READY_FOR_INDEPENDENT_CLOSURE_AUDIT
V1_SLICE_1_ADDITIONAL_IMPLEMENTATION_STEP = NONE
V1_SLICE_1D = DO_NOT_CREATE
V1_SLICE_1E = DO_NOT_CREATE
V1_SLICE_1 = IN_PROGRESS
```

## 2. Baseline

| Boundary | Identity / state |
|---|---|
| Product root | `D:\Project\Shaco-Forge` |
| Product branch | `master` |
| Product HEAD | `a158aff4738797abfc6d00788db72859283be079` |
| Product worktree before persistence | `CLEAN` |
| Frozen Harness root | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| Frozen Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Frozen Harness worktree | `CLEAN` |

## 3. Accepted External Assessment Identity

The accepted assessment is external Owner-supplied input, not a repository
file.

| Item | Value |
|---|---|
| Display name | `粘贴的 markdown (1)。md(20260908-072550)` |
| Bytes | `15865` |
| SHA-256 | `0316F24633FA00368104045D58B6044385270BA034222891C736BC0FAE7B74FF` |
| Assessment verdict | `V1_SLICE_1 = PASS_READY_FOR_CLOSURE` |

## 4. Completed V1-SLICE-1 Gate

The completed and frozen core Gate is:

```text
Desktop
-> Worker
-> Harness Host
-> Harness Client / AppWebEntry
-> authenticated real Client <-> Host carrier
-> configured Harness Provider/model
-> Workspace
-> Session
-> Prompt
-> Streaming
-> correlated Tool Call / Tool Result
-> Final Assistant
-> same-context rendered proof
```

| Internal step | Result |
|---|---|
| V1-SLICE-1A | `CLOSED / FROZEN` |
| V1-SLICE-1B | `CLOSED / FROZEN` |
| V1-SLICE-1C | `CLOSED / FROZEN` |

No additional Slice-1 implementation step is required. No 1D or 1E is created.

## 5. Current Implementation Route

```text
CURRENT_V1_IMPLEMENTATION_ROUTE = FOUR_SLICE_HARNESS_REUSE_ROUTE
P0_5_P1_P2_TO_P8 = NEED_DRIVEN_CONTRACT_CAPABILITY_ACCEPTANCE_TAXONOMY
P0_5_P1_P2_TO_P8 = NOT_A_SECOND_SEQUENTIAL_IMPLEMENTATION_ROUTE
```

1. `V1-SLICE-1 — REAL HARNESS USER LOOP`
2. `V1-SLICE-2 — LIFECYCLE / NATIVE / RECONNECT`
3. `V1-SLICE-3 — PACKAGING / COMPATIBILITY / RELEASE`
4. `V1-SLICE-4 — FRESH WINDOWS FINAL ACCEPTANCE`

Worker bootstrap, Harness Host bootstrap, Desktop foundation, authenticated
Carrier, real Client-to-Host communication and the real Harness user loop are
already implemented and frozen by 1A/1B/1C. They must not be reimplemented
merely because a P2/P3/P4 skeleton remains `NOT_DETAILED`.

## 6. Remaining Scope Routing

Every item in this section has `V1_SLICE_1_BLOCKER = NO`.

### 6.1 V1-SLICE-2 — Lifecycle / Native / Reconnect

- Outer `+ New Chat` real wiring.
- Project Directory real Workspace grouping.
- Project Directory real Session list/select.
- Global Settings entry real wiring.
- Native Workspace Picker.
- Approval projection.
- Question projection.
- Agent Session Cancel.
- Worker discovery.
- Worker lifecycle.
- Desktop close/crash independence.
- Desktop reconnect.
- Truthful repull/projection after reconnect.
- Worker restart.
- Cold Session resume/recovery.
- Minimal Shaco Control Store when the first real metadata write is required.
- Complete Provider/Worker failure mapping.
- V1-SLICE-1B NF-6 retry-versus-Shaco-recovery.

### 6.2 V1-SLICE-3 — Packaging / Compatibility / Release

- AUDIT-017 NF-1 always-on Evidence observer hardening.
- AUDIT-017 NF-3 artifact identity labels.
- REVIEW-012 F-05 CSP known constraint.
- Compatibility handshake.
- Bundled Worker Node.
- Bundled pinned Harness.
- Controlled `DSH_HOME`.
- Installer.
- Minimal upgrade, backup and rollback.
- Release identity and artifact hardening.

### 6.3 Carry-forward Only

AUDIT-017 NF-4 frame headroom remains non-blocking. `MAX_JSON_FRAME` stays
`262144`. No Contract amendment is authorized unless a real later load proves
that a legitimate frame must exceed the frozen cap.

### 6.4 V1-SLICE-4 — Fresh Windows Final Acceptance

Run final acceptance on fresh supported Windows without adding new Product
features.

## 7. P2 / P3 / P4 Reconciliation

```text
P2_P3_P4_REEXECUTION_REQUIRED = NO
P2_P3_P4_POLICY = NEED_DRIVEN_REUSE
```

- P2 Worker/Host bootstrap is partly implemented and frozen by 1A. Lifecycle
  and restart route to Slice 2; packaged launch routes to Slice 3.
- P3 authenticated Carrier and real Client-to-Host communication are
  implemented and frozen by 1B. Discovery and reconnect route to Slice 2;
  compatibility routes to Slice 3.
- P4 Electron Shell, Harness Client adaptation and the real chain are largely
  implemented and frozen by 1A/1C. Native Picker and outer truthful
  projection/integration route to Slice 2.

## 8. P0.5 / P1 Policy

```text
P05_FULL_COMPLETION_REQUIRED_BEFORE_SLICE1_CLOSE = NO
P1_FULL_COMPLETION_REQUIRED_BEFORE_SLICE1_CLOSE = NO
```

Only the P0.5/P1 contract required by an active Slice is frozen. Remaining
compatibility, upgrade, recovery, failure-taxonomy and cross-cutting lifecycle
work is refined need-first in Slice 2 or Slice 3.

## 9. Acceptance and Test Matrices

```text
V1_0_ACCEPTANCE_MATRIX = UMBRELLA_PROGRESSIVE_ACCEPTANCE
V1_0_TEST_MATRIX = UMBRELLA_PROGRESSIVE_TEST_PLAN
```

Their `TBD` and `NOT_STARTED` cells are not automatic Slice-1 blockers. Slice
2/3/4 progressively close them. Rows already satisfied by 1A/1B/1C must cite
the existing frozen Evidence and must not require duplicate implementation.

## 10. UI Allocation Reconciliation

The passive truthful Shaco wrapper is accepted as final for Slice 1. The final
V1.0 Sidebar Project/Session projection, New Chat wiring, Global Settings
integration, Native Picker and Approval/Question/Cancel projection remain
required and are allocated to Slice 2. The long-term UI baseline is not
replaced, and final V1.0 UI scope is not reduced.

## 11. Final State and Boundary

```text
PRODUCT_SOURCE_CHANGED = NO
FINAL_V1_0_SCOPE_REDUCED = NO
V1_SLICE_1 = IN_PROGRESS
V1_SLICE_2 = NOT_STARTED
V1_CURRENT_STEP = V1_SLICE_1_SCOPE_RECONCILED_WAITING_INDEPENDENT_CLOSURE_AUDIT
V1_CURRENT_NEXT_ACTION = INDEPENDENT_V1_SLICE_1_CLOSURE_AUDIT
```

This Decision is governance/documentation persistence only. It is not Product
implementation, Slice-1 Closure, Slice-2 Design or Independent Review.
