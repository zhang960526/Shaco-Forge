# P0.S — Desktop / Connection / Packaging Feasibility Spike

Status: READY_AFTER_P0

## Goal

Use disposable evidence-producing prototypes to prove or falsify the highest-risk architecture assumptions before P1 freezes them.

Spike code is NOT production by default.

## P0.S-1 — Host Profile Feasibility

Prove a long-running Harness Host composition without browser webserver/HMR/token URL, using startup reload and the `standard` preset tool/command/subagent surface.

Hard evidence:

- HOST_PROFILE_WITHOUT_WEBSERVER
- HOST_LONG_RUNNING
- HOST_STANDARD_PRESET_TOOLS_PRESENT
- HARNESS_CORE_PATCH_REQUIRED = explicit YES/NO

## P0.S-2 — Electron Client Boot

Prove packaged Harness Client boot under a secure custom scheme candidate.

Hard requirements:

- scheme loads dist
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
- cancel
- generation/reconnect
- `BINARY_CARRIER_PASS` using any real exact/binary path
- native picker or documented Desktop equivalent for REQUIRED Workspace behavior

Do not make `/export` itself REQUIRED solely to prove binary transport.

## P0.S-5 — Desktop Independence & Reconnect

Prove:

- close Desktop -> Worker survives
- crash Desktop -> Worker survives
- reopen -> same Worker discovered
- projection rebuilt from Host/Harness truth
- no duplicate resume authority
- no approval answer replay
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

P0.S must not PASS unless:

- HOST_PROFILE_WITHOUT_WEBSERVER or formally approved fallback
- HOST_LONG_RUNNING
- HOST_STANDARD_PRESET_TOOLS_PRESENT
- ELECTRON_RENDERER_BOOT
- CUSTOM_SCHEME
- NODE_INTEGRATION_REQUIRED = NO
- SETTINGS_PERSISTENCE_NOT_MEMORY
- LOCAL_CARRIER_FEASIBLE or formally approved fallback
- CURRENT_USER_ONLY
- COOKIE_NOT_PRODUCT_IDENTITY
- RENDERER_DIRECT_PIPE_ACCESS = NO
- UNARY / STREAM / APPROVAL / CANCEL / GENERATION pass
- BINARY_CARRIER_PASS
- NATIVE_PICKER equivalent pass
- DESKTOP_CLOSE/CRASH_WORKER_SURVIVES
- SECOND_DESKTOP_POLICY_PASS
- NO_DUPLICATE_RESUME
- NO_APPROVAL_REPLAY
- INBOX_CLIENT_MODULES_PASS
- NO_SYSTEM_NODE/PNPM
- PACKAGED_WORKER/HARNESS starts
- WORKER_RUNTIME_STRATEGY_PROVEN
- DSH_HOME_CONTROLLED
- WINDOWS_NATIVE_DEPENDENCIES_PASS
- HARNESS_CORE_PATCH_REQUIRED explicitly inventoried
