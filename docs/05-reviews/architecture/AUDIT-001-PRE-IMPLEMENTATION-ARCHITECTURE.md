上游核对完成。当前 Harness 已不是方案里假设的 `apiproxy` 四象限协议，官方也明确这是会 breaking 的 developer preview。下面按你要求的结构给出独立审计结论。

# A. FINAL VERDICT

**FAIL**

`ALLOW_DETAILED_DESIGN = NO`

Desktop + Worker 双进程、Worker 为 Runtime Authority、Desktop 只做投影，这个产品方向可以保留。  
当前方案不能进入详细设计，因为正式冻结的会是错误协议、错误 runtime 边界、以及无法兑现的 parity / upgrade 承诺。

---

# B. EXECUTIVE SUMMARY

Shaco Forge 1.0 把 DeepSeek Harness 的 **Host + Client** 模型翻译成 **Worker + Desktop**，产品意图是对的。错在把 Harness 当成“可以自己包一层业务协议的库”，而不是当成已经有完整产品面的 Agent Runtime。

当前官方 master（`cd5ef814`，`dsh@0.1.2-alpha.1`，2026-08-27）的事实是：

1. Harness 仍是 **developer preview**，明确承诺 **THERE WILL BE COMPATIBILITY-BREAKING CHANGES**。
2. 官方 Web 产品已经是 **Host 进程 + browser Client**，中间是 **Connection + Typert API Gateway**，不是方案假设的 `dsh-host-apiproxy` 四象限 RPC。`packages/host/apiproxy` 在当前 master **404**。
3. Electron 在官方文档里的预定形态是：**`file://` 加载 dist + IPC fetch bridge，不复用 `dsh-host-webserver`**。官方仓库 **没有** `apps/electron`。社区已经按这条蓝图做过同进程桌面壳。
4. 受支持的 Node 应用入口只有 **`dsh --profile …`**。ACP/SDK 不是 Web UI 的替代面：ACP 是 automation-only；SDK 缺 mid-turn cancel 和完整 approval round-trip。
5. Session 格式 `SESSION_FORMAT_VERSION = 0`，**没有 migration / compatibility promise**。P7 的 Harness 数据 rollback 与上游政策直接冲突。
6. Plugin 是 **同进程 Cordis 代码**；动态插件还能在 Host/Client 两侧 eval。完整第三方 plugin parity 不是 1.0 可安全承诺的范围。
7. 1.2 需要的 Codex / Claude Code / ACP / SDK 子进程，**Harness 已经有 provider**。1.0 若把“永远只有两个长期进程、禁止 ACP child”写成硬约束，会直接挡住 1.2。

必须先改的方向：

- **不要发明 `SHACO_FORGE_WORKER_PROTOCOL_V1` 作为业务协议。**
- Worker 应成为 **长期运行的 `dsh` Host**（Shaco 自有 profile），Desktop 应成为 **Harness Client + native shell**。
- 物理传输只替换 Connection carrier（Windows 可用 Named Pipe / Electron IPC）。
- 1.0 parity 必须收缩；plugin 必须降级；upgrade 只能 pin baseline，不能承诺 Harness 数据回滚。

在这些 correction 被 Architecture Owner 接受并写回边界之前，**禁止进入 P1 详细合同设计**。

---

# C. UPSTREAM FACT CHECK

审计冻结点：仓库 `deepseek-ai/deepseek-harness`，default branch `master`，commit `cd5ef8148158c3a752a658978873241fdf8e2bbc`，root `package.json` `0.1.2-alpha.1`，`packageManager: pnpm@11.7.0`，`engines.node: ^22.19.0 || >=24.0.0`，TypeScript `^6.0.3`。官方文档入口：[README](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/README.md)、[architecture.md](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/architecture.md)。

| ID | Assumption | Verdict | Evidence | Impact |
| -- | ---------- | ------- | -------- | ------ |
| A01 | Harness 有稳定 public product API，可长期当 Product API 用 | **FALSE** | README: developer preview，**THERE WILL BE COMPATIBILITY-BREAKING CHANGES**。AGENTS.md: 首个 tagged release 前可任意 rename/repackage；SQLite 拒旧格式；`SESSION_FORMAT_VERSION` 保持 `0`，无 compatibility promise | 1.0 必须 pin baseline；不能把 host/client 当 semver-stable |
| A02 | `host/client` 是可直接 composition 的稳定 Product API | **CHANGED_UPSTREAM** | 2026-07-19 note 仍写 `dsh-host-apiproxy` + 四象限 RPC；当前 `packages/host/README.md` 不再包含 apiproxy；`packages/host/apiproxy/README.md` **404**；现行面是 `packages/api` Typert Gateway + `dsh-client-connection` | 方案若按 apiproxy 设计 Adapter，P1 会冻错合同 |
| A03 | 新增 Electron 只需换 IPC carrier，不必改协议 | **PARTIALLY_VERIFIED** | 2026-07-19 note 预留 IPC subclass；当前 [web-server.md](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/subsystems/web-server.md): “Electron loads the built files over `file://` and sends fetch requests through an IPC bridge instead of this server”。官方 **无** `apps/electron` | 官方意图是换 carrier，不是换业务协议。社区实现已证明这条路，也证明 `file://` 有 loopback 坑 |
| A04 | ACP/SDK 可承载完整 Web 产品面 | **FALSE** | ACP README: automation-only，不暴露 DSH presentation、plans、commands、elicitation。SDK client: **No mid-turn cancel**；client→server notifications / server→client requests **unimplemented** | Option B 不能做 1.0 feature parity |
| A05 | 可以直接 in-process import Harness core 当 Worker | **PARTIALLY_VERIFIED** | architecture.md Application launch: 受支持 Node app 只能从 `dsh` + named profile 启动；direct in-process plugin mounting **不是** product launcher。`dsh-app-boot` 允许 lower-level embedders/tests | Option A 若走 internal import，升级成本和官方支持面会爆炸 |
| A06 | Harness 没有自己的 Host/Client 协议，需要 Shaco 自研协议 | **FALSE** | [docs/api-gateway.md](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/api-gateway.md)：Remote unary + Connection `/api`；Gateway 拥有 `/api/remote.mux` WebSocket；reconnect 有 generation / `$events` ready 帧 / journal stream | `SHACO_FORGE_WORKER_PROTOCOL_V1` 是重复发明，且会永久分叉 |
| A07 | Harness reconnect 需要 snapshot + event cursor | **CHANGED_UPSTREAM** | 旧 note: reconnect = rebuild，`since` 是 reserved seat。现行 Gateway: `$stream()` 不推断 replay；`RemoteJournalStream` 有 catch-up；`$events` 通知不 replay；pending waterfall 保留 event id | Shaco 不应另做一套 snapshot 权威，应复用 Connection generation + session history |
| A08 | Plugin 可以隔离到不拖垮 Worker | **FALSE** | 插件是同进程 Cordis。SAFETY.md: 未做 security audit；untrusted plugin 可损坏主机。`dsh plugin add` 可执行 git `prepare`。extensions 可动态定义 Host/Client 代码 | 完整 plugin parity 在 1.0 不安全 |
| A09 | Plugin frontend 只是静态 UI 包 | **FALSE** | client-modules: `/plugins/??.../client.js` combo、`window.__DSH_BOOT__`、lazy CJS `ModuleLoader`。动态插件还有 `getClientCode` Remote | Electron 无 HTTP webserver 时，这是 1.0 真实 blocker |
| A10 | Jobs / Schedule / Goal 已是 1.1 Automation 可用的 durable runtime | **FALSE** | jobs-local 是 **process-local**。schedule 是 **session-local reminder**，无 OS/login scheduler。glossary: goal activation **deliberately absent from durable replay** | 1.1 不能建立在这些 Harness 原语上当 Automation domain |
| A11 | Harness 没有 multi-model / 多 Agent 接缝 | **FALSE** | `ctx.subagents` 已有 spawn/fork/ACP/Codex/Claude Code/DSH SDK。experimental Agent Teams 在 `packages/experimental/` | 1.2 应复用 subagent seam，而不是另起 MultiAgentRuntime 绕过它 |
| A12 | `dsh --profile headless` 等于长期 headless Worker | **FALSE** | 2026-08-09 note: headless 是 **one-shot**，stdout 最终文本，无 Host/HTTP/browser | P2 “headless Worker” 不能复用 headless profile |
| A13 | Session 格式可升级/回滚 | **FALSE** | persistence.md: header version 不匹配直接拒绝；**no migration**。AGENTS.md: backends reject old on-disk formats | P7 rollback 对 Harness 数据不现实 |
| A14 | 官方有 Electron 产品可直接复用 | **FALSE** | `apps/` 只有 `cli` 和 `web`。Electron 只是文档预定 | 1.0 必须自己做 shell；应跟官方 carrier 蓝图，而不是跟社区 fork 绑死 |
| A15 | Web Client 已与 HTTP 解耦 | **PARTIALLY_VERIFIED** | Client 通过 `ctx.connection`；in-process 可用 `connection.rpc.open`。但 boot graph、plugin combo、token cookie、Host/Origin、loopback 分类仍绑在 Web 载体上 | “换个 transport 就能跑”不成立，需要 Desktop 适配 spike |
| A16 | packages/README 声称多数 group 是 stable API | **UNCLEAR** / 与 A01 冲突 | packages/README: “Most groups are product — stable API”。根 README/AGENTS.md 否定外部 compatibility | 依赖分类必须以 preview+breaking 为准，不能信 packages/README 的 “stable” |
| A17 | 官方 Web 绑定 loopback，有 token/cookie 鉴权 | **VERIFIED** | web-app: `--host 0.0.0.0` 被拒绝。connection: launch token → 签名 cookie；Host/Origin 检查 | 换成 Named Pipe 后必须替换这套 browser-trust，不能假装已经有身份模型 |
| A18 | Harness 已有非 session 的 SQLite storage | **VERIFIED** | `packages/storage`: json/sqlite + `storageDomain`。session persistence 默认 JSONL，SQLite 可选 | 1.0 Control Store 合理，但不应再复制一份 Harness settings/session |
| A19 | 第三方插件通过 profile/bundle 安装 | **VERIFIED** | `dsh plugin --profile … add` 转发 pnpm；git install 会跑 prepare | Shaco 若绕过 profile 自己管 plugin，会失去官方兼容面 |
| A20 | Windows 有 sandbox | **PARTIALLY_VERIFIED** | `sandbox-windows-acl` + restricted token；shell 在 Windows 是 PowerShell twins。Landlock/bwrap 是 Linux | Windows 1.0 安全基线弱于 POSIX，不能按 Linux 沙箱假设 |

