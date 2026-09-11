# S3S1-IR-001 Corrective Executor Final Report

CORRECTIVE_VERDICT = PASS

PARENT_REVIEW_ID = REVIEW-029; PARENT_REVIEW_VERDICT = FAIL / HISTORICAL_PARENT_REVIEW.

S3S1_IR_001_STATUS = CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW. Step1 未关闭、未冻结。本 Executor 未执行 targeted independent re-review。

## Root cause and implementation

旧算法先复制整个 overlay 顶层包，再补依赖，导致不可达测试与开发包进入产品。新算法从官方 dsh bin、现有生成 profile 的 bundles、bootstrap cordis patch 插件和 Shaco bootstrap 实际 JS import 推导 roots。顶层枚举只用于排除清单。生产包按名称排序、广度优先和声明排序确定遍历；仅允许 dependencies、适用的 optionalDependencies、非 optional peerDependencies。缺少必需依赖/peer、错误名称/版本/来源、歧义身份均 fail closed。devDependencies 和 optional peers 不单独引入包。

物化保持实际 Node 解析关系，版本冲突时嵌套放置。独立扫描每个最终物理包，核对 manifest SHA、可达路径、声明边和实际解析目标，拒绝额外包和测试内容。保留 runtime manifest/import 引用的 src 与 LICENSE，裁剪可确认的 test/fixture/coverage、构建状态和开发配置；无 JS 重写、bundle 或 Harness patch。

早期桌面失败还暴露了验证目录的祖先 node_modules 污染：Frozen Harness 的 optional peer healing 可找到仓库 typescript，生成外部 home 引用，重启被现有 Worker 校验拒绝。最终包改为无祖先 node_modules 的隔离临时输出目录，增加 ancestry Gate；Harness、profile、App 语义保持原样。

## Production roots

| package | resolved version | production reason |
|---|---|---|
| @deepseek-ai/dsh | 0.1.2-alpha.1 | OFFICIAL_DSH_CLI_PRODUCTION_BIN |
| @deepseek-ai/dsh-agent-presets | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-api-remotes | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-api-session-controller | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-api-settings-controller | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-api-workspace-controller | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-base | 0.1.2-alpha.1 | PRODUCTION_PROFILE_BUNDLE |
| @deepseek-ai/dsh-client-connection | 0.1.2-alpha.1 | SHACO_OWNED_BOOTSTRAP_RUNTIME_IMPORT |
| @deepseek-ai/dsh-file-reference-local | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-host-directory-picker-browse | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-session-reference | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-tool-subagent | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @deepseek-ai/dsh-workspace | 0.1.2-alpha.1 | PRODUCTION_PROFILE_INSERT_PLUGIN |
| @shaco-forge/harness-bootstrap | 1.0.0-dev.1 | PRODUCTION_PROFILE_BUNDLE; PRODUCTION_PROFILE_INSERT_PLUGIN |

每个 root 的 source path、manifest SHA、真实 entry path、entry SHA 和 specifier 均在 [production-roots.json](runs/package-runtime-4/production-roots.json)。

## Dependency closure and excluded content

闭包：505 个解析包身份 / 523 个物理目录 / 2398 条生产边；闭包外包 = 0。稳定 graph SHA-256：`8c0597350fd1fc6e0604575dc5e8bb27911ddbd6b1f780a38e05f2d9be85cb40`。完整来源、版本、父链、排除包、optional skip、裁剪理由见 [closure](runs/package-runtime-4/harness-production-closure.json)。

| measurement | previous | corrective |
|---|---:|---:|
| 顶层包目录 | 803 | 493 |
| 全部包目录（含嵌套） | 863 | 523 |
| 唯一 name/version | 829 | 505 |
| Harness package bytes | 1176545005 | 217709790 |
| Release bytes（不含 identity envelopes） | 1647659038 | 688823925 |
| Release files（同口径） | 44240 | 25847 |

独立重新计算移除了 330 个不可达旧目录（324 个唯一 name/version），共 922280576 bytes。旧库存采用封存 file manifest，校验旧 package manifest SHA，bytes 归属最近包目录；没有使用 Reviewer 312/908MB 作常量。另裁剪 2276 个来源文件 / 26418501 bytes（按来源包计算，非重复物化目录总量）。四个禁止包 vitest、vite、@vitest/coverage-v8、@deepseek-ai/dsh-agent-loop-testkit 均 ABSENT。详见 [package-comparison.json](package-comparison.json)。

## Runtime and artifact identities

@electron/packager@18.3.6、Electron 35.7.5、bundled Node 22.19.0、@deepseek-ai/dsh@0.1.2-alpha.1 / cd5ef8148158c3a752a658978873241fdf8e2bbc 均保持，真实 dsh --profile shaco-forge 启动、受控 DSH_HOME 和 artifact integrity PASS。Frozen Contract SHA 35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76 未变。

