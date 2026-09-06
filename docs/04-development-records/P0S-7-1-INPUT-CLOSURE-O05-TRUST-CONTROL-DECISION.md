# P0.S-7-1 EAR-C01 O-05 Trust / Control Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-1-INPUT-CLOSURE-O05-TRUST-CONTROL-DECISION-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Record Date | `2026-09-05` |
| Decision Scope | EAR-C01 O-05：Authority、Trust Root、Driver、Evidence 与权限输入边界 |
| Decision Basis | 本轮输入决策指令及既有合同；不创建信任实物、不签名、不执行验证 |
| EAR-C01 Authorization | `P0S7-1-PARTIAL-EXECUTION-AUTHORIZATION-20260905-01` / `OWNER_APPROVED_PARTIAL_SCOPE` |
| O-01 / O-02 / O-03 / O-04 | `COMPLETED / COMPLETED / COMPLETED / COMPLETED`：边界决定已完成，不代表精确输入已闭合 |
| Trust / Control Boundary Decision | `CONFIRMED`：职责、独立选择、历史信任隔离与事实分类规则已确定 |
| Exact S7 Trust / Control Inputs | `UNKNOWN`：Anchor、公钥身份、Driver/collector、Approval/Reference 与控制材料尚未齐备 |
| Trust / Control Closure / Input Closure | `BLOCKED / BLOCKED` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Current Usable Execution Budget / Invocation | `0 / 0` |
| Deliverable | 仅本文；不是新的 Runtime Approval、Trust Root、Signature、Binding 或 Evidence 工件 |

`CONFIRMED` 表示本轮确定的职责/边界或已有记录支持的要求，不表示公钥可信性、签名有效性、Driver 身份或批准有效性已验证。缺少精确对象或材料时为 `UNKNOWN`；缺少必需输入或许可时为 `BLOCKED` / `NOT_AUTHORIZED`。文档日期与 Decision ID 不是执行批准时间、密钥身份或 Invocation ID。

## Read Basis

| Ref | 读取依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-1-INPUT-CLOSURE-RECORD.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-RECORD.md) | `0C227154105F65ACC5E7C545753E7F0A03427E21DDEC2FD2C3F8A3568233F223` |
| R2 | [P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md) | `AA3AA657925F83BBED122B821FF39F765E10C2A4A558DA09D738C60A5B9CDD7A` |
| R3 | [P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md) | `83CDE876F95130F1A20D06061A626B88CECF1CC3281F6429D3808EE2090827BD` |
| R4 | [P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md) | `741236DAF541AD7BDC12E66DEC992545657223C6CFCCC1A35D650A71FBFA4581` |
| R5 | [P0S-7-1-INPUT-CLOSURE-O03-DEPENDENCY-BASELINE-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O03-DEPENDENCY-BASELINE-DECISION.md) | `1D79585EDA90B8C913312E7E238D5E75DA3C3745B136E738A052F621EF38FF17` |
| R6 | [P0S-7-1-INPUT-CLOSURE-O04-ENVIRONMENT-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O04-ENVIRONMENT-DECISION.md) | `25F39B939F5033685AE2F419AAB0F64322B493210194760E243BF72E0BB676B3` |
| R7 | [P0S-7-1-DETAILED-DESIGN-CONTRACT.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md)，补充读取 §4 Binding Model 与 §7 Evidence Contract | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |

R1 TC/R2 B05 是信任缺口依据；O-01～O-04 提供来源、Runtime、依赖与环境边界；R7 用于保持独立 bootstrap、精确引用和 Evidence Finalization 合同。本轮只读文档与核对文档/工作区字节范围，不打开密钥材料，不运行验签、Driver 或 Preflight。以上 SHA-256 是文档身份，不是本文的签名或 S7 Trust Root。

# 1. Authority Boundary

**决定由项目 Owner 保留 Runtime approval、Snapshot approval 和 Execution authorization 的权限；三者的对象、用途与生效条件分别记录。** 文档作者、Driver、Collector、Desktop、Worker 或 DeepSeek Harness 都不能自行授予或扩大这些权限。

