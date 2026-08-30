# P0-5 — Shaco Forge V1.0 Core Feature Parity Matrix

Status: `CLOSED / PASS`
Scope: P0-5 product capability freeze only
Frozen Harness: `deepseek-ai/deepseek-harness@cd5ef8148158c3a752a658978873241fdf8e2bbc`

## A. Frozen Baseline

| Item | Verified value |
|---|---|
| Repository | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Release | `dsh-v0.1.2-alpha.1` |
| Package | `@deepseek-ai/dsh@0.1.2-alpha.1` |
| `pnpm-lock.yaml` SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| Upstream clean before | YES |
| Upstream clean after | YES |
| Build/tests executed | NO; P0-2/P0-3/P0-4 source and test evidence was sufficient |

All upstream paths are relative to
`D:\Project\Shaco-Forge-Upstream\deepseek-harness`.

## B. Scope Principles

This matrix freezes product behavior, not every package found in Harness.

- `REQUIRED`: missing behavior fails Shaco Forge V1.0 acceptance.
- `OPTIONAL`: valuable, but absence does not block the V1.0 core release.
- `DEFERRED`: excluded from the V1.0 core scope and assigned to a later
  version or an unfrozen future decision.
- `WEB_ONLY`: current browser/Web transport artifact, not a Desktop user
  feature. A required capability may depend on replacing it.
- `EXPERIMENTAL`: upstream/non-default experimental capability with no V1.0
  product commitment.
- `NOT_PRODUCT`: explicitly not a Shaco V1.0 product capability.

`ArchitectureDependencyRequired = YES` means the architecture must prove the
underlying capability even when the named user feature is OPTIONAL. The main
example is binary/exact-byte carriage versus OPTIONAL `/export`.

`IS_SHACO_AUTOMATION_DOMAIN = NO` for Harness Jobs, Goal, Workflow, Ralph and
Schedule. They may be execution capabilities, but they are not the Shaco-owned
AutomationDefinition/Run/Task/Step/Attempt domain planned for V1.1.

## C. Complete Feature Matrix

### C.1 Product, provider, workspace and session

| FeatureId | Feature | UserVisibleBehavior | UpstreamPackageOrComponent | UpstreamPlane | EnabledInCurrentWeb | EnabledInStandardPreset | RemoteOrContractDependency | ClientDependency | TrustDependency | PersistenceDependency | BrowserTransportDependency | WindowsDependency | RequiresDesktopAdaptation | RequiresP0SSpike | ArchitectureDependencyRequired | IS_SHACO_AUTOMATION_DOMAIN | Classification | WhyClassification | V1_0AcceptanceBehavior | FutureVersion | ImplementationPhase | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ARCH-01 | Harness Client boot with required in-box graph | Desktop reaches a usable Harness session UI | client modules and required `dsh.client` roster | Host+Client | YES | N/A | boot graph/module loader | shell, layout, session/chat/settings UI | trusted module provenance | packaged assets | YES today | Electron packaging | replace HTML injection and `/plugins` delivery | YES | YES | NO | REQUIRED | all required Client behavior depends on boot | launch packaged Desktop and enter session UI without WebServer | 1.0 | P4; deps P0.S-2/-6, P3, P7 | P0-2 G/H; P0-3 M/N |
| ARCH-02 | Per-user Worker start/discover/control | Desktop starts or attaches to one local Worker | Shaco Supervisor + Harness Host profile | Product+Host | NO | N/A | supervisor then Harness Connection | Desktop status/control | local user and Worker identity | Shaco Control Store reference only | NO | process lifecycle | new product control plane | YES | YES | NO | REQUIRED | Master Goal steps 2 and 8–10 | fresh user launches Desktop and reaches intended Worker; stale/other Worker is rejected | 1.0 | P2/P3; deps P0.S-1/-3/-5 | Master Goal; ADR-0001/2 |
| ARCH-03 | Authenticated unary/stream/generation carrier | UI invokes Remote calls and receives streams/events | Connection/Gateway/remotes | Host+Client | YES | N/A | `rpc.call/open`, Gateway, `$events.ready` | Connection adapters | authenticated before Gateway | none | HTTP/WS today | local IPC | replace physical carrier, preserve business contract | YES | YES | NO | REQUIRED | all Agent control and projection rides this seam | unary, stream, ready/reset, reconnect and errors work over selected carrier | 1.0 | P3; deps P0.S-3/-4 | P0-3 C/E/F; P0-4 N/T |
| ARCH-04 | Binary/exact-byte carrier capability | trusted bounded bytes can cross Desktop/Worker boundary | Connection exact Fetch/module byte seams | Host+Client | YES | N/A | exact Fetch or equivalent | save/module consumer | same trust as unary/stream | optional artifact target | YES today | file/save integration | provide bounded trusted byte path independent of `/export` product scope | YES | YES | NO | REQUIRED | architecture cannot be JSON/text-only | real binary path passes auth, backpressure, cancel and bounded-memory checks | 1.0 | P3; deps P0.S-4 | P0-3 K/Q; P0-4 W |
| ARCH-05 | Packaged runtime without system Node/pnpm/Harness | installer works on fresh Windows | packaged Worker/Harness runtime | Product+Host | NO | N/A | launcher/profile | Electron shell | signed/controlled runtime | controlled `DSH_HOME` | NO | Windows x64 baseline | package runtime and helpers | YES | YES | NO | REQUIRED | explicit Master Goal | fresh Windows launches full core flow with no global development runtime | 1.0 | P7; deps P0.S-7 | Master Goal; P0.S-7 |
| ARCH-06 | Pinned compatibility and fail-closed upgrade | incompatible versions/components cannot write Harness data | Supervisor/P0.5 contract | Product | NO | N/A | pre-Connection handshake | diagnostics UI | authentication remains a separate prior gate | backup/control store | NO | installer/update | product-owned compatibility gate | YES | YES | NO | REQUIRED | Master Goal steps 11–12 | authenticated but incompatible pair exposes diagnostics only; compatible pinned release proceeds | 1.0 | P3 handshake + P7 upgrade; deps P0.S, P0.5, P1 | ADR-0004; Master Goal |
| ARCH-07 | Minimal Shaco Control Store | product remembers Worker/version/upgrade control metadata without copying sessions | Shaco SQLite control store | Product | NO | N/A | supervisor contract | Desktop/Supervisor | current-user storage | Shaco-only SQLite | NO | Windows data path | new product component | NO | YES | NO | REQUIRED | accepted architecture invariant | Worker discovery/version metadata survives restart; Harness data is referenced, not duplicated | 1.0 | P2/P7; deps P1 | ADR-0006; Data Ownership |
| MOD-01 | DeepSeek official provider | user can send Agent requests through DeepSeek | `dsh-llm-deepseek`, API extensions, retry | Host | YES | host-owned | `llm/*`, session prompt | models/settings UI | trusted credential write path | Harness settings/credentials | NO | network/TLS | retain Host adapter in Worker | NO | YES | NO | REQUIRED | product theme and Master Goal require a provider | configured DeepSeek route completes a streamed turn | 1.0 | P2/P5 | base YAML; P0-2 D |
| MOD-02 | DeepSeek API key configuration | user sets/unsets required key | credentials-local + settings controller | Host+Client | YES | host-owned | `credentials.describe/set/unset` | Models/settings card | authenticated carrier; secret never returned | `.credentials.yaml` | NO | Windows ACL inheritance | secure Desktop form | NO | YES | NO | REQUIRED | no provider use without credential flow | set key, configured state turns true, unset turns false, plaintext never reads back | 1.0 | P4/P5; deps P2/P3/P7 | P0-3 D; P0-4 P |
| MOD-03 | Provider configured-state | UI reports whether provider credentials/config are usable | credentials + LLM settings | Host+Client | YES | host-owned | `credentials.describe`, `llm.list*` | Models/settings UI | authenticated carrier | Harness-owned | NO | none | retain status projection | NO | NO | NO | REQUIRED | user must diagnose first-run setup | fresh install shows unconfigured; saving key updates status without exposing value | 1.0 | P4/P5 | P0-3 D |
| MOD-04 | Model discovery/catalog | UI lists currently available DeepSeek models | LLM Remote + DeepSeek catalog | Host+Client | YES | host-owned | `llm.discoverModels`, `session.modelCatalog` | model directory | authenticated carrier | optional settings | NO | none | retain picker/command integration | NO | NO | NO | REQUIRED | model selection must use Host truth | catalog loads and failures are visible without corrupting current choice | 1.0 | P4/P5 | P0-3 D; ui-model-selection |
| MOD-05 | Session-local model selection | user changes model for one session | session controller + ui-model-selection | Host+Client | YES | host-owned | `session.selectModel` and projection | composer seat and `/model` | authenticated carrier | durable session event | NO | none | Desktop command/picker surface | NO | NO | NO | REQUIRED | explicitly required candidate and current Client behavior | selecting a catalog model updates that session and subsequent turn route | 1.0 | P4/P5 | P0-3 D; ui-model-selection |
| MOD-06 | Reasonable default model | new session is immediately routable after credential setup | agent-default-model | Host | YES | host-owned | session creation route | displays current choice | none beyond provider | Harness settings/default | NO | none | preserve configured default | NO | NO | NO | REQUIRED | avoids mandatory model ceremony | new standard session uses supported DeepSeek default unless user overrides | 1.0 | P2/P5 | base YAML |
| MOD-07 | Extra LLM providers | configure non-DeepSeek model routes | `llm-pi-ai` and future adapters | Host+Client | dormant | NO | LLM Remotes | Models UI | additional credentials | Harness settings | NO | provider-specific | package/test providers | NO | NO | NO | DEFERRED | not in V1.0 Master Goal; aligned with later multi-model direction | not part of V1.0 acceptance | 1.2 candidate | NOT_SCHEDULED in V1.0 | P0-2 D; Version Roadmap |
| MOD-08 | Reasoning-effort selection | user chooses a supported model reasoning effort per session | session model selection + ui-model-selection | Host+Client | YES when model advertises efforts | host-owned | `session.selectModel` selection payload | model picker | authenticated carrier | durable model-selection projection | NO | none | retain optional picker field | NO | NO | NO | OPTIONAL | model route selection is core; fine-grained effort is an enhancement | non-blocking; if present, supported effort persists for that session | 1.x | NOT_SCHEDULED; if approved P5 | ui-model-selection source |
| WS-01 | Workspace create from directory | user adds an existing directory as workspace | workspace + workspace-controller | Host+Client | YES | N/A | `workspace.create` | workspace UI | authenticated filesystem authority | workspace storage | NO | Windows path rules | retain flow through Desktop picker | NO | YES | NO | REQUIRED | first half of core coding path | choose directory and create canonical workspace entry | 1.0 | P4/P5; deps P2/P3 | P0-3 D |
| WS-02 | Workspace list/follow | user sees known workspaces and sessions | `workspace/follow` | Host+Client | YES | N/A | snapshot stream | sidebar/store | authenticated stream | Host workspace storage | NO | paths | reconnecting snapshot UI | YES | YES | NO | REQUIRED | navigation cannot function without it | list appears from authoritative baseline and refreshes after reconnect | 1.0 | P4/P5; deps P3 | P0-3 E |
| WS-03 | Workspace select | user changes current workspace | Client workspace store | Client | YES | N/A | client-local selection over Host baseline | workspace UI | trusted Client projection | Desktop preference optional | NO | none | Electron routing/state | NO | NO | NO | REQUIRED | normal multi-workspace use | selecting one workspace scopes visible sessions and new session cwd | 1.0 | P4/P5 | P0-3 D |
| WS-04 | Existing-directory picker | user selects a Windows folder without typing a path | directory-picker auto/native/browse | Host+Client | YES | N/A | `directoryPicker.pick/list/createDirectory` | workspace picker UI | carrier auth; no Host per-call locality ACL | none | current browse Web presentation | Windows `IFileOpenDialog`/equivalent | replace bind-host inference with documented Desktop behavior | YES | YES | NO | REQUIRED | workspace selection is a core path | native picker or documented Desktop equivalent returns valid Host path; cancel is safe | 1.0 | P4/P5; deps P0.S-4 | P0-3 L; P0-4 Q |
| WS-05 | Workspace rename | user changes workspace display name | workspace-controller | Host+Client | YES | N/A | `workspace.rename` | workspace UI | authenticated carrier | workspace storage | NO | none | retain optional UI | NO | NO | NO | OPTIONAL | useful organization, not needed for core loop | absence does not block V1.0; if present rename survives reload | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D |
| WS-06 | Workspace archive/delete/reorder | user curates workspace/session ordering | workspace-controller | Host+Client | YES | N/A | delete/archive/insert operations | sidebar UI | authenticated carrier | workspace storage | NO | none | retain selected controls | NO | NO | NO | OPTIONAL | management convenience after core navigation | not release blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D |
| WS-07 | Open/reveal workspace path | user opens a produced path in Windows shell | session controller/native open | Host+Client | YES | N/A | can/open workspace path | deliverables/UI | privileged Client + carrier | none | NO | Explorer/native shell | allowlisted Main bridge or Host action | NO | NO | NO | OPTIONAL | convenience only | if present, only workspace-contained valid path opens | 1.x | NOT_SCHEDULED; if approved P4/P5 | P0-3 D; P0-4 H |
| SES-01 | Session create | user creates standard Agent session in selected workspace | session controller + agent presets | Host+Client | YES | standard selected | `session.create` | composer/sidebar | authenticated carrier | JSONL | NO | path cwd | retain creation UI | YES | YES | NO | REQUIRED | core Agent loop entry | new session uses selected workspace and standard preset | 1.0 | P5; deps P2/P3/P4, P0.S-1 | P0-3 D |
| SES-02 | Session list | user sees persisted sessions | projection/cache + workspace follow | Host+Client | YES | N/A | workspace/control snapshots | sidebar | authenticated stream | JSONL/projection cache | NO | none | reconnect-aware list | YES | YES | NO | REQUIRED | Master Goal explicitly requires list | existing and newly created sessions appear without Desktop-owned truth | 1.0 | P4/P5/P6A | P0-3 D/E |
| SES-03 | Session history and live follow | opening a session shows prior and new records | session page/follow/journal | Host+Client | YES | N/A | `session.page/follow` | conversation assembler | authenticated stream | JSONL | NO | none | preserve cursor/gap repair | YES | YES | NO | REQUIRED | conversation truth and reconnect depend on it | durable history renders, new chunks append once, gaps repair | 1.0 | P4/P5/P6A; deps P3 | P0-3 E/F |
| SES-04 | Persisted cold session open | user opens an old session without Desktop resume authority | session controller Client adapter | Host+Client | YES | N/A | open/follow composition; no `session.open` Remote | session UI | authenticated carrier | JSONL | NO | none | selection only | YES | YES | NO | REQUIRED | Master Goal requires cold open | after Worker restart, selecting persisted session renders history | 1.0 | P6A; deps P2-P5 | P0-3 G |
| SES-05 | Session continue/Host resume | sending to cold session causes Host-owned resume | Host session resolver/agents | Host | YES | inherited preset | `session.prompt`; Host `agents.resume` | normal prompt UI | authenticated carrier | JSONL seed | NO | none | Desktop must not add resume RPC | YES | YES | NO | REQUIRED | preserves Worker authority | prompt on cold session resumes once on Host and completes normally | 1.0 | P6A; deps P2/P3/P5 | P0-3 G |
| SES-06 | Active-turn stop/cancel | user stops current Agent turn | session controller/agent cancel | Host+Client | YES | N/A | `session.cancel` | stop control | authenticated carrier | cancellation audit/state | NO | subprocess/tool signals | retain explicit cancel action | YES | YES | NO | REQUIRED | safety and control requirement | stop reaches Host, active work is cancelled once, UI settles truthfully | 1.0 | P5; deps P3/P4, P0.S-4 | P0-3 H |
| SES-07 | Session persistence | completed and interrupted session records survive process restart | session-persistence-jsonl | Host | YES | host-owned | session persistence seam | projection reads | Worker filesystem authority | `$DSH_HOME/sessions` JSONL | NO | Windows filesystem | controlled `DSH_HOME` | YES | YES | NO | REQUIRED | explicit Master Goal | prompt/response persists and reopens after normal Worker restart | 1.0 | P2/P6A/P7 | P0-2 I; Master Goal |
| SES-08 | Generated/fallback session title | session list shows a readable generated title | session-title + first-prompt title | Host+Client | YES | host-owned | title projection | sidebar | authenticated carrier | session events | NO | none | reuse title projection | NO | NO | NO | OPTIONAL | session IDs/fallback labels can sustain core navigation | non-blocking; if present, generated title persists | 1.x | NOT_SCHEDULED; if approved P5 | P0-2 D |
| SES-09 | Session fork | user branches an existing session | session controller | Host+Client | YES | N/A | `session.fork` | session UI | authenticated carrier | new JSONL lineage | NO | none | Desktop action | NO | NO | NO | OPTIONAL | advanced exploration, not basic loop | absence does not block core release | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D |
| SES-10 | Session/content search | user searches session content | session-query-sqlite/query UI | Host+Client | mounted but `openAt: never` | NO | `session.search`/query index | search UI | authenticated carrier | optional SQLite/index | NO | possible native SQLite | choose durable index if retained | NO | NO | NO | OPTIONAL | useful history navigation, disabled by default upstream | not release blocking | 1.x | NOT_SCHEDULED; if approved P5/P6A | P0-2 I; P0-3 D |
| SES-11 | Active-turn queue/steer management | user queues, edits, removes or steers prompts while a turn is active | session controller/control projection | Host+Client | YES | N/A | `session.prompt`, `session.updateQueue`, `session.control` | composer/queue UI | authenticated carrier | control state/session records | NO | none | retain optional busy-turn UI | NO | NO | NO | OPTIONAL | improves concurrent interaction but user may wait for turn settlement | non-blocking; if present, queued prompt runs later, steer reaches the active turn's next step, edit/remove affect only the selected pending item, and reconnect restores the Host queue baseline | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D/E |
| SES-12 | Manual session rename | user changes a session display title | session controller | Host+Client | YES | N/A | `session.rename` | sidebar | authenticated carrier | session event/metadata | NO | none | retain optional action | NO | NO | NO | OPTIONAL | organizational convenience | non-blocking; if present, rename persists | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D |
| REF-01 | File-reference completion | user/Agent resolves workspace file mentions | file-reference provider | Host+Client | YES | standard can consume context | `fileReferences.list` | reference completion UI | workspace-root policy | none | NO | Windows paths | package optional completion | NO | NO | NO | OPTIONAL | accelerates context selection but is not core file-tool execution | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D |
| REF-02 | Session-reference completion | user resolves mentions of other sessions | session-reference resolver | Host+Client | YES | NO explicit tool | `sessionReferenceResolver.candidates` | reference completion UI | authenticated carrier | session index | NO | none | package optional completion | NO | NO | NO | OPTIONAL | advanced cross-session context | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 D |

### C.2 Conversation, tools, permissions and settings

| FeatureId | Feature | UserVisibleBehavior | UpstreamPackageOrComponent | UpstreamPlane | EnabledInCurrentWeb | EnabledInStandardPreset | RemoteOrContractDependency | ClientDependency | TrustDependency | PersistenceDependency | BrowserTransportDependency | WindowsDependency | RequiresDesktopAdaptation | RequiresP0SSpike | ArchitectureDependencyRequired | IS_SHACO_AUTOMATION_DOMAIN | Classification | WhyClassification | V1_0AcceptanceBehavior | FutureVersion | ImplementationPhase | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CONV-01 | Text prompt | user sends text to active session | session prompt/agent loop | Host+Client | YES | YES | `session.prompt` | composer | authenticated carrier | durable events | NO | none | retain composer | NO | YES | NO | REQUIRED | fundamental Agent loop | prompt is accepted once and starts one turn | 1.0 | P5; deps P2-P4 | P0-3 D |
| CONV-02 | Assistant streaming | partial assistant output appears live | session journal/follow | Host+Client | YES | YES | `session.follow` AsyncIterable | conversation UI | authenticated stream | append-only log | WebSocket today | none | carrier stream adapter | YES | YES | NO | REQUIRED | fundamental usability | ordered chunks render and complete/error exactly once | 1.0 | P3/P5 | P0-3 E |
| CONV-03 | Durable conversation history | user/assistant/tool records remain visible | session log/projection | Host+Client | YES | YES | follow/page | chat renderer | authenticated carrier | JSONL | NO | none | packaged Client nodes | YES | YES | NO | REQUIRED | Master Goal durability | completed history is identical after Desktop and Worker restart | 1.0 | P5/P6A | P0-3 E/G |
| CONV-04 | Tool call/result projection | user sees tool intent, progress and result | ui-tool/ui-chat session records | Client | YES | tool-dependent | journal schemas | tool cards/fallback | trusted module bytes | JSONL records | NO | tool-specific | package required renderers | YES | YES | NO | REQUIRED | user must understand Agent actions | shell/fs tool call and result appear in correct turn without duplication | 1.0 | P4/P5; deps P0.S-6 | P0-3 E/N |
| CONV-05 | Error and reconnect projection | failures are visible and distinguish retryable transport state | current error surfaces | Host+Client | YES | N/A | RPC/stream/session errors | error/reconnect UI | carrier error integrity | session errors when durable | HTTP codes today | none | map Web transport errors to Desktop states | YES | YES | NO | REQUIRED | truthful projection is a Master Goal | business failure, cancellation, carrier loss and reconnect are not shown as success | 1.0 | P3/P4/P5/P6A | P0-3 O |
| CONV-06 | Image prompt input | user attaches an image and supported model can inspect it | attachment-local + ui-attachment | Host+Client | YES | models may accept | prompt JSON/base64; attachment read | image attachment UI | authenticated carrier | attachment store | NO exact Fetch; browser file input UI | Windows file dialog/drop | Desktop image admission | NO | YES | NO | OPTIONAL | valuable multimodal feature but not core coding loop | if present, image persists and reopens; absence non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-2 D/G; P0-3 K |
| CONV-09 | Generic non-image file attachments | user attaches arbitrary files directly to a prompt | no corresponding generic upload/product route in frozen composition | N/A | NO | NO | multipart/generic upload route NOT_PRESENT | none | would require bounded trusted bytes | undefined | N/A | Windows file selection | new product contract would be required | NO | NO | NO | DEFERRED | frozen product supports image attachments and file references, not generic attachment upload | excluded from V1.0 core | later | later | P0-3 K |
| CONV-07 | Produced-file deliverables | user sees/open files produced by a turn | ui-deliverables | Client | YES | tool-derived | session records/path capability | turn tail UI | local-path authorization | session records | NO | Explorer | allowlisted open action | NO | NO | NO | OPTIONAL | convenience projection | absence does not block core file editing | 1.x | NOT_SCHEDULED; if approved P4/P5 | P0-2 G |
| CONV-08 | Trajectory inspection | user inspects detailed execution ledger | ui-trajectory | Client | YES | N/A | session records | trajectory pane | authenticated history | JSONL | NO | none | package optional module | NO | NO | NO | OPTIONAL | advanced diagnostics, not daily core loop | not release blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-2 G |
| TOOL-01 | Windows PowerShell `pwsh` | Agent executes Windows commands | tool-pwsh + pwsh-sandbox | Host agent | YES via standard | YES on win32 | tools registry/subprocess | generic tool UI | permission/sandbox/approval | tool records | NO | PowerShell, Windows ACL sandbox | package helper paths | YES | YES | NO | REQUIRED | Windows coding requires shell | bounded foreground command returns collected output, obeys workspace policy and cancels safely; incremental background output is OPTIONAL Jobs scope | 1.0 | P2/P5/P7; deps P0.S-1/-7 | standard YAML; P0-2 I |
| TOOL-02 | POSIX `bash` | Agent executes Bash | tool-bash/bash-sandbox | Host agent | disabled on win32 | disabled on win32 | tools registry | generic tool UI | sandbox | tool records | NO | unavailable as V1.0 Windows promise | none | NO | NO | NO | NOT_PRODUCT | Windows product does not promise WSL/POSIX runtime | not in V1.0 acceptance | none | none | standard YAML |
| TOOL-03 | `read` | Agent reads text/files under policy | tool-fs | Host agent | YES | YES | tools/fs/sandbox | tool UI | permission/sandbox | records only | NO | Windows paths | none beyond packaging | YES | YES | NO | REQUIRED | core coding operation | read permitted workspace file; denied path follows policy | 1.0 | P2/P5 | standard YAML |
| TOOL-04 | `write` | Agent creates/replaces files under policy | tool-fs | Host agent | YES | YES | tools/fs/sandbox | tool UI | permission/approval | filesystem + records | NO | Windows ACL | none beyond packaging | YES | YES | NO | REQUIRED | core coding operation | workspace write succeeds; protected write requests approval or fails safely | 1.0 | P2/P5 | standard YAML |
| TOOL-05 | `edit` | Agent applies bounded edits | tool-fs | Host agent | YES | YES | tools/fs/sandbox | tool UI | permission/approval | filesystem + records | NO | Windows paths | none | YES | YES | NO | REQUIRED | core coding operation | exact edit changes intended file and reports mismatch safely | 1.0 | P2/P5 | standard YAML |
| TOOL-06 | `grep` | Agent searches file content | tool-fs-search | Host agent | YES | YES | tools/fs | tool UI | sandbox roots | none | NO | Windows path/process | none | YES | YES | NO | REQUIRED | efficient repository discovery | content search returns bounded results and honors cancellation | 1.0 | P2/P5 | standard YAML |
| TOOL-07 | `glob` | Agent searches file names | tool-fs-search | Host agent | YES | YES | tools/fs | tool UI | sandbox roots | none | NO | Windows paths | none | YES | YES | NO | REQUIRED | efficient repository discovery | filename search returns bounded deterministic result set | 1.0 | P2/P5 | standard YAML |
| TOOL-08 | `read_image` | Agent reads local image content | tool-fs | Host agent | YES | YES | tool + model image capability | tool UI | sandbox | optional attachment/model | NO | image codecs/path | retain only if image scope retained | NO | NO | NO | OPTIONAL | image capability is not required for text coding baseline | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML |
| TOOL-09 | `todo_write` | Agent publishes task progress | tool-todo | Host agent | YES | YES | tool/session records | todo renderer | normal tool trust | session records | NO | none | package renderer | NO | NO | NO | OPTIONAL | workflow aid, not core Agent loop | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML |
| TOOL-10 | `ask_user_question` | Agent asks structured blocking questions and receives answer | tool-ask-user + user-questions | Host+Client | YES | YES | `$events` waterfall/result | question composer | authenticated event answer | tool result/history; pending Gateway memory | Web mux today | none | Desktop event UI | YES | YES | NO | REQUIRED | standard Agent needs user-owned decisions; owner direction confirmed | question renders, one answer settles once, carrier reconnect redelivers pending request | 1.0 | P3/P4/P5; deps P0.S-4 | P0-3 J |
| TOOL-11 | `web_search` | Agent searches public web | tool-web + DeepSeek search provider | Host agent | YES | YES | tools/web provider | tool card | provider/network policy | records | NO browser GUI dependency | network | retain Host provider | NO | NO | NO | OPTIONAL | useful research enhancement, not workspace coding minimum | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML; P0-2 D |
| TOOL-12 | `web_fetch` | Agent fetches public web content | tool-web + web-fetch-http | Host agent | YES | YES | tools/web provider | tool card | SSRF/public-address policy | records | NO browser GUI dependency | network | retain Host provider | NO | NO | NO | OPTIONAL | enhancement outside core local coding loop | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML |
| TOOL-13 | Background jobs (`job_output`, `job_list`, `job_kill`) | Agent supervises long-running shell work | jobs-local + tool-jobs | Host agent | YES | YES | jobs registry/tools | jobs header optional | parent Agent ownership | process-local registry + session view | NO | subprocess | package controls | NO | NO | NO | OPTIONAL | improves long builds but core can run foreground commands | non-blocking; if retained, `job_list` lists only owned jobs, `job_output` returns bounded output for the addressed job, and `job_kill` stops only that job | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML |
| TOOL-14 | Skills (`skill`) | Agent discovers and loads reusable instructions | skill-filesystem + tool-skill | Host agent | YES | YES | skill registry/list | skill mentions/UI | trusted roots | filesystem skill files | NO | paths | define packaged/user roots later | NO | NO | NO | OPTIONAL | advanced extensibility, not required to complete core task | non-blocking | 1.x | NOT_SCHEDULED; if approved P5/P6B | standard YAML |
| TOOL-15 | Goal tools (`get_goal`, `create_goal`, `update_goal`) | Agent reads, creates or updates a Harness session goal | goal + tool-goal | Host agent | YES | YES | goal Remote/events | goal bar | normal tool trust | session log | NO | none | none for V1.0 | NO | NO | NO | DEFERRED | not Shaco Automation domain; advanced long-running workflow | all three names are excluded from V1.0 core | 1.1 evaluation | later | standard YAML; Product Vision |
| TOOL-16 | Plan mode | user/Agent enters read-only planning workflow | plan-mode + ui-plan | Host+Client | YES | YES | `/plan`, `exit_plan_mode`, question review | plan seat | mode/approval semantics | session events | NO | none | retain optional UI | NO | NO | NO | OPTIONAL | useful advanced workflow, not required for basic Agent loop | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML |
| TOOL-17 | Compaction | user/Agent compacts long history | compaction-basic + `/compact` | Host+Client | YES | YES | command/session records | chat projection | normal carrier | durable summary/checkpoint | NO | none | retain optional control | NO | NO | NO | OPTIONAL | long-session enhancement; core release can remain within context limits | non-blocking | 1.x | NOT_SCHEDULED; if approved P5/P6A | standard YAML |
| TOOL-18 | Workflow | Agent runs isolated workflow graph | workflow-worker-thread + tool-workflow | Host agent | YES | YES | workflow/session records | workflow renderer | tool/subagent trust | session records | NO | worker threads | none for V1.0 | NO | NO | NO | DEFERRED | advanced automation-like capability, not Shaco Automation authority | excluded from V1.0 core | 1.1 evaluation | later | standard YAML |
| TOOL-19 | Ralph loop | Agent iterates subagents for multiple rounds | tool-ralph | Host agent | YES | YES | subagent/workflow | generic tool UI | broad delegated authority | session records | NO | child runtime | none for V1.0 | NO | NO | NO | DEFERRED | advanced multi-agent workflow | excluded from V1.0 core | 1.1/1.2 evaluation | later | standard YAML |
| PERM-01 | Permission preset visibility/selection | user sees and selects current policy | permission-presets + ui-permission | Host+Client | YES | host-owned | projection + `/permission` | permission picker | authenticated command | durable session events/settings default | NO | Windows sandbox modes | retain picker | YES | YES | NO | REQUIRED | required safety control | current and all shipped choices render; change applies to one session | 1.0 | P4/P5; deps P2/P3 | base YAML; P0-3 D |
| PERM-02 | `read-only` preset | writes are denied/escalated while reads remain | sandbox-policy/permission | Host | YES | host-owned | permission projection | picker | sandbox/approval | session events | NO | Windows ACL sandbox | preserve mapping | YES | YES | NO | REQUIRED | explicit safe operating mode | selecting read-only blocks unapproved writes and is visibly active | 1.0 | P2/P5/P7 | base YAML |
| PERM-03 | `workspace-write` preset | writes inside workspace, wider effects ask | sandbox/approval | Host | YES default | host-owned | permission projection | picker | sandbox/approval | session events | NO | Windows ACL sandbox | preserve mapping | YES | YES | NO | REQUIRED | normal default coding policy | workspace writes succeed; wider operations request approval | 1.0 | P2/P5/P7 | base YAML |
| PERM-04 | `danger-full-access` preset | user explicitly allows unconstrained local effects | sandbox/permission | Host | YES | host-owned | `/permission` | confirmed picker | high-risk authenticated action | session events | NO | Windows process authority | confirmation/clear warning | YES | YES | NO | REQUIRED | upstream shipped policy and truthful safety UI | explicit selection changes projection and behavior; no silent activation | 1.0 | P4/P5/P7 | base YAML; ui-permission |
| PERM-05 | Approval request/Allow/Reject | protected operation pauses for user decision | user-approval + ui-approval | Host+Client | YES | host-owned | `$events` waterfall/result | approval card | authenticated first-result settlement | asked/decided audit records | Web mux today | none | Desktop event UI | YES | YES | NO | REQUIRED | core safety round-trip | request displays; allow/reject settles once; duplicate result cannot decide twice | 1.0 | P3/P4/P5 | P0-3 I |
| PERM-06 | Pending approval across Desktop reconnect | pending request reappears after carrier generation loss while Worker lives | Gateway pending events | Host+Client | YES | N/A | stable eventId/new `$events` generation | approval store | reconnect re-auth | Gateway memory; audit log after settlement | Web mux today | none | preserve generation behavior | YES | YES | NO | REQUIRED | Desktop close/crash must not lose live interaction | disconnect/reopen redelivers same pending decision without replaying an answer | 1.0 | P6A; deps P3/P4 | P0-3 I/Q |
| SET-01 | Settings UI | user views required model/provider/product settings | settings controller + ui-settings | Host+Client | YES | N/A | `settings.describe/update/replace/mutate` | settings pages | trusted Client capability | `settings.yaml` | current loopback classifier | Windows file ACL/path | trusted Desktop classification | YES | YES | NO | REQUIRED | provider/model setup and product usability require it | required sections load redacted schema and valid edits report errors | 1.0 | P4/P5; deps P0.S-2 | P0-4 I |
| SET-02 | Persistent settings | setting survives Desktop and Worker restart | settings-file/ui-settings | Host+Client | YES on loopback | N/A | Settings Remote | settings mirror/scope | must not fall to memory mode | `$DSH_HOME/settings.yaml` | current page-host loopback | Windows filesystem | authoritative Desktop capability signal | YES | YES | NO | REQUIRED | required settings are not useful if ephemeral | write setting, restart Desktop/Worker, reload same value; mode is not memory | 1.0 | P4/P6A/P7; deps P0.S-2 | P0-4 I/W |
| SET-03 | Provider/model settings | user configures required DeepSeek route/defaults | settings + LLM adapters | Host+Client | YES | N/A | Settings/LLM Remotes | models settings | authenticated carrier/redaction | `settings.yaml` | NO logical | none | retain required cards only | YES | YES | NO | REQUIRED | first-run provider behavior | saved supported model/provider setting affects later catalog/session creation | 1.0 | P4/P5 | P0-2 D; P0-3 D |
| SET-04 | Open Settings document/preset directory | user opens Harness-owned config locations in native shell | settings controller native-open methods | Host+Client | YES when capability available | N/A | `openSettingsDocument`, `can/openAgentPresetDirectory` | settings UI | privileged native-open boundary | settings/preset files | NO logical | Explorer/native shell | allowlisted Main bridge or retained Host action | NO | NO | NO | OPTIONAL | expert convenience, not required for in-app settings | non-blocking; if present, only intended Harness paths open | 1.x | NOT_SCHEDULED; if approved P4/P5 | P0-3 D; P0-4 O |
| CRED-01 | Credential configured state | UI shows configured/source/writable only | credentials controller | Host+Client | YES | N/A | `credentials.describe` | provider card | authenticated carrier | credential sources | NO | Windows ACL | retain status UI | NO | NO | NO | REQUIRED | first-run diagnosis | state changes after set/unset and never contains plaintext | 1.0 | P4/P5 | P0-4 P |
| CRED-02 | Set/unset credential | user can securely write and remove key | credentials-local/controller | Host+Client | YES | N/A | `credentials.set/unset` | secret form | Renderer/Main/Worker boundary | `.credentials.yaml` | NO | Windows ACL | allowlisted secret submission | YES | YES | NO | REQUIRED | Master Goal provider setup | set enables provider; unset removes managed value; shadowed env is read-only | 1.0 | P4/P5/P7 | P0-4 P |
| CRED-03 | Plaintext secret never reads back | Desktop cannot retrieve stored key | credentials projection | Host+Client | YES | N/A | no Remote record-read | all Client UI | carrier and redaction | Host-owned | NO | filesystem protection | preserve response contract | YES | YES | NO | REQUIRED | security invariant | inspect all credential responses/logs; no plaintext is returned | 1.0 | P3/P4/P7/P8 | P0-4 P |

### C.3 Presets, subagents, lifecycle and secondary product capabilities

| FeatureId | Feature | UserVisibleBehavior | UpstreamPackageOrComponent | UpstreamPlane | EnabledInCurrentWeb | EnabledInStandardPreset | RemoteOrContractDependency | ClientDependency | TrustDependency | PersistenceDependency | BrowserTransportDependency | WindowsDependency | RequiresDesktopAdaptation | RequiresP0SSpike | ArchitectureDependencyRequired | IS_SHACO_AUTOMATION_DOMAIN | Classification | WhyClassification | V1_0AcceptanceBehavior | FutureVersion | ImplementationPhase | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PRE-01 | Shipped `standard` preset | new core sessions receive full coding composition | agent-presets/standard | Host agent | YES default | self | preset roster/session create | preset metadata optional | shipped-root trust | preset files + session choice | NO | platform tool gates | Worker composition | YES | YES | NO | REQUIRED | core tools live in preset, not Web Host root | standard session exposes the frozen REQUIRED tool subset and no disabled external provider | 1.0 | P2/P5; deps P0.S-1 | standard YAML |
| PRE-02 | Preset list/select | user chooses among shipped presets | agent-presets Remote + ui-agent-preset | Host+Client | YES | N/A | list/read/select | settings/picker | shipped/user preset trust | Harness settings/session | NO | none | retain optional UI | NO | NO | NO | OPTIONAL | fixed standard default is sufficient for V1.0 | non-blocking | 1.x | NOT_SCHEDULED; if approved P5/P6B | P0-3 D |
| PRE-03 | Preset copy/edit/delete | user authors custom presets | agent-presets authoring | Host+Client | YES | N/A | copy/delete/read plus filesystem authoring | settings/editor | arbitrary composition risk | Harness home preset files | NO | paths | substantial secure authoring UX | NO | NO | NO | DEFERRED | expands plugin/composition scope beyond core | excluded from V1.0 core | later | P6B later | P0-3 D; ADR-0005 |
| SUB-01 | Core in-process subagent spawn | Agent delegates bounded work to fresh child | subagent-spawn-in-process + tool-subagent | Host agent | YES | YES (`subagent`) | subagent service/tool | subagent projection | parent/preset/provider policy | child session records | NO | same Worker | preserve host composition | YES | YES | NO | REQUIRED | current full coding preset and owner direction | parent starts child, observes result/status, and main turn continues | 1.0 | P2/P5; deps P0.S-1/-4 | standard YAML; subagent README |
| SUB-02 | Continuable child list/control | Agent/user can list, message and interrupt live children | subagent control + Client Remotes | Host+Client | YES | YES (`send_message`, `interrupt_agent`, `list_agents`) | subagents list/prompt/interrupt | subagent UI | parent ownership/caller trust | Host memory/session records | NO | child work | package Client controls | YES | YES | NO | REQUIRED | standard spawn is configured continuable; uncontrolled required child is incomplete | `list_agents` shows only addressable children, `send_message` reaches the selected continuable child, and `interrupt_agent` interrupts only that child with truthful settlement | 1.0 | P3/P4/P5 | standard YAML; P0-3 D |
| SUB-09 | Continuable child report channel | child may send zero or more structured reports to its parent | tool-subagent-report | Host child scope | YES | installed for continuable children | child-to-parent report setup | parent result projection | child/parent identity and scope | child session/result | NO | same Worker | retain only with optional report surface | NO | NO | NO | OPTIONAL | continuable mode does not depend on report and report does not end the child turn or settle activation | non-blocking; if retained, every report reaches only the owning parent and does not terminate the child | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML comments; subagent README |
| SUB-03 | In-process fork/continuable | Agent forks completed parent history | subagent-fork-in-process + `subagent_fork` | Host agent | YES | YES | subagent provider | generic subagent UI | parent scope | child session | NO | same Worker | none | NO | NO | NO | OPTIONAL | advanced context reuse, not needed for core delegation | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML |
| SUB-04 | Subagent model selection | user/model selects route for fresh child | tool-subagent model settings | Host+Client | CONDITIONAL | CONDITIONAL (`modelSelectionSettings` plus policy/provider registration) | settings/model catalog | optional settings | provider/credential trust | settings | NO | none | retain optional control | NO | NO | NO | OPTIONAL | core child can inherit/default model; the helper tool is policy-gated | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | standard YAML; tool-subagent source |
| SUB-05 | Codex external subagent | spawn real Codex child | subagent-codex | capability child | package exists; tool disabled | NO | provider service | generic subagent UI | child executable/credential | provider-specific | NO | child process | package and lifecycle policy | NO | NO | NO | DEFERRED | V1.2 multi-model direction, disabled in standard | excluded from V1.0 | 1.2 | later | standard YAML; package |
| SUB-06 | Claude Code external subagent | spawn Claude Code child | subagent-claude-code | capability child | package exists; tool disabled | NO | provider service | generic subagent UI | child SDK/credential | provider-specific | NO | child process | package and lifecycle policy | NO | NO | NO | DEFERRED | V1.2 direction, disabled in standard | excluded from V1.0 | 1.2 | later | standard YAML; package |
| SUB-07 | ACP subagent | drive child over ACP | subagent-acp | capability child | not in Web/standard | NO | provider service | generic subagent UI | spawned ACP server | provider-specific | NO | child process | package and lifecycle policy | NO | NO | NO | DEFERRED | V1.2 direction; not default composition | excluded from V1.0 | 1.2 | later | subagent README/package |
| SUB-08 | DSH SDK subagent | drive child Harness over stdio SDK | subagent-dsh-sdk | capability child | not in Web/standard | NO | SDK JSON-RPC provider | generic subagent UI | child runtime identity | child Harness data | NO | child process | package/runtime policy | NO | NO | NO | DEFERRED | V1.2 direction; not default composition | excluded from V1.0 | 1.2 | later | subagent README/package |
| SUB-10 | Other external subagent provider | user selects another shipped provider | none in frozen subagent family | N/A | NO | NO | none | none | undefined | undefined | N/A | undefined | none | NO | NO | NO | NOT_PRODUCT | no other provider exists in the frozen baseline | no such option is advertised | none | none | subagent README |
| LIFE-01 | Desktop close while Worker continues | closing last window does not stop active Worker/turn | Shaco lifecycle | Product | NO | N/A | supervisor/connection detach | Electron Main | Worker identity | Worker/Harness | NO | Windows processes | new product behavior | YES | YES | NO | REQUIRED | Master Goal and ADR-0001/7 | close window, Worker PID/turn remain live, reopening reattaches | 1.0 | P6A; deps P2-P4, P0.S-5 | ADR-0001/7 |
| LIFE-02 | Desktop crash while Worker continues | abrupt UI death does not terminate Worker/Agent | Shaco lifecycle | Product | NO | N/A | carrier loss only | Electron | process separation | Worker/Harness | NO | Windows job/process ownership | new product behavior | YES | YES | NO | REQUIRED | Master Goal | kill Desktop; Worker and active Host state survive | 1.0 | P6A; deps P0.S-5 | Master Goal |
| LIFE-03 | Reopen/reconnect projection recovery | reopened Desktop reconstructs current truth | Connection generation + follow/page/baselines | Host+Client | YES reconnect semantics | N/A | ready/reset/journal/snapshot | all stores | fresh carrier trust | Host truth | Web reconnect today | none | Worker discovery and carrier reconnect | YES | YES | NO | REQUIRED | Desktop is projection, not authority | reopen attaches same Worker, clears stale state and rebuilds without duplicates | 1.0 | P6A; deps P3/P4 | P0-3 F/Q |
| LIFE-04 | Worker restart and persisted-session recovery | old sessions reopen after Worker process restart | JSONL + Host cold resolver | Host+Client | YES | inherited | session list/follow/prompt | session UI | new Worker trust/compat | JSONL | NO | process/filesystem | supervisor restart UX | YES | YES | NO | REQUIRED | Master Goal step 10 | restart Worker, reopen old session/history, continue through Host resume | 1.0 | P6A/P7 | P0-3 G; Master Goal |
| LIFE-05 | Desktop never explicitly resumes Agent | UI only opens/follows/prompts; Host owns cold resume | session controller | Contract invariant | YES | N/A | no `session.resume` Remote | session adapter | trusted carrier | Host session store | NO | none | avoid new RPC/authority | YES | YES | NO | REQUIRED | accepted authority boundary | trace shows no Desktop resume command and concurrent continuation deduplicates Host resume | 1.0 | P3/P4/P6A/P8 | P0-3 G |
| LIFE-06 | Transport disconnect does not cancel Host Agent | transient Desktop loss leaves turn running | Connection/session cancellation contract | Host+Client | YES | N/A | disconnect vs `session.cancel` | reconnect UI | carrier lifetime separate from Agent | Host session | Web socket today | none | preserve lifetime split | YES | YES | NO | REQUIRED | Desktop crash survival depends on it | drop carrier only; active Host turn remains until completion/explicit cancel | 1.0 | P3/P6A | P0-3 H/Q |
| LIFE-07 | Separate Close, Stop Worker and Exit | three user actions have distinct outcomes | Shaco lifecycle | Product | NO | N/A | supervisor | Electron menus/status | authorized lifecycle control | Worker state | NO | Windows processes | new native UX | YES | YES | NO | REQUIRED | ADR-0007 | Close keeps Worker; Stop ends Worker only; Exit drains Worker then closes Desktop | 1.0 | P4/P6A/P7 | ADR-0007 |
| OPT-01 | Export session ZIP | user saves one session tree as archive | session-log-export | Host+Client | YES | N/A | `/api/session.export` exact Fetch | export controller | authenticated byte path | reads sessions/attachments | YES current browser download | save dialog | Desktop save flow | NO for product; binary spike remains YES | YES | NO | OPTIONAL | useful support/export feature but not core loop | absence does not block V1.0; if present ZIP streams without full buffering | 1.x | NOT_SCHEDULED; if approved P5 | P0-3 K |
| OPT-02 | Harness Jobs UI | user sees background job status | ui-jobs | Client | YES | tools optional | session control projection | header UI | Agent ownership | process-local | NO | subprocess | package optional module | NO | NO | NO | OPTIONAL | enhancement; not Shaco Automation | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-2 G |
| OPT-03 | Plugin settings UI | user configures non-core in-box plugin sections | ui-settings-plugins/inventory | Client | YES | N/A | settings/plugin inventory | settings cards | module/config trust | settings | NO | none | retain only approved cards | NO | NO | NO | OPTIONAL | core model/settings path does not require full plugin UI | non-blocking | 1.x | NOT_SCHEDULED; if approved P5/P6B | P0-2 G |
| OPT-04 | Session stats | user views usage/stat summaries | session-stats UI/runtime | Host+Client | YES | N/A | projections | chat/sidebar | normal carrier | session records | NO | none | package optional UI | NO | NO | NO | OPTIONAL | informative only | non-blocking | 1.x | NOT_SCHEDULED; if approved P5 | P0-2 D |
| OPT-05 | Harness schedule/reminders | Agent schedules durable reminders | schedule package | Host agent | not in Web/standard | NO | schedule/session events | none default | tool/provider trust | session log | NO | timer | later composition | NO | NO | NO | DEFERRED | not current standard and not Shaco Automation authority | excluded from V1.0 | 1.1 evaluation | later | schedule package |
| OPT-06 | `/feedback` command | user records free-text session feedback | command-feedback | Host | YES | host-global | Commands Remote | generic command UI | privacy policy | session log | NO | none | no V1.0 surface | NO | NO | NO | DEFERRED | roadmap places feedback/experience in V1.3 | excluded from V1.0 core | 1.3 candidate | later | Version Roadmap; command-feedback source |
| OPT-07 | Per-message feedback | user likes/dislikes or annotates an assistant message | message-feedback + Client UI | Host+Client | YES | N/A | `messageFeedback.list/put/delete` | message action strip | privacy policy | storage domain | NO | none | no V1.0 surface | NO | NO | NO | DEFERRED | roadmap places feedback/experience in V1.3 | excluded from V1.0 core | 1.3 candidate | later | P0-2 G; P0-3 D |
| NP-01 | Session telemetry/data egress | session records may be exported to an OTLP endpoint | session-telemetry-otel | Host | YES in base (`FEEDBACK_ONLY`) | host-owned | telemetry backend | feedback disclosure only | explicit product privacy/consent boundary | upload cursor/session records | NO | network | disable from V1.0 official composition unless separately approved | NO | NO | NO | NOT_PRODUCT | enabled upstream transport is not a promised Shaco feature and raw session egress needs a separate privacy decision | V1.0 default emits no telemetry data | none | P2 composition/P7 verification | base YAML; P0-2 D |

### C.4 Plugin, Web transport, experimental and explicit exclusions

| FeatureId | Feature | UserVisibleBehavior | UpstreamPackageOrComponent | UpstreamPlane | EnabledInCurrentWeb | EnabledInStandardPreset | RemoteOrContractDependency | ClientDependency | TrustDependency | PersistenceDependency | BrowserTransportDependency | WindowsDependency | RequiresDesktopAdaptation | RequiresP0SSpike | ArchitectureDependencyRequired | IS_SHACO_AUTOMATION_DOMAIN | Classification | WhyClassification | V1_0AcceptanceBehavior | FutureVersion | ImplementationPhase | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PLG-01 | Required official in-box plugin composition | core Host/Client capabilities load as one reviewed release graph | base/web bundles + standard preset | Host+Client | YES | YES | Loader/profile/preset | required in-box modules | packaged provenance | Harness-owned config | current Web delivery | packaged native closure | freeze non-Web official graph | YES | YES | NO | REQUIRED | core behavior is implemented by in-box plugins | all REQUIRED modules activate from packaged reviewed artifacts | 1.0 | P2/P4/P6B/P7 | ADR-0005; P0-2 |
| PLG-02 | `tool-cordis` | Agent reads/mutates live Cordis composition | extensions/tool-cordis | Host agent | cordis preset only | NO | Cordis runner APIs | ui-cordis | dynamic-code authority | composition files | NO logical | none | no V1.0 adaptation | NO | NO | NO | DEFERRED | Dynamic Cordis is outside V1.0 core | excluded | later | later | P0-2 J |
| PLG-03 | `cordis-host-runner` | supports live dynamic Host inspect/run | extensions/cordis-host-runner | Host | YES | NO | dynamicCordisRunner Remotes | ui-cordis/client runner | dynamic host code | runtime state | current Remote transport | none | omit unless boot requires | YES | NO | NO | OPTIONAL | possible implementation dependency, not a product promise | absence accepted if P0.S-6 proves core boot | 1.x | P6B only if retained | P0-2 J; P0-3 D |
| PLG-04 | `cordis-client-runner` | executes dynamic Client half | extensions/cordis-client-runner | Client | YES | N/A | dynamic runner contract | Client Cordis | executable module provenance | runtime state | current module delivery | none | omit unless boot requires | YES | NO | NO | OPTIONAL | possible boot dependency only | absence accepted if P0.S-6 proves core boot | 1.x | P6B only if retained | P0-2 J |
| PLG-05 | `ui-cordis` | renders Cordis dynamic operations | client/ui-cordis | Client | YES | N/A | dynamic runner projections | ui-cordis | executable module provenance | none | current modules | none | omit unless boot requires | YES | NO | NO | OPTIONAL | possible renderer dependency only | absence accepted if P0.S-6 proves core boot | 1.x | P6B only if retained | P0-2 J |
| PLG-06 | Pinned reviewed npm plugin | user gains one explicitly approved external extension | plugin Loader/package inventory | Host+Client | possible, not default | NO | plugin-specific | plugin-specific | third-party code trust | plugin-specific | possible | possible native ABI | future explicit contract | NO | NO | NO | DEFERRED | official in-box baseline first | excluded from V1.0 core | later | later P6B | ADR-0005 |
| PLG-07 | Arbitrary npm plugin | user installs unrestricted npm code | Loader ecosystem | Host+Client | possible | NO | arbitrary | arbitrary | unrestricted code | arbitrary | possible | arbitrary | none | NO | NO | NO | NOT_PRODUCT | contradicts limited plugin baseline | no install surface | none | none | ADR-0005 |
| PLG-08 | Arbitrary GitHub plugin | user installs plugin source from GitHub | external plugin path | Host+Client | possible | NO | arbitrary | arbitrary | unrestricted source/code | arbitrary | possible | arbitrary | none | NO | NO | NO | NOT_PRODUCT | explicitly out of Master Goal | no install surface | none | none | Master Goal |
| PLG-09 | Plugin marketplace | user browses/installs third-party extensions | not a frozen core component | Product | NO | NO | undefined | undefined | supply-chain/consent | undefined | possible | none | none | NO | NO | NO | NOT_PRODUCT | explicitly out of scope | no marketplace UI | none | none | Master Goal |
| PLG-10 | Dynamic plugin installation | runtime installs/enables arbitrary code | Loader/Dynamic Cordis mechanisms | Host+Client | mechanisms exist | NO | dynamic runner/Loader | plugin UI | privileged code execution | composition files | possible | native ABI | none | NO | NO | NO | NOT_PRODUCT | exceeds V1.0 trust and upgrade contract | no dynamic install action | none | none | ADR-0005 |
| WEB-01 | HTTP WebServer | browser reaches Harness through local HTTP | host-webserver | Host | YES | N/A | Web route registration | browser | bind/Host/Origin/cookie | none | YES | sockets | remove from primary composition | YES as host-profile proof | YES replacement | NO | WEB_ONLY | physical Web transport artifact | primary Desktop core works without it or approved fallback | fallback only | P2/P3 removal | P0-2 H |
| WEB-02 | Web runtime / SPA server | serves frontend dist and browser shell | web-app/frontend-static | Host+Client | YES | N/A | index/static routes | browser app | BrowserAuth index | static assets | YES | none | package Electron shell | YES | YES replacement | NO | WEB_ONLY | browser shell, not Desktop feature | packaged Client starts without SPA server | fallback only | P4/P7 | P0-2 H; P0-4 M |
| WEB-03 | Browser opener | OS browser opens token URL | web-app `openBrowser` | Host | YES | N/A | startup URL | external browser | bearer URL handoff | none | YES | Windows browser | remove | NO | NO | NO | WEB_ONLY | Electron owns window lifecycle | no external browser required | none | P4 | P0-2 H |
| WEB-04 | Launch-token URL | first navigation carries process token | client-connection BrowserAuth | Host+Browser | YES | N/A | authenticatedUrl/authorizeIndex | browser | bearer token | process memory | YES | none | replace trust guarantee | YES | YES replacement | NO | WEB_ONLY | browser bootstrap only | no token appears in Desktop navigation URL | fallback only | P3/P7 | P0-4 D |
| WEB-05 | BrowserAuth cookie flow | browser session authenticates API/mux | client-connection BrowserAuth | Host+Browser | YES | N/A | requestRejection | browser cookie jar | authority-bound HMAC bearer | credentials file secret | YES | none | replace as product identity | YES | YES replacement | NO | WEB_ONLY | not Windows-user/Worker identity | primary carrier authenticates without browser cookie | fallback only | P3/P7 | P0-4 E |
| WEB-06 | `trustedHosts` UI/config | Web authority fence permits configured host | web runtime/startup | Host | YES | N/A | request trust | browser | Host/Origin fence | settings/CLI | YES | network | omit primary UI | NO | NO | NO | WEB_ONLY | only meaningful for HTTP authority | no LAN/trusted-host product control | fallback only | P3 | P0-4 F |
| WEB-07 | LAN browser serving | user connects from another machine/browser | custom Web composition | Host+Browser | stock CLI rejects all-interface | N/A | Web routes | browser | network/browser auth | Host data | YES | firewall/network | none | NO | NO | NO | WEB_ONLY | not a V1.0 product mode | unavailable | none | none | P0-4 F |
| WEB-08 | Client HMR / `dev:web` | browser reloads rebuilt module graph | client-hmr | Host+Browser | mounted/dev active | N/A | `/plugins/events` SSE | EventSource/module loader | public dev route | none | YES | dev toolchain | omit packaged release | YES omission proof | NO | NO | WEB_ONLY | development transport | no HMR route/process in package | none | P4/P7 | P0-2 H |
| WEB-09 | Token cleanup redirect | browser removes token query after cookie issue | BrowserAuth authorizeIndex | Host+Browser | YES | N/A | index 303 | browser navigation | token hygiene | none | YES | none | remove | NO | NO | NO | WEB_ONLY | browser-only navigation hygiene | no equivalent user feature | fallback only | P3 | P0-4 D |
| WEB-10 | `/plugins` combo/source-map routes | browser loads Host-composed Client bytes | client-modules | Host+Browser | YES | N/A | GET/HEAD routes | script loader | public code route/graph provenance | revision cache | YES | none | packaged/alternate trusted bytes | YES | YES replacement | NO | WEB_ONLY | current delivery only | required Client graph loads without public route | fallback only | P4/P7 | P0-3 N; P0-4 M |
| WEB-11 | Browser anchor export download | browser HEAD then anchor saves ZIP | session-log-export Client | Client | YES | N/A | `/api/session.export` | browser download | BrowserAuth | output file | YES | browser download | optional native save flow | NO product gate | NO | NO | WEB_ONLY | current delivery is browser-specific | no required V1.0 behavior | 1.x optional replacement | P4/P5 if approved | P0-3 K |
| EXP-01 | Agent Teams | user coordinates experimental team agents | packages/experimental/agent-team* | Host+Client | separate experimental profiles | NO | experimental contracts | experimental UI | broad agent authority | experimental | possible | child runtime | none | NO | NO | NO | EXPERIMENTAL | upstream path explicitly experimental | excluded | none | none | package paths |
| EXP-02 | Inspector | developer inspects internal execution realms | packages/experimental/inspector | Dev | development mount | NO | inspector protocols | dev UI | privileged diagnostics | none | possible | none | none | NO | NO | NO | EXPERIMENTAL | developer-only experimental surface | excluded | none | none | package path |
| EXP-03 | WebWorker runtime/packer | browser-owned Worker hosts experimental runtime | packages/experimental/webworker-* | Browser Worker | separate experimental composition | NO | direct FetchHandler/wireStream | browser | owner assertion | worker memory | YES | none | evidence only | NO | NO | NO | EXPERIMENTAL | not cross-process Desktop proof | forbidden production dependency | none | none | P0-4 N |
| EXP-04 | E2B execution | tools run against remote E2B fs/subprocess | packages/e2b/* | External runtime | not default | NO | fs/subprocess seams | generic UI | external service credential | remote environment | NO | network | none | NO | NO | NO | EXPERIMENTAL | incompatible with local Windows core and non-default | excluded | none | none | e2b packages |
| EXP-05 | PTC/code-runtime presentation | Agent invokes code-runtime presentation | ptc preset + code-runtime worker-thread | Host agent | code runtime mounted; PTC non-default | NO | tools presentation/runtime | PTC UI | code execution trust | runtime state | NO | worker thread | none | NO | NO | NO | EXPERIMENTAL | temporary/non-default mode seam | excluded | none | none | P0-2 D/E |
| NP-02 | Test-support/replay/mock capabilities | developers run deterministic fixtures | packages/test-support | Test | test only | NO | test contracts | none | not production | fixture data | NO | dev toolchain | none | NO | NO | NO | NOT_PRODUCT | forbidden production seam | absent from package composition | none | none | Harness Integration Boundary |
| NP-03 | Developer diagnostics/internal dev UI | developers inspect failures/build state | runtime-diagnostics/dev surfaces | Dev | development only | NO | diagnostics | dev UI | privileged internal data | logs | possible | dev toolchain | none | NO | NO | NO | NOT_PRODUCT | evidence tooling, not user parity | absent from product navigation | none | P7 may expose separate safe diagnostics only | source inventory |
| NP-04 | Shaco Automation domain | future durable AutomationDefinition/Run/Task/Step/Attempt | not implemented | Future Product | NO | NO | future Shaco contract | future UI | future trust | future Shaco DB | NO | future | none in V1.0 | NO | NO | YES | NOT_PRODUCT | not a Harness parity capability | absent from V1.0 | 1.1 future product | future roadmap | Product Vision |
| NP-05 | Multi-Agent Council/deliberation | future planner/reviewer/council product | not implemented | Future Product | NO | NO | future Shaco contract | future UI | future capability children | future product data | NO | future | none in V1.0 | NO | NO | YES | NOT_PRODUCT | not current Harness parity | absent from V1.0 | 1.2 future product | future roadmap | Product Vision |
| NP-06 | Windows System Service/login auto-start | Worker runs as service or mandatory startup app | not current product | Product | NO | NO | supervisor | Desktop settings | service identity | product preference | NO | Windows service/startup | none | NO | NO | NO | NOT_PRODUCT | explicitly outside Master Goal | current-user manually/product-started Worker only | none | none | Master Goal |
| NP-07 | Multi-machine Remote/LAN Host product | Desktop controls remote Host | not current product | Product | NO | NO | remote carrier undefined | remote UI | network identity/ACL | remote data | possible | network | none | NO | NO | NO | NOT_PRODUCT | local per-user baseline only | no remote/LAN product mode | none | none | Product Vision |
| NP-08 | Automatic Harness master tracking/down-migration | product follows upstream or rewrites data backward | contrary to pin policy | Product | NO | NO | upgrade contract | updater | compatibility | Harness data | NO | installer | none | NO | NO | NO | NOT_PRODUCT | exact pin and no down-migration are accepted invariants | upgrades fail closed and preserve backup | none | P7 enforcement | ADR-0004 |
| NP-09 | Second Shaco Agent RPC/custom Agent Loop | Shaco replaces Harness business protocol/runtime | prohibited architecture | Product | NO | NO | would duplicate Remote/Gateway | would duplicate Client | new unsafe authority | duplicate data | NO | none | none | NO | NO | NO | NOT_PRODUCT | contradicts Master Goal and ADR-0002/3 | no duplicate Agent API/runtime exists | none | P8 verification | ADR-0002/3 |

## D. Required Features

The normative REQUIRED set is every `REQUIRED` row in section C plus concrete
REQUIRED command/subagent/plugin rows in sections J–L. In product terms:

1. Packaged Electron Client plus per-user long-running Worker.
2. Authenticated Harness Connection semantics for unary, stream, generation,
   reconnect, cancellation and exact/binary carriage.
3. DeepSeek provider, configured-state, write-only credential setup, model
   catalog/default/session selection.
4. Workspace create/list/select and Windows native picker or documented
   Desktop equivalent.
5. Session create/list/history/cold open/Host resume/cancel/JSONL persistence.
6. Text prompt, assistant streaming, durable tool/error projections.
7. Windows PowerShell, read/write/edit/grep/glob.
8. All three shipped permission choices plus approval Allow/Reject.
9. Structured user questions.
10. Required Settings UI with durable Host persistence.
11. Shipped standard preset and core in-process continuable subagent controls.
12. Close/crash survival, truthful reconnect, Worker restart recovery and
    separate close/stop/exit semantics.
13. Pinned compatibility, controlled data roots and fresh-Windows packaging.

`USER_QUESTION_CLASSIFICATION = REQUIRED`.

`DIRECTORY_PICKER_CLASSIFICATION = REQUIRED`.

`SETTINGS_PERSISTENCE_CLASSIFICATION = REQUIRED`.

## E. Optional Features

The V1.0 release may include these, but none may block release:

- reasoning-effort selection;
- workspace rename/archive/delete/reorder and native reveal/open;
- generated session titles, manual rename, fork, content search and active-turn
  queue/steer management;
- file-reference and session-reference completion;
- image prompt input and `read_image`;
- produced-file deliverables and trajectory inspection;
- Plan Mode, manual compaction, `todo_write` and Skills;
- background jobs tools and Jobs UI;
- `web_search` and `web_fetch`;
- subagent fork and explicit subagent model selection;
- shipped preset list/select beyond fixed standard;
- native opening of Harness settings/preset locations;
- Export ZIP, plugin settings UI and session stats;
- Cordis host/client runner and UI only if P0.S proves they are required
  implementation dependencies for the in-box Client boot.

OPTIONAL does not mean “must ship but may fail.” It means absence is accepted.

## F. Deferred Features

| Feature | Target | Reason |
|---|---|---|
| Extra LLM providers | V1.2 candidate | multi-model capability-child direction |
| Harness Goal tools/UI/`/goal` | V1.1 evaluation | capability, not Shaco Automation authority |
| Harness Workflow | V1.1 evaluation | advanced execution capability |
| Ralph | V1.1/1.2 evaluation | advanced iterative subagent workflow |
| Harness Schedule | V1.1 evaluation | not current Web/standard and not Shaco scheduler |
| Preset copy/edit/delete | later | expands composition authoring/trust scope |
| Codex/Claude Code/ACP/DSH SDK subagents | V1.2 | explicitly later capability children |
| Pinned external npm plugin | later explicit review | excluded from official in-box V1.0 baseline |
| Feedback/message feedback | V1.3 candidate | roadmap direction |
| `tool-cordis` | later | Dynamic Cordis excluded by ADR-0005 |
| Generic non-image file attachments | later | no generic upload/product route exists in frozen composition |

## G. Web-only Features

| Feature | Classification | Desktop disposition | Fallback A |
|---|---|---|---|
| HTTP WebServer | WEB_ONLY | remove from primary carrier | may be retained privately |
| Web runtime and SPA static server | WEB_ONLY | package Desktop assets | fallback implementation detail |
| Browser opener | WEB_ONLY | Electron window replaces it | not a product feature |
| Launch-token URL | WEB_ONLY | remove; replace trust guarantee | relevant if HTTP fallback |
| BrowserAuth cookie bootstrap/UI flow | WEB_ONLY | remove as primary product identity | relevant if HTTP fallback |
| `trustedHosts` browser authority configuration | WEB_ONLY | no primary Desktop UI | relevant if HTTP fallback |
| LAN browser serving | WEB_ONLY | explicitly not a V1.0 product | prohibited product mode |
| Client HMR and `dev:web` | WEB_ONLY | development-only; not packaged | no release feature |
| Token URL cleanup redirect | WEB_ONLY | no navigation bootstrap | fallback detail |
| `/plugins` combo/source-map/HMR routes | WEB_ONLY | trusted packaged/alternate module bytes | fallback detail |
| Browser anchor download for `/export` | WEB_ONLY | optional native save flow | may reuse HTTP exact Fetch |

Required Client boot, Connection, Settings and picker behaviors currently touch
some of these rows. That is a `DESKTOP_REPLACEMENT_REQUIRED`, not a requirement
to reproduce a browser product.

## H. Experimental / Not Product

| Capability | Present upstream? | Classification | V1.0 disposition |
|---|---|---|---|
| Agent Teams / team Web profile | YES under `packages/experimental` | EXPERIMENTAL | excluded |
| Experimental Inspector | YES | EXPERIMENTAL | excluded |
| Experimental WebWorker runtime/packer | YES | EXPERIMENTAL | evidence seam only; not product dependency |
| E2B fs/subprocess/runtime | YES, non-default | EXPERIMENTAL | excluded from local Windows baseline |
| PTC preset/code-runtime presentation | YES, non-default/temporary mode seam | EXPERIMENTAL | excluded |
| Test-support capabilities and replay/mock LLMs | YES | NOT_PRODUCT | forbidden production dependency |
| Developer diagnostics/internal dev UI | YES | NOT_PRODUCT | diagnostics may inform evidence, not user parity |
| Session telemetry/data egress | YES in upstream base | NOT_PRODUCT | disabled in the Shaco V1.0 official composition absent a separate privacy decision |
| Shaco Automation Agent domain | not implemented | NOT_PRODUCT | future product planned for V1.1 as a Shaco-owned domain |
| Multi-Agent Council/deliberation | not implemented | NOT_PRODUCT | future product planned for V1.2 |
| Windows System Service | no V1.0 product | NOT_PRODUCT | current-user Worker only |
| Login auto-start | no V1.0 requirement | NOT_PRODUCT | excluded |
| Multi-machine remote Host / LAN Web product | not V1.0 direction | NOT_PRODUCT | excluded |
| Automatic Harness master tracking | contrary to pin policy | NOT_PRODUCT | exact release pin only |
| Harness session down-migration | explicitly disclaimed | NOT_PRODUCT | backup/restore, no promise |
| Second Shaco Agent RPC | contrary to ADR-0003 | NOT_PRODUCT | reuse Harness contract |
| Custom Agent Loop replacing Harness | contrary to Master Goal | NOT_PRODUCT | Worker remains Harness Host |
| Arbitrary npm/GitHub plugins or marketplace | upstream ecosystem possible | NOT_PRODUCT | official in-box baseline only |
| Dynamic plugin installation | possible through extension mechanisms | NOT_PRODUCT | no V1.0 product surface |

## I. Standard Preset Feature Review

| Standard capability | Exact tools/rows | Classification | Product reason |
|---|---|---|---|
| `pwsh` / `bash` | platform-exclusive shell rows | PowerShell REQUIRED; Bash NOT_PRODUCT | Windows V1.0 |
| Filesystem | `read`, `write`, `edit` | REQUIRED | core coding loop |
| Image read | `read_image` | OPTIONAL | multimodal enhancement |
| Search | `grep`, `glob` | REQUIRED | repository discovery |
| Jobs | `job_output`, `job_list`, `job_kill` | OPTIONAL | long-running command enhancement |
| Skills | `skill` + filesystem discovery | OPTIONAL | advanced instruction extensibility |
| Goal | `/goal`, `get_goal`, `create_goal`, `update_goal` | DEFERRED | not Shaco Automation domain |
| Plan | `/plan`, `exit_plan_mode` | OPTIONAL | advanced planning workflow |
| Compact | `/compact`, compaction/pruner group | OPTIONAL | manual long-context enhancement |
| Core subagent | `subagent` | REQUIRED | bounded in-process delegation |
| Fork | `subagent_fork` | OPTIONAL | context-fork enhancement |
| Control/list | `send_message`, `interrupt_agent`, `list_agents` | REQUIRED with core continuable child | required child control |
| Model selection | conditional `list_subagent_models` | OPTIONAL | default/inherited model is sufficient |
| Workflow | `workflow` | DEFERRED | advanced execution capability |
| Ralph | `ralph` | DEFERRED | advanced iterative multi-agent flow |
| User question | `ask_user_question` | REQUIRED | core human decision round-trip |
| Todo | `todo_write` | OPTIONAL | task organization |
| Web search | `web_search` | OPTIONAL | external research |
| Web fetch | `web_fetch` | OPTIONAL | external content retrieval |

Standard inclusion is upstream composition evidence, not the classification
rule. P0.S-1 must nevertheless mount and enumerate the frozen, unmodified full
`standard` surface because `HOST_STANDARD_PRESET_TOOLS_PRESENT` is an existing
hard gate. OPTIONAL/DEFERRED means those capabilities do not block product
acceptance; it does not authorize silently creating a reduced preset during
P0.S. Any later reduced Shaco preset would require a separately frozen exact
roster and corresponding Contract update. The product must never advertise a
tool that the Worker did not mount.

## J. Command Parity Table

| FeatureId | Command | RegisteredBy | HostOrClient | AvailableInWeb | PresetDependency | Classification | DesktopReplacementNeeded | V1_0AcceptanceBehavior |
|---|---|---|---|---|---|---|---|---|
| MOD-05 | `/model` | ui-model-selection `commandUi` | Client | YES | none; session model Remote | REQUIRED | package command popup/composer seat | selecting entry changes session model |
| PERM-01 | `/permission` | permission-presets | Host | YES | host-global | REQUIRED | package command UI/confirmation | current preset lists and supported choice applies |
| OPT-06 | `/feedback` | command-feedback | Host | YES | host-global | DEFERRED | no V1.0 surface | excluded; V1.3 candidate |
| OPT-01 | `/export` | session-log-export | Host+Client | YES | Web export plugin | OPTIONAL | replace anchor/HTTP download with optional save flow | non-blocking; if shipped, valid ZIP is saved |
| TOOL-15 | `/goal` | command-goal | Host Agent | YES | standard | DEFERRED | none for V1.0 | excluded; not Shaco Automation |
| TOOL-16 | `/plan` | plan-mode | Host Agent | YES | standard | OPTIONAL | package popup/plan seat if retained | non-blocking |
| TOOL-17 | `/compact` | command-compact | Host Agent | YES | standard | OPTIONAL | package command projection if retained | non-blocking |

No additional production user command registration was found in the current
Web + standard composition. Commands are dynamically scoped, so approved
future plugins may contribute other names without expanding this frozen set.

## K. Subagent Parity Table

| FeatureId | Capability | Provider | Tool | Preset | InProcessOrExternal | CurrentDefault | Classification | FutureVersion | RequiresChildProcess | RequiresP0SSpike |
|---|---|---|---|---|---|---|---|---|---|---|
| SUB-01 | Core fresh child | `spawn` | `subagent` | standard | in-process | YES | REQUIRED | 1.0 | NO | YES, standard Host profile |
| SUB-02 | Continuable follow-up | core registry | `send_message` | standard | in-process | YES | REQUIRED | 1.0 | NO | YES, stream/reconnect |
| SUB-02 | Interrupt/list | core registry | `interrupt_agent`, `list_agents` | standard | in-process | YES | REQUIRED | 1.0 | NO | YES |
| SUB-09 | Child report | core registry | `report` in continuable child | child setup | in-process | YES | OPTIONAL | 1.x | NO | NO |
| SUB-03 | Forked history child | `fork` | `subagent_fork` | standard | in-process | YES | OPTIONAL | 1.x | NO | NO |
| SUB-04 | Child model selection | `spawn` | conditional `list_subagent_models` + args | standard | in-process | CONDITIONAL | OPTIONAL | 1.x | NO | NO |
| SUB-05 | Codex | `codex` | `subagent_codex` | disabled row | external | NO | DEFERRED | 1.2 | YES | NO for V1.0 |
| SUB-06 | Claude Code | `claude-code` | `subagent_claude_code` | disabled row | external | NO | DEFERRED | 1.2 | YES | NO for V1.0 |
| SUB-07 | ACP | `acp` | composition-defined | not standard | external | NO | DEFERRED | 1.2 | YES | NO for V1.0 |
| SUB-08 | DSH SDK | `dsh-sdk` | composition-defined | not standard | external | NO | DEFERRED | 1.2 | YES | NO for V1.0 |
| SUB-10 | Other provider | none in frozen family | N/A | N/A | N/A | NO | NOT_PRODUCT | none | unknown | NO |

## L. Plugin / Cordis Scope

| FeatureId | Capability | Current role | Classification | P0.S dependency | V1.0 rule |
|---|---|---|---|---|---|
| PLG-01 | Required official in-box components | Host and Client core graph | REQUIRED | prove complete boot | fixed reviewed composition |
| PLG-02 | `tool-cordis` | model manipulates live Cordis; cordis preset only | DEFERRED | none for V1.0 | do not ship in core preset |
| PLG-03 | `cordis-host-runner` | current Web dynamic Host runner | OPTIONAL | P0.S-6 omission proof | retain only if core boot requires it |
| PLG-04 | `cordis-client-runner` | current Client dynamic runner | OPTIONAL | P0.S-6 omission proof | same |
| PLG-05 | `ui-cordis` | renders Cordis dynamic operations | OPTIONAL | P0.S-6 omission proof | same |
| PLG-06 | Pinned npm third-party plugin | explicitly reviewed external extension | DEFERRED | not a core spike gate | later per-plugin contract |
| PLG-07 | Arbitrary npm plugin | unrestricted external code | NOT_PRODUCT | none | excluded |
| PLG-08 | Arbitrary GitHub plugin | unrestricted source/install path | NOT_PRODUCT | none | excluded |
| WEB-08 | HMR/hot reload | Web development reload | WEB_ONLY | prove omission only | never a packaged feature |
| PLG-09 | Plugin marketplace | discovery/install ecosystem | NOT_PRODUCT | none | excluded |
| PLG-10 | Dynamic plugin installation | runtime arbitrary extension | NOT_PRODUCT | none | excluded |
| OPT-03 | Plugin settings UI | approved plugin configuration cards | OPTIONAL | no core gate | only for retained in-box plugin |

`P0S-6` must answer whether the three runner/UI rows are hard boot dependencies.
If they are needed internally, they become required implementation closure, not
a promise of Dynamic Cordis user functionality.

### L.1 Exact required in-box Client roster

This is the immutable P0-5 roster for `INBOX_CLIENT_MODULES_PASS`. Every row is
`REQUIRED` as an implementation module for the corresponding REQUIRED FeatureId;
it does not make unrelated optional occupants of the upstream Web roster
release requirements.

| Upstream Web row | Exact package | Required FeatureIds |
|---|---|---|
| `modules` | `@deepseek-ai/dsh-client-modules` | ARCH-01, PLG-01 |
| `connection` | `@deepseek-ai/dsh-client-connection` | ARCH-03, LIFE-03 |
| `api-remotes` | `@deepseek-ai/dsh-api-remotes` | all Remote-backed REQUIRED rows |
| `ui-theme` | `@deepseek-ai/dsh-client-ui-theme` | ARCH-01 |
| `locale` | `@deepseek-ai/dsh-client-locale` | ARCH-01 |
| `ui-layout` | `@deepseek-ai/dsh-client-ui-layout` | ARCH-01 |
| `ui-renderer` | `@deepseek-ai/dsh-client-ui-renderer` | ARCH-01 |
| `ui-session` | `@deepseek-ai/dsh-client-ui-session` | SES-01 through SES-07 |
| `ui-sidebar` | `@deepseek-ai/dsh-client-ui-sidebar` | WS-02/03, SES-02/04 |
| `ui-settings` | `@deepseek-ai/dsh-client-ui-settings` | SET-01/02 |
| `ui-settings-general` | `@deepseek-ai/dsh-client-ui-settings-general` | SET-01/02 |
| `ui-settings-models` | `@deepseek-ai/dsh-client-ui-settings-models` | MOD-02 through MOD-06, SET-03 |
| `ui-conversation` | `@deepseek-ai/dsh-client-ui-conversation` | CONV-01/02/05, SES-06 |
| `ui-approval` | `@deepseek-ai/dsh-client-ui-approval` | PERM-05/06 |
| `ui-chat` | `@deepseek-ai/dsh-client-ui-chat` | CONV-02 through CONV-05 |
| `ui-tool` | `@deepseek-ai/dsh-client-ui-tool` | CONV-04, TOOL-01/03/04/05/06/07/10 |
| `ui-workspace` | `@deepseek-ai/dsh-client-ui-workspace` | WS-01 through WS-04 |
| `ui-input-trigger` | `@deepseek-ai/dsh-client-ui-input-trigger` | CONV-01, MOD-05, PERM-01 |
| `ui-commands` | `@deepseek-ai/dsh-client-ui-commands` | MOD-05, PERM-01 |
| `ui-subagent` | `@deepseek-ai/dsh-client-ui-subagent` | SUB-01/02 |
| `ui-model-selection` | `@deepseek-ai/dsh-client-ui-model-selection` | MOD-04/05 |
| `ui-permission` | `@deepseek-ai/dsh-client-ui-permission-presets` | PERM-01 through PERM-04 |
| `ui-user-questions` | `@deepseek-ai/dsh-client-ui-user-questions` | TOOL-10 |

Optional/deferred upstream Client occupants are explicitly not in this required
roster: `cordis-client-runner`, `ui-settings-plugin-inventory`,
`ui-brand-official`, `ui-attachment`, `ui-cordis`, `ui-workflow-run`,
`ui-deliverables`, `ui-skill`, `ui-reference`, `ui-jobs`, `ui-goal`,
`ui-message-feedback`, `ui-agent-preset`, `ui-settings-plugins`, `ui-plan`,
and `ui-trajectory`. P0.S may discover an undeclared hard dependency; that is
a failed/constraint result to record, not permission to silently expand product
scope.

### L.2 Exact required in-box Host/runtime roster

Every package named below is `REQUIRED` as an implementation dependency of the
listed REQUIRED behavior. The exact non-Web Host profile is still a P0.S-1
proof; packages not named here do not become V1.0 requirements merely because
the upstream Web bundle mounts them.

| Domain | Exact required packages/components |
|---|---|
| LLM route | `@deepseek-ai/dsh-llm`, `@deepseek-ai/dsh-llm-deepseek`, `@deepseek-ai/dsh-deepseek-llm-api-extensions`, `@deepseek-ai/dsh-llm-retry`, `@deepseek-ai/dsh-agent-default-model` |
| Session/Agent | `@deepseek-ai/dsh-session`, `@deepseek-ai/dsh-session-log-deepseek`, `@deepseek-ai/dsh-agent`, `@deepseek-ai/dsh-agent-loop`, `@deepseek-ai/dsh-session-persistence-jsonl`, `@deepseek-ai/dsh-session-projection`, `@deepseek-ai/dsh-session-projection-cache`, `@deepseek-ai/dsh-session-checkpoint-policy`, `@deepseek-ai/dsh-attachment-local` |
| Typed business contract | `@deepseek-ai/dsh-typert-registry`, `@deepseek-ai/dsh-typert-loader`, `@deepseek-ai/dsh-api-gateway`, `@deepseek-ai/dsh-api-remotes`, `@deepseek-ai/dsh-api-session-controller`, `@deepseek-ai/dsh-api-workspace-controller`, `@deepseek-ai/dsh-api-settings-controller` |
| Workspace/reference | `@deepseek-ai/dsh-workspace`, `@deepseek-ai/dsh-file-reference-local`, `@deepseek-ai/dsh-host-directory-picker-auto`, `@deepseek-ai/dsh-host-directory-picker-native`, `@deepseek-ai/dsh-host-directory-picker-browse` |
| Settings/credentials/storage | `@deepseek-ai/dsh-settings-file`, `@deepseek-ai/dsh-credentials-local`, `@deepseek-ai/dsh-storage`, `@deepseek-ai/dsh-storage-json`, `@deepseek-ai/dsh-storage-domain` |
| Tools/execution | `@deepseek-ai/dsh-tools`, `@deepseek-ai/dsh-subprocess-local`, `@deepseek-ai/dsh-shell-env`, `@deepseek-ai/dsh-sandbox-local`, `@deepseek-ai/dsh-sandbox-policy`, `@deepseek-ai/dsh-sandbox-windows-acl`, `@deepseek-ai/dsh-pwsh-sandbox`, `@deepseek-ai/dsh-tool-pwsh`, `@deepseek-ai/dsh-fs-sandbox`, `@deepseek-ai/dsh-fs-observation-policy`, `@deepseek-ai/dsh-tool-fs`, `@deepseek-ai/dsh-tool-fs-search` |
| Human interaction | `@deepseek-ai/dsh-commands`, `@deepseek-ai/dsh-user-approval`, `@deepseek-ai/dsh-permission-presets`, `@deepseek-ai/dsh-user-questions`, `@deepseek-ai/dsh-tool-ask-user` |
| Preset/delegation | `@deepseek-ai/dsh-agent-presets`, `@deepseek-ai/dsh-subagent`, `@deepseek-ai/dsh-subagent-in-process-driver`, `@deepseek-ai/dsh-subagent-spawn-in-process`, `@deepseek-ai/dsh-tool-subagent`, `@deepseek-ai/dsh-tool-subagent-control` |
| Prompt/runtime policy | `@deepseek-ai/dsh-persona`, `@deepseek-ai/dsh-agent-instructions`, `@deepseek-ai/dsh-system-prompt`, `@deepseek-ai/dsh-tool-call-timeout-policy`, `@deepseek-ai/dsh-spill-local`, `@deepseek-ai/dsh-spill-policy` |

The frozen full `standard` preset remains the P0.S-1 composition target. This
roster defines product-required behavior inside that target; it does not
reclassify Jobs, Skills, Goal, Plan, Compaction, Workflow, Ralph, todo or Web
tools as release blockers.

`@deepseek-ai/dsh-session-query-sqlite` is **CONDITIONAL / OPTIONAL** (SES-10).
Default session persistence remains JSONL. Upstream mounts the query package
with `openAt: never`. Do not treat it as a V1.0 REQUIRED Host dependency.
Upgrade to REQUIRED only if P0.S proves a REQUIRED Client/runtime surface hard-depends on it. AUDIT-004 F-03.

## M. Desktop Adaptation Matrix

| Feature | HarnessCurrentWebBehavior | DesktopTargetBehavior | ReusableClientModule | WebDependencyToRemove | NativeDesktopReplacement | P0SNeeded | ProductionPhase |
|---|---|---|---|---|---|---|---|
| Client boot | index-injected `__DSH_BOOT__`, `/plugins` | packaged trusted in-box graph | YES, conditional | index/static/plugin routes | Electron custom scheme/assets | YES | P4/P7 |
| Connection | JSON Fetch + WS mux | same Remote/Gateway semantics over local carrier | YES | HTTP/WS mapping | Main-brokered Worker carrier | YES | P3 |
| Trust | token/cookie/Host/Origin | authenticated user/product/Worker channel | logical seam only | browser trust stack | P1-defined local trust | YES | P3/P7 |
| Settings | loopback page enables Host persistence | trusted Desktop capability enables Host persistence | YES | hostname canary | trusted boot/carrier fact | YES | P4/P6A |
| Directory picker | Host native/browse selected from bind | Windows picker or documented Desktop equivalent returns Host path | UI partly | bind/Web presentation | allowlisted native dialog/broker | YES | P4/P5 |
| Streaming/events | WS mux and browser reconnect | AsyncIterable/generation semantics over carrier | YES | WebSocket | carrier adapter | YES | P3 |
| Approval/questions | `$events` over mux | same pending/first-result behavior | YES | WebSocket transport | Desktop cards | YES | P4/P5/P6A |
| Cancel | Fetch/WS AbortSignal | explicit turn/stream cancel; disconnect remains separate | YES | HTTP/WS cancel | carrier cancellation | YES | P3/P5 |
| Binary | export/module bytes via HTTP | trusted bounded exact-byte path | consumer-specific | Fetch/routes | carrier/file-save mapping | YES | P3 |
| PowerShell/sandbox | Host pwsh + Windows ACL | packaged Worker owns execution | generic UI | none | packaged helpers | YES | P2/P7 |
| Credentials | same-origin form to Host | allowlisted secret submission; no readback | YES | cookie identity | secure Renderer→Main→Worker path | YES | P4/P7 |
| Lifecycle/reconnect | browser tab can reconnect to live Host | Desktop close/crash survives; supervisor discovers same Worker | store logic partly | page lifecycle | Electron Main supervisor | YES | P6A |
| Export | HEAD + browser anchor ZIP | optional native save flow | controller partly | anchor/HTTP URL | save dialog/byte stream | NO product gate | P5 |

## N. P0.S Feature Inputs

Only architecture-changing REQUIRED behavior enters P0.S:

| Input | Required proof |
|---|---|
| Host profile + frozen standard preset | no-Web Host is long-running and mounts/enumerates the complete frozen standard tool/command/subagent surface; REQUIRED rows receive behavior checks while OPTIONAL/DEFERRED rows remain non-release-blocking product promises |
| Core Client boot/in-box modules | secure custom scheme loads every REQUIRED Client module without public `/plugins` dependency |
| Local carrier/trust | intended peer passes; unauthorized/stale peer cannot invoke Gateway; Renderer cannot open carrier directly |
| Unary/stream/generation | representative session/settings/credentials call plus concurrent follow/control/events, ready/reset and loss |
| Settings persistence | write → restart Desktop/Worker → reload same value; never memory mode |
| Directory picker | Windows native picker or documented equivalent, valid path, cancel and untrusted-caller denial |
| Approval | pending request, Allow/Reject, duplicate prevention and carrier-reconnect redelivery |
| User question | structured answer/cancel and carrier-reconnect redelivery |
| Cancellation/lifetime | explicit cancel stops turn; carrier/Desktop loss alone does not |
| Reconnect/durability | close/crash Desktop, attach same Worker, rebuild snapshots/journal without duplicate resume/answer |
| Second Desktop policy | second instance either attaches safely to the same Worker or fails closed; it cannot create a competing authority |
| Connected Worker restart | while Desktop is connected, restart Worker and prove stale generation retraction, new trust/ready, and defined projection recovery |
| Binary carrier | real bytes with auth, cancellation, backpressure and bounded memory, independent of `/export` product inclusion |
| Packaging/runtime | fresh Windows, no Node/pnpm/Harness, controlled `DSH_HOME`, packaged PowerShell/sandbox/helper paths |
| Harness core-patch inventory | every spike records `HARNESS_CORE_PATCH_REQUIRED = YES/NO` and exact patch surface before P1 |

Jobs, Goal, Workflow, Ralph, Skills, web tools, images, Export, trajectory,
feedback and external subagents do not become P0.S hard gates.

## O. Shaco Forge V1.0 Core Release Definition

A fresh supported Windows user can:

1. Install and launch Shaco Forge without installing Node, pnpm or Harness.
2. Start or discover the intended per-user long-running Worker.
3. Configure a DeepSeek API key without ever reading the stored plaintext back.
4. discover/use a supported DeepSeek model and select a model per session.
5. Select an existing Windows directory and create/select a workspace.
6. Create/list/open a persistent standard session.
7. Send text and receive ordered assistant streaming and truthful errors.
8. Let the Agent read/search/edit/write files and run PowerShell under the
   selected read-only/workspace-write/danger-full-access policy.
9. See tool calls/results and answer approvals and structured user questions.
10. Use and control the required core in-process subagent.
11. Stop an active turn explicitly without conflating cancellation with a
    carrier disconnect.
12. Close or crash Desktop while Worker/Host work remains alive.
13. Reopen Desktop, authenticate to the same Worker and rebuild projection.
14. Restart Worker and reopen/continue persisted sessions through Host-owned
    cold resume.
15. Persist required settings across Desktop and Worker restarts.
16. Install/update only as a compatible pinned product release and fail closed
    before Agent data writes when identities are incompatible.

## P. Explicit Non-goals

- Shaco Automation Agent/Run/Task/Step/Attempt in V1.0.
- Multi-Agent Council, deliberation or reviewer pipeline.
- Treating Harness Goal/Jobs/Workflow/Ralph/Schedule as Shaco Automation truth.
- Codex, Claude Code, ACP or DSH SDK external subagents.
- Full extra-provider parity.
- Full arbitrary third-party, npm or GitHub plugin compatibility.
- Plugin marketplace, dynamic plugin installation, hot reload or malicious
  plugin crash isolation.
- Windows System Service or login auto-start.
- Multi-machine Remote Host or LAN Web Host product mode.
- Browser/Web SPA as the primary Shaco user shell.
- Automatic tracking of Harness master.
- Harness session/data down-migration.
- Building a second Agent RPC.
- Building a custom Agent Loop that replaces Harness.
- Images, attachments, Export ZIP, Goal, Jobs, Workflow, Ralph, Skills,
  web tools, trajectory or feedback as V1.0 release blockers.

## Q. Scope Contradictions

`P0_5_SCOPE_CONTRADICTIONS_UNRESOLVED = NONE`.

Resolved tensions:

1. REQUIRED Client/Connection/Settings/picker behavior currently depends on
   WEB_ONLY delivery or classification. Resolution: preserve behavior through
   Desktop replacement and keep the corresponding P0.S hard gates.
2. OPTIONAL Export is not the binary architecture gate. Resolution:
   `ARCH-04` remains REQUIRED and P0.S may use any real exact/binary proof.
3. Cordis runner/UI rows are OPTIONAL product components but could be current
   boot dependencies. Resolution: P0.S-6 proves omission; if retained
   internally, Dynamic Cordis still remains outside product scope.
4. Core subagent is REQUIRED while external providers are DEFERRED. No
   dependency exists from in-process spawn/control to Codex/Claude/ACP/SDK.
5. No REQUIRED row depends on a DEFERRED third-party plugin.
6. Every Master Goal behavior is represented; no unsupported feature was made
   REQUIRED solely because standard includes it.

## R. Evidence

Authoritative Shaco inputs:

- `docs/01-product/SHACO-FORGE-PRODUCT-VISION.md`
- `docs/01-product/SHACO-FORGE-VERSION-ROADMAP.md`
- `docs/01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md`
- current Architecture/Boundary/Security/Data Ownership documents
- ADR-0001 through ADR-0007
- `docs/03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md`
- P0-2, P0-3 and P0-4 evidence documents

Primary upstream inputs:

- `packages/bundle/base/cordis.patch.yml`
- `packages/bundle/web-app/cordis.patch.yml`
- `packages/preset/agent-presets/presets/standard/{preset.yml,agent.cordis.yml}`
- generated Remote descriptors enumerated by P0-3
- Connection/Gateway/session/workspace/settings/credentials/controller sources
- concrete command packages for model, permission, feedback, export, goal,
  plan and compact
- subagent family packages and current Client roster
- experimental, E2B, PTC/code-runtime and Web delivery package locations

No source-changing diagnostic or build was needed. Source/registration searches
were used only to confirm concrete names and composition.

## S. Gate Results

| Gate | Result |
|---|---|
| FROZEN_BASELINE_REVERIFIED | YES |
| UPSTREAM_WORKTREE_CLEAN_BEFORE | YES |
| UPSTREAM_WORKTREE_CLEAN_AFTER | YES |
| COMPLETE_FEATURE_MATRIX_WRITTEN | YES |
| REQUIRED_FEATURES_EXPLICIT | YES |
| OPTIONAL_FEATURES_EXPLICIT | YES |
| DEFERRED_FEATURES_EXPLICIT | YES |
| WEB_ONLY_FEATURES_EXPLICIT | YES |
| EXPERIMENTAL_NOT_PRODUCT_EXPLICIT | YES |
| STANDARD_PRESET_FEATURES_REVIEWED | YES |
| CORE_COMMANDS_CONCRETELY_CLASSIFIED | YES |
| CORE_SUBAGENTS_CONCRETELY_CLASSIFIED | YES |
| USER_QUESTION_CLASSIFICATION_FROZEN | YES |
| DIRECTORY_PICKER_CLASSIFICATION_FROZEN | YES |
| SETTINGS_PERSISTENCE_REQUIREMENT_FROZEN | YES |
| PLUGIN_CORDIS_SCOPE_CLASSIFIED | YES |
| DESKTOP_ADAPTATION_MATRIX_WRITTEN | YES |
| P0S_FEATURE_INPUTS_WRITTEN | YES |
| V1_0_CORE_RELEASE_DEFINITION_WRITTEN | YES |
| V1_0_EXPLICIT_NON_GOALS_WRITTEN | YES |
| SCOPE_CONTRADICTIONS_RESOLVED | YES |
| P0_5_EVIDENCE_WRITTEN | YES |
| CURRENT_STATE_UPDATED | YES |
| DEVELOPMENT_LOG_UPDATED | YES |
| P0_5_STATUS_UPDATED | YES |

`P0_CORE_PARITY_SCOPE_FROZEN = YES`

`SHACO_FORGE_V1_0_P0_5 = PASS`

`SHACO_FORGE_V1_0_P0 = NOT_PASS`
