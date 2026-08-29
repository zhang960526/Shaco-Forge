# ADR-0003 — Reuse Harness Client↔Host Business Contract

Status: ACCEPTED

## Decision
Do not create a second full Agent RPC for Session/Tool/Approval/Streaming/Subagent. Reuse the current Harness Connection/Remote/Gateway contract. Shaco owns only supervisor/control-plane plus physical carrier adaptation.
