# P0.S — Desktop / Connection / Packaging Feasibility Spike

Status: IN_PROGRESS (`SHACO_FORGE_V1_0_P0S = IN_PROGRESS`)

Execution was authorized by `P0_CLOSURE_AUDIT = PASS` and `ALLOW_P0S = YES` in AUDIT-004B. P0.S-1 through P0.S-5 are `PASS / CLOSED` with Architecture Owner-accepted constrained dispositions. P0.S remains `IN_PROGRESS`; P0.S-6 is `BLOCKED_PENDING_RECOVERY_CONTRACT`. The Owner-approved `P0S6-MEC-20260903-01` lifecycle is `EXHAUSTED_INCONCLUSIVE` after two `PRE_HYPOTHESIS` attempts, neither of which launched Electron or reached the Runtime Gate. P0.S-6 has neither PASS nor a technical FAIL and is not closed. Only bounded governance-only Recovery Contract planning is authorized; Recovery implementation, dependency preparation, Runtime, Diagnostic, Formal, experiment Commit, Push, another physical attempt, and P0.S-7 are not authorized.

P0-7 frozen inputs (do not re-open P0; do not redesign this architecture):

- Evidence: `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`
- Hypothesis matrix: H-01 .. H-26 (all HARD_GATE)
- H-01 semantics: no stock `dsh-web-app` browser-facing HTTP/Web runtime; Cordis `webServer` **service** inject ≠ stock HTTP; Layer C stub/adapter = `PROVEN_WITH_CONSTRAINT`, not FAIL (AUDIT-004 F-01)
- H-07 semantics: streaming **contract**, not Client `rpc.open`-only (AUDIT-004 F-02)
- `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` until Spike inventory is complete (not NONE, not KNOWN_REQUIRED)
- Named Pipe remains `SHACO_CUSTOM_CARRIER_PLUGIN`
- Optional features (Jobs / Goal / Workflow / Ralph / Plan / Export UI / Images / Skills / marketplace) are not Hard Gates
- `/export` UI is not the binary-carrier gate
- ARM64 is not a P0.S release blocker
- Do not bundle PowerShell unless Architecture Owner later decides

## Goal

Use disposable evidence-producing prototypes to prove or falsify the highest-risk architecture assumptions before P1 freezes them.

Spike code is NOT production by default.

## P0.S-1 — Host Profile Feasibility — PASS / CLOSED

Closed state (2026-08-30):

- `SHACO_FORGE_V1_0_P0S_1 = PASS`
- `P0S1_STATE = CLOSED`
- `P0S1_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT`
- `P0S1_INDEPENDENT_REVIEW = PASS_WITH_REQUIRED_CORRECTIONS`
- `P0S1_DOCUMENTATION_CORRECTIVE = PASS`
- `P0S1_CORRECTIVE_REREVIEW = PASS`
- `P0S_HOST_PROFILE_FEASIBLE = PROVEN_WITH_CONSTRAINT`
- `ARCHITECTURE_OWNER_LAYER_C_CONSTRAINT_ACCEPTED = YES`
- `P0S1_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT`
- `HOST_LONG_RUNNING = YES`
- `P0S_STANDARD_PRESET_TOOLS_PRESENT = YES`
- `HOST_PROFILE_CORE_PATCH_REQUIRED = NO`
- `ADAPTER_OR_STUB_USED = YES`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- At P0.S-1 closure, P0.S-2 had not started.
- Evidence: `docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`

Review chain: AUDIT-005 = `PASS_WITH_REQUIRED_CORRECTIONS`; CORRECTIVE-005 =
`PASS`; AUDIT-005B = `PASS` with F-01/F-02/F-03 closed and
`P0S1_CAN_CLOSE = YES`; Architecture Owner disposition =
`ACCEPT_PROVEN_WITH_CONSTRAINT`. Other Core Patch areas remain
`UNRESOLVED / NOT_YET_TESTED`; the global inventory is not closed.

Prove a long-running Harness Host composition **without the stock `dsh-web-app` browser-facing HTTP/Web runtime** (no HMR, token URL, browser opener, LAN/browser-facing product host), using startup reload and the `standard` preset tool/command/subagent surface.

Do **not** interpret this as “no Cordis service named `webServer` may exist”. Connection/modules may hard-inject that **service contract**. A non-listening compatibility service / adapter / stub that does not expose stock HTTP, does not patch Harness Core, does not give Renderer direct Worker access, and does not restore `dsh-web-app` is `PROVEN_WITH_CONSTRAINT`, not FAIL. The Owner accepted this constraint for P0.S-1 only.

