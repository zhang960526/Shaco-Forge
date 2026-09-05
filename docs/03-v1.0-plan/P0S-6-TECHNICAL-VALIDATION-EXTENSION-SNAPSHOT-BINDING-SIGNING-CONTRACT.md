# P0.S-6 Technical Validation Extension Snapshot Binding Signing Process Contract

## 1. Contract Identity

| Field | Value |
|---|---|
| Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-SIGNING-20260905-01` |
| Document Type | `SNAPSHOT_BINDING_SIGNING_CONTRACT` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This Contract defines the controlled process by which an already-created Binding payload may be signed by the Owner and assembled into a final Owner-approved Snapshot Binding. It is a process contract only. It does not approve payload bytes, read or use a private key, create a signature, create a final Binding, or execute any validation.

## 2. Purpose and Authority Boundary

The process has one purpose:

```text
reviewed final-form Binding payload bytes
        |
        v
Owner-controlled Ed25519 signing
        |
        v
signature-bearing Binding envelope
        |
        v
Owner Final Freeze Approval of exact identities
        |
        v
final Owner-approved Snapshot Binding
```

Every transition is controlled and fail-closed. Possession of a payload, computation of its hash, creation of a signature, or assembly of an envelope does not independently establish final approval.

This Contract grants no signing authority to Codex, the Runner, repository automation, or any other non-Owner actor. It creates no authority to modify an existing Binding payload.

## 3. Current Declared Draft Input

The current Binding payload is declared as follows:

| Field | Current declared value |
|---|---|
| Payload status | `DRAFT ONLY` |
| Signature status | `NOT_CREATED` |
| Snapshot Reference | `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| Authority Anchor | `001a1e495617b211e1cd1702d5895a4c31f314ea` |
| Signature algorithm | `Ed25519` |
| Public key fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Runner | `33726` bytes; SHA-256 `DDC871A3970D064D5D26D0A1B5D668F6518C9EDFB23F37092D58FE72A3FC8A38` |
| Runner Identity SHA-256 | `88A40DFEE0758965A3B0C9EA09ADD5239EA99C4F5A119992D4044F8BFDCAE381` |
| Execution Root Identity SHA-256 | `AC4D73DB00AC69D421FD3C143B4672A80A90445FCB471095845DA0B720029574` |
| Invocation Identity SHA-256 | `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |
| Frozen Manifest SHA-256 | `3B8774242BFEF5B3074555542AB86D43419F88D1BF4DADE3250902AA0E8FAA9F` |

These values identify the current draft signing candidate only. This Contract does not verify them or promote them to final frozen identities.

A signature does not rewrite, reinterpret, or upgrade a payload's embedded status. A payload that asserts a draft status remains a draft even if its exact bytes are signed. Therefore, the current `DRAFT ONLY` payload is not eligible to become the final Owner-approved Snapshot Binding merely by attaching a signature.

If a separately authorized process creates a reviewed final-form payload, including any required final status assertion, that work must finish before signing. It creates different payload bytes and requires a newly calculated Snapshot Reference, a new exact-byte review, and explicit Owner disposition. This Contract neither authorizes nor performs that change.

## 4. Signing Input

The sole signing input is:

`exact canonical Binding payload bytes`

The signing implementation must receive and sign the already-reviewed byte sequence as an opaque byte array. The Ed25519 operation is performed over those exact bytes. It must not sign a parsed object, a reconstructed object, a textual display, the hexadecimal SHA-256 text, or the Snapshot Reference string.

Between exact-byte review, reference calculation, Owner signing, envelope assembly, and later validation, the following are prohibited:

- JSON reserialization;
- whitespace insertion, removal, or normalization;
- field reordering;
- newline conversion, including LF/CRLF conversion;
- BOM insertion or removal;
- character-encoding conversion; and
- any other byte change.

Parsing may be used for review or validation only. Parsed content must never be reserialized and substituted for the reviewed signing input.

The exact signing-input bytes must be independently identifiable by their byte length and SHA-256 before the Owner signing action. Any mismatch requires the process to stop without requesting or producing a signature.

## 5. Private Key Boundary

The Ed25519 private key is exclusively Owner controlled.

The private key:

- remains inside the Owner-approved signing environment or signing device;
- does not enter the repository;
- does not enter the Runner;
- does not enter the Frozen Manifest;
- does not enter the Binding payload;
- does not enter the Binding envelope, approval record, evidence, log, command line, environment variable, temporary repository artifact, or generated output; and
- is never disclosed to Codex, repository automation, or a validation process.

Codex and the Runner are prohibited from generating an Owner private key. They are also prohibited from selecting a replacement signer, exporting private-key material, reconstructing a key from seed material, or treating an automatically generated key as the approved trust root.

The Owner-controlled signer may return only the signature bytes and non-secret signing metadata needed by this Contract. Public-key material may be used for validation only when it is obtained through the independently approved trust-root path and matches the approved fingerprint.

## 6. Signature Format and Record

The signature algorithm is `Ed25519`.

The signing operation uses standard Ed25519 over the exact canonical Binding payload bytes, without a caller-supplied prehash, without signing the SHA-256 digest in place of the payload, and without changing the payload.

The resulting signature record must contain or unambiguously identify:

| Field | Requirement |
|---|---|
| Signature bytes | The exact raw Ed25519 signature, exactly `64` bytes |
| Algorithm | Exactly `Ed25519` |
| Public key fingerprint | Exactly `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Fingerprint domain | SHA-256 of DER SubjectPublicKeyInfo bytes |
| Signed-byte identity | Payload byte length and SHA-256 of the exact signed bytes |

