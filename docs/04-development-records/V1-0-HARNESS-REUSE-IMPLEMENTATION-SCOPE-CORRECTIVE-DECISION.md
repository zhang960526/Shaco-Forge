# V1.0 Harness Reuse Implementation Scope Corrective Decision

| Field | Value |
|---|---|
| Decision ID | `V1-0-HARNESS-REUSE-SCOPE-CORRECTIVE-20260906-01` |
| Document Status | `FINAL_V1_IMPLEMENTATION_SCOPE_CORRECTIVE` |
| Decision Date | `2026-09-06` |
| Decision Owner | Architecture Owner |
| Corrective Type | V1.0 Implementation Scope Governance Corrective |
| P0.S Reopen | `NO` |
| Product Implementation | `NOT_STARTED` |

## 1. Decision

```text
SCOPE_RECONCILIATION_VERDICT = V1_0_SCOPE_EXPANSION_CONFIRMED
V1_0_ARCHITECTURE_SUFFICIENT = YES
V1_1_TO_V1_3_EXTENSION_SEAMS_SUFFICIENT = YES
V1_0_SCOPE_CORRECTIVE_REQUIRED = YES
P0S_REOPEN_REQUIRED = NO

CORRECTIVE_VERDICT = APPLIED
V1_0_IMPLEMENTATION_SCOPE = HARNESS_REUSE_PRODUCTIZATION
V1_0_PROVIDER_MODEL_OWNERSHIP = HARNESS
PROVIDER_MODEL_ROUTING = HARNESS_OWNED
SHACO_PROVIDER_FRAMEWORK_V1_0 = NOT_REQUIRED
MULTI_MODEL_SUPPORT = REUSE_HARNESS
MULTI_AGENT_ORCHESTRATION = FUTURE_SHACO_DOMAIN
```

Shaco Forge V1.0 is the Shaco Desktop / Supervisor / Carrier / Packaging
Productization Layer around the reused DeepSeek Harness Client / Host / Runtime.
The governing principle is:

```text
REUSE HARNESS
+ BUILD ONLY SHACO PRODUCTIZATION LAYER
+ PRESERVE FUTURE ORCHESTRATION SEAMS
```

V1.0 must not build a second Agent platform.

## 2. Supersede Boundary

This Decision supersedes only the expanded **V1.0 Implementation Scope
Allocation** in the [P0.S-8 V1 Product Architecture Freeze Decision](P0S-8-V1-PRODUCT-ARCHITECTURE-FREEZE-DECISION.md)
and the [V1 Product Architecture Plan](../03-v1.0-plan/SHACO-FORGE-V1-PRODUCT-ARCHITECTURE-PLAN.md),
including the corresponding first-Slice allocation. It does not delete or
invalidate their historical record.

The P0.S-8 Architecture Freeze retains its foundational value: Desktop/Worker
separation, Worker runtime authority, secure Main/Preload boundary, authenticated
local carrier, truth ownership, version/compatibility relations and future
extension seams remain accepted. This Corrective does not reopen P0.S and does
not change any P0.S technical Evidence.

## 3. Harness Truth and Data Ownership

Harness remains the sole authority for:

- Workspace.
- Session and Session History.
- Transcript and Conversation Runtime.
- Settings and Credentials.
- Provider Configuration and Model Configuration.
- API Endpoint and Relay Configuration.
- Profiles and Harness Persistence.
- Agent Runtime and Tool Runtime.
- Permission and Approval Runtime.

Shaco must not create a second truth for API keys, Provider credentials, API
base URLs, relay endpoints, Provider configuration, model registries, model
selection, Workspace state, Session history or transcript data. If Desktop must
show such state, it reuses the Harness Client UI or a truthful Harness projection
instead of copying and independently maintaining it.

The existing Harness `llm-pi-ai` / extra-provider capability confirms that
Provider, model, OpenAI-compatible route, external API endpoint and relay
configuration are Harness-owned capabilities wherever the pinned Harness
supports them. This does not expand Shaco V1.0 acceptance into full parity for
every dormant or future Provider.

## 4. REUSE_HARNESS

V1.0 reuses these Harness capabilities:

- Provider / Model: Provider system, DeepSeek, supported extra Providers,
  OpenAI-compatible/provider routing where Harness supports it, API endpoint /
  relay configuration, credentials, configured state, model discovery and model
  selection.
