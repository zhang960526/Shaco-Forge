# P0.S-7 Runtime Definition Finalization Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-RUNTIME-DEFINITION-FINALIZATION-DECISION-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Decision Result | `FINALIZED_FOR_INPUT_PREPARATION` |
| Decision Basis | 依据本轮用户委托，作出下列 Runtime 输入选择；不是执行批准或密码学签名 |
| Record Date | `2026-09-05` |
| Scope | `MINIMAL_CONTROLLED_RUNTIME_SPIKE / ED-C01 / NOT_PRODUCTION` |
| Phase A / Review | `IMPLEMENTATION_COMPLETE / PASS`，继承本轮用户提供的阶段状态 |
| Preparation | `COMPLETED_FOR_REEVALUATION` |
| Exact Runtime Input Closure | `BLOCKED`；策略/目标版本决定完成，不等于实际输入已冻结 |
| READY_FOR_EXECUTION | `NO` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Runtime / Snapshot / Binding / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| Current Usable Execution Budget | `0` |

本决定固定本次最小 Spike 的组件角色、目标版本和输入归属，供后续准备使用。不能确认的实际字节、ABI、工具或控制能力保持 UNKNOWN/BLOCKED。“Finalization”指本轮输入选择的定案，不表示 Runtime Definition Identity、Snapshot 或其完整闭包已经 OWNER_APPROVED_AND_FROZEN。

## Read Basis

