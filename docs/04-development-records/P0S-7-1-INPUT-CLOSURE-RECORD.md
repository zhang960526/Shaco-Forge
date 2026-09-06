# P0.S-7-1 EAR-C01 Input Closure Record

| Field | Value |
|---|---|
| Input Closure Record ID | `P0S7-1-INPUT-CLOSURE-20260905-01` |
| Document Status | `INPUT_CLOSURE_ANALYSIS_ONLY` |
| Record Date | `2026-09-05` |
| Executor Role | Shaco Forge P0.S-7-1 EAR-C01 Input Closure Executor |
| Authorization | `P0S7-1-PARTIAL-EXECUTION-AUTHORIZATION-20260905-01` |
| Approved Scope | `EAR-C01 Input Closure ONLY` |
| Analysis Result | `BLOCKED`：必需输入仍有未决项，不能确认整体闭合 |
| Current Usable Execution Budget / Invocation | `0 / 0` |
| Current Deliverable | 仅本输入整理、来源/字节身份与缺口分析文档 |

已在部分批准范围内完成本次可进行的只读输入整理与分析。本文确认的是既有文件、其中的声明、已有治理要求和可复算的字节身份；不将候选、历史成功记录、依赖声明或单文件 hash 等同于 P0.S-7 可用 Package、Runtime 兼容性、独立信任或执行就绪。必需项缺失时停止相应确认，记录缺口，不通过下载、安装、构建、解包、resolver、验证工具或 Runtime 执行补证。

## Status Semantics and Summary

| 状态 | 本文含义 |
|---|---|
| `CONFIRMED` | 指定事实由本次读取的材料或原始字节支持；必须同时看该项的事实类型与适用范围。确认文档有某项候选不表示候选实物已获准 |
| `UNKNOWN` | 需要的值、材料或适用性尚无法从已有输入确定；不预填版本、hash、ABI、路径、批准或运行结果 |
| `BLOCKED` | 必需输入无法确认或确认需要越过当前权限，相关闭合/后续动作已停止；不代表必须停止其他独立的文档分析 |
| `NOT_APPLICABLE` | 对本次输入分析或当前目标不适用，逐项给出理由；不能据此省略 REQUIRED 依赖或解除后续门禁 |

| Input Area | 状态 | 结论 |
|---|---|---|
| Package Source | `BLOCKED` | 既有来源声明、版本、部分文件身份已确认；上游当前 Git 身份读取受阻，目标发行/构建来源链与 Package 字节未闭合 |
| Runtime Definition Input | `BLOCKED` | strategy/版本候选、入口和历史 profile/roster/protocol 材料明确；实际组合、ABI 和 S7 精确 profile/roster/protocol 未确定 |
| Dependency Closure | `BLOCKED` | 可分析声明与已有锁文件；可用 S7 依赖基线和最终布局的完整 D/A/I 缺失 |
| Environment Constraints | `BLOCKED` | 已确认目标和权限要求；完整 fixture/host inventory/工具字节与实际约束能力未确认 |
| Trust / Control Inputs | `BLOCKED` | 缺 P0.S-7 适用的独立 Anchor/key/Driver/Approval/expected Reference 与控制输入 |
| Implementation Boundary | `CONFIRMED` | 仅输入准备、只读分析与本文；Runtime/Package/Execution 及其他 Case 未授权，预算为 0 |

`INPUT_CLOSURE_ANALYSIS_ONLY` 是文档状态；`BLOCKED` 是必需输入闭合结论。本文没有作出输入已全部闭合的声明，也没有新的 Package/Runtime/Verification PASS。

## Read-only Input References

下表每行 `CONFIRMED` 仅确认文件可严格 UTF-8 解码、存在这些原始 bytes/SHA-256。它不是 Frozen Input Manifest、Package Identity、Runtime Definition Identity、Runtime Snapshot 或 Evidence index。G 为治理依据，L 为既有实验材料，U 为本地上游源码目录中的静态输入。U 文件的原始字节可读，不代表已确认其当前 checkout 与固定源提交完全一致，限制见 PS-04。

