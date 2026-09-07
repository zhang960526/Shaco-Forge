# V1-SLICE-1B Authenticated Physical Carrier Evidence

Status: IMPLEMENTATION PASS / WAITING INDEPENDENT REVIEW

Date: 2026-09-07

Scope: authenticated Windows Named Pipe carrier and real pinned Harness Client ↔ Host communication

## 1. Bound Identity

| Item | Observed value |
|---|---|
| Product branch / initial HEAD | `master` / `1eef07d4310d963608cb6067d13f36e5e58f916d` |
| Initial Product worktree | clean |
| Frozen Harness | `cd5ef8148158c3a752a658978873241fdf8e2bbc`; final worktree clean |
| .NET SDK / Host | `10.0.302` / `10.0.10`, `win-x64` |
| Native Helper target | `net10.0-windows` |
| Electron / Worker Node | `35.7.5` / `22.19.0` |
| Harness Client | `@deepseek-ai/dsh-client-web@0.1.2-alpha.1`, public `AppWebEntry` |

No Frozen Harness file, lockfile, dependency version, global configuration or
Git index was changed.

## 2. Physical Carrier and Authentication

The .NET Helper creates a per-Worker-epoch pipe with a 128-bit random suffix,
`FirstPipeInstance`, owner=current-user SID, protected DACL, inheritance
disabled, one explicit current-user FullControl Allow rule, and no broad Allow
rule. The effective descriptor is inspected after pipe creation and the exact
endpoint is released only through the private inherited metadata channel.

Main creates a 32-byte epoch secret and sends it once over inherited fd 3 to
Worker. Worker sends it once over inherited fd 3 to Helper. The value is absent
from argv, environment, files, Renderer, stdout and evidence. Exact pipe names
are absent from normal stdout and evidence; evidence stores only a hash prefix
and redaction booleans.

Authentication uses the frozen length-prefixed UTF-8 transcript and mutual
HMAC-SHA256. Tests prove fixed Client/Server vectors, correct proof acceptance,
wrong Client proof rejection, wrong Server proof rejection, protocol mismatch
before Client proof, single CLIENT_AUTH, timeout, and zero Worker-facing relay
bytes for unauthenticated/malformed/oversize cases.

Native Helper gate result:

| Gate | Result |
|---|---|
| .NET 10 reproducible build | PASS, 0 warnings / 0 errors |
| Pipe creation / 128-bit endpoint / first instance | PASS |
| Owner SID / protected DACL / disabled inheritance | PASS |
| Current-user Allow / no broad Allow / post-inspection | PASS |
| Mutual HMAC / wrong Client / wrong Server | PASS |
| Handshake timeout / frame-completion timeout / idle preservation | PASS |
| Second auth / malformed / oversize | PASS |
| Partial read / partial write | PASS |
| Helper cleanup | PASS |

## 3. Real Client Transport Provenance

The exact consumer is the frozen public `AppWebEntry.run()` Client graph. Its
natural boot performs these real unary requests through the new transport:

- `settings/describe`
- `session/modelCatalog`
- `session/list`

The exact unary chain is:

```text
AppWebEntry / frozen Client Remote
→ __DSH_TRANSPORT__.fetch
→ allowlisted Preload transport.fetch
→ Main URL + envelope admission
→ authenticated Named Pipe
→ Native Helper bounded relay
→ Worker dedicated Host bridge
→ Host profile plugin
→ Connection.createSharedFetchHandler('/api')
→ real Harness Gateway
→ Response back to Client
```

The natural Client also opened `session/control`, `workspace/follow`, and
`$events`. The exact stream chain is:

```text
frozen Client $events consumer
→ __DSH_TRANSPORT__.openStream('$events', ...)
→ pull-based Preload/Main capability
→ authenticated Named Pipe
→ Worker dedicated Host bridge
→ typertGateway.wireStream.open('$events', ...)
→ real $events.ready
→ Client iterator
```

Normal Electron evidence observed 5 unary requests, 3 stream opens, 6 pulls,
11 authenticated business frames and one real `$events.ready`. No mock,
fixture, fake success, stock HTTP server or WebSocket mux participated.

## 4. Real `$events` Preflight Corrective

Architecture Owner's pre-review sanity check found that the first implementation
of `carrier-gateway.mjs` used a literal `eventsRouteReady: true`. That proved
neither registration nor route readiness. Consequently, the pre-corrective
preflight claim is explicitly insufficient even though the later real Client
path did observe `$events.ready`.

