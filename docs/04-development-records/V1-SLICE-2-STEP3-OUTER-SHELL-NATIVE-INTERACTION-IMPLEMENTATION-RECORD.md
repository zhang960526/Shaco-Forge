# V1-SLICE-2 Step3 Outer Shell / Native / Interaction Implementation Record

> HISTORICAL SUPERSEDED FOR CURRENT PRESENTATION — 2026-09-11。下列 Outer Shell 与 REVIEW026 Composition 仅保留历史来源，不代表当前 Full Shaco UI。当前实现及新组合见 [Full Shaco Dual Theme Implementation Record](V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md)。旧 Evidence 原样保留；本标记不关闭 Step3/Slice2，也不撤销既有 Worker/Carrier/Recovery 业务证明。

Implementation result: PASS. State: IMPLEMENTED_WAITING_INDEPENDENT_REVIEW. Independent Review NOT_PERFORMED; no Step3 closure, freeze of acceptance, or Owner acceptance is claimed.

Evidence: [STEP3-20260910-IMPLEMENTATION-01](evidence/V1-SLICE-2/STEP-3/STEP3-20260910-IMPLEMENTATION-01/run-manifest.json). Provider runs = 0. Stage / Commit / Push = NO.

## Baseline

Product master at 5118053f625d01faba6617cace481df3091ba5be; starting worktree clean. Frozen Harness cd5ef8148158c3a752a658978873241fdf8e2bbc, read-only and still clean. Contract SHA-256 6cad09319e8793c4cebf95c4dfae4cd04f644adbed1b0c51647e93901e42721b; Owner Decision V1-SLICE-2-STEP3-CONTRACT-GATE-FREEZE-AUTH-20260910-01 authorization consumed. 74 immutable historical/authority identities unchanged.

## Implemented files and behavior

- `D:/Project/Shaco-Forge/apps/desktop/index.html`
- `D:/Project/Shaco-Forge/apps/desktop/scripts/prepare-harness-client.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/client/recovery.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/main/main.ts`
- `D:/Project/Shaco-Forge/apps/desktop/src/preload/preload.cts`
- `D:/Project/Shaco-Forge/apps/desktop/src/renderer/global.d.ts`
- `D:/Project/Shaco-Forge/apps/desktop/src/renderer/main.ts`
- `D:/Project/Shaco-Forge/apps/desktop/src/renderer/styles.css`
- `D:/Project/Shaco-Forge/apps/desktop/test-fixtures/step2-recovery-main.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/tests/user-loop-evidence.test.ts`
- `D:/Project/Shaco-Forge/package.json`
- `D:/Project/Shaco-Forge/scripts/smoke-slice2-step2.mjs`
- `D:/Project/Shaco-Forge/scripts/step2-command.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/scripts/composition-identity.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/client/settings.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/client/shell-state.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/client/shell-state.test.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/client/sidebar.mjs`
- `D:/Project/Shaco-Forge/apps/desktop/src/main/workspace-picker.test.ts`
- `D:/Project/Shaco-Forge/apps/desktop/src/main/workspace-picker.ts`
- `D:/Project/Shaco-Forge/apps/desktop/test-fixtures/step3-shell-driver.mjs`
- `D:/Project/Shaco-Forge/scripts/smoke-slice2-step3.mjs`
- `D:/Project/Shaco-Forge/scripts/step3-baseline.mjs`
- `D:/Project/Shaco-Forge/scripts/step3-composition.test.mjs`
- `D:/Project/Shaco-Forge/scripts/step3-final-composition.mjs`
- `D:/Project/Shaco-Forge/scripts/step3-interaction.test.mjs`

Same static @shaco-forge/desktop/client row; public sidebar single/root registration at -1 shadows the unchanged Frozen occupant at 0. One AppWebEntry and one Harness Context; React 18.3.1 remains external to the Product row. HTML passive sidebar removed. Project groups and Chat Items read Harness workspaces.list / sessions.list. Only selection, search, expansion and Settings route are ephemeral, generation-fenced Product state.

New Chat delegates selected Workspace to uiWorkspace.connectWorkspace then sessions.open; Harness owns presets and blank-session reuse. Without selection, native picker precedes Workspace creation. No recent fallback or fabricated session/open RPC. Main authorizes exact window/WebContents/main frame/document epoch/current generation before and after a single-directory dialog. Renderer exposes only workspace.pickDirectory; generic FS, generic IPC and native dialog options remain unavailable.

