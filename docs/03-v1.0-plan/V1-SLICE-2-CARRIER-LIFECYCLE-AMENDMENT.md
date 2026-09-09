# V1-SLICE-2 Carrier Lifecycle Amendment

| Field | Value |
|---|---|
| Amendment ID | `V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT-20260908-01` |
| Document Type | `CARRIER_LIFECYCLE_CONTRACT_AMENDMENT` |
| Status | `FROZEN_FOR_STEP1_IMPLEMENTATION` |
| Parent Contract | [V1-SLICE-2 Lifecycle / Native / Reconnect](V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md) |
| Amended Contract | [V1-SLICE-1B Authenticated Physical Carrier](V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT.md) |
| Targeted Delta Re-Review | [AUDIT-020](../05-reviews/architecture/AUDIT-020-V1-SLICE-2-CONTRACT-TARGETED-DELTA-REREVIEW.md) |
| Freeze Authority | [V1-SLICE-2 Contract Freeze and Step 1 Authorization Decision](../04-development-records/V1-SLICE-2-CONTRACT-FREEZE-AND-STEP1-AUTHORIZATION-DECISION.md) |
| Corrective Authority | [V1-SLICE-2 Step 1 Minimal Trusted Discovery Corrective Decision](../04-development-records/V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-DECISION.md) |
| Independent Corrective Review | [AUDIT-021](../05-reviews/architecture/AUDIT-021-V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-REVIEW.md) |
| Minimal Trusted Discovery Persisted Delta Review | [AUDIT-022](../05-reviews/architecture/AUDIT-022-V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-PERSISTED-DELTA-REVIEW.md) |
| Re-Freeze Authority | [V1-SLICE-2 Step 1 Minimal Trusted Discovery Re-Freeze and Re-Authorization Decision](../04-development-records/V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-REFREEZE-AND-REAUTHORIZATION-DECISION.md) |

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED = YES
CREDENTIAL_SEMANTIC_AMENDMENT = YES
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
TARGETED_DELTA_REREVIEW = PASS
MINIMAL_TRUSTED_DISCOVERY_PERSISTED_DELTA_REVIEW = PASS
F_01 = CLOSED
BLOCKING_FINDINGS = NONE
```

This document locally supersedes only the Slice 1B lifecycle and credential
semantics explicitly identified below. It does not rewrite the historical 1B
Contract or change its wire bytes. The Corrective has passed persisted delta
review and is re-frozen for Step 1 implementation. Product implementation is
not started.

## 1. Preserved Slice 1B security and wire semantics

The following remain unchanged and normative:

```text
MAX_JSON_FRAME = 262144
STREAM_INITIAL_CREDITS = 4
STREAM_QUEUE_CAPACITY = 16
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
```

- Protected current-user DACL.
- Existing HMAC domains and canonical transcript field order.
- Existing `uint32-le` plus UTF-8 field encoding.
- Mutual proof, one challenge per connection and one auth attempt per
  connection.
- Renderer exact endpoint is `FORBIDDEN`.
- Renderer secret is `FORBIDDEN`.
- Renderer direct Worker IPC is `FORBIDDEN`.
- Electron Main remains the trusted Carrier boundary.
- HTTP/WebSocket fallback is forbidden.
- Frozen Harness remains unchanged.

No item in this Amendment authorizes a transcript, domain, framing, flow-control
or transport fallback change.

## 2. Precisely superseded semantics

### 2.1 Credential lifetime

Slice 1B worker-epoch secret semantics are superseded for Slice 2 by
`PER_ATTACHMENT` secret semantics.

```text
WORKER_AUTHORITY_IDENTITY = workerInstanceId
WorkerGeneration = DO_NOT_CREATE
CarrierConnectionId = DO_NOT_CREATE
DesktopInstanceId = FRESHNESS_CORRELATION_ONLY
credentialEpoch = PER_ATTACHMENT
clientInstanceId = PER_CONNECTION
```

Generation ownership is normative and preserves the Slice 1B role split:

```text
ATTACHMENT_SECRET_GENERATION_OWNER = NATIVE_HELPER
CREDENTIAL_EPOCH_GENERATION_OWNER = NATIVE_HELPER
CHALLENGE_ID_GENERATION_OWNER = SERVER_HELPER
SERVER_NONCE_GENERATION_OWNER = SERVER_HELPER
CLIENT_NONCE_GENERATION_OWNER = CLIENT_MAIN
CLIENT_INSTANCE_ID_GENERATION_OWNER = CLIENT_MAIN
```

For each new attachment, after validating the lifecycle boundary and reserving
the actual peer process instance, the Native Helper generates and issues a new
32-byte CSPRNG attachment secret and a new unique `credentialEpoch`.

For each Carrier authentication attempt, the server / Native Helper generates a
new `challengeId` and a new one-use `serverNonce`.

For each Carrier connection, Electron Main / `CarrierClient` generates a fresh
`clientNonce` for that authentication connection and a fresh per-connection
`clientInstanceId`.

An old secret or epoch is immediately revoked at detach/failure and is never
reusable. Every challenge ID, server nonce, client nonce and client instance ID
is fresh for its stated attempt or connection scope and is not reusable.
`workerInstanceId` remains the only Worker authority identity; no Worker
generation or Carrier connection identity is created.

### 2.2 Authenticated close

Slice 1B's normal Pipe-close classification as `CARRIER_FAILED` at Worker
terminal scope is superseded only when Helper, Worker, Host and authority are
all healthy. In that bounded case an authenticated attachment close is:

```text
CONNECTION_LOST / DETACHED
```

It terminates only the old unary operations, streams, callbacks, credential and
Client generation. Worker, Host, Helper and authority continue.

Helper exit, Host exit or Worker exit remains:

```text
WORKER_AUTHORITY_FAILURE
```

An unhealthy authority is never converted into an ordinary detach.

## 3. Trusted credential delivery

`CREDENTIAL_GENERATION_AUTHORITY = NATIVE_HELPER`.

The Helper may issue the attachment secret only on a validated lifecycle
control connection. Before issuance it must verify:

1. the current-user-only protected DACL and owner;
2. the actual lifecycle client PID;
3. the actual process creation/start time;
4. protocol/version compatibility;
5. `DesktopInstanceId` freshness/correlation;
6. a fresh nonce; and
7. healthy current Worker, Helper, Host and authority state.

The credential reservation is bound to the actual peer PID/process-start tuple.
The Carrier peer must match that reservation tuple before authentication may
consume the credential. PID/start is process-instance binding and PID-reuse
protection; `DesktopInstanceId` and nonce are freshness/correlation inputs;
protocol/version is compatibility. Peer-reported values are not an independent
identity trust root.

Current-user SID is the V1 local OS trust principal. The Carrier authentication
claim means:

```text
AUTHENTICATED_CARRIER = USER_BOUNDARY + FRESH_CAPABILITY_POSSESSION
```

It does not distinguish hostile processes inside the same SID or claim Product
binary attestation. Canonical executable path and Product metadata, if retained,
are compatibility, diagnostic, release-integrity or defense-in-depth signals,
not credential-issuance security hard gates.

Pending credentials have a short bounded lifetime. Authentication success,
authentication failure, timeout and lifecycle control disconnect each consume
and zeroize the pending credential. Revocation is immediate; retry requires a
fresh attested control connection and new credential.

The secret must never travel through or be stored in:

- Renderer;
- command-line arguments;
- ordinary environment variables;
- Settings or SQLite;
- logs or persistent files; or
- ordinary Evidence.

Evidence may prove lifecycle events and redaction behavior, but may not contain
the credential or secret bytes.

## 4. Sequential attachment server

```text
WORKER_LIFETIME = per-user detached authority epoch
NATIVE_HELPER_LIFETIME = Worker-lifetime
LIFECYCLE_DISCOVERY_PIPE = DETERMINISTIC_PER_USER
CARRIER_ENDPOINT = RANDOM_PER_WORKER_INSTANCE
MAX_ACTIVE_DESKTOP_ATTACHMENTS = 1
```

The deterministic per-user lifecycle discovery pipe is distinct from the random
per-Worker-instance Carrier endpoint. The attachment state machine is:

```text
DETACHED
  -> CREDENTIAL_ISSUED
  -> AUTHENTICATING
  -> ATTACHED
  -> DETACHING
  -> DETACHED
