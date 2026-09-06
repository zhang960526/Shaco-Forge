# Shaco Forge UI Design Spec

| Field | Value |
|---|---|
| Document Role | `SHACO_FORGE_UI_SINGLE_SOURCE_OF_TRUTH` |
| UI Spec Status | `ACTIVE` |
| Version | `V1.0-FIRST-FORMAL-BASELINE` |
| Scope | V1.0 UI contract and V1.1–V1.3 extension direction |
| Product Implementation | `NOT_STARTED_BY_THIS_DOCUMENT` |
| Owner Review | `PASS` |
| UI Design Baseline Ready | `YES` |
| UI Direction Ready for Slice 1A | `YES` |
| Initial Primary Theme | `LIGHT` |
| Last Updated | `2026-09-06` |

> 本文是 Shaco Forge 正式 UI 决策的唯一真相来源。聊天中讨论但未写入本文的内容，不构成冻结决定。若本文与更高优先级的产品、架构或治理 Authority 冲突，以 [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md) 定义的 Authority Order 为准，并必须在本文中完成显式同步，禁止依靠聊天记忆静默覆盖。

## 1. Document Status

```text
UI_SPEC_STATUS = ACTIVE
UI_SINGLE_SOURCE_OF_TRUTH = docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md
UI_SPEC_OWNER_REVIEW = PASS
UI_DESIGN_BASELINE_READY = YES
UI_DIRECTION_READY_FOR_SLICE_1A = YES
V1_0_INITIAL_PRIMARY_THEME = LIGHT
DESIGN_SYSTEM_LIGHT_DARK_CAPABLE = YES
V1_0_IMPLEMENTATION_SCOPE = HARNESS_REUSE_PRODUCTIZATION
V1_0_PROVIDER_MODEL_OWNERSHIP = HARNESS
PROVIDER_MODEL_ROUTING = HARNESS_OWNED
MULTI_MODEL_SUPPORT = REUSE_HARNESS
MULTI_AGENT_ORCHESTRATION = FUTURE_SHACO_DOMAIN
```

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

- Workbench / TreeGrid / TreeView 两张参考：吸收窄 Global Rail、清晰一级/二级导航、Tree/Panel 层级、紧凑工具条、结构性分隔和桌面工作台感；不继承全局高密度、满屏指标、过量表格线和每个区块都描边的做法。
- DeepSeek Harness 六张参考：作为 Functional Reuse Reference，确认当前界面语言覆盖 Workspace、Session、Conversation、Composer、Provider/Model Settings、Custom Provider、Permission、Tool/Result、Approval/Question、Agent Preset、Trajectory、Plugins、Appearance、General Settings 等 Surface。截图证明“应优先复用/核验”的方向，不替代正式运行时 Evidence。

## 4. Product UI Principles

1. **Harness truth first.** Harness 已拥有的业务能力优先复用 Harness UI 或交互语义；Shaco 不建立第二套数据真相。
2. **One desktop workbench.** 一个主窗口承载所有 Product Mode；Mode 是同一 Shell 内的主导航，不是独立应用。
3. **Project context before mode.** Project / Workspace 是全局工作上下文，Chat 与未来模式共享它。
4. **Content before chrome.** Chat 以对话和输入为中心，降低装饰、指标和常驻工具噪音。
5. **Progressive disclosure.** 高级详情通过 Drawer、Inspector、Popover 或 Detail View 按需出现。
6. **Density follows task.** Chat 低/中密度；Automation、Review 中/高密度；Diagnostics 高密度。
7. **Structural borders, flat first.** 边框和阴影服务于结构、临时抬升与交互反馈，不做装饰性卡片堆叠。
8. **Truthful state.** 连接、Worker、Loading 和 Error 必须反映真实状态，不能用乐观 UI 假装成功。
9. **Accessible interaction.** 所有关键操作支持键盘 Focus；关键状态不只依赖颜色。
10. **No speculative UI.** V1.0 不展示未实现未来功能的占位入口、空表或 `Coming Soon`。

