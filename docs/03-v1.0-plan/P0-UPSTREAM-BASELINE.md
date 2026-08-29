# P0 — Upstream Baseline & Product Capability Audit

Status: IN_PROGRESS
P0-1: CLOSED / PASS
P0-2: CLOSED / PASS
P0-3: CLOSED / PASS
P0-4 through P0-7: NOT_STARTED
`P0_BASELINE_FROZEN = YES`
`P0_WEB_COMPOSITION_KNOWN = YES`
`P0_STANDARD_PRESET_KNOWN = YES`
`P0_CLIENT_HOST_CONTRACT_KNOWN = YES`
`P0_EXACT_FETCH_ROUTES_ENUMERATED = YES`
`SHACO_FORGE_V1_0_P0 = NOT_PASS`

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

Locate actual source for:

- launch token / cookie / Host / Origin checks
- loopback classification (including actual symbol/file location)
- settings persistence fallback behavior
- trusted-host / BrowserAuth assumptions
- what breaks if WebServer is removed

Gate:

- `P0_TRUST_SURFACE_KNOWN = YES`
- `P0_LOOPBACK_CLASSIFIER_LOCATED = YES`

## P0-5 — Core Feature Parity Matrix

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

Current candidate REQUIRED baseline must be replaced by actual P0 findings, especially real command names and standard-preset tools/subagent composition.

Gate: `P0_CORE_PARITY_SCOPE_FROZEN = YES`

## P0-6 — Dependency & Stability Matrix

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

Every risk must include:

- ID / severity / evidence
- affected phase
- falsifiable spike hypothesis
- acceptance
- fallback
- Owner decision required?

Must include at least carrier, boot graph, no-cookie trust, exact Fetch, in-box modules, Dynamic Cordis dependency, packaging/runtime ABI, DSH_HOME, Windows sandbox/native differences, settings loopback behavior, host FetchHandler and standard preset risks.

Gate: `P0S_SPIKE_INPUT_FROZEN = YES`

## Final Gate

P0 passes only if all of the following are YES. Current values after P0-3:

- P0_BASELINE_FROZEN = YES
- P0_WEB_COMPOSITION_KNOWN = YES
- P0_STANDARD_PRESET_KNOWN = YES
- P0_CLIENT_HOST_CONTRACT_KNOWN = YES
- P0_EXACT_FETCH_ROUTES_ENUMERATED = YES
- P0_TRUST_SURFACE_KNOWN = NO
- P0_LOOPBACK_CLASSIFIER_LOCATED = NO
- P0_CORE_PARITY_SCOPE_FROZEN = NO
- P0_DEPENDENCY_BOUNDARY_FROZEN = NO
- P0S_SPIKE_INPUT_FROZEN = NO

Therefore `SHACO_FORGE_V1_0_P0 = NOT_PASS`.
