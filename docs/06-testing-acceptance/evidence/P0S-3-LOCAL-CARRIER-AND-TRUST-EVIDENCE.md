# P0.S-3 Local Carrier + Trust Executor Evidence

Classification: `NOT_PRODUCTION`

Status: `PASS / CLOSED`

Date: 2026-08-31

This file originated as Executor evidence for a disposable feasibility spike.
AUDIT-007 independently confirmed the result, and the Architecture Owner later
accepted the constraints and closed P0.S-3. It remains evidence, not a
production design or implementation authorization.

## Formal Closure

- `P0S3_FORMAL_CLOSURE = PASS`
- `SHACO_FORGE_V1_0_P0S_3 = PASS`
- `P0S3_STATE = CLOSED`
- `P0S3_INDEPENDENT_REVIEW_VERDICT = PASS`
- `P0S3_EXECUTOR_CLAIM_CONFIRMED = YES`
- `RUNTIME_REPRODUCED = YES`
- `P0S3_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT`
- `ARCHITECTURE_OWNER_P0S3_CONSTRAINTS_ACCEPTED = YES`
- `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`
- `P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS`
- `P0S = IN_PROGRESS`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`
- `P0S4 = NOT_STARTED`
- `P0S4_ALLOWED = NO`

Review authority:
`docs/05-reviews/architecture/AUDIT-007-P0S3-INDEPENDENT-REVIEW.md`.
AUDIT-007 records `PASS`, all confirmed gates, the accepted adapter/Core Patch
classification and informational Findings F-01 through F-04. The Review itself
did not close the stage; the Architecture Owner decision above did.

## A. EXECUTOR VERDICT

Historical Executor return before Independent Review and Owner closure:

- `P0S3_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT`
- `P0S3_NAMED_PIPE_CARRIER_FOUNDATION = PROVEN`
- `P0S_UNARY_PASS = YES`
- `P0S3_STREAM_CONCURRENCY_DEMONSTRATED = YES`
- `P0S_LOCAL_TRUST_FEASIBLE = YES`
- `CURRENT_USER_ONLY = YES`
- `COOKIE_NOT_PRODUCT_IDENTITY = YES`
- `RENDERER_DIRECT_PIPE_ACCESS = NO`
- `RENDERER_REUSABLE_WORKER_CREDENTIAL = NO`
- `AUTHENTICATION_BEFORE_GATEWAY = YES`
- `WORKER_IDENTITY_ENDPOINT_VALIDATED = YES`
- `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`
- `ADAPTER_OR_STUB_USED = YES`
- `OWNER_DECISION_REQUIRED = YES`
- `P0S_LOCAL_CARRIER_FEASIBLE = PENDING_P0S4_COMPLETENESS`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `P0S3_STATE = WAITING_REVIEW`
- `P0S4_ALLOWED = NO`

`PROVEN_WITH_CONSTRAINT` is used because the real Named Pipe and real Harness
Gateway unary path are surrounded by disposable C#/PowerShell, inherited-stdio,
Connection-compatibility, Electron IPC and basic-stream adapters. The basic
stream producer proves carrier framing concurrency only. Production ownership,
runtime packaging and the complete P0.S-4 Connection contract remain undecided.

## B. BASELINE

The runner failed closed on every baseline field before starting processes.

| Item | Required | Observed | Result |
| --- | --- | --- | --- |
| Shaco Forge branch | `master` | `master` | PASS |
| Shaco Forge HEAD | `8308b406aff6248b620b9a6a62c66feb7d0aeeb4` | exact match | PASS |
| Shaco Forge pre-run state | clean | clean before Executor edits | PASS |
| Frozen Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` | exact match | PASS |
| Frozen Harness package | `0.1.2-alpha.1` | exact match | PASS |
| Frozen Harness lock SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` | exact match | PASS |
| Frozen Harness state | clean | clean before and after | PASS |

Runtime evidence: Node `v24.18.0`, Electron `35.7.5`, PowerShell `7.6.4`,
Windows `Microsoft Windows NT 10.0.26200.0`. The final run began at
`2026-08-31T06:10:39.9808743+00:00` and completed at
`2026-08-31T06:10:55.0889863+00:00`.

## C. DOCUMENTS READ

The Executor read the applicable repository instructions and the current disk
versions of:

- Document Map, Current State and Document Rules;
- V1.0 Development Map and P0.S Feasibility Spike contract;
- P0-7 Risk Register / P0.S Input Freeze;
- System Architecture, Desktop / Worker Boundary, Harness Integration Boundary
  and Security Model;
- P0.S-1 and P0.S-2 closure evidence;
- the targeted P0-3 sections for `ConnectionHandle`, `rpc.call`, Gateway and
  stream seams;
- the targeted P0-4 sections for pre-Gateway authentication, non-Web local
  trust, current-user identity and BrowserAuth/cookie boundaries;
- the targeted P0-6 sections for public/preview exports, adapters, private
  imports and Core Patch classification.

No broad P0 re-investigation was performed.

## D. SPIKE IMPLEMENTATION

The disposable implementation is under
`docs/04-development-records/experiments/P0S-3-LOCAL-CARRIER-AND-TRUST/` and
every experimental artifact is marked `NOT_PRODUCTION`.

The final path is:

```text
sandboxed Electron Renderer
  -> contextBridge p0s3Bridge.run
  -> allowlisted ipcRenderer.invoke
  -> Electron Main
  -> real Windows Named Pipe
  -> protected-current-user ACL/auth/framing carrier helper
  -> inherited stdin/stdout
  -> dsh --profile shaco-host
  -> Harness typertGateway.invoke("agentPresets/list")
