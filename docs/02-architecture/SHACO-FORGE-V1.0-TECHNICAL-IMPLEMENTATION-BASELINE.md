# Shaco Forge V1.0 Technical Implementation Baseline

| Field | Value |
|---|---|
| Document Role | `V1_0_PRODUCTION_TECHNOLOGY_RUNTIME_TOOLCHAIN_IMPLEMENTATION_BASELINE` |
| Document Status | `ACCEPTED` |
| Review Status | `PASS / OWNER_ACCEPTED` |
| Product Implementation | `NOT_STARTED` |
| V1 Slice 1A | `NOT_STARTED` |
| Last Updated | `2026-09-06` |

## 1. Document Status

```text
V1_TECHNICAL_IMPLEMENTATION_BASELINE = ACCEPTED
V1_TECHNICAL_IMPLEMENTATION_BASELINE_REVIEW = PASS
V1_TECHNICAL_IMPLEMENTATION_BASELINE_OWNER_ACCEPTED = YES
TECH_BASELINE_FINAL = YES
V1_IMPLEMENTATION_STARTED = NO
V1_SLICE_1A = NOT_STARTED
```

本文是 Architecture Owner 在 `REVIEW-011 / PASS` 后正式接受并冻结的 V1.0
Production Technical Baseline。它不启动 Product Implementation 或 Slice 1A。

## 2. Purpose

本文只确定开始真实 V1 Slice 前必需的最小生产技术、语言、运行时、工具链和
source-layout 边界。它不重新设计产品架构、不扩大 V1.0 Scope，也不授权 Product
Code、Build、Test 或 Runtime。

## 3. Authority

当前事实与约束来自：

- [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md)
- [Documentation Rules](../00-governance/SHACO-FORGE-DOCUMENT-RULES.md)
- [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md)
- [V1.0 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md)
- [UI Design Spec](../01-product/SHACO-FORGE-UI-DESIGN-SPEC.md)
- [System Architecture](SHACO-FORGE-SYSTEM-ARCHITECTURE.md)
- [Desktop / Worker Boundary](SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md)
- [Harness Integration Boundary](SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md)
- [Data Ownership](SHACO-FORGE-DATA-OWNERSHIP.md)
- [Security Model](SHACO-FORGE-SECURITY-MODEL.md)
- [V1.0 Development Map](../03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md)
- [V1.0 Harness Reuse Implementation Scope Corrective](../04-development-records/V1-0-HARNESS-REUSE-IMPLEMENTATION-SCOPE-CORRECTIVE-DECISION.md)
- [P0-1 Harness Baseline Manifest](../06-testing-acceptance/evidence/P0-1-HARNESS-BASELINE-MANIFEST.md)
- [P0.S-1 Host Profile Evidence](../06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md)
- [P0.S-2 Electron Client Boot Evidence](../06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md)
- [P0.S-3 Local Carrier and Trust Evidence](../06-testing-acceptance/evidence/P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md)
- [P0.S-7 Runtime Definition Finalization Decision](../04-development-records/P0S-7-RUNTIME-DEFINITION-FINALIZATION-DECISION.md)
- [ADR-0001](decisions/ADR-0001-DESKTOP-WORKER-DUAL-CORE-PROCESSES.md),
  [ADR-0002](decisions/ADR-0002-WORKER-AS-HARNESS-HOST.md),
  [ADR-0004](decisions/ADR-0004-PIN-HARNESS-BASELINE-AND-FAIL-CLOSED-UPGRADES.md)
  and [ADR-0006](decisions/ADR-0006-MINIMAL-SHACO-CONTROL-STORE.md)
- [REVIEW-011 — Independent V1.0 Technical Implementation Baseline Review](../05-reviews/architecture/AUDIT-011-V1-TECHNICAL-IMPLEMENTATION-BASELINE.md)

The UI Spec identity reviewed by REVIEW-011 is `40197` bytes and SHA-256
`27C2564994A0728B1210F4AC2D68BDD0EE3EF1654EFAB37963F46EFE1E7C6738`.
P0.S-7 is an Owner decision for a `NOT_PRODUCTION` Spike. It is used here only
as Evidence / Decision Input; its runtime choices become Production decisions
only through REVIEW-011 and the Architecture Owner acceptance recorded here.

