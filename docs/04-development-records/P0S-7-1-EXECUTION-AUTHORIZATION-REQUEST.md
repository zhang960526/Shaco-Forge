# P0.S-7-1 Runtime Controlled Execution Spike Execution Authorization Request

| Field | Value |
|---|---|
| Request ID | `P0S7-1-EXECUTION-AUTHORIZATION-REQUEST-20260905-01` |
| Document Type | `EXECUTION_AUTHORIZATION_REQUEST` |
| Status | `REQUEST_ONLY` |
| Request Date | `2026-09-05` |
| Request Architect Role | Shaco Forge P0.S-7-1 Execution Authorization Request Architect |
| Requested Subject | `P0.S-7-1 Runtime Controlled Execution Spike` |
| Inherited Implementation Authorization | `OWNER_APPROVED_AND_FROZEN` |
| Inherited Owner Decision ID | `P0S7-1-IMPLEMENTATION-AUTHORIZATION-OA-20260905-01` |
| Execution Plan ID / Review | `P0S7-1-EXECUTION-PLAN-20260905-01` / `PASS`，Review 依据本次用户提供的当前状态 |
| Owner Approval for This Request | `NOT_PROVIDED` |
| Current Usable Execution Budget | `0` |
| Startup Activation | `NOT_AUTHORIZED` |
| Current Deliverable | 仅本 Markdown 授权申请；不执行申请中的动作 |

本文提交具体的申请范围、五项验证 Case、产物、预算处置、证据义务与停止条件，供后续 Owner 决策。**这是授权申请，不是执行授权决定、Runtime 创建或 Package 构建。** 已批准的实现范围和 Execution Plan PASS 不等于本申请已获 Owner Approval，也不提供具体 Invocation 额度。

## Basis and Current State

沿用本任务此前已读取的设计、规划和经验记录，本次重读 Owner 批准记录及执行计划相关输入、预算和入口条件，并核对下列工作区文件的精确身份。摘要用于申请溯源，不充当 Runtime Snapshot 或独立信任根。

