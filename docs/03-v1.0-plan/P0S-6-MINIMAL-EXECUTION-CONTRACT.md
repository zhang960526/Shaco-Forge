# P0.S-6 Minimal Execution Contract

Status: FROZEN / OWNER_APPROVED

## Contract Identity

- `ContractId = P0S6-MEC-20260903-01`
- `OwnerDecision = APPROVE_FOR_EXECUTION`
- `P0S6_STATE = READY_FOR_EXECUTION`
- `ExecutionAuthority = BOUNDED_CONTRACT_BOUND`
- `P0S6_PRODUCT_BASELINE_HEAD = cada37727af3f99da77f50353924af80f917b688`
- `P0S6_CONTRACT_FREEZE_HEAD = 45a3ccfc46d3fdc9a156b28c8b1f59af7e257af3`
- `EXECUTION_AUTHORITY_ANCHOR_POLICY = LAST_CLEAN_PRE_EXECUTION_GOVERNANCE_COMMIT`
- `P0S6_EXECUTION_AUTHORITY_ANCHOR = IDENTITY_CORRECTIVE_COMMIT_RESOLVED_POST_COMMIT`
- `FrozenHeads = ProductBaseline:cada37727af3f99da77f50353924af80f917b688; ContractFreeze:45a3ccfc46d3fdc9a156b28c8b1f59af7e257af3; Harness:cd5ef8148158c3a752a658978873241fdf8e2bbc`
- Contract freeze date: `2026-09-03`
- Frozen Harness HEAD: `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- Frozen Harness version: `dsh@0.1.2-alpha.1`

This Contract authorizes only the bounded execution described below. It does
not execute P0.S-6, classify either Gate, authorize Diagnostic or Formal work,
or authorize P0.S-7.

### Git Identity Semantics

`P0S6_PRODUCT_BASELINE_HEAD` is the clean active product/experiment-tree
baseline immediately before the Minimal Contract Freeze. It is not the HEAD
that Attempt #1 must directly start from.

`P0S6_CONTRACT_FREEZE_HEAD` is the commit that persisted this Contract and the
Architecture Owner execution approval. The final commit of the one permitted
Pre-Execution Identity Alignment Corrective automatically becomes
`P0S6_EXECUTION_AUTHORITY_ANCHOR` under
`EXECUTION_AUTHORITY_ANCHOR_POLICY`; its SHA is resolved after commit and is
not recursively embedded in that same commit.

After the Identity Corrective commit, no governance or documentation commit is
permitted before Primary Attempt #1 ends. Immediately before any top-level
runner invocation, the Executor must resolve `ExecutionAuthorityHead` to the
final Identity Corrective commit selected by the policy, then independently
read `git rev-parse HEAD` as `AttemptStartHead`. They must be equal. A mismatch
is `PRE_HYPOTHESIS_STOP`: do not invoke the runner, do not start Electron, and
do not consume a physical attempt.

`P0S6_PRODUCT_BASELINE_HEAD != P0S6_EXECUTION_AUTHORITY_ANCHOR` is normal
governance evolution and is not HEAD drift.

## Exact Electron Identity

P0.S-6 must reuse the Architecture Owner-accepted P0.S-2 Electron baseline:

- operating system: `Microsoft Windows NT 10.0.26200.0`
- architecture: `x64`
- Electron: `35.7.5`
- Electron embedded Node: `22.16.0`
- Chromium: `134.0.6998.205`
- `ElectronIdentity = Electron:35.7.5; EmbeddedNode:22.16.0; Chromium:134.0.6998.205; Platform:win32-x64; Resolution:SPIKE_LOCAL_LOCKED`
- package: exact `electron@35.7.5`
- package tarball: `https://registry.npmjs.org/electron/-/electron-35.7.5.tgz`
- package integrity: `sha512-dnL+JvLraKZl7iusXTVTGYs10TKfzUi30uEDTqsmTm0guN9V2tbOjTzyIZbh9n3ygUjgEYyo+igAwMRXIi3IPw==`
- executable strategy: Spike-local
  `<experiment-root>\node_modules\electron\dist\electron.exe`, resolved from
  the Contract-owned `package.json` and `package-lock.json`; no global Electron
  is permitted.
- accepted preparation-machine measures: Node
  `D:\Development\nodejs\node.exe` / `v24.18.0`, npm `11.16.0`, and
  PowerShell `7.6.4`. The absolute Node path is a machine measure only and is
  not a production runtime or packaging contract.

Automatic Electron upgrade, major/minor substitution, or use of another
runtime identity is forbidden. Any mismatch is a pre-hypothesis invalidation:
classify the attempt `INCONCLUSIVE`, stop, and return to the Architecture
Owner. It is not eligible for an automatic runtime substitution.

