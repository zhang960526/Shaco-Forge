# P0.S-7 Snapshot Preparation Execution Plan

| Field | Value |
|---|---|
| Plan ID | `P0S7-SNAPSHOT-PREPARATION-EXECUTION-PLAN-20260905-01` |
| Document Status | `PREPARATION_PLAN_ONLY` |
| Record Date | `2026-09-05` |
| Scope | `ED-C01 / MINIMAL_CONTROLLED_RUNTIME_SPIKE / NOT_PRODUCTION` |
| Runtime Definition | `FINALIZED_FOR_INPUT_PREPARATION`；目标选择已定案，精确输入闭包未闭合 |
| Snapshot Preparation / Trust-Binding Preparation | `DESIGN_ONLY / DESIGN_ONLY` |
| Snapshot / Binding / Signature / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| READY_FOR_EXECUTION / Current Usable Execution Budget | `NO / 0` |

本文中的 Execution Plan 是准备工作的步骤规划，不是 Runtime Invocation Plan。计划不包含 launch 命令、实际 Case/request/slot 标识或可执行 payload；本轮不执行下述输入收集、闭包验证或冻结步骤，只创建本文件并核对文档交付。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Snapshot Preparation Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SNAPSHOT-PREPARATION-DECISION.md) | `F3A06C33480F1CBFAE51C06039B9CC30E9C5F20D9432754D35CF3ACD272922AD` |
| R2 | [Trust / Binding Preparation Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-TRUST-BINDING-PREPARATION-DECISION.md) | `57E3303DFFFA4BD1092C64E10D1C4EAC63E188ED77FE168C8F4D7A039AB543C8` |
| R3 | [Runtime Definition Finalization Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-DEFINITION-FINALIZATION-DECISION.md) | `777F7044A89D6B506409E3A1ABB20653A8D8FC9CF0E8C7659E59AD664EC2E1CB` |

R1 规定最小 payload 与事实域；R2 规定独立信任、正式 Binding 和 Driver；R3 固定 Electron 35.7.5、Worker Node 22.19.0、项目自有 Worker、独立 Driver/collector 和必需 Windows 控制适配能力。它们均未完成精确输入冻结或授予运行权；本文不修改已有决定。

# 1. Snapshot Preparation Objective

为未来获准创建的 ED-C01 最小 Snapshot 准备可审阅输入，说明：**对象来自哪里、选择了哪些精确字节、这些输入由谁批准、是否完整且引用无环。** 这属于输入准备证明，不证明 Desktop/Worker 已启动、SUM3 已计算、IPC 已认证或 Fail-closed 已经运行验证。

准备成果应支持 R1 的 `P0S7_MINIMAL_RUNTIME_EXECUTION_SNAPSHOT` schemaVersion 1、`SELECTED_SPIKE_LAYOUT` 模型。其范围为真实 Electron Desktop → 认证 Windows Named Pipe `SHACO_SPIKE_IPC_V1` → 独立 Node Worker → SUM3，受独立 Driver/collector 控制；固定输入 `[2,3,5]`、独立预期 `count=3,sum=10` 不等于实际 result。

本计划的准备终点是“有限输入材料及其缺口可审阅”，不是创建 Snapshot。只有在适用授权下收集到完整且一致的实际材料，才可报告准备条件满足；随后仍须单独判断 Snapshot 创建/冻结、签名、Binding、最终批准及运行权限。Production Package、Package Identity、Installer、完整插件生态、部署和 P1 不纳入本准备闭合要求。

# 2. Input Collection

## 2.1 收集对象与责任

