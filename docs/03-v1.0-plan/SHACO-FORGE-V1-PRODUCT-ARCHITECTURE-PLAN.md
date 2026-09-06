# Shaco Forge V1 Product Architecture Plan

| Field | Value |
|---|---|
| Plan ID | `SF-V1-PRODUCT-ARCHITECTURE-PLAN-20260906-01` |
| Document Type | `V1_PRODUCT_ARCHITECTURE_PLAN` |
| Status | `V1_ARCHITECTURE_PLAN_ONLY` |
| Plan Date | `2026-09-06` |
| Planning Owner Role | Shaco Forge V1 Product Architecture Owner |
| Product Definition | AI 辅助软件开发工作台 |
| Planning Basis | `P0S-ROADMAP-REASSESSMENT-20260906-01` |
| Execution Authority | `NONE` |

> **Current V1.0 implementation-scope authority (2026-09-06):**
> [V1.0 Harness Reuse Implementation Scope Corrective Decision](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md),
> Decision ID `V1-0-HARNESS-REUSE-SCOPE-CORRECTIVE-20260906-01`, supersedes
> only this plan's expanded V1.0 Implementation Scope Allocation. Sections that
> assign four Provider Adapters, an independent Reviewer pipeline, a Shaco Task
> state machine/database, five custom pages, Project Scan/File Index or
> ContextSelection truth to V1.0 are retained as historical architecture-planning
> input and are not current V1.0 implementation requirements. P0.S remains closed.

## 0. Plan Position

本计划把 Shaco Forge V1 重新组织为一个可交付的 AI 辅助软件开发工作台。首要目标是让用户从选择项目开始，完成创建任务、Agent 分析、Agent 执行、Reviewer 检查和查看结果的端到端流程。

本计划承接以下路线决定：

- P0.S-7 定位为 **Controlled Agent Execution Architecture Validation**。
- P0.S-8 定位为 **V1 Product Architecture Freeze**。
- V1 优先验证和交付产品闭环，不优先建设 Enterprise Runtime。
- Desktop、Worker、Agent Adapter、Session、Project Context、Storage、Task Lifecycle 和 UI 是 P0.S-8 必须冻结的产品架构域。

本文是架构规划，不是 P0.S-8 Freeze Decision，不启动实现，不变更 P0.S-7 / P0.S-8 状态，也不授予 Runtime 或测试权限。

## 1. Product Goal and V1 User Loop

### 1.1 核心用户流程

```text
选择项目
  -> 创建任务
  -> Agent 分析
  -> Agent 执行
  -> Reviewer 检查
  -> 用户查看结果
```

### 1.2 V1 产品完成定义

V1 的完成度以真实用户任务能否闭环判断，而不是以底层控制能力数量判断。一个 V1.0 任务至少必须具备：

- 用户明确选择的本地项目。
- 可见、可调整的任务输入和项目上下文。
- 至少一次分析与一次执行阶段输出。
- 一份 Reviewer 检查结果。
- 统一任务状态、结果页和可定位问题的基础日志。
- 失败时真实进入失败终态，不静默完成，不丢失已生成结果。

### 1.3 V1 架构原则

1. **Product First：** 模块和 Gate 必须直接支撑用户闭环、可靠性或后续已规划版本。
2. **Worker Owns Execution Truth：** Desktop 展示状态，Worker 决定 Task、Agent Run 和 Result 的执行事实。
3. **One Product Model：** UI、Storage 和 Adapter 使用统一 Project、Conversation、Task、Result 标识，不为每个 Provider 建立一套产品状态机。
4. **Adapter Isolation：** Provider 私有协议、事件和错误只能存在于 Adapter 内部，产品层只接收规范化能力和事件。
5. **Visible Context：** 用户应知道哪些文件和文档被发送给 Agent；自动收集必须可解释、可删减。
6. **Single Writer：** V1 中 Worker 是 Session / Task 产品状态的唯一持久写入者，Desktop 不直接改写执行状态。
7. **Evidence First, Product Sized：** 先记录关键状态和结果引用，再向 UI 发布；V1 只建设产品所需的日志与追溯能力。
8. **Progressive Capability：** V1.0 先交付顺序闭环，V1.1～V1.3 再增加编排、恢复、记忆和更强控制。

