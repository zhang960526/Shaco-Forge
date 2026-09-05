# P0.S-6 Technical Validation Extension Owner Snapshot Binding Signing Execution Record

## 1. Record Identity

| Field | Value |
|---|---|
| Record ID | `P0S6-TVEC-SNAPSHOT-BINDING-SIGNING-EXECUTION-20260905-01` |
| Document Type | `SNAPSHOT_BINDING_SIGNING_EXECUTION_RECORD` |
| Status | `SIGNING_BOUNDARY_RECORDED` |
| Signing Execution | `NOT_PERFORMED` |
| Signature | `NOT_CREATED` |

This record identifies the proposed Owner signing input and records the signing execution boundary. It does not perform an Ed25519 signing operation, access a private key, create signature bytes, modify the payload, or create a final Snapshot Binding.

The word "Execution" in this record's title identifies the controlled signing stage. It does not mean that signing, Runner execution, technical Verification, Final Preflight, or an Invocation occurred.

## 2. Governing Process

| Field | Value |
|---|---|
| Signing Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-SIGNING-20260905-01` |
| Signing Contract Path | `docs/03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-SIGNING-CONTRACT.md` |
| Signing Contract SHA-256 | `14AB3F4FD5A11F4D77010749CB7906CAB8F71C4DF616BB4FBCA4E3216B55C161` |
| Process Owner Approval ID | `P0S6-TVEC-SNAPSHOT-BINDING-SIGNING-OA-20260905-01` |
| Process Owner Approval Path | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-SIGNING-OWNER-APPROVAL-DECISION.md` |
| Process Owner Approval SHA-256 | `17FFE2B7F8A4852326F196ABDBDA06D206E3F601229A677E6AF3AA0F0ED80CD7` |

The governing approval authorizes and freezes the signing process definition only. It does not approve the current payload as final-form signing input, authorize access to the Owner private key, authorize this record to request a signature, or constitute Final Freeze Approval of a Snapshot Binding.

## 3. Signing Input Identity

| Field | Recorded value |
|---|---|
| Input role | `SNAPSHOT_BINDING_PAYLOAD` |
| Input state | `CREATED` |
| Repository-relative path | `docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.payload.json` |
| Payload bytes | `2230` |
| Payload SHA-256 | `7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| Payload Reference | `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| Signing-input domain | `EXACT_CANONICAL_BINDING_PAYLOAD_BYTES` |

The byte length and SHA-256 above identify the existing payload file's exact bytes. They do not identify a reserialized JSON object, a displayed text representation, the hexadecimal digest text, or the Snapshot Reference string as the signing input.

If a future separately authorized signing action occurs, the signer must receive the exact 2230-byte sequence identified above only if those exact bytes have first been confirmed eligible for that action. This record makes no such eligibility or final-approval determination.

No JSON reserialization, whitespace change, field reordering, newline conversion, BOM change, character-encoding conversion, or other byte transformation is permitted. Any payload byte change creates a different signing input and requires a newly calculated byte length, SHA-256, Snapshot Reference, review, and applicable Owner disposition. This record must not be rewritten to transfer the recorded identity to changed bytes.

## 4. Signature Parameters and Status

| Field | Recorded value |
|---|---|
| Algorithm | `Ed25519` |
| Trust Root | `Ed25519` |
| Public Key Fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Fingerprint domain | `DER SubjectPublicKeyInfo SHA-256` |
| Signature Status | `NOT_CREATED` |
| Signature bytes | `NOT_CREATED` |
| Signing operation | `NOT_PERFORMED` |

`SIGNATURE = NOT_CREATED`

No signature value, signature encoding, signing timestamp, signing-device result, or claim of successful signature verification exists in this record. The algorithm and public key fingerprint are boundary parameters only; recording them does not prove possession or use of the corresponding private key.

This record does not convert the payload into a signed payload, signature-bearing envelope, final Binding, or Owner-approved immutable Snapshot Reference.

## 5. Private Key Boundary

| Field | Recorded boundary |
|---|---|
| Private Key control | `OWNER_CONTROLLED` |
| Private Key storage | `OWNER-CONTROLLED SECURE STORAGE` |
| Private Key access | `NOT_PERFORMED` |
| Private Key recorded | `NO` |
| Private Key path recorded | `NO` |
| Private Key bytes recorded | `NO` |

The private key remains exclusively within Owner-controlled secure storage.

This record does not contain and must not be extended to contain:

- the private key;
- a private key path;
- private key bytes;
- private key seed material;
- a private key export, encoding, identifier that discloses its location, or recovery material; or
- any command, environment variable, log, or procedure that reads or exposes the private key.

No private key was generated, read, imported, exported, copied, reconstructed, or supplied to Codex, the Runner, repository automation, or any other process while creating this record.

## 6. Boundary Result

| Boundary item | Result |
|---|---|
| Signing input identity recorded | `YES` |
| Payload byte length recorded | `YES` |
| Payload SHA-256 recorded | `YES` |
| Ed25519 algorithm recorded | `YES` |
| Public key fingerprint recorded | `YES` |
| Owner-controlled private key boundary recorded | `YES` |
| Private key accessed | `NO` |
| Signature generated | `NO` |
| Payload modified | `NO` |
| Binding modified or created | `NO` |
| Runner executed | `NO` |

The sole result is a record of the signing execution boundary. No cryptographic signing result is asserted.

Any future signing execution requires separate explicit authorization and Owner-controlled handling of an eligible exact payload. Any signature produced by such a future action must be recorded in a distinct record or controlled artifact and must satisfy the governing Contract. This record cannot be updated in place to represent that future action.

## 7. State and Scope Boundary

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

This record does not change the Verification Goal, Scope, Budget, Network Boundary, or Invocation Boundary. It grants no Invocation, request, metadata, tarball, candidate, retry, resume, reuse, or second-Invocation budget.

No current execution authority is expanded, consumed, or transferred by recording the signing boundary.

## 8. Prohibited and Not Executed

While creating this record, do not and did not:

- generate a private key;
- read, import, export, copy, reconstruct, or disclose a private key;
- generate a signature;
- modify the Binding payload;
- modify or create a Snapshot Binding;
- modify or execute the Runner;
- modify the Frozen Manifest;
- modify or regenerate an Identity;
- perform Verification or Final Preflight;
- create or execute an Invocation;
- cross the Invocation Start Boundary;
- access the network;
- retrieve metadata or a tarball;
- create a candidate or modify a lockfile;
- invoke npm, enter Runtime, or begin P0.S-7;
- commit; or
- push.

## 9. Final Record State

`SIGNING_EXECUTION_RECORD_STATUS = SIGNING_BOUNDARY_RECORDED`

`SIGNING_INPUT_IDENTITY_RECORDED = YES`

`PRIVATE_KEY_STORAGE = OWNER_CONTROLLED_SECURE_STORAGE`

`PRIVATE_KEY_ACCESSED = NO`

`SIGNATURE = NOT_CREATED`

`BINDING_CREATED = NO`

`RUNNER_EXECUTED = NO`

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

This record remains a non-signing boundary record. It records no private key material and performs no signature generation, Binding creation, Runner execution, Verification, Invocation, network activity, commit, or push.