```

The carrier is classified as `SHACO_CUSTOM_CARRIER_PLUGIN`. The protocol uses
one-byte-mode Windows Named Pipe plus an explicit four-byte little-endian byte
length and UTF-8 JSON payload. The Worker allowlist contains only the real
`/api` + `agentPresets/list` unary route, the disposable
`p0s3/basic-stream` probe, and bounded diagnostics. It does not add a second
Agent business RPC.

The Harness profile contains `@deepseek-ai/dsh-base` and the local disposable
bundle. It contains no `dsh-web-app`, Host webserver, Client HMR, browser opener
or BrowserAuth construction.

Implementation iterations that produced useful failure evidence:

1. Combining `.NET PipeOptions.CurrentUserOnly` with explicit `PipeSecurity`
   was rejected by the API. The final probe uses an explicit protected DACL,
   verifies owner/rules after creation and does not claim that option flag.
2. Passing `FullControl` as the API's additional-access-rights argument caused
   Windows `IOException`; using zero additional rights while granting
   `FullControl` only in the protected DACL succeeded.
3. Sequential pipe recreation exposed a transient `ENOENT`; the Main adapter
   now uses bounded retry for `ENOENT`/`EBUSY` only.
4. Peak-working-set sampling initially occurred after Worker exit; it was moved
   before graceful stop.
5. Electron child startup fails inside the command sandbox on this host due to
   GUI/GPU DLL initialization. The final Electron run was therefore executed
   with the approved outside-sandbox GUI permission; it still used only the
   repository Spike and temporary runtime paths.

## E. PROCESS TOPOLOGY

Final-run PIDs:

| Role | PID | Evidence |
| --- | ---: | --- |
| Electron Main | 20108 | owns IPC and Named Pipe client |
| Electron Renderer | 27220 | sandboxed; bridge-only surface |
| Electron utility processes | 29052, 11476 | Electron application descendants |
| Worker carrier helper | 11652 | real Named Pipe server and trust boundary |
| `dsh --profile shaco-host` Worker | 27416 | actual Harness profile and Gateway |

Electron Main and the Worker were independent OS processes. The Worker profile
was launched through the `dsh --profile shaco-host` entry principle. All six
observed PIDs had exited at final cleanup; `residualPids` is empty.

## F. NAMED PIPE AND SID ACL

- Carrier: real Windows Named Pipe, byte transmission mode; no TCP, HTTP,
  WebSocket or in-process substitute.
- Full pipe endpoint: deliberately not persisted. Evidence records only SHA256
  prefix `eee1e73e21659242` and `pipeEndpointRedacted = true`.
- Current-user SID: `S-1-5-21-390745333-3527206759-1879520106-1001`.
- ACL owner SID: the same current-user SID.
- DACL: protected; inheritance disabled; exactly one non-inherited Allow rule
  for the current-user SID with `FullControl`.
- Observed SDDL:
  `O:S-1-5-21-390745333-3527206759-1879520106-1001D:P(A;;0x1f019f;;;S-1-5-21-390745333-3527206759-1879520106-1001)`.
- Result: `currentUserOnly = true` from post-creation security descriptor
  inspection, not from configuration intent alone.

The complete per-run pipe name and the ephemeral authentication material are
absent from committed evidence.

## G. AUTHENTICATION BEFORE GATEWAY

Each connection first receives a server challenge. The client must return:

- protocol version `1`;
- current-user SID;
- Worker instance identity;
- endpoint identity;
- request correlation ID;
- client and server nonces;
- HMAC-SHA256 proof using 32 random bytes generated per Worker start.

The proof binds protocol, SID, Worker identity, endpoint identity, correlation
ID and both nonces. A successful proof transitions the connection to an
explicit authenticated state. Only that state can enter route allowlisting and
business dispatch. The secret is inherited by the local process chain for the
single run, is not exposed to Renderer, is not reusable across starts and is
not persisted in evidence.

Before any successful call, all nine negative cases ran and the diagnostic
counter remained exactly `gatewayDispatchCount = 0`. The Harness-side startup
canary was deliberately disabled (`startupGatewayCanaryExecuted = false`), so
the zero cannot be explained by a reset after a hidden Gateway call. After
positive work, Worker and Harness counters both reached 38 real Gateway
invocations.

No cookie was used or minted. `browserAuthConstructed = false`, Renderer
`document.cookie` was empty, and the product identity proof is independent of
BrowserAuth.

## H. RENDERER ISOLATION

- `nodeIntegration = false`
- `contextIsolation = true`
- `sandbox = true`
- Renderer `require` and `process` types: `undefined`
- Exposed global: only `p0s3Bridge`
- Exposed method: only `run`
- Arbitrary IPC: absent
- Worker transport global: absent
- Pipe path exposed: no
- reusable Worker credential exposed: no
- direct Named Pipe handle/access: no

Renderer sends only an allowlisted request to the preload; Main owns transport,
identity material and correlation. This proves the requested isolation surface,
not a production IPC capability design.

## I. UNARY AND CONCURRENCY

- Actual Harness unary: `/api` -> `agentPresets/list` through
  `typertGateway.invoke`; shipped `standard` preset observed.
- Positive Gateway invocations: 38 total (1 unary canary + 24 concurrent unary
  + 5 payload probes + 8 unary calls mixed with streams).
- Concurrent batch: 24 requests, 24 unique correlation IDs, 24 correctly
  correlated responses, no mismatch and no loss.
- The observed response order happened to equal request order. The Executor
  therefore makes no out-of-order-completion claim.
- Mixed test: 8 real Gateway unary calls while 3 basic stream channels were
  active.
- Basic stream framing: 3 channels, 20 items per channel; all three preserved
  item order and had no channel cross-contamination.

The basic streams come from a deterministic Worker-side Spike adapter. They are
not a proof of the complete Harness stream contract and do not set
`P0S_STREAM_PASS`.

## J. FRAMING AND PAYLOAD EVIDENCE

- Frame: `uint32-le byte length + UTF-8 JSON`.
- Prefix: 4 bytes.
- Maximum JSON frame: 262,144 bytes.
- Oversize probe: 262,145 bytes, rejected fail-closed.
- Payload probes: 0, 1,024, 16,384, 65,536 and 196,608 bytes.
- Largest request: 196,837 JSON bytes; 196,841 framed bytes; 229 JSON-envelope
  bytes plus the 4-byte prefix above the 196,608-byte payload.
- Main parser: 463 inbound data chunks, 420 partial-frame waits, 105 logical
  frames received.
- Main sent 44 logical frames and deliberately fragmented all 44 writes.
- Worker read 56 logical frames using 335 physical reads; all 56 required more
  than one physical read.
- Worker wrote 129 logical frames and deliberately fragmented all 129 writes.
- Electron Main RSS: 96,825,344 bytes before; observed peak/final sample
  102,305,792 bytes.
- Carrier helper peak working set: 190,361,600 bytes.
- `dsh` Worker peak working set: 222,998,528 bytes.

These are bounded feasibility observations on one host, not production limits
or a memory budget.

## K. NEGATIVE SECURITY TESTS

Every decision below occurred before the first positive Gateway dispatch.

| Test | Rejection | Gateway dispatch count at decision |
| --- | --- | ---: |
| unauthenticated request | `unauthenticated-request` | 0 |
| wrong secret/proof | `invalid-proof` | 0 |
| wrong Worker identity | `worker-identity-mismatch` | 0 |
| wrong endpoint identity | `endpoint-identity-mismatch` | 0 |
| wrong current-user SID | `user-sid-mismatch` | 0 |
| malformed JSON frame | `malformed-frame` | 0 |
| 262,145-byte oversize frame | `oversize-frame` | 0 |
| replayed authenticated handshake | `replayed-handshake` | 0 |
| wrong business endpoint | `endpoint-not-allowlisted` | 0 |

Additional exclusions passed: no matching TCP listener, no stock Web stack,
no BrowserAuth/cookie and no residual Electron/Worker process.

## L. ADAPTER AND CORE PATCH INVENTORY

| Surface | Why | PublicOrPreviewSeamUsed | ProductionImpact | Classification |
| --- | --- | --- | --- | --- |
| C# Named Pipe ACL/auth/framing helper | Create and inspect a real protected Windows pipe and fail-closed handshake | public Windows/.NET Named Pipe and ACL APIs | replace or harden under the production Worker/Supervisor ownership model; packaging choice required | `NON_CORE_ADAPTER`, `NOT_PRODUCTION` |
| inherited stdio bridge to `dsh` | Keep the proof on the real profile/Gateway path without changing frozen Harness | OS child-process stdio plus official `dsh --profile` entry | P1/P3 must freeze sidecar ownership, lifecycle and diagnostics | `NON_CORE_ADAPTER`, `NOT_PRODUCTION` |
| non-listening `HostConnectionService` compatibility object | Satisfy the known Layer C Connection service requirement without restoring Web | Harness preview/root export used by the accepted P0.S-1 pattern | production compatibility ownership remains an Owner/P1 decision | `NON_CORE_ADAPTER`, `NOT_PRODUCTION` |
| `carrier-gateway.mjs` dispatcher | Map authenticated carrier envelopes onto existing unary Gateway semantics | Harness public/preview `typertGateway.invoke`; Connection presence verified | production route/error mapping and supervisor contract must be frozen | `SHACO_CUSTOM_CARRIER_PLUGIN`, `NON_CORE_ADAPTER` |
| Electron Main framing/correlation client | Make Main the sole pipe owner and reassemble partial frames | documented Electron IPC plus Node public Named Pipe client | P4 must design a bounded production bridge | `NON_CORE_ADAPTER`, `NOT_PRODUCTION` |
| one-method preload | Prevent Renderer access to transport/path/credential | documented `contextBridge`/`ipcRenderer` | replace with product capability surface in P4 | `NON_CORE_ADAPTER`, `NOT_PRODUCTION` |
| deterministic `p0s3/basic-stream` producer | Prove multiplexed stream framing, order and isolation now | Spike route only; Harness stream methods were observed but not used as proof | discard; P0.S-4 must exercise the real full stream contract | `STUB`, `NOT_PRODUCTION` |

No frozen Harness file was changed. No Harness source deep import or private
source-path import was used. The named carrier required no Harness Core patch,
so `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`. This is not a global Core
Patch conclusion: module, packaging and remaining Connection areas have not all
been tested, therefore `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO` and
`CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` remain unchanged.

## M. TESTS

| # | Test | Result |
| ---: | --- | --- |
| 1 | Shaco and Harness baseline verification | PASS |
| 2 | independent real Main/Worker OS processes | PASS |
| 3 | real Windows Named Pipe path | PASS |
| 4 | security descriptor and current-user SID ACL inspection | PASS |
| 5 | Renderer cannot access pipe path, secret or transport handle | PASS |
| 6 | unauthenticated request rejected; Gateway count 0 | PASS |
| 7 | wrong proof rejected; Gateway count 0 | PASS |
| 8 | wrong Worker/endpoint identity rejected | PASS |
| 9 | handshake replay rejected | PASS |
| 10 | malformed and oversize frames rejected | PASS |
| 11 | authenticated real Harness Gateway unary round-trip | PASS |
| 12 | 24-way unary correlation | PASS |
| 13 | 3 concurrent basic stream channels | PASS |
| 14 | per-stream order and channel isolation | PASS |
| 15 | five payload sizes plus framing metrics | PASS |
| 16 | BrowserAuth cookie not used | PASS |
| 17 | stock `dsh-web-app` and matching TCP listener absent | PASS |
| 18 | no residual Electron/Worker process | PASS |
| 19 | Frozen Harness final clean | PASS |
| 20 | JavaScript syntax, JSON and PowerShell parser checks | PASS |
| 21 | strict UTF-8, BOM, suspicious-text and Markdown checks | PASS |
| 22 | `git diff --check` | PASS |
| 23 | secret/token/credential value scan | PASS; no persisted value/full endpoint |
| 24 | final modification scope allowlist | PASS |
| 25 | no commit and no push | PASS; HEAD unchanged; neither operation performed |

Primary runtime command (exit `0`):

```powershell
./docs/04-development-records/experiments/P0S-3-LOCAL-CARRIER-AND-TRUST/run-spike.ps1 `
  -FrozenHarnessRoot D:\Project\Shaco-Forge-Upstream\deepseek-harness
```

