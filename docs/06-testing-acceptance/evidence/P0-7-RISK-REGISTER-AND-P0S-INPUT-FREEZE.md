# P0-7 — Risk Register & P0.S Input Freeze

Status: CLOSED / PASS  
Date: 2026-08-30  
Executor: P0 Executor (Grok 4.6)  
Method: document synthesis from P0-1 through P0-6 evidence. No new Harness source audit. No Spike. No production code.

`P0_EVIDENCE_CONTRADICTIONS = NONE`

`CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` (unchanged; P0-7 does not rewrite this to NONE)

`SHACO_FORGE_V1_0_P0_7 = PASS`

`SHACO_FORGE_V1_0_P0 = PASS`

`P0_STATE = CLOSED`

`SHACO_FORGE_V1_0_P0S = NOT_STARTED`

Next authorized action after AUDIT-004 F-01/F-02/F-03 wording corrections: **INDEPENDENT P0 CLOSURE CORRECTIVE REVIEW**. This file does not authorize BEGIN P0.S. Executor must not set `P0_CLOSURE_AUDIT = PASS`.

---

## A. Frozen Baseline

Reverified immediately before this step against `D:\Project\Shaco-Forge-Upstream\deepseek-harness`:

| Identity | Required | Observed |
|---|---|---|
| `git rev-parse HEAD` | `cd5ef8148158c3a752a658978873241fdf8e2bbc` | MATCH |
| `git status --porcelain` before | empty | empty (`UPSTREAM_WORKTREE_CLEAN_BEFORE = YES`) |
| `pnpm-lock.yaml` SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` | MATCH (PowerShell `Get-FileHash` returned uppercase equivalent) |
| Repository | `https://github.com/deepseek-ai/deepseek-harness.git` | unchanged |
| Release | `dsh-v0.1.2-alpha.1` | unchanged |
| PackageVersion | `0.1.2-alpha.1` | unchanged |
| Node engines | `^22.19.0 \|\| >=24.0.0` | P0-1 |
| packageManager | `pnpm@11.7.0` | P0-1 |

No Harness source, lockfile, or baseline mutation was performed. After documentation-only work: `UPSTREAM_WORKTREE_CLEAN_AFTER = YES`.

Authority: `docs/06-testing-acceptance/evidence/P0-1-HARNESS-BASELINE-MANIFEST.md`.

---

## B. P0 Closure Context

P0-1 through P0-6 are CLOSED / PASS. This step does not reopen them.

| Step | Gate | Evidence |
|---|---|---|
| P0-1 | `P0_BASELINE_FROZEN = YES` | P0-1-HARNESS-BASELINE-MANIFEST.md |
| P0-2 | `P0_WEB_COMPOSITION_KNOWN = YES`, `P0_STANDARD_PRESET_KNOWN = YES` | P0-2-WEB-AND-STANDARD-COMPOSITION-MAP.md |
| P0-3 | `P0_CLIENT_HOST_CONTRACT_KNOWN = YES`, `P0_EXACT_FETCH_ROUTES_ENUMERATED = YES` | P0-3-CLIENT-HOST-CONTRACT-MAP.md |
| P0-4 | `P0_TRUST_SURFACE_KNOWN = YES`, `P0_LOOPBACK_CLASSIFIER_LOCATED = YES` | P0-4-AUTHENTICATION-AND-TRUST-SURFACE.md |
| P0-5 | `P0_CORE_PARITY_SCOPE_FROZEN = YES` | P0-5-CORE-FEATURE-PARITY-MATRIX.md |
| P0-6 | `P0_DEPENDENCY_BOUNDARY_FROZEN = YES` | P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md |

Confirmed P0 facts used below (cite only; not re-audited):

- Worker production entry is spawn `dsh --profile <shaco-host>` (`dsh-base` + Shaco bundle). In-process `boot()` is forbidden.
- `dsh-web-app` is not the Shaco Host. Official Connection and client-modules Host plugins **hard-inject the Cordis `webServer` service contract** (Layer A). That is not proof of stock HTTP `dsh-web-app` (Layer B). Gateway does **not** hard-inject `webServer`; mux registration is optional. See P0-6 three-layer freeze (AUDIT-004 F-01). Classification: `OPEN_FOR_P0S`, not `KNOWN_CORE_PATCH_REQUIRED`.
- Generated `./remote` / `./typert` are documented product seams. `packages/**/src` and `./src/*` are forbidden production imports.
- Named Pipe is **not** a Harness extension seam. Pre-class: `SHACO_CUSTOM_CARRIER_PLUGIN`. `rpc.call` is `PREVIEW_PUBLIC_API`. Client `rpc.open` is **optional**. Stream contract may be satisfied via `rpc.open`, `__DSH_TRANSPORT__.openStream`, and/or Host `wireStream` (AUDIT-004 F-02).
- `PRESET_COPY_REQUIRED = NO`. `HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES`. Resume authority = Host only.
- Settings persistence depends on loopback / `ownsHost` (not-memory canary).
- BrowserAuth cookie proves token/cookie possession, not Windows user / Worker identity.
- Gateway assumes the caller is already authenticated for alternate `rpc.call` / stream open. Client `rpc.open` is not the sole stream path.
- Exact Fetch: `/api/session.export` is the binary ZIP path; `/export` product UI is OPTIONAL and is not the binary architecture gate.
- Web JSON `/api` buffers request bodies up to about 300 MiB.
- `SESSION_FORMAT_VERSION = 0`; credentials v1; workspace v2; projcache v4.
- `list_subagent_models` remains CONDITIONAL / OPTIONAL.
- Windows: `koffi`, `node-pty` static import, unpacked `./runner` and picker `./worker`, ripgrep; no Landlock; host `pwsh.exe` is not bundled; Electron ABI ≠ Node ABI; sidecar recommended; x64 first.
- Cordis: `tool-cordis` DEFERRED; host/client/UI runners OPTIONAL + omission proof.
- `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`.

Architecture baseline (not changed by this step): Electron Desktop + per-user Worker; Renderer → Preload / Electron IPC → Main → Named Pipe → Worker Harness Host. Fallback A = private loopback HTTP. Fallback B = Host in Electron Main only with Architecture Owner re-approval of D1/D2.

Optional product features (Jobs, Goal, Workflow, Ralph, Plan, Export UI, Images, Skills, plugin marketplace) are **not** P0.S Hard Gates.

---

## C. Master Risk Register

Field vocabulary is frozen. `CurrentStatus` is exactly one of: `RESOLVED_BY_P0` | `OPEN_FOR_P0S` | `OPEN_FOR_P05` | `OPEN_FOR_P1` | `OPEN_FOR_P7` | `ACCEPTED_RISK` | `BLOCKER`.

Severity is exactly one of: `BLOCKER` | `HIGH` | `MEDIUM` | `LOW`.

No `BLOCKER` rows exist. Remaining unknowns that can only be proven by Spike are `OPEN_FOR_P0S`, not P0 FAIL.

When a risk needs both Spike feasibility and a later Contract, `CurrentStatus` is the earliest executable phase; later routing is recorded in the Requires\* flags.

### C.1 Host composition

#### RISK-HOST-01

- Title: Host without stock `dsh-web-app` HTTP may lose required runtime/API surfaces
- Category: HOST_COMPOSITION
- Severity: HIGH
- KnownFact: `dsh-base` + custom bundle/profile is a documented extension seam. Worker entry is spawn `dsh --profile`. `dsh-web-app` is not the Shaco Host. Connection/modules hard-inject Cordis `webServer` **service** (Layer A). Gateway does not hard-inject `webServer`. Layer A ≠ Layer B stock HTTP.
- Unknown: Whether REQUIRED Gateway/Remote/Connection/runtime surfaces can be preserved without stock `dsh-web-app` browser-facing HTTP (Layer B), using profile/bundle/adapter/non-listening compatibility service (Layer C).
- Evidence: P0-2 composition map; P0-6 DEP boot/connection rows and three-layer freeze; `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`
- AffectedRequiredFeature: Host runtime, all REQUIRED tools via standard, session/settings/approval
- AffectedArchitectureDecision: ADR-0002 Worker as Harness Host; Host-only Worker
- AffectedPhase: P0.S-1, then P2
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: NO
- FallbackAvailable?: YES — Fallback A (private loopback HTTP) still Host-only; Fallback B only with Owner re-approval
- OwnerDecisionRequired?: only if Spike proves a Harness core patch is required; `PROVEN_WITH_CONSTRAINT` (Layer C stub/adapter, no Core Patch, no stock public Web stack) requires Owner accept at P0.S closure
- FailureImpact: Host-only Worker architecture fails; Desktop+Worker may still survive via Fallback A
- SpikeProof: H-01
- PassCondition: Worker does not run stock `dsh-web-app` product Web stack (no browser opener, token URL, client HMR, LAN/browser-facing product host) while REQUIRED Host runtime and Gateway/Remote/Connection semantics remain. A non-listening/local compatibility service that satisfies Layer A without exposing stock HTTP, without Core Patch, without Renderer-direct Worker access, and without secretly restoring `dsh-web-app` is `PROVEN_WITH_CONSTRAINT`, not FAIL.
- FailCondition: REQUIRED runtime / Connection / Client dependency exists only behind stock `dsh-web-app` HTTP/Web runtime and cannot be reconstructed via profile/bundle/public-or-preview seam/adapter/acceptable compatibility service at reasonable cost, **or** Harness Core must be modified.
- CurrentStatus: OPEN_FOR_P0S

#### RISK-HOST-02

- Title: Standard preset may fail outside stock web composition
- Category: HOST_COMPOSITION
- Severity: HIGH
- KnownFact: shipped `standard` can be loaded in place (`PRESET_COPY_REQUIRED = NO`). Product-required tool names are frozen in P0-5/P0-6.
- Unknown: whether a no-web Host still mounts REQUIRED tools (`pwsh`, fs/search, `ask_user_question`, continuable `subagent`, `send_message`, `interrupt_agent`, `list_agents`)
- Evidence: P0-2 standard YAML; P0-5 TOOL/SUB rows; P0-6 DEP-TOOL-01
- AffectedRequiredFeature: TOOL-01 and remaining REQUIRED tools
- AffectedArchitectureDecision: reuse Harness Host tools; no preset copy
- AffectedPhase: P0.S-1, P2, P5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES (preset compatibility expectation)
- RequiresP1Contract?: NO
- RequiresP7Verification?: NO
- FallbackAvailable?: NO acceptable product fallback that copies/forks standard source
- OwnerDecisionRequired?: if Spike claims preset copy is required (would contradict P0-6)
- FailureImpact: REQUIRED coding loop cannot start
- SpikeProof: H-02
- PassCondition: unmodified shipped `standard` mounts REQUIRED tools on Host-only Worker
- FailCondition: tools missing, disabled, or only present when `dsh-web-app` is composed
- CurrentStatus: OPEN_FOR_P0S

#### RISK-HOST-03

- Title: Host-only Worker may require Harness Core patch
- Category: HOST_COMPOSITION / CORE_PATCH
- Severity: HIGH
- KnownFact: no REQUIRED feature currently has a proven need for a core patch. Official Connection/modules plugins hard-inject the Cordis `webServer` **service** (Layer A). Gateway does not. `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` (not `NONE`, not `KNOWN_REQUIRED`). Adapter/stub is not automatically a Core Patch.
- Unknown: whether Host profile, Connection carrier, Client boot, Client modules, or native packaging actually require patching Harness core
- Evidence: P0-6 core-patch classification and patch-area inventory
- AffectedRequiredFeature: Host-only Worker; Client reuse; local carrier
- AffectedArchitectureDecision: no silent Harness fork; Worker is Harness Host
- AffectedPhase: P0.S-1/2/3/6/7, then Owner if YES
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES if any patch is accepted
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A may avoid some patches; Fallback B is Owner-gated
- OwnerDecisionRequired?: YES if any required patch is discovered
- FailureImpact: silent fork, upgrade fragility, or architecture return to Owner
- SpikeProof: H-26
- PassCondition: `CORE_PATCH_INVENTORY_COMPLETE` with explicit YES/NO per area (`HOST_PROFILE`, `CONNECTION_CARRIER`, `CLIENT_BOOT`, `CLIENT_MODULE`, `NATIVE_PACKAGING`) plus `ADAPTER_OR_STUB_USED` with Surface/Why/PublicOrPreviewSeamUsed/ProductionImpact; NONE or Owner-approved inventory. Adapter/stub ≠ Core Patch.
- FailCondition: required patch exists and is not fully inventoried, or is applied silently
- CurrentStatus: OPEN_FOR_P0S

