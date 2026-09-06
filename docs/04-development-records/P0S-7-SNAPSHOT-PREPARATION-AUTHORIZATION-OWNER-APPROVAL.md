# P0.S-7 Snapshot Preparation Authorization Owner Approval

| Field | Value |
|---|---|
| Decision ID | `P0S7-SNAPSHOT-PREPARATION-AUTHORIZATION-OWNER-APPROVAL-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Decision | `APPROVED_SNAPSHOT_PREPARATION_ONLY` |
| Record Date | `2026-09-05` |
| Authorization Request | `P0S7-SNAPSHOT-PREPARATION-AUTHORIZATION-REQUEST-20260905-01` |
| Current Goal | `MINIMAL_CONTROLLED_RUNTIME_SPIKE` |
| P0.S-7 / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Snapshot Preparation | `APPROVED_PREPARATION_ONLY` |
| Snapshot / Binding / Signature / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Invocation / Runtime Budget | `0 / 0` |
| Deliverable This Turn | 仅本文；不执行获批的准备工作，不创建任何准备产物或下游工件 |

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Snapshot Preparation Authorization Request](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-AUTHORIZATION-REQUEST.md) | `EC5AA8E9BA8CFDC0AF9C537B39B99F754B4E9671A9F16C149DF47F3FBC64D1B6` |
| R2 | [Snapshot Preparation Execution Plan](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-EXECUTION-PLAN.md) | `32AA8C5610E2C95384A645C6F7A16F8E50F9BFD7DF39B444F0E581BB01CDB642` |

R1 的申请状态及 R2 的计划状态保持其原始记录语义。本文承接两份依据，仅批准下列准备范围；未列入的动作保持未授权。本文是准备阶段的 Owner 授权决定，不是 Snapshot、Binding、Signature、Preflight、Invocation 或 Runtime 工件。

# 1. Decision

**批准：Snapshot Preparation Only。**

本决定批准后续在第 2 节白名单内开展非冻结、非执行的 Snapshot 候选准备工作。该批准只解除指定准备动作的待批准状态，不批准创建或冻结 Final Snapshot，也不提供任何执行权、启动权、签名权或信任激活。

本轮只创建本 Owner Decision 记录；获批的准备工作尚未执行。

# 2. Approved Scope

仅允许以下四类 Snapshot Preparation 动作：

- **candidate preparation**：整理非冻结、不可执行的 Snapshot candidate；必须显式标记 `CANDIDATE_ONLY / NOT_FROZEN / NOT_EXECUTED`，不得伪装或升级为 Final Snapshot。
- **input inventory**：盘点候选输入、引用、采用项、排除项及缺口；未知或缺失内容必须如实标记，不得补造输入或批准。
- **hash calculation**：对获批准备范围内的既有输入和准备产物计算原始字节 SHA-256、字节数及路径身份；摘要不构成签名、Binding、可信来源证明或 Snapshot freeze。
- **provenance recording**：记录输入来源、版本、路径、提交/工作区关系、材料提供方及未知原因；不得伪造构建、验证、签名或运行历史。

上述批准是后续有限文件准备权限，不代表本轮已经生成 candidate、inventory、hash 或 provenance 产物。除这四类动作外，R1/R2 中提及的其他拟议产物、验证动作或下游步骤均不因本文自动获批。

# 3. Forbidden

以下事项明确禁止且保持 `NOT_AUTHORIZED / NOT_CREATED`：

- **Final Snapshot**：不得创建、定型、冻结或宣称存在最终 Snapshot、Frozen Input Manifest 或 SnapshotRef。
- **Binding**：不得创建、修改或交付草稿或正式 Binding，不得建立可验证 envelope。
- **Signature**：不得生成密钥、读取私钥、签名、验签、配置 Trust Root，或把本文解释为密码学签名。
- **Invocation**：不得创建、预留、启动或消费 Invocation、Plan、slot、ledger、Retry、Resume 或 Recovery。
- **Runtime**：不得启动 Electron、Node Worker、Driver、collector、IPC、SUM3 或任何 Runtime 组件。
- **Preflight**：不得运行 Preflight、测试、验证会话、故障注入或以静态核对名义执行代码。

同样不授权下载、安装、构建、解包、应用依赖 Candidate、修改 Runtime/源码/Runner/既有 Manifest/lockfile、配置系统或权限、生成真实运行 Evidence、Commit 或 Push。

# 4. Boundary

**Preparation Approval != Snapshot Freeze Approval。**

| Boundary Item | 本决定后的状态 |
|---|---|
| Snapshot Preparation 白名单动作 | `APPROVED`，仅限第 2 节 |
| 本轮实际准备 | `NOT_PERFORMED` |
| Snapshot Freeze Approval | `NOT_PROVIDED / NOT_AUTHORIZED` |
| Final Snapshot | `NOT_CREATED` |
| Binding | `NOT_CREATED` |
| Signature | `NOT_CREATED` |
| Invocation | `NOT_CREATED` |
| Runtime Execution | `NOT_AUTHORIZED / NOT_PERFORMED` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |

candidate、inventory、hash 或 provenance 记录的存在，不能自动转化为 Final Snapshot、Snapshot Freeze Approval、Binding、Signature、Preflight PASS、Startup Activation 或 Runtime 权限。未来冻结 Snapshot 必须取得独立、明确且适用于精确输入身份的批准；任何范围或输入变化均不得继承本文形成冻结许可。

# 5. Budget

| Budget Item | Approved Quantity | Current Usable Quantity |
|---|---:|---:|
| Invocation | 0 | 0 |
| Runtime | 0 | 0 |
| Preflight / validation session | 0 | 0 |
| Retry | 0 | 0 |
| Resume | 0 | 0 |
| Recovery | 0 | 0 |

**Invocation = 0；Runtime = 0。**

普通文件读取、候选准备和原始字节摘要计算不被解释为 Invocation 或 Runtime；零预算不允许通过“准备”“核对”或“验证”名义执行一次代码、组件或 Preflight。本决定不批准、不消费、不继承或调整其他请求中的任何执行预算。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_ID = P0S7-SNAPSHOT-PREPARATION-AUTHORIZATION-OWNER-APPROVAL-20260905-01
DECISION = APPROVED_SNAPSHOT_PREPARATION_ONLY
AUTHORIZATION_REQUEST_ID = P0S7-SNAPSHOT-PREPARATION-AUTHORIZATION-REQUEST-20260905-01
CURRENT_GOAL = MINIMAL_CONTROLLED_RUNTIME_SPIKE
SNAPSHOT_PREPARATION_APPROVAL = APPROVED_PREPARATION_ONLY
CANDIDATE_PREPARATION_AUTHORIZED = YES
INPUT_INVENTORY_AUTHORIZED = YES
HASH_CALCULATION_AUTHORIZED = YES
PROVENANCE_RECORDING_AUTHORIZED = YES
FINAL_SNAPSHOT_AUTHORIZED = NO
SNAPSHOT_FREEZE_APPROVAL = NOT_PROVIDED
SNAPSHOT = NOT_CREATED
BINDING_AUTHORIZED = NO
BINDING = NOT_CREATED
SIGNATURE_AUTHORIZED = NO
SIGNATURE = NOT_CREATED
PREFLIGHT_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
INVOCATION = NOT_CREATED
RUNTIME_EXECUTION_AUTHORIZED = NO
RUNTIME = NOT_CREATED
INVOCATION_BUDGET = 0
RUNTIME_BUDGET = 0
CURRENT_USABLE_EXECUTION_BUDGET = 0
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
PREPARATION_PERFORMED_THIS_TURN = NO
```

## Performed Work and Unexecuted Items

本轮仅新增本 Owner Decision 文档，记录 Snapshot Preparation Only 批准、四项白名单、禁止事项、阶段边界和零预算。两份读取依据及工作区其他既有内容保持原样。

核对方式仅限静态文档检查：必需章节与状态字段、依据摘要、严格 UTF-8 无 BOM、换行及疑似中文乱码、本文 SHA-256 和 Git 工作区范围。按明确禁令，不运行测试、Preflight、Verification 或 Runtime。

未执行：candidate preparation、input inventory、hash calculation 或 provenance recording；未创建 preparation 目录、candidate、inventory、draft manifest、Final Snapshot、Frozen Input Manifest、Binding、Signature、key、Invocation、Plan、slot、ledger 或 Runtime Evidence；未读取私钥、签名/验签、测试、Preflight、启动 Electron/Node Worker/Driver/collector/IPC/SUM3、Retry、Resume、Recovery、下载、安装、构建、解包、Commit 或 Push。
