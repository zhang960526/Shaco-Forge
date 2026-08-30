# P0.S-1 Host Profile Feasibility Evidence

Status: CLOSED

Date: 2026-08-30

Run ID: `SHACO_FORGE_V1_0_P0S_1_HOST_PROFILE_FEASIBILITY_001`

Classification: `NOT_PRODUCTION`

## Executor Result

| Field | Result |
|---|---|
| `SHACO_FORGE_V1_0_P0S_1` | `PASS` |
| `P0S1_STATE` | `CLOSED` |
| `P0S1_EXECUTOR_VERDICT` | `PROVEN_WITH_CONSTRAINT` |
| `P0S1_INDEPENDENT_REVIEW` | `PASS_WITH_REQUIRED_CORRECTIONS` |
| `P0S1_DOCUMENTATION_CORRECTIVE` | `PASS` |
| `P0S1_CORRECTIVE_REREVIEW` | `PASS` |
| `P0S_HOST_PROFILE_FEASIBLE` | `PROVEN_WITH_CONSTRAINT` |
| `ARCHITECTURE_OWNER_LAYER_C_CONSTRAINT_ACCEPTED` | `YES` |
| `P0S1_TECHNICAL_DISPOSITION` | `ACCEPT_PROVEN_WITH_CONSTRAINT` |
| `HOST_LONG_RUNNING` | `YES` |
| `P0S_STANDARD_PRESET_TOOLS_PRESENT` | `YES` |
| `HOST_PROFILE_CORE_PATCH_REQUIRED` | `NO` |
| `ADAPTER_OR_STUB_USED` | `YES` |
| `P0S_CORE_PATCH_INVENTORY_COMPLETE` | `NO` |
| `P0S` | `IN_PROGRESS` |
| `P0S2` | `NOT_STARTED` |
| `F01_STATUS` | `CLOSED` |
| `F02_STATUS` | `CLOSED` |
| `F03_STATUS` | `CLOSED` |

The Executor verdict remains `PROVEN_WITH_CONSTRAINT`. Stage closure is based
on AUDIT-005, CORRECTIVE-005, AUDIT-005B and explicit Architecture Owner
acceptance. This closes P0.S-1 only; it does not close P0.S, complete the global
Core Patch inventory or start P0.S-2.

## A. Baseline Evidence

| Test | Before | After | Result |
|---|---|---|---|
| Shaco Forge root | `D:\Project\Shaco-Forge` | same | PASS |
| Shaco Forge HEAD | `ae9080a3e4efdf0cb7075e0a46090532941e2409` | same | PASS |
| Shaco Forge branch | `master` | same | PASS |
| Shaco Forge worktree | clean | only this P0.S-1 documentation/Spike set | PASS |
| Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` | same | PASS |
| Harness worktree | clean | clean | PASS |
| Harness package | `0.1.2-alpha.1` | same | PASS |
| Lock SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` | same | PASS |

No checkout, reset, pull, upgrade, commit or push was performed.

## B. Build and Profile Evidence

The frozen package scripts could not find their child `node` in the restricted
shell PATH. The same frozen commands were therefore invoked with the discovered
absolute Node executable; build writes were allowed only for this frozen
worktree build. Both official build faces were required because Gateway,
Connection and generated Typert Node faces are emitted in the Client pass.

| Test identity | Command identity | Result |
|---|---|---|
| Host TypeScript face | `D:\Development\nodejs\node.exe --max-old-space-size=4096 node_modules/typescript/bin/tsc -b tsconfig.host.json` | PASS, exit 0 |
| Host bundle face | `D:\Development\nodejs\node.exe --max-old-space-size=4096 node_modules/tsdown/dist/run.mjs --env.DSH_BUILD_FACE host` | PASS, exit 0 |
| Client TypeScript face | `D:\Development\nodejs\node.exe --max-old-space-size=4096 node_modules/typescript/bin/tsc -b tsconfig.client.json` | PASS, exit 0 |
| Client bundle face | `D:\Development\nodejs\node.exe --max-old-space-size=4096 node_modules/tsdown/dist/run.mjs --env.DSH_BUILD_FACE client` | PASS, exit 0 |
| Profile validation | `D:\Development\nodejs\node.exe D:\Project\Shaco-Forge-Upstream\deepseek-harness\apps\cli\lib\bin.js --profile shaco-host --dump-config` | PASS, exit 0; base/local bundle present; stock Web rows absent; stderr empty |

