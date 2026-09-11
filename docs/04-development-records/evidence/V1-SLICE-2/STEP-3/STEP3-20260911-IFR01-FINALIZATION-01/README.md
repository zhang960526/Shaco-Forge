# F-IFR-01 Finalization Evidence

FINALIZATION_RESULT = PASS_WAITING_INDEPENDENT_REREVIEW

F_IFR_01 = CORRECTIVE_FINALIZED_WAITING_INDEPENDENT_REREVIEW

INDEPENDENT_FINAL_REVIEW = FAIL。Review 事实为 OWNER_INPUT_ONLY；本轮未执行独立复审，未关闭 Finding/Step3/Slice2。Visual Polish 非阻断延后至 V1 final polish。

本目录只保存本轮新 Evidence，不复制历史 507 份证据。正式实施记录仍为[既有 Full Shaco Implementation Record §AO](../../../../V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md#ao-f-ifr-01-finalization)。

## Baseline and source

master / 5118053f625d01faba6617cace481df3091ba5be；entry tracked modified=33、expanded untracked=639、staged=0；上一轮 corrective 文件无漂移。[baseline.json](baseline.json) 保留 Owner request SHA、真实 Git/Harness baseline；最终按 1212 个 entry 文件哈希核对外部修改和历史资产保护。

Production internal eventId dependency、$events/result settlement correlation、private waterfall listener 均 NONE；public pending.answer 保留。新增的唯一 source/test 补强是相对 packages/**/src 私有导入规则及负向用例，没有业务/UI/Harness 修改。[production-reachability.json](production-reachability.json) 覆盖 21 个 Product source、传递依赖、静态负向测试和真实构建的 transport bootstrap。

## Controlled Composition

通过项目现有 `node scripts/step3-final-composition.mjs --freeze` 生成一次。冻结前七项验证全部 PASS，128 个 fingerprinted source 固定。

| Field | Value |
|---|---|
| Frozen time | 2026-09-11T02:10:07.097Z |
| Rows | 28 Harness + 1 Shaco = 29 |
| Identity SHA256 | ff48f2ec3cb4e618c734e8a189c1219169ca9ab83faa38ee1bfb57a0e29733f5 |
| Source fingerprint | b300307dc2e776d8d2b5dbd16e0d3de0f7ce4a1a592778d40cb1db645a980811 |
| Manifest SHA256 | b1bb7d6b080b6b5eebe8578a810b231a28dc2624d464fa8100b8df273f8ded8d |
| Shaco row SHA256 | c5ca982077b5e48c4693340a6baf774779e781529386ef4eb51703902241850d |
| Bootstrap SHA256 | 4e5e67c4dd9f6c19c7470f5a4c97074fd9cf08eb89734e27111a2d80bc8dbe57 |
| Application SHA256 | 3b907282bbe13229bdcecbc93117be310fc558c9c853b1c425fdb3d6e866238e |
| Main SHA256 | 881dd2295a895a4ae02e1014698e183e742cdb05bfcf58c2d8a47ed8c5888bfc |
| Product transport bootstrap SHA256 | 1388b50730e36577f3fb3d71da36d6ebe08e25570150ff7d84a48cb1f6650729 |

28 Harness rows 与原 pins 逐项一致。Manifest/Shaco UI row/Main 等哈希保持不变：修正发生在独立 transport bootstrap 与源码边界，而非 UI row。新 identity/source fingerprint 代表当前 candidate；旧 identity 330340db5517f5521f5f96245501f06164264622fcef3de2ce2447d48fdc5774 为 HISTORICAL_SUPERSEDED_BY_F_IFR_01_CORRECTIVE，其 Evidence 原字节保留。

[source-stabilization.json](source-stabilization.json) · [composition-identity.json](composition-identity.json) · [composition-final-summary.json](composition-final-summary.json)。

## Actual commands and attempts

固定 Node 22.19.0 / pnpm 11.7.0。每条 final command 前后均执行 source guard 和正式 verifyFrozen；全部冻结检查 PASS。七项 preflight PASS；15 个 final commands 最新 attempt 全部 PASS。所有 final PASS 均发生在新 freeze 之后。

| Phase | Exact command | Attempt | Exit / result | Evidence |
|---|---|---:|---|---|
| preflight | `pnpm run typecheck` | 1 | 0 / PASS | [log](logs/preflight-typecheck-1.log) |
| preflight | `pnpm run build` | 1 | 0 / PASS | [log](logs/preflight-build-1.log) |
| preflight | `pnpm test` | 1 | 0 / PASS | [log](logs/preflight-test-1.log) |
| preflight | `pnpm run verify:static` | 1 | 0 / PASS | [log](logs/preflight-verify-static-1.log) |
| preflight | `pnpm run verify:theme` | 1 | 0 / PASS | [log](logs/preflight-verify-theme-1.log) |
| preflight | `pnpm run test:full-shaco` | 1 | 0 / PASS | [log](logs/preflight-test-full-shaco-1.log) |
| preflight | `node --test apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/tests/full-shaco-boundaries.test.mjs scripts/step3-interaction.test.mjs scripts/step3-fixture-boundaries.test.mjs scripts/user-loop-policy.test.mjs` | 1 | 0 / PASS | [log](logs/preflight-focused-1.log) |
| freeze | `node scripts/step3-final-composition.mjs --freeze` | 1 | 0 / PASS | [log](logs/freeze-controlled-composition-1.log) |
| final | `pnpm run typecheck` | 1 | 0 / PASS | [log](logs/final-typecheck-1.log) |
| final | `pnpm run build` | 1 | 0 / PASS | [log](logs/final-build-1.log) |
| final | `pnpm test` | 1 | 0 / PASS | [log](logs/final-test-1.log) |
| final | `pnpm run verify:static` | 1 | 0 / PASS | [log](logs/final-verify-static-1.log) |
| final | `pnpm run verify:theme` | 1 | 0 / PASS | [log](logs/final-verify-theme-1.log) |
| final | `pnpm run test:full-shaco` | 1 | 0 / PASS | [log](logs/final-test-full-shaco-1.log) |
| final | `pnpm run smoke:worker` | 1 | 0 / PASS | [log](logs/final-smoke-worker-1.log) |
| final | `pnpm run smoke:carrier` | 1 | 0 / PASS | [log](logs/final-smoke-carrier-1.log) |
| final | `pnpm run smoke:electron` | 1 | 0 / PASS | [log](logs/final-smoke-electron-1.log) |
| final | `pnpm run smoke:failure` | 1 | 0 / PASS | [log](logs/final-smoke-failure-1.log) |
| final | `pnpm run smoke:slice2-step1` | 1 | 1 / FAIL | [log](logs/final-smoke-slice2-step1-1.log) |
| final | `pnpm run smoke:slice2-step1` | 2 | 0 / PASS | [log](logs/final-smoke-slice2-step1-2.log) |
| final | `pnpm run smoke:slice2-step2` | 1 | 0 / PASS | [log](logs/final-smoke-slice2-step2-1.log) |
| final | `pnpm run smoke:slice2-step3` | 1 | 0 / PASS | [log](logs/final-smoke-slice2-step3-1.log) |
| final | `pnpm run smoke:slice2-step3-interactions` | 1 | 0 / PASS | [log](logs/final-smoke-slice2-step3-interactions-1.log) |
| final | `pnpm run smoke:full-shaco` | 1 | 0 / PASS | [log](logs/final-smoke-full-shaco-1.log) |

唯一失败为 Step1 attempt 1：runner 误选 Windows PowerShell 5，NamedPipeServerStreamAcl 探测失败，未启动该项 runtime。改用经 API probe 验证的 PowerShell 7 后 attempt 2 PASS；此根因有效修正 1 次，仅 Evidence runner 环境变化，无 fingerprinted source 变化/Composition supersession。失败日志完整保留，参见 [corrective-history.json](corrective-history.json)。

## Preservation, Provider and cleanup

[preservation.json](preservation.json) 汇总真实 Host Approval/Question 的 Desktop cold rebuild、public pending.answer、settlement=1、stale rejected、duplicate/auto-answer/replay/cancel=0，以及双模板 selector 的五轮 BRAUN→FAMICOM→BRAUN/绑定连续性。light/dark/system 由现有 final unit/static 验证。新截图是自动回归输出，视觉实现/recipe/参考图全部保留 entry 字节。

Provider runs=0，未调用真实模型、Provider discovery、Agent driver 或外部 Tool。各 smoke cleanup 与 [process-cleanup.json](process-cleanup.json) 确认本任务残留进程=0；entry 已存在进程保留，未执行广泛终止。

## Final audit and project state

[final-audit.json](final-audit.json) 给出相对本轮 entry 的实际文件、最终 Git、Frozen Harness、历史 Evidence/视觉保护、UTF-8/乱码及 redaction 核验。Frozen Harness cd5ef8148158c3a752a658978873241fdf8e2bbc CLEAN/READ_ONLY；无 Stage/Commit/Push，无 reset/clean/stash/checkout 覆盖。

UI_G14 = IMPLEMENTATION_PASS_WAITING_INDEPENDENT_REREVIEW

VISUAL_ACCEPTANCE = PASS_FROM_FAILED_FINAL_REVIEW

V1_VISUAL_POLISH = DEFERRED_NON_BLOCKING_TO_V1_FINAL_POLISH

V1_SLICE_2_STEP3 = IMPLEMENTED_WAITING_INDEPENDENT_REREVIEW

STEP3_CLOSURE = NO；SLICE2_CLOSURE = NO；PROVIDER_GATE_AUTHORIZATION = NO。

NEXT_ACTION = INDEPENDENT_REREVIEW_F_IFR_01_FULL_SHACO_DUAL_THEME_STEP3

本轮完成后停止；不进行独立复审、UI Polish、Slice3 或 Commit/Push。独立复审尚未执行是剩余门槛；构建仅有既有 classic-script/chunk-size 非阻断提示。
