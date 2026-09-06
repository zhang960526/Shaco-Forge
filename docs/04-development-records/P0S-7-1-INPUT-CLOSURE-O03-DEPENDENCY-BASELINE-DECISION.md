# P0.S-7-1 EAR-C01 O-03 Dependency Baseline Decision

| Field | Value |
|---|---|
| Decision ID | `P0S7-1-INPUT-CLOSURE-O03-DEPENDENCY-BASELINE-DECISION-20260905-01` |
| Document Status | `OWNER_DECISION_RECORD` |
| Record Date | `2026-09-05` |
| Decision Scope | EAR-C01 O-03：依赖来源、锁文件与 Candidate 处置、D/A/I 闭包及 Package 输入身份边界 |
| Decision Basis | 本轮输入决策指令；不授予安装、构建、修复或运行权限 |
| EAR-C01 Authorization | `P0S7-1-PARTIAL-EXECUTION-AUTHORIZATION-20260905-01` / `OWNER_APPROVED_PARTIAL_SCOPE` |
| O-01 / O-02 | `COMPLETED / COMPLETED`：来源角色与 Runtime 输入关系已决定，精确实物未因决定而闭合 |
| Dependency Boundary Decision | `CONFIRMED`：依赖范围规则与 Candidate 不应用处置已确定 |
| Usable S7 Dependency Baseline | `UNKNOWN`：未选定完整、可用且精确认证的 S7 输入集合 |
| Dependency Closure / Input Closure | `BLOCKED / BLOCKED` |
| Candidate Status | `generated_not_applied` |
| P0S7_STATE / P0S7_ALLOWED | `NOT_STARTED / NO` |
| Current Usable Execution Budget / Invocation | `0 / 0` |
| Deliverable | 仅本文；不生成新的 lockfile、D/A/I 工件、Package 或 Snapshot |

本文确定 Shaco Forge Runtime 的依赖输入边界。`CONFIRMED` 仅确认本轮决定的规则或已有记录支持的声明；`UNKNOWN` 表示缺少精确对象或适用材料；`BLOCKED` 表示必需输入未齐备，停止闭合与后续执行。决定边界不等于已有可安装的 S7 baseline，不是 Dependency Closure PASS。

## Read Basis

| Ref | 读取依据 | SHA-256 |
|---|---|---|
| R1 | [P0S-7-1-INPUT-CLOSURE-RECORD.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-RECORD.md) | `0C227154105F65ACC5E7C545753E7F0A03427E21DDEC2FD2C3F8A3568233F223` |
| R2 | [P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-BLOCKER-ANALYSIS.md) | `AA3AA657925F83BBED122B821FF39F765E10C2A4A558DA09D738C60A5B9CDD7A` |
| R3 | [P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O01-SOURCE-IDENTITY-DECISION.md) | `83CDE876F95130F1A20D06061A626B88CECF1CC3281F6429D3808EE2090827BD` |
| R4 | [P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O02-RUNTIME-DEFINITION-DECISION.md) | `741236DAF541AD7BDC12E66DEC992545657223C6CFCCC1A35D650A71FBFA4581` |
| R5 | [P0S-7-1-DETAILED-DESIGN-CONTRACT.md](/D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md)，补充读取 §5 Package Integrity Contract | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |

R1/R2 的 DC/B03 条目提供声明与缺口；R3/R4 确定来源和 Runtime 角色；R5 用于保持 D/A/I 同域关系和准备/运行事实的区别。本轮不重新访问 upstream、远端仓库或 registry，不调用 package manager/resolver。引用摘要标识文档字节，不代替来源认证、Signature 或运行 Evidence。

# 1. Dependency Source Boundary

**决定以 Shaco Forge 项目的精确入口、profile/roster、Runtime 角色与所选平台作为依赖边界的归属基础；upstream 提供参考，实际采用的第三方依赖必须独立明确来源和身份。**

