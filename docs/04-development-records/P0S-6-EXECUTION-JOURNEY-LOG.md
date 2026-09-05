# P0.S-6 Execution Journey Log

## 1. Overview

| Field | Value |
|---|---|
| Project | `Shaco Forge` |
| Phase | `P0.S-6` |
| Final State | `CLOSED` |
| Final Verification Classification | `AUTHORITY_BLOCKED` |

P0.S-6 完成了一次受控的 Verification Invocation。该 Invocation 产生了真实且唯一的终态，但未进入 Dependency Preparation、Runtime 或 P0.S-7。

本日志记录 P0.S-6 已发生的工程历程和决策依据，仅用于补充 Documentation。它不重新打开 P0.S-6，不修改已有 Contract 或 Decision Record，也不改变任何已冻结状态。

完整决策链：

```text
Failure Discovery
        ↓
LICC Corrective
        ↓
Governance Chain
        ↓
Execution Authorization
        ↓
Single Verification
        ↓
Closure
```

## 2. Initial Goal

**Goal**

验证 DeepSeek Harness 最小客户端模块和依赖恢复能力是否满足 Shaco Forge 后续复用要求。

**Action**

在 P0.S-6 的受控边界内准备最小客户端模块，并按已批准的恢复模型检查依赖就绪条件。

**Evidence**

- `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/`
- `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/`

**Decision**

P0.S-6 的判断范围是后续复用可行性和依赖恢复能力，不将阶段目标扩大为生产完成。

**Result**

最小客户端模块进入依赖就绪检查，随后暴露出必须先处理的依赖完整性问题。

**Impact on next step**

流程从一般依赖恢复转入 Failure Discovery，并以实际失败 Evidence 确定后续 corrective 范围。

## 3. Initial Problem Discovery

**Goal**

确认 Dependency Readiness Recovery 是否能够获得可用于后续验证的确定性依赖状态。

**Action**

执行已授权的 Dependency Preparation 后，观察到 `npm ci` 在 `NPM_CI` 边界以 `EINTEGRITY` 失败，并将失败对象定位为 `env-paths@2.2.1` 的 lockfile integrity mismatch。

**Evidence**

Evidence root：

`docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/evidence/aa96b746-eeca-4a65-a846-ecf5c753e6ab/`

关键引用：

- `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/evidence/aa96b746-eeca-4a65-a846-ecf5c753e6ab/npm-ci-result.json`
- `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/evidence/aa96b746-eeca-4a65-a846-ecf5c753e6ab/npm-ci.stderr.log`
- `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/evidence/aa96b746-eeca-4a65-a846-ecf5c753e6ab/classification.json`

**Decision**

初始 Dependency Readiness Recovery 暴露的是依赖完整性问题；在 lockfile identity 得到独立验证前，不继续 Dependency Preparation 或 Runtime。

**Result**

Dependency Readiness 被分类为 `INCONCLUSIVE`，首个失败边界为 `NPM_CI`。该结果没有提供 Runtime 输入，也没有证明生产完成。

**Impact on next step**

需要建立一个边界明确、Evidence 可追溯、不会静默改写 source lockfile 的 Lockfile Integrity Corrective 流程。

## 4. LICC Corrective Phase

**Goal**

为 `env-paths` integrity mismatch 定义可审计的修复与验证规则，并约束 corrected candidate 的派生条件。

**Action**

创建 `P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE-CONTRACT`，覆盖：

- lockfile integrity verification；
- Evidence identity；
- corrected candidate derivation。

Independent Review 的 F-01 指出冻结的 DRRC Evidence identity 数量声明与实际清单不一致。Corrective 将声明从 `7 Evidence` 修正为 `10 Evidence`，同步更新 Contract 中相关清单与计数；随后完成 corrective re-review、关闭 F-01，并对变更后的 LICC bytes 重新冻结。

**Evidence**

- `docs/03-v1.0-plan/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE-CONTRACT.md`
- `docs/04-development-records/P0S-6-LICC-OWNER-APPROVAL-DECISION.md`
- `docs/04-development-records/P0S-6-LICC-CORRECTIVE-REFREEZE-DECISION.md`

**Decision**

F-01 状态为 `CLOSED`；LICC Independent Review 和 Re-review 均为 `PASS`；corrected LICC 被 Owner approved and frozen。

**Result**

P0.S-6 获得了确定的 lockfile 验证规则、Evidence 身份边界和 candidate 派生边界，但 LICC 本身不直接授予执行权限。

**Impact on next step**