`apps/cli/lib/bin.js` is the built target of the frozen package's official
`dsh` bin. No global pnpm, `boot()`, source/tsx entry or `packages/**/src`
import is part of the runtime proof.

The absolute Node path was used because the restricted child-process PATH did
not reliably resolve `node`. This is a Spike-environment execution measure,
not a requirement that users globally install Node and not a production
startup contract. P0.S-7 must still prove that the packaged Worker does not
depend on system Node or pnpm.

Final runtime root:
`C:\Users\18902\AppData\Local\Temp\shaco-forge-p0s1-d4ede59130ec436e8a343582704718ca`.

- `dump-config.stdout.txt` SHA256:
  `2e0c461ad47653e8beec49e4c1621fa2479f479344ee9cd482e07d422b411e32`
- `spike-result.json` SHA256:
  `dca8f9d3394de32bf268c68734513262e508788ada9562e84d36668ff8d3e584`

## C. Long-Running Process Evidence

Command for both runs:
`D:\Development\nodejs\node.exe D:\Project\Shaco-Forge-Upstream\deepseek-harness\apps\cli\lib\bin.js --profile shaco-host`.

| Run | PID / identity | Started | Ready | Window | Alive after | Listeners ready/after | Children ready/after | Stop / exit |
|---|---|---|---|---:|---|---|---|---|
| 1 | 32780 / `node` | `2026-08-30T18:00:56.4171616+08:00` | `2026-08-30T10:00:59.831Z` | 20s | YES | 0 / 0 | 0 / 0 | marker requests CLI SIGTERM; disposal observed; exit 0 |
| 2 | 41040 / `node` | `2026-08-30T18:01:21.0391396+08:00` | `2026-08-30T10:01:24.109Z` | 10s | YES | 0 / 0 | 0 / 0 | marker requests CLI SIGTERM; disposal observed; exit 0 |

Readiness was not inferred from config parsing. The probe hard-injected the
Host runtime services and wrote `ready.json` only after Connection, Gateway,
Typert, controller, preset, tool and Gateway invocation checks completed.

## D. Stock Web Exclusion

| Negative test | Result | Evidence |
|---|---|---|
| stock `dsh-web-app` | ABSENT | dump-config identity count 0; active composition flag false |
| stock Host Web server | ABSENT | `@deepseek-ai/dsh-host-webserver` count 0 |
| browser opener | ABSENT | `openBrowser` count 0; child-process snapshots 0/0 in both runs |
| token URL / BrowserAuth | ABSENT | no config identity; Layer C records `browserAuthConstructed=false`, `tokenUrlMinted=false` |
| Client HMR | ABSENT | `@deepseek-ai/dsh-client-hmr` count 0 |
| Client modules / SPA fallback | ABSENT | modules count 0; exact `SPA` marker count 0 |
| LAN/browser product listener | ABSENT | `Get-NetTCPConnection` returned no Host-owned listener in four snapshots |
| hidden stock Web fallback | ABSENT | `webServer=false`; no stock Web package or browser child |

Layer A is not confused with Layer B: the final composition does not provide a
Cordis `webServer` service. Layer C provides only the non-listening Connection
contract used by this Host-only proof.

## E. REQUIRED Surface Evidence

| Surface | Result | Evidence | Seam |
|---|---|---|---|
| Host runtime | PASS | `agents`, workspace/session/settings/workspace controllers all present | `DOCUMENTED_EXTENSION_SEAM` |
| CLI/profile/bundle | PASS | official `dsh` bin target, `--profile`, `dsh-base` + bundle, `patchReload: startup` | `DOCUMENTED_PRODUCT_SEAM` / `DOCUMENTED_EXTENSION_SEAM` |
| Gateway | PASS | `typertGateway.invoke`, `stream`, `wireStream.open` present | `PREVIEW_PUBLIC_API` |
| Generated Remote/Typert | PASS | 9 Host package contributions, 58 invocation descriptors | `PREVIEW_PUBLIC_API` |
| Remote execution | PASS | Gateway `agentPresets/list` returned a roster containing shipped `standard` | `PREVIEW_PUBLIC_API` |
| Connection Host side | PASS with constraint | `rpc`, `fetch`, shared Fetch handler present; exact `/api/p0s1-connection-probe` returned 200/`P0S1_CONNECTION_OK` | `PREVIEW_PUBLIC_API` + Layer C |
| stock Web dependency | NO | no `webServer`, Web app or listener | N/A |
| forbidden deep import | ABSENT | static `rg` returned no `packages/**/src`, `/src/` or package `/src` import | FORBIDDEN path not used |