## 2. V1 Logical Architecture

### 2.1 总体拓扑

```text
Shaco Forge Desktop
  Renderer
    Project / Chat / Task / Result / History UI
    View Models + Local UI State
  Main
    Window + Native Bridge + Worker Supervisor + IPC Adapter
             |
             | allowlisted IPC + local Worker carrier
             v
Shaco Forge Worker
  Product API / Control Plane
  Session Service
  Task Service + Background Task Runner
  Project Context Service
  Agent Dispatcher
       |-> ChatGPT Adapter
       |-> Codex Adapter
       |-> Reviewer Adapter
       `-> DeepSeek Adapter
  Storage Service
       |-> SQLite product database
       |-> file store
       `-> structured logs
```

### 2.2 依赖方向

```text
UI -> Desktop Main -> Worker Product API -> Product Services -> Agent Adapter
                                              |
                                              `-> Storage Ports

Provider SDK / CLI / Harness events -> Adapter normalization -> Product events
```

禁止 UI 直接调用 Provider，禁止 Provider Adapter 直接改变 UI，禁止 Desktop Renderer 直接写 SQLite，禁止 Storage 反向依赖 UI 或具体 Provider。

### 2.3 产品域对象

| Object | Purpose | Authority |
|---|---|---|
| `Project` | 用户选择的本地代码项目及其索引状态 | Shaco SQLite |
| `Conversation` | 用户与 Agent 的连续交互容器 | Shaco 元数据；Provider/Harness transcript 通过引用关联 |
| `ContextSelection` | 某次任务实际选用的文件、文档和用户说明清单 | Worker / file store |
| `Task` | 一次从分析、执行到 Review 的产品工作单元 | Worker / Shaco SQLite |
| `AgentRun` | Task 内一次具体 Adapter 调用 | Worker；Provider 原始会话通过引用关联 |
| `Result` | 面向用户的摘要、变更、Review 发现和输出引用 | Worker / file store + SQLite index |
| `TaskEvent` | 状态、增量输出、错误和用户注意事件 | Worker append-only record |

`Conversation` 是交互上下文，`Task` 是可追踪的工作单元，`AgentRun` 是对具体 Agent 的一次调用。三者不得混用同一个状态或标识。

## 3. Desktop Architecture

### 3.1 Desktop 职责

Desktop 由 Electron Main 与 Renderer 两部分组成：

| Layer | V1 Responsibility |
|---|---|
| Renderer UI | 展示 Project、Conversation、Task、Result 和 History；采集用户输入；展示连接、运行、失败和等待状态 |
| Renderer View Model | 将 Worker 的产品事件投影为页面状态；只保留可重建的临时 UI 状态 |
| Main IPC Adapter | 暴露最小 allowlist API，转发 Product Command / Query / Event，不透传任意 IPC |
| Worker Supervisor | 发现、启动、连接和停止 Worker，维护 Desktop 与 Worker 的连接状态 |
| Native Bridge | 项目目录选择、受限文件定位、系统通知和允许的外部链接能力 |

### 3.2 Desktop 不负责

- 不直接调用 ChatGPT、Codex、Reviewer 或 DeepSeek。
- 不执行 Agent 工具或代码修改。
- 不独立宣布 Task 成功或 Review 通过。
- 不持有 Provider 密钥明文，不把密钥返回 Renderer。
- 不把内存中的页面状态当成 Session、Task 或 Result 的持久真相。
- 连接模糊或重连后不自动重放可能产生副作用的命令；先查询 Worker 当前状态。

### 3.3 Desktop 页面状态

每个页面统一处理四类外部状态：

- `CONNECTING`：正在连接 Worker。
- `READY`：数据可查询、命令可提交。
- `DEGRADED`：部分数据可读，但运行命令暂不可用。
- `DISCONNECTED`：不接受新执行命令，保留已缓存的只读投影并提供重连。

这些是 Desktop 连接状态，不是 Task Lifecycle 状态。

## 4. Worker Architecture

### 4.1 Worker 职责

Worker 是当前用户范围内的后台产品进程，也是 Session、Task、AgentRun 和 Result 执行状态的唯一权威写入者。

| Component | Responsibility |
|---|---|
| Product API / Control Plane | 接收 Desktop 命令、提供 Query、发布有序产品事件、拒绝非法状态转换 |
| Session Service | 创建/继续 Conversation，维护 Turn 顺序、Task 关联和历史引用 |
| Task Service | 创建 Task、推进状态机、协调分析/执行/Review、生成最终 Result |
| Agent Dispatcher | 根据任务阶段、用户选择和 Adapter 能力选择 Agent；不包含 Provider 私有实现 |
| Background Task Runner | 在页面切换或 Desktop 窗口关闭后继续当前任务；管理取消、超时和清理 |
| Project Context Service | 扫描项目、维护文件索引、构造可见上下文、阻止项目根目录外读取 |
| Storage Service | 对 SQLite、文件存储和日志提供统一事务/追加接口 |

### 4.2 Background Task 边界

V1.0 的 Background Task 表示任务不依赖当前页面或 Desktop 窗口持续打开；它不承诺操作系统重启、Worker 崩溃或跨版本升级后的自动恢复。可靠的长任务、断点和崩溃恢复属于 V1.2。

Worker 停止时必须让未完成 Task 进入可解释状态。V1.0 无法恢复的中断记录为 `FAILED` 并保留已产生的日志和结果；不得伪造 `COMPLETED`。

### 4.3 命令与事件最小集合

| Type | V1.0 Minimum |
|---|---|
| Commands | `CreateProject`、`ScanProject`、`CreateConversation`、`CreateTask`、`StartTask`、`SubmitUserInput`、`CancelTask` |
| Queries | `GetProject`、`ListProjects`、`GetConversation`、`GetTask`、`GetResult`、`ListHistory`、`GetLogs` |
| Events | `ProjectChanged`、`ConversationChanged`、`TaskStateChanged`、`AgentOutputAdded`、`UserInputRequired`、`ResultAvailable`、`TaskFailed` |

所有会产生执行副作用的命令携带 `commandId`。Worker 对同一 `commandId` 只接受一次，并返回已知处理结果；UI 断线后通过 Query 对账，不盲目重发。

## 5. Agent Adapter Architecture

### 5.1 Adapter 目标

Agent Adapter 隔离不同 Agent 的能力、调用方式、事件格式和错误语义。产品层只依赖统一合同，不要求四个 Agent 在 V1.0 达到完整功能对等。

### 5.2 统一合同

每个 Adapter 至少提供以下逻辑能力：

| Contract | Purpose |
|---|---|
| `describeCapabilities` | 声明是否支持分析、代码执行、Review、流式输出、继续会话、取消和用户提问 |
| `startRun` | 使用规范化 Task、Conversation 和 ContextSelection 启动一次 AgentRun |
| `submitInput` | 向等待用户输入的 AgentRun 提交回答 |
| `cancelRun` | 请求取消并返回真实取消结果 |
| `getRunState` | 查询 Provider 侧当前状态，供重连和不确定结果对账 |
| `collectResult` | 返回规范化输出、变更引用、Review 发现和 Provider 会话引用 |

Adapter 向产品层发布的规范化事件只有：`RUN_STARTED`、`OUTPUT_DELTA`、`TOOL_ACTIVITY`、`USER_INPUT_REQUIRED`、`RUN_RESULT`、`RUN_FAILED`、`RUN_CANCELED`。Provider 私有事件可以记录在 Adapter 日志中，但不能成为 UI 必须理解的合同。

### 5.3 四类 V1 Agent

| Adapter | V1 Product Role | V1.0 Minimum |
|---|---|---|
| DeepSeek Adapter | 默认对话、项目分析和通用 Agent 能力；复用既有 DeepSeek Harness 能力边界 | 对话、分析、流式结果、工具活动和错误映射 |
| ChatGPT Adapter | 通用分析、方案讨论、解释与可选执行能力 | 对话、分析、流式结果和错误映射 |
| Codex Adapter | 面向代码库的分析、编辑和开发执行 | 项目任务执行、变更摘要、流式/阶段输出、取消和错误映射 |
| Reviewer Adapter | 独立检查任务结果并输出结构化发现 | 接收 Task 输入与执行结果，输出 verdict、findings、severity 和建议 |

Reviewer 是 Shaco 产品角色。其底层可以使用独立 Provider 会话或已支持的 Reviewer 能力，但必须拥有独立 `AgentRun` 和清晰的输入/输出引用，不能把 Executor 自评直接标记为 Reviewer 结果。

### 5.4 Adapter 选择规则

- 用户可以选择主 Agent；默认选择由产品设置决定。
- Task 的分析和执行阶段可以使用同一 Adapter，也可以由用户分别选择。
- Review 阶段必须创建独立 Reviewer AgentRun。
- Adapter 不支持某项能力时必须在任务开始前明确显示，不在运行中静默降级。
- Provider 暂时不可用只影响对应 AgentRun，不改变已保存的 Project、Conversation 和 Result。

## 6. Session Model

### 6.1 Session 结构

```text
Project
  `-> Conversation
        |-> ordered Turn
        |     |-> User Message
        |     |-> ContextSelection reference
        |     `-> Task reference
        `-> Provider Session References
```

