# P0-6 — Harness Dependency & Stability Matrix

Status: `CLOSED / PASS`
Scope: P0-6 dependency boundary freeze only
Frozen Harness: `deepseek-ai/deepseek-harness@cd5ef8148158c3a752a658978873241fdf8e2bbc`
`list_subagent_models` remains `CONDITIONAL` / `OPTIONAL` (P0-5 SUB-04). This step does not reopen P0-5 product scope.

## A. Frozen Baseline

| Item | Verified value |
|---|---|
| Repository | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Worktree | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Release | `dsh-v0.1.2-alpha.1` |
| Package | `@deepseek-ai/dsh@0.1.2-alpha.1` |
| `pnpm-lock.yaml` SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| Required Node | `^22.19.0 \|\| >=24.0.0` |
| Upstream clean before | YES |
| Upstream clean after | YES |
| Build/tests executed | NO; classification used package exports, source, docs, generated remotes, and prior P0-2/P0-3/P0-4/P0-5 evidence |

All upstream paths below are relative to the frozen worktree.

## B. Classification Rules

Only these six classes are used. There is no `STABLE` class.

| Class | Meaning |
|---|---|
| `DOCUMENTED_PRODUCT_SEAM` | Official product composition or generated product contract the current upstream product itself uses. Shaco may depend, still pinned. |
| `DOCUMENTED_EXTENSION_SEAM` | Documented profile / bundle / plugin / provider / composition extension. Prefer official composition. |
| `PREVIEW_PUBLIC_API` | Published package/type/export used by current product, but Developer Preview may break it. Depend only through a Shaco Adapter or compatibility test. |
| `SUPPORT_API` | Diagnostics, dump, invariant, generator, test helpers. Not a production runtime contract. |
| `INTERNAL` | Visible source without a stable product seam. Product code must not import it. If no alternative exists, record `ARCHITECTURE_RISK`; do not silently allow. |
| `FORBIDDEN` | Must not enter the Shaco production dependency graph. |

Rules applied:

- “Can import” is not “may depend.”
- Generated `./remote` and `./typert` are product contracts, not forbidden.
- `exports["./src/*"]` is a workspace source-launch hook. Production use is `FORBIDDEN`.
- Named Pipe is **not** a Harness Connection/Gateway/boot seam. Treat it as a Shaco-owned carrier candidate.

## C. Complete Dependency Matrix

Columns are abbreviated: `Pub` = public export, `Doc` = documented, `Ext` = official extension, `RT` = runtime vs build, `Direct` = product may depend directly, `Adp` = Adapter required, `Pin` = version pin required, `Compat` = compatibility test required, `Patch` = core patch required now.

