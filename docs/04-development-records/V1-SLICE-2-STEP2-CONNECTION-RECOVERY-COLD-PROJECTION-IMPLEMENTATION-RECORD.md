# V1-SLICE-2 Step 2 Connection Recovery and Cold Projection Implementation Record

Date: 2026-09-10 (Asia/Shanghai)
Run: STEP2-20260910-IMPLEMENTATION-01
IMPLEMENTATION_RESULT = STOPPED_BLOCKED
FIRST_UNRESOLVED_BOUNDARY = MINOR_CORRECTIVE_BUDGET_EXHAUSTED

## Verdict and exact stop boundary

Step2 implementation and partial proof exist, but final acceptance is not proven. The required full Step1 regression exited 1 at scripts/smoke-slice2-step1.mjs:460: its existing authority-negative fixture calls spawn(process.env.SHACO_FORGE_POWERSHELL), and this invocation omitted that required environment value. Node reports ERR_INVALID_ARG_TYPE: file must be a string, received undefined. This is a concrete execution/fixture configuration error, not evidence of Product authority overlap.
Minor corrective budget is already 3/3 total. Completing the missing fixture execution environment would require a fourth Minor correction under a conservative reading of the user total budget. No correction or rerun was performed after this failure; it was not relabeled as a Major issue or exempted as environment work. The Owner must assess the blocker before further execution.
Last cumulative attempt 4 passed the complete non-Provider chain. A later self-review added a pending-mount loss fence and projection-error handling (Major 3), followed by 134 passing tests and build/type/static/Worker/Carrier/Electron regression. Full Step1 then failed before final cumulative revalidation. The earlier cumulative PASS is retained with its source-version limit and is not final-source acceptance.

## Baseline, authority and bounded scope

Product: master at f6349029fe87a1333c2e6c57cfaba1d512d86c02; initial worktree CLEAN, staged NONE, untracked NONE. Frozen Harness: cd5ef8148158c3a752a658978873241fdf8e2bbc, CLEAN before and after.
Before implementation, source discovery and authority reads covered Current State, Cumulative Regression Closure Gate, Slice2 lifecycle Contract, Carrier Amendment, Security Model, Step2 Entry and Shared Source clarification, Step1 Owner Closure, AUDIT-023 and P0-3 Client/Host map. Frozen public built exports and generated descriptors were inspected; byte identities are in run-manifest.json.
Implemented scope: specific Main connection recovery, generation fencing, read-only Workspace/Session/current Session reconstruction, conservative Worker replacement, truthful failure and OUTCOME_UNKNOWN. Step1 stays PASS / CLOSED / FROZEN. Step3 is NOT_AUTHORIZED; Provider authorization NO.
No Frozen Harness modification, Carrier/HMAC wire change, private Harness src import, dynamic Cordis, generic framework, new Agent RPC, Broker, Service, native dependency, second truth store, business replay or Step3 UI integration was introduced. Existing stock Harness modules remain composed without claiming new Product UI authority.

## Files changed

- apps/desktop/package.json — Declare the static nonvisual Product public ./client export.
- apps/desktop/scripts/prepare-harness-client.mjs — Preserve 28 Frozen public rows; build and append one static readiness observer.
- apps/desktop/src/client/recovery.mjs — Observe only public Harness store subscriptions; no business cache or new UI.
- apps/desktop/src/main/carrier-client.test.ts — Authenticated NamedPipe local mutation loss/no-retry assertion.
- apps/desktop/src/main/carrier-client.ts — Failure notification, complete pending cleanup, conservative sent mutation OUTCOME_UNKNOWN.
- apps/desktop/src/main/main.ts — Integrate coordinator and fresh Renderer document; narrow generation IPC; Main-only runtime driver.
- apps/desktop/src/main/recovery-coordinator.test.ts — Missing predicates, stale completions, namespace, ambiguity and pending mount races.
- apps/desktop/src/main/recovery-coordinator.ts — Concrete recovery, generation fencing, readiness and hashed read proofs.
- apps/desktop/src/main/worker-supervisor.test.ts — Recovery with unverified native identity launches no replacement.
- apps/desktop/src/main/worker-supervisor.ts — Bounded rediscovery and conservative replacement; fence old health probes.
- apps/desktop/src/preload/preload.cts — Pin one generation per document and expose narrow boolean readiness report.
- apps/desktop/src/renderer/global.d.ts — Type the narrow projection and public AppWebEntry disposal.
- apps/desktop/src/renderer/main.ts — Truthful status; hide incomplete projection and dispose old AppWebEntry.
- apps/desktop/src/renderer/transport.ts — Handle stale teardown cancellation without an unhandled rejection.
- apps/desktop/test-fixtures/step2-recovery-main.mjs — Real Product/Electron non-Provider driver with sanitized observation.
- apps/worker/src/profile.test.ts — Same-home rematerialization and mismatched junction rejection.
- apps/worker/src/profile.ts — Idempotently reuse only exact expected profile junction targets on replacement.
- docs/00-governance/SHACO-FORGE-CURRENT-STATE.md
- docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md
- docs/04-development-records/DEVELOPMENT-LOG.md
- docs/04-development-records/V1-SLICE-2-STEP2-CONNECTION-RECOVERY-COLD-PROJECTION-IMPLEMENTATION-RECORD.md
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/cold-projection.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/cumulative-e2e.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/gate-results.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/generation-fencing.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/mutation-outcome.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/recovery-state-machine.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/redaction-summary.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/run-manifest.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/test-summary.json
- docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01/worker-replacement.json
- package.json — Register dedicated tests and canonical Step2 smoke entry.
- scripts/smoke-slice2-step1.mjs — Redirect new regression evidence away from immutable Step1 formal roots.
- scripts/smoke-slice2-step2.mjs — Canonical real cumulative lifecycle/recovery/cold projection/replacement E2E.
- scripts/step2-command.mjs — Pinned toolchain command runner with append-only outcome history.
- scripts/step2-evidence.mjs — Explicit UTF8 evidence writer and before-change historical/source identities.
- scripts/step2-replacement-probe.mjs — Bounded non-Provider replacement root-cause diagnostic; preserves failed confirmation.
- scripts/user-loop-policy.test.mjs — Keep Frozen composition assertions and assert the one Product observer.

