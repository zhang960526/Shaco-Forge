本轮重新核对了当前 master（仍为 `cd5ef814` / `dsh@0.1.2-alpha.1`）。上一轮关于 apiproxy 已删除、Typert/Connection 为现行合同、session 无 down-migration 的事实没有过时。

# A. FINAL VERDICT

**PASS_WITH_REQUIRED_CORRECTIONS**

`ALLOW_DETAILED_DESIGN = YES`

修正后的边界已经可以开始 **P0 → P0.S → P0.5 → P1** 的详细合同设计。  
P1 不得在 P0.S 门未过之前，把 Named Pipe carrier、无 HTTP Host、Client boot 写成“已证明事实”。剩余问题是合同缺口和 spike 未知，不再是上一轮那种基础方向错误。

---

# B. EXECUTIVE SUMMARY

Corrective Architecture **整体成立**。

上一轮把产品做成“自研 Agent 协议 + internal import + 全量 plugin/parity + 可回滚 Harness 数据”。这次改成：

- Worker = 长期 `dsh` Host profile  
- Desktop = Harness Client + native shell  
- 业务合同 = 现行 Connection / Remote / Gateway  
- Shaco 只做 Supervisor / Carrier  
- 两个核心长期进程 + 允许 capability children  
- 有限 parity、有限 plugin、pin + backup + fail-closed  

这与当前 upstream 一致：官方扩展面是 **profile + bundle**；官方 GUI 分层是 **Host + Client + 可替换 carrier**；官方明确 Electron **不复用 webserver**；ACP/SDK 仍不是 GUI 主路径。

仍必须在详细设计里写死、并在 P0.S 证明的点：

1. `shaco-forge-host` **不能**复制 `web` profile（live reload、HTTP、HMR、token cookie）。  
2. 跨进程 Named Pipe **不能**复用 Browser cookie 鉴权。  
3. Connection 不只是 JSON RPC，还包括 **exact Fetch**（导出 ZIP、plugin combo）。  
4. Web 树默认挂了 Dynamic Cordis **runner/UI**，即使 `tool-cordis` 未进 shipped bundle。  
5. 官方 Electron 蓝图是 **同进程 IPC**；两进程 Named Pipe 是 Shaco 产品选择，尚未被 upstream 交付。

Developer Preview 本身不是 FAIL 条件。pin + 有限 scope + carrier 隔离已经把变化风险放到可维护范围。不要等官方稳定版。

---

# C. CURRENT UPSTREAM BASELINE

| Item | Value |
| -- | -- |
| Repository | `https://github.com/deepseek-ai/deepseek-harness` |
| Branch | `master` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc`（2026-08-27，`release/dsh-0.1.2-alpha.1`） |
| Package version | `@deepseek-ai/dsh-root` **0.1.2-alpha.1** |
| Node | `^22.19.0 \|\| >=24.0.0` |
| pnpm | `11.7.0` |
| TypeScript | `^6.0.3`（上一轮已见；本轮 `package.json` 拉取超时，版本未显示变化） |
| Stance | Developer preview；**THERE WILL BE COMPATIBILITY-BREAKING CHANGES** |

**相对上一轮：无 `CHANGED_SINCE_PREVIOUS_AUDIT`。** 同一 SHA。下列事实再次核实成立：

- `packages/host/apiproxy` 仍 **404**。现行合同是 Typert Remote + `dsh-client-connection` + `dsh-api-gateway`。  
- 官方文档仍写：Electron 用 `file://` + IPC fetch，**不**用 `dsh-host-webserver`。仓库仍无 `apps/electron`。  
- 受支持启动面：`dsh --profile`（`web` / `headless` / `sdk` / `sdk-minimal` / `acp`）+ 自定义 profile。  
- Custom profile 默认 `patchReload: live`；`headless/sdk/acp` 为 `startup`。  
- `dsh-web-app` 仍插入 `webserver`、`web-runtime`、`client-hmr`、`connection`（inject `webRuntime`）、`cordis-host-runner`、`cordis-client-runner`、`ui-cordis`。  
- `tool-cordis` **不是** shipped bundle 默认工具行；runner/UI 在 Web 树里。  
- Session 格式仍 fail-closed、无 down-migration。  
- Jobs 仍 process-local；Schedule 仍 session-local reminder；Goal activation 仍不耐久。  
- Subagent 仍包含 ACP / Codex / Claude Code / DSH SDK 子进程 providers。

