# P0.S-6 Technical Validation Extension Authority Anchor Correction Decision Record

## Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-AUTHORITY-ANCHOR-CORRECTION-20260904-01` |
| Document Type | `ARCHITECTURE_DECISION_RECORD` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This draft defines a proposed Authority Anchor model for the P0.S-6 Technical Validation Extension. It does not approve or execute the corrective actions described below, change the current Execution Authority, cross the Invocation Start Boundary, or execute Verification.

## Decision Goal

Define a stable Authority Anchor model that allows the frozen Execution Identity chain to be validated without requiring a Git commit to contain its own commit SHA.

## 1. Current Issue

The current Authority HEAD equality model places `authorityHead` inside the Execution Identity files and requires:

`current Git HEAD == authorityHead`

This creates a Git SHA self-reference cycle:

```text
Execution Identity content includes current HEAD
                         |
                         v
                     Git commit
                         |
                         v
                  a new HEAD is produced
                         |
                         v
          the embedded HEAD is now outdated
                         |
                         v
              Execution Identity is edited again
```

A Git commit SHA is derived from the commit object and the tree containing the Execution Identity content. Updating an embedded HEAD changes that content and therefore produces another commit SHA. Under the equality model, the Execution Identity cannot reach a stable frozen state.

## 2. New Authority Anchor Model

The proposed model defines:

`Authority Anchor = Frozen Execution Anchor Commit`

The Authority Anchor is an immutable execution baseline. It is not the dynamic Git HEAD and does not move when later governance or identity-freeze commits are created.

Execution Identity records bind to the Frozen Execution Anchor Commit. The current Git tip is validated relative to that Anchor rather than substituted into the Execution Identity files after every commit.

## 3. Anchor Definition

Candidate Frozen Execution Anchor Commit:

`001a1e495617b211e1cd1702d5895a4c31f314ea`

Subject to Independent Review and Architecture Owner approval, this candidate Anchor will serve as the future Execution Identity validation baseline.

The candidate value is not activated by this draft. Once approved and frozen, the Anchor must remain immutable for the bounded Technical Validation Extension Invocation.

## 4. Validation Rule Change

The following rule is deprecated:

`current HEAD == authorityHead`

The replacement rule requires the current Git HEAD to satisfy at least one equivalent ancestry condition:

- the current HEAD contains the Authority Anchor in its commit history; or
- the current HEAD is the Authority Anchor or a descendant of the Authority Anchor.

The validation must also preserve all existing tracked-state, staged-state, file-identity, scope, budget, Invocation, and boundary checks.

Requiring the current Git tip to equal the Authority Anchor is prohibited. Later governance and identity-freeze commits may advance the tip without changing the frozen Anchor.

## 5. Impact

This proposed decision does not change:

- the Technical Validation Extension Scope;
- the Invocation, Metadata, Tarball, Candidate, Retry, Resume, or Reuse Budget;
- the official npm registry Network Boundary;
- the Invocation Start Boundary;
- the Verification Goal;
- the closed state of P0.S-6; or
- the prohibition on P0.S-7.

The following states remain unchanged:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

## 6. Required Corrective Actions

After this draft passes Independent Review and receives the required Architecture Owner approval, a separately authorized corrective action must:

1. update the Runner authority-validation semantics to use the frozen Authority Anchor ancestry rule;
2. update the Execution Identity authority bindings to the approved Frozen Execution Anchor Commit;
3. update Frozen Input Manifest validation to use the approved Anchor semantics and rebind any changed identity-file hashes; and
4. regenerate and freeze the final Execution Identity chain in dependency order.

These corrective actions require their own controlled review and freeze. This draft does not perform them.

## 7. Forbidden

This Decision does not execute or authorize execution of:

- Verification;
- the Runner;
- an Invocation;
- the Invocation Start Boundary;
- network access;
- metadata retrieval;
- tarball retrieval;
- candidate creation; or
- lockfile modification.

## 8. Final State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

The current Execution Authority state is recorded for context and remains unchanged. This draft neither grants, revokes, expands, nor consumes Execution Authority.
