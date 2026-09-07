# V1-SLICE-1A Product Bootstrap Implementation Record

Status: CLOSED / OWNER_ACCEPTED / BASELINE_FROZEN
Date: 2026-09-07
Scope: `V1-SLICE-1A-PRODUCT-BOOTSTRAP-REAL-HARNESS-CLIENT-BOOT`

## 1. Result

- `V1_SLICE_1A_IMPLEMENTATION_RESULT = PASS`
- `FIRST_FAILURE_BOUNDARY = NONE`
- `NEXT_RECOMMENDATION = READY_FOR_INDEPENDENT_REVIEW`
- 本节记录实现时点的 Product Bootstrap、独立 Worker/Host boot、真实 pinned Harness Client mount 与 Reduced View 证据；最终 Independent Review 与 Owner Closure 见第 11 节。未进入 1B。

## 2. Baseline and Frozen Inputs

| Item | Verified value |
|---|---|
| Shaco branch | `master` |
| Initial Shaco HEAD | `714dfecb6fa771987c7faa787a02b650d4b68b8f` |
| Initial subject | `docs(ui): freeze long-term shell baseline` |
| Initial worktree | clean |
| Frozen Harness root | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| Frozen Harness commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Frozen Harness release | `dsh-v0.1.2-alpha.1` |
| Frozen Harness package | `@deepseek-ai/dsh@0.1.2-alpha.1` |
| Frozen Harness final worktree | clean |
| UI Spec | 55337 bytes; SHA-256 `08E845C92AD00C3C729C018BD3681C1D50D901136A90A883CBA1808EAFD37950` |
| Visual reference | 1660 x 948; 1467362 bytes; SHA-256 `17874257C520533D65E0ACA1B45001F74C372178371BDE51EBB60AEB90F77BC0` |

所有只读 gate 在第一次 Product Code 修改之前通过。Frozen Harness 未被修改、切换、更新或重新构建。

## 3. Actual Authority and Evidence Reads

实际读取了以下权威文件：

- `docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md`
- `docs/00-governance/SHACO-FORGE-DOCUMENT-RULES.md`
- `docs/00-governance/SHACO-FORGE-CURRENT-STATE.md`
- `docs/01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md`
- `docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md`
- `docs/02-architecture/SHACO-FORGE-SYSTEM-ARCHITECTURE.md`
- `docs/02-architecture/SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md`
- `docs/02-architecture/SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md`
- `docs/02-architecture/SHACO-FORGE-DATA-OWNERSHIP.md`
- `docs/02-architecture/SHACO-FORGE-SECURITY-MODEL.md`
- `docs/02-architecture/SHACO-FORGE-V1.0-TECHNICAL-IMPLEMENTATION-BASELINE.md`
- `docs/02-architecture/decisions/ADR-0001-DESKTOP-WORKER-DUAL-CORE-PROCESSES.md`
- `docs/02-architecture/decisions/ADR-0002-WORKER-AS-HARNESS-HOST.md`
- `docs/02-architecture/decisions/ADR-0004-PIN-HARNESS-BASELINE-AND-FAIL-CLOSED-UPGRADES.md`
- `docs/02-architecture/decisions/ADR-0006-MINIMAL-SHACO-CONTROL-STORE.md`
- `docs/02-architecture/decisions/ADR-0008-TYPESCRIPT-ELECTRON-NODE-PRODUCTION-BASELINE.md`
- `docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md`
- `docs/04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md`
- `docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`
- `docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md`
- `docs/06-testing-acceptance/evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md`
- `docs/04-development-records/P0S-6-FINAL-CLOSURE-DECISION.md`
- `docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md`
- `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/README.md`

为避免猜测 API，还只读检查了 Frozen Harness 的 root/CLI/Web/Client manifests、公开 exports、`AppWebEntry` 组合、built `lib`/`client.js` artifacts、Client README、Web Vite 配置，以及既有 P0.S-6 static-client preparation/probe 实现。

## 4. Production Structure and Responsibilities

### Root

