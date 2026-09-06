# P0.S-7-1 Runtime Controlled Execution Spike Execution Plan

| Field | Value |
|---|---|
| Execution Plan ID | `P0S7-1-EXECUTION-PLAN-20260905-01` |
| Document Type | `RUNTIME_CONTROLLED_EXECUTION_SPIKE_EXECUTION_PLAN` |
| Status | `EXECUTION_PLAN_ONLY` |
| Plan Date | `2026-09-05` |
| Plan Architect Role | Shaco Forge P0.S-7-1 Execution Plan Architect |
| Planned Subject | `P0.S-7-1 Runtime Controlled Execution Spike` |
| Authorization Decision | `P0S7-1-IMPLEMENTATION-AUTHORIZATION-OA-20260905-01` |
| Inherited Authorization Status | `OWNER_APPROVED_AND_FROZEN` |
| Approved Implementation Scope | `AUTHORIZED_AFTER_APPROVAL`，仅承接已批准范围 |
| Current Deliverable | 仅本 Markdown Execution Plan |
| Execution Budget | `0` |
| Concrete Invocation Allocation / Startup Activation | `NOT_AUTHORIZED / NOT_AUTHORIZED` |
| Execution Plan Review / Execution Plan Owner Approval | `NOT_PERFORMED / NOT_PROVIDED`；不继承其他文档的审查或批准 |

本文把已批准的实现范围拆分为后续可审查的执行工作包、输入出口、产物、冻结顺序、证据义务和预算申请。**本次只创建执行计划，不执行计划中的 Runtime 实现、Package 准备/构建、Invocation 或 Verification。** 下文“创建、验证、启动、生成、冻结”等动作均指满足对应前置条件并取得具体权限后的未来工作，不表示已经发生。

## Planning Basis and State Precedence

四份必读文档及 Owner 批准所指向的 Implementation Authorization Decision 已读取。下表记录本次工作区原始字节身份，仅用于计划溯源，不构成 Runtime Snapshot、Trust Root、签名或执行冻结。

