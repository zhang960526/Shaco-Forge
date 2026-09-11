// Run only after all final gates and cleanup. Documentation is outside source inventory.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve } from 'node:path'

const evidence = import.meta.dirname
const root = resolve(evidence, '../../../../../..')
const slash = path => path.replaceAll('\\', '/')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const read = async path => JSON.parse(await readFile(path, 'utf8'))
const json = value => JSON.stringify(value, null, 2) + '\n'
const write = (path, value) => writeFile(path, value, 'utf8')
const link = (from, target) => slash(relative(from, target))
const entry = 'bdf0cbfeade58ae288ece1b8b94ba5c91346c97a'
const required = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'test:full-shaco', 'smoke:full-shaco', 'package:runtime', 'test:packaged-runtime', 'smoke:packaged-runtime']
const summary = await read(join(evidence, 'test-summary.json'))
const location = await read(join(root, 'dist/packaged-runtime-location.json'))
const packageResult = await read(join(location.evidence, 'package-result.json'))
const release = await read(join(location.evidence, 'release-manifest.json'))
const closure = await read(join(location.evidence, 'harness-production-closure.json'))
const inventory = await read(join(location.evidence, 'packaged-files.json'))
const source = await read(join(location.evidence, 'source-inventory.json'))
const cleanup = await read(join(evidence, 'final-cleanup.json'))
assert.equal(cleanup.result, 'PASS')
const determinism = await read(join(evidence, 'closure-determinism-recheck.json'))
assert.equal(determinism.result, 'PASS')
assert.equal(determinism.deterministicGraphSha256, closure.deterministicGraphSha256)
assert.equal((await read(join(evidence, 'final-content-census.json'))).result, 'PASS')
const sourceIdentity = release.BuildProvenance.sourceInventorySha256
const gates = required.map(command => {
  const row = summary.commands.filter(row => row.command === command).at(-1)
  assert.equal(row?.exitCode, 0, command)
  assert.equal(row.phase, 'FINAL_REGRESSION', command)
  assert.equal(row.sourceBefore, sourceIdentity, command)
  assert.equal(row.sourceAfter, sourceIdentity, command)
  return { command, attempt: row.attempt, exitCode: row.exitCode, result: 'PASS', evidence: row.log, sourceIdentity }
})
const packagedTestLog = await readFile(join(evidence, gates.find(row => row.command === 'test:packaged-runtime').evidence), 'utf8')
const packagedTests = Object.fromEntries(['tests', 'pass', 'fail', 'skipped'].map(name => [name, Number(packagedTestLog.match(new RegExp(`^# ${name} (\\d+)$`, 'm'))?.[1])]))
assert.ok(packagedTests.pass > 0)
assert.equal(packagedTests.fail, 0)
assert.equal(packagedTests.skipped, 0)
assert.equal(packagedTests.pass, packagedTests.tests)
const previous = closure.previousCandidateComparison
const metrics = {
  previousTopLevelPackageCount: previous.previousTopLevelPackageCount,
  previousAllPackagePlacements: previous.previousPackageCount,
  previousUniqueNameVersionCount: previous.previousUniqueNameVersionCount,
  newTopLevelPackageCount: closure.placements.filter(row => !row.path.includes('/node_modules/')).length,
  newAllPackagePlacements: closure.placements.length,
  newResolvedPackageIdentities: closure.packageCount,
  newUniqueNameVersionCount: closure.uniqueNameVersionCount,
  previousReleaseFileCount: previous.previousReleaseFileCount,
  newReleaseFileCount: inventory.files.length,
  previousReleaseBytes: previous.previousReleaseBytes,
  newReleaseBytes: packageResult.bytes,
  previousHarnessPackageBytes: previous.previousHarnessPackageBytes,
  newHarnessPackageBytes: inventory.files.filter(row => row.path.startsWith('harness/node_modules/')).reduce((n, row) => n + row.bytes, 0),
  unreachableOldPlacementsRemoved: previous.unreachableCount,
  unreachableOldUniqueNameVersionsRemoved: previous.unreachableUniqueNameVersionCount,
  unreachableOldBytesRemoved: previous.unreachableBytes,
  excludedOverlayTopLevelEntries: closure.excludedTopLevelPackages.length,
  contentPruningSourceFiles: closure.pruning.reduce((n, row) => n + row.excluded.length, 0),
  contentPruningSourceBytes: closure.pruning.reduce((n, row) => n + row.excludedBytes, 0),
  outsideClosure: closure.verification.outsideClosure,
  forbiddenPackages: Object.fromEntries(['@vitest/coverage-v8', 'vitest', 'vite', '@deepseek-ai/dsh-agent-loop-testkit'].map(name => [name, 'ABSENT'])),
  measurement: previous.measurement,
}
assert.equal(metrics.outsideClosure, 0)
for (const name of Object.keys(metrics.forbiddenPackages)) assert.ok(!closure.packages.some(row => row.name === name))
const files = {}
for (const name of ['release-manifest.json', 'packaged-files.json', 'artifact-identity.json', 'source-inventory.json', 'production-roots.json', 'harness-production-closure.json']) files[name] = { path: link(evidence, join(location.evidence, name)), sha256: hash(await readFile(join(location.evidence, name))) }
const failures = {
  policy: 'Every recorded failure remains a failure. Diagnostic capture/early development PASS does not satisfy any final gate.',
  ledgerFailures: summary.commands.filter(row => row.exitCode !== 0),
  rootDiagnostics: (await read(join(evidence, 'development-attempt-notes.json'))).rootDiagnosticAttempts,
  initialUnitDiagnostic: '13 fixture tests ran; original no-location actual-package case returned early and was initially reported PASS. Changed to explicit skip; final test:packaged-runtime executes the actual candidate case with location set.',
  developmentPackages: [1, 2].map(attempt => ({ attempt, result: 'DEVELOPMENT_ONLY_NOT_FINAL', reason: 'Source inventory changed while additional packaging verification code was being completed; retained package and manifests are not final acceptance.' })),
  regressionCycle1: { sourceIdentity: 'fb69db2cf42f880e956f5da11369f735a9c97126cb10ec2d79fd0f1e80d07bbd', packageAttempt: 3, commandResults: '18_COMMAND_PASS', acceptance: 'NOT_ACCEPTED_TEST_ONLY_CONTENT_CENSUS_FAIL', evidence: 'content-pruning-diagnostic-4.json', corrective: 'Exclude manifest/script-proven browser/system tests, unexported SDK test-support, standalone tape runners and benchmarks. Add safe-pruning guards for runtime src imports; retain public test-utils/testing/mock APIs and runtime spec.js. All final 18 gates rerun again after the source change.' },
  contentPruningDiagnostics: [1, 2, 3, 4].map(attempt => ({ attempt, evidence: `content-pruning-diagnostic-${attempt}.json`, result: attempt === 4 ? 'PASS_CORRECTED_CONTENT_PLANS' : 'FAIL_GUARD_CAUGHT_UNSAFE_OR_INCOMPLETE_PRUNING' })),
  intermediateCleanup: { evidence: 'intermediate-cleanup-cycle-1-recovery.json', initialResult: 'FAIL_LATE_HOME_ABSENCE_ASSERTION', recovery: 'PASS', limitation: 'Initial cleanup archived screenshots and removed generated temporary roots but did not persist the in-memory removed-root list before a late assertion. Two empty diagnostic directories created at 10:53:48Z remained in the caller filesystem view; identity/creation/empty checks preceded non-recursive removal. Exact unavailable directory names/counts are not invented; final cleanup now persists incremental receipts.' },
  desktopFailures: [
    { evidence: 'runs/packaged-startup-probe-1/dedicated-results.json', result: 'FAIL', cause: 'Ordinary Desktop startup timed out after direct Worker boot; no missing required production module reported.' },
    { evidence: 'runs/packaged-startup-probe-2/dedicated-results.json', result: 'FAIL', cause: 'Same timeout in ordinary current-user desktop context; context change alone did not solve it.' },
    { evidence: 'electron-integrity-diagnostic.json', result: 'DIAGNOSTIC_PASS_ONLY', conclusion: 'Electron artifact integrity validation completes; startup delay is not an integrity-check deadlock.' },
    { evidence: 'desktop-inspector-diagnostic.json', result: 'DIAGNOSTIC_LIMITATION', cause: 'Read-only inspector dynamic import evaluation returned ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING.' },
    { evidence: 'desktop-inspector-diagnostic-2.json', result: 'DIAGNOSTIC_INCOMPLETE', cause: 'Initial observation window ended before late detached Worker readiness; exact-identity authority recovery is recorded in diagnostic-authority-recovery.json.' },
    { evidence: 'desktop-launch-c4ba6dc782954fcc851996fa97b63648.json', result: 'FAIL', cause: 'Overlapping desktop diagnostic found an existing authority and failed its empty-authority precondition.', evidenceLimitation: 'Concurrent ledger writers reused the same attempt/log path. The durable Explorer receipt retains exitCode 1. The copied diagnostic-overlap-precondition-failure.log and diagnostic-overlap-observed-summary.json contain the other diagnostic result after the race, despite the log filename; they are preserved unchanged, not represented as raw failure output. Executor observed the failed precondition in tool output. A unique command.lock now forbids overlap.' },
    { evidence: 'desktop-inspector-diagnostic-3.json', result: 'DIAGNOSTIC_CAUSE_CAPTURED', cause: 'WORKER_AUTHORITY_FAILURE: startup exited.' },
    { evidence: 'restart-worker-diagnostic.json', result: 'FAIL', cause: 'DSH_HOME_MODULE_REFERENCE_REJECTED. Frozen profile peer healing found omitted optional typescript through development-repository ancestors and linked it outside the package.', corrective: 'Generate the package in an isolated output path with no ancestor node_modules; retain required-only peer closure and existing Harness/App semantics.' },
    { evidence: 'runs/packaged-startup-probe-3/dedicated-results.json', result: 'PASS_DEVELOPMENT_PROBE', conclusion: 'Isolated package passes Worker, ordinary Desktop and evidence-observer startup; final 18 gates still rerun separately.' },
  ],
  inspectionNotes: ['Entry Git ownership and rg wildcard inspection corrections are in entry-baseline.json.', 'A later attempted read of SHACO-FORGE-DOCUMENTATION-RULES.md failed because the actual indexed file is SHACO-FORGE-DOCUMENT-RULES.md; read corrected, no mutation.'],
  originalEvidence: 'S3STEP1-20260911-FOUNDATION-01 unchanged',
}
await write(join(evidence, 'failed-attempts.json'), json(failures))
await write(join(evidence, 'package-comparison.json'), json(metrics))
const finalState = {
  V1_SLICE_3: 'IN_PROGRESS', V1_SLICE_3_ARCHITECTURE_CONTRACT: 'FROZEN_FOR_IMPLEMENTATION',
  V1_SLICE_3_STEP1_INDEPENDENT_REVIEW: 'FAIL / HISTORICAL_PARENT_REVIEW', V1_SLICE_3_STEP1_REVIEW_BLOCKING_FINDINGS: 'S3S1-IR-001',
  S3S1_IR_001: 'CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW', V1_SLICE_3_STEP1: 'CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW',
  V1_SLICE_3_STEP1_CORRECTIVE_RESULT: 'PASS', V1_SLICE_3_STEP1_OWNER_CLOSURE: 'NOT_PERFORMED', V1_SLICE_3_STEP1_BASELINE: 'NOT_FROZEN',
  NF1_REVIEW_DISPOSITION: 'READY_FOR_OWNER_CLOSURE', NF3_REVIEW_DISPOSITION: 'READY_FOR_OWNER_CLOSURE',
  NF4_STATUS: 'DEFERRED_TO_SLICE3_STEP3 / NOT_CLOSED', MAX_JSON_FRAME: 262144,
  REVIEW_012_F_05: 'OPEN_KNOWN_CONSTRAINT', F05_SECURITY_DISPOSITION: 'PENDING_ARCHITECTURE_OWNER_ACCEPTANCE',
  V1_SLICE_3_STEP2: 'NOT_AUTHORIZED', V1_SLICE_3_STEP3: 'NOT_AUTHORIZED',
  PROVIDER_GATE_AUTHORIZATION: 'NO', PROVIDER_RUN_COUNT: 0, SIGNING_EXECUTION_AUTHORIZATION: 'NO', SIGNING_RUN_COUNT: 0,
  V1_CURRENT_NEXT_ACTION: 'TARGETED_INDEPENDENT_REREVIEW_V1_SLICE_3_STEP1_S3S1_IR_001_CORRECTIVE',
}
await write(join(evidence, 'governance-final-state.json'), json(finalState))
const review = join(root, 'docs/05-reviews/architecture/AUDIT-029-V1-SLICE-3-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md')
const record = join(root, 'docs/04-development-records/V1-SLICE-3-STEP1-PACKAGE-CONTENT-CLOSURE-CORRECTIVE-IMPLEMENTATION-RECORD.md')
const governance = (await read(join(evidence, 'entry-baseline.json'))).originalEncodings.map(row => row.path)
for (const name of governance) {
  const path = join(root, name)
  const bytes = await readFile(path)
  let text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  assert.ok(!bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])))
  const current = `<!-- SLICE3_STEP1_CURRENT_START -->\nOwner-supplied [REVIEW-029](${link(dirname(path), review)}) remains historical **FAIL**, with S3S1-IR-001 as its sole HIGH / BLOCKING finding. The authorized [closure corrective](${link(dirname(path), record)}) now has Executor PASS on all 18 rerun gates and stops at **CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW**. No targeted independent re-review or Owner closure has been executed. Original Executor PASS does not close Step1.\n\n\x60\x60\x60text\n${Object.entries(finalState).map(([key, value]) => `${key} = ${value}`).join('\n')}\n\x60\x60\x60\n<!-- SLICE3_STEP1_CURRENT_END -->`
  text = text.replace(/<!-- SLICE3_STEP1_CURRENT_START -->[\s\S]*?<!-- SLICE3_STEP1_CURRENT_END -->/, current)
    .replace('## Current - Slice3 Step1 Review FAIL / Corrective In Progress (2026-09-11)', '## Current - Slice3 Step1 Corrective Implemented / Waiting Targeted Re-Review (2026-09-11)')
    .replaceAll('The bounded corrective is in progress; its latest state is the current checkpoint at the top of this document.', 'The bounded corrective implementation and all 18 final gates passed; targeted independent re-review is pending as recorded in the current checkpoint at the top of this document.')
    .replace('The only authorized work is S3S1-IR-001 corrective implementation and its Executor validation; targeted independent re-review is a subsequent action, not executed by this Executor.', 'S3S1-IR-001 corrective implementation and Executor validation are complete. The next action is targeted independent re-review by a separate authorized reviewer; this Executor stops without performing it.')
    .replace('S3S1-IR-001 HIGH / BLOCKING accepted; bounded corrective authorized; no Step1 closure', 'S3S1-IR-001 HIGH / BLOCKING; corrective implemented waiting targeted re-review; historical verdict FAIL; no Step1 closure')
  if (name.endsWith('SHACO-FORGE-DOCUMENT-MAP.md')) {
    const anchor = '| [Slice3 Step1 Packaged Runtime Implementation Record]'
    const at = text.indexOf(anchor)
    assert.ok(at >= 0)
    text = text.slice(0, at) + `| [Slice3 Step1 Package Content Closure Corrective Implementation Record](${link(dirname(path), record)}) | S3S1-IR-001 production roots, dependency closure, final 18 reruns and corrective handoff; no independent re-review or closure authority |\n| [REVIEW-029 Step1 Independent Implementation Review](${link(dirname(path), review)}) | Owner-supplied DeepSeek Harness READ_ONLY FAIL; sole blocking finding S3S1-IR-001; original other PASS conclusions preserved |\n` + text.slice(at)
  }
  if (name.endsWith('DEVELOPMENT-LOG.md')) {
    text = text.replace('<!-- SLICE3_STEP1_CURRENT_END -->', `<!-- SLICE3_STEP1_CURRENT_END -->\n\n本次仅修复 S3S1-IR-001：从真实 CLI/profile/bootstrap 推导 ${closure.roots.length} 个 root，递归计算 ${closure.packageCount} 个包身份、${closure.edgeCount} 条生产边，只物化 ${closure.placements.length} 个可达目录。早期闭包解析失败、桌面启动超时、诊断并发冲突和祖先可选 peer 污染均保留在新 Evidence；隔离输出目录后，全部 18 个最终 Gate 在同一 source inventory 上重跑 PASS。新 artifact 为 ${packageResult.identity.digest}。当前只等待 targeted independent re-review，Step1 未关闭、未冻结。`)
  }
  // These authority documents entered as UTF-8 without BOM / LF.
  text = text.replaceAll('\r\n', '\n')
  assert.doesNotMatch(text, /\uFFFD|\u953F\u65A4\u62F7|\u00C3|\u00C2/)
  await write(path, text)
}
const rootRows = closure.roots.map(row => `| ${row.name} | ${row.version} | ${[...new Set(row.reasons.map(reason => reason.reason))].join('; ')} |`).join('\n')
const gateTable = '| command | attempt | exit code | result | evidence |\n|---|---:|---:|---|---|\n' + gates.map(row => `| ${row.command} | ${row.attempt} | ${row.exitCode} | ${row.result} | [log](${row.evidence}) |`).join('\n')
const identities = Object.entries(files).map(([name, value]) => `- [${name}](${value.path}): SHA-256 \x60${value.sha256}\x60`).join('\n')
const codeFiles = ['scripts/harness-production-closure.mjs', 'scripts/harness-production-closure.test.mjs', 'scripts/package-runtime.mjs', 'scripts/packaged-runtime.test.mjs', 'scripts/smoke-packaged-runtime.mjs', 'scripts/slice3-step1-command.mjs', 'scripts/windows-desktop-test.ps1', 'scripts/verify-slice3-step1-evidence.mjs']
const report = { correctiveVerdict: 'PASS', parentReviewId: 'REVIEW-029', parentReviewVerdict: 'FAIL / HISTORICAL_PARENT_REVIEW', finding: 'S3S1-IR-001', status: finalState.S3S1_IR_001,
  determinismProof: 'closure-determinism-recheck.json', finalContentCensus: 'final-content-census.json', finalPackagedRuntimeTests: packagedTests,
  rootCause: 'Unconditional enumeration/materialization of every non-symlink overlay top-level package before recursively adding dependencies.',
  roots: closure.roots, dependencyClosure: { algorithm: closure.policy, packageCount: closure.packageCount, packagedPlacements: closure.placements.length, edgeCount: closure.edgeCount, deterministicGraphSha256: closure.deterministicGraphSha256, evidence: files['harness-production-closure.json'] },
  excludedContent: metrics, packagingTool: release.PackagingTool, bundledNode: packageResult.nodeIdentity, harness: { package: release.HarnessPackage, commit: release.HarnessCommit, clean: true, readOnly: true },
  profile: release.ProductionProfileIdentity, controlledDshHome: 'PASS_CURRENT_USER_WINDOWS_KNOWN_FOLDER', manifests: files, artifactDigest: packageResult.identity.digest,
  modifiedCodeFiles: codeFiles, governanceFiles: governance, implementationRecord: link(root, record), reviewRecord: link(root, review), gates,
  failedAttempts: 'failed-attempts.json', final18GateRegression: 'PASS_ALL_RERUN_SAME_SOURCE_IDENTITY', sourceIdentity, sourceFileCount: source.length,
  cleanup: 'final-cleanup.json', providerRuns: 0, signingRuns: 0, evidenceRoot: evidence, finalState,
  git: { entryHead: entry, candidate: 'Resolve HEAD of the single local commit containing this record; exact SHA is reported after commit without rewriting evidence.', requiredCandidateCheck: 'Node 22.19.0 scripts/verify-slice3-step1-evidence.mjs --candidate', allowedNewCommits: 1, requiredFinalStatus: 'CLEAN', push: 'NO' },
  scopeExpansion: 'NO', remaining: ['Targeted independent re-review pending; no final Step1 PASS/closure/freeze.', 'NF1/NF3 remain reviewer recommendations for Owner closure.', 'NF4 deferred to Slice3 Step3; MAX_JSON_FRAME=262144 unchanged.', 'F-05 OPEN_KNOWN_CONSTRAINT / PENDING_ARCHITECTURE_OWNER_ACCEPTANCE.', 'Step2/Step3 and Fresh Windows not executed or authorized.', 'Diagnostic overlap raw-output limitation explicitly preserved in failed-attempts.json; durable exitCode 1 receipt retained.'],
  readyForTargetedIndependentRereview: true, packagedRoot: location.packagedRoot,
}
await write(join(evidence, 'final-report.json'), json(report))
await write(join(evidence, 'final-report.md'), `# S3S1-IR-001 Corrective Executor Final Report\n\nCORRECTIVE_VERDICT = PASS\n\nPARENT_REVIEW_ID = REVIEW-029; PARENT_REVIEW_VERDICT = FAIL / HISTORICAL_PARENT_REVIEW.\n\nS3S1_IR_001_STATUS = CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW. Step1 未关闭、未冻结。本 Executor 未执行 targeted independent re-review。\n\n## Root cause and implementation\n\n旧算法先复制整个 overlay 顶层包，再补依赖，导致不可达测试与开发包进入产品。新算法从官方 dsh bin、现有生成 profile 的 bundles、bootstrap cordis patch 插件和 Shaco bootstrap 实际 JS import 推导 roots。顶层枚举只用于排除清单。生产包按名称排序、广度优先和声明排序确定遍历；仅允许 dependencies、适用的 optionalDependencies、非 optional peerDependencies。缺少必需依赖/peer、错误名称/版本/来源、歧义身份均 fail closed。devDependencies 和 optional peers 不单独引入包。\n\n物化保持实际 Node 解析关系，版本冲突时嵌套放置。独立扫描每个最终物理包，核对 manifest SHA、可达路径、声明边和实际解析目标，拒绝额外包和测试内容。保留 runtime manifest/import 引用的 src 与 LICENSE，裁剪可确认的 test/fixture/coverage、构建状态和开发配置；无 JS 重写、bundle 或 Harness patch。\n\n早期桌面失败还暴露了验证目录的祖先 node_modules 污染：Frozen Harness 的 optional peer healing 可找到仓库 typescript，生成外部 home 引用，重启被现有 Worker 校验拒绝。最终包改为无祖先 node_modules 的隔离临时输出目录，增加 ancestry Gate；Harness、profile、App 语义保持原样。\n\n## Production roots\n\n| package | resolved version | production reason |\n|---|---|---|\n${rootRows}\n\n每个 root 的 source path、manifest SHA、真实 entry path、entry SHA 和 specifier 均在 [production-roots.json](${files['production-roots.json'].path})。\n\n## Dependency closure and excluded content\n\n闭包：${closure.packageCount} 个解析包身份 / ${closure.placements.length} 个物理目录 / ${closure.edgeCount} 条生产边；闭包外包 = 0。稳定 graph SHA-256：\x60${closure.deterministicGraphSha256}\x60。完整来源、版本、父链、排除包、optional skip、裁剪理由见 [closure](${files['harness-production-closure.json'].path})。\n\n| measurement | previous | corrective |\n|---|---:|---:|\n| 顶层包目录 | ${metrics.previousTopLevelPackageCount} | ${metrics.newTopLevelPackageCount} |\n| 全部包目录（含嵌套） | ${metrics.previousAllPackagePlacements} | ${metrics.newAllPackagePlacements} |\n| 唯一 name/version | ${metrics.previousUniqueNameVersionCount} | ${metrics.newUniqueNameVersionCount} |\n| Harness package bytes | ${metrics.previousHarnessPackageBytes} | ${metrics.newHarnessPackageBytes} |\n| Release bytes（不含 identity envelopes） | ${metrics.previousReleaseBytes} | ${metrics.newReleaseBytes} |\n| Release files（同口径） | ${metrics.previousReleaseFileCount} | ${metrics.newReleaseFileCount} |\n\n独立重新计算移除了 ${metrics.unreachableOldPlacementsRemoved} 个不可达旧目录（${metrics.unreachableOldUniqueNameVersionsRemoved} 个唯一 name/version），共 ${metrics.unreachableOldBytesRemoved} bytes。旧库存采用封存 file manifest，校验旧 package manifest SHA，bytes 归属最近包目录；没有使用 Reviewer 312/908MB 作常量。另裁剪 ${metrics.contentPruningSourceFiles} 个来源文件 / ${metrics.contentPruningSourceBytes} bytes（按来源包计算，非重复物化目录总量）。四个禁止包 vitest、vite、@vitest/coverage-v8、@deepseek-ai/dsh-agent-loop-testkit 均 ABSENT。详见 [package-comparison.json](package-comparison.json)。\n\n## Runtime and artifact identities\n\n@electron/packager@18.3.6、Electron 35.7.5、bundled Node 22.19.0、@deepseek-ai/dsh@0.1.2-alpha.1 / cd5ef8148158c3a752a658978873241fdf8e2bbc 均保持，真实 dsh --profile shaco-forge 启动、受控 DSH_HOME 和 artifact integrity PASS。Frozen Contract SHA 35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76 未变。\n\n${identities}\n\nArtifact digest：\x60${packageResult.identity.digest}\x60。\n\n最终包位置：\x60${location.packagedRoot}\x60。旧 artifact 679a92171c047f70b4d607d066f922ec0153d3f516a2fafbef9198d41ab7c2aa 仅为历史失败候选；原 FOUNDATION-01 Evidence 未修改。\n\n## Final 18 gates\n\n以下全部为本 Corrective 重新执行的 PASS，绑定同一 source inventory \x60${sourceIdentity}\x60（${source.length} 个源文件）。额外 composition freeze 只封存测试 composition evidence，不是 Step1 baseline freeze。\n\n${gateTable}\n\n专项测试覆盖 A-M：root inventory 稳定、实际包全部可达/无额外包、dev-only 不进入、required peer、optional policy、必需缺失/错误歧义身份 fail closed、四禁止包、无测试目录泄漏、真实 CLI 启动、Node/Harness identity、artifact integrity。测试异常时不会用旧 PASS 替代。\n\n## Failures and cleanup\n\n[failed-attempts.json](failed-attempts.json) 保留三次闭包诊断失败、两次桌面启动超时、diagnostic 限制和重叠失败、真实 restart 拒绝原因及后续重跑。重叠诊断的 exitCode 1 Explorer receipt 仍在；竞态复用了日志路径，所谓 precondition-failure.log 实为另一诊断输出，原样保留并明确说明这一限制，没有伪造缺失日志。ledger 现已增加互斥锁，所有最终 Gate 严格串行。\n\n[final-cleanup.json](final-cleanup.json) 与各 smoke cleanup receipt 证明无剩余 authority/Product 进程、新建测试 home 已移除。截图归档到新 Evidence；中间/最终 package 和诊断构建作为可复核产物保留。Provider = 0，Signing = 0。\n\n## Modified files and governance\n\n${codeFiles.map(path => `- [${path}](${link(evidence, join(root, path))})`).join('\n')}\n\n另新增本 finding Evidence、[Corrective Implementation Record](${link(evidence, record)}) 和 [REVIEW-029](${link(evidence, review)})；同步 Current State、Document Map、Development Map、Development Log、Review Index、Current Checkpoint。没有修改 apps/**、packages/**、package manifest/lock、Frozen Contract、Frozen Harness 或历史 Evidence。所有修改文本须由 final-validation 验证 UTF-8 无 BOM、无乱码。\n\nNF1/NF3 = READY_FOR_OWNER_CLOSURE；NF4 = DEFERRED_TO_SLICE3_STEP3 / NOT_CLOSED，MAX_JSON_FRAME=262144；F05 = OPEN_KNOWN_CONSTRAINT / PENDING_ARCHITECTURE_OWNER_ACCEPTANCE。Step2/Step3、Provider、Signing 均未授权。完整状态见 [governance-final-state.json](governance-final-state.json)。\n\n## Git, scope and next action\n\nEntry HEAD：${entry}。只允许一个新的本地 corrective commit，不 push、不改写历史。为避免自引用，候选 SHA 取包含本记录的单一 commit；提交后运行 node scripts/verify-slice3-step1-evidence.mjs --candidate，逐字节比较 candidate 的 ${source.length} 个 source inventory 文件，验证 entry ancestry、恰好一个新 commit 和 Git CLEAN，实际 SHA 由 Executor 最终回报。提交前一致性结果见 [final-validation.json](final-validation.json)。\n\nSCOPE_EXPANSION = NO。仍待独立 targeted re-review 和 Owner closure；NF4、F05 及 Step2/Step3/Fresh Windows 维持原边界。本结果为 Corrective Executor PASS，不是 Step1 独立复审 PASS。\n\nREADY_FOR_TARGETED_INDEPENDENT_REREVIEW = YES。V1_CURRENT_NEXT_ACTION = TARGETED_INDEPENDENT_REREVIEW_V1_SLICE_3_STEP1_S3S1_IR_001_CORRECTIVE。Executor 在本地候选提交和只读一致性验证完成后立即停止。\n`)
await write(record, `# V1-SLICE-3 Step1 Package Content Closure Corrective Implementation Record\n\nStatus: CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW\n\nParent: [REVIEW-029](${link(dirname(record), review)}) / FAIL / S3S1-IR-001 HIGH BLOCKING. Architecture Owner authorized this bounded corrective only.\n\n旧 scripts/package-runtime.mjs 从 overlay 顶层全部包起步，导致开发/测试与不相关 SDK 资产进入产品。已替换为真实 CLI/profile/bootstrap roots → production dependency graph → closure-only materialization。只遍历 dependencies、适用 optionalDependencies、required peers，保持 Frozen Harness / public dsh CLI / shaco-forge profile 语义。来源身份、父链、内容裁剪和最终 Node 解析均有 machine-readable proof。\n\n最终得到 ${closure.roots.length} 个 root、${closure.packageCount} 个包身份、${closure.edgeCount} 条边、${closure.placements.length} 个物理包目录，闭包外为零；四个明确禁止包均不存在。早期真实桌面探针发现仓库祖先可选 peer 污染，已将最终输出隔离并验证 ancestry，无 App/Harness 代码修改。\n\n全部 18 个最终 Gate 重新 PASS，source inventory = ${sourceIdentity}。专项 closure tests、真实 Worker/Harness、ordinary/evidence-observer Desktop、identity negatives、controlled home、完整性和清理均通过。所有失败与诊断限制保留，不以历史 PASS 替代。\n\n- [完整最终报告](${link(dirname(record), join(evidence, 'final-report.md'))})\n- [Graph / roots / package comparison / manifests](${link(dirname(record), join(evidence, 'README.md'))})\n- [失败历史](${link(dirname(record), join(evidence, 'failed-attempts.json'))})\n- [最终一致性验证](${link(dirname(record), join(evidence, 'final-validation.json'))})\n- [Targeted re-review handoff](${link(dirname(record), join(evidence, 'review-handoff.md'))})\n\n源码改动仅在直接相关 packaging / test / smoke / verification scripts。治理仅同步本 Finding 的六份活动 authority；原实施记录和 FOUNDATION-01 证据未改。新文本 UTF-8 without BOM，修改文件逐项检查乱码。未新增 Provider、Signing、installer、update/backup/restore/uninstall closure、Step2/Step3 或 Fresh Windows 工作。\n\nREVIEW-029 保持历史 FAIL；S3S1-IR-001 只到 CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW。NF1/NF3 只保留 READY_FOR_OWNER_CLOSURE，NF4/F05 边界不变。Owner closure NOT_PERFORMED，Step1 baseline NOT_FROZEN，Step2/Step3 NOT_AUTHORIZED。\n`)
await write(join(evidence, 'README.md'), `# S3STEP1-20260911-CLOSURE-CORRECTIVE-01\n\n仅对应 REVIEW-029 / S3S1-IR-001 PACKAGE_CONTENT_CLOSURE 的 Corrective Executor Evidence。最终状态 CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW；原 FOUNDATION-01 历史保持不变。\n\n- [Final report](final-report.md) / [machine-readable report](final-report.json)\n- [Production roots](${files['production-roots.json'].path}) / [closure graph](${files['harness-production-closure.json'].path})\n- [Old/new metrics](package-comparison.json)\n- [18-gate ledger and all attempts](test-summary.json) / [final validation](final-validation.json)\n- [Failed attempts and diagnostic limitations](failed-attempts.json) / [cleanup](final-cleanup.json)\n- [Governance final state](governance-final-state.json) / [re-review handoff](review-handoff.md)\n- [Entry baseline](entry-baseline.json)\n\n${identities}\n\nPackage build attempts 1/2、startup probes、inspector captures、worker diagnostic 和本地 Explorer receipts 全部保留。它们不替代最后 18 项同一 source identity 的 PASS。原始 command log 字节如需消除显示日志的 trailing whitespace，将先无损归档在 raw-command-log-bytes.json，并记录每个原始 SHA；不能静默覆盖失败历史。\n`)
await write(join(evidence, 'review-handoff.md'), `# Targeted Independent Re-Review Handoff (Not Executed)\n\nREADY_FOR_TARGETED_INDEPENDENT_REREVIEW = YES\n\nParent REVIEW-029 remains FAIL. Scope is solely S3S1-IR-001 PACKAGE_CONTENT_CLOSURE. The Executor requests no Step1 closure or baseline freeze and has not run an Independent Review.\n\nEntry = ${entry}; candidate = the single local commit containing this record. Verify with git rev-list --count ${entry}..HEAD (must be 1), entry ancestry, and node scripts/verify-slice3-step1-evidence.mjs --candidate. This read-only check compares every committed source byte with tested source inventory ${sourceIdentity}; it is not an Independent Review.\n\nStart with [final-report.md](final-report.md), [production roots](${files['production-roots.json'].path}), [closure graph](${files['harness-production-closure.json'].path}), [metrics](package-comparison.json) and [final-validation.json](final-validation.json). The exact final package is ${location.packagedRoot}; artifact digest ${packageResult.identity.digest}. Review root reasons, allowed graph edges, frozen built-package identity resolution, deterministic graph digest, all actual package placements and runtime-safe pruning. Verify four forbidden packages absent and all 18 final commands on the same source identity.\n\nReview [failed-attempts.json](failed-attempts.json), including the explicitly recorded overlapping diagnostic log limitation and its durable failure receipt, and [final-cleanup.json](final-cleanup.json). Source changes are limited to 8 packaging/test/verification scripts; Apps, contracts, Frozen Harness and original Evidence are unchanged.\n\nNF1/NF3 remain READY_FOR_OWNER_CLOSURE; NF4 remains deferred/not closed with MAX_JSON_FRAME=262144; F05 remains OPEN_KNOWN_CONSTRAINT / PENDING_ARCHITECTURE_OWNER_ACCEPTANCE. Step2/Step3, Provider, Signing and Fresh Windows remain outside this task. Provider/Signing run counts are zero. The next reviewer may assess the corrective; this Executor stops at CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW.\n`)
for (const name of ['README.md', 'final-report.md']) {
  const path = join(evidence, name)
  await write(path, (await readFile(path, 'utf8')) + `\n补充证据：[closure-determinism-recheck.json](closure-determinism-recheck.json) 从真实 entry 再发现 roots，并重算全部物理图，证明最终图与保存证据一致、两次隔离 attempt 的语义图摘要相同。专项打包测试为 ${packagedTests.pass}/${packagedTests.tests} PASS、0 skipped。命令原始字节见 [raw-command-log-bytes.json](raw-command-log-bytes.json)，显示日志仅规范化行尾与尾部空白。\n\n第一轮 18 个命令虽然 PASS，后续内容 census 仍发现测试产物，因此没有被最终接受；[content-pruning-diagnostic-4.json](content-pruning-diagnostic-4.json) 记录补充裁剪及公开 testing/mock API 的保留理由。前三次补充诊断由 guard 拦住误删公开入口、未排除 benchmark 和误删运行时 spec.js，全部保留。最终全部 18 Gate 已在补全规则后的源码再次重跑。中间清理的晚期断言失败及两处空目录恢复记录见 [intermediate-cleanup-cycle-1-recovery.json](intermediate-cleanup-cycle-1-recovery.json)；原始临时根列表未落盘这一限制已明确记录，最终清理改为逐步落盘。\n`)
}
const changed = execFileSync('git', ['status', '--porcelain=v1'], { cwd: root, encoding: 'utf8' })
console.log(json({ result: 'RECORDS_FINALIZED', gates: gates.length, sourceIdentity, artifactDigest: packageResult.identity.digest, metrics, uncommitted: Boolean(changed.trim()) }))
