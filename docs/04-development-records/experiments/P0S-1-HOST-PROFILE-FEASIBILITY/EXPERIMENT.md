# EXP-P0S-1 — Host Profile Feasibility

Status: CLOSED

Classification: `NOT_PRODUCTION`

## Hypothesis

Frozen Harness `dsh --profile shaco-host` can keep a Host alive when the
profile composes `@deepseek-ai/dsh-base` plus a Shaco bundle, without the stock
`dsh-web-app` HTTP/Web product stack. REQUIRED Host, Gateway, generated
Remote/Typert, Connection-side and shipped `standard` surfaces remain
composable without a Harness Core patch.

## Why This Matters

P1 cannot freeze the Desktop + Worker boundary until the production Worker
entry, Host-only composition and Connection seam are shown to exist on the
frozen baseline. A false positive based on `boot()`, source imports, a copied
preset or hidden stock Web runtime would invalidate later design work.

## Baseline

- Shaco Forge: `ae9080a3e4efdf0cb7075e0a46090532941e2409`
- Frozen Harness: `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- Package: `0.1.2-alpha.1`
- `pnpm-lock.yaml` SHA256:
  `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`
- Frozen Harness clean before and after.

## Setup

- Official built launcher equivalent:
  `node apps/cli/lib/bin.js --profile shaco-host`
- Profile: `@shaco-forge/not-production-p0s1-host-profile`
- Bundle: `@shaco-forge/not-production-p0s1-host-bundle`
- Composition: `@deepseek-ai/dsh-base` plus the disposable bundle.
- Formal runner: `run-spike.ps1`, requiring PowerShell 7 (`pwsh`) because it
  uses the .NET Core `ProcessStartInfo.ArgumentList` and
  `ProcessStartInfo.Environment` APIs. Windows PowerShell 5.1 cannot run it
  unchanged. A PS 5.1-compatible runner or equivalent commands may mirror the
  command, environment-variable and observation semantics, but cannot be
  reported as an unchanged execution of the formal runner.
- Node is invoked by absolute path because the restricted child-process PATH
  does not reliably resolve `node`. This is a Spike environment measure, not a
  production startup contract or global-Node requirement; P0.S-7 must still
  prove no packaged Worker dependency on system Node/pnpm.
- Each execution receives a new OS temporary `DSH_HOME`; no global pnpm or
  source/tsx launcher is a runtime assumption.
- Layer C uses the package-root `HostConnectionService` preview public export,
  a non-listening Connection registry and fail-closed no-token auth facade.

## Procedure

1. Verify both Git baselines, package version and lockfile hash.
2. Run the frozen Host and Client library build faces required by the built
   launcher; verify the Frozen Harness Git/lock state remains unchanged.
3. Validate the profile with `--dump-config`.
4. Start the Host twice through the official built CLI, wait for hard-injected
   REQUIRED services, observe for 20 seconds and 10 seconds, record listener
   and child-process snapshots, request SIGTERM disposal, and record exit.
5. Load the shipped `standard` preset directly, enumerate the P0-5 REQUIRED
   tools, perform bounded safe calls, and invoke generated Remote
   `agentPresets/list` through the Gateway.
6. Verify Layer B identities, BrowserAuth/token/HMR/browser opener and product
   listeners are absent; verify no forbidden source imports or Harness diff.

## Evidence

Final runtime:
`C:\Users\18902\AppData\Local\Temp\shaco-forge-p0s1-d4ede59130ec436e8a343582704718ca`.
The disposable runtime may be removed without affecting this record. Complete
commands, hashes and results are retained in
`docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`.

Key facts:

- Run 1 PID 32780: ready, alive after 20 seconds, zero listeners, zero child
  processes, graceful disposal, exit 0.
- Run 2 PID 41040: ready, alive after 10 seconds, zero listeners, zero child
  processes, graceful disposal, exit 0.
- `webServer` service absent; stock `dsh-web-app`, host Web server, HMR and
  Client modules absent from the active composition.
- Typert: 9 generated Host packages and 58 Host invocations; Gateway
  `agentPresets/list` returned a roster containing `standard`.
- Shipped `standard` SHA256:
  `f04fbc6ec6d38aab78f18690c293ddcb76293107f7e6cd157904b7c0e83094bd`;
  not copied or forked.
- All REQUIRED tool identities present; safe probes succeeded. `send_message`
  reached its tool and returned the expected unavailable-child domain error.

## Verdict

PROVEN_WITH_CONSTRAINT

`SHACO_FORGE_V1_0_P0S_1 = PASS`

`P0S1_STATE = CLOSED`

`P0S1_INDEPENDENT_REVIEW = PASS_WITH_REQUIRED_CORRECTIONS`

`P0S1_DOCUMENTATION_CORRECTIVE = PASS`

`P0S1_CORRECTIVE_REREVIEW = PASS`

`ARCHITECTURE_OWNER_LAYER_C_CONSTRAINT_ACCEPTED = YES`

`P0S1_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT`

`HOST_LONG_RUNNING = YES`

`P0S_STANDARD_PRESET_TOOLS_PRESENT = YES`

`HOST_PROFILE_CORE_PATCH_REQUIRED = NO`

`ADAPTER_OR_STUB_USED = YES`

`P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`

`P0S2 = NOT_STARTED`

The Executor result remains constrained. AUDIT-005 returned
`PASS_WITH_REQUIRED_CORRECTIONS`; CORRECTIVE-005 applied F-01/F-02/F-03;
AUDIT-005B returned `PASS` and closed those findings. The Architecture Owner
accepted the Layer C constraint and `ACCEPT_PROVEN_WITH_CONSTRAINT`
disposition, so P0.S-1 is PASS / CLOSED. P0.S remains `IN_PROGRESS`, the global
Core Patch inventory remains incomplete, and P0.S-2 is `NOT_STARTED`.

## Constraints

- The Connection compatibility service is Layer C, not Layer A `webServer`
  and not Layer B `dsh-web-app`.
- It listens on no socket, creates no BrowserAuth/token URL, exposes no product
  routes, and is fail-closed for unauthenticated request rejection.
- Its `/api` interceptor proves invoke-based unary dispatch only. It is not a
  complete Connection Carrier; event, stream, settlement, cancellation,
  connection-loss and backpressure semantics remain P0.S-4 work.
- `HostConnectionService` is a package-root preview public export, but its
  constructor's BrowserAuth collaborator is not a separately frozen public
  production contract. The Spike uses a structural deny-all facade only.
- Frozen Windows ACL restricted-token creation returned Win32 87 under the
  default `workspace-write` probe. The inert `Write-Output` call was therefore
  run under the Harness-owned per-session `danger-full-access` mode, then the
  session was immediately restored to `workspace-write`. This is environment
  evidence, not permission to weaken production policy.
- No live subagent was spawned because that would require model credentials.
  Presence, continuable configuration and control dispatch were tested.

## Production Impact

None of this prototype may ship. P1 must specify an authenticated local
carrier/Connection adapter and production sandbox behavior. The Layer C facade,
local question answerer, evidence heartbeat and marker-driven stop path are
test fixtures only. Desktop + Worker remains unchanged and Renderer still has
no direct Worker access.

## Required Contract Change

P1 must freeze:

- the profile/bundle identities and two-face built library closure behind the
  packaged `dsh --profile` launcher;
- a carrier-neutral Connection adapter using Gateway/Connection semantics with
  authenticated IPC trust, cancellation and streaming, without BrowserAuth or
  an HTTP product listener;
- the acceptable status and maintenance boundary of the preview public
  `HostConnectionService` seam;
- production Windows sandbox behavior; the Spike's explicit unconfined marker
  probe is not an allowed default.

## Fallback

No fallback was implemented. The Owner accepted the Layer C constraint for the
P0.S-1 technical disposition; this does not authorize Fallback B, a Harness
Core patch, P0.S-2, or reuse of the prototype as production code.

## Can Prototype Code Be Reused?

NO. Separate production design and review are required.
