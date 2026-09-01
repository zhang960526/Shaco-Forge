# AUDIT-009 — Independent P0.S-5 Desktop Independence & Reconnect Review

Status: COMPLETE / PASS / OWNER_CLOSED

Formal Name: P0.S-5 Desktop Independence & Reconnect Formal Closure

Date: 2026-09-01

## 1. Provenance

This document is the faithful persisted summary of the externally supplied
Independent Review, the Executor-applied Documentation / Provenance Corrective,
the externally supplied targeted Corrective Re-Review and the Architecture
Owner Formal Closure decision. The Closure Executor did not act as the
Independent Reviewer, execute the Reviewer commands, rerun Runtime or perform
the Architecture Owner's technical judgment.

The Independent Reviewer did not execute the formal PowerShell runner or
verifier byte-for-byte. The Corrective Re-Review did not execute S01-S11,
generate a runId or modify a project file. Architecture Owner accepted the
persisted review chain; the Owner did not rerun technical validation.

## 2. Goal and Scope

The review goal was to independently assess the P0.S-5 Desktop Independence &
Reconnect Executor result, including Desktop close/crash independence, second
Desktop policy, real Worker force-kill/restart recovery, reconnect authority,
Approval/Question no-replay and the CF-01 causal invalidation chain.

The Formal Closure scope is documentation and governance only. Formal Closure
alone did not authorize Runtime rerun, production implementation, a Core Patch,
Commit, Push or any P0.S-6 planning/execution work. Architecture Owner later
authorized the separately bounded P0.S-5 Closure Commit recorded in Section 23;
it does not authorize Push or P0.S-6. All Spike implementations remain
`NOT_PRODUCTION`.

## 3. Baseline

- Shaco branch: `master`
- Shaco HEAD: `c51d6107eb6da3379490fcb9d8a9eecb4e63e647`
- Formal verifier result: `PASS / 244 checks`
- Independent equivalent-driver result: `PASS / 222 equivalent checks`
- Formal P0.S-5 experiment files: `27/27` byte-preserved
- Formal source hash chain: `20/20` matches
- Staged files at Closure: `0`

The Frozen Harness remained at HEAD
`cd5ef8148158c3a752a658978873241fdf8e2bbc`, package
`0.1.2-alpha.1`, lock SHA-256
`506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`
and tracked-tree digest
`7fd43c3ac141c6a4abd2f91aa8f24c161d002ccb6d5d8b843c6197ab8c6f0b67`.
Its worktree remained clean.

## 4. Run and Review Identities

| Activity | Identity | Result | Runtime scope |
|---|---|---|---|
| Formal Executor | `9f79aa5566ad4f6aac08502dc1943c37` | PASS / 244 checks | Formal S01-S11 run |
| Independent equivalent-driver reproduction | `000ff24c78c0495a95695adc7f1c4c89` | PASS / 222 equivalent checks | Repository-external equivalent Node driver; full S01-S11 |
| Documentation / Provenance Corrective | No Runtime runId | PASS | Five authorized documents only |
| Corrective Re-Review | No Runtime runId | PASS | Documentation/provenance verification; no S01-S11 rerun |
| Architecture Owner Formal Closure | No Runtime runId | PASS / OWNER_CLOSED | Governance decision only |
| Documentation/Packaging Corrective and Closure Commit | No Runtime runId | PASS | Exact 35-path raw-byte packaging; no Runtime or Push |

The equivalent-driver identity is independent review provenance and never
replaces the Formal Executor run identity.

## 5. Accepted Verdict Chain

1. Formal Executor: `PASS`; all seven gates and 244 verifier checks passed.
2. Independent Review: `PASS_WITH_REQUIRED_CORRECTIONS`; Executor claim and all
   seven gates confirmed; Critical/High Findings were zero.
3. F-01/F-02 Documentation / Provenance Corrective: `PASS`; F-03 recorded as
   informational; no Runtime or Evidence regeneration.
4. Corrective Re-Review: `PASS`; corrective claim, exact scope and technical
   Gate integrity confirmed; remaining corrective Findings were zero.
5. Architecture Owner: accepted `MET_WITH_CONSTRAINT` and closed P0.S-5.

The historical Independent Review verdict remains
`PASS_WITH_REQUIRED_CORRECTIONS`; it is not rewritten as `PASS`.

## 6. Seven Gate Results

