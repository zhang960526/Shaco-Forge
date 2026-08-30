# P0 — Upstream Baseline & Product Capability Audit

Status: CLOSED / PASS
P0-1: CLOSED / PASS
P0-2: CLOSED / PASS
P0-3: CLOSED / PASS
P0-4: CLOSED / PASS
P0-5: CLOSED / PASS
P0-6: CLOSED / PASS
P0-7: CLOSED / PASS
`P0_BASELINE_FROZEN = YES`
`P0_WEB_COMPOSITION_KNOWN = YES`
`P0_STANDARD_PRESET_KNOWN = YES`
`P0_CLIENT_HOST_CONTRACT_KNOWN = YES`
`P0_EXACT_FETCH_ROUTES_ENUMERATED = YES`
`P0_TRUST_SURFACE_KNOWN = YES`
`P0_LOOPBACK_CLASSIFIER_LOCATED = YES`
`P0_CORE_PARITY_SCOPE_FROZEN = YES`
`P0_DEPENDENCY_BOUNDARY_FROZEN = YES`
`P0_UPSTREAM_RISK_REGISTER_FROZEN = YES`
`P0S_HYPOTHESIS_MATRIX_FROZEN = YES`
`P0S_HARD_GATES_FROZEN = YES`
`P0S_FAILURE_BRANCH_FROZEN = YES`
`P05_INPUTS_FROZEN = YES`
`P1_INPUTS_FROZEN = YES`
`P7_INPUTS_RECORDED = YES`
`P0S_SPIKE_INPUT_FROZEN = YES`
`P0_EVIDENCE_CONTRADICTIONS = NONE`
`SHACO_FORGE_V1_0_P0 = PASS`
`P0_STATE = CLOSED`
`SHACO_FORGE_V1_0_P0S = NOT_STARTED`

## Goal

Freeze the exact upstream facts Shaco Forge 1.0 depends on before any product implementation.

## Execution Rule

P0 may use a pinned Harness worktree and perform install/build/dump/test needed for discovery **without mutating the pinned baseline**.

Allowed examples:

- `pnpm install --frozen-lockfile` or equivalent pinned install
- build required to run diagnostics
- dump config / list profile composition
- git/package/version queries
- read/search/test discovery

Forbidden:

- `git pull master`
- dependency upgrades
- lockfile mutation
- Harness source patch
- production Shaco implementation

## Frozen Baseline (P0-1 PASS)

Exact identity is recorded in:

`docs/06-testing-acceptance/evidence/P0-1-HARNESS-BASELINE-MANIFEST.md`

Summary:

