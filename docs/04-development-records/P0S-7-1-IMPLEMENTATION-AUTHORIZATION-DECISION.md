# P0.S-7-1 Implementation Authorization Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-1-IMPLEMENTATION-AUTHORIZATION-20260905-01` |
| Document Type | `IMPLEMENTATION_AUTHORIZATION_DECISION_RECORD` |
| Status | `OWNER_REVIEW_REQUIRED` |
| Decision Date | `2026-09-05` |
| Decision Role | Shaco Forge P0.S-7-1 Implementation Authorization Decision Architect |
| Authorization Subject | `P0.S-7-1 Runtime Controlled Execution Spike` |
| Parent Planning ID | `P0S7-ARCHITECTURE-PLANNING-20260905-01` |
| Design Contract ID | `P0S7-1-DETAILED-DESIGN-CONTRACT-20260905-01` |
| Owner Approval | `NOT_PROVIDED` |
| Implementation Authorization | `NOT_AUTHORIZED` |
| Execution Authorization / Startup Activation | `NOT_AUTHORIZED` |
| Current Deliverable | 仅本执行授权治理文档 |

本决定将可提交 Owner 批准的实现范围、禁止事项、执行门禁、预算与验收义务形成可审查记录。当前只获准创建本文；下文 Allowed Work 是 **Owner 明确批准后才可生效的范围**，不是当前执行指令。文档创建、设计审查通过和实现就绪均不构成 Owner Approval，不创建 Runtime、Package 或 Invocation。

## Decision Basis and Current State

| State Item | Current Value | 依据与含义 |
|---|---|---|
| P0.S-6 State / Result | `CLOSED / VERIFIED_WITH_CANDIDATE` | 最终关闭记录、Current State 最终状态段及本次用户输入；保留历史结论 |
| P0.S-6 Candidate | `generated_not_applied` | 已生成但未应用；不转为依赖准备或 Runtime 可用输入 |
| P0.S-7 State / Allowed | `NOT_STARTED / NO` | 本次用户输入；本文不激活阶段 |
| P0.S-7 Architecture Planning | `PASS` | 本次用户明确提供的审查状态 |
| P0.S-7-1 Detailed Design Contract Status | `DESIGN_ONLY` | 现存设计合同；不回写其状态 |
| Design Review | `PASS` | 本次用户明确提供；不虚构独立 Review 文件、Reviewer 身份或签名 |
| READY_FOR_IMPLEMENTATION | `YES` | 可提交实现授权决定；不等于允许实施或启动 |
| This Decision Status | `OWNER_REVIEW_REQUIRED` | Owner 尚未批准本决定的具体范围和执行预算 |

现存设计合同保留起草时“独立审查待审查”的历史描述。本决定采用本次输入提供的后续 Design Review `PASS`，不修改原合同，也不将 Review PASS 当作 Owner Approval。P0.S-6 采用最终 Technical Validation Extension 关闭结论，不用早期阻断记录覆盖后续最终事实。

以下为本次只读取得的输入文件身份，用于审查溯源；不是 P0.S-7 的 Authority Anchor、Execution Snapshot、Trust Root 或实物冻结。