The runner validates the profile, starts the independent processes, executes
all runtime gates, captures evidence, cleans up and rechecks Frozen Harness
cleanliness. JavaScript syntax used `node --check`; JSON used strict parser
loading; PowerShell used its AST parser; C# used the same `Add-Type` compile
path as the runner. Final static checks were executed separately after the
documentation updates.

The formal closure run did not rerun the Spike. AUDIT-007 accurately records
that the external Reviewer machine had no `pwsh` and therefore did not execute
the PowerShell 7 runner unchanged. The Reviewer independently reproduced all
core runtime gates with the same C#/Electron/bundle source and a temporary Node
driver in a repository-external copy. Reviewer file mutation was `NONE`.

## N. EVIDENCE CREATED

- Human-readable authority for this Executor result: this file.
- Redacted machine result:
  `docs/04-development-records/experiments/P0S-3-LOCAL-CARRIER-AND-TRUST/evidence/summary.json`.
- The machine result is `classification = NOT_PRODUCTION`, `result = PASS`,
  includes final source SHA256 values, and does not contain the full pipe
  endpoint or ephemeral secret.
- Independent Review and closure authority:
  `docs/05-reviews/architecture/AUDIT-007-P0S3-INDEPENDENT-REVIEW.md`.

## O. FILES CHANGED

