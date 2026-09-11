# Shaco Forge UI Design Spec

| Field | Value |
|---|---|
| Document Role | `SHACO_FORGE_UI_SINGLE_SOURCE_OF_TRUTH` |
| UI Spec Status | `ACTIVE` |
| Version | `V1.0-FIRST-FORMAL-BASELINE` |
| Scope | V1.0 UI contract and V1.1–V1.3 extension direction |
| Product Implementation | `IMPLEMENTED_WAITING_INDEPENDENT_FINAL_REVIEW` |
| Owner Review | `PASS` |
| UI Design Baseline Ready | `YES` |
| UI Direction Ready for Slice 1A | `YES` |
| Current Post-1C Allocation | `SLICE_2_STEP3_FULL_SHACO_BRAUN_FAMICOM_IMPLEMENTED_WAITING_REVIEW` |
| Initial Primary Theme | `LIGHT` |
| Last Updated | `2026-09-11` |

> 本文是 Shaco Forge 正式 UI 决策的唯一真相来源。聊天中讨论但未写入本文的内容，不构成冻结决定。若本文与更高优先级的产品、架构或治理 Authority 冲突，以 [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md) 定义的 Authority Order 为准，并必须在本文中完成显式同步，禁止依靠聊天记忆静默覆盖。

## Current implementation evidence — 2026-09-11

本轮实现 BRAUN 默认模板、FAMICOM 模板、真实 Settings selector 与独立 light/dark/system mode。Shell/Conversation/Composer/Tool/Approval/Question/Model/Permission/Settings 均由同一 Shaco 组件树呈现。最终视觉与运行切换证据见 [实施记录](../04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md) 和 [九状态 Matrix](../04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260911-FULL-SHACO-DUAL-THEME-01/visual-matrix.json)。§3.4 模板角色、长期结构 authority、三张只读参考图与未来模板 scope 不变。实现验证不代表 Owner 最终验收；状态/下一步以 Current State 为准。

## 1. Document Status

```text
UI_SPEC_STATUS = ACTIVE
UI_SINGLE_SOURCE_OF_TRUTH = docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md
UI_SPEC_OWNER_REVIEW = PASS
UI_DESIGN_BASELINE_READY = YES
UI_DIRECTION_READY_FOR_SLICE_1A = YES
UI_LONG_TERM_SHELL_OWNER_ACCEPTED = YES
UI_LONG_TERM_SHELL_OWNER_DECISION = ACCEPTED
UI_LONG_TERM_SHELL_VISUAL_REFERENCE = ACCEPTED
FURTHER_VISUAL_ADJUSTMENT = NOT_REQUIRED
UI_LONG_TERM_SHELL_DOCUMENTATION_SYNC_OWNER_REVIEW = PASS
UI_LONG_TERM_SHELL_OWNER_CLOSURE = ACCEPTED
UI_NAVIGATION_ARCHITECTURE_CORRECTIVE = CLOSED
UI_LONG_TERM_SHELL_BASELINE = FROZEN_FOR_IMPLEMENTATION
UI_LONG_TERM_SHELL_ARCHITECTURE = FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY
UI_SIDEBAR_STRUCTURE = FIXED_FUNCTION_AREA + PROJECT_DIRECTORY + GLOBAL_SETTINGS
FIXED_FUNCTION_AREA_ROLE = START_OR_ENTER_CAPABILITY
PROJECT_DIRECTORY_ROLE = BROWSE_AND_REOPEN_EXISTING_PROJECT_WORK
UI_PROJECT_DIRECTORY_MODEL = PROJECT_GROUPED_TYPED_WORK_RECORDS
KNOWLEDGE_BASE_SCOPE = NOT_FROZEN
OLD_CURRENT_NAVIGATION = PROJECT_FIRST_TYPED_WORK_ITEMS_AS_COMPLETE_SHELL
OLD_CURRENT_NAVIGATION_STATUS = SUPERSEDED_BY_FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY
PROJECT_GROUPED_TYPED_WORK_ITEMS = RETAINED_AS_PROJECT_DIRECTORY_MODEL
UI_CHAT_ITEM_TRUTH = HARNESS_SESSION
UI_AUTOMATION_ITEM = FUTURE_SHACO_DOMAIN
UI_AGENT_COLLABORATION_ITEM = FUTURE_SHACO_DOMAIN
SHARED_WORK_ITEM_RUNTIME_DOMAIN = NOT_CREATED
SHARED_WORK_ITEM_RUNTIME_DOMAIN_CREATED = NO
V1_SLICE_1C_UI_ALLOCATION = EMBEDDED_APPWEBENTRY_PRIMARY_LOOP
V1_SLICE_1C_SHACO_SHELL = PASSIVE_TRUTHFUL_WRAPPER
V1_SLICE_1C_EXTERNAL_APPWEBENTRY_CONTROL = PUBLIC_SEAM_NOT_FOUND
V1_SLICE_1C_PROJECT_SESSION_NAVIGATION = DELEGATED_TO_APPWEBENTRY
V1_SLICE_1C_NATIVE_PICKER = NOT_REQUIRED_FOR_EMBEDDED_LOOP
V1_SLICE_1_PASSIVE_TRUTHFUL_WRAPPER = ACCEPTED_FINAL_FOR_SLICE_1
V1_SLICE_1_ADDITIONAL_UI_IMPLEMENTATION = NONE
V1_SLICE_1D = DO_NOT_CREATE
V1_SLICE_1E = DO_NOT_CREATE
FINAL_V1_0_SIDEBAR_PROJECT_SESSION_PROJECTION = STILL_REQUIRED
V1_SLICE_2_SIDEBAR_PROJECT_SESSION_PROJECTION = ALLOCATED
FINAL_V1_0_NEW_CHAT_WIRING = STILL_REQUIRED
V1_SLICE_2_NEW_CHAT_WIRING = ALLOCATED
FINAL_V1_0_GLOBAL_SETTINGS_INTEGRATION = STILL_REQUIRED
V1_SLICE_2_GLOBAL_SETTINGS_INTEGRATION = ALLOCATED
FINAL_V1_0_NATIVE_PICKER_REQUIREMENT = STILL_REQUIRED
V1_SLICE_2_NATIVE_PICKER = ALLOCATED
FINAL_V1_0_APPROVAL_QUESTION_CANCEL_PROJECTION = STILL_REQUIRED
V1_SLICE_2_APPROVAL_QUESTION_CANCEL_PROJECTION = ALLOCATED
LONG_TERM_UI_BASELINE_REPLACED = NO
FINAL_V1_0_UI_SCOPE_REDUCED = NO
VISIBLE_FIXED_FUNCTIONS = NEW_CHAT_ONLY
VISIBLE_PROJECT_RECORD_TYPES = CHAT_ONLY
VISIBLE_GLOBAL_ENTRY = SETTINGS
SETTINGS_SCOPE = GLOBAL_APPLICATION_SURFACE
MAIN_WORKSPACE_ROUTING = BY_FUNCTION_OR_SELECTED_RECORD_TYPE
CHAT_CONTENT_LAYOUT = CENTERED_FIXED_MAX_WIDTH
CHAT_CONTENT_MAX_WIDTH_TARGET = APPROXIMATELY_1100PX
RESPONSIVE_SHRINK = REQUIRED
INSPECTOR_POLICY = NO_PERMANENT_RIGHT_INSPECTOR
V1_0_INITIAL_PRIMARY_THEME = LIGHT
DESIGN_SYSTEM_LIGHT_DARK_CAPABLE = YES
V1_0_IMPLEMENTATION_SCOPE = HARNESS_REUSE_PRODUCTIZATION
V1_0_PROVIDER_MODEL_OWNERSHIP = HARNESS
PROVIDER_MODEL_ROUTING = HARNESS_OWNED
MULTI_MODEL_SUPPORT = REUSE_HARNESS
MULTI_AGENT_ORCHESTRATION = FUTURE_SHACO_DOMAIN
```

`UI_LONG_TERM_SHELL_BASELINE = FROZEN_FOR_IMPLEMENTATION` 表示后续 V1.0 Shell 实现必须遵守本文和 Owner-accepted Visual Reference；它不把 Hex、exact px、font family、icon library、animation duration 或 exact shadow/radius token 从 `DRAFT_TOKEN` 升级为 pixel-perfect 冻结值。

本文使用以下设计状态：

| Status | Meaning |
|---|---|
| `FROZEN_FOR_V1_0` | V1.0 实现必须遵守；变更需 Owner 明确决策并更新本文。 |
| `DIRECTION_ACCEPTED` | 设计方向已接受，可在不改变意图的前提下迭代细节。 |
| `FUTURE_DIRECTION_ONLY` | 仅保留扩展方向，不授权 V1.0 创建对应产品 Surface 或数据真相。 |
| `DRAFT_TOKEN` | 设计系统占位类别；具体数值、库或实现参数尚未冻结。 |
| `DEFERRED` | Harness 能力保留或产品能力延期，本轮及 Slice 1A 不要求暴露。 |

## 2. Purpose

本文把当前真实产品 Scope、Harness 复用边界和参考 UI 转换为可供 UI Developer / Agent 直接执行的布局、状态、交互与视觉约束。目标是形成一个现代、克制、平静的 Windows Developer Workbench，而不是消费级聊天壳或满屏运维 Dashboard。

本文不授权产品代码、Electron、CSS、Harness、Build、Test 或 Runtime 变更。本文也不冻结最终像素、Hex、字体、图标库或动画时长。