| Input | 后续需要收集的内容 | 来源 / 责任边界 |
|---|---|---|
| source identity | 项目根、base commit/tree 关联、实际 source set、patch/新文件字节、provenance、入口与资源依赖 | `D:\Project\Shaco-Forge` 下选中 Spike 源；实施者整理，审阅者核对。HEAD 不能独自代表未跟踪文件，不冻结整个 checkout |
| runtime identity | 选中 Electron 35.7.5、Worker Node 22.19.0、Desktop/Worker/Driver/collector/Helper 的平台、版本、ABI、来源与有限文件清单；唯一 Runtime Definition | 工件提供者与实施者提供实际材料，Owner 对需要选择的来源/用途作决定。工具 Node 24.19.0 与历史 Electron 盘点不自动准入 |
| selected files | 执行入口、脚本及递归依赖、preload/Renderer 资源、必要 executable/DLL/addon/loader、配置/schema/task/control 输入及预期环境/权限规则 | 从实际入口和加载机制推导，不把一个目录或现有 20-file/73-file 盘点直接认作闭包；每项标角色、采用/排除理由和来源 |
| references | 适用设计/决定、独立治理来源、外部组件资料、历史分析、准备观察 | 区分规范依据与执行依赖。仅参考的 upstream/P0.S-6/开发机资料不自动进入 selected files，也不自动建立信任 |
| approval references | 独立 S7 Anchor/公开信任选择、先行 Scope Authority Approval 的精确身份、用途/范围与有限 Plan 关联、Driver 外层许可要求 | 由 Owner 的独立受信渠道提供，不能由候选对象自选。最终 Freeze Approval/Activation 位于 Snapshot/Binding 下游，只列依赖要求，不伪造或提前回填 |

每项后续收集记录须标 `CONFIRMED / UNKNOWN / BLOCKED`，并说明所确认的具体范围。缺失项保留责任方与所需材料，不填零 hash、假 ABI、占位批准或推测版本；排除项须说明不参与执行/加载的依据，不能以“未找到”代替“不需要”。

## 2.2 Preparation Steps

| Step | 动作与依赖 | 预期准备成果 / 停止点 |
|---|---|---|
| SP-01 范围与权限核对 | 依据 R1～R3 明确 ED-C01、根、角色、组件目标及哪些准备动作已有适用权限 | 有限收集范围与缺失授权清单；未知权限不推导为允许下载、构建、工具运行或冻结 |
| SP-02 收集候选材料 | 在适用权限内收集 §2.1 五类已有材料；Source、外部分发、控制工具和批准来源分开 | 非冻结输入清单与缺口记录；缺 Node 实物、Driver/Helper、ABI、fixture/Trust 时按项 BLOCKED，不创建替代 Runtime |
| SP-03 字节身份登记 | 对实际选中的候选文件按 §3 记录 path/bytes/SHA-256/provenance，并保留角色与来源 | 可追溯字节记录；读不到、身份冲突、路径越界或期间变更即停止受影响项，不能自动修复 |
| SP-04 分域及依赖建模 | 依 §4 标 FROZEN_INPUT 候选、RUNTIME_FACT、REFERENCE，建立有限输入对象/字段引用图与加载边清单 | 唯一所有者映射、采用/排除说明、引用边表；图中禁止借 metadata 或间接引用夹带运行事实 |
| SP-05 准备验证 | 在适用分析权限内按 §5 逐项核对缺失、隐藏输入和引用循环；工具执行如另需权限则先满足 | 准备验证记录，逐项写依据/未决项；不运行项目、resolver、Preflight、验签或测试来制造通过结论 |
| SP-06 汇总与交付 | 汇总准备成果及 Owner 待决事项，按相同标准报告是否具备后续创建申请条件 | 非冻结准备总结；到此结束。Snapshot/Signature/Binding/Invocation 均不是本计划自动执行的下一动作 |

上述成果是后续预期产物，不是本轮已创建文件。可以复用已有记录并补充精确内容，不要求为每项新增占位文档。本文不授予新的实现或副作用权限，也不把已有白名单内的适用静态权限重新变为待批准。

# 3. Byte Identity

## 3.1 最小登记内容