- Repository: `https://github.com/deepseek-ai/deepseek-harness.git`
- Branch: `master`
- Commit: `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- CommitDate: `2026-08-28T00:57:43+08:00`
- Release: `dsh-v0.1.2-alpha.1`
- PackageVersion: `0.1.2-alpha.1`
- Worktree: `D:\Project\Shaco-Forge-Upstream\deepseek-harness`
- Distribution: `git-worktree`
- `CHANGED_SINCE_PREVIOUS_AUDIT = NO`

This exact baseline is now the official Shaco Forge V1.0 upstream pin for P0 through P8. Subsequent P0 steps may install/build inside this worktree only with frozen lockfile and must leave source + lockfile unmodified.

## P0-1 — Upstream Baseline Freeze

Status: CLOSED / PASS
Gate: `P0_BASELINE_FROZEN = YES`

Recorded:

- repository / branch / exact SHA / commit date / release
- dsh package version
- Node / pnpm / TypeScript
- `pnpm-lock.yaml` content hash
- Harness distribution form: `git-worktree`
- Windows version + CPU arch
- clean worktree state

P0-2 was not started by this step.

## P0-2 — Web + Standard Preset Composition Census

Status: CLOSED / PASS
Gates: `P0_WEB_COMPOSITION_KNOWN = YES`, `P0_STANDARD_PRESET_KNOWN = YES`

Evidence:

- `docs/06-testing-acceptance/evidence/P0-2-WEB-AND-STANDARD-COMPOSITION-MAP.md`
- `docs/06-testing-acceptance/evidence/P0-2-WEB-DUMP-DEFAULT-CONFIG.yml` (diagnostic only)

Summary:

- Web profile = `dsh-base` + `dsh-web-app`; `patchReload: live`.
- Host plane disables agent tools; `standard` remounts them per session (except `tool-str-replace-editor`).
- Default session persistence = JSONL; SQLite persistence package is not in the web tree.
- Windows shell = standard `tool-pwsh`; sandbox = `sandbox-windows-acl` via `sandbox-local`.

Must separately enumerate:

1. Host/Web profile composition
2. `standard` agent preset composition (tools/commands/subagent surface)

Classify each row:

- CORE_HOST
- DESKTOP_CLIENT
- WEB_TRANSPORT_ONLY
- OPTIONAL_PRODUCT_CAPABILITY
- DEFER_OR_REMOVE
- EXPERIMENTAL
- UNKNOWN_REQUIRES_SPIKE

Do not treat `dump-config` as the only authority; preserve/compare source YAML and preset definitions.

Gate:

- `P0_WEB_COMPOSITION_KNOWN = YES`
- `P0_STANDARD_PRESET_KNOWN = YES`

## P0-3 — Client↔Host Contract Census

Status: CLOSED / PASS
Gates: `P0_CLIENT_HOST_CONTRACT_KNOWN = YES`,
`P0_EXACT_FETCH_ROUTES_ENUMERATED = YES`

Evidence:

`docs/06-testing-acceptance/evidence/P0-3-CLIENT-HOST-CONTRACT-MAP.md`

Frozen-source result:

- Client business chain is Client adapter → Connection abstraction → generated
  Typert Remote → API Gateway → Host controller/Cordis service.
- Current Client assembly exposes 16 Remote namespaces, 71 unary endpoints,
  three domain streams, and an internal `$events` generation/event channel.
- Current Web transport uses JSON `/api`, WebSocket Remote mux, one binary ZIP
  Fetch route, dynamic `/plugins` module bytes, HMR SSE, and index boot
  injections. These are transport implementation, not the business API itself.
- Connection reconnect is separate from session resume. Host-side session
  resolution owns cold agent resume; no Client `session/resume` Remote exists.
- Client turn cancellation is explicit. Transport disconnect aborts stream
  pumps but does not invoke session/agent cancellation.
- Approval and user question are pending Remote waterfalls; first answer wins
  and an unsettled event is re-delivered across Connection generations.

Enumerate from current source/generated remotes/routes/tests:

- unary Remote surface
- stream surface / `rpc.open` / mux behavior
- events / generation / reconnect
- cancellation
- exact Fetch/binary routes
- uploads/body buffering
- boot graph (`window.__DSH_BOOT__`)
- directory picker capability

Do not guess package paths.

Gate:

- `P0_CLIENT_HOST_CONTRACT_KNOWN = YES`
- `P0_EXACT_FETCH_ROUTES_ENUMERATED = YES`

## P0-4 — Authentication / Trust Surface

Status: CLOSED / PASS
Gates: `P0_TRUST_SURFACE_KNOWN = YES`,
`P0_LOOPBACK_CLASSIFIER_LOCATED = YES`

Evidence:

`docs/06-testing-acceptance/evidence/P0-4-AUTHENTICATION-AND-TRUST-SURFACE.md`

Frozen-source result:

- `dsh web` trust is layered: loopback default bind, process launch-token
  bootstrap, authority-bound signed browser cookie, Host/Origin/Fetch-Metadata
  fence, then authenticated API/mux dispatch.
- BrowserAuth proves launch-token/cookie possession for a Harness-home signing
  secret and authority. It does not prove Windows user or current Host process
  identity.
- `isLoopbackHostname` is in
  `packages/client/connection/src/loopback-hostname.ts`. Its Client-derived
  `connection.isLoopback` selects Host-backed versus unavailable/memory
  settings behavior.
- Gateway and Host controllers assume an already-authenticated Connection.
  Alternate `rpc.call/open` and direct Fetch/stream seams carry no caller
  identity; the composing transport owns authentication.
- Exact export inherits `/api` authentication. Index is authenticated, while
  non-index static assets, plugin combo/source-map bytes and HMR SSE are
  public code/data routes.
- Settings/credential/directory-picker controllers contain no per-caller
  loopback authorization. The stock non-loopback Settings UI suppression is a
  Client capability boundary, not a Host ACL.

Audited actual source for:

- launch token / cookie / Host / Origin checks
- loopback classification (including actual symbol/file location)
- settings persistence fallback behavior
- trusted-host / BrowserAuth assumptions
- what breaks if WebServer is removed

Gate:

- `P0_TRUST_SURFACE_KNOWN = YES`
- `P0_LOOPBACK_CLASSIFIER_LOCATED = YES`

## P0-5 — Core Feature Parity Matrix

Status: CLOSED / PASS

Evidence:

`docs/06-testing-acceptance/evidence/P0-5-CORE-FEATURE-PARITY-MATRIX.md`

Frozen product-scope result:

- REQUIRED is limited to the complete Desktop→Workspace→Session→Agent
  loop: DeepSeek credential/model, persistent workspace/session, text stream,
  PowerShell/fs/search tools, all shipped permission choices, approval,
  structured user questions, required Settings persistence and core in-process
  continuable subagent control.
- Desktop close/crash survival, truthful reconnect, Host-owned cold resume,
  explicit cancel and transport-disconnect independence are REQUIRED product
  behaviors.
- Images/attachments, Export, Plan, Compaction, Jobs, Skills, web tools,
  session fork, trajectory and other enhancements do not block V1.0.
- Harness Goal/Workflow/Ralph/Schedule are not the Shaco Automation domain.
  External Codex/Claude/ACP/SDK children are deferred to the V1.2 direction.
- Browser WebServer/token/cookie/trusted-host/HMR/SPA delivery is WEB_ONLY.
  Required Client/Connection behavior receives a Desktop replacement and P0.S
  proof rather than reproducing a LAN/browser product.
- Official in-box components form the V1.0 plugin baseline. Dynamic Cordis and
  arbitrary npm/GitHub/marketplace installation are not V1.0 product scope.
- OPTIONAL Export does not weaken the REQUIRED binary carrier proof.

No vague labels. Every feature must include:

- user behavior
- upstream package/preset
- Web enabled?
- runtime/client dependency
- browser transport dependency
- Desktop adaptation
- classification
- acceptance need

Classification:

- REQUIRED
- OPTIONAL
- DEFERRED
- WEB_ONLY
- EXPERIMENTAL
- NOT_PRODUCT

The matrix replaces the prior candidate with exact product classifications,
concrete command names and standard-preset tool/subagent decisions.

Gate: `P0_CORE_PARITY_SCOPE_FROZEN = YES`

## P0-6 — Dependency & Stability Matrix

Status: CLOSED / PASS
Gate: `P0_DEPENDENCY_BOUNDARY_FROZEN = YES`

Evidence:

`docs/06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md`

Frozen-source result:

- Formal product dependencies are `dsh --profile` composition, `dsh-base` + a Shaco bundle, generated `./remote`/`./typert`, shipped `standard` load, and required in-box tool/UI package names.
- Connection/Gateway/Client boot/`$events`/settings-capability/native FFI are `PREVIEW_PUBLIC_API` and require Shaco adapters plus compatibility tests.
- Named Pipe is not a Harness extension seam. It remains a Shaco-owned carrier candidate.
- Worker entry is spawn `dsh`; in-process `boot()` is forbidden as a production main.
- `PRESET_COPY_REQUIRED = NO`. `HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES`.
- `list_subagent_models` stays CONDITIONAL / OPTIONAL.
- `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S` because official Connection/modules plugins inject `webServer`.

Classify seams:

- DOCUMENTED_PRODUCT_SEAM
- DOCUMENTED_EXTENSION_SEAM
- PREVIEW_PUBLIC_API
- SUPPORT_API
- INTERNAL
- FORBIDDEN

Explicitly produce a `FORBIDDEN_IMPORT_LIST`.

Generated documented `remote` / `typert` surfaces are not automatically forbidden; arbitrary `packages/**/src` deep imports are.

Gate: `P0_DEPENDENCY_BOUNDARY_FROZEN = YES`

## P0-7 — Risk Register & P0.S Input Freeze

Status: CLOSED / PASS
Gates: `P0_UPSTREAM_RISK_REGISTER_FROZEN = YES`, `P0S_HYPOTHESIS_MATRIX_FROZEN = YES`, `P0S_HARD_GATES_FROZEN = YES`, `P0S_FAILURE_BRANCH_FROZEN = YES`, `P05_INPUTS_FROZEN = YES`, `P1_INPUTS_FROZEN = YES`, `P7_INPUTS_RECORDED = YES`, `P0S_SPIKE_INPUT_FROZEN = YES`

Evidence:

`docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`

Frozen-source result:

- Master Upstream Risk Register written. No P0 BLOCKER. Remaining architecture unknowns are `OPEN_FOR_P0S` (or correctly routed to P0.5 / P1 / P7).
- `CORE_PATCH_REQUIREMENT` remains `POSSIBLE_REQUIRES_P0S`. P0-7 did not rewrite it to NONE.
- P0.S Hypothesis Matrix H-01..H-26 and Hard Gates frozen. Optional product features are not architecture Hard Gates.
- Failure branch frozen: Named Pipe primary; Fallback A private loopback HTTP; Fallback B Host-in-Main only with Owner re-approval of D1/D2. No third primary fallback.
- `P0_EVIDENCE_CONTRADICTIONS = NONE`.
- P0 PASS does not authorize BEGIN P0.S. Next step is Independent P0 Closure Audit.

Gate: `P0S_SPIKE_INPUT_FROZEN = YES`

## Final Gate

P0 passes only if all of the following are YES. Current values after P0-7:

- P0_BASELINE_FROZEN = YES
- P0_WEB_COMPOSITION_KNOWN = YES
- P0_STANDARD_PRESET_KNOWN = YES
- P0_CLIENT_HOST_CONTRACT_KNOWN = YES
- P0_EXACT_FETCH_ROUTES_ENUMERATED = YES
- P0_TRUST_SURFACE_KNOWN = YES
- P0_LOOPBACK_CLASSIFIER_LOCATED = YES
- P0_CORE_PARITY_SCOPE_FROZEN = YES
- P0_DEPENDENCY_BOUNDARY_FROZEN = YES
- P0_UPSTREAM_RISK_REGISTER_FROZEN = YES
- P0S_HYPOTHESIS_MATRIX_FROZEN = YES
- P0S_HARD_GATES_FROZEN = YES
- P0S_FAILURE_BRANCH_FROZEN = YES
- P05_INPUTS_FROZEN = YES
- P1_INPUTS_FROZEN = YES
- P7_INPUTS_RECORDED = YES
- P0S_SPIKE_INPUT_FROZEN = YES
- P0_EVIDENCE_CONTRADICTIONS = NONE

Therefore `SHACO_FORGE_V1_0_P0 = PASS`, `P0_STATE = CLOSED`, `SHACO_FORGE_V1_0_P0S = NOT_STARTED`.