The Frozen Harness was also inspected read-only at
`D:\Project\Shaco-Forge-Upstream\deepseek-harness`: root and required package
manifests, `pnpm-workspace.yaml`, TypeScript configurations, lockfile version
resolution, `apps/web` composition and Client Web package composition.

## 4. Production Topology

```text
Electron Desktop
  Main (TypeScript; native/supervisor/trusted carrier boundary)
    -> Preload allowlisted bridge (TypeScript)
      -> Renderer / Shaco Shell + reused Harness Client (TypeScript)
  |
  | authenticated local carrier; Renderer has no raw transport
  v
per-user long-running Worker (Node.js + TypeScript)
  -> spawns `dsh --profile <shaco-host>`
     -> pinned Harness Host / Runtime
```

Desktop close does not stop Worker. Worker is runtime authority and owns Harness
lifecycle. Desktop is the projection/control surface. Electron Main, Preload and
Renderer remain explicit trust and build boundaries.

## 5. Technology Decision Table

| Domain | Decision | Evidence | Status |
|---|---|---|---|
| Desktop runtime | Electron Desktop | System Architecture; ADR-0001 | `ALREADY_FROZEN_BY_HIGHER_AUTHORITY` |
| Desktop language | TypeScript | Electron/Harness ecosystem alignment; accepted ADR-0008 | `OWNER_ACCEPTED` |
| Desktop Main | TypeScript, explicit privileged entry | Security Model; P0.S-2 | `OWNER_ACCEPTED` |
| Preload | TypeScript, allowlisted bridge only | Security Model; P0.S-2 | `OWNER_ACCEPTED` |
| Renderer | TypeScript, sandboxed Harness Client projection | UI Spec; P0.S-2; pinned Client manifests | `OWNER_ACCEPTED` |
| Worker runtime | independent Node.js runtime | Desktop/Worker Boundary; Harness Node engine | `OWNER_ACCEPTED` |
| Worker language | TypeScript | Worker responsibilities and Harness ecosystem; accepted ADR-0008 | `OWNER_ACCEPTED` |
| Harness runtime | exact pinned `@deepseek-ai/dsh@0.1.2-alpha.1` at commit `cd5ef8148158c3a752a658978873241fdf8e2bbc` | P0-1; ADR-0004 | `ALREADY_FROZEN_BY_HIGHER_AUTHORITY` |
| Harness launch | spawn `dsh --profile`; no production `boot()` | Harness Integration Boundary; P0.S-1 | `ALREADY_FROZEN_BY_HIGHER_AUTHORITY` |
| Electron | `35.7.5 / win32 / x64` | P0.S-2 security/client boot; P0.S-7 input decision | `OWNER_ACCEPTED` |
| Worker Node | `22.19.0 / win32 / x64` | Harness engine `^22.19.0 || >=24.0.0`; P0.S-7 input decision | `OWNER_ACCEPTED` |
| pnpm | `11.7.0` as sole primary package manager | Harness root `packageManager` | `OWNER_ACCEPTED` |
| TypeScript | exact `6.0.3` | Harness declaration starts at `6.0.3`; frozen lock resolves `6.0.3` | `OWNER_ACCEPTED` |
| Renderer framework / composition policy | reuse pinned Harness Client React composition; add no new framework | Client packages use React; frozen lock resolves React `18.3.1` | `OWNER_ACCEPTED` |
| Renderer build/composition detail | prove package-export/static composition and choose only the minimum required bundler | P0.S-2 adapters are `NOT_PRODUCTION` | `SLICE_GATED` |
| Native helper | C#/.NET permitted only just in time for proven Windows-native gaps | P0.S-3 C# helper is `NON_CORE_ADAPTER / NOT_PRODUCTION` | `OWNER_ACCEPTED` |
| Carrier requirement | authenticated local carrier; Renderer cannot access it directly | Scope Corrective; Security Model | `ALREADY_FROZEN_BY_HIGHER_AUTHORITY` |
| Physical carrier implementation | retain Named Pipe as leading evidence-backed candidate; freeze production form in Slice 1B | P0.S-3 is feasibility evidence, not production code | `SLICE_GATED` |
| Control Store | minimal Shaco-owned SQLite store with `schema_version` and migration seam | ADR-0006; Data Ownership; Scope Corrective | `ALREADY_FROZEN_BY_HIGHER_AUTHORITY` |
| Control Store driver/schema detail | decide no later than the first Slice that writes the store; create no future empty tables | Scope Corrective; UI Spec | `SLICE_GATED` |
| Release runtime | bundled Worker Node and pinned Harness; controlled `DSH_HOME`; no system Node/pnpm | Master Goal; Scope Corrective | `ALREADY_FROZEN_BY_HIGHER_AUTHORITY` |
| Exact packaging/bundling mechanism | select and prove in V1-SLICE-3 | Scope Corrective Slice map | `SLICE_GATED` |

