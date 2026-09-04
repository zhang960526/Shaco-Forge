# P0S-6 Future Verification Planning Contract

Contract ID: `P0S6-FVPC-20260904-01`

## 1. Contract Identity

- Project: `Shaco Forge`
- Phase: `P0.S-6`
- Gate: `Future Verification Planning`
- Contract type: `Planning Contract`
- Status: `DRAFT_FOR_INDEPENDENT_REVIEW`
- Owner Approval State: `NOT_REVIEWED`
- Execution Authority State: `NO`
- Proposed contract path: `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-PLANNING-CONTRACT.md`
- Governing LICC Contract ID: `P0S6-LICC-20260904-01`
- Governing LICC status: `OWNER_APPROVED_AND_FROZEN`

This document defines the boundary for planning one future controlled Verification. It does not authorize or perform Verification, LICC execution, dependency preparation, Runtime execution, or entry into P0.S-7.

## 2. Status, Authority, and Relationship With Existing LICC

### 2.1 Current state

The P0.S-6 Dependency Readiness Recovery result remains:

- Result: `EXHAUSTED_INCONCLUSIVE`
- Failure Boundary: `NPM_CI`
- Failure: `EINTEGRITY`
- Confirmed condition: `env-paths lockfile integrity mismatch`
- Physical Attempt #1: `INCONCLUSIVE`
- Physical Attempt #2: `INCONCLUSIVE`
- Physical Attempt #3: `PROHIBITED`

The governing LICC state is:

- Contract ID: `P0S6-LICC-20260904-01`
- Status: `OWNER_APPROVED_AND_FROZEN`
- Independent Review: `PASS`
- Re-review: `PASS`
- F-01: `CLOSED`
- Owner Approval: `YES`
- Freeze: `YES`
- Execution Authority: `NO`

### 2.2 Why a new Planning Contract is required

The frozen LICC defines the corrective and verification model, protected inputs, expected candidate identity, evidence obligations, classifications, and stop conditions. Its Owner approval freezes that governance contract but does not grant execution authority.

A separate Future Verification Planning Contract is required to define and review:

- the exact authority gate for a future invocation;
- the isolated execution root and write boundary;
- the identities permitted as future inputs;
- the controlled registry and tarball verification process;
- candidate materialization rules;
- evidence finalization requirements;
- terminal result classifications; and
- the handoff boundary after a future result.

This separation prevents approval of a planning model from being interpreted as permission to execute it.

### 2.3 Relationship with `P0S6-LICC-20260904-01`

This Contract is subordinate to the frozen LICC and must preserve all LICC protection, evidence, classification, and non-authorization boundaries.

The governing LICC is referenced by:

- Path: `docs/03-v1.0-plan/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE-CONTRACT.md`
- SHA-256: `ffdc3ac247e901242c3b87e385a2399ecf5aba05074f299f64754112012f3713`
- Identity source: `docs/04-development-records/P0S-6-LICC-CORRECTIVE-REFREEZE-DECISION.md`

If this Contract conflicts with the frozen LICC, execution must be blocked and the conflict must be returned for governance review. This Planning Contract may narrow the future execution boundary but may not silently broaden the LICC.

### 2.4 Why the existing LICC cannot be executed directly

The LICC Owner Approval Decision explicitly preserves:

`P0S6_LICC_EXECUTION_AUTHORITY = NO`

The frozen LICC therefore cannot be executed solely because it passed review and received Owner approval. A future execution additionally requires an independently reviewed and Owner-frozen execution identity, exact execution root, exact input manifest, exact executor identity, and explicit execution authorization.

No draft, review pass, freeze state, planning statement, or inferred intent may substitute for that authorization.

## 3. Scope and Non-goals

### 3.1 Scope

This Contract defines the planning boundary for one future controlled Verification invocation that may:

1. validate the frozen authority and input identities;
2. retrieve metadata from the explicitly frozen official npm registry endpoint;
3. preserve and validate the exact metadata response bytes;
4. retrieve the tarball URL supplied by validated metadata;
5. preserve and verify the exact tarball bytes;
6. validate integrity, shasum, package identity, and archive safety;
7. derive one corrected lockfile candidate under the isolated execution root;
8. compare the candidate against the protected source at byte and semantic levels;
9. record all required evidence; and
10. issue exactly one terminal classification.

These actions describe a possible future invocation. They are not authorized by this draft.

### 3.2 Non-goals

This Contract does not:

- execute Verification or the LICC;
- repair, overwrite, replace, rename, or delete any source lockfile;
- declare a candidate to be an official corrected lockfile;
- run `npm`, `npm ci`, dependency preparation, build, test, Electron, or Runtime;
- consume or restore a DRRC physical-attempt budget;
- authorize Global Physical Attempt #3;
- establish dependency readiness;
- establish Runtime readiness;
- authorize deployment, commit, push, or repository integration; or
- authorize entry into P0.S-7.

## 4. Execution Authority Gate

### 4.1 Mandatory future authorization

Before any future Verification begins, all of the following must exist and match exactly:

1. Independent Review result for this Contract: `PASS`.
2. All review findings: `CLOSED`.
3. Owner approval for the final Contract bytes: `YES`.
4. Contract freeze state: `YES`.
5. A separate explicit execution authorization record.
6. A frozen execution branch and exact Authority HEAD.
7. A frozen Contract path, byte length, and SHA-256.
8. A frozen Owner authorization record path, byte length, and SHA-256.
9. A frozen executor or runner path, byte length, and SHA-256.
10. A frozen invocation form and permitted arguments.
11. A frozen input manifest covering every permitted input.
12. A frozen canonical execution-root identity.
13. A frozen outbound network target and artifact identity.
14. A single-use invocation identifier and invocation budget.
15. A clean and acceptable repository state as defined by the future authorization record.

Any missing, ambiguous, stale, or mismatched field produces `AUTHORITY_BLOCKED` before network access or candidate creation.

### 4.2 No automatic promotion

The following states do not grant execution authority:

- `DRAFT`
- `DRAFT_FOR_INDEPENDENT_REVIEW`
- `REVIEW_PASS`
- `OWNER_APPROVED`
- `FROZEN`
- a previously approved LICC
- a proposed execution-root path
- an available runner
- an available network connection

Execution may begin only when a separate Owner authorization record explicitly sets:

`P0S6_FUTURE_VERIFICATION_EXECUTION_AUTHORITY = YES`

This draft does not set that value.

### 4.3 Single-use authority

Future authority applies only to the frozen invocation identity and execution root. It expires when:

- the invocation starts;
- any authority or identity Gate fails;
- the invocation reaches a terminal classification; or
- the frozen environment or repository identity changes.

Authority must not be reused for retry, repair, continuation, or a second invocation.

## 5. Isolated Execution Root

### 5.1 Root identity

The future execution must use one dedicated directory whose canonical absolute path is frozen in the separate execution authorization record.

Before execution:

- the intended path must resolve under the LICC-approved parent boundary;
- the exact canonical path must match the authorization record;
- the path must not alias a source, evidence, cache, quarantine, or historical-artifact directory;
- reparse points, symlinks, junctions, and path traversal must not redirect writes outside the authorized boundary; and
- the root must be created exclusively for the authorized invocation.

A pre-existing, ambiguous, redirected, or mismatched root produces `AUTHORITY_BLOCKED` or `INPUT_MISMATCH`, according to whether the failure concerns authority or identity.

### 5.2 Write boundary

All future writes must remain inside the isolated execution root, including:

- raw metadata evidence;
- raw tarball evidence;
- request and response records;
- hashes;
- archive inspection records;
- verification ledger;
- candidate output;
- byte and semantic diff records;
- classification; and
- final summary.

The future invocation must not write to:

- the project source tree outside the authorized root;
- the source lockfile;
- the DRRC frozen copy;
- historical evidence;
- frozen Contract artifacts;
- dependency directories;
- shared caches;
- quarantine directories; or
- previous execution roots.

### 5.3 Failure residue

A partially created output is not a valid candidate and must never be promoted, reused, or treated as input. If evidence policy requires preservation of failure residue, it must remain inside the same execution root, be labelled `PARTIAL_INVALID`, and be included in the terminal evidence manifest.

No automatic cleanup, repair, overwrite, or retry is permitted.

## 6. Frozen Input Identity

### 6.1 Permitted input classes

A future Verification may read only the following frozen input classes:

| Input class | Permitted purpose | Required identity |
|---|---|---|
| Source lockfile | Protected source comparison | Canonical path, byte length, SHA-256 |
| DRRC frozen lockfile copy | Historical protected comparison | Canonical path, byte length, SHA-256 |
| Ten frozen DRRC Evidence files | Provenance and historical comparison | Individual canonical path, byte length, SHA-256 |
| Frozen LICC | Governing corrective rules | Canonical path, byte length, SHA-256 |
| LICC Owner Approval Decision | Approval-boundary evidence | Canonical path, byte length, SHA-256 |
| Frozen Future Verification Contract | Execution planning authority | Canonical path, byte length, SHA-256 |
| Future execution authorization record | Invocation authority | Canonical path, byte length, SHA-256 |
| Frozen executor or runner | Authorized mechanism | Canonical path, byte length, SHA-256 |
| Frozen invocation manifest | Exact invocation parameters | Canonical path, byte length, SHA-256 |

