# ADR-0001 — Desktop + Worker as Two Core Long-Running Product Processes

Status: ACCEPTED

## Decision
Shaco Forge 1.0 uses Desktop + per-user Worker as two core long-running product processes. Closing Desktop does not stop Worker.

## Why
This prevents a structural rewrite when V1.1 adds long-running Automation.

## Constraint
Worker may later create capability child processes; “two core processes” does not mean “only two OS processes ever”.