---

# D. PREVIOUS FINDINGS CLOSURE

| Finding | Status | Evidence | Remaining Risk |
| ------- | ------ | -------- | -------------- |
| F-01 自研完整 Agent 协议 | **CLOSED** | 新原则：复用 Connection/Remote；仅 Supervisor | 若 P3 仍把 HELLO/REQUEST/EVENT 做成业务 RPC，会重新打开 |
| F-02 apiproxy 心智过时 | **CLOSED** | 本轮再确认 apiproxy 404；api-gateway.md 为现行权威 | 详细设计不得引用 2026-07-19 note 当现行 API |
| F-03 internal import composition | **CLOSED** | Worker = `dsh --profile` / 文档化 boot | 见 NF-01：不能抄 web profile |
| F-04 双进程成本 vs 1.1 价值 | **CLOSED** | Owner D1/D2 已决策；技术上可成立 | P0.S 必须证明两进程 carrier；失败则 D1 受压，不是现在翻案 |
| F-05 Full plugin parity | **CLOSED** | 范围已降到 in-box + 可选 pinned npm | 见 J：建议 1.0 发布默认禁止 external |
| F-06 Session rollback | **CLOSED** | pin + backup + restore old binaries；无 down-migration | 向前不兼容仍会造成**该 baseline 上的会话永久不可读**（产品风险，政策已正确） |
| F-07 Parity 过宽 | **PARTIALLY_CLOSED** | Core Baseline 原则正确 | Matrix 仍需 P0 按 web-app 实际组成定稿，不能停在本 prompt 初稿 |
| F-08 永远两进程 | **CLOSED** | 改为两核心长期进程 + capability children | P1 必须写 child 所有权/停止/卸载 |
| F-10 Client/Electron 未验证 | **PARTIALLY_CLOSED** | 已改为 P0.S 必证，不再假设换 fetch 即成 | 仍是 1.0 最大工程未知；未证前禁止 P1 冻死 carrier |
| F-11 Packaging 过晚 | **CLOSED** | P0.S Packaging Feasibility Spike | Spike 失败会推翻 Worker 形态，不推翻 Host/Client 边界 |
| F-12 Security 重心 | **PARTIALLY_CLOSED** | 威胁模型已改到 Worker/tools/plugin/credentials/pipe | Cookie→pipe 身份替换、payload 上限、child 进程尚未写入合同 |
| F-13 Goal/Jobs/Schedule ≠ Automation | **CLOSED** | 1.1 方向正确 | 实现期若把 Goal UI 标成 Automation 会再次混淆 |
| F-14 Exactly-once ledger | **CLOSED** | at-most-once + outcome query | Approval 重连必须走 Host pending/waterfall id，禁止重放 answer |
| F-15 Worker identity/mutex | **PARTIALLY_CLOSED** | 已列入 P3；状态机已补 DRAINING/UPGRADING/STOPPED | **合同仍未冻结**（pipe 名、SID、谁杀 stale Worker）。P1 必须冻，不能拖到写代码时 |
| F-16 custom scheme | **CLOSED** 作为倾向 | 与 Chromium CSP/origin 一致；官方 file:// 只是预定 | P0.S 必须验证 loopback/trust 分类 |

---

# E. NEW FINDINGS

## NF-01
**Severity:** HIGH  
**Area:** Runtime composition  

**Problem:** `dsh --profile shaco-forge-host` 成立，但 **不能** 以 `web` 为模板。Custom profile 默认 `patchReload: live`；web 还绑定 `webserver`、`web-runtime`（开浏览器、打 token URL）、`client-hmr`、`connection.inject: [webRuntime]`。长期 Worker 在 live reload 下会在持有 Agent 时被用户 patch 重组，官方正是因此让 headless/sdk/acp 用 `startup`。  

**Evidence:** architecture.md；app-boot README（custom 默认 live；web live；其余 startup）；`packages/bundle/web-app/cordis.patch.yml`。  

**Failure Scenario:** 安装器用 web 模板初始化 profile → Worker 监听 3080、打 cookie URL、改 yml 热重载把正在跑的 session 拆掉。  

**Required Correction:** 产品自带 bundle `shaco-forge-host`：`dsh-base` + Host/API/Client 所需行；**去掉** webserver/web-runtime/HMR/openBrowser；`patchReload: startup`。安装程序写入 profile，不指望 `dsh` 自动 init 该名字。