### C.2 Client boot

#### RISK-CLIENT-01

- Title: Harness Client boot depends on Web-generated boot graph
- Category: CLIENT_BOOT
- Severity: HIGH
- KnownFact: `window.__DSH_BOOT__`, Host-dynamic module graph, `/plugins` delivery, and `loadBundle` preview seam exist. Public/preview Client boot seams were classified in P0-6.
- Unknown: how a secure Electron Renderer completes boot without stock Web index injection
- Evidence: P0-2 modules row; P0-3 boot graph; P0-6 Client boot adapter
- AffectedRequiredFeature: Desktop Client session UI; all REQUIRED Client projection
- AffectedArchitectureDecision: reuse Harness Client (ADR-0003)
- AffectedPhase: P0.S-2, P4
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES (loading model)
- RequiresP7Verification?: YES (packaged assets)
- FallbackAvailable?: approved loading-model variant still inside Electron Renderer; not a third architecture
- OwnerDecisionRequired?: if only a private/internal loader works after public/preview seams fail
- FailureImpact: Harness Client reuse fails
- SpikeProof: H-03
- PassCondition: Client initializes in secure Renderer and session UI can be entered
- FailCondition: Client only boots as a stock browser page served by `dsh-web-app`
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CLIENT-02

- Title: Electron custom scheme may fail privileged/trusted behavior
- Category: CLIENT_BOOT / SETTINGS
- Severity: HIGH
- KnownFact: Settings file persistence depends on loopback / `ownsHost`; stock non-loopback Client uses memory/unavailable settings. Settings persistence is REQUIRED (P0-5).
- Unknown: whether custom-scheme (or approved loading model) retains durable Settings, not the memory fallback
- Evidence: P0-4 loopback classifier and Settings canary; P0-6 DEP-SET-03
- AffectedRequiredFeature: SETTINGS_PERSISTENCE
- AffectedArchitectureDecision: Desktop capability vs Web loopback trust
- AffectedPhase: P0.S-2
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES (capability bit)
- RequiresP7Verification?: NO
- FallbackAvailable?: loading-model adjustment still in Renderer; must still pass not-memory canary
- OwnerDecisionRequired?: if Settings can only persist via stock loopback HTTP
- FailureImpact: REQUIRED Settings become session-memory; product durability fails
- SpikeProof: H-04
- PassCondition: Settings persist across Desktop restart; canary proves not-memory
- FailCondition: Settings stay memory/unavailable under the Electron loading model
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CLIENT-03

- Title: Required in-box Client modules may depend on `/plugins` or webserver
- Category: CLIENT_BOOT / MODULES
- Severity: HIGH
- KnownFact: stock Web delivers modules via `/plugins` combo URLs. P0.S-6 prefers build-time static inclusion of REQUIRED in-box modules.
- Unknown: whether REQUIRED in-box Client modules load without stock WebServer `/plugins`
- Evidence: P0-3 `/plugins`; P0-5 Client boot row; P0-6 Client modules
- AffectedRequiredFeature: REQUIRED Client UI modules (session, approval, question, settings, workspace picker surfaces)
- AffectedArchitectureDecision: packaged Client; no stock webserver
- AffectedPhase: P0.S-6, P4
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES (asset packing)
- FallbackAvailable?: static inclusion at build time is the preferred Spike path
- OwnerDecisionRequired?: if modules only load through live `/plugins`
- FailureImpact: incomplete Core Client
- SpikeProof: H-05
- PassCondition: REQUIRED in-box modules load in packaged Renderer without stock `/plugins` server
- FailCondition: Core Client missing required modules unless WebServer serves `/plugins`
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CLIENT-04

- Title: Client boot adaptation may require private/internal loader
- Category: CLIENT_BOOT
- Severity: MEDIUM
- KnownFact: P0-6 proved public/preview seams exist (`__DSH_BOOT__`, `__ModuleLoader__`, `loadBundle`). Therefore this is not a P0 BLOCKER.
- Unknown: whether Spike can stay on those seams or must use a private loader
- Evidence: P0-6 Client boot adapter; this P0-7 classification
- AffectedRequiredFeature: Client boot
- AffectedArchitectureDecision: documented vs internal loader
- AffectedPhase: P0.S-2
- CanP0Resolve?: NO (seam existence is resolved; feasibility is not)
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES if private loader is used
- RequiresP7Verification?: NO
- FallbackAvailable?: Owner-approved private loader still inside Electron Renderer
- OwnerDecisionRequired?: YES if private/internal loader is the only working path
- FailureImpact: FORBIDDEN import or undocumented boot shortcut
- SpikeProof: H-03 / H-26
- PassCondition: boot uses documented/preview public seam, or every private loader is inventoried for Owner
- FailCondition: silent private loader with no inventory
- CurrentStatus: OPEN_FOR_P0S

### C.3 Connection / carrier

#### RISK-CARRIER-01

- Title: Named Pipe is not an upstream Harness carrier seam
- Category: CARRIER
- Severity: HIGH
- KnownFact: Named Pipe = `SHACO_CUSTOM_CARRIER_PLUGIN`. Connection `rpc.call` = `PREVIEW_PUBLIC_API`. Client `rpc.open` is optional. Stream seams also include `__DSH_TRANSPORT__.openStream` and Host `wireStream`. PeekNamedPipe appears only in child-stdout drain; sandbox teaching forbids confined processes from opening named pipes.
- Unknown: whether unary/stream/events/binary/trust can be mapped losslessly across Desktop Main ↔ Worker
- Evidence: P0-6 Named Pipe classification; P0-3 ConnectionHandle; System Architecture fallback rule
- AffectedRequiredFeature: all Connection-using REQUIRED features
- AffectedArchitectureDecision: physical carrier is Shaco-owned; Desktop+Worker split
- AffectedPhase: P0.S-3/4
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES (CarrierVersion / carrier major)
- RequiresP1Contract?: YES (Carrier Adapter boundary)
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A private loopback HTTP; Fallback B Owner-gated
- OwnerDecisionRequired?: if Named Pipe fails and Fallback A also fails, or if Fallback B is proposed
- FailureImpact: primary topology fails; `SHACO_FORGE_V1_0_P0S = FAIL` if no acceptable A
- SpikeProof: H-06 (and H-07..H-15 as completeness)
- PassCondition: custom Named Pipe carrier preserves `rpc.call` with authentication before Gateway
- FailCondition: cannot map unary without unacceptable core patch
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CARRIER-02

- Title: Streaming semantics may rely on Web mux behavior
- Category: CARRIER
- Severity: HIGH
- KnownFact: Client `rpc.open` can supply AsyncIterable **when present**; it is optional and omitted on browser transports. Web mux covers item/error/end/cancel. Concurrent Remote streams exist (`follow` / `control` / `workspace` / `$events`). Equivalent public/preview paths: `__DSH_TRANSPORT__.openStream`, Host `wireStream`.
- Unknown: whether a replacement carrier preserves open, AsyncIterable delivery, item ordering, error, end, cancellation, concurrent streams, connection loss, and backpressure without the stock Web mux.
- Evidence: P0-3 streaming/cancellation census; P0-6 Connection boundary (AUDIT-004 F-02)
- AffectedRequiredFeature: conversation streaming; projection streams; `$events`
- AffectedArchitectureDecision: reuse Connection semantics, not a second Agent RPC
- AffectedPhase: P0.S-4
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES (framing)
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A may reuse Web mux over loopback HTTP
- OwnerDecisionRequired?: if stream contract cannot be preserved
- FailureImpact: live Agent UX / projection broken
- SpikeProof: H-07
- PassCondition: replacement carrier preserves the streaming contract (open / items / error / end / cancel / concurrency / loss / backpressure) via `rpc.open` **or** `openStream` / `wireStream` compatible seam. Do not treat Client `rpc.open` as the only product Hard Gate.
- FailCondition: streams hang, leak, drop cancel, or serialize incorrectly on every available seam
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CARRIER-03

- Title: Event / generation semantics may be lost in replacement carrier
- Category: CARRIER
- Severity: HIGH
- KnownFact: `$events.ready` establishes generation; `connection/reset` tells owners to repull; waterfall eventIds persist in Gateway memory across Client generations
- Unknown: whether replacement carrier preserves ready / generation / reset / waterfall
- Evidence: P0-3 `$events` map
- AffectedRequiredFeature: approval, user question, projection rebuild
- AffectedArchitectureDecision: Host-owned generation, Desktop projection
- AffectedPhase: P0.S-4/5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A
- OwnerDecisionRequired?: if generation cannot be reconstructed
- FailureImpact: stale projection; duplicate settlement
- SpikeProof: H-08
- PassCondition: `$events` ready/generation/reset/waterfall survive replacement carrier
- FailCondition: generation stuck, ready missing, or events not redelivered correctly
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CARRIER-04

- Title: Binary / Exact Fetch may still assume HTTP Fetch semantics
- Category: CARRIER
- Severity: HIGH
- KnownFact: `/api/session.export` is the enumerated exact/binary Fetch route. `/export` UI is OPTIONAL and is not this architecture gate. `BINARY_CARRIER` remains required.
- Unknown: whether authenticated, cancellable, bounded-memory exact-byte transport works on the replacement carrier
- Evidence: P0-3 exact Fetch enumeration; P0-5 binary vs export split; REVIEW-003
- AffectedRequiredFeature: architecture binary carrier (not Export product)
- AffectedArchitectureDecision: one physical carrier for unary/stream/binary
- AffectedPhase: P0.S-4
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A HTTP Fetch on loopback
- OwnerDecisionRequired?: if binary cannot share the local trust boundary
- FailureImpact: later attachments/export/binary paths require a second untrusted transport
- SpikeProof: H-13
- PassCondition: any real exact/binary path works with auth, cancel, and bounded memory
- FailCondition: binary only works as anonymous HTTP Fetch
- CurrentStatus: OPEN_FOR_P0S

#### RISK-CARRIER-05

- Title: Backpressure / payload size may produce unsafe memory usage
- Category: CARRIER
- Severity: MEDIUM
- KnownFact: Web JSON `/api` buffers request bodies up to about 300 MiB; 200 MiB images expand as base64
- Unknown: Desktop/Worker carrier memory profile and backpressure
- Evidence: P0-3 body-size row; P0-4 HTTP bridge buffer
- AffectedRequiredFeature: streaming and any large payload path
- AffectedArchitectureDecision: Worker as trusted runtime must not unbounded-buffer
- AffectedPhase: P0.S-3/4 (evidence), P1 (limits)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES (bounded-memory evidence)
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES (payload limits)
- RequiresP7Verification?: NO
- FallbackAvailable?: fail-closed size limits
- OwnerDecisionRequired?: NO
- FailureImpact: Desktop/Worker OOM / DoS
- SpikeProof: H-13 (binary) plus supporting stream payload evidence
- PassCondition: Spike captures peak-memory / limit evidence; no unbounded copy of Web 300 MiB default without measurement
- FailCondition: carrier unbounded-buffers with no evidence
- CurrentStatus: OPEN_FOR_P0S

### C.4 Trust / identity

#### RISK-TRUST-01

