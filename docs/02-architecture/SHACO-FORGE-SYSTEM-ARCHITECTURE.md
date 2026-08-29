# Shaco Forge System Architecture

Status: ACTIVE-PRE-P1

> This document records the accepted pre-P1 architecture baseline. P1 will convert it into a fully frozen System Contract after P0.S evidence exists.

## Core Topology

```text
Shaco Forge Desktop (Electron)
  Main: window + native + supervisor + carrier adapter
  Renderer: Harness Client + Shaco branding + projection
        |
        | Harness Client/Host semantics
        | physical: Electron IPC + candidate Named Pipe
        v
Shaco Forge Worker
  per-user, long-running, Desktop-independent
  dsh Host profile / documented equivalent boot seam
        |
        +-- Harness session/persistence/provider/tools/approval/subagent/...
        |
        +-- optional capability children (future Codex/Claude/ACP/SDK/...)
```

## Accepted Direction

- Two core long-running product processes: Desktop + Worker.
- Worker stays alive when Desktop window closes.
- Worker owns capability child lifecycle.
- ACP/SDK are not the V1.0 Desktop main path.
- Harness Client↔Host application contract is reused; Shaco does not duplicate Session/Tool/Approval APIs.
- Shaco adds only supervisor/control-plane and physical carrier adaptation.

## Open Until P0.S

- Whether no-HTTP cross-process Named Pipe carrier is feasible without Harness core patch.
- Exact Client boot strategy under custom scheme.
- Exact Fetch/binary mapping.
- In-box client module/static bundling strategy.
- Worker bundled runtime strategy (Node sidecar vs other proven option).

## Fallback Rule

If the primary carrier fails P0.S:

- Fallback A: keep Desktop/Worker split and use Worker-private loopback HTTP as a constrained local transport.
- Fallback B: Host in Electron Main; requires explicit Architecture Owner re-approval because it conflicts with Desktop-close Worker-survives.