| Source Role | 来源 | 已决定用途 | 当前限制 |
|---|---|---|---|
| `ACTUAL_PROJECT_SOURCE` | `D:\Project\Shaco-Forge` | 项目自有代码、组合配置、入口/插件选择与未来 Package 输入的唯一候选项目根 | 不自动选择当前 HEAD、工作树全集或某个实验 lockfile；精确 manifest/lock/patch/源码集合仍 UNKNOWN |
| `REFERENCE_SOURCE` | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` | 上游能力、架构、依赖声明、工作区/锁文件与版本参考 | 不作为最终 Runtime/Package/Snapshot Source；不从该目录直接运行、复制依赖树或自动导入锁文件；其 Git ownership 身份限制保留 |
| `EXTERNAL_DEPENDENCY` | 经明确选择的第三方分发、native/helper/loader、宿主工具及平台依赖 | 每项记录来源、版本、角色、平台/ABI、字节或受限平台身份、纳入范围与解析约束 | 不下载、不安装、不把 registry 标签、版本字符串、系统 PATH 或缓存当作已认证输入 |

`EXTERNAL_DEPENDENCY` 是**来源角色**，不等于一定不进入 Package。未来选定的 Node、Electron、Harness、addon/helper 等第三方组件可以在获准后成为包内输入 `I_pkg`；PowerShell、系统 DLL/API 等宿主依赖须单列获准外部输入 `I_ext`。具体归属必须逐项确定，不能把所有第三方组件归为宿主依赖以省略包内清单。

依赖范围继承 O-02：Electron Desktop 与 bundled Node Worker 的角色和 ABI 域分别处理；Worker 承载 Harness CLI Host；REQUIRED Host/Client、Carrier/adapter、plugin/native/helper 均需覆盖。工具链/开发依赖与 Runtime production closure 分开记录，但凡实际可加载、可解释执行或由 helper 使用的内容不能因 dev/optional 标签自动省略。

# 2. Lockfile Strategy

**决定保持 Source lockfile、DRRC lockfile 原状；Candidate 保持 `generated_not_applied`，仅作历史修正候选参考，不应用、不提升为有效 S7 baseline。** 不生成或择定一份未经材料支持的新项目 lockfile。

“Source lockfile”在这里沿用 P0.S-6 实验记录中的称呼，专指下表 minimal 实验锁文件；它不等于 `D:\Project\Shaco-Forge` 已确认的 Runtime 根基线。Source、DRRC、Candidate 是不同对象，不能因文件名或部分内容相同互换角色。

| Object | 精确已有文件 | 当前状态与本次决定 | R1 已记录 SHA-256 |
|---|---|---|---|
| Source lockfile | [P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json](/D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json) | `UNCHANGED`；保留旧实验原始字节，不修复，不认定为 S7 可用基线 | `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD` |
| DRRC lockfile | [P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json](/D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json) | `UNCHANGED`；保留旧恢复分析对象，不等于修复已应用或依赖已可用 | `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD` |
| Candidate | [package-lock.corrected.candidate.json](/D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/package-lock.corrected.candidate.json) | `generated_not_applied`；只保留参考，不覆盖/复制为 Source、DRRC 或新的有效 lockfile | `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B` |
| upstream pnpm lock | `D:\Project\Shaco-Forge-Upstream\deepseek-harness\pnpm-lock.yaml` | `REFERENCE`；既有声明图参考，不自动成为实际项目锁文件或实际依赖树 | `506AD1FC7C40F71CE8C6AFE08724FDD55020C1A527D7A7A185C559D39ECFCAF1` |

上表的对象身份及历史内容判断来自 R1；本轮只作静态文档分析与工作区字节范围核对，不重新进行远端 integrity Verification。R1 记录 Source/DRRC 均为 lockfileVersion 3、71 个 packages 条目（含根），根仅声明 Electron 35.7.5 devDependency；这不是完整 Harness/Client/native/helper Runtime closure。

R1 记录 Candidate 对 `env-paths@2.2.1` integrity 的大小写片段差异为旧 `UgALw`、Candidate `UgAlw`。本轮不重做验证、不修改字段，不把 P0.S-6 的 VERIFIED_WITH_CANDIDATE 或文件名中的 corrected 解释为 apply/安装授权。

| Lockfile Decision | 状态 | 处置 |
|---|---|---|
| Candidate 不应用 | `CONFIRMED` | 本轮明确保持 `generated_not_applied`；不是等待自动执行的任务 |
| 当前可用 S7 baseline | `BLOCKED` | 未有完整选定的 manifest/lock/patch/toolchain 与所选 Runtime/profile/平台输入关系；不能以现有锁摘要代替 |
| 未来 baseline 材料 | `UNKNOWN` | 需要精确来源、文件集合、工具/平台条件、允许 patch 及 D/A/I 关系；本轮不创建这些运行输入工件 |
| 未来修复或变更权限 | `NOT_AUTHORIZED` | 如后续拟应用 Candidate、修改锁文件、安装或构建，须另有明确对象、写入范围与适用授权；本决策不包含这些动作 |

失败 node_modules、cache、quarantine 或开发安装树不能作为补齐缺口的基线。保留 Candidate 为参考不代表永久拒绝其技术内容，但本次没有选择它作为有效输入，也不触发后续 apply。

# 3. Dependency Closure Model

依赖模型定义为以下材料关系，**不是本轮执行步骤**：

```text
Declared Graph (D)
        ↓ 所有声明节点/边均有同身份解析依据
