# V1-SLICE-2 Step 1 Worker Authority and Trusted Discovery Implementation Record

Run ID: STEP1-20260909-IMPLEMENTATION-01
Date: 2026-09-09 (Asia/Shanghai)
Status: STOPPED_BLOCKED / IMPLEMENTATION_NOT_PROVEN

## A. Implementation verdict

IMPLEMENTATION_RESULT = STOPPED_BLOCKED
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = IMPLEMENTATION_NOT_PROVEN
FIRST_UNRESOLVED_BOUNDARY = G15_BOUNDED_STOP_NOT_DELIVERED_DURING_ELECTRON_TEARDOWN
STOP_REASON = MAJOR_CORRECTIVE_BUDGET_EXHAUSTED

The implementation reached real Carrier readiness, reattachment and several security/process gates. It did not pass the complete required runtime/regression roster. No Independent Review, Owner acceptance, closure or Step2 authorization is claimed.

## B. Baseline

Product: D:\Project\Shaco-Forge; branch master; initial HEAD f4cf53efcef8bf83c2a5361f5128e5eeae99a2cd; initial tracked/staged/untracked state CLEAN/NONE/NONE.
Frozen Harness: D:\Project\Shaco-Forge-Upstream\deepseek-harness; HEAD cd5ef8148158c3a752a658978873241fdf8e2bbc; initial/final CLEAN.
Both baselines were actually inspected before implementation. The sandbox Harness Git ownership check was resolved with command-scoped safe.directory only; no global Git configuration was changed.
Pinned Node v22.19.0: C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe; pnpm 11.7.0: D:\Development\pnpm\node_modules\pnpm\bin\pnpm.cjs; .NET SDK 10.0.302; Electron 35.7.5. Ambient Node 24.18.0 / pnpm 11.19.0 were not substituted for required builds or runtime.

## C. Scope

Implemented code for detached per-user Worker startup/discovery, Helper-held mutex, Worker-owned Job, protected deterministic lifecycle pipe, per-attachment Helper credential generation, actual PID/start binding, sequential Carrier/Host relay fencing, Desktop detach and bounded internal stop. Added a canonical local runtime/evidence driver and focused OS/Electron fixtures. No dependency or lockfile change.
Not implemented: Product CONNECTED, cold Workspace/Session projection/recovery, Worker replacement recovery, full reconnect UI, Step3 native UI integration, business/Prompt/Tool replay, Provider work, Broker, asymmetric authority, Launch Grant, Service, WorkerGeneration or CarrierConnectionId. Harness business truth and the frozen HMAC transcript remain unchanged.

## D. Files changed

- D:\Project\Shaco-Forge\apps\desktop\src\main\carrier-client.ts
- D:\Project\Shaco-Forge\apps\desktop\src\main\lifecycle-client.ts
- D:\Project\Shaco-Forge\apps\desktop\src\main\main.ts
- D:\Project\Shaco-Forge\apps\desktop\src\main\worker-supervisor.test.ts
- D:\Project\Shaco-Forge\apps\desktop\src\main\worker-supervisor.ts
- D:\Project\Shaco-Forge\apps\desktop\test-fixtures\step1-authority-negative.ps1
- D:\Project\Shaco-Forge\apps\desktop\test-fixtures\step1-lifecycle-main.mjs
- D:\Project\Shaco-Forge\apps\native-carrier\LifecycleAuthority.cs
- D:\Project\Shaco-Forge\apps\native-carrier\Program.cs
- D:\Project\Shaco-Forge\apps\native-carrier\WindowsAuthority.cs
- D:\Project\Shaco-Forge\apps\worker\host-profile\carrier-gateway.mjs
- D:\Project\Shaco-Forge\apps\worker\src\index.ts
- D:\Project\Shaco-Forge\package.json
- D:\Project\Shaco-Forge\scripts\smoke-carrier.mjs
- D:\Project\Shaco-Forge\scripts\smoke-electron.mjs
- D:\Project\Shaco-Forge\scripts\smoke-slice2-step1.mjs
- D:\Project\Shaco-Forge\scripts\smoke-worker.mjs
- D:\Project\Shaco-Forge\docs\04-development-records\V1-SLICE-2-STEP1-WORKER-AUTHORITY-TRUSTED-DISCOVERY-IMPLEMENTATION-RECORD.md
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\attachment-sequence.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\authority-identity.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\electron-regression.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\gate-results.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\process-lifecycle.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\redaction-summary.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\run-manifest.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\security-negative-results.json
- D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01\test-summary.json