## NF-02
**Severity:** HIGH  
**Area:** Connection / Security  

**Problem:** 现行 Host 鉴权是 launch token + **HttpOnly cookie** + Host/Origin。Named Pipe 没有 HTTP cookie。两进程后若仍走 BrowserAuth，要么被迫保留 loopback HTTP，要么所有 Remote 401。  

**Evidence:** connection README Browser authentication；api-gateway：“Replacing the Connection carrier does not require changes to Remote descriptors”，但 **trust fence 仍在 Connection HTTP 半边**。  

**Failure Scenario:** Desktop 连上 Worker，Client 因无 cookie 全 401；或错误地在 pipe 上复用可伪造 token。  

**Required Correction:** P1 冻 **Local Carrier Trust**：Windows SID ACL 是身份主证据；可选 handshake 密钥只在 Desktop Main↔Worker 之间，**不进 Renderer**。废弃 cookie/token URL 作为 1.0 正式面。这仍是 carrier/supervisor，不是第二套 Agent API。

## NF-03
**Severity:** HIGH  
**Area:** Carrier completeness  

**Problem:** “复用 Connection” ≠ 只做 unary JSON RPC。现行面还有：`/api/remote.mux` 流、`$events` generation、**exact Fetch**（session export ZIP、plugin `/plugins` combo）、directory-picker native 子进程。只实现 Named Pipe RPC 会在 P5 卡导出/附件/plugin UI。  

**Evidence:** api-gateway.md Boundaries；web-app 的 `session-log-download`；client-modules `/plugins` 路由。  

**Failure Scenario:** Chat 能跑，Export/插件前端/大图上传失败或把 HTML 当 JS。  

**Required Correction:** P0.S carrier 验收必须覆盖：unary、stream、cancel、reconnect generation、至少一条 exact Fetch 二进制、boot graph 注入。1.0 若 DEFER 第三方 client plugin，仍要定义 **in-box client 模块如何到达 Renderer**（打包进 dist vs Worker 提供 bytes）。

## NF-04
**Severity:** MEDIUM  
**Area:** Dynamic Cordis  

**Problem:** “默认关闭 Dynamic Cordis”若只理解为不挂 `tool-cordis`，**不够**。Web patch 已插入 `cordis-host-runner`、`cordis-client-runner`、`ui-cordis`。`tool-cordis` 本就不是 shipped 默认工具。  

**Evidence:** web-app `cordis.patch.yml` insert 段；tool-cordis README：“no shipped bundle mounts the toolset (the web profile already mounts the host runner and the browser faces)”。  

**Failure Scenario:** 以为已关闭，Host 仍有 `node:vm` runner；或拆掉 `ui-cordis` 后 Client boot 因 `dsh.client` 图缺行失败。  

**Required Correction:** P0 分类三层：model tools / host runner / client UI。1.0 Release：**不挂 tool-cordis**；runner/UI 以 P0.S 是否为 Client boot 硬依赖为准。若非硬依赖，从 `shaco-forge-host` 去掉。Developer Mode 才挂全套。

## NF-05
**Severity:** HIGH  
**Area:** Process topology vs upstream Electron  

**Problem:** 官方 Electron 预定是 Renderer `file://` + IPC 到 **同一进程 Host**。Shaco 是 Desktop 关窗口、Worker 另进程。Named Pipe 是合理产品层，但 **不是已交付的 Harness 载体**。  

**Evidence:** web-server.md Electron 句；`apps/` 仅 `cli`、`web`。  

**Failure Scenario:** P1 把 Named Pipe 写成“官方 seam”，P0.S 才发现 Connection Host 硬依赖 `ctx.webServer`，被迫 patch core 或退回 loopback HTTP。  

**Required Correction:** 文档写明：两进程 + Named Pipe 是 **Shaco carrier plugin**，不是 upstream 现成 profile。P0.S 失败的预先降级（不现在启用）：(1) Worker 内仅 loopback HTTP 且只给本机 Desktop；(2) 1.0 暂把 Host 放进 Electron Main。Owner 已选 D1，降级需再决策。详细设计必须带这条失败分支，不能假装官方已支持。

## NF-06
**Severity:** MEDIUM  
**Area:** Lifecycle  