If the signature bytes are transported in the existing Binding envelope, they must be encoded as canonical RFC 4648 standard padded Base64. Base64 is a transport encoding only; the signature remains the decoded 64-byte value, and the signed input remains the exact decoded payload bytes.

No signature field, algorithm label, key identifier, or fingerprint may be taken from the untrusted payload as proof of its own authenticity. The expected algorithm, public key, and fingerprint must come from the independently approved trust-root configuration.

## 7. Snapshot Reference

The Snapshot Reference is defined as:

`sha256:<exact payload bytes hash>`

The digest is SHA-256 over the exact canonical Binding payload bytes used as the Ed25519 signing input. The `sha256:` prefix is literal, and the digest is represented by 64 uppercase hexadecimal characters.

For the current declared draft payload:

`SNAPSHOT_REFERENCE = sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151`

Signing must not change the payload. Envelope assembly must preserve the payload byte-for-byte, including by lossless Base64 encode/decode round trip where the existing interface is used.

If the payload changes by even one byte:

1. the previous Snapshot Reference no longer identifies it;
2. a new SHA-256 and Snapshot Reference must be calculated from the changed exact bytes;
3. the prior signature must not be reused;
4. the changed payload must receive a new exact-byte review; and
5. Owner signing and Final Freeze Approval must be performed for the new identities.

The old payload, reference, signature, or approval must not be edited in place or transferred to the changed payload.

## 8. Signing and Assembly Process

The controlled signing process is:

1. Select one reviewed, final-form Binding payload as an immutable byte sequence. Draft-status bytes are ineligible for finalization.
2. Record the exact payload byte length and compute its SHA-256 without parsing or reserializing it.
3. Form the Snapshot Reference as `sha256:<exact payload bytes hash>`.
4. Confirm that the payload identity, Snapshot Reference, Authority Anchor, Invocation identity, component identities, signing algorithm, and approved public key fingerprint are the exact values submitted for Owner disposition.
5. Transfer only the exact payload bytes, or a lossless transport representation of those bytes, into the Owner-controlled signing boundary.
6. The Owner-controlled signer signs the exact payload bytes with the approved Ed25519 private key and returns only the raw 64-byte signature plus permitted non-secret metadata.
7. Outside the private-key boundary, verify that the signature is 64 bytes and verifies over the exact payload bytes with the independently approved Ed25519 public key whose fingerprint matches the approved fingerprint.
8. Assemble the signature-bearing Binding envelope without changing the payload. Under the existing interface, `payload` is the canonical RFC 4648 standard padded Base64 encoding of the exact payload bytes, and `signature` is the canonical RFC 4648 standard padded Base64 encoding of the exact 64 signature bytes.
9. Decode the assembled envelope and prove byte-for-byte equality with the reviewed payload and signature inputs. Recompute the payload SHA-256 and confirm the exact Snapshot Reference.
10. Submit the exact payload identity, signature-bearing envelope identity, trust-root identity, Anchor, Invocation identity, and component identities for Owner Final Freeze Approval.
11. Classify the Binding as final and Owner-approved only after that explicit approval binds every identity required by Section 9. Until then, the result remains non-final and must produce `AUTHORITY_BLOCKED` if presented for execution.

No step may invoke the Runner, cross the Invocation Start Boundary, access the network, or modify an upstream frozen component.

## 9. Owner Final Freeze Approval

Owner Final Freeze Approval must explicitly bind all of the following as one indivisible approval set:

| Approval subject | Required bound identity |
|---|---|
| Snapshot Reference | The exact `sha256:<payload SHA-256>` value |
| Binding payload identity | Canonical payload byte length, exact payload SHA-256, canonicalization profile, record type, status, and Binding Contract ID |
| Public key fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` in the DER SubjectPublicKeyInfo SHA-256 domain |
| Authority Anchor | `001a1e495617b211e1cd1702d5895a4c31f314ea` |
| Invocation identity | Bounded Invocation ID and Invocation Identity SHA-256 `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |

The approval must additionally identify the signature algorithm, signature bytes or their unambiguous content identity, the exact signature-bearing envelope identity, and the complete set of component paths, byte lengths, and SHA-256 values asserted by the payload.

Final approval must be independently authenticated and retained outside the Binding's self-declarations. The Binding payload or envelope cannot approve itself. A valid signature proves control of the approved private key over particular bytes; it does not by itself prove final freeze approval, eligibility of a draft payload, or correctness of the component bytes.

Any missing, pending, ambiguous, mismatched, or self-supplied approval field prevents finalization and requires `AUTHORITY_BLOCKED`.

## 10. Final Binding Conditions

A Snapshot Binding is final and Owner-approved only when all of the following are true:

- the payload was eligible final-form payload bytes before signing;
- the payload bytes are unchanged from exact-byte review through validation;
- the Snapshot Reference equals the SHA-256 of those exact bytes;
- the Ed25519 signature verifies over those exact bytes;
- the verification key matches the independently approved public key and fingerprint;
- the envelope reproduces the exact payload and signature bytes after decoding;
- Owner Final Freeze Approval binds every identity in Section 9; and
- all component byte identities match the approved payload.

These conditions are conjunctive. Signing a draft payload, constructing an envelope, or labeling an artifact as final cannot bypass them.

## 11. Future Runner Validation

Before any future Invocation, the Runner or an independently authenticated pre-start authority validator must validate in this order:

1. **Public Key** — load only the independently approved Ed25519 public key; confirm the key type and DER SubjectPublicKeyInfo SHA-256 fingerprint.
2. **Signature** — decode exactly 64 signature bytes and verify the Ed25519 signature over the exact decoded payload bytes.
3. **Payload Hash** — compute SHA-256 over those same exact payload bytes and compare it with the independently approved payload identity.
4. **Snapshot Reference** — form `sha256:<exact payload bytes hash>` and compare it with the independently retained Owner-approved Snapshot Reference.
5. **Component Hashes** — validate every bound component's canonical path, exact byte length, and SHA-256, including Runner, Runner Identity, Execution Root Identity, Invocation Identity, and Frozen Input Manifest; cross-check the approved Authority Anchor and Invocation identity.

The Frozen Input Manifest must be authenticated by the Binding before declarations inside the Manifest are trusted. Component checks are not a substitute for public-key, signature, payload-hash, or approved-reference checks.

Failure, absence, ambiguity, decoding error, malformed data, mutable substitution, or mismatch at any validation step produces exactly:

`AUTHORITY_BLOCKED`

The failure must occur before Runner execution, the Invocation Start Boundary, network access, metadata retrieval, tarball retrieval, candidate creation, or any budget consumption.

## 12. State and Scope Boundary

The following state remains unchanged:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

This Contract does not change or reinterpret:

- the Verification Goal;
- Scope;
- Budget;
- Network Boundary; or
- Invocation Boundary.

It grants no new Invocation, retry, resume, reuse, second Invocation, request, tarball, or candidate budget. It does not reopen P0.S-6 or authorize P0.S-7.

## 13. Prohibited Actions

Creating or reviewing this Contract must not:

- read, import, export, copy, reconstruct, or disclose a private key;
- generate an Owner private key;
- generate a signature;
- modify the Binding payload;
- create or classify a final Snapshot Binding;
- modify or execute the Runner;
- modify the Frozen Manifest;
- modify or regenerate an Identity;
- perform Validation or Verification;
- execute Final Preflight;
- create or execute an Invocation;
- cross the Invocation Start Boundary;
- access the network or retrieve metadata or a tarball;
- create a candidate or modify a lockfile;
- invoke npm, enter Runtime, or begin P0.S-7;
- commit; or
- push.

## 14. Required Review and Final Draft State

Before this signing process is used, this exact Contract must receive Independent Review `PASS` and Architecture Owner Approval. Those approvals authorize only the process definition and do not approve payload bytes, request use of a private key, authorize a signing event, create a final Binding, or satisfy Owner Final Freeze Approval.

Any future signing event requires separate explicit Owner control over the eligible exact payload bytes and approved signing environment. Any final Snapshot Binding requires the distinct Final Freeze Approval defined in Section 9.

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`SNAPSHOT_BINDING_SIGNING_CONTRACT_STATUS = DRAFT_FOR_INDEPENDENT_REVIEW`

`SIGNING_EXECUTED = NO`

`PRIVATE_KEY_ACCESSED = NO`

`SIGNATURE_CREATED = NO`

`FINAL_OWNER_APPROVED_SNAPSHOT_BINDING_CREATED = NO`

This Contract remains a draft process definition. It performs no signing, Binding finalization, Final Preflight, Verification, Invocation, or network activity.
