# P0.S Roadmap Reconciliation Decision

| Field | Value |
|---|---|
| Decision ID | `P0S-ROADMAP-RECONCILIATION-20260905-01` |
| Document Type | `GOVERNANCE_PLANNING_DECISION_RECORD` |
| Status | `PLANNING_ONLY` |
| Decision Date | `2026-09-05` |
| Decision Scope | 记录 P0.S-6 完成后对未来 P0.S-7 / P0.S-8 目标的规划调整及边界 |
| Decision Basis | 用户本次规划记录指令、既有最终关闭记录与已调整的规划文档 |

## 1. Background

原 P0.S 目标为 **Feasibility Spike**：通过 Desktop、Connection 和 Packaging 的可行性探索，为后续架构与开发合同提供证据。

P0.S-6 的实际验证范围在处理 `env-paths@2.2.1` integrity mismatch 的过程中扩展。除 registry metadata、tarball identity 和 corrected candidate 派生外，执行过程还暴露并处理了 Git SHA self-reference、Manifest self trust、缺少具体 Trust Root、Snapshot Binding 及签名载荷与实际执行入口一致性等问题。因此，后续规划需要同时覆盖 Runtime 可行性和受控执行条件。

已确认的 P0.S-6 最终结果为：

| Field | Confirmed State |
|---|---|
| P0.S-6 State | `CLOSED` |
| P0.S-6 Result | `VERIFIED_WITH_CANDIDATE` |
| Invocation | `P0S6-TVEC-INVOCATION-20260904-01` |
| Verification / Classification | `PASS` / `PASS` |
| Candidate | `generated_not_applied` |
| Source / DRRC Lockfile | `UNCHANGED` / `UNCHANGED` |
| Runtime | `NOT_ENTERED` |

该结果提供了执行治理经验与有界验证证据，不代表 packaged Runtime 或后续 Agent Execution 实现已经完成。依据见 [P0.S-6 Final Closure Decision](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md)、[Execution Journey Log](P0S-6-EXECUTION-JOURNEY-LOG.md) 和 [Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md)。

## 2. P0.S-6 Impact

P0.S-6 引入的 **Trust Model、Execution Snapshot、Binding Model、Evidence Model**，将成为后续 Runtime 和 Agent Execution 的基础约束。

| 引入的模型 | 核心事实与后续规划约束 |
|---|---|
| Trust Model | 通过 **Authority Anchor** 确认治理历史关系，通过独立批准的 **Trust Root** 和 **Owner Signature** 认证执行批准来源；Git SHA self-reference 不能作为稳定冻结模型，Manifest 不能作为唯一信任根 |
| Execution Snapshot | 用精确路径、字节与内容哈希描述获准参与执行的工件集合；在 **Final Preflight** 中核对实际执行目标，不能只依赖文件自声明或动态 HEAD |
| Binding Model | 通过 **Snapshot Binding** 绑定 Snapshot 与选定的批准身份；签名、Payload、Reference、组件身份和实际入口必须一致，后生成摘要不得循环回填至上游工件 |
| Evidence Model | 在 **Controlled Invocation** 之前定义证据要求，按 **Evidence First** 原则记录启动条件、到达边界、失败与终态，并完成 Evidence Finalization；未授权、未到达和失败操作不得表述为成功 |

**Fail Closed Execution** 是上述模型共同的执行边界：Authority、Snapshot、Trust Root 或 Preflight 缺失、不匹配或不明确时，后续 Runtime 不得启动。已有技术 PASS、有效签名或 Manifest 自洽，均不能自动扩大执行权限。

这些规则继承执行治理模型；P0.S-6 已消耗的 Invocation、预算、签名及 Snapshot 批准不能自动转移为 P0.S-7 的启动授权。后续 Runtime 和 Agent Execution 仍需明确自身的批准对象、执行范围、身份和证据要求。

## 3. P0.S-7 Adjustment

**旧目标：** Packaged Runtime Feasibility。

**调整为：** **Packaged Runtime Feasibility & Controlled Execution Validation**。

调整原因：能否打包和启动只是可行性的一部分；后续还需证明实际启动的是获准的 package，执行处于明确边界内，并在成功、失败及获准恢复时形成可追溯证据。

新增的未来验证目标为：