## E. Architecture realization

- Worker generates workerInstanceId and remains a detached per-user epoch. Main discovers first; no Main-generated attachment secret remains.
- Lifecycle pipe is derived deterministically from the current SID hash; its owner, protected DACL and explicit current-SID rule are inspected from the real handle. A short Native operation inspects the connected server PID/start; it exits before credential delivery. It is not a Broker or binary-identity authority.
- Helper creates the kill-on-close Job during bootstrap, duplicates the final non-inheritable Job handle into Worker, assigns Helper and Host, and closes its setup handle before readiness. Worker is the final holder. Helper owns the authority mutex on one dedicated thread; abandoned acquisition fails closed.
- Main startup uses detached/unreferenced Node with ignored stdio. No temporary Main channel survives readiness. Normal Product before-quit closes only the Carrier and attachment state.
- Helper reserves the actual lifecycle peer PID/start, checks protocol/freshness/health/state, then generates 32 random secret bytes and a new credentialEpoch. Carrier actual PID/start must match. Secret bytes are cleared on consume/revoke; endpoint and credential stay on the validated Main control path.
- Carrier endpoint remains random per Worker; mutual HMAC domains, transcript field order, uint32-LE field lengths, UTF-8 encoding and Carrier frame bytes are unchanged. MAX_JSON_FRAME=262144, credits=4, queue capacity=16. Private relay uses a separate clientInstanceId metadata frame before each unchanged business frame, preserving the full frame limit.
- Sequential detach clears auth, frame decoder, stream/credit/callback state and tags private relay work with clientInstanceId. Old Client objects cannot be reused. The stricter five-pending-callback runtime probe exists but remains unexecuted.
- Explicit stop is incomplete under full Electron teardown: one lifecycle request is attempted, its rejection is swallowed, and the method only polls process exit afterwards. A concurrent health/discovery request can occupy the single lifecycle instance. The actual swallowed error was not captured, so BUSY contention is a source-based inference, not an observed error code.

## F. Bounded corrective history

| Cycle | Issue / root cause | Correction | Verification |
|---|---|---|---|
| Major 1 | Lifecycle response recycling/identity serialization; initial timeout diagnosis incomplete | Wait for client close acknowledgement; camelCase process identity fields | Timeout persisted; retained foundation attempts |
| Major 2 | Node child_process pauses a Socket supplied as inherited stdio | Resume Main read ownership after Native handle inspection | Foundation attempt 6 PASS, same Worker/fresh epochs/real unary/stop |
| Major 3 | Node queues connection to an occupied lifecycle pipe instead of immediately reporting BUSY | Native WaitNamedPipe availability check; bounded BUSY result | Initial BUSY problem corrected; next run exposed broken pipe reuse |
| Major 4 | EOF can set IsConnected=false/Broken, skipping Disconnect and causing next accept IOException | Disconnect every completed accept before reuse | Native/security negatives PASS, real sequential events PASS |
| Unresolved; no cycle 5 | Full Electron stop reported exited=false; authority remained healthy DETACHED | No Product corrective after budget exhaustion | Regression FAIL; later direct stop only for cleanup |

