# P0.S-7 Snapshot Preparation Authorization Request

| Field | Value |
|---|---|
| Authorization ID | `P0S7-SNAPSHOT-PREPARATION-AUTHORIZATION-REQUEST-20260905-01` |
| Document Status | `AUTHORIZATION_REQUEST` |
| Record Date | `2026-09-05` |
| Requested Case / Goal | `ED-C01 / MINIMAL_CONTROLLED_RUNTIME_SPIKE / NOT_PRODUCTION` |
| Runtime Definition | `FINALIZED_FOR_INPUT_PREPARATION`；精确输入闭包仍未完成 |
| Snapshot Preparation Plan | `COMPLETE`：计划已编写，不表示计划已执行 |
| Trust / Binding Preparation | `DESIGN_ONLY` |
| Owner Preparation Decision | `PENDING / NOT_PROVIDED` |
| Snapshot / Binding / Signature / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| READY_FOR_EXECUTION / Current Usable Execution Budget | `NO / 0` |

本文申请后续有限的非冻结候选准备权限。文中的“允许”均指**请求 Owner 批准后允许的范围**，不是已获批准或本轮实际动作。本轮只创建本文，不创建 candidate、inventory、draft manifest、Snapshot 或信任工件。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Snapshot Preparation Execution Plan](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-EXECUTION-PLAN.md) | `32AA8C5610E2C95384A645C6F7A16F8E50F9BFD7DF39B444F0E581BB01CDB642` |
| R2 | [Snapshot Preparation Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SNAPSHOT-PREPARATION-DECISION.md) | `F3A06C33480F1CBFAE51C06039B9CC30E9C5F20D9432754D35CF3ACD272922AD` |

R1 规定收集、字节身份、分域、无缺失/隐藏输入/循环核对；R2 规定最小 Snapshot 与独立批准关系。既有文件仍保持计划/设计状态及原字节。本文提出下一阶段 candidate、inventory、draft manifest 的有限文件权限申请，不把旧计划中的“不创建”改写为已经授权。

# 1. Requested Scope

申请对 ED-C01 开展以下准备，不申请 Final Snapshot freeze 或 Runtime 执行：

| Request ID | Requested Action | 拟申请内容 |
|---|---|---|
| SPA-01 | Snapshot candidate preparation | 按 R2 最小模型整理非冻结候选字段、唯一语义所有者和引用关系；Electron 35.7.5、Worker Node 22.19.0 沿用已决定目标，不以工具 Node 24.19.0 替代；允许明确记录未取得输入 |
| SPA-02 | Input inventory preparation | 收集有限 source/runtime/selected files/references/approval references，区分项目源、外部分发、控制工具、选中/排除项和未决项；形成可审阅盘点 |
| SPA-03 | Hash calculation | 对明确范围内已有输入及本次获批准备产物计算原始字节 SHA-256、bytes 和路径身份，用于交付/比较；不作为可信来源、ABI 或有效签名证明 |
| SPA-04 | Provenance recording | 记录 source 的 commit/tree/patch/新文件关系、外部工件来源与版本/平台、实际文件对应、材料提供方和未知原因；不补造构建或验证历史 |

同时申请 R1 SP-01～SP-06 中与上述文件准备直接相关的只读分析、文本/JSON 静态核对、有限引用图检查及准备结果汇总。不得执行 Spike 模块、项目测试、resolver、验证 Driver、Preflight 或验签；Hash calculation 是文件字节操作，不是运行组件。

读取范围限定为 `D:\Project\Shaco-Forge` 中 ED-C01 的设计/治理依据、`experiments/P0S-7-MINIMAL-SPIKE` 源码/模板及实际选中的已有材料；外部对象仅按既有准备 inventory 或 Owner 明确指定的路径只读处理。不自动扩大到全机、私钥、凭据、完整环境变量或 upstream 实物采集，不跟随未知重定向越界。

已有适用只读分析权限不因本申请被撤销。本次申请新增的 candidate/draft manifest 文件权限仍待 Owner 明确决定；存在可读文件不表示它已获运行选用或冻结批准。

# 2. Forbidden Scope