## 5. Project / Workspace Context Model

**Status: `FROZEN_FOR_V1_0`**

```text
V1_0_PROJECT_CONTEXT_REQUIRED = YES
V1_0_GENERAL_CHAT = NOT_SUPPORTED
PROJECT_CONTEXT = GLOBAL_WITHIN_WORKSPACE
MODE_SWITCH_PRESERVES_PROJECT = YES
PROJECT_RESELECTION_ON_MODE_SWITCH = NO
PROJECT_RUNTIME_TRUTH = HARNESS_WORKSPACE
SECOND_PROJECT_TRUTH = FORBIDDEN
```

“Project”是产品 UI 对用户的概念名称；V1.0 底层优先映射并复用 Harness Workspace。用户选择 `Todo List` 后，Chat 以及未来的 Automation、Multi-Agent / Review 都默认在 `Todo List` 中工作。切换 Mode 不清空、不复制、也不重新请求 Project。

Project 变化是显式的全局上下文切换。切换前若存在未提交输入、运行中的阻塞性交互或可能丢失的本地 UI 状态，界面必须先给出明确处理路径；不得静默丢弃。是否需要阻塞确认取决于真实丢失风险，不得把每次切换都做成 Modal。

## 6. Application Shell

**Status: `FROZEN_FOR_V1_0`**

```text
ONE_DESKTOP_SHELL = YES

MAIN WINDOW
├─ Primary Navigation / Global Rail
├─ Mode-specific Context Sidebar
└─ Main Content Workspace
   └─ Optional on-demand Detail / Inspector
```

- Global Rail：窄、稳定、低噪音，放 Product Mode 入口；不承载长期展开的 Project 列表。
- Context Sidebar：内容随 Mode 变化；Chat 中承载 Project Selector、Session 创建和 Session 列表。
- Main Content：当前 Mode 的首要工作面；Chat 中是 Conversation + Composer。
- Optional Inspector：不是常驻第四列；只在当前任务需要详情时出现，可关闭并把空间归还主工作区。
- Primary Navigation 和 Shell 几何关系固定；Mode 内部允许不同密度与布局结构。

窄窗口时优先保住 Main Content；Context Sidebar 可折叠或以覆盖层展开，Global Rail 仍保持 Mode 可发现性。响应策略不得把 Project Context 隐藏成不可访问状态。

## 7. Navigation Hierarchy

### 7.1 V1.0 primary navigation

**Status: `FROZEN_FOR_V1_0`**

V1.0 实际可见一级入口仅为：

1. `CHAT`
2. `SETTINGS`

`AUTOMATION`、`MULTI-AGENT / REVIEW`、`MEMORY / EVIDENCE` 仅在对应功能真实完成后增加。V1.0 禁止显示 Disabled、Coming Soon 或“敬请期待”入口，也禁止为未来页面建立空 Surface。

### 7.2 Mode-specific navigation

**Status: `DIRECTION_ACCEPTED`**

二级导航只在当前 Mode 需要时出现。Chat 使用 Session Sidebar；Settings 使用设置分类；未来 Automation 可使用 Definitions / Runs / Task Tree / Schedules，Review 可使用 Agent / Task / Finding 层级。二级导航不得反向成为另一套全局 Shell。

## 8. Project Selector

**Status: `DIRECTION_ACCEPTED`**

Project Selector 位于 Mode-specific Context Sidebar 顶部，视觉上先于该 Mode 的局部列表，例如：

```text
Todo List                         ▾
──────────────────────────────────
+ New Session
Sessions
  Session A
  Session B
```

Dropdown 至少表达：当前 Project、Recent Projects、可选 Project，以及 `Open Project…`。`Open Project…` 使用 Native Workspace Picker；选择结果回到 Harness Workspace 真相。Project 列表不长期铺满 Global Rail。

Project Selector 的选中态必须明显强于 Hover；长路径作为次级信息按需展示，常态优先显示可识别名称。失效目录不能显示为已成功进入；应标记不可用并提供重新定位或移除 Recent 记录的路径。