- `.gitignore`：忽略依赖、构建、生成 Client、覆盖率、tsbuildinfo 与本地 runtime evidence。
- `package.json`：精确 toolchain/dependency pins 与 build/typecheck/test/smoke 命令。
- `pnpm-workspace.yaml`：只包含 `apps/*`、`packages/*`，并显式允许 Electron/esbuild 安装脚本。
- `pnpm-lock.yaml`：pnpm 11 lock，锁定 Electron 35.7.5、TypeScript 6.0.3、React/ReactDOM 18.3.1。
- `tsconfig.base.json`：严格 TypeScript 6 共用配置与真实 shared contract 类型路径。

### `packages/contracts`

- `package.json`, `tsconfig.json`：非空 shared contract package。
- `src/index.ts`：bounded NDJSON bootstrap event contract/parser；没有 Product Carrier contract。
- `src/index.test.ts`：合法/非法 bootstrap event 解析测试。

### `apps/worker`

- `package.json`, `tsconfig.json`：独立 Node 22.19.0 TypeScript Worker build。
- `src/config.ts`, `src/config.test.ts`：所有 runtime/Harness/DSH_HOME 路径必须显式注入并 fail closed。
- `src/harness-runtime.ts`：development-only frozen Harness runtime overlay。只复制已构建产物，排除 `src`、tests 与 `.ts`，修复当前冻结检出的失效 workspace reparse links，并让外部依赖继续指向 frozen pnpm store；不修改上游、不换版本。
- `src/profile.ts`：在隔离 DSH_HOME 中写入最小 `startup` profile/bundle，不读取用户 credential。
- `src/harness-readiness.ts`：通过真实 `agentPresets.list/resolve('standard')` 产生 Host readiness。
- `src/index.ts`：精确校验 Worker Node，启动 `dsh --profile`，输出 bounded supervisor events，负责 Host 生命周期清理。

### `apps/desktop`

- `package.json`, `tsconfig.node.json`, `tsconfig.renderer.json`, `vite.config.ts`：Electron/Main/Preload/Renderer build；Vite 仅用于真实 `AppWebEntry` 的 ESM/CSS/font composition，不构成 Slice 3 packaging contract。
- `index.html`, `src/renderer/styles.css`：Light Reduced View Shell、约 1100px 居中 Chat surface。
- `src/renderer/main.ts`, `global.d.ts`, `node-module-stub.ts`：从公开 `@deepseek-ai/dsh-client-web` export mount `AppWebEntry`，收集 DOM/security evidence；没有 fake transport。
- `scripts/frozen-harness-packages.mjs`, `prepare-harness-client.mjs`：只解析 pinned package public exports，按真实 module graph 组合 27 个 frozen built Client artifacts，并生成带 hash 的 manifest。
- `src/main/security.ts`, `security.test.ts`：BrowserWindow security baseline 与测试。
- `src/main/worker-supervisor.ts`, `worker-supervisor.test.ts`：Main 启动独立 Worker、解析 bounded stdio 状态、清理进程；明确不是 final carrier。
- `src/main/main.ts`：注册 `shaco-forge://client/` secure scheme、创建安全 BrowserWindow、提供 503 truthful `/api` 状态、采集 runtime evidence。
- `src/preload/preload.cts`：只暴露 bootstrap state subscribe/getState 与 bounded evidence report；不暴露 Node、文件、shell、raw transport 或 Host control。

### Root scripts

- `scripts/tool-runner.mjs`, `build.mjs`, `typecheck.mjs`：当前精确 Node 直接调用 repo-local pinned tools，避免系统 PATH fallback。
- `scripts/runtime-paths.mjs`：集中解析 build/runtime entry。
- `scripts/smoke-worker.mjs`：真实 Worker/Host boot、PID/argv/readiness/cleanup smoke。
- `scripts/smoke-electron.mjs`：真实 Electron/Client/DOM/security/listener/cleanup smoke 与截图。
- `scripts/verify-static.mjs`：future UI、mock/fake RPC、deep source import、硬编码上游路径与乱码扫描。

没有创建 SQLite：1A 没有真实 Shaco-owned metadata 写入需求。

## 5. Exact Toolchain