Settings uses shell.overlay, public llm directory, shared settingsScope mirror, settingsSchema, remote.settings and remote.credentials. Custom Provider route, endpoint, protocol and models were saved through the real UI and reread from Harness. Exact integer namespace revision is mandatory; undefined is not fencing. Credential set/unset was exercised using a disposable generated value, immediately clearing the input and reading status only. Unknown outcomes reread without replay. No additional General setting is required for this workflow; full Appearance/advanced General remain deferred.

Harness owns Conversation, Composer, Tool/Result, Approval, Question, Model and Permission. Actual Conversation content is centered with 1100px maximum; right details are collapsed by default. Sidebar Settings stays at the bottom; Worker status is low noise. Outer UI has no interaction event ID dependency, pending model, answer UI, settlement store or implicit Agent cancel.

## Composition identity

Generated and frozen before final runtime acceptance. All regeneration history is retained in composition-history.json. The exact 28 Frozen IDs/order/public exports/SHA values are in baseline.json and composition-identity.json; all 29 factory registrations validated and nine fail-closed variants passed.

- Shaco SHA-256: 90596c5a746f288cc185577485c0de33a5de67ae1c0403ee4121ac0560256f14
- Graph revision: shaco-v1-slice-2-step3-cd5ef81
- Manifest SHA-256: d861000ea0e1dbe923e9f5603f8da2865d3c62f22c0284e99e86411b428604ba
- Bootstrap SHA-256: 4e5e67c4dd9f6c19c7470f5a4c97074fd9cf08eb89734e27111a2d80bc8dbe57
- Application SHA-256: 8450a5ddf4a08a9a83e31cb9db6445dfac5460ddfb698fe36af06d605a6448d2

## Dedicated gates

| Gate | Result | Evidence |
|---|---|---|
| S3G01 Exact current entry 29-row baseline | PASS | baseline.json |
| S3G02 Final composition generated and frozen before acceptance | PASS | composition-identity.json |
| S3G03 Composition fail-closed negatives | PASS | regression/unit.log |
| S3G04 Sidebar seat and public shadow semantics | PASS | ui-evidence.json |
| S3G05 Single Context and Harness truth ownership | PASS | interaction-security.json |
| S3G06 Selected Workspace New Chat | PASS | shell-settings.json |
| S3G07 No Workspace native Open Project | PASS | shell-settings.json |
| S3G08 Harness Project Directory | PASS | shell-settings.json |
| S3G09 Session navigation and generation rebuild | PASS | cumulative-e2e.json |
| S3G10 Provider and Custom Provider Settings | PASS | shell-settings.json |
| S3G11 Model Endpoint Relay Settings | PASS | shell-settings.json |
| S3G12 Credential and secret hygiene | PASS | shell-settings.json |
| S3G13 Native Picker success | PASS | shell-settings.json |
| S3G14 Native Picker cancel | PASS | shell-settings.json |
| S3G15 Native failure stale security boundary | PASS | interaction-security.json |
| S3G16 Harness Approval Question preservation | PASS | interaction-security.json |
| S3G17 Public interaction identity boundary | PASS | interaction-security.json |
| S3G18 Cancel distinct from disconnect | PASS | interaction-security.json |
| S3G19 Renderer security and truthful failures | PASS | interaction-security.json |
| S3G20 Cumulative non-Provider E2E | PASS | cumulative-e2e.json |

S3G16 uses unmodified frozen public Client bundles, deterministic public-service fixtures, SSR rendering and Harness-owned pending objects; real Host pending replay after a Provider turn is not exercised. Contract section 15 permits this structural/fixture method; Provider proof is separately required if requested.

## Cumulative and full regression

