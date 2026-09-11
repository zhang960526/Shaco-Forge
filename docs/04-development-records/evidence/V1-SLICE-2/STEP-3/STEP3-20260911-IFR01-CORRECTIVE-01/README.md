# F-IFR-01 Source Corrective Evidence

Date: 2026-09-11。此目录仅保存本轮 corrective 的最小独立 Evidence；实施 authority 仍是[既有 Full Shaco Implementation Record §AN](../../../../V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md#an-f-ifr-01-source-corrective)。

## A. CORRECTIVE VERDICT

CORRECTIVE_RESULT = APPLIED_FOCUSED_VERIFIED

F_IFR_01_CORRECTIVE = APPLIED_FOCUSED_VERIFIED_PENDING_FINAL_SOURCE_FREEZE_AND_REREVIEW

INDEPENDENT_FINAL_REVIEW = FAIL；F-IFR-01 尚未 CLOSED。Review 事实来自 Owner 输入，唯一 HIGH_BLOCKING Finding；Visual Acceptance PASS、Direction Alignment ALIGNED。没有执行独立复审，也不虚构 Review artifact。

## B. BASELINE

master / 5118053f625d01faba6617cace481df3091ba5be；tracked modified=26，expanded untracked=622，staged=0。[baseline.json](baseline.json) 记录 entry 与 finding provenance。先对 1195 个既有 Git 可见文件记录哈希，最终逐文件核验，无覆盖既有 candidate。

## C. ROOT CAUSE

BUSINESS_RUNTIME_DEPENDENCY = NO。私有 ID 只为历史 Evidence/telemetry 关联使用；业务回答依赖 Harness 当前 public pending object，未使用 observer 的 interactions。

## D. PRODUCTION DEPENDENCY BEFORE

Renderer → transport.ts → createUserLoopObserver() → user-loop-evidence.ts → $events waterfall / item.eventId → map → $events/result / args.eventId → settlement statistics。

## E. ACTUAL CORRECTIVE

方案 A：删除 interaction map/数组、eventHash、私有 ID 读取与 settlement request/response 分支。transport 仅向 observer 传递 session/follow；普通 public diagnostics 保留。global.d.ts 的 ReturnType 自动收敛，无改动。旧 Slice1C runner/policy 只兼容可选历史 telemetry，当前 Tool/stream proof 不要求该字段，也不代替 Approval/Question proof。

## F. PRODUCTION DEPENDENCY AFTER

| 边界 | 当前结果 |
|---|---|
| Shaco production internal eventId dependency | NONE |
| Shaco $events/result settlement correlation | NONE |
| Shaco waterfall observer/listener | NONE |
| public pending.answer | 保留，唯一业务回答入口 |
| generic transport / $events ready | 保留，原样转发与就绪计数 |
| Main recovery 的 $events/result mutation-denial entry | 未修改；不是 settlement correlation |
| Frozen Harness 内部协议 | 由 Harness 自己实现，不属于本次删除范围 |

[production-reachability.json](production-reachability.json) 包含 21 个源文件的 UI-G14 扫描与实际构建的 Product shell-bootstrap.js SHA/扫描结果。现有私有 stale/duplicate probes 仍位于 test-only entry，生产 import graph 不可达。

## G. APPROVAL / QUESTION EVIDENCE PATH

uiSession.pendingInteractions → 当前确切 pending 对象 → pending.answer；Host fixture 通过 approval.request / userQuestions.ask 与自身 pending/settlements/failures counters 验证 public settlement behavior。focused 执行真实冻结 public client exports 的 pending 重建/单次回答/重复拒绝测试、Shaco pending fencing、fixture profile 隔离测试。现有 Real Host fixture 保持字节不变；真实 Host/Desktop cold rebuild smoke 本轮未运行，其既有结果保留为历史事实，最终必须重跑。

## H. UI-G14 STATIC COVERAGE

递归 client/**、renderer/**，含 transport、evidence、global types、shell/shaco bootstrap、lifecycle、main 与 theme 子目录；继续追踪本地 import/re-export/dynamic import/require。用 AST 检查 eventId（含解构、方括号与字面拼接）、$events/result、waterfall type/listener、private runtime imports 和可达 test fixture。Harness public specifier 经冻结 exports resolve；注释、文档、历史 Evidence 和未被生产导入的 tests 不进入此规则。负向测试证明跨 seeded roots 的生产依赖仍被检查。

## I. FILES MODIFIED / ADDED

本轮 source/tests/scripts/docs 共 18 个实际变更（17 个既有文件修改、1 个 source 新增），完整相对 entry 路径及 before/after SHA 见 [final-audit.json](final-audit.json)。新增 source 为 scripts/production-boundary.mjs。

Production：transport.ts、user-loop-evidence.ts。测试：user-loop-evidence.test.ts、transport.test.ts、full-shaco-boundaries.test.mjs、user-loop-policy.test.mjs。验证/兼容：verify-static.mjs、production-boundary.mjs、user-loop-policy.mjs、electron-user-loop.mjs。文档：Current State、Document Map、Development Map、Development Log、Current Checkpoint、Full Shaco Contract、Direction Decision、既有 Implementation Record。没有 UI/主题/参考图修改。

## J. FOCUSED TESTS

精确命令、每次 argv/attempt/exit/result、时间与日志索引均保存在 [focused-tests.json](focused-tests.json)。全部 attempts exit 0；未隐藏失败。

| Command | Attempts | Exit / result |
|---|---:|---|
| node node_modules/typescript/bin/tsc -p apps/desktop/tsconfig.test.json | 1 | 0 / PASS |
| node --test apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/tests/full-shaco-boundaries.test.mjs apps/desktop/tests/presentation-actions.test.mjs scripts/step3-interaction.test.mjs scripts/step3-fixture-boundaries.test.mjs | 1 | 0 / PASS，41/41 |
| node --test apps/desktop/dist-tests/tests/user-loop-evidence.test.js apps/desktop/dist-tests/tests/transport.test.js apps/desktop/tests/full-shaco-boundaries.test.mjs apps/desktop/tests/presentation-actions.test.mjs scripts/step3-interaction.test.mjs scripts/step3-fixture-boundaries.test.mjs scripts/user-loop-policy.test.mjs | 2 | 0 / PASS，71/71 |
| pnpm run typecheck | 1 | 0 / PASS |
| pnpm run build | 1 | 0 / PASS |
| pnpm test | 1, 2 | 0 / PASS，182/182 → 183/183 |
| pnpm run verify:static | 1, 2 | 0 / PASS |
| pnpm run test:full-shaco | 1 | 0 / PASS，17/17 |

focused attempt 2 增加 user-loop-policy tests；源码扫描新增 transitive fixture 负向测试、旧 runner 可选 telemetry 兼容后复跑。固定 Node 22.19.0 / pnpm 11.7.0，Harness root 使用只读既有仓库。runner 仅允许列出的 focused/script commands；没有 smoke/Provider/Composition 入口。普通 build 及 pnpm test 自带 build 刷新可丢弃构建产物，不生成新的 final composition identity。

## K. PROVIDER RUN COUNT

0；PROVIDER_GATE_AUTHORIZATION=NO。真实 Prompt/model call/Provider discovery/Agent turn/external Tool 均未执行。

## L. FROZEN HARNESS

cd5ef8148158c3a752a658978873241fdf8e2bbc；entry/final CLEAN / READ_ONLY。只使用命令局部 safe.directory 读取 Git，无全局配置修改。没有修改 Harness。

## M. OLD COMPOSITION STATUS

PRE_IFR01_COMPOSITION = HISTORICAL_SUPERSEDED_BY_IFR01_SOURCE_CORRECTIVE

identity=330340db5517f5521f5f96245501f06164264622fcef3de2ce2447d48fdc5774；source fingerprint=37fa23dc6a9f5cf24e829fb1424d7438f32c81e9182076dcadd97008b5568b0f；manifest=b1bb7d6b080b6b5eebe8578a810b231a28dc2624d464fa8100b8df273f8ded8d。历史 Evidence 均保持字节。

## N. NEW COMPOSITION

NOT GENERATED / PENDING FINAL SOURCE STABILIZATION

FINAL_REPLACEMENT_COMPOSITION = PENDING_FINAL_SOURCE_STABILIZATION

## O. DOCUMENTATION

Current State 为唯一 current authority；Development Log/Map、Document Map 和交接指针同步，Contract/Direction Decision 仅更新实施与 Gate 状态。本 corrective 在既有 Implementation Record §AN 追加，并标明 A–AM 为历史候选记录，没有新建平行实施记录。所有新增/修改文本 UTF-8 without BOM，修改文件无指定乱码标记。

## P. FINAL GIT STATE

master / 原 HEAD 不变。最终 tracked/untracked/staged 与本轮完整文件列表见 [final-audit.json](final-audit.json)。Stage/Commit/Push=NO；reset/clean/stash/checkout 覆盖均未执行。历史 Evidence、视觉资产、UI 实现、既有 Real Host fixtures 的字节保护在 audit 中单独核验。

## Q. UNRESOLVED RISKS

本轮只证明 source corrective 与 focused verification。Final source freeze、Controlled Composition、完整 Step1/2/3 Runtime Regression、Real Host final smoke、Independent Re-review 均 NOT_RUN。构建保留既有 classic script/chunk size 非阻断提示。F-IFR-01、Step3、Slice2 均未关闭；不能将本轮 PASS 当作最终 Runtime Gate PASS。

## R. NEXT ACTION

ARCHITECTURE_OWNER_ASSESS_IFR01_CORRECTIVE_AND_PLAN_VISUAL_POLISH

本轮完成后停止；不开始 UI Polish，不生成 Composition，不运行 full final regression，不执行独立复审，不 Commit/Push。