## Frozen Gates

### H-05

- `H05 = Required in-box Client modules can load without stock /plugins`
- Hypothesis: `Required in-box Client modules can load without stock /plugins`
- Hard Gate: `P0S_INBOX_CLIENT_MODULES_PASS`
- Required observations: REQUIRED roster artifact inventory, registration,
  activation, static artifact ownership, live `/plugins` request count, and
  relevant stock WebServer observation.
- PASS: every REQUIRED module is ACTIVE, the Core shell is mounted, and no
  live stock `/plugins` dependency is used.
- FAIL: a REQUIRED module can load only when live stock `/plugins` exists, or
  a Harness Core Patch / Core-Patch-equivalent is required.

### H-20

- `H20 = Cordis host/client/UI runner omission does not break Core Client boot`
- Hypothesis: `Cordis host/client/UI runner omission does not break Core Client boot`
- Hard Gate: `P0S_CORDIS_OMISSION_PASS`
- Required observations: `cordis-host-runner` runtime entry absent;
  `cordis-client-runner` graph, registration, and activation absent;
  `ui-cordis` graph, registration, and activation absent; `tool-cordis` absent;
  and the Core Client boot checkpoint reached.
- PASS: the checkpoint is reached with all four omissions intact.
- FAIL: restoring any omitted runner/UI component is required for boot.

The existing `api-remotes/client` static reference to
`cordis-host-runner/remote` is a known descriptor/BFF-selection reference. It
must be disclosed in Evidence and must not be treated by itself as retained
runtime runner activation.

## One Fixed Client Boot Slice

- `SliceCount = 1`
- `Slice = ONE_FIXED_CLIENT_BOOT_SLICE`
- Load the frozen P0-5 REQUIRED Client roster through static artifacts.
- Do not start or call stock `/plugins`.
- Omit `cordis-host-runner` runtime activation.
- Omit `cordis-client-runner` graph, registration, and activation.
- Omit `ui-cordis` graph, registration, and activation.
- Keep `tool-cordis` DEFERRED and absent.
- Reach the frozen minimum Core Client boot checkpoint.
- Classify H-05 and H-20 separately, then produce one aggregate result.

A second Slice is not authorized. If execution shows a second Slice is
required, stop and return to the Architecture Owner.

## Non-Goals

The execution must not enter full Electron Product integration, Worker,
Harness Host, Named Pipe, authentication, Settings persistence re-test,
Session workflow, real Agent behavior, real Settings/Workspace/Approval/
Question product behavior, full Client parity, plugin marketplace, arbitrary
or third-party plugins, production loader, production updater, packaging
closure, P0.S-7, P1, historical candidate, retained trace, native-loader
Diagnostic, or salvage.

## REQUIRED Roster

The exact P0-5 REQUIRED Client roster is:

1. `dsh-client-modules`
2. `dsh-client-connection`
3. `dsh-api-remotes`
4. `dsh-client-ui-theme`
5. `dsh-client-locale`
6. `dsh-client-ui-layout`
7. `dsh-client-ui-renderer`
8. `dsh-client-ui-session`
9. `dsh-client-ui-sidebar`
10. `dsh-client-ui-settings`
11. `dsh-client-ui-settings-general`
12. `dsh-client-ui-settings-models`
13. `dsh-client-ui-conversation`
14. `dsh-client-ui-approval`
15. `dsh-client-ui-chat`
16. `dsh-client-ui-tool`
17. `dsh-client-ui-workspace`
18. `dsh-client-ui-input-trigger`
19. `dsh-client-ui-commands`
20. `dsh-client-ui-subagent`
21. `dsh-client-ui-model-selection`
22. `dsh-client-ui-permission-presets`
23. `dsh-client-ui-user-questions`

No OPTIONAL or DEFERRED module may be promoted into this Gate roster.

## Support Closure and Platform Seed

The exact mechanical Support Closure is:

- `@deepseek-ai/dsh-typert-registry`
- `@deepseek-ai/dsh-api-gateway`
- `@deepseek-ai/dsh-api-session-controller`
- `@deepseek-ai/dsh-api-workspace-controller`

`SUPPORT_CLOSURE` does not expand V1.0 Product REQUIRED Feature Scope. The
platform static seed includes `ui-primitives`; it is not a REQUIRED roster row.
If frozen source evidence contradicts this Support Closure, stop and return to
the Architecture Owner without replacing the list.

## Boot Checkpoint

The minimum checkpoint requires all of the following:

- `AppWebEntry.run()` completes the module stage and plugin activation stage.
- The REQUIRED roster and Support Closure reach expected ACTIVE state.
- `ui-renderer` replaces the boot page.
- The Core shell/root is mounted.
- No relevant missing-service, import, activation, fatal, unhandled, or
  unresolved failure exists.

