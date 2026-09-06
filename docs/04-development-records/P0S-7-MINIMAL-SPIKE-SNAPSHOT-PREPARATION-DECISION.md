# P0.S-7 Minimal Spike Snapshot Preparation Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-MINIMAL-SPIKE-SNAPSHOT-PREPARATION-DECISION-20260905-01` |
| Document Status | `PREPARATION_DESIGN_ONLY` |
| Record Date | `2026-09-05` |
| Scope | `ED-C01 / MINIMAL_CONTROLLED_RUNTIME_SPIKE / NOT_PRODUCTION` |
| Runtime Definition | `FINALIZED_FOR_INPUT_PREPARATION`；目标选择已定案，精确输入闭包仍 BLOCKED |
| Electron / Worker Node Target | `35.7.5 / 22.19.0`，组件准备目标均为 win32 / x64 |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Runtime / Snapshot / Binding / Signature / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| READY_FOR_EXECUTION / Current Usable Execution Budget | `NO / 0` |

本文只定义准备模型和字段边界，不是 Snapshot payload、JSON schema 实物、冻结 Identity、Binding、签名或运行批准。下文的字段名和依赖关系是规格，不是已生成对象；不填写占位 SnapshotRef、虚构 ABI、Signature 或 Invocation ID。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Runtime Definition Finalization Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-DEFINITION-FINALIZATION-DECISION.md) | `777F7044A89D6B506409E3A1ABB20653A8D8FC9CF0E8C7659E59AD664EC2E1CB` |
| R2 | [Minimal Spike Execution Design](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |

R1 允许后续非冻结 Snapshot 准备分析，没有授权 Snapshot 创建或 Runtime launch。R2 §4～5 的独立信任、唯一语义所有者、精确 payload bytes、正式 Binding 和无环引用继续适用；本文件不改写它们。

# 1. Snapshot Objective

ED-C01 最小 Snapshot 的目的，是在未来获得对应准备/冻结权限后，固定“一次受控 SUM3 Spike 究竟使用哪些预先确定的输入和规则”，供独立信任入口、正式 Binding 与 Preflight 核对。它不记录运行过程，不承担自授权或生成运行结果的职责。

模型沿用 `recordType=P0S7_MINIMAL_RUNTIME_EXECUTION_SNAPSHOT`、`schemaVersion=1`，输入对象类型为 `SELECTED_SPIKE_LAYOUT`。后续实现必须显式支持该类型并拒绝未知 schema，不能以最小模型静默绕过旧 Gate。无需创建 Production Package、Package Identity 或虚假 packageHash，但所选有限布局的来源、依赖、实际可加载字节和控制输入必须完整。

固定实验语义：Electron Desktop → 经认证的 Windows Named Pipe `SHACO_SPIKE_IPC_V1` → 独立 Node Worker → SUM3；独立 Driver/collector 控制屏障、停止和记录。业务输入为 `[2,3,5]`，独立预期为 `count=3,sum=10`。只有业务能力可用 Stub，Authority、Binding、OS 认证、Preflight 和证据持久化必须真实成立。

Runtime Definition FINALIZED 只表示目标 Electron 35.7.5、Worker Node 22.19.0 与角色选择已决定。缺失的 Node 实物、ABI、Driver/Helper、有限闭包、fixture/权限和信任材料，不能通过创建 Snapshot 或填写状态字符串变成已确认输入。

# 2. Frozen Input

以下是未来可以进入 payload 的字段或精确引用，不表示本轮已冻结。Snapshot 保存引用；被引用的输入对象拥有对应语义，不在 Snapshot 中复制一份可覆盖的配置。

| Frozen Input | 最小字段 / 对象 | 唯一语义与准备要求 |
|---|---|---|
| source identity | `sourceIdentityRef` → 有限 Source Record | 项目根 `D:\Project\Shaco-Forge`、选中 input set、base commit/tree 与 patch/新文件关联、来源及精确字节。只选 Spike 所需集合，不冻结整个 checkout；HEAD 不能独自代表未跟踪文件 |
| runtime definition | `runtimeDefinitionRef` → 单一 Runtime Definition | Desktop/Worker/Driver/collector/Helper 角色，入口、argv/profile/有限 roster、IPC 协议、预期根/权限/环境规则。目标版本遵循 R1，不把规则文字当作 OS enforcement 已成立 |
| runtime identity | `runtimeIdentityRef` → 所选组件身份与有限清单 | 实际选定的 Electron 35.7.5、Worker Node 22.19.0、项目源码、控制工具及必要 helper/loader 的版本、平台、ABI、来源和字节。禁止用工具 Node 24.19.0 的 hash 代替 22.19.0 |
| selected input | `inputReference` → 有类型输入集合 | 固定 taskInputRef、声明/可达/文件清单、必要控制输入与 Frozen Input Manifest；覆盖所有执行/加载输入，未选中的包、插件、历史分发和机器 inventory 不自动纳入 |
| approval reference | `approvalReference` → 先行 Scope Authority Approval | 必须在 Snapshot 之前定型，说明适用用途/范围/Plan 关联；输入决定、授权申请、Phase A Review 或本文均不能代替该批准 |
| authority anchor | `authorityAnchor` → 独立选定治理对象及规则 | 由适用 Owner 决定选定，不能自动使用当前 HEAD、upstream commit 或候选对象自声明 Anchor |
| scope / schema | `recordType`、`schemaVersion`、最终 `status`、适用 Scope/Design 精确引用 | 明确 ED-C01 最小模型及合同；未来可使用的 payload 状态须为 OWNER_APPROVED_AND_FROZEN，但字符串本身不证明批准有效 |
| bounded plan | `invocationPlanRef` → 预先定型有限 Plan | Case/kind、拟关联标签、获准动作/预算上限、时限和根策略；不包含实际消费、运行实例或结果。本文不创建 Plan、slot 或 Invocation |

ContentRef 最少具有对象角色/类型、规范路径、字节数及 SHA-256，固定已定型输入的保存字节；路径本身或版本标签不能单独证明身份。FieldRef 必须指向唯一语义所有者，不能借多层引用提供第二份可覆盖值。未知、缺失或类型/字节不一致的必需引用，阻止后续定型，不用空字符串、零 hash 或任意当前文件顶替。

### 预期值与事实的界线

- SUM3 预先选定的输入与独立 oracle 可以属于 selected input；实际 Worker 返回值、比较结果和 PASS/FAIL 不属于输入。
- Plan 可以规定获准次数和预算上限；实际已用额度、slot 消费时间/结果和剩余额度不进入 payload。当前申请 Invocation=1 不等于已获准上限，当前可用预算仍为 0。
- Definition 可以规定 endpoint 命名/交付/权限规则、预期角色和根；本次运行实际分配的 endpoint、凭据、PID 或 instance 标签不进入 payload。
- 预期 OS/architecture/权限约束可以属于 Definition；当前开发机或未来目标机的实际探测结果不能直接冻结，须由未来获准 Gate 在外部进行比对。

当前 source set 的最终接受、运行组件字节/ABI、Driver/Helper、实际控制闭包、目标环境、Anchor/Trust Root 和先行批准尚未完整。本文只完成字段设计，`FROZEN_INPUT_CLOSURE=BLOCKED`，不生成示例 payload 充当已闭合对象。

# 3. Runtime Fact

下列事实禁止进入 Snapshot 的 payload 或任何被当作冻结输入的间接对象；metadata、改名字段、归档 Evidence 引用和序列化嵌套不构成例外。

| Forbidden Fact | 后续正确位置 / 限制 |
|---|---|
| PID | 未来受控进程关联与独立 OS 观察；不能仅凭进程自报 PID 建立身份 |
| start time / processStartTime | 未来生命周期/OS 观察；不用于提前填充 runtime identity |
| endpoint | 实际命名管道地址与会话分配归未来运行关联；不能混作预期命名规则。敏感凭据不得写普通日志 |
| generation / instanceId | 未来单次运行实例关联；不为重启、stop 或 recovery 回写 Snapshot |
| result | 实际 SUM3 返回、Gate verdict、执行成功/失败、比较结果与 finalization 归未来原始 Evidence/Review |
| budget consumption | 实际 slot、消费量/时间/成败、资源使用与剩余额度归受保护 ledger 和 Evidence，不写入有限 Plan 或 payload |
| 其他实际观察 | READY/launch/stop 时间、实际 SID/宿主状态、nonce/credential、失败、recovery disposition 等按各自事实域处理，不冻结 |

实际事实只能在动作获准且发生后记录，并保留 source、identity、timestamp、lifecycle 和未知/未到达语义。本轮不生成这些记录，不用虚构 PID、结果、时间或 PASS 补齐设计。既有 TEMPLATE_ONLY / NOT_EXECUTED 模板不构成 Runtime Evidence。

# 4. Reference

REFERENCE 提供理解、选择或追溯依据，不因被列出就成为可信运行输入或执行权限。

| Reference Type | 对象 | 使用规则 |
|---|---|---|
| upstream | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` | 只作架构/依赖/能力参考；不是 ED-C01 Worker、Runtime、Package 或 Snapshot 的实际 Source，不修复或操作该目录 |
| historical records | P0.S-6 Authority/Trust/Binding/Evidence、历史 Harness/Runner、旧验证结论 | 保留原用途与历史状态，不自动授权 S7、新 Snapshot、Driver、Plan 或 Invocation；历史 PASS 不替代当前门禁 |
| external references | 外部分发说明、版本/ABI 文档、来源记录、历史 Electron 候选、工具 Node 24.19.0 | 只用于后续材料选择；网页/目录/版本名或缓存存在不能替代精确字节与独立信任。没有因引用而下载、执行或采信工具 |
| preparation observations | Source 盘点、开发机 OS/ACL、候选文件清单、准备记录 | 不是完整 Runtime/Package Identity；不得把含观察事实的 inventory 整体冻结或嵌入 Snapshot |
| normative decisions | R1 的输入选择、R2 的模型及适用治理合同 | 可作为准备依据；未来应显式区分规范引用与执行输入引用，不把链接可达的全部文件递归当作依赖或可信材料 |

外部组件若未来实际参与执行/加载，必须在相应权限下完成来源选择、精确身份和有限闭包，进入独立的 runtime/input 对象；不能继续仅标 REFERENCE 来逃避完整性控制。应只定型已选择的输入，不把参考记录中的宿主观察或历史结果一并搬入。

# 5. Binding Relationship

以下箭头表示准备与判定的依赖顺序，不表示已创建对象，也不要求上游 payload 保存下游引用。

```text
独立 Authority / Trust 选择与先行范围批准
                         ↓
        已定型 Source / Runtime / Input / Plan
                         ↓
                Snapshot 精确 payload
                         ↓
       获准 Signature + 正式 Binding（同一 payload）
                         ↓
       独立 Owner Freeze Approval / Activation
                         ↓
            获准流程中的真实 Final Preflight
```

简化关系为 **Snapshot → Binding → Preflight**，其中 Signature、独立最终批准和受信入口均不能省略。

| 对象 | 身份与关系 |
|---|---|
| Snapshot | 未来保存精确 payload bytes；SnapshotRef 是这些字节的下游摘要，payload 不内嵌自身 hash |
| Signature | 由获准签名方对精确 payload bytes 签名；不以解析后重新序列化的内容代替原字节；本文不生成 key 或签名 |
| Binding | 正式 envelope 承载同一 payload bytes 及适用签名关联；envelope 文件摘要与 decoded payload 摘要分开，二者不能互换 |
| 外部 Freeze Approval / Activation | 通过独立信任入口选择 expected SnapshotRef、正式 Binding 路径/envelope identity、key/用途、Driver、范围和时窗；不能由候选 Binding 自选可信入口 |
| Preflight | 在适用外层权限内核对信任/批准、正式 Binding 与 payload、完整输入、环境/控制、预算和持续保护；本轮不执行 |

### 无环规则

1. payload 的 approvalReference 只指向先行 Scope Authority Approval；它不能包含未来 SnapshotRef、Binding digest 或最终 Freeze ApprovalRef。
2. Snapshot 不指向后生成的 Signature、Binding、最终批准、Preflight 结果或 Evidence；下游可引用上游精确身份，上游不回填下游身份。
3. 如果唯一可用批准是在 Snapshot 之后生成，就不能将它塞入 payload 作为先行批准。应补齐独立先行范围依据，缺失时保持 BLOCKED，不自行改变模型放行。
4. 本准备设计和 R1 都不代替适用执行 Scope Approval；签名有效、Binding 存在或 payload 状态正确也不单独证明 Owner 当前授权有效。
5. 已定型输入变化会使受影响下游引用、签名/Binding、最终批准和就绪判断失效；不得重算 hash 后自行继续、自动重签或更新 expected Ref 掩盖差异。

Preflight 必须先由独立入口认证 Driver/collector 及宿主前提，再判断候选输入，不能运行候选代码让其自证可信。即使未来 Preflight 通过，也须遵守 R2 的有效时限、原子持久预算消费及后续持续门禁；拒绝或 UNKNOWN 不触发修复、fallback、重试或新增 Invocation。

# 6. Preparation Boundary

本次仅允许模型设计、字段分类、引用关系和缺口整理。Snapshot、Binding、Signature 的实际创建以及冻结、签名、验证、执行动作分别需要适用授权；本文件不串联或发放这些权限。

| Item | 当前状态 |
|---|---|
| Snapshot | `NOT_CREATED`；无最终或草稿 payload 文件 |
| Binding | `NOT_CREATED`；无正式或草稿 envelope |
| Signature / key | `NOT_CREATED`；未生成 key、读取私钥或签名 |
| Runtime / Invocation | `NOT_CREATED / NOT_CREATED` |
| Frozen Input Closure | `BLOCKED`；版本目标已决定，不代表 ABI/来源/控制/批准齐备 |
| Readiness | `READY_FOR_EXECUTION=NO`；本文不产生 Preflight PASS 或运行验收结论 |
| Budget | Invocation、Retry、Resume、Recovery 的当前可用数量均为 `0` |
| P0.S-7 | `P0S7_STATE=NOT_STARTED`，`P0S7_ALLOWED=NO` |

本准备设计完成后，可以在既有适用分析权限内继续整理候选字段与材料；不能据此生成 Snapshot 文件、冻结 Manifest/Identity、Binding、Signature、Plan/slot 或真实 Evidence。未来定型至少需要精确 source/runtime/input、明确 ABI/helper/Driver 与有限闭包、目标环境/权限及独立先行批准，缺项必须 FAIL-CLOSED。

```text
DOCUMENT_STATUS = PREPARATION_DESIGN_ONLY
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

仅新增本文。交付核对范围为六个章节、字段/身份域、无环依赖、状态与引用、UTF-8 无 BOM/中文乱码、文档 SHA-256 和既有工作区字节；这是文档检查，不是 Runtime 测试、Preflight 或验签。

未创建 Snapshot 文件、Binding、key、Signature、Runtime/Package/Invocation/Plan/真实 Evidence；未运行 Desktop/Worker/Driver/IPC、测试、Preflight 或验签，未读取私钥；未修改源码/Runner/Manifest/lockfile/Git 配置/upstream，未应用 Candidate、下载/安装/构建/解包、配置系统/权限、Commit 或 Push。