| Session Element | V1 Meaning |
|---|---|
| Conversation | 围绕一个 Project 的连续工作主题，可创建多个 Task |
| Turn | 一次用户输入及其对应 Task / Agent 输出的顺序边界 |
| Context | 当前 Turn / Task 选择的文件、文档、用户说明和生成摘要 |
| History | 已完成 Turn、Task、Result 和 Provider 会话引用的可查询序列 |

### 6.2 Conversation 规则

- 每个 Conversation 必须属于一个 Project；V1.0 不支持一个 Conversation 同时跨多个 Project。
- Turn 使用 Worker 分配的单调序号，UI 本地时间不决定消息顺序。
- 一个用户 Turn 默认创建一个 Task；继续讨论可以创建新 Turn 和新 Task，并关联前一 Result。
- Provider 原始 Session ID 只作为 `providerSessionRef`，不作为 Shaco Conversation ID。
- V1.0 恢复已持久化 Conversation 和历史结果，但不承诺恢复中断中的 Provider 调用。

### 6.3 Context 与 History 分期

- V1.0：当前 Conversation、显式上下文选择、最近 Turn 和 Task Result。
- V1.1：多 Agent / Workflow 的子任务和 AgentRun 聚合视图。
- V1.2：完整可搜索 History、长期 Conversation 续接和 Project Memory。
- V1.3：上下文版本记录、来源追溯和更强 Evidence 关联。

