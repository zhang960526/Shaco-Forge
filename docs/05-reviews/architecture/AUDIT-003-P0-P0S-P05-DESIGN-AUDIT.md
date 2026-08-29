上游仍是同一冻结点：`cd5ef814` / `0.1.2-alpha.1`。本轮结论针对的是这三阶段合同本身，不是再推翻 Desktop + Worker。

# A. FINAL VERDICT

**PASS_WITH_REQUIRED_CORRECTIONS**

`ALLOW_P0_EXECUTION = YES`  
`ALLOW_P1_DETAILED_DESIGN_AFTER_P0S = YES`

P0 / P0.S / P0.5 已经找对了该查的事实、该证的假设、该冻的兼容规则。不能原样开跑的原因是几处会让 Spike **测错对象** 或让 P1 **冻错合同** 的缺口，不是总体方向错误。

修正后即可开始 **P0 只读执行**。P1 仍必须等 `SHACO_FORGE_V1_0_P0S = PASS`。

---

# B. EXECUTIVE SUMMARY

这三阶段设计质量 **高**，且正确承接了上一轮 corrective architecture：

- P0 冻 exact baseline、真实 `dsh web` 组成、Connection 面、信任模型、可测试 parity、依赖分级。  
- P0.S 用一次性原型打最危险假设，失败有 Fallback A/B。  
- P0.5 把 pin / handshake / fail-closed / 无 Harness down-migration 放到 P1 之前。

必须改的几件事：

1. **P0 规则不能禁止 pin 工作区里的 `pnpm install`/`build`**，否则无法 `--dump-config`。  
2. **Web 的工具不在 host 平面，而在 `standard` preset。** Host spike 若不挂 preset，会得到一个“能启动但没有 shell/fs/subagent”的假 Worker。  
3. **P0.S 不要把 OPTIONAL UI 当 Hard Gate**；Hard Gate 应证明 carrier + boot + 双进程 + 打包，而不是 P5 全量 parity。  
4. **Exact Fetch 作为架构 Hard Gate**（证明二进制通道存在），不要绑死 `/export` 是否 REQUIRED。  
5. **P0.5 版本号和升级状态机要收**；handshake 前必须 fail-closed。补 `DSH_HOME_MISMATCH`、备份失败/磁盘满、Worker 用 **Node sidecar vs Electron ABI**。  
6. **Named Pipe 预标为 `SHACO_CUSTOM_CARRIER_PLUGIN`**，除非 spike 证明有文档化 seam。

没有发现“风险没放进 Spike、Gate 测不出关键假设、兼容合同允许错误版本写数据”这类应直接 FAIL 的问题。

---

# C. CURRENT UPSTREAM BASELINE

| Item | Value |
| -- | -- |
| Repository | `https://github.com/deepseek-ai/deepseek-harness` |
| Branch | `master` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Commit date | 2026-08-27T16:57:43Z |
| Release | `dsh@0.1.2-alpha.1` |
| Package version | `0.1.2-alpha.1` |
| Node | `^22.19.0 \|\| >=24.0.0` |
| pnpm | `11.7.0` |
| TypeScript | `^6.0.3` |

**Changes Since Previous Audit:** 无。`CHANGED_SINCE_LAST_AUDIT = NO`。P0/P0.S/P0.5 不必因上游漂移改方向。

本轮额外核实、必须写进 P0 执行的事实：

- Client↔Host 现行层：`remotes → gateway → connection → webserver`。apiproxy 仍不存在。  
- Connection：unary HTTP POST、`/api/remote.mux` 或 **in-process `connection.rpc.open`**、exact Fetch、cookie + Host/Origin、`$events` ready generation。  
- `dsh-web-app` **禁用** host 平面 `tool-bash`/`tool-pwsh`/`tool-fs`/`tool-subagent*` 等，改由 **`dsh-agent-presets` default `standard`** 按 session 组成。  
- Custom profile 默认 `patchReload: live`；长期 Worker 必须 `startup`。  
- Landlock native 是 **Linux**；Windows 走 `sandbox-windows-acl`。打包 spike 不得拿 landlock 当 Windows 失败条件。  
- `dump-config` **不是**稳定序列化合同（app-boot 已说明）。P0 要保留 yml 源，不能只存一份 dump 文本。  
- 命令是动态注册的 `@Remote list/execute`，没有一份静态“官方命令全集”。Core commands 必须从 **web + standard preset 实树**列出。

---

# D. P0 REVIEW

### P0-1 Upstream Baseline Freeze — **MODIFY**
KEEP 身份字段。补：

