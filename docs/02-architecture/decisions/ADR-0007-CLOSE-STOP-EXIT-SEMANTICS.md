# ADR-0007 — Separate Close Window, Stop Worker, and Exit Product

Status: ACCEPTED

## Decision
Close Window keeps Worker alive. Stop Worker stops runtime while Desktop may remain. Exit Shaco Forge gracefully stops Worker and closes Desktop.
