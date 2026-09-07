# V1-SLICE-1B Authenticated Physical Carrier Implementation Record

Status: IMPLEMENTED_WAITING_INDEPENDENT_REVIEW

Implementation Result: PASS

Date: 2026-09-07

## 1. Initial Baseline

Before the first Product edit:

| Item | Verified value |
|---|---|
| Product branch | `master` |
| Product HEAD | `1eef07d4310d963608cb6067d13f36e5e58f916d` |
| Product worktree | clean |
| Current State | Slice 1 `IN_PROGRESS`; 1A `CLOSED` / `FROZEN`; 1B `NOT_STARTED` |
| Frozen Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Frozen Harness worktree | clean |
| .NET SDK | `10.0.302`, MSBuild `18.6.11`, Host `10.0.10`, `win-x64` |

The Slice 1B Contract was persisted before Product implementation. Frozen
Harness stayed untouched and clean throughout.

## 2. Implemented Topology

```text
real pinned Harness Client / Renderer
→ __DSH_TRANSPORT__.fetch + openStream
→ bounded Preload capability
→ Electron Main admission + Carrier owner
→ mutually authenticated current-user Windows Named Pipe
→ thin .NET 10 Native Helper
→ bounded Helper↔Worker relay
→ dedicated Worker↔Host inherited bridge
→ dsh --profile shaco-forge-v1-slice-1b
→ Host profile Carrier Gateway plugin
→ existing Connection / Gateway / wireStream / $events
```

The stdout channel remains lifecycle-only and carried zero Agent business
traffic. Exact endpoint metadata uses a separate fd 4 channel. Epoch secrets use
one-shot inherited fd 3 channels. No TCP, BrowserAuth, generic IPC, second Agent
RPC, Frozen Harness source import or automatic reconnect was added.

## 3. Files Modified

### Root and contracts

- `.gitignore` — ignores local 1B runtime evidence and Native Helper build output.
- `package.json` — adds Carrier/failure smoke commands and complete unit roster.
- `packages/contracts/src/index.ts` — exports Carrier contract and new bootstrap phases.
- `packages/contracts/src/carrier.ts` — canonical HMAC, framing, URL/envelope/stream admission and bounds.
- `packages/contracts/src/carrier.test.ts` — fixed vectors, mutual proof, frames and admission tests.

### Native Helper

- `apps/native-carrier/ShacoForge.NativeCarrier.csproj` — BCL-only `net10.0-windows` executable.
- `apps/native-carrier/Program.cs` — secure Named Pipe, ACL inspection, mutual HMAC, framing, relay and cleanup.

### Desktop

- `apps/desktop/scripts/prepare-harness-client.mjs` — installs frozen Client transport before public Client module evaluation.
- `apps/desktop/src/main/main.ts` — bounded IPC admission, Carrier lifecycle, evidence, truthful failure and safe Window cleanup.
- `apps/desktop/src/main/carrier-client.ts` — Main-owned authenticated Carrier, unary and pull-stream state.
- `apps/desktop/src/main/carrier-client.test.ts` — pull, queue and Carrier-loss cleanup regressions.
- `apps/desktop/src/main/window-lifecycle.ts` — explicit Window/WebContents lifecycle guards.
- `apps/desktop/src/main/window-lifecycle.test.ts` — destroyed-target and pre-destroy snapshot regressions.
- `apps/desktop/src/main/worker-supervisor.ts` — one-shot secret/control channels, Helper metadata, timeout and expected/unexpected exit semantics.
- `apps/desktop/src/main/worker-supervisor.test.ts` — config, timeout, deliberate stop and unexpected exit tests.
- `apps/desktop/src/preload/preload.cts` — four narrow transport capabilities only.
- `apps/desktop/src/renderer/global.d.ts` — bounded bridge and transport evidence types.
- `apps/desktop/src/renderer/main.ts` — waits for real Client transport provenance and reports evidence.
- `apps/desktop/src/renderer/transport.ts` — formal custom fetch/openStream pull adapter.
- `apps/desktop/tests/transport.test.ts` — iterator-return and AbortSignal cancellation tests.
- `apps/desktop/test-fixtures/supervisor-worker.mjs` — bounded Supervisor lifecycle test process.
- `apps/desktop/tsconfig.test.json` — includes transport tests.

### Worker and Host profile