The combined Executor and closure set contains the bounded P0.S-3 Spike
directory with README, Electron page/Main/
preload/Renderer files, profile and bundle configuration, Connection adapter,
Gateway adapter, Windows C#/PowerShell carrier, runner and redacted machine
evidence, plus this human evidence file. Formal closure added AUDIT-007 and
updated only the authorized governance/planning/log/index/Evidence records:

- `docs/00-governance/SHACO-FORGE-CURRENT-STATE.md`
- `docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md`
- `docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md`
- `docs/03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md`
- `docs/04-development-records/DEVELOPMENT-LOG.md`
- `docs/05-reviews/REVIEW-INDEX.md`
- `docs/05-reviews/architecture/AUDIT-007-P0S3-INDEPENDENT-REVIEW.md`

The experiment README remains byte-identical because it is one of the 14
machine-Evidence-protected `sourceSha256` inputs; it contains no conflicting
current status.

No production source, root build configuration, prior Spike/Review/Evidence or
Frozen Harness file was modified.

## P. GIT STATUS

Final scope check reports the original 20 authorized P0.S-3 Executor paths plus
Document Map, Review Index and AUDIT-007: exactly 23 modified or untracked paths.
Branch remains `master`; HEAD remains
`8308b406aff6248b620b9a6a62c66feb7d0aeeb4`. The Executor did not commit or
push. Frozen Harness remains clean at
`cd5ef8148158c3a752a658978873241fdf8e2bbc`.