---

# D. TOP ARCHITECTURE RISKS

按严重度：

1. **BLOCKER — 自研 `SHACO_FORGE_WORKER_PROTOCOL_V1`。** 会把 Desktop 从 Harness Client 变成永久分叉，每次 upstream Remote/Connection 变更都要双写。
2. **BLOCKER — 按已删除的 apiproxy 四象限模型做边界。** 现行合同是 Typert Remote + Connection generation。P1 若冻错，P2–P5 全废。
3. **BLOCKER — 把 Option A 理解成 internal import composition。** 官方产品入口是 `dsh --profile`。Worker 应启动/成为 Host profile，而不是 `import` 内部包。
4. **BLOCKER — Full plugin + dynamic Cordis + frontend combo 作为 1.0 承诺。** 同进程、可 eval、无 crash isolation；Electron 还要重做 `/plugins` 加载。
5. **HIGH — 1.0 Feature Parity 过宽。** 会把 experimental、web-only、process-local 能力全部塞进桌面验收。
6. **HIGH — P7 把 Harness session/schema rollback 当成产品能力。** 上游明确不提供。
7. **HIGH — “永远两进程、禁止 ACP child” 与 1.2 冲突。** Codex/Claude Code/ACP 本来就是子进程。
8. **HIGH — Packaging/Node/native addon/Windows 证明放在 P7。** Node 22.19+、pnpm、landlock native、client combo 路由，任一项失败都会推翻 P2–P6。
9. **HIGH — Client 复用被低估。** token cookie、loopback、`__DSH_BOOT__`、lazy CJS、CSP、file:// hostname 空值，都是真实桌面缺陷，不是 polish。
10. **HIGH — 1.1 Automation 被误认为可以长在 Goal/Jobs/Schedule 上。** 这三者都不是 durable unattended automation runtime。

---

# E. FINDINGS

## F-01
**Severity:** BLOCKER  
**Area:** Protocol / Harness Boundary  

**Current Design:** 建立 `SHACO_FORGE_WORKER_PROTOCOL_V1`（HELLO/REQUEST/RESPONSE/EVENT/CANCEL…），Desktop 不直接依赖 Harness wire DTO。  

**Problem:** Harness **已经有** Client↔Host 产品协议：Connection RPC + Typert Remote + mux streams。再做一套业务协议，等于放弃官方 Client 复用，并把 Adapter 变成永久翻译层。  

**Evidence:** [docs/api-gateway.md](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/api-gateway.md)；[connection README](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/client/connection/README.md)；2026-07-19 note 明确“换 carrier 不换合同”。  

**Why It Matters:** 1.0 目标是 Harness feature parity。parity 的真实成本在 Client 接在官方协议上，不在自研 envelope。  

**Failure Scenario:** P3 冻了 Shaco 方法表；P4 发现 `ctx.remote.session` / `$events` / plugin combo 对不上；P5 每个功能都要手写投影。  

**Required Correction:** 业务协议 = Harness Connection/Remote。Shaco 只定义 **transport 适配 + Worker 监督/身份/升级**。`protocolVersion` 只用于 carrier/supervisor，不复制 session/tool/approval API。  

**When:** 详细设计前。

## F-02
**Severity:** BLOCKER  
**Area:** CHANGED_UPSTREAM  

**Current Design:** 方案心智仍接近 host apiproxy / 四象限 RPC / `AbstractApiClient.doFetch`。  

**Problem:** 该包已从 master 消失。现行栈是 `dsh-api-gateway` + `dsh-api-remotes` + session/settings/workspace controllers + Connection。  

**Evidence:** `packages/host/apiproxy/README.md` → 404；[packages/api/README.md](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/api/README.md)；[packages/host/README.md](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/packages/host/README.md) 现为 webserver / frontend-static / directory-picker / plugin-inventory。  

**Why It Matters:** P0 Dependency Matrix 若按旧 note 分类，会把不存在的 API 冻成边界。  

**Failure Scenario:** Adapter 对着 `ctx.apiProxy` 写；实际是 `ctx.typertGateway` / `ctx.remote` / `ctx.sessionController`。  

**Required Correction:** P0 以当前 Typert/Connection 为唯一 Host/Client 合同。2026-07-19 note 降为历史，不得当现行权威。  

**When:** P0，详细设计前。

## F-03
**Severity:** BLOCKER  
**Area:** Runtime Boundary  

**Current Design:** Option A — Harness directly composed inside Worker。倾向避免 `Desktop → Worker → ACP → Harness`。  

**Problem:** “composition” 被理解成 Worker 当普通 Node 程序 import 内部包。官方产品入口禁止这条路。合理 composition 是：**Worker 启动 `dsh --profile <shaco>`，或嵌入 `dsh-app-boot` 加载官方 profile 树**。  

**Evidence:** architecture.md Application launch；AGENTS.md 同规则；`dsh-app-boot` README: product apps 用 `dsh` launcher，direct-config 仅给 embedders/tests。  

**Why It Matters:** internal import 会绑 private exports、Loader internals、`!!js`、Typert generated artifacts，升级必炸。  

**Failure Scenario:** 第一次 Harness minor bump 后 Worker 无法 boot，因为用了非 public launch 面。  

**Required Correction:** 冻结：Worker = 长期 `dsh` Host 进程。允许的依赖只有 profile/bundle/public package + documented boot。禁止 workspace-internal deep import 作为产品路径。  

**When:** 详细设计前。

## F-04
**Severity:** HIGH  
**Area:** Process Model  