| Ref | 状态 | 已读取文件 | Bytes | SHA-256 |
|---|---|---|---:|---|
| G01 | `CONFIRMED` | [04-development-records/P0S-7-1-PARTIAL-EXECUTION-AUTHORIZATION-DECISION.md](D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-PARTIAL-EXECUTION-AUTHORIZATION-DECISION.md) | 20669 | `C7C6435165F527154017841FB1CA29270A88775DD781743F682614D13CD11775` |
| G02 | `CONFIRMED` | [04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md](D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-DETAILED-DESIGN-CONTRACT.md) | 86292 | `1C91E6DEFF9BD601E771E2DE5C865BBF777EF9484EA04037FC326B29B21AFDE1` |
| G03 | `CONFIRMED` | [04-development-records/P0S-7-1-EXECUTION-PLAN.md](D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-EXECUTION-PLAN.md) | 51549 | `69F93DDE4374071E0320DE371F080CD0606431DC74C587258260D311D69468E2` |
| G04 | `CONFIRMED` | [06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md](D:/Project/Shaco-Forge/docs/06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md) | 57617 | `C949B32C407F41578D60FEF3D1ABF4A7CFD3B3D75ABC7EA0BC51D8E5116A950C` |
| G05 | `CONFIRMED` | [04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md](D:/Project/Shaco-Forge/docs/04-development-records/P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md) | 11824 | `71E974AB17068FA0920A58B4E1D1BF2458D78633537E25C16666AD9562EC3349` |
| G06 | `CONFIRMED` | [04-development-records/P0S-7-1-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-DECISION.md](D:/Project/Shaco-Forge/docs/04-development-records/P0S-7-1-IMPLEMENTATION-AUTHORIZATION-OWNER-APPROVAL-DECISION.md) | 14990 | `0DAD742EABE44B6B9F0B69F0189531FD353A0C039DA7A8CC2F16A0B75CD74349` |
| L01 | `CONFIRMED` | [P0S-6-MINIMAL-CLIENT-MODULES/package.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package.json) | 325 | `4486D5BAB3BF14FF40626F7C607470CD888CA6C35105112C3F6D3D658DDB5B65` |
| L02 | `CONFIRMED` | [P0S-6-DEPENDENCY-READINESS-RECOVERY/package.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package.json) | 325 | `4486D5BAB3BF14FF40626F7C607470CD888CA6C35105112C3F6D3D658DDB5B65` |
| L03 | `CONFIRMED` | [P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json) | 30829 | `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD` |
| L04 | `CONFIRMED` | [P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json) | 30829 | `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD` |
| L05 | `CONFIRMED` | [P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/package-lock.corrected.candidate.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/package-lock.corrected.candidate.json) | 30829 | `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B` |
| L06 | `CONFIRMED` | [P0S-6-MINIMAL-CLIENT-MODULES/contract-roster.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/contract-roster.json) | 2881 | `8B1FF84F897C20268F46B927E26C99E94044D3E5CED1912D1FB88D080BDB4F84` |
| L07 | `CONFIRMED` | [P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT/profile/package.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT/profile/package.json) | 442 | `CA09F78F3D94EF3BA8B0215E80CDF2BB1BE0138C6DB30BBED10E78DA24F18FD4` |
| L08 | `CONFIRMED` | [P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT/bundle/package.json](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT/bundle/package.json) | 386 | `843026D611CE21CA15E6B379FCF0263E23FB0492AB60D2FC25E0FE97E8052918` |
| L09 | `CONFIRMED` | [P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT/lib/framed-pipe-client.mjs](D:/Project/Shaco-Forge/docs/04-development-records/experiments/P0S-5-DESKTOP-INDEPENDENCE-AND-RECONNECT/lib/framed-pipe-client.mjs) | 8083 | `BDF8BFAAC5048DC78A63939A235381CF91C93EF5D70E9F8F07AE3098732D05EF` |
| U01 | `CONFIRMED` | [package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/package.json) | 11435 | `552FE07638754047FB3DFD29D61DDE835C2A5A618DA8B766A711BC15EAA334E2` |
| U02 | `CONFIRMED` | [apps/cli/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/apps/cli/package.json) | 6535 | `8B9DD9481018C948D6C96A837CA16B72764C3D6CE682C1B7199A00BA2AC10387` |
| U03 | `CONFIRMED` | [pnpm-workspace.yaml](D:/Project/Shaco-Forge-Upstream/deepseek-harness/pnpm-workspace.yaml) | 3705 | `A3111BA46958B1C0E053DEF76733F4C2F81B7B45E7C6E3B5101CE153BF4A9F80` |
| U04 | `CONFIRMED` | [pnpm-lock.yaml](D:/Project/Shaco-Forge-Upstream/deepseek-harness/pnpm-lock.yaml) | 765312 | `506AD1FC7C40F71CE8C6AFE08724FDD55020C1A527D7A7A185C559D39ECFCAF1` |
| U05 | `CONFIRMED` | [patches/node-pty@1.2.0-beta.15.patch](D:/Project/Shaco-Forge-Upstream/deepseek-harness/patches/node-pty@1.2.0-beta.15.patch) | 1324 | `B40AE545608897914BD25FB009C97EEAC478C34E8A910298DDCB01B746534BB0` |
| U06 | `CONFIRMED` | [packages/subprocess/subprocess-local/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/subprocess/subprocess-local/package.json) | 1549 | `D8238B547DB87EC564A3A027B0654DC4DF9FA997F6FDC304500CB2C7216EE1E5` |
| U07 | `CONFIRMED` | [packages/subprocess/win32-process/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/subprocess/win32-process/package.json) | 1174 | `FF0079AD03AB61ABF98ABC45875C48841796044207C4FCD7797BD03090E815D1` |
| U08 | `CONFIRMED` | [packages/sandbox/sandbox-windows-acl/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/sandbox/sandbox-windows-acl/package.json) | 1530 | `66D1BB01F52E4876C0C164BED54A67142F443E24D35CD5DC8D8A8F1060160850` |
| U09 | `CONFIRMED` | [packages/fs/fs-local/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/fs/fs-local/package.json) | 1312 | `9A4AEB4BA71BD0C4F957F23E56C37C2214665DA2E0B8273FC1953EBCF07CCA5A` |
| U10 | `CONFIRMED` | [packages/fs/tool-fs-search/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/fs/tool-fs-search/package.json) | 2109 | `92F3E335C6DC275C340C47618D741BD9D47DDDE1703D29C6449D8FF1725E3362` |
| U11 | `CONFIRMED` | [packages/session/session-persistence-jsonl/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/session/session-persistence-jsonl/package.json) | 1422 | `8BB2CA6D8D9222459A404EA8508CC57D25AC541FA0FC53D3882A79FC36BF31B1` |
| U12 | `CONFIRMED` | [packages/shell/pwsh-local/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/shell/pwsh-local/package.json) | 1599 | `988DC344A29A94CD9FD868AA4E593032AD5F4689531B97CD09BC5ABDE0A41B21` |
| U13 | `CONFIRMED` | [packages/client/connection/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/client/connection/package.json) | 2418 | `5F66B5BEFDFFB55434BDAA618D7F42C88CA1B2EEA1628C30232AA0D3BFF01065` |
| U14 | `CONFIRMED` | [packages/client/modules/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/client/modules/package.json) | 1807 | `BC023AADF4EF1DF6E65C9EE0C1D6E5287C2D32DD9541174E387A352A0AA92101` |
| U15 | `CONFIRMED` | [packages/preset/agent-presets/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/preset/agent-presets/package.json) | 3149 | `F65322F81CE77D7C4F8451ABDF970B55FC5E5B70A1FE1889F659EDBC5E201975` |
| U16 | `CONFIRMED` | [vendor/loader/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/vendor/loader/package.json) | 1022 | `40CF4A563AFABAE89B14199E4C985CE4C07DF9202962C5F4B714A9135E126C29` |
| U17 | `CONFIRMED` | [packages/host/directory-picker-native/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/host/directory-picker-native/package.json) | 1462 | `CE61E88EA9EC71E62702D8BF7D0DCF7BAAABF519C7DD3505311639924E54F09E` |
| U18 | `CONFIRMED` | [packages/bundle/base/package.json](D:/Project/Shaco-Forge-Upstream/deepseek-harness/packages/bundle/base/package.json) | 5930 | `5406E437C92D6F7432014BA4C8E34D08E51A6DD7AF6113BA88DBF3EDA0B57117` |