| Ref | Input | Bytes | SHA-256 |
|---|---|---:|---|
| B1 | [Implementation Authorization Owner Approval Decision](P0S-7-1-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-DECISION.md) | 14990 | `0DAD742EABE44B6B9F0B69F0189531FD353A0C039DA7A8CC2F16A0B75CD74349` |
| B2 | [Detailed Design Contract](P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | 86292 | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |
| B3 | [Architecture Planning Decision](P0S-7-ARCHITECTURE-PLANNING-DECISION.md) | 52261 | `9FCD637A922B25BCDA7B1F169F9CF9F06EE8754720EFC70D51992E2EA8665BA9` |
| B4 | [P0.S-6 Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | 11824 | `71E974AB17068FA0920A58B4E1D1BF2458D78633537E25C16666AD9562EC3349` |
| B5 | [Implementation Authorization Decision](P0S-7-1-IMPLEMENTATION-AUTHORIZATION-DECISION.md) | 26612 | `A3640948B83E1F63B5B3FFB7B19DB53ED4BAB4BD3BE257432718460B1B2A7480` |

B2、B5 的当前字节与 B1 中选定的精确身份一致。当前治理权限采用本次用户指令及 B1；B2 的 `DESIGN_ONLY`、B5 的 `OWNER_REVIEW_REQUIRED / NOT_PROVIDED` 保留生成时含义，不用这些历史字段撤销后续批准，也不回写源文档。B1 承接的 Detailed Design `FINALIZED`、两项 Review `PASS` 是已有治理状态，本文不生成新的 Review PASS 或密码学签名。

B3 原阶段分工保留；本文依 B1/B5 及本次用户要求规划 P0.S-7-1 Spike 的 A～D 工作包，不将其解释为 P0.S-7-2 / P0.S-7-3 已启动。细节采用 B2：例如 L2 为 Snapshot / Binding，L3 为 Package / Integrity；B3 较早的门禁排列和泛称 Validation Harness 不覆盖 B2 的最终设计术语。

```text
EXECUTION_PLAN_STATUS = EXECUTION_PLAN_ONLY
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S6_CANDIDATE = generated_not_applied
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
P0S7_1_AUTHORIZATION = OWNER_APPROVED_AND_FROZEN
IMPLEMENTATION_SCOPE = AUTHORIZED_AFTER_APPROVAL
CURRENT_USABLE_EXECUTION_BUDGET = 0
STARTUP_ACTIVATION = NOT_AUTHORIZED
EXECUTION_STARTED_BY_THIS_PLAN = NO
```

# 1. Execution Scope

## 1.1 唯一范围

本计划唯一的未来执行范围是 **P0.S-7-1 Runtime Controlled Execution Spike**：闭合输入，形成最小受控 Spike 及 Package Feasibility 所需工件，在独立授权下验证 Package / Runtime Identity、Snapshot Flow、Controlled Launch，并收口 Startup、Runtime、Failure、Recovery Evidence。当前交付只覆盖这些工作的计划定义。

不包含 Production Runtime、生产部署/发布、Full Agent Platform、P1 Implementation；不启动 P0.5、P0.S-7-2、P0.S-7-3、P0.S-8 或其他阶段。不以 Spike 局部结论宣称生产就绪、全局 P0.S PASS 或其他阶段完成。

当前写入白名单只有 `docs/04-development-records/P0S-7-1-EXECUTION-PLAN.md`。不创建 Runtime 或 Package，不修改代码、Runner、Manifest、Binding、Snapshot、签名、任何 lockfile 或既有状态文档；不执行测试、Invocation、Verification、Final Preflight、commit、push。

## 1.2 强制继承

| Inherited Constraint | 本计划必须落实的要求 |
|---|---|
| Authority Anchor | P0.S-7 适用的独立选择与批准；证明治理来源和构建源 ancestry，不将动态 HEAD 相等作为自引用冻结条件 |
| Execution Snapshot | 固定精确获准输入及唯一语义来源；不靠可变 Manifest 的内部自洽证明 Owner 批准 |
| Trust Root | 独立选定公钥用途、bootstrap validator / Runtime Validation Driver 和批准交付来源；先认证验证器再使用它 |
| Snapshot Binding | 认证精确 payload bytes，核对独立 expected Reference、正式读取路径和 envelope digest；旁路 corrected 文件不能替代正式入口 |
| Owner Signature | 沿用 Ed25519 精确字节模型及 `DER SubjectPublicKeyInfo SHA-256` 公钥指纹域；最终 payload 状态先定型再签名；私钥由 Owner 控制 |
| Final Preflight | B2 L0～L5 顺序执行，检查实际 exe/argv/cwd/env、权限、输入保护、租约、预算及临近 spawn 的同一对象 |
| Controlled Invocation | kind、case、Plan、Snapshot、批准与预算一致；spawn 前原子持久消费 slot；失败不退还、不复用 |
| Evidence First | Package 代码或 extraction tool 执行前建立认证来源、受保护证据流、fallback sink 和 durable budget ledger |
| Fail Closed Execution | 任一前提不成立即停止受影响链路；保留首失败和未知项，不降 Gate、不自动修复或重试 |

治理链保持 **Authority → Snapshot → Binding → Preflight → Invocation**。P0.S-6 的历史 key 用途、Anchor、签名、Snapshot、Invocation、已消费预算或 PASS 均不自动迁移为本次启动权限。任何复用信任材料的选择仍须有明确适用 P0.S-7 的 Owner 决定。

Candidate 保持 `generated_not_applied`，Source / DRRC lockfile 不变；不得使用失败 node_modules/cache/quarantine 冒充获准依赖基线。不引入或执行未经批准的第三方 Plugin，不自动更新、安装、heal、切换 Runtime strategy 或回退全局 Node/pnpm。启动与 READY 不授予真实 Agent turn、业务工具调用、答案提交、Agent resume 或业务重放权限。

# 2. Work Breakdown

## 2.1 顺序、责任与共同门禁

| Work Package | Goal | 主要依赖 | 未来出口 | 当前状态 |
|---|---|---|---|---|
| `P0.S-7-1-A` | Input Closure：确认 Runtime Spike 输入 | B1～B5、输入处置与具体实施边界 | 精确来源、Definition 方案、依赖闭包输入、环境/工具/权限/输出清单已闭合 | `NOT_STARTED` |
| `P0.S-7-1-B` | Package Feasibility：验证 structure、Identity、Integrity | A 出口、具体实现与独立准备/构建/验证权限 | 获准 Package Identity、完整闭包与实际 payload 对账、准备证据收口 | `NOT_STARTED` |
| `P0.S-7-1-C` | Controlled Launch：验证 startup authorization、Snapshot、Binding、Preflight | B 出口、精确冻结/签名/独立批准、各 case 生效及预算 | 真实 Gate、启动/拒绝、实例/生命周期与失败事实 | `NOT_STARTED` |
| `P0.S-7-1-D` | Evidence Finalization：生成并收口四类证据和 Validation Records | B/C 原始证据、适用的独立故障/恢复/收口权限 | 可重推索引、四维结论、缺口清单和 Owner disposition 输入 | `NOT_STARTED` |

A → B → C 是依赖顺序，不是自动放行链。D 的采集规范和 sink readiness 必须在 B/C 执行前就绪，原始证据随动作产生；D 的最终整理不能在运行后补造前置证据。B/C 失败也必须进入已获准的证据收口，但不能借收口启动新动作或恢复。

后续 Executor 整理输入、形成获准工件并执行具体批准；Reviewer 独立核对身份、边界与证据；Owner 选择信任源、处置输入缺口并批准具体范围、预算和生效条件。角色是职责分配，不虚构具体人员、审查结果或签名。本文 Architect 不授予任何执行额度。

## 2.2 P0.S-7-1-A — Input Closure

**目标：确认 Runtime Spike 输入，输出可供具体实施/准备批准使用的闭合记录。** 当前候选值仅从 B2 继承，不表示工件存在、已批准下载或已证明兼容。

| Input Area | 必须完成的未来工作 | 关闭证据 / 当前缺口 |
|---|---|---|
| Package source | 固定源码、发行来源、构建输入/脚本/toolchain、允许 patch 清单、archive 格式及精确版本与 ContentRef；区分构建工具和运行依赖 | Harness 固定 `@deepseek-ai/dsh@0.1.2-alpha.1` / `cd5ef8148158c3a752a658978873241fdf8e2bbc`，公开入口 `lib/bin.js`；完整分发字节、来源身份与构建工具仍待闭合 |
| Runtime definition | 使用 bundled Node sidecar、Windows x64、Desktop + Worker 两个核心长运行进程候选；固定入口 role、argv 模板、composition/profile、静态 roster、Carrier 协议、各权限策略 | B2 候选 Node `22.19.0`、Electron `35.7.5`；精确官方工件、ABI/native/helper/Client roster 未冻结；不选择 floating latest 或自动 fallback |
| Dependency closure | 明确可用 dependency baseline、锁定输入和 Candidate disposition；按 B2 定义 D/A/I 同域节点、边、文件集合及 hash 规则；列出所有动态分支允许表 | 不应用 Candidate、不改 Source/DRRC lockfile；若当前范围不能形成合法基线，记录 blocker 并提交独立处置，不能默认沿用失败缓存 |
| Environment constraints | 固定 fresh Windows fixture、完整 build/revision/镜像身份、普通用户上下文、host inventory、无全局 Node/pnpm、PowerShell 和外部 DLL inventory；定义真实根映射与资源上限 | B2 候选 Windows 11 x64 24H2 / `26100` family、Windows PowerShell 5.1；完整 revision、工具字节、fixture 来源仍待提供 |
| Trust / control inputs | 选定 P0.S-7 Authority Anchor、Trust Root、bootstrap Driver/collector、独立 Approval 交付与 expected Reference 选择机制；明确 ACL/token/handle/job/lease/ledger enforcement | 设计已定义，具体信任材料与 Windows enforcement 实物尚未闭合；不能把 P0.S-6 key 或当前开发机视为已选 fixture |
| Implementation / output boundary | 将已批准 Spike 骨架、Driver、collector 等范围展开为隔离输出根和逐文件允许改动清单，固定允许操作及既有文件保护规则 | 第 3 节为路径提案，实际绝对路径/ACL/逐文件清单仍需具体治理记录；本次不编写骨架 |
| Scope / acceptance dependencies | 明确 H-05/H-20、REQUIRED Host/Client、tool-cordis、cordis-host-runner、cordis-client-runner、ui-cordis 的 inclusion/omission 与证据义务 | H-05/H-20 仍 `NOT_PROVEN`；需要补证则单独范围/预算；Worker-only 必须在执行前获独立范围批准，不能在 Desktop 失败后缩小结果 |

预计输出为 Input Closure Record、允许改动清单、Runtime Definition 方案、来源/版本/角色 roster、依赖基线处置引用、fixture/工具/信任输入清单及 case-budget 提案。它们在本文中仅被定义，尚未创建。

**A 出口：** 每项输入有唯一责任域、精确来源/身份或明确不适用依据；构建/准备所需静态输入与边界可被 Owner 选中。待构建的 Package hash 不伪造，须在 B 形成后才能进入 Runtime 冻结。任何必需项仍未知时不得标 `INPUT_CLOSED`，只能交付缺口与下一决定对象。

## 2.3 P0.S-7-1-B — Package Feasibility

**目标：验证 Package structure、Identity、Integrity，形成可用于后续启动批准的精确输入。** 关联 B2 §2～5、AC-03/04/06/10/17。

1. A 闭合后，由具体实施记录选定隔离 Spike 源文件和验证工件清单，才进入已有实现批准允许的最小骨架工作。编写工件不附带安装、构建、启动或验证权限；实际构建有独立输入、工具、输出、有限资源和执行批准。
2. 按已选 ZIP、非 asar、真实磁盘布局候选形成未来包；结构须覆盖 Desktop、bundled Node、DeepSeek Harness 发布入口、production closure、composition、native/helpers、control 与许可资源。保持公开入口/依赖解析要求，不调用内部 boot 或 source/tsx fallback。
3. 对定型 archive、全量 payload inventory、组件版本/平台/ABI/入口、构建 provenance 形成外置 Package descriptor。包自身 hash 不内嵌包；inventory 不含自身摘要。所有被解释执行的配置、插件、Client script、DLL、native addon、loader/helper 均进入 inventory。
4. 依据 B2 §5.2 同域核对 `nodes(D) ⊆ nodes(A)`、`edges(D) ⊆ edges(A)`、`files(A) ⊆ I_pkg ∪ I_ext`，并要求 `observed payload files = I_pkg`。D/A/I 原始文件及全部组件逐项认证；额外、缺失、路径冲突、ABI/入口错误、未批准动态分支均阻断。不得用 require/import、执行 Node 或加载 native 来冒充静态核对。
5. 独立执行 **Frozen Archive → Preparation Invocation → Evidence → Byte Verification → Runtime Payload**。U0～U5 沿用 B2 §5.4：先认证工具/归档/成员与根，再持久消费 preparation slot，提取后先存证，再全量核对最终磁盘字节和保护状态。准备期间 Runtime budget 为 0，提取工具 exit=0 不等于 payload 合格。
6. 失败输出隔离，不原地补齐；若批准移动/复制到最终根，须在同一 Plan 明列路径与预算，落到最终根后再次核对。准备证据独立收口，后续 Startup Approval 在外部选中其 Ref；不把准备结果写入 Runtime Snapshot。

**B 出口：** Package Identity / structure / D/A/I / 最终 payload 一致，准备证据可追溯并 finalized，输入保护条件已明确，适用 Reviewer/Owner 处置已形成。结果仅可作为包与输入可行性结论；不等于 Runtime 已运行。B 未通过时 C 保持阻断，负例拒绝不能替代正例可行性。

## 2.4 P0.S-7-1-C — Controlled Launch

**目标：在独立具体批准下验证 startup authorization、Snapshot、Binding 和 Final Preflight。** 关联 B2 §4/6/9，进入前必须满足第 8 节全部适用门禁。

先完成第 4 节单向冻结、Owner Signature、精确独立 Freeze Approval 和具体 Startup Activation，再由已认证 Runtime Validation Driver 执行获准 case。各 Gate 采用 B2 的排列：

| Gate | 未来执行要求 | 必需输出 |
|---|---|---|
| L0 Evidence readiness | 验证 Driver/collector、受保护主/fallback sink、durable ledger 及容量 | 可持久来源与请求记录；失败零 Package 代码执行 |
| L1 Authority | 检查 P0.S-7 用途、Anchor/provenance、独立批准、case/Plan、时窗/撤销及所有预算 | expected/observed authority、批准来源、是否有效；不从规划状态推导权限 |
| L2 Snapshot / Binding | 认证独立 key/Approval/expected Ref、payload type/status/signature、正式 Binding 路径与 envelope digest、完整输入链 | 精确身份与首失败；拒绝 runtime facts、双重权威及引用环 |
| L3 Package / Integrity | 认证选中的 finalized preparation evidence，重核最终 archive/payload、D/A/I、组件及无额外输入 | 实际磁盘与批准输入一致的证据；不进行 silent unpack/加载探测 |
| L4 Permission | fixture、SID、非提权上下文、根/ACL/token、环境/网络/children 限制、Worker lease | 实际控制和归属证明；普通只读属性不能代替 enforcement |
| L5 Boundary / Final Preflight | 核对真实 exe/argv/cwd/env、正式入口、文件/父目录持续保护、时窗/剩余预算与 spawn 同一对象 | 短时一次性 decision；最长 5 秒，不产生额外权限 |

全部通过后才在 spawn 前原子持久消费唯一 slot 并取得 Worker lease。slot 消费、spawn intent/result、process created、instance/generation/PID/start-time/endpoint 及 READY 因果链分别记录。没有真实 OS、transport、DeepSeek Harness profile 初始化、`$events.ready` 和持久化证据，不填 READY。拒绝时下游为 `NOT_REACHED`；未能证明进程创建情况则保留 UNKNOWN。

获准运行中检查 Desktop/Worker 独立生命周期、children 归属、权限和预算；Desktop 重开只认证 attach/重建投影，不重启 Worker 或重放业务。S7-C28 持续写保护、S7-C29 并发共享 slot 等专门 case 依 B2 原期望处理，不以更早拒绝冒充目标边界证明。

**C 出口：** 已选择 case 的真实启动、拒绝、运行或失败事实可追溯，已消费预算和进程/租约终态可对账。出现未知残留时不进入替代 launch；转交已授权 containment/finalization 或后续独立对账决定，不能自行恢复。

## 2.5 P0.S-7-1-D — Evidence Finalization

**目标：生成并收口 startup evidence、runtime evidence、failure evidence、recovery evidence 及 Validation Records。** 关联 B2 §7～9；遵循第 5 节。

未来工作顺序为：检查各来源原始记录 → 核对身份/时间/因果/生命周期 → 对账全部预算、进程/children/lease/数据及缺口 → 按适用独立权限完成故障与显式恢复场景 → 封存原始证据 → 生成最终索引和四维分类 → 提交独立 Reviewer 与 Owner disposition。

四类失败为 Package corruption、Dependency failure、Startup failure、Runtime crash/interruption。故障注入必须预先批准隔离副本、单项 mutation、触发点、注入器身份及有限预算，不修改原冻结包。恢复必须具备 **explicit authorization + new state transition + evidence**：未知残留先独立 Q 对账，再明确批准 ATTACH、CONTROLLED_STOP 或 NEW_LAUNCH 中唯一动作及新 Plan/Invocation。重新准备、构建或启动分别申请预算，不能由 D 自动附带执行。

没有具体恢复批准时，未来真实发生的恢复请求记录 `RECOVERY_NOT_AUTHORIZED`；未到达写 `NOT_REACHED`，没有相关事件写不适用及原因。本文没有运行失败或恢复请求，不预生成此类事实记录。仅拒绝恢复的证据不能满足完整恢复可行性。

**D 出口：** 四类适用证据与 Validation Records 可从 raw artifacts 重推，finalization 条件成立才写 `FINALIZED`；否则保留 `INCOMPLETE / INCONCLUSIVE / OUTCOME_UNKNOWN` 及明确缺口。成功、失败或未决均可形成真实报告，不能因此自动关闭 P0.S-7 或开放下一阶段。

# 3. Artifact Plan

## 3.1 当前文件与未来输出根

本次仅创建本文。以下全部为 **`PLANNED / NOT_CREATED`**，不创建目录、空模板、Package、Snapshot、Binding、Invocation ID 或 Evidence Records。

未来仓库内隔离输出根建议为 `docs/04-development-records/experiments/P0S-7-1-RUNTIME-CONTROLLED-EXECUTION-SPIKE/`，表中路径相对该根。此根是提案，不是实际根批准；A 必须展开逐文件允许改动清单和规范路径后提交具体治理决定。fresh Windows 的 package/staging、DSH_HOME、workspace、TEMP、evidence、control 和 trust roots 必须另行固定绝对路径映射与权限，不能因为仓库路径存在就获得主机写权限。

| Artifact | 计划位置 / 内容 | Producer / 时间 | 数据域与接纳边界 |
|---|---|---|---|
| Input Closure Record | `planning/input-closure-record.md`；来源、缺口、逐文件清单、scope 与责任处置 | A，具体后续治理范围内 | 治理记录；不冒充 Snapshot 或 runtime evidence |
| Runtime Definition | `inputs/runtime-definition.json`；strategy/role/argv/profile/roster/policies | A 定义，B 完成包引用后定型 | `FROZEN_INPUT`；配置语义唯一权威 |
| Package Identity | `package/package-identity.json`；archive ContentRef、payload inventory、D/A/I、组件与 provenance 引用 | B，独立获准构建后 | `FROZEN_INPUT`；标签不代替字节身份，descriptor 在 archive 外 |
| Package supporting inputs | `package/payload-inventory.json`、`package/declared-graph.json`、`package/actual-closure.json`、`inputs/external-inventory.json` | B，经准备/构建与静态解析批准 | 冻结依赖描述；过程日志和实际 load trace 另存 Evidence |
| Spike source / Package candidate | `spike-src/`、`package/` 中后续明确批准的文件/ZIP；只支持最小 Spike | B 前具体清单确认后，实施与构建分别生效 | 本表不授权生成；不创建 Production Runtime、安装器、生产发行或部署 |
| Frozen Invocation Plan / Input Manifest | `execution/<plan-reservation>/inputs/` 下独立命名文件；kind、操作、有限预算及完整控制输入 | 对应执行边界前，独立批准后形成 | `FROZEN_INPUT`；`<plan-reservation>` 是路径变量，当前不分配真实 ID；不含 ledger/结果 |
| Runtime Snapshot | `execution/<plan-reservation>/snapshot/runtime-snapshot.payload.json`；唯一 signed payload 本体 | C 前，所有上游输入定型后 | `FROZEN_INPUT`；下游计算 `snapshotRef`，不另建重复语义快照 |
| Trust / Signature / Binding / Approval | 独立受信渠道选择；正式 Binding 路径提案 `execution/<plan-reservation>/snapshot/snapshot-binding.json` | Owner 选信任源/签名；获准 Executor 交付；独立批准/Activation | 支撑前提，当前不创建或修改；实际读取路径与精确 bytes 必须被外部批准选中 |
| Preparation Snapshot / Records | 独立 preparation Plan 的 `execution/<plan-reservation>/`；准备类型 payload 及 ledger/raw/index | B 的获准 preparation | 准备 Snapshot 是输入；提取/byte 核对事实是 Evidence；不混入 Runtime Snapshot |
| Evidence Records | `evidence/<invocation-id>/raw/` 下 startup/runtime/failure/recovery 原始记录及 producer artifacts；ledger 单独受保护 | B/C/D 随实际动作追加 | `RUNTIME_FACT`；实际路径仍须满足批准 evidence root；尚未分配 invocationId |
| Validation Records | `validation/<case-id>/validation-record.json`；输入/批准/原始证据 Ref、expected/observed、四维结果及未决项 | D，在真实事实收口后 | 派生结果；Reviewer 必须能从 raw 证据重推，不能作为新 Snapshot 输入 |
| Final Evidence Index / Summary | `evidence/<invocation-id>/final-index.json` 与相应 summary；完整 artifact 集、预算/生命周期/缺口 | D，停止与 flush 完成后 | 索引不含自身 hash；精确 Ref 由后续独立 review/closure 固定 |

`case-id` 沿用 B2 S7-C、S7-R、S7-E 静态规格标签，不等于 Invocation。PREPARATION、RUNTIME_LAUNCH、RECONCILIATION、CONTROL_ACTION 的 Plan、Snapshot 类型、批准与账本用途不得互换；只读验证/收口按各自独立批准计数，不能因为 Runtime launch=0 就免除权限。

## 3.2 产物保护与变更

当前允许写入只有本文；后续文件清单未获具体生效记录前不得开始对应写入或执行。任何需要超出隔离白名单或更改 Source/DRRC lockfile、Candidate application、P0.S-6 冻结工件的请求，在本范围内阻断并提交独立决定。

新输入按 B2 使用严格 UTF-8 without BOM、LF 及固定 schema/排序规则；hash/signature 始终基于保存的原始 bytes。历史文件不重编码。上游字节变化时生成新身份并重建受影响的下游链，旧包、旧批准、旧失败证据保留；不借同名文件或版本号覆盖旧身份。

# 4. Snapshot Strategy

## 4.1 Runtime Definition → Runtime Snapshot → Binding

```text
独立 P0.S-7 Authority Anchor / Trust Root / bootstrap 与具体准备权限
  → 获准构建的 Package bytes、inventory、closure、Package Identity
  → Runtime Definition + Frozen Invocation Plan + Frozen Input Manifest
  → Runtime Snapshot（唯一 exact payload，最终 status/type 已定型）
  → Snapshot Reference → Owner Signature → Snapshot Binding
  → 外部选定的精确 Owner Freeze Approval / Startup Activation
  → Final Preflight → Controlled Invocation → Runtime Facts / Evidence
```

Authority 先选择可信来源和可做范围；实物生成后外部精确批准再选中 Snapshot/Binding 与具体启动权限，两者是不同治理事件。准备也需要自己的 Plan/Snapshot/Binding/批准/预算链；不能为了获得 Runtime 输入而跳过准备授权。

Definition 拥有配置语义，Snapshot 选择并固定该 Definition 和其他输入，Binding 只认证同一份 payload bytes。Definition 不回指 Snapshot/Binding/Approval；Snapshot 不含自身 Ref 或下游 Approval/Binding hash；Manifest 不含自身、Snapshot、Binding、Approval、ledger 或 Evidence hash。Package 内控制器不能为回填 packageRef 而修改已冻结自身字节。

## 4.2 字段分类与唯一权威

| 字段 / 对象 | Domain | 唯一存储 / 引用规则 |
|---|---|---|
| Package descriptor 的 archive 格式、byteLength/SHA-256、组件版本/platform/arch/ABI/role、静态 inventory 与构建输入 | `FROZEN_INPUT` | Package descriptor/inventory 拥有，Definition/Snapshot 用 ContentRef 或 FieldRef 读取 |
| runtimeStrategy、entry role、argv 模板、composition/profile、静态 plugin roster 选择、Client/Carrier 协议与 environment/permission/path/child/network policies | `FROZEN_INPUT` | Runtime Definition 拥有；Snapshot 不重复定义 Node version、execPath、argv 或权限以便覆盖 |
| invocationId 预留标签、kind、phase/scenario、允许操作、有限预算/deadline、根约束、authorityScopeId、适用 launchGroupId/recoveryCaseId | `FROZEN_INPUT` | 独立 Frozen Invocation Plan；预留不等于开始执行，当前不创建 ID；恢复标签由外部批准解析父失败 |
| schemaVersion=`1`、recordType=`P0S7_RUNTIME_EXECUTION_SNAPSHOT`、最终 status=`OWNER_APPROVED_AND_FROZEN`、独立批准的 authorityAnchor | `FROZEN_INPUT` | Runtime Snapshot 自有字段；status 是签名数据和必要条件，不能自证批准 |
| designContract、artifactIdentity、runtimeDefinition、invocationPlan、componentInventory | `REFERENCE` | 指向精确已冻结输入的 ContentRef，包含 type/locator/byteLength/SHA-256；仅引用不产生权限 |
| packageHash、dependencyClosure、environmentConstraints | `REFERENCE` | FieldRef 分别解析 Package archive hash、D/A/I 引用、Definition 策略与 Plan fixture/root 选择；无第二份权威值 |
| snapshotRef、正式 Binding envelope Ref、独立 expected Snapshot Reference / 选中 Approval Ref | `REFERENCE` | Snapshot 摘要在 payload 后生成；独立 expected Ref 与批准从外部受信渠道选定，不能只信 Binding 自声明 |
| PID、processStartTime、instanceId、generation、实际 SID/path/endpoint/nonce、actual argv/env/cwd | `RUNTIME_FACT` | 仅 Instance / OS / control Evidence；尚未创建为 null + reason，无法观察为 UNKNOWN + reason |
| Gate result、READY、heartbeat、preparation result、实际 load trace、slot consumed、已用/剩余预算、实际开始/结束时间 | `RUNTIME_FACT` | 仅 ledger / Evidence，不能回填 Snapshot 或被其引用的输入 |
| failure/recovery outcome、实际父失败/目标实例、实际停止/残留、Validation verdict、finalization 状态 | `RUNTIME_FACT` | Evidence / 后续独立治理记录；不直接或通过引用嵌入 signed Snapshot |

`Actual Closure` 是按最终获准布局和批准入口解析、审查冻结的依赖描述，属于 `FROZEN_INPUT`；生成它的工具进程、日志、时间、成功状态和运行中观测仍属于 `RUNTIME_FACT`。归档后的 Evidence 即使有 hash 或签名也不变成下一次 Runtime Snapshot 的合法输入。恢复父失败和目标 PID/instance 只能由外部动作批准关联，并在动作前重新认证。

REFERENCE 的类型不改变目标语义。Snapshot 的传递输入中禁止运行事实、重复权威、FieldRef override、未知字段和引用环；不接受把 PID 改名或藏在 metadata/被引用文件中的规避方式。实际 fixture 观测与预期 fixture 约束分开保存。

## 4.3 冻结与失效处理

签名前必须定型 payload 的最终 status、recordType、编码、空白和换行；签名使用原始 bytes，禁止 parse 后重序列化验签。payload digest 与 Binding envelope-file digest 分开，可信公钥、签名有效、独立选中 Snapshot 三项都必须成立。

Final Preflight 必须读取批准的正式 Binding 入口及实际 controller/spawn 入口，并确认同一对象持续受保护。旁路新 Binding、文档“已批准”或旧签名都不能修复正式入口不一致。Promotion 若需要，必须独立列明授权、路径和字节交付事实；不等于批准或预检。

包/依赖变化产生新 Package Identity；配置/入口/权限变化产生新 Definition；Plan/输入引用变化产生新 Snapshot、Signature、Binding、批准及 Final Preflight。preflight 到 spawn 任一目标变化、decision 超时或保护失效立即作废该请求；不自动重跑预检。运行事实变化仅追加 Evidence，不修改冻结输入或授予再次启动权。

# 5. Evidence Strategy

## 5.1 每条 Evidence 的必需字段

| Required Group | 必需定义 |
|---|---|
| identity | schemaVersion、eventId、recordType/category、phase/case/request、适用 invocationId/authority Ref；Package/Definition/Snapshot/Binding/Plan expected/observed Ref 和 `CLAIMED / OBSERVED / AUTHENTICATED / NOT_AVAILABLE`；实际实例的 instance/generation/PID/start-time/endpoint |
| source | sourceType/sourceId/sourceArtifactRef、原 producer process identity、collector identity、采集机制、sourceSequence；转发保留原 producer，不把转发来源当 OS 直接观测 |
| timestamp | UTC 发生时间、source-local monotonic tick、单位/epoch/clock uncertainty；发生、采集和补录时间分开；OS process start time 另记来源 |
| lifecycle state | stateBefore/stateAfter 或 observationOnly 当前状态、boundaryReached、firstFailureBoundary、subjectOutcome、evidenceState；未到达明确 `NOT_REACHED` |
| causality / comparison | causedBy/correlation、适用 parent Invocation/recoveryCaseId；operation、expected 及批准来源、observed 及采集来源、error/result、已用预算、launchAttempted/processCreated/runtimeEntered |
| raw artifact references | 受控根内规范路径、byteLength、SHA-256、原始日志/transport/ledger/批准引用；不得为取证越界读取秘密 |

身份尚未产生使用 null + reason 或 NOT_AVAILABLE；观察不足使用 UNKNOWN + reason。预身份拒绝至少具有 requestId、经认证 Driver 来源和原因，不将 claimed packageId 提升为认证身份。跨进程因果由 sourceSequence、causedBy、transport 和真实进程身份建立，mergeOrdinal 只表示汇总次序。

来源固定区分 `DEEPSEEK_HARNESS`、`RUNTIME_VALIDATION_DRIVER`、`EVIDENCE_COLLECTOR`、`DESKTOP_SUPERVISOR`、`WORKER_CONTROL`、`CARRIER`、`OS_OBSERVER`。Runtime Validation Driver 是独立验证工具，DeepSeek Harness 是业务组件；禁止泛称 Harness 或 source=runtime 掩盖来源。自报 READY/版本不能独立认证自身。

## 5.2 四类 Evidence

| Category | 最小记录内容 | 未来产生位置 |
|---|---|---|
| startup | fresh fixture/host inventory、preparation Ref、L0～L5、真实入口/参数策略、slot/spawn、实例认证与 READY/持久化因果链、未到达边界 | B 的准备 scope 与 C 的启动 scope 分开 |
| runtime | Worker/Desktop/children 生命周期、attach/detach/close/crash/reopen、权限和预算、获准数据探针、授权截止、显式 stop/exit、no replay | C，OS/Driver/Desktop/Harness/Carrier 交叉关联 |
| failure | 四类失败的首失败、故障输入/组件身份、expected/observed、错误/超时、已用 slot、未知项、受影响数据、containment 和残留 | B/C/D 的真实故障边界，cleanup error 不覆盖根因 |
| recovery | 父失败/原 Invocation、独立具体批准、新 Plan/Invocation、对账/唯一动作、新旧输入/实例/generation/数据、适用预检/预算、结果与 no retry/no replay | D 中另行获准场景；未获准或未到达如实标记 |

Plugin Evidence 必须逐项包含 `expected / observed / load / omit / blocked / error`、插件身份及 inclusion/omission 批准依据；缺失 REQUIRED load 不允许 silent omit，整体 READY 不能替代各插件结果。准备证据使用相同 envelope 并标 `scope=PREPARATION`，extractor 进程不是 Worker。

## 5.3 Evidence First 与持久化

任何 Package 代码或提取工具执行前，先建立受认证 Driver/collector、受保护主/fallback sink、预算 ledger 及相应请求事实。原始 producer 数据、collector 接收记录、派生 summary 分开；追加写入与权限/单写者/序号/长度约束共同识别截断、缺口、重复及乱序，JSONL 扩展名或 hash 本身不证明真实性。

request、Gate decision、slot consumed、spawn intent、failure、stop intent、terminal record 在依赖动作前持久 flush；slot/lease 原子事务失败不 spawn。普通事件最长 1 秒或 64 KiB flush，先到者生效。不得滚动覆盖原数据、静默截断、删除证据腾空间或补造掉电历史。

主 sink 启动前不可用则零 Runtime；运行中不可用、容量耗尽或序列缺口则停止新业务，只在预先授权范围使用 fallback 并有界 containment。全部 sink 失败不能保证即时落盘，必须保留 UNKNOWN/INCOMPLETE，待后续独立对账。日志不写私钥、token 或敏感环境原文。

## 5.4 Evidence Finalization

1. 确认已到达的停止/退出边界，核对 Worker/children、lease、generation、数据和所有预算维度；未能证实的项目保留未知，不假定已退出或预算未消费。
2. 持久 flush/关闭适用原始流，核对来源身份、四组必需字段、sourceSequence/因果、首失败及所有 NOT_REACHED；先保留原始事实再生成派生结论。
3. 对完整 artifact 集生成索引：规范路径、bytes、SHA-256、producer/source、时间范围、输入/批准 Ref、ledger 对账、残留/缺口、expected/observed 差异和 case 结果。索引不包含自身摘要，后续独立 review/closure 记录固定其精确 Ref。
4. Validation Record 分列 `subjectOutcome`（BLOCKED/STARTUP_FAILED/RUNTIME_FAILED/COMPLETED/INTERRUPTED/OUTCOME_UNKNOWN）、`validationVerdict`（PASS/FAIL/INCONCLUSIVE）、`evidenceStatus`（FINALIZED/INCOMPLETE）、`hypothesisDisposition`（PROVEN/PROVEN_WITH_CONSTRAINT/FAILED/UNRESOLVED）。
5. 只有批准期望与观测一致且证据完整才可判相应 case PASS；负例 PASS 可以同时为 BLOCKED，不证明启动成功。完整恢复需真实获准恢复证据。独立 Reviewer 重推结论，Owner 另行处置约束/阶段状态；不自动授予下一动作。

运行终态与 evidenceState=`OPEN / FINALIZED / INCOMPLETE` 是独立维度。退出码、summary 存在或时间耗尽不使证据自动 FINALIZED。后续对账追加新记录，引用原 Invocation/索引和真实补录时间，保留原 UNKNOWN/INCOMPLETE 历史；所有索引/摘要/结果均不回填 Snapshot、Binding 或 Manifest。

# 6. Budget Request

## 6.1 当前预算与授权

**Execution Budget = 0。** B1 的批准仅确定 P0.S-7-1 Spike 实现范围；没有具体 case 分配或即时执行权限。本文不请求即时执行确认、不创建 Approval、不分配 Invocation ID、不消费任何预算。

| Dimension | Current Allocation | Current Authorization |
|---|---:|---|
| Invocation / validation request / Driver session | `0` | `NOT_AUTHORIZED` |
| Preparation / Build / Unpack / extraction-tool launch | `0` | `NOT_AUTHORIZED` |
| Runtime physical launch / Worker child spawn / Desktop launch | `0` | `NOT_AUTHORIZED` |
| Reconciliation / ATTACH / CONTROLLED_STOP / Recovery | `0` | `NOT_AUTHORIZED` |
| Fault fixture preparation / fault injection / independent evidence review | `0` | `NOT_AUTHORIZED` |
| External network / registry/provider requests | `0` | `NOT_AUTHORIZED`；继承候选场景外网为 0 |
| Retry / Restart / Resume / Reuse | `0` | 隐式行为始终禁止；再次尝试须新的明确动作批准 |
| Candidate generation / application | `0` | 未授权生成；应用及 Source/DRRC lockfile 修改在本范围外 |

## 6.2 后续提交 Owner 的预算对象

下表是依据 B2 §6.5、§9.2～9.3 的**每个未来 case 的申请上限**，不是本计划已选择的 case、总数或已批准额度。A 必须选定有限 case 集并给出跨 case 数值总表后，预算申请才完整；未填具体数值、缺权限或与 Plan 不一致时不能执行。

| Request Class | 可提交的有限上限 / 用途 | 独立批准要求 |
|---|---|---|
| Input/fixture/tool preparation 与 Build | 当前 0；须独立给出工具/输入身份、命令与允许操作、构建/分析/工具进程次数、时限、CPU/内存/磁盘/产物上限、输出与终止范围 | B2 未为构建给出通用额度；本计划不以 P 解包额度覆盖下载、安装或构建，未形成具体合同即阻断 |
| V — 预检负例 | 每 case 1 validation request、1 Driver session；0 preparation/Runtime/payload child/network；120 秒 | 对选中的 S7-C/S7-R 负例分别批准；外层 V 下不产生可用 launch decision，不伪造 L1 PASS |
| P — Controlled Unpack | 每 case 1 preparation request、1 Driver session、最多 1 extraction-tool launch；0 Runtime/package scripts/network；600 秒；最多 100,000 成员、8 GiB 展开 bytes | 单独 PREPARATION Plan/Snapshot/Activation；S7-C21/23 等前置拒绝不会消费提取 slot，但请求仍有独立权限 |
| R — Runtime launch | 每 case 1 validation request、1 Driver session、最多 1 physical launch attempt；0 preparation/network；最多 4 个已列明 Worker child spawn、同时最多 2 个；运行窗口 300 秒 | 每 launch 独立 Plan/Snapshot/批准；UI 控制默认最多 3 Desktop launches、3 attaches、1 Worker stop，case 更小值优先 |
| Q — Reconciliation | 每 case 1 request、1 Driver session；0 Runtime/preparation/payload child/network；120 秒 | 单独选择父失败与读取范围；不包含 attach、stop 或业务恢复 |
| CONTROL_ACTION — ATTACH | 1 request、1 Driver session、1 Desktop launch、1 attach；0 Runtime/child/network；120 秒 | 独立现存实例动作批准，适用 S7-R10；实例身份外部选择并重新认证 |
| CONTROL_ACTION — CONTROLLED_STOP | 1 request、1 Driver session、1 stop；0 Desktop/Runtime/child spawn/network；120 秒 | 独立批准归属明确的 Worker/children，适用 S7-R11；不生成替代实例 |
| Fault fixture / injector | 当前 0；须给出隔离副本个数、唯一 mutation/触发点、工具进程/请求次数、写入清单、资源和总时限 | 不能从 R child 或 P extraction 默认挪用；必须固定原 Ref 和 observed/expected 分离规则 |
| Evidence review — S7-E01 | 独立只读收口 1 request、1 Driver session、0 Runtime/child/network；120 秒 | 独立 review authority；与原 Invocation 内已批准的停止/flush/finalization 分开计数 |

继承公共上限：L5 decision 最多 5 秒；READY 最多 60 秒/60 次只读观察且间隔至少 1 秒；graceful stop 10 秒、已批准 containment 5 秒、finalization 30 秒。R 的 300 秒从 slot 消费起算，到期只进入预先批准的 stop/finalization，不继续业务。

每 Invocation 原始 evidence 最多 256 MiB、单事件 1 MiB、fallback 16 MiB；每 R case 专用 DSH_HOME 与 TEMP 各最多 1 GiB，JSONL 探针最多新增 16 MiB。workspace 默认只读，任何写探针必须另列文件与有限字节；磁盘须覆盖 payload、数据根和证据完整上限。CPU/内存、构建 archive 上限等未在候选 profile 中量化的必要限制，必须在具体环境/预算记录给出有限值，不采用工具默认无限值。

## 6.3 case 选择、合计和消费规则

候选规格直接引用 B2：Package/Identity/Integrity 主要映射 S7-C13～24；Authority/Snapshot 主要映射 S7-C02～14；启动与运行映射 S7-C01、S7-C25～42；失败/恢复映射 S7-R01～11；收口映射 S7-E01。它们是可审查覆盖清单，**当前选中 case 集为空，全部分配为 0**，不一次性授权完整设计集合。

后续申请必须附：本文及 B1/B2 精确身份、有限 case ID 集、各自 expected outcome/首失败边界/触发点、输入与 fixture/Driver/collector/injector 身份、允许操作和根、各 kind 数量、请求/进程/时间/资源上限、全部维度数值合计、跨 case 共享约束、有效期/撤销条件、异常停止与证据收口范围。各 Plan 值与独立批准必须一致；实际权限需同时满足两者，不通过静默裁剪或扩大处理冲突。

恢复合计按动作拆开：S7-R05 为 1 P + 1 R；S7-R06 另有构建合同后再 1 P + 1 R；S7-R07 为 1 R，未知残留另加独立 Q；S7-R08 为 1 Q + 1 R。每项均须分别批准，不把“恢复一次”当作包含无限准备/启动。S7-C29 是两个有效 R request/独立 Plan 共享 `launchGroupId` 和 Runtime 总预算 1，individual/group ledger 同时原子限制；不能简单按两个 R 各给一次 launch。

slot 在 spawn 前持久原子消费，spawn 失败或中断不退还；结果 UNKNOWN 保留已用量并阻断替代启动。拒绝、过期或已消费请求不自动再用未消费额度。工具默认 retry、健康检查、重开 Desktop、改 case/Invocation 名称、重新预检都不能重置计数。扩大已审查设计上限须新合同审查及 Owner 批准；本文不自动授权、激活或扩大预算。

# 7. Stop Conditions

以下任一情况必须 **FAIL-CLOSED**。本节定义未来行为，当前不注入故障、不运行停止/恢复动作。

| Stop Condition | 检出与必须处置 |
|---|---|
| Identity mismatch | Package/Definition/Plan/工具/实例/generation/endpoint 与批准身份不一致；停止下一边界或控制动作，不以包名、PID 或自报版本替代身份 |
| Snapshot mismatch | 独立 expected Ref、精确 payload bytes、status/type、字段域或引用链不符；拒绝执行，不自动选择另一 Snapshot 或覆盖字段 |
| Integrity failure | archive/payload/hash、D/A/I、入口/native/ABI/helper 缺失、损坏、额外代码或非法路径；阻断准备/加载/启动，不 install/heal/fallback |
| Boundary violation | 路径/环境/权限/network/children/Plugin 越界、绕 Gate、TOCTOU 保护失效、隐式 retry/resume/replay；拒绝新动作，启动后仅执行已批准 containment |
| Evidence incomplete | identity/source/timestamp/lifecycle state 缺失、来源不认证、sink/ledger 不可持久、sourceSequence 缺口或容量超限；停止新业务，不形成成功结论 |
| Authority / Trust / Binding failure | 批准缺失/过期/撤销/错用途，Trust Root/Owner Signature/独立 Reference 不成立，正式 Binding 入口为旧字节；不继承历史 PASS 或旁路工件放行 |
| Budget / lease failure | 任一额度未授权、耗尽、无法对账、Plan/批准不一致、slot/租约原子事务失败或并发所有权不明；不得 spawn 或自动补预算 |
| Startup / Runtime failure | spawn error、身份握手失败、READY timeout、Worker/collector crash、授权到期、未知残留或无法证明退出；保留首失败、已消费 slot 及真实终态 |
| Input closure / scope failure | 必需来源/fixture/依赖基线/输出清单未闭合，必需 Windows enforcement 未证明，工作超出 Spike 范围；阻断相关实施/准备/启动并提交独立处置 |

启动前失败：不得运行 Package 代码或创建 Worker，记录首失败、launchAttempted=false 和下游 NOT_REACHED。`processCreated=0` 仅在可信外部观察足以支持时记录，否则 UNKNOWN；未授权准备失败还必须零提取工具启动。

启动后失败：停止接收新业务和新 Invocation，只在事先批准范围内停止确认归属的进程、隔离资源和收口证据；cleanup error 追加，不覆盖根因。sink 全部失效、退出或持久化无法证明时保留 `OUTCOME_UNKNOWN / EVIDENCE_INCOMPLETE`，不补写成功，也不对无关进程执行 cleanup。

失败不授予恢复权。需要读取残留、attach、stop 或 new launch 时，分别由独立 Owner 选定父失败/动作、新 Plan/Invocation、有限预算及适用完整门禁。旧 Evidence/slot 永久保留，不自动 retry/restart/resume/reuse，不降低 Gate 或事后更改 case 期望。

# 8. Acceptance Criteria

## 8.1 进入执行前的必需条件

下表是未来执行入口条件，不是本次已通过的运行验收。A 可以在后续明确的文档/输入整理范围内关闭缺口；任何准备/构建/验证工具执行仍须先具备该边界的精确输入、授权及预算，不能借 A 绕过。B 形成的真实 Package 身份随后作为 C 的输入，避免要求尚未构建的包预填 hash。

| Entry Criterion | 必须满足 | 当前处置 / 阻断边界 |
|---|---|---|
| Input closed | Package source、Runtime Definition 候选、dependency baseline/closure 输入、fixture/工具/host constraints、输出清单和 scope 必需项均有精确选择、责任和批准依据 | `NOT_CLOSED`；第 2.2 节缺口未消除，不能开始对应准备/构建 |
| Identity defined | Package/Definition/Snapshot/Instance/Invocation 五类身份、内容引用和唯一字段权威明确；执行前实际输入/工具具有精确 bytes/hash，禁止占位身份 | 模型已定义，实物待形成；B 前固定构建/准备输入，C 前固定 Package/Definition/Plan 全链 |
| Snapshot defined | 三域字段与单向依赖明确；对应 kind Snapshot 最终 type/status/bytes、Signature、独立 expected Ref 和正式 Binding 被选中 | 策略已定义，实物 `NOT_CREATED`；缺适用准备或 Runtime 链即阻断该执行 |
| Evidence defined | 四类记录、identity/source/timestamp/lifecycle state、来源 roster、sink/fallback、ledger、容量、flush/finalization、结果分类和缺口规则完整 | 策略已定义；真实采集工件与 L0 readiness 未形成，不是证据就绪 |
| Boundary defined | 唯一 Spike scope、逐文件/根/操作白名单、进程/环境/网络/子进程/TOCTOU/租约/停止范围清晰且可执行 | 本文定义合同边界；具体路径/白名单/Windows enforcement 仍待闭合与适用审查 |
| Authority and budget effective | B1 实现范围之外，具体准备/构建/验证/启动/对账/控制/恢复批准、有限 case 总表、有效窗口与 Plan 一致；必要生效状态由独立记录表达 | `NOT_AUTHORIZED`，当前预算 `0`、Startup Activation 未提供；不能仅凭计划改变 P0S7_ALLOWED |

五项必需条件 **Input closed、Identity defined、Snapshot defined、Evidence defined、Boundary defined** 加上有效权限和具体预算共同构成入口要求。只满足文档定义不等于执行就绪；任何缺口或 TBD/未知实物不能被标为 PASS。

## 8.2 未来工作包验收与证据覆盖

| Work Package | 退出验收要求 | 设计合同覆盖 / 未满足时 |
|---|---|---|
| A | 输入闭合记录、来源/角色/依赖/环境清单、输出白名单、信任选择与 case-budget 提案可供具体批准；必需缺口没有被静默排除 | B2 §9.4；缺口保持 OPEN，阻断依赖动作 |
| B | Package structure、archive/descriptor/inventory、D/A/I 及最终 payload 一致；独立准备/byte 核对/保护证据完整；无全局/源码/cache fallback | AC-03/04/06/10/17；负例拒绝不证明包正例可行 |
| C | fresh Windows、无全局 Node/pnpm、真实 Package/实例/READY、startup authorization、Snapshot/Binding、L0～L5、权限/TOCTOU/租约、Desktop lifecycle 与 no replay 有适用正反证据 | AC-01/02/05/07/08/09/11/12/16；未到达目标边界为 INCONCLUSIVE |
| D | 四类失败、未授权恢复拒绝与实际获准恢复均按已选范围举证；raw index、身份/来源/时间/状态、预算/生命周期对账及四维分类可重推 | AC-11～15/17；证据不足 INCOMPLETE/INCONCLUSIVE，恢复正例缺失不能宣称完整恢复通过 |

完整 Spike 成功必须满足 B1/B2 的适用验收义务：至少一种获准 Worker strategy 在 fresh Windows 上有真实正例，四类失败及对应显式恢复有完整证据，关键 trust/authority/permission/retry 缺口未被豁免。有限 case 子集只支持其实际范围的结论，不能宣称 B2 AC-01～17 全部完成；未授权或未执行项保留未证明状态。

H-05/H-20、H-21～H-26 的证据贡献、Core Patch/Layer C adapter 与生产影响分别记录；不因本计划或局部 packaged PASS 改写全局 Gate。Owner 接受约束也不能将未满足的必需门禁填为 PASS。Reviewer/Owner 的后续结论另行形成，不由本文代签。

## 8.3 本次计划交付核对与未执行事项

本次唯一新增文件为 `docs/04-development-records/P0S-7-1-EXECUTION-PLAN.md`，保存为 **UTF-8 without BOM、LF**。内容包括范围、A～D 工作包、未来产物、Snapshot 三域与单向链、Evidence Finalization、待批准预算、FAIL-CLOSED 条件及执行入口验收；状态保持 `EXECUTION_PLAN_ONLY`。

本次仅做静态文档核对：严格 UTF-8 解码、BOM/LF 与疑似乱码扫描、八章/必需字段/状态、文档引用和批准输入摘要、SHA-256，以及创建前后既有 Git 管理和非忽略未跟踪文件的字节身份/工作区范围。本文自身 SHA-256 在交付回复中单独提供，不回填自身。**测试方式：按用户要求未运行测试；未执行 Verification、Final Preflight 或任何运行验收。** 这些文档核对不消费执行计划预算，不产生 Runtime PASS。

未执行：Runtime/Package/Spike 骨架创建；代码、Runner、Manifest、Binding、Snapshot、Identity、签名或 lockfile 修改；Candidate 生成/应用；依赖下载、安装、准备、构建、解包或 Byte Verification；Invocation ID 预留、Invocation 创建/启动/消费；Driver/Runtime/Worker/Agent 启动；测试；Verification；Final Preflight；故障注入、对账、attach/stop、Retry/Restart/Resume/Recovery；密钥配置、私钥读取、Owner Signature 或执行批准生成；commit；push。既有工作区修改和原中文文件保持原状。

```text
DELIVERABLE = docs/04-development-records/P0S-7-1-EXECUTION-PLAN.md
EXECUTION_PLAN_STATUS = EXECUTION_PLAN_ONLY
WORK_PACKAGES_A_B_C_D = NOT_STARTED
INPUT_CLOSURE = NOT_CLOSED
CURRENT_USABLE_EXECUTION_BUDGET = 0
CONCRETE_INVOCATION_ALLOCATION = NOT_AUTHORIZED
STARTUP_ACTIVATION = NOT_AUTHORIZED
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
RUNTIME_CREATED = NO
PACKAGE_CREATED = NO
INVOCATION_CREATED = NO
TESTS_EXECUTED = NO
VERIFICATION_EXECUTED = NO
COMMIT_PERFORMED = NO
PUSH_PERFORMED = NO
```