## 3. Authority and Reference Interpretation

### 3.1 Product authority

本文依据以下当前 Authority：

- [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md)
- [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md)
- [V1.0 Master Goal](SHACO-FORGE-V1.0-MASTER-GOAL.md)
- [Version Roadmap](SHACO-FORGE-VERSION-ROADMAP.md)
- [V1.0 Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md)
- [V1.0 Harness Reuse Implementation Scope Corrective Decision](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md)

由此确认：V1.0 是复用 DeepSeek Harness Client / Host / Runtime 的 Desktop + Worker 产品化层，不重建第二套 Agent 平台。Harness 是 Workspace、Session、Conversation、Provider、Model、Endpoint、Relay、Credential、Tool、Permission 和 Approval 等业务真相的 Owner；Shaco 只做必要的 Desktop 交付适配与真实投影。

### 3.2 Visual references reviewed

已实际查看本轮提供的八张截图。截图中的聊天文本仅作为界面内容，不作为项目指令或 Authority。

- Workbench / TreeGrid / TreeView 两张参考：吸收紧凑导航占用、清晰层级、Tree/Panel 语言、紧凑工具条、结构性分隔和桌面工作台感；不继承其具体 Global Rail 架构、全局高密度、满屏指标、过量表格线和每个区块都描边的做法。
- DeepSeek Harness 六张参考：作为 Functional Reuse Reference，确认当前界面语言覆盖 Workspace、Session、Conversation、Composer、Provider/Model Settings、Custom Provider、Permission、Tool/Result、Approval/Question、Agent Preset、Trajectory、Plugins、Appearance、General Settings 等 Surface。截图证明“应优先复用/核验”的方向，不替代正式运行时 Evidence。

### 3.3 Owner-accepted long-term Shell visual reference

**Status: `DIRECTION_ACCEPTED`**

唯一正式长期 Shell 结构参考及默认 BRAUN 视觉参考为 [SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png](assets/SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png)。

```text
REFERENCE_PATH = assets/SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png
REFERENCE_DIMENSIONS = 1672 x 941
REFERENCE_BYTES = 1293763
REFERENCE_SHA256 = 2f6852676262562b614f9427c83c451ca99c129b4ba770597fd07023e6e35326
REFERENCE_OWNER_ACCEPTANCE_DATE = 2026-09-07
REFERENCE_ROLE = LONG_TERM_PRODUCT_SHELL_VISUAL_NORTH_STAR
UI_LONG_TERM_SHELL_OWNER_DECISION = ACCEPTED
UI_LONG_TERM_SHELL_VISUAL_REFERENCE = ACCEPTED
FURTHER_VISUAL_ADJUSTMENT = NOT_REQUIRED
```

该图是长期产品 Shell 的结构、视觉语言、主要比例和信息层级的权威参考，不是 pixel-perfect executable contract，也不是 `V1.0 release screenshot`。它不表示图中的全部未来功能已经在 V1.0 实现；实现时必须同时遵守本文的 V1.0 Reduced Release View。该参考保持 Owner 已接受的 Light、Low Saturation、Modern Developer Workbench、Flat First、Structural Border、临时抬升 Surface 才使用 Soft Shadow、Small / Medium Radius、Outline Type Icons、右侧用户内容、左侧 Assistant 内容、顶部右侧低噪音 Worker 状态、左下 Settings 与无常驻右侧 Inspector 的视觉语言，不再要求替代视觉稿或进一步重绘。

### 3.4 V1 BRAUN / FAMICOM Template Authority (2026-09-11 Owner scope delta)

本节仅补充 Theme reference 与 V1 required scope，不重写原 Shell 结构设计。原长期参考路径保持；上次登记的 1660 x 948 / 1467362 bytes / SHA256 `17874257C520533D65E0ACA1B45001F74C372178371BDE51EBB60AEB90F77BC0` 为历史图片 identity，2026-09-07 为原结构 Owner acceptance 日期。本轮按 Owner 最新输入与实际文件核验更新当前图片指纹，不声称新图片在旧日期已被核验。

```text
LONG_TERM_SHELL_STRUCTURE_REFERENCE = SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png
BRAUN_VISUAL_REFERENCE = Braun.png
BRAUN_IS_CURRENT_LONG_TERM_REFERENCE_VISUAL = YES
FAMICOM_VISUAL_REFERENCE = FAMICOM.png
SAME_COMPONENT_TREE = YES
SAME_LAYOUT_AUTHORITY = YES
SAME_HARNESS_TRUTH = YES
DIFFERENT_THEME_TEMPLATE = YES
V1_REQUIRED_THEME_TEMPLATE_COUNT = 2
V1_REQUIRED_THEME_TEMPLATES = BRAUN,FAMICOM
V1_DEFAULT_THEME_TEMPLATE = BRAUN
SHACO_DEFAULT_TEMPLATE_ALIAS = BRAUN
MULTIPLE_THEME_TEMPLATES_REQUIRED_IN_V1 = YES
V1_THEME_TEMPLATE_SWITCHING = REQUIRED
THEME_ARCHITECTURE = MODE_PLUS_TEMPLATE
V1_THEME_MODE_SUPPORT = LIGHT_DARK_SYSTEM_CAPABLE
FULL_APPEARANCE_SETTINGS_V1 = DEFERRED
THEME_TEMPLATE_SELECTOR = V1_REQUIRED_MINIMAL_UI
FULL_THEME_EDITOR = DEFERRED
THEME_MARKETPLACE = FORBIDDEN_V1
CUSTOM_CSS = FORBIDDEN_V1
OTHER_THEME_REFERENCES = FUTURE_ONLY
```

| Visual authority | Dimensions | Bytes | SHA256 | V1 role |
|---|---|---|---|---|
| [Long-term Shell](assets/SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png) | 1672 x 941 | 1293763 | `2f6852676262562b614f9427c83c451ca99c129b4ba770597fd07023e6e35326` | 唯一长期结构/布局/IA authority；与 Braun.png 字节完全相同 |
| [Braun.png](assets/Braun.png) | 1672 x 941 | 1293763 | `2f6852676262562b614f9427c83c451ca99c129b4ba770597fd07023e6e35326` | BRAUN 默认 Template visual authority |
| [FAMICOM.png](assets/FAMICOM.png) | 1672 x 941 | 1375052 | `3f43f6f1ab08efde8837aa55aa0fab10c8cd092bdd52aa76e2cb902c621f4dab` | FAMICOM required Template visual authority |

两模板使用相同 Shell、Sidebar/Workbar 位置、Project Directory 层级、Chat Workspace、约 1100px 中心轴、Composer 位置与无永久 Inspector 规则，V1 reduced exposure 不变。原低饱和、flat-first 等默认外观描述用于 BRAUN；FAMICOM 在相同结构与业务组件树上按自身 reference 表达 palette、surface hierarchy、typography、accent、border、radius、shadow/elevation、spacing/density、control styling、Sidebar/top-workbar/Chat/Composer/Tool/Approval/Question/temporary recipes 和可行的 icon treatment。模板差异只影响 presentation，不改变布局 authority 或业务 truth。

BRAUN 与 FAMICOM 都是 V1 required implementation，覆盖 Sidebar、Workbar、Project Directory、Conversation/Message、Composer、Tool Result、Approval/Question、Model Selector、Permission、Settings 与 temporary surfaces。提供最小真实 Braun/FAMICOM selector；完整 Appearance Settings/editor 继续延后。mode 仍 light/dark/system，独立于 template；不要求额外 Pixel Perfect dark reference，但两模板不得破坏 mode 能力。其他参考 Cyberdeck、Game Boy、IBM Terminal、Macintosh 1984、NASA、Sony Walkman、Windows 98 均保留为 FUTURE_ONLY，不实现或预建专用代码。

本 scope 由 [Owner Direction Decision](../04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-DIRECTION-DECISION.md) 持久化；精确 runtime switching、样式归一化与 THEME-G01–G08 验收见 [Corrective Contract](../03-v1.0-plan/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-CORRECTIVE-CONTRACT-CANDIDATE.md) §15–17。REVIEW-027 的单模板架构基线 PASS 不覆盖本次双模板 Delta；当前 Implementation 暂停等待 Delta Review，本节不授权代码或 Runtime。

## 4. Product UI Principles

1. **Harness truth first.** Harness 已拥有的业务能力优先复用 Harness UI 或交互语义；Shaco 不建立第二套数据真相。
2. **One desktop workbench.** 一个主窗口使用固定功能区、Project Directory 与 Global Settings；当前功能或 selected record type 在同一 Shell 内路由到对应 Main Workspace。
3. **Launch capability, browse records.** 固定功能区用于开始或进入能力；Project Directory 用于浏览和重新打开 Project 下已经存在的 typed work records，二者职责不重复。
4. **Content before chrome.** Chat 以对话和输入为中心，降低装饰、指标和常驻工具噪音。
5. **Progressive disclosure.** 高级详情通过 Drawer、Inspector、Popover 或 Detail View 按需出现。
6. **Density follows selected item type.** Chat 低/中密度；Automation、Agent Collaboration 中/高密度；Diagnostics 高密度。
7. **Structural borders, flat first.** 边框和阴影服务于结构、临时抬升与交互反馈，不做装饰性卡片堆叠。
8. **Truthful state.** 连接、Worker、Loading 和 Error 必须反映真实状态，不能用乐观 UI 假装成功。
9. **Accessible interaction.** 所有关键操作支持键盘 Focus；关键状态不只依赖颜色。
10. **No speculative UI.** V1.0 不展示未实现未来功能的占位入口、空表或 `Coming Soon`。

