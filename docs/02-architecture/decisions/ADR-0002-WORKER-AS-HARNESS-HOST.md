# ADR-0002 — Worker Is the Long-Running Harness Host

Status: ACCEPTED

## Decision
Do not build a Shaco Agent runtime that imports Harness internals. Worker will launch/host Harness through documented profile/bundle/product boot seams.

## Consequence
P0.S must prove the required host composition and physical carrier without assuming the Web profile can be copied.
