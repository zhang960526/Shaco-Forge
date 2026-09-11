# V1-SLICE-2 Step3 Full Shaco Presentation Corrective Contract Candidate

Document Type: `FULL_SHACO_PRESENTATION_CORRECTIVE_CONTRACT_CANDIDATE`

Status: `FROZEN_FOR_IMPLEMENTATION`

Date: `2026-09-11`

## Current — Step3 Owner Closure / Baseline Frozen (2026-09-11)

[Step3 Owner Closure / Freeze Decision](../04-development-records/V1-SLICE-2-STEP3-OWNER-CLOSURE-AND-FREEZE-DECISION.md) 已接受 F-IFR-01-TARGETED-REREVIEW PASS（OWNER_SUPPLIED_INLINE_REVIEW_TRANSCRIPT）。F-IFR-01=CLOSED_BY_INDEPENDENT_REREVIEW，UI-G14=CONFIRMED，Step3=PASS / CLOSED / FROZEN；Slice2 仍待独立 Closure Audit。当前阶段只以 Current State 为准。冻结技术条款不变，实现授权已消费；下方 implementation authorization、未闭合、待复审与禁止 commit 的表述保留为历史阶段限制，本次唯一 Closure commit 授权由新 Decision 提供。Visual Acceptance PASS；Visual Polish 延后且不阻断。

当前 raw Evidence 例外：Owner 已批准仅三个确切 Historical Raw Evidence logs 的 whitespace exception，以保持接受时的原始字节。CR-aware 完整检查仍有 27 项，全部位于这三个日志；非豁免暂存内容检查 PASS，三个原始日志 SHA256 / staged blob / byte preservation PASS。KNOWN_RAW_EVIDENCE_FORMATTING_PRESERVED_BY_DESIGN；没有修正或规范化日志。

## Historical Contract Freeze — 2026-09-11

[现有 Owner Decision](../04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-DIRECTION-DECISION.md) 已持久化 Owner 提供的 REVIEW-027A PASS 与双模板 Delta ACCEPTED。

```text
FULL_SHACO_PRESENTATION_CORRECTIVE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
FULL_SHACO_PRESENTATION_IMPLEMENTATION_AUTHORIZATION = YES
REVIEW_027A = PASS
DUAL_THEME_DELTA = ACCEPTED
PROVIDER_GATE_AUTHORIZATION = NO
```

以下技术条款与 stop conditions 冻结；下方“本轮仅文档/等待 Delta Review/暂停实现/未来 Freeze”等措辞保留为合同起草阶段的历史记录，执行权限由上方 Owner Decision 当前接受取代。§19 冲突条款的 supersession 已生效。文件名保留 CANDIDATE，未改变技术契约。Implementation/tests/Evidence 允许；Provider、Harness 修改、Packaging、Stage/Commit/Push、Closure 仍禁止。

## Historical Implementation evidence status — 2026-09-11

