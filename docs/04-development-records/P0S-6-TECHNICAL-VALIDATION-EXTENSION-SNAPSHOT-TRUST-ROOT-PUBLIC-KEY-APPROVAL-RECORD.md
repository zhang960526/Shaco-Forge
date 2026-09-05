# P0.S-6 Technical Validation Extension Snapshot Trust Root Public Key Approval Record

## 1. Record Identity

| Field | Value |
|---|---|
| Record ID | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-PUBLIC-KEY-OA-20260905-01` |
| Document Type | `TRUST_ROOT_PUBLIC_KEY_APPROVAL_RECORD` |
| Status | `OWNER_APPROVED_AND_FROZEN` |

This record registers and freezes the identity of the Owner-approved Ed25519 public key for the Snapshot Trust Root. It does not generate a key, configure the Runner, create a signature or Binding, or execute Runner Freeze or Final Snapshot Freeze.

## 2. Parent Governance

| Field | Value |
|---|---|
| Parent Trust Root Decision | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-SELECTION-20260905-01` |
| Parent Decision Path | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-SELECTION-DECISION.md` |
| Parent Decision SHA-256 | `BF7C1395C9D1EE021539F46D9D1A5EEECEB338A60A328CCEB273848409C5303B` |
| Parent Owner Approval | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-OA-20260905-01` |
| Parent Owner Approval Path | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-OWNER-APPROVAL-DECISION.md` |
| Parent Owner Approval SHA-256 | `E0C0818D702B594C3C2E854608C27A94C62ACB450E5669124A6F60CC55659560` |
| Approved Reference Mechanism | `GOVERNANCE_RECORD_HASH` |

The Parent Decision and Parent Owner Approval hashes were checked and match these values. Both records remain unchanged. The approved model remains Owner-approved Ed25519 Public Key, Signed Snapshot Binding, and Independently Pinned Snapshot Reference.

## 3. Owner Approval Source

`PUBLIC_KEY_OWNER_APPROVAL = YES`

`DECISION = APPROVED_SNAPSHOT_TRUST_ROOT_PUBLIC_KEY_IDENTITY`

The Architecture Owner explicitly designated the public key file as Owner-approved in the instruction continuing this record-creation task, then confirmed its location and requested that reading be retried. The successful read used the following public file only:

`D:/Secure/ShacoForge/ed25519_public_key.pem`

This explicit Owner designation is the approval source for the exact public key bytes and DER identity recorded below. The filename, file location, PEM self-description, or a signature from an otherwise unapproved key does not establish approval by itself.

The source path is provenance, not an immutable trust reference or a future dynamic key source. A later change to that file cannot change the public key approved by this record. No concrete key identity is inferred from the Parent's model approval alone.

## 4. Public Key Identity

| Field | Approved value |
|---|---|
| Public Key Type / Algorithm | `Ed25519` |
| Public Key Format | `PEM SubjectPublicKeyInfo` |
| Algorithm Object Identifier | `1.3.101.112` |
| AlgorithmIdentifier parameters | Absent |
| Raw public key length | `32 bytes` |
| DER SubjectPublicKeyInfo length | `44 bytes` |
| Fingerprint domain | `DER SubjectPublicKeyInfo SHA-256` |
| Public Key SHA-256 fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Source PEM exact length | `113 bytes` |
| Source PEM SHA-256 | `6588645704F0DE9E8CCCDAA0A7361DE2BE39D70782DE8AD84E7129DE20AB16A7` |
| Source PEM encoding | ASCII, UTF-8 compatible, without BOM |
| Source PEM line endings | LF, including one final LF after the END line |

The exact approved PEM is:

```pem
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEALN26KG2VWx5YM9MXwGTf2wgAdfMKrjPid6481q+goNg=
-----END PUBLIC KEY-----
```

The PEM byte count and PEM SHA-256 cover the three PEM lines above with their LF terminators, excluding the Markdown fence. The fingerprint covers the decoded DER SubjectPublicKeyInfo bytes, including the AlgorithmIdentifier and public-key BIT STRING. It does not cover PEM text, the raw 32-byte key alone, or this approval record.

The source contains one PUBLIC KEY PEM block with canonical Base64. A static structural check confirmed the DER Ed25519 AlgorithmIdentifier with absent parameters, a BIT STRING with zero unused bits, and the 32-byte public key. SHA-256 was computed separately over the original PEM bytes and the decoded DER bytes.

These operations are public-key format and identity checks only. No signature was created or tested, no proof of private-key possession was performed, and no Runner, Final Preflight, or Technical Validation Extension Verification was executed.

## 5. Key Ownership Boundary

| Field | Recorded Owner statement |
|---|---|
| Corresponding private key control | Owner controls the corresponding private key |
| Private key custody | `Owner-controlled secure storage` |
| Storage existence | Owner-controlled secure storage exists |
| Attestation source | Owner instruction; not independently inspected or verified |

Only the public key was accessed in the secure location. No private key was read, opened, imported, generated, exported, copied, or used for signing. No private-key contents or local private-key path are recorded here.

The private key must not be written into this record or any other task-created file, enter the repository, or be placed in the Runner, Manifest, Binding, or Execution Identities. This record contains no private-key material.

## 6. Approval Boundary

This record approves the exact Public Key Identity, its DER fingerprint, and the observed PEM identity. It does not perform or approve completion of Runner configuration, Runner Freeze, Snapshot Binding creation, signature creation, or Final Snapshot Freeze.

Public-key registration resolves the missing supplied key identity prospectively. It does not configure `SNAPSHOT_OWNER_PUBLIC_KEY_PEM`, align the Runner's Anchor, complete authenticated approval inputs, or regenerate stale identities. Those remain work for a separately authorized corrective task under the approved Freeze Plan.

This public-key record is not an Owner Final Freeze Approval for a Snapshot. The independently pinned exact Snapshot Reference, complete frozen component set, Binding signature, and selected final approval identity remain required. Registration does not convert earlier blocked freeze results into PASS.

Changing the approved key requires a new explicit Owner approval and controlled regeneration of the affected Runner and downstream Snapshot identities. Updating a filename or self-declared hash cannot transfer this key's approval to a different key.

## 7. Future Validation Rule

Future Runner validation must:

1. Load the fixed Owner-approved Ed25519 public key identified by the DER fingerprint in this record, pinned before final Runner hashing.
2. Verify the Snapshot Binding signature over the exact Binding payload bytes with that key.
3. Verify the separately typed Owner Freeze Approval, including its signature and match to the independently retained selected approval identity.
4. Verify the exact approved Snapshot Reference by comparing it with SHA-256 of the original Binding payload bytes.

Binding must not supply a replacement key. Manifest must not supply the trust key. argv and environment must not override it. Missing, invalid, unapproved, or substituted key identity must fail closed as `AUTHORITY_BLOCKED`.

The existing conjunctive checks for the fixed Authority Anchor ancestry and actual Runner, Identity, and Manifest hashes remain mandatory. Signature validity alone does not select the permitted Snapshot. The independent pre-start authority check must authenticate the Runner before relying on its own validation code.

The approved Anchor remains `001a1e495617b211e1cd1702d5895a4c31f314ea`. Current HEAD, mutable branch or tag names, and Manifest self-declaration cannot select a replacement Anchor, key, or Snapshot Reference. The later Binding or approval digest must not be backfilled into upstream frozen components.

## 8. Scope Boundary

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

Verification Goal, Scope, Budget, Network Boundary, and Invocation Boundary remain unchanged. This registration grants no new Invocation, metadata request, tarball request, candidate, retry, resume, or reuse allowance. It does not reopen P0.S-6 or authorize P0.S-7.

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

## 9. Not Executed

Creating this record does not generate a key or signature; read a private key; modify the Runner, Manifest, or any Execution Identity; create a Snapshot Binding, Snapshot Reference, tag, or ref; or execute Runner Freeze or Final Snapshot Freeze.

No Runner execution, Final Preflight, Verification, Invocation creation or start, network access, metadata retrieval, tarball retrieval, candidate creation, lockfile modification, npm, Runtime, P0.S-7, commit, or push is performed.

The Public Key Identity is Owner-approved and frozen by this record. Execution artifacts and their pending freeze requirements remain unchanged.
