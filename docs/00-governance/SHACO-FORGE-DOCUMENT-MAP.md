# Shaco Forge Document Map

> Current summary (2026-09-08): Independent [AUDIT-017](../05-reviews/architecture/AUDIT-017-V1-SLICE-1C-INDEPENDENT-IMPLEMENTATION-REVIEW.md) is `PASS` with no Blocking Findings. The [V1-SLICE-1C Owner Closure Decision](../04-development-records/V1-SLICE-1C-OWNER-CLOSURE-DECISION.md) is `OWNER_ACCEPTED_AND_FROZEN`. Slice 1A, 1B and 1C are `CLOSED / FROZEN`; V1-SLICE-1 remains `IN_PROGRESS`. Next is Architecture Owner assessment of remaining V1-SLICE-1 gates.

```text
V1_SLICE_1A = CLOSED / FROZEN
V1_SLICE_1B = CLOSED / FROZEN
V1_SLICE_1C = CLOSED / FROZEN
V1_SLICE_1 = IN_PROGRESS
V1_CURRENT_STEP = NONE_AFTER_V1_SLICE_1C
V1_CURRENT_NEXT_ACTION = ARCHITECTURE_OWNER_ASSESS_REMAINING_V1_SLICE_1_GATES
```

Status: ACTIVE

Purpose: 所有 Agent / Reviewer / Developer 的第一入口。

> Historical / Superseded Execution Checkpoint — V1-SLICE-1C execution
> (2026-09-08): uncommitted implementation
> work is recorded in the
> [Implementation Record](../04-development-records/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-IMPLEMENTATION-RECORD.md)
> and [Durable Evidence](../06-testing-acceptance/evidence/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-EVIDENCE.md).
> Implementation result is `NOT_PROVEN`; the real UI gate is blocked at missing
> picker composition, pending narrow scope confirmation for the Host profile.
> No Provider Tool attempt, Independent Review, baseline freeze or closure is
> claimed. The following Owner authorization text retains its initial status.

> Historical / Superseded Execution Checkpoint — V1-SLICE-1C implementation
> authorization (2026-09-08): the
> [Implementation Authorization Owner Decision](../04-development-records/V1-SLICE-1C-IMPLEMENTATION-AUTHORIZATION-OWNER-DECISION.md)
> accepts Targeted Delta Review
> [AUDIT-016](../05-reviews/architecture/AUDIT-016-V1-SLICE-1C-CONTRACT-TARGETED-DELTA-REVIEW.md)
> (`PASS`, no Blocking Findings), freezes the reviewed 1C Architecture baseline,
> and authorizes bounded implementation. Slice 1A and 1B are `CLOSED / FROZEN`;
> 1C is `AUTHORIZED_FOR_IMPLEMENTATION`, its implementation is `NOT_STARTED`,
> and Slice 1 remains `IN_PROGRESS`. Next is implementation of the frozen
> Embedded Real Harness User Loop Contract.

```text
V1_SLICE_1A = CLOSED / FROZEN
V1_SLICE_1B = CLOSED / FROZEN
V1_SLICE_1C = AUTHORIZED_FOR_IMPLEMENTATION
V1_SLICE_1C_IMPLEMENTATION = NOT_STARTED
V1_SLICE_1 = IN_PROGRESS
V1_CURRENT_NEXT_ACTION = IMPLEMENT_V1_SLICE_1C_EMBEDDED_REAL_HARNESS_USER_LOOP
```