No `INTERNAL` or `FORBIDDEN` seam is used by the successful path.

### E.1 P0-3 census reconciliation

The frozen P0-3 census records 16 Remote namespaces and 71 unary endpoints.
That integer carries `UNARY_COUNT_NON_AUTHORITATIVE`; the P0-3 surface map,
not the count alone, remains authoritative. The P0.S-1 composition registered
9 generated Host packages and 58 invocation descriptors: 55 unary plus the
three streams `workspace/follow`, `session/control`, and `session/follow`.

The namespace delta is entirely outside the V1.0 REQUIRED surface:

| Missing namespace | Unary count | Corresponding package | P0-5 classification | Reason not composed |
|---|---:|---|---|---|
| `messageFeedback/*` | 3 | `@deepseek-ai/dsh-message-feedback` | DEFERRED, OPT-07 / V1.3 candidate | Not V1.0 REQUIRED |
| `pluginInventory/list` | 1 | `@deepseek-ai/dsh-host-plugin-inventory` | DEFERRED / OPTIONAL, OPT-03 | Not V1.0 REQUIRED |
| `dynamicCordisRunner/*` | 12 | `@deepseek-ai/dsh-cordis-host-runner` | DEFERRED / OPTIONAL; P0.S-6 omission proof | Dynamic Cordis is not in the V1.0 default scope |

```text
3 + 1 + 12 = 16 omitted unary endpoints
71 - 16 = 55 unary
55 unary + 3 stream = 58 invocations
```

Therefore 9/58 does not indicate a missing REQUIRED Host surface. All three
uncomposed namespaces are OPTIONAL/DEFERRED, while P0.S-1 proves the REQUIRED
Host surface only. Full endpoint carrier behavior is outside P0.S-1. This
reconciliation is evidence against the frozen maps and must not be treated as
a new production Contract.

## F. Shipped Standard Preset

- Identity: `standard`
- Trust: `system`
- Original path:
  `D:\Project\Shaco-Forge-Upstream\deepseek-harness\packages\preset\agent-presets\presets\standard\agent.cordis.yml`
- SHA256:
  `f04fbc6ec6d38aab78f18690c293ddcb76293107f7e6cd157904b7c0e83094bd`
- `includeShippedRoot=true`, `includeUserRoot=false`, `copiedOrForked=false`.

| P0-5 REQUIRED capability | Accurate package/tool identity | Minimal result |
|---|---|---|
| PowerShell | `@deepseek-ai/dsh-tool-pwsh` / `pwsh` | PASS, `P0S1_PWSH_OK` |
| filesystem read/write/edit | `@deepseek-ai/dsh-tool-fs` / `read`, `write`, `edit` | PASS; create/read/replace in disposable workspace |
| file/content search | `@deepseek-ai/dsh-tool-fs-search` / `glob`, `grep` | PASS; file and `P0S1_BETA` found |
| user question | `@deepseek-ai/dsh-tool-ask-user` / `ask_user_question` | PASS; local fixture settled once |
| continuable child | `@deepseek-ai/dsh-tool-subagent` / `subagent` | PRESENT; shipped text proves `backgroundMode: continuable`; model execution intentionally omitted |
| control/list | `@deepseek-ai/dsh-tool-subagent-control` / `send_message`, `interrupt_agent`, `list_agents` | PASS; empty list, expected unavailable-child send error, interrupt dispatch accepted |

The controlled `send_message` domain error is not `UNKNOWN_TOOL`: it proves
the shipped handler accepted the call and truthfully rejected the fixed absent
child. No credential, secret or model call was used. Optional/Deferred tools
were observed but were not used as P0.S-1 gates.