| DependencyId | PackageOrSeam | ActualPath | Purpose | UsedBy | UpstreamUsage | Pub | Doc | Ext | RT | StabilityClass | Direct | Adp | Pin | Compat | Patch | UpgradeRisk | FailureImpact | Fallback | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DEP-BOOT-01 | `dsh` CLI bin | `@deepseek-ai/dsh` `bin.dsh` → `lib/bin.js` | Sole supported Node app launcher | ARCH-02/05, Worker | Product + Python/SDK spawn | bin only | YES | N/A | runtime | DOCUMENTED_PRODUCT_SEAM | spawn only | YES launcher | YES | YES | NO | CLI argv/profile grammar | Worker cannot start | none without new ADR | `apps/cli`; `docs/architecture.md` |
| DEP-BOOT-02 | `dsh --profile` shipped names | CLI + app-boot templates | Boot `web`/`headless`/`sdk`/`acp` | discovery only | Product templates | no JS | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | NO as Worker | N/A | YES | YES | NO | template bundle list | Wrong surface (browser/one-shot) | custom profile | `PROFILE_TEMPLATES` |
| DEP-BOOT-03 | Custom profile + bundle | `$DSH_HOME/profiles/<name>` + `dsh.bundle.patch` | Shaco Host composition | ARCH-02, PLG-01 | Official extension | YAML | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | YES compose | optional | YES | YES | NO | whole-row patch replace | Host missing controllers/tools | P0.S-1 | `publish.md`; `dsh plugin` |
| DEP-BOOT-04 | `@deepseek-ai/dsh-base` | `./cordis.patch.yml` | First Host layer | ARCH-02 | First layer of web/headless/sdk/acp | YAML | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | composition only | NO | YES | YES | NO | base row set | No session/tools if used alone | add Shaco bundle | base README |
| DEP-BOOT-05 | `@deepseek-ai/dsh-web-app` | `./cordis.patch.yml` + glue | Browser GUI Host | WEB_* | `dsh --profile web` | YAML/JS | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | NO for Shaco Host | if reused | YES | YES | NO | webserver/token/roster | Pulls HTTP/browser | own Host bundle | web-app patch |
| DEP-BOOT-06 | `@deepseek-ai/dsh-app-boot` `.` | `boot`/`loadProfile` | Internal launcher library | tests/CLI | CLI imports `.` | YES | embedders/tests | NO | runtime | SUPPORT_API via import; FORBIDDEN as Worker main | NO | N/A | YES | NO | NO | boot API | Bypasses only supported entry | spawn `dsh` | app-boot README |
| DEP-BOOT-07 | `patchReload` | `dsh.profile.patchReload` | `live` \| `startup` | ARCH-02 | Manifest field | YAML | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | YES field | NO | YES | YES | NO | watcher/HMR impl INTERNAL | Live watchers in Worker | set `startup` | architecture.md |
| DEP-BOOT-08 | dump-config | `--dump-config` | Diagnostics | P0 only | CLI support | CLI | YES no byte-stability | NO | build | SUPPORT_API | DEV only | N/A | NO | NO | NO | dump shape | False runtime contract | ignore at runtime | dump-config.ts |
| DEP-CONN-01 | ConnectionHandle / `rpc.call` / optional `rpc.open` | `dsh-client-connection` `.` / `./client` | Business RPC | ARCH-03/04 | Product Client/Host | YES | YES preview | NO | runtime | PREVIEW_PUBLIC_API | NO | YES carrier | YES | YES | possible | envelope/generation | All Remotes fail | loopback HTTP fallback | connection README; `open?` is optional |
| DEP-CONN-02 | `createSharedFetchHandler` | Host connection | Authenticated Fetch/bytes | ARCH-04 | Host + experimental WW | YES | YES preview | NO | runtime | PREVIEW_PUBLIC_API | NO | YES | YES | YES | possible | Fetch register | Binary/module bytes fail | P0.S-4 | rpc-host.ts |
| DEP-CONN-03 | `__DSH_TRANSPORT__` (`fetch` / `openStream` / `loadBundle` / `ownsHost`) | Client global | Injected carrier hooks | ARCH-01/03 | Client apply() | YES | YES preview | NO | runtime | PREVIEW_PUBLIC_API | NO | YES boot | YES | YES | possible | hook shape | Client falls to page fetch/WS | P0.S-2/4 | client/index.ts |
| DEP-CONN-04 | HTTP/WS/cookie/BrowserAuth | `/api`, `/api/remote.mux` | Web transport | WEB_* | `dsh web` | YES | YES | NO | runtime | INTERNAL for Desktop identity | NO | N/A | YES | NO | NO | cookie/Host/Origin | Wrong trust model | Shaco carrier | P0-4 |
| DEP-CONN-05 | Named Pipe | win32 stdout drain / sandbox deny | Not IPC | LIFE/ARCH carrier | FFI drain only | NO | NO as IPC | NO | N/A | FORBIDDEN as Harness extension claim | NO | Shaco-owned | N/A | YES product | NO | Shaco ACL/path | Carrier unproven | Electron IPC / loopback HTTP | ffi.ts; P0S contract |
| DEP-GW-01 | API Gateway | `dsh-api-gateway` `.` / `./client` / `./types` | Unary/stream/`$events` | ARCH-03, PERM, TOOL-10 | Product | YES | YES preview | NO | runtime | PREVIEW_PUBLIC_API | NO | YES | YES | YES | possible | `$events` frames | Interaction/session streams fail | none | gateway README |
| DEP-GW-02 | Generated `./remote` | business pkgs `./remote` | Client Remote contract | all Remote REQUIRED | Client `$mount` | YES | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | YES | NO | YES | YES | NO | descriptor set | Client/Host mismatch | fail closed | generated `lib/typert.remote-client.*` |
| DEP-GW-03 | Generated `./typert` | business pkgs `./typert` | Host Typert descriptors | Host | Typert loader | YES | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | YES compose | NO | YES | YES | NO | descriptor set | Host methods missing | fail closed | generator README |
| DEP-GW-04 | Typert generator | `dsh-typert-generator` | Build-time emit | build | build | YES | YES | NO | build | SUPPORT_API | DEV only | N/A | YES | NO | NO | generator CLI | Not runtime | do not ship | generator package |
| DEP-GW-05 | SRC/tsx Host fallback | loader SRC codecs | Dev source boot | tests/dev | Client refuses SRC | NO product | YES forbidden prod | NO | runtime | FORBIDDEN | NO | N/A | N/A | N/A | NO | source tree | Undocumented Host | built `lib` | gateway README |
| DEP-CLI-01 | `dsh-client-web` | `.` `AppWebEntry` | Web GUI boot | ARCH-01 | Web product | YES | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM for Web; PREVIEW for Desktop | NO | YES boot | YES | YES | possible | injected globals | Client cannot start | P0.S-2 | client/web |
| DEP-CLI-02 | `dsh-client-modules` | `.` / `./client` | Boot graph + `/plugins` | ARCH-01, PLG-01 | Web Host | YES | mixed | NO | runtime | PREVIEW_PUBLIC_API; serving WEB | NO | YES | YES | YES | possible | graph/url/rev | Modules missing | static pack P0.S-6 | modules README |
| DEP-CLI-03 | Required UI `./client` | P0-5 L.1 roster | In-box Client modules | REQUIRED UI | Web roster | YES | YES | authoring `dsh.client.platform:"web"` | runtime | DOCUMENTED_PRODUCT_SEAM | compose | YES pack | YES | YES | NO | module graph | UI missing | P0.S-6 | P0-5 L.1 |
| DEP-CLI-04 | `dsh-client-hmr` | `/plugins/events` | Dev HMR | WEB-08 | Dev | YES | YES dev | NO | runtime | INTERNAL / omit | NO | N/A | NO | NO | NO | SSE | None if omitted | omit | hmr README |
| DEP-SES-01 | Session Remote | `dsh-api-session-controller/remote` | create/follow/page/prompt/cancel | SES-*, CONV-* | Product | YES | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | YES | NO | YES | YES | NO | method set | Core loop fails | none | generated remote |
| DEP-SES-02 | Session `./client` | journal/control streams | Client session adapter | SES-03/04 | Product Client | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | NO | YES projection | YES | YES | NO | cursor/gap repair | History/reconnect wrong | none | session-controller README |
| DEP-SES-03 | `ctx.agents.resume` | `dsh-agent` / agent-loop | Host cold resume | SES-05, LIFE-05 | Host only | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | Host compose only | NO Desktop | YES | YES | NO | resume API | Cold continue fails | none | agent README; resume.spec |
| DEP-SES-04 | SessionEvent / format v0 | `dsh-session` | Journal types | SES-07 | Persistence | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | types only | YES identity | YES | YES | NO | v0 fail-closed | Logs refused | opaque backup | types.ts |
| DEP-PER-01 | Persistence abstract | `dsh-session-persistence` | `ctx.sessionPersistence` | SES-07 | Host | YES | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | compose | NO | YES | YES | NO | coordinator | No durability | none | persistence README |
| DEP-PER-02 | JSONL backend | `dsh-session-persistence-jsonl` | Default durable log | SES-07 | `dsh-base` | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | compose | NO | YES | YES | NO | zstd/layout/v0 | Sessions lost | none | jsonl README |
| DEP-PER-03 | SQLite session persistence | `dsh-session-persistence-sqlite` | Alternate backend | not V1 | not in base/web | YES | YES | YES unused | runtime | INTERNAL | NO | N/A | N/A | N/A | NO | SCHEMA 19 | Extra native DB | stay JSONL | package |
| DEP-PER-04 | Query sqlite | `dsh-session-query-sqlite` | FTS index `openAt:never` | SES-10 OPTIONAL; roster mount | base `:memory:` | YES | YES | NO | runtime | SUPPORT_API for V1 default | compose disabled | N/A | if enabled | if enabled | NO | `node:sqlite` schema 8 | Search only | keep never-open | schema.ts |
| DEP-SET-01 | Settings/credentials Remote | settings-controller `./remote` | describe/update/set/unset | SET-*, CRED-*, MOD-02 | Product | YES | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | YES | NO | YES | YES | NO | methods | Setup fails | none | generated remote |
| DEP-SET-02 | settings-file / credentials-local | file providers | `$DSH_HOME` files | SET-02, CRED-02 | base | YES | YES | YES | runtime | PREVIEW_PUBLIC_API | compose | NO | YES | YES | NO | YAML versions | Settings/keys lost | none | READMEs |
| DEP-SET-03 | `connection.isLoopback` / `ownsHost` | Client connection | Settings file vs memory | SET-02 | Client | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | NO | YES capability | YES | YES | NO | hostname heuristic | Settings become memory | Desktop capability | P0-4 I |
| DEP-WS-01 | Workspace Remote | workspace-controller `./remote` | create/follow | WS-01/02 | Product | YES | YES | NO | runtime | DOCUMENTED_PRODUCT_SEAM | YES | NO | YES | YES | NO | snapshot stream | Sidebar empty | none | generated remote |
| DEP-WS-02 | Directory picker abstract | `dsh-host-directory-picker` | `ctx.directoryPicker` | WS-04 | Host | YES | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | compose | YES Desktop | YES | YES | NO | capabilities | No folder pick | Desktop dialog | picker README |
| DEP-WS-03 | Native picker | `dsh-host-directory-picker-native` | `IFileOpenDialog` child | WS-04 | Web host display | YES | YES | YES | runtime | PREVIEW_PUBLIC_API | compose or replace | YES | YES | YES | NO | koffi worker | Picker fails | Desktop Main dialog | native README |
| DEP-WS-04 | Picker-auto | `dsh-host-directory-picker-auto` | SSH/bind/display inference | WEB host | web only | YES | YES | NO | runtime | INTERNAL for Desktop | NO | N/A | NO | NO | NO | bind-host heuristics | Wrong picker | native/browse explicit | auto README |
| DEP-INT-01 | Approval / questions | user-approval / user-questions | `$events` waterfalls | PERM-05/06, TOOL-10 | Product | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | compose | YES events | YES | YES | NO | eventId/result | Safety loop broken | none | approval README |
| DEP-INT-02 | Permission presets | permission-presets + base YAML table | three shipped policies | PERM-01..04 | base YAML | YES | YES | NO | runtime | PREVIEW_PUBLIC_API + product YAML | compose | NO | YES | YES | NO | table ≠ package default | Missing `read-only` | pin base table | base YAML |
| DEP-PRE-01 | Shipped `standard` | `dsh-agent-presets` `presets/standard` | REQUIRED tools | PRE-01, tools | web default | package files | YES | YES load | runtime | DOCUMENTED_PRODUCT_SEAM | load, do not copy | NO | YES | YES | NO | preset files | Tools vanish | none | shipped-root.spec |
| DEP-TOOL-01 | REQUIRED tools | tool-pwsh/fs/fs-search/ask-user/subagent* | Model tools | TOOL-*, SUB-* | standard | `.` | YES | YES | runtime | DOCUMENTED_PRODUCT_SEAM | compose | NO | YES | YES | NO | tool names | Coding loop fails | none | standard YAML |
| DEP-SUB-01 | In-process spawn/control | subagent + spawn-in-process + control | Core children | SUB-01/02 | standard | YES | YES | YES provider | runtime | DOCUMENTED_PRODUCT_SEAM | compose | NO | YES | YES | NO | continuable API | Delegation fails | none | subagent README |
| DEP-SUB-02 | External providers | codex/claude/acp/sdk | Deferred children | SUB-05..08 | extra bundle | YES | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | NO in V1 | N/A | N/A | N/A | NO | extra bins | N/A | deferred | P0-5 |
| DEP-PLG-01 | In-box Loader/profile | bundles + preset | Official graph | PLG-01 | product | YAML | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | compose | NO | YES | YES | NO | roster | Core missing | P0.S-1 | ADR-0005 |
| DEP-PLG-02 | Cordis runners/UI | host/client runner + ui-cordis | Dynamic Cordis | PLG-03..05 OPTIONAL | web inserts | YES | YES | YES | runtime | DOCUMENTED_EXTENSION_SEAM | omit if proven | N/A | YES | YES | possible if boot-hard | boot graph | Boot fail if omitted early | P0.S-6 | P0-2 J |
| DEP-PLG-03 | `dsh plugin` npm/GitHub | CLI → pnpm | Install plugins | PLG-07..10 | extension | CLI | YES | YES | build | DOCUMENTED_EXTENSION_SEAM | NO product | N/A | N/A | N/A | NO | pnpm/git prepare | Supply chain | packaged graph | plugin.ts |
| DEP-WIN-01 | Windows ACL sandbox | sandbox-windows-acl + `./runner` | Confinement | TOOL-01, PERM-02/03 | win32 local | YES | YES | YES | runtime | PREVIEW_PUBLIC_API | compose | NO | YES | YES | possible if Electron ABI | koffi + `lib/runner.js` spawn | Sandbox fail-closed | none (fail closed) | sandbox README |
| DEP-WIN-02 | pwsh sandbox/tool | pwsh-sandbox + tool-pwsh + pwsh-local | Windows shell | TOOL-01 | standard win32 | YES | YES | YES | runtime | DOCUMENTED_PRODUCT_SEAM | compose | NO | YES | YES | NO | host `pwsh.exe` not packaged | No shell | require system PS | standard YAML; resolvePwshPath |
| DEP-WIN-03 | `@vscode/ripgrep` | tool-fs-search dep | grep/glob | TOOL-06/07 | packaged binary | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | compose | NO | YES | YES | NO | native binary | Search fails | none | tool-fs-search |
| DEP-WIN-04 | `koffi@3.1.1` | several packages | Win32 FFI | persistence, sandbox, picker, inspector | product | YES | YES | NO | runtime | PREVIEW_PUBLIC_API | transitive | NO | YES | YES | possible Electron rebuild | N-API vs Electron ABI | Native ops fail | Node sidecar | package.jsons |
| DEP-WIN-05 | `node-pty@1.2.0-beta.15` | subprocess-local static import | ConPTY / PTY | TOOL-01 impl load | patched | YES | YES | NO | runtime | SUPPORT_API native payload | transitive | NO | YES | YES | possible | loaded even for `pwsh -Command` | Worker cannot load | Node sidecar / unpack | node-pty patch |
| DEP-WIN-06 | `node-addon-require-builtin` | vendor/loader | Node internal ESM | Host Cordis load | CLI | YES | NO product | NO | runtime | INTERNAL | NO | N/A | YES | YES | possible in Electron | Node 22 vs 24 internals | Loader fail | Node sidecar | vendor/loader |
| DEP-FORB-01 | `packages/**/src` | `./src/*` | Source-launch | tests | workspace | listed | NO product | NO | N/A | FORBIDDEN | NO | N/A | N/A | N/A | NO | source | Upgrade magnet | published `.` | AGENTS.md |
| DEP-FORB-02 | experimental / test-support | `packages/experimental/**`, `test-support/**` | Non-product | none | tests/exp | YES | YES exp | NO | N/A | FORBIDDEN | NO | N/A | N/A | N/A | NO | exp APIs | Hidden deps | omit | package paths |