**Current Design:** 1.0 就要求两个长期 OS 进程；Desktop 关窗口 Worker 仍运行。  

**Problem:** 官方 Electron 蓝图是 **同一应用内 Main=Host、Renderer=Client、IPC=carrier**。两进程对 1.1 有价值，但不是 Harness Desktop 的最小正确形状。1.0 若先做两进程 + 自研协议，成本会高一个数量级。  

**Evidence:** web-server.md Electron 句；社区 Discussion #3118：file:// + IPC，主进程 Cordis 树，无本地 HTTP，macOS 已跑通。官方 `apps/` 无 electron。  

**Why It Matters:** 两进程本身可保留，但必须先复用 Connection carrier，再拆进程。  

**Failure Scenario:** 为了“Desktop 关闭 Worker 仍在”先写 Named Pipe 协议，结果 Client boot/plugin/auth 全部重做，1.0 无法按时。  

**Required Correction:** 两进程可以 1.0 就要，但 **Main 只做 supervisor + carrier**，Host 仍是完整 `dsh` 树。不允许 Desktop 自己做第二套 RPC 语义。若 1.0 日程不够，先做同进程 Electron Host，1.1 再按同一 Connection 合同拆出 Worker——但必须在 P1 写明，不能假装已经拆了。  

**When:** Architecture Owner 决策，详细设计前。

## F-05
**Severity:** BLOCKER（对当前 1.0 范围）  
**Area:** Plugin  

**Current Design:** 1.0 保持 install/configure/enable/disable/runtime load/persisted config；plugin 异常不应拖垮 Worker。  

**Problem:** 官方插件模型做不到进程隔离。第三方 bundle 是同进程代码；`dsh plugin add github:…` 可在 install 时执行 prepare；dynamic Cordis 能把模型生成的 Host/Client 源码跑起来。  

**Evidence:** SAFETY.md；plugin publish.md；extensions README / `ctx.dynamicCordisRunner`。workflow-worker-thread 也写明 **containment, not a security boundary**。  

**Why It Matters:** “quarantine” 若只是 metadata，无法阻止 `apply()` 里的任意 Node。  

**Failure Scenario:** 恶意或坏掉的 plugin 在 Worker 里删文件、读 `$DSH_HOME/.credentials.yaml`、挂死事件循环；Desktop 只能显示 Worker FAILED。  

**Required Correction:** `FULL_PLUGIN_PARITY_IN_V1_0 = REQUIRES_SCOPE_REDUCTION`。1.0 只支持：官方 in-box + 签名/pinned npm bundle；默认关闭 dynamic Cordis；load failure = disable + 不启动该 fiber；不承诺 crash isolation。  

**When:** P0 feature freeze。

## F-06
**Severity:** BLOCKER  
**Area:** Upgrade / Persistence  

**Current Design:** P7 Upgrade Transaction 含 Migration + Rollback；P8 验收 rollback。  

**Problem:** 上游明确：session 格式无升级器；旧格式直接拒绝；preview 阶段可改磁盘格式。  

**Evidence:** persistence.md Format refusal；AGENTS.md “Backends reject old on-disk formats”。  

**Why It Matters:** “Rollback Harness session store” 是无法交付的门。  

**Failure Scenario:** 用户升到新 baseline 后 session 全部 `SessionFormatUnsupportedError`；产品 rollback 只能回二进制，打不开新格式数据，也不能安全回到旧格式。  

**Required Correction:** 1.0 upgrade = **pin Harness baseline + 替换安装 + 拒绝不兼容数据（fail closed）+ 备份用户数据目录**。不承诺 round-trip rollback。Control Store 可以有自己的 schema migration；Harness 数据不行。  

**When:** P1 Version/Update contract。

## F-07
**Severity:** HIGH  
**Area:** Feature Parity  

**Current Design:** P5 覆盖 Provider 到 Plugins/Fork/Resume，以及 P0 确认的所有正式功能。  

**Problem:** “正式 Web 产品用户可使用的核心能力”被理解成几乎全部 client 包 + experimental。Web 上存在 ≠ 1.0 Desktop REQUIRED。  

**Evidence:** client 包含 workflow-run、goal、jobs、agent-preset、deliverables、message-feedback、dynamic cordis UI、plugin inventory。experimental Agent Teams 在 `packages/experimental/`，packages/README 标 unreleased。  

**Why It Matters:** 过宽 parity 会把 1.0 做成“在不稳定 runtime 上重做整个 Web”。  

**Failure Scenario:** P8 卡在 Agent Teams / dynamic plugin / Ralph / webhook，而 Workspace+Session+Tool+Approval 已经能用。  

**Required Correction:** P0 必须产出收缩后的矩阵。默认：experimental = NOT_PRODUCT；dynamic Cordis = DEFERRED；Jobs/Goal/Schedule = OPTIONAL（并标注 process-local / session-local 限制）；webhook = WEB_ONLY 或 DEFERRED。  

**When:** P0 gate。

## F-08
**Severity:** HIGH  
**Area:** Future 1.2  

**Current Design:** 不想要三层长期进程；Harness 直接进 Worker。  

**Problem:** 1.2 的 Codex/Claude Code/独立 Reviewer **本来就是子进程**。Harness 已实现。硬禁 child process 会逼 1.2 重写 Worker。  

**Evidence:** subagent README：ACP、Codex、Claude Code、DSH SDK 都是 out-of-process。  

**Why It Matters:** 1.0 应禁止的是 “Desktop→Worker→ACP→Harness 作为 **UI 主路径**”，不是禁止 Worker 下面的 capability child。  

**Failure Scenario:** 1.2 要接 Claude Code，发现 Worker 被设计成 single-process composition，只能再套一层。  

**Required Correction:** 冻结进程层级：Desktop（可选）→ Worker Host（长期）→ **capability children（按需）**。1.2 MultiAgentRuntime 是 Worker 内编排，调用 `ctx.subagents`，不是新的跨 Desktop 协议。  

**When:** P1 Future Seam。

## F-09
**Severity:** MEDIUM  
**Area:** Data  

**Current Design:** 1.0 建 SQLite Control Store，存 worker identity、settings、plugins、profiles。  

**Problem:** 方向对，范围过大。Harness 已有 `$DSH_HOME`、settings、credentials yaml、storageDomain、session persistence。把 profiles/plugins/settings 再存一份会双写。  

**Evidence:** home-paths：`DSH_HOME` 或 `~/.dsh`；storage group；credentials 存 `$DSH_HOME/.credentials.yaml`。  

**Why It Matters:** 1.1 Automation 需要产品库；1.0 只应存 **Shaco 拥有且 Harness 无法权威表达** 的数据。  

**Failure Scenario:** 用户在 Harness UI 改 plugin，Control Store 仍显示旧状态。  

**Required Correction:** Control Store 1.0 仅：schema version、worker instance id、endpoint、product versions、upgrade state、Desktop 偏好中不属于 Harness Settings 的部分。Harness session id 只存引用。profiles/plugins/credentials **不**复制。  

**When:** P1 Data Boundary。

## F-10
**Severity:** HIGH  
**Area:** Client / Electron  

**Current Design:** 复用 Harness Client，只换 transport。  

**Problem:** Client boot 依赖 HTML index injection、`__DSH_BOOT__`、`/plugins` combo、token cookie、loopback hostname。Electron `file://` hostname 为空。社区已踩过：settings 退化成内存态、整页插件配置空白。  

**Evidence:** client-modules.md；connection README 鉴权；Discussion #3118 loopback 判定。  

**Why It Matters:** 这不是 P4 polish，是 Desktop 能否启动的问题。  

**Failure Scenario:** 窗口能开，Remote 全 401/非 loopback，Settings/Plugins 空白。  

**Required Correction:** P0/P4 之前做 **Client boot spike**：custom scheme 或显式 loopback 分类；无 HTTP 时如何提供 plugin combo；鉴权从 cookie 迁到进程内 carrier。  

**When:** 在 P4 详细设计前，最好作为 SPIKE 阶段。

## F-11
**Severity:** HIGH  
**Area:** Packaging  