## 9. No Project State

**Status: `FROZEN_FOR_V1_0`**

未选择有效 Project / Workspace 时，不渲染假的空 Chat，也不允许进入任何项目型功能。主工作区显示简洁启动页：

- `Recent Projects`
- `Open Project…`
- `Global Settings`

允许恢复上次有效 Workspace；恢复前必须验证目录仍有效。失效目录不得被未经确认地自动进入。无 Project 时 `CHAT` 的语义是引导选择上下文，而不是创建 General Chat；`AUTOMATION` 和 `MULTI-AGENT / REVIEW` 在其未来版本中同样受此约束。

空状态不用大型插画、营销 Hero 或示例 Dashboard。主要动作是 `Open Project…`，Recent Project 为次级选择，Global Settings 为低强调入口。

## 10. V1.0 Chat

**Status: `FROZEN_FOR_V1_0`**

### 10.1 Layout

```text
┌ Global Rail ┬ Context Sidebar ┬──────────────── Main Workspace ────────────────┐
│ Chat        │ Project ▾       │ Quiet header: session + minimal true state     │
│ Settings    │ + New Session   ├────────────────────────────────────────────────┤
│             │ Search/filter*  │                                                │
│             │ Sessions        │ Conversation / streaming / tool-result basics │
│             │  Selected       │                                                │
│             │  Recent         ├────────────────────────────────────────────────┤
│             │                 │ Composer: text first; model + permission quiet │
└─────────────┴─────────────────┴────────────────────────────────────────────────┘
                                                        * only if useful at scale
```

### 10.2 Context Sidebar

必须支持 Current Project / Workspace Selector、Session create、Session list 和 Session select。Session 行优先展示可识别标题与必要的轻量元数据；默认不展示 token、PID、Port、Carrier ID 或内部 ID。Session 选中态清晰，Hover 不得与 Selected 混淆。

### 10.3 Main Workspace

必须支持 Conversation、Streaming、Tool / Result 基本呈现，以及 Harness 要求时的 Approval / Question。内容列保持可读宽度，但不把整个工作区强制做成居中消费级聊天窄列；长代码、Tool Result 和结构化内容可在内容区内获得更宽呈现或按需展开。

Tool Result 默认摘要化，明确区分进行中、成功、失败和需要用户介入；详情可原位展开或进入按需 Inspector。Approval / Question 是任务阻塞性交互，必须在上下文中可发现，且不能被普通 Toast 替代。

### 10.4 Composer

Composer 宽、安静、输入优先。必须包括 Text Input、Model Selector 与最小 Permission state / entry。Model 与 Permission 存在但不争夺主视觉；低频动作进入折叠菜单、Hover affordance 或次级入口。发送、停止等当前主动作在同一时刻保持唯一明确 Primary 层级。

### 10.5 Shaco-specific state

显示 Worker / Connection 的最小真实状态，例如 `Worker · Connected`、`Worker · Starting`、`Connection lost`。默认不显示 PID、Port、Carrier ID、Version SHA 或详细 Runtime metrics；高级诊断按需进入详情 Surface。

### 10.6 Harness reuse rule

Conversation、Session、Provider、Model、Credential、Tool、Permission、Approval 与 Question 优先直接复用 Harness Client UI 或 Harness interaction semantics。Shaco adaptation 只允许解决 Desktop Shell、连接、Native Picker、重连与真实状态投影问题，不借 UI 重构建立第二套业务状态。

## 11. V1.0 Settings

**Status: `FROZEN_FOR_V1_0`**

V1.0 Settings 首要暴露 `Provider / Model`。当 pinned Harness 支持时，必须允许访问：Provider、Custom Provider、API Endpoint、Relay / 中转站、Credential、Model discovery 和 Model selection。

