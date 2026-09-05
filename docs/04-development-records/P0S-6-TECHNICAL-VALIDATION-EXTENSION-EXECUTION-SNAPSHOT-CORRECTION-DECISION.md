# P0.S-6 Technical Validation Extension Execution Snapshot Correction Decision Record

## Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTION-20260904-01` |
| Document Type | `ARCHITECTURE_DECISION_RECORD` |
| Status | `DRAFT_FOR_INDEPENDENT_REVIEW` |

This draft defines a proposed Execution Snapshot Trust Model for the P0.S-6 Technical Validation Extension. It does not approve or perform the corrective actions described below, alter the current Execution Authority, cross the Invocation Start Boundary, or execute Verification.

## Decision Goal

Define a two-level trust model that separates the immutable governance-history baseline from the exact bytes authorized for execution.

The model must establish both:

- an Authority Anchor; and
- an Execution Snapshot Binding.

It must prevent Git HEAD self-reference while also preventing execution-identity drift in commits created after the Authority Anchor.

## 1. Current Problem

The Authority Anchor model replaces the unstable rule:

`current HEAD == authorityHead`

with a frozen historical commit and an ancestry relationship. This resolves the Git SHA self-reference problem because Execution Identity files no longer need to contain the SHA of the commit that contains those same files.

An ancestry relationship alone is not sufficient to authenticate the final execution bytes. A descendant commit can modify the Runner, Frozen Input Manifest, or Execution Identity files, update their internally referenced hashes, and still satisfy both:

- the Authority Anchor ancestry check; and
- internal Manifest consistency.

Therefore, ancestry proves governance lineage but does not independently prove that the execution target contains the exact Owner-approved execution snapshot.

## 2. Two-Level Trust Model

The Technical Validation Extension must use two distinct trust levels.

### Level 1: Authority Anchor

The Authority Anchor is an immutable Git commit that defines the approved governance-history baseline from which the bounded execution authority descends.

It establishes permitted governance lineage. It does not, by itself, authenticate Runner, Manifest, or Execution Identity bytes introduced or corrected in later commits.

### Level 2: Execution Snapshot

The Execution Snapshot is the exact, Owner-approved set of bytes and identities permitted to participate in the bounded Invocation.

It establishes executable byte identity. It must remain stable even when later non-execution governance commits advance the current Git tip.

Both levels are mandatory. Neither Authority Anchor ancestry nor Execution Snapshot identity is sufficient alone.

## 3. Execution Snapshot Definition

The frozen Execution Snapshot must bind all of the following:

| Snapshot component | Required binding |
|---|---|
| Runner | exact byte length and SHA-256 |
| Runner Identity | exact SHA-256 |
| Execution Root Identity | exact SHA-256 |
| Invocation Identity | exact SHA-256 |
| Frozen Input Manifest | exact SHA-256 |
| Snapshot Binding | exact immutable commit or reference identifying the approved snapshot |

The Snapshot Binding must identify the complete approved execution snapshot after all corrective bytes and dependency-ordered hashes are final. It must not be derived from mutable current-HEAD state at Invocation time.

Any change to a bound component creates a different Execution Snapshot and requires a new controlled freeze and Owner approval. Internal hash consistency cannot substitute for the approved Snapshot Binding.

## 4. Validation Rule

The following rule is deprecated:

`current HEAD == authorityHead`

The following rule is also insufficient and must not be used alone:

`Authority Anchor is an ancestor of current HEAD`

Before the Invocation Start Boundary may be crossed, the current execution target must satisfy all of the following:

1. its commit history contains the approved Authority Anchor;
2. its execution-critical files match the approved Execution Snapshot identity; and
3. every Runner, Runner Identity, Execution Root Identity, Invocation Identity, and Frozen Input Manifest hash matches the frozen Snapshot Binding.

These conditions are conjunctive. Failure or ambiguity in any condition requires `AUTHORITY_BLOCKED` before network access, Invocation start, metadata retrieval, tarball retrieval, or candidate creation.

Later governance commits may advance the Git tip only when the Snapshot-bound execution files remain byte-identical to the approved Execution Snapshot.

## 5. Snapshot Trust Root

The Execution Snapshot must be bound by an Owner-approved immutable reference that is independent of dynamic current Git HEAD.

An acceptable trust root may be:

- an immutable governance record that binds the final snapshot identities;
- a signed tag that resolves to the approved snapshot; or
- a dedicated, immutable freeze reference under the applicable repository governance controls.

The selected trust root must expose an unambiguous approved Snapshot Binding and the expected hashes required by Section 3. The Runner or its pre-start authority validation must verify those values without treating a mutable Manifest's internal declarations as the sole root of trust.

The current Git HEAD may be used as the observed execution target. It must not be used as the source of the approved Snapshot identity.

## 6. Scope Boundary

This Decision changes only the execution-identity trust model. It does not change:

- the Technical Validation Extension Verification Goal;
- the Technical Validation Extension Scope;
- the Invocation, Metadata, Tarball, Candidate, Retry, Resume, or Reuse Budget;
- the official npm registry Network Boundary;
- the Invocation Start Boundary;
- the closed state of P0.S-6; or
- the prohibition on P0.S-7.

The following states remain unchanged:

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

## 7. Corrective Actions

After this draft passes Independent Review and receives Architecture Owner approval, separately authorized corrective work must:

1. update Runner authority validation to require both Authority Anchor ancestry and exact Execution Snapshot identity;
2. update Frozen Input Manifest validation so Manifest self-consistency cannot serve as the sole trust root;
3. rebind Runner Identity, Execution Root Identity, Invocation Identity, and all dependent hashes in dependency order;
4. create and Owner-freeze the immutable Execution Snapshot Binding defined by Sections 3 and 5; and
5. rerun Final Preflight against the approved Authority Anchor and approved Execution Snapshot.

The corrective work must receive its own controlled review and freeze. Final Preflight must remain fail-closed until the complete Snapshot Binding and every dependent identity match.

## 8. Forbidden

This Decision does not execute or authorize execution of:

- Verification;
- the Runner;
- an Invocation;
- the Invocation Start Boundary;
- network access;
- metadata retrieval;
- tarball retrieval;
- candidate creation;
- lockfile modification; or
- P0.S-7.

## Final State

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_EXECUTION_AUTHORITY = YES`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_VERIFICATION_EXECUTED = NO`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION = NOT_STARTED`

`P0S6_TECHNICAL_VALIDATION_EXTENSION_INVOCATION_START_BOUNDARY = NOT_CROSSED`

The existing bounded Technical Validation Extension Execution Authority remains in its current state. This draft neither grants, revokes, expands, consumes, nor executes that Authority.
