# P0.S-6 Technical Validation Extension Execution Authorization Contract

## 1. Contract Identity

| Field | Value |
|---|---|
| Contract ID | `P0S6-TVEC-EAC-20260904-01` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |
| Document Type | `TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORIZATION_CONTRACT` |

`P0S6_TVEC_EAC_CONTRACT_ID = P0S6-TVEC-EAC-20260904-01`

`P0S6_TVEC_EAC_STATUS = DRAFT_FOR_INDEPENDENT_REVIEW`

This document is an execution authorization design draft. It does not grant Execution Authority, execute Verification, or create an Invocation.

## 2. Parent Governance Chain

| Field | Value |
|---|---|
| Parent Closure | `P0.S-6 Final Closure` |
| Previous Final Classification | `AUTHORITY_BLOCKED` |
| Extension Decision | `P0S6-TVEC-20260904-01` |
| Owner Approval | `P0S6-TVEC-OA-20260904-01` |

This Contract belongs to the P0.S-6 Technical Validation Extension. It does not reopen the original P0.S-6.

## 3. Execution Goal

The sole future execution goal is to validate the `env-paths@2.2.1` integrity mismatch through:

1. official npm registry metadata identity verification;
2. official tarball byte identity verification;
3. integrity comparison; and
4. corrected lockfile candidate derivation.

## 4. Scope Boundary

### 4.1 Allowed

- frozen input verification
- metadata retrieval
- tarball retrieval
- integrity verification
- candidate derivation
- evidence generation

### 4.2 Forbidden

- `npm ci`
- Dependency Preparation
- `node_modules` modification
- Runtime
- Electron
- Client Module Runtime
- Plugin Runtime
- P0.S-7
- P0.S-8
- production changes

## 5. Authority Boundary

Current state:

| Field | Value |
|---|---|
| Execution Authority | `NO` |
| Verification Executed | `NO` |
| Invocation | `NOT_CREATED` |

This draft does not create Execution Authority.

Future execution requires all of the following:

- Owner Approval of this exact Contract;
- Explicit Execution Authorization; and
- a new Invocation.

## 6. Frozen Inputs

Before future execution, every input listed below must exist and match its exact path, byte length, and SHA-256. Any missing or mismatched input requires `AUTHORITY_BLOCKED` or `INPUT_MISMATCH`, as applicable, before network access, Invocation creation, or candidate creation.

### 6.1 Governance Inputs

| Input | Path | Bytes | SHA-256 |
|---|---|---:|---|
| P0.S-6 Final Closure Decision | `docs/04-development-records/P0S-6-FINAL-CLOSURE-DECISION.md` | `2239` | `775594e69d54abd21b325ec3ec7d6817bccbf47517c1f5bf4871cc06f4f32c5b` |
| P0.S-6 Post Closure Reconciliation Decision | `docs/04-development-records/P0S-6-POST-CLOSURE-RECONCILIATION-DECISION.md` | `2822` | `163b4cfdffb2eef4f49f0cd5dd07f567a587db39b7705492e1f49680ef0080cc` |
| P0.S-6 Technical Validation Extension Decision | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-DECISION.md` | `1883` | `b170c3e52bc8375f49e97d3b64ab32fed32b8c9ae0eea14d2aa3e5d43db08d98` |
| P0.S-6 Technical Validation Extension Contract | `docs/03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-CONTRACT.md` | `10164` | `a1ec0522cbdc287cc01b123786dc9322790952ba881dee732238dafc52c4f0e6` |
| P0.S-6 Technical Validation Extension Owner Approval Decision | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-OWNER-APPROVAL-DECISION.md` | `2588` | `a0fbb157d070e2622cff09de1a8ca92ee4517f0dd5e87edb10edd7c506bf7d47` |

### 6.2 Technical Inputs

| Input | Path | Bytes | SHA-256 |
|---|---|---:|---|
| Source `package-lock.json` | `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json` | `30829` | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |
| DRRC frozen `package-lock.json` | `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json` | `30829` | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |

The source and DRRC frozen lockfiles are protected inputs. They must remain byte-identical and must not be used as candidate output paths.

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

DRRC Evidence is historical provenance only. It cannot substitute for official registry metadata, official tarball bytes, or evidence generated by a future authorized Invocation.

