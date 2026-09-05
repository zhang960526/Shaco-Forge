# P0.S-6 Technical Validation Extension Snapshot Trust Root Selection Decision Record

## Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-SELECTION-20260905-01` |
| Document Type | `ARCHITECTURE_DECISION_RECORD` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This draft records the selected final Snapshot Binding trust-root design for Independent Review. It does not supply or approve a concrete key, configure the Runner, freeze execution bytes, or create a Binding. Architecture Owner approval of this Decision and the applicable exact-value approvals remain required before implementation and final freeze.

## Decision Goal

Establish Owner approval, an immutable Snapshot Reference, and signature verification as the trust basis for final execution identity. The model must authenticate both the approved Snapshot and its actual component bytes without current HEAD trust, Manifest self-proof, mutable references, or commit SHA self-reference.

## Governance Basis

| Record | Identity | SHA-256 |
|---|---|---|
| Authority Anchor Selection Owner Approval | `P0S6-TVEC-AUTHORITY-ANCHOR-SELECTION-OA-20260905-01` | `4BDCED255C199F5D2E6180744CE2CA07F0A6FFE00D6B7E49A8953240ACCEE5D5` |
| Final Snapshot Freeze Plan | `P0S6-TVEC-FINAL-SNAPSHOT-FREEZE-PLAN-20260905-01` | `CB082977CF72A7E2757750D24E0D8E6CDFF93B0E8577B9DEFA1C4901D257A0E7` |
| Final Snapshot Freeze Plan Owner Approval | `P0S6-TVEC-FINAL-SNAPSHOT-FREEZE-PLAN-OA-20260905-01` | `152BD02A434E2575732BF02357AEAE236793B44FE3BE8EA85E6067B3EABC5243` |
| Snapshot Binding Contract | `P0S6-TVEC-SNAPSHOT-BINDING-20260905-01` | `2624EC554DF4019144D7B82EDE01497F5A3F4515CBBDD8E442FE35D832E2AA2E` |
| Snapshot Binding Owner Approval | `P0S6-TVEC-SNAPSHOT-BINDING-OA-20260905-01` | `4BF54313B508D8358E161C4451105F1FF414631C19B902B90546BA7522C33602` |

These existing records remain unchanged. Approval of a model or freeze process does not approve an unspecified key or final Snapshot.

## 1. Current Problem

The Authority Anchor selection is approved and frozen as the exact immutable commit identity:

`FINAL_AUTHORITY_ANCHOR = 001a1e495617b211e1cd1702d5895a4c31f314ea`

The Snapshot Binding model is approved, but its concrete trust root is not configured. The current Runner contains `SNAPSHOT_OWNER_PUBLIC_KEY_PEM = null`, so its signed Binding gate fails closed and its final bytes cannot yet be frozen.

| Item | Current observation |
|---|---|
| Runner path | `docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/runner/verify-env-paths-integrity.mjs` |
| Runner bytes | `33293` |
| Runner SHA-256 | `9AA4B23E3F2396F5239C95D9D97D22F01F72B1223C41E81F57B582063CF27ABD` |
| Runner Anchor constant | `116b0ddf30be4513e58817500dba85434b07144b` |
| Owner-approved concrete public key | `NOT_PROVIDED` |
| Runner final freeze | `BLOCKED` |
| Runner Identity | `STALE` |
| Execution Snapshot Binding | `NOT_CREATED` |
| Final approved Snapshot Reference | `NOT_CREATED` |

The frozen Anchor selection does not imply that Runner configuration or dependent identities have already been aligned. The observed Runner still uses the old Anchor constant. Future corrective work must align it to the approved value before final hashing. The bytes above are an observation of the current file, not an approved final Runner freeze.

Ancestry alone authenticates neither final execution bytes nor their Owner approval. Matching Manifest hashes alone permits descendant identity drift. A signature alone can authenticate multiple Snapshots signed by the same key; it does not select the unique Snapshot permitted for this bounded Invocation.

## 2. Selected Trust Model

The selected design is:

```text
Owner-approved Ed25519 Public Key
                 +
Signed Snapshot Binding
                 +
Independently Pinned Snapshot Reference
```

Use the governance-record-hash mechanism permitted by the Snapshot Binding Contract. The Binding envelope carries the exact payload bytes and their Ed25519 signature. Its immutable Snapshot Reference identifies the payload bytes by SHA-256. An independently authenticated Owner Final Freeze Approval fixes the exact reference allowed for the approved Anchor and Invocation.

Signed Git tag names, branch tips, and ordinary Git refs are not selected as trust roots. No Git tag or ref needs to be created by this design. The fixed Authority Anchor remains the separate governance-history baseline.

## 3. Trust Responsibilities

