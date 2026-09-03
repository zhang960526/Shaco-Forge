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

P0 is CLOSED / PASS. P0-1 through P0-7 are PASS / CLOSED. Frozen Harness baseline is `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`dsh@0.1.2-alpha.1`) at `D:\Project\Shaco-Forge-Upstream\deepseek-harness`. AUDIT-004 = `PASS_WITH_REQUIRED_CORRECTIONS`. AUDIT-004B = `PASS`. `P0_CLOSURE_AUDIT = PASS`. Risk register and P0.S inputs: `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`. P0.S is `IN_PROGRESS`; P0.S-1 through P0.S-5 are PASS / CLOSED with accepted constraints. P0.S-6 is `NOT_STARTED`. The Architecture Owner authorizes only bounded, read-only, contract-only planning of the P0.S-6 Minimal Execution Contract. Implementation, Runtime, Diagnostic, Formal, experiment-source modification, new attempts and P0.S-7 are not authorized. `P0_EXECUTOR_WORK = CLOSED`. `INDEPENDENT_P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. P1 cannot freeze until P0.S passes.

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

## Immediate Next

P0.S-6 MINIMAL EXECUTION CONTRACT — READ-ONLY PLANNING

NOT EXECUTED

This purpose-bound planning authority is exhausted when the Contract is
completed, and Contract completion does not authorize execution. H-05, H-20,
the original P0.S-6 product Gates, Desktop + Worker architecture, frozen
Harness baseline and feature scope remain unchanged. Historical P0.S-6
attempts, the 39-file candidate, native-loader/retained trace, salvage and
diagnostic records receive no retroactive authorization, PASS, Formal Evidence
or candidate acceptance.
