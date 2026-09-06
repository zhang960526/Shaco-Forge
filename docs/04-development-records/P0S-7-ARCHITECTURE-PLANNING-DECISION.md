# P0.S-7 Architecture Planning Decision

| Field | Value |
|---|---|
| Planning Decision ID | `P0S7-ARCHITECTURE-PLANNING-20260905-01` |
| Document Type | `ARCHITECTURE_PLANNING_DECISION_RECORD` |
| Status | `PLANNING_ONLY` |
| Decision Date | `2026-09-05` |
| Planning Owner Role | Shaco Forge P0.S-7 Architecture Planning Owner |
| Planned Stage | P0.S-7 — Packaged Runtime Feasibility & Controlled Execution Validation |
| Stage State | `NOT_STARTED` |
| Execution Authorization | `NOT_AUTHORIZED` |
| P0S7_ALLOWED | `NO` |
| Current Authorized Deliverable | 仅创建本架构规划决策文档 |

**本 Decision 不启动 P0.S-7。** 本文完成供后续审查和受控实现使用的架构规划，不创建 Runtime、执行合同、Snapshot、Binding、签名或 Invocation，不授予构建、依赖准备、测试、启动和恢复权限。文中的组件、目录、字段、场景及验收要求均为未来设计，不是已存在工件或已完成验证。

## 0. Planning Basis and State Precedence

### 0.1 必读依据