| Authority / Role | 权限所有者 | 决定的边界 | 当前状态 |
|---|---|---|---|
| Runtime approval | 项目 Owner | 明确适用 Spike/Case、Runtime/Package/Definition 输入与允许动作；输入策略决定不等于 Runtime 创建或启动许可 | `NOT_AUTHORIZED`：当前无适用运行批准 |
| Snapshot approval | 项目 Owner | 独立选定精确 Snapshot payload Ref、Freeze Approval、正式 Binding 入口与用途；冻结批准不能由 Snapshot 自声明 | `NOT_AUTHORIZED`：本轮不创建、冻结、签名或批准具体 Snapshot |
| Execution authorization / Startup Activation | 项目 Owner | 独立固定 scenario/kind、适用批准引用、时窗/撤销、预算及受控根；和 Frozen Invocation Plan 匹配后才有可能进入后续 Gate | `NOT_AUTHORIZED`：所有当前执行预算为 0 |
| Authority Anchor 选择 | 项目 Owner | 选择明确适用 S7 的完整不可变 source Anchor 及 build ancestry 要求；不等于目录选择或当前 HEAD | `UNKNOWN`：精确 Anchor 未提供 |
| Driver 的操作权限 | 由 Owner 的具体授权限定，Driver 负责执行检查 | 只能执行被明确允许的检查/动作，记录结果并 FAIL-CLOSED；不能自行批准、增加预算或启动替代流程 | `NOT_AUTHORIZED`：本轮不运行 |
| Collector 的记录权限 | 由 Owner 批准的采集范围和受信控制层限定 | 保留原始来源、身份和生命周期；不能修改授权、改写原始事实或给事实补批准 | `NOT_AUTHORIZED`：本轮不采集运行 Evidence |

当前已有 `P0S7-1-PARTIAL-EXECUTION-AUTHORIZATION-20260905-01` 只覆盖 EAR-C01 输入准备与分析；其有效性不因本文而撤销，也不扩展为 Snapshot、Signature、Binding、Preflight 或 Runtime 许可。O-01～O-04 完成、Implementation Authorization 的既有状态和历史 PASS 均不产生新的可用执行预算。

项目源候选根仍为 `D:\Project\Shaco-Forge`，upstream 仍为 REFERENCE_SOURCE。Anchor 必须独立明确适用于实际项目的源与构建关系，不能从 upstream 的历史 commit、工作目录、文档 hash 或任意当前 HEAD 自动推导。

本文确认权限归属，不虚构 Owner 具体身份材料、授权委托、批准时间、key 指纹、Activation 或运行批准编号。未来实际可用权限受独立批准与 Frozen Invocation Plan 共同约束；不匹配即拒绝，不通过静默缩减场景或修改 Plan 自行适配。O-06 的未来权限变更仍需明确决定。

# 2. Trust Root Boundary

**决定沿用独立信任入口和精确字节身份模型：可信公钥、签名有效、独立选中的 Snapshot/Approval 必须分别成立。** 采用既有合同的 Ed25519 + governance-record-hash 规则作为模型，不在本轮生成或选择密钥实物。

| Trust Item | 定义 / 决定 | 未来所需材料 | 当前状态 |
|---|---|---|---|
| Trust Root | 由 Owner 经独立可信治理渠道选定的公钥/用途及 bootstrap 信任基线；不能由待验证 Package、Manifest 或 Binding 提供可替换信任入口 | S7 适用来源、精确公钥身份、用途、bootstrap 身份/交付、批准与保护边界 | `UNKNOWN` |
| Public Key | 外部预先选定的验证公钥；key 标签不代替原始内容与指纹 | 精确算法/公钥材料身份，指纹域为 `DER SubjectPublicKeyInfo SHA-256`；适用 Owner 选择与用途 | `UNKNOWN`；本轮未读取公钥/私钥实物，也未计算 key 指纹 |
| Signature role | 对精确 payload bytes 作合同限定用途的 Owner 签名；角色由 signed recordType 与 governing contract 限定 | 对应 Snapshot 或独立 Approval 的精确对象、recordType 与签名授权；Snapshot 与 Freeze Approval 用不同 recordType | `NOT_AUTHORIZED`：本轮不签名、不验签 |
| Snapshot Reference | 指向精确 signed payload bytes 的内容摘要；expected Ref 由独立批准选定 | 独立选中的 expected Snapshot Ref 与适用设计/Package/Definition/Plan 关系 | `UNKNOWN`：不生成 Snapshot 或预填 Ref |
| Approval Reference | 由外部受信渠道选定批准记录的精确身份；不是“包旁存在一份签名批准”就自动生效 | Freeze Approval 身份、S7 用途、key/Anchor/Driver/collector、关联输入及其独立交付来源 | `UNKNOWN` |
| Binding identity | 正式 Binding 路径和 envelope-file digest；与 decoded payload digest 分开命名 | 被批准的正式入口、envelope 原始字节、decoded payload Ref 与独立选择记录 | `UNKNOWN`；创建/修改 Binding 未授权 |
| Private key custody | 私钥保持在 Owner 控制下，不进 Package、仓库、日志或环境变量 | 未来签名角色与操作权限只能由 Owner 明确；本文不规定或访问私钥位置 | `NOT_AUTHORIZED`：不创建 key、不读取私钥 |

