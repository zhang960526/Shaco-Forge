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

## Current Status

P0 is IN_PROGRESS. P0-1 through P0-6 are PASS / CLOSED. Frozen Harness baseline is `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`dsh@0.1.2-alpha.1`) at `D:\Project\Shaco-Forge-Upstream\deepseek-harness`. Client↔Host and trust facts are mapped in the P0-3/P0-4 evidence; the normative V1.0 product capability scope is `docs/06-testing-acceptance/evidence/P0-5-CORE-FEATURE-PARITY-MATRIX.md`. The formal Harness dependency boundary is `docs/06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md`. Core scope is the complete DeepSeek Desktop Agent loop, required Settings/picker/approval/question/subagent behavior and Desktop/Worker durability. Standard preset is loaded in place, not copied. Next step is P0-7. Entire P0 is not PASS. P0.S is not started. P1 cannot freeze until P0.S passes.

## First Files to Read

1. `../00-governance/SHACO-FORGE-DOCUMENT-MAP.md`
2. `../00-governance/SHACO-FORGE-CURRENT-STATE.md`
3. `../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md`
4. `../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md`
5. current Phase Contract (`../03-v1.0-plan/P0-UPSTREAM-BASELINE.md`)
6. `../06-testing-acceptance/evidence/P0-5-CORE-FEATURE-PARITY-MATRIX.md`
7. `../06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md`