## 7. Execution Identity Requirements

Future execution must have all of the following frozen identities:

| Required identity | Current state | Future requirement |
|---|---|---|
| Authority HEAD | `NOT_FROZEN` | exact commit SHA and parent relationship |
| Runner identity | `NOT_CREATED` | canonical path, bytes, and SHA-256 |
| Execution Root identity | `NOT_CREATED` | canonical path and exclusive-create boundary |
| Invocation identity | `NOT_CREATED` | unique Invocation ID bound to the authorization |
| Input Manifest | `NOT_CREATED` | exact path, bytes, and SHA-256 for every frozen input |

Any missing execution identity requires `AUTHORITY_BLOCKED`. The future Execution Authorization must bind these identities to this exact Contract and its Owner Approval.

## 8. Invocation Boundary

The future execution model permits one new Invocation only.

| Invocation control | Maximum |
|---|---:|
| Invocation | `1` |
| Retry | `0` |
| Resume | `0` |
| Reuse | `0` |
| Second Invocation | `0` |

The Invocation must not reuse a previous runner, root, partial response, cache, ledger, budget, or authority. Once its start boundary is crossed, its single budget is consumed regardless of the final classification.

## 9. Network Boundary

Future authorized network access is limited to the official npm registry for `env-paths@2.2.1`.

Allowed:

- metadata
- tarball obtained from the validated metadata

Forbidden:

- mirror
- proxy
- alternate registry
- cache
- local registry

All request details, redirects, response headers, and exact response bodies must be preserved as raw evidence. Historical data and cached responses cannot satisfy this boundary.

## 10. Budget

Future execution maximum:

| Budget item | Maximum |
|---|---:|
| Invocation | `1` |
| Metadata request | `1` |
| Tarball request | `1` |
| Candidate | `1` |
| Retry | `0` |

This budget is unavailable while Execution Authority is `NO`. It does not restore or reuse any previous P0.S-6 budget.

## 11. Candidate Boundary

A future explicitly authorized Invocation may create one corrected lockfile candidate by exclusive creation.

It must not modify, replace, rename, move, or delete:

- the source `package-lock.json`; or
- the DRRC frozen `package-lock.json`.

Candidate creation is permitted only after the same Invocation proves metadata identity, tarball byte identity, and integrity equality. Candidate evidence must record:

- byte length;
- SHA-256;
- SHA-512; and
- byte-level and semantic diff against the frozen source lockfile.

The candidate remains evidence. It is not an authorized replacement for the source lockfile.

## 12. Evidence Requirements

A future authorized Invocation must generate:

- authority evidence
- input manifest
- invocation ledger
- network evidence
- metadata evidence
- tarball evidence
- candidate evidence
- classification
- final summary

Evidence must record exact paths, byte lengths, hashes, timestamps, Gate outcomes, budget consumption, and any stop reason. Missing or incomplete required evidence is an evidence failure and must stop the Invocation.

## 13. Classification

The final classification must be exactly one of:

- `PASS`
- `INCONCLUSIVE`
- `INPUT_MISMATCH`
- `AUTHORITY_BLOCKED`

No classification automatically authorizes entry into:

- Dependency Preparation;
- Runtime; or
- P0.S-7.

## 14. Stop Conditions

The future Invocation must stop on:

- missing authority
- identity mismatch
- input mismatch
- network mismatch
- metadata mismatch
- tarball mismatch
- hash mismatch
- candidate failure
- evidence failure
- budget exhausted

The stop must be recorded without retry, resume, reuse, fallback, or a second Invocation.

## 15. Handoff Boundary

Even when the result is `PASS`, this Contract cannot automatically:

- modify the source lockfile;
- enter Dependency Preparation;
- enter Runtime; or
- begin P0.S-7.

A new Architecture Owner Decision is required for any later handoff or state transition.

## 16. Final Draft State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_CREATED`

This document remains `DRAFT_FOR_INDEPENDENT_REVIEW`. No Execution Authority or Invocation exists.

## 17. Current Draft Prohibitions

While this Contract remains a draft, do not:

- execute Verification;
- make network requests;
- download metadata;
- download a tarball;
- create a candidate;
- modify any lockfile;
- create a Runner;
- create an Execution Root;
- commit; or
- push.