## 6. Primary Language

```text
PRIMARY_PRODUCT_LANGUAGE = TYPESCRIPT
DESKTOP_LANGUAGE = TYPESCRIPT
DESKTOP_MAIN_LANGUAGE = TYPESCRIPT
DESKTOP_PRELOAD_LANGUAGE = TYPESCRIPT
DESKTOP_RENDERER_LANGUAGE = TYPESCRIPT
WORKER_LANGUAGE = TYPESCRIPT
```

No current Authority freezes a C# Worker. TypeScript keeps Electron Main,
Preload, Renderer, Worker supervision and the Node/TypeScript Harness boundary in
one ecosystem and avoids a permanent Desktop -> C# Worker -> Node Harness
cross-language chain. This does not permit Renderer code to inherit Node
privileges.

## 7. Desktop Runtime

```text
DESKTOP_RUNTIME = ELECTRON
ELECTRON_BASELINE = 35.7.5 / win32 / x64
```

Electron `35.7.5` is accepted here from proven P0.S-2 behavior and the bounded
P0.S-7 decision input as the exact V1.0 Production Baseline. This is an
evidence-backed baseline, not a claim that it is the newest available Electron.
Main, Preload and Renderer remain separate.

Mandatory BrowserWindow security posture:

```text
NodeIntegration = OFF
ContextIsolation = ON
Sandbox = ON
```

## 8. Worker Runtime

```text
WORKER_RUNTIME = NODE
WORKER_LANGUAGE = TYPESCRIPT
WORKER_NODE_BASELINE = 22.19.0 / win32 / x64
```

Harness declares Node `^22.19.0 || >=24.0.0`; `22.19.0` is therefore inside the
frozen engine contract and matches the existing bounded decision input. A
different Node found on the development machine is not a fallback.

Electron's embedded Node and the independent Worker Node are separate runtime
and ABI domains. P0.S-2 observed embedded Node `22.16.0` inside Electron
`35.7.5`; that observation neither supplies nor replaces Worker Node `22.19.0`.
Native compatibility must be verified against the runtime that actually loads
each native component.

## 9. Harness Runtime and Launch

```text
HARNESS_STRATEGY = REUSE_PINNED_HARNESS
HARNESS_BASELINE_COMMIT = cd5ef8148158c3a752a658978873241fdf8e2bbc
HARNESS_RELEASE = dsh-v0.1.2-alpha.1
HARNESS_PACKAGE = @deepseek-ai/dsh@0.1.2-alpha.1
HARNESS_LAUNCH_SEAM = DSH_PROFILE
```

Worker launches the official built `dsh` entry with `--profile`. Production must
not use direct `boot()`, undocumented `dsh-app-boot`, runtime `tsx` source boot,
or `packages/**/src` deep imports.

Harness remains authority for Provider, Model, API Endpoint, Relay, Credential,
Workspace, Session, Conversation, Tool, Permission and Approval / Question.
Shaco must not introduce a second truth or rewrite the Harness Agent protocol.

## 10. Package Manager

```text
PACKAGE_MANAGER = PNPM
PNPM_BASELINE = 11.7.0
```

The Frozen Harness root declares `packageManager = pnpm@11.7.0`. This accepted
baseline uses the same exact primary package-manager baseline and workspace model
for Shaco. npm or yarn must not become a second primary package-management system
merely because an upstream script internally invokes a compatible command.

## 11. TypeScript Baseline

```text
TYPESCRIPT_BASELINE = 6.0.3
TYPESCRIPT_STRICT = ON
```

The Harness manifests declare `^6.0.3`, and the frozen lock resolves `6.0.3`.
This accepted baseline pins Shaco to `6.0.3` exactly to reproduce the proven graph
and avoid a floating compiler difference. Exact alignment is not required as a
universal product principle; it is accepted here because there is no current
incompatibility evidence and alignment reduces V1.0 integration variance.

## 12. Renderer Composition Policy

