# V1-SLICE-1B Authenticated Physical Carrier Contract

Status: FROZEN FOR IMPLEMENTATION
Date: 2026-09-07
Scope: `V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-REAL-CLIENT-HOST-COMMUNICATION`

This Contract persists the Architecture Gate supplied for Slice 1B. It is an
implementation contract, not implementation Evidence, Independent Review, Owner
Closure, or a claim that any Gate has passed.

## 1. Scope and Non-scope

Slice 1B implements the production Windows Named Pipe carrier, mutual
authentication, the bounded Renderer transport adapter, Worker-owned carrier
lifecycle, a Host profile gateway plugin, real Client unary Fetch, real
`$events` streaming, pull-based flow control, deterministic cancellation,
failure truthfulness, and the required security/runtime Evidence.

Provider network calls; Workspace and Session lifecycle; prompt, assistant
content/token streaming, Tool, Approval, User Question and Agent cancel;
reconnect, Worker discovery, restart reattachment and crash recovery; persistent
credential discovery; binary/export; packaging, installer and bundled .NET;
full Settings; Automation; Multi-Agent; and Exactly-Once are out of scope.

## 2. Frozen Process Topology

```text
Harness Client / Renderer
  -> __DSH_TRANSPORT__.fetch/openStream
  -> allowlisted Preload capability
  -> Electron Main
  -> authenticated Windows Named Pipe
  -> thin Native Carrier Helper
  -> bounded carrier relay
  -> Node Worker
  -> dedicated Host carrier bridge
  -> dsh --profile shaco-forge-v1-slice-1b
  -> Host-side Shaco Carrier Gateway Profile Plugin
  -> existing Harness Connection / Typert Gateway / wireStream / $events
```

The implementation must not create a second Agent RPC, start the stock HTTP or
WebSocket transport, modify the Frozen Harness, or import production code from
`packages/**/src`. Only current public, documented, or preview-public exports
may be used.

## 3. Named Pipe and Native Helper

The Helper is C# on `.NET 10`, targets `net10.0-windows`, uses only the BCL and
necessary Win32 P/Invoke, and contains no Harness business semantics. It owns
pipe creation, exact current-user SID discovery, protected DACL creation,
inheritance disablement, owner assignment, post-create ACL inspection, the
first-instance guarantee, handshake, framing, bounded relay and cleanup.

Each Worker epoch receives a never-reused endpoint of the form
`\\\\.\\pipe\\shaco-forge-v1-<cryptographic-random>`. The random component has
at least 128 bits of cryptographic entropy. The endpoint is generated, created,
secured and inspected before trusted publication to Main. Exact endpoints must
never reach Renderer, normal logs, Settings, SQLite, ordinary Evidence or Git;
Evidence may retain only a redacted identity or SHA-256 prefix.

The production Helper source and repeatable .NET 10 build are Slice 1B scope.
Bundled/self-contained runtime packaging remains Slice 3 and cannot be claimed
as PASS here.

## 4. Renderer, Preload and Main Boundary

Renderer remains untrusted with `nodeIntegration=false`,
`contextIsolation=true`, `sandbox=true`, and `webSecurity=true`. It receives no
pipe handle, exact endpoint, epoch secret, Native Helper capability, arbitrary
Worker IPC, Node access, or generic `ipcRenderer.invoke` surface.

Preload exposes only bounded, allowlisted fetch/stream-open/stream-pull/
stream-cancel capabilities. Main revalidates every request. The accepted
logical URLs are `shaco-forge://client/api/...` and
`http://dsh.internal/api/...`; both normalize to channel `/api` and an endpoint
that satisfies the Frozen Harness `assertTarget`-equivalent segment grammar.
Main rejects every other scheme, origin or channel, malformed
`client-request` logical envelope, non-JSON Slice 1B body, and encoded payload
larger than `MAX_JSON_FRAME` before Carrier entry. Helper and Worker repeat
validation as defense in depth.

The existing Client module `loadBundle` path is unchanged. Before
`AppWebEntry.run()`, the shell installs:

```text
__DSH_TRANSPORT__ = { ownsHost: true, fetch, openStream }
```

The custom `fetch` and `openStream` paths may not fall back to stock HTTP or a
stock WebSocket mux.

## 5. Epoch Credential and Private Bootstrap