Frozen Harness public declarations expose no route-registration introspection,
but do expose `ctx.typertGateway.wireStream.open`. The corrected Host preflight
uses that public API with exact endpoint `$events`, payload `{ args: {} }` and a
dedicated `AbortSignal`. It consumes one real opening item and accepts only the
exact frozen ready shape: `{ type: 'ready', clientId: <non-empty string>, host:
{ home: <string> } }`.

Final redacted evidence:

```json
{
  "eventsRouteReady": true,
  "eventsRouteProbe": {
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
}
```

The probe has a 1,500 ms open/first-ready deadline. Its `finally` path always
aborts and requires bounded `iterator.return()` completion; cleanup failure is
fatal. Targeted tests prove valid ready PASS, missing opener failure,
`service-unavailable`, wrong frame, early end, timeout, abort, iterator return,
no residual stream, cleanup failure, metric separation, Worker rejection of
literal/incomplete/fake metadata, and CARRIER_READY withholding.

The preflight is Host control-plane traffic and has no reference to Main's
Client metric object. Final normal runtime separately shows preflight
`clientRuntimeMetricCounted=false` and the later full physical Carrier Client
metric `eventsReadyObserved=1`; neither fact is used to impersonate the other.

## 5. Renderer, Flow Control and Cleanup

- BrowserWindow: `nodeIntegration=false`, `contextIsolation=true`,
  `sandbox=true`, `webSecurity=true`.
- Renderer bridge keys are exactly bounded bootstrap, evidence and transport
  capabilities; there is no generic `invoke`.
- Renderer has no Node global, direct Worker transport, pipe access, pipe name
  or reusable secret.
- One pull per stream is permitted; Main never pushes unsolicited stream items.
- Initial Carrier credits are 4; Main's queue cannot exceed granted credit even
  though the absolute queue capacity is 16.
- AbortSignal and iterator-return cancellation are unit-proven. Carrier loss
  rejects pending pulls and releases all buffered/pending state.
- Final normal evidence: `finalActiveStreams=0`, `finalPendingUnary=0`.

## 6. Runtime Topology and Failure Truthfulness

Normal run:

| Process | PID |
|---|---:|
| Electron Main | 41744 |
| Worker Node | 15112 |
| dsh Host | 42336 |
| Native Helper | 22084 |

All identities were distinct. No TCP listener was owned by observed Product
processes. Worker smoke independently proved frozen `dsh --profile
shaco-forge-v1-slice-1b`, profile plugin loaded, Fetch handler ready,
wireStream ready, `$events` route ready and `stockWebStarted=false`.

The failure run first completed the same real Client traffic, then terminated
the test Helper. Evidence observed `carrier-failed` with `Native Helper exited
(1)`, Main final projection `carrier-failed`, pending Client operations failed
as transport failures, and all child processes exited. Automatic Worker
restart, Carrier recreation, Shaco recovery and implicit Agent cancel were all
false. Frozen Client retry attempts remain Client transport behavior and do not
constitute Shaco recovery.

The Electron lifecycle corrective is covered by unit and runtime evidence:
destroyed Window/WebContents receive no projection IPC or URL reads; Evidence
snapshots Window state before destruction; deliberate Supervisor stop does not
publish Carrier Failure; unexpected exit still does; finalization completes
without `Object has been destroyed`.

## 7. Commands and Results

All Node commands used the exact Node 22.19.0 executable at
`C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe`.

| Command | Exit | Result |
|---|---:|---|
| `dotnet build apps\native-carrier\ShacoForge.NativeCarrier.csproj -c Release --no-restore` | 0 | PASS; 0 warnings, 0 errors |
| `node.exe scripts/typecheck.mjs` | 0 | PASS |
| `SHACO_FORGE_HARNESS_ROOT=... node.exe scripts/build.mjs` | 0 | PASS; graph 27, React 18.3.1, 346 Vite modules |
| `node.exe --test <events probe and Worker validation targets>` | 0 | PASS; all corrective positive/negative cases |
| `node.exe --test <12 complete test targets>` | 0 | PASS; 46/46 top-level, 56/56 including nested cases |
| `node.exe scripts/smoke-carrier.mjs` | 0 | PASS |
| `node.exe scripts/smoke-worker.mjs` | 0 | PASS |
| `node.exe scripts/smoke-electron.mjs` | 0 | PASS |
| `SHACO_FORGE_SMOKE_INJECT_CARRIER_FAILURE=1 node.exe scripts/smoke-electron.mjs` | 0 | PASS |
| `node.exe scripts/verify-static.mjs` | 0 | PASS; 77 files |
| `node.exe scripts/verify-theme.mjs` | 0 | PASS; 20 semantic tokens |
| `git diff --check` | 0 | PASS |

