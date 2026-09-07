# V1-SLICE-1C Implementation Authorization Owner Decision

| Field | Value |
|---|---|
| Decision ID | `V1-SLICE-1C-IMPLEMENTATION-AUTHORIZATION-20260908-01` |
| Document Type | `OWNER_IMPLEMENTATION_AUTHORIZATION_DECISION` |
| Status | `OWNER_APPROVED_AND_FROZEN` |
| Decision Date | `2026-09-08` |
| Owner Role | `ARCHITECTURE_OWNER` |

## 1. Decision

```text
V1_SLICE_1C_OWNER_IMPLEMENTATION_AUTHORITY = YES
V1_SLICE_1C_ARCHITECTURE_BASELINE = FROZEN
V1_SLICE_1C = AUTHORIZED_FOR_IMPLEMENTATION
V1_SLICE_1C_IMPLEMENTATION = NOT_STARTED
V1_SLICE_1 = IN_PROGRESS
```

The Architecture Owner accepts the read-only Targeted Delta Review and grants
bounded implementation authority for V1-SLICE-1C only. This Decision freezes the
reviewed Architecture baseline; it does not start implementation, claim
Implementation PASS, close 1C, or close Slice 1.

## 2. Exact Authorization Basis

This Decision binds the following exact persisted identities:

| Authority input | Path | Bytes | SHA-256 |
|---|---|---:|---|
| 1C Contract | `docs/03-v1.0-plan/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-CONTRACT.md` | `13512` | `DCED0828A8EA97D834FDC01CD46B1C54FD5A09A7F2A4509D3E815135EDAAF005` |
| 1C Source Confirmation | `docs/04-development-records/V1-SLICE-1C-FROZEN-HARNESS-USER-LOOP-SOURCE-CONFIRMATION.md` | `7284` | `4EE209D01F956EB28D9908412E3A711AF4E59F0EF8AC5F6B54CCF0F4AF8C5620` |
| AUDIT-015 Architecture Challenge | `docs/05-reviews/architecture/AUDIT-015-V1-SLICE-1C-ARCHITECTURE-CHALLENGE.md` | `5004` | `FBED6BED171BC86A540B2D5E1C4E1FDDB9D21E8A2A93913810EC029005942C08` |
| AUDIT-016 Targeted Delta Review | `docs/05-reviews/architecture/AUDIT-016-V1-SLICE-1C-CONTRACT-TARGETED-DELTA-REVIEW.md` | `4788` | `06621C4F2DE7AC9BEAA54397FD634E9D8169B0DA14CC0B31BFBDCF73B63985CF` |
| UI Spec reviewed allocation sync | `docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md` | `57617` | `2195174452D573980E0A8CC89B18658EC077ADCA92864017A140382F4D54B230` |

```text
ARCHITECTURE_CHALLENGE = PASS
TARGETED_DELTA_REVIEW = PASS
BLOCKING_FINDINGS = NONE
NEW_BLOCKING_FINDINGS = NONE
```

## 3. Authorized Implementation Scope

Authorization is limited to:

```text
V1-SLICE-1C
EMBEDDED REAL HARNESS USER LOOP
```

The authorized goal is to use the same real mounted AppWebEntry, the frozen 1B
authenticated Carrier, real Harness-owned Provider/model/credential state, and
the real Harness Agent runtime to validate:

```text
Workspace
  -> Session
  -> Prompt
  -> Assistant Streaming
  -> read-only Tool Call
  -> Tool Result
  -> final Assistant response
```

The authority includes only the implementation necessary for:

- same-context runtime Evidence;
- passive truthful Shaco wrapper corrective;
- bounded real Provider execution;
- controlled `proof.txt` read-only Tool Gate;
- continuous Assistant stream/background stream coexistence checks;
- conditional Approval/Question support; and
- bounded implementation tests, Evidence and documentation required by the
  frozen Contract.

## 4. Frozen Architecture Remains Unchanged

```text
PRIMARY_USER_LOOP_OWNER = APPWEBENTRY
SHACO_SHELL_MODE = PASSIVE_TRUTHFUL_WRAPPER
MAX_JSON_FRAME = 262144
ACTIVE_AGENT_TURNS_FOR_GATE = 1
TOOL_PROOF_MAX_ATTEMPTS = 2
APPROVAL_GATE = CONDITIONAL_IN_1C
QUESTION_GATE = CONDITIONAL_IN_1C
SESSION_CANCEL_GATE = DEFER_TO_LATER_SLICE1_GATE
SECOND_APPWEBENTRY = FORBIDDEN
SECOND_CLIENT_CONNECTION = FORBIDDEN
SECOND_REMOTE_CONTEXT = FORBIDDEN
DIRECT_TEST_SESSION_PROMPT = FORBIDDEN
```

This authorization does not modify the allocation, transport, concurrency,
Evidence-context, interaction or Tool-attempt decisions reviewed in AUDIT-016.

## 5. Not Authorized

This Decision does not authorize:

- Frozen Harness modification;
- private AppWebEntry `ctx`;
- `packages/**/src` production deep import;
- a second Workspace truth or second Session truth;
- a second Prompt/Agent RPC;
- a Shaco Provider Registry or Credential Store;
- TCP / stock HTTP / WebSocket fallback;
- Carrier frame-cap change;
- reconnect/recovery or packaging;
- Shaco native picker replacement;
- Automation or Multi-Agent;
- final V1-SLICE-1 closure; or
- dangerous Approval manufactured only for Evidence.

## 6. Provider Execution Authority

Real Harness Provider network calls are authorized only for controlled 1C
validation Session(s). The read-only Tool Proof permits at most two real Session
attempts. A `429`, `5xx`, DNS failure, TLS failure, Provider timeout or missing
credential does not expand the attempt budget.

Provider/network failures must use the frozen Contract classifications. If the
credential is missing, the implementation must return
`HUMAN_REQUIRED_PROVIDER_CREDENTIAL` and stop the real Provider Gate. No API key
or other credential value may be requested through or written to Prompt, log or
Evidence; Shaco must not create a credential store.

## 7. Preserved Carry-Forward

```text
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
V1_SLICE_1B_NF_6 = OPEN_NON_BLOCKING
```

This authorization does not close either Finding.

## 8. Authorized Next State

```text
V1_SLICE_1C = AUTHORIZED_FOR_IMPLEMENTATION
V1_SLICE_1C_ARCHITECTURE_CHALLENGE = PASS
V1_SLICE_1C_TARGETED_DELTA_REVIEW = PASS
V1_SLICE_1C_BLOCKING_FINDINGS = NONE
V1_SLICE_1C_ARCHITECTURE_BASELINE = FROZEN
V1_SLICE_1C_IMPLEMENTATION = NOT_STARTED
V1_SLICE_1C_OWNER_IMPLEMENTATION_AUTHORITY = YES
V1_SLICE_1 = IN_PROGRESS
V1_CURRENT_STEP = V1_SLICE_1C_AUTHORIZED_FOR_IMPLEMENTATION
V1_CURRENT_NEXT_ACTION = IMPLEMENT_V1_SLICE_1C_EMBEDDED_REAL_HARNESS_USER_LOOP
```

Implementation requires a later execution turn and must follow the frozen
Contract exactly. This Decision generates no Implementation Prompt and performs
no Product, Provider, Workspace, Session or Tool execution.