## Source discovery and public Harness reuse

Initially Main built one Carrier attachment and mostly published carrier-failed on loss. Preload had no document-generation pinning. Step1 already supported fresh same-Worker attachment. The embedded real AppWebEntry used public Harness Connection/Workspace/Session stores and stream semantics.
Confirmed public capabilities: workspace/follow baseline.value.items; session/list args._request; session/follow request.address.kind=session plus address.sessionId, snapshot/history; public Client session/page semantics; $events ready. Public connection.generation, workspaces.list, sessions.list and sessions.binding(current).session getSnapshot/subscribe supply readiness. No workspace/list or remote session/open/resume/lookup/delete was invented.
The 28 Frozen public Client rows stay in their original static order. One nonvisual Product public ./client row observes readiness. Public AppWebEntry run/dispose creates/discards Context; no private ctx inspection, copied journal/gap algorithm or Product business store is added.

## Recovery state and generation fencing

Specific Main RecoveryCoordinator realizes DISCONNECTED, DISCOVERING, AUTHENTICATING, CONNECTED, CONNECTION_LOST, RECONNECTING, INCOMPATIBLE and FAILED. Existing worker-starting bootstrap preserves WORKER_STARTING semantics. Carrier authentication alone never constitutes CONNECTED.
CONNECTED requires authenticated Carrier, current public Client generation and completed projection. Main checks actual events ready, Workspace baseline, Session roster and current Session snapshot when present; public Client contributes six booleans. A 30-second initial readiness timeout and public projection errors fail truthfully. Incomplete projection is hidden/inert.
A monotonic local generation and attempt fence guard requests and settlements. Preload pins a generation once per document; Renderer cannot choose its token. Every asynchronous operation checks generation before and after waiting. Stream handles namespace raw IDs by local generation, so old pull/cancel cannot target a reused fresh stream. Loss clears pending work, stream mappings and old health callbacks. The last correction fences a newly failed Carrier even while its recovery mount is pending; late completion cannot restore CONNECTED.
A fresh document discards old AppWebEntry, Context and subscriptions; one new public Harness Client reconstructs its stores. Product retains only bounded readiness, counts, transitions and identity hashes. Workspace/Session/Conversation content and persistence remain Harness-owned.

## Workspace, Session and current cold projection