Major corrective cycles: 4 used / 4 allowed. One overall BCL/Win32 Product design strategy; no Broker/native-dependency strategy introduced.
Minor history is reported per issue and in aggregate: CS0165 definite assignment (1 correction), CA2022 unchecked ReadAsync result (1), PATH resolution (3 corrections: key normalization, uppercase key, then bounded PATH), Electron stdin fixture trigger (1), and missing pre-snapshot GPU-failure cleanup (1). Aggregate: 7 minor corrective edits across these separate issues. The executor treated the minor cap per issue; under a global interpretation this exceeds 3 and is an additional execution-discipline limitation, not hidden as budget compliance.
PATH root cause was the 22068-character inherited PATH; short pinned Node/.NET/system PATH passed. The sandbox Electron GPU exited with -1073741515; normal-user execution succeeded. A diagnostic confirmation showed no stdin control/before-quit event; a timed real window.close trigger then passed.
One chained build/runtime invocation mistakenly ran the old binary after CA2022 build failure. That failed run remains foundation attempt 3. This was an execution-order error, not a valid corrective verification or an erased attempt. Later build and runtime calls were separated.
Foundation attempts: FAIL, FAIL, FAIL (old binary), FAIL, FAIL, PASS. Carrier negative attempts: FAIL, FAIL, FAIL, PASS, PASS. Desktop survival attempts: two sandbox GPU failures, two stdin-trigger failures, then PASS. Native failure/ambiguous-authority suites each passed once. The final existing Electron regression failed once; no unchanged rerun was performed after the stop boundary.

## G. Build / test

| Command | Exit | Result |
|---|---:|---|
| pnpm run build (2026-09-09T08:45:47.965Z) | 1 | FAIL |
| pnpm run build (2026-09-09T08:46:31.945Z) | 1 | FAIL |
| pnpm run build (2026-09-09T08:47:58.369Z) | 0 | PASS |
| pnpm run typecheck (2026-09-09T08:58:08.375Z) | 0 | PASS |
| pnpm test (2026-09-09T09:18:05.097Z) | 0 | PASS |
| pnpm run smoke:carrier (2026-09-09T09:19:38.950Z) | 0 | PASS |
| pnpm run smoke:worker (2026-09-09T09:21:43.420Z) | 0 | PASS |
| pnpm run smoke:electron (2026-09-09T09:24:17.913Z) | 1 | FAIL |
| pnpm run verify:static (2026-09-09T09:29:23.137Z) | 0 | PASS |
| .NET Release --no-restore (latest completed source build) | 0 | PASS; 0 warnings/errors |
| Node --check for changed JS/MJS files | 0 | PASS |
| PowerShell Parser.ParseFile for new OS fixture | 0 | PASS |
| git diff --check | 0 | PASS |

pnpm test: 120/120 tests, 0 failures, 0 skipped. The full existing target roster ran. Old Supervisor fixture expectations were updated for discovery/detach/process-start validation; the historical identity fixtures were not changed. Exact executable paths and all retained command outcomes, including standalone runtime invocations and build failures, are in test-summary.json.
smoke:electron was inspected before execution: the run used the real Client read-only unary/$events route and explicitly disabled user-loop mode. Renderer passed; product-owned TCP listeners were zero. Its cleanup predicate failed, so overall regression remains FAIL. smoke:user-loop and Provider/Prompt/Tool execution were NOT_EXECUTED.

## H. Step1 runtime gates