- `pnpm-lock.yaml` 内容 hash（必要）。  
- `HarnessDistribution`：`git-worktree` vs `npm-packed @deepseek-ai/dsh`（P0.S 打包测的是后者）。  
- Windows：`WindowsVersion` + **`CpuArch`（x64/arm64）**。1.0 可先只承诺一种 arch，但要写明。  
- Electron/Chromium：**不属于 Harness baseline**，放 P0.5/P0.S 产品 runtime pin。  
- 不要冻完整 dependency tree dump；lockfile hash 足够。  
- `SelectedAt`、clean worktree、禁止事后 `git pull master`：KEEP。

### P0-2 Web Composition Census — **MODIFY**
KEEP dump-config + 分类枚举。必须 **SPLIT** 出：

- Host 平面行  
- **`standard` preset `agent.cordis.yml` 行**（真正的 tool/command 平面）

否则 `SHACO_FORGE_HOST_COMPOSITION_CANDIDATE` 会抄成“无工具的 web 壳”。  
`dump-config` 与 `dsh-base`/`dsh-web-app` yml **对照保存**。  
Candidate 仅供 P0.S：KEEP。

### P0-3 Client↔Host Contract Census — **MODIFY**
KEEP 七张 Surface。权威源应是：

- `@deepseek-ai/dsh-api-remotes` 生成 Remote  
- Connection 路由登记  
- 包 README / 测试  

禁止 2026-07-19 apiproxy note。  
补：`connection.rpc.open` vs WebSocket mux；**uploads**（body 缓冲 300MiB）；directory picker 是 **capability/Remote，不一定是 Fetch**；boot 全局名是 `window.__DSH_BOOT__`。  
Prompt 里的 `window.**DSH_BOOT**` 是笔误，P0 执行时改正。

### P0-4 Trust Surface — **MODIFY**
KEEP 清单。必须 **定位源码**：`isLoopbackHostname` / `api-request-trust.ts` / settings 是否随 loopback 降级为内存。这是 Client boot spike 的 canary，不能只写“调查 loopback”。  
分清：Web token/cookie/Origin = WEB_TRANSPORT；Connection FetchHandler 信任挂钩可能仍在 Host 半边。

### P0-5 Feature Parity Matrix — **MODIFY**
KEEP 列结构与禁止模糊词。  
**先 P0-2（含 preset）再填 Classification。** 不得把 prompt 候选表直接冻成 `CORE_PARITY_SCOPE_FROZEN`。  
Core commands / core subagent 必须展开为 **真实名字**（见 F 节修正稿，P0 执行后替换为 dump 结果）。

### P0-6 Dependency Matrix — **KEEP**（小改）
必要。明确：**生成的 `./remote` / `./typert` 是 DOCUMENTED_PRODUCT_SEAM，不是 FORBIDDEN。** FORBIDDEN 是 `packages/**/src` 深 import、test-support、experimental、生产 SRC fallback。

### P0-7 Risk Register — **MODIFY**
RISK-01…12 正确且能驱动 Spike。补 RISK-13…（见 Q）。  
每项 Spike Acceptance 必须是 **可证伪句子**，不能是“大致能连”。

---

# E. P0 MISSING ITEMS

1. **允许 pin 工作区 install/build**（否则 P0-2 无法执行）。  
2. **standard preset census**。  
3. **Exact Fetch 路由实表**（不要假设 `packages/session/session-log-export` 路径；当前该路径 404，真实包名以 dump/源码为准）。  
4. **Loopback 分类器源码位置**。  
5. **Persistence 默认 JSONL vs 可选 SQLite**（影响 native addon）。  
6. **Windows vs Linux native 矩阵**（landlock ≠ Windows）。  
7. **`patchReload` 默认 live vs Worker 必须 startup**。  
8. **Preset 与 host 平面拆分** 写入 Composition Map。  
9. Gate：`P0_STANDARD_PRESET_KNOWN`、`P0_EXACT_FETCH_ROUTES_ENUMERATED`、`P0_LOOPBACK_CLASSIFIER_LOCATED`。

---

# F. P0 FEATURE PARITY REVIEW

在 P0-2 完成前，这是 **约束性候选**，不是已冻结表。P0 执行必须用实树替换“待 dump”项。

### REQUIRED（1.0 Core Desktop Baseline）

