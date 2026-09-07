# V1-SLICE-1C Embedded Real Harness User-Loop Contract

| Field | Value |
|---|---|
| Contract Status | `ARCHITECTURE_CONTRACT_PERSISTED` |
| Implementation | `IMPLEMENTATION_NOT_STARTED` |
| Review State | `WAITING_TARGETED_DELTA_REVIEW` |
| Date | `2026-09-08` |
| Scope | `EMBEDDED_REAL_HARNESS_USER_LOOP` |

本文忠实持久化 Architecture Owner 已决定并通过 Independent Architecture
Challenge 的 V1-SLICE-1C Contract。本文不执行实现，不声称任何 Implementation
Gate 已 PASS，也不授权在 Targeted Delta Review 前开始实现。

```text
ARCHITECTURE_CONTRACT_PERSISTED
IMPLEMENTATION_NOT_STARTED
WAITING_TARGETED_DELTA_REVIEW
```

## 1. Contract Identity

```text
V1_SLICE_1C_NAME = EMBEDDED_REAL_HARNESS_USER_LOOP
V1_SLICE_1C_PRIMARY_USER_LOOP_OWNER = APPWEBENTRY
V1_SLICE_1C_REAL_PROVIDER = HARNESS_OWNED
V1_SLICE_1C_TRANSPORT = FROZEN_V1_SLICE_1B_AUTHENTICATED_CARRIER
V1_SLICE_1C_ACTIVE_AGENT_TURNS_FOR_GATE = 1

SHACO_SHELL_MODE = PASSIVE_TRUTHFUL_WRAPPER
TOOL_PROOF_MAX_ATTEMPTS = 2
MAX_JSON_FRAME = 262144
APPROVAL_GATE = CONDITIONAL_IN_1C
QUESTION_GATE = CONDITIONAL_IN_1C
SESSION_CANCEL_GATE = DEFER_TO_LATER_SLICE1_GATE
```

Source basis：
[Frozen Harness User-Loop Source Confirmation](../04-development-records/V1-SLICE-1C-FROZEN-HARNESS-USER-LOOP-SOURCE-CONFIRMATION.md)。

## 2. Goal

V1-SLICE-1C 必须通过同一个真实 mounted `AppWebEntry`、真实 authenticated 1B
Carrier、真实 Harness-owned Provider/model/credential 和真实 Harness Agent runtime，
完成并观察：

```text
real Workspace
  -> real Session
  -> real Prompt
  -> real Assistant Streaming
  -> real Tool Call
  -> real Tool Result
  -> real final Assistant response
```

不得以 mock、fixture、fake RPC、fake Provider、fake Tool result 或第二 Agent
protocol 满足 Gate。

## 3. Mandatory Functional Reuse

1C 必须复用 `AppWebEntry` 现有 Workspace UI、Session UI、Conversation history、
Composer、Prompt、Model Selector、Streaming、Tool rendering、Approval UI、Question
UI、Permission UI、Provider Settings、Credential Settings 以及
loading/error/empty states。

Shaco 禁止创建第二份 Workspace truth、Session truth、Prompt protocol、Provider
registry、Model registry 或 Credential store。Workspace/Session/Provider/Model/
Credential/Permission 的业务 ownership 保持 Harness-owned。

## 4. Workspace and Session Contract

- Workspace registry/persistence 与 `workspace/follow` projection 由 Harness 拥有；
  Workspace path 是 Host canonical directory path。
- 真实 Workspace 通过 AppWebEntry/Harness 公开 seam 创建、选择与呈现；不得创建
  Shaco-owned duplicate registry。
- Session list/create/select 与 current selection 由 Harness Client Session service
  驱动；Workspace membership 使用 Workspace `sessionIds`。
- Session `cwd`、create-time `agentPreset`、model selection 与 permission initial
  state 均保留在 Harness Session/projection。

## 5. Prompt and Semantic Streaming Contract

Prompt 必须沿以下真实链路：