```text
Provider / Model / Endpoint / Relay / Credential truth = HARNESS_OWNED
Shaco Provider Registry = FORBIDDEN_FOR_V1_0
Shaco Model Registry = FORBIDDEN_FOR_V1_0
Shaco Endpoint Manager = FORBIDDEN_FOR_V1_0
Shaco Relay Manager = FORBIDDEN_FOR_V1_0
```

Settings 可以采用页面或 Mode 内分类 Sidebar，不要求连续 Modal。敏感凭据只显示存在性、脱敏标识和编辑动作；不得在列表、错误或诊断中回显 Secret。保存结果必须来自 Harness 的真实确认；失败时保留可修正输入并给出可操作错误。

## 12. Harness Reuse Matrix

**Status: `FROZEN_FOR_V1_0` for ownership/exposure; `DEFERRED` where marked**

| Feature | Harness Has It | V1.0 Exposed | Reuse Strategy | Shaco Adaptation | Future Status |
|---|---|---|---|---|---|
| Workspace | Yes | Yes | Reuse Harness truth and semantics | Native picker; global Project label/context | Core V1.0 |
| Session | Yes | Yes | Reuse create/list/select/resume/history | Desktop sidebar projection and reconnect | Core V1.0 |
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

## 14. Future Automation

**Status: `FUTURE_DIRECTION_ONLY`**

V1.1 可在同一 Shell 增加一级 `AUTOMATION`。进入后继续使用当前全局 Project，不重新选择。二级栏候选为 Automation Definitions、Runs、Task Tree、Schedules / Triggers；主工作区候选为 Run Detail、Task Tree、Progress、Artifacts、Result。

Automation 可采用 Workbench / TreeGrid / TreeView 的中高密度结构，但本轮只冻结 Shell Extension Seam，不设计完整最终页面，不创建占位入口、空数据表或预制未来状态。Automation 真相未来归 Shaco domain；它引用 Harness Session，不复制 Harness Session truth。

## 15. Future Multi-Agent / Review

**Status: `FUTURE_DIRECTION_ONLY`**

V1.2 可在同一 Shell 增加一级 `MULTI-AGENT / REVIEW`，继续共享当前 Project Context。未来可展示 Planner、Executor、Reviewer、Corrective、Agent Tree、Task Tree、Review Findings 和 Execution State。

这些内容不得塞入普通 Chat，也不得建立独立 Desktop Shell。多个 Agent 可以关联多个 Harness Sessions；Provider / Model 仍归 Harness，谁运行、何时运行、依赖、结果流、重试与 Review 才是未来 Shaco 编排域。

## 16. Future Memory / Evidence

**Status: `FUTURE_DIRECTION_ONLY`**

V1.3 候选包括 Memory、Evidence、Experience。它们最终成为独立 Mode、Project Detail 还是 Inspector 尚未冻结；等真实信息架构和使用频率出现后决定。V1.0 不预建入口、表、空页面或永久导航槽位。

## 17. Optional Inspector

**Status: `DIRECTION_ACCEPTED`**

Inspector 不是全局永远可见的第四列。每个 Mode 可按需选择 Right Detail Drawer、Inspector 或 Side Panel：

- Chat：默认关闭；用于 Tool Detail、Session info、Trajectory。
- Automation：用于 Task Detail、Artifact、Run State。
- Review：用于 Finding、Agent State、Execution Trace。

打开 Inspector 时要维持当前选择与空间关系；关闭后主工作区恢复空间。普通内容不得为了“可能有详情”永久缩窄。

## 18. Information Density

**Status: `DIRECTION_ACCEPTED`**

| Surface | Target Density | Guidance |
|---|---|---|
| Chat | Workbench reference 的约 60%–70% | 留白服务阅读；侧栏/工具条紧凑；默认隐藏高级指标。 |
| Settings | Low / Medium | 分类清楚，一次只呈现相关配置；敏感状态低噪音。 |
| Automation | 参考的约 80%–100% | Tree、Grid、Run Detail 可并置，但仍按任务渐进披露。 |
| Multi-Agent / Review | Medium / High | Agent/Task/Findings 层级清楚，避免塞回 Chat。 |
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