The accepted proof is intentionally unary-only: it establishes Host Profile,
Connection registry and Gateway invoke feasibility. It does not establish
`$events`, `$events/result`, stream lifecycle/cancel/backpressure,
approval/question settlement, complete cancel behavior or connection loss.
Those remain P0.S-4 hard evidence and are not silently closed by P0.S-1.

Hard evidence:

- `P0S_HOST_PROFILE_FEASIBLE` (meanings: PASS / PROVEN_WITH_CONSTRAINT / FAIL — see P0-7 H-01)
- HOST_LONG_RUNNING
- `P0S_STANDARD_PRESET_TOOLS_PRESENT` (shipped `standard` loads; P0-5 REQUIRED tool subset usable — not a product Hard Gate for Jobs/Goal/Workflow/Ralph/Plan/Skills/web tools)
- `P0S_CORE_PATCH_INVENTORY_COMPLETE` with explicit YES/NO per area (`HOST_PROFILE_CORE_PATCH_REQUIRED`, `CONNECTION_CARRIER_CORE_PATCH_REQUIRED`, `CLIENT_BOOT_CORE_PATCH_REQUIRED`, `CLIENT_MODULE_CORE_PATCH_REQUIRED`, `NATIVE_PACKAGING_CORE_PATCH_REQUIRED`) plus `ADAPTER_OR_STUB_USED` (Surface / Why / PublicOrPreviewSeamUsed / ProductionImpact). Adapter/stub is not a Core Patch. Do not infer NONE without inventory.

## P0.S-2 — Electron Client Boot — PASS / CLOSED

Closure state (2026-08-31):

- `SHACO_FORGE_V1_0_P0S_2 = PASS`
- `P0S2_STATE = CLOSED`
- `P0S2_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT`
- `P0S2_INDEPENDENT_REVIEW = PASS`
- `P0S2_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT`
- `ARCHITECTURE_OWNER_P0S2_CONSTRAINTS_ACCEPTED = YES`
- `P0S_ELECTRON_RENDERER_BOOT = YES`
- `P0S_CUSTOM_SCHEME_OR_APPROVED_LOADING_MODEL = YES`
- `CLIENT_INITIALIZED = YES`
- `SESSION_UI_ENTERABLE = YES`
- `NODE_INTEGRATION_REQUIRED = NO`
- `P0S_SETTINGS_PERSISTENCE = YES`
- `SETTINGS_PERSISTENCE_NOT_MEMORY = YES`
- `SETTINGS_SURVIVES_FULL_DESKTOP_RESTART = YES`
- `STOCK_DSH_WEB_APP_REQUIRED = NO`
- `PRIVATE_OR_INTERNAL_LOADER_USED = NO`
- `CLIENT_BOOT_CORE_PATCH_REQUIRED = NO`
- `ADAPTER_OR_STUB_USED = YES`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- At P0.S-2 closure, `P0S3_ALLOWED = NO`; that value did not start P0.S-3.
- Evidence: `docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md`
- Independent Review: `docs/05-reviews/architecture/AUDIT-006-P0S2-INDEPENDENT-REVIEW.md`

AUDIT-006 independently confirmed the Executor claim, H-03, H-04 and H-15
boot wiring, with no blocking Finding. The Architecture Owner accepted the
strict-CSP loader and Settings capability constraints for P0.S-2 only and
classified the preload bridge, frozen fixture and `ownsHost` hook as
`NON_CORE_ADAPTER`. F-05 routes to P4, F-09 routes to P1/P7, and formal
Carrier/trust wiring remained P0.S-3/P1 work at P0.S-2 closure. The P0.S-2
Spike remains `NOT_PRODUCTION`; the later explicit P0.S-3 Executor run is
recorded separately below.

Prove packaged Harness Client boot under a secure custom scheme **or an approved Electron Renderer loading model** that uses documented/preview public boot seams.

Hard requirements:

- scheme or approved loading model loads dist
- Client initializes
- session UI can be entered
- settings persistence remains durable (not loopback-memory fallback)
- nodeIntegration off
- contextIsolation on
- sandbox on

Do not make OPTIONAL workspace/model UI completeness a boot gate.

## P0.S-3 — Local Carrier + Trust — PASS / CLOSED

Closure state (2026-08-31):

