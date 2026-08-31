# AUDIT-006 — Independent P0.S-2 Electron Client Boot Review

Status: COMPLETE

Date: 2026-08-31

Review Mode: Independent evidence and runtime reproducibility review; no
implementation or documentation files modified by the Reviewer.

## Provenance

Classification: faithful persisted summary of an external Independent Review.

This document records the external Reviewer result supplied to the P0.S-2
Architecture Owner closure run. It does not claim that the closure Executor
performed the independent review or executed the Reviewer's commands.

## Baseline Reviewed

- Shaco Forge: `292213a6b44b89c1513beab4c3b86d580d843830`
- Frozen Harness: `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- Harness package: `0.1.2-alpha.1`
- Harness `pnpm-lock.yaml` SHA256:
  `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`
- Primary Evidence:
  `docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md`

## Review Result

```text
P0S2_INDEPENDENT_REVIEW_VERDICT = PASS
P0S2_EXECUTOR_CLAIM_CONFIRMED = YES
H03_STATUS = CONFIRMED
H04_STATUS = CONFIRMED
H15_BOOT_WIRING_STATUS = CONFIRMED
P0S_ELECTRON_RENDERER_BOOT = CONFIRMED
P0S_CUSTOM_SCHEME_OR_APPROVED_LOADING_MODEL = CONFIRMED
P0S_SETTINGS_PERSISTENCE = CONFIRMED
SETTINGS_PERSISTENCE_NOT_MEMORY = CONFIRMED
CLIENT_BOOT_CORE_PATCH_REQUIRED = NO
P0S2_TECHNICAL_RECOMMENDATION = ACCEPT_PROVEN_WITH_CONSTRAINT
REVIEWER_MODIFIED_FILES = NO
BLOCKING_FINDINGS = NONE
```

The external Reviewer reported a complete reproduction in a repository-external
temporary copy. The reproduction rebuilt the byte-identical bootstrap and
application bundles, loaded the 46-entry Client graph through the custom
scheme, entered the session UI, completed the Settings write/restart/read cycle
in two independent Electron processes, repeated the runtime security probe,
observed zero matching TCP listeners and zero residual Electron processes, and
left the Frozen Harness worktree clean.

## Adapter Classification

The Review classified all five bounded Spike compatibility surfaces as
`NON_CORE_ADAPTER`:

| Surface | Classification | Boundary |
|---|---|---|
| strict-CSP loader compatibility transform | `NON_CORE_ADAPTER` | Build-time, exact-match and fail-closed; disposable Client dist only |
| Settings capability adapter | `NON_CORE_ADAPTER` | Four generated Settings endpoints backed by the real `FileSettingsProvider` |
| preload bridge | `NON_CORE_ADAPTER` | Four allowlisted boot/probe operations only |
| frozen `?fixture` | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | Deterministic boot and session UI data only |
| `ownsHost` hook | `NON_CORE_ADAPTER` | Capability classification canary, not identity proof |

None of these surfaces modifies Harness Core or changes the target Desktop +
Worker architecture. `CLIENT_BOOT_CORE_PATCH_REQUIRED = NO`.

## Findings

| ID | Severity | Blocking | Classification | Finding | Required action / route |
|---|---|---|---|---|---|
| F-01 | INFO | NO | `NON_CORE_ADAPTER` | The strict-CSP transform applies only to disposable `client-dist`, exact-matches the known vendored evaluator, fails when the match count is not exactly one, rejects rather than executes `__jsExpr`, and leaves Frozen Harness source, artifacts and lockfile unchanged. | No P0.S-2 Corrective. Owner acceptance required; formal loader/CSP strategy routes to P4/P7. |
| F-02 | INFO | NO | `NON_CORE_ADAPTER` | The Settings adapter intercepts only four generated Settings endpoints, routes them to a real `FileSettingsProvider`, preserves other fixture RPC behavior and bounds namespace, operation, path and value in Main. | No P0.S-2 Corrective. Replace the boot-only binding with approved Desktop/Main/Worker carrier and trust wiring in P0.S-3/P1. |
| F-03 | INFO | NO | `NON_CORE_ADAPTER`; `NOT_PRODUCTION` | The public Frozen Harness `?fixture` supplies deterministic boot/session data only. It does not provide Settings and was not used to claim Carrier or Connection semantics. | No action. The fixture cannot enter production or satisfy P0.S-3/P0.S-4 gates. |
| F-04 | INFO | NO | `NON_CORE_ADAPTER` | `ownsHost` is a preview/public capability-classification hook. It proves boot capability, not caller identity or production trust. | No P0.S-2 Corrective. Authority to assert `ownsHost` and the identity boundary route to P0.S-3/P1. |
| F-05 | LOW | NO | Upgrade-stability follow-up | `electron-main.mjs` resolves `FileSettingsProvider` through a direct path in the read-only Frozen Harness worktree rather than package exports; the file matches the public package export. | No P0.S-2 change. P4 production implementation must resolve it through package exports. |
| F-06 | INFO | NO | Expected diagnostic | Logs contain optional `dynamicCordisRunner` endpoint diagnostics and a CSP-rejected events URL; `rendererFatalEvents` is empty and boot, session and Settings are unaffected. | No action; retain as an explicit non-claim. |
| F-07 | INFO | NO | Reproducibility confirmation | Independent rebuild produced byte-identical bootstrap/application SHA256 values and asset names, then reproduced the two-process Settings canary cycle. | No action; strengthens reproducibility evidence. |
| F-08 | INFO | NO | Review environment constraint | Restricted Reviewer sandbox policy blocked child-process capture and Electron child-process/named-pipe behavior. The Reviewer used allowed elevated sandbox access and a repository-external temporary copy; the full result had an empty `probeError` and did not modify project files. | No action; environment limitation does not change the Spike conclusion. |
| F-09 | LOW | NO | Production hardening follow-up | Frozen Client plugin style injection retains `style-src 'unsafe-inline'`; `script-src` remains restricted to `self` and no `unsafe-eval` is present. | No P0.S-2 change. Production CSP hardening routes to P1/P7. |

No Finding is blocking and no P0.S-2 Corrective is required.

## Reviewer File Mutation

`NONE`. The external Review reports that the Reviewer worked in a
repository-external temporary copy and did not modify the Shaco Forge project,
the Spike, its Evidence or the Frozen Harness worktree.

## Review Closure Boundary

The Independent Review confirmed the Executor claim and recommended
`ACCEPT_PROVEN_WITH_CONSTRAINT`; it did not itself close P0.S-2, accept the
constraints, authorize production reuse or start P0.S-3.

## Architecture Owner Closure Decision

During the formal closure run, the Architecture Owner accepted:

```text
P0S2_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT
ARCHITECTURE_OWNER_P0S2_CONSTRAINTS_ACCEPTED = YES
CLIENT_BOOT_CORE_PATCH_REQUIRED = NO
```

The strict-CSP and Settings constraints are accepted for P0.S-2 feasibility
only. The preload, fixture and `ownsHost` surfaces retain their
`NON_CORE_ADAPTER` classifications. F-05 routes to P4, F-09 routes to P1/P7,
and the formal Carrier/trust replacement routes to P0.S-3/P1. This Owner action
closes P0.S-2 only; P0.S remains `IN_PROGRESS`, P0.S-3 remains `NOT_STARTED`,
and the global Core Patch inventory remains incomplete.
