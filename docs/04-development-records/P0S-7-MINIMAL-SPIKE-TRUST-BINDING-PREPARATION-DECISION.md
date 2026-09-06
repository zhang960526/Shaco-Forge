# P0.S-7 Minimal Spike Trust / Binding Preparation Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-MINIMAL-SPIKE-TRUST-BINDING-PREPARATION-DECISION-20260905-01` |
| Document Status | `PREPARATION_DESIGN_ONLY` |
| Record Date | `2026-09-05` |
| Scope | `ED-C01 / MINIMAL_CONTROLLED_RUNTIME_SPIKE / NOT_PRODUCTION` |
| Runtime Definition | `FINALIZED_FOR_INPUT_PREPARATION`；精确运行输入仍未闭合 |
| Snapshot Preparation | `DESIGN_ONLY`；依据文件状态为 PREPARATION_DESIGN_ONLY |
| S7 Trust / Snapshot / Binding / Signature / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| READY_FOR_EXECUTION / Current Usable Execution Budget | `NO / 0` |

本文件定义未来的职责、信任选择、字段关系和激活边界，不是 Trust Root、Public Key、Snapshot、Binding、Signature、Activation 或执行授权。当前 Trust=NOT_CREATED 指本次 S7 尚未建立适用信任输入，不否定或改写历史 P0.S-6 Trust。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Snapshot Preparation Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SNAPSHOT-PREPARATION-DECISION.md) | `F3A06C33480F1CBFAE51C06039B9CC30E9C5F20D9432754D35CF3ACD272922AD` |
| R2 | [Runtime Definition Finalization Decision](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-DEFINITION-FINALIZATION-DECISION.md) | `777F7044A89D6B506409E3A1ABB20653A8D8FC9CF0E8C7659E59AD664EC2E1CB` |
| R3 | [Minimal Spike Execution Design](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |

沿用 R1 的无环 Snapshot 模型、R2 的独立 Driver/Windows 控制适配要求，以及 R3 的 Authority、Snapshot Binding、真实 Preflight、Evidence First 和 Fail Closed。不因准备设计完成而替代缺失实现、材料或 Owner 批准。

# 1. Trust Objective

ED-C01 需要独立 Trust，确保被测 Runtime、Snapshot、Binding 和 Driver 都不能自行选择一份“能通过检查”的公钥、批准或输入身份。信任入口必须先于待验证对象确定，才能判断“这是否是 Owner 允许的精确对象”，而不只是判断文件之间是否自洽。

必须分别成立：

- 验证公钥及其用途来自独立受信选择，而非候选 Binding、普通环境变量或文件搜索结果。
- Signature 对应适用类型的精确 payload bytes；签名存在或验证有效不表示用途、身份与当前批准均符合。
- Owner 对当前 ED-C01、精确输入、Driver、时窗及有限动作/预算有适用批准；历史许可、Phase A Review 和当前授权申请均不替代。
- Driver/collector 及宿主在运行前经独立 Bootstrap 认证，实际输入、环境和控制能力也满足门禁。

本模型只支持最小非生产 Spike；不建立 Production Trust、发布证书体系、插件信任市场或 P1 平台。SUM3 可使用确定性业务 Stub，信任选择、验签、OS 身份、持久化和停止能力不得用 Stub 或固定 PASS 替代。

# 2. Authority Model

| Role | 职责 | 权限边界 |
|---|---|---|
| Owner | 选择 S7 Anchor、Trust Root/Public Key 用途、Driver/Bootstrap；决定先行范围批准、精确 Snapshot Freeze Approval 和 Execution Activation，以及有限预算/时窗/停止与证据范围 | 批准对象与用途分别记录。输入决定、准备设计、签名与执行批准不混同；本文不冒充任何一项实际批准 |
| Driver | 在独立外层操作许可内执行受控检查、预算 ledger、屏障与启动/停止协调；保持 Desktop/Worker 生命周期分离，记录首失败 | 不能授予权限、改写 expected identity、增加额度、自动重试/重启或运行未选定工具；缺权限或输入即拒绝 |
| Collector | 在批准的根与来源范围接收原始事件、持久 flush、保留因果/序列、索引与终态对账 | 可与 Driver 同一受信工具承载，但保留 producer/collector 区分；不能签发批准、把自报变成 OS 事实、补造结果或回填 Snapshot |
| Preflight | 作为受信 Driver 中受控的检查过程，核对 Authority、正式 Binding/Signature、输入、环境/控制、预算和有效窗口 | 它不是新的权限主体。输出仅判断已有批准能否用于当前边界，不能产生执行许可或豁免缺口；本轮不运行 |

Bootstrap 是 Driver 之前的独立信任入口。它先认证 Driver/collector 与其 host prerequisites，不能先运行候选 Node、Driver 或脚本让它验证自身。Driver 的外层验证权限与候选 Runtime 的启动权限分别匹配；验证器能够检查文件，不代表可以启动被测对象。

Desktop 和 Worker 都是受控主体，不持有 Owner 权限。Desktop 只请求/展示，不能控制 Worker release/restart/stop；Worker 不修改 Driver、信任根、预算 ledger 或证据存储。当前工具会话能读取/写入准备文档，不代表这些角色已获 Runtime 权限。

# 3. Trust Root Boundary

| Trust Item | 模型定义 / 未来需要的输入 | 当前状态 |
|---|---|---|
| Anchor | Owner 独立选择的 S7 治理 Git object identity、来源/继承关系及规则；不是当前 HEAD、目录名、文档摘要或 upstream commit 的自动替代 | 精确选择 UNKNOWN；未创建或配置 |
| Public Key | 独立交付并选定的验证公钥身份、算法/编码与指纹规则、适用用途、来源和保护边界；key 标签必须匹配外部预期身份 | 精确公钥及适用输入 UNKNOWN；本轮不读取公钥/私钥实物、不计算 key 指纹 |
| Signature Purpose | 对明确 recordType 与用途的精确保存字节签名；Snapshot 签名用于认证该 payload，批准记录的签名用途与对象分别限定 | 沿用适用合同，不指定虚构算法参数、签名值或 key；Signature NOT_CREATED |
| Approval Reference：先行 | 在 Snapshot 之前定型的 Scope Authority Approval，固定用途/范围与有限 Plan 关联；供 payload 的 approvalReference 定位 | 具体适用记录 UNKNOWN；本文及 Runtime Definition 决定不代替它 |
| Approval Reference：最终 | 位于 Snapshot/Binding 下游的独立 Owner Freeze Approval/Activation，选定精确 SnapshotRef、正式 Binding 入口/envelope identity、key/用途、Driver 与有效范围 | NOT_PROVIDED；不得回填 payload 或由候选对象自选 |
| Trust Root 交付 | 独立 Bootstrap 从 Owner 指定的受信渠道取得上述信任选择，受保护保存并与候选输入分开 | S7 Trust NOT_CREATED；具体渠道、根、ACL 和角色仍待选择 |

公钥身份、Snapshot payload digest、Binding envelope digest、批准记录身份是不同对象，不得互相代替。候选 Binding 中声明的 signer/key 只能用于匹配外部已选身份，不能把其中的任意公钥升级为 Trust Root。自报 signatureValid、trusted=true 或文件名同名均不形成信任。

| 历史 P0.S-6 Trust | 未来 S7 Trust |
|---|---|
| 保留原 Anchor、公钥用途、Signature、Binding、批准、Driver/Runner 和验证结论的历史归属 | 对 S7 的新输入、ED-C01、Driver、用途/时窗及预算重新明确独立选择 |
| 历史 CLOSED/PASS 不自动覆盖本次组件、payload 或 Plan | 复用历史对象与选择新对象都需要适用 S7 的 Owner 决定及精确材料；本文不决定复用、不要求生成新 key |
| 作为 REFERENCE，不复制、重签或改写 | 未选定前保持 UNKNOWN/BLOCKED，不由发现“现成文件”自动激活 |

私钥保持在 Owner 或其指定签名方控制下；本准备模型只要求公开信任选择与授权关系，不要求向本代理交付私钥，也不查找其位置。

# 4. Binding Model

采用 **Snapshot → Binding → Preflight** 的依赖关系。箭头表示生成/判定先后，不表示上游 payload 存储下游引用。

```text
独立 Trust 选择 + 先行 Scope Authority Approval
                         ↓
         已定型 Source / Runtime / Input / Plan
                         ↓
                Snapshot 精确 payload
                         ↓
         获准 Signature → 正式 Binding envelope
                         ↓
        独立 Owner Freeze Approval / Activation
                         ↓
           获准 Driver 的真实 Final Preflight
```

以下为概念字段关系，不创建 JSON/schema/envelope 文件，也不声称字段名已经实现为可执行 wire format。

| 对象 / 字段概念 | 关系与检查要求 |
|---|---|
| Snapshot type/version/status | 沿用 R1 的 P0S7_MINIMAL_RUNTIME_EXECUTION_SNAPSHOT、schemaVersion 1；未来 payload 的最终状态为 OWNER_APPROVED_AND_FROZEN，但状态不自授权 |
| Snapshot input references | sourceIdentityRef、runtimeIdentityRef、runtimeDefinitionRef、inputReference、authorityAnchor、invocationPlanRef、先行 approvalReference；各自唯一语义所有者，不复制可覆盖配置 |
| Binding type/version | 必须有适用合同明确的 envelope 类型与版本，不能把 Snapshot schemaVersion 直接当成 Binding 版本；未知或歧义类型拒绝 |
| Binding payload | 承载同一份精确 Snapshot 保存字节；传输编码须明确、可无歧义还原。不得解析后重序列化再冒充原始签名字节 |
| Binding signature / signer / purpose | 与 payload、适用签名用途/recordType、外部已选公钥匹配；算法及用途遵循被选合同，不能由 envelope 自选宽松规则 |
| SnapshotRef | 对 decoded payload bytes 的内容身份；与独立 expected SnapshotRef 匹配。payload 不包含自身 hash |
| 正式 Binding identity | 正式规范路径及 envelope 原始字节的大小/SHA-256，由外部最终批准选定；不能扫描“最新文件”或退回旁路路径 |
| 外部批准引用 | Freeze Approval/Activation 独立定位上述 SnapshotRef、Binding identity、key、Driver 和范围/时窗；关联进入门禁记录，不回填 Snapshot 或已定型 Binding |
| Preflight 关联 | 从独立信任输入取得 expected identities；核对实际正式 envelope、还原 payload、签名用途及完整输入，再判断当前权限/环境/预算是否符合 |

### 禁止循环与混域

1. payload 的 approvalReference 只指向先行批准。先行批准不包含之后才生成的 SnapshotRef、Binding digest 或最终 Freeze ApprovalRef。
2. Snapshot 不含自身摘要，也不含其后 Signature、Binding、最终批准、Preflight 结果或运行 Evidence 的引用；禁止通过间接输入形成同样的回路。
3. 最终批准可以引用已定型 Snapshot/Binding；不将最终批准身份回写到它们，使 envelope 与批准互相等待摘要。
4. 若仅有后置批准而没有适用先行批准，保持 BLOCKED；不把授权申请、本文或 Phase A 静态批准塞进 payload 补位。
5. PID、start time、generation、实际 endpoint/nonce/credential、运行结果、预算消费和宿主观察属于 RUNTIME_FACT，不进入 Snapshot 或冻结输入。预期权限/根/预算上限与实际事实分开。

实际输入或 envelope 字节改变，会使受影响下游身份与批准失效。不能更新 expected Ref、换 key、重签、修复输入或改用备用 Binding 后自行继续；后续应在适用权限下重新准备并接受独立决定。

# 5. Driver Identity

Driver 的“独立”必须由实际来源、身份、权限和控制边界支持，不能只由文件名或 sourceType 字符串表示。R2 选择本 Spike 专用 Driver/collector 角色，没有选择已经可用的 executable；精确实现与宿主仍 UNKNOWN/BLOCKED。

| Required Identity | 必需准备内容 | 限制 |
|---|---|---|
| Source identity | `D:\Project\Shaco-Forge` 下实际选定 Driver/collector/Bootstrap 源集合、base commit/tree、patch/新文件 provenance、入口和精确字节；外部 helper/宿主单独记录来源 | 当前 HEAD 不代表未跟踪输入；历史 Harness/Runner 不自动成为 S7 Driver；不虚构尚不存在的入口 |
| Version | 精确实现修订、宿主 executable/版本/平台/ABI、所用 helper/loader 与有限闭包、文件大小/hash | 版本标签不能代替字节身份；Worker Node 22.19.0 的选择不自动批准 Driver 宿主；工具 Node 24.19.0 仍是参考 |
| Permission | Owner 的外层有界操作许可；可读执行/信任根，可写 ledger/证据/fallback 根，IPC 角色与 OS 对端认证、受保护凭据交付、有限进程 roster、持续输入保护及 stop/containment 归属 | 不自授权、不扩大范围；受控主体不能修改这些输入。具体根/ACL/工具/窗口尚未确定，不采用全局 PATH 或管理员权限作为默认值 |
| Evidence role | Driver 报告门禁/控制意图与实际动作，Collector 保留原始来源、身份、时间、生命周期、序列与因果，独立 OS observer 提供进程/退出事实 | Worker 自报与 OS 事实分开；Collector 接收不自动使事件 AUTHENTICATED，模型 stop/模板不证明实际退出 |

源码位置基线为 Spike 的 src/control、src/evidence；R2 已明确当前只有拒绝策略和模板工厂，缺真实门禁、ledger/持久化、认证 IPC、Windows 控制适配和停止实现。本轮不修改这些文件，也不通过取消拒绝锁把缺口变为已实现。

启动前必须由独立 Bootstrap 认证 Driver、collector 及其宿主先决条件；若未来使用同一分发支撑多个角色，各自身份、权限与实例仍需分别关联。控制层不能依赖被测 Worker 返回“验证成功”来决定是否信任自身。

Evidence 保持 startup/runtime/failure/recovery disposition 四类，另有 finalization。关键 request/Gate/slot/执行或停止意图必须先可靠持久化，再发生依赖动作；主 sink 不可用不启动，运行中失败则阻断新业务，只在预先批准范围使用 fallback 与停止控制。Recovery 预算为 0，仅记录 disposition，不代表恢复成功。

原始记录需能关联 Driver/producer/collector 精确身份、输入引用、来源时间和生命周期；缺失值与未到达边界如实记录。finalization 要能对账原始字节、预算和资源终态，索引不含自身 hash。未知或缺证不能生成 PASS，不向日志写入私钥、凭据或敏感环境值。本轮不创建任何真实 Evidence。

# 6. Activation Boundary

**准备设计完成不等于建立 Trust，更不等于 Execution Activation。** 当前状态如下：

| Item | State |
|---|---|
| S7 Trust | `NOT_CREATED`；Anchor/Public Key/独立交付及用途尚未实际选定 |
| Snapshot | `NOT_CREATED` |
| Binding | `NOT_CREATED` |
| Signature / key | `NOT_CREATED`；仅指本次 S7，未生成或选择 key 实物 |
| Driver trust / implementation | `BLOCKED`；精确身份、独立认证入口及真实控制尚未具备 |
| Execution Approval / Activation | `NOT_PROVIDED / NOT_AUTHORIZED` |
| Runtime / Invocation | `NOT_CREATED / NOT_CREATED` |
| Invocation / Retry / Resume / Recovery 可用预算 | `0 / 0 / 0 / 0` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| READY_FOR_EXECUTION | `NO` |

未来只有在适用权限下补齐独立 Trust/Anchor/key 选择、精确 Driver/宿主/Helper、输入/环境/权限闭包、Snapshot/签名/正式 Binding，并取得独立先行及最终批准、有限预算，才可能进入获准 Preflight。本文不创建这些对象或承诺后续放行。

Preflight 应依 R3 先认证验证器，再依次检查 Authority、Snapshot/Binding/Signature、实际输入、环境/控制与最终边界；任一身份/摘要/签名用途/批准不符、缺失、过期、撤销、预算不明、IPC 认证或证据条件不满足，必须 FAIL-CLOSED。启动前失败不 spawn；运行中失败只在已批准范围停止，无自动 retry/resume/recovery。

Preflight 有效 decision 到 spawn 的时限、原子持久消费和持续保护仍沿用 R3，不能用较早文档审阅替代。当前请求的 Invocation=1 仍未获批准；本设计不发放、预留、消费或退还任何额度。

```text
DOCUMENT_STATUS = PREPARATION_DESIGN_ONLY
TRUST = NOT_CREATED
SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
SIGNATURE = NOT_CREATED
RUNTIME = NOT_CREATED
INVOCATION = NOT_CREATED
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
READY_FOR_EXECUTION = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
```

仅新增本文，完成独立 Trust 目的、四类职责、信任根与历史用途边界、Binding 字段/无环关系、Driver 身份及激活条件。文档核对仅检查章节、引用、状态、UTF-8 无 BOM/中文乱码、SHA-256 和既有工作区字节，不属于测试、Preflight 或验签。

未创建 Trust Root/key、读取私钥或公钥实物、签名/验签；未创建 Snapshot/Binding/Runtime/Package/Invocation/Plan/真实 Evidence；未运行 Driver/Desktop/Worker/IPC、Preflight 或测试；未修改代码/Runner/Manifest/lockfile/Git 配置/upstream，未应用 Candidate、下载/安装/构建/解包、配置系统/权限、Commit 或 Push。
