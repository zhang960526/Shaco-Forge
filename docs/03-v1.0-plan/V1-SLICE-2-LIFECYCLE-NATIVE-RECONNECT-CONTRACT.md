# V1-SLICE-2 Lifecycle / Native / Reconnect Architecture Contract

| Field | Value |
|---|---|
| Contract ID | `V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-20260908-01` |
| Document Type | `V1_SLICE_ARCHITECTURE_CONTRACT` |
| Status | `OWNER_ACCEPTED_CANDIDATE_WAITING_TARGETED_DELTA_REVIEW` |
| Product baseline | `74d62cc6ae3dd7e690f0acffc6a0aa0eb741319c` |
| Frozen Harness baseline | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Carrier amendment | [V1-SLICE-2 Carrier Lifecycle Amendment](V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md) |
| Independent input | [AUDIT-019](../05-reviews/architecture/AUDIT-019-V1-SLICE-2-CORRECTIVE-V2-ARCHITECTURE-REREVIEW.md) |
| Owner decision | [V1-SLICE-2 Architecture Owner Decision](../04-development-records/V1-SLICE-2-ARCHITECTURE-OWNER-DECISION.md) |

```text
V1_SLICE_2_ARCHITECTURE = CONTRACT_PERSISTED_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_IMPLEMENTATION_AUTHORIZATION = NO
NEXT_ACTION = INDEPENDENT_V1_SLICE_2_CONTRACT_TARGETED_DELTA_REVIEW
```

This document persists the Architecture Owner-accepted Corrective V2 design. It
is a candidate Contract awaiting an independent targeted delta review. It does
not start Product implementation, authorize a Provider run, or convert a planned
gate into completed Evidence.

## 1. Goal and ownership

Without copying Harness business truth, automatically replaying business
actions, or weakening the frozen Carrier wire/security semantics, Slice 2 shall
deliver:

- a Windows per-user long-running Worker authority;
- Desktop independence;
- trusted discovery and sequential reattachment;
- connection recovery;
- cold Workspace/Session projection;
- the outer Shaco Sidebar;
- Native Picker; and
- Approval, Question and Cancel projection.

Harness remains the sole owner of Provider, Model, Credential, Workspace,
Session, Conversation, Tool, Permission, Approval and Question truth. Shaco may
hold only the explicitly bounded ephemeral projections described here.

## 2. Scope

### 2.1 In scope

#### A. Worker Authority and Trusted Discovery

- One per-user detached Worker authority, identified by `workerInstanceId`.
- Helper-held authority mutex and Worker-owned Job containment.
- A protected discovery/control pipe with Desktop peer attestation.
- Worker health, bounded stop, sequential Desktop attachment and fail-closed
  prevention of split brain.

#### B. Connection Recovery and Cold Projection

- Discovery, attach and reattach; Carrier loss and normal detach.
- Authenticated reconnect with Client-generation fencing.
- Rejection of stale callbacks and settlement; cleanup of old stream/unary work.
- Workspace/Session repull, Worker crash/replacement handling and cold Session
  projection.
- Truthful failure reporting with no business replay.

#### C. Outer Shell, Native and Interaction

- Outer Fixed Function Area, New Chat, Project Directory and Global Settings.
- Native Picker.
- Approval and Question projection, Agent Session Cancel and failure projection.

#### D. Minimal compatibility handshake

Only identities actually required to fail closed before credential issuance are
within Slice 2. Final packaging compatibility remains outside this Slice.

### 2.2 Out of scope

- Final packaging, installer, bundled-runtime release mechanism, final controlled
  `DSH_HOME` packaging layout, update, rollback and Fresh Windows acceptance.
- Automation; Task/Step/Attempt Product domain; Planner; Reviewer pipeline;
  Multi-Agent; Shaco Provider framework.
- Credential, Workspace, Session or Conversation stores/copies; a generic
  Adapter framework; Dynamic Cordis; plugin marketplace.
- Windows Service, login auto-start and final pixel polish.

No out-of-scope item is an implicit prerequisite or authorization.

## 3. Three-step implementation boundary

The only candidate internal implementation route is:

1. `STEP_1_WORKER_AUTHORITY_AND_TRUSTED_DISCOVERY`
2. `STEP_2_CONNECTION_RECOVERY_AND_COLD_PROJECTION`
3. `STEP_3_OUTER_SHELL_NATIVE_AND_INTERACTION_INTEGRATION`

No fourth or fifth step may be inferred. The Carrier Lifecycle Amendment is a
`STEP_1_CONTRACT_PREREQUISITE`. Implementation remains not started and is not
authorized by this Contract.

## 4. Worker authority and lifecycle

