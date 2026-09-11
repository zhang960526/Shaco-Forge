# V1-SLICE-3 Step2 Implementation Record

Status: IMPLEMENTED_WAITING_OWNER_GATES

本记录只覆盖 `COMPATIBILITY_DISTRIBUTION_UPGRADE_SAFETY`。执行入口为
`514e1759b4991e950d5ad5169e3fc86dc3cc025f`，入口工作区 CLEAN。Step1 baseline
`99561f80629a8f9640af702fe322996bcc850906` 保持冻结。Frozen Harness 保持只读，
没有执行 Provider、生产签名、私钥操作、Independent Review、Step3、Fresh Windows、Owner Closure 或 Push。

独立 Evidence Run：
[`S3STEP2-20260911-SAFETY-01`](evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/)。
所有命令的真实尝试和失败保留在 `test-summary.json`、`development-attempts.json` 和 `logs/`。
最终接受结果必须以同一 source inventory 的最终门禁表为准；开发阶段 PASS 不自动等于最终接受。

## Control Store 与兼容性

沿用包内 Node 22.19.0 的 `node:sqlite` / `DatabaseSync`，实际 SQLite 3.50.4。
这样无需 ORM、独立数据库服务或额外 ABI driver。该 Node 版本仍把 SQLite API 标为 experimental，
测试保留其原始 warning；没有将 API 稳定性表述为生产签署结论。

数据库位于 `%LOCALAPPDATA%\Shaco Forge\control\state.sqlite`，schema 1。
版本来源于 Step2 首次需要的四张控制表，不创建未来空表：

| 表 | 字段 |
| --- | --- |
| schema_version | singleton, version, source_schema |
| release_control | singleton, artifact_digest, manifest_digest, product_version, dsh_home |
| upgrade_transaction | singleton, transaction_id, state, source_digest, target_digest, backup_digest, error_code |
| upgrade_events | sequence, transaction_id, state, at, error_code |

Schema bootstrap 和控制事件更新使用 SQLite 事务；DELETE journal、synchronous FULL、busy timeout 5 秒，
关闭数据库后备份单个 SQLite 文件。打开时检查 quick_check、user_version、schema row、精确表/列和 journal mode。
缺失文件仅可经显式 FRESH_INSTALL 或精确 Step1 NO_STORE route 创建。当前 1→1 是验证 seam；
0、unknown、future、损坏和未声明迁移均拒绝。没有 Session、Conversation、transcript、settings、credentials、
Profile、Workspace 或 Tool/Permission/Approval/Question 业务副本。

Handshake 仍只有六个身份：Product/Desktop/Worker 均为 `1.0.0-dev.1`，Carrier 为数字 `1`，
HarnessBaseline 为 `0.1.2-alpha.1`，ControlStoreSchema 为字符串 `1`。Electron、Node、平台、架构、ABI
继续属于 release/runtime metadata。允许的 tuple、Carrier 交集、Worker schemas 均显式声明。

唯一升级 source 是 Step1 artifact
`b84beea0575404242b3979bd260cb3f98ed6c443ba9e71789e6f799c8f409b05`，
source baseline `99561f80629a8f9640af702fe322996bcc850906`，source schema
`NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES`。Target 用新的 artifact 和 release manifest 摘要区别于同版本号的 Step1。
Restore target 是原 runtime 与升级前原 durable bytes 的同一对。没有任意降级或 Harness down-migration。

十二个 mismatch code 均有 actionable reason：PRODUCT_RELEASE_MISMATCH、DESKTOP_TOO_OLD、WORKER_TOO_OLD、
WORKER_TOO_NEW、DESKTOP_WORKER_MISMATCH、CARRIER_UNSUPPORTED、HARNESS_BASELINE_MISMATCH、
CONTROL_SCHEMA_UNSUPPORTED、DSH_HOME_MISMATCH、UPGRADE_IN_PROGRESS、RESTORE_REQUIRED、RELEASE_INTEGRITY_FAILURE。
未知、缺失、不可解析、未列出的身份全部拒绝。入口先验证完整包，再读取已知目录与控制状态，
之后才允许 Product Home/profile 写入或 Host 启动。Desktop 在 attach 之前校验 Worker 的六身份和 attested home；
native helper 在签发凭据之前再次比较六身份、home 和 upgrading authority。

## Installer 与签名边界

