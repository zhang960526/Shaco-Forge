# P0.S-6 Technical Validation Extension Execution Snapshot Binding Contract

## 1. Contract Identity

| Field | Value |
|---|---|
| Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-20260905-01` |
| Document Type | `EXECUTION_SNAPSHOT_BINDING_CONTRACT` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This draft defines the requirements for a future Owner-approved immutable Execution Snapshot Binding. It creates no Binding, freezes no execution bytes, and performs no corrective implementation, Final Preflight, or execution.

## 2. Parent Governance

| Parent | Identity |
|---|---|
| Corrective Contract | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTIVE-20260904-01` |
| Corrective Owner Approval | `P0S6-TVEC-SNAPSHOT-CORRECTIVE-OA-20260905-01` |
| Execution Snapshot Decision | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTION-20260904-01` |

The parent records are:

- `docs/03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTIVE-CONTRACT.md`
- `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTIVE-OWNER-APPROVAL-DECISION.md`
- `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTION-DECISION.md`

The parent approval establishes the corrective implementation boundary. It does not pre-approve an unspecified Binding or final execution-byte set.

The Runner corrective implementation contains Authority Anchor ancestry and signed Snapshot Binding validation entry points. Snapshot Binding creation and final execution identity freeze remain outstanding. Implementation availability is not Final Preflight success.

## 3. Goal

Define an Owner-approved immutable Snapshot Binding that fixes the exact final byte set permitted for the bounded Technical Validation Extension Invocation.

The Binding must prevent execution-identity drift after the Authority Anchor and prevent the Manifest from acting as its own sole trust root, without reintroducing Git commit SHA self-reference.

## 4. Snapshot Binding Model

| Component | Responsibility |
|---|---|
| Authority Anchor | Establish the approved governance lineage through an immutable commit identity |
| Execution Snapshot | Identify the exact Runner, Manifest, and Execution Identity bytes |
| Snapshot Binding | Connect the approved Anchor, Snapshot, and bounded Invocation through an independently authenticated immutable reference |

All three components are required. A descendant commit does not automatically acquire approval for changed execution bytes.

## 5. Snapshot Contents

The Binding must fix the following identities:

| Component | Required fields |
|---|---|
| Runner | canonical repository-relative path, exact byte length, SHA-256 |
| Runner Identity | canonical repository-relative path, exact byte length, SHA-256 |
| Execution Root Identity | canonical repository-relative path, exact byte length, SHA-256 |
| Invocation Identity | canonical repository-relative path, exact byte length, SHA-256 |
| Frozen Input Manifest | canonical repository-relative path, exact byte length, SHA-256 |
| Authority Anchor | full immutable Git commit identity |

The Binding must identify the governing Corrective Contract and the exact bounded Invocation. Its Owner approval must identify this Binding Contract, the chosen immutable-reference mechanism, and the exact approved Binding identity.

The five file roles must be complete, unique, and unambiguous. Every path and hash must describe the final bytes actually used. Directory identity is represented by the Execution Root Identity file; no directory byte hash is implied.

Final Anchor selection, final component hashes, trust-root values, and Binding reference are not assigned or approved by this draft. Current Runner bytes and constants must not be promoted to final frozen identities implicitly.

## 6. Immutable Reference

The expected Binding identity must come from an Owner-approved immutable reference outside the current execution target's self-declarations. It must not be discovered by trusting dynamic current HEAD, the Manifest, or a reference nominated solely by the Binding being checked.

Permitted mechanisms, subject to explicit selection and Owner approval, are:

| Mechanism | Immutability and authentication requirements |
|---|---|
| Signed Git tag | Pin the exact tag object ID and referenced object; validate its signature against the independently approved signer. A movable tag name alone is insufficient. |
| Dedicated immutable ref | Pin the approved object ID and enforce create-once, no-update, no-delete controls. Resolve the ref and compare its target to that pinned ID on every validation. A naming convention alone is insufficient. |
| Governance record hash | Pin the SHA-256 of the exact approved record bytes in an independently authenticated Owner approval or freeze reference. Recompute and compare before trusting the record's contents. |

The selected mechanism, exact hash domain or object type, approved signer or approval identity, and source of the expected reference must be documented before final freeze. A valid signature authenticates a signer and bytes; it does not make a mutable filename or tag name immutable.

The immutable reference must bind an already-finalized Snapshot. Its own containing commit SHA must not be backfilled into a record whose bytes determine that SHA. The final Manifest must not hash the later Binding that already hashes that Manifest.

Changing any component, Anchor, Binding payload, or approved reference creates a different identity. Existing approval cannot be transferred by updating internal hashes or moving a ref. The existing Binding and approval must remain preserved; replacement requires controlled review and explicit new Owner disposition.

## 7. Current Runner Interface Compatibility

The current Runner reads the proposed file location:

`docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.json`

Its implemented signed-record envelope contains canonical base64 `payload` and `signature`. Ed25519 signs the exact decoded payload bytes. The payload contains `recordType`, `status`, `contractId`, `authorityAnchor`, `invocationId`, and `files`; the five file roles are `RUNNER`, `RUNNER_IDENTITY`, `EXECUTION_ROOT_IDENTITY`, `INVOCATION_IDENTITY`, and `FROZEN_INPUT_MANIFEST`.

For this existing interface, `contractId` refers to the parent Corrective Contract. This Binding Contract's identity must additionally be bound by the separate Owner approval. This draft does not silently change that interface.

If the signed-record mechanism is selected, the Owner-approved Ed25519 public key must be provisioned before Runner final-byte freeze. It must not be supplied by the untrusted Binding or Manifest. The exact approved payload digest must be independently retained and compared with the observed payload digest. If the envelope file digest is also retained, it must be labeled separately from the decoded payload digest.

The current Runner computes a payload reference and verifies signatures, but a computed reference alone is not a comparison against the Owner-approved expected reference. That exact comparison must be enforced by the Runner or its independently authenticated pre-start authority validator before Final Preflight can pass. The latter must also authenticate the Runner bytes before allowing it to execute; a modified Runner cannot be trusted to authenticate its own validation code.

Signed Git tags and dedicated refs are alternatives allowed by this Contract, not interfaces already implemented by the current Runner. Selecting either requires compatible, reviewed validation under the approved corrective boundary before freezing final Runner bytes. This draft selects no mechanism, provisions no key, and creates no reference.

## 8. Binding Verification

The Runner's pre-start authority validation must establish all of the following:

1. The observed execution target has the approved Authority Anchor in its history, including the Anchor itself as allowed by the parent Contract. Dynamic HEAD equality is not required.
2. The Snapshot Binding exists at its approved location and can be read without following an unauthorized path or substituted reference.
3. The Binding identity matches the independently retained Owner-approved immutable reference, with any required signature and signer checks satisfied. The Contract, Anchor, Invocation, and complete component set must match that approval.
4. The Runner path, byte length, and SHA-256 match the approved Binding.
5. The Frozen Input Manifest path, byte length, and SHA-256 match the approved Binding before any internal Manifest declarations are trusted.
6. All three Identity files match the Binding, their corresponding authenticated Manifest entries, and the approved Anchor and Invocation identities. Runner Identity must describe the exact bound Runner.

These requirements are conjunctive. Any failure, missing value, unavailable object, unresolved approval, mutable reference, or ambiguity produces:

`AUTHORITY_BLOCKED`

The failure must occur before the Invocation Start Boundary, network access, metadata retrieval, tarball retrieval, or candidate creation. There is no fallback to ancestry alone, current HEAD equality, an unapproved Snapshot, or Manifest self-consistency.

## 9. Freeze Order

The mandatory order is:

```text
Authority Anchor
       |
       v