## 7. Project Context Architecture

### 7.1 项目扫描

Project Context Service 只扫描用户明确选择的项目根目录。V1.0 扫描输出：

- 规范化项目根路径和稳定 Project ID。
- 文件与目录清单、相对路径、大小、修改时间和基础类型。
- 常见源码、配置、Markdown/文本文件的可读性分类。
- 忽略规则结果，包括版本控制忽略项、产品默认忽略项和用户排除项。
- 不可读、过大、二进制、符号链接越界和扫描错误的明确记录。

V1.0 不建设语义向量数据库。扫描优先保证路径安全、速度、可解释和增量更新的后续扩展能力。

### 7.2 文件索引

V1.0 文件索引支持：

- 按相对路径、扩展名和文本名称查找。
- 目录树浏览和上下文选择。
- 文本文件基础元数据与内容摘要引用。
- 文件变化后按需刷新，过期索引在 UI 中可见。

V1.1 增加增量索引、符号/关键词辅助定位和自动任务拆分所需的候选文件推荐；V1.2 增加 History / Project Memory 关联；V1.3 增加可追溯的上下文版本记录。

### 7.3 文档上下文

文档上下文包括 README、架构说明、开发规则、需求、变更记录及用户选择的其他文本材料。Context Builder 按以下优先级构造 Agent 输入：

1. 用户当前任务说明。
2. 用户显式选择的文件和文档。
3. 项目级规则与直接相关文档。
4. 基础扫描推荐的相关文件。
5. Conversation 中用户明确保留的近期上下文。