- Workspace: create, list, follow, select and persistence.
- Session: create, list, history/page, live follow, cold open, resume/continue,
  persistence and cancel.
- Conversation: prompt, streaming, durable history, tool records and business
  errors.
- Tools: `pwsh`, read, write, edit, grep, glob and `ask_user_question`.
- Permissions and Approval.
- Settings and Credentials.
- Harness Client UI.

## 5. REUSE_WITH_DESKTOP_ADAPTATION

Shaco may adapt only the delivery boundary required for the desktop product:

- Harness Client boot graph.
- Packaged assets and custom scheme.
- Desktop shell integration.
- Connection/Gateway physical carrier.
- Stream/events/generation transport.
- Native workspace picker.
- Trusted Desktop capability classification.
- Secret submission bridge.
- Approval/question/cancel projection.
- Reconnect and error mapping.
- Packaged runtime paths.

These adaptations must not rewrite Harness business capabilities or introduce a
second Agent RPC.

## 6. SHACO_MUST_BUILD_V1_0

V1.0 implementation is limited to:

1. Electron Desktop Shell.
2. Main / Preload secure boundary.
3. Harness Client Desktop loading/adaptation.
4. Native Windows bridge.
5. Native directory picker.
6. Per-user long-running Worker.
7. Worker-hosted Harness Host.
8. Supervisor.
9. Worker discovery.
10. Worker lifecycle.
11. Authenticated local carrier.
12. Truthful Desktop projection.
13. Minimal Shaco Control Store.
14. Version identities.
15. Compatibility handshake / fail closed.
16. Bundled Node/Harness runtime.
17. Controlled `DSH_HOME`.
18. Installer.
19. Minimal upgrade/backup/rollback.
20. Fresh Windows acceptance.

The minimal Control Store includes `schema_version` and migration capability but
does not create empty future-domain tables.

## 7. KEEP_AS_FUTURE_EXTENSION_POINT

The architecture preserves, but V1.0 does not implement:

- `AutomationDefinition` and `AutomationRun`.
- `Task`, `Step` and `Attempt`.
- `Artifact` and `Evidence`.
- Planner, Executor, Reviewer and Corrective.
- Workflow, Scheduler and Trigger.
- Retry, timeout, pause/resume/cancel, recovery and result passing as Shaco
  Automation orchestration.
- Project Memory, Experience, Feedback and Learning.
- Automation / Task to Harness Session reference relationships.
- Future Desktop surfaces for Automation, Tasks, Workflow, Review, Memory and
  Evidence.
- A dedicated External Execution Endpoint Adapter, only when a future Agent
  Runtime cannot be carried by a Harness Session and Shaco must coordinate it
  directly.

No general Adapter framework is prebuilt. Any future external exception follows
the `JUST_IN_TIME_ADAPTER` rule.

## 8. SUPERSEDED_FOR_V1_0_IMPLEMENTATION

The following are no longer V1.0 implementation requirements:

- Four-Provider Adapter framework.
- Shaco Provider/model abstraction framework.
- `DeepSeekAdapter` product framework.
- `ChatGPTAdapter`, `ClaudeAdapter`, `CodexAdapter` or `ReviewerAdapter` solely
  for model routing.
- Provider Registry or Model Registry.
- Shaco-owned API base URL, endpoint, relay, model discovery or model routing.
- A second Provider credential system or Provider/model settings UI.
- Independent Reviewer pipeline.
- Shaco Task state machine.
- Shaco Conversation/Task/AgentRun/Result database.
- Five custom Shaco product pages.
- Shaco Project Scan/File Index when Harness Workspace/tools satisfy V1.0.
- Shaco `ContextSelection` truth.
- Shaco Agent runtime wrapper.
- Worker acting as a Shaco Task coordinator.

## 9. Multi-model Is Not Multi-Agent Orchestration

```text
MULTI_MODEL != MULTI_AGENT_ORCHESTRATION
```

Provider/model selection belongs to Harness. A future Shaco Automation control
plane may coordinate multiple Harness Sessions, each using a different
Harness-supported Provider, model, API endpoint or relay:

```text
Shaco Automation / Multi-Agent Control Plane
        |
        +-> Harness Session A
        +-> Harness Session B
        +-> Harness Session C
```