- `SHACO_FORGE_V1_0_P0S_3 = PASS`
- `P0S3_FORMAL_CLOSURE = PASS`
- `P0S3_STATE = CLOSED`
- `P0S3_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT`
- `P0S3_INDEPENDENT_REVIEW_VERDICT = PASS`
- `P0S3_EXECUTOR_CLAIM_CONFIRMED = YES`
- `RUNTIME_REPRODUCED = YES`
- `P0S3_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT`
- `ARCHITECTURE_OWNER_P0S3_CONSTRAINTS_ACCEPTED = YES`
- `P0S3_NAMED_PIPE_CARRIER_FOUNDATION = PROVEN`
- `P0S_UNARY_PASS = YES`
- `P0S3_STREAM_CONCURRENCY_DEMONSTRATED = YES`
- `P0S_LOCAL_TRUST_FEASIBLE = YES`
- `CURRENT_USER_ONLY = YES`
- `COOKIE_NOT_PRODUCT_IDENTITY = YES`
- `RENDERER_DIRECT_PIPE_ACCESS = NO`
- `RENDERER_REUSABLE_WORKER_CREDENTIAL = NO`
- `AUTHENTICATION_BEFORE_GATEWAY = YES`
- `WORKER_IDENTITY_ENDPOINT_VALIDATED = YES`
- `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`
- `ADAPTER_OR_STUB_USED = YES`
- `OWNER_DECISION_REQUIRED = YES`
- `P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `P0S4_ALLOWED = NO`
- Evidence: `docs/06-testing-acceptance/evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md`
- Independent Review: `docs/05-reviews/architecture/AUDIT-007-P0S3-INDEPENDENT-REVIEW.md`

The Executor used a real Windows Named Pipe with an explicitly protected
current-user DACL. A per-start challenge/HMAC bound protocol version, SID,
Worker identity, endpoint identity and correlation ID before route allowlisting
or Gateway dispatch. Renderer remained sandboxed behind one allowlisted preload
method and received neither the pipe path nor reusable Worker credential. The
authenticated carrier completed 38 actual Harness Gateway unary calls, a
24-request correlation batch, five payload sizes and three concurrent basic
stream framing channels. Nine fail-closed negative cases each observed zero
Gateway dispatch before the positive phase.

AUDIT-007 returned `PASS`, confirmed the Executor claim and independently
reproduced the core runtime gates with the same experiment source and a
repository-external temporary Node driver. The formal PowerShell 7 runner was
not executed unchanged because the Reviewer machine had no `pwsh`; F-01 records
that provenance. F-02 through F-04 record bounded nonce state, the hard-coded
Electron version and the layered TCP-listener probe. All four Findings are
informational and non-blocking.

The Architecture Owner accepted `ACCEPT_PROVEN_WITH_CONSTRAINT`. The managed
carrier helper, PowerShell launcher, inherited-stdio bridge, non-listening
Connection compatibility surface, Electron IPC adapter and deterministic
basic-stream producer retain their recorded `NOT_PRODUCTION` adapter/stub
classifications. This closed P0.S-3 only. At that closure, complete stream/
Connection semantics still belonged to P0.S-4 and P0.S-4 was `NOT_STARTED`;
PowerShell was not authorized for product bundling.

Preferred topology:

```text
Renderer -> Electron IPC -> Main -> Named Pipe -> Worker
```

Pre-classify Named Pipe as `SHACO_CUSTOM_CARRIER_PLUGIN` unless evidence proves a stronger documented seam.

Hard requirements:

- Renderer never opens pipe directly
- current-user SID ACL
- Worker identity / endpoint
- Browser cookie not product identity
- unary + stream concurrency demonstrated
- payload/framing evidence captured for P1

## P0.S-4 — Connection Feature Completeness — PASS / CLOSED

Formal closure state (2026-09-01):

- `ALLOW_P0S4 = YES`
- `P0S4_ALLOWED = YES`
- `SHACO_FORGE_V1_0_P0S_4 = PASS`
- `P0S4_FORMAL_CLOSURE = PASS`
- `P0S4_STATE = CLOSED`
- `P0S4_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT`
- `P0S4_INDEPENDENT_REVIEW_VERDICT = PASS`
- `P0S4_REVIEW_RECOMMENDATION = ACCEPT_PROVEN_WITH_CONSTRAINT`
- `P0S4_DOCUMENTATION_AND_MEASUREMENT_CORRECTIVE = PASS`
- `F01_RESET_MEASUREMENT_STATUS = APPLIED`
- `F02_TEMP_HYGIENE_STATUS = APPLIED`
- `P0S4_CORRECTIVE_REREVIEW_VERDICT = PASS`
- `P0S4_CORRECTIVE_REREVIEW_ACCEPTED = YES`
- `P0S4_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`
- `P0S4_TECHNICALLY_READY_FOR_CLOSURE = YES`
- `P0S_UNARY_PASS = YES`
- `P0S_STREAM_PASS = YES`
- `P0S_EVENT_GENERATION_PASS = YES`
- `P0S_APPROVAL_PASS = YES`
- `P0S_USER_QUESTION_PASS = YES`
- `P0S_CANCEL_PASS = YES`
- `P0S_BINARY_CARRIER_PASS = YES`
- `P0S_NATIVE_PICKER_OR_EQUIVALENT_PASS = YES`
- `P0S4_NO_DUPLICATE_APPROVAL_SETTLEMENT = YES`
- `P0S4_NO_DUPLICATE_USER_QUESTION_SETTLEMENT = YES`
- `P0S_LOCAL_CARRIER_FEASIBLE = YES`
- `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`
- `ADAPTER_OR_STUB_USED = YES`
- `OWNER_DECISION_REQUIRED = NO`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `P0S5_ALLOWED = NO`
- `P0S5_STATE = NOT_STARTED`
- `READY_FOR_P0S5 = NO`
- Evidence: `docs/06-testing-acceptance/evidence/P0S-4-CONNECTION-FEATURE-COMPLETENESS-EVIDENCE.md`
- Independent Review / Corrective Re-Review / Formal Closure: `docs/05-reviews/architecture/AUDIT-008-P0S4-INDEPENDENT-REVIEW.md`

Independent Review returned `PASS` with recommendation
`ACCEPT_PROVEN_WITH_CONSTRAINT`; F-01 LOW/NON_BLOCKING required a measurement
corrective before closure. Corrective run
`1f16242307b04bc19cf1b9cb8295d813` passed the authenticated
current-user Windows Named Pipe regression, real Connection unary, complete
`typertGateway.wireStream.open` lifecycle, connection loss, bounded
backpressure, reconnect-safe approval and user-question settlement, explicit
`session/cancel`, exact raw binary bytes, and documented Electron native
directory picker success/cancel. Four real `$events.ready` records each caused
exactly one actual test-owned Desktop-equivalent projection invalidation and
repull request; no reset occurred before ready and no generation was reset
twice. Frozen Harness did not emit a named `connection/reset` wire event. The
final event subscription was explicitly terminated, all stream/binary and
process counts reached zero, and Frozen Harness stayed clean. F-02 validated
and irreversibly deleted all 18 exact current-user TEMP P0.S-4 runtime
directories; undeleted and remaining counts are zero.

The carrier, deterministic Remote/exact fixture, desktop generation adapter,
and native picker adapter are `NOT_PRODUCTION` and require no Harness Core
patch. The native-picker runner requires two user UI actions, which is the
recorded constraint. Independent Corrective Re-Review run
`ed73b7779ab64c3ab4bbfde64011bf98` passed 146 checks, confirmed F-01/F-02 and
recommended closure. The Reviewer used an equivalent temporary Driver rather
than byte-for-byte execution of the PowerShell 7 launcher and did not modify
project files. The Architecture Owner accepted the re-review and closed P0.S-4
as `MET_WITH_CONSTRAINT`. Full Desktop lifecycle answer replay remains P0.S-5;
neither `P0S_NO_APPROVAL_REPLAY` nor `P0S_NO_QUESTION_REPLAY` is set by P0.S-4.

Hard:

- unary
- stream **contract** (open / AsyncIterable / item order / error / end / cancel / concurrency / connection loss / backpressure) via `rpc.open` **or** `__DSH_TRANSPORT__.openStream` / Host `wireStream` (or equivalent public/preview seam). Client `rpc.open` is optional and is not a product Hard Gate by itself.
- approval
- user question
- cancel
- generation/reconnect
- `BINARY_CARRIER_PASS` using any real exact/binary path
- native picker or documented Desktop equivalent for REQUIRED Workspace behavior
- no duplicate approval settlement
- no duplicate user-question settlement

Do not make `/export` itself REQUIRED solely to prove binary transport.

## P0.S-5 — Desktop Independence & Reconnect

Current gate state after Architecture Owner Formal Closure:

- `P0S5_FORMAL_CLOSURE_ALLOWED = YES`
- `P0S5_FORMAL_CLOSURE = PASS`
- `SHACO_FORGE_V1_0_P0S_5 = PASS`
- `P0S5_STATE = CLOSED`
- `P0S5_EXECUTOR_VERDICT = PASS`
- `P0S5_INDEPENDENT_REVIEW_VERDICT = PASS_WITH_REQUIRED_CORRECTIONS`
- `P0S5_EXECUTOR_CLAIM_CONFIRMED = YES`
- `P0S5_DOCUMENTATION_AND_PROVENANCE_CORRECTIVE = PASS`
- `P0S5_F01_PROVENANCE_STATUS = RECORDED`
- `P0S5_F02_MERGE_SEMANTICS_STATUS = RECORDED_AND_ROUTED`
- `P0S5_F03_SUMMARY_BOOLEAN_STATUS = RECORDED_INFORMATIONAL`
- `P0S5_CORRECTIVE_REREVIEW_VERDICT = PASS`
- `P0S5_CORRECTIVE_REREVIEW_ACCEPTED = YES`
- `P0S5_CORRECTIVE_CLAIM_CONFIRMED = YES`
- `P0S5_F01_PROVENANCE_CORRECTION_CONFIRMED = YES`
- `P0S5_F02_MERGE_SEMANTICS_CORRECTION_CONFIRMED = YES`
- `P0S5_F03_INFORMATIONAL_RECORD_CONFIRMED = YES`
- `P0S5_CORRECTIVE_SCOPE_EXACT = YES`
- `P0S5_TECHNICAL_GATE_INTEGRITY_PRESERVED = YES`
- `P0S5_REMAINING_CORRECTIVE_FINDINGS = 0`
- `P0S5_RUNTIME_RERUN_REQUIRED = NO`
- `P0S5_FORMAL_RUN_REPLACED = NO`
- `P0S5_SOURCE_SHA_CHAIN_PRESERVED = YES`
- `P0S5_FORMAL_RAW_EVIDENCE_UNCHANGED = YES`
- `P0S5_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`
- `P0S5_TECHNICALLY_READY_FOR_CLOSURE = YES`
- `P0S5_CORE_PATCH_REQUIRED = NO`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `P0S6_MEC_20260903_01_STATE = EXHAUSTED_INCONCLUSIVE`
- `P0S6_STATE = BLOCKED_PENDING_RECOVERY_CONTRACT`
- `P0S6_CONTRACT_ID = P0S6-MEC-20260903-01`
- `P0S6_MINIMAL_CONTRACT = FROZEN_OWNER_APPROVED`
- `P0S6_MAXIMUM_PHYSICAL_ATTEMPTS = 2`
- `P0S6_PHYSICAL_ATTEMPTS_USED = 2`
- `P0S6_PHYSICAL_ATTEMPTS_REMAINING = 0`
- `P0S6_THIRD_ATTEMPT = NOT_AUTHORIZED`
- `P0S6_RUNTIME_GATE_REACHED = NO`
- `P0S_INBOX_CLIENT_MODULES_PASS = NOT_PROVEN`
- `P0S_CORDIS_OMISSION_PASS = NOT_PROVEN`
- `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`
- `P0S6_DEPENDENCY_CACHE_READINESS = NOT_READY_PROVEN`
- `P0S6_TECHNICAL_CLOSURE_READY = NO`
- `P0S6_RECOVERY_CONTRACT_PLANNING = AUTHORIZED_BOUNDED_GOVERNANCE_ONLY_CONTRACT_ONLY`
- `P0S6_RECOVERY_IMPLEMENTATION = NOT_AUTHORIZED`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_DIAGNOSTIC = NOT_AUTHORIZED`
- `P0S6_FORMAL = NOT_AUTHORIZED`
- `P0S6_HARNESS_CORE_MUTATION = NOT_AUTHORIZED`
- `P0S6_COMMIT_EXPERIMENT = NOT_AUTHORIZED`
- `P0S6_PUSH = NOT_AUTHORIZED`
- `P0S7_ALLOWED = NO`
- `P0S5_CLOSURE_COMMIT_PERFORMED = YES`
- `P0S5_PUSH_PERFORMED = NO`
- `P0S_DESKTOP_CLOSE_WORKER_SURVIVES = YES`
- `P0S_DESKTOP_CRASH_WORKER_SURVIVES = YES`
- `P0S_SECOND_DESKTOP_POLICY_PASS = YES`
- `P0S_WORKER_RESTART_RECONNECT_PASS = YES`
- `P0S_NO_DUPLICATE_RESUME = YES`
- `P0S_NO_APPROVAL_REPLAY = YES`
- `P0S_NO_QUESTION_REPLAY = YES`