- `apps/worker/src/config.ts` and `config.test.ts` — Native Helper path plus input-before-canonicalization F-02 fix.
- `apps/worker/src/index.ts` — Helper/Host ownership, private channels, relay demux, preflight and failure mapping.
- `apps/worker/src/profile.ts` — materializes the exact 1B profile and plugins.
- `apps/worker/src/host-readiness-marker.ts` and `.test.ts` — bounded fail-closed F-03 parser.
- `apps/worker/src/host-carrier-preflight.ts` and `.test.ts` — Worker-side validation of complete `$events` probe evidence and CARRIER_READY withholding regression.
- `apps/worker/host-profile/connection-compatibility.mjs` — public `HostConnectionService` compatibility without BrowserAuth.
- `apps/worker/host-profile/carrier-gateway.mjs` — public Connection fetch and Typert wireStream bridge with credits/cancel.
- `apps/worker/host-profile/events-route-preflight.mjs` and `.test.mjs` — bounded real `$events` open/ready/cleanup probe and negative coverage.

### Build, smoke and documentation

- `scripts/build.mjs`, `runtime-paths.mjs`, `tool-runner.mjs` — .NET build and Helper runtime identity.
- `scripts/smoke-carrier.mjs` — Native/auth/framing/negative carrier gates.
- `scripts/smoke-worker.mjs` — Helper + Host plugin/preflight topology gate.
- `scripts/smoke-electron.mjs` — isolated Electron profile, normal and failure runtime evidence.
- `scripts/verify-static.mjs` — scans C# and project files with existing boundaries.
- `docs/03-v1.0-plan/V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT.md` — frozen implementation Contract.
- `docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md` — minimal Contract/record/evidence index.
- `docs/06-testing-acceptance/evidence/V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-EVIDENCE.md` — durable gate evidence.
- This record — exact implementation, corrections, tests and limitations.
- `docs/00-governance/SHACO-FORGE-CURRENT-STATE.md` — implementation-only state transition after all gates passed.

## 4. Security and Transport Result

The current-user protected DACL, owner SID, disabled inheritance,
first-instance creation and post-create inspection all passed. Endpoint entropy
is 128 bits. Main's 32-byte secret never uses argv, environment, persistent
file, Renderer, stdout or evidence. Client and Server proofs use constant-time
verification and fixed canonical vectors. An authenticated Carrier remains
healthy while idle beyond five seconds; once a frame begins, incomplete length
or payload bytes time out fail closed.

Real unary consumer: frozen `AppWebEntry.run()` Client boot. Exact observed
endpoints: `settings/describe`, `session/modelCatalog`, `session/list`. The
request travels Client fetch → Preload → Main admission → Named Pipe → Helper →
Worker → Host plugin → `createSharedFetchHandler('/api')` → real Gateway.

Real stream consumer: frozen Client `$events`. Observed endpoints:
`session/control`, `workspace/follow`, `$events`. `$events.ready` returned
through `typertGateway.wireStream.open` and the full Carrier.

Renderer pull in-flight maximum is one; initial credit is four; no unsolicited
push exists. AbortSignal and iterator.return send deterministic cancel; Carrier
failure terminates pending operations and clears queues. Final normal metrics
show zero active streams and zero pending unary requests.

## 5. Failure Truthfulness and Lifecycle Corrective

Helper/Host/Worker unexpected exit maps to `CARRIER_FAILED`; pending unary and
streams fail with transport errors. New attempts fail quickly after Carrier
loss. No Agent cancel is inferred, and no Worker restart, Carrier recreation,
rediscovery, reconnect or Agent resume is attempted.

A real Electron cleanup bug was reproduced: Evidence destroyed BrowserWindow,
then deliberate Worker stop emitted a false failure and attempted IPC through
destroyed WebContents. The correction:

1. guards BrowserWindow and WebContents lifecycle before projection IPC;
2. snapshots URL and other Window evidence before destruction, then clears Main ownership;
3. distinguishes deliberate Supervisor stop from unexpected child exit;
4. preserves unexpected-exit, startup-timeout, Helper and Host failure mapping.

Unit regressions and both Electron smoke modes pass; no `Object has been
destroyed` remains.

## 6. Architecture Owner Pre-Review Corrective

Architecture Owner's read-only pre-review sanity pass found that
`apps/worker/host-profile/carrier-gateway.mjs` emitted
`eventsRouteReady: true` immediately after resolving the standard preset. That
literal was not derived from registration or route execution and therefore did
not satisfy the Contract's fail-closed `$events` readiness prerequisite. The
earlier implementation and runtime PASS facts remain valid for their tested
scope, but the original preflight readiness claim was insufficient before this
corrective.

The frozen Gateway exposes no public registration-introspection seam. Its
public `TypertGatewayWireStream.open` contract does expose the exact bounded
carrier-independent route seam, so the Host profile now calls:

```js
ctx.typertGateway.wireStream.open('$events', { args: {} }, controller.signal)
```

The probe has a 1,500 ms overall open/first-item deadline and validates the
same exact opening shape used by the frozen Client: precisely `type`,
`clientId`, and `host`; `type === 'ready'`; non-empty `clientId`; and precisely
one string `host.home`. Client and Host identities are used only for validation
and are never returned in evidence. In `finally`, the probe always aborts its
controller and requires bounded `iterator.return()` completion. Only then can
it report `activeStreamsAfterCleanup: 0` and
`eventSubscriptionRetained: false`.

The Host emits `eventsRouteReady` from the validated probe result plus minimal
structured evidence. Worker revalidates every required field, including zero
residual streams, no retained subscription, no Client metric attribution and
zero business operations. Missing or fake metadata, absent/service-unavailable
route, wrong first frame, early end, timeout, missing/failed iterator cleanup,
or nonzero residual state fails closed before `carrier-ready` is written.

This is Host control-plane readiness. It has no Main metric sink and does not
run Workspace, Session, Prompt, Tool or any other user operation. Electron
runtime evidence separately records probe `clientRuntimeMetricCounted=false`
and Main's later real Client `eventsReadyObserved=1`.

## 7. Test Ledger

| Command | Exit | Final result |
|---|---:|---|
| `dotnet build apps\native-carrier\ShacoForge.NativeCarrier.csproj -c Release --no-restore` | 0 | PASS |
| exact Node 22.19.0 `scripts/typecheck.mjs` | 0 | PASS |
| exact Node 22.19.0 `scripts/build.mjs` with explicit Harness root | 0 | PASS |
| exact Node 22.19.0 `--test` affected events/Worker roster | 0 | PASS, including all negative and withholding cases |
| exact Node 22.19.0 `--test` complete 12-target roster | 0 | PASS, 46/46 top-level; 56/56 including nested cases |
| exact Node 22.19.0 `scripts/smoke-carrier.mjs` | 0 | PASS |
| exact Node 22.19.0 `scripts/smoke-worker.mjs` | 0 | PASS |
| exact Node 22.19.0 `scripts/smoke-electron.mjs` | 0 | PASS |
| failure env + exact Node 22.19.0 `scripts/smoke-electron.mjs` | 0 | PASS |
| exact Node 22.19.0 `scripts/verify-static.mjs` | 0 | PASS, 77 files |
| exact Node 22.19.0 `scripts/verify-theme.mjs` | 0 | PASS |
| `git diff --check` | 0 | PASS |

## 8. Failures Encountered and Corrections

- Native Helper first build: nullable warning-as-error. Corrected explicit ACL owner typing.
- Inherited-handle probe: async FileStream rejected a synchronous inherited handle. Corrected to synchronous handle semantics.
- First Electron run in command sandbox: GUI/GPU process blocked. Reran the actual GUI gate under approved desktop execution.
- Runtime cancellation probes blocked frozen Client completion. Kept the production cancellation implementation and moved deterministic sources to bounded unit tests.
- Generated transport placement after Client evaluation stalled because the pinned Client reads the seam during module evaluation. Restored pre-module transport installation without altering `loadBundle`.
- Electron lifecycle: destroyed WebContents received a failure projection during deliberate cleanup. Applied the lifecycle corrective above.
- Protocol mismatch smoke initially asserted a narrower diagnostic. Carrier Client now reports unsupported protocol before constructing/sending proof.
- Corrective Electron normal smoke first ran inside the command sandbox and the GPU process repeatedly exited with `-1073741515`; that attempt failed. The same exact gate was rerun in the approved desktop execution environment and passed, followed by a passing failure-injection run.

None of these attempts is represented as a PASS. Final commands were rerun.

## 9. Final Corrective Runtime

The final normal Electron run recorded Main `41744`, Worker `15112`, Host
`42336`, and Helper `22084`. Its Host preflight evidence is:

```json
{
  "endpoint": "$events",
  "opened": true,
  "readyObserved": true,
  "readyShapeValid": true,
  "cancelled": true,
  "iteratorClosed": true,
  "activeStreamsAfterCleanup": 0,
  "eventSubscriptionRetained": false,
  "clientRuntimeMetricCounted": false,
  "businessOperationsPerformed": 0
}
```

