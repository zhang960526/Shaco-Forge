# Shaco Forge Document Map

Status: ACTIVE  
Purpose: 所有 Agent / Reviewer / Developer 的第一入口。

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

## 4. Architecture

| Document | Role | Status |
|---|---|---|
| `SHACO-FORGE-SYSTEM-ARCHITECTURE.md` | 当前已接受总体架构 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md` | Desktop / Worker 权责边界 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md` | Harness Host/Client/Connection 边界 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-DATA-OWNERSHIP.md` | Harness 与 Shaco 数据所有权 | ACTIVE-PRE-P1 |
| `SHACO-FORGE-SECURITY-MODEL.md` | 当前威胁模型基线 | ACTIVE-PRE-P1 |
| `decisions/ADR-*.md` | 已接受架构决策 | ACTIVE |

## 5. V1.0 Plan

| Document | Role | Status |
|---|---|---|
| `SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md` | P0→P8 全路线 | ACTIVE |
| `P0-UPSTREAM-BASELINE.md` | P0 正式 Contract | IN_PROGRESS (P0-1 PASS, P0-2 PASS) |
| `P0S-FEASIBILITY-SPIKE.md` | P0.S Spike Contract 候选 | READY-FOR-EXECUTION-AFTER-P0 |
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

## 6. Development Records

| Document/Folder | Role |
|---|---|
| `DEVELOPMENT-LOG.md` | 时间线摘要 |
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
| `implementation/` | 实现审计 |
| `corrective/` | Corrective 审计 |
| `templates/` | Review 模板 |

## 8. Testing & Acceptance

| Document | Role |
|---|---|
| `V1.0-TEST-MATRIX.md` | 测试矩阵骨架 |
| `V1.0-ACCEPTANCE-MATRIX.md` | 最终验收矩阵骨架 |
| `evidence/` | 阶段证据 |
| `evidence/P0-1-HARNESS-BASELINE-MANIFEST.md` | P0-1 frozen Harness identity (HARNESS_BASELINE_MANIFEST) |
| `evidence/P0-2-WEB-AND-STANDARD-COMPOSITION-MAP.md` | P0-2 Web + standard composition (HARNESS_WEB_COMPOSITION_MAP) |
| `evidence/P0-2-WEB-DUMP-DEFAULT-CONFIG.yml` | P0-2 dump-config diagnostic (not a stable API) |

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
