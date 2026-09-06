# P0.S-7-1 EAR-C01 O-01 Source Identity Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Record Date | `2026-09-05` |
| Decision Scope | EAR-C01 O-01：来源角色、实际项目来源边界与 upstream Git identity 处置 |
| Decision Authority | 本轮 Owner 明确指令；本文记录该决定，不生成 Signature 或新执行授权 |
| Existing EAR-C01 Authorization | `P0S7-1-PARTIAL-EXECUTION-AUTHORIZATION-20260905-01` / `OWNER_APPROVED_PARTIAL_SCOPE` |
| Source Role Decision | `CONFIRMED`：upstream 为 REFERENCE_SOURCE；Shaco Forge 为 ACTUAL_PROJECT_SOURCE |
| Input Closure | `BLOCKED` / `INPUT_CLOSURE_COMPLETE=NO` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Current Usable Execution Budget / Invocation | `0 / 0` |
| Deliverable | 仅本来源角色决策记录 |

依据 Owner 本轮明确决定：DeepSeek Harness upstream 目录只是上游能力参考、依赖分析来源和架构输入来源；Shaco Forge 实际 Runtime Source 应位于实际项目目录。本文将这一角色区分记录为已决定事项，不再将 upstream checkout 作为待接受的最终 Shaco Forge 项目来源候选。

## Related Records

| Ref | 本轮读取的相关记录 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-1-INPUT-CLOSURE-RECORD.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-RECORD.md) | `0C227154105F65ACC5E7C545753E7F0A03427E21DDEC2FD2C3F8A3568233F223` |
| R2 | [P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md) | `AA3AA657925F83BBED122B821FF39F765E10C2A4A558DA09D738C60A5B9CDD7A` |
| R3 | [P0S-7-1-INPUT-CLOSURE-OWNER-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-OWNER-DECISION.md) | `C9EF9BB5FBA5DAB626D405FBAB8411418CCC45D78DEF139DB32C337705DFF097` |

本轮读取以上记录的 Source Identity 相关内容以衔接历史。本决策在来源角色与目录候选选择上承接并明确 R3 的 O-01，优先于此前把 upstream 视为待选实际来源的建议；不改写历史文件，不扩大 O-02～O-06 的决定或授权。上述摘要只标识文档字节，不是运行 Evidence 或信任认证。

# 1. Source Role Definition