NSIS 3.12 Unicode 外壳，Windows x64 / per-user / RequestExecutionLevel user，保留 Step1
`@electron/packager@18.3.6` 文件布局。安装位置为 `%LOCALAPPDATA%\Programs\Shaco Forge\current`；
Product Data Root 为 `%LOCALAPPDATA%\Shaco Forge`。只使用 HKCU 卸载登记，无 Windows Service、
自动更新 daemon、release server、delta、多 channel 或 ARM64。

包验证和安装事务是 Product-owned。NSIS `.onInit` 只提取验证 helper 及 public signer policy，
先验证自身外层 installer 的 Authenticode，之后才允许 payload/安装事务执行。生产没有 skip-signature、
ALLOW_UNSIGNED 或自定义 durable-root 参数。

验证采用 Windows WinVerifyTrust 与嵌入式 PE signature，检查链/撤销策略、允许的 public certificate SHA-256、
已验证 timestamp metadata，并把结果绑定到 installer 文件 SHA-256。验证期间文件句柄限制写入/替换，
Worker 边界还对验证前后摘要进行比较。公开的已签名 Node 文件提供正向测试；unsigned 自有 helper、
篡改公开 PE、错误 signer、错误摘要及缺失/无效 timestamp 提供负向测试。没有创建任何签名密钥。

当前 signer allowlist 为空，状态 `PENDING_ARCHITECTURE_OWNER_PUBLIC_SIGNER_IDENTITY`。候选为 UNSIGNED、
NOT_PRODUCTION_SIGNED、NOT_RELEASE_READY。Owner 必须提供 public signer identity，重新构建并重跑受影响门禁，
随后由 Owner 授权签名并采集最终签名文件摘要、证书公开身份、timestamp 和验证结果。
`OWNER_SIGNING_HANDOFF.json` 只包含公开标识及产物位置。

## 更新、排空、备份和恢复

Durable journal 位于 `%LOCALAPPDATA%\Shaco Forge\control\upgrade-journal.json`，
由 current-user-only 原生文件操作发布：先 Flush(true)，再 MoveFileEx replace/write-through。
它是无业务 truth 的控制 journal，不是第二业务数据库。

状态链：IDLE→CHECKING→DRAINING→BACKING_UP→INSTALLING→MIGRATING→VALIDATING→COMMITTED。
INSTALLING 在第一处安装字节修改之前持久化 installed=true。安装后的失败走 FAILED→RESTORING→RESTORED
或 RESTORE_FAILED，绝不记为 ABORTED。ABORTED 只允许安装前取消。重启读取原 journal；
未完成安装前状态拒绝启动并要求显式 recovery，安装后残留要求 restore。RESTORED 先持久化，
再释放执行 fence；重启 terminal recovery 不重复覆盖已经恢复的数据。

Source runtime 的原 DACL 先写 journal，再施加持久化 ExecuteFile deny fence。
该 fence 跨 installer 退出仍有效，并被新文件继承。原 Step1 没有 drain handshake，因此它的 Worker
必须已经停止；存在活动旧 Worker 时明确拒绝，不把强杀或 DETACHED 充作安全排空。
只有 fence 生效且旧进程停止后才发布 DRAINING。支持新 drain 协议的 Worker 使用现有 private lifecycle
通道和 Host gateway，拒绝新 mutation/unary/stream-open，等待已有 unary 和 stream-open 到边界，
通过公开 agents.whenIdle 与 sessions.flush 检查持久化，再经公开 appExit 关闭 Host。
Worker 收到 proof 后关闭 Host 输入管道，等待自然退出，生成包含 transaction/Worker identity 的 receipt；
installer 确认 Worker、Host、helper 都已消失才允许备份。

公开 Harness shutdown 中的退出码本身不能单独证明所有 disposer 成功；本实现同时要求 public idle/flush proof
以及 Host 实际不存在。排空后的数据快照观察是辅助证据，不冒充无限时间证明或真实断电测试。

备份范围为完整 source runtime、DSH_HOME 原字节、关闭后的 state.sqlite（Step1 缺失则明确记录），
以及 transaction/source identity、容量与每文件 size/SHA-256 manifest。只接受规范绝对目录，无意外 reparse。
受控 profile/module junction 仅保存精确引用，不跟随复制。备份目录按当前 SID 创建和验证 ACL，
容量预检为实际字节加 16 MiB；复制刷盘、封存 manifest、二次校验及 source census 后才进入 INSTALLING。
容量不足、失去 quiescence、晚到写入、损坏备份都阻止安装。

