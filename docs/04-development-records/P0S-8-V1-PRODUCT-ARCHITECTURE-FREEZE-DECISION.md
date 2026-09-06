# P0.S-8 V1 Product Architecture Freeze Decision

| Field | Value |
|---|---|
| Decision ID | `P0S8-V1-PRODUCT-ARCHITECTURE-FREEZE-20260906-01` |
| Document Type | `P0S8_V1_PRODUCT_ARCHITECTURE_FREEZE_DECISION` |
| Document Status | `FINAL_ARCHITECTURE_FREEZE_DECISION` |
| Decision Date | `2026-09-06` |
| Decision Scope | `P0.S-8 — V1 Product Architecture Freeze` |
| Freeze Standard | `ARCHITECTURE SUFFICIENT FOR V1.0–V1.3 DEVELOPMENT` |
| Execution Authority | `NONE` |

本决定以“足够稳定、足够清晰、足以连续开发 V1.0～V1.3”为冻结标准，关闭前期 Feasibility / Architecture Exploration。它不是成熟商业产品、Enterprise 架构或实现细节的完成声明。

## 1. Freeze Basis and Gate

冻结输入为：

- [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md)、[Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md) 与 [Documentation Rules](../00-governance/SHACO-FORGE-DOCUMENT-RULES.md)。
- [P0.S-7 Final Closure Decision](P0S-7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-DECISION.md)，Decision ID `P0S7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-20260906-01`。
- [Roadmap Reassessment Decision](P0S-ROADMAP-REASSESSMENT-DECISION.md)，Decision ID `P0S-ROADMAP-REASSESSMENT-20260906-01`。
- [V1 Product Architecture Plan](../03-v1.0-plan/SHACO-FORGE-V1-PRODUCT-ARCHITECTURE-PLAN.md)，Plan ID `SF-V1-PRODUCT-ARCHITECTURE-PLAN-20260906-01`，Status `V1_ARCHITECTURE_PLAN_ONLY`。
- [P0.S Feasibility Spike](../03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md) 与 [V1.0 Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md)。

Owner 提供的外部独立 Final Gate 输入为 `SF-V1-ARCH-FINAL-REVIEW-20260906-01`：

```text
V1_PRODUCT_ARCHITECTURE_FINAL_REVIEW = PASS
FIRST_FAILURE_BOUNDARY = NONE
Blocking Findings = NONE
P0S7_ARCHITECTURE_VALIDATION_CAN_CLOSE = YES
P0S8_V1_PRODUCT_ARCHITECTURE_FREEZE_READY = YES
V1_IMPLEMENTATION_CAN_START_AFTER_FREEZE = YES
```

仓库中没有据此声称 Review Artifact 路径、SHA-256、Commit 或 Repository Artifact。

## 2. Frozen Architecture

### 2.1 Desktop Renderer / Desktop Main / Worker

- Renderer 只负责五页 UI、用户输入和可重建投影；不直接调用 Provider、不直接写 SQLite、不持有执行真相。
- Desktop Main 负责窗口生命周期、受限 Native Bridge、allowlisted IPC、Worker 发现/监督与连接；不执行业务 Agent 工作。
- Worker 负责 Product API、任务协调、Agent 调用、权威状态推进、持久化和产品事件。
- 依赖方向冻结为 `Renderer -> Desktop Main -> Worker Product API -> Product Services -> Agent Adapter / Storage Ports`；Provider 私有输出只能经 Adapter 规范化后进入产品层。

### 2.2 Product API Command / Query / Event

- Command 表达有副作用的意图，由 Worker 校验、受理并推进状态。
- Query 读取 Worker 的当前权威状态，不产生业务副作用。
- Event 是 Worker 已记录事实的有序通知；UI 事件投影不是权威状态。
- Desktop 重连或结果不确定时必须 `QUERY FIRST`，不得盲目 replay 有副作用 Command。

### 2.3 Worker Single Writer

Worker 是 Conversation/Session、Task、AgentRun、Result 执行状态的唯一权威写入者。Desktop、Adapter、File Store 和日志都不得建立可独立推进的第二套产品状态真相。

### 2.4 Agent Adapter Contract and V1 Roles

统一 Adapter 合同必须覆盖：能力声明、启动 AgentRun、提交用户输入、取消、查询 Provider 侧状态、收集规范化结果，以及规范化增量输出、工具活动、用户注意、结果、失败和取消事件。

- DeepSeek Adapter：默认对话、分析、流式输出、工具活动和错误映射。
- ChatGPT Adapter：通用对话、分析、流式输出和错误映射。
- Codex Adapter：代码库分析、编辑/执行、变更摘要、阶段输出、取消和错误映射。
- Reviewer Adapter：接收 Task 输入与执行结果，输出独立 verdict、findings、severity 和建议。

Reviewer 必须创建独立 `AgentRun` 并保存明确输入/输出引用；Executor 自评不得冒充 Reviewer 结果。Provider Session ID 只是 Provider Reference，不等于 Shaco Conversation ID。