Shaco owns who runs, when, order, dependencies, result flow, retry and review.
Harness owns model, Provider, API endpoint, credential, Agent Session, Agent
Runtime and tools. Shaco stores only the Automation/Task relationship to a
Harness Session reference; it does not copy Harness Session truth.

## 10. V1.0 Future Seam Requirements

1. Harness Session ID remains an execution/session reference and must not be
   permanently equated with a Task ID, AutomationRun ID or Workflow ID.
2. A Worker/Harness Host can carry multiple Harness Sessions; V1.0 must not make
   a `single-session-forever` or `single-agent-forever` assumption.
3. Supervisor, Carrier, Control Store and Desktop Foundation contain no
   DeepSeek-specific business fields. Provider-neutral foundation does not mean
   implementing a Provider Abstraction Framework now.
4. Desktop Shell can gain Automation, Tasks, Workflow, Review, Memory and
   Evidence surfaces later; V1.0 creates none of them.
5. Control Store has schema version and migration capability but no future empty
   tables.
6. Carrier can carry multiple request, session, generation and correlation
   identities without introducing a second Agent RPC.

## 11. V1.0 Slice Map

### V1-SLICE-1 — REAL HARNESS USER LOOP

Goal:

```text
Desktop
-> Worker
-> Harness Host
-> Harness Client
-> configured Harness provider/model
-> Workspace
-> Session
-> Prompt
-> Streaming
-> Tool / Result
```

The Gate verifies at least one formally supported V1.0 Harness Provider route.
The primary default verification is the official DeepSeek route. The Gate must
not hard-code DeepSeek-specific API routing into Shaco. A configured relay or
other compatible model is a Harness capability and creates no additional Shaco
code requirement.

### V1-SLICE-2 — LIFECYCLE / NATIVE / RECONNECT

Prove Worker discovery/lifecycle, Desktop close/crash independence, native
bridges and directory picker, reconnect, truthful repull/projection,
approval/question/cancel projection and failure mapping.

### V1-SLICE-3 — PACKAGING / COMPATIBILITY / RELEASE

Deliver the bundled Node/Harness runtime, controlled `DSH_HOME`, authenticated
carrier, version identities, compatibility handshake/fail-closed behavior,
installer and minimal upgrade/backup/rollback.

### V1-SLICE-4 — FRESH WINDOWS FINAL ACCEPTANCE

Run final acceptance on fresh supported Windows without a user-installed Node,
pnpm or Harness, covering the required real user loop, lifecycle, security,
durability, packaging and compatibility gates. No new product feature is added
in this Slice.

## 12. Final State

```text
P0S = CLOSED
P0S_FINAL_CLOSURE_OWNER_ACCEPTED = YES
V1_0_SCOPE_RECONCILIATION = COMPLETED
V1_0_IMPLEMENTATION_SCOPE = HARNESS_REUSE_PRODUCTIZATION
V1_0_PROVIDER_MODEL_OWNERSHIP = HARNESS
V1_0_SCOPE_CORRECTIVE = APPLIED
V1_IMPLEMENTATION_READY = YES
V1_IMPLEMENTATION_STARTED = NO
V1_CURRENT_NEXT_ACTION = V1-SLICE-1-REAL-HARNESS-USER-LOOP
```

This Decision performs no Build, Test, Runtime, Provider call or product-code
implementation. It does not start `V1-SLICE-1`.

## 13. Decision Basis

- [Shaco Forge V1.0 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md)
- [Shaco Forge Version Roadmap](../01-product/SHACO-FORGE-VERSION-ROADMAP.md)
- [Shaco Forge Data Ownership](../02-architecture/SHACO-FORGE-DATA-OWNERSHIP.md)
- [Harness Integration Boundary](../02-architecture/SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md)
- [Desktop / Worker Boundary](../02-architecture/SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md)
- [P0.S Roadmap Reassessment Decision](P0S-ROADMAP-REASSESSMENT-DECISION.md)
- [P0.S-8 V1 Product Architecture Freeze Decision](P0S-8-V1-PRODUCT-ARCHITECTURE-FREEZE-DECISION.md)
- [P0-2 Web and Standard Composition Map](../06-testing-acceptance/evidence/P0-2-WEB-AND-STANDARD-COMPOSITION-MAP.md)
- [P0-5 Core Feature Parity Matrix](../06-testing-acceptance/evidence/P0-5-CORE-FEATURE-PARITY-MATRIX.md)
