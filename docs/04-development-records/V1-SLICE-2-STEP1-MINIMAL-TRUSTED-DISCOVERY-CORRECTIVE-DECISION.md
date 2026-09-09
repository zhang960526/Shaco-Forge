# V1-SLICE-2 Step 1 Minimal Trusted Discovery Corrective Decision

| Field | Value |
|---|---|
| Decision ID | `V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-20260909-01` |
| Document Type | `ARCHITECTURE_OWNER_SECURITY_SCOPE_CORRECTIVE` |
| Status | `OWNER_ACCEPTED_FOR_CONTRACT_PERSISTENCE_WAITING_TARGETED_DELTA_REVIEW` |
| Decision Date | `2026-09-09` |
| Decision Owner | Architecture Owner |
| Independent Corrective Review | [AUDIT-021](../05-reviews/architecture/AUDIT-021-V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-REVIEW.md) |
| Product Implementation | `NOT_PERFORMED` |

## 1. Owner decision

```text
V1_LOCAL_TRUST_PRINCIPAL = CURRENT_WINDOWS_USER_SID
SAME_USER_HOST_COMPROMISE = OUT_OF_SCOPE
AUTHENTICATED_CARRIER = USER_BOUNDARY + FRESH_CAPABILITY_POSSESSION
PRODUCT_APPLICATION_IDENTITY_SECURITY_HARD_GATE = REMOVED
CANONICAL_EXECUTABLE_PATH = COMPATIBILITY_DIAGNOSTIC_DEFENSE_IN_DEPTH
PRODUCT_BINARY_IDENTITY_REQUIRED_FOR_V1_LOCAL_AUTHORIZATION = NO

LONG_LIVED_PRODUCT_ATTESTATION_BROKER = DO_NOT_CREATE
ASYMMETRIC_WORKER_AUTHORITY_PROTOCOL = DO_NOT_CREATE
PRODUCT_LAUNCH_GRANT = DO_NOT_CREATE
WINDOWS_SERVICE_V1_0 = OUT_OF_SCOPE
```

The Architecture Owner accepts `CURRENT_WINDOWS_USER_SID` as the V1 local OS
trust principal. A current-user-only protected OS boundary plus possession of a
fresh per-attachment capability is the complete V1 authenticated-Carrier claim.
It is not Product binary attestation and does not promise to distinguish every
process executing under the same SID.

Canonical executable path and Product metadata may remain only as
compatibility, diagnostics, release-integrity or defense-in-depth signals. They
must not block V1 credential issuance under a claim of security authentication.

## 2. Same-user scope boundary

`SAME_USER_HOST_COMPROMISE = OUT_OF_SCOPE` includes:

- a same-SID malicious process deliberately implementing the legal protocol;
- a same-SID malicious process using an internal Product binary to construct an
  attack topology;
- `PROCESS_VM_READ`, `PROCESS_VM_WRITE` and `PROCESS_DUP_HANDLE` access;
- debugger or injection access;
- theft of memory, secrets or handles from a legitimate Product process;
- a compromised current-user token; and
- deliberate same-SID denial of service.

If resistance to this class becomes a future requirement, the Architecture
Owner must reassess Whole-V1 OS-principal isolation. It is not a local Step 1
Broker, asymmetric protocol or launch-grant requirement.

Renderer remains untrusted. Its isolation comes from sandboxing, the narrow
Main/Preload allowlist and zero direct lifecycle/Carrier access, not from a
different Windows SID.

## 3. Selected minimal trusted discovery

The only accepted Step 1 trusted-discovery model is:

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

The lifecycle pipe has a deterministic per-user identity. The Carrier endpoint
is random per Worker instance. The terms must remain distinct:

```text
LIFECYCLE_DISCOVERY_PIPE = DETERMINISTIC_PER_USER
CARRIER_ENDPOINT = RANDOM_PER_WORKER_INSTANCE
```

## 4. Preserved authority and ownership

```text
WORKER_AUTHORITY_IDENTITY = workerInstanceId
WorkerGeneration = DO_NOT_CREATE
CarrierConnectionId = DO_NOT_CREATE
JOB_OWNER = WORKER
JOB_CONTAINS = Host + Helper
AUTHORITY_MUTEX_OWNER = HELPER
MAX_ACTIVE_DESKTOP_ATTACHMENTS = 1
```

