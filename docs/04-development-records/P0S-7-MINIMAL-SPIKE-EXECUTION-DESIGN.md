# P0.S-7 Minimal Controlled Runtime Spike Execution Design

| Field | Value |
|---|---|
| Design ID | `P0S7-MINIMAL-SPIKE-EXECUTION-DESIGN-20260905-01` |
| Document Status | `DESIGN_ONLY` |
| Record Date | `2026-09-05` |
| Current Goal | `MINIMAL_CONTROLLED_RUNTIME_SPIKE` |
| Scope Reconciliation | `COMPLETED`；采用 R1 的最小验证范围 |
| P0.S-6 | `CLOSED / VERIFIED_WITH_CANDIDATE` |
| P0.S-7 / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Input Closure | `BLOCKED / INPUT_CLOSURE_COMPLETE=NO` |
| Runtime / Package / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Current Usable Execution Budget | `0` |
| Deliverable | 仅本实验设计；无实现、冻结输入或运行证据 |

## Read Basis and Contract Relationship

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-MINIMAL-SPIKE-SCOPE-RECONCILIATION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SCOPE-RECONCILIATION.md) | `9BF71B8D58AE45BE0AF120D858F24D1CB62575BF61583B2F890E52390894BF22` |
| R2 | [P0S-7-1-DETAILED-DESIGN-CONTRACT.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |

R1 决定实验范围：真实 Desktop/Worker、有限输入集合、确定性业务 Stub；完整 Harness、Production Package、插件生态、安装器和部署留待 P1。R2 的单向身份、独立信任、正式 Binding、持续输入保护、有限预算、Evidence First、Fail Closed 继续适用；其完整 Package/fresh-install/全模块/实际恢复正例要求不被本最小实验冒称满足。

本设计明确采用有限工作布局，定义新的最小 Snapshot 类型，不向旧 Package schema 填入虚假 packageHash，也不关闭旧 Gate。以下字段、协议名、Case ID 和上限均为设计规格，不是已创建的实现、身份、Invocation 或执行授权。后续具体批准须明确采用本设计与 R1 的范围差异；本文不修改旧合同或批准记录。

# 1. Spike Objective

证明：独立受信控制入口能在真实 Authority、Snapshot、Preflight 门禁后，启动一个 Electron Desktop 和一个独立 Node Worker，通过认证本地 IPC 完成一次确定性任务，保留原始证据，并显式停止；错误输入、失效权限、Worker crash 或 evidence failure 不造成未获准执行、隐式恢复或虚假成功。

本实验包含一个正例和有限失败场景。正例业务任务只有一次 request → execution → result → stop；负例需独立材料、Plan 和权限，不能在一次已消费 Invocation 内反复重跑。场景数量不是当前预算请求。

| Required Proof | 本设计中的落点 |
|---|---|
| Source Boundary | 实际项目有限源集合、精确差异/来源与工具字节；§4～5 |
| Minimal Runtime Entry | 真实 Worker 进程和 SUM3 计算；§2～3 |
| Desktop / Worker Boundary | 真实 IPC、Desktop 关闭后的 Worker 身份与独立停止；§2～3 |
| Authority Gate | 独立批准、真实验签/权限/消费检查；§4、ED-F01 |
| Snapshot Minimal Flow | 有类型的单向引用、正式 Binding、实际输入认证；§5、ED-F02/F06 |
| Evidence Generation | 原始来源、生命周期、独立 OS 事实与 finalization；§6 |
| Fail Closed Behavior | 指定首失败边界、真实拒绝/停止及不自动重试；§7～8 |

结论只覆盖实际选中输入/环境/场景，原型为 `NOT_PRODUCTION`。Stub 不证明 DeepSeek Harness、插件加载、生产打包或业务恢复能力；H-05/H-20 和其他旧未决结论不因本设计或未来局部 PASS 改变。

实际项目候选根固定为 `D:\Project\Shaco-Forge`（ACTUAL_PROJECT_SOURCE），仅选择其中与本实验有关的输入。`D:\Project\Shaco-Forge-Upstream\deepseek-harness` 仍为 REFERENCE_SOURCE；本自有 Stub 路径不以修复该目录的 Git ownership 为前提，不修改 safe.directory，不冻结整个项目。

# 2. Runtime Topology

```text
Owner / 独立信任与批准
           ↓
受信 Bootstrap → Driver + Collector（有界控制/采集角色）
                          │
                   分别控制启动与停止
                     ┌────┴────┐
              Electron Desktop │
              Renderer → Main  │
                     ↓         │
             认证 Windows 命名管道 IPC
                     ↓         │
               独立 Node Worker ← Driver 的独立控制通道
                     ↓
          Deterministic Stub（Worker 内的业务函数）
```

| Role | 真实边界与职责 | 禁止混淆 |
|---|---|---|
| Electron Desktop | 真实 Electron 进程组；Renderer 只通过有限 preload/Main 接口发送一次任务并展示结果 | Renderer 不持有 Node/shell/文件写入/Worker launch 权限；页面 connected 不等于 Worker READY |
| IPC | 本设计选择 Windows 本地命名管道，固定协议 `SHACO_SPIKE_IPC_V1`；Main 与 Worker 是不同进程的通信端 | 禁止以进程内函数调用替代 IPC；无 TCP/HTTP、无运行时 Carrier fallback |
| Node Worker | 由 Driver 以选定 node executable 与项目最小入口启动；在独立生命周期控制下处理任务 | 不由 Desktop 自行 spawn/restart；不用全局 Node/pnpm 或 upstream 内部入口 |
| Deterministic Stub | Worker 内实际校验并求和三个固定整数，返回有来源的业务结果 | 只 Stub 业务能力，不 Stub Gate、OS 进程、IPC 认证或写入结果 |
| Driver / Collector | Driver 执行受控门禁、故障触发与有界停止；Collector 持久化原始事件。可同一受信工具承载，角色及来源仍分开 | 不自授权，不自动信任历史 Runner，也不以被测 Worker 的日志代替 OS 观察 |
| Bootstrap / OS observer | 独立认证 Driver 及其宿主前提；可信采集机制观察 executable、进程身份、退出和资源归属 | 先认证验证器再运行；PID 单值或自报 sourceType 不是独立真实性证明 |

Driver 持有 Worker 的独立控制权。Desktop 退出不关闭 Worker 的生命周期保护句柄；Node Worker 不持有启动其他业务进程的权限。Electron 自有 renderer/GPU/utility 等必需进程按所选版本的实际 roster 纳入控制，不能把两个应用角色等同于两个 OS PID。

## IPC and Control Boundary

命名管道只允许选中角色连接，并结合受保护端点、角色 ACL、OS 对端身份及本次实例专用握手材料认证。设计要求双向确认角色和本次 launch 关联；不把“能连接管道”视为认证成功。具体 Win32/Node 适配实现尚未完成，若不能满足这些机制则阻断启动，不自动换 Carrier。

Driver 在获准窗口中通过仅交付给指定子进程的受保护通道提供实例握手材料；不得经普通 argv/env、文件搜索、日志或 Renderer 暴露。实际管道地址、nonce、instanceId、generation、PID/start time 属于运行事实，不进入 Snapshot。Snapshot 固定的是命名/交付/权限规则及期望角色。

协议只接受固定版本、类型、关联 ID、序号和有界 payload；单帧上限 4 KiB，未知字段/操作、错误角色、重复请求、超限或旧会话消息在执行前拒绝。Worker 只接受一项业务任务；控制通道仅接受已列入批准的 release/stop，Desktop 无此控制权限。跨角色调用、未认证连接、任意文件路径、shell、插件发现/下载及外部网络业务均禁止。

# 3. Minimal Task

## Deterministic Request and Oracle

| 项目 | 固定设计值 / 规则 |
|---|---|
| operation | `SUM3`，协议版本 `SHACO_SPIKE_IPC_V1` |
| task input | 三个整数 `[2, 3, 5]`，顺序与字节输入由 taskInputRef 固定 |
| request association | 一个预先选定的业务 request 标签，关联本 Case、Plan 和已认证会话；本轮不生成真实 ID |
| execution | Worker 校验请求与获准输入一致后，实际执行三整数求和 |
| expected result | `count=3`、`sum=10`、`operation=SUM3`、原 request 关联不变 |
| oracle | 期望值在场景规格中预先固定；Driver 依据已批准输入独立比较 Desktop 收到的结果与 Worker 原始结果 |
| side effects | 无外部服务、时钟/随机数业务输入、业务文件写入或 Worker child spawn；仅有受控 IPC 和证据记录 |
| completion | 只有结果关联、计算、原始记录、进程生命周期和 finalization 全部符合才可判正例 PASS |

Stub 必须真实计算，不能提前写入 RESULT 日志或只让 Desktop 显示 10。实际 request/send/receive/accept/execution/result 均有因果关联；request 标签不是 Runtime instanceId 或 Invocation ID。

## Positive Case ED-C01 — Request → Execution → Result → Stop

| Step | 设计动作与顺序 | 必须观察到的事实 |
|---|---|---|
| T-01 | Driver 完成 §4 门禁，记录并消费允许的启动 slot；启动 Worker 与一次 Desktop | OS 真实进程、精确 executable/入口、独立 Worker 实例、已认证 IPC；两者均不得在获准边界前启动 |
| T-02 | Worker ready，Desktop Main 发送唯一 SUM3 request | 两端关联一致；Worker 校验身份、operation、taskInputRef 对应内容和单次限制 |
| T-03 | Worker 记录 TASK_ACCEPTED 后停在执行前屏障；Driver 持久化接受记录及 execution intent 后才发出一次 release | 这是固定控制步骤，正负例共用相同实现字节；未 release 时 Stub 不执行 |
| T-04 | Worker 执行 SUM3，发出一个 result；Desktop 收到并展示；Driver 比较预定 oracle | count=3、sum=10、一个 accepted request、一个 execution、一个 result；没有自动重放 |
| T-05 | Driver 已持久记录 result 后，要求 Desktop 正常关闭；观察 2 秒 | Desktop 进程组按规则退出；Worker 仍为同一 instance/generation/PID/start time，未产生新任务或新 Worker |
| T-06 | Driver 发出唯一显式 stop；Worker ACK 并退出，Driver 观察进程/children/管道/lease 终态 | 正例 Worker 正常退出；控制消息 ACK 不能代替 OS 退出；不得操作归属不明的其他进程 |
| T-07 | Collector 封存原始记录、对账 slot 和事件序列，生成 finalization | 无未解释缺口/残留，摘要能由原始记录重推，Snapshot 与输入字节不回写 |

执行前屏障用于把故障定位在可重复的真实边界，防止求和过快而无法到达指定故障点。它不是业务 Mock 门禁：只有受信 Driver 能放行，等待有时限，通道断开或到期即停止，不能绕过 Authority/Preflight。故障场景中不会把未执行的 SUM3 记为完成。

## Bounded Design Parameters — Zero Currently Authorized

| 参数 | 设计上限 |
|---|---|
| 每个场景 | 1 个有界 Driver/validation session；场景之间不得共享已消费 Plan/slot |
| 正例/运行故障场景 | Worker 最多 1 次物理 launch attempt；Desktop 最多 1 次启动/attach；业务请求最多 1 次；显式 stop 最多 1 次 |
| 启动前负例 | Worker/Desktop launch = 0；只有独立获准的验证/故障材料读取范围 |
| Worker child / external network | 均为 0；Electron 自身 child 的精确 roster 和有限上限须按所选版本在启动批准中给出，缺失即阻断 |
| Preflight decision 到 spawn | 最多 5 秒；失效即终止该 request，不自动重跑 |
| READY / 单任务 | READY 最多 30 秒；TASK_ACCEPTED 至 result 最多 5 秒，含执行屏障等待 |
| Runtime 总窗口 | 从 Worker slot 消费起最多 120 秒；超时只进入预先批准的停止范围 |
| stop / containment / finalization | graceful stop 10 秒；已批准 containment 再限 5 秒；finalization 30 秒 |
| Evidence | 主 sink 每 Case 最多 8 MiB，单事件最多 64 KiB；独立 fallback 最多 1 MiB；超限不截断覆盖、不继续业务 |
| retry / restart / resume / recovery | 均为 0；当前不申请任何额度 |

这些是拟采用的有界参数，符合 R2 不得隐式扩容/重试的原则，不代表机器性能或实现已经满足。正例若依赖强制 containment 才能结束，不能通过其“正常 stop”判据；负例则按预先定义的 containment 期望判断。

# 4. Authority Flow

```text
独立 Authority / Trust 选择 + 有界准备权限
                    ↓
       获准准备并定型有限输入（本轮未做）
                    ↓
Source / Runtime / Task / Definition / Plan / Input Manifest
                    ↓
        Minimal Snapshot 精确 payload 与 Ref
                    ↓
Owner Signature → 正式 Binding → 独立 Freeze Approval / Activation
                    ↓
        真实 Final Preflight → 有效 launch decision
                    ↓
      原子消费与持久记录 → Launch → Runtime facts
```

“Authority → Snapshot → Preflight → Launch”包含前置范围批准和后置精确 Snapshot 选择，不能省略后者。任何执行输入变化都使受影响下游引用与批准失效，不重算 hash 后自行继续。

| Gate | 真实检查 | 失败动作 |
|---|---|---|
| G-00 Bootstrap | 独立入口认证 Driver/collector 及其 host prerequisite；证据根与控制能力可用 | 不运行不可信验证器或 payload；不足记为未达后续 Gate |
| G-01 Authority | 外部准确选定的 S7 批准、Anchor/来源关系、用途/Case/时窗/撤销条件、Plan 和各类预算匹配 | AUTHORITY_BLOCKED；零未获准 Desktop/Worker launch |
| G-02 Snapshot | 独立 key/expected Ref、真实 Signature、最终 payload 状态、引用域、正式 Binding 路径与 envelope 字节一致 | SNAPSHOT/INTEGRITY_BLOCKED；不信任旁路文件或自声明 key |
| G-03 Inputs | 全部选中 source/runtime/任务/控制输入及有限闭包一致；实际执行对象与解析路径受持续保护 | INPUT_INTEGRITY_BLOCKED；不安装、修复、替换或 fallback |
| G-04 Environment / Control | 目标环境、角色权限、IPC、输入根与父目录保护、有限 children、lease/ledger、证据持久化及停止能力真实具备 | CONTROL_BLOCKED；规则文字或一次 hash 不替代 OS enforcement |
| G-05 Final Boundary | Gate 仍有效，实际对象未换，外层允许 launch；租约及 slot 原子消费持久化后再 spawn | 事务/持久化失败不 spawn；消费后 spawn 失败不退还；结果未知则保留 UNKNOWN |
| G-06 Runtime | 握手及每个后续受控动作仍在权限和时限内，Evidence First 屏障有效 | 阻断新业务，执行已获准有界停止；无自动重试/替代实例 |

实际启动与持续加载的字节须受控，含 Node/Electron 的必要文件、loader/DLL 和父路径；对被测主体可写的执行/信任根不能放行。控制威胁范围按隔离 fixture 的受信角色明确，不宣称抵御管理员/内核接管。

普通 Desktop detach/close 和本次显式停止均须在所选 Plan 及 Activation 中列明。它们作用于本次已认证实例，不产生第二次 Runtime launch。实例 PID/generation 由外部运行关联记录选定，不能为 stop 回写 Runtime Snapshot；未知归属时不得广泛 kill 或补起进程。

权限实际来自独立批准与 Plan 的一致匹配。验证负例的**外层验证权限**允许 Driver 检查已定义的故障材料；它不等于被测候选的 Runtime 启动权。两者分开记录，才能在“无有效候选 Authority”时真实验证拒绝，而不把运行验证器本身变成未授权动作。

# 5. Snapshot Minimal Model

本节是概念字段合同，不创建 JSON、Signature、Binding、冻结 Identity 或私钥。新设计类型为 `P0S7_MINIMAL_RUNTIME_EXECUTION_SNAPSHOT`，schemaVersion 为 1；未来实现必须显式支持该类型并拒绝未知 schema，不能用它静默绕过旧包模型的检查。

| Required Concept | 最小字段 / 引用 | 唯一权威与域 |
|---|---|---|
| schema / scope | schemaVersion、recordType、最终 status、采用的 Scope/Design 精确引用 | FROZEN_INPUT / 指向先定型合同的 REFERENCE；实际可用 payload 必须为 OWNER_APPROVED_AND_FROZEN，状态本身不自授权 |
| authority anchor | authorityAnchor | 独立选定的治理 Git object identity 及规则；不自动选当前 HEAD |
| source identity | sourceIdentityRef | 有限 Source Record：项目根、base commit/tree 关联、输入集合、明确已有 patch/新文件来源、内容身份和 provenance；不冻结整项目 |
| runtime identity | runtimeIdentityRef | 所选 Node/Electron/Worker/Desktop/Stub/Driver/collector 组件描述及有限清单；版本/平台/ABI/字节归此所有，不包含运行实例 |
| runtime definition | runtimeDefinitionRef | 单一 Definition：角色/入口、argv/profile/roster、IPC 协议与权限/环境规则；Snapshot 不维护第二份可覆盖配置 |
| input reference | inputReference | 有类型引用集合：taskInputRef、有限声明/可达/文件清单、Frozen Input Manifest；所有可执行/可加载及控制输入完整覆盖 |
| invocation plan | invocationPlanRef | 预留标签、Case/kind、有限动作/预算/时限/根策略；无实际消费、进程或结果 |
| approval reference | approvalReference | **先于本 Snapshot 定型的 Scope Authority Approval 引用**，记录拟采用用途/范围/Plan 关联；只定位批准依据，不自授启动权 |

ContentRef 记录角色/类型、规范路径、字节数和 SHA-256，目标须为已定型的输入。FieldRef 指向唯一语义所有者，不另复制同一权威值。所选组件源、外部工具和实际项目源分别归属；实际环境观察不是可直接纳入 inputReference 的预期约束。

## Approval Reference Without a Cycle

先行 Scope Authority Approval 不能包含尚未生成的 Snapshot Ref、Binding digest、最终 Freeze Approval Ref 或任何 Runtime facts。若可用批准只存在于最终 Snapshot 之后，就不能将其塞入 payload 的 approvalReference；需要独立先行范围依据，或在后续获准合同中明确其他无环模型，当前不得自行放行。

最终 **Owner Freeze Approval / Activation 是外部记录**：它独立选定本 Snapshot Ref、正式 Binding 路径/envelope digest、key、Driver 与权限有效性，并核对先行范围批准。其精确身份从独立受信渠道取得，不由 Snapshot/Binding 自选；该最终 approval Ref 只进入门禁关联和 Evidence，不回填 payload。本设计没有生成任何一种批准。

Snapshot Ref 是 payload 的下游 SHA-256；Owner Signature 覆盖精确 payload bytes；Binding 承载同一份 bytes。payload 不含自身 hash，不含后生成的 Signature/Binding/最终批准 hash，避免自引用和重签循环。设计文档的自身摘要也只在最终回复提供。

## Forbidden Runtime Facts

禁止 PID、processStartTime、instanceId、generation、实际 endpoint/nonce/credential、实际宿主 SID/观察路径/探测结果、launch/READY/result/stop 时间、gate result、已用预算、失败、recovery Evidence 或 finalization 进入 signed Snapshot。

这些事实只能追加写入运行记录；不能通过 metadata、改名字段或引用已归档 Evidence 间接进入冻结输入。Definition/Plan 可以规定期望根、角色、时限和次数，不能把事后观察伪装成预期值。

本设计使用 `SELECTED_SPIKE_LAYOUT` 作为有限输入对象类型，不创建或声明 Production Package/Package Identity。旧 archive/packageHash 字段不属于这个新类型；省略的是未采用的包对象，实际有限布局的来源、依赖和完整性检查仍为必需。

# 6. Evidence Model

| Record | 必需内容与来源 | 最小真实性要求 |
|---|---|---|
| startup | Driver 的外层验证许可、候选 Authority、Gate/正式 Binding、预期与实际输入；OS spawn/进程身份、Worker READY/握手、Desktop attach | Driver + OS observer + IPC 两端交叉关联；未到达则 null/NOT_REACHED + 原因 |
| runtime | request/send/accept/release/execution/result、Desktop 收到结果和关闭、Worker 同一实例继续存活、stop/OS exit | Worker Stub 是业务 producer；Desktop/Main、Driver、OS 分来源，不能全由 Stub 生成 |
| failure | 唯一故障触发、首失败、expected/observed、达到边界、已消费 slot、未执行动作、containment/残留/未知 | 触发器日志不替代实际拒绝/崩溃/写入失败与控制结果 |
| recovery disposition | parent failure、恢复权限检查、NOT_AUTHORIZED/NOT_REACHED、无 restart/resume/replay 的观察 | 继承四类 Evidence 的 recovery 类别；不执行或宣称真实恢复成功 |
| finalization | 原始 artifact 索引、bytes/SHA-256、source/序列/因果、输入引用、ledger、进程/资源终态、缺口与最终 verdict | 独立 recordType，不是第五种业务 producer，也不是仅有 summary 文件就完成 |

每条原始事件至少含 identity、source、timestamp、lifecycle state、Case/request、存在时的 Invocation、输入引用及信任状态、producer/collector identity、sourceSequence、causedBy/correlation、expected/observed 和 boundaryReached。UTC 与来源本地单调时间、OS process start time 分别记录，不用跨进程时间先后代替因果。未知值写 UNKNOWN + reason，未生成值写 null + reason。

Driver、输入/信任根、slot ledger 与证据 sink 的写权限由独立控制层保护，Worker 不可修改。原始 producer 事件、Collector 接收与派生索引分开；接收到自报 PID/hash 不自动成为 AUTHENTICATED。密钥、凭据、token 和敏感环境内容不写日志。

## Persistence and Finalization

request、Gate decision、slot consumed、spawn/execution/stop intent、failure 和 terminal record 必须在依赖它的动作前持久 flush。普通运行事件最长 1 秒或 64 KiB flush，先到者生效；掉电/丢事件不补造历史。执行屏障必须等待真实持久化结果，不接受 Mock write-success。

主 sink 不可用时不开始 Runtime；运行中失败则停止新任务/不发 release，转入已授权 fallback 记录与 containment。fallback 不能继续业务或延长预算。两个 sink 都无法保留关键事实时，记录能力不成立；后续只有独立获准对账能补充新观察，不能改写原 UNKNOWN/INCOMPLETE。

finalization 只有在原始记录完整可对账、预期与实际各预算清楚、所属进程/资源终态明确时才为 FINALIZED。索引不含自身 hash，后续引用记录再固定其摘要；原始 Evidence、finalization 和 Review 都不回填 Snapshot。发现确证违规时保留 FAIL，不因另有证据缺口将其抹成“仅未知”。

# 7. Failure Cases

以下 Case 均 `DESIGN_ONLY / NOT_EXECUTED`。单一故障使用独立获准的隔离材料，其他必要前提有效；未达到指定触发点只能 INCONCLUSIVE。原输入、签名、Binding 和历史证据不修改，负例不得通过重新批准已损坏输入来改变期望。

| Case | Trigger / 注入点 | Expected Boundary / 行为 | 必需 Evidence / 场景判据 |
|---|---|---|---|
| ED-F01 Invalid authority | 外层 Driver 有明确只读负例权限；候选缺少适用 Runtime Activation，其余身份材料有效 | G-01 AUTHORITY_BLOCKED；Worker/Desktop launch=0，无任务 | 真正候选权限拒绝 + OS 零 launch + 终态。负例 PASS 不表示 Runtime 已运行 |
| ED-F02 Modified input | 隔离副本中 task input 的一个整数从 5 改为 6；保持原获准 taskInputRef，启动前提交检查 | G-03 INPUT_INTEGRITY_BLOCKED；无 Runtime、无任务，不能重算获准 hash 放行 | 变更位置/expected-observed bytes、真实完整性拒绝及零 launch；较早无关 Gate 阻断不算证明 |
| ED-F03 Worker crash | 已真实 READY 且 TASK_ACCEPTED 持久化，尚未 release；获准故障控制动作使已认证 Worker 非正常终止 | OS crash/exit → RUNTIME_FAILED；无 SUM3 result、无替代 Worker；Desktop 退出/其他所属资源有界收口 | 指定实例终止事实、未执行/未返回、slot 不退还、无 restart/replay；单纯 Stub 返回 error 不算 crash |
| ED-F04 Evidence failure | TASK_ACCEPTED 已持久化；获准 fault mode 关闭主 sink 的写句柄，使下一次 execution intent 追加/flush 真实失败；fallback 保持可用 | EVIDENCE_WRITE_FAILURE；不发 release、不计算/返回任务，使用 fallback 记录真实失败并有界停止 | Collector 原始 I/O 错误、fallback/OS 停止、无业务继续及对账完整才可场景 PASS；只证明此写失败路径，不声称所有磁盘故障已覆盖 |
| ED-F05 IPC boundary | 真实 Worker READY；获准有界故障客户端以未批准会话/角色握手，不能获知正常实例凭据 | AUTHENTICATION_BLOCKED；业务 accepted/execution/result 均为 0；控制方停止所属进程 | 真实管道/对端/握手拒绝与 OS/业务计数；仅客户端自报连接失败不足以证明 |
| ED-F06 Snapshot mismatch | 外层负例权限固定目标；候选使用合法签名的 Snapshot，但与独立选定 expected Ref 不同 | G-02 SNAPSHOT_REF_MISMATCH；零 Runtime，不因 signatureValid 而放行 | 实际正式 Binding payload Ref 与外部 expected Ref、真实拒绝；不伪造签名或读取私钥 |
| ED-F07 Replay / recovery denied | ED-C01 或 ED-F03 的原记录已定型；在新的只读验证权限内提交复用已消费 Plan 或无恢复许可的意图 | AUTHORITY_BLOCKED / RECOVERY_NOT_AUTHORIZED；无新 Worker/任务/新 launch slot | 原消费与失败关联、拒绝及无副作用观察；旧 Case 不被再次执行，不证明恢复成功 |

ED-F01 的缺授权是具体选中的最小变体；过期/撤销/耗尽等未实际覆盖的变体不能宣称已证明。ED-F02 验证冻结任务输入的修改拒绝；执行文件/快照篡改的其他变体若要形成结论，需明确追加到未来授权范围，不能从一个整数差异自动外推全部攻击面。

ED-F05 的故障客户端属于验证工具，需有精确字节、角色、连接次数和 process 上限的独立批准；不作为 Worker child，也不允许零预算调用。ED-F07 是新的有界只读验证请求，不是对旧 Invocation 的 retry。ED-F04 若连 fallback 也失效，缺失控制结果必须 INCONCLUSIVE；若可信观察已证明继续执行等违规，则 FAIL 优先，并同时记录证据缺口。

ED-F07 包含两个独立变体：a 为已消费 Plan 的再次提交，其余候选身份/时窗条件有效，首失败必须是消费/复用检查；b 为没有新恢复批准的恢复意图，首失败必须是恢复权限检查。各用独立外层验证请求，不叠加故障，不用较早的过期或缺失材料遮蔽目标判据；未获准覆盖的变体保持未决。

本设计要求实际控制机制，不把故障注入的启动、观察、清理或对账藏入免费后台操作。每个 Case 的准备、验证请求、故障工具、Desktop/Worker、停止和证据收口动作须在未来批准中有明确范围与有限计数；本文不创建这些 Plan、预算或 Invocation。

# 8. Acceptance Criteria

## Separate Outcome from Verdict

| 维度 | 取值与含义 |
|---|---|
| subjectOutcome | BLOCKED / COMPLETED / STARTUP_FAILED / RUNTIME_FAILED / INTERRUPTED / OUTCOME_UNKNOWN，描述被测对象 |
| validationVerdict | PASS / FAIL / INCONCLUSIVE，描述指定场景是否被充分证据支持 |
| evidenceStatus | FINALIZED / INCOMPLETE，描述原始记录与终态可对账程度 |
| scope disposition | 本最小输入/环境/Case 的结论；不自动覆盖原完整 Runtime、Package、恢复或 P1 范围 |

**PASS：** ED-C01 真实达到 Runtime，SUM3 的 request/execution/result 各一次、count=3/sum=10，Desktop 真实收到结果，关闭后 Worker 身份不变，显式正常 stop 和 finalization 完整。各已声明必需失败场景达到指定故障点并真实拒绝/停止，证据可重推，无未决安全/权限/输入保护/隐式恢复缺口。

**FAIL：** 可信事实证明违反预定判据，例如未获准 launch、接受改动输入/错 Snapshot、未认证请求进入业务、结果错误/重复执行、Desktop 关闭导致 Worker 意外终止、证据失败后继续业务、自动 restart/reuse、未按期限停止或篡改原证据。已有确证 FAIL 不因其他缺证据降级。

**INCONCLUSIVE：** 目标故障点未达到、必要组件/环境/批准未具备、只有自报而无独立事实、重要事件/进程退出/资源归属未知，或无法完成 finalization 且没有足够证据认定具体违例。普通正例在 Authority Gate 被阻断不算 Runtime PASS；只有事先定义的拒绝负例才可能以 BLOCKED 获得场景 PASS。

| Acceptance ID | 必需条件 |
|---|---|
| EA-01 | ED-C01 完整真实正例；负例成功或文档齐全不能替代 |
| EA-02 | MP-01～07 均有对应材料及实际证据；Source/Runtime/Plan/Snapshot/Approval 匹配，无自信任/引用环 |
| EA-03 | ED-F01～F07 各在其实际获准范围达到指定点并符合预期；缺失的必需场景保留未决 |
| EA-04 | 真实 Desktop/Worker/IPC 边界、持续输入/权限控制和有界停止成立；Stub 只承担业务逻辑 |
| EA-05 | 原始 startup/runtime/failure/recovery disposition 与 finalization 可独立对账，slot 不复用，无恢复/业务重放 |
| EA-06 | 报告精确输入、环境、Stub、未测变体、P1 延期与旧 Gate 限制；不报告全局 P0.S PASS |

如果后续 Owner 只授权部分 Case，可以报告这些 Case 的真实结果；不得据此将本设计的完整最小 Spike verdict 写 PASS。确定性任务正例只执行一次，所需负例是独立有界观察，不追加第二次业务正例来消除原失败。

## Readiness and Current Boundary

准备前只需对本最小源/工具/环境及允许准备动作作具体选择和授权，不要求先制造尚未获准的 Snapshot/Runtime。准备完成后才定型实际字节、无环引用与签名/正式 Binding；启动前再具备精确 Freeze Approval/Activation、各动作有限预算以及真实 Preflight。材料选择、准备、签名、验证和 Runtime 启动权限分别判断，不能因 DESIGN_ONLY 自动串行执行。

当前仍未知/未创建：精确 Node/Electron 工件及 ABI、有限源集合/实现、实际 Carrier/控制机制、fixture/角色/根/工具身份、独立 S7 信任与批准实物、Snapshot/Binding、Case Plan 与执行预算。本文不认证这些对象，不创建新的缺口文档链，也不要求先完成被延期的产品范围。

```text
DOCUMENT_STATUS = DESIGN_ONLY
DESIGN_ID = P0S7-MINIMAL-SPIKE-EXECUTION-DESIGN-20260905-01
CURRENT_GOAL = MINIMAL_CONTROLLED_RUNTIME_SPIKE
SCOPE_RECONCILIATION = COMPLETED
P0S6_STATE = CLOSED
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
RUNTIME = NOT_CREATED
PACKAGE = NOT_CREATED
SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
INVOCATION = NOT_CREATED
PREPARATION_AUTHORIZED = NO
RUNTIME_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
SIGNATURE_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
CANDIDATE_STATUS = generated_not_applied
CANDIDATE_APPLIED = NO
TESTS_EXECUTED = NO
MINIMAL_SPIKE_VERDICT = NOT_EXECUTED
P1_STARTED = NO
PROJECT_FROZEN = NO
```

## Performed Work and Unexecuted Items

仅新增本文，设计真实拓扑、SUM3 任务、独立 Authority/无环 Snapshot、证据与有限失败场景、三类 verdict 和当前授权边界。仅做静态文档核对：必需章节、引用/字段/场景对应、UTF-8 无 BOM/中文无乱码、SHA-256 与既有项目文件前后字节。

未写代码、创建 Runtime/Package/冻结源码/Snapshot/Binding/Signature/Invocation/运行 Evidence；未修改 Runner、Manifest、lockfile、Git 配置或 upstream，未应用 Candidate；未下载、安装、构建、解包、配置环境/权限或读取私钥；未执行测试、项目 Verification、Preflight、Launch、Driver/故障工具、Commit、Push。设计参数和场景均未执行或获预算。