除上述主要引用外，本次只读检索了相关 README/静态声明以定位材料。没有加载或执行这些源码、脚本、配置、插件或示例命令，没有读取私钥或配置 Git/Runtime 信任。本机终端与开发环境不被当成获准 fresh Windows fixture。

# 1. Package Source

| ID / 项目 | 状态 | 已确认内容或缺口 | 依据与适用范围 |
|---|---|---|---|
| PS-01 已知来源 | `CONFIRMED` | G04 §A 记录上游仓库 `https://github.com/deepseek-ai/deepseek-harness.git`；U02 的 repository.url/directory 声明同一仓库及 `apps/cli` | 仅既有文档/源码声明；本次未访问远端、未确认远端当前状态 |
| PS-02 固定历史版本 | `CONFIRMED` | G04 记录 commit `cd5ef8148158c3a752a658978873241fdf8e2bbc`、release `dsh-v0.1.2-alpha.1`、package `@deepseek-ai/dsh@0.1.2-alpha.1`；G02 沿用该 Harness pin | 这是治理记录的已知来源身份，不是本次新取得的远端 release/commit 认证 |
| PS-03 本地静态来源 | `CONFIRMED` | `D:/Project/Shaco-Forge-Upstream/deepseek-harness` 存在；U01/U02 均声明版本 `0.1.2-alpha.1`，U02 name 为 `@deepseek-ai/dsh`；原始字节身份见引用表 | 只确认本地文件与内容，不把版本标签当作完整源码或分发包身份 |
| PS-04 当前 checkout 身份与干净状态 | `BLOCKED` | 对该上游目录的 `git rev-parse HEAD` 与 `git status --short --untracked-files=no` 均返回 `detected dubious ownership`；未得到当前 HEAD/clean 结论 | Git 报告目录所有者与当前沙箱用户不同。已停止此项确认；未添加 safe.directory、未更改所有权、未提权或绕过检查 |
| PS-05 已有锁定字节身份 | `CONFIRMED` | U04 为 765312 bytes，SHA-256 `506AD1FC7C40F71CE8C6AFE08724FDD55020C1A527D7A7A185C559D39ECFCAF1`，与 G04 §A 记录一致 | 仅此锁文件身份一致；不能据此推定整个 checkout、source tree、发布 archive 或构建输出已认证 |
| PS-06 Package 构建来源链 | `UNKNOWN` | 尚无本次选定的 source tree/源码完整集、构建输入/工具精确身份、允许 patch 集、build provenance 与最终输出的闭合关系 | U01 有 `pnpm@11.7.0` 和构建脚本声明；没有执行或采用它们作为获准构建链 |
| PS-07 目标 Package 身份 | `UNKNOWN` | G02 的单一 ZIP、非 asar 布局是候选；未提供获准 S7 archive、payload inventory、Package descriptor、长度/hash/完整来源链 | 不能用实验 package.json 或未来文件名填充 Package Identity |
| PS-08 Node/Electron 来源实物 | `UNKNOWN` | Node `22.19.0` / Electron `35.7.5` 为设计候选；精确分发来源认证、archive/node.exe/electron.exe 字节与本次使用批准未确定 | G02 §2.4；L01/L02 仅支持 Electron npm 声明，不能证明官方分发包可用 |
| PS-09 源输入闭合出口 | `BLOCKED` | PS-04/06/07/08 未解决，不将现有源码目录或历史缓存认定为可立即构建/运行的 S7 输入 | 需要后续提供可独立确认的精确源身份、发行/构建输入与处置；本次不下载或构建 |

# 2. Runtime Definition Input

候选与已确认事实分别记录。本文只分析 Definition 所需输入，不创建或冻结 Runtime Definition Identity；所有 U 文件结论均受 PS-04 的 checkout 身份限制。