| Component | Actual identity/path |
|---|---|
| Build/tool Node | `v22.19.0`, `C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe` |
| Worker Node | 与 build Node 相同；85268464 bytes; SHA-256 `995A3FB3CEFAD590CD3F4B321532A4B9582FB9C6575320ED2E3E894CAAC3E362` |
| Node source | official `node-v22.19.0-win-x64.zip`; archive SHA-256 matched official SHASUMS: `ea3fad0e67a991d8477d8c01344b56e69c676ccb733f065b22436994b1253f86` |
| pnpm | `11.7.0`, task-local Corepack cache `...\corepack\v1\pnpm\11.7.0`; bundled `dist/pnpm.mjs` 12565169 bytes, SHA-256 `D3A7F4BDE2F32C5ACC5F012D1EDC24C24EA247C2F6C8823146F8CD69ED70B22F` |
| TypeScript | repo-local `node_modules/.pnpm/typescript@6.0.3/...`, version `6.0.3` |
| Electron | repo-local `node_modules/.pnpm/electron@35.7.5/.../electron.exe`, `v35.7.5`, win32/x64 |
| React / ReactDOM | desktop workspace resolution `18.3.1 / 18.3.1`; one deduped composition |

机器 PATH 上的 Node 24.18.0 未作为 Worker 或最终 build runtime 使用；未修改全局 Node、pnpm 或 Git 配置。

## 6. Runtime Evidence

最终 Electron smoke：

- launch/result: `PASS`
- Electron/Main: `35.7.5`, PID `30448`
- loading URL: `shaco-forge://client/`
- security: `nodeIntegration=false`, `contextIsolation=true`, `sandbox=true`, `webSecurity=true`, `allowRunningInsecureContent=false`
- Worker: PID `20900`, parent PID `30448`, Node `v22.19.0`
- Harness Host: PID `8080`; package/release/commit 均为 frozen identity
- Host argv: exact Node + overlay built `@deepseek-ai/dsh/lib/bin.js --profile shaco-forge-electron-smoke`
- Host readiness: `gatewayPresetCount=4`, `standardPresetPresent=true`
- isolated DSH_HOME: `C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-1a-electron-UKSrJD`；smoke 结束后删除
- TCP listeners owned by observed Product processes: `0`
- cleanup: Worker exited `true`;最终进程检查无 Main/Worker/Host 残留

真实 Client：

- `REAL_PINNED_HARNESS_CLIENT_MOUNTED = YES`
- package/export: `@deepseek-ai/dsh-client-web@0.1.2-alpha.1` / `AppWebEntry`
- React resolution: `18.3.1`
- mount root: `#harness-client-root`
- `entry.run()` resolved: `true`
- rendered root child count: `1`
- rendered identity sample: `DSH 本地构建 / 新会话 / 工作区 / 暂无会话 / 设置 / 探索未至之境 / 选择工作区`
- generated public Client graph: 23 required + 4 support = 27 built `client.js` exports
- generated application artifact: 2572520 bytes; SHA-256 `2dcd2190bd7a06e3c1b506e022258903127c630cea7eafdc098b9b45aeea0ea6`
- fixture/mock/fake RPC present: `NO`
- actual connection state: `HOST_READY__PHYSICAL_CARRIER_NOT_CONNECTED`

Reduced View：

- `NEW_CHAT_VISIBLE = YES`
- `PROJECT_DIRECTORY_VISIBLE = YES`
- `SETTINGS_VISIBLE = YES`
- `AUTOMATION_ABSENT = YES`
- `AGENT_COLLABORATION_ABSENT = YES`
- `KNOWLEDGE_BASE_ABSENT = YES`
- `CENTERED_CHAT_LAYOUT = YES`
- `NO_PERMANENT_INSPECTOR = YES`
- `TRUTHFUL_CONNECTION_STATE = YES`

本机运行时原始证据：

- `docs/04-development-records/evidence/V1-SLICE-1A/runtime/electron-runtime.json`
- `docs/04-development-records/evidence/V1-SLICE-1A/runtime/electron-runtime.png`

runtime 目录被 `.gitignore` 排除；上面的关键身份与 hash 已固化在本记录中。

## 7. Final Test Ledger