Successful file download alone is below the checkpoint. Full Session product
workflow is above the checkpoint and is not required.

## Static Artifact Rule

`prepare-static-client.mjs` may perform only static artifact ownership,
deterministic copy, path mapping, boot graph assembly, manifest generation,
transparent wrapping required by an approved public/preview seam, and Evidence
instrumentation.

`STATIC_ARTIFACT_SEMANTIC_TRANSFORMATION = FORBIDDEN`.

It must not modify Client module product semantics, modify copied Harness
module implementations to obtain activation, patch frozen built Harness
artifacts, or introduce a new private/internal loader API. Any such need means
`CLIENT_MODULE_CORE_PATCH_REQUIRED = YES` or
`CORE_PATCH_EQUIVALENT = YES`, followed by STOP, FAIL, and Architecture Owner
return.

## Attempt Budget and Retry Eligibility

- `PRIMARY_ATTEMPTS = 1`
- `CORRECTIVE_RETRIES = 1`
- `MAXIMUM_PHYSICAL_ATTEMPTS = 2`
- `MaximumPhysicalAttempts = 2`
- `CorrectiveRetries = 1`
- `PHYSICAL_ATTEMPTS_USED = 0` at Contract freeze
- `THIRD_ATTEMPT = NOT_AUTHORIZED`
- `ThirdAttempt = NOT_AUTHORIZED`

Every invocation of `run-spike.ps1 -AttemptId <UUID>` consumes one physical
attempt, including an invocation that fails during setup, preparation, or
verification.

The second physical attempt is conditionally authorized only when Attempt #1
is explicitly classified `PRE_HYPOTHESIS` or `EVIDENCE_ONLY`, solely because
of a Spike-owned typo, fixed path/wiring defect, deterministic setup defect,
runner/verifier defect, or bounded Evidence capture/serialization defect.

The retry must not change the REQUIRED roster, Support Closure, Cordis
omission, boot checkpoint, loading seam, timeout, or Gate semantics. A retry is
not allowed for REQUIRED-module activation failure, required live `/plugins`,
Cordis hidden dependency, required Core Patch, required production loader,
required architecture change, required quarantine, or
`OUT_OF_SCOPE_UNKNOWN`. Any third attempt requires a new Architecture Owner
decision.

## Allowed Files

Execution may create or modify only this future experiment root:

`docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/`

Allowed source files are exactly:

- `README.md`
- `package.json`
- `package-lock.json`
- `contract-roster.json`
- `run-spike.ps1`
- `prepare-static-client.mjs`
- `electron-main.mjs`
- `preload.cjs`
- `verify-evidence.mjs`
- `src/shell-bootstrap.js`
- `src/renderer-probe.js`

Generated paths may exist only beneath the same root as `node_modules/`,
`.npm-cache/`, `client-dist/`, `runtime-data/`, and
`evidence/<AttemptId>/`. No other existing Shaco source, P0.S-2 artifact,
Harness source, Harness built artifact, package metadata, or lockfile may be
modified.

## Allowed Commands and Runtime Boundary

The only top-level execution command is:

```powershell
pwsh -NoProfile -File .\run-spike.ps1 -AttemptId <UUID>
```

The runner may internally perform bounded preflight HEAD/worktree/hash checks,
`npm ci` against the frozen lockfile using the local cache, Node invocation of
`prepare-static-client.mjs`, one hidden Electron invocation using the exact
frozen executable, Node invocation of `verify-evidence.mjs`, and final
HEAD/worktree checks. It may not invoke another top-level runner or recursively
start itself.

Runtime is one hidden Electron Client boot process with Renderer sandbox,
context isolation, no Node integration, and a `45 seconds` hard timeout. No
Worker, Harness Host, stock WebServer, Named Pipe, authentication runtime, or
other service process is authorized. A process-associated listener observation
is Evidence only; opening a listener is forbidden.

## Evidence Contract

Each Attempt may record only bounded Evidence containing:

- AttemptId; `ProductBaselineHead`; `ContractFreezeHead`;
  `ExecutionAuthorityHead`; `AttemptStartHead`; `HarnessHead`; Harness
  version/lock SHA; start/end; exit code; worktree before/after; exact commands.
- `ProductBaselineHead` must equal
  `cada37727af3f99da77f50353924af80f917b688`;
  `ContractFreezeHead` must equal
  `45a3ccfc46d3fdc9a156b28c8b1f59af7e257af3`; and
  `ExecutionAuthorityHead == AttemptStartHead` must hold before the runner is
  invoked.
- experiment source file set and SHA256; roster; Support Closure; platform
  static seed; graph/dependency/artifact hashes.
- Cordis omission inventory; registration/activation; boot checkpoint;
  custom-scheme requests; live `/plugins` request count; relevant stock
  WebServer observation; process-associated listener observation.
