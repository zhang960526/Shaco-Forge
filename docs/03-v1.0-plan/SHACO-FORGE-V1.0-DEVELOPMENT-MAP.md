# Shaco Forge V1.0 Development Map

Status: ACTIVE

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

P0 PASS does not by itself authorize P0.S. AUDIT-004B Independent Corrective Re-Review = `PASS`. `P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. P0.S is in progress; P0.S-1 through P0.S-5 are closed. P0.S-6 remains not started and requires separate Architecture Owner planning/execution authorization.

## P0.S

Status: IN_PROGRESS (`SHACO_FORGE_V1_0_P0S = IN_PROGRESS`; `ALLOW_P0S = YES`)

Steps:

- P0.S-1 Host Profile Feasibility — PASS / CLOSED; Owner-accepted `PROVEN_WITH_CONSTRAINT`
- P0.S-2 Electron Client Boot — PASS / CLOSED; Owner-accepted `PROVEN_WITH_CONSTRAINT`
- P0.S-3 Local Carrier + Trust — PASS / CLOSED; Owner-accepted `PROVEN_WITH_CONSTRAINT`
- P0.S-4 Connection Feature Completeness — PASS / CLOSED; Owner-accepted `MET_WITH_CONSTRAINT`
- P0.S-5 Desktop Independence & Reconnect — PASS / CLOSED; Owner-accepted `MET_WITH_CONSTRAINT`
- P0.S-6 Client Module / Plugin Frontend — NOT_STARTED / NOT_ALLOWED / separately gated
- P0.S-7 Packaged Runtime Feasibility — NOT_STARTED
- P0.S-8 Spike Closure — NOT_STARTED

P0.S-1 Evidence: `docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`. AUDIT-005 required documentation corrections; CORRECTIVE-005 applied them; AUDIT-005B passed and authorized Owner closure. The Owner accepted the non-listening Layer C constraint. This closes P0.S-1 only.

P0.S-2 Evidence: `docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md`. The Executor proved custom-scheme real Client boot, session UI entry, strict Electron isolation and two-process Harness FileSettingsProvider persistence, with no stock Web stack, listener or Harness Core modification. AUDIT-006 independently confirmed H-03, H-04, H-15 boot wiring and the Executor claim with no blocking Finding. The Owner accepted the strict-CSP and Settings constraints and closed P0.S-2 as PASS with `ACCEPT_PROVEN_WITH_CONSTRAINT`.

P0.S-3 Evidence: `docs/06-testing-acceptance/evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md`. A disposable real Windows Named Pipe carrier proved protected current-user ACL, explicit pre-Gateway authentication, sandboxed Renderer isolation, 38 actual Harness Gateway unary calls, 24-way unary correlation and three concurrent basic stream framing channels without stock Web/TCP or Harness Core modification. AUDIT-007 independently reproduced the core runtime gates with the same experiment source and an external temporary Node driver, accurately recording that the formal PowerShell 7 runner was not executed unchanged. The Review passed with four informational, non-blocking Findings. The Owner accepted `ACCEPT_PROVEN_WITH_CONSTRAINT` and closed P0.S-3 as PASS. `P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS`, `P0S4_ALLOWED = NO`, the global Core Patch inventory remains incomplete, and P0.S remains `IN_PROGRESS`.

P0.S-4 Evidence: `docs/06-testing-acceptance/evidence/P0S-4-CONNECTION-FEATURE-COMPLETENESS-EVIDENCE.md`. Independent Review returned `PASS` with recommendation `ACCEPT_PROVEN_WITH_CONSTRAINT`; F-01 LOW/NON_BLOCKING required a measurement corrective before closure. Corrective run `1f16242307b04bc19cf1b9cb8295d813` passed all 23 machine gates and the 138-check verifier. Each of four real `$events.ready` records causally triggered one measured test-owned Desktop-equivalent projection invalidation and repull; Frozen Harness did not emit a named `connection/reset` wire event. F-02 validated and irreversibly deleted 18 exact current-user TEMP P0.S-4 runtime directories, with zero undeleted and zero remaining. Independent Corrective Re-Review run `ed73b7779ab64c3ab4bbfde64011bf98` passed 146 checks, confirmed the corrective claim and recommended closure. AUDIT-008 records the full chain and Architecture Owner acceptance. `P0S4_FORMAL_CLOSURE = PASS`, `SHACO_FORGE_V1_0_P0S_4 = PASS`, `P0S4_STATE = CLOSED`, `P0S4_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`, `P0S_LOCAL_CARRIER_FEASIBLE = YES`, `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`, and `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`. All implementations remain `NOT_PRODUCTION`; the native picker and Reviewer reproduction constraints remain accepted. The P0.S-4 Closure Commit is present at `c51d6107eb6da3379490fcb9d8a9eecb4e63e647`; the subsequent Owner authorization sets `P0S5_STATE = IN_PROGRESS`, `P0S5_ALLOWED = YES`, and `READY_FOR_P0S5 = YES` for the bounded P0.S-5 Executor run only.

P0.S-5 Evidence: `docs/06-testing-acceptance/evidence/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT-EVIDENCE.md`. Formal run `9f79aa5566ad4f6aac08502dc1943c37` passed 244 checks and all seven lifecycle/replay gates. S09 used a real Worker Carrier tree force-kill/restart while the same Electron OS process remained alive, derived authority overlap was `0 ms`, the Runner sent no replacement notification, and real transport/identity/generation/`$events.ready` records causally drove the `NOT_PRODUCTION` invalidation/repull/rebuild adapter. Approval/Question × close/crash produced four independent no-replay paths, and Host-side start/resume/turn counts proved no duplicate resume. Independent Review returned `PASS_WITH_REQUIRED_CORRECTIONS`, confirmed the Executor claim and reproduced S01-S11/all seven gates using repository-external equivalent Node driver run `000ff24c78c0495a95695adc7f1c4c89` with the same 20/20 source bytes; the Reviewer lacked PowerShell 7 and network and did not execute the formal PowerShell scripts byte-for-byte. F-01 routes exact PowerShell reproduction/provenance to P1/P7. F-02 records `globalSequence` as a persisted merge ordinal, not strict cross-process UTC chronology, preserves all causal Gate results and routes deterministic merge normalization to P1. F-03 records derived summary booleans as non-authoritative. Documentation / Provenance Corrective is `PASS`; Corrective Re-Review returned `PASS`, confirmed exact scope and technical Gate integrity, and found zero remaining corrective Findings without Runtime or a new runId. AUDIT-009 persists the full chain and Owner acceptance. `P0S5_FORMAL_CLOSURE = PASS`, `SHACO_FORGE_V1_0_P0S_5 = PASS`, `P0S5_STATE = CLOSED`, `P0S5_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`, `P0S5_CORE_PATCH_REQUIRED = NO`, and `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`. All Spike implementations remain `NOT_PRODUCTION`; `P0S6_ALLOWED = NO`, `P0S6_STATE = NOT_STARTED`, and `READY_FOR_P0S6 = NO`.

## P0.5

Status: READY_FOR_FREEZE_AFTER_P0S

Current gate: NOT_ALLOWED_TO_FREEZE while P0.S is `IN_PROGRESS`.

Steps:

- P0.5-1 Version Identities
- P0.5-2 Compatibility Matrix
- P0.5-3 Supervisor Handshake
- P0.5-4 Incompatible / Fail-Closed Behavior
- P0.5-5 Upgrade Transaction
- P0.5-6 Failure / Backup Restore

## P1

Status: NOT_DETAILED

Goal: freeze process, authority, runtime boundary, connection/supervisor, worker identity, data, security, error taxonomy, diagnostics, exit semantics, child ownership and future seams using P0.S evidence.

Current gate: NOT_ALLOWED_TO_FREEZE while P0.S is `IN_PROGRESS`.

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