- Title: Non-Web transport must authenticate before Gateway
- Category: TRUST
- Severity: HIGH
- KnownFact: Gateway assumes caller already authenticated. Alternate `rpc.call/open` does not authenticate those hooks.
- Unknown: product local identity that authenticates before Gateway without BrowserAuth
- Evidence: P0-4 alternate transport trust; P0-6 Connection adapter
- AffectedRequiredFeature: all Host APIs
- AffectedArchitectureDecision: local trust boundary; cookie is not product identity
- AffectedPhase: P0.S-3
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES (handshake before Agent write)
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A must re-satisfy local identity; BrowserAuth is reference only
- OwnerDecisionRequired?: if no local auth can be placed before Gateway
- FailureImpact: unauthenticated Gateway access
- SpikeProof: H-14
- PassCondition: unauthenticated caller cannot invoke Gateway; authenticated local caller can
- FailCondition: pipe/loopback reaches Gateway with no product auth
- CurrentStatus: OPEN_FOR_P0S

#### RISK-TRUST-02

- Title: BrowserAuth cannot serve as Windows user / Worker identity
- Category: TRUST
- Severity: HIGH
- KnownFact: cookie proves token/cookie possession and BrowserAuth signing secret, not current Windows user or current Worker process. This fact is P0-resolved. Replacement identity is not.
- Unknown: SID ACL + Worker identity scheme that replaces BrowserAuth
- Evidence: P0-4 BrowserAuth cookie contract
- AffectedRequiredFeature: local attach
- AffectedArchitectureDecision: cookie ≠ product identity
- AffectedPhase: P0.S-3, P1
- CanP0Resolve?: fact YES; replacement NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: Fallback A still cannot default cookie = identity
- OwnerDecisionRequired?: if Spike treats cookie as product identity
- FailureImpact: wrong-user or stale-session attach
- SpikeProof: H-14
- PassCondition: product identity is current-user + Worker identity, not BrowserAuth cookie
- FailCondition: Desktop authenticates to Worker solely via Harness browser cookie
- CurrentStatus: OPEN_FOR_P0S

#### RISK-TRUST-03

- Title: Electron custom scheme may break Settings persistence
- Category: TRUST / SETTINGS
- Severity: HIGH
- KnownFact: same as RISK-CLIENT-02 (loopback / `ownsHost` canary)
- Unknown: same Settings canary under Electron loading model
- Evidence: P0-4; P0-6 DEP-SET-03
- AffectedRequiredFeature: SETTINGS_PERSISTENCE
- AffectedArchitectureDecision: trusted Desktop capability
- AffectedPhase: P0.S-2
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: capability adapter (`ownsHost` or documented equivalent)
- OwnerDecisionRequired?: if only loopback HTTP can persist Settings
- FailureImpact: REQUIRED Settings fail
- SpikeProof: H-04
- PassCondition: SETTINGS_PERSISTENCE_NOT_MEMORY
- FailCondition: memory fallback
- CurrentStatus: OPEN_FOR_P0S

#### RISK-TRUST-04

- Title: Desktop may attach to stale or wrong Worker
- Category: TRUST / IDENTITY
- Severity: HIGH
- KnownFact: Worker is per Windows user, long-running, independent of window. PID-only identity is insufficient (Security Model).
- Unknown: discovery, stale endpoint, PID reuse, reconnect attach
- Evidence: Security Model; Desktop-Worker Boundary; P0-6 P1 inputs
- AffectedRequiredFeature: reconnect; all Agent writes
- AffectedArchitectureDecision: one Worker per user; Desktop is projection
- AffectedPhase: P0.S-5 (feasibility), P1 (contract)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES (DSH_HOME / Worker identity in handshake)
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: fail-closed refuse attach
- OwnerDecisionRequired?: NO for P0
- FailureImpact: Desktop drives the wrong runtime / durable universe
- SpikeProof: H-18 / H-19
- PassCondition: Spike detects stale/wrong endpoint and does not silently attach
- FailCondition: PID reuse or stale pipe is treated as the live Worker
- CurrentStatus: OPEN_FOR_P0S

#### RISK-TRUST-05

- Title: Renderer may gain reusable Worker credential or direct transport access
- Category: TRUST
- Severity: HIGH
- KnownFact: product requires `nodeIntegration` off, contextIsolation on, sandbox on, preload allowlist. Renderer must not open the pipe or hold reusable Worker credential.
- Unknown: whether the Spike loading/carrier design leaks pipe handle or credential into Renderer
- Evidence: Security Model; P0.S-3 hard requirements
- AffectedRequiredFeature: entire Desktop trust boundary
- AffectedArchitectureDecision: Main owns carrier; Renderer is projection
- AffectedPhase: P0.S-2/3
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: NO (this is non-negotiable for primary and Fallback A)
- OwnerDecisionRequired?: if Renderer must hold the pipe
- FailureImpact: XSS/preload bug becomes Worker RCE/auth bypass
- SpikeProof: H-15
- PassCondition: Renderer cannot open pipe or reuse Worker credential; only allowlisted IPC
- FailCondition: Renderer holds named-pipe path+ACL secret or connects directly
- CurrentStatus: OPEN_FOR_P0S

#### RISK-TRUST-06

- Title: Unary / stream / binary may accidentally use different trust boundaries
- Category: TRUST
- Severity: HIGH
- KnownFact: Web path uses cookie on Fetch and WebSocket separately; exact Fetch is a distinct HTTP route
- Unknown: whether the replacement carrier applies one trust level to unary, stream, and binary
- Evidence: P0-3 Fetch vs mux; P0-4 trust layers
- AffectedRequiredFeature: BINARY_CARRIER plus Connection
- AffectedArchitectureDecision: one local trust boundary
- AffectedPhase: P0.S-3/4
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: fail-closed refuse mixed anonymous binary
- OwnerDecisionRequired?: if binary must remain HTTP-anonymous
- FailureImpact: authenticated RPC + anonymous binary hole
- SpikeProof: H-13 / H-14
- PassCondition: unary, stream, and binary share the same authenticated local trust level
- FailCondition: one of the three is unauthenticated or a different principal
- CurrentStatus: OPEN_FOR_P0S

### C.5 Session / resume / interaction

#### RISK-SESSION-01

- Title: Desktop accidentally becomes second Session resume authority
- Category: SESSION
- Severity: HIGH
- KnownFact: ResumeAuthority = Host only. `HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES`. Desktop reconnect is projection recovery.
- Unknown: whether Desktop reconnect implementation accidentally resumes/replays Agent
- Evidence: P0-3 session-cold/resume; P0-6 persistence policy; ADR-0003
- AffectedRequiredFeature: SES resume/continue
- AffectedArchitectureDecision: Worker = runtime truth
- AffectedPhase: P0.S-5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: NO (must remain Host-only)
- OwnerDecisionRequired?: if Desktop must own resume
- FailureImpact: duplicate Agent / corrupted session
- SpikeProof: H-12
- PassCondition: reconnect rebuilds projection from Host; Desktop does not own Agent resume
- FailCondition: Desktop writes/resumes session independently
- CurrentStatus: OPEN_FOR_P0S

#### RISK-SESSION-02

- Title: Pending approval reconnect could duplicate settlement
- Category: SESSION / APPROVAL
- Severity: HIGH
- KnownFact: first result wins; Gateway cancels other deliveries; late event ids are no-op; Client carrier is one-shot; event redelivery exists
- Unknown: disconnect/reconnect duplicate-answer behavior on the replacement carrier
- Evidence: P0-3 approval settlement; P0-5 approval REQUIRED
- AffectedRequiredFeature: approval round-trip
- AffectedArchitectureDecision: Host settlement authority
- AffectedPhase: P0.S-4/5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: NO
- OwnerDecisionRequired?: NO
- FailureImpact: double-allow / audit split
- SpikeProof: H-09
- PassCondition: reconnect redelivers pending approval; duplicate answers do not double-settle
- FailCondition: two settled outcomes or lost pending approval
- CurrentStatus: OPEN_FOR_P0S

#### RISK-SESSION-03

- Title: User Question redelivery could duplicate/corrupt answer
- Category: SESSION / QUESTION
- Severity: HIGH
- KnownFact: same `$events/result` mechanism as approval, separate service/vocabulary. User Question is REQUIRED (P0-5).
- Unknown: reconnect duplicate-answer behavior
- Evidence: P0-3 user-question census; P0-5 USER_QUESTION_CLASSIFICATION = REQUIRED
- AffectedRequiredFeature: ask_user_question
- AffectedArchitectureDecision: Host settlement authority
- AffectedPhase: P0.S-4/5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: NO
- OwnerDecisionRequired?: NO
- FailureImpact: corrupted tool answer / duplicate user input
- SpikeProof: H-10
- PassCondition: reconnect redelivers pending question; duplicate answers do not double-settle
- FailCondition: two answers applied or pending question lost
- CurrentStatus: OPEN_FOR_P0S

#### RISK-SESSION-04

- Title: Desktop transport disconnect could accidentally cancel Agent
- Category: SESSION
- Severity: HIGH
- KnownFact: stock Harness disconnect aborts that socket's pumps and ends Client generation; it does not call `session/cancel` or `agent.cancel`
- Unknown: whether Shaco carrier/close mapping accidentally sends cancel
- Evidence: P0-3 cancellation census; ADR-0007 Close ≠ Stop
- AffectedRequiredFeature: Desktop close while Agent runs
- AffectedArchitectureDecision: Close Window = Worker survives, Agent continues
- AffectedPhase: P0.S-5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: NO for primary semantics
- OwnerDecisionRequired?: if disconnect must cancel (would contradict ADR-0007)
- FailureImpact: closing Desktop kills in-flight Agent
- SpikeProof: H-11 / H-17
- PassCondition: transport disconnect does not cancel Host Agent; explicit cancel does
- FailCondition: close/crash/disconnect issues `session/cancel`
- CurrentStatus: OPEN_FOR_P0S

#### RISK-SESSION-05

- Title: Worker restart recovery differs from Desktop reconnect recovery
- Category: SESSION / LIFECYCLE
- Severity: HIGH
- KnownFact: Host restart drops Gateway-memory pending waterfalls; persisted sessions remain Host-owned JSONL. These are different recoveries.
- Unknown: Desktop-connected Worker restart detect + re-project behavior
- Evidence: P0-3 approval persistence boundary; Master Goal item 10
- AffectedRequiredFeature: Worker restart recovery
- AffectedArchitectureDecision: Worker is runtime; Desktop re-projects
- AffectedPhase: P0.S-5 (feasibility), P1 (contract)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: fail-closed stale-projection banner
- OwnerDecisionRequired?: NO
- FailureImpact: Desktop shows live session that no longer exists in process
- SpikeProof: H-19
- PassCondition: Worker restart is detected; projection is rebuilt or explicitly invalidated; not confused with Desktop reconnect
- FailCondition: Desktop continues as if the old Host generation is live
- CurrentStatus: OPEN_FOR_P0S

### C.6 Directory picker

#### RISK-PICKER-01

- Title: Host-side Windows native picker may be unsuitable from long-running Worker
- Category: PICKER
- Severity: HIGH
- KnownFact: picker-auto is INTERNAL; native/browse are usable public/preview seams. Directory picker is REQUIRED (P0-5).
- Unknown: whether Host native picker works from a headless long-running Worker, or a documented Desktop equivalent (Electron Main dialog) is required
- Evidence: P0-4 picker; P0-5 DIRECTORY_PICKER; P0-6 native picker exports
- AffectedRequiredFeature: workspace select/create
- AffectedArchitectureDecision: Desktop may own native dialog as documented equivalent; Worker remains runtime
- AffectedPhase: P0.S-4 (feasibility only); P1 formal contract if Desktop equivalent
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES if Desktop equivalent is chosen
- RequiresP7Verification?: YES (unpack `./worker`)
- FallbackAvailable?: documented Desktop equivalent (Electron Main native dialog)
- OwnerDecisionRequired?: if no native or Desktop equivalent works
- FailureImpact: REQUIRED workspace selection fails
- SpikeProof: H-16
- PassCondition: `NATIVE_PICKER_OR_DOCUMENTED_DESKTOP_EQUIVALENT` works on Windows
- FailCondition: no usable picker path
- CurrentStatus: OPEN_FOR_P0S

