# P0.S-7-1 EAR-C01 O-02 Runtime Definition Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Record Date | `2026-09-05` |
| Decision Scope | EAR-C01 O-02：Runtime 输入来源、角色关系、身份分类、组件与 ABI/Protocol 边界 |
| Decision Basis | 本轮输入决策指令及既有设计合同；只确定输入边界，不授予实现或执行权限 |
| EAR-C01 Authorization | `P0S7-1-PARTIAL-EXECUTION-AUTHORIZATION-20260905-01` / `OWNER_APPROVED_PARTIAL_SCOPE` |
| O-01 | `COMPLETED`：来源角色和唯一候选项目目录已决定，精确源码身份不由此自动确认 |
| Runtime Boundary Decision | `CONFIRMED`：本文确定策略关系与输入分类规则 |
| Exact Runtime Inputs | `UNKNOWN`：精确实物、版本组合适用性、ABI、profile/roster/protocol 等仍缺材料 |
| Input Closure | `BLOCKED` / `INPUT_CLOSURE_COMPLETE=NO` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Current Usable Execution Budget / Invocation | `0 / 0` |
| Deliverable | 仅本文；不创建 Runtime Definition Identity、Snapshot 或其他运行工件 |

本决策确定 Shaco Forge Runtime 的输入边界及组件角色关系。`CONFIRMED` 表示本轮确定的规则或已有材料明确支持的声明；不能读成对应二进制已存在、兼容性已通过或执行已获授权。尚缺精确输入的项目标为 `UNKNOWN`；必需输入未齐备时保持 `BLOCKED`。

## Read Basis

| Ref | 读取依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-1-INPUT-CLOSURE-RECORD.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-RECORD.md) | `0C227154105F65ACC5E7C545753E7F0A03427E21DDEC2FD2C3F8A3568233F223` |
| R2 | [P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md) | `AA3AA657925F83BBED122B821FF39F765E10C2A4A558DA09D738C60A5B9CDD7A` |
| R3 | [P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md) | `83CDE876F95130F1A20D06061A626B88CECF1CC3281F6429D3808EE2090827BD` |
| R4 | [P0S-7-1-DETAILED-DESIGN-CONTRACT.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md)，补充读取 §2.1～2.4、§3.1～3.4 的身份与字段约束 | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |

R1/R2 提供现有声明与缺口；R3 明确来源角色；R4 用于保持身份域、单一字段权威及引用方向。本文不重新认证 upstream、工具实物或历史运行结果，不修改这些依据。文件摘要只是读取字节标识，不是 Signature、Binding 或运行 Evidence。

# 1. Runtime Source Boundary

| 输入来源 | 决定 / 状态 | 边界 |
|---|---|---|
| `D:\Project\Shaco-Forge` | `ACTUAL_PROJECT_SOURCE` / `CONFIRMED` | Runtime Source 的唯一候选项目根；继承 O-01 的 Package Source、Snapshot Source 项目根边界 |
| `D:\Project\Shaco-Forge-Upstream\deepseek-harness` | `REFERENCE_SOURCE` / `CONFIRMED` | 仅作上游能力、依赖与架构参考；不作为最终 Runtime Source、Package Source 或 Snapshot Source |
| Shaco Forge 精确源码输入 | `UNKNOWN` | 当前目录选择不等于选定 HEAD/tree、全部工作树文件、允许 patch、入口实现或完整构建来源链 |
| 第三方组件输入 | `UNKNOWN` | 实际纳入的 Harness、Node、Electron、native/helper/plugin 仍需精确来源和项目组合关系；不能从 reference 目录直接运行或自动复制为项目实物 |

本决策不复制、导入或修改 upstream，不分配 Runtime/Package 输出路径，不将项目目录整体冻结。目录角色与第三方组件身份分别管理；外部工具和独立 Trust/Control 输入不因项目根选择而获得信任。

# 2. Runtime Strategy

**决定采用 Windows x64 的 Electron Desktop + bundled Node sidecar Worker 作为 Runtime 输入策略。** Worker 承载 Harness CLI Host；不另设常驻 Worker daemon。这里确认结构与角色选择，Node/Electron 精确分发工件及其组合的可用性仍为 UNKNOWN。