The actual cumulative fixture uses only workspace/create, session/create and session/rename local mutations. It selects the already-created blank Session through the stock Harness workspace action. It submits no Prompt. New Desktop documents restore Harness-owned current selection and real snapshot/history, with hashed identities and counts only.
The following are measured prior attempt 4 checkpoints, not final-source runtime acceptance:
- CURRENT_SESSION_FROM_PUBLIC_HARNESS_TRUTH: generation 1; Workspace count 0; Session count 0; history records 4; Session SHA-256 20e22064d7b50541789e7e30824bcffc31919c3380316dab2bdba49f61d73090.
- FRESH_DESKTOP_SAME_WORKER_COLD_PROJECTION: generation 1; Workspace count 1; Session count 1; history records 4; Session SHA-256 20e22064d7b50541789e7e30824bcffc31919c3380316dab2bdba49f61d73090.
- FRESH_DESKTOP_AFTER_CRASH_SAME_WORKER_REATTACH: generation 1; Workspace count 1; Session count 1; history records 4; Session SHA-256 20e22064d7b50541789e7e30824bcffc31919c3380316dab2bdba49f61d73090.
- CARRIER_LOSS_REDISCOVERY_FRESH_AUTH_GENERATION_COLD_PROJECTION_CONNECTED: generation 2; Workspace count 1; Session count 1; history records 4; Session SHA-256 20e22064d7b50541789e7e30824bcffc31919c3380316dab2bdba49f61d73090.
- WORKER_CRASH_JOB_CLEANUP_REPLACEMENT_COLD_PROJECTION_CONNECTED: generation 3; Workspace count 1; Session count 1; history records 4; Session SHA-256 20e22064d7b50541789e7e30824bcffc31919c3380316dab2bdba49f61d73090.

## Carrier loss, same Worker and replacement

Prior attempt 4 observed Desktop graceful close and hard crash preserving Worker/Host/Helper PID/start tuples; fresh attachment changed credential/client identity hashes while Worker hash stayed equal. Actual pending unary/stream loss produced terminal results, zero old pending resources, stale callback rejection and fresh cold reads before CONNECTED.
Replacement waits for old Worker/Host/Helper processes to be definitely absent and native mutex/lifecycle authority to be absent. Ambiguous identity or PID reuse fails closed. Prior attempt 4 observed Worker hard crash, old Job cleanup, zero overlap, no child adoption, new Worker hash and generation 3. Profile materialization reuses an existing junction only if its exact real target matches; a different target is rejected.
Replacement cold truth could be repulled from the same Harness home, while Product explicitly retained REPLACEMENT_CONTINUITY_UNPROVEN. No in-flight business continuity is claimed. The latest source needs the full ambiguity runtime and final cumulative rerun after Owner assessment.

## OUTCOME_UNKNOWN and no replay

CarrierClient marks a mutation sent immediately before its wire write. Lost response through loss/timeout/abort yields OUTCOME_UNKNOWN. An authenticated deterministic NamedPipe peer using actual Product CarrierClient observed one workspace/rename frame, one Session read, complete termination and zero resend. The failed Client rejects new work. Automatic rebuilding only rereads Harness truth; known business mutations are rejected during reconstruction. No Prompt, Tool, Agent-turn, Approval, Question or Cancel replay exists.

## Dedicated Step2 gates on final source

| Gate | Requirement | Status | Proof / limit |
|---|---|---|---|
| S2G01 | Carrier loss leaves CONNECTED | PASS | recovery-state-machine.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G02 | Healthy same-Worker rediscovery | NOT_EXECUTED | cumulative-e2e.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G03 | Same Worker with fresh credential and client identity | NOT_EXECUTED | generation-fencing.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G04 | Old generation callbacks rejected | PASS | generation-fencing.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G05 | Old pending unary terminated | PASS | generation-fencing.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G06 | Old active streams terminated | PASS | generation-fencing.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G07 | Old stream IDs cannot address fresh streams | PASS | generation-fencing.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G08 | Workspace rebuilt from Harness truth | NOT_EXECUTED | cold-projection.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G09 | Session roster rebuilt from Harness truth | NOT_EXECUTED | cold-projection.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G10 | Current Session cold projection rebuilt | NOT_EXECUTED | cold-projection.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G11 | Projection completes after required reads | PASS | recovery-state-machine.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G12 | CONNECTED requires all three predicates | PASS | recovery-state-machine.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G13 | Recovery failures truthful | PASS | recovery-state-machine.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G14 | Stale completion cannot overwrite current state | PASS | generation-fencing.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G15 | OUTCOME_UNKNOWN and no blind retry | PASS | mutation-outcome.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G16 | Worker replacement without overlap or adoption | NOT_EXECUTED | worker-replacement.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G17 | Replacement changes Worker and Client generation | NOT_EXECUTED | worker-replacement.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G18 | Ambiguous authority fails closed | NOT_EXECUTED | worker-replacement.json; Current-source required runtime not fully revalidated. Prior attempt 4 PASS and/or deterministic proof retained; no promotion to final PASS. |
| S2G19 | No second business truth store | PASS | cold-projection.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
| S2G20 | No Provider/Prompt/Tool/Agent turn | PASS | test-summary.json; Current-source deterministic/unit/security proof; any prior cumulative checkpoint remains explicitly scoped before Major 3. |
PASS rows have current-source unit/deterministic/security or source proof. NOT_EXECUTED rows conservatively withhold final runtime acceptance despite earlier attempt 4 PASS or partial current unit proof. S2G18 has a passing actual Supervisor.recover unverified-native unit but the complete real held/hung/abandoned fixture was not reached.