| Gate | Result | Basis / limit |
|---|---|---|
| G01 | PASS | Observed one ready per-user authority; complete concurrent-start overlap gate remains separately unexecuted (G21). |
| G02 | PASS | Actual Product Electron window close; Worker/Host/Helper PID and start identity survive. |
| G03 | PASS | Actual Product Electron Main hard crash; Worker/Host/Helper survive. |
| G04 | PASS | Three fresh Main PIDs attach to the same workerInstanceId. |
| G05 | PASS | Three distinct epoch hashes; consumed/expired/replayed credentials rejected. |
| G06 | PASS | BUSY at CREDENTIAL_ISSUED, AUTHENTICATING and ATTACHED. |
| G07 | PASS | Wrong/stale/expired/consumed/replayed capability inputs rejected with zero dispatch delta. |
| G08 | PASS | Lifecycle claimed PID and start mismatches rejected against actual handle peer. |
| G09 | PASS | Separate actual Carrier peer process rejected before challenge; dispatch delta zero. |
| G10 | NOT_EXECUTED | Partial proof: framing/auth/real $events sequential reset passed. Exhaustive pending callback/buffer settlement probe added later was not executed. |
| G11 | PASS | Helper hard death classified WORKER_AUTHORITY_FAILURE; all epoch processes ended. |
| G12 | PASS | Host hard death classified WORKER_AUTHORITY_FAILURE; all epoch processes ended. |
| G13 | PASS | Worker hard death closed Worker-owned Job and killed Host+Helper; no orphan. |
| G14 | PASS | Held/hung/retained-abandoned mutex fixtures fail closed; Product discovery launched zero Workers. |
| G15 | FAIL | Isolated stop passed, but required full Electron regression returned cleanup.exited=false with healthy DETACHED authority still alive. Controlled post-failure cleanup is not gate PASS. |
| G16 | PASS | ACCESS_CONTROL_PROOF: inspected real pipe owner/protected single-SID ACL; deterministic non-admin different-SID evaluation denies access. No second-user login claimed. |
| G17 | PASS | Actual Electron Renderer has no require/process/lifecycle access; unchanged preload allowlist. |
| G18 | PASS | Lifecycle protocol version 2 rejected before credential issuance. |
| G19 | PASS | Source/Evidence hygiene checked; no raw secret/proof/exact private Carrier endpoint in Evidence; epochs represented as permitted identities/hashes. |
| G20 | NOT_EXECUTED | Basic old Client reuse/stream rejection passed. Added five-pending-callback and queued-frame test was not run before stop. |
| G21 | NOT_EXECUTED | No observed overlap and held/hung paths launch zero Workers; dedicated competing-candidate runtime was added but not executed. |
| G22 | PASS | Step1 conditional scope: ambiguous old authority never launches replacement; abandoned-acquisition candidate starts no Host and never becomes ready. No Step2 replacement/adoption recovery implemented. |

These are observed sub-results from this implementation run, not a claim that the final full Step1 matrix passed. G10/G20 are only partially exercised; G21 final candidate scenario was not run. No same-SID hostile-binary, memory-theft, Broker, Launch Grant, Service or Provider gate was introduced.

## I. Desktop survival

Successful actual Product run: Main PIDs 55132 -> 8296 -> 59156; Worker 49684, Host 28488, Helper 59136.
Graceful window close and Main hard crash preserved all three PID/start tuples. Final third Main graceful close and isolated direct authority stop completed. Earlier test failures and their diagnostics remain in attachment-sequence.json.

## J. Fresh reattach

workerInstanceId = 3801b34b-b272-495b-8a4c-889ce95aec57

| Main PID | credentialEpoch SHA-256 | clientInstanceId |
|---:|---|---|
| 55132 | c44b241ca1b3784f93db910c6cbde8c49d71dffa26214a018a655cdcd24d3bb0 | de29a46e-79be-4642-9cce-1e8c216a26d4 |
| 8296 | 88c6bb217f892592010df45439cd5873a7bae74fb40293ff3c2f8abd476693d2 | 28258025-fd67-47b5-a0e4-9eb018d3349d |
| 59156 | b97cc9b4ef23689b873a0be940b2b2a90e1f7a9d4cfa7469f36d22584a4a2732 | 56c450ba-1fdd-44b9-9b5e-f304088f7bf8 |

## K. Authority / process

| Scenario | Worker PID | Host PID | Helper PID | Result |
|---|---:|---:|---:|---|
| helper | 28624 | 38568 | 44896 | PASS |
| host | 31860 | 58344 | 46760 | PASS |
| worker | 58084 | 29248 | 55212 | PASS |
| explicit-stop | 16052 | 27340 | 33532 | PASS |

Failed regression authority: Worker 49652, Host 11764, Helper 9832; workerInstanceId 13c53c68-5bb5-4fdb-944b-e83152efaeb0. Post-failure discovery observed healthy DETACHED, proving resources were still live. A later explicit stop returned stopping and all three ended. This cleanup does not turn G15 into PASS.
The initial sandbox GPU crash left a detached authority before the test received a snapshot. Parent PID 58028 tied Worker 53812 to this run; Host 35676 and Helper 36036 were later stopped after exact PID/start verification. This delayed cleanup and the build-file lock it caused are preserved in process-lifecycle.json. Final CIM inspection found no remaining Product Worker/Native Helper/Step1 fixture. Unrelated processes were not terminated.