```text
WORKER_AUTHORITY_IDENTITY = workerInstanceId
WorkerGeneration = DO_NOT_CREATE
CarrierConnectionId = DO_NOT_CREATE
DesktopInstanceId = DISCOVERY_ATTESTATION_ONLY
WORKER_LIFETIME = per-user detached authority epoch
NATIVE_HELPER_LIFETIME = Worker-lifetime
CARRIER_ENDPOINT = one random endpoint per workerInstanceId
MAX_ACTIVE_DESKTOP_ATTACHMENTS = 1
JOB_OWNER = WORKER
JOB_CONTAINS = Host + Helper
AUTHORITY_MUTEX_OWNER = HELPER
```

The Worker owns the Job handle and places Host and Helper in that Job. Worker
hard death closes the Job handle, kills Host and Helper, releases the Helper's
mutex handle and ends the authority. Helper owns the authority mutex handle;
Worker and Host do not hold it. Any temporary inherited/duplication handle used
during bootstrap must be closed before authority readiness and must never become
an additional steady-state holder.

Authority is ready only after Helper has acquired the mutex and the control
identity is verified. Abandoned mutex acquisition is detected as stale-authority
evidence, never treated as continuity of the old authority. Recovery may clean
up only after proving the old Job/Worker authority is gone. If the mutex is held
but its control identity cannot be verified, discovery fails closed. A second
Worker authority is forbidden, including during replacement.

Worker, Helper, Host and authority health are independently classified. Stop is
bounded. An unhealthy server must not try to recover on the same endpoint; an
unhealthy Helper, Host or authority ends in `WORKER_AUTHORITY_FAILURE`.

## 5. Trusted discovery and credential issuance

The Native Helper is the credential-generation authority. Before issuing any
credential it must validate all of the following on the lifecycle control
connection:

- protected current-user DACL;
- peer PID and process creation time;
- canonical executable path and Product identity;
- `DesktopInstanceId`; and
- a fresh nonce.

Same SID is only `PRECONDITION_ONLY`, not complete authentication. The secret is
delivered only over that validated lifecycle control connection and is bound to
the verified peer PID/process-start tuple.

Authentication-field generation ownership is explicit:

```text
ATTACHMENT_SECRET_GENERATION_OWNER = NATIVE_HELPER
CREDENTIAL_EPOCH_GENERATION_OWNER = NATIVE_HELPER
CHALLENGE_ID_GENERATION_OWNER = SERVER_HELPER
SERVER_NONCE_GENERATION_OWNER = SERVER_HELPER
CLIENT_NONCE_GENERATION_OWNER = CLIENT_MAIN
CLIENT_INSTANCE_ID_GENERATION_OWNER = CLIENT_MAIN
```

After trusted Desktop attestation, Native Helper generates and issues the fresh
per-attachment 32-byte CSPRNG secret and unique `credentialEpoch`. For each
Carrier authentication attempt, server / Native Helper generates the fresh
`challengeId` and one-use `serverNonce`. For each Carrier connection, Electron
Main / `CarrierClient` generates the fresh `clientNonce` for that authentication
connection and the fresh per-connection `clientInstanceId`. All values remain
fresh and non-reusable within their stated scopes. Old secret/epoch values are
never reusable. A pending credential has a short bounded lifetime and is
consumed and zeroized on any auth success, auth failure, timeout or control
disconnect.

The credential and secret must not pass through Renderer, argv or ordinary
environment variables, and must not enter Settings, SQLite, logs, persistent
files or ordinary Evidence.

Detailed generation ownership, wire preservation and locally superseded
lifecycle semantics are normatively governed by the
[Carrier Lifecycle Amendment](V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md).

## 6. Sequential attachment

The single-endpoint attachment state machine is:

```text
DETACHED
  -> CREDENTIAL_ISSUED
  -> AUTHENTICATING
  -> ATTACHED
  -> DETACHING
  -> DETACHED
```

The protected Named Pipe server is initially created with `FirstPipeInstance`
and `maxInstances = 1`. During any active reservation, authentication or
attachment, a second Desktop receives `BUSY`. The incoming peer must match the
credential reservation identity.

After authenticated detach, old I/O is drained or cancelled before disconnect;
the pipe is disconnected; attachment auth state, `JsonFrameDecoder` and relay
state are completely reset. Old secrets/epochs are immediately revoked. No
stale frame may cross an attachment boundary, and callbacks from an old Client
generation are rejected.

## 7. Reconnect state machine

```text
DISCONNECTED
DISCOVERING
WORKER_STARTING
AUTHENTICATING
CONNECTED
CONNECTION_LOST
RECONNECTING
INCOMPATIBLE
FAILED
```

`CONNECTED` is permitted only when all three predicates hold:

```text
AUTHENTICATED_CARRIER
+ CURRENT_CLIENT_GENERATION_READY
+ PROJECTION_REBUILD_COMPLETE
```

