# P0.S Roadmap Reassessment Decision

| Field | Value |
|---|---|
| Decision ID | `P0S-ROADMAP-REASSESSMENT-20260906-01` |
| Document Type | `PRODUCT_ROADMAP_REASSESSMENT_DECISION_RECORD` |
| Status | `ROADMAP_REASSESSMENT_ONLY` |
| Decision Date | `2026-09-06` |
| Decision Owner Role | Shaco Forge Architecture Owner |
| Decision Scope | 重新定位 P0.S-7、P0.S-8，并建立以 V1 产品可交付闭环为中心的 V1.0～V1.3 与 Enterprise 路线 |
| Execution Authority | `NONE` |

## 0. Decision Summary

本次路线重评作出以下明确决定：

1. **P0.S-7 选择 B：收口为 Controlled Agent Execution Architecture Validation（受控 Agent 执行架构验证）。** 不再继续扩张为 Enterprise Runtime Validation，也不再作为 V1 产品交付的企业级执行安全前置门槛。
2. **P0.S-8 重新定位为 V1 Product Architecture Freeze（V1 产品架构冻结）。** 冻结 Desktop、Worker、Agent Adapter、Session、Project Context、Storage、Task Lifecycle 和 UI 的最小可交付架构；企业级 Runtime Security 不进入本次冻结范围。
3. **V1.0 优先完成单用户、单项目、单任务主路径上的可使用闭环。** V1.1～V1.3 逐步增加多 Agent、Workflow、长任务、恢复、项目记忆、权限与更强 Evidence；Trust Root、Signature、Binding、Windows Sandbox 和 Zero Trust Runtime 统一延期到 Enterprise 路线。

本 Decision 调整的是**未来路线、优先级和阶段 Gate**，不是对既有 P0.S-7 设计结论的否定或关闭。当前状态保持：

```text
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
P0S8_STATE = NOT_STARTED
ROADMAP_REASSESSMENT_ONLY
```

## 1. 当前问题分析

### 1.1 产品目标与技术路线发生偏移

Shaco Forge 当前目标是 AI 辅助软件开发 Agent 平台。核心用户价值是帮助开发者理解项目、分析需求、调用 AI Agent、修改代码、Review，并管理开发过程。它当前不是企业级安全执行沙箱、软件供应链安全平台、Zero Trust Runtime 或通用 Agent OS。

P0.S-7 的探索已经证明 Control Plane、IPC、Evidence First、Fail Closed 和 Exactly Once 等关键架构方向可行。这些成果足以支持后续产品架构设计，但后续计划逐步把 Node Runtime Artifact、Electron Admission、Windows Native Helper、Trust Root、Snapshot Binding、Signature、Fixture Environment 和 Enterprise Execution Controls 聚合成一个大型前置验证阶段。

该扩张使“证明企业级执行可信”开始取代“交付开发者可使用的 Agent 工作闭环”，形成范围与产品目标错位。

### 1.2 当前路线的主要风险

| 风险 | 影响 |
|---|---|
| Enterprise 能力进入 V1 关键路径 | V1 在用户闭环尚未形成前被 Runtime、安全与供应链工程阻塞 |
| 验证深度替代产品完成度 | 架构证据持续增加，但项目创建、Agent Session、任务结果等用户能力仍无法端到端使用 |
| P0.S-8 冻结范围过宽 | 把尚非 V1 必需的 Trust Root、Binding、Signature、Native Sandbox 固化成 V1 架构义务 |
| 交付标准不清晰 | “更多控制”容易被误判为“更接近 V1”，缺少以真实用户任务成功为中心的验收标准 |
| 复杂度提前资本化 | 需要维护多套身份、授权、快照、签名和环境夹具，增加实现、调试和发布成本 |

### 1.3 重评原则

- 以用户可完成真实开发任务为首要 Gate，而不是以 Enterprise Runtime Security 完整度为 Gate。
- 保留已有架构知识和可复用控制原则，但不把所有已设计能力立即产品化。
- V1 采用满足本地开发工具场景的最小安全边界、清晰失败和基础审计；企业级可信执行另行立项。
- 新增能力必须能直接缩短用户闭环、提高任务成功率或提升可恢复性，否则不得进入当前版本关键路径。
- 任何被延期能力如需提前，必须通过新的 Architecture Owner 决策说明用户价值、风险、成本和对 V1 日期的影响。

## 2. P0.S-7 新定位