Electron Main generates 32 cryptographically secure random bytes for one
Worker epoch. It must not transmit the secret through argv, query, persistent
file, Settings, SQLite, Renderer, normal stdout/log/Evidence, or an ordinary
environment variable. Main passes it once through a dedicated inherited
one-shot bootstrap credential pipe/extra stdio handle and closes that channel
after the read. Worker passes it to Helper through an equivalent dedicated
inherited one-shot channel.

Exact endpoint metadata also uses a trusted private control channel distinct
from the normal Worker stdout bootstrap projection. Normal stdout carries only
lifecycle/bootstrap data and no secret, exact pipe endpoint or business
payload. If either dedicated inherited channel cannot be implemented reliably
on Windows/Node, implementation stops with
`SECRET_CHANNEL_IMPLEMENTATION_BLOCKED`.

## 6. Mutual HMAC Authentication

Authentication is the conjunction of a verified current-user protected DACL,
the one-Worker-epoch secret and mutual HMAC-SHA256 challenge/response. States
are `NEW -> AUTH_PENDING -> CLIENT_AUTH_RECEIVED -> SERVER_AUTH_SENT ->
AUTHENTICATED`; timeout is 5000 ms and only one `CLIENT_AUTH` is allowed.

Canonical transcripts encode every field as `uint32-le byteLength` followed by
the UTF-8 field bytes in fixed order. Both sides share deterministic vectors.
The fields are `domain`, `protocolVersion`, `workerInstanceId`, `endpointId`,
`credentialEpoch`, `challengeId`, `serverNonce`, `clientNonce`, and
`clientInstanceId`.

The Client domain is `shaco-forge/client-auth/v1`; the Server domain is
`shaco-forge/server-auth/v1`. The server sends a per-connection unique random
challenge ID and one-use random server nonce. The Client first rejects an
unsupported protocol, then creates a client nonce/instance ID and returns its
proof. The server constant-time verifies the Client proof before producing its
Server proof. The Client constant-time verifies that proof before sending any
business frame. Wrong Client proof closes with Gateway dispatch count zero;
wrong/fake Server proof closes with business frames sent zero.

One connection has one challenge and one auth attempt. A second `CLIENT_AUTH`
is a protocol violation. Success or failure consumes the challenge, and close
destroys nonces, challenge and auth state. A new connection creates new values;
there is no Worker-lifetime unbounded nonce set.

## 7. Framing and Relay Bounds

The JSON lane is `uint32 little-endian byte length + UTF-8 JSON envelope` with
`MAX_JSON_FRAME = 262144`. Its bounded incremental parser is
`READ_LENGTH -> VALIDATE_LENGTH -> READ_PAYLOAD -> PARSE -> VALIDATE_ENVELOPE ->
DISPATCH`. It supports partial reads and writes and enforces frame-completion
timeout. Malformed JSON, invalid envelopes and 262145-byte frames fail closed;
262144-byte frames are accepted. Binary/export is out of scope.

Channels are separated as follows:

- Main/Worker stdout is `BOOTSTRAP_SUPERVISOR_CHANNEL`, lifecycle only.
- Main/Native Helper Named Pipe is `FINAL_PRODUCT_CARRIER`.
- Native Helper/Worker is `AUTHENTICATED_CARRIER_RELAY`, transport/control only.
- Worker/Host is `HOST_CARRIER_GATEWAY_BRIDGE`, separate from readiness stdout
  or strictly and provably demultiplexed; dedicated extra stdio/pipe handles are
  preferred.

The stream constants are `STREAM_INITIAL_CREDITS = 4` and
`STREAM_QUEUE_CAPACITY = 16`.

## 8. Renderer Stream Flow and Cancellation

Renderer-facing streams are pull-based and permit at most one in-flight pull
per stream. Main never sends unsolicited stream items. Renderer consumption of
one item is what permits the next pull and releases Carrier credit. Main's
per-stream queue never exceeds the currently granted Carrier credit window,
preserving Host-to-consumer backpressure.

All three cancellation sources are mandatory: AbortSignal abort, consumer
`break`/`iterator.return()` deterministic cleanup, and Carrier failure. Cleanup
releases Host, Main, Worker and Carrier stream state, credits, buffers and
pending state. Carrier loss is a terminal transport failure and is never
interpreted as Agent cancel.

## 9. Host Profile Plugin and Preflight

