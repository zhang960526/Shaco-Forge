# P0.S-6 Technical Validation Extension Contract

## 1. Contract Identity

| Field | Value |
|---|---|
| Contract ID | `P0S6-TVEC-20260904-01` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |
| Document Type | `TECHNICAL_VALIDATION_EXTENSION_CONTRACT` |

`P0S6_TECHNICAL_VALIDATION_EXTENSION_CONTRACT_ID = P0S6-TVEC-20260904-01`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_CONTRACT_STATUS = DRAFT_FOR_INDEPENDENT_REVIEW`

This is a new bounded Technical Validation Extension Contract. It defines a possible future execution model only. It does not execute Verification and does not create Execution Authority.

## 2. Parent Context

| Field | Value |
|---|---|
| Parent Closure | `P0.S-6 Final Closure` |
| Previous Final Classification | `AUTHORITY_BLOCKED` |
| Related Decision | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-DECISION.md` |

This Contract exists after P0.S-6 governance closure. It does not reopen the original P0.S-6.

## 3. Extension Goal

The sole goal is to validate the `env-paths@2.2.1` integrity mismatch through:

1. Official npm registry metadata identity verification;
2. Official tarball byte identity verification;
3. Integrity comparison; and
4. Corrected lockfile candidate derivation.

No other technical or runtime claim is in scope.

## 4. Scope

### 4.1 Included

- frozen input identity verification
- registry metadata acquisition
- metadata integrity extraction
- tarball acquisition from validated metadata
- tarball hash verification
- lockfile candidate derivation
- byte-level comparison
- evidence generation

### 4.2 Excluded

- `npm ci` retry
- Dependency Preparation
- `node_modules` modification
- Runtime
- Electron launch
- Client Module Runtime
- Plugin Runtime
- P0.S-7
- P0.S-8
- production implementation

## 5. Governance Boundary

This Contract:

- does not reopen P0.S-6;
- does not reuse the previous Invocation;
- does not reuse the previous Execution Authority; and
- does not reuse the previous budget.

Before any execution, the following must be established as new governance artifacts or decisions for this Extension:

1. Independent Review;
2. Owner Approval;
3. Execution Authorization; and
4. New Invocation.

This draft satisfies none of those execution prerequisites.

## 6. Frozen Inputs

Every input must exist at future preflight and must match its frozen path, byte length, and SHA-256. If any input does not exist or does not match, execution must stop before network access or candidate creation.

### 6.1 Closure and Decision Records