| ID / 输入字段 | 状态 | 类型与具体记录 | 尚未覆盖的边界 |
|---|---|---|---|
| RD-01 Runtime strategy 候选 | `CONFIRMED` | **候选声明**：G02 首选 bundled Node sidecar + Windows x64；Desktop 与运行 DeepSeek Harness CLI Host 的 Worker 是两个核心长运行进程，不增加常驻 Worker daemon | 确认设计选择候选存在，不确认该策略实物或可行性；不能自动切换 Electron Worker |
| RD-02 Runtime strategy 实际选择 | `UNKNOWN` | 本次适用的精确 runtime/fixture/组件组合及使用批准未确定 | Input Closure 批准不等于运行许可；不以候选直接作冻结输入 |
| RD-03 Component version 候选 | `CONFIRMED` | **设计候选**：Node `22.19.0`、Electron `35.7.5`；**静态声明**：已读 dsh 组件 package.json 为 `0.1.2-alpha.1`，U16 `@deepseek-ai/cordis-plugin-loader` 为 `1.0.2`；L01/L02 devDependency electron 精确为 `35.7.5` | 不是整包版本/二进制身份或兼容性确认；native 的声明/锁定版本另见第 3 节 |
| RD-04 ABI 要求 | `CONFIRMED` | **约束**：Node 与 Electron 所属 native/loader 域分别记录，koffi、node-pty、node-addon-require-builtin 和 helpers 均需匹配选定平台；不能把 Electron ABI 等同 Node ABI | G02 §2.4/5、G04 §O；仅确认要求 |
| RD-05 精确 ABI / N-API | `UNKNOWN` | 未取得获准 node.exe/electron.exe 的精确 ABI/N-API、各 `.node`/DLL/loader 的构建目标、完整字节与匹配依据 | 不运行 Node/Electron、加载 addon、执行 rebuild 或探针推断 |
| RD-06 Entry role | `CONFIRMED` | **源码声明/合同**：U02 `bin.dsh = lib/bin.js`；G02/G04 要求 bundled Node 通过公开 CLI/profile 启动 Worker。U08 `./runner` 指向 `lib/runner.js`，U17 `./worker` 指向 `lib/worker.cjs` | 仅声明的公开入口；不确认这些构建输出存在或最终磁盘入口身份；禁止内部 boot、src/tsx fallback |
| RD-07 Profile 历史材料 | `CONFIRMED` | **既有实验输入**：L07 为 `@shaco-forge/not-production-p0s5-host-profile@0.0.0-not-production`，bundles 包含 `@deepseek-ai/dsh-base` 与 L08 的 Shaco bundle，`patchReload = startup`；L08 声明 `cordis.patch.yml` 及两个 carrier/compatibility exports | 仅历史 profile/bundle 声明，不承接其执行权限或将其当作 S7 profile |
| RD-08 S7 Profile / argv / policy | `UNKNOWN` | 最终 profile/composition/argv 模板、所选 patch 文件及完整输入 hash、根映射/策略精确版本未闭合 | 不创建配置或运行 CLI dump-config 来补齐 |
| RD-09 Roster 历史材料 | `CONFIRMED` | **既有合同清单**：L06 有 23 项 requiredRoster、4 项 supportClosure、4 项 omissions；省略项涉及 cordis-host-runner、cordis-client-runner、ui-cordis、tool-cordis | 仅 P0.S-6 清单事实；不是 S7 inclusion/omission 批准，也不是 REQUIRED Client Runtime 成功证据 |
| RD-10 S7 Roster / H-05 / H-20 | `BLOCKED` | 未有本次所选 Host/Client/插件/adapter/native/helper 全量 roster、各版本/文件/角色/disposition 与闭包证据。G01/G02 保留 H-05/H-20 `NOT_PROVEN` | 不能静默沿用 L06 的 omissions、删 REQUIRED 项或在失败后缩为 Worker-only |
| RD-11 Protocol 已有约束 | `CONFIRMED` | **合同/历史声明**：G04 要求 Connection/Remote/Gateway 的 unary/stream/cancel/generation/真实 `$events` 语义；Named Pipe 是 Shaco 自定义 carrier，认证在 Gateway 写路径前。L09 文本有 `PROTOCOL_VERSION = 1` | 版本 1 仅属于旧实验 client，未采用为 S7 protocol；上游 `rpc.open` 可选，不等于可省略 streaming contract |
| RD-12 S7 Protocol 精确身份 | `UNKNOWN` | 未提供本次 handshake/protocol version、两端兼容表、endpoint/SID/generation 约束的精确工件及批准 | 不握手、不连接、不执行 identity/launch 验证 |
| RD-13 Definition 输入闭合出口 | `BLOCKED` | RD-02/05/08/10/12 未闭合 | 保留字段分析；不得产出冻结 Definition、READY 或 Runtime Identity PASS |

# 3. Dependency Closure

## 3.1 Declared Dependencies and Lockfile References

本次仅用严格文本读取、JSON 字段读取和 YAML 文本检索分析声明；未运行 package manager、resolver、install、require/import、closure generator 或任何验证工具。声明图不等于最终布局的 Actual Closure；本节不生成可供 Snapshot 使用的 D/A/I 工件。