### C.7 Cordis / Client modules

#### RISK-CORDIS-01

- Title: Cordis host/client/UI runners may be hidden core boot dependency
- Category: CORDIS
- Severity: HIGH
- KnownFact: `tool-cordis` = DEFERRED. host/client/ui runners = OPTIONAL + omission proof. Dynamic Cordis is not V1.0 release default unless required.
- Unknown: whether omitting cordis-host-runner / cordis-client-runner / ui-cordis breaks Core Client boot
- Evidence: P0-5 Cordis classification; P0-6 plugin/cordis rows; Master Goal out of scope
- AffectedRequiredFeature: Core Client boot (not Dynamic Cordis product)
- AffectedArchitectureDecision: in-box only; no Dynamic Cordis default
- AffectedPhase: P0.S-6
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: NO
- FallbackAvailable?: include runners only if proven required; still not Dynamic Cordis marketplace
- OwnerDecisionRequired?: if runners are hidden-required, Owner decides keep-vs-scope-change
- FailureImpact: either broken boot or accidental Dynamic Cordis in 1.0
- SpikeProof: H-20
- PassCondition: omit host/client/UI runners; Core Client still boots. tool-cordis remains unused.
- FailCondition: Core Client cannot boot without those runners, and this is not inventoried
- CurrentStatus: OPEN_FOR_P0S

### C.8 Windows / packaging

#### RISK-PKG-01

- Title: Fresh Windows package may require external Node
- Category: PACKAGING
- Severity: HIGH
- KnownFact: Master Goal forbids manual Node install. Python SDK single-exe is analogue only, not the Desktop proof.
- Unknown: packaged product starts without system Node
- Evidence: P0-1 engines.node; P0-6 sidecar recommendation; Master Goal
- AffectedRequiredFeature: fresh install launch
- AffectedArchitectureDecision: packaged Worker/Harness
- AffectedPhase: P0.S-7
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES (Node runtime pin in release manifest)
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES (production installer)
- FallbackAvailable?: NO for V1.0 completion definition
- OwnerDecisionRequired?: if system Node is required
- FailureImpact: V1.0 Master Goal fails
- SpikeProof: H-21
- PassCondition: `NO_SYSTEM_NODE_REQUIRED`
- FailCondition: app cannot start without a preinstalled Node
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-02

- Title: Runtime may require external pnpm
- Category: PACKAGING
- Severity: HIGH
- KnownFact: Harness `packageManager` is `pnpm@11.7.0`. Production must not require users to have pnpm.
- Unknown: packaged start without pnpm
- Evidence: P0-1; P0-6 no-tsx/SRC fallback
- AffectedRequiredFeature: fresh install
- AffectedArchitectureDecision: no source-dev bootstrap in production
- AffectedPhase: P0.S-7
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: NO
- OwnerDecisionRequired?: if pnpm is required at runtime
- FailureImpact: Master Goal fails
- SpikeProof: H-22
- PassCondition: `NO_SYSTEM_PNPM_REQUIRED`
- FailCondition: start path invokes pnpm/tsx
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-03

- Title: Worker runtime ABI may conflict with Electron ABI
- Category: PACKAGING
- Severity: HIGH
- KnownFact: Electron ABI ≠ Node ABI. `koffi` / `node-pty` / `node-addon-require-builtin` are native. Sidecar recommended. P0.S must prove exactly one `WORKER_RUNTIME_STRATEGY`.
- Unknown: which proven strategy works (bundled Node sidecar vs Electron-rebuilt addons vs other)
- Evidence: P0-6 DEP-WIN-04/05/06
- AffectedRequiredFeature: TOOL-01, persistence, picker, sandbox
- AffectedArchitectureDecision: Worker process vs in-Electron Host
- AffectedPhase: P0.S-7
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES (Node runtime pin)
- RequiresP1Contract?: YES
- RequiresP7Verification?: YES
- FallbackAvailable?: sidecar is the recommended candidate, not yet proven
- OwnerDecisionRequired?: if only in-process Electron Host works (pushes toward Fallback B)
- FailureImpact: native modules fail; or architecture collapses into Main
- SpikeProof: H-23
- PassCondition: one strategy proven; status cannot remain UNRESOLVED
- FailCondition: natives fail on both sidecar and Electron, or strategy left unresolved
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-04

- Title: asar/unpack may break runner/worker/native dependencies
- Category: PACKAGING
- Severity: HIGH
- KnownFact: windows-acl `./runner`, native picker `./worker`, `node-pty`, `koffi`, ripgrep, and spawned executables need real filesystem paths
- Unknown: packaged asar/unpack layout
- Evidence: P0-6 Windows native map
- AffectedRequiredFeature: sandbox, picker, shell, search
- AffectedArchitectureDecision: packaged Harness
- AffectedPhase: P0.S-7 (feasibility), P7 (production)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: unpack allowlist
- OwnerDecisionRequired?: NO
- FailureImpact: Worker starts then dies on first native/tool use
- SpikeProof: H-25
- PassCondition: listed natives/helpers resolve and run from packaged layout
- FailCondition: asar-missing or wrong cwd for runner/worker/rg/pty
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-05

- Title: DSH_HOME may point to wrong/read-only location
- Category: PACKAGING / DATA
- Severity: HIGH
- KnownFact: Harness durable universe is `$DSH_HOME`. Product must control a writable per-user stable location.
- Unknown: packaged default, roaming vs local, elevation, and mismatch attach
- Evidence: P0-6 home-paths; Data Ownership; P0.5 DSH_HOME mismatch
- AffectedRequiredFeature: all persistence
- AffectedArchitectureDecision: Harness owns data; Shaco controls path identity
- AffectedPhase: P0.S-7, P0.5, P1
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES
- RequiresP1Contract?: YES
- RequiresP7Verification?: YES
- FallbackAvailable?: fail-closed on mismatch
- OwnerDecisionRequired?: NO
- FailureImpact: wrong durable universe or unwritable Sessions/Settings
- SpikeProof: H-24
- PassCondition: `DSH_HOME_CONTROLLED` writable, per-user, stable
- FailCondition: uses shared/read-only/unexpected home
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-06

- Title: PowerShell path assumptions may fail on stock Windows
- Category: PACKAGING
- Severity: MEDIUM
- KnownFact: `pwsh.exe` is not bundled. `dsh-pwsh-local` resolves host PowerShell / Windows PowerShell 5.1 fallback. P0-7 does **not** decide to bundle PowerShell.
- Unknown: Windows 11 target machine actual availability and packaged resolution
- Evidence: P0-6 DEP-WIN-02; P0-5 TOOL-01
- AffectedRequiredFeature: TOOL-01
- AffectedArchitectureDecision: require host PowerShell rather than ship pwsh (pending Spike evidence; no auto-bundle)
- AffectedPhase: P0.S-7 (path proof), P7 (documented requirement)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES (document Windows 11 expectation)
- FallbackAvailable?: Windows PowerShell 5.1 fallback already in upstream resolver; bundling pwsh is Owner-only
- OwnerDecisionRequired?: only if Spike proves neither PS7 nor 5.1 is acceptable and bundling is proposed
- FailureImpact: REQUIRED shell missing on some SKUs
- SpikeProof: H-25
- PassCondition: documented host PowerShell strategy works on target Windows 11; no silent bundle
- FailCondition: tool-pwsh cannot resolve any shell, or product silently bundles pwsh without Owner decision
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-07

- Title: Windows sandbox partial/native behavior differs from Linux
- Category: PACKAGING / SECURITY
- Severity: MEDIUM
- KnownFact: `PLATFORM_CHAINS.win32 = ['windows-acl']`. Landlock is Linux-only and is **not** a Windows gate.
- Unknown: packaged windows-acl `./runner` actual enforcement
- Evidence: P0-6 sandbox-local; Security Model
- AffectedRequiredFeature: TOOL-01 sandbox/permission
- AffectedArchitectureDecision: Windows ACL sandbox
- AffectedPhase: P0.S-7 (path/load), P5/P7 (policy strength)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES (load/path)
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: NO Landlock-on-Windows
- OwnerDecisionRequired?: NO
- FailureImpact: sandbox missing or Linux assumptions leak into Windows gates
- SpikeProof: H-25
- PassCondition: windows-acl runner loads from packaged Worker; tests do not use Landlock as Windows gate
- FailCondition: Windows gate depends on Landlock or runner missing
- CurrentStatus: OPEN_FOR_P0S

#### RISK-PKG-08

- Title: Native modules may fail because of Node version / x64 / ABI
- Category: PACKAGING
- Severity: MEDIUM
- KnownFact: V1.0 is Windows x64 first. ARM64 is not a P0.S release blocker (see RISK-ARM64-NOT-V10). `engines.node` is `^22.19.0 || >=24.0.0`.
- Unknown: exact Node pin vs koffi/node-pty/require-builtin on x64 packaged runtime
- Evidence: P0-1; P0-6 native ABI; Master Goal ARM64 out of scope
- AffectedRequiredFeature: native-using REQUIRED tools
- AffectedArchitectureDecision: x64-only V1.0 allowed
- AffectedPhase: P0.S-7
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES (x64)
- RequiresP05Contract?: YES (Node pin)
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: pin Node sidecar to a known-good x64 version
- OwnerDecisionRequired?: NO for ARM64 skip
- FailureImpact: x64 natives fail
- SpikeProof: H-23 / H-25
- PassCondition: natives load on Windows x64 packaged runtime with pinned Node
- FailCondition: x64 ABI mismatch with no proven pin
- CurrentStatus: OPEN_FOR_P0S

### C.9 Process lifecycle

#### RISK-LIFE-01

- Title: Second Desktop may create duplicate projection/control authority
- Category: LIFECYCLE
- Severity: HIGH
- KnownFact: one Worker per Windows user. Second-instance policy must be safe. UX details are not frozen now.
- Unknown: actual second-instance behavior (focus existing, refuse, or attach-as-projection)
- Evidence: REVIEW-003 second Desktop; Master Goal
- AffectedRequiredFeature: Desktop uniqueness / control
- AffectedArchitectureDecision: Desktop is projection, not a second Worker
- AffectedPhase: P0.S-5 (safe behavior), P1 (UX freeze)
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: single-instance mutex + fail-closed
- OwnerDecisionRequired?: NO for P0
- FailureImpact: two Desktops issuing conflicting control
- SpikeProof: H-18
- PassCondition: second Desktop does not create a second Worker or a second control authority
- FailCondition: second instance starts a second Host or dual-controls one Host unsafely
- CurrentStatus: OPEN_FOR_P0S

#### RISK-LIFE-02

- Title: Stale endpoint / PID reuse may attach wrong process
- Category: LIFECYCLE
- Severity: HIGH
- KnownFact: overlapping RISK-TRUST-04. P1 needs final Worker Identity Contract. P0.S verifies basic feasibility.
- Unknown: identity tuple beyond PID
- Evidence: Security Model; P0-6 P1 inputs
- AffectedRequiredFeature: attach/reconnect
- AffectedArchitectureDecision: Worker logical identity ≠ process instance
- AffectedPhase: P0.S-5, P1
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: YES
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: fail-closed
- OwnerDecisionRequired?: NO
- FailureImpact: wrong-process attach
- SpikeProof: H-18 / H-19
- PassCondition: stale endpoint/PID reuse is detected
- FailCondition: attach succeeds against a reused PID or dead endpoint
- CurrentStatus: OPEN_FOR_P0S

#### RISK-LIFE-03