| Feature | User Behavior | Notes |
| -- | -- | -- |
| DeepSeek provider | 保存官方 API key 后可发会话 | |
| Credentials store | key 进 Harness credentials，不是 Control Store | |
| Default + session model | 能选当前部署提供的 DeepSeek 模型 | |
| Workspace select/create | 选一个存在的目录作为 cwd | native picker |
| Session create | 在 workspace 下建会话 | 走 preset `standard` |
| Session list | 看到持久会话 | |
| Session history | 打开已有会话看到既往消息 | Remote/history，非 Desktop 权威 |
| Session continue/resume | 冷会话可继续；lookup 由 Host resume | Desktop 不自建 resume |
| Conversation text streaming | 用户文本 → assistant chunk → 结束 | |
| Tool execution | 模型能调 **standard preset 实装工具** | 待 dump 确认 |
| Filesystem tools | 读/改 workspace 文件（sandbox 政策下） | preset 行，非 web host 平面 |
| Windows shell | PowerShell 工具可用 | `tool-pwsh` 在 preset，win32 |
| Permission presets | 能看/切当前 session 权限档 | |
| Approval | 敏感操作弹出，Allow/Reject 后 Host 继续 | |
| User questions | 若 standard/web 实树启用则为 REQUIRED，否则 OPTIONAL | **P0 必须确认，不得猜测** |
| Settings UI | 打开并持久化（非 loopback 内存降级） | spike canary |
| Core commands | 见下，仅最小集 | 动态注册 |
| Core in-process subagent | 见下 | |
| Persistence | 重启 Worker 后会话仍在 | JSONL 默认 |
| Desktop reconnect projection | 关窗/崩溃后重连恢复投影 | 产品行为，依赖 Connection generation |

**Core commands（P0 必须用 `commands.list` 对 standard agent 核实；下列为当前源码已知，不是完整表）：**

| 命令 | 1.0 |
| -- | -- |
| 会话内发消息（非 slash） | REQUIRED |
| `/model` 或等价模型选择命令 | REQUIRED **若** web 用命令而非仅 UI；P0 确认 |
| `/compact` | OPTIONAL（compaction） |
| `/export` | OPTIONAL（exact Fetch） |
| `/plan` | OPTIONAL |
| `/goal` | OPTIONAL（host 上 `command-goal` 被 web 禁用，preset 可能再挂） |

**Core in-process subagent：**

- Provider：`dsh-subagent-spawn-in-process`（及 fork，若 standard 包含）  
- **不是** ACP/Codex/Claude/SDK  
- Tools：preset 中的 `tool-subagent` / `tool-subagent-fork` / control·list **以 `presets/standard/agent.cordis.yml` 为准**  
- 子 agent 加入 **父 preset 组成**（upstream 已写明）

### OPTIONAL
Plan、Compaction UI、`/compact`、Workflow、Ralph、Jobs（process-local）、Goal、Skills、Feedback、Fork、Attachments/Images、Agent preset 切换/编辑、Deliverables、Export ZIP、pi-ai extra providers、ACP/Codex/Claude/SDK providers、Trajectory、PTC/code-runtime、Plugin settings 页。

### DEFERRED
tool-cordis；任意第三方 plugin；GitHub plugin；hot reload；webhook。

### WEB_ONLY
webserver、openBrowser、token URL、LAN trustedHosts、client-hmr、`DSH_WEB_URL`。

### EXPERIMENTAL / NOT_PRODUCT
Agent Teams、E2B、Inspector、Shaco Automation 域。

**不要把 Images/Export 放进 REQUIRED**，否则 Exact Fetch/大 body 变成产品门而不是架构门。架构上仍要在 P0.S **证明二进制通道**（I 节）。

---

# G. P0 DEPENDENCY REVIEW

**Allowed / 应依赖**

| Seam | Class |
| -- | -- |
| `dsh --profile` + profile/bundle/`cordis.patch.yml` | DOCUMENTED_EXTENSION_SEAM |
| `dsh-app-boot` via official launcher | DOCUMENTED_PRODUCT_SEAM |
| `dsh-base` + 自有 host bundle | DOCUMENTED_EXTENSION_SEAM |
| `dsh-agent-presets` + shipped `standard` | DOCUMENTED_PRODUCT_SEAM |
| Connection FetchHandler / rpc.call / rpc.open | PREVIEW_PUBLIC_API（换 carrier 已文档化；**Pipe 未交付**） |
| `dsh-api-gateway` / remotes / session\|settings\|workspace-controller | PREVIEW_PUBLIC_API |
| 生成的 `./remote`、`./typert` | DOCUMENTED_PRODUCT_SEAM |
| Session/persistence/credentials/settings/workspace/approval/permission | PREVIEW_PUBLIC_API |
| `ctx.subagents` providers | DOCUMENTED_EXTENSION_SEAM |