**Problem:** 状态机已够用，但缺少 **capability child 所有权**：Worker STOPPING/卸载/升级时必须停掉 Codex/Claude/ACP/SDK 子进程；Desktop 崩溃不得留下无父孤儿以外的“Worker 已死、child 仍在”窗口。  

**Evidence:** subagent ACP/SDK 均为独立进程；app-boot 未定义 Shaco 监督模型。  

**Failure Scenario:** 卸载后 Claude 子进程仍持有工作区文件锁；升级时新旧 Worker 各带一棵 child 树。  

**Required Correction:** P1 冻：Worker 是 child 的唯一 owner；STOPPING 先 cancel/drain descendants；uninstall/upgrade 等待 Worker 退出。

## NF-07
**Severity:** MEDIUM  
**Area:** Session / reconnect  

**Problem:** Session Controller 对 `agent`/`session` lookup 会 **自动 resume 冷 session 并去重**。Desktop 重连后再调“resume”会与 Host 语义打架。  

**Evidence:** api-gateway.md lookup policy。  

**Failure Scenario:** 重连双重 resume，或 UI 认为未恢复而 Host 已恢复。  

**Required Correction:** P3/P6A：投影只订阅/拉 history；**不要**在 Desktop 做第二套 resume 权威。Approval：Host waterfall first-answer-wins；pending 保留 event id；**禁止**重放 Desktop 的 allow/reject。

## NF-08
**Severity:** LOW  
**Area:** Worker state  

**Problem:** `FAILED` 不必拆成独立 Runtime enum，但需要 `lastError.kind`（boot / plugin / persistence / crash / incompatible）。`RECOVERING` 不应进 Runtime。缺的是产品级 **`STOPPED` vs `NOT_RUNNING`** 已有；可再加 Desktop 可见的 `safe-mode` 作为 DEGRADED 原因，不必新状态。  

**Evidence:** 无 upstream 对应；产品监督需求。  

**Required Correction:** P1 Error taxonomy：FAILED + 结构化原因即可。

---

# F. RUNTIME BOUNDARY VERDICT

`RUNTIME_BOUNDARY_VERDICT = PASS`

（带 NF-01 组成约束，不是方向错误。）

**Worker Host Profile 是否正确：是。**

上游支持：

1. 长期 Host：**是**。`dsh web` 就是长期 Host；自定义 profile 同样由 `dsh` 启动。  
2. `shaco-forge-host` 组成：`dsh-base` + session/settings/workspace controllers + remotes/gateway + connection **Host 半边** + 所需 client 扫描行；**不要** webserver、web-runtime、HMR、headless-runner。  
3. 去掉 Browser HTTP：**官方 Electron 意图如此**；现行 shipped 组成尚未提供该 profile。靠 Shaco bundle 禁用 web 行，而不是改 agent-loop。  
4. 保留 Host capabilities：**是**，API 层与 webserver 分离（remotes → gateway → connection → webserver）。  
5. 是否必须 patch upstream：**未知，P0.S 决定**。目标 `HARNESS_CORE_PATCH_COUNT = 0`；若 Connection 硬绑 `webServer`，优先写 **Shaco carrier plugin** 暴露 FetchHandler。  
6. 是否必须内部 package：**否**。走 profile/bundle/public `@deepseek-ai/dsh-*`。  
7. `dsh-app-boot`：产品入口仍应是 **`dsh` CLI**；不要新 bin。packaging 可嵌入同一 launcher（Python SDK 已有先例）。  
8. profile/bundle：**这就是**文档化扩展缝。

禁止：Worker `import` 内部 src；禁止用 `headless` 当长期 Worker；禁止 ACP 当 Desktop 主路径。

---

# G. CONNECTION / CARRIER VERDICT

`CUSTOM_AGENT_PROTOCOL_REQUIRED = NO`

Supervisor 仍需要很小的产品控制面（发现、启停、版本、健康、升级状态）。那不是 Agent RPC。

`RECOMMENDED_CONNECTION_TOPOLOGY`

```text
Renderer (Harness Client, sandboxed)
    → Electron preload allowlist / IPC
Electron Main (supervisor + native + carrier adapter only; NOT Agent Loop)
    → Named Pipe (per-user SID ACL)   // Windows 1.0 Worker 面
Worker Host (dsh --profile shaco-forge-host)
    → Connection FetchHandler + Gateway streams
    → optional capability children
```

