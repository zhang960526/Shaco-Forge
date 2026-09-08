# V1-SLICE-1C Embedded Real Harness User Loop Implementation Record

> Final checkpoint: Attempt #2 live Gate and all required regressions PASS.
> State: IMPLEMENTED_WAITING_INDEPENDENT_REVIEW. Earlier failed and pending
> checkpoints below remain historical; Attempt #1 remains NOT_PROVEN.

Date: 2026-09-08

Implementation Result: PASS

Historical execution checkpoint: EVIDENCE_CAPTURE_REVALIDATION_SCOPE_CONFIRMATION_PENDING

Historical execution disposition: HUMAN_REQUIRED_INTERACTION after a real Attempt #1 and a corrected live-evidence capture failure.

`STANDARD_PRESET_HOST_SETTINGS_SCOPE_CONFIRMATION = APPROVED`.
The previous Session settings scope blocker below is historical and resolved.
The single approved entry is applied. Real Session creation and Composer Prompt
acceptance succeeded. Live semantic capture failed; its corrective and
non-Provider Session/follow validation are complete. The original retry rule
does not authorize Attempt #2 for this implementation failure. See section 12.
Multi-Agent remains outside scope; Provider budget is 1/2.

PICKER_COMPOSITION_SCOPE_CONFIRMATION = APPROVED. The previous scope blocker
is resolved; the historical failure and pending-scope checkpoints below remain
as execution history. The earlier runtime proved browse listing and controlled
Workspace creation, then fails to create the Session because the shipped
standard preset requires an additional public Host settings seam. Real
user-loop acceptance was unproved at that earlier checkpoint, with budget 0/2.

No Independent Review has occurred. No Owner Closure has occurred. No commit,
push or staging is authorized or performed. Slice 1 remains IN_PROGRESS.

## 1. Initial baseline

Product `D:\Project\Shaco-Forge`, branch `master`, HEAD
`2dcc47ff6ca393a4334cc6d7135d8c0b38f2f854`, clean. Frozen Harness
`D:\Project\Shaco-Forge-Upstream\deepseek-harness`, HEAD
`cd5ef8148158c3a752a658978873241fdf8e2bbc`, clean, detached checkout.
All requested initial governance fields matched before the first code edit.

Read authority: Document Map, Current State, UI Spec, frozen 1C Contract,
Source Confirmation, Owner Decision, AUDIT-015/016, and directly relevant 1B
Contract/Implementation Record/Evidence. Technical Baseline, Documentation Rules
and the relevant Development Map portion were also consulted. Historical P0/P0.S
was not reopened.

## 2. Changed files and implementation

| File | Change |
|---|---|
| `.gitignore` | Ignore 1C local runtime artifacts. |
| `apps/desktop/index.html` | Passive truthful wrapper; disable New Chat/Settings and delegate project/session navigation. |
| `apps/desktop/scripts/prepare-harness-client.mjs` | Bundle the tested adapter; add the approved public browse Client; enforce exactly 28 unique explicit modules and retain public-loader validation. |
| `apps/worker/src/profile.ts` | Owner-authorized public browse backend and standard-preset model-selection settings prerequisite, without configuration overrides. |
| `scripts/smoke-worker.mjs` | Validate the actual Host profile's browse-only picker and unique settings entry/order/defaults. |
| `apps/desktop/src/renderer/shell-bootstrap.ts` | Install one transport before frozen Client evaluation. |
| `apps/desktop/src/renderer/transport.ts` | Observe existing requests/responses/items; bound endpoint lists; remove raw stream payload storage; measure coexistence/cleanup. |
| `apps/desktop/src/renderer/user-loop-evidence.ts` | Bounded redacted semantic evidence, SHA-256 identities/marker matches, ordering, interaction settlement observation and failure classification. |
| `apps/desktop/src/renderer/global.d.ts` | Reflect the observer/stream evidence interface. |
| `apps/desktop/src/renderer/main.ts` | Expose wrapper/mount facts; remove rendered transcript sample. |
| `apps/desktop/src/main/carrier-client.ts` | Length-only frame observation, queue/credit/pull/coexistence/terminal metrics; frozen Carrier behavior retained. |
| `apps/desktop/src/main/frame-observation.test.ts` | Fragmented/coalesced frame measurement and immutable cap tests. |
| `apps/desktop/src/main/main.ts` | Hold evidence finalization while the UI gate runs; record NOT_PROVEN separately from non-Provider transport PASS. |
| `apps/desktop/tests/user-loop-evidence.test.ts` | Passive shell, single-context, redaction, ordering, bounded chunks, Tool results, interaction and classification tests. |
| `apps/desktop/tsconfig.test.json` | Include the new observer in the test compilation. |
| `scripts/electron-user-loop.mjs` | Drive the one mounted AppWebEntry through DOM clicks, focus, typing and submission; no direct business RPC. |
| `scripts/smoke-user-loop.mjs` | Exact-version runtime, controlled Workspace, persistent audited reservations, explicit zero-Prompt Session diagnostic, snapshots and bounded cleanup. |
| `scripts/user-loop-policy.mjs` | Strict two-attempt/read proof, delegation rejection, preset classification, controlled Workspace/integrity gates and fail-closed proof of an unsubmitted reservation. |
| `scripts/user-loop-policy.test.mjs` | Retry budget, forbidden mutation, integrity and complete success/error/no-tool conditions. |
| `scripts/verify-user-loop-hygiene.mjs` | Strict UTF-8/BOM/suspicious-text, links, frozen docs, no staging/lockfile mutation and whitespace checks. |
| `package.json` | Scripts only: complete unit roster and explicit user-loop smoke. |
| `docs/06-testing-acceptance/evidence/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-EVIDENCE.md` | Durable redacted facts and unproved gates. |
| `docs/04-development-records/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-IMPLEMENTATION-RECORD.md` | Decisions, execution ledger, failures and limits. |
| `docs/00-governance/SHACO-FORGE-CURRENT-STATE.md` | Record NOT_PROVEN and the exact pending scope boundary; no PASS, freeze or closure. |
| `docs/04-development-records/DEVELOPMENT-LOG.md` | Add the implementation checkpoint with evidence and record links. |
| `docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md` | Index the new implementation record and durable evidence. |

Frozen Architecture files, Frozen Harness, Preload capability shape, Carrier
constants/protocol, credential stores and lockfiles were not modified. The
Worker Host profile was unchanged at the initial pending-scope checkpoint; its
only subsequent composition addition is the Owner-approved browse backend.

## 3. Decisions within the frozen contract

- The single AppWebEntry remains the user-loop owner. The Shaco wrapper has no
  Workspace, Session or navigation store and never reads private ctx.
- Observation is on the actual adapter used by the installed transport.
  Hash computation never waits on or alters the business delivery path. The
  observer contains its own failures, exposes dropped-metadata/error counters,
  and fails evidence assessment when completeness is lost.
- Semantic rows are capped at 256, cached identity work at 32, pending
  interactions at 8, and continuous chunks become counts with one first-chunk
  row per step. No raw Prompt, arguments or transcript accumulates.
- The pinned `tool/result` shape is `data.message.content[0]` with a
  `tool-result` block; its `toolCallId` correlates to the observed call. The
  validation policy recognizes the standard preset's read capability without
  placing Tool selection or Provider routing logic in Shaco Product UI.
- Attempt reservation is durable before Composer submission. A failed system,
  Provider error, Tool error or write/edit event never earns a retry.