## 5. Project / Workspace Context Model

**Status: `FROZEN_FOR_V1_0`**

```text
V1_0_PROJECT_CONTEXT_REQUIRED = YES
V1_0_GENERAL_CHAT = NOT_SUPPORTED
PROJECT_RUNTIME_TRUTH = HARNESS_WORKSPACE
SECOND_PROJECT_TRUTH = FORBIDDEN
WORK_ITEM_PROJECT_CONTEXT = IMPLICIT_FROM_PARENT_PROJECT
PROJECT_SWITCHING = SIDEBAR_PROJECT_NAVIGATION
PROJECT_SELECTOR_AT_MODE_SIDEBAR_TOP = SUPERSEDED
```

“Project”是产品 UI 对用户的概念名称；V1.0 底层映射并复用 Harness Workspace。Project 是 Sidebar 中的一级组织节点，Work Item 是其子节点。选中 `Project A > Chat X` 时，Current Project 隐式为 `Project A`；未来选中 `Project B > Automation Y` 时，Current Project 隐式为 `Project B`。不再在 Mode-specific Sidebar 顶部重复 Project Selector。

Project switching 通过 Sidebar Project Tree 自然完成。切换前若存在未提交输入、运行中的阻塞性交互或可能丢失的本地 UI 状态，界面必须先给出明确处理路径；不得静默丢弃。是否需要阻塞确认取决于真实丢失风险，不得把每次切换都做成 Modal。

## 6. Application Shell

**Status: `DIRECTION_ACCEPTED` for long-term Shell; `FROZEN_FOR_V1_0` for reduced exposure**

```text
ONE_DESKTOP_SHELL = YES
UI_LONG_TERM_SHELL_ARCHITECTURE = FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY
UI_SIDEBAR_STRUCTURE = FIXED_FUNCTION_AREA + PROJECT_DIRECTORY + GLOBAL_SETTINGS
MAIN_WORKSPACE_ROUTING = BY_FUNCTION_OR_SELECTED_RECORD_TYPE

MAIN WINDOW
├─ Sidebar
│  ├─ Fixed Function Area
│  ├─ Project Directory + Typed Work Records
│  └─ Global Settings
└─ Function- or Record-specific Main Workspace
   └─ Optional on-demand Detail / Inspector
```

- Fixed Function Area：长期完整 Shell 固定提供 `+ 新对话`、`自动化`、`Agent 协作`、`知识库`，用于开始或进入一种能力，不是已有历史记录列表。
- Project Directory：以 Project 为一级节点，展示和重新打开已有 typed work records；长期可混排 Chat、Automation 与 Agent Collaboration。
- Main Workspace：由当前功能或 selected record type 路由；Chat 打开 Harness Conversation Surface，未来 Automation、Agent Collaboration 与 Knowledge Base 使用各自布局，不要求共享同一种 Main Workspace layout。
- Settings：全局应用 Surface，固定在 Sidebar 底部或其他低干扰全局位置，不是 Project child Work Item。
- Optional Inspector：不是常驻第四列；只在当前任务需要详情时出现，可关闭并把空间归还主工作区。

窄窗口时优先保住 Main Workspace；Sidebar 可折叠或以覆盖层展开。响应策略不得把 Fixed Function Area、Project Context 或 Global Settings 隐藏成不可访问状态。V1.0 沿用同一区域结构和视觉语言，但只暴露已经实现的入口。

## 7. Navigation Hierarchy

### 7.1 Current long-term Shell architecture

**Status: `DIRECTION_ACCEPTED`**

```text
UI_LONG_TERM_SHELL_ARCHITECTURE = FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY
UI_SIDEBAR_STRUCTURE = FIXED_FUNCTION_AREA + PROJECT_DIRECTORY + GLOBAL_SETTINGS
FIXED_FUNCTION_AREA_ROLE = START_OR_ENTER_CAPABILITY
PROJECT_DIRECTORY_ROLE = BROWSE_AND_REOPEN_EXISTING_PROJECT_WORK
SETTINGS_SCOPE = GLOBAL_APPLICATION_SURFACE
MAIN_WORKSPACE_ROUTING = BY_FUNCTION_OR_SELECTED_RECORD_TYPE
```

固定功能区回答“我要开始或进入什么能力”；Project Directory 回答“这个 Project 下已经存在什么工作记录”。二者不是重复导航：点击 `+ 新对话` 是在当前 Project 下开始创建新 Chat，点击已有 Chat Item 是重新打开对应 Harness Session；点击 `自动化` 或 `Agent 协作` 是进入未来相应能力的创建/总览 Surface，点击 Project 下的相应 typed record 则打开具体记录或 Run。未来 create flow 的精确细节由对应版本决定。

长期 Sidebar 的当前结构为：

```text
Shaco Forge
AI 开发工作空间

功能
+ 新对话
自动化
Agent 协作
知识库

----------------

项目目录
Shaco-Forge
  Chat — UI Design Discussion
  Chat — Harness Integration
  Agent Collaboration — Architecture Review
  Automation — V1 Build
Todo List
  Chat — Login Issue
Car Spa
  Chat — Product Planning
  Chat — UI Review
  Chat — Bug Investigation

----------------

设置
```

功能路由为：`CHAT` → Harness Conversation / Chat Surface；`AUTOMATION` → future Automation Workspace；`AGENT COLLABORATION` → future Multi-Agent Collaboration Workspace；`KNOWLEDGE BASE` → future Knowledge / Memory Workspace；Project Record → 按真实 record type 路由。`KNOWLEDGE_BASE_SCOPE = NOT_FROZEN`，本轮不冻结它最终是 Project-scoped、global 或 mixed。

### 7.2 Superseded and retained navigation record

```text
OLD_CURRENT_NAVIGATION = PROJECT_FIRST_TYPED_WORK_ITEMS_AS_COMPLETE_SHELL
OLD_CURRENT_NAVIGATION_STATUS = SUPERSEDED_BY_FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY
PROJECT_GROUPED_TYPED_WORK_ITEMS = RETAINED_AS_PROJECT_DIRECTORY_MODEL
PRE_CORRECTIVE_NAVIGATION = MODE_FIRST_GLOBAL_RAIL
PRE_CORRECTIVE_NAVIGATION_STATUS = SUPERSEDED
PROJECT_SELECTOR_AT_MODE_SIDEBAR_TOP = SUPERSEDED_BY_SIDEBAR_PROJECT_NAVIGATION
MODE_SWITCH_PRESERVES_PROJECT = SUPERSEDED_BY_IMPLICIT_PARENT_PROJECT_CONTEXT
```

这是变更记录，不是并行可用的 current architecture。上一轮 Corrective 的“纯 Project Tree 是整个 Shell”判断已被 Owner 最终决定取代；其有效部分——Project grouping 与 Project 下的 typed work records——完整保留为 Project Directory 模型。更早的 Mode-first Global Rail、Mode-specific Sidebar 顶部 Project Selector，以及按 Mode 切换后保持 Project 的交互模型也继续保持 superseded。本文只存在一个 current Long-Term Shell Architecture，即 `FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY`。

### 7.3 Typed Work Item semantics

`TYPED_WORK_ITEM` 只是 Sidebar 统一分类术语，不是新的 V1.0 Runtime Domain。

```text
TYPED_WORK_ITEM != NEW_V1_0_RUNTIME_DOMAIN
SHARED_WORK_ITEM_RUNTIME_DOMAIN = NOT_CREATED
SHARED_WORK_ITEM_RUNTIME_DOMAIN_CREATED = NO
CHAT_ITEM_TRUTH = HARNESS_SESSION
AUTOMATION_ITEM_TRUTH = FUTURE_SHACO_DOMAIN
AGENT_COLLABORATION_ITEM_TRUTH = FUTURE_SHACO_DOMAIN
```

禁止因此创建 WorkItem database、table、state machine、persistence truth 或第二套 Harness Session truth。类型由真实底层记录决定，不得通过 fake item 或 fixture 填充导航。

未来同一 Project 下允许 Chat、Automation 与 Agent Collaboration 混排，通过类型图标识别，并分别路由到 type-specific Main Workspace；不得强制拆成三个全局页面。

### 7.4 V1.0 Reduced Release View

**Status: `FROZEN_FOR_V1_0`**

```text
VISIBLE_FIXED_FUNCTIONS = NEW_CHAT_ONLY
VISIBLE_PROJECT_RECORD_TYPES = CHAT_ONLY
VISIBLE_GLOBAL_ENTRY = SETTINGS
HIDDEN_FUTURE_FUNCTIONS = AUTOMATION + AGENT_COLLABORATION + KNOWLEDGE_BASE
```

长期 Shell 展示完整产品演进方向，不代表 V1.0 已完成全部能力。V1.0 使用相同的 Sidebar 区域结构和视觉语言，但 Fixed Function Area 只显示 `+ 新对话`，Project Directory 只显示真实 Chat records，Global Entry 显示 Settings。Automation、Agent Collaboration 与 Knowledge Base 在真实实现完成前必须完全隐藏；禁止 `Coming Soon`、Disabled future entry、fake future record 或 placeholder Surface。

## 8. Project Directory Navigation

**Status: `FROZEN_FOR_V1_0`**

Project Directory 的职责是浏览和重新打开已有 Project 工作。Project Row 显示项目名、expand/collapse、Selected 状态与可选的 project-level create `+` shortcut，并映射 Harness Workspace。Context menu 可未来增加。示例：