Worker, Helper, Host, Job, mutex, health/fail-closed and sequential-attachment
semantics remain unchanged. The lifecycle peer is bound to its actual PID and
process start time for process-instance identity and PID-reuse protection.
`DesktopInstanceId` and nonce are freshness/correlation inputs only;
protocol/version fields are compatibility inputs. No peer-reported value is an
independent identity trust root.

The Helper may reserve and issue a fresh credential only when the protected
current-user lifecycle boundary, actual peer instance, compatibility,
freshness/correlation, authority health and available attachment state have
been validated. The reservation remains bound to the actual PID/process-start
tuple. TTL, consume, revoke and zeroize behavior remains unchanged.

## 5. Historical Blocked Record disposition

The historical
[Step 1 Desktop Attestation Blocked Record](V1-SLICE-2-STEP1-DESKTOP-ATTESTATION-BLOCKED-RECORD.md)
must not be rewritten. Its `STEP1_DESKTOP_ATTESTATION_IMPLEMENTATION_BLOCKED`
stop was correct under the then-frozen Contract, and its generic Electron probe
remains truthful diagnostic evidence.

The current disposition of its same-user non-Product S6 is:

```text
S6_same_user_non_product_peer = HISTORICAL_DIAGNOSTIC_SCENARIO
S6_same_user_non_product_peer = NOT_A_FROZEN_V1_RUNTIME_GATE
```

That scenario correctly triggered an Architecture Owner scope reassessment. It
is no longer a V1 pass requirement after the Owner-authorized threat-model
corrective that establishes the current-user SID as the V1 trust principal.
This Decision does not alter the original evidence or historical stop result:

```text
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = STOPPED_BLOCKED
```

## 6. Step 1 boundary and future Gate

```text
STEP1_CONNECTION_END_STATE = CARRIER_READY
```

Step 1 does not require Product `CONNECTED`, Workspace cold projection, Session
cold recovery, the full reconnect UI state machine or Worker replacement
recovery. Those remain Step 2 scope.

The future Step 1 Gate retains one Worker authority; Desktop graceful/crash
survival; same-Worker reattach with fresh `credentialEpoch`; `BUSY`; stale,
expired and replayed credential rejection; lifecycle/Carrier PID plus start-time
mismatch rejection; sequential reset; Helper/Host crash containment; Worker
hard-crash no-orphan behavior; stale/hung authority fail closed; bounded stop;
cross-user lifecycle rejection; Renderer zero direct lifecycle/Carrier access;
protocol/version incompatibility fail closed; endpoint/secret hygiene; stale
generation/callback rejection; and zero authority overlap/no old-child adoption
where applicable.

Same-SID hostile-binary negatives, `OpenProcess` theft negatives and Broker
negatives are not V1 gates.

## 7. Contract and implementation state

This Decision explicitly authorizes corrective modification of the previously
frozen Main Contract and Carrier Lifecycle Amendment. It does not authorize
Product implementation, Step 2, Step 3, Provider work or runtime execution.

```text
V1_SLICE_2_ARCHITECTURE_CONTRACT = CORRECTED_CANDIDATE_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = CORRECTED_CANDIDATE_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_2_MINIMAL_TRUSTED_DISCOVERY_CORRECTIVE_REVIEW = PASS
V1_SLICE_2_MINIMAL_TRUSTED_DISCOVERY_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = SUSPENDED_PENDING_CORRECTIVE_REFREEZE
V1_SLICE_2_STEP1 = CORRECTIVE_PERSISTED_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_STEP2 = NOT_AUTHORIZED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V_1_PERSISTENCE_OBLIGATION = CLOSED
V_2_PERSISTENCE_OBLIGATION = CLOSED
V_3_PERSISTENCE_OBLIGATION = CLOSED
V_4_PERSISTENCE_OBLIGATION = CLOSED
V_5_PERSISTENCE_OBLIGATION = CLOSED
NEXT_ACTION = INDEPENDENT_MINIMAL_V1_STEP1_TRUSTED_DISCOVERY_PERSISTED_DELTA_REVIEW
```

## 8. Decision basis

- [Shaco Forge V1.0 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md)
- [V1.0 Mainline and Step 1 Scope Reconciliation Decision](V1-0-MAINLINE-AND-STEP1-SCOPE-RECONCILIATION-DECISION.md)
- [V1-SLICE-2 Lifecycle / Native / Reconnect Architecture Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
- [V1-SLICE-2 Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
- [Shaco Forge Security Model](../02-architecture/SHACO-FORGE-SECURITY-MODEL.md)
- [AUDIT-021](../05-reviews/architecture/AUDIT-021-V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-REVIEW.md)