冻结技术条款保持不变，下文 REQUIRED / NOT_RUN 是冻结要求快照。Owner 最新输入仍为 Independent Final Review FAIL（F-IFR-01 HIGH_BLOCKING），Visual Acceptance PASS_FROM_FAILED_FINAL_REVIEW、Direction Alignment ALIGNED。Review 来源 OWNER_INPUT_ONLY。F-IFR-01 已完成 source freeze、新 29-row Controlled Composition 和冻结后完整 15-command 非 Provider 回归，全部 PASS；UI_G14=IMPLEMENTATION_PASS_WAITING_INDEPENDENT_REREVIEW。参见 [现有实施记录 §AO](../04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-DUAL-THEME-IMPLEMENTATION-RECORD.md#ao-f-ifr-01-finalization)。Visual Polish 已非阻断延后至 V1 final polish；独立复审尚未执行，Step3/Slice2 不关闭，Current State 为唯一当前阶段 authority。

## 1. Authority, scope and persistence baseline

本候选把 Architecture Owner 已选择的“100% Shaco Forge Visible UI + DeepSeek Harness Runtime/Truth Reuse”落为独立可审计的设计。方向 authority 是 [Full Shaco Presentation Direction Decision](../04-development-records/V1-SLICE-2-STEP3-FULL-SHACO-PRESENTATION-DIRECTION-DECISION.md)；当前阶段与下一步以 [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md) 为唯一 current authority，[Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md) 是索引。

本轮仅执行 V1 Dual Theme Template Scope 文档修正。REVIEW-027 的单模板架构基线 PASS 按 Owner 输入保留；双模板 scope 为 Review 后新增 Delta，等待独立复审。Full Shaco Implementation 暂停为 `PAUSED_PENDING_DUAL_TEMPLATE_DELTA_REVIEW`，不撤销既有架构方向或架构授权。本轮不执行 Freeze、Implementation 或 Review；MUST / REQUIRED 不是实现已完成或 Gate PASS。

本轮 Architecture Owner 明确输入确认 REVIEW-027 为 PASS；本地仓库未定位到独立 REVIEW-027 报告，故本条以该 Owner 输入为结论来源，不虚构报告路径、审查执行记录或新的 Review PASS。其覆盖 Full Shaco Presentation、Option B、Copy/Adapt First、MODE_PLUS_TEMPLATE 的单个 required template 基线；Owner 在 Review 后新增 BRAUN + FAMICOM required scope，必须单独 Delta Review，不把 REVIEW-027 改为 FAIL，也不声称它已覆盖双模板。

以下表格保留首次候选持久化的历史 baseline；本轮 entry/final 文件与图片核验见 Development Log。

| Baseline | Read-only verified value |
|---|---|
| Product | `D:/Project/Shaco-Forge` |
| Branch / HEAD | `master` / `5118053f625d01faba6617cace481df3091ba5be` |
| Entry candidate | `104 changed paths / 18 tracked modified / 86 untracked / staged NONE` |
| Frozen Harness | `D:/Project/Shaco-Forge-Upstream/deepseek-harness` |
| Frozen Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Harness mode | `CLEAN / READ_ONLY` |
| Harness packages | `dsh 0.1.2-alpha.1`; Cordis Loader package `1.0.2`; existing React / ReactDOM resolution `18.3.1` |
| Step1 / Step2 | `PASS / CLOSED / FROZEN`; prior capabilities must not regress |

保留输入中的 Review history，不创建或冒充新的审查：

```text
REVIEW_026 = FAIL
F_026_01 = CLOSED_BY_REVIEW_026B
F_026_02 = OPEN_PENDING_INDEPENDENT_REREVIEW
REVIEW_026B = FAIL
F_026B_01_CORRECTIVE = APPLIED_WAITING_INDEPENDENT_REREVIEW
REVIEW_026C_EXECUTION = DEFERRED_NOT_EXECUTED
REVIEW_026C = DEFERRED_PENDING_FULL_SHACO_PRESENTATION_CORRECTIVE
PROVIDER_GATE_AUTHORIZATION = NO
```

Owner 在本轮输入中提供了最近 Headless Capability Audit 结论。仓库内未定位到独立命名的该 Audit 报告；因此不虚构 Audit 文件、Review 编号或 PASS。本候选以当前 Frozen HEAD 的 package exports、公开类型和实现只读交叉核对支持其关键结论（第 3–14 节及附录）：

```text
FULL_SHACO_PRESENTATION_PUBLIC_API_FEASIBILITY = CONFIRMED
HEADLESS_CAPABILITY_VERDICT = FULL_SHACO_PRESENTATION_FEASIBLE_ON_CURRENT_HARNESS_PUBLIC_API
HARNESS_BASELINE_CHANGE_REQUIRED = NO
HARNESS_SOURCE_EXTENSION_REQUIRED = NO
MISSING_BLOCKING_HEADLESS_BUSINESS_API = NONE
FULL_SHACO_PRESENTATION_OPTION = OPTION_B_PUBLIC_LOWER_LEVEL_CLIENT_BOOTSTRAP
```

## 2. Final visible UI ownership

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
HARNESS_REBASELINE_REQUIRED = NO
ONE_CLIENT_RUNTIME = YES
ONE_CORDIS_CONTEXT = YES
ONE_REACT_ROOT = YES
SECOND_WORKSPACE_SESSION_CONVERSATION_TRUTH = FORBIDDEN
SECOND_AGENT_RUNTIME = FORBIDDEN
SECOND_APPROVAL_QUESTION_SETTLEMENT_TRUTH = FORBIDDEN
```

```text
Shaco Forge Desktop
├─ ShacoSidebar
│  ├─ New Chat
│  ├─ Project Directory
│  └─ Settings
├─ ShacoWorkbar
│  ├─ Current Project / Session context
│  └─ Worker / Connection truthful low-noise state
└─ ShacoChatWorkspace
   ├─ Shaco Empty / Loading / Error surface
   ├─ ShacoConversation / ShacoMessage / ShacoToolResult
   ├─ ShacoApproval / ShacoQuestion
   └─ ShacoComposer / ShacoModelSelector / ShacoPermission
```

Settings 是同一 ShacoRoot 内的全局 application surface，由 Sidebar 底部入口进入；不属于 Project child，也不打开第二产品 Shell。禁止显示 Full Harness AppFrame、Harness Sidebar、Hero/Home、logo、“探索未至之境”、Preview badge、Workspace chrome、Settings page、Composer presentation shell 或任何可识别为第二产品的视觉层。

遵循未修改的 [UI Design Spec](../01-product/SHACO-FORGE-UI-DESIGN-SPEC.md) 与其中 Owner 接受的 [Shell reference](../01-product/assets/SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png)：Light、低饱和、Modern Developer Workbench、单 Sidebar、Fixed Function Area、Project Directory、底部 Settings、共用中心轴、约 1100px 主内容宽度、无永久 Inspector、低噪音 Worker 状态。首先满足 `STRUCTURAL_PRODUCT_UI_CORRECTNESS`，不扩大为 Pixel Perfect redesign，不预建 V1.1/V1.2 UI。

## 3. Option B exact public exports and bootstrap contract

### 3.1 Public import inventory

以下 package specifier 是允许的运行时或 type-only 边界。源码路径仅作为只读审计定位；即使某包的 exports 声明 `./src/*`，Product Runtime 仍禁止使用它。不得 import `packages/**/src`、私有实现路径、私有 event type 或 private React state。

| Exact public package export | Public values / types | Caller responsibility |
|---|---|---|
| `@deepseek-ai/dsh-client-web` | `getStaticModules`, `PLATFORM_MODULES`, `PRELOADED_CLIENT_EXTERNALS`, type `PlatformModule` | ShacoBootstrap 读取既有平台静态模块表；不创建 `AppWebEntry`，不调用其 private ctx / boot methods |
| `@deepseek-ai/dsh-client-modules` | `bootInjections`, `orderByModuleGraph`; types `WebBootGraph`, `WebBootEntry` | 未来 controlled preparation 使用的公开 node-side graph/facade 生成面；不是 Renderer business import；本轮不调用生成 |
| `@deepseek-ai/dsh-client-modules/client` | `createClientModuleSystem`, `ClientModuleSystem`, `parseBootManifest`; types `DshWindow`, `ClientModuleLoaderTarget`, `ClientModuleCreateOptions`, `ClientBootstrapModule`, `ClientModuleLoader`, `BootManifest`, `BootPluginRow`, `ClientBundleRegistration` | 使用已经注入的 `__DSH_BOOT__` 与 `__ModuleLoader__`；facade 的 `create(options)` 只执行一次，使用预加载 modules bundle 的同一 exports |
| `@deepseek-ai/cordis` | `Context`, `FiberState`; public `Context.plugin`, `Context.inject`, `Context.effect`, `Context.fiber.dispose`; type `Fiber` | 每个有效 generation 一个 root Context；scope/fiber 是此 Context 的子生命周期，不是第二 runtime |
| `@deepseek-ai/cordis-plugin-loader` | default / named `Loader`; `Entry`, `EntryTree`, type `EntryOptions`; public `Loader.internal`, `create`, `resolve`, `entries`, `await` | 公开 Loader 加载同一 module system，逐行建立插件并审计 activation |
| `@deepseek-ai/dsh-client-ui-renderer/client` | `SlotRegistry`; types `UiRendererService`, `RootOwnerProps`; `ctx.slots.register`, `entriesOfSlot`, `subscribe`, `onEntryError`, `ctx.uiRenderer.mount` | Shaco Product row 注册 root；bootstrap 在 readiness barrier 后挂载一次，并通过公开监督面阻止 root failure 暴露 Harness fallback |
| `@deepseek-ai/dsh-client-ui-slots` | `SlotCore`; types `SlotMap`, `HostObservable`, `PropsRuntime`, `ComposedProps` | 使用既有 single-root slot 的公开 shadowing 语义；不 redeclare Harness 子 slot |
| `@deepseek-ai/dsh-client-store` | type `ObservableSnapshot` | 读公开 `getSnapshot / subscribe`；不为业务复制 store |
| `@deepseek-ai/dsh-client-connection/client` | types `ConnectionHandle`, `ClientTransportHooks` | 继续现有 Carrier 适配、generation 和 transport hook；不引入新 wire protocol |

这些 root exports 在对应 `package.json` 映射到 `lib/index.js` / `lib/types/index.d.ts`；典型 `./client` 映射到 `lib/client.js` / `lib/types/client/index.d.ts`。Specifier 由 public exports 解析，不直接 import `lib` 内部文件。静态表严格沿用公开的八个 platform words：`react`、`react/jsx-runtime`、`react-dom`、`react-dom/client`、`@deepseek-ai/cordis`、`@deepseek-ai/dsh-client-store`、`@deepseek-ai/dsh-client-ui-slots`、`@deepseek-ai/dsh-client-ui-primitives`。Product bundle 使用同一实例，禁止嵌入第二份 React/Cordis。

未来沿用当前 [Vite public-export resolver 与 browser stub 配置](../../apps/desktop/vite.config.ts) 的 browser bundling 边界；Loader 的 Node compatibility import 继续由已有 Product stub 处理。公开 Loader 接点不赋予 Renderer Node authority，不开放 nodeIntegration，不改变 sandbox/contextIsolation、preload allowlist 或现有 CSP；本轮未修改或运行该配置。

### 3.2 Ordered lifecycle and activation barrier

1. ShacoBootstrap 在既有 mount container 内绘制 Shaco-owned framework-free Loading/Error DOM。预挂载阶段不另建 React root；注入完成由现有静态 bootstrap 顺序与 Shaco readiness promise 负责，不依赖 AppWebEntry 的 private 字段或非公开 readiness event。
2. 读取静态 composition graph 和现有公开 `ClientModuleLoaderTarget` facade，调用一次 `target.create({ boot, staticModules: getStaticModules(), loadBundle? })`。facade 内部调用公开 `createClientModuleSystem`，禁止再直接调用它创建第二实例。bundle transport 保持当前 local scheme / Carrier 责任，不重新生成或裁剪 graph。
3. 创建唯一 `new Context()`。`await ctx.plugin(Loader)` 后，把同一 module system 接到公开 `ctx.loader.internal` 属性。此属性名字虽为 `internal`，它是导出 Loader 的 public 成员；`ClientModuleLoader` 的导出文档明确规定该 Client 接点。其 Node-oriented property type 与 Client type 不同，Frozen `web/src/boot.ts` 自身采用一次类型桥接。未来实现可在 bootstrap adapter 中采用相同的局部 type bridge；不得据此访问 Node loader 私有成员、`process` 或 private AppWebEntry ctx。
4. 以 `manifest.plugins` 为行 authority，预取 `immediately` rows，再通过 `loader.create({ name: row.id })` 激活保留的 28 个 Harness plugins。prefetch 完成、`create()` 返回或 `loader.await()` quiescence 单独都不等于成功。
5. `await loader.await()` 后，逐一用 `loader.resolve(id)` / `loader.entries()` 确认 Required rows 均存在 fiber 且 `fiber.state === FiberState.ACTIVE`；缺行、缺依赖、PENDING、FAILED、DISPOSED 均 fail closed。检查所需公开 services 已可用，包括由插件提供的 `modelDirectories`、`uiSession`、`uiConversation`、`settingsScope`、`settingsSchema`。不监听或复制 `internal/status` 等 private event 作产品依赖。
6. Harness barrier 成立后才允许唯一 `@shaco-forge/desktop` Product row 完成 root registration。它仍是 graph 中的唯一 Product row；职责从旧 Sidebar contribution 改为 ShacoRoot ownership（未来 source change）。冻结 Shaco root registration 使用 `name: 'root', priority: -1`，Harness AppFrame 的公开默认 priority 为 `0`。采用最低 live priority 获胜的公开 single-slot 语义；不得用动态默认 priority 猜测注册顺序。
7. Product row 激活后，以公开 `ctx.slots.entriesOfSlot('root')` 确认唯一 winning entry 是本次 ShacoRoot contribution，再调用一次 `ctx.uiRenderer.mount(container)`。原始 `slots.entries('root')` 可以含 Harness dormant registration，不能把注册行数误判为可见 root 数量。只有 mount 调用创建 React root；ShacoRoot 在其内部直接呈现 Shaco components。保留 Harness root contribution 及其声明、DI、consumer，但不呈现其 AppFrame 或子 occupants，不再次 render Harness sidebar/conversation/composer/settings slots，不靠 CSS 隐藏已挂载的第二 Shell。
8. Bootstrap mount 失败、root ownership 失效或任一 required service 丢失，立即进入 Shaco Error/Loading。挂载前安装公开 `slots.onEntryError(...)` 同步 error supervisor，以及 `slots.subscribe('root', ...)` ownership recheck；后者是 microtask-batched，不能单独作为防闪现保证。Shaco root render error 先由 Shaco error boundary 处理；若外层 slot boundary 报 root error/abdication，同步撤销该 mount subtree 的可见性与交互，再在安全的 React teardown 时机 unmount/dispose，显示 framework-free Shaco Error DOM。不得等待重新渲染到 Harness winner 后才处理。依赖服务 lifetime 通过公开 `ctx.inject`/effect 的 teardown 绑定同一关闭路径；正常 Product row 撤销前先 unmount。禁止默认回落到 Harness AppFrame/BootPage，禁止在 Product row 尚未 ready 时提前 mount。故障遮断不用于常态隐藏第二产品 Shell；正常成功路径只挂载 ShacoRoot。
9. disconnect/recovery/teardown 先 fence 旧 generation，禁用旧 mutations，移除可见应用 mount，再销毁同一个 `ctx.fiber.dispose()`。先 unmount 后撤销 Shaco root registration，避免短暂暴露 Harness root。disposer 必须幂等，所有 subscribe/effect 都归属同一生命周期。失败 bootstrap 也必须 dispose 部分创建的 Context。
10. 等旧 Context disposal 完成，按既有 Desktop recovery 建立下一代 Client，在新页面/bootstrap generation 重新取得 facade 与 graph；不得对已经 `live` 的旧 facade 再 `create()`。始终至多一个 live Client Context、一个 React root；关闭 Desktop 不自动 stop Worker 或 cancel Agent。

公开 root 注释中针对普通 additive plugin 的 “DO NOT register here” 提醒，是因为 root replacement 会独占可见页面；本候选由 Owner 明确选择此完整产品替换，使用已存在的 public replacement 机制。没有提出新的 Harness presentation extension 或 baseline change。该机制的运行时正确性仍须未来 UI-G gates 证明。

## 4. Harness presentation source reuse and compliance

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

本策略持久化 Architecture Owner 已选择的 V1 默认优先实现顺序。`COPY_AND_ADAPT_FIRST` 不是要求机械复制全部 Harness UI：对 Frozen Harness 已成熟实现的 Conversation rendering、Message / Chat node rendering、Markdown / content rendering、Tool Result presentation、Composer presentation、Approval UI、Question UI、Model Selector presentation、Permission presentation，以及必要的纯 UI helpers/styles/icons，实现阶段必须先评估 React / TypeScript / CSS / helper 源码复用。

若所选源码同时满足以下条件，默认执行 `COPY / EXTRACT / ADAPT`：属于 Presentation；License / Notice 允许；可以剥离 private runtime dependency；可以重新绑定 Harness public services；迁移成本合理。迁入后去除 Harness 产品 branding / shell，改为由 Shaco 维护与命名的 Shaco-owned components，按既有 Shaco UI Design Spec 重新组合；运行时继续绑定本文约定的 Harness public services / truth。不得在未完成组件级评估时直接默认从零重写。

不得迁移形成第二 Workspace/Session truth、Conversation store/reducer、Tool runtime、pending registry、settlement state machine、Provider/model registry 或 Credential persistence。特别不得复制 `PendingApproval` / `PendingQuestion` 类、`registerPendingInteraction` consumer、Remote Event listeners 或 `ClientSessions` 等业务实现。pending draft、输入文字、展开折叠、滚动、search 和局部 busy/error 可以是 UI state；不能成为 durable business authority。

`SOURCE_REUSE` 是把合规选定的源码字节迁入 Shaco，改造成 Shaco presentation；`RUNTIME_PRIVATE_DEPENDENCY` 是部署后继续 import 未公开 upstream 实现，两者必须独立审计。前者是在上述条件成立时的默认优先选择，后者禁止。即便采用 upstream source 作为模板，也必须剥离 private imports，不能伪造 public type，不能绕过已有 public assembly。

### 4.1 Read-only local compliance result

| Local evidence | Observed fact | Required handling |
|---|---|---|
| Frozen Harness `LICENSE` | MIT License；`Copyright (c) 2026 DeepSeek`；要求 copies/substantial portions 包含 copyright 和 permission notice | 对迁入的适用源码保留完整适用 MIT notice；保留原有作者/来源信息，不宣称原创所有权 |
| root `package.json`、相关 Client package metadata | root 及 ui-conversation/ui-chat/ui-tool/ui-approval/ui-user-questions/ui-model-selection/ui-permission-presets/ui-primitives 等候选包声明 MIT | 逐文件 migration inventory 记录原路径、Frozen HEAD、SHA、目标路径和改造内容；包级声明不能覆盖独立 third-party 条款 |
| `THIRD_PARTY_NOTICES.md` | 说明 Harness 为 MIT，third-party 各有许可证；direct 与 transitive closure 的范围不同 | 逐一核对实际复制/新增依赖及适用 notice；不能把全部第三方一概称为 MIT，也不把无关 SDK payload 授权扩大到 UI 素材 |
| 指定八类 UI package 的 `src` 文件/header 扫描 | 未发现另行的 copyright/SPDX/license 禁止性 header；发现的是普通模块/行为注释。未实际选取或复制源码 | 实际迁移前再次审查选定文件、导入的 helpers/styles/icons、内嵌资源与依赖自己的 LICENSE/NOTICE |
| 已有内部/同项目授权 | 未发现可替代逐项检查的明确 Shaco 内部授权文件；无需虚构授权 | 本候选仅依据本地公开 License/Notice 事实定义合规路径 |

```text
LOCAL_HARNESS_LICENSE = MIT
LOCAL_SOURCE_REUSE_PATH = AVAILABLE_WITH_NOTICE_PRESERVATION
COMPLIANCE_STATUS = LOCAL_BASE_TERMS_CONFIRMED_FILE_SELECTION_CHECK_REQUIRED
PRESENTATION_SOURCE_COPIED_THIS_ROUND = NONE
```

这是本地材料核查记录，不是对尚未选定源码/图标/第三方闭包的 blanket clearance。实现前必须完成所选文件 inventory、copyright/attribution/notice 落点与依赖条款检查；必要 notice 可保存在分发 license/notices 材料或 Shaco-owned legal disclosure 中，不能用保留 Harness 产品视觉壳替代合规。缺少材料的具体项标记 `COMPLIANCE_STATUS = NEEDS_OWNER_OR_LEGAL_CONFIRMATION`，不得先复制再假定许可。若明确禁止且没有现成合规路径，执行第 20 节 Stop Condition。本轮未联网、未运行 notice generator、未修改 Harness。

### 4.2 Component assessment and local Greenfield fallback

未来 Executor 在实现每一个主要 Chat UI 模块前，必须先完成 `REUSE vs ADAPT vs GREENFIELD` 判断，记录所评估的上游组件、复用可行性与选择理由。默认优先级为：

1. Copy / Adapt Harness Presentation source（可按需抽取纯展示部分）。
2. Thin Shaco component consuming Harness public data；只有组件级源码复用评估满足下述例外，才进入此局部重写路径。
3. Greenfield complex UI；仅在前两者均不充分、且已记录具体不足时采用。

只有单个 UI 组件存在以下任一具体事实时，才允许局部 Greenfield；例外不能扩展成整个 Chat UI 默认重写：

- 与 Harness private runtime / private React state 强耦合。
- 携带第二业务 truth / reducer / registry。
- 迁移会要求 private runtime import。
- 迁移代码量和复杂度明显高于一个薄 Shaco presentation component。
- License / Notice 对该具体文件存在未解决阻碍。
- 当前 Shaco UI 需求远小于原组件，复制会引入明显不必要复杂度。

该组件必须记录 `SOURCE_REUSE_ASSESSMENT = NOT_PRACTICAL` 及具体理由，说明上述事实为何使纯 Presentation 抽取/改造不可行或不合理；若选择复杂 Greenfield，还必须说明薄组件为何不足。“自己写更干净”“我更喜欢新的组件”“为了统一架构”均不是放弃源码复用的充分理由。文件级许可阻碍不授权复制该文件，也不豁免第 20 节 Stop Conditions；若发现 Copy/Adapt First 与现有 License/Notice 明确冲突，停止并返回 `ARCHITECTURE_OWNER_REASSESS_REQUIRED`。

目标是最小开发量 + 最大复用已验证 Harness UI + 100% Shaco visible presentation。默认优先策略不改变本文各模块的数据契约、business truth ownership 或 required gates，也不构成本轮 Implementation Authorization。

### 4.3 Per-source migration record and runtime truth protection

正式 Implementation 时，每个实际迁移来源必须记录以下八项；仅有 package-level License 或一个组件名不足以替代：

| Required migration field | Record requirement |
|---|---|
| upstream source path | 实际复制/抽取的 Frozen Harness 源文件路径，含适用 helpers/styles/icons |
| Frozen Harness HEAD | 该来源对应的 Frozen commit identity |
| source SHA | 迁移所依据原始文件字节的 SHA256 |
| target Shaco path | 实际落入的 Shaco-owned 文件路径 |
| reused/adapted scope | 复用范围、抽取范围与 Shaco 改造内容 |
| License / Notice handling | 适用许可、copyright / attribution / notice 的保留与分发落点 |
| private dependency removed | 原 private runtime / private React state 依赖的剥离情况；无此依赖时明确记录 NONE |
| public runtime binding used | 实际使用的 Harness public export/service/snapshot/subscription/mutation |

Harness 继续是 Workspace / Session / Conversation / Streaming / Tool / Approval / Question / Model / Permission / Settings / Credential / Agent Runtime 的唯一业务 truth owner。源码复用不得形成第二 Workspace truth、Session truth、Conversation reducer/store、Tool runtime、pending registry、Approval/Question settlement state machine、Provider/model registry 或 Credential persistence。Shaco-owned presentation code 不意味着 Shaco-owned business runtime。本轮只持久化策略与记录要求，不实际复制任何 Presentation 源文件。

### 4.4 Copy/adapt theme normalization

```text
HARNESS_COPIED_PRESENTATION_STYLE = NORMALIZE_TO_SHACO_THEME_TEMPLATE_SYSTEM
COPY_ADAPT_THEME_NORMALIZATION = REQUIRED
```

Copy/Adapt First 与本节既有复用、Greenfield fallback、License/Notice 和 public runtime 边界全部保持。未来迁移 Conversation、Message、Markdown/content、Tool Result、Composer、Approval、Question、Model Selector、Permission、UI helpers/styles 时，不得把 Harness 固定 skin 变成 Shaco 长期样式 authority：业务绑定使用 Harness public runtime，可见组件归 Shaco，visual styling 必须归一化进入第 15.1–15.3 节的 Shaco semantic token / Theme Template 体系。

纯结构布局 CSS 可以按需复用；颜色、radius、shadow、spacing/density、control skin 等外观值必须映射为 Shaco semantic CSS tokens 或有限 template recipe / variant tokens。不得仅替换 branding 后保留与 Harness skin 绑定的大量组件内硬编码值。该归一化属于既有 ADAPT 工作，不把主题扩展要求作为绕过源码复用评估、默认 Greenfield 的理由。本轮不复制或修改任何 UI/CSS 源码。

## 5. Workspace / Session / History

Public exports：`@deepseek-ai/dsh-api-workspace-controller/client` 的 `IWorkspaces`, `WorkspaceSnapshot`, `WorkspaceId`, `WorkspaceView`；`@deepseek-ai/dsh-api-session-controller/client` 的 `ISessions`, `SessionBinding`, `SessionFace`, `SessionSnapshot`, `SessionListState`, `ClientResult`；`@deepseek-ai/dsh-client-ui-workspace/client` 的 `UiWorkspace`。

ShacoSidebar 从 `ctx.workspaces.list` 与 `ctx.sessions.list` 的 `getSnapshot()/subscribe()` 投影真实 Project/Session，包括搜索与展开 UI。现有 Native Picker 仍通过 Electron Main 的受约束调用返回目录，再由既有 `workspaces.create`、`uiWorkspace.connectWorkspace(workspaceId)`、`sessions.open(sessionId)` 完成真实 create/connect/open。无 Project 的 New Chat 必须先选择/打开目录；有 Project 时保留当前 Step3 flow。

`uiWorkspace.connectWorkspace` 负责 qualifying blank Session reuse 和并发 create 合并；Shaco 不承诺每次点击生成新 identity，不复制其 blank 判定/connecting map。不绕过 Workspace context 另建 Session data layer。`sessions.binding(sessionId)` 可返回 undefined，必须呈现 Shaco Loading/Unavailable，不能伪造 binding。历史页使用 `binding.session.loadOlder()`，其加载/失败继续来自 Session snapshot。

## 6. Conversation / Streaming data contract

```text
REUSE_HARNESS_ASSEMBLED_CHAT_TARGET = YES
CONVERSATION_TRUTH_OWNER = HARNESS
SHACO_CHAT_REDUCER = FORBIDDEN_WITH_CURRENT_SUFFICIENT_PUBLIC_ASSEMBLY
```

唯一数据链：`ctx.sessions.binding(sessionId)` → `ctx.uiConversation.binding(binding).target('chat')` → `getSnapshot()` / `subscribe(listener)`。`@deepseek-ai/dsh-client-ui-conversation/client` 导出 `UiConversation`, `ConversationBinding`；`@deepseek-ai/dsh-client-ui-chat/client` 导出 `ChatSnapshot`, `ChatNode`, `ChatNodeKind`, `ChatNodeDataMap`, `ChatConversationViewNode`, `AssistantChatData`, `ToolChatData`, `ChatNodeStore` 等 contract。

按 `ChatSnapshot.order` 的稳定 key 查询 `snapshot.nodes.get(key)`，遵循公开 node kind/data/visibility，不从 `nodes.values()` 自建业务顺序。Chat target 可能暂时 undefined；只显示真实 Loading/Unavailable。`nodes` 是稳定 live keyed reader，更新由 target subscription 通知；不能仅比较 store 对象 identity 而丢失 streaming 更新。UI 读取当次 publication，避免保存脱离 generation 的 node/store 引用。

Streaming、running/settled/interrupted、Tool records、turn error、history pagination 都沿用 Harness assembly 和 Session lifecycle。未知 node kind 用 Shaco-owned basic truthful fallback；不得静默伪造成功。即使 public event source 可访问，V1 也不消费原始 event log 重建 Chat reducer；发现 public assembly 无法覆盖现有 UI 时先 Owner reassess，不在本候选下另建 truth。

## 7. Composer / Prompt / Cancel

```text
PROMPT_TRUTH_OWNER = HARNESS
PROMPT_SUBMIT = HARNESS_PUBLIC_SESSION_API
```

ShacoComposer 拥有 draft、input、attachment preview、send/stop buttons、Model/Permission placement、loading/error presentation。提交调用当前 `SessionBinding.session.prompt(content, mode, signal?, requestId?)`，public signature 返回 `Promise<ClientResult<{ accepted: true }>>`；`mode` 为 `'queue' | 'steer'`，默认普通发送沿用 queue，steer 仅在真实 explicit action 下使用。

`PromptContentPart` 从 `@deepseek-ai/dsh-api-session-controller/types` 导入：text 或 image（mediaType/data/name）。只提供现有 public API 支持的附件，不假造通用文件上传能力；Host 承担 durable attachment promotion。若需要 optimistic submission echo，使用公开 `beginSubmission(BeginSubmissionInput): SubmissionHandle` 及其 `requestId`；序列化未能到达 prompt 时使用该 handle 的 `abandon()`，不复制 pending submission store。无本地 echo 也必须让后续 Harness snapshot 决定内容出现。

按钮 gating 读取当前 Session lifecycle、pending interaction、`ctx.conversation.blocks.storeFor(sessionId)` 的公开 block snapshot，以及 model directory 的 truthful state。Shaco 对这些业务 store 只读。提交 admission 不是 completion；不可因 RPC accepted 就显示最终成功。失败/unknown outcome 保留可修正 draft，按既有 recovery fencing 重读，不自动 resend。Stop 使用 `binding.session.cancel()`，cancel admission 后等待 Harness lifecycle 收敛；queued work 的既有语义保持。Carrier disconnect、Desktop close、Worker stop、Agent cancel 是不同动作，不能互相模拟。禁止 DOM 点击 Harness Composer。

## 8. Tool

```text
TOOL_RESULT_RENDERING = BASIC
TOOL_EXECUTION_OWNER = HARNESS
```

使用 public `ToolChatData.root` / `ToolCallBlock` / `RunningToolCall` / `ToolResultNode` 和 `isRunningTool`, `isSettledTool`（后两个由 `@deepseek-ai/dsh-client-ui-chat/client` 导出）。ShacoToolResult 默认按第 4 节 Copy/Adapt First 迁移纯 presentation；仅在组件级记录 `SOURCE_REUSE_ASSESSMENT = NOT_PRACTICAL` 及具体理由后，才采用消费 Harness public data 的薄 Shaco 展示实现。无论采用哪条路径，都必须显示 tool name、running、input summary、result、failure 和可展开 basic detail。Tool input/output 的结构未识别时使用有边界的文本/结构展示，不伪造成功或失败。Tool execution、递归 subcall、结果关联及生命周期全部由 Harness 提供，禁止复制复杂 Tool runtime。

## 9. Approval corrective

```text
SHACO_APPROVAL_UI = V1_REQUIRED_PRIMARY_INTERACTION_SURFACE
APPROVAL_TRUTH_OWNER = HARNESS
APPROVAL_PENDING_SOURCE = ctx.uiSession.pendingInteractions
APPROVAL_SETTLEMENT = EXISTING_HARNESS_PENDING_OBJECT.answer(...)
SHACO_SECOND_PENDING_MODEL = FORBIDDEN
SHACO_SECOND_SETTLEMENT_STORE = FORBIDDEN
INTERNAL_EVENT_ID_DEPENDENCY = FORBIDDEN
```

`@deepseek-ai/dsh-client-ui-session/client` 导出 `UiSession`, `SessionPendingInteraction`, `SessionPendingInteractionSnapshot`；pending source 是 `HostObservable<ReadonlyMap<SessionId, SessionPendingInteraction>>`。Shaco 订阅该 source，以当前 sessionId 读取已有对象。`@deepseek-ai/dsh-client-ui-approval/client` 公开导出的是 type `PendingApproval`, `ApprovalDecision`, `ApprovalPresentationRequest`；**不是可供 Product new/instanceof 的 public runtime constructor**。用公开 `kind === 'approval'` 缩窄，保留对象原引用，调用 `pending.answer('allowed-once' | 'rejected'): Promise<void>`。

展示 toolName、reason、可用的 callId detail；一次明确用户动作调用一次 answer。click 时重新检查 generation、session 与当前 pending 对象引用仍匹配；局部 busy lock 仅防重复点击，不是第二 settlement truth。`pending.key` 仅是当前 Client 的 opaque render/remount identity，不是 Host eventId、durable correlation 或跨重连 exactly-once key。禁止读取内部 frame.eventId、构造替代 pending、自己注册 waterfall listener，或在 disconnect 时自动 answer/delegate/abort。

answer resolution 只代表现有 pending 对象的结算调用完成；Host continuation 由 Harness truth 与未来 Real Host evidence 确认。错误/失联不得自动重试 settlement，重新取得真实 pending 后等待用户明确决定。

## 10. Question corrective

```text
SHACO_QUESTION_UI = V1_REQUIRED_PRIMARY_INTERACTION_SURFACE
QUESTION_TRUTH_OWNER = HARNESS
QUESTION_PENDING_SOURCE = ctx.uiSession.pendingInteractions
QUESTION_SETTLEMENT = EXISTING_HARNESS_PENDING_OBJECT.answer(...)
```

`@deepseek-ai/dsh-client-ui-user-questions/client` 公开 type `PendingQuestion`, `QuestionAnswer`, `PlanReview`；同样不得把 type-only export 当 runtime constructor。以 `kind === 'question' | 'plan-review'` 缩窄现有对象，读取 `questions`。`@deepseek-ai/dsh-user-questions/types` 的 `AskUserQuestionItem`, `AskUserQuestionOption`, `AskUserQuestionIntent`, `AskUserQuestionAnswer` 定义 questions/options/multiSelect/custom answer/plan-review。

回答使用原 question id 与原 option label：`QuestionAnswer` 的 `answers` 每项包含 `id`, `selected: string[]`, 可选 `custom`。完整 batch 经真实 `pending.answer(answer): Promise<void>` 提交。plan-review 仅改变 Shaco 展示；approve label 取 caller intent，不能由按钮顺序推断。多问题、多选、超过二选项或无法安全收窄的 intent 回到完整通用表单，不能丢失可回答选项。

只允许当前 generation/pending 对象绑定的临时表单 draft；替换时丢弃旧引用，不创建第二 Question runtime/store。Question 的显式用户取消若呈现，使用真实 `pending.cancel()`；不能把 disconnect、组件卸载或重新挂载视为取消/回答。Approval 的一次动作/重读/未知 outcome 边界同样适用。

## 11. Model

`@deepseek-ai/dsh-client-ui-model-selection/client` 公开 `ModelDirectory`, `ModelDirectoryResolver`, `ModelDirectoryState`，服务为 `ctx.modelDirectories`。ShacoModelSelector 获取 `directoryFor(sessionId)`，读取/订阅其 `directory.store`，必要时调用 `directory.load()`；显式选择走 `directory.select(ModelSelection)`。底层已有 `ctx.remote.session.selectModel(...)`，当前 selection 由 `binding.session.projections.faceOf('modelSelection')` 与 Host catalog 合成。

`ModelSelection`, `ModelSelectionProjection`, `ModelCatalog`, `ModelProviderGroup` 等类型来自 `@deepseek-ai/dsh-api-session-controller/types`；catalog 的实际 public method 为 `ctx.remote.session.modelCatalog()`。这是 Host 已有目录读取，不是 Provider 网络 `discoverModels`。禁止为了 Selector 初始化自动触发 provider discovery，禁止新建 Shaco Model Registry，禁止把 catalog 缺行等同于 route 不可用。`routable: null` 表示未知，`false` 才是明确不支持；error/failures 来自 directory。保留 addressed subagent session 的公开 unavailable 规则，不触发隐式激活。

## 12. Permission

ShacoPermission 读取/订阅 `binding.session.projections.faceOf('permissions')`；public `PermissionSelect` / `PresetOption` 从 `@deepseek-ai/dsh-permission-presets/client` 导入。展示 `currentValue` 与 Host 提供的 options；undefined 表示 capability absent，不自推状态。`custom` 可以显示为当前状态，当前 API 不允许把它当 preset target。

显式切换经 `binding.session.command('/permission <preset>')` 进入 Harness command/admission，preset 只能来自当前公开可选项；最终确认来自 pushed permission projection，不以 matched/admitted 代替生效。保留现有 Full access explicit acknowledgement 语义，但界面由 Shaco 实现。不复制 permission policy、sandbox state 或 command executor。

## 13. Settings

ShacoSettings 继续复用当前 Step3 已验证的 `ctx.remote.llm.listProviders()` / `listConfigurableProviders()`、`ctx.settingsScope.describe()` / `bind()`、`ctx.settingsSchema`、`ctx.remote.settings`、`ctx.remote.credentials`。public exports 是 `@deepseek-ai/dsh-api-remotes/client`（`ClientRemote`, `CredentialInfo` 与 namespace augmentation）和 `@deepseek-ai/dsh-client-ui-settings/client`（types `SettingsScopeBinder`, `SettingsScope`, `SettingsScopeSnapshot`, `SettingsDescribeFace`, `SettingsDescribeView`, `SettingsSchemaService`, `SchemaNode`）。

Provider / Custom Provider / endpoint / relay / credential / model 配置沿用已公开 schema 与 directory，不硬编码第二 registry。Settings 可编辑 draft 不是持久化 truth；保存走 Harness APIs。保留 namespace revision fencing，缺 revision 不执行无条件覆盖；unknown outcome 重读 `remote.settings.describe` 并经公开 describe face acceptView 对齐，禁止自动 replay。Credential API 没有 revision / exactly-once 保证，明确一次用户动作、generation fencing、status reread；只显示存在性/脱敏信息，secret 不写入日志、Evidence、诊断或 durable UI state。禁止使用 Harness visible Settings page；此候选不授权 Provider 网络执行。

## 14. Recovery and Real Host interaction proof

沿用 [Slice2 Lifecycle Contract](V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)、[Carrier Amendment](V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md) 与 [Step2 Closure](../04-development-records/V1-SLICE-2-STEP2-OWNER-CLOSURE-AND-FREEZE-DECISION.md)。Worker authority、Carrier、generation fencing、cold projection、Desktop restart、Worker replacement、stale callback rejection 均不得改变。

每次 generation 替换必须取消旧订阅、撤销旧对象的 mutation authority，再重新获取 Workspace snapshot、Session list/binding、Chat target、pending source/object、model directory / modelSelection 和 permissions projections、Settings mirrors。sessionId 相同也不能复用旧 binding；pending key 相同也不能证明它是同一 Host request。无 live owner 时展示 Shaco reconnect/unavailable，禁止使用旧 snapshot 授权操作。

历史 [Approval Real Host lifecycle](../04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026-CORRECTIVE-01/approval-real-host-lifecycle.json) 与 [Question Real Host lifecycle](../04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026-CORRECTIVE-01/question-real-host-lifecycle.json) 保留为已实现业务语义的历史 Evidence。其 Harness UI proof 不能直接标记 Shaco UI PASS。

未来必须分别用 Approval 与 Question 的 Real Host pending 证明：

```text
Desktop A
→ Real Host pending
→ ShacoApproval / ShacoQuestion visible
→ disconnect
→ same Host remains alive and pending
→ Desktop B
→ Shaco UI cold rebuild
→ freshly acquired pending visible
→ one explicit settlement
→ duplicate = 0
→ auto answer / replay / cancel = 0
```

未来 Evidence 必须关联 final UI source/composition identity、Host identity、Desktop A/B generation、pending 呈现、显式动作和 Host continuation；不以私有 eventId 构造生产依赖。通过已授权 Real Host fixture 可避免为该 gate 自动新增 Provider 运行；本轮不运行 fixture。

## 15. Minimal UI module boundary

```text
MINIMAL_SUFFICIENT_STRUCTURE = REQUIRED
```

| Module | Owns | Harness dependency |
|---|---|---|
| ShacoBootstrap | Shaco boot/loading/error、activation barrier、mount/unmount、generation lifetime | public module facade / Context / Loader / uiRenderer |
| ShacoRoot | 唯一可见 Shell、global Settings routing、Shaco render error boundary | root slot；只读服务引用 |
| ShacoSidebar | New Chat、真实 Project Directory、底部 Settings | workspaces / sessions / uiWorkspace / existing Native Picker |
| ShacoWorkbar | 项目/会话上下文、低噪音连接状态 | 真实 selection / connection / Worker projection |
| ShacoChatWorkspace | Empty/Loading/Error、内容居中、交互 placement | current binding 与 pending source |
| ShacoConversation | 订阅并呈现已有 chat target | uiConversation / ChatSnapshot |
| ShacoMessage | message / Markdown / content presentation | ChatNode data；不重折叠 event |
| ShacoToolResult | 基础工具状态、结果、详情 | public Tool records |
| ShacoComposer | draft/input/attachments/send/stop | Session prompt / cancel / snapshot / composer blocks |
| ShacoApproval | primary approval surface | existing PendingApproval.answer |
| ShacoQuestion | primary question / plan-review surface | existing PendingQuestion.answer |
| ShacoModelSelector | model selection presentation | existing ModelDirectory |
| ShacoPermission | permission presentation | permissions projection / command |
| ShacoSettings | global settings presentation | LLM directory / Settings / Credentials public services |

实际实现可合并过小组件；不要求一文件一组件，不为架构图添加独立 abstraction。公开服务继续由既有 Harness plugins 激活；Shaco row 是 presentation consumer，不重新实例化这些 services。

### 15.1 Theme Mode / Theme Template contract

Architecture Owner 在 REVIEW-027 后把 V1 Theme Scope 从一个 required template 扩为 BRAUN + FAMICOM 两个真实模板及最小可用切换入口；本节为待 Delta Review 的 implementation constraint，不构成主题已实现或当前执行授权。

```text
THEME_ARCHITECTURE = MODE_PLUS_TEMPLATE
V1_THEME_MODE_SUPPORT = LIGHT_DARK_SYSTEM_CAPABLE
V1_REQUIRED_THEME_TEMPLATE_COUNT = 2
V1_REQUIRED_THEME_TEMPLATES = BRAUN,FAMICOM
V1_DEFAULT_THEME_TEMPLATE = BRAUN
SHACO_DEFAULT_TEMPLATE_ALIAS = BRAUN
MULTIPLE_THEME_TEMPLATES_REQUIRED_IN_V1 = YES
V1_THEME_TEMPLATE_SWITCHING = REQUIRED
THEME_TEMPLATE_EXTENSION_SEAM = REQUIRED
FULL_APPEARANCE_SETTINGS_V1 = DEFERRED
```

`THEME_MODE` 是 `light | dark | system`，system 根据系统偏好解析为实际 light/dark；`THEME_TEMPLATE` 是独立 Style Preset / Visual Recipe identity。V1 必须真正完成 `BRAUN` 与 `FAMICOM`，默认 BRAUN；`SHACO_DEFAULT` 仅为 BRAUN 的兼容 alias，不是第三模板。两模板均必须保留 mode 机制，mode 切换后仍为 same component tree、same selected template identity、same Harness truth；无需为每个模板制作额外 Pixel Perfect dark reference。完整 Appearance Settings 仍 DEFERRED，不能据此省略第 15.5 节的最小真实 Template selector。

Template 至少控制以下外观维度，不能仅限于替换 Hex 颜色：

| Visual dimension | Template authority |
|---|---|
| Semantic palette and hierarchy | semantic colors、surface hierarchy、text hierarchy、accent |
| Border and elevation | border style、radius、shadow |
| Typography and density | typography、spacing / density、control height/style |
| Navigation recipe | Sidebar visual recipe |
| Chat recipes | Message / Chat、Composer、Tool Result visual recipe |
| Interaction / temporary surfaces | Approval / Question visual recipe、temporary elevated surface recipe |

Theme 只能影响 Presentation。禁止改变 Workspace / Session / Conversation truth、routing semantics、Prompt behavior、Tool execution、Approval / Question settlement、Model truth、Permission truth、Settings truth 或 Recovery behavior；切换主题不能触发业务重建、自动 Prompt / answer / replay，或建立第二套业务状态。

### 15.2 Existing foundation and stable root attributes

```text
CURRENT_PRODUCT_THEME_BASE = EXISTING_THEME_FOUNDATION
```

本轮只读核对 Product 的以下既有文件，保留其原始字节：

| Existing Product file | Observed foundation |
|---|---|
| [renderer/theme/tokens.css](../../apps/desktop/src/renderer/theme/tokens.css) | 已注册部分 semantic color tokens，覆盖 surface、text、border、interaction/status、accent |
| [renderer/theme/themes.css](../../apps/desktop/src/renderer/theme/themes.css) | 已提供 `:root` / `data-theme="light"` / `data-theme="dark"` 的色值及 color-scheme |
| [renderer/theme/theme.ts](../../apps/desktop/src/renderer/theme/theme.ts) | `ThemeMode` 为 light/dark/system；`RootThemeController` 解析系统偏好、订阅变化并写入 themeMode / theme dataset |

上述是 `EXISTING_THEME_FOUNDATION`，不是已完成的完整 Theme Template architecture；本轮未运行代码，不把源码核对当作新 Runtime PASS。

未来 ShacoRoot 使用稳定 root theme attributes；与现有实现兼容的等价示例是 `data-theme-mode` 表示选择的 light/dark/system、`data-theme` 表示解析后的 light/dark、`data-theme-template` 表示独立模板 identity。最终命名由 implementation 按现有 theme.ts 兼容性决定，不为命名重构当前代码。mode 变化不重置 template identity；template 变化不重置 mode。组件通过继承的 semantic CSS tokens + limited visual recipe / variant tokens 消费主题，主题值与模板差异集中在 Shaco theme/template 层；禁止组件散落大量与特定模板绑定的 hard-coded colors、radius、shadows 或 component skin values。

### 15.3 Template extension seam and scope limit

V1 在相同组件树和相同 Harness truth 上实现 BRAUN / FAMICOM 两模板；允许有限 presentation-only visual variants，不得复制第二套 Conversation、Composer、Sidebar 业务组件或 Approval runtime，不得修改 Harness。第 4.4 节继续要求所有 Copy/Adapt 样式归一化到 Shaco semantic tokens / template recipes，禁止 Harness hard-coded skin 成为组件样式 authority。

其他现有参考 Cyberdeck、Game Boy、IBM Terminal、Macintosh 1984、NASA、Sony Walkman、Windows 98 均为 FUTURE_ONLY：保留 assets，不删除、不实现、不预建特殊代码。通用 seam 允许未来添加 Owner 批准的模板，但 V1 required implementation 仅 BRAUN 与 FAMICOM。禁止 Theme plugin framework、download system、package manager 和复杂 schema engine；Theme marketplace / custom CSS 禁止进入 V1，完整 Theme editor 与 Appearance Settings 延后。既有 Settings truth、保存与 recovery 契约保持。

### 15.4 Image authority and dual-template visual contract

```text
LONG_TERM_SHELL_STRUCTURE_REFERENCE = SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png
BRAUN_VISUAL_REFERENCE = Braun.png
BRAUN_IS_CURRENT_LONG_TERM_REFERENCE_VISUAL = YES
FAMICOM_VISUAL_REFERENCE = FAMICOM.png
SAME_COMPONENT_TREE = YES
SAME_LAYOUT_AUTHORITY = YES
SAME_HARNESS_TRUTH = YES
DIFFERENT_THEME_TEMPLATE = YES
```

图片 authority 由 [UI Design Spec §3.3–3.4](../01-product/SHACO-FORGE-UI-DESIGN-SPEC.md) 持久化；本轮只读核验当前文件：

| Role / path | Dimensions | Bytes | SHA256 |
|---|---|---|---|
| [Long-term Shell structure](../01-product/assets/SHACO-FORGE-LONG-TERM-SHELL-REFERENCE.png) | 1672 x 941 | 1293763 | `2f6852676262562b614f9427c83c451ca99c129b4ba770597fd07023e6e35326` |
| [BRAUN visual authority](../01-product/assets/Braun.png) | 1672 x 941 | 1293763 | `2f6852676262562b614f9427c83c451ca99c129b4ba770597fd07023e6e35326` |
| [FAMICOM visual authority](../01-product/assets/FAMICOM.png) | 1672 x 941 | 1375052 | `3f43f6f1ab08efde8837aa55aa0fab10c8cd092bdd52aa76e2cb902c621f4dab` |

正式 Long-term Shell 图与 Braun.png 字节完全相同。Long-term Shell reference 继续管理结构、布局、Information Architecture、Sidebar / Workbar 位置、Chat Workspace、约 1100px 共用中心轴、Composer 位置、无永久 Inspector 与 Project Directory 层级；FAMICOM 不建立另一套页面结构。既有 Light / 低饱和等默认视觉描述归 BRAUN，FAMICOM 按自身参考实现 presentation-only recipe，保持同一布局 authority 和 V1 reduced exposure。

BRAUN（Template ID `BRAUN`）为 V1 默认模板，必须覆盖 Sidebar、Workbar、Project Directory、Conversation、Message、Composer、Tool Result、Approval、Question、Model Selector、Permission、Settings 与 temporary surfaces，达到 Braun.png 的结构/视觉方向一致；不冻结 Pixel Perfect 数值。

FAMICOM（Template ID `FAMICOM`）在相同业务组件树上表达 FAMICOM.png 视觉语言，覆盖上述产品 surfaces；至少包含 palette、surface hierarchy、typography treatment、accent、borders、radius、shadow/elevation、spacing/density、control styling、Sidebar recipe、top/workbar visual decoration、Message/Chat recipe、Composer recipe、Tool Result recipe、Approval/Question recipe、temporary surface recipe，以及可行范围内的 icon treatment。不得仅改 accent 或保留未归一化的 BRAUN/Harness fixed skin；与参考达到结构/视觉方向一致，而不复刻第二套业务实现。

### 15.5 Minimal real template switching

```text
THEME_TEMPLATE_SELECTOR = V1_REQUIRED_MINIMAL_UI
FULL_THEME_EDITOR = DEFERRED
THEME_MARKETPLACE = FORBIDDEN_V1
CUSTOM_CSS = FORBIDDEN_V1
OTHER_THEME_REFERENCES = FUTURE_ONLY
```

V1 必须提供真实可用的 Template 选择入口，至少有 `Braun` 与 `FAMICOM` 两个选项；可放在 Settings 内的最小 selector，或现有 UI 结构中更合适的低噪入口，不扩成 Full Appearance Settings。用户选择必须实际改变当前 root template identity 与其 token/recipe，并继续保留 mode 与当前业务组件/绑定。

切换不能重新创建 Workspace/Session/Conversation truth、Client runtime、Cordis Context 或业务组件树，不能丢失 Composer draft、重建 pending/settlement authority 或触发 Prompt/Tool/answer/replay。Conversation、Composer、Tool、Approval、Question、Model、Permission、Settings 继续为同一业务组件与同一 Harness public binding；允许纯视觉 variant 变化，禁止第二套 business state。root attributes 命名继续遵循第 15.2 节兼容性约束，不为命名另起代码重构。

## 16. UI acceptance gates

所有 gate 状态均为 `REQUIRED / NOT_RUN`。设计可行、旧实现 PASS、历史 S3G16 PASS、静态文档验证均不能提升本表状态。

| Gate | Contract | Future proof | Status |
|---|---|---|---|
| UI-G01 | ONE_VISIBLE_PRODUCT_SHELL | 全状态下只有 Shaco Shell | REQUIRED / NOT_RUN |
| UI-G02 | ONE_VISIBLE_SIDEBAR | 单 Sidebar，无重复导航 | REQUIRED / NOT_RUN |
| UI-G03 | VISIBLE_HARNESS_BRANDING_NONE | 无 logo、Hero 文案、Preview badge | REQUIRED / NOT_RUN |
| UI-G04 | VISIBLE_HARNESS_PRODUCT_SHELL_NONE | AppFrame/Workspace/Settings/Composer shell 未呈现，包括失败分支 | REQUIRED / NOT_RUN |
| UI-G05 | SHACO_CHAT_WORKSPACE_DIRECT_PRESENTATION | Shaco components 直接消费 public truth | REQUIRED / NOT_RUN |
| UI-G06 | CONVERSATION_COMPOSER_TOOL_CENTER_AXIS | Conversation/Composer/Tool 同中心轴 | REQUIRED / NOT_RUN |
| UI-G07 | CHAT_CONTENT_APPROX_1100PX | 宽窗约 1100px max-width、窄窗收缩 | REQUIRED / NOT_RUN |
| UI-G08 | SHACO_BOOT_LOADING_ERROR_OWNERSHIP | mount 前/失败/重连均为 Shaco UI | REQUIRED / NOT_RUN |
| UI-G09 | HARNESS_CONVERSATION_STREAMING_TRUTH_PRESERVED | history/streaming/completion/error 读取 Harness assembled target | REQUIRED / NOT_RUN |
| UI-G10 | SHACO_APPROVAL_REAL_HARNESS_SETTLEMENT | 第 14 节 Approval Real Host lifecycle + explicit one settlement | REQUIRED / NOT_RUN |
| UI-G11 | SHACO_QUESTION_REAL_HARNESS_SETTLEMENT | 第 14 节 Question Real Host lifecycle + complete answers/plan-review | REQUIRED / NOT_RUN |
| UI-G12 | MODEL_PERMISSION_PUBLIC_TRUTH | catalog/selection/permission 与 Harness projection 一致，无自动 discovery | REQUIRED / NOT_RUN |
| UI-G13 | NO_SECOND_RUNTIME_OR_TRUTH | 单 Client/Context/root、业务对象由 Harness 唯一持有 | REQUIRED / NOT_RUN |
| UI-G14 | PUBLIC_RUNTIME_APIS_ONLY | public specifier/type 审计、无 runtime private imports/source paths/event IDs | REQUIRED / NOT_RUN |
| UI-G15 | RECOVERY_AND_COLD_REBUILD_PRESERVED | 同 Host reconnect、Desktop restart、Worker replacement、旧 callback 拒绝 | REQUIRED / NOT_RUN |
| UI-G16 | NO_PERMANENT_INSPECTOR | 常态无右侧永久 Inspector | REQUIRED / NOT_RUN |
| UI-G17 | LOW_NOISE_WORKER_STATE | 真实 connection/Worker 信息，常态不暴露技术诊断墙 | REQUIRED / NOT_RUN |
| UI-G18 | VISUAL_STATE_MATRIX | 第 17 节九状态真实 Electron Evidence | REQUIRED / NOT_RUN |

### 16.1 Theme architecture acceptance seam

保留 THEME-G01–THEME-G05 的编号与 Contract，按双模板范围补充证明口径，并连续增加 THEME-G06–THEME-G08。既有 UI-G01–UI-G18 与九状态 Matrix 表格保持；全部 `REQUIRED / NOT_RUN`，REVIEW-027 PASS 不能提升 Runtime/visual Gate 状态。

| Gate | Contract | Future proof | Status |
|---|---|---|---|
| THEME-G01 | NO_COMPONENT_SKIN_BYPASSES_THEME_TEMPLATE_AUTHORITY | 检查自有及 Copy/Adapt 组件的外观值是否消费 Shaco semantic token / template recipe；纯结构布局 CSS 可复用，无固定 Harness skin 绕过 authority | REQUIRED / NOT_RUN |
| THEME-G02 | DEFAULT_TEMPLATE_COMPLETE | BRAUN（SHACO_DEFAULT alias）覆盖第 15.1/15.4 节全部默认视觉维度及 V1 展示组件 | REQUIRED / NOT_RUN |
| THEME-G03 | LIGHT_DARK_MODE_PRESERVED | BRAUN / FAMICOM 均保留 light/dark/system 能力，切换 mode 后 template identity、组件树与 Harness truth 不变 | REQUIRED / NOT_RUN |
| THEME-G04 | TEMPLATE_SWITCH_SEAM_PRESENT | 稳定 root template identity 在 BRAUN / FAMICOM 间切换 semantic tokens 与非颜色 recipe，沿用同一业务组件树 | REQUIRED / NOT_RUN |
| THEME-G05 | THEME_CHANGE_DOES_NOT_CHANGE_BUSINESS_TRUTH | 切换 mode/template 前后 business truth、routing、Prompt/Tool、Approval/Question settlement、Model/Permission/Settings 与 recovery 语义保持，无主题触发的业务动作 | REQUIRED / NOT_RUN |
| THEME-G06 | BRAUN_TEMPLATE_VISUAL_CONFORMANCE | 最终真实 Electron 全 Shell 截图对照 Braun.png，覆盖第 15.4 节 surfaces，结构/视觉方向一致，保持长期结构 authority | REQUIRED / NOT_RUN |
| THEME-G07 | FAMICOM_TEMPLATE_VISUAL_CONFORMANCE | 最终真实 Electron 全 Shell 截图对照 FAMICOM.png；Chat/Sidebar/Composer 等关键区均使用 FAMICOM，无 BRAUN/Harness fixed skin 残留 | REQUIRED / NOT_RUN |
| THEME-G08 | BRAUN_FAMICOM_RUNTIME_SWITCH | 真实 selector 执行 BRAUN → FAMICOM → BRAUN；证明同一业务组件树、同一 Harness binding/truth、无第二 business state、无 Harness 修改 | REQUIRED / NOT_RUN |

V1 必须交付两个真实模板与实际 UI 切换，synthetic override 或静态截图不能替代 THEME-G06–G08。未来 Evidence 应关联 final source/composition、root template/mode、切换动作前后组件实例与 Harness binding/业务 identity；覆盖 Conversation、Composer draft、Tool 状态、Approval/Question pending、Model、Permission、Settings，证明无业务重新创建或自动结算；仅有相同 Session ID 或两张截图不足以证明同一绑定。证据使用现有公开对象与安全标识，不引入 private runtime/eventId 依赖。本轮仅定义验收，不执行 Runtime、fixture 或 Delta Review。

## 17. Visual state matrix

未来 implementation 使用最终 source/composition 的真实 Electron 视觉 Evidence；每种状态不要求重复截图，图片应记录状态、generation、source/composition identity 与采集方式。截图不能替代真实业务结算与 cold rebuild Evidence。

| State | Must be visible / demonstrated | Status |
|---|---|---|
| 1. Bootstrap / Loading | Shaco-owned boot，尚未 ready 不挂载 Harness Shell | REQUIRED / NOT_RUN |
| 2. No Project | Shaco empty、Open Project / Recent / Settings，无假 Chat/Hero | REQUIRED / NOT_RUN |
| 3. Project selected + blank Chat | 真实 Project/blank Session、ShacoComposer | REQUIRED / NOT_RUN |
| 4. Active Conversation | 真实消息/streaming，ShacoMessage 直接呈现 | REQUIRED / NOT_RUN |
| 5. Tool running/result | ShacoToolResult running 到 result/failure；必要时合并状态记录 | REQUIRED / NOT_RUN |
| 6. Approval pending | ShacoApproval 可发现，可执行真实 public answer | REQUIRED / NOT_RUN |
| 7. Question pending | ShacoQuestion options/multiSelect/custom/plan-review 对应真实 request | REQUIRED / NOT_RUN |
| 8. Error / Reconnecting | Shaco error/reconnect，旧 generation mutation 禁用，无 Harness fallback | REQUIRED / NOT_RUN |
| 9. Narrow window | 单 Shell/Sidebar，内容响应式收缩，关键交互可达 | REQUIRED / NOT_RUN |

九种状态共同证明：用户始终只看到 Shaco Forge 产品界面。视觉精修限于既有 V1 acceptance。

### 17.1 Dual-template representative evidence

未来 Implementation 至少为 BRAUN 与 FAMICOM 各采集一张 representative full-shell screenshot，使用最终真实 Electron Runtime，并记录 final source/composition、template/mode 与采集方式。九状态主 Matrix 可用默认 BRAUN 完成，不要求九状态 × 两主题全部重复。FAMICOM Evidence 至少证明 Full Shell 真实切换、Chat/Sidebar/Composer 等关键区域均使用 FAMICOM、无 BRAUN/Harness fixed skin 残留，并结合 THEME-G08 的组件/绑定连续性证据证明功能仍消费同一 Harness truth。截图是视觉证据，不能替代切换及业务不变证明；本轮不采集 Runtime 图片。

## 18. Frozen rows and composition identity

```text
FROZEN_HARNESS_CLIENT_ROWS = 28
FROZEN_HARNESS_CLIENT_ROWS_RETAINED = ALL
PRODUCT_CLIENT_ROWS = 1
TOTAL_CLIENT_ROWS = 29
MODULE_PRUNING = OUT_OF_SCOPE
```

当前 row roster 与每行 bundle SHA 以 [REVIEW026B corrective final composition identity](../04-development-records/evidence/V1-SLICE-2/STEP-3/STEP3-20260910-REVIEW026B-CORRECTIVE-01/composition-identity.json) 的 `identity.rows` 为 authority。全部 28 个 Harness rows 保留；不因 visible occupants 不再显示而剪除 service/DI/consumer。它们按原 package ID 分别为：

<!-- FROZEN_ROSTER_START -->
| # | Frozen Harness public client row | Disposition |
|---|---|---|
| 1 | `@deepseek-ai/dsh-client-modules/client` | RETAINED |
| 2 | `@deepseek-ai/dsh-client-connection/client` | RETAINED |
| 3 | `@deepseek-ai/dsh-api-remotes/client` | RETAINED |
| 4 | `@deepseek-ai/dsh-client-ui-theme/client` | RETAINED |
| 5 | `@deepseek-ai/dsh-client-locale/client` | RETAINED |
| 6 | `@deepseek-ai/dsh-client-ui-layout/client` | RETAINED |
| 7 | `@deepseek-ai/dsh-client-ui-renderer/client` | RETAINED |
| 8 | `@deepseek-ai/dsh-client-ui-session/client` | RETAINED |
| 9 | `@deepseek-ai/dsh-client-ui-sidebar/client` | RETAINED |
| 10 | `@deepseek-ai/dsh-client-ui-settings/client` | RETAINED |
| 11 | `@deepseek-ai/dsh-client-ui-settings-general/client` | RETAINED |
| 12 | `@deepseek-ai/dsh-client-ui-settings-models/client` | RETAINED |
| 13 | `@deepseek-ai/dsh-client-ui-conversation/client` | RETAINED |
| 14 | `@deepseek-ai/dsh-client-ui-approval/client` | RETAINED |
| 15 | `@deepseek-ai/dsh-client-ui-chat/client` | RETAINED |
| 16 | `@deepseek-ai/dsh-client-ui-tool/client` | RETAINED |
| 17 | `@deepseek-ai/dsh-client-ui-workspace/client` | RETAINED |
| 18 | `@deepseek-ai/dsh-client-ui-directory-picker-browse/client` | RETAINED |
| 19 | `@deepseek-ai/dsh-client-ui-input-trigger/client` | RETAINED |
| 20 | `@deepseek-ai/dsh-client-ui-commands/client` | RETAINED |
| 21 | `@deepseek-ai/dsh-client-ui-subagent/client` | RETAINED |
| 22 | `@deepseek-ai/dsh-client-ui-model-selection/client` | RETAINED |
| 23 | `@deepseek-ai/dsh-client-ui-permission-presets/client` | RETAINED |
| 24 | `@deepseek-ai/dsh-client-ui-user-questions/client` | RETAINED |
| 25 | `@deepseek-ai/dsh-typert-registry/client` | RETAINED |
| 26 | `@deepseek-ai/dsh-api-gateway/client` | RETAINED |
| 27 | `@deepseek-ai/dsh-api-session-controller/client` | RETAINED |
| 28 | `@deepseek-ai/dsh-api-workspace-controller/client` | RETAINED |
<!-- FROZEN_ROSTER_END -->

当前 graph revision `shaco-v1-slice-2-step3-cd5ef81`；manifest SHA256 `d861000ea0e1dbe923e9f5603f8da2865d3c62f22c0284e99e86411b428604ba`；bootstrap SHA256 `4e5e67c4dd9f6c19c7470f5a4c97074fd9cf08eb89734e27111a2d80bc8dbe57`；application SHA256 `8450a5ddf4a08a9a83e31cb9db6445dfac5460ddfb698fe36af06d605a6448d2`。

```text
CURRENT_COMPOSITION_AUTHORITY = REVIEW026B_CORRECTIVE_FINAL_IDENTITY_FOR_CURRENT_PRE_UI_CORRECTIVE_SOURCE
CURRENT_IDENTITY_SUPERSEDED_THIS_ROUND = NO
COMPOSITION_GENERATION_THIS_ROUND = NOT_RUN
```

只有未来 UI implementation 真正修改 source 后，才在后续 current governance 标记 `CURRENT_IDENTITY = HISTORICAL_SUPERSEDED_BY_FULL_SHACO_PRESENTATION_SOURCE_CHANGE`。保留原 identity/Evidence 字节，不现在修改其 `FROZEN` state。未来顺序固定：final UI source freeze → Controlled Composition Generation → new identity → full regression → Independent Review；回归以后若 source 继续变化，必须重新形成对应 identity 与验证链。不得将旧图/旧 screenshot proof 挪作新 source PASS。

## 19. Corrective relationship and review entry

被关联的历史 authority 为 [Frozen Step3 Contract](V1-SLICE-2-STEP3-OUTER-SHELL-NATIVE-INTERACTION-CONTRACT-GATE.md) 与 [旧 Owner Freeze Decision](../04-development-records/V1-SLICE-2-STEP3-CONTRACT-GATE-FREEZE-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md)。原文全部保留，不原地改写、不删除、不在本轮添加 Superseded 标签。

| Historical clause | Future corrective replacement after Independent Review PASS + Architecture Owner Freeze |
|---|---|
| Step3 §4 composition / Shell integration 依赖 AppWebEntry / Harness frame 的 UI ownership | 本候选 §2–3：ShacoBootstrap + ShacoRoot，公开 lower-level Loader，单 Context/root |
| Harness Main Workspace / conversation presentation ownership | 本候选 §2、§6–8、§15：Shaco 直接呈现，Harness business truth 保留 |
| Step3 §9 `HARNESS_MAIN_WORKSPACE_APPROVAL_UI` / `HARNESS_MAIN_WORKSPACE_QUESTION_UI` | 本候选 §9–10：Shaco 是 V1 primary interaction UI |
| `OUTER_APPROVAL_SETTLEMENT = FORBIDDEN` / `OUTER_QUESTION_SETTLEMENT = FORBIDDEN` 的 visible answer UI 禁令 | 允许 Shaco 调用已有真实 pending 对象公开 answer；独立 pending model / second settlement truth / eventId 依赖继续禁止 |
| Step3 S3G16 的 Harness-visible-UI proof 口径 | 本候选 UI-G10/UI-G11/UI-G15 与 §14 新 Shaco Real Host proof；旧业务历史保持 |

Supersession 仅限上述冲突语义，绝不把历史 R25-01 结论改写为可使用 internal eventId，也不重开 Step1/Step2、改 Agent/Carrier protocol、扩大 Provider authorization。REVIEW-027 的单模板架构基线 PASS 保留；本轮仅新增双模板范围 Delta，下一步为独立 Dual Theme Template Scope Delta Review，与 REVIEW-026C implementation rereview 分开。暂停真正 Full Shaco Implementation 不撤销架构方向/授权，本轮不执行 Review 或追加 Freeze。

```text
REVIEW_027 = PASS
REVIEW_027_THEME_SCOPE = SINGLE_REQUIRED_TEMPLATE_BASELINE
POST_REVIEW_OWNER_THEME_SCOPE_DELTA = BRAUN_PLUS_FAMICOM_REQUIRED
DUAL_TEMPLATE_DELTA_REVIEW_REQUIRED = YES
```

```text
FULL_SHACO_PRESENTATION_CORRECTIVE_CONTRACT = DUAL_TEMPLATE_DELTA_WAITING_INDEPENDENT_REVIEW
CORRECTIVE_CONTRACT_FREEZE = NOT_PERFORMED
CORRECTIVE_CONTRACT_INDEPENDENT_REVIEW = REVIEW_027_PASS_SINGLE_TEMPLATE_BASELINE
FULL_SHACO_PRESENTATION_IMPLEMENTATION_AUTHORIZATION = PAUSED_PENDING_DUAL_TEMPLATE_DELTA_REVIEW
V1_SLICE_2_STEP3 = BLOCKED_PENDING_DUAL_TEMPLATE_DELTA_REVIEW
NEXT_ACTION = INDEPENDENT_REVIEW_V1_DUAL_THEME_TEMPLATE_SCOPE_DELTA
```

## 20. Non-goals, stop conditions and validation boundary

本轮禁止 UI implementation、React component creation、Product bootstrap 修改、Harness 源码修改/baseline change/rebaseline、Composition generation、Runtime、Build/Test/Smoke、Provider、Packaging、V1.1/V1.2 future UI、Stage、Commit、Push。`conversation.hero.chrome`、Harness presentation public extension、Harness rebaseline 方向已被 Owner 提供的新 Audit 结论 supersede，不作为当前方案。

若关键 public API 可行性结论无法由当前源码支持、Option B 需要 private runtime API、必须修改 Frozen Harness/rebaseline、需要第二 truth、Agent/Carrier protocol change、Provider、Packaging、改变最终 V1 UI 方向，或 License/Notice 明确禁止拟复用方式且无现成合规路径：立即停止并返回 `ARCHITECTURE_OWNER_REASSESS_REQUIRED`，不得自行扩大 scope。

只执行 documentation-safe validation：git status、git diff --check、UTF-8 strict decode、BOM、疑似乱码、Markdown local links、image existence/dimensions/SHA256、Document Map consistency、current authority uniqueness、protected source/evidence/generated files 与 Frozen Harness hash comparison。详细本轮检查记录写入 [Development Log](../04-development-records/DEVELOPMENT-LOG.md) 的 current persistence entry。

| Execution | This round |
|---|---|
| build / typecheck / unit | NOT RUN |
| Electron / Worker / smoke | NOT RUN |
| Provider / Packaging | NOT RUN |
| Composition generation / REVIEW-026C | NOT RUN |
| UI-G01–UI-G18 / visual state matrix | REQUIRED / NOT_RUN |
| Stage / Commit / Push | NO |

## Appendix A. Local public surface and compliance audit anchors

下表只用于定位 Frozen HEAD 的源码与 package metadata；所有路径都是审计引用，绝不是 Product Runtime import 白名单。字节与 SHA256 是本轮只读扫描所得。公开导出事实必须同时核对 `package.json` 与所列 entry/type 源文件，不能仅凭函数存在判断为 public。

<!-- SOURCE_ANCHORS_START -->
| Audit purpose / local file | Bytes | SHA256 |
|---|---|---|
| [Bootstrap exports: packages/client/web/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/web/package.json) | 1615 | `bb064b3e03c416304a9c1d529added80fd51ea46673500145a8f92a5f8db69c8` |
| [Bootstrap public entry: packages/client/web/src/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/web/src/index.ts) | 521 | `d9ea9554d6a2e141decf619e09d341220fde4f1917b1d5e245c0fdf33c422579` |
| [Platform singleton table: packages/client/web/src/seed.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/web/src/seed.ts) | 1695 | `30deb2ff829edd411fecff00ee6e613ab5b0c5e4474e8e8aa470613613ac6b30` |
| [Existing bootstrap reference; no runtime import: packages/client/web/src/boot.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/web/src/boot.ts) | 6633 | `52ccdd98d949b6384f0dd1e532e29a391195d63c3ff53cb128648f7aa0a87a51` |
| [Module package exports: packages/client/modules/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/modules/package.json) | 1807 | `bc023aadf4ef1df6e65c9ee0c1d6e5287c2d32dd9541174e387a352a0aa92101` |
| [Public node facade generation: packages/client/modules/src/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/modules/src/index.ts) | 43399 | `f0063899adb5833126dbef99e5b55a4a3de08b19888458a19e8f6cf2b95b4d06` |
| [Public Client entry: packages/client/modules/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/modules/src/client/index.ts) | 2691 | `0030d43af1ce37714f3be6f015b866f3b8f827a63ad066a7e4a16f84cde3bcf7` |
| [Facade and Client loader types: packages/client/modules/src/client/manifest.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/modules/src/client/manifest.ts) | 17537 | `454222ab224e856b23c640d545aaf4e19f8dcc8ea531eb2944063fbe2f728a4c` |
| [Cordis exports: vendor/cordis/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/vendor/cordis/package.json) | 1237 | `4c9ed665b821f7549cb540f456ce1174b162c3ee4e0711f9526abd266246ecbb` |
| [Cordis entry: vendor/cordis/src/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/vendor/cordis/src/index.ts) | 679 | `c2232f082c763488225eafcd33530640ad26af0c7d6ea871a4f7e8ebf0eb3704` |
| [FiberState/lifecycle: vendor/cordis/src/fiber.ts](../../../Shaco-Forge-Upstream/deepseek-harness/vendor/cordis/src/fiber.ts) | 24981 | `750555b47603f88e7ef7a05d1a8d629b355c176a1185af411aac6e3e1e2b7ba3` |
| [Loader exports: vendor/loader/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/vendor/loader/package.json) | 1022 | `40cf4a563afabae89b14199e4c985ce4c07df9202962c5f4b714a9135e126c29` |
| [Public Loader.internal: vendor/loader/src/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/vendor/loader/src/index.ts) | 6842 | `d535dce0a13e8cbfa39d79722ada8c65606ff207d3ee6946ae11586f378cefd8` |
| [Loader create/await/entries: vendor/loader/src/config/tree.ts](../../../Shaco-Forge-Upstream/deepseek-harness/vendor/loader/src/config/tree.ts) | 5508 | `5be2d9c3f2581f6c714380216f6ffd8171a0cbe0405adbaf13c9563ffae0ada9` |
| [Renderer exports: packages/client/ui-renderer/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-renderer/package.json) | 1756 | `41a111008f5aae3727d5d9ba65918854f4e0d0ce58eed0caa8435398fe99524f` |
| [Mount public face: packages/client/ui-renderer/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-renderer/src/client/index.ts) | 3263 | `11f4006464492b0e17cf49caafc9c3b97860a6fc98636dd975f81e6a6297bf53` |
| [Slot registry root: packages/client/ui-renderer/src/client/registry.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-renderer/src/client/registry.ts) | 26250 | `46442dfe72c837296f9f827c681dfba55ebfe3549a3895975e945511a1fe9c25` |
| [Slot exports: packages/client/ui-slots/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-slots/package.json) | 1255 | `0ff1b2cd4a198d9d052c06efaae3a1e412642d8b8c299d85f02c419d354d2b4d` |
| [Root shadowing contract: packages/client/ui-slots/src/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-slots/src/index.ts) | 51251 | `4e0a17e6fab4f136cc979b1ae297d53fff114d923f7c3f1b58e0b352b23db07b` |
| [Retained AppFrame row: packages/client/ui-layout/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-layout/src/client/index.ts) | 7699 | `2693e5f3f267c2316cbb2005d6df0fbb1309c77de8a4d9ad5bdb10d88fa18909` |
| [Session public exports: packages/api/session-controller/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/session-controller/package.json) | 5083 | `69c60c440220b2d981bc0c68e5b5a5608cdbcb139c213078849b6c2167d0e5ef` |
| [Session public entry: packages/api/session-controller/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/session-controller/src/client/index.ts) | 4120 | `8b8627954c8fad31b94ae54384d0486581ef799c05dd5ce0bbc1f55c90ff9a82` |
| [Session prompt/cancel/command: packages/api/session-controller/src/client/contract/session.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/session-controller/src/client/contract/session.ts) | 6469 | `2da35105bd8d4fc4c574490c11048f568065b6927ec467d9e7ff03dfffe2df49` |
| [Sessions binding/create/open: packages/api/session-controller/src/client/contract/sessions.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/session-controller/src/client/contract/sessions.ts) | 5303 | `de6a8992a8e70f07b4b52666c04d431b3aeade3df45cdf617893ee4c88c7bb9c` |
| [Session payload types: packages/api/session-controller/src/types.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/session-controller/src/types.ts) | 18577 | `7a6a1fe67ce27495a1c928d2a552357b49d11545bc9e53616213ec943b252c4b` |
| [Workspace public entry: packages/api/workspace-controller/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/workspace-controller/src/client/index.ts) | 4630 | `c79e13e401a1418883ecb7b8695149c6c9beccfe8281ed5ce3aab6138565a42c` |
| [Workspace UI public entry: packages/client/ui-workspace/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-workspace/src/client/index.ts) | 7626 | `d540737593cbae31ee73166acebb97b1c3c45df3c561e55d6aa9d7f2c053775a` |
| [Blank Session reuse: packages/client/ui-workspace/src/client/navigation.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-workspace/src/client/navigation.ts) | 8625 | `77907642f7f59358c9e365a8a7ddd320227144afa3c353e43de53a808915700d` |
| [Conversation public exports: packages/client/ui-conversation/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-conversation/package.json) | 4908 | `7c5e9f7be84c9385cd2722333c11bff6b04286eebeda305f282c7d364ad6df09` |
| [Conversation public entry: packages/client/ui-conversation/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-conversation/src/client/index.ts) | 4264 | `5dd6aaa66f2ae5f227fc8e5f4dbc5ddbe6f0a72e9c84f9c15f3e3cd4bf001e80` |
| [Chat assembly binding: packages/client/ui-conversation/src/client/conversation/assembly.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-conversation/src/client/conversation/assembly.ts) | 10127 | `30e50a9d47a84c869a17bff589c0eecba56a57b603780a0f2afa55fcbe0e93c3` |
| [Chat public exports: packages/client/ui-chat/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-chat/package.json) | 4560 | `dd41e26111d37439a658e03eb637a21c68dc859f2b89f23fcc8758ec5ef1eb17` |
| [Chat public entry: packages/client/ui-chat/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-chat/src/client/index.ts) | 3184 | `1b713a0979fea076df905595135bbf65598f5a3a6bb3865043c7c6b87b2acaab` |
| [ChatSnapshot: packages/client/ui-chat/src/client/contract/snapshot.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-chat/src/client/contract/snapshot.ts) | 3872 | `6176d53c4ca99044af84810640adc05102cd50dfaf0cf67c7e717b3b61e96dea` |
| [ChatNode/Tool contract: packages/client/ui-chat/src/client/contract/chat-nodes.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-chat/src/client/contract/chat-nodes.ts) | 4707 | `3a302c5b370e9173aa42c29cfeda96a80a078c5d105a6e3e4e2fae45d3637af5` |
| [UiSession pending source: packages/client/ui-session/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-session/src/client/index.ts) | 19209 | `17a924acc9cd309c8775de57fd08441dd2b3131cffda7265617edb8a8f1733eb` |
| [Approval type-only public face and existing consumer: packages/client/ui-approval/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-approval/src/client/index.ts) | 3653 | `4da0c33a5d114dcd919d45751a48a4829b65bd101ace118f6b2094972755ad99` |
| [Approval answer contract: packages/client/ui-approval/src/client/contract/slots.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-approval/src/client/contract/slots.ts) | 5740 | `c966b4d845637b0b5efd5c94a115b9aa7387502b2f54e25c77fb29abef8708d1` |
| [Question type-only public face and existing consumer: packages/client/ui-user-questions/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-user-questions/src/client/index.ts) | 4683 | `5a05a817e58c03cdd09280c24b9572941c226ed31f4543576dc2291daca36f37` |
| [Question answer contract: packages/client/ui-user-questions/src/client/contract/slots.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-user-questions/src/client/contract/slots.ts) | 8648 | `9dc50b7e08c32b70cc0c1f1fc49cca2c593e61c8a87063e3d3217b4daaf7492e` |
| [Question payload types: packages/interaction/user-questions/src/types.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/interaction/user-questions/src/types.ts) | 3429 | `bd684edea132c740761e88d1b73fcb6f131f0e1548f358821581cf9ef978652d` |
| [Model public entry: packages/client/ui-model-selection/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-model-selection/src/client/index.ts) | 8125 | `4a2b4578da4dfaaec61aa652a9b75d5cb6ee8fa5f37e2b63d7813195b89dcf7d` |
| [Model directories service: packages/client/ui-model-selection/src/client/service.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-model-selection/src/client/service.ts) | 5005 | `a885d8a1ea573feeddbf7f459148fc824275c3011a4c2795ec6b03c630b7b16f` |
| [Model directory selection: packages/client/ui-model-selection/src/client/directory.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-model-selection/src/client/directory.ts) | 6971 | `f1bef6ba71c46ea5305acaa336d1d440268c10c87af6386088c6108fc720db37` |
| [Host catalog read: packages/client/ui-model-selection/src/client/catalog.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-model-selection/src/client/catalog.ts) | 3133 | `884f421af11d705a314cce9746b90a1aaa7ec3710c1f6db51fc43f1ab27781d5` |
| [Permission public export: packages/interaction/permission-presets/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/interaction/permission-presets/package.json) | 2384 | `4cbcd68a86fcadaedadc7d398be22b04ab892bf5c54807369514b1b78c54b0d3` |
| [Permission pure Client entry: packages/interaction/permission-presets/src/client.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/interaction/permission-presets/src/client.ts) | 388 | `3e1843665d2feccfb29dbff70cbf2c24f9ed6ae2ed8eb0b3edba3a1f8ebfbb3c` |
| [Permission projection: packages/interaction/permission-presets/src/types.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/interaction/permission-presets/src/types.ts) | 1711 | `4766dd2d2d052f55f0f8993c7b15ed86ce32f93dc76a0d606035db4dc1464301` |
| [Permission command reference: packages/client/ui-permission-presets/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-permission-presets/src/client/index.ts) | 7479 | `a360713e458244d376979b9b0f273e710e91140726105ba4ffb69aebdefcb448` |
| [Settings public face: packages/client/ui-settings/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-settings/src/client/index.ts) | 3903 | `2ccf21a45caaf3e59684085a512ff078c970a8e664b0c45a57b1d095bc238551` |
| [Remote public namespaces: packages/api/remotes/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/remotes/src/client/index.ts) | 8292 | `767aa8077e1d4e63a68e950031ea823d99983a7215740876ec53a8e1722eac9a` |
| [Connection public transport: packages/client/connection/src/client/index.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/connection/src/client/index.ts) | 8552 | `ca7a4b1080970cea3c7f7565b218d86717b708cd7d74a1dbd02516f7eb29e658` |
| [Root license: LICENSE](../../../Shaco-Forge-Upstream/deepseek-harness/LICENSE) | 1065 | `ebb4f09972aee8608be255debaf78451a68e95c290f55c240dec2ecfa16ea6be` |
| [Third-party notices: THIRD_PARTY_NOTICES.md](../../../Shaco-Forge-Upstream/deepseek-harness/THIRD_PARTY_NOTICES.md) | 17548 | `b0245871962b81ef8c6f4ade35b15c3effd0e72341fdf4472ce4982eccc01da7` |
| [Root metadata: package.json](../../../Shaco-Forge-Upstream/deepseek-harness/package.json) | 11435 | `552fe07638754047fb3dfd29d61dde835c2a5a618da8b766a711bc15eaa334e2` |
| [store metadata: packages/client/store/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/store/package.json) | 1176 | `c15a50055b4b28f1038f47b18199e3cf838cd70e4d5455c72e76582fda456a15` |
| [connection metadata: packages/client/connection/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/connection/package.json) | 2418 | `5f66b5befdffb55434bdaa618d7f42c88ca1b2eea1628c30232aa0d3bff01065` |
| [ui-session metadata: packages/client/ui-session/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-session/package.json) | 1972 | `c82e2a74ecbf5581bb895ad7b34afbd2e30b6c24f3744c0d2caeb98db2922ce3` |
| [ui-approval metadata: packages/client/ui-approval/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-approval/package.json) | 2807 | `7af7173e34750618b208938757c025c352768f0ecf3a029d35401848d0a142e8` |
| [ui-user-questions metadata: packages/client/ui-user-questions/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-user-questions/package.json) | 3145 | `66f6b1c4594c9117ed0772f3785e8821fbf9bfa2b26cd114754591e835d4e2a9` |
| [ui-model-selection metadata: packages/client/ui-model-selection/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-model-selection/package.json) | 3062 | `8f64fccc1e8873e720e153d114d4cb97ceb3d8d142c0890786ec9ed211ce9f62` |
| [ui-permission-presets metadata: packages/client/ui-permission-presets/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-permission-presets/package.json) | 3017 | `46baec14ab5e901a260c8a9be68be6bee33fcd6f285e4490271cec7bbf98b72a` |
| [ui-settings metadata: packages/client/ui-settings/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-settings/package.json) | 2120 | `ec8030826705fbb50c47cf3c99b9565617026850ed5f094b816e9c2403b71338` |
| [ui-workspace metadata: packages/client/ui-workspace/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-workspace/package.json) | 3538 | `7b651ada5c67cea1b7b7233360316b7922bae86e7f0b7e032c571e31d2be9fac` |
| [ui-tool metadata: packages/client/ui-tool/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-tool/package.json) | 2944 | `316a22a45888b922f2f08edb1150c1d5ccf039f9190cb719d3e65f53f0968919` |
| [ui-primitives metadata: packages/client/ui-primitives/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-primitives/package.json) | 1935 | `5c1e58285221d84615380183a9356189b53e157185bd078b202ebe0b6d9f5424` |
| [Public package metadata: packages/api/workspace-controller/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/workspace-controller/package.json) | 2883 | `f7c2ca7bc98b18c6cac820ef8c2b329ef0602772c2bd085572da8088e1dc6aca` |
| [Public package metadata: packages/api/remotes/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/api/remotes/package.json) | 3718 | `b5e31f6a4dc9290fb09e6030bc4e25ef7240cddbb872a4854c2e6916c1e18b3c` |
| [Public package metadata: packages/interaction/user-questions/package.json](../../../Shaco-Forge-Upstream/deepseek-harness/packages/interaction/user-questions/package.json) | 1515 | `5143734f5104be19387b197bd12b993e5886752beb626d60bfa9497d3d55c7ad` |
| [Headless Conversation service activation: packages/client/ui-conversation/src/client/apply.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-conversation/src/client/apply.ts) | 13548 | `36eaa804f19a2b434890462b516dbe5e4fc13d3cc3b659cea0c74a424f13d888` |
| [Headless Chat target activation: packages/client/ui-chat/src/client/apply.ts](../../../Shaco-Forge-Upstream/deepseek-harness/packages/client/ui-chat/src/client/apply.ts) | 7243 | `303cab9f91db4bd1c6fe999f0bf062040b458de67abf48bcd92871f622e618d5` |
<!-- SOURCE_ANCHORS_END -->