The later real Desktop Client path independently recorded
`eventsReadyObserved=1`, 5 unary requests, 3 stream opens, 6 pulls and 11
authenticated business frames. Final Client state was zero active streams and
zero pending unary requests; observed Product processes owned no TCP listener;
all children exited. The final failure-injection run recorded Main `31276`,
Worker `25864`, Host `14852`, Helper `20824`, the same successful preflight,
then truthful `carrier-failed` with no Worker restart, Carrier recreation,
implicit Agent cancel or Shaco recovery.

## 10. Remaining Limits and Findings

- Packaging/self-contained .NET runtime, bundled Node/Harness and installer remain Slice 3.
- Provider calls, Workspace/Session lifecycle, prompt/content/tool/approval/question and Agent cancel remain out of 1B.
- Reconnect, discovery, recovery and restart remain Slice 2/later lifecycle scope.
- Frozen Client CSP `unsafe-eval`/`unsafe-inline` remains F-05 known constraint.
- REVIEW-012 F-01 remains Slice 3; F-02, F-03 and F-04 touched subsets are corrected; F-05 through F-10 retain their recorded dispositions.
- `NF-6 = OPEN_NON_BLOCKING`.
- Independent Review has not started. Owner Closure has not occurred. Baseline is not frozen.

## 11. Result

- `V1_SLICE_1B_IMPLEMENTATION_RESULT = PASS`
- `V1_SLICE_1B = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW`
- `V1_SLICE_1B_INDEPENDENT_REVIEW = NOT_STARTED`
- `V1_SLICE_1B_OWNER_CLOSURE = NOT_PERFORMED`
- `V1_SLICE_1B_BASELINE = NOT_FROZEN`
- `V1_SLICE_1 = IN_PROGRESS`
- No Commit, Push or staging was performed.

## 12. C-1 / C-2 Pre-Review Implementation Corrective (2026-09-07)

Corrective result: PASS. This section is the latest implementation checkpoint.
Sections 6-9 retain the earlier $events corrective execution facts and its
runtime identities. Earlier smokes did not cover queued items followed by a
terminal frame, a queued undefined value, or an unconnected Helper waiting for
Host readiness longer than five seconds. Their PASS results did not establish
these boundaries.

### C-1: item preservation and terminal credit

The original PullStreamBuffer.finish() stored the terminal and then cleared
queue. Therefore stream-item A, stream-item B, stream-end/error before a
Renderer pull discarded both already-received items. pull() also tested the
result of shift() against undefined, incorrectly treating a queued undefined
item as absence.

finish() now records the first remote terminal without clearing queue. pull()
checks queue.length, drains every item (including undefined), and only then
delivers end/error. cancel() is a distinct immediate-discard operation used by
CarrierClient.cancelStream(); fail() continues to clear queue and reject a
pending pull. Thus AbortSignal/iterator-return/consumer-break cancellation
retains its existing fast cleanup.

CarrierClient.pullStream() checks buffer.terminalObserved before granting
credit. Active item consumption grants one credit; after remote terminal,
draining old items grants none. Stream ownership is retained until the queue
has drained and the terminal is delivered, then removed.

The actual Product PullStreamBuffer and CarrierClient tests passed 14/14
(11 new cases). The CarrierClient tests authenticate a local Named Pipe peer,
drive the production wire decoder and observe the actual outgoing credits;
they do not replace production dispatch or buffer logic. Both normal end and
normal error preserve A/B before terminal, undefined is preserved, local
cancel/failure discard state, active consumption sends exactly one credit,
terminal draining sends zero, and final active stream count is zero.

### C-2: accept lifetime, authentication and frame deadlines

Program.cs previously passed the shared TimeoutMs=5000 to
WaitForConnectionAsync as well as authentication and frame completion. Real
startup ordering is Helper metadata + Host boot/readiness + exact profile
plugin/$events preflight -> Worker carrier-ready -> Supervisor.start()
resolution -> Main Pipe connection. Reusing auth timeout implicitly limited
Host cold startup to five seconds despite the 90,000 ms Worker startup gate.

Pipe accept now has no authentication deadline. It is constrained by the
Worker-owned inherited relay pipe: the first Worker frame read is started on
a task because the inherited Windows handle is synchronous. While waiting for
connection/authentication, EOF or invalid premature business input ends the
Helper. After authentication, that same first-frame task becomes the first
normal relay read, so it never competes with a second reader or consumes and
drops a business frame. This also works when Windows kills Worker without
executing its JavaScript signal handler.

AuthHandshakeTimeoutMs=5000 bounds challenge write, CLIENT_AUTH read and
SERVER_AUTH write with one linked handshake deadline. FrameCompletionTimeoutMs
=5000 begins only after the first frame byte. BootstrapTimeoutMs=5000 remains
separate. Authenticated idle waiting does not run a frame deadline.