## L. Security negatives

PASS observations: BUSY in all three active states; stale/consumed/expired/replayed capability rejection; lifecycle actual PID/start mismatch; Carrier actual peer tuple mismatch before challenge; incompatible protocol before issuance; 262144-byte real Gateway frame acceptance, 262145 rejection; zero rejected-input dispatch delta; unchanged Renderer preload and actual isolated Renderer.
Cross-user classification is ACCESS_CONTROL_PROOF only: a deterministic non-admin SID/group evaluation of the actual inspected protected single-current-SID ACL. A real second-user login/access scenario was not executed. Node/native gates ran as the sandbox user; Electron gates ran as the normal Windows user. Both SID hashes are in run-manifest.json.

## M. Evidence

Root: D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-IMPLEMENTATION-01

| File | Bytes | SHA-256 |
|---|---:|---|
| attachment-sequence.json | 29867 | 127648c48794c33812a068c93df12c86183bedd3f43723fe00e7418c793688be |
| authority-identity.json | 8461 | a8e294365dacddc199117b6725318a3cc33c8559be90af4d441ef54ddbdf48d7 |
| electron-regression.json | 20607 | 42c208eb44146a08266097baf88e8945ccfcc11d5cfefefda5da129ae8a5aba9 |
| gate-results.json | 4449 | 290863742c1ae754a0ad00565d9df7a45605c0f04d83bc73a0e3a5b5cc5a951c |
| process-lifecycle.json | 42542 | be707adcfe6f8d1a4b26255759f06cc92f057eb02d3b297f9236344aa4fc958d |
| redaction-summary.json | 5210 | 6335495ebbaeb8b82fb0d261a0542c967db9fc61a11a53d1e6242c2250544403 |
| run-manifest.json | 34775 | 795e09f5a8ed0b612f53398ce508edaf45b58172bb910e7cfe0115174a357165 |
| security-negative-results.json | 28255 | e1e0e6932c0bcb26611227295f6bf49fde7585da49747553c264080af55b1933 |
| test-summary.json | 6296 | 0ff47bc8b36099058c09b09db3acfd46d87c12d6f7be1d1738f690af857d2db9 |

## N. Implementation record

Path: D:\Project\Shaco-Forge\docs\04-development-records\V1-SLICE-2-STEP1-WORKER-AUTHORITY-TRUSTED-DISCOVERY-IMPLEMENTATION-RECORD.md
The final record byte size and SHA-256 are reported externally after writing; no circular self-hash is embedded.

## O. Historical preservation