The frozen Windows ACL runner initially rejected `workspace-write` with
`CreateRestrictedToken failed (Win32 87)`. For the inert PowerShell marker only,
the session recorded Harness's supported `danger-full-access` policy, then
immediately recorded `workspace-write` before filesystem checks. Production
may not inherit this exception.

## G. Layer C Adapter / Stub

| Field | Value |
|---|---|
| `ADAPTER_OR_STUB_USED` | `YES` |
| Surface | `HostConnectionService` Connection registry + Gateway unary interceptor; local question-answer fixture |
| Why | stock Connection Host hard-depends on Layer A `webServer`/BrowserAuth; Host-only proof needs the carrier-neutral registry without Layer B |
| PublicOrPreviewSeamUsed | package-root `@deepseek-ai/dsh-client-connection` `HostConnectionService`; `typertGateway.invoke`; Cordis profile/bundle plugin seam |
| WhetherListening | `NO` |
| ExposedProductSurface | `NONE` |
| SecurityBoundaryImpact | no external boundary; deny-all unauthenticated status 401; no token, listener, BrowserAuth or Renderer access |
| ProductionImpact | prototype cannot ship; production authenticated physical carrier/trust adapter remains P1/P3 work |
| MaintenanceConstraint | pin the preview API; Owner must accept the structural BrowserAuth collaborator exception or choose an approved public contract |
| WhyThisIsNotCorePatch | all code lives in the Shaco profile/bundle; Harness Git diff is empty; no core file or lockfile changed |

Adapter tests: both starts repeat; zero listeners; no stock routes, Web app,
BrowserAuth, token URL, HMR or browser opener; exact Connection Fetch registry
route and Gateway Remote call succeed; Harness remains clean.

### G.1 Invoke-based unary boundary

The Layer C `/api` interceptor is invoke-based unary dispatch. It uses the
`HostConnectionService` Connection registry to accept the registered unary
request and calls `typertGateway.invoke` for the Gateway business path. This
proves Host Profile and unary Connection/Gateway feasibility only; it is not a
complete Connection Carrier.

The adapter does not provide the official `dispatchRpc` event-settlement
special branch or prove any of the following:

- `$events` or `$events/result`;
- stream open/item/error/end, stream cancellation, or backpressure;
- connection-loss behavior;
- approval settlement or user-question settlement over the carrier;
- complete cancel semantics.

The local question-answer fixture proves only that the shipped tool can be
composed and settled locally; it is not evidence of carrier settlement. All
behaviors above must be validated by P0.S-4 Connection Carrier / Feature
Completeness. P0.S-1 does not set `P0S_STREAM_PASS`,
`P0S_EVENT_GENERATION_PASS`, `P0S_APPROVAL_PASS`,
`P0S_USER_QUESTION_PASS`, or `P0S_CANCEL_PASS`.

This unary-only constraint does not negate
`P0S_HOST_PROFILE_FEASIBLE = PROVEN_WITH_CONSTRAINT` or
`HOST_PROFILE_CORE_PATCH_REQUIRED = NO`.

## H. Core Patch Inventory

| Area | Result |
|---|---|
| `HOST_PROFILE_CORE_PATCH_REQUIRED` | `NO` |
| `CONNECTION_CARRIER_CORE_PATCH_REQUIRED` | `UNRESOLVED / NOT_YET_TESTED` |
| `CLIENT_BOOT_CORE_PATCH_REQUIRED` | `UNRESOLVED / NOT_YET_TESTED` |
| `CLIENT_MODULE_CORE_PATCH_REQUIRED` | `UNRESOLVED / NOT_YET_TESTED` |
| `NATIVE_PACKAGING_CORE_PATCH_REQUIRED` | `UNRESOLVED / NOT_YET_TESTED` |
| `P0S_CORE_PATCH_INVENTORY_COMPLETE` | `NO` |

The Layer C result is classified separately and does not turn the Host Profile
answer into `YES` for a Core patch. No other P0.S area is inferred as `NO`.

## I. Failure Diagnostics and Reproducibility

Disposable iterations preserved truthful failure evidence:

- Host build face alone lacked generated Node library faces for Typert,
  Gateway and Connection; the official Client build face closed the build.