| ID / 项目 | 状态 | 具体分析 | 依据与限制 |
|---|---|---|---|
| DC-01 上游工作区声明 | `CONFIRMED` | U01 声明 `packageManager = pnpm@11.7.0`、Node engines 为 `^22.19.0` 或 `>=24.0.0`；U03 列出 vendor、packages、apps、native、website、python/sdk-runtime 工作区与 link/override/allowBuilds 规则 | 构建机/开发声明，不要求运行机装 pnpm；不执行 root build/postinstall/source dsh 脚本 |
| DC-02 CLI declared dependencies | `CONFIRMED` | U02 的 `dependencies` 有 70 项；除 commander/js-yaml/node-addon-require-builtin 等范围外，多数使用 `workspace:^`，涉及 base、app-boot、pwsh、fs-search、Cordis/Client 等；devDependencies 与运行声明分开 | 70 仅为此文件顶层 dependencies 键数量，不是完整运行闭包；workspace 引用不自动证明发布包解析与实际文件齐全 |
| DC-03 上游锁文件 | `CONFIRMED` | U04 `lockfileVersion = 9.0`，有 importers、packages、snapshots 及 node-pty patch 引用；原始 hash 与历史 G04 一致。U03 对 vendor 包有 link overrides | 这是已有锁定描述；未执行 peer auto-install、workspace link materialization 或 resolver，不确认实际安装树 |
| DC-04 Source / DRRC npm 锁文件 | `CONFIRMED` | L03/L04 均为 30829 bytes、lockfileVersion 3、71 个 packages 条目（含根条目），SHA-256 相同。根仅声明 electron `35.7.5` 为 devDependency | 只覆盖旧 Electron 实验依赖，不能当成完整 Harness production closure |
| DC-05 Electron 声明链 | `CONFIRMED` | L03/L04 锁定 electron `35.7.5`、`@electron/get@2.0.3`、`env-paths@2.2.1`；electron 有 install script，依赖 `@electron/get`、`@types/node`、extract-zip；get 再声明 env-paths 等 | 仅读取已有字段，不运行 installer、下载器或 extract-zip；npm 包记录不等同 Electron 分发 ZIP |
| DC-06 Candidate 差异事实 | `CONFIRMED` | L05 为既有 Candidate，SHA-256 `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B`；`packages['node_modules/env-paths'].integrity` 与 L03/L04 区分大小写：旧片段 `UgALw`，Candidate 片段 `UgAlw`。G05 记录 Candidate `generated_not_applied` | 本次只读字段比对及既有处置，不重做网络 integrity Verification、不应用 Candidate、不确认修复已安装 |
| DC-07 可用 S7 dependency baseline | `BLOCKED` | 旧 Source/DRRC 锁仍原状，Candidate 未应用且无本次可用新基线；失败 node_modules/cache/quarantine 不能用于绕过此缺口 | 需 Owner 明确合法输入基线/处置与适用后续范围；当前不修改 lockfile、不安装或修复 |

## 3.2 Native / Helper / Plugin / External Dependencies

下表 `CONFIRMED` 仅确认声明、锁定文字或既有分析依据。任何可执行/native/DLL/helper 的实际发布字节、最终路径、加载范围与 ABI 仍由 DC-18 的缺口约束。

| ID / Dependency | 状态 | declared / lock / role 分析 | 输入引用 |
|---|---|---|---|
| DC-08 koffi | `CONFIRMED` | subprocess-local、win32-process、sandbox-windows-acl、fs-local、JSONL、native picker 声明 `^3.1.0`；U04 锁有 `koffi@3.1.1` 及平台 optional 分支；G04 记录 Win32 FFI/ACL/持久化/picker 角色 | U06～09、U11、U17、U04、G04；未读取或加载 native 二进制 |
| DC-09 node-pty | `CONFIRMED` | U06 声明 `1.2.0-beta.15`；G04 记录 subprocess-local 静态 import，不能以不启用 PTY 工具为由省略。U03/U04 指向 U05 patch，锁中的 patch hash 与 U05 SHA-256 一致 | U05/U06/U03/U04；U06 postinstall 声明为 helper 处理，不执行；不是已应用 patch 或 native 兼容证明 |
| DC-10 node-addon-require-builtin / loader | `CONFIRMED` | U02 声明 `^0.1.4`，U16 作为 peerDependency 要求同范围；U04 锁有 `0.1.4`、win32-x64-msvc 分支和 node-addon-native-custom-loader `0.1.4` | U02/U16/U04；G04 说明 Node-major/Electron internals 风险；不能将 vendor/loader 的直接 dependencies 列表当作全部 loader 依赖 |
| DC-11 ripgrep | `CONFIRMED` | U10 声明 `@vscode/ripgrep ^1.18.0`，U04 锁 `1.18.0` 及平台 optionalDependencies；G04 记录 rg binary 为需随 Worker 定位的 native sidecar | U10/U04/G04；未选定或认证最终 Windows rg executable |
| DC-12 Windows helpers | `CONFIRMED` | U08 `./runner → lib/runner.js`，依赖 win32-process/koffi；U17 `./worker → lib/worker.cjs`，依赖 directory-picker/native-command/koffi；需要真实磁盘入口与所属 execPath 域 | U07/U08/U17/G04；公开 export 声明不证明实际构建文件存在，不使用 src/tsx fallback |
| DC-13 Host / Client / plugin / profile | `CONFIRMED` | U18 `dsh-base` 声明大量 Host/工具/JSONL/SQLite-query/工作流依赖；U13/U14 有 Cordis/webServer/loader 等 peer 合同，G04 区分 webServer 服务（Layer A）与 stock HTTP 产品（Layer B）；L07/L08 是 Shaco 历史自定义 profile/bundle | U13/U14/U18/L07/L08/G04；不得把直接依赖、实际插件激活、平台分支和最终 inventory 混为一类 |
| DC-14 Agent preset / composition | `CONFIRMED` | U15 为 agent-presets，具有 include/loader 等 peers；G04 要求 shipped standard preset 与 composition 明确。工具业务范围不会由包中存在 preset 自动获得权限 | U15/G04；最终 preset/profile 字节和完整 roster 未闭合，见 RD-08/10 |
| DC-15 PowerShell / OS DLL / API | `CONFIRMED` | G04 将 host PowerShell 作为外部依赖，U12 只声明 pwsh-local 插件及 peers；koffi/ACL 等依赖 Windows 系统 DLL/API。必须单列 host inventory 和来源/路径约束 | G02/G04/U12；没有把 PowerShell 或任意宿主 DLL 假定为包内文件或已确认实物 |
| DC-16 Linux-only Landlock/bwrap 的 Windows 执行要求 | `NOT_APPLICABLE` | 当前设计目标是 Windows x64，G04 明确 Linux-only 机制不能作为 Windows Gate | 仅运行目标不适用；不自动删除声明图/platform inventory 中应有的分支与 disposition |
| DC-17 SQLite query 作为本次必需启用功能 | `NOT_APPLICABLE` | G02/G04 保持 JSONL 默认持久化、SQLite query `openAt: never`、非 V1.0 REQUIRED 功能 | U18 仍声明该包；功能不启用不等于可删静态依赖或 payload 文件，完整闭包需另外证明 |
| DC-18 最终 D/A/I 与实际字节 | `BLOCKED` | 缺获准最终布局、完整 declared graph、按入口/profile 解析的 actual closure、payload/external inventory、全部文件/ABI/动态 allowlist 与字节认证关系 | 只确认已有声明子集；不能证明 `nodes(D) ⊆ nodes(A)`、`edges(D) ⊆ edges(A)`、`files(A) ⊆ I_pkg ∪ I_ext` 或实际 payload 全集相等 |

