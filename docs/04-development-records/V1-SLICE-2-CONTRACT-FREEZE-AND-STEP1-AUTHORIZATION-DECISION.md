# V1-SLICE-2 Contract Freeze and Step 1 Authorization Decision

| Field | Value |
|---|---|
| Decision ID | `V1-SLICE-2-CONTRACT-FREEZE-STEP1-AUTH-20260908-01` |
| Document Type | `OWNER_CONTRACT_FREEZE_AND_IMPLEMENTATION_AUTHORIZATION` |
| Status | `OWNER_ACCEPTED_STEP1_AUTHORIZED` |
| Date | `2026-09-08` |
| Targeted Delta Re-Review | [AUDIT-020](../05-reviews/architecture/AUDIT-020-V1-SLICE-2-CONTRACT-TARGETED-DELTA-REREVIEW.md) |

## 1. Owner decision

The Architecture Owner accepts the final Targeted Delta Re-Review, freezes the
V1-SLICE-2 Architecture Contract and Carrier Lifecycle Amendment, and
authorizes only Step 1, `STEP_1_WORKER_AUTHORITY_AND_TRUSTED_DISCOVERY`.

```text
V1_SLICE_2_ARCHITECTURE_REREVIEW = PASS
V1_SLICE_2_CONTRACT_TARGETED_DELTA_REREVIEW = PASS
V1_SLICE_2_CONTRACT_BLOCKING_FINDINGS = NONE
V1_SLICE_2_ARCHITECTURE_CONTRACT = FROZEN
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = FROZEN
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP1 = AUTHORIZED_NOT_STARTED
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_STEP2 = NOT_AUTHORIZED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
```

This decision grants implementation authority but does not itself modify
Product Source or start implementation. `V1_SLICE_2` remains `NOT_STARTED`
until the authorized Step 1 implementation agent begins Product changes.

## 2. Frozen ownership and Carrier boundary

The following generation ownership is frozen for Step 1:

```text
ATTACHMENT_SECRET_GENERATION_OWNER = NATIVE_HELPER
CREDENTIAL_EPOCH_GENERATION_OWNER = NATIVE_HELPER
CHALLENGE_ID_GENERATION_OWNER = SERVER_HELPER
SERVER_NONCE_GENERATION_OWNER = SERVER_HELPER
CLIENT_NONCE_GENERATION_OWNER = CLIENT_MAIN
CLIENT_INSTANCE_ID_GENERATION_OWNER = CLIENT_MAIN
```

The Carrier amendment remains a credential/lifecycle semantic amendment only:

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED = YES
CREDENTIAL_SEMANTIC_AMENDMENT = YES
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
MAX_JSON_FRAME = 262144
STREAM_INITIAL_CREDITS = 4
STREAM_QUEUE_CAPACITY = 16
```

The canonical transcript remains `domain`, `protocolVersion`,
`workerInstanceId`, `endpointId`, `credentialEpoch`, `challengeId`,
`serverNonce`, `clientNonce`, `clientInstanceId`, in that order. The historical
Slice 1B Contract is not amended in place.

## 3. Authorized Step 1 scope

The sole authorized Product implementation scope is
`STEP_1_WORKER_AUTHORITY_AND_TRUSTED_DISCOVERY`, comprising:

1. Per-user detached Worker authority.
2. Worker-owned Windows Job.
3. Host and Helper Job containment.
4. Helper-held per-user authority mutex.
5. Protected lifecycle discovery/control pipe.
6. Desktop peer attestation using current-user DACL, peer PID, process creation
   time, canonical executable path, Product identity, `DesktopInstanceId` and a
   fresh nonce.
7. Per-attachment credential issuance with the frozen generation ownership in
   section 2.
8. Long-lived Worker-lifetime Helper.
9. One random Carrier endpoint per `workerInstanceId`.
10. `MAX_ACTIVE_DESKTOP_ATTACHMENTS = 1`.
11. Sequential attachment lifecycle: `DETACHED -> CREDENTIAL_ISSUED ->
    AUTHENTICATING -> ATTACHED -> DETACHING -> DETACHED`.
12. Desktop close or crash does not terminate a healthy Worker/Host.
13. Same Worker rediscovery and reattachment.
14. `BUSY` response for a second Desktop.
15. Stale credential rejection.
16. Fail-closed behavior for stale or hung authority.
17. Helper crash, Host crash and Worker hard-crash containment.
18. Zero authority overlap and no orphan Host.
19. Product-owned lifecycle logging boundary.
20. Step 1 unit, integration, failure-injection and Evidence work.

## 4. Explicit non-scope

This decision does not authorize:

- Step 2 reconnect/cold projection full implementation.
- Workspace/Session cold recovery implementation.
- Worker replacement full recovery loop.
- Outer Shaco Sidebar, New Chat UI, Project Directory UI or Settings thin
  surface.
- Native Picker UI integration.
- Approval/Question outer projection or Agent Cancel UI.
- 29-row Shaco client composition implementation.
- Provider Runtime or a real Provider attempt.
- Packaging, installer or Slice 3.
- Automation or Multi-Agent.
- A second Workspace/Session truth or a Control Store.

## 5. Frozen authorities and next action

The frozen authorities are:

- [V1-SLICE-2 Lifecycle / Native / Reconnect Architecture Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
- [V1-SLICE-2 Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
- [AUDIT-020](../05-reviews/architecture/AUDIT-020-V1-SLICE-2-CONTRACT-TARGETED-DELTA-REREVIEW.md)

```text
V1_SLICE_2 = NOT_STARTED
V1_CURRENT_STEP = V1_SLICE_2_STEP1_AUTHORIZED_NOT_STARTED
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP1_LONG_RUNNING_IMPLEMENTATION_GOAL
```
