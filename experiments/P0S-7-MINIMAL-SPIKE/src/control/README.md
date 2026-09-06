# Minimal Spike Control Plane & IPC Integration 静态实现候选

状态：`CONTROL_INTEGRATION_SOURCE_COMPLETE_CANDIDATE / NOT_PRODUCTION / NOT_EXECUTED`。

本目录是 P0.S-7 / ED-C01 的可审查静态源码，不是 Runtime、Final Snapshot、Binding、Signature、Invocation、Preflight 结果或运行证据。所有真正产生 I/O、进程、Named Pipe、ledger 消费或 Evidence 的能力均位于显式 factory/方法调用后；缺少独立选择的身份、批准、精确输入、Windows helper、持久化 sink 或单次预算时必须拒绝。

适用授权：

- `P0S7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-20260905-01`：仅批准白名单目录内静态源码和模板。
- `P0S7-SNAPSHOT-PREPARATION-AUTHORIZATION-OWNER-APPROVAL-20260905-01`：仅批准非冻结 Candidate、输入盘点、SHA-256 与 provenance 记录。

本次没有获得 Runtime、测试、Preflight、Invocation、Final Snapshot、Binding、Signature、key、构建或 helper 编译权限。

## 当前静态实现

| 范围 | 源码实现 |
|---|---|
| Bootstrap | `bootstrap.mjs` 只接受外部已选择的 Driver identity、expected Snapshot ref、Scope Approval ref 与 trust inputs；拒绝缺失、未知、重复、过期/未生效或用途不匹配的材料。它不读取 HEAD、环境变量或普通配置来选择 Anchor、公钥、Snapshot 或批准。只有 Driver/Trust/Prerequisite 三类独立 proof 都为明确 `ALLOW` 后才调用已选择 Driver。 |
| Preflight | `preflight.mjs` 固定执行 Authority → Scope Approval → Snapshot/Binding → Input byte identity → Runtime Definition → Environment/permission policy → Budget/single-use slot → Evidence sink readiness → Launch boundary。任一结果不是严格 `ALLOW` 即拒绝；Preflight 只验证既有批准，不生成 Owner Approval。 |
| Driver | `driver.mjs`、`control-channel.mjs` 与 `runtime-controller.mjs` 实现 ED-C01 单次状态机：Worker 先启动、Desktop 后启动、等待 `TASK_ACCEPTED`、持久化 execution intent、单次 release、持久化 result、关闭 Desktop 后观察 2 秒内 Worker 身份不变、单次显式 stop、OS exit 观察及 finalization。失败只进入已拥有资源的有界 containment；无 retry/restart/resume/reuse。 |
| Ledger | `single-use-ledger.mjs` 通过 append-only journal 的 stable read、compare-and-append、durable flush 和 read-back 原子占用唯一 Plan/Invocation。记录一旦追加即 `CONSUMED_NON_REFUNDABLE`；append/flush/read-back 结果未知时永久进入 `UNKNOWN_NO_REUSE`，没有退款或复用 API。 |
| Windows control | `windows/windows-control-adapter.mjs` 要求预先选择并认证的 broker/helper；验证 PID + process start time + executable path/ref + token SID + parent identity + generation。`WindowsControlBoundary.cs` 是 source-only 的 Win32/.NET 边界，使用 documented process、token、named-pipe peer PID、CurrentUserOnly pipe 与 Job Object API。`broker-contract.json` 固定控制协议能力。不存在 helper binary；缺失或 ABI/identity 未验证时 fail closed。 |
| IPC | `protocol.mjs`、`framing.mjs`、`session.mjs`、`named-pipe.mjs` 与 `message.schema.json` 固定 `SHACO_SPIKE_IPC_V1`、Windows Named Pipe、4096 bytes（含 LF）、角色/类型/路由、session/generation/correlation 与逐来源序列。握手必须先有 Windows OS peer attestation，再使用受保护交付的 session credential 完成 proof；role、nonce、credential 或 PID 单独均不能成为 OS 身份。无 TCP/HTTP fallback 或运行时 Carrier 切换。 |
| Desktop | Main/Renderer/preload 保持分离。Main 需要明确 Electron loader、真实 launch guard 和 IPC client factory；没有顶层 `app` 调用。preload 只暴露两个固定无参数 channel；Renderer 没有 Node/shell/fs/process/任意 IPC 或 Worker lifecycle API。Desktop 不 spawn、restart、stop 或拥有 Worker。 |
| Worker | `entry.mjs` 是独立显式入口，连接 broker-backed Named Pipe 后只服务一个有界任务。`state-machine.mjs` 在 durable `TASK_ACCEPTED` 后进入 `AWAITING_RELEASE`；验证 Driver 的 durable execution intent 后只 release/execute 一次；result 先持久化再开始唯一 dispatch。duplicate request/release/result/stop 拒绝。stop 只回 `STOP_ACK` 且明确 `osExitObserved=false`，不调用 `process.exit` 冒充 OS 退出。 |
| SUM3 | `stub/sum3.mjs` 仍从严格输入 `[2,3,5]` 实际求和，模块加载不执行。预期值已放到独立 `control/sum3-oracle.mjs`，Worker 结果不由 expected 常量注入；最终比较由 Driver 完成。 |
| Evidence | `envelope.mjs`、`writer.mjs`、`collector.mjs`、`finalization.mjs` 实现有界 envelope、startup/runtime/failure/recovery 分类、append-only、durable flush、独立 fallback、来源序列/全局序列/causality、首失败保留、secret redaction、64 KiB 单事件、8 MiB 主容量、1 MiB fallback 容量与 finalization reducer。主 sink 失败后即禁止业务继续；两个 sink 均失败时终态未知。源码不自行读取当前时间或 PID，必须从注入的独立 fact source 取得。 |
| Templates | `evidence-structure` 中五份模板继续保持 `TEMPLATE_ONLY / NOT_EXECUTED`，事实字段为 null，空数组不代表真实观察。 |

