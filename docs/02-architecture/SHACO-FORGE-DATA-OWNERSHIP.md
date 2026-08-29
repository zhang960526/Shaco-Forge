# Shaco Forge Data Ownership

Status: ACTIVE-PRE-P1

## Harness-Owned Data

Harness remains authority for:

- Session event/history/transcript data
- Harness settings
- Harness credentials
- Workspace/session runtime data
- Harness profiles and in-box plugin composition
- Harness-owned persistence formats

Shaco must not duplicate these as an alternative truth.

## Shaco-Owned Control Store

V1.0 minimal SQLite Control Store may own:

- schema version
- Worker instance identity / endpoint
- Product/Desktop/Worker/Carrier versions
- Harness baseline identity
- upgrade transaction state
- background-worker preference
- Shaco-only desktop preferences
- future product metadata

Session identity may be referenced, not copied.

## Future V1.1

Shaco-owned automation tables will become authority for:

- AutomationDefinition / AutomationRun
- Task / Step / Attempt
- Artifact / Evidence
- Scheduler / Trigger / Approval metadata

Harness Session will remain execution truth and be referenced via execution/session references.