**Dangerous（adapter only，P0.S 分类）**

- Connection Host 与 `webServer`/`webRuntime`/`BrowserAuth` 的耦合  
- Client loopback 分类  
- client-modules `/plugins` combo  
- `__DSH_BOOT__` 仅经 webserver index inject  
- directory-picker-auto 的 display/SSH 探测  

**Forbidden**

- `packages/**/src` 跨包深 import  
- test-support、experimental 进产品组成  
- 生产 SRC（tsx）当发行 Worker  
- 绕过 `dsh` 的 undocumented boot  
- 把 `dump-config` 当 runtime API  

**Upgrade-sensitive**

`SessionEventMap` / persistence version、Typert Remote 描述符、Connection 鉴权、boot graph、preset 文件、profile 整行替换语义。

---

# H. P0.S REVIEW

### P0.S-1 Host profile — **MODIFY**
KEEP 去 webserver/HMR/token URL、`patchReload=startup`。  
**必须挂 `dsh-agent-presets` + `standard`。** 否则工具全灭。  
Connection Host / FetchHandler 无 webserver：KEEP 为关键假设。  
Gate 增加：`HOST_STANDARD_PRESET_TOOLS_PRESENT = PASS`。

### P0.S-2 Electron Client boot — **MODIFY**
KEEP custom scheme、sandbox 硬约束、对比 file://。  
Hard Gate 收成：scheme 能加载 dist、Client 初始化、**Settings 持久（loopback canary）**、能进会话 UI。  
Workspace/model 全套 UI：**不要**当 boot Hard Gate（属 P4/P5）。

### P0.S-3 Local carrier + trust — **KEEP**
拓扑正确。预标 Named Pipe = **`SHACO_CUSTOM_CARRIER_PLUGIN`**。  
补：单 pipe 上 unary+stream 并发；payload 上限；framing 记入 evidence，细节冻在 P1。

### P0.S-4 Feature completeness — **MODIFY**
KEEP unary/stream/approval/cancel/generation。  
Exact Fetch：**架构 Hard Gate** = 任意一条真实二进制往返，优先最小附件或假 ZIP；**不要**把产品 `/export` 当唯一门。  
Native picker：Workspace REQUIRED ⇒ **Hard**。  
User Question：仅当 P0 列为 REQUIRED。  
Boot graph：若 P0.S-6 方案 A（静态打包）PROVEN，Boot Graph HTTP **不必** Hard。

### P0.S-5 Reconnect — **MODIFY**
KEEP 关窗/崩溃/重连/禁止重复 resume/禁止 approval 重放。  
**ADD：** 第二 Desktop 实例（拒绝或附着同一 Worker）；Worker 重启时 Desktop 已连接。

### P0.S-6 Client modules — **KEEP**
方案 A 优先正确。Dynamic Cordis 四件拆分正确。  
默认：tool-cordis REMOVE；runner/UI 非 boot 依赖则 REMOVE。

### P0.S-7 Packaging — **MODIFY**
KEEP fresh Windows、无 Node、无 pnpm。  
**必须在 spike 结束时选定** Worker = **bundled Node sidecar** 还是 Electron utility（ABI 不同）。  
ADD：JSONL 默认路径；Windows ACL sandbox 非 landlock；asar unpack；`DSH_HOME` 在用户可写位置；arch 政策。  
Code signing 非 P0.S Hard Gate。

### P0.S-8 Closure — **KEEP**
`PROVEN_WITH_CONSTRAINT` + `Core Patch Required?` 是正确输出，不是“能跑的原型接着写”。

**不必 ADD 新大步。** 不必 REMOVE 任一步。S-4/S-2 缩小 Hard Gate 即可。

---

# I. P0.S HARD GATE REVIEW

**必须 Hard（不过不能冻 P1）**

