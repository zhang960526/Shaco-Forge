# V1-SLICE-2 Step3 Outer Shell / Native / Interaction Contract Gate

Document Type: `V1_SLICE_2_STEP3_IMPLEMENTATION_CONTRACT_GATE`

Status: `FROZEN_FOR_STEP3_IMPLEMENTATION`

Date: `2026-09-10`

This Contract Gate preserves the corrected candidate semantics accepted by
REVIEW-025B. The Architecture Owner freezes this gate and authorizes only the
bounded Step3 implementation through the decision linked below. Authorization
is not implementation started; this governance operation starts no implementation.
The frozen Slice2 Contract and Frozen Harness baseline remain unchanged.

Owner Freeze Decision: [Step3 Contract Gate Freeze / Implementation Authorization Decision](../04-development-records/V1-SLICE-2-STEP3-CONTRACT-GATE-FREEZE-AND-IMPLEMENTATION-AUTHORIZATION-DECISION.md)

Historical Review: [REVIEW-025 FAIL](../05-reviews/architecture/AUDIT-025-V1-SLICE-2-STEP3-CONTRACT-GATE-INDEPENDENT-REVIEW.md)

Final Contract Review: [REVIEW-025B PASS](../05-reviews/architecture/AUDIT-025B-V1-SLICE-2-STEP3-CONTRACT-GATE-CORRECTIVE-REREVIEW.md)

```text
REVIEW_025 = FAIL
REVIEW_025_BLOCKING_FINDINGS = R25-01_PUBLIC_INTERACTION_EVENT_ID_NOT_PUBLIC
R25_01_CORRECTIVE = CLOSED_BY_REVIEW_025B
REVIEW_025B = PASS
V1_SLICE_2_STEP3_CONTRACT_GATE = FROZEN
V1_SLICE_2_STEP3_CONTRACT_GATE_FINAL_REVIEW = REVIEW-025B_PASS
V1_SLICE_2_STEP3_CONTRACT_GATE_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP3_R25_01 = CLOSED_BY_CORRECTIVE_REREVIEW
V1_SLICE_2_STEP3_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP3 = AUTHORIZED_NOT_STARTED
PROVIDER_GATE_AUTHORIZATION = NO
CONTRACT_AMENDMENT_REQUIRED = NO
FROZEN_HARNESS_BASELINE_CHANGE = NO
NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP3_LONG_RUNNING_IMPLEMENTATION_GOAL
REVIEWED_CORRECTED_CANDIDATE_BYTES = 31325
REVIEWED_CORRECTED_CANDIDATE_SHA256 = 79a1d4d9f8e9100f118ea4260d2a5ccbeb1767b6c0c71eba030b81d867b16b5e
CONTRACT_AMENDMENT_INTERPRETATION_STATUS = CONFIRMED_BY_REVIEW_025B
```

## 1. Authority and baseline

This frozen Contract Gate is subordinate to the Owner Freeze Decision above
and the accepted frozen contracts:

