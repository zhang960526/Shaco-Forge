# P0.S-6 Technical Validation Extension Execution Snapshot Corrective Contract

## 1. Contract Identity

| Field | Value |
|---|---|
| Contract ID | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTIVE-20260904-01` |
| Document Type | `EXECUTION_SNAPSHOT_CORRECTIVE_CONTRACT` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This Contract defines the boundary for a future corrective implementation of the approved Authority Anchor and Execution Snapshot Trust Model. It does not perform the corrective, modify an execution artifact, execute Verification, create an Invocation, or cross the Invocation Start Boundary.

## 2. Parent Governance

| Parent | Identity |
|---|---|
| Parent Architecture Decision | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTION-20260904-01` |
| Parent Architecture Decision Path | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTION-DECISION.md` |
| Parent Decision SHA-256 | `5352EA58664379EC91F54A4057F4FAA550623F44BE37AF5AE7E80117AF944096` |
| Parent Owner Approval | `P0S6-TVEC-EXECUTION-SNAPSHOT-OA-20260904-01` |
| Parent Owner Approval Path | `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTION-OWNER-APPROVAL-DECISION.md` |

The Parent Architecture Decision and its Owner Approval establish the approved trust model. This Contract does not expand that approval.

Current governance state remains:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

## 3. Corrective Goal

The sole corrective goal is to upgrade the current Execution Identity freeze model to:

```text
Authority Anchor
       |
       v
Execution Snapshot
       |
       v