Worker materializes the exact `shaco-forge-v1-slice-1b` custom profile and
bundle patch. The Host plugin uses accepted public/preview-public `Connection`,
`createSharedFetchHandler`, `Gateway`, `wireStream`, and `$events` seams. It is
loaded by `dsh --profile`; production Worker must not call in-process `boot()`.

`CARRIER_READY` is prohibited until pipe creation, current-user DACL
post-verification, Host readiness, profile plugin load, fetch handler,
`wireStream`, and `$events` route readiness are all true. Preflight proves
registration/readiness only and cannot execute or fabricate a business result.

## 10. Failure Truthfulness and Lifecycle Hardening

Pipe close, Helper exit or Host exit transitions to `CARRIER_FAILED`; pending
unary requests and active streams receive terminal transport failures and all
state is released. The Desktop shows a truthful disconnected/failed state.
New Client retries fail fast after Carrier failure.

`FROZEN_CLIENT_RETRY != SHACO_RECOVERY`. Slice 1B performs no automatic Worker
restart, Carrier recreation, Desktop reconnect, Agent/session recovery or
implicit Agent cancel; those are later scope.

REVIEW-012 carry-forward handling is frozen: F-02 validates input absolute-path
semantics before canonicalization at every touched existing path/config
boundary; F-03 wraps Host readiness JSON parsing and maps malformed markers
fail-closed; F-04 closes only Worker startup timeout, Worker terminal mapping,
Helper startup timeout/exit/failure mapping and Host pre-ready exit mapping.

## 11. PASS Gates

Implementation requires every unit, Native Helper, integration/runtime and
static/full verification gate enumerated by the Architecture Gate, including:
canonical HMAC vectors and negative impersonation cases; authentication before
business dispatch; replay and timeout; bounded incremental framing; both URL
normalizations and fail-closed admission; pull discipline and all cancellation
sources; .NET 10 build; first-instance, SID owner/DACL/inheritance/rule and
post-create inspection checks; independent Electron/Main, Worker, Helper and
Host processes; no Product TCP listener; real frozen `dsh --profile`; loaded
Host plugin and route preflight; real pinned Client mount; real custom Client
`fetch` with at least one real unary (prefer `agentPresets/list`); real custom
`openStream` with `$events.ready`; Renderer isolation; truthful Carrier failure;
full cleanup; secret/endpoint hygiene; Frozen Harness cleanliness; TypeScript
typecheck, Product build, unit tests, Worker/Electron/1B smokes, static/theme
verification and `git diff --check`.

Every command, exit code and result must be recorded. No mock, fixture or fake
RPC success may satisfy a real business Gate.

## 12. Stop Conditions

Implementation stops without a workaround if it requires Frozen Harness
modification or source deep imports; direct Renderer pipe/secret access; TCP or
BrowserAuth; a second Agent RPC; an unverifiable protected current-user DACL;
an unreproducible .NET 10 Helper or Product PowerShell `Add-Type`; an insecure
Main-to-Worker or Worker-to-Helper secret channel; inability to traverse the
full custom Fetch or `$events` stream path; inability to load the accepted Host
profile plugin; a new external dependency; a dirty Frozen Harness; or Product
Source that did not match the frozen Slice 1A baseline before work.

On stop, real diffs and Evidence remain visible and the result identifies the
exact condition, evidence, changed files, tests and worktree state.

## 13. Architecture Gate Finding Dispositions

- `B-1 = FROZEN_CONTRACT_REQUIREMENT`; it may be marked satisfied only by the
  complete Implementation Gate Evidence.
- `NF-1` through `NF-5 = FROZEN_NON_BLOCKING_REQUIREMENTS`; their final
  implementation Evidence disposition is pending the corresponding Gates and
  is not preclaimed by this Contract.
- `NF-6 = OPEN_NON_BLOCKING`; it remains open after Slice 1B implementation and
  must not be silently closed.

## 14. Completion State

Only after every Implementation Gate passes may Current State become
`IMPLEMENTED_WAITING_INDEPENDENT_REVIEW` with implementation result `PASS`,
Independent Review `NOT_STARTED`, Owner Closure `NOT_PERFORMED`, baseline
`NOT_FROZEN`, overall Slice 1 `IN_PROGRESS`, and next action
`INDEPENDENT_REVIEW_V1_SLICE_1B`. This implementation performs no Independent
Review, Owner Closure, commit, push or automatic staging.