| Historical / frozen path | Pre SHA-256 = Post SHA-256 |
|---|---|
| apps/desktop/test-fixtures/step1-non-product-peer.cjs | ae8eaaffca1ebadc19f7d975a5751abc464c3eef2905a761da3aabca64002295 |
| docs/02-architecture/SHACO-FORGE-SECURITY-MODEL.md | cfaa0dfa14c57d32f2c8b34547df82b49ead5b46bbea2844cab0cc6b3ef5bfd3 |
| docs/03-v1.0-plan/V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT.md | 8a9e2c0af4ae3e5c44de8bdbfd2ce43e173ee59a612507f88e990e7dd74f8c14 |
| docs/03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md | 68db86b526f3e046ac5168f154823817337dab37eea74c8f128f923a81df3c3f |
| docs/03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md | ad1d0ac21cab8c5e0794b02152bc1dc2cf27a090c50ec9338b47b7b9f9600cbb |
| docs/04-development-records/V1-0-MAINLINE-AND-STEP1-SCOPE-RECONCILIATION-DECISION.md | 72c04fdd18e712a80b71335290bc1365f8d6e53a7325c39f4f798565477ef1fc |
| docs/04-development-records/V1-SLICE-2-ARCHITECTURE-OWNER-DECISION.md | 7461e44cfb9eb85f8fe48a0898ac00e3abb55c1bd010598d75762cec806f7361 |
| docs/04-development-records/V1-SLICE-2-CONTRACT-FREEZE-AND-STEP1-AUTHORIZATION-DECISION.md | a3995a64763a22f301dab536dfeabc4e118d069d52180bcc2fdfafb414f000e9 |
| docs/04-development-records/V1-SLICE-2-STEP1-CONTROL-SERVER-ATTESTATION-SOURCE-CONFIRMATION.md | 40d6969cc1a175a5e2f68a237ea8c40a5725af8fedcc80083aa427f114c16c14 |
| docs/04-development-records/V1-SLICE-2-STEP1-DESKTOP-ATTESTATION-BLOCKED-RECORD.md | 316aced5037634bb5acf41d9780f8f9db8185543fc2839eed970462102f1fd11 |
| docs/04-development-records/V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-DECISION.md | 4bcc39c92498845eed3dc4e632b9e278341333cd12ea731829da5c41228e3202 |
| docs/04-development-records/V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-REFREEZE-AND-REAUTHORIZATION-DECISION.md | 1561985fd51e3175ebce0e33c41812d7b62f166c96b37fa3f0f6c460835ba469 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/identity-probe-attempt-1.json | 5387fd5ccccbc709b59610dbccd1b29e10c0061e6d1ad385d4fe2d4b0dad16b9 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/identity-probe-attempt-2.json | e25af8ee54167fd9060df923ca886070b55d97e446060f049ae681a8556cf4a9 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/process-lifecycle.json | 7e0d843601060481caa36bb1463131b4c1d9759aae9c77eabe5a0b833309a2cb |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/redaction-summary.json | 2c247d6b213e62771fd155b39e6e4610b5bc4425df978fe2b4291d819668c7ff |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/run-manifest.json | 056eb1baa850b4f6c42f487e146ef7a565e8596f14e68a8acbdd5afca80acdf5 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/scenario-results.json | 2bd7b3ffc65be2ec54399ac1df6c591141294a47ed7e72351bdba5b6453de17d |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/security-negative-results.json | d6e997c7c5fac9169f474d12ba18a2f20d6d8ea201aab5eddee9fbce95e934a9 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IDENTITY-01/test-summary.json | 720f27277e85f35f4cfe6bd2c878c0cd22de52f5bf1c802cf2c3f75664e3deea |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-SERVER-ATTESTATION-01/redaction-summary.json | 9ccb64c87b05159098b1e843e277c0f92f17ea31b0c9702cf6a8bf5c129fa6ad |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-SERVER-ATTESTATION-01/run-manifest.json | 56f30936f867f03113a8ec610a116f5e3e503e12cabdc45a785bb5a01758281a |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-SERVER-ATTESTATION-01/server-attestation-result.json | b17eeb0753fe10f3a95ea13350715468a23390fed045396859bf24669ae19cbf |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-SERVER-ATTESTATION-01/test-summary.json | 51540ac82311b62d5076a51ea9ff2c33279798d78baee50118049a992dca662e |
| docs/05-reviews/architecture/AUDIT-020-V1-SLICE-2-CONTRACT-TARGETED-DELTA-REREVIEW.md | 2d8aa2ddc48f2493ea2e9fe07f9f2b08cbc015d5d2defa454c0de898c1b75294 |
| docs/05-reviews/architecture/AUDIT-021-V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-CORRECTIVE-REVIEW.md | bc6a8eb711c6b4967092223ab6e98759cfd12f9b65c0e87312d8a45b752ce201 |
| docs/05-reviews/architecture/AUDIT-022-V1-SLICE-2-STEP1-MINIMAL-TRUSTED-DISCOVERY-PERSISTED-DELTA-REVIEW.md | 95c4b76b7f33352a68a48b619712bf327e08d70fb00dcc367ad3edc927f19e14 |
| scripts/step1-identity-probe.ps1 | 32306f6944b107dc016cff6aad5ff8677e7d8459dcdb136f61cf473ae1eb37d1 |
| scripts/step1-server-attestation-probe.ps1 | 7c3344827cd82833924ec14108c918aa8cb378f45d20355dddc66e9dca71be39 |