| Role | 决定的关系 | 已确认边界 | 未确认实物 |
|---|---|---|---|
| Desktop | Shaco Forge 桌面角色，使用 Electron；承载所需 Client/交互与受控连接职责 | 与 Worker 分离，保留 REQUIRED Desktop/Client 范围及 Renderer 隔离要求 | Desktop 代码集合、Client 集成、精确 Electron 工件与启动配置 |
| Electron | Desktop 的运行组件 | 不承担本次策略中的 Harness Worker Runtime；其 native/loader 域独立记录 | 精确 executable/分发身份、内嵌 Runtime 版本及 ABI/N-API |
| Worker | 独立的核心长运行角色，由 bundled Node 执行项目所选 Harness 公共 CLI/profile 组合 | Worker 就是 Harness CLI Host 进程，不再套一个常驻 Worker daemon；保持公开入口，禁止内部 boot 或 src/tsx fallback | 精确项目入口、argv/profile、路径/权限配置和可用闭包 |
| Node sidecar | 随未来项目 Package 定型的 Worker Runtime 组件 | 使用精确选择的 bundled Node；不能自动改用全局 Node/pnpm、开发源码或缓存 | 精确 Node 分发、node.exe 字节、所属平台与 ABI |
| Harness | Worker 内使用的 Host/组件能力与公开组合契约 | 上游目录仅是参考来源；未来实际采用组件必须在 Shaco Forge 项目输入及依赖来源链中明确 | 精确所选组件、发布字节、集成方式、source provenance 与 production closure |
| Plugin | 由精确 profile/composition 和静态 roster 选择的插件、adapter 与支持组件 | 明确每项属于 Host/Worker、Client/Desktop 或 helper 的角色域；不能把全部插件视为 Worker-only；禁止默认发现/下载/热加载外部插件 | S7 profile/roster、插件版本/文件/hash、加载角色与 disposition |

关系可表达为：**Electron 支撑 Desktop；Desktop/Client 经明确的 Carrier/Protocol 与 Worker 通信；bundled Node 支撑 Worker；Harness CLI Host 在 Worker 中运行；Plugin 由各自角色的 profile/roster 选择。** 这是输入关系，不是本轮启动顺序或实现记录。

两个核心长运行角色不等于宣称操作系统中只能有两个 PID。Electron 自有进程与适用 native/helpers 必须在未来清单和 child/permission 边界中明确，不能凭角色图免除管理。

本次不自动切换 Electron Worker，不以 Desktop/Client 缺证据为由缩成 Worker-only；H-05/H-20 保持 NOT_PROVEN。策略改变需要明确的新输入决定和适用授权，失败不能触发 silent fallback。

# 3. Runtime Identity Boundary

本节确定**未来字段归属**，不创建或冻结任何 Identity。标记 `FROZEN_INPUT` 表示该类内容在未来获准、定型和审查后应作为输入管理；本文中的候选版本和 UNKNOWN 占位不是已经冻结的值。

## 3.1 FROZEN_INPUT

