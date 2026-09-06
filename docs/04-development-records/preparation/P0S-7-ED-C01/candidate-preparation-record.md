# P0.S-7 Snapshot Candidate Preparation Slice Record

本 Slice 已完成候选输入盘点、原始文件字节 SHA-256、provenance 与分类记录。**Candidate 可审阅；Snapshot Creation Readiness = BLOCKED。** 当前没有 Final Snapshot，也没有任何冻结或执行权限增量。

| Field | Value |
|---|---|
| Record ID | `P0S7-SNAPSHOT-CANDIDATE-PREPARATION-SLICE-20260905-01` |
| Document Status | `CANDIDATE_PREPARATION_RECORD_ONLY / REFERENCE` |
| Slice | `COMPLETED_WITH_EXPLICIT_GAPS` |
| Candidate | `CREATED / CANDIDATE_ONLY / NOT_FROZEN / NOT_EXECUTED` |
| Current Goal / Scope | `MINIMAL_CONTROLLED_RUNTIME_SPIKE / ED-C01 / NOT_PRODUCTION` |
| Phase A / Review | `IMPLEMENTATION_COMPLETE / PASS`，继承本轮用户及 G03/G08 状态，未复跑 Review |
| Runtime Definition | `FINALIZED_FOR_INPUT_PREPARATION`；目标决定完成，精确输入闭包仍阻塞 |
| Snapshot Preparation Approval | `APPROVED_SNAPSHOT_PREPARATION_ONLY` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Final Snapshot / Binding / Signature / Invocation | `NOT_CREATED / NOT_CREATED / NOT_CREATED / NOT_CREATED` |
| S7 key / Runtime / Frozen Input Manifest / Plan | 本 Slice 均 `NOT_CREATED` |
| Invocation / Runtime / Preflight / Retry / Resume / Recovery budget | `0 / 0 / 0 / 0 / 0 / 0` |
| Snapshot Creation Readiness / Ready for Execution | `BLOCKED / NO` |
| 原始字节采集时间 | `2026-09-05T14:41:03.7025110Z`，UTC；只属于准备观察 |
| 既有材料复核时间 | `2026-09-05T14:51:11.5499253Z`，UTC；107 个登记文件原始字节无变化 |

## 1. 读取依据与适用权限

G01 明确批准 candidate preparation、input inventory、hash calculation、provenance recording 四项白名单。本轮用户要求实际完成这些准备动作。G01 中“本轮只创建决定”的措辞保留它原来那一轮的历史语义，不阻止本轮执行已获批准备，也不扩大为下游动作许可。

G02 是准备计划；其 SP-05/VC 标准在本记录中只用于归纳库存和来源缺口，不执行准备验证会话、项目代码、测试、Preflight 或密码学验证。G09 的其他拟议产物和验证动作未因 G01 自动获批；本轮没有 draft manifest、preparation-validation 文件或验证会话。输出采用 G09 已提出的专用准备目录，并在写入前确认目录不存在、已存在父路径没有 reparse 重定向。

G03 定案 Electron 35.7.5、Worker Node 22.19.0、项目自有 Worker、独立 Driver/collector 与必需 Windows 控制适配。G07/G08 中较早的“目标待选”保留历史语义，以 G03 为本轮目标依据；其字节/宿主观察仍只为参考。G10 的 Phase A 批准不是 Runtime Scope Approval。G11/G12 的阶段状态继续保持 NOT_STARTED / NO。

