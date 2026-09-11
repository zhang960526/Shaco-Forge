# V1-SLICE-2 Step3 Full Shaco Presentation Direction Decision

Document Type: `ARCHITECTURE_OWNER_FULL_SHACO_PRESENTATION_DIRECTION_DECISION`

Status: `FROZEN_FOR_IMPLEMENTATION`

Date: `2026-09-11`

## Current — Step3 Owner Closure / Baseline Frozen (2026-09-11)

[Step3 Owner Closure / Freeze Decision](V1-SLICE-2-STEP3-OWNER-CLOSURE-AND-FREEZE-DECISION.md) 已接受 F-IFR-01-TARGETED-REREVIEW PASS（OWNER_SUPPLIED_INLINE_REVIEW_TRANSCRIPT）。F-IFR-01=CLOSED_BY_INDEPENDENT_REREVIEW，UI-G14=CONFIRMED，Step3=PASS / CLOSED / FROZEN；Slice2 仍待独立 Closure Audit。当前阶段只以 Current State 为准。冻结技术条款不变，实现授权已消费；下方 implementation authorization、未闭合、待复审与禁止 commit 的表述保留为历史阶段限制，本次唯一 Closure commit 授权由新 Decision 提供。Visual Acceptance PASS；Visual Polish 延后且不阻断。

当前 raw Evidence 例外：Owner 已批准仅三个确切 Historical Raw Evidence logs 的 whitespace exception，以保持接受时的原始字节。CR-aware 完整检查仍有 27 项，全部位于这三个日志；非豁免暂存内容检查 PASS，三个原始日志 SHA256 / staged blob / byte preservation PASS。KNOWN_RAW_EVIDENCE_FORMATTING_PRESERVED_BY_DESIGN；没有修正或规范化日志。

## Historical — Owner Implementation Acceptance / Freeze (2026-09-11)

本次 GOAL ID `V1_SLICE2_STEP3_FULL_SHACO_DUAL_THEME_PRESENTATION_IMPLEMENTATION_001` 的 Owner 输入明确确认 REVIEW-027A PASS、NEW_BLOCKING_FINDINGS NONE、基线 findings 未重开，并接受 BRAUN + FAMICOM required Delta。本节是该输入在现有 Direction Decision 的持久化，不是执行者独立 Review。原始输入及 SHA256 见 [baseline](evidence/V1-SLICE-2/STEP-3/STEP3-20260911-FULL-SHACO-DUAL-THEME-01/baseline.json)；不声称本地存在完整 REVIEW-027/027A 报告。

```text
REVIEW_027 = PASS
REVIEW_027A = PASS
NEW_BLOCKING_FINDINGS = NONE
REVIEW_027_BASELINE_FINDINGS_REOPENED = NONE
DUAL_THEME_DELTA = ACCEPTED
FULL_SHACO_PRESENTATION_CORRECTIVE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
FULL_SHACO_PRESENTATION_IMPLEMENTATION_AUTHORIZATION = YES
ASTRA_LONG_GOAL_AUTHORIZATION = YES
V1_REQUIRED_THEME_TEMPLATE_COUNT = 2
V1_REQUIRED_THEME_TEMPLATES = BRAUN,FAMICOM
V1_DEFAULT_THEME_TEMPLATE = BRAUN
THEME_ARCHITECTURE = MODE_PLUS_TEMPLATE
FULL_SHACO_PRESENTATION_OPTION = OPTION_B_PUBLIC_LOWER_LEVEL_CLIENT_BOOTSTRAP
V1_CURRENT_STEP = V1_SLICE_2_STEP3_F_IFR_01_FINALIZED
V1_SLICE_2_STEP3 = IMPLEMENTED_WAITING_INDEPENDENT_REREVIEW
V1_CURRENT_NEXT_ACTION = INDEPENDENT_REREVIEW_F_IFR_01_FULL_SHACO_DUAL_THEME_STEP3
PROVIDER_GATE_AUTHORIZATION = NO
STEP3_CLOSURE = NO
SLICE2_CLOSURE = NO
ACTIVE_CURRENT_AUTHORITY_COUNT = ONE
```