| Input | Bytes | SHA-256 |
|---|---:|---|
| [Detailed Design Contract](P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | 86292 | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |
| [Architecture Planning](P0S-7-ARCHITECTURE-PLANNING-DECISION.md) | 52261 | `9FCD637A922B25BCDA7B1F169F9CF9F06EE8754720EFC70D51992E2EA8665BA9` |
| [P0.S-6 Final Closure](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-CLOSURE-DECISION.md) | 8456 | `700020985AFC734F8ECD5C229AEE4EFC489C42A930A60611471D9FE4E755C969` |
| [P0.S-6 Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | 11824 | `71E974AB17068FA0920A58B4E1D1BF2458D78633537E25C16666AD9562EC3349` |
| [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md#p0s-6-technical-validation-extension-final-closure-state-2026-09-05) | 31321 | `6A7EC91606362EF16409AF8F5E76E5CEF04DD8C6E594AAE3DDDF24117E486F17` |

继承 P0.S-6 的 **Authority Anchor、Execution Snapshot、Trust Root、Snapshot Binding、Owner Signature、Final Preflight、Controlled Invocation、Evidence First、Fail Closed Execution**。继承的是治理约束，不复用其已消耗的 Invocation、预算、签名用途或历史执行权限。

继承 P0.S-7-1 Design Contract 的 **Identity Model、Snapshot Model、Binding Model、Package Integrity、Controlled Launch、Evidence Contract、Failure Recovery**，包括冻结输入与运行事实分域、单向身份依赖、独立受信批准、精确字节认证、实际 Binding 入口核对及独立受控解包。本文补充授权决定，不重写设计模型。

# 1. Authorization Scope

本授权的唯一拟批准对象是 **P0.S-7-1 Runtime Controlled Execution Spike**：在有限、隔离、可停止、可举证的条件下，创建 Spike 骨架和 Package Feasibility 验证工件，验证身份、快照流与受控启动的可行性。

以下不在范围内：

- Production Runtime，包括生产部署、生产运行或生产可用性承诺。
- Full Agent Platform，包括完整 Agent 平台及真实业务工作流扩展。
- P1 Implementation，以及 P0.5、P0.S-8 或其他阶段的自动启动和基线冻结。

Architecture Planning 的阶段拆分仍保留。本决定采用本次用户指定的 P0.S-7-1 Spike 授权对象；引用设计合同中的准备、启动、失败或恢复场景，不自动授权 P0.S-7-2 / P0.S-7-3，也不宣称其完成。

Owner Approval 必须通过可独立认证的记录，明确选中本 Decision ID、本文精确 SHA-256、所采用设计合同的精确身份、批准的工作项与输出范围、生效条件及限制。本文的标题、状态字段或执行器自报的“已批准”不能替代该记录。本文 SHA-256 在交付时单独返回，不写入自身形成自引用。

实现批准可仅覆盖骨架与验证工件编写。准备、构建、解包、验证驱动、Runtime 启动及恢复等执行动作，还必须有匹配的具体执行授权与预算，并满足第 4、5 节；通用实现批准不能将未授权预算变为可用。

# 2. Allowed Work

以下为待 Owner 审查批准的完整允许清单。**当前所有工作项均为 `NOT_AUTHORIZED`，尚未执行。**

| ID | 允许工作 | 生效边界与预期交付 |
|---|---|---|
| AW-01 | 创建 Runtime Spike 骨架 | 仅实现设计合同定义的最小受控执行结构；批准须界定隔离输出位置与允许改动清单，不因骨架存在启动任何进程 |
| AW-02 | 创建 Package Feasibility 验证工件 | 编写获准范围的验证驱动、工件规范与验证记录结构；实际 Package 准备、构建、解包和执行须另有对应输入批准及有限预算 |
| AW-03 | 验证 Package Identity | 对批准 archive、descriptor、payload inventory、组件/依赖闭包及实际字节核对；需匹配的验证权限，不加载未认证代码探测 |
| AW-04 | 验证 Runtime Identity | 区分 Definition、Snapshot、Instance、Invocation；真实 PID/start-time/generation/endpoint 等仅由获准执行产生并写入 Evidence |
| AW-05 | 验证 Snapshot Flow | 核对 Authority → Snapshot → Binding → Preflight 的单向链、独立 expected Reference 和实际入口；不得把运行事实回填 signed snapshot |
| AW-06 | 验证 Controlled Launch | 仅在完整授权链、精确冻结输入、Final Preflight 与未消耗预算同时成立时，执行明确选中的场景 |
| AW-07 | 生成 Evidence 与 Validation Records | 按第 6 节记录真实观察、门禁结果、生命周期、预算和失败/恢复处置；不伪造未执行步骤的证据或 PASS |

任何实现或验证需要超出上述范围时，先停止受影响工作并提交独立范围决定。H-05 / H-20 等既有未证明项继续保留；若需要更窄的 Worker-only 范围，须在执行前明确批准，不能失败后重命名结果来满足验收。

# 3. Forbidden Work

下列事项不属于本决定可生效的授权范围，不能通过 Allowed Work 或预算字段间接放行：

- 修改 P0.S-6 已关闭结论、原始 Evidence、已冻结治理工件或已消耗 Invocation 的历史事实。
- 应用 Candidate；将既有 `generated_not_applied` Candidate 默认为已批准依赖基线。
- 修改 Source Lockfile 或 DRRC Lockfile；借用失败 node_modules、缓存或 quarantine 绕过输入批准。
- 进入 Production Runtime、Full Agent Platform 或 P1 Implementation。
- 引入、安装、发现、加载或执行第三方 Plugin；已有设计中的静态 roster 不授予新增第三方 Plugin 权限。
- 自动更新、自动安装/修复依赖、自动切换 Runtime 策略或系统 Node/pnpm fallback。
- 隐式 Retry、自动 Restart、自动 Resume、已消耗 Invocation/slot 复用或业务请求重放。
- 未授权 Invocation，包括未单独获准的准备、构建、解包、验证请求、Runtime 启动、对账和恢复。
- 绕过 Authority、Snapshot、Binding、Preflight 中任一 Gate，或把 Manifest 内部哈希自洽当作独立信任。
- 因 Runtime READY 自动执行真实 Agent turn、业务工具调用、approval/question 答案提交或 Agent resume。

本次文档任务还明确禁止：创建 Runtime 或 Package；修改任何代码、Runner、Manifest、Binding、lockfile；测试；创建或启动 Invocation；commit；push。后续实现的拟批准清单不解除这些本次执行限制。

# 4. Execution Boundary

Runtime Spike 必须依次经过如下链路，**不得绕过、跳步或用后续结果补认前置授权**：

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

| Boundary | 必须成立的条件 | 未满足时 |
|---|---|---|
| Authority | P0.S-7 独立 Owner Approval / Activation；可信 Anchor、经认证的 Driver/validator、明确用途、场景、时窗、撤销状态和预算 | `AUTHORITY_BLOCKED`；设计 PASS 和 P0.S-6 PASS 均不放行 |
| Snapshot | 批准的 Package / Definition / Invocation Plan / 输入清单形成精确冻结输入；身份域与依赖方向符合设计；独立选定 expected Snapshot Reference | `INTEGRITY_BLOCKED`；拒绝错 Snapshot、运行事实注入、引用环或双重权威 |
| Binding | 独立 Trust Root 与 Owner Signature 认证精确 payload bytes；状态、recordType、Reference、实际 Binding 路径及字节一致 | `INTEGRITY_BLOCKED`；禁止仅验证旁路 corrected 文件或自选公钥/Reference |
| Preflight | 顺序落实设计合同 L0～L5：证据可持久化、授权有效、输入认证、完整 Package/依赖核对、权限/路径/环境/子进程边界、租约、剩余预算和临近 spawn 的一致性 | 首失败处停止，下游 `NOT_REACHED`；不得以检查过程加载 Package 代码 |
| Invocation | 仅消费获准 kind、case 与唯一 Plan；在 OS spawn 前原子持久化 slot 消费和租约；之后才尝试一次受控启动并采集真实事实 | 未满足即零启动；消费后 spawn 失败不退还预算，不复用旧 slot |

Evidence First 是所有执行边界的前提：在 Package 代码或提取工具执行前，先建立经认证的采集来源、受保护 evidence sink 和持久预算 ledger。Final Preflight 只判定现有权限是否可用，不生成新权限，也不替代 Owner Approval。

Preparation 与 Runtime Launch 分开批准、分开 Snapshot/Plan、分开预算。未来 Package 必须遵循 **Frozen Archive → 独立 Preparation Invocation → Evidence → Byte Verification → Runtime Payload**；禁止 silent unpack，准备成功不授予 Runtime 启动权。验证、只读对账、ATTACH / CONTROLLED_STOP 各自使用设计合同规定的类型和批准范围；不能借“不是 Runtime 启动”执行无预算动作。

冻结输入与运行事实分离。PID、实际时间、instanceId、generation、已用预算、Gate 结果和恢复事实只能进入 Evidence/ledger；不得回写 Snapshot、Manifest、Binding 或已签名输入。上游字节改变必须重新形成受影响的下游身份、冻结与批准。

# 5. Budget

当前未提供本次具体 case 集合、执行次数及可激活的总预算。设计合同 §6.5、§9.2～9.3 的规格是设计上限，**不是已批准额度**。本决定不推定“一次默认可用”，不把全部设计场景累加为执行授权。

| Budget Item | 当前授权状态 | 当前可用数量 | 后续明确要求 |
|---|---|---:|---|
| Invocation 总数 | `NOT_AUTHORIZED` | `0` | Owner 明确有限 case 集、各 kind 次数、跨 case 总上限与有效期 |
| Preparation / Build / Unpack | `NOT_AUTHORIZED` | `0` | 独立准备/构建范围、工具和输入身份、输出根、资源与执行次数；不从 Runtime 额度借用 |
| Validation Request / Driver Session | `NOT_AUTHORIZED` | `0` | 明确请求及 Driver 会话上限；负例验证也需要权限 |
| Runtime Physical Launch | `NOT_AUTHORIZED` | `0` | 唯一 Plan、单次尝试与跨场景总启动上限，含并发共享预算约束 |
| Retry / Restart | `NOT_AUTHORIZED` | `0` | 隐式 Retry/Restart 始终禁止；显式再次尝试须另行批准、新 Plan 和新预算 |
| Resume | `NOT_AUTHORIZED` | `0` | 不自动恢复进程或业务；后续恢复须具体动作批准，不转授 Agent resume |
| Reconciliation / Control Action / Recovery | `NOT_AUTHORIZED` | `0` | 选定父失败及唯一允许动作，独立对账、attach、stop 或新启动预算 |
| Candidate Generation / Derivation | `NOT_AUTHORIZED` | `0` | 没有新 Candidate 生成授权；既有 Candidate 不计作本阶段新产出 |
| Candidate Application | `NOT_AUTHORIZED`，且在本决定范围内禁止 | `0` | 本决定不能授权应用 Candidate 或修改 Source/DRRC lockfile |
| External Network / Child Process / Desktop Launch | `NOT_AUTHORIZED` | `0` | 单独列明 endpoint、进程/请求数及必要动作；继承设计的外部网络预算 `0` |

**禁止自动扩大预算。** 后续批准须固定每个 case 的输入、期望、首失败边界、工具身份、允许操作、请求/进程/时间/磁盘/证据容量等有限上限，并明确终止与收口所需预算。未指定、不明确、耗尽或无法对账的维度一律 `NOT_AUTHORIZED`；不能用 TBD、工具默认值或剩余历史预算放行。

有效权限必须同时满足独立批准与 Frozen Invocation Plan，两者不一致即拒绝。新名称、新 Invocation ID、重新打开 Desktop、重新预检、健康检查或工具内部重试均不得重置计数。已消费 slot 不退还；结果未知时保留消费事实并阻断替代启动。扩大设计上限需新的合同审查及 Owner 明确批准，不能由执行器自动调整。

# 6. Evidence Requirement

获准验证后必须生成以下四类 Evidence，并形成可重推的 Validation Records。当前仅定义要求，**没有生成任何 Runtime 执行证据**。

| Evidence | 必需内容 |
|---|---|
| Startup Evidence | fresh Windows / host inventory；准备工件引用；Authority、Snapshot、Binding、Integrity、Permission、Final Preflight 结果；实际入口与参数策略；slot/spawn/真实进程身份及 READY 因果链；未到达边界 |
| Runtime Evidence | 实例与子进程生命周期、attach/detach、Desktop 与 Worker 关系、权限和预算消费、获准数据操作、授权截止、停止与退出观察；无重复 Worker / 无业务重放 |
| Failure Evidence | 首失败边界、expected/observed 身份、原始错误与来源、已消费预算、已达到/未达到动作、未知项、受影响资源及 containment 结果 |
| Recovery Evidence | 父失败及原 Invocation 引用、独立恢复批准、新 Plan/Invocation、对账和唯一允许动作、新旧身份、Preflight、预算和结果；未获准或未到达明确记录 `NOT_AUTHORIZED / NOT_REACHED` |

每一条 Evidence 必须包含以下四组字段，不能只在 summary 中补齐：

| Required Group | 必需语义 |
|---|---|
| `identity` | 唯一 eventId、phase/case/request、适用的 invocationId 和 authority Ref；Package/Definition/Snapshot/Binding/Plan 的 expected/observed Ref 与信任状态；已创建实例的 instanceId/generation/PID/processStartTime/endpoint |
| `source` | sourceType/sourceId/sourceArtifactRef、原始 producer、collector 身份、采集方式和 sourceSequence；DeepSeek Harness 与 Runtime Validation Driver 分别登记，不以转发器冒充原始来源 |
| `timestamp` | UTC 事件时间、适用的单调时钟及单位/epoch/不确定性；发生时间与采集/补录时间分开；跨进程因果另用 causedBy/correlation 引用支持 |
| `lifecycle state` | stateBefore/stateAfter 或 observationOnly 当前状态、boundaryReached、适用的 firstFailureBoundary、subjectOutcome、evidenceState；不得从文件存在推断 Runtime 已启动或退出 |

身份尚未生成时使用 `null + reason` 或 `NOT_AVAILABLE`，观察不足时使用 `UNKNOWN + reason`；预身份拒绝至少保留 requestId、认证 Driver 来源和原因。未经认证的身份只能标为 `CLAIMED / OBSERVED`，不能伪造为 `AUTHENTICATED`。

原始 Evidence 追加保存；索引记录各 artifact 的规范路径、字节数、SHA-256、来源关联、时间范围、生命周期和预算对账、缺口及残留。索引不包含自身 hash，后续 review/closure 记录引用其精确身份。Failure/Recovery 不适用或未执行时保留明确状态，不虚构故障或恢复成功。

Validation Records 必须分别记录 `subjectOutcome`、`validationVerdict`、`evidenceStatus` 和 `hypothesisDisposition`。负例正确拒绝只证明边界成立，不能证明 Runtime 启动成功。Evidence 不完整时为 `INCOMPLETE / INCONCLUSIVE`；只有拒绝恢复的记录不能满足实际恢复可行性验收。任何 Evidence 都不能回填已冻结输入或覆盖 P0.S-6 历史。

# 7. Stop Conditions

下列任一条件成立即 **FAIL-CLOSED**，禁止继续进入下一执行边界：

| Stop Condition | 判定与必须动作 |
|---|---|
| Identity mismatch | Package、Definition、Plan、实际进程、instance/generation/endpoint 或工具身份与批准对象不一致；阻断启动或后续控制 |
| Snapshot mismatch | expected Reference、精确 payload、状态/type、输入链或身份域不一致；`INTEGRITY_BLOCKED`，禁止换用自选 Snapshot |
| Package integrity failure | archive/payload/hash、闭包/库存、native/ABI/入口缺失、篡改或额外可执行输入；`PACKAGE_BLOCKED / DEPENDENCY_BLOCKED`，禁止就地安装修复后继续 |
| Authority / Binding failure | Approval 缺失、过期、撤销、用途不符；Trust Root/Owner Signature 无效；正式 Binding 入口与批准字节不一致；停止且不继承历史权限 |
| Boundary violation | 越权路径、环境注入、权限/网络/子进程越界、TOCTOU、未经批准 Plugin、绕 Gate、隐式 Retry/Resume 或业务重放；拒绝新动作并进入受控停止 |
| Budget unavailable / exceeded | 任一预算未授权、缺失、耗尽、ledger/租约不可持久化或并发所有权不明确；不得消费新 slot 或自动扩大额度 |
| Evidence incomplete | identity/source/timestamp/lifecycle state 缺失、来源无法认证、sink 不可用、序列缺口或证据容量超限；不能继续业务或形成成功结论 |
| Startup / Runtime failure | spawn error、身份握手失败、READY timeout、Worker/collector crash、执行中断、未知残留或无法证明退出；保留首失败及 `OUTCOME_UNKNOWN` 等真实状态 |

启动前失败：不运行 Package 代码、不创建 Worker，记录首失败和后续 `NOT_REACHED`。`processCreated=0` 仅在外部观察足以证明时记录，否则保持 `UNKNOWN`。

启动后失败：立即阻断新业务和新 Invocation，只执行事先授权范围内的停止、资源隔离和证据收口；保留原错误，cleanup 错误追加记录。主 sink 失败只能尝试事先批准的 fallback sink，不能因此继续运行或增加容量。退出或持久化无法确认时保持 `OUTCOME_UNKNOWN / EVIDENCE_INCOMPLETE`，不写成功终态。

失败不产生恢复权限。后续必须先有明确父失败记录与 Owner 处置；需要对账、attach、stop 或新启动时，分别提供具体批准、新 Invocation Plan、有限预算并重新经过适用门禁。禁止自动 Retry、Resume、重新提交业务或复用已消费 slot；本文不执行任何停止/恢复场景。

# 8. Acceptance Criteria

以下为未来获准执行的验收标准，覆盖设计合同 §9 的适用要求。**所有条目当前均为 `NOT_EXECUTED`，没有新增验收 PASS。** 未授权场景不能通过“跳过”获得成功结论。

| Criterion | 通过要求 | 必需记录 / 不足时处置 |
|---|---|---|
| Fresh Windows | 在批准的全新 Windows x64 fixture、普通用户环境运行获准 Package；完整 build/revision、镜像来源与宿主 inventory 明确，无开发源码/缓存回退 | fixture/host inventory 和外部观察；开发机结果不替代 fresh Windows 证据 |
| No global Node/pnpm | 宿主无可用全局 Node/pnpm；实际 Worker execPath 使用已认证的 bundled runtime，无 PATH/registry/source fallback | 宿主 inventory、真实进程路径、环境/加载观察；缺失为 `INCONCLUSIVE` |
| Package identity | archive、descriptor、全部 payload、版本/ABI/native/helper/允许 roster 与批准输入一致；Declared Graph、Actual Closure、Inventory 按设计同域核对；错包、缺失、额外文件及坏 hash 被拒绝 | 全层身份与字节对账；仅 package.json 或 archive hash 不足 |
| Runtime identity | Definition/Snapshot/Instance/Invocation 分域；PID/start-time/instanceId/generation/endpoint 因果匹配；拒绝 PID 复用、旧 generation、错误握手；attach 不创建第二 Worker | OS、控制通道、Carrier 与 ledger 原始记录；schema 存在不证明真实实例 |
| Snapshot / Binding flow | 单向冻结、独立 expected Ref、Owner Signature、正式入口和精确 payload 一致；运行事实不进入 signed snapshot；错误链在对应边界拒绝 | 来源、精确身份、正反例及首失败记录；内部自洽不算独立认证 |
| Startup authorization | 独立 Authority/Trust Root/Approval/Activation 有效，唯一 Plan 与预算匹配；缺失、过期、撤销、错用途、耗尽或复用均拒绝 | 各 Gate expected/observed、批准引用、ledger 和无未授权 launch 证据 |
| Controlled launch | 严格经过 Authority → Snapshot → Binding → Preflight → Invocation；slot 先消费后 spawn；入口/参数/权限/环境/子进程受控，真实 READY 可溯源，无重复启动与业务重放 | L0～L5、ledger、OS/transport/DeepSeek Harness 事实；退出码或 UI connected 不能替代 |
| Controlled preparation | 无 preparation authority 零提取；获准解包有独立 Invocation/Evidence，全量 byte verification 后才接纳 payload；准备完成仍不自动启动 Runtime | preparation approval、工具身份、ledger、提取与核对证据；silent unpack 即失败 |
| Failure handling | 覆盖 package corruption、dependency failure、startup failure、Runtime crash/interruption；首失败、预算消费、停止及残留可核对，所有失败均 FAIL-CLOSED | 故障触发点与原始证据；无自动 install/heal/retry/restart/resume，未知项如实保留 |
| Explicit recovery | 先证明未获准不恢复；实际恢复须独立批准、新 Plan/Invocation、适用的新冻结链与 Preflight；无重复业务、无 slot 复用 | 父失败 → 恢复批准 → 对账/动作 → 结果全链；只拒绝恢复不足以通过正例 |
| Evidence completeness | Startup、Runtime、Failure、Recovery 每条含 identity/source/timestamp/lifecycle state；raw index/hash、因果、预算及终态可由 Reviewer 重推 | 四维分类分开；缺口为 `INCOMPLETE / INCONCLUSIVE`，不得以 summary 自证完整 |

完整 Spike 通过建议要求批准范围内的正例、拒绝边界、适用失败及实际恢复证据满足上述标准；未选择或未授权场景保留未验证结论。独立 Reviewer 形成验证结论，Owner 另行决定接受约束或阶段处置。局部验收通过不修改 P0.S-6，不将 H-05/H-20 标为已证明，不宣称全局 P0.S PASS，不启动 Production Runtime 或 P1。

# 9. Owner Decision Boundary

Owner 审查对象是本文的精确版本与第 1～8 节约束。批准记录须明确允许的实现工作与执行动作；若只批准实现，执行预算仍保持 `NOT_AUTHORIZED`。未提供具体 case、输入、工具/fixture 身份、信任/冻结/启动批准或预算时，相关动作继续阻断。

设计合同 §9.4 的实物依赖仍须逐项处置，包括精确 runtime 工件与依赖基线、fresh fixture、P0.S-7 独立 Anchor/Trust Root/Driver、实际权限与 ledger enforcement，以及 Package/Snapshot/Binding/Signature 的精确冻结。不因 `READY_FOR_IMPLEMENTATION = YES` 将这些对象视为已存在或已批准。

当前没有 Owner Approval，本决定不签署批准、不配置密钥、不激活权限、不修改任何现有状态文件。Owner Approval 之后，只有被明确批准且满足全部前置条件的工作才可执行；阶段状态变化须由相应生效记录表达，本文不预写为已启动。

```text
DECISION_STATUS = OWNER_REVIEW_REQUIRED
OWNER_APPROVAL = NOT_PROVIDED
READY_FOR_IMPLEMENTATION = YES
IMPLEMENTATION_AUTHORIZATION = NOT_AUTHORIZED
EXECUTION_AUTHORIZATION = NOT_AUTHORIZED
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S6_CANDIDATE = generated_not_applied
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
CURRENT_AUTHORIZED_INVOCATION_BUDGET = 0
RUNTIME_EXECUTED_BY_THIS_DECISION = NO
```

# 10. Deliverable, Document Checks and Unexecuted Actions

本次仅新增 `docs/04-development-records/P0S-7-1-IMPLEMENTATION-AUTHORIZATION-DECISION.md`，使用 **UTF-8 without BOM、LF**。内容包括 Decision Identity、授权范围、Allowed / Forbidden Work、执行边界、未授权预算、Evidence Requirement、FAIL-CLOSED Stop Conditions、验收标准和 Owner 生效边界。

仅进行静态文档检查：严格 UTF-8 解码、BOM/换行与疑似乱码检查、必需章节/状态/字段及相对引用检查、SHA-256 计算，以及已有工作区修改和受保护输入文件的只读身份核对。这些检查不运行项目测试、Runner、Final Preflight 或 Runtime 验证；文档完成不等于任何运行验收完成。

未执行：Runtime/Package 创建；代码、Runner、Manifest、Binding、Snapshot、签名、lockfile 修改；Candidate 生成或应用；依赖下载/安装/构建/解包；测试或验证场景；Final Preflight；Invocation 创建/执行；Runtime/Worker/Agent 启动；故障注入、对账、Retry、Resume 或恢复；Owner 签名/批准；commit；push。既有文件及其中文编码保持原状，已有工作区修改不由本次覆盖。
