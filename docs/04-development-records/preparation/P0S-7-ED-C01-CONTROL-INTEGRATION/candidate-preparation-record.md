# P0.S-7 ED-C01 Control Plane & IPC Integration Candidate Preparation Record

## 1. Record identity

- Record ID: `P0S7-CONTROL-INTEGRATION-CANDIDATE-PREPARATION-RECORD-20260906-01`
- Candidate generation: `P0S7-ED-C01-CONTROL-INTEGRATION-G02`
- Scope: `ED-C01 / MINIMAL_CONTROLLED_RUNTIME_SPIKE / NOT_PRODUCTION`
- Artifact status: `CANDIDATE_ONLY`
- Freeze status: `NOT_FROZEN`
- Execution status: `NOT_EXECUTED`
- Domain: `REFERENCE`
- Previous audited candidate: `P0S-7-ED-C01`（仅关联，未覆盖、未提升）

本记录只陈述静态源码候选与 Candidate Preparation 结果，不是 Runtime proof，不是 Final Snapshot、Frozen Input Manifest、Binding、Signature、Key、Plan、Invocation 或 Owner Approval。

## 2. Authorization and boundary

本次修改由以下两个 Owner Approval 的明确范围支持：

| Authority | Bytes | SHA-256 | Adoption |
|---|---:|---|---|
| `docs/04-development-records/P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL.md` | 13001 | `82765644A2D40E82C84632EDD842E1395E0E91424267F782FBA4633628021C1D` | Phase A / Control Integration 静态源码修改依据 |
| `docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-AUTHORIZATION-OWNER-APPROVAL.md` | 7594 | `A6C74B51CACFFF4CF844A73B764BD78994C19D49CD51C0007D87A6296626591D` | Candidate Preparation、inventory、哈希与 provenance 记录依据 |

源码写入仅发生于批准的 `experiments/P0S-7-MINIMAL-SPIKE` 子目录；Candidate 工件仅写入本目录。未修改旧目录 `docs/04-development-records/preparation/P0S-7-ED-C01`，未修改其他产品、计划、Runner、Manifest、Binding、lockfile、upstream 或 Git 配置。

## 3. Candidate state

| Field | Value |
|---|---|
| `P0S7_STATE` | `NOT_STARTED` |
| `P0S7_ALLOWED` | `NO` |
| `READY_FOR_EXECUTION` | `NO` |
| `SNAPSHOT_CREATION_READY` | `NO` |
| `CURRENT_USABLE_EXECUTION_BUDGET` | `0` |
| Actual Frozen Inputs | `0` |
| Runtime Facts Created | `0` |
| Final Snapshot | `NOT_CREATED` |
| Binding | `NOT_CREATED` |
| Signature | `NOT_CREATED` |
| Invocation | `NOT_CREATED` |

当前静态盘点覆盖 37 个 Phase A / Control Integration 文件，共 173338 bytes。其中本轮新增 17 个源码文件（98968 bytes），修改 11 个源码文件（56051 bytes），9 个 Phase A 文件保持原字节。`snapshot.candidate.json` 选择 28 个 prospective Frozen Input candidate，共 137758 bytes；这只是待独立审查的选择，不产生任何 Frozen Input。

## 4. Created source files