### 2.5 Product Identity Relations

- `Project` 是用户选择的单一项目边界；一个 `Conversation` 在 V1.0 只属于一个 Project。
- `Conversation` 是连续交互容器，可包含有序 Turn 和多个 Task；Provider 会话只通过引用关联。
- `ContextSelection` 固定某次 Task 实际选择的文件、文档、说明与来源引用。
- `Task` 是可追踪的产品工作单元，属于 Conversation，并引用 ContextSelection。
- `AgentRun` 是 Task 内一次具体 Adapter 调用；一个 Task 可有多个 AgentRun，Reviewer 使用独立 AgentRun。
- `Result` 属于 Task，索引可展示摘要、执行输出、变更和 Reviewer findings 的引用。
- `TaskEvent` 由 Worker 追加，记录状态、增量输出、错误和注意事项，并关联 Task/AgentRun。

只冻结上述语义、责任和引用关系，不冻结全部字段。

### 2.6 Project Context Boundary

- Project Root 是用户明确选择并由 Worker 规范化、验证的默认文件访问边界。
- Project Scan 负责可解释地枚举文件、忽略项、不可读/过大/二进制/越界条目及扫描错误。
- File Index 为路径浏览、查找、上下文选择和后续增量演进提供产品索引，不是项目内容真相的替代品。
- Document Context 汇集用户任务、显式文件/文档、项目规则和可解释推荐；发送前必须能展示与删减来源。
- Path Boundary 由 Worker 执行；Renderer 路径不可信，默认拒绝项目根外读取，显式外部选择必须另行记录。

### 2.7 Storage Responsibilities and Truth

- SQLite 保存 Project、Conversation 引用、Task、AgentRun、Result 索引、状态、顺序、版本与轻量设置，是结构化产品状态真相。
- File Store 保存 ContextSelection、长文本输出、代码变更、Review 报告、附件和其他大型结果；不得成为第二套 Task 状态真相。
- Structured Logs 保存 Desktop、Worker、Adapter、Task 和错误的可关联诊断记录；日志不取代 SQLite 状态，也不得记录密钥或无界敏感数据。
- Provider/Harness 私有 transcript、settings、credentials 与 runtime data 保持其自身所有权；Shaco 只保存产品元数据、规范化结果和来源引用。

### 2.8 Task Lifecycle

```text
CREATED -> RUNNING -> REVIEW -> COMPLETED
    |          |         |
    `----------+---------+-> FAILED
