# P0.S-7 Runtime Execution Readiness Plan

| Field | Value |
|---|---|
| Readiness ID | `P0S7-RUNTIME-EXECUTION-READINESS-PLAN-20260905-01` |
| Document Status | `READINESS_PLAN_ONLY` |
| Record Date | `2026-09-05` |
| Target | `ED-C01 / MINIMAL_CONTROLLED_RUNTIME_SPIKE / NOT_PRODUCTION` |
| Phase A / Phase A Review | `IMPLEMENTATION_COMPLETE / PASS`，继承本轮用户提供的当前状态 |
| Runtime Execution Authorization | `REQUESTED` |
| Owner Execution Approval | `NOT_PROVIDED` |
| Execution Readiness / READY_FOR_EXECUTION | `NOT_READY / NO` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Runtime / Snapshot / Binding / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Current Usable Execution Budget | `0` |

本文规划如何补齐 ED-C01 的有限准备条件，不实施准备、不生成冻结输入、不授予执行权限。Phase A Review PASS 是静态阶段状态，不证明真实 Runtime、认证 IPC、OS 控制或 Evidence 持久化已经成立。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Runtime Execution Authorization Request](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-RUNTIME-EXECUTION-AUTHORIZATION-REQUEST.md) | `87A66A40BC2FE95A2B6DAFEA16DDDEE79AB7A23EAFBC0855FAE56574199A59EB` |
| R2 | [Minimal Spike Execution Design](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |

R1 只申请一次 ED-C01，Invocation 请求量为 1，Retry/Resume/Recovery 为 0，当前批准及可用量均为 0。R2 规定实际拓扑、无环 Snapshot、独立信任、真实门禁、Evidence First 和 Fail Closed。本文不扩大该请求，也不改写历史合同、批准或阶段状态。

# 1. Readiness Gap

下表按 R1 PC-01～PC-06 汇总为七个可交付的准备项。所有状态描述当前事实；后续成果列不是已创建工件或已批准动作。

| Gap ID | NOT_READY 原因 / 对应条件 | 当前状态 | 后续闭合所需成果 |
|---|---|---|---|
| RG-01 | 实际 Source/input set、Node/Electron 工件、ABI、helper/executable 及有限依赖闭包未选定；PC-01 | BLOCKED | 精确有限输入清单、来源与字节身份、组件适配关系，见 §2 |
| RG-02 | Phase A 是默认拒绝的骨架；真实管道、OS 对端认证、Driver、屏障、预算及停止路径尚未接入；PC-01/05 | BLOCKED | 在适用权限下完成真实控制实现及静态交付审阅；不能只解除 Phase A 锁 |
| RG-03 | Snapshot、正式 Binding、签名及独立预期引用不存在；PC-02/03 | BLOCKED | 获准后按无环顺序定型输入和交付正式冻结/绑定材料，见 §3 |
| RG-04 | S7 Anchor、Trust Root、Driver 身份和独立批准未选定；PC-04/05 | BLOCKED | Owner 选择信任及用途，固定验证器身份和独立外层授权入口，见 §4 |
| RG-05 | 目标 fixture、host/tool inventory、权限、进程 roster 和保护根未明确；PC-06 | BLOCKED | 目标环境及有限权限材料，明确当前开发机与目标的差异，见 §5 |
| RG-06 | 只有 Evidence 模板；主/备用 sink、持久化、独立 OS 观察及 finalization 未实现；PC-05/06 | BLOCKED | 完整采集/持久化/收口实现、来源字段和受控输出范围，见 §4～5 |
| RG-07 | Owner 未提供执行批准；准备、冻结、签名和验证动作也不能从请求推导权限；PC-04 及预算 | OWNER_REQUIRED | 明确适用准备权限，最终对精确材料和 ED-C01 作出执行决定；当前预算仍为 0 |

建议以以下依赖顺序推进。Owner 可以在一次明确决定中覆盖多个准备动作，不要求为每个缺口新增一轮文档；已有材料可直接引用，但每项必须有实际内容、身份、责任及授权对应。

| Step | 责任角色 / 准备动作 | 依赖与完成依据 |
|---|---|---|
| RP-01 选择与权限 | Owner 确定有限组件/环境/信任候选和准备边界；实施者列明拟写根、工具与副作用 | 先确认哪些动作已有适用权限，缺失的再明确授权；不要求先制造 Runtime/Snapshot 才能作出准备决定 |
| RP-02 准备与集成 | 获准实施者补齐最小执行集成；材料提供者交付选中工件；环境负责人准备目标 fixture | 在对应权限下完成 §2、§4、§5；组件与 ABI/helper 选择必须协调，不得事后自动替换 |
| RP-03 定型与审阅 | 实施者汇总有限输入；审阅者核对实际交付和剩余缺口 | 完成真实控制源码、环境约束、证据接口和字节清单后才定型；Phase A 旧 Review 不覆盖新增集成 |
| RP-04 冻结与信任交付 | 获准材料制作者与 Owner 按 §3～4 形成 Snapshot、签名、正式 Binding 和外层批准 | 仅使用最终选中输入；冻结/签名/Binding 均需对应权限，不因 RP-03 完成自动执行 |
| RP-05 执行就绪判断 | Owner 对精确 ED-C01 范围、时窗及预算决定；就绪审阅者按 §6 核对 | 条件齐备才可记录 READY_FOR_EXECUTION=YES；后续真实 Preflight 仍独立决定能否启动 |

当前只编写这些步骤，不执行 RP-01～RP-05 中的材料选择决定、配置、实现、冻结或激活。执行集成若需要测试、工具探测、安装、构建或其他运行，须先有明确适用权限和有限预算，不能用“准备检查”隐藏执行。

# 2. Runtime Input Preparation

目标是 `SELECTED_SPIKE_LAYOUT` 的实际可执行有限闭包，不要求 Production Package、Package Identity、Installer、完整插件生态或 P1 项目冻结。

| Input | 后续需确认的内容 | 当前确认程度 / 闭合依据 |
|---|---|---|
| Electron | 精确分发来源、版本、OS/architecture、字节身份、electron executable、内置 Node/V8 与必要 ABI 信息；renderer/GPU/utility 等有限辅助进程 roster | UNKNOWN；不能直接选择 latest、PATH 或当前安装版本；应有可追溯工件和有限组件清单 |
| Node | Worker 独立 Node executable 的来源、版本、OS/architecture、字节身份和必要内置组件/ABI 信息 | UNKNOWN；与 Electron 内置 Node 分别记录，不能把静态解析工具当作已批准 Runtime |
| ABI | 每个 native addon/helper 的实际宿主、架构、Node module ABI 或 Node-API 等适用兼容要求及材料依据 | UNKNOWN；不要求两个宿主 ABI 值相等，不以版本名替代兼容依据；仅在有限闭包确认不使用相应 native 组件后，才对该项标 NOT_APPLICABLE |
| helper | IPC OS 对端认证、凭据交付、独立 OS 观察和停止所需 native helper/addon/loader/DLL/外部 binary；各自来源、用途、加载关系和权限 | UNKNOWN；不能先把 helper 标为不需要来绕过真实控制。若选中实现确实不需要某 helper，应给出明确实现与闭包依据 |
| executable | Electron、Node、Driver/collector、实际 helper 的规范路径、文件大小/SHA-256、启动角色、入口与参数、父路径/加载路径约束 | UNKNOWN；身份覆盖全部可执行和可加载对象，不只覆盖入口脚本；禁止全局 PATH 或未列入清单的 fallback |
| Project source / task | `D:\Project\Shaco-Forge` 下选中 Spike 输入集合、base commit/tree 关联、patch/新文件来源和 provenance；SUM3 `[2,3,5]` 及独立预期 `count=3,sum=10` | 来源角色及任务规格已定义；精确执行集合尚未定型。upstream 仅作 REFERENCE_SOURCE，不冻结整个项目 |

准备顺序为：先选有限组件和宿主组合 → 明确哪些依赖真实参与加载/执行 → 准备实际文件与实现 → 对照声明、实际可达闭包及文件 inventory → 汇总唯一 Runtime Definition/Identity。源码、外部分发及控制工具分别记录来源。Candidate 不自动应用，既有 lockfile 不因准备计划而修改。

RG-02 的实现交付至少应包含真实 Named Pipe 收发/有界分帧及认证、独立 Driver 和 Worker 生命周期、执行屏障、不可复用预算 ledger、持续输入保护、超时及 stop/containment。Desktop 只负责请求/展示，Renderer 隔离；只有 SUM3 业务可用 Stub。接口声明、消息 role 字段、空模板、模型 stop 或 hard-coded allow 均不能作为上述机制的完成依据。

实施后以实际源码、接口契约、有限清单及适用审阅记录说明交付；运行机制的真实效果仍待获准 ED-C01 观察。若准备中需要新测试或验证，必须明确申请，本文不发放测试额度，也不把未执行的测试写成通过。

# 3. Snapshot Preparation

仅规划 R2 的 `P0S7_MINIMAL_RUNTIME_EXECUTION_SNAPSHOT` schemaVersion 1。本文没有创建 Snapshot、Invocation Plan、Frozen Input Manifest、Signature 或 Binding。

| Required Reference | 后续准备内容 |
|---|---|
| source identity | 有限项目输入集、base commit/tree/patch 与 provenance、路径/字节身份；不包含整个 checkout 的隐含冻结 |
| runtime identity | §2 最终选定的组件版本/平台/ABI 与完整有限清单；Definition 独立拥有入口、argv、profile、roster、协议和环境/权限规则 |
| input reference | 固定 taskInputRef、声明/可达/文件清单、冻结输入清单、控制输入；ContentRef 有角色/类型、规范路径、大小和 SHA-256 |
| approval reference | 先于 Snapshot 定型的 Scope Authority Approval，定位用途/范围/Plan 关联；不是本计划、执行申请或未来最终 Freeze Approval |

同时准备选定的 Authority Anchor 引用、适用 Scope/Design 引用及有限 Invocation Plan 引用。Plan 描述 ED-C01、允许动作、预算/时限/根策略；实际 Invocation、slot 消费和结果不在冻结输入内。当前不生成 Plan 或请求实例标签。

依赖顺序必须无环：先行范围批准 → 已定型 Source/Runtime/Task/Definition/Plan 输入 → 精确 Snapshot payload 与下游摘要 → 获准 Owner Signature → 正式 Binding → 独立 Owner Freeze Approval/Activation。后两者固定精确 SnapshotRef、正式 Binding 路径/envelope、key、Driver 及范围；不可由候选 Snapshot 自选可信批准。

| 数据域 | 边界 |
|---|---|
| FROZEN_INPUT | 预先确定的有限输入身份、预期角色/权限/根/时限和单一 Definition；payload 最终状态为 OWNER_APPROVED_AND_FROZEN，状态字符串本身不授予权限 |
| RUNTIME_FACT | PID、start time、instance/generation、实际 endpoint/nonce/credential、宿主观察、时间、Gate 结果和预算消费；只进入适用运行关联/证据，不直接或间接塞入 Snapshot |
| REFERENCE | 历史 P0.S-6、upstream、设计和治理依据；引用不代表当前 S7 自动信任或执行批准 |

Snapshot 不包含自身摘要或后续 Signature/Binding/最终批准摘要，最终批准不回填 payload。正式 Binding 必须承载同一精确 payload，并与独立预期引用、签名、公钥用途及批准一致；真实验证留给获准流程。

任何已定型输入变化，都使受影响的下游引用、签名/Binding、批准及 readiness 失效，应回到对应准备步骤；不得重算 hash 后自行继续，也不得借准备之名修复 Git 安全检查或改写历史材料。

# 4. Trust Preparation

| Trust Item | 选择/交付责任及所需材料 | 当前状态 |
|---|---|---|
| Anchor | Owner 选择 S7 适用治理来源、Git object identity、用途与继承关系；不用当前 HEAD 自动充当 Anchor | UNKNOWN / OWNER_REQUIRED |
| Trust Root | Owner 通过独立受信入口选择公钥身份、用途、信任链、时窗和撤销规则；历史 P0.S-6 Trust 仅作参考，复用须明确适用性 | UNKNOWN / OWNER_REQUIRED |
| Driver | 获准实施者交付 Driver/collector/Bootstrap 的精确身份和闭包；Owner 确定允许验证的对象、证据/控制范围及外层会话权限 | BLOCKED；真实控制实现未完成，不自动信任历史 Harness/Runner |
| Approval | 先行范围批准与最终精确 Freeze Approval/Activation 各有独立角色；Owner 明确执行许可、一次 ED-C01 预算和有效窗口 | NOT_PROVIDED；当前申请不替代任何批准 |

准备材料只需要可授权交付的公开信任信息和引用，不要求读取私钥。若后续签名由 Owner 或指定签名方完成，应在适用权限下对精确字节操作；本文不创建 key、不读取私钥、不签名、不配置信任。

Driver 的外层验证许可先于其运行，不能由候选 Runtime 的自声明 approval 或测试工具返回值授予。Bootstrap 应先认证 Driver 及宿主前提，再由 Driver 执行 R2 门禁；缺少这层独立入口时仍 NOT_READY。

RG-06 需随 Driver 一并准备：startup/runtime/failure/recovery disposition 的真实采集路径，producer 与 collector 分离的来源/identity/timestamp/lifecycle，独立 OS 观察、序列/因果及未知值语义；主 sink、受保护 fallback、关键意图与消费前的 flush 屏障、终态和 finalization 索引。原始文件身份、预算对账和资源终态须能重推，Worker 不能修改信任根、ledger 或 Evidence。

四类模板只能作为结构输入；准备完成不产生真实启动/结果或 PASS。Recovery 预算仍为 0，所需内容是 recovery disposition，而非恢复执行。记录不得泄露凭据、私钥或敏感环境值；主 sink 失效禁止新业务，fallback 仅用于已批准收口。

# 5. Environment Preparation

目标选择为用于本次 Spike 的隔离 fresh Windows fixture；具体镜像/版本/架构、路径和宿主尚未确认。当前开发机仅是材料整理所在环境，不直接冻结为执行目标，不直接继承其全局工具或权限。

| Item | 准备要求 / 完成依据 |
|---|---|
| fixture | 明确 Owner 接受的目标来源、OS build/architecture、隔离与初始条件、允许使用窗口、目录及资源归属；创建/配置需相应权限，不要求生产安装器或部署流水线 |
| host inventory | 目标环境实际 OS/架构、选定组件/工具及必要依赖的身份、与预期约束的差异；标明来源、采集方式和时效。探测工具运行需适用权限，不把未知填成已确认 |
| filesystem | 限定只读执行/输入/信任根与受控 Evidence/fallback/ledger 写入根，覆盖父目录及重定向风险；被测主体不能改写实际执行或信任对象 |
| process / child process | Driver 对已认证 Worker 独立启动/停止；Desktop 关闭不结束 Worker；Worker child=0；Electron 必需辅助进程的精确 roster 和有限数量由所选版本确定，当前 UNKNOWN |
| IPC / network | 仅批准的 Windows Named Pipe 与角色，真实 OS 对端认证和实例专用握手；受保护凭据交付，不经普通 argv/env、Renderer 或日志暴露；外部网络=0，无 TCP/HTTP fallback |
| ACL / permissions | 明确受信控制角色与被测角色、管道/文件/进程访问矩阵和最小权限；确认 OS 强制措施及修改权限归属，不能用文档声明替代 enforcement |
| stop / evidence | 明确 graceful stop、预先批准 containment、有限进程归属及终态观察；证据主/备用根、容量、写入/flush 和原始记录保护必须具备 |

预期 OS/architecture、角色与权限规则属于 FROZEN_INPUT；实际机器状态、SID、路径观察和权限探测结论属于事实域，保留来源及时间，不直接或通过 inventory 引用冻结进 Snapshot。二者由获准门禁比对，漂移时拒绝或撤销就绪状态。

当前不部署 fixture、不安装工具、不修改系统/ACL、不探测进程或创建管道。若后续环境准备需这些动作，应明确对象、根、工具、次数及副作用后在适用权限下完成，不默认使用管理员权限或绕过安全检查。

# 6. Execution Gate

## Readiness 与 Launch 的分别判定

本计划将 `READY_FOR_EXECUTION=YES` 定义为：**精确准备材料和实现均已交付且可审阅，Owner 已提供适用执行批准和有限预算，可以进入该获准 ED-C01 的受控验证/执行流程。** 它不是 Final Preflight PASS，不代表允许直接 spawn，也不是 Runtime 验收结论。

| 状态 | 判定 |
|---|---|
| NOT_READY | 准备、信任、环境、权限或预算仍存在必需缺口；当前即此状态 |
| 材料可供最终审批 | 下列 EC-01～EC-05、EC-07 的准备部分有实际依据，但 Owner 最终执行批准尚缺；仍 READY_FOR_EXECUTION=NO，不用新状态绕过批准 |
| READY_FOR_EXECUTION=YES | EC-01～EC-07 全部满足，且无相关 UNKNOWN/BLOCKED；仅可进入 Owner 批准的有界流程 |
| 启动边界 | 随后在该获准流程内，G-00～G-04 实际通过，G-05 持续有效且原子持久消费 slot，才可 launch；任一失败均不得启动 |

## Exit Criteria

| ID | 从 NOT_READY 退出所需依据 |
|---|---|
| EC-01 | RG-01：§2 的精确组件、ABI/helper 适用性、executable/source/task、有限依赖闭包及唯一 Definition 有可追溯材料；无隐式 PATH/加载项 |
| EC-02 | RG-02：真实控制集成已在适用权限下交付，静态审阅明确对应字节和边界；拒绝路径不是被删掉、认证/持久化/OS 控制不是 Mock。未进行的运行验证如实保留 |
| EC-03 | RG-03：获准创建的 Snapshot、Signature、正式 Binding 实际存在且有精确引用，引用无环、事实域分离，独立 expected Ref 可取得；实际验签/比对仍须在获准 Gate 内完成 |
| EC-04 | RG-04：独立 Anchor/Trust Root/Driver/Bootstrap 身份和角色已选定，来源、用途、时窗/撤销及外层验证许可明确；没有自信任或历史权限自动继承 |
| EC-05 | RG-05：fixture、host/tool inventory、精确 roster/有限数量、保护根、ACL 和停止归属有准备依据，权限条件无未决项；获准 Preflight 再确认当前实际状态 |
| EC-06 | RG-07：Owner 明确批准精确 ED-C01 输入/环境/Driver、Freeze Approval/Activation、一次有界会话和可用额度；Retry/Resume/Recovery 均 0，时窗及停止/证据权限齐备 |
| EC-07 | RG-06：主/备用证据与 ledger、屏障及 finalization 实现和目标根已准备；具备已批准的失败收口方案，来源/未知值/资源终态/预算对账语义完整；不要求提前制造 ED-C01 运行证据 |

就绪审阅应关联这些实际材料、适用批准及剩余未知，不要求新增一串占位文档。没有依据的项保持 UNKNOWN/BLOCKED；本文件的清单、摘要或 Review PASS 不能自行把它改为满足。

进入获准流程后，Preflight decision 到 spawn 最多 5 秒；不能把事前准备审阅当作可缓存的 launch decision。READY 最多 30 秒、TASK_ACCEPTED 至 result 最多 5 秒、从 Worker slot 消费起 Runtime 窗口最多 120 秒；Desktop 关闭后观察同一 Worker 2 秒；graceful stop 10 秒、已批准 containment 再限 5 秒、finalization 30 秒。Evidence 主 sink 8 MiB、单事件 64 KiB、fallback 1 MiB。上述沿用 R1/R2 的范围，当前没有批准任何运行额度。

slot 消费后启动失败不退款；预算消费不明不得重试。Preflight 过期不自动重跑；如需新的验证请求，必须有新的适用授权和预算。运行中按 G-06 持续约束，身份/快照/完整性失配、授权失败、IPC 认证失败、证据失败或越界均 FAIL-CLOSED，只可在已批准范围停止及收口。

READY 仅对实际选中的材料、环境和有效批准成立；任一相关变更、失效或权限撤销使其回到 NO 并重新评估受影响条件，不自动重签或扩大预算。后续状态变更须由适用批准与真实流程记录，本文不修改 P0S7_ALLOWED 或启动任何阶段。

ED-C01 的真实 SUM3 输出、Desktop/Worker 独立性、IPC 认证效果及正常 stop/Evidence finalization 是运行后的验收事项，不作为本轮可虚构的“已完成准备证据”。ED-F01～F07、生产 Package、安装/发行/部署、全插件生态和 P1 仍在本请求之外；ED-C01 就绪或通过不等于整个 Spike/P0.S-7 PASS。

## Current Verdict and Boundary

```text
DOCUMENT_STATUS = READINESS_PLAN_ONLY
EXECUTION_READINESS = NOT_READY
READY_FOR_EXECUTION = NO
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
OWNER_EXECUTION_APPROVAL = NOT_PROVIDED
REQUESTED_INVOCATION = 1
APPROVED_INVOCATION = 0
CURRENT_USABLE_EXECUTION_BUDGET = 0
RETRY = 0
RESUME = 0
RECOVERY = 0
RUNTIME = NOT_CREATED
SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
INVOCATION = NOT_CREATED
```

本轮仅创建准备计划并核对文档结构、UTF-8 编码、乱码及字节摘要。未创建 Runtime/Package/Snapshot/Binding/Signature/Invocation/真实 Evidence；未写代码、修改 Runner/Manifest/lockfile/Git 配置/upstream；未选择或创建 key、读取私钥、安装/下载/构建/解包、配置环境/权限、启动、测试、运行 Driver/Preflight、Commit 或 Push。