- Title: Worker crash/restart while Desktop connected may produce stale projection
- Category: LIFECYCLE
- Severity: HIGH
- KnownFact: overlapping RISK-SESSION-05
- Unknown: live detect + re-project
- Evidence: P0-3 generation; Master Goal
- AffectedRequiredFeature: connected Worker restart
- AffectedArchitectureDecision: Desktop projection
- AffectedPhase: P0.S-5
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: explicit disconnected/stale UI
- OwnerDecisionRequired?: NO
- FailureImpact: user continues a dead session
- SpikeProof: H-19
- PassCondition: Desktop detects Worker restart and re-projects or invalidates
- FailCondition: UI remains live against dead Host
- CurrentStatus: OPEN_FOR_P0S

#### RISK-LIFE-04

- Title: Close / Stop / Exit semantics may be violated by actual process architecture
- Category: LIFECYCLE
- Severity: HIGH
- KnownFact: frozen product semantics (ADR-0007): Close Window = Desktop closes, Worker survives; Stop Worker = Worker stops, Desktop may remain; Exit Shaco Forge = Desktop + graceful Worker shutdown. P0.S verifies the first two core feasibilities. Full lifecycle freeze is P1.
- Unknown: whether the process topology can implement Close vs Stop
- Evidence: ADR-0007; Desktop-Worker Boundary
- AffectedRequiredFeature: Desktop independence
- AffectedArchitectureDecision: D1/D2 dual-core processes
- AffectedPhase: P0.S-5, P1
- CanP0Resolve?: NO
- RequiresP0SSpike?: YES
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: YES (installer/service-like shutdown)
- FallbackAvailable?: Fallback B would break Close ≠ Stop and is Owner-only
- OwnerDecisionRequired?: if Close cannot leave Worker alive
- FailureImpact: D1/D2 invalidated
- SpikeProof: H-17
- PassCondition: close and crash leave Worker running; Stop is a distinct action
- FailCondition: close/crash stops Worker, or there is no distinct Stop
- CurrentStatus: OPEN_FOR_P0S

### C.10 Persistence / version / upgrade

These are not P0.S Hard Gates. P0.S must not redesign upgrade.

#### RISK-UPGRADE-01

- Title: Harness format version may change across baseline
- Category: UPGRADE
- Severity: MEDIUM
- KnownFact: `SESSION_FORMAT_VERSION = 0`; credentials v1; workspace v2; projcache v4; no session migration
- Unknown: future baseline format bumps
- Evidence: P0-6 upgrade-sensitive surfaces
- AffectedRequiredFeature: persistence compatibility
- AffectedArchitectureDecision: ADR-0004 pin + fail-closed
- AffectedPhase: P0.5, P7
- CanP0Resolve?: fact YES; policy freeze NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: YES
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: backup + old binary restore
- OwnerDecisionRequired?: NO
- FailureImpact: new Harness cannot read old data without restore path
- SpikeProof: none (not a Spike)
- PassCondition: P0.5 records format identities and fail-closed mismatch
- FailCondition: product writes across mismatched formats
- CurrentStatus: OPEN_FOR_P05

#### RISK-UPGRADE-02

- Title: Harness baseline mismatch may write incompatible data
- Category: UPGRADE
- Severity: HIGH
- KnownFact: exact SHA pin is the V1.0 rule. Handshake must fail closed before Agent write.
- Unknown: P0.5 matrix details (not designed here)
- Evidence: ADR-0004; P0.5 contract candidate; P0-1 pin
- AffectedRequiredFeature: all durable writes
- AffectedArchitectureDecision: fail-closed upgrades
- AffectedPhase: P0.5
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: YES
- RequiresP1Contract?: YES (handshake boundary)
- RequiresP7Verification?: YES
- FallbackAvailable?: refuse write
- OwnerDecisionRequired?: NO
- FailureImpact: silent data corruption
- SpikeProof: none
- PassCondition: mismatch refuses Agent write path
- FailCondition: mixed baseline writes Harness data
- CurrentStatus: OPEN_FOR_P05

#### RISK-UPGRADE-03

- Title: DSH_HOME mismatch may connect to wrong durable universe
- Category: UPGRADE
- Severity: HIGH
- KnownFact: DSH_HOME identity is a handshake input (P0.5). Overlaps RISK-PKG-05 path control.
- Unknown: match policy details
- Evidence: P0.5 DSH_HOME_MISMATCH; Data Ownership
- AffectedRequiredFeature: all persistence
- AffectedArchitectureDecision: one durable universe per Worker environment
- AffectedPhase: P0.5, P1
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO (path feasibility is PKG-05 / H-24)
- RequiresP05Contract?: YES
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: fail-closed
- OwnerDecisionRequired?: NO
- FailureImpact: sessions/credentials from another profile
- SpikeProof: none as upgrade policy
- PassCondition: DSH_HOME mismatch fails closed
- FailCondition: attach proceeds against a different home
- CurrentStatus: OPEN_FOR_P05

#### RISK-UPGRADE-04

- Title: Backup failure / disk full / corruption may leave un-restorable upgrade
- Category: UPGRADE
- Severity: MEDIUM
- KnownFact: P0.5 requires verified backup before INSTALL; disk-full / backup-failed must not proceed
- Unknown: production transaction implementation
- Evidence: P0.5 upgrade transaction; ADR-0004
- AffectedRequiredFeature: upgrade
- AffectedArchitectureDecision: backup + restore, not down-migration
- AffectedPhase: P0.5 (policy), P7 (implementation)
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: YES
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: abort upgrade
- OwnerDecisionRequired?: NO
- FailureImpact: user cannot return to old version
- SpikeProof: none
- PassCondition: backup failure blocks install; restore path defined
- FailCondition: install proceeds without verified backup
- CurrentStatus: OPEN_FOR_P05

#### RISK-UPGRADE-05

- Title: Harness data has no guaranteed down-migration
- Category: UPGRADE
- Severity: MEDIUM
- KnownFact: architecture is backup + old binary/data restore. Down-migration is explicitly not promised.
- Unknown: none that blocks P0; implementation is P0.5/P7
- Evidence: Master Goal; Data Ownership; P0.5 Backup/Restore
- AffectedRequiredFeature: upgrade recovery
- AffectedArchitectureDecision: no down-migration (accepted)
- AffectedPhase: P0.5
- CanP0Resolve?: policy YES as accepted architecture; implementation NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: YES
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: restore old binary + backup (this is the plan, not a fallback)
- OwnerDecisionRequired?: NO
- FailureImpact: operators expect down-migrate and lose data
- SpikeProof: none — must not be a P0.S Hard Gate
- PassCondition: P0.5/P7 document restore-not-migrate
- FailCondition: product claims down-migration
- CurrentStatus: OPEN_FOR_P05

### C.11 Preview / dependency drift

#### RISK-PREVIEW-01

- Title: Preview public APIs and upgrade-sensitive surfaces may drift across Harness baselines
- Category: PREVIEW_DRIFT
- Severity: MEDIUM
- KnownFact: Connection, Gateway, Client boot graph, Settings capability, JSONL, windows-acl/koffi, Remote/Typert, standard preset composition, SessionEvent map, and native ABI are preview or upgrade-sensitive. Individual packages are not each a separate architecture risk.
- Unknown: next baseline deltas
- Evidence: P0-6 upgrade-sensitive surfaces and PREVIEW_PUBLIC_API class
- AffectedRequiredFeature: any feature using those seams
- AffectedArchitectureDecision: exact pin + compatibility branch
- AffectedPhase: P0.5 (identity), P7 (re-acceptance)
- CanP0Resolve?: classification YES
- RequiresP0SSpike?: NO
- RequiresP05Contract?: YES
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: refuse upgrade
- OwnerDecisionRequired?: NO
- FailureImpact: silent break on Harness bump
- SpikeProof: none
- PassCondition: P0.5 records surface identities; upgrades re-run compatibility
- FailCondition: production depends on preview APIs with no identity
- CurrentStatus: OPEN_FOR_P05

### C.12 P1-only contract residuals

These are not Spike-unknown facts. They are production contracts that P0.S must not freeze.

#### RISK-P1-01

- Title: Formal Worker identity, discovery, and process/authority contract is not frozen
- Category: P1_CONTRACT
- Severity: MEDIUM
- KnownFact: direction is frozen (Worker authority, one per user, Desktop projection). Details wait for P0.S evidence.
- Unknown: exact identity tuple, mutex, discovery, error taxonomy, child ownership, version handshake shape
- Evidence: P1-SYSTEM-CONTRACT.md NOT_DETAILED; this freeze of inputs only
- AffectedRequiredFeature: attach/lifecycle
- AffectedArchitectureDecision: all D1–D7
- AffectedPhase: P1
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO (feasibility is LIFE/TRUST spikes)
- RequiresP05Contract?: YES (version identities exist as P0.5)
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: n/a
- OwnerDecisionRequired?: NO now
- FailureImpact: production implements ad-hoc identity
- SpikeProof: none
- PassCondition: P1 freezes after P0.S PASS
- FailCondition: P1 freeze attempted before P0.S
- CurrentStatus: OPEN_FOR_P1

#### RISK-P1-02

- Title: Carrier Adapter / Renderer isolation / settlement authority production contracts are not frozen
- Category: P1_CONTRACT
- Severity: MEDIUM
- KnownFact: Spike will prove feasibility; P1 freezes production adapter boundaries
- Unknown: exact IPC allowlist, framing, error taxonomy
- Evidence: Security Model; Integration Boundary
- AffectedRequiredFeature: carrier + Client
- AffectedArchitectureDecision: Shaco adapter only
- AffectedPhase: P1
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: NO
- RequiresP1Contract?: YES
- RequiresP7Verification?: NO
- FallbackAvailable?: n/a
- OwnerDecisionRequired?: NO now
- FailureImpact: P2–P4 invent contracts
- SpikeProof: none
- PassCondition: P1 consumes P0.S constraints
- FailCondition: production coding starts from Spike prototypes
- CurrentStatus: OPEN_FOR_P1

### C.13 P7-only production residuals

P0.S proves feasibility only.

#### RISK-P7-01

- Title: Installer, code signing, and AV behavior are unproven in production form
- Category: P7_PRODUCTION
- Severity: MEDIUM
- KnownFact: code signing is explicitly not a P0.S hard gate
- Unknown: Authenticode, SmartScreen, AV quarantine of natives/pipe
- Evidence: P0.S-7; P7 skeleton
- AffectedRequiredFeature: fresh-machine install
- AffectedArchitectureDecision: packaged product
- AffectedPhase: P7, P8
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: n/a
- OwnerDecisionRequired?: NO now
- FailureImpact: install blocked on real machines after Spike VM success
- SpikeProof: none
- PassCondition: P7/P8 evidence on signed installer
- FailCondition: treating Spike unpack as production signing
- CurrentStatus: OPEN_FOR_P7

#### RISK-P7-02

- Title: Production asar unpack, native closure, backup transaction, upgrade, diagnostics, and hardening remain
- Category: P7_PRODUCTION
- Severity: MEDIUM
- KnownFact: P0.S-7 proves a packaged layout can start. Production installer/upgrade/hardening is P7.
- Unknown: production implementation quality
- Evidence: P7 skeleton; P0.5 backup policy
- AffectedRequiredFeature: upgrade/operability
- AffectedArchitectureDecision: ADR-0004
- AffectedPhase: P7
- CanP0Resolve?: NO
- RequiresP0SSpike?: NO
- RequiresP05Contract?: YES (policy already routed)
- RequiresP1Contract?: NO
- RequiresP7Verification?: YES
- FallbackAvailable?: n/a
- OwnerDecisionRequired?: NO now
- FailureImpact: Spike-feasible product fails production operability
- SpikeProof: none
- PassCondition: P7 implements backup/upgrade/diagnostics
- FailCondition: P0.S is asked to productionize installer
- CurrentStatus: OPEN_FOR_P7

