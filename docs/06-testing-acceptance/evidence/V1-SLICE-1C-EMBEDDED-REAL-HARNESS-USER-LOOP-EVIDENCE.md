# V1-SLICE-1C Embedded Real Harness User Loop Evidence

> Final checkpoint: Attempt #2 live Gate and all required regressions PASS.
> State: IMPLEMENTED_WAITING_INDEPENDENT_REVIEW. Earlier failed and pending
> checkpoints below remain historical; Attempt #1 remains NOT_PROVEN.

Date: 2026-09-08

Implementation Result: PASS

Historical execution disposition: HUMAN_REQUIRED_INTERACTION at
EVIDENCE_CAPTURE_REVALIDATION_SCOPE_CONFIRMATION_PENDING.

`STANDARD_PRESET_HOST_SETTINGS_SCOPE_CONFIRMATION = APPROVED`.
The previous HARNESS_SESSION_CREATION_BLOCKED scope boundary is resolved by the
new explicit authorization. The single public settings module is now composed
before agent-presets with defaults unchanged. Historical failures remain below;
real Session creation and Composer Prompt acceptance succeeded. Attempt #1's
live semantic observer failed and has been corrected. Budget is 1/2; the
original retry condition does not permit covering this implementation failure.

Prior picker scope authority: `PICKER_COMPOSITION_SCOPE_CONFIRMATION = APPROVED`.
The original pending-scope checkpoint below is historical and is superseded
by the explicit Owner authorization for the two existing public browse modules.
Architecture Contract change required: NO. Provider budget before rerun: 0/2.

Historical Real User Loop: NOT_PROVEN. Controlled Workspace, Session and Prompt acceptance
are proved. The actual Provider/Tool turn completed according to a bounded
postmortem, but the required same-context live semantic and rendered-UI proof
was not retained. Section 10 records the current superseding checkpoint.

Sections 2 and 4-7 preserve the original pre-approval checkpoint. Section 8
supersedes its picker-scope blocker and runtime values without erasing history.

This is Executor evidence. No Independent Review or Owner Closure has occurred.

## 1. Initial identities and authority

| Item | Observed value |
|---|---|
| Product | `D:\Project\Shaco-Forge` |
| Branch | `master` |
| Initial HEAD | `2dcc47ff6ca393a4334cc6d7135d8c0b38f2f854` |
| Initial worktree | clean |
| Frozen Harness | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| Frozen HEAD | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Frozen worktree | clean before and after runtime |
| Worker Node | `22.19.0` |
| Electron | `35.7.5` |

All requested initial governance fields matched: 1A/1B closed, 1B frozen,
1C authorized with Architecture Challenge and Targeted Delta Review PASS,
no Blocking Findings, frozen Architecture, implementation initially not started,
Owner implementation authority YES, and Slice 1 IN_PROGRESS.

Authority: [1C Contract](../../03-v1.0-plan/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-CONTRACT.md)
and [Owner Decision](../../04-development-records/V1-SLICE-1C-IMPLEMENTATION-AUTHORIZATION-OWNER-DECISION.md).
The five input-document SHA-256 values still equal the exact Owner Decision
values; the Owner Decision itself was not modified.

## 2. Real runtime checkpoint

Run ID: `6a42cfa7-2a43-4ab3-a3c8-d45a0d9eea03`.

Raw ignored local artifact:
`docs/04-development-records/evidence/V1-SLICE-1C/runtime/6a42cfa7-2a43-4ab3-a3c8-d45a0d9eea03.json`.

Runtime reports `nonProviderResult=PASS`, `result=NOT_PROVEN`, and
`userLoop.result=SHACO_IMPLEMENTATION_FAILURE` at `WORKSPACE_PICKER` with
`EXISTING_PICKER_UI_NOT_AUTONOMOUSLY_COMPLETED`. This failed gate is preserved;
it is not converted to Implementation PASS or a missing-credential result.

The driver clicked the real Harness Settings, Models, Close, and Choose
Workspace controls using Electron WebContents DOM interaction. The real mounted
Client produced its own `llm/listProviders`, `llm/listConfigurableProviders`,
`credentials/describe`, `session/modelCatalog`, and other boot requests.
No direct test Remote or `session/prompt` RPC was invoked.

The existing Workspace anchor was visible and clickable, but no browse dialog
appeared and `directoryPicker/pick` was not observed. Therefore this evidence
does **not** claim `HUMAN_REQUIRED_NATIVE_PICKER_INTERACTION`: an OS picker was
not proved to be open. Source inspection shows neither a directory-flow Client
occupant in the 27-module Product graph nor a directory-picker Host backend in
the current custom profile.

The user execution instruction section 34 permits Worker changes only for
observation/cleanup. A narrow scope confirmation is pending for composing the
existing public `dsh-client-ui-directory-picker-browse` Client bundle and
`dsh-host-directory-picker-browse` Host backend. Neither composition change has
been applied. No Frozen Harness modification or new dependency installation is
proposed, and no architecture redesign is asserted to be necessary.

## 3. Same context and passive wrapper

| Gate | Observation |
|---|---|
| Mounted AppWebEntry | one `@deepseek-ai/dsh-client-web.AppWebEntry`, version `0.1.2-alpha.1` |
| Client graph / Remote context | existing AppWebEntry graph, one transport installation |
| Second AppWebEntry / Client / Remote | zero in user-loop driver; source assertion covered |
| Direct test business RPC | zero |
| Evidence mode | observation only on current fetch/openStream/items/responses |
| Outer New Chat / Settings | disabled and explicitly delegated |
| Outer project state | delegated text; no fake No Project / No Session |
| Duplicate Workspace/Session/navigation store | absent |
| Private AppWebEntry ctx | absent |

The former generated transport implementation now bundles the actual
`transport.ts` tested by unit tests. Raw `lastStreamPayloads` retention and
rendered conversation text samples were removed. Evidence arrays, identities,
interactions and chunk metadata are bounded; full Prompt, Tool arguments,
credential descriptors and transcript are not accumulated in the observer.

## 4. Provider and execution budget

| Item | Observation |
|---|---|
| Provider ownership | Harness |
| Default route observed | `runapi` |
| Default model observed | `claude-sonnet-4-20250514` |
| Default route routable | true |
| Configured credential existence | true, reduced from Harness UI descriptor reads |
| Selected model end-to-end credential usability | not proved by a Provider call |
| Tool Proof Session attempts | 0 / 2 |
| `session/prompt` requests | 0 |
| Controlled Agent generation network attempts | 0; Prompt gate not reached |
| Provider/network failure classification | not triggered |

Credential values were neither read by the implementation agent nor printed,
copied, injected, or written to a Shaco store. The real Harness home supplied
its own settings and credentials. The boolean descriptor observation establishes
credential existence, not successful authentication of the selected route.

The ignored `provider-budget.json` ledger remains `{"attempts":[]}`. The driver
reserves an attempt before Composer submission and cannot reset an existing
nonempty budget through a new invocation. Attempt #2 is allowed only after
healthy completed streaming without any Tool selection in Attempt #1.

## 5. Workspace, Session, Prompt, Tool and streaming

Controlled Workspace path SHA-256:
`b3cf61feb734a85cd8758d51ab8fb911fe68e9be4c3a28c7079f1e4bd8255644`.

| Proof | Before | After |
|---|---|---|
| File list | `proof.txt` only | unchanged |
| Proof bytes | 32 | 32 |
| Proof SHA-256 | `a3852cbf5610c78949ed5afebe9e32c182a624b531a5aac73838bd7b650a21df` | identical |
| Added/deleted user file | none | none |

The cryptographic random marker was not persisted in this durable evidence.
The controlled directory was removed after the snapshot.

Product Workspace selection: NOT_REACHED. Real controlled Session identity:
NOT_REACHED. A natural Client boot `session/create` endpoint was observed, but
it is not evidence of the controlled Workspace/Session gate. Session identity
hash, Prompt accepted, turn/start, step/start, assistant/chunk, tool/call,
tool/result, assistant/message, step/end and turn/end are all NOT_REACHED for
the controlled loop. Tool name, isError, Tool marker hash, final Assistant marker
hash and rendered marker match are NOT_OBSERVED. Attempt #1 and #2 were not used.

Approval and Question: NOT_TRIGGERED. UI settlement and original await resumption
are not claimed. Agent cancel was not invoked.

## 6. Carrier and background streams

| Metric | Observed value |
|---|---:|
| Background streams | `$events`, `workspace/follow`, `session/control` |
| Concurrent stream peak | 3 |
| Active Agent turns | 0 |
| Initial credits / absolute queue cap | 4 / 16, unchanged |
| Maximum queue depth | 4 |
| Maximum Renderer pulls per stream | 1 |
| Maximum observed JSON frame bytes | 244426 |
| Frozen JSON frame cap | 262144 |
| Credit violations | 0 |
| Duplicate transport terminals | 0 |
| Items after terminal | 0 |
| Final active streams / pending unary | 0 / 0 |
| Unsolicited Renderer pushes | 0 |
| Observed Product TCP listeners | 0 |

Mutual HMAC, protected current-user DACL, first-instance pipe creation and real
`$events` preflight remained successful. The snapshot proves boot/background
coexistence only; it does not prove coexistence with Assistant streaming.
Worker cleanup reported exited. No implicit Agent cancel, Shaco retry/recovery,
second connection, fallback TCP or raised frame cap was introduced.

## 7. Tests, hygiene and limitations

The exact command/exit ledger is in the
[Implementation Record](../../04-development-records/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-IMPLEMENTATION-RECORD.md).
Complete unit roster initially passed 94/94, then 97/97 after
strict success/no-tool/error assessment additions, and 99/99 after correcting
the pinned nested Workspace identity and requiring accepted controlled-path
creation evidence. The latest build, typecheck,
static validation (91 files), theme validation (20 tokens), and hygiene checks
(24 changed/new files, strict UTF-8 without BOM, no suspicious text, 39 valid
Markdown links) passed. Six frozen authority documents remain unchanged;
Product HEAD and Frozen Harness HEAD are unchanged, staging is empty, and the
final process query found zero Product/Host/helper processes. Carrier, Worker, Electron and injected
Carrier failure runtime regressions passed. The new real user-loop gate did
not pass. Unit fixtures validate observation/policy only and never stand in for
real Provider evidence.

Remaining limits: picker composition authorization; no executed controlled
Workspace/Session/Prompt/Provider/Tool loop; conditional interaction settlement
not exercised at runtime; final acceptance state withheld. REVIEW-012 F-05
remains OPEN_KNOWN_CONSTRAINT; V1-SLICE-1B NF-6 remains OPEN_NON_BLOCKING.

An ignored local `picker-composition-proposal.patch` has passed a non-mutating
Git application check; it has not been applied. Both shipped public picker
exports were verified present at the pinned version. The Workspace observer
correction and its tests do not change the real runtime checkpoint above:
controlled Workspace/Session/Prompt/Tool proof is still NOT_REACHED, and the
scope confirmation remains pending.

The existing Electron regression was rerun successfully after the Workspace
observer correction (exit 0). Its first launch was not executed because the
automatic permission review timed out; the single permitted retry passed and
removed its temporary Harness home. This was a non-Provider regression and
does not supersede the failed real user-loop evidence.

## 8. Owner-approved picker corrective and current runtime

`PICKER_COMPOSITION_SCOPE_CONFIRMATION = APPROVED`.
The Owner clarified that the original missing picker was incomplete Product
composition of existing public Harness modules, with no Architecture Contract
change required. The two approved additions are applied in
`apps/desktop/scripts/prepare-harness-client.mjs` and
`apps/worker/src/profile.ts`; relevant observer, driver, tests and evidence were
updated. No native or auto picker was added.

| Public composition | Verified pinned evidence |
|---|---|
| Client | `@deepseek-ai/dsh-client-ui-directory-picker-browse/client`, public web declaration, version `0.1.2-alpha.1` |
| Client built export | 49256 bytes; SHA-256 `502ea0a442005b271e08af2b82db1b82820dae374997a3c9bc24b3cd812dbee4` |
| Host | `@deepseek-ai/dsh-host-directory-picker-browse`, public root export, version `0.1.2-alpha.1` |
| Host built export | 9309 bytes; SHA-256 `20d82ef343a4ee06f1ace8d56521b3e6c7cbbf52816acf056e9977839d31c54b` |
| Exact Client graph before / after | 27 / 28; explicit identities, public ordering, duplicate/missing/unknown rejection retained |
| Generated Host order | workspace-controller, directory-picker-browse, api-remotes |
| Generated Host patch SHA-256 | `5d04627c97453ab93dec37952c4fa58e3f89e2f1f867a89e577248c12afba7ce` |
| New dependency / lockfile / Frozen Harness mutation | none |

All five post-approval UI validation runs are retained in the ignored runtime
directory. The Implementation Record section 10 lists each run and the
correctives it motivated: visible dialog selection, DOM input settling, actual
public named request envelopes, and bounded redacted Session error metadata.
None reached Composer or consumed a Tool Proof attempt.

Latest run: `6fc2d514-759b-4823-a4a7-6d2f81434940`.
Raw artifact:
`docs/04-development-records/evidence/V1-SLICE-1C/runtime/6fc2d514-759b-4823-a4a7-6d2f81434940.json`.
The durable record contains no raw credential, Prompt, conversation, directory
listing, random marker or full controlled path.

| Actual UI / endpoint evidence | Result |
|---|---|
| Same mounted AppWebEntry | Settings, Models, Close, Choose Workspace, Edit path, type controlled path, Open |
| Harness browse dialog | observed; controlled path input matched |
| `directoryPicker/list` | three accepted responses; controlled request/listed-path hashes match |
| `directoryPicker/pick` | not observed; browse uses the actual list sequence above |
| `workspace/create` | accepted, returned Workspace identity |
| Controlled path SHA-256 | `e5073f13da1c25f88bfd18ac0a05580e846becbebad32465388128a03b3bb39f` |
| Workspace identity SHA-256 | `9dbbce4d1036af2cfe46ce3c7a6c68f15846452978b6abcd3b72d41e5dc20299` |
| Correlated `session/create` request SHA-256 | `7ccd8db8449c6478178573660a04edff885de91ed7a08047543b73a2086c6e7d` |
| Session create | rejected: `agent-preset-invalid`, preset `standard`; no accepted Session identity |
| Active Workspace UI / complete picker gate | not proved; Session creation failed before that final UI assertion |
| Second AppWebEntry / Client / Remote / direct test RPC | 0 / 0 / 0 / 0 |
| Provider budget before / after picker | 0/2 / 0/2, original ledger remains empty |

The actual redacted error is:

```text
failed to apply loader entry delegation (cordis:group): failed to apply loader entry tool-subagent (@deepseek-ai/dsh-tool-subagent): tool-subagent: `modelSelectionSettings` requires @deepseek-ai/dsh-tool-subagent/model-selection-settings in the Host scope ([path])
```

Read-only inspection confirms this additional public Host export exists at the
pinned `0.1.2-alpha.1` version (3899 bytes; SHA-256
`a203d7ddc88c7dd19c300c8d4acd622eb33f6f9eea61593153dbb9b69de0efaf`).
It registers Harness-owned model-selection settings with shipped defaults
`enabled=false` and `allowedModels=[]`. No subagent was spawned. The frozen
standard preset was not changed or replaced to bypass the requirement.

The Owner continuation section 3 expressly limits added composition to the two
picker modules. This third public Host module therefore remains unapplied and
requires an explicit scope decision. The ignored one-file proposal
`docs/04-development-records/evidence/V1-SLICE-1C/runtime/standard-preset-host-settings-proposal.patch`
passed a non-mutating Git application check. Current classification is
HUMAN_REQUIRED_INTERACTION / HARNESS_SESSION_CREATION_BLOCKED, with overall
implementation NOT_PROVEN. This is not a Provider or credential failure.

The latest Harness-owned provider is `haoai`, model
`anthropic/claude-opus-5`, with routable and credential-existence booleans true.
Authentication usability is unproved. No configuration or credential was
changed. `session/prompt`, Agent turns, Assistant streaming, Tool call/result,
final marker match, Approval and Question remain NOT_REACHED or NOT_TRIGGERED.
Attempt #1 and #2 are unused; controlled generation network attempts are zero.

| Latest controlled integrity | Before / after |
|---|---|
| File list | `proof.txt` only, unchanged |
| Proof bytes | 32 / 32 |
| Expected / actual file SHA-256 | `f0c34afe40aaa8ce6d055f58adf129e62c56d223c182268932c4c2f04283b662`, unchanged |
| Added / deleted files / mutating Tool events | none / none / none |
| Controlled directory cleanup | removed after snapshots |

Latest Main/Worker/Host/helper PIDs were 43796 / 42436 / 28092 / 43528.
Authenticated Carrier and non-Provider runtime checks passed. Background
streams were `$events`, `workspace/follow`, `session/control`, peak 3;
Agent turns 0; initial credits 4; queue cap 16; maximum queue 4; maximum
Renderer in-flight pull per stream 1. Maximum JSON frame was 244574 bytes,
below the unchanged 262144 cap. Oversize, credit violations, duplicate
transport terminals and items after terminal were all zero. Final active
streams and pending unary requests were zero, with no Product TCP listeners
or residual Product PIDs. These values do not prove Agent semantic streaming.
Electron exited 0; the non-PASS launcher command reported exit 1.

The final unique complete unit roster passed 104/104 (exit 0), including the
latest Session-reason redaction regression. The affected observer/policy
roster passed 35/35. All required post-composition non-Provider gates passed;
their exact commands and exits are recorded in the Implementation Record.
Unit fixtures remain observation/policy validation, never Provider proof.
The legal diff now has 26 changed/new files. Independent Review remains
NOT_STARTED, Owner Closure NOT_PERFORMED, and the implementation baseline
NOT_FROZEN. REVIEW-012 F-05 and 1B NF-6 retain their existing status.

## 9. Standard preset settings scope clarification

The Owner approved only
`@deepseek-ai/dsh-tool-subagent/model-selection-settings`, with
`ARCHITECTURE_CONTRACT_CHANGE_REQUIRED = NO`,
`MULTI_AGENT_SCOPE_EXPANDED = NO`, and
`SUBAGENT_EXECUTION_AUTHORIZED_FOR_1C_GATE = NO`.
Public preflight verified `0.1.2-alpha.1`, the existing built subpath, and
normal resolution from the runtime overlay. Its built SHA-256 remains
`a203d7ddc88c7dd19c300c8d4acd622eb33f6f9eea61593153dbb9b69de0efaf`.
The sole composition addition is in `apps/worker/src/profile.ts`, between
api-remotes and agent-presets. No default, Frozen standard preset, user settings,
credential, dependency or lockfile was changed. The earlier Session failure
remains historical evidence. The new runtime must prove accepted Session
creation and continue the full read-only Provider loop; no success is inferred
from loading the module alone.

## 10. Real Prompt accepted; capture failure corrected without an unauthorized retry

The Host settings corrective is effective. New real runs retained below are
separate artifacts; no picker or preset failure was erased:

| Run ID | Result and limits |
|---|---|
| `aed93d9d-08ad-415c-8152-e574b2a8c800` | Real Workspace and Session accepted; Composer reached; a pre-submission DOM failure produced no Prompt. Original reservation retained with a proven-not-submitted audit. |
| `4f2c1d05-f65e-46c4-bd15-099105a4a329` | Diagnostic confirmed editable but unfocused empty Composer; no Prompt or new reservation. |
| `54e248ff-305c-4fa3-bcab-a616872a0a3f` | Exact draft and enabled Send verified; real `session/prompt accepted=true`; first controlled attempt used. Observer failed to bind the public follow request. |
| `43988e6d-bcea-46b4-8f1f-954f1f05f84f` | Corrected observer verified against real Session/follow binding in explicit session-setup-only mode; zero Prompt, byte-identical 1/2 budget, full user loop still NOT_PROVEN. |

Attempt #1 Workspace hash:
`d82dbe65ca4a007d5acf4b22e5be558ba1da6f99622cb494180c3d440af80094`.
Session hash:
`2a1f4d236134f09e76ed251cd1efd14f66e41f0c3d1398596e8cde841fdce809`.
Prompt request hash:
`f82f27992130808a93238aa4cd1e26c17a61a6d9ec13a27b38fcf7d731638779`.
Provider/model was Harness-owned `deepseek-official / deepseek-v4-flash`, with
routability and credential-existence booleans true. No Provider registry,
credential, user settings or module default was changed by the implementation.

The original run reported a Provider/network timeout after 180 seconds. Source
and postmortem evidence contradict that classification: `session/follow` takes
`args.request.address`, while the observer read `args.address`. The real Carrier
delivered 167 stream pulls, but no semantic rows were retained. Empty observer
arrays therefore cannot establish missing Tools or Provider failure.

A bounded read of only the hash-identified controlled Session journal showed
one read Tool call (seq 73), its successful result (seq 74), two Assistant
messages, two steps and a completed turn/end. Tool-result and final-Assistant
marker matches were both true for SHA-256
`2c948480bbc121d09732796f197f80aa9d99cb2e8c3935b3dfcac0b07023cd13`.
No subagent/fork/control Tool or write/edit Tool appeared in that journal.
The source journal hash was
`3b27ca93d8c93241fc5aa3c813b691a75b691811386afe2c398298f59ae69368`.
Only selected metadata/hashes were retained in the ignored
`docs/04-development-records/evidence/V1-SLICE-1C/runtime/54e248ff-postmortem.json`.
No raw marker, transcript, Tool arguments or credentials were copied into
durable evidence.

This is **postmortem diagnosis only**, not live same-context proof. The final
rendered Assistant match was not persisted; packed journal chunk counts are
not live stream metrics. Approval/Question were not observed, with settlement
not exercised. A title-LLM request record exists; exact HTTP/retry counts were
not independently measured. One controlled Prompt/Tool Proof attempt was used.

The ledger retains the original reported failure and reservation history, with
a diagnostic correction to SHACO_IMPLEMENTATION_FAILURE and
`SAME_CONTEXT_FOLLOW_OBSERVATION_CAPTURE_FAILED`. It was not reset. An actual
Prompt always prevents reuse of an unsubmitted reservation. Attempt #2 remains
unused and unauthorized by the original healthy-no-Tool-only retry condition.

The observer now binds the actual public request, records bounded Session
hashes, reports malformed addresses, and requires a matching follow binding
before Composer submission. Missing completion alone no longer asserts a
Provider error. Future runs also persist rendered-marker match evidence.
Full units passed 112/112; typecheck, build, required Carrier/Worker/Electron
regressions and the final Session-only runtime checks passed. The exact command
ledger is in Implementation Record section 12.

| Final non-Provider UI diagnostic | Actual evidence |
|---|---|
| Result | SESSION_SETUP_PROVEN, exit 0; full user loop NOT_PROVEN |
| Session hash / follow binding | `bc3c6d81573eca33d655668700d4cca911540c35fedde30bb6adafa1991df5f8`, matching actual stream |
| Workspace associated / Composer ready | true / true |
| Prompt / observer errors / dropped metadata | 0 / 0 / 0 |
| Budget before / after | 1/2 / 1/2, identical bytes |
| Maximum frame | 251617 / frozen 262144 |
| Peak streams / queue / pulls per stream | 5 / 1 / 1 |
| Final streams / pending unary / residual processes | 0 / 0 / 0 |
| Controlled proof | 32 bytes, unchanged; removed after snapshots |

Attempt #1's own proof was also unchanged (proof.txt only, 32 bytes, matching
hash), with no residual processes, frame max 249110, queue max 4, credits 4,
queue cap 16 and zero credit/terminal violations. Its live Agent concurrency
and streaming completion remain unproved by the defective observer; the
postmortem records one completed Agent turn.

Current completion is withheld. Revalidation after this implementation failure
requires an Owner decision on the retry condition and a fresh controlled
Workspace, while retaining the two-attempt ceiling and all evidence history.
No further Prompt was sent. The existing F-05/NF-6 dispositions, frozen
Architecture, Independent Review and closure states remain unchanged.

## 11. Owner-authorized corrective revalidation

[Owner decision](../../04-development-records/V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-OWNER-DECISION.md)
V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-20260908-01 now authorizes exactly
Attempt #2 for fresh complete live evidence. Decision: 10466 bytes, SHA-256
aa286888e7e8479481cbae3de71e1217cdfa1572a90bb2757dd439f87a5ad6bc.
The first attempt's artifacts/ledger history remain immutable and its live Gate
remains NOT_PROVEN. Owner failure classification is supplementary
EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE, not a rewrite of the existing outcome.
The ordinary healthy-no-Tool retry rule remains intact; the narrow corrective
route requires new run/Workspace/marker/Session/request identities and cannot
consume authority more than once. An exclusive durable claim precedes Send.

The full preflight includes new policy tests, all units/build/runtime checks and
a new zero-Prompt Session/follow binding check with identical budget bytes.
At this preparation checkpoint budget is 1 consumed / 1 remaining, Attempt #2
not yet reserved, real user loop NOT_PROVEN. Attempt #3 is prohibited under every
outcome. Independent Review and closure remain unperformed.

## 12. Final Attempt #2 live evidence: PASS

The one-time Owner authority was reserved and consumed exactly once. The second
and final allowed attempt supplies all required live same-context evidence.
This supersedes the earlier NOT_PROVEN checkpoints without rewriting their
artifacts or outcomes. No postmortem substitutes for the live proof below.

| Item | Same-run live evidence |
|---|---|
| Run | 6c938e42-ce2d-4b23-8800-ee29ed377348 |
| Workspace identity SHA-256 | e0c93000087acb3a5ee313225e3fadc6bd55f18b244b997aeb45bcbdeb43652f |
| Controlled path SHA-256 | 288c1c537b7914a928a525a18771c408e4684440c167445627dfea7d6dcfd919 |
| Session SHA-256 | 680931fced7b1f84cd74a666f70110dbee37f7bc3db3b6a4901af8ea5396576f |
| Prompt request SHA-256 | b917da158d3aa3062f3fbd14b99417a7e363eb125fc5bdb92a2d5758a33fc873 |
| Expected / Tool / Assistant / rendered marker SHA-256 | 9308790fca683642b1fc5f29a3a5b5f08f76283924bc22b9cb8687f306d1b920; all match true |
| Tool call correlation SHA-256 | 5b9b51a9fcfc89a427481cc39f86c30142454cf3f7312ffc9896aa65997545b2 |
| Provider / model | deepseek-official / deepseek-v4-flash; Harness-owned |
| Routable / credential ready | true / true; no credential value read or emitted |
| Composer | exact draft matched, Send enabled, editor focused; real DOM Send clicked |
| Prompt accepted | one; timestamp 1788845357881 |
| Reservation | V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-20260908-01:ATTEMPT_2; timestamp 1788845357832, before Prompt |
| Agent turn / steps / live chunks | 1 completed / 2 / 78 |
| Tool / Result | one read; isError=false; correlated successful marker result |
| Rendered final Assistant | markerMatch=true in the same AppWebEntry DOM |
| Observer | order violations=0; duplicate terminals=0; errors=0; dropped metadata=0; pending hashes=0 |
| Multi-Agent | subagent=0, subagent_fork=0, forbidden control calls=0, child spawns observed=0 |
| Approval / Question | NOT_TRIGGERED; settlement not exercised |
| Workspace before / after | proof.txt only; 32 bytes; listing and hash unchanged; removed after snapshot |
| Carrier | max frame 256153/262144; peak streams 5; queue peak 4; one Renderer pull per stream |
| Frozen flow control | initial credits 4, queue capacity 16 unchanged |
| Carrier terminal / credit / overflow | duplicate terminals=0; items after terminal=0; credit violations=0; oversize frames=0 |
| Cleanup | final streams=0, pending unary=0, residual Product PIDs=0, TCP listeners=0 |
| Topology | Main 36164, Worker 24512, Host 50832, Native Helper 48264 |
| Budget | before 1/2; after 2/2; authority CONSUMED; Attempt #3 prohibited |

| Live event | Source sequence |
|---|---:|
| turn/start | 4 |
| step/start | 6 |
| assistant/chunk | 14 |
| assistant/message | 64 |
| tool/call | 65 |
| tool/result | 66 |
| step/end | 67 |
| step/start | 68 |
| assistant/chunk | 69 |
| assistant/message | 97 |
| step/end | 98 |
| turn/end | 99 |

Only the first chunk row per step is retained; all 78 chunks are counted.
Source-sequence gaps in this compact semantic table represent other observed
events and bounded chunk reduction, not stream loss. The observer checked the
full event sequence and recorded zero order violations.

Runtime 6c938e42-ce2d-4b23-8800-ee29ed377348.json is 38429 bytes, SHA-256
257c57f304d8ec7f562a342d127dd45d8517468b95f0901370d344407ffe83f8.
Its raw report, summary, authorization, exclusive reservation claim and Executor
live audit remain local/ignored. Their exact bytes/hashes and all regression
commands are recorded in Implementation Record section 14.

All 13 preflight and 12 applicable post-attempt regression checks passed.
Affected tests: 51/51. Full units: 120/120. The zero-Prompt preflight Session
447b0749-e0d7-4267-9fd6-09dbf080f2ea verified current follow binding with unchanged 1/2
ledger bytes. Post-regression left the final 2/2 ledger byte-identical.
No further Prompt was sent. Harness-owned Provider completed this turn without
an observed Provider error; exact HTTP/internal retry counts are not independently
measured. Approval/Question were NOT_TRIGGERED.

Attempt #1's immutable original ledger outcome remains SHACO_IMPLEMENTATION_FAILURE
and its original Runtime reported HARNESS_PROVIDER_OR_NETWORK_FAILURE. Its
postmortem confirms real read/result/marker/completed-turn behavior but its live
Gate remains NOT_PROVEN. Original history was compared with the pre-authority
byte snapshot; all original Runtime/summary/postmortem hashes still match.
The Owner's failure classification is supplementary metadata.

Final state: IMPLEMENTED_WAITING_INDEPENDENT_REVIEW, implementation PASS,
Independent Review NOT_STARTED, Owner Closure NOT_PERFORMED, implementation
baseline NOT_FROZEN and Slice 1 IN_PROGRESS. The approved standard preset
settings corrective retains module defaults and no Multi-Agent expansion.
Existing F-05/NF-6 statuses and all six frozen Architecture document bytes
remain unchanged. No staging, commit, push or budget expansion occurred.

Final documentation hygiene and closing read-only checks passed: 29 changed/new
files, strict UTF-8 without BOM, zero suspicious text, 45 valid local Markdown
links, six frozen document byte hashes unchanged, unchanged lockfiles and empty
staging. Product/Frozen HEADs and clean Frozen Harness were rechecked. The final
process query found zero Product/Host/Native Helper residuals. Source fingerprint
still matches the successful preflight. Original Attempt #1 artifacts and Owner
decision hashes match; the final ledger has two consumed attempts and unchanged
first-attempt history. All closing commands exited 0.