| Gate | Why |
| -- | -- |
| HOST_PROFILE_WITHOUT_WEBSERVER 或文档化失败 + Fallback A | Worker 边界 |
| HOST_LONG_RUNNING + STANDARD_PRESET_TOOLS | 否则假 Host |
| ELECTRON_RENDERER_BOOT + CUSTOM_SCHEME + NODE_INTEGRATION_OFF | Client |
| SETTINGS_PERSISTENCE_NOT_MEMORY | loopback/trust |
| NAMED_PIPE_CARRIER 或正式走 Fallback A | 拓扑 |
| CURRENT_USER_ONLY + COOKIE_NOT_PRODUCT_IDENTITY + NO_RENDERER_PIPE | trust |
| UNARY + STREAM + APPROVAL + CANCEL + GENERATION | Connection 语义 |
| BINARY_CARRIER_PASS（任一条 exact/binary） | 通道完整性 |
| NATIVE_PICKER_OR_DOCUMENTED_DESKTOP_EQUIVALENT | Workspace REQUIRED |
| DESKTOP_CLOSE/CRASH_SURVIVES + RECONNECT + NO_DUP_RESUME + NO_APPROVAL_REPLAY | D1/D2 |
| INBOX_CLIENT_MODULES（方案 A 或 B） | 无 `/plugins` |
| NO_SYSTEM_NODE/PNPM + PACKAGED_WORKER/HARNESS + DSH_HOME | 发行形态 |
| HARNESS_CORE_PATCH_REQUIRED 显式 YES/NO + 清单 | 升级 |

**OPTIONAL / 可 DEFER**

- `/export` 产品 ZIP、图片会话、Workflow、Jobs、Goal、plugin 页、ui-cordis、多 arch、code signing、HMR、token URL（应删除而非测试）。  
- User Question：仅 REQUIRED 时 Hard。  
- HTTP `/plugins`：方案 A 成功则 DEFER。

---

# J. CONNECTION / TRUST SPIKE REVIEW

| Topic | Verdict |
| -- | -- |
| Renderer→Main IPC→Pipe→Worker | 正确；Renderer 禁止碰 pipe |
| Named Pipe | Shaco carrier plugin，直到证明相反 |
| SID ACL | 1.0 身份主证据 |
| Worker identity | handshake 在 Agent Connection 之前（P0.5）；spike 用最小 hello |
| Cookie | 正式身份必须移除；Fallback A 若暂留 cookie 必须写 CONSTRAINT 且仅 loopback |
| Streaming/cancel | in-process `rpc.open` 语义映射到 pipe，不要自研 WS |
| Exact/binary | Hard 为通道，不为 export 产品 |
| Boot graph | 方案 A 可绕过 Worker `/plugins` |
| Reconnect | generation ready + history；Desktop 不 resume |
| Loopback | custom scheme 必须被当成 trusted；Settings 为 canary |

---

# K. PACKAGING SPIKE REVIEW

`PACKAGING_SPIKE_SCOPE_SUFFICIENT = NO`（差几项就会测错，补上则够）

缺失：

1. Worker 运行时是 **官方 Node sidecar** 还是 **Electron ABI**（native addon）。  
2. 默认 persistence **JSONL**，不要默认拉 SQLite native。  
3. Windows sandbox ≠ landlock。  
4. 1.0 **单一 arch** 政策（建议 x64 first）。  
5. `DSH_HOME` 与安装目录分离、可写 ACL。  
6. 打包后 `node_modules` 闭包 / module fallback，运行时无 pnpm。  
7. asar：**native 与可 spawn 的 dsh 必须 unpack**。  
8. 子进程 PATH（pwsh、sandbox helper）。

有这些之后，Fresh VM 无 Node **应当是 Hard Gate**。

---

# L. P0.S FAILURE BRANCH REVIEW

`FAILURE_BRANCH_SUFFICIENT = YES`（小补）

- **Fallback A**：保持双进程；HTTP 仅 127.0.0.1；Desktop 为唯一客户端。仍应尽量不用 cookie 当产品身份；若必须用，标 `PROVEN_WITH_CONSTRAINT`。  
- **Fallback B**：Host 进 Main，放弃关窗保活；**必须 Owner 重批 D1/D2**。KEEP。  
- **不需要第三 Fallback。** A 的变体（Pipe 封装 FetchHandler，底下仍是 loopback HTTP）算 A，不要新开一条产品路径。  
- 失败必须 `P0S = FAIL` 回 Owner，禁止边写边改架构：KEEP。

---

# M. P0.5 REVIEW

| Item | Action |
| -- | -- |
| Version Identity | **MODIFY / SIMPLIFY** |
| Compatibility Matrix | **MODIFY** |
| Handshake | **KEEP**（小改） |
| Fail-Closed | **KEEP** |
| Upgrade Transaction | **MODIFY** |
| Backup/Restore | **MODIFY** |
| Capability Negotiation | **DEFER** 大部分到 P1 |

**Version：** KEEP 六元组（Product/Desktop/Worker/Carrier/HarnessBaseline/ControlStoreSchema）。HarnessBaseline = package version + commit（+ lockfile hash 附件）。