## 安全与事实域边界

- 所有 endpoint、nonce/challenge、credential、PID、process start time、generation、instance/session、实际 result、Gate decision、slot 消费与事件时间均为未来 `RUNTIME_FACT`；本静态候选没有创建这些值。
- Candidate/inventory、源码存在、schema 校验、哈希或 `node --check` 都不产生 `FROZEN_INPUT`、信任、执行批准或 Runtime proof。
- Windows helper 的 C# 源码不是已编译、已选择、已签名、已验证 ABI 或已可用的 binary。Node/Electron 实物闭包、helper host/binary、目标 fixture 与 ACL/父目录保护仍须以后独立闭合。
- 凭据不得从 argv、环境变量、普通配置、Renderer 或日志交付；接口只接受预先打开的受保护交付能力。Evidence redaction 不使不安全交付合法。
- `phase-a-policy.mjs` 保留无参数的默认拒绝锁，且没有 allow/debug/skip/unsigned/local auto-trust 开关。真实集成只能由外部选择的 verifier/capability 通过明确 factory 注入，未知结果不能降级。

## B01～B11 静态实现后的边界

| Blocker | 当前状态 | 当前源码证据与仍缺材料 |
|---|---|---|
| B01 Worker Node bytes/ABI | `BLOCKED` | 目标仍为 Node 22.19.0/win32/x64；没有获提供其精确 executable、分发来源、ABI/Node-API 或闭包。不得使用工具 Node/PATH 代替。 |
| B02 Electron admission closure | `BLOCKED` | Main 集成源码已完成；Electron 35.7.5 历史池仍只是 REFERENCE，可信来源、ABI、实际加载闭包、children roster 和 S7 目标布局未闭合。 |
| B03 Driver/collector/bootstrap | `PARTIALLY_RESOLVED_SOURCE_ONLY` | 已有真实控制/采集源码、顺序、失败和持久化接口；精确 Driver host/executable identity、受信选择、实际 sink 与运行证明仍缺。 |
| B04 required Windows helper | `PARTIALLY_RESOLVED_SOURCE_ONLY` | 已有 JS adapter、broker contract 与 C# OS 边界；未编译、未生成 binary、未选择 host/ABI、未进行 OS 行为证明，运行路径仍拒绝。 |
| B05 source set/entry integration | `PARTIALLY_RESOLVED_SOURCE_ONLY` | 当前 37 个 Phase A/Control Integration 文件及静态边可盘点；文件仍未冻结/未形成 Source Identity，外部宿主和 helper 闭包未完成。 |
| B06 unique definition/hidden inputs | `PARTIALLY_RESOLVED_SOURCE_ONLY` | factories、固定 Carrier、启动顺序、时限和禁止 fallback 已源码化；精确 argv/profile、系统加载项、环境策略、roots 与 Electron roster 仍缺。 |
| B07 task/control/schema inputs | `PARTIALLY_RESOLVED_SOURCE_ONLY` | SUM3 task/oracle、V1 schema、control messages、evidence bounds 已明确；未来精确 task/control refs、validator/runtime adoption 与冻结仍缺。 |
| B08 target fixture/permissions | `BLOCKED` | 未选择或配置 fresh Windows fixture、角色权限、受保护 roots、ledger/evidence/fallback roots。 |
| B09 independent S7 trust | `BLOCKED` | 未提供 Anchor、public trust identity/use、独立交付或 Driver Bootstrap 选择；源码不会从 HEAD/env/config 自选。 |
| B10 prior Scope Approval/Plan | `BLOCKED` | 没有适用 Runtime Scope Approval、有限 Plan、可用 Invocation 或 slot；当前预算为 0。 |
| B11 Snapshot creation authorization | `BLOCKED` | 只有 preparation 权限；Final Snapshot/Freeze/Binding/Signature/Activation 均未获授权。 |

## 本轮允许的核对与明确未执行项

只允许进行纯静态核对：`node --check`、JSON 严格解析、UTF-8/BOM/乱码、文本 import/resource/helper/broker 边、路径/reparse confinement、SHA-256/bytes、Git status/diff/diff --check。它们不是测试或 Preflight。

明确未执行：Runtime/Desktop/Worker/Driver/helper 启动、SUM3 调用、Named Pipe listen/connect、Preflight、测试、Evidence 写入、ledger 创建/slot 消费、Invocation、Final Snapshot、Binding、Signature、key、下载、安装、构建、C# 编译、Commit、Push、staging。

```text
CONTROL_INTEGRATION_SOURCE = COMPLETE_CANDIDATE
CANDIDATE_STATUS = CANDIDATE_ONLY
FREEZE_STATUS = NOT_FROZEN
EXECUTION_STATUS = NOT_EXECUTED
FINAL_SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
SIGNATURE = NOT_CREATED
INVOCATION = NOT_CREATED
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
SNAPSHOT_CREATION_READY = NO
READY_FOR_EXECUTION = NO
```