由于实际 Verification 需要独立的规划、授权和单次 Invocation 控制，下一步进入 Governance Chain Construction。

## 5. Governance Chain Construction

**Goal**

把 corrective 规则转化为分层、可审查且不能被隐式扩大的一次性 Verification 治理链。

**Action**

按顺序建立并冻结以下治理链：

```text
LICC → FVPC → FVEAC → FVEAR
```

- **LICC**：定义修复和验证规则，包括输入、Evidence、网络、candidate 与终态边界。
- **FVPC**：定义未来 Verification Planning，说明在何种前提下可以规划一次受控验证。
- **FVEAC**：定义执行授权条件，要求 Authority、身份、权限、预算和停止条件完整一致。
- **FVEAR**：定义单次 Invocation 授权模型，冻结单次使用、不可 retry、不可 resume、不可 reuse 的执行边界。

**Evidence**

- `docs/03-v1.0-plan/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE-CONTRACT.md`
- `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-PLANNING-CONTRACT.md`
- `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-EXECUTION-AUTHORIZATION-CONTRACT.md`
- `docs/03-v1.0-plan/P0S-6-FUTURE-VERIFICATION-EXECUTION-AUTHORIZATION-RECORD.md`
- `docs/04-development-records/P0S-6-FVPC-OWNER-APPROVAL-DECISION.md`
- `docs/04-development-records/P0S-6-FVEAC-OWNER-APPROVAL-DECISION.md`
- `docs/04-development-records/P0S-6-FVEAR-OWNER-APPROVAL-DECISION.md`

**Decision**

LICC、FVPC、FVEAC 和 FVEAR 的治理身份依次获得批准与冻结。治理链完成后，Execution 仍需单独的 Activation Decision 和 Authority Activation。

**Result**

Verification 的规则、规划、授权条件和 Invocation 模型形成连续的 governance chain，任何后续执行都必须绑定该链的冻结身份。

**Impact on next step**

治理链允许进入 Execution Preparation，用确定的 Runner、Invocation、Execution Root、Input Manifest 和 Authority HEAD 完成最终授权准备。

## 6. Execution Preparation

**Goal**

将已冻结的治理链绑定到唯一、可追溯且可 fail-closed 的 Verification Invocation。

**Action**

完成 Governance Freeze Commit：

`070473430fec2c887abdc10085a9fa51193373c4`

并完成以下执行身份与输入准备：

- Runner Identity；
- Invocation Identity；
- Execution Root Identity；
- Input Manifest。

所有执行前 Gate 均经过验证。只读 pre-start preflight 核对了 Authority 状态、Authority HEAD、tracked/staged state、Runner、executor、Execution Root、source lockfile 和冻结输入，Input Manifest 的所有条目完成匹配。

**Evidence**

- `docs/04-development-records/P0S-6-VERIFICATION-EXECUTION-ACTIVATION-DECISION.md`
- `docs/04-development-records/P0S-6-VERIFICATION-EXECUTION-ACTIVATION-OWNER-APPROVAL-DECISION.md`
- `docs/04-development-records/P0S-6-VERIFICATION-EXECUTION-AUTHORITY-ACTIVATION-RECORD.md`
- `docs/04-development-records/P0S-6-VERIFICATION-EXECUTION-AUTHORITY-ACTIVATION-OWNER-APPROVAL-DECISION.md`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/runner/verify-and-materialize.mjs`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/invocation/INVOCATION-IDENTITY.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/execution-root/EXECUTION-ROOT-IDENTITY.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/manifest/P0S6-FINAL-VERIFICATION-INPUT-MANIFEST.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/preflight.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/input-manifest-evidence.json`

**Decision**

Authority Activation 被 Owner approved and frozen，单次 Invocation 获得执行权限；pre-start Gate 的结果允许流程跨越 authorized start boundary。

**Result**

Authority HEAD 可追溯到 Governance Freeze Commit，所有执行身份和输入均与冻结清单绑定。这里的 pre-start Gate 通过不预先决定 Runner 内部 Authority Gate 的结果。

**Impact on next step**

唯一一次 Final Verification Invocation 可以启动；一旦跨越 Start Boundary，即永久消耗该 Invocation，任何终态都不允许 retry 或 second invocation。

## 7. Final Verification Invocation

**Goal**

在冻结身份、预算和权限内执行唯一一次最终 Verification，并产生真实终态。

**Action**

启动 Invocation：

`P0S6-FINAL-VERIFICATION-INVOCATION-20260904-01`