## Cumulative E2E and Step1 regression

Prior attempt 4 complete chain: Product startup → Worker/Host/Helper → trusted discovery/fresh authenticated Carrier → real Electron/public Harness Client → current Session → Desktop graceful close/authority survival → fresh Desktop/cold projection → Desktop crash/authority survival → fresh Desktop → Carrier loss → rediscovery/fresh authentication/new generation → old callback rejection and unary/stream termination → Workspace/Session/current history repull → CONNECTED → Worker crash/Job cleanup → replacement/cold projection → bounded cleanup.
Prior attempt 4 emitted STEP1_REGRESSION = PASS, STEP2_DEDICATED_GATES = PASS and CUMULATIVE_NON_PROVIDER_E2E = PASS for that canonical chain. Those console labels do not replace the separately required complete Step1 runtime or the latest-source revalidation.
Final required Step1 command: FAIL, exit 1. Carrier security negatives and Helper/Host/Worker hard death plus explicit stop sub-results PASS; ambiguity, competing authority and real Desktop survival stages were not reached. Final cumulative Step2 command after Major 3: NOT_EXECUTED. Therefore STEP1_REGRESSION = FAIL, STEP2_DEDICATED_GATES = NOT_PROVEN, CUMULATIVE_NON_PROVIDER_E2E = NOT_EXECUTED_ON_FINAL_SOURCE; full regression FAIL.
Original Step1 runtime assertions were preserved. The runtime edit only redirects new output to ignored node_modules/.step2-validation/step1. The shared static composition assertion continues to require 28 unique Frozen public rows and now explicitly checks the one Product observer.

## Build, tests and validation

Pinned toolchain: Node v22.19.0, pnpm 11.7.0, .NET SDK 10.0.302, Electron 35.7.5. The command runner enforces Node/pnpm and explicit short PATH. Native/Electron runtime uses the normal Windows user; unit/build/type checks use the sandbox. The final Step1 invocation omitted its separately required explicit PowerShell environment value.

| Latest command | Exit | Command result | Final-source acceptance |
|---|---:|---|---|
| pnpm run typecheck | 0 | PASS | PASS |
| pnpm run build | 0 | PASS | PASS |
| pnpm test | 0 | PASS | PASS |
| pnpm run verify:static | 0 | PASS | PASS |
| pnpm run smoke:worker | 0 | PASS | PASS |
| pnpm run smoke:carrier | 0 | PASS | PASS |
| pnpm run smoke:electron | 0 | PASS | PASS |
| pnpm run smoke:slice2-step1 | 1 | FAIL | FAIL |
| pnpm run smoke:slice2-step2 | 0 | PASS | NOT_EXECUTED_AFTER_MAJOR_3 |
134 tests passed; 0 failed, skipped or cancelled. .NET Release passed with 0 warnings/errors. Static scan passed over 107 files. Strict UTF8, BOM/mojibake, JSON parse, Node syntax, git diff --check, historical byte identity and Frozen Harness cleanliness passed. No PowerShell source was changed, so PowerShell AST is not applicable. Product TCP listeners observed by Electron = 0. Final normal-user CIM inventory contains no Product Worker/Helper/test Desktop process; recorded Host/Job cleanup is complete.

## Bounded corrective history

