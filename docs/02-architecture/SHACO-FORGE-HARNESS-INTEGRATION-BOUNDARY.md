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

## Prohibited Direction

- arbitrary `packages/**/src` deep imports in production
- test-support / experimental packages as hidden production dependencies
- undocumented boot shortcuts
- rewriting Harness Agent business protocol under `SHACO_FORGE_WORKER_PROTOCOL_V1`

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
