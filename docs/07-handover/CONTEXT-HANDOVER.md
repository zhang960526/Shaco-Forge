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

P0 is CLOSED / PASS. P0-1 through P0-7 are PASS / CLOSED. Frozen Harness baseline is `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`dsh@0.1.2-alpha.1`) at `D:\Project\Shaco-Forge-Upstream\deepseek-harness`. AUDIT-004 = `PASS_WITH_REQUIRED_CORRECTIONS`. AUDIT-004B = `PASS`. `P0_CLOSURE_AUDIT = PASS`. Risk register and P0.S inputs: `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`. P0.S is `IN_PROGRESS`; P0.S-1 through P0.S-5 are PASS / CLOSED with accepted constraints. P0.S-6 is `READY_FOR_EXECUTION`. The Architecture Owner approved frozen Contract `P0S6-MEC-20260903-01`. Contract-bound implementation, allowed-directory source modification, one bounded Electron Client boot Primary Attempt and at most one retry-eligibility-only Corrective Retry are authorized. Diagnostic, Formal, Harness Core mutation, experiment Commit, Push, a third attempt and P0.S-7 are not authorized. `P0_EXECUTOR_WORK = CLOSED`. `INDEPENDENT_P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. P1 cannot freeze until P0.S passes.

The pre-existing 39-file P0.S-6 historical candidate is copy-verified and
quarantined outside both repositories at
`D:\Project\Shaco-Forge-Quarantine\P0S6-Historical-Candidate-20260903`.
Manifest SHA256 is
`8ae0b903125f44ea656be0dcdeab40a2d35d0916f416822908f34e0b809bba50`.
The active Shaco Forge and frozen Harness worktrees were clean before this
Contract Freeze. No experiment or physical attempt was executed, and the
quarantine was not accessed or consumed.

P0.S-6 Git identity is three-layered. Product Baseline is
`cada37727af3f99da77f50353924af80f917b688`; Contract Freeze is
`45a3ccfc46d3fdc9a156b28c8b1f59af7e257af3`; Execution Authority Anchor is the
final clean Pre-Execution Identity Corrective commit selected by
`LAST_CLEAN_PRE_EXECUTION_GOVERNANCE_COMMIT`. Do not create another governance
or documentation commit before Attempt #1 ends. Preflight must prove
`ExecutionAuthorityHead == AttemptStartHead` and frozen Harness HEAD equality
before invoking the runner or consuming an attempt. Product Baseline differing
from the Anchor is expected and is not drift.

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

## Immediate Next

P0.S-6 PRIMARY EXECUTION ATTEMPT #1

NOT EXECUTED

Execute only under `P0S6-MEC-20260903-01`: one fixed Client boot Slice using
the exact P0.S-2 Electron `35.7.5` identity, one Primary Attempt, and at most
one eligibility-only Corrective Retry. Maximum physical attempts are two and
currently used attempts are zero. H-05, H-20, the original product Gates,
Desktop + Worker architecture, frozen Harness baseline and feature scope remain
unchanged. Diagnostic, Formal, experiment Commit, Push, third attempt and
P0.S-7 are not authorized. Historical attempts and materials receive no
retroactive status.

The quarantine is historical material only and must not be accessed or
consumed by `P0S6-MEC-20260903-01`.