| ID | 依据文件 | Bytes | 原始文件 SHA-256 |
|---|---|---:|---|
| G01 | [P0S-7-SNAPSHOT-PREPARATION-AUTHORIZATION-OWNER-APPROVAL.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-AUTHORIZATION-OWNER-APPROVAL.md) | 7594 | `A6C74B51CACFFF4CF844A73B764BD78994C19D49CD51C0007D87A6296626591D` |
| G02 | [P0S-7-SNAPSHOT-PREPARATION-EXECUTION-PLAN.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-EXECUTION-PLAN.md) | 19377 | `32AA8C5610E2C95384A645C6F7A16F8E50F9BFD7DF39B444F0E581BB01CDB642` |
| G03 | [P0S-7-RUNTIME-DEFINITION-FINALIZATION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-DEFINITION-FINALIZATION-DECISION.md) | 17018 | `777F7044A89D6B506409E3A1ABB20653A8D8FC9CF0E8C7659E59AD664EC2E1CB` |
| G04 | [P0S-7-MINIMAL-SPIKE-SNAPSHOT-PREPARATION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-SNAPSHOT-PREPARATION-DECISION.md) | 15177 | `F3A06C33480F1CBFAE51C06039B9CC30E9C5F20D9432754D35CF3ACD272922AD` |
| G05 | [P0S-7-MINIMAL-SPIKE-TRUST-BINDING-PREPARATION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-TRUST-BINDING-PREPARATION-DECISION.md) | 17186 | `57E3303DFFFA4BD1092C64E10D1C4EAC63E188ED77FE168C8F4D7A039AB543C8` |
| G06 | [P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-EXECUTION-DESIGN.md) | 32287 | `BE043F5D6FCD8B50037601358C70142BCDDCAEE81A5F1D28E87BC5141127ACBA` |
| G07 | [P0S-7-RUNTIME-PREPARATION-INPUT-INVENTORY.json](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-PREPARATION-INPUT-INVENTORY.json) | 34708 | `2F67490E4D280420AC51B9B089B9E013A163CC02D7C2DA317D031E3BBFB10BC9` |
| G08 | [P0S-7-RUNTIME-PREPARATION-SLICE-RECORD.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-RUNTIME-PREPARATION-SLICE-RECORD.md) | 23050 | `1E01A8DBD48C702E5C81EB9E53438CFD3DF5E82F06305EFC0A52644B1C9EE294` |
| G09 | [P0S-7-SNAPSHOT-PREPARATION-AUTHORIZATION-REQUEST.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-SNAPSHOT-PREPARATION-AUTHORIZATION-REQUEST.md) | 12525 | `EC5AA8E9BA8CFDC0AF9C537B39B99F754B4E9671A9F16C149DF47F3FBC64D1B6` |
| G10 | [P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-MINIMAL-SPIKE-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL.md) | 13001 | `82765644A2D40E82C84632EDD842E1395E0E91424267F782FBA4633628021C1D` |
| G11 | [P0S-FEASIBILITY-SPIKE.md](/D:/Project/Shaco-Forge/docs/03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md) | 44008 | `FB9C757F59EE201A92F51401953F006A9DE0DF4DA74BF36025D89933639C1295` |
| G12 | [SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md](/D:/Project/Shaco-Forge/docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md) | 15533 | `97A955CDC94B7E9DE027F43F7AC696FAE5086024CCA719E842D80532B28AC954` |

G01 所列 G02/G09 摘要、G02 所列 G03/G04/G05 摘要，以及 G03 所列 G06/G07/G08 摘要，与本次原始字节相符。摘要一致仅说明记录对应，不证明来源可信、批准的密码学有效性或 ABI。

## 2. 创建文件与 Candidate 边界

仅新增以下三个文件，未修改任何既有文件：

- [snapshot.candidate.json](/D:/Project/Shaco-Forge/docs/04-development-records/preparation/P0S-7-ED-C01/snapshot.candidate.json)：独立类型 `P0S7_SNAPSHOT_PREPARATION_CANDIDATE`，记录候选选择、未来字段所有者、缺口和禁止升级规则。
- [input-inventory.json](/D:/Project/Shaco-Forge/docs/04-development-records/preparation/P0S-7-ED-C01/input-inventory.json)：107 个既有文件的路径、bytes、SHA-256、角色、分类、采用/排除原因、Git 关系和 provenance；包含来源/依赖映射与缺口。
- [candidate-preparation-record.md](/D:/Project/Shaco-Forge/docs/04-development-records/preparation/P0S-7-ED-C01/candidate-preparation-record.md)：本配套记录，汇总来源、身份、分类与就绪度判断。

Candidate 使用独立记录类型，不是最终模型的 payload，也不是草稿 Snapshot、Source/Runtime Identity 或 Frozen Input Manifest。G/S/E/P 标签只是说明性目录标签，不是 ContentRef、FieldRef 或 SnapshotRef。Candidate 中的条目标签可到 inventory 查阅，但**禁止把整份 inventory 直接或间接当作冻结输入**。

Candidate 不包含自身摘要、后置 Signature/Binding/最终批准摘要或实际运行事实。本记录只在下游记录候选交付文件的普通 SHA-256，不产生 Final SnapshotRef。不能通过改名、改状态或复制摘要将 Candidate 升级为 Final Snapshot。

| 已保存准备文件 | Bytes | 普通文件 SHA-256 |
|---|---:|---|
| [snapshot.candidate.json](/D:/Project/Shaco-Forge/docs/04-development-records/preparation/P0S-7-ED-C01/snapshot.candidate.json) | 8453 | `4AABDD2AAC3FD2120344D9F589DEA69CFBBD77C017F3E9EBDC3D7D80BFA982D2` |
| [input-inventory.json](/D:/Project/Shaco-Forge/docs/04-development-records/preparation/P0S-7-ED-C01/input-inventory.json) | 160876 | `5E279AD89C56239D70AFAB9B1DE4605E2FE61B138DAD127BF3B0C7180ACCDF75` |

