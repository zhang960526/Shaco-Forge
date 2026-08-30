# Shaco Forge Development Log

Status: ACTIVE

## 2026-08-30

- P0.S-1 formal closure completed as a documentation/governance action only.
  The authoritative chronology is:

  1. Executor returned `P0S1_EXECUTOR_VERDICT = PROVEN_WITH_CONSTRAINT` with a
     non-listening Layer C adapter, `HOST_PROFILE_CORE_PATCH_REQUIRED = NO` and
     `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`.
  2. External Independent Review AUDIT-005 returned
     `PASS_WITH_REQUIRED_CORRECTIONS` and recommended
     `ACCEPT_PROVEN_WITH_CONSTRAINT`; its supplied result reports successful
     independent reproduction and no Reviewer file mutation.
  3. Architecture Owner accepted the non-listening Layer C constraint and
     `ACCEPT_PROVEN_WITH_CONSTRAINT` technical disposition.
  4. CORRECTIVE-005 applied documentation-only F-01/F-02/F-03: surface-census
     reconciliation, unary-only boundary, and runner/environment prerequisites.
  5. External Corrective Re-Review AUDIT-005B returned `PASS`; F-01/F-02/F-03
     were closed, `P0S1_CAN_CLOSE = YES`, and
     `FINAL_RECOMMENDATION = OWNER_MAY_CLOSE_P0S1`.
  6. F-REV-01's LOW SHA256 transcription error was corrected in the Evidence;
     the protected `profile/package.json` file itself remained unchanged.
  7. `SHACO_FORGE_V1_0_P0S_1 = PASS`; `P0S1_STATE = CLOSED`; feasibility
     remains `P0S_HOST_PROFILE_FEASIBLE = PROVEN_WITH_CONSTRAINT`.
  8. P0.S remains `IN_PROGRESS`; P0.S-2 remains `NOT_STARTED`; P0.5 and P1
     freeze remain disallowed. Full event/stream/settlement/cancel/
     connection-loss/backpressure proof remains P0.S-4, while Win32 87 and
     packaged no-system-Node/no-system-pnpm proof remain P0.S-7 inputs.
  The F-REV-01 correction did not change the prototype, technical result or
  gate. No Spike code/config or Frozen Harness file was changed, the Spike was
  not rerun, and P0.S-2 was not started. Review chain: AUDIT-005,
  CORRECTIVE-005, AUDIT-005B.

- P0.S-1 Host Profile Feasibility Executor completed against Shaco Forge
  `ae9080a3e4efdf0cb7075e0a46090532941e2409` and frozen Harness
  `cd5ef8148158c3a752a658978873241fdf8e2bbc` / `0.1.2-alpha.1`.
  Official built `dsh --profile shaco-host` equivalent ran twice for 20s/10s,
  remained alive, exposed no listener or browser child, disposed gracefully and
  exited 0. `dsh-base` + Shaco bundle retained Host/Gateway/Typert/Connection;
  9 generated Host packages and 58 invocations loaded; Gateway
  `agentPresets/list` returned shipped `standard`. All P0-5 REQUIRED tool
  identities were present and bounded probes completed. No Harness source or
  lock mutation. A non-listening Layer C compatibility adapter was required,
  so Executor verdict is `PROVEN_WITH_CONSTRAINT`,
  `HOST_PROFILE_CORE_PATCH_REQUIRED = NO`, `ADAPTER_OR_STUB_USED = YES`,
  `P0S_CORE_PATCH_INVENTORY_COMPLETE = NO`; at that point the result was
  pending independent Review. P0.S remained `IN_PROGRESS`; P0.S-2 had not
  started. Evidence:
  `docs/06-testing-acceptance/evidence/P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md`.

- Independent P0 Closure Corrective Re-Review (AUDIT-004B): PASS. F-01 / F-02 /
  F-03 CLOSED. F-04 / F-05 CLOSED. No corrective regression. Harness HEAD
  `cd5ef8148158c3a752a658978873241fdf8e2bbc` CLEAN. Shaco Forge HEAD
  `630891ee8ae03e8bff65fab6ac030673310252fc` CLEAN at review start.
  `P0_CLOSURE_AUDIT = PASS`. `ALLOW_P0S = YES`. P0.S not started in this
  Reviewer session. Next: BEGIN P0.S FEASIBILITY SPIKE. Evidence:
  `docs/05-reviews/architecture/AUDIT-004B-P0-CLOSURE-CORRECTIVE-REVIEW.md`.

- P0 Closure Corrective (AUDIT-004 F-01 / F-02 / F-03) applied as documentation
  wording only against frozen Harness
  `cd5ef8148158c3a752a658978873241fdf8e2bbc`. No P0 re-investigation. No P0.S.
  No Harness source, lockfile, baseline, architecture, or feature-scope change.