```text
▾ Shaco-Forge                                      +
   [chat icon] UI Design Discussion
   [chat icon] Harness Integration
```

```text
PROJECT_OVERVIEW = NOT_FROZEN
```

点击 Project 名称本身是否打开独立 Project Overview / Dashboard 为 `NOT_FROZEN`。V1.0 不为 Project Node 创建空 Dashboard；Project Row 当前主要承担 select、expand、collapse、create 与未来 context action。

Project 与 Item 的 Selected 状态必须明显强于 Hover。长路径作为次级信息按需展示，常态优先显示可识别名称。`Open Project…` 使用 Native Workspace Picker，并把结果交给 Harness Workspace truth。失效目录不能显示为已成功进入；应标记不可用并提供重新定位或移除 Recent 记录的路径。Project-level `+` 只是上下文快捷入口，不取代 Fixed Function Area：V1.0 它若存在也只能创建真实 Chat。

## 9. No Project State

**Status: `FROZEN_FOR_V1_0`**

未选择有效 Project / Workspace 时，不渲染假的空 Chat，也不允许进入任何项目型功能。主工作区显示简洁启动页：

- `Recent Projects`
- `Open Project…`
- `Global Settings`

允许恢复上次有效 Workspace；恢复前必须验证目录仍有效。失效目录不得被未经确认地自动进入。无 Project 时不得创建任何 typed Work Item，也不得显示可发送的空 Chat。

空状态不用大型插画、营销 Hero 或示例 Dashboard。主要动作是 `Open Project…`，Recent Project 为次级选择，Global Settings 为低强调入口。

## 10. V1.0 Chat

**Status: `FROZEN_FOR_V1_0`**

### 10.1 Layout

```text
┌──────── V1.0 Reduced Sidebar ───────┬────────── Chat Main Workspace ────────────┐
│ Shaco Forge                         │       Centered Header / true state          │
│ 功能                               │                                            │
│ + 新对话                           │       Centered Conversation                  │
│ ─────────────────────────────────  │       + Tool / Process Content              │
│ 项目目录                           │       max-width: approximately 1100px        │
│ ▾ Shaco-Forge                    +  │                                            │
│   [chat] UI Design                  │       Centered Composer                     │
│   [chat] Harness Integration        │       max-width: approximately 1100px        │
│ ▾ Todo List                      +  │                                            │
│   [chat] Login Issue                │                                            │
│                                    │                                            │
│ 设置                               │                                            │
└────────────────────────────────────┴────────────────────────────────────────────┘
```

### 10.2 V1.0 Sidebar

Sidebar 保持 Fixed Function Area、Project Directory 与 Global Settings 的长期区域结构。V1.0 Fixed Function Area 只显示 `+ 新对话`；Project Directory 必须支持 Search、真实 Workspace / Project grouping、Project expand/collapse、可选 Project-level `New Chat` shortcut、真实 Harness Session list/select；底部显示 Global Settings。每个 Chat Item 的真实映射是 Harness Session：

```text
CHAT_ITEM_TYPE = CHAT
CHAT_ITEM_TRUTH = HARNESS_SESSION
```

Chat Item 使用 conversation/message 语义的 Outline 图标，并优先展示可识别标题与必要轻量元数据；默认不展示 token、PID、Port、Carrier ID 或内部 ID。禁止 fake Project、fake Session、fake Chat Item 和 fixture Item。

### 10.3 Create and scale model

Fixed Function Area 的 `+ 新对话` 是长期 Shell 与 V1.0 的正式 Chat create / entry launcher；已有 selected Project 时在其中创建，无 Project 时必须先选择或打开 Project，不能绕过 Project Context。Project Row 的 `+` 可以作为 context-aware shortcut：V1.0 只显示 `New Chat`。V1.1 Automation 与 V1.2 Agent Collaboration 真实完成后，对应 fixed launcher 与 Project typed records 才同时出现。禁止 Coming Soon、Disabled future type 或 placeholder。

当 Item 增多时允许轻量 Search、`All / Chat / Automation / Agents` 类型 Filter，以及 `Today / Yesterday / Earlier` 时间分组。V1.0 只有 Chat Item 时，不显示没有实际价值的类型 Filter。具体控制样式不做 pixel freeze。

### 10.4 Chat Main Workspace

选中 Chat Item 后，Main Workspace 打开 Harness Conversation Surface，包含 Conversation、Composer、Tool Result、Approval、Question、Model 与 Permission。必须支持 Conversation、Streaming、Tool / Result 基本呈现，以及 Harness 要求时的 Approval / Question。

```text
CHAT_CONTENT_LAYOUT = CENTERED_FIXED_MAX_WIDTH
CHAT_CONTENT_MAX_WIDTH_TARGET = APPROXIMATELY_1100PX
RESPONSIVE_SHRINK = REQUIRED
CHAT_CENTER_AXIS = HEADER + CONVERSATION + TOOL_PROCESS_CONTENT + COMPOSER
```

Header、Conversation、Tool / Process Content 与 Composer 保持同一中心轴；宽屏时左右自然留白，窄屏时在可用 Main Area 内响应式收缩。Chat 内容与 Composer 不得横向铺满全部 Main Area。长代码、Tool Result 和结构化内容应在该内容系统内使用换行、横向滚动或按需展开，而不是永久破坏中心轴。

Tool Result 默认摘要化，明确区分进行中、成功、失败和需要用户介入；详情可原位展开或进入按需 Inspector。Approval / Question 是任务阻塞性交互，必须在上下文中可发现，且不能被普通 Toast 替代。

### 10.5 Composer

Composer 宽、安静、输入优先。必须包括 Text Input、Model Selector 与最小 Permission state / entry。Model 与 Permission 存在但不争夺主视觉；低频动作进入折叠菜单、Hover affordance 或次级入口。发送、停止等当前主动作在同一时刻保持唯一明确 Primary 层级。

### 10.6 Shaco-specific state

显示 Worker / Connection 的最小真实状态，例如 `Worker · Connected`、`Worker · Starting`、`Connection lost`。默认不显示 PID、Port、Carrier ID、Version SHA 或详细 Runtime metrics；高级诊断按需进入详情 Surface。

### 10.7 Harness reuse rule

Conversation、Session、Provider、Model、Credential、Tool、Permission、Approval 与 Question 优先直接复用 Harness Client UI 或 Harness interaction semantics。Shaco adaptation 只允许解决 Desktop Shell、连接、Native Picker、重连与真实状态投影问题，不借 UI 重构建立第二套业务状态。

## 11. V1.0 Settings

**Status: `FROZEN_FOR_V1_0`**

Settings 的 `SETTINGS_SCOPE = GLOBAL_APPLICATION_SURFACE`，固定为 Sidebar 底部或其他低干扰全局位置，不属于 Project，也不得显示成 Project child Work Item。V1.0 Settings 首要暴露 `Provider / Model`；当 pinned Harness 支持时，必须允许访问 Provider、Custom Provider、API Endpoint、Relay / 中转站、Credential、Model discovery 和 Model selection。

```text
Provider / Model / Endpoint / Relay / Credential truth = HARNESS_OWNED
Shaco Provider Registry = FORBIDDEN_FOR_V1_0
Shaco Model Registry = FORBIDDEN_FOR_V1_0
Shaco Endpoint Manager = FORBIDDEN_FOR_V1_0
Shaco Relay Manager = FORBIDDEN_FOR_V1_0
```

Settings 可以采用独立 Global Application page 或其内部分类 Sidebar，不要求连续 Modal。敏感凭据只显示存在性、脱敏标识和编辑动作；不得在列表、错误或诊断中回显 Secret。保存结果必须来自 Harness 的真实确认；失败时保留可修正输入并给出可操作错误。

## 12. Harness Reuse Matrix

**Status: `FROZEN_FOR_V1_0` for ownership/exposure; `DEFERRED` where marked**

| Feature | Harness Has It | V1.0 Exposed | Reuse Strategy | Shaco Adaptation | Future Status |
|---|---|---|---|---|---|
| Workspace | Yes | Yes | Reuse Harness truth and semantics | Native picker; Project node grouping | Core V1.0 |
| Session | Yes | Yes | Reuse create/list/select/resume/history | Project child Chat Item projection and reconnect | Core V1.0 |
| Conversation | Yes | Yes | Reuse Harness Client/runtime | Shell composition and truthful repull | Core V1.0 |
| Streaming | Yes | Yes | Reuse Harness stream/events | Carrier transport, reconnect and state mapping | Core V1.0 |
| Composer | Yes | Yes | Reuse UI/interaction semantics | Fit Shaco visual hierarchy; keep input primary | Core V1.0 |
| Tool Result | Yes | Yes, basic | Reuse Harness records/rendering | Summary/expand/detail presentation only | Advanced detail later |
| Provider | Yes | Yes | Reuse Harness settings and truth | Settings navigation only | Core V1.0 |
| Custom Provider | Yes where pinned Harness supports | Yes | Reuse Harness capability | No Shaco registry | Core V1.0 |
| API Endpoint | Yes where pinned Harness supports | Yes | Reuse Harness-owned configuration | No copied endpoint store | Core V1.0 |
| Relay / 中转站 | Yes where pinned Harness supports | Yes | Reuse Harness-owned route configuration | No Shaco relay manager | Core V1.0 |
| Credential | Yes | Yes | Reuse Harness credential persistence | Trusted secret submission bridge; redact output | Core V1.0 |
| Model | Yes | Yes | Reuse Harness model configuration/discovery | No Shaco model truth | Core V1.0 |
| Model Selector | Yes | Yes | Reuse Harness selection semantics | Quiet placement in Composer/Settings | Core V1.0 |
| Permission | Yes | Yes, minimal | Reuse Harness runtime and state | Compact state/entry; truthful projection | Core V1.0 |
| Approval | Yes | Yes when required | Reuse Harness settlement semantics | Desktop projection; no duplicate settlement | Core V1.0 |
| Question | Yes | Yes when required | Reuse Harness question semantics | Desktop projection; no replay/duplicate answer | Core V1.0 |
| Trajectory / Execution Trace | Yes | No full independent Surface | Retain Harness capability/truth | Future Inspector or Run Detail projection | `DEFERRED`; `FUTURE_DIRECTION_ONLY` |
| Agent Preset | Yes | No management Surface required | Retain Harness capability | None in Slice 1A | `DEFERRED` |
| Plugins | Yes | No product UI required | Retain approved Harness capability | No marketplace or broad compatibility promise | `DEFERRED` |
| Appearance | Yes | No full settings required | Retain Harness capability where reusable | Design system remains light/dark capable | `DEFERRED` |
| General Settings | Yes | Minimal only as required | Reuse Harness settings truth | Shaco-only global controls must stay clearly separated | Advanced settings `DEFERRED` |
| Diagnostics / Session Log | Yes / reference Surface | No advanced Surface required | Retain Harness data and semantics | Future on-demand high-density detail | `DEFERRED` |