| Field | 记录规则 |
|---|---|
| SHA-256 | 对实际保存的原始文件字节计算，明确对象类型；文件内容 hash、Git object ID、批准记录身份、公钥指纹、未来 payload/envelope digest 不是同一对象 |
| bytes | 与 hash 对应的精确字节数，不能以字符数、压缩前/后另一对象大小或版本标签代替 |
| path | 记录来源定位与所选根内相对路径，并明确后续实际解析对象；候选观察路径不等于获准 Runtime 路径。未选定目标路径保持 UNKNOWN |
| provenance | 项目源说明 base commit/tree、patch/新文件关系与来源；外部分发说明提供方、发行对象、版本/平台与可追溯交付依据；生成物说明与源/工具的对应关系，不补造不存在的构建记录 |
| role / type / domain | 明确 source、executable、resource、helper、control、task 或 approval 等角色及引用类型；版本/hash 相同也不自动赋予另一角色权限 |
| observation / status | 记录准备采集来源、时间和 UNKNOWN/BLOCKED 原因；这些观察字段留在准备记录，不整体移入未来冻结输入 |

## 3.2 登记方法与限度

1. 先确认文件落在允许收集的明确范围内；检查规范路径、大小写别名、相对路径越界及 reparse/symlink/父路径影响。一个角色存在多个可解析对象或来源不明时不自行挑“最新”文件。
2. 只读同一文件的保存字节，记录其长度和 SHA-256；对文本仅按明确编码读取，不为了方便 hash 转换换行、去 BOM 或重新序列化。无法确定原编码时停止可能改变字节的处理，不强制改写。
3. 对照来源、组件目标、角色和依赖归属登记。SHA-256 一致只说明所比较字节一致，不能证明来源可信、ABI 匹配、Owner 批准或 OS 保护有效。
4. 收集期间文件发生变化、身份冲突或读取不完整，废止受影响准备记录并记录原因；不得无说明地更新期望摘要继续。准备时的稳定读取不证明未来执行时无替换风险，实际持续保护留给获准控制流程。
5. 不自动拷贝、解包、安装、下载或构建来补齐字节。未取得的 Node 22.19.0、Driver/Helper、ABI 与控制材料保持缺口，不能使用工具 Node 24.19.0 的摘要代替。

只登记被选择或明确作为候选的有限文件与必要来源；不读取私钥、凭据或整套敏感环境。未来最终 payload 与 Binding envelope 的摘要只能在相应工件获准生成后分别取得，本文不计算、预填或生成它们。

# 4. Domain Separation

| Domain | 内容 | 准备处理 |
|---|---|---|
| `FROZEN_INPUT`（未来） | sourceIdentity、runtimeIdentity、唯一 Definition、selected task/control/files、先行 scope approval 与有限 Plan，预先确定的角色/权限/根/次数/时限 | 当前仅登记为候选域；必须先有实际材料、唯一语义和适用授权，不能因标签而被视为已冻结 |
| `RUNTIME_FACT` | PID、start time、generation/instanceId、实际 endpoint/nonce/credential、Gate/运行结果、预算消费、实际宿主与权限观察、运行事件时间 | 不进入 Snapshot 或任何间接冻结输入。实际运行事实只能在获准动作发生后记录；本轮不生成 |
| `REFERENCE` | upstream、P0.S-6 历史 Trust/Binding/Evidence、旧 Runner/Harness、外部说明、工具 Node、历史候选分发盘点及准备观察 | 保留来源与用途；不能自动转成执行输入、Trust Root 或批准，不把含事实的 inventory 整体冻结 |

具体区分：SUM3 `[2,3,5]` 与独立预期 `count=3,sum=10` 是预先选定业务输入；实际 result/PASS 是事实。有限 Plan 的获准预算上限是预期约束；已消费或剩余额度是事实。endpoint 命名/交付规则是预期约束；本次实际地址和凭据不是。目标环境要求与开发机/fixture 实际观察也分别归属。

每个字段和引用均应有唯一所有者。未知字段不得归入宽松 metadata 自动放行；存在冲突、混域或多个可覆盖定义时保持 BLOCKED。外部组件若实际参与运行，必须通过来源与精确身份准入进入所选输入，不能继续标 REFERENCE 来规避闭包要求。

# 5. Validation

本节定义**后续准备核对标准**，本轮不执行这些输入验证。准备审阅、密码学验证、Runtime Preflight 与运行验收是不同工作；前者不能替代后三者。