闭包确认在 DC-07/DC-18 停止。本次没有制作新的闭包清单作为冻结输入，没有遍历/采纳失败安装树，没有执行 installer、resolver、动态 import/require、native load、业务插件、build 或 Byte Verification。后续需要完整输入与新执行范围时另行提交治理决定。

# 4. Environment Constraints

本节只记录已有约束及缺口，不把执行本次文档分析的开发机/沙箱视为目标 fixture，不调用 Runtime、Node/pnpm/PowerShell 版本探针、ACL/网络/child 测试或环境验证工具。

| ID / 环境项 | 状态 | 已知要求或未知内容 | 依据 / 处置 |
|---|---|---|---|
| EN-01 OS / Architecture 目标 | `CONFIRMED` | **候选目标**：Windows 11 x64、24H2、build family `26100`；首个候选普通当前用户、非提权 | G02 §2.4；候选 family 不等于完整 fixture |
| EN-02 完整 OS fixture | `UNKNOWN` | 未提供获准镜像身份、完整 build/revision、host inventory、来源、用户上下文与可复现环境输入 | 不从当前电脑或旧执行日志推断；缺失阻断目标环境确认 |
| EN-03 Node/pnpm constraints | `CONFIRMED` | **运行目标要求**：fresh Windows 无可用全局 Node/pnpm、无手动 Harness/开发源码/cache fallback，Worker 使用获准 bundled Runtime；U01 的 pnpm 是源码工具声明 | G02/G03/G04；不得将 pnpm 工作区依赖等同运行机依赖 |
| EN-04 实际无全局依赖状态 | `UNKNOWN` | 未取得目标 fixture 的 PATH/加载/宿主工具 inventory 或实际 execPath 依据 | 本次未运行 `node`、`pnpm` 或工具探针，不能确认实际状态 |
| EN-05 Host requirements | `CONFIRMED` | **候选/约束**：G02 首轮固定 Windows PowerShell 5.1 候选；PowerShell、系统 DLL/API、native/helpers 需明确身份；旧源码支持 fallback 的描述不能覆盖 S7 固定选择、不自动 fallback 规则 | G02/G04/U12；本次不选择 PowerShell 7 或从 PATH 自动回退 |
| EN-06 Host 实物身份 | `UNKNOWN` | 精确 PowerShell 路径/版本/hash、平台 DLL inventory、native/helper 文件和来源未确定 | 无法确认即保持缺口，不下载或配置 |
| EN-07 Permission requirements | `CONFIRMED` | Package/可执行配置与父目录持续受保护；Worker 受限 token；DSH_HOME/workspace/evidence/control/TEMP 分根；ACL/句柄/TOCTOU、lease/generation/durable ledger、network/children 有界；Renderer 隔离 | G02 §6 与 G03；只读属性和一次 hash 不能代替实际控制 |
| EN-08 Permission 实物/能力 | `UNKNOWN` | 未有本次绝对根/ACL/token/job/handle 配置、账户/权限边界、租约与账本控制工件及适用证明 | G04 对 Windows ACL 记载 partial enforcement，不能据此宣称满足更严格 S7 控制；不运行竞争替换或权限场景 |
| EN-09 数据/资源/外网约束 | `CONFIRMED` | JSONL 持久化、稳定可写 DSH_HOME；外网请求预算 0；有限 launch/child/时限/证据容量由 G02/G03 约束；当前整个执行预算仍 0 | 设计上限不是已批准数值分配 |
| EN-10 具体资源/输出映射 | `UNKNOWN` | 实际数据/证据/control 根、完整磁盘/CPU/内存预算及写入清单未闭合 | 本次不创建根、探测可写性或写入运行数据 |
| EN-11 Production / ARM64 运行目标 | `NOT_APPLICABLE` | 本次仅受控 Spike 输入分析，Production/Deployment 不授权，首个设计目标是 x64；不进行 ARM64 发布或兼容性承诺 | 不代表可忽略所选平台的全部必需项 |
| EN-12 环境闭合出口 | `BLOCKED` | EN-02/04/06/08/10 为必需缺口，不能确认环境已满足 | 停止相关确认，保留待提供的 fixture/约束材料；不开展 Runtime/环境验证 |