- ElectronVersion、NodeRuntimeVersion：作为 **发行 pinned runtime**，放进产品清单，**不要**进每次 handshake。  
- ClientAssetVersion：静态进 Desktop 则含在 DesktopVersion。  
- HostProfileVersion：含在 Worker/Product。  
- PluginBaselineVersion：1.0 in-box ⇒ **REMOVE**。  
- ProtocolCompatibilityVersion：= Carrier **major** ⇒ **REMOVE** 重复。

**Matrix：** KEEP 保守 exact baseline。ADD：`DESKTOP_TOO_OLD`、`DSH_HOME_MISMATCH`。  
`HOST_PROFILE_MISMATCH` / `CLIENT_ASSET_MISMATCH`：若身份已折进上述版本则不要再加码。  
不确定 ⇒ 不建 Agent 写入路径。

**Handshake：** Supervisor hello **先于** Harness Connection。Worker 回传字段 KEEP。Desktop 给 expected baseline KEEP。禁止塞 Session API。

**INCOMPATIBLE：** 允许 **只读诊断**（版本、日志路径），**禁止**任何 Harness 用户数据写。KEEP。

**Upgrade：** 1.0 按 **安装器替换** 建模，不要 DOWNLOAD/VERIFYING，除非已做自动更新。KEEP CHECK→DRAIN→BACKUP→STOP→INSTALL→MIGRATE CONTROL STORE→START→HEALTH→COMPAT→COMMIT。  
Drain 政策：CANCEL / WAIT / ABORT，禁止静默强杀。  
状态机 KEEP 主干；ADD `ABORTED`（用户取消）；`AWAITING_USER` 作为 DRAINING 原因，不必独立状态。STOPPING_OLD/STARTING_NEW 并入 INSTALLING/VALIDATING。

**Backup：** 1.0 **整份 `DSH_HOME` + Control Store**（可排除可再生 cache）。必须含 credentials、settings、sessions、attachments、profiles。备份含密钥 ⇒ ACL 仅当前用户。  
ADD：备份失败、磁盘满、备份中 Worker 崩溃 ⇒ 不 COMMIT，保持旧二进制。损坏备份 ⇒ `RESTORE_FAILED` + 人工。

---

# N. UPGRADE POLICY REVIEW

`UPGRADE_CONTRACT_SAFE = YES`（补备份失败路径后）

闭合：pin exact baseline；只 migrate Control Store；Harness 数据只备份不 down-migrate；失败 = 旧二进制 + 升级前备份；无备份且新格式已写 = fail-closed。  
P0.5 必须写清：**DRAIN 成功前不得 INSTALL。**

---

# O. CROSS-STAGE CONTRACT GAPS

**Chain A** 闭合，若 P0-1 区分 git SHA 与 packed 发行。  
**Chain B** 闭合，若 P0.S 测 FetchHandler/rpc.open 而非自研 RPC。  
**Chain C** 有缺口：P0-4 必须找到 loopback 源码；handshake ≠ pipe ACL（握手是兼容，ACL 是身份）。  
**Chain D** 有缺口：Exact Fetch 架构门 vs `/export` 产品门必须分开，否则 P5 倒逼 carrier。  
**Chain E** 有缺口：Host candidate **漏 preset** 则 P2 无工具。  
**Chain F** 闭合，若备份粒度与损坏/磁盘满写入 P0.5。  
**Chain G** 闭合，若方案 A 成功则 P6B 可 DEFER 动态 client。

`P0_CROSS_STAGE_CONTRACT_GAP` 汇总：Preset 漏查；P0 禁止 install；loopback 源码；二进制门 vs export 门；DSH_HOME mismatch；Node vs Electron ABI。

**无循环依赖。** 顺序 P0 → P0.S → P0.5 → P1 正确。P0.5 部分草稿可与 P0.S 并行，但 **冻结必须在 P0.S 之后**（carrierVersion/capabilities 来自 spike）。

---

# P. OVER-DESIGN FINDINGS

| Item | Action |
| -- | -- |
| 8+ handshake 版本号 | **SIMPLIFY** 到 6 + runtime pin 附件 |
| P0.5 全量 capability 市场 | **DEFER**；P0.5 最多 `exactFetch`/`nativePicker` |
| Upgrade DOWNLOAD/细粒度状态 | **REMOVE**（安装器驱动时） |
| P0.S 测全部 OPTIONAL UI | **SIMPLIFY** |
| P0 冻完整 node_modules 树 | **REMOVE**；lockfile hash 足够 |
| 为 1.2 在 P0.5 做 Codex capability | **DEFER** |
| 同时产品化 custom scheme 与 file:// | **KEEP** scheme；file:// 仅对比 |

---

# Q. MISSING RISKS

