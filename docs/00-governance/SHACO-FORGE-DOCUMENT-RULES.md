# Shaco Forge Documentation Rules

Status: ACTIVE

## 1. Core Rule

Shaco Forge 的关键设计、阶段状态、审计、Bug 修复和架构变更不得只存在于聊天上下文。

## 2. Before Starting Any Step

至少读取：

1. Document Map
2. Current State
3. V1.0 Development Map
4. 当前 Phase Contract
5. 直接相关 ADR / Review / Bug / Lessons

禁止一次性把全部 docs 当上下文灌入模型；按 Document Map 和当前 Step 最小读取。

## 3. Required Updates

### Step Start

更新：

- `SHACO-FORGE-CURRENT-STATE.md`
- `DEVELOPMENT-LOG.md`

### Step Pass / Close

更新：

- 当前 Phase Contract 状态
- Development Map
- Current State
- Development Log
- 必要 Evidence / Review Index

### Significant Bug / Incident

必须创建 `BUG-XXXX-*.md`，至少记录：症状、期望、实际、影响、Root Cause、每次尝试、最终修复、回归测试、架构影响、状态。

### Architecture Change

必须创建 ADR；不得只修改代码或 Phase 文档而不解释为什么改变设计。

### Review

Review 原文/摘要进入 `05-reviews/`；Review 只能提供证据和结论，是否接受由 Architecture Owner / 当前权威 Contract 决定。

### Phase Close

必须有：

- Gate 全部 PASS
- Review 结果
- Evidence
- Current State 更新
- Development Map 更新
- 下一阶段 Preconditions

## 4. Status Vocabulary

推荐：

- `NOT_STARTED`
- `PLANNING`
- `READY_FOR_EXECUTION`
- `IN_PROGRESS`
- `BLOCKED`
- `PASS`
- `PASS_WITH_REQUIRED_CORRECTIONS`
- `FAIL`
- `CLOSED`
- `SUPERSEDED`

禁止把计划项写成已完成事实。

## 5. Audit / Evidence Rule

“AI 说完成”不是 Evidence。

Evidence 应尽可能包含：

- exact commit / version
- command / test identity
- test result
- file/contract identity
- fresh environment result
- failure reproduction / regression result

## 6. Spike Rule

Spike 代码默认 `NOT_PRODUCTION`。

Spike 留下的是：

- Evidence
- Feasibility verdict
- Constraints
- Failure branch
- Required P1 Contract

Spike 原型不得未经重新审查直接演化为生产实现。

## 7. Bug Attempt Rule

一个 Bug 如果经历多次尝试，必须分别记录：

- Attempt N 做了什么
- 为什么失败/不足
- 新证据是什么
- 最终 Fix 为什么不同

禁止只保留最终 patch 而丢失失败路径。

## 8. Sensitive Data

文档、日志、support bundle、review evidence 默认不得记录：

- API Key
- Token
- Credential
- Secret
- 私密用户数据

如需要说明，只记录脱敏身份或存在性。