| Trust element | Responsibility | Limit |
|---|---|---|
| Owner-approved Public Key | Authenticate signatures under the exact key associated with the Owner's approval | A valid signature does not by itself select the permitted Snapshot |
| Independently Pinned Snapshot Reference | Identify the unique Owner-approved Snapshot for the bounded execution | A digest computed from an untrusted file does not establish approval |
| Component Hashes | Establish the exact actual Runner, Identity, and Manifest bytes | Internal consistency does not authenticate the source of approval |
| Authority Anchor | Establish approved governance lineage | Ancestry alone does not prove execution-byte approval |

All responsibilities must hold together. No component can replace a missing trust element by asserting its own approval.

## 4. Public Key Rules

The public key must be provided or explicitly approved by the Owner through the independent governance approval channel. Its exact key identity and approval source must be recorded before Runner final-byte freeze. For an unambiguous key fingerprint, use SHA-256 of the Ed25519 public key's DER SubjectPublicKeyInfo encoding and label that hash domain explicitly.

The corresponding private key remains under Owner control and must not be placed in the Runner, Manifest, Binding payload, execution identities, or repository. This Decision neither generates nor requests disclosure of a private key.

The Runner must pin the approved public key before final hashing. It must reject missing, invalid, non-Ed25519, dynamic, or unapproved keys. Binding, Manifest, argv, and environment inputs must not supply a replacement or override the pinned key.

Initial key approval must come from independent Owner authority; a key file or a signature made by an otherwise unapproved key cannot bootstrap its own trust. Key substitution or rotation requires explicit new approval, controlled Runner finalization, and regeneration of all affected downstream identities. It cannot silently inherit the previous Snapshot approval.

No public key, key fingerprint, or signer-specific approval is fabricated or provisioned by this draft.

## 5. Snapshot Reference Rules

The reference must be immutable, exact, and externally approved:

`Snapshot Reference = sha256:<SHA-256 of the exact decoded Binding payload bytes>`

The textual digest representation must be fixed by the implementation contract; use 64 uppercase hexadecimal digits consistently with existing Snapshot file SHA-256 values. Hash and verify the original UTF-8 payload bytes, not JSON reserialized after parsing. The envelope transports those bytes and their signature; an envelope-file digest, if retained, must be labeled separately from the payload digest.

The signed payload must bind the approved full Authority Anchor commit, governing Corrective Contract, exact bounded Invocation, and exactly the five execution components: Runner, Runner Identity, Execution Root Identity, Invocation Identity, and Frozen Input Manifest. Each component must have a canonical repository-relative path, exact byte length, and SHA-256.

Owner Final Freeze Approval must identify this selected mechanism, the governing Binding Contract, approved key identity, Anchor, Invocation, and exact Snapshot Reference. Its authenticity must be independently established. Under this model, a separately typed Owner approval record is signed with the approved Ed25519 key, and the exact selected approval identity is retained independently outside the candidate execution target. A valid but different signed approval must not replace that selected approval implicitly.

Neither a repository file's location nor its self-declared status establishes that it is the selected Owner approval. An approval record supplied alongside the Binding remains untrusted until its signature and independently retained approval identity are checked. A raw argv or environment value is not an approved reference merely because it was passed to the Runner.

The reference must not depend on current HEAD, a mutable branch, a mutable tag name, a movable ref, Manifest self-declaration, or a reference nominated solely by the Binding being validated.

Content addressing fixes identity, not file permissions or availability. Changing the payload produces a different Snapshot Reference and requires new explicit review and approval. An unavailable or changed artifact fails closed. Existing immutable approvals and Bindings must be preserved rather than edited in place.

The payload must not contain its own digest. Its reference is retained in the later, separate approval record. Neither the Runner nor the Identity files nor the Manifest may embed the later Binding or approval digest. The approval's own retained identity is kept outside the record it authenticates. No artifact may backfill the SHA of the Git commit containing its own bytes.

## 6. Verification Model

Future Runner validation must establish all seven requirements:

1. Authority Anchor ancestry: the observed execution target is the fixed approved Anchor or its descendant through authentic local commit history. Current HEAD may identify the observed target but must not select the Anchor; equality is not required.
2. Binding signature: verify the signature over the exact payload bytes with the pinned Owner-approved Ed25519 public key. Check the record type, approved status, Contract, Anchor, Invocation, and complete component set.
3. Snapshot Reference: authenticate the separate Owner Freeze Approval, verify its signature with the pinned key, and require its identity to match the independently retained selected approval. Obtain the expected Snapshot Reference only from that authenticated approval.
4. Binding payload hash: compute SHA-256 from the exact payload bytes and require equality with the approved Snapshot Reference. Computing or returning a digest without that comparison is insufficient.
5. Runner hash: compare actual canonical path, bytes, and SHA-256 with the approved Binding and Runner Identity.
6. Identity hashes: compare actual Runner Identity, Execution Root Identity, and Invocation Identity files with the Binding; also check their Anchor, Invocation, and corresponding content identities.
7. Manifest hash: authenticate the actual Frozen Input Manifest bytes against the Binding before relying on its declarations, then check its component entries against the authenticated Snapshot and actual files.