Resolved attempts remain failures, not PASS claims: an early Helper build had
a nullable compile error; an inherited-handle probe used asynchronous
FileStream semantics against a synchronous Windows handle; initial sandboxed
Electron launch was blocked by GUI/GPU sandboxing; Renderer cancellation probes
interfered with frozen Client lifetime; repeated Electron runs exposed the
confirmed destroyed-WebContents cleanup bug; and the first new protocol-mismatch
carrier smoke expected a narrower error string. Each was corrected and the
listed final gates were rerun.

During this corrective, the first normal Electron gate inside the command
sandbox failed because the GPU process exited with `-1073741515`. This was not
counted as PASS. The exact gate was rerun under approved desktop execution and
passed; the failure-injection gate then also passed.

## 8. Local Raw Evidence

- `docs/04-development-records/evidence/V1-SLICE-1B/runtime/electron-runtime.json`
- `docs/04-development-records/evidence/V1-SLICE-1B/runtime/electron-runtime.png`
- `docs/04-development-records/evidence/V1-SLICE-1B/runtime/carrier-failure-runtime.json`
- `docs/04-development-records/evidence/V1-SLICE-1B/runtime/carrier-failure-runtime.png`

The runtime directory is ignored. Both JSON files have `result=PASS`, contain
no exact `\\.\pipe\...` endpoint or secret, and retain only redacted evidence.

## 9. Finding Disposition

- `B-1 = SATISFIED_BY_IMPLEMENTATION_EVIDENCE`.
- `NF-1` through `NF-5 = SATISFIED_BY_IMPLEMENTATION_EVIDENCE` for the
  corresponding 1B gates; this is not an Independent Review conclusion.
- `NF-6 = OPEN_NON_BLOCKING` and is deliberately not closed.
- No Stop Condition was triggered.
- Independent Review is `NOT_STARTED`; Owner Closure is `NOT_PERFORMED`; the
  1B baseline is `NOT_FROZEN`.

## 10. C-1 / C-2 Corrective Evidence (latest checkpoint)

Result: PASS. Sections 1-9 retain historical implementation and $events
corrective evidence. Prior smokes did not exercise the two newly identified
boundaries and cannot prove them retrospectively.

### 10.1 C-1 tests and exact behavior

Root causes: normal finish() cleared already-received A/B, and a shift()
returning undefined was mistaken for an empty queue. Now queue length controls
item presence; normal terminal waits behind all queued items. Explicit cancel
and Carrier failure clear immediately; failure rejects pending pulls.
terminalObserved suppresses further credit while old items drain, and the
stream map entry is removed only after terminal delivery (or immediate local
cancel/failure).

All 11 new tests in carrier-client.test.ts passed:

| Test | Result |
|---|---|
| PullStreamBuffer preserves A/B before remote end | PASS |
| PullStreamBuffer preserves A/B before remote error | PASS |
| PullStreamBuffer preserves queued undefined before end | PASS |
| PullStreamBuffer delivers end to a pending pull | PASS |
| Consumer cancel discards queued items even after remote terminal | PASS |
| Carrier failure discards queued items immediately | PASS |
| CarrierClient drains items before stream-end, no terminal credit, removes state | PASS |
| CarrierClient drains items before stream-error, no terminal credit, removes state | PASS |
| CarrierClient consumes undefined and grants exactly one credit while active | PASS |
| CarrierClient cancel clears queued state and sends cancellation | PASS |
| CarrierClient failure clears queued streams and rejects another pending pull | PASS |

With the three existing cases, affected roster = 14/14 PASS. Tests use actual
Product classes, including authenticated Named Pipe traffic through the real
CarrierClient decoder. No production method is replaced. Final queues and
active streams are zero.

### 10.2 C-2 actual Native Helper integration

Root cause: Program.cs reused TimeoutMs=5000 for accept, although Main connects
only after Host readiness/$events preflight and Worker carrier-ready; the
Supervisor startup allowance is 90000 ms.

