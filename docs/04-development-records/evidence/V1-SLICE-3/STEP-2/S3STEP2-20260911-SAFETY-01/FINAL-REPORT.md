# V1-SLICE-3 Step2 — Final A–Y Report

## A. GOAL_VERDICT

COMPLETED_TO_OWNER_GATES。Step2 = IMPLEMENTED_WAITING_OWNER_GATES；非 Human 实现门禁 PASS。

## B. ENTRY

Actual/expected entry HEAD = `514e1759b4991e950d5ad5169e3fc86dc3cc025f`；入口 CLEAN。
Step1 frozen baseline = `99561f80629a8f9640af702fe322996bcc850906`。
Frozen Contract SHA-256 = `35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76`。
Frozen Harness HEAD = `cd5ef8148158c3a752a658978873241fdf8e2bbc`；CLEAN / READ_ONLY，任务中未改动。

## C. CONTROL_STORE

Driver = bundled Node 22.19.0 node:sqlite / DatabaseSync，SQLite 3.50.4。选用包内能力，未引入 ORM/driver framework/数据库服务；该 API 在此 Node 版本仍标 experimental。
位置 = %LOCALAPPDATA%\Shaco Forge\control\state.sqlite；known-folder 由原生系统 API 决定，schema = 1。

| Table | Actual fields |
| --- | --- |
| schema_version | singleton, version, source_schema |
| release_control | singleton, artifact_digest, manifest_digest, product_version, dsh_home |
| upgrade_transaction | singleton, transaction_id, state, source_digest, target_digest, backup_digest, error_code |
| upgrade_events | sequence, transaction_id, state, at, error_code |

显式 FRESH_INSTALL 或精确 frozen Step1 NO_STORE → 1 bootstrap；当前 1→1 验证 seam；unknown/旧版未列 route/未来/损坏拒绝。
使用原子 SQL transaction、FULL sync、DELETE journal、quick_check、精确表/列/版本检查；迁移注入失败回滚。
无未来空表，不复制 Harness Session、Conversation、transcript、settings、credentials、Profile、Workspace 等 truth。

## D. COMPATIBILITY

唯一六身份 tuple：ProductVersion=DesktopVersion=WorkerVersion=1.0.0-dev.1；CarrierVersion=1；HarnessBaselineVersion=0.1.2-alpha.1；ControlStoreSchemaVersion=1。
精确 release tuple、Carrier major/共同支持集合、Worker schema support、Frozen Harness package/commit 和 normalized attested DSH_HOME 均验证。runtime metadata 不是新增握手身份。
唯一 source = Step1 artifact `b84beea0575404242b3979bd260cb3f98ed6c443ba9e71789e6f799c8f409b05`，source schema=NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES，target artifact=`df35daad07b98e6a4bdb81501fcd33390b6c07f37dd7b813a18218d718bfde6f`。
完整矩阵/route/restore relation 见 [final release declaration](FINAL-release-manifest.json)。

十二个拒绝码：PRODUCT_RELEASE_MISMATCH、DESKTOP_TOO_OLD、WORKER_TOO_OLD、WORKER_TOO_NEW、DESKTOP_WORKER_MISMATCH、CARRIER_UNSUPPORTED、HARNESS_BASELINE_MISMATCH、CONTROL_SCHEMA_UNSUPPORTED、DSH_HOME_MISMATCH、UPGRADE_IN_PROGRESS、RESTORE_REQUIRED、RELEASE_INTEGRITY_FAILURE。
每个有 actionable reason 和零写入负向测试；实际 packaged Node/Electron 缺失 store 先拒绝，native mismatch 不发 fresh credential、dispatch delta 0，DSH 快照不变。
No silent fallback：不切 old Worker/Harness/Carrier、system Node、其他 DSH_HOME 或开发 checkout。

## E. INSTALLER

NSIS 3.12 成熟 Unicode installer 外壳，per-user / Windows x64 guard，保留 @electron/packager@18.3.6 runtime 布局。
安装 = %LOCALAPPDATA%\Programs\Shaco Forge\current；数据 = %LOCALAPPDATA%\Shaco Forge；HKCU 登记，无 Service/updater/server/delta/channels/ARM64。
Bootstrap PE 为 x86-unicode，payload 为 x64。Unsigned candidate = `D:\Project\Shaco-Forge\dist\installers\Shaco-Forge-1.0.0-dev.1-1789146867101-unsigned.exe`。
Size = 162976610 bytes；SHA-256 = `91edf1658b734b3feca51abc082f366e0bf15442aba4e355c885a035b3f1c809`。
Packaged artifact = `df35daad07b98e6a4bdb81501fcd33390b6c07f37dd7b813a18218d718bfde6f`；release manifest SHA-256 = `ce8b5714cd442b458db64a83bedfffdfd055fc9e07e2080bcd42f3fc81e3dd3d`。
UNSIGNED / NOT_PRODUCTION_SIGNED / NOT_RELEASE_READY。