Immutable Snapshot Binding
```

The corrective must resolve all of the following:

- Git HEAD self-reference caused by embedding a dynamic execution-tip SHA in files contained by that same commit;
- descendant identity drift that remains possible under ancestry validation alone; and
- use of Frozen Input Manifest self-consistency as the sole execution trust root.

The corrective does not change the Technical Validation Extension's verification subject or authorize its execution.

## 4. Allowed Corrective Scope

After this Contract passes Independent Review and receives Architecture Owner approval, a separately controlled corrective implementation may modify only the artifacts required for the following work.

### 4.1 Runner Validation

Runner authority validation may be changed from:

`current HEAD == authorityHead`

to conjunctive validation of:

- Authority Anchor ancestry; and
- exact Execution Snapshot identity.

The observed current execution target may be inspected for ancestry and byte identity. Dynamic current Git HEAD must not become the source of the approved Snapshot identity.

### 4.2 Frozen Input Manifest Validation

Frozen Input Manifest validation may be changed so that Manifest consistency is evidence within the Snapshot but cannot serve as the sole trust root.

Validation must compare the Frozen Input Manifest's exact SHA-256 against the approved immutable Snapshot Binding before trusting hashes declared inside the Manifest.

### 4.3 Execution Identity Regeneration

The corrective may regenerate and rebind only the execution identities affected by the approved trust-model change:

- Runner Identity;
- Execution Root Identity;
- Invocation Identity; and
- Frozen Input Manifest.

Each regenerated identity must remain bound to the same bounded Technical Validation Extension, existing Invocation identity, existing budget, and existing boundary state unless a separate Architecture Owner Decision explicitly changes them.

### 4.4 Snapshot Binding Creation

The corrective may create one immutable Snapshot Binding that identifies the complete final Execution Snapshot defined in Section 5.

Creating the binding does not create or start an Invocation and does not consume execution budget.

## 5. Execution Snapshot Definition

The final Execution Snapshot must bind all of the following values:

| Snapshot component | Mandatory identity |
|---|---|
| Runner | exact byte length and SHA-256 |
| Runner Identity | exact SHA-256 |
| Execution Root Identity | exact SHA-256 |
| Invocation Identity | exact SHA-256 |
| Frozen Input Manifest | exact SHA-256 |
| Snapshot Binding | Owner-approved immutable reference |

The Snapshot Binding must also identify the Authority Anchor, Contract ID, bounded Invocation identity, and the canonical repository-relative paths of every Snapshot component.

Missing, pending, ambiguous, alternative, or internally inconsistent values make the Snapshot invalid and require `AUTHORITY_BLOCKED`.

Any byte change to a Snapshot component creates a new Snapshot identity. It must not inherit approval from the previous Snapshot Binding.

## 6. Snapshot Binding Rule

The Snapshot Binding must not derive its approved identity from:

- dynamic current Git HEAD; or
- declarations made only by the Frozen Input Manifest itself.

The trust root must be an Owner-approved immutable reference. Acceptable mechanisms are:

- an immutable governance record that binds the finalized Snapshot identities;
- a signed tag that resolves to the approved Snapshot; or
- a dedicated immutable freeze reference governed by the repository's approval controls.

The selected mechanism must be documented unambiguously before implementation freeze. It must expose the approved Runner, identity-file, and Frozen Input Manifest hashes independently of the Manifest being validated.

If an immutable governance record is stored in Git, it must bind an already-finalized Snapshot commit or tree and must not require that record to contain its own commit SHA. Its immutability must be established by the applicable Owner-approved reference or freeze control.

An unresolved or mutable Snapshot reference requires fail-closed classification before Final Preflight can pass.

## 7. Freeze Order

The corrective must use the following one-way dependency order:

1. fix and record the approved Authority Anchor;
2. make only the corrective file changes allowed by Section 4;
3. generate the Runner Identity from the final Runner bytes;
4. generate the remaining Execution Identities from their final bytes and approved Anchor semantics;
5. generate the Frozen Input Manifest from the final Runner and identity bytes;
6. create and Owner-freeze the immutable Execution Snapshot Binding over the completed Snapshot; and
7. run Final Preflight only after every preceding step is frozen and review-complete.

No later step may require an earlier frozen file to be edited in order to embed the commit SHA produced by that edit. Snapshot construction must not use circular backfilling.

If any component changes after its dependent value is generated, the affected component and every later dependent artifact must be regenerated in order and receive the required review. An existing Snapshot Binding must never be edited in place to bless changed bytes.

## 8. Final Preflight Validation Rule

Final Preflight must validate all of the following before the Invocation Start Boundary may be crossed:

1. the current execution target descends from or equals the approved Authority Anchor;
2. the observed Execution Snapshot Binding matches the Owner-approved immutable reference;
3. the Runner byte length and SHA-256 match the Snapshot Binding;
4. the Frozen Input Manifest SHA-256 matches the Snapshot Binding; and
5. the Runner Identity, Execution Root Identity, and Invocation Identity SHA-256 values match the Snapshot Binding and their corresponding frozen Manifest entries.

These checks are conjunctive. A failure, missing value, mutable reference, identity mismatch, or ambiguous result requires `AUTHORITY_BLOCKED` before network access, Invocation start, metadata retrieval, tarball retrieval, or candidate creation.

Manifest self-consistency may be checked only after the Manifest itself has been authenticated against the immutable Snapshot Binding.

## 9. Scope Boundary

This Contract does not change:

- the Technical Validation Extension Verification Goal;
- the approved Technical Validation Extension Scope;
- the Metadata Budget;
- the Tarball Budget;
- the Candidate Budget;
- the Retry, Resume, Reuse, or second-Invocation Budget;
- the official npm registry Network Boundary; or
- the Invocation Boundary.

The following states remain unchanged:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

## 10. Forbidden

This Contract Draft does not execute or authorize execution of:

- Verification;
- the Runner;
- an Invocation;
- the Invocation Start Boundary;
- metadata retrieval;
- tarball retrieval;
- candidate creation;
- lockfile modification;
- npm;
- Runtime; or
- P0.S-7.

While this Contract remains `DRAFT_FOR_INDEPENDENT_REVIEW`, do not implement the corrective, modify the Runner, modify the Frozen Input Manifest, regenerate an Execution Identity, create a Snapshot Binding, commit, or push under this Contract.

## 11. Required Reviews

Before corrective implementation, this exact Contract must receive:

1. Independent Review `PASS`; and
2. Architecture Owner Approval.

After corrective implementation, the final Runner, Execution Identities, Frozen Input Manifest, and Snapshot Binding must receive their applicable controlled review and Owner freeze before Final Preflight.

No review or approval may be inferred from the Parent Decision, from Manifest self-consistency, from Git ancestry, or from this draft status.

## 12. Final Draft State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

This Contract remains a draft for Independent Review. It defines a future corrective boundary only and performs no corrective implementation or execution.
