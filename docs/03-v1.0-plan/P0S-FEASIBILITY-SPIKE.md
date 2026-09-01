# P0.S — Desktop / Connection / Packaging Feasibility Spike

Status: IN_PROGRESS (`SHACO_FORGE_V1_0_P0S = IN_PROGRESS`)

Execution was authorized by `P0_CLOSURE_AUDIT = PASS` and `ALLOW_P0S = YES` in AUDIT-004B. P0.S-1 through P0.S-3 are `PASS / CLOSED` with Owner-accepted `PROVEN_WITH_CONSTRAINT` dispositions. P0.S remains `IN_PROGRESS`; P0.S-4 remains `NOT_STARTED` and disallowed.

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
classifications. This closes P0.S-3 only. Complete stream/Connection semantics
remain P0.S-4, PowerShell is not authorized for product bundling, and P0.S-4
remains `NOT_STARTED`.

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

## P0.S-4 — Connection Feature Completeness

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

Prefer build-time static inclusion of REQUIRED in-box Client modules.

Classify separately:

- tool-cordis
- cordis-host-runner
- cordis-client-runner
- ui-cordis

If not required for core boot/parity, remove/defer from V1.0 release baseline.

## P0.S-7 — Packaged Runtime Feasibility

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