Restore 先阻断新 runtime、检查备份及当前 runtime 所有权，再恢复 runtime→DSH→SQLite，逐字节校验并刷盘。
旧 profile 引用恢复至原 runtime。没有调用 Harness 降迁移。失败保留 RESTORE_FAILED authority，
不把未知数据或错误 runtime 作为成功恢复。生产首次安装失败可恢复“无 runtime/无 store”的原始空状态。

## 卸载

生产默认保留 DSH_HOME、Control Store、backup 和日志。安装身份 envelope 必须与已验证 installer payload 一致；
每个 manifest-owned 文件的长度和摘要必须匹配，随后排空并仅删除 owned bytes。未知文件与未知空目录保留。
保留的外层 installer.exe 是分发/recovery 入口，不属于 packaged runtime 文件清单。
当前生产 UI 只提供数据保留；显式数据清除函数的独立确认拒绝/成功分支仅在隔离 adapter 测试。
当前没有声明卸载后使用既存 durable universe 的重新安装 route，也没有声明任意现有 Step2→Step2 更新。

## F-05 Technical Disposition Candidate

候选 PATH B：`RESIDUAL_EXCEPTION_REQUIRED`。最终 Security Disposition 仍为
`PENDING_ARCHITECTURE_OWNER_ACCEPTANCE`，F-05 为 `OPEN_KNOWN_CONSTRAINT`。

Exact CSP：

```text
default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

Frozen Client 的 Schemastery serialized callbacks 使用 new Function；只删除 unsafe-eval 会进入被捕获的异常，
可能静默改变 Settings schema 行为。公开插件 CSS 使用无 nonce 的动态 style 标签，包含主题。
只删除 unsafe-inline 会阻断这些样式。当前最小处理保留现有 directive exception、禁止外部 script/style，
并保持 nodeIntegration=false、contextIsolation=true、sandbox=true。
Renderer injection 仍可能利用动态求值或注入样式，隔离措施不等于该风险已关闭。
本记录不要求修改 Frozen Harness，不代表 Owner 接受，也不构成 Step2 closure。

## 验证与后续

测试使用显式、非发布的隔离 adapter；实际包、Bundled Node、native helper、Host/profile 和 Desktop modules
仍取自经完整验证的 packaged artifact。隔离 Desktop container 仅替换 test bootstrap 来选择测试目录，
生产入口没有此选项。生产未签名入口只运行拒绝测试，不进行真实用户数据安装。

隔离安装根目录位于 OS temp 下专用 `shaco-forge-slice3-step2-runtime-tests`，测试和非发布原生 helper
共同限制该边界，并拒绝祖先 `node_modules`。曾放在仓库内的测试安装被祖先 TypeScript 污染，
严格链接断言发现后改为仓库外隔离，未放宽目标检查。安装登记在非发布 adapter 中用隔离文件记录；
真实 HKCU 生产写入尚未执行，属于签名后生产入口验证范围。

累计 Slice2 UI 夹具也改为仓库外 OS temp `shaco-forge-slice2-cumulative-*`。
此前原 UI 出现凭据保存/移除超时，诊断捕获公开调用返回 `credential-rejected / EPERM rename`。
具体占用来源尚未确认；原 UI 断言与 Frozen Harness 均未修改，不把测试隔离改进表述为平台问题已修复。
详情见 [BUG-S3S2-001](incidents/BUG-S3S2-001-WINDOWS-CREDENTIAL-RENAME.md)，保持 OPEN 并交 Owner 评估。

全部 23 条必需最终命令已通过，绑定 source inventory `4d0c14740d3adc4216690d27b167397e13b6f7cf177d0419fc03de7db747dc39`（175 文件）。
185 项单元测试、36 项 Step2 专用测试和真实 packaged runtime / installer / transaction 门禁通过。
完整 [A–Y 报告](evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/FINAL-REPORT.md)、
[最终命令及完整失败账本](evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/README.md) 已补齐。
允许创建本次唯一 local implementation candidate commit，随后验证提交内实际 source bytes。
后续仅交付 Architecture Owner Step2 Security and Signing Gate Assessment；不进入独立审查、签名或 Step3。

NSIS 首轮构建因 deep dependency 的 Windows MAX_PATH 失败；最终以 extended-length input path、ManifestLongPathAware 与显式 UTF-8 compiler charset 通过。外壳为 NSIS x86-unicode bootstrap，启动检查要求 Windows x64，payload 为 x64；不将外壳 PE 架构误称 AMD64。