Sidebar、Main Workspace、Primary Navigation 大部分情况下不使用明显阴影。Soft Shadow 只允许用于 Dropdown、Popover、Context Menu、Tooltip、Modal、Floating Inspector、Drag / floating state 和其他临时抬升 Surface。

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

采用 Outline / simple geometric、低噪音且一级导航容易区分的统一视觉语言。最终 Icon Library 未冻结。禁止无语义地混用 Filled cartoon、3D、Emoji 与 Outline；图标不能成为关键状态的唯一表达。

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
3. `PROJECT_CONTEXT = GLOBAL_WITHIN_WORKSPACE`。
4. `MODE_SWITCH_PRESERVES_PROJECT = YES`。
5. `PROJECT_RESELECTION_ON_MODE_SWITCH = NO`。
6. V1.0 的 Project UI 映射 Harness Workspace；不得建立第二套 Project truth。
7. `ONE_DESKTOP_SHELL = YES`；Chat、Settings 与未来 Mode 共用主窗口和 Shell。
8. V1.0 Primary Navigation 只显示 `CHAT`、`SETTINGS`；不显示未来功能占位或 Disabled 入口。
9. No Project 时不显示假 Chat；只允许 Recent Projects、Open Project 与 Global Settings，并验证恢复目录有效性。
10. Chat Context Sidebar 必须支持 Project Selector、Session create/list/select。
11. Chat Main Workspace 必须支持 Conversation、Streaming、Tool / Result basic rendering，以及 Harness 要求时的 Approval / Question。
12. Composer 必须支持 Text Input、Model Selector、最小 Permission state / entry。
13. 必须显示最小且真实的 Worker / Connection 状态，并提供 Native Workspace Picker。
14. V1.0 Settings 优先暴露 Harness-owned Provider / Model；Harness 支持时包含 Custom Provider、API Endpoint、Relay、Credential、Model discovery/selection。
15. Provider、Model、Endpoint、Relay、Credential、Workspace、Session、Conversation、Tool、Permission、Approval/Question 的业务真相归 Harness；禁止复制第二套 Shaco truth。
16. V1.0 禁止创建 Provider Registry、Model Registry、Shaco Endpoint Manager、Shaco Relay Manager 或第二套 Credential Settings truth。
17. Harness Runtime capabilities 在 UI 延期时仍必须保留；不得因 Shaco 不暴露 Surface 而删除。
18. V1.0 必须覆盖统一交互状态：Default、Hover、Pressed、Selected、Focused、Disabled、Loading、Error、Warning、Success；Selected 强于 Hover，Focus 键盘可见，关键状态不只用颜色。
19. No Session、Loading、Worker Starting、Harness Failed、Connection Lost、Streaming interrupted 与 Invalid Project 必须提供真实、可操作状态，不得伪造成功。
20. 设计系统必须 `LIGHT_DARK_CAPABLE = YES`，即使 V1.0 Full Appearance Settings 延期。
21. `V1_0_INITIAL_PRIMARY_THEME = LIGHT`；Slice 1A 和 V1.0 第一轮视觉实现与验收以 Light Theme 为主基线，但禁止组件永久 Light-only 硬编码。

## 37. Direction Accepted

**Status: `DIRECTION_ACCEPTED`**

以下为完整已接受方向清单：