### 2.1 明确选择

**选择 B：Controlled Agent Execution Architecture Validation。**

P0.S-7 的最终定位是确认受控 Agent 执行所需的架构分层、控制点、消息边界、状态语义和证据原则能够支撑产品实现，而不是完成 Enterprise Runtime Validation。

### 2.2 收口目标

P0.S-7 只负责形成或保留以下架构判断：

- Desktop 与 Worker 的职责边界清晰，UI 不直接拥有 Agent 执行真相。
- Agent 调用通过稳定的 Agent Adapter 边界接入，避免产品层绑定单一供应商协议。
- Control Plane 可以表达启动、进行中、等待用户、完成、失败和取消等任务状态。
- Desktop 与 Worker 之间的 IPC / Carrier 架构可承载命令、事件、流式结果和用户交互。
- Evidence First 作为日志、状态和结果可追溯的设计原则保留。
- Fail Closed 用于缺少必要输入、上下文不一致或危险操作未确认等产品边界，但 V1 不要求企业级密码学信任链。
- Exactly Once 作为任务命令、恢复和结果提交的目标语义保留；具体实现按版本需要逐步落地。

### 2.3 不再承担的目标

以下事项不再属于 P0.S-7 的 V1 阻塞性完成条件：

- 完整 Node Runtime Artifact 供应链验证。
- Electron Admission 的企业级可信准入。
- Windows Native Helper 的可信根与签名体系。
- Trust Root、Snapshot Binding、Owner Signature 和完整签名验证链。
- Enterprise Fixture Environment 与跨环境可信复现。
- Windows Sandbox、Zero Trust Runtime 和通用企业执行控制。

这些事项被延期，不代表其技术价值被否定，也不改变已有设计或审查记录的历史结论。

### 2.4 状态与完成边界

本次重评不启动、执行或关闭 P0.S-7。`P0S7_STATE = NOT_STARTED`、`P0S7_ALLOWED = NO` 保持不变。后续若单独授权 P0.S-7，其交付物应是面向 V1 实现的架构验证结论与约束清单，不以创建 Runtime、冻结 Snapshot、建立 Binding、生成 Signature 或发起 Invocation 为必要条件。

## 3. P0.S-8 新定位

### 3.1 新名称与目标

**P0.S-8：V1 Product Architecture Freeze（V1 产品架构冻结）。**

P0.S-8 的目标是冻结能够直接支持 V1.0 用户闭环并允许 V1.1～V1.3 演进的产品架构。冻结应足够明确，使团队可以进入产品实现；同时避免把 Enterprise 能力提前固化为 V1 依赖。

### 3.2 必须冻结的 V1 架构

| 架构域 | V1 冻结内容 |
|---|---|
| Desktop | 应用壳、导航、窗口生命周期、用户输入与结果呈现职责；不承载 Agent 业务真相 |
| Worker | Agent 调用协调、任务执行、状态推进、事件输出、取消和基础错误处理 |
| Agent Adapter | ChatGPT、Codex、Reviewer 的统一调用接口、能力声明、流式输出、错误映射与最小扩展点 |
| Session | 会话身份、消息顺序、Agent 选择、上下文引用、当前任务关联与终态 |
| Project Context | 项目根目录、文件读取边界、上下文选择、变更摘要和上下文预算策略 |
| Storage | 项目、会话、任务、消息、结果与基础日志的本地持久化模型；明确所有权和迁移边界 |
| Task Lifecycle | `CREATED`、`READY`、`RUNNING`、`WAITING_USER`、`COMPLETED`、`FAILED`、`CANCELED` 等核心状态、合法转换与幂等要求 |
| UI | 项目入口、会话、消息流、任务状态、Agent 输出、变更/Review 结果、错误与基础日志的可见性 |

### 3.3 必须冻结的横切约束

- 单一任务状态真相来源，以及 Desktop 重连后的状态重建方式。
- Agent Adapter 与产品领域模型解耦，不把供应商私有事件直接扩散到 UI 和 Storage。
- 项目文件访问限定在用户明确选择的项目范围内。
- 危险或破坏性代码操作在 V1 使用明确用户确认和可见结果，不依赖企业级信任链。
- 基础日志能够关联 Project、Session、Task、Agent、时间和终态。
- 错误必须可展示、可定位、可重试或明确不可重试，不允许静默失败。
- 架构为多 Agent、长任务、恢复、项目记忆和更强权限模型预留稳定扩展点，但不提前实现这些版本能力。