```

The Helper creates one protected Named Pipe server for the random authority
endpoint using `FirstPipeInstance` and `maxInstances = 1`. It retains endpoint
ownership for the Worker-lifetime while accepting only sequential Desktop
attachments.

During a live credential reservation, authentication or authenticated
attachment, a second Desktop receives `BUSY`; it is not queued with shared
credential state. The incoming Pipe peer must match the credential reservation
identity.

For authenticated detach:

1. revoke the old secret and epoch and fence the old Client generation;
2. reject new operations and cancel/drain old Pipe I/O;
3. terminate old unary, stream, callback and settlement routes;
4. disconnect the Pipe instance;
5. fully reset attachment authentication state;
6. fully reset `JsonFrameDecoder` and relay state; and
7. return to `DETACHED` before accepting a fresh reservation.

No buffered byte, decoded frame, credit, callback, relay entry or auth state may
cross the attachment boundary. A stale frame cannot authenticate or affect the
next Client generation.

If the server or endpoint state is unhealthy, the Helper must not attempt
same-endpoint recovery. An unhealthy Helper, Host or Worker ends the authority
and uses authority replacement rules only after the old authority is proven
gone.

## 5. Job and authority mutex

```text
JOB_OWNER = WORKER
JOB_CONTAINS = Host + Helper
AUTHORITY_MUTEX_OWNER = HELPER
```

The Worker owns the Job handle. Host and Helper are contained by that Job.
Worker hard death closes the Job handle, terminates Host and Helper, releases
the Helper-held mutex and ends the authority.

The steady-state mutex holder set is exactly the Helper. Worker and Host are not
holders. A bootstrap duplicate/inherited handle, if technically required, must
be closed before `AUTHORITY_READY`; it confers no ownership and cannot survive
as a second holder.

The Helper must acquire the mutex before authority readiness. Abandoned-mutex
detection is mandatory: abandonment signals loss of the prior authority and
requires fail-closed stale-authority handling before any replacement becomes
ready. A held mutex whose discovery/control identity cannot be authenticated is
also fail closed. No second Worker authority may start while ownership or prior
death is ambiguous.

## 6. Disconnect and generation fence

Carrier authentication remains per physical connection. A successful new
attachment creates a new Client generation. All routes are bound to that
generation. Detach or Carrier loss:

- invalidates the old projection;
- rejects old callbacks and settlements;
- ends old streams and unary operations;
- revokes the old credential; and
- cannot auto-restore any business operation.

Carrier readiness is not Product `CONNECTED`; the Product additionally requires
the current Client generation and completed projection rebuild. Recovery is
discovery/authentication/read-only repull, never Prompt, Tool, Approval,
Question, Cancel or Agent-turn replay.

## 7. Failure rules

- Peer mismatch or stale credential: `CARRIER_AUTH_FAILED` with no fallback.
- Healthy authority attachment loss: `CARRIER_LOST` / `CONNECTION_LOST`, then a
  bounded fresh discovery and credential flow.
- Helper, Host or Worker exit: `WORKER_AUTHORITY_FAILURE`.
- Ambiguous or overlapping authority: fail closed; do not issue a credential.
- Lost mutation response: `OUTCOME_UNKNOWN`, reread Harness truth, no blind
  resend.

## 8. Future Step 1 Gate obligations

Future Evidence must cover one Worker authority; Desktop graceful/crash Worker,
Host and Helper survival; same-Worker reattach with fresh `credentialEpoch`;
`BUSY`; stale/expired/replayed credential rejection; lifecycle/Carrier PID plus
start-time mismatch rejection; sequential reset; Helper/Host crash containment;
Worker hard-crash no orphan; stale/hung authority fail closed; explicit bounded
stop; cross-user lifecycle rejection; Renderer zero direct lifecycle/Carrier
access; protocol/version incompatibility fail closed; endpoint/secret hygiene;
stale generation/callback rejection; and zero authority overlap/no old-child
adoption where applicable. Same-SID hostile-binary, `OpenProcess` theft and
Broker negatives are not V1 gates. This persistence executes none of those
gates.

## 9. Final amendment state

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED = YES
CREDENTIAL_SEMANTIC_AMENDMENT = YES
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
TARGETED_DELTA_REREVIEW = PASS
F_01 = CLOSED
BLOCKING_FINDINGS = NONE
MINIMAL_TRUSTED_DISCOVERY_PERSISTED_DELTA_REVIEW = PASS
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = FROZEN
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = YES
NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP1_LONG_RUNNING_IMPLEMENTATION_GOAL
```