| Command | Exit | Result | Key output |
|---|---:|---|---|
| exact Node + exact pnpm `install` | 0 | PASS | lock restore completed; Electron/esbuild allowed builds succeeded |
| `node.exe scripts/typecheck.mjs` | 0 | PASS | contracts, Worker, Desktop Main/Preload, Renderer all passed |
| `node.exe scripts/build.mjs` with explicit `SHACO_FORGE_HARNESS_ROOT` | 0 | PASS | real graph `PREPARED`, 343 Vite modules transformed, renderer built |
| `node.exe --test packages/contracts/dist/index.test.js apps/worker/dist/config.test.js apps/desktop/dist/main/security.test.js apps/desktop/dist/main/worker-supervisor.test.js` | 0 | PASS | 7 tests, 7 pass, 0 fail |
| `node.exe scripts/smoke-worker.mjs` | 0 | PASS | separate Worker/Host; real `host-ready`; standard preset; cleanup true |
| `node.exe scripts/smoke-electron.mjs` | 0 | PASS | Electron, real Client DOM, Reduced View, listener=0, cleanup=true |
| `node.exe scripts/verify-static.mjs` | 0 | PASS | 36 Product/config/script files scanned |
| `git diff --check` | 0 | PASS | no whitespace errors |

All `node.exe` rows used the exact Node 22.19.0 executable recorded in section 5.

### Resolved failure attempts (not claimed as PASS)

- Dependency resolution attempt with all internal Harness packages declared from npm: exit 1 because `@deepseek-ai/dsh-api-session-controller@0.1.2-alpha.1` is not published. Resolution: no version substitution; consume the frozen built public exports.
- Early root `pnpm typecheck`: exit 1 because nested package-manager/tool commands depended on unavailable global shims. Resolution: exact current Node now invokes repo-local tool entrypoints.
- Early direct typechecks: exit 2 for TypeScript 6 `baseUrl` deprecation, referenced contract declaration prerequisite, CSS declaration and DOM nullability. Resolution: explicit TS6 config/prerequisite and typed required DOM helper.
- Early Client preparation/builds: exit 1 at frozen `@deepseek-ai/cosmokit`, then Vite `picomatch`, `micromark-util-combine-extensions`, and `zustand/vanilla` resolution. Resolution: development-only built-artifact overlay; no Frozen Harness write, source import, or dependency version change.
- Early Worker smokes: exit 1 for broken frozen workspace/external reparse resolution (`readdirp`, `typebox`, native packages, `@standard-schema/spec`), then cleanup assertion reported signal exits as false. Resolution: built-only overlay with frozen pnpm-store links plus correct `exitCode || signalCode` cleanup semantics.
- First Electron smoke command exited 0 and mounted Client, but its evidence reported `cleanup.exited=false`; it was not accepted as the final cleanup gate. Resolution: await signal termination and make cleanup part of the PASS predicate; final smoke passed.
- First static scan: exit 1 because the scanner matched its own literal mojibake pattern. Resolution: escaped marker list; final scan passed.

## 8. Boundaries and Deferred Work

- Bootstrap stdio is `BOOTSTRAP_SUPERVISOR_CHANNEL`, not `FINAL_PRODUCT_CARRIER`.
- `/api` truthfully returns `503 PHYSICAL_CARRIER_NOT_CONNECTED`; no fake RPC success exists.
- The runtime overlay is a development-only seam for this frozen checkout's broken workspace links. It is not Slice 3 packaging, does not hardcode the external root as a fallback, and only operates after explicit `SHACO_FORGE_HARNESS_ROOT` injection.
- The unmodified pinned Client loader requires CSP `unsafe-eval`; this is retained as the known P0.S-6 composition constraint rather than patching upstream source.
- 1B: authenticated physical carrier, gateway transport, real Workspace/Session lifecycle, prompt/stream/tool/approval/question/cancel flow.
- 1C: real user-loop completion behavior assigned by the Development Map after 1B.
- 1D: lifecycle/reconnect/crash-policy work assigned by the Development Map.
- 1E: remaining Slice 1 bounded closure/acceptance work assigned by the Development Map.
- Slice 2: deeper Product workflow/UI capability integration; no Automation, Agent Collaboration or Knowledge Base was started.
- Slice 3: bundled Worker Node, bundled pinned Harness, controlled production DSH_HOME, packaging and installer.
- Control Store schema remains deferred because 1A wrote no Shaco-owned metadata.

## 9. Governance and Git

