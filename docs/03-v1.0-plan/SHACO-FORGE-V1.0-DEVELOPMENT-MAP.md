# Shaco Forge V1.0 Development Map

Status: ACTIVE

> Latest authority (2026-09-10): [Step3 Contract Gate Freeze / Implementation Authorization Decision](../04-development-records/V1-SLICE-2-STEP3-CONTRACT-GATE-FREEZE-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md).
> Step1 and Step2 remain `PASS / CLOSED / FROZEN`; Step2 Owner Closure is `ACCEPTED` and implementation authorization is `CONSUMED`.
> Historical [REVIEW-025](../05-reviews/architecture/AUDIT-025-V1-SLICE-2-STEP3-CONTRACT-GATE-INDEPENDENT-REVIEW.md) remains `FAIL`; its sole HIGH / BLOCKING finding was `R25-01_PUBLIC_INTERACTION_EVENT_ID_NOT_PUBLIC`.
> R25-01 corrective was accepted by [REVIEW-025B PASS](../05-reviews/architecture/AUDIT-025B-V1-SLICE-2-STEP3-CONTRACT-GATE-CORRECTIVE-REREVIEW.md); R25-01 is `CLOSED_BY_CORRECTIVE_REREVIEW`; final Contract Gate Blocking Findings are `NONE`.
> The [Step3 Contract Gate](V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-CONTRACT-GATE.md) is `FROZEN`; final Contract Review is `REVIEW-025B PASS`; Step3 Entry is `APPROVED`.
> Composition timing is accepted as `PASS_CLARIFICATION`; Contract amendment and Frozen Harness baseline change are `NO`.
> V1 creates no Outer Approval/Question pending projection; Harness Main Workspace retains the complete primary Approval/Question UI.
> Gateway internal `frame.eventId` and pending-local-key substitution remain forbidden Product API dependencies.
> Step3 implementation authorization is `YES`; Step3 is `AUTHORIZED_NOT_STARTED`; authorization != implementation started.
> Provider authorization remains `NO`; Slice2 remains `IN_PROGRESS`. This operation records governance only.
> Current Step: `V1_SLICE_2_STEP3_AUTHORIZED_NOT_STARTED`.
> Next: `EXECUTE_V1_SLICE_2_STEP3_LONG_RUNNING_IMPLEMENTATION_GOAL`.

> Historical / Superseded pre-REVIEW-024C route summary (2026-09-10): Step 1 and `STEP1_REGRESSION` are `PASS`;
> Step 1 is `PASS / CLOSED / FROZEN`. Step 2 implementation, Final Validation
> Corrective, S2G01-S2G20, and cumulative Step 1 + Step 2 non-Provider E2E are
> `PASS`; Step 2 remains `IMPLEMENTED_WAITING_INDEPENDENT_REVIEW` and is not
> closed or frozen. REVIEW-024 is `FAIL` solely for the R24-01 governance
> contradiction; REVIEW-024B confirmed the R24-01 Current State corrective.
> REVIEW-024B remains `FAIL` solely for R24B-01
> (`DOCUMENT_MAP_STATE_CONTRADICTION`); its corrective is
> `APPLIED_WAITING_REREVIEW`. Step 3 is `NOT_AUTHORIZED`, Provider authorization
> is `NO`, and the next action is
> `INDEPENDENT_REREVIEW_V1_SLICE_2_STEP2_REVIEW_024B_CORRECTIVE`.

> Latest execution-scope clarification is the
> [Step 2 Shared Source Extension Scope Clarification Decision](../04-development-records/V1-SLICE-2-STEP2-SHARED-SOURCE-EXTENSION-SCOPE-CLARIFICATION-DECISION.md).
> Step 1 remains `PASS / CLOSED / FROZEN`: its acceptance baseline and
> capability contract are frozen, and its historical Evidence/Review/Closure
> assets remain byte-immutable. That state does not make shared Product source
> bytes permanently immutable. A later formally authorized Step may evolve
> shared Product source within its frozen scope, and must prove prior capability
> through cumulative regression before Closure.