- pnpm run typecheck: PASS (2026-09-10T10:42:38.767Z to 2026-09-10T10:42:42.906Z)
- pnpm run build: PASS (2026-09-10T10:39:59.302Z to 2026-09-10T10:40:18.473Z)
- pnpm test: PASS (2026-09-10T10:54:44.020Z to 2026-09-10T10:55:02.896Z)
- pnpm run verify:static: PASS (2026-09-10T10:55:40.126Z to 2026-09-10T10:55:40.709Z)
- pnpm run verify:theme: PASS (2026-09-10T10:55:42.564Z to 2026-09-10T10:55:43.137Z)
- pnpm run smoke:worker: PASS (2026-09-10T10:43:00.447Z to 2026-09-10T10:43:13.160Z)
- pnpm run smoke:carrier: PASS (2026-09-10T10:43:55.224Z to 2026-09-10T10:44:48.699Z)
- pnpm run smoke:electron: PASS (2026-09-10T10:46:29.287Z to 2026-09-10T10:46:51.692Z)
- pnpm run smoke:slice2-step1: PASS (2026-09-10T10:47:07.838Z to 2026-09-10T10:50:02.822Z)
- pnpm run smoke:slice2-step2: PASS (2026-09-10T10:53:23.978Z to 2026-09-10T10:54:08.663Z)
- pnpm run smoke:slice2-step3: PASS (2026-09-10T10:45:10.397Z to 2026-09-10T10:45:59.736Z)

Final unit count 162; cumulative chain includes startup, real directory creation, blank reuse, local Settings writes, graceful close and Worker survival, fresh Desktop and cold projection, Carrier loss with stale work rejection, Worker replacement and bounded cleanup. No business/answer/cancel replay. Current native picker OS result is injected only in the test Main process; real Preload/Main authorization and public Harness operations execute. The operating-system picker chrome is not manually exercised.

## Visual evidence

- docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-IMPLEMENTATION-01/step3-ui-37596-1.png: 129047 bytes; SHA-256 a0f73ea2bd89ecc5727685953d813449b6ed25a477c6cfecceeb758ea66cf835
- docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-IMPLEMENTATION-01/step3-ui-15540-1.png: 129047 bytes; SHA-256 a0f73ea2bd89ecc5727685953d813449b6ed25a477c6cfecceeb758ea66cf835
- docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-IMPLEMENTATION-01/step3-ui-37472-1.png: 129047 bytes; SHA-256 a0f73ea2bd89ecc5727685953d813449b6ed25a477c6cfecceeb758ea66cf835
- docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-IMPLEMENTATION-01/step3-ui-37472-2.png: 129047 bytes; SHA-256 a0f73ea2bd89ecc5727685953d813449b6ed25a477c6cfecceeb758ea66cf835

Screenshots contain only disposable workspace/blank conversation, no secret. Structural DOM assertions are separate from screenshots. Earlier zero-byte images are rejected historical evidence; final captures are nonempty. Actual content width is 1100px and no permanent Inspector is shown.

## Corrective history

- C01 Settings unit fixture syntax error. Root cause: Missing closing object brace in newly authored fixture. Fix: Corrected brace. 1 cycle / 1 approach. Verification: Pinned Node focused tests passed; subsequent full unit passed.
- C02 Interaction fixture could not resolve React from repository root. Root cause: React is provided through desktop package dependencies. Fix: createRequire anchored to desktop package.json. 1 cycle / 1 approach. Verification: Actual frozen public Approval/Question bundles rendered and settled successfully.
- C03 Renderer security source assertion failed. Root cause: Test checked main.ts instead of existing security.ts preferences owner. Fix: Assert existing preferences owner. 1 cycle / 1 approach. Verification: Interaction/security fixture 5 of 5 passed.
- C04 Full unit 160 PASS, 1 FAIL. Root cause: Historical test required disabled passive sidebar removed by authorized Step3 scope. Fix: Check removal of HTML sidebar and public same-context slot registration. 1 cycle / 1 approach. Verification: 161 of 161 passed; later receiver regression added, 162 of 162 passed.
- C05 First canonical smoke failed before Electron launch: Git ENOENT. Root cause: Pinned command wrapper intentionally shortened PATH and omitted Git. Fix: Resolve Git before shortening PATH; pass explicit executable to composition verification. 1 cycle / 1 approach. Verification: Subsequent canonical smoke verified composition and launched Electron.
- C06 STEP3_SIDEBAR_TIMEOUT. Root cause: Unbound public Harness model methods lost their this receiver in React useSyncExternalStore, triggering slot fallback. Fix: Call subscribe/getSnapshot through their public source object; add method-receiver regression. 1 cycle / 1 approach. Verification: Actual sidebar, native cancel/failure/success, Workspace creation, Session open and blank reuse subsequently passed.
- C07 STEP3_SETTINGS_PUBLIC_READ_TIMEOUT. Root cause: Cordis consumer declared nested remote services but omitted the required remote root service. Fix: Declare remote root and guard declaration in tests. 1 cycle / 1 approach. Verification: Real Settings local reads and custom Provider fields subsequently passed.
- C08 Lifecycle smoke reported PASS but visual evidence was not acceptable. Root cause: Width assertion measured display:contents slot anchor (zero width); screenshot NativeImage was empty. Fix: Constrain/measure actual Conversation content child; require positive dimensions and nonempty screenshot; explicitly restore/show/wake window for capture. 1 cycle / 1 approach. Verification: Final real Electron captures are nonempty; Conversation 1100px, positive height, details collapsed; full cumulative chain PASS.