> Latest P0.S authority (2026-09-06): P0.S-8 V1 Product Architecture Freeze and
> the P0.S umbrella are `CLOSED`; Independent Final Closure Audit REVIEW-010 is
> `PASS` and Owner-accepted; V1 implementation is ready but not started.
> Earlier P0.S-6 / P0.S-7 Runtime and P0.S-8 handoff text remains historical.
> See the [current closure authority](#current-p0s-8-and-p0s-closure-authority-2026-09-06).

> Latest V1.0 implementation-scope authority (2026-09-06): the
> [V1.0 Harness Reuse Implementation Scope Corrective Decision](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md)
> corrects only V1.0 Implementation Scope Allocation to
> `HARNESS_REUSE_PRODUCTIZATION`. P0.S remains `CLOSED`; its architecture
> sufficiency and technical Evidence remain unchanged.

> Accepted V1.0 technical baseline (2026-09-06):
> [V1.0 Technical Implementation Baseline](../02-architecture/SHACO-FORGE-V1.0-TECHNICAL-IMPLEMENTATION-BASELINE.md)
> is `ACTIVE / OWNER_ACCEPTED` after `REVIEW-011 / PASS`. It does not start
> Product implementation or Slice 1A. V1 Product implementation must read it
> before implementation.

## 1. Authority Order

当文档之间出现冲突时，默认按以下顺序判断当前事实：

1. `SHACO-FORGE-CURRENT-STATE.md`：当前真实阶段、Gate、阻塞、下一步。
2. 当前 Phase 已冻结 Contract：当前阶段执行边界与验收规则。
3. 已接受的 ADR：架构决策及 supersede 关系。
4. `SHACO-FORGE-V1.0-MASTER-GOAL.md`：V1.0 产品完成定义。
5. `SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md`：全阶段地图与依赖。
6. System Architecture / Security / Data Ownership 等横向 Contract。
7. 已接受 Review / Corrective Review：证据与修正依据。
8. Development Log / Bug / Experiment：历史事实，不自动覆盖当前 Contract。
9. Handover / Checkpoint：用于恢复上下文；若与 Current State 冲突，以 Current State 为准。
10. `99-archive/`：历史材料，不得作为当前执行权威。

## 2. Governance

| Document | Role | Status | Read When |
|---|---|---|---|
| `SHACO-FORGE-DOCUMENT-MAP.md` | 文档导航与权威顺序 | ACTIVE | 每次新 Agent 接手 |
| `SHACO-FORGE-DOCUMENT-RULES.md` | 文档创建/更新/关闭规则 | ACTIVE | 修改任何权威文档前 |
| `SHACO-FORGE-CURRENT-STATE.md` | 当前唯一运行状态摘要 | ACTIVE | 每次执行前 |

## 3. Product

| Document | Role | Status |
|---|---|---|
| `SHACO-FORGE-PRODUCT-VISION.md` | 长期产品方向 | DRAFT-FROZEN-BASELINE |
| `SHACO-FORGE-VERSION-ROADMAP.md` | 1.0/1.1/1.2/1.3 路线 | DRAFT-FROZEN-BASELINE |
| `SHACO-FORGE-V1.0-MASTER-GOAL.md` | V1.0 完成定义 | ACTIVE |
| `SHACO-FORGE-UI-DESIGN-SPEC.md` | Shaco Forge UI Single Source of Truth / V1.0 UI baseline and V1.1–V1.3 extension direction | ACTIVE |

UI implementation / visual decisions must read `SHACO-FORGE-UI-DESIGN-SPEC.md` when relevant.

## 4. Architecture

| Document | Role | Status |
|---|---|---|
| `SHACO-FORGE-SYSTEM-ARCHITECTURE.md` | 当前已接受总体架构 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md` | Desktop / Worker 权责边界 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md` | Harness Host/Client/Connection 边界 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-DATA-OWNERSHIP.md` | Harness 与 Shaco 数据所有权 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-SECURITY-MODEL.md` | 当前威胁模型基线 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-V1.0-TECHNICAL-IMPLEMENTATION-BASELINE.md` | V1.0 production technology/runtime/toolchain implementation baseline | ACTIVE / OWNER_ACCEPTED |
| `decisions/ADR-*.md` | 已接受架构决策 | ACTIVE |
| `decisions/ADR-0008-TYPESCRIPT-ELECTRON-NODE-PRODUCTION-BASELINE.md` | Accepted V1.0 primary language/runtime and just-in-time native-helper decision | ACCEPTED |

## 5. V1.0 Plan

| Document | Role | Status |
|---|---|---|
| `SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md` | P0→P8 全路线 | ACTIVE |
| `V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-CONTRACT.md` | Slice 1B authenticated physical carrier and real Client ↔ Host implementation Contract | CLOSED / BASELINE FROZEN |
| `V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-CONTRACT.md` | Slice 1C embedded real AppWebEntry/Harness user-loop Architecture Contract | CLOSED / BASELINE FROZEN |
| `P0-UPSTREAM-BASELINE.md` | P0 正式 Contract | CLOSED / PASS; Independent Closure Audit PASS (AUDIT-004B); `ALLOW_P0S = YES` |
| `P0S-FEASIBILITY-SPIKE.md` | P0.S Spike Contract | CLOSED / PASS; P0.S-8 result `V1_PRODUCT_ARCHITECTURE_FROZEN`; V1 implementation ready but not started |
| `SHACO-FORGE-V1-PRODUCT-ARCHITECTURE-PLAN.md` | V1 Product Architecture Plan | `V1_ARCHITECTURE_PLAN_ONLY`; Final Gate external review supplied by Owner is PASS; P0.S-8 freeze not executed |
| `P0S-6-MINIMAL-EXECUTION-CONTRACT.md` | Historical P0.S-6 bounded Runtime execution Contract | FROZEN / OWNER_APPROVED; `P0S6-MEC-20260903-01`; EXHAUSTED_INCONCLUSIVE after two physical attempts; grants no current execution authority |
| `P0S-6-DEPENDENCY-READINESS-RECOVERY-CONTRACT.md` | Frozen P0.S-6 Dependency Readiness Recovery Contract | FROZEN / OWNER_APPROVED; `P0S6-DRRC-20260904-01`; execution authority is exhausted after one invocation; final readiness is INCONCLUSIVE at `NPM_CI / EINTEGRITY`; grants no retry, lockfile correction, Runtime, Global Physical Attempt #3, or P0.S-7 authority |
| `P05-COMPATIBILITY-VERSION.md` | P0.5 Compatibility Contract 候选 | READY-FOR-FREEZE-AFTER-P0S |
| `P1-SYSTEM-CONTRACT.md` | P1 骨架 | NOT-DETAILED |
| `P2-HOST-WORKER.md` | P2 骨架 | NOT-DETAILED |
| `P3-CONNECTION-CARRIER.md` | P3 骨架 | NOT-DETAILED |
| `P4-DESKTOP-CLIENT.md` | P4 骨架 | NOT-DETAILED |
| `P5-FEATURE-PARITY.md` | P5 骨架 | NOT-DETAILED |
| `P6A-DURABILITY-RECOVERY.md` | P6A 骨架 | NOT-DETAILED |
| `P6B-PLUGIN-COMPATIBILITY.md` | P6B 骨架 | NOT-DETAILED |
| `P7-PACKAGING-SECURITY-UPGRADE.md` | P7 骨架 | NOT-DETAILED |
| `P8-FINAL-ACCEPTANCE.md` | P8 骨架 | NOT-DETAILED |

Historical P0.S-6 governance authority:

- `P0S6_DRRC_CONTRACT_ID = P0S6-DRRC-20260904-01`
- `P0S6_DRRC_OWNER_DISPOSITION_ID = P0S6-DRRC-OD-20260904-PS765-01`
- `P0S6_PREPARATION_ID = aa96b746-eeca-4a65-a846-ecf5c753e6ab`
- `P0S6_DRRC_STATE = EXHAUSTED_INCONCLUSIVE`
- `P0S6_DRRC_INDEPENDENT_REVIEW = PASS`
- `P0S6_RECOVERY_CONTRACT_PLANNING = COMPLETED`
- `P0S6_DEPENDENCY_PREPARATION = EXHAUSTED`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_USED = 1`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_REMAINING = 0`
- `P0S6_DEPENDENCY_READINESS = INCONCLUSIVE`
- `P0S6_DEPENDENCY_READINESS_FIRST_FAILURE_BOUNDARY = NPM_CI`
- `P0S6_DEPENDENCY_READINESS_FAILURE_CODE = EINTEGRITY`
- `P0S6_FROZEN_LOCKFILE_ENV_PATHS_INTEGRITY_MISMATCH = CONFIRMED`
- `P0S6_ENV_PATHS_CORRECTIVE_INTEGRITY_FROZEN = NO`
- `P0S6_DEPENDENCY_PREPARATION_RETRY = NOT_AUTHORIZED`
- `P0S6_NEW_DEPENDENCY_PREPARATION = NOT_AUTHORIZED`
- `P0S6_LOCKFILE_CORRECTIVE_IMPLEMENTATION = NOT_AUTHORIZED`
- `P0S6_LOCKFILE_INTEGRITY_CORRECTIVE_CONTRACT_PLANNING = AUTHORIZED_BOUNDED_GOVERNANCE_ONLY_CONTRACT_ONLY`
- `P0S6_OFFLINE_REINSTALL_PROOF = SUPERSEDED_BY_FROZEN_IN_PLACE_NODE_MODULES`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`
- `P0S_INBOX_CLIENT_MODULES_PASS = NOT_PROVEN`
- `P0S_CORDIS_OMISSION_PASS = NOT_PROVEN`
- `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`
- `P0S7_ALLOWED = NO`
- `P0S6_DRRC_FREEZE_HEAD_POLICY = COMMIT_CONTAINING_OWNER_APPROVED_DRRC_AND_GOVERNANCE_SYNC`

Historical authorized next step at that recording boundary:

Draft a bounded P0.S-6 Lockfile Integrity Corrective Contract that independently verifies the official env-paths@2.2.1 registry metadata and tarball bytes, derives but does not silently mutate a corrected lockfile, freezes the corrected input identity, and returns for Architecture Owner review.

Do not modify the lockfile, execute npm, prepare dependencies, authorize Recovery Runtime, authorize Global Physical Attempt #3, or start P0.S-7.

### Current P0.S-7 Closure Authority (2026-09-06)

| Document | Role | Status |
|---|---|---|
| [P0.S-7 Final Closure Decision](../04-development-records/P0S-7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-DECISION.md) | Closes the reassessed Controlled Agent Execution Architecture Validation scope and reconciles historical Runtime status | `FINAL_CLOSURE_DECISION` |
| [Roadmap Reassessment Decision](../04-development-records/P0S-ROADMAP-REASSESSMENT-DECISION.md) | Repositions P0.S-7 and P0.S-8; defers Enterprise Runtime capabilities | `ROADMAP_REASSESSMENT_ONLY` |
| [V1 Product Architecture Plan](../03-v1.0-plan/SHACO-FORGE-V1-PRODUCT-ARCHITECTURE-PLAN.md) | Architecture-validation basis and P0.S-8 freeze input | `V1_ARCHITECTURE_PLAN_ONLY` |

```text
P0S7_STATE = CLOSED
P0S7_RESULT = CONTROLLED_AGENT_EXECUTION_ARCHITECTURE_VALIDATED
P0S7_PRODUCT_RUNTIME_EXECUTION = NOT_EXECUTED
P0S7_ENTERPRISE_RUNTIME_VALIDATION = DEFERRED_TO_ENTERPRISE
P0S8_STATE = NOT_STARTED
P0S8_FREEZE_INPUT_READY = YES
V1_IMPLEMENTATION_STARTED = NO
```

The next stage is P0.S-8 V1 Product Architecture Freeze. Freeze Input Ready means
only that the handoff input passed the external Final Gate; P0.S-8 has not started,
no Freeze Decision exists, and V1 implementation has not started.

### Current P0.S-8 and P0.S Closure Authority (2026-09-06)

| Document | Role | Status |
|---|---|---|
| [P0.S-8 V1 Product Architecture Freeze Decision](../04-development-records/P0S-8-V1-PRODUCT-ARCHITECTURE-FREEZE-DECISION.md) | Freezes the sufficient V1.0–V1.3 product architecture and closes P0.S | `FINAL_ARCHITECTURE_FREEZE_DECISION` |
| [P0.S-7 Final Closure Decision](../04-development-records/P0S-7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-DECISION.md) | Architecture-validation predecessor | `FINAL_CLOSURE_DECISION` |
| [Roadmap Reassessment Decision](../04-development-records/P0S-ROADMAP-REASSESSMENT-DECISION.md) | Current scope and Enterprise deferral authority | `ROADMAP_REASSESSMENT_ONLY` |

```text
P0S8_STATE = CLOSED
P0S8_RESULT = V1_PRODUCT_ARCHITECTURE_FROZEN
P0S8_FREEZE_INPUT_READY = YES
P0S8_FREEZE_EXECUTED = YES
SHACO_FORGE_V1_0_P0S = PASS
P0S = CLOSED
P0S8_FINAL_CLOSURE_AUDIT = PASS
P0S_FINAL_CLOSURE_OWNER_ACCEPTED = YES
V1_IMPLEMENTATION_READY = YES
V1_IMPLEMENTATION_STARTED = NO
V1_SLICE_1_ALLOWED = YES
```

P0.5 Compatibility and P1 System Contract remain in the roadmap, but their full
completion is not a blanket prerequisite for the first V1 vertical Slice. A Slice
must explicitly gate only the P0.5/P1 contract it actually requires.

P0.S final closure is accepted. The later Harness-reuse Corrective recorded
`V1-SLICE-1-REAL-HARNESS-USER-LOOP` as its next action; neither the closure
baseline nor the Corrective started it. The newer Technical Implementation
Baseline candidate now gates that Slice behind Independent Review.

## 6. Development Records

| Document/Folder | Role |
|---|---|
| `DEVELOPMENT-LOG.md` | 时间线摘要 |
| `V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md` | Current V1.0 Harness-reuse implementation-scope allocation authority; P0.S remains closed |
| `V1-SLICE-1C-FROZEN-HARNESS-USER-LOOP-SOURCE-CONFIRMATION.md` | Read-only confirmation of Frozen Harness Workspace/Session/Prompt/stream/tool/interaction/provider/public-seam facts; not an implementation result |
| `V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-OWNER-DECISION.md` | Owner-approved bounded one-time corrective Attempt #2; original history immutable; total cap two, no third attempt |
| `V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-IMPLEMENTATION-RECORD.md` | Complete Slice 1C implementation, failures, final live Attempt #2 PASS and regression ledger |
| `V1-SLICE-1C-OWNER-CLOSURE-DECISION.md` | Architecture Owner acceptance, finding dispositions and frozen Slice 1C implementation baseline |
| `V1-SLICE-1C-IMPLEMENTATION-AUTHORIZATION-OWNER-DECISION.md` | Historical pre-execution authority and exact byte-bound Architecture freeze; implementation was not started at that checkpoint |
| `V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-IMPLEMENTATION-RECORD.md` | Slice 1B implementation, lifecycle corrective and historical Executor test ledger; closed baseline Runtime authority |
| `V1-SLICE-1B-OWNER-CLOSURE-DECISION.md` | Architecture Owner acceptance and baseline freeze for internal Step 1B; Slice 1 remains in progress |
| `P0S-8-V1-PRODUCT-ARCHITECTURE-FREEZE-DECISION.md` | P0.S-8 sufficient Architecture Freeze and P0.S umbrella closure authority |
| `P0S-7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-DECISION.md` | P0.S-7 reassessed-scope Final Closure Decision; latest P0.S-7 closure authority |
| `ISSUE-AND-BUG-INDEX.md` | Bug / Incident 索引 |
| `incidents/` | 单个 Bug / Incident 完整记录 |
| `experiments/` | Spike / 实验记录 |
| `lessons/SHACO-FORGE-LESSONS-LEARNED.md` | 可复用经验 |
| `templates/` | Bug / Experiment 模板 |

## 7. Reviews

| Document/Folder | Role |
|---|---|
| `REVIEW-INDEX.md` | 所有 Review 索引 |
| `architecture/` | 架构审计与复审 |
| `architecture/AUDIT-004-INDEPENDENT-P0-CLOSURE.md` | Original Independent P0 Closure Audit (`PASS_WITH_REQUIRED_CORRECTIONS`; closure status now in AUDIT-004B) |
| `architecture/CORRECTIVE-004-P0-CLOSURE-F01-F02-F03.md` | Executor wording record for AUDIT-004 F-01/F-02/F-03 |
| `architecture/AUDIT-004B-P0-CLOSURE-CORRECTIVE-REVIEW.md` | Independent Corrective Re-Review (`PASS`; `P0_CLOSURE_AUDIT = PASS`; `ALLOW_P0S = YES`) |
| `architecture/AUDIT-005-P0S1-INDEPENDENT-REVIEW.md` | Faithful persisted summary of external P0.S-1 Independent Review (`PASS_WITH_REQUIRED_CORRECTIONS`) |
| `architecture/CORRECTIVE-005-P0S1-DOCUMENTATION-F01-F02-F03.md` | P0.S-1 documentation-only F-01/F-02/F-03 corrective record |
| `architecture/AUDIT-005B-P0S1-CORRECTIVE-REREVIEW.md` | Faithful persisted summary of external Corrective Re-Review (`PASS`; Owner may close P0.S-1) |
| `architecture/AUDIT-006-P0S2-INDEPENDENT-REVIEW.md` | Faithful persisted summary of external P0.S-2 Independent Review (`PASS`; Owner accepted constrained disposition and closed P0.S-2) |
| `architecture/AUDIT-007-P0S3-INDEPENDENT-REVIEW.md` | Faithful persisted summary of external P0.S-3 Independent Review (`PASS`; independent Node-driver reproduction with PS7 provenance; Owner accepted constrained disposition and closed P0.S-3) |
| `architecture/AUDIT-008-P0S4-INDEPENDENT-REVIEW.md` | Faithful persisted summary of external P0.S-4 Review and Corrective Re-Review (`PASS`; 146-check equivalent-driver reproduction; Owner accepted `MET_WITH_CONSTRAINT` and closed P0.S-4) |
| `architecture/AUDIT-009-P0S5-INDEPENDENT-REVIEW.md` | Faithful persisted summary of external P0.S-5 Review, Documentation Corrective and Corrective Re-Review (`PASS`; Owner accepted `MET_WITH_CONSTRAINT` and closed P0.S-5; P0.S-6 execution separately gated) |
| `architecture/AUDIT-010-P0S8-FINAL-CLOSURE.md` | Faithful persisted summary of external P0.S-8 Final Closure Audit (`PASS`; Owner accepted; P0.S final closed; V1-SLICE-1 allowed) |
| `architecture/AUDIT-011-V1-TECHNICAL-IMPLEMENTATION-BASELINE.md` | Faithful persisted summary of Independent V1.0 Technical Implementation Baseline Review (`PASS`; Owner accepted; F-01/F-02/F-03 closed during acceptance) |
| `architecture/AUDIT-014-V1-SLICE-1B-INDEPENDENT-IMPLEMENTATION-REVIEW.md` | Corrected formal persistence of the Slice 1B Independent Review (`PASS`; no Blocking Findings; Reviewer provenance and F-05/NF-6 taxonomy corrected; Owner accepted) |
| `architecture/AUDIT-015-V1-SLICE-1C-ARCHITECTURE-CHALLENGE.md` | Faithful persistence of the Slice 1C Independent Architecture Challenge (`PASS`; no Blocking Findings; C-1 through C-7 are non-blocking Contract-content corrections) |
| `architecture/AUDIT-016-V1-SLICE-1C-CONTRACT-TARGETED-DELTA-REVIEW.md` | Faithful persistence of the read-only Slice 1C Targeted Delta Review (`PASS`; C-1 through C-7 Contract-content requirements closed; ready for Owner implementation authorization) |
| `architecture/AUDIT-017-V1-SLICE-1C-INDEPENDENT-IMPLEMENTATION-REVIEW.md` | Formal persistence of the Slice 1C Independent Implementation Review (`PASS`; no Blocking Findings; Owner accepted and froze 1C) |
| `implementation/` | 实现审计 |
| `corrective/` | Corrective 审计 |
| `templates/` | Review 模板 |

## 8. Testing & Acceptance

| Document | Role |
|---|---|
| `V1.0-TEST-MATRIX.md` | 测试矩阵骨架 |
| `V1.0-ACCEPTANCE-MATRIX.md` | 最终验收矩阵骨架 |
| `evidence/` | 阶段证据 |
| `evidence/V1-SLICE-1B-AUTHENTICATED-PHYSICAL-CARRIER-EVIDENCE.md` | Slice 1B redacted Native Carrier, real Client transport and failure-truthfulness Runtime authority; PASS / closed baseline frozen |
| `evidence/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-EVIDENCE.md` | Slice 1C durable redacted same-context real AppWebEntry user-loop evidence; final Attempt #2 PASS / closed baseline frozen |
| `evidence/P0-1-HARNESS-BASELINE-MANIFEST.md` | P0-1 frozen Harness identity (HARNESS_BASELINE_MANIFEST) |
| `evidence/P0-2-WEB-AND-STANDARD-COMPOSITION-MAP.md` | P0-2 Web + standard composition (HARNESS_WEB_COMPOSITION_MAP) |
| `evidence/P0-2-WEB-DUMP-DEFAULT-CONFIG.yml` | P0-2 dump-config diagnostic (not a stable API) |
| `evidence/P0-3-CLIENT-HOST-CONTRACT-MAP.md` | P0-3 Client↔Host business, transport, stream, event, Fetch, boot, reconnect and cancellation census |
| `evidence/P0-4-AUTHENTICATION-AND-TRUST-SURFACE.md` | P0-4 Web/Connection/Client trust architecture, loopback dependencies, failure surface and P0.S trust inputs |
| `evidence/P0-5-CORE-FEATURE-PARITY-MATRIX.md` | P0-5 V1.0 REQUIRED/OPTIONAL/DEFERRED/WEB_ONLY/EXPERIMENTAL/NOT_PRODUCT product capability freeze |
| `evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md` | P0-6 Harness dependency/stability classes, forbidden imports, adapters, and P0.S/P0.5/P1 inputs |
| `evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md` | P0-7 master risk register, P0.S hypothesis/hard gates (F-01/F-02/F-03 wording), fallback branch, and P0.5/P1/P7 inputs |
| `evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md` | P0.S-1 closed Host Profile feasibility evidence; stage PASS with accepted `PROVEN_WITH_CONSTRAINT` disposition |
| `evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md` | P0.S-2 closed Electron Client Boot evidence; stage PASS with accepted `PROVEN_WITH_CONSTRAINT` disposition |
| `evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md` | P0.S-3 closed Local Carrier + Trust evidence; stage PASS with accepted `PROVEN_WITH_CONSTRAINT` disposition; carrier completeness remains pending P0.S-4 |
| `evidence/P0S-4-CONNECTION-FEATURE-COMPLETENESS-EVIDENCE.md` | P0.S-4 closed Connection Feature Completeness evidence; corrective run and independent re-review PASS; stage closes `MET_WITH_CONSTRAINT` while all Spike implementations remain `NOT_PRODUCTION` |
| `evidence/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT-EVIDENCE.md` | P0.S-5 closed Desktop Independence & Reconnect evidence; formal Executor, Independent Review, documentation corrective and Corrective Re-Review accepted; stage closes `MET_WITH_CONSTRAINT`; its historical successor gate did not itself authorize P0.S-6; the later `P0S6-DRRC-20260904-01` preparation authority is now exhausted |

## 9. Handover

| Document | Role |
|---|---|
| `CURRENT-CHECKPOINT.md` | 可恢复 checkpoint |
| `CONTEXT-HANDOVER.md` | 新会话/新 Agent 交接 |

## 10. Supersede Rule

任何文档被新决策取代时：

- 原文不得静默删除历史事实；
- 顶部标记 `SUPERSEDED`；
- 写明 `Superseded By`；
- 新 ADR / Contract 必须反向引用旧文档；
- Archive 仅用于历史整理，不得用 Archive 覆盖当前权威。