# 5. Trust / Control Inputs

本节**只记录 P0.S-7 适用输入的缺口**。G01 授予的输入分析权限不等于 Startup Activation；历史 P0.S-6 Anchor/key/Signature/Binding/Driver PASS 不迁移为新阶段信任。不配置公钥/私钥、信任入口、Driver、Approval、Reference 或任何控制实物。

| ID / Trust-Control Item | 状态 | 缺口 | 后续所需材料 / 当前停止边界 |
|---|---|---|---|
| TC-01 Authority Anchor | `UNKNOWN` | 未提供独立选定且明确适用 P0.S-7 的 Anchor 身份、选择批准与构建来源 ancestry 依据；PS-04 的当前上游 Git 身份也未确认 | 需既有可认证治理来源与精确选择记录；不自选当前 HEAD/历史 Anchor，不修改 Git 信任配置 |
| TC-02 Trust Root | `UNKNOWN` | 未有本次适用的公钥身份/用途批准、独立交付来源与受信 bootstrap 选择材料 | 不拷贝 P0.S-6 key 用途、不读取私钥、不配置或签名 |
| TC-03 Driver / collector | `UNKNOWN` | 未有独立选中的 Runtime Validation Driver/collector 版本、可执行/host prerequisite hash、受信交付与 root/ledger/fallback 输入 | 旧 Runner 存在不证明新 Driver 被批准；不运行 Driver、验证器或采集器 |
| TC-04 Approval | `BLOCKED` | 当前批准只覆盖 EAR-C01 输入分析；Package/Runtime/冻结/签名/Preflight/Invocation 的具体批准、case/kind/时窗/撤销/预算均未生效 | 不把 G01/G06 或上游 Review PASS 扩大为执行许可；维持预算 0 与其他 Case 未授权 |
| TC-05 Reference | `UNKNOWN` | 尚无独立选中的 expected Snapshot Reference、精确 Freeze Approval 身份、正式 Binding 路径/envelope digest 和输入链 | 当前禁止 Snapshot/Binding/Signature 创建，不能为补缺口先制造这些对象；引用不能只靠待验证对象自声明 |
| TC-06 Control implementation inputs | `UNKNOWN` | 受保护 roots、实际 ACL/token/handle/job/lease/ledger 机制、真实入口映射、预算持久化与停止边界的精确可审查输入尚不完整 | 仅保留 G02/G03 的要求；实际代码或 enforcement 补证不在本次范围 |
| TC-07 信任/控制闭合出口 | `BLOCKED` | TC-01～06 未齐备，不能确认独立信任链或控制输入闭合 | FAIL-CLOSED，停止相关确认；不调用 Preflight、验签、Invocation 或控制动作 |

# 6. Implementation Boundary

| ID / Boundary Item | 状态 | 本次有效边界 |
|---|---|---|
| IB-01 已批准工作 | `CONFIRMED` | G01 与本次指令授权 EAR-C01 Input Closure ONLY：输入整理、来源/字节身份记录、依赖/环境/Trust-Control 缺口分析，创建本文 |
| IB-02 EAR-C01 范围限定 | `CONFIRMED` | 对应 Execution Plan 的 P0.S-7-1-A 输入分析；原 EAR-C01 Package feasibility 的构建/准备/验证部分仍未授权，EAR-C02～05 仍未授权 |
| IB-03 允许产物 | `CONFIRMED` | 本文包含普通 Input Closure Record 与输入 inventory/analysis 表；不是冻结 Runtime Definition Identity、Package Identity、Manifest、Snapshot、Binding 或运行 Evidence Records |
| IB-04 禁止工件/执行 | `CONFIRMED` | 不创建 Runtime/Package/Snapshot/Binding，不 Signature/Invocation/Launch；不下载/安装/构建/解包，不执行 resolver 或验证工具，不修改代码/Runner/Manifest/Binding/lockfile |
| IB-05 实施提案与实际执行清单 | `UNKNOWN` | G03 给出未来隔离根与工件提案，具体实施源文件清单、主机绝对输出/权限映射及后续批准仍未闭合 |
| IB-06 Runtime/Package/Execution 进入条件 | `BLOCKED` | 源、依赖、ABI、环境、信任与控制输入存在必需缺口；当前预算及 Invocation 为 0，不能进入 Package Feasibility 或 Runtime 执行 |
| IB-07 阶段状态 | `CONFIRMED` | P0.S-6 保持 CLOSED / VERIFIED_WITH_CANDIDATE；Candidate generated_not_applied；P0S7_STATE=NOT_STARTED，P0S7_ALLOWED=NO |
| IB-08 Production / Deployment / Full Agent Platform / P1 | `NOT_APPLICABLE` | 均在本次批准范围外；不创建、部署、发布或声称相关基线/功能完成 |