| 目标 | 规划要求 |
|---|---|
| Package Identity | 明确 Runtime package、组件、版本、平台与入口身份，并检查与冻结基线的版本一致性 |
| Package Integrity | 比较实际 package / 组件字节与获准 Snapshot、Binding 和完整性身份 |
| Startup Authorization | 为后续阶段建立独立的启动授权、范围、预算和条件，在 Runtime launch boundary 前完成 Final Preflight |
| Execution Boundary | 明确可执行文件、参数、环境、文件系统、网络、子进程及生命周期边界；不得绕过 Authority、Snapshot、Trust Root 或 Preflight |
| Runtime Evidence | 规划 Runtime evidence generation、failure evidence 和 recovery evidence，关联 package / Snapshot / Invocation 身份并记录真实终态 |
| Failure Recovery | 定义失败处理与恢复授权，记录失败边界、恢复前后身份和恢复结果；未获准或未到达的恢复必须明确记录，不能隐式 retry 或复用已消耗 Invocation |

原有 fresh Windows、无全局 Node / pnpm、packaged Worker / Harness、native dependency、路径与 runtime strategy 可行性要求继续保留。上述目标均为计划中的验收要求；本 Decision 不创建 package，不运行 Runtime，也不生成新的运行证据。

对应规划为 [P0.S Feasibility Spike](../03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md) 与 [V1.0 Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md) 中已调整的 P0.S-7 定义。本记录只解释调整依据，不再次修改这些文件。

## 4. P0.S-8 Adjustment

**旧目标：** Spike Closure。

**调整为：** **P0 Baseline Closure & Architecture Freeze**。

调整原因：后续收口需要将可行性结论、执行治理模型、约束与证据整合为可供开发使用的基线，而不只是汇总各次 Spike 的结果。

未来拟冻结的范围为：

| 基线 | 拟冻结内容 |
|---|---|
| Client Architecture | Client / Projection / Native Shell 职责、Renderer 隔离、Client-to-Host 合同与已接受约束 |
| Runtime Architecture | Runtime package 与版本、Node / Worker / Harness 策略、受控启动、进程所有权、持久化及恢复边界 |
| Plugin Model | 必需模块、支持的插件范围、静态包含与动态加载决策、兼容性及省略约束 |
| Agent Execution Model | Authority Anchor、Execution Snapshot、Trust Root、Snapshot Binding、Owner Signature、Final Preflight、Controlled Invocation 与失败恢复授权 |
| Evidence Model | Runtime、失败、恢复证据的身份、来源、关联、终态分类、保留与 Evidence Finalization 规则 |
| Security Boundary | 信任根所有权、授权执行、当前用户隔离、文件系统 / 网络 / 进程权限与 Fail Closed Execution |
| Development Baseline | 已批准架构及证据引用、版本与兼容性假设、约束、core patch inventory、fallback 和后续开发合同输入 |

未来冻结需结合实际证据、hypothesis disposition、constraint、production impact、required P1 contract、fallback 和 core patch requirement，经适用审查与 Owner 批准形成结论。尚未证明的事项继续保留其真实状态，不能因规划调整被标记为完成。

本 Decision 不冻结上述基线，不重新打开已完成的 P0 或历史 P0.S 阶段；现有 P0.S Hard Gate、P0.5 compatibility freeze 与 P1 detailed contract freeze 的边界保持不变。

## 5. Boundary

本 Decision 是治理规划记录，**不启动 P0.S-7，不代表任何后续实现完成**。

保持以下状态：

```text
P0.S-6 = CLOSED
P0.S-6 Result = VERIFIED_WITH_CANDIDATE
P0.S-7 = NOT_STARTED
P0.S-8 = NOT_STARTED
P0S7_ALLOWED = NO
```

P0.S-7 继续为 `NOT_STARTED / NOT_AUTHORIZED`。P0.S-8 的 Architecture Freeze 仍是未来目标，未因本记录而完成或获准执行。P0.S-1～P0.S-6 历史状态、治理结论、执行证据及关闭记录保持不变；当前 P0.S-6 状态以 [Current State 的 Latest Final State](../00-governance/SHACO-FORGE-CURRENT-STATE.md#p0s-6-technical-validation-extension-final-closure-state-2026-09-05) 和既有关闭决定为依据。

本次仅新增本 Decision，保留已有两份规划文档的工作区修改。文档核对限于必需内容、引用、UTF-8 编码、疑似乱码、SHA-256 和修改前后文件状态，不执行项目测试或技术验证。

本次未修改代码、Runner、Manifest、Binding、Candidate 或 lockfile；未应用 Candidate，未开始 P0.S-7，未创建 Runtime，未启动 Invocation，未执行测试；未 commit，未 push。