### 3.4 不进入 P0.S-8 冻结的范围

Enterprise Runtime Security、Trust Root、Signature、Snapshot Binding、Windows Native Sandbox、Zero Trust Runtime、软件供应链证明和企业策略中心均不属于 V1 Product Architecture Freeze。它们可以保留为未来架构附录或扩展接口约束，但不能成为 P0.S-8 通过条件。

P0.S-8 当前仍为 `NOT_STARTED`。本 Decision 不执行 Architecture Freeze，只重新定义未来冻结对象与边界。

## 4. V1.0 Scope — 可使用闭环

### 4.1 版本目标

V1.0 必须让开发者能够从创建/打开项目开始，在一个 Agent Session 中选择并调用 ChatGPT、Codex 或 Reviewer，向 Agent 提供受控项目上下文，观察任务状态，获得可理解结果，并查看基础日志。优先完成可靠的单用户本地闭环。

### 4.2 必须完成

| 能力 | V1.0 最小交付范围 |
|---|---|
| 项目创建 | 选择本地目录，创建 Shaco Forge 项目记录，保存名称、路径和最近访问状态 |
| 项目读取 | 浏览/选择项目文件，读取必要文本内容，处理常见忽略项、不可读文件和路径越界 |
| Agent Session | 新建、继续和结束会话；保持消息顺序、所选 Agent、关联 Project 与 Task |
| Agent 调用 | 通过 Agent Adapter 调用 ChatGPT、Codex、Reviewer；支持基本请求、流式/增量输出、错误映射和取消 |
| Context 管理 | 用户选择上下文、基础自动收集、上下文预览、大小/预算限制、发送内容可见 |
| Task 状态 | 建立最小状态机，展示排队/准备、运行、等待用户、完成、失败和取消状态 |
| 结果展示 | 展示 Agent 文本、代码建议、文件变更摘要、Review 发现、错误和任务终态 |
| 基础日志 | 记录时间、Project、Session、Task、Agent、关键状态、错误和结果引用；支持用户查看 |

### 4.3 V1.0 用户闭环

```text
创建或打开项目
  -> 读取并选择项目上下文
  -> 创建 Agent Session
  -> 选择 ChatGPT / Codex / Reviewer
  -> 提交开发任务
  -> 查看运行状态与必要交互
  -> 获得结果、变更摘要或 Review 结论
  -> 查看基础日志并继续会话
```

### 4.4 V1.0 完成标准

- 至少一条真实开发任务主路径可以从 UI 端到端完成，不需要用户手工拼接内部工具。
- ChatGPT、Codex、Reviewer 均通过统一 Adapter 进入同一 Session / Task 模型；允许能力不同，但差异必须明确展示。
- 项目上下文、任务状态、Agent 输出、错误和终态在 UI 中可见且一致。
- 任务失败不会被呈现为成功；取消后不会继续把迟到结果提交为当前成功结果。
- 应用重开后至少能恢复项目记录与已持久化的会话/任务结果；完整长任务恢复不属于 V1.0。
- 基础日志足以定位一次任务在哪个 Agent、哪个阶段以及因何成功或失败。

### 4.5 V1.0 明确不包含

多 Agent 协同、自动任务拆分、通用 Workflow、无人值守长任务、完整恢复、Project Memory、细粒度企业权限、密码学 Snapshot、Trust Root、Signature、Binding、Native Sandbox 和 Zero Trust Runtime 均不属于 V1.0 Gate。

## 5. V1.1 Scope — 多 Agent 与 Workflow 增强

V1.1 在 V1.0 单 Agent 闭环稳定后，提高复杂任务的组织和交互效率：

- 多 Agent 协作：在同一项目/目标下协调 ChatGPT、Codex、Reviewer 等角色。
- 自动任务拆分：将用户目标拆分为可查看、可调整、可取消的子任务。
- Workflow：提供有限、可理解的顺序、并行、Review 和返工流程，不建设通用 Agent OS。
- 更好的 UI：任务树、Agent 角色、进度、上下文来源、结果对比和失败位置更清晰。
- 聚合状态：父任务从子任务状态推导，并防止重复完成、重复提交或丢失失败。
- 基础人工控制：用户可以批准下一步、修改拆分、暂停或取消 Workflow。

V1.1 不以企业策略引擎、跨组织调度、通用插件市场或 Zero Trust 执行为目标。