## F. SIGNING INTEGRATION

Windows native WinVerifyTrust 检查嵌入 PE signature、chain/revocation policy、public certificate SHA allowlist、verified timestamp；文件锁与前后摘要绑定 installer。
真实 unsigned installer / 直接 production entry 均在写用户数据前拒绝；tampered public PE、wrong signer、invalid signature、digest mismatch 与 timestamp negatives 拒绝。
已公开签名 Node 正向证书身份/timestamp 提取通过；没有自行生成密钥或把 test adapter 发布为 bypass。
Production signing = NOT RUN；signing/private-key operations = 0。
[OWNER_SIGNING_HANDOFF](OWNER_SIGNING_HANDOFF.json) 仅含公开身份策略、产物摘要、验证 seam 与签后必采字段。

## G. TRANSACTION

IDLE→CHECKING→DRAINING→BACKING_UP→INSTALLING→MIGRATING→VALIDATING→COMMITTED。
失败：FAILED→RESTORING→RESTORED 或 RESTORE_FAILED；ABORTED 仅安装前。
Current-user protected %LOCALAPPDATA%\Shaco Forge\control\upgrade-journal.json 使用 Flush(true)+MoveFileEx WRITE_THROUGH 发布；SQLite 保留控制状态/事件。
每个 transition/fault/restart 可读；INSTALLING 在首次安装写入前记 installed=true。未完成前置状态拒绝正常启动，安装后残留要求 restore；terminal recovery 幂等。
完整实际状态事件见 [integration ledger](runs/smoke-slice3-step2-5/step2-integration.json) 和专用 fault ledger。

## H. DRAIN

沿用 Worker/private lifecycle 与 Host gateway。设置 upgrading authority 后拒绝 fresh credential、新 unary/mutation/stream-open，等待原操作、public agents idle 与 sessions.flush，再 public appExit。
收到 proof 后关闭 Host input 并等待自然 exit 0；确认 Worker/Host/helper 消失才到 backup。原 Step1 无 drain handshake，要求旧 Worker 已停止后施加持久 execution fence；不以强杀证明 quiescence。
真实验证排空 receipt + DSH bytes 300ms 后相同；pending operation 及新写拒绝由真实 gateway 模块的 non-shipped service fixture 自动证明。
此证据不等于无限时间证明或所有 disposer 单凭 exit code 成功。

## I. BACKUP

完整原 runtime + controlled DSH_HOME + 关闭后的 state.sqlite/明确 absent + source/transaction/release metadata。
Backup = controlled %LOCALAPPDATA%\Shaco Forge\backup\<transaction-id>；当前 SID-only ACL、canonical ancestry、无未知 reparse，受控 profile/module junction 保存精确引用且不跟随复制。
容量 = 实际 bytes + 16 MiB；copy fsync、每文件 size/hash、封存 manifest digest、重读与 source census 二次核对后才 INSTALLING。
disk-full、copy fail、corrupt backup、Worker/quiescence 丢失、late source write 均拒绝安装。原始完整 [backup manifest](runs/smoke-slice3-step2-5/step1-backup-manifest.json) 保留。

## J. RESTORE

恢复严格一致 pair：原 runtime + 升级前原 durable bytes + 原 control store；runtime→DSH→SQLite 后逐字节校验与旧 release identity 验证。
真实 Step1 validation fault 修改中文 sentinel 后恢复原 hash；RESTORED restart 不重复覆盖；再次 Step1 happy upgrade COMMITTED。
restore failure 留 RESTORE_FAILED/fail closed；无任意 downgrade、无 Harness business-data down-migration。

## K. UNINSTALL

先 bounded drain/stop；只删除经验证的 manifest-owned bytes，默认保留 Product Data Root、DSH_HOME、store、backup 和日志。
未知文件与未知空目录保留，外层 recovery installer.exe 保留。完整包实际卸载验证 SQLite hash 未变。
显式 purge 无单独确认拒绝，有 test confirmation 只清除隔离 data root；生产 UI 当前只提供 retention。