Accept now waits under Worker relay-pipe lifetime rather than an auth timer.
A single pending first-frame task observes EOF during accept/auth and is
reused for normal relay after authentication. Worker death/stop closes the
inherited pipe and ends the waiting Helper. AuthHandshakeTimeoutMs=5000 is
shared across the connected handshake; FrameCompletionTimeoutMs=5000 begins
after the first byte; authenticated idle remains unbounded by that timer.

Actual observed measurements from scripts/smoke-carrier.mjs:

| Gate | Measured result |
|---|---|
| Delayed connection then mutual HMAC | 5308 ms delay; PASS |
| Authenticated idle then valid bidirectional relay | 5202 ms idle; PASS |
| Connected peer without CLIENT_AUTH | 5022 ms timeout; zero Worker relay bytes; PASS |
| Partial authenticated frame | 5020 ms timeout; zero Worker relay bytes; PASS |
| Supervisor startup timeout kills waiting actual Helper | PASS; no surviving Worker/Helper |
| Supervisor explicit stop kills waiting actual Helper | PASS; no surviving Worker/Helper |

Slow real Host startup was not artificially injected. The permitted equivalent
was used: actual Native Helper delayed-connect integration. Lifecycle tests
use actual WorkerSupervisor plus actual Native Helper under a controlled
Worker fixture that never emits carrier-ready.

### 10.3 Exact regression command ledger

All commands run from D:\Project\Shaco-Forge unless stated otherwise.
PowerShell executable/environment notation used below:

```powershell
$node = 'C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe'
$env:SHACO_FORGE_HARNESS_ROOT = 'D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$env:SHACO_FORGE_WORKER_NODE = $node
```

| Exact command (using the bound executable above) | Exit | Result |
|---|---:|---|
| `& $node node_modules/typescript/bin/tsc -p apps/desktop/tsconfig.node.json` | 0 | PASS |
| `& $node --test apps/desktop/dist/main/carrier-client.test.js` | 0 | PASS; 14/14 |
| `& $node --test apps/worker/dist/host-carrier-preflight.test.js apps/worker/host-profile/events-route-preflight.test.mjs` | 0 | PASS; 23/23 after EOF-only cleanup |
| `& $node scripts/smoke-carrier.mjs` | 0 | PASS; all delayed-connect/auth/frame/lifecycle/security gates |
| `& $node scripts/build.mjs` | 0 | PASS; real frozen Client graph 27 / Vite modules 346 |
| `dotnet build apps/native-carrier/ShacoForge.NativeCarrier.csproj --configuration Release --no-restore` | 0 | PASS; 0 warnings/errors |
| `& $node scripts/typecheck.mjs` | 0 | PASS |
| `& $node scripts/smoke-worker.mjs` | 0 | PASS; exact 1B profile and structured $events preflight |
| `& $node scripts/smoke-electron.mjs` | 0 | PASS |
| `& $node scripts/smoke-electron.mjs --inject-carrier-failure` | 0 | PASS |
| `& $node scripts/verify-static.mjs` | 0 | PASS; 78 files |
| `& $node scripts/verify-theme.mjs` | 0 | PASS; 20 tokens |
| `git diff --check` | 0 | PASS |
| UTF-8/BOM/suspicious-text command in 10.4 | 0 | PASS; 46 files, zero BOM/suspicious markers |
| Untracked-file whitespace loop in 10.4 | 0 | PASS after whitespace-only cleanup |
| Process residual assertion in 10.4 | 0 | PASS; 0 Product processes |
| `git rev-parse HEAD` | 0 | Expected Product HEAD |
| `git diff --cached --name-only` | 0 | Empty; no staged files |
| `git rev-parse HEAD; git status --porcelain` in Frozen Harness | 0 | Expected Harness HEAD; clean |

Complete unit command (exit 0; 57 top-level, 67 including nested cases, all PASS):

```powershell
& $node --test packages/contracts/dist/index.test.js packages/contracts/dist/carrier.test.js apps/worker/dist/config.test.js apps/worker/dist/host-readiness-marker.test.js apps/worker/dist/host-carrier-preflight.test.js apps/worker/host-profile/events-route-preflight.test.mjs apps/desktop/dist/main/security.test.js apps/desktop/dist-tests/tests/theme.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/dist/main/window-lifecycle.test.js apps/desktop/dist/main/worker-supervisor.test.js apps/desktop/dist/main/carrier-client.test.js
```

