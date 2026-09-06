# P0.S-7 Minimal Spike Implementation Authorization Decision

| Field | Value |
|---|---|
| Authorization ID | `P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-20260905-01` |
| Document Status | `AUTHORIZATION_REQUEST` |
| Owner Decision | `OWNER_DECISION_REQUIRED` |
| Record Date | `2026-09-05` |
| Current Goal | `MINIMAL_CONTROLLED_RUNTIME_SPIKE` |
| Requested Design | `P0S7-MINIMAL-SPIKE-EXECUTION-DESIGN-20260905-01` |
| P0.S-6 | `CLOSED / VERIFIED_WITH_CANDIDATE` |
| P0.S-7 / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Runtime / Package / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Current Usable Execution Budget | `0` |
| Deliverable | 仅本授权申请文档；未作出 Owner 批准、未实施或执行 |

## Read Basis and Decision Meaning

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-MINIMAL-SPIKE-SCOPE-RECONCILIATION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SCOPE-RECONCILIATION.md) | `9BF71B8D58AE45BE0AF120D858F24D1CB62575BF61583B2F890E52390894BF22` |
| R2 | [P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |

本文件按用户指定状态保持 AUTHORIZATION_REQUEST。“Authorized / 允许”表示**提交 Owner 审阅的拟授权范围**，不表示批准已经发生。当前仅获准创建本文；未来只有 Owner 明确接受相应范围后，才能进行所批准的文件实现工作。

本次申请选择 **Invocation 请求数量 0**，主要申请最小 Spike 的静态实现与文件创建范围。文件权限、工具/环境准备、冻结/签名权限和 Runtime 执行权限分别判断；不能因标题含 Authorization、设计已完成或验收要求需要启动，就推导出默认一次执行额度。

R1 的最小范围优先于早期完整产品准备范围；R2 定义拓扑、SUM3、Authority/Snapshot、Evidence 和失败判据。本文不扩大 R1/R2，也不把完整 Harness、Production Package 或 P1 的缺口重新列为开始静态实现前的总前提。

# 1. Authorized Scope

| Scope ID | 拟允许范围 | 实现边界 | 当前权限 |
|---|---|---|---|
| IA-S01 | Electron Desktop Spike | 一个最小 Desktop 的 Main/Renderer/preload；展示一个请求/结果；Renderer 无 Node/shell/Worker launch 权限；Desktop 与 Worker 生命周期分开 | REQUESTED / NOT_AUTHORIZED |
| IA-S02 | Node Worker Spike | 独立 Node Worker 的项目最小入口、一次任务处理、执行前屏障、显式停止和错误路径；禁止由 Desktop 自动 spawn/restart | REQUESTED / NOT_AUTHORIZED |
| IA-S03 | SUM3 Deterministic Stub | 固定任务 SUM3：输入 [2,3,5]，实际求和，期望 count=3、sum=10；一个 request → execution → result → stop | REQUESTED / NOT_AUTHORIZED |
| IA-S04 | Named Pipe IPC | 按 SHACO_SPIKE_IPC_V1 实现真实 Windows 本地命名管道、角色/实例认证、消息边界、重复/未知/越界请求拒绝；无 Carrier fallback | REQUESTED / NOT_AUTHORIZED |
| IA-S05 | Evidence Structure | startup/runtime/failure/recovery disposition 与 finalization 的结构、采集接口、持久化/缺口/停止路径；原始 producer 与 collector 分开 | REQUESTED / NOT_AUTHORIZED |

上述范围包含完成 R2 所必需的**最小 Driver/collector、Authority/Preflight 检查和有界控制的源码实现**，限于本 Spike，不建设通用 Agent/验证平台。允许实现这些检查的逻辑，不等于运行它们、配置信任、创建 key、签名、启动进程或取得运行批准。

实际项目候选根为 `D:\Project\Shaco-Forge`（ACTUAL_PROJECT_SOURCE）；upstream `D:\Project\Shaco-Forge-Upstream\deepseek-harness` 保持 REFERENCE_SOURCE。仅实现有限自有 Spike 输入，不复制/改造 upstream，不把其 Git ownership 修复作为本路径前提，不冻结整个项目。

所有未来获准源码和示例标记 NOT_PRODUCTION。业务能力可以是 Stub；Authority、Signature 验证、Snapshot 匹配、IPC 认证、OS 进程/权限控制和证据写入结果不能由 Mock success 替代。实现中缺少必要材料时应默认拒绝，不能写入 hard-coded allow 或临时无签名启动通道。

# 2. Forbidden Scope

| Forbidden Item | 持续禁止的范围 |
|---|---|
| Production Runtime | 产品级 Runtime、长期服务、多租户/跨机运行、生产能力和生产可靠性承诺 |
| Full Harness | 完整 DeepSeek Harness 集成/启动、内部 boot 或源码 fallback；不得把 SUM3 Stub 冒称 Harness 通过 |
| Package Release | Production Package、发布打包、Package Identity、包推广、发行产物及 release pipeline |
| Installer | 安装器、安装/卸载/升级流程和系统集成 |
| Plugin Ecosystem | 完整插件生态、任意发现/下载/热加载、完整 Dependency Marketplace |
| P1 | P1 正式启动、实施、全量部署及项目整体冻结 |

本申请不包含修改现有代码、历史 Runner、Manifest、Binding、lockfile、Git 配置/safe.directory 或 upstream；不应用 generated_not_applied Candidate。允许的未来新增 Spike 文件也不能改名承载 Production artifact、Package identity 或 Release artifact。

本申请不请求下载/安装依赖、resolver、构建/解包工具执行、复制外部 Node/Electron 分发、部署 fixture、配置系统/权限、创建密钥或读取私钥。若具体实现确需这些动作，应先明确其对象和所需授权，不能把它们藏在“minimal runtime files”或“test fixture files”名称下。本轮禁止事项不因拟授权内容而失效。

# 3. Artifact Permission

## Requested File Scope

拟为未来 Owner 审批选定专用新增目录：

`D:\Project\Shaco-Forge\experiments\P0S-7-MINIMAL-SPIKE`

本轮只读检查时该目录不存在；没有创建目录。下列路径是可审阅的拟写入范围，不是冻结执行根、实际部署根、现有 Runtime 或信任根。Owner 可明确接受这些边界，不必先生成尚未获准的实物；未批准时不创建。

| Artifact | 拟允许的文件内容 / 子范围 | 生效条件与限制 | 当前状态 |
|---|---|---|---|
| Spike source files | 专用根下 src/desktop、src/worker、src/stub、src/ipc、src/control、src/evidence 中的最小源码 | Owner 明确批准后，限本次新增文件的创建/编辑；不修改已有产品/历史文件，不执行源码 | REQUESTED / NOT_CREATED |
| Minimal runtime files | 专用根下 config/ 与源码入口需要的本地最小配置、协议/schema 定义、说明和有限布局清单草稿 | 只作为 DRAFT_NOT_FOR_EXECUTION 输入；不是外部 executable 下载/安装/复制、构建产物或冻结 Runtime Definition/Manifest | REQUESTED / NOT_CREATED |
| Test fixture files | 专用根下 fixtures/ 的固定 SUM3 输入、预期结果、独立错误输入与 Case 说明 | 标注 FIXTURE_ONLY / NOT_EXECUTED；允许静态数据及受控故障模式的源码定义，不允许运行测试/注入故障/伪造签名 | REQUESTED / NOT_CREATED |
| Evidence structure files | 专用根下 evidence-structure/ 的 schema、空模板、字段/来源/状态说明 | 标注 TEMPLATE_ONLY，不填写实际 PID/时间/结果，不冒充运行 Evidence | REQUESTED / NOT_CREATED |
| Evidence files | 专用根下 evidence/ 的未来原始记录、fallback、索引与 finalization 输出 | 拟允许作为获准运行的输出类型；**只有生成它们的具体操作另获 Owner 执行批准及预算后才可生成**，本零 Invocation 申请不使该权限单独生效 | REQUESTED_CONDITIONAL / NOT_CREATED |
| Production artifact | 任何路径中的生产 Runtime/全量产品输出 | 不申请、不允许 | NOT_AUTHORIZED |
| Package identity | descriptor、archive/package identity、冻结 package inventory 等 | 不因有限布局清单或文件 hash 获得创建权限 | NOT_AUTHORIZED |
| Release artifact | 安装包、发行包、签发/发布输出 | 不申请、不允许 | NOT_AUTHORIZED |

专用目录是范围上限，不能把所有子文件自动认定为被批准的执行字节。后续实际输入清单仍须记录所选源的 commit/tree 关联、精确差异/新文件来源、版本/字节及 provenance；无需先 Commit 或冻结整个项目。

未来写入须保持在批准目录内并保持 UTF-8 编码；如果发现既有文件、路径解析越界或 reparse/重定向导致不再是批准对象，则停止受影响写入，不覆盖或绕过。源码实现可采用未绑定的配置结构，但不得用占位 hash、虚构 Approval 或测试 key 自动通过门禁。

## Frozen and Control Artifacts Not Granted Here

Runtime Snapshot、冻结 Runtime Definition Identity/Frozen Input Manifest、真实 Signature/Binding、独立 Trust Root/公钥用途配置、Owner Freeze Approval/Activation、Invocation Plan/slot，以及运行 ledger 均不随普通文件实现许可自动创建或激活。

可以实现 R2 的读取/校验逻辑及静态类型定义；实际冻结、签名、正式入口交付和执行对象需按对应阶段明确批准。Snapshot 的 source identity/runtime identity/input reference 只能指向定型输入；approvalReference 保持先行范围批准与外部最终批准分离，禁止 PID/start time/generation/结果及其间接引用进入 signed Snapshot。

Evidence 文件权限必须与事实来源一致：静态 fixture 不是 startup/runtime 记录，空模板不是“已生成 Evidence”，写一个 PASS 字符串不是验收。真实运行记录必须来自获准操作并保留 identity、source、timestamp、lifecycle state 和 expected/observed。

# 4. Budget

| Budget Item | 本次申请数量 | 当前批准数量 / 可用数量 | 说明 |
|---|---:|---:|---|
| Invocation | 0 | 0 / 0 | 明确选择 0，不隐含一次执行 |
| Retry | 0 | 0 / 0 | 不自动重试、复用或返还失败 slot |
| Resume | 0 | 0 / 0 | 不续跑 |
| Recovery | 0 | 0 / 0 | 不执行恢复 |
| Runtime Worker launch | 0 | 0 / 0 | 文件实现与物理 launch 分开 |
| Desktop launch / IPC session / task execution | 0 | 0 / 0 | 不为验收启动进程、连接管道或计算业务任务 |
| Validation / Preflight / test / fault session | 0 | 0 / 0 | 外层验证请求同样需要权限，不因零 Runtime launch 而免费执行 |
| Tool preparation / install / build / unpack | 0 | 0 / 0 | 不申请此类工具操作 |
| External network | 0 | 0 / 0 | 不下载或调用外部业务服务 |

**Current usable execution budget = 0。** 本申请的静态文件实现范围需 Owner 批准后才生效；零执行预算不等于允许现在写实现，也不意味着未来获准的静态源码写入必须先有 Runtime slot。

R2 中每 Case 的设计上限、ED-C01 正例、ED-F01～F07 负例及其变体都只是验收规格，不能相加成为本申请额度。后续若要实际验收，需明确具体 Case/variant、输入/工具/fixture 身份、允许动作、Desktop/Worker/故障工具等各类有限计数、时窗、根与停止/证据范围，再由 Owner 作执行决定。本文件不预留 Invocation ID、不申请正数预算。

# 5. Acceptance Gate

以下是未来实现的**真实运行验收门禁**，全部当前 NOT_EXECUTED。它们不是本申请获准静态实现前必须先完成的动作，也不是命令或启动许可。Owner 批准源文件创建后，可先交付“实现已写入、未运行验收”的准确状态，不能为了取得实现许可先跑 Runtime。

| Gate ID | 必须通过 | 证据判据 | 当前 |
|---|---|---|---|
| IA-G01 | Desktop starts | 真实 Electron 进程组、选定字节/角色、Renderer/Main 边界及 IPC 客户端；UI 标记不能代替 | NOT_EXECUTED |
| IA-G02 | Worker starts | 真实独立 Node Worker、OS PID/start time 与实例关联；Desktop 关闭后同一 Worker 存活，再按批准显式停止 | NOT_EXECUTED |
| IA-G03 | IPC authenticated | 真实命名管道、角色/实例认证与消息边界；未认证/旧会话/重复或非法请求真实拒绝 | NOT_EXECUTED |
| IA-G04 | SUM3 executes | 在真实 Authority/Snapshot/Preflight 与执行屏障后，唯一 request 实际计算 [2,3,5] → count=3/sum=10；Desktop 收到关联一致的唯一结果 | NOT_EXECUTED |
| IA-G05 | Evidence generated | startup/runtime/failure/recovery disposition 有真实来源，finalization 可从原始事件/OS/ledger 重推；缺口如实保留 | NOT_EXECUTED |
| IA-G06 | Fail closed works | invalid authority、modified input、Worker crash、evidence failure，以及 R2 的 IPC/Snapshot/replay/recovery-denial 场景达到指定边界并真实拒绝/停止，无自动修复/重试 | NOT_EXECUTED |

六项门禁同时继承 R1 的七项 Must Prove、R2 的 EA-01～EA-06 和 G-00～G-06；不会以一个 SUM3 正例覆盖未测试的失败场景。Authority、信任、Snapshot、签名、实际 Binding 入口、持续字节/权限保护和 Evidence First 都必须真实成立。

| Verdict | 验收含义 |
|---|---|
| PASS | 真实正例完成闭环，必需获准负例符合期望，证据充分且无未决控制缺口；仅覆盖所选输入/环境/范围 |
| FAIL | 可信事实证明违反权限、身份、边界、结果、停止、证据或无重试要求；既有确证违规不因另有缺口降级 |
| INCONCLUSIVE | 未到达目标故障点、必要材料/环境/批准未具备、关键证据/终态未知；不得当成通过 |

负例的 subjectOutcome=BLOCKED 可以对应场景 PASS，但不证明 Desktop/Worker 正例启动成功。部分 Case 获准/通过不能替代完整最小验收，NOT_EXECUTED、UNKNOWN、INCOMPLETE 不得填成 PASS。实际恢复正例不在本次预算内，recovery disposition 不声称恢复能力已验证。

# 6. Boundary

## Owner Decision Required

Owner 待决定的具体对象是：是否接受本文和 R1/R2 的精确范围、§1 的五项实现范围及必要控制源码、§3 的专用新增目录/文件权限，并保留 §2 禁止项与 §4 零执行预算。可以批准、部分批准或拒绝；未明确批准的范围保持 NOT_AUTHORIZED。

本文件没有 Owner 批准事实或签名，不是 R2 的 Startup Activation，也不能作为被测对象自行选择的信任来源。即使未来 Owner 批准本零预算的实现范围，也只允许被明确批准的静态文件工作，不自动准许运行门禁、生成运行 Evidence、改变 P0S7_ALLOWED 或进入其他阶段。

**P0S7_STATE = NOT_STARTED，直到 Owner Approval。** 本申请阶段 P0S7_ALLOWED=NO；未来阶段状态须依据实际批准的工作及实际开始事实更新，批准本零执行预算申请不会自动把 Runtime execution 置为允许，也不会自动开始 P1。

精确 Node/Electron 工件、ABI、fixture、权限控制及 S7 信任实物仍待适用材料，不在此虚构选择或认证。静态实现可以围绕 R2 已定的拓扑、协议和接口推进；实际准备工具运行前落实对应身份/授权，真实启动前完整落实 Snapshot/Binding/Approval/Preflight。不能因材料缺失绕过 Gate，也不需要先关闭未被最小路径采用的生产范围缺口。

```text
DOCUMENT_STATUS = AUTHORIZATION_REQUEST
AUTHORIZATION_ID = P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-20260905-01
OWNER_DECISION = OWNER_DECISION_REQUIRED
CURRENT_GOAL = MINIMAL_CONTROLLED_RUNTIME_SPIKE
DESIGN_ID = P0S7-MINIMAL-SPIKE-EXECUTION-DESIGN-20260905-01
P0S6_STATE = CLOSED
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
IMPLEMENTATION_PERMISSION = REQUESTED_NOT_GRANTED
SOURCE_FILE_CREATION_AUTHORIZED = NO
RUNTIME_FILE_CREATION_AUTHORIZED = NO
FIXTURE_FILE_CREATION_AUTHORIZED = NO
RUNTIME_EXECUTION_AUTHORIZED = NO
EVIDENCE_RUNTIME_GENERATION_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
PACKAGE_IDENTITY_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
SIGNATURE_AUTHORIZED = NO
TEST_EXECUTION_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
REQUESTED_INVOCATION_COUNT = 0
REQUESTED_RETRY_COUNT = 0
REQUESTED_RESUME_COUNT = 0
REQUESTED_RECOVERY_COUNT = 0
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
RUNTIME = NOT_CREATED
PACKAGE = NOT_CREATED
INVOCATION = NOT_CREATED
ACCEPTANCE_GATES = NOT_EXECUTED
CANDIDATE_STATUS = generated_not_applied
CANDIDATE_APPLIED = NO
P1_STARTED = NO
PROJECT_FROZEN = NO
```

## Performed Work and Unexecuted Items

本轮仅新增 `docs/04-development-records/P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION.md`，形成拟授权范围、工件权限、零预算、验收门禁和 Owner 生效边界。未创建申请中列出的目录、源码、配置、fixture 或 Evidence 文件。

检查方式仅为静态文档核对：六个必需章节、引用摘要、范围/预算/状态一致性、UTF-8 无 BOM/中文无乱码及既有项目文件前后字节；本文 SHA-256 在最终回复单独提供。未运行测试或项目 Verification，静态文档检查不产生 Runtime/验收 PASS。

未写代码、创建 Runtime/Package/Snapshot/Binding/Signature/Invocation、冻结项目或生成运行 Evidence；未修改代码/历史 Runner/Manifest/lockfile/Git 配置/upstream，未应用 Candidate；未下载/安装/build/resolve/解包/部署/配置系统权限，未创建 key 或读取私钥；未执行测试、Preflight、Driver/故障工具、Launch、IPC/SUM3、Invocation、Retry/Resume/Recovery、Commit、Push。