## Unknown / Blocked Disposition

| Required Gap Group | 状态 | 已执行的 FAIL-CLOSED 处置 | 后续决定或材料需求 |
|---|---|---|---|
| 当前源身份/发行链：PS-04/06～09 | `BLOCKED` | 停止当前 checkout 与发布输入确认；未修改 safe.directory、所有权或信任配置；只保留可读取文件的字节身份 | 需可独立确认的源提交/tree/发行或构建 provenance 及适用输入选择；本次不进行下载/构建 |
| Runtime/ABI/profile/roster/protocol：RD-02/05/08/10/12/13 | `BLOCKED` | 保留候选与历史声明，不形成冻结 Definition 或包内清单，不把版本 1/旧 roster 自动用于 S7 | 需精确所选组合、组件/ABI材料、profile/roster/protocol 输入与适用批准；执行补证须独立范围 |
| 合法依赖基线与最终闭包：DC-07/18 | `BLOCKED` | 原锁文件与 Candidate 均保持字节原状；不安装、不 resolver、不 apply、不生成冻结 closure | 需 Owner 明确可用 baseline/候选处置，并在未来获准布局下补足完整 D/A/I；本次禁止改 Source/DRRC lockfile |
| fixture/host/permission：EN-12 | `BLOCKED` | 未把开发机当 fixture，未运行环境/权限/ABI验证工具 | 需完整 fixture/host inventory、实际根/工具身份与控制输入；实际环境证明另有授权 |
| Trust/Control：TC-07 | `BLOCKED` | 仅列缺口，未选择/配置/签名/运行 | 需 P0.S-7 独立 Anchor/key/Driver/Approval/Reference 与控制材料；当前禁建工件不为闭合而提前创建 |

以上阻断不影响本文在已批准分析范围内交付，但禁止给出整体输入已闭合结论。后续可以在已有输入分析权限内接收并分析补充材料；任何被禁止的下载、安装、构建、解包、冻结、签名、验证或执行动作都需要适用的新授权，不能以分析任务延续或更换名称绕过。

## Record State and Performed Work

```text
INPUT_CLOSURE_RECORD_STATUS = INPUT_CLOSURE_ANALYSIS_ONLY
ANALYSIS_RECORD_COMPLETED = YES
OVERALL_INPUT_CLOSURE_STATUS = BLOCKED
INPUT_CLOSURE_COMPLETE = NO
PACKAGE_SOURCE_STATUS = BLOCKED
RUNTIME_DEFINITION_INPUT_STATUS = BLOCKED
DEPENDENCY_CLOSURE_STATUS = BLOCKED
ENVIRONMENT_CONSTRAINTS_STATUS = BLOCKED
TRUST_CONTROL_INPUTS_STATUS = BLOCKED
IMPLEMENTATION_BOUNDARY_STATUS = CONFIRMED
CURRENT_USABLE_EXECUTION_BUDGET = 0
INVOCATION_COUNT = 0
RETRY_COUNT = 0
RESUME_COUNT = 0
RECOVERY_COUNT = 0
P0S6_STATE = CLOSED
P0S6_RESULT = VERIFIED_WITH_CANDIDATE
P0S7_STATE = NOT_STARTED
P0S7_ALLOWED = NO
```

| Work / Check | 状态 | 本次记录 |
|---|---|---|
| 输入分析与文档创建 | `CONFIRMED` | 只读文件/JSON字段/YAML文本、原始字节摘要、既有锁定字段对照、输入分类和缺口分析；仅新增本文件 |
| 上游 Git 身份读取 | `BLOCKED` | 两个只读 Git 查询均被 dubious ownership 拒绝；没有得到当前 HEAD/clean 结果，没有采取配置或权限绕过 |
| 编码与文档核对 | `CONFIRMED` | 本文使用 UTF-8 without BOM、LF；严格 UTF-8、疑似乱码、必需章节/状态、链接/输入字节摘要与前后文件范围核对；这些是文档检查，不是运行 Verification |
| 测试方式 | `NOT_APPLICABLE` | 按用户禁止事项未运行测试、项目 Verification、Final Preflight、resolver、构建或验证工具；不产生运行 PASS |

本次唯一新增文件为 `docs/04-development-records/P0S-7-1-INPUT-CLOSURE-RECORD.md`。原代码、中文文档、Runner、Manifest、Binding、lockfile、Candidate 及读取的上游文件不改写；不创建其他 inventory/analysis 文件。本文 SHA-256 在最终回复单独返回，不回填自身造成循环身份。

未执行：Package Feasibility；Runtime/Package/冻结 Runtime Definition Identity/Package Identity/Snapshot/Binding/Evidence Records 创建；Signature 或私钥读取/信任配置；Invocation ID 预留、Invocation、Launch；依赖下载/安装/构建/解包/业务插件加载；resolver、验证工具、Byte Verification、Final Preflight、测试或 Verification；代码/Runner/Manifest/Binding/lockfile 修改；Candidate 生成/应用；Runtime/Worker/Driver 启动；故障注入、对账/attach/stop、Retry/Resume/Recovery；Commit；Push。