**Current Design:** P7 才做 installer、Node-free、code signing。  

**Problem:** Harness 是 Node 22.19+/pnpm workspace + native addon + 双 face 构建（host tsdown + client tsdown + web vite）。TypeScript SDK 明确 **No bundled-runtime resolution**。  

**Evidence:** root package.json engines/scripts；sdk-client limitations；native/landlock-run。  

**Why It Matters:** 若无法把 `dsh` 打进 Worker 可执行文件，P2 “用户无 Node” 就是假的。  

**Failure Scenario:** P7 才发现必须改启动模型（embedded Node vs sidecar），Worker identity/路径全改。  

**Required Correction:** 增加早期 Packaging Spike。P2 Worker 必须按 **即将打包的形态** 启动，而不是开发机 `pnpm dsh`。  

**When:** P0 后、P2 前。

## F-12
**Severity:** HIGH  
**Area:** Security  

**Current Design:** P1 冻 Security，P7 hardening。Renderer sandbox on。  

**Problem:** 真正的危险面在 Worker：任意 tool、shell、plugin、credentials、dynamic code。Electron sandbox 不保护 Worker。SAFETY.md 声明未审计、非 production-ready。  

**Evidence:** SAFETY.md；credentials 文件存储；Windows sandbox 是 restricted token 而非容器。  

**Why It Matters:** 把 Security 写成 Electron 清单会漏掉产品真实威胁模型。  

**Failure Scenario:** 通过审批的 tool 或恶意 plugin 在用户上下文中执行；Named Pipe 若 ACL 错，本机其他进程可驱动 Agent。  

**Required Correction:** P1 Security Contract 必须以 **Worker = untrusted-capability host** 为中心：pipe ACL、plugin allowlist、credential 文件 ACL、path allowlist、生产环境禁用 dynamic Cordis。  

**When:** P1。

## F-13
**Severity:** HIGH  
**Area:** 1.1 Compatibility  

**Current Design:** 1.0 预留 AutomationRuntime seam；Worker 在 Desktop 关闭后继续。  

**Problem:** 生命周期 seam 有用。但 Harness Goal/Jobs/Schedule **不是** Automation 原语。若 1.0 把它们当 durable automation 投影进 Desktop，1.1 会被错误模型锁死。  

**Evidence:** glossary goal activation；jobs-local process-local；schedule README “no email, SMS, or push”。  

**Why It Matters:** 1.1 需要产品自己的 Run/Task/Attempt 持久化，挂在 Worker 上，**调用** Agent Runtime，而不是把 session reminder 升级成 scheduler。  

**Failure Scenario:** 1.1 试图 resume Job，发现 Worker 一重启 registry 就空。  

**Required Correction:** P1 明确：Harness Workflow/Jobs/Goal/Schedule = upstream feature parity only。AutomationRuntime 在 1.0 只留空接口和数据位置，不复用这些类型。  

**When:** P1 Future Seam。

## F-14
**Severity:** MEDIUM  
**Area:** Protocol / Duplicate  

**Current Design:** READ_ONLY / IDEMPOTENT / NON_REPLAYABLE + requestId 去重；考虑 exactly-once journal。  

**Problem:** 过设计。Harness 自己对 reconnect 的态度是 rebuild + 有限 journal；approval 是 first-answer-wins。Exactly-once 跨 Desktop crash 需要 durable command ledger，1.0 不值得。  

**Evidence:** Gateway limitations：one-way notifications 不 replay；journal stream 去重但拒绝 gap。  

**Why It Matters:** 自研 exactly-once 会再造一个与 Remote 平行的状态机。  

**Failure Scenario:** Desktop 重放 approval，Harness pending table 已 resolved，UI 与 Worker 分歧。  

**Required Correction:** 1.0：at-most-once + 可查询 outcome。Approval/cancel 重连后问 Host pending 状态，不重放。不必 exactly-once。  

**When:** P1 Protocol Contract。

## F-15
**Severity:** MEDIUM  
**Area:** Worker Lifecycle  

**Current Design:** per-user single-instance long-running；列出了 orphan/stale/mutex 等审计点，但没有合同。  

**Problem:** 清单不等于设计。Windows 上 PID reuse、多 session（快速用户切换）、named pipe squatting、旧 Worker + 新 Desktop，都需要具体身份模型。  

**Evidence:** 方案自身提出这些问题，但未冻结 workerId、endpoint path、mutex 名称、handshake 失败时谁杀谁。  

**Why It Matters:** 两进程产品的第一类故障就是双 Worker 或连错 Worker。  

**Failure Scenario:** 升级后旧 Worker 占着 pipe；新 Desktop 连上旧 baseline，session 格式随后损坏。  

**Required Correction:** P1 冻：workerId、pipe 名称含 user SID + product + protocol major、mutex、stale 判定（handshake version mismatch → 拒绝并提示停旧进程，1.0 不要自动 kill 除非用户确认）、Desktop 不得启动第二个 Host。  

**When:** P1。

## F-16
**Severity:** MEDIUM  
**Area:** Renderer Scheme  

**Current Design:** 倾向 `app://shaco-forge/`，不是硬结论。  

**Problem:** 官方文档写 Electron 用 `file://`。那是预定，不是安全结论。`file://` 在 Chromium 上 CSP/origin 更差，且破坏 loopback 判定。  

**Evidence:** web-server.md；社区 loopback bug。  

**Why It Matters:** 加载模型决定 plugin combo、CSP、cookie、相对路由。  

**Failure Scenario:** 跟官方 `file://` 走，然后为 CSP/plugin 打大量 Harness 补丁。  

**Required Correction:** `RECOMMENDED_RENDERER_LOADING_MODEL` = **secure custom scheme**，并把该 origin 显式分类为 Connection 的 loopback/trusted。不要裸 `file://` 作为 release 默认。  

**When:** P1 / Client spike。

## F-17
**Severity:** MEDIUM  
**Area:** Phase Order  

**Current Design:** P0→P8 线性。  

**Problem:** Plugin frontend、packaging、Connection carrier、Windows sandbox 都是未知数，却被放在能跑起来之后。P6 把 recovery 和 plugin 捆在一起。P7 过载。  

**Evidence:** 见 F-10、F-11、F-05。  

**Why It Matters:** 线性阶段会把发现推迟到已经写了大量错误协议代码之后。  

**Required Correction:** 见第 O 节：加 SPIKE；拆 plugin；提前 packaging proof；P1 必须含 Protocol/Version/Error/Update。  

**When:** 重新排阶段时，coding 前。

## F-18
**Severity:** LOW  
**Area:** Over-design  

**Current Design:** 大量 envelope 字段候选：connectionId、sequence、ack、retry token…  

**Problem:** 其中许多已由 Connection rpcId / generation / RemoteJournalStream 覆盖。Shaco supervisor 只需 worker 身份和 carrier 健康。  

**Evidence:** connection generation ready 帧已有 `clientId`；Gateway journal 已有 range/gap。  

**Required Correction:** 先列 Connection 已有字段，再决定 Shaco 增量。默认不加第二套 sequence。  

**When:** P1，非阻塞整体架构。

---

# F. RUNTIME BOUNDARY REVIEW

## Option A — Harness composed inside Worker
把 Cordis 树直接放进 Shaco Worker 进程。

## Option B — Worker → ACP/SDK → separate Harness process
Worker 当 supervisor，agent 面走 ACP 或 SDK stdio。

## Option C — Reviewer proposal
**Worker 就是长期运行的 `dsh` Host**（Shaco profile：`dsh-base` + web 产品面，**去掉** loopback HTTP webserver，换上 Named Pipe / Electron-IPC 的 Connection carrier）。  
Desktop Renderer = 官方 Client。  
Desktop Main = 窗口、preload allowlist、native picker、Worker 发现/升级、carrier。  
**禁止**自研业务 RPC。  
**禁止** ACP 作为 UI 主路径。  
Worker 内部仍可通过 `ctx.subagents` 拉起 ACP/Codex/Claude Code **子进程**（1.2）。

