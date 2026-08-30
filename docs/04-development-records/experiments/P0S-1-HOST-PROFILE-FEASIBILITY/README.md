# P0.S-1 Host Profile Feasibility Spike

Status: CLOSED

Classification: `NOT_PRODUCTION`, disposable feasibility evidence only.

This directory contains the isolated P0.S-1 Host Profile prototype. It is not a
Production Worker, is not part of the future P2 implementation path, and must
not be packaged or shipped.

The spike uses the frozen Harness launcher through:

```text
node <frozen-harness>/apps/cli/lib/bin.js --profile shaco-host
```

`apps/cli/lib/bin.js` is the built implementation of the frozen package's
official `dsh` bin. The profile composes `@deepseek-ai/dsh-base` plus the local
`@shaco-forge/not-production-p0s1-host-bundle`; it does not compose
`@deepseek-ai/dsh-web-app`.

Executor verdict: `PROVEN_WITH_CONSTRAINT`. AUDIT-005 required documentation
corrections, CORRECTIVE-005 applied them, and AUDIT-005B passed and closed the
findings. The Architecture Owner accepted the Layer C constraint and closed
P0.S-1 as PASS. This does not turn the feasibility value into unconstrained
PASS, close P0.S, complete the global Core Patch inventory or start P0.S-2.

Closure state:

- `SHACO_FORGE_V1_0_P0S_1 = PASS`
- `P0S1_STATE = CLOSED`
- `P0S1_INDEPENDENT_REVIEW = PASS_WITH_REQUIRED_CORRECTIONS`
- `P0S1_DOCUMENTATION_CORRECTIVE = PASS`
- `P0S1_CORRECTIVE_REREVIEW = PASS`
- `ARCHITECTURE_OWNER_LAYER_C_CONSTRAINT_ACCEPTED = YES`
- `P0S_HOST_PROFILE_FEASIBLE = PROVEN_WITH_CONSTRAINT`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `P0S2 = NOT_STARTED`

The local bundle contains three disposable plugins:

- `connection-compatibility.mjs`: a fail-closed, non-listening Layer C
  compatibility service built from the public root export
  `HostConnectionService` of `@deepseek-ai/dsh-client-connection`.
- `question-answerer.mjs`: a local-only fixture that settles the REQUIRED
  `ask_user_question` probe without a Client or credential.
- `probe.mjs`: readiness, liveness, surface, shipped `standard` preset, and
  safe tool-usability evidence collection.

The runner creates a unique runtime under the operating-system temporary
directory. It copies this profile and bundle into that disposable Harness home,
runs configuration validation, starts the Host twice, observes it, requests the
official CLI's graceful SIGTERM disposal path through a marker, and retains the
runtime evidence for inspection.

## Runner prerequisites

The formal `run-spike.ps1` runner requires PowerShell 7 (`pwsh`). It uses the
.NET Core `ProcessStartInfo.ArgumentList` and `ProcessStartInfo.Environment`
APIs, so Windows PowerShell 5.1 cannot execute this runner unchanged. In an
environment that only has PowerShell 5.1, an equivalent command sequence or a
compatible runner may mirror the same command, environment-variable and
observation semantics; that reproduction must not be described as the formal
runner having executed unchanged.

The Spike resolves Node and then uses its absolute path because a restricted
child-process PATH does not reliably resolve `node`. This is an environment
measure, not a production startup contract or a requirement for users to
globally install Node. P0.S-7 must still prove that the packaged Worker has no
system Node/pnpm dependency.

No source from the frozen Harness is copied, patched, or modified. The shipped
`standard` preset is resolved and mounted directly from
`@deepseek-ai/dsh-agent-presets` with `includeShippedRoot: true`; it is never
copied or forked.

The retained Executor evidence is
`docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`.