Signature 覆盖保存的原始 payload bytes，不以解析后重序列化的内容替代。payload digest、envelope digest、公钥指纹和批准记录 hash 是不同对象的身份，不能互相替代。Binding 中的 key identity 只能匹配外部已选公钥，不能提供一个让被测对象自行替换的信任根。

签名存在或有效不等于 Owner 当前授权有效，也不证明实际工件完整、环境满足或可以 Invocation。正式 Binding 入口、独立 expected Ref、批准用途/时窗/撤销状态及实际输入链均须有适用材料；本轮不检查这些运行 Gate。

## Historical P0.S-6 Trust vs Future S7

| 历史材料 | S7 使用边界 | 本次处置 |
|---|---|---|
| P0.S-6 Trust Root / key / Anchor | 不自动迁移用途或信任；未来如拟复用须有明确适用 S7 的 Owner 决定和精确对象/用途材料 | 仅参考，不复制、不读取密钥、不配置 |
| P0.S-6 Snapshot / Signature / Binding / Approval | 历史对象不授权新 S7 payload、Plan、Case 或 Invocation | 不导入、不重签、不生成新对象 |
| 历史 Harness / Runner / Driver / Collector | 历史版本、文件存在、同名或 PASS 均不构成 S7 独立选择与信任 | 不自动信任，不调用或修改 |
| P0.S-6 CLOSED / VERIFIED_WITH_CANDIDATE | 只保留历史结论；Candidate 仍 generated_not_applied，不能导出依赖或执行就绪 | 不应用 Candidate，不扩大预算 |

本决策不声称必须在本轮新建 Trust Root，也不预先批准旧 key 复用。未来选择新对象或明确复用历史对象，都须具有独立来源、精确身份、S7 用途与相应授权；未提供时保持缺口。

# 3. Validation Driver

**决定将 Runtime Validation Driver 与 DeepSeek Harness 明确分开。** Driver 是独立受信验证/控制角色，DeepSeek Harness 是被测业务 CLI/Host；历史记录里泛称的 Harness 不能自动成为验证器或批准来源。

| Driver Input / Role | 已决定职责与要求 | 当前未确认材料 | 状态 |
|---|---|---|---|
| Driver role | 在未来明确有界授权内执行预检、场景驱动、身份/预算/进程观察及结果记录；不能自授权或隐式 restart | 精确实现/版本、可执行字节、策略、预算和操作范围 | `UNKNOWN` |
| Evidence collector | 负责原始事件接收、持久化、索引与缺口记录；可作为 Driver 内部角色，但转发时保留原 producer | collector 身份、采集机制、sourceSequence、sink/fallback、容量和单写者权限材料 | `UNKNOWN` |
| Source identity | Driver/collector 源码与构建来源必须可归属，并与所执行工具原始字节及 host prerequisites 对应 | source/commit/tree、构建 provenance、工具/宿主版本/hash、所选独立入口 | `UNKNOWN` |
| Approval | Owner 独立选择该 Driver/collector 的精确对象、用途、范围及交付；不能靠包内配置或普通 argv/env 选信任对象 | S7 适用批准、交付渠道、expected identity、时窗/撤销与执行预算 | `UNKNOWN`；当前执行未授权 |
| Control inputs | Driver/控制层使用受保护 roots、ACL/token/job/handle、lease/ledger 与有界退出，权限来自批准而非被测组件 | 精确控制方案、目标 fixture 对应材料及持续控制能力 | `UNKNOWN` |

bootstrap 信任入口须在 Driver 启动前独立确定并认证 Driver 与其 host prerequisites。不能先执行尚未认证的包内 Node、Driver 或脚本来验证自身；不能按目录中“最新文件”、Manifest、普通环境变量或被测对象自报来选择信任入口。本文只规定边界，没有启动 bootstrap 或验证工具。