发送前 UI 展示来源、文件数量、排除项和预算影响。过大内容必须截断、摘要或要求用户选择，不能静默发送未知范围的项目内容。

### 7.4 项目边界

- 所有文件路径在 Worker 内解析和验证，Renderer 传入的路径不是可信最终路径。
- 默认拒绝项目根目录外读取；用户重新选择外部文件时作为显式附加上下文记录。
- 文件索引不存储 Provider 密钥或任意系统目录内容。
- 二进制内容默认不进入文本上下文；未来按明确文件类型增加能力。

## 8. Storage Architecture

### 8.1 三层存储

| Store | V1 Responsibility | Excluded |
|---|---|---|
| SQLite | Project、Conversation reference、Task、AgentRun、Result index、状态、顺序、版本和轻量设置 | 大型输出、二进制制品、Provider 密钥明文 |
| File Store | 上下文清单、长文本输出、代码变更、Review 报告、导出材料和其他较大结果 | 可并发改写的第二套 Task 状态真相 |
| Structured Logs | Worker、Desktop、Adapter、Task 和错误事件；按时间和关联 ID 查询 | 密钥、完整敏感环境变量、无界原始提示词复制 |

### 8.2 SQLite 最小实体

| Entity | Key Fields |
|---|---|
| `projects` | `project_id`、name、root_path、scan_state、created_at、last_opened_at |
| `conversations` | `conversation_id`、project_id、title、next_turn_seq、created_at、updated_at |
| `conversation_refs` | conversation_id、adapter_id、provider_session_ref、last_seen_at |
| `tasks` | `task_id`、conversation_id、turn_seq、state、stage、created_at、updated_at、failure_code |
| `agent_runs` | `agent_run_id`、task_id、adapter_id、role、state、provider_run_ref、started_at、ended_at |
| `results` | `result_id`、task_id、summary、outcome、file_ref、review_ref、created_at |
| `command_receipts` | `command_id`、command_type、task_id、outcome、recorded_at |
| `schema_info` | schema_version、migrated_at |

Provider/Harness 拥有的 transcript、settings、credentials 和运行时数据保持其自身权威；Shaco 只保存产品元数据、规范化结果及来源引用，不建立两个可独立改写的 Session 真相。

### 8.3 文件存储布局（逻辑）

```text
shaco-data/
  product.db
  projects/<project-id>/
    context/<context-selection-id>.json
    tasks/<task-id>/
      result.md
      changes/
      review.json
      attachments/
  logs/
    desktop/
    worker/
    adapters/
```

这是逻辑职责布局，不冻结操作系统绝对路径、具体数据库库或文件轮转参数；这些由 P0.S-8 / 后续实现合同确定。

### 8.4 写入一致性

- Task 状态转换与对应事件索引在同一 Worker 写入边界内完成。
- 大文件先写临时文件，完成后原子发布引用；失败时 SQLite 不指向半成品。
- UI 收到事件后仍可使用 Query 读取当前权威状态。
- 日志写入失败必须可见，但基础诊断失败不应自动把已完成的 Provider 结果改写为成功或失败。
- V1.2 引入崩溃恢复前，V1.0 启动时把无法继续的非终态 Task 明确收口为 `FAILED / INTERRUPTED`。

## 9. Task Lifecycle

### 9.1 V1 简单状态机

```text
CREATED -> RUNNING -> REVIEW -> COMPLETED
    |          |         |
    `----------+---------+-> FAILED