| 维度 | A 直接 composition（internal import） | B ACP/SDK 子进程 | C Host profile + Connection carrier（推荐） |
| -- | -- | -- | -- |
| complexity | 表面低，实际要复刻 boot/Loader/Typert | UI 面缺失，要自研整个 Client | 中：跟官方 Web 分层一致，只换载体和生命周期 |
| upstream upgrade | 最差：internal API 必破 | 协议窄，升级稳但功能永远不够 | 中高但仍走 public profile/bundle |
| crash isolation | 无（plugin/tool 与 Worker 同生共死） | Harness crash 不带倒 supervisor | 与 A 相同（Host 仍在 Worker）；1.2 子进程才有隔离 |
| IPC complexity | 需自研 Desktop↔Worker 协议 | 已有 stdio JSON-RPC，但不是 GUI 协议 | 只实现 Connection 的物理 carrier |
| performance | 最好 | 多一跳 + stdio | 与 A 接近 |
| packaging | 要打包整个 Node 图 | 要打包 dsh + Worker | 同样要打包 dsh；启动路径与官方一致 |
| 1.1 suitability | 生命周期可以；但错误协议会拖累 Automation | 更像 automation 网关，不像桌面产品 | Worker 可在 Desktop 关闭后继续；Automation 挂 Worker |
| 1.2 suitability | 若禁 child process 则差 | 只覆盖 ACP 类角色 | 好：Host 编排已有 Codex/Claude/ACP/SDK providers |

**RECOMMENDED_RUNTIME_BOUNDARY**

```text
Electron Desktop
  Main: supervisor + native + Connection carrier adapter
  Renderer: Harness Client (projection only)
        │
        │ Connection RPC / Remote / event streams
        │ physical: Named Pipe or Electron IPC
        ▼
Shaco Forge Worker  =  dsh --profile shaco-forge-host
  Cordis Host tree (dsh-base + web product plugins - HTTP server)
  session/persistence/tools/approval/subagent/workflow/...
        │
        │ optional capability children (not the UI path)
        ▼
  subagent-codex / subagent-claude-code / subagent-acp / subagent-dsh-sdk
```

不要选 A 的 internal-import 变体。不要选 B 作为 1.0 UI。C 保留双进程产品目标，同时站在官方 Host/Client 边界上。

---

# G. DESKTOP / WORKER REVIEW

**Process model:** 双进程作为 1.0 产品选择 **可以成立**，因为它是 1.1 unattended 的前提。它不是 Harness 的最小 Desktop 形态。若坚持 1.0 双进程，Worker 必须是 Host，不能是“再包一层的 supervisor”。

**Authority:** Worker = Runtime Authority、Desktop 不得宣布成功 —— **正确，必须保持**。

**Lifecycle:** Desktop 关窗口 Worker 仍在 —— 对 1.1 正确；对 1.0 是成本项。1.0 不要求 login auto-start / Windows service —— 正确。

**Reconnect:** 原则（不以 Desktop 内存为权威）正确，但实现应走 Connection generation + `session.history`，不要自研 snapshot 权威。

**Ownership:** 用户数据应以 `$DSH_HOME`（或 Shaco 指定的 `DSH_HOME`）为 Harness 根；Shaco Control Store 分开。卸载必须能停 Worker。

**Shutdown:** 需要显式：退出 Desktop vs 退出 Shaco（停 Worker）。当前方案缺这个产品区分，会导致“关窗口等于杀 Agent”或“用户以为退了其实 Worker 还在跑工具”。

**Crash:** Desktop crash → Worker 继续，正确。Worker crash → 靠 Harness session persistence 冷恢复，正确；但 Jobs/Goal activation/dynamic plugins **不会**恢复。

**Upgrade:** 旧 Worker + 新 Desktop 必须 handshake fail closed。当前状态机缺 `UPGRADING` / `DRAINING` / `INCOMPATIBLE` 的权威处理。建议：

- Worker Runtime: `NOT_RUNNING | STARTING | READY | DEGRADED | DRAINING | UPGRADING | STOPPING | FAILED`
- Connection: `DISCONNECTED | CONNECTING | CONNECTED | RECONNECTING | INCOMPATIBLE`
- `RECOVERING` 不要和 Runtime 混用；恢复是 READY 之后的 session 操作。

缺状态：**DRAINING、UPGRADING、STOPPED（明确终端）**。`FAILED` 必须区分 transient 与 terminal。

---

# H. PROTOCOL REVIEW

**Transport:** Windows 1.0 用 Named Pipe + per-user ACL **适合作为物理层**，不适合作为新的业务协议。官方更小的路径是 Electron IPC；两进程时 Named Pipe 合理。不要用 localhost HTTP 当正式面（与官方拒绝 `0.0.0.0`、cookie 无 Secure 一致）。

**Envelope:** 不要定义第二套 HELLO/REQUEST/EVENT。Supervisor 通道最多：发现、健康、版本、启停。Agent 通道 = Connection。

**Streaming:** 已由 Gateway mux / Remote streams 覆盖。`Request → 0..N Events → Final` 是对的，但已存在。

**Reconnect:** 用 Connection generation：invalidated → backoff → `$events` ready → 再拉 history。不要假设 Worker 会为断开的 Desktop 无限缓冲 UI event。这点原方案是对的。

**Duplicate / ambiguity:** at-most-once + 查询 pending/outcome。不必 exactly-once。approval 重连后 replay **requested 帧**（Harness 已有此语义方向），不要重放 Desktop 的 answer。

**Cancellation:** 走 Remote 的 `AbortSignal` 映射，不要另做 CANCEL 消息类型，除非 carrier 需要 abort 底层调用。

**Ordering:** session 事件以 Harness log seq 为准。Desktop 不得重排。

**Snapshot / subscription:** Host 的 session history + live `$events`。Shaco 不要维护第二份 event store。

**Security:** Named Pipe 必须绑当前用户 SID；路径含不可猜测的 workerId；拒绝其他 session；限制 payload 大小（官方 HTTP 默认 300 MiB，Desktop 应更严）。Handshake 必须校验 Desktop 与 Worker 的 harnessBaseline。

`PROTOCOL_DESIGN_SUFFICIENT = NO`

原因：当前设计足够证明“需要流式和重连”，但选错了协议层。补字段不能修好错误边界。

需要保留的 Shaco 增量（supervisor，不是 agent 协议）：`workerId`、`workerVersion`、`harnessBaselineVersion`、`carrierVersion`、`clientInstanceId`。  
不要在 1.0 自研：command ledger、exactly-once、第二套 event cursor。Connection 已有 rpcId/generation/journal。

---

# I. DATA & PERSISTENCE REVIEW

**1.0 建 Control Store：合理，但不该大。** 1.1 会需要产品库；现在建小型 SQLite 避免 1.1 从零开始。过早的是把 Harness 配置再存一遍。

**应留在 Harness：** session log、workspace registry、settings、credentials、plugin profile/bundles、projections、attachments。

**应进 Control Store：** Shaco schema version、worker instance、endpoint、产品版本四元组、升级事务状态、是否同意后台 Worker、与 Harness Settings 无关的桌面偏好。

**Harness Session 引用：** 存 `sessionId` + `harnessBaselineVersion` + `dshHome`。不要复制 transcript。打不开就显示 unsupported，不要 migrate。

**Future Automation：** Control Store 预留 schema namespace `automation_*`，1.0 不建表或只建空版本。不要把 Automation 行塞进 session JSONL。

**Corruption / backup / rollback：** 1.0 需要：数据目录备份、Control Store 备份、fail-closed。不需要 Harness log 的 upgrader。Control Store 自己可以 monotonic schema + 向前迁移；失败则拒启动。

**所有权：** 一句话：Harness Persistence 是 conversation/runtime 权威；Control Store 是 product/control-plane 权威。Desktop 两边都不是权威。

---

# J. HARNESS CLIENT / ELECTRON REVIEW

**UI reuse feasibility:** 可行，但不是“换 fetch”。必须当 **Host/Client 产品复用**，外加 Desktop carrier 与 boot 适配。

**Transport separation:** 逻辑上已分离（Connection）。物理上仍假设 HTTP/WS、cookie、loopback、`/plugins`。