## Q. CONSTRAINTS AND NON-CLAIMS

- P0.S-3 is `PASS / CLOSED` with Owner-accepted
  `PROVEN_WITH_CONSTRAINT`; this does not make the Spike production code.
- P0.S remains `IN_PROGRESS`; P0.S-4 through P0.S-8 remain `NOT_STARTED`.
- `P0S4_ALLOWED = NO`; this Executor did not begin P0.S-4.
- `P0S_LOCAL_CARRIER_FEASIBLE` remains
  `PENDING_P0S4_COMPLETENESS`, not final `YES`.
- This evidence does not set `P0S_STREAM_PASS`,
  `P0S_EVENT_GENERATION_PASS`, `P0S_APPROVAL_PASS`,
  `P0S_USER_QUESTION_PASS`, `P0S_CANCEL_PASS` or
  `P0S_BINARY_CARRIER_PASS`.
- It does not prove stream open/error/end/cancel semantics, connection loss,
  backpressure, event generation, approval/question settlement, binary transfer
  or complete cancellation. Those remain P0.S-4.
- The basic stream is a deterministic framing stub, not a real Harness stream
  completeness proof.
- The observed concurrency, payload and working-set numbers are evidence inputs
  for P1, not production maxima, SLAs or security limits.
- The C#/PowerShell helper and inherited-stdio topology are disposable. This
  does not authorize bundling PowerShell in the product.
- No claim is made that Named Pipe is an official Harness carrier. Its
  classification remains `SHACO_CUSTOM_CARRIER_PLUGIN`.
- No Fallback A/B switch or Desktop + Worker architecture change was made.

## R. REVIEW AND OWNER RESOLUTION

AUDIT-007 confirmed the protected current-user DACL, local trust flow, Renderer
isolation, real Gateway unary path and basic stream concurrency. The Owner
accepted the registered adapter/stub classifications and
`CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO` for P0.S-3.

Forward routes remain mandatory: P1 must freeze framing limits, handshake,
bounded nonce/replay state, credential handoff and Carrier ownership; P1/P7
must choose a PowerShell 7 prerequisite or replacement without treating this
Spike as product-bundling authorization; P0.S-4 must prove the complete
Connection contract before local carrier feasibility can receive a final
result.

## S. NEXT STEP

`RETURN_TO_ARCHITECTURE_OWNER_FOR_P0S3_CLOSURE_COMMIT`

P0.S-3 is closed. Do not begin P0.S-4 in this closure run.