| Ref | Input | Bytes | SHA-256 |
|---|---|---:|---|
| B1 | [Execution Plan](P0S-7-1-EXECUTION-PLAN.md) | 51549 | `69F93DDE4374071E0320DE371F080CD0606431DC74C587258260D311D69468E2` |
| B2 | [Implementation Authorization Owner Approval Decision](P0S-7-1-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-DECISION.md) | 14990 | `0DAD742EABE44B6B9F0B69F0189531FD353A0C039DA7A8CC2F16A0B75CD74349` |
| B3 | [Detailed Design Contract](P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | 86292 | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |
| B4 | [Implementation Authorization Decision](P0S-7-1-IMPLEMENTATION-AUTHORIZATION-DECISION.md) | 26612 | `A3640948B83E1F63B5B3FFB7B19DB53ED4BAB4BD3BE257432718460B1B2A7480` |
| B5 | [Architecture Planning Decision](P0S-7-ARCHITECTURE-PLANNING-DECISION.md) | 52261 | `9FCD637A922B25BCDA7B1F169F9CF9F06EE8754720EFC70D51992E2EA8665BA9` |
| B6 | [P0.S-6 Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | 11824 | `71E974AB17068FA0920A58B4E1D1BF2458D78633537E25C16666AD9562EC3349` |

B3/B4 当前字节与 B2 批准的精确身份一致；B1 与前次交付摘要一致。本次采用用户提供的后续治理状态：Design `FINALIZED`、Authorization `OWNER_APPROVED_AND_FROZEN`、Execution Plan `PASS`。源文档中 `DESIGN_ONLY`、`OWNER_REVIEW_REQUIRED`、Execution Plan Review `NOT_PERFORMED` 等保留各自生成时含义，不回写源文档，不虚构独立审查文件、Reviewer、签名或本申请审查通过结论。

| Current State | Value |
|---|---|
| P0.S-6 State / Result | `CLOSED / VERIFIED_WITH_CANDIDATE` |
| P0.S-6 Candidate | `generated_not_applied`；不改变 Source / DRRC lockfile |
| P0.S-7 State | `NOT_STARTED` |
| P0S7_ALLOWED | `NO` |
| P0.S-7-1 Design | `FINALIZED` |
| P0.S-7-1 Implementation Authorization | `OWNER_APPROVED_AND_FROZEN`，实现范围为 `AUTHORIZED_AFTER_APPROVAL` |
| P0.S-7-1 Execution Plan Review | `PASS`，用户提供；不表示 Runtime 验收 PASS |
| Current Budget | `0` |
| This Request / Execution | `REQUEST_ONLY / NOT_AUTHORIZED` |

# 1. Requested Execution Scope

## 1.1 申请对象

明确申请 **P0.S-7-1 Runtime Controlled Execution Spike** 的后续受控执行范围：按 B1 的 A Input Closure、B Package Feasibility、C Controlled Launch、D Evidence Finalization 顺序，闭合具体输入后，对第 2 节的五项 Case 形成真实、可追溯的验证结论，并创建第 3 节所列获准产物。

本申请不包括 **Production Runtime、Deployment、Full Agent Platform、P1**；不申请生产运行/部署/发布、完整业务平台、任意第三方 Plugin、真实 Agent turn、业务工具调用、approval/question 答案重放或 Agent resume。不激活 P0.S-7-2 / P0.S-7-3、P0.S-8 或其他阶段，不将局部 Spike 结论扩展为全局 P0.S PASS。

本申请将验证对象和约束具体化；Runtime 选择、精确输入和数值预算尚未闭合的部分如实保留，不以占位值形成可执行授权。Owner 若仅批准范围或后续输入确定工作，未明确分配的执行额度仍为 0，不能据此启动准备、构建、Driver 或 Runtime。

## 1.2 继承的强制约束

| Inherited Model / Constraint | 本申请承接的执行要求 |
|---|---|
| Authority | P0.S-7 适用的 Authority Anchor、独立 Trust Root、经认证 bootstrap validator / Runtime Validation Driver、Owner Signature、独立 Approval 与用途/时窗/撤销范围；不继承 P0.S-6 的启动权限或已消费预算 |
| Snapshot / Binding | 精确冻结输入、独立 expected Snapshot Reference、最终 payload status/type/signature、正式 Binding 读取路径与字节一致；单向身份依赖，Manifest 内部自洽不能自证批准 |
| Preflight / Controlled Invocation | 按 B3 L0～L5，依次检查 Evidence、Authority、Snapshot/Binding、Package/Integrity、Permission、Boundary；Plan/kind/case/批准/预算匹配，spawn 前原子持久消费 slot |
| Evidence First / Fail Closed | Package 代码或 extraction tool 执行前建立认证来源、受保护证据流和 durable ledger；任一前提不成立即停止，不能补认授权或降低 Gate |
| Runtime Identity Model | Package、Definition、Snapshot、Instance、Invocation 分离；字段归入 `FROZEN_INPUT / RUNTIME_FACT / REFERENCE`，实际 PID/时间/generation/结果不回填冻结输入 |
| Package Integrity | archive、descriptor、全量 inventory、Declared Graph / Actual Closure / Inventory 同域核对；真实磁盘无缺失/额外/越界文件，native/ABI/helper/插件和外部依赖有精确身份 |
| Controlled Launch | 独立启动批准、实际入口/环境/权限/TOCTOU/租约/子进程/网络边界、一次性预检与真实 READY 因果链；无全局 Node/pnpm、source fallback 或自动切换策略 |
| Evidence Contract / Failure Recovery | 四类证据逐条含 identity/source/timestamp/lifecycle state；分类和收口可重推；恢复须 explicit authorization + new state transition + evidence，不自动 retry/restart/resume/reuse |

整体边界为 **Authority → Snapshot → Binding → Preflight → Controlled Invocation**。准备/构建/解包、验证请求、Runtime 启动、对账和控制/恢复分别有具体权限与预算；准备成功不激活 Runtime，Evidence 收口也不授予恢复权。

# 2. Execution Case

## 2.1 本次申请的五项验证 Case

下列 `EAR-C01`～`EAR-C05` 是本申请内部的静态 Case 标签，不是已预留 Invocation ID，不代表五次执行，也不替代 B3 的具体场景规格。每个 Case 的精确 fixture、变体、次数及允许操作在授权后的输入闭合与后续具体预算记录中确定，未完成前不激活。

| Request Case | 验证目标 / 输入前提 | 预期结论与证据 | Execution Plan / Design 对应 |
|---|---|---|---|
| `EAR-C01` — Package feasibility | 选定获准 Package source、构建/准备工具、依赖基线、runtime/组件 roster、目标 fixture 和输出根后，验证 structure、Identity、Integrity | archive/descriptor/全量 payload 与 D/A/I 一致；受控准备经独立 Evidence 与 Byte Verification 后才接受 payload；错包、缺失、额外或坏 hash 按首失败拒绝。不得加载 Package 代码冒充静态检查 | B1 A/B；B3 §5、AC-03/06/10；具体正反变体及构建/提取次数待确定 |
| `EAR-C02` — Runtime identity | 已选 Package/Definition、单次 Plan/Snapshot 和获准实例启动或控制范围 | 冻结身份可解析，实例的 instanceId/generation/PID/processStartTime/endpoint 与 OS/transport 事实关联；PID 单独无效，错误身份阻断；未创建实例不能以 schema 证明实例可行 | B1 B/C；B3 §2～3、AC-04/05；实际实例事实仅在获准动作发生后记录 |
| `EAR-C03` — Snapshot flow | 独立 Authority/Trust Root、精确输入、Owner Signature、expected Ref 和实际 Binding 入口 | Runtime Definition → Runtime Snapshot → Binding 单向链成立，payload type/status/bytes 与选中批准一致；无 runtime facts、双重权威、自引用或旁路入口替代 | B1 B/C；B3 §3～4、AC-04/07/08；各负例需独立固定故障输入与首失败边界 |
| `EAR-C04` — Controlled launch | 已闭合输入、finalized preparation evidence、完整冻结/签名/批准、有效 Startup Activation 与有限预算 | L0～L5 顺序成立后，slot 先消费再 spawn；真实 OS/实例/transport/DeepSeek Harness/profile/persistence 支持 READY；权限、生命周期、停止和 no replay 可证；拒绝负例不等于启动成功 | B1 C；B3 §6、AC-01/02/07～12/16；fresh Windows 无全局 Node/pnpm，具体 launch 变体未分配 |
| `EAR-C05` — Evidence generation | 在工具/Package 执行前就绪的 Driver/collector、主/fallback sink、ledger、来源与容量；以及各动作实际产生的事实 | startup/runtime/failure/recovery 原始证据与索引完整；预算/因果/生命周期可对账，四维分类可重推；缺口如实记录 INCOMPLETE/INCONCLUSIVE/UNKNOWN | B1 D 且采集贯穿 B/C；B3 §7～9、AC-13～15；故障、恢复与独立收口仍分别申请权限 |

Case 之间共享获准输入身份和证据引用，不共享可复用的启动权限。某项 Case 可以需要多个独立准备/验证/恢复动作；本申请不据五项标签推算 Invocation 总数，不批量激活设计合同全部 S7-C/S7-R/S7-E 场景。未到预先指定故障点只能保留未决，不能用更早拒绝代替该负例的证明。

## 2.2 Runtime 选择与未闭合输入

**具体 Runtime 选择仍需授权后确定。** B1/B3 中 bundled Node sidecar、Node/Electron 版本、Windows x64/ZIP 等为已有设计候选；本文不将任何候选提升为已选定或已批准执行的 Runtime，不下载、安装或探测其实物。若授权后拟选择超出已批准设计的策略，须先形成适用的新设计/范围批准，不能失败后自动切换。

后续应在明确获准的输入确定范围内，由 Executor 提出可审查选择、Reviewer 核对、Owner 选定适用输入。实际准备或运行前必须闭合：Package 来源与构建工具、精确 Runtime/ABI/native/helper/插件/Client roster、合法 dependency baseline、fresh Windows 完整 fixture/host inventory、独立 Anchor/key/Driver/collector、绝对输出根/逐文件清单及 Windows 权限/TOCTOU/lease/ledger 边界。

Candidate 保持 `generated_not_applied`，不能改 Source/DRRC lockfile 或沿用失败 cache/quarantine 绕过输入处置。H-05/H-20 继续 `NOT_PROVEN`；若需要 Worker-only 范围，必须在执行前明确批准，不能在完整 Desktop 失败后缩小成功口径。输入和具体预算未闭合时，相关动作保持未授权。

# 3. Requested Artifacts

申请在取得**对应的具体执行授权后**创建以下产物。创建前还需匹配该动作的输入、工具、输出清单和预算；本文不创建目录、空模板、身份文件、Snapshot、Package 或 Evidence。

| Requested Artifact | 请求内容 | 创建与接纳前提 | 当前状态 |
|---|---|---|---|
| Runtime Definition Identity | 唯一 Definition 及其 ContentRef；固定所选 Runtime strategy、entry role、argv/profile/composition、静态 roster、Client/Carrier 协议和各策略，包内版本/字节由 Package 引用解析 | Runtime/Package 选择已完成，具体文件写入范围获准；Definition 为 `FROZEN_INPUT`，不含 PID/实际路径/时间/结果或 Snapshot/Binding 反向引用 | `REQUESTED / NOT_CREATED` |
| Package Identity | 外置 descriptor 及精确 archive/inventory/closure/provenance 引用；packageId/version 标签不代替 byteLength/SHA-256 | 独立获准构建/准备后有真实定型字节；不伪造未知 Package hash，不把 descriptor 放入 archive 形成自身 hash 循环 | `REQUESTED / NOT_CREATED` |
| Runtime Snapshot | 选定 Definition、Package、Frozen Invocation Plan、完整输入 Manifest、设计合同和 Authority Anchor 的唯一 signed payload 本体 | 所有上游输入先定型；payload 最终 status/type 在签名前固定，独立 expected Ref、Owner Signature、正式 Binding 和批准链分别落实；本申请不生成任何签名或 Binding | `REQUESTED / NOT_CREATED` |
| Evidence Records | startup/runtime/failure/recovery 原始事件、来源材料、ledger 关联与最终索引；按合同派生可重推的 Validation Records | 各动作已有适用授权与证据采集权限；仅记录真实达到边界，Evidence First；不提前填运行或恢复结果 | `REQUESTED / NOT_CREATED` |

Runtime Definition → Runtime Snapshot → Binding 为单向依赖。Snapshot 仅容纳冻结输入或对冻结输入的类型化引用；PID、instanceId、generation、实际 SID/时间、READY、预算消费、Gate/准备/恢复结果属于 `RUNTIME_FACT`，不得直接或经引用嵌入 Snapshot。归档 Evidence 仍是事实，不因 hash 或签名变成 Runtime Snapshot 输入。恢复父失败与目标实例由外部动作批准关联并在动作前重新认证。

输出位置沿用 B1 第 3 节的隔离根提案，实际绝对根/ACL/逐文件白名单仍须后续明确批准。本表只申请上述产物范围；Package 构建、受控解包、Manifest/Binding/签名等依赖步骤不因列入产物前提而自动获得创建、修改或执行权限，不创建 Production Runtime 或 Deployment 工件。

# 4. Budget Request

## 4.1 本申请的预算处置

**当前可用预算为 0。** 精确 Runtime/fixture、有限执行变体、准备/构建路径和父失败/恢复动作尚未确定，不能据 Case 数量、设计上限或历史预算推定次数。依本次用户要求，无法确定的额度明确为 **`NOT_REQUESTED`**。

| Budget Item | Requested Quantity / Disposition | Current Usable Quantity | 理由与边界 |
|---|---|---:|---|
| Invocation 数量 / 总数 | `NOT_REQUESTED` | `0` | 五项验证 Case 不等于五次 Invocation；各 kind 与总次数须在输入/具体变体闭合后另行申请 |
| Retry | `0` | `0` | 明确不申请 Retry；隐式 retry/restart/reuse 始终禁止，显式新尝试须新批准、Plan/Invocation 与预算 |
| Resume | `0` | `0` | 不申请 Runtime 或 Agent 业务 Resume，不重放 turn、approval/question 答案或既有请求 |
| Recovery | `NOT_REQUESTED` | `0` | 父失败、对账需求、ATTACH/CONTROLLED_STOP/NEW_LAUNCH 及其输入未确定；Evidence 义务不产生恢复额度 |
| Preparation / Build / Unpack | `NOT_REQUESTED` | `0` | 各自工具/输入/命令/输出与有限资源未闭合；不从 Runtime budget 借用 |
| Validation request / Driver session / 独立证据收口 | `NOT_REQUESTED` | `0` | 需具体请求与会话次数、工具身份、时限和读取范围；零 Runtime launch 不代表这些动作免授权 |
| Runtime physical launch / Desktop launch / child spawn / 控制动作 | `NOT_REQUESTED` | `0` | 具体操作、进程身份、次数与并发共享约束未定；不隐含默认一次 |
| 故障副本准备 / 故障注入 | `NOT_REQUESTED` | `0` | 须独立选定原 Ref、隔离副本、单项 mutation/触发点、注入器及其有限预算 |
| External network / registry/provider requests | `0` | `0` | 本申请不请求外网；需要外部准备来源时另行明确请求和权限，不能隐含下载 |
| Candidate generation / application | `NOT_REQUESTED / 0` | `0` | 不申请新 Candidate 生成；应用和 Source/DRRC lockfile 修改不在本范围 |

`NOT_REQUESTED` 表示尚未提交数量申请，不是无限额度、默认值或授权待自动生效；`0` 表示明确不申请该类动作额度。上述两种处置的当前可用量均为 0，执行授权均未生效。继承的实现范围批准也不能把任一项转换为可消费额度。

## 4.2 后续数值申请与批准要求

后续只有在输入与动作可审查时，才提交引用本 Request ID 及精确摘要的补充/替代申请：有限 case/变体清单、每项期望/首失败/触发点、精确 Runtime/Package/fixture/工具身份、各 kind 次数、跨 case 数值总表、并发共享预算、允许操作/根、时窗/撤销条件、进程/网络/时间/CPU/内存/磁盘/证据上限，以及正常停止、故障 containment 和 finalization 所需权限。未知项仍阻断，不使用工具默认无限值。

B3 §6.5、§9.2～9.3 与 B1 第 6 节的 V/P/R/Q/CONTROL_ACTION/收口上限仅为设计约束，不是本文申请数值或已授额度；扩大上限须新的适用设计审查和 Owner 批准。具体批准须与 Frozen Invocation Plan 完全匹配，缺失或冲突即拒绝。

一旦未来获准执行，slot 必须在 spawn 前持久原子消费，spawn 失败或结果 UNKNOWN 均不退还；失败/过期/已消费 ID 不复用。工具内部重试、健康检查、Desktop 重开、换 Case/Invocation 名称或重新预检不得重置计数。Recovery 如需重新准备/构建/启动，分别申请，不把“恢复一次”解释为全部附带动作。

本申请未提供可直接激活的数值预算包。Owner 可对当前范围和待补事项作决定；任何仅覆盖范围的批准仍不得触发 Invocation，须待具体预算、实物身份及适用生效条件另行齐备。

# 5. Evidence Requirement

未来获准执行必须生成 **startup evidence、runtime evidence、failure evidence、recovery evidence**。每类均保留实际未到达/未获准/未知处置，不能为了满足清单而制造故障、恢复或成功事实。

| Evidence Category | 必需内容 |
|---|---|
| startup evidence | fresh fixture/host inventory、选中的 preparation evidence Ref、Authority/Snapshot/Binding/Package/Permission/Final Preflight 各 Gate 的 expected/observed、正式入口和参数策略、slot/spawn、OS 进程身份及真实 READY/持久化因果链、NOT_REACHED |
| runtime evidence | instance/generation、Desktop/Worker/children 生命周期、attach/detach/close/crash/reopen、权限和预算、获准数据操作、授权截止、显式 stop/exit、残留资源与 no replay |
| failure evidence | Package corruption、Dependency failure、Startup failure、Runtime crash/interruption 的首失败边界、输入/组件身份、expected/observed、原始错误/超时、已用 slot、已到达/未到达、受影响数据和 containment/未知项 |
| recovery evidence | 父失败/原 Invocation、独立具体 recovery authority、新 Plan/Invocation、对账/唯一动作、适用的新旧输入/实例/generation/数据、预检/预算与结果；无批准或未到达必须明确记录 |

每条 Evidence 必须包含以下四组字段，不能仅在 summary 补齐：

| Required Group | 最低语义要求 |
|---|---|
| identity | 唯一 eventId、recordType/category、phase/case/request、适用 invocationId/authority Ref；Package/Definition/Snapshot/Binding/Plan expected/observed Ref 与信任状态；实例生成后才有 instance/generation/PID/processStartTime/endpoint |
| source | sourceType/sourceId/sourceArtifactRef、原 producer/进程身份、collector、采集机制和 sourceSequence；DeepSeek Harness 与 Runtime Validation Driver 分别登记，转发不冒充原始源 |
| timestamp | UTC 发生时间、source-local monotonic time、单位/epoch/不确定性；发生、采集和补录时间分开，跨进程因果另有 causedBy/correlation 和 transport 支持 |
| lifecycle state | stateBefore/stateAfter 或 observationOnly 当前状态、boundaryReached、firstFailureBoundary、subjectOutcome、evidenceState；不得从文件存在推断启动或退出 |

身份未产生为 null + reason / NOT_AVAILABLE，无法观察为 UNKNOWN + reason；未认证值只能为 CLAIMED/OBSERVED。Plugin 证据按 B3 保留 expected/observed/load/omit/blocked/error 和各插件身份/批准处置，不能 silent omit REQUIRED 插件或用整体 READY 代替。

Evidence First 要求在 Package 代码或 extraction tool 执行前认证 Driver/collector，建立受保护主/fallback sink、durable ledger 与请求记录。原始事件追加保存，关键 request/Gate/slot/spawn/failure/stop/terminal 事实在依赖动作前持久 flush；正常事件与容量/时限继承 B3，不静默截断、滚动覆盖或删除旧证据。主 sink 运行中失败只能停止新业务并按已批准范围 fallback/containment，不能继续业务或自动恢复。

Evidence Finalization 必须核对 raw artifact 完整集、sourceSequence/因果、生命周期、Worker/children/lease 残留和全部预算，再生成路径/bytes/SHA-256/来源/时间范围/缺口索引及 Validation Records。索引不含自身 hash，由下游独立 review/closure 固定其精确 Ref；Evidence/摘要/结果不得回填 Snapshot、Manifest 或 Binding。

结果分列 `subjectOutcome`、`validationVerdict`、`evidenceStatus`、`hypothesisDisposition`。证据完整且批准期望与观测一致才可判相应 case PASS；负例正确拒绝只证明边界，不能证明 Runtime 启动或恢复成功。退出码或 summary 文件不自动代表 FINALIZED；未知/缺口保留 `OUTCOME_UNKNOWN / INCOMPLETE / INCONCLUSIVE`。

当前 Recovery budget=`NOT_REQUESTED`。未来真实存在但未获准的恢复请求应记录 `RECOVERY_NOT_AUTHORIZED`；未到达记录 NOT_REACHED，没有相关事件记录不适用及原因。本文不创建此类记录，不执行故障或恢复请求；未获准实际恢复时，完整恢复可行性仍未证明，不能借拒绝证据满足恢复正例。后续对账追加新事实和时间，保留原 UNKNOWN/INCOMPLETE 历史，不覆盖旧证据。

# 6. Stop Conditions

以下条件必须 **FAIL-CLOSED**；本节是申请执行后仍必须遵守的合同，不触发当前任何检查场景或停止动作。

| Stop Condition | 必须处置 |
|---|---|
| identity mismatch | Package、Definition、Plan、工具、真实实例/generation/endpoint 与批准身份不符；停止下一边界或控制，不使用标签/PID/自报值替代认证 |
| snapshot mismatch | 独立 expected Ref、payload bytes/status/type、字段域或引用链不一致；拒绝执行，不自选另一个 Snapshot、覆盖字段或接受旁路文件 |
| integrity failure | archive/payload/hash、依赖闭包/库存、native/ABI/helper/入口缺失、损坏、额外代码或非法路径；阻断准备/加载/启动，不自动 install/heal/fallback |
| boundary violation | 权限/路径/环境/network/children/Plugin 越界、TOCTOU 保护失效、绕 Gate、隐式 retry/resume/replay；拒绝新动作，运行后仅执行事先批准 containment |
| evidence incomplete | identity/source/timestamp/lifecycle state 缺失、来源无法认证、sink/ledger 不可持久、序列缺口或容量超限；停止新业务，不形成成功结论 |
| authority / binding failure | Approval 缺失/过期/撤销/错用途，Trust Root/Owner Signature/独立 Reference 不成立或正式 Binding 不符；不以历史 PASS、实现批准或计划 PASS 放行 |
| budget / lease failure | 数量 NOT_REQUESTED、未授权、耗尽、Plan/批准冲突、slot/lease 原子事务失败或所有权无法对账；不得 spawn、补预算或自动重试 |
| startup / runtime failure | spawn error、身份握手失败、READY timeout、Worker/collector crash、中断或无法证明退出；保留首失败、已消费 slot 和真实未知项 |

启动前失败不得执行 Package 代码或创建 Worker；无 preparation authority 不得启动提取工具。记录首失败和下游 NOT_REACHED；`processCreated=0` 仅在可信外部观察支持时使用，否则 UNKNOWN。启动后失败立即阻断新业务/新 Invocation，只停止确认归属且事先获准处置的资源，cleanup error 追加、不覆盖根因。

无法证明退出或持久化完整时保持 `OUTCOME_UNKNOWN / EVIDENCE_INCOMPLETE`，不创建替代实例。失败不产生恢复权限；后续对账、attach、stop、new launch 需要具体父失败、独立 Owner 批准、新 Plan/Invocation、有限预算和适用门禁。旧 slot 不退还，旧 Evidence 不覆盖。

# 7. Boundary

## 7.1 Owner Decision Boundary

**保持 `P0S7_STATE = NOT_STARTED`、`P0S7_ALLOWED = NO`，直到取得适用于本申请的 Owner Approval。** 已有 Implementation Authorization 的 Owner Approval 不等于本申请或某次启动批准。本文不修改任何现有状态文件，不生成 Owner 决定或签名，不将状态提前设置为 STARTED/YES。

Owner 的后续决定应明确选中本 Request ID、本文精确 SHA-256、B1/B2/B3 身份、批准的 Case/产物/输出范围、待补输入、预算处置和生效条件。若只批准范围或输入确定工作，执行预算仍为 0；即使收到批准，也只有其明确覆盖且满足全部前置条件的动作才能生效，不自动开放所有 Case 或下阶段。

真正执行前必须满足 B1 的 Input closed、Identity defined、Snapshot defined、Evidence defined、Boundary defined，以及对应实物身份、具体数值预算、独立信任/签名/Binding/Activation 和适用 Preflight。Runtime 可在授权后确定，但必须在对应准备/运行前固定并获适用批准；不得以“授权后再选”允许先运行未知字节。

本申请不解除本次禁止事项，也不应用 Candidate、不修改 Source/DRRC lockfile、不改写 P0.S-6 关闭结论或原始 Evidence。完整 Spike 验收仍受 B2/B3 约束；未执行/未获准/未证明项保持缺口，不宣称 Production Runtime、Deployment、完整平台、P1 或全局 P0.S PASS。

```text
EXECUTION_AUTHORIZATION_REQUEST_STATUS = REQUEST_ONLY
REQUEST_OWNER_APPROVAL = NOT_PROVIDED
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S6_CANDIDATE = generated_not_applied
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
P0S7_1_DESIGN = FINALIZED
P0S7_1_IMPLEMENTATION_AUTHORIZATION = OWNER_APPROVED_AND_FROZEN
P0S7_1_EXECUTION_PLAN_REVIEW = PASS
CONCRETE_RUNTIME_SELECTION = TO_BE_DETERMINED_AFTER_AUTHORIZATION
REQUESTED_INVOCATION_COUNT = NOT_REQUESTED
REQUESTED_RETRY_COUNT = 0
REQUESTED_RESUME_COUNT = 0
REQUESTED_RECOVERY_COUNT = NOT_REQUESTED
CURRENT_USABLE_EXECUTION_BUDGET = 0
STARTUP_ACTIVATION = NOT_AUTHORIZED
EXECUTION_STARTED_BY_THIS_REQUEST = NO
```

## 7.2 本次交付、文档核对与未执行事项

本次仅创建 `docs/04-development-records/P0S-7-1-EXECUTION-AUTHORIZATION-REQUEST.md`，以 **UTF-8 without BOM、LF** 保存。内容为申请身份/依据、Requested Scope、五项 Case、Requested Artifacts、预算处置、四类 Evidence、FAIL-CLOSED 和 Owner 生效边界；不改写既有文件或其中文编码。

仅进行静态文档核对：严格 UTF-8 解码、BOM/LF、疑似乱码、七章和必需字段/状态、引用存在性、输入摘要、本文 SHA-256，以及创建前后既有 Git 管理和非忽略未跟踪文件的字节身份与工作区范围。自身 SHA-256 在交付回复中提供，不回填自身形成循环身份。**测试方式：按用户要求未运行测试；未执行 Invocation、Verification、Final Preflight 或 Runtime 验收。** 文档核对不构成执行预算消费或运行 PASS。

未执行：Runtime/Package/Spike 骨架创建；代码、Runner、Manifest、Binding、Snapshot、Identity、签名或 lockfile 修改；Candidate 生成/应用；依赖下载/安装/准备/构建/解包或 Byte Verification；Invocation ID 预留、Invocation 创建/启动/消费；Driver/Runtime/Worker/Agent 启动；测试；Verification；Final Preflight；故障注入、对账、attach/stop、Retry/Restart/Resume/Recovery；密钥配置、私钥读取、Owner Signature 或执行批准生成；Commit；Push。当前所有 Requested Artifacts 均未创建，所有 Case 均未执行。