- Conditional approval/question observation is supported. The automated driver
  stops for an unsettled interaction rather than guessing a potentially unsafe
  answer. No dangerous approval is manufactured.

## 4. Failures and corrective work

1. First `scripts/build.mjs` invocation failed with .NET CS2012 access denied on
   an existing obj output (exit 1). The already-authorized build was executed
   with the owning desktop user's permission; .NET then passed.
2. Importing Vite from the Client preparation script under `--preserve-symlinks`
   failed to resolve its existing Rollup dependency (exit 1). Resolving Vite's
   real installed path fixed this without installing or changing dependencies.
3. One initial targeted Node test command ran only the script-level tests because
   the new compiled test artifacts were not yet built. Its 8/8 result is not
   counted as coverage of the TS observer. After build, all 27 new cases passed;
   the full 94-case roster passed.
4. The first real UI run reached Harness Settings and observed a routable default
   `runapi / claude-sonnet-4-20250514` plus configured credential existence. It
   failed at Workspace picker composition. No Prompt or Provider Tool attempt
   occurred. The existing Choose Workspace control did not open a picker;
   Product composition lacks both a directory-flow Client occupant and backend.
5. Later bounded corrections keep first-chunk evidence per stream/step, retain
   failed Workspace/Session creation metadata, skip parsing unrelated responses,
   use the actual `data-chat-flow-kind=assistant-step` DOM seat, require complete
   semantic streaming before awarding no-tool retry, and assert actual residual
   process identities. These changes do not inject business success.
6. A sandbox Git query failed dubious-ownership validation (exit 1). A read-only
   query under the repository owner's execution identity confirmed the exact
   Frozen HEAD and clean state. No safe.directory setting was changed.
7. After the final command ledger was added, the Markdown hygiene checker
   incorrectly treated a PowerShell regex inside a fenced code block as a
   relative link (exit 1). Link extraction now skips fenced and inline code;
   the final hygiene rerun passes. This correction affects validation only.

## 5. Pending scope boundary

The execution request section 34 limits necessary Worker edits to
observation/cleanup. Reusing the shipped browse picker requires a small Host
profile composition addition as well as its existing public Client bundle.
The narrow proposal was presented for confirmation; it has not been applied.
No second Remote `workspace/create` shortcut, native-picker impersonation,
Frozen Harness patch or architecture redesign was attempted.

The failed runtime result remains a Product picker integration failure, not a
missing credential, network failure or an OS native dialog boundary. Overall
implementation remains NOT_PROVEN while this authority question is pending.

## 6. Exact command ledger

All commands ran from `D:\Project\Shaco-Forge`, using these bindings:

```powershell
$nodePath='C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe'
$env:SHACO_FORGE_HARNESS_ROOT='D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$env:SHACO_FORGE_WORKER_NODE=$nodePath
```

| Exact command | Exit | Result |
|---|---:|---|
| `git branch --show-current` | 0 | master |
| `git rev-parse HEAD` | 0 | expected Product HEAD |
| `git status --porcelain=v1 --untracked-files=all` | 0 | clean before edits |
| `git -C $env:SHACO_FORGE_HARNESS_ROOT rev-parse HEAD` | 0 | expected Frozen HEAD |
| `git -C $env:SHACO_FORGE_HARNESS_ROOT status --porcelain=v1` | 0 | clean under owner identity |
| `& $nodePath --version` | 0 | v22.19.0 |
| `& $nodePath scripts/typecheck.mjs` | 0 | PASS, including later bounded corrections |
| `& $nodePath scripts/build.mjs` first sandbox invocation | 1 | CS2012 access denied; retained failure |
| `& $nodePath scripts/build.mjs` first owner invocation | 1 | Vite dependency resolution; retained failure |
| `& $nodePath scripts/build.mjs` corrected owner invocation | 0 | PASS; .NET 0 warnings/errors, graph 27, real Client bundle |
| `& $nodePath --test apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist/main/frame-observation.test.js scripts/user-loop-policy.test.mjs` | 0 | 27/27 after compilation |
| `& $nodePath node_modules/typescript/bin/tsc -p apps/desktop/tsconfig.node.json` | 0 | PASS |
| Complete unit command below | 0 | 94/94 at first complete checkpoint |
| `& $nodePath scripts/smoke-carrier.mjs` | 0 | PASS; HMAC, ACL, first-instance, timeout, delayed-connect, cleanup |
| `& $nodePath scripts/smoke-worker.mjs` | 0 | PASS; real frozen profile and events preflight |
| `& $nodePath scripts/smoke-electron.mjs` | 0 | PASS; real Client and transport |
| `& $nodePath scripts/smoke-electron.mjs --inject-carrier-failure` | 0 | PASS; truthful failure, no recovery |
| `& $nodePath scripts/smoke-user-loop.mjs` | 1 reported by command host | FAIL at Workspace picker; Electron exit 0; budget 0; raw result NOT_PROVEN |
| `& $nodePath scripts/verify-static.mjs` | 0 | PASS, 90 files at that checkpoint |
| `& $nodePath scripts/verify-theme.mjs` | 0 | PASS, 20 semantic tokens |
| `& $nodePath node_modules/typescript/bin/tsc -p apps/desktop/tsconfig.test.json` | 0 | PASS |
| `& $nodePath --test apps/desktop/dist-tests/tests/user-loop-evidence.test.js scripts/user-loop-policy.test.mjs` | 0 | 28/28, including later assessment corrections |
| `& $nodePath scripts/build.mjs` final owner invocation | 0 | PASS after the final bounded code corrections; graph 27 |
| Complete unit command below with `--test-reporter=dot` inserted after `--test` | 0 | 97/97 at the final checkpoint |
| `& $nodePath scripts/typecheck.mjs` final invocation | 0 | PASS |
| `& $nodePath scripts/verify-static.mjs` final invocation | 0 | PASS, 91 files |
| `& $nodePath scripts/verify-theme.mjs` final invocation | 0 | PASS, 20 semantic tokens |
| `& $nodePath scripts/verify-user-loop-hygiene.mjs` | 0 | PASS, 24 changed/new files, strict UTF-8, no BOM or suspicious text, 39 Markdown links, six unchanged frozen documents, no staging or lockfile change |
| `& $nodePath scripts/verify-user-loop-hygiene.mjs` after adding the final command ledger, before its parser correction | 1 | Fenced PowerShell regex misidentified as a Markdown link; retained validation failure |
| `& $nodePath scripts/verify-user-loop-hygiene.mjs` after its parser correction | 0 | PASS with the final documentation |
| `git diff --check` | 0 | PASS; untracked-file whitespace checks also pass in the hygiene script |
| `git diff --cached --name-only` | 0 | Empty |
| Final process query below | 0 | Count 0, including generated Harness Host runtime/profile paths |

Complete unit roster (the same list is maintained in package.json):

```powershell
& $nodePath --test packages/contracts/dist/index.test.js packages/contracts/dist/carrier.test.js apps/worker/dist/config.test.js apps/worker/dist/host-readiness-marker.test.js apps/worker/dist/host-carrier-preflight.test.js apps/worker/host-profile/events-route-preflight.test.mjs apps/desktop/dist/main/security.test.js apps/desktop/dist-tests/tests/theme.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/dist/main/window-lifecycle.test.js apps/desktop/dist/main/worker-supervisor.test.js apps/desktop/dist/main/carrier-client.test.js apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist/main/frame-observation.test.js scripts/user-loop-policy.test.mjs
```

Final complete unit invocation:

```powershell
& $nodePath --test --test-reporter=dot packages/contracts/dist/index.test.js packages/contracts/dist/carrier.test.js apps/worker/dist/config.test.js apps/worker/dist/host-readiness-marker.test.js apps/worker/dist/host-carrier-preflight.test.js apps/worker/host-profile/events-route-preflight.test.mjs apps/desktop/dist/main/security.test.js apps/desktop/dist-tests/tests/theme.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/dist/main/window-lifecycle.test.js apps/desktop/dist/main/worker-supervisor.test.js apps/desktop/dist/main/carrier-client.test.js apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist/main/frame-observation.test.js scripts/user-loop-policy.test.mjs
```

Final read-only cleanup query (executed under the desktop repository owner's
identity so process command lines and Frozen Git status are accessible):

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^(node|electron|ShacoForge.NativeCarrier)(\.exe)?$' -and ($_.CommandLine -match 'Shaco-Forge[\\/](apps|node_modules)|Shaco-Forge[\\/]scripts[\\/]electron-user-loop|shaco-forge-v1-slice-1[b|c]-|\.dsh[\\/]runtime-overlay|\.dsh[\\/]profiles[\\/]shaco-forge-v1-slice-1b') } | Measure-Object | Select-Object Count
```

The build itself executes the required .NET command:
`dotnet build apps/native-carrier/ShacoForge.NativeCarrier.csproj --configuration Release --no-restore`.

## 7. Runtime evidence and carry-forward

See [Durable Evidence](../06-testing-acceptance/evidence/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-EVIDENCE.md)
for marker hashes, integrity, Provider ownership, event dispositions and Carrier
metrics. Raw runtime is ignored/local and contains no complete credential,
Prompt, random marker or transcript. The controlled directory was snapshotted
unchanged and deleted. Run-created profile/runtime output was cleaned without
reading or deleting the user's Harness settings/credential documents.

REVIEW-012 F-05 remains `OPEN_KNOWN_CONSTRAINT` (Frozen Client CSP).
V1-SLICE-1B NF-6 remains `OPEN_NON_BLOCKING` (Frozen Client retries versus Shaco
recovery). No new non-blocking finding is substituted for the unresolved picker
gate. No Independent Review, Review PASS, Owner Closure, baseline freeze or
Slice closure is claimed.

## 8. Continuation correction and reviewable scope proposal

The automatic continuation did not supply the pending scope confirmation.
The previous goal turn made implementation and verification progress; it was
not a live-process wait. Current source still has a 27-module Client graph
without a directory-flow occupant and the unchanged Worker profile lacks its
Host backend. The same scope blocker remains.

Source inspection of the pinned workspace-controller `commands.ts` confirmed
that `workspace/create` returns `{ workspace: { workspaceId, ... }, created }`.
The observer previously looked for the identity at the top level. It now reads
the nested identity and hashes only the requested path. The DOM gate requires
an accepted response, that exact controlled-path hash, and a valid returned
Workspace identity hash; a failed or unrelated creation cannot advance it.
Two regression tests cover the real response shape, redaction, rejection and
incorrect/missing path or identity. This correction stays within the authorized
observation/testing scope and does not provide real Workspace success evidence.

A UTF-8 without BOM patch is available locally at
`docs/04-development-records/evidence/V1-SLICE-1C/runtime/picker-composition-proposal.patch`.
It is ignored and **not applied**. The proposal adds the shipped public browse
Client module, derives the graph count from its explicit module lists, and adds
the shipped public browse Host backend to the Worker profile. Both public built
exports exist at the pinned version. SHA-256 comparisons before/after proposal
creation confirmed that neither proposed target was changed by that operation.

Continuation commands (same Node/environment bindings as section 6):

| Exact command | Exit | Result |
|---|---:|---|
| `git apply --check --ignore-space-change docs/04-development-records/evidence/V1-SLICE-1C/runtime/picker-composition-proposal.patch` | 0 | Proposal applies to current source; no mutation performed |
| `git check-ignore --quiet docs/04-development-records/evidence/V1-SLICE-1C/runtime/picker-composition-proposal.patch` | 0 | Proposal is ignored/local |
| `& $nodePath scripts/build.mjs` | 0 | PASS; unchanged graph count 27 |
| `& $nodePath scripts/typecheck.mjs` | 0 | PASS |
| `& $nodePath scripts/verify-static.mjs` | 0 | PASS, 91 files |
| Full command below | 0 | 99 tests, 99 passed, zero failures/skips |
| `& $nodePath scripts/smoke-electron.mjs` first continuation launch | Not executed | Automatic permission review timed out before process creation |
| `& $nodePath scripts/smoke-electron.mjs` one permitted retry | 0 | PASS; real Client/Carrier, main 47604, Worker 29816, Host 47028; temporary Harness home removed |
| `& $nodePath scripts/verify-user-loop-hygiene.mjs` | 0 | PASS after continuation edits; UTF-8, no BOM or suspicious text |

```powershell
& $nodePath --test --test-reporter=spec packages/contracts/dist/index.test.js packages/contracts/dist/carrier.test.js apps/worker/dist/config.test.js apps/worker/dist/host-readiness-marker.test.js apps/worker/dist/host-carrier-preflight.test.js apps/worker/host-profile/events-route-preflight.test.mjs apps/desktop/dist/main/security.test.js apps/desktop/dist-tests/tests/theme.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/dist/main/window-lifecycle.test.js apps/desktop/dist/main/worker-supervisor.test.js apps/desktop/dist/main/carrier-client.test.js apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist/main/frame-observation.test.js scripts/user-loop-policy.test.mjs
```

No controlled Provider prompt was submitted during this continuation. The
implementation remains NOT_PROVEN; the proposal needs the previously requested
scope confirmation before dependent runtime work can proceed.

## 9. Owner-approved picker composition corrective

The Owner continuation explicitly grants
`PICKER_COMPOSITION_SCOPE_CONFIRMATION = APPROVED`, authorizes the Client and
Host browse compositions, and states `ARCHITECTURE_CONTRACT_CHANGE_REQUIRED = NO`.
The original blocker arose from section 34's Worker observation/cleanup limit.
The Owner clarified that the missing existing public picker is a Product
composition corrective required by the already-frozen Workspace user loop.
The old scope blocker is therefore resolved without editing any frozen document.

The approved proposal was checked to involve only the Client preparation script
and Worker profile. Its two composition semantics were applied directly; the
Client assertion additionally enforces 28 unique explicit identities and rejects
missing, duplicate or unknown modules. `orderByModuleGraph`, the exact package
identity/version checks, public web declaration check and built loader check are
retained. The ignored proposal remains a historical unapplied patch artifact;
it is not staged or added as a durable Product file.

| Public seam | Preflight observation |
|---|---|
| Client | `@deepseek-ai/dsh-client-ui-directory-picker-browse/client` |
| Client version / declaration | `0.1.2-alpha.1` / public web Client |
| Client built bytes / SHA-256 | 49256 / `502ea0a442005b271e08af2b82db1b82820dae374997a3c9bc24b3cd812dbee4` |
| Host | `@deepseek-ai/dsh-host-directory-picker-browse` |
| Host version | `0.1.2-alpha.1` |
| Host built bytes / SHA-256 | 9309 / `20d82ef343a4ee06f1ace8d56521b3e6c7cbbf52816acf056e9977839d31c54b` |
| Source mechanism | Existing package index, manifests and `resolvePublicExport`; no deep source import |
| Expected graph before / after | 27 / 28 |
| Host insertion | workspace-controller, directory-picker-browse, api-remotes |
| Native / auto picker actively added | NO / NO |
| Provider budget before corrective/rerun | 0 / 2, original ledger preserved |

The existing policy test file now tests the actual production graph/package
guards in isolation and checks the generated manifest. The existing Worker
smoke validates the actual generated profile before cleanup. The previous
failed real runtime remains intact; module presence alone is not picker PASS.

## 10. Post-approval execution and latest boundary

All requested non-Provider gates passed after the picker composition:
typecheck, build, complete units, Carrier, Worker, normal Electron, injected
Carrier failure, static, theme, hygiene and whitespace checks. The generated
graph contains exactly 28 unique public modules. The generated Host patch hash
is `5d04627c97453ab93dec37952c4fa58e3f89e2f1f867a89e577248c12afba7ce`;
the Worker smoke verified browse-only composition and its insertion order.

The first requested real-user-loop launch was rejected before execution by
automatic permission review because outbound payload/destination authority was
unclear. Read-only checks produced the original instruction section 19's
explicit Provider network authorization and the fixed read-only Prompt/random
32-byte proof payload. Review then permitted the same command. No rejected
launch consumed an attempt. The current Harness UI reports `haoai` with
`anthropic/claude-opus-5`; the older `runapi` observation remains historical.
No Provider configuration or credential was changed by this corrective.

| Runtime ID | Preserved outcome |
|---|---|
| `23dc8372-8b18-4317-9ef5-ddcae4256c90` | Browse dialog and `directoryPicker/list` appeared; driver timed out before Open. |
| `7ff3cd47-8a1f-4ef4-be82-f2e7087d814f` | Added bounded listing/error-code and DOM diagnostics proved the controlled listing succeeded and Open was enabled, with no alert. Driver searched a hidden first dialog. |
| `c16e91b7-3b81-4ef0-917e-43067d64a05e` | Visible-dialog selection correction clicked Open; `workspace/create` accepted and returned identity. Observer missed the named `args.request` wrapper, so path correlation was not yet valid. Session creation separately returned `agent-preset-invalid`. |
| `5b2eeae5-2ce0-4bd8-acf2-f8bb54c0cd14` | Corrected named request observation proved controlled Workspace path/identity and correlated its failed Session creation. |
| `6fc2d514-759b-4823-a4a7-6d2f81434940` | Latest checkpoint: the bounded redacted preset summary identifies the missing public Host settings seam. |

These are UI validation runs before Composer, not Tool Proof attempts. All five
retain the original empty Provider ledger and unchanged proof snapshots. Their
Electron exits are 0; each command host reported exit 1 for the non-PASS gate
(the script's declared non-PASS exit is 2). No runtime failure was overwritten
or promoted to full success.

Implementation-level corrections retained:

- Search all visible matching dialog scopes; retained hidden Settings dialogs
  cannot hide the actual browse Open button from the driver.
- Allow the controlled DOM input rendering to settle before Enter.
- Observe `workspace/create`, `session/create` and `session/prompt` through their
  public named `args.request` parameter. `directoryPicker/list` and `$events/result`
  use direct named arguments. Tests now use those actual method shapes.
- Keep up to eight directory listing metadata rows with acceptance, identity/path
  hashes and error codes, never the listing contents.
- Distinguish Workspace creation from Session setup. Preserve the actual Session
  error code and a bounded preset summary with credential-related content,
  filesystem paths, URLs and long opaque values redacted.

Latest controlled Workspace identity hash:
`9dbbce4d1036af2cfe46ce3c7a6c68f15846452978b6abcd3b72d41e5dc20299`.
Its real `session/create` request hash:
`7ccd8db8449c6478178573660a04edff885de91ed7a08047543b73a2086c6e7d`.
The Session creation was rejected; no real Session identity is claimed.

Exact redacted error:

```text
agent-preset-invalid; preset = standard
failed to apply loader entry delegation (cordis:group): failed to apply loader entry tool-subagent (@deepseek-ai/dsh-tool-subagent): tool-subagent: `modelSelectionSettings` requires @deepseek-ai/dsh-tool-subagent/model-selection-settings in the Host scope ([path])
```

Read-only public-seam inspection confirms that
`@deepseek-ai/dsh-tool-subagent/model-selection-settings` exists at
`0.1.2-alpha.1`, built size 3899 bytes, SHA-256
`a203d7ddc88c7dd19c300c8d4acd622eb33f6f9eea61593153dbb9b69de0efaf`.
The shipped Host settings schema defaults `enabled` to false and
`allowedModels` to an empty list. No subagent was spawned in any validation run.

This additional module is outside the Owner continuation section 3's explicit
two-picker-module composition authorization. It has **not** been composed;
the frozen standard preset was not edited or replaced to bypass its guard.
A one-file, UTF-8 without BOM, ignored proposal is available at
`docs/04-development-records/evidence/V1-SLICE-1C/runtime/standard-preset-host-settings-proposal.patch`.
It passed `git apply --check` and is **not applied**. The further Host
composition requires a new explicit scope decision. This is not a Provider
network failure or missing-credential boundary.

### Post-approval command ledger

The Node and environment bindings from section 6 are unchanged.

| Exact command | Exit | Result |
|---|---:|---|
| `& $nodePath scripts/typecheck.mjs` | 0 | PASS after the final observation correction |
| `& $nodePath scripts/build.mjs` | 0 | PASS after composition and each affected observation correction; graph 28; .NET zero warnings/errors |
| Full unit roster in section 8 with `--test-reporter=spec` | 0 | 102, then 103, then 104 passing tests as regression coverage was added |
| `& $nodePath --test --test-reporter=spec apps/desktop/dist-tests/tests/user-loop-evidence.test.js scripts/user-loop-policy.test.mjs` | 0 | Final affected roster 35/35 |
| `& $nodePath scripts/smoke-carrier.mjs` | 0 | PASS; delayed connect 5307 ms, authenticated idle 5213 ms, timeout 5024 ms, partial frame timeout 5021 ms |
| `& $nodePath scripts/smoke-worker.mjs` | 0 | PASS; generated browse-only profile verified; Worker 34404, Host 38532, helper 9836; cleanup successful |
| `& $nodePath scripts/smoke-electron.mjs` | 0 | PASS; main 31832, Worker 44444, Host 5580; temporary home removed |
| `& $nodePath scripts/smoke-electron.mjs --inject-carrier-failure` | 0 | PASS; main 2008, Worker 38724, Host 14608; truthful failure and cleanup |
| `& $nodePath scripts/verify-static.mjs` | 0 | PASS, 91 files |
| `& $nodePath scripts/verify-theme.mjs` | 0 | PASS, 20 semantic tokens |
| `& $nodePath scripts/verify-user-loop-hygiene.mjs` | 0 | PASS, strict UTF-8 without BOM, no suspicious text, frozen documents unchanged, no staging or lockfile mutation |
| `git diff --check` | 0 | PASS |
| `& $nodePath --check scripts/electron-user-loop.mjs` | 0 | PASS |
| `& $nodePath scripts/smoke-user-loop.mjs` initial post-approval launch request | Not executed | Automatic approval review rejected the request; subsequently resolved through the explicit existing authorization/payload evidence |
| `& $nodePath scripts/smoke-user-loop.mjs` for each of the five runtime IDs above | 1 reported by command host | No full PASS; latest HUMAN_REQUIRED_INTERACTION at SESSION_SETUP; Electron exit 0; Tool Proof budget 0/2 |
| `git apply --check --ignore-space-change docs/04-development-records/evidence/V1-SLICE-1C/runtime/standard-preset-host-settings-proposal.patch` | 0 | Reviewable proposal checked, not applied |
| `git check-ignore --quiet docs/04-development-records/evidence/V1-SLICE-1C/runtime/standard-preset-host-settings-proposal.patch` | 0 | Ignored/local |

The intermediate 104-test command included the Worker supervisor test path
twice; Node deduplicated the input and reported 104 tests. This did not grant
extra coverage or change the unique full roster maintained in package.json.

The final rerun used the exact unique full roster shown in section 8, after
the last Session-reason redaction change: exit 0, 104 tests, 104 passed, zero
failed/cancelled/skipped. This is the final unit result for this checkpoint.

Final static/theme/hygiene reruns all passed (exit 0): 91 static files,
20 semantic theme tokens, 26 changed/new files, strict UTF-8, no BOM or
suspicious text, 39 valid Markdown links, six frozen documents unchanged,
no staged file and no lockfile mutation. `git diff --check` passed.
Product remains on master at the initial HEAD; Frozen Harness remains clean
at its initial HEAD. The final process query returned no matching Product,
Host or helper process. The original Provider ledger remains `{"attempts":[]}`.

## 11. Owner-approved standard preset Host settings corrective

The Owner continuation grants
`STANDARD_PRESET_HOST_SETTINGS_SCOPE_CONFIRMATION = APPROVED`, authorizes
`@deepseek-ai/dsh-tool-subagent/model-selection-settings`, and explicitly states
no Architecture Contract change or Multi-Agent scope expansion. The previous
`agent-preset-invalid` error in section 10 remains preserved.

The ignored proposal was read and passed `git apply --check` before the same
three-line semantic addition was applied in `apps/worker/src/profile.ts`.
Ordering is api-remotes, subagent-model-selection-settings, agent-presets.
No config stanza was added. The standard preset, user Harness settings,
credentials, model registry and allowed-model list were not modified.
The historical proposal itself remains ignored and was not staged.

Existing package-index/public-export preflight verified the parent package name
and pinned `0.1.2-alpha.1` version, its public built subpath, and normal Node
resolution from the actual existing Harness runtime overlay. Built size is
3899 bytes; SHA-256 is
`a203d7ddc88c7dd19c300c8d4acd622eb33f6f9eea61593153dbb9b69de0efaf`.
Frozen Harness remains at the exact clean commit. The module defaults remain
`enabled=false` and `allowedModels=[]`; no override was written.

Required profile checks execute the real profile materializer in the unit test
and inspect the actual running Worker's generated patch in its smoke. They
verify one exact entry, order before agent-presets, retained browse picker,
no native/auto picker, no settings override or production source import, and
unchanged dependency declarations.

The real UI driver now requires an accepted correlated Session identity and
visible Composer before submission. Preset failures distinguish ineffective
settings composition from an additional public prerequisite; no further module
is automatically composed. Tool assessment rejects delegation/control tools
and observed children before considering read proof, with no retry after a
Multi-Agent violation. `list_subagent_models` alone cannot satisfy read proof.
The fixed read-only Prompt also tells the model not to delegate or spawn/fork.
Child observations are limited to existing Client list/follow traffic for
controlled prompted parents, deduplicated and bounded; they do not add requests
or claim direct access to the Host's child lifecycle.

Provider budget before this corrective: 0/2. Superseding runtime and final
regression results are pending below.

### Settings corrective regressions

Using the unchanged fixed Node/environment bindings from section 6:

| Exact command | Exit | Result |
|---|---:|---|
| `& $nodePath scripts/typecheck.mjs` | 0 | PASS |
| `& $nodePath scripts/build.mjs` | 0 | PASS, graph 28; includes .NET Native Helper Release --no-restore, zero warnings/errors |
| Exact complete unit roster from section 8 | 0 | 110/110, then 111/111 after the pre-submission reservation regression |
| `& $nodePath --test --test-reporter=spec scripts/user-loop-policy.test.mjs` | 0 | 20/20, including actual profile materialization and reservation refusal cases |
| `& $nodePath scripts/smoke-carrier.mjs` | 0 | PASS; delayed connect 5305 ms, authenticated idle 5205 ms, auth timeout 5021 ms, partial-frame timeout 5012 ms |
| `& $nodePath scripts/smoke-worker.mjs` | 0 | PASS; Worker 21760, Host 43344, helper 28308; one exact settings entry, defaults unchanged, cleanup passed |
| `& $nodePath scripts/smoke-electron.mjs` | 0 | PASS; main 48232, Worker 3020, Host 45604; temporary home removed |
| `& $nodePath scripts/smoke-electron.mjs --inject-carrier-failure` | 0 | PASS; main 44428, Worker 38108, Host 31976; truthful failure and temporary-home cleanup |
| `& $nodePath scripts/verify-static.mjs` | 0 | PASS, 91 files |
| `& $nodePath scripts/verify-theme.mjs` | 0 | PASS, 20 semantic tokens |
| `& $nodePath scripts/verify-user-loop-hygiene.mjs` | 0 | PASS, 26 files, strict UTF-8/no BOM/no suspicious text, 39 links, six unchanged frozen documents, no staged/lockfile delta |
| `git diff --check` | 0 | PASS |
| `& $nodePath --check scripts/user-loop-policy.mjs` | 0 | PASS |
| `& $nodePath --check scripts/electron-user-loop.mjs` | 0 | PASS after each driver correction |
| `& $nodePath --check scripts/smoke-user-loop.mjs` | 0 | PASS |

The actual running Worker generated Host patch SHA-256 is
`720fbead6d4a5f9b925bee21c59bda53e4cd37e8320eceff2d37f6fe58d50306`.
This proves the public module loads through the normal dsh profile, beyond
manifest-only preflight. Existing Vite script-tag/chunk-size warnings remain.

### First real Session success and pre-submission UI corrections

The same command `& $nodePath scripts/smoke-user-loop.mjs` produced new run
`aed93d9d-08ad-415c-8152-e574b2a8c800` (command host exit 1, Electron exit 0).
The approved Host corrective was effective: controlled Workspace creation and
Session creation were accepted, the returned Session was associated with that
Workspace, and active Workspace/Composer UI assertions passed.

| Identity | SHA-256 |
|---|---|
| Controlled path | `d716a87f9aa4b525c1b78e94d2f84ab9efdd3e9e1a10e26bcd9a4b70066eb5e5` |
| Workspace | `4616024cc667bba9d7041824726dd27e211aa0589aac4105f7c067ac0297a3ed` |
| Session | `b6bd41770bc6df7509ca5b5acf375d69b5b6c569e63c383d95cc6cd2929c2fee` |
| Session-create request | `2abb3d434981f203636dfa3c60f0d9dd790a9379529f2c63f299a047d3179aef` |
| Expected marker | `ca21fb3c08451c1d27fdb5abeb0e4b071f431b9132886da23cb7c33299b53a03` |

The latest real Harness UI selected `deepseek-official / deepseek-v4-flash`,
routable true and configured-credential existence true. The implementation
did not change the user's Provider or settings. Historical haoai/runapi values
above describe earlier observations only.

The driver initially reserved logical Attempt #1 after typing, but Enter did
not produce any `session/prompt`. Its bounded timeout reported
`UI_GATE_TIMEOUT:TOOL_ATTEMPT_1`; the final Send control was disabled. The
completed runtime had zero Prompt rows, zero semantic events, zero observer
errors/dropped metadata, a healthy Carrier, and no `session/prompt` in the
actual endpoint list. All streams/processes were cleaned up, proof.txt stayed
32 bytes with unchanged hash, and the controlled directory was removed.
This is a pre-submission DOM failure, not a Provider attempt outcome.

The corrective preserves the original nonempty ledger and reservation history.
Only this closed-runtime evidence permits logical number 1 to be marked
`NOT_SUBMITTED_UI_FAILURE` and reused; the original SUBMITTING timestamp, run
ID and runtime SHA-256 remain in `reservationHistory`. It does not grant
Attempt #2, clear the ledger, or raise the two-attempt limit. Any observed
Prompt (including rejection), semantic event, missing evidence, observer
failure, unfinished stream or surviving process rejects reconciliation.
The original summary is preserved as a per-run artifact; new runs also retain
their own summary before updating the latest pointer.

Run `4f2c1d05-f65e-46c4-bd15-099105a4a329` (same command, reported exit 1,
Electron exit 0) confirmed the contenteditable was editable and the document
focused, but the Composer itself lost focus and remained empty. No Prompt was
submitted and no new reservation was made. This diagnostic failure remains
preserved. Focus, scrolling, DOM range selection and dialog-settling corrections
use ordinary user-level DOM/Electron input APIs; they access no private editor
instance, React store or direct Remote. The driver now requires an exact
draft-text match and enabled Send button before reserving/submitting.

## 12. Real Attempt #1, evidence corrective and remaining authority boundary

Real run `54e248ff-305c-4fa3-bcab-a616872a0a3f` used the same exact
`& $nodePath scripts/smoke-user-loop.mjs` command. It passed the draft-match,
enabled-Send and focused-editor checks, clicked the real Send control and
observed `session/prompt accepted=true`. This is the first real controlled
Prompt attempt; the ledger now consumes 1/2. No Attempt #2 was executed.

The original artifact and per-run summary retain their reported
`HARNESS_PROVIDER_OR_NETWORK_FAILURE` and command-host exit 1 (Electron 0).
That classification was **not supported**: a generic 180-second observation
timeout had been labelled a Provider failure. The actual defect was in the
Product observer, which read `payload.args.address`; the pinned public method
is `follow(request: SessionFollowRequest, signal: AbortSignal)` and the address
is in `payload.args.request.address`. Thus Carrier streamed 167 pulls but no
live semantic rows were retained by the unbound observer. Its zero rows cannot
prove absence of Agent activity, Tool calls or Provider success/failure.

Only the controlled Session's persisted journal was read for postmortem diagnosis,
identified by matching its identity hash. Node's public Zstandard decompressor
read its concatenated frames with bounded output. No credential file or
unrelated Session content was read; only selected metadata and marker-match
hashes were emitted, without copying the transcript into evidence.

| Attempt #1 fact | Evidence |
|---|---|
| Controlled path SHA-256 | `395e1d8e5e88cf745adf6291879ad7d0f4e832beccaa742a7a8d2b46c3acf8fd` |
| Workspace identity SHA-256 | `d82dbe65ca4a007d5acf4b22e5be558ba1da6f99622cb494180c3d440af80094` |
| Session identity SHA-256 | `2a1f4d236134f09e76ed251cd1efd14f66e41f0c3d1398596e8cde841fdce809` |
| Prompt request SHA-256 | `f82f27992130808a93238aa4cd1e26c17a61a6d9ec13a27b38fcf7d731638779` |
| Expected marker SHA-256 | `2c948480bbc121d09732796f197f80aa9d99cb2e8c3935b3dfcac0b07023cd13` |
| Postmortem Tool | one `read`, call seq 73 and result seq 74, correlated call hash |
| Postmortem result | `isError=false`, Tool marker match true, final Assistant marker match true |
| Postmortem turn | one turn/start, two steps, one turn/end with reason completed |
| Subagent/fork/delegation Tool calls | zero in the controlled journal; no child execution observed |
| UI rendering proof | not persisted; not recovered from the journal |
| Workspace | proof.txt only, 32 bytes, hash and list unchanged; removed after snapshot |
| Carrier | peak five streams, queue peak four, one Renderer pull per stream; max frame 249110 below 262144; zero violations/duplicate terminals/items after terminal; final streams/unary zero |
| Topology | main 40740, Worker 41692, Host 41352, helper 44952; all cleaned |

The postmortem is explicitly **DIAGNOSIS_ONLY_NOT_SAME_CONTEXT_LIVE_GATE**.
It does not replace live `session/follow` instrumentation or rendered UI proof,
and it does not grant Implementation PASS. The journal also contains a
Harness-owned title-LLM request record; exact HTTP/network transmission or
internal retry counts were not independently measured. The budget counts one
controlled Tool Proof attempt, not all internal Harness requests.

The ledger preserves the original reported outcome and adds its diagnostic
correction: `SHACO_IMPLEMENTATION_FAILURE`, reason
`SAME_CONTEXT_FOLLOW_OBSERVATION_CAPTURE_FAILED`, with the postmortem hash and
`retryAuthorized=false`. The original runtime and reservation history are intact.

Corrective work is complete:

- Observe the actual named follow request and retain bounded Session hashes.
- Reject malformed ordinary follow addresses visibly instead of silently losing
  evidence; verify matching follow binding before any Composer submission.
- Add the pinned envelope and malformed-envelope regression.
- A missing semantic completion alone no longer classifies a Provider failure.
- Persist the actual rendered-Assistant marker boolean/hash during future loops.

After correction, typecheck and build passed (including .NET Release
--no-restore). The full unique unit roster passed **112/112**, exit 0.
The exact `& $nodePath scripts/smoke-user-loop.mjs --session-setup-only`
command then passed with exit 0 and result `SESSION_SETUP_PROVEN`, run
`43988e6d-bcea-46b4-8f1f-954f1f05f84f`. This is explicitly a non-Provider
diagnostic, **not** full user-loop PASS. The real AppWebEntry created its
controlled Workspace and Session, entered Composer, and the corrected observer
bound the actual follow stream to Session hash
`bc3c6d81573eca33d655668700d4cca911540c35fedde30bb6adafa1991df5f8`.
Prompt count, observer errors and dropped metadata were zero. Budget bytes
were identical before/after (1/2), proof.txt was unchanged and removed, and no
Product processes remained. Its maximum frame was 251617, still below 262144.

The final normal Electron regression also passed, exit 0 (main 9836, Worker
30648); final injected-failure regression passed, exit 0 (main 47804, Worker
1492). Both removed their temporary Harness homes. Earlier Carrier/Worker
regressions remain valid; those implementation paths were unchanged by the
follow-observer correction.

The original instruction sections 21-22 permit Attempt #2 only after a healthy
completed first attempt without Tool selection, and forbid using it to cover
an explicit implementation failure. This first attempt actually selected read,
and its evidence capture failed. The remaining attempt is therefore **not
authorized for automatic use**. A further full validation needs an explicit
Owner decision on that retry condition (and a fresh controlled temporary
Workspace after the mandated cleanup), with the total cap still two and all
failure history preserved. No retry bypass has been enabled.

Current disposition is HUMAN_REQUIRED_INTERACTION at
`EVIDENCE_CAPTURE_REVALIDATION_SCOPE_CONFIRMATION_PENDING`; implementation
remains NOT_PROVEN, Independent Review NOT_STARTED, closure NOT_PERFORMED,
implementation baseline NOT_FROZEN, and Slice 1 IN_PROGRESS.

Final static/theme/hygiene checks and `git diff --check` passed after the
documentation updates: 91 static files, 20 semantic tokens, 26 changed/new
files, strict UTF-8 without BOM, zero suspicious text, 39 valid local Markdown
links, six unchanged frozen documents, empty staging and unchanged lockfiles.
Product remains master at `2dcc47ff6ca393a4334cc6d7135d8c0b38f2f854`;
Frozen Harness remains clean at `cd5ef8148158c3a752a658978873241fdf8e2bbc`.
The final Node/Electron/NativeCarrier process query found zero residual
Product processes. No commit, push, extra Prompt or retry occurred.

## 13. Owner-authorized final corrective evidence revalidation

The [Owner decision](V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-OWNER-DECISION.md)
V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-20260908-01 authorizes only the remaining
Attempt #2. Its immutable 10466 bytes have SHA-256
aa286888e7e8479481cbae3de71e1217cdfa1572a90bb2757dd439f87a5ad6bc.
This supersedes the scope-pending checkpoint in section 12. Attempt #1 remains
NOT_PROVEN and consumed; its row, original Runtime, summary, postmortem and
reservation history are not modified. A byte-identical ledger snapshot and
complete inherited 26-file/frozen-document byte baseline were captured before
the corrective. The total cap remains two; Attempt #3 is prohibited.

Corrective files and implementation:

- scripts/user-loop-revalidation.mjs: fixed decision identity and bytes, immutable
  first-attempt artifact/record validation, exact eligibility, new identity guards,
  flushed exclusive claim before reservation, durable ledger replacement and
  consumption recording, missing-ledger rejection, baseline/process checks.
- scripts/user-loop-revalidation-preflight.mjs: sequential exact-toolchain required
  regressions and zero-Prompt runtime, per-command logs/hashes/exit codes, source
  fingerprint and a certificate that is required before real submission.
- scripts/user-loop-policy.mjs: a separate narrow beginCorrective route; the normal
  healthy-no-Tool retry rule remains unchanged. Pending evidence hashes cannot
  produce an early PASS.
- scripts/electron-user-loop.mjs: start this authorized run at logical Attempt #2
  with fresh UI identities and prompt index zero; reserve before real Send,
  persist emission/acceptance and outcome, and never loop into a third attempt.
  Allow the existing DOM projection to settle briefly after a live terminal.
- scripts/smoke-user-loop.mjs: explicit owner-corrective-revalidation mode requires
  all bound evidence and preflight; no force/reset/ignore-budget route. All modes
  reject a missing/reset ledger or a changed first-attempt row.
- scripts/user-loop-policy.test.mjs: eight new policy/persistence cases; the
  affected policy roster passed 28/28 before full preflight.
- This record, Durable Evidence, Current State, Document Map and Development Log
  record the new authority without deleting historical failures.

Node --check passed for the new modules and modified driver. Exact command:

~~~powershell
$nodePath = 'C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe'
& $nodePath --test --test-reporter=spec scripts/user-loop-policy.test.mjs
& $nodePath scripts/user-loop-revalidation-preflight.mjs
~~~

The policy command exited 0 (28/28). Full preflight execution be82b5c3-12b0-4ee6-9e5c-f5d480048b14
was started; its per-command artifacts are in the ignored runtime directory.
No Attempt #2 reservation or Prompt had occurred at this checkpoint.
The original controlled journal was read with its recorded hash checked, solely
to confirm semantic data-field shapes; no transcript, marker or new postmortem
artifact was emitted. It remains diagnosis, never live Gate evidence.

## 14. Final same-context live PASS and post-runtime regression

IMPLEMENTATION_RESULT = PASS
V1_SLICE_1C = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
INDEPENDENT_REVIEW = NOT_STARTED
OWNER_CLOSURE = NOT_PERFORMED
IMPLEMENTATION_BASELINE = NOT_FROZEN
V1_SLICE_1 = IN_PROGRESS

The final allowed attempt passed in a new run, controlled Workspace, marker,
Session and Prompt request. All proof comes from that run's live existing
transport and its actual rendered AppWebEntry. No postmortem was needed or used
for the second Gate. Attempt #1 remains NOT_PROVEN with its original ledger row
and artifact bytes unchanged. Its existing outcome is SHACO_IMPLEMENTATION_FAILURE;
its original Runtime report remains HARNESS_PROVIDER_OR_NETWORK_FAILURE. The
Owner's supplementary failure class is EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE.
Neither earlier value was rewritten by this corrective.

| Item | Same-run live evidence |
|---|---|
| Run | 6c938e42-ce2d-4b23-8800-ee29ed377348 |
| Workspace identity SHA-256 | e0c93000087acb3a5ee313225e3fadc6bd55f18b244b997aeb45bcbdeb43652f |
| Controlled path SHA-256 | 288c1c537b7914a928a525a18771c408e4684440c167445627dfea7d6dcfd919 |
| Session SHA-256 | 680931fced7b1f84cd74a666f70110dbee37f7bc3db3b6a4901af8ea5396576f |
| Prompt request SHA-256 | b917da158d3aa3062f3fbd14b99417a7e363eb125fc5bdb92a2d5758a33fc873 |
| Expected / Tool / Assistant / rendered marker SHA-256 | 9308790fca683642b1fc5f29a3a5b5f08f76283924bc22b9cb8687f306d1b920; all match true |
| Tool call correlation SHA-256 | 5b9b51a9fcfc89a427481cc39f86c30142454cf3f7312ffc9896aa65997545b2 |
| Provider / model | deepseek-official / deepseek-v4-flash; Harness-owned |
| Routable / credential ready | true / true; no credential value read or emitted |
| Composer | exact draft matched, Send enabled, editor focused; real DOM Send clicked |
| Prompt accepted | one; timestamp 1788845357881 |
| Reservation | V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-20260908-01:ATTEMPT_2; timestamp 1788845357832, before Prompt |
| Agent turn / steps / live chunks | 1 completed / 2 / 78 |
| Tool / Result | one read; isError=false; correlated successful marker result |
| Rendered final Assistant | markerMatch=true in the same AppWebEntry DOM |
| Observer | order violations=0; duplicate terminals=0; errors=0; dropped metadata=0; pending hashes=0 |
| Multi-Agent | subagent=0, subagent_fork=0, forbidden control calls=0, child spawns observed=0 |
| Approval / Question | NOT_TRIGGERED; settlement not exercised |
| Workspace before / after | proof.txt only; 32 bytes; listing and hash unchanged; removed after snapshot |
| Carrier | max frame 256153/262144; peak streams 5; queue peak 4; one Renderer pull per stream |
| Frozen flow control | initial credits 4, queue capacity 16 unchanged |
| Carrier terminal / credit / overflow | duplicate terminals=0; items after terminal=0; credit violations=0; oversize frames=0 |
| Cleanup | final streams=0, pending unary=0, residual Product PIDs=0, TCP listeners=0 |
| Topology | Main 36164, Worker 24512, Host 50832, Native Helper 48264 |
| Budget | before 1/2; after 2/2; authority CONSUMED; Attempt #3 prohibited |

| Live event | Source sequence |
|---|---:|
| turn/start | 4 |
| step/start | 6 |
| assistant/chunk | 14 |
| assistant/message | 64 |
| tool/call | 65 |
| tool/result | 66 |
| step/end | 67 |
| step/start | 68 |
| assistant/chunk | 69 |
| assistant/message | 97 |
| step/end | 98 |
| turn/end | 99 |

Only the first chunk row per step is retained; all 78 chunks are counted.
Source-sequence gaps in this compact semantic table represent other observed
events and bounded chunk reduction, not stream loss. The observer checked the
full event sequence and recorded zero order violations.

The live audit is Executor verification, not Independent Review. It checked
actual event identities/order/hash matches, DOM result, budget claim, original
first-attempt equality, unchanged implementation fingerprint since preflight,
Workspace snapshots, Carrier metrics and cleanup. The read-only subagents/list
endpoint in the normal AppWebEntry catalog is not a subagent Tool invocation.
No child execution or delegation Tool was observed. Harness retry/error state
was not separately exposed as a complete HTTP count; no Provider error was
observed in this completed turn. There was exactly one accepted Prompt in each
of the two consumed controlled attempts, not a claim of only two HTTP requests.

### Exact regression commands and exits

Preflight be82b5c3-12b0-4ee6-9e5c-f5d480048b14: all 13 checks exit 0. Its new zero-Prompt Session run
447b0749-e0d7-4267-9fd6-09dbf080f2ea proved live follow binding and byte-identical original
ledger SHA-256 dbc0b325f30d85695201a6d6629693d20e2387d7236a0d9e81cd5b39b867fecc.
It observed one AppWebEntry, no second Client/Remote or direct test RPC,
zero observer errors/drop/pending hashes, frame max 253983, and full cleanup.

Post-attempt regression e0a1f2b2-06ea-4b4e-9be6-015408731354: all 12 applicable checks exit 0,
including affected 51/51 and full 120/120 units, with the final 2/2 ledger bytes
unchanged. No extra Session/Prompt was created for this regression.

| Check | Preflight exit | Post-attempt exit | Result detail |
|---|---:|---|---|
| typecheck | 0 | 0 | PASS |
| build | 0 | 0 | .NET Release --no-restore included |
| affected-tests | 0 | 0 | 51 tests |
| full-units | 0 | 0 | 120 tests |
| smoke-carrier | 0 | 0 | PASS |
| smoke-worker | 0 | 0 | PASS |
| smoke-electron | 0 | 0 | PASS |
| smoke-failure | 0 | 0 | PASS |
| session-setup-only | 0 | Not repeated: zero-Prompt preflight only | PASS |
| verify-static | 0 | 0 | PASS |
| verify-theme | 0 | 0 | PASS |
| verify-hygiene | 0 | 0 | PASS |
| git-diff-check | 0 | 0 | PASS |

~~~powershell
$env:SHACO_FORGE_HARNESS_ROOT = 'D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$nodePath = 'C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe'
$env:SHACO_FORGE_WORKER_NODE = $nodePath
& $nodePath scripts/typecheck.mjs
& $nodePath scripts/build.mjs
& $nodePath --test --test-reporter=spec apps/desktop/dist-tests/tests/user-loop-evidence.test.js scripts/user-loop-policy.test.mjs
& $nodePath --test --test-reporter=spec packages/contracts/dist/index.test.js packages/contracts/dist/carrier.test.js apps/worker/dist/config.test.js apps/worker/dist/host-readiness-marker.test.js apps/worker/dist/host-carrier-preflight.test.js apps/worker/host-profile/events-route-preflight.test.mjs apps/desktop/dist/main/security.test.js apps/desktop/dist-tests/tests/theme.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/dist/main/window-lifecycle.test.js apps/desktop/dist/main/worker-supervisor.test.js apps/desktop/dist/main/carrier-client.test.js apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist/main/frame-observation.test.js scripts/user-loop-policy.test.mjs
& $nodePath scripts/smoke-carrier.mjs
& $nodePath scripts/smoke-worker.mjs
& $nodePath scripts/smoke-electron.mjs
& $nodePath scripts/smoke-electron.mjs --inject-carrier-failure
& $nodePath scripts/smoke-user-loop.mjs --session-setup-only
& $nodePath scripts/verify-static.mjs
& $nodePath scripts/verify-theme.mjs
& $nodePath scripts/verify-user-loop-hygiene.mjs
git diff --check
& $nodePath scripts/smoke-user-loop.mjs --owner-corrective-revalidation
~~~

All listed commands exited 0. The build invokes exactly:

~~~text
dotnet build apps/native-carrier/ShacoForge.NativeCarrier.csproj --configuration Release --no-restore
~~~

The full build retained the 28-package pinned Client graph and public built
exports. Existing Vite non-module-script and bundle-size warnings remain;
.NET build reported zero warnings/errors. No new dependency or lockfile change.
The one-use Provider command is historical execution evidence and must not be
run again: its authority and both attempts are now consumed.

### Final runtime artifact identities

All paths below are under the existing ignored runtime directory. Durable
records contain hashes, counts and booleans, never full Prompt/transcript,
Tool arguments, raw marker, credential value or Pipe endpoint.

| Local ignored artifact | Bytes | SHA-256 |
|---|---:|---|
| 6c938e42-ce2d-4b23-8800-ee29ed377348.json | 38429 | 257c57f304d8ec7f562a342d127dd45d8517468b95f0901370d344407ffe83f8 |
| 6c938e42-ce2d-4b23-8800-ee29ed377348-summary.json | 3242 | ecb358ea3077aa6ff914fb6ae755450f023c89553525124c80474bceafcaf734 |
| 6c938e42-ce2d-4b23-8800-ee29ed377348-authorization.json | 1449 | 505b8efe00f846ff6a6cf95540a76477de87a51ae718c4961f1ae5bf474a3b4a |
| 6c938e42-ce2d-4b23-8800-ee29ed377348-live-gate-audit.json | 1790 | 29a9b9bf8156b38b87cf6dbd25da38ece03967796c27086b8fe5f46ab18d48e9 |
| provider-budget.json.attempt2-claim.json | 713 | e9f2a8ce609d6b6fc9731b972eedcc3ddc2f32f604d70470635dae4c92d178b2 |
| provider-budget.json | 2703 | 9f1c718118d8545b66feea5b3a0d63cc2d874e0c5b66214bdf318cec83564e00 |
| be82b5c3-12b0-4ee6-9e5c-f5d480048b14-preflight.json | 7168 | a0f7ef529a894057df6741aaef15dc97b665286e12106657d9ce0311ced804c3 |
| e0a1f2b2-06ea-4b4e-9be6-015408731354-post-regression.json | 6025 | cc36b1c941923209e38f4b90bdb9254f97fcdffd8c263b13f16f18e36ac4159c |

The decision remains exactly 10466 bytes with its approved SHA-256 unchanged.
REVIEW-012 F-05 remains OPEN_KNOWN_CONSTRAINT; 1B NF-6 remains OPEN_NON_BLOCKING.
No Independent Review, Owner Closure, staging, commit, push or architecture
byte change is performed. The final implementation worktree has 29 changed/new
files: the inherited 26 plus the Owner decision and two revalidation modules.

Final documentation hygiene and closing read-only checks passed: 29 changed/new
files, strict UTF-8 without BOM, zero suspicious text, 45 valid local Markdown
links, six frozen document byte hashes unchanged, unchanged lockfiles and empty
staging. Product/Frozen HEADs and clean Frozen Harness were rechecked. The final
process query found zero Product/Host/Native Helper residuals. Source fingerprint
still matches the successful preflight. Original Attempt #1 artifacts and Owner
decision hashes match; the final ledger has two consumed attempts and unchanged
first-attempt history. All closing commands exited 0.
