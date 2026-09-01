# P0.S-4 Connection Feature Completeness — Executor Evidence

Status: `FORMAL_CLOSURE / PASS / CLOSED`

Executor verdict: `PROVEN_WITH_CONSTRAINT`

Date: 2026-09-01

## 1. Scope and closure boundary

This evidence covers P0.S-4 only. Independent Review returned `PASS` with
recommendation `ACCEPT_PROVEN_WITH_CONSTRAINT`; its F-01 measurement finding
required the targeted corrective recorded below. Independent Corrective
Re-Review run `ed73b7779ab64c3ab4bbfde64011bf98` then returned `PASS` after
146 checks and recommended `PROCEED_TO_CLOSURE`. The Architecture Owner
accepted that result and formally closed P0.S-4 as `MET_WITH_CONSTRAINT`.

Closure does not start P0.S-5, does not set either
`P0S_NO_APPROVAL_REPLAY` or `P0S_NO_QUESTION_REPLAY`, and does not complete the
global Core Patch inventory. The formal review and closure authority is
`docs/05-reviews/architecture/AUDIT-008-P0S4-INDEPENDENT-REVIEW.md`.

The experiment is disposable and `NOT_PRODUCTION`. It changes neither the
frozen Desktop + Worker architecture nor the Frozen Harness checkout.

## 2. Final run identity

| Item | Final value |
| --- | --- |
| Result | `PASS` |
| Run ID | `1f16242307b04bc19cf1b9cb8295d813` |
| Started | `2026-09-01T13:10:33.5847567+08:00` |
| Completed | `2026-09-01T13:11:09.6309787+08:00` |
| Shaco branch / HEAD | `master` / `e1270ce2251b03972f33f32088a09408cd3880ef` |
| Frozen Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Frozen package | `@deepseek-ai/dsh@0.1.2-alpha.1` |
| Frozen lock SHA-256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| Runtime | Windows `10.0.26200.0`; Node `v24.18.0`; Electron `35.7.5`; PowerShell `7.6.4` |
| Harness cleanliness | clean before and after |

The repository machine summary is
`docs/04-development-records/experiments/P0S-4-CONNECTION-FEATURE-COMPLETENESS/evidence/summary.json`.
It contains one internally consistent corrective run. No earlier run data was
merged into this result. All validated P0.S-4 temporary run directories were
removed only after this summary was persisted, verified, and all recorded
processes had exited.

## 3. Real topology and process evidence

```text
sandboxed Renderer (PID 16876)
  -> one-method preload / Electron IPC
  -> Electron Main (PID 20684)
  -> authenticated Windows Named Pipe
  -> protected-current-user carrier (PID 34620)
  -> inherited child stdio
  -> dsh --profile shaco-host (PID 33824)
  -> Harness Connection / Gateway / Remote / exact Fetch seams
```

Electron application PIDs were `20684`, `8236`, `36284`, and `16876`.
Desktop Main, carrier, and dsh were independent processes. All six observed
PIDs exited; the final residual PID list was empty.

The Worker created a protected DACL with one non-inherited `FullControl` rule
for the current-user SID. The summary stores only irreversible identity and
endpoint hash prefixes. It stores no full SID, pipe endpoint, nonce, HMAC,
credential, or reusable secret.

The sandboxed Renderer exposed only `p0s4Bridge.run`. It had no Node globals,
transport global, pipe path, reusable Worker credential, arbitrary IPC, direct
pipe access, or arbitrary filesystem capability. BrowserAuth was not
constructed, the stock `dsh-web-app` / host Web server / HMR stack was absent,
and no matching TCP listener was observed.

Ten negative authentication/framing/route cases were rejected before Gateway:
unauthenticated JSON, unauthenticated binary, wrong proof, wrong Worker,
wrong endpoint, wrong SID, malformed frame, oversize frame, replayed handshake,
and non-allowlisted business endpoint. Gateway dispatch count was `0` at every
rejection and before the positive phase.

## 4. Public or preview seams exercised

- `connection.createSharedFetchHandler('/api')` for real unary and settlement
  dispatch.
- `typertGateway.wireStream.open` for the complete stream contract and real
  `$events` subscription.
