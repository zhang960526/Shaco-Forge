# Shaco Forge V1.0 Master Goal

Status: ACTIVE

## Goal

Deliver a Windows desktop product that productizes a pinned DeepSeek Harness baseline as a reliable Desktop + Worker Agent system without rebuilding Harness's Agent protocol or core runtime.

## User-Visible Completion Definition

A fresh Windows user can install Shaco Forge and, without manually installing Node, pnpm, or DeepSeek Harness:

1. Launch the Desktop.
2. Start or discover the per-user Worker.
3. Configure required provider/credentials.
4. Select/create a workspace.
5. Create, list, resume, and continue sessions.
6. Receive conversation streaming.
7. Use the V1.0 REQUIRED tool/permission/approval capabilities discovered in P0.
8. Close or crash the Desktop while the Worker remains alive.
9. Reopen Desktop, reconnect, and rebuild projection from Worker/Harness truth.
10. Restart the Worker and recover persisted sessions within supported Harness semantics.
11. Install/update only through compatible, pinned product releases.
12. Fail closed on incompatible Desktop/Worker/Carrier/Harness/Data identities.

## Architecture Invariants

- Worker is runtime authority.
- Desktop is projection/control surface.
- Worker is a long-running Harness Host, not a second custom Agent runtime.
- No second full Shaco Agent RPC.
- Named Pipe is a candidate physical carrier, not assumed upstream functionality before P0.S proof.
- Harness baseline is exact-pinned per Shaco release.
- Harness data is not promised to down-migrate.
- Shaco Control Store owns only Shaco product/control-plane metadata.
- Full arbitrary third-party plugin compatibility is out of scope.

## V1.0 Out of Scope

- Shaco AutomationRun/Task/Step/Attempt domain
- Shaco Scheduler/Trigger
- Multi-model council/reviewer pipeline
- Full arbitrary GitHub plugin support
- Plugin marketplace
- Malicious plugin crash isolation
- Dynamic Cordis release baseline unless proven necessary
- Harness data down-migration
- Windows System Service
- Login auto-start requirement
- Windows ARM64 as a hard V1.0 gate unless later approved

## Final Gate

V1.0 is complete only after P8 Fresh Final Acceptance closes all REQUIRED feature, lifecycle, durability, security, packaging, compatibility and evidence gates.