| Field / Object | Domain | 唯一语义所有者与规则 | 当前材料状态 |
|---|---|---|---|
| runtimeStrategy、公开入口 role、argv 模板 | `FROZEN_INPUT` | Runtime Definition 拥有静态策略和入口/参数模板；实际启动 argv、execPath 观测属于事实 | 策略关系 CONFIRMED；精确入口/模板 UNKNOWN |
| profile/composition、静态 plugin roster、角色选择 | `FROZEN_INPUT` | Runtime Definition 拥有组合选择；引用对应精确工件，不复制组件身份作为可覆盖字段 | 精确组合/roster UNKNOWN |
| Protocol/Carrier 要求、兼容规则 | `FROZEN_INPUT` | Runtime Definition 拥有静态协议、命名与认证要求；实际 handshake/endpoint/generation 不在此域 | 约束 CONFIRMED；精确协议工件/版本 UNKNOWN |
| environment/permission/path/child/network policy | `FROZEN_INPUT` | Runtime Definition 拥有预期约束和规则；包括 generation 单调性、endpoint 命名、READY 超时等规则 | 既有要求 CONFIRMED；精确策略输入 UNKNOWN |
| 组件实际版本、平台、ABI 声明、路径、长度、SHA-256 | `FROZEN_INPUT` | 未来 Package descriptor / payload inventory 是唯一权威；Definition 使用组件 role/FieldRef，不能另存一套 Node/Electron 版本或文件身份作为覆盖值 | 精确组件 inventory UNKNOWN |
| source provenance、依赖材料与 Package 内容身份 | `FROZEN_INPUT` | 未来 Package 输入记录其来源及完整 D/A/I；获准、定型的依赖解析结果与运行时观测日志分开 | 精确来源/基线/闭包 UNKNOWN |
| Invocation Plan 的预留标签、scope、有限预算与期限 | `FROZEN_INPUT` | 由独立 Invocation Plan 拥有，不属于 Runtime Definition 的实例字段 | 当前未创建 Plan、未预留 ID、预算 0 |

预期环境/路径规则可以成为输入；实际 SID、解析路径、实际环境变量和控制执行结果必须作为运行事实。generation 的单调递增规则可以作为策略；**实际 generation 数值以及 PID/start time 均不得进入冻结输入**。

## 3.2 RUNTIME_FACT

| Field / Object | Domain | 记录位置与禁止规则 | 本轮状态 |
|---|---|---|---|
| PID / parent PID、processStartTime / start time | `RUNTIME_FACT` | 由获准创建后的 OS/受控观察得到，仅入 Evidence/instance lifecycle/ledger；禁止进入冻结输入 | 未创建实例、未采集 |
| instanceId、generation、nonce、lease 状态 | `RUNTIME_FACT` | 在获准运行/控制过程中产生；不能预填数值、改名或放入 metadata 伪装成输入 | 未分配、未采集 |
| 实际 SID、execPath、argv/env/cwd、authenticated endpoint | `RUNTIME_FACT` | 记录 observed/authenticated 事实，与预期约束区分 | 未启动、未握手、未采集 |
| READY/heartbeat、Preflight 结果、Gate 状态、起止时间 | `RUNTIME_FACT` | 仅作为结果与生命周期记录，不回写 Definition/Snapshot | 未执行 |
| Invocation attempt、预算消费、退出/失败/恢复结果 | `RUNTIME_FACT` | 属于 Invocation Ledger/Evidence；不能覆盖计划预算或变为新的启动许可 | 未执行，预算消费 0 |
| 解包/准备结果、实测加载文件、实际 closure 观测日志 | `RUNTIME_FACT` | 观察日志不是未来获准静态 closure 输入，不可通过引用带入 signed snapshot | 未准备、未采集 |

PID、start time、generation 不得通过改名、metadata、内嵌对象、日志摘要或间接引用进入任何冻结输入、signed Runtime Snapshot 或其全部输入引用。运行 Evidence 即使后来计算 hash、签名归档或独立审查，仍是 `RUNTIME_FACT`，不能升级为输入。实际失败事实的关联由独立治理记录处理，不能成为 Runtime Definition 的反向引用。

本轮没有创建运行事实记录。表中的“未创建/未采集”是文档说明，不是填充了零 PID、虚构 start time 或 generation 的实例工件。

## 3.3 REFERENCE

| Reference 类别 | Domain | 规则 |
|---|---|---|
| packageRef、definitionRef、invocationPlanRef、snapshotRef、component/FieldRef | `REFERENCE` | 指向唯一语义所有者的有类型引用；冻结输入只引用已经定型、获准冻结的输入对象；不能覆盖目标字段或自授权 |
| evidenceRef / lifecycle 或 ledger 关联引用 | `REFERENCE` | 可在适用的运行记录或独立治理记录中关联事实；不得进入 Runtime Definition、signed Snapshot 或其输入引用链 |
| upstream 仓库、历史 commit/version、旧 profile/roster/protocol、旧实验结果、本文依据链接 | `REFERENCE` | 仅作分析出处；不因被引用而成为 S7 Package/Runtime 的已认证或冻结输入，不替代正式 ContentRef |