The frozen Contract defines the evidence below but does not make predecessor
closure an automatic successor authorization. The bounded P0.S-5 Executor,
Independent Review, Documentation / Provenance Corrective and Corrective
Re-Review have completed. The Architecture Owner accepted the chain and closed
P0.S-5. The Formal Closure itself did not automatically authorize Commit or
P0.S-6. Architecture Owner subsequently issued a separate bounded Closure
Commit authorization, and commit
`01ff17129b34a2831d4d45217d44483654b7ac43` completed that action without Push.
That Commit did not authorize P0.S-6 planning or execution. Historically, the
later Architecture Owner Authority Alignment authorized bounded, read-only,
contract-only planning, followed by approval of `P0S6-MEC-20260903-01` for a
maximum of two physical attempts. That pre-execution authority is now
superseded by the Owner's execution outcome: MEC-01 is
`EXHAUSTED_INCONCLUSIVE`, P0.S-6 is `BLOCKED_PENDING_RECOVERY_CONTRACT`, and no
physical attempt remains. Diagnostic, Formal, Harness Core mutation,
experiment Commit, Push, another attempt, and P0.S-7 remain not authorized.

CF-01 seam correction is binding for this execution. Frozen Harness exposes
the Connection Client, generation/client identity, real `$events.ready`,
Gateway, and Host lifecycle seams; it does not emit a named
`connection/reset` wire event. Real transport loss, Worker identity
`LOST/REPLACED`, authenticated generation replacement, and real ready records
causally drive test-owned `NOT_PRODUCTION` Desktop-equivalent projection
invalidation, repull request, and Host truth rebuild records. Verifier results
must be derived from that raw causal chain, never from a reset constant or
preselected count.

