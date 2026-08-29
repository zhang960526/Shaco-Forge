# P0.5 — Compatibility & Version Contract

Status: READY_FOR_FREEZE_AFTER_P0S

## Goal

Define which product identities may connect/write, how incompatibility fails closed, and how pinned Harness upgrades are backed up/restored.

## Version Identity — Keep Six

- ProductVersion
- DesktopVersion
- WorkerVersion
- CarrierVersion
- HarnessBaselineVersion
- ControlStoreSchemaVersion

Pinned runtime metadata such as ElectronVersion / NodeRuntimeVersion belongs in the release manifest, not every handshake.

HarnessBaseline must include package version + exact upstream commit; lockfile hash may be attached as release evidence.

## Compatibility Matrix

Conservative V1.0 policy:

- Carrier major must be compatible.
- Worker must be in Desktop-supported range.
- Harness baseline must match the supported release baseline.
- Control Store schema must be supported by Worker.
- DSH_HOME identity/path must match the intended Worker environment.
- Unknown combination => FAIL CLOSED.

Required incompatibility kinds include:

- DESKTOP_TOO_OLD
- WORKER_TOO_OLD
- WORKER_TOO_NEW
- CARRIER_UNSUPPORTED
- HARNESS_BASELINE_MISMATCH
- CONTROL_SCHEMA_UNSUPPORTED
- DSH_HOME_MISMATCH
- UPGRADE_IN_PROGRESS / RESTORE_REQUIRED as needed

## Supervisor Handshake

Handshake happens before establishing the Agent write path.

Worker returns at least:

- workerId
- workerVersion
- carrierVersion
- harnessBaselineVersion
- controlStoreSchemaVersion
- dshHome
- runtimeState
- upgradeState
- minimal capabilities needed for V1.0 carrier use

Desktop provides supported/expected identity ranges.

Supervisor must not contain Session/Tool business APIs.

## Incompatible Behavior

On incompatible identity:

- do not establish Agent write path
- do not write Harness user data
- allow only safe read-only diagnostics/version/log-location if explicitly designed
- show actionable reason

## Upgrade Transaction

Keep the simple installer-driven state flow:

```text
IDLE -> CHECKING -> DRAINING -> BACKING_UP -> INSTALLING
     -> MIGRATING -> VALIDATING -> COMMITTED
```

Failure path:

```text
FAILED -> RESTORING -> RESTORED
                    -> RESTORE_FAILED
```

`ABORTED` is allowed for user/policy cancellation.

Before INSTALL:

- DRAIN must succeed or upgrade waits/cancels/aborts
- BACKUP must be verified
- disk-full / backup-failed / backup-corrupt / Worker-crash-during-backup must not proceed to install

## Backup / Restore

V1.0 default backup unit:

- full DSH_HOME durable content (re-creatable cache may be excluded only by explicit rule)
- Shaco Control Store

Backup includes credentials/settings/sessions/attachments/profiles as applicable and therefore requires current-user-only ACL.

Harness failure recovery means:

- stop new version
- restore old binaries/runtime
- restore pre-upgrade backup
- start old version

It does NOT mean down-migrating new Harness data so an old Harness can read it.

## Final Gate

- P05_VERSION_IDENTITIES_FROZEN
- P05_COMPATIBILITY_MATRIX_FROZEN
- P05_HANDSHAKE_RULES_FROZEN
- P05_DSH_HOME_MATCH_POLICY_FROZEN
- P05_FAIL_CLOSED_POLICY_FROZEN
- P05_UPGRADE_TRANSACTION_FROZEN
- P05_BACKUP_VERIFICATION_POLICY_FROZEN
- P05_BACKUP_RESTORE_POLICY_FROZEN