分析出处与未来正式 ContentRef 不能混用。未来 ContentRef 依 R4 记录 kind、locator、精确 byteLength 和 SHA-256；FieldRef 只导出目标字段，不允许内联 override。本文未构造这些运行输入引用对象。

Runtime Definition 不含 Snapshot、Binding、Approval、Evidence 的反向摘要；Snapshot 不含自身 Ref 或后生成 Binding/Approval 的摘要。版本、组件字节与策略各有唯一所有者，冲突不以“最后一个字段覆盖”解决。未来合法方向是 Package 输入 → Runtime Definition → Runtime Snapshot → Binding/独立批准 → 运行事实；本文没有执行该链的任何工件创建、签名或运行步骤。

# 4. Component Boundary

`CONFIRMED` 列确认角色或已有声明；`UNKNOWN` 列列出精确实物及适用性缺口。版本候选来源于 R1/R4，本文没有将它们写成已认证版本或宣称兼容性通过。

| Component | CONFIRMED | 已有候选 / 参考声明 | UNKNOWN |
|---|---|---|---|
| Node | Worker 使用 bundled Node 的角色关系已确定 | Node `22.19.0` / win32 / x64 为既有设计候选 | 官方源工件选择、archive/node.exe bytes/hash、ABI/N-API、匹配 helper/loader 与组合适用性 |
| Electron | Desktop 使用 Electron，ABI 域与 Worker 区分 | Electron `35.7.5` / win32 / x64 为既有候选 | 精确分发/executable、内嵌 Runtime、ABI、Desktop/Client 字节与 fixture 适用性 |
| Worker | 独立运行 Harness CLI Host；无新增常驻 Worker daemon | 上游公开 `dsh → lib/bin.js` 是参考入口契约，不是当前 Shaco Forge 已存在输出的证明 | Shaco Forge 精确入口 role/文件/argv、源码集、profile、权限根、完整依赖与执行实物 |
| Harness | 是项目所选 Host/组件能力；上游目录保持 REFERENCE_SOURCE | `@deepseek-ai/dsh@0.1.2-alpha.1` 与历史 pin 为参考材料 | 进入 Shaco Forge 项目组合的精确组件、来源/发布字节、集成和闭包；不从 upstream 目录直接运行 |
| Native helper / loader | koffi、静态 node-pty、node-addon-require-builtin、rg、Windows runner、适用 picker worker 等需逐项覆盖 | R1 有依赖声明和公开 helper 入口；“未启用 PTY”不豁免静态依赖 | 每项是否适用的正式 disposition、所属 Node/Electron 域、精确版本/ABI/文件/hash、加载或 child 角色 |
| Plugin / adapter | 按 Host/Client/helper 角色与静态 profile/roster 管理；动态发现/下载/热加载默认禁用 | 旧 profile/bundle、23 required / 4 support / 4 omissions 仅作历史参考 | S7 完整 profile/roster、所有 REQUIRED 项、component version/文件/hash 与加载角色；H-05/H-20 缺证据 |

Node `22.19.0`、Electron `35.7.5` 和 Harness 历史版本继续作为候选/参考点；本决策确定它们各自的角色，**不确认精确版本组合实物已选定并可用**。不从包名、版本字符串或单文件摘要推断 ABI、完整 closure 或实际启动能力。

## Remaining Runtime Definition Gaps

| R2 明细 | 决策后状态 | 尚未闭合的内容 |
|---|---|---|
| B02-R1 Runtime 实物及组合 | `UNKNOWN` | 策略关系已明确；精确 Runtime/组件实物与输入身份仍缺失 |
| B02-R2 ABI / N-API | `UNKNOWN` | 数值、native 构建目标、所属域与匹配材料缺失 |
| B02-R3 Profile | `UNKNOWN` | 精确 composition/argv/patch/policy 输入缺失 |
| B02-R4 Roster | `BLOCKED` | S7 完整 REQUIRED Host/Client/plugin/adapter/native/helper roster 与 disposition 缺失 |
| B02-R5 Protocol | `UNKNOWN` | Carrier/Protocol 精确实现与版本/兼容材料缺失 |
| Runtime Definition 输入闭合 / 整体 Input Closure | `BLOCKED` | 角色、规则决定不能代替必需实物材料；不标 INPUT_CLOSED、READY 或 PASS |