```text
P0S_DESKTOP_CLOSE_WORKER_SURVIVES = YES
P0S_DESKTOP_CRASH_WORKER_SURVIVES = YES
P0S_SECOND_DESKTOP_POLICY_PASS = YES
P0S_WORKER_RESTART_RECONNECT_PASS = YES
P0S_NO_DUPLICATE_RESUME = YES
P0S_NO_APPROVAL_REPLAY = YES
P0S_NO_QUESTION_REPLAY = YES
```

The Independent Review re-derived all seven results from formal Evidence and
independently reproduced them with the equivalent Node driver.

## 7. Desktop Close and Crash

Both normal Desktop close and forced Desktop crash left the Worker authority
alive. Reopened Desktop instances discovered and attached to the same Worker.
Projection state was rebuilt from current Host/Harness truth rather than from
Desktop-owned state. Reconnect produced no automatic Agent start, resume or
turn-authority delta.

## 8. Second Desktop Policy

A real second Electron OS process attempted to start. The single-instance lock
was acquired before discovery, credential access, Pipe access, Gateway access
or Worker spawn. The losing process failed closed and recorded zero sensitive
actions. After the first Desktop crashed, a new owner acquired the lock and
attached to the original Worker.

## 9. Worker Force-Kill and Restart S09

S09 force-killed the real Worker Carrier and dsh process tree while the same
Electron PID/start-time identity remained alive. The old authority exited
completely before the replacement authority started; Worker authority overlap
was `0 ms`. Runner sent no Worker replacement or reset notification.

Desktop recovery was driven by real Pipe/transport loss, Worker identity,
authentication, generation replacement and a new real `$events.ready`. The new
Host truth was empty, so no old Agent was automatically restored and automatic
start/resume count remained zero.

## 10. No Duplicate Resume

Host-side Agent start, resume and turn-authority records showed no reconnect
delta across Desktop close, Desktop crash or Worker replacement. Projection
rebuild did not create a second execution authority. The result is derived from
Host truth and authority records, not a summary constant.

## 11. Approval and Question No-Replay

Approval close/crash and Question close/crash were four independent paths. Each
used the exact old result envelope. Old generation/clientId envelopes were
rejected. Only a new explicit Renderer action settled the current request once;
a duplicate current envelope produced no second settlement. Questions came
from the real Harness question service. Host start/resume/turn authority had no
reconnect delta.

## 12. CF-01 Causal Chain

Frozen Harness has no named `connection/reset` wire event, and P0.S-5 neither
uses nor claims one. Projection invalidation, repull and Host truth rebuild are
test-owned `NOT_PRODUCTION` Desktop-equivalent adapter behavior. Their causal
sources are real transport loss, Worker identity loss/replacement,
authenticated generation replacement and real `$events.ready` records.

Each relevant raw record retains source event, Worker/Desktop identity,
old/new generation, Harness clientId where present, source-local sequence and a
contiguous persisted merge ordinal. Gate proof uses the explicit causal chain,
not a reset constant or preselected count.

## 13. F-01 Equivalent-Driver Provenance

The Reviewer environment had no PowerShell 7 and no network available for
installation. The Reviewer did not execute `run-spike.ps1` or
`verify-summary.ps1` byte-for-byte. A repository-external equivalent Node
driver used the same 20/20 source bytes, Worker Carrier C# source, Frozen
Harness Host/profile, Electron 35.7.5, environment contract, PID/start-time
identity, process-tree force-kill, event-merge/globalSequence construction and
equivalent Gate assertions.

It completed S01-S11 and reproduced 697 event records, 18 Desktop process
records, two Worker authorities, 19 real `$events.ready`, three invalidations,
19 repulls, 37 Host truth rebuilds, `0 ms` authority overlap, all seven gates
and 222/222 equivalent checks. Exact PowerShell 7 reproduction/provenance is
routed to P1/P7 and does not invalidate a P0.S-5 Gate.

## 14. F-02 Merge and globalSequence Semantics

The formal runner intends to sort raw inputs by
`(utc, source, sourceSequence)` before assigning `globalSequence`. The formal
`events.ndjson` is not a strict cross-process UTC chronology: re-sorting the
697 records changes 546 positions. Persisted `globalSequence` is a contiguous
merge ordinal, not a reliable cross-process wall-clock total order. `utc` and
`monotonicTicks` are source-local observation metadata.

Cross-source Gate causality is proved by recordId/causedByRecordId, producer
sourceSequence, PID/start-time lifecycle, Worker/Desktop identity,
generation/clientId, Host truth, exact envelope/settlement records and scenario
results. No existing Gate depends on strict cross-process chronology.
Deterministic merge normalization and a verifier assertion are routed to P1.

## 15. F-03 Derived Summary Boolean Disposition