Corrective implementation
       |
       v
Runner final bytes
       |
       v
Identity regeneration
       |
       v
Frozen Manifest final bytes
       |
       v
Snapshot Binding creation
       |
       v
Final Preflight
```

Trust-root selection, approved key provisioning where applicable, and validation-interface corrections must be completed before Runner final bytes are frozen. Runner Identity is generated from those bytes before remaining dependent identities and the Manifest are finalized.

After Binding creation, the exact final Snapshot, Binding, and reference must receive the required review and Owner freeze before Final Preflight. Their approval must remain independent of the files they authenticate.

Circular backfilling is prohibited. An upstream byte change invalidates its dependent hashes and requires regeneration in dependency order and renewed applicable review. Do not edit an existing Binding in place or rewrite Runner bytes to insert the later Manifest or Binding hash.

## 10. Security Boundary

The following are prohibited:

- current HEAD as the sole trust root;
- the Manifest proving its own authenticity;
- a mutable branch reference as the Binding;
- a mutable tag or ref name without a pinned approved object identity;
- a key or expected digest accepted solely from the object being authenticated;
- an unapproved Snapshot or automatic reuse of approval for changed bytes; and
- treating implementation completion, a valid signature alone, or internally consistent hashes as final Snapshot approval.

## 11. Scope Boundary

This Contract does not change the Verification Goal, Scope, Budget, Network Boundary, or Invocation Boundary. It grants no additional request, candidate, Invocation, retry, resume, or reuse budget.

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

The existing bounded Execution Authority remains unchanged. A future Binding or successful Final Preflight cannot itself expand that Authority or authorize P0.S-7.

## 12. Forbidden

Creating this Contract must not perform or authorize:

- Snapshot Binding creation, signing, tag/ref creation, or final Snapshot freeze;
- Runner, Manifest, Identity, or trust-key modification;
- Final Preflight, Verification, or Runner execution;
- Invocation creation, Invocation execution, or crossing its Start Boundary;
- network access, metadata retrieval, or tarball retrieval;
- candidate creation or lockfile modification;
- npm, Runtime, or P0.S-7; or
- commit or push.

## 13. Required Review

Before Binding implementation or creation, this exact Contract must receive Independent Review `PASS` and Architecture Owner Approval. Parent approvals do not substitute for those approvals of this Contract.

Before Final Preflight, the completed Snapshot, selected immutable reference, trust-root configuration, and Binding must receive their applicable controlled review and explicit Owner approval of exact identities. Missing approval leaves execution `AUTHORITY_BLOCKED`.

## 14. Final Draft State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

This Contract remains `DRAFT_FOR_INDEPENDENT_REVIEW`. No Snapshot Binding or final execution approval is created by this draft.