- [release-manifest.json](runs/package-runtime-4/release-manifest.json): SHA-256 `2e1f2e203f5ceb09d0c3c9e8268db73ca9c3f81e4213e35f7c1df2883247a05d`
- [packaged-files.json](runs/package-runtime-4/packaged-files.json): SHA-256 `129db0f340b15791b90b5b22ba6a78affa087c7a9167e020eea8ab331096fdf6`
- [artifact-identity.json](runs/package-runtime-4/artifact-identity.json): SHA-256 `41b428c31b6b0c04e7c3a7a7d85bd0d60a599287af228049fedab9b53de95896`
- [source-inventory.json](runs/package-runtime-4/source-inventory.json): SHA-256 `0562c111dbea6afb68be52de3d287f3db7f79cc3254806566466023d43684f07`
- [production-roots.json](runs/package-runtime-4/production-roots.json): SHA-256 `eeda0597eeaf87e8433c6c44677d6fd61425121cdb2a964e65a3d4ae6cfebd53`
- [harness-production-closure.json](runs/package-runtime-4/harness-production-closure.json): SHA-256 `3c773c8c2831796cfb768e4ca0a4263ce3d769ac5120264ad0cb9be3d04c02db`

Artifact digest：`b84beea0575404242b3979bd260cb3f98ed6c443ba9e71789e6f799c8f409b05`。

最终包位置：`C:\Users\18902\AppData\Local\Temp\shaco-forge-s3s1-packages\1789127875464\output\Shaco Forge-win32-x64`。旧 artifact 679a92171c047f70b4d607d066f922ec0153d3f516a2fafbef9198d41ab7c2aa 仅为历史失败候选；原 FOUNDATION-01 Evidence 未修改。

## Final 18 gates

以下全部为本 Corrective 重新执行的 PASS，绑定同一 source inventory `0562c111dbea6afb68be52de3d287f3db7f79cc3254806566466023d43684f07`（142 个源文件）。额外 composition freeze 只封存测试 composition evidence，不是 Step1 baseline freeze。

| command | attempt | exit code | result | evidence |
|---|---:|---:|---|---|
| typecheck | 2 | 0 | PASS | [log](logs/typecheck-2.log) |
| build | 2 | 0 | PASS | [log](logs/build-2.log) |
| test | 2 | 0 | PASS | [log](logs/test-2.log) |
| verify:static | 2 | 0 | PASS | [log](logs/verify-static-2.log) |
| verify:theme | 2 | 0 | PASS | [log](logs/verify-theme-2.log) |
| smoke:worker | 2 | 0 | PASS | [log](logs/smoke-worker-2.log) |
| smoke:carrier | 2 | 0 | PASS | [log](logs/smoke-carrier-2.log) |
| smoke:electron | 2 | 0 | PASS | [log](logs/smoke-electron-2.log) |
| smoke:failure | 2 | 0 | PASS | [log](logs/smoke-failure-2.log) |
| smoke:slice2-step1 | 2 | 0 | PASS | [log](logs/smoke-slice2-step1-2.log) |
| smoke:slice2-step2 | 2 | 0 | PASS | [log](logs/smoke-slice2-step2-2.log) |
| smoke:slice2-step3 | 2 | 0 | PASS | [log](logs/smoke-slice2-step3-2.log) |
| smoke:slice2-step3-interactions | 2 | 0 | PASS | [log](logs/smoke-slice2-step3-interactions-2.log) |
| test:full-shaco | 2 | 0 | PASS | [log](logs/test-full-shaco-2.log) |
| smoke:full-shaco | 2 | 0 | PASS | [log](logs/smoke-full-shaco-2.log) |
| package:runtime | 4 | 0 | PASS | [log](logs/package-runtime-4.log) |
| test:packaged-runtime | 3 | 0 | PASS | [log](logs/test-packaged-runtime-3.log) |
| smoke:packaged-runtime | 2 | 0 | PASS | [log](logs/smoke-packaged-runtime-2.log) |

专项测试覆盖 A-M：root inventory 稳定、实际包全部可达/无额外包、dev-only 不进入、required peer、optional policy、必需缺失/错误歧义身份 fail closed、四禁止包、无测试目录泄漏、真实 CLI 启动、Node/Harness identity、artifact integrity。测试异常时不会用旧 PASS 替代。

## Failures and cleanup

[failed-attempts.json](failed-attempts.json) 保留三次闭包诊断失败、两次桌面启动超时、diagnostic 限制和重叠失败、真实 restart 拒绝原因及后续重跑。重叠诊断的 exitCode 1 Explorer receipt 仍在；竞态复用了日志路径，所谓 precondition-failure.log 实为另一诊断输出，原样保留并明确说明这一限制，没有伪造缺失日志。ledger 现已增加互斥锁，所有最终 Gate 严格串行。