| Source | 目录 | 已决定角色 | 状态 | 适用含义 |
|---|---|---|---|---|
| DeepSeek Harness upstream | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` | `REFERENCE_SOURCE` | `CONFIRMED` | 用于架构分析、依赖分析和上游能力评估；不是最终 Shaco Forge 项目目录 |
| Shaco Forge | `D:\Project\Shaco-Forge` | `ACTUAL_PROJECT_SOURCE` | `CONFIRMED` | 实际项目目录；未来 Runtime Source、Package Source、Snapshot Source 的唯一候选项目来源根 |

两者的关系为：upstream 的能力、依赖和架构材料为 Shaco Forge 提供参考输入；实际项目的代码、组合设计和后续项目来源边界归属 Shaco Forge。参考关系不等于两个目录具有相同 Git 身份、相同源码树或可互换的发布身份。

这里确认的是 Owner 指定的角色和目录边界。`ACTUAL_PROJECT_SOURCE` 不表示当前目录已经存在完整可用 Runtime、Package 或 Snapshot，也不表示其中任意源码已被批准、冻结或验证。

# 2. Upstream Handling

| Upstream 用途 / 身份 | 决定 | 状态 |
|---|---|---|
| 架构分析 | 作为上游架构与公开入口/组件关系的参考输入 | `CONFIRMED` |
| 依赖分析 | 作为已有 manifest、锁文件声明及依赖关系的参考来源；保留其来源身份限制 | `CONFIRMED` |
| 能力评估 | 作为上游能力、约束和兼容性要求的材料来源；本轮不启动上游或执行能力测试 | `CONFIRMED` |
| 最终 Runtime Source | 不采用 upstream 目录 | `NOT_SELECTED` |
| Package Source | 不采用 upstream 目录 | `NOT_SELECTED` |
| Snapshot Source | 不采用 upstream 目录 | `NOT_SELECTED` |

上游版本、历史 commit、文件 hash 及声明仍可作为带出处的参考材料；不能自动成为 Shaco Forge 的项目源身份、Package Identity 或 Snapshot 身份。后续若项目采用某个上游组件，仍需明确该依赖的来源、版本、字节与适用输入关系；本决策没有复制、导入、安装或冻结任何上游内容。

本轮不修改 upstream，不复制或移动其源码，不把该目录改造为 Shaco Forge 工作目录、构建目录或运行目录，不在其中创建 Runtime、Package 或 Snapshot。

# 3. Shaco Forge Source Boundary

Owner 明确选择 `D:\Project\Shaco-Forge` 作为以下三类来源的**唯一候选项目目录**：

| 未来 Source 类型 | 唯一候选目录 | 已决定范围 | 尚未确认的内容 |
|---|---|---|---|
| Runtime Source | `D:\Project\Shaco-Forge` | 实际 Runtime 的项目来源应归属此目录 | 精确源码集合、适用提交/tree、允许改动、Runtime strategy/组件/ABI、profile/roster/protocol 与实现授权 |
| Package Source | `D:\Project\Shaco-Forge` | 后续 Package 的项目源码与组合来源只能以此项目为候选 | 精确构建输入、工具身份、依赖基线、完整闭包、来源链和 Package 授权 |
| Snapshot Source | `D:\Project\Shaco-Forge` | 后续 Snapshot 所采用的项目源输入只能以此项目为候选 | 精确 Runtime Definition、输入集合、独立信任/Reference、冻结范围及 Snapshot 授权 |

“唯一候选”是项目来源根的选择，不等于当前整个工作树被接受为冻结输入，不自动选择当前 HEAD，不将全部目录内容纳入 Package 或 Snapshot，也不分配工件输出路径。

第三方依赖、宿主工具与独立 Trust/Control 输入仍须有各自明确来源和精确引用。上述项目来源根的选择不把外部文件变成项目自有源码，不要求将独立信任材料复制到项目中，也不豁免任何既有来源、依赖、ABI、环境或信任要求。

## Effect on O-01 and Existing Blockers

| 事项 | 本决策后的状态 | 处置 |
|---|---|---|
| O-01 的 upstream / 实际项目角色区分 | `CONFIRMED` | 本轮 Owner 已明确决定，不再待选 |
| O-01 的唯一候选项目来源目录 | `CONFIRMED` | 选择 Shaco Forge 项目目录；排除 upstream 作为三类最终 Source |
| upstream Git 身份限制（R1 PS-04 / R2 B01-S1） | `BLOCKED` | 保留为参考来源身份的未确认事项，不宣称 Git 问题已修复；不把它误记为 Shaco Forge 仓库的 ownership 故障 |
| Shaco Forge 精确输入身份与完整来源链（关联 B01-S2） | `UNKNOWN` | 目录选择不能替代精确提交/tree/输入集合、允许 patch 与来源关系；本轮未进行项目源认证 |
| O-01 的全部技术输入闭合 | `BLOCKED` | 角色和目录已决定，精确材料仍未闭合；不直接把整个来源 Blocker 标记 CLOSED |
| 其他输入与 Owner 事项 | `BLOCKED` | 本决策不解决 O-02～O-05 的 Runtime/依赖/环境/Trust-Control 缺口；O-06 的未来权限边界不变 |
| 整体 EAR-C01 Input Closure | `BLOCKED` | 未获得整体闭合结论，不写 INPUT_CLOSED 或新增 PASS |

upstream ownership 修复不再被当作“把 upstream 接受为最终 Runtime Source”的必经动作，因为该目录已明确排除为实际项目来源。若某项参考结论仍依赖未确认的上游身份，该项结论继续保留限制；本决策不豁免参考材料的来源真实性要求。

# 4. Git Identity

| Git identity 事项 | 记录 / 决定 | 状态 |
|---|---|---|
| upstream ownership 现象 | R1 PS-04 记录：在 `D:\Project\Shaco-Forge-Upstream\deepseek-harness` 的两个只读 Git 查询返回 `detected dubious ownership`，目录所有者与当时沙箱用户不一致 | `CONFIRMED`：确认既有记录报告过该现象，本轮未重试 |
| upstream 当前 HEAD / clean | 此前查询未取得身份结论；本轮不以版本字符串、历史 commit 或单文件 hash 填补 | `UNKNOWN` |
| safe.directory | 不修改，不添加全局/系统/命令级配置，不使用通配符或环境注入临时放宽信任 | `NOT_AUTHORIZED` |
| Git 安全检查 | 不绕过，不更改所有权/ACL、不提权、不切换用户或复制/重建目录规避检查 | `NOT_AUTHORIZED` |
| Git 修复 / 配置变更 | 本任务是来源角色决策记录，不实施 Git 修复，不更改任何 Git 配置 | `NOT_AUTHORIZED` |
| Shaco Forge 项目身份 | 当前只确认 Owner 指定的项目路径和来源角色；工作区文件范围/文档摘要检查不是源提交或 Runtime 输入认证 | `UNKNOWN`：精确可用源身份仍待相应材料 |

ownership 错误既不证明上游内容恶意，也不允许忽略来源限制；它与两个目录的项目角色是不同问题。明确实际项目目录不构成对 upstream 安全检查的绕过。

# 5. Boundary

| 当前边界 | 状态 / 数值 | 说明 |
|---|---|---|
| 本文状态 | `OWNER_DECISION_RECORD` | 记录已明确的来源角色决定，不是待批准的角色建议 |
| EAR-C01 已有部分授权 | `OWNER_APPROVED_PARTIAL_SCOPE` | 输入准备和分析权限不扩大 |
| P0S7_STATE | `NOT_STARTED` | 不自动进入 P0.S-7 执行 |
| P0S7_ALLOWED | `NO` | 不改变阶段门禁 |
| Execution Budget / Invocation | `0 / 0` | 不申请、预留或消耗 Invocation |
| Retry / Resume / Recovery | `0 / 0 / 0` | 不执行恢复或重试动作 |
| Runtime / 冻结 Runtime Definition Identity | `NOT_AUTHORIZED` | 不创建、不启动、不冻结 |
| Package / Package Identity / Package Feasibility | `NOT_AUTHORIZED` | 不创建、构建、解包或验证 |
| Snapshot / Runtime Snapshot | `NOT_AUTHORIZED` | 不创建或冻结 |
| Binding / Signature | `NOT_AUTHORIZED` | 不创建、修改、签名或读取私钥 |
| Invocation / Launch / Preflight / Driver 执行 | `NOT_AUTHORIZED` | 不调用运行入口或验证工具 |
| EAR-C02～EAR-C05 / Evidence Generation | `NOT_AUTHORIZED` | 不进入其他 Case，不生成运行 Evidence |
| Production Runtime / Deployment / Full Agent Platform / P1 | `NOT_AUTHORIZED` | 均在当前范围外 |

继续继承 Authority Anchor、Execution Snapshot、Trust Root、Snapshot Binding、Owner Signature、Final Preflight、Controlled Invocation、Evidence First、Fail Closed。若精确来源、依赖、环境或信任输入无法确认，停止相应确认及依赖该结论的执行；来源目录决定不替代这些条件。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_ID = P0S7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION-20260905-01
UPSTREAM_SOURCE_ROLE = REFERENCE_SOURCE
SHACO_FORGE_SOURCE_ROLE = ACTUAL_PROJECT_SOURCE
ACTUAL_PROJECT_SOURCE_ROOT = D:\Project\Shaco-Forge
UNIQUE_RUNTIME_SOURCE_CANDIDATE = D:\Project\Shaco-Forge
UNIQUE_PACKAGE_SOURCE_CANDIDATE = D:\Project\Shaco-Forge
UNIQUE_SNAPSHOT_SOURCE_CANDIDATE = D:\Project\Shaco-Forge
UPSTREAM_AS_RUNTIME_SOURCE = NO
UPSTREAM_AS_PACKAGE_SOURCE = NO
UPSTREAM_AS_SNAPSHOT_SOURCE = NO
UPSTREAM_GIT_IDENTITY_CONFIRMED = NO
GIT_CONFIGURATION_CHANGE_AUTHORIZED = NO
O01_SOURCE_ROLE_DECIDED = YES
EXACT_PROJECT_SOURCE_INPUT_IDENTITY_CONFIRMED = NO
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
RUNTIME_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
```

