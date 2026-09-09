# Shaco Forge V1 Cumulative Regression Closure Gate

Document Type: `V1_TEST_AND_CLOSURE_GOVERNANCE_POLICY`

Status: `FROZEN`

Effective Date: 2026-09-09

## 1. Authority and Scope

This policy is the testing and cumulative-regression Closure authority for every
subsequent V1 Step and Slice, beginning with V1-SLICE-2 Step 2. It supplements,
and does not reopen or rewrite, the frozen Step 1 baseline or the approved
[Step 2 Entry and Implementation Authorization Decision](../04-development-records/V1-SLICE-2-STEP2-ENTRY-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md).
It does not authorize Step 2 implementation, Step 3, or any Provider Gate.

```text
V1_CUMULATIVE_CLOSURE_REGRESSION_GATE = FROZEN
CUMULATIVE_CLOSURE_REGRESSION_REQUIRED = YES
CUMULATIVE_NON_PROVIDER_E2E_REQUIRED = YES
CURRENT_STEP_DEDICATED_GATES_REQUIRED = YES
FULL_BUILD_TYPECHECK_UNIT_STATIC_REGRESSION_REQUIRED = YES
FROZEN_BASELINE_IDENTITY_VALIDATION_REQUIRED = YES
INDEPENDENT_REVIEW_WHEN_REQUIRED = YES
PROVIDER_GATE_SEPARATELY_AUTHORIZED = YES
CLOSURE_WITHOUT_CUMULATIVE_GATE_PASS = FORBIDDEN
STEP1_REOPEN_REQUIRED = NO
```

## 2. Mandatory Closure Rule

No V1 Step or Slice may close from its dedicated tests alone. Closure requires
all of the following gates to return a real `PASS` for the current Closure:

1. the current Step's dedicated gates;
2. full build, typecheck, unit and static regression;
3. cumulative non-Provider end-to-end regression through the current Step's
   final state, followed by bounded cleanup;
4. identity validation of every frozen baseline or frozen Evidence item used by
   the Closure; and
5. Independent Review when the governing Contract or Closure authority requires
   it.

If any required gate does not return a real `PASS`, then:

```text
STEP_OR_SLICE_CLOSURE = FORBIDDEN
```

Historical frozen Evidence may satisfy only a gate classified as
`NOT_PRACTICALLY_REPEATABLE`. It cannot substitute for a reproducible current
Closure run.

## 3. Cumulative Non-Provider E2E Definition

`CUMULATIVE_NON_PROVIDER_E2E` starts from real Product startup and executes, on
the actual Product path, all previously completed capabilities that can be
stably and automatically reproduced plus the current Step's new capability. It
must proceed through the current Step's final state and end with bounded
cleanup.

Running only a current-Step fixture is insufficient. Citing frozen Evidence from
an earlier Closure as though it were rerun in the current Closure is forbidden.

## 4. Gate Classification

Every Closure gate must be classified as exactly one of the following:

| Classification | Meaning | Closure treatment |
|---|---|---|
| `REPRODUCIBLE` | Stable, low-risk and automatable | Rerun for every relevant Closure |
| `EXPENSIVE_EXTERNAL_PROVIDER_DEPENDENT` | Requires a real Provider, real Agent turn, external network, mutation or material cost | Run only when the governing Contract requires it and the Architecture Owner separately authorizes the Provider Gate |
| `NOT_PRACTICALLY_REPEATABLE` | Historical or environmental gate that cannot reasonably be repeated | Frozen Evidence may be used only after file identity, SHA and baseline validation; record `NOT_RERUN`, never `PASS_RERUN_THIS_CLOSURE` |

The Closure record must identify each required gate, its classification, whether
it was rerun, its result, and the Evidence or frozen identity that supports the
result.

## 5. Step 1 Disposition

V1-SLICE-2 Step 1 remains `PASS / CLOSED / FROZEN`; it is not reopened. Its
typecheck, build, full unit, static, `smoke:worker`, `smoke:carrier`,
`smoke:electron`, `smoke:slice2-step1`, G01-G22 and Independent Review results
remain frozen under the
[Step 1 Owner Closure and Freeze Decision](../04-development-records/V1-SLICE-2-STEP1-OWNER-CLOSURE-AND-FREEZE-DECISION.md)
and [AUDIT-023](../05-reviews/architecture/AUDIT-023-V1-SLICE-2-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md).

All reproducible Step 1 capability must nevertheless participate in Step 2 and
every later cumulative Closure regression. Step 2 Closure must explicitly prove:

```text
STEP1_REGRESSION = PASS
```

## 6. Step 2 Future Closure Minimum Cumulative Chain

Step 2 may close only after its dedicated gates and every other mandatory gate
in this policy pass, including this minimum cumulative non-Provider chain:

```text
Product startup
-> Worker authority
-> Harness Host
-> Native Helper
-> deterministic trusted lifecycle discovery
-> fresh attachment credential
-> authenticated Carrier
-> Electron Desktop
-> Desktop graceful close
-> Worker / Host / Helper survival
-> Desktop crash
-> Worker / Host / Helper survival
-> fresh Desktop
-> same Worker reattach
-> fresh Client generation
-> Carrier loss
-> rediscovery
-> authenticated reconnect
-> old Client generation fencing
-> stale callback / settlement rejection
-> old unary / stream cleanup
-> Workspace read-only repull
-> Session read-only repull
-> current Session cold projection
-> PROJECTION_REBUILD_COMPLETE
-> Product CONNECTED
-> bounded cleanup
```

A Step 2 dedicated-gate `PASS` is not equivalent to Step 2 Closure. Closure also
requires cumulative Step 1 + Step 2 non-Provider E2E `PASS`, full regression
`PASS`, frozen baseline identity validation, and every other applicable Closure
gate.

## 7. Future Cumulative Growth

- Step 3 Closure must accumulate the complete reproducible Step 1 chain, the
  complete reproducible Step 2 chain, and Step 3 Outer Shell / Native /
  Interaction capability.
- Slice 3 Closure must execute the cumulative V1 chain against packaged runtime.
- Slice 4 Closure must execute install, startup, complete cumulative V1
  acceptance and cleanup in a fresh Windows environment.

Each later Step or Slice extends the cumulative chain. It does not replace or
discard the reproducible capabilities accumulated before it.

## 8. Provider Rule

```text
LIVE_PROVIDER_REGRESSION_EVERY_STEP = NO
PROVIDER_GATE_SEPARATELY_AUTHORIZED = YES
PROVIDER_GATE_AUTHORIZATION = NO
```

A Provider-dependent gate runs only when its governing Contract truly requires
it and only after separate Architecture Owner Provider Gate authorization. If a
future Step 2 Closure requires an active real Agent turn followed by Desktop
detach or crash, Worker continuation, fresh attachment, and final-result
projection, the implementer must stop with:

```text
PROVIDER_GATE_AUTHORIZATION_REQUIRED
```

The implementer must then return to the Architecture Owner and must not execute
the Provider Gate without that authorization.

## 9. Current State Preserved

```text
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP2_ENTRY = APPROVED
V1_SLICE_2_STEP2_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP2 = AUTHORIZED_NOT_STARTED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP2_LONG_RUNNING_IMPLEMENTATION_GOAL
```

Related active maps are the [Current State](SHACO-FORGE-CURRENT-STATE.md),
[Document Map](SHACO-FORGE-DOCUMENT-MAP.md), and
[V1.0 Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md).
The frozen execution boundaries remain defined by the
[V1-SLICE-2 Main Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md),
[Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md),
and [Security Model](../02-architecture/SHACO-FORGE-SECURITY-MODEL.md).