## Security, encoding, cleanup and handoff

Provider runs 0. Final cleanup reports no orphan Worker/Host/Helper and all test Desktop processes exited. Renderer remains sandboxed and untrusted. Every changed text file is strictly decoded as UTF-8, retains prior BOM where present and is scanned for mojibake. Immutable Frozen Harness and Step1/Step2 evidence were not modified.

Git: 67 changed paths (17 tracked, 50 untracked), staged NONE. Complete absolute path inventory: changed-files.json. Governance synchronization is limited to Current State, Document Map, Development Map and Development Log. Next action: INDEPENDENT_REVIEW_V1_SLICE_2_STEP3_IMPLEMENTATION. No Independent Review, commit, push or Packaging was performed.

## Architecture Owner Authorized REVIEW-026 Corrective

Corrective result: PASS. State: IMPLEMENTED_WAITING_INDEPENDENT_REREVIEW. REVIEW-026 remains FAIL / FAIL_REQUIRES_CORRECTIVE. F-026-01 remains HIGH / OPEN_BLOCKING; F-026-02 remains HIGH / OPEN_REVIEW_REPRODUCTION_GAP, with PRODUCT_DEFECT = NOT_ESTABLISHED. Only independent REVIEW-026B can close these findings; it has not been executed.

The original Implementation PASS, C01-C08, S3G16 STRUCTURAL_FIXTURE limitation and original 36-path Evidence above are retained as historical claims. They are not retroactively promoted to real Host lifecycle proof. REVIEW-026 was supplied as the Architecture Owner corrective input; no separate REVIEW-026 audit file existed in this baseline.

New evidence: [STEP3-20260910-REVIEW026-CORRECTIVE-01](evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026-CORRECTIVE-01/run-manifest.json).

The fixture is loaded only when the exact test profile and explicit lifecycle flag are both present. The actual profile materializer passes all four isolation cases; the default profile contains no test fixture export/module/patch entry. Host calls resolveAgent for the existing real Harness New Chat Session and verifies the exact registered live root Agent. It invokes approval.request and userQuestions.ask directly. Approval uses the required public Session audit enclosure, with zero Agent-driver starts, Prompt, Tool, step or Provider execution. This is test profile integration, not a Product functional corrective.

For each interaction a real first Desktop displays the frozen Harness UI, then closes without answering. Worker/Host/Helper PID/start identity survives. A fresh Electron process and fresh AppWebEntry with fresh user-data rebuild Workspace/Session projections; the driver selects the sole real Session through Sidebar. Session/event hashes match, the client identities change, and Host pending stays 1 with settlement 0. Real Harness UI settles once; a valid old-client envelope is rejected specifically because its event stream no longer exists; duplicate current result is a safe no-op. Final Host pending is 0, settlement is exactly 1, cancel/automatic-answer/replay deltas are 0. Approval and Question have independent records.

Internal envelope observation/probes exist only in NOT_PRODUCTION_TEST_DRIVER_ONLY and remain in IPC memory. The Shaco client row has no eventId dependency or private Gateway import. The pre-existing passive user-loop evidence observer still reads transport correlation IDs, is byte-identical to HEAD, and is disclosed separately; it performs no navigation or settlement and was not extended by this corrective.