Executor Evidence is
`docs/06-testing-acceptance/evidence/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT-EVIDENCE.md`.
The accepted review and closure chain is persisted in
`docs/05-reviews/architecture/AUDIT-009-P0S5-INDEPENDENT-REVIEW.md`.
Formal run `9f79aa5566ad4f6aac08502dc1943c37` passed 244 verifier checks and all
seven gates. Independent Review returned `PASS_WITH_REQUIRED_CORRECTIONS` and
confirmed the Executor claim. Repository-external equivalent Node driver run
`000ff24c78c0495a95695adc7f1c4c89` executed S01-S11 against the same 20/20
source bytes, Worker Carrier C# source, Frozen Harness Host/profile, Electron
35.7.5, environment contract, PID/start-time identity and process-tree
force-kill semantics. It independently reproduced 697 event records, 18
Desktop process records, two Worker authorities, 19 real `$events.ready`, three
invalidations, 19 repulls, 37 Host truth rebuilds, `0 ms` authority overlap,
all seven gates and 222/222 equivalent checks. The Reviewer machine had no
PowerShell 7 and no network for installation; it did not execute
`run-spike.ps1` or `verify-summary.ps1` byte-for-byte. Exact PowerShell 7
reproduction/provenance is routed to P1/P7.

F-02 records that persisted `globalSequence` is a contiguous merge ordinal,
not a reliable cross-process wall-clock total order. Re-sorting the formal 697
records by `(utc, source, sourceSequence)` changes 546 positions. `utc` and
`monotonicTicks` remain source-local observation metadata. Cross-source Gate
causality is established by record links, producer `sourceSequence`, exact
PID/start-time lifecycle, Worker/Desktop identity, generation/clientId, Host
truth and exact envelope/settlement records; all existing Gate results remain
valid. A deterministic merge-normalization contract and assertion route to P1.