1. Project Selector 位于左侧 Mode-specific Context Sidebar 顶部，不把 Project 列表长期放在 Global Rail。
2. Mode-specific Secondary Navigation 按需出现；Primary Navigation 与主 Shell 固定。
3. Optional Inspector 按 Mode/任务出现，不作为全局常驻第四列。
4. 整体视觉为 Modern Developer Workbench：Professional、Restrained、Modern、Calm、Low Saturation、Clear Hierarchy、Desktop-native feeling。
5. Chat 以安静、可读、舒适、内容优先为目标；不做 operations-dashboard。
6. Chat 信息密度约为 Workbench 参考的 60%–70%；Automation 可为 80%–100%；Diagnostics 可高密度。
7. Surface 使用 `SURFACE_0`–`SURFACE_3` 的语义层级，通过明度、间距、边界和文字层级组织结构。
8. `BORDER_IS_STRUCTURAL_NOT_DECORATIVE`；降低边框数量，避免嵌套描边卡片和普通 Chat 满屏 Grid。
9. `FLAT_FIRST`；阴影不作为默认布局分隔，只用于临时抬升 Surface，且 Soft、Diffuse、Low contrast。
10. 使用 Small / Medium Radius，保持 Developer Tool feeling，避免大圆角 SaaS Dashboard。
11. 主要阅读区留白优先；Sidebar/Toolbar 可紧凑；不以巨大留白牺牲效率。
12. Typography 清晰、中性、开发工具友好，限制层级数量，区分正文与 Monospace/Code。
13. Worker/Connection/Execution 状态默认低噪音；高级诊断按需展开，高饱和色只用于重要状态。
14. Button 使用 Primary、Secondary、Ghost/Toolbar、Danger 分层；单视图避免多个竞争 Primary。
15. Composer 宽、安静、输入优先；Model/Permission 存在但低强调，Secondary actions 按需披露。
16. Tree/Table 用于天然结构化信息，主要服务未来 Automation/Review/Diagnostics，不把普通 Chat Grid 化。
17. Modal 仅用于阻塞任务；普通设置优先 Page/Side Panel/Popover；禁止多层 Modal。
18. Scrollbar 可见但低视觉重量，Hover/active 更明显。
19. Animation 服务反馈、空间关系和状态转换；支持 Reduced Motion，禁止大幅、冗长或炫技动画。
20. Empty State 简洁、可操作，不使用大型插画或营销 Hero。

## 38. Future Direction Only

**Status: `FUTURE_DIRECTION_ONLY`**

以下为完整未来方向清单；均不授权 V1.0 创建对应产品 Surface、数据表或第二套 Harness truth：

1. Trajectory / Execution Trace 未来优先进入 Conversation 的按需 Right Detail / Inspector，或 Automation / Multi-Agent Run Detail；不创建复制的数据真相。
2. V1.1 可在同一 Desktop Shell 增加 `AUTOMATION` 一级 Mode，继续使用全局 Project Context；二级结构候选为 Definitions、Runs、Task Tree、Schedules / Triggers，主工作区候选为 Run Detail、Progress、Artifacts 与 Result。本轮只保留 Shell Extension Seam，不冻结最终页面。
3. V1.2 可在同一 Desktop Shell 增加 `MULTI-AGENT / REVIEW` 一级 Mode，继续使用全局 Project Context；未来可展示 Planner、Executor、Reviewer、Corrective、Agent Tree、Task Tree、Review Findings 与 Execution State，并引用一个或多个 Harness Sessions。
4. V1.3 候选为 Memory、Evidence、Experience；它们成为独立 Mode、Project Detail 或 Inspector 尚未冻结，等真实需求和信息架构出现后决定。

## 39. Draft Tokens

**Status: `DRAFT_TOKEN`**

以下为完整草案 Token 清单，均不得被实现者描述为 Owner-frozen Contract：

1. `SURFACE_0`、`SURFACE_1`、`SURFACE_2`、`SURFACE_3` 的最终 Light/Dark Hex。
2. Text、Muted、Accent、Focus、Success、Warning、Error、Neutral 的最终 Hex 与对比参数。
3. Border 宽度/明度的最终 Token 数值。
4. Shadow blur、spread、offset、opacity 与层级数值。
5. Control、Input/Button、Popover/Modal 的最终 Radius 数值。
6. Spacing scale、Sidebar 宽度、Rail 宽度、行高、内容最大宽度和 Breakpoint 的最终数值。
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
9. Multi-Agent / Review UI 与 orchestration domain（V1.2 future）。
10. Memory / Evidence / Experience 的最终信息架构（V1.3 candidate）。
11. 最终动画与 pixel polish。