| Producer / Role | 未来 Evidence sourceType | 信任限制 |
|---|---|---|
| DeepSeek Harness 业务 CLI/Host | `DEEPSEEK_HARNESS` | 自报 version/READY/业务事件需外部身份与因果关联，不是批准来源 |
| Runtime Validation Driver | `RUNTIME_VALIDATION_DRIVER` | 验证结论必须归属其真实身份，不得冒称原 P0.S-6 Runner |
| Evidence Collector | `EVIDENCE_COLLECTOR` | 转发不改变原始 sourceArtifactRef/producer，派生汇总与原始事件分开 |
| Desktop Main / Supervisor | `DESKTOP_SUPERVISOR` | 受控协调，不授予新 Runtime 权限 |
| Worker control / Carrier | `WORKER_CONTROL` / `CARRIER` | 控制/传输事件与业务事件分来源 |
| 外部 OS 观察 | `OS_OBSERVER` | 同时记录 collector identity、采集机制与被观测 subject；进程自报不能冒充 OS 独立事实 |

以上是来源类型定义，不是本轮生成的事件。sourceType 字符串本身不建立信任；历史 Harness/Runner 的身份、批准和行为结果不自动适用于 S7。

# 4. Evidence Control

Evidence 合同在未来获准动作之前明确。本文只定义要求，不创建 startup/runtime/failure/recovery 记录或 Finalization 工件。

| Evidence Dimension | 已决定要求 | 控制与批准边界 |
|---|---|---|
| source | 保留 sourceType、sourceId、sourceArtifactRef、producer identity、collector identity、采集机制及 sourceSequence；转发保持原来源 | Driver/collector 的源身份和采集用途需被独立选定；不能靠自报 source 字段证明真实性 |
| identity | 每条有 eventId、recordType、category、phase/scenario/request/已分配时的 invocation 关联；输入 Ref 区分 expected/observed 与 CLAIMED/OBSERVED/AUTHENTICATED/NOT_AVAILABLE | 未达到认证边界不能把自报 packageId/version 升格；本轮不生成 eventId 或预留 Invocation |
| timestamp | 记录 UTC、source-local monotonic tick、时钟单位/epoch/不确定性；OS start time 独立标源 | 补录时间不能替代发生时间，不能只靠跨进程时间排序证明因果 |
| lifecycle | 记录 stateBefore/stateAfter、boundaryReached、firstFailureBoundary、subjectOutcome、evidenceState；无变化时明确 observationOnly | 没到达的动作标 NOT_REACHED；未知项附原因，不补写成功或运行历史 |
| runtime subject | 实际 instanceId/generation/PID/processStartTime/endpoint/role 必须由适用观察支持 | 未生成为 null + reason，无法观察为 UNKNOWN + reason；禁止零值伪装已确认，不能只用 PID 匹配 |
| approval | 引用适用 authority scope、独立批准和采集/操作边界；后续 review/Owner disposition 与原始事实分开 | Owner 决定允许采集与使用范围、约束接受及后续处置；Driver 给出合同下验证结论，Collector 不能批准；后续接受不追认越权动作或把不完整事实变完整 |

## Required Categories

| Category | 必须保留的内容边界 | 当前状态 |
|---|---|---|
| startup | Authority/Snapshot/Binding/Integrity/Permission/Boundary Gate、实际入口/ledger/spawn/实例身份/真实 ready、未到达边界与来源关联 | 未生成，执行未授权 |
| runtime | Worker/Desktop/children 生命周期、权限与预算、获准操作、停止和实际终态；输入身份关联不能只靠 UI connected | 未生成，执行未授权 |
| failure | 首失败、expected/observed、错误/超时、已到达边界、已消费预算、残留/containment 与未知项；cleanup 错误追加而不覆盖根因 | 未生成，不执行故障注入 |
| recovery | 原失败/Invocation 关联、独立恢复批准、新计划及新事实、允许动作、结果和 no retry/no replay；未获准恢复要保留 NOT_AUTHORIZED/NOT_REACHED 的边界 | 未生成，不执行或申请恢复 |

Plugin Evidence 继承 expected、observed、load、omit、blocked、error 六类字段与所选 roster 引用；整体 READY 不能代替逐项加载/省略事实，不能静默省略 REQUIRED 插件。所有类别都需要 identity、source、timestamp、lifecycle state，缺失不能算完整 Evidence。