```

`COMPLETED` 与 `FAILED` 是互斥终态，不存在 `COMPLETED -> FAILED` 转换。

### 9.2 状态语义

| State | Meaning | Required Exit Evidence |
|---|---|---|
| `CREATED` | Task 已持久化，输入和 Adapter 选择尚未开始执行 | 有效 Project、Conversation、任务说明和 ContextSelection |
| `RUNNING` | 正在进行分析或执行；`stage` 区分 `ANALYZE` / `EXECUTE` | 产生可审查的执行 Result，或记录明确失败 |
| `REVIEW` | 独立 Reviewer AgentRun 正在检查执行结果 | Reviewer verdict/findings 已持久化，或记录明确失败 |
| `COMPLETED` | 执行结果与 Reviewer 结果均可展示 | Result index、执行输出引用、Review 引用和完成时间 |
| `FAILED` | 创建后任一阶段出现不可继续错误、用户取消或 V1.0 不可恢复中断 | failure_code、失败阶段、已保留输出和可重试说明 |

### 9.3 转换规则

- `CREATED -> RUNNING`：Worker 验证项目、上下文和所选 Adapter 最小能力后执行。
- `RUNNING -> REVIEW`：执行结果已持久化，Reviewer 输入可构造。
- `REVIEW -> COMPLETED`：Reviewer 结果已持久化且最终 Result 可读取。
- `CREATED / RUNNING / REVIEW -> FAILED`：输入失效、Adapter 失败、取消、超时或不可恢复中断。
- 终态不可逆。用户 Retry 创建新 Task，并通过 `retryOfTaskId` 关联原 Task，不回滚旧 Task。

V1.0 为保持状态机简单，不增加 `WAITING_USER` 和 `CANCELED` 顶层状态。等待输入使用 `attention = USER_INPUT_REQUIRED`，取消使用 `FAILED / CANCELED` 原因表达；V1.2 可在不破坏历史映射的前提下扩展更细生命周期。

### 9.4 Review 结果与 Task 终态

Reviewer 的 verdict 可为 `PASS`、`PASS_WITH_FINDINGS` 或 `CHANGES_REQUIRED`。只要 Reviewer 正常完成并产生可读报告，Task 可以进入 `COMPLETED`，同时由 `Result.outcome` 表达是否存在问题；Agent/Reviewer 调用失败、报告缺失或状态不一致才进入 `FAILED`。这样避免把“发现代码问题”错误等同于“系统执行失败”。

## 10. UI Flow

### 10.1 V1 必须页面

| Page | Primary Purpose | V1.0 Primary Actions |
|---|---|---|
| Project | 进入工作台并确定项目边界 | 创建/打开项目、查看最近项目、扫描/刷新、查看扫描问题 |
| Chat | 创建 Conversation 和表达任务 | 输入需求、选择 Agent、选择上下文、预览发送范围、创建 Task |
| Task | 观察分析、执行和 Review 进度 | 查看状态/stage、增量输出、工具活动、提交必要输入、取消 |
| Result | 理解任务产出 | 查看摘要、代码变更、Reviewer verdict/findings、错误、继续任务或重试 |
| History | 找回已执行工作 | 按项目查看最近 Conversation / Task、状态、Agent 和 Result |

### 10.2 主导航流程

```text
Project Page
  -> Chat Page
       -> Task Page
            -> Result Page
                 -> Chat Page (continue / corrective task)