- `V1_IMPLEMENTATION_STARTED = YES`
- `V1_CURRENT_SLICE = V1-SLICE-1-REAL-HARNESS-USER-LOOP`
- `V1_CURRENT_STEP = V1-SLICE-1A-PRODUCT-BOOTSTRAP-REAL-HARNESS-CLIENT-BOOT`
- `V1_SLICE_1A = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW`
- `V1_CURRENT_NEXT_ACTION = INDEPENDENT_REVIEW_V1_SLICE_1A`
- Commit: `NO`
- Push: `NO`
- Staging: `NO`
- Independent Review executed: `NO`

## 10. Theme Foundation Owner Requirement Corrective

### 10.1 Context and Result

This Owner requirement arrived after the original V1-SLICE-1A execution. The
corrective did not reimplement 1A and did not alter its original Runtime
boundaries.

- `THEME_CORRECTIVE_RESULT = PASS`
- `FIRST_FAILURE_BOUNDARY = NONE`
- `NEXT_RECOMMENDATION = READY_FOR_INDEPENDENT_REVIEW`
- `V1_SLICE_1A_THEME_FOUNDATION_CORRECTIVE = PASS`
- `V1_SLICE_1A = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW`

### 10.2 Corrective Scope and Architecture

- `THEME_ARCHITECTURE = SEMANTIC_DESIGN_TOKENS`
- `THEME_MODE_MODEL = LIGHT | DARK | SYSTEM`
- `THEME_SEMANTIC_TOKENS_PRESENT = YES`
- `LIGHT_THEME_MAPPING_PRESENT = YES`
- `DARK_THEME_MAPPING_PRESENT = YES`
- `ROOT_THEME_CONTROLLER_PRESENT = YES`
- `SYSTEM_THEME_SEAM_PRESENT = YES`
- `INITIAL_THEME_LIGHT = YES`
- `THEME_RUNTIME_SWITCH_CAPABLE = YES`
- `SHACO_COMPONENTS_USE_SEMANTIC_TOKENS = YES`
- `SCATTERED_THEME_COLOR_HARDCODING = NO`
- `VISIBLE_APPEARANCE_SETTINGS_IN_V1_0 = NO`
- `DUPLICATE_HARNESS_APPEARANCE_TRUTH = NO`
- `HARNESS_CLIENT_THEME_UNIFICATION = FUTURE_INTEGRATION_SEAM`

The Shaco-owned Renderer declares semantic surface, text, border, interaction,
state and accent categories in one token layer. Light and Dark provide complete
mappings. One root controller applies the resolved theme to the document root,
defaults to Light, and tracks `prefers-color-scheme` changes only while mode is
System. No Sidebar, Composer, Project Directory or other component owns a local
dark-mode state. No user-visible switcher, Shaco Appearance database, SQLite
table, provider setting copy or component framework was added.

The hardcoded-color verification scans Shaco-owned Renderer UI source. Concrete
Hex/RGB/RGBA values are allowed only in:

- `apps/desktop/src/renderer/theme/tokens.css`
- `apps/desktop/src/renderer/theme/themes.css`

Prepared/copied/bundled frozen Harness assets remain explicitly outside that
Shaco-owned source scope.

### 10.3 Corrective Changed Files

| Path | Corrective purpose |
|---|---|
| `.gitignore` | Ignore isolated generated theme-test output `dist-tests/`. |
| `package.json` | Add theme verification and the compiled theme unit test to the existing commands. |
| `apps/desktop/src/renderer/theme/tokens.css` | Declare the shared semantic custom-property contract. |
| `apps/desktop/src/renderer/theme/themes.css` | Map every semantic token for Light and Dark. |
| `apps/desktop/src/renderer/theme/theme.ts` | Implement the single root controller and System preference seam. |
| `apps/desktop/src/renderer/styles.css` | Replace Shaco-owned Shell color literals with semantic token use. |
| `apps/desktop/src/renderer/main.ts` | Initialize the controller and collect bounded Runtime theme evidence. |
| `apps/desktop/src/main/main.ts` | Enable the controlled smoke query only in evidence mode; remove the BrowserWindow color literal. |
| `apps/desktop/tests/theme.test.ts` | Test Light, Dark, System resolution/change handling and controller cleanup. |
| `apps/desktop/tsconfig.test.json` | Compile theme tests into an isolated output tree. |
| `scripts/build.mjs` | Build the isolated Desktop theme test target. |
| `scripts/typecheck.mjs` | Typecheck the isolated Desktop theme test target. |
| `scripts/verify-theme.mjs` | Verify tokens, mappings, mode/controller seams, hardcoded colors and absent visible Appearance UI. |
| `scripts/smoke-electron.mjs` | Gate initial Light and Light-to-Dark computed-token changes while preserving existing Client/Reduced View checks. |
| `docs/00-governance/SHACO-FORGE-CURRENT-STATE.md` | Record the corrective fact without closing 1A. |
| `docs/04-development-records/DEVELOPMENT-LOG.md` | Record the bounded corrective execution and result. |
| `docs/04-development-records/V1-SLICE-1A-PRODUCT-BOOTSTRAP-IMPLEMENTATION-RECORD.md` | Append this corrective record. |