## Evidence First and Finalization

| Control Rule | 决定 |
|---|---|
| Evidence First | 未来任何获准 package code/提取工具动作前须建立受信证据流与持久预算控制；依赖 request/Gate/slot/spawn intent/failure/stop/terminal 的下一动作前先持久记录 |
| 写入与保护 | 原始 producer、collector 接收记录与派生摘要分开；追加写入、来源序号、长度/字节身份、受保护根/单写者规则控制完整性；JSONL 或 hash 本身不证明真实/不可篡改 |
| 缺口处置 | sink 不可用、容量耗尽或来源序列缺口按合同 FAIL-CLOSED；fallback 仅限事先批准的有界收口，不延续业务；无法证实结果时保留 INCOMPLETE / OUTCOME_UNKNOWN |
| 敏感材料 | Evidence 不包含 private key、token、完整敏感 env 或业务秘密；引用限于批准范围，不能为补证越界读取秘密 |
| Finalization | 完成原始工件路径/字节数/hash/producer/time-range 索引、ledger 对账、差异/缺口/残留与 case 结果；索引不含自身 hash，后续 review 固定其精确 Ref |
| 分离结果维度 | 运行结果、validationVerdict、evidenceStatus 和 Owner 的 hypothesisDisposition 分开；exit code、摘要、签名或 Owner 接受不能单独使 Evidence FINALIZED |
| 后续对账 | 新记录关联旧 Invocation/索引与真实新时间，保留旧 INCOMPLETE/UNKNOWN 历史；不覆盖旧事件、不回填实际启动时间、不修改冻结输入 |

`OPEN / FINALIZED / INCOMPLETE` 是 Evidence 生命周期要求；本轮未创建 Evidence，不能给本文件赋运行 Evidence FINALIZED。正确拒绝负例也不能被解释为 Runtime 成功；没有恢复许可导致未启动恢复，不证明恢复可行性。

# 5. Permission Boundary

三域分类沿用 O-02～O-04。FROZEN_INPUT 是未来合法定型输入的归属，不表示本轮生成或冻结了公钥、Driver、Plan、Manifest 或 Snapshot。

| Trust / Control Item | Domain | 语义所有者与限制 |
|---|---|---|
| 独立选定的 Anchor、用途/信任策略、公钥身份、bootstrap/validator/collector 精确输入 | `FROZEN_INPUT` | 由各自独立治理/受信输入对象拥有；Snapshot 可以依合同选择已批准 Anchor/输入引用，但不能创建自己的 Trust Root 或替代外部选择 |
| Package/Definition、环境/权限/证据控制策略、允许 roots/有限操作、Plan 预算/时限 | `FROZEN_INPUT` | 由 Package、Runtime Definition、独立控制工件和 Invocation Plan 分别拥有；标签/输入限额不自动授予执行权 |
| keyRef、driverRef、collectorRef、policyRef、packageRef、definitionRef、snapshotRef / FieldRef | `REFERENCE` | 有类型引用指向唯一语义所有者；输入链只引用适用冻结输入，不允许覆盖字段、指向 runtime facts 或形成环 |
| 独立 Approval / Activation 的引用与 expected Snapshot Reference | `REFERENCE` | 由外部受信渠道选定治理对象；不是被测 Package/Definition/Snapshot 自声明的权限。批准具体范围由该独立对象拥有 |
| 历史 P0.S-6 Trust、旧 Harness/Runner、旧 Evidence 与本轮依据 | `REFERENCE` | 仅历史/分析来源；没有自动 S7 用途、key 信任、Snapshot 选择或执行许可 |
| 实际公钥/Signature/批准/Reference 检查结果、当前时钟/撤销有效性、Gate/Preflight 结论 | `RUNTIME_FACT` | 由未来获准受信检查产生并记录；不能回写 signed Snapshot 变成自证批准有效的字段 |
| PID、start time、instanceId、generation、SID、实际 endpoint/根/ACL/token/job/lease | `RUNTIME_FACT` | 运行或控制观测事实；只写 Evidence/ledger/lifecycle，不预填、不改名、不间接带入冻结输入 |
| 实际消费预算、sourceSequence、状态/失败/恢复/Finalization 结果及日志 | `RUNTIME_FACT` | 事实及其内容摘要仍是事实；不能因为签名归档或 Owner review 升格为输入或新权限 |

