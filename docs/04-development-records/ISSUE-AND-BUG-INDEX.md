# Issue and Bug Index

Status: ACTIVE

| ID | Title | Phase | Severity | Status | Document |
|---|---|---|---|---|---|
| BUG-S3S2-001 | Windows credential atomic rename intermittently returns EPERM in cumulative regression | Slice3 Step2 / frozen Slice2 regression | Medium / runtime verification | OPEN / NON_BLOCKING_CARRY_FORWARD; observe in Slice3 Step3 and Slice4 Fresh Windows | [Incident](incidents/BUG-S3S2-001-WINDOWS-CREDENTIAL-RENAME.md) |
| ISSUE-S3S2-002 | Frozen Step1 package bytes durability / temporary Evidence root may be OS-cleaned | Slice3 Release Trust Corrective | Evidence durability / governance risk | OPEN / NON_BLOCKING_CARRY_FORWARD; Step3 final immutable RC and Evidence | [Incident](incidents/ISSUE-S3S2-002-FROZEN-PACKAGE-BYTES-DURABILITY.md) |

## Rule

Create a dedicated incident document for any bug/problem that:

- requires more than one attempt,
- changes an architecture/contract,
- causes a phase Gate failure,
- risks data/security/durability,
- or is likely to recur.