```

- `COMPLETED` 与 `FAILED` 是互斥、不可逆终态。
- `CREATED / RUNNING / REVIEW` 均可在不可继续时进入 `FAILED`。
- Result 或 Reviewer Finding 表达产出质量，不等于系统执行失败；Reviewer 正常产生可读 findings 时可完成 Task，系统/调用/状态不一致才进入 `FAILED`。
- Retry 必须创建新 Task，通过引用关联旧 Task；不得回滚或重开旧 Task。

### 2.9 V1 Five-page Product Route

V1.0 最终产品范围冻结为 `Project -> Chat -> Task -> Result -> History` 五页：Project 确定项目边界，Chat 承载 Conversation/任务输入，Task 展示执行进度，Result 展示产出与 Review，History 查询既有 Conversation/Task/Result。五页共享 Worker 权威状态，不复制状态机。

### 2.10 Version Scope

- V1.0：单用户、单项目主路径；五页、四个最小可用 Adapter、Analysis、Execution、Independent Review、Result、Project Context、Storage、Structured Logs。
- V1.1：在现有 Task/AgentRun/Adapter 关系上增加 Multi-Agent、Task decomposition、有限 Workflow 和更丰富 orchestration UI。
- V1.2：在现有 Worker/Storage/Task Identity 上增加 Long Task、完整 History、Recovery 和 Project Memory。
- V1.3：增加产品级 Permission、Product Snapshot、Stronger Evidence 和 Enterprise extension points。
- Enterprise：独立立项，不属于 V1.0～V1.3 Gate。

## 3. Frozen Principles

`Product First`；Desktop 不直接调用 Provider；Renderer 不直接写 SQLite；`Worker Single Writer`；Adapter 隔离 Provider 私有协议；Reviewer 使用独立 AgentRun；Provider Session ID 只是 Provider Reference；Provider Session ID 不等于 Shaco Conversation ID；File Store 不得成为第二套 Task 状态真相；Result / Reviewer Finding 不等于系统执行失败；Desktop 重连后 `QUERY FIRST`；Enterprise 能力不得成为 V1.0～V1.3 Gate。

## 4. Explicitly Not Frozen

本轮不冻结：具体 class、Service class、Repository class 名称；全部 API 字段；完整 JSON wire schema；全部 Error Code；SQLite 全部表字段与索引；ORM；Migration 细节；UI 像素、最终视觉、Animation、最终 Layout 尺寸；日志轮转参数；最终文件目录命名；Adapter Provider SDK 内部实现与 Provider 私有协议；完整 Retry、Recovery、Exactly Once、Crash Recovery、性能和并发策略；商业级 telemetry、installer、update；企业级权限、安全策略和 Enterprise Runtime。

这些事项在需要它们的具体 Slice 或后续版本中决定，不得据此继续扩大 P0.S。

## 5. V1.0 Final Scope vs First Implementation Slice

V1.0 Final Scope 仍包含五页、四个最小可用 Adapter，以及 Analysis、Execution、Independent Review、Result、Project Context、Storage 和 Structured Logs；首个 Slice 的简化不缩减该最终目标。

Implementation Sequencing Recommendation：`V1-SLICE-1-SINGLE-AGENT-USER-CLOSURE`。

- 一个真实可用 DeepSeek Adapter。
- ChatGPT、Codex、Reviewer Adapter 为显式 `NOT_IMPLEMENTED` Stub。
- 最小页面为 Project、Chat、Task、Result。
- 链路为 `Desktop -> Worker -> DeepSeek Adapter -> Storage -> UI`。
- Task 状态可先采用 `CREATED -> RUNNING -> COMPLETED` 或 `CREATED -> RUNNING -> FAILED`，暂不要求 `REVIEW`。
- 暂不包含 History、Independent Review、四个真实 Adapter、Multi-Agent、Workflow、Crash/Long-running Recovery、Project Memory、Permission Center、Snapshot、Strong Evidence 或 Enterprise。

这是实现顺序冻结，不是代码、Runtime 或实现授权，也不表示 Slice 已开始。

## 6. Evolution Sufficiency

V1.1 只要求当前模型允许一个 Task 关联多个角色化 AgentRun、父子 Task 与有限编排；不预先设计 Workflow Engine。V1.2 只要求 Worker 权威、持久 Identity、Storage 分层与不可逆终态可扩展恢复/历史/记忆；不预先设计完整 Recovery State Machine。V1.3 只要求 Project/Task/Context/Result 引用和 Adapter/Storage ports 能挂接权限、快照、Evidence 与企业扩展；不实现企业安全链。

因此后续能力可以增量添加而无需推翻 Desktop/Worker 分层、Product Model、Adapter 边界、Storage 真相或 Task 核心生命周期；当前 Freeze 已经 `SUFFICIENT FOR V1.0–V1.3 DEVELOPMENT`。

## 7. Enterprise Deferred

以下能力继续延期，且不属于 P0.S-8 或 V1.0～V1.3 Gate：Trust Root；Owner / Organization Signature；Cryptographic Binding；Windows Sandbox；Zero Trust Runtime；完整 Software Supply Chain Proof；Enterprise Fixture Environment；企业级 Policy Center；Tenant Isolation；企业级高保障执行平台。

## 8. P0.5 / P1 Reconciliation

旧 Development Map 的 `P0.S -> P0.5 -> P1 -> P2...` 路线保留；P0.5 Compatibility 与 P1 System Contract 未删除、未宣布完成。它们继续承载 Compatibility、System Contract、Production implementation refinement 和 Cross-cutting contract。

最新 Roadmap Reassessment 与 Final Gate 同时允许冻结后开始 V1 实现。因此旧线性排列不构成“必须完整完成 P0.5 + P1 才能开始第一个 V1 vertical Slice”的隐性阻塞。具体 Slice 若依赖某项 P0.5/P1 Contract，必须在该 Slice 显式设 Gate；P0.S-8 不提前完成全部 P0.5/P1 工作。

## 9. Closure Meaning and Final State

```text
P0S8_STATE = CLOSED
P0S8_RESULT = V1_PRODUCT_ARCHITECTURE_FROZEN
P0S8_GOAL = V1_PRODUCT_ARCHITECTURE_FREEZE
P0S8_FREEZE_INPUT_READY = YES
P0S8_FREEZE_EXECUTED = YES

SHACO_FORGE_V1_0_P0S = PASS
P0S = CLOSED

V1_IMPLEMENTATION_READY = YES
V1_IMPLEMENTATION_STARTED = NO
```

`P0.S CLOSED` 只表示前期 Feasibility / Architecture Exploration 已经足够，产品架构已稳定到可以开发。它不表示产品代码、V1.0、Database、Adapter、Runtime、Production、Project Scan、File Index、V1 Tests、Recovery 或 Enterprise 已完成。

## 10. Structural Risk Verdict and Non-execution Record

未发现会迫使 V1.0～V1.3 整体推翻 Desktop、Worker、Product Model、Adapter、Storage 或 Task 核心架构的结构性缺陷；不存在阻止首个 V1 Slice 开始的架构 blocker。

```text
Product Code Change = NOT_EXECUTED
Database Creation / Migration = NOT_EXECUTED
Runtime = NOT_EXECUTED
Project Test = NOT_EXECUTED
Build = NOT_EXECUTED
Project Scan / File Index = NOT_EXECUTED
Agent / Provider Call = NOT_EXECUTED
V1 Implementation = NOT_STARTED
Commit / Push / Staging = NOT_EXECUTED
```