执行结果：

| Field | Result |
|---|---|
| Start Boundary | `CROSSED` |
| Consumed | `YES` |
| Execution Result | `AUTHORITY_BLOCKED` |

**Evidence**

- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/invocation-ledger.jsonl`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/runner-execution-result.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/preflight.json`

**Decision**

冻结 Runner 在 Authority Gate 检测到阻断条件后执行 fail-closed，返回 `AUTHORITY_BLOCKED`，不越过该 Gate 执行后续操作。

**Result**

未进入：

- metadata GET；
- tarball GET；
- candidate creation。

Source lockfile 未改变，corrected candidate 未创建。

**Impact on next step**

Start Boundary 已跨越，因此 Invocation 已被消耗。流程只能进入 Evidence finalization 和 Closure，不能 retry、resume 或启动第二次 Invocation。

## 8. Evidence and Final Classification

**Goal**

为已到达的执行阶段形成完整、可追溯并已 finalized 的 Evidence closure。

**Action**

保存 Invocation lifecycle、Runner 结果、preflight、Input Manifest 比对、未到达操作的零消耗状态、terminal classification 和 final summary，并由 Evidence Manifest 固化 Evidence 身份。

**Evidence**

Evidence root：

`docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/`

核心引用：

- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/invocation-ledger.jsonl`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/classification.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/final-summary.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/evidence-manifest.json`

**Decision**

Final Classification：

`AUTHORITY_BLOCKED`

**Result**

Evidence 已生成并 finalized，唯一 terminal classification 与 Runner execution result、Invocation ledger 和未到达操作状态保持一致。

**Impact on next step**

终态 Evidence 满足关闭决策所需的事实基础，P0.S-6 不需要、也不允许通过再次执行来改写该结果。

## 9. Final Decision

**Goal**

依据唯一 Invocation 的终态和完整 Evidence 对 P0.S-6 作最终边界关闭。

**Action**

创建 Closure Decision Record，汇总 governance chain、Invocation lifecycle、final classification、Evidence 状态、lockfile 结果和禁止继续执行的边界。

**Evidence**