# 5. ABI / Protocol Boundary

| Item | 已决定边界 / 要求 | 当前精确材料状态 | 需要确认的输入 |
|---|---|---|---|
| Node ABI / N-API | Worker 的 Node 域单独记录 | `UNKNOWN` | 所选 Node 精确工件、modules ABI/N-API 与 native addon/loader 目标关系 |
| Electron ABI / 内嵌 Runtime | Desktop 的 Electron 域单独记录，不能用 sidecar Node 版本代替 | `UNKNOWN` | 所选 Electron 工件、内嵌 Runtime 版本、ABI/N-API 和所属组件 |
| Native/helper compatibility | 每项明确 Node/Electron/外部可执行角色；helper 是独立可执行时记录其实际平台/工具要求，不能强行赋同一个 Node ABI | `UNKNOWN` | 各版本/平台/ABI或适用理由、加载入口、文件身份及兼容材料 |
| Protocol | 保持 Connection/Remote/Gateway 的 unary/stream/cancel/generation/真实 `$events` 语义，认证在 Gateway 写路径前 | `UNKNOWN`：精确协议输入 | 两端 handshake、schema/protocol ID、消息与错误规则、版本兼容表、认证边界 |
| Carrier | 采用既有 Shaco 自定义 Named Pipe carrier 关系；Carrier 负责传输，不替代上层 Protocol/认证/语义 | `UNKNOWN`：精确实现与版本 | framing/编码、消息边界、endpoint 命名及 SID/ACL 约束、断连/重连/cancel 行为与两端实现身份 |
| Version | 组件版本、ABI、Protocol、Carrier、Snapshot schema version 分别记录，不能相互代替 | `UNKNOWN`：S7 精确版本组合 | 旧 `PROTOCOL_VERSION=1` 仅为历史 client 参考；R4 的 Snapshot schemaVersion=1 不是 S7 handshake 或 Carrier 版本决定 |

规则与精确值分开：协议可以规定 generation 语义、endpoint 命名和认证要求；实际 generation、实际 endpoint、认证结果只能进入 `RUNTIME_FACT`。本轮不运行 Node/Electron 或版本探针，不加载 native/plugin，不执行 handshake、连接、ABI/Protocol 测试或验证。

精确版本、字节身份、ABI 或协议不一致，或来源无法确认时，保持 FAIL-CLOSED；不 silent fallback、不忽略必需 Client/streaming/cancel 语义、不自动重试或切换 Runtime。

# 6. Boundary

| Boundary | 当前状态 | 本轮范围 |
|---|---|---|
| 文档 / O-02 边界决定 | `OWNER_DECISION_RECORD` | 角色关系和身份分类已确定，精确 Runtime 输入未闭合 |
| O-01 | `COMPLETED` | UPSTREAM=REFERENCE_SOURCE；SHACO_FORGE=ACTUAL_PROJECT_SOURCE；不重开来源角色选择 |
| EAR-C01 | `OWNER_APPROVED_PARTIAL_SCOPE` | 仅输入准备和分析，不扩大执行 Case |
| P0S7_STATE | `NOT_STARTED` | 不启动 P0.S-7 |
| P0S7_ALLOWED | `NO` | 不改变门禁 |
| Execution Budget / Invocation | `0 / 0` | 不申请、预留或消耗 Invocation |
| Retry / Resume / Recovery | `0 / 0 / 0` | 不执行恢复、重试或控制动作 |
| Runtime / 冻结 Runtime Definition Identity | `NOT_AUTHORIZED` | 不创建或实现 Runtime，不创建/冻结 Definition 输入工件 |
| Package / Package Identity / Package Feasibility | `NOT_AUTHORIZED` | 不创建、下载、安装、构建、解包或验证 Package |
| Snapshot / Binding / Signature | `NOT_AUTHORIZED` | 不创建、冻结、绑定、签名或读取私钥 |
| Invocation / Launch / Preflight / 验证器 | `NOT_AUTHORIZED` | 不调用执行入口、不握手、不运行验证工具 |
| EAR-C02～EAR-C05 / Evidence Generation | `NOT_AUTHORIZED` | 不运行其他 Case，不创建运行 Evidence |
| 代码 / Runner / Manifest / lockfile / Git 配置 / upstream 修改 | `NOT_AUTHORIZED` | 仅新增本文；不应用 Candidate、不修改 safe.directory、不绕过 Git ownership |
| 测试 / Verification / Commit / Push | `NOT_AUTHORIZED` | 本轮不执行 |
| Production Runtime / Deployment / Full Agent Platform / P1 | `NOT_AUTHORIZED` | 保持范围外 |