本 Markdown 自身 SHA-256 在最终交付回复返回，避免自引用。所有文件摘要均针对保存后的原始字节，没有转换 BOM、换行或重新序列化原输入。

## 3. Input Inventory 摘要

| 集合 | 文件数 / Bytes | 分类与限定 |
|---|---:|---|
| Phase A 全部已知文件 | 20 / 56,931 | 全部未跟踪；逐项保留来源，不用 HEAD 冒充这些字节 |
| 当前入口及静态可达依赖候选 | 11 / 18,809 | 未来 `FROZEN_INPUT` 候选；全部 `NOT_FROZEN`，不是完整执行集 |
| Phase A 参考文件 | 9 / 38,122 | 说明、协议/schema、模板工厂与空模板；逐项解释当前未纳入原因 |
| Electron 历史 dist | 73 / 297,927,853 | `REFERENCE`，只读比较池，未准入为 S7 Runtime |
| Electron 额外元数据 | 2 / 598 | package.json 与 path.txt；dist/version 已计入 73 项，不重复计算 |
| 治理依据 | 12 / 251,464 | `REFERENCE`；准备许可、规范与历史观察分开 |
| 全部已登记的既有文件 | 107 / 298,236,846 | 11 个未来输入候选、96 个参考文件；实际 Frozen Input = 0 |
| 本轮实际 Runtime Fact | 0 | 不采集 PID、实际 endpoint、结果、预算消费或实例 |

G07 的 20 个 Source 与去重后的 75 个 Electron 历史文件，共 95 个原始字节记录，均与本轮 bytes/SHA-256 一致。每个输入逐文件 SHA-256、绝对与相对路径见 inventory 的 `files`。Node 22.19.0 没有获提供的实物身份，未填写任何假摘要。

### Source 候选与参考的逐文件身份

下表中的 FROZEN_INPUT **只表示未来字段归属**；其原始文件盘点、采集时间和 Git 观察属于准备参考域。

| ID | Source 根内文件 | 分类 | Bytes | SHA-256 |
|---|---|---|---:|---|
| S01 | [evidence-structure/failure.template.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/evidence-structure/failure.template.json) | REFERENCE | 1135 | `19462357B0A1AFD5FEDEBF99F4BE74AC714F52EF99387161DE70CAF2CC814D05` |
| S02 | [evidence-structure/finalization.template.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/evidence-structure/finalization.template.json) | REFERENCE | 794 | `EAA5C8088AF476E05DB1F2ABF13D9D02532C44A267A813EB8358842122BBAEA8` |
| S03 | [evidence-structure/recovery.template.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/evidence-structure/recovery.template.json) | REFERENCE | 1136 | `E8AF1403D5E759FB09707B1903C241F0DB1368E5FAECCD639E68816C0788CF75` |
| S04 | [evidence-structure/runtime.template.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/evidence-structure/runtime.template.json) | REFERENCE | 1135 | `9BBC7BCBAE405ADE2CFBE4B076B57AB0E7840D39D9B1F6499507280CF4A53F0D` |
| S05 | [evidence-structure/startup.template.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/evidence-structure/startup.template.json) | REFERENCE | 1135 | `BB7F5A939A85D89DEC75964D94EB3F2B99D80DB4C5BC664A600C203A321F4D42` |
| S06 | [evidence-structure/template.schema.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/evidence-structure/template.schema.json) | REFERENCE | 9694 | `58C70379D7F84CF07D5E9C15E96DDB0E58AC77257F31F72C513411BC271B76CC` |
| S07 | [src/control/phase-a-policy.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/control/phase-a-policy.mjs) | FROZEN_INPUT 候选 | 1016 | `8C0A2AD1BE0A9FD981B0F66F61A490E70E5E4C1FDE2904E733A7EDBCE5E4C892` |
| S08 | [src/control/README.md](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/control/README.md) | REFERENCE | 10363 | `444FBA8120D1CA11E7262A4C0F03AAEACCAC0B66FDB6DBFF3157802280A33D14` |
| S09 | [src/desktop/index.html](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/desktop/index.html) | FROZEN_INPUT 候选 | 1232 | `052EA3B95429634A59780BDF07419C728F8C20E61AD33C0E1AE470F37C2B47FA` |
| S10 | [src/desktop/main.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/desktop/main.mjs) | FROZEN_INPUT 候选 | 3026 | `E19D35BCF755938D9E70656CF018E19E711FE5B206B25193274DB967A6242DE8` |
| S11 | [src/desktop/preload.cjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/desktop/preload.cjs) | FROZEN_INPUT 候选 | 430 | `54E03979E86AC2BA79BE90540A3F5DFFC5CF17228DC6275D98168DE652FB9633` |
| S12 | [src/desktop/renderer.css](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/desktop/renderer.css) | FROZEN_INPUT 候选 | 775 | `55340963EC0FAA36122381B129203885FC0BD6B6C945D1E74505CE533542A1C9` |
| S13 | [src/desktop/renderer.js](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/desktop/renderer.js) | FROZEN_INPUT 候选 | 1505 | `AA953E300341666311B05176171C9D6C375C25564C166A8F9F9A9166D7D2E9CC` |
| S14 | [src/evidence/templates.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/evidence/templates.mjs) | REFERENCE | 1283 | `15703CFEA8F5681077E0CED06C6DBD39190424F48FE20AE7287D798A84C3DC6B` |
| S15 | [src/ipc/message.schema.json](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/ipc/message.schema.json) | REFERENCE | 11447 | `5DE3C9DEDCC3C42267C65A02C139951F4230A0FC00C3454520083B86F0965ABF` |
| S16 | [src/ipc/named-pipe.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/ipc/named-pipe.mjs) | FROZEN_INPUT 候选 | 835 | `D8A819DE135646DAE6733CCA1BC53A06BE695B889779464050021C15F151E5DA` |
| S17 | [src/ipc/protocol.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/ipc/protocol.mjs) | FROZEN_INPUT 候选 | 4937 | `4E86014B37B10031D8EFB2613C709E2D20F6426072AA39ACC957A1A866AC5F61` |
| S18 | [src/stub/sum3.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/stub/sum3.mjs) | FROZEN_INPUT 候选 | 1111 | `89D1E0841038908ED435D09A9ACE051F28FFDA74C48DF3E4107FB7569B565F61` |
| S19 | [src/worker/entry.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/worker/entry.mjs) | FROZEN_INPUT 候选 | 1042 | `A220340E9C95B3B9451C3DE0D94651789C2E7A7EE5879D211206C400F0F312FF` |
| S20 | [src/worker/state-machine.mjs](/D:/Project/Shaco-Forge/experiments/P0S-7-MINIMAL-SPIKE/src/worker/state-machine.mjs) | FROZEN_INPUT 候选 | 2900 | `83FD15D5CF57B9E4E5DD1B586C3E66F6FF01999B61E88EBC11B6DDCB439979AA` |

