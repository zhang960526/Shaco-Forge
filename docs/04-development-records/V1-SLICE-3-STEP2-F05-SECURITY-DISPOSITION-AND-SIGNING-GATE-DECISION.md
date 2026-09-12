# V1-SLICE-3 Step2 F-05 Security Disposition and Signing Gate Decision

Decision ID: `V1-SLICE-3-STEP2-F05-SECURITY-DISPOSITION-20260912-01`

Document Type: `ARCHITECTURE_OWNER_SECURITY_RISK_ACCEPTANCE_AND_SIGNING_GATE`

Status: `OWNER_ACCEPTED_F05_RESIDUAL_RISK / SIGNING_NOT_AUTHORIZED`

Date: `2026-09-12`

## 1. Owner decision and authority

The Architecture Owner accepts the technical conclusions in
[REVIEW-030](../05-reviews/architecture/AUDIT-030-V1-SLICE-3-STEP2-PRE-SIGNING-INDEPENDENT-REVIEW.md)
and makes the final F-05 PATH B Security Disposition:

```text
F05_TECHNICAL_DISPOSITION_CANDIDATE = RESIDUAL_EXCEPTION_REQUIRED
F05_SECURITY_DISPOSITION = ARCHITECTURE_OWNER_ACCEPTED
F05_STATUS = CLOSED_WITH_ACCEPTED_RESIDUAL_RISK
F05_RESIDUAL_RISK = Renderer injection may still exploit dynamic JS evaluation or trusted-origin style injection.
F05_RESIDUAL_RISK_DISPOSITION = ACCEPTED_FOR_V1_FROZEN_COMPOSITION
```

F-05 is not closed because unsafe directives were removed. The technical facts
were independently reviewed; the residual exception is the minimum sufficient
exception for the current Frozen V1 composition; and the Architecture Owner
explicitly accepts that bounded V1 residual risk. This decision does not state
risk elimination or full CSP hardening.

## 2. Exact accepted security boundary

The exact accepted CSP is:

```text
default-src 'self';
script-src 'self' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
object-src 'none';
base-uri 'none';
frame-ancestors 'none'
```

```text
UNSAFE_EVAL = ACCEPTED_RESIDUAL_EXCEPTION
UNSAFE_EVAL_REASON = Frozen Client Schemastery serialized callback reconstruction
UNSAFE_INLINE = ACCEPTED_RESIDUAL_EXCEPTION
UNSAFE_INLINE_REASON = Frozen Client/plugin/theme local dynamic style injection
NO_EXTERNAL_SCRIPT_SOURCE = YES
NO_EXTERNAL_STYLE_SOURCE = YES
NODE_INTEGRATION = OFF
CONTEXT_ISOLATION = ON
SANDBOX = ON
WEB_SECURITY = ON
ALLOW_RUNNING_INSECURE_CONTENT = NO
```

## 3. Acceptance binding and invalidation

This acceptance is bound only to the current Frozen Client composition, exact
CSP above, Renderer isolation, absence of external script/style sources, and
current packaged runtime identity. It does not automatically carry forward if
any script/style source is expanded, sandbox is disabled, Node Integration is
enabled, Context Isolation is disabled, the Frozen Client composition changes
in a way that expands risk, or any remote Renderer source is introduced. Any
such change requires a new Security Review.

Eliminating `unsafe-eval` and `unsafe-inline` remains
`DEFERRED_SECURITY_HARDENING`. It is not a blocking gate for the current V1 thin
vertical slice, and this decision creates no implementation task.

## 4. Retained risk dispositions

`BUG-S3S2-001` remains `OPEN / NON_BLOCKING_CARRY_FORWARD`; it is not closed by
the isolated passing run. Its carry-forward targets are Slice3 Step3 cumulative
observation and Slice4 Fresh Windows real acceptance. A production-path
recurrence that requires Frozen Harness change is
`STOP_FOR_ARCHITECTURE_OWNER`.

`NODE_SQLITE_EXPERIMENTAL_RISK` remains `NON_BLOCKING / DEFERRED`. Worker Node
`22.19.0` is pinned, runtime availability and Step2 coverage exist, and use is
limited to the minimal control plane. No replacement driver is authorized.

## 5. Signing-only remaining gate

REVIEW-030 confirms signing integration and technical readiness. The Owner does
not supply a public signer identity and does not authorize Production Signing in
this batch:

```text
SIGNING_INTEGRATION = PASS
READY_FOR_OWNER_PUBLIC_SIGNER_IDENTITY = YES
READY_FOR_PRODUCTION_SIGNING_AUTHORIZATION = YES
PUBLIC_SIGNER_IDENTITY_STATUS = PENDING_ARCHITECTURE_OWNER_PUBLIC_SIGNER_IDENTITY
CERTIFICATE_SHA256_ALLOWLIST = EMPTY
SIGNING_EXECUTION_AUTHORIZATION = NO
SIGNING_RUN_COUNT = 0
PRODUCTION_SIGNING_STATUS = WAITING_OWNER_PUBLIC_SIGNER_IDENTITY_AND_EXECUTION_AUTHORIZATION
```

The installer candidate with SHA-256
`91edf1658b734b3feca51abc082f366e0bf15442aba4e355c885a035b3f1c809`
remains `UNSIGNED`, `NOT_PRODUCTION_SIGNED`, and `NOT_RELEASE_READY`. No fake
certificate identity or private key is introduced.

## 6. Step and execution boundary

```text
V1_SLICE_3 = IN_PROGRESS
V1_SLICE_3_STEP2 = IMPLEMENTED_WAITING_PRODUCTION_SIGNING
V1_SLICE_3_STEP2_PRE_SIGNING_TECHNICAL_REVIEW = PASS
V1_SLICE_3_STEP2_PRE_SIGNING_BLOCKING_FINDINGS = NONE
V1_SLICE_3_STEP2_PRODUCTION_SIGNING_GATE = WAITING_OWNER_PUBLIC_SIGNER_IDENTITY_AND_EXECUTION_AUTHORIZATION
V1_SLICE_3_STEP2_FINAL_INDEPENDENT_REVIEW = NOT_STARTED
V1_SLICE_3_STEP2_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP2_BASELINE = NOT_FROZEN
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
PROVIDER_RUN_COUNT = 0
V1_SLICE_4 = NOT_STARTED
V1_CURRENT_STEP = V1_SLICE_3_STEP2_WAITING_PRODUCTION_SIGNING
V1_CURRENT_NEXT_ACTION = ARCHITECTURE_OWNER_PUBLIC_SIGNER_IDENTITY_AND_PRODUCTION_SIGNING_GATE
```

Production Signing evidence does not exist. Therefore this decision does not
start the final Step2 review, close Step2, freeze the Step2 baseline, authorize
Step3 or Provider, or start Slice4. Runtime, Build, Tests, Packaging, Signing,
Provider, and Fresh Windows are `NOT RUN` in this governance-only batch.
