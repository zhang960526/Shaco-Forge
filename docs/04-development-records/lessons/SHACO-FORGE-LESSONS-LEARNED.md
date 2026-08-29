# Shaco Forge Lessons Learned

Status: ACTIVE

## L-001 — Do Not Rebuild Harness Agent Protocol

Reuse the current Client↔Host business contract; Shaco should adapt physical transport and product supervision only.

## L-002 — Do Not Copy the Web Profile into the Worker

The long-running Worker must be based on the actual required Host + standard-preset composition, not Web server/HMR/browser assumptions.

## L-003 — Spike Success Is Not Production Readiness

P0.S prototypes are evidence. Production code starts only after contracts are frozen.

## L-004 — Harness Upgrades Are Compatibility Events

Pin exact baseline; test before release; back up; fail closed; do not promise down-migration.

## L-005 — Desktop Is Never Runtime Truth

Reconnect must rebuild projection from Worker/Harness authority; Desktop must not create a second resume/approval state machine.

## L-006 — Optional Product Features Must Not Become Architecture Gates

Example: binary carrier is a hard architecture gate; Session Export ZIP can remain optional.
