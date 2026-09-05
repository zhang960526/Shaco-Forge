# P0.S-6 Technical Validation Extension Snapshot Binding Signing Contract Owner Approval Decision Record

## 1. Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-SNAPSHOT-BINDING-SIGNING-OA-20260905-01` |
| Document Type | `OWNER_APPROVAL_DECISION_RECORD` |
| Status | `OWNER_APPROVED_AND_FROZEN` |

This record supplies Architecture Owner approval of the identified Snapshot Binding Signing Process Contract. It approves and freezes the process definition only. It does not authorize or perform a signing event, read or use a private key, create a signature, or create a final Snapshot Binding.

## 2. Parent Contract

| Field | Value |
|---|---|
| Parent Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-SIGNING-20260905-01` |
| Parent Contract Path | `docs/03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-SIGNING-CONTRACT.md` |
| Parent SHA-256 | `14AB3F4FD5A11F4D77010749CB7906CAB8F71C4DF616BB4FBCA4E3216B55C161` |
| Independent Review | `PASS` |

The Independent Review result is recorded as supplied by the Architecture Owner for this approval. This record does not perform a new Independent Review or technical validation.

Approval applies only to the exact Parent Contract bytes identified by the path and SHA-256 above. The Parent Contract remains unchanged. Any byte change to that Contract creates a different identity and cannot inherit this approval.

## 3. Owner Decision

`ARCHITECTURE_OWNER_APPROVAL = YES`

`DECISION = APPROVED_SNAPSHOT_BINDING_SIGNING_PROCESS`

The Architecture Owner approves and freezes the Parent Contract's Snapshot Binding signing process and the rules listed in Section 4.

This decision approves how a separately authorized future Owner signing event must be conducted. It does not request access to the private key, authorize Codex or the Runner to sign, approve the current draft Binding payload as final-form input, create a signature-bearing envelope, approve an exact final Snapshot Reference, or constitute Owner Final Freeze Approval of a Snapshot Binding.

## 4. Approved Rules

### 4.1 Exact Canonical Binding Payload Bytes Signing

The sole permitted signing input is:

`exact canonical Binding payload bytes`

The approved process signs the reviewed byte sequence as an opaque byte array. JSON reserialization, whitespace change, field reordering, newline conversion, BOM change, encoding conversion, or any other byte transformation between review, signing, envelope assembly, and validation is prohibited.

A payload that asserts a draft status remains a draft even if signed. Eligibility as final-form payload must exist before signing and cannot be created by the signature. Any separately authorized payload change requires a new payload identity, Snapshot Reference, exact-byte review, signature, and applicable Owner approval.

### 4.2 Ed25519 Signature

The approved signature algorithm is `Ed25519` over the exact canonical Binding payload bytes. The approved process does not sign a reserialized object, the payload hash, or the Snapshot Reference in place of the payload bytes.

The signature record must preserve the exact raw 64-byte Ed25519 signature, the `Ed25519` algorithm identity, the approved public key fingerprint, and the byte length and SHA-256 of the exact signed payload. Any Base64 representation is transport encoding only and must losslessly reproduce the original payload and signature bytes.

### 4.3 Owner-Controlled Private Key Boundary

The Ed25519 private key remains exclusively Owner controlled and inside the Owner-approved signing environment or device.

The private key must not enter:

- the repository;
- the Runner;
- the Frozen Manifest;
- the Binding payload;
- the Binding envelope;
- an approval record, evidence file, log, command line, environment variable, or repository temporary artifact; or
- Codex, repository automation, or a validation process.

Codex and the Runner must not generate an Owner private key, select a replacement signer, reconstruct a key from seed material, export private-key material, or treat an automatically generated key as the approved trust root.

### 4.4 Snapshot Reference SHA-256 Payload Model

The approved Snapshot Reference model is:

`sha256:<exact payload bytes hash>`

SHA-256 is computed over the exact canonical Binding payload bytes used as the Ed25519 signing input. Signing and envelope assembly must not change those bytes.

If the payload changes by even one byte, the previous Snapshot Reference and signature do not apply. The changed payload requires a newly computed reference, new exact-byte review, new signature, and new applicable Owner approval. An earlier payload, reference, signature, or approval must not be edited in place or transferred to changed bytes.

### 4.5 Final Freeze Approval Binding Requirements

The approved process requires a distinct Owner Final Freeze Approval to bind, as one indivisible approval set:

- the exact Snapshot Reference;
- the Binding payload identity, including byte length, SHA-256, canonicalization profile, record type, status, and Binding Contract ID;
- the approved Ed25519 public key fingerprint and fingerprint domain;
- the exact Authority Anchor;
- the bounded Invocation ID and Invocation Identity SHA-256;
- the signature algorithm and exact signature bytes or their unambiguous content identity;
- the exact signature-bearing envelope identity; and
- every component's canonical path, exact byte length, and SHA-256.

Final Freeze Approval must be independently authenticated and retained outside the Binding's self-declarations. A payload, envelope, valid signature, or this process approval cannot approve the Binding itself.

Missing, pending, ambiguous, mismatched, mutable, or self-supplied approval data prevents finalization and requires `AUTHORITY_BLOCKED` if the artifact is presented for execution.

## 5. Effect of Approval

This decision freezes only the signing process contract identified in Section 2. It establishes no approval for:

- an exact Binding payload;
- use of an Owner private key;
- a signing event;
- signature bytes;
- a final Snapshot Reference;
- a final Binding envelope;
- an exact final component set; or
- a Final Freeze Approval.

Any future signing activity requires separate explicit Owner control over an eligible exact payload and the approved signing environment. Any resulting Snapshot Binding remains non-final until the distinct Final Freeze Approval requirements are satisfied.

## 6. State and Scope Boundary

The following state remains unchanged:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

This approval does not change or reinterpret:

- the Verification Goal;
- Scope;
- Budget;
- Network Boundary; or
- Invocation Boundary.

It grants no new Invocation, retry, resume, reuse, second Invocation, request, metadata, tarball, or candidate budget. It does not reopen P0.S-6 or authorize P0.S-7.

## 7. Current Record-Creation Prohibitions

Creating this approval record must not:

- read, import, export, copy, reconstruct, or disclose a private key;
- generate a signature;
- modify the Binding payload;
- modify or execute the Runner;
- modify the Frozen Manifest;
- modify or regenerate an Identity;
- create or classify a Snapshot Binding;
- perform Verification or technical validation;
- execute Final Preflight;
- create or execute an Invocation;
- cross the Invocation Start Boundary;
- access the network;
- retrieve metadata or a tarball;
- create a candidate or modify a lockfile;
- invoke npm, enter Runtime, or begin P0.S-7;
- commit; or
- push.

## 8. Final State

`ARCHITECTURE_OWNER_APPROVAL = YES`

`DECISION = APPROVED_SNAPSHOT_BINDING_SIGNING_PROCESS`

`OWNER_APPROVAL_DECISION_STATUS = OWNER_APPROVED_AND_FROZEN`

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`SIGNING_EXECUTED = NO`

`PRIVATE_KEY_ACCESSED = NO`

`SIGNATURE_CREATED = NO`

`BINDING_CREATED = NO`

This Owner Approval Decision Record approves and freezes the signing process only. It performs no signing, Binding creation, Final Freeze Approval, Verification, Invocation, or network activity.