### C.14 Accepted risks

#### RISK-ARM64-NOT-V10

- Title: Windows ARM64 is not a V1.0 / P0.S release blocker
- Category: PACKAGING
- Severity: LOW
- KnownFact: Master Goal: ARM64 is not a hard V1.0 gate unless later approved. x64 first.
- Unknown: ARM64 natives (out of V1.0)
- Evidence: Master Goal; P0-6 x64 only
- AffectedRequiredFeature: none for V1.0
- AffectedArchitectureDecision: x64-first
- AffectedPhase: future
- CanP0Resolve?: YES (scope)
- RequiresP0SSpike?: NO
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: NO
- FallbackAvailable?: n/a
- OwnerDecisionRequired?: only to add ARM64 later
- FailureImpact: ARM64 users unsupported in 1.0
- SpikeProof: none
- PassCondition: P0.S/P7 do not fail the product for missing ARM64
- FailCondition: ARM64 treated as P0.S Hard Gate
- CurrentStatus: ACCEPTED_RISK

#### RISK-OPTIONAL-NOT-HARD-GATE

- Title: Optional/deferred product features must not become architecture Hard Gates
- Category: SCOPE
- Severity: LOW
- KnownFact: Jobs, Goal, Workflow, Ralph, Plan, Export UI, Images, Skills, plugin marketplace, Dynamic Cordis product, `list_subagent_models` are not V1.0 Core REQUIRED architecture gates
- Unknown: none for P0
- Evidence: P0-5 matrix
- AffectedRequiredFeature: none
- AffectedArchitectureDecision: limited 1.0 scope (ADR-0005)
- AffectedPhase: P5 / later
- CanP0Resolve?: YES
- RequiresP0SSpike?: NO
- RequiresP05Contract?: NO
- RequiresP1Contract?: NO
- RequiresP7Verification?: NO
- FallbackAvailable?: n/a
- OwnerDecisionRequired?: NO
- FailureImpact: Spike scope explosion
- SpikeProof: none
- PassCondition: those features stay off the Hard Gate list
- FailCondition: Export/Jobs/etc. added as architecture gates
- CurrentStatus: ACCEPTED_RISK

---

## D. Resolved-by-P0 Risks

These are facts P0 already proved. They are not Spike hypotheses. Related Spike rows above test **implementation feasibility**, not these facts.

| RiskId | Title | Severity | CurrentStatus |
|---|---|---|---|
| RISK-FACT-BASELINE | Exact Harness SHA/package/lockfile identity is frozen | LOW | RESOLVED_BY_P0 |
| RISK-FACT-WEB-COMPOSITION | Web = dsh-base + dsh-web-app; not the Shaco Host | LOW | RESOLVED_BY_P0 |
| RISK-FACT-STANDARD-PRESET | Standard composition known; `PRESET_COPY_REQUIRED = NO` | LOW | RESOLVED_BY_P0 |
| RISK-FACT-CLIENT-HOST-CONTRACT | Remotes, streams, `$events`, cancel, resume census complete | LOW | RESOLVED_BY_P0 |
| RISK-FACT-EXACT-FETCH | Exact Fetch routes enumerated; binary ≠ `/export` product | LOW | RESOLVED_BY_P0 |
| RISK-FACT-TRUST-SURFACE | BrowserAuth/loopback/Gateway/cookie facts mapped | LOW | RESOLVED_BY_P0 |
| RISK-FACT-LOOPBACK-CLASSIFIER | `isLoopback` / `ownsHost` classifier located | LOW | RESOLVED_BY_P0 |
| RISK-FACT-CORE-PARITY | REQUIRED/OPTIONAL/DEFERRED/WEB_ONLY frozen | LOW | RESOLVED_BY_P0 |
| RISK-FACT-DEPENDENCY-BOUNDARY | Seam classes + forbidden imports frozen | LOW | RESOLVED_BY_P0 |
| RISK-FACT-NAMED-PIPE-CLASS | Named Pipe is Shaco custom plugin, not Harness seam | LOW | RESOLVED_BY_P0 |
| RISK-FACT-NO-DIRECT-WRITE | `HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES` | LOW | RESOLVED_BY_P0 |
| RISK-FACT-RESUME-HOST-ONLY | ResumeAuthority = Host; Desktop is projection | LOW | RESOLVED_BY_P0 |
| RISK-FACT-BROWSERAUTH-NOT-IDENTITY | Cookie is not Windows user / Worker identity | LOW | RESOLVED_BY_P0 |
| RISK-FACT-NO-LANDLOCK | Landlock is not a Windows gate | LOW | RESOLVED_BY_P0 |
| RISK-FACT-GATEWAY-PREAUTH | Gateway assumes caller already authenticated | LOW | RESOLVED_BY_P0 |
| RISK-FACT-WORKER-ENTRY | Production entry is `dsh --profile`, not `boot()` | LOW | RESOLVED_BY_P0 |
| RISK-FACT-SUBAGENT-MODELS | `list_subagent_models` CONDITIONAL / OPTIONAL | LOW | RESOLVED_BY_P0 |

Resolved-row common fields: CanP0Resolve?=YES; RequiresP0SSpike?=NO; Unknown=none that blocks P0; Evidence=corresponding P0-1..P0-6 files; CurrentStatus=RESOLVED_BY_P0.

---

## E. Open-for-P0.S Risks

HOST-01, HOST-02, HOST-03, CLIENT-01, CLIENT-02, CLIENT-03, CLIENT-04, CARRIER-01, CARRIER-02, CARRIER-03, CARRIER-04, CARRIER-05, TRUST-01, TRUST-02, TRUST-03, TRUST-04, TRUST-05, TRUST-06, SESSION-01, SESSION-02, SESSION-03, SESSION-04, SESSION-05, PICKER-01, CORDIS-01, PKG-01, PKG-02, PKG-03, PKG-04, PKG-05, PKG-06, PKG-07, PKG-08, LIFE-01, LIFE-02, LIFE-03, LIFE-04.

Count: 37.

---

## F. Open-for-P0.5 Risks

UPGRADE-01, UPGRADE-02, UPGRADE-03, UPGRADE-04, UPGRADE-05, PREVIEW-01.

Count: 6.

---

## G. Open-for-P1 Risks

P1-01, P1-02.

Count: 2. Feasibility remains on P0.S rows with `RequiresP1Contract?=YES`.

---

## H. Open-for-P7 Risks

P7-01, P7-02.

Count: 2. Packaging feasibility remains on P0.S PKG/LIFE rows.

---

## I. Core Patch Status

| Field | Value |
|---|---|
| `CORE_PATCH_REQUIREMENT` | `POSSIBLE_REQUIRES_P0S` |
| CurrentKnownPatch | NONE proven required |
| PotentialPatchAreas | Host profile; Connection carrier; Client boot; Client modules; Native packaging / Electron ABI |
| OwnerDecisionNowRequired | NO |
| Allowed P0 PASS? | YES |

Do **not** rewrite to `NONE` or `KNOWN_REQUIRED`. A Layer C stub/adapter is not a Core Patch.

P0.S Hard Gate `P0S_CORE_PATCH_INVENTORY_COMPLETE` must record, separately:

```text
HOST_PROFILE_CORE_PATCH_REQUIRED = YES / NO
CONNECTION_CARRIER_CORE_PATCH_REQUIRED = YES / NO
CLIENT_BOOT_CORE_PATCH_REQUIRED = YES / NO
CLIENT_MODULE_CORE_PATCH_REQUIRED = YES / NO
NATIVE_PACKAGING_CORE_PATCH_REQUIRED = YES / NO
ADAPTER_OR_STUB_USED = YES / NO
```

If `ADAPTER_OR_STUB_USED = YES`, also record: Surface, Why, PublicOrPreviewSeamUsed, ProductionImpact.

If any `*_CORE_PATCH_REQUIRED = YES`, return to Architecture Owner. P0-7 must not and does not change the requirement to NONE.

---

## J. P0.S Hypothesis Matrix

| HypothesisId | Hypothesis | WhyCritical | KnownEvidence | Unknown | MinimalSpike | PassCondition | FailCondition | Fallback | OwnerDecisionIfFailed | ProductionPhaseImpacted |
|---|---|---|---|---|---|---|---|---|---|---|
| H-01 | Worker can run without stock `dsh-web-app` browser-facing HTTP/Web runtime while preserving REQUIRED Host/Gateway/Connection/runtime surfaces via profile/bundle/adapter | Host-only Worker | P0-2/P0-6 three-layer freeze | whether Layer A inject can be satisfied without Layer B | P0.S-1 Host-only profile | see H-01 PASS below | see H-01 FAIL below | Fallback A still Host-only | core patch or Fallback B | P2 |
| H-02 | Shipped standard preset works without copying source and preserves required tools | REQUIRED tools | P0-2/P0-5/P0-6 | no-web mount | P0.S-1 load shipped standard | REQUIRED tools present | tools missing or copy required | none acceptable | contradict P0-6 | P2/P5 |
| H-03 | Harness Client can boot in secure Electron Renderer | Client reuse | P0-3/P0-6 boot seams | secure scheme/graph | P0.S-2 | Client inits, session UI enterable | only stock browser boot | approved loading model in Renderer | Client reuse fails | P4 |
| H-04 | Electron loading model can retain persistent Settings capability | REQUIRED Settings | P0-4 ownsHost canary | custom scheme | P0.S-2 Settings canary | not-memory persistence | memory fallback | capability adapter | Settings architecture | P4 |
| H-05 | Required in-box Client modules can load without stock `/plugins` | Core Client | P0-3/P0-6 | static inclusion | P0.S-6 | modules present | depend on live `/plugins` | static bundle | boot scope | P4 |
| H-06 | Named Pipe carrier can preserve `rpc.call` | unary path | P0-3/P0-6 preview RPC | cross-process map | P0.S-3/4 | unary round-trip authenticated | unary broken | Fallback A | P0.S FAIL if A also fails | P3 |
| H-07 | Replacement carrier preserves Harness streaming contract independently of stock Web mux | streams | P0-3 mux; optional `rpc.open`; `openStream` / `wireStream` | cancel/error/end/concurrency/loss/backpressure | P0.S-4 | streaming contract complete/cancel cleanly on a compatible seam | hang/leak/wrong cancel on every seam | Fallback A | P0.S FAIL if A also fails | P3 |
| H-08 | `$events` / ready / generation survive replacement carrier | projection | P0-3 events | new carrier frames | P0.S-4 | ready/generation/reset/waterfall | lost events | Fallback A | P0.S FAIL if A also fails | P3/P4 |
| H-09 | Approval round-trip survives disconnect/reconnect without duplicate settlement | REQUIRED approval | P0-3 first-result-wins | replacement carrier | P0.S-4/5 negative test | one settlement | double or lost | none | interaction contract | P3/P5 |
| H-10 | User Question round-trip survives disconnect/reconnect without duplicate settlement | REQUIRED question | P0-3/P0-5 | replacement carrier | P0.S-4/5 negative test | one settlement | double or lost | none | interaction contract | P3/P5 |
| H-11 | Explicit cancel works; transport disconnect alone does not cancel Host Agent | Close ≠ cancel | P0-3 cancel census | Shaco mapping | P0.S-4/5 | disconnect keeps Agent; explicit cancel stops | disconnect cancels | none | ADR-0007 | P3/P5 |
| H-12 | Desktop reconnect rebuilds projection without Desktop-owned Agent resume | Host resume only | P0-3/P0-6 | Desktop reconnect impl | P0.S-5 | projection recovery only | Desktop resumes Agent | none | ADR-0003 | P4/P6A |
| H-13 | Binary/exact byte transport works with authentication, cancellation, bounded memory | BINARY_CARRIER | P0-3 exact Fetch | non-HTTP bytes | P0.S-4 real binary path | auth+cancel+bounded | anonymous or unbounded | Fallback A HTTP | mixed trust | P3 |
| H-14 | Local transport authenticates caller before Gateway without BrowserAuth | local trust | P0-4 Gateway preauth | product identity | P0.S-3 | unauth blocked | cookie or no auth | Fallback A must still auth | trust model | P3 |
| H-15 | Renderer cannot directly access Worker transport or reusable Worker credential | Renderer isolation | Security Model | Spike wiring | P0.S-2/3 | no pipe/cred in Renderer | Renderer connects | none | security fail | P4 |
| H-16 | Directory picker or documented Desktop equivalent works on Windows | REQUIRED picker | P0-4/P0-5/P0-6 | Worker vs Main dialog | P0.S-4 | native or Desktop equivalent | no picker | Desktop Main dialog (P1 contract) | workspace UX | P4/P5 |
| H-17 | Closing/crashing Desktop leaves Worker running | D1/D2 | ADR-0007 | real processes | P0.S-5 | Worker alive after close and after crash | Worker dies | Fallback B only with Owner | architecture | P2/P3 |
| H-18 | Second Desktop behavior does not create duplicate Worker/control authority | one Worker | REVIEW-003 | instance policy | P0.S-5 | no second Worker/control | duplicate Host/control | mutex | P1 UX | P4 |
| H-19 | Worker restart while Desktop exists can be detected and re-projected | distinct from Desktop reconnect | P0-3 generation | live detect | P0.S-5 | detect + reproject/invalidate | stale live UI | fail-closed UI | P1 | P4/P6A |
| H-20 | Cordis host/client/UI runner omission does not break Core Client boot | 1.0 without Dynamic Cordis | P0-5/P0-6 | hidden dep | P0.S-6 omit test | Core Client boots | hidden required | include only if proven, still no marketplace | scope | P4/P6B |
| H-21 | Fresh Windows runs packaged product without system Node | Master Goal | P0-1/P0-6 | packaged runtime | P0.S-7 | no system Node | Node required | none | Master Goal fail | P7 |
| H-22 | Fresh Windows runs packaged product without system pnpm | Master Goal | P0-1 | packaged start | P0.S-7 | no pnpm/tsx | pnpm required | none | Master Goal fail | P7 |
| H-23 | A single Worker runtime strategy is proven for native ABI dependencies | natives | P0-6 ABI | sidecar vs Electron | P0.S-7 | one proven strategy | UNRESOLVED or both fail | sidecar recommended | Fallback B if only in-Main works | P2/P7 |
| H-24 | DSH_HOME is product-controlled, writable, per-user and stable | durable universe | P0-6 home-paths | packaged default | P0.S-7 | controlled writable home | wrong/read-only home | fail-closed | data ownership | P2/P0.5 |
| H-25 | Required PowerShell / Windows ACL / native helper paths work packaged | Windows REQUIRED tools | P0-6 native map | asar/unpack/PS path | P0.S-7 | helpers resolve; no Landlock gate; no silent PS bundle | missing runner/rg/pty/ACL | Owner if bundle pwsh proposed | P7 | P2/P7 |
| H-26 | No Harness Core patch is required, or every required patch is explicitly surfaced to Owner; adapter/stub inventoried separately | no silent fork | P0-6 POSSIBLE_REQUIRES_P0S | Spike areas | inventory in P0.S-1/2/3/6/7 | per-area YES/NO + ADAPTER_OR_STUB_USED; NONE or Owner-listed | silent patch or stub labeled as patch | Fallback A/B | Owner mandatory if patch required | all |

