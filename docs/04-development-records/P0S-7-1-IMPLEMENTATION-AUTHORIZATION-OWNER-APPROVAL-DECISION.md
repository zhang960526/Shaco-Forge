# P0.S-7-1 Implementation Authorization Owner Approval Decision

## 1. Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S7-1-IMPLEMENTATION-AUTHORIZATION-OA-20260905-01` |
| Document Type | `OWNER_APPROVAL_DECISION_RECORD` |
| Status | `OWNER_APPROVED_AND_FROZEN` |
| Decision Date | `2026-09-05` |
| Decision Executor Role | Shaco Forge P0.S-7-1 Implementation Authorization Owner Approval Decision Executor |
| Approval Authority | 本次用户明确给出的 Owner 批准指令 |
| Approved Subject | `P0.S-7-1 Runtime Controlled Execution Spike` |
| Approved Authorization Decision ID | `P0S7-1-IMPLEMENTATION-AUTHORIZATION-20260905-01` |
| Approved Design Contract ID | `P0S7-1-DETAILED-DESIGN-CONTRACT-20260905-01` |
| Implementation | `AUTHORIZED_AFTER_APPROVAL` |
| Execution Budget Scope | 仅限 `P0.S-7-1 Spike` |
| Current Deliverable | 仅本 Owner Approval 治理批准记录 |

依据本次用户明确批准，记录对 P0.S-7-1 Runtime Controlled Execution Spike 实现范围的 **Owner Approval**，状态为 **OWNER_APPROVED_AND_FROZEN**。该批准仅允许进入下一治理步骤，不自动启动 Runtime，不创建 Package 或 Invocation。本次不执行实现、测试或 Verification。

本文记录真实收到的批准指令，不代替 Owner 生成密码学签名，不虚构批准人姓名、密钥身份、Review 工件或执行证据。`OWNER_APPROVED_AND_FROZEN` 表示本治理决定内容已批准并冻结；不表示 Runtime 工件已冻结、Startup Activation 已生效、代码已实现或已经 commit。

## 2. Approval Basis and Exact Input Identity

| Current State / Review | Value | 依据与处置 |
|---|---|---|
| P0.S-6 State | `CLOSED` | 本次用户输入及已有最终状态；保持关闭 |
| P0.S-6 Result | `VERIFIED_WITH_CANDIDATE` | 本次用户输入及已有最终状态；不改变结论 |
| P0.S-7 State | `NOT_STARTED` | 本次用户输入；本文不启动阶段 |
| P0S7_ALLOWED | `NO` | 本次用户输入；本文不开放执行 |
| P0.S-7-1 Detailed Design | `FINALIZED` | 本次用户提供的当前治理进度 |
| P0.S-7-1 Design Review | `PASS` | 本次用户提供的已完成审查结论 |
| P0.S-7-1 Implementation Authorization Review | `PASS` | 本次用户提供的已完成审查结论 |

本批准明确选中以下工作区文件的精确字节身份。SHA-256 是本次只读计算所得，不以 HEAD 中的旧字节替代工作区版本。