只列会影响合同的：

1. **Worker Node sidecar vs Electron native ABI**  
2. **Host 无 standard preset ⇒ 无工具**  
3. **多 Desktop 实例 / stale pipe / PID reuse**  
4. **`DSH_HOME` 不一致或装在只读/同步盘/长路径/Unicode 路径**  
5. **备份含 `.credentials.yaml`；备份失败仍升级**  
6. **JSONL 文件锁；升级中途写入新 session 格式**  
7. **Connection 300MiB 内存缓冲 → pipe DoS**  
8. **Windows AV 锁 node.exe / 未签名二进制**（P7 为主，P0.S 观察即可）  
9. **directory-picker-auto 在无交互桌面的 Worker 上选错 native/browse**  
10. **第二会话 Windows Fast User Switch**（每用户一 Worker；pipe 名含 SID）

不要把多显示器等做成 P0 合同。

---

# R. FINDINGS

### F-P0-01
**Severity:** BLOCKER  
**Phase:** P0 执行规则  
**Problem:** “禁止安装会改变 baseline 的依赖”会禁止 pin SHA 工作区的 `pnpm install`/`build`，P0-2 dump-config 无法做。  
**Evidence:** dump-config 需要可启动的 `dsh`；app-boot 是真实组成源。  
**Failure Scenario:** P0 只靠 README 冻组成，P0.S Host 抄错。  
**Required Correction:** 允许 **仅在 pinned worktree** install/build；禁止 `git pull`、改 lockfile、升级依赖。  
**When:** P0 开始前。

### F-P0-02
**Severity:** HIGH  
**Phase:** P0-2 / P0.S-1  
**Problem:** Web 工具在 `standard` preset，不在 host 平面。  
**Evidence:** web-app 禁用 tool-*；`dsh-agent-presets` default `standard`。  
**Failure Scenario:** “无 webserver Host”启动成功但不会 shell/fs。  
**Required Correction:** Composition Map + spike 必须含 preset；Gate `HOST_STANDARD_PRESET_TOOLS_PRESENT`。  
**When:** P0-2 与 P0.S-1 合同。

### F-P0-03
**Severity:** HIGH  
**Phase:** P0-4 / P0.S-2  
**Problem:** Trust 审计未强制找到 loopback 分类器；settings 内存降级是已知桌面坑。  
**Evidence:** connection README；社区 Electron `file://` hostname 空。  
**Failure Scenario:** Client “能开”，设置不落盘，P4 才发现。  
**Required Correction:** P0 记录源码符号；P0.S Hard Gate：Settings 持久。  
**When:** P0-4、P0.S-2。

### F-P0-04
**Severity:** HIGH  
**Phase:** P0.S-4 / P0-5  
**Problem:** 用产品 Export 当唯一 Exact Fetch 门，或漏掉二进制通道。  
**Evidence:** Gateway：非 JSON 走 exact Fetch；export 应为 OPTIONAL。  
**Failure Scenario:** Chat 过关，附件/下载 P5 爆炸；或 OPTIONAL 功能卡住架构。  
**Required Correction:** `BINARY_CARRIER_PASS` 与 `/export` 产品验收分离。  
**When:** P0.S Gate 表。

### F-P0-05
**Severity:** HIGH  
**Phase:** P0.S-7  
**Problem:** 未在 spike 强制选定 Worker 的 Node vs Electron ABI。  
**Evidence:** landlock/optional native；Windows ACL 另套。  
**Failure Scenario:** P7 才发现 addon 为错 ABI，Worker 形态返工。  
**Required Correction:** P0.S-8 必须 PROVEN 一种策略。  
**When:** P0.S-7/8。

### F-P0-06
**Severity:** HIGH  
**Phase:** P0.5  
**Problem:** 缺 `DSH_HOME_MISMATCH`、备份失败/磁盘满、升级中崩溃。  
**Evidence:** 两 Desktop 可指不同 home；备份含 secrets。  
**Failure Scenario:** 连错 Worker 写会话；半升级不可 restore。  
**Required Correction:** 矩阵 + 备份合同补上；失败不 COMMIT。  
**When:** P0.5 冻结前。

### F-P0-07
**Severity:** MEDIUM  
**Phase:** P0.S-5  
**Problem:** 未测第二 Desktop / stale pipe。  
**Evidence:** 单实例是产品合同，不是 Harness 提供的。  
**Failure Scenario:** 两个窗口两个“权威投影”。  
**Required Correction:** spike：第二实例 fail-closed 或附着同一 Worker。  
**When:** P0.S-5。