No `apps/worker/**`, Harness profile/launch/runtime overlay, Client composition,
React resolution, Worker Supervisor, bootstrap contract, physical carrier,
Control Store or frozen Harness source was changed by the corrective.

### 10.4 Runtime Theme Evidence

The controlled Electron smoke starts in Light, applies Dark through the same
root controller without modifying component code, records computed values, then
restores Light:

| Semantic evidence | Light | Dark | Changed |
|---|---|---|---|
| App Surface | `rgb(245, 246, 248)` | `rgb(17, 20, 25)` | YES |
| Sidebar Surface | `rgb(250, 251, 252)` | `rgb(22, 26, 32)` | YES |
| Primary Text | `rgb(37, 40, 45)` | `rgb(237, 241, 246)` | YES |
| Border | `rgb(226, 229, 233)` | `rgb(50, 58, 69)` | YES |
| Selected Row | `rgb(234, 240, 255)` | `rgb(36, 54, 83)` | YES |
| Composer Surface | `rgb(255, 255, 255)` | `rgb(37, 44, 53)` | YES |

- `ROOT_THEME_SWITCH_SMOKE = PASS`
- `REAL_PINNED_HARNESS_CLIENT_MOUNTED_STILL = YES`
- `REDUCED_VIEW_STILL_PASS = YES`

The smoke-only trigger is a bounded query on the already isolated custom-scheme
Renderer in evidence mode. It adds no preload bridge, Node API, unbounded debug
surface or persistent product interface.

### 10.5 Corrective Test Ledger

| Command | Exit | Result | Key output |
|---|---:|---|---|
| exact Node 22.19.0 `scripts/typecheck.mjs` (first corrective attempt) | 2 | FAIL, RESOLVED | TS6307: Renderer theme source was outside the prior Main/Preload test project file list. |
| exact Node 22.19.0 `scripts/typecheck.mjs` (final) | 0 | PASS | Product projects and isolated theme-test target passed. |
| exact Node 22.19.0 `scripts/verify-theme.mjs` | 0 | PASS | 20 required semantic tokens; complete Light/Dark mappings; Light/Dark/System; no hardcoded-color or visible-Appearance violations. |
| exact Node 22.19.0 `scripts/build.mjs` with explicit frozen Harness root | 0 | PASS | real public Client graph `PREPARED`; 27 artifacts; React 18.3.1; 346 Vite modules transformed. |
| exact Node 22.19.0 final unit command (first corrective attempt) | 1 | FAIL, RESOLVED | 7 existing tests passed; theme test output was removed when Vite emptied `dist`. |
| exact Node 22.19.0 final unit command (final) | 0 | PASS | 9 tests, 9 pass, 0 fail, including 2 theme tests. |
| exact Node 22.19.0 `scripts/smoke-electron.mjs` | 0 | PASS | initial Light; all six semantic values changed in Dark; real Client, Reduced View, security, listener and cleanup gates passed. |
| exact Node 22.19.0 `scripts/verify-static.mjs` | 0 | PASS | Final Product/config/script boundary and encoding scan passed. |
| frozen Harness identity/worktree check | 0 | PASS | exact frozen commit/tag/package retained; worktree clean. |
| `git diff --check` | 0 | PASS | no whitespace errors. |

The standalone Worker smoke was not rerun because the corrective changed no
Worker or Host launch code. The final Electron smoke nevertheless launched the
real independent Worker and frozen Harness Host, reproduced readiness, and
passed cleanup. The original standalone Worker smoke remains PASS evidence.