- F-01: three-layer `webServer` freeze (Cordis service vs stock `dsh-web-app`
  HTTP vs adapter/stub). Gateway does not hard-inject `webServer`. H-01 PASS /
  `PROVEN_WITH_CONSTRAINT` / FAIL rewritten. Core-patch inventory per-area plus
  `ADAPTER_OR_STUB_USED`. `CORE_PATCH_REQUIREMENT` remains `POSSIBLE_REQUIRES_P0S`.
- F-02: H-07 is streaming **contract**; Client `rpc.open` is optional; seams
  include `openStream` / `wireStream`. Gate remains `P0S_STREAM_PASS`.
- F-03: `session-query-sqlite` reclassified CONDITIONAL / OPTIONAL; JSONL
  remains default persistence.
- F-04: P0-3 Q “72 unary” reconciled to D-census 71; count is
  `UNARY_COUNT_NON_AUTHORITATIVE` as an architecture gate.
- F-05: `P0S_STANDARD_PRESET_TOOLS_PRESENT` annotated — shipped `standard` load
  plus REQUIRED subset; optional standard tools are not Product Hard Gates.
- `P0_EXECUTOR_WORK = CLOSED`. `INDEPENDENT_P0_CLOSURE_AUDIT =
  PENDING_CORRECTIVE_REVIEW`. `ALLOW_P0S = NO`. Next: Independent P0 Closure
  Corrective Review. Do not begin P0.S.

- P0-7 executed as document synthesis against frozen Harness
  `cd5ef8148158c3a752a658978873241fdf8e2bbc`. Upstream SHA, clean worktree and
  lockfile identity were reverified. No Harness source, lockfile, baseline, or
  Spike/production change. No P0-2..P0-6 re-investigation.
- Master Risk Register frozen. No P0 BLOCKER. `CORE_PATCH_REQUIREMENT` remains
  `POSSIBLE_REQUIRES_P0S`. P0.S hypotheses H-01..H-26 and Hard Gates frozen.
  Optional product features are not architecture Hard Gates. Failure branch
  remains Named Pipe primary / Fallback A loopback HTTP / Fallback B Owner-gated.
- Evidence:
  `docs/06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md`.
- `P0_UPSTREAM_RISK_REGISTER_FROZEN = YES`; `P0S_SPIKE_INPUT_FROZEN = YES`;
  `SHACO_FORGE_V1_0_P0_7 = PASS`; `SHACO_FORGE_V1_0_P0 = PASS`;
  `P0_STATE = CLOSED`; `SHACO_FORGE_V1_0_P0S = NOT_STARTED`.
- Next executable action: Independent P0 Closure Audit. Do not begin P0.S.

- P0-6 executed against frozen Harness
  `cd5ef8148158c3a752a658978873241fdf8e2bbc`; upstream SHA, clean worktree and
  lockfile identity were reverified. No Harness source, lockfile, or baseline
  change.
- Dependency classes frozen: product/extension seams may be composed; preview
  Connection/Gateway/Client-boot/`$events`/native FFI require adapters;
  dump-config and invariants are support-only; `packages/**/src`, experimental,
  test-support, and Worker `boot()` are forbidden.
- Named Pipe is not a Harness extension seam. `PRESET_COPY_REQUIRED = NO`.
  `HARNESS_DATA_DIRECT_WRITE_FORBIDDEN = YES`. `list_subagent_models` remains
  CONDITIONAL. `CORE_PATCH_REQUIREMENT = POSSIBLE_REQUIRES_P0S`.
- Evidence:
  `docs/06-testing-acceptance/evidence/P0-6-DEPENDENCY-AND-STABILITY-MATRIX.md`.
- `P0_DEPENDENCY_BOUNDARY_FROZEN = YES`;
  `SHACO_FORGE_V1_0_P0_6 = PASS`. Entire P0 remains `NOT_PASS`.
- Next executable technical action: P0-7 Risk Register & P0.S Input Freeze.

- P0-5 executed against frozen Harness
  `cd5ef8148158c3a752a658978873241fdf8e2bbc`; upstream SHA, clean worktree and
  lockfile identity were reverified before scope synthesis.
- Product Vision, V1.0 Master Goal, accepted architecture/ADRs and P0-2/P0-3/
  P0-4 evidence were reconciled with current standard-preset and concrete
  command/subagent/plugin registrations.
- V1.0 REQUIRED scope is the complete local Desktop Agent loop: DeepSeek
  credential/model, workspace/session persistence, text streaming,
  PowerShell/fs/search tools, permission/approval/question interaction,
  Settings persistence, core in-process subagent and Desktop/Worker
  durability/reconnect.
- Harness standard inclusion was not treated as automatic product scope.
  Images/Export/Plan/Compaction/Jobs/Skills/web tools remain OPTIONAL;
  Goal/Workflow/Ralph/Schedule and external subagent providers are DEFERRED.
- Browser transport artifacts are WEB_ONLY. Official in-box components form
  the plugin baseline; arbitrary npm/GitHub/marketplace/Dynamic Cordis product
  scope is excluded.