`CORE_PATCH_REQUIREMENT` for the matrix as a whole: `POSSIBLE_REQUIRES_P0S`. Do not rewrite to `NONE` or `KNOWN_REQUIRED`. No REQUIRED Feature is known to need a Harness core patch today. Classification of the inject question is `OPEN_FOR_P0S`.

Three layers must not be conflated (AUDIT-004 F-01):

- **Layer A — Cordis service contract.** Official Host `@deepseek-ai/dsh-client-connection` hard-injects `['webServer', 'credentials']`. Official Host `@deepseek-ai/dsh-client-modules` hard-injects `['webServer', 'loader']`. That means those plugins require a Cordis service named `webServer`. It does **not** prove that stock HTTP listen, SPA, token URL, HMR, `openBrowser`, or `dsh-web-app` are required.
- **Layer B — stock `dsh-web-app` HTTP/Web product stack (`STOCK_WEB_TRANSPORT`).** HTTP listener, `/api`, `/api/remote.mux`, `/plugins`, SPA/static, token URL, BrowserAuth, HMR, `openBrowser`, web-runtime. Primary Shaco architecture still wants this browser-facing product path removed.
- **Layer C — Shaco compatibility service / adapter (Spike candidate only).** P0.S may prove a profile/bundle/adapter/non-listening stub/carrier bridge that satisfies Layer A without Layer B. A stub/adapter is not automatically a Core Patch.

**Gateway:** `TypertGatewayService.static inject = ['typert']`. Gateway does **not** hard-inject stock `webServer`. HTTP mux / Web adapter registration is optional `ctx.inject(['connection', 'webServer'], …)` composition. Do not write that Gateway and Connection/modules all hard-inject `webServer`.

## D. Boot / Profile / Bundle Boundary

`BOOT_DEPENDENCY_BOUNDARY`

Allowed:

- Spawn packaged `dsh` with `--profile <shaco-host>`.
- Name `@deepseek-ai/dsh-base` in `dsh.profile.bundles`.
- Shaco-owned bundle (`dsh.bundle.patch` + `cordis.patch.yml`) inserting **public package names**.
- `dsh.profile.patchReload: startup` (custom default is `live`; Worker must override).
- Profile/home patches. Prefer a pre-baked profile over runtime `--patch` or `dsh plugin`.

Adapter required:

- Host launcher: argv, `DSH_HOME`, env, SIGTERM/SIGINT, working directory, pre-composed profile materialization.

Forbidden:

- `import { boot } from '@deepseek-ai/dsh-app-boot'` as Worker main.
- `packages/boot/**/src/**`, `apps/cli/src/**`, `./src/*`.
- Wholesale `@deepseek-ai/dsh-web-app` as the Shaco Host.
- `dsh --profile web` or `headless` as the Worker.
- dump-config as a runtime API.
- Production `tsx` / SRC launch.
- `dsh plugin` as a packaged-runtime requirement (needs pnpm on PATH).

Risks:

- `dsh-base` alone has no session/settings/workspace controllers, Connection, or `dsh-agent-presets`.
- Official Host connection/modules plugins **hard-inject the Cordis `webServer` service contract** (Layer A). That is `OPEN_FOR_P0S`, not `KNOWN_CORE_PATCH_REQUIRED`. Extension YAML / a non-listening compatibility service / adapter may still suffice (P0.S-1). Do not equate Layer A with stock `dsh-web-app` HTTP (Layer B).
- Whole-row patch replace is upgrade-sensitive.
- AUDIT-001 allowed embedding `dsh-app-boot`. Frozen upstream architecture + `verify-application-entrypoints` say **only `dsh`**. This matrix follows source.

## E. Connection Boundary

`CONNECTION_DEPENDENCY_BOUNDARY`

Business seam (`HARNESS_BUSINESS_CONNECTION_SEAM`):

- `ctx.remote.*` / `$on` / `$stream` / `$mount`
- Typert endpoint `"<namespace>/<method>"`
- `ConnectionHandle` `{ generation, rpc.call, rpc.open? }` — Client `rpc.open` is **optional**; browser transports omit it
- Client `__DSH_TRANSPORT__.openStream` (preview stream hook used by `createWebConnectionRpc`)
- Host `rpc.intercept`, `fetch.register`, `createSharedFetchHandler.fetch`
- Gateway `invoke` / `stream` / `wireStream.open`, `$events`, `$events/result`
- Envelopes, generation, `connection/reset`

Web transport (`WEB_TRANSPORT_IMPLEMENTATION`): HTTP `/api`, WS mux, BrowserAuth cookie, `node:http` bridge, HTML inject, `/plugins`.

Public exports: `dsh-client-connection` `.` and `./client`; `HostConnectionHandle`, `createSharedFetchHandler`, `ClientTransportHooks`.

Carrier extension status: **no documented Harness Named Pipe / IPC carrier**. Carrier candidates are preview APIs (`rpc.call`, optional `rpc.open`, shared Fetch, Host `wireStream`, `__DSH_TRANSPORT__.openStream`). Named Pipe must preserve the **streaming contract**, not a specific `rpc.open` method. Experimental `webworker-runtime` is seam evidence only and still requires a Cordis `webServer` **service** (Layer A); that is not proof of Layer B.