| Cycle | Issue and root cause | Fix | Rerun / result |
|---|---|---|---|
| MINOR 1 | Pinned command could not find Node: Windows PATH/Path duplicate casing preserved ambient resolution | Remove every case variant and install short pinned PATH | typecheck exit 1 then corrected exit 0; one rerun |
| MINOR 2 | Static composition assertion expected total 28: Authorized nonvisual observer adds one Product row | Assert unchanged 28 unique Frozen rows plus exactly one Product public export; retain picker/native/source checks | 127 tests: 126 pass / 1 fail, then 127 pass; one rerun |
| MINOR 3 | COLD_SESSION_UI_SELECTION_NOT_FOUND: Frozen Harness hides unselected blank sessions and labels selected blanks New Session | Use the existing public workspace New Session UI action, which reuses the seeded blank session | Cumulative attempt 1 failed; attempt 2 passed selection and exposed independent read-proof issue |
| MAJOR 1 | Cold Session identity hash empty: Public follow request uses request.address.sessionId, not request.sessionId | Bind hash to the actual public Session address and assert it in controlled coverage | Cumulative attempt 2 failed; attempt 3 passed cold projection through same-Worker generation 2 |
| MAJOR 2 | Replacement startup exited: Profile materialization attempted to recreate existing junctions in the same DSH_HOME (EEXIST) | Reuse only an existing symbolic link whose real target exactly matches; mismatches fail closed | Cumulative attempt 3 failed; one unchanged supervisor probe plus direct materialization confirmed root cause; attempt 4 full chain PASS |
| MAJOR 3 | Self-review: newly attached Carrier loss during pending recovery mount could be ignored: Existing in-flight recovery guard returned before fencing the new failed Carrier | Immediately fence and fail the in-flight recovery; invalidate late completion; public store error also publishes terminal failure | Added pending-mount loss/late completion and projection-error tests; 134 tests PASS; final cumulative revalidation NOT_EXECUTED after regression budget stop |
| STOP: fourth Minor not applied | Required Step1 fixture PowerShell executable environment omitted; spawn file undefined | No fix after budget exhausted | No rerun; final regression FAIL |
Minor used 3/3 total, one approach; Major used 3/4, one recovery strategy. Minor budget cannot borrow from the remaining Major cycle. Runtime failure was diagnosed before any retry. Previous distinct runtime root causes each received one post-fix rerun; the replacement probe was the one unchanged confirmation. There was no blind retry.
One earlier environment-only confirmation occurred before this boundary: sandbox Electron GPU startup failed with -1073741515 (process exit 2147483651). The unchanged regression passed as the normal Windows user, with no Product source change. This is disclosed separately rather than erased. CIM parent/start identities tied Worker 35256, Helper 62424 and Host 38784 to sandbox Electron 62212, followed by targeted cleanup. The final missing PowerShell invocation is conservatively treated as a further Minor execution correction and is not given another exception.
All failed command attempts remain in test-summary.json; all four cumulative attempts remain in cumulative-e2e.json. The failed Worker replacement diagnostic and EEXIST root-cause confirmation remain in worker-replacement.json.

## Evidence

Root: docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-IMPLEMENTATION-01

| File | Bytes | SHA-256 |
|---|---:|---|
| run-manifest.json | 59619 | 3c98a749e2ad547796269be00fd12c23b0d4cd641f7ef1af3894cf309b8dc166 |
| recovery-state-machine.json | 22017 | 9495140a8218b2f57b3d1c66419371a71b4442000b02f9561c008729086534b0 |
| generation-fencing.json | 3946 | 876a2e438e6fc397620817e6ca614677542681ccb85614b76462482e45549c07 |
| cold-projection.json | 9948 | 0d4ff627a18dd77f505e20a10e569cb3d6fad60f9490659597a59e4d5deb842f |
| worker-replacement.json | 2794 | 513b3ee1817ad471327f2c9bf9f2884eb3d0bfd7a07dd3ad8e89426f62783ed1 |
| mutation-outcome.json | 772 | 461e37f698ae670a5d8a2dc6b832410b77e49fb6d41b7f594b10264b2d49d666 |
| cumulative-e2e.json | 94071 | c6197a8dcb51a2c3edbbe933aeda572139470431c3ac08ad7983d16b96585088 |
| gate-results.json | 9574 | 2dc462ae7e796959529666be053cb287eac1cd55fadb77701b50d0d606c0383b |
| test-summary.json | 17291 | 653de7654a8cc996cfb5c74c8a1df92377fc0c1dceef9b904c449d03bc3787ba |
| redaction-summary.json | 958 | 2f67491e83aa2512939e4ba2deaa40ecde9563862d138eba5285a849978ce382 |
Exactly ten consolidated JSON files are delivered. No raw secret, HMAC proof, exact private Carrier endpoint, credential bytes, private Workspace path or private Session content is retained. Identity hashes and numeric process tuples are nonsecret evidence. This record has no circular self-hash; its final bytes/SHA are reported externally.

## Step1 historical preservation

All 51 historical/frozen baseline entries are byte-identical. Pre aggregate SHA-256: 10f327015150f02e865928d4b21cfc61f02b13b4ef818ffcc6aff8022f97c73f. Post aggregate SHA-256: 10f327015150f02e865928d4b21cfc61f02b13b4ef818ffcc6aff8022f97c73f. The ordered aggregate hashes UTF8(path + NUL + bytes + NUL + sha256 + LF). Complete per-file before/after SHA and byte counts are in run-manifest.json.
This includes both formal Step1 Evidence groups, Implementation/Blocked/Owner Closure records, historical probes, reviews including AUDIT-023, and frozen Architecture/Carrier/Security policy assets. Shared Product source changes do not rewrite those historical files.

## Provider and governance

