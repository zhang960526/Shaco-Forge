# V1.0 Mainline and Step 1 Scope Reconciliation Decision

| Field | Value |
|---|---|
| Decision ID | `V1-0-MAINLINE-STEP1-SCOPE-RECONCILIATION-20260909-01` |
| Decision Type | `ARCHITECTURE_OWNER_SCOPE_RECONCILIATION` |
| Status | `ACCEPTED` |
| Decision Date | `2026-09-09` |
| Decision Owner | Architecture Owner |
| Product Implementation | `NOT_PERFORMED` |
| Frozen Contract Change | `NO` |

## 1. Decision

This Decision preserves the truthful V1-SLICE-2 Step 1 blocker, diagnostic
probe and Source Confirmation history, and returns current implementation
authority to the minimum V1.0 Harness Desktop productization mainline.

```text
V1_0_MAINLINE = MINIMAL_HARNESS_DESKTOP_PRODUCTIZATION
V1_0_IMPLEMENTATION_SCOPE = HARNESS_REUSE_PRODUCTIZATION
V1_0_AGENT_RUNTIME_OWNER = HARNESS
V1_0_PROVIDER_MODEL_OWNER = HARNESS
V1_0_WORKSPACE_SESSION_CONVERSATION_TRUTH = HARNESS

SHACO_SECOND_AGENT_RUNTIME = FORBIDDEN
SHACO_SECOND_AGENT_RPC = FORBIDDEN
SHACO_PROVIDER_FRAMEWORK_V1_0 = DO_NOT_CREATE
V1_0_AUTOMATION_DOMAIN = DO_NOT_IMPLEMENT
V1_0_MULTI_AGENT_DOMAIN = DO_NOT_IMPLEMENT
V1_0_MEMORY_LEARNING_DOMAIN = DO_NOT_IMPLEMENT
WINDOWS_SERVICE_V1_0 = OUT_OF_SCOPE
ADMIN_ATTESTATION_DAEMON_V1_0 = DO_NOT_CREATE
```

No new Product business domain is authorized by this Decision. Any proposed
Broker, asymmetric authority protocol or other authority subsystem remains a
`CANDIDATE`, not current Implementation Authority.

## 2. V1.0 required productization layer

V1.0 builds only the minimum layer required to productize the pinned Harness:

1. Electron Desktop Shell.
2. Main / Preload secure boundary.
3. Harness Client loading and adaptation.
4. Per-user Worker.
5. Worker-hosted Harness Host.
6. Supervisor.
7. Worker discovery and lifecycle.
8. Authenticated local carrier.
9. Desktop close/crash Worker survival.
10. Reconnect and truthful projection.
11. Native picker and narrow bridge.
12. Minimal Shaco control metadata only.
13. Version and compatibility identities.
14. Bundled Node and Harness.
15. Controlled `DSH_HOME`.
16. Installer.
17. Minimal upgrade and rollback.
18. Fresh Windows acceptance.

Harness remains the authority for the Agent runtime, Provider/model,
credentials, Workspace, Session, transcript, conversation runtime, tools,
permissions and approvals. Shaco must neither copy those truths nor create a
second Agent platform around them.

## 3. Future seam rule

```text
PRESERVE_FUTURE_EXTENSION_SEAMS = YES
PREBUILD_FUTURE_FEATURES = NO
FUTURE_EMPTY_DOMAIN_TABLES = FORBIDDEN
GENERIC_FUTURE_FRAMEWORK_PREBUILD = FORBIDDEN
```

An extension seam is a bounded compatibility property of the V1.0 foundation.
It is not permission to create a future domain, its empty schema, state machine,
runtime, registry, adapter framework or placeholder UI.

## 4. V1.1 Automation seam

V1.1 plans may introduce `AutomationDefinition`, `AutomationRun`, Task / Step /
Attempt, Planner, Artifact / Evidence, Retry / Timeout, Pause / Resume / Cancel,
Scheduler / Trigger, crash recovery and long-running automation.

V1.0 preserves only these seams:

- Harness Session ID is not permanently equated with Task ID or AutomationRun
  ID.
- A Worker may later carry multiple Harness Sessions.
- The minimal Control Store has `schema_version` and migration capability.
- The Carrier can carry request, session, generation and correlation identity.
- The Desktop Shell can later add an Automation typed surface.

V1.0 must not create an Automation runtime, Task state machine, Planner,
Scheduler, Automation tables or Retry framework.

## 5. V1.2 Multi-agent seam

V1.2 plans may introduce Planner, Executor, Independent Reviewer, Corrective,
Re-review, Multi-Agent Council and multi-model deliberation.

V1.0 preserves only these seams:

- Provider and model remain Harness-owned.
- Supervisor, Carrier and Control Store contain no DeepSeek-specific business
  truth.
- A future Shaco control plane may reference multiple Harness Sessions.
- An external runtime uses `JUST_IN_TIME_ADAPTER` only when genuinely required.

V1.0 must not create a Provider Registry, Model Registry, four-provider Adapter
framework, Reviewer pipeline, Multi-Agent runtime or generic Adapter framework.

## 6. V1.3 memory and learning seam