Named Pipe status: **not** `DOCUMENTED_EXTENSION_SEAM`. Upstream uses `PeekNamedPipe` only while draining child stdout; sandbox teaching forbids confined processes from opening named pipes. Pre-classify as `SHACO_CUSTOM_CARRIER_PLUGIN`.

Adapter required: YES — authenticate before Fetch/stream; preserve unary/stream/cancel/generation/`$events`; do not use cookie as identity; set `ownsHost` or equivalent so settings are not memory.

Forbidden internals: `ConnectionController`, `isLoopbackHostname` as product import, `http-bridge` / BrowserAuth as Desktop identity, experimental webworker as “the carrier”.

P0.S required: P0.S-2, P0.S-3, P0.S-4.

## F. API Gateway / Remote / Typert Boundary

| Surface | Class | Direct? |
|---|---|---|
| Gateway Host/Client/`./types` | PREVIEW_PUBLIC_API | Adapter |
| Generated `./remote` | DOCUMENTED_PRODUCT_SEAM | YES |
| Generated `./typert` | DOCUMENTED_PRODUCT_SEAM | YES compose |
| `dsh-api-remotes` selection | DOCUMENTED_PRODUCT_SEAM | YES |
| `dsh-typert-protocol` authoring | DOCUMENTED_EXTENSION_SEAM | if authoring |
| `dsh-typert-registry` / loader | PREVIEW / EXTENSION | compose |
| Generator / tsdown | SUPPORT_API | DEV only |
| Generator internals / SRC fallback | INTERNAL / FORBIDDEN | NO |

`api-remotes/client` always `$mount`s `dsh-cordis-host-runner/remote`. That is BFF selection, not proof that `ui-cordis` is boot-hard.

Gateway Host plugin: `static inject = ['typert']`. It does **not** hard-inject `webServer`. The WebSocket mux registers only when both `connection` and `webServer` are present (optional composition). Logical Gateway invoke / `wireStream` / `$events` do not require stock HTTP.

## G. Client Boundary

`CLIENT_DEPENDENCY_BOUNDARY`

Reusable public Client:

- Required in-box `./client` modules from P0-5 L.1.
- Wire types: `WebBootGraph`, `parseBootManifest`, `ConnectionHandle`.
- Generated remotes via `dsh-api-remotes/client`.

Boot graph: Host-dynamic scan of `dsh.client`, combo `/plugins/??...&rev=...`. Official `__DSH_BOOT__` / `__ModuleLoader__` come from webserver index inject.

Module loader: default is classic `<script src>` (Web-only). `__DSH_TRANSPORT__.loadBundle` can skip HTTP prefetch. URLs may keep `/plugins` shape if the loader satisfies them.

Web-only: `client-hmr`, token URL, BrowserAuth cookie, SPA static server, `dsh.client.platform: "web"` as an Electron proof.

Adapter required: YES (`HarnessClientBootAdapter`).

P0.S required: P0.S-2 (boot, `ownsHost` / not-memory settings), P0.S-6 (packaged modules, Cordis omit).

## H. Session / Agent Boundary

`SESSION_AGENT_DEPENDENCY_BOUNDARY`

Allowed:

- Session Remote + `./types` + `./client` journal/control.
- Host composition of session-controller, `dsh-session`, `dsh-agent`, `dsh-agent-loop`.
- Host-owned `agents.resume` after `sessionQuery.observeSession`.

Forbidden:

- Desktop `session/resume|open|lookup|delete` (not present; must not be added).
- Desktop `ctx.agents.resume` / second resume logic.
- Direct JSONL mutation or forged `SessionEvent`.
- Treating `session/control` as durable across Worker restart.
- Cancel by killing the carrier.

Resume authority: Host only. Concurrent cold resumes share one in-flight Promise.

Persistence authority: Harness JSONL coordinator.

`DESKTOP_FORBIDDEN_SESSION_OPERATIONS`:

1. Add/call resume/open/lookup/delete Remotes.
2. Call `agents.resume` from Desktop.
3. Own a second session store/journal as truth.
4. Treat control/queue as durable across Worker restart.
5. Cancel by dropping the carrier.
6. Resume a subagent child via ordinary `session.*`.
7. Expect `session/cancel` success on a non-attached session.
8. Write session files or forge events.
9. Settle approval/questions without `$events/result` + `eventId`.
10. Change permission by writing sandbox files.

## I. Persistence / Storage Boundary

`PERSISTENCE_DEPENDENCY_BOUNDARY`

Default persistence: JSONL + zstd at `$DSH_HOME/sessions/<projectKey>/<sessionId>/session.jsonl.zstd`. `SESSION_FORMAT_VERSION = 0`, no migration.

Direct write allowed: **NO** for any Shaco process except the Worker Host-internal writers.

Opaque backup allowed: YES — whole `$DSH_HOME` byte copy/restore only.

Upgrade-sensitive: format v0, 51 known event types, zstd/packed chunks, credentials `DOCUMENT_VERSION=1`, workspace domain v2, projcache v4.

`HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES`

Exceptions:

1. Opaque whole-home backup/restore.
2. Create empty `DSH_HOME` directory and set the env; Host initializes files.
3. OS ACL / directory existence on the home root.
4. Shaco Control Store may store references only.
5. Host-internal writers inside Worker.

Query sqlite uses Node `node:sqlite` (`SESSION_QUERY_SQLITE_SCHEMA_VERSION = 8`) and is mounted `openAt: never` in base. It is not V1 session truth.

## J. Settings / Credentials / Workspace Boundary

Allowed runtime access: Settings / Credentials / Workspace / DirectoryPicker Remotes and `./client` adapters.

Forbidden direct file access: `settings.yaml`, `.credentials.yaml`, `.env`, workspace/storage JSON, attachments, `.anonymous-user-id`. Backup/restore may copy them as opaque bytes.

Picker: compose native and/or browse explicitly. Do not ship picker-auto SSH/bind-host inference on Desktop.

Trust dependency: Settings file persistence requires a trusted Desktop capability (`ownsHost` or equivalent). Stock non-loopback Client uses memory/unavailable settings.

## K. Interaction Boundary

`INTERACTION_DEPENDENCY_BOUNDARY`

Approval: Cordis waterfall `approval/request`; first `$events/result` wins; `never` rejects before dispatch.

Questions: `user-questions/request`; live runtime roots only.

Permissions: no `permissions/*` Remote. Change via `/permission`, settings namespace, durable `permission/preset` events. Product table is the **base YAML** three keys (`read-only`, `workspace-write`, `danger-full-access`). Package default omits `read-only`.

Allowed Desktop role: project pending request + one answer.

Forbidden Desktop role: forge pending approval, settle locally, replay answer, mutate internal approval state, answer twice.

## L. Preset / Tools Boundary

`PRESET_DEPENDENCY_BOUNDARY`

Standard preset dependency: load `@deepseek-ai/dsh-agent-presets` with `includeShippedRoot: true`, `default: standard`.

`PRESET_COPY_REQUIRED = NO`

Required tools dependency: mount unmodified shipped `standard` (P0.S-1). Product-required names: `pwsh`, `read`/`write`/`edit`, `grep`/`glob`, `ask_user_question`, continuable `subagent`, `send_message`, `interrupt_agent`, `list_agents`.

Risks: copying YAML drifts; reducing `standard` without a new freeze; `modelSelectionSettings: true` without the settings plugin throws; host-plane fork is one-shot while standard remounts fork continuable.

## M. Subagent Boundary

`SUBAGENT_DEPENDENCY_BOUNDARY`

Core in-process: `dsh-subagent` + `dsh-subagent-spawn-in-process` + control tools. `DOCUMENTED_PRODUCT_SEAM`.

Fork: `DOCUMENTED_PRODUCT_SEAM`, V1 OPTIONAL. Follow standard **continuable** remount, not host one-shot.

External providers: Codex/Claude/ACP/SDK = `DOCUMENTED_EXTENSION_SEAM`, V1 DEFERRED. Not required for core spawn.

