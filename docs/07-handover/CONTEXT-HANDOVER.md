# Shaco Forge Context Handover

## Project

Shaco Forge is a Windows Desktop Agent product built on a pinned DeepSeek Harness baseline.

## Current Version Goal

V1.0 = Harness Desktop Baseline using Electron Desktop + independent per-user long-running Worker.

## Key Decisions

- Worker is Runtime Authority.
- Desktop is Client/Projection/Native Shell.
- Reuse Harness Client↔Host contract; no second full Agent RPC.
- Named Pipe is a candidate Shaco physical carrier and must be proven in P0.S. It is not a Harness documented extension seam.
- Worker is a Harness Host via `dsh --profile` plus `dsh-base` and a Shaco bundle. In-process `boot()` is not a production entry.
- Full third-party plugin parity is not a V1.0 requirement.
- Harness upgrades are pinned + compatibility-tested + backed up + fail-closed.
- Harness data down-migration is not promised.
- Minimal Shaco Control Store exists for product/control-plane metadata.
- Future 1.1 Automation domain is Shaco-owned.
- Future 1.2 may use Worker-owned Codex/Claude/ACP/SDK child processes.
- `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` until P0.S inventory (not NONE, not KNOWN_REQUIRED). Cordis `webServer` service inject ≠ stock `dsh-web-app` HTTP.

## Current Status

P0 is CLOSED / PASS. P0-1 through P0-7 are PASS / CLOSED. Frozen Harness baseline is `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`dsh@0.1.2-alpha.1`) at `D:\Project\Shaco-Forge-Upstream\deepseek-harness`. AUDIT-004 = `PASS_WITH_REQUIRED_CORRECTIONS`. AUDIT-004B = `PASS`. `P0_CLOSURE_AUDIT = PASS`. Risk register and P0.S inputs: `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`. P0.S is `IN_PROGRESS`; P0.S-1 through P0.S-5 are PASS / CLOSED with accepted constraints. `P0S6_MEC_20260903_01_STATE = EXHAUSTED_INCONCLUSIVE`. Two `PRE_HYPOTHESIS` invocations used the full MEC-01 budget without launching Electron or reaching Runtime. P0.S-6 has neither PASS nor technical FAIL, is not closed, and H-05/H-20 remain `NOT_PROVEN`; `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`. `P0S6-DRRC-20260904-01` passed Corrective Re-Review and is frozen / Owner-approved for one Dependency Preparation invocation only. Runtime, Diagnostic, Formal, Harness Core mutation, experiment Commit, Push, Global Physical Attempt #3, and P0.S-7 are not authorized. `P0_EXECUTOR_WORK = CLOSED`. `INDEPENDENT_P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. P1 cannot freeze until P0.S passes.

Current DRRC authority:

- `P0S6_STATE = IN_PROGRESS_DEPENDENCY_READINESS_NOT_RUN`
- `P0S6_DRRC_CONTRACT_ID = P0S6-DRRC-20260904-01`
- `P0S6_DRRC_STATE = FROZEN_OWNER_APPROVED`
- `P0S6_DRRC_INDEPENDENT_REVIEW = PASS`
- `P0S6_RECOVERY_CONTRACT_PLANNING = COMPLETED`
- `P0S6_DEPENDENCY_PREPARATION = AUTHORIZED_SINGLE_INVOCATION`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_USED = 0`
- `P0S6_DEPENDENCY_READINESS = NOT_RUN`
- `P0S6_READY_FOR_DEPENDENCY_PREPARATION = YES`
- `P0S6_OFFLINE_REINSTALL_PROOF = SUPERSEDED_BY_FROZEN_IN_PLACE_NODE_MODULES`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`
- `P0S7_ALLOWED = NO`
- `P0S6_DRRC_FREEZE_HEAD_POLICY = COMMIT_CONTAINING_OWNER_APPROVED_DRRC_AND_GOVERNANCE_SYNC`

The pre-existing 39-file P0.S-6 historical candidate is copy-verified and
quarantined outside both repositories at
`D:\Project\Shaco-Forge-Quarantine\P0S6-Historical-Candidate-20260903`.
Manifest SHA256 is
`8ae0b903125f44ea656be0dcdeab40a2d35d0916f416822908f34e0b809bba50`.
The active Shaco Forge and frozen Harness worktrees were clean before that
historical Contract Freeze. MEC-01 later executed exactly two physical
attempts; neither used or consumed the historical candidate.