> Historical Step 2 entry checkpoint (2026-09-09): the
> [V1-SLICE-2 Step 2 Entry and Implementation Authorization Decision](../04-development-records/V1-SLICE-2-STEP2-ENTRY-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md),
> which accepted the frozen Step 1 closure baseline and approved Step 2 entry.
> Slice 1A/1B/1C and Slice 1 remain `PASS / CLOSED / FROZEN`. The
> [V1-SLICE-2 Architecture Contract](V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
> and [Carrier Lifecycle Amendment](V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
> remain frozen. At that historical checkpoint, Step 2 was
> `AUTHORIZED_NOT_STARTED`, and the historical next action was
> `EXECUTE_V1_SLICE_2_STEP2_LONG_RUNNING_IMPLEMENTATION_GOAL`. Step 3 and Provider
> were unauthorized. The
> implementation mainline remains
> `MINIMAL_HARNESS_DESKTOP_PRODUCTIZATION`.
> The frozen
> [V1 Cumulative Regression Closure Gate](../00-governance/SHACO-FORGE-V1-CUMULATIVE-REGRESSION-CLOSURE-GATE.md)
> governs every subsequent V1 Step and Slice Closure, beginning with Step 2.

## Current Implementation Route

```text
CURRENT_IMPLEMENTATION_ROUTE = FOUR_SLICE_HARNESS_REUSE_ROUTE
V1_0_MAINLINE = MINIMAL_HARNESS_DESKTOP_PRODUCTIZATION
V1_1_TO_V1_3 = PRESERVE_SEAMS_ONLY
V1_SLICE_1 = PASS / CLOSED / FROZEN
V1_SLICE_1A_1B_1C = CLOSED / FROZEN
V1_SLICE_1_SCOPE_RECONCILIATION = COMPLETED
V1_SLICE_1_INDEPENDENT_CLOSURE_AUDIT = PASS
V1_SLICE_1_OWNER_CLOSURE = ACCEPTED
V1_SLICE_1_ADDITIONAL_IMPLEMENTATION = NONE
V1_SLICE_2_ARCHITECTURE_CONTRACT = FROZEN
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = FROZEN
V1_SLICE_2_ARCHITECTURE_REREVIEW = PASS
V1_SLICE_2_CONTRACT_TARGETED_DELTA_REREVIEW = PASS
V1_SLICE_2_CONTRACT_BLOCKING_FINDINGS = NONE
V1_SLICE_2_MINIMAL_TRUSTED_DISCOVERY_CORRECTIVE_REVIEW = PASS
V1_SLICE_2_MINIMAL_TRUSTED_DISCOVERY_PERSISTED_DELTA_REVIEW = PASS
V1_SLICE_2_MINIMAL_TRUSTED_DISCOVERY_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP1_INDEPENDENT_IMPLEMENTATION_REVIEW = PASS
V1_SLICE_2_STEP1_IMPLEMENTATION_REVIEW_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP1_OWNER_CLOSURE = ACCEPTED
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = CONSUMED
V1_SLICE_2_STEP1_ADDITIONAL_IMPLEMENTATION = NONE
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP1_RESULT = PASS
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = PASS
V1_SLICE_2_STEP1_BASELINE = FROZEN
STEP1_REGRESSION = PASS
V1_SLICE_2_STEP2_SHARED_PRODUCT_SOURCE_EXTENSION = CONSUMED
STEP1_ACCEPTANCE_BASELINE = FROZEN
STEP1_CAPABILITY_CONTRACT = MUST_NOT_REGRESS
STEP1_HISTORICAL_ARTIFACTS = BYTE_IMMUTABLE
LATER_STEP_SHARED_SOURCE_CHANGE_REQUIRES_CUMULATIVE_REGRESSION = YES
V1_CUMULATIVE_CLOSURE_REGRESSION_GATE = FROZEN
CUMULATIVE_CLOSURE_REGRESSION_REQUIRED = YES
STEP2_CUMULATIVE_CLOSURE_REGRESSION_REQUIRED = YES
V1_SLICE_2_STEP2_ENTRY = APPROVED
V1_SLICE_2_STEP2_IMPLEMENTATION_AUTHORIZATION = CONSUMED
V1_SLICE_2_IMPLEMENTATION = IN_PROGRESS
V1_SLICE_2_STEP2 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP2_IMPLEMENTATION_RESULT = PASS
STEP2_FINAL_VALIDATION_CORRECTIVE = PASS
V1_SLICE_2_STEP2_DEDICATED_GATES = PASS
V1_SLICE_2_STEP2_CUMULATIVE_NON_PROVIDER_E2E = PASS
V1_SLICE_2_STEP2_REVIEW_024 = FAIL
V1_SLICE_2_STEP2_REVIEW_024_R24_01 = CLOSED_BY_CORRECTIVE_REVIEW_CHAIN
V1_SLICE_2_STEP2_REVIEW_024B = FAIL
HISTORICAL_V1_SLICE_2_STEP2_REVIEW_024B_BLOCKING_FINDINGS = R24B-01_DOCUMENT_MAP_STATE_CONTRADICTION
V1_SLICE_2_STEP2_REVIEW_024B_CORRECTIVE = CLOSED_BY_CORRECTIVE_REREVIEW
PREVIOUS_IMPLEMENTATION_VERDICT = STOPPED_BLOCKED
PREVIOUS_MINOR_BUDGET = 3/3 EXHAUSTED
PREVIOUS_MAJOR_BUDGET = 3/4 USED
STEP3_ENTRY_ASSESSMENT = READY_FOR_CONTRACT_GATE_PERSISTENCE
STEP3_ENTRY_BLOCKER = NONE
CONTRACT_AMENDMENT_REQUIRED = NO
CONTRACT_AMENDMENT_INTERPRETATION_STATUS = CONFIRMED_BY_REVIEW_025B
V1_SLICE_2_STEP3_ENTRY = APPROVED
V1_SLICE_2_STEP3_REVIEW_025 = FAIL
V1_SLICE_2_STEP3_REVIEW_025_BLOCKING_FINDINGS = R25-01_PUBLIC_INTERACTION_EVENT_ID_NOT_PUBLIC
V1_SLICE_2_STEP3_REVIEW_025_R25_01 = CLOSED_BY_CORRECTIVE_REREVIEW
V1_SLICE_2_STEP3_R25_01_CORRECTIVE = CLOSED_BY_REVIEW_025B
V1_SLICE_2_STEP3_R25_01 = CLOSED_BY_CORRECTIVE_REREVIEW
V1_SLICE_2_STEP3_REVIEW_025B = PASS
V1_SLICE_2_STEP3_CONTRACT_GATE = FROZEN
V1_SLICE_2_STEP3_CONTRACT_GATE_FINAL_REVIEW = REVIEW-025B_PASS
V1_SLICE_2_STEP3_CONTRACT_GATE_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP3_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP3 = AUTHORIZED_NOT_STARTED
PROVIDER_GATE_AUTHORIZATION = NO
V1_SLICE_2 = IN_PROGRESS
V1_SLICE_3 = PACKAGING / COMPATIBILITY / RELEASE / NOT_STARTED
V1_SLICE_4 = FRESH_WINDOWS_FINAL_ACCEPTANCE / NOT_STARTED
P0_5_P1_P2_TO_P8 = NEED_DRIVEN_CONTRACT_CAPABILITY_ACCEPTANCE_TAXONOMY
P0_5_P1_P2_TO_P8 = NOT_A_SECOND_SEQUENTIAL_IMPLEMENTATION_ROUTE
V1_CURRENT_STEP = V1_SLICE_2_STEP3_AUTHORIZED_NOT_STARTED
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP3_LONG_RUNNING_IMPLEMENTATION_GOAL
V1_SLICE_2_STEP2_REVIEW_024C = PASS
V1_SLICE_2_STEP2_REVIEW_024B_R24B_01 = CLOSED_BY_CORRECTIVE_REREVIEW
V1_SLICE_2_STEP2_FINAL_INDEPENDENT_REVIEW = PASS
V1_SLICE_2_STEP2_REVIEW_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP2_OWNER_CLOSURE = ACCEPTED
V1_SLICE_2_STEP2_ADDITIONAL_IMPLEMENTATION = NONE
V1_SLICE_2_STEP2_RESULT = PASS
V1_SLICE_2_STEP2_BASELINE = FROZEN
ACTIVE_CURRENT_AUTHORITY_COUNT = ONE
```

The four Slice route is the current implementation route. P0.5/P1/P2-P8 retain
their contract, capability and acceptance meaning and are consumed need-first
by the active Slice. They do not authorize sequential reimplementation of
Worker bootstrap, Harness Host bootstrap, Desktop foundation, authenticated
Carrier, real Client-to-Host communication or the real Harness user loop
already completed and frozen by 1A/1B/1C.

The Slice 2 implementation route remains exactly three steps:

1. Worker Authority and Trusted Discovery.
2. Connection Recovery and Cold Projection.
3. Outer Shell / Native / Interaction Integration.

The Carrier Lifecycle Amendment remains a frozen Step 1 Contract prerequisite.
The minimal trusted-discovery Corrective Review, persisted delta review and
Independent Implementation Review are `PASS`; Blocking Findings are `NONE`;
overdesign remains closed. The generic Electron identity probe remains a
historical diagnostic scenario, not a frozen V1 runtime gate. Broker,
asymmetric authority protocol, Product Launch Grant and Windows Service are not
V1 requirements. Step 1 implementation is `PASS`, Owner Closure is `ACCEPTED`,
and Step 1 is `PASS / CLOSED / FROZEN`. Step 2 entry is `APPROVED`; its bounded
Connection Recovery and Cold Projection implementation, Final Validation
Corrective, S2G01-S2G20, and cumulative Step 1 + Step 2 non-Provider E2E are
`PASS`. Historical REVIEW-024 `FAIL` / R24-01 was followed by corrective work, REVIEW-024B `FAIL` / R24B-01, cross-document corrective work, and REVIEW-024C `PASS`. Both findings are closed; final Blocking Findings are `NONE`. Owner Closure is `ACCEPTED`; Step2 is `PASS / CLOSED / FROZEN`. Step3 Entry is `APPROVED`; the Step3 Contract Gate is `FROZEN` following historical REVIEW-025 FAIL, R25-01 corrective and REVIEW-025B PASS. R25-01 is closed; final Contract Gate Blocking Findings are `NONE`. Step3 implementation authorization is `YES`; Step3 is `AUTHORIZED_NOT_STARTED`; authorization != implementation started. Next is `EXECUTE_V1_SLICE_2_STEP3_LONG_RUNNING_IMPLEMENTATION_GOAL`. Provider remains `NO`. The Owner Freeze operation performs governance only and stops after its single commit.

> Historical stopped implementation checkpoint (2026-09-10): the required
> `SHACO_FORGE_POWERSHELL` fixture value was missing and reached
> `spawn(undefined)`, producing `STOPPED_BLOCKED`. Minor corrective budget was
> `3/3 EXHAUSTED` and Major corrective budget was `3/4 USED`. This remains a
> truthful previous result and is not the current Step 2 implementation result.

Step 1 `CLOSED / FROZEN` is a capability and acceptance freeze, not a permanent
ban on changing source bytes shared with a later authorized Step. The consumed Step2 authorization permitted
shared Product source extension only for Connection Recovery, Cold Projection,
generation fencing, read-only Workspace/Session repull, Worker replacement
recovery and truthful no-business-replay failure projection. Such evolution
must preserve the frozen Architecture/Security/Carrier contracts, must not
reimplement Step 1, and requires `STEP1_REGRESSION = PASS` through cumulative
non-Provider E2E before Step2 Closure; this requirement is now accepted as PASS. Additional Step2 implementation is NONE.

## Phase Order

```text
P0   Upstream Baseline & Product Capability Audit
 -> P0.S Desktop / Connection / Packaging Feasibility Spike
 -> P0.5 Compatibility & Version Contract
 -> P1 System Architecture & Contract Freeze
 -> P2 Host-only Worker
 -> P3 Connection Carrier & Worker Supervision
 -> P4 Desktop Shell & Harness Client Adaptation
 -> P5 Core Feature Parity
 -> P6A Durability & Recovery
 -> P6B Limited Plugin Compatibility
 -> P7 Packaging / Security / Upgrade / Operability
 -> P8 Fresh Final Acceptance
```

## P0

Status: CLOSED (`SHACO_FORGE_V1_0_P0 = PASS`)

Steps:

- P0-1 Upstream Baseline Freeze — PASS / CLOSED
- P0-2 Web + Standard Preset Composition Census — PASS / CLOSED
- P0-3 Client↔Host Contract Census — PASS / CLOSED
- P0-4 Authentication / Trust Surface Audit — PASS / CLOSED
- P0-5 Core Feature Parity Matrix — PASS / CLOSED
- P0-6 Dependency & Stability Matrix — PASS / CLOSED
- P0-7 Risk Register & P0.S Input Freeze — PASS / CLOSED

Frozen Harness baseline: `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`dsh@0.1.2-alpha.1`). See `docs/06-testing-acceptance/evidence/P0-1-HARNESS-BASELINE-MANIFEST.md`.

Risk / Spike input freeze: `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`.

P0 PASS did not by itself authorize P0.S. AUDIT-004B Independent Corrective Re-Review = `PASS`. `P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. Historical P0.S-6 records preserve that `P0S6-MEC-20260903-01` exhausted two physical attempts without reaching Runtime and `P0S6-DRRC-20260904-01` exhausted its sole Dependency Preparation invocation at `NPM_CI / EINTEGRITY`; at that recording boundary P0.S-6 was blocked and P0.S-7 was unauthorized. Later authority closes P0.S-6 as `VERIFIED_WITH_CANDIDATE`, closes reassessed P0.S-7 as `CONTROLLED_AGENT_EXECUTION_ARCHITECTURE_VALIDATED`, and closes P0.S-8/P0.S after the sufficient V1 Product Architecture Freeze. At the historical P0 closure checkpoint, V1 implementation was ready but not started.

## P0.S

Status: CLOSED / PASS (`SHACO_FORGE_V1_0_P0S = PASS`; `P0S = CLOSED`)

Steps:

- P0.S-1 Host Profile Feasibility — PASS / CLOSED; Owner-accepted `PROVEN_WITH_CONSTRAINT`
- P0.S-2 Electron Client Boot — PASS / CLOSED; Owner-accepted `PROVEN_WITH_CONSTRAINT`
- P0.S-3 Local Carrier + Trust — PASS / CLOSED; Owner-accepted `PROVEN_WITH_CONSTRAINT`
- P0.S-4 Connection Feature Completeness — PASS / CLOSED; Owner-accepted `MET_WITH_CONSTRAINT`
- P0.S-5 Desktop Independence & Reconnect — PASS / CLOSED; Owner-accepted `MET_WITH_CONSTRAINT`
- P0.S-6 Client Module / Plugin Frontend — CLOSED; latest result `VERIFIED_WITH_CANDIDATE`; historical Runtime Gate and H-05/H-20 limitations remain preserved
- P0.S-7 Controlled Agent Execution Architecture Validation — CLOSED; `CONTROLLED_AGENT_EXECUTION_ARCHITECTURE_VALIDATED`; product Runtime not executed; Enterprise Runtime deferred
- P0.S-8 V1 Product Architecture Freeze — PASS / CLOSED; `V1_PRODUCT_ARCHITECTURE_FROZEN`; at that historical closure checkpoint, V1 implementation was ready but not started

### Historical P0.S-7 / P0.S-8 Goal Reconciliation (2026-09-05)

These two goals are future planning definitions only. `P0S7_ALLOWED = NO`
remains unchanged; neither development, Runtime creation, tests nor stage
execution is authorized by this update. Earlier P0.S-1 through P0.S-6 status
entries and evidence narratives are preserved as historical records. For the
current P0.S-6 outcome, use the
[latest Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md#p0s-6-technical-validation-extension-final-closure-state-2026-09-05)
and [Final Closure Decision](../04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md).

**P0.S-7 Goal: Packaged Runtime Feasibility & Controlled Execution Validation.**
Plan to validate Runtime Package Identity (package identity, package integrity
and version consistency), Controlled Runtime Launch (startup authorization,
execution boundary and failure handling), and Runtime Evidence (Runtime evidence
generation, failure evidence and recovery evidence). Retain the fresh-Windows,
packaged Worker / Harness, native dependency and runtime-strategy feasibility
requirements. Runtime must not bypass Authority, Snapshot, Trust Root or
Preflight. Acceptance checks and evidence are planned, not completed.

**P0.S-8 Goal: P0 Baseline Closure & Architecture Freeze.** Plan to freeze Client
Architecture, Runtime Architecture, Plugin Model, Agent Execution Model, Evidence
Model, Security Boundary and Development Baseline through evidence-backed review
and Owner approval. Preserve hypothesis dispositions, constraints, production
impact, fallbacks and core patch requirements. The baseline is not frozen by this
roadmap update, and the existing P0.S Hard Gate and P0.5 / P1 gates remain in force.

**P0.S-6 Impact:** the completed Technical Validation Extension is `CLOSED` with
result `VERIFIED_WITH_CANDIDATE`, Verification / Classification `PASS`, and
Candidate `generated_not_applied`; Runtime was not entered. Its Authority Anchor,
Execution Snapshot, Trust Root, Snapshot Binding, Owner Signature, Final Preflight,
Controlled Invocation and Evidence Finalization model will form the basis of
subsequent Runtime and Agent Execution. Inherit **Snapshot based execution**,
**Trust Root**, **Evidence first** and **Fail closed**. Git SHA self-reference is
not a stable execution identity, Manifest cannot be the sole trust root, Snapshot
requires Binding, and Agent execution requires Preflight and Evidence. The
P0.S-6 result does not authorize reuse of its Invocation or application of its
Candidate. See [Lessons Learned](../04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md)
and the detailed [P0.S-7 / P0.S-8 plan](P0S-FEASIBILITY-SPIKE.md#p0s-7--packaged-runtime-feasibility--controlled-execution-validation--not_started--not_authorized).

### Preserved P0.S-1 through P0.S-6 Historical Evidence

P0.S-1 Evidence: `docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`. AUDIT-005 required documentation corrections; CORRECTIVE-005 applied them; AUDIT-005B passed and authorized Owner closure. The Owner accepted the non-listening Layer C constraint. This closes P0.S-1 only.

P0.S-2 Evidence: `docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md`. The Executor proved custom-scheme real Client boot, session UI entry, strict Electron isolation and two-process Harness FileSettingsProvider persistence, with no stock Web stack, listener or Harness Core modification. AUDIT-006 independently confirmed H-03, H-04, H-15 boot wiring and the Executor claim with no blocking Finding. The Owner accepted the strict-CSP and Settings constraints and closed P0.S-2 as PASS with `ACCEPT_PROVEN_WITH_CONSTRAINT`.

P0.S-3 Evidence: `docs/06-testing-acceptance/evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md`. A disposable real Windows Named Pipe carrier proved protected current-user ACL, explicit pre-Gateway authentication, sandboxed Renderer isolation, 38 actual Harness Gateway unary calls, 24-way unary correlation and three concurrent basic stream framing channels without stock Web/TCP or Harness Core modification. AUDIT-007 independently reproduced the core runtime gates with the same experiment source and an external temporary Node driver, accurately recording that the formal PowerShell 7 runner was not executed unchanged. The Review passed with four informational, non-blocking Findings. The Owner accepted `ACCEPT_PROVEN_WITH_CONSTRAINT` and closed P0.S-3 as PASS. `P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS`, `P0S4_ALLOWED = NO`, the global Core Patch inventory remains incomplete, and P0.S remains `IN_PROGRESS`.

P0.S-4 Evidence: `docs/06-testing-acceptance/evidence/P0S-4-CONNECTION-FEATURE-COMPLETENESS-EVIDENCE.md`. Independent Review returned `PASS` with recommendation `ACCEPT_PROVEN_WITH_CONSTRAINT`; F-01 LOW/NON_BLOCKING required a measurement corrective before closure. Corrective run `1f16242307b04bc19cf1b9cb8295d813` passed all 23 machine gates and the 138-check verifier. Each of four real `$events.ready` records causally triggered one measured test-owned Desktop-equivalent projection invalidation and repull; Frozen Harness did not emit a named `connection/reset` wire event. F-02 validated and irreversibly deleted 18 exact current-user TEMP P0.S-4 runtime directories, with zero undeleted and zero remaining. Independent Corrective Re-Review run `ed73b7779ab64c3ab4bbfde64011bf98` passed 146 checks, confirmed the corrective claim and recommended closure. AUDIT-008 records the full chain and Architecture Owner acceptance. `P0S4_FORMAL_CLOSURE = PASS`, `SHACO_FORGE_V1_0_P0S_4 = PASS`, `P0S4_STATE = CLOSED`, `P0S4_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`, `P0S_LOCAL_CARRIER_FEASIBLE = YES`, `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`, and `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`. All implementations remain `NOT_PRODUCTION`; the native picker and Reviewer reproduction constraints remain accepted. The P0.S-4 Closure Commit is present at `c51d6107eb6da3379490fcb9d8a9eecb4e63e647`; the subsequent Owner authorization sets `P0S5_STATE = IN_PROGRESS`, `P0S5_ALLOWED = YES`, and `READY_FOR_P0S5 = YES` for the bounded P0.S-5 Executor run only.

P0.S-5 Evidence: `docs/06-testing-acceptance/evidence/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT-EVIDENCE.md`. Formal run `9f79aa5566ad4f6aac08502dc1943c37` passed 244 checks and all seven lifecycle/replay gates. S09 used a real Worker Carrier tree force-kill/restart while the same Electron OS process remained alive, derived authority overlap was `0 ms`, the Runner sent no replacement notification, and real transport/identity/generation/`$events.ready` records causally drove the `NOT_PRODUCTION` invalidation/repull/rebuild adapter. Approval/Question × close/crash produced four independent no-replay paths, and Host-side start/resume/turn counts proved no duplicate resume. Independent Review returned `PASS_WITH_REQUIRED_CORRECTIONS`, confirmed the Executor claim and reproduced S01-S11/all seven gates using repository-external equivalent Node driver run `000ff24c78c0495a95695adc7f1c4c89` with the same 20/20 source bytes; the Reviewer lacked PowerShell 7 and network and did not execute the formal PowerShell scripts byte-for-byte. F-01 routes exact PowerShell reproduction/provenance to P1/P7. F-02 records `globalSequence` as a persisted merge ordinal, not strict cross-process UTC chronology, preserves all causal Gate results and routes deterministic merge normalization to P1. F-03 records derived summary booleans as non-authoritative. Documentation / Provenance Corrective is `PASS`; Corrective Re-Review returned `PASS`, confirmed exact scope and technical Gate integrity, and found zero remaining corrective Findings without Runtime or a new runId. AUDIT-009 persists the full chain and Owner acceptance. `P0S5_FORMAL_CLOSURE = PASS`, `SHACO_FORGE_V1_0_P0S_5 = PASS`, `P0S5_STATE = CLOSED`, `P0S5_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`, `P0S5_CORE_PATCH_REQUIRED = NO`, and `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`. All Spike implementations remain `NOT_PRODUCTION`.

Historical MEC-01 execution outcome: `P0S6_MEC_20260903_01_STATE = EXHAUSTED_INCONCLUSIVE`; `P0S6_PHYSICAL_ATTEMPTS_USED = 2`; `P0S6_PHYSICAL_ATTEMPTS_REMAINING = 0`; `P0S6_RUNTIME_GATE_REACHED = NO`; H-05/H-20 are `NOT_PROVEN`; and `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`. Attempt #1 (`999bbd1e-9301-49ad-9021-30da7c879f9e`) stopped `PRE_HYPOTHESIS` at `RUNNER_PREFLIGHT` on a collection-shape defect. Attempt #2 (`76bc4e8a-fb0c-4e92-a750-b555e6a57e41`) stopped `PRE_HYPOTHESIS` at `DEPENDENCY_SETUP` with offline-cache `ENOTCACHED` for `env-paths-2.2.1.tgz`. Both launched Electron zero times and produced no Runtime Evidence. The immutable Attempt #2 raw fallback values `physicalAttemptsUsed=1`, `attempt2Executed=false`, and `clientModuleCorePatchRequired="NO"` do not override the actual two-invocation ledger or unresolved Core Patch state. Partial `node_modules`, `.npm-cache`, and `runtime-data` are failed-attempt outputs only, not Dependency Readiness or Runtime Evidence, and remain untouched/uncommitted.

Current DRRC result and authority:

- `P0S6_DRRC_CONTRACT_ID = P0S6-DRRC-20260904-01`
- `P0S6_DRRC_OWNER_DISPOSITION_ID = P0S6-DRRC-OD-20260904-PS765-01`
- `P0S6_PREPARATION_ID = aa96b746-eeca-4a65-a846-ecf5c753e6ab`
- `P0S6_DRRC_STATE = EXHAUSTED_INCONCLUSIVE`
- `P0S6_DEPENDENCY_PREPARATION = EXHAUSTED`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_USED = 1`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_REMAINING = 0`
- `P0S6_DEPENDENCY_READINESS = INCONCLUSIVE`
- `P0S6_DEPENDENCY_READINESS_FIRST_FAILURE_BOUNDARY = NPM_CI`
- `P0S6_DEPENDENCY_READINESS_FAILURE_CODE = EINTEGRITY`
- `P0S6_FROZEN_LOCKFILE_ENV_PATHS_INTEGRITY_MISMATCH = CONFIRMED`
- `P0S6_ENV_PATHS_CORRECTIVE_INTEGRITY_FROZEN = NO`
- `P0S6_DEPENDENCY_PREPARATION_RETRY = NOT_AUTHORIZED`
- `P0S6_NEW_DEPENDENCY_PREPARATION = NOT_AUTHORIZED`
- `P0S6_LOCKFILE_CORRECTIVE_IMPLEMENTATION = NOT_AUTHORIZED`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`
- `P0S_INBOX_CLIENT_MODULES_PASS = NOT_PROVEN`
- `P0S_CORDIS_OMISSION_PASS = NOT_PROVEN`
- `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`
- `P0S7_ALLOWED = NO`
- `P0S6_LOCKFILE_INTEGRITY_CORRECTIVE_CONTRACT_PLANNING = AUTHORIZED_BOUNDED_GOVERNANCE_ONLY_CONTRACT_ONLY`

Current authoritative next step:

Draft a bounded P0.S-6 Lockfile Integrity Corrective Contract that independently verifies the official env-paths@2.2.1 registry metadata and tarball bytes, derives but does not silently mutate a corrected lockfile, freezes the corrected input identity, and returns for Architecture Owner review.

Do not modify the lockfile, execute npm, prepare dependencies, authorize Recovery Runtime, authorize Global Physical Attempt #3, or start P0.S-7.

### Historical P0.S-7 Closure and P0.S-8 Handoff (2026-09-06)

The [Roadmap Reassessment Decision](../04-development-records/P0S-ROADMAP-REASSESSMENT-DECISION.md)
repositioned P0.S-7 as Controlled Agent Execution Architecture Validation and
P0.S-8 as V1 Product Architecture Freeze. The
[P0.S-7 Final Closure Decision](../04-development-records/P0S-7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-DECISION.md)
is the current closure authority.

```text
P0S7_STATE = CLOSED
P0S7_RESULT = CONTROLLED_AGENT_EXECUTION_ARCHITECTURE_VALIDATED
P0S7_PRODUCT_RUNTIME_EXECUTION = NOT_EXECUTED
P0S7_ENTERPRISE_RUNTIME_VALIDATION = DEFERRED_TO_ENTERPRISE
P0S8_STATE = NOT_STARTED
P0S8_FREEZE_INPUT_READY = YES
P0S8_FREEZE_EXECUTED = NO
V1_IMPLEMENTATION_STARTED = NO
```

The previous `P0S7_STATE = NOT_STARTED` and `P0S7_ALLOWED = NO` values remain
historically valid for the old Runtime or unactivated scope. The reassessed
architecture-validation goal is closed without converting static prototype,
Control Plane, IPC, Candidate or audit work into a product Runtime result.

The next stage is P0.S-8 V1 Product Architecture Freeze. P0.S-8 has not started,
no Freeze Decision or implementation authorization has been created, and V1
implementation has not started. `V1-SLICE-1-SINGLE-AGENT-USER-CLOSURE` is a later
implementation sequencing recommendation only; it is neither frozen nor executed.

### Historical P0.S-8 Freeze, Umbrella Closure and Implementation Sequencing (2026-09-06)

Authority: [P0.S-8 V1 Product Architecture Freeze Decision](../04-development-records/P0S-8-V1-PRODUCT-ARCHITECTURE-FREEZE-DECISION.md),
Decision ID `P0S8-V1-PRODUCT-ARCHITECTURE-FREEZE-20260906-01`.

```text
P0S8_STATE = CLOSED
P0S8_RESULT = V1_PRODUCT_ARCHITECTURE_FROZEN
P0S8_FREEZE_INPUT_READY = YES
P0S8_FREEZE_EXECUTED = YES
SHACO_FORGE_V1_0_P0S = PASS
P0S = CLOSED
V1_IMPLEMENTATION_READY = YES
V1_IMPLEMENTATION_STARTED = NO
```

The phase order at the top of this map remains the long-term delivery route;
P0.5 Compatibility and P1 System Contract are retained. They are not silently
deleted or completed, but their entire completion is not a blanket prerequisite
for the first V1 vertical Slice. A concrete Slice must explicitly gate the P0.5
or P1 contract it needs.

The earlier recommended sequence `V1-SLICE-1-SINGLE-AGENT-USER-CLOSURE` and its
four-Adapter/five-page/Task/Reviewer allocation are superseded for V1.0
implementation by the Harness-reuse Corrective. They remain historical records
of the expanded allocation and do not reopen or invalidate the P0.S-8
foundational architecture freeze.

### Retained V1.0 Harness-Reuse Slice Route — Historical Entry Snapshot (2026-09-06)

Authority:
[V1.0 Harness Reuse Implementation Scope Corrective Decision](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md),
Decision ID `V1-0-HARNESS-REUSE-SCOPE-CORRECTIVE-20260906-01`.

```text
V1_0_SCOPE_RECONCILIATION = COMPLETED
V1_0_IMPLEMENTATION_SCOPE = HARNESS_REUSE_PRODUCTIZATION
V1_0_PROVIDER_MODEL_OWNERSHIP = HARNESS
V1_0_SCOPE_CORRECTIVE = APPLIED
V1_IMPLEMENTATION_READY = YES
V1_IMPLEMENTATION_STARTED = YES
V1_SLICE_1A = CLOSED / FROZEN
V1_SLICE_1B = CLOSED / FROZEN
V1_SLICE_1C = CLOSED / FROZEN
V1_SLICE_1_CORE_GOAL_RESULT = PASS
V1_SLICE_1_SCOPE_RECONCILIATION = COMPLETED
V1_SLICE_1_INDEPENDENT_CLOSURE_AUDIT = PASS
V1_SLICE_1_OWNER_CLOSURE = ACCEPTED
V1_SLICE_1 = PASS / CLOSED / FROZEN
V1_SLICE_1_ADDITIONAL_IMPLEMENTATION = NONE
PREVIOUS_V1_SLICE_2 = NOT_STARTED
PREVIOUS_V1_CURRENT_NEXT_ACTION = PREPARE_V1_SLICE_2_LIFECYCLE_NATIVE_RECONNECT
```

The retained four-Slice route remains current; the execution-state snapshot
above is historical:

1. `V1-SLICE-1 — REAL HARNESS USER LOOP`: Desktop -> Worker -> Harness Host ->
   Harness Client -> configured Harness Provider/model -> Workspace -> Session ->
   Prompt -> Streaming -> Tool/Result. The primary default validation is the
   DeepSeek official route, without hard-coding Provider routing in Shaco.
2. `V1-SLICE-2 — LIFECYCLE / NATIVE / RECONNECT`: Worker lifecycle and discovery,
   native bridges/picker, Desktop independence, reconnect and truthful projection.
3. `V1-SLICE-3 — PACKAGING / COMPATIBILITY / RELEASE`: bundled Node/Harness,
   controlled `DSH_HOME`, authenticated carrier, compatibility/fail-closed,
   installer and minimal upgrade/backup/rollback.
4. `V1-SLICE-4 — FRESH WINDOWS FINAL ACCEPTANCE`: fresh supported Windows final
   acceptance without new feature development.

Harness owns Provider/model/API endpoint/relay configuration, credentials,
Workspace, Session, conversation runtime, tools and permission/approval runtime.
V1.0 does not require a Shaco Provider framework, a second credentials/settings
truth, independent Reviewer pipeline, Shaco Task state machine/database, five
custom pages or future empty tables. Multi-model support reuses Harness;
Multi-Agent orchestration is a future Shaco domain that can reference multiple
Harness Sessions.

### Need-driven Taxonomy Crosswalk

| Taxonomy | Remaining work route |
|---|---|
| P2 Host Worker | Lifecycle/restart to Slice 2; packaged launch to Slice 3; do not repeat frozen 1A bootstrap |
| P3 Carrier/Supervision | Discovery/reconnect to Slice 2; compatibility to Slice 3; do not repeat frozen 1B Carrier |
| P4 Desktop Client | Native Picker and outer truthful projection/integration to Slice 2; do not repeat frozen 1A/1C chain |
| P5 Required parity | Close only remaining REQUIRED behavior in the active Slice gate; cite frozen 1A/1B/1C Evidence |
| P6A Durability/Recovery | Primarily Slice 2 |
| P6B Plugin compatibility | Optional/need-driven V1.0 compatibility only |
| P7 Packaging/Security/Upgrade | Slice 3 |
| P8 Final acceptance | Slice 4; no new feature development |

## P0.5

Status: READY_FOR_FREEZE_AFTER_P0S; retained and now eligible for need-driven refinement

Current gate: P0.S prerequisite is satisfied. Freeze only the Compatibility contract required by the active Slice; do not block the first Slice on completing all P0.5 work.

Steps:

- P0.5-1 Version Identities
- P0.5-2 Compatibility Matrix
- P0.5-3 Supervisor Handshake
- P0.5-4 Incompatible / Fail-Closed Behavior
- P0.5-5 Upgrade Transaction
- P0.5-6 Failure / Backup Restore

## P1

Status: NOT_DETAILED; retained for need-driven System/Cross-cutting Contract refinement

Goal: freeze process, authority, runtime boundary, connection/supervisor, worker identity, data, security, error taxonomy, diagnostics, exit semantics, child ownership and future seams using P0.S evidence.

Current gate: P0.S prerequisite is satisfied. Detail and freeze the P1 contract required by the active Slice; do not block the first Slice on completing all P1 work.

## P2

Status: NOT_DETAILED

Goal: production-quality Host-only Worker, independent of Desktop, using packaged runtime shape.

## P3

Status: NOT_DETAILED

Goal: production Connection carrier + Worker supervision; no second Agent RPC.

## P4

Status: NOT_DETAILED

Goal: Electron shell + Harness Client adaptation + native bridge.

## P5

Status: NOT_DETAILED

Goal: implement only P0 REQUIRED behavior parity.

## P6A

Status: NOT_DETAILED

Goal: durability, reconnect, Worker restart, cold session recovery, data integrity.

## P6B

Status: NOT_DETAILED

Goal: limited in-box/explicitly approved plugin compatibility only. May remain optional/deferred if not needed by V1.0 core baseline.

## P7

Status: NOT_DETAILED

Goal: installer, security verification, update transaction, signing, diagnostics, uninstall, backup/restore.

## P8

Status: NOT_DETAILED

Goal: fresh Windows acceptance; no new feature development.
