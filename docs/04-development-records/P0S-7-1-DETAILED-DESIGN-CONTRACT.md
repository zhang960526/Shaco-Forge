# P0.S-7-1 Detailed Design Contract

| Field | Value |
|---|---|
| Design Contract ID | `P0S7-1-DETAILED-DESIGN-CONTRACT-20260905-01` |
| Document Type | `DETAILED_DESIGN_CONTRACT` |
| Status | `DESIGN_ONLY` |
| Design Date | `2026-09-05` |
| Design Role | Shaco Forge P0.S-7-1 Detailed Design Contract Architect |
| Parent Planning ID | `P0S7-ARCHITECTURE-PLANNING-20260905-01` |
| Parent Planning / Architecture Review | `COMPLETED / PASS`，依据本次用户输入；不表示本文已获独立审查 |
| Current Deliverable | 仅本 Markdown 详细设计合同 |
| Implementation / Execution Authorization | `NOT_AUTHORIZED` |
| Current Authorized Execution Budget | `0` |

本文中的 schema、身份、步骤、预算、状态机和验收场景均是未来合同要求。没有创建对应 Runtime、Package、Snapshot、Binding、Manifest、Invocation 或执行证据；没有冻结实物、签名、启动、验证或批准下一阶段。

# 1. Design Scope

## 1.1 目标与不可越过的边界

P0.S-7-1 **只设计 Runtime Controlled Execution，不实现**。将已完成的 Architecture Planning 转为可审查的身份、快照、完整性、启动、证据和恢复合同，落实 SF-7-01～SF-7-05。本文的 MUST / 必须是后续实现和执行的验收义务，不是当前执行命令。

继承 P0.S-6 的 Authority Anchor、Execution Snapshot、Trust Root、Snapshot Binding、Owner Signature、Final Preflight、Controlled Invocation、Evidence First、Fail Closed Execution。继承约束，不迁移其公钥用途、Snapshot、签名、Invocation、执行预算或历史 PASS。P0.S-7 需要独立的批准链。

```text
DESIGN_CONTRACT_STATUS = DESIGN_ONLY
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S7_STATE = NOT_STARTED
P0S7_AUTHORIZATION = NOT_AUTHORIZED
P0S7_ALLOWED = NO
P0S8_STATE = NOT_STARTED
```

P0.S-6 Candidate 继续为 `generated_not_applied`，source / DRRC lockfile 保持原状。H-05、H-20 仍为 `NOT_PROVEN`；Runtime 从未因 P0.S-6 关闭而获准。本文不重新打开 P0.S-6，不修改既有治理状态，不宣称全局 P0.S PASS，不提前冻结 P0.5、P1 或 P0.S-8。

## 1.2 设计依据与优先级