- Whole-tree `loader.await()` waited on a legal optional directory-picker
  dependency; readiness was corrected to the explicit REQUIRED inject barrier.
- `ask_user_question` initially waited for a Client Remote event; a local
  no-credential answer fixture was placed before the API Remote assembly.
- Early Connection probes exposed a proxy-registration misuse, an incorrect
  `/api` path and an undeclared `webServer` access. Each failed closed; no
  failed path was counted as success.
- An earlier default PowerShell call exposed the Windows ACL runner failure;
  the final bounded policy test is recorded above.

Final startup was repeated twice after clean stop with identical service,
standard, tool, Gateway, no-listener and exit results.

## J. File and Configuration Identity

| File | SHA256 |
|---|---|
| `bundle/connection-compatibility.mjs` | `230ab753ea79912ec38f806a1eb78849c3f2a92fb2ba0ed4d620eafc11460d30` |
| `bundle/cordis.patch.yml` | `423eed484f40029ffda00f5d2d8a0bc2c6b927cfdf6c6eb85aa90d8de710c5c4` |
| `bundle/package.json` | `e27711081a41b30277ee64565fdb12722c4b4b723ae96fea8b95b4da48970f2e` |
| `bundle/probe.mjs` | `50ff8b43bc8077c9b1d4d68fbae38000c5955dfbc36099f98f41457a68b05598` |
| `bundle/question-answerer.mjs` | `89502cb802b562e515fbc0ba50882fa2a28178cab8af551a39a41da4e9e2731e` |
| `profile/cordis.patch.yml` | `5239a7754876b9a70871c45e41f1bd9abbd91ed2de67af926c1cfcc9c9377d51` |
| `profile/package.json` | `7c4884612c491aaf761caa0d88b1558ced2afbaf64bc00846fec1a4b98fdeb25` |
| `run-spike.ps1` | `0beb1238dcb17dc12546f4e93c6f2040889d5c0fe8165cd209488524908b072f` |

Hashes identify the executed prototype files before this Evidence/Experiment
documentation update. The prototype code itself was not changed afterward.

F-REV-01 was a LOW, non-blocking documentation-hygiene finding concerning a
transcription error in the `profile/package.json` SHA256. Formal-closure
recomputation produced
`7c4884612c491aaf761caa0d88b1558ced2afbaf64bc00846fec1a4b98fdeb25`;
the table above now records that exact value. This documentation correction
does not change any prototype byte, technical conclusion or gate.

## K. Cleanliness and Regression

- No production implementation file modified.
- No P0 Evidence or historical AUDIT/Review rewritten.
- Frozen Harness source diff empty; lockfile hash unchanged.
- No dependency/lockfile/generated-file drift in Shaco Forge.
- Shaco changes are limited to this disposable Experiment, its Evidence,
  faithful Review/corrective summaries and authorized current-state/development
  records.
- No commit, push, pull, reset, checkout or upgrade.

## L. Constraints, Production Impact and Required P1 Contract

Executor constraint: the Host Profile is feasible only with the Layer C
non-listening compatibility service. The Architecture Owner accepted this
constraint and the `ACCEPT_PROVEN_WITH_CONSTRAINT` technical disposition.
AUDIT-005B closed F-01/F-02/F-03 and authorized Owner closure; P0.S-1 is now
PASS / CLOSED while the feasibility value remains constrained.

Production must not reuse the structural deny-all auth facade, local question
answerer, marker stop/heartbeat or the PowerShell policy exception. P1 must
freeze an authenticated local Connection/physical-carrier contract, and P1/P3
must define the complete Connection semantics without Renderer-direct-Worker
access or BrowserAuth/token/HTTP product listeners. P0.S-4 must validate the
event, stream, settlement, cancellation, connection-loss and backpressure
behavior that this invoke-only adapter does not prove. P1/P7 must also freeze
the packaged two-face library closure and production Windows sandbox behavior
without a global pnpm assumption. The Win32 87 result remains P0.S-7 / H-25
input, not a P0.S-1 blocker or permission to weaken production policy.

P0.S-2 remains `NOT_STARTED`. The next authorized action is preparation for
P0.S-2; this closure record does not execute it.