providerRuns = 0; Prompt/Tool/Agent-turn executions = 0. No Provider Gate was encountered as necessary before this stop; this is a fixture-budget blocker, not a Provider authorization request. The conditional real active Agent-turn continuity scenario remains unexecuted and separately gated.
Governance records STOPPED_BLOCKED and the precise implementation blocker. It does not advance to IMPLEMENTED_WAITING_INDEPENDENT_REVIEW, CLOSED, FROZEN or OWNER_ACCEPTED. Step1 stays PASS / CLOSED / FROZEN, Slice2 IN_PROGRESS, Step3 NOT_AUTHORIZED and Provider authorization NO.

## Git and remaining risks

Product master/HEAD and Frozen Harness HEAD are unchanged. Staged NONE, commit NO, push NO. Source/tests/scripts, consolidated Step2 Evidence, this record and three current governance files remain reviewable and uncommitted. No history reset or discarded changes.
- Full Step1 regression and latest-source cumulative acceptance are unresolved; do not infer implementation PASS from earlier sub-results.
- The Owner must assess the exhausted Minor budget and missing fixture runtime configuration before further correction/revalidation.
- Latest pending-mount race correction passed deterministic tests but lacks the final real cumulative rerun.
- Real active Provider turn continuity is untested; replacement intentionally reports continuity unproven.
- Fresh documents discard transient UI memory. PID reuse/ambiguous authority fails closed and may need manual resolution.
- Existing Vite classic-script/large-chunk warnings and terminal pull rejection logs at Electron teardown remain nonblocking diagnostics; cleanup passed.
- No packaged runtime, hostile same-user binary attestation, new Step3 UI or real second-user login acceptance is claimed.

NEXT_ACTION = ARCHITECTURE_OWNER_ASSESS_STEP2_IMPLEMENTATION_BLOCKER

## Architecture Owner Authorized Final Validation Corrective

Run ID: STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01. Authorization: STEP2_FINAL_VALIDATION_CORRECTIVE = AUTHORIZED. Started 2026-09-10T02:17:33.379Z; final required command ended 2026-09-10T02:31:07.772Z.

This is an independent bounded Corrective. The entire preceding record remains the historical STOPPED_BLOCKED run, including Minor 3/3 EXHAUSTED, Major 3/4 USED, providerRuns 0, original failure cause and original Evidence identities. No historical attempt is promoted to final-source PASS.

### Corrective verdict and baseline

CORRECTIVE_RESULT = PASS. Step2 = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW. Product master HEAD f6349029fe87a1333c2e6c57cfaba1d512d86c02; initial worktree exactly 38 paths (18 tracked modified, 20 untracked), staged NONE. All 24 previous final source identities matched at entry. Frozen Harness HEAD cd5ef8148158c3a752a658978873241fdf8e2bbc, pre/post CLEAN.

### Root cause, changes and reproducibility

The existing authority-negative fixture supplied an unset SHACO_FORGE_POWERSHELL directly to spawn, causing ERR_INVALID_ARG_TYPE before PowerShell started. scripts/smoke-slice2-step1.mjs now resolves an explicit override first, then pwsh.exe through at most 128 absolute PATH directories, then the SystemRoot standard Windows PowerShell executable. It validates the executable and existing fixture API with bounded probes and fails with POWERSHELL_PREFLIGHT_FAILED before runtime fixtures. No undefined executable reaches fixture spawn.

scripts/step2-evidence.mjs now accepts isolated run identity/output environment values and defaults ordinary regression output to an ignored per-run directory. This prevents new canonical Step2 tests from overwriting the historical implementation Evidence. No Product source or PowerShell fixture changed. Existing assertion lines and mode loops are identical.

Both canonical Step1 runs unset SHACO_FORGE_POWERSHELL and resolve PATH_PWSH successfully. Six focused preflight checks prove explicit precedence, empty/missing/non-PowerShell rejection and unavailable/incompatible fallback diagnostics. This machine standard Windows PowerShell lacks the existing NamedPipeServerStreamAcl API; it is correctly rejected before fixtures. Another V1 Windows development environment needs a compatible pwsh on PATH. No current-user/cache path is hardcoded in repository code.

### Final-source Step1 and Step2 runtime

Source aggregate SHA-256: 5bbaaa6a463c43e11e9cda4efb1595149e6186138850e7af99123eb92e0711c1. Built runtime aggregate SHA-256: 0d44df42f14fdeed910f9c51e81861a3e20fe24cdef6e1b5b59402894612934a. All eleven command invocations used these same source and build bytes, including after rebuild. Per-file lists, command timestamps and raw-log identities are in the new Evidence.

Step1 held/hung/abandoned, Carrier security and lifecycle negatives, Helper/Host/Worker hard death, explicit stop, competing authority, Desktop graceful close/crash survival and fresh reattach all ran in both initial and confirmation commands. Both exit 0; STEP1_REGRESSION = PASS. The unchanged fixture SHA is preserved.