Project Page -> History Page -> Task or Result Page
```

### 10.3 页面一致性规则

- 页面路由以 Project ID、Conversation ID、Task ID 为稳定参数，不以临时组件状态定位数据。
- Task Page 和 Result Page 使用同一 Task 权威状态；Result 未准备好时不能展示伪完成页。
- History Page 是可查询索引，不复制另一套 Task 状态。
- Provider 能力差异在 Chat Page 选择时显示；不支持的操作禁用并解释原因。
- Worker 断线时页面显示连接状态，保留只读内容；重连后重新 Query 并应用新事件序号之后的增量。

### 10.4 分期 UI 能力

- V1.0：五个页面完整主路径、最近 History、基础上下文选择、状态和错误展示。
- V1.1：任务树、多 Agent/Workflow 视图、并行/返工路径、结果对比。
- V1.2：长任务控制台、搜索/筛选 History、恢复提示、Project Memory 管理。
- V1.3：权限中心、上下文版本与 Evidence 查看/导出入口。

## 11. Version Scope Allocation

### 11.1 V1.0 — Usable Product Loop

V1.0 必须完成：

- Desktop：Electron Main/Renderer、五个必需页面、Worker 连接与状态投影。
- Worker：Product API、Session Service、Task Service、Agent Dispatcher、基础 Background Task Runner。
- Agent Adapter：统一合同，以及 ChatGPT、Codex、Reviewer、DeepSeek 四个最小可用 Adapter；不要求完整能力对等。
- Session：单 Project Conversation、Turn 顺序、ContextSelection、Provider Session Reference、最近 History。
- Project Context：项目选择、基础扫描、文件索引、文档上下文、显式上下文预览和项目边界检查。
- Storage：SQLite 产品元数据、文件结果存储、结构化日志、Schema Version、V1.0 启动时非终态收口。
- Task Lifecycle：`CREATED -> RUNNING -> REVIEW -> COMPLETED`，以及非终态到 `FAILED`。
- 用户闭环：创建 Task 后顺序完成分析、执行、独立 Review 和 Result 展示。
- Background：页面切换或 Desktop 窗口关闭不自动取消 Worker 中的当前任务。

V1.0 不包含自动任务拆分、可配置 Workflow、多 Agent 并行、无人值守长任务、崩溃后继续执行、Project Memory 或企业级能力。

### 11.2 V1.1 — Multi-Agent and Workflow

V1.1 增加：

- 多 Agent 顺序/有限并行协作。
- 自动任务拆分和用户可编辑的子任务树。
- Planner、Executor、Reviewer、Corrective 的有限 Workflow 模板。
- 父子 Task、Step 和 AgentRun 聚合状态。
- Workflow 暂停、继续、取消、返工和结果对比 UI。
- 项目增量索引、候选上下文推荐和多 Agent 上下文分配。
- Adapter 能力路由和明确降级，不建设任意 Agent 插件平台。

### 11.3 V1.2 — Long Tasks, History, Recovery and Memory

V1.2 增加：

- 长任务心跳、后台进度、超时、暂停和用户接管。
- Worker / Desktop 重启后的可恢复任务与副作用对账。
- 更细的 Attempt、取消和恢复生命周期，同时保持 V1.0 状态兼容映射。
- 完整可搜索 History、筛选、归档和任务链浏览。
- Project Memory：用户可查看、修正、删除的项目事实、约定和决策。
- Conversation 长期续接与可解释的历史上下文选择。
- 数据迁移、恢复标记、孤立文件检查和失败恢复日志。

### 11.4 V1.3 — Permissions, Product Context Records and Stronger Evidence

V1.3 增加：

- 项目文件、命令、网络和敏感操作的产品级权限控制与确认体验。
- Task 输入、上下文来源、关键文件版本和结果的产品级记录，用于复现、Review 和恢复。
- 更强结构化 Evidence：用户决定、Adapter 调用、工具活动、失败、恢复和 Result 的关联。
- 单 Project / Conversation / Task 的 Evidence 查看和导出。
- 数据保留、日志脱敏、诊断包和企业集成扩展点。
- 对 Enterprise 阶段的部署、身份、隔离和合规需求进行输入整理，但不在 V1.3 实现 Enterprise Runtime。

### 11.5 Enterprise Deferred

以下能力保持在 Enterprise，不进入 V1.0～V1.3 架构实现或发布 Gate：

- Trust Root。
- Signature。
- Binding。
- Windows Sandbox。
- Zero Trust Runtime。
- 与上述能力直接绑定的企业执行准入、密码学可信链和组织级安全治理。

本文只记录延期边界，不设计这些 Enterprise 能力。它们需要独立产品需求、威胁模型、架构决策和授权后才能开始。

## 12. P0.S-7 and P0.S-8 Use of This Plan

### 12.1 P0.S-7 验证焦点

P0.S-7 后续若被单独授权，应只验证本计划所需的架构问题：

- Desktop / Worker 职责和 Product API / IPC 边界是否成立。
- Worker 能否作为 Task 状态和 Background Task 的唯一执行真相。
- Adapter 能否规范化至少四类 Agent 的能力、事件、结果和失败。
- Session、Project Context、Task、Result 的标识与引用能否贯通用户闭环。
- 状态写入、事件发布、重连 Query 和重复命令处理规则是否可实现。

P0.S-7 不以完成 Enterprise Deferred 项为通过条件。

### 12.2 P0.S-8 冻结清单

P0.S-8 应对以下内容作出明确 Freeze Decision：

1. Desktop Renderer / Main / Worker 的职责与依赖方向。
2. Product API 的 Command、Query、Event 边界。
3. Worker 单写者与数据所有权。
4. Agent Adapter 合同、四个 Adapter 的 V1.0 最小能力和 Reviewer 独立性。
5. Project、Conversation、ContextSelection、Task、AgentRun、Result 标识关系。
6. Project 扫描、文件索引、文档上下文和路径边界。
7. SQLite、文件存储、日志的职责分配与唯一真相规则。
8. 五状态 Task Lifecycle、合法转换、Retry 和失败语义。
9. Project、Chat、Task、Result、History 五页主流程。
10. V1.0～V1.3 版本边界与 Enterprise Deferred 清单。

本计划本身不执行上述冻结。未形成 P0.S-8 Owner Freeze Decision 前，状态保持 `V1_ARCHITECTURE_PLAN_ONLY`。

## 13. V1.0 Architecture Exit Criteria

V1.0 产品架构进入实现前，至少需要确认：

- 八个架构域都有单一 Owner、输入、输出和数据真相定义。
- 用户核心流程中的每一步都能映射到页面、Worker Service、Task 状态和持久结果。
- 四个 Agent Adapter 的最小能力、不可用行为和错误映射明确。
- Reviewer 使用独立 AgentRun，Result 能区分系统失败与 Review 发现。
- SQLite、文件存储和日志之间不存在两个可独立修改的 Task 真相。
- Desktop 断线、重复命令、任务取消、不可恢复中断和 Provider 失败都有明确产品行为。
- V1.1～V1.3 扩展无需推翻 Project、Conversation、Task 和 Adapter 核心标识。
- Enterprise Deferred 项未进入 V1.0 实现依赖或发布 Gate。

## 14. Non-Execution Record

本次仅新增产品架构规划文档，明确未执行：

```text
Code Change = NOT_EXECUTED
Runtime = NOT_EXECUTED
Project Test = NOT_EXECUTED
Database Creation / Migration = NOT_EXECUTED
Project Scan / File Index Build = NOT_EXECUTED
Agent / Provider Call = NOT_EXECUTED
Background Task = NOT_EXECUTED
P0.S-7 Start / Close = NOT_EXECUTED
P0.S-8 Architecture Freeze = NOT_EXECUTED
Enterprise Architecture Design = NOT_EXECUTED
Commit / Push = NOT_EXECUTED
```

## 15. Current V1.0 Implementation Scope Allocation Corrective

Authority:
[V1.0 Harness Reuse Implementation Scope Corrective Decision](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md),
Decision ID `V1-0-HARNESS-REUSE-SCOPE-CORRECTIVE-20260906-01`.

The architecture remains sufficient, but its V1.0 implementation allocation is
corrected to `HARNESS_REUSE_PRODUCTIZATION`. Harness remains authoritative for
Workspace, Session, history/transcript, settings, credentials, Provider/model,
API endpoint/relay configuration, Agent Runtime, tools and permission/approval
runtime. Shaco builds only the Desktop / Supervisor / Carrier / packaging layer
and a minimal Control Store; it does not rebuild those Harness capabilities.

```text
PROVIDER_MODEL_ROUTING = HARNESS_OWNED
SHACO_PROVIDER_FRAMEWORK_V1_0 = NOT_REQUIRED
MULTI_MODEL_SUPPORT = REUSE_HARNESS
MULTI_AGENT_ORCHESTRATION = FUTURE_SHACO_DOMAIN
```

V1.0 retains only future seams: Harness Session IDs are execution/session
references rather than permanent Task/Automation/Workflow identities; one Worker
may host multiple Harness Sessions; the foundation contains no DeepSeek-specific
business fields; the Control Store supports schema version/migration without
future empty tables; and the carrier supports request/session/generation/
correlation identities without introducing another Agent RPC.

The active four-Slice route is:

1. `V1-SLICE-1-REAL-HARNESS-USER-LOOP`.
2. `V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT`.
3. `V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE`.
4. `V1-SLICE-4-FRESH-WINDOWS-FINAL-ACCEPTANCE`.

This synchronization does not start implementation or execute Runtime/tests.
