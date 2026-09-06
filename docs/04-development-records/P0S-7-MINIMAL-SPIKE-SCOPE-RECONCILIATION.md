# P0.S-7 Minimal Controlled Runtime Spike Scope Reconciliation

| Field | Value |
|---|---|
| Scope Reconciliation ID | `P0S7-MINIMAL-SPIKE-SCOPE-RECONCILIATION-20260905-01` |
| Document Status | `SCOPE_RECONCILIATION_ONLY` |
| Record Date | `2026-09-05` |
| Authority for Scope Planning | 本轮 Owner 明确要求重新定义最小验证范围；仅授权范围分析与本文创建 |
| P0.S-6 | `CLOSED / VERIFIED_WITH_CANDIDATE`；继承控制原则，不迁移执行权限或 Runtime 结论 |
| P0.S-7 / P0S7_ALLOWED | `NOT_STARTED / NO` |
| EAR-C01 / Input Closure | `BLOCKED / BLOCKED`；已有部分授权仍仅覆盖输入分析 |
| Runtime / Package / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Current Usable Execution Budget | `0` |
| Deliverable | 仅本文；不创建实现、冻结工件、运行证据或执行授权 |

## Basis and Effect of This Reconciliation

| Ref | 已读取的直接依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-ARCHITECTURE-PLANNING-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-ARCHITECTURE-PLANNING-DECISION.md) | `9FCD637A922B25BCDA7B1F169F9CF9F06EE8754720EFC70D51992E2EA8665BA9` |
| R2 | [P0S-7-1-DETAILED-DESIGN-CONTRACT.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |
| R3 | [P0S-7-1-EAR-C01-INPUT-CLOSURE-FINAL-RECONCILIATION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-EAR-C01-INPUT-CLOSURE-FINAL-RECONCILIATION.md) | `464F7183BEC09EBFAD5F6DFF8E6C52D249BC2EF263940C469E8873641E7DC383` |
| R4 | [P0S-7-1-EAR-C01-BLOCKER-RESOLUTION-PLAN.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-EAR-C01-BLOCKER-RESOLUTION-PLAN.md) | `DFC258279284DF0E65322E4C8C5B76FE8EF738206D413527479BADFE3A330385` |
| R5 | [P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md) | `83CDE876F95130F1A20D06061A626B88CECF1CC3281F6429D3808EE2090827BD` |
| R6 | [P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md) | `741236DAF541AD7BDC12E66DEC992545657223C6CFCCC1A35D650A71FBFA4581` |
| R7 | [P0S-7-1-INPUT-CLOSURE-O05-TRUST-CONTROL-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O05-TRUST-CONTROL-DECISION.md) | `3F7D8ECE92BAF59A8B793B1759AE126CB0ECF3AD18299DC6221E4D5382FB2338` |
| R8 | [P0S-7-1-PARTIAL-EXECUTION-AUTHORIZATION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-PARTIAL-EXECUTION-AUTHORIZATION-DECISION.md) | `C7C6435165F527154017841FB1CA29270A88775DD781743F682614D13CD11775` |
| R9 | [P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | `71E974AB17068FA0920A58B4E1D1BF2458D78633537E25C16666AD9562EC3349` |

另按文档规则读取了 Document Map、Current State、Development Map 和 P0.S Feasibility Spike 中的相关阶段条目；历史状态以最新明确的最终记录及本轮用户状态为准。文档摘要仅标识读取字节，不是 Runtime Source 认证。

本轮明确调整后续最小 Spike 的验证对象与结论范围。旧合同要求完整 packaged Harness、fresh Windows 分发与全量模块证明；这些要求不能继续全部作为本最小实验的准备前提。本文记录差异及其代价，不将旧记录改成 PASS、不修改既有冻结合同或工件，也不自动使旧执行计划适用于新范围。

# 1. P0.S-7 Actual Goal

**P0.S-7 的当前目标是验证 Shaco Forge 是否具备最小受控 Runtime 执行闭环。**

需要得到可证实或证伪的答案：在明确选择的实际项目输入和隔离环境中，独立受信控制入口能否先认证权限及 Snapshot，再启动真实 Desktop 与独立 Worker，完成一个有界确定性任务，留下可归属证据，并在授权、身份、边界或证据条件失败时拒绝或停止执行。

成功对象限定为本次选中版本、输入集合、环境及场景，原型标记 `NOT_PRODUCTION`。不要求先完成 Production Runtime、生产安装包、全部上游功能或 P1 项目启动。

| 既有规划前提 | 本次最小范围 | 结论限制 |
|---|---|---|
| 完整 packaged Harness 在 fresh Windows 启动 | 真实 Electron Desktop + 独立 Node Worker，从精确登记的有限工作布局启动 | 不证明完整 Harness、打包可分发性或无系统 Node/pnpm 的 fresh-install 能力 |
| Worker 必须承载完整 Harness CLI Host | Worker 执行 Shaco Forge 自有最小 Spike 入口，业务逻辑允许确定性 Stub | 明确变更的是本次被测业务范围；不伪称 Harness CLI 已执行，不调用其内部入口绕过问题 |
| bundled Node / Production Package 先就绪 | 使用精确选定并认证的 Node/Electron 分发文件作为显式实验输入；不凭 PATH 或缓存选择 | 不产生 Package Identity 或“已打包”结论；未来准备/复制/解包动作须各有授权 |
| 全量产品 roster / dependency closure | 完整覆盖本次实际执行和加载的有限集合 | 不要求完整生态，入选集合仍不能缺身份、缺依赖或隐藏加载 |
| fresh fixture 和全产品工具链先完成 | 一个有明确身份与隔离边界的目标环境，覆盖实际用到的工具/宿主前提 | 不宣称当前开发机自动合格，也不宣称跨机部署已验证 |
| 完整业务恢复和产品生命周期 | 本次失败可归属、有界停止、禁止隐式 retry/resume；记录恢复许可及未执行事实 | 不以恢复拒绝记录证明实际恢复成功；业务续跑、升级迁移等产品能力延期 |

这次范围收口不重开 P0.S-6，不提前冻结 Shaco Forge 全项目，不启动 P0.S-8、P0.5 或 P1。旧 H-05/H-20 及其他未证明 Gate 保留原状态；最小 Spike 的后续成功不能自动转写为旧完整范围或全局 P0.S PASS。

# 2. Must Prove in P0.S-7

以下七项都需要未来获准后的实际材料或运行证据；本文不预填通过。

| Proof ID | Must Prove | 最小真实证明 | 不接受的替代 |
|---|---|---|---|
| MP-01 | Source Boundary | 实际输入来自 `D:\Project\Shaco-Forge` 的明确选中集合；记录 commit/tree 关系、未提交/新建文件和允许差异、字节与 provenance；外部工具单独归属 | 把目录名、整库 HEAD 或 upstream 参考身份当作全部执行字节批准 |
| MP-02 | Minimal Runtime Entry | 获准实际 executable/入口启动，OS 进程与实例身份关联，Worker 完成一个确定性请求并形成真实结果/终态 | 只做静态文件检查、只写 READY、只有 UI connected 或全程仅负例 |
| MP-03 | Desktop / Worker Boundary | 真实 Electron Desktop 与独立 Node Worker 经认证本地 IPC 交互；Desktop detach/close 不自行重启或重放 Worker 任务；Worker 由获准控制方停止 | 两个函数或 Mock PID 冒充独立进程；Worker-only 结果冒充 Desktop 边界 |
| MP-04 | Authority Gate | 独立 Anchor、Trust Root/公钥用途、Owner Approval、精确 Driver 与时窗/预算检查真实成立；未获准、失效或重用请求在对应边界拒绝 | hard-coded allow、Mock Signature、接受被测对象自签自选、借用 P0.S-6 预算 |
| MP-05 | Snapshot Minimal Flow | 最小 Definition/输入/Plan → 精确 Snapshot payload → 独立选定 Ref/真实 Owner Signature/Binding → 正式入口 Preflight；篡改、错 Ref、错入口拒绝 | 只有 JSON schema/hash 自洽、旁路 corrected 文件、把运行结果回填 signed input |
| MP-06 | Evidence Generation | startup/runtime/failure/recovery 四类记录有真实来源、身份、时间、生命周期；原始记录可支持最终结论；未执行/未到达明确记载 | Stub 输出被当作 OS 事实、只有摘要无原始记录、缺证据仍 PASS |
| MP-07 | Fail Closed Behavior | 授权/身份/完整性/边界错误时不进入未获准动作；运行中失去控制或证据能力时停止新动作并在限时内收口 | 异常后继续工作、自动下载/修复/切换入口/重试、停止失败却报告正常完成 |

**可 Stub 的是业务内容，不是这七项的被测控制机制。** Stub 自身必须有真实源码和字节身份，经历相同启动门禁和进程/权限控制。它可以返回固定文本、固定任务结果或固定业务错误，不能伪造签名验证、OS 进程、IPC 认证、权限阻断、证据落盘或 finalization。

# 3. Deferred to P1

| Deferred Item | 延期内容 | P0.S-7 仍保留的最小义务 |
|---|---|---|
| Production Package | 产品安装布局、生产资源全集、完整 bundled 分发和跨环境可用性 | 实际实验布局及所有入选执行/加载字节身份与完整性 |
| Full Plugin Ecosystem | 任意插件发现、下载、热加载、全量 Harness/Client 模块及兼容性 | 一个显式有限 roster；Stub/omission 单列，不暗中加载外部插件 |
| Complete Dependency Marketplace | 全部依赖市场、resolver 覆盖、供应与更新体系 | 本次实际依赖声明、静态可达集合与输入清单对应 |
| Installer | 安装、卸载、系统集成和升级 UX | 本次环境、执行根与证据根有明确边界 |
| Release Pipeline | CI/CD、发行签名、发布渠道、版本推广与回滚流程 | Owner 对本次执行输入的 Signature/批准与精确选择仍真实执行 |
| Full Deployment | 全量 fresh-install 矩阵、生产主机准备、多用户/多租户/跨机部署 | 一个明确隔离环境及其真实权限、进程和证据控制 |

上述内容进入 P1 后续规划，本文不授权 P1 工作、不指定已批准的 P1 实施清单。产品 checkpoint/resume、迁移和自动恢复也留待后续产品合同；本次仍必须阻止隐式恢复。若未来要宣称受控恢复可行，必须另有新 Invocation 的明确授权和真实恢复正例，不能用 `RECOVERY_NOT_AUTHORIZED` 替代。

被延期组件一旦被实际最小执行链使用，其来源、依赖、ABI、权限与证据义务立即成为该次执行的必要输入；“延期 P1”不能成为隐藏依赖的豁免。

# 4. Current Blocker Reclassification

保留原 **5 个主阻塞、20 个明细编号**，旧状态不回写。下面按实际被测集合拆分“必须解决 / 可 Mock-Stub / 延期 P1 / 参考限制”，允许同一原明细拆出不同范围，不再把每个大项整体作为最小实验的阻塞。

| Detail ID | 既有状态 | 新范围处置 | 本次必须解决的最小部分 | Mock / Stub、延期或保留限制 |
|---|---|---|---|---|
| B01-S1 | BLOCKED | 参考限制，按使用情况处理 | 只对实际采用的上游参考结论补足出处；本最小自编 Stub 不依赖 upstream checkout 的 Git 身份 | 不 Mock 来源；不修复 Git、不改 safe.directory。上游真实集成的身份材料留待其实际采用时补足，旧限制保留 |
| B01-S2 | UNKNOWN | 必须解决 | 仅选中 Spike 源文件及控制工具的 commit/tree 关联、精确输入集合、已有差异与 provenance | 不要求冻结整个 Shaco Forge 或等待 P1 完整源码；未来新建文件取得授权后再记录其字节身份 |
| B02-R1 | UNKNOWN | 必须解决 + 可 Stub | 真实 Electron Desktop、独立 Node Worker、最小公开 Spike 入口及精确执行字节 | Harness 业务实现可由明确标注的确定性 Stub 替代；不证明真实 Harness 启动/集成 |
| B02-R2 | UNKNOWN | 必须解决；未选组件延期 | 确认实际选中 Node/Electron 的平台/版本与必要 ABI；所用原生组件须真实匹配 | 不选 node-pty 或额外 native addon/helper；其产品集成延期 P1。不得省略 Electron 自身必需文件/子进程 |
| B02-R3 | UNKNOWN | 必须解决 + 可 Stub | 一个固定 Spike profile、入口/argv、根、权限和操作范围 | profile 中只允许确定性任务；完整业务配置、模型供应商及多场景产品策略延期 P1 |
| B02-R4 | BLOCKED | 必须解决 + 可 Stub + 延期 P1 | 完整列出本次实际 Desktop/Worker/Driver/Stub 与必要辅助组件的有限 roster | 插件生态与完整 Harness/Client 模块组合延期 P1；Stub 单列身份，H-05/H-20 保持 NOT_PROVEN |
| B02-R5 | UNKNOWN | 必须解决 + 可 Stub | 真实本地 Carrier、认证握手、协议版本、请求关联与拒绝路径 | 业务响应可 Stub；不能 Mock IPC、身份握手或伪造 Harness ready。完整产品协议兼容性延期 P1 |
| B03-D1 | BLOCKED | 必须解决；产品基线延期 | 只为实际入口选择有限源码/二进制/工具依赖基线；无安装步骤时明确其不适用理由 | 不要求现有不相关整套产品锁先修复；Candidate 仍 generated_not_applied。选入的依赖若受坏锁影响仍阻断 |
| B03-D2 | UNKNOWN | 必须解决；生态延期 | 列全本次执行链的声明、必需内嵌组件及已明确宿主依赖 | 完整 Dependency Marketplace 延期 P1；不能把未声明的实际加载项称作 Mock |
| B03-D3 | UNKNOWN | 必须解决；分发范围延期 | 对本次有限工作布局形成可达执行/加载闭包；禁止未批准搜索与 fallback | 不要求先形成 Production Package 的全部闭包；实际选中布局的闭包不能用运行日志猜测 |
| B03-D4 | UNKNOWN | 必须解决；产品库存延期 | 完整记录本次可执行/可加载输入与依赖清单，关联精确路径、字节和宿主来源 | 完整产品 payload/市场库存延期 P1；清单缩小的是对象集合，不是降低入选对象的完整性 |
| B04-E1 | UNKNOWN | 必须解决；生产安装环境延期 | 选择一个明确且隔离的 Windows x64 验证环境，确认 OS/架构、隔离和可恢复边界 | fresh Windows 无全局工具的分发验证不作本最小闭环前提，留待 P1 分发准备；不得据此宣称原 fresh-fixture Gate 通过 |
| B04-E2 | UNKNOWN | 必须解决 | 记录与所选进程/IPC/根/权限/资源有关的宿主事实与持续控制能力 | 无需全机器产品资产普查；不能直接冻结当前开发机状态，不能 Mock ACL/进程控制 |
| B04-E3 | UNKNOWN | 必须解决；未用工具延期 | 确认本次真正执行的 Node/Electron、Driver/collector 及其宿主依赖身份 | 没有 build/install 时不要求产品 build/package 工具链；一旦实际使用就恢复其身份前提 |
| B05-T1 | UNKNOWN | 必须解决 | 由 Owner 独立选择适用于本次源/控制工具的 Authority Anchor 与来源关系 | 不以当前 HEAD 自选、不借用历史 Anchor 批准；全项目未来发行身份不作前提 |
| B05-T2 | UNKNOWN | 必须解决，禁止 Mock | 真实独立 Trust Root、公钥用途、Signature 检查与 expected Reference | 可经 Owner 明确选择复用合适的已有材料，但不能自动继承 P0.S-6 的用途、签名或结果 |
| B05-T3 | UNKNOWN | 必须解决，禁止 Mock | 精确 Driver/collector 身份、独立受信交付、有限职责和适用批准 | 复用已审查实现需确认 S7 适用性；不要求重建通用验证平台，也不信任被测 Stub 自报 |
| B05-T4 | BLOCKED | 必须解决，分阶段授权 | 准备前取得具体准备权限；实际启动前取得本最小范围的执行授权及有限预算 | 不得要求在零权限阶段先做出实物；本文不创建或激活任何批准 |
| B05-T5 | UNKNOWN | 必须解决，准备后形成 | 获准准备后形成最小 Snapshot、真实 Signature/Binding 和独立 Reference；正式入口实际读取 | 不是准备授权前的实物前提，却是 Runtime 启动前门禁；不允许无签名临时通道 |
| B05-T6 | UNKNOWN | 必须解决；通用能力延期 | 真实保护执行输入、写入根、IPC、进程/children、时限、单次消费与证据持久化；有界停止 | 按本次威胁/操作范围证明控制；产品多租户、跨机调度、长期恢复能力延期 P1，不 Mock 实际安全控制 |

B01-S1 不再是本次自有 Stub 路径的必经 Git 修复任务。未被使用的参考结论可留有身份限制；如果某项实际输入或关键判断依赖该参考身份，则先补足其出处，不能自动把 UNKNOWN 写成 CONFIRMED。upstream 继续为 `REFERENCE_SOURCE`，Shaco Forge 继续为 `ACTUAL_PROJECT_SOURCE`。

本次不会 Mock 任一实际输入的身份。完整 Harness、插件、native/helper、生产包及环境矩阵不再作为最小准备许可的总前置条件；但选中 Electron 的内嵌依赖和自身辅助进程、控制工具及其宿主需求仍须覆盖。新范围不是“仅列两个脚本就假定闭包”。

# 5. Minimal Spike Design

## 5.1 Smallest Useful Experiment

```text
独立 Owner 选择 / 信任输入 / 有限授权
                    ↓
受信 Driver / Collector → 最小 Snapshot / Binding / Preflight
                    ↓
真实 Electron Desktop ← 认证本地 IPC → 独立 Node Worker
                                            ↓
                              确定性业务 Stub：一次请求/结果
                    ↓
       真实进程与边界观察 → 显式停止 → Evidence Finalization
```

选定一个本地 IPC Carrier，定义固定版本的最小握手、request/result/error/stop 语义与请求关联。Carrier 的精确选择和权限输入在未来准备/执行范围中定型；不提供运行时自由切换。无外部模型、无互联网业务调用、无插件发现/下载、无任意 shell/第三方任务执行。需要的故障触发只在获准的隔离场景内进行。

Desktop 是实际客户端角色，Worker 是独立进程角色；Driver/collector 可在同一受信工具中实现两个职责，但原始来源不能混写。Electron 自有进程仍纳入实际 child/control 清单。Desktop 的关闭不触发 Worker 重启或任务 replay，Driver 在获准时限内明确停止 Worker；不要求本次同时完成产品重连/会话恢复全部功能。

不构建 Archive 或 Production Package 作为首个正例的必要条件。Node/Electron 必须按精确路径、版本、来源和字节选定，不由全局命令发现。若取得它们需要下载、复制、解包或安装，必须先取得该准备动作授权；这不是本文允许执行的旁路。

## 5.2 Minimal Inputs

| Input | 最小内容 | 形成时点 |
|---|---|---|
| Source selection | 项目根内有限源集合、用途、base commit/tree 关系、明确差异/新文件来源；外部组件独立 provenance | 准备前确定范围；新文件在获准创建后补齐字节身份，不要求先 commit 或冻结全项目 |
| Runtime / roster | 精确 Node/Electron、最小 Desktop/Worker/Stub/Driver、必要 helper；单 profile 和 Carrier/version | 准备时定型；启动前以实际字节认证 |
| Dependency / layout | 本次声明图、可达执行/加载集合、有限工作布局清单和显式宿主依赖 | 获准准备后完整核对；不需要未采用产品插件的 closure |
| Environment / policy | 一个目标 Windows x64 环境；所用工具身份、只读执行输入、受限写入根、IPC、进程/child、网络、deadline 与停止条件 | 准备工具运行前有适用前提；Runtime 启动前有完整可用控制 |
| Trust / authorization | 独立选定 Anchor/公钥用途/Driver，具体允许动作、对象、时窗和有限预算；正式 Binding 入口与 expected Ref | 准备权限与 Runtime 启动权限分开；后者必须对应最终对象 |
| Evidence contract | 原始 producer/collector、四类记录、持久化/失败处理、finalization 与禁止自动恢复 | 在对应受控动作之前明确并具备实际记录能力 |

commit/tree 是来源关联，SHA-256 是精确字节身份，Owner 选择是使用许可，三者不能互换。新文件未提交必须如实记录；不得为了文档自引用而先 Commit，或把包含本文的未来 commit SHA 回填到本文。

## 5.3 Planned Artifacts — Not Created

| Artifact | 最小用途与身份归属 | 当前 |
|---|---|---|
| Selected Source / Input Record | 普通分析记录列出有限输入和出处；不自动成为 Frozen Input Manifest | 本轮不创建 |
| Minimal Desktop / Worker / Stub / Driver 实物 | 后续获准创建的 `NOT_PRODUCTION` 源码与工作布局；Worker 真实运行，业务能力注明 Stub | `NOT_CREATED` |
| Selected Input Inventory + Runtime Definition | 清单独占版本/路径/字节事实；Definition 独占入口、profile/roster、Carrier 和权限语义 | `NOT_CREATED` |
| Bounded Invocation Plan | 独占 Case、允许动作、时窗、有限预算与输入/证据根约束；文档不能自授权 | `NOT_CREATED` |
| Minimal Runtime Snapshot | 选择上述精确引用、适用范围/最终状态与 Anchor；不复制第二份可覆盖配置 | `NOT_CREATED` |
| Owner Signature / Binding / Independent Approval | 真实认证 Snapshot payload 与正式入口；payload digest 与 Binding envelope digest 分离 | `NOT_CREATED` |
| Evidence / Finalization / Verdict | 原始事件、进程/IPC/文件观察、缺口与最终场景结论 | `NOT_CREATED` |

这是工件用途计划，不是可执行 schema、冻结身份或 Package Identity。最小布局不是 Production Package，不能把未创建的 packageRef 填成假身份；后续最小 schema 必须明确其输入类型及不适用字段，禁止以绕过旧 schema 检查方式启动。

`FROZEN_INPUT` 仅限未来获准定型的有限源码/工具/配置/策略/Plan；`REFERENCE` 包括上游参考及历史记录，承担实际认证用途的引用必须独立精确选定；`RUNTIME_FACT` 包括实际 PID、start time、generation、实际宿主观察、时刻、消费量与结果。运行事实及其间接引用不得进入 signed Snapshot，不回填上游 Definition 或输入清单。

## 5.4 Evidence and Acceptance Criteria

四类 Evidence 继续保留；每条具备 identity、source、timestamp、lifecycle state，并关联 Case/request、已存在的 Invocation、输入 Reference、producer/collector、expected/observed、达到边界及首失败。没有进程或未到达动作使用明确原因，不制造占位成功事件。秘密材料不写入记录。

| Category | 最小证据 |
|---|---|
| startup | 独立批准/实际 Binding 路径、Gate 结果、所用字节、spawn/OS 进程身份、真实握手和 READY；拒绝则记录 NOT_REACHED |
| runtime | Desktop/Worker 分离、真实一次请求/结果、进程和 child 生命周期、Desktop detach/close、显式停止与资源终态 |
| failure | 首失败边界、触发输入、真实拒绝/停止、已消费预算、残留/未知及 cleanup 结果；故障注入本身不是成功证明 |
| recovery | parent failure、恢复决定与适用授权；未获准时真实记录 NOT_AUTHORIZED/NOT_REACHED 和无自动恢复；不声称已恢复 |

Evidence First 要求在越过有副作用的受控边界前具备对应记录能力。运行中记录失败时停止新业务动作并执行已经授权的有界停止；如果停止或最终记录也不能完成，保留 UNKNOWN/INCOMPLETE，不能由缺失推断已安全退出。finalization 对照原始事件、进程终态、消费量和缺口形成不可回填输入的结论。

| Case / AC | 未来实际场景 | 必需判据 |
|---|---|---|
| MS-C01 | 获准正常闭环 | MP-01～06 关联同一实际选中输入；真实 Desktop/Worker 完成一次确定性任务、停止并 finalize。只有负例通过不能满足 |
| MS-C02 | 缺失/失效权限、耗尽或复用请求 | 各批准负例在对应边界拒绝；不进入未获准 Runtime 动作，不增加/退还/借用预算 |
| MS-C03 | 错身份、修改输入/快照、无效签名/错 Ref 或旧 Binding 入口 | 实际入口的真实 Gate 阻断；不能只比较两个同源自声明 hash |
| MS-C04 | 未认证连接、越界操作或不允许 child | 本地 IPC/根/进程边界在真实机制中拒绝；缺少必要控制时不启动 |
| MS-C05 | Desktop detach/close 与显式 Worker stop | OS 与通信事实证明角色分离；无重复任务/自动重启，Worker 按授权停止 |
| MS-C06 | Worker 故障/超时或 evidence sink 失效 | 首失败可归属；停止新动作、有界收口，无 implicit retry/resume；证据不足则 INCOMPLETE |
| MS-C07 | 无恢复许可时提出恢复意图 | 真实拒绝，原失败记录保留；未产生恢复进程或任务 replay，不宣称恢复能力已通过 |

表中是场景族及判据，数量不等于 Invocation 预算；变体、故障点和工具操作由后续具体授权列明。本文件不发放默认一次测试或恢复额度。

可形成正面可行性结论的条件是：七项 Must Prove 均有真实充分证据，正例达到 Runtime 并完成收口，批准范围内的负例表现符合 FAIL-CLOSED，未解决的控制缺口为零。真实不符合预期应记录 FAIL；证据不足或未到达记 INCONCLUSIVE/NOT_PROVEN。当前所有运行判据仍 `NOT_EXECUTED`。

最终报告必须同时列明：被测输入/环境、哪些业务被 Stub、延期项、失败/未决及结论适用范围。“最小闭环可行”不等于 Production/Harness/全插件/Package 或全局 P0.S 通过。

# 6. Authorization Boundary

## Two Separate Readiness Points

1. **准备前：** 有本最小范围、拟用源/工具/环境的可审查材料、允许创建/取得的具体对象与路径、禁止事项及明确准备授权，即可讨论有界准备。无需先得到尚不允许创建的 Runtime、Snapshot、Binding，也无需关闭不在本次路径中的全部产品缺口。
2. **启动前：** 获准准备已产生所需真实字节，有限依赖和控制材料齐备，Snapshot/Signature/Binding/独立批准链定型，具体 Runtime/验证/Invocation 权限和预算有效，再由真实 Final Preflight 决定是否允许跨越执行边界。

上述是未来授权的依赖顺序，**本轮两个阶段均未获执行许可**。准备成功不自动授权 Runtime；范围变小不自动提供预算。旧 Detailed Design/Execution Plan/Authorization 中与最小范围不同的对象及判据，须在后续具体 Owner 授权中明确采用本范围并列明适用差异，不能混用两套标准选择性报告 PASS。无需为未选中的产品模块先制造“已闭合”文档。

当前 Input Closure 继续 BLOCKED / NO；旧 20 项不被本文逐项认证或关闭。最小准备/启动就绪度应按上面两处门禁评估，不再机械要求先闭合完整生产输入。此范围定义已记录，后续不应把“重新决定是否缩小范围”作为无材料推进的循环任务。

```text
DOCUMENT_STATUS = SCOPE_RECONCILIATION_ONLY
SCOPE_RECONCILIATION_ID = P0S7-MINIMAL-SPIKE-SCOPE-RECONCILIATION-20260905-01
P0S7_GOAL = MINIMAL_CONTROLLED_RUNTIME_SPIKE
SCOPE_PLANNING_ONLY = YES
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
EAR_C01_STATUS = BLOCKED
EAR_C01_AUTHORIZATION_STATUS = OWNER_APPROVED_PARTIAL_SCOPE
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
MINIMAL_PREPARATION_READINESS = NOT_ASSESSED
MINIMAL_LAUNCH_READINESS = NOT_READY
RUNTIME = NOT_CREATED
PACKAGE = NOT_CREATED
INVOCATION = NOT_CREATED
PREPARATION_AUTHORIZED = NO
RUNTIME_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
SIGNATURE_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
CANDIDATE_STATUS = generated_not_applied
CANDIDATE_APPLIED = NO
P1_STARTED = NO
PROJECT_FROZEN = NO
MINIMAL_SPIKE_VERDICT = NOT_EXECUTED
```

## Performed Work and Unexecuted Items

仅新增本文件，记录范围变化、七项真实证明、六类 P1 延期、20 项阻塞的范围拆分、最小输入/工件/证据/验收和分阶段授权边界。既有记录、治理状态和冻结工件保持原字节，不新增 ADR、执行申请或其他规划文件。

文档检查方式：静态核对必需章节、20 个原编号/历史状态、范围差异和边界字段、来源摘要、UTF-8 无 BOM/中文无乱码以及工作区文件前后字节；本文 SHA-256 在最终回复返回。按任务要求不执行测试或项目 Verification，文档检查不产生运行 PASS。

未创建 Runtime、Package、Snapshot、Binding、Signature、冻结源码或运行 Evidence；未修改代码、Runner、Manifest、lockfile、Git 配置或 upstream，未应用 Candidate；未下载、安装、构建、解包、部署或修改系统/权限；未读取私钥、签名、运行 Driver/Preflight、Invocation、测试、Commit、Push；未启动 P1。