9 项参考文件当前不进入已识别的 Main/Worker 候选图，不等于它们在未来控制实现中永远不需要：

| ID | 当前采用/排除理由 |
|---|---|
| S01 | TEMPLATE_ONLY / NOT_EXECUTED 结构文件；已读入口没有加载边，非运行事件或结果。 |
| S02 | TEMPLATE_ONLY / NOT_EXECUTED 结构文件；已读入口没有加载边，非运行事件或结果。 |
| S03 | TEMPLATE_ONLY / NOT_EXECUTED 结构文件；已读入口没有加载边，非运行事件或结果。 |
| S04 | TEMPLATE_ONLY / NOT_EXECUTED 结构文件；已读入口没有加载边，非运行事件或结果。 |
| S05 | TEMPLATE_ONLY / NOT_EXECUTED 结构文件；已读入口没有加载边，非运行事件或结果。 |
| S06 | 空模板形状规格；当前入口无加载边。未来真实 Evidence schema/持久化控制仍未交付。 |
| S08 | 静态实现与来源说明；已读入口不加载 Markdown，历史语法核对不等于本轮执行。 |
| S14 | 只有模板工厂；当前 Main/Worker 图不导入它，不能替代 collector。未来控制实现若加载则重新准入。 |
| S15 | protocol.mjs 未加载此 JSON；只作协议规格参考。未来 validator/schema 字节与加载选择仍必需。 |

真实 Driver/collector 或 validator 如未来读取 schema、模板、工具或其他文件，必须在适用授权下重新选择其字节及递归依赖；不能继续以 REFERENCE 标签规避闭包。

### 组件身份

- Electron 目标为 `35.7.5 / win32 / x64`（G03 RC-01）。历史 `electron.exe` 实物为 **201,233,408 bytes**，SHA-256 **`588BD82E36AD1ACDAE4615B6336284E420704389864F54EF2D10EA66C1A3CDE0`**。本轮只重算文件字节；PE 版本/架构来自 G07 历史观察，没有执行或重新探测 executable。
- Worker Node 目标为 `22.19.0 / win32 / x64`（G03 RC-02）。限定材料中未提供该目标实物、来源/ABI、精确 Runtime 路径，保持 UNKNOWN/BLOCKED，不声称全机不存在。
- 工具 Node 24.19.0 仅保留 G07/G03 的排除依据。本轮未重新读取或执行该工具；inventory 明确标记其引用摘要为历史观察，绝不把它作为 22.19.0 身份。
- Driver、collector、Bootstrap、Helper 的角色要求已定，真实实现与宿主/ABI/输入闭包仍未提供。拒绝策略、CONTROL_MODEL_ONLY 和模板工厂不能代替它们。

