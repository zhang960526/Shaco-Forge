# V1-SLICE-2 Carrier Lifecycle Amendment

| Field | Value |
|---|---|
| Amendment ID | `V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT-20260908-01` |
| Document Type | `CARRIER_LIFECYCLE_CONTRACT_AMENDMENT` |
| Status | `OWNER_ACCEPTED_CANDIDATE_WAITING_TARGETED_DELTA_REVIEW` |
| Parent Contract | [V1-SLICE-2 Lifecycle / Native / Reconnect](V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md) |
| Amended Contract | [V1-SLICE-1B Authenticated Physical Carrier](V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT.md) |

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED = YES
CREDENTIAL_SEMANTIC_AMENDMENT = YES
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
```

This document locally supersedes only the Slice 1B lifecycle and credential
semantics explicitly identified below. It does not rewrite the historical 1B
Contract, change its wire bytes, or grant Slice 2 implementation authority. It
is a Step 1 Contract prerequisite awaiting independent targeted delta review.

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
DesktopInstanceId = DISCOVERY_ATTESTATION_ONLY
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

For each new attachment, after trusted Desktop attestation, the Native Helper
generates and issues a new 32-byte CSPRNG attachment secret and a new unique
`credentialEpoch`.

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
control connection after peer-process attestation. Before issuance it must
verify:

1. the protected current-user DACL;
2. the peer PID;
3. process creation time;
4. canonical executable path;
5. Product identity;
6. `DesktopInstanceId`; and
7. a fresh nonce.

The credential reservation is bound to the verified peer PID/process-start
tuple. Same-user SID is a prerequisite only, not sufficient authentication.
The Carrier peer must match the reservation identity before authentication may
consume the credential.

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
CARRIER_ENDPOINT = one random endpoint per workerInstanceId
MAX_ACTIVE_DESKTOP_ATTACHMENTS = 1
```

The attachment state machine is:

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

Future Evidence must cover single authority, sequential reattachment, a `BUSY`
second Desktop, peer mismatch, stale/expired credential, complete reset/drain,
stale-frame rejection, Helper/Host/Worker crashes, no orphan Host and zero
authority overlap. This persistence executes none of those gates.

## 9. Final amendment state

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED = YES
CREDENTIAL_SEMANTIC_AMENDMENT = YES
WIRE_HMAC_CHANGED = NO
CARRIER_WIRE_SECURITY_AMENDMENT_REQUIRED = NO
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_IMPLEMENTATION_AUTHORIZATION = NO
NEXT_ACTION = INDEPENDENT_V1_SLICE_2_CONTRACT_TARGETED_DELTA_REVIEW
```