## 6. V1.2 Scope — 长任务、历史、恢复与项目记忆

V1.2 重点提高持续使用价值和运行韧性：

- 长任务：支持后台持续执行、明确心跳/进度、超时和用户接管。
- History：按项目查看 Session、Task、Agent 输出、变更与 Review 历史。
- Recovery：应用或 Worker 重启后恢复可恢复任务，明确不可恢复任务的失败原因，并避免重复副作用。
- Project Memory：保存用户确认的项目事实、约定、关键决策和常用上下文；支持查看、修正和删除。
- 上下文续接：基于历史和项目记忆构建可解释的后续上下文，而不是无界回放全部历史。
- 数据演进：为历史、恢复和记忆建立版本化存储及迁移策略。

V1.2 的 Exactly Once 重点用于恢复时的命令、状态和结果提交语义；不要求先建立企业级 Snapshot Binding 或密码学执行证明。

## 7. V1.3 Scope — 权限、Snapshot、Evidence 与企业准备

V1.3 在产品闭环和恢复模型稳定后，增加面向团队/企业演进的基础能力：

- 权限：项目文件、命令、网络和敏感操作的可配置权限与明确确认体验。
- Snapshot：为任务输入、选定上下文、关键文件状态和结果建立产品级快照；首先服务可复现、Review 和恢复。
- 更强 Evidence：结构化记录授权、上下文来源、工具动作、结果、失败和恢复关联。
- 审计导出：允许导出与单个 Project / Session / Task 相关的证据摘要。
- 策略扩展点：为未来组织策略、可信身份和受控 Runtime 接入定义稳定接口。
- 企业能力准备：评估部署、身份、数据保留和安全执行需求，形成 Enterprise 阶段输入与成本判断。

V1.3 的 Snapshot 和 Evidence 是产品级能力，不自动等同于密码学签名快照、Trust Root 或 Zero Trust Runtime；后者仍需 Enterprise 独立设计与验收。

## 8. Enterprise Deferred Scope

以下能力整体延期到 Enterprise 路线，不阻塞 V1.0～V1.3：

- 独立 Trust Root 及其生命周期、轮换、吊销和组织治理。
- Owner / Organization Signature 以及完整签名验证链。
- Runtime Artifact、Snapshot、批准主体与 Invocation 的密码学 Binding。
- Windows Sandbox、原生隔离 Helper、强进程/文件系统/网络隔离。
- Zero Trust Runtime 与每次执行的持续验证。
- 软件供应链身份、来源证明、制品签名、SBOM/证明链和企业准入。
- Enterprise Fixture Environment、跨环境可信复现和合规测试矩阵。
- 集中策略、组织身份、租户隔离、审计保留、合规导出与安全运营集成。
- 通用 Agent OS 所需的跨组织调度、任意 Agent/工具托管和统一可信执行底座。

Enterprise 能力未来有价值，但必须在 V1 用户闭环、市场需求和部署模型得到验证后独立立项；不得通过 P0.S-7 或 P0.S-8 的名称重新进入 V1 隐性 Gate。

## 9. 旧设计哪些保留

| 保留项 | 保留方式与 V1 用途 |
|---|---|
| Desktop + Worker 分层 | 作为 V1 核心进程/职责边界，支持 UI 与任务执行解耦 |
| Control Plane | 用于任务状态、取消、用户交互、错误和生命周期控制 |
| IPC / Carrier 架构 | 用于 Desktop 与 Worker 的命令、事件、流式结果及重连语义 |
| Agent Adapter 思路 | 统一 ChatGPT、Codex、Reviewer 的产品接入边界 |
| Session / Project Context 模型 | 作为用户任务连续性和上下文可见性的基础 |
| Evidence First | 降级为所有版本通用的可观测、可追溯原则；从基础日志逐步增强 |
| Fail Closed | 保留为输入缺失、越界访问、危险操作未确认、状态不一致时的默认行为 |
| Exactly Once | 保留为任务命令、状态转换、取消、恢复和结果提交的目标语义 |
| Snapshot 设计知识 | 作为 V1.3 产品级 Snapshot 和 Enterprise 密码学 Snapshot 的后续输入 |
| Trust / Binding / Signature 设计成果 | 作为 Enterprise 设计资产保留，不删除、不否定、不作为当前 V1 Gate |
| 历史 Evidence 与审查记录 | 保持原始事实、状态和出处，不因路线重评被改写或宣布完成 |
| 清晰身份、单向依赖与不可静默成功原则 | 用于避免循环身份、重复执行、错误归类和不可解释结果 |