- `USER_QUESTION_CLASSIFICATION = REQUIRED`,
  `DIRECTORY_PICKER_CLASSIFICATION = REQUIRED`,
  `SETTINGS_PERSISTENCE_CLASSIFICATION = REQUIRED`, and binary carrier proof
  remains REQUIRED independently of OPTIONAL Export.
- Evidence:
  `docs/06-testing-acceptance/evidence/P0-5-CORE-FEATURE-PARITY-MATRIX.md`.
- `P0_CORE_PARITY_SCOPE_FROZEN = YES`;
  `SHACO_FORGE_V1_0_P0_5 = PASS`. Entire P0 remains `NOT_PASS`.
- Next executable technical action: P0-6 Dependency & Stability Matrix.

## 2026-08-29

- Shaco Forge Git repository initialized on `master`. No GitHub/Gitee remote added. No push.
- Documentation baseline committed: `chore(docs): bootstrap Shaco Forge documentation baseline`.
- P0-1 executed. Official DeepSeek Harness cloned to `D:\Project\Shaco-Forge-Upstream\deepseek-harness` (outside the product repo).
- Official `master` re-confirmed and frozen at `cd5ef8148158c3a752a658978873241fdf8e2bbc` / `dsh@0.1.2-alpha.1` / tag `dsh-v0.1.2-alpha.1`.
- `CHANGED_SINCE_PREVIOUS_AUDIT = NO`.
- `HARNESS_BASELINE_MANIFEST` written. Upstream worktree left CLEAN. No Harness build, no source mutation, no lockfile change.
- `SHACO_FORGE_V1_0_P0_1 = PASS`. Entire P0 remains `NOT_PASS`.
- Production implementation remains NOT_STARTED.
- P0-2 executed against frozen SHA `cd5ef8148158c3a752a658978873241fdf8e2bbc`.
- Obtained pnpm 11.7.0 via Corepack; `pnpm install --frozen-lockfile`; `dsh web --dump-default-config` via tsx (no production build).
- Upstream worktree remained CLEAN; lockfile SHA256 unchanged.
- Web composition = dsh-base + dsh-web-app. Standard preset remounts host-disabled agent tools except `tool-str-replace-editor`.
- Evidence: `docs/06-testing-acceptance/evidence/P0-2-WEB-AND-STANDARD-COMPOSITION-MAP.md`.
- `SHACO_FORGE_V1_0_P0_2 = PASS`. Entire P0 remains `NOT_PASS`.
- P0-3 executed against the same frozen SHA. Generated Host library descriptors,
  route registration, Gateway/Connection source, controllers, and current tests
  were inspected; 18 targeted test files / 364 tests passed.
- Contract result: 16 mounted Remote namespaces, 71 unary endpoints, three
  domain streams, `$events` generation/waterfalls, one binary ZIP Fetch route,
  Web module/HMR routes, and Host-authoritative cold session resume.
- Evidence: `docs/06-testing-acceptance/evidence/P0-3-CLIENT-HOST-CONTRACT-MAP.md`.
- Upstream remained CLEAN and lockfile identity unchanged after build/tests.
- `SHACO_FORGE_V1_0_P0_3 = PASS`. Entire P0 remains `NOT_PASS`.
- P0-4 executed against the same frozen SHA. BrowserAuth, Host/Origin trust,
  loopback capability classification, Settings canary, API/mux/exact Fetch,
  public assets, credentials, directory picker and alternate Connection seams
  were traced from current source and tests.
- Trust result: the Web path combines loopback binding, process launch-token
  possession, a persistent authority-bound HMAC cookie and Host/Origin checks.
  Gateway itself assumes an already-authenticated Connection; non-Web
  `rpc.call/open` authentication belongs to the composing transport.
- `SETTINGS_PERSISTENCE_DEPENDS_ON_LOOPBACK = YES`. The stock non-loopback
  Client exposes terminal unavailable/memory settings state and sends no Host
  settings calls; Host Settings/Credentials controllers have no equivalent
  per-caller loopback ACL.
- 14 targeted trust-related test files / 205 tests passed. Upstream remained
  CLEAN and the lockfile identity stayed unchanged.
- Evidence:
  `docs/06-testing-acceptance/evidence/P0-4-AUTHENTICATION-AND-TRUST-SURFACE.md`.
- `SHACO_FORGE_V1_0_P0_4 = PASS`. Entire P0 remains `NOT_PASS`.
- Next executable technical action: P0-5 Core Feature Parity Matrix.

Earlier the same day:

- Shaco Forge name adopted as current project name.
- V1.0 direction defined as DeepSeek Harness Desktop Baseline.
- Initial architecture audit returned FAIL; core Desktop+Worker direction retained, custom Agent protocol/full plugin parity/down-migration assumptions rejected.
- Corrective architecture re-audit returned PASS_WITH_REQUIRED_CORRECTIONS and allowed detailed design.
- P0 / P0.S / P0.5 detailed design completed and audited PASS_WITH_REQUIRED_CORRECTIONS.
- Architecture Owner accepted P0-stage corrections.
- Documentation system initialized.