独立批准可以关联准备证据或恢复父失败，但这些关联属于外部治理记录，不回填 Runtime Definition、Manifest 或 signed Snapshot。Definition 不包含 Snapshot/Binding/Approval/Evidence 的反向摘要；Snapshot 不含自身 Ref 或后生成 Binding/Approval 摘要。Reference 本身不授予权限，不能用 evidenceRef 把运行事实带进 Snapshot 输入链。

公钥/Driver 的 expected 身份来自独立选择，observed 身份来自实际检查，二者不能共享一个由被测对象控制的写入者。将 PID 改成 processToken、把 generation 放 metadata、用当前机器状态替代环境策略都不改变 RUNTIME_FACT 的性质。

涉及 filesystem、process、network、children、ACL、保护句柄和 ledger 的规则继续继承 O-04；实际 enforcement 仍 UNKNOWN。本轮不配置或验证控制层，不以规则已写入文档来宣称信任和权限已生效。

# 6. Boundary

| Boundary / Action | 当前状态 | 本轮决定 |
|---|---|---|
| 文档 | `OWNER_DECISION_RECORD` | 记录已确定的 Trust/Control 职责与输入规则 |
| O-01～O-04 | `COMPLETED` | 来源角色、Runtime 策略、依赖处置、环境要求保持；Candidate 仍 generated_not_applied |
| EAR-C01 | `OWNER_APPROVED_PARTIAL_SCOPE` | 仅输入准备和分析 |
| P0S7_STATE | `NOT_STARTED` | 不进入运行阶段 |
| P0S7_ALLOWED | `NO` | 门禁不变 |
| Execution Budget / Invocation | `0 / 0` | 不申请、预留或执行 Invocation |
| Retry / Resume / Recovery | `0 / 0 / 0` | 不恢复或重试 |
| Trust Root / key 创建、公钥选择配置、私钥读取 | `NOT_AUTHORIZED` | 本轮不创建 key、读取私钥或配置信任实物；未选定具体 S7 公钥 |
| Signature / 验签 | `NOT_AUTHORIZED` | 不签名、不进行运行验证 |
| Snapshot / Binding | `NOT_AUTHORIZED` | 不创建、冻结、签名绑定或更改正式入口 |
| Runtime / Package / 冻结 Definition Identity | `NOT_AUTHORIZED` | 不创建、不实现、不启动、不构建 |
| Preflight / Driver / collector / bootstrap 执行 | `NOT_AUTHORIZED` | 不执行受信工具、采集运行 Evidence 或验权 |
| Install / Build / resolve / unpack / ABI 或环境探针 | `NOT_AUTHORIZED` | 不下载、安装、构建、解析、解包或测试 |
| 代码 / Runner / Manifest / lockfile / Git 配置 / upstream / 系统权限修改 | `NOT_AUTHORIZED` | 只新增本文，不应用 Candidate、不改 safe.directory、不更改系统或权限 |
| EAR-C02～EAR-C05 / Production Runtime / Deployment / Full Agent Platform / P1 | `NOT_AUTHORIZED` | 不扩大 Case、产品或阶段范围 |
| 测试 / Verification / Commit / Push | `NOT_AUTHORIZED` | 本轮不执行 |

## Confirmed / Unknown and Remaining Gaps

| Item / R2 Blocker | 当前状态 | 本轮后结果 |
|---|---|---|
| Authority 归属、独立信任模型、Driver/Collector 与 Evidence 规则 | `CONFIRMED` | 明确谁决定、谁检查、谁记录以及哪些内容不能作为自授权依据 |
| B05-T1 Authority Anchor | `UNKNOWN` | 精确 S7 Anchor、选择批准及实际项目 source/build ancestry 材料未提供 |
| B05-T2 Trust Root | `UNKNOWN` | 独立来源、精确公钥身份/用途与 bootstrap 选择材料未提供 |
| B05-T3 Driver / collector | `UNKNOWN` | 精确源码/构建/字节/宿主身份、交付和批准未提供 |
| B05-T4 后续 Approval | `BLOCKED` | EAR-C01 已有分析许可有效；Runtime/Snapshot/Signature/Binding/Preflight/Invocation 没有新许可 |
| B05-T5 Reference | `UNKNOWN` | expected Snapshot Ref、Freeze Approval、正式 Binding 路径/envelope digest 与独立选择链未提供；不为补空创建对象 |
| B05-T6 Control inputs | `UNKNOWN` | roots/ACL/token/job/handle/lease/ledger 与预算/证据持久化的精确材料和能力未确认 |
| Trust / Control Closure / Input Closure | `BLOCKED` | 职责规则确定不等于精确信任输入齐备；不写 INPUT_CLOSED、TRUST_READY 或 PASS |