The source lockfile, DRRC copy, and ten historical Evidence identities must be resolved from the corrected frozen identity declarations in LICC Sections 5.4, 8.7, 13, and 18.10.

### 6.2 Byte identity requirement

Before any network request or output creation, the future invocation must:

1. resolve each permitted path canonically;
2. reject aliases, unexpected links, or duplicate physical identities;
3. read the exact bytes without normalization;
4. record byte length;
5. calculate SHA-256;
6. compare every result with the frozen input manifest; and
7. record the Gate result before continuing.

Line-ending conversion, JSON reserialization, encoding conversion, timestamp substitution, and path substitution are prohibited when determining identity.

### 6.3 Prohibited inputs

The future invocation must not use:

- npm or package-manager caches;
- shared download caches;
- temporary download remnants;
- partial outputs;
- quarantine contents;
- previous candidate files;
- unlisted historical artifacts;
- an unfrozen Contract revision;
- an unfrozen runner;
- an unfrozen authorization record; or
- any file absent from the frozen input manifest.

Historical Evidence may be read for provenance only. A tarball, metadata response, cache object, or package content found in historical Evidence cannot serve as official verification input.

## 7. Verification Model

### 7.1 Registry Metadata Verification Model

A future authorized invocation may perform one controlled metadata retrieval only after all authority and local-input Gates pass.

The metadata model must satisfy these requirements:

1. The exact HTTPS metadata URL and permitted host must be frozen in the execution authorization record.
2. The host must be the trusted official npm registry source specified by the governing LICC.
3. Unfrozen mirrors, proxies, alternate registries, cache endpoints, local registries, and substituted hosts are prohibited.
4. Redirects are prohibited unless their complete behavior and final identity were explicitly frozen.
5. The exact response body bytes must be preserved before parsing or normalization.
6. Relevant response status and headers must be recorded.
7. The raw response body must receive a byte-length and SHA-256 record.
8. Parsed metadata must match the frozen package name and exact version.
9. Required `dist.tarball`, `dist.integrity`, and `dist.shasum` fields must exist and be structurally valid.
10. The metadata tarball URL must match the frozen registry and package identity requirements.
11. No value may be silently inferred, repaired, normalized, or replaced.
12. Any validation failure must fail closed before tarball retrieval or candidate creation.

A transport failure without contradictory bytes is `INCONCLUSIVE`. A response from an unauthorized source, an identity mismatch, or contradictory metadata is `INPUT_MISMATCH`.

### 7.2 Tarball Verification Model

Tarball retrieval may begin only after metadata validation succeeds.

The tarball model must satisfy these requirements:

1. The requested tarball URL must come directly from the validated raw metadata.
2. The URL must equal the frozen expected tarball identity.
3. The exact downloaded bytes must be preserved without transformation.
4. Byte length and cryptographic hashes must be recorded.
5. The computed integrity value must match `dist.integrity`.
6. The computed shasum must match `dist.shasum`.
7. Both values must match the identities frozen by the governing LICC.
8. Package name and version inside the archive must match the frozen target.
9. Hash, integrity, shasum, and package-identity checks must all pass independently.
10. A single successful check cannot compensate for another failed or missing check.

Archive safety validation must reject:

- absolute paths;
- parent-directory traversal;
- paths escaping the package root;
- unsafe or ambiguous path separators;
- duplicate entries with conflicting identities;
- device or special-file entries;
- links that escape the archive root;
- malformed headers;
- unsupported structures that prevent deterministic inspection; and
- archive contents inconsistent with the expected package identity.

Archive inspection must occur inside the isolated boundary or through non-materializing inspection. Archive contents must not be extracted into the project, dependency tree, shared cache, or historical Evidence.

### 7.3 Corrected Lockfile Candidate Materialization

Candidate materialization is permitted only during a separately authorized future invocation and only after all authority, input, metadata, tarball, hash, package-identity, and archive-safety Gates pass.

The candidate must be derived according to the exact replacement and byte-preservation rules frozen in LICC Sections 6 and 12.

The process must:

1. derive the candidate from the frozen source lockfile bytes;
2. modify only the fields and exact values authorized by the LICC;
3. preserve all unrelated bytes and semantic values;
4. write only to the authorized execution root;
5. use exclusive creation;
6. refuse overwrite, append, rename-over-existing, or in-place replacement;
7. compare source and candidate at byte level;
8. compare parsed source and candidate at semantic level;
9. prove that no unauthorized semantic field changed;
10. record candidate byte length, SHA-256, and SHA-512;
11. compare the candidate hashes with the LICC-frozen expected identities; and
12. record the complete derivation and comparison result.

The byte diff must identify every changed byte range. The semantic diff must show only the exact authorized lockfile correction. Any additional, missing, reordered, normalized, or unexplained change produces `INPUT_MISMATCH`.

The candidate remains an execution output:

`candidate ≠ official input`

A `PASS` candidate does not automatically replace the source lockfile, become the frozen corrected lockfile, or authorize dependency preparation.

## 8. Evidence Model

### 8.1 Required evidence

A future invocation must produce, at minimum:

- authority preflight record;
- canonical execution-root identity;
- frozen input manifest and input Gate results;
- exact invocation identity;
- request ledger;
- raw registry metadata response bytes;
- metadata response status and relevant headers;
- metadata byte length and SHA-256;
- parsed metadata validation record;
- raw tarball bytes;
- tarball byte length and required hashes;
- integrity and shasum comparison record;
- archive entry manifest;
- archive-safety result;
- package name and version validation;
- candidate materialization record, if reached;
- candidate byte and semantic diff records, if reached;
- candidate identity record, if reached;
- ordered verification ledger;
- terminal classification record;
- evidence-file manifest containing path, byte length, and SHA-256; and
- final summary.

### 8.2 Evidence integrity

Each evidence file must:

- be created inside the authorized execution root;
- have one defined producer and lifecycle state;
- be written without using a prior run as input;
- receive a byte-length and SHA-256 identity;
- be included in the final evidence manifest; and
- remain distinguishable as raw, derived, partial, or final evidence.

Raw network bytes must be preserved separately from parsed or normalized representations.

The verification ledger must record ordered Gate decisions, inputs, outputs, timestamps, classifications, and reasons. It must not claim completion for a Gate that was not reached.

### 8.3 Finalization order

The future invocation must finalize evidence in this order:

1. stop all verification and materialization activity;
2. record the terminal Gate outcome;
3. finalize the ordered ledger;
4. finalize individual evidence identities;
5. create the evidence manifest;
6. create the classification record; and
7. create the final summary last.

`PASS` is prohibited if any mandatory evidence is missing, unreadable, internally inconsistent, unhashed, or written outside the authorized root.

An evidence finalization failure produces `INCONCLUSIVE`, even if preceding artifact checks appeared successful.

## 9. Result Classification

Exactly one terminal classification must be issued.

### 9.1 `PASS`

`PASS` requires all of the following:

- authority Gate passed;
- execution-root Gate passed;
- all frozen local-input identities matched;
- trusted metadata retrieval and validation passed;
- tarball retrieval and exact-byte preservation passed;
- integrity and shasum checks passed;
- hash and package-identity checks passed;
- archive-safety validation passed;
- candidate materialization completed exclusively;
- byte diff contained only authorized changes;
- semantic diff contained only authorized changes;
- candidate identities matched the LICC-frozen expected identities;
- all protected inputs remained unchanged; and
- all mandatory evidence was finalized successfully.

`PASS` establishes only that the future Verification completed under this Contract and produced a qualifying candidate. It does not establish dependency readiness or Runtime readiness.

### 9.2 `INCONCLUSIVE`

`INCONCLUSIVE` applies when a reliable PASS or mismatch conclusion cannot be completed, including:

- transport interruption without contradictory artifact evidence;
- unavailable trusted registry endpoint;
- incomplete response;
- storage or evidence-finalization failure;
- unsupported but non-contradictory archive inspection condition;
- environmental interruption after authority passed; or
- partial output that cannot qualify as a candidate.

No partial result may be promoted to `PASS`.

### 9.3 `INPUT_MISMATCH`

`INPUT_MISMATCH` applies when an observed identity contradicts a frozen identity, including:

- source lockfile mismatch;
- DRRC frozen copy mismatch;
- historical Evidence mismatch;
- Contract or runner byte mismatch;
- unauthorized network source;
- metadata package or version mismatch;
- tarball URL mismatch;
- integrity, shasum, or hash mismatch;
- archive identity or safety mismatch;
- unexpected candidate bytes;
- unauthorized semantic changes; or
- modification of a protected input.

### 9.4 `AUTHORITY_BLOCKED`

`AUTHORITY_BLOCKED` applies before execution when:

- Owner approval is missing;
- the Contract is not frozen;
- explicit execution authority is absent;
- the Authority HEAD is missing or mismatched;
- the execution-root identity is missing or invalid;
- the runner or invocation identity is not frozen;
- an authority record is incomplete or stale; or
- the permitted execution budget is absent or already consumed.

`AUTHORITY_BLOCKED` must cause zero network requests and zero candidate creation.

### 9.5 Classification consequences

No classification may:

- trigger an automatic retry;
- create a replacement execution root;
- restore or consume DRRC physical-attempt budget;
- authorize Global Physical Attempt #3;
- run dependency preparation;
- run Runtime;
- modify the source lockfile;
- begin P0.S-7; or
- infer a new authorization.

Any retry or follow-up requires a new governance decision and a newly frozen invocation identity.

## 10. Stop Conditions

The future invocation must stop immediately when any of the following occurs:

1. Owner approval, freeze, or execution authority is missing.
2. Authority HEAD, Contract, authorization record, runner, or invocation identity mismatches.
3. The execution root is pre-existing, redirected, aliased, or outside its frozen boundary.
4. Any permitted local input has an unexpected canonical path, byte length, or SHA-256.
5. An unfrozen input, cache, partial output, or quarantine artifact would be required.
6. The network request targets an unfrozen source.
7. A redirect or final network source does not match the frozen source model.
8. Raw metadata bytes cannot be preserved.
9. Metadata package name, version, tarball URL, integrity, or shasum is missing or mismatched.
10. Raw tarball bytes cannot be preserved.
11. Tarball integrity, shasum, or cryptographic hash mismatches.
12. Archive structure, path safety, entry identity, or package identity mismatches.
13. Candidate exclusive creation cannot be guaranteed.
14. Candidate byte diff exceeds the authorized correction.
15. Candidate semantic diff exceeds the authorized correction.
16. Candidate hash differs from the LICC-frozen expected identity.
17. A protected source, Contract, or historical Evidence artifact changes.
18. Mandatory evidence cannot be written, hashed, finalized, or reconciled.
19. The single-use invocation authority has already been consumed.
20. Any unclassified ambiguity would require assumption, repair, normalization, or retry.

After a stop condition, only evidence finalization and terminal classification may continue. No corrective action, second request, alternate source, retry, overwrite, or Runtime step is permitted.

## 11. Handoff Boundary

A future `PASS` may hand off only:

- the isolated execution-root identity;
- the complete Evidence identity;
- the verified candidate path and hashes;
- the byte and semantic diff records; and
- the terminal classification and final summary.

A future `PASS` does not automatically mean:

- the candidate is the official corrected lockfile;
- the candidate may replace or modify the source lockfile;
- `P0S6_CORRECTED_LOCKFILE_FROZEN = YES`;
- Dependency Preparation is authorized or has passed;
- dependency readiness has been restored;
- Recovery Runtime is authorized or has passed;
- Global Physical Attempt #3 is authorized; or
- P0.S-7 may begin.

Any promotion of the candidate requires a separate Owner decision that freezes its canonical path, byte length, SHA-256, SHA-512, and supporting PASS Evidence identity.

Any Dependency Preparation or Runtime activity requires a separate, independently reviewed, Owner-approved, and frozen Contract with explicit execution authority.

## 12. Owner Review Fields

- Contract ID: `P0S6-FVPC-20260904-01`
- Planning Status: `DRAFT_FOR_INDEPENDENT_REVIEW`
- Independent Review: `PENDING`
- Re-review: `NOT_STARTED`
- Open Findings: `UNDETERMINED`
- Owner Approval State: `NO`
- Contract Frozen State: `NO`
- Frozen Contract SHA-256: `NOT_ASSIGNED`
- Frozen Authority HEAD: `NOT_ASSIGNED`
- Frozen execution-root identity: `NOT_ASSIGNED`
- Frozen runner identity: `NOT_ASSIGNED`
- Frozen invocation identity: `NOT_ASSIGNED`
- Future execution budget: `NOT_AUTHORIZED`
- Dependency Preparation Authority: `NO`
- Recovery Runtime Authority: `NO`
- Global Physical Attempt #3 Authority: `NO`
- P0.S-7 Gate: `CLOSED`

Owner review of this draft may approve further planning or request corrections. Review, approval, or freeze does not grant execution authority unless a separate execution authorization record explicitly grants it.

`P0S6_FUTURE_VERIFICATION_EXECUTION_AUTHORITY = NO`

`P0S6_FUTURE_VERIFICATION_EXECUTED = NO`

`P0S7_ALLOWED = NO`