- `docs/04-development-records/P0S-6-FINAL-CLOSURE-DECISION.md`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/classification.json`
- `docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/final-summary.json`

**Decision**

`P0.S-6 CLOSED`

关闭原因：

- Single Invocation completed；
- Terminal Classification produced；
- No retry allowed。

**Result**

P0.S-6 以 `AUTHORITY_BLOCKED` 作为 Final Verification Classification 完成关闭。未授权 Dependency Preparation、Runtime 或 P0.S-7。

**Impact on next step**

P0.S-6 不再继续执行。本 Journey Log 只保留从 Failure Discovery 到 Closure 的决策上下文，不创建新的 Contract loop，也不改变 P0.S-6 或 P0.S-7 的状态。

## 10. Lessons Learned

1. **Governance boundary 必须先于 execution。** 只有先冻结范围、输入、预算、停止条件和终态模型，执行结果才具备可解释性和约束力。
2. **Execution Authority HEAD 必须可追溯。** Authority 必须绑定明确 commit、branch 和 repository state，才能证明 Runner 使用的是已批准治理链和输入身份。
3. **Fail-closed 比错误成功更重要。** Authority Gate 无法满足时立即停止，能够防止未授权网络访问、candidate 派生或后续阶段被误判为成功。
4. **Evidence chain 是长期维护关键。** Invocation ledger、classification、final summary 和 evidence manifest 使未来开发者无需重放执行即可理解结果及其边界。
5. **Verification 未成功不代表流程失败，而是产生真实终态。** `AUTHORITY_BLOCKED` 准确记录了本次受控 Invocation 在 Authority Gate 停止的事实，并为不可 retry 的关闭决策提供依据。

## 11. Technical Validation Extension Final Evidence Synchronization

| Field | Value |
|---|---|
| Record Date | `2026-09-05` |
| Record Type | `FINAL_EVIDENCE_SYNCHRONIZATION_RECORD` |
| Invocation | `P0S6-TVEC-INVOCATION-20260904-01` |
| Result | `PASS` |
| Classification | `PASS` |
| Candidate | `generated_not_applied` |
| Phase Closure Performed by This Synchronization | `NO` |

本次以用户提供的唯一可信状态为同步基准，并以仓库现存工件补充可追溯引用；不使用旧对话历史。第 1–10 节原样保留，描述的是原 `P0S6-FINAL-VERIFICATION-INVOCATION-20260904-01` 的历史结果和治理关闭决定，其中 Overview 的 `CLOSED` / `AUTHORITY_BLOCKED` 不代表本次 Extension 的验证结果。本节追加 Extension 的完整执行历程，仅生成最终记录，不关闭 Phase，不创建或修改关闭决定，也不改变任何既有 Phase 状态。

以下 Timeline 按治理与执行依赖组织；架构纠正章节包含对前置问题的回溯。未有独立执行时间戳的环节以对应记录及先后依赖定位，不将文件名或 Decision ID 中的日期当作执行时间。最终执行时间取自 audit 和 ledger：虽然 Invocation ID 含 `20260904`，实际执行发生于 `2026-09-05`。

本节中的执行工件链接位于 `experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/`。

### 11.1 Phase: Governance Closure

**执行过程与问题：** 原 Verification 在 Authority Gate 以 `AUTHORITY_BLOCKED` 结束，Invocation 已消耗，metadata、tarball 和 candidate 尚未到达。治理链、单次执行和 fail-closed 得到记录，但依赖恢复、lockfile correction 的技术可行性及 Runtime 尚未证明。

**Corrective / 决策：** 历史 Final Closure 与 Post-Closure Reconciliation 区分治理完成和技术未证明。随后通过独立 Technical Validation Extension Decision、Contract、Owner Approval、Execution Authorization Contract 和 Authority Activation 建立有界 Extension，范围为 registry metadata、tarball identity 与 corrected candidate。它不是原 Invocation 的 retry，也不重新打开旧 Contract。

**结果与依据：** Extension Execution Authority 由 `P0S6-TVEC-EA-ACTIVATION-20260904-01` 激活；依赖准备、Runtime 和 P0.S-7 未获授权。本段只回溯历史 Governance Closure，本次不执行关闭。

- [历史 Final Closure](P0S-6-FINAL-CLOSURE-DECISION.md)
- [Post-Closure Reconciliation](P0S-6-POST-CLOSURE-RECONCILIATION-DECISION.md)
- [Technical Validation Extension Decision](P0S-6-TECHNICAL-VALIDATION-EXTENSION-DECISION.md)
- [Extension Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-CONTRACT.md)
- [Execution Authorization Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-AUTHORIZATION-CONTRACT.md)
- [Execution Authority Activation](P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-AUTHORITY-ACTIVATION-DECISION.md)

### 11.2 Phase: Execution Trust Model Correction

**架构问题：** 动态 Git HEAD 等值绑定使 Execution Identity 无法稳定冻结；仅将其改成 Anchor ancestry，又无法防止后代提交同时修改 Runner、Manifest 和 Identity，并重算内部哈希后继续自洽。Manifest self trust 不能证明执行字节得到 Owner 批准。

**Corrective：** 建立双层信任模型：Authority Anchor 证明治理历史关系；Execution Snapshot + Binding 证明获准执行的精确字节。两层必须同时满足，Manifest 内部一致性作为从属检查，不能作为唯一信任根。

**结果与依据：** Snapshot Correction Decision、Owner Approval 和 Corrective Contract 明确依赖顺序及 fail-closed 条件。模型批准与实施、最终字节冻结、实际验证分别留证，不把设计通过等同于执行 PASS。

- [Execution Snapshot Correction Decision](P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTION-DECISION.md)
- [Correction Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTION-OWNER-APPROVAL-DECISION.md)
- [Execution Snapshot Corrective Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTIVE-CONTRACT.md)
- [Corrective Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTIVE-OWNER-APPROVAL-DECISION.md)

### 11.3 Phase: Authority Anchor Correction

**Problem：** `Git SHA self-reference`。

**Root Cause：** `Commit hash circular dependency`。Identity 写入包含其自身的 commit SHA 会改变 tree 和 commit 对象；产生新 SHA 后，文件内原 SHA 再次失效，形成循环。

**Correction：** `Authority Anchor`。从 `current HEAD == authorityHead` 改为相对于已批准固定 Anchor 的 ancestry 验证。最终选定的 Authority Anchor 为 `001a1e495617b211e1cd1702d5895a4c31f314ea`，后续提交不推动该值。

**执行过程与结果：** 初次 Freeze Record 曾因缺少具体 Anchor 批准和 Runner 最终条件而记录 `BLOCKED`；后续 Anchor Selection Owner Approval 才批准精确 commit。该批准不追溯改写早期阻断，且 ancestry 仍需与 Snapshot 验证共同成立。

- [Authority Anchor Correction](P0S-6-TECHNICAL-VALIDATION-EXTENSION-AUTHORITY-ANCHOR-CORRECTION-DECISION.md)
- [早期 Freeze 阻断记录](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-SNAPSHOT-FREEZE-EXECUTION-RECORD.md)
- [精确 Anchor Selection Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-AUTHORITY-ANCHOR-SELECTION-OWNER-APPROVAL-DECISION.md)

### 11.4 Phase: Execution Snapshot Design

**执行过程：** 定义 Snapshot 必须绑定 Runner、Runner Identity、Execution Root Identity、Invocation Identity 和 Frozen Input Manifest 的精确路径、字节数和 SHA-256，并由独立批准的不可变 Snapshot Reference 选定。

**架构纠正：** 冻结顺序为已批准 Anchor → corrective implementation → final Runner bytes → Identity regeneration → final Manifest → Snapshot Binding → final review / Owner freeze → Final Preflight。后生成的 Binding 摘要不回填到 Runner、Identity 或 Manifest；Payload 不包含自身摘要，避免重新产生循环依赖。

**结果与依据：** 初始 Binding review record 仅是设计及观察记录；冻结计划规定了完整依赖顺序，不代表当时已经完成冻结或验证。

- [Execution Snapshot Binding Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-BINDING-CONTRACT.md)
- [初始 Snapshot Binding Review Record](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING.md)
- [Binding Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-OWNER-APPROVAL-DECISION.md)
- [Final Snapshot Freeze Plan](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-SNAPSHOT-FREEZE-PLAN-DECISION.md)
- [Freeze Plan Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-SNAPSHOT-FREEZE-PLAN-OWNER-APPROVAL-DECISION.md)

### 11.5 Phase: Trust Root Setup

**Problem：** `Missing execution trust root`。早期 Runner 的 `SNAPSHOT_OWNER_PUBLIC_KEY_PEM = null`，信任根未配置，Runner Identity 也已过期，无法完成最终冻结。

**Correction：** `Ed25519 Owner Signature`。通过独立 Owner Approval 确认具体公钥身份，固定公钥与指纹，对精确 Payload bytes 验签，并通过独立批准路径确定本次 Invocation 允许的 Snapshot Reference。签名有效、公钥获批和精确 Snapshot 获批是不同检查。

**结果与依据：** 已批准公钥的指纹为 `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C`，哈希域为 `DER SubjectPublicKeyInfo SHA-256`。私钥由 Owner 控制；记录不包含私钥，也不将 Binding 自带的公钥声明作为批准来源。

- [Trust Root Selection](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-SELECTION-DECISION.md)
- [Trust Root Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-OWNER-APPROVAL-DECISION.md)
- [Public Key Approval Record](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-PUBLIC-KEY-APPROVAL-RECORD.md)

### 11.6 Phase: Runner Freeze

**执行过程：** Runner 对齐已批准 Anchor 和固定 Ed25519 公钥后，Owner 对最终候选字节作精确批准。最终 Runner 版本为 `P0S6-TVEC-RUNNER-1.0.0`，文件长度 `33726` bytes，SHA-256 为 `DDC871A3970D064D5D26D0A1B5D668F6518C9EDFB23F37092D58FE72A3FC8A38`。

**保留的架构事实：** Runner Final Freeze Approval 同时记录：Runner 当时尚未自行验证 separately typed Owner Freeze Approval，也未自行比较独立固定的预期 Snapshot Reference。因此字节批准不等于完整信任检查通过，独立 pre-start 验证边界仍不可省略。本日志不把后续 PASS 改写成 Runner 已实现这些功能。

**结果与依据：** 后续 Identity 与 Binding 绑定上述精确 Runner 字节；最终执行 audit 的 preLaunch 与执行后不变性记录提供各自阶段的证据。本次未运行或修改 Runner。

- [Runner Final Freeze Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-RUNNER-FINAL-FREEZE-APPROVAL-DECISION.md)
- [Frozen Runner Identity](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/runner/runner-identity.json)

### 11.7 Phase: Identity Freeze

**执行过程：** 在 Runner 字节确定后，冻结依赖该 Runner 的 Identity 和最终 Manifest。五个组件的精确身份如下，来自最终 Corrected Payload，并与现有文件相符。

| Component | Bytes | SHA-256 |
|---|---|---|
| Runner | `33726` | `DDC871A3970D064D5D26D0A1B5D668F6518C9EDFB23F37092D58FE72A3FC8A38` |
| Runner Identity | `688` | `88A40DFEE0758965A3B0C9EA09ADD5239EA99C4F5A119992D4044F8BFDCAE381` |
| Execution Root Identity | `1420` | `AC4D73DB00AC69D421FD3C143B4672A80A90445FCB471095845DA0B720029574` |
| Invocation Identity | `389` | `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |
| Frozen Input Manifest | `15121` | `3B8774242BFEF5B3074555542AB86D43419F88D1BF4DADE3250902AA0E8FAA9F` |