| Forbidden Item | 继续禁止的行为 |
|---|---|
| Final Snapshot freeze | 不创建、定型或宣称可执行的最终 Snapshot，不标 OWNER_APPROVED_AND_FROZEN，不冻结整个项目、Runtime Identity 或正式 Frozen Input Manifest |
| Binding | 不创建最终或草稿 envelope，不修改正式 Binding 路径、内容或 expected identity，不将 candidate 封装成可验证 Binding |
| Signature / final trust artifact | 不生成 key、读取私钥、签名/验签、配置信任根、公钥用途或伪造 Owner Freeze Approval/Activation |
| Invocation | 不创建或预留 Runtime Invocation/Plan/slot/ledger，不分配运行实例，不启动 Driver/验证会话，不自动 Retry/Resume/Recovery |
| Runtime execution | 不启动 Electron、Node Worker、Driver、IPC 或 SUM3，不测试、Preflight、加载 addon 或执行准备产物 |

同样不申请安装、下载、构建、解包、resolver、组件复制成 Runtime、Package/Release、系统/ACL/fixture 修改、源码/Runner/既有 Manifest/lockfile/upstream/Git 配置修改。依赖 Candidate 保持 generated_not_applied；Snapshot candidate 与历史 lockfile Candidate 是不同对象，本请求不授权应用任何依赖 Candidate。

Production Runtime、Full Harness、Package Release、Installer、完整插件生态、Deployment 和 P1 不在申请范围。不能用“candidate”名称携带实际运行、冻结、签名或信任配置。

# 3. Artifact Boundary

请求 Owner 批准在以下**拟定准备目录**内创建并有限修订一组可审阅产物：

`D:\Project\Shaco-Forge\docs\04-development-records\preparation\P0S-7-ED-C01`

该目录是申请的输出边界，本轮不创建。后续获批执行前应确认路径及父目录没有导致越界的重定向；已有同名文件不得无依据覆盖。既有源码、历史准备 inventory 和治理记录保留，不因此申请重写。

| Requested Artifact | 拟定文件名 | 强制边界 |
|---|---|---|
| candidate | `snapshot.candidate.json` | `CANDIDATE_ONLY / NOT_FROZEN / NOT_EXECUTED`；独立 candidate recordType，不能伪装成可接受的正式 Snapshot 类型/状态；无签名、无 final SnapshotRef |
| inventory | `input-inventory.json` | `PREPARATION_INVENTORY_ONLY`；记录已有材料的角色、路径、bytes/hash、provenance、采用/排除与缺口；含采集观察的部分属于 REFERENCE |
| draft manifest | `input-manifest.draft.json` | `DRAFT_MANIFEST_ONLY / NOT_FROZEN`；只描述拟选有限输入及关系，不是正式 Frozen Input Manifest，不修改项目既有 Manifest 或 lockfile |
| 配套静态核对记录 | `preparation-validation.md` | 逐项记录 R1 标准下的实际准备依据、缺口与判定；不是 Preflight PASS、运行 Evidence 或最终批准 |

上表文件与修订均须在 Owner 对本请求作出适用批准后才创建。候选文件的具体 schema 可对应 R2 字段语义，但必须显式区分候选身份与最终 Snapshot；不能只通过改 status、改文件名或复制 hash 自动升级为 final trust artifact。

缺失 source/runtime/ABI/Driver/Helper/approval 材料时可用 null 加清晰缺口说明，逐项标 UNKNOWN/BLOCKED；不得填零 hash、伪造版本、公钥、批准或引用。候选能够保存缺口不意味着它可被最终 Gate 接受，不得写 INPUT_CLOSED 或 READY_FOR_EXECUTION=YES。

候选内容应遵守未来输入域规则：PID、start time、generation、实际 endpoint、运行 result、预算消费等不进入 candidate 或 draft manifest 的拟冻结数据，也不能通过间接引用混入。盘点采集时间、机器/权限观察留在 inventory/核对记录的参考域，不把该文件整体作为 candidate 的冻结输入。

candidate 和 draft manifest 不包含自身 hash；输入 manifest 不把 candidate 或后置核对记录纳入其输入集。后置交付记录可计算它们的普通文件摘要，但该摘要不构成正式 SnapshotRef、Binding identity 或信任。修订后应如实更新交付关联并使受影响核对结论失效，不改写历史批准或伪称字节未变。

若后续生成候选，应明确报告“candidate 已创建、final Snapshot 未创建”，不能用统一 NOT_CREATED 隐藏候选文件已存在的事实。本轮尚未创建任何这类产物。

# 4. Validation

申请要求候选准备在获批后完成以下静态核对；本轮仅定义要求，没有执行输入验证。