| Input | Path | Bytes | SHA-256 |
|---|---|---:|---|
| P0.S-6 Final Closure | `docs/04-development-records/P0S-6-FINAL-CLOSURE-DECISION.md` | `2239` | `775594e69d54abd21b325ec3ec7d6817bccbf47517c1f5bf4871cc06f4f32c5b` |
| P0.S-6 Post-Closure Reconciliation | `docs/04-development-records/P0S-6-POST-CLOSURE-RECONCILIATION-DECISION.md` | `2822` | `163b4cfdffb2eef4f49f0cd5dd07f567a587db39b7705492e1f49680ef0080cc` |
| Technical Validation Extension Decision | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-DECISION.md` | `1883` | `b170c3e52bc8375f49e97d3b64ab32fed32b8c9ae0eea14d2aa3e5d43db08d98` |

### 6.2 Source and DRRC Lockfiles

| Input | Path | Bytes | SHA-256 |
|---|---|---:|---|
| Source lockfile | `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json` | `30829` | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |
| DRRC frozen lockfile copy | `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json` | `30829` | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |

The two frozen lockfiles must remain byte-identical. Both are protected inputs and neither may be a candidate output path.

### 6.3 DRRC Evidence Identities

Evidence root:

`docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/evidence/aa96b746-eeca-4a65-a846-ecf5c753e6ab`

| Evidence path relative to Evidence root | Bytes | SHA-256 |
|---|---:|---|
| `classification.json` | `303` | `21757cd251e91d674dbb3287e1f21957ce2a135e49732e9d87c49369d69a58a2` |
| `effective-config.json` | `4221` | `199d283e6e78cbf9b23107f744ad48c2233d6fc4cdb14ef8ab8050db63b50c01` |
| `invocation-ledger.jsonl` | `774` | `09e33d3a859b2f6e4317de363d954d50d1be2efd54dacfdb39827f7b1aef071a` |
| `network-sockets.json` | `427` | `24bab97f4996aefa1ee6e4f7cfd19c28a1eea9e80a1a3d46918712c9baf26990` |
| `npm-ci-result.json` | `1048` | `aab3eb0f6387c1114dc1d5c2a9a62beb78e1962bc15f0f8e2f7e7908ed052340` |
| `npm-ci.stderr.log` | `8751` | `b0102f2cdccbbb8f680721aa34c282f433a370cd92ccb08747ee9e325d0f42ca` |
| `npm-ci.stdout.log` | `0` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `npm-logs/2026-09-04T04_09_20_273Z-debug-0.log` | `12298` | `904b18150231a5f42f56f8bfa21859c1cafd4ee838e6f7de8ff6a661bad4101b` |
| `preflight.json` | `9295` | `3b839eb09127bfa76588052dbf07643005cf1b0300b615ffd9e9e7ae173bdd83` |
| `static-gates.json` | `2039` | `7b11c2b05a5498f9184946c0d2232cccb11ea11d06cd06334b444ebcdb381593` |

These files are historical provenance only. They cannot prove official registry metadata identity, official tarball identity, or a corrected lockfile candidate.

### 6.4 Package Identity

| Field | Frozen value |
|---|---|
| Package | `env-paths@2.2.1` |
| Lockfile package path | `node_modules/env-paths` |
| Source artifact | `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json` |
| Source artifact bytes | `30829` |
| Source artifact SHA-256 | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |

The package identity must be read from the frozen source artifact. Historical cache, metadata, tarball, and npm error text are not authoritative inputs.

## 7. Execution Model

This Contract defines only a future validation model.

| Field | Current value |
|---|---|
| Execution Authority | `NO` |
| Verification Executed | `NO` |
| Invocation | `NOT_CREATED` |
| Execution Root | `NOT_CREATED` |
| Runner | `NOT_CREATED` |

No operation described as future behavior in this Contract is authorized by this draft.

## 8. Network Boundary

If execution is later authorized, network access is limited to the official npm registry for `env-paths@2.2.1`.

Allowed response types:

- metadata
- tarball

Prohibited sources and mechanisms:

- mirror
- proxy
- alternate registry
- cache
- local registry

The tarball URL must be obtained from metadata acquired during the same authorized Invocation. Every request, redirect, response header, and raw response body must be retained as raw evidence. No historical or cached response may substitute for a response from the authorized Invocation.

## 9. Budget Boundary

The maximum budget for the single future execution is:

| Budget item | Maximum |
|---|---:|
| Invocation | `1` |
| Metadata request | `1` |
| Tarball request | `1` |
| Candidate | `1` |
| Retry | `0` |
| Resume | `0` |
| Second Invocation | `0` |

The budget is new and belongs only to this Extension. It is unavailable until new Execution Authorization is created. Crossing a future Invocation boundary consumes the one Invocation budget regardless of the final classification.

## 10. Candidate Boundary

A future authorized Invocation may exclusively create one corrected lockfile candidate. It must not modify, replace, rename, move, or delete the official source `package-lock.json` or the DRRC frozen copy.

Candidate creation requirements:

- the candidate path must not exist before exclusive creation;
- creation must occur only after official metadata identity, official tarball byte identity, and integrity comparison have succeeded;
- the candidate must be derived from the exact frozen source lockfile bytes;
- only the verified integrity correction may differ; and
- no candidate may be created when any prior Gate fails.

The candidate evidence must record:

- byte length
- SHA-256
- SHA-512
- byte-level and semantic diff against the frozen source lockfile

The candidate is evidence only. It is not the official `package-lock.json` and cannot be promoted by this Contract.

## 11. Evidence Requirements

A future authorized Invocation must produce:

- input manifest
- invocation ledger
- network evidence
- metadata evidence
- tarball evidence
- candidate evidence
- classification
- final summary

Evidence must preserve exact raw inputs and outputs, their paths, byte lengths, SHA-256 values, relevant SHA-512 values, timestamps, budget consumption, and the reason for every stopped Gate. Evidence failure is fail-closed.

## 12. Classification

The final classification must be exactly one of:

- `PASS`
- `INCONCLUSIVE`
- `INPUT_MISMATCH`
- `AUTHORITY_BLOCKED`

No classification automatically authorizes:

- Dependency Preparation;
- Runtime; or
- P0.S-7.

## 13. Stop Conditions

Execution must stop when any of the following occurs:

- authority missing
- identity mismatch
- network mismatch
- metadata mismatch
- tarball mismatch
- hash mismatch
- candidate mismatch
- evidence failure
- budget exhausted

A stop must be recorded in the invocation ledger, classification, and final summary without retry, resume, fallback, or a second Invocation.

## 14. Handoff Boundary

Even if the Extension is classified `PASS`, it cannot automatically:

- resume P0.S-7;
- modify the official lockfile; or
- enter Runtime.

A new Architecture Owner Decision is required for any handoff or state transition after the Extension result.

## 15. Final State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_CREATED`

This Contract remains a draft for Independent Review. No Execution Authority is created.

## 16. Current Draft Prohibitions

While this Contract remains `DRAFT_FOR_INDEPENDENT_REVIEW`, do not:

- execute Verification;
- download metadata;
- download a tarball;
- create a candidate;
- modify any lockfile;
- create a Runner;
- create an Execution Root;
- invoke npm;
- execute Node;
- access the network;
- commit; or
- push.