**file/custom scheme:** 见 F-16。推荐 custom scheme。

**Routing:** SPA fallback 由 `host-frontend-static` 在 HTTP 上完成。custom scheme 必须自己做 SPA fallback，且 **禁止** 把未知路径当 JS 插件返回（官方 combo 路由对错误 revision 返回 404，就是为了这个）。

**Asset loading:** Vite dist + host 注入的 boot graph。Electron 必须在 index HTML 注入等价 `__DSH_BOOT__`，或让 Worker 通过 carrier 提供 graph，而不是假设 `http://127.0.0.1:3080`。

**CSP:** custom scheme 才能有效限制 `script-src`。动态 plugin 会逼你允许额外脚本源——这是把 plugin frontend 放进 1.0 的核心安全冲突。

**Plugin frontend:** 见 K。可能是 Desktop 最大阻塞。

**Bundling:** 官方是 host lib + client lib + web frontend 三阶段。Shaco 不能只拷 `apps/web/dist` 而忽略 plugin combo 运行时。

**Browser assumptions:** `location` origin、cookie、WebSocket、`fetch`、可能的 `window.open`。Main/preload 必须提供受控 polyfill，而不是开 `nodeIntegration`。

**RECOMMENDED_RENDERER_LOADING_MODEL**

```text
custom scheme  (e.g. app://shaco-forge/)
  → load packaged web dist
  → inject boot graph equivalent to window.__DSH_BOOT__
  → classify origin as loopback/trusted for Connection
  → unary/stream via preload allowlist → Main → Named Pipe/IPC → Worker Connection handler
  → do not serve plugins by copying HTTP webserver into Desktop
  → plugin combo either: Worker-provided authenticated bytes over the same carrier,
    or 1.0 disable third-party client plugins
```

不要用裸 `file://` 作为正式 release。

---

# K. PLUGIN REVIEW

`FULL_PLUGIN_PARITY_IN_V1_0 = REQUIRES_SCOPE_REDUCTION`

原因（事实，不是猜测）：

1. **同进程。** `apply(ctx)` 跑在 Worker/Host 里，拥有 Node、fs、shell、credentials。
2. **安装即可执行。** git 依赖的 `prepare` 在 sandbox 外跑。
3. **动态插件。** 模型可定义并运行 Host/Client 源码；重启即丢失，但运行时是 eval。
4. **无 crash isolation。** fiber 失败 ≠ 进程隔离。恶意插件可卡住事件循环。
5. **Frontend 依赖 Web 载体。** `/plugins` combo + lazy CJS + HMR 图。Electron 无 webserver 就要重做这条链。
6. **升级。** preview 阶段 plugin API 可任意破。无 baseline pin 就没有 compatibility metadata。
7. **SAFETY.md** 明确不要当 production-ready。

1.0 可做：

- 官方 in-box plugins（web profile 已装的）
- 可选：pinned npm bundle，手动 enable，失败则 disable
- compatibility metadata + unsupported 标记
- **默认关闭** `tool-cordis` / dynamic runner

1.0 不可承诺：

- 任意第三方 GitHub plugin
- crash isolation
- marketplace
- hot reload
- 恶意插件下的 Worker 存活

---

# L. SECURITY REVIEW

单独列出：

| ID | Severity | Finding |
| -- | -- | -- |
| S-01 | BLOCKER | 第三方/动态插件 = 用户上下文中的任意代码。1.0 必须默认关闭或 allowlist。 |
| S-02 | HIGH | Named Pipe 无正确 ACL / 固定路径时，本机 rogue client 可驱动 Agent、读会话、抢审批。 |
| S-03 | HIGH | 凭据在 `$DSH_HOME/.credentials.yaml`。Worker 日志、support bundle、Desktop crash dump 必须 redaction；文件 ACL 仅当前用户。 |
| S-04 | HIGH | Renderer 原则（sandbox/contextIsolation）正确，但 **不足**：preload allowlist 一旦暴露任意 invoke，等于绕过 sandbox。 |
| S-05 | HIGH | 官方 cookie 无 `Secure`、loopback HTTP。Desktop 若错误保留 HTTP carrier，会扩大攻击面。应删除 Web token/cookie 路径。 |
| S-06 | HIGH | Windows sandbox 是 restricted token + ACL，不是容器。`danger-full-access` 仍是用户级全权。 |
| S-07 | HIGH | `shell.openExternal`、拖放、clipboard、file picker 必须 allowlist。Client 若假设浏览器下载/导出，会变成任意文件写。 |
| S-08 | MEDIUM | 官方 `maxRequestBodyBytes` 默认 300 MiB，可成本地 DoS。Desktop carrier 应更小并流式化。 |
| S-09 | MEDIUM | 生产环境 DevTools 策略未定义。preview 软件 + 动态脚本 = XSS/plugin 调试面。 |
| S-10 | MEDIUM | 升级无签名则 Worker 可被替换。P7 code signing 必须在威胁模型里，而不是发行 checklist 末项。 |
| S-11 | MEDIUM | 多 Windows session / 管道 squatting：pipe 名必须含 SID，不能用全局 `\\.\pipe\ShacoForge`。 |
| S-12 | LOW | 官方 Host/Origin 防 DNS rebinding。Named Pipe 没有 Origin；必须用 Windows 身份替代，而不是复制 header 检查。 |

P1 就应冻结上述项。P7 只做验证。

---

# M. UPSTREAM UPGRADE REVIEW

**Highest-risk APIs**

1. Typert generated Remote 描述符 / `ctx.remote.*`
2. `SessionEventMap`（fail-closed；未知事件拒读 log）
3. Connection 鉴权与 boot graph
4. Client `dsh.client` 加载协议
5. Persistence header / `SESSION_FORMAT_VERSION`
6. Profile/bundle 组成与 `cordis.patch.yml` 整行替换语义
7. Subagent provider 合同（1.2 依赖）

**Package instability:** 整个仓库仍是 `0.1.2-alpha.1`。packages/README 的 “stable API” **不能**当作对外承诺。`experimental/`、`e2b/`、`examples/`、`util/` 明确更弱。

**Session compatibility:** 无。新 harness 拒旧 log；旧 harness 拒新 event 类型。

**Plugin compatibility:** profile 绑在安装 closure 上。Harness bump 后第三方 bundle 可能无法 load。

**Client compatibility:** “No protocol version；client and host release bound together”（旧 note）。独立发布 Desktop 却每天追 Harness，必须自己引入 **harnessBaselineVersion** 绑定。这是 Shaco 要加的，不是 Harness 已有的。

**Required pinning:** 精确 git SHA + 发布的 `@deepseek-ai/dsh` 版本 + lockfile。禁止 1.0 跟踪 master。

**Upgrade branch strategy:** Shaco 跟 **pinned baseline**。升级是显式产品版本，不是自动 latest。评估窗口内跑 P0 回归矩阵。

**Rollback:** 只能回 Shaco 安装包 + 恢复 **升级前备份的数据目录**。不能原地 down-migrate Harness session。`HARNESS_CORE_PATCH_COUNT` 目标仍应是 0；若必须 patch，只能走可上游化的 carrier/loopback/scheme 适配，禁止改 agent-loop。

---

# N. FEATURE PARITY REVIEW

基于当前 Web 产品组成（`dsh-base` + `dsh-web-app` + client UI 包），不是基于方案愿望清单。

图例：REQUIRED = 没有就不能叫 Desktop Baseline；OPTIONAL = 有更好但不挡 1.0；WEB_ONLY = 依赖 HTTP/浏览器；DEFERRED = 刻意推迟；EXPERIMENTAL = 非产品；NOT_PRODUCT = Shaco 自己的未来域。

