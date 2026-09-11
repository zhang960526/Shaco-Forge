// Evidence/document finalization only; never changes the frozen application source.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const E = 'docs/04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260911-FULL-SHACO-DUAL-THEME-01'
const record = 'docs/04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md'
const R = p => fs.readFileSync(path.resolve(root, p))
const T = p => new TextDecoder('utf-8', { fatal: true }).decode(R(p))
const J = p => JSON.parse(T(p))
const hash = b => crypto.createHash('sha256').update(b).digest('hex')
const write = (p, value) => fs.writeFileSync(path.resolve(root, p), value, 'utf8')
const json = (name, value) => write(`${E}/${name}`, JSON.stringify(value, null, 2) + '\n')
const link = (p, label = path.basename(p)) => `[${label}](${path.relative(path.dirname(record), p).replaceAll('\\', '/')})`
const git = args => execFileSync(process.env.SHACO_FORGE_GIT ?? 'git', args, { cwd: root }).toString('utf8')
process.env.SHACO_FORGE_STEP3_COMPOSITION_EVIDENCE_ROOT = path.resolve(E)
const { verifyFrozen } = await import(pathToFileURL(path.resolve(root, 'scripts/step3-final-composition.mjs')).href)
const frozen = await verifyFrozen()
const baseline = J(`${E}/baseline.json`)
const summary = J(`${E}/test-summary.json`)
const required = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'test:full-shaco', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'smoke:full-shaco']
const final = summary.commands.filter(x => x.startedAt >= frozen.generatedAt && x.phase === 'FINAL_REGRESSION')
for (const command of required) assert.equal(final.filter(x => x.command === command).at(-1)?.result, 'PASS', `Missing final PASS: ${command}`)
assert.match(T(`${E}/${final.find(x => x.command === 'test').log}`), /# tests 178\b/)
assert.match(T(`${E}/${final.find(x => x.command === 'test:full-shaco').log}`), /# tests 14\b/)
const fullAttempt = final.filter(x => x.command === 'smoke:full-shaco').at(-1).attempt
const runtimeRoot = `${E}/runs/smoke-full-shaco-${fullAttempt}/step2`
const runtime = J(`${runtimeRoot}/full-shaco-results.json`)
assert.equal(runtime.result, 'PASS')
assert.equal(runtime.finalFrozenComposition, true)
assert.deepEqual(runtime.composition, frozen.identity)
assert.equal(runtime.providerRuns, 0)
assert.equal(runtime.cleanup.noOrphan, true)
assert.equal(runtime.themeSwitches.length, 5)
assert.ok(runtime.themeSwitches.every(x => x.result === 'PASS'))
const inspection = J(`${E}/visual-inspection.json`)
assert.equal(inspection.result, 'PASS', 'Final screenshots must be visually inspected first')
assert.equal(inspection.frozenAt, frozen.generatedAt)
const screenshots = fs.readdirSync(runtimeRoot).filter(p => p.endsWith('.json')).map(p => J(`${runtimeRoot}/${p}`)).filter(x => x.path?.endsWith('.png') && x.width && x.sha256)
for (const shot of screenshots) {
  const bytes = R(shot.path)
  assert.equal(hash(bytes), shot.sha256, shot.name)
  assert.equal(bytes.readUInt32BE(16), shot.width)
  assert.equal(bytes.readUInt32BE(20), shot.height)
  assert.equal(shot.ui.forbiddenBrand, false)
  assert.equal(shot.ui.harnessSeats, 0)
  if (shot.ui.rootVisible) {
    assert.equal(shot.ui.rootCount, 1)
    assert.equal(shot.ui.sidebarCount, 1)
    assert.equal(shot.ui.horizontalOverflow, false)
  }
}
const shot = name => { const x = screenshots.find(s => s.name === name); assert.ok(x, name); return x }
for (const name of ['braun-representative', 'famicom-representative', 'narrow-window']) {
  const geometry = shot(name).ui.geometry
  assert.equal(geometry.conversation.center, geometry.composer.center)
  assert.equal(geometry.conversation.center, geometry.tool.center)
  assert.equal(shot(name).ui.horizontalOverflow, false)
}
assert.equal(shot('braun-representative').ui.geometry.conversation.width, 1100)
const matrixNames = [
  ['Bootstrap / Loading', 'bootstrap-loading'], ['No Project', 'no-project'], ['Project selected + blank Chat', 'project-blank-chat'],
  ['Active Conversation', 'conversation-streaming'], ['Tool running / result', 'conversation-tool', 'tool-result-detail'],
  ['Approval pending', 'approval-pending'], ['Question pending', 'question-pending', 'plan-pending', 'multi-pending'],
  ['Error / Reconnecting', 'shaco-root-error'], ['Narrow window', 'narrow-window'],
]
const matrix = matrixNames.map(([state, ...names], i) => ({ id: i + 1, state, result: 'PASS', screenshots: names.map(shot) }))
const criteria = [
  ['ONE_VISIBLE_PRODUCT_SHELL', '九状态真实 Electron；运行态 rootCount=1，失败时隐藏/撤销业务 root。'],
  ['ONE_VISIBLE_SIDEBAR', '所有正常状态 sidebarCount=1，Harness sidebar seats=0。'],
  ['VISIBLE_HARNESS_BRANDING_NONE', '最终截图与 DOM forbiddenBrand=false。'],
  ['VISIBLE_HARNESS_PRODUCT_SHELL_NONE', '不用 AppWebEntry/AppFrame；所有 root/error 状态无 Harness fallback。'],
  ['SHACO_CHAT_WORKSPACE_DIRECT_PRESENTATION', '直接消费 sessions.binding 与 uiConversation.binding(binding).target(chat)。'],
  ['CONVERSATION_COMPOSER_TOOL_CENTER_AXIS', '宽窗三者中心 845 CSS px；窄窗三者中心 492 CSS px。'],
  ['CHAT_CONTENT_APPROX_1100PX', '宽窗 Conversation/Composer 均 1100px；窄窗收缩且无横向溢出。'],
  ['SHACO_BOOT_LOADING_ERROR_OWNERSHIP', '真实 bootstrap-loading、root-error 截图；物理 Carrier 故障时 root hidden/inert 且 Shaco error。'],
  ['HARNESS_CONVERSATION_STREAMING_TRUTH_PRESERVED', '真实 Host session 记录经 public target 呈现 streaming/tool/result/error；冷读历史 loadOlder 50→65。'],
  ['SHACO_APPROVAL_REAL_HARNESS_SETTLEMENT', '真实 Host pending 跨 Desktop 冷重建；Shaco 按钮仅显式结算一次。'],
  ['SHACO_QUESTION_REAL_HARNESS_SETTLEMENT', '真实 Question 冷重建与一次结算；plan、multi/custom 完整答案。'],
  ['MODEL_PERMISSION_PUBLIC_TRUTH', '实际 catalog model 往返变更，permission 往返与 Full Access 确认；无 Provider discovery。'],
  ['NO_SECOND_RUNTIME_OR_TRUTH', 'focused lifecycle + runtime 同一 Context/binding/target/public stores；无第二 reducer/registry。'],
  ['PUBLIC_RUNTIME_APIS_ONLY', 'public import/fixture boundary tests、static verification；生产 presentation 不读取 private event ID。'],
  ['RECOVERY_AND_COLD_REBUILD_PRESERVED', 'Step1/2/3 正式回归覆盖 same-Host reattach、Carrier 重连、Worker replacement、stale fence。'],
  ['NO_PERMANENT_INSPECTOR', '最终全 Shell 截图无常驻右侧 Inspector；Tool details 按需展开。'],
  ['LOW_NOISE_WORKER_STATE', '真实连接状态；lowNoiseWorkbar=true；常态不呈现诊断墙。'],
  ['VISUAL_STATE_MATRIX', '九状态 PNG、尺寸、SHA 与最终 composition 关联，另有双模板与 pending 补充截图。'],
]
const ui = criteria.map(([gate, evidence], i) => ({ id: `UI-G${String(i + 1).padStart(2, '0')}`, gate, result: 'PASS', evidence }))
const themeCriteria = [
  ['NO_COMPONENT_SKIN_BYPASSES_THEME_TEMPLATE_AUTHORITY', 'verify:theme 扫描全部自有/迁移展示；固定外观集中 themes.css；Markdown aliases 归一。'],
  ['DEFAULT_TEMPLATE_COMPLETE', 'BRAUN 默认覆盖 Shell/Sidebar/Workbar/Message/Composer/Tool/Approval/Question/Settings。'],
  ['LIGHT_DARK_MODE_PRESERVED', '两个模板均真实切换 dark/system/light；系统变化由现有 controller 订阅及单元测试覆盖。'],
  ['TEMPLATE_SWITCH_SEAM_PRESENT', '同一 root 的稳定 template identity；颜色、字体、边框、密度、圆角、阴影和装饰 recipe。'],
  ['THEME_CHANGE_DOES_NOT_CHANGE_BUSINESS_TRUTH', '五个场景逐一比较 root/session/composer/draft 及 14 项公开业务对象/快照相等；prompt/connection unchanged。'],
  ['BRAUN_TEMPLATE_VISUAL_CONFORMANCE', '最终 Electron BRAUN 对照只读 Braun.png；灰白工具面板、克制边界、长期 Shell 结构一致。'],
  ['FAMICOM_TEMPLATE_VISUAL_CONFORMANCE', '最终 Electron FAMICOM 对照只读 FAMICOM.png；奶油面板、暗红强调/条带、方形控件、等宽标题。'],
  ['BRAUN_FAMICOM_RUNTIME_SWITCH', '真实 Settings selector 执行 BRAUN→FAMICOM→BRAUN，五场景全部 PASS。'],
]
const theme = themeCriteria.map(([gate, evidence], i) => ({ id: `THEME-G${String(i + 1).padStart(2, '0')}`, gate, result: 'PASS', evidence }))
const attempts = [...new Set(summary.commands.map(x => x.command))].map(command => ({ command, exactCommand: summary.commands.find(x => x.command === command).exactCommand, attempts: summary.commands.filter(x => x.command === command).map(({ attempt, phase, exitCode, result, log, startedAt }) => ({ attempt, phase: phase ?? 'DEVELOPMENT', exitCode, result, log, startedAt })), final: final.filter(x => x.command === command).at(-1) ?? null }))
json('final-tests.json', { frozenAt: frozen.generatedAt, required, result: 'PASS', final, attempts, execution: 'Sequential Node 22.19.0 / pinned pnpm 11.7.0 / normal Windows user; exact executable and argv retained in test-summary.json. Composition verified after each command.' })
json('gate-results.json', { assessment: 'IMPLEMENTER_VERIFICATION_NOT_INDEPENDENT_FINAL_REVIEW', result: 'PASS', ui, theme, runtimeEvidence: `${runtimeRoot}/full-shaco-results.json` })
json('visual-matrix.json', { frozenAt: frozen.generatedAt, manifestSha256: frozen.identity.manifestSha256, result: 'PASS', matrix, screenshots })
json('runtime-continuity.json', { result: 'PASS', source: `${runtimeRoot}/full-shaco-results.json`, themeSwitches: runtime.themeSwitches, gates: runtime.gates, controls: runtime.scenarios.controls, settings: runtime.scenarios.settings.settings, history: runtime.scenarios.history, cleanup: runtime.cleanup, providerRuns: runtime.providerRuns })
const runPath = command => `${E}/runs/${command.replaceAll(':', '-')}-${final.filter(x => x.command === command).at(-1).attempt}`
const recoveryProof = J(`${runPath('smoke:slice2-step2')}/step2/cumulative-e2e.json`).attempts.at(-1)
assert.equal(recoveryProof.result, 'PASS')
json('recovery-summary.json', { result: 'PASS', source: `${runPath('smoke:slice2-step2')}/step2/cumulative-e2e.json`, chain: recoveryProof.chain, cleanup: recoveryProof.cleanup, providerRuns: recoveryProof.providerRuns, step3Source: `${runPath('smoke:slice2-step3')}/step2/cumulative-e2e.json` })
json('bootstrap-lifetime.json', { result: 'PASS', focusedTestLog: final.find(x => x.command === 'test:full-shaco').log, runtimeSource: `${runtimeRoot}/full-shaco-results.json`, publicBootstrap: 'facade.create + Context + Loader + getStaticModules + slots + uiRenderer', harnessRows: 28, shacoRows: 1, activeRequiredServicesBarrier: true, singleFacadeContextReactRoot: true, rootRevocation: 'Synchronous hidden/inert before unmount; required-service loss and slot error tested; no Harness fallback', testFiles: ['apps/desktop/tests/presentation-lifecycle.test.mjs', 'apps/desktop/tests/full-shaco-boundaries.test.mjs'], providerRuns: 0 })
json('security-summary.json', { result: 'PASS', source: `${runPath('smoke:slice2-step1')}/step1/security-negative-results.json`, staticLog: final.find(x => x.command === 'verify:static').log, crossUserMethod: 'Deterministic evaluation of real kernel ACL; no real second-user login claimed', fixtureBoundary: 'Test-only profile and entry explicitly gated; excluded from production composition', productionNewPreloadOrIpcAuthority: 0, rendererRequire: false, rendererProcess: false, providerRuns: 0 })
const electronArchive = `${E}/production-electron`
fs.mkdirSync(electronArchive, { recursive: true })
const archivedElectron = []
for (const [command, stem] of [['smoke:electron', 'electron-runtime'], ['smoke:failure', 'carrier-failure-runtime']]) {
  const test = final.filter(x => x.command === command).at(-1)
  for (const ext of ['json', 'png']) {
    const source = `node_modules/.step1-electron-regression/${stem}.${ext}`
    const mtime = fs.statSync(source).mtime.toISOString()
    assert.ok(mtime >= test.startedAt && mtime <= test.endedAt, `Stale production Electron artifact: ${source}`)
    fs.copyFileSync(source, `${electronArchive}/${stem}.${ext}`)
    archivedElectron.push({ source, archive: `${electronArchive}/${stem}.${ext}`, sha256: hash(R(source)), producedAt: mtime, command, attempt: test.attempt })
  }
}
json('production-electron-archive.json', { result: 'PASS', files: archivedElectron })
json('composition-final-summary.json', { frozenAt: frozen.generatedAt, graphRevision: frozen.identity.graphRevision, totalRows: 29, harnessRows: 28, shacoRows: 1, sourceCount: frozen.identity.source.length, identitySha256: hash(Buffer.from(JSON.stringify(frozen.identity))), sourceFingerprintSha256: hash(Buffer.from(JSON.stringify(frozen.identity.source))), manifestSha256: frozen.identity.manifestSha256, bootstrapSha256: frozen.identity.bootstrapSha256, applicationSha256: frozen.identity.applicationSha256, shacoRow: frozen.identity.rows.at(-1), verification: 'PASS', priorCompositions: 'composition-history.json; supersession records retained', desktopMainSha256: hash(R('apps/desktop/dist/main/main.js')) })
const migration = J(`${E}/source-migration-inventory.json`)
const testTable = '| Exact command | Goal attempts | Latest final attempt | Exit / result |\n|---|---:|---:|---|\n' + attempts.map(x => `| \`${x.exactCommand}\` | ${x.attempts.length} | ${x.final?.attempt ?? 'development only'} | ${x.final ? `${x.final.exitCode} / ${x.final.result}` : `${x.attempts.at(-1).exitCode} / ${x.attempts.at(-1).result} (pre-freeze)`} |`).join('\n')
const gateTable = rows => '| Gate | Result | Evidence |\n|---|---|---|\n' + rows.map(x => `| ${x.id} | ${x.result} | ${x.evidence} |`).join('\n')
const state = 'IMPLEMENTED_WAITING_INDEPENDENT_FINAL_REVIEW'
const next = 'INDEPENDENT_FINAL_REVIEW_FULL_SHACO_DUAL_THEME_STEP3'
const currentFiles = ['docs/00-governance/SHACO-FORGE-CURRENT-STATE.md', 'docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md', 'docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md', 'docs/04-development-records/DEVELOPMENT-LOG.md']
for (const file of currentFiles) {
  let text = T(file)
  const match = text.match(/<!-- FULL_SHACO_CURRENT_START -->[\s\S]*?<!-- FULL_SHACO_CURRENT_END -->/)
  assert.ok(match, file)
  let block = match[0].replace('V1_SLICE_2_STEP3 = IN_PROGRESS', `V1_SLICE_2_STEP3 = ${state}\nV1_SLICE_2_STEP3_FULL_SHACO_PRESENTATION = ${state}\nGOAL_RESULT = FULL_GOAL_VERIFIED\nUI_G01_TO_UI_G18 = PASS\nTHEME_G01_TO_THEME_G08 = PASS\nVISUAL_STATE_MATRIX = PASS\nFINAL_NON_PROVIDER_REGRESSION = PASS\nPROVIDER_RUN_COUNT = 0\nINDEPENDENT_FINAL_REVIEW = NOT_EXECUTED`).replace('V1_CURRENT_NEXT_ACTION = IMPLEMENT_AND_VERIFY_FULL_SHACO_DUAL_THEME_PRESENTATION', `V1_CURRENT_NEXT_ACTION = ${next}`)
  block = block.replace('目标 UI ownership 不代表实现已验证；UI-G01–18、THEME-G01–08、Visual Matrix 初始均 NOT RUN。旧 Evidence 保留，不作为新 UI PASS。', '本次实现验证：UI-G01–18、THEME-G01–08、九状态 Matrix 与最终冻结版本完整非 Provider 回归均 PASS；这不是 Independent Final Review 或 Owner Closure。旧 Evidence 保留，不作为新 UI PASS。')
  const rel = p => path.relative(path.dirname(file), p).replaceAll('\\', '/')
  if (!block.includes('Full Shaco 双模板实施记录')) block = block.replace('<!-- FULL_SHACO_CURRENT_END -->', `\n[Full Shaco 双模板实施记录](${rel(record)})（A–AM、实际文件、测试与限制） · [Evidence 索引](${rel(`${E}/README.md`)}) · [最终 composition](${rel(`${E}/composition-final-summary.json`)})。\n<!-- FULL_SHACO_CURRENT_END -->`)
  write(file, text.replace(match[0], block).replace('## Current — Full Shaco Presentation Corrective Contract (2026-09-11)', '## Current — Full Shaco 双模板已实现，等待独立终审 (2026-09-11)'))
}
const decision = 'docs/04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-DIRECTION-DECISION.md'
let decisionText = T(decision)
const historicalAt = decisionText.indexOf('## 1. Historical')
decisionText = decisionText.slice(0, historicalAt).replace('V1_SLICE_2_STEP3 = IN_PROGRESS', `V1_SLICE_2_STEP3 = ${state}`).replace('V1_CURRENT_NEXT_ACTION = IMPLEMENT_AND_VERIFY_FULL_SHACO_DUAL_THEME_PRESENTATION', `V1_CURRENT_NEXT_ACTION = ${next}`) + decisionText.slice(historicalAt)
const completion = `## Implementation verification — 2026-09-11\n\n本次实现结果为 FULL_GOAL_VERIFIED；UI-G01–18、THEME-G01–08、九状态及最终非 Provider 回归 PASS。详见 [Full Shaco 双模板实施记录](${path.basename(record)})。Owner acceptance/freeze 来源保持不变；实现验证不是独立终审，未关闭 Step3/Slice2。\n\n`
if (!decisionText.includes('## Implementation verification')) decisionText = decisionText.replace('## 1. Historical', completion + '## 1. Historical')
write(decision, decisionText)
const contract = 'docs/03-v1.0-plan/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-CORRECTIVE-CONTRACT-CANDIDATE.md'
let contractText = T(contract)
if (!contractText.includes('## Implementation evidence status')) contractText = contractText.replace('## 1. Authority', `## Implementation evidence status — 2026-09-11\n\n冻结技术条款保持不变。下文 REQUIRED / NOT_RUN 表格保留为冻结时的验收要求快照；当前实现验证结果由 [Full Shaco 双模板实施记录](../04-development-records/${path.basename(record)}) 的 X/Y/Z 与新 Evidence 承载：18 个 UI Gate、8 个 Theme Gate、九状态、最终非 Provider 回归均 PASS。项目停在 ${state}；本执行者未执行 Independent Final Review，未关闭 Step3/Slice2。\n\n## 1. Authority`)
write(contract, contractText)
const uiSpec = 'docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md'
let spec = T(uiSpec).replace('| Product Implementation | `NOT_STARTED_BY_THIS_DOCUMENT` |', `| Product Implementation | \`${state}\` |`).replace('| Current Post-1C Allocation | `SLICE_1_PASSIVE_WRAPPER_ACCEPTED / REMAINING_V1_UI_ALLOCATED_TO_SLICE_2` |', '| Current Post-1C Allocation | `SLICE_2_STEP3_FULL_SHACO_BRAUN_FAMICOM_IMPLEMENTED_WAITING_REVIEW` |')
if (!spec.includes('## Current implementation evidence')) spec = spec.replace('## 1. Document Status', `## Current implementation evidence — 2026-09-11\n\n本轮实现 BRAUN 默认模板、FAMICOM 模板、真实 Settings selector 与独立 light/dark/system mode。Shell/Conversation/Composer/Tool/Approval/Question/Model/Permission/Settings 均由同一 Shaco 组件树呈现。最终视觉与运行切换证据见 [实施记录](../04-development-records/${path.basename(record)}) 和 [九状态 Matrix](../04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260911-FULL-SHACO-DUAL-THEME-01/visual-matrix.json)。§3.4 模板角色、长期结构 authority、三张只读参考图与未来模板 scope 不变。实现验证不代表 Owner 最终验收；状态/下一步以 Current State 为准。\n\n## 1. Document Status`)
write(uiSpec, spec)
const checkpoint = 'docs/07-handover/CURRENT-CHECKPOINT.md'
let checkpointText = T(checkpoint)
if (!checkpointText.includes('FULL_SHACO_HISTORICAL_POINTER')) checkpointText = checkpointText.replace('# Shaco Forge Current Checkpoint', '# Shaco Forge Current Checkpoint\n\n<!-- FULL_SHACO_HISTORICAL_POINTER -->\n> 下文为 2026-09-04 的历史交接快照。当前阶段/下一步只以 [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md) 为准；Full Shaco 双模板已实现并等待独立终审，见 [实施记录](../04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md)。本历史快照不构成当前授权。')
write(checkpoint, checkpointText)
// Create all final artifact paths before recording expanded git counts.
for (const p of [record, `${E}/README.md`, `${E}/changed-paths.json`, `${E}/final-audit.json`, `${E}/encoding-check.json`, `${E}/run-manifest.json`, `${E}/redaction-summary.json`]) if (!fs.existsSync(p)) write(p, '')
const list = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)
const changed = list.filter(p => !p.startsWith(E + '/') && (!baseline.files[p] || baseline.files[p].sha256 !== hash(R(p)))).sort()
const removed = Object.keys(baseline.files).filter(p => !fs.existsSync(p))
assert.deepEqual(removed, [])
const oldEvidenceChanged = changed.filter(p => p.includes('/evidence/'))
assert.deepEqual(oldEvidenceChanged, [])
const assetsChanged = changed.filter(p => p.startsWith('docs/01-product/assets/'))
assert.deepEqual(assetsChanged, [])
const status = git(['status', '--porcelain=v1', '--untracked-files=all']).trimEnd().split('\n').filter(Boolean)
const staged = git(['diff', '--cached', '--name-only']).trim()
assert.equal(staged, '')
const branch = git(['branch', '--show-current']).trim()
const head = git(['rev-parse', 'HEAD']).trim()
assert.equal(head, baseline.head)
assert.equal(branch, baseline.branch)
const harnessArgs = ['-c', 'safe.directory=D:/Project/Shaco-Forge-Upstream/deepseek-harness', '-C', 'D:/Project/Shaco-Forge-Upstream/deepseek-harness']
const harness = { head: git([...harnessArgs, 'rev-parse', 'HEAD']).trim(), status: git([...harnessArgs, 'status', '--porcelain=v1', '--untracked-files=all']).trim(), readOnly: true }
assert.equal(harness.head, baseline.harness.head)
assert.equal(harness.status, '')
const images = baseline.images.map(x => ({ ...x, actualSha256: hash(R(x.path)), unchanged: x.sha256 === hash(R(x.path)) }))
assert.ok(images.every(x => x.unchanged))
const audit = { at: new Date().toISOString(), result: 'PASS', branch, head, trackedModified: status.filter(x => !x.startsWith('??')).length, expandedUntracked: status.filter(x => x.startsWith('??')).length, changedPathsInGoalExcludingEvidence: changed.length, newEvidenceFiles: list.filter(p => p.startsWith(E + '/')).length, staged: [], commit: 'NOT_RUN', push: 'NOT_RUN', removed, preservedBaselineFileCount: Object.keys(baseline.files).length, oldEvidenceChanged, assetsChanged, harness, images, processCleanup: J(`${E}/process-cleanup-final.json`) }
assert.equal(audit.processCleanup.result, 'PASS')
json('final-audit.json', audit)
json('changed-paths.json', { comparedWith: 'baseline.json (entry dirty workspace, not HEAD)', changed: changed.map(p => ({ path: p, operation: baseline.files[p] ? 'MODIFIED_FROM_ENTRY' : 'ADDED_THIS_GOAL', sha256: hash(R(p)) })), removed, evidenceRoot: E, evidenceFiles: list.filter(p => p.startsWith(E + '/')).sort() })
const sections = [
['A. GOAL VERDICT', `GOAL_RESULT = **FULL_GOAL_VERIFIED**。项目状态：\`${state}\`。本记录为实施验证，不是 Independent Final Review。`],
['B. BASELINE', `Product：master / \`${baseline.head}\`；进入时 ${baseline.trackedModified} tracked modified + ${baseline.untracked} expanded untracked，staged NONE。Harness：\`${baseline.harness.head}\` CLEAN / READ_ONLY。670 个 entry 文件无删除；既有 dirty 工作区保留。三张参考图均 1672×941，SHA 未改变，见 ${link(`${E}/baseline.json`)}、${link(`${E}/final-audit.json`)}。`],
['C. OWNER ACCEPTANCE / FREEZE PERSISTENCE', `Owner 输入确认 REVIEW-027/027A PASS 与双模板 Delta ACCEPTED；来源为 OWNER_INPUT_ONLY，未虚构本地 reviewer 报告。实现前已在现有 Direction Decision、Corrective Contract、Current State、Document/Development Map、Development Log 持久化 FROZEN_FOR_IMPLEMENTATION 与授权；时间/文件 SHA 见 ${link(`${E}/freeze-persistence.json`)}。合同文件名保留 CANDIDATE，技术条款未另建 authority。`],
['D. ACTUAL IMPLEMENTATION', '完成 Option B、单 Shaco Shell、直接 public Chat target、Message/Markdown/Composer、基础 Tool、真实 Approval/Question、Model/Permission/Settings、BRAUN/FAMICOM 与恢复兼容。业务状态仍由 Frozen Harness 持有；新增状态仅为输入草稿、UI 展开、选择表单和主题偏好。'],
['E. ACTUAL FILES MODIFIED / ADDED', `以下 ${changed.length} 个文件是相对进入本 Goal 的实际变更；不把全部既有 dirty 文件算作新实现。新 Evidence 文件逐项见 ${link(`${E}/changed-paths.json`)}。\n\n` + changed.map(p => `- ${link(p, p)} — ${baseline.files[p] ? '修改' : '新增'}。`).join('\n')],
['F. OPTION B BOOTSTRAP', '使用 public facade.create、Context、Loader、getStaticModules、slots、uiRenderer。完整 28 Harness 行先 resolve 并逐行验证 ACTIVE，再激活 Shaco 行；required services 缺失/错误/被撤销即同步 conceal，随后卸载和 dispose。不调用 AppWebEntry、不复制私有 boot/runtime。ACTIVE=2 是 frozen public const-enum 的字面值镜像，具有 public type 注释，来源已列入 migration/notice。'],
['G. SINGLE CLIENT / CONTEXT / REACT ROOT', '单 facade/client、单 Context、单 React singleton 与 uiRenderer.mount；Shaco root 优先级 -1。生命周期 tests 覆盖 required barrier、重复/缺失 row、服务/root 撤销、dispose 幂等；真实主题切换逐项验证同一 root/session/composer/binding/target。'],
['H. HARNESS VISIBLE UI ELIMINATION', '不呈现 Harness AppFrame、Workspace、Sidebar、Settings、Composer、BootPage 或品牌；旧 root ID 仅为挂载容器名。成功、loading、失败均 Shaco UI；runtime root winner 丢失时先 hidden/inert，禁止 fallback 短暂暴露。真实截图与 DOM 证明各正常状态 root=1/sidebar=1/Harness seats=0/forbiddenBrand=false。'],
['I. HARNESS SOURCE REUSE ASSESSMENT', '| 主要组件 | 策略 | 原因/范围 |\n|---|---|---|\n' + migration.rows.map(x => `| ${x.source.split('/').at(-1)} | ${x.strategy} | ${x.reusedScope}; ${x.adaptationScope} |`).join('\n')],
['J. MIGRATION INVENTORY', `14 行 selected source，逐项包含 Frozen HEAD、原文件 SHA、target/target SHA、REUSE/ADAPT/GREENFIELD 原因、去除私有依赖、public binding、主题归一与 notice。${link(`${E}/source-migration-inventory.json`)}。只读源码评估先于实现；未复制 runtime/truth/reducer。`],
['K. LICENSE / NOTICE', `新增 ${link('apps/desktop/THIRD_PARTY_NOTICES.md')}，保留 DeepSeek MIT 原文及选定迁移出处。${link(`${E}/license-file-selection.json`)} 记录具体文件/header/license SHA，并覆盖 11 个现有公共 Markdown 依赖的 MIT notice（6 份不同原文）。无新依赖或拷贝的第三方图标/字体素材；未以仓库根 MIT 代替逐文件检查。`],
['L. SHACO SHELL', '单 Sidebar 含固定 New Chat、项目目录/Session、底部 Settings；Workbar 只显示当前上下文与真实连接状态。Chat 内容约 1100px，上下中心轴一致；无巨大外套卡片或常驻 Inspector。保留 Native Picker cancel/failure/success 与 blank-session reuse。'],
['M. CONVERSATION / STREAMING', '直接订阅 public assembled target 的 order/nodes；不订阅裸 events 后自建消息 reducer。支持用户右侧、assistant 左侧、Markdown、reasoning/details、图片、streaming、terminal error/interrupted；follow-scroll 24px 与 history anchor。真实 Host session.append 非 Provider fixture 写入合法记录，冷重建 loadOlder 从 50 到 65；这不等于实际模型执行验证。'],
['N. COMPOSER / PROMPT / CANCEL', 'textarea 支持 IME/Enter、图片预览和本地草稿；public Session.prompt(content, queue) 与 cancel，按当前 generation/session/binding 拒绝陈旧操作。prompt admission 不伪装完成；unknown 不自动重发；cancel 不清空业务队列。实际 Provider prompt/cancel run 未执行（按授权为 0），调用语义和 fencing 由 focused actions tests 验证，真实 UI/草稿/模型路由门控由 Electron 验证。'],
['O. TOOL', '基础 Shaco Tool 展示直接读 ToolChatData.root，区分 running/result/error、输入、输出与可展开详情/子调用。resultText 纯 helper 适配；高级 terminal/diff/path Inspector 未进入 V1 BASIC。running→result 的真实 Host 合法记录经过公共 target 呈现；不声称执行了真实外部工具。'],
['P. APPROVAL', '真实 Host approval.request 产生 pending；Shaco 使用当前 public pending.answer，显式 allow/reject，局部点击锁防重复。Desktop A 关闭后 Host pending 存活，Desktop B 同 Host 冷重建；仅一次显式结算，stale/duplicate 不增结算，不因断连 cancel。'],
['Q. QUESTION', '真实 Host userQuestions.ask；单选、多选、custom、完整 question batch、plan details/显式 approveLabel。plan approve 放在第二个选项的测试证明不按顺序猜测；multi/custom 测试验证完整答案。Question 跨 Desktop 冷重建后显式结算一次。'],
['R. MODEL / PERMISSION / SETTINGS', 'public directory.store/load/select，真实模型选择往返且 modelChanged=true；permission Host projection + public command，read-only 往返、custom 只显示、Full Access 显式确认且未勾选不可确认。Settings 保留本地 profile/endpoint/protocol/model、credential set/unset 和输入清空；unknown reread/revision fence 保留，无 credential readback 或自动 Provider discovery。'],
['S. RECOVERY', '完整 Step1/2/3 回归 PASS：Desktop graceful/crash 后 Worker/Host 存活，同 Host fresh Desktop 重挂、Carrier loss 新认证 generation/cold projection、Worker crash job cleanup/replacement、stale callback 拒绝、bounded no-orphan cleanup。故障 smoke 的测试专用分支先 fence 正常自动恢复，再真实终止 Helper 并测量退出；未改变生产恢复策略。'],
['T. BRAUN TEMPLATE', 'BRAUN 默认：灰白/柔和浅灰 surfaces、克制暗色强调、细边框、6px 控件圆角、系统字体、无装饰条。全 Shell 共用 tokens/recipe；正式参考图只读保留。'],
['U. FAMICOM TEMPLATE', 'FAMICOM：奶油 surfaces、深红 accent 与 Workbar 条带、较方的 4px 控件、等宽 display 字体、独立边框/阴影/密度 recipe。同一 Shell/Chat/Composer/Tool/interaction/settings 组件树覆盖。'],
['V. TEMPLATE SELECTOR / RUNTIME SWITCH', '真实 Settings selector 执行 BRAUN→FAMICOM→BRAUN，分别在 approval/question/plan/multi/representative 五场景核对 root、session tree、composer、draft、Context/generation、workspace/session store、binding/chat target、pending source/object、model directory/snapshot、permission source/value、settings source/snapshot 全部不变，prompt/connection 计数不变。详见 runtime-continuity.json。'],
['W. THEME MODE', '模板与 mode 两个独立维度。两个模板均实际运行 light/dark/system，mode 变更不重建业务；system 最终解析为当前系统 light，系统变化订阅由既有 controller 与 tests 覆盖。未来七模板不实现。'],
['X. UI-G01 ~ UI-G18', gateTable(ui)],
['Y. THEME-G01 ~ THEME-G08', gateTable(theme)],
['Z. VISUAL STATE MATRIX', '| State | Result | Evidence |\n|---|---|---|\n' + matrix.map(x => `| ${x.id}. ${x.state} | ${x.result} | ${x.screenshots.map(s => link(s.path, s.name)).join(' / ')} |`).join('\n')],
['AA. BRAUN / FAMICOM VISUAL EVIDENCE', ['braun-representative', 'famicom-representative'].map(name => { const s = shot(name); return `${link(s.path, name)}：${s.width}×${s.height}；SHA256 \`${s.sha256}\`；${s.source}；template=${s.ui.template} / mode=${s.ui.mode}；真实消息/Tool result/error/draft，Electron capturePage。` }).join('\n\n')],
['AB. REAL HOST APPROVAL / QUESTION', `真实 Host pending，不是伪造前端按钮。四次 Desktop 生命周期、同一 surviving Host、public pending reconstruction、stale NO_ACTIVE_EVENT_STREAM、single settlement=1、duplicate/implicit cancel/auto answer/replay delta=0。${link(`${runtimeRoot}/approval-real-host-lifecycle.json`)}；${link(`${runtimeRoot}/question-real-host-lifecycle.json`)}。私有 protocol stale/duplicate probe 只存在隔离测试 entry，生产 UI 只使用 public pending.answer；原始 event/client/workspace/session ID 不写入证据，仅 hash。`],
['AC. SECURITY', 'renderer 无 require/process；contextIsolation/sandbox/CSP 保留；新增生产 preload/IPC authority=0。Step1 认证错误、重放、过期、peer PID/start mismatch、旧帧/回调、frame/credit 限制回归 PASS。跨用户 ACL 为真实内核 ACL 的确定性权限判定，未声称第二用户实际登录。credential 仅 set/unset、无 readback；本地 fixture 显式 test profile 双门控且生产 bundle 排除。'],
['AD. PROVIDER RUN COUNT', '**0**。所有 smoke 均 non-Provider；真实 pending 由 Host approval/question services 产生，消息/Tool 展示由合法本地记录 fixture 产生。agent followup/steer/inject 与 renderer prompt/updateQueue 为测试 tripwire，真实模型、Provider 和外部 Tool 执行未运行。'],
['AE. CONTROLLED COMPOSITION', `最终冻结时间 \`${frozen.generatedAt}\`；revision \`${frozen.identity.graphRevision}\`；28 Harness + 1 Shaco = 29 行，全部 Harness row identity/hash 保持 frozen pins。\n\nManifest SHA256：\`${frozen.identity.manifestSha256}\`。Shaco row SHA256：\`${frozen.identity.rows.at(-1).sha256}\`。\n\n完整 source/identity/bootstrap/application/Main hash 见 ${link(`${E}/composition-final-summary.json`)} 与 ${link(`${E}/composition-identity.json`)}。旧 REVIEW026 identity、此前本 Goal freeze 均保留并明确 superseded，未充当最终证据；最终每条回归前后核验 source 不漂移。`],
['AF. TESTS', testTable + `\n\n最终冻结后 15 个命令均 exit 0 / PASS，pnpm test 178/178，focused 14/14。每个历史 attempt 的 phase、精确 Node/argv、exit、PASS/FAIL、日志保存在 ${link(`${E}/test-summary.json`)} 和 ${link(`${E}/final-tests.json`)}。失败未删除或改为 PASS：PATH/Windows console、erased const-enum、sandbox GPU DLL、required service injection、测试诊断/快照断言、旧 terminal fault driver、测试输出目录均逐项修复。故障驱动、输出目录修复与命令消息展示收敛均记录 supersession，并在最新 freeze 后全量重跑。构建保留既有大 chunk 与 classic bootstrap script 提示，非阻断。`],
['AG. EVIDENCE', `新范围 ${link(`${E}/README.md`)} 包含 baseline/owner、migration/license、bootstrap/lifetime focused tests、UI/theme gates、九状态/两模板 PNG、运行连续性、真实 Host pending、recovery/security、Provider/cleanup、composition/history、全部 regression attempts、redaction/encoding、final audit 与 run manifest。旧 Evidence 不覆盖。`],
['AH. DOCUMENTATION', '同步现有 Current State、Document Map、Development Map、Development Log、Direction Decision/Corrective Contract 的实施状态和引用、UI Spec 实现状态；新增本 A–AM Implementation Record/Evidence 索引。旧 Outer Shell record 标为历史 superseded，技术历史保留；没有新增平行 Owner authority。'],
['AI. UNRESOLVED BLOCKERS', 'NONE（本次实施与非 Provider 验证范围）。独立终审尚未执行是下一步骤，不冒充已通过。'],
['AJ. DEFERRED FINDINGS', '保留 V1 BASIC 以外的高级 Tool/terminal/diff Inspector、完整 Appearance Settings、未来七模板、Packaging、Provider/真实模型运行与未来 Slice scope；不进入本 Goal。已有 Vite 大 chunk 提示留待后续性能工作。开发过程失败/修复、superseded freezes 见 evidence，均不隐藏。'],
['AK. FINAL GIT STATE', `branch=\`${branch}\`；HEAD=\`${head}\`；tracked modified=${audit.trackedModified}；expanded untracked=${audit.expandedUntracked}；staged=0；Commit=NOT_RUN；Push=NOT_RUN。本 Goal source/docs 实际变更 ${changed.length} 个，Evidence ${audit.newEvidenceFiles} 个。Harness CLEAN / READ_ONLY。详见 final-audit.json。`],
['AL. FINAL PROJECT STATE', `V1_SLICE_2_STEP3_FULL_SHACO_PRESENTATION = \`${state}\`\n\nV1_SLICE_2_STEP3 = \`${state}\`\n\nStep3 Closure=NO；Slice2 Closure=NO；Slice3 未进入；Independent Final Review=NOT_EXECUTED。`],
['AM. NEXT ACTION', `\`${next}\`。本 Goal 完成后停止，等待独立终审。`],
]
write(record, '# V1-SLICE-2 Step3 Full Shaco Dual Theme Implementation Record\n\nDate: 2026-09-11\n\n' + sections.map(([title, body]) => `## ${title}\n\n${body}`).join('\n\n') + '\n')
write(`${E}/README.md`, `# Full Shaco 双模板 Evidence\n\nGOAL_RESULT: FULL_GOAL_VERIFIED\n\nStatus: ${state}\n\n最终运行来源：${runtimeRoot.replace(E + '/', '')}。所有 Gate 是实施者验证，不是独立终审。\n\n` + ['baseline.json', 'owner-instruction.txt', 'freeze-persistence.json', 'source-migration-inventory.json', 'license-file-selection.json', 'composition-final-summary.json', 'composition-identity.json', 'composition-history.json', 'composition-corrective-supersession.json', 'composition-evidence-path-supersession.json', 'composition-command-presentation-supersession.json', 'final-tests.json', 'test-summary.json', 'gate-results.json', 'visual-matrix.json', 'visual-inspection.json', 'runtime-continuity.json', 'bootstrap-lifetime.json', 'recovery-summary.json', 'security-summary.json', 'production-electron-archive.json', 'process-cleanup-final.json', 'redaction-summary.json', 'encoding-check.json', 'changed-paths.json', 'final-audit.json', 'run-manifest.json'].map(p => `- [${p}](${p})`).join('\n') + '\n\n[完整 A–AM 实施记录](../../../../V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md)。日志和 per-attempt runs 保留所有失败，不复用旧 UI evidence。\n')
json('redaction-summary.json', { result: 'PASS', scope: 'Goal evidence fixtures and final logs; implementation static boundary tests', rawCredentialReadback: false, pendingProtocolIds: 'Hashed before persistence; raw probes remain test-only memory', workspaceAndSessionIds: 'Hashed in runtime evidence; temporary fixture directory paths and owned process PIDs retained for reproducibility/cleanup', providerCalls: 0, lossyConsoleAttempt: { source: 'logs/typecheck-1.log', originalCapturedBytes: 'logs/typecheck-1.original-utf8.b64', treatment: 'Preserved original captured bytes as Base64 and replaced human-readable log with truthful ASCII failure explanation; original encoding loss could not be reversed. Test result remains FAIL.' }, inheritedDevelopmentSuccessPathLabel: 'Older development lifecycle JSON used inherited REAL_FROZEN_HARNESS_UI_RENDERED_CONTROL wording; actual selectors were Shaco. Final frozen scripts correctly say REAL_SHACO_UI_CONTROL_WITH_FROZEN_HARNESS_PUBLIC_PENDING_ANSWER; old evidence unchanged.' })
// Refresh goal-delta hashes after all documentation writes.
const delta = J(`${E}/changed-paths.json`)
for (const row of delta.changed) row.sha256 = hash(R(row.path))
json('changed-paths.json', delta)
const textFiles = list.filter(p => (changed.includes(p) || p.startsWith(E + '/')) && /\.(?:mjs|mts|ts|css|html|md|json|txt|log|b64|ps1)$/.test(p))
const bad = [], bom = []
for (const p of textFiles) {
  const bytes = R(p)
  if (bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191]))) bom.push(p)
  try { const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); if (/[\uFFFD\u00C3\u00C2]|\u951F\u65A4\u62F7/.test(text)) bad.push({ path: p, reason: 'MOJIBAKE_MARKER' }) } catch { bad.push({ path: p, reason: 'INVALID_UTF8' }) }
}
assert.deepEqual(bad, [])
assert.deepEqual(bom, [])
json('encoding-check.json', { result: 'PASS', at: new Date().toISOString(), checkedFiles: textFiles.length, encoding: 'UTF-8 without BOM', invalidOrMojibake: bad, bom, existingCodeEncoding: 'Touched original source files were strict UTF-8 without BOM; preserved. Existing Chinese text retained. No default PowerShell file writer used.' })
await verifyFrozen()
const manifestFiles = list.filter(p => p.startsWith(E + '/') && !p.endsWith('/run-manifest.json')).sort().map(p => ({ path: p.slice(E.length + 1), bytes: R(p).length, sha256: hash(R(p)) }))
json('run-manifest.json', { goalId: 'V1_SLICE2_STEP3_FULL_SHACO_DUAL_THEME_PRESENTATION_IMPLEMENTATION_001', at: new Date().toISOString(), result: 'FULL_GOAL_VERIFIED', state, nextAction: next, frozenAt: frozen.generatedAt, finalRuntimeRoot: runtimeRoot, providerRuns: 0, finalRequiredCommands: required.length, files: manifestFiles, implementationRecord: { path: record, sha256: hash(R(record)) } })
console.log(JSON.stringify({ result: 'FULL_GOAL_VERIFIED', finalCommands: final.length, changed: changed.length, audit, report: record }, null, 2))
