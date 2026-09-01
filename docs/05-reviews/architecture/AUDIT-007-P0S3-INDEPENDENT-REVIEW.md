# AUDIT-007 — Independent P0.S-3 Local Carrier + Trust Review

Status: COMPLETE

Date: 2026-08-31

Review Mode: Independent evidence and runtime reproducibility review; no
implementation or documentation files modified by the Reviewer.

## Provenance

Classification: faithful persisted summary of an external Independent Review.

This document records the external Reviewer result supplied to the P0.S-3
Architecture Owner closure run. It does not claim that the closure Executor
performed the independent review or executed the Reviewer's commands.

The formal `run-spike.ps1` requires PowerShell 7. The Reviewer machine did not
have `pwsh`, so the Reviewer did not execute the formal runner byte-for-byte.
Instead, the Reviewer used the same C#, Electron and bundle source in a
repository-external temporary copy and an independent temporary Node driver to
reproduce every core runtime gate. This provenance distinction is intentional
and must not be summarized as an unchanged formal-runner reproduction.

## Baseline Reviewed

- Shaco Forge: `8308b406aff6248b620b9a6a62c66feb7d0aeeb4`
- Frozen Harness: `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- Harness package: `0.1.2-alpha.1`
- Harness `pnpm-lock.yaml` SHA256:
  `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`
- Primary Evidence:
  `docs/06-testing-acceptance/evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md`
- Redacted machine Evidence:
  `docs/04-development-records/experiments/P0S-3-LOCAL-CARRIER-AND-TRUST/evidence/summary.json`

## Review Result

```text
P0S3_INDEPENDENT_REVIEW_VERDICT = PASS
P0S3_EXECUTOR_CLAIM_CONFIRMED = YES
RUNTIME_REPRODUCED = YES
H06_STATUS = CONFIRMED
H14_STATUS = CONFIRMED
H15_STATUS = CONFIRMED
SID_ACL_STATUS = CONFIRMED
AUTHENTICATION_BEFORE_GATEWAY = CONFIRMED
REAL_HARNESS_GATEWAY_UNARY = CONFIRMED
RENDERER_ISOLATION = CONFIRMED
BASIC_STREAM_CONCURRENCY = CONFIRMED
P0S_LOCAL_TRUST_FEASIBLE = CONFIRMED
P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS
CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO
P0S3_TECHNICAL_RECOMMENDATION = ACCEPT_PROVEN_WITH_CONSTRAINT
REVIEWER_MODIFIED_FILES = NO
BLOCKING_FINDINGS = NONE
```

The external Reviewer independently reproduced real Electron Main, Renderer
and Worker processes, a real Windows Named Pipe, the protected current-user
DACL, all nine pre-Gateway negative rejections, 38 real Harness Gateway unary
calls, 24-way correlation and three concurrent basic stream framing channels.
Malformed and oversize frames failed closed. The two-layer listener probes
observed no TCP listener, cleanup left no residual process, and the Frozen
Harness worktree was clean before and after the reproduction.

## Confirmed Gate Matrix

| Gate | Review status | Boundary |
|---|---|---|
| H-06 | `CONFIRMED` | Real local Named Pipe carrier foundation reproduced |
| H-14 | `CONFIRMED` | Current-user local trust boundary reproduced |
| H-15 | `CONFIRMED` | Renderer isolation and Main-owned carrier reproduced |
| SID ACL | `CONFIRMED` | Protected DACL contains only the current-user SID |
| authentication before Gateway | `CONFIRMED` | All nine negative decisions observed Gateway dispatch count 0 |
| real Harness Gateway unary | `CONFIRMED` | 38 `typertGateway.invoke` calls reproduced |
| Renderer isolation | `CONFIRMED` | No direct pipe, endpoint or reusable credential exposure |
| basic stream concurrency | `CONFIRMED` | Three ordered, isolated framing channels reproduced |
| local trust feasibility | `CONFIRMED` | Cookie-independent per-start trust flow reproduced |

The Review does not convert the basic stream probe into the complete P0.S-4
stream contract and does not set any P0.S-4 gate.

## Adapter and Core Patch Classification

| Surface | Classification | Accepted boundary |
|---|---|---|
| C# ACL/auth/framing helper | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | Feasibility helper only; no production authorization |
| PowerShell launcher | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | PowerShell 7 test launcher only; no product bundling authorization |
| inherited-stdio bridge | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | Feasibility path into `dsh --profile`; production ownership remains P1/P3/P7 work |
| non-listening `HostConnectionService` compatibility | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | Accepted compatibility seam; no stock Web restoration |
| carrier-gateway dispatcher | `SHACO_CUSTOM_CARRIER_PLUGIN`; `NON_CORE_ADAPTER` | Maps the physical carrier to existing Harness Gateway unary semantics |
| Electron IPC/preload | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | Main-owned transport with bounded Renderer surface |
| basic-stream producer | `STUB`; `NOT_PRODUCTION` | Framing concurrency only; discard before production |

Named Pipe remains `SHACO_CUSTOM_CARRIER_PLUGIN`.
`CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`. The global inventory remains
incomplete: `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO` and
`CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`.

## Findings

| ID | Severity | Blocking | Finding | Required action / route |
|---|---|---|---|---|
| F-01 | INFO | NO | `run-spike.ps1` depends on PowerShell 7 and PS7 APIs. The Reviewer machine had no `pwsh`, so the formal runner was not executed unchanged. The same C#/Electron/bundle sources and an independent temporary Node driver reproduced every core runtime gate. | P1/P7 must freeze a `pwsh` prerequisite or replace the PowerShell launcher. Preserve exact reproduction provenance. This does not authorize bundling PowerShell. |
| F-02 | INFO | NO | `worker-carrier.cs` keeps used client nonces in a static `HashSet`; a long-running Worker would accumulate entries. The bounded Spike run was unaffected. | P1 production handshake contract must bound replay state per connection or define capacity and expiry. |
| F-03 | INFO | NO | `run-spike.ps1` hard-codes Electron `35.7.5`; the Reviewer independently confirmed that the real binary version was `35.7.5`. | No P0.S-3 correction. A later runner may read the binary version dynamically. |
| F-04 | INFO | NO | TCP-listener coverage is split between runner probes for Worker/`dsh`/Main and Electron Main `app.getAppMetrics` probes for Renderer/utility processes. Both layers observed zero listeners; there is no coverage gap. | P1 diagnostics should retain and document the layered probe model. |

All Findings are informational, non-blocking and routed forward. No P0.S-3
Corrective is required.

## Reviewer File Mutation

`NONE`. The external Review reports that the Reviewer used a
repository-external temporary copy and did not modify Shaco Forge, the Spike,
its Evidence or the Frozen Harness worktree.

## Review Closure Boundary

The Independent Review confirmed the Executor claim and recommended
`ACCEPT_PROVEN_WITH_CONSTRAINT`. It did not itself close P0.S-3, accept the
constraints, authorize production reuse, authorize bundling PowerShell or start
P0.S-4.

## Architecture Owner Closure Decision

During the formal closure run, the Architecture Owner accepted:

```text
SHACO_FORGE_V1_0_P0S_3 = PASS
P0S3_FORMAL_CLOSURE = PASS
P0S3_STATE = CLOSED
P0S3_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT
ARCHITECTURE_OWNER_P0S3_CONSTRAINTS_ACCEPTED = YES
CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO
P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS
```

The accepted adapters prove feasibility only and remain `NOT_PRODUCTION` where
classified above. P0.S-4 must still prove complete stream, events, approval,
question, cancel, binary, connection-loss and backpressure behavior. P1 must
freeze framing limits, handshake and replay boundaries, credential handoff and
the Carrier contract. This Owner action closes P0.S-3 only; P0.S remains
`IN_PROGRESS`, P0.S-4 remains `NOT_STARTED`, and the global Core Patch
inventory remains incomplete.