## 5.1 无缺失

| Criterion | 方法 | 满足标准 |
|---|---|---|
| VC-01 必需对象覆盖 | 将 R1 的 sourceIdentityRef、runtimeIdentityRef、runtimeDefinitionRef、inputReference、authorityAnchor、invocationPlanRef、先行 approvalReference 逐一映射到责任/来源/实际材料；schema/scope 按 R1 | 每个必需对象均有适用且无歧义的准备材料。最终 Plan/冻结对象尚未获准产生时明确缺失，不能把本文当作 Invocation Plan |
| VC-02 字节与引用可定位 | 对每个所选文件/引用核对角色、类型、规范路径、bytes、SHA-256、provenance 及实际目标；内容引用与字段引用分别核对 | 所需记录和目标一致，无缺文件、占位值、悬空引用、冲突版本或未经接受的替代对象 |
| VC-03 批准适用性 | 对照 Owner 独立来源、先行/最终批准用途与时序、Driver 外层许可要求 | 能区分已提供与未提供材料，不将输入决定、申请或历史批准冒充当前批准；密码学有效性本阶段不声称已验证 |

只有“已经列出一个缺口”不能满足无缺失标准；它只完成了缺口识别。当前具体 ABI/组件/控制/环境/信任及批准仍未完整，所以不能依据本计划写 INPUT_CLOSED 或准备验证全部通过。

## 5.2 无隐藏输入

从两侧核对：一侧由选中入口、import/require、资源和配置引用推导需求；另一侧由实际候选布局/组件清单核对全部采用与排除对象。声明依赖、静态可达依赖、实际文件清单分别保留，不能用目录完整或 lockfile 存在取代其他维度。

检查范围至少包括：

- Desktop main/preload/Renderer 及 HTML/CSS/资源，Node Worker/Stub、Driver/collector/Bootstrap、helper/addon/DLL/loader。
- 静态与动态模块加载、条件路径、插件发现、默认配置、模块解析根、当前目录与 PATH fallback、NODE_OPTIONS/NODE_PATH 等预加载或环境配置影响；只分析接口/规则，不读取秘密或执行这些入口。
- executable 所需外部文件、组件辅助进程、允许的控制通道与配置、schema/oracle/task 输入；历史目录、缓存或全局工具不得成为未声明 fallback。
- 对未采用文件/路径说明为什么不会被加载或影响执行；不能静默把所有扫描到的文件加进清单扩大范围，也不能用文档忽略代替实际访问限制。

**VC-04 满足标准：** 在明确的有限入口、角色、环境规则及布局内，所有已识别执行/加载/控制影响都能映射到选定输入或有依据的排除规则；不存在未解释的动态解析、环境影响或可替换路径。任一动态输入不能静态界定、必要 helper/实际闭包缺失，或排除理由仅为“未观察到”，保持 UNKNOWN/BLOCKED。

静态材料只能支持所述有限模型的准备结论，不能证明任意宿主上绝无隐藏输入。运行时无越界加载还依赖实际 OS 权限/路径保护与持续门禁，须留给后续获准验证；需要加载追踪、resolver、测试或 Runtime 探测时，先满足对应权限，不在本计划中暗含执行。当前已有盘点文件数量不构成 VC-04 已满足的证据。

## 5.3 无循环引用

**VC-05 方法：** 建立有限语义依赖图，节点标明对象/类型/域/来源，边标明 `引用者 → 被引用对象`。逐层遍历实际输入引用和 FieldRef 目标，对访问中的节点再次出现即判循环；未解析目标、越出允许范围或无法确定边类型时保持 BLOCKED。不得把普通 Markdown 背景链接无限递归当作机器输入，也不能遗漏实际会解析的引用边。

允许的生成先后为：

```text
独立信任选择 + 先行 Scope Authority Approval
    → 已选 Source / Runtime / Input / 有限 Plan
    → Snapshot 精确 payload
    → Signature / 正式 Binding
    → 独立 Freeze Approval / Activation
    → 获准 Preflight
```