“Harness Has It”依据当前 Corrective Authority 与所提供 Functional Reuse Reference；开发前仍须对 pinned Harness 的实际可调用/可嵌入 Surface 做 Slice 级确认。确认差异不授权创建第二套真相，应优先选择直接复用或真实投影。

## 13. V1.0 Deferred Harness Surfaces

**Status: `DEFERRED`**

```text
HARNESS_CAPABILITY_RETAINED = YES
V1_0_UI_REQUIRED = NO
```

以下 Surface 不要求在 V1.0 完整暴露：Trajectory / Execution Trace、Agent Preset Management、Plugins、Full Appearance Settings、Advanced General Settings、Advanced Session Log、Advanced Diagnostics。延期的是 Shaco V1.0 UI Surface，不是删除 Harness Runtime capability。

## 14. Future Automation Item

**Status: `FUTURE_DIRECTION_ONLY`**

V1.1 Automation capability 真实完成后，Fixed Function Area 出现 Automation launcher，Project Directory 可在同一 Project 下增加 `AUTOMATION` typed Work Item，Main Workspace 增加 Automation Surface。Automation Item 映射 Shaco-owned AutomationDefinition、AutomationRun、Task、Step、Attempt，并可引用一个或多个 Harness Sessions。选中后 Main Workspace 路由到 Automation Workspace，候选内容为 Goal、Run、Task Tree、Progress、Artifacts、Result，信息密度为 Medium / High。

Automation 可采用 Workbench / TreeGrid / TreeView 语言，但本轮只冻结同一 Sidebar 内的 typed-item extension seam 与 type-specific workspace routing，不设计完整最终页面。V1.0 禁止显示 Automation Item、创建选项、占位入口、空数据表或预制未来状态。

## 15. Future Agent Collaboration Item

**Status: `FUTURE_DIRECTION_ONLY`**

V1.2 capability 真实完成后，Fixed Function Area 出现 Agent Collaboration launcher，Project Directory 可在同一 Project 下增加 `AGENT_COLLABORATION` typed Work Item，Main Workspace 增加 Agent Collaboration Surface。它可以引用多个 Harness Sessions，并可展示 Planner、Executor、Reviewer、Corrective、Re-review、Council、Synthesizer、Critic、Findings 与 Outputs。选中后 Main Workspace 路由到 Agent Collaboration Workspace，信息密度为 Medium / High。

这些内容不得塞入普通 Chat，也不得建立独立 Desktop Shell。Provider / Model 仍归 Harness，谁运行、何时运行、依赖、结果流、重试与 Review 才是未来 Shaco 编排域。V1.0 禁止显示 Agent Collaboration Item、创建选项或占位入口。

## 16. Future Memory / Evidence

**Status: `FUTURE_DIRECTION_ONLY`**

V1.3 候选包括 Memory、Evidence、Experience；Knowledge Base / Memory capability 只有在真实实现完成后才显示 fixed entry。`KNOWLEDGE_BASE_SCOPE = NOT_FROZEN`：它最终是 Project-scoped、global 或 mixed，以及精确版本与 Scope，继续由 Version Roadmap / 后续 Owner 决定。Memory、Evidence、Experience 是否成为 Project Detail、Inspector、attachment 或 typed record 尚未冻结。Plugins 是 Settings / Extensions candidate；Diagnostics 是 Inspector / Detail candidate。V1.0 不预建入口、表、空页面或永久导航槽位。

## 17. Optional Inspector

**Status: `DIRECTION_ACCEPTED`**

```text
INSPECTOR_POLICY = NO_PERMANENT_RIGHT_INSPECTOR
```

Inspector 不是全局永远可见的第三栏。每种 selected item type 可按需选择 Right Detail Drawer、Inspector 或 Side Panel：

- Chat：默认关闭；用于 Session、Tools、Files、Context、Trajectory later。
- Automation：用于 Task、Artifact、Run Detail。
- Agent Collaboration：用于 Agent、Finding、Trace。

打开 Inspector 时要维持当前选择与空间关系；关闭后主工作区恢复空间。普通内容不得为了“可能有详情”永久缩窄。

## 18. Information Density

**Status: `DIRECTION_ACCEPTED`**

| Surface | Target Density | Guidance |
|---|---|---|
| Chat | Workbench reference 的约 60%–70% | 留白服务阅读；侧栏/工具条紧凑；默认隐藏高级指标。 |
| Settings | Low / Medium | 分类清楚，一次只呈现相关配置；敏感状态低噪音。 |
| Automation | 参考的约 80%–100% | Tree、Grid、Run Detail 可并置，但仍按任务渐进披露。 |
| Agent Collaboration | Medium / High | Agent/Task/Findings 层级清楚，避免塞回 Chat。 |
| Diagnostics | High | 可以表格化与指标化，但仅在用户主动进入时出现。 |

紧凑不等于拥挤，现代不等于巨大留白。主阅读区优先舒适行长与段落节奏；Sidebar、Toolbar 和结构化列表允许更紧凑。

## 19. Surface Hierarchy and Color Direction

**Status: `DIRECTION_ACCEPTED`; exact values: `DRAFT_TOKEN`**

| Surface | Role |
|---|---|
| `SURFACE_0` | 应用最底层背景。 |
| `SURFACE_1` | 主要 Workspace / Content surface。 |
| `SURFACE_2` | Sidebar、Card 或局部浮层前的分组面。 |
| `SURFACE_3` | Popover、Modal、Elevated temporary surface。 |

颜色方向为灰白/中性、低饱和、专业、平静。结构优先通过轻微明度差、间距、边界与文字层级表达。禁止每个模块都有厚重灰底卡片；高饱和色只用于真正重要的 Success、Warning、Error 或当前主动作。

最终 Hex 不在本轮冻结。Light 与 Dark 必须使用语义 Token，而不是组件内散落固定色值。

## 20. Borders

**Status: `DIRECTION_ACCEPTED`**

```text
BORDER_IS_STRUCTURAL_NOT_DECORATIVE
```

只在 Sidebar / Workspace separation、Panel split、Input boundary、真正需要的 Table/Grid、Modal 等结构位置使用。优先用间距、背景层级和 Typography 区分区域。禁止 Card inside Card inside Card、每个区块都描边，以及普通 Chat 满屏表格线。

## 21. Shadow

**Status: `DIRECTION_ACCEPTED`; blur/opacity: `DRAFT_TOKEN`**

```text
MAIN_SHELL_SHADOW_POLICY = FLAT_FIRST
SHADOW_AS_DEFAULT_SEPARATOR = NO
```

Sidebar 与 Main Workspace 大部分情况下不使用明显阴影。Soft Shadow 只允许用于 Dropdown、Popover、Context Menu、Tooltip、Modal、Floating Inspector、Drag / floating state 和其他临时抬升 Surface。

阴影必须 Soft、Diffuse、Low contrast；禁止厚重黑色投影、Glossy/Card-dashboard 效果、大量 Card Shadow、厚重 Material-style shadow 和高饱和发光。Dark Mode 中阴影作用更弱，主要依赖 surface contrast、border 和 overlay 表达层级。

## 22. Radius

**Status: `DIRECTION_ACCEPTED`; exact values: `DRAFT_TOKEN`**

采用 Small / Medium Radius，保持 Developer Tool feeling。Controls、Inputs 与 Buttons 使用一致的轻度圆角；Popover / Modal 可高一级。Primary Workspace 与 Sidebar 不需要全部做成悬浮圆角卡片。禁止大圆角 SaaS Dashboard 风格。

## 23. Spacing

**Status: `DIRECTION_ACCEPTED`; exact scale: `DRAFT_TOKEN`**

使用统一语义间距阶梯，具体数值在实现采样后确定。主要阅读区优先留白；Sidebar 与 Toolbar 可紧凑；相关控件靠近，不相关组通过更大间距或结构分隔。不得用巨大 Padding 伪装现代感，也不得压缩到影响可点击性、可读性或错误恢复。

## 24. Typography

**Status: `DIRECTION_ACCEPTED`; family/size/weight: `DRAFT_TOKEN`**