| Option | Verdict |
| -- | -- |
| A Renderer → Main → Named Pipe → Worker | **推荐**（两进程 + Renderer 不碰 pipe） |
| B Renderer 直连 Worker | **拒绝**（sandbox 形同虚设；ACL/身份难做） |
| C 同进程 Electron IPC（Host 在 Main） | 仅作 P0.S 失败降级，与 D1 冲突，需 Owner 再批 |

`NAMED_PIPE_SUITABILITY = SUITABLE_AS_WORKER_PHYSICAL_CARRIER`

不适合 Renderer。Main↔Renderer 继续 Electron IPC。两进程时 Main↔Worker 用 Named Pipe 正确：Desktop 可退出并重连。不要用 localhost HTTP 当正式面。

Supervisor 建议字段（在上一轮 workerId 等之上）：

- `workerId`（稳定，非 PID）  
- `endpoint`（pipe 名，含 SID + product + carrier major）  
- `pid` 仅诊断，**不作**身份  
- `desktopVersion` / `workerVersion` / `carrierVersion` / `harnessBaselineVersion` / `controlStoreSchemaVersion`  
- `dshHome`  
- `capabilities`（是否提供 exact Fetch、plugin combo、native picker）  
- `health`  
- `upgradeState`  
- `singleInstanceToken` / mutex 名  
- 不需要业务 `sessionId` 在 supervisor hello 里（那是 Connection/Remote 域）

Duplicate 政策：**足够**。Harness：approval first-answer-wins、fail-closed `unavailable`、`$events` 通知不重放、pending waterfall 保留 id、session lookup 自动 resume。Shaco 不要第二套 journal。Desktop 断线 **不要**自动重发 side-effect command。

---

# H. CLIENT / ELECTRON VERDICT

`CLIENT_REUSE_FEASIBLE = NEEDS_SPIKE`

不是 NO。官方按 carrier 替换设计 Client；Web 启动仍绑 HTML 注入、`__DSH_BOOT__`、cookie、loopback、`/plugins`。社区 Electron 已证明同进程 IPC 可跑，并踩过 `file://` hostname 空导致非 loopback。两进程 + custom scheme **尚未被官方证明**。

`RECOMMENDED_RENDERER_LOADING_MODEL`

```text
Release: custom privileged scheme  (app://shaco-forge/)
  - load packaged web dist
  - inject boot graph equivalent to window.__DSH_BOOT__
  - classify this origin as trusted/loopback for Connection Client
  - no nodeIntegration; contextIsolation; sandbox; preload allowlist
  - SPA fallback without serving HTML as JS
Development: may use vite/localhost, never as release default
Do not ship bare file:// as the release model
```

**P0.S 必须验证**

1. custom scheme 下 Client 是否启动（`__DSH_BOOT__`、modules、ui-renderer）  
2. Remote unary + `$events` ready generation（无 cookie）  
3. streaming + tool + approval round-trip  
4. reconnect：关 Desktop / 断 pipe / Worker 仍在  
5. loopback/trust：settings 是否仍是持久而非内存  
6. native directory picker vs browse  
7. exact Fetch（至少 session export 或附件）  
8. in-box client 插件如何加载（无 `/plugins` HTTP）  
9. CSP、外部导航、`openExternal`  
10. packaged Worker：无系统 Node/pnpm；`DSH_HOME`；asar unpack；native modules；Windows pwsh sandbox  
11. 去掉 webserver 后 Connection Host 是否仍暴露 FetchHandler  

Gate：三者都 YES 才能冻 P1 Connection 细节。

---

# I. FEATURE PARITY VERDICT

按当前 `dsh-base` + `dsh-web-app` 组成修正，不是照抄 prompt。

### REQUIRED（1.0 Core Desktop Baseline）

| Feature | Upstream | Note |
| -- | -- | -- |
| DeepSeek provider + API key | llm-deepseek, credentials, settings-models | |
| Session-local model selection | ui-model-selection, agent-default-model | |
| Workspace create/select | workspace, directory-picker | Desktop 用 native |
| Session create / list / history / resume | session-controller, persistence | Desktop 不自建 resume 权威 |
| Conversation streaming | session/event, ui-chat | |
| Tool execution + fs | tools, fs-sandbox | |
| Windows shell | tool-pwsh + sandbox-windows-acl | |
| Permission presets | permission-presets | |
| Approval | user-approval, ui-approval | |
| User questions | user-questions | |
| Settings + credentials | settings-controller, credentials-controller | Authority 在 Harness |
| Core slash commands | commands, ui-commands | 最小能完成会话操作的集合 |
| In-process subagent（preset 标准集） | subagent spawn/fork + ui-subagent | “Core subagent”=这个，不是 Codex |
| Persistence + Worker 重启后恢复会话 | session-persistence | interrupted turn 闭合 |
| Desktop 关闭 / 重连投影 | Connection generation | |