### F-P0-08
**Severity:** MEDIUM  
**Phase:** P0.5  
**Problem:** 版本号与 capability 谈判过早铺开。  
**Evidence:** Client/host 本就绑定发行；Carrier major 已是协议代次。  
**Failure Scenario:** handshake 无法实现或永远 INCOMPATIBLE。  
**Required Correction:** 六元组；capability 最小集。  
**When:** P0.5 简化。

### F-P0-09
**Severity:** MEDIUM  
**Phase:** P0-3  
**Problem:** session-log-export 路径假设可能错（本轮 404）。  
**Evidence:** 原始路径 fetch 404。  
**Failure Correction:** P0 用 dump/源码枚举 exact Fetch，禁止猜路径。  
**When:** P0-3。

### F-P0-10
**Severity:** LOW  
**Phase:** P0-3  
**Problem:** `__DSH_BOOT__` 在 prompt 中写错。  
**Required Correction:** 合同用正确全局名。  
**When:** P0 文档。

---

# S. REQUIRED CORRECTIONS

**BLOCKER**

- **F-P0-01** — 允许 pinned worktree 的 install/build。

**HIGH**

- **F-P0-02** — preset 纳入组成与 Host spike。  
- **F-P0-03** — loopback 源码 + Settings 持久 Gate。  
- **F-P0-04** — 二进制通道 Hard Gate ≠ export 产品。  
- **F-P0-05** — 选定 Worker runtime ABI。  
- **F-P0-06** — DSH_HOME mismatch + 备份失败 fail-closed。

**必要 MEDIUM**

- **F-P0-07** — 多 Desktop / stale pipe。  
- **F-P0-08** — 收缩 P0.5 身份与 capability。  
- **F-P0-09** — Exact Fetch 实表，不猜包路径。

---

# T. FINAL P0 READINESS

`SHACO_FORGE_V1_0_P0_DESIGN_READY = YES`  
（执行规则按 F-P0-01/02 修正后）

`SHACO_FORGE_V1_0_P0S_DESIGN_READY = YES`  
（Hard Gate 与 preset/ABI/二进制门按上表修正后）

`SHACO_FORGE_V1_0_P05_DESIGN_READY = YES`  
（简化版本号并补 mismatch/备份失败后）

`NEXT_ACTION = FREEZE_P0_P0S_P05_CONTRACTS_AND_BEGIN_P0_EXECUTION`

将 S 节写入三阶段合同后，立即开始 **P0 只读调查**（pinned clone/install/dump-config）。**不要**开始 P1 freeze，**不要**把 spike 原型当产品。

---

## Q1–Q30

**Q1** 合理。  
**Q2** 有：preset 平面、loopback 源码、JSONL vs sqlite、Windows native 矩阵、P0 install 许可。  
**Q3** 够，必须加上 preset。  
**Q4** 覆盖了主面；补 rpc.open、uploads、picker 非 Fetch。  
**Q5** 足以支撑设计；必须把分类器查到源码。  
**Q6** 候选仍略宽；Images/Export 应 OPTIONAL。  
**Q7** 有必要。  
**Q8** 能驱动 P0.S；补 preset/ABI。  
**Q9** 八步合理。  
**Q10** 加上 preset 后足以验证 Worker 边界。  
**Q11** 完整但 Hard Gate 应缩小。  
**Q12** 正确。  
**Q13** 足够；cookie 不得当产品身份。  
**Q14** 二进制与 picker 已列；并发与背压应记 evidence。  
**Q15** 架构上必须 Hard；产品 export 不必。  
**Q16** 核心覆盖了；加多 Desktop。  
**Q17** 应从 1.0 **核心路径移除**；四件拆分后非 boot 依赖则 REMOVE。  
**Q18** 够早；ABI 决策必须在本阶段做完。  
**Q19** **应该**是 Hard Gate。  
**Q20** 合理；不需要第三 Fallback。  
**Q21** 是：P0.S 之后、P1 之前冻结。  
**Q22** 六元组够；再加会过量。  
**Q23** 未过量；不要塞 Session API。  
**Q24** 安全；补备份失败。  
**Q25** 整 DSH_HOME+Control Store 合理。  
**Q26** 分离正确。  
**Q27** DSH_HOME mismatch、多实例、ABI。  
**Q28** 无循环；P0.5 冻结依赖 P0.S 证据。  
**Q29** 不必新 Phase；P0-2 内加 preset census。  
**Q30** **可以**在修正合同后进入 P0 执行；P1 仅在 P0.S PASS 之后。

本轮未实施、未改仓库、未生成产品代码。