Historical MEC-01 Git identity was three-layered. Product Baseline is
`cada37727af3f99da77f50353924af80f917b688`; Contract Freeze is
`45a3ccfc46d3fdc9a156b28c8b1f59af7e257af3`; Execution Authority Anchor is the
clean Pre-Execution Identity Corrective commit
`6fd8bbd3e39ff17c5bc76bc447898dd5b7b72e7c` selected by
`LAST_CLEAN_PRE_EXECUTION_GOVERNANCE_COMMIT`. The preflight identity conditions
were relevant to the now-completed attempts and do not authorize another one.

Attempt #1 `999bbd1e-9301-49ad-9021-30da7c879f9e` stopped at
`RUNNER_PREFLIGHT` on the runner collection-shape defect; its `attempt.json`
SHA-256 is
`bdcbd0579238f07fff28e420b1529cf9cf13fe38652cb6d18dd5d0bc11a77d46`.
Attempt #2 `76bc4e8a-fb0c-4e92-a750-b555e6a57e41` stopped at
`DEPENDENCY_SETUP` with offline-cache `ENOTCACHED` for
`https://registry.npmjs.org/env-paths/-/env-paths-2.2.1.tgz`; its
`attempt.json` SHA-256 is
`c6646264f2cb6e20d59d6dc913d8dc1753557b192a472ccc48c16b09a6107a88`
and its `preflight.json` SHA-256 is
`bc1dfb1e1f2537e2f1f8eb999b21037af4c662053637ec3d84199388d7fc03e5`.
Both attempts are `PRE_HYPOTHESIS`, with Electron launch count zero and no
H-05/H-20 Runtime Evidence.

Attempt #2 raw `attempt.json` retains non-authoritative early-stop fallback
values `physicalAttemptsUsed=1`, `attempt2Executed=false`, and
`clientModuleCorePatchRequired="NO"`. The actual invocation ledger prevails:
`P0S6_PHYSICAL_ATTEMPTS_USED = 2`,
`P0S6_PHYSICAL_ATTEMPTS_REMAINING = 0`, Attempt #2 executed, and Core Patch
need is `UNRESOLVED`. Partial `node_modules`, `.npm-cache`, and `runtime-data`
are failed-attempt outputs only, not Dependency Readiness or Runtime Evidence,
and remain untouched/uncommitted.

## First Files to Read

1. `../00-governance/SHACO-FORGE-DOCUMENT-MAP.md`
2. `../00-governance/SHACO-FORGE-CURRENT-STATE.md`
3. `../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md`
4. `../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md`
5. closed Phase Contract (`../03-v1.0-plan/P0-UPSTREAM-BASELINE.md`)
6. `../06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`
7. `../05-reviews/architecture/AUDIT-004B-P0-CLOSURE-CORRECTIVE-REVIEW.md`
8. `../05-reviews/architecture/AUDIT-004-INDEPENDENT-P0-CLOSURE.md`
9. `../03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md`
10. `../03-v1.0-plan/P0S-6-MINIMAL-EXECUTION-CONTRACT.md`
11. `../03-v1.0-plan/P0S-6-DEPENDENCY-READINESS-RECOVERY-CONTRACT.md`

## Immediate Next

Execute exactly one P0S6-DRRC-20260904-01 Dependency Preparation invocation. Do not start Electron or authorize Global Physical Attempt #3.

The Architecture Owner superseded offline reinstall proof with one online,
lockfile-driven materialization. Freeze the completed `node_modules` by its
original canonical absolute path, original bytes, and canonical manifest. Any
later Runtime must consume it in place and must not run `npm ci`.
`.npm-cache` is not readiness proof or Runtime input. Package, lockfile,
Electron ZIP, and full `node_modules` integrity requirements are unchanged.
Dependency Readiness PASS does not authorize Runtime; a separate Owner-approved
Recovery Execution Contract remains required.

The actual Freeze commit SHA is returned after the single governance commit
under `P0S6_DRRC_FREEZE_HEAD_POLICY`; it is not recursively embedded. The next
Dependency Preparation must use that actual SHA as its governance starting
HEAD.