```text
Conversation Composer
  -> ConversationService.sendSession()
  -> Client Session.prompt()
  -> session/prompt
  -> authenticated Shaco Carrier
  -> Harness Gateway
  -> session-controller
  -> Agent.followup / Agent.steer
  -> Agent inbox
  -> turn/start
  -> model step
```

Payload 保持 `requestId`、`sessionId`、`mode = queue | steer`、
`content = PromptContentPart[]` 与 optional `clientTimeZone`。`{accepted:true}` 仅为
Agent inbox admission，不得解释为 generation 完成。

`session/follow` 是 transcript/content semantic stream；`$events` 是 Gateway
interaction plane；`workspace/follow` 是 Workspace registry；`session/control` 是
Session collection/control plane；transport `openStream` 只是 physical Carrier
abstraction。不得混淆或合并这些 ownership。

Mandatory happy-path observation：`turn/start`、continuous `assistant/chunk`、
`tool/call`、`tool/result`、`assistant/message` 与 `turn/end`，并保留正常
`step/start`/`step/end` 语义。

## 6. Read-Only Tool Proof Gate

实现期创建一个受控临时 Workspace：

```text
%TEMP%\shaco-forge-v1-slice-1c-<run-id>
```

其中只包含 `proof.txt`，内容是 cryptographically/random generated marker。
Prompt 必须明确要求：

```text
use the read-only read tool
read proof.txt
return exact marker
do not modify files
do not use write/edit
```

必须通过同一个 mounted AppWebEntry 观察：

```text
session/prompt accepted
turn/start
assistant/chunk
tool/call
tool/result
tool result success
assistant/message
turn/end
```

最终 Assistant marker 必须与 `proof.txt` marker 进行 hash matching。Prompt、marker
与 Tool result 必须主动保持远小于 `MAX_JSON_FRAME`。

### 6.1 Attempt policy

`TOOL_PROOF_MAX_ATTEMPTS = 2`。Attempt #1 使用真实新 Session、真实 Provider 与
真实 Prompt。若 Provider/Carrier/stream 健康，但模型未选择 read tool，则保留第一
次失败为 `MODEL_TOOL_SELECTION_NOT_OBSERVED`，允许一次 bounded Retry。

Retry 必须使用新的真实 Session、同一 controlled Workspace、相同 semantic Prompt
contract，以及新的 request/session identity。第二次仍未观察到真实 Tool 时：

```text
TOOL_PROOF_RESULT = INCONCLUSIVE_MODEL_BEHAVIOR
```

此时必须交由 Architecture Owner / Human 决定；不得 fake PASS、注入 tool event、
直接调用 Host Agent、使用 test-only Tool result 或绕过 AppWebEntry。

### 6.2 Workspace integrity

Gate 为 `READ_ONLY_TOOL_ONLY`。执行前后必须分别 snapshot Workspace file list 与
`proof.txt` bytes/hash。要求 `proof.txt` unchanged、无新增/删除 user file，且没有
`write/edit` Tool event。若真实 Agent 执行了 write/edit，Gate 必须 FAIL 并保留
exact evidence。

## 7. Approval, Question and Cancel

```text
APPROVAL_GATE = CONDITIONAL_IN_1C
QUESTION_GATE = CONDITIONAL_IN_1C
SESSION_CANCEL_GATE = DEFER_TO_LATER_SLICE1_GATE
```

现有 AppWebEntry settlement support 必须保持可用。若 controlled runtime 自然触发
Approval 或 Question，必须观察真实 `$events` waterfall → AppWebEntry interaction UI
→ exactly one `$events/result` settlement → original await resumes，禁止 duplicate
settlement 或 replay。

不得为制造 Evidence 故意请求危险权限升级。若没有自然触发 Approval/Question，
不得仅因此判定 1C FAIL。`session/cancel` source seam 必须保持不被破坏，但不属于
1C happy-path mandatory Gate。

## 8. Provider, Credential and Permission Gate

Harness 独占 Provider、Model、API Endpoint、Relay 与 Credential。不得创建 Shaco
credential file、API key field、Provider registry、API-key env injection，不得把
credential 写入 Prompt、Evidence 或 logs。