### 10.6 Preserved Boundaries and Governance

- The real pinned `@deepseek-ai/dsh-client-web@0.1.2-alpha.1` `AppWebEntry` and
  React 18.3.1 composition remain unchanged and mounted.
- Harness retains its own Appearance/Settings capability. The Shaco controller
  is Shell visual infrastructure only and does not claim completed Client theme
  unification.
- Reduced View remains New Chat + Chat records + Settings. Automation, Agent
  Collaboration and Knowledge Base remain absent; the approximately 1100px
  centered layout and no-permanent-Inspector policy remain intact.
- Bootstrap stdio remains supervisor-only; physical carrier remains unbuilt and
  `/api` remains truthfully unavailable.
- Slice 1B and Independent Review were not executed.
- Commit: `NO`; Push: `NO`; Staging: `NO`.

## 11. Independent Review and First Owner Closure Attempt

The completed Independent Review is persisted as
[REVIEW-012](../05-reviews/architecture/AUDIT-012-V1-SLICE-1A-INDEPENDENT-REVIEW.md).
The Architecture Owner accepted its `PASS` verdict and all explicitly retained
non-blocking Findings and dispositions. The first Closure attempt later stopped
at the complete-baseline whitespace gate before Commit.

```text
IMPLEMENTATION = PASS
THEME_CORRECTIVE = PASS
INDEPENDENT_REVIEW = PASS
OWNER_CLOSURE = NOT_COMPLETED
FIRST_CLOSURE_RESULT = REVIEW_RANGE_INVALIDATED
FINAL_SLICE_1A_STATE = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_SLICE_1A_BASELINE = PENDING_REVALIDATION
REVIEW_ID = REVIEW-012
REVIEW_DOCUMENT_PATH = docs/05-reviews/architecture/AUDIT-012-V1-SLICE-1A-INDEPENDENT-REVIEW.md
COMMIT_SHA = NOT_CREATED
```

F-01 through F-10 remain open carry-forward, known-constraint,
future-hardening, accepted-testing, historical-context or expected-boundary
records exactly as REVIEW-012 specifies. This closure does not prove Physical
Carrier, full Workspace/Session lifecycle, prompt/stream/tool/result,
approval/question, reconnect, full Worker lifecycle/discovery, packaging,
installer, production bundled Node/Harness, controlled production `DSH_HOME`,
full Shell/Harness theme unification or the complete Settings Surface.

Internal Step 1A is not yet closed. `V1-SLICE-1` remains open and Slice 1B
remains `NOT_STARTED`. Product Code was not modified during Review persistence
or the first Owner Closure attempt. The Independent Reviewer and Frozen Harness
made no repository change. No Closure Commit was created.

## 12. V1-SLICE-1A Final Static Gate Whitespace Corrective

The corrective is limited to terminal blank-line removal in exactly eight
reviewed Product files and removal of the two reported Markdown trailing spaces
from this record. It changes no Product token, test, HTML, indentation, JSON key
order, configuration meaning, line-ending style or final non-empty content line.

