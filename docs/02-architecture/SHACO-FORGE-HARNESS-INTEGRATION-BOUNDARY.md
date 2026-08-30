# Harness Integration Boundary

Status: ACTIVE-PRE-P1

## Principle

Shaco Forge uses DeepSeek Harness as an upstream Agent Runtime, not as the Shaco product domain.

## Allowed Direction

```text
Shaco Product
  -> Shaco Supervisor / Carrier / Product Control Plane
  -> Harness documented profile/bundle/launcher and Client↔Host seams
  -> Harness Runtime
```

P0-6 fact freeze (`docs/06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md`):

- Official Node entry is spawn `dsh --profile`. Direct `boot()` is not a production Worker main.
- Generated `./remote` / `./typert` are documented product contracts.
- Preview Connection/Gateway/Client-boot surfaces require a Shaco adapter.
- Named Pipe is a Shaco carrier candidate, not a Harness documented extension seam.

## Prohibited Direction

- arbitrary `packages/**/src` deep imports in production
- test-support / experimental packages as hidden production dependencies
- undocumented boot shortcuts, including in-process `dsh-app-boot` as Worker main
- rewriting Harness Agent business protocol under `SHACO_FORGE_WORKER_PROTOCOL_V1`
- treating dump-config, SRC/tsx Host, or Web cookie/HTTP as the Desktop runtime contract

## V1.0 Contract

- Business protocol: current Harness Connection / Remote / API Gateway semantics discovered in P0.
- Physical carrier: Shaco adaptation proven in P0.S.
- Supervisor contract: discovery, identity, version, health, lifecycle, upgrade state only.

## Upstream Volatility

Harness is Developer Preview. Shaco controls risk through:

- exact baseline pin
- explicit dependency matrix
- adapter/carrier boundary
- compatibility branch before upgrade
- fresh acceptance per supported baseline