## 4. File Byte Identity 与 Provenance Mapping

### 字节方法及限度

只读取明确范围内既有普通文件，按原始保存字节计算 SHA-256 与 bytes。对每个路径先做项目根内规范化定位，检查文件及全部父路径直至卷根没有 reparse point；按 Windows 不区分大小写的定位比较，107 项没有重复路径。没有跟随未知链接、复制、解包或改变原字节。

对同一只读文件句柄计算两次摘要，并核对长度与读取前后写入时间；两次摘要一致。交付前重新计算 107 项，字节、HEAD/tree 与首次采集相符。文本只以严格 UTF-8 解码，非文本按不透明字节处理，不改变任何输入编码。

这些是准备时的文件观察；没有认证硬链接底层身份、实际 OS 有效权限、动态解析或未来持续保护。S7 最终解析路径仍 UNKNOWN，不能用本地观察路径自动授予运行权。

### 三类来源

| Provenance ID | 来源、版本与提交/工作区关系 | 已确认范围与限制 |
|---|---|---|
| P-SOURCE | 唯一实际项目根 `D:/Project/Shaco-Forge`；Source pool 为 `experiments/P0S-7-MINIMAL-SPIKE`；基线 HEAD `4545c7ddae517a3e2d7cf2fb94c0cfe19ae2c29f`，tree `9065d3c7910319be430ee3d6b9935bed14e354eb` | 20 项全部 UNTRACKED，未进入 HEAD/tree/index；逐文件新文件字节才代表本次观察。没有已跟踪 Source patch，也没有创建 patch/commit；作者及构建链未独立认证 |
| P-ELECTRON | 历史 P0.S-2 的 electron/node_modules 分发；package.json 声明 Electron Community、35.7.5；G03 选择目标版本 | 75 项是外部来源参考，不因保存在项目内变为项目自有源码。官方发行对应、原归档、交付方/保管链与可信完整性均 UNKNOWN；没有构建、验签或运行历史补造 |
| P-GOVERNANCE | 当前工作区 G01–G10 为未跟踪记录；G11/G12 为已跟踪且原先已修改文件；采用各自原始字节身份 | G01 是准备批准，G03 是目标输入决定，其他设计/历史/申请按各自用途保留；没有通过摘要计算获得新的 Authority 或密码学信任 |

P-SOURCE 的本地提供关系来自 S08/G08/G10 的既有实施记录，不能据此补造个人作者、构建工具链或审批签名。HEAD 只是工作区关联，不是 Authority Anchor，也不代表未跟踪文件。

P0.S-6 历史 Trust/Binding/Evidence、历史 Harness/Runner、upstream、开发机观察及未选全局工具保持 REFERENCE。本轮不打开其信任实物或 upstream 目录，不应用历史依赖 Candidate，不冻结整个 checkout。

## 5. 分类、唯一所有者与有限依赖关系

| Domain | 当前记录方式 | 边界 |
|---|---|---|
| FROZEN_INPUT（未来） | 11 个源/资源候选及未来 source/runtime/Definition/task/control/先行 approval/Plan 字段分类 | 尚未冻结任何文件或输入对象；预期约束必须有唯一所有者 |
| RUNTIME_FACT | 只列禁止类别，未填写实际事实 | PID/start time、instance/generation、实际地址/nonce/credential、运行时间、result/Gate verdict、消费/剩余额度及宿主观察不得直接或间接进入未来冻结输入 |
| REFERENCE | 本 candidate/inventory/记录、治理文档、9 项 Phase A 参考、Electron 历史池、工具与历史观察 | 不自动成为实际依赖、可信来源、获选 fixture 或执行批准 |

SUM3 `[2,3,5]` 与独立预期 `count=3,sum=10` 在 G06 §3 与 S18 第 2–3 行可定位；未调用 SUM3，未生成实际 result。S18 的业务常量不等于已创建 task input 身份；未来独立 Driver 的比较依据仍需定型。schema 与源码里描述事实的字段名称本身不是实际事实，但空模板也不是运行证据。

下列仅为概念归属及缺口映射，没有生成对应 Identity/Plan/Manifest 对象：