`hardGatePlannedAndExecuted`, `desktopRemainedAlive` and
`hostSideStartResumeCountsVerified` are verifier-derived summary fields, not
independent raw authority. Reviewer re-derived the claims from raw events,
PID/start-time, identities, generation/clientId, exact envelopes, settlements,
Host truth and scenario results. F-03 requires no verifier, summary, raw
Evidence or Runtime change.

## 16. Corrective Re-Review Result

```text
P0S5_CORRECTIVE_REREVIEW_VERDICT = PASS
P0S5_CORRECTIVE_CLAIM_CONFIRMED = YES
P0S5_F01_PROVENANCE_CORRECTION_CONFIRMED = YES
P0S5_F02_MERGE_SEMANTICS_CORRECTION_CONFIRMED = YES
P0S5_F03_INFORMATIONAL_RECORD_CONFIRMED = YES
P0S5_CORRECTIVE_SCOPE_EXACT = YES
P0S5_TECHNICAL_GATE_INTEGRITY_PRESERVED = YES
P0S5_REMAINING_CORRECTIVE_FINDINGS = 0
P0S5_TECHNICALLY_READY_FOR_CLOSURE = YES
P0S5_OWNER_MAY_CLOSE = YES
```

Corrective Re-Review modified no file, executed no Runtime, generated no runId
and did not rerun S01-S11.

## 17. Protected Artifact Integrity

- All 27 P0.S-5 experiment files remained byte-identical.
- `run-manifest.sourceSha256` remained `20/20` matching.
- Formal runId remained `9f79aa5566ad4f6aac08502dc1943c37`.
- Protected P0.S-1 through P0.S-4 digest remained
  `2e1af8352a11810abe2668df0e941d9ff1b24dd28e91e32f90905e13b02537ef`.
- Frozen Harness identity, lock, tracked tree and clean worktree remained exact.

Protected formal Evidence hashes remained:

| File | SHA-256 |
|---|---|
| `run-manifest.json` | `8a1b98ae7e896fe6a4399e5938555407b2761f68647019dd017293d234562099` |
| `summary.json` | `1d5a8861dbcab2a64ad0dc914ec87f7234212cd79778b7dfb2464c3623461e03` |
| `verify-summary.ps1` | `2b8d4c250eefd7a6ff7c9a7eae6de5cc1f0e9f9157f496bb79627cfdad6600e3` |
| `events.ndjson` | `f224bf8e8cea68713ab908b7f6f35de620a8d648db0dba7cf7172c9a9a533b75` |
| `processes.json` | `ecd4cf18ab9fdceea9ad0b57ad376dd65c6d8bfbb0bb510b35f829b86b7f476d` |
| `scenario-results.json` | `0f266d82dca557545d2982e791456fae3c2fe70ec8af90d68184a24458ea08a5` |
| `host-truth.json` | `a43111ba272687e982ffea937b832d4e0e2640eddb6e306a8b9d8f1a0ad6edb7` |
| `envelopes.json` | `7ca8c765a5443e9295618dbfa811efa9ad5a4b1ca963eadfe47eb9c0302fd5b9` |

## 18. Expectation Assessment and Constraints

`P0S5_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`. Desktop/Worker lifecycle,
reconnect and no-replay expectations were met without a Harness Core Patch.
Constraints remain: disposable adapters are not production code, exact formal
PowerShell reproduction provenance routes downstream, strict cross-process
event chronology is not claimed, and the global Core Patch inventory remains
incomplete.

## 19. Reviewer INFO Findings

RR-01 was `INFO / NON_BLOCKING / no corrective`. One Reviewer inline digest
recalculation used different sorting semantics and initially produced a
mismatch. A file-based replica matching formal `Sort-Object FullName`
case-insensitive semantics correctly reproduced
`2e1af8352a11810abe2668df0e941d9ff1b24dd28e91e32f90905e13b02537ef`.
The initial difference was a Reviewer script artifact, not a file change.

RR-02 was `INFO / NON_BLOCKING / no corrective`. F-01/F-02/F-03 wording is
accurate, consistent and bounded. References to byte-for-byte reproduction or
strict chronology occur only in explicit non-claim/correction contexts.

## 20. Downstream Routes

- Exact PowerShell 7 reproduction/provenance contract: P1 and P7.
- Deterministic event merge normalization and verifier assertion: P1.
- Production ownership for Worker Carrier, carrier bridge, Desktop lifecycle,
  projection and packaging: later phase contracts.
- Global Core Patch inventory: remaining P0.S steps; it is not complete at
  P0.S-5 closure.