字体方向是清晰、中性、开发工具友好、数字可读、代码与正文层级明确。层级限制为 Application / Page Title、Section Title、Body、Secondary、Muted Metadata、Monospace / Code 等必要角色。避免过多字号、过度 Bold 和超大 SaaS Hero Title；Conversation 阅读体验优先。

Monospace 用于代码、命令、标识符和需要对齐的技术数据，不把普通 UI 全部等宽化。

## 25. Icons

**Status: `DRAFT_TOKEN`**

采用 Outline / simple geometric、低噪音且类型容易区分的统一视觉语言。Chat 使用 conversation/message 语义；Automation 使用 automation/flow/lightning 语义；Agent Collaboration 使用 nodes/agents/collaboration 语义。最终 Icon Library、Stroke 与 Exact Size 未冻结。禁止把 Emoji 作为生产类型图标，也禁止无语义地混用 Filled cartoon、3D 与 Outline；图标不能成为关键状态的唯一表达。

## 26. Interaction States

**Status: `FROZEN_FOR_V1_0`**

所有交互控件必须覆盖 Default、Hover、Pressed、Selected、Focused、Disabled、Loading、Error、Warning、Success。

- Selected 必须比 Hover 更明显，并在列表/树中保持稳定。
- Focus 必须键盘可见，不得被 `outline: none` 无替代地移除。
- Disabled 必须同时表达不可操作性和原因入口（当原因不显然时）。
- Loading 不得覆盖成虚假 Success；异步主动作需防止重复提交。
- Error / Warning / Success 必须有文本、图标或形状辅助，不只依赖颜色。

## 27. Status Design

**Status: `DIRECTION_ACCEPTED`**

Worker / Connection / Execution 状态默认低噪音、真实、可展开。例如 `Worker · Connected`。默认不展示 PID、Port、Carrier ID、Version SHA 和详细 Runtime Metrics；高级诊断按需展开。

状态语义为 Success、Warning、Error、Neutral，具体 Hex 为 `DRAFT_TOKEN`。`Worker Starting` 明确正在启动；`Connection Lost` 不得显示成功或继续假装 Streaming；重新连接时说明正在恢复什么，并以 Harness truth 重新构建投影。

## 28. Buttons

**Status: `DIRECTION_ACCEPTED`**

按钮层级为 Primary、Secondary、Ghost / Toolbar、Danger。同一视图避免出现多个竞争性 Primary；Developer Workbench 的低频或局部操作优先 Ghost / Toolbar。Danger 必须清楚区分，不得为视觉统一弱化风险。图标按钮必须提供可访问名称与 Tooltip（语义不明显时）。

## 29. Inputs / Composer

**Status: `DIRECTION_ACCEPTED`**

Input 需要明确边界、可见 Focus、错误说明和 Disabled/Loading 状态。Composer 是 Chat 核心：宽、安静、输入优先，Model / Permission 作为低强调上下文控件保留。Secondary actions 按需折叠、Hover 出现或进入 Menu；不得在 Composer 周围常驻堆满按钮。

多行输入增长时不应无限挤压 Conversation；达到合理阅读范围后内部滚动。发送中应提供明确 Stop/Cancel 语义，并遵守 Harness 的真实取消能力。

## 30. Tree / Table

**Status: `DIRECTION_ACCEPTED`**

TreeGrid 语言主要用于未来 Automation / Review / Diagnostics，V1.0 Chat 不大量使用 Table。Tree 必须层级清楚、可折叠、行高适中、Selected 明显、状态轻量；Table 只用于字段天然为列的内容，并支持清楚的 Header、排序/筛选可发现性（若存在）和空状态。

禁止把所有信息 Grid 化，禁止普通 Chat 默认展示 CPU、Memory、PID 等运维列。高密度 Tree/Table 必须保留键盘导航与水平空间管理。

## 31. Modal / Popover

**Status: `DIRECTION_ACCEPTED`**

Modal 只用于真正阻塞、需要明确确认或必须集中完成的任务。普通 Settings 优先 Page、Side Panel 或 Popover。Popover 使用 Clear border、Enough padding 与低对比 Soft Shadow。禁止连续弹出多层 Modal；关闭和 Escape 行为必须一致，危险或未保存状态按真实风险处理。

## 32. Scrollbar

**Status: `DIRECTION_ACCEPTED`**

桌面工作台允许滚动条可见。常态低视觉重量，Hover / active 时更明显；不得为了“现代”隐藏到不可发现。嵌套滚动区域应最少化，Conversation、Sidebar 和 Inspector 的滚动归属必须清楚。

## 33. Animation

**Status: `DIRECTION_ACCEPTED`; durations/easing: `DRAFT_TOKEN`**

动画只服务反馈、空间关系和状态转换。允许 Menu、Panel open/close、Popover、Loading 和 Status transition；禁止大幅 Motion、长时间 Easing 和炫技转场。必须支持 Reduced Motion；最终 duration 与 easing 不在本轮冻结。

## 34. Empty / Loading / Error States

**Status: `FROZEN_FOR_V1_0`**

| State | Required UI behavior |
|---|---|
| No Project | Recent Projects、Open Project、Global Settings；不显示假 Chat。 |
| No Session | 解释当前 Project 中尚无会话，并提供 `Create Session` 主动作。 |
| Loading | 说明正在加载/恢复的对象；避免无上下文无限 Spinner。 |
| Worker Starting | 显示真实启动中状态；需要时间时保持可理解反馈。 |
| Harness Failed | 展示可操作错误、保留必要上下文，并提供合理 Retry/Settings/Diagnostics 路径。 |
| Connection Lost | 明确离线/重连，不显示 Connected；恢复后从 Harness truth 重建。 |
| Streaming interrupted | 标记中断与当前消息状态，不伪造完整结果。 |
| Invalid Project | 标记路径失效，提供重新定位或选择其他 Project；不自动进入。 |
| Empty search/filter | 显示“无匹配结果”并提供清除筛选，不误报“无数据”。 |

Empty State 简洁，不需要大型插画。错误文案说明“发生了什么、影响什么、用户现在能做什么”，敏感信息保持脱敏。

## 35. Light / Dark Capability

**Status: `FROZEN_FOR_V1_0`**

```text
DESIGN_SYSTEM_LIGHT_DARK_CAPABLE = YES
V1_0_FULL_APPEARANCE_SETTINGS_REQUIRED = NO
V1_0_INITIAL_PRIMARY_THEME = LIGHT
```

Slice 1A 和 V1.0 第一轮视觉实现与验收以 Light Theme 为主基线。设计 Token、状态对比和组件层级仍必须能扩展到 Light / Dark，不得在组件中固化不可迁移的 Light-only 颜色。Dark Theme 的完整视觉实现可以后续增加；Workbench 与 Harness 参考仅作为灰阶层级参考。

## 36. Frozen Decisions

**Status: `FROZEN_FOR_V1_0`**

以下为完整 V1.0 冻结清单：

1. `V1_0_PROJECT_CONTEXT_REQUIRED = YES`。
2. `V1_0_GENERAL_CHAT = NOT_SUPPORTED`。
3. `UI_LONG_TERM_SHELL_ARCHITECTURE = FIXED_FUNCTION_LAUNCHERS_PLUS_PROJECT_DIRECTORY`；这是唯一 current Long-Term Shell Architecture。
4. `FIXED_FUNCTION_AREA_ROLE = START_OR_ENTER_CAPABILITY`，`PROJECT_DIRECTORY_ROLE = BROWSE_AND_REOPEN_EXISTING_PROJECT_WORK`；二者职责不重复。
5. `OLD_CURRENT_NAVIGATION = PROJECT_FIRST_TYPED_WORK_ITEMS_AS_COMPLETE_SHELL` 已 superseded；`PROJECT_GROUPED_TYPED_WORK_ITEMS = RETAINED_AS_PROJECT_DIRECTORY_MODEL`。
6. V1.0 的 Project Node 映射 Harness Workspace；不得建立第二套 Project truth。
7. `WORK_ITEM_PROJECT_CONTEXT = IMPLICIT_FROM_PARENT_PROJECT`；不重复显示 Mode-specific 顶部 Project Selector。
8. `ONE_DESKTOP_SHELL = YES`；功能 Surface、typed record workspace 与 Global Settings 共用主窗口和 Shell。
9. V1.0 `VISIBLE_FIXED_FUNCTIONS = NEW_CHAT_ONLY`、`VISIBLE_PROJECT_RECORD_TYPES = CHAT_ONLY`、`VISIBLE_GLOBAL_ENTRY = SETTINGS`；Automation、Agent Collaboration 与 Knowledge Base 必须隐藏。
10. `CHAT_ITEM_TRUTH = HARNESS_SESSION`；禁止 fake Project、Session、Chat Item 或 future record。
11. `SHARED_WORK_ITEM_RUNTIME_DOMAIN = NOT_CREATED`；Typed Work Item 不创建共享数据库、状态机或持久化真相。
12. `MAIN_WORKSPACE_ROUTING = BY_FUNCTION_OR_SELECTED_RECORD_TYPE`；Chat 打开 Harness Conversation Surface，未来功能和类型使用各自布局。
13. `SETTINGS_SCOPE = GLOBAL_APPLICATION_SURFACE`；Settings 不属于任何 Project，也不是 Work Item。
14. Fixed Function Area 的 `+ 新对话` 是正式 Chat create / entry launcher；Project-level `+` 若存在只是 contextual shortcut，V1.0 也只能创建 Chat。
15. No Project 时不显示假 Chat；只允许 Recent Projects、Open Project 与 Global Settings，并验证恢复目录有效性。
16. Chat Main Workspace 必须支持 Conversation、Streaming、Tool / Result basic rendering，以及 Harness 要求时的 Approval / Question。
17. `CHAT_CONTENT_LAYOUT = CENTERED_FIXED_MAX_WIDTH`，目标约 1100px，Header、Conversation、Tool / Process Content 与 Composer 共用中心轴并响应式收缩。
18. Composer 必须支持 Text Input、Model Selector、最小 Permission state / entry；Chat 内容和 Composer 不横向铺满全部 Main Area。
19. 必须显示最小且真实的 Worker / Connection 状态，并提供 Native Workspace Picker。
20. V1.0 Settings 优先暴露 Harness-owned Provider / Model；Harness 支持时包含 Custom Provider、API Endpoint、Relay、Credential、Model discovery/selection。
21. Provider、Model、Endpoint、Relay、Credential、Workspace、Session、Conversation、Tool、Permission、Approval/Question 的业务真相归 Harness；禁止复制第二套 Shaco truth。
22. V1.0 禁止创建 Provider Registry、Model Registry、Shaco Endpoint Manager、Shaco Relay Manager 或第二套 Credential Settings truth。
23. Harness Runtime capabilities 在 UI 延期时仍必须保留；不得因 Shaco 不暴露 Surface 而删除。
24. V1.0 必须覆盖统一交互状态：Default、Hover、Pressed、Selected、Focused、Disabled、Loading、Error、Warning、Success；Selected 强于 Hover，Focus 键盘可见，关键状态不只用颜色。
25. No Session、Loading、Worker Starting、Harness Failed、Connection Lost、Streaming interrupted 与 Invalid Project 必须提供真实、可操作状态，不得伪造成功。
26. 设计系统必须 `LIGHT_DARK_CAPABLE = YES`，即使 V1.0 Full Appearance Settings 延期。
27. `V1_0_INITIAL_PRIMARY_THEME = LIGHT`；Slice 1A 和 V1.0 第一轮视觉实现与验收以 Light Theme 为主基线，但禁止组件永久 Light-only 硬编码。