| Ref | 已读取依据 | SHA-256 |
|---|---|---|
| R1 | [Runtime Preparation Slice Record](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-PREPARATION-SLICE-RECORD.md) | `1E01A8DBD48C702E5C81EB9E53438CFD3DF5E82F06305EFC0A52644B1C9EE294` |
| R2 | [Runtime Preparation Input Inventory](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-PREPARATION-INPUT-INVENTORY.json) | `2F67490E4D280420AC51B9B089B9E013A163CC02D7C2DA317D031E3BBFB10BC9` |
| R3 | [Minimal Spike Execution Design](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |

R1/R2 的候选观察与旧选择状态保留原字节；本文将下列目标版本/角色从候选或待选择推进到明确输入决定，不改写其历史观测。R2 的 metadata/hash 只证明准备记录中的文件身份，不认证来源、ABI、运行行为或信任用途。本轮只读取依据与核对文件，不重新执行组件探测或验证工具。

# 1. Runtime Choice

**决定采用：Electron Desktop → 认证 Windows Named Pipe IPC → 独立 Node Worker → SUM3 Stub，由独立 Driver/collector 控制与记录。** 选定 Windows x64 为本次组件准备目标；具体 fresh fixture 仍未选定。

| Choice ID | Component | 本次决定 | 实际交付边界 |
|---|---|---|---|
| RC-01 | Electron | 选择 `35.7.5 / win32 / x64` 为 Desktop 的固定输入目标；Main/Renderer/preload 分离 | R2 中历史 P0.S-2 分发是来源核对与字节比较的准备候选，不批准直接从历史路径运行，也不宣称已形成 S7 Runtime |
| RC-02 | Node | 选择 `22.19.0 / win32 / x64` 为独立 Worker 的固定输入目标 | 保留 R1 记录的既有设计版本，避免因工具可取得就变更输入；R2 的工具 Node `24.19.0` 保持 REFERENCE，不作为替代或 fallback |
| RC-03 | Worker | 选择项目自有最小 Node Worker，入口源码基线为 `src/worker/entry.mjs`，业务仅为项目 `src/stub/sum3.mjs` | 不采用 Full Harness、upstream 内部入口、Electron renderer Worker 或进程内函数替代独立 OS Worker；现有入口仍是拒绝执行的骨架 |
| RC-04 | Driver | 选择本 Spike 专用、与被测 Desktop/Worker 分离的控制实现；Driver 与 collector 可由同一受信工具承载，但角色及来源分开 | 不选历史 Harness/Runner 或普通 Desktop 充当信任入口；实际实现、宿主 executable、版本、字节及 Bootstrap 身份仍 UNKNOWN，未选择现成可执行 Driver |
| RC-05 | Helper | 将最小 Windows 原生控制适配能力列为 `REQUIRED`：OS 对端身份、受保护凭据交付、独立进程/退出观察、受限生命周期与停止控制 | 拒绝 NONE、认证 Stub、普通 role 字段或仅凭“能连管道”满足要求。具体 addon/helper executable/受信宿主适配形式、版本与 ABI 尚无依据，保持 UNKNOWN；不凭空选包或宣布已有 Helper |

Electron 的选择依据是 R1/R2 已盘点同版本的具体本地候选；Node 的选择依据是延续既有 22.19.0 目标，不将静态工具用途变成 Runtime 用途。这是本实验输入基线决定，不是推荐生产版本或断言二者已兼容。目标版本如需变更，应显式修订受影响决定和引用，不能使用 latest、全局 PATH、缓存优先或自动升级回退。

Worker 与 Driver 的身份不能混同：即使未来选择同一发行版 executable，也必须分别记录角色、入口、权限和实例，且 Driver/宿主先经独立 Bootstrap 认证，不能先运行待验证代码让它自证可信。本文不指定未提供的 Driver executable，也不将 Worker Node 选择隐含扩展为 Driver 宿主批准。

Helper 的“必需”是能力选择，不是强制增加一个未设计的常驻进程。后续选定实现形式后，其全部 `.node`/DLL/loader/executable、宿主 ABI、有限进程 roster 和权限必须进入实际闭包；若现有受信适配层可以完整承载这些能力，需有明确实现依据，不能静默省略控制要求。

## 固定行为边界

- Desktop Main/Renderer/preload 分离，Renderer 无 Node/shell/任意文件访问或 Worker 生命周期权限；Desktop 只提出一次请求并展示结果。
- IPC 固定 `SHACO_SPIKE_IPC_V1` / Windows Named Pipe，单帧最多 4096 bytes；必须有真实 OS 对端检查及本次实例认证，不换用 TCP/HTTP 或进程内调用。
- Worker 只处理 `[2,3,5]` 的 SUM3；预期 `count=3,sum=10` 是独立 oracle，不是实际结果。接受请求后等待 Driver 的持久化屏障释放；之后显式 stop。
- Driver 持有独立控制权，Desktop 关闭不得导致 Worker 生命周期终止；Worker child=0、外部网络=0；Electron 自身辅助进程须有实际版本对应的有限 roster，当前数量 UNKNOWN。
- Authority、Snapshot/Binding、Preflight、OS 控制及 Evidence 不得 Mock。startup/runtime/failure/recovery disposition 和 finalization 继续适用；不要求通过本决定执行恢复。

# 2. Version and ABI

CONFIRMED 必须区分“决定已作出”和“实物观察已有记录”；UNKNOWN 表示尚缺精确信息；BLOCKED 表示该缺口阻止实际 Runtime 输入定型或执行就绪。

| Item | Confirmed | Unknown | Blocked |
|---|---|---|---|
| Electron | 本决定目标 `35.7.5 / win32 / x64`；R2 记录 package.json、dist/version、PE FileVersion 为 35.7.5，PE Machine 为 `0x8664` | 官方来源对应、完整性信任依据、内置 Node/V8、Node module ABI/Node-API、必要动态加载闭包及精确 children roster | 目标版本已选，实际可接受执行布局尚未闭合 |
| Node | 本决定目标 `22.19.0 / win32 / x64` | 对应分发来源、归档/executable 字节、ABI/Node-API 和宿主适用材料；R2 未提供该版本实物 | 不能用另一个版本文件或其 hash 填充 22.19.0 输入 |
| 工具 Node | R2 记录本地工具文件版本 24.19.0、PE Machine `0x8664` | 作为 Spike Runtime 的来源/ABI/兼容性并未建立；本决定不选择其 Runtime 用途 | 不允许自动替代选定的 Worker Node |
| Worker / Desktop 源码 | R2 记录入口和 Main/preload/Renderer 的静态文件身份；本决定选择项目自有实现路径 | 未来实际执行入口集成、argv/profile、最终 source set/provenance 与完整闭包 | 现有工厂和 start/release 拒绝锁仍在，不能视为可启动实现 |
| Driver / collector | 独立控制/采集角色和真实门禁要求已定案 | 精确实现版本、宿主及工具字节、Bootstrap、信任选择、预算 ledger/flush/停止机制 | 当前只有控制拒绝策略与模板工厂，真实实现未交付 |
| Helper | 必需 Windows 原生控制能力已定案 | 实现形式、源码/二进制来源、版本、宿主 ABI、构建目标及加载/子进程清单 | 未实现或不能证明适配时保持 FAIL-CLOSED，不将该项判为不适用 |

R2 所记录的 Electron executable 为 201233408 bytes，SHA-256 `588BD82E36AD1ACDAE4615B6336284E420704389864F54EF2D10EA66C1A3CDE0`；历史 dist 盘点为 73 文件、297927853 bytes。它们是候选字节参考，不是完整依赖闭包认证或本轮冻结 Identity。

R2 的工具 Node 为 92825416 bytes，SHA-256 `3602F2BB1A10F2CBAB4C36886218A33C1AB3DB87290E73B033C46C77147D0237`，该身份属于 **24.19.0 参考文件**，绝不能标作 22.19.0 的 SHA-256。本决定不虚构 22.19.0 的文件 hash 或 ABI 数值。

两个宿主分别拥有 ABI 域；版本一致、PE 架构字段、npm 包名或单文件 hash 均不能证明 native 兼容。后续每个 native 组件应对应实际加载宿主的 ABI/Node-API、架构和构建来源，不要求 Electron 内置 Node 与 Worker Node 的 ABI 数字相等。所需材料未取得前，不运行探针或 rebuild 来绕过当前禁止事项。

# 3. Source Boundary

| Source / 位置 | 决定角色 | 用途与限制 |
|---|---|---|
| `D:\Project\Shaco-Forge` | `ACTUAL_PROJECT_SOURCE` | 自有 Spike 源码的唯一项目根候选；不冻结整个 checkout |
| `experiments/P0S-7-MINIMAL-SPIKE/src/desktop`、`src/worker`、`src/ipc`、`src/stub` | 项目自有 Source 输入基线 | 后续仅选择实际参与执行/加载的有限输入及其变更来源；本决定不修改代码 |
| 同根 `src/control`、`src/evidence` | 项目自有控制源码位置基线 | 为 Driver/collector 相关源提供项目归属，不将现有拒绝策略/模板工厂冒认为完整 Driver；不指定尚不存在的入口文件 |
| 同根 `evidence-structure` 与 README | `REFERENCE_SOURCE` / 结构与说明 | 不是实际事件或运行结果；需要使用的 schema 应后续明确选择，不能把 20 个盘点文件一概当作执行集 |
| `D:\Project\Shaco-Forge-Upstream\deepseek-harness` | `REFERENCE_SOURCE` | 架构/依赖/能力参考；不是本次 Worker、Runtime/Package/Snapshot 的源；不操作该目录 |
| 项目 docs 下历史 P0.S-2 Electron dist | 外部分发的 `REFERENCE_SOURCE` / 准备候选 | 物理上位于项目目录不使其成为项目自有源或可信 Runtime；选择目标版本不授权直接运行/复制历史工件 |
| Codex 工具 Node 24.19.0 与当前开发机 inventory | `REFERENCE` | 工具/宿主观察不升级为本次 Runtime 输入或 fixture |
| 未来 Node/Electron 分发、Helper 外部组件 | 独立来源的选定外部输入，当前未完成准入 | 需精确来源、字节及有限闭包；不能伪称来自 Shaco Forge 源码，也不能从历史文件存在自动获得信任 |

R2 的 HEAD/tree 是准备时的对象观察；20 个 Spike 文件当时均未跟踪，不能用该 HEAD/tree 独自代表它们，也不能从 HEAD 推导 Authority Anchor。后续 source identity 必须结合实际 input set、patch/新文件字节和 provenance。本文件不接受整个 dirty checkout、不修复 Git ownership、不修改 safe.directory、Manifest 或 lockfile，Candidate 保持 generated_not_applied。

# 4. Runtime Identity Model

采用单向身份模型：Runtime Definition 拥有目标角色、入口/argv/profile/roster、协议及预期环境/权限规则；Runtime Identity 拥有实际选定组件版本/平台/ABI和精确字节清单；Snapshot 只引用这些唯一所有者，不维护第二份可覆盖配置。

| Domain | 归属字段 | 当前含义 |
|---|---|---|
| `FROZEN_INPUT` | 未来合法定型的 source identity、runtime identity、Definition、task/control input、先行 scope approval、有限 Plan 与预期权限/根/时限 | 是字段归属规则，不表示本轮已生成冻结对象。Node/Electron 目标版本先由本文定案，实际 bytes/ABI 仍需取得 |
| `RUNTIME_FACT` | PID、processStartTime/start time、instanceId、generation、实际 endpoint/nonce/credential、宿主观察、READY/result/stop 时间、Gate 结果、预算消费及实际输出 | **禁止进入 Snapshot**，也不能通过 metadata、改名字段或间接引用塞进冻结输入；只进入未来获准运行关联/证据 |
| `REFERENCE` | 本决定、R1/R2 准备观察、历史 P0.S-6 信任、upstream、工具 Node、开发机 OS/ACL、历史候选清单 | 不自动授予信任、配置或执行权；含观察事实的 inventory 不可整体作为 Frozen Input 引用 |

后续 Snapshot Preparation 采用 R3 的 `P0S7_MINIMAL_RUNTIME_EXECUTION_SNAPSHOT` schemaVersion 1，并整理：

| Reference | 后续准备的对象 |
|---|---|
| sourceIdentityRef | 有限项目 source set 与字节、commit/tree/patch 关联及 provenance |
| runtimeIdentityRef / runtimeDefinitionRef | 本轮选定策略落实后的实际组件清单与唯一 Definition；缺 ABI/Driver/Helper 时不生成假完整对象 |
| inputReference | 固定 SUM3 task input、有限依赖/加载/文件/control input 清单；不夹带运行事实 |
| approvalReference | 在 Snapshot 前定型、独立适用的 Scope Authority Approval。本文仅是输入选择，不能代替执行 Scope Approval |

精确 payload 在这些输入定型后才可能生成；其摘要、签名、正式 Binding、最终 Freeze Approval/Activation 位于下游。payload 不包含自身 hash 或下游 Signature/Binding/最终批准 hash，最终批准不回填 payload。最终批准从独立信任入口选择 expected SnapshotRef、正式 Binding、公钥用途、Driver 和执行范围，不能由候选对象自证。

# 5. Decision Impact

**允许后续 Snapshot Preparation 的非冻结分析工作；不授权 Snapshot 创建或 Runtime launch。**

| Item | 本决定的影响 |
|---|---|
| Runtime 目标选择 | Electron 35.7.5、Worker Node 22.19.0、项目自有独立 Worker、独立 Driver/collector、必需 Windows 控制适配能力已明确；不再自动选择工具 Node |
| 后续 Snapshot Preparation | 可据本文整理字段映射、有限 source/runtime/input/approval 候选引用与未决项；仅为分析，不创建 payload/冻结 Identity/Manifest/Plan，也不生成假 hash/ABI |
| 精确 Driver / Helper / ABI | 仍 UNKNOWN/BLOCKED；选定职责不代替真实实现，必须以实际源码/工件及适用材料闭合 |
| 精确输入冻结 | 未批准且未完成；最终 source set、来源/依赖闭包、fixture/权限、Anchor/Trust Root、先行批准仍缺 |
| 准备中的副作用 | 不新增下载、安装、构建、解包、修改环境/ACL、配置 Trust 或修改代码权限；已有适用静态实现权限不因本文被撤销，也不扩展成执行权 |
| Runtime launch / Invocation / Tests / Preflight | `NOT_AUTHORIZED`；本轮不申请额外额度、不执行任何一次 |
| Snapshot / Binding / Signature | 本轮均不创建，本文不授予其生成/签名或验证许可 |
| Readiness | 只关闭目标版本/角色策略选择，不关闭实际输入/控制/信任/环境/证据/执行批准缺口；READY_FOR_EXECUTION 仍 NO |

后续要重新判定 readiness，仍须有实际组件与 ABI/helper 闭包、真实 Driver/认证 IPC/ledger/持久化/停止实现、精确目标 fixture/权限、独立 S7 信任和适用 Owner 批准。Snapshot/Binding/签名只能在相应权限下生成；启动须在真实受控流程完成 Preflight。不得仅凭本文状态或字段齐全宣称 PASS。

既有 ED-C01 请求 Invocation=1 仍只是请求。当前可用 Invocation、Retry、Resume、Recovery 全部为 0。Production Runtime、Package Release、Full Harness、Plugin Ecosystem、Installer、Deployment 和 P1 均不包含在本决定内，部分场景决定不改变 R3 全部验收要求。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_RESULT = FINALIZED_FOR_INPUT_PREPARATION
ELECTRON_TARGET = 35.7.5 / win32 / x64
WORKER_NODE_TARGET = 22.19.0 / win32 / x64
TOOL_NODE_24_19_0 = REFERENCE_ONLY
EXACT_RUNTIME_INPUT_CLOSURE = BLOCKED
SNAPSHOT_PREPARATION = ANALYSIS_ONLY_ALLOWED
SNAPSHOT_CREATION_AUTHORIZED = NO
RUNTIME_LAUNCH_AUTHORIZED = NO
READY_FOR_EXECUTION = NO
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_BUDGET = 0
RETRY = 0
RESUME = 0
RECOVERY = 0
```

仅新增本文，完成五类组件选择、版本/ABI 状态、Source 与身份域边界及后续准备影响。交付核对仅检查文档章节、引用/状态、UTF-8 无 BOM/中文乱码、SHA-256 及既有工作区字节，不执行 Runtime 测试。

未启动 Runtime/Desktop/Worker/Driver/IPC，未创建 Runtime/Package/Snapshot/Binding/Signature/Invocation/Plan/真实 Evidence，未读取私钥、签名、Preflight 或测试；未修改源码/Runner/Manifest/lockfile/Git 配置/upstream，未应用 Candidate、下载/安装/构建/解包、配置系统/权限、Commit 或 Push。