| 未来字段 | 唯一语义所有者 | 当前材料/缺口 | Blocker |
|---|---|---|---|
| sourceIdentityRef | SOURCE_IDENTITY | P-SOURCE + 11 个 source candidates；20-file pool 逐项区分 | B05 |
| runtimeIdentityRef | RUNTIME_IDENTITY | G03 目标选择；P-ELECTRON 原始字节参考；Node/Driver/Helper 实物未齐 | B01, B02, B03, B04 |
| runtimeDefinitionRef | RUNTIME_DEFINITION | G03/G06 规则是准备依据；精确 argv/profile/roster/根/环境单一所有者未交付 | B06, B08 |
| inputReference / taskInputRef | SELECTED_INPUT_AND_TASK_OWNER | SUM3_INPUT / SUM3_EXPECTED 与 G06 §3；schema/control/有限依赖尚需明确 | B07 |
| authorityAnchor | INDEPENDENT_OWNER_AUTHORITY | 独立选择要求 G05 §3；HEAD 非 Anchor | B09 |
| approvalReference | PRIOR_SCOPE_AUTHORITY_APPROVAL | 仅可指先行 Scope Approval；G01 不是执行 Scope Approval | B10 |
| invocationPlanRef | BOUNDED_PLAN_OWNER | 只记录缺口，不创建 Plan 或真实运行标签 | B10 |
| schema / scope | APPLICABLE_CONTRACT | G04/G06 的未来模型语义；本 candidate 使用不同 recordType，非 payload | B11 |

### 从入口文本识别的引用边

11 个候选由 S10 Main、S19 Worker 入口及下面实际声明的相对 import / 资源路径推导。声明、静态可达、历史分发文件池分开记录，没有启动入口或调用 resolver。

| 引用者 | 被引用者 | 边类型 / 文本位置 |
|---|---|---|
| S10 | S07 | 相对 import，源文件第 3 行 |
| S19 | S07 | 相对 import，源文件第 2 行 |
| S19 | S16 | 相对 import，源文件第 3 行 |
| S19 | S20 | 相对 import，源文件第 4 行 |
| S20 | S07 | 相对 import，源文件第 2 行 |
| S20 | S17 | 相对 import，源文件第 3 行 |
| S20 | S18 | 相对 import，源文件第 4 行 |
| S16 | S07 | 相对 import，源文件第 2 行 |
| S16 | S17 | 相对 import，源文件第 3 行 |
| S17 | S07 | 相对 import，源文件第 2 行 |
| S17 | S18 | 相对 import，源文件第 3 行 |
| S10 | S09 | URL_AND_LOADFILE，源文件第 8 行 |
| S10 | S11 | PRELOAD_PATH，源文件第 17 行 |
| S10 | S13 | RESOURCE_ALLOW_RULE，源文件第 52 行 |
| S10 | S12 | RESOURCE_ALLOW_RULE，源文件第 53 行 |
| S09 | S12 | HTML_STYLESHEET，源文件第 9 行 |
| S09 | S13 | HTML_SCRIPT，源文件第 10 行 |
| S10 | Electron Desktop 宿主的 node:url | 内置模块，第 2 行；实际宿主闭包未确认 |
| S10 | Electron Desktop 宿主的 electron | guarded dynamic import，第 43 行；拒绝锁位于加载前，未执行 |
| S11 | Electron preload 宿主的 electron | require，第 3 行；实际宿主未准入 |

Electron 历史 `vk_swiftshader_icd.json` 的 `ICD.library_path` 文本指向同目录 `vk_swiftshader.dll`；inventory 单独记录此参考配置边。它不证明实际启动会加载该文件，更不证明其余 native/系统 DLL 闭包完整。

已识别源码图的 11 条相对 import 和 6 条资源边在文本上没有回路。Main 的 electron/node:url、preload 的 electron 共 3 条宿主依赖仍有实际身份缺口；Driver/Helper、默认配置/解析、环境预加载、系统 DLL/字体、locale/GPU 与 children roster 也未完整界定。因此不能用这组局部边宣称全部输入无隐藏项或全局无环。

规范 Markdown 的背景链接不是实际机器输入边。未来 approvalReference 只能指先行 Scope Approval；先行批准不得依赖尚未创建的 Snapshot/Binding/最终批准。下游可引用上游精确身份，上游不得回填后置签名、Binding、Freeze Approval、Preflight 或 Evidence。当前实际完整对象图尚未具备，不伪造最终身份或图验证通过记录。

## 6. Snapshot Creation Readiness

**Ready 仅限准备交付：**

- 四项白名单授权及阶段状态已核对。
- 107 个有限既有文件已登记 path/bytes/SHA-256/provenance；20 个 Source 的 Git 关系及采用/参考理由明确。
- Electron 目标版本与历史参考池、Worker Node 目标与工具 Node 已分开；未用参考字节替代缺失实物。
- 已给出三域分类、8 类未来字段所有者、有限加载边及 11 项缺口，材料可供后续审阅。

**Blocked 项与所需材料：**

