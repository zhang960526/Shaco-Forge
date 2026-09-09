# V1-SLICE-2 Step 1 Minimal Trusted Discovery Corrective Review

| Field | Value |
|---|---|
| Review ID | `REVIEW-021` |
| Document Type | `INDEPENDENT_ARCHITECTURE_SECURITY_CORRECTIVE_REVIEW` |
| Status | `PASS_READY_FOR_CONTRACT_CORRECTIVE_PERSISTENCE` |
| Review Date | `2026-09-09` |
| Review Source | `OWNER_SUPPLIED_INLINE_REVIEW_TRANSCRIPT` |
| External File Identity | `NOT_APPLICABLE` |

This artifact faithfully persists the Architecture Owner-supplied Independent
Minimal V1 Trusted Discovery Corrective Review transcript. No external file
bytes, external identity or external SHA-256 is claimed.

## 1. Review result

```text
REVIEW_VERDICT = PASS
FIRST_FAILURE_BOUNDARY = NONE
REVIEW_SOURCE = OWNER_SUPPLIED_INLINE_REVIEW_TRANSCRIPT
EXTERNAL_FILE_IDENTITY = NOT_APPLICABLE
HISTORICAL_SECURITY_PROMISE_AUDIT = NO_PRIOR_FROZEN_SAME_SID_HOSTILE_PROCESS_REJECTION_PROMISE
CURRENT_WINDOWS_USER = PASS
REMOVE_PRODUCT_BINARY_HARD_GATE = PASS
AUTHENTICATED_CARRIER = USER_BOUNDARY + FRESH_CAPABILITY_POSSESSION
MINIMAL_ARCHITECTURE = PASS
WORKER_AUTHORITY = PASS
LIFECYCLE_DISCOVERY = PASS
CREDENTIAL_ISSUANCE = PASS
FRESH_DESKTOP_REATTACH = PASS
LONG_LIVED_PRODUCT_ATTESTATION_BROKER = NOT_REQUIRED
ASYMMETRIC_WORKER_AUTHORITY_PROTOCOL = NOT_REQUIRED
PRODUCT_LAUNCH_GRANT = NOT_REQUIRED
BROKER = NOT_REQUIRED
ASYMMETRIC_AUTHORITY = NOT_REQUIRED
OVERDESIGN_STATUS = CLOSED
BLOCKING_FINDINGS = NONE
SECURITY_REGRESSION_RISK = LOW
FINAL_STATE = PASS_READY_TO_PERSIST_MINIMAL_V1_STEP1_TRUSTED_DISCOVERY_CORRECTIVE
```

## 2. Accepted trust and scope boundary

```text
V1_LOCAL_TRUST_PRINCIPAL = CURRENT_WINDOWS_USER_SID
SAME_USER_HOST_COMPROMISE = OUT_OF_SCOPE
PRODUCT_BINARY_IDENTITY_REQUIRED_FOR_V1_LOCAL_AUTHORIZATION = NO
```

The current Windows user is the V1 local OS security principal. Carrier
authentication means the conjunction of the protected current-user boundary
and possession of a fresh per-attachment capability. It does not claim Product
binary attestation or distinguish hostile processes operating inside the same
SID.

The out-of-scope same-user host-compromise class includes deliberate
legal-protocol impersonation by a same-SID process, attack topology using an
internal Product binary, `PROCESS_VM_READ`, `PROCESS_VM_WRITE`,
`PROCESS_DUP_HANDLE`, debugger/injection access, theft from a legitimate Product
process of memory/secrets/handles, a compromised current-user token and
deliberate same-SID denial of service.

## 3. Minimal trusted-discovery assessment

The accepted minimum Step 1 trusted-discovery model is:

```text
CURRENT_WINDOWS_USER_SID
+ DETERMINISTIC_PER_USER_LIFECYCLE_PIPE
+ HELPER_HELD_AUTHORITY_MUTEX
+ WORKER_INSTANCE_ID
+ ACTUAL_PEER_PID_AND_PROCESS_START_BINDING
+ PROTOCOL_VERSION_COMPATIBILITY
+ AUTHORITY_HEALTH
+ FRESH_PER_ATTACHMENT_CAPABILITY
+ UNCHANGED_MUTUAL_HMAC_CARRIER
```

`workerInstanceId` remains the Worker authority identity. PID plus process start
time binds a concrete process instance and protects against PID reuse.
`DesktopInstanceId` and nonce supply freshness/correlation, not an independent
identity root. Protocol/version fields establish compatibility. The lifecycle
pipe is deterministic per user, while the Carrier endpoint is random per Worker
instance; the two endpoints are not interchangeable.

The existing Worker-owned Job, Helper-held authority mutex, Worker/Helper
lifetime, one active Desktop attachment, sequential reservation, credential
TTL/consume/revoke/zeroize rules and unchanged mutual HMAC Carrier remain
required. `WorkerGeneration` and `CarrierConnectionId` remain `DO_NOT_CREATE`.

## 4. Persistence obligations

### V-1 — precise Carrier wording

`CLOSED_BY_REQUIRED_PERSISTENCE`: current normative documents must use
`AUTHENTICATED_CARRIER = USER_BOUNDARY + FRESH_CAPABILITY_POSSESSION`, or the
equivalent `CURRENT_USER_AUTHENTICATED_LOCAL_CARRIER`, without implying Product
binary authentication.

### V-2 — synchronized credential-gate correction

`CLOSED_BY_REQUIRED_PERSISTENCE`: Main Contract section 5 and Carrier Amendment
section 3 must both remove canonical executable path and Product identity as
credential-issuance security hard gates.

### V-3 — current-user principal semantics

`CLOSED_BY_REQUIRED_PERSISTENCE`: replace the former prerequisite-only SID
wording with the current-user SID as the V1 local OS trust principal. Do not
claim differentiation among all processes sharing that SID.

### V-4 — historical Blocked Record disposition

`CLOSED_BY_REQUIRED_PERSISTENCE`: do not modify the historical Blocked Record.
The new Owner Corrective Decision must classify its same-user non-Product S6 as
`HISTORICAL_DIAGNOSTIC_SCENARIO` and `NOT_A_FROZEN_V1_RUNTIME_GATE`.

### V-5 — endpoint vocabulary

`CLOSED_BY_REQUIRED_PERSISTENCE`: distinguish
`DETERMINISTIC_PER_USER_LIFECYCLE_PIPE` from
`RANDOM_PER_WORKER_CARRIER_ENDPOINT`; do not use “random authority endpoint” for
both.

## 5. Overdesign disposition

```text
LONG_LIVED_PRODUCT_ATTESTATION_BROKER = NOT_REQUIRED
ASYMMETRIC_WORKER_AUTHORITY_PROTOCOL = NOT_REQUIRED
PRODUCT_LAUNCH_GRANT = NOT_REQUIRED
WINDOWS_SERVICE_V1_0 = OUT_OF_SCOPE
OVERDESIGN_STATUS = CLOSED
```

If future scope requires resistance to hostile processes inside the same
current-user SID, it requires a Whole-V1 OS-principal isolation reassessment.
It is not a local Step 1 add-on.

## 6. Final verdict

The minimal design preserves the V1.0 Harness Desktop productization mainline,
the Worker authority/lifecycle model and the frozen Carrier wire/HMAC contract.
There are no Blocking Findings. The corrected Contract and Amendment require a
targeted persisted-delta review before Step 1 may be re-frozen or implementation
authority restored.
