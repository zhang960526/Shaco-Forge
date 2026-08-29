# Shaco Forge Product Vision

Status: DRAFT-FROZEN-BASELINE

## Vision

Shaco Forge 是一个基于 DeepSeek Harness Agent Runtime 构建、但拥有自己独立产品生命周期、桌面体验、控制平面和后续自动化/多 Agent 域的 Windows Desktop Agent 产品。

目标不是简单套壳 `dsh web`，也不是重新发明 Harness Agent Loop，而是把 Harness 的 Agent Runtime 能力产品化为：

- 可长期运行的本地 Worker
- 可关闭/重连的 Desktop Client
- 可维护、可升级、可审计的产品边界
- 为后续 Automation Agent 与 Multi-Model Review 提供稳定宿主

## Long-Term Principles

- Worker Authority：运行时真实状态属于 Worker / Harness，不属于 UI。
- Desktop Projection：Desktop 展示与控制，不创造运行时真相。
- Pinned Upstream：Harness Developer Preview 风险通过 exact baseline pin、adapter/carrier 隔离、兼容性 Gate 管理。
- Product-Owned Domain：Shaco Automation / Multi-Agent 产品状态由 Shaco 定义，不拿 Harness Session/Goal/Jobs/Schedule 冒充产品业务域。
- Fail Closed：版本/身份/数据格式不兼容时拒绝写入。
- Evidence First：阶段完成必须有审计与证据。

## Product Evolution

### 1.0 — Desktop Baseline

把 Harness 当前适合产品化的核心 Agent 能力迁移为 Windows Desktop + Worker 产品。

### 1.1 — Automation Agent

增加 Goal→Plan→Task→Step→Attempt 的 Shaco-owned durable Automation Runtime、Scheduler/Trigger、Retry/Timeout、Pause/Resume、Approval 与 Crash Recovery。

### 1.2 — Multi-Model Deliberation & Review

增加 Planner / Executor / Reviewer / Corrective / Synthesizer / Critic / Council，允许 Worker 编排 DeepSeek、Codex、Claude、ACP/SDK 等 capability children。

### 1.3 — Experience / Memory / Feedback

候选方向：跨任务经验、反馈沉淀、可控长期记忆与学习闭环。尚未冻结。