```text
RENDERER_LANGUAGE = TYPESCRIPT
HARNESS_CLIENT_COMPOSITION = REUSE_FIRST
RENDERER_FRAMEWORK_DECISION = REUSE_PINNED_HARNESS_CLIENT_REACT_COMPOSITION
RENDERER_FRAMEWORK_STATUS = OWNER_ACCEPTED
PINNED_HARNESS_CLIENT_REACT_18_3_1 = PINNED_HARNESS_UPSTREAM_FACT
SHACO_REUSE_FIRST_NO_NEW_FRAMEWORK = ACCEPTED_TECHNICAL_BASELINE_DECISION
NEW_RENDERER_FRAMEWORK = NOT_ALLOWED_UNLESS_REQUIRED_BY_REAL_COMPOSITION
```

Pinned `apps/web/src/main.ts` boots public `AppWebEntry`; the Client UI packages
declare React and React DOM, with the frozen lock resolving React `18.3.1`.
That React `18.3.1` composition is a pinned Harness upstream fact. This accepted
Technical Baseline directs Shaco to reuse the pinned Harness Client composition
without adding Vue or another competing UI framework unless real composition
proves one necessary. It does not require the Shaco Shell to create a separate
React application truth. The exact export/static-asset composition and minimum
bundler remain Slice 1A gated.

## 13. Native Helper Policy

```text
WINDOWS_NATIVE_HELPER_POLICY = JUST_IN_TIME_ONLY
C_SHARP_WORKER = NOT_ALLOWED
EMPTY_NATIVE_HELPER_PROJECT = NOT_ALLOWED
```

C#/.NET may be added only when a real Slice proves Node/Electron cannot reliably
provide a required Windows SID, Named Pipe ACL, peer-process identity, protected
local IPC, special process control or comparable Windows-native capability.
Any helper must be a thin boundary with a narrow API and no Agent business
logic, Provider logic, Session truth or second Worker. Exact .NET/runtime
version is frozen only in the Slice that demonstrates the need. The historical
C# Named Pipe helper remains `NON_CORE_ADAPTER / NOT_PRODUCTION`.

## 14. IPC / Carrier Technical Boundary

```text
LOCAL_CARRIER_REQUIREMENT = AUTHENTICATED_LOCAL
PHYSICAL_CARRIER_IMPLEMENTATION = SLICE_1B_GATED
RENDERER_DIRECT_WORKER_TRANSPORT = FORBIDDEN
```

Electron Renderer calls only an allowlisted Preload bridge; Desktop Main owns
the trusted transport boundary. P0.S-3 makes Windows Named Pipe the leading
evidence-backed physical candidate and proves current-user ACL/auth feasibility,
but its disposable C#/PowerShell/framing topology is not the Production
contract. Slice 1B must freeze the actual physical carrier, limits, handshake,
identity, replay handling, lifecycle and diagnostics without redesigning the
Harness business protocol.

## 15. Source Layout

The accepted high-level Production source layout is:

```text
apps/
  desktop/       # Electron Main / Preload / Renderer ownership
  worker/        # independent Node Worker entry and Harness lifecycle

packages/
  contracts/     # create only when a real Desktop/Worker shared contract exists
```

REVIEW-011 PASS and Architecture Owner acceptance freeze this ownership/workspace
shape, not speculative subdirectories. `packages/contracts` is conditional and
must not be created empty. Do not create future automation, review, memory,
provider abstraction or other placeholder modules. P0.S experiments remain
evidence and are not Production source.

## 16. Build / Module Principles

- Compile or bundle Production source from the repository with the pinned,
  repo-controlled toolchain.
- Use TypeScript strict mode and explicit Electron Main / Preload / Renderer
  boundaries.
- Give Worker an explicit compiled release entry.
- Do not depend on `tsx`, `ts-node` or TypeScript source execution at release
  runtime.
- Do not deep-import Harness source or copy the full experiment tree.
- Do not freeze Vite, tsdown or another bundler until real Harness Client or
  Electron composition in Slice 1A requires it.
- Keep the design compatible with later bundled Worker Node and Harness assets;
  no global executable lookup is a product contract.

## 17. Security Baseline

Renderer has no Credential, Worker raw transport, unrestricted Node API, Shell
or arbitrary filesystem access. It runs with Node integration off, context
isolation on and sandbox on. Preload exposes a narrow capability allowlist.
Desktop Main validates every bridge operation and owns native/supervisor/carrier
access. Worker is runtime authority and owns Harness lifecycle. Credentials stay
Harness-owned and Worker-side; logs, errors and support artifacts redact secrets.