Both new Step2 runs independently covered Product startup -> Worker/Host/Helper -> trusted discovery -> authenticated Carrier -> Electron -> graceful close -> authority survival -> fresh Desktop/same Worker/cold Workspace and Session -> Desktop crash -> authority survival -> fresh reattach -> Carrier loss -> old unary/stream termination and generation fencing -> rediscovery/fresh credential and Client -> Workspace/Session/current Session repull -> PROJECTION_REBUILD_COMPLETE -> CONNECTED -> Worker hard crash -> all old authority definitively gone -> replacement/new workerInstanceId/generation 3 -> cold projection -> bounded no-orphan cleanup.

STEP2_DEDICATED_GATES = PASS. CUMULATIVE_NON_PROVIDER_E2E = PASS. This acceptance uses the two new runs only, not historical Attempt 4.

### S2G01-S2G20 final results

| Gate | Result | Final-source proof |
|---|---|---|
| S2G01 | PASS | Fresh cumulative CONNECTION_LOST transition plus passing pending-mount loss unit. |
| S2G02 | PASS | Both new cumulative runs: same Worker rediscovered after graceful close, crash and Carrier loss. |
| S2G03 | PASS | Same Worker hash with unequal credential/client hashes at new attachment. |
| S2G04 | PASS | Actual stale callback rejected plus delayed item/end/error generation tests. |
| S2G05 | PASS | Pending unary before loss > 0, TERMINATED result and 0 pending afterwards; authenticated peer unit. |
| S2G06 | PASS | Active stream before loss > 0, TERMINATED result and 0 active afterwards. |
| S2G07 | PASS | Passing current-source test deliberately reuses a raw stream ID across generations. |
| S2G08 | PASS | Actual Harness Workspace baseline, seeded identity hash and positive count after each cold reattach. |
| S2G09 | PASS | Actual Session roster repull, seeded current Session identity and positive count. |
| S2G10 | PASS | Fresh public Client reads current Session snapshot/history with matching hash and nonzero history count. |
| S2G11 | PASS | Actual read proofs precede all three ready predicates; missing-read controlled test passes. |
| S2G12 | PASS | Every observed CONNECTED transition has authenticated Carrier, current Client and complete projection. |
| S2G13 | PASS | Passing current-source ambiguity and public projection-error terminal failure tests. |
| S2G14 | PASS | Late unary/item/end/error/after-stop and pending-mount completion tests all pass. |
| S2G15 | PASS | Authenticated deterministic NamedPipe peer: one mutation frame, OUTCOME_UNKNOWN, zero resend. |
| S2G16 | PASS | Old Worker/Host/Helper gone, zero authority overlap, no old-child adoption; replacement runtime passes. |
| S2G17 | PASS | Worker hash changes, generation 3, prior read proofs cleared; replacement continuity remains explicitly unproven. |
| S2G18 | PASS | Both new Step1 held/hung/abandoned fixtures plus actual Supervisor.recover unverified-native unit pass. |
| S2G19 | PASS | Current-source inspection: public Harness stores own truth; Product observer and coordinator retain transient readiness/counts/hashes only. Static composition 28 Frozen public rows plus 1 observer. |
| S2G20 | PASS | All runtime prompt counters and business replay counters 0; allowlisted commands only; no Provider/Prompt/Tool/Agent-turn execution. |

### Complete regression

| Phase | Command | Exit | Result | Start UTC | End UTC |
|---|---|---:|---|---|---|
| initial | pnpm run smoke:slice2-step1 | 0 | PASS | 2026-09-10T02:20:19.799Z | 2026-09-10T02:22:51.102Z |
| initial | pnpm run smoke:slice2-step2 | 0 | PASS | 2026-09-10T02:23:23.919Z | 2026-09-10T02:23:58.807Z |
| full | pnpm run typecheck | 0 | PASS | 2026-09-10T02:24:50.464Z | 2026-09-10T02:24:54.746Z |
| full | pnpm run build | 0 | PASS | 2026-09-10T02:24:55.506Z | 2026-09-10T02:25:14.069Z |
| full | pnpm test | 0 | PASS | 2026-09-10T02:25:14.805Z | 2026-09-10T02:25:32.740Z |
| full | pnpm run verify:static | 0 | PASS | 2026-09-10T02:25:33.480Z | 2026-09-10T02:25:34.030Z |
| full | pnpm run smoke:worker | 0 | PASS | 2026-09-10T02:26:19.602Z | 2026-09-10T02:26:31.411Z |
| full | pnpm run smoke:carrier | 0 | PASS | 2026-09-10T02:26:32.152Z | 2026-09-10T02:27:23.408Z |
| full | pnpm run smoke:electron | 0 | PASS | 2026-09-10T02:27:24.153Z | 2026-09-10T02:27:44.306Z |
| full | pnpm run smoke:slice2-step1 | 0 | PASS | 2026-09-10T02:27:45.031Z | 2026-09-10T02:30:26.266Z |
| full | pnpm run smoke:slice2-step2 | 0 | PASS | 2026-09-10T02:30:27.018Z | 2026-09-10T02:31:07.772Z |