Actual Closure (A)
        ↓ 所有所需文件均映射到受控清单
Inventory (I_pkg + I_ext)
```

| Object | 定义与所需范围 | 当前状态 |
|---|---|---|
| Declared Graph（D） | 以所选 Windows/架构/功能条件实例化的 production 节点/边；包括 imports/exports、传递/peer/optional 条件、动态允许表、native/DLL、helper spawn、profile/plugin/Client script；节点/边需有来源、角色和条件依据 | `UNKNOWN`：只有已有声明子集；R1 的 CLI 70 个顶层 dependencies 不是完整 D |
| Actual Closure（A） | 从未来最终获准布局、入口和配置得到的完整可达依赖描述；包含 nodes、edges、file membership、所有准许动态分支和排除理由；是确定的依赖字节描述 | `UNKNOWN`：无完整最终布局及获准解析描述；本轮不运行 resolver |
| Inventory（I） | 全部最终 payload 文件 `I_pkg` 加上独立列出的获准外部依赖 `I_ext`；每项映射到组件、规范路径/角色、长度/hash 或受限 fixture 平台身份与文件清单 | `UNKNOWN`：没有完整包内/宿主输入清单；R1 的参考文件摘要表不是 I |
| D → A → I 整体闭合 | 声明、解析与库存必须在相同 source/version/platform/ABI/role 身份上对应 | `BLOCKED`：完整 D/A/I 及其关系尚未确认 |

图节点和文件集合不能直接混比。继承 R5 的关系：

```text
nodes(D) ⊆ nodes(A)
edges(D) ⊆ edges(A)
files(A) ⊆ I_pkg ∪ I_ext
observed payload files = I_pkg
```

最后一项是未来获准准备阶段对实际 payload 全集的要求，本轮没有生成或枚举 Runtime payload。未来图/闭包原始字节自身也须有 SHA-256；共享节点、边端点与文件身份一致，不能只看包名或数量。

| Closure Rule | 状态 | 决定 |
|---|---|---|
| D 的条件与排除 | `CONFIRMED` | 被禁用平台分支/optional 功能保留适用条件与排除理由；不得删 REQUIRED 项制造包含关系 |
| A 的额外节点 | `CONFIRMED` | 必须有获准入口可达性与传递解析依据；碰巧存在于目录或 Inventory 的文件不自动成为批准依赖 |
| I 中不属于 A 的文件 | `CONFIRMED` | 仍列明资源/许可/禁用组件等用途；未批准加载/执行的文件不能当代码使用 |
| 动态加载 | `CONFIRMED` | 只能采用启动前可界定的有限 allowlist 并纳入 A；无法界定则 DEPENDENCY_BLOCKED，不能在运行中扩展冻结 A |
| 平台 / 功能不启用 | `CONFIRMED` | Windows 下 Linux-only 机制、JSONL 默认下未启用 SQLite query 等须按既有合同给出 disposition；不启用功能不自动删除静态依赖 |

**Actual Closure 与运行事实严格区分：** A 是未来独立获准准备工作形成、审查并定型的静态字节依赖描述，可以成为 FROZEN_INPUT；其生成时间、工具进程、安装/解析日志、成功状态以及运行 load trace 属于 RUNTIME_FACT。日志不是 A，运行采样未触发某依赖也不证明该依赖不存在。

本轮不安装、不构建、不解析、不 require/import、不执行 helper 或独立验证工具来补齐 D/A/I；不把本文分析表输出为 declaredGraphRef、actualClosureRef 或 Inventory 工件。

# 4. Native / ABI Dependency

以下 CONFIRMED 列仅确认 R1 已记录的声明/角色及 O-02 的域划分要求。所列版本是历史声明或锁定参考，不是本次新选定、认证或已安装的 S7 实物。

| Dependency / Category | CONFIRMED | UNKNOWN |
|---|---|---|
| node-pty | R1 DC-09 记录声明 `1.2.0-beta.15`、静态 import 与已有 patch 引用；不能因“不使用 PTY 工具”省略静态依赖 | S7 最终版本/发布字节、patch 是否纳入未来基线、native/helper 文件、精确 Node/Electron ABI 域及匹配材料；本轮未应用 patch/postinstall |
| native addon / FFI（koffi 等） | R1 DC-08 记录 koffi `^3.1.0` 声明、锁定参考 `3.1.1`，涉及 Win32/ACL/FS/JSONL/picker | 适用平台分支、精确 `.node`/DLL/FFI 文件身份、加载域/路径与实际兼容性 |
| native addon（node-addon-require-builtin） | R1 DC-10 记录声明/peer `^0.1.4`、锁定 `0.1.4` 与 win32-x64-msvc 分支 | 实际采用工件、平台/Node-major/Electron 对应关系、文件字节与完整传递 closure |
| helper | R1 DC-12 记录 Windows ACL runner 的 `lib/runner.js` 与适用 picker worker 的 `lib/worker.cjs` 公开入口；helper 需真实磁盘入口及明确 execPath 角色 | 最终存在的文件、所属 Runtime、依赖、child/权限边界和输入身份；export 声明不能证明构建输出存在 |
| loader | R1 DC-10、O-02 要求覆盖 Cordis plugin loader、native custom loader 与 peer/传递依赖；锁有 native custom loader `0.1.4` 参考 | 精确 loader 版本/文件、Node/Electron 内部 ABI 适配、有限搜索/动态加载范围，不能依靠未知 PATH/DLL fallback |
| external binary（随包 sidecar） | R1 DC-11 记录 `@vscode/ripgrep ^1.18.0`、锁定参考 `1.18.0`；rg 的二进制需明确定位，未来归属应列入 I_pkg | 精确 Windows rg 工件与字节、entry role、来源、child/路径约束；不从系统 PATH 取替代品 |
| external binary / platform（宿主） | R1 DC-15 与 O-02 区分 PowerShell、OS DLL/API 等外部输入；宿主依赖须列入 I_ext | 适用 fixture、精确 PowerShell/系统文件身份、受限根/解析规则与平台对应材料；不把任意 DLL 统称为系统依赖 |

Node Worker 与 Electron Desktop 的 native/loader 域分别记录；Node `22.19.0`、Electron `35.7.5` 仍是已有候选，精确 ABI/N-API 和工件未知。helper 或 rg 若是外部可执行，记录其真实平台/工具要求；不强行给所有二进制套同一个 Node ABI。

任何新 native/helper/loader/external binary 都必须能关联所选入口、D/A/I、组件身份与允许角色。静态输入完整也不自动证明运行时搜索路径受到控制；控制材料与运行证明仍属于后续独立范围。本次没有执行 ABI 探针、rebuild、native load、插件加载或兼容测试。

# 5. Package Input Boundary

本节规定未来类型归属，不冻结本文、Candidate 或任何依赖对象。`FROZEN_INPUT` 只适用于后续在明确授权内形成并审查定型的精确输入；未知值、候选版本、旧日志或引用文件名不自动满足这一条件。

| Dependency Input / Record | Domain | 归属与限制 | 当前状态 |
|---|---|---|---|
| 正式选定的项目 manifest/lock/patch、构建源码/工具与来源关系 | `FROZEN_INPUT` | 未来作为获准 build provenance/Package 输入；记录精确字节与用途，不纳入未应用 Candidate 的修正结果 | `UNKNOWN`：S7 具体集合未选定 |
| 所选 Node/Electron/Harness、plugin/native/helper/loader/随包 binary 的精确字节 | `FROZEN_INPUT` | 由 Package descriptor / payload inventory 拥有版本、平台、ABI 声明、路径、长度/hash 和角色；Definition 通过 Ref 选择 | `UNKNOWN`：实物与完整 inventory 未确认 |
| D、A、I_pkg 与获准 I_ext 约束 | `FROZEN_INPUT` | 获准静态 graph/closure、包内全集和受限外部 fixture/平台身份；精确文件与图字节受内容身份保护 | `UNKNOWN`：完整工件缺失 |
| profile/roster、有限动态 allowlist、解析/环境/权限策略 | `FROZEN_INPUT` | 按 O-02 的单一字段权威划分；Runtime Definition 拥有组合/策略，组件身份仍由 Package 记录 | `UNKNOWN`：精确组合与策略未闭合 |
| upstream 声明/锁文件、历史 Source/DRRC 锁、Candidate、旧实验结果 | `REFERENCE` | 当前仅作分析出处；Candidate 保持 generated_not_applied，不把参考文件升格为有效 S7 baseline | `CONFIRMED`：本轮参考用途与不应用处置 |
| declaredGraphRef、actualClosureRef、payloadInventoryRef、externalInventoryRef / FieldRef | `REFERENCE` | 未来有类型引用指向已获准冻结对象，不复制第二套权威字段、不允许 override 或环；本文未构造引用工件 | `UNKNOWN`：未来精确引用未产生 |
| install/build/resolve/unpack 日志、工具 PID/start time、输出状态、实际路径/ABI 探针/加载轨迹 | `RUNTIME_FACT` | 仅进入 Evidence/ledger/lifecycle，不能成为 A 或通过引用进入 signed Snapshot 输入 | 本轮未执行、未采集 |
| 运行时观测文件/hash、实际 SID/endpoint、generation、预算用量、失败/恢复结果 | `RUNTIME_FACT` | expected 身份与 observed 事实分开；事实只关联输入身份，不能回写或扩展 baseline/closure | 本轮未执行、未采集 |

第三方来源的获准工件未来可以是 FROZEN_INPUT；“来自外部”不等于永远只能 REFERENCE。反过来，旧锁文件或运行日志即使已计算 hash，也不会自动变成当前冻结输入。Candidate 的本次角色已明确为参考，本文没有批准其应用或冻结。

实际 PID、start time、generation、READY、consumed budget 和运行结果不得直接、改名或经间接引用进入冻结输入。运行证据即使后续签名归档仍为 RUNTIME_FACT。Actual Closure 的静态解析描述可作为未来输入，其生成过程日志与运行观察必须分开存储。

实际验收时包内全集须与 I_pkg 一致，外部项须满足获准 I_ext；但本文不开展该验收，不创建 Snapshot/Binding/Signature，也不授予 Install/Build/Package/Runtime 的权限。

# 6. Boundary

| Boundary / Action | 当前状态 | 本轮决定 |
|---|---|---|
| 文档 | `OWNER_DECISION_RECORD` | 记录 O-03 输入依赖边界和 Candidate 不应用决定 |
| O-01 / O-02 | `COMPLETED / COMPLETED` | 不重开来源角色或 Runtime 策略关系选择 |
| EAR-C01 | `OWNER_APPROVED_PARTIAL_SCOPE` | 仍仅输入准备与分析 |
| P0S7_STATE | `NOT_STARTED` | 不启动 P0.S-7 |
| P0S7_ALLOWED | `NO` | 阶段门禁不变 |
| Execution Budget / Invocation | `0 / 0` | 不申请、预留或消耗 Invocation |
| Retry / Resume / Recovery | `0 / 0 / 0` | 不重试或恢复 |
| Install（含 npm install / pnpm install） | `NOT_AUTHORIZED` | 不安装、不下载、不执行 postinstall/补齐或自动 heal |
| Build / resolve / unpack | `NOT_AUTHORIZED` | 不构建、不运行 resolver、不解包、不执行被测代码或验证工具 |
| Package / Package Identity / Package Feasibility | `NOT_AUTHORIZED` | 不创建、不验收 Package |
| Runtime / 冻结 Runtime Definition Identity | `NOT_AUTHORIZED` | 不实现、不创建、不启动或冻结 |
| Snapshot / Binding / Signature / Evidence Records | `NOT_AUTHORIZED` | 不创建、签名或采集运行 Evidence，不读取私钥 |
| Invocation / Launch / Preflight | `NOT_AUTHORIZED` | 不申请或执行，不运行 Driver/collector |
| lockfile / Candidate apply / 代码 / Runner / Manifest 修改 | `NOT_AUTHORIZED` | 保留原文件，不应用 Candidate，不写新依赖工件 |
| Git 配置 / safe.directory / upstream 修改 | `NOT_AUTHORIZED` | 不修复或绕过 Git，不变更参考来源 |
| EAR-C02～EAR-C05、Production Runtime、Deployment、Full Agent Platform、P1 | `NOT_AUTHORIZED` | 不扩大 Case 或阶段范围 |
| 测试 / Verification / Commit / Push | `NOT_AUTHORIZED` | 本轮不执行 |

## Closure Disposition

| Gap / Decision | 当前状态 | 本轮后的含义 |
|---|---|---|
| 依赖来源角色与锁文件处置 | `CONFIRMED` | 项目为实际来源、upstream 为参考、第三方逐项明确；Source/DRRC 不变，Candidate 不应用 |
| B03-D1 可用 S7 baseline | `BLOCKED` | 处置规则已决定，但精确、完整且适用的 S7 baseline 未形成；本轮不会借此执行修复 |
| B03-D2 完整 D | `UNKNOWN` | 只有声明子集，无完整所选入口/平台/profile 图 |
| B03-D3 完整 A | `UNKNOWN` | 无最终获准布局及完整静态可达描述 |
| B03-D4 完整 I | `UNKNOWN` | 无全部 payload/external 输入和精确身份关系 |
| Dependency Closure / Input Closure | `BLOCKED` | 未闭合，不写 INPUT_CLOSED、Dependency PASS 或 Package/Runtime PASS |

来源身份、baseline、native/ABI、D/A/I 映射或边界无法确认时保持 FAIL-CLOSED，停止相应接受与后续动作。运行中发现新依赖不允许原地补包、修改 A/I 或应用 Candidate；任何被禁止的动作都不能改称“分析”执行。

本决策不代替 O-04 环境、O-05 Trust/Control、O-06 未来权限决定；Authority、Snapshot、Binding、Preflight、Controlled Invocation、Evidence First、Fail Closed 等继承要求保持有效。P0.S-6 的 CLOSED / VERIFIED_WITH_CANDIDATE 不迁移为 S7 依赖或执行通过。

```text
DOCUMENT_STATUS = OWNER_DECISION_RECORD
DECISION_ID = P0S7-1-INPUT-CLOSURE-O03-DEPENDENCY-BASELINE-DECISION-20260905-01
O01_STATUS = COMPLETED
O02_STATUS = COMPLETED
SHACO_FORGE_SOURCE_ROLE = ACTUAL_PROJECT_SOURCE
UPSTREAM_SOURCE_ROLE = REFERENCE_SOURCE
EXTERNAL_DEPENDENCIES_REQUIRE_EXPLICIT_IDENTITY = YES
SOURCE_LOCKFILE_STATE = UNCHANGED
DRRC_LOCKFILE_STATE = UNCHANGED
CANDIDATE_STATUS = generated_not_applied
CANDIDATE_CURRENT_ROLE = REFERENCE
CANDIDATE_APPLIED = NO
CANDIDATE_APPLY_AUTHORIZED = NO
LOCKFILE_MODIFICATION_AUTHORIZED = NO
EXACT_S7_DEPENDENCY_BASELINE_CONFIRMED = NO
DECLARED_GRAPH_COMPLETE = NO
ACTUAL_CLOSURE_COMPLETE = NO
INVENTORY_COMPLETE = NO
DEPENDENCY_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
RUNTIME_FACTS_ALLOWED_IN_FROZEN_INPUT = NO
INSTALL_AUTHORIZED = NO
BUILD_AUTHORIZED = NO
PACKAGE_AUTHORIZED = NO
RUNTIME_AUTHORIZED = NO
SNAPSHOT_AUTHORIZED = NO
BINDING_AUTHORIZED = NO
INVOCATION_AUTHORIZED = NO
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
| 修改文件 | 仅新增 `docs/04-development-records/P0S-7-1-INPUT-CLOSURE-O03-DEPENDENCY-BASELINE-DECISION.md`；不改写原记录和依赖文件 |
| 内容 | 依赖来源角色、Source/DRRC/Candidate 处置、D/A/I 模型、native/ABI 缺口、三类输入身份与零预算边界 |
| 文档检查方式 | 静态核对六个必需章节、Source/DRRC/Candidate 身份引用、D/A/I 与分类字段、依据摘要、UTF-8 无 BOM/中文无乱码和工作区文件前后字节；本文 SHA-256 在最终回复单独返回 |
| 测试方式 | 按任务边界未运行测试、项目 Verification 或依赖/ABI/Package/Runtime 验证工具；静态文档检查不是依赖解析或运行验证 |
| 未执行事项 | 未执行 npm install/pnpm install 或其他安装/下载/build/resolve/解包/postinstall；未修改 lockfile、应用 Candidate、采纳失败安装树；未修改代码/Runner/Manifest/Binding/Git 配置/upstream；未创建 Package/Runtime/Definition Identity/Package Identity/Snapshot/Binding/D/A/I/Evidence 工件；未加载 native/helper/loader/plugin、探测 ABI、握手或测试；未配置 Trust/Control、读取私钥或 Signature；未申请/预留/执行 Invocation、Launch、Preflight、Retry、Resume、Recovery；未 Verification、Commit、Push |

本文完成依赖输入边界与处置记录，不制造缺失依赖或宣称已有可运行基线。