这些只是未来对象的顺序，不生成它们。图核对必须同时满足：

1. Snapshot 的 approvalReference 只指向先行批准；先行批准不依赖未来 SnapshotRef、Binding digest 或最终批准。
2. Snapshot 不含自身 hash、不引用下游 Signature/Binding/最终批准/Preflight/Evidence；禁止通过间接输入形成同样循环。
3. 正式 Binding 承载同一精确 payload，其 envelope digest 与 decoded payload digest 分开；外部最终批准可指向已定型 Snapshot/Binding，但它们不反向引用最终批准。
4. 字段引用只指向唯一所有者，不出现多份相互覆盖的 Definition/预算/权限；域校验覆盖整个实际输入图，禁止间接夹带运行事实。

无环不等于有权限或内容完整；VC-01～VC-04 不满足时，VC-05 的局部通过不能放行后续阶段。当前没有实际 Snapshot/Binding，图审阅最多核对准备中的对象关系，不伪造最终对象身份或验签结论。

## 5.4 汇总判据与停止

VC-01～VC-05 必须逐项附实际准备依据及结论；域分离还需按 §4 检查。满足时仅报告有限范围的准备材料审阅结论，列出未执行的真实门禁；缺失、隐藏输入无法排除、路径/字节失配、循环、混域或批准不明均 FAIL-CLOSED，停止受影响下游定型。

输入变更时回到 SP-03/SP-04，废止受影响字节记录/引用审阅结论；不得更新 expected identity 掩盖差异，更不能自动签名、重跑或创建新 Invocation。准备条件满足也不授予 Snapshot 创建或 Runtime launch 权限。

# 6. Authorization Boundary

| Item | 当前状态 / 本计划边界 |
|---|---|
| Snapshot | `NOT_CREATED`；不创建最终或草稿 payload 文件 |
| Binding | `NOT_CREATED`；不创建正式或草稿 envelope |
| Signature / S7 key | `NOT_CREATED`；不生成 key、读取私钥、签名或验签 |
| Runtime / Invocation | `NOT_CREATED / NOT_CREATED`；无 launch、request/slot/ledger 实例 |
| Preparation Steps | `PLANNED / NOT_PERFORMED_THIS_TURN`；本文不执行 SP-01～SP-06 |
| Preparation Validation | `NOT_PERFORMED_THIS_TURN`；§5 是标准，不是验证通过记录 |
| Input Closure / Readiness | `BLOCKED / READY_FOR_EXECUTION=NO` |
| Budget | 当前可用 Invocation/Retry/Resume/Recovery 全部为 `0`；既有请求 Invocation=1 仍未获批准 |
| P0.S-7 | `P0S7_STATE=NOT_STARTED`，`P0S7_ALLOWED=NO` |

后续只读整理和静态分析应在已有适用权限内进行；需要额外工具运行、下载/安装/构建/解包、环境/ACL/Trust 配置、实现变更或冻结工件时，必须分别判断相应授权。本文不申请或扩大额度，也不以“准备”名称包含执行。禁止事项不因计划完成而解锁。

```text
DOCUMENT_STATUS = PREPARATION_PLAN_ONLY
SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
SIGNATURE = NOT_CREATED
RUNTIME = NOT_CREATED
INVOCATION = NOT_CREATED
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
READY_FOR_EXECUTION = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
```

本轮仅新增本文，定义目标、五类输入、六个准备步骤、字节身份、三域隔离和五项验证标准。交付核对限于章节/引用/状态、UTF-8 无 BOM/中文乱码、文档 SHA-256 及既有工作区字节；不把文档核对记为输入验证、测试或 Preflight。

未创建 Snapshot/Binding/key/Signature/Runtime/Package/Invocation/Plan 实例/真实 Evidence，未读取私钥、签名/验签、运行 Driver/Desktop/Worker/IPC、测试/Preflight/resolver；未修改代码/Runner/Manifest/lockfile/Git 配置/upstream，未应用 Candidate、下载/安装/构建/解包、配置系统/权限、Commit 或 Push。
