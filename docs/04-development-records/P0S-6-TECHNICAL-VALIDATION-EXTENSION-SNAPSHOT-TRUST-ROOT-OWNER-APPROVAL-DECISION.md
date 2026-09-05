# P0.S-6 Technical Validation Extension Snapshot Trust Root Selection Owner Approval Decision Record

## 1. Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-OA-20260905-01` |
| Document Type | `OWNER_APPROVAL_DECISION_RECORD` |
| Status | `OWNER_APPROVED_AND_FROZEN` |

This record supplies Architecture Owner approval of the Snapshot Trust Root model identified below. Creating this record does not generate a key, configure the Runner, create a Snapshot Binding, or execute Freeze.

## 2. Parent Decision

| Field | Value |
|---|---|
| Parent Decision | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-SELECTION-20260905-01` |
| Parent Path | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-SELECTION-DECISION.md` |
| Parent SHA-256 | `BF7C1395C9D1EE021539F46D9D1A5EEECEB338A60A328CCEB273848409C5303B` |
| Independent Review | `PASS` |

The Independent Review result is recorded as supplied by the Architecture Owner for this approval. This record does not perform a new Independent Review.

Approval applies to the exact Parent Decision bytes identified above. The Parent was read and its SHA-256 matches this value. It remains unchanged with its historical draft status; this separate record supplies its Owner approval. Changed Parent bytes cannot inherit this approval.

## 3. Owner Decision

`ARCHITECTURE_OWNER_APPROVAL = YES`

`DECISION = APPROVED_SNAPSHOT_TRUST_ROOT_MODEL`

The Architecture Owner approves and freezes the Parent Decision's selected trust model, governance record hash mechanism, trust responsibilities, key and reference rules, verification requirements, and corrective dependency order.

This is architecture approval of the model. It does not approve an unspecified concrete key, final Runner bytes, a final Snapshot Reference, or a completed Binding. The frozen status applies to this approval record and does not assert operational Freeze completion or a cryptographic signature created in this task.

## 4. Approved Model

The approved model requires all three elements:

```text
Owner-approved Ed25519 Public Key
                 +
Signed Snapshot Binding
                 +
Independently Pinned Snapshot Reference
```

`APPROVED_REFERENCE_MECHANISM = GOVERNANCE_RECORD_HASH`

| Element | Approved responsibility |
|---|---|
| Owner-approved Ed25519 Public Key | Authenticate signatures under the exact Owner-approved key |
| Signed Snapshot Binding | Authenticate the payload binding the approved Anchor, bounded Invocation, and final execution components |
| Independently Pinned Snapshot Reference | Select the exact unique Snapshot permitted by the independently authenticated Owner Final Freeze Approval |
| Component hashes | Establish the actual Runner, Identity, and Manifest bytes |

The immutable reference is `sha256:<SHA-256 of the exact decoded Binding payload bytes>`, using the Parent's defined digest representation. Signature verification and hashing use the original payload bytes. An envelope-file digest, if retained, must be labeled as a separate hash domain.

The approved Authority Anchor remains `001a1e495617b211e1cd1702d5895a4c31f314ea`, as selected by its existing Owner Approval. This record does not realign Runner configuration or Execution Identities to that value.

## 5. Approved Trust and Validation Conditions

The Owner must provide or explicitly approve the concrete Ed25519 public key through the independent governance channel. Record its exact identity and approval source, including the Parent's SHA-256 fingerprint domain for DER SubjectPublicKeyInfo. Pin that approved public key in the Runner before final Runner hashing. Binding, Manifest, argv, and environment must not override it or bootstrap an unapproved replacement key.

The corresponding private key remains under Owner control and must not be stored in the repository or execution artifacts. No private key is generated, requested, or disclosed by this record.

The exact permitted Snapshot Reference must be fixed in the separately authenticated Owner Final Freeze Approval. Under the Parent model, that separately typed approval is signed with the approved key, and its exact selected identity is independently retained outside the execution target being checked. A valid but different signed approval cannot silently replace it. Current HEAD, a mutable branch or tag name, a movable ref, Manifest self-declaration, and a raw untrusted input cannot establish the approved reference.

Future validation must jointly establish Authority Anchor ancestry, Binding signature, the independently selected approved Snapshot Reference, Binding payload hash, Runner hash, all Identity hashes, and Manifest hash. Manifest bytes must be authenticated before relying on their internal declarations. Any missing approval, invalid signature, stale identity, mismatch, substituted reference, or ambiguity requires `AUTHORITY_BLOCKED` before Invocation start or network access.

The independent pre-start authority check must authenticate the selected approval and actual Runner bytes before relying on the Runner's own validation code. Its trusted inputs, approval handoff, and exact-reference comparison remain subject to the Parent's implementation requirements. A computed digest or successful signature check alone is insufficient.

Circular hash backfilling is prohibited. Runner, Identities, and Manifest must not embed the later Binding or approval digest; no artifact may embed its own containing commit SHA through a self-referential update. Changed upstream bytes require controlled regeneration and new exact Snapshot approval rather than transfer of an old approval.

## 6. Boundary

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

This approval does not change Verification Goal, Scope, Budget, Network Boundary, or Invocation Boundary. It grants no additional metadata request, tarball request, candidate, Invocation, retry, resume, or reuse allowance. Existing bounded Execution Authority remains unchanged and unconsumed by this record.

Implementation must occur through a separate controlled corrective task under the approved contracts and Freeze Plan. This record does not initiate that task, reopen P0.S-6, or authorize P0.S-7.

## 7. Future Requirements

The following remain mandatory:

1. Owner provides or explicitly approves the Public Key, its exact identity, and its independent approval source.
2. Runner pins the approved Public Key. Complete required Anchor alignment, authenticated approval input, and exact-reference validation before Runner Final Freeze. Then regenerate Runner Identity, Execution Root Identity, Invocation Identity, and Frozen Manifest in the approved order before Binding creation.
3. Create the Snapshot Binding from the final frozen component bytes under separate corrective authorization and the applicable review and signing requirements.
4. Create the exact Snapshot Reference from the Binding payload bytes and fix it through the authenticated Owner Final Freeze Approval with an independently retained selected approval identity. Do not write that reference back into upstream frozen components.
5. Complete Final Snapshot Freeze with explicit approval of the exact final Snapshot, Binding, key identity, and reference. Only after these requirements are complete may a separately authorized task perform the independent pre-start checks and Final Preflight.

The fifth requirement is final Snapshot approval and freeze; it does not postpone Runner or upstream component freeze until after Binding creation. The existing forward dependency order remains mandatory. Any upstream change requires controlled regeneration from the earliest affected step.

## 8. Current Record-Creation Prohibitions

While creating this approval record, do not:

- generate a key, sign an artifact, or provision trust keys;
- modify or execute the Runner;
- modify the Manifest or any Execution Identity;
- create a Snapshot Binding, Snapshot Reference, tag, or ref;
- execute Freeze, Final Preflight, or Verification;
- create, start, or execute an Invocation, consume its budget, or cross its Start Boundary;
- access the network;
- retrieve metadata or tarballs;
- create a candidate;
- modify a lockfile;
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

The Snapshot Trust Root model and governance record hash mechanism are Owner-approved and frozen. Concrete key provisioning, Runner finalization, Identity regeneration, Binding creation, Snapshot Reference approval, and Final Snapshot Freeze remain future work. This record does not resolve those implementation prerequisites or convert earlier blocked freeze results into PASS.