These are conjunctive requirements, not permission to trust Manifest content before authenticating its bytes. Missing data, invalid signatures, mismatched approval identities, stale hashes, substituted references, or ambiguous history must produce `AUTHORITY_BLOCKED` before Invocation start or network access. There is no fallback to HEAD equality, ancestry alone, unsigned reference input, or Manifest self-consistency.

### Runner Validation Input and Independent Startup Boundary

The Runner's validation inputs consist of the Binding envelope, the authenticated Owner Freeze Approval and independently selected approval identity, and the existing execution component files. The approval record's schema, signature purpose, retained identity, input handoff, and independent storage must be concretely defined and reviewed in the future corrective task before Runner finalization. They must not be discovered from the Manifest or selected by whichever approval file happens to be supplied.

Before relying on the Runner's validation code, the independent pre-start authority check must authenticate the approved public key and selected approval from its own trusted governance inputs, authenticate the Binding, and compare the actual Runner bytes with the approved Snapshot. A changed Runner cannot be trusted to authenticate its own verifier. The subsequent Runner checks do not replace this independent startup boundary.

The existing Runner already has a signed Binding entry point, but its null public key and computed-reference return are not a completed implementation of this model. Approved key provisioning, Anchor alignment, exact-reference enforcement, and the authenticated approval input must be completed before freezing Runner bytes. This Decision performs none of these checks operationally and records no Final Preflight result.

## 7. Scope Boundary

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

Verification Goal, Scope, Budget, Network Boundary, and Invocation Boundary remain unchanged. This Decision grants no additional metadata request, tarball request, candidate, Invocation, retry, resume, or reuse allowance. It neither reopens P0.S-6 nor authorizes P0.S-7.

The existing bounded Execution Authority remains `YES`. This design does not consume that authority or cross the Invocation Start Boundary. Independent Review and Owner approval of this draft precede separate controlled corrective implementation; model approval is not approval of still-unknown final Snapshot bytes.

## 8. Future Corrective Steps

The future sequence must preserve the approved Freeze Plan:

1. Owner provides or explicitly approves the concrete Ed25519 public key. Record its exact identity and independent approval source, and define how the exact final approval identity will be retained independently.
2. Configure the Runner trust root under separate corrective authorization. Align its Anchor to `001a1e495617b211e1cd1702d5895a4c31f314ea`, pin the approved public key, and complete the authenticated approval input and exact-reference checks, including the independent pre-start handoff.
3. Complete static review and Runner Final Freeze. Record final canonical path, bytes, and SHA-256 only after all required Runner configuration and interface work is complete.
4. Regenerate identities in order: Runner Identity, Execution Root Identity, then Invocation Identity. Preserve the existing Root, bounded Invocation, and unconsumed state.
5. Generate the Frozen Input Manifest from the final upstream bytes and identity hashes.
6. Create the Snapshot Binding from all final components, compute its payload reference, complete the applicable exact-byte review and Owner signature, then issue the separately authenticated Owner Final Freeze Approval and independently retain its selected identity.
7. Run the independent pre-start checks and Final Preflight only in their separately authorized task, after all preceding steps and exact Snapshot approvals are complete. Final Preflight does not authorize an Invocation or Verification beyond the existing boundary.

No reverse modification or circular hash backfill is allowed. If an upstream value must change, stop and restart controlled regeneration from the earliest affected step. Changed final bytes require a new Snapshot and explicit approval; old approval is not transferable.

## 9. Forbidden

Creating this Decision does not:

- generate a key pair, sign an artifact, or provision trust keys;
- modify or execute the Runner;
- modify the Manifest or any Execution Identity;
- execute Runner freeze or create a Snapshot Binding, immutable reference, tag, or ref;
- execute Final Preflight or Verification;
- create, start, or execute an Invocation, or cross its Start Boundary;
- access the network;
- retrieve metadata or tarballs;
- create a candidate;
- modify a lockfile;
- invoke npm, enter Runtime, or start P0.S-7; or
- commit or push.

## Final Draft State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

`RUNNER_FINAL_FREEZE = BLOCKED`

`RUNNER_IDENTITY = STALE`

`SNAPSHOT_BINDING = NOT_CREATED`

The selected trust-root design is recorded for Independent Review. A concrete Owner-approved key, final Runner bytes, and an independently pinned approved Snapshot Reference are not created by this draft.