| Requirement | 要求与判定 |
|---|---|
| byte identity | path、bytes、SHA-256 与同一实际对象及明确角色一致；不转码、改换行、重新序列化输入后冒充原字节；路径越界、文件变化、冲突身份或读不到时保持 BLOCKED |
| provenance | 项目 commit/tree 与 patch/新文件、外部来源/版本/平台及实际字节关系可追溯；“hash 一致”不等于来源可信或 ABI 兼容；未取得材料如实记录 |
| domain separation | 逐字段及实际引用图区分 FROZEN_INPUT 候选、RUNTIME_FACT、REFERENCE；任务预期与真实结果、预算上限与消费、命名规则与实际 endpoint 分开 |
| no cycle | candidate 的先行 approval reference 不依赖未来 Snapshot/Binding/最终批准；禁止自身 hash、下游签名/批准/Preflight/Evidence 回填；FieldRef 指向唯一所有者，未解析边保持未决 |
| completeness / hidden inputs | 按 R1 对入口/资源、静态及动态加载、helper/loader、配置/环境影响和有限文件清单双向核对；不以盘点数量或 lockfile 存在推断实际闭包完整 |

生成依赖顺序继续为：先行 Scope Authority Approval 与定型输入 → 未来最终 Snapshot → Signature/正式 Binding → 独立 Freeze Approval/Activation → 获准 Preflight。当前 preparation approval 只授权准备动作，不自动成为最终 Snapshot 中适用执行范围的 approvalReference；本文作为请求更不能代替它。

候选准备可在材料不足时完成“已识别缺口”的交付，但必须区分：文件准备已完成、部分静态条件未满足、最终输入仍未闭合。真实 Driver/OS 认证、fixture/权限、先行信任/批准等缺失时，保持 NOT_READY，不伪造运行 PASS。

无法界定的动态依赖、隐藏输入、混域、循环或授权不明一律 FAIL-CLOSED，阻止后续冻结/激活。不能为消除缺口自动运行 resolver、测试、载入组件、下载、补建 Runtime 或验签。静态检查结果只对对应候选字节与范围有效，不能替代真实 Preflight。

# 5. Budget

| Budget Item | 本次申请执行数量 | 当前批准 / 可用数量 |
|---|---:|---:|
| Invocation | 0 | 0 / 0 |
| Runtime / Desktop / Worker launch | 0 | 0 / 0 |
| Driver / Preflight / Runtime validation session | 0 | 0 / 0 |
| Retry | 0 | 0 / 0 |
| Resume | 0 | 0 / 0 |
| Recovery | 0 | 0 / 0 |

本申请请求的是 §1 和 §3 的文件准备、摘要计算及有限静态分析权限，不请求任何运行次数。获批的普通文件字节操作不被解释为 Runtime Invocation；零 Runtime 预算也不允许以“核对”为名执行一次源码或验证会话。

既有 Runtime Execution Authorization Request 中的 Invocation=1 属于另一待批请求，本申请不批准、不消费、不继承或调整它。当前 usable execution budget 始终为 0，直到后续适用 Owner 执行决定另行明确。

```text
DOCUMENT_STATUS = AUTHORIZATION_REQUEST
PREPARATION_OWNER_DECISION = PENDING
REQUESTED_ARTIFACTS = CANDIDATE_INVENTORY_DRAFT_MANIFEST_AND_STATIC_REVIEW
PREPARATION_ARTIFACTS_CREATED_THIS_TURN = NO
FINAL_SNAPSHOT_FREEZE_AUTHORIZED = NO
SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
SIGNATURE = NOT_CREATED
INVOCATION = NOT_CREATED
RUNTIME = NOT_CREATED
INVOCATION_BUDGET = 0
RUNTIME_BUDGET = 0
CURRENT_USABLE_EXECUTION_BUDGET = 0
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
READY_FOR_EXECUTION = NO
```

本轮仅新增本授权申请。文档交付核对范围为五个章节、申请与已授权的区别、工件标记/路径/禁止项、UTF-8 无 BOM/中文乱码、SHA-256 及既有工作区字节；不属于测试、输入验证或 Preflight。

未创建 candidate/inventory/draft manifest/核对记录或其目录，未创建 Snapshot/Binding/key/Signature/Runtime/Package/Invocation/Plan/真实 Evidence；未读取私钥、签名/验签、运行组件、测试或 Preflight；未修改源码/Runner/既有 Manifest/lockfile/Git 配置/upstream，未应用 Candidate、下载/安装/构建/解包、配置系统/权限、Commit 或 Push。