All 29 frozen/historical entries are byte-identical, including IDENTITY-01, SERVER-ATTESTATION-01, probes/fixture, Blocked/Source Confirmation records, AUDIT-021/022, Owner decisions, Main Contract, Carrier Amendment, Security Model and Slice1B Carrier Contract. Frozen Harness remains at cd5ef8148158c3a752a658978873241fdf8e2bbc, CLEAN.

## P. Governance state

No success-only Current State or Development Log synchronization was performed because required gates/regression did not all pass. The persisted Owner checkpoint remains REAUTHORIZED_NOT_STARTED; this new uncommitted implementation record and run manifest record the actual STOPPED_BLOCKED attempt. Step2/Step3 remain NOT_AUTHORIZED, Provider authorization NO. No CLOSED/FROZEN/OWNER_ACCEPTED claim is made.

## Q. Git state

Branch master; HEAD unchanged f4cf53efcef8bf83c2a5361f5128e5eeae99a2cd. Reviewable Product/source/test/script/Evidence/record worktree retained. Staged NONE. Commit NO. Push NO. No reset, checkout discard, historical evidence deletion or Frozen Harness change.

## R. Remaining risks

The explicit bounded stop path is not proven during real Renderer teardown. It suppresses lifecycle delivery failures, so an authority can remain live after a controlled stop request. A future corrective must distinguish transient occupancy, stop acknowledgement and confirmed epoch termination without making Main the Worker owner or allowing replacement while ambiguous. No such corrective is authorized by this exhausted run.
The swallowed error was not captured; a BUSY collision with in-flight health discovery is the most direct source-based explanation, not a measured error code. Exhaustive G10/G20 callback/queued-frame proof and G21 competing-candidate proof remain unexecuted. The consolidated --runtime entry has not passed as a whole. Some build/evidence metadata changed after earlier passing sub-scenarios; those sub-results are retained with their limits and are not promoted to final acceptance.
Minor-budget interpretation and the stale-binary command-chain error are disclosed in section F. Independent Review has not happened. No release/runtime packaging or resistance to same-user host compromise is claimed.

## S. Next action

NEXT_ACTION = ARCHITECTURE_OWNER_ASSESS_STEP1_IMPLEMENTATION_BLOCKER

---

# Architecture Owner Authorized G15 Corrective Continuation

Run ID: STEP1-20260909-G15-CORRECTIVE-01
Date: 2026-09-09 (Asia/Shanghai)
Status: PASS / IMPLEMENTED_WAITING_INDEPENDENT_REVIEW

This continuation does not rewrite the STOPPED_BLOCKED history above. The original 4/4 Major corrective cycles, the original G15 FAIL, the original G10/G20/G21 NOT_EXECUTED and the original STEP1-20260909-IMPLEMENTATION-01 evidence hashes are retained byte-identical. The Architecture Owner authorized a separate, narrow corrective budget for the known G15 blocker; it is not a reset of the prior budget.

## T. G15 root cause (PROVEN)

Root cause: BUSY_SWALLOWED_ON_SINGLE_LIFECYCLE_PIPE. `WorkerSupervisor.stop()` issued one `lifecycleRequest('stop-authority')` inside an empty `catch { }`. The single lifecycle pipe is shared by the 1-second health/discovery probe started by `carrierReady()`. When a health discover occupied the lifecycle pipe at stop time, `openLifecycle -> inspectLocalPlatform` observed `lifecycleBusy=true` and threw `BUSY`. The empty catch swallowed it, the stop-authority frame never reached the Helper/Worker, and the 8-second PID poll returned `exited=false` with Worker/Host/Helper still alive.

This was proven, not assumed. A deterministic reproduction (real Worker authority, attached Carrier, a lifecycle connection held open via the same `openLifecycle` mechanism the health discover uses, then `stop()`) captured the actual swallowed exception `{ name: "Error", message: "BUSY" }`, `stopDelivered=false`, and `exited=false` with all three processes alive. This matches the parent run's electron-regression `cleanup.exited=false` (healthy DETACHED authority still alive) and the fact that a later isolated direct stop succeeded. See g15-root-cause.json.

