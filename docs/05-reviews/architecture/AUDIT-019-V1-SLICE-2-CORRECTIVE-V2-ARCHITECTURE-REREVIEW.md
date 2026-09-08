# AUDIT-019 — V1-SLICE-2 Corrective V2 Architecture Re-Review

| Field | Value |
|---|---|
| Review ID | `AUDIT-019` |
| Document Type | `INDEPENDENT_ARCHITECTURE_REREVIEW` |
| Review Model | `DeepSeek V4 Pro` |
| Mode | `READ_ONLY / DEFECT_FIRST` |
| Status | `PASS_READY_TO_PERSIST_SLICE2_ARCHITECTURE_CONTRACT` |
| Architecture Risk | `MEDIUM` |

This record persists the accepted external Independent Corrective V2 Re-Review.
The external response is not a repository file. Its accepted identity is:

```text
DISPLAY_NAME = 粘贴的 markdown (1)。md(20260908-135538)
BYTES = 17110
SHA_256 = D7A00634B4210E09D87CF9236BA0D2F936DF9D0046C9DBA7EEE67660779786BB
```

The Architecture Owner Corrective V2 input is a design, not an Independent
Review. Its accepted external identity is:

```text
DISPLAY_NAME = 粘贴的 markdown (1)。md(20260908-132522)
BYTES = 14858
SHA_256 = 4754C7910CF9B99F0A5C612254A6BE5D204C3D479F08B0E7AF96BE1F1661C44E
```

## 1. Review chain

1. Architecture Re-entry Candidate.
2. Independent Architecture Challenge: `FAIL`.
3. Architecture Corrective.
4. Bounded Source Confirmation: `PASS`.
5. Independent Corrective Re-Review: `FAIL` (`B-2` and `B-3` open).
6. Architecture Corrective V2.
7. Independent Corrective V2 Re-Review: `PASS`.

The original Blocking Findings were:

- `B-1 CREDENTIAL_REATTACH_TRUST_NOT_PROVEN`
- `B-2 WORKER_INDEPENDENCE_TOPOLOGY_NOT_CLOSED`
- `B-3 SHELL_PUBLIC_SEAM_ASSUMPTION`
- `B-4 HOST_ORPHAN_AFTER_WORKER_CRASH`

Final finding state:

```text
V2_REREVIEW_VERDICT = PASS
B1 = CLOSED
B2 = CLOSED
B3 = CLOSED
B4 = CLOSED
BLOCKING_FINDINGS = NONE
ARCHITECTURE_RISK = MEDIUM
FINAL_STATE = PASS_READY_TO_PERSIST_SLICE2_ARCHITECTURE_CONTRACT
NEXT_ACTION = PERSIST_V1_SLICE_2_ARCHITECTURE_CONTRACT
```

## 2. Bounded source confirmation accepted by the review

```text
SOURCE_CONFIRMATION_RESULT = PASS
STATIC_CLIENT_BUNDLE_FORMAT_CONFIRMED = YES
PRODUCT_PIPELINE_PROVEN = YES
PUBLIC_PROGRAMMATIC_OPEN_SETTINGS = NO
HARNESS_EXISTING_SETTINGS_TRIGGER_REUSABLE = YES
ADDITIVE_SETTINGS_SECTION_SUPPORTED = YES
PEER_PROCESS_IDENTITY_API_AVAILABLE = YES
BLOCKING_SOURCE_FINDINGS = NONE
```

The accepted confirmation established that same-context public services exist;
a static third-party Client row is legal; Dynamic Cordis and Frozen source deep
imports are unnecessary; the Product 28+1 pipeline is feasible;
`orderByModuleGraph` is a legal public root export; the thin Settings surface has
the required public service foundation; and Native Helper can obtain peer PID,
canonical path and process creation time.

This is bounded source confirmation, not completed Slice 2 implementation or
Runtime Evidence.

## 3. Non-blocking findings and required dispositions

The verdict is `PASS`, but the following findings are retained as Contract
obligations. They are not mislabeled as all closed.

| Finding | Severity | Required disposition |
|---|---|---|
| `NF-S2-1` | MEDIUM | Persist trusted credential delivery: Native Helper issuance, peer attestation, PID/start binding, bounded pending lifetime, consume/zeroize on every terminal path, and no Renderer/argv/env/persistence/log/Evidence secret route. |
| `NF-S2-2` | MEDIUM | Persist sequential attachment reset/drain: one instance, BUSY concurrency, old I/O drain/cancel, complete auth/decoder/relay reset and stale-frame/generation rejection. |
| `NF-S2-3` | MEDIUM | Persist the Outer shell seat Gate and a section-by-section Settings public-capability mapping before Step 3. |
| `NF-S2-4` | MEDIUM | Persist exact mutex holder semantics, abandoned-mutex detection and fail-closed unverified ownership. |
| `NF-S2-5` | LOW | Require the legal preset-aware `ui-session` New Chat path; forbid the bare lower-level create route. |
| `NF-S2-6` | LOW | Freeze Product log ownership now while leaving exact final release layout to Slice 3. |
| `NF-S2-7` | INFO | Replace the external design/review chain as operational authority with repository Contract, Amendment, audit record and Owner Decision. |

Disposition after persistence:

```text
NF-S2-1 = INCORPORATED_AS_CONTRACT_OBLIGATION
NF-S2-2 = INCORPORATED_AS_CONTRACT_OBLIGATION
NF-S2-3 = INCORPORATED_AS_CONTRACT_OBLIGATION
NF-S2-4 = INCORPORATED_AS_CONTRACT_OBLIGATION
NF-S2-5 = INCORPORATED_AS_CONTRACT_OBLIGATION
NF-S2-6 = INCORPORATED_AS_CONTRACT_OBLIGATION
NF-S2-7 = SATISFIED_BY_REPOSITORY_AUTHORITY_PERSISTENCE
```

## 4. Review conclusion

Corrective V2 closes B-1 through B-4 without changing the frozen Carrier wire
and HMAC contract, reducing final V1.0 outer UI, introducing a second Harness
business truth, or requiring replay. The remaining risk is `MEDIUM` and is
managed by the persisted Contract obligations and future step gates.

The resulting repository authorities are:

- [V1-SLICE-2 Architecture Contract](../../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
- [Carrier Lifecycle Amendment](../../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
- [Architecture Owner Decision](../../04-development-records/V1-SLICE-2-ARCHITECTURE-OWNER-DECISION.md)

```text
V2_REREVIEW_VERDICT = PASS
BLOCKING_FINDINGS = NONE
FINAL_STATE = PASS_READY_TO_PERSIST_SLICE2_ARCHITECTURE_CONTRACT
```