Unit 134/134; failures/skips/cancellations 0. Static 107 files. .NET SDK 10.0.302 Release builds ran inside build and test with exit 0, warnings 0, errors 0. Native/Electron runtime ran as the normal Windows user. Final observed Product TCP listeners 0 and final Product process inventory empty. Existing Vite classic-script and chunk-size warnings remain nonblocking.

### Independent Corrective budget

FINAL_VALIDATION_CORRECTIVE_BUDGET: Test Harness 1/2 cycles and 1/2 approaches; Product Regression 0/1 cycles and 0/1 strategies. Step1 and Step2 each ran once initially and once as the required unchanged full-regression confirmation. Post-Product-fix reruns 0; blind retries 0. Six preflight-only checks launch no authority fixture. No previous Minor/Major budget was extended.

### New Evidence identities

Root: docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01

| Path | Bytes | SHA-256 |
|---|---:|---|
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/run-manifest.json | 92260 | 1688a5e192ff35b0eabcd10eae20bb95aa4a0ec0e6de3d9388f08c1dd6fd4822 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/powershell-resolution.json | 5559 | 2f53b6272fe1eff5676dee571a1a58c64d8d17282e36fa434ffece6cedd3048d |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/step1-regression.json | 151311 | 6e16c36e355872c58f0aa9565462a9a08ead919daf9e9eade7645af6b54581b0 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/step2-cumulative-e2e.json | 90778 | 74abc2c105757125cfc0f8c686739ef10dcfb16926f30906e20d9542ca95c951 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/gate-results.json | 9688 | 64801631a0a1c1fbfe3d3bd11a471329d1980bd5ca5312cc4adfdb47a3265010 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/test-summary.json | 12252 | 2583f32d84f6e4c22035d8549c527fc8b679c0d163b4b9d3045c940d748297b9 |
| docs/04-development-records/evidence/V1-SLICE-2/STEP-2/STEP2-20260910-FINAL-VALIDATION-CORRECTIVE-01/redaction-summary.json | 966 | dcf9767947a70c2ebde8ae1e12ffa3a7af112c4ca123eee0bf06baf07f47db7e |

The record is append-only relative to its captured initial bytes; its final identity is reported outside this document to avoid a circular self-hash.

### Historical preservation

51-file pre aggregate: 10f327015150f02e865928d4b21cfc61f02b13b4ef818ffcc6aff8022f97c73f. Post aggregate: 10f327015150f02e865928d4b21cfc61f02b13b4ef818ffcc6aff8022f97c73f. EXACT_MATCH for every byte and SHA. All ten historical Step2 Evidence files also match their initial bytes/SHA: aggregate b54a1e6b57b5b5da3f6814c0e98a5420171f38b2e51b689fcc0a9d58774a74bf. Complete pre/post identities are preserved in run-manifest.json.

### Provider, governance, Git and remaining limits

providerRuns = 0. Provider Gate required for this non-Provider acceptance = NO. Real Prompt/Tool/Agent-turn execution = 0. Conditional active Provider-turn continuity remains separately unauthorized and unexecuted. Replacement explicitly reports REPLACEMENT_CONTINUITY_UNPROVEN.

V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
STEP1_REGRESSION = PASS
V1_SLICE_2_STEP2 = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_SLICE_2_STEP2_IMPLEMENTATION_RESULT = PASS
V1_SLICE_2_STEP2_DEDICATED_GATES = PASS
V1_SLICE_2_STEP2_CUMULATIVE_NON_PROVIDER_E2E = PASS
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V1_CURRENT_STEP = V1_SLICE_2_STEP2_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_CURRENT_NEXT_ACTION = INDEPENDENT_REVIEW_V1_SLICE_2_STEP2

Final reviewable worktree: 18 tracked modified, 27 untracked, 45 paths; original 38 paths retained. Staged NONE. Commit NO. Push NO. Current State, Document Map and Development Log reflect this new Corrective result while retaining the prior STOPPED_BLOCKED checkpoint. No Independent Review is started or claimed.

Independent Review remains required. No packaged runtime, real second-user login or active Provider-turn continuity acceptance is claimed. The standard Windows PowerShell fallback is usable only if it supplies the unchanged fixture API; incompatible installations receive explicit preflight failure.

NEXT_ACTION = INDEPENDENT_REVIEW_V1_SLICE_2_STEP2