| Product path | Before bytes | Before SHA-256 | After bytes | After SHA-256 | Exact transformation |
|---|---:|---|---:|---|---|
| `apps/desktop/index.html` | 2587 | `7DCE1352B238AACFE1E16F6A1707E004AF8F1D4C622C9202D875E8DE149820D0` | 2586 | `99DBBE8602B7B99649296E17D3302A1A96B1BE5CFCFC58F3B3F5E7A0EC1B2C7C` | Remove one terminal blank-line LF; retain one EOF LF. |
| `apps/desktop/src/main/security.test.ts` | 484 | `FAA6B2258B716DC03067375AFC22A3782CCFF038D41AB61C0B32E0BB2AC0EA04` | 483 | `1F4163436926E3DE67BAA2DDA15139DFCEEFC866992F29912675ED2C8D9D80DE` | Remove one terminal blank-line LF; retain one EOF LF. |
| `apps/desktop/src/main/security.ts` | 690 | `8671B49381CEECAA5DA35F89ACDFB2E481092F8274FAE8A41F059D8C781758B5` | 689 | `6BF43E273E9A75C49D74BE1C0828F09505F941E16CB0288ECC30463598D8EC6C` | Remove one terminal blank-line LF; retain one EOF LF. |
| `apps/desktop/src/preload/preload.cts` | 846 | `1F988A81B6A125F4EABBFFC98CA76CD06B18A3FFDBB4A886E75F0FD0A1FECA4B` | 845 | `5547800FE43FD426BDFF86010B093065E7F382D2BDB3D5FF9C73FC9B3A7B8ACA` | Remove one terminal blank-line LF; retain one EOF LF. |
| `apps/desktop/src/renderer/node-module-stub.ts` | 158 | `24CB72E72C7D450686E353D916D1C1C711C50A0F5B30AB51FECB5F2DD9F72CDA` | 157 | `DB7D34FE138BBC53BD94CEE1C95C32B28164101087B8718058BE6B6C6F4687E0` | Remove one terminal blank-line LF; retain one EOF LF. |
| `apps/desktop/tests/theme.test.ts` | 1766 | `81A503CD1349207A5C550AC2D9C2B023EEBB93089C23F6231658874339BEE936` | 1764 | `F0278E2AFADA2DC077B4CF8B8848AA95F4772334003FCB4679ABD88C9F5E9525` | Remove two terminal blank-line LFs; retain one EOF LF. |
| `apps/desktop/tsconfig.renderer.json` | 317 | `29F0251B092F72A8B48FBED1086EA9370A829EDB0291A328FED3CE4EC590326C` | 316 | `C94935CB42ADAEE8E1CB85A607EEF6B3CA80BBF3663F9388F78B0CA70AA43AA0` | Remove one terminal blank-line LF; retain one EOF LF. |
| `packages/contracts/package.json` | 378 | `9F9F7938C57DBC2A617E90C3A9F400C46BAE66C25AC972D43C66C339D7E94FEE` | 377 | `EE68757F05123740A286A5AAF5892E7B347932919447B29DBD0058AE67FA99FC` | Remove one terminal blank-line LF; retain one EOF LF. |

```text
WHITESPACE_CORRECTIVE_SCOPE = EIGHT_PRODUCT_EOF_FILES_PLUS_DOCUMENTATION_WHITESPACE
PRODUCT_SEMANTIC_CHANGE = NO
UNEXPECTED_BYTE_DIFFERENCES = NONE
EOF_ONLY_CORRECTIVE = YES
GIT_DIFF_HEAD_CHECK = PASS
REVIEW_012 = PASS_FOR_PRE_CORRECTIVE_RANGE
CORRECTED_PRODUCT_BYTES = NOT_YET_INDEPENDENTLY_REVIEWED
NEXT = INDEPENDENT_DELTA_REVIEW_OF_WHITESPACE_CORRECTIVE
COMMIT = NO
PUSH = NO
```

## 13. Final Owner Closure After Delta Review

REVIEW-012 continues to cover the original implementation plus Theme Foundation
Corrective. Independent Delta Re-Review
[REVIEW-013](../05-reviews/architecture/AUDIT-013-V1-SLICE-1A-WHITESPACE-DELTA-REVIEW.md)
covers only the eight-file EOF whitespace corrective. Together they cover the
final Product bytes accepted by the Architecture Owner.

```text
IMPLEMENTATION = PASS
THEME_CORRECTIVE = PASS
REVIEW-012 = PASS
FIRST_CLOSURE = REVIEW_RANGE_INVALIDATED
FIRST_CLOSURE_FAILURE_REASON = FINAL_STATIC_GATE_WHITESPACE
WHITESPACE_CORRECTIVE = PASS
DELTA_REVIEW = PASS
DELTA_REVIEW_ID = REVIEW-013
PRODUCT_SEMANTIC_CHANGE = NO
FINAL_OWNER_CLOSURE = ACCEPTED
FINAL_SLICE_1A_STATE = CLOSED
V1_SLICE_1A_BASELINE = FROZEN
COMMIT_SHA = PENDING_COMMIT
```

The first Closure failure remains part of the execution history. F-01 through
F-10 retain their REVIEW-012 dispositions and are not closed by the formatting
corrective or Delta Review. Physical Carrier and all other deferred scope remain
unproven. `V1-SLICE-1` remains `IN_PROGRESS`; Slice 1B remains `NOT_STARTED`.