| Feature | Upstream home | 1.0 class | Note |
| -- | -- | -- | -- |
| Provider / DeepSeek model | llm-deepseek, settings-models | **REQUIRED** | |
| OpenAI-compatible / extra providers | llm-pi-ai, settings | **OPTIONAL** | |
| Workspace pick/create | directory-picker, workspace | **REQUIRED** | Desktop 应走 native picker |
| Session create/list/resume | session-controller, persistence | **REQUIRED** | |
| Conversation streaming | session/event, ui-chat | **REQUIRED** | |
| Compaction | compaction | **OPTIONAL** | 行为 parity，非 UI pixel |
| Tools + filesystem | fs, tools | **REQUIRED** | |
| Shell (pwsh on Windows) | shell, sandbox-windows-acl | **REQUIRED** | |
| Permission presets | permission-presets | **REQUIRED** | |
| Approval | user-approval, ui-approval | **REQUIRED** | |
| Ask user / questions | user-questions | **REQUIRED** | |
| Plan mode | plan, ui-plan | **OPTIONAL** | |
| Subagent spawn/fork in-process | subagent-spawn/fork | **REQUIRED** | 核心 Web 能力 |
| Subagent ACP/Codex/Claude/SDK | subagent-* | **OPTIONAL** | 为 1.2 留 seam，1.0 不强制全开 |
| Workflow + Ralph | workflow | **OPTIONAL** | worker-thread 非安全边界 |
| Jobs | jobs-local | **OPTIONAL** | process-local，须在 UI 标明 |
| Goal | goal | **OPTIONAL** | activation 不耐久 |
| Skills | skill | **OPTIONAL** | |
| Settings | settings, ui-settings-* | **REQUIRED** | |
| Credentials | credentials | **REQUIRED** | 所有权在 Harness |
| Feedback | feedback, ui-message-feedback | **OPTIONAL** | |
| Plugins settings / inventory | ui-settings-plugins, plugin-inventory | **OPTIONAL** 且缩范围 | 见 K |
| Session history / fork / rename / export | session-controller | **REQUIRED** history/resume；fork **OPTIONAL** | 旧 note 曾把 fork 当 reserved |
| Agent presets | preset, ui-agent-preset | **OPTIONAL** | |
| Attachments / images | attachment, ui-attachment | **OPTIONAL** | 默认 200 MiB 聚合限制 |
| Deliverables / file refs | ui-deliverables | **OPTIONAL** | |
| Commands / slash | commands, ui-commands | **REQUIRED** 最小集 | |
| Model selection in session | ui-model-selection | **REQUIRED** | |
| Localization / theme | locale, ui-theme | **OPTIONAL** | |
| HMR / dev:web | client-hmr | **WEB_ONLY** | 正式 Desktop 关闭 |
| Loopback HTTP / token URL / DSH_WEB_URL | web-app | **WEB_ONLY** | Desktop 不应复制 |
| LAN trusted hosts | web-app | **WEB_ONLY** | |
| Webhook ingress | webhook | **DEFERRED** | |
| Dynamic Cordis / self-modification | extensions | **DEFERRED** / 默认关 | 安全 |
| Agent Teams | experimental/agent-team | **EXPERIMENTAL** | 非 1.0 |
| E2B | e2b | **EXPERIMENTAL** / POC | |
| Inspector | experimental | **NOT_PRODUCT** | |
| AutomationDefinition/Run/Task… | 不存在于上游产品域 | **NOT_PRODUCT** | 1.1 |
| Multi-model council | 不存在；subagent 只是接缝 | **NOT_PRODUCT** | 1.2 |
| Marketplace | 不存在 | **NOT_PRODUCT** | |

Group A/B 大体可留。Group C 不得整组 REQUIRED。Group D 的 Plugins 必须降级。

当前 Harness 还有方案未单列、但 Web 用户会碰到的能力：agent presets、attachments、session export ZIP、message feedback、directory browse vs native、PowerShell-on-Windows、token meter/compaction policy、permission Full vs Standard。这些应进入 P0 矩阵，而不是 P5 才发现。

---

# O. P0–P8 PHASE REVIEW

| Phase | Action | Why |
| -- | -- | -- |
| **P0** | **KEEP + 扩展** | 必须冻 SHA、web 组成、parity、依赖分类。现有 gate 不够。 |
| **P0.S SPIKE** | **ADD**（P0 后、P1 前或与 P0 并行收尾） | Client boot + custom scheme + Connection carrier + plugin combo + Windows 打包形态。不 spike 就冻合同是赌。 |
| **P1** | **KEEP + 扩展** | 补 Protocol（= reuse Connection）、Version、Error taxonomy、Update/pin、Diagnostics、Future seam。 |
| **P2** | **KEEP，但改定义** | “Headless” 改名为 **Host-only Worker**。不要用 `dsh --profile headless`。按打包形态启动。Supervision/mutex/identity 在此落地，不要拖到 P6。 |
| **P3** | **MOVE 语义** | 不再“设计新协议”。P3 = Connection carrier + supervisor 发现 + ACL。Stream/reconnect 测试仍要。Durable command journal **REMOVE** from 1.0。 |
| **P4** | **KEEP** | 依赖 spike 成功。允许 thin Desktop shell package，但 UI 仍来自 client 包。 |
| **P5** | **KEEP，缩范围** | 只跑 P0 REQUIRED。高级组默认可 DEFERRED。 |
| **P6** | **SPLIT** | P6a Durability/Recovery（可部分前移到 P2/P3）。P6b Plugin compatibility（缩范围，可 DEFERRED 而不挡 1.0）。 |
| **P7** | **SPLIT** | P7a 早期 Packaging proof（提前）。P7b Security verification + signing + uninstall。Rollback gate 改为 backup-restore，不叫 schema rollback。 |
| **P8** | **KEEP** | Fresh acceptance。PLUGIN_BASELINE 改为缩范围后的 gate。`HARNESS_CORE_PATCH_COUNT` 保留。 |
| **P0.5 Compatibility** | **ADD 轻量** | 不是完整阶段：一份 Compatibility Contract（baseline pin、incompatible 时 fail closed、Desktop/Worker 版本矩阵）。 |

循环依赖：P4 Client 需要 P3 carrier，P3 测试又需要某种 Client。用 P0.S spike 打破，而不是在 P3 发明新协议。

**不保持原 P0–P8 只因已经写了。** 原顺序作为叙事可以，作为工程依赖不够。

---

# P. CROSS-PHASE CONTRACT GAPS

**Chain A — API → composition → parity → upgrade**  
`CROSS_PHASE_CONTRACT_GAP`: P0 未以现行 Typert/Connection 为权威；P1 却要冻 Harness Boundary；P2 却想 internal composition；P7 却假设可 rollback。链是断的。

**Chain B — Authority → transport → UI → reconnect**  
Gap: P1 Authority 正确，P3 却新做一套 RPC，P4 Client 仍讲 `ctx.remote`，P6 reconnect 又自研 snapshot。三条状态机。

**Chain C — Data**  
Gap: Control Store 计划存 profiles/plugins，Harness 才是权威。1.1 Automation 表与 session log 的关系未冻。无备份合同。

**Chain D — Security**  
Gap: P1 偏 Electron；P3 pipe ACL 未与 Worker 身份绑定；P4 plugin 脚本；P6 “quarantine” 无强制力；P7 才 hardening。恶意插件路径从未闭合。

**Chain E — 1.1**  
Gap: Worker 独立生命周期有，但 Jobs/Goal 不耐久。P3 reconnect 处理的是 UI，不是 unattended run。缺 “Desktop quit vs product quit”。

**Chain F — 1.2**  
Gap: 方案禁止三层进程，而 subagent providers 需要 child processes。`MultiAgentRuntime` 若变成平行于 `ctx.subagents` 的新编排，1.2 必返工。

其他缺口：P1 无 Version Contract；P2 无 packaging-shaped launch；P5 无实验性排除规则；P8 仍把 full plugin 当 gate。

---

# Q. FUTURE V1.1 COMPATIBILITY

| Item | Status |
| -- | -- |
| Desktop 关、Worker 继续 | **NEEDS_SEAM**（方向对，缺 quit 语义与监督） |
| AutomationRuntime 接口位置 | **NEEDS_SEAM** |
| 把 Goal/Jobs/Schedule 当 Automation | **BLOCKER**（错误依赖） |
| Durable Automation 数据 | **NEEDS_SEAM**（Control Store namespace） |
| Approval 跨 reconnect | **NEEDS_SEAM**（应复用 Host pending，不自研） |
| Crash recovery of tools in flight | **NEEDS_SEAM**（Harness 只保证 interrupted turn 闭合，不保证工具副作用回滚） |
| Scheduler / login auto-start | 1.0 不做，**READY 只要不把 1.0 Worker 做成 SYSTEM service** |