## 10. 旧设计哪些延期

| 延期项 | 新归属 | 延期原因 |
|---|---|---|
| Node Runtime Artifact 完整可信验证 | Enterprise | 超出 V1 用户闭环的最小需要，实施和维护成本高 |
| Electron Admission 企业级准入 | Enterprise | V1 优先保证可用边界与基础安全，不建设完整可信准入链 |
| Windows Native Helper 信任体系 | Enterprise | 与 Native Sandbox、签名和供应链信任强耦合 |
| Trust Root | Enterprise | 需要组织身份、密钥生命周期和治理模型 |
| Snapshot Binding | Enterprise | 密码学绑定不应阻塞产品级上下文快照与恢复 |
| Signature | Enterprise | 需要明确签名主体、验证方、轮换、吊销与合规需求 |
| Invocation 可信绑定与预算证明 | Enterprise | V1 仅实现任务身份、幂等和基础审计即可支持闭环 |
| Fixture Environment | Enterprise | 跨环境可信复现应在部署与合规需求明确后建设 |
| Enterprise Execution Controls | Enterprise | 当前产品尚不以高保障多租户执行平台为目标 |
| Windows Sandbox / Native Sandbox | Enterprise | 系统级隔离不作为本地开发者 V1 的发布前提 |
| Zero Trust Runtime | Enterprise | 属于独立安全产品级能力，不属于 V1 增量功能 |
| 通用 Agent OS 能力 | 不在当前路线；未来另行决策 | 会扩大调度、插件、权限和运行时边界，偏离当前核心用户价值 |

“延期”表示从 V1 关键路径和 P0.S-8 Freeze Gate 中移除，并非删除相关文档、撤销既有验证或断言这些能力永远不做。

## 11. 路线 Gate 与优先级规则

| 阶段 | 进入/完成焦点 | 不得作为阻塞项 |
|---|---|---|
| P0.S-7 | 受控 Agent 执行架构边界与原则清晰，可作为 V1 实现输入 | Enterprise Runtime Validation 的完整实现 |
| P0.S-8 | V1 产品架构八个域及横切约束完成冻结 | Trust Root、Signature、Binding、Native Sandbox |
| V1.0 | 单用户真实开发任务闭环可用、状态一致、错误可见、基础日志可查 | 多 Agent、长任务、完整恢复、企业安全链 |
| V1.1 | 多 Agent、任务拆分、有限 Workflow 与 UI 增强 | 通用 Agent OS、企业调度平台 |
| V1.2 | 长任务、History、Recovery、Project Memory 可用 | 密码学执行证明、Zero Trust Runtime |
| V1.3 | 产品级权限、Snapshot、Evidence 与企业扩展点 | 完整 Enterprise 安全实现 |
| Enterprise | 基于明确客户与部署需求独立定义安全、信任和合规 Gate | 不得反向改写已交付 V1 的产品目标 |

若一个需求不能证明其为当前版本用户闭环、可靠性或已承诺演进所必需，则默认进入后续版本候选，而不是加入当前 Gate。

## 12. Governance Boundary and Non-Execution Record

本 Decision 仅记录路线重评，不授权任何实现或执行。它与既有 P0.S-7 文档的关系如下：

- 不关闭、不撤销、不覆盖已有 P0.S-7 结论。
- 不把已完成的设计、准备、Control Plane 或 IPC 工作重新表述为 Runtime Execution。
- 不把 Evidence First、Fail Closed 或 Exactly Once 的架构可行性重新表述为生产完成。
- 不修改 P0.S-7 的当前阶段状态与授权状态。
- 当旧路线文件把 Enterprise Runtime Security 列为 V1/P0.S-8 必须 Gate 时，以本 Decision 的“延期到 Enterprise”优先级决定作为后续规划依据；历史文字和历史事实继续保留。

本次明确未执行：

```text
Code Change = NOT_EXECUTED
Runtime = NOT_EXECUTED
Test = NOT_EXECUTED
Snapshot Freeze = NOT_EXECUTED
Binding = NOT_EXECUTED
Signature = NOT_EXECUTED
Invocation = NOT_EXECUTED
P0.S-7 Start / Close = NOT_EXECUTED
P0.S-8 Architecture Freeze = NOT_EXECUTED
Commit / Push = NOT_EXECUTED
```

