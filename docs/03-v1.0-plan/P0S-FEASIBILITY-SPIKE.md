# P0.S — Desktop / Connection / Packaging Feasibility Spike

Status: READY_AFTER_P0 (`SHACO_FORGE_V1_0_P0S = NOT_STARTED`)

Execution is not authorized by P0 PASS. Begin only after `P0_CLOSURE_AUDIT = PASS`.

P0-7 frozen inputs (do not re-open P0; do not redesign this architecture):

- Evidence: `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`
- Hypothesis matrix: H-01 .. H-26 (all HARD_GATE)
- `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` until Spike inventory is complete
- Named Pipe remains `SHACO_CUSTOM_CARRIER_PLUGIN`
- Optional features (Jobs / Goal / Workflow / Ralph / Plan / Export UI / Images / Skills / marketplace) are not Hard Gates
- `/export` UI is not the binary-carrier gate
- ARM64 is not a P0.S release blocker
- Do not bundle PowerShell unless Architecture Owner later decides

## Goal

Use disposable evidence-producing prototypes to prove or falsify the highest-risk architecture assumptions before P1 freezes them.

Spike code is NOT production by default.

## P0.S-1 — Host Profile Feasibility

Prove a long-running Harness Host composition without browser webserver/HMR/token URL, using startup reload and the `standard` preset tool/command/subagent surface.

Hard evidence:

- HOST_PROFILE_WITHOUT_WEBSERVER
- HOST_LONG_RUNNING
- HOST_STANDARD_PRESET_TOOLS_PRESENT
- `P0S_CORE_PATCH_INVENTORY_COMPLETE` with explicit YES/NO per area (Host profile, Connection carrier, Client boot, Client modules, Native packaging). Do not infer NONE without inventory.

## P0.S-2 — Electron Client Boot

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

## P0.S-3 — Local Carrier + Trust

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
- stream
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

- `P0S_HOST_PROFILE_FEASIBLE` (Host without WebServer, long-running)
- `P0S_STANDARD_PRESET_TOOLS_PRESENT`
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
- `P0S_STREAM_PASS`
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
- `P0S_CORE_PATCH_INVENTORY_COMPLETE` (`CORE_PATCH_REQUIREMENT` stays `POSSIBLE_REQUIRES_P0S` until this inventory; do not assume NONE)

Why renamed/added vs the pre-P0-7 list: P0-6 public/preview boot seams allow an approved loading model, not only a custom scheme; P0-5 made User Question REQUIRED; P0.S-5 Worker-restart and Cordis omission need named falsifiable gates. Source: P0-7 evidence K. These corrections do not change Desktop + Worker dual-core architecture.