| Path | Bytes | SHA-256 |
|---|---:|---|
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/bootstrap.mjs` | 4797 | `80D3A38114396138A63303D46FBEEEA3AE60684049A3B68B3432C80D07AFCF07` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/contracts.mjs` | 3794 | `7394B3005D3F70F301AB10B89135A225E43A93B8C5DAA209EA01B568A9D2EC76` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/control-channel.mjs` | 3513 | `17F806ABCF4ACC2365C2574E91DA9745A63BFD64CF69A22D02E0B83245F92C1B` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/driver.mjs` | 8802 | `E8FC79233D04F4FFD00D845C9036AE1905B8C1AFDEA209BE442D06E0B5E71C44` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/preflight.mjs` | 4940 | `E1948D13FCC1FBC949BDD371B18D32BFC39839099E26B1702FE582F027D638F6` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/runtime-controller.mjs` | 5777 | `47ACE4DC8A62F2B694B5B03CADF45D16A0A7E5984A87404F028797A11CC4FF3E` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/single-use-ledger.mjs` | 4286 | `12CE12915FD73C1F2203A4C662463D64194A6514F32422280A233B7CAD812FEF` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/sum3-oracle.mjs` | 919 | `75F0639CBAA15393C2EFDCD390E2B1A7E450E110D5A44059F894AD49F0D8E611` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/windows/broker-contract.json` | 1687 | `7A45E020B4C815F9C72C488D5F85E1C1777A9EFB5EDBBDE32D76416CDA363F79` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/windows/windows-control-adapter.mjs` | 9345 | `04A72091362D09092CC799AD6BB97AB2B6CAA5AFE0226077D83BAE8B1E93E3F7` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/windows/WindowsControlBoundary.cs` | 22629 | `B5BEA2309099D79884A6BC29A7EC5543FE684EFE435E0FA60A791FBCBACED955` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/evidence/collector.mjs` | 6230 | `FD262B4ED5630BE31313DAF48357E5A36BAC1D8DFE97928306B1ABD64AC63985` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/evidence/envelope.mjs` | 4762 | `4EE76F28EB57BCE866BACC817A4BEFB379FA457CA70BF5E3F92C41847462E7D8` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/evidence/finalization.mjs` | 2911 | `BBA9E433066A575482B1B11FE5857ED8BC368F9FDD6A90F49BEBB52EF2EBBDB9` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/evidence/writer.mjs` | 4836 | `EC7113019A7379EFF6E1D449C370201250BE9962239F92EC30A6471790DFB295` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/ipc/framing.mjs` | 2010 | `6C7361FB8474D5DD29DAEB8ED66D393A23D35E56B782EF751C6B14B18A142EFD` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/ipc/session.mjs` | 7730 | `5E4868E4357E94699841175E1E4960CA7F8D57CD1D69E2A7442ADD6C9224DDA4` |

## 5. Modified source files

| Path | Bytes | SHA-256 |
|---|---:|---|
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/phase-a-policy.mjs` | 1267 | `EAD5ADD0AFFE58145CD5FF622CC29CAE11141CB57C06E145469473FC3E7EED87` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/control/README.md` | 9695 | `93FEF6BE88E8F4AC8B86AD161BEE1B5DEC27A59FE887F8E60F5AE8E2994BA7C2` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/desktop/main.mjs` | 6304 | `ED2A04539F3DE27AAEA76547FC09E8B791F9B673D4DC3301CB8867504E4D2C6D` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/desktop/preload.cjs` | 459 | `9B668E64025FD6EE64219634E76F79626DFF7442371C9D66E47DBCD197C1E5D8` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/desktop/renderer.js` | 2297 | `FACAB7B907048F1A478D9496E750CCF52CC25C13EC1D129B00605CE2D6347336` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/ipc/message.schema.json` | 9573 | `14E1EAB18F19A644109DCCF0B9C0611366B8D2E9C5815511C4A723CC9DA417EC` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/ipc/named-pipe.mjs` | 6396 | `9E47224901DA88BADDE9AEE2B2387EE1BB0459B9A6501E3B388A559A7883BD27` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/ipc/protocol.mjs` | 8110 | `24D57CEA67E903B6F49E77CE99FF5FF2E7F16C9096B6ABE061A11382A81C574E` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/stub/sum3.mjs` | 1025 | `3EE5F3B5F2D3AE188A709E9015451A811872CF16B74C32601BA439102B5177D5` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/worker/entry.mjs` | 4614 | `4C3D841BA2C36CAD8CF8322B1BC22311495852A78ED87FBA4157BBF06E79FFB2` |
| `experiments/P0S-7-MINIMAL-SPIKE/src/worker/state-machine.mjs` | 6311 | `25E502514979E53B3777C3D9DC670515991F4E004C29DAC37BD213E43B43A6F9` |

完整的 37 文件 byte identity、provenance、domain、adoption/exclusion、External Node/Electron references、Governance references，以及 import/resource/helper/broker 静态边见 `input-inventory.json`。该 inventory 的整体采用被明确禁止，不能作为 Frozen Input。

## 6. Implementation summary

- Bootstrap：仅接受外部已独立选定的 Driver identity 与 trust inputs；校验缺失、未知、重复、过期、用途及关联，不读取 HEAD、环境变量或普通配置建立信任。
- Preflight：实现 Authority → Scope Approval → Snapshot/Binding → input byte identity → Runtime Definition → environment/permission → budget/single-use slot → Evidence sink → launch boundary 的固定单次顺序；只验证既有授权，任何 unknown/missing/mismatch 均拒绝。
- Driver：实现 ED-C01 单次状态机、Worker-first/Desktop-second、`TASK_ACCEPTED` 屏障、execution intent durable barrier、单 release、result/oracle、Desktop close observation、显式 Worker stop、finalization 与首失败 containment。
- Ledger：实现唯一 Plan/Invocation 键、稳定读取、CAS append、flush/read-back、不可退还消费、歧义状态禁用，以及 no retry/resume/reuse 语义；未实例化或写入实际 ledger。
- Windows control adapter：实现强制 helper capability contract，并校验 PID + start time + executable ref、SID、parent/child、generation、pipe peer、ACL/protected endpoint、ownership、bounded stop/containment。C# 文件只是 source-only Win32/helper 边界，未编译、未执行；缺失 helper 时拒绝。
- IPC：实现 `SHACO_SPIKE_IPC_V1`、4096-byte framing、严格 role/type/route/sequence/correlation/session、handshake 状态机与 broker-backed named-pipe factories；先取得 OS peer attestation，credential 仅作握手材料；无 TCP/HTTP fallback、无 runtime carrier 切换、无 import-time listen/connect。
- Desktop：保持 Main/Renderer/preload 分离，Renderer 仅暴露两个固定 channel；Main 依赖显式 Electron/IPC factories，缺少真实 readiness/credential/peer identity 时拒绝；Desktop 不拥有 Worker spawn/restart/stop 权限。
- Worker：独立显式入口；认证与关联检查后只接受单 request，`TASK_ACCEPTED` 后等待已持久化 intent 的 release；SUM3 单次执行，重复 request/release/result 拒绝；stop acknowledgement 与 OS exit observation 分离，不使用 `process.exit` 冒充退出。
- SUM3：只从经验证输入执行真实 `a + b + c`；expected value 位于独立 control oracle；模块加载不执行、不生成 Evidence/PASS。
- Evidence：实现 bounded/redacted envelope、startup/runtime/failure/recovery disposition、append-only writer、durable flush、独立 fallback、sequence/correlation、first-failure 与 finalization reducer；未创建当前时间/PID，未写实际 Evidence，模板仍是 `TEMPLATE_ONLY / NOT_EXECUTED`。

## 7. Remaining interfaces and non-proofs

- Windows helper/broker 只有源码与协议接口；没有已编译、已选择、已绑定的 binary，也没有 ABI/runtime proof。
- `node.exe 22.19.0` 目标输入仍缺失；当前 tool Node 明确排除，不允许回退到全局 Node、PATH 或 upstream。
- Electron 历史池仍只是 Reference；尚无 admission、ABI/dynamic closure、target layout 或最终 roster。
- Anchor/public trust/Driver、Final Snapshot、Source/Runtime Identity、Binding、Signature、Activation、Plan、Invocation、single-use slot、fresh fixture、环境/权限基线、Evidence sinks 均未被合法选择或创建。
- JSON Schema 是 Reference；具体 validator adoption/freeze 尚未完成。
- 所有运行时行为、OS identity、durability、containment 与 finalization 均需在后续独立授权、构建和测试阶段证明。

## 8. B01–B11 reassessment

| Blocker | Status | Current evidence / remaining gap |
|---|---|---|
| B01 | `BLOCKED` | Node 22.19.0 exact bytes/source/ABI/Node-API 缺失；tool Node 被排除。 |
| B02 | `BLOCKED` | Electron 历史池 75/75 文件可重算，但 admission、ABI、dynamic closure、roster、target layout 缺失。 |
| B03 | `PARTIALLY_RESOLVED_SOURCE_ONLY` | Bootstrap/Preflight/Driver/Ledger/Collector 源码存在；selected host、trust、sinks 与 runtime proof 缺失。 |
| B04 | `PARTIALLY_RESOLVED_SOURCE_ONLY` | JS adapter、broker contract 与 C# OS boundary 存在；无 compiled/selected helper binary、ABI 或 runtime proof。 |
| B05 | `PARTIALLY_RESOLVED_SOURCE_ONLY` | 37 个 source/reference 文件及静态边已盘点；无 Frozen Source Identity 或完整 external closure。 |
| B06 | `PARTIALLY_RESOLVED_SOURCE_ONLY` | Factory、carrier、order、limit 已在源码定义；exact argv/profile/roots/environment/system loads/roster 缺失。 |
| B07 | `PARTIALLY_RESOLVED_SOURCE_ONLY` | Task/oracle/protocol/control/evidence contract 已源码化；exact refs、validator adoption 与 freeze 缺失。 |
| B08 | `BLOCKED` | fresh fixture、OS baseline、role permissions、protected roots 未选择或配置。 |
| B09 | `BLOCKED` | 独立 S7 Anchor/public trust/Driver selection 未提供；源码禁止 HEAD/env/config auto-selection。 |
| B10 | `BLOCKED` | 适用的 prior Runtime Scope Approval、bounded Plan 与 usable slot 缺失；budget 为 0。 |
| B11 | `BLOCKED` | Final Snapshot creation/freeze 未获授权；Binding/Signature/Activation 均不存在。 |

因此 Candidate Preparation 可提交独立 review，但 Snapshot Creation 与 Runtime Execution 继续被阻断；没有 blocker 被写为 `CLOSED` 或 `READY_FOR_EXECUTION`。

## 9. Candidate artifacts

| Path | Record ID | Bytes | SHA-256 / identity note |
|---|---|---:|---|
| `docs/04-development-records/preparation/P0S-7-ED-C01-CONTROL-INTEGRATION/input-inventory.json` | `P0S7-CONTROL-INTEGRATION-INPUT-INVENTORY-20260906-01` | 27677 | `109BBFF4EDD6A47C8BC33E07F8967C0C32B55FBD9CD6B0229B8A1A172E15317C` |
| `docs/04-development-records/preparation/P0S-7-ED-C01-CONTROL-INTEGRATION/snapshot.candidate.json` | `P0S7-CONTROL-INTEGRATION-SNAPSHOT-CANDIDATE-20260906-01` | 8160 | `39A278537401AE3FC2842667A5277164397A40553548653CF7AC92B787183F8F` |
| `docs/04-development-records/preparation/P0S-7-ED-C01-CONTROL-INTEGRATION/candidate-preparation-record.md` | `P0S7-CONTROL-INTEGRATION-CANDIDATE-PREPARATION-RECORD-20260906-01` | 由最终静态盘点记录 | 本文件不使用自引用摘要自证；外部最终报告记录其 bytes/SHA-256 |

## 10. Previous candidate preservation

| Previous artifact | Bytes | Expected and rechecked SHA-256 |
|---|---:|---|
| `docs/04-development-records/preparation/P0S-7-ED-C01/snapshot.candidate.json` | 8453 | `4AABDD2AAC3FD2120344D9F589DEA69CFBBD77C017F3E9EBDC3D7D80BFA982D2` |
| `docs/04-development-records/preparation/P0S-7-ED-C01/input-inventory.json` | 160876 | `5E279AD89C56239D70AFAB9B1DE4605E2FE61B138DAD127BF3B0C7180ACCDF75` |
| `docs/04-development-records/preparation/P0S-7-ED-C01/candidate-preparation-record.md` | 32750 | `559FCBCA985B2F6C43A0945B6271DAC97E93DE73FD0A25FBEB47DAC63643D204` |

## 11. Static verification

- `node --check`: 25 JS/MJS/CJS files, PASS；只做语法解析，未 import/require 实现模块。
- Strict JSON parse: 10 JSON files across the Phase root and new Candidate directory, PASS。
- UTF-8/BOM/mojibake: strict UTF-8 decode PASS，BOM 0，疑似乱码 0。
- Relative import/resource path resolution: 56 references, PASS。
- Reparse/path confinement: 2 approved roots，未发现 reparse point 或 path escape。
- Inventory byte identity: 44 records matched，missing 0，mismatch 0。
- `git diff --check`: PASS；输出的换行提示来自任务开始前已存在、且本轮未修改的两个 `docs/03-v1.0-plan` tracked 文件。
- 未执行 build、test、preflight、SUM3、Electron、Worker、named-pipe listen/connect、C# compile/helper、Runtime 或 network 操作。

## 12. Explicit non-execution statement

Runtime 未启动；SUM3 未调用；IPC 未 listen/connect；Preflight 未执行；Evidence 未生成；ledger 未创建或消费；Invocation 未创建；Snapshot/Binding/Signature/Key 未创建；Tests 未运行；Commit/Push/Staging 未执行。所有变更保持在工作树中，等待后续 MCP 验证与独立审计。