## U. G15 fix

File: `apps/desktop/src/main/worker-supervisor.ts`

Behavior before: `stop()` fired one `stop-authority` request, swallowed every error with `catch { }`, then polled PID exit for 8 seconds. Delivery was never confirmed or distinguished.

Behavior after: `stop()` now
1. detaches (stops new health checks) and, if a health/discovery request is in flight, performs a single bounded wait (2s) for it to release the lifecycle pipe;
2. sends the unique controlled stop once and observes the explicit `stopping` acknowledgement;
3. reports the delivery state explicitly via `StopResult.delivery` (`STOP_DELIVERED` / `STOP_REJECTED` / `STOP_PIPE_BUSY` / `STOP_DELIVERY_FAILED` / `STOP_DELIVERED_BUT_AUTHORITY_DID_NOT_EXIT`) with a bounded single retry only for the transient pipe-recycling BUSY case (no blind retry loop);
4. waits for the Worker/Host/Helper process exit and returns `exited=true` only when all three are gone.

No second lifecycle pipe, no second authority protocol, no Broker/Service, no unbounded retry, and no `process.kill` was introduced. Normal Desktop close/crash and the frozen Worker-survival contract are unchanged.

## V. Corrective budget consumed

- G15 debug observation attempts: 1 used / 2 allowed (deterministic BUSY reproduction).
- G15 source corrective cycles: 1 used / 2 allowed.
- G15 distinct design approaches: 1 used / 1 allowed.
- Minor corrections: 1 used / 3 allowed (PowerShell `-ExecutionPolicy Bypass` for the OS fixture, and the runId switch to the corrective evidence root).
- Remaining-gate (G10/G20/G21) source corrective cycles: 0 used / 2 allowed; no blind retry.

## W. Gate closure

- G15 PASS: smoke:electron full teardown returned `cleanup.exited=true` with `delivery=STOP_DELIVERED`; Worker/Host/Helper exit, Job release, mutex release, no orphan.
- G10 PASS: full sequential attachment reset (fresh decoder/auth/relay/credit/callback/buffer; zero dispatch delta on stale inputs).
- G20 PASS: old Client generation five pending callbacks rejected; queued old frames zero dispatch delta; old Client unusable after detach.
- G21 PASS: dedicated competing authority candidate never reached ready; one ready authority only; no old child adoption.

G01-G22 full matrix is in gate-results (see remaining-gates.json and g15-stop-delivery.json for the corrective-scope evidence).

## X. Canonical runtime and regressions

`pnpm run smoke:slice2-step1` (scripts/smoke-slice2-step1.mjs --runtime) is non-Provider (providerRuns 0) and exited 0 / PASS across all five sub-suites: carrier-negatives, authority-failures, ambiguous-authority, authority-overlap, desktop-survival.

Regressions PASS: typecheck (0), build (0), pnpm test (120/120), verify:static (99 files), smoke:carrier (0), smoke:worker (0), smoke:electron (0), smoke:slice2-step1 (0).

## Y. New corrective evidence

Root: docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01 (run-manifest.json, g15-root-cause.json, g15-stop-delivery.json, remaining-gates.json, test-summary.json, redaction-summary.json, plus the electron-regression.json produced by smoke:electron). The prior STEP1-20260909-IMPLEMENTATION-01 evidence (9 JSON) remains byte-identical (pre/post hashes recorded in the corrective run-manifest.json).

## Z. Governance state

V1_SLICE_2_STEP1 = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = PASS
V1_SLICE_2_IMPLEMENTATION = IN_PROGRESS
V1_CURRENT_STEP = V1_SLICE_2_STEP1_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_CURRENT_NEXT_ACTION = INDEPENDENT_REVIEW_V1_SLICE_2_STEP1

Step2 = NOT_AUTHORIZED; Step3 = NOT_AUTHORIZED; Provider = NO. No CLOSED/FROZEN/OWNER_ACCEPTED claim is made. Commit NO; Push NO; Staged NONE.