### 10.4 Exact hygiene and residual assertions

UTF-8 strict/BOM/suspicious-text gate includes all changed and untracked
Product text files, including this corrective's documentation:

```powershell
$ErrorActionPreference='Stop'; $files=@(@(git -c core.quotePath=false diff --name-only --diff-filter=ACMRT) + @(git -c core.quotePath=false ls-files --others --exclude-standard) | Sort-Object -Unique | Where-Object { $_ -match '\.(ts|cts|mjs|js|json|md|cs|csproj|css|html|yaml|yml)$' }); $decoder=[System.Text.UTF8Encoding]::new($false,$true); foreach ($file in $files) { $bytes=[System.IO.File]::ReadAllBytes((Join-Path (Get-Location) $file)); if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) { throw "BOM: $file" }; $content=$decoder.GetString($bytes); foreach ($marker in @([string][char]0xFFFD,([string][char]0x951F+[char]0x65A4+[char]0x62F7),[string][char]0x00C3,[string][char]0x00C2)) { if ($content.Contains($marker)) { throw "Suspicious text: $file" } } }; [pscustomobject]@{result='PASS';utf8Files=$files.Count;bomFiles=0;suspiciousText=0} | ConvertTo-Json -Compress
```

Read-only process residual assertion, executed in approved desktop context:

```powershell
$ErrorActionPreference='Stop'; $productProcesses=@(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'ShacoForge.NativeCarrier.exe' -or ($_.Name -in @('node.exe','electron.exe') -and $_.CommandLine -match 'Shaco-Forge[\\/](apps|node_modules)|shaco-forge-v1-1b-') }); if ($productProcesses.Count -ne 0) { $productProcesses | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Depth 3; exit 1 }; '{"result":"PASS","residualProductProcesses":0}'
```

The earlier sandboxed CIM query was denied (exit 1); it is not a PASS.
The approved query succeeded. No C-1/C-2 test, build or runtime attempt failed.
One apply_patch context mismatch was corrected before testing. Pre-existing
Vite warnings and intentional shutdown transport rejections are retained.

The extra untracked-file whitespace gate initially failed (exit 3), detecting
three pre-existing EOF blank lines in the $events preflight code/tests and
Markdown trailing spaces, including the newly appended state lines. Whitespace
alone was corrected and the gate rerun; preflight logic remains unchanged.
The final cross-repository Git query under the sandbox identity failed its
ownership check (exit 1). The read-only HEAD/status query under approved owner
execution passed, with no safe.directory or repository configuration change.

```powershell
$untracked=@(git -c core.quotePath=false ls-files --others --exclude-standard); foreach ($file in $untracked) { git -c core.safecrlf=false diff --no-index --check -- NUL $file; if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE } }; exit 0
```

### 10.5 Refreshed runtime and final state

| Run | UTC capture | Main | Worker | Host | Helper |
|---|---|---:|---:|---:|---:|
| Normal | 2026-09-07T13:17:47.591Z | 21596 | 46392 | 46796 | 30092 |
| Failure injection | 2026-09-07T13:18:27.523Z | 44872 | 31812 | 45772 | 7976 |

Both refreshed raw JSON files report PASS. The $events probe still reports
opened/readyObserved/readyShapeValid/cancelled/iteratorClosed=true,
activeStreamsAfterCleanup=0, eventSubscriptionRetained=false,
clientRuntimeMetricCounted=false and businessOperationsPerformed=0.
The independent real Client count remains eventsReadyObserved=1, with 5 unary
requests, 3 opens, 6 pulls and 11 business frames. Final active/pending states
are zero; observed Product TCP listeners are empty. Failure injection still
reports carrier-failed and no restart/recreation/recovery/implicit Agent cancel.

All eight observed normal/failure process IDs and the Worker smoke processes
are absent after cleanup; final Product residual query returned 0.
Product HEAD and Frozen Harness HEAD match the requested baseline; Harness
worktree is clean. Existing legal uncommitted diff remains available.
No staging, Commit, Push, Independent Review or Owner Closure occurred.

V1_SLICE_1B = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW

V1_SLICE_1B_INDEPENDENT_REVIEW = NOT_STARTED

V1_SLICE_1B_OWNER_CLOSURE = NOT_PERFORMED

V1_SLICE_1B_BASELINE = NOT_FROZEN