Hypothesis classification:

| Id | Class |
|---|---|
| H-01..H-26 | HARD_GATE (architecture-falsifying) |

No core hypothesis deleted. H-01 includes long-running Host. Do **not** read H-01 as “no Cordis service named `webServer` may exist”. Custom-scheme is inside H-03/H-04 as `CUSTOM_SCHEME_OR_APPROVED_LOADING_MODEL`. Payload/backpressure evidence is supporting under H-13/H-07, not a separate optional-feature gate.

### H-01 PASS / PROVEN_WITH_CONSTRAINT / FAIL (AUDIT-004 F-01)

**H-01 PASS** when all of:

1. Worker does not run stock `dsh-web-app` product Web stack.
2. No browser opener.
3. No token URL bootstrap.
4. No client HMR.
5. No LAN/browser-facing product Web host.
6. REQUIRED Host runtime still exists.
7. REQUIRED Gateway / Remote / Connection semantics still exist.
8. If a component requires the Cordis `webServer` **service contract**, it is satisfied by a non-listening / local compatibility service / adapter / stub that: does not expose stock HTTP product surface; does not require Harness Core modification; does not break the security boundary; does not let Renderer access Worker directly; does not secretly restore full `dsh-web-app`.

Item 8, when used, is **`PROVEN_WITH_CONSTRAINT`**, not FAIL. At P0.S closure, Architecture Owner must explicitly accept `PROVEN_WITH_CONSTRAINT`.

**H-01 FAIL** only when REQUIRED runtime / Connection / Client dependency can exist **only** behind stock `dsh-web-app` HTTP/Web runtime **and** cannot be reconstructed via profile, bundle, public/preview seam, adapter, or acceptable compatibility service at reasonable cost, **or** Harness Core must be modified. Then return to Architecture Owner.

### H-07 stream seam (AUDIT-004 F-02)

H-07 is **not** “Named Pipe must implement Client `rpc.open` itself”. Client `rpc.open` is optional. Prove the streaming contract (open, AsyncIterable, item ordering, error, end, cancellation, concurrent streams, connection loss, backpressure) via `rpc.open` **or** `__DSH_TRANSPORT__.openStream` / Host `wireStream` (or frozen-baseline equivalent public/preview path). Gate remains `P0S_STREAM_PASS`. Do not create a product Hard Gate solely for `rpc.open`.

---

## K. P0.S Hard Gates

Frozen, all required `= YES` for `SHACO_FORGE_V1_0_P0S = PASS`. Optional product features are excluded.

| Gate | Maps to | Notes |
|---|---|---|
| `P0S_HOST_PROFILE_FEASIBLE` | H-01 | No dependency on stock browser-facing `dsh-web-app` Web product stack for REQUIRED Worker runtime. **Not** “no Cordis service named `webServer` may exist”. Allowed: `PASS` / `PROVEN_WITH_CONSTRAINT` / `FAIL`. Constraint = Layer C adapter/stub, no Core Patch, no stock public Web stack, no Desktop+Worker architecture change. Owner must accept `PROVEN_WITH_CONSTRAINT` at Spike closure. |
| `P0S_STANDARD_PRESET_TOOLS_PRESENT` | H-02 | Shipped `standard` loads complete and safely; P0-5 REQUIRED tool subset is usable. Does **not** make Jobs/Goal/Workflow/Ralph/Plan/Skills/web tools Product Release Hard Gates. |
| `P0S_ELECTRON_RENDERER_BOOT` | H-03 | nodeIntegration off, contextIsolation on, sandbox on |
| `P0S_CUSTOM_SCHEME_OR_APPROVED_LOADING_MODEL` | H-03 | renamed from `CUSTOM_SCHEME` only; still Electron Renderer |
| `P0S_SETTINGS_PERSISTENCE` | H-04 | not-memory canary |
| `P0S_LOCAL_CARRIER_FEASIBLE` | H-06..H-08 | Named Pipe primary; else approved Fallback A |
| `P0S_LOCAL_TRUST_FEASIBLE` | H-14, H-15 | current-user; cookie ≠ identity; Renderer no pipe |
| `P0S_UNARY_PASS` | H-06 | |
| `P0S_STREAM_PASS` | H-07 | streaming contract; not a `rpc.open`-only gate |
| `P0S_EVENT_GENERATION_PASS` | H-08 | |
| `P0S_APPROVAL_PASS` | H-09 | |
| `P0S_USER_QUESTION_PASS` | H-10 | **added** — P0-5 REQUIRED; was implicit in P0.S-4 |
| `P0S_CANCEL_PASS` | H-11 | |
| `P0S_BINARY_CARRIER_PASS` | H-13 | not `/export` UI |
| `P0S_NATIVE_PICKER_OR_EQUIVALENT_PASS` | H-16 | P1 contracts Desktop equivalent if used |
| `P0S_DESKTOP_CLOSE_WORKER_SURVIVES` | H-17 | |
| `P0S_DESKTOP_CRASH_WORKER_SURVIVES` | H-17 | |
| `P0S_SECOND_DESKTOP_POLICY_PASS` | H-18 | safe behavior, not final UX |
| `P0S_WORKER_RESTART_RECONNECT_PASS` | H-19 | **added** vs prior P0.S list completeness |
| `P0S_NO_DUPLICATE_RESUME` | H-12 | |
| `P0S_NO_APPROVAL_REPLAY` | H-09 | |
| `P0S_NO_QUESTION_REPLAY` | H-10 | **added** |
| `P0S_INBOX_CLIENT_MODULES_PASS` | H-05 | |
| `P0S_CORDIS_OMISSION_PASS` | H-20 | **added** explicit |
| `P0S_NO_SYSTEM_NODE` | H-21 | |
| `P0S_NO_SYSTEM_PNPM` | H-22 | |
| `P0S_PACKAGED_WORKER` | H-21/H-23 | |
| `P0S_PACKAGED_HARNESS` | H-21/H-22 | |
| `P0S_WORKER_RUNTIME_STRATEGY_PROVEN` | H-23 | cannot be UNRESOLVED |
| `P0S_DSH_HOME_CONTROLLED` | H-24 | |
| `P0S_WINDOWS_NATIVE_DEPENDENCIES` | H-25 | windows-acl path, not Landlock |
| `P0S_CORE_PATCH_INVENTORY_COMPLETE` | H-26 | per-area YES/NO + `ADAPTER_OR_STUB_USED`; adapter/stub ≠ Core Patch |

Retained supporting security checks inside the gates above: `NODE_INTEGRATION_REQUIRED = NO`, `CURRENT_USER_ONLY`, `COOKIE_NOT_PRODUCT_IDENTITY`, `RENDERER_DIRECT_PIPE_ACCESS = NO`, `HOST_LONG_RUNNING`.

### Hard-gate corrections vs prior P0.S contract

| Change | Why | Source evidence | Affected gate | Architecture change? |
|---|---|---|---|---|
| Rename `CUSTOM_SCHEME` → `P0S_CUSTOM_SCHEME_OR_APPROVED_LOADING_MODEL` | P0-6 showed public/preview boot seams; scheme is a candidate, not the only allowed loading model | P0-6 Client boot adapter | P0.S-2 | NO — still Electron Renderer |
| Add `P0S_USER_QUESTION_PASS` and `P0S_NO_QUESTION_REPLAY` | P0-5 classified User Question REQUIRED | P0-5; P0-3 question census | P0.S-4/5 | NO |
| Add `P0S_WORKER_RESTART_RECONNECT_PASS` | already in P0.S-5 prose; freeze as named gate | P0.S-5; P0-3 generation | P0.S-5 | NO |
| Add `P0S_CORDIS_OMISSION_PASS` | P0-5/P0-6 split runners vs tool-cordis | P0-5; P0-6 | P0.S-6 | NO |
| Keep `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` | cannot set NONE without Spike; cannot set KNOWN_REQUIRED from Layer A inject | P0-6 | P0.S-8 | NO |
| H-01 three-layer webServer wording | AUDIT-004 F-01; stub/adapter = `PROVEN_WITH_CONSTRAINT` | P0-6 | P0.S-1 | NO |
| H-07 stream seam wording | AUDIT-004 F-02; `rpc.open` not sole path | P0-3/P0-6 | P0.S-4 | NO |

No correction changes Desktop + Worker dual-core architecture. `ARCHITECTURE_OWNER_DECISION_REQUIRED = NO`.

---

## L. Supporting / Deferred Spikes

### SUPPORTING_SPIKE

