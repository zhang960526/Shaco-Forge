# P0-3 — Client ↔ Host Contract Map

Status: `CLOSED / PASS`  
Scope: P0-3 only  
Frozen Harness: `deepseek-ai/deepseek-harness@cd5ef8148158c3a752a658978873241fdf8e2bbc`

## A. Frozen Baseline

| Item | Verified value |
|---|---|
| Repository | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Release | `dsh-v0.1.2-alpha.1` |
| Package version | `0.1.2-alpha.1` |
| `pnpm-lock.yaml` SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| Upstream clean before census | YES |
| Upstream clean after frozen build/tests | YES |
| Baseline changed | NO |

All source paths below are relative to
`D:\Project\Shaco-Forge-Upstream\deepseek-harness` unless stated otherwise.

## B. Source / Discovery Method

Evidence priority was:

1. Frozen source and route registration.
2. Generated `lib/typert.remote-client.d.ts` descriptors.
3. Connection and Gateway implementations.
4. Current tests.
5. Package documentation only as corroboration.

`corepack pnpm run build:lib:host` was run to materialize generated Typert
descriptors. It did not change tracked upstream files. A targeted Vitest run
covered Connection, Gateway, Remote events, cold sessions, journal recovery,
directory picker, approval, questions, export, and module delivery:
18 test files and 364 tests passed.

The obsolete `apiproxy` implementation was not treated as current evidence.

## C. Contract Layer Model

```text
HARNESS_BUSINESS_CONTRACT

Client domain adapters / UI
  ├─ ctx.remote.<namespace>.<method>()       unary and domain streams
  ├─ ctx.remote.$on(event)                  emit / waterfall events
  └─ session journal + control adapters     history and projections
                 │
                 ▼
Client Connection abstraction
  ConnectionHandle { generation, rpc.call, rpc.open? }
                 │
                 ▼
Generated Typert descriptor + Remote protocol
  endpoint = "<namespace>/<method>"
  request/response types + AsyncIterable stream shape
                 │
                 ▼
Typert Gateway
  invoke / stream / $events / $events-result dispatch
                 │
                 ▼
Host controller or Cordis service
```

```text
CURRENT WEB_TRANSPORT_IMPLEMENTATION

Unary                    POST /api/<endpoint> (JSON)
Remote streams/events    WebSocket /api/remote.mux
Exact Fetch              GET|HEAD /api/session.export
Client module bytes      GET|HEAD /plugins/??...&rev=...
Dev module notices       GET /plugins/events (SSE)
Boot                     authenticated index HTML injections
Static assets            WebServer fallback
```

The Typert names, request/response types, session journal semantics, event
names, cancellation intent, and host controller behavior are the business
contract. HTTP methods, URLs, browser cookie exchange, WebSocket frames, SSE,
HTML injection, and script-element loading are current Web transport
implementations. `ConnectionHandle.rpc.call/open`, `__DSH_TRANSPORT__`, and
module `loadBundle` are existing carrier seams; this census does not claim that
they are already the Shaco Desktop carrier.

## D. Unary Remote Surface

### D.1 Common Gateway and authentication behavior

All mounted unary descriptors below use:

- Client entry: `ctx.remote.<namespace>.<method>()`.
- Gateway entry: logical endpoint `<namespace>/<method>`; current Web maps it
  to `POST /api/<namespace>/<method>`.
- Wire envelope:
  `{type:"client-request", rpcId, method, payload:{args}}` and
  `{type:"server-response", rpcId, result:{ok,value}|{ok:false,error}}`.
- Authentication hook: the Connection `/api` prefix runs
  `connection.requestRejection(req)` before Fetch/RPC dispatch. It combines
  Host/Origin trust classification with BrowserAuth cookie authentication.
- Transport assumption: JSON-compatible Typert arguments/results unless noted.
  `AbortSignal` is a local invocation lifetime and is not JSON data.

The generated Client assembly mounts 16 namespaces with 71 unary endpoints.
`session/control`, `session/follow`, and `workspace/follow` are streams and are
listed in section E.

### D.2 Enumerated surface