Carrier readiness alone is not Product-connected state. Carrier loss or normal
detach invalidates the old generation, its projection, callbacks and settlement
authority; terminates its streams and unary operations; and never silently
restores them. Authenticated reconnect creates a new Client generation and
rebuilds the projection from current Harness truth.

### 7.1 Recovery and replay boundary

```text
CONNECTION_RECOVERY != BUSINESS_REPLAY
```

Automatically allowed operations are discovery, authentication, read-only
repull, follow/list/history rebuild and bounded reconnect. Worker replacement is
conditional on proof that the old authority is definitely gone.

Automatic Prompt, Tool, Agent-turn, Approval, Question or Cancel replay is
forbidden. Implicit Session-resume mutation is forbidden. When a mutation
response is lost, report `OUTCOME_UNKNOWN`, reread Harness truth and never blind
resend. This Contract makes no global exactly-once promise.

## 8. Same-context Product composition

There is exactly one `AppWebEntry`, one Cordis root `Context` and one Harness
Session truth. Product composition is exactly 28 Frozen Harness static rows plus
one Shaco static Client row, for `TOTAL_ROWS = 29`. The Shaco row uses its public
`./client` built export and lazy-CJS loader registration.

Dynamic Cordis is forbidden. Imports from Frozen `packages/**/src` are
forbidden. No second AppWebEntry, Context, Remote, Workspace/Session store or
conversation truth is permitted.

### 8.1 Composition identity gate

`FROZEN_HARNESS_BASELINE_IDENTITY` and
`PRODUCT_EXTENDED_CLIENT_COMPOSITION_IDENTITY` are distinct. Before Step 3
implementation, its Contract Gate must freeze:

- Frozen Harness commit;
- exact 28 row IDs and order;
- each Frozen row's public export and bundle SHA-256;
- Shaco row ID, public export and bundle SHA-256;
- `TOTAL_ROWS = 29`, graph revision and canonical Product composition manifest
  SHA-256; and
- fail-closed behavior for any duplicate or missing row.

At this persistence point the Shaco implementation row and future bundle bytes
do not exist; their identity/hash fields are
`TO_BE_FROZEN_BEFORE_STEP3_IMPLEMENTATION`. No future hash is invented here.

## 9. Outer UI allocation

```text
FINAL_V1_0_OUTER_SHACO_SIDEBAR = REQUIRED
FINAL_V1_0_OUTER_NEW_CHAT = REQUIRED
FINAL_V1_0_OUTER_PROJECT_DIRECTORY = REQUIRED
FINAL_V1_0_OUTER_GLOBAL_SETTINGS_ENTRY = REQUIRED
```

The Harness internal sidebar does not satisfy these final V1.0 deliverables.
The same-context Shaco static row uses public slot mechanics to shadow `sidebar`
and render the Fixed Function Area, Project Directory and Global Settings.
Harness Main Workspace continues to provide Conversation, Composer, Tool,
Approval and Question UI.

Before Step 3 begins, its Gate must freeze the exact seat name, exact priority,
current Frozen occupant, Shaco row identity, the public semantics of
`ctx.sessions.open -> conversation`, and proof that no fiber/service is lost.

### 9.1 Outer New Chat

When a Workspace is selected, Outer New Chat must reuse the real Harness
Session creation/open semantics. When none is selected, it starts the Open
Project/Workspace flow. It must use the current legal, preset-aware `ui-session`
create path; a bare lower-level create path that can produce
`agent-preset-invalid` is forbidden.

### 9.2 Outer Project Directory

Data comes only from Harness Workspace and Session truth. Shaco stores only an
`EPHEMERAL_GENERATION_FENCED_PROJECTION`. It may support search, Workspace
grouping, expand/collapse, Session list/select and optional per-project New Chat.
It must not create a second Workspace or Session truth.

### 9.3 Outer Settings thin surface

The path is `Outer Settings entry -> Shaco ephemeral route -> shell.overlay ->
thin Settings surface`. The public Harness-owned services are `settingsScope`,
`settingsSchema`, `remote.settings`, `remote.llm` and `remote.credentials`.

Harness owns schema, revision fencing, validation, credential persistence,
Provider/model configuration truth and final settings persistence. Shaco owns
only draft, selected tab, loading, error and ephemeral view state.

`PUBLIC_PROGRAMMATIC_OPEN_SETTINGS = NO`. DOM click, private React state, source
deep import and a second settings truth are forbidden. Before Step 3, the Gate
must map each required V1.0 section—Provider, Custom Provider, Model, API
Endpoint, Relay, Credential and necessary General settings—to confirmed public
capabilities. Missing public coverage is a stop condition, not permission to
scrape private UI.

## 10. Native Picker

The only allowed flow is:

```text
Electron Main showOpenDialog
  -> narrow Preload
  -> path | null
  -> same-context Shaco row
  -> Harness Workspace create/open
```

Renderer receives no generic filesystem, `stat`, `readFile` or directory
enumeration capability. Harness remains the Workspace-truth owner.

## 11. Approval, Question and Cancel

Harness owns pending and settlement truth. Outer Shaco projection references
only current Client generation, Harness Session ID and Harness interaction event
ID. Carrier disconnect is not Agent Cancel. On unknown settlement outcome the
Product rereads Harness truth and performs no replay.

## 12. Persistence, logs and packaging boundary

```text
CONTROL_STORE_REQUIRED_IN_SLICE2 = NO
SHACO_LOG_DIR_OWNER = PRODUCT
DSH_HOME_FOR_SHACO_LOGS = FORBIDDEN
SLICE3_PACKAGING_PREREQUISITE_REQUIRED = NO
```

Authority uses OS mutex plus control pipe; Workspace/Session persistence is
Harness-owned; reconnect bookkeeping is ephemeral. Slice 2 creates no empty
SQLite table.

The recommended development log location is `%LOCALAPPDATA%\Shaco Forge\logs`.
This freezes ownership, not a final release path. Slice 2 may use an explicitly
configured current `DSH_HOME` only as lifecycle/recovery test identity. Slice 3
owns the final packaged controlled `DSH_HOME` layout.

## 13. Conditional Provider Gate

```text
PROVIDER_GATE_REQUIRED = CONDITIONAL
PROVIDER_GATE_OWNER = STEP_2_CONNECTION_RECOVERY_AND_COLD_PROJECTION
```

If separately authorized, the Gate proves only lifecycle composition: an active
real Agent turn survives Desktop detach/crash through Worker/Host continuity,
new attachment and result projection. It must not re-prove Provider capability.
This Contract does not authorize that Gate. Every real Provider run requires a
separate Architecture Owner authorization and bounded attempt budget.

## 14. Failure taxonomy

- `WORKER_NOT_FOUND`
- `WORKER_START_TIMEOUT`
- `WORKER_CRASHED`
- `WORKER_IDENTITY_MISMATCH`
- `WORKER_VERSION_INCOMPATIBLE`
- `CARRIER_AUTH_FAILED`
- `CARRIER_LOST`
- `RECONNECT_FAILED`
- `HARNESS_HOST_START_FAILED`
- `HARNESS_SESSION_RECOVERY_FAILED`
- `NATIVE_PICKER_FAILED`
- `HARNESS_FAILURE`
- `PROVIDER_FAILURE`
- `OUTCOME_UNKNOWN`

Failure ownership is truthful: Provider failure must never be projected as
Worker failure.

## 15. Future test and Evidence Contract

These are future Gate definitions only. No test in this section is executed by
this persistence.

### Step 1

- Worker single instance; Desktop close/crash with Worker survival; same Worker
  reattach.
- Stale/hung authority; `BUSY` second attachment; peer identity mismatch; stale
  credential; sequential disconnect/reconnect.
- Helper crash, Host crash and Worker hard crash; no orphan Host; zero authority
  overlap.

### Step 2

- Carrier loss, rediscovery and reattach; new Client generation; stale callback
  rejection; old stream/unary termination.
- Workspace/Session repull; Worker replacement; cold Session projection.
- No Prompt, Tool or settlement replay; correct `OUTCOME_UNKNOWN` behavior.

### Step 3

- Exact 29-row composition; Outer New Chat; Project Directory; Settings thin
  surface.
- Native Picker success/cancel/failure; Approval/Question projection; Agent
  Cancel distinction; truthful failure attribution.

## 16. Stop conditions

Stop without workaround or scope expansion if any of the following is required
or observed:

- Frozen Harness modification or a dirty Frozen Harness.
- Any change to Carrier HMAC transcript bytes or other frozen wire/security
  semantics.
- Current-user security cannot support trusted credential reattachment.
- The same-context static Shaco row cannot be composed.
- A second Workspace/Session truth is required.
- Outer Settings requires private React state or DOM scraping.
- Reconnect requires Prompt/Tool replay.
- Worker authority cannot fail closed.
- Native Picker expands Renderer into generic filesystem access.
- A Control Store must copy Harness truth.
- Slice 3 Packaging becomes a large Slice 2 prerequisite.

## 17. Targeted delta review boundary

The single next action compares this Contract and its Amendment against
Corrective V2 and AUDIT-019, checking for scope drift, security drift, UI
reduction, finding omission and wire-contract mutation. It neither creates an
implementation prompt nor begins Step 1.

```text
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2_IMPLEMENTATION_AUTHORIZATION = NO
NEXT_ACTION = INDEPENDENT_V1_SLICE_2_CONTRACT_TARGETED_DELTA_REVIEW
```
