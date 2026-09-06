# P0.S-7 Minimal Spike Implementation Authorization Owner Approval

| Field | Value |
|---|---|
| Decision ID | `P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Decision | `APPROVED_PHASE_A_IMPLEMENTATION_ONLY` |
| Record Date | `2026-09-05` |
| Decision Authority | 依据本轮用户委托，在批准/拒绝之间作出限定范围决定；采用建议的 Phase A Implementation Only |
| Authorization Request | `P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-20260905-01` |
| Applicable Design | `P0S7-MINIMAL-SPIKE-EXECUTION-DESIGN-20260905-01` |
| Current Goal | `MINIMAL_CONTROLLED_RUNTIME_SPIKE` |
| P0.S-7 / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Phase A Implementation State | `NOT_STARTED`；批准已记录，本轮不实施 |
| Invocation / Usable Execution Budget | `0 / 0` |
| Deliverable | 仅本文；不生成 Signature、实现文件或执行结果 |

## Read Basis and Record Precedence

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION.md) | `9785918A304317BC4A38A4C54E9636E06EC57C9A8CE294D4F9AA82E6681E145C` |
| R2 | [P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |
| R3 | [P0S-7-MINIMAL-SPIKE-SCOPE-RECONCILIATION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SCOPE-RECONCILIATION.md) | `9BF71B8D58AE45BE0AF120D858F24D1CB62575BF61583B2F890E52390894BF22` |

R1 保持原 AUTHORIZATION_REQUEST 字节和历史申请状态。本决定承接 R1，仅将下列 Phase A 范围从“请求”转为“批准”；未列入的工件和操作保持未授权。R2 的最小设计及 R3 的范围收口继续适用，旧完整产品范围与历史 Gate 不被本文改写。

本文是静态实现的治理批准记录，不是 Runtime 的 Owner Freeze Approval、Startup Activation 或密码学 Signature；不把本记录当作完整信任链或执行许可。

# 1. Decision

**批准：Phase A Implementation Only。**

批准后续在 §2 白名单内创建和编辑最小 Spike 源码及 Evidence 结构模板。该批准覆盖可审阅的静态文件实现，不批准运行它们、创建已定型 Runtime/Package、生成真实运行 Evidence 或执行验收。

作出批准的依据：

- R2 已明确 Electron Desktop → Named Pipe IPC → Node Worker → SUM3 Stub 的有限任务及控制要求，R1 已提出专用新增目录。
- 静态源码可以先形成，再在未来适用权限下补足精确工件、环境、信任和运行证据；无需为批准静态实现先执行禁止的 Runtime 或补齐 P1 产品范围。
- 当前执行预算维持 0，运行、测试、冻结、签名和发布权限均与本阶段分开。

本决定不是待批准建议；**Phase A 文件权限已批准**。本轮用户同时明确禁止实际实现，因此本次只落地决定文档，不创建任何 Phase A 目录或源码。后续开展此范围的静态实现时可使用本决定，不必重复申请同一 Phase A 权限。

# 2. Approved Scope

批准的专用根为：

`D:\Project\Shaco-Forge\experiments\P0S-7-MINIMAL-SPIKE`

本轮只读检查时该目录不存在；本决定未创建目录，也未将它冻结为运行根或信任根。目录仅用于后续获准的非生产源码/模板。

| Scope ID | Approved Scope | 允许的新增文件范围 | 限定内容 |
|---|---|---|---|
| PA-A01 | Spike source files | 专用根下 src/control/、src/evidence/ | 本 Spike 必需的最小 Driver/collector、Authority/Preflight 检查、有界控制逻辑、接口/类型；仅编写源码，不运行检查或配置信任 |
| PA-A02 | Desktop source | 专用根下 src/desktop/ | Electron Main/Renderer/preload 源码；一次任务/结果界面，Renderer 隔离，与 Worker 生命周期分开 |
| PA-A03 | Worker source | 专用根下 src/worker/ | 独立 Node Worker 最小入口、任务校验、执行前屏障、结果/错误及显式停止逻辑；不实际创建 Worker 进程 |
| PA-A04 | IPC source | 专用根下 src/ipc/ | SHACO_SPIKE_IPC_V1 命名管道协议、角色/实例认证、消息边界和拒绝路径的源码；不创建/连接管道 |
| PA-A05 | SUM3 Stub source | 专用根下 src/stub/ | 固定 SUM3 业务计算逻辑及源码内静态输入/期望定义：[2,3,5] → count=3、sum=10；不调用该逻辑验证结果 |
| PA-A06 | Evidence structure template | 专用根下 evidence-structure/ | startup/runtime/failure/recovery disposition 结构、finalization 索引模板、schema/字段与来源说明；TEMPLATE_ONLY，无实际事件/结果 |

上述目录内可创建必要的源码/类型/schema 和直接相关的静态说明，并编辑本 Phase A 新增的这些文件。该权限不覆盖批准前已有的产品源码、历史 Runner、Manifest、Binding、lockfile、治理文件或 upstream，也不授权越界重构。

R1 请求中的 config/、fixtures/、evidence/、外部 Node/Electron 分发文件、构建或冻结工件，**不在本 Phase A 文件白名单内**。业务常量与协议类型可作为上述源码的一部分编写；不能以“模板/源码”命名创建实际 Runtime 配置、Test fixture 实物、运行 Evidence、Snapshot 或 Binding。

静态实现须保持：

- 标记 NOT_PRODUCTION；Evidence 模板标记 TEMPLATE_ONLY / NOT_EXECUTED，不填写虚构 PID、时间、Signature、Gate PASS 或运行结果。
- Stub 仅替代业务能力；Authority、Snapshot、Signature 检查、IPC 认证、OS 控制和 Evidence 写入路径不得 hard-code success。缺少必要实际输入时默认拒绝。
- 遵守 R2 的无环引用和事实域：PID/start time/generation、实际 endpoint、消费量及结果不得进入 signed Snapshot 或其间接输入；允许编写类型/读取逻辑，不允许实例化冻结工件。
- 新文件使用 UTF-8，优先无 BOM；保持中文完整。路径解析必须留在批准根与白名单子目录，不覆盖不属于本 Phase A 的文件，不通过 reparse/重定向越界。

实际项目仍为 `D:\Project\Shaco-Forge`（ACTUAL_PROJECT_SOURCE）；upstream 仍为 REFERENCE_SOURCE。本阶段不复制/改造 upstream，不修复 Git ownership，不修改 safe.directory，不冻结整个项目。

# 3. Forbidden

| Forbidden Item | 本决定后的状态与边界 |
|---|---|
| Runtime launch | NOT_AUTHORIZED；不启动 Electron、Node Worker、Driver/collector 或业务进程，不连接 IPC、不执行 SUM3 |
| Invocation | NOT_AUTHORIZED；不预留/创建 Invocation Plan、slot 或运行 ledger，不复用历史请求，不执行 validation/control/fault/reconciliation session |
| Package | NOT_AUTHORIZED；不构建/解包/创建 Package、Package Identity、Production artifact 或 Release artifact |
| Snapshot | NOT_AUTHORIZED；不创建/冻结 Runtime Snapshot、Runtime Definition Identity 或 Frozen Input Manifest |
| Binding | NOT_AUTHORIZED；不创建、修改或交付正式 Binding |
| Signature | NOT_AUTHORIZED；不签名，不创建 key、不读取私钥，不配置信任根/公钥用途或伪造批准 |
| Tests | NOT_AUTHORIZED；不跑单元/集成/端到端/手工测试、smoke、项目 Verification、Preflight、故障注入或以“检查”为名执行源码 |

本阶段同样不授权下载/安装依赖、npm/pnpm/resolver、build、解包、复制外部分发、部署 fixture、修改系统/ACL/权限、真实证据采集或 finalization。人工静态源码审阅、文本/编码检查及普通文件摘要记录可用于静态交付核对；它们不是运行验证，不产生技术 PASS。

继续禁止 Production Runtime、Full Harness、Package Release、Installer、Plugin Ecosystem、Complete Dependency Marketplace、Full Deployment 和 P1。Candidate 保持 generated_not_applied，既有 lockfile、Git 配置、历史输入/证据均不修改；不 Commit、Push。

# 4. Budget

| Budget Item | 批准数量 | 当前可用数量 |
|---|---:|---:|
| Invocation | 0 | 0 |
| Retry | 0 | 0 |
| Resume | 0 | 0 |
| Recovery | 0 | 0 |
| Runtime / Desktop / Worker launch | 0 | 0 |
| Test / Preflight / validation / fault session | 0 | 0 |
| Install / build / unpack / external network | 0 | 0 |

**Current usable execution budget = 0。**

本 Phase A 的静态文件写入已获批准，不需要 Runtime slot；零预算也不允许为了检查语法、观察界面或生成 Evidence 而执行一次源码。设计中的上限、ED-C01/ED-F01～F07 或 R1 的六项 Acceptance Gate 均不形成默认额度。

未来如需真实准备工具、测试或执行，应有明确对象、Case/variant、工具/环境/信任身份、动作与有限预算、根、时限、停止和证据边界。当前不申请、不发放、不消费、不退还或扩大任何执行额度。

# 5. Boundary

**Implementation Approval != Execution Approval。**

| Permission / State | 本决定后的事实 |
|---|---|
| Phase A 静态源码/模板创建与编辑 | APPROVED，仅限 §2 白名单 |
| 本轮实际实施 | NOT_PERFORMED；本轮只创建决定文档 |
| Phase A Implementation State | NOT_STARTED |
| P0S7_STATE | NOT_STARTED |
| P0S7_ALLOWED | NO；既有 Runtime/阶段执行门禁未打开，不否定本决定限定的静态文件权限 |
| Runtime / Package / Invocation | NOT_CREATED / NOT_CREATED / NOT_CREATED |
| Input Closure | BLOCKED / INPUT_CLOSURE_COMPLETE=NO |
| Runtime Acceptance | NOT_EXECUTED；无 Desktop/Worker/IPC/SUM3/Evidence/Fail-closed 技术 PASS |
| P1 / Project Freeze | NOT_STARTED / NOT_PERFORMED |

源码实现完成后可如实记录“静态实现已写入、未运行验收”；不能把源码存在或文档/摘要检查当作 Runtime 就绪。R1 的 Desktop starts、Worker starts、IPC authenticated、SUM3 executes、Evidence generated、Fail closed works 仍需未来获准后的真实证据。

本决定解除的是 Phase A 白名单文件工作的待批准状态，不关闭 EAR-C01 全部输入缺口、不批准全部 R1 工件，也不提供 R2 的精确 Snapshot/Binding/Owner Freeze Approval/Startup Activation。静态实现可先推进；真正启动前仍须具备完整适用的身份、独立信任、批准、预算与真实 Final Preflight。

若后续工作需要超出白名单或任一禁止事项，停止受影响动作；不得将实现许可扩展为执行许可。已批准范围内的普通静态编辑不因此重新变成待批准事项。本文不自动启动下一项实现任务，不追加其他阶段权限。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_ID = P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-20260905-01
DECISION = APPROVED_PHASE_A_IMPLEMENTATION_ONLY
AUTHORIZATION_REQUEST_ID = P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-20260905-01
CURRENT_GOAL = MINIMAL_CONTROLLED_RUNTIME_SPIKE
IMPLEMENTATION_APPROVAL = APPROVED_PHASE_A_ONLY
EXECUTION_APPROVAL = NOT_AUTHORIZED
PHASE_A_IMPLEMENTATION_STATE = NOT_STARTED
PHASE_A_SOURCE_FILE_CREATION_AUTHORIZED = YES
PHASE_A_EVIDENCE_TEMPLATE_CREATION_AUTHORIZED = YES
RUNTIME_EXECUTION_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
PACKAGE_IDENTITY_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
SIGNATURE_AUTHORIZED = NO
TEST_EXECUTION_AUTHORIZED = NO
RUNTIME_EVIDENCE_GENERATION_AUTHORIZED = NO
FIXTURE_FILE_CREATION_AUTHORIZED = NO
INVOCATION_BUDGET = 0
RETRY_BUDGET = 0
RESUME_BUDGET = 0
RECOVERY_BUDGET = 0
CURRENT_USABLE_EXECUTION_BUDGET = 0
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
RUNTIME = NOT_CREATED
PACKAGE = NOT_CREATED
INVOCATION = NOT_CREATED
ACCEPTANCE_GATES = NOT_EXECUTED
CANDIDATE_STATUS = generated_not_applied
CANDIDATE_APPLIED = NO
P1_STARTED = NO
PROJECT_FROZEN = NO
IMPLEMENTATION_PERFORMED_THIS_TURN = NO
```

## Performed Work and Unexecuted Items

仅新增本 Owner Decision 文档，记录 Phase A 批准、六类源码/模板范围、白名单目录、禁止项、零预算与实施/执行权限区分。原申请、设计和范围文件保持原字节。

核对方式：静态检查五个必需章节、批准/禁止/预算/阶段状态、引用 SHA-256、UTF-8 无 BOM/中文无乱码及既有文件前后字节；本文 SHA-256 在最终回复提供。没有运行测试、项目 Verification 或源码。

未创建 Phase A 目录/源码/模板，未写代码或创建 Runtime/Package/Snapshot/Binding/Signature/Invocation/运行 Evidence；未修改代码、Runner、Manifest、lockfile、Git 配置或 upstream，未应用 Candidate；未下载、安装、构建、解包、配置环境/权限、创建 key 或读取私钥；未测试、Preflight、Launch、Driver/故障工具、IPC/SUM3、Invocation、Retry/Resume/Recovery、Commit、Push。