## 21. P0.S-6 Gate Decision

P0.S-5 closure does not automatically authorize its successor. P0.S-6 requires
separate Architecture Owner planning/execution authorization.

```text
P0S6_ALLOWED = NO
P0S6_STATE = NOT_STARTED
READY_FOR_P0S6 = NO
```

No P0.S-6 plan, implementation, runtime or Gate was created by this closure.

## 22. Architecture Owner Formal Closure Decision

Architecture Owner accepted the Executor PASS, historical Independent Review
`PASS_WITH_REQUIRED_CORRECTIONS`, Documentation / Provenance Corrective PASS,
F-03 informational disposition, Corrective Re-Review PASS, all seven Gates,
`MET_WITH_CONSTRAINT` expectation assessment and `P0S5_CORE_PATCH_REQUIRED =
NO`.

```text
P0S5_FORMAL_CLOSURE_ALLOWED = YES
P0S5_FORMAL_CLOSURE = PASS
SHACO_FORGE_V1_0_P0S_5 = PASS
P0S5_STATE = CLOSED
P0S5_CORRECTIVE_REREVIEW_VERDICT = PASS
P0S5_CORRECTIVE_REREVIEW_ACCEPTED = YES
P0S5_CORRECTIVE_CLAIM_CONFIRMED = YES
P0S5_REMAINING_CORRECTIVE_FINDINGS = 0
P0S5_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT
P0S5_TECHNICALLY_READY_FOR_CLOSURE = YES
P0S5_CORE_PATCH_REQUIRED = NO
P0S_CORE_PATCH_INVENTORY_COMPLETE = NO
SHACO_FORGE_V1_0_P0S = IN_PROGRESS
P0S = IN_PROGRESS
P0S5_RUNTIME_RERUN_REQUIRED = NO
P0S5_FORMAL_RUN_REPLACED = NO
P0S5_SOURCE_SHA_CHAIN_PRESERVED = YES
P0S5_FORMAL_RAW_EVIDENCE_UNCHANGED = YES
P0S5_DOCUMENTATION_PACKAGING_CORRECTIVE = PASS
P0S5_CR_BYTE_GATE_CORRECTED = YES
P0S5_FROZEN_MIXED_EOL_PROFILE_CONFIRMED = YES
P0S5_FROZEN_JSON_CR_COUNT_TOTAL = 9691
P0S5_CR_AT_EOL_SEMANTIC_QUALIFICATION = ACCEPTED
P0S5_STAGED_RAW_BLOB_IDENTITY = PASS
P0S5_CLOSURE_COMMIT_PERFORMED = YES
P0S5_PUSH_PERFORMED = NO
COMMIT_PERFORMED = YES
PUSH_PERFORMED = NO
```

## 23. Documentation/Packaging Corrective and Closure Commit

The first historical Commit attempt produced raw `git diff --check` exit `0`
and exactly six safecrlf `LF will be replaced by CRLF` warnings for Current
State, Document Map, P0.S Feasibility Spike, V1.0 Development Map, Development
Log and Review Index. The former absolute-zero-output Gate incorrectly treated
those conversion notices as a blocker. A later Gate incorrectly required every
one of the 35 files to contain zero CR bytes. Architecture Owner withdrew that
Gate: the frozen `envelopes`, `host-truth`, `processes`, `run-manifest`,
`scenario-results` and `summary` JSON files contain respectively 225, 6644,
193, 58, 2526 and 45 CRLF pairs (`9691` total), no lone CR and one final bare
LF; the other 29 files contain no CR.

The accepted packaging path uses command-scoped `core.autocrlf=false` to stage
the raw worktree bytes and `cr-at-eol` to qualify only the line-ending CR for
Git whitespace semantics. It changes no persistent Git configuration and adds
no EOL policy file. All 27 experiment files, the 20/20 source hash chain and
the eight fixed Evidence/verifier hashes remain unchanged. Persistent checkout
and EOL policy is routed to P1/P7.

The earlier alternate-index initialization failure remains classified as an
incomplete execution preflight, not a technical Finding; this record does not
invent a root cause. The final deterministic repository-external preflight
proved the exact 35-path stage-0 set, raw blob identity, accepted mixed-EOL
profile, `9691` raw CR-at-EOL diagnostics and a zero-output qualified Gate
before the normal-hook Closure Commit. No Runtime was rerun and no Push was
performed. P0.S-6 remains separately gated and not started.

The next action is to return the completed P0.S-5 Closure Commit result to the
Architecture Owner. This record does not authorize Push or P0.S-6.