整体：**NEEDS_SEAM**，若 F-13 不改则为 **BLOCKER**。

---

# R. FUTURE V1.2 COMPATIBILITY

| Item | Status |
| -- | -- |
| 多 provider（DeepSeek + 其他 LLM） | **READY**（`ctx.llm` adapters） |
| Codex / Claude Code 作为独立 agent | **READY** 若保留 subagent providers |
| ACP 外包运行时 | **READY** 作为 capability child，不是 UI 路径 |
| Reviewer isolation / fresh context | **NEEDS_SEAM**（用 spawn/ACP/SDK，不要同进程共享 inbox） |
| Council / Synthesizer 产品域 | **NEEDS_SEAM**（1.0 只保证 Worker 能编排多个 agent session） |
| “永远只有两个 OS 进程” | **BLOCKER** |

整体：当前方案若冻结“禁止 ACP child / 只有两进程”，则为 **BLOCKER**。若改为 C 边界，则为 **NEEDS_SEAM**。

---

# S. REQUIRED CORRECTIONS BEFORE DETAILED DESIGN

**BLOCKER**

1. **F-01 / F-02** — 废弃作为业务面的 `SHACO_FORGE_WORKER_PROTOCOL_V1`。以当前 Connection + Typert Remote 为 Desktop↔Host 合同。
2. **F-03** — Worker = `dsh` Host profile / `dsh-app-boot`，不是 internal import composition。
3. **F-05** — 收缩 plugin：无完整第三方 parity；默认关 dynamic Cordis。
4. **F-06** — 删除 Harness 数据 rollback 承诺；改为 pin + backup + fail closed。

**HIGH**

5. **F-07** — P0 收缩 Feature Parity Matrix（上表为起点）。
6. **F-08 / R** — 允许 Worker 下的 capability child processes；只禁 ACP 作为 UI 主路径。
7. **F-10** — Client boot / scheme / loopback / plugin bytes spike，写入 P1。
8. **F-11** — Packaging spike 提前；P2 用打包形态启动。
9. **F-12** — P1 威胁模型以 Worker/plugin/credentials/pipe 为中心。
10. **F-13** — 声明 Harness Goal/Jobs/Schedule ≠ 1.1 Automation。
11. **F-04** — Owner 明确：1.0 就拆双进程，还是同进程 Electron Host、1.1 再拆。无论哪种，协议都必须是 Connection。

**必要 MEDIUM**

12. **F-09** — Control Store 只存 Shaco control-plane。
13. **F-14** — at-most-once，无 exactly-once journal。
14. **F-15** — 冻 worker 身份、pipe 名、mutex、mismatch 行为。
15. **F-16** — custom scheme，不用裸 `file://`。

---

# T. ARCHITECTURE OWNER DECISIONS

这些无法只靠读 Harness 源码决定：

1. **1.0 是否必须 Desktop 关闭后 Worker 仍运行？**  
   要：两 OS 进程 + 监督。不要：可先做官方同进程 Electron Host，1.1 再拆。  
   审计建议：若 1.1 确定做 Automation，1.0 就拆，但不要为此发明新协议。

2. **1.0 对第三方 Harness plugin 的商业承诺到哪一级？**  
   建议：官方 in-box + 可选 pinned npm。不要 GitHub 任意插件。

3. **Windows 1.0 是否接受弱于 Linux 的 sandbox（restricted token）作为发布基线？**  
   这是风险接受，不是技术未知。

4. **产品退出语义：** 关窗口、托盘退出、停止后台 Worker、卸载，四者分别做什么。

5. **是否允许 1.0 带 `HARNESS_CORE_PATCH_COUNT > 0` 仅用于 carrier/loopback/scheme？**  
   建议：允许极小、编目、可上游化的 patch；禁止动 agent-loop/session 格式。

**不允许丢给 Owner 的（源码已确定）：**

- 不能把 ACP/SDK 当完整 GUI。
- 不能假设 session 格式可迁移。
- 不能假设 plugin 进程隔离。
- 不能按 apiproxy 设计现行协议。
- 不能把 headless profile 当长期 Worker。
- 不能把 Goal/Jobs/Schedule 当 1.1 Automation。

---

# U. FINAL READINESS

`SHACO_FORGE_V1_0_ARCHITECTURE_READY_FOR_DETAILED_DESIGN = NO`

`NEXT_ACTION = CORRECT_PRE_IMPLEMENTATION_ARCHITECTURE`

必须先关闭的 Finding ID：

- **F-01** 协议层错误  
- **F-02** 上游合同已变  
- **F-03** runtime 启动边界  
- **F-05** plugin 范围  
- **F-06** 不可交付的 rollback  
- **F-07** parity 过宽  
- **F-08** 1.2 进程模型冲突  
- **F-10** Client/Electron boot 未知数未 spike  
- **F-11** packaging 过晚  
- **F-13** 1.1 错误原语  
- **T-1 / F-04** 双进程时机的 Owner 决策  

修正并写回一页 **Architecture Decision Record**（Runtime = Option C；协议 = Connection；plugin = 缩范围；upgrade = pin/fail-closed）之后，才能开始：

`BEGIN_SHACO_FORGE_V1_0_P0_TO_P8_DETAILED_CONTRACT_DESIGN`

---

## Q1–Q21 直接回答

**Q1** 双进程作为产品基础 **可以正确**，前提是映射到 Host/Client，而不是 Desktop/Worker/第三协议。  
**Q2** per-user long-running Worker **合理**，尤其面向 1.1；1.0 就要则成本高。  
**Q3** Worker 内直接 composition **不是长期最优**，若指 internal import。长期最优是 Worker 作为 `dsh` Host。  
**Q4** ACP/SDK isolation **不**应做 1.0 UI 主路径；应做 1.2 capability children。  
**Q5** Named Pipe **适合**当 Windows 物理层。  
**Q6** 需要的是 **supervisor/carrier 合同**，不是平行的 Agent 协议。当前 V1 设计 **不必要且有害**。  
**Q7** 1.0 **不需要**自研 sequence/cursor/ledger；用 Connection generation + session seq。  
**Q8** 若 1.1 确定，**应该** 1.0 就支持；否则可推迟，但 P1 必须选定。  
**Q9** 小型 SQLite Control Store **合理**；大而全复制 Harness **不合理**。  
**Q10** Web Client **可以**适配 Electron，**不是**低成本；boot/plugin/auth/scheme 是主要成本。  
**Q11** custom scheme **比** `file://` **更合理**，尽管官方文档写了 file://。  
**Q12** 完整第三方 plugin **不应**进入 1.0 承诺。  
**Q13** Plugin frontend **会**成为重大阻塞，除非 1.0 关掉第三方 client 插件。  
**Q14** Feature Parity **过宽**。  
**Q15** P0–P8 **顺序基本对，依赖错**；缺 spike，P6/P7 过载，plugin/packaging/recovery 太晚。  
**Q16** Packaging **太晚**。  
**Q17** 当前 Upgrade/Rollback **不现实**。  
**Q18** 最易破：Remote/Typert、SessionEventMap、persistence version、client boot graph、profile 组成。  
**Q19** 足以支持 1.1 **仅当** Worker 独立 + Control Store namespace + 不滥用 Goal/Jobs/Schedule。当前文本 **不够**。  
**Q20** 足以支持 1.2 **仅当** 保留 subagent child processes。当前“只有两进程” **不够**。  
**Q21** 今天直接 coding 最可能大规模返工的五处：  
1. 自研 Worker 协议  
2. internal composition 而非 `dsh` Host  
3. 假设 Client 换 transport 即用  
4. 完整 plugin parity  
5. 按可回滚、稳定 API 的 Harness 做升级与数据模型  

本轮未改任何仓库、未生成代码、未进入 implementation。