- Package-root `Remote` / `TypertRemoteService` for deterministic approval,
  question, cancellation, and stream fixtures.
- `$events/result` for Host-authoritative approval/question settlement.
- `connection.fetch.register('/api/session.export')` for an exact Fetch owner
  carried over the authenticated raw binary lane.
- Electron `dialog.showOpenDialog` for the Windows native directory picker.

No `packages/**/src`, deep internal import, private loader, Frozen Harness
modification, anonymous HTTP binary path, or stock browser product stack was
used.

## 5. Gate results

| Gate | Result | Evidence |
| --- | --- | --- |
| `P0S_UNARY_PASS` | `YES` | Real `agentPresets/list` through Connection Fetch dispatch |
| `P0S_STREAM_PASS` | `YES` | Full `wireStream` contract, connection loss, backpressure, final cleanup |
| `P0S_EVENT_GENERATION_PASS` | `YES` | Four real `$events.ready` records each caused one measured projection invalidation and repull |
| `P0S_APPROVAL_PASS` | `YES` | Real Host request, reconnect projection, one durable settlement |
| `P0S_USER_QUESTION_PASS` | `YES` | Real question service, reconnect projection, one settlement |
| `P0S_CANCEL_PASS` | `YES` | Real `session/cancel`; disconnect alone did not cancel |
| `P0S_BINARY_CARRIER_PASS` | `YES` | Exact raw bytes, hashes, cancel, limits, fail-closed negatives |
| `P0S_NATIVE_PICKER_OR_EQUIVALENT_PASS` | `YES` | Real documented Electron dialog success and cancel |
| `P0S4_NO_DUPLICATE_APPROVAL_SETTLEMENT` | `YES` | Host settlement `1`; durable decision `1`; duplicate safe no-op |
| `P0S4_NO_DUPLICATE_USER_QUESTION_SETTLEMENT` | `YES` | Host settlement `1`; duplicate safe no-op |
| `P0S_LOCAL_CARRIER_FEASIBLE` | `YES` | H-06 unary, H-07 stream, and H-08 event/generation all real-pass |

## 6. Complete stream contract

The authenticated carrier opened `p0s4Fixture/streamScenario` only after
authentication and dispatched it through `typertGateway.wireStream.open`.

| Behavior | Observation |
| --- | --- |
| Open / AsyncIterable equivalent | Real `wireStream.open` delivered framed stream items |
| Ordered items / normal end | 12 ordered items; exactly one `stream-end` |
| Producer error | 2 items then exactly one `p0s4-producer-error` |
| Consumer cancel | terminal `stream-cancelled` |
| Concurrency | 3 streams concurrent with 8 real unary calls |
| Connection loss | connection-owned pending stream returned; no Agent cancel mapping |
| Backpressure | credit limit 4; stalled producer emitted only 4 items |
| Final cleanup | final `$events` cancel requested; terminal `stream-end`; active streams `0` |

The final `$events` terminal is `stream-end` because the public async stream
returns normally after consumer cancellation. The evidence requires the cancel
request, an allowed deterministic terminal, and zero final active streams; it
does not infer cleanup from process exit alone.

The Worker response queue capacity was `16` and peak depth was `9`. Maximum
stream credits observed were `4` against limit `4`. There were `183` frames
requiring multiple physical reads, proving partial-frame assembly. Main RSS
peaked at `145653760` bytes. Final active stream and binary counts were both
`0`.

## 7. Event, approval, question, and explicit cancel

Four real `$events.ready` events produced monotonically increasing desktop
generations `1`, `2`, `3`, and `4`, each with a distinct hashed client ID. The
Frozen Harness does not emit a named `connection/reset` wire event in this
proof. Instead, each valid real ready was the sole cause of one actual
test-owned Desktop-equivalent projection invalidation and one repull request
in the `NOT_PRODUCTION` adapter. There were no reset records before ready, no
generation was reset twice, and all ready/reset/repull records map by ready
sequence, generation, and client-ID hash. All three measured counts were `4`
and were derived from runtime records rather than constants. Pending approval
and question event IDs remained stable across carrier reconnect, while stale
prior-generation results were rejected.