| ID / 项 | 具体阻塞 | 责任方 | 所需材料 / 当前处理 |
|---|---|---|---|
| B01 / WORKER_NODE_BYTES_ABI | G03 RC-02 已选择 Node 22.19.0 / win32 / x64；既有获准材料中未提供对应 executable/分发、来源与 ABI/Node-API。 | Runtime 工件提供方；Owner 负责适用来源接受 | 交付精确 22.19.0 文件与来源/ABI 材料；本轮不搜索全机、不下载或替换。 |
| B02 / ELECTRON_ADMISSION_CLOSURE | 75 个历史参考文件已登记，但官方发行对应/可信交付、内置 Node/V8/ABI、动态 DLL/loader 闭包、有限 children roster 和 S7 目标路径未定。 | Runtime 工件提供方与审阅者；Owner 负责来源/用途选择 | 证明选定分发与有限实际加载布局；73-file 目录计数不能代替闭包。 |
| B03 / DRIVER_COLLECTOR_BOOTSTRAP | 现有 control 只有拒绝策略与说明、evidence 只有模板；缺独立 Driver/collector/Bootstrap、host identity、ledger/flush/stop 实现。 | 实施者与控制工具提供方；Owner 负责独立选择与外层许可 | 交付真实实现、宿主与有限文件清单、独立认证依据；不把 Worker Node 选择扩展为 Driver 批准。 |
| B04 / REQUIRED_WINDOWS_HELPER | G03 RC-05 要求真实 OS 对端认证、受保护凭据交付、独立观察、生命周期/停止控制；实现形式、native 文件及宿主 ABI 未定。 | Windows 控制适配实施者与工件提供方 | 提供 helper/addon/受信宿主适配的实现与加载边；不得用认证 Stub、NONE 或 role 字段替代。 |
| B05 / SOURCE_SET_AND_ENTRY_INTEGRATION | 11 个当前静态可达候选不能覆盖未来完整执行源集；全部 20 文件未跟踪，生产者/构建链未独立确认，启动/认证拒绝锁仍在。 | 项目实施者与审阅者 | 在适用后续授权内明确最终 source set、新文件来源接受及真实入口集成；本轮不改源码、不创建 patch/commit。 |
| B06 / UNIQUE_DEFINITION_AND_HIDDEN_INPUTS | 角色/目标已定案，精确 argv/profile、解析根、环境允许规则、默认配置、PATH/NODE_OPTIONS/NODE_PATH、系统 DLL/字体和有限进程 roster 未形成单一受控 Definition。 | Runtime/控制实施者；Owner 负责运行边界选择 | 明确唯一所有者、所有加载/环境影响及排除规则；本轮不读取环境值、不运行 resolver/探针。 |
| B07 / TASK_CONTROL_SCHEMA_INPUTS | SUM3 常量与独立 oracle 的文本位置已知；最终 task 字节/FieldRef、Driver control 输入、消息/Evidence schema 接受及有限依赖对象未定型。 | 输入/控制实施者与审阅者 | 明确任务、独立比较器及所需 schema 的唯一所有者和实际材料；9 个参考文件按未来真实加载逐项重新选择。 |
| B08 / TARGET_FIXTURE_PERMISSIONS | Windows x64 是组件目标；fresh fixture 身份、OS 基线、角色权限、受保护输入/信任根、ledger/evidence/fallback 根与父目录保护未定。 | Owner 与 fixture/权限提供方 | 选择目标环境并交付预期根/权限材料；开发机历史观察不作为获选目标，本轮不配置环境。 |
| B09 / INDEPENDENT_S7_TRUST | S7 Anchor、公开信任身份/用途、独立交付与 Driver Bootstrap 选择未提供；HEAD 和历史 P0.S-6 不自动成为信任入口。 | Owner 或其指定受信提供方 | 提供独立的公开选择/来源材料；不要求提供私钥，本轮不读取 key、生成 key、配置 Trust 或验签。 |
| B10 / PRIOR_SCOPE_APPROVAL_AND_BOUNDED_PLAN | 缺先于未来 Snapshot 的适用 Scope Authority Approval 与有限 Plan；准备批准、Phase A Review、输入决定和 Invocation=1 的申请均不能替代。 | Owner | 未来通过适用授权提供先行范围批准与有限 Plan 的精确材料；本轮不创建/预留 Plan、slot、ledger 或 Invocation。 |
| B11 / SNAPSHOT_CREATION_AUTHORIZATION | 本轮只有 Snapshot Preparation Only；Final Snapshot 创建/冻结未获批。后置 Freeze Approval/Activation 不得反向塞入候选输入。 | Owner | 实际输入齐备后另行明确精确身份适用的创建/冻结权限；签名/Binding/Activation/执行各自仍需适用授权。 |

