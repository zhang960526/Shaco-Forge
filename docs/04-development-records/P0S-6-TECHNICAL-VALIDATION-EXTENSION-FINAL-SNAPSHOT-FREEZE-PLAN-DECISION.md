# P0.S-6 Technical Validation Extension Final Snapshot Freeze Plan Decision Record

## Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-FINAL-SNAPSHOT-FREEZE-PLAN-20260905-01` |
| Document Type | `ARCHITECTURE_EXECUTION_PLAN_DECISION` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This draft defines the final Execution Snapshot generation order and freeze rules. It does not select or activate a final Authority Anchor, modify execution artifacts, create an immutable Binding, or execute any step of the plan.

## Decision Goal

Define a strict dependency order for producing an Owner-approved immutable Execution Snapshot before its Binding can be used for execution authorization checks.

The plan must resolve incomplete final identity freeze without circular hash backfilling or approval inferred from current HEAD, mutable references, or Manifest declarations.

## Current Context

| Item | Current state |
|---|---|
| Authority Anchor | `NOT_FROZEN` |
| Runner Identity | `STALE` |
| Frozen Input Manifest | `STALE` |
| Immutable Snapshot Binding | `NOT_CREATED` |
| Snapshot Binding creation result | `BLOCKED` |

The observed review snapshot is recorded in `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING.md`, SHA-256 `28481375972D8FAF55E167E2528D9809FA4C2C34874CA9AC7510FA51B1D26B91`. That document is a review draft, not a final immutable Binding.

The governing model and corrective boundaries are defined by:

- Execution Snapshot Decision `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTION-20260904-01`;
- Corrective Contract `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTIVE-20260904-01`;
- Corrective Owner Approval `P0S6-TVEC-SNAPSHOT-CORRECTIVE-OA-20260905-01`;
- Snapshot Binding Contract `P0S6-TVEC-SNAPSHOT-BINDING-20260905-01`; and
- Snapshot Binding Owner Approval `P0S6-TVEC-SNAPSHOT-BINDING-OA-20260905-01`.

Existing model approvals do not approve unspecified final component bytes, an Anchor value, a signing key, or an immutable reference. Direct Binding creation while its upstream identities remain unfrozen is prohibited.

## 1. Authority Anchor Selection

The Authority Anchor must be an immutable, existing commit identified by its full fixed object ID and explicitly approved under the applicable governance chain.

Selection must document the exact commit identity and its approval source. Commit existence or ancestry alone does not establish approval. The approved value must agree across Runner validation, all Execution Identities, the Manifest, and the final Binding.

Dynamic selection from current HEAD, a branch tip, or a mutable tag name is prohibited. A previously proposed candidate or a constant already present in the Runner cannot become the approved Anchor implicitly.

This draft leaves the final Anchor `NOT_FROZEN`. Step 1 must resolve and approve the exact value before Step 2 can finalize Runner bytes. Later execution-target ancestry checks do not require the tip to equal the Anchor; the parent Contract allows the Anchor itself or its descendants.

## 2. Freeze Sequence

Every step requires completion of all prior steps in this sequence. No downstream artifact may be treated as final while an upstream identity remains pending, stale, or mismatched.

| Step | Action | Required result before advancing |
|---|---|---|
| 1 | Freeze Authority Anchor | Full immutable commit identity explicitly approved and fixed |
| 2 | Finalize Runner bytes | Final Anchor validation and Snapshot validation implementation, approved trust-root configuration where applicable, canonical Runner path, exact bytes, and SHA-256 ready for controlled freeze |
| 3 | Generate Runner Identity | Identity generated from Step 2 bytes; its Runner path, byte length, SHA-256, version, Anchor, and Invocation bindings agree |
| 4 | Finalize Execution Root Identity | Canonical Root and its existing boundary properties established; final Root Identity bytes, SHA-256, Anchor, and Invocation bindings recorded |
| 5 | Finalize Invocation Identity | Existing bounded Invocation identity and unconsumed state preserved; final Identity bytes, SHA-256, Anchor, and budget controls recorded |
| 6 | Generate Frozen Input Manifest | Manifest generated from final upstream bytes; every path, byte length, and hash matches, including all duplicated identity entries |
| 7 | Create Execution Snapshot Binding | All upstream components frozen; complete Snapshot and immutable-reference binding created, reviewed, and Owner-approved for exact final identities |
| 8 | Run Final Preflight | All checks in Section 6 pass against the approved Snapshot and immutable reference before any Invocation Start Boundary |

Before Step 2 completes, select and approve the trust-root mechanism and finish any required validation-interface corrective work. If the existing signed-record interface is selected, provision the Owner-approved public key before final Runner bytes are hashed. Do not defer that Runner change until after Identity, Manifest, or Binding generation.

Step 4 establishes the identity of the existing authorized Execution Root; it does not authorize creation of another Root. Step 5 finalizes the existing Invocation Identity without creating or starting an Invocation or replenishing its budget.

Reverse modification within a freeze sequence is prohibited. If a later check requires changing an upstream component, stop the current sequence, invalidate its affected dependent results, and begin a separately controlled regeneration from the earliest affected step. Do not patch an earlier frozen file merely to make a later hash or approval appear valid.

## 3. Identity Dependency Order

The dependency graph is:

