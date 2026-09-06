# ADR-0008 — TypeScript, Electron and Node as the V1.0 Production Baseline

Status: ACCEPTED

Independent Review: [REVIEW-011 / PASS](../../05-reviews/architecture/AUDIT-011-V1-TECHNICAL-IMPLEMENTATION-BASELINE.md)

Architecture Owner Disposition: ACCEPTED

## Context

The accepted architecture fixes an Electron Desktop, a separate per-user
long-running Worker and a Worker-hosted pinned Harness. It does not yet record a
Production primary language or whether the Worker should be Node/TypeScript or
C#/.NET.

## Original Decision / Problem

V1.0 needs one minimal implementation baseline before Slice 1A, without turning
the bounded P0.S runtime choices or the disposable C# carrier helper into
Production authority.

## New Evidence

- Electron Main/Preload/Renderer and the pinned Harness Client/Host ecosystem are
  Node.js/TypeScript based.
- The pinned Harness requires Node `^22.19.0 || >=24.0.0` and uses a TypeScript
  workspace.
- P0.S-1 proves the official `dsh --profile` Host path; P0.S-2 proves isolated
  Electron Client boot; P0.S-3 proves Windows-native carrier feasibility.
- The P0.S-3 C# Named Pipe/ACL helper is explicitly
  `NON_CORE_ADAPTER / NOT_PRODUCTION`.

## Options Considered

1. TypeScript across Desktop and a Node/TypeScript Worker.
2. TypeScript Electron Desktop with a C#/.NET Worker that launches a Node
   Harness process.
3. Create a C#/.NET helper immediately in anticipation of Windows-native needs.

## Decision

Accepted following Independent REVIEW-011 PASS and Architecture Owner approval:

- Use TypeScript as the V1.0 primary product language.
- Use Electron for Desktop and an independent Node.js runtime for the
  TypeScript Worker.
- Keep Electron Main, Preload and Renderer separated.
- Let Worker launch the pinned Harness through `dsh --profile`.
- Do not use C#/.NET as the Worker language.
- Permit a thin C#/.NET native helper only just in time when a real Slice proves
  Node/Electron cannot reliably provide a required Windows-native capability.

This ADR intentionally does not choose tool versions, a renderer bundler, a
physical carrier or a .NET version.

## Why

This choice matches Electron and Harness's native ecosystem, minimizes durable
cross-language boundaries and fits the Worker's actual V1.0 responsibilities:
supervision, Harness lifecycle, carrier, health and control. C#/.NET remains
available for narrow OS capabilities without becoming a second Worker or Agent
runtime.

## Consequences

- Desktop Main, Preload, Renderer and Worker use TypeScript.
- Electron's embedded Node and Worker Node remain distinct runtime/ABI domains.
- Release artifacts compile/bundle TypeScript; release startup does not depend
  on `tsx`, `ts-node`, system Node or system pnpm.
- A future native helper must have a narrow API and no Agent, Provider or
  Session business logic; its runtime is pinned only when the need is proven.
- Acceptance was granted after Independent REVIEW-011 PASS and Architecture
  Owner action; this ADR does not itself start or grant Slice implementation.

## Affected Documents

- [V1.0 Technical Implementation Baseline](../SHACO-FORGE-V1.0-TECHNICAL-IMPLEMENTATION-BASELINE.md)
- [System Architecture](../SHACO-FORGE-SYSTEM-ARCHITECTURE.md)
- [Desktop / Worker Boundary](../SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md)
- [Harness Integration Boundary](../SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md)

## Supersedes / Superseded By

Supersedes no accepted ADR. If accepted, it refines implementation technology
inside ADR-0001 and ADR-0002 without changing their topology or Harness-hosting
decisions.