身份不一致、引用不一致、签名/完整性不成立、批准来源/时窗/撤销无法确认、控制边界不能满足或 Evidence 不完整时，继续 FAIL-CLOSED；本轮只记录停止规则，不运行 Gate。未来许可不足时不能由 Driver 补预算、由 Harness 自报 READY 放行、由 Collector 补事实或由历史 PASS 替代。

继续继承 Authority Anchor、Execution Snapshot、Trust Root、Snapshot Binding、Owner Signature、Final Preflight、Controlled Invocation、Evidence First 和 Fail Closed；继承的是合同约束，不是 P0.S-6 密钥用途、运行实物或执行权限。O-05 不代替 O-06 的未来授权决定。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_ID = P0S7-1-INPUT-CLOSURE-O05-TRUST-CONTROL-DECISION-20260905-01
O01_STATUS = COMPLETED
O02_STATUS = COMPLETED
O03_STATUS = COMPLETED
O04_STATUS = COMPLETED
TRUST_CONTROL_BOUNDARY_DECIDED = YES
RUNTIME_APPROVAL_AUTHORITY = OWNER
SNAPSHOT_APPROVAL_AUTHORITY = OWNER
EXECUTION_AUTHORIZATION_AUTHORITY = OWNER
HISTORICAL_P0S6_TRUST_AUTO_ACCEPTED = NO
HISTORICAL_HARNESS_DRIVER_AUTO_TRUSTED = NO
EXACT_S7_ANCHOR_CONFIRMED = NO
EXACT_S7_TRUST_ROOT_CONFIRMED = NO
EXACT_S7_PUBLIC_KEY_SELECTED = NO
EXACT_S7_DRIVER_COLLECTOR_CONFIRMED = NO
EXACT_S7_APPROVAL_REFERENCE_CONFIRMED = NO
PERMISSION_ENFORCEMENT_CONFIRMED = NO
RUNTIME_FACTS_ALLOWED_IN_FROZEN_INPUT = NO
TRUST_CONTROL_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
TRUST_ROOT_CREATED = NO
KEY_CREATED = NO
PRIVATE_KEY_READ = NO
SIGNATURE_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
PREFLIGHT_AUTHORIZED = NO
RUNTIME_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
RUNTIME_EVIDENCE_CREATED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
```

## Performed Work and Unexecuted Items

| 项目 | 本轮记录 |
|---|---|
| 修改文件 | 仅新增 `docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O05-TRUST-CONTROL-DECISION.md`；既有依据不改写 |
| 内容 | Owner 权限归属、独立 Trust Root/公钥/Signature/Reference 模型、历史信任隔离、Driver/collector 职责、Evidence source/identity/timestamp/lifecycle/approval/Finalization 与三域权限边界 |
| 文档检查方式 | 静态核对六个必需章节、三类批准权、Trust/Driver/Evidence 覆盖、状态与禁止字段、依据 SHA-256、UTF-8 无 BOM/中文无乱码及工作区文件前后字节；本文 SHA-256 在最终回复单独返回 |
| 测试方式 | 按用户限制未运行测试、Verification、验签、Preflight、Driver/collector/bootstrap 或其他运行验证；文档检查不是信任验证 |
| 未执行事项 | 未创建 Trust Root/key、读取私钥或公钥实物、签名或验签；未创建/修改 Snapshot/Binding/Runtime/Package/Definition Identity/Package Identity/Evidence 工件；未选择配置 S7 密钥、Anchor 或信任入口；未执行 Preflight、Driver、collector、bootstrap、Invocation 申请/预留/执行、Launch、Retry、Resume、Recovery；未下载/install/build/resolve/解包或测试；未修改代码/Runner/Manifest/lockfile/Git 配置/upstream/系统/权限，未应用 Candidate；未 Verification、Commit、Push |

本文完成信任输入边界决定，不创建信任实物或使 Runtime 获得执行权。