[final-cleanup.json](final-cleanup.json) 与各 smoke cleanup receipt 证明无剩余 authority/Product 进程、新建测试 home 已移除。截图归档到新 Evidence；中间/最终 package 和诊断构建作为可复核产物保留。Provider = 0，Signing = 0。

## Modified files and governance

- [scripts/harness-production-closure.mjs](../../../../../../scripts/harness-production-closure.mjs)
- [scripts/harness-production-closure.test.mjs](../../../../../../scripts/harness-production-closure.test.mjs)
- [scripts/package-runtime.mjs](../../../../../../scripts/package-runtime.mjs)
- [scripts/packaged-runtime.test.mjs](../../../../../../scripts/packaged-runtime.test.mjs)
- [scripts/smoke-packaged-runtime.mjs](../../../../../../scripts/smoke-packaged-runtime.mjs)
- [scripts/slice3-step1-command.mjs](../../../../../../scripts/slice3-step1-command.mjs)
- [scripts/windows-desktop-test.ps1](../../../../../../scripts/windows-desktop-test.ps1)
- [scripts/verify-slice3-step1-evidence.mjs](../../../../../../scripts/verify-slice3-step1-evidence.mjs)

另新增本 finding Evidence、[Corrective Implementation Record](../../../../V1-SLICE-3-STEP1-PACKAGE-CONTENT-CLOSURE-CORRECTIVE-IMPLEMENTATION-RECORD.md) 和 [REVIEW-029](../../../../../05-reviews/architecture/AUDIT-029-V1-SLICE-3-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md)；同步 Current State、Document Map、Development Map、Development Log、Review Index、Current Checkpoint。没有修改 apps/**、packages/**、package manifest/lock、Frozen Contract、Frozen Harness 或历史 Evidence。所有修改文本须由 final-validation 验证 UTF-8 无 BOM、无乱码。

NF1/NF3 = READY_FOR_OWNER_CLOSURE；NF4 = DEFERRED_TO_SLICE3_STEP3 / NOT_CLOSED，MAX_JSON_FRAME=262144；F05 = OPEN_KNOWN_CONSTRAINT / PENDING_ARCHITECTURE_OWNER_ACCEPTANCE。Step2/Step3、Provider、Signing 均未授权。完整状态见 [governance-final-state.json](governance-final-state.json)。

## Git, scope and next action

Entry HEAD：bdf0cbfeade58ae288ece1b8b94ba5c91346c97a。只允许一个新的本地 corrective commit，不 push、不改写历史。为避免自引用，候选 SHA 取包含本记录的单一 commit；提交后运行 node scripts/verify-slice3-step1-evidence.mjs --candidate，逐字节比较 candidate 的 142 个 source inventory 文件，验证 entry ancestry、恰好一个新 commit 和 Git CLEAN，实际 SHA 由 Executor 最终回报。提交前一致性结果见 [final-validation.json](final-validation.json)。

SCOPE_EXPANSION = NO。仍待独立 targeted re-review 和 Owner closure；NF4、F05 及 Step2/Step3/Fresh Windows 维持原边界。本结果为 Corrective Executor PASS，不是 Step1 独立复审 PASS。

READY_FOR_TARGETED_INDEPENDENT_REREVIEW = YES。V1_CURRENT_NEXT_ACTION = TARGETED_INDEPENDENT_REREVIEW_V1_SLICE_3_STEP1_S3S1_IR_001_CORRECTIVE。Executor 在本地候选提交和只读一致性验证完成后立即停止。

补充证据：[closure-determinism-recheck.json](closure-determinism-recheck.json) 从真实 entry 再发现 roots，并重算全部物理图，证明最终图与保存证据一致、两次隔离 attempt 的语义图摘要相同。专项打包测试为 37/37 PASS、0 skipped。命令原始字节见 [raw-command-log-bytes.json](raw-command-log-bytes.json)，显示日志仅规范化行尾与尾部空白。

第一轮 18 个命令虽然 PASS，后续内容 census 仍发现测试产物，因此没有被最终接受；[content-pruning-diagnostic-4.json](content-pruning-diagnostic-4.json) 记录补充裁剪及公开 testing/mock API 的保留理由。前三次补充诊断由 guard 拦住误删公开入口、未排除 benchmark 和误删运行时 spec.js，全部保留。最终全部 18 Gate 已在补全规则后的源码再次重跑。中间清理的晚期断言失败及两处空目录恢复记录见 [intermediate-cleanup-cycle-1-recovery.json](intermediate-cleanup-cycle-1-recovery.json)；原始临时根列表未落盘这一限制已明确记录，最终清理改为逐步落盘。
