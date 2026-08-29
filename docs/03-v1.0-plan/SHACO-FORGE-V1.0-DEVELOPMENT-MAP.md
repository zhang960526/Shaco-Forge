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

Status: IN_PROGRESS (`SHACO_FORGE_V1_0_P0 = NOT_PASS`)

Steps:

- P0-1 Upstream Baseline Freeze — PASS / CLOSED
- P0-2 Web + Standard Preset Composition Census — PASS / CLOSED
- P0-3 Client↔Host Contract Census — NOT_STARTED
- P0-4 Authentication / Trust Surface Audit — NOT_STARTED
- P0-5 Core Feature Parity Matrix — NOT_STARTED
- P0-6 Dependency & Stability Matrix — NOT_STARTED
- P0-7 Risk Register & P0.S Input Freeze — NOT_STARTED

Frozen Harness baseline: `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`dsh@0.1.2-alpha.1`). See `docs/06-testing-acceptance/evidence/P0-1-HARNESS-BASELINE-MANIFEST.md`.

## P0.S

Status: READY_FOR_EXECUTION_AFTER_P0

Steps:

- P0.S-1 Host Profile Feasibility
- P0.S-2 Electron Client Boot
- P0.S-3 Local Carrier + Trust
- P0.S-4 Connection Feature Completeness
- P0.S-5 Desktop Independence & Reconnect
- P0.S-6 Client Module / Plugin Frontend
- P0.S-7 Packaged Runtime Feasibility
- P0.S-8 Spike Closure

## P0.5

Status: READY_FOR_FREEZE_AFTER_P0S

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