Approval event ID hash prefix was `a1fb126bff7541a3`. The first valid result was
accepted; a duplicate was a safe no-op; Host settlement count and durable
decision count were each `1`.

Question event ID hash prefix was `a4d2ce0bbd24baef`. The valid answer was
applied; a duplicate was a safe no-op; Host settlement count was `1`.

The explicit cancellation probe first disconnected the transport and observed
zero cancel completions. It then called real `session/cancel`, observed exactly
one completion, and the target Agent finished `idle`. Pipe closure was not used
as an Agent-cancel substitute.

## 8. Exact binary carrier

The fixture is a `NOT_PRODUCTION` deterministic exact Fetch owner registered at
`/api/session.export`. Bytes traverse the same authenticated trust boundary as
JSON but use raw binary frames (`uint32-le` length, binary discriminator,
stream ID, and unencoded bytes). The payload includes `0x00`, `0xff`, `0x80`,
and non-UTF-8 sequences.

| Bytes | SHA-256 | Chunks | Result |
| ---: | --- | ---: | --- |
| 3 | `f742b965f156c10374bc23aea96e3a8aff8facd6fc079defeaa30219ad86f211` | 1 | exact |
| 4096 | `2c91d0f9d590f91a982fe9118eba8e30e0b01e51a8fb1949620d554a65c40b21` | 1 | exact |
| 65537 | `7447cf47715adfbdf755d2772df4df46f83821b532649f749a70fb984f904a8e` | 5 | exact |
| 262144 | `1e434022c7f4382c5f2b45d1ee9b91080740a5cb2cbb3dd907e056eebc62be2a` | 16 | exact |

Cancellation stopped after 4 chunks / 65536 bytes with terminal
`binary-cancelled`. Chunk size was bounded at 16384 bytes, total size at
2097152 bytes, and observed binary credits at `2` (hard bound `4`). Malformed
and oversize binary opens failed closed with statuses `400` and `413`.

## 9. Native picker

Electron Main invoked documented `dialog.showOpenDialog` twice with a visible
parent only during picker interaction. The success dialog returned exactly the
pre-created `workspace` directory; the cancel dialog returned `canceled=true`
and no paths. Renderer only requested the fixed one-shot run through its narrow
IPC bridge and received no arbitrary filesystem capability.

Constraint: the repeatable runner is interactive for these two OS actions and
records `runnerSelfAutomated=false`. The final run paused for the user to
select the current run's already-created temporary `workspace` directory and
cancel the second dialog. This is a real OS picker path, not a fake path
fixture. This
operational constraint is why the Executor verdict is
`PROVEN_WITH_CONSTRAINT` rather than `PROVEN`.

## 10. Adapter and stub inventory

| Surface | Purpose | PublicOrPreviewSeamUsed | NOT_PRODUCTION | ProductionImpact | ChangesDesktopWorkerArchitecture | CorePatchRequired |
| --- | --- | --- | --- | --- | --- | --- |
| Electron Main Named Pipe Connection adapter | Map authenticated pipe frames to Connection Fetch / Gateway stream | Package-root Host Connection and `wireStream` | `YES` | `NONE` | `NO` | `NO` |
| Deterministic Remote/exact fixture | Reproduce stream/error/settlement/binary edges | Package-root `Remote` / `TypertRemoteService`; exact Fetch register | `YES` | `NONE` | `NO` | `NO` |
| Desktop generation adapter | Invalidate test projection and request repull only after real `$events.ready` | Real `$events` via `wireStream` | `YES` | `NONE` | `NO` | `NO` |
| Electron native picker adapter | Desktop-equivalent Windows directory selection | `dialog.showOpenDialog` | `YES` | `NONE` | `NO` | `NO` |

`CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`. The global
`P0S_CORE_PATCH_INVENTORY_COMPLETE` remains `NO` because later P0.S module and
packaging areas are not complete.

The frozen runner's adapter-inventory purpose text uses `connection/reset` as
shorthand for this test-owned Desktop-equivalent action; it does not identify
or claim observation of a Harness wire event.

## 11. Targeted corrective results