## 37. Direction Accepted

**Status: `DIRECTION_ACCEPTED`**

以下为完整已接受方向清单：

1. Project Row 显示名称、expand/collapse、Selected、project-level `+`，并可在未来增加 context menu。
2. Project Overview / Dashboard 为 `NOT_FROZEN`；不为 Project Node 创建空 Dashboard。
3. Fixed Function Area 的 `+ 新对话` 是长期 Shell 与 V1.0 的结构性入口；不得绕过 selected Project Context。Project Row `+` 可作为 contextual shortcut。
4. Item 增多后允许轻量 Search、type filter 和时间分组；V1.0 只有 Chat 时不显示无价值的 type filter。
5. Typed Item 使用 Outline / simple geometric 类型图标，且不只依赖颜色；最终库、Stroke、Size 仍为 `DRAFT_TOKEN`。
6. `INSPECTOR_POLICY = NO_PERMANENT_RIGHT_INSPECTOR`；Optional Inspector 按 selected record type / 任务出现，不作为全局常驻第三栏。
7. Owner-accepted PNG 是长期 Shell 的 Visual North Star；整体视觉为 Modern Developer Workbench：Professional、Restrained、Modern、Calm、Low Saturation、Clear Hierarchy、Desktop-native feeling，不再进行视觉重设计。
8. Chat 以安静、可读、舒适、内容优先为目标；使用约 1100px 的 centered fixed max-width，Header、Conversation、Tool / Process Content 与 Composer 共用中心轴，不做 operations-dashboard。
9. Chat 信息密度约为 Workbench 参考的 60%–70%；Automation 可为 80%–100%；Diagnostics 可高密度。
10. Surface 使用 `SURFACE_0`–`SURFACE_3` 的语义层级，通过明度、间距、边界和文字层级组织结构。
11. `BORDER_IS_STRUCTURAL_NOT_DECORATIVE`；降低边框数量，避免嵌套描边卡片和普通 Chat 满屏 Grid。
12. `FLAT_FIRST`；阴影不作为默认布局分隔，只用于临时抬升 Surface，且 Soft、Diffuse、Low contrast。
13. 使用 Small / Medium Radius，保持 Developer Tool feeling，避免大圆角 SaaS Dashboard。
14. 主要阅读区留白优先；Sidebar/Toolbar 可紧凑；不以巨大留白牺牲效率。
15. Typography 清晰、中性、开发工具友好，限制层级数量，区分正文与 Monospace/Code。
16. Worker/Connection/Execution 状态默认低噪音；高级诊断按需展开，高饱和色只用于重要状态。
17. Button 使用 Primary、Secondary、Ghost/Toolbar、Danger 分层；单视图避免多个竞争 Primary。
18. Composer 宽、安静、输入优先；Model/Permission 存在但低强调，Secondary actions 按需披露。
19. Tree/Table 用于天然结构化信息，主要服务未来 Automation/Agent Collaboration/Diagnostics，不把普通 Chat Grid 化。
20. Modal 仅用于阻塞任务；普通设置优先 Page/Side Panel/Popover；禁止多层 Modal。
21. Scrollbar 可见但低视觉重量，Hover/active 更明显。
22. Animation 服务反馈、空间关系和状态转换；支持 Reduced Motion，禁止大幅、冗长或炫技动画。
23. Empty State 简洁、可操作，不使用大型插画或营销 Hero。

## 38. Future Direction Only

**Status: `FUTURE_DIRECTION_ONLY`**

以下为完整未来方向清单；均不授权 V1.0 创建对应产品 Surface、数据表或第二套 Harness truth：

1. Trajectory / Execution Trace 未来优先进入 Chat 的按需 Right Detail / Inspector，或 Automation / Agent Collaboration Run Detail；不创建复制的数据真相。
2. V1.1 Automation 真实完成后增加 fixed function launcher、Project Directory typed records 与 type-specific Automation Workspace；不重做 Shell。
3. V1.2 Agent Collaboration 真实完成后增加 fixed function launcher、Project Directory typed records 与 type-specific workspace；不重做 Shell，并引用一个或多个 Harness Sessions。
4. Knowledge Base 仅在能力真实完成后显示；`KNOWLEDGE_BASE_SCOPE = NOT_FROZEN`。V1.3 的 Memory、Evidence、Experience 仍是 Project Detail / Inspector / attachment 候选，是否成为 Typed Work Item 尚未冻结。
5. Plugins 是 Settings / Extensions candidate；Diagnostics 是 Inspector / Detail candidate，均不因本次 Corrective 自动成为 Typed Work Item。

## 39. Draft Tokens

**Status: `DRAFT_TOKEN`**

以下为完整草案 Token 清单，均不得被实现者描述为 Owner-frozen Contract：

1. `SURFACE_0`、`SURFACE_1`、`SURFACE_2`、`SURFACE_3` 的最终 Light/Dark Hex。
2. Text、Muted、Accent、Focus、Success、Warning、Error、Neutral 的最终 Hex 与对比参数。
3. Border 宽度/明度的最终 Token 数值。
4. Shadow blur、spread、offset、opacity 与层级数值。
5. Control、Input/Button、Popover/Modal 的最终 Radius 数值。
6. Spacing scale、Sidebar 宽度、行高、内容最大宽度和 Breakpoint 的最终数值。
7. Font family、字号、字重、行高与 Monospace family。
8. 最终 Icon Library、Stroke 与尺寸体系。
9. Animation duration、easing 与位移数值。
10. 各 Theme 下 Scrollbar 的最终宽度、颜色与 Hover 数值。

## 40. Deferred

**Status: `DEFERRED`**

以下为完整延期清单：

1. V1.0 独立 Trajectory / Execution Trace 页面。
2. Agent Preset Management 完整 Surface。
3. Plugin UI、Plugin marketplace 与完整任意插件兼容 Surface。
4. Full Appearance Settings。
5. Advanced General Settings。
6. Advanced Session Log。
7. Advanced Diagnostics。
8. Automation UI 与 Automation domain（V1.1 future）。
9. Agent Collaboration UI 与 orchestration domain（V1.2 future）。
10. Memory / Evidence / Experience 的最终信息架构（V1.3 candidate）。
11. 最终动画与 pixel polish。

## 41. Owner Decisions Remaining

```text
OWNER_DECISIONS_STILL_REQUIRED = NONE
```

具体 Hex、px、字体、图标库和动画时长继续属于实现采样后的 `DRAFT_TOKEN` 收敛，不应在没有候选方案与界面验证时升级为 Owner 决策。

## 42. Final V1.0 UI Target and Historical V1-SLICE-1 Guidance

**Status: `FROZEN_FOR_V1_0` for scope guidance**

以下完整 UI 目标是 Final V1.0 UI target，并保留最初的 historical
`V1-SLICE-1` allocation guidance；它不是当前 Slice-1 Closure Gate。
Post-1C execution allocation 以 §42.3 为 current authority：Slice-1 Closure
只要求已经完成的 `REAL_HARNESS_USER_LOOP`。其余 Outer Sidebar / New Chat /
Settings / Native Picker / Approval-Question-Cancel projection 属于 Slice 2，
且 Final V1.0 UI scope 不减少。