## 41. Owner Decisions Remaining

```text
OWNER_DECISIONS_STILL_REQUIRED = NONE
```

具体 Hex、px、字体、图标库和动画时长继续属于实现采样后的 `DRAFT_TOKEN` 收敛，不应在没有候选方案与界面验证时升级为 Owner 决策。

## 42. V1-SLICE-1 UI Implementation Guidance

**Status: `FROZEN_FOR_V1_0` for scope guidance**

以下完整 UI 目标属于 `V1-SLICE-1`，而不是 `V1-SLICE-1A` 的完成 Gate：

- Shaco Desktop Shell。
- Primary `CHAT` menu。
- `SETTINGS` menu。
- Project Selector（映射 Harness Workspace）。
- Session Sidebar（create/list/select）。
- Main Harness Client / Conversation surface。
- Conversation streaming 与 Tool / Result basic rendering。
- Harness 要求时的 Approval / Question 基础交互。
- Composer 的 Text Input、Model Selector、最小 Permission state / entry。
- Worker / Connection minimal truthful state。
- Native Workspace Picker 入口。
- 基本视觉层级、键盘 Focus 与关键 Loading/Error/Empty state。

`V1-SLICE-1` 的最终实现验收检查真实用户闭环：选择有效 Workspace → 创建/选择
Session → 输入 Prompt → Streaming → Tool/Result → 必要 Approval/Question；同时确认
Project 在 Mode 切换中保持、无 Project 不出现假 Chat、连接状态真实、Harness-owned
设置未被复制。若 pinned Harness 的既有 UI 可以满足需求，优先复用；Shaco 适配只解决
Shell、Native、Carrier、Reconnect 和 truthful projection。

### 42.1 V1-SLICE-1A UI Boundary

`V1-SLICE-1A` 限定为 `PRODUCT BOOTSTRAP + REAL HARNESS CLIENT BOOT`，不追求
pixel perfection。其 UI 最小要求是：

- Desktop Shell。
- Chat entry 与 Settings entry。
- Project / Workspace selector shell。
- Session sidebar shell。
- 挂载 real pinned Harness Client。
- Light initial theme。
- truthful Worker / Connection state。
- No Project、disconnected 与 not-yet-connected state。
- 基本键盘 Focus、Loading 与 Error structure。

若真实 Harness data 尚未连接，允许显示 truthful unavailable / disconnected
state。不得显示 fake Project、fake Session、fake streaming 或 fake Tool result。

`V1-SLICE-1A` 不要求：

- real Prompt execution。
- real Streaming completion。
- real Tool execution。
- complete Approval flow。
- configured Provider network call 或 Provider Credential loop。
- Workspace / Session full lifecycle。
- full physical Carrier、Reconnect 或 Packaging。

这些能力在 `V1-SLICE-1` 的后续内部实现步骤中闭合。以下高级 Surface 同样不属于
`V1-SLICE-1A` 要求：

- Trajectory 独立 Surface。
- Automation UI。
- Multi-Agent / Review UI。
- Plugin UI。
- Full Appearance Settings。
- Advanced Diagnostics / Advanced Session Log。
- 最终动画、最终 Token 或最终像素 Polish。

## 43. Explicit Non-Goals

- 不为 Shaco V1.0 重写 Harness 已有 UI/业务能力。
- 不创建无项目 General Chat。
- 不创建三个独立 Desktop Shell。
- 不把 Project 做成占满 Global Rail 的长期一级列表。
- 不在 V1.0 展示未来功能占位、Disabled 菜单或空页面。
- 不把 Chat 做成 TreeGrid、监控台或指标 Dashboard。
- 不复制 Provider/Model/Endpoint/Relay/Credential/Workspace/Session/Conversation truth。
- 不默认常驻 Inspector、Trajectory、PID、Port、Carrier ID、Version SHA 或 Runtime metrics。
- 不冻结未经界面验证的 px、Hex、Font、Icon Library 或 Animation duration。