```text
Runner final bytes  --> Runner Identity
Root identity facts --> Execution Root Identity
Invocation identity --> Invocation Identity

All final identities + Runner + frozen inputs
                         |
                         v
                 Frozen Input Manifest
                         |
All frozen bytes + approved Authority Anchor
                         |
                         v
                Snapshot Binding
```

Runner Identity must describe the final Runner, Root Identity must describe the approved Root, and Invocation Identity must describe the existing bounded Invocation. All identities must use the same approved Anchor and Invocation binding.

The Manifest hashes upstream files. The Binding hashes the final Manifest and execution components. Neither an Identity nor the Manifest may depend on the later Binding's hash, and the Runner must not embed its own final hash or the later Manifest/Binding hash.

## 4. Hash Rules

Each Snapshot file component must record:

- its canonical repository-relative path;
- its exact byte length; and
- its SHA-256 computed from the actual final file bytes.

This applies to Runner, Runner Identity, Execution Root Identity, Invocation Identity, and Frozen Input Manifest. The Anchor separately records its full immutable commit identity. Root directory facts are recorded in the Root Identity file; a directory is not assigned a fictitious file-byte hash.

Retain the original encoding and line endings when finalizing files. Any byte change, including encoding or newline conversion, invalidates that file's hash and every affected dependent identity.

Hash values must be read from actual bytes and independently authenticated by the approved freeze/reference chain. Do not accept a mutable branch, current HEAD, or Manifest self-declaration as the source of an approved Snapshot identity. Matching internal hashes is necessary but insufficient for approval.

The final record's own hash must be retained outside the record it authenticates. No record may require backfilling the SHA of the Git commit that contains its own changed bytes.

## 5. Snapshot Binding Rule

Before Step 7 may create the immutable Snapshot Binding, all of the following must hold:

- Authority Anchor is approved and frozen;
- Runner bytes and required trust-root configuration are final and frozen;
- Runner, Root, and Invocation Identities are final and frozen;
- Frozen Input Manifest bytes and every dependent hash are final and frozen; and
- the immutable-reference mechanism and validation method have been selected under the Binding Contract.

Step 7 must bind the complete final byte set to an Owner-approved immutable reference independent of the current execution target's self-declarations. Model approval is not final Snapshot approval. A computed digest, unsigned self-assertion, mutable tag name, or movable ref alone does not satisfy this requirement.

After Binding creation, any component or Anchor change requires a new Snapshot identity and a newly reviewed and approved Binding. Preserve the prior immutable Binding; never edit it in place or transfer its approval to changed bytes.

An independently authenticated pre-start authority check must compare the observed Binding against the exact retained Owner-approved reference and authenticate the Runner before relying on its validation code. Required key provisioning and interface changes occur before Step 2 freeze, not through later hash backfilling.

The existing blocked review draft must not be promoted automatically into the final Binding. If any prerequisite remains missing, Binding creation stays `BLOCKED` and the real immutable reference remains `NOT_CREATED`.

## 6. Final Preflight Requirements

Final Preflight must verify all five requirements together:

1. Anchor ancestry: the execution target contains the explicitly approved Anchor history, using the parent Contract's allowed ancestry relation.
2. Snapshot Binding: the Binding exists and matches the exact independently retained Owner-approved immutable reference, with required approval and signature checks.
3. Runner hash: actual Runner path, byte length, and SHA-256 match the approved Binding and Runner Identity.
4. Manifest hash: actual Manifest path, byte length, and SHA-256 match the approved Binding before its contents are trusted.
5. Identity hashes: Runner Identity, Root Identity, and Invocation Identity match the Binding, their corresponding Manifest entries, and the approved Anchor and Invocation values.

Any failure, missing value, stale identity, unresolved approval, mutable reference, or ambiguity requires `AUTHORITY_BLOCKED` before Invocation start or network access. There is no fallback to current HEAD equality, ancestry alone, or Manifest self-consistency.

Existing repository-state, Scope, Budget, Root, and Invocation gates remain mandatory. A successful future Final Preflight does not itself execute Verification, consume an Invocation, or expand authority. This draft performs no Final Preflight and records no preflight PASS.

## 7. Scope Boundary

The following remain unchanged:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

This plan does not change Verification Goal, Scope, Budget, Network Boundary, or Invocation Boundary. It grants no additional metadata request, tarball request, candidate, Invocation, retry, resume, or reuse allowance.

Before implementation, this draft requires Independent Review and Architecture Owner approval. Execution of the plan must occur within a separately controlled corrective task. Final exact-byte review and Owner freeze remain required; approval of a plan does not approve a still-unknown Snapshot.

## 8. Forbidden

Creating this Decision does not perform or authorize:

- Runner modification or execution;
- Manifest modification;
- Identity modification or regeneration;
- Anchor activation or trust-key provisioning;
- Snapshot Binding, tag/ref creation, or final Snapshot freeze;
- Final Preflight or Verification;
- Invocation creation, execution, or crossing its Start Boundary;
- network access;
- metadata retrieval;
- tarball retrieval;
- candidate creation;
- lockfile modification;
- npm, Runtime, or P0.S-7; or
- commit or push.

## Final Draft State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

The existing bounded Execution Authority is preserved. Final execution identities remain unfrozen, immutable Binding creation remains blocked, and this document remains `DRAFT_FOR_INDEPENDENT_REVIEW`.