这些要求只记录材料与权限缺口；本轮不申请或执行后续实现、下载、配置、冻结、签名、Binding 或运行。无需先解决这些下游缺口才能完成本次有限候选 Slice；也不能因 Slice 完成将其标为 READY。

按照 G02 标准对已有 inventory/provenance 的限定判断如下。没有运行准备验证会话、验签、测试或 Preflight：

| Criterion | 判断 | 依据与限度 |
|---|---|---|
| VC-01 / 必需对象覆盖 | `BLOCKED` | 8 类概念已映射，但 Node/Driver/Helper/环境/先行批准/Plan 材料缺失；列出缺口不等于对象齐全。 |
| VC-02 / 字节与引用可定位 | `BLOCKED` | 本轮 107 个有限已有文件的 bytes/SHA-256/路径已记录，95 项与历史文件清单一致；必需未提供对象没有 hash，未来 Runtime 解析路径未选定。 |
| VC-03 / 批准适用性 | `BLOCKED` | G01 仅适用于四项准备；独立 S7 信任、先行 Scope Approval 与后续创建/冻结权限仍缺，不声称密码学认证。 |
| VC-04 / 无隐藏输入 | `BLOCKED` | 识别 11 条相对 import、6 条资源边、3 条宿主依赖及 1 条参考 loader 边；启动/动态依赖/环境/helper 无法完整界定。 |
| VC-05 / 无循环引用 | `BLOCKED` | 已解析的有限源码边未见回路；完整输入对象及 FieldRef 图尚不存在或未解析，不能报告全局无环 PASS。规范文档背景链接不等于机器输入边。 |

```text
SNAPSHOT_CANDIDATE_PREPARATION_SLICE = COMPLETED_WITH_EXPLICIT_GAPS
CANDIDATE = CREATED
CANDIDATE_STATUS = CANDIDATE_ONLY
FREEZE_STATUS = NOT_FROZEN
EXECUTION_STATUS = NOT_EXECUTED
CANDIDATE_REVIEW = READY_WITH_EXPLICIT_GAPS
EXACT_INPUT_CLOSURE = BLOCKED
SNAPSHOT_CREATION_READINESS = BLOCKED
SNAPSHOT_CREATION_AUTHORIZED = NO
SNAPSHOT_FREEZE_APPROVAL = NOT_PROVIDED
FINAL_SNAPSHOT = NOT_CREATED
BINDING = NOT_CREATED
SIGNATURE = NOT_CREATED
INVOCATION = NOT_CREATED
RUNTIME = NOT_CREATED
PREFLIGHT = NOT_PERFORMED
READY_FOR_EXECUTION = NO
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
CURRENT_USABLE_EXECUTION_BUDGET = 0
```

## 7. 交付检查、Git 范围与未执行事项

交付核对采用普通文件读取、严格 UTF-8/无 BOM 与疑似乱码检查、JSON 文档解析、原始字节 SHA-256、引用文本核对以及只读 Git 状态比较。候选和 inventory 已完成这些文档检查；本 Markdown 保存后同样检查，摘要由最终回复返回。这些操作不加载 Spike 代码，不属于 Runtime 测试、Preflight 或验证会话。

首次 Git porcelain `-uall` 为 **75 项：2 个既有修改、73 个既有未跟踪文件**。两项原有修改是：

- `docs/03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md`
- `docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md`

本轮新增范围仅为第 2 节三个准备文件。107 个被登记既有文件在写入前后的原始字节一致；包括两份原有修改的路线图。该结论限于被登记文件，不声称全 checkout 或全机都已做字节核对。最终 Git status 与本轮新增差异在交付回复返回；未 stage、Commit 或 Push。

未创建或执行：

- 未创建 `snapshot.json`、Final Snapshot、冻结 Source/Runtime Identity、Frozen Input Manifest、draft manifest、`binding.json` 或任何草稿/正式 Binding。
- 未生成/读取 key、私钥、公钥实物，未签名、验签或配置 Trust Root。
- 未创建或预留 Invocation、Plan、request/instance 标签、slot、ledger；未消费预算，未 Retry/Resume/Recovery。
- 未启动 Electron/Desktop、Node Worker、Driver、collector、Helper、IPC、SUM3 或任何 Runtime 组件。
- 未执行 Preflight、测试、验证会话、故障注入、源码语法检查器、resolver、组件探针或加载跟踪。
- 未下载、安装、构建、解包、复制 Runtime、创建 Package、配置 fixture/环境/ACL、修改源码/Runner/既有 Manifest/lockfile/Git 配置/upstream，未应用依赖 Candidate。
- 未生成真实 Runtime Evidence、result、PASS 或运行事实；Phase A Review PASS 仅保留既有阶段状态。