### OPTIONAL（不挡 1.0 gate）

Compaction UI、Plan、Workflow/Ralph、Jobs（须标明 process-local）、Goal（须标明 activation 不耐久）、Skills、Feedback、fork、attachments/images、agent presets 编辑、deliverables、session export、extra providers（pi-ai）、ACP/Codex/Claude/SDK subagent providers、trajectory、message feedback、code-runtime PTC。

### DEFERRED

Dynamic Cordis **tools**；任意第三方 plugin；webhook；hot reload；plugin marketplace；untrusted isolation。

### WEB_ONLY

loopback HTTP、token URL、`DSH_WEB_URL` prompt、LAN trusted-hosts、`client-hmr`、`pnpm run dev:web`、开系统浏览器。

### EXPERIMENTAL / NOT_PRODUCT

Agent Teams、E2B、Inspector、Shaco Automation 表、Council/Reviewer 产品域。

P0 必须把 “Core commands / Core subagent” 展开成 **具体命令名与 preset 工具表**，不能留形容词。

---

# J. PLUGIN VERDICT

`LIMITED_PLUGIN_SCOPE_REALISTIC = YES`

**1.0 发布建议：默认只支持 in-box（`shaco-forge-host` 组成内的官方包）。**

Pinned npm 可留在 P6B 为 **OPTIONAL、默认关、不进 P8 REQUIRED gate**。任意 GitHub plugin / prepare 脚本 / dynamic Cordis：**1.0 不要。**

不承诺 crash isolation —— 正确，且必须写进用户可见文档。需要：启动诊断、失败 plugin id、safe-mode（跳过上次崩溃的非核心行）、避免无限 crash loop（连续 N 次 boot 失败进 safe-mode）。

---

# K. DATA BOUNDARY VERDICT

`CONTROL_STORE_BOUNDARY = PASS`

小修正：除 session reference 外，Worker 行应存 **`dshHome` 路径身份**（Worker 与 Desktop 必须指向同一 Harness home）。不要复制 settings/credentials/profiles/plugins/transcripts。

`AUTOMATION_DATA_FUTURE_SEAM = READY`

1.0 只留 schema 版本进化，不建 Automation 生产表，正确。1.1：`AutomationRun` → adapter → Harness session/subagent。Goal/Jobs/Schedule 保持 upstream 能力。Worker 长期运行是 1.1 基础，不是 Automation DB。

备份/损坏：Control Store 可向前迁移；失败则 restore DB+binary。与 Harness 政策对齐。

---

# L. UPGRADE VERDICT

`HARNESS_UPGRADE_POLICY = SAFE`

pin、开发期兼容性分支、升级前备份、无 down-migration、失败恢复旧二进制+备份、不兼容 fail-closed —— 与 `SESSION_FORMAT_VERSION = 0` 和 “backends reject old formats” 一致。

仍须在 P0.5 写清：

- 升级前 **DRAINING**（无进行中 turn / 无未决 approval，或明确取消）  
- 新 baseline 写入后，旧会话可能 **永久不可打开**；对用户要说清楚  
- Control Store 可 migrate；Harness home 整目录备份，不逐条转换  
- Desktop/Worker/carrier/baseline 任一元不匹配 → `INCOMPATIBLE`，禁止写入  

Shaco Control Store 升级政策（备份 + 前向 migrate + 失败 restore）**正确**。1.0 不需要复杂 down-migration。

---

# M. SECURITY VERDICT

威胁模型重心已正确。补遗：