`list_subagent_models`: **CONDITIONAL / OPTIONAL**. Requires host model-selection plugin, settings `enabled` (default false), session policy, and provider `agentOptions`. Do not treat as always-required.

In-process driver: peer of spawn/fork; do not import from Desktop product code.

## N. Plugin / Cordis Boundary

`PLUGIN_DEPENDENCY_BOUNDARY`

In-box: profile bundles + shipped preset + P0-5 L.1/L.2 reviewed graph.

Host/client runner + ui-cordis: official extension rows on current Web host. Product Dynamic Cordis is deferred. Omit-safety is **P0.S-6 only**.

`tool-cordis`: cordis preset only; DEFERRED.

Third-party npm/GitHub: documented extension install (`dsh plugin` → pnpm). V1: arbitrary install `NOT_PRODUCT`; packaged Worker must not require pnpm.

Risks: confusing `pluginInventory/list` with a marketplace; GitHub `prepare` unsandboxed if install is ever exposed; treating runners as a user feature.

## O. Windows / Native Boundary

`WINDOWS_NATIVE_DEPENDENCY_MAP`

| Seam | Class | Documented vs helper | ABI / Node / addon |
|---|---|---|---|
| `dsh-tool-pwsh` | DOCUMENTED_PRODUCT_SEAM | Model tool over `ctx.shell` | Platform gate `win32`; does not bundle pwsh |
| `dsh-pwsh-local` | DOCUMENTED_EXTENSION_SEAM | `resolvePwshPath` on `.` | Host `pwsh.exe` / Windows PowerShell 5.1 fallback; **not packaged** |
| `dsh-pwsh-sandbox` | DOCUMENTED_PRODUCT_SEAM | Sandbox-consuming executor | Uses `ctx.sandbox`; helpers.ts is INTERNAL |
| `dsh-sandbox-local` | DOCUMENTED_EXTENSION_SEAM | `PLATFORM_CHAINS.win32 = ['windows-acl']` | No Landlock on Windows |
| `dsh-sandbox-windows-acl` | PREVIEW_PUBLIC_API | Documented backend + Direct API | `koffi` → `kernel32`/`advapi32`; `enforcement: partial`; spawn `[process.execPath, lib/runner.js]` |
| `./runner` | DOCUMENTED_PRODUCT_SEAM | published runner entry | Must unpack `lib/runner.js`. Missing file falls through to tsx/`src/runner.ts` = **FORBIDDEN** |
| `dsh-win32-process` | SUPPORT_API | Maintainer ABI library, not a Cordis service | Koffi table; x64-only header probe; `PeekNamedPipe` is stdout drain, not IPC |
| Directory picker abstract | DOCUMENTED_EXTENSION_SEAM | `ctx.directoryPicker` + `./types` | none |
| Native picker | PREVIEW_PUBLIC_API | `IFileOpenDialog` child | `koffi`; exported `./worker` → `lib/worker.cjs`; tsx worker fallback FORBIDDEN |
| Picker-auto | INTERNAL for Desktop | Web bind/SSH/display; native iff `webServer.host === '127.0.0.1'` | Do not inherit; pin native/browse or Desktop dialog |
| `dsh-native-command` | SUPPORT_API | `execFile` / path opener | OPTIONAL reveal/open |
| `dsh-subprocess-local` | DOCUMENTED_EXTENSION_SEAM | local subprocess | **static `import * as nodePty`**; windows-inspector INTERNAL |
| `node-pty@1.2.0-beta.15` | SUPPORT_API native payload | patched; ConPTY on Windows | N-API `.node`; asar.unpacked helper; loaded even without PTY tools |
| `dsh-fs-local` / JSONL win32 | plugin EXTENSION; `win32.ts` INTERNAL | `ReplaceFileW` / `MoveFileExW` | lazy `import('koffi')` |
| `@vscode/ripgrep` | PREVIEW_PUBLIC_API | Packaged rg binary | Native sidecar |
| Query sqlite | SUPPORT_API (default never-open) | `node:sqlite` | Node 22.19+/24 builtin; Electron may omit; no better-sqlite3 |
| `node-addon-require-builtin` | INTERNAL | Cordis loader Node internals | Node-major 22 vs 24; Electron internals differ |
| Linux landlock / bwrap | FORBIDDEN as Windows dep | `os: linux` optional bins | Must not fail Windows packaging |
| Bundled Node sidecar | product packaging | Python SDK single-exe is analogue only | `engines.node`; x64 only; Electron ABI ≠ Node ABI |

P0.S-7 proofs still required: packaged Node sidecar (recommended) or Electron-rebuilt addons; unpacked `lib/runner.js`, `lib/worker.cjs`, koffi/node-pty `.node`, ripgrep; host PowerShell present; writable `DSH_HOME`; no system pnpm; no tsx/SRC fallback. Python `deepseek-harness-sdk-runtime-win-x64.exe` proves no-system-Node for CLI/SDK only.

No REQUIRED Feature’s **product contract** exists only as an unexported type. Adapter-interesting internals (`pwsh-sandbox/helpers`, picker COM types, `win32.ts`) are INTERNAL; compose `.` / `./runner` / `./worker` / Remotes instead. `./src/*` remains forbidden even when listed.

P0-5 L.2 implementation roster gaps (not a scope change): `dsh-pwsh-local`, `dsh-win32-process`, `dsh-native-command`, `dsh-host-directory-picker`, `dsh-fs-local`, `dsh-home-paths`, `koffi`, `node-pty`. L.2 must **not** treat `dsh-session-query-sqlite` as V1.0 REQUIRED (SES-10 OPTIONAL; `openAt: never`; JSONL remains default persistence). AUDIT-004 F-03.

## P. Required Feature Traceability

`REQUIRED_FEATURE_DEPENDENCY_TRACEABILITY`

Worst-case below is the least stable **Harness** class on the critical path. Product-owned Supervisor/Control Store rows are not Harness seams.

| Feature | PrimaryHarnessSeam | WorstClass | Adapter | P0S |
|---|---|---|---|---|
| ARCH-01 | Client boot graph + required `./client` roster | PREVIEW_PUBLIC_API | YES boot | 2, 6 |
| ARCH-02 | `dsh --profile` + `dsh-base` + Shaco bundle | DOCUMENTED_EXTENSION_SEAM | YES launcher | 1, 5, 7 |
| ARCH-03 | Connection/Gateway preview + generated remotes | PREVIEW_PUBLIC_API | YES carrier | 3, 4 |
| ARCH-04 | `createSharedFetchHandler` / exact Fetch | PREVIEW_PUBLIC_API | YES carrier | 4 |
| ARCH-05 | packaged `dsh` + native closure | PREVIEW_PUBLIC_API (koffi/rg/Node) | YES launcher/pack | 7 |
| ARCH-06 | product handshake over pinned identities | PREVIEW + product | YES version | P0.5 |
| ARCH-07 | none (Shaco SQLite) | N/A | NO | NO |
| MOD-01..06 | LLM remotes + DeepSeek packages + credentials/settings | DOCUMENTED_PRODUCT_SEAM / PREVIEW controllers | NO / settings capability | 2 for settings |
| WS-01..03 | workspace `./remote` + `./client` | DOCUMENTED_PRODUCT_SEAM | NO | 3 stream |
| WS-04 | picker Remote + native/browse | PREVIEW_PUBLIC_API | YES picker | 4 |
| SES-01..07 | session Remote/client + JSONL + Host resume | PREVIEW_PUBLIC_API | YES session client | 1, 4 |
| CONV-01..05 | session prompt/follow + UI modules | PREVIEW + product remotes | YES boot/carrier | 2, 3, 6 |
| TOOL-01 | tool-pwsh + pwsh-sandbox + windows-acl | PREVIEW_PUBLIC_API | NO | 1, 7 |
| TOOL-03..07 | tool-fs / tool-fs-search | DOCUMENTED_PRODUCT_SEAM | NO | 1, 7 (rg) |
| TOOL-10 | ask-user + `$events` | PREVIEW_PUBLIC_API | YES events | 4 |
| PERM-01..04 | permission-presets + **base YAML table** | PREVIEW_PUBLIC_API | NO | 1 |
| PERM-05/06 | approval + `$events/result` | PREVIEW_PUBLIC_API | YES events | 4 |
| SET-01..03 | settings Remote + settings-file + capability | PREVIEW_PUBLIC_API | YES capability | 2 |
| CRED-01..03 | credentials Remote + credentials-local | DOCUMENTED_PRODUCT_SEAM / PREVIEW provider | NO | NO |
| PRE-01 | shipped `standard` load | DOCUMENTED_PRODUCT_SEAM | NO | 1 |
| SUB-01/02 | in-process spawn + control remotes | DOCUMENTED_PRODUCT_SEAM | NO | 1, 4 |
| LIFE-01..07 | Supervisor + Connection generation + Host resume | PREVIEW_PUBLIC_API | YES carrier/launcher | 3, 4, 5 |
| PLG-01 | in-box profile/preset/client roster | DOCUMENTED_EXTENSION_SEAM | YES boot pack | 1, 6 |