| Ref | 已读取文档 | 本规划采用的内容 |
|---|---|---|
| B1 | [P0.S Feasibility Spike](../03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md) | P0.S-7 调整目标；fresh Windows、packaged Worker / Harness、native、路径、runtime strategy 与现有 Hard Gate |
| B2 | [V1.0 Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md) | P0.S-7 / P0.S-8 新目标；P0.5、P1 与生产实现的阶段边界 |
| B3 | [Roadmap Reconciliation Decision](P0S-ROADMAP-RECONCILIATION-DECISION.md) | `P0S-ROADMAP-RECONCILIATION-20260905-01`；继承 Trust、Snapshot、Binding、Evidence 模型，不迁移执行授权 |
| B4 | [P0.S-6 Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | 单向身份依赖、独立 Trust Root、精确 Payload、实际 Binding 入口、Evidence First 与 Fail Closed |
| B5 | [Current State — Latest Final State](../00-governance/SHACO-FORGE-CURRENT-STATE.md#p0s-6-technical-validation-extension-final-closure-state-2026-09-05) | 当前 P0.S-6 已关闭、Candidate 未应用、Runtime 未进入、P0.S-7 未授权 |

本次读取的工作区字节身份如下。B1、B2 已有修改，B3 为已有未跟踪文件；这些字节是规划输入，不能用 HEAD 中的旧内容替代。此表用于规划溯源，不是执行冻结或 Authority Anchor 选择。

| Ref | Bytes | SHA-256 |
|---|---:|---|
| B1 | 44008 | `fb9c757f59ee201a92f51401953f006a9de0df4da74bf36025d89933639c1295` |
| B2 | 15533 | `97a955cdc94b7e9de027f43f7ac696fae5086024cca719e842d80532b28ac954` |
| B3 | 8512 | `e3abbc3304a158d4e193eb9904269dc8cec13e56228160ddcdea8c5b8cf3b8b0` |
| B4 | 11824 | `71e974ab17068fa0920a58b4e1d1bf2458d78633537e25c16666ad9562ec3349` |
| B5 | 31321 | `6a7ec91606362ef16409af8f5e76e5cef04dd8c6e594aae3dddf24117e486f17` |

补充依据为 [P0.S-6 Final Closure Decision](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md)、[Execution Snapshot Binding Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-BINDING-CONTRACT.md)、[System Architecture](../02-architecture/SHACO-FORGE-SYSTEM-ARCHITECTURE.md)、[Security Model](../02-architecture/SHACO-FORGE-SECURITY-MODEL.md)、[P0-6 Dependency & Stability Matrix](../06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md) 的 Windows / Native Boundary，以及 [P0-7 Hypothesis / Hard Gate Baseline](../06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md) 的 H-21～H-26。

### 0.2 当前事实与未证明事项

状态优先采用 B5 的 Latest Final State 和 `P0S6-TVEC-FINAL-CLOSURE-20260905-01`。B1、B2、B5 中较早的 BLOCKED、待准备或旧 next-action 文字是保留的历史记录，不触发再次执行，也不需要本次改写。

| Item | 当前事实及本规划边界 |
|---|---|
| P0.S-6 | `CLOSED / VERIFIED_WITH_CANDIDATE`；Verification / Classification 为 `PASS / PASS` |
| P0.S-6 Invocation | `P0S6-TVEC-INVOCATION-20260904-01` 已完成，禁止复用其预算、签名或批准作为 P0.S-7 权限 |
| Candidate | `generated_not_applied`；source / DRRC lockfile `UNCHANGED`；没有依赖安装或 Runtime 成功结论 |
| H-05 / H-20 | Client modules / Cordis omission 的 Runtime 证明仍为 `NOT_PROVEN`；治理关闭不补足证据 |
| Core Patch | `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`；模块与打包领域不能预先声明 `NO` |
| P0.S-7 / P0.S-8 | 分别保持 `NOT_STARTED / NOT_AUTHORIZED`、`NOT_STARTED` |
| 全局阶段 | P0.S 尚未整体 PASS；本规划不冻结 P0.5 兼容性、P1 合同或 P0.S-8 七项基线 |

## 1. Goal Definition

**P0.S-7 的目标是验证 Runtime 可行性与受控执行边界。** 核心问题是：在没有全局 Node、pnpm 和手动安装 Harness 的 fresh Windows 上，能否从明确批准的包启动独立 Worker / Harness，并证明实际执行字节、权限、生命周期、失败及显式恢复均处于获准范围内。

| Validation Question | 未来必须提供的回答 |
|---|---|
| Package feasibility | 一个完整、可定位、依赖闭合的包能否运行；至少一种 Worker runtime strategy 获得实际证据 |
| Identity and integrity | 实际 Node、Worker、Harness、Client、插件、native/helper 字节能否与批准身份一致 |
| Controlled execution | 未授权、不匹配、过期、预算耗尽和权限不满足能否在对应执行边界前阻断 |
| Evidence completeness | 是否能区分获准、尝试启动、进程创建、READY、失败、未到达和最终收口 |
| Recovery control | 失败后能否保留原证据，并仅在独立明确授权下使用新 Invocation 恢复 |

本阶段产出是可证实或证伪的 Spike 结论及后续合同输入。未来原型默认 `NOT_PRODUCTION`。完整生产 Runtime、任意第三方插件兼容、自动升级、安装器完善、ARM64 发布、系统服务及 P1/P2+ 产品实现均不由本计划承诺。平台 code signing 不是 P0.S Hard Gate；Owner Signature 对执行批准和 Snapshot 身份的认证仍为强制要求。

## 2. Runtime Architecture Planning

### 2.1 Package Structure

以下为逻辑布局提案，不创建任何目录或文件。打包工具与最终文件名由 P0.S-7-1 合同明确。

```text
distribution/
  package-artifact                 最终分发包；整体精确字节摘要单独登记
  payload/                         最终安装布局的逻辑视图
    desktop/                       Electron Main、preload、Client 静态资源
    runtime/node/                  精确版本的 bundled Node sidecar
    runtime/harness/               固定 Harness 发布入口及 production 依赖闭包
    runtime/composition/           Shaco Host profile、bundle、静态插件 roster
    runtime/native-and-helpers/    原生模块、rg、runner、picker worker 的路径清单
    runtime/control/               受控 launch / identity / carrier 适配组件
    licenses/                      第三方许可与包来源清单
external-control/                  与被验证 payload 分离的受信执行材料
  package-inventory                规范路径、角色、版本、长度、SHA-256
  runtime-snapshot                一次执行所需的精确工件与策略集合
  binding-and-owner-approval       签名载荷、独立预期 Reference、批准记录
  launch-authority                本阶段、场景、预算、环境与有效范围
per-user-data/                     与 package 分离；由受控路径映射定位
  dsh-home/                        JSONL 等 Harness 持久化数据
  control/                        受保护的 endpoint / generation / 租约状态
  evidence/<invocation-id>/        原始事件、失败、恢复和最终证据索引
```

`native-and-helpers` 表示清单中的角色分组；物理文件保留包解析和公开入口要求的相对布局，不任意搬移 node_modules 内文件。原生 `.node`、可执行文件及会被 spawn 的脚本必须映射到真实磁盘路径；asar 内静态资源与 asar 外执行工件分别登记。不得依靠 `src`、tsx、开发仓库、全局 Node/pnpm 或安装时临时补齐缺失依赖。

Package payload 不写运行数据。`DSH_HOME` 固定到经批准的当前用户目录，必须可写且稳定；不回退到安装目录、工作目录或随机临时目录。可写 profile 若参与代码加载，需从批准 composition 受控物化并逐字节验证；将此类文件与普通可变 session/settings 数据分开。CLI 自动 heal 或 profile reload 不得改变已批准执行集合；只能采用 `startup` 策略并在变化时阻断。

### 2.2 Runtime Components and Ownership

| Component | 规划职责 | 执行边界 |
|---|---|---|
| 独立受信的 pre-start validator | 从 Owner 外部批准取得 key / Reference；验证启动控制器、包和 Snapshot；持久记录 launch decision | 自身由独立信任基线认证，不接受 package 自行指定的 validator 或预期哈希 |
| Desktop Main / Supervisor | native shell、单实例/attach 决策、受控启动协调、身份握手、carrier 适配 | 不拥有 Agent 业务真相；没有绕过 validator 的通用 spawn 入口 |
| Renderer / Harness Client | Client boot、投影、交互 | `nodeIntegration=off`、`contextIsolation=on`、sandbox、preload allowlist；不接触 pipe 或可复用 Worker credential |
| Worker | 当前用户的长运行 Host；拥有 session、工具、权限检查与 capability 子进程 | 与 Desktop 窗口生命周期独立；不是 Windows System Service |
| Harness | 通过已发布 CLI `dsh --profile <shaco-host>` 加载 `dsh-base`、Shaco bundle 与 shipped standard | 不调用内部 in-process `boot()`，不复制内部实现，不建立第二套 Agent RPC |
| Carrier | Renderer → Electron IPC → Main → current-user Named Pipe → Worker | 保留 Connection / Remote / Gateway 语义；认证及兼容握手先于 Agent 写路径 |
| Evidence collector / Validation Harness | 记录外部 launch、PID/start-time、首个失败、预算及终态，核对 Worker 事件 | “Validation Harness”仅指未来验证驱动器，与业务 DeepSeek Harness 区分；不是第三个常驻产品进程 |

保持 Desktop + Worker 两个核心长运行产品进程。Worker 是运行 Harness CLI Host 的进程角色，不另外常驻一层未定义的 Worker daemon。pre-start validator / 验证驱动器可短时存在；任何辅助进程需列出角色、父进程和退出条件。验证侧工具也必须登记其可执行文件和 host prerequisite，不能借验证驱动器偷偷引入全局 Node/pnpm，或以未经认证的包内 Node 执行启动前检查。

### 2.3 Worker Runtime Strategy

**首选验证 bundled Node sidecar。** 该方向沿用 P0-6 的推荐，用独立 Node 运行 Harness，保留 Desktop/Worker 分离。它当前是选定的首要验证假设，尚不是 `PROVEN`。

| Strategy | 判定标准 | 失败后的处理 |
|---|---|---|
| bundled Node sidecar（首选） | 精确 Node/ABI 与 production closure、koffi、node-pty、loader、rg、Windows helpers 共同通过 packaged 证据 | 停止该场景、记录约束和 Core Patch 判断；不借用系统 Node |
| 独立 Electron 子进程运行 Host（备选） | 仅经单独批准后验证同样的原生依赖、loader、隔离与 Desktop 独立性；必须记录额外适配成本 | 不在首选失败后自动切换，不以一项 ABI 检查代替全链证明 |
| Host in Electron Main | 改变 Desktop-close Worker-survives 基线 | 仅可提出原 Fallback B 的 Owner 再决策；不作为本计划默认实现 |

Harness 继续固定为 `cd5ef8148158c3a752a658978873241fdf8e2bbc` / `@deepseek-ai/dsh@0.1.2-alpha.1`。P0-6 冻结的 Node engines 是 `^22.19.0` 或 `>=24.0.0`；它不是可直接执行的版本选择。P0.S-7-1 必须选出一个精确 Node 版本、来源、哈希、win32/x64 与 ABI 身份，经审查后才能准备包；不得选择浮动 `latest`。Electron 精确版本也需独立登记，不沿用实验常量作为批准。

### 2.4 Native, Dependency and Desktop Integration

| Area | 未来规划要求 |
|---|---|
| Production closure | 固定 package manager / build tool 身份、依赖输入摘要、构建脚本及 patch 清单；区分构建机工具与运行机依赖；启动不运行安装器、不访问 registry、不补装 |
| Native | 核对 P0-6 所列 koffi、node-pty（含静态 import）、`node-addon-require-builtin` 运行依赖、rg、Windows JSONL/file operations；不直接导入 INTERNAL seam |
| Spawn paths | 核对 `lib/runner.js`、适用的 `lib/worker.cjs`、`.node`、rg、helper 的 unpack/绝对路径与 `process.execPath`；源码/tsx fallback 必须禁用 |
| PowerShell | 作为显式 host prerequisite；固定解析后的绝对路径、版本、字节身份或批准的平台身份；分别说明 5.1 / 7 支持范围；缺失即失败，不自动下载或静默捆绑 |
| CPU / OS | 先以 Windows x64 作为计划验收配置；精确 Windows build 由合同记录。ARM64 不作为本次发布阻断项；未知架构拒绝运行 |
| Persistence | 默认 JSONL；package 与持久数据分离；SQLite query 的 `openAt: never` 不自动变成 session truth 或新 REQUIRED 功能 |
| Desktop lifecycle | 关闭/崩溃不终止 Worker；重新打开只认证 attach 和重建投影；第二 Desktop 不创建第二 Worker/control authority |
| Worker replacement | 新实例、新 generation、新执行授权；经真实身份/transport/`$events.ready` 因果链重建投影，不伪造 `connection/reset` 事件 |
| Permission boundary | 验证 Windows ACL / restricted-token 的实际约束及局限；不以 Linux Landlock 为 Windows Gate，也不把 current-user ACL 等同于完整 sandbox |

## 3. Runtime Trust Model

### 3.1 Runtime 是否需要独立 Snapshot？

**需要。P0.S-7 必须拥有独立于 P0.S-6 的 Runtime Execution Snapshot。** P0.S-6 的 Snapshot 只覆盖其有界 Verification 工件，不能认证新的 package、Node、Host composition、插件和启动策略。

采用两层身份：可复用的 **Package Content Identity** 固定包与依赖字节；每次 Invocation 的 **Runtime Execution Snapshot** 引用该 Package Identity，并绑定本次入口、权限、环境约束、validator/control 组件和 Invocation Identity。相同包可经新的明确授权用于新 Invocation，但旧启动批准、已消耗预算、运行后证据均不能复用为启动许可。

### 3.2 Identity Domains

| Identity | 规划字段与语义 |
|---|---|
| Authority Anchor | 单独批准的不可变完整 Git commit identity，证明治理来源；构建源提交必须与批准 Anchor 满足指定 ancestry；不要求动态 HEAD 相等 |
| Package Identity | packageId / version / platform / arch、最终 archive bytes + SHA-256、安装 payload inventory Reference、来源/build-input/lockfile 摘要、组件版本与入口 |
| Runtime Definition Identity | Node 版本/ABI/execPath、Worker entry、Harness pin、profile、Client/Carrier 协议、plugin roster、permission policy 与依赖闭包 Reference |
| Runtime Instance Identity | 每次创建的新 instanceId、当前 SID、PID + process start time、authenticated endpoint identity、generation、package / Snapshot / Invocation Reference；PID 单独无效 |
| Invocation Identity | 全新 invocationId、phaseId、scenarioId、authorityId、budget slot、允许操作/时间/平台、execution/evidence root、父失败或恢复关系 |
| Runtime Snapshot | 完整且唯一的文件角色、规范路径、字节数与 SHA-256，外部依赖身份和环境约束；区分冻结输入与运行时事实 |
| Binding | 签名的精确 Snapshot Payload 及与 Anchor、合同、Invocation、Package 的关联；独立选择的预期 Reference 与 envelope digest 分开记录 |

路径身份必须拒绝 `..`、大小写别名冲突、越界路径和未经批准的 symlink/junction/reparse point；Windows 最终解析路径、大小写规则与允许根由合同冻结。Package inventory 不只检查列出的文件，还要确认可加载/可执行目录没有未列入的文件或解析回退。OS DLL、系统 PowerShell 等外部输入单列，不谎称它们已包含在包内。

### 3.3 Trust Root and Bootstrap

信任来源分为三个独立结论：**公钥可信、签名有效、这份 Snapshot 被本次授权选中**。任何一个缺失都阻断。建议沿用 Ed25519 精确字节签名模型，公钥指纹使用 `DER SubjectPublicKeyInfo SHA-256` 域。P0.S-7 key、Anchor、批准来源和 Reference 当前均为 `NOT_SELECTED / NOT_PROVISIONED`。

P0.S-6 公钥只有在 Owner 明确批准其 P0.S-7 使用范围后才可复用；历史指纹或有效旧签名不提供这种批准。私钥始终由 Owner 控制，不进入 package、仓库、环境变量或日志。平台 Authenticode 与 Owner execution signature 分开判定。

未来验证环境先通过独立 Owner 记录固定 pre-start validator 的字节和信任配置，才允许该 validator 验证 Desktop launch controller 与 Runtime 包。尚未认证的 Desktop Main、Runner 或 package 不能证明自己的 validator 可信。受信配置保存于独立受控入口，不能由被验证 package 的 Manifest、Binding 或普通命令行参数选定。

外部 Owner Approval 至少固定：validator 身份、key 指纹/用途、Anchor、精确 Snapshot Reference、Binding 实际读取位置及可选 envelope hash、合同/Invocation/Package 身份、有效期/撤销规则及批准的权限预算。无法确认批准仍有效时 fail closed。离线场景使用具有明确有效窗口的冻结授权；不承诺没有可达信任源时的即时撤销能力。

### 3.4 Binding and Freeze Order

```text
独立选择 Anchor、validator 信任基线、公钥及批准交付机制
  → 单独获准的依赖/构建准备
  → 最终 package payload（含全部包内 launch/control 组件）/ archive 字节
  → package inventory / Package Identity
  → 已定型的外部验证/控制工件引用及 Runtime / Invocation identities、策略
  → Frozen Input Manifest（未来 P0.S-7 工件）
  → Runtime Snapshot Payload（含最终状态）→ Payload Reference
  → Owner 对精确 Payload bytes 签名 → Binding envelope
  → independent review + Owner freeze 精确身份 + 本次 authority activation
  → 校验实际入口的 Final Preflight → 有界 Controlled Invocation
```

依赖必须单向。Package archive 不内嵌其自身摘要；inventory 不包含自身哈希；后生成的 Manifest、Binding、Approval 和 Evidence 不回填至上游被哈希工件。包内控制器在 payload 冻结前定型，不在得到 Package Identity 后再修改。外置 verification 材料消除整包哈希与签名的循环；若未来改变分发结构，必须重新定义哈希域。

签名覆盖最终 Payload bytes，包括 `status`、换行、BOM 和空白；拟采用的运行有效状态为 `OWNER_APPROVED_AND_FROZEN`，但状态字符串本身不构成批准。先确定最终载荷再签名，不能签署 DRAFT 后仅更新外部文档。修改上游字节后需产生新身份、重建受影响下游链并重新批准；不能修改 P0.S-6 的工件来承载 P0.S-7。

Final Preflight 核对**实际读取的 Binding 和实际 spawn 入口**，包括批准的 expected Reference 与观察值相等。发现 corrected 文件不能证明正式路径已使用它。读取、promotion、review、批准和 Preflight 是不同事件，必须分别有记录。

### 3.5 Immutable Inputs and TOCTOU

Snapshot 冻结获准输入，不冻结运行后的 PID、READY、budget consumed 或结果。后者写入 ledger / audit；不回写 Snapshot 中的 `NOT_STARTED` 等生成时状态。

从 Final Preflight 到 spawn 之间必须保持同一解析目标：受控 staging 根、禁止更新/替换、受限写 ACL、进程与文件锁定策略，以及创建进程前的最终身份核对。环境、入口、package、profile 或策略一旦变化，原 Preflight 失效。哈希与普通只读属性本身不能证明消除了 TOCTOU；具体 Windows 控制及竞争替换负例属于 P0.S-7-1 的实现前决策和 P0.S-7-2 的证据要求。

威胁范围覆盖包被替换、错误配置、未授权本地连接和执行身份漂移。当前用户 ACL 不保证抵御同一 SID 的任意恶意进程、管理员或内核控制者；同用户可写执行字节和 trust config 若无法受控，须记录为 launch blocker 或提交明确的约束决策，不能宣称完整防篡改隔离。

## 4. Controlled Launch Boundary

### 4.1 启动前 Gate

| Gate | 必须检查 | 失败时行为 |
|---|---|---|
| L0 — Evidence readiness | 受信 validator 身份、当前请求/场景身份、受保护 evidence root、可写性和预算 ledger 可持久化 | 禁止 package 代码执行；尽可能写受信 fallback sink；无法写入也不得启动 |
| L1 — Authority Check | P0.S-7 独立批准、适用合同与场景、Anchor、有效窗口/撤销状态、唯一 Invocation、预算、允许操作及平台 | `AUTHORITY_BLOCKED`；不能用规划文档、旧签名或历史 PASS 放行 |
| L2 — Package Check | archive / inventory / payload / entrypoint / Node / Worker / Harness / plugin roster / version / arch 一致；生产依赖完整 | `PACKAGE_BLOCKED` 或 `DEPENDENCY_BLOCKED`；不安装、不 heal、不切换策略 |
| L3 — Integrity Check | 独立预期 Reference、公钥、Owner Signature、精确 Payload 状态、Binding 正式路径、全组件哈希、无额外执行输入及 TOCTOU 控制 | `INTEGRITY_BLOCKED`；有效签名但选错 Snapshot 仍阻断 |
| L4 — Permission Check | SID、非提权上下文、DSH_HOME/evidence/workspace 解析路径及 ACL、网络和子进程限制、host helper 身份、受保护单实例租约 | `PERMISSION_BLOCKED`；不降低 sandbox、不另选可写目录 |
| L5 — Final Preflight | 汇总 L0～L4；记录实际 exe / argv / cwd / env policy / Snapshot / 权限 / 预算；证明到 spawn 的输入未改变 | 仅当所有条件通过才产生短时、一次性 launch decision；本身不新增权限 |

每个 Gate 的 observed 值、expected 来源、结论和首失败边界均需记录，禁止仅写 `allChecksPassed=true`。未认证的包不得在 L0～L4 内通过“探测”执行其 Node、脚本、native addon 或插件；这类加载本身属于后续获准执行。隔离解包等准备活动也需要单独批准的准备合同。

### 4.2 权限与运行范围

| Surface | 默认有界策略 |
|---|---|
| Executable / argv | 使用批准的完整路径和参数数组；无任意 shell 拼接、PATH 查找或命令替代；entrypoint 只允许已冻结 CLI/profile |
| Environment | 允许清单构造；明确 DSH_HOME/TEMP/cwd；禁止从父环境注入 NODE_OPTIONS、NODE_PATH、动态 loader 或未批准 profile；敏感值仅以受保护 secret reference 注入 |
| Filesystem | package/执行配置只读；DSH_HOME 和 evidence 分根；业务文件操作仅限合同批准的 workspace；Windows ACL/restricted-token 实际 enforcement 和不足必须可观察 |
| Network | 启动、依赖恢复和默认故障场景无外网；如需 provider 请求，单独批准 endpoint、协议、凭据引用、超时和请求预算；不得启动 stock Web/TCP 产品入口 |
| Child processes | Worker 所有；精确可执行身份、数量、参数/环境/目录、截止时间和退出语义；禁用自动 restart，记录 spawn/exit；失去所有权即停止新的业务操作 |
| Local control | current-user Named Pipe ACL、身份/generation/兼容握手先于 Gateway；凭据留在 Main/Worker，Renderer 只能调用 allowlisted bridge |

权限表是待实现和证据验证的合同约束，不能靠配置存在推断已得到 OS enforcement。若 frozen Windows sandbox 仅提供 partial enforcement，须明确哪些禁止行为由哪个层阻断；无法满足本次场景边界时拒绝该场景，不能以日志代替控制。

### 4.3 Invocation 与预算边界

未来合同分别设置 preparation/build invocation、validation request、Runtime physical launch、network request、child process 和 recovery launch 预算。当前全部为 **0 authorized**，不创建任何运行 ID。

每个未来场景默认规划最多一次 Runtime launch 尝试；具体场景数量、超时、资源上限和总预算必须在执行批准中给出有限值。Runtime launch 前先在受保护 ledger 中原子保留并消耗该唯一 slot，再调用 OS spawn；spawn 报错也不退还。并发双启动只能有一个获得 slot/Worker 租约。保留后崩溃则该 slot 仍消耗，进程创建情况标记 `UNKNOWN`，不能假定未用预算。

启动前拒绝只消耗适用的 validation request 预算，Runtime slot 未消耗，必须记录 `launchAttempted=false` 和可证实的零创建数；未能观察则记录 `UNKNOWN`。失败请求不可后台循环再次提交。恢复一律使用新 Invocation；已失败、过期或消耗的 ID 永久不能重新执行。

### 4.4 启动后的生命周期与失败状态

```text
REQUEST_RECORDED → PREFLIGHT_CHECKING → PREFLIGHT_PASSED
  → LAUNCH_SLOT_CONSUMED → SPAWN_ATTEMPTED → PROCESS_CREATED
  → IDENTITY_AUTHENTICATED → READY → RUNNING → STOP_REQUESTED → EXIT_OBSERVED
  → EVIDENCE_FINALIZED

任一 Gate 拒绝 → BLOCKED → EVIDENCE_FINALIZED（能完成时）
spawn/handshake/dependency 失败 → STARTUP_FAILED → CONTAINMENT → EVIDENCE_FINALIZED
运行中失败 → RUNTIME_FAILED → CONTAINMENT → EVIDENCE_FINALIZED
异常中断且无终态 → INTERRUPTED / OUTCOME_UNKNOWN → 后续显式对账
```

READY 至少要求实际进程创建、身份/endpoint/generation 握手、Harness profile 初始化、受控持久化可用以及适用的真实 Connection ready 证据；进程存在或 stdout 出现 “ready” 不足以替代。启动授权只允许合同列出的行为，不自动触发真实 Agent turn、外网、插件安装或任意工具调用。

将 launch/runtime 的事实状态与 Evidence Finalization 状态分开保存：有退出码不等于运行成功，有原始日志不等于已完成收口。超时、无法核实退出、残留子进程、证据写失败或租约状态未知时关闭新的业务入口并进入受控 containment；不能自动启动替代 Worker。

Desktop 关闭/崩溃只影响投影和连接，Worker 在原授权有效范围内继续；授权到期按合同有界停止。明确 Stop Worker 才进入 Worker/子进程 shutdown。重新 attach 不是 Runtime 重启，不消耗新的 Runtime launch slot，但仍需匹配有效权限和身份；连接恢复不重放 approval、question、Agent resume 或 turn。

## 5. Plugin Model Impact

**Plugin 必须进入 Trust Model、Identity Model 和 Evidence Model。** 能执行 Host/Client 代码、修改 composition、注册工具或改变权限的插件都是执行输入；“官方”“in-box”“静态打包”均不代表可以免检。

| Plugin Category | Trust / Identity | Evidence / Scope |
|---|---|---|
| REQUIRED in-box Host / Client modules | 固定来源、版本、字节、Host/Client 角色、入口、依赖、兼容性和权限；roster Reference 纳入 Package 与 Runtime Snapshot | startup 记录 expected/observed roster、load/omit/blocked/error；记录失败来源与 capability 注册结果 |
| Shaco carrier / Layer C adapter | 纳入同一认证链；Named Pipe 保持 `SHACO_CUSTOM_CARRIER_PLUGIN`，adapter/stub 单列 | 记录采用的公开/preview seam、隔离约束、生产影响；不自动计为 Core Patch |
| tool-cordis | 单独判断 REQUIRED 依赖和权限；不由名字推断可省略或可信 | 保留其独立 inclusion/omission 结论 |
| cordis-host-runner / cordis-client-runner / ui-cordis | 分别登记与 core boot/parity 的关系；release 默认不启用 Dynamic Cordis | H-20 尚未证明，省略必须由明确范围的证据支持；隐藏必需依赖发现后回到 Owner 决策 |
| 任意外部插件 / marketplace / 热加载 | 本 P0.S-7 默认排除；不得在启动后下载、扫描任意用户插件目录或接受未冻结 payload | 外部插件请求记为拒绝；不声称已经具备第三方插件隔离模型 |

优先 build-time static inclusion，但 H-05 `P0S_INBOX_CLIENT_MODULES_PASS` 和 H-20 `P0S_CORDIS_OMISSION_PASS` 当前仍为 `NOT_PROVEN`。P0.S-7-1 必须列出这两项对目标 package 的依赖：需要补证时提交单独有界补证范围与预算，不重新打开 P0.S-6，也不以 packaged Host 启动代替 Client/omission 证明。缺少 REQUIRED Client closure 时，可在获准的较窄范围得出 Worker-only 结论，不能宣称完整 packaged Desktop Runtime 可行性通过。

插件集合、配置驱动的可执行入口或权限发生改变即产生新 Package/Runtime 身份，重做受影响 Snapshot、Binding 和批准；metadata 中自行增加插件或宣称兼容不能热更新授权。已包含插件的业务错误仍关联其原身份，不能在失败时静默卸载插件后重试。

## 6. Evidence Model

### 6.1 Common Envelope and Provenance

每条 Runtime Evidence 规划包含：schemaVersion、eventId、recordType、phase/scenario、authorityId、invocationId、packageId/package digest、Runtime Snapshot Reference、Binding Payload Reference、runtimeInstanceId（未产生时为 null 并给出原因）、source、sourceSequence、UTC 与 source-local monotonic time、causedBy / correlationId、boundaryReached、observed/expected、结果和 artifact References。

跨进程顺序由因果链接、各 sourceSequence、PID/start-time、generation 和原始 transport 记录建立。汇总序号只表示合并次序，不宣称是跨进程绝对时间。Worker 自报版本/READY 不独立认证自身；外部 collector 的 spawn 观察、批准字节、握手及实际输出必须交叉对应。秘密、token、签名私钥和完整敏感环境不写日志。

### 6.2 Runtime Evidence Sets

| Evidence Set | 最小内容 | 可信来源与验收重点 |
|---|---|---|
| startup evidence | host inventory、package/version/closure comparison、Authority/Integrity/Permission checks、Final Preflight、ledger slot、实际 exe/argv/env policy/cwd、spawn 结果、PID/start-time、身份/ready 与初始化边界 | 启动前由外部 validator 记录；启动后与真实进程和 Harness/Carrier 事件交叉核对；拒绝或未到达也必须明确 |
| lifecycle evidence | attach/detach、Desktop close/crash、Worker identity/generation、child spawn/exit、显式 stop、持久化操作及终态 | 外部观察与 Worker 事件保留源身份；同一 Worker、生存/退出和零重复操作必须可重推 |
| failure evidence | firstFailureBoundary、失败条件和 expected/observed、error code、受影响组件、launchAttempted、processCreated、runtimeEntered、预算 used/remaining、containment、残留资源、未到达操作 | 首失败不被 cleanup error 覆盖；负例中未认证身份仅标为 claimed/observed，不能伪装为可信 |
| recovery evidence | parent failure/event/Invocation、recovery authority、新 Invocation、前后 Package/Snapshot/instance/generation/数据身份、批准动作、预检、结果、no-replay 计数 | 未授权时 `RECOVERY_NOT_AUTHORIZED`；获准但未到达为 `NOT_REACHED`；未进行恢复不填成功 |
| finalization evidence | raw artifact index（路径/字节/SHA-256）、ledger 及预算对账、expected-vs-observed case result、未决项、classification、summary 与 review Reference | 可从 raw Evidence 重推摘要；Evidence index 不包含自身哈希；由下游 review/record 固定其精确摘要 |

### 6.3 Evidence First and Crash Semantics

在任何 package 代码执行前建立受保护的 append-only 逻辑事件流和运行目录。append-only 的具体文件权限、写入策略、flush/close 界限及日志轮转限制由合同规定，不能仅因扩展名为 JSONL 就声明不可篡改。正常和失败终态均先收集原始事实，再完成索引和分类；不回写冻结输入。

预设受信 collector 的 fallback sink、有限容量、落盘失败行为及 evidence finalization deadline。evidence root 不可用则拒绝 launch；运行中持久证据失败则停止接收新工作并进行有界停止，保留已写数据。机器断电、collector 崩溃或磁盘不可写时不可能保证即时完成 finalization，必须保留 `EVIDENCE_INCOMPLETE / OUTCOME_UNKNOWN`，不得生成虚构成功 summary。

后续仅在显式对账/恢复权限下读取残留证据和进程事实，新增 reconciliation record 关联原 Invocation；不覆盖原事件，也不把补写时刻冒充历史时刻。哈希证明证据字节一致性，不单独证明事件真实或恶意同用户不可篡改；独立审查与受信采集来源仍必需。

### 6.4 Result Taxonomy

分别记录 `subjectOutcome`、`validationVerdict`、`evidenceStatus`、`hypothesisDisposition`，不将它们折叠成一个 PASS。

| Domain | 规划含义 |
|---|---|
| subjectOutcome | `BLOCKED`、`STARTUP_FAILED`、`RUNTIME_FAILED`、`INTERRUPTED`、`OUTCOME_UNKNOWN`、`COMPLETED` 等实际结果 |
| validationVerdict | 预先批准的期望与观测一致且证据完整才 `PASS`；相反为 `FAIL`；未到达/证据不足为 `INCONCLUSIVE` |
| evidenceStatus | `FINALIZED` 或 `INCOMPLETE`；崩溃后补充收口须有独立 Reference |
| hypothesisDisposition | `PROVEN`、`PROVEN_WITH_CONSTRAINT`、`FAILED`、`UNRESOLVED`；技术事实与 Owner 接受约束分别记录 |

例如 corrupted package 在 spawn 前被拒绝，可以令对应 fail-closed 负例的 `validationVerdict=PASS`，但其 `subjectOutcome=BLOCKED`、`runtimeEntered=false`，不能声明该 corrupted Runtime 启动成功。环境未就绪是 INCONCLUSIVE，不能转为 Runtime 可行性 PASS。

## 7. Failure Recovery

### 7.1 场景设计

| Failure | 识别与立即处理 | 获准恢复路径 | 最小恢复证据 |
|---|---|---|---|
| startup failure | spawn error、handshake mismatch、READY timeout；记录到达边界和消耗 slot；只停止已确认归属本次的进程树 | 明确修复/恢复批准 → 新 Invocation → 全量 Final Preflight；变更工件则重新冻结 | OS spawn 结果、PID/start-time、超时/认证失败、cleanup、旧/新身份 |
| dependency failure | 预检发现缺失则不启动；加载时缺失/ABI mismatch 则停止该实例；不自动 install/rebuild/fallback | 独立依赖/构建准备合同，在隔离目录形成新完整包并批准，再新启动 | 缺失/不兼容组件、阶段、resolved path、诊断、准备 authority、前后 closure/package Reference |
| corrupted package | archive/component/hash mismatch、额外 loader、路径替换或签名不匹配；拒绝执行 | 标记当前包不可用并保留证据；仅在获准的隔离准备下从批准来源重新取得/构建并验证 | expected/observed digest、实际读取路径、无执行证明、替换批准及完整新链；不就地修补旧证据包 |
| interrupted execution | Worker/collector crash、断电、ledger 中 slot consumed 但无终态；状态不明则阻断重复 Worker | 显式先对账 PID/start-time/endpoint/租约/children/持久化，再批准 attach、受控停止或新启动之一 | parent failure、残留进程/数据、采取动作和权限、新 generation/Invocation（若新启动）、无重复 resume/settlement |

恢复不等于自动重放业务操作。只恢复连接或投影时不发起 Agent resume/turn，不提交之前的 approval/question 答案。若确需业务恢复，需独立业务动作授权、持久化状态与幂等合同，属于 P1/P6A 后续输入。

### 7.2 禁止隐式 Retry

**禁止隐式 retry、自动 restart、自动 resume 和消耗后 reuse。** 适用于 Supervisor、Validation Harness、依赖准备工具、网络客户端、插件 loader 和 child-process 管理。不能通过工具内部 retry、健康检查循环、重开 Desktop、刷新 endpoint 或更换 Invocation 名称扩大预算。

未来合同须冻结实际工具的 retry 配置与请求计数；若工具内部行为不能关闭或界定，就不允许其跨越本合同预算。只读 bounded readiness observation 可以在单一已批准启动的截止时间内重复观察，但不得再次 spawn、发送新的业务动作或重新发起失败请求；观察次数/时间上限要在合同中明确。

任何恢复必须拥有可审查的 failure record、根因/未知项、动作清单、批准对象、预算和新 Invocation Identity。相同包无字节变化也不继承原启动批准；变更包则额外重做 Package Identity / Snapshot / Binding / Owner freeze。恢复权限只来自相应明确批准，不来自本 Decision。

## 8. P0.S-7 Phase Breakdown

三阶段全部保持 `NOT_STARTED / NOT_AUTHORIZED`。下表与各阶段描述是计划，不激活阶段。每阶段的退出不自动授权下一阶段；计划审查、准备/构建授权、精确工件冻结和 Runtime activation 必须分别可追溯。

### 8.1 P0.S-7-1 — Input Closure & Controlled Validation Contract

| Field | Plan |
|---|---|
| Goal | 将本规划转为可审查的有界验证合同；消除 Runtime 实现前必须明确的输入、信任与预算空缺 |
| Input | 本 Decision；B1～B5；固定 Harness baseline；H-21～H-26；H-05/H-20 未证明事实；现有 dependency/candidate disposition；系统与安全基线 |
| Output | P0.S-7 合同草案、package/runtime/native/plugin roster、精确 runtime strategy 候选选择、信任/绑定/预检/evidence schema 设计、场景和预算表、依赖准备与补证处置提案、风险与 Core Patch 预期清单；均仅为未来交付物 |
| Acceptance Criteria | 下面 S7-1-A～F 全部有可审查答案；缺失项阻止相关实现或执行授权，不以 TBD 跨 Gate |

- **S7-1-A：** package、Node/Electron、win32/x64、Harness pin、ABI/native、构建工具/输入、插件角色和实际入口有明确选择及来源；future build inputs 与旧 Candidate 的关系明示。
- **S7-1-B：** 未应用 Candidate、失败 node_modules/cache、旧 quarantine 均不被默认为可用输入。若需要新的 dependency baseline，只提交独立明确的准备/处置范围；不自动修改 source/DRRC lockfile 或应用 Candidate。
- **S7-1-C：** H-05/H-20 对当前 package 的必要性、可用证据和补证 Owner/合同路径明确；未知项不标 PROVEN，不重新打开 P0.S-6。
- **S7-1-D：** validator bootstrap、独立 key/expected Reference 来源、Snapshot 字段与字节编码、单向冻结顺序、实际 Binding 路径、TOCTOU 和权限 enforcement 方案可审查。具体 key/签名待适用批准后提供，未提供不得进入 launch。
- **S7-1-E：** 每个场景具有 ID、输入工件、期望结果、首失败边界、采集来源、有限超时/请求/启动/恢复预算及终止语义；没有无限重试或未界定默认值。
- **S7-1-F：** preparation/build 与 Runtime launch 分离，审查与 Owner 决策对象明确；形成建议是否允许受控实现的结论。通过合同审查仅表示可提交实现授权，不表示实现、包冻结或 Runtime 已通过。

### 8.2 P0.S-7-2 — Packaged Feasibility & Controlled Launch Validation

| Field | Plan |
|---|---|
| Goal | 用精确批准的包在 fresh Windows 证明至少一种 Worker runtime strategy，并验证受控启动正例及启动前拒绝边界 |
| Input | S7-1 经审查的合同和独立实现/准备授权；可使用的精确 dependency baseline；隔离构建输入；具体 validator/key/Anchor/Reference；阶段预算 |
| Output | 获准构建的 package 与 inventory、Runtime Snapshot / Binding / Owner freeze、实际入口核对、fresh environment inventory、startup/lifecycle/negative evidence、strategy/native/path/core-patch 初步结论 |
| Acceptance Criteria | S7-2-A～F；准备子步骤成功不自动允许 Runtime，必须再满足精确 artifact review/freeze 与 launch activation |

- **S7-2-A：** 从独立批准输入形成 production closure；禁止消费旧失败缓存。包与全部执行组件经过单向冻结；公钥/Reference 独立固定，正式 Binding 路径与获准字节相等。
- **S7-2-B：** fresh Windows 无全局 Node、无 pnpm、无手动 Harness 安装、无开发源码/cache 回退；保留环境 inventory 和实际 process.execPath；Node sidecar 或另经批准的策略有真实 packaged Worker/Harness 运行证据。
- **S7-2-C：** 受控 DSH_HOME、JSONL 持久化、Windows ACL、host PowerShell、native/helper/asar-unpack/spawn 路径均有正反证据；不能遗漏静态 node-pty 和禁用源码 fallback 的边界。
- **S7-2-D：** Authority、Package、Integrity、Permission 任一失败均在相应未授权执行前拒绝；零重复 launch、无 PATH/目录/系统 Node 降级；旧签名/错 Reference、payload status、正式/旁路 Binding 不一致和并发争用均有负例。
- **S7-2-E：** packaged Desktop 只走 Client/Host 语义，Renderer 隔离；Desktop close/crash 后 Worker 在授权范围内存活，重新 attach 身份正确、无第二 Worker、无答案/Agent replay。所需 Client closure 缺失时只能报告获准的较窄结论。
- **S7-2-F：** 至少一个 strategy 达到 `PROVEN` 或经 Owner 接受的 `PROVEN_WITH_CONSTRAINT`；raw Evidence 与生命周期/预算对账完整。若仍 UNRESOLVED，不能转入成功收口，但可经另行批准执行诊断性失败验证。

### 8.3 P0.S-7-3 — Failure, Explicit Recovery & Evidence Closure

| Field | Plan |
|---|---|
| Goal | 证明失败被准确分类和约束，恢复只在明确授权下发生，并形成可提交 P0.S-8 的结论 |
| Input | S7-2 的精确包与真实结果；已审查的故障注入副本、预期故障位置和 containment；单独失败/恢复/对账权限；新场景 Snapshot / Invocation 和预算 |
| Output | 四类故障证据、显式恢复和拒绝恢复证据、中断对账、budget/no-replay 证明、finalized evidence index、hypothesis/constraint/Core Patch 清单、独立审查材料及 Owner 收口建议 |
| Acceptance Criteria | S7-3-A～F；本阶段结束只提交结论，不自动关闭 P0.S-7、不启动 P0.S-8 |

- **S7-3-A：** startup failure、dependency failure、corrupted package、interrupted execution 各自覆盖首失败与未到达边界；故障注入仅作用于获准的隔离副本，保留原冻结包和历史证据。
- **S7-3-B：** 每类故障先证明未获恢复权限时无 retry/restart/resume；需要实际恢复的场景在对应新批准下执行。尚未获准或未到达的恢复明确记录，不能据此通过完整 recovery Gate。
- **S7-3-C：** 恢复记录完整的 parent failure → recovery authority → 新 Invocation → 新预检 → 结果链；slot 不退还、不复用；包变更产生新身份；残留进程未对账前不创建替代 Worker。
- **S7-3-D：** collector/Worker 中断、证据写失败、超时、子进程残留和不完整持久化有真实终态或明确 UNKNOWN；无重复 Agent resume/turn/approval/question settlement；自动恢复计数为零。
- **S7-3-E：** raw index、hash、预算、生命周期、subjectOutcome、validationVerdict、evidenceStatus 和 hypothesis disposition 可交叉重推；独立 Reviewer 能识别正式/等价驱动器和环境差异，不把等价复现声称为原 Runner 原字节执行。
- **S7-3-F：** H-21～H-25 与 packaging 对 H-26 的贡献逐项给出证据、constraint、production impact、required P0.5/P1 contract、fallback、core patch requirement；H-05/H-20 等剩余缺口保留。形成 Owner 审查所需的成功/失败/未决结论，不强行全部 PASS。

## 9. Acceptance Criteria and Scenario Coverage

### 9.1 与既有 Hard Gate 的映射

以下均是**未来验收标准，当前未执行**，不写入现有全局 Gate 状态。

| Planned Gate | Basis | 通过条件 | Planned Phase |
|---|---|---|---|
| A01 — Runtime strategy | H-21/H-22/H-23；`P0S_NO_SYSTEM_NODE`、`P0S_NO_SYSTEM_PNPM`、`P0S_PACKAGED_WORKER`、`P0S_PACKAGED_HARNESS`、`P0S_WORKER_RUNTIME_STRATEGY_PROVEN` | fresh Windows 实际运行完整获准组合；精确策略有证据，不以 SDK 单文件类比代替 | S7-2 |
| A02 — Data/native closure | H-24/H-25；`P0S_DSH_HOME_CONTROLLED`、`P0S_WINDOWS_NATIVE_DEPENDENCIES` | 受控可写稳定 home、JSONL、native/ACL/PowerShell/helper 路径有证据，无全局/源码 fallback | S7-2/3 |
| A03 — Package identity | B1/B3/B4 | 包、组件、版本、平台、入口、plugin roster 与批准 Snapshot 一致；错包、缺依赖、额外代码拒绝 | S7-1/2 |
| A04 — Authority and trust | B3/B4 | 独立 key/Reference/Anchor、Owner Signature、最终状态、实际 Binding、不可复用预算全部成立；失配 fail closed | S7-1/2/3 |
| A05 — Controlled lifecycle | B1/B3/B5；继承 P0.S-3～5 约束 | preflight 先于执行；进程、权限、DSH_HOME、网络与 children 有界；Desktop 独立、无重复控制与 replay | S7-2/3 |
| A06 — Failure and recovery | B3/B4 | 四类故障及明确恢复/拒绝链有原始证据；隐式 retry/restart/resume/reuse 为零 | S7-3 |
| A07 — Evidence finalization | B3/B4 | startup/failure/recovery 均可追溯；缺证据为未决；summary 可重推且不改冻输入 | S7-2/3 |
| A08 — Plugin and core patch | H-05/H-20/H-26；`P0S_INBOX_CLIENT_MODULES_PASS`、`P0S_CORDIS_OMISSION_PASS`、`P0S_CORE_PATCH_INVENTORY_COMPLETE` | 插件范围有 disposition；packaging/module Core Patch 结论及 adapter 分账明确；全局缺口不能用本阶段部分结果覆盖 | S7-1/3 |

### 9.2 最小场景矩阵

| Scenario Family | 规划输入 / 变体 | 可核对期望 |
|---|---|---|
| C01 — Authorized startup | 完整独立批准包；fresh Windows；精确 host prerequisite | L0～L5、slot、真实 Host/ready/持久化链均可追溯；无未批准外部请求 |
| C02 — Authority negative | 缺失/过期/撤销/错 phase/耗尽/复用 Invocation | package Runtime 未启动；明确 authority 原因；不得重新补预算 |
| C03 — Identity/integrity negative | 错 package/platform/版本、缺组件、额外插件、坏签名、错误 key/Reference、DRAFT payload、正式路径仍为旧 Binding | 对应首失败记录，不能靠签名自洽/旁路 corrected 文件放行 |
| C04 — Permission/path/race negative | 只读 home、越界/junction、PATH 注入、替换执行字节、重复 launch 竞争、未认证连接 | 入口前拒绝或关闭未获准业务路径；无法证明阻断即 FAIL/INCONCLUSIVE |
| C05 — Packaged lifecycle | Desktop close/crash/reopen/second instance；显式 Worker stop；有界 children | Worker 身份与 ownership 正确、无重复 resume/答案、按批准停止并收口 |
| C06 — Startup/dependency failure | OS spawn error/READY timeout；缺 native/helper/不兼容 ABI；缺 host PowerShell | 区分 preflight 阻断与 slot 已消耗的启动失败；不下载/修补/切换 |
| C07 — Corruption/recovery | 隔离副本单项篡改；无恢复权限；后续独立批准恢复 | 先拒绝，后按新 Invocation 和完整批准链验证；旧包/旧失败证据保持 |
| C08 — Interruption/reconciliation | Worker/collector 中断、slot 后无终态、evidence root 失败、残留 children、未完整写入数据 | UNKNOWN/INCOMPLETE 不假冒成功；显式对账后方可 attach/stop/new launch；不重放业务 |

每个 family 在 S7-1 中细化为独立 case ID、故障触发点、采样来源、expected outcome 和单独预算；本表不是授权执行全部变体的批处理命令。恢复能力的最终验收需要实际获准恢复证据，只有 `RECOVERY_NOT_AUTHORIZED` 记录不能证明恢复可行性。

### 9.3 成功、失败与阶段关闭

完整成功建议要求 A01～A08 在批准范围内有充分证据，关键约束经 Owner 接受，没有未解决的 trust/authority/permission/retry 缺口。负例正确拒绝可以证明边界，但不能替代正例的 Runtime 可行性。包装或恢复未证明时保持相应 `UNRESOLVED`，允许提交失败/未决报告，不以进度压力降低 Gate。

H-05/H-20 或模块 Core Patch 未决时不得宣称全局 P0.S PASS，`P0S_CORE_PATCH_INVENTORY_COMPLETE` 也不能仅凭 native packaging 一项改为 YES。独立审查结论和 Architecture Owner 的阶段 disposition 另行产生；本规划不替它们签署批准。

## 10. Controlled Implementation Handoff and Open Decisions

| Decision / Readiness Item | Current Planning Disposition | 后续责任与关闭边界 |
|---|---|---|
| Node/Electron/OS 精确组合 | Node sidecar 首选；精确版本/字节待选 | S7-1 提案，Owner 批准；准备前明确 |
| Dependency baseline | Candidate 未应用，旧 lockfiles/失败缓存不可默认使用 | 单独 preparation/candidate-disposition 决策；Owner 批准范围后方可处理 |
| H-05/H-20 module closure | `NOT_PROVEN`，不追溯改写 P0.S-6 | S7-1 明确补证合同或有界排除；完整 Desktop 验收前解决 |
| Trust Root / Anchor / validator / expected Reference | 尚未选择/配置；不复制 P0.S-6 权限 | Owner 选择信任源；Executor 在另行批准范围实施；Reviewer 核验；launch 前完成 |
| Windows TOCTOU / child / permission controls | 有设计要求，实际 enforcement 未证明 | S7-1 明确机制和威胁边界，S7-2/3 用证据验证；不足时阻断相关场景 |
| Concrete budgets / deadlines / evidence limits | 当前 0 authorized；未来每场景有限值 | S7-1 合同给值；Owner 激活具体场景前冻结 |
| Native packaging / Core Patch | 不预判无 Core Patch | S7-2/3 记录 seam、替代方案、升级影响、Owner disposition；禁止静默 patch |

后续进入受控实现的顺序：本规划审查 → 独立授权开展 S7-1 合同工作 → 合同审查与具体实现/准备批准 → 有界构建与工件冻结 → 独立 Owner startup authority + Final Preflight → 场景执行与 Evidence Finalization → 独立审查/Owner disposition。任何阶段通过都不自动产生下阶段预算。

移交 P0.S-8 的材料应覆盖 Runtime/Client/Plugin/Agent Execution/Evidence/Security/Development Baseline 七项输入，逐项附 evidence、hypothesis disposition、constraint、production impact、required P0.5/P1 contract、fallback 和 core patch requirement。P0.S-8 再作基线关闭与架构冻结决定；P0.5 兼容冻结、P1 详细合同、P7 生产打包/签名/升级和 P6A 业务恢复分别保留自己的 Gate。

## 11. Current Deliverable, Document Checks and Unexecuted Actions

本次仅新增 `docs/04-development-records/P0S-7-ARCHITECTURE-PLANNING-DECISION.md`，以 **UTF-8 without BOM、LF** 保存。八项规划目标、三阶段 Goal/Input/Output/Acceptance Criteria、既有 Hard Gate 映射、输入溯源与实现前缺口均在本文件内交付。

文档检查范围仅限严格 UTF-8 解码、BOM/LF、疑似乱码、必需章节/字段、引用路径、文档 SHA-256 和修改前后工作区文件身份核对。这些是静态文档检查，不是项目测试、Final Preflight 或 Runtime 技术验证。本文件自身的 SHA-256 在最终交付时返回，不回填到本文形成自引用。

当前未执行：代码开发；Runtime/package 创建；Runner、Manifest、Binding、Payload、Signature、Identity、Candidate、lockfile 修改；Candidate 应用；依赖准备或安装；测试；Final Preflight；Runtime/Worker/Harness 启动；Invocation 创建/执行；故障注入/恢复；签名或私钥读取；commit；push。本次不修改既有治理文档，不覆盖已有工作区修改。

```text
PLANNING_DECISION_STATUS = PLANNING_ONLY
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S7_STATE = NOT_STARTED
P0S7_AUTHORIZATION = NOT_AUTHORIZED
P0S7_ALLOWED = NO
P0S7_1_STATE = NOT_STARTED
P0S7_2_STATE = NOT_STARTED
P0S7_3_STATE = NOT_STARTED
P0S8_STATE = NOT_STARTED
RUNTIME_EXECUTED_BY_THIS_DECISION = NO
```