F-01 root cause: the previous adapter summary used constant values for
`connectionResetCount`, `connectionResetObserved`, and the generation list.
It measured real ready/client/waterfall/stale/reprojection behavior but did not
execute or measure a reset action. The corrective adapter now allocates a
generation only after valid real `$events.ready`, invalidates a mutable test
projection cache, queues a repull request, and writes causal records. The
summary derives its generation and reset fields from those records. The
verifier checks count equality, every ready-to-reset and reset-to-repull link,
no reset without ready, and no duplicate-generation reset.

F-02 cleanup was performed after the corrective machine summary was persisted,
the repository evidence artifact was confirmed outside TEMP, the verifier
passed, and process exit was reconfirmed. This formal evidence was then
refreshed in place with the cleanup outcome. A
read-only scan was limited to direct children of the exact current-user TEMP
root whose names matched `shaco-forge-p0s4-<32 lowercase hex runId>`. Each
candidate was resolved to an absolute path and validated using the
`NOT_PRODUCTION` profile/bundle package markers plus at least one matching run
artifact; present explicit runtime markers also had to bind the exact name and
run ID. Recursive deletion then used each resolved literal path individually,
with a final containment check and no deletion wildcard.

| F-02 measure | Count |
| --- | ---: |
| Candidates | 18 |
| Successfully verified | 18 |
| Deleted | 18 |
| Undeleted | 0 |
| Remaining matching runtime directories | 0 |

The deleted temporary content, including real session JSONL, is not
recoverable through this operation. No repository evidence, project path,
Frozen Harness path, or other application temporary directory was deleted.

## 12. Reproduction and verification

From the experiment directory:

```powershell
./run-spike.ps1 -FrozenHarnessRoot D:\Project\Shaco-Forge-Upstream\deepseek-harness
./evidence/verify-summary.ps1
```

The verifier returned:

```json
{
  "verifier": "P0.S-4 evidence verifier",
  "result": "PASS",
  "summaryRunId": "1f16242307b04bc19cf1b9cb8295d813",
  "checksPassed": 138
}
```

The machine summary records SHA-256 for all 12 experiment source files outside
`evidence/`; the verifier recomputed and matched every one.

Additional validation completed:

- JS/MJS/CJS syntax: PASS.
- PowerShell AST: PASS.
- C# `Add-Type` compilation: PASS.
- JSON strict parse: PASS.
- UTF-8 without BOM and mojibake scan: PASS.
- Markdown table/code-fence check: PASS.
- secret/token/credential scan: PASS after allowlisted documentation labels.
- changed-path allowlist: PASS.
- The pre-closure `git diff --check` exited zero for tracked diffs only; it did
  not include the then-untracked new experiment files.
- After all 22 approved paths were staged, raw `git diff --cached --check`
  remained nonzero with exactly five `new blank line at EOF` diagnostics and
  no other whitespace error. The five files are frozen runtime evidence inputs
  whose current bytes match `sourceSha256`.
- Architecture Owner accepted the exact-file protected-evidence EOF whitespace
  waiver. `RAW_STAGED_DIFF_CHECK = FAIL_EXPECTED` and
  `STAGED_DIFF_CHECK_WHITELIST_GATE = PASS`, with
  `P0S4_EOF_WAIVER_DOCUMENTATION_CORRECTIVE = PASS`; trailing-whitespace,
  encoding, syntax, credential, path-scope and protected-hash checks remain
  PASS. No protected runtime source byte was changed.
- Frozen Harness final cleanliness: PASS.
- all run processes exited: PASS.
- validated P0.S-4 TEMP runtime directories remaining: `0`.

### 12.1 Protected evidence EOF whitespace waiver

The exact raw staged diagnostics are:

- `bundle/connection-compatibility.mjs:32`: `new blank line at EOF`
- `bundle/cordis.patch.yml:41`: `new blank line at EOF`
- `preload.cjs:18`: `new blank line at EOF`
- `profile/cordis.patch.yml:3`: `new blank line at EOF`
- `worker-carrier.ps1:5`: `new blank line at EOF`