Actual Native Helper smoke results:

| Boundary | Observed result |
|---|---|
| No Client for longer than 5000 ms, then mutual authentication | PASS; delayed connection 5308 ms |
| Authenticated idle longer than 5000 ms, then real relay | PASS; idle 5202 ms |
| Connected peer omits CLIENT_AUTH | PASS; closed after 5022 ms; zero relay bytes |
| Authenticated peer sends only a partial frame | PASS; closed after 5020 ms; zero relay bytes |
| WorkerSupervisor startup timeout while actual Helper awaits Client | PASS; Worker and Helper exited |
| WorkerSupervisor.stop while actual Helper awaits Client | PASS; Worker and Helper exited |

The delayed-connect test is the authorized controlled equivalent for slow Host
startup; it runs the actual built Native Helper. The lifecycle fixture uses
the actual WorkerSupervisor and Native Helper and deliberately withholds
carrier-ready; it does not claim to delay a real Harness Host.

### Files changed in this corrective only

- apps/desktop/src/main/carrier-client.ts: normal terminal preservation,
  explicit cancellation, and credit suppression after terminal.
- apps/desktop/src/main/carrier-client.test.ts: 11 new Product-class regressions.
- apps/native-carrier/Program.cs: accept lifetime and separate deadlines.
- apps/desktop/test-fixtures/supervisor-native-wait-worker.mjs: actual Helper
  waiting under a controlled slow-start Worker process.
- scripts/smoke-carrier.mjs: real delayed-connect/idle/timeout measurements,
  actual Supervisor stop/startup-timeout cleanup, and bounded test cleanup.
- This record, the durable Evidence, and Current State: record C-1/C-2 without
  rewriting earlier checkpoints.
- EOF-only hygiene in events-route-preflight.mjs, host-carrier-preflight.ts
  and host-carrier-preflight.test.ts; their logic is unchanged.

### Final verification and runtime

Complete unit roster: 57 top-level / 67 including nested cases, all PASS.
Product build, TypeScript, .NET Release --no-restore, carrier/Worker/Electron
normal/Electron failure smokes, static (78 files), theme, diff, strict UTF-8
(46 changed/untracked text files, no BOM or suspicious text), residual process
check and Frozen Harness clean check all PASS. Exact commands and exit codes
are preserved in durable Evidence section 10.

Normal runtime captured at 2026-09-07T13:17:47.591Z: Main 21596, Worker 46392,
Host 46796, Helper 30092. Failure runtime captured at
2026-09-07T13:18:27.523Z: Main 44872, Worker 31812, Host 45772, Helper 7976.
Both retained the real $events preflight with zero residual preflight streams,
separate real Client eventsReadyObserved=1, 5 unary requests, 3 stream opens,
6 pulls and 11 business frames. Final streams/unary were zero and Product TCP
listeners were empty. Normal shutdown did not claim Carrier failure; injected
failure retained carrier-failed with no automatic restart/recreation/recovery.
Final independent process query found zero residual Product processes.

No test/build/runtime gate failed in this corrective. One patch application
attempt failed to match a context line and was corrected before testing.
The initial sandboxed read-only CIM process query was denied; the approved
desktop query and final zero-process assertion succeeded. Existing build
warnings and shutdown transport rejections remain visible; neither is
represented as a new test failure or hidden. Previous GPU failures remain
historical and were not repeated in this run.

The additional no-index whitespace scan over untracked files initially failed
(exit 3): three pre-existing $events preflight EOF blank lines and Markdown
trailing spaces (including the newly appended state lines). Only those
whitespace bytes were removed; the complete whitespace and UTF-8 gates were
rerun. The $events preflight logic and tests were preserved.
Its affected preflight roster was rerun after EOF cleanup: 23/23 PASS. A final
cross-repository Git check under the sandbox identity hit dubious ownership;
the same read-only Harness HEAD/status check under approved owner execution
passed without changing safe.directory or any repository configuration.

Product master / HEAD 1eef07d4310d963608cb6067d13f36e5e58f916d is unchanged.
Frozen Harness cd5ef8148158c3a752a658978873241fdf8e2bbc is clean.
No staging, Commit, Push, Independent Review or Owner Closure was performed.
V1_SLICE_1B remains IMPLEMENTED_WAITING_INDEPENDENT_REVIEW; Independent Review
NOT_STARTED; Owner Closure NOT_PERFORMED; baseline NOT_FROZEN.
