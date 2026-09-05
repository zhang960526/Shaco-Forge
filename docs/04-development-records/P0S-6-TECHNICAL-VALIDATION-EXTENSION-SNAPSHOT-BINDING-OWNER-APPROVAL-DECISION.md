# P0.S-6 Technical Validation Extension Snapshot Binding Contract Owner Approval Decision Record

## 1. Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-SNAPSHOT-BINDING-OA-20260905-01` |
| Document Type | `OWNER_APPROVAL_DECISION_RECORD` |
| Status | `OWNER_APPROVED_AND_FROZEN` |

This record supplies architecture approval of the identified Snapshot Binding Contract. Creating this record does not create a Snapshot Binding, modify execution artifacts, freeze a final Snapshot, or execute Verification.

## 2. Parent Contract

| Field | Value |
|---|---|
| Parent Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-20260905-01` |
| Parent Contract Path | `docs/03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-BINDING-CONTRACT.md` |
| Parent SHA-256 | `2624EC554DF4019144D7B82EDE01497F5A3F4515CBBDD8E442FE35D832E2AA2E` |
| Independent Review | `PASS` |

The Independent Review result is recorded as supplied by the Architecture Owner for this approval. This record does not perform a new Independent Review.

Approval applies only to the exact Parent Contract bytes identified above. The Parent Contract remains unchanged; this separate Owner Approval supplies its explicit approval without rewriting the historical draft. Changed Contract bytes cannot inherit this approval.

## 3. Owner Decision

`ARCHITECTURE_OWNER_APPROVAL = YES`

`DECISION = APPROVED_IMMUTABLE_SNAPSHOT_BINDING_MODEL`

The Architecture Owner approves and freezes the Parent Contract's immutable Snapshot Binding model and its requirements. This approval does not pre-approve unspecified execution bytes, a signer, an Anchor value, a particular immutable-reference mechanism, or a final Snapshot Binding identity.

## 4. Approved Model

| Component | Approved responsibility |
|---|---|
| Authority Anchor | Establish the approved governance lineage through an immutable commit identity |
| Execution Snapshot | Identify the exact final execution bytes |
| Immutable Snapshot Binding | Connect the approved Anchor, Snapshot, and bounded Invocation through an independently authenticated Owner-approved immutable reference |

All three components are required. Current HEAD ancestry alone and Manifest self-consistency alone are insufficient to establish approved execution identity.

## 5. Binding Rule

The approved Snapshot Binding must fix:

1. the final Runner's canonical repository-relative path, exact byte length, and SHA-256;
2. the Runner Identity, Execution Root Identity, and Invocation Identity paths, byte lengths, and SHA-256 values;
3. the final Frozen Input Manifest path, byte length, and SHA-256;
4. the approved Authority Anchor's full commit identity; and
5. the Owner-approved immutable reference authenticating the complete Binding.

The Binding must retain the Parent Contract's required links to the governing Corrective Contract and exact bounded Invocation. Its final approval must identify the selected mechanism and exact approved Binding identity independently of the Manifest or Binding being checked.

The permitted reference mechanisms remain those defined by the Parent Contract: signed Git tag, dedicated immutable ref, or governance record hash. Their pinned object or byte identities, approval source, and immutability controls must be established before final freeze. Mutable names, current HEAD, and a valid signature alone cannot substitute for matching the exact approved reference.

The Manifest must be authenticated against that reference before its internal hashes are trusted. Any missing, unapproved, mutable, ambiguous, or mismatched required identity must produce `AUTHORITY_BLOCKED` before Invocation start or network access.

## 6. Scope Boundary

This approval does not change:

- the Technical Validation Extension Verification Goal;
- Scope;
- Budget;
- Network Boundary; or
- Invocation Boundary.

It does not grant another Invocation, replenish consumed budget, reopen P0.S-6, or authorize P0.S-7.

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

## 7. Corrective Boundary

The approved model permits the following future work only through a separate controlled corrective execution:

- create the Snapshot Binding;
- update Manifest validation;
- regenerate the affected Execution Identities; and
- freeze the final Execution Snapshot.

This record does not initiate that corrective execution. Work must remain within the approved corrective boundaries and follow the Parent Contract's dependency order: approved Authority Anchor, corrective implementation, final Runner bytes, Identity regeneration, final Frozen Manifest bytes, Snapshot Binding creation, then Final Preflight.

Trust-root selection and any required key provisioning or validation-interface correction must precede Runner final-byte freeze. Circular backfilling and editing an existing immutable Binding in place are prohibited.

Before Final Preflight, the final Snapshot, Binding, immutable reference, and trust-root configuration must receive their applicable controlled review and explicit Owner approval of exact identities. Model approval does not constitute final Snapshot approval or Final Preflight success.

## 8. Current Record-Creation Prohibitions

While creating this approval record, do not:

- create or sign a Snapshot Binding, create a tag/ref, or freeze the final Snapshot;
- modify or execute the Runner;
- modify the Frozen Input Manifest or its validation;
- modify or regenerate an Execution Identity;
- provision or modify trust keys;
- execute Final Preflight or Verification;
- create or execute an Invocation, consume its budget, or cross its Start Boundary;
- access the network;
- retrieve metadata or a tarball;
- create a candidate;
- modify any lockfile;
- invoke npm, enter Runtime, or start P0.S-7;
- commit; or
- push.

## 9. Final State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

The immutable Snapshot Binding model is Owner-approved and frozen. The existing bounded Execution Authority remains unchanged. This record performs no corrective execution, Binding creation, or Verification.