**结果与边界：** Manifest 包含 `40` 个输入。冻结 Invocation Identity 中的 `NOT_STARTED` / `consumed: false`、Root Identity 中的 `EMPTY` 是执行前快照；完成后的事实由 ledger 和 final summary 表达，不回写这些冻结输入。

- [Execution Root Identity](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/execution-root-identity.json)
- [Invocation Identity](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/invocation/invocation-identity.json)
- [Frozen Input Manifest](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/manifest/frozen-input-manifest.json)
- [最终 Payload 中的组件身份](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.corrected.payload.json)

### 11.8 Phase: Snapshot Binding

**执行过程：** 将 Anchor、Invocation、五个组件身份及 Trust Root 信息组成 Payload，计算精确字节的 Snapshot Reference，并通过 Owner 签名承载到 Binding Envelope。Signing Contract / Approval 规定签名域与交接边界；早期 Signing Execution Record 明确记录 `NOT_PERFORMED`，不能因标题包含 Execution 就推断该步骤已签名。

**历史结果：** 旧 Payload 为 `2230` bytes，Reference 为 `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151`；旧 Binding 为 `6321` bytes，SHA-256 为 `AFC25874FCB99880CE3750865338A14CE2478FEF2B596E760AC73ACE16AF28ED`。已有两个 Freeze Approval 记录绑定的是这组旧字节，批准记录本身未改变 Payload 的 draft 状态，随后暴露状态不匹配。