There is no sixth file or other diagnostic type. Read-only byte and syntax
qualification confirmed that each file ends in exactly one extra LF, has no
BOM or trailing space, parses in its language, and retains the SHA-256 used by
the Executor, Corrective and independent reproduction. The files and
`summary.json.sourceSha256` were not changed.

```text
P0S4_PROTECTED_EVIDENCE_EOF_WHITESPACE_WAIVER = ACCEPTED
P0S4_EOF_WAIVER_DOCUMENTATION_CORRECTIVE = PASS
WAIVER_SCOPE_FILE_COUNT = 5
WAIVER_SCOPE_EXACT = YES
PROTECTED_RUNTIME_SOURCE_BYTES_CHANGED = NO
SOURCE_SHA256_CHAIN_PRESERVED = YES
RAW_STAGED_DIFF_CHECK = FAIL_EXPECTED
STAGED_DIFF_CHECK_WHITELIST_GATE = PASS
```

This exact-diagnostic waiver applies only to this P0.S-4 Closure Commit. It is
not a repository-wide whitespace exception and does not apply to future
commits or any other diagnostic.

## 13. Formal closure state

- `P0S4_FORMAL_CLOSURE = PASS`
- `SHACO_FORGE_V1_0_P0S_4 = PASS`
- `P0S4_STATE = CLOSED`
- `P0S4_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT`
- `P0S4_CORRECTIVE_REREVIEW_VERDICT = PASS`
- `P0S4_CORRECTIVE_REREVIEW_ACCEPTED = YES`
- `P0S4_EXPECTATION_ASSESSMENT = MET_WITH_CONSTRAINT`
- `P0S_UNARY_PASS = YES`
- `P0S_STREAM_PASS = YES`
- `P0S_EVENT_GENERATION_PASS = YES`
- `P0S_APPROVAL_PASS = YES`
- `P0S_USER_QUESTION_PASS = YES`
- `P0S_CANCEL_PASS = YES`
- `P0S_BINARY_CARRIER_PASS = YES`
- `P0S_NATIVE_PICKER_OR_EQUIVALENT_PASS = YES`
- `P0S4_NO_DUPLICATE_APPROVAL_SETTLEMENT = YES`
- `P0S4_NO_DUPLICATE_USER_QUESTION_SETTLEMENT = YES`
- `P0S_LOCAL_CARRIER_FEASIBLE = YES`
- `CONNECTION_CARRIER_CORE_PATCH_REQUIRED = NO`
- `ADAPTER_OR_STUB_USED = YES`
- `OWNER_DECISION_REQUIRED = NO`
- `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`
- `P0S4_DOCUMENTATION_AND_MEASUREMENT_CORRECTIVE = PASS`
- `F01_RESET_MEASUREMENT_STATUS = APPLIED`
- `F02_TEMP_HYGIENE_STATUS = APPLIED`
- `P0S5_ALLOWED = NO`
- `P0S5_STATE = NOT_STARTED`
- `READY_FOR_P0S5 = NO`
- `CLOSURE_COMMIT_PERFORMED = NO`
- `PUSH_PERFORMED = NO`

P0.S-4 is PASS/CLOSED. The technical result remains
`PROVEN_WITH_CONSTRAINT`; all experiment implementations remain
`NOT_PRODUCTION`. P0.S-5 remains `NOT_STARTED` and separately gated.

## 14. Owner closure and successor boundary

The Independent Reviewer confirmed the corrective claim but did not close the
stage. The Architecture Owner accepted the re-review and owns the formal
closure decision recorded in AUDIT-008.

The frozen P0.S Contract defines P0.S-5 evidence but does not automatically
authorize a successor when its predecessor closes. Existing P0.S-2/P0.S-3
closure transitions retained the next step as disallowed until a separate
Owner action. Therefore `P0S5_ALLOWED = NO` and `READY_FOR_P0S5 = NO` remain
until explicit Architecture Owner authorization; this closure performed no
P0.S-5 work.

Independent Review F-03 (Electron version pin), F-04 (PowerShell 7
reproduction contract), F-05 (bounded nonce state), and Corrective Re-Review
CF-01/CF-03 remain routed to their assigned later runner/P1/P7 contracts. CF-02
requires no further corrective because the Reviewer directly confirmed TEMP
runtime residual `0`.