现有 Corrective Contract 在 entry SHA256 `976e9cc8baabc0f7a1727dc6b49e0753c5090eb84366e6bd7b2f5e4a4fb24793` 核验后冻结用于实现；文件名保留 CANDIDATE。其 §19 所列冲突条款现正式 supersede 旧合同中的 visible Harness UI ownership / AppWebEntry bootstrap / Outer answer UI 禁令；旧原文与非冲突业务/security/fencing 边界保留。

授权范围包括 Product source、focused tests、非 Provider runtime/smokes、主题与 Evidence/docs；Harness 只读、Provider 0、不 Stage/Commit/Push、不 Closure。本节取代下方 historical 文档轮次的暂停/仅文档限制。

## Historical Implementation verification — 2026-09-11

Owner 历史 acceptance/freeze 与技术方向保持。Owner 最新输入仍为 Independent Final Review FAIL（F-IFR-01 HIGH_BLOCKING），Visual Acceptance PASS_FROM_FAILED_FINAL_REVIEW、Direction Alignment ALIGNED。Review 来源 OWNER_INPUT_ONLY。F-IFR-01 已完成 source freeze、新 29-row Controlled Composition 和冻结后完整 15-command 非 Provider 回归，全部 PASS；UI_G14=IMPLEMENTATION_PASS_WAITING_INDEPENDENT_REREVIEW。参见 [现有实施记录 §AO](V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md#ao-f-ifr-01-finalization)。Visual Polish 已非阻断延后至 V1 final polish；独立复审尚未执行，Step3/Slice2 不关闭，Current State 为唯一当前阶段 authority。

## 1. Historical — Decision provenance and authority

本文件忠实持久化本轮 Architecture Owner 明确给出的最终方向：100% Shaco Forge Visible UI + DeepSeek Harness Runtime/Truth Reuse。不是 Agent 自行改变产品方向，不是 Independent Review，也不是新的 Contract Freeze 或 Implementation Authorization。

[Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md) 中现有 Step3 Decision 是旧 Contract Gate Freeze / Implementation Authorization 的历史 authority；该原文禁止修改。现有 Slice2 Owner Decision 记录 earlier contract persistence，不能改写成此次 full-presentation 决策。没有可无损承载此次新决策的同用途 current decision 文件，故新增这一份 Direction Decision；不另建重复 ADR/Owner authority。本轮用户明确限制最多新增 Decision 与 Candidate 两类文档，优先于一般 Documentation Rules 的新 ADR 模板规则。

唯一当前阶段/下一步 authority 仍为 [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md)。本文件负责 Owner 方向，[Corrective Contract Candidate](../03-v1.0-plan/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-CORRECTIVE-CONTRACT-CANDIDATE.md) 负责待审技术条款，两者不争夺执行授权。

## 2. Selected direction

```text
FULL_SHACO_PRESENTATION = SELECTED
ALL_VISIBLE_PRODUCT_UI_OWNER = SHACO_FORGE
VISIBLE_HARNESS_PRODUCT_SHELL = NONE
VISIBLE_HARNESS_BRANDING = NONE
HARNESS_VISIBLE_PRODUCT_UI = NONE
HARNESS_RUNTIME_CAPABILITY_REUSE = YES
HARNESS_BUSINESS_TRUTH_REUSE = YES
HARNESS_RUNTIME_TRUTH_REUSE = YES
HARNESS_VISIBLE_PRODUCT_UI_REUSE = NO
HARNESS_BASELINE_CHANGE_REQUIRED = NO
HARNESS_SOURCE_EXTENSION_REQUIRED = NO
HARNESS_REBASELINE_REQUIRED = NO
ONE_CLIENT_RUNTIME = YES
ONE_CORDIS_CONTEXT = YES
ONE_REACT_ROOT = YES
SECOND_WORKSPACE_SESSION_CONVERSATION_TRUTH = FORBIDDEN
SECOND_AGENT_RUNTIME = FORBIDDEN
SECOND_APPROVAL_QUESTION_SETTLEMENT_TRUTH = FORBIDDEN
FULL_SHACO_PRESENTATION_PUBLIC_API_FEASIBILITY = CONFIRMED
FULL_SHACO_PRESENTATION_OPTION = OPTION_B_PUBLIC_LOWER_LEVEL_CLIENT_BOOTSTRAP
```

Owner 提供的最近 Headless Audit 判定是 `FULL_SHACO_PRESENTATION_FEASIBLE_ON_CURRENT_HARNESS_PUBLIC_API`，无 blocking headless business API。该输入支持 Workspace、Session、History、Conversation、Streaming、Prompt、Cancel、Tool、Approval、Question、Model、Permission、Provider、Settings、Credential 的复用。Contract Candidate 按当前 Frozen HEAD 重新作只读 public export 核对；没有把该核对命名为独立 Review PASS，也不虚构未在仓库中定位到的 Audit 文档。

Option B 替换最终 Product 的 AppWebEntry UI bootstrap authority：使用已公开 static module table / ClientModuleLoaderTarget / Cordis Context / Loader，等待所有 Required Harness plugins activation，Shaco Product row 注册唯一 visible root，再调用公开 uiRenderer.mount。Boot/Loading/Error 全归 Shaco；不 fallback 到 Harness AppFrame/BootPage。28 个 Frozen Harness client rows 全保留，`MODULE_PRUNING = OUT_OF_SCOPE`。

Owner 选择完整可见 presentation ownership，仍保持最小 Harness Desktop productization 主线与业务复用。UI 以既有 [UI Design Spec](../01-product/SHACO-FORGE-UI-DESIGN-SPEC.md) 和 [Owner-accepted reference](../01-product/assets/SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png) 为准：单 Sidebar + Workbar + ShacoChatWorkspace、Light、低饱和、约 1100px 共用中心轴、底部 Settings、无永久 Inspector、低噪音 Worker state。目标是结构正确，不扩成 Pixel Perfect redesign 或 V1.1/V1.2 UI。

## 3. Presentation reuse and business ownership

```text
V1_PRESENTATION_IMPLEMENTATION_STRATEGY = HARNESS_UI_SOURCE_COPY_AND_ADAPT_FIRST
HARNESS_PRESENTATION_SOURCE_REUSE = DEFAULT_FIRST_CHOICE_WITH_BOUNDARIES
GREENFIELD_UI_REIMPLEMENTATION = FALLBACK_ONLY_WHEN_SOURCE_REUSE_IS_NOT_PRACTICAL
REUSED_CODE_OWNERSHIP = SHACO_OWNED_PRESENTATION_CODE
HARNESS_RUNTIME_PRIVATE_DEPENDENCY = FORBIDDEN
HARNESS_BUSINESS_LOGIC_COPY = FORBIDDEN
PUBLIC_RUNTIME_BINDING_REQUIRED = YES
HARNESS_PRESENTATION_SOURCE_REUSE_COMPLIANCE = REQUIRED_BEFORE_IMPLEMENTATION
```

Architecture Owner 已选择 V1 默认优先复用、复制、抽取并改造 Frozen Harness 已有 Presentation 源码。`COPY_AND_ADAPT_FIRST` 不是机械复制全部 Harness UI；对成熟 Conversation、Message / Chat node、Markdown / content、Tool Result、Composer、Approval、Question、Model Selector、Permission 展示及必要纯 UI helpers/styles/icons，未来 Executor 必须先做 `REUSE vs ADAPT vs GREENFIELD` 评估。源码属于 Presentation、License / Notice 允许、可剥离 private runtime dependency、可重新绑定 Harness public services 且迁移成本合理时，默认 `COPY / EXTRACT / ADAPT`。

迁入后去除 Harness 产品 branding / shell，改为 Shaco-owned components，由 Shaco 维护并按既有 Shaco UI Design Spec 重新组合；运行时只能依赖现有 Harness public package exports/services/snapshots/subscriptions/mutations。禁止 Runtime import packages/**/src/private path/private type/private ctx。

只有单个组件存在 private runtime / private React state 强耦合、携带第二 truth / reducer / registry、迁移要求 private runtime import、迁移代码量与复杂度明显高于薄 Shaco component、具体文件 License / Notice 存在未解决阻碍，或 Shaco 需求远小于原组件而复制引入明显无用复杂度时，才允许局部 Greenfield。必须记录 `SOURCE_REUSE_ASSESSMENT = NOT_PRACTICAL` 与具体事实/理由；“自己写更干净”“我更喜欢新的组件”“为了统一架构”均不是充分理由。该例外不豁免 Candidate Stop Conditions，不形成整体重写许可。

默认顺序为 Copy / Adapt Harness Presentation source → Thin Shaco component consuming Harness public data → 仅在前两者均不充分时采用复杂 Greenfield；进入局部重写必须满足组件级例外记录。目标为最小开发量 + 最大复用已验证 Harness UI + 100% Shaco visible presentation。具体评估与迁移要求见 Candidate §4。

Harness 继续是 Workspace / Session / Conversation / Streaming / Tool / Approval / Question / Model / Permission / Settings / Credential / Agent Runtime 的唯一业务 truth owner。不得复制形成第二 Workspace truth、Session truth、Conversation reducer/store、Tool runtime、pending registry、Approval/Question settlement state machine、Provider/model registry 或 Credential persistence。

Conversation 订阅已组装 chat target；Composer 调用真实 Session prompt/cancel，admission 不等于最终成功；Tool 只需 basic presentation。Approval/Question 的 primary visible UI 归 Shaco，pending 对象与 settlement truth 仍归 Harness，Shaco 只调用已有对象公开 answer。Model、Permission、Settings、Workspace/Session、Native Picker、generation fencing 与 recovery 继续复用现有 business truth。

本地已发现 MIT License、DeepSeek copyright 与 Third-Party Notices，相关 UI package metadata 为 MIT，存在保留 notice 的合规复用路径。该结论不豁免实现前对选定源文件和第三方闭包的检查；材料不足的项必须标记 `NEEDS_OWNER_OR_LEGAL_CONFIRMATION`，不得虚构内部授权。

```text
LOCAL_HARNESS_LICENSE = MIT
COMPLIANCE_STATUS = LOCAL_BASE_TERMS_CONFIRMED_FILE_SELECTION_CHECK_REQUIRED
```

上述本地结论不是 blanket clearance。正式 Implementation 的每个实际迁移来源必须记录 upstream source path、Frozen Harness HEAD、source SHA、target Shaco path、reused/adapted scope、License / Notice handling、private dependency removed、public runtime binding used；记录含义及落点要求见 Candidate §4.3。本轮不实际复制任何 Presentation 源文件。

### 3.1 Post-REVIEW-027 V1 dual Theme Template scope

Owner 最新要求把单个 SHACO_DEFAULT required template 改为 BRAUN + FAMICOM 两个真实模板及最小可用切换。THEME_MODE 仍为 light / dark / system，独立于 THEME_TEMPLATE；完整 Appearance Settings 继续延后。

```text
THEME_ARCHITECTURE = MODE_PLUS_TEMPLATE
V1_THEME_MODE_SUPPORT = LIGHT_DARK_SYSTEM_CAPABLE
THEME_TEMPLATE_EXTENSION_SEAM = REQUIRED
V1_REQUIRED_THEME_TEMPLATE_COUNT = 2
V1_REQUIRED_THEME_TEMPLATES = BRAUN,FAMICOM
V1_DEFAULT_THEME_TEMPLATE = BRAUN
SHACO_DEFAULT_TEMPLATE_ALIAS = BRAUN
MULTIPLE_THEME_TEMPLATES_REQUIRED_IN_V1 = YES
V1_THEME_TEMPLATE_SWITCHING = REQUIRED
FULL_APPEARANCE_SETTINGS_V1 = DEFERRED
HARNESS_COPIED_PRESENTATION_STYLE = NORMALIZE_TO_SHACO_THEME_TEMPLATE_SYSTEM
COPY_ADAPT_THEME_NORMALIZATION = REQUIRED
LONG_TERM_SHELL_STRUCTURE_REFERENCE = SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png
BRAUN_VISUAL_REFERENCE = Braun.png
BRAUN_IS_CURRENT_LONG_TERM_REFERENCE_VISUAL = YES
FAMICOM_VISUAL_REFERENCE = FAMICOM.png
SAME_COMPONENT_TREE = YES
SAME_LAYOUT_AUTHORITY = YES
SAME_HARNESS_TRUTH = YES
DIFFERENT_THEME_TEMPLATE = YES
THEME_TEMPLATE_SELECTOR = V1_REQUIRED_MINIMAL_UI
FULL_THEME_EDITOR = DEFERRED
THEME_MARKETPLACE = FORBIDDEN_V1
CUSTOM_CSS = FORBIDDEN_V1
OTHER_THEME_REFERENCES = FUTURE_ONLY
```

[UI Design Spec §3.3–3.4](../01-product/SHACO-FORGE-UI-DESIGN-SPEC.md) 是图片/视觉 authority；Long-term Shell 与 Braun.png 当前同为 1672 x 941、SHA256 `2f6852676262562b614f9427c83c451ca99c129b4ba770597fd07023e6e35326`，字节相同；FAMICOM.png 为 1672 x 941、SHA256 `3f43f6f1ab08efde8837aa55aa0fab10c8cd092bdd52aa76e2cb902c621f4dab`。Candidate §15.4 持久化路径、bytes 与核验表，本轮不修改图片。

长期 Shell reference 继续管理结构/布局/IA、Sidebar、Workbar、Chat Workspace、约 1100px 中心轴、Composer、无永久 Inspector 与 Project Directory 层级。BRAUN 为默认视觉，覆盖 Sidebar、Workbar、Project Directory、Conversation/Message、Composer、Tool Result、Approval/Question、Model Selector、Permission、Settings 与临时 surfaces。FAMICOM 使用同一布局与业务组件树，按自身 authority 覆盖 palette、surface hierarchy、typography、accent、border、radius、shadow/elevation、spacing/density、control、Sidebar/top-workbar/Chat/Composer/Tool/Approval/Question/temporary recipes，及可行的 icon treatment；不复制第二套业务组件或 Harness runtime。

Candidate §15.5 要求 Settings 或现有低噪入口提供 Braun / FAMICOM 真切换；§16.1 保留 THEME-G01–G05 并新增 G06–G08，全部 REQUIRED / NOT_RUN。两个模板均保留 mode 机制，mode 切换保持选定 template identity、组件树与 Harness truth；不要求各自额外 Pixel Perfect dark reference。未来两模板各至少一张最终真实 Electron full-shell 图，九状态主 Matrix 可由默认 BRAUN 完成，不要求双倍全矩阵；截图不替代运行时绑定连续性证明。

稳定 root attributes 与 semantic CSS tokens + limited recipes 保持。复制的 Harness 固定 skin 必须归一化，不能绕过 Copy/Adapt First；Theme 不得改变 Workspace/Session/Conversation、routing、Prompt/Tool、Approval/Question settlement、Model/Permission/Settings 或 recovery truth。现有 theme 源码只是 EXISTING_THEME_FOUNDATION，本轮不修改。其他现有七种风格参考 FUTURE_ONLY，保留、不实施、不预建特殊代码；禁止 Theme plugin/download/package framework 或复杂 schema engine，完整 Theme editor 延后。

## 4. Historical authority and conditional corrective

本轮 Architecture Owner 明确输入确认 REVIEW-027 为 PASS；本地仓库未定位到独立 REVIEW-027 报告，故本条以该 Owner 输入为结论来源，不虚构报告路径、审查执行记录或新的 Review PASS。其覆盖 Full Shaco Presentation、Option B、Copy/Adapt First、MODE_PLUS_TEMPLATE 的单个 required template 基线；Owner 在 Review 后新增 BRAUN + FAMICOM required scope，必须单独 Delta Review，不把 REVIEW-027 改为 FAIL，也不声称它已覆盖双模板。

```text
REVIEW_027 = PASS
REVIEW_027_THEME_SCOPE = SINGLE_REQUIRED_TEMPLATE_BASELINE
POST_REVIEW_OWNER_THEME_SCOPE_DELTA = BRAUN_PLUS_FAMICOM_REQUIRED
DUAL_TEMPLATE_DELTA_REVIEW_REQUIRED = YES
```

旧 [Frozen Step3 Contract](../03-v1.0-plan/V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-CONTRACT-GATE.md)、[Freeze Decision](V1-SLICE-2-STEP3-CONTRACT-GATE-FREEZE-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md)、Reviews、Evidence、Implementation Record 全部保留原文。

新 Candidate 只有在未来 **Independent Review PASS + Architecture Owner Freeze** 后，才 supersede 旧合同中 AppWebEntry UI ownership、Harness Main Workspace UI ownership、Approval/Question visible UI ownership、Outer answer UI prohibition 的冲突语义。禁止第二 pending/settlement truth 和 internal eventId 依赖的边界继续成立。当前 Owner 方向保持，REVIEW-027 单模板架构基线 PASS 保留，双模板 Delta 条款待审；旧 implementation authorization 已 consumed，真正 Full Shaco Implementation 按本次 Owner 要求暂停，非撤销架构方向/授权。

```text
REVIEW_026 = FAIL
F_026_01 = CLOSED_BY_REVIEW_026B
F_026_02 = OPEN_PENDING_INDEPENDENT_REREVIEW
REVIEW_026B = FAIL
F_026B_01_CORRECTIVE = APPLIED_WAITING_INDEPENDENT_REREVIEW
REVIEW_026C_EXECUTION = DEFERRED_NOT_EXECUTED
REVIEW_026C = DEFERRED_PENDING_FULL_SHACO_PRESENTATION_CORRECTIVE
```

历史 Real Host Approval/Question lifecycle 仍是 business semantics Evidence；由于 visible UI 改变，不能携带旧 Harness UI PASS 作为新 Shaco UI PASS。UI-G01–UI-G18 与九项 visual state matrix 全部 `REQUIRED / NOT_RUN`。未来须重证 Desktop A pending → disconnect → same Host → Desktop B Shaco cold rebuild → 一次明确 settlement；duplicate、auto answer/replay/cancel 均为 0。

当前 [REVIEW026B final composition identity](evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026B-CORRECTIVE-01/composition-identity.json) 继续代表当前 pre-UI-corrective source，本轮不得标记 superseded。未来实际 UI source change 才触发 historical supersession，随后 final source freeze → controlled composition generation → new identity → full regression → Independent Review。

`conversation.hero.chrome`、Harness presentation public extension、Harness rebaseline 已被新 Audit 结论 supersede；本决策不重新提议这些方向。

## 5. Historical — prior documentation-only operation

本轮仅作 V1 Dual Theme Template Scope Documentation Corrective：修改既有 Decision、Candidate、Current State、Development Log；UI Design Spec 仅作图片指纹、BRAUN/FAMICOM authority 与 V1 scope 的局部补充；Document Map 的合同索引状态/当前入口和 V1 Development Map 的当前 route 随 Delta Review 同步。共七份既有文档，无新增平行 ADR/Contract。此明确 Owner 范围优先于先前文档轮次“UI Design Spec 不可改”的操作限制；旧 Frozen Contracts/Freeze Decision、Reviews、Evidence、Implementation Record、所有图片、Product source、tests/scripts 与 Frozen Harness 保持字节不变。

```text
FULL_SHACO_PRESENTATION_CORRECTIVE_CONTRACT = DUAL_TEMPLATE_DELTA_WAITING_INDEPENDENT_REVIEW
V1_SLICE_2_STEP3 = BLOCKED_PENDING_DUAL_TEMPLATE_DELTA_REVIEW
FULL_SHACO_PRESENTATION_IMPLEMENTATION_AUTHORIZATION = PAUSED_PENDING_DUAL_TEMPLATE_DELTA_REVIEW
PROVIDER_GATE_AUTHORIZATION = NO
NEXT_ACTION = INDEPENDENT_REVIEW_V1_DUAL_THEME_TEMPLATE_SCOPE_DELTA
```

Documentation-safe validation 只包括 git status/diff --check、UTF-8/BOM/疑似乱码、Markdown local links、image existence/dimensions/SHA256、Document Map consistency、current authority uniqueness 和 protected byte hashes。build/typecheck/unit/Electron/Worker/smoke/Provider/Packaging/Composition generation/REVIEW-026C 全部 **NOT RUN**。Stage/Commit/Push 全部 **NO**。

若触发 Candidate Stop Conditions，则返回 `ARCHITECTURE_OWNER_REASSESS_REQUIRED`，不得自行扩展 Scope。正常完成后停止，交给 Independent Review V1 Dual Theme Template Scope Delta，不开始 Implementation。