## Performed Work and Unexecuted Items

| 项目 | 本轮内容 |
|---|---|
| 修改文件 | 仅新增 `docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md` |
| 记录内容 | 两个目录的来源角色、upstream 参考用途、实际项目唯一候选边界、Git ownership 限制与 O-01 决定的适用范围 |
| 文档检查方式 | 静态核对五个必需章节、角色/路径/边界字段、引用摘要、UTF-8 无 BOM/中文无乱码和工作区文件前后字节；本文 SHA-256 在最终回复返回 |
| 测试方式 | 未运行测试、项目 Verification、依赖/环境/Runtime 验证工具；静态文档检查不生成运行 PASS |
| 未执行事项 | 未修改代码、Git 配置/safe.directory、upstream、Runner、Manifest、Binding 或 lockfile；未修复/绕过 Git；未复制、移动或导入 upstream；未应用 Candidate；未下载/安装/build/resolve/解包；未创建 Runtime/Package/Definition Identity/Package Identity/Snapshot/Binding/Evidence Records；未配置 Trust/Control、读取私钥或 Signature；未申请/预留/执行 Invocation、Launch、Preflight、Retry、Resume、Recovery；未 Commit、Push |

本次只落地 Owner 已明确的来源角色决策，不创建或执行该角色所指向的未来工件。