F-03 records that `hardGatePlannedAndExecuted`, `desktopRemainedAlive` and
`hostSideStartResumeCountsVerified` are derived summary booleans, not original
authority. Review re-derived their claims from raw records and did not use the
booleans for self-proof. No verifier, summary, source, raw Evidence or runtime
change is required. Corrective Re-Review returned `PASS`, confirmed exact
corrective scope and technical Gate integrity, and reported zero remaining
corrective Findings without Runtime or a new runId. Architecture Owner accepted
the re-review and closed P0.S-5 as `MET_WITH_CONSTRAINT`. At that historical
closure boundary, P0.S-6 planning and execution were both disallowed. The later
Authority Alignment and MEC-01 execution approval are also historical; the
current outcome is the exhausted, blocked state recorded in the P0.S-6 section
below.

Prove:

- close Desktop -> Worker survives
- crash Desktop -> Worker survives
- reopen -> same Worker discovered
- projection rebuilt from Host/Harness truth
- no duplicate resume authority
- no approval answer replay
- no user-question answer replay
- second Desktop instance follows a safe single-instance/attach policy
- Worker restart while Desktop is connected has defined behavior/evidence

## P0.S-6 — Client Modules / Plugin Frontend

### Current Governance Authority

- MEC-01 lifecycle: `P0S6_MEC_20260903_01_STATE = EXHAUSTED_INCONCLUSIVE`.
- Step state: `P0S6_STATE = BLOCKED_PENDING_RECOVERY_CONTRACT`; P0.S-6 has no
  PASS or technical FAIL, is not closed, and is not ready for technical closure.