## 18. Runtime Version Pins

| Component | V1.0 Baseline | Pin Meaning |
|---|---|---|
| Harness | commit `cd5ef8148158c3a752a658978873241fdf8e2bbc`; tag `dsh-v0.1.2-alpha.1`; package `@deepseek-ai/dsh@0.1.2-alpha.1` | higher-authority exact release identity |
| Electron | `35.7.5 / win32 / x64` | accepted Production exact runtime |
| Worker Node | `22.19.0 / win32 / x64` | accepted Production independent sidecar runtime |
| pnpm | `11.7.0` | accepted Production-development toolchain |
| TypeScript | `6.0.3` | accepted Production-development compiler |

Ordinary npm libraries do not automatically receive the same governance level.
Their versions remain controlled through the repository lockfile and normal
compatibility review.

## 19. Development vs Packaged Runtime

Development may use the repo-controlled pinned toolchain. A packaged V1.0 must
satisfy:

```text
NO_SYSTEM_NODE_DEPENDENCY
NO_SYSTEM_PNPM_DEPENDENCY
BUNDLED_WORKER_NODE
BUNDLED_PINNED_HARNESS
CONTROLLED_DSH_HOME
```

These are V1-SLICE-3 completion items. Developer-machine Node, pnpm, caches or
absolute paths are never silent release fallbacks. Packaged startup must resolve
product-owned assets and exact identities, fail closed on mismatch, and not
search PATH first.

## 20. Control Store Decision Boundary

```text
CONTROL_STORE_TECHNOLOGY = SQLITE
CONTROL_STORE_SCOPE = MINIMAL_SHACO_CONTROL_STORE
CONTROL_STORE_SCHEMA_VERSION = REQUIRED
CONTROL_STORE_MIGRATION_SEAM = REQUIRED
FUTURE_EMPTY_TABLES = FORBIDDEN
```

SQLite is already frozen by accepted ADR-0006, not inferred from a historical
Spike. The database owns only Shaco control-plane metadata; Harness owns its
Session/settings/credential/profile data. Driver choice, concrete schema and
migration implementation are Slice-gated and must be decided no later than the
first Slice that writes this store. They are not required to start Slice 1A if
that Slice has no control-store write.

## 21. Version Upgrade Policy

Harness, Electron, Worker Node, pnpm and TypeScript must never use `latest`,
automatic upgrade, PATH-first or cache-first fallback as their Production
selection rule. Any change to these pins must be:

1. explicit;
2. reviewed;
3. compatibility verified against the affected Desktop, Worker, Harness,
   carrier, Client composition, security and packaging surfaces;
4. recorded in the appropriate baseline/ADR and lock identities before release.

Harness upgrades additionally follow ADR-0004: exact baseline identity,
compatibility branch, backup/restore and fail-closed behavior.

## 22. Explicit Non-Goals

- No Product Code, Electron implementation, Worker implementation or empty
  source scaffold.
- No new Agent, Provider, Model, Session, Conversation or Credential truth.
- No Harness protocol rewrite or production direct `boot()`.
- No new renderer framework or speculative bundler selection.
- No native-helper project before a demonstrated Windows-native requirement.
- No Carrier redesign or promotion of Spike framing to a permanent contract.
- No Automation, Review, Memory, Task or Provider abstraction implementation.
- No final packaging mechanism, installer or complete schema design in this step.

## 23. Accepted Freeze Set

Following REVIEW-011 PASS and Architecture Owner acceptance, the freeze set is:

- TypeScript as the primary language for Desktop Main, Preload, Renderer and
  Worker.
- Electron `35.7.5 / win32 / x64` and independent Worker Node
  `22.19.0 / win32 / x64`.
- pnpm `11.7.0` and TypeScript `6.0.3`.
- Reuse of pinned Harness through `dsh --profile`.
- Reuse-first Renderer composition with no additional framework.
- C#/.NET only as a just-in-time thin Windows-native helper.
- `apps/desktop` + `apps/worker` ownership and conditional real shared contracts.
- strict TypeScript, compiled release entries and no system toolchain dependency.

Higher Authority already freezes Electron Desktop topology, Desktop/Worker
separation, Harness pin/launch, authenticated carrier requirement, minimal
SQLite Control Store, Harness truth ownership and bundled release outcomes.