No REQUIRED Feature’s only path is `INTERNAL` or `FORBIDDEN`. Highest residual risks are PREVIEW carrier/boot/settings-capability and possible `webServer` inject.

## Q. Public Export Map

All versions `0.1.2-alpha.1`. `main`/`types` are `lib/index.js` + `lib/types/index.d.ts` unless noted. `./src/*` on nearly every package is **FORBIDDEN** for product.

| Package | ExportPath | What | Upstream product? | Shaco use | Class |
|---|---|---|---|---|---|
| `@deepseek-ai/dsh` | `bin.dsh` | CLI | YES | spawn | DOCUMENTED_PRODUCT_SEAM |
| `dsh-base` | `./cordis.patch.yml` | base layer | YES | Host layer | DOCUMENTED_EXTENSION_SEAM |
| `dsh-web-app` | `./cordis.patch.yml` | web Host | YES Web | do not reuse as Host | DOCUMENTED_PRODUCT_SEAM |
| `dsh-app-boot` | `.` | `boot`/`loadProfile` | CLI only | tests/tooling | SUPPORT_API; Worker main FORBIDDEN |
| `dsh-client-connection` | `.` / `./client` | Host/Client RPC | YES | Adapter | PREVIEW_PUBLIC_API |
| `dsh-api-gateway` | `.` / `./client` / `./types` | Gateway | YES | Adapter | PREVIEW_PUBLIC_API |
| `dsh-api-remotes` | `.` / `./client` / `./types` | Remote assembly | YES | Client | DOCUMENTED_PRODUCT_SEAM |
| session/settings/workspace/llm/commands/subagent/presets/… | `./remote` `./typert` | generated contracts | YES | pin | DOCUMENTED_PRODUCT_SEAM |
| `dsh-typert-protocol` | `.` | `@Remote` | YES | authoring | DOCUMENTED_EXTENSION_SEAM |
| `dsh-typert-generator` | `.` | emit | build | DEV | SUPPORT_API |
| `dsh-client-modules` | `.` / `./client` | graph + serving | YES Web | Adapter | PREVIEW + WEB |
| `dsh-client-web` | `.` | `AppWebEntry` | YES Web | Adapter | PREVIEW on Desktop |
| `dsh-client-ui-*` required | `./client` | UI plugins | YES | pack | DOCUMENTED_PRODUCT_SEAM |
| `dsh-session` | `.` / `./types` | store/events | YES | Host | PREVIEW_PUBLIC_API |
| `dsh-session-persistence` | `.` | abstract | YES | compose | DOCUMENTED_EXTENSION_SEAM |
| `dsh-session-persistence-jsonl` | `.` | default backend | YES | compose | PREVIEW_PUBLIC_API |
| `dsh-home-paths` | `.` | `DSH_HOME` helpers | YES | prefer env | compose helpers PREVIEW; env is product |
| `dsh-agent-presets` | `.` / `./remote` + `presets/` | standard | YES | load | DOCUMENTED_PRODUCT_SEAM |
| `dsh-tool-*` required | `.` | tools | YES | compose | DOCUMENTED_PRODUCT_SEAM |
| `dsh-subagent` | `.` / `./remote` | registry | YES | compose | DOCUMENTED_PRODUCT_SEAM |
| `dsh-sandbox-windows-acl` | `.` / `./runner` | ACL sandbox | YES win32 | compose | PREVIEW_PUBLIC_API |
| `dsh-host-directory-picker` | `.` / `./types` | abstract | YES | compose | DOCUMENTED_EXTENSION_SEAM |
| `dsh-host-directory-picker-native` | `.` / `./worker` | native dialog | YES | compose or replace | PREVIEW_PUBLIC_API |
| `dsh-experimental-*` | any | experiments | NO prod | none | FORBIDDEN |
| `dsh-test-support-*` | any | tests | NO | tests only | FORBIDDEN |

## R. Direct Dependency Policy

`SHACO_DIRECT_DEPENDENCY_POLICY`

ALLOWED_DIRECT:

- Spawn `dsh --profile <shaco-host>`
- `dsh-base` + Shaco bundle YAML naming public packages
- Generated `./remote` / `./typert`
- Documented `./types` / required UI `./client`
- Shipped `standard` via package `presets/`
- P0-5 L.2 Host packages **by composition**, not deep import

ADAPTER_REQUIRED:

- Connection carrier (`rpc.call`/`open`, Fetch, `wireStream`, `__DSH_TRANSPORT__`)
- Client boot/module graph
- Settings capability / not-memory
- Directory picker Desktop binding
- Host process launch / `DSH_HOME`
- Version/compatibility identity

DEV_ONLY:

- dump-config / `renderConfigDump`
- `./invariant`
- typert generator
- test-support
- `tsx` source launch
- picker-auto probes

FORBIDDEN:

- `packages/**/src` and `@deepseek-ai/dsh-*/src/*`
- test-support / experimental in production
- `boot()` as Worker main
- production tsx/SRC
- dump-config as runtime API
- private field reflection
- direct Session/credentials/settings file mutation
- duplicated Agent loop / resume RPC
- claiming Named Pipe is a Harness extension seam
- `dsh plugin` / pnpm as packaged runtime
- wholesale `dsh-web-app` as Shaco Host

## S. Forbidden Import List

| Pattern | Example | Reason | AllowedAlternative | Severity |
|---|---|---|---|---|
| `@deepseek-ai/dsh-*/src/*` | `@deepseek-ai/dsh-app-boot/src/profile.ts` | source-launch, unpublished contract | package `.` / YAML / `dsh` | HIGH |
| `packages/**/src/**` | `packages/api/gateway/src/index.ts` | cross-package deep import | published exports | HIGH |
| `apps/cli/src/**` | `apps/cli/src/bin.ts` | CLI is a bin | spawn `dsh` | HIGH |
| `@deepseek-ai/dsh-experimental-*` | `dsh-experimental-webworker-runtime` | experimental | preview APIs + Shaco carrier | HIGH |
| `packages/experimental/**` | agent-team, inspector | experimental | omit | HIGH |
| `@deepseek-ai/dsh-test-support-*` | session-snapshot, agent-loop-testkit | test only | omit in product | HIGH |
| `packages/test-support/**` | boot drivers | test only | `dsh` | HIGH |
| `ConnectionController` | connection client internal | documented package-internal | `ConnectionHandle` | HIGH |
| `isLoopbackHostname` | connection internal | package-internal | Desktop capability adapter | HIGH |
| BrowserAuth / `http-bridge` as identity | cookie/token URL | Web-only trust | Shaco current-user trust | HIGH |
| `import { boot } from '@deepseek-ai/dsh-app-boot'` | Worker main | bypasses only supported launcher | spawn `dsh` | HIGH |
| dump-config parse as composition | `--dump-config` YAML | no byte-stability | official profile/bundle | HIGH |
| `dsh-session-persistence-sqlite` silent dep | SCHEMA 19 | not default product | JSONL | MED |
| `dsh-storage-sqlite` silent dep | unused in base | not default | storage-json | MED |
| `dsh-host-directory-picker-auto` as Desktop truth | bind/SSH probe | INTERNAL web inference | native/browse or Desktop dialog | MED |
| SRC/tsx production Host | loader SRC codecs | Client refuses; dev-only | built `lib` | HIGH |
| Named Pipe as Harness extension import | none exists | not a seam | Shaco carrier plugin | HIGH |
| Copy `presets/standard/**` into Shaco | vendored YAML | upgrade drift | load shipped root | HIGH |
| `dsh plugin add github:…` in installer | CLI plugin.ts | pnpm/git; NOT_PRODUCT | pin in-box graph | HIGH |
| `dsh-sandbox-windows-acl/src/runner.ts` or tsx runner | missing `lib/runner.js` fallback | production SRC | published `./runner` unpacked | HIGH |
| `dsh-host-directory-picker-native/src/win32-dialog*` | COM internals | not exported | `.` + `./worker` or Desktop dialog | HIGH |
| `dsh-pwsh-local/resolve` | not an export key | functions live on `.` | `@deepseek-ai/dsh-pwsh-local` | MED |
| `dsh-pwsh-sandbox/helpers` | INTERNAL classification | not a product Remote | `ctx.sandbox` facts | MED |
| `dsh-fs-local/win32` / jsonl `src/win32.ts` | INTERNAL koffi helpers | not exported | compose plugins | MED |
| Landlock / `node-addon-landlock-run` on Windows | Linux-only | not a Windows gate | windows-acl | HIGH |