- Shaco Desktop Shell。
- 同一 Fixed Function Area + Project Directory + Global Settings Sidebar 区域结构。
- Fixed Function Area 中只显示 `+ 新对话`。
- 真实 Harness Workspace / Project grouping。
- 真实 Harness Sessions 作为 Chat Items 的 list/select/create。
- Project Directory 与 Global Settings entry。
- 由 selected Chat Item 路由的 Harness Client / Conversation Surface。
- 约 1100px centered Chat content 与 Composer。
- Conversation streaming 与 Tool / Result basic rendering。
- Harness 要求时的 Approval / Question 基础交互。
- Composer 的 Text Input、Model Selector、最小 Permission state / entry。
- Worker / Connection minimal truthful state。
- Native Workspace Picker 入口。
- 基本视觉层级、键盘 Focus 与关键 Loading/Error/Empty state。

Historical Slice-1 allocation guidance 曾以完整 UI 目标描述真实用户闭环；当前
Slice-1 Closure Gate 以 §42.3 的 completed `REAL_HARNESS_USER_LOOP` 为准。Pinned
Harness 的既有 UI 能满足需求时继续优先复用；其余 Shell、Native、Reconnect 和
truthful projection integration 按当前 allocation 在 Slice 2 闭合。

### 42.1 V1-SLICE-1A UI Boundary

`V1-SLICE-1A` 限定为 `PRODUCT_BOOTSTRAP + REAL_HARNESS_CLIENT_BOOT`，不追求
pixel perfection。其 UI 最小要求是：

- 同一 Fixed Function Area + Project Directory + Global Settings Sidebar skeleton。
- Fixed Function Area 中只显示 `+ 新对话`。
- real Workspace / Project grouping。
- connection available 时，将 real Harness Session list 投影为 Chat Items。
- Chat Item type icon。
- Project Directory 与 Global Settings entry。
- real pinned Harness Client mount 与 Chat Main Workspace。
- centered approximately 1100px Chat content / Composer layout，并在窄窗口响应式收缩。
- Light initial theme。
- truthful Worker / Connection、No Project、disconnected 与 not-yet-connected state。
- 基本键盘 Focus、Loading 与 Error structure。

若真实 Harness data 尚未连接，允许显示 truthful unavailable / disconnected
state。不得显示 fake Project、fake Session、fake Chat Item、fake RPC success、fake streaming 或 fake Tool result。

`V1-SLICE-1A` 不要求：

- real Prompt execution。
- real Streaming completion。
- real Tool execution。
- complete Approval flow。
- configured Provider network call 或 Provider Credential loop。
- Workspace / Session full lifecycle。
- full physical Carrier、Reconnect 或 Packaging。
- Automation Item。
- Agent Collaboration Item。
- Knowledge Base entry。
- 任何未来功能 placeholder。
- 只有 Chat 时的 type filter。
- shared WorkItem Runtime / domain。

其中已经属于 real Harness loop 的能力由 1B/1C 关闭；其余 outer shell / native /
projection integration 按 §42.3 由 `V1-SLICE-2` 关闭。以下高级 Surface 同样不属于
`V1-SLICE-1A` 要求：

- Trajectory 独立 Surface。
- Automation UI。
- Multi-Agent / Review UI。
- Plugin UI。
- Full Appearance Settings。
- Advanced Diagnostics / Advanced Session Log。
- 最终动画、最终 Token 或最终像素 Polish。

### 42.2 V1-SLICE-1C Scope Allocation Sync

**Status: `FROZEN_FOR_V1_SLICE_1C_ALLOCATION`**

```text
V1_SLICE_1C_UI_ALLOCATION = EMBEDDED_APPWEBENTRY_PRIMARY_LOOP
V1_SLICE_1C_SHACO_SHELL = PASSIVE_TRUTHFUL_WRAPPER
V1_SLICE_1C_EXTERNAL_APPWEBENTRY_CONTROL = PUBLIC_SEAM_NOT_FOUND
V1_SLICE_1C_PROJECT_SESSION_NAVIGATION = DELEGATED_TO_APPWEBENTRY
V1_SLICE_1C_NATIVE_PICKER = NOT_REQUIRED_FOR_EMBEDDED_LOOP
FINAL_V1_SLICE_1_SIDEBAR_PROJECT_SESSION_PROJECTION = STILL_REQUIRED
FINAL_V1_SLICE_1_NATIVE_PICKER_REQUIREMENT = STILL_OPEN
LONG_TERM_UI_BASELINE_REPLACED = NO
```

这是 V1-SLICE-1C 的 Scope Allocation Sync，不是 UI Baseline 推翻。1C 的真实
Workspace → Session → Prompt → Streaming → Tool/Result 主闭环由 mounted
`AppWebEntry` 承担；Project/Session navigation 同样委托给 AppWebEntry。Frozen
Harness 没有提供外部 Shell 读取或命令式控制 mounted AppWebEntry 当前 Workspace、
Session、Settings route 或内部 navigation 的 production public seam，因此 1C 的
Shaco Shell 只能是 `PASSIVE_TRUTHFUL_WRAPPER`，不得使用 private `ctx` 制造控制能力。

1C Outer Shell 必须保持 truthful：不得显示与真实 Harness 状态冲突的假 No Project
或 No Session；未 wiring 的 New Chat、Project Directory 与 Settings control 必须为
disabled、delegated 或其他真实状态；Worker、Connection 与 Carrier 状态仍必须来自
真实 Product projection。

Harness directory picker 已有 native/browse abstraction，且
`workspace/create({path})` 提供公开 path seam，因此额外 Shaco Native Picker 不是
embedded 1C loop 的前置条件。这不永久删除最终 V1-SLICE-1 的 Sidebar Project/
Session projection、Native Picker 或 Settings integration 要求。它们仍为 open，
只延后至后续尚未冻结命名的 bounded Slice-1 integration gate。

### 42.3 Post-1C Slice-1 Scope Reconciliation

**Status: `OWNER_ACCEPTED_CURRENT_POST_1C_ALLOCATION`**

Authority:
[V1-SLICE-1 Scope Reconciliation Decision](../04-development-records/V1-SLICE-1-SCOPE-RECONCILIATION-DECISION.md),
Decision ID `V1-SLICE-1-SCOPE-RECONCILIATION-20260908-01`.

```text
V1_SLICE_1_PASSIVE_TRUTHFUL_WRAPPER = ACCEPTED_FINAL_FOR_SLICE_1
V1_SLICE_1_ADDITIONAL_UI_IMPLEMENTATION = NONE
V1_SLICE_1D = DO_NOT_CREATE
V1_SLICE_1E = DO_NOT_CREATE
FINAL_V1_0_SIDEBAR_PROJECT_SESSION_PROJECTION = STILL_REQUIRED
V1_SLICE_2_SIDEBAR_PROJECT_SESSION_PROJECTION = ALLOCATED
FINAL_V1_0_NEW_CHAT_WIRING = STILL_REQUIRED
V1_SLICE_2_NEW_CHAT_WIRING = ALLOCATED
FINAL_V1_0_GLOBAL_SETTINGS_INTEGRATION = STILL_REQUIRED
V1_SLICE_2_GLOBAL_SETTINGS_INTEGRATION = ALLOCATED
FINAL_V1_0_NATIVE_PICKER_REQUIREMENT = STILL_REQUIRED
V1_SLICE_2_NATIVE_PICKER = ALLOCATED
FINAL_V1_0_APPROVAL_QUESTION_CANCEL_PROJECTION = STILL_REQUIRED
V1_SLICE_2_APPROVAL_QUESTION_CANCEL_PROJECTION = ALLOCATED
LONG_TERM_UI_BASELINE_REPLACED = NO
FINAL_V1_0_UI_SCOPE_REDUCED = NO
```

本节 supersede §42.2 中仅针对 post-1C execution allocation 的
`FINAL_V1_SLICE_1_*` current truth；§42.2 继续作为 1C 执行时的历史 allocation
事实，不删除、不改写。Mounted AppWebEntry 已完成 Slice-1 real Harness user loop，
因此 passive truthful Shaco wrapper 是 Slice 1 的最终允许状态，不再创建 1D/1E。

最终 V1.0 的 Sidebar Workspace/Session projection、Outer `+ New Chat`、Global
Settings integration、Native Workspace Picker 和 Approval/Question/Cancel
projection 均保持 REQUIRED，并统一分配至 `V1-SLICE-2 — LIFECYCLE / NATIVE /
RECONNECT`。这是 allocation reconciliation，不是 Long-Term UI baseline 推翻，
也不减少最终 V1.0 UI Scope。Slice 2 尚未在本节开始或设计。

## 43. Explicit Non-Goals

- 不为 Shaco V1.0 重写 Harness 已有 UI/业务能力。
- 不创建无项目 General Chat。
- 不创建三个独立 Desktop Shell。
- 不把 Fixed Function Area 当作历史记录列表，也不把 Project Directory 当作 capability launcher。
- 不在 Mode-specific Sidebar 顶部重复 Project Selector。
- 不把 Typed Work Item 变成新的 V1.0 Runtime Domain 或持久化 truth。
- 不创建 fake Project、fake Session、fake Chat Item 或 fake RPC success。
- 不在 V1.0 展示未来功能占位、Disabled 菜单或空页面。
- 不把 Chat 做成 TreeGrid、监控台或指标 Dashboard。
- 不复制 Provider/Model/Endpoint/Relay/Credential/Workspace/Session/Conversation truth。
- 不默认常驻 Inspector、Trajectory、PID、Port、Carrier ID、Version SHA 或 Runtime metrics。
- 不冻结未经界面验证的 px、Hex、Font、Icon Library 或 Animation duration。
