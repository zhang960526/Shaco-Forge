# V1-SLICE-3 Step1 Packaged Runtime Foundation Implementation Record

Status: IMPLEMENTED_WAITING_INDEPENDENT_REVIEW

Implementation Result: PASS

Run: `S3STEP1-20260911-FOUNDATION-01`

This is an Executor implementation record, not an Independent Review, Owner
closure or implementation baseline freeze. The sole phase authority is
[Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md).

The [Frozen Contract](../03-v1.0-plan/V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md)
and [Owner authorization](V1-SLICE-3-CONTRACT-FREEZE-AND-STEP1-AUTHORIZATION-DECISION.md)
remain byte-unchanged. Entry HEAD is
`19f200851c47d5ce1b93026e07d88a6d583ef7f5`, with a clean Product worktree.
Frozen Harness HEAD is `cd5ef8148158c3a752a658978873241fdf8e2bbc`, clean and
read-only. No Harness source, history, baseline or upstream dependency is changed.

Evidence is retained under
[S3STEP1-20260911-FOUNDATION-01](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/entry-baseline.json).
The [attempt ledger](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/test-summary.json)
preserves failed attempts as well as later successful attempts. Initial successful
builds and packages are development attempts, not final-source acceptance.

## Implementation choices

- Build-only dependency: `@electron/packager@18.3.6`, exact-pinned by pnpm 11.7.0.
  Its [documented folder output and options](https://electron.github.io/packager/main/interfaces/Options.html)
  support the existing Electron boundaries and filesystem resources. Forge adds
  orchestration not required here; electron-builder's installer/update surface is
  unnecessary for this Step1 foundation. No signing option is supplied.
- Electron stays `35.7.5 / win32 / x64`. Worker and official Harness CLI use the
  separate bundled `Node 22.19.0 / win32 / x64` executable. Native helper is
  published self-contained for `win-x64`; runtime needs no installed .NET.
- Release files are inventoried by relative path, bytes and SHA-256. The release
  manifest is itself inventoried; the file-inventory and artifact-binding
  envelopes are excluded from their own inventory. The artifact binding hashes
  the release manifest and file manifest. It does not identify a future installer.
- SourceCommit is the entry source ancestry. The exact uncommitted implementation
  is additionally bound by a source-file inventory, explicitly labelled
  `WORKTREE_OVER_SOURCE_COMMIT_BOUND_BY_SOURCE_INVENTORY`. This avoids inventing a
  future candidate commit or creating a self-referential commit/artifact hash.
- Control Store has no implementation or writes in the frozen Product. Its release
  metadata truthfully says `NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES`; no schema,
  database or compatibility transaction is introduced for a manifest placeholder.
- Worker alone resolves the Windows current-user known folder using the existing
  thin native helper and explicitly injects `DSH_HOME` into the official CLI
  child. Ambient home/path overrides are removed from packaged child inputs.
- Approved profile executable bytes remain release-owned. The single explicit
  `dsh/profiles/shaco-forge` junction points to the verified release profile;
  unexpected redirection fails closed. Harness still owns all profile and data
  semantics. Production uses `dsh --profile shaco-forge`.
- NF-1 changes the ordinary transport factory to omit the full observer. Main
  explicitly opts an Evidence/user-loop document in through a fixed Preload
  boolean. Existing bounded observer privacy and transparency remain applicable.
- NF-3 replaces runtime profile, graph revision and productSlice metadata with
  Product/release identities. Historical Evidence and Reviews keep their labels.

## Runtime layout and controlled home

The actual folder layout is:

| Component | Path relative to package root |
|---|---|
| Electron Desktop | `Shaco Forge.exe` |
| Desktop code and Client assets | `resources/app/desktop/dist/` |
| Worker launcher | `resources/app/worker-launch.mjs` |
| Worker code | `resources/app/worker/dist/` |
| Worker/Host Node | `runtime/node.exe` |
| Official Harness CLI | `harness/node_modules/@deepseek-ai/dsh/lib/bin.js` |
| Release profile | `harness/profiles/shaco-forge/` |
| Native helper and its self-contained runtime | `native/` |
| Release metadata | `release-manifest.json` |
| Deterministic file inventory | `packaged-files.json` |
| Unsigned artifact binding | `artifact-identity.json` |

`DSH_HOME` is resolved to `C:\Users\18902\AppData\Local\Shaco Forge\dsh` in
the actual current-user desktop tests. That is a measured machine path, not a
hardcoded Product path. The native adapter checks the current user's Windows
known folder, canonical ancestry, protected current-SID-only ACL, writability and
unexpected reparse points. Worker checks the native canonical result and accepts
only the explicit release-profile link and release-owned module references.

The frozen native dependency's existing `NARB_DISABLE_NATIVE_CACHE=1` option is
forced for the packaged Host, with ambient NARB overrides removed. Native bytes
remain in the verified installation. Integrity hashing uses eight bounded readers
and hashes all bytes on each verification; no digest cache replaces verification.

Environment and failed-startup diagnostics, including the test-only Explorer
launch driver, are explained in the
[Evidence README](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/README.md).
No Explorer dependency or MSIX workaround is added to the Product.

## Scope boundaries

```text
PROVIDER_GATE_AUTHORIZATION = NO
PROVIDER_RUN_COUNT = 0
SIGNING_EXECUTION_AUTHORIZATION = NO
SIGNING_RUN_COUNT = 0
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
NF4_FRAME_CAP = 262144 / UNCHANGED
NF4_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP1_INDEPENDENT_REVIEW = NOT_STARTED
V1_SLICE_3_STEP1_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP1_BASELINE = NOT_FROZEN
V1_SLICE_3_STEP2 = NOT_AUTHORIZED
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
V1_SLICE_3_CLOSURE = NO
V1_SLICE_4 = NOT_STARTED
PUSH = NO
```

## Final implementation result

```text
V1_SLICE_3 = IN_PROGRESS
V1_SLICE_3_ARCHITECTURE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
V1_SLICE_3_STEP1_IMPLEMENTATION_AUTHORIZATION = CONSUMED
V1_SLICE_3_STEP1_IMPLEMENTATION_RESULT = PASS
V1_SLICE_3_STEP1 = IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_SLICE_3_STEP1_DEDICATED_GATES = PASS
V1_SLICE_3_STEP1_CUMULATIVE_NON_PROVIDER_REGRESSION = PASS
V1_SLICE_3_STEP1_INDEPENDENT_REVIEW = NOT_STARTED
V1_SLICE_3_STEP1_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP1_BASELINE = NOT_FROZEN
V1_SLICE_3_STEP2 = NOT_AUTHORIZED
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
V1_SLICE_3_CLOSURE = NO
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
F05_CLOSURE_BY_EXECUTOR = FORBIDDEN
F05_CLOSURE_BY_REVIEWER = FORBIDDEN
F05_RESIDUAL_RISK_ACCEPTANCE_OWNER = ARCHITECTURE_OWNER_ONLY
STEP2_CLOSURE_WITHOUT_F05_OWNER_DISPOSITION = FORBIDDEN
NF1_TECHNICAL_DISPOSITION_CANDIDATE = CLOSED_BY_PACKAGING_HARDENING
NF3_TECHNICAL_DISPOSITION_CANDIDATE = CLOSED_BY_STABLE_RELEASE_IDENTITY
NF4_STATUS = DEFERRED_TO_SLICE3_STEP3 / NOT_CLOSED
PROVIDER_GATE_AUTHORIZATION = NO
PROVIDER_RUN_COUNT = 0
SIGNING_EXECUTION_AUTHORIZATION = NO
SIGNING_RUN_COUNT = 0
V1_SLICE_4 = NOT_STARTED
V1_CURRENT_STEP = V1_SLICE_3_STEP1_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_CURRENT_NEXT_ACTION = INDEPENDENT_REVIEW_V1_SLICE_3_STEP1_IMPLEMENTATION
```

All 18 required build/test/package commands passed on source inventory `cf33600c13cd9a6b12b9c80a5050427d1188858c02888c2abd014bec1391edad`. This includes 184 full unit tests, 19 packaging unit gates and the complete current reproducible non-Provider lifecycle/UI regression.

Packaged artifact digest: `679a92171c047f70b4d607d066f922ec0153d3f516a2fafbef9198d41ab7c2aa`; 44240 release files; 1647659038 bytes.

See the [complete 21-part execution report and file list](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/final-report.md), [all attempts](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/test-summary.json) and [review handoff](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/review-handoff.md).

The local candidate commit containing this record is an implementation candidate only. It is not a Step1 freeze or Owner closure. Push is NO.
