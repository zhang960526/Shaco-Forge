# ADR-0004 — Pin Harness Baseline and Fail Closed on Upgrade Incompatibility

Status: ACCEPTED

## Decision
Each Shaco release pins exact Harness identity. Harness upgrades are explicit compatibility events. Upgrade uses pre-upgrade backup and restore; Shaco does not promise Harness data down-migration.
