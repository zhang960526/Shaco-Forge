# P0.S-7 Minimal Spike Runtime Execution Authorization Request

| Field | Value |
|---|---|
| Authorization ID | `P0S7-MINIMAL-SPIKE-RUNTIME-EXECUTION-AUTHORIZATION-REQUEST-20260905-01` |
| Document Status | `EXECUTION_AUTHORIZATION_REQUEST` |
| Record Date | `2026-09-05` |
| Current Goal | `MINIMAL_CONTROLLED_RUNTIME_SPIKE` |
| Requested Case | `ED-C01`，一次正例受控执行 |
| Owner Execution Decision | `PENDING / NOT_AUTHORIZED` |
| Execution Readiness | `NOT_READY`；前置条件未闭合 |
| Phase A / Review | `IMPLEMENTATION_COMPLETE / PASS`，按本轮用户提供的当前状态记录 |
| Runtime Acceptance | `NOT_EXECUTED`；静态 Review PASS 不代表运行就绪或运行验收通过 |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Runtime / Package / Snapshot / Binding / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Current Usable Execution Budget | `0` |

本文仅提出运行授权申请，不是 Owner Approval、Startup Activation、Snapshot、Binding、Signature 或 Invocation Plan。申请中的数量和动作不形成权限；本轮仅创建本文。历史 Phase A 决定中的阶段初始状态保留原样，本文依据当前用户状态记录静态实现已完成，不改写历史文件。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Phase A Owner Approval](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL.md) | `82765644A2D40E82C84632EDD842E1395E0E91424267F782FBA4633628021C1D` |
| R2 | [Minimal Spike Execution Design](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |
| R3 | [Phase A Control README](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/control/README.md) | `444FBA8120D1CA11E7262A4C0F03AAEACCAC0B66FDB6DBFF3157802280A33D14` |

R1 的决定为 `APPROVED_PHASE_A_IMPLEMENTATION_ONLY`，Implementation Approval != Execution Approval。R2 的 Design ID 为 `P0S7-MINIMAL-SPIKE-EXECUTION-DESIGN-20260905-01`。R3 明确真实执行集成、信任检查和证据持久化尚未接入；本文不将源码骨架或空模板视为这些前提已满足。

# 1. Execution Scope

申请范围：**Minimal Controlled Runtime Spike / ED-C01，一次真实、有限、非生产正例**。仅在 Owner 明确批准并满足 §3 后，申请允许以下动作：

| Requested Action | 限定行为 |
|---|---|
| Electron launch | 启动一次经批准的 Desktop 进程组；Main/Renderer/preload 分离，Renderer 无 Node、shell、文件写入或 Worker 启动权限 |
| Worker launch | 由独立 Driver 控制一次 Node Worker 启动；Desktop 不拥有 Worker 的创建、重启或生命周期终止权限 |
| Named Pipe IPC | 使用 `SHACO_SPIKE_IPC_V1`，在限定 Windows 管道及批准对端间建立经真实 OS 对端检查和实例握手认证的 IPC |
| SUM3 execution | 仅一次固定输入 `[2,3,5]`；经屏障释放后实际计算，预期 `count=3, sum=10`；预期值不得冒充实际结果 |
| Evidence generation | 采集 startup/runtime/failure/recovery disposition，记录原始来源并完成 finalization；包含有界停止及资源终态对账 |

请求流程沿用 R2：外层独立授权的 Driver/collector → Authority/Snapshot/Binding/Preflight → 消费启动额度 → Worker 与 Desktop 启动及认证 → 一个请求 → TASK_ACCEPTED 持久化 → 执行意图持久化后释放一次屏障 → 实际结果与独立预期比较 → Desktop 关闭 → 观察同一 Worker 持续存在 2 秒 → 显式 stop、OS 退出确认 → finalization。

申请包括该 Case 必需的一个有界 Driver/验证会话、一次 Preflight 和正常停止；它们不属于免费探测，不得循环运行。实际 OS 认证、Authority、输入完整性、停止和 Evidence 必须真实实现，只有 SUM3 业务能力可使用确定性 Stub。

本次不申请 ED-F01～ED-F07 及其变体，不申请故障客户端、故障注入、重放拒绝实验或恢复实验。自然发生的失败必须记录和受控收口，但不因此增加实验次数。单次 ED-C01 即使通过，也只能形成该正例结论；R2 要求的负例尚未执行时，不得宣称整个 Spike 或 P0.S-7 验收 PASS。

# 2. Runtime Boundary

**Runtime Classification = NOT_PRODUCTION。**

实际 Source 候选根保持 `D:\Project\Shaco-Forge`；本 Spike 的源码候选范围为 `experiments/P0S-7-MINIMAL-SPIKE`。upstream 仅为 REFERENCE_SOURCE，不作为可直接运行、冻结或自动信任的来源，不冻结整个项目。

本请求不包含 Production Runtime、Package Release、Production Package、Installer、Release Pipeline、Full Harness、Plugin Ecosystem、外部服务接入、Full Deployment 或 P1。最小执行可使用经批准的有限文件布局，不以制作生产 Package 或 Package Identity 为前提，也不免除所选运行输入的精确身份和完整性要求。

运行授权不隐含准备权限：下载、安装、构建、解包、环境/ACL 修改、信任配置、冻结工件创建和签名，均须已有适用授权或另获明确授权；本文不执行或授予这些操作。未完成的执行集成同样须在适用实现授权下补齐，不能把 Phase A 拒绝锁改成 allow 就视为完成。

证据根、fallback 根、运行输入根、管道范围及可控制的进程归属，均须在启动前明确。不存在以工作目录、PATH、历史 Harness 或当前机器状态作为默认信任输入的回退。

# 3. Required Preconditions

下列条件必须在激活前满足；当前仅有静态源文件和模板，以及相关设计/边界记录。**以下六项均未确认闭合，Execution Readiness 保持 NOT_READY。**

| ID / Precondition | 激活前必须具备 | 当前缺口 |
|---|---|---|
| PC-01 Runtime input | 精确 Source/input set 与 provenance；选定 Node/Electron 字节、版本及 ABI；入口/参数/profile/roster；实际依赖与 helper/loader 闭包；固定 SUM3 输入；持续输入保护 | Phase A 是候选骨架；运行分发与实际闭包未选定，真实执行集成未完成。静态检查使用的 Node 不是已批准 Spike Runtime |
| PC-02 Snapshot | R2 最小模型下的 source identity、runtime identity、Runtime Definition、input reference、Invocation Plan reference、先行 scope approval reference；精确字节和最终冻结状态 | Snapshot 为 NOT_CREATED；本文不生成或冻结实例 |
| PC-03 Binding | 正式 Binding 路径/envelope 与独立预期 SnapshotRef、签名者、公钥用途及外层批准一致；禁止通过自声明路径或候选 Snapshot 自证可信 | Binding 为 NOT_CREATED，正式选择及验证条件未具备 |
| PC-04 Trust | 独立 Owner Authority Anchor、选定 Trust Root/Public Key、有效范围与时窗/撤销规则；适用的 Owner Freeze Approval 和 Startup Activation；Driver 的外层验证许可 | 历史 P0.S-6 Trust 只能作为参考，未形成 S7 的实际选择、绑定和激活；本申请不是信任材料或签名 |
| PC-05 Driver | 独立 Driver/collector 的精确源码/工具身份和批准；真实 Preflight、不可复用预算 ledger、屏障、IPC OS 认证、受限凭据交付、持续保护、超时/stop/containment、主/备用证据写入与 flush | README 明确这些真实控制路径尚未接入；模型 stop、schema 校验、模板工厂均不能替代 |
| PC-06 Environment | 经选择和批准的 Windows fixture，OS/architecture、host/tool inventory；有限进程 roster；文件/证据/管道根及 ACL；filesystem/process/child-process/network 权限与停止归属 | 当前开发机不直接等于目标 fixture；精确工具、权限、Electron 辅助进程数量和控制条件未确认 |

Snapshot 只承载预先确定的 FROZEN_INPUT 及其引用；PID、start time、generation、实际 endpoint/nonce/credential、宿主观察、Gate 结果、预算消费及事件时间都是 RUNTIME_FACT，不写入 Snapshot 或其间接冻结输入。历史 P0.S-6、upstream、当前机器观察等 REFERENCE 不自动升级为授权输入。

Snapshot 的 approval reference 指向先行 scope approval，不能指向其后才生成的最终冻结批准而形成循环。最终 Owner Freeze Approval/Activation 从独立信任入口固定 SnapshotRef、正式 Binding 和执行边界；不得在 Snapshot 内写入自身摘要或后续 Binding/Signature/最终批准的摘要。

前置工作可在已有适用权限内准备并审阅；缺少权限的准备动作需 Owner 明确授权。准备完成不自动消费或开启本次额度。激活仍须有 Owner 对本请求的明确决定，固定实际输入、环境、Driver、证据输出范围、时窗和有限预算，并由真实 Gate 决定是否可启动；任一 UNKNOWN/BLOCKED 均不得以 Review PASS 代替。

# 4. Invocation Budget

| Budget Item | 本次申请数量 | 当前批准数量 | 当前可用数量 |
|---|---:|---:|---:|
| Invocation：ED-C01 | 1 | 0 | 0 |
| Retry | 0 | 0 | 0 |
| Resume | 0 | 0 | 0 |
| Recovery | 0 | 0 | 0 |

**Requested Invocation = 1；Current usable execution budget = 0。** 本表是申请，不默认批准，不创建 Invocation、Plan、slot 或 ledger。Owner 可以拒绝或缩减；未明确批准时全部维持 0。

一次 Invocation 内的请求上限如下；不是可分别兑换的多个额度：

| Action / Resource | Requested Limit |
|---|---|
| Driver / validation session / Preflight | 一个有界会话、一次 Preflight；无独立探测、重验证或故障会话 |
| Desktop / Worker | Desktop 启动/attach 最多一次；Worker 物理启动尝试最多一次；Worker child process 为 0 |
| Electron auxiliaries | 仅允许启动前批准的精确 roster 和有限数量；当前 UNKNOWN，不按无限额解释，未确定不得激活 |
| Business / release / stop | 一个 SUM3 request，一次屏障 release，一次显式正常 stop 流程；重复请求直接拒绝 |
| Network / extra client | 外部网络 0；额外 IPC/故障客户端 0 |
| Preflight decision → spawn | 最多 5 秒；超时终止，不自动重跑 Preflight |
| READY / task | READY 最多 30 秒；TASK_ACCEPTED → result 最多 5 秒，含屏障等待 |
| Runtime window | 从 Worker slot 消费起最多 120 秒；超时不继续业务 |
| Desktop-close observation | 2 秒，观察同一 Worker，不启动替代实例 |
| Stop / containment / finalization | graceful stop 10 秒；请求预先批准的归属进程 containment 最多再 5 秒；finalization 30 秒 |
| Evidence bounds | 每 Case 主 sink 8 MiB；单事件 64 KiB；独立 fallback 1 MiB |

启动尝试前必须原子、持久地消费不可复用的 slot；启动失败不退款，消费结果不明不得再试。停止与已批准 containment 仅用于收口本次所属资源，不允许 restart、重放业务、恢复计算或扩大进程范围；正常 stop 失败不能通过 containment 改写为正例成功。缺少可靠预算 ledger、停止权限或有限 roster 时，拒绝启动。

ED-F01～ED-F07、额外测试/验证、Retry/Resume/Recovery 或第二次正例，均需后续独立明确批准及相应预算；本请求没有预留隐含次数。

# 5. Evidence

运行获准且实际发生后，必须按实际到达阶段记录四类 Evidence，另有 finalization。现有 TEMPLATE_ONLY / NOT_EXECUTED 文件只说明结构，不能改名充当运行记录。

| Evidence Type | 必须记录的实际内容 |
|---|---|
| startup | 外层验证许可、输入/批准引用、Authority/Binding/Preflight 判定、slot 消费、实际 OS 进程身份、READY 和 IPC 认证；未启动须如实记录未到达及原因 |
| runtime | request/accepted/intent/release/execution/result 因果；实际 SUM3 输出与独立预期比较；Desktop 收到结果和关闭、同一 Worker 生存观察、显式 stop 及实际退出 |
| failure | 实际首失败、时间与来源、失败层级、已发生副作用、拒绝/停止动作及资源终态；没有观察到失败时记录该观察范围及依据，不伪造失败场景或 Fail-closed PASS |
| recovery | recovery disposition：无恢复权限、恢复动作未执行，关联实际失败/停止记录；无失败时标注不适用及依据。该类 Evidence 不要求启动恢复，也不证明恢复成功 |

每条记录须有 identity、source、timestamp、lifecycle state，以及 Case/request/实际 Invocation 的关联、输入/批准引用、producer/collector、序列和因果关系。Worker 自报和 Driver 的独立 OS 观察应区分；缺失值用 null/UNKNOWN/NOT_REACHED 并说明原因，不能虚构 PID、执行时间、结果或 PASS。

Evidence First：预算消费、关键执行意图、失败及停止控制记录必须在依赖动作前可靠持久化。主 sink 写入/flush 失败立即禁止后续业务，通过预先批准的独立 fallback 记录收口；主/备用均失效时不能伪装 finalization 成功。

Evidence Finalization 必须对账原始文件路径、字节数/SHA-256、来源与序列、预算实际消费、进程/资源终态、缺口及 Case verdict。索引不包含自身摘要；记录不回填 Snapshot 或改写历史证据。只有原始事实完整可重推且资源终态明确，才标记 FINALIZED；仅模板或 summary 不足以完成。

ED-C01 PASS 要求实际执行、结果正确、真实 IPC/隔离与生命周期证明、正常停止及完整 finalization。已证明越权、身份/输入违例或继续执行等违规为 FAIL；关键事实不足且未证明具体违例为 INCONCLUSIVE。缺证不得输出 PASS，已证实 FAIL 不因另有缺口而被降为仅未知。本轮不产生任何 Case verdict。

# 6. Stop Conditions

**FAIL-CLOSED：Gate 前失败不启动；启动后条件失效则停止接收/释放/执行业务，只允许在预先批准的范围收口。**

| Trigger | Required Response |
|---|---|
| identity mismatch | Source、组件、Driver、对端或实例身份不一致即拒绝；不得改用 PATH、候选文件或新进程继续 |
| authorization failure | Owner/Trust/Signature、范围、时窗、撤销或预算检查失败即拒绝；静态实现批准及本申请不作为运行许可 |
| IPC authentication failure | OS 对端、实例握手、角色/会话或消息关联失败，不接受任务/释放屏障；记录失败并有界停止 |
| evidence failure | 写入、flush、顺序、来源或 finalization 不完整，停止后续业务；使用已批准 fallback，不静默丢弃/截断记录 |
| snapshot mismatch / integrity failure | SnapshotRef、正式 Binding、输入字节或持续保护失配即拒绝/停止，不重签、不更新期望值规避 |
| boundary violation / timeout / worker crash | 越界文件/网络/进程、超时、异常退出或资源归属不明，停止业务和隐式恢复；按已批准控制收口并保留未知事实 |

上述规则是拟申请运行必须遵守的条件，本轮不执行 Preflight、故障实验或停止实验。

```text
DOCUMENT_STATUS = EXECUTION_AUTHORIZATION_REQUEST
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
EXECUTION_APPROVAL = NOT_AUTHORIZED
EXECUTION_READINESS = NOT_READY
REQUESTED_INVOCATION = 1
APPROVED_INVOCATION = 0
CURRENT_USABLE_EXECUTION_BUDGET = 0
RETRY = 0
RESUME = 0
RECOVERY = 0
RUNTIME = NOT_CREATED
PACKAGE = NOT_CREATED
SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
INVOCATION = NOT_CREATED
```

本轮只创建申请文档并核对文本、编码和摘要；未修改源码、Runner、Manifest、Binding、lockfile、Git 配置或 upstream，未创建 Runtime/Package/Snapshot/Binding/Signature/真实 Evidence，未读取私钥、安装、下载、构建、启动、测试、Preflight、Invocation、Commit 或 Push。