真实 Provider 调用前只允许判断 Harness 是否存在 usable configured Provider/model/
credential state，不得读取或输出 secret value。失败分类：

| Condition | Required classification |
|---|---|
| Credential 缺失 | `HUMAN_REQUIRED_PROVIDER_CREDENTIAL` |
| Provider 配置错误 | `HARNESS_PROVIDER_CONFIGURATION_BLOCKED` |
| timeout / DNS / TLS / 429 / 5xx / Provider auth failure | `HARNESS_PROVIDER_OR_NETWORK_FAILURE` |

上述分类成立的前提是 Shaco Carrier、Worker 与 Renderer 保持健康；它们不得自动被
归类为 `SHACO_IMPLEMENTATION_FAILURE`，并必须通过真实 Harness error UI/stream
truthfully surfaced，不能改写成 fake assistant success。

默认 Permission 保持 `workspace-write + approval ask`；`danger-full-access` 保持
`approval never`。Permission 属于 Harness Session projection，1C 不重写模型。

## 9. Product Failure Classification

以下属于 Shaco Product Failure：Carrier failure、Renderer crash、Worker lifecycle
bug、Host bridge corruption、framing/admission failure、stream item loss、tool/result
transport loss、fake connected state、secret leak、second Client context，或 Evidence
instrumentation 改变业务执行。

Harness-domain Provider/network failure 必须与这些 Product Failure 明确分离。

## 10. Passive Truthful Wrapper and UI Allocation

```text
SHACO_SHELL_MODE = PASSIVE_TRUTHFUL_WRAPPER
V1_SLICE_1C_PRIMARY_USER_LOOP_OWNER = APPWEBENTRY
V1_SLICE_1C_EXTERNAL_APPWEBENTRY_CONTROL = PUBLIC_SEAM_NOT_FOUND
V1_SLICE_1C_PROJECT_SESSION_NAVIGATION = DELEGATED_TO_APPWEBENTRY
```

这是 1C allocation，不是最终 V1 Shell architecture replacement。由于 external
control public seam 不存在，1C 不实现外层 Sidebar 对 mounted AppWebEntry 的
Workspace/Session navigation control，且不得使用 private `ctx`。

Outer Shell 不得把不存在的 control 能力表现成已 wiring；不得显示可能与真实
Harness 状态冲突的假 No Project/No Session；未实现的 `+ New Chat`、Project
Directory 与 Settings 必须保持 disabled/delegated/truthful。Connection、Worker 与
Carrier 状态必须真实。

```text
FINAL_V1_SLICE_1_SHACO_SIDEBAR_REQUIREMENT = STILL_OPEN
NATIVE_PICKER_REQUIRED_FOR_EMBEDDED_REAL_USER_LOOP = NO
NATIVE_PICKER_REMOVED_FROM_FINAL_V1_SLICE_1_SCOPE = NO
```

passive wrapper 不永久删除 Project Directory、Session projection、Native Picker
或 Settings integration。它们仅从 1C 延后至后续 bounded Slice-1 integration gate；
该内部 Step `NOT_YET_FROZEN`，本文不命名 1D/1E Contract。

## 11. Carrier Frame Cap

```text
MAX_JSON_FRAME = 262144
```

1C 不修改 1B constant，不发明 chunk protocol，不 silent raise。若真实 1C loop
观察到合法单帧需要超过 262144 bytes，必须 STOP 并返回：

```text
CARRIER_CONTRACT_AMENDMENT_REQUIRED
```

## 12. Full-Loop Concurrency and Lifecycle

1C Gate 最多一个 active Agent Turn。同一 mounted AppWebEntry 可同时保持 `$events`、
`workspace/follow`、`session/control`、`session/follow` 等正常 background streams。

必须复用 1B：

