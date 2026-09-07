# V1-SLICE-1C Frozen Harness User-Loop Source Confirmation

| Field | Value |
|---|---|
| Document Role | `READ_ONLY_SOURCE_CONFIRMATION` |
| Status | `CONFIRMED` |
| Date | `2026-09-08` |
| Product Implementation | `NOT_STARTED_BY_THIS_DOCUMENT` |
| Architecture Contract | `NO` |
| Implementation Result | `NO` |

本文只持久化对 Frozen Harness 真实源码与公开边界的只读确认。本文不是
Architecture Contract，不授权 V1-SLICE-1C 实现，也不声称执行了 Provider、Prompt、
Tool、Workspace 或 Session mutation。

```text
READ_ONLY_SOURCE_CONFIRMATION = CONFIRMED
HARNESS_APP_USER_LOOP_PRESENT = YES
SHACO_SECOND_PROVIDER_TRUTH_REQUIRED = NO
SHACO_SECOND_CREDENTIAL_STORE_REQUIRED = NO
NATIVE_PICKER_REQUIRED_FOR_EMBEDDED_REAL_USER_LOOP = NO
NATIVE_PICKER_REMOVED_FROM_FINAL_V1_SLICE_1_SCOPE = NO
EXTERNAL_SHELL_APPWEBENTRY_CONTROL_SEAM = PRODUCTION_PUBLIC_SEAM_NOT_FOUND
PRODUCTION_PUBLIC_SEAM_NOT_FOUND
```

## 1. Confirmed Baseline

| Boundary | Confirmed identity / state |
|---|---|
| Product root | `D:\Project\Shaco-Forge` |
| Product branch | `master` |
| Product HEAD | `5b68fafd79bafaddf94e9161bcaa1f9facee30c0` |
| Product worktree | `CLEAN` |
| Frozen Harness root | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| Frozen Harness HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Frozen Harness worktree | `CLEAN` |

Frozen Harness 的 `AppWebEntry` 已包含真实用户闭环：Workspace → Session → Prompt
→ Streaming → Tool/Result → Approval/Question。Provider、Model、Credential 与
Permission 均由 Harness 拥有。

## 2. Workspace Source Facts

公开包：

```text
@deepseek-ai/dsh-api-workspace-controller
@deepseek-ai/dsh-client-ui-workspace
```

公开 Remote endpoints：

```text
workspace/follow
workspace/create({path})
workspace/delete
workspace/rename
workspace/insertBefore
workspace/insertSessionBefore
workspace/archiveSession

directoryPicker/pick
directoryPicker/list
directoryPicker/createDirectory
```

- `workspace/follow` 提供完整 baseline 与有序 updates，形成 Workspace registry
  projection。
- Workspace path 是 Host canonical directory path；registry 与 persistence 属于
  Harness。
- `workspace/create({path})` 可以消费真实目录 path；Shaco 不建立第二份 Workspace
  truth。
- `workspace/delete` 只移除 Workspace registration，不删除物理目录或 Sessions。
- `AppWebEntry` 已包含 Workspace UI。

## 3. Session Source Facts

公开包：

```text
@deepseek-ai/dsh-api-session-controller
```

公开 Remote endpoints：

```text
session/list
session/create
session/follow
session/page
session/search
session/prompt
session/cancel
session/rename
session/fork
session/modelCatalog
session/selectModel
session/control
session/updateQueue
```

- `AppWebEntry` 已具有 Session list/create/select。
- current Session selection 属于 Client Session service。
- Workspace membership 由 Workspace `sessionIds` 维护；Session `cwd` 属于 Session。
- `agentPreset` 在 create 时绑定。
- model selection 与 permission initial state 属于 Session projection。
- Shaco 不创建第二份 Session truth。

## 4. Prompt Chain

真实调用链为：

```text
Conversation Composer
  -> ConversationService.sendSession()
  -> Client Session.prompt()
  -> session/prompt
  -> current authenticated Shaco Carrier
  -> Harness Gateway
  -> session-controller
  -> Agent.followup / Agent.steer
  -> Agent inbox
  -> turn/start
  -> model step
```

Prompt payload：

```text
requestId
sessionId
mode = queue | steer
content = PromptContentPart[]
clientTimeZone?
```

`session/prompt` 返回 `{accepted:true}` 只代表请求已进入 Agent inbox，不代表
generation 完成。

## 5. Streaming and Transport Planes

`session/follow` 是 Agent transcript/content semantic stream，包含：

```text
turn/start
turn/end
step/start
step/end
user/message
assistant/chunk
assistant/message
tool/call
tool/result
```

`assistant/chunk` 可以包含 `block-start`、`text-delta`、`reasoning-delta`、
`tool-call-delta`、`block-end`、`usage` 与 `finish`。

各平面必须保持区分：

| Surface | Ownership / meaning |
|---|---|
| `session/follow` | Agent transcript/content semantic stream |
| `$events` | Gateway Remote waterfall / interaction plane |
| `workspace/follow` | Workspace registry |
| `session/control` | Session collection/control plane |
| transport `openStream` | physical Carrier abstraction |

## 6. Tool / Result Source Facts

语义事件为 `tool/call` 与 `tool/result`，可携带 `callId`、`name`、`arguments`、
`content`、`isError`、`error` 与 `meta`。现有 AppWebEntry Tool UI 支持
`bash/pwsh`、`read`、`search/grep/glob`、`write/edit`、web fetch 以及 generic
fallback。V1-SLICE-1C 不重写 Tool renderer。

## 7. Approval and Question Source Facts

Approval：

```text
Agent-scoped Gateway waterfall
  -> $events
  -> AppWebEntry ui-approval
  -> $events/result
  -> original awaiting Tool resumes
```

Question：

```text
Agent-scoped Gateway waterfall
  -> $events
  -> AppWebEntry ui-user-questions
  -> $events/result
  -> original await resumes
```

不存在新的 Shaco approval/answer 或 question/answer business RPC。Approval 与
Question 不创建第二业务协议。

## 8. Provider, Model and Credential Ownership

```text
SHACO_SECOND_PROVIDER_TRUTH_REQUIRED = NO
SHACO_SECOND_CREDENTIAL_STORE_REQUIRED = NO
```

Harness 拥有 Provider、Model、API Endpoint、Relay 与 Credential。配置来源是
`$DSH_HOME/settings.yaml`、`$DSH_HOME/.credentials.yaml`、environment / supported
`.env` sources；Remote surface 为 `settings/*` 与 `credentials/*`。DeepSeek
official 仍是 Harness Provider configuration，不是 Shaco hardcoded routing。

本 Source Confirmation 未读取、记录或持久化任何 credential value。

## 9. Permission Ownership

默认 Permission 是 `workspace-write + approval ask`；`danger-full-access` 对应
`approval never`。Permission 属于 Harness Session projection，V1-SLICE-1C 不重写
Permission model。

## 10. Native Picker Fact

```text
NATIVE_PICKER_REQUIRED_FOR_EMBEDDED_REAL_USER_LOOP = NO
NATIVE_PICKER_REMOVED_FROM_FINAL_V1_SLICE_1_SCOPE = NO
```

Harness directory picker 已有 native/browse abstraction，且
`workspace/create({path})` 是公开 path seam。因此 1C embedded loop 不依赖额外
Shaco picker；这不表示最终 V1-SLICE-1 永久取消 Native Picker 要求。

## 11. External Shell Public Seam Fact

```text
EXTERNAL_SHACO_SHELL_TO_MOUNTED_APPWEBENTRY = PRODUCTION_PUBLIC_SEAM_NOT_FOUND
APPWEBENTRY_PUBLIC_INSTANCE_SURFACE = run() + dispose()
APPWEBENTRY_PRIVATE_CTX_PRODUCTION_USE = FORBIDDEN
```

没有找到供外部 Shaco Shell 使用的 production public seam 来读取 mounted
AppWebEntry 当前 Workspace/Session、命令式 create/select Session、打开 Settings
route，或订阅内部 navigation/current selection。`AppWebEntry` 的 public instance
surface 只有 `run()` 与 `dispose()`；private `ctx` 不得用于 production。

## 12. Confirmation Boundary

本确认只记录 Frozen Harness facts。它没有运行 Product tests、Harness runtime、
Provider、Prompt 或 Tool，没有建立第二 Client/Remote context，也没有修改 Product
或 Frozen Harness。