Node 22.19.0, pnpm 11.7.0, .NET 10.0.302 and Electron 35.7.5 were used. Get-Command pwsh resolved PowerShell 7.6.5.0; the path was passed explicitly through SHACO_FORGE_POWERSHELL and is recorded only as environment provenance. Sandbox early exit 2147483651 is retained; normal GPU startup succeeds in the compatible desktop environment. Both REVIEW_026_GPU_FAILURE and REVIEW_026_POWERSHELL_FAILURE are REVIEW_ENVIRONMENT_SPECIFIC_NOT_REPRODUCED in that environment; PRODUCT_DEFECT remains NOT_ESTABLISHED.

All 12 required canonical commands pass on the final source, including 163 tests, Step1 full regression, Step2 recovery, Step3 dedicated/cumulative gates and the adjacent real Host lifecycle suite. The final lifecycle invocation is the one unchanged-source confirmation. The cumulative suite also retains graceful close, Desktop crash survival, Carrier recovery, Worker replacement and bounded cleanup. No Step1/Step2 test was weakened.

Composition hashes and 29 rows are exactly unchanged. A new final source inventory was captured before final focused/runtime acceptance; build/test regeneration was then checked against that identity before and after Step3 and lifecycle acceptance. The new source inventory is distinct from the preserved original one; the original Evidence was never frozen over or rewritten.

Budget: Host fixture 3/3 corrective cycles, 1/2 approaches; environment 2/2 cycles; Product functional corrective 0 strategies / 0 source cycles. F01 repaired a premature cleanup claim/startup race; F02 added missing Session opening in a fresh user-data directory; F03 corrected and tightened the stale-envelope test. E01 selected the existing normalized pinned command wrapper; E02 used the compatible desktop execution environment. A pre-existing canonical smoke orphan was verified by exact process identity/dead parent and gracefully stopped. All failed and superseded attempts are retained in new Evidence.

Original Step3 Evidence 36/36, frozen authorities 74/74 and historical proof sources 3/3 are exact matches. Frozen Harness remains clean at cd5ef8148158c3a752a658978873241fdf8e2bbc. All modified text remains UTF-8 without BOM and passes the mojibake scan. Provider runs = 0; Stage / Commit / Push = NO. Process cleanup = PASS.

NEXT_ACTION = INDEPENDENT_REREVIEW_V1_SLICE_2_STEP3_REVIEW_026_CORRECTIVE

## Architecture Owner REVIEW-026B Corrective V2

REVIEW-026 remains FAIL. F-026-01 is CLOSED_BY_CORRECTIVE_REREVIEW. F-026-02 remains OPEN_PENDING_INDEPENDENT_REREVIEW. REVIEW-026B remains FAIL and F-026B-01 remains HIGH / OPEN_BLOCKING.

The previous corrective attempt correctly stopped as ROOT_CAUSE_ASSUMPTION_INVALID. Its wrapper change invalidated the old composition identity, so that attempt was not rewritten as PASS.

Corrective V2 retained the complete composition scope. The wrapper now creates and cleans a unique ignored Step2 evidence root only when the caller did not provide one. A caller-owned root is used unchanged and is never removed by the wrapper.

The old composition identity remains historical and is superseded for Runtime acceptance because the wrapper is part of the source fingerprint. Controlled generation froze a new 29-row identity before Runtime acceptance. Wrapper SHA-256: 72a1f13561f4859165b2543d94ebf637cd80b6b34d1d38a51bc643918d4c91b1.

Absent-root and caller-root focused smokes passed. Full regression passed: typecheck, build, 163/163 unit tests, static, theme, worker, carrier, electron, Step1, Step2, Step3, and Step3 interactions. Provider, Prompt, Tool and Agent-turn runs were 0.

New Evidence: [STEP3-20260910-REVIEW026B-CORRECTIVE-01](evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026B-CORRECTIVE-01/run-manifest.json). Original Implementation Evidence 36/36, REVIEW026 Corrective Evidence 22/22, Frozen authorities 74/74, and 88/88 protected original candidate paths remain exact matches.

F-026B-01_CORRECTIVE = APPLIED_WAITING_INDEPENDENT_REREVIEW. CANONICAL_STEP3_SMOKE_SELF_CONTAINED = PASS. NEXT_ACTION = INDEPENDENT_REREVIEW_V1_SLICE_2_STEP3_REVIEW_026B_CORRECTIVE.
