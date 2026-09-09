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

## L-007 — Source Declaration Is Not Execution Evidence

The presence of a Win32 API declaration in source does not replace bounded execution confirmation of the intended call and identity checks.

## L-008 — Generic Runtime Identity Is Not Product Application Identity

A generic `electron.exe` path, version or hash can identify the runtime image without proving that the running application is Shaco Forge.

## L-009 — Genuine Binary Identity Is Not Authority Membership

Even a genuine Helper binary does not automatically prove that the process belongs to the current legal Worker authority.

## L-010 — Security Threat Model Drives Architecture Cost

Treating same-user process takeover as a V1 threat can require whole-product OS isolation; it must not be presented as a local Step 1 implementation detail.

## L-011 — Future Extension Seam Is Not Future Feature Prebuild

V1.1, V1.2 and V1.3 keep only explicit compatibility seams. Do not prebuild their domains, empty tables, runtimes or generic frameworks in V1.0.

## L-012 — Harness Reuse Mainline First

Every proposed Product subsystem must first prove that it is required for `MINIMAL_HARNESS_DESKTOP_PRODUCTIZATION`.