## T. Upgrade-Sensitive Surfaces

| Surface | WhySensitive | HowShacoContainsRisk | CompatTest | P0.5 | P1 | P7 |
|---|---|---|---|---|---|---|
| Harness SHA / lockfile | Developer Preview | pin + fail-closed | YES | identity | handshake | installer |
| package exports | subpath churn | import only listed exports | YES | export set | adapter | pack |
| profile composition / patch replace | whole-row replace | own bundle; test YAML | YES | profile ids | Host contract | bake profile |
| `standard` file structure | tool rows move | load package, do not copy | YES | preset id | composition | verify tools |
| Remote/Typert descriptors | generated contract | pin both sides | YES | method set | error taxonomy | fail closed |
| `rpc.call`/`open` / generation | preview envelopes | carrier adapter | YES | RPC identity | carrier | pack |
| `$events` / `$events/result` | waterfall frames | event adapter | YES | frame vocab | interaction | reconnect |
| `SESSION_FORMAT_VERSION=0` | no migration | Host refuse; opaque backup | YES | v0 | data plane | backup |
| Known event types (51) | refuse unknown | do not write events | YES | catalog | — | restore |
| credentials `DOCUMENT_VERSION=1` | refuse pre-release | Remote only | YES | v1 | — | backup |
| workspace domain v2 / projcache v4 | domain stamps | Host owned | YES | versions | — | backup |
| loopback / `ownsHost` | settings memory | capability adapter | YES | capability bit | trust | canary |
| Client boot graph | Host-dynamic URLs | boot adapter + static pack | YES | module roster | Client | pack |
| plugin module graph | `/plugins` + rev | P0.S-6 | YES | roster | — | omit HTTP |
| koffi / win32 ABI | Node/OS ABI | pin Node + native tests | YES | Node/ABI | — | sidecar |
| `@vscode/ripgrep` | native binary | package next to Worker | YES | rg path | — | closure |
| `engines.node` | 22.19+/24 | pin runtime | YES | Node | — | sidecar |
| `patchReload` live watchers | HMR/timer | force `startup` | YES | field | Worker lifecycle | pack |

## U. Recommended Adapter Boundaries

Minimal set. Do not invent one adapter per package.

| Boundary | Why | Hidden upstream | Phase |
|---|---|---|---|
| `HarnessHostLauncherAdapter` | official entry is process spawn, not JS `boot()` | `dsh` argv, `DSH_HOME`, profile, signals | P2/P7 |
| `HarnessConnectionCarrierAdapter` | preview RPC/Fetch/stream; Named Pipe is Shaco-owned | HTTP/WS/cookie; `rpc.call`; optional `rpc.open`; `__DSH_TRANSPORT__.openStream`; Host `wireStream` | P3 |
| `HarnessClientBootAdapter` | official inject is Web HTML/`/plugins` | `__DSH_BOOT__`, `__ModuleLoader__`, `loadBundle`, graph | P4 |
| `HarnessVersionIdentityAdapter` | Preview + fail-closed upgrades | SHA, package version, format pins | P3/P0.5/P7 |
| `HarnessSettingsCapabilityAdapter` | stock settings depend on loopback/`ownsHost` | `isLoopback`, memory mirror | P4 |
| `HarnessDirectoryPickerAdapter` | auto backend is web inference | picker-auto; native worker vs Desktop dialog | P4/P5 |

Session projection reuses `dsh-api-session-controller/client` behind the carrier/boot adapters rather than a seventh wrapper.

## V. Core Patch Requirement

`CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`

No `KNOWN_REQUIRED` patch for boot, profile, preset, session, tools, or generated remotes. Do not rewrite this to `NONE` without a complete Spike inventory. Do not rewrite it to `KNOWN_REQUIRED` because Connection/modules hard-inject the Cordis `webServer` **service**.

Possible after P0.S if:

- Official `@deepseek-ai/dsh-client-connection` / `dsh-client-modules` cannot be satisfied except by stock Layer B `dsh-web-app` HTTP, **and** a Shaco Host plugin / non-listening compatibility service cannot construct `HostConnectionService` + intercept/Fetch + boot from published/preview APIs **without modifying Harness Core**.
- Packaged Client cannot satisfy `__ModuleLoader__` / boot graph without Harness HTML inject **and** no documented/preview `loadBundle` path works.
- Worker runs inside Electron without matching N-API for `koffi` / `node-pty` / `node-addon-require-builtin` (Node sidecar avoids this).
- Packaged runtime still hits tsx/`src/runner.ts` or dialog tsx fallbacks because `lib/runner.js` / `worker.cjs` were asar-packed.
- `subprocess-local` static `node-pty` import cannot load in the packaged Worker and cannot be optionalized by composition.

A Layer C stub/adapter/compatibility service that satisfies Layer A without Layer B is **not** a Core Patch. Record `ADAPTER_OR_STUB_USED = YES/NO` separately from `*_CORE_PATCH_REQUIRED`.

If a true core patch is required: record Why, affected seam, why extension is insufficient, upgrade impact, and require Architecture Owner decision. Do not patch in P0.

Windows notes that are **not** core patches: require system PowerShell; pin native/browse instead of picker-auto; omit Landlock; keep JSONL+koffi; drop query sqlite unless SES-10 is accepted; x64 only.

## W. P0.S Dependency Inputs

| Risk | KnownPublicSeam | Unknown | SpikeProof | FailureMeaning | CorePatch? |
|---|---|---|---|---|---|
| Custom Host without stock `dsh-web-app` HTTP | `dsh-base` + bundle YAML + public packages | whether Connection/modules Layer A inject can be satisfied without Layer B | `P0S_HOST_PROFILE_FEASIBLE` (see AUDIT-004 F-01); controllers+standard present | Host is still a web-app fork | possible Connection/modules **only if** Layer C adapter/stub cannot be used |
| Standard without copying YAML | `includeShippedRoot` + `default: standard` | no-web mount still enumerates full standard | `HOST_STANDARD_PRESET_TOOLS_PRESENT` | tools vanish or YAML gets vendored | no if load works |
| Carrier through exported seam | `rpc.call`, optional `rpc.open`, FetchHandler, `wireStream`, `__DSH_TRANSPORT__.openStream` | cross-process no-HTTP streaming contract | unary + streams (open/item/error/end/cancel/concurrency/loss/backpressure) + generation + `$events` | must use loopback HTTP fallback | possible |
| `rpc.call` / stream without stock HTTP adapter | Host service constructable in tests; Gateway `wireStream`; Client `openStream` | shipped Connection `apply()` registers `/api` when Layer A `webServer` is a listening HTTP server | Host plugin without stock HTTP `webServer.register`, or Layer C stub | official plugin is Web-only **product** | possible only if Core must change; stub/adapter is not a patch |
| Client boot without loader hack | `__ModuleLoader__` / `__DSH_BOOT__` / `loadBundle` | custom-scheme inject | `AppWebEntry` starts; settings not memory | Client only works as browser | possible |
| Packaged client modules | `loadBundle` + static modules | full required roster without `/plugins` | `INBOX_CLIENT_MODULES_PASS` | must keep HTTP `/plugins` | possible |
| Dynamic Cordis omission | runners are extension rows | boot-hard or not | omit three rows; required UI still boots | runners become implementation closure | no (keep rows) |
| Windows native modules | koffi, `./runner`, picker `./worker`, jsonl/fs win32 | asar unpack + `process.execPath` | sandbox+picker+jsonl; no tsx fallback | fail-closed tools/picker | possible packaging |
| Bundled Node ABI | `engines.node`, koffi, node-pty, require-builtin, rg | Electron ABI vs Node sidecar | native tests on packaged runtime | cannot ship no-system-Node | possible if Electron-in-process |
| Directory picker | native `./worker` or Desktop dialog | Worker-display vs Main dialog | pick/cancel returns Host path | WS-04 blocked | no if Desktop replaces |
| No-system-Node closure | packaged `dsh` + profile | asar/read-only home heal; SDK exe is analogue only | fresh Windows core loop | ARCH-05 fails | possible launcher heal |
| Host PowerShell | `dsh-pwsh-local` path list | no bundled pwsh | TOOL-01 on machine without PS7/5.1 | shell missing | no (product requires host pwsh) |
| Static node-pty load | subprocess-local import | whether non-PTY Worker can omit it | Worker starts without PTY tools | load fail | possible optionalize |