## L. F-05

PATH B = RESIDUAL_EXCEPTION_REQUIRED。unsafe-eval PRESENT；unsafe-inline PRESENT。

```text
default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

Frozen Client Schemastery serialized callbacks 依赖 new Function；仅删除 unsafe-eval 会发生被捕获异常并可能改变 Settings schema。
动态无 nonce style 标签承载公开 plugin/theme CSS；仅删除 unsafe-inline 阻断样式。广泛 codegen/CSS 提取不属于最小更改。
无 external script/style source；NodeIntegration OFF、ContextIsolation ON、Sandbox ON。
Final composition manifest SHA = `ea3085e80ac65bbbb439db49268eb20b84f0b8788560beb68026eb62600568dd`；application SHA = `3b907282bbe13229bdcecbc93117be310fc558c9c853b1c425fdb3d6e866238e`。
残留风险：Renderer injection 可在 trusted origin 动态执行或注入样式；隔离减少范围但不能关闭风险。
Release impact：F05_SECURITY_DISPOSITION=PENDING_ARCHITECTURE_OWNER_ACCEPTANCE；F05_STATUS=OPEN_KNOWN_CONSTRAINT。

## M. STEP1 REGRESSION

最终 package closure、bundled Node 22.19.0、exact frozen Harness、shaco-forge profile、controlled DSH_HOME、release/file/artifact identity、NF-1/NF-3 与实际 packaged startup 均重新通过。
Step1 frozen baseline、原 Evidence/Review/Contract 未改动；该回归不构成 Slice3 Step3 或 Slice3 closure。

## N. TESTS

FINAL_SOURCE = `4d0c14740d3adc4216690d27b167397e13b6f7cf177d0419fc03de7db747dc39`；175 files；每条 sourceBefore=sourceAfter，entry ancestry 一致。

| Command | Attempt | Exit | Result | Source identity | Evidence |
| --- | ---: | ---: | --- | --- | --- |
| `typecheck` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/typecheck-4.log) |
| `build` | 12 | 0 | PASS | FINAL_SOURCE | [raw log](logs/build-12.log) |
| `test` | 6 | 0 | PASS | FINAL_SOURCE | [raw log](logs/test-6.log) |
| `verify:static` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/verify-static-4.log) |
| `verify:theme` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/verify-theme-4.log) |
| `smoke:worker` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-worker-3.log) |
| `smoke:carrier` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-carrier-3.log) |
| `smoke:electron` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-electron-3.log) |
| `smoke:failure` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-failure-3.log) |
| `smoke:slice2-step1` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-slice2-step1-4.log) |
| `smoke:slice2-step2` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-slice2-step2-3.log) |
| `smoke:slice2-step3` | 9 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-slice2-step3-9.log) |
| `smoke:slice2-step3-interactions` | 2 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-slice2-step3-interactions-2.log) |
| `test:full-shaco` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/test-full-shaco-3.log) |
| `smoke:full-shaco` | 2 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-full-shaco-2.log) |
| `package:runtime` | 7 | 0 | PASS | FINAL_SOURCE | [raw log](logs/package-runtime-7.log) |
| `test:packaged-runtime` | 2 | 0 | PASS | FINAL_SOURCE | [raw log](logs/test-packaged-runtime-2.log) |
| `smoke:packaged-runtime` | 9 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-packaged-runtime-9.log) |
| `test:slice3-step2` | 10 | 0 | PASS | FINAL_SOURCE | [raw log](logs/test-slice3-step2-10.log) |
| `smoke:slice3-step2` | 5 | 0 | PASS | FINAL_SOURCE | [raw log](logs/smoke-slice3-step2-5.log) |
| `package:installer` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/package-installer-4.log) |
| `test:installer` | 3 | 0 | PASS | FINAL_SOURCE | [raw log](logs/test-installer-3.log) |
| `verify:f05` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/verify-f05-4.log) |
| `composition` | 4 | 0 | PASS | FINAL_SOURCE | [raw log](logs/composition-4.log) |

## O. FAILED_ATTEMPTS

[全部命令/exit/source/log](test-summary.json) 与 [诊断/纠正记录](development-attempts.json) 全保留。
包括 TS 初始化、sandbox/.NET 权限、缺少 profile fixture、PS5 policy/API、Host drain pipe 退出、unscoped junction、Desktop 初始 compatibility failure 未终结、CSP parser 空白、NSIS MAX_PATH 和累计 UI 测试等失败/超时。
其中 Slice2 Step3 原 UI 凭据移除三次超时，随后正式 attempt 6 在保存处超时。完成 RPC 观测另行复现了 credentials/unset 返回 credential-rejected / Windows EPERM rename；占用来源未查明，也不能把所有历史超时都归于同一原因。仓库外隔离诊断通过后，累计夹具移到 OS temp，原 UI 断言、产品与 Frozen Harness 未改动。记录 [BUG-S3S2-001](../../../../incidents/BUG-S3S2-001-WINDOWS-CREDENTIAL-RENAME.md)，保持 OPEN，不声称平台问题已修复。修改测试源码后的旧 composition 清单拒绝也已保留，并重建清单后重新验证。
诊断运行与 development PASS 不冒充最终门禁；退出码、时间及每轮 raw logs 可追溯。
本任务 raw logs 通过专用 .gitattributes -text 保留提交前后原字节；[原始格式记录](raw-log-formatting.json) 列出两份失败日志的 5 条 Git 尾部空白诊断（包含原始回车控制字符），以及 28 份原始日志的末尾空行；这些字节均保留，代码/文档仍严格通过空白检查。首轮交付检查因末尾空行尚未纳入格式清单而失败，已完整记录并补全清单。

## P. NON-PROVIDER CUMULATIVE REGRESSION

PASS。当前所有可重复 non-Provider gates 与 Step2 dedicated gates 均在同一最终 source inventory 通过。
Provider = 0。历史 Owner 决策/Review 事件只做冻结文件 SHA 和 entry baseline identity validation + NOT_RERUN；[分类清单](gate-classification-and-frozen-identities.json) 不以历史 Review 代替当前 Independent Review，也不虚构 fresh 环境验收。

## Q. NOT RUN

Provider；production signing；private-key operations；Independent Review；Slice3 Step3；Fresh Windows / Slice4；Owner Closure；Step2 baseline freeze；Push。
无生产 signed install positive（PENDING_OWNER_SIGNING），真实 production unsigned rejection 已执行。
没有真实断电或第二用户登录；native ACL 是实际 kernel ACL/current SID 及不同 SID 的 deterministic evaluation。

## R. EVIDENCE

Root = `D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-3\STEP-2\S3STEP2-20260911-SAFETY-01`；Run ID = S3STEP2-20260911-SAFETY-01。
[README](README.md) 索引所有 manifests、installer、handoff、签名/ACL、backup/restore receipts、transaction ledger、CSP、cleanup、失败记录和编码验证。
Fixtures 为显式 non-shipped isolated test roots；用于复核的数据保留，产品 authority/Host/helper/测试 Desktop 已清理。

## S. MODIFIED_FILES

[完整逐文件列表](MODIFIED-FILES.md) / [machine-readable list](modified-files.json)。清单包含代码、配置、治理文档和新 Step2 Evidence，每个路径均列出；无省略号。
实现细节另见 [Implementation Record](../../../../V1-SLICE-3-STEP2-IMPLEMENTATION-RECORD.md)。

## T. GOVERNANCE_FINAL_STATE

```text
V1_SLICE_1 = PASS / CLOSED / FROZEN
V1_SLICE_2 = PASS / CLOSED / FROZEN
V1_SLICE_3 = IN_PROGRESS
V1_SLICE_3_ARCHITECTURE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
V1_SLICE_3_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_3_STEP1_BASELINE = 99561f80629a8f9640af702fe322996bcc850906
AUDIT_017_NF_1 = CLOSED_BY_SLICE3_STEP1_PACKAGING_HARDENING_AND_OWNER_ACCEPTANCE
AUDIT_017_NF_3 = CLOSED_BY_SLICE3_STEP1_STABLE_RELEASE_IDENTITY_AND_OWNER_ACCEPTANCE
NF4_STATUS = DEFERRED_TO_SLICE3_STEP3 / NOT_CLOSED
MAX_JSON_FRAME = 262144
V1_SLICE_3_STEP2_IMPLEMENTATION_AUTHORIZATION = CONSUMED
V1_SLICE_3_STEP2 = IMPLEMENTED_WAITING_OWNER_GATES
V1_SLICE_3_STEP2_NON_HUMAN_IMPLEMENTATION_RESULT = PASS
V1_SLICE_3_STEP2_COMPATIBILITY_GATE = PASS
V1_SLICE_3_STEP2_CONTROL_STORE_GATE = PASS
V1_SLICE_3_STEP2_TRANSACTION_GATE = PASS
V1_SLICE_3_STEP2_BACKUP_RESTORE_GATE = PASS
V1_SLICE_3_STEP2_UNINSTALL_GATE = PASS
V1_SLICE_3_STEP2_UNSIGNED_INSTALLER_CANDIDATE = READY
V1_SLICE_3_STEP2_PRODUCTION_SIGNING_GATE = PENDING_OWNER_AUTHORIZATION
SIGNING_EXECUTION_AUTHORIZATION = NO
SIGNING_RUN_COUNT = 0
F05_TECHNICAL_DISPOSITION_CANDIDATE = RESIDUAL_EXCEPTION_REQUIRED
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
F05_STATUS = OPEN_KNOWN_CONSTRAINT
F05_CLOSURE_BY_EXECUTOR = FORBIDDEN
F05_CLOSURE_BY_REVIEWER = FORBIDDEN
STEP2_CLOSURE_WITHOUT_F05_OWNER_DISPOSITION = FORBIDDEN
V1_SLICE_3_STEP2_INDEPENDENT_REVIEW = NOT_STARTED
V1_SLICE_3_STEP2_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP2_BASELINE = NOT_FROZEN
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
V1_SLICE_3_CLOSURE = NO
PROVIDER_GATE_AUTHORIZATION = NO
PROVIDER_RUN_COUNT = 0
V1_SLICE_4 = NOT_STARTED
V1_CURRENT_STEP = V1_SLICE_3_STEP2_IMPLEMENTED_WAITING_OWNER_GATES
V1_CURRENT_NEXT_ACTION = ARCHITECTURE_OWNER_STEP2_SECURITY_AND_SIGNING_GATE_ASSESSMENT
```

## U. GIT

Entry HEAD = `514e1759b4991e950d5ad5169e3fc86dc3cc025f`。仅允许包含本报告的 1 个 local implementation candidate commit；未 amend 任何 frozen baseline。
Candidate SHA / final HEAD = 本报告所在候选提交；实际 SHA、count=1 和 175 文件逐字节验证写入本地 ignored receipt `dist/slice3-step2-candidate-commit-verification.json` 并在最终回复返回。
提交后必须 source bytes PASS + git status CLEAN。Push = NO。这里避免把未来 commit SHA 自引用写入被提交文件。

## V. SCOPE_EXPANSION

NO。没有新增核心架构、第二业务 truth、public Carrier identities、MAX_JSON_FRAME 修改、服务/updater/server/delta/channels/ARM64 或 Harness 修改。

## W. REMAINING_RISKS / DEFERRED

未签名候选不能发布/生产安装；Owner public signer identity 未配置。F-05 两项 directive exception 等待 Owner 风险处置。
Node SQLite API 在 pinned Node 上仍 experimental；当前迁移只声明精确 Step1 NO_STORE→1 与首次安装。
尚无任意 Step2→Step2 或卸载后既存 durable universe 的 re-install route；原 Step1 在线 Worker 需先停止。
NF4 deferred Slice3 Step3/not closed，MAX_JSON_FRAME=262144；Fresh Windows/真实断电/最终生产签名链未验收。
累计 UI 凭据测试有四次正式超时；另一次诊断确认 Windows EPERM rename 拒绝，具体占用者未知。外部 temp 夹具和最终原 UI 断言通过不等于平台缺陷已关闭；BUG-S3S2-001 保持 OPEN，后续 Owner assessment 必须保留此复现风险。

## X. OWNER GATES

F05_OWNER_DISPOSITION_REQUIRED = YES。
PRODUCTION_SIGNING_AUTHORIZATION_REQUIRED = YES。
READY_FOR_ARCHITECTURE_OWNER_STEP2_SECURITY_AND_SIGNING_GATE_ASSESSMENT = YES。
Owner 提供并接受公开 signer policy 后，先 rebuild/rerun 受影响 gates，再由 Owner 控制签名，记录证书公开身份、timestamp、验证结果和 final signed installer digest；本执行者不自行执行。

## Y. FINAL STOP

完成本次唯一候选提交及 byte verification 后立即停止于 Owner gates。
Independent Review 未运行，生产签名未运行，F-05 未关闭，Step2 未关闭/未冻结，Step3 未授权。