```text
STREAM_INITIAL_CREDITS = 4
STREAM_QUEUE_CAPACITY = 16
RENDERER_PULLS_IN_FLIGHT_PER_STREAM = 1
CANCELLATION_SOURCES = ABORT_SIGNAL + ITERATOR_RETURN + CARRIER_FAILURE
```

Gate 必须验证 continuous Assistant streaming 与正常 Client background streams
共存，且无 queue overflow、unbounded growth、orphan stream、lost terminal 或 stream
credit violation。不得扩大为 Multi-Agent、concurrent mutating prompts 或 multi-turn
concurrency benchmark。

## 13. Evidence Single-Context Rule

```text
SECOND_APPWEBENTRY = FORBIDDEN
SECOND_CLIENT_CONNECTION = FORBIDDEN
SECOND_REMOTE_CONTEXT = FORBIDDEN
DIRECT_TEST_SESSION_PROMPT = FORBIDDEN
EVIDENCE_MODE = OBSERVATION_ONLY
```

Evidence 只允许观察同一个 mounted AppWebEntry → Preload → Main → authenticated
Carrier → Worker → Harness Host。不得为 Evidence 创建第二 Client/Remote 来调用
`workspace/*`、`session/*` 或 `$events`，也不得以 test harness direct RPC 满足真实
AppWebEntry Product Gate。Instrumentation 不得改变 Agent 行为。

## 14. In Scope

- real AppWebEntry user loop；
- real Harness Provider/model readiness 与 credential readiness；
- real Workspace、Session、Prompt；
- `session/follow` semantic streaming；
- real read Tool Call、real Tool Result 与 final Assistant response；
- real model selector ownership 与 default Permission ownership；
- Approval/Question support（若自然触发）；
- truthful passive outer Shell；
- same-context Runtime Evidence；
- bounded Provider execution；
- continuous stream/background stream coexistence。

## 15. Out of Scope

- external Shaco Sidebar controlling AppWebEntry navigation；
- Shaco-owned duplicate Workspace/Session state 或第二 Prompt protocol；
- Provider registry、Model registry、credential store；
- private AppWebEntry `ctx` 或 `packages/**/src` production deep import；
- Frozen Harness modification 或 Shaco native picker replacement；
- mandatory Agent cancel gate；
- reconnect/recovery、packaging、Automation、Multi-Agent；
- forced dangerous Approval；
- final V1-SLICE-1 closure。

## 16. Stop Conditions

实现以后若需要以下任一条件，必须停止，不得 workaround：

1. Frozen Harness modification；
2. `packages/**/src` production deep import；
3. private AppWebEntry `ctx`；
4. second AppWebEntry；
5. second Client connection/Remote context；
6. second Workspace truth；
7. second Session truth；
8. second Prompt/Agent RPC；
9. second Provider truth；
10. second credential store；
11. TCP / stock HTTP / WebSocket fallback；
12. bypass 1B authenticated Carrier；
13. fake Provider；
14. fake Agent；
15. fake Tool Result；
16. direct test Remote satisfying Product Gate；
17. external Shell private navigation seam；
18. real valid frame greater than 262144 bytes；
19. Evidence instrumentation 改变 Agent 行为；
20. dirty Frozen Harness。

## 17. Finding Carry-Forward

```text
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
V1_SLICE_1B_NF_6 = OPEN_NON_BLOCKING
```

1C 不静默关闭上述 Findings。

## 18. Completion State of This Persistence

```text
V1_SLICE_1C = CONTRACT_PERSISTED_WAITING_TARGETED_DELTA_REVIEW
V1_SLICE_1C_IMPLEMENTATION = NOT_STARTED
V1_SLICE_1C_OWNER_IMPLEMENTATION_AUTHORITY = NO
V1_SLICE_1 = IN_PROGRESS
V1_CURRENT_NEXT_ACTION = TARGETED_DELTA_REVIEW_V1_SLICE_1C_CONTRACT
```

只有后续 Targeted Delta Review 与明确 Owner authority 才能改变实现授权。本次不
生成 Implementation Prompt，不运行 Product/Harness Runtime，不 Commit、Push 或
Stage。