| Approved Input | Bytes | SHA-256 |
|---|---:|---|
| [Implementation Authorization Decision](P0S-7-1-IMPLEMENTATION-AUTHORIZATION-DECISION.md) | 26612 | `A3640948B83E1F63B5B3FFB7B19DB53ED4BAB4BD3BE257432718460B1B2A7480` |
| [Detailed Design Contract](P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | 86292 | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |

边界依据为 [P0.S-6 Technical Validation Extension Final Closure](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md)（8456 bytes；SHA-256 `700020985AFC734F8ECD5C229AEE4EFC489C42A930A60611471D9FE4E755C969`）及 [Current State 最终关闭段](../00-governance/SHACO-FORGE-CURRENT-STATE.md#p0s-6-technical-validation-extension-final-closure-state-2026-09-05)（文件 31321 bytes；SHA-256 `6A7EC91606362EF16409AF8F5E76E5CEF04DD8C6E594AAE3DDDF24117E486F17`）。既有 Candidate 保持 `generated_not_applied`，Source / DRRC lockfile 不变。

源设计合同中的 `DESIGN_ONLY`、授权决策中的 `OWNER_REVIEW_REQUIRED / NOT_PROVIDED` 等字段保留各自生成时的状态。本记录承接本次输入的 Detailed Design `FINALIZED`、两项 Review `PASS` 和 Owner Approval，不回写源文档、不重编码，也不伪造独立审查文件或重新执行审查。

批准只适用于上述精确版本及本文范围。任何输入字节、范围或预算变更都不能自动继承本批准，须形成适用的新治理决定。本文自身 SHA-256 在最终交付时单独返回，不回填到自身形成循环身份。

## 3. Approved Scope

**批准：P0.S-7-1 Runtime Controlled Execution Spike。** 批准范围如下，沿用授权决策的工作边界和设计合同的模型、证据及验收义务：

| Approved Work | 批准的内容与边界 |
|---|---|
| Runtime Spike Skeleton | 最小受控执行 Spike 骨架的实现范围；具体输出路径和允许改动清单由下一治理步骤明确，本次不创建骨架 |
| Package Feasibility Validation | Package 可行性验证工件及 Package Identity / Integrity 验证范围；实际准备、构建、解包和运行须具备各自明确的输入、权限与预算 |
| Runtime Identity Validation | Definition、Snapshot、Instance、Invocation 身份及关联验证；运行事实必须来自后续获准执行，不能预填 PID 或实际实例状态 |
| Snapshot Flow Validation | Authority、冻结输入、独立 Reference、Snapshot、Owner Signature、实际 Binding 入口和 Preflight 的单向身份链验证 |
| Controlled Launch Validation | 在完整授权链、冻结输入、有效 Preflight 与明确执行预算下验证受控启动；范围批准不代替具体 Startup Activation |
| Evidence Generation | 按合同生成 Startup、Runtime、Failure、Recovery Evidence 及 Validation Records；仅记录真实达到的边界和可证明的结果 |

**不批准：** Production Runtime、Full Agent Platform、P1 Implementation。本文也不激活 P0.S-7-2 / P0.S-7-3、P0.S-8 或其他阶段，不把 Spike 可行性扩大为生产就绪或全局 P0.S PASS。

`Implementation = AUTHORIZED_AFTER_APPROVAL` 是上述实现范围的批准状态。该状态允许进入下一治理步骤，明确实施输入、隔离输出位置、允许改动清单及适用生效记录；不将 `P0S7_ALLOWED` 改为 YES，不立即开展本次禁止的代码或工件工作，也不消费执行预算。

## 4. Inherited Execution Constraints

必须完整保持以下顺序，禁止绕过或事后补认前置授权：

```text
Authority
    ↓
Snapshot
    ↓
Binding
    ↓
Preflight
    ↓
Invocation
```

- **Authority / Trust Root：** 沿用 Authority Anchor、独立 Trust Root、经认证的验证器、独立选定的批准及 expected Reference、Owner Signature 和用途约束。P0.S-6 历史 PASS、已用预算或签名不迁移为 P0.S-7 启动权限；本治理记录不配置上述信任实物。
- **Snapshot / Binding：** 精确字节认证、单向冻结、实际读取入口和批准对象必须一致；Manifest 内部自洽不能自证信任。冻结输入与 Runtime Facts 分离，实际 PID、时间、预算消费和结果不得回填 Snapshot、Binding 或已冻结输入。
- **Preflight / Controlled Invocation：** 遵守设计合同 L0～L5，核对权限、Package/依赖完整性、真实入口、环境、租约与剩余预算；slot 在 spawn 前原子持久消费。失败不退还已消费 slot，不得复用或换 ID 自动重启。
- **Evidence First：** 在任何 Package 代码或提取工具执行前，建立认证采集来源、受保护证据流与持久预算 ledger。准备/解包与 Runtime Launch 分别批准、分别预算，禁止 silent unpack。
- **Fail Closed Execution：** 任一授权、身份、完整性、权限、预算或证据条件不成立，即停止受影响链路；不能自动安装修复、降低 Gate、切换策略或回退到全局 Node/pnpm。

继续继承授权决策中的禁止事项：不改写 P0.S-6 关闭结论，不生成或应用未经授权的 Candidate，不修改 Source / DRRC lockfile，不引入或执行第三方 Plugin，不自动更新，不隐式 Retry/Restart/Resume，不发起未授权 Invocation 或业务重放。

## 5. Budget Decision

| Budget Field | Decision | 说明 |
|---|---|---|
| Implementation | `AUTHORIZED_AFTER_APPROVAL` | 本文批准第 3 节实现范围，仅允许进入下一治理步骤 |
| Execution Budget Scope | 仅限 `P0.S-7-1 Spike` | 是预算用途边界，不是具体执行次数或即时启动权限 |
| Concrete Invocation Allocation | `NOT_AUTHORIZED` | 本次未指定具体 case、Invocation 数量、各 kind 额度及有效时窗；不默认授予一次执行 |
| Current Usable Invocation Budget | `0` | 不从设计上限或 P0.S-6 已消耗预算推导可用额度 |
| Production | `NOT_AUTHORIZED` | 不批准生产运行或生产预算 |
| Runtime Deployment | `NOT_AUTHORIZED` | 不批准部署或发布 Runtime |
| Additional Invocation | `NOT_AUTHORIZED` | 不批准额外 Invocation、换 ID 重试或自动增加尝试次数 |
| Retry Expansion | `NOT_AUTHORIZED` | 不批准扩大 Retry；隐式 Retry 始终禁止 |
| Resume / Recovery | `NOT_AUTHORIZED`，当前可用数量 `0` | 实际对账、attach、stop 或恢复须独立具体批准；不转授业务 resume |
| Candidate Generation / Application | `NOT_AUTHORIZED`，当前可用数量 `0` | 保留既有 `generated_not_applied` 处置，应用 Candidate 继续在本范围外 |

准备、构建、解包、Validation Request、Driver 会话、Runtime/子进程启动、网络请求、控制和恢复不能作为实现批准的隐含附带动作。未明确提供的执行额度保持 `NOT_AUTHORIZED`；本次不选取或激活设计合同中的任何场景。

后续治理记录必须明确有限 case 集、精确输入和工具/fixture 身份、执行 kind、请求/进程/时间/资源上限、总预算、证据根以及停止和收口范围。独立批准与 Frozen Invocation Plan 必须匹配，缺失、不一致、耗尽或无法对账时均拒绝执行。**禁止自动扩大预算**，工具默认重试、健康检查、Desktop 重开或更换 Invocation 名称均不能重置计数。

## 6. Approved Stop Conditions

批准以下失败必须 **FAIL-CLOSED**；本表是未来执行必须落实的治理约束，本次不触发故障场景：

| Stop Condition | 必须采取的处置 |
|---|---|
| Identity mismatch | Package、Runtime、Plan、工具或实际实例身份与批准对象不一致时，停止进入下一边界或继续控制 |
| Snapshot mismatch | expected Reference、payload bytes、状态、类型或输入链不一致时，拒绝执行；不自动换用另一个 Snapshot |
| Package integrity failure | archive/payload/hash、依赖闭包、native/ABI/入口缺失、损坏或出现额外执行输入时，拒绝加载和启动 |
| Boundary violation | 绕 Gate、权限/路径/环境/网络/子进程越界、未批准 Plugin、隐式 Retry/Resume 或业务重放时，阻断新动作 |
| Evidence incomplete | identity、source、timestamp、lifecycle state 缺失，来源不可认证、证据流不可持久化或存在无法解释的缺口时，不能继续业务或形成成功结论 |
| Unauthorized execution | 缺少匹配的具体授权/Startup Activation、预算未授权或耗尽、批准失效、Invocation/slot 复用，或超出 P0.S-7-1 范围时，拒绝执行 |

授权决策与设计合同中更完整的 stop 条件继续有效，包括 Trust Root/Signature/Binding 失败、READY timeout、进程/collector crash、租约或预算账本异常及未知残留。

启动前失败不得运行 Package 代码或创建 Worker；记录首失败及下游 `NOT_REACHED`。启动后失败必须阻断新业务，只执行事先批准的停止、隔离和证据收口；保持已消费预算，不自动重试、恢复或创建替代实例。无法证明退出或证据完整时保留 `OUTCOME_UNKNOWN / EVIDENCE_INCOMPLETE`，后续显式对账需要新的具体批准。

## 7. Evidence and Acceptance Obligations

批准继续执行授权决策第 6、8 节及设计合同第 7、9 节规定的证据和验收义务。未来获准验证必须覆盖 Startup Evidence、Runtime Evidence、Failure Evidence、Recovery Evidence，每条包含 **identity、source、timestamp、lifecycle state**，并保留原始来源、artifact 身份、因果关联、预算和真实达到的边界。

验收继续覆盖 fresh Windows、no global Node/pnpm、Package Identity / Integrity、Runtime Identity、Snapshot / Binding、Startup Authorization、Controlled Launch、Controlled Preparation、Failure Handling、Explicit Recovery 和 Evidence Completeness。未执行、未到达或未获恢复权限必须明确记录，不虚构 PASS、Runtime READY 或恢复成功；正确拒绝负例不能替代实际启动/恢复的正例证据。

本次未生成上述执行证据或运行验收结论；两项 Review `PASS` 均为用户提供的既有治理状态。H-05/H-20 等未证明项及其他阶段边界保持原有处置，不因本次批准被标为已证明。

## 8. Boundary and Next Governance Step

**该批准仅允许进入下一治理步骤，不自动启动 Runtime。** 下一治理步骤应在本文批准范围内明确具体实施输入、输出路径、改动清单、执行场景和预算，并落实独立信任、精确冻结、Startup Activation 及适用生效记录。该步骤没有在本次执行；缺少适用前置条件时不得开展对应动作。

本记录不替代 Execution Snapshot、Trust Root 选择、Owner Signature、Snapshot Binding、Final Preflight 或具体 Invocation 授权。后续生效和状态变化由相应治理记录明确表达，不能仅凭本文件标题或 `OWNER_APPROVED_AND_FROZEN` 字段自动触发执行。

```text
OWNER_APPROVAL_DECISION_STATUS = OWNER_APPROVED_AND_FROZEN
P0S7_1_DETAILED_DESIGN = FINALIZED
P0S7_1_DESIGN_REVIEW = PASS
P0S7_1_IMPLEMENTATION_AUTHORIZATION_REVIEW = PASS
IMPLEMENTATION = AUTHORIZED_AFTER_APPROVAL
EXECUTION_BUDGET_SCOPE = P0.S-7-1 Spike ONLY
CONCRETE_INVOCATION_ALLOCATION = NOT_AUTHORIZED
CURRENT_USABLE_INVOCATION_BUDGET = 0
STARTUP_ACTIVATION = NOT_AUTHORIZED
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S6_CANDIDATE = generated_not_applied
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
RUNTIME_EXECUTED_BY_THIS_APPROVAL = NO
```

## 9. Deliverable, Document Checks and Unexecuted Actions

本次只新增 `docs/04-development-records/P0S-7-1-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-DECISION.md`，使用 **UTF-8 without BOM、LF**，记录 Owner 批准、精确输入身份、六项批准范围、预算边界、继承门禁、FAIL-CLOSED 条件及未启动状态。既有文档与工作区修改保持原状。

静态文档检查仅包括严格 UTF-8 解码、BOM/换行与疑似乱码检查、必需字段/状态/引用检查、文件 SHA-256、已有文件身份及 `git status --short` 前后比较。这些只读文档检查不是测试、Verification、Final Preflight 或运行验证。

未执行：创建 Runtime 或 Package；修改代码、Runner、Manifest、Binding、Snapshot、签名或任何 lockfile；Candidate 生成或应用；依赖安装、下载、构建或解包；测试；Invocation 创建/启动/消费；Verification；Final Preflight；Runtime/Worker/Agent 启动；故障注入、Retry、Resume 或恢复；密钥配置、私钥读取或密码学签名；commit；push。本次除本文外不创建其他文件，不修改现有治理状态。