| 面 | 判断 |
| -- | -- |
| Worker tools/shell/fs | 用户权限 + Windows restricted token；不是容器。P1 接受此基线。 |
| Credentials | `$DSH_HOME/.credentials.yaml`；日志/support bundle redact；文件 ACL 仅当前用户 |
| Plugin | in-box only 则风险可接受；vm runner 尽量不挂 |
| Pipe | SID ACL + 不可猜测 endpoint + Main 独占；Renderer 禁止直连 |
| Renderer | 原则正确；preload 禁止任意 invoke |
| 身份 | **NF-02**：cookie 不能当 pipe 身份 |
| 更新 | 签名 + Worker 二进制身份；否则 pipe squatting/替换 Worker |
| Child processes | 继承凭据环境；SDK 已有 scrub 模式，P1 要规定 Shaco 启动 child 的 env 政策 |
| DoS | 官方 300 MiB body；Desktop carrier 应更严 |
| 多用户 | 每 Windows 用户一 Worker；pipe 名含 SID |
| Logout/shutdown | 刷新 persistence；不保证 Jobs 存活（process-local） |

无新 BLOCKER。HIGH 即 NF-02 与 child 所有权。

---

# N. P0～P8 STRUCTURE REVIEW

| Phase | Action | Note |
| -- | -- | -- |
| P0 | **KEEP** | 补：实际 `dsh --profile web --dump-config` 组成、Connection 鉴权面、exact Fetch 清单、preset 工具表 |
| P0.S | **KEEP** | 本轮最重要。Disposable prototype。Gate 未过不得冻 P1 carrier |
| P0.5 | **KEEP** | 版本四元组 + fail-closed + backup/restore |
| P1 | **KEEP** | 必须含：pipe/mutex 合同、carrier trust、child 所有权、Exit vs Stop vs 关窗口、Error taxonomy |
| P2 | **KEEP** | 名称 Host-only Worker 正确；按 **packaged shape** 启动 |
| P3 | **KEEP** | 监督 + Connection 路由；禁止第二套 Agent RPC |
| P4 | **KEEP** | 依赖 P0.S |
| P5 | **KEEP** | 仅 REQUIRED |
| P6A | **KEEP** | 可与 P3 测试重叠，阶段分开合理 |
| P6B | **KEEP** | 允许 OPTIONAL/DEFERRED 不挡 1.0 |
| P7 | **KEEP** | 生产打包；可行性已在 P0.S |
| P8 | **KEEP** | PLUGIN gate 只对承诺范围 |
| 新 Phase | **不必 ADD** | P0.S 已覆盖危险假设 |

不要把 P0.S 并进 P4。不要把 P6B 当 REQUIRED。不要把 P0.5 并进 P7。

---

# O. CROSS-PHASE GAPS

剩余缺口小于上一轮，仍须在详细设计闭合：

**Chain A**  
`CROSS_PHASE_CONTRACT_GAP`: P1 若在 P0.S 前冻“无 HTTP Named Pipe 已可行”，链会断。**顺序已写对，执行时不得抢跑。**

**Chain B**  
基本闭合。P8 必须测 “新 baseline 打不开旧 session → fail-closed”，不是 rollback 成功。

**Chain C**  
缺：关窗口 vs Exit Shaco vs Stop Worker 三词写入 P1，并在 P8 验收。

**Chain D**  
闭合。Automation 表 1.0 不建。

**Chain E**  
`CROSS_PHASE_CONTRACT_GAP`: P1 尚未把 **pipe 身份替代 cookie** 写成 Security Contract。P3 不能只抄 Host/Origin。

**Chain F**  
方向闭合。缺 NF-06 child 生命周期。

**Chain G（新）**  
P0.S exact Fetch / boot graph → P4 Client → P6B plugin frontend。若 P0.S 决定 1.0 不加载动态 client 模块，P6B 必须 DEFER，P4 改为静态打包 in-box client。

---

# P. FUTURE V1.1

`V1_1_FOUNDATION = READY`

前提保持：Worker 独立于 Desktop；Control Store 可进化；不把 Goal/Jobs/Schedule/Session 冻成 Automation 类型。仍需 P1 一句：AutomationRuntime 在 1.0 为空适配器位，不实现。这不是 BLOCKER。

---

# Q. FUTURE V1.2

`V1_2_FOUNDATION = READY`

`ctx.subagents` + 现有 Codex/Claude/ACP/SDK providers 就是接缝。1.2 做角色/综合/评审政策，不重写 provider。不要再写“系统永远只有两个 OS 进程”。

---

# R. REQUIRED CORRECTIONS

无新 BLOCKER。进入详细设计前（写入 P0/P0.S/P1 合同，不是再改产品方向）：

**HIGH**