- [Snapshot Binding Signing Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-SIGNING-CONTRACT.md)
- [Signing Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-SIGNING-OWNER-APPROVAL-DECISION.md)
- [Signing Execution Boundary Record](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-SIGNING-EXECUTION-RECORD.md)
- [历史 Snapshot Freeze Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-SNAPSHOT-FREEZE-OWNER-APPROVAL-DECISION.md)
- [历史 Binding Final Freeze Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-FINAL-FREEZE-APPROVAL-DECISION.md)

### 11.9 Phase: Signature Correction

**Bug 1 / Problem：** `Payload status mismatch`。外部批准状态已记录，但签名覆盖的旧 Payload 仍为 `DRAFT_FOR_FINAL_FREEZE_REVIEW`，与执行门禁要求不一致；修改批准文档或 Envelope 状态不能改变已签名字节的语义。

**Correction：** `Payload → Reference → Signature → Binding regeneration`。独立生成 corrected Payload，仅将顶层 `$.status` 改为 `OWNER_APPROVED_AND_FROZEN`；重新计算 Reference，使用新的 Owner Signature，再生成 corrected Binding。旧签名不能用于新 Payload，旧批准的精确身份也不能自动转移给新链。

| Corrected Artifact | Bytes | SHA-256 |
|---|---|---|
| Payload | `2226` | `F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Ed25519 Signature | `64` | `16F5B0ECDD464D2F1D8A4109FCFB616D5F9DD580148BE8E5310D534ABC1B87AB` |
| Binding | `6351` | `E781C25F663065F1DE6B0E4F53DBFF32E8E27C5053E8EB6725D59E35CA6E07AD` |

最终 Snapshot Reference 为 `sha256:F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91`。Corrective Record 自身停在待 Owner 新签名的阶段；后续存在的 corrected signature / Binding 及最终 preLaunch audit 分别记录后续工件和验签结果，不把早期交接记录改写成签名完成证明。

**Bug 2 / Problem：** `Old Binding entrypoint`。corrected Binding 已存在，但 Runner 固定读取的 `execution/snapshot/snapshot-binding.json` 仍指向旧 Payload，历史 Final Preflight 的首个失败边界仍为 `EXECUTION_SNAPSHOT`。

**Correction：** `Corrected Binding Promotion`。将已批准 corrected Binding 的原始字节提升到正式 `snapshot-binding.json` 入口，保持 Runner、Manifest、Identity、corrected Payload 和 signature 字节不变。当前正式入口与 `snapshot-binding.corrected.json` 逐字节一致。Promotion Record 的审查状态仍为 `DRAFT_FOR_INDEPENDENT_REVIEW`；该次文件操作没有运行 Preflight，后续 PASS 由最终执行证据单独记录。

- [Payload Corrective Record](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-PAYLOAD-CORRECTIVE-RECORD.md)
- [Corrected Signature](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.corrected.signature)
- [Corrected Binding](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.corrected.json)
- [Binding Promotion Decision](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-PROMOTION-DECISION.md)
- [正式 Binding 入口](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.json)

### 11.10 Phase: Final Preflight

**执行过程：** 已存 audit 的 `preLaunch` 记录最后一次启动前只读检查为 `PASS`，时间为 `2026-09-05T05:58:39.596Z`（北京时间 `2026-09-05 13:58:39.596`）。当时 Runner 尚未启动，network requests 为 `0`，Execution Root 为空。

**检查结果：** observed HEAD 为 `75d65be075ab56623cabbef581ae981a113fbe3c`；Authority Anchor 为 `001a1e495617b211e1cd1702d5895a4c31f314ea`；Snapshot Reference 为 corrected Reference；`signatureValid = true`，Manifest 输入数为 `40`。这是已有 Final Preflight / preLaunch 结果的同步，本次未重跑 Preflight，也不追加新的批准结论。

**环境阻断及处理：** audit 记录，早期只读检查先遇到 repository ownership rejection，随后发现继承的 proxy 环境变量；这些情况均发生在 Runner 启动之前。最终验证与 Invocation 子进程移除了 proxy / Node override 变量，未改变系统或仓库全局配置。未因此消耗第二次 Invocation。

**依据：** [Controlled Verification Audit](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/controlled-verification-audit.json) 的 `preLaunch`、`preLaunchEnvironmentNotes` 和 `execution`。

### 11.11 Phase: Controlled Verification Invocation

**Invocation：** `P0S6-TVEC-INVOCATION-20260904-01`。

**Result：** `PASS`。

**Classification：** `PASS`。

**执行过程：** 冻结 Runner 实际启动 `1` 次，process exit code 为 `0`，官方 npm registry 的 metadata GET 与 tarball GET 各 `1` 次，均返回 HTTP `200`；生成 `1` 个 candidate。retry / resume / reuse 均为 `0`。

| 时间（UTC，均为 2026-09-05） | Ledger Event | 结果 |
|---|---|---|
| `05:59:18.129Z` | `INVOCATION_START_BOUNDARY_CROSSED` | Start Boundary 已跨越，单次 Invocation 已消耗 |
| `05:59:18.141Z` | `METADATA_REQUEST_STARTED` | 第 1 次且唯一 metadata 请求 |
| `05:59:18.996Z` | `METADATA_IDENTITY_VERIFIED` | `PASS` |
| `05:59:18.996Z` | `TARBALL_REQUEST_STARTED` | 第 1 次且唯一 tarball 请求 |
| `05:59:19.811Z` | `TARBALL_IDENTITY_VERIFIED` | `PASS` |
| `05:59:19.814Z` | `CANDIDATE_DERIVED` | `PASS`，candidate count 为 `1` |
| `05:59:19.816Z` | `INVOCATION_FINALIZED` | `PASS` |

北京时间执行窗口为 `2026-09-05 13:59:18.129–13:59:19.816`。audit 记录时间为 `2026-09-05T06:01:11.973Z`。Invocation 完成不构成本次文档任务的 Phase 关闭决定。

**Evidence：** metadata evidence、tarball evidence、integrity comparison 和 candidate 均已存在，具体身份见第 12 节。

## 12. Extension Final Validation Result and Evidence

| Field | Recorded Result |
|---|---|
| Invocation | `P0S6-TVEC-INVOCATION-20260904-01` |
| Result | `PASS` |
| Classification | `PASS` |
| Verification Executed | `YES`，指已有受控执行 |
| Start Boundary / Consumed | `CROSSED` / `YES` |
| Candidate | `generated_not_applied` |
| Candidate Applied | `false` |
| Source Lockfile Modified | `false` |
| Dependency Preparation / Runtime Authorized | `false` / `false` |
| P0.S-7 Allowed | `NO` |
| New Phase Closure Decision | `NOT_PERFORMED` |

### 12.1 Evidence Index and SHA-256

以下 SHA-256 对应已存在文件的精确字节。本次只读复算，未重新生成 Evidence。

| Evidence | File | SHA-256 |
|---|---|---|
| metadata evidence | [metadata-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/metadata-evidence.json) | `646A19E57D61E18D0C1F23982EBDC73D48283EA73F96A4DB2A41700D0392EDFD` |
| tarball evidence | [tarball-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/tarball-evidence.json) | `83AF206607AAD4C3813437BCEBF7C8B2C1ADD43E152EE4346EDFEC42263DF621` |
| integrity comparison / execution audit | [controlled-verification-audit.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/controlled-verification-audit.json) | `0C6CF2A0673A22FC8232D942A8206ADBE5324FFCF7B518B8B66B2B372FECECEA` |
| candidate derivation evidence | [candidate-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/candidate-evidence.json) | `C1D458EBA8A0E44E211D3E224CC6000D4DE175E64B09F7DB53070C6D81486F16` |
| candidate | [package-lock.corrected.candidate.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/package-lock.corrected.candidate.json) | `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B` |
| terminal classification | [classification.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/classification.json) | `BB436391F1013AE9CFB7EC2DCC46516400821AB3FA87E02383230A42F9851082` |
| final summary | [final-summary.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/final-summary.json) | `47E353AD6DCD0E1D63E68B5D8EC800893C5A7EAE7BD23FA4299D7BCD94D6894F` |
| invocation lifecycle | [invocation-ledger.jsonl](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/invocation-ledger.jsonl) | `9F62819B023C640FBB0FE547F77DB4CD96B248529851B95E5130EBA681E45D79` |

补充原始证据：[registry-metadata.raw.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/registry-metadata.raw.json)（`2511` bytes，SHA-256 `B8709E708E37227C664A8EC0A65387AFBBD11466EA2BCD01936AEF731193A106`）；[env-paths-2.2.1.tgz](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/env-paths-2.2.1.tgz)（`3411` bytes，SHA-256 `5A0B894F4158809FFC408C6A9274CBCA434472802128F6D80E5755FAD0E6769E`）。网络计数见 [network-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/network-evidence.json)，输入验证见 [input-manifest-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/input-manifest-evidence.json)。

### 12.2 Integrity Comparison and Candidate Boundary

对象为 `env-paths@2.2.1`。metadata integrity 与实际 tarball SHA-512 SRI 相同，candidate 对应 integrity 也与二者一致：

```text
sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgAlwKNZ0cf2uqan5GLuS2A==
```

source / DRRC lockfile 中仍保留原 integrity：

```text
sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgALwKNZ0cf2uqan5GLuS2A==
```

| Comparison | Result |
|---|---|
| metadata vs tarball | `MATCH` |
| metadata vs source lockfile | `MISMATCH` |
| metadata vs DRRC lockfile | `MISMATCH` |
| source vs DRRC lockfile | `MATCH` |
| candidate vs metadata / tarball | `MATCH` |

candidate 为 `30829` bytes，仅在 `/packages/node_modules~1env-paths/integrity` 存在语义差异；原始字节唯一差异位于从零起算的 offset `11305`，source 为 `76`（`L`），candidate 为 `108`（`l`）。这是两份文件之间的比较，不是对 source lockfile 的写入。source 与 DRRC lockfile 的 SHA-256 均保持 `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD`。

**Candidate: `generated_not_applied`。** 本次 PASS 证明受控范围内的 metadata、tarball 身份及 candidate 派生验证通过；不声明 lockfile 已修改或已应用修复，不证明依赖安装或 Runtime 已通过。

## 13. Synchronization Scope and Checks

本次仅追加本 Journey Log，并新增 [Technical Validation Extension Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md)。既有历史段落和冻结输入保留原字节；历史记录中的 `BLOCKED`、`NOT_PERFORMED`、draft / review 状态保留其阶段含义，最终执行状态以本次同步的 ledger、audit、classification 和 final summary 为依据。

文档检查方式：严格 UTF-8 解码、无 BOM / LF 保持、疑似乱码字符扫描、11 个必需 Phase 与最终状态字段检查、相对链接检查、证据文件 SHA-256 复算、metadata / tarball / candidate integrity 与已有差异记录的只读比对，以及修改前后工作区文件哈希和 `git status` 比较。文件检查不构成新的 Verification Invocation，也未运行或导入 Runner。

本次未修改 Runner、Manifest、Binding、Payload、signature、任何 Identity、Candidate 或 lockfile；未重跑 Final Preflight / Verification，未新建 Invocation，未访问网络、下载 metadata / tarball、生成或应用 candidate，未读取私钥、签名、执行 npm、准备依赖、运行 Runtime 或进入 P0.S-7；未关闭 Phase，未 commit，未 push。