- fatal/unhandled records; first failure boundary; relevant bounded log.
- H-05 and H-20 classifications; aggregate result;
  `CLIENT_MODULE_CORE_PATCH_REQUIRED`; Adapter/Stub inventory.

The relevant log cap is `200 lines OR 64 KiB, whichever comes first`.
Unbounded trace, full dump, retained trace, salvage capture, and unrelated
Diagnostic capture are forbidden. Sensitive information must not be captured.

## Result Vocabulary

The only aggregate classifications are `PASS`, `PROVEN_WITH_CONSTRAINT`,
`FAIL`, and `INCONCLUSIVE`. `INCONCLUSIVE` means STOP and return to the
Architecture Owner; it does not authorize Diagnostic continuation. H-05 and
H-20 remain separately classified under their original semantics.

## Stop Conditions

STOP immediately when any of the following occurs:

1. Two physical attempts have been consumed.
2. A third attempt is required.
3. Quarantine access is required.
4. Historical trace or salvage is required.
5. H-05 or H-20 must change.
6. Harness Core, built artifact, package metadata, or lockfile mutation is required.
7. A new product architecture is required.
8. Worker, Harness Host, Named Pipe, or authentication is required.
9. P0.S-7 capability is required.
10. A production loader or updater is required.
11. A third-party or arbitrary plugin system is required.
12. Large-scale Harness investigation is required.
13. `OUT_OF_SCOPE_UNKNOWN` blocks the result.
14. A Cordis runner/UI component must be restored.
15. An OPTIONAL/DEFERRED module must become a Gate roster member.
16. Evidence cannot yield one permitted classification.
17. A worktree write escapes the allowed path.
18. `AttemptStartHead != ExecutionAuthorityHead`, or Harness HEAD differs from
    `cd5ef8148158c3a752a658978873241fdf8e2bbc`. Product Baseline differing from
    Execution Authority Anchor is not drift.
19. Quarantine is accessed.
20. Sensitive information is captured.
21. A final classification is obtained.

No stop condition converts into a new Diagnostic. Stop, preserve only bounded
Evidence, and return to the Architecture Owner.

## Core Patch Boundary

Classify implementation mechanisms separately as `DISPOSABLE_SPIKE`,
`ADAPTER`, `STUB`, `HARNESS_CORE_PATCH`, or `CORE_PATCH_EQUIVALENT`. Adapter or
Stub does not automatically equal Core Patch. Modification of frozen Harness
source, frozen built artifact, package metadata/lockfile, Harness module
semantics, semantic patching of a copied module, or dependency on a new
private/internal loader API is a Core Patch / Core-Patch-equivalent and forces
STOP / FAIL / Architecture Owner return.

## Historical Candidate Policy

The quarantined 39-file historical candidate, retained traces,
native-loader Diagnostic, and salvage material are non-authorized,
non-Evidence, non-PASS, non-Formal, and non-production. They may not be
accessed, consumed, copied, inferred from, or granted retroactive status by
this Contract.

## Git Policy

The Contract Freeze documentation commit is authorized. Experiment source and
Evidence are not authorized for Commit by this Contract. Push is not
authorized. Execution must leave both frozen repositories clean outside the
allowed experiment path; any escape is a stop condition.

## Execution Authority

- `P0S6_MINIMAL_CONTRACT = FROZEN_OWNER_APPROVED`
- `P0S6_IMPLEMENTATION = AUTHORIZED_CONTRACT_BOUND`
- `P0S6_EXPERIMENT_SOURCE_MODIFICATION = AUTHORIZED_ALLOWED_DIRECTORY_ONLY`
- `P0S6_RUNTIME = AUTHORIZED_SINGLE_BOUNDED_ELECTRON_CLIENT_BOOT_ONLY`
- `P0S6_PRIMARY_ATTEMPT = AUTHORIZED_MAX_1`
- `P0S6_CORRECTIVE_RETRY = CONDITIONALLY_AUTHORIZED_MAX_1_RETRY_ELIGIBILITY_ONLY`
- `P0S6_DIAGNOSTIC = NOT_AUTHORIZED`
- `P0S6_FORMAL = NOT_AUTHORIZED`
- `P0S6_HARNESS_CORE_MUTATION = NOT_AUTHORIZED`
- `P0S6_COMMIT_EXPERIMENT = NOT_AUTHORIZED`
- `P0S6_PUSH = NOT_AUTHORIZED`
- `P0S7_ALLOWED = NO`
- `READY_FOR_P0S6_EXECUTION = YES`

The next and only executable step under this authority is `P0.S-6 PRIMARY
EXECUTION ATTEMPT #1`. This Contract Freeze does not perform that step.