- Payload/framing/peak-memory capture for P1 limits (under H-07/H-13; not a separate architecture gate)
- Concurrent stream stress beyond the pass/fail stream gate
- PowerShell 5.1 vs 7 path matrix on Windows 11 (supports H-25; no auto-bundle)
- asar unpack path inventory listing (supports H-25)
- Settings not-memory canary details (already inside H-04)

### DEFERRED_TO_P1

- Formal Worker logical identity vs process instance
- Desktop single-instance UX details
- Close / Stop / Exit full production freeze
- Carrier Adapter production boundary and error taxonomy
- Renderer IPC allowlist freeze
- Directory picker production contract if Desktop equivalent is chosen
- Child process ownership
- Version handshake production shape (consumes P0.5 identities)

### DEFERRED_TO_P5

- OPTIONAL: Jobs, Goal, Workflow, Ralph, Plan, Export UI, Images, Skills, web tools
- CONDITIONAL `list_subagent_models`
- Full REQUIRED feature UX completeness beyond architecture spikes

### DEFERRED_TO_P7

- Installer packaging production
- Code signing / SmartScreen
- AV behavior
- Production asar/native closure beyond Spike feasibility
- Backup transaction implementation
- Upgrade implementation
- Fresh-machine acceptance (also P8)
- Runtime diagnostics / production hardening

`DEFERRED_TO_P0.5` is policy freeze, not a Spike class: UPGRADE-* and PREVIEW-01.

---

## M. Failure Branch / Fallback

Primary:

```text
Electron Renderer
  → Preload / Electron IPC
  → Electron Main
  → Named Pipe (SHACO_CUSTOM_CARRIER_PLUGIN, not a Harness official seam)
  → Worker Harness Host (`dsh --profile`)
```

If P0.S proves pure Named Pipe carrier is infeasible, needs unacceptable Core Patch, or cannot reliably support unary / stream / events / binary / trust:

`SHACO_FORGE_V1_0_P0S = FAIL` and return to Architecture Owner, unless Fallback A is proven in the same Spike closure with the same Hard Gates.

**Fallback A:** Desktop → Electron Main → private loopback HTTP → Worker Harness Host.

Requirements:

- still Desktop + Worker dual-core processes
- bind loopback only; not LAN
- Desktop is the product's only Client
- must re-satisfy local identity/trust
- BrowserAuth may be an upstream mechanism reference, and must not default to product identity

Internal variants of A (different loopback ports, HTTP/2, etc.) remain A. No third primary fallback.

**Fallback B:** Harness Host enters Electron Main.

This breaks Close Window ≠ Worker stop (ADR-0001 / ADR-0007). Allowed only if Architecture Owner explicitly re-approves D1/D2.

`ThirdFallbackRequired = NO`

---

## N. P0.5 Inputs

Frozen inputs only. This step does not design the P0.5 Contract.

Must be consumed by P0.5:

- ProductVersion
- DesktopVersion
- WorkerVersion
- CarrierVersion
- HarnessBaselineVersion (must include package version `0.1.2-alpha.1` + exact SHA `cd5ef8148158c3a752a658978873241fdf8e2bbc`)
- ControlStoreSchemaVersion
- Lockfile identity `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`
- Node runtime pin (from proven `WORKER_RUNTIME_STRATEGY`; engines `^22.19.0 || >=24.0.0`)
- DSH_HOME identity
- Carrier major compatibility
- Remote/Typert surface identity
- Session format identity (`SESSION_FORMAT_VERSION = 0`)
- Credentials storage domain version (v1)
- Workspace format (v2)
- projcache (v4)
- Host profile / shipped `standard` preset compatibility expectations
- Fail-closed before Agent write
- Backup/restore (full DSH_HOME durable + Control Store; current-user ACL)
- No Harness down-migration
- Disk full / backup fail / upgrade crash → no INSTALL
- Preview-API / upgrade-sensitive surface list from P0-6 (Connection, Gateway, Client boot, Settings capability, JSONL, windows-acl/koffi, Remote/Typert, standard composition, SessionEvent map, native ABI)

---

## O. P1 Inputs

Frozen inputs only. This step does not freeze P1 implementation.

- Worker = Runtime Authority
- Desktop = Projection
- one Worker per Windows user
- Worker logical identity vs process instance
- Desktop single-instance policy (safe behavior proven in P0.S; UX in P1)
- Worker discovery
- Close / Stop / Exit (ADR-0007)
- Carrier Adapter boundary (`SHACO_CUSTOM_CARRIER_PLUGIN` or approved Fallback A)
- Renderer isolation (no pipe, no reusable Worker credential)
- local trust requirement (not BrowserAuth)
- Harness data ownership
- Control Store ownership
- Session resume authority = Host
- Approval/question settlement authority = Host
- child process ownership = Worker
- error taxonomy requirement
- version handshake boundary (after P0.5)
- P0.S constraints and proven `WORKER_RUNTIME_STRATEGY`
- picker: native or documented Desktop equivalent
- `CORE_PATCH` inventory result

---

## P. P7 Inputs

- installer packaging
- code signing
- AV behavior
- asar unpack production
- native dependency closure
- backup transaction implementation
- upgrade implementation
- fresh-machine acceptance
- runtime diagnostics
- production hardening
- Windows 11 host PowerShell expectation (no silent bundle unless later Owner decision)
- x64-first; ARM64 not V1.0 blocker

P0.S only proves feasibility of packaged Worker/Harness/natives/DSH_HOME.

---

## Q. P0 Closure Blocker Check

| Check | Result |
|---|---|
| P0-1 baseline facts closed? | YES |
| P0-2 Web/standard composition closed? | YES |
| P0-3 Client↔Host contract closed? | YES |
| P0-4 Trust surface closed? | YES |
| P0-5 Feature scope closed? | YES |
| P0-6 Dependency boundary closed? | YES |
| P0-7 Risk / Spike input closed? | YES |
| Unknown that must be known **before** Spike starts? | NONE |
| Unknown that only Spike can prove? | OPEN_FOR_P0S (normal; not P0 FAIL) |
| Evidence contradictions? | NONE |

`P0_BLOCKER = NONE`

---

## R. Final P0 Gates

| Gate | Value |
|---|---|
| P0_BASELINE_FROZEN | YES |
| P0_WEB_COMPOSITION_KNOWN | YES |
| P0_STANDARD_PRESET_KNOWN | YES |
| P0_CLIENT_HOST_CONTRACT_KNOWN | YES |
| P0_EXACT_FETCH_ROUTES_ENUMERATED | YES |
| P0_TRUST_SURFACE_KNOWN | YES |
| P0_LOOPBACK_CLASSIFIER_LOCATED | YES |
| P0_CORE_PARITY_SCOPE_FROZEN | YES |
| P0_DEPENDENCY_BOUNDARY_FROZEN | YES |
| P0_UPSTREAM_RISK_REGISTER_FROZEN | YES |
| P0S_HYPOTHESIS_MATRIX_FROZEN | YES |
| P0S_HARD_GATES_FROZEN | YES |
| P0S_FAILURE_BRANCH_FROZEN | YES |
| P05_INPUTS_FROZEN | YES |
| P1_INPUTS_FROZEN | YES |
| P7_INPUTS_RECORDED | YES |
| P0S_SPIKE_INPUT_FROZEN | YES |
| P0_EVIDENCE_CONTRADICTIONS | NONE |

All YES / NONE ⇒ `SHACO_FORGE_V1_0_P0 = PASS`, `P0 = CLOSED`, `P0.S = NOT_STARTED`.

P0 PASS does not authorize BEGIN P0.S. After AUDIT-004 F-01/F-02/F-03 wording corrections, required next step: **INDEPENDENT P0 CLOSURE CORRECTIVE REVIEW**. `P0_CLOSURE_AUDIT` remains Owner/Reviewer-owned and is **not** set to PASS by this Executor.

---

## S. Evidence

| Item | Value |
|---|---|
| SourceChecksPerformed | Baseline reverify only (`rev-parse`, porcelain, lockfile SHA256). No P0-2..P0-6 re-investigation. No targeted source verification (no evidence contradiction). |
| Harness mutated | NO |
| Spike started | NO |
| Production code | NO |
| DocumentsChanged | listed in the P0-7 git commit |

Authority files read: README, MANIFEST, Document Map/Rules/Current State, Product Vision/Roadmap/Master Goal, System Architecture, Desktop-Worker Boundary, Harness Integration Boundary, Data Ownership, Security Model, Development Map, P0-UPSTREAM-BASELINE, P0S-FEASIBILITY-SPIKE, P05-COMPATIBILITY-VERSION, P1/P7 skeletons, P0-1..P0-6 evidence, CURRENT-CHECKPOINT, CONTEXT-HANDOVER, DEVELOPMENT-LOG, REVIEW-003 summary, ADR titles via Manifest.

---

## T. Final Verdict

`P0_7_STATUS = PASS`

`SHACO_FORGE_V1_0_P0_7 = PASS`

`SHACO_FORGE_V1_0_P0 = PASS`

`P0_STATE = CLOSED`

`SHACO_FORGE_V1_0_P0S = NOT_STARTED`

`P0_CLOSURE_AUDIT = PENDING_CORRECTIVE_REVIEW` (AUDIT-004 `PASS_WITH_REQUIRED_CORRECTIONS`; F-01/F-02/F-03 wording applied by Executor; Independent Reviewer re-verify required)

`ALLOW_P0S = NO`

### P0-7 acceptance gates

| Gate | Value |
|---|---|
| FROZEN_BASELINE_REVERIFIED | YES |
| UPSTREAM_WORKTREE_CLEAN_BEFORE | YES |
| UPSTREAM_WORKTREE_CLEAN_AFTER | YES |
| MASTER_RISK_REGISTER_WRITTEN | YES |
| ALL_REQUIRED_RISK_FAMILIES_REVIEWED | YES |
| RESOLVED_P0_RISKS_IDENTIFIED | YES (17) |
| P0S_RISKS_IDENTIFIED | YES (37) |
| P05_RISKS_ROUTED | YES (6) |
| P1_RISKS_ROUTED | YES (2 + RequiresP1Contract flags) |
| P7_RISKS_ROUTED | YES (2 + RequiresP7Verification flags) |
| CORE_PATCH_STATUS_FROZEN | YES (`POSSIBLE_REQUIRES_P0S`) |
| P0S_HYPOTHESIS_MATRIX_WRITTEN | YES (H-01..H-26) |
| P0S_HARD_GATES_FROZEN | YES |
| P0S_OPTIONAL_DEFERRED_SEPARATED | YES |
| P0S_FAILURE_BRANCH_FROZEN | YES |
| P05_INPUTS_FROZEN | YES |
| P1_INPUTS_FROZEN | YES |
| P7_INPUTS_RECORDED | YES |
| P0_CLOSURE_BLOCKER_CHECK_COMPLETE | YES |
| P0_EVIDENCE_CONTRADICTIONS | NONE |
| P0_7_EVIDENCE_WRITTEN | YES |
| CURRENT_STATE_UPDATED | YES |
| DEVELOPMENT_LOG_UPDATED | YES |
| P0_7_STATUS_UPDATED | YES |

### Risk counts

| Bucket | Count |
|---|---|
| TotalRisks | 66 |
| BLOCKER | 0 |
| HIGH | 34 |
| MEDIUM | 13 |
| LOW | 19 |
| RESOLVED_BY_P0 | 17 |
| OPEN_FOR_P0S | 37 |
| OPEN_FOR_P05 | 6 |
| OPEN_FOR_P1 | 2 |
| OPEN_FOR_P7 | 2 |
| ACCEPTED_RISK | 2 |

HIGH split: 32 OPEN_FOR_P0S + 2 OPEN_FOR_P05 (`RISK-UPGRADE-02`, `RISK-UPGRADE-03`). LOW = 17 `RESOLVED_BY_P0` + 2 `ACCEPTED_RISK`.
