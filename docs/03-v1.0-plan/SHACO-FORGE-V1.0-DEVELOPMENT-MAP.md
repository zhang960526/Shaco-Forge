# Shaco Forge V1.0 Development Map

Status: ACTIVE

> Current V1.0 implementation-route authority: the
> [V1.0 Harness Reuse Implementation Scope Corrective Decision](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md)
> and the Owner-accepted [V1-SLICE-1 Scope Reconciliation Decision](../04-development-records/V1-SLICE-1-SCOPE-RECONCILIATION-DECISION.md),
> [AUDIT-018](../05-reviews/architecture/AUDIT-018-V1-SLICE-1-INDEPENDENT-CLOSURE-AUDIT.md),
> and [V1-SLICE-1 Owner Closure Decision](../04-development-records/V1-SLICE-1-OWNER-CLOSURE-DECISION.md).
> Slice 1A/1B/1C and Slice 1 are `PASS / CLOSED / FROZEN`; Slice 2 has not started.

## Current Implementation Route

```text
CURRENT_IMPLEMENTATION_ROUTE = FOUR_SLICE_HARNESS_REUSE_ROUTE
V1_SLICE_1 = PASS / CLOSED / FROZEN
V1_SLICE_1A_1B_1C = CLOSED / FROZEN
V1_SLICE_1_SCOPE_RECONCILIATION = COMPLETED
V1_SLICE_1_INDEPENDENT_CLOSURE_AUDIT = PASS
V1_SLICE_1_OWNER_CLOSURE = ACCEPTED
V1_SLICE_1_ADDITIONAL_IMPLEMENTATION = NONE
V1_SLICE_2 = LIFECYCLE / NATIVE / RECONNECT / NOT_STARTED
V1_SLICE_3 = PACKAGING / COMPATIBILITY / RELEASE / NOT_STARTED
V1_SLICE_4 = FRESH_WINDOWS_FINAL_ACCEPTANCE / NOT_STARTED
P0_5_P1_P2_TO_P8 = NEED_DRIVEN_CONTRACT_CAPABILITY_ACCEPTANCE_TAXONOMY
P0_5_P1_P2_TO_P8 = NOT_A_SECOND_SEQUENTIAL_IMPLEMENTATION_ROUTE
V1_CURRENT_NEXT_ACTION = PREPARE_V1_SLICE_2_LIFECYCLE_NATIVE_RECONNECT
```

The four Slice route is the current implementation route. P0.5/P1/P2-P8 retain
their contract, capability and acceptance meaning and are consumed need-first
by the active Slice. They do not authorize sequential reimplementation of
Worker bootstrap, Harness Host bootstrap, Desktop foundation, authenticated
Carrier, real Client-to-Host communication or the real Harness user loop
already completed and frozen by 1A/1B/1C.

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

P0 PASS did not by itself authorize P0.S. AUDIT-004B Independent Corrective Re-Review = `PASS`. `P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. Historical P0.S-6 records preserve that `P0S6-MEC-20260903-01` exhausted two physical attempts without reaching Runtime and `P0S6-DRRC-20260904-01` exhausted its sole Dependency Preparation invocation at `NPM_CI / EINTEGRITY`; at that recording boundary P0.S-6 was blocked and P0.S-7 was unauthorized. Later authority closes P0.S-6 as `VERIFIED_WITH_CANDIDATE`, closes reassessed P0.S-7 as `CONTROLLED_AGENT_EXECUTION_ARCHITECTURE_VALIDATED`, and closes P0.S-8/P0.S after the sufficient V1 Product Architecture Freeze. V1 implementation is ready but not started.

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
- P0.S-8 V1 Product Architecture Freeze — PASS / CLOSED; `V1_PRODUCT_ARCHITECTURE_FROZEN`; V1 implementation ready but not started

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

### Current P0.S-7 Closure and P0.S-8 Handoff (2026-09-06)

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

### Current P0.S-8 Freeze, Umbrella Closure and Implementation Sequencing (2026-09-06)

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

### Current V1.0 Harness-Reuse Slice Route (2026-09-06)

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
V1_SLICE_2 = NOT_STARTED
V1_CURRENT_NEXT_ACTION = PREPARE_V1_SLICE_2_LIFECYCLE_NATIVE_RECONNECT
```

The current Slice route is:

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