## X. P0.5 / P1 Inputs

`P05_DEPENDENCY_INPUTS`

Must participate in compatibility identity:

- Harness commit `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- package `0.1.2-alpha.1`
- lockfile SHA `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`
- Node `^22.19.0 \|\| >=24.0.0`
- generated Remote/Typert method set
- `$events` frame vocabulary
- `SESSION_FORMAT_VERSION=0`
- credentials `DOCUMENT_VERSION=1`
- workspace domain v2; projcache v4
- permission base-YAML table keys
- Client required module roster (P0-5 L.1)
- `patchReload: startup` on Worker profile

Incompatible pair: authenticate if needed, then **fail closed, no Harness data write**.

`P1_DEPENDENCY_CONTRACT_INPUTS`

- Adapter boundaries in §U
- Direct dependency policy in §R
- Forbidden import list in §S
- Host ownership: Worker owns session/settings/credentials/workspace/approval; Desktop is projection
- Harness owns `$DSH_HOME`; Control Store is references only
- Upgrade-sensitive surfaces in §T
- Named Pipe is Shaco carrier, not Harness extension
- Worker entry is `dsh --profile`, not `boot()`
- `list_subagent_models` stays CONDITIONAL

## Y. Contradictions

`P0_6_DEPENDENCY_CONTRADICTIONS`

Resolved / none remaining as blockers:

| Id | Check | Result |
|---|---|---|
| A | REQUIRED Feature depends only on FORBIDDEN | **NONE.** Worst Harness class on required paths is PREVIEW + Adapter. |
| B | Architecture called a seam “official extension” but source is internal | Named Pipe is already a **candidate** in architecture/P0.S, not an official Harness extension. AUDIT-001 “embed `dsh-app-boot`” is **outdated vs frozen source**; this matrix forbids Worker `boot()`. That is a fact correction, not an ADR change. |
| C | P0.S plans a missing public seam | P0.S already pre-classifies Named Pipe as `SHACO_CUSTOM_CARRIER_PLUGIN` and uses preview RPC hooks. |
| D | Host must copy web-app internals | **NO** as the allowed path. Allowed path is `dsh-base` + own bundle. If P0.S-1 fails, that is a spike failure / possible patch, not permission to fork `packages/bundle/web-app/src`. |
| E | Standard only usable by copying source | **NO.** `PRESET_COPY_REQUIRED = NO`. |
| F | Client only via Web private loader | Preview hooks exist (`__DSH_TRANSPORT__`, `loadBundle`) but are **unproven** for packaged Desktop. Recorded as P0.S-2/6, not a silent deep-import path. |
| G | Shaco must write Harness internal formats | **NO.** `HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES`. |

`NONE` as an open contradiction set.

## Z. Gate Results

| Gate | Value |
|---|---|
| FROZEN_BASELINE_REVERIFIED | YES |
| UPSTREAM_WORKTREE_CLEAN_BEFORE | YES |
| UPSTREAM_WORKTREE_CLEAN_AFTER | YES |
| DEPENDENCY_STABILITY_MATRIX_COMPLETE | YES |
| BOOT_DEPENDENCY_BOUNDARY_KNOWN | YES |
| CONNECTION_DEPENDENCY_BOUNDARY_KNOWN | YES |
| GATEWAY_REMOTE_TYPERT_BOUNDARY_KNOWN | YES |
| CLIENT_DEPENDENCY_BOUNDARY_KNOWN | YES |
| SESSION_AGENT_DEPENDENCY_BOUNDARY_KNOWN | YES |
| PERSISTENCE_DEPENDENCY_BOUNDARY_KNOWN | YES |
| SETTINGS_CREDENTIALS_WORKSPACE_BOUNDARY_KNOWN | YES |
| INTERACTION_DEPENDENCY_BOUNDARY_KNOWN | YES |
| PRESET_DEPENDENCY_BOUNDARY_KNOWN | YES |
| SUBAGENT_DEPENDENCY_BOUNDARY_KNOWN | YES |
| PLUGIN_DEPENDENCY_BOUNDARY_KNOWN | YES |
| WINDOWS_NATIVE_DEPENDENCY_MAP_WRITTEN | YES |
| REQUIRED_FEATURE_DEPENDENCY_TRACEABILITY_COMPLETE | YES |
| PUBLIC_EXPORT_MAP_WRITTEN | YES |
| DIRECT_DEPENDENCY_POLICY_FROZEN | YES |
| FORBIDDEN_IMPORT_LIST_WRITTEN | YES |
| UPGRADE_SENSITIVE_SURFACES_WRITTEN | YES |
| RECOMMENDED_ADAPTER_BOUNDARIES_WRITTEN | YES |
| CORE_PATCH_REQUIREMENT_CLASSIFIED | YES (`POSSIBLE_REQUIRES_P0S`) |
| P0S_DEPENDENCY_INPUTS_WRITTEN | YES |
| P05_DEPENDENCY_INPUTS_WRITTEN | YES |
| P1_DEPENDENCY_INPUTS_WRITTEN | YES |
| P0_6_DEPENDENCY_CONTRADICTIONS_RESOLVED | YES |
| P0_6_EVIDENCE_WRITTEN | YES |

`SHACO_FORGE_V1_0_P0_6 = PASS`

`SHACO_FORGE_V1_0_P0 = NOT_PASS` (P0-7 not executed)

## Files inspected (representative)

**Boot:** `apps/cli/{package.json,src/{bin,args,profile-boot,dump-config,plugin}.ts,README.md,reference/README.md}`; `packages/boot/app-boot/{package.json,README.md,src/{index,profile}.ts}`; `packages/bundle/{base,web-app}/{package.json,cordis.patch.yml,README.md}`; `vendor/include/src/index.ts`; `scripts/verify-application-entrypoints.ts`; `docs/architecture.md`; `docs/user/develop/basic/publish.md`.

**Connection/Gateway/Client:** `packages/client/connection/{package.json,README.md,src/{index,rpc,rpc-host,client/*}}`; `packages/api/{gateway,remotes}`; typert `{protocol,registry,loader,generator}`; `packages/client/{web,modules,hmr}`; `packages/experimental/webworker-runtime` (evidence only).

**Session/data/interaction:** session-controller, `dsh-session`, agent, agent-loop, persistence/jsonl, session-query-sqlite, settings/credentials/workspace controllers, user-approval, user-questions, permission-presets, directory-picker{,-native,-browse,-auto}, home-paths.

**Preset/tools/plugins:** `dsh-agent-presets` + `presets/standard/*`; tool-pwsh/fs/fs-search/ask-user/subagent*; subagent spawn/fork/external; cordis runners; `apps/cli/src/plugin.ts`.

**Windows/native:** sandbox-windows-acl, win32-process, pwsh-sandbox, directory-picker-native, tool-fs-search (`@vscode/ripgrep`), jsonl `win32.ts` (koffi), session-query-sqlite `node:sqlite`.

**Tests inspected by path (not re-run):** profile/config-dump/built-bin.e2e; connection fetch-routes/client-apply; gateway stream/`$events`; session-cold/resume/cancel/jsonl; approval/questions/permission; shipped-root; win32-dialog; sandbox tests.

**Shaco authority used:** P0-1 through P0-5 evidence; ADRs 0001–0007; integration/system architecture; P0.S contract (Named Pipe pre-class).