| Domain | Operation(s) | ClientEntry | RemoteDescriptor | GatewayEntry | HostTarget | RequestShape | ResponseShape | UnaryOrStream | AuthenticationHook | TransportAssumption | Shaco1_0Relevance | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Session lifecycle | `create`, `fork`, `rename`, `cancel` | `sessions` / Client Session adapter | `session/*` | same endpoint names | `SessionController` / command helpers | `SessionCreateRequest`, `SessionForkRequest`, `SessionRenameRequest`, `SessionCancelRequest` | corresponding `*Value` | Unary | common `/api` hook | JSON Remote | CORE_CANDIDATE | `packages/api/session-controller/lib/typert.remote-client.d.ts`; `src/index.ts`; `src/commands.ts` |
| Session discovery | `list`, `search` | Session manager | `session/list`, `session/search` | same | `SessionController` | `SessionListRequest`; `SessionSearchRequest` | `SessionListValue`; `SessionSearchValue` | Unary | common | JSON Remote | CORE_CANDIDATE | same descriptor; `src/index.ts` |
| Session history / metadata | `page`; current session open uses `follow` | Client Session journal | `session/page` | same | `SessionController` + session query/log | `SessionPageRequest` | `SessionPage` | Unary | common | JSON Remote | CORE_CANDIDATE | same descriptor; `src/history.ts` |
| Session prompt | `prompt`, `updateQueue` | Client Session | `session/prompt`, `session/updateQueue` | same | `SessionController` | `SessionPromptRequest`; `SessionUpdateQueueRequest` | `SessionPromptValue`; `SessionUpdateQueueValue` | Unary | common | JSON; prompt content can contain base64 images | CORE_CANDIDATE | same descriptor; `src/commands.ts`; `src/client/sessions/session.ts` |
| Session model | `modelCatalog`, `selectModel` | Session manager/session | `session/modelCatalog`, `session/selectModel` | same | `SessionController` | void; `SessionSelectModelRequest` | `ModelCatalog`; `SessionSelectModelValue` | Unary | common | JSON Remote | CORE_CANDIDATE | same descriptor; `src/index.ts` |
| Session path open | `canOpenWorkspacePath`, `openWorkspacePath` | Session UI | corresponding descriptor | same | `SessionController` | void; `SessionOpenWorkspacePathRequest` | boolean; `SessionOpenWorkspacePathValue` | Unary | common | JSON Remote; host-native side effect | OPTIONAL_CANDIDATE | same descriptor; `src/index.ts` |
| Attachments | `attachment` read | Client Session | `session/attachment` | same | `SessionController` | `SessionAttachmentRequest {sessionId, attachmentId}` | `SessionAttachmentValue {attachment,data(base64)}` | Unary | common | JSON/base64, not binary Fetch | CORE_CANDIDATE | descriptor; `src/commands.ts`; `src/client/sessions/session.ts` |
| File references | `list` | scoped agent Remote | `fileReferences/list` | same | session-controller file-reference provider | `(agentId, query)` | `FileReferenceCandidate[]` | Unary | common | JSON Remote | OPTIONAL_CANDIDATE | session descriptor |
| Skills | `list` | skills Client source | `skills/list` | same | session-controller skills provider | `SkillListRequest` | `SkillListValue` | Unary | common | JSON Remote | OPTIONAL_CANDIDATE | session descriptor |
| Workspace mutation | `create`, `rename`, `delete`, `archiveSession`, `insertBefore`, `insertSessionBefore` | Workspace Client store | `workspace/*` | same | `WorkspaceController` | corresponding workspace request types | `WorkspaceCreateValue`, `WorkspaceValue`, `WorkspaceOrderValue`, archive/delete values | Unary | common | JSON Remote | CORE_CANDIDATE | `packages/api/workspace-controller/lib/typert.remote-client.d.ts`; `src/index.ts` |
| Workspace list/select/open | list comes from `workspace/follow`; selection is Client state; opening a directory creates/selects workspace through above calls | Workspace Client store | no `workspace/list`, `select`, or `open` unary descriptor | N/A | Client + `WorkspaceController` | `CLIENT_LOCAL` selection | local state / follow baseline | CLIENT_LOCAL / Stream | stream uses common hook | follow baseline, not independent unary | CORE_CANDIDATE | workspace descriptor; Client workspace sources |
| Directory picker | `pick`, `list`, `createDirectory` | `uiWorkspace` navigation | `directoryPicker/*` | same | `DirectoryPickerController` | signal; `(path?)`; `(path,name)` | `string|null`; `DirectoryListing`; `string` | Unary | common | JSON Remote; host capability | CORE_CANDIDATE | workspace descriptor; `src/directory-picker.ts` |
| Settings | `describe`, `update`, `replace`, `mutate` | Settings Client | `settings/*` | same | `SettingsController` | void or `(namespace, patch/section/ops, expectedRevision?)` | `SettingsDescribeValue`; `SettingsNamespaceView` | Unary | common | JSON Remote; revision conflict contract | CORE_CANDIDATE | `packages/api/settings-controller/lib/typert.remote-client.d.ts`; `src/index.ts` |
| Settings native open | `openSettingsDocument`, `canOpenAgentPresetDirectory`, `openAgentPresetDirectory` | Settings UI | corresponding `settings/*` | same | `SettingsController` | signal / preset name | capability boolean or open-result value | Unary | common | JSON Remote; host-native side effect | OPTIONAL_CANDIDATE | settings descriptor; `src/index.ts` |
| Credentials | `describe`, `set`, `unset` | Credentials UI | `credentials/*` | same | `CredentialsController` | refs; `(ref,value)`; ref | redacted `CredentialInfo` map; void | Unary | common | JSON Remote; secret is write-only | CORE_CANDIDATE | settings descriptor; `src/credentials.ts` |
| Models/providers | `listProviders`, `listConfigurableProviders`, `discoverModels` | LLM settings/session UI | `llm/*` | same | LLM registry | void or `LlmModelDiscoveryRequest` | provider/configurable-provider/discovered-model values | Unary | common | JSON Remote | CORE_CANDIDATE | `packages/llm/llm/lib/typert.remote-client.d.ts` |
| Commands | `list`, `execute` | command palette/session composer | `commands/*` | same | `CommandRuntime` | agent id; execute request | command roster / execution value | Unary | common | JSON Remote | CORE_CANDIDATE | `packages/interaction/commands/lib/typert.remote-client.d.ts`; `src/index.ts` |
| Permissions | read projection and change through permission command/settings | permission UI + commands | no dedicated `permissions/*` namespace | N/A | permission-presets + settings + commands | projection key / command args | `PermissionSelect` / command result | CLIENT_LOCAL over existing contracts | underlying calls use common hook | session projection + command/settings | CORE_CANDIDATE | `packages/interaction/permission-presets/src/index.ts`; UI permission package |
| Approval answer | `PendingApproval.answer()` | `ctx.remote.$on("approval/request")` | no public approval Remote descriptor | internal `$events/result` | `ApprovalService` waterfall via Gateway | `eventId`, `clientId`, result outcome | `ApprovalOutcome` | Event result, not ordinary unary | `$events/result` uses common hook | internal JSON Remote control call | CORE_CANDIDATE | `packages/client/ui-approval/src/client/index.ts`; Gateway remote-events |
| User-question answer | `PendingQuestion.answer/cancel()` | `ctx.remote.$on("user-questions/request")` | no public question Remote descriptor | internal `$events/result` | `UserQuestionService` waterfall via Gateway | structured answer or rejection outcome | `AskUserQuestionAnswer` / error | Event result, not ordinary unary | common hook | internal JSON Remote control call | CORE_CANDIDATE | `packages/client/ui-user-questions/src/client/index.ts`; Gateway remote-events |
| Agent presets | `list`, `read`, `select`, `copy`, `deletePreset` | Preset UI | five `agentPresets/*` generated methods | same | Agent preset service | preset ids/names/content per generated types | preset rosters/documents/void/selected id | Unary | common | JSON Remote | OPTIONAL_CANDIDATE | `packages/preset/agent-presets/lib/typert.remote-client.d.ts` |
| Subagents | `list`, `prompt`, `interruptByParent` | Subagent UI/client service | `subagents/*` | same | Subagent service | parent/session ids and prompt/interrupt requests | roster/control result | Unary | common | JSON Remote | OPTIONAL_CANDIDATE | `packages/subagent/subagent/lib/typert.remote-client.d.ts` |
| Jobs | list/status/interrupt UI state | Session control adapter | no `jobs/*` Remote namespace | N/A | session controller control projection / agent tools | control baseline/deltas | `SessionJob[]` views | CLIENT_LOCAL over Stream | control stream uses common hook | snapshot stream | OPTIONAL_CANDIDATE | session controller Client types (`JobView`) and control stream |
| Goal | `create`, `edit`, `clear`, `complete`, `pause`, `resume`; goal state read from session events/projection | Goal UI | six `goals/*` generated methods | same | Goal service | agent id, goal ref, and create/edit request types | `GoalRef`, `GoalView`, or `CreateGoalResult` | Unary; read is CLIENT_LOCAL projection | common | JSON Remote + journal/projection | OPTIONAL_CANDIDATE | `packages/goal/goal/lib/typert.remote-client.d.ts` |
| Workflow | run/lifecycle display | workflow UI/tooling | no `workflow/*` Remote namespace | N/A | workflow runtime/tools | session events | workflow event records | CLIENT_LOCAL over session stream | follow stream uses common hook | durable session journal | OPTIONAL_CANDIDATE | workflow packages; session event schemas |
| Feedback | `list`, `put`, `delete` | feedback UI | `messageFeedback/*` | same | message-feedback service | session/message keyed requests | feedback records/void | Unary | common | JSON Remote | OPTIONAL_CANDIDATE | `packages/feedback/message-feedback/lib/typert.remote-client.d.ts` |
| Session references | `candidates` | reference completion | `sessionReferenceResolver/candidates` | same | session-reference resolver | query/context | mention candidates | Unary | common | JSON Remote | OPTIONAL_CANDIDATE | `packages/context/session-reference/lib/typert.remote-client.d.ts` |
| Plugin inventory | `list` | plugin UI/diagnostic | `pluginInventory/list` | same | host plugin inventory | void | `PluginInventorySnapshot` | Unary | common | JSON Remote | DEFERRED | `packages/host/plugin-inventory/lib/typert.remote-client.d.ts` |
| Dynamic host plugins | `getClientCode`, `inventory`, `invoke`, `reportClientGuardFailure`, `reportRenderFailure`, `resolveInspectQuery`, `resolveRequestRun`, `runHostHalf`, `settleUserRun`, `stopFromPanel`, `syncInspectManifest`, `undefineFromPanel` | extension UI | twelve `dynamicCordisRunner/*` generated methods | same | cordis-host-runner | generated agent/plugin/run ids, manifests, resolutions, JSON args and failure reports | generated Client source, inventory, invocation/run/stop/resolve receipts or null | Unary | common | JSON Remote; dynamic code/host management | DEFERRED | `packages/extensions/cordis-host-runner/lib/typert.remote-client.d.ts` |
| Export command | `/export` command followed by download | command UI + export Client controller | no export Typert descriptor | exact Fetch `/api/session.export` | session-log-export | query parameters | ZIP stream | WEB_TRANSPORT_ONLY Fetch | common `/api` hook | browser HEAD + anchor download | WEB_ONLY | `packages/session-query/session-log-export/src/index.ts`; Client controller |

Clarifications:

- There is no `session/lookup`, `session/open`, `session/resume`, or
  `session/delete` Remote method in the frozen descriptor. List/search,
  `session/follow`, workspace archive, and host-side cold resolution provide
  those product behaviors.
- Credentials `describe` returns status/metadata (`CredentialInfo`), not secret
  values.
- Attachments/images are carried as base64 in ordinary JSON Remote payloads.
  Only export currently uses a binary Fetch response.
- The table records candidate relevance for P0.S/P0-5 input; it does not freeze
  V1.0 Feature Parity.

## E. Streaming Surface

### E.1 Remote mux wire

Current Web streaming uses `WS /api/remote.mux`.

Client frames:

- `{type:"open", streamId, endpoint, payload}`
- `{type:"cancel", streamId}`

Host frames:

- `{type:"item", streamId, value?}`
- `{type:"error", streamId, error:{code,message,details}}`
- `{type:"end", streamId}`

In an in-process/Worker composition, `ConnectionHandle.rpc.open` can supply an
`AsyncIterable` directly. The business stream does not require WebSocket, but
the current served Web implementation does.

| StreamName | Producer | Consumer | OpenMechanism | MessageShape | Completion | Error | Cancellation | ReconnectBehavior | TransportSpecific? | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| `session/follow` | SessionController/session log | Client `SessionEventStream` | `ctx.remote.$stream("session/follow")` | initial `snapshot {cursor,records,projections}` then journal records | mux `end` / iterator done | mux `error` → Client stream error/retry | stream AbortSignal → cancel frame / iterator return | `RemoteJournalStream` reopens, keeps cursor/window, repairs gaps with `session/page` | Business no; mux yes | session descriptor; `src/client/transport.ts`; Gateway journal stream |
| `session/control` | SessionController | Session manager/control store | Remote stream | full control baseline then deltas | end | stream error | AbortSignal | `RemoteSnapshotStream` reopens and replaces baseline | Business no; mux yes | session descriptor; Client transport |
| `workspace/follow` | WorkspaceController | Workspace Client store | Remote stream | baseline/snapshot and workspace change frames | end | stream error | AbortSignal | reopens and consumes a fresh baseline | Business no; mux yes | workspace descriptor; controller |
| `$events` | TypertGateway | Connection generation + Remote event dispatcher | internal Remote stream | `ready`, `emit`, `waterfall`, `cancel` frames | generation ends when carrier ends | transport/parse error | generation signal | Connection loop reopens with exponential backoff | Logical contract no; WS/default Web yes | Gateway `stream-protocol.ts`; Client `remote-events.ts` |
| `/plugins/events` | client-hmr host | browser HMR driver | Browser `EventSource` | SSE `graph` and `rebuilt {id,rev}` | response/socket close | browser EventSource behavior | close EventSource | browser EventSource reconnect; dev-only frames can be lost | YES, Web/dev-only | client-hmr host/client |

### E.2 Required content/event answers

| Concern | Actual path |
|---|---|
| Assistant token/text | Agent emits durable session journal records (including assistant/chunk/message records); Client consumes `session/follow`. Not a separate token socket. |
| Tool events | Durable tool call/result and related records in `session/follow`. |
| Approval request | `$events` `waterfall` for `approval/request`, then internal `$events/result`. Approval audit records are also written to the session journal. |
| User question | `$events` `waterfall` for `user-questions/request`, then internal `$events/result`. Completed interaction appears through normal tool call/result history, not dedicated question audit records. |
| Subagent lifecycle | Session journal/projection records consumed through `session/follow`; unary roster/control uses `subagents/*`. |
| Workflow lifecycle | Session journal records consumed through `session/follow`; there is no `workflow/*` Remote namespace. |
| Session lifecycle | Durable/live session data through `follow`; global lifecycle notifications also include ephemeral `api-session/{activity,added,error,removed,status}` emits. |
| Termination | Mux `end` is normal stream completion; mux `error` is terminal error. A clean client stream cancel aborts the Host pump and need not send `end`. |
| Transport disconnect | Active mux stream pumps abort. Client Remote streams reconnect according to their adapter. This transport action does not call `session/cancel` or `agent.cancel`. |

## F. Event / Generation Surface

### F.1 Forwarded events

The frozen allowlist contains:

- Emits: `agent-preset/selected`, `api-session/activity`,
  `api-session/added`, `api-session/error`, `api-session/removed`,
  `api-session/status`, `commands/change`, `credentials/reference-updated`,
  Cordis dynamic lifecycle events, `llm/adapters-updated`, and
  `settings/document-updated`.
- Waterfalls: `approval/request`, `user-questions/request`.

| Event | GenerationSemantics | Durable? | Replayable? | ConnectionScoped? | SessionScoped? | Consumer | Evidence |
|---|---|---|---|---|---|---|---|
| `$events.ready {clientId,host:{home}}` | first validated frame establishes one monotone Client Connection generation | NO | fresh each generation | YES | NO | ConnectionController | Gateway stream protocol / Client remote-events |
| `connection/reset` | emitted once after a new generation is established | NO | N/A | YES | NO | sessions/settings/skills and other cache owners | Connection Client/Gateway Client |
| ordinary `$events.emit` | belongs to current event-stream generation | generally NO | NO | YES | event-dependent | `$on` listeners | api-remotes allowlist/README |
| `$events.waterfall` | stable Gateway `eventId` remains pending across Client generations | pending in Gateway memory | YES while pending; same eventId | delivery is generation-scoped | agent/session-scoped when `agentId` present | approval/question Client plugins | Gateway host/client; reconnect tests |
| session journal sequence/cursor | Host session log sequence; `follow` snapshot declares cursor | YES | YES | NO | YES | SessionEventStream/UI | session follow/page and journal-stream |
| session control baseline | each stream generation starts with authoritative baseline | Host-authoritative current state | reconstructed, not event replay | NO | mixed/global | session manager | Client transport |
| `/plugins/events` graph/rebuilt | separate HMR connection; not Connection generation | NO | graph snapshot on connect; rebuild frames may be lost | Web/dev channel | NO | HMR | client-hmr |

Readiness means receiving `$events.ready`; it is not inferred from HTTP reachability.
`generation.host.home` is the only Host identity metadata on that frame. During
reconnect the published generation is retracted to `undefined`, then a new
generation id is published after `ready`.

Reconnect recovery is owner-specific:

- Connection emits `connection/reset`.
- Query/baseline owners re-pull state.
- Session journal streams retain cursor and repair through `follow/page`.
- Snapshot streams accept a new baseline.
- Ordinary forwarded emits are not replayed.
- Pending waterfalls are re-delivered while they remain resident.

Connection reconnect is therefore not session resume.

## G. Session Resume Contract

`DESKTOP_RESUME_AUTHORITY = NO`.

There is no Client Remote `resume` operation. Client `session.open()` starts the
history/journal follow path; viewing a cold session does not itself require an
agent process. When an operation requires a live agent/session authority, the
Host-side session controller resolves the persisted session and invokes
`ctx.agents.resume({resumeSessionId, agentOptions, setup})`. Concurrent cold
resumes are deduplicated by session id.

`session.prompt` and other live-agent operations use that Host resolver. Session
persistence reconstruction and agent runtime recovery are Host responsibilities.
A future Desktop may select/open and follow a session, but the frozen Harness
contract supplies no Desktop-owned explicit resume RPC.

Evidence:

- `packages/api/session-controller/src/agent.ts`
- `packages/api/session-controller/src/client/sessions/session.ts`
- `packages/api/session-controller/src/client/sessions/manager.ts`
- `packages/api/session-controller/tests/session-cold.host.spec.ts`
- generated session descriptor (no `resume`)

## H. Cancellation Contract

| Cancellation kind | Frozen behavior |
|---|---|
| Client user Stop | `session/cancel` unary → session command helper → `agent.cancel({kind:"user"},{keepInbox:true})`. |
| Unary `AbortSignal` | Client aborts Fetch/custom call; Gateway observes invocation cancellation and returns/throws `cancelled` rather than an internal fault. |
| Remote stream cancel | Client sends mux `cancel` (or aborts local `rpc.open` stream); Host aborts pump and calls iterator `return`. |
| Agent turn cancel | Explicit `session/cancel`; not implied by Connection disconnect. |
| Tool cancellation | Propagates from the Host agent/turn cancellation signal into active tool work; there is no separate generic Client `tool/cancel` Remote. Subagent has its own `interruptByParent`. |
| Approval/question lifetime | Host request signal or event cancellation yields `$events.cancel`; Client pending carrier rejects/aborts and does not return a stale result. |
| Mount/plugin disposal | Gateway Client aborts mounted in-flight invocation/stream tokens. |
| Transport disconnect | Aborts that socket's stream pumps and ends the Client generation. No code path couples it to `session/cancel` or `agent.cancel`; Host agent lifetime remains independent unless another Host/session action cancels it. |

Disconnect survival of every possible third-party provider/tool implementation
is not asserted. The contract fact is that Connection disconnect itself has no
automatic agent-cancel action.

## I. Approval Contract

```text
Tool/Host requires escalation
  → ApprovalService.request()
  → append approval/asked (durable audit id)
  → Cordis waterfall approval/request
  → Gateway pending event (eventId)
  → Client $events waterfall + scoped PendingApproval
  → render Reject / Allow once
  → internal $events/result
  → Gateway first result settles waterfall; cancel other deliveries
  → append approval/decided
  → tool/agent continues with ApprovalOutcome
```

| Field | Contract |
|---|---|
| Request | `{agent, toolName, callId?, reason?, signal?}`; `agent` becomes scoped `agentId` on wire. |
| Identity | Durable `ApprovalRequestId` pairs asked/decided audit events. Gateway `eventId` correlates the live round-trip. Client `approval:N` is render-local only. |
| Client projection | `$events` waterfall → `PendingApproval` for the owning session; approval has lower composer precedence than question/plan-review. |
| Answer | `'allowed-once'` or `'rejected'`; policy `'never'` can reject before Client delivery. |
| Settlement | `$events/result {clientId,eventId,outcome}` resolves the Host waterfall; approval service writes exactly one decided audit event. |
| Duplicate behavior | Client carrier is one-shot and rejects a second local answer. Across Clients, first result wins; Gateway cancels other deliveries. Late settled event ids are unavailable/no-op, not a second decision. |
| Disconnect behavior | One Client delivery ending does not erase the Gateway-resident pending event. It can remain for other/new Clients and is re-delivered with the same eventId. Host/context/request cancellation ends it. |
| Replay | Live pending waterfall is replayed from Gateway memory. Completed approval audit is replayable from the session log, but is not an answerable pending projection. |

## J. User Question Contract

```text
ask_user_question tool / Host caller
  → UserQuestionService.ask()
  → Cordis waterfall user-questions/request
  → Gateway pending event (eventId)
  → Client $events waterfall + scoped PendingQuestion
  → generic composer or plan-review card
  → structured answer batch, or ASK_CANCELLED
  → internal $events/result
  → Gateway settles waterfall
  → tool returns/throws and agent continues
```

| Field | Contract |
|---|---|
| Request | `{questions: AskUserQuestionItem[], agent?, signal?}`; each item has caller-supplied string id, text/options and optional intent/detail. |
| Identity | No dedicated durable question-request id. Item ids correlate answers; Gateway eventId correlates the live round-trip; `question:N` is local render identity. |
| Client projection | `$events` waterfall → `PendingQuestion`; normal question precedence 1, plan-review 2, approval 0. |
| Answer | `{answers:[{id, selected, ...}]}` matching question ids; user dismiss gives `UserQuestionError` code `ASK_CANCELLED`. |
| Settlement | Same `$events/result` mechanism as approval, but separate event/service and error vocabulary. |
| Duplicate behavior | Local answer/cancel settles once. First Client result wins globally; late/duplicate event result cannot settle twice. |
| Disconnect behavior | Still-pending Gateway event is re-delivered on a new event-stream generation with the same eventId. Request-signal abort gives `ASK_ABORTED`; plugin-domain unload delegates to the next waterfall listener. |
| Durability | No dedicated asked/answered audit pair. Completed use is represented by normal tool call/result session records. |

Approval and questions share transport machinery, not business semantics.

## K. Exact Fetch / Binary Surface

### K.1 Registered special routes

| Route / Handler | Method | Purpose | Caller | HostHandler | RequestContentType | ResponseContentType | Binary? | StreamingBody? | AuthenticationHook | MaxBody / BufferLimit | BrowserAssumption | ShacoRelevance | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/api/<endpoint>` Gateway intercept | POST | unary JSON Remote and internal result control | Client Remote | Connection Fetch dispatcher → Gateway invoke | `application/json` | JSON RPC envelope | NO | response bridge supports streaming, typical unary JSON is buffered value | `/api` requestRejection | request fully buffered; default 300 MiB | Fetch/custom transport | CORE_CANDIDATE | Connection rpc-host/http-bridge; Gateway |
| `/api/remote.mux` | WebSocket upgrade | multiplex Remote streams and `$events` | Gateway Client | Gateway stream server | WebSocket frames | WebSocket frames | frame bytes, logical JSON | YES | upgrade requestRejection | WebSocket/frame library limits; not the HTTP body cap | browser WebSocket unless `rpc.open` supplied | CORE_CANDIDATE | Gateway stream protocol/server |
| `/api/session.export` | GET, HEAD | stream session log/attachments ZIP | export Client controller | session-log-export Fetch route | no body; query params | `application/zip` | YES | YES for GET; HEAD cancels body | inherited `/api` requestRejection | no request body; ZIP streamed | browser HEAD then anchor download | WEB_ONLY product; binary carrier fact remains P0.S input | session-log-export |
| `/plugins/??...&rev=...` | GET, HEAD | combo client module JS or source map bytes | script loader/index preload | ClientModuleRegistry Web route | none | JS or JSON source map | byte body | precomputed Buffer, not incremental | NONE | URL max 3 KiB; immutable cached response | browser script loading | WEB_ONLY current delivery | client modules host |
| `/plugins/events` | GET (HEAD accepted by implementation) | HMR graph/rebuilt channel | EventSource | client-hmr | none | `text/event-stream` | NO | YES | NONE | no request body | Browser EventSource; dev-only | WEB_ONLY | client-hmr |
| SPA fallback/index/static assets | GET, HEAD | shell, boot injections, static assets/VFS gzip | browser navigation/assets | frontend-static | none | HTML/JS/CSS/SVG/JSON/gzip/octet-stream | sometimes | file Buffer/string response | index only: `authorizeIndex`; non-index static public | filesystem read; no Connection request-body cap | browser/WebServer | WEB_ONLY | frontend-static/webserver |

`BINARY_TRANSPORT_PRESENT = YES`.

### K.2 Body and missing-route findings

- Connection buffers the complete `/api` request body before dispatch and
  rejects declared or streamed size over
  `DEFAULT_MAX_REQUEST_BODY_BYTES = 300 * 1024 * 1024` with 413.
- Default aggregate message-image capacity is 200 MiB. Connection configuration
  enforces enough body capacity for base64 expansion plus a 1 MiB JSON envelope.
- Response bridging streams with backpressure.
- Session prompt image upload: ordinary JSON Remote with base64 blocks.
- Session attachment read: ordinary JSON Remote returning base64.
- Multipart upload route: `NOT_PRESENT`.
- Generic file download route: `NOT_PRESENT`.
- Separate attachment/image binary route: `NOT_PRESENT`.
- Client module bytes are Web routes, not Typert business calls.
- `/export` is a product command. `/api/session.export` is the binary transport
  it invokes; their relevance classifications are not interchangeable.

## L. Directory Picker Contract

| Item | Finding |
|---|---|
| TransportCategory | JSON Typert Remote capability: `directoryPicker/pick`, `list`, `createDirectory`. Not Exact Fetch and not Browser File System Access API. |
| ClientAssumption | UI selects native picker or in-app browse presentation and invokes the Remote capability. |
| HostAssumption | `DirectoryPickerController` delegates to one resolved backend. `directory-picker-auto` chooses the backend once at boot from Host capabilities. |
| WindowsBehavior | Native backend invokes the Host OS chooser when available; browse backend performs Host filesystem listing/creation. Paths are Host Windows paths, not browser-local handles. Auto-resolution and packaged/non-Web behavior must be exercised on the target Windows composition. |
| Cancellation | `pick`/`list` accept invocation AbortSignal and classify caller timeout/disconnect as cancellation. |
| RequiresP0S | YES — prove backend availability/selection and cancellation over the candidate carrier on Windows without assuming WebServer/browser behavior. |

## M. Boot Graph Surface

The current Web boot global is:

```text
window.__DSH_BOOT__ = {
  rev: string,
  entries: WebBootEntry[],
  batches: WebBootBatch[]
}
```

| Field | Producer | Consumer | RequiredForCoreClient? | WebTransportSpecific? | CanPotentiallyBeStatic? | RequiresP0S? |
|---|---|---|---|---|---|---|
| `rev` | ClientModuleRegistry compose hash | manifest/module loader and HMR graph | YES for current module system | graph semantics no; HTML injection yes | YES if graph frozen at build time | YES |
| `entries[].id` | scanned `dsh.client` package graph | Cordis Loader entry names | YES | NO | YES for fixed composition | YES |
| `entries[].url` | Host combo URL builder | lazy/HMR module loader | YES for current dynamic loader | current `/plugins` URL is Web-specific | replaceable by `loadBundle`/embedded table in principle | YES |
| `entries[].rev` | startup nonce/content revision | cache bust and HMR | YES for current loader | current URL query is Web-specific | YES for immutable build artifacts | YES |
| `entries[].inject` | package client manifest | Loader dependency activation | YES | NO | YES | YES |
| `entries[].external` | package client manifest | CommonJS dependency resolution | YES | NO | YES | YES |
| `entries[].immediately` | package client manifest | boot prefetch tier | current boot optimization | NO | YES | YES |
| `batches[].phase` | Host compose (`bootstrap`/`application`) | index injection/boot prefetch | YES for current boot order | current script/preload injection yes | YES | YES |
| `batches[].url/rev/entries` | combo builder | browser/module loader | YES in current delivery | current URL fetch yes | potentially embedded/preloaded | YES |
| `__ModuleLoader__` | Host-injected facade script | AppWebEntry | YES | current HTML injection yes | facade can be bundled/injected by another bootstrap | YES |
| `__DSH_BOOT_READY__` | WebServer injection tail or asynchronous bootstrap | AppWebEntry gate | required only when an async bootstrap owns document state | YES as current global protocol | replaceable by deterministic packaged boot | YES |
| `__DSH_TRANSPORT__.loadBundle` | optional non-Web transport/bootstrap | AppWebEntry/module system | NO in served Web, required by alternate byte owner | NO; it is the current carrier seam | N/A | YES |

Not present in `__DSH_BOOT__`: API base URL, auth token/cookie, trusted-host
metadata, general runtime capability roster, or Connection client id. Served Web
derives API origin from the page; BrowserAuth is established at index navigation;
Host home arrives later in `$events.ready`.

## N. Client Module Delivery

| Topic | Frozen behavior |
|---|---|
| Static shell | Vite-built app shell and static modules imported by `getStaticModules()`. |
| Dynamic plugin graph | Host scans selected `dsh.client` manifests and produces entries/batches. |
| Plugin combo | `/plugins/??id/client.js,...&rev=...`; bootstrap batch is parser-loaded, application batch is preloaded/lazy. |
| Loader format | Lazy CommonJS registration through `window.__ModuleLoader__`. |
| Revision/cache | Graph revision plus per-entry/batch revisions; immutable one-year cache on plugin responses. |
| HMR | `/plugins/events` SSE sends graph/rebuilt; per-entry URL is reloaded. Dev-only and non-durable. |
| Default byte load | Dynamic `<script src=url>`. |
| Alternate byte load | `ClientModuleCreateOptions.loadBundle` and `__DSH_TRANSPORT__.loadBundle`. |
| Static potential | Shell, static modules, and a fixed plugin roster/artifact table can potentially be packaged at build time. This is not proven for the full standard composition. |
| Currently Host-dynamic | Selected plugin roster, dependency metadata, ordering, graph/batch revisions, combo artifact bytes, and dev rebuild notifications. |
| Requires WebServer today | Served `dsh web` path: YES. The abstraction has an alternate loader seam, but removal of WebServer for Shaco Desktop is unproven. |
| P0.S unknown | Prove complete standard Client boot from packaged/alternate bytes, preserve module order/inject/external semantics, and define revision/update behavior without `/plugins`. |

## O. Current Error Surface

| ErrorOrigin | WireRepresentation | ClientRepresentation | TransportSpecific? | DoesConnectionClose? | Evidence |
|---|---|---|---|---|---|
| Host/Origin rejection | HTTP/upgrade 403 `forbidden` | Fetch/WS transport error | YES | request/socket only | Connection trust/requestRejection |
| Browser unauthenticated | HTTP/upgrade 401 | transport error; index supplies operator text/token exchange | YES | request/socket only | BrowserAuth |
| oversized `/api` body | HTTP 413 | transport error | YES | request only | http-bridge |
| invalid route/method/content/envelope | HTTP 404/405/415/400 | transport error | YES | request only | rpc-host/webserver |
| unary Remote failure | RPC `{ok:false,error:{code,message,details}}` | `RpcError` / typed Client failure | logical envelope rides transport | NO | Connection RPC + Typert protocol |
| Host invocation cancellation | Remote failure code `cancelled` | cancellation error/result | NO | NO | Gateway invoke |
| stream business/carrier failure | mux `error {streamId,error}` | RemoteStream error; adapter may retry | mux frame is Web implementation | stream only; socket may remain | Gateway stream protocol |
| stream socket loss | WebSocket close; all active stream pumps abort | generation/stream failure followed by retry | YES | YES, then reconnect | stream client/server |
| Remote event listener rejection | `$events/result outcome:{kind:"rejected",error}` | restored Host-side error | NO | NO | remote-events |
| not-ready/reconnecting | no active `ConnectionGeneration`; ready timeout/retry state | Client state `reconnecting`, generation `undefined` | carrier lifecycle | prior generation is closed | ConnectionController |
| Session business error | typed `SessionError` unary failure or ephemeral `api-session/error` string event | Client error/store notification | NO | NO | session controller/remotes |
| boot/module activation failure | thrown module/boot error, rendered by BootPage | failed boot/plugin state | current browser boot | N/A | client web boot/module system |
| export failure | HTTP 400/404/500/501 text | export Client error string | YES | NO | session-log-export |

## P. Trust Hook References

Facts only:

| Entry point | Hook |
|---|---|
| `/api` HTTP prefix | `connection.requestRejection(req)` before Connection bridge. |
| `/api/remote.mux` upgrade | same `requestRejection` before upgrade acceptance. |
| Trust classification | `isTrustedApiRequest`: Host/Origin authority checks, configured `trustedHosts`, and cross-site Fetch classification. |
| Browser session | `BrowserAuth.isAuthenticated`: authority-bound HMAC cookie. |
| Index navigation | `BrowserAuth.authorizeIndex`: launch `?token=` exchange sets cookie and redirects. |
| CLI launch URL | `connection.authenticatedUrl`. |
| `/api/session.export` | inherits authenticated `/api` prefix. |
| `/plugins` | no Connection auth hook in route registration. |
| `/plugins/events` | no Connection auth hook in route registration. |
| non-index static files | public in frontend-static. |
| rendered index | `connection.authorizeIndex`. |
| alternate/in-process carrier | no browser cookie is inherently required by `ConnectionHandle.rpc.call/open`; trust must be supplied by that composition. |

P0-4 remains responsible for the full authentication/trust audit. No Shaco trust
design is made here.

## Q. P0.S Connection Inputs

| Input | KnownFact | Unknown | WhySpikeNeeded | WhatWouldProveIt |
|---|---|---|---|---|
| Unary carrier | Business RPC is endpoint + Typert args/result over `ConnectionHandle.rpc.call`; Web uses JSON POST. | Exact packaged carrier encoding/lifetime/error mapping. | Preserve all 72 unary calls without binding P1 to HTTP. | Run representative session/settings/credentials/model calls over candidate carrier with typed success/failure/cancel tests. |
| Streaming carrier | Business streams are AsyncIterable; Web mux multiplexes item/error/end/cancel; `rpc.open` seam exists. | Backpressure, concurrent streams, abnormal termination, resource cleanup on candidate carrier. | Streams carry history, projections, events, approvals. | Concurrent `follow/control/workspace/$events` test with cancel, error, large frames, and forced carrier loss. |
| Event/generation | `$events.ready` establishes generation; `connection/reset` tells owners to repull. | New Host process vs new channel identity and readiness under Desktop/Worker lifecycle. | Incorrect generation semantics can retain stale projections. | Restart/reconnect matrix proving generation retraction, new id, ready/home, and owner repulls. |
| Reconnect | Connection backoff is automatic; ordinary emits are not replayed; journals/snapshots own recovery. | Timing and failure behavior across Worker suspend/crash/restart. | Must distinguish channel reconnect from Host restart/session resume. | Fault-injection test with dropped carrier and restarted Host; verify cursors, baselines, waterfalls, no duplicate actions. |
| Session resume | Host resolver resumes persisted agents; no Client resume RPC. | Host process restart behavior for every live/pending state. | Desktop must not become resume authority accidentally. | Cold persisted-session open/prompt after Worker restart; assert Host-only resume and deduplication. |
| Cancellation | explicit turn cancel and stream cancellation exist; disconnect has no agent-cancel coupling. | Provider/tool compliance and shutdown policy in Worker process lifecycle. | Desktop close must not silently mean turn cancel, but Worker termination obviously ends process. | Drop only carrier and prove Host turn stays live; then explicit cancel; separately terminate Worker and classify result. |
| Approval | Gateway-resident pending event, stable eventId, first result wins, reconnect redelivery. | Persistence boundary if Host process itself restarts. | Channel reconnect is covered; process restart is not. | Disconnect/reconnect and Host restart tests with one pending approval, duplicate answers, and audit pair validation. |
| User question | Same live waterfall transport; item ids; no durable ask/answer audit pair. | Required V1.0 policy and Host-restart recovery. | Loss/duplication can block an agent. | Pending question across carrier loss; duplicate/cancel/abort tests; separately test Host restart and record limitation. |
| Exact/binary | Export is a streamed ZIP Fetch; module/static bytes are Web routes; images are JSON/base64. | Whether P1 needs a generic binary channel or a scoped replacement. | Product optionality does not remove byte-delivery requirements. | Stream ZIP and module bytes over candidate arrangement with backpressure, cancellation, and bounded memory. |
| Body size | Web `/api` buffers up to 300 MiB; 200 MiB images expand as base64. | Safe limits and memory profile under Desktop/Worker carrier. | Blindly copying Web buffering can exhaust memory. | Boundary tests around configured limit and peak-memory measurement for large image prompt/attachment. |
| Boot graph | Core fields are rev/entries/batches; no auth/base URL/capability fields. | How packaged boot obtains selected roster/metadata and byte loader. | Standard Client cannot boot from shell alone. | Boot full frozen standard composition from packaged/alternate table with no `/plugins` Web route. |
| Client module delivery | `loadBundle` seam exists; current standard uses Host combos and HMR SSE. | Static/dynamic split, revisions, update policy, failure UX without WebServer. | Needed before removing WebServer assumption. | Load every selected entry from non-HTTP artifact source and pass activation/audit tests. |
| Directory picker | JSON Remote to Host backend; auto resolver chooses native/browse. | Windows packaged backend availability and cancellation. | Browser assumptions must not leak into Desktop UX. | Windows native and browse tests over candidate carrier, including cancel and invalid paths. |
| Cookie/browser coupling | Current Web `/api`, WS and index use BrowserAuth; alternate Connection seam is not inherently cookie-based. | Candidate local trust/auth binding. | P0-4/P0.S must separate browser policy from business calls. | Carrier starts with no HTTP cookie yet enforces the trust decision selected after P0-4; negative peer tests. |
| Errors | Current layers have HTTP, RPC, stream, event, session and boot errors. | Lossless P1 mapping without exposing Web-only status codes as business codes. | UI retry/cancel behavior depends on origin. | Conformance tests for business failure, auth denial, not-ready, cancellation, carrier loss, malformed frame. |

## R. Unknowns

The census intentionally leaves these for later phases:

1. P0-4 trust posture and the replacement trust mechanism.
2. P0-5 final V1.0 feature-parity classification.
3. P0.S carrier feasibility, performance, framing, and Windows process behavior.
4. Persistence of a pending approval/question across Host process death. Current
   evidence proves Connection-generation redelivery while Gateway memory lives.
5. Whether the full standard Client graph can be made build-time static without
   losing required extension selection.
6. Final binary-channel scope and large-message limits.
7. Packaged Windows directory-picker backend selection.

## S. Evidence Paths

Primary implementation:

- `packages/client/connection/src/rpc.ts`
- `packages/client/connection/src/rpc-schema.ts`
- `packages/client/connection/src/rpc-host.ts`
- `packages/client/connection/src/http-bridge.ts`
- `packages/client/connection/src/api-request-trust.ts`
- `packages/client/connection/src/browser-auth.ts`
- `packages/client/connection/src/client/index.ts`
- `packages/client/connection/src/client/rpc.ts`
- `packages/client/connection/src/client/connection.ts`
- `packages/api/gateway/src/index.ts`
- `packages/api/gateway/src/stream-protocol.ts`
- `packages/api/gateway/src/stream-server.ts`
- `packages/api/gateway/src/client/index.ts`
- `packages/api/gateway/src/client/stream-client.ts`
- `packages/api/gateway/src/client/remote-events.ts`
- `packages/api/gateway/src/client/remote-stream.ts`
- `packages/api/gateway/src/client/journal-stream.ts`
- `packages/api/remotes/src/index.ts`
- `packages/api/remotes/src/remote-events.ts`
- `packages/api/remotes/src/client/index.ts`
- `packages/api/session-controller/src/index.ts`
- `packages/api/session-controller/src/agent.ts`
- `packages/api/session-controller/src/commands.ts`
- `packages/api/session-controller/src/history.ts`
- `packages/api/session-controller/src/client/transport.ts`
- `packages/api/session-controller/src/client/sessions/session.ts`
- `packages/api/session-controller/src/client/sessions/manager.ts`
- `packages/api/workspace-controller/src/index.ts`
- `packages/api/workspace-controller/src/directory-picker.ts`
- `packages/api/settings-controller/src/index.ts`
- `packages/api/settings-controller/src/credentials.ts`
- `packages/interaction/commands/src/index.ts`
- `packages/interaction/user-approval/src/index.ts`
- `packages/interaction/user-questions/src/index.ts`
- `packages/client/ui-approval/src/client/index.ts`
- `packages/client/ui-approval/src/client/contract/slots.ts`
- `packages/client/ui-user-questions/src/client/index.ts`
- `packages/client/ui-user-questions/src/client/contract/slots.ts`
- `packages/client/ui-session/src/client/index.ts`
- `packages/session-query/session-log-export/src/index.ts`
- `packages/session-query/session-log-export/src/client/controller.ts`
- `packages/client/modules/src/index.ts`
- `packages/client/modules/src/client/manifest.ts`
- `packages/client/modules/src/client/system.ts`
- `packages/client/hmr/src/index.ts`
- `packages/client/hmr/src/client/index.ts`
- `packages/client/web/src/boot.ts`
- `packages/host/frontend-static/src/index.ts`
- `packages/host/webserver/src/index.ts`
- `packages/host/directory-picker-auto/src/index.ts`

Generated descriptors:

- `packages/api/session-controller/lib/typert.remote-client.d.ts`
- `packages/api/workspace-controller/lib/typert.remote-client.d.ts`
- `packages/api/settings-controller/lib/typert.remote-client.d.ts`
- `packages/interaction/commands/lib/typert.remote-client.d.ts`
- `packages/preset/agent-presets/lib/typert.remote-client.d.ts`
- `packages/llm/llm/lib/typert.remote-client.d.ts`
- `packages/subagent/subagent/lib/typert.remote-client.d.ts`
- `packages/goal/goal/lib/typert.remote-client.d.ts`
- `packages/feedback/message-feedback/lib/typert.remote-client.d.ts`
- `packages/context/session-reference/lib/typert.remote-client.d.ts`
- `packages/host/plugin-inventory/lib/typert.remote-client.d.ts`
- `packages/extensions/cordis-host-runner/lib/typert.remote-client.d.ts`

Representative tests inspected/executed:

- `packages/client/connection/tests/http-bridge.host.spec.ts`
- `packages/client/connection/tests/connection.client.spec.ts`
- `packages/client/connection/tests/generation.client.spec.ts`
- `packages/client/connection/tests/fetch-routes.host.spec.ts`
- `packages/client/connection/tests/fixture.client.spec.ts`
- `packages/api/gateway/tests/gateway.client.spec.ts`
- `packages/api/gateway/tests/gateway-stream.host.spec.ts`
- `packages/api/gateway/tests/journal-stream.client.spec.ts`
- `packages/api/remotes/tests/remote-events.host.spec.ts`
- `packages/api/session-controller/tests/session-cold.host.spec.ts`
- `packages/api/session-controller/tests/session-history-journal.host.spec.ts`
- `packages/api/session-controller/tests/transport.client.spec.ts`
- `packages/api/workspace-controller/tests/directory-picker.host.spec.ts`
- `packages/client/ui-approval/tests/ui-approval.client.spec.tsx`
- `packages/client/ui-user-questions/tests/browser-plugin.client.spec.ts`
- `packages/session-query/session-log-export/tests/route.host.spec.ts`
- `packages/session-query/session-log-export/tests/archive.host.spec.ts`
- `packages/client/modules/tests/node-half.client.spec.ts`
- `packages/client/modules/tests/loader.client.spec.ts`

## T. Gate Results

| Gate | Result |
|---|---|
| FROZEN_BASELINE_REVERIFIED | YES |
| UPSTREAM_WORKTREE_CLEAN_BEFORE | YES |
| UPSTREAM_WORKTREE_CLEAN_AFTER | YES |
| CONTRACT_LAYER_MODEL_KNOWN | YES |
| REMOTE_API_SURFACE_ENUMERATED | YES |
| CORE_UNARY_DOMAINS_ENUMERATED | YES |
| STREAM_SURFACE_ENUMERATED | YES |
| EVENT_GENERATION_SURFACE_ENUMERATED | YES |
| SESSION_RESUME_AUTHORITY_IDENTIFIED | YES |
| CANCELLATION_SURFACE_ENUMERATED | YES |
| APPROVAL_CONTRACT_ENUMERATED | YES |
| USER_QUESTION_CONTRACT_ENUMERATED | YES |
| EXACT_FETCH_ROUTES_ENUMERATED | YES |
| BINARY_SURFACE_ENUMERATED | YES |
| DIRECTORY_PICKER_CONTRACT_IDENTIFIED | YES |
| BOOT_GRAPH_SURFACE_ENUMERATED | YES |
| CLIENT_MODULE_DELIVERY_IDENTIFIED | YES |
| CURRENT_ERROR_SURFACE_IDENTIFIED | YES |
| TRUST_HOOK_REFERENCES_IDENTIFIED | YES |
| P0S_CONNECTION_INPUTS_WRITTEN | YES |
| P0_3_EVIDENCE_WRITTEN | YES |
| CURRENT_STATE_UPDATED | YES |
| DEVELOPMENT_LOG_UPDATED | YES |
| P0_3_STATUS_UPDATED | YES |

`SHACO_FORGE_V1_0_P0_3 = PASS`

`SHACO_FORGE_V1_0_P0 = NOT_PASS` because P0 remains `IN_PROGRESS`.