## 24. Decisions Intentionally Not Frozen

- Exact renderer bundler, Electron build tool and packaging tool.
- Exact Harness Client package-export/static composition adapter.
- Physical carrier implementation, framing limits and handshake details.
- Whether any C#/.NET helper is needed and, if needed, its exact runtime version.
- Control Store driver, schema details and migration library.
- Ordinary library versions beyond the repository lockfile.
- Final installer, Worker Node bundling and `DSH_HOME` packaging mechanism.
- Future source subdirectories or abstractions without a real Slice consumer.

## 25. Slice 1A Implementation Guidance

When separately authorized to start, Slice 1A follows this accepted bounded
internal scope:

```text
V1_SLICE_1A_SCOPE = PRODUCT_BOOTSTRAP + REAL_HARNESS_CLIENT_BOOT
V1_SLICE_1A_FULL_V1_SLICE_1_USER_LOOP_GATE = NO
```

Slice 1A should:

1. create the minimum production source skeleton in `apps/desktop` and
   `apps/worker`, without speculative modules or an empty shared-contract package;
2. boot Electron Desktop with explicit, secure Main / Preload / Renderer
   boundaries from first boot;
3. boot an independent Worker process on the accepted Worker Node runtime;
4. have Worker use the allowed `dsh --profile` Harness launch seam and establish
   the frozen Harness Host boot/readiness needed for bootstrap;
5. mount the real pinned Harness Client through `AppWebEntry`/Client UI
   composition and public or approved preview seams, without copying
   `packages/**/src`;
6. provide a minimal Shaco Shell and a truthful disconnected or
   not-yet-connected state when real Harness data is not connected;
7. use no mock, fixture or fake RPC success;
8. select only the minimum renderer bundler/Client composition needed by the
   real mount;
9. leave the Control Store unimplemented when Slice 1A has no real write need;
10. keep Product Code, Build, Test and Runtime prohibited until Slice 1A is
    explicitly started under its own authority.

Slice 1A does not require a configured Provider network call, Provider
Credential loop, full Workspace lifecycle, full Session lifecycle, Prompt
execution, Streaming completion, Tool read/edit or result completion, end-to-end
Approval, full physical Carrier, reconnect or packaging.

The complete real Harness user loop -- Desktop -> Worker -> Harness Host ->
Harness Client -> configured Harness Provider/model -> Workspace -> Session ->
Prompt -> Streaming -> Tool/Result -- is the `V1-SLICE-1` Gate, not the Slice 1A
Gate. Its remaining work closes in later internal V1-SLICE-1 implementation
steps. Physical carrier implementation remains a later V1-SLICE-1 internal step
and is Slice 1B gated.

## 26. Review Closure

Independent REVIEW-011 verified:

- every accepted decision against current Authority and Frozen Harness bytes;
- that P0.S Evidence is not described as Production Code;
- Node `22.19.0` against the Harness engine and Electron/Worker ABI separation;
- the pinned Harness Client React composition and reuse-first conclusion;
- ADR-0008 scope and the just-in-time Native Helper boundary;
- UTF-8 without BOM, Markdown local links, terminology, secret hygiene and
  `git diff --check`;
- no contradiction with the Scope Corrective, UI Spec, data ownership or
  security model;
- that no Product Code, Slice execution, Build, Test or Runtime occurred during
  Review.

```text
V1_TECHNICAL_BASELINE_REVIEW = PASS
FIRST_FAILURE_BOUNDARY = NONE
V1_TECHNICAL_BASELINE_CAN_CLOSE = YES
V1_TECHNICAL_BASELINE_REVIEW_OWNER_ACCEPTED = YES
BLOCKING_FINDINGS = NONE
```

The current Executor did not execute the Independent Review. Architecture Owner
accepted its verdict and closed the two LOW and one INFO documentation findings
during this acceptance action.

## 27. Spike Evidence Does Not Equal Production Code

```text
SPIKE_EVIDENCE_DOES_NOT_EQUAL_PRODUCTION_CODE
```

P0.S proves feasibility, constraints, runtime behavior and specific versions in
bounded contexts. It does not authorize copying experiment directories into
Production. The C# helper is `NOT_PRODUCTION`; historical runtime choices do not
become Production simply because they exist in P0.S-7. Production source must be
created anew under the real Slice, and Product tests must be executed anew.