继续继承 Authority Anchor、Execution Snapshot、Trust Root、Snapshot Binding、Owner Signature、Final Preflight、Controlled Invocation、Evidence First 与 Fail Closed；历史 key/Binding/Driver PASS 不自动迁移为当前权限。本决策不代替 O-03 依赖基线、O-04 环境、O-05 Trust/Control 或 O-06 未来权限决定。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_ID = P0S7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION-20260905-01
O01_STATUS = COMPLETED
RUNTIME_SOURCE_CANDIDATE_ROOT = D:\Project\Shaco-Forge
UPSTREAM_SOURCE_ROLE = REFERENCE_SOURCE
SHACO_FORGE_SOURCE_ROLE = ACTUAL_PROJECT_SOURCE
RUNTIME_STRATEGY_RELATIONSHIP_DECIDED = YES
DESKTOP_RUNTIME_ROLE = ELECTRON
WORKER_RUNTIME_ROLE = BUNDLED_NODE_SIDECAR
WORKER_HOST_ROLE = HARNESS_CLI_HOST
ADDITIONAL_RESIDENT_WORKER_DAEMON = NO
EXACT_COMPONENT_ARTIFACTS_CONFIRMED = NO
EXACT_ABI_PROTOCOL_VERSIONS_CONFIRMED = NO
PID_DOMAIN = RUNTIME_FACT
PROCESS_START_TIME_DOMAIN = RUNTIME_FACT
GENERATION_DOMAIN = RUNTIME_FACT
RUNTIME_FACTS_ALLOWED_IN_FROZEN_INPUT = NO
RUNTIME_FACTS_ALLOWED_VIA_SNAPSHOT_REFERENCES = NO
RUNTIME_DEFINITION_IDENTITY_CREATED = NO
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
RUNTIME_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
```

## Performed Work and Unexecuted Items

| 项目 | 本轮记录 |
|---|---|
| 修改文件 | 仅新增 `docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md`；既有决策与依据不改写 |
| 内容 | 六类组件角色关系、项目来源边界、FROZEN_INPUT/RUNTIME_FACT/REFERENCE 分类、唯一字段权威、ABI/Protocol/Carrier/Version 缺口与零预算边界 |
| 文档检查方式 | 仅静态核对六个必需章节、组件与身份分类、状态/禁止字段、依据 SHA-256、UTF-8 无 BOM/中文无乱码及工作区文件前后字节；本文 SHA-256 在最终回复返回 |
| 测试方式 | 按用户禁止事项未运行测试、项目 Verification 或 Runtime/Package/ABI/Protocol/环境验证工具；静态文档检查不是运行验证 |
| 未执行事项 | 未创建或实现 Runtime；未创建 Package/Definition Identity/Package Identity/Snapshot/Binding/Evidence Records；未修改代码/Runner/Manifest/Binding/lockfile/Git 配置/upstream；未应用 Candidate、修复/绕过 Git；未下载/安装/build/resolve/解包；未加载 native/plugin、运行版本探针或握手；未配置 Trust/Control、读取私钥或 Signature；未申请/预留/执行 Invocation、Launch、Preflight、Retry、Resume、Recovery；未测试、Verification、Commit、Push |

本文只记录 Runtime 输入决定。缺失的实物和精确身份继续保留，不能通过创建本文件获得执行权。