- [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md)
- [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md)
- [V1.0 Development Map](SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md)
- [Slice2 Lifecycle / Native / Reconnect Contract](V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
- [Carrier Lifecycle Amendment](V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
- [Security Model](../02-architecture/SHACO-FORGE-SECURITY-MODEL.md)
- [V1.0 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md)
- [UI Design Specification](../01-product/SHACO-FORGE-UI-DESIGN-SPEC.md)
- [P0-3 Client to Host Contract Map](../06-testing-acceptance/evidence/P0-3-CLIENT-HOST-CONTRACT-MAP.md)
- [Step2 Owner Closure and Freeze Decision](../04-development-records/V1-SLICE-2-STEP2-OWNER-CLOSURE-AND-FREEZE-DECISION.md)

The historical initial persistence baseline (before the five-path candidate) is:

```text
PRODUCT_ROOT = D:/Project/Shaco-Forge
PRODUCT_BRANCH = master
PRODUCT_HEAD = 615d6e33c6fe7b11dedb8c81479097f9b7c8f6a9
PRODUCT_WORKTREE_AT_ENTRY = CLEAN
PRODUCT_STAGED_AT_ENTRY = NONE
PRODUCT_UNTRACKED_AT_ENTRY = NONE
FROZEN_HARNESS_ROOT = D:/Project/Shaco-Forge-Upstream/deepseek-harness
FROZEN_HARNESS_HEAD = cd5ef8148158c3a752a658978873241fdf8e2bbc
FROZEN_HARNESS_WORKTREE_AT_ENTRY = CLEAN
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP2 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP2_OWNER_CLOSURE = ACCEPTED
V1_SLICE_2 = IN_PROGRESS
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
V1_SLICE_2_STEP3_IMPLEMENTATION_AUTHORIZATION = NO
PROVIDER_GATE_AUTHORIZATION = NO
```

The R25-01 corrective entry retains the Product branch/HEAD and Frozen Harness
HEAD above, with exactly these existing five candidate paths: this Contract
Gate, Current State, Document Map, V1.0 Development Map, and Development Log.

```text
CORRECTIVE_ENTRY_CHANGED_PATHS = 5
CORRECTIVE_ENTRY_TRACKED_MODIFIED = 4
CORRECTIVE_ENTRY_UNTRACKED = 1
CORRECTIVE_ENTRY_STAGED = NONE
CORRECTIVE_ENTRY_FROZEN_HARNESS_WORKTREE = CLEAN
```

REVIEW-025 returned `FAIL` with one `HIGH / BLOCKING` finding, R25-01.
The Architecture Owner accepts that historical finding. REVIEW-025 identified
no other Blocking Finding. The corrective was independently accepted by
REVIEW-025B PASS; R25-01 is CLOSED_BY_CORRECTIVE_REREVIEW. The Owner Freeze
Decision now freezes this gate and grants bounded Step3 implementation authority.

## 2. Frozen Step3 scope

The only Step3 scope is:

```text
STEP_3_OUTER_SHELL_NATIVE_AND_INTERACTION_INTEGRATION
```

It contains only:

- Outer Sidebar;
- Outer New Chat;
- Project Directory;
- Global Settings thin surface;
- Native Workspace Picker;
- Harness Main Workspace integration;
- Approval / Question reuse boundary;
- Agent Cancel distinction;
- truthful Worker / Connection / Harness / Provider failure projection; and
- Step1 + Step2 + Step3 cumulative non-Provider regression.

It explicitly excludes Packaging, Installer, bundled Node, bundled Harness,
final controlled `DSH_HOME`, Upgrade/Rollback, Fresh Windows final acceptance,
Automation, Task/Step/Attempt, Planner/Reviewer pipeline, Multi-Agent,
Memory/RAG/Learning, a Shaco Provider framework, a second
Workspace/Session/Conversation truth, a second interaction settlement truth,
Broker, Windows Service, and any new Agent RPC.

No excluded capability may be added as a placeholder, preparatory domain,
hidden prerequisite, or implementation convenience.

## 3. Composition entry baseline and future final identity

The entry baseline and the future Step3 final implementation identity are two
different concepts and must never be conflated.

```text
FROZEN_HARNESS_HEAD = cd5ef8148158c3a752a658978873241fdf8e2bbc
FROZEN_HARNESS_ROWS = 28
SHACO_ROW_ID = @shaco-forge/desktop
SHACO_ROW_PUBLIC_EXPORT = @shaco-forge/desktop/client
TOTAL_ROWS = 29
CURRENT_GRAPH_REVISION = shaco-v1-slice-2-step2-cd5ef81
CURRENT_STEP2_SHACO_BUNDLE_SHA256 = f6a1c0730d5793aa910fd9ad9d4300acf5657c9eb4ab00a88a0457f1faaa105d
CURRENT_STEP2_MANIFEST_SHA256 = 3c84efd8417a8925fd8fb649e64f8b5b96a3f36eb6a371f78be169db8a183eff
CURRENT_STEP2_BOOTSTRAP_SHA256 = 4e5e67c4dd9f6c19c7470f5a4c97074fd9cf08eb89734e27111a2d80bc8dbe57
CURRENT_STEP2_APPLICATION_SHA256 = ec432b347b336ba20821293edce65b6e8a1990ff30f23f4a68d98112f687beed
STEP3_ENTRY_COMPOSITION_BASELINE_IDENTITY = FROZEN_CURRENT_29_ROW_BASELINE
CURRENT_STEP2_SHACO_BUNDLE_SHA_IS_STEP3_FINAL_SHA = NO
CURRENT_STEP2_MANIFEST_SHA_IS_STEP3_FINAL_MANIFEST = NO
STEP3_FINAL_IMPLEMENTATION_COMPOSITION_IDENTITY = PENDING_CONTROLLED_GENERATION
STEP3_FINAL_COMPOSITION_IDENTITY_GENERATION = REQUIRED
```

### 3.1 Exact current 28-row Frozen roster

The following table freezes the entry roster, order, public export, and bundle
identity. It is the current Step2 composition baseline, not a prediction of the
future Step3 Shaco bundle or canonical manifest.

| Order | Frozen row ID | Public export | Bundle SHA-256 |
|---:|---|---|---|
| 1 | `@deepseek-ai/dsh-client-modules` | `@deepseek-ai/dsh-client-modules/client` | `9361241bfbe8a02864df5df9fabf9fbbfa0f5a1914025badab36bdf1b9481751` |
| 2 | `@deepseek-ai/dsh-client-connection` | `@deepseek-ai/dsh-client-connection/client` | `d90ac3ecd5a1fa6eda2ad19639b739daca4b3b5c988c544fc4bffcff6b3c030e` |
| 3 | `@deepseek-ai/dsh-api-remotes` | `@deepseek-ai/dsh-api-remotes/client` | `7eb837812f3bd9978e9f20e0bef6cdb8c1d47f1e288912fab9b930827290cb3a` |
| 4 | `@deepseek-ai/dsh-client-ui-theme` | `@deepseek-ai/dsh-client-ui-theme/client` | `8d8e115c5fb3ba1fcb1f857eea860a0cf02d1c25d3bd779be20a622477c0605a` |
| 5 | `@deepseek-ai/dsh-client-locale` | `@deepseek-ai/dsh-client-locale/client` | `6eff57ca0085b7946344e99208a47d5794812dcd72e518ec7637565efec9cb50` |
| 6 | `@deepseek-ai/dsh-client-ui-layout` | `@deepseek-ai/dsh-client-ui-layout/client` | `5a9e93ec65359683fe660e91831e2299ff28483b67bdd06b8a7c6cdfdf3d8607` |
| 7 | `@deepseek-ai/dsh-client-ui-renderer` | `@deepseek-ai/dsh-client-ui-renderer/client` | `57cc5d86f23565ffe7909746fdcf5e84098ade4aaf3e8744e33654f1aac91144` |
| 8 | `@deepseek-ai/dsh-client-ui-session` | `@deepseek-ai/dsh-client-ui-session/client` | `a794b82a58f6e7740041456fc3690596db98db6619749b97c49cd2443a89d5ae` |
| 9 | `@deepseek-ai/dsh-client-ui-sidebar` | `@deepseek-ai/dsh-client-ui-sidebar/client` | `bde2fc86868432f804fbbc687ca5ef0890698e4d27522620ec997d6d15153816` |
| 10 | `@deepseek-ai/dsh-client-ui-settings` | `@deepseek-ai/dsh-client-ui-settings/client` | `0cb26d506adcf6a5ec51e62fea537c1d5afe19d7be41b4cccaaa40fc33d9e486` |
| 11 | `@deepseek-ai/dsh-client-ui-settings-general` | `@deepseek-ai/dsh-client-ui-settings-general/client` | `4faf105332b2e3beca646fa4c458d481faa06a7e9539c35c8f54a185b443189b` |
| 12 | `@deepseek-ai/dsh-client-ui-settings-models` | `@deepseek-ai/dsh-client-ui-settings-models/client` | `c4e99652b3f49cc4e36756381c49266c4bde1c2379848fbd6dbd8cd0c5cccc07` |
| 13 | `@deepseek-ai/dsh-client-ui-conversation` | `@deepseek-ai/dsh-client-ui-conversation/client` | `08444b1f96e3e3e1046d1c4769b61cf6c09d8d839f057a607915514d5d123827` |
| 14 | `@deepseek-ai/dsh-client-ui-approval` | `@deepseek-ai/dsh-client-ui-approval/client` | `1cb6c0afad99e3a61f16da5078cbba2d6e8e33ce5a162947ac876674e7e74f54` |
| 15 | `@deepseek-ai/dsh-client-ui-chat` | `@deepseek-ai/dsh-client-ui-chat/client` | `2d94875cb2e9d04d4d6392d1e0e4dfea392c88029d53a35ee4a28359865c82e1` |
| 16 | `@deepseek-ai/dsh-client-ui-tool` | `@deepseek-ai/dsh-client-ui-tool/client` | `899647a2aae079137b37a7e171e46b0394e8000e796f74e52b9045496fbe7f17` |
| 17 | `@deepseek-ai/dsh-client-ui-workspace` | `@deepseek-ai/dsh-client-ui-workspace/client` | `8c9836211951ec926134b50b0c0791e065a4e7c959cac289f13ec3d3753528af` |
| 18 | `@deepseek-ai/dsh-client-ui-directory-picker-browse` | `@deepseek-ai/dsh-client-ui-directory-picker-browse/client` | `502ea0a442005b271e08af2b82db1b82820dae374997a3c9bc24b3cd812dbee4` |
| 19 | `@deepseek-ai/dsh-client-ui-input-trigger` | `@deepseek-ai/dsh-client-ui-input-trigger/client` | `cc782452a703a1106499bcc1c54bbdd68bc939c99e3a399541d59a04391bc282` |
| 20 | `@deepseek-ai/dsh-client-ui-commands` | `@deepseek-ai/dsh-client-ui-commands/client` | `3fb21f2f0ffc4c7e7bec57ab8029d3454a0f7f9d8990d274c4e20dcace051dc0` |
| 21 | `@deepseek-ai/dsh-client-ui-subagent` | `@deepseek-ai/dsh-client-ui-subagent/client` | `590b9224d3e5a99cce88ba1e72d4b96f40fb328ac7ed69ad0e869f5c2d2bd9fb` |
| 22 | `@deepseek-ai/dsh-client-ui-model-selection` | `@deepseek-ai/dsh-client-ui-model-selection/client` | `7c1c4aeb06f5b057ba484fd6b4729f866cecc5c558dda7870adca8a3beea28fb` |
| 23 | `@deepseek-ai/dsh-client-ui-permission-presets` | `@deepseek-ai/dsh-client-ui-permission-presets/client` | `9a4279ba5fc1ca4e0b86175e88cd33a269294dd4cffbfd0f3a8badeb10de9ba8` |
| 24 | `@deepseek-ai/dsh-client-ui-user-questions` | `@deepseek-ai/dsh-client-ui-user-questions/client` | `271fa5bae4a54fd92e217dd98b1286aaddde267ff31d3d93ed13dc8c0c60dbd5` |
| 25 | `@deepseek-ai/dsh-typert-registry` | `@deepseek-ai/dsh-typert-registry/client` | `116a1d5ac12355d0713444368158c889cb0e926c7f89d4d35487d648fe30fd0a` |
| 26 | `@deepseek-ai/dsh-api-gateway` | `@deepseek-ai/dsh-api-gateway/client` | `fe28e214b4bcc7fa35236e44ed541944e16bbf1ec003fc860e4d4bb09ec218b3` |
| 27 | `@deepseek-ai/dsh-api-session-controller` | `@deepseek-ai/dsh-api-session-controller/client` | `52c8210e144d570c88f436da9434984d01ecbf141075ea766427fae85bc70ddb` |
| 28 | `@deepseek-ai/dsh-api-workspace-controller` | `@deepseek-ai/dsh-api-workspace-controller/client` | `6142956344e24492f88649d52c66618d99580738d6c4b7c6f4d1a5394c3e5e5a` |

The current row 29 is `@shaco-forge/desktop`, from public export
`@shaco-forge/desktop/client`, with current Step2 bundle SHA-256
`f6a1c0730d5793aa910fd9ad9d4300acf5657c9eb4ab00a88a0457f1faaa105d`.

### 3.2 Required future controlled generation

After Step3 Product source is implemented under a future explicit authority,
and before any Step3 Runtime acceptance, one controlled generation must freeze:

- the exact 28 Frozen IDs and exact Frozen order;
- every Frozen public export and bundle SHA-256;
- the Shaco row ID and public export;
- the new Step3 Shaco bundle SHA-256;
- `TOTAL_ROWS = 29`;
- the graph revision;
- the canonical manifest and canonical manifest SHA-256; and
- bootstrap and application artifact identities.

Machine-specific absolute paths are forbidden from canonical identity. A
canonical manifest must omit them or use a stable repository-relative identity
that is independent of the generating machine.

### 3.3 Composition fail-closed requirements

```text
DUPLICATE_ROW = FAIL_CLOSED
DUPLICATE_FACTORY = FAIL_CLOSED
MISSING_REQUIRED_FROZEN_ROW = FAIL_CLOSED
WRONG_ROW_ORDER = FAIL_CLOSED
GRAPH_BATCH_INCONSISTENCY = FAIL_CLOSED
TOTAL_ROWS_NOT_29 = FAIL_CLOSED
```

Checking only a correct count or a unique set is insufficient. Validation must
compare the complete exact roster and exact order, row identities, public
exports, artifact hashes, graph/batch consistency, and total row count.

## 4. Sidebar gate

```text
SIDEBAR_PUBLIC_SEAM = CONFIRMED
EXACT_SEAT_NAME = sidebar
SLOT_TYPE = single / root
PRIORITY_MODEL = ASCENDING_NUMERIC_LOWEST_WINS
CURRENT_FROZEN_OCCUPANT = @deepseek-ai/dsh-client-ui-sidebar / SidebarRoot
CURRENT_FROZEN_OCCUPANT_PRIORITY = 0
SHACO_SIDEBAR_PRIORITY = -1
REGISTRATION = PUBLIC_SLOT_API_ONLY
```

The only legal registration path is `ctx.slots.inject('sidebar', ...)` and
`ctx.slots.register(...)`. The Shaco shadow winner replaces only the Sidebar
render winner. It must not delete the Frozen registration, create a second
Context or AppWebEntry, or redeclare the Frozen child slots.

`uiWorkspace`, `sessions`, `connection`, and every other root Context service
remain owned by the original Harness Context. They must not be bound to the
Frozen Sidebar React mount lifecycle. Future Runtime evidence must prove that
Sidebar shadow, unmount/remount, and reconnect rebind do not lose business
services.

## 5. New Chat gate

```text
NEW_CHAT_PUBLIC_SEAM = CONFIRMED
PRESET_OWNERSHIP = HARNESS
```

With a selected Workspace, the flow is:

```text
Outer New Chat
  -> uiWorkspace.connectWorkspace(workspaceId)
  -> Harness sessions.create({ workspaceId }) only when required
  -> sessions.open(sessionId)
  -> Harness conversation
```

Harness may reuse a qualifying blank Session. The Product must not promise a
new Session record on every click. The Host current standard preset remains
valid and Harness-owned.

Private UI, DOM click automation, fabricated `session/open` RPC, and Shaco
Session truth are forbidden. With no selected Workspace, Outer New Chat must
enter Open Project / Native Picker flow. It must not silently substitute a
recent-Workspace fallback for this Product requirement.

## 6. Project Directory gate

```text
PROJECT_DIRECTORY_PUBLIC_COVERAGE = COMPLETE
WORKSPACE_TRUTH_OWNER = HARNESS
SESSION_TRUTH_OWNER = HARNESS
```

The data sources are `ctx.workspaces.list` and `ctx.sessions.list`. Session open
uses `ctx.sessions.open(sessionId)`. Workspace entry uses the public Harness
workspace navigation/connect semantics.

Search of the current projection, expand/collapse, selected-Workspace ephemeral
state, and a project-scoped New Chat shortcut are allowed. Workspace, Session,
or Chat databases and persistent selected-Workspace truth are forbidden.

Every Project Directory projection is:

```text
EPHEMERAL
GENERATION_FENCED
DISCARD_ON_GENERATION_CHANGE
```

## 7. Global Settings thin-surface gate

```text
SETTINGS_TRUTH_OWNER = HARNESS
PUBLIC_PROGRAMMATIC_OPEN_SETTINGS = NO
SETTINGS_PATH = Outer Settings entry -> Shaco ephemeral route -> shell.overlay -> thin Settings surface
```

The Product must not control, scrape, or deep-import the Frozen Settings UI.
The public capability matrix is:

| Capability | Step3 public coverage |
|---|---|
| Provider | `CONFIRMED` |
| Custom Provider | `CONFIRMED` |
| Model | `CONFIRMED` |
| API Endpoint | `CONFIRMED` |
| Relay | `CONFIRMED` |
| Credential | `CONFIRMED` |
| Necessary General | `MINIMAL_SCHEMA_DRIVEN_ONLY` |

The applicable public capabilities are `remote.llm`, `settingsScope`,
`settingsSchema`, `remote.settings`, `remote.credentials`, and Harness-owned
provider settings namespaces.

Provider, Custom Provider, Endpoint, and Relay use the Harness schema/settings
profile; no Shaco registry is permitted. API Endpoint and Relay truth is the
current provider profile's `baseURL`, `route`, `protocol`, and related
Harness-owned settings. Credential `describe` reads metadata/status only;
`set`/`unset` submits or removes a secret. Secret readback, ordinary settings
storage, logging, and Evidence capture are forbidden.

Settings mutation must honor namespace revision. If an undefined revision is
an unconditional write, the Product must not claim revision fencing. If the
Credential API has no revision, mutation safety is limited to the current
Client generation, an explicit operation, and `OUTCOME_UNKNOWN` reread. No
transactional or exactly-once property may be invented.

Model discovery that can perform real Provider network access must not run
without a separately authorized Provider Gate.

### 7.1 General Settings scope

```text
V1_STEP3_GENERAL_SETTINGS_COMPLETENESS = NOT_REQUIRED
V1_STEP3_REQUIRED_GENERAL_SETTINGS = MINIMAL_ONLY_IF_REQUIRED_BY_ACTIVE_V1_PROVIDER_MODEL_CREDENTIAL_WORKFLOW
APPEARANCE_COMPLETE_SETTINGS = DEFERRED
ADVANCED_GENERAL_SETTINGS = DEFERRED
```

The existence of a generic settings API does not require V1 to reproduce the
complete General Settings UI. This preserves the UI specification's “General
Settings = Minimal only as required” boundary.

## 8. Native Workspace Picker gate

The only new Step3 Preload capability is:

```text
window.shacoForge.workspace.pickDirectory(): Promise<string | null>
```

Electron Main uses `showOpenDialog` with directory-only, single-selection
options. Success returns a path string; user cancel returns `null`; failure is
`NATIVE_PICKER_FAILED`.

Main must validate the authorized window/frame before opening the Picker and,
after the awaited result returns, validate the current document and generation
again. A stale result must never trigger Workspace mutation. The same-context
Shaco row then calls `ctx.workspaces.create({ path })` or the current equivalent
Harness-owned public create/open semantic.

Renderer receives no `stat`, `readFile`, `readdir`, generic filesystem,
generic dialog options, or generic IPC capability.

## 9. Approval, Question, and interaction identity

```text
OUTER_INTERACTION_PROJECTION_REQUIRED = NO
HARNESS_MAIN_WORKSPACE_APPROVAL_UI = V1_REQUIRED_PRIMARY_INTERACTION_SURFACE
HARNESS_MAIN_WORKSPACE_QUESTION_UI = V1_REQUIRED_PRIMARY_INTERACTION_SURFACE
OUTER_APPROVAL_SETTLEMENT = FORBIDDEN
OUTER_QUESTION_SETTLEMENT = FORBIDDEN
OUTER_APPROVAL_QUESTION_PENDING_MODEL = DO_NOT_CREATE_FOR_V1_0
OUTER_APPROVAL_QUESTION_PROJECTION = NONE
```

The embedded Harness Main Workspace continues to satisfy the complete V1
Approval and Question requirements. This is not a V1 scope reduction: Desktop
reuses the real Harness interaction UI. Shaco must not create a second pending
object, Approval or Question state machine, answer UI, settlement truth, or
replay state.

### 9.1 R25-01 public identity boundary

```text
INTERACTION_EVENT_ID_PUBLIC_PATH = NOT_AVAILABLE_IN_CURRENT_FROZEN_PUBLIC_CLIENT_SURFACE
GATEWAY_WIRE_EVENT_ID_AS_PRODUCT_PUBLIC_API = FORBIDDEN
PENDING_LOCAL_KEY_AS_EVENT_ID = FORBIDDEN
PENDING_APPROVAL_LOCAL_KEY_IS_HARNESS_EVENT_ID = NO
PENDING_QUESTION_LOCAL_KEY_IS_HARNESS_EVENT_ID = NO
CURRENT_V1_OUTER_INTERACTION_IDENTITY_DEPENDENCY = NONE
GATEWAY_INTERNAL_EVENT_ID_DEPENDENCY = FORBIDDEN
PRIVATE_GATEWAY_TYPE_IMPORT = FORBIDDEN
TIMING_GUESS_CORRELATION = FORBIDDEN
SECOND_INTERACTION_TRUTH = FORBIDDEN
```

REVIEW-025 historical defect: the previous candidate incorrectly described
`frame.eventId` as a public client interaction identity seam. That claim is
withdrawn. This field is `INTERNAL_WIRE_DETAIL_NOT_PUBLIC_API`: it belongs to
Gateway-internal waterfall/wire correlation. Public Remote Event consumers
receive only public Cordis event arguments; the public
`TypertRemoteEventFrame` has no `eventId`.

Product Evidence observers or transport instrumentation being able to see the
internal field does not turn it into a stable public Product API. Step3 must
not depend on private/internal Gateway wire frames, private Gateway types,
pending local render keys, or timing guesses to manufacture a public identity.
V1 creates no Outer Approval/Question projection and therefore needs no Outer
interaction event ID or additional business event stream.

### 9.2 Frozen Main Contract section 11 interpretation candidate

The frozen Main Contract section 11 is interpreted as a conditional constraint:
if an Outer Shaco projection references an Approval/Question interaction, it
must respect Harness-owned identity and settlement truth. It does not require
V1 to create a separate Outer pending object. Because the frozen public client
surface has no stable interaction event ID, V1 chooses no Outer interaction
projection while the Harness Main Workspace retains the full interaction UI.

```text
CONTRACT_AMENDMENT_REQUIRED = NO
CONTRACT_AMENDMENT_INTERPRETATION_STATUS = R25-01_CORRECTIVE_CANDIDATE_FOR_REREVIEW
HARNESS_PUBLIC_INTERACTION_ID_CHANGE_REQUIRED = NO
FROZEN_HARNESS_BASELINE_CHANGE = NO
```

The `NO` amendment conclusion is the Architecture Owner's corrective candidate
for Independent Re-review, not an independently confirmed review result. The
Frozen Main Contract remains unchanged. No new Harness API or baseline upgrade
is requested, because V1 has no requirement for an extra Outer interaction
object.

Only if a future Architecture Owner adds an Outer pending badge, interaction
queue, approval navigation identity, or another feature requiring stable
correlation should a public Harness interaction identifier be reassessed.
Current Step3 must not prebuild those future capabilities.

### 9.3 Future Approval/Question preservation acceptance

Future Step3 acceptance must prove all of the following without an Outer
event ID:

- Harness Approval UI remains primary and usable after Outer Sidebar shadow;
- Harness Question UI remains primary and usable;
- Workspace/Session navigation keeps the interaction UI bound to the correct Session;
- Desktop reconnect and cold rebuild restore pending interactions from Harness-owned truth;
- Shaco creates no second settlement truth or duplicate Approval/Question UI;
- Shaco performs no automatic answer or replay; and
- Carrier disconnect is not Agent Cancel.

## 10. Agent Cancel gate

```text
CARRIER_DISCONNECT_IS_AGENT_CANCEL = NO
CANCEL_PUBLIC_SEAM = CONFIRMED
```

Harness Main Workspace may continue to use its existing cancel semantics. If
Shaco must invoke cancel, it uses the current public Session binding,
`sessions.binding(id)?.session.cancel()`, or the confirmed equivalent public
seam. Desktop close, Carrier disconnect, and reconnect must never automatically
become Agent Cancel. Unknown outcome requires rereading Harness truth with no
blind replay.

## 11. Renderer security gate

Renderer remains `UNTRUSTED`. The sole new native Preload capability permitted
by Step3 is `workspace.pickDirectory()`. Step3 must not expose generic Worker
IPC, generic filesystem, Carrier endpoint, lifecycle pipe, secret,
`credentialEpoch`, Node API, or private Harness access to Renderer.

## 12. Truthful failure projection gate

The Step2 connection states remain:

```text
DISCONNECTED
DISCOVERING
WORKER_STARTING
AUTHENTICATING
CONNECTED
CONNECTION_LOST
RECONNECTING
INCOMPATIBLE
FAILED
```

`CONNECTED` still requires all three predicates:

```text
AUTHENTICATED_CARRIER
+ CURRENT_CLIENT_GENERATION_READY
+ PROJECTION_REBUILD_COMPLETE
```

Failure attribution remains truthful:

```text
HARNESS_FAILURE != PROVIDER_FAILURE
PROVIDER_FAILURE != WORKER_FAILURE
OUTCOME_UNKNOWN = TRUTHFUL_UNKNOWN_OUTCOME
BLIND_RETRY = FORBIDDEN
```

## 13. V1 UI exposure

Step3 V1 exposes one Sidebar, a Fixed Function Area containing New Chat only,
a Project Directory containing Workspace plus Session/Chat only, Global
Settings, the central Harness Main Workspace, and low-noise Worker/Connection
state. There is no permanent right Inspector.

Automation, Agent Collaboration, Knowledge Base, Task/Step/Attempt,
Memory/RAG, Coming Soon placeholders, and empty future dashboards are
forbidden.

## 14. Dedicated Step3 gates

Every gate below is a future closure obligation. None is marked PASS by this
candidate.

| Gate | Frozen requirement | Candidate state |
|---|---|---|
| S3G01 | Exact current entry 29-row baseline identity | `REQUIRED / NOT_RUN` |
| S3G02 | Step3 final composition identity generated and frozen before Step3 Runtime acceptance | `REQUIRED / NOT_RUN` |
| S3G03 | Duplicate/missing/order/graph mismatch fails closed | `REQUIRED / NOT_RUN` |
| S3G04 | Sidebar exact seat, priority, current occupant, and public shadow semantics | `REQUIRED / NOT_RUN` |
| S3G05 | No duplicate AppWebEntry, Context, Workspace, Session, or Conversation truth | `REQUIRED / NOT_RUN` |
| S3G06 | Outer New Chat selected-Workspace public flow | `REQUIRED / NOT_RUN` |
| S3G07 | Outer New Chat with no Workspace enters Open Project flow | `REQUIRED / NOT_RUN` |
| S3G08 | Project Directory uses Harness Workspace/Session truth | `REQUIRED / NOT_RUN` |
| S3G09 | Workspace/Session select/open and generation-fenced rebuild | `REQUIRED / NOT_RUN` |
| S3G10 | Provider / Custom Provider public Settings path | `REQUIRED / NOT_RUN` |
| S3G11 | Model / API Endpoint / Relay Settings path | `REQUIRED / NOT_RUN` |
| S3G12 | Credential submission and secret hygiene | `REQUIRED / NOT_RUN` |
| S3G13 | Native Picker success | `REQUIRED / NOT_RUN` |
| S3G14 | Native Picker cancel | `REQUIRED / NOT_RUN` |
| S3G15 | Native Picker failure/stale result and no generic filesystem | `REQUIRED / NOT_RUN` |
| S3G16 | HARNESS_MAIN_WORKSPACE_APPROVAL_QUESTION_PRESERVATION (section 14.1) | `REQUIRED / NOT_RUN` |
| S3G17 | PUBLIC_INTERACTION_IDENTITY_BOUNDARY (section 14.2) | `REQUIRED / NOT_RUN` |
| S3G18 | Agent Cancel is distinct from Carrier disconnect | `REQUIRED / NOT_RUN` |
| S3G19 | Renderer security and truthful failure attribution | `REQUIRED / NOT_RUN` |
| S3G20 | Step1 + Step2 + Step3 cumulative non-Provider E2E | `REQUIRED / NOT_RUN` |

### 14.1 S3G16 - HARNESS_MAIN_WORKSPACE_APPROVAL_QUESTION_PRESERVATION

State: `REQUIRED / NOT_RUN`.

Future acceptance must prove that Harness Approval and Question UI remain
primary and usable; Outer Sidebar integration does not hide or break required
interaction discoverability; there is no duplicate Approval/Question UI or
settlement; and reconnect causes no automatic answer or replay. The correct
Session binding and Harness-owned pending recovery obligations in section 9.3
also apply.

### 14.2 S3G17 - PUBLIC_INTERACTION_IDENTITY_BOUNDARY

State: `REQUIRED / NOT_RUN`.

Future acceptance must prove:

```text
INTERACTION_EVENT_ID_PUBLIC_PATH = NOT_AVAILABLE_IN_CURRENT_FROZEN_PUBLIC_CLIENT_SURFACE
OUTER_APPROVAL_QUESTION_PROJECTION = NONE
PENDING_LOCAL_KEY_AS_EVENT_ID = FORBIDDEN
GATEWAY_INTERNAL_EVENT_ID_DEPENDENCY = FORBIDDEN
PRIVATE_GATEWAY_TYPE_IMPORT = FORBIDDEN
TIMING_GUESS_CORRELATION = FORBIDDEN
SECOND_INTERACTION_TRUTH = FORBIDDEN
```

This gate proves that Step3 has no illegal interaction identity dependency;
it does not require the Product to manufacture a nonexistent public ID.

## 15. Cumulative non-Provider E2E contract

Future Step3 Closure must prove at least this chain:

```text
Product startup
-> Worker authority
-> authenticated Carrier
-> current Client generation
-> Product CONNECTED
-> exact 29-row composition
-> Outer Sidebar
-> Project Directory Harness projection
-> no Workspace state
-> Native Picker
-> Workspace create/open
-> Project Directory update
-> Outer New Chat
-> preset-aware Session create/connect/open
-> Harness Conversation visible
-> Provider/Custom Provider/Endpoint/Relay/Model/Credential Settings local/public path
-> Harness Approval/Question interaction surface remains mounted/reachable
-> correct Session interaction binding after Workspace/Session navigation
-> no duplicate settlement
-> Agent Cancel distinction
-> Desktop graceful close
-> Worker survives
-> fresh Desktop
-> same Worker reconnect
-> generation replacement
-> cold Workspace/Session projection
-> Outer shell rebind
-> Harness-owned pending interaction recovery and usable interaction UI
-> no automatic answer/replay/cancel
-> stale generation rejection
-> Worker replacement
-> cold rebuild
-> interaction UI remains Harness-owned and mounted/reachable
-> no automatic answer/replay/cancel
-> bounded cleanup
```

This chain creates no Outer Approval/Question pending projection and has no
Outer interaction event ID dependency. Approval/Question fixtures must use a
legal non-Provider deterministic path. If such a fixture path is unavailable,
interaction gates may use structural/fixture verification with the method and
limits recorded; no real Provider may be run to generate an interaction.

This chain must not run a Provider. If Model discovery can access a Provider,
it is excluded from the non-Provider Gate unless separately authorized.

Future Closure requires all of:

```text
STEP1_REGRESSION = PASS
STEP2_RECOVERY_REGRESSION = PASS
STEP3_DEDICATED_GATES = PASS
CUMULATIVE_NON_PROVIDER_E2E = PASS
FULL_BUILD_TYPECHECK_UNIT_STATIC = PASS
INDEPENDENT_REVIEW = PASS
```

Historical Step1/Step2 PASS results do not replace the new cumulative Closure
run against the final Step3 source.

## 16. Packaging boundary

Step3 must not implement bundled Node, bundled Harness, final `DSH_HOME`,
Installer, Upgrade, Rollback, or release Packaging. These belong to
`V1_SLICE_3`. If Step3 requires Packaging first:

```text
STOP = PACKAGING_DEPENDENCY_SCOPE_VIOLATION
```

## 17. Stop conditions

Stop without workaround or scope expansion on any of the following:

- Frozen Harness modification or dirty state;
- private Harness source import as a Product Runtime dependency;
- DOM scraping or private React state;
- second Workspace/Session/Conversation truth;
- second Approval/Question settlement truth;
- new Agent RPC;
- generic filesystem Preload or generic Worker IPC;
- Carrier security or wire mutation;
- Provider run without Architecture Owner authorization;
- a Step3 dependency on Slice3 Packaging;
- missing required public Settings capability;
- illegal pending-local-key to `eventId` mapping;
- Gateway internal interaction ID dependency, private type import, or timing-guess correlation;
- creation of a V1 Outer Approval/Question pending projection;
- duplicate Context or AppWebEntry; or
- future-feature scope expansion.

## 18. Composition timing independent-review flag

This is an explicit Independent Review challenge, not a resolved PASS claim:

```text
STEP3_ENTRY_COMPOSITION_BASELINE = CURRENT_29_ROW_IDENTITY
STEP3_FINAL_IMPLEMENTATION_COMPOSITION_IDENTITY = GENERATED_AFTER_STEP3_SOURCE_CHANGE AND BEFORE_STEP3_RUNTIME_ACCEPTANCE
COMPOSITION_IDENTITY_TIMING_CLARIFICATION = CANDIDATE_FOR_INDEPENDENT_REVIEW
```

The current Step2 Shaco row hash cannot also be the final hash after Step3
source changes. If Independent Review determines that the timing above
conflicts semantically with the frozen Main Contract wording “before Step 3
implementation”, the review must return FAIL and require a Contract corrective.
The dispute must not be hidden or silently interpreted as already reviewed.

## 19. Persistence and review boundary

This Owner Freeze performs documentation-safe validation only. It does not run
build, typecheck, test, smoke, Electron, Worker, Harness Runtime, Provider,
Prompt, or Tool/Agent-turn. Product Source, Tests, Scripts and Evidence remain
unchanged. Exactly nine governance paths may be explicitly staged and committed
once, only after all required validation passes; push is not authorized.
Step3 implementation is authorized for subsequent execution and is not started
by this governance operation.

REVIEW-025 remains a historical FAIL. REVIEW-025B PASS closes R25-01 and is the
final Contract Gate review. The Owner accepts REVIEW-025 composition timing as
PASS_CLARIFICATION with no Contract amendment. Sections 2-18 remain byte-identical
to the REVIEW-025B corrected candidate, including the historical review challenge
wording in section 18. Its review outcome is recorded here and in the Owner
Decision; that retained challenge wording is not an outstanding current blocker.
Review acceptance concerns contract quality and does not claim S3G01-S3G20
implementation or Runtime PASS.

```text
REVIEW_025 = FAIL
REVIEW_025_BLOCKING_FINDINGS = R25-01_PUBLIC_INTERACTION_EVENT_ID_NOT_PUBLIC
R25_01_CORRECTIVE = CLOSED_BY_REVIEW_025B
REVIEW_025B = PASS
V1_SLICE_2_STEP3_CONTRACT_GATE = FROZEN
V1_SLICE_2_STEP3_CONTRACT_GATE_FINAL_REVIEW = REVIEW-025B_PASS
V1_SLICE_2_STEP3_CONTRACT_GATE_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP3_R25_01 = CLOSED_BY_CORRECTIVE_REREVIEW
V1_SLICE_2_STEP3_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP3 = AUTHORIZED_NOT_STARTED
PROVIDER_GATE_AUTHORIZATION = NO
CONTRACT_AMENDMENT_REQUIRED = NO
FROZEN_HARNESS_BASELINE_CHANGE = NO
NEXT_ACTION = EXECUTE_V1_SLICE_2_STEP3_LONG_RUNNING_IMPLEMENTATION_GOAL
COMPOSITION_TIMING = PASS_CLARIFICATION
STEP3_FINAL_IMPLEMENTATION_COMPOSITION_IDENTITY = PENDING_CONTROLLED_GENERATION
STEP3_FINAL_COMPOSITION_IDENTITY_GENERATION = REQUIRED
```

The accepted execution order is: Step3 authorized source implementation ->
controlled final composition generation -> freeze final Step3 composition
identity -> only then Step3 Runtime acceptance. Step2 bundle/manifest hashes
are not final Step3 identities; S3G02 cannot be claimed PASS before the final
identity is generated. Provider authorization remains NO.