| Ref | 依据 | 本文采用的约束 |
|---|---|---|
| B0 | 本次用户任务文本及其中 Architecture Review Findings | 当前设计授权、九章要求、SF-7-01～05 和禁止事项；高于规划中本次已被细化的术语 |
| B1 | [Architecture Planning](P0S-7-ARCHITECTURE-PLANNING-DECISION.md) | Runtime 架构、阶段边界、Hard Gate、输入缺口 |
| B2 | [Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | 单向身份依赖、Manifest 不自信任、独立 Reference、实际 Binding 入口、冻结状态与运行事实分离 |
| B3 | [Snapshot Binding Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-BINDING-CONTRACT.md) | Anchor + Snapshot + Binding + 有界 Invocation，先认证验证器，再依赖其检查 |
| B4 | [Trust Root Selection](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-SELECTION-DECISION.md) | Ed25519、精确 Payload bytes、独立选定 Approval / Reference；历史准备状态不当作当前状态 |
| B5 | [Final Closure](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md) 与 [Latest Final State](../00-governance/SHACO-FORGE-CURRENT-STATE.md#p0s-6-technical-validation-extension-final-closure-state-2026-09-05) | P0.S-6 最终状态优先于早期准备和阻断记录 |
| B6 | [Roadmap Reconciliation](P0S-ROADMAP-RECONCILIATION-DECISION.md)、[Feasibility Spike](../03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md)、[Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md) | Packaging 与受控执行并列，后续基线边界 |
| B7 | [Dependency & Stability Matrix](../06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md) | 固定 Harness、Windows/native、Node engines、插件及公开入口约束 |

B0 原文位置为用户提供的附件 `C:/Users/18902/.codex/attachments/c0881683-ea57-43a2-906a-0439051d4d43/pasted-text-1.txt`。仓库内未检索到独立的 SF-7 Review 文件；五项 Finding 和父级 Review PASS 依据 B0 记录，不虚构审查工件、Reviewer 签名或本文审查通过结论。

下表仅标识本次读取的设计输入字节，不是 Runtime 冻结或信任根；使用工作区当前文件，不用 HEAD 旧字节覆盖已有修改。

| Input | Bytes | SHA-256 |
|---|---:|---|
| B0 任务文本 | 6200 | `1CD7EDAD6DE352016F588EC0EF40A244B2F30B25285B2C273BD0E4E909E1C82D` |
| B1 Architecture Planning | 52261 | `9FCD637A922B25BCDA7B1F169F9CF9F06EE8754720EFC70D51992E2EA8665BA9` |
| B2 Lessons Learned | 11824 | `71E974AB17068FA0920A58B4E1D1BF2458D78633537E25C16666AD9562EC3349` |
| B3 Snapshot Binding Contract | 12883 | `2624EC554DF4019144D7B82EDE01497F5A3F4515CBBDD8E442FE35D832E2AA2E` |
| B4 Trust Root Selection | 16514 | `BF7C1395C9D1EE021539F46D9D1A5EECEB338A60A328CCEB273848409C5303B` |
| B5 Final Closure | 8456 | `700020985AFC734F8ECD5C229AEE4EFC489C42A930A60611471D9FE4E755C969` |
| B5 Current State | 31321 | `6A7EC91606362EF16409AF8F5E76E5CEF04DD8C6E594AAE3DDDF24117E486F17` |
| B6 Roadmap Reconciliation | 8512 | `E3ABBC3304A158D4E193EB9904269DC8CEC13E56228160DDCDEA8C5B8CF3B8B0` |
| B6 Feasibility Spike | 44008 | `FB9C757F59EE201A92F51401953F006A9DE0DF4DA74BF36025D89933639C1295` |
| B6 Development Map | 15533 | `97A955CDC94B7E9DE027F43F7AC696FAE5086024CCA719E842D80532B28AC954` |
| B7 Dependency & Stability Matrix | 57617 | `C949B32C407F41578D60FEF3D1ABF4A7CFD3B3D75ABC7EA0BC51D8E5116A950C` |

B6/B7 的 bytes 与 SHA-256 在本次 R-01 Hygiene 修正中按工作区实际文件补录，仅完善设计输入溯源，不改变设计内容或授予执行权限。

## 1.3 Architecture Review Finding 处置

| Finding | 详细设计决策 | 主要章节 / 验收 |
|---|---|---|
| SF-7-01 | FROZEN_INPUT、RUNTIME_FACT、REFERENCE 三域；Invocation 预留身份与实际执行分开；禁止 runtime fact 进入 signed snapshot | §2～3；AC-04、AC-05 |
| SF-7-02 | Definition 是配置语义的唯一权威；Snapshot 只选择并固定输入；Binding 只认证其精确字节，禁止双向依赖及重复权威字段 | §2.3、§3、§4；AC-04 |
| SF-7-03 | 将 Declared Graph、Actual Closure、Inventory 映射到同一节点/边/文件域，逐项 hash 验证并阻断隐藏加载 | §5.2～5.3；AC-03、AC-10 |
| SF-7-04 | Frozen Archive → 独立 Preparation Invocation → Evidence → Byte Verification → Runtime Payload；不允许 silent unpack | §5.4；AC-06 |
| SF-7-05 | 业务组件固定称 DeepSeek Harness；验证工具固定称 Runtime Validation Driver；source 分别登记 | §6.1、§7；AC-14 |

这里的“处置”表示设计已给出约束和验收方法；Finding 的独立审查关闭与运行证据结论仍待后续相应角色产生。

# 2. Runtime Identity Model

## 2.1 Identity Domain

| Domain | 定义 | 冻结 / 签名规则 | 示例 |
|---|---|---|---|
| `FROZEN_INPUT` | 在对应执行边界前定型、审查并批准的输入；具有唯一语义所有者 | 可以纳入 signed snapshot；任何改变产生新内容身份和受影响下游链 | Package descriptor、Runtime Definition、Invocation Plan、策略、输入 Manifest |
| `RUNTIME_FACT` | 预检、准备或运行时观察/生成的事实；预先不知道其真实值 | 仅写 Evidence / ledger / lifecycle record；不得写入 signed snapshot 或回填冻结文件 | PID、process start time、instanceId、generation、实际 SID/路径、READY、已用预算、解包结果 |
| `REFERENCE` | 指向其他对象的有类型引用；不复制目标字段的语义权威 | 在冻结输入中仅引用已冻结输入；运行证据可引用已完成的事实；引用本身不授予执行权 | packageRef、definitionRef、snapshotRef、evidenceRef、FieldRef |

“冻结后的运行证据”仍是 RUNTIME_FACT，不因计算 hash、独立审查或签名归档而成为本次或下次 signed Runtime Snapshot 的输入字段。恢复批准可以在独立治理记录中关联其 Evidence Reference，但 Runtime Snapshot 不包含事实对象或其间接嵌入。Invocation Plan 仅可携带恢复关联标签 `recoveryCaseId`，由外部批准解析父失败，不能把父失败事实经 Reference 偷渡进 Snapshot。

字段按语义分类。把 `pid` 改名为 `processToken`、把启动时间放入 metadata、把 runtime facts 放入被 Snapshot 引用的文件，均不改变禁止规则。预期环境约束与实际环境观测必须用不同类型和不同存储对象。

## 2.2 五类身份及生命周期

| Identity | 类型 / 身份规则 | 生命周期 | 是否冻结 | 是否运行时生成 | 是否进入 Evidence |
|---|---|---|---|---|---|
| Package Identity | FROZEN_INPUT；`packageRef` 是 package descriptor 精确字节的 ContentRef；`packageId`、version 仅为标签，不代替内容身份 | 一个完整归档、payload 清单和构建输入组合；任一变化即新身份 | 是，准备使用前冻结 | 否；在独立获准构建后定型 | 是，记录 expected / observed Ref；未认证对象仅记 claimed |
| Runtime Definition Identity | FROZEN_INPUT；`definitionRef` 是定义文件的 ContentRef；`definitionId` 为标签 | 一个包上确定的 Worker 策略、composition、入口和权限组合；配置变化产生新 Definition | 是，Snapshot 前冻结 | 否 | 是，经 Snapshot 引用链解析 |
| Runtime Snapshot Identity | REFERENCE；`snapshotRef = sha256:<精确 signed payload 字节摘要>`，目标对象是 FROZEN_INPUT | 一份确定 Definition、Invocation Plan、输入集合及治理 Anchor 的执行快照；新 Invocation 产生新 Snapshot | Payload 冻结；Ref 在其后计算 | 否 | 是；必须区分预期、观察与认证结论 |
| Runtime Instance Identity | RUNTIME_FACT；instanceId + generation + PID + processStartTime + authenticated endpoint；关联 Package / Snapshot / Invocation | 从新物理 Worker 的创建到其退出/对账；Desktop attach 不创建新 Worker 身份 | 不进入输入冻结；事实以追加记录保存 | 是；instanceId 在获准启动时分配，PID/start time 由 OS 创建后观察，generation 原子递增 | 是；未创建为 null + 原因，未知为 UNKNOWN，不能虚构零值 |
| Invocation Identity | FROZEN_INPUT 的 Invocation Plan + RUNTIME_FACT 的 Invocation Ledger，分别存储；`invocationId` 是事先预留的唯一标签，`invocationPlanRef` 固定计划字节 | 预留 → 批准 → 一次有界尝试 → 终态；拒绝、过期或消费后不得复用 | Plan 冻结；Ledger 不冻结为输入 | ID/Plan 在执行前生成；attempt/消费/结果仅执行时产生 | 是；所有 evidence 必须关联 invocationId 或尚未分配时的 requestId |

`invocationId` 不是 PID 或运行实例 ID。未来预留 ID 不代表 Invocation 已开始；本次不预留任何运行 ID。Definition 可用于多份经新授权的 Snapshot，同包不继承上次的 launch authority。Runtime Instance 记录始终引用原启动 Invocation，恢复的新 Invocation 通过外部 recovery record 连接旧失败。

## 2.3 单一字段权威与依赖方向（SF-7-02）

| 唯一语义所有者 | 拥有的权威字段 | 下游允许的表达 |
|---|---|---|
| Package descriptor / payload inventory | archive 格式、字节数、SHA-256；组件实际版本、平台、ABI 声明、角色、文件路径、长度、SHA-256；构建来源和闭包材料引用 | Definition/Snapshot 仅用 ContentRef、组件 role ID 或 FieldRef 访问，不再维护一份可覆盖的 archiveHash / Node version / 文件清单 |
| Runtime Definition | runtimeStrategy、公开入口 role、argv 模板、composition/profile、静态 plugin roster 选择、Client/Carrier 协议要求、environment/permission/path/child/network policy | Snapshot 用 definitionRef 及指向其字段的 FieldRef；不再拥有第二份 execPath、argv、权限或依赖选择 |
| Invocation Plan | kind、phase/scenario、预留 ID、允许操作、各类有限预算、deadline、输入根与证据根约束、authorityScopeId、recoveryCaseId / launchGroupId（如适用） | Snapshot 用 invocationPlanRef；实际参数/路径/用量落 Evidence，不能覆盖 Plan |
| Runtime Snapshot | schema / recordType、最终 payload status、适用设计合同引用、Authority Anchor、上述输入引用的选择、Frozen Input Manifest 的引用 | Binding 精确承载这些 bytes；Approval 独立选定其 Ref；不复制快照内容再赋予覆盖权 |
| Independent Owner Approval / Activation | 批准人的权限、用途、确切 key/validator/Approval 身份、expected Snapshot Ref、实际 Binding 入口、允许时窗/撤销及生效状态 | 仅经外部受信渠道选择；Plan 中的 authorityScopeId 只是待匹配标签，不能自授权 |
| Instance / Invocation Ledger / Evidence | 实际进程、路径、时间、generation、gate 结果、预算消费、状态与故障事实 | 只能引用输入身份，不能修改输入权威 |

```text
Frozen package inputs → Package Identity → Runtime Definition
Runtime Definition + Frozen Invocation Plan + Frozen Input Manifest
  → Runtime Snapshot（精确 Payload）→ Snapshot Reference
  → Owner Signature → Snapshot Binding → 外部精确批准 / Activation
  → Final Preflight → Invocation facts → Runtime Instance / Evidence
```

Definition 不含 Snapshot/Binding/Approval/Evidence 摘要；Snapshot 不含自身 Ref 或后生成 Binding/Approval 摘要；Binding 不回写 Definition。包内 controller 在 package 冻结前完成，不能为填入 packageRef 而修改自身字节。角色绑定通过外部认证输入传入，不能绕过受信入口。

同一值可能作为引用摘要或 Evidence 的 expected 值出现，但没有第二个写入者或覆盖顺序。字段冲突即 `SCHEMA_CONFLICT / INTEGRITY_BLOCKED`，禁止“Snapshot 优先”“最后一个字段覆盖”或 silent merge。

## 2.4 版本、组件和策略的设计选择

首个设计候选为 **bundled Node sidecar + Windows x64 + 两个核心长运行进程 Desktop / Worker**。Worker 就是运行 DeepSeek Harness CLI Host 的进程，不另添常驻 Worker daemon。备选 Electron Worker 需要新策略提案和授权，失败时不能自动切换。

| 项目 | 本文的候选选择 / 固定依据 | 后续实物冻结要求 |
|---|---|---|
| DeepSeek Harness | `@deepseek-ai/dsh@0.1.2-alpha.1`；commit `cd5ef8148158c3a752a658978873241fdf8e2bbc`；发布 CLI `lib/bin.js` | 从固定来源形成可追溯发布字节，记录构建输入、入口及 production closure；不得调用内部 boot 或 src |
| Node sidecar | 设计候选 `22.19.0` / win32 / x64，取自 B7 已允许的明确版本点 | 独立准备记录选定官方版本工件、来源认证、archive / node.exe hash、精确 ABI / N-API；本设计没有下载或验证该工件 |
| Electron Desktop | 设计候选 `35.7.5` / win32 / x64，参考[既有实验声明](experiments/P0S-6-MINIMAL-CLIENT-MODULES/package.json) | 独立批准该候选及其精确分发字节；实验声明不是批准或 packaged 兼容证据 |
| Fresh Windows | 设计目标 Windows 11 x64，24H2 / build family `26100`，普通当前用户 | fixture record 在执行前固定完整 build + revision、镜像身份、SID 约束和 host inventory；不允许只凭 family 字符串放行 |
| Host PowerShell | 首个候选 Windows PowerShell 5.1；精确系统路径由批准 fixture 固定 | 校验具体文件/平台来源、版本和哈希；7.x 另设输入与场景，不回退、不下载 |
| Package 格式 / 布局 | 单一 ZIP 分发候选；payload 使用真实磁盘文件；首轮不使用 asar 或自解压安装器 | 冻结归档工具/构建脚本、布局和所有入口；未来使用 asar 需修改 Definition/准备合同并审查全部 unpack 映射 |
| Native / helper roster | B7 的 koffi、静态 node-pty、node-addon-require-builtin、rg、runner、适用 picker worker；JSONL 为持久化基线 | 每项登记精确版本、Node 或 Electron 所属 ABI 域、角色、路径、hash、加载/启动方式；不能把“未调用 PTY”作为省略静态依赖理由 |

上述候选是受控 Spike 的设计输入选择，不声称最新、安全支持状态、平台实物存在性或兼容性已验证。Node/Electron 的精确源工件 hash、完整 Windows revision、包构建工具和新 dependency baseline 尚未提供，按 §9.4 阻断相关准备/执行，禁止捏造 SHA-256、沿用失败缓存或把候选视为可运行成品。

REQUIRED Host/Client、Shaco carrier/adapter、tool-cordis、cordis-host-runner、cordis-client-runner、ui-cordis 必须逐项在 roster 中标 `INCLUDED_REQUIRED / INCLUDED_OPTIONAL / OMITTED_WITH_DISPOSITION`，并绑定依据。Dynamic Cordis 和外部插件发现/下载/热加载默认禁用。H-05/H-20 缺证据时完整 Desktop 可行性不能通过；若要 Worker-only 结论，必须预先有独立范围批准，不能在 Desktop 失败后改名缩小结果。

# 3. Snapshot Schema

## 3.1 数据类型与字节规则

这里是规范性字段设计，不创建 JSON Schema 或 Snapshot 文件。

| Type | 约束 |
|---|---|
| ContentRef | `kind`、规范 locator、精确非负 byteLength、SHA-256；摘要固定为 64 位大写十六进制，文本引用为 `sha256:<SHA256>`；先比对 bytes 再读取语义 |
| FieldRef | 指向已认证 ContentRef 和固定字段路径；仅导出目标拥有的值，不允许内联 override；不存在/类型不符/引用循环即拒绝 |
| ArtifactEntry | 唯一 role ID、namespace、规范相对路径、byteLength、SHA-256、文件类型、用途；来自唯一权威 inventory，Snapshot 通过 Ref 选择 |
| EnvironmentConstraint | 预期 platform/arch、fixtureRef、root/path/ACL/token/env/network/child policy；实际 SID、解析结果、文件句柄和运行时间不属于该类型 |
| Frozen Invocation Plan | §2.3 的有界输入；kind 为 `PREPARATION / RUNTIME_LAUNCH / RECONCILIATION / CONTROL_ACTION`；每种 kind 单独批准、单独预算、单独消费 |

未来冻结的 JSON 类输入统一严格 UTF-8 without BOM、LF，无重复 key、无未知字段、无非有限数、无注释；排序规则及 schemaVersion 在生产者定型前固定。Hash 与 Ed25519 签名始终使用保存的原始 bytes，禁止 parse 后重序列化再验签。BOM、空白、换行或状态变化均产生新身份。已有 P0.S-6 文件不重编码、不迁移 schema。

## 3.2 Runtime Snapshot 顶层字段

| Field | Type / Domain | 必需性与约束 |
|---|---|---|
| schemaVersion | 固定版本 `1` / FROZEN_INPUT | 未识别版本拒绝，不自动迁移 |
| recordType | 固定 `P0S7_RUNTIME_EXECUTION_SNAPSHOT` / FROZEN_INPUT | 区分准备快照、Runtime 快照、Approval 与 Evidence，不允许跨用途重放 |
| status | 冻结状态 / FROZEN_INPUT | 可执行版本必须为 `OWNER_APPROVED_AND_FROZEN`，在签名前定型；只是必要字段，不自证批准；本文状态仍为 DESIGN_ONLY |
| designContract | ID + ContentRef / REFERENCE | 指向未来采用的本合同精确版本；本文自身不回填自身摘要 |
| authorityAnchor | 完整不可变 Git object identity / FROZEN_INPUT | 独立批准；构建源提交需等于或后代于 Anchor；部署到无 Git 的 fresh Windows 时用受信构建来源记录承载该关系 |
| artifactIdentity | Package descriptor ContentRef / REFERENCE | packageId、version、platform、arch 由 descriptor 解析，不能只签包名 |
| packageHash | FieldRef / REFERENCE | 明确指向 artifactIdentity 的 archive SHA-256 字段；逻辑 Snapshot 必含包 hash，物理字段不维护第二份权威数值 |
| runtimeDefinition | ContentRef / REFERENCE | 唯一的 Definition；其 schema 不能含 Runtime Snapshot 或 Binding 反向引用 |
| invocationPlan | ContentRef / REFERENCE | 唯一、未使用且 kind=RUNTIME_LAUNCH 的计划身份；不得含 ledger、actual start/end、budget used、process state |
| dependencyClosure | FieldRef / REFERENCE | 指向 Package 的 declaredGraphRef、actualClosureRef、payloadInventoryRef 和 external inventory constraints；三者均有精确 hash |
| environmentConstraints | FieldRef / REFERENCE | 指向 Definition 的环境策略及 Plan 的 fixture/root 选择；记录约束而非预检观测 |
| componentInventory | Frozen Input Manifest ContentRef / REFERENCE | 认证本次所有控制/验证/策略/身份工件；包内文件通过 payloadInventoryRef 完整展开；外部输入单列 |

这份 Snapshot 是“签名 Payload 本体”。Snapshot Identity 是其原始 bytes 的下游摘要，**不另设一份重复 Runtime Snapshot JSON 与 Binding Payload JSON 的双重权威**。Envelope 可用 base64 承载同一份 bytes，仍须保持 byte-for-byte 相同。

准备、只读对账和现存实例控制分别使用独立 recordType `P0S7_PREPARATION_EXECUTION_SNAPSHOT`、`P0S7_RECONCILIATION_EXECUTION_SNAPSHOT`、`P0S7_CONTROL_ACTION_SNAPSHOT`，与各自 Plan kind 一一匹配；不得用 Runtime Snapshot 跨用途放行。其共同冻结内容为 contract、Anchor、工具/策略/Plan ContentRef，准备另含 archive/expected inventory；对账/控制只含范围和动作约束。实际父失败、目标 PID/start-time/instance/generation 由外部动作批准选定，并在动作前重新认证，不能放入这些 signed snapshots 或其输入引用。ATTACH / CONTROLLED_STOP 使用 CONTROL_ACTION；NEW_LAUNCH 仍使用 RUNTIME_LAUNCH。

## 3.3 Component Inventory / Manifest 合同

Frozen Input Manifest 必须完整覆盖：Package descriptor、archive 引用、payload inventory、Declared Graph、Actual Closure、Runtime Definition、Invocation Plan、profile/composition、plugin roster、permission/env/path/network/child policies、launch controller、独立 Runtime Validation Driver、evidence collector 与所需外部 host prerequisites。复用文件以同一 Ref 和不同 role 映射表达；role 不得歧义。

Manifest 的自身 hash 由 Snapshot 的 ContentRef 认证。Manifest 不包含自身、Snapshot、Binding、Owner Approval、执行 ledger、准备结果或 Runtime Evidence 的 hash。Snapshot 引用完整 Manifest；Manifest 可包含 Definition / Plan，但后者不能回指 Manifest。包内清单不能遗漏可解释执行的配置、Client script、DLL、native addon、loader、脚本及 helper。

实际验证应先认证 Manifest bytes，再信任其条目；逐层验证所有引用和实际文件，不能只核对顶层哈希。逻辑展开的同一路径/role/组件版本出现冲突或额外输入时 fail closed。引用目录仅表达允许根，目录内容用规范路径文件集合表达，不能把目录名的 hash 当成目录字节身份。

## 3.4 严禁字段和变更失效规则

signed snapshot 及其全部输入引用中禁止出现 runtime mutable facts：PID、process start-time、instanceId、generation、实测 SID、实际 endpoint、nonce、ready、heartbeat、actual argv/env/cwd、preflight result、consumed/remaining budget、preparation result、实际 closure 观测日志、failure/recovery outcome。`actualClosureRef` 指向准备期形成并审查冻结的**获准依赖解析结果**，不指向运行时实测日志，详见 §5.2。

允许冻结 `expectedPlatform`、root mapping 规则、READY 超时、generation 单调性规则和 endpoint 命名规则；它们不是实际事实。未来 Snapshot 不使用 `NOT_STARTED` 作为可更新运行状态，实例状态仅在 Evidence 中保存。

包或组件改变需新 Package Identity；入口/策略改变需新 Definition；Invocation 或任一输入引用改变需新 Snapshot、Signature、Binding、Owner 批准和 Final Preflight。只有运行事实变化不会触发输入回写，也不授予新启动权。任何执行目标变化使已产生的 preflight decision 立即失效。

# 4. Binding Model

## 4.1 P0.S-6 信任链的继承

```text
Runtime Definition → Runtime Snapshot（exact payload bytes）
  → Snapshot Binding（payload + Owner signature）
  → 独立精确 Owner Freeze Approval / Startup Activation
  → Final Preflight → 有界 Invocation
```

采用 P0.S-6 已选择的 Ed25519 + governance-record-hash 模型：可信公钥、签名有效、独立选中的 Snapshot 三个结论缺一不可。公钥指纹域为 `DER SubjectPublicKeyInfo SHA-256`；Payload digest 与 envelope-file digest 分开命名。P0.S-7 不自动复用 P0.S-6 key 用途或 Anchor；如需复用，必须有明确适用 P0.S-7 的 Owner 决定。

Binding Envelope 的最小字段为 schemaVersion、recordType、canonical base64 payload、canonical base64 Ed25519 signature；key identity 仅用于匹配外部预先选定 key，不能提供可替换公钥。签名覆盖精确 Payload bytes，签名角色由 signed recordType 和 governing contract 限定。Envelope 的说明字段不能覆盖 Payload 的 status、Invocation、Anchor 或输入。

## 4.2 独立批准与 bootstrap

受信入口先从独立 Owner 治理交付渠道固定 bootstrap validator / Runtime Validation Driver 的字节身份与信任配置；该入口不能由待验证 package、普通 argv/env、目录中“最新”文件或 Manifest 指定。启动 Driver 之前先认证 Driver 及其 host prerequisite；不能调用尚未认证的包内 Node 来验证自身。

独立 Owner Freeze Approval 采用与 Snapshot 不同的 signed recordType，并固定：本设计合同身份、P0.S-7 用途、精确 key fingerprint、Anchor、Package/Definition/Invocation 关联引用、expected Snapshot Reference、Binding 正式路径和 envelope digest、validator/collector 身份。批准记录自身的精确身份由外部受信渠道选定，不能靠其自身签名或放在包旁就成为被选中的批准。

Startup Activation 另行固定生效范围、scenario、有效期、撤销状态/离线有效窗口、各预算上限、受控根及对应 Freeze Approval 引用。实际可用权限是批准范围与 Frozen Invocation Plan 的交集，二者不一致即拒绝，不静默裁剪场景。批准不改写 Plan。无法确认批准有效、时钟条件或撤销窗口时 `AUTHORITY_BLOCKED`；离线有效窗口不宣称实时撤销。

运行事实、准备输出证据和恢复父失败可以被独立执行批准关联，但这些下游治理记录不回填 signed Snapshot。尚未提供 key、Approval、Reference 或激活值时，一律缺失即阻断，不能使用占位值通过 Gate。私钥留在 Owner 控制下，不进包、仓库、日志或环境变量。

## 4.3 单向冻结与实际入口

未来冻结顺序为：独立信任基线/Anchor 选择 → 获准准备和构建 → payload 与 archive 定型 → inventory / graph / closure / Package descriptor → Definition、Plan、外部控制工件 → Frozen Input Manifest → 最终 Runtime Snapshot bytes → Snapshot Ref → Owner Signature → Binding → 精确独立审查/Owner Freeze Approval → Startup Activation → Final Preflight。

解包必须先走 §5.4 独立准备授权。Runtime Snapshot 只引用获准期望输入；准备 Evidence 在外部启动批准和预检中核对，不为获得 PID、解包时间或结果而重新回填/签署 Snapshot。

Final Preflight 必须检查真正读取的 Binding 正式路径、原始 bytes、decoded Payload Ref、实际 controller 和实际 spawn 入口。旁路 corrected 文件存在、文档写了批准、Envelope hash 匹配或签名有效中的任一项，均不能替代完整链。Promotion 是独立受控文件交付事件，必须对账其路径和字节；不等同于批准、预检或执行。

## 4.4 Invocation 绑定与反复用

Snapshot 固定 invocationPlanRef；外部批准固定同一 Plan 和 Snapshot；Invocation Evidence 再引用它们。一个 launch Plan 仅允许一个 Runtime physical launch slot，多个启动场景必须有不同 Plan/Snapshot/批准。拒绝请求也使该 request/Plan 进入终态；仍未消费的 Runtime slot 不允许被失败请求自动再次使用。

slot 在 OS spawn 前持久原子消费，spawn 失败也不退还；消费后中断而无 spawn 结果记 `OUTCOME_UNKNOWN`，旧 slot 永久不能复用。并发采用独立的 durable budget ledger 与 Worker lease，不能只依赖 UI 单实例或 PID 文件。准备、验证请求、Runtime 启动、子进程、网络、对账、恢复预算分开；任何记录缺失或所有权不明确即拒绝新的执行。

# 5. Package Integrity Contract

## 5.1 Archive Identity 与 Payload Inventory

| 对象 | 必须冻结的身份 | 核对要求 |
|---|---|---|
| Frozen Archive | package 标签、格式、来源 Ref、精确 archive byteLength / SHA-256 | 整包 hash 基于归档原始 bytes；文件名、版本和下载地址都不是 bytes 身份 |
| Payload Inventory | 每个文件的 namespace、canonical path、type、role、size、SHA-256、所属 component、可读/加载/执行用途；稳定排序 | 枚举整个 payload，逐字节比对；清单之外的文件也必须被检测，不能只遍历清单已有项 |
| Component Metadata | 精确组件版本、platform/arch、ABI/loader 域、来源/build input、entry role、静态配置与插件关系 | 版本或 package.json 自声明不能代替 hash；Node 与 Electron native 域分开 |
| External Inventory | OS/runtime platform 约束、PowerShell、系统 DLL/API 的获准依赖分类与 fixture identity | 明确不在包内；固定系统根/解析规则和具体 fixture，记录实际观测；不能把任意宿主 DLL 归为“系统依赖” |
| Build Provenance | 源 commit/Anchor 关系、源码及锁文件/patch/build script/toolchain 引用、获准构建输入 | 不继承未应用 Candidate；工具精确身份和输出关系由独立准备/构建合同批准 |

首轮使用普通 ZIP 和非 asar 真实布局。inventory 与 Package descriptor 外置于 archive，不能把 archive 自身摘要内嵌 archive；inventory 不含自身 hash。所有源码映射等非执行资源也必须列入 inventory，但未被批准为可加载/可执行的资源不能作为代码使用。

所有路径用 namespace + 规范相对路径表示；分隔符为 `/`，按 Windows 大小写不敏感比较检测别名冲突。拒绝空路径、绝对/UNC/device 路径、`..`、ADS、尾随空格/点、保留设备名、重复成员及大小写碰撞；受控根以下禁止 symlink、junction、reparse point、外部 hardlink 和解析回退。提取前检查 archive 成员，提取后检查实际最终路径/文件类型/链接状态，不能只做字符串前缀检查。真实 root 与 SID 映射在预检 Evidence 中记录。

ZIP 中只有普通文件和明确目录；不允许可执行解压钩子、自解压入口、安装脚本、联网补齐或启动时自动 heal。不得将不受控工作目录、开发 node_modules、用户插件目录、PATH 或全局 cache 加入可加载搜索路径。

## 5.2 Declared Graph、Actual Closure、Inventory 的同域定义

**强制关系：Declared Graph ⊆ Actual Closure ⊆ Inventory；全部需要 hash 验证。** Graph 和文件集合不能直接混比，先定义统一身份与包含投影：

| 符号 | 精确定义 | 身份材料 |
|---|---|---|
| D — Declared Graph | 依赖锁定与显式入口声明所要求的 production 节点/边：imports、exports、动态加载允许表、native/DLL、helper spawn、profile/plugin/Client script | declaredGraphRef；节点使用 namespace、component/source identity、版本、platform/ABI、resolved artifact role；边记录 from/to、kind、条件和依据 Ref |
| A — Actual Closure | 从**最终获准布局**及批准入口/配置解析出的完整可达依赖集合；包含传递依赖、可加载配置、静态 native、Windows helpers 和准许的动态分支 | actualClosureRef；固定 nodes、edges、file membership、分支解析与排除理由；是确定的字节依赖描述，不是运行采样日志 |
| I — Inventory | 全部最终 payload 文件 I_pkg，加上独立列出的获准外部依赖 I_ext；每项均可映射到组件和 Ref | payloadInventoryRef + externalInventoryRef；系统平台依赖用限定 fixture 的平台身份和其文件 inventory 认证，不能用空 hash 通配 |

规范包含关系展开为：`nodes(D) ⊆ nodes(A)`、`edges(D) ⊆ edges(A)`、`files(A) ⊆ I_pkg ∪ I_ext`。包内文件同时必须满足 `observed payload files = I_pkg`，每个共享节点、文件、边端点的身份一致。内部 graph/closure 文件本身也由 SHA-256 认证；边经其所属 graph bytes hash 保护，端点经组件和文件 hash 保护。

D 采用当前 Windows/架构/功能条件实例化后的声明图。被禁用的平台分支和 optional 功能逐项保留排除理由，不允许删除 REQUIRED 依赖来制造包含关系。A 中额外节点必须有批准入口可达性及传递解析依据；不能把一个碰巧在 inventory 中的未知 loader 自动当成批准依赖。I 中不属于 A 的文件必须有明确资源/许可/禁用组件用途并禁止被执行。发现被排除功能实际加载即失败。

Actual Closure 是未来独立准备工作根据字节布局产生的冻结输入，可以进入 signed snapshot；其生成时间、分析日志、工具进程、成功状态以及实际运行的 load trace 均是 Evidence，不能混入 closure 数据。对无法在启动前界定的动态加载，必须给出有限的目标 allowlist 并纳入 A；无法界定则 `DEPENDENCY_BLOCKED`。运行时发现新依赖不能原地扩展 A。

## 5.3 三方核对与失败边界

| 顺序 | 必须核对 | 首失败 / 行为 |
|---|---|---|
| I1 输入真实性 | 外部批准、Package descriptor、archive、D/A/I 的 ContentRef 与原始 bytes | 缺来源/坏签名走 Authority/Integrity 阻断；不信任自声明清单 |
| I2 声明到解析 | D 的节点/边均在 A；相同 source/version/platform/ABI/file membership；每条新增 A 边有批准来源 | `DECLARED_CLOSURE_MISMATCH / DEPENDENCY_BLOCKED` |
| I3 解析到库存 | A 的每个所需文件都在 I；package 部分逐文件 hash 相等；external 部分受批准平台/文件清单约束 | `CLOSURE_INVENTORY_MISMATCH / DEPENDENCY_BLOCKED` |
| I4 库存到磁盘 | 枚举实际 payload 全集；缺失、额外、重复路径、长度和任意文件 hash 不符即拒绝 | `PAYLOAD_INVENTORY_MISMATCH / PACKAGE_BLOCKED` |
| I5 入口到受控解析 | Definition 的 Node/Worker/profile/plugin/helper role 解析到同一获准文件；env/DLL/模块路径无外部注入；§6.4 的写保护持续成立 | `ENTRYPOINT_MISMATCH / INTEGRITY_BLOCKED` |
| I6 运行中关联 | 已获准执行后的模块/native/helper 观察均可关联 A/I 与实际进程；批准加载范围之外的行为在执行/加载前被控制层拒绝 | `UNDECLARED_DEPENDENCY / RUNTIME_FAILED`；保留首失败并 containment |

I1～I5 只能由独立受信工具读文件和解析静态材料，不通过 require/import、执行 Node、加载 `.node`、调用 Harness 来做“预检”。如后续分析工具需要真正执行被测代码，必须归入单独获准的 Runtime 场景，不能宣称是无执行准备。

哈希预检不能单独证明 native loader/系统 DLL 搜索范围已被约束。未来实现必须证明解析路径和加载限制有效；日志仅提供观察，不能替代阻断。没有完整可执行范围控制时，相关场景不能通过，未知依赖不能因为当次 smoke scenario 未触发而被宣称不存在。

## 5.4 独立 Controlled Unpack（SF-7-04）

```text
Frozen Archive
  → Preparation Invocation（独立批准、独立输入快照与预算）
  → Evidence（尝试、提取成员、工具结果和未到达边界）
  → Byte Verification（独立枚举、路径、size、每项 hash、closure 对账）
  → Runtime Payload（仅表示该布局的 bytes 已通过准备核对）
```

| Step | 受控动作和输入 | 必须留下的证据 / 出口 |
|---|---|---|
| U0 Preparation authority | 独立 preparation contract/activation，kind=PREPARATION，冻结 archive、expected inventory、解包工具/host 身份、允许根、资源预算；不引用尚未产生的输出事实 | 批准来源、request/Plan Ref、expected archive/工具/清单身份；缺失则零提取、零 Runtime |
| U1 Pre-unpack gate | 从受信入口认证工具与 archive；检查成员路径、格式、文件数/展开大小上限；建立受保护空 staging 根和 evidence sink | expected/observed hash、成员检查、真实根及权限事实；拒绝时保持输入和原目录 |
| U2 Preparation boundary | 持久原子消费一个 preparation slot，再启动一个已认证解包工具；Runtime launch budget 固定为 0 | ledger 先于工具启动；工具 PID/start-time、成员输出、返回码、错误及耗时只写准备 Evidence |
| U3 Evidence before acceptance | 提取完成或失败后先持久记录结果；partial output 隔离，不原地补文件、不删旧证据 | 提取计数、目标路径、失败边界；无可靠记录不得继续接受输出 |
| U4 Byte Verification | 用已认证工具逐项枚举提取结果并核对 I1～I5 的适用静态条件；包括额外文件、链接、size、hash 和 closure；不执行 payload | 独立 byte-verification Evidence，关联本次 Preparation Invocation；工具 exit=0 不是核对 PASS |
| U5 Payload disposition | 全部核对通过后将该根设为受控只读运行输入，封存准备证据；失败则 QUARANTINED / UNUSABLE | exact payload inventory Ref + 实际根/文件身份 + 保护状态；只得到 `PAYLOAD_VERIFIED`，不启动 Runtime |

若 U5 需要复制/移动到另一运行根，该动作必须预先列在同一准备 Plan，目标仍在已核验授权根内；完成后对最终根再次逐字节核对并记录，不能拿原 staging 的 PASS 掩盖目标替换。默认直接使用受控 staging 根，不隐含安装/promotion。

Runtime 启动批准须关联这次准备的 finalized Evidence Ref；Final Preflight 独立认证它，并重新核对最终输入与保护措施，不能把旧的解包成功日志当作当前 bytes 证明。准备成功不激活 Runtime；失败后不得由 launcher、installer、Driver、Node 或 Harness 进行 silent unpack、补齐或重试。更换 archive、工具、布局或 output bytes 需新准备批准和身份链。

# 6. Controlled Launch Contract

## 6.1 组件职责与 Harness 命名边界

| 名称 | 职责 | Evidence sourceType / 边界 |
|---|---|---|
| DeepSeek Harness | 固定发布的业务 CLI/Host；按公开 profile 组合加载插件；承担 Agent 业务语义 | `DEEPSEEK_HARNESS`；不是启动批准来源，其自报 version/READY 需外部关联 |
| Runtime Validation Driver | 独立受信的预检、场景驱动、预算/进程观察及结果采集工具；可在有界验证窗口内存活 | `RUNTIME_VALIDATION_DRIVER`；替代规划中泛称的 Validation Harness，不能标成 DeepSeek Harness |
| Evidence Collector | 保存原始来源事件、flush、索引与断点事实；可以是 Driver 内部角色 | `EVIDENCE_COLLECTOR`；聚合时仍保留原 producer，不能把转发事件改记为 OS 直接观测 |
| Desktop Main / Supervisor | 受控启动协调、身份 attach、投影和本地 carrier | `DESKTOP_SUPERVISOR`；不能授予新 Runtime 权限、绕过 Driver 或触发隐式 restart |
| Worker control / Carrier | current-user Named Pipe、进程实例关联、generation 和兼容握手 | `WORKER_CONTROL` / `CARRIER`；与 DeepSeek Harness 业务事件分来源 |
| OS observation | 由已认证 Driver/collector 获取的进程、文件、ACL、exit 事实 | `OS_OBSERVER`，同时记录 collector identity、OS 采集机制和被观测 subject |

禁止新记录使用无归属的 `Harness`、`test harness` 或 `source=runtime` 代替上述类型。等价 Driver 需独立版本、hash 和批准；其证据不能声称由原 Driver 或 P0.S-6 原 Runner 原字节产生。本文不修改既有命名、Runner 或历史 Evidence。

## 6.2 启动前 Gate

以下 Gate 必须顺序成立，所有 package 代码执行均位于通过 Gate 后的 launch boundary 之后。Gate 结果本身是 Evidence，不是写回 Snapshot 的字段。

| Gate | 必需检查与关联身份 | 失败状态 / 禁止动作 |
|---|---|---|
| L0 Evidence readiness | 外部已认证 Driver/collector、request/Plan、受保护证据根、fallback sink、可持久预算 ledger、场景容量 | `EVIDENCE_BLOCKED`；不得运行 package 代码 |
| L1 Authority | P0.S-7 独立 activation、Anchor/构建 ancestry、contract/scenario、时窗/撤销、未消费 Plan、全部预算、授权操作 | `AUTHORITY_BLOCKED`；P0.S-6 PASS、本文或规划 PASS 不放行 |
| L2 Snapshot / Binding | 独立 key 和选定 Approval、expected Ref、精确 Payload status/type、签名、正式 Binding 入口及 envelope hash、全部输入链 | `INTEGRITY_BLOCKED`；先认证字节后读取输入声明 |
| L3 Package / Integrity | 准备证据已 finalized 且被批准选中，archive 与最终 payload、D⊆A⊆I、Node/Worker/插件/native/helper 身份、无额外输入 | `PACKAGE_BLOCKED / DEPENDENCY_BLOCKED`；不解包、不安装、不加载探测、不换策略 |
| L4 Permission | SID/非提权上下文、fixture、DSH_HOME/workspace/evidence/control roots、ACL/restricted-token/进程所有权/网络与子进程控制可执行、Worker lease | `PERMISSION_BLOCKED`；不提升权限、不更换可写目录、不降低限制 |
| L5 Boundary / Final Preflight | 实际 exe/argv/cwd/env mapping、文件和父目录保护、授权时窗/剩余预算、实际绑定路径、到 spawn 的一致性 | 全部成立才 `PREFLIGHT_PASSED`；产生一次性短时 decision，不新增权限 |

每一 Gate 记录 expected 值及其批准来源、observed 值及采集来源、首失败原因、后续 `NOT_REACHED`，禁止只记录总布尔值。启动前拒绝时记录 launchAttempted=false；processCreated=0 仅在外部观察足以支持时使用，否则 UNKNOWN。未到 Gate 的输入只能标 claimed，不能当成已认证 identity。

## 6.3 权限和业务边界

| Surface | 强制合同 |
|---|---|
| exe / argv / cwd | 从认证 Definition 按 role 映射到批准根内的真实绝对路径；参数数组、受控 cwd；无任意 shell 拼接、PATH 查找、source/tsx fallback |
| Environment | allowlist 构造；明确 DSH_HOME/TEMP/cwd；拒绝父环境的 NODE_OPTIONS、NODE_PATH、动态 loader/插件/profile 注入；敏感值只通过受保护 secret reference，证据不含秘密原文 |
| Filesystem | package/可执行 profile/控制输入受保护；DSH_HOME、workspace、evidence、control 分根；不将普通可写 settings/session 文件解释成代码；JSONL 是业务持久化真相，SQLite query 默认不打开 |
| Network | 本文全部候选场景外部网络请求预算为 0；无 registry、provider、自动更新、stock Web/TCP 入口；future provider 场景需独立 endpoint/凭据/超时/请求批准 |
| Child processes | Worker 所有，逐个 executable/argv/env/root/时限/数量受控；Node 所属 helper 使用匹配的获准 execPath；不共享 Desktop 的关闭语义；任何不明残留阻断替代启动 |
| Carrier / Renderer | current-user Named Pipe ACL、SID/实例/generation/协议握手先于 Gateway 写路径；Renderer 保持 nodeIntegration=off、contextIsolation=on、sandbox 与 preload allowlist，无 pipe credential |
| Plugin / profile | 静态 roster 和 startup 加载；禁止热装、自动 heal/reload、扫描用户代码目录或运行后扩展权限；REQUIRED load failure 必须失败，不 silent omit |

授权启动与 READY 均不自动允许真实 Agent turn、工具业务调用、答案提交或 Agent resume。验收所需 JSONL/能力探针必须作为明确允许操作绑定，不能调用未批准业务流程。Dynamic Cordis 默认禁用不等于 H-20 已证明。

## 6.4 Windows TOCTOU、进程与租约控制的设计决定

设计要求由独立受信控制层管理 package、trust config 和 ledger。包与执行配置根对 Worker/受测 payload 只读，Worker 使用不具备修改这些根权限的受限 token；根的父目录也不能被该 token 替换。普通“只读”文件属性、同 SID 默认 ACL 或一次 hash 检查不构成充分保护。

从最终校验到整个获准运行窗口，受信控制层须持有可执行/可加载文件与必要目录的保护句柄/访问控制，阻止 write/delete/rename/reparse 替换；关联最终解析路径、卷/文件身份与同一字节 hash，并在 spawn 前确认同一对象和安全上下文。迟加载的 native/DLL/plugin 也必须处于已冻结集合和持续保护之下。映射或保护失效立即作废 launch decision，运行中则停止新工作并 containment。

Windows 实现需用竞争替换负例证明“文件已核对、随后替换后却执行”的路径不可达。具体 Win32 调用和 token/job/handle 配置只在后续获准实现中提供；本文不把尚未实现的控制声明为 OS 已保证。无法在选定 fixture 建立并证明这些控制即 `TOCTOU_CONTROL_UNPROVEN`，阻断相关 launch；Owner 接受风险也不能将未满足的必需 Gate 填为 PASS。

采用受保护的 current-user Worker lease + durable generation counter + 原子预算 ledger。仅租约持有人可进入 spawn；实例身份包含 OS PID/start-time 和认证 endpoint，PID 复用不匹配。nonce/lease 状态/generation 均为 RUNTIME_FACT。Desktop 重开读取和认证现存 Worker，不增 generation、不创建第二 Worker、不复用旧 credential。

验证窗口中，独立控制层持有 Worker/children 的作业与退出控制，须阻止不被观察的 child/breakaway；cleanup 只作用于已核验本 Invocation 所属的进程。Desktop 不能持有一关闭就杀死 Worker 的生命周期句柄。Driver/collector 崩溃的有界终止能力需另行证明；无法证明停止时写 UNKNOWN 并阻断下一次启动。Driver 是有界验证工具，不增加第三个常驻产品 daemon。

威胁范围不声称抵御管理员/内核控制者或同 SID 任意恶意进程对整个受信控制层的接管。必须在 fixture 批准中明确受信执行账户、可写权限和可控制的攻击范围；若包或信任配置仍能被被测主体修改，则属于本设计范围内的 blocker，不能以该威胁声明豁免。

## 6.5 有限预算与时限

以下是**待审查设计上限**，当前全部 `0 authorized`。外部批准只能明确选择具体 case 和不超过已审查上限的参数；不符合 case 必需步骤的额度应在执行前拒绝，不能运行后修改期望结果。扩大上限、工具默认 retry 或新增请求需要新合同/批准。

| Budget Profile | 单个未来 Invocation 的上限 |
|---|---|
| V — 预检负例 | 1 validation request；0 preparation；0 Runtime launch；0 payload child；0 external network；120 秒总时限 |
| R — 启动/运行场景 | 1 validation request；1 Runtime physical launch attempt；0 preparation；最多 4 次预先列明的 Worker child spawn，最多同时 2 个；0 external network；300 秒运行授权窗口 |
| P — 独立解包准备 | 1 preparation request；1 extraction-tool launch；0 Runtime launch；0 package scripts；0 external network；600 秒；最多 100,000 个成员、8 GiB 展开 bytes，超限提取前拒绝且提取中实时限制 |
| Q — 显式只读对账 | 1 reconciliation request；0 Runtime launch；0 preparation；0 payload child；0 external network；120 秒；默认不含 attach/stop 操作 |

L5 decision 有效期最多 5 秒，超时即终止该 request，不能自动重新预检。READY 最多等待 60 秒，最多 60 次只读 readiness 观察，间隔不小于 1 秒且不能触发新的请求、spawn 或业务动作。正常/故障 stop 的 graceful 期限为 10 秒，再给已批准 containment 最多 5 秒；finalization 期限为 30 秒。授权窗口到期开始 stop；300 秒指从 launch slot 消费起算的运行窗口，stop/finalization 由事先授权的终止范围覆盖，不能继续新业务。

每 Invocation 原始 evidence 上限 256 MiB、单事件 1 MiB、独立 fallback sink 16 MiB；禁止静默截断/滚动覆盖，超限按 evidence failure 处置。每 R case 的专用 DSH_HOME 上限 1 GiB、TEMP 上限 1 GiB，JSONL 探针最多新增 16 MiB；workspace 默认只读，任何写探针另列有限字节和文件清单。每个正例的本地磁盘须预留 payload、两个数据根及证据空间的完整上限，运行中超限立即拒绝新写入并 containment，不删除已有证据腾空间。准备 byte 核对、归档上限和运行时限是不同预算，不通过重命名子步骤重置计数。

所有 UI attach/detach 的控制请求也有限：除 §9 case 明确更小值外，每 R case 最多 3 次已批准 Desktop 启动、3 次 attach、1 次显式 Worker stop；超限拒绝。Desktop 启动预算独立于 Worker launch，不能借 Desktop 重开增加 Worker 次数。主机 bootstrap/Driver 的执行由外部准备环境权限负责，不能以其无 Runtime slot 为由无限运行；每 case 仅一个 Driver 会话。

## 6.6 生命周期、Evidence 与 Failure State

| 从 → 到 | 唯一触发 / 必需事实 |
|---|---|
| REQUEST_RECORDED → PREFLIGHT_CHECKING | request/Plan 已记录，证据 sink 和预算可用 |
| PREFLIGHT_CHECKING → PREFLIGHT_PASSED | L0～L5 全通过，decision 已持久化 |
| PREFLIGHT_PASSED → LAUNCH_SLOT_CONSUMED | 在 5 秒 decision 窗口内原子消费 slot 并取得 Worker lease；先落盘后 spawn |
| LAUNCH_SLOT_CONSUMED → SPAWN_ATTEMPTED → PROCESS_CREATED | 记录 OS 调用尝试及真实创建结果、PID/start-time；不得凭预算消费推断创建成功 |
| PROCESS_CREATED → IDENTITY_AUTHENTICATED | expected bytes + 真实进程身份 + endpoint/generation/兼容握手关联一致 |
| IDENTITY_AUTHENTICATED → READY → RUNNING | 真实 DeepSeek Harness profile 初始化、受控 home/JSONL 可用、实际 Connection ready 因果链；不是 stdout 字符串或假造事件 |
| RUNNING → STOP_REQUESTED → EXIT_OBSERVED | 显式 stop、运行窗口截止或故障 containment；Worker/children 实际退出和资源对账 |
| 任一未执行 Gate → BLOCKED | 首失败明确，下游 NOT_REACHED；Runtime launch 未发生，不能进入 READY |
| spawn / handshake / READY 阶段失败 → STARTUP_FAILED → CONTAINMENT | 已消费 slot 不退还；只清理已认证归属的资源 |
| READY 后 crash / 越界 / evidence 故障 → RUNTIME_FAILED → CONTAINMENT | 阻断新业务；保留 first failure、原始数据和后续 cleanup error |
| 任一阶段突然中断 → INTERRUPTED / OUTCOME_UNKNOWN | 保留能证实的边界和已用预算；没有事实不补写成功/退出 |

`evidenceState = OPEN / FINALIZED / INCOMPLETE` 是独立维度。运行终态和 Evidence Finalization 不能互相代替；只要未能证实退出、归属、持久化完整或 budget 对账，不能直接生成成功终态。后续显式对账在新记录中关联旧 Invocation，不修改旧事实。

Desktop close/crash 不终止授权窗口内的 Worker；重开只认证 attach 和重建投影，不重放 approval/question/Agent resume/turn。授权失效、显式 Stop Worker 或 Worker 自身失败按本合同终止；Worker 更换必须新 Invocation、新 instanceId、新 generation 和新的授权链。

# 7. Evidence Contract

## 7.1 每条 Evidence 的强制 envelope

| Field Group | 必需字段与含义 |
|---|---|
| Evidence identity | schemaVersion、唯一 eventId、recordType、category、phaseId、scenarioId、requestId、invocationId（若已有）、authorityScopeId / authenticated authority Ref |
| Input identity | Package / Definition / Runtime Snapshot / Binding / Invocation Plan 的 expected、observed Reference 与 `CLAIMED / OBSERVED / AUTHENTICATED / NOT_AVAILABLE` 信任状态；不同类型的 digest 不混名 |
| Runtime identity | instanceId、generation、PID、processStartTime、endpoint identity、subject role；未生成填 null + reason，无法观察填 UNKNOWN + reason；禁止用 PID 单独匹配 |
| Source | sourceType、sourceId、sourceArtifactRef、producer process identity、collector identity、采集机制、sourceSequence；转发必须保留原始 producer / artifact Ref |
| Timestamp | UTC 时间、source-local monotonic tick、时钟单位/epoch、clock uncertainty；来自 OS 的 process start time 单独标其来源；不得把补录时间当发生时间 |
| Lifecycle state | stateBefore、stateAfter、boundaryReached、firstFailureBoundary（如适用）、subjectOutcome、evidenceState；没有状态变化也须注明当前状态与 observationOnly |
| Causality | causedBy eventId、correlationId、parent Invocation / recoveryCaseId（如适用）；不能只靠跨进程时间排序证明因果 |
| Fact / comparison | operation、expected 与可信来源、observed 与采集来源、result/error、launchAttempted、processCreated、runtimeEntered、各 budget 已用值；不适用明确 N/A 和原因 |
| Artifact references | 原始日志/输出/transport/批准/ledger 的 canonical path、bytes、SHA-256；证据相对路径限制在批准 evidence root，不能越界读取秘密 |

category 固定为 `startup / runtime / failure / recovery`，finalization 使用单独 recordType。准备阶段使用 `scope=PREPARATION` 的相同来源/时间/身份/状态规范，不把 extractor 的进程当成 Worker。每个事件有 identity、source、timestamp、lifecycle state，缺失任一项就不能算完整证据。

预身份拒绝事件允许 Package/Instance 为 NOT_AVAILABLE，必须有 requestId、Driver source 和具体 null reason；后续不能把负例中自报的 packageId 提升为认证 identity。全局 mergeOrdinal 仅表示汇总写入顺序，跨进程顺序以 sourceSequence、causedBy、transport 和真实进程事实建立。

## 7.2 四类证据的最小集合

| Category | 最少内容 | 必须交叉核对的来源 |
|---|---|---|
| startup | fresh fixture / host inventory、preparation Ref、Authority/Snapshot/Binding/Integrity/Permission/Boundary 各 Gate、实际 exe/argv/env-policy/cwd、ledger、spawn、PID/start-time、身份握手、真实 Harness / Connection ready、home/JSONL 初始化、NOT_REACHED | Driver + OS_OBSERVER + Worker control + DeepSeek Harness / Carrier 的原始事件；实际包和入口 hash 独立于 Worker 自报 |
| runtime | attach/detach、Desktop close/crash/reopen、Worker/children 生存与退出、权限与预算、获准 JSONL 操作、授权截止、显式 stop、真实终态 | OS_OBSERVER / Desktop / Worker / Harness / Carrier 分来源；证明 Worker 独立以及 no replay |
| failure | firstFailureBoundary、损坏或缺依赖身份、expected/observed、错误/超时、达到边界、已消费 slot、未知项、受影响数据、containment / residual resources、未到达动作 | 首失败原始源 + 外部进程/文件观察；cleanup 失败追加，不能覆盖根因 |
| recovery | parent failure/event/Invocation Ref、显式 recovery authority、新 Invocation、旧/新 package/definition/snapshot/instance/generation/data 身份、对账、允许动作、预检/预算、执行结果、no retry/no replay 计数 | 经独立认证的批准 + 新 Driver/OS 事实 + 原失败证据；没有执行的恢复必须写 NOT_AUTHORIZED 或 NOT_REACHED |

Plugin Evidence 的最小集合须显式包含以下 plugin roster 字段（R-02 Hygiene 补充）：

| Field | 最少记录内容 |
|---|---|
| expected | 经批准的 plugin roster Reference，以及各插件的预期身份与 inclusion/omission disposition |
| observed | 实际观察到的 plugin roster、插件身份及与 expected 的对应关系；未到达或无法观察须明确说明 |
| load | 各插件的实际加载结果及对应插件身份，不能仅用整体 READY 代替 |
| omit | 各插件的省略情况、原因及适用的批准依据，不能静默省略 REQUIRED 插件 |
| blocked | 插件加载被阻断的情况、原因和到达边界 |
| error | 插件加载或运行错误、来源及关联插件身份；没有错误或未到达时明确区分 |

上述字段沿用 §7.1 的 identity、source、timestamp、lifecycle state 和信任状态规则；无相关事件时明确记录未发生、未到达或不适用及其原因，不能因字段缺失推断成功。Plugin 继续同时属于 Identity Model、Trust Model 和 Evidence Model；本补充只显式列出既有插件证据要求，不改变插件范围、权限或执行边界。

对 READY 的最小证明是：获准字节 → OS process → 本次实例身份 → 认证 transport → 实际 profile 初始化与 `$events.ready` → 可用持久化；不得伪造 `connection/reset` 或用 UI connected 标记替代。业务事件归属 DeepSeek Harness，外部验证结论归属 Runtime Validation Driver。

## 7.3 Evidence First、持久化与来源真实性

未来 Driver 在任何 package code 或 extraction tool 执行前建立证据流、预算 ledger 与受保护目录。事件使用追加写入；原始 producer 数据、collector 接收记录和派生 summary 分离。所有权和权限限制谁能写入，记录单写者/序号/长度以检测截断、重复或乱序；“JSONL”扩展名和 hash 本身不代表不可篡改或事实真实。

request、Gate decision、slot consumed、spawn intent、failure、stop intent 和 terminal record 必须在依赖它们的下一动作前持久 flush；slot 和租约原子事务失败不 spawn。普通运行事件最长 1 秒或每 64 KiB flush，先到者生效；掉电导致未持久事件缺失时明确标记缺口，不重构虚假历史。轮转只允许按批准容量封存新文件并追加索引，不覆盖原文件。

主 evidence sink 启动前不可用则零 Runtime；运行中不可用、容量用尽或 source sequence 缺口则停止接收新业务，尝试事先批准的 fallback sink 并在 §6.5 时限内 containment。fallback 不能保持业务继续运行，也不能作为无限容量替代。所有 sink 失败或机器断电时，不能保证即时落盘，保持 `EVIDENCE_INCOMPLETE / OUTCOME_UNKNOWN`，后续显式对账。

sourceArtifactRef 认证执行的 Driver/collector/业务组件版本；事件来源真实性还依赖受信采集与因果交叉核对。进程自报的 source 字段不独立可信。日志不包含 private key、token、完整敏感 env 或业务秘密；必要的受保护原始材料在授权 sink 内保存，公开摘要只引用身份和脱敏信息，不能脱敏掉判定所需的组件/路径/失败事实。

## 7.4 Finalization 与结果分类

最终索引包含所有原始 artifact 的路径、字节数、SHA-256、producer/source 关联、时间范围、ledger 对账、缺口/残留资源、期望与观测差异及 case 结果。索引不包含自身 hash；后生成的 review/closure record 固定索引精确 Ref。原始 Evidence、索引和摘要不回填 Snapshot。

| 维度 | 允许值与判定 |
|---|---|
| subjectOutcome | BLOCKED、STARTUP_FAILED、RUNTIME_FAILED、COMPLETED、INTERRUPTED、OUTCOME_UNKNOWN；表示实际被测行为 |
| validationVerdict | PASS：预先批准期望与实际一致且证据完整；FAIL：观测违背期望；INCONCLUSIVE：未到达、环境/证据不足或结果未知 |
| evidenceStatus | FINALIZED / INCOMPLETE；有 exit code 或 summary 文件不自动 FINALIZED |
| hypothesisDisposition | PROVEN / PROVEN_WITH_CONSTRAINT / FAILED / UNRESOLVED；约束接受另由 Owner 记录 |

负例正确拒绝可以 validationVerdict=PASS，同时 subjectOutcome=BLOCKED、runtimeEntered=false；不能据此宣布包启动成功。恢复只有实际获准执行且完整证据符合期望才可通过恢复 Gate；仅证明没有恢复权限时没启动，不能替代恢复可行性。

后续对账创建新记录和新事实时间，指向原 Invocation/索引，保留旧 INCOMPLETE 或 UNKNOWN 的历史结论及修正依据；禁止覆盖旧事件、回填实际启动时间或更改已签名输入。

# 8. Failure Recovery Contract

## 8.1 四类失败合同

| Failure | 检出边界与即时行为 | 恢复前置条件 | 必需证据 |
|---|---|---|---|
| Package corruption | archive/hash/路径/额外代码或 payload bytes 不符：启动前 PACKAGE/INTEGRITY_BLOCKED；运行后漂移则 RUNTIME_FAILED、停止新工作并 containment | 当前副本隔离；明确批准从固定来源恢复或独立重构建；重新准备与 byte 核对；任何内容变化重建新 Package/Definition/Snapshot/Binding 链 | expected/observed hash、实际路径、首失败、零执行或实际已到边界、隔离状态、后续批准与新输入关系 |
| Dependency failure | 预检 D/A/I 或 host prerequisite 缺失即 DEPENDENCY_BLOCKED；启动加载缺失/ABI/loader failure 则 STARTUP_FAILED；运行中迟加载失败则 RUNTIME_FAILED | 独立 dependency baseline / build / preparation 批准；完整 closure 重新核对；新启动批准；不得 install/rebuild/heal/fallback 后自动重试 | 缺失/错 ABI 组件身份、resolved path、错误来源、声明/解析/库存差异、预算、前后 closure Ref |
| Startup failure | OS spawn error、身份/endpoint/generation/协议不符、READY timeout；slot 已消费不退还；只清理确认归属的实例 | 原 request 终态和残留所有权对账；明确修复/恢复批准；新 Invocation 与完整 Final Preflight；变更输入重新冻结 | spawn intent/result、PID/start-time 或 UNKNOWN、handshake/timeout、first failure、cleanup、slot used |
| Runtime crash | READY 后 Worker crash、collector/控制层中断、断电、残留 children、证据持久化失败；RUNTIME_FAILED 或 INTERRUPTED/OUTCOME_UNKNOWN | 先单独授权对账原进程、lease、generation、children、预算与 JSONL；再明确选择 attach、stop 或 new launch；不能由“没看到 PID”推断旧实例已退出 | crash/exit 原始来源、最后可证边界、未完成持久化、残留进程、对账与采取动作、新旧身份、no-replay |

故障注入仅在预先批准的隔离副本和触发点实施，原冻结包与历史证据保持。负例复制品标明 `FAULT_FIXTURE`、原包 Ref 和 mutation description；其 observed hash 不能覆盖 expected hash。制作该副本也是独立准备权限，不能在未授权解包或启动过程中偷偷修改。

## 8.2 显式恢复状态转换

| 从 → 到 | 所需批准 / 新事实 |
|---|---|
| FAILURE_RECORDED → RECOVERY_NOT_AUTHORIZED | 没有具体恢复批准时的稳定终态；禁止自动 timer、health-check restart 或再次提交同一请求 |
| FAILURE_RECORDED / OUTCOME_UNKNOWN → RECONCILIATION_AUTHORIZED | 独立 Owner 记录精确父失败/原 Invocation、允许读取范围、Q 预算与时限；新的 reconciliation Invocation |
| RECONCILIATION_AUTHORIZED → RECONCILED / RECONCILIATION_INCOMPLETE | 读取真实残留/数据并形成新 Evidence；不确定则停止，不能新 launch |
| RECONCILED → RECOVERY_AUTHORIZED | 独立明确批准 action=ATTACH / CONTROLLED_STOP / NEW_LAUNCH 中唯一动作、输入、范围、有限预算、时窗和新 Invocation Plan；不允许靠换 ID 自授权 |
| RECOVERY_AUTHORIZED → RECOVERY_PREFLIGHT → RECOVERY_EXECUTING | 新 Snapshot/Binding/批准链与适用完整 Gate；ATTACH / STOP 核对现存实例，NEW_LAUNCH 执行完整 L0～L5 |
| RECOVERY_EXECUTING → RECOVERED / RECOVERY_FAILED / OUTCOME_UNKNOWN | 新实例或原实例真实结果、预算和 evidence finalization；若再失败，回到无自动恢复权限状态 |

每次恢复必须包含 **explicit authorization + new state transition + evidence**。已知失败且无残留未知项可直接提交 recovery approval，但必须引用原失败和所有权已对账证据，不能跳过这些条件。恢复批准是新动作授权，先前启动批准不延续为恢复权。

ATTACH 保持原 Worker instance/generation，不消耗 Runtime launch；CONTROLLED_STOP 只操作确认归属的现存 Worker/children；NEW_LAUNCH 使用新 instanceId/generation/Invocation/Snapshot 和一个新 slot。连接/投影恢复不发送 Agent resume/turn，不重放 approval/question 答案。数据恢复只按明确动作处理；本设计不授权删除、回滚或自动修复 JSONL，也不定义业务重放算法。

相同原始 archive 和 inventory 重新获准提取后，Package 内容身份可以相同；新 Preparation/Recovery Invocation、Snapshot、Binding 和启动批准仍然必需。任何 bytes 改变必须新 Package 身份，不能通过同名目录或版本标签继承旧冻结。原失败 slot 不退还，禁止复用旧启动 ID 或签名作为新启动许可。

## 8.3 全栈禁止 implicit retry

禁止隐式 retry、自动 restart、自动 resume、消耗后 reuse，适用于 Supervisor、Runtime Validation Driver、解包/构建工具、插件 loader、网络客户端、Harness 启动包装层和 child manager。工具内部 retry 必须关闭并有配置/实际计数证据；无法关闭或界定则不允许使用该工具跨界。

§6.5 的有限只读 readiness observation 只观察一次已获准启动，不重发失败业务请求、不重新 spawn、不扩大窗口。Desktop 重开和 endpoint refresh 不能变相重启 Worker；恢复流程更换 case/Invocation 名称也不增加批准预算。再次失败需要新的明确 disposition，不能自动遍历多种 runtime strategy。

# 9. Acceptance Criteria

## 9.1 必须覆盖的验收结论

所有条目当前均为 `DESIGN_ONLY / NOT_EXECUTED`。本章是未来验证规格，本文不记录新的测试 PASS、Verification PASS、Runtime READY 或阶段关闭。

| AC | 通过条件 | 必需证据 / 不足时结论 |
|---|---|---|
| AC-01 Fresh Windows | 固定完整 Windows x64 fixture、普通用户、无开发源码/缓存及手动 Harness 安装；在该 fixture 上运行获准 package | host/fixture inventory + 外部观察；仅当前开发机运行不能替代，未准备 fixture 为 INCONCLUSIVE |
| AC-02 No global Node/pnpm | 实际 Worker execPath 来自已核对 bundled Node；宿主无可用全局 Node/pnpm，且无 PATH/registry/source fallback | fixture inventory、进程真实路径、环境/加载/网络观察；无系统依赖只能证明完整执行组合 |
| AC-03 Package identity / integrity | archive、descriptor、完整 payload、版本/ABI/插件、D⊆A⊆I 及实际文件集合一致；错包/缺失/额外/坏 hash 拒绝 | 全层 ContentRef 和实际 bytes 对账；不能只检查 package.json 或 archive hash |
| AC-04 Identity domains / Definition separation | FROZEN_INPUT/RUNTIME_FACT/REFERENCE 可逐字段归属；Snapshot 含五项规定内容且无 runtime facts/双重权威/引用环 | schema/引用链审查及针对非法输入的独立负例；不靠字段改名绕过 |
| AC-05 Runtime instance identity | PID/start-time/instance/generation/endpoint 因果关联；PID 复用、旧 generation/错误握手拒绝；attach 不改 Worker 身份 | OS + control + Carrier 记录；没有实际 Runtime 证据不能仅靠 schema 通过 |
| AC-06 Controlled unpack | 未授权零提取；批准准备有独立 slot/Evidence；全量 bytes 核对后才接受 payload；准备成功后仍零 Runtime | Preparation authority/ledger/提取与核对 Evidence；silent unpack 或只看 exit=0 即 FAIL |
| AC-07 Startup authorization | Anchor/可信 key/选中 Approval/有效权限/唯一 Plan/预算全部成立；缺失、过期、撤销、错 phase、复用分别拒绝 | 每 Gate 原始 expected/observed 和零 launch 证据；不得继承 P0.S-6 权限 |
| AC-08 Snapshot Binding | 精确 Payload status/hash/signature、独立 expected Ref、正式 Binding、actual controller/入口一致 | 有效但错 Snapshot、旧入口/旁路 corrected、坏签名/错 key 的独立拒绝证据 |
| AC-09 Permission / boundary | 文件/ACL/token/path/env/network/children/lease、TOCTOU 同一对象约束成立；Desktop/Renderer 隔离 | 实际 enforcement 正反证据；配置存在或日志记录不等于阻断 |
| AC-10 Dependency failure | 缺 native/helper/host PowerShell、错 ABI、额外动态依赖按真实到达边界失败，零安装/heal/fallback | D/A/I、加载路径、首失败、未到达、无自动补齐的观察 |
| AC-11 Startup failure | spawn error、READY timeout、identity mismatch 分别分类，slot 消费和 containment 正确 | process/ledger/handshake/deadline；退出/创建未知保持 UNKNOWN |
| AC-12 Runtime crash / interruption | Worker/collector crash、证据失败、slot 后中断及残留资源可对账；没有隐式替代实例 | 外部 crash/exit/ledger/fallback/残留证据；缺口不能填成功 |
| AC-13 Explicit recovery | 四类失败均先证明未获准无 retry，再以新具体批准、新状态、新 Invocation 完成适用恢复；变更输入重新冻结 | 每类 parent failure → approval → 新预检 → result 全链；仅拒绝恢复不能通过正例 |
| AC-14 Evidence source | startup/runtime/failure/recovery 每条均有 identity/source/timestamp/lifecycle state；DeepSeek Harness 与 Runtime Validation Driver 分明 | 来源 roster、原始 artifact Ref、producer/collector/OS 关联；等价驱动器不冒充正式驱动器 |
| AC-15 Evidence completeness | raw index/hash、生命周期和各预算对账可重推；分类四维分开；丢失证据为 INCOMPLETE/INCONCLUSIVE | 独立 Reviewer 可从原始数据重推摘要；无自引用或回写快照 |
| AC-16 Desktop lifecycle | Desktop close/crash 后 Worker 在原窗口内存活；重开/第二 Desktop 只认证 attach，无第二 Worker、答案或 Agent replay | Worker 同一 instance/generation、Desktop/Carrier 事件及业务计数 |
| AC-17 Baseline / plugins | H-21～H-25 及 H-26 packaging 贡献逐项有结论；H-05/H-20 独立处置；core patch/adapter/约束分账 | 保留缺口及 Owner disposition；不以局部 packaged PASS 代替全局 P0.S PASS |

## 9.2 场景、首失败边界与预算

每个 case 独立分配未来 Plan、Snapshot 和批准；以下编号是**静态规格标签，不是已创建 Invocation ID**。V/P/R/Q 引用 §6.5 的有限上限，实际授权仍为 0。所有 case 默认 retry/restart/resume/reuse=0，自动恢复=0。

输入代号：F 为已批准 fresh fixture；G 为经完整准备、冻结和批准的候选包及输入链；N 为独立批准的隔离负例副本；E 为已保存的父失败证据。每个 N 只能注入表中一项故障，批准记录固定原输入、mutation 和预期首失败，不能事后更换 expected hash 来接受损坏。

V 是外层只读验证预算，不是 Runtime Plan 的启动授权。有效候选链可在外层 V 范围被读取以检查某个 Gate，但 V 下绝不生成可用 launch decision 或执行 spawn；候选 Gate 检查与外层执行权限合取后仍是 0 launch。此区分不能用于伪造 L1 PASS；Authority 负例记录候选授权检查的真实拒绝。R 正例才要求候选链和外层启动权限同时有效。

| Case | 输入 / 唯一触发条件 | 预期结果 / 首失败或到达边界 | 来源 / Budget |
|---|---|---|---|
| S7-C01 | F + G；完整首次启动、受控 JSONL 探针、显式 stop | L0～L5 → READY/RUNNING → EXIT；bundled Node/Worker/Harness 真实链，外部网络 0 | Driver/OS/Harness/Carrier；R |
| S7-C02 | F + N；缺启动批准 | AUTHORITY_BLOCKED / L1，零 Runtime | Driver/OS；V |
| S7-C03 | F + N；批准过期 | AUTHORITY_BLOCKED / L1，零 Runtime | Driver/受信时间来源；V |
| S7-C04 | F + N；批准已撤销 | AUTHORITY_BLOCKED / L1，零 Runtime | Driver/选中撤销状态；V |
| S7-C05 | F + N；批准 phase 不匹配 | AUTHORITY_BLOCKED / L1，零 Runtime | Driver；V |
| S7-C06 | F + N；复用已消费 Invocation | AUTHORITY_BLOCKED / L1，slot 不退还 | Driver/ledger；V |
| S7-C07 | F + N；预算耗尽但尚未 launch | AUTHORITY_BLOCKED / L1，零 Runtime | Driver/ledger；V |
| S7-C08 | F + N；签名 bytes 被改变 | INTEGRITY_BLOCKED / L2，零 Runtime | Driver/精确 Binding；V |
| S7-C09 | F + N；Binding 指定非批准 key | INTEGRITY_BLOCKED / L2，不能 key override | Driver/外部 key 记录；V |
| S7-C10 | F + N；有效签名但独立 expected Snapshot Ref 不同 | INTEGRITY_BLOCKED / L2，签名有效不放行 | Driver/选中 Approval；V |
| S7-C11 | F + N；signed Payload status 为 DRAFT | INTEGRITY_BLOCKED / L2，无状态文字覆盖 | Driver/Payload bytes；V |
| S7-C12 | F + N；正式 Binding 旧、旁路 corrected 新 | INTEGRITY_BLOCKED / L2，检查正式路径 | Driver/路径与 bytes；V |
| S7-C13 | F + N；Snapshot 插入 runtime instance facts | SCHEMA_CONFLICT / L2，禁止进入冻结输入 | Driver/schema；V |
| S7-C14 | F + N；Snapshot 重复定义 Node/argv/权限权威值 | SCHEMA_CONFLICT / L2，无 override | Driver/schema/ref graph；V |
| S7-C15 | F + N；archive 单字节损坏 | PACKAGE_BLOCKED / L3，零提取/Runtime | Driver/原始 hash；V |
| S7-C16 | F + N；实际 payload 组件身份不符 | PACKAGE_BLOCKED / L3，零 Runtime | Driver/全量 inventory；V |
| S7-C17 | F + N；缺一个声明的 native/helper 文件 | DEPENDENCY_BLOCKED / L3，D/A/I 指出缺口 | Driver/closure/inventory；V |
| S7-C18 | F + N；增加未列入的插件/loader 文件 | PACKAGE_BLOCKED / L3，禁止隐藏代码 | Driver/全量枚举；V |
| S7-C19 | F + N；D 的依赖边缺于 A，但文件存在 I | DEPENDENCY_BLOCKED / I2，不能只查文件存在 | Driver/D/A hashes；V |
| S7-C20 | F + N；A 的文件缺于 I | DEPENDENCY_BLOCKED / I3，不能只查声明图 | Driver/A/I hashes；V |
| S7-C21 | F + G；无 preparation authority 请求解包 | PREPARATION_AUTHORITY_BLOCKED / U0，零工具/提取/Runtime | Driver/preparation request；P，上限未消费 |
| S7-C22 | F + G；独立批准解包 | U0～U5 → PAYLOAD_VERIFIED；完整 Evidence/Byte Verification；Runtime 0 | Driver/工具/独立 byte 核对；P |
| S7-C23 | F + N；archive 路径越界成员 | PACKAGE_BLOCKED / U1，零提取 | Driver/archive member；P，上限未消费 |
| S7-C24 | F + N；提取后内容与 expected inventory 不符 | PACKAGE_BLOCKED / U4，隔离 partial payload；Runtime 0 | Driver/工具/byte 核对；P |
| S7-C25 | F + G；DSH_HOME 不可写 | PERMISSION_BLOCKED / L4，不回退目录 | Driver/OS ACL；V |
| S7-C26 | F + N；U5 后把 payload 子路径替换为 junction/reparse | INTEGRITY_BLOCKED / L3-I4，拒绝非普通路径，零 Runtime | Driver/OS 文件身份；V |
| S7-C27 | F + G；父环境注入 NODE_OPTIONS/NODE_PATH | L4/L5 拒绝注入，零 Runtime；没有环境继承 | Driver/env policy；V |
| S7-C28 | F + G；L5 后由获准故障注入器竞争替换执行文件 | 保护措施拒绝替换，只有原字节可运行；必须观察替换拒绝与实际原对象执行 | Driver/OS/race source；R，故障注入独立有界批准 |
| S7-C29 | F + G；同一 Worker lease 的两个并发启动请求 | 仅一个可消费共享 slot/启动；另一个明确阻断；无双 Worker | Driver/ledger/lease/OS；2 个 R request、独立 Plan，共享 launchGroupId 的 Runtime 总预算 1 |
| S7-C30 | F + G；OS spawn 返回错误 | STARTUP_FAILED，slot=1、processCreated=0（须观察证实），不重试 | Driver/OS/ledger；R |
| S7-C31 | F + G；不产生真实 READY | STARTUP_FAILED / READY deadline，60 秒/60 次观察内停止 | Driver/OS/Harness/Carrier；R |
| S7-C32 | F + G；进程存在但 endpoint / generation 握手不匹配 | STARTUP_FAILED / identity gate，禁止 Gateway 写路径 | OS/Worker control/Carrier；R |
| S7-C33 | F + N；静态身份已匹配但获准不兼容 ABI fixture 在实际加载失败 | STARTUP_FAILED / dependency load，零 rebuild/fallback | OS/Harness/native diagnostics；R，负例输入需事先明确批准 |
| S7-C34 | F + N；host PowerShell prerequisite 缺失 | DEPENDENCY_BLOCKED / L3，不下载或回退 | Driver/host inventory；V |
| S7-C35 | F + G；READY 后 Worker crash | RUNTIME_FAILED，children/lease 对账、零自动替代 Worker | OS/Driver/Worker；R |
| S7-C36 | F + G；slot 消费后 Driver 中断，无完整 spawn 结果 | OUTCOME_UNKNOWN/INCOMPLETE；旧 slot 仍消费，新启动阻断 | ledger/OS/后续显式观察；R |
| S7-C37 | F + G；运行中 evidence sink 写入失败 | 停止新工作、fallback/containment；缺事实保持 INCOMPLETE | collector/OS/fallback；R |
| S7-C38 | F + G；已认证 child 无法确认退出 | OUTCOME_UNKNOWN，保留 ownership 未决，禁止替代启动 | OS/Driver/child ledger；R |
| S7-C39 | F + G；Desktop 正常关闭后重新打开 | 原 Worker 存活、instance/generation 不变；只 attach、无 replay | Desktop/OS/Carrier/Harness；R，Desktop 最多 2 次 |
| S7-C40 | F + G；Desktop crash 后重新打开 | 原 Worker 在原授权窗口存活；无第二 Worker/业务重放 | Desktop/OS/Carrier/Harness；R，Desktop 最多 2 次 |
| S7-C41 | F + G；第二 Desktop 同时请求连接 | attach 到同一已认证 Worker，无第二控制权 | Desktop/lease/OS/Carrier；R，Desktop 最多 2 次 |
| S7-C42 | F + G；Runtime 请求加载 A 外的动态依赖 | 加载/执行前被拒绝，RUNTIME_FAILED；不能只事后记录 | control/Harness/OS/加载约束；R |

S7-C28 固定验收持续写保护；若实现只是在替换后阻断 launch，应如实记录其 fail-closed 事实，但不能将该结果充当本 case 的持续保护通过。S7-C29 的两个 Plan 都必须具有有效候选启动权限，共享批准的 launchGroupId、durable group budget=1 和同一 Worker lease；原子消费同时约束 individual/group budget，不能用一个先天无启动权的 V 请求充当竞争失败者。其余无关前置输入须有效；未达到指定故障点只算 INCONCLUSIVE，不以更早阻断替代目标场景证明。

不兼容 ABI 等故障输入仍须有明确身份和负例范围批准；这只是允许验证该已知失败 fixture，不是允许以不明字节启动。构造签名/状态/schema 负例需独立负例材料批准，不能读取私钥、修改原冻结包或让非法 Payload 获得正例启动 authority。

## 9.3 恢复场景与完整性收口

| Case | 父失败 / 明确允许动作 | 期望与来源 | Budget |
|---|---|---|---|
| S7-R01 | E=package corruption；无恢复批准后提出恢复 | RECOVERY_NOT_AUTHORIZED；零解包/重试/Runtime；Driver + 原失败/ledger | V |
| S7-R02 | E=dependency failure；无恢复批准 | RECOVERY_NOT_AUTHORIZED；零 install/rebuild/fallback；Driver/进程和网络观察 | V |
| S7-R03 | E=startup failure；无恢复批准 | RECOVERY_NOT_AUTHORIZED；旧 slot 不复用；Driver/ledger | V |
| S7-R04 | E=runtime crash；无恢复批准 | RECOVERY_NOT_AUTHORIZED；零 restart/resume；OS/lease/ledger | V |
| S7-R05 | E=corruption；新批准重新准备同一批准 archive 并启动 | 新 Preparation + Runtime Invocation；bytes 全核对，旧 Evidence 保留；可达 READY | 1 个 P + 1 个 R；分别批准，Runtime 总数 1 |
| S7-R06 | E=dependency failure；独立批准生成修复后的完整包，再准备/启动 | 新 Package/closure/Snapshot/Binding/批准链；新实例真实结果；没有隐式修复 | 准备后的 1 个 P + 1 个 R；构建本身单独合同，本表不授预算 |
| S7-R07 | E=startup failure；对账后新明确启动批准 | 新 Invocation/Snapshot/slot，旧 slot 保留消费，READY 或真实失败 | R；有未知残留先单独 Q |
| S7-R08 | E=runtime crash；显式对账后批准新启动 | 新 generation/instance/Invocation，JSONL 保留，no replay | 1 个 Q + 1 个 R；分别批准 |
| S7-R09 | E=Driver 中断/UNKNOWN；只读对账 | 新 reconciliation Evidence，未知项不编造；不直接启动/停止/attach | Q |
| S7-R10 | 已对账且原 Worker 存活；明确 ATTACH 批准 | 原实例不变，只重建投影，零 Runtime launch/业务重放 | 1 request、1 Desktop launch、1 attach、0 child/network/Runtime、120 秒 |
| S7-R11 | 已对账且原 Worker 存活；明确 CONTROLLED_STOP 批准 | 只停止原归属 Worker/children，记录退出或 UNKNOWN | 1 request、1 stop、0 Desktop/Runtime/child spawn/network；120 秒，stop/containment 按 §6.5 |
| S7-E01 | 各 case 完成后独立只读证据收口 | 检查 identity/source/time/state、sourceSequence/causality、raw hash、预算、首失败和四维分类；Runtime 0 | 1 request、0 Runtime/child/network、120 秒；独立 review authority |

上述 case 是设计集合，不能一次性自动获得总预算。Owner 后续必须列出此次选择的有限 case ID、每个 case 的精确 inputs/fixture/expected/触发点、Driver 和故障注入器身份、具体请求/进程/时间/磁盘/网络预算及总上限；未列入的 case 不执行。准备和恢复从不作为 R case 的隐式附带步骤。

完整成功要求：至少一种获准 Worker 策略在 fresh Windows 上得到正例真实证据，AC-01～17 在批准范围内满足，四类失败和相应明确恢复均有证据，关键 trust/authority/permission/retry 缺口为零。Worker-only、未达到恢复、环境缺失或证据不全只能如实提交范围内结论和 UNRESOLVED，不能填完整 Runtime/Recovery PASS。

## 9.4 后续决策对象与阻断条件

这些是有明确责任和出口的实物/批准依赖；不允许带占位值通过 Gate。本文交付的是设计合同，不宣称 B1 的全部实物输入已经关闭或 S7-2 可开始。

| Item | 当前处置 | 后续责任 / 阻断边界 |
|---|---|---|
| 精确 Node/Electron 工件、ABI/native/helper/plugin roster、ZIP 构建工具/输入 | §2.4 已提出候选；实物 SHA-256、toolchain、发布 closure 未提供 | Executor 在独立授权下整理准备输入，Reviewer 核对，Owner 批准；缺失阻断构建/包冻结 |
| Dependency baseline / Candidate disposition | Candidate 未应用；失败 node_modules/cache/quarantine 不默认可用 | Owner 单独批准候选处置/准备范围与新锁定输入；不改 source/DRRC lockfile，不重新打开 P0.S-6 |
| Fresh fixture / PowerShell / external DLL inventory | family 和版本候选已给，完整 build/revision/来源/hash 未冻结 | fixture 责任人在独立准备权限下记录，Reviewer/Owner 接受；缺失阻断相关准备与 launch |
| H-05 / H-20 / REQUIRED Client closure | NOT_PROVEN；完整 Desktop 必需性保留 | Architecture Owner 决定单独有界补证合同或事先批准 Worker-only 范围；完整 Desktop PASS 前必须解决 |
| P0.S-7 Trust Root / Anchor / bootstrap Driver / independent Approval delivery | 模型已定义，具体 key/Anchor/Driver/可信交付实物未选择或配置 | Owner 选择，独立 bootstrap 校验；准备工具执行前完成其自身信任链，Runtime launch 前完成完整链 |
| Permission / TOCTOU / process / durable ledger enforcement | §6.4 设计已选择，实际 Windows 实现和竞争负例未证明 | 需单独实现授权及 Reviewer 审查；不能凭设计文本通过 Runtime Gate |
| Archive / Package / Definition / Snapshot / Binding / Signature | 本次全部未创建 | 经各自准备/实现批准、精确字节冻结与独立 Owner disposition 后才可作为输入 |
| 每次执行具体 case / 总预算 / 故障注入与恢复批准 | §6.5、§9.2～9.3 给出有限规格；当前 0 authorized | Owner 逐次激活具体批准对象；任何空缺、超额或 UNKNOWN residual 阻断 |
| 本合同独立审查 | 待审查；不继承父规划 Review PASS | Reviewer 评估 SF-7-01～05、字段归属、用例和缺口；Owner 再决定后续明确范围，不自动授权实现 |

移交顺序：本文独立审查 → 具体输入处置与实现/准备授权 → 有界工件准备/构建及核对 → 精确冻结/签名/独立批准 → startup activation + Final Preflight → 获准场景和显式恢复 → Evidence Finalization → 独立 review / Owner disposition。各阶段结束不自动扩大权限或预算。

后续 P0.S-8 输入需逐项附 evidence、hypothesis disposition、constraint、production impact、required P0.5/P1 contract、fallback 和 core patch requirement。不能把 Layer C adapter 等同 Core Patch，也不能预先将模块/打包领域 `CORE_PATCH_REQUIREMENT` 改为 NO。

## 9.5 本次交付、文档检查和未执行事项

本次仅创建 `docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md`，保存为 **UTF-8 without BOM、LF**。既有中文文件、已有工作区修改、代码和治理工件均不改写。本文自身的 SHA-256 在最终交付中提供，不回填本文造成自引用。

本次检查只针对文档：严格 UTF-8 解码、BOM/LF、疑似乱码、九章/必需术语、相对引用存在性、静态内容一致性，以及修改前后既有文件字节身份和新增范围。**测试方式：未运行测试；未执行项目 Verification 或 Final Preflight。** 文档检查不能产生 Runtime 验收 PASS。

当前未执行：代码开发；Runtime/package 创建；Package Build；依赖安装/准备；解包或 Byte Verification 执行；Runner/Manifest/Binding/Payload/Signature/Identity/lockfile 修改；Candidate 应用；Invocation 创建/启动/恢复；Runtime/Worker/DeepSeek Harness/Runtime Validation Driver 启动；故障注入；项目测试；Final Preflight；Verification；签名/私钥读取；commit；push。

```text
DESIGN_CONTRACT_STATUS = DESIGN_ONLY
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S7_STATE = NOT_STARTED
P0S7_AUTHORIZATION = NOT_AUTHORIZED
P0S7_ALLOWED = NO
RUNTIME_CREATED = NO
PACKAGE_CREATED = NO
INVOCATION_CREATED = NO
VERIFICATION_EXECUTED = NO
TESTS_EXECUTED = NO
COMMIT_PERFORMED = NO
PUSH_PERFORMED = NO
```