- Attempt budget: `P0S6_PHYSICAL_ATTEMPTS_USED = 2`,
  `P0S6_PHYSICAL_ATTEMPTS_REMAINING = 0`, and
  `P0S6_THIRD_ATTEMPT = NOT_AUTHORIZED`.
- Runtime state: `P0S6_RUNTIME_GATE_REACHED = NO`,
  `P0S_INBOX_CLIENT_MODULES_PASS = NOT_PROVEN`,
  `P0S_CORDIS_OMISSION_PASS = NOT_PROVEN`, and
  `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`.
- Dependency state: `P0S6_DEPENDENCY_CACHE_READINESS = NOT_READY_PROVEN`.
- Planning authority:
  `P0S6_RECOVERY_CONTRACT_PLANNING = AUTHORIZED_BOUNDED_GOVERNANCE_ONLY_CONTRACT_ONLY`.
- Not authorized: Recovery implementation, dependency download/cache
  preparation, Runtime, Diagnostic, Formal, Harness Core mutation, experiment
  Commit, Push, another physical attempt, or P0.S-7.

### MEC-01 Attempt Ledger

- Attempt #1: `999bbd1e-9301-49ad-9021-30da7c879f9e`;
  `PRE_HYPOTHESIS`; first failure boundary `RUNNER_PREFLIGHT`; collection-shape
  defect; `attempt.json` SHA-256
  `bdcbd0579238f07fff28e420b1529cf9cf13fe38652cb6d18dd5d0bc11a77d46`.
- Attempt #2: `76bc4e8a-fb0c-4e92-a750-b555e6a57e41`;
  `PRE_HYPOTHESIS`; first failure boundary `DEPENDENCY_SETUP`; offline cache
  incomplete with `ENOTCACHED` for
  `https://registry.npmjs.org/env-paths/-/env-paths-2.2.1.tgz`; `attempt.json`
  SHA-256 `c6646264f2cb6e20d59d6dc913d8dc1753557b192a472ccc48c16b09a6107a88`;
  `preflight.json` SHA-256
  `bc1dfb1e1f2537e2f1f8eb999b21037af4c662053637ec3d84199388d7fc03e5`.
- Both attempts launched Electron zero times, stopped before the Runtime Gate,
  and generated no H-05/H-20 Runtime Evidence. Attempt #1 generated no
  `preflight.json`; neither attempt generated `runtime.json`, `runtime.log`, or
  `verification.json`.

Attempt #2 raw `attempt.json` keeps immutable early-stop fallback values
`physicalAttemptsUsed=1`, `attempt2Executed=false`, and
`clientModuleCorePatchRequired="NO"`. They are not authoritative governance
state. The actual invocation ledger prevails: Attempt #2 executed, two physical
attempts were used, zero remain, and Core Patch necessity is `UNRESOLVED`.

The partial `node_modules`, `.npm-cache`, and `runtime-data` directories are
failed-attempt outputs only. They do not prove Dependency Readiness, are not
Runtime Evidence, and cannot establish H-05 or H-20. They are not deleted,
modified, or committed by this documentation action.

### Bounded Recovery Contract Planning Entry

Draft P0.S-6 Dependency Readiness Recovery Contract under bounded governance-only planning authority.
Do not prepare dependencies, run Electron, or authorize another physical attempt.

The future Contract's design targets are limited to separating Dependency
Readiness from a physical Runtime attempt; validating the complete lockfile
dependency closure rather than chasing an individual missing tarball;
validating package integrity; proving `npm ci --offline` can complete before
any new Electron attempt; and rejecting partial cache state as ready. This
entry selects no command, download plan, attempt budget, or execution strategy.
Any new physical attempt requires a later, separate Architecture Owner decision.

Prefer build-time static inclusion of REQUIRED in-box Client modules.

Classify separately:

- tool-cordis
- cordis-host-runner
- cordis-client-runner
- ui-cordis

If not required for core boot/parity, remove/defer from V1.0 release baseline.

## P0.S-7 — Packaged Runtime Feasibility — NOT_STARTED / NOT_AUTHORIZED

Fresh Windows environment:

- no global Node
- no pnpm
- no manual Harness install