1. **NF-01** — 定义真正的 `shaco-forge-host` bundle（startup reload，无 HTTP/HMR/token URL）。  
2. **NF-02** — Local carrier trust 替代 cookie。  
3. **NF-03** — Carrier 验收含 stream + exact Fetch + boot graph。  
4. **NF-05** — 两进程 Named Pipe 标为 Shaco 未证 carrier；P0.S 失败预置降级，不在 P1 假装官方已交付。  
5. **F-15** — P1 冻 workerId、pipe 名、mutex、SID、mismatch、stale 处理（1.0 默认不自动杀旧 Worker，除非用户确认或显式 Stop）。  
6. **F-10** — P0.S 未过，不开始 P2–P4 产品实现（**可以**开始 P0/P0.S/P0.5/P1 合同草案）。

**必要 MEDIUM**

7. **NF-04** — Dynamic Cordis 三层拆分；Release 默认不挂 tools，runner/UI 由 spike 决定。  
8. **NF-06** — child 所有权。  
9. **NF-07** — 禁止 Desktop 第二套 resume/approval replay。  
10. **J** — P8 不把 external plugin 当 REQUIRED；建议默认 in-box only。

Owner 决定 D1–D12 **均非 TECHNICALLY_UNSOUND**。D1 的风险由 P0.S 承担，不是源码否定。

---

# S. ARCHITECTURE OWNER DECISIONS STILL REQUIRED

1. **P0.S 若证明“无 HTTP 的跨进程 Connection 不可行”：坚持两进程（内部 loopback HTTP 仅作 Worker 私有端口，且 Desktop 为唯一客户端），还是 1.0 把 Host 放进 Electron Main？** 现在不要选；spike 后再选。  
2. **1.0 是否在 UI 暴露“停止后台 Worker / 退出 Shaco Forge”两个动作？** 技术上都需要；文案/默认关窗口行为是产品选择。建议：关窗口 ≠ 停 Worker；托盘或设置里显式停止。  
3. **Pinned npm plugin 是否出现在用户设置里，还是仅内部/文档高级选项？** 建议 1.0 不出现在主设置。

其余 D1–D12 已足够，Reviewer 不因偏好推翻。

---

# T. FINAL READINESS

`SHACO_FORGE_V1_0_CORRECTIVE_ARCHITECTURE_READY = YES`

`NEXT_ACTION = BEGIN_SHACO_FORGE_V1_0_DETAILED_CONTRACT_DESIGN`

开始顺序必须是：

1. P0 冻 baseline + 组成 + Matrix  
2. P0.S spike（Client / carrier / packaging）  
3. P0.5 版本与升级合同  
4. P1 系统合同（含本轮 HIGH 修正）  
5. 其后 P2–P8  

P0.S 失败则停在 P1 之前，按 S.1 再决策，而不是在错误 carrier 上实现 Worker。

---

## Q1–Q21

**Q1** 是，已正确。  
**Q2** 成立；profile 必须按 NF-01 定制。  
**Q3** 不需要 ACP/SDK 作 Desktop 主路径。  
**Q4** 是，已取消第二套 Agent 协议。  
**Q5** 足以作为业务合同；物理层与鉴权要适配。  
**Q6** 作为 Worker 物理层合理。  
**Q7** 见 G 节字段列表。  
**Q8** 可接受；必须有显式 Stop/Exit，并处理关机刷新。不是架构级否决。  
**Q9** 足以支持 1.2，若写清 child 所有权。  
**Q10** Control Store 边界正确。  
**Q11** 仍有致命**未知**，不是已证致命**缺陷**。  
**Q12** P0.S 范围足够，若包含 NF-03 与无 cookie 鉴权。  
**Q13** 原则足够；P0 还要展开命令/preset 表。  
**Q14** 比上一轮小；发布默认 in-box 更稳。  
**Q15** 关闭 **tools** 可行且不破坏 Core Parity；runner/UI 要 spike。  
**Q16** Upgrade 政策正确。  
**Q17** 有：新格式写入后旧引擎不可读。政策应 fail-closed + 备份，不是假装可恢复转换。  
**Q18** 阶段顺序闭合，只要不抢跑 P1。  
**Q19** 不必再加 Phase。  
**Q20** 无架构 BLOCKER。HIGH 为 NF-01/02/03/05、F-10、F-15。  
**Q21** **可以**进入 Detailed Contract Design（从 P0/P0.S 起，不是从 P2 编码起）。

本轮未进入 implementation，未改仓库，未生成代码。