V1.3 candidates may include Feedback, Experience, cross-session Memory and
Learning / Distillation.

V1.0 preserves only schema migration capability, stable Harness Workspace /
Session references, a future typed record/UI extension point and Harness-owned
transcripts. V1.0 must not create a Memory database, RAG layer, Experience
engine, Learning pipeline or Feedback domain tables.

## 7. Step 1 history and evidence disposition

The authorized V1-SLICE-2 Step 1 long-running goal was started and stopped at
the first unresolved prerequisite boundary:

```text
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = STOPPED_BLOCKED
FIRST_UNRESOLVED_BOUNDARY = STEP1_DESKTOP_ATTESTATION_IMPLEMENTATION_BLOCKED
PRODUCTION_SOURCE_MODIFIED = NO
```

The bounded identity probe demonstrated that same-user non-Product code can use
the same generic `electron.exe` image as the Product launcher. Generic Electron
image path/version/hash plus PID/process-start binding therefore cannot, by
itself, prove Shaco Product application identity. This is diagnostic
prerequisite proof and is not the Step 1 S6 runtime gate or an implementation
PASS.

The later bounded control-server Source Confirmation executed
`GetNamedPipeServerProcessId` and confirmed:

```text
SERVER_PID_MATCH = PASS
SERVER_PROCESS_START_MATCH = PASS
SERVER_EXECUTABLE_PATH_MATCH = PASS
SERVER_IDENTITY_MISMATCH_REJECTED = PASS
```

That result confirms source/runtime primitive availability only. Source
Confirmation is not Product identity, Product implementation, Step 1 runtime
PASS or Step closure.

Subsequent security analysis supplied to the Owner established the additional
distinction:

```text
GENUINE_BINARY_IDENTITY != CURRENT_AUTHORITY_MEMBERSHIP
```

A genuine Helper binary may still be direct-launched and does not automatically
prove membership in the current legal Worker authority. The resulting design
discussion considered mutual lifecycle server attestation, a long-lived Broker,
asymmetric authority proof and Windows Service / OS-principal isolation. Those
inputs are recorded as `OWNER_SUPPLIED_INLINE_DESIGN_INPUT` or
`EXTERNAL_READ_ONLY_DESIGN_INPUT`; no repository-backed review artifact, review
commit or artifact hash is invented for them.

Windows Service and Admin authority are outside V1.0. Broker and authority
protocol proposals remain candidates pending a separate, minimum-V1 corrective
decision. Step 1 remains unimplemented and open.

## 8. Current Step 1 disposition

The frozen V1-SLICE-2 Architecture Contract and Carrier Lifecycle Amendment
remain frozen and unchanged. This Decision does not silently amend their bytes
or weaken their security requirements.

```text
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = YES
V1_SLICE_2_STEP1 = BLOCKED_PENDING_MINIMAL_TRUSTED_DISCOVERY_SCOPE_CORRECTIVE
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = STOPPED_BLOCKED
V1_SLICE_2_IMPLEMENTATION = NOT_STARTED
V1_SLICE_2 = NOT_STARTED
V1_SLICE_2_STEP2 = NOT_AUTHORIZED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
```

The existing Step 1 diagnostic fixture, probes, Evidence, Blocked Record and
Source Confirmation Record are historical truth. They remain explicitly
`NOT_PRODUCTION` and diagnostic/evidence material; they must not be promoted to
Product runtime source.

## 9. Authority boundary and next action

```text
V1_CURRENT_STEP = V1_SLICE_2_STEP1_SCOPE_RECONCILIATION
V1_CURRENT_NEXT_ACTION = DESIGN_MINIMAL_V1_STEP1_TRUSTED_DISCOVERY_CONTRACT_CORRECTIVE
```

The corrective must first prove that any proposed addition is required for
`MINIMAL_HARNESS_DESKTOP_PRODUCTIZATION`. It must reconcile the smallest trusted
discovery/attestation boundary compatible with V1.0 and return for explicit
Architecture Owner authority before Product implementation resumes.

Do not continue Broker design, create a Windows Service/Admin daemon, modify the
frozen Contract/Amendment, start Step 1 Product code, authorize Step 2/3 or run a
Provider gate under this Decision.

## 10. Decision basis

- [Shaco Forge V1.0 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md)
- [Shaco Forge Version Roadmap](../01-product/SHACO-FORGE-VERSION-ROADMAP.md)
- [V1.0 Harness Reuse Implementation Scope Corrective Decision](V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md)
- [V1-SLICE-2 Lifecycle / Native / Reconnect Architecture Contract](../03-v1.0-plan/V1-SLICE-2-LIFECYCLE-NATIVE-RECONNECT-CONTRACT.md)
- [V1-SLICE-2 Carrier Lifecycle Amendment](../03-v1.0-plan/V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
- [Step 1 Desktop Attestation Blocked Record](V1-SLICE-2-STEP1-DESKTOP-ATTESTATION-BLOCKED-RECORD.md)
- [Step 1 Control Server Attestation Source Confirmation](V1-SLICE-2-STEP1-CONTROL-SERVER-ATTESTATION-SOURCE-CONFIRMATION.md)