Must prove one Worker runtime strategy, not leave it unresolved. Evaluate bundled Node sidecar vs any alternative using actual ABI/native requirements.

Hard checks:

- no system Node/pnpm
- packaged Worker/Harness start
- controlled user-writable DSH_HOME
- default persistence assumptions (JSONL unless P0 proves otherwise)
- Windows ACL sandbox, not Linux Landlock as Windows gate
- asar/unpack/native/spawn paths
- production node_modules closure
- PowerShell/helper paths
- CPU arch policy (V1.0 may be x64-only)

Code signing is not a P0.S hard gate.

## P0.S-8 — Closure

Every hypothesis:

- PROVEN
- PROVEN_WITH_CONSTRAINT
- FAILED
- UNRESOLVED

Must record evidence, constraint, production impact, required P1 contract, fallback, and core patch requirement.

## Failure Branch

If no-HTTP Named Pipe carrier is not feasible at acceptable cost:

- Fallback A: Desktop/Worker remain separate; Worker-private loopback HTTP, localhost-only, product trust still constrained.
- Fallback B: Host in Electron Main; requires Architecture Owner re-approval because it breaks Desktop-close Worker-survives.

No third product path is currently required.

## Hard Gate

Authority for the frozen names: P0-7 evidence section K. P0.S must not PASS unless all of the following are YES:

- `P0S_HOST_PROFILE_FEASIBLE` (no stock browser-facing `dsh-web-app` Web product stack for REQUIRED Worker runtime; not “no Cordis `webServer` service”. PASS / PROVEN_WITH_CONSTRAINT / FAIL)
- `P0S_STANDARD_PRESET_TOOLS_PRESENT` (shipped `standard` loads; REQUIRED tool subset usable; optional standard tools are not Product Release Hard Gates)
- `P0S_ELECTRON_RENDERER_BOOT`
- `P0S_CUSTOM_SCHEME_OR_APPROVED_LOADING_MODEL`
- `NODE_INTEGRATION_REQUIRED = NO`
- `P0S_SETTINGS_PERSISTENCE` (not-memory)
- `P0S_LOCAL_CARRIER_FEASIBLE` or formally approved Fallback A
- `P0S_LOCAL_TRUST_FEASIBLE`
- `CURRENT_USER_ONLY`
- `COOKIE_NOT_PRODUCT_IDENTITY`
- `RENDERER_DIRECT_PIPE_ACCESS = NO`
- `P0S_UNARY_PASS`
- `P0S_STREAM_PASS` (streaming contract; not `rpc.open`-only)
- `P0S_EVENT_GENERATION_PASS`
- `P0S_APPROVAL_PASS`
- `P0S_USER_QUESTION_PASS`
- `P0S_CANCEL_PASS`
- `P0S_BINARY_CARRIER_PASS`
- `P0S_NATIVE_PICKER_OR_EQUIVALENT_PASS`
- `P0S_DESKTOP_CLOSE_WORKER_SURVIVES`
- `P0S_DESKTOP_CRASH_WORKER_SURVIVES`
- `P0S_SECOND_DESKTOP_POLICY_PASS`
- `P0S_WORKER_RESTART_RECONNECT_PASS`
- `P0S_NO_DUPLICATE_RESUME`
- `P0S_NO_APPROVAL_REPLAY`
- `P0S_NO_QUESTION_REPLAY`
- `P0S_INBOX_CLIENT_MODULES_PASS`
- `P0S_CORDIS_OMISSION_PASS`
- `P0S_NO_SYSTEM_NODE`
- `P0S_NO_SYSTEM_PNPM`
- `P0S_PACKAGED_WORKER`
- `P0S_PACKAGED_HARNESS`
- `P0S_WORKER_RUNTIME_STRATEGY_PROVEN` (cannot remain UNRESOLVED)
- `P0S_DSH_HOME_CONTROLLED`
- `P0S_WINDOWS_NATIVE_DEPENDENCIES`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE` (`CORE_PATCH_REQUIREMENT` stays `POSSIBLE_REQUIRES_P0S` until this inventory; do not assume NONE; per-area YES/NO plus `ADAPTER_OR_STUB_USED`; adapter/stub ≠ Core Patch)

Why renamed/added vs the pre-P0-7 list: P0-6 public/preview boot seams allow an approved loading model, not only a custom scheme; P0-5 made User Question REQUIRED; P0.S-5 Worker-restart and Cordis omission need named falsifiable gates. Source: P0-7 evidence K. These corrections do not change Desktop + Worker dual-core architecture.
