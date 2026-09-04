# P0.S-6 Dependency Readiness Recovery Contract

Status: `FROZEN`

Planning Mode: `CONTRACT_BOUND_DEPENDENCY_PREPARATION`

Execution Authority: `DEPENDENCY_PREPARATION_AUTHORITY_ONLY`

Owner Approval: `OWNER_APPROVED`

Freeze Status: `FROZEN`

## 1. Contract Identity and Authority

- `ContractId = P0S6-DRRC-20260904-01`
- `P0S6_DRRC_CONTRACT_ID = P0S6-DRRC-20260904-01`
- `P0S6_DRRC_STATE = FROZEN_OWNER_APPROVED`
- `P0S6_DRRC_OWNER_DECISION = APPROVE_FOR_DEPENDENCY_PREPARATION_ONLY`
- `P0S6_DRRC_INDEPENDENT_REVIEW = PASS`
- `P0S6_RECOVERY_CONTRACT_PLANNING = COMPLETED`
- `P0S6_DEPENDENCY_PREPARATION = AUTHORIZED_SINGLE_INVOCATION`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_USED = 0`
- `P0S6_DEPENDENCY_READINESS = NOT_RUN`
- `P0S6_READY_FOR_DEPENDENCY_PREPARATION = YES`
- `P0S6_OFFLINE_REINSTALL_PROOF = SUPERSEDED_BY_FROZEN_IN_PLACE_NODE_MODULES`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`
- `P0S7_ALLOWED = NO`
- `P0S6_DRRC_FREEZE_HEAD_POLICY = COMMIT_CONTAINING_OWNER_APPROVED_DRRC_AND_GOVERNANCE_SYNC`
- Freeze date: `2026-09-04`
- Corrected Draft authority HEAD: `32622f1d6a0bc2231c786726e02aca2fe57fc372`
- Frozen Harness HEAD: `cd5ef8148158c3a752a658978873241fdf8e2bbc`

This frozen Contract authorizes exactly one Contract-bound Dependency
Preparation invocation after the governance Freeze commit completes. It does
not authorize H-05/H-20 Runtime, `run-spike.ps1`, Electron launch, a physical
Runtime Attempt, Global Physical Attempt #3, or P0.S-7.

Dependency Readiness `PASS` cannot be interpreted as Runtime authority. Any
future Runtime still requires a separate Owner-approved Recovery Execution
Contract.

### 1.1 Review and Freeze Provenance

- Initial Review: `PASS_WITH_REQUIRED_CORRECTIONS`
- Corrected Draft SHA-256:
  `10e16733bc24e83ea3ecaf44373cfbda9efd6bac6c52e1ca5d681cdc7459047b`
- Corrective Re-Review: `PASS`
- Required Findings Closed: `F-01 through F-05 and L-01`
- New Required Findings: `0`
- Reviewer official-network verification:
  `UNAVAILABLE_ENVIRONMENT_LIMITATION`
- Local Electron ZIP cross-check: two files; each `120958381` bytes; each
  SHA-256
  `b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d`

The local cache copies are Review corroboration only. They are not Dependency
Readiness proof and are not authorized Dependency Preparation input.

`P0S6_DRRC_FREEZE_HEAD` is the actual SHA of the single governance commit that
contains this Owner-approved Contract and the synchronized governance files.
The SHA is resolved and returned after commit; it is not recursively embedded
in that same commit, and no second commit may be created to backfill it. The
next Dependency Preparation must use that actual commit SHA as its governance
starting HEAD.

## 2. Historical Authoritative Starting State

The fields in this section record the pre-DRRC boundary and do not override the
current frozen Owner-approved state above.

- `P0S6_MEC_20260903_01_STATE = EXHAUSTED_INCONCLUSIVE`
- `P0S6_STATE = BLOCKED_PENDING_RECOVERY_CONTRACT`
- Attempt #1 `999bbd1e-9301-49ad-9021-30da7c879f9e` stopped at
  `PRE_HYPOTHESIS / RUNNER_PREFLIGHT`.
- Attempt #2 `76bc4e8a-fb0c-4e92-a750-b555e6a57e41` stopped at
  `PRE_HYPOTHESIS / DEPENDENCY_SETUP` because the offline cache lacked
  `env-paths-2.2.1.tgz`.
- `P0S6_PHYSICAL_ATTEMPTS_USED = 2`
- `P0S6_PHYSICAL_ATTEMPTS_REMAINING = 0`
- `P0S6_THIRD_ATTEMPT = NOT_AUTHORIZED`
- `P0S6_RUNTIME_GATE_REACHED = NO`
- Both Attempts have `ElectronLaunchCount = 0`.
- `P0S_INBOX_CLIENT_MODULES_PASS = NOT_PROVEN`
- `P0S_CORDIS_OMISSION_PASS = NOT_PROVEN`
- `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`

The immutable Attempt #2 fallback fields do not override the invocation ledger.
Dependency setup consumed the second MEC-01 physical Attempt because MEC-01
placed `npm ci` inside `run-spike.ps1`. No Runtime Evidence was produced, and
the dependency failure is not an H-05 or H-20 result.

Protected historical identities:

- MEC-01 SHA-256:
  `2ee6e755a7694acda4b30e2bbaf698ae4ebafe84dec7bc102dbbe2d29318325d`
- Attempt #1 `attempt.json` SHA-256:
  `bdcbd0579238f07fff28e420b1529cf9cf13fe38652cb6d18dd5d0bc11a77d46`
- Attempt #2 `attempt.json` SHA-256:
  `c6646264f2cb6e20d59d6dc913d8dc1753557b192a472ccc48c16b09a6107a88`
- Attempt #2 `preflight.json` SHA-256:
  `bc1dfb1e1f2537e2f1f8eb999b21037af4c662053637ec3d84199388d7fc03e5`
- Existing untracked MEC-01 experiment-tree aggregate fingerprint:
  `7be96a9e147074e98eca1cf208d6af13f843becfe997ac13a779ec2ec26d4527`

These identities are reference-only protection boundaries. They are not inputs
that may be repaired, rewritten, normalized, or regenerated.

## 3. Purpose and Non-Runtime Boundary

This Contract addresses only the dependency-readiness gap proved by MEC-01. It
defines how a complete, lockfile-driven dependency tree could be materialized
and statically verified before a future Runtime Contract is considered.

This Contract does not validate H-05 or H-20, start Electron, authorize a
physical Runtime Attempt, classify the P0.S-6 product Gates, or change any
product Gate. The only possible outcome of the future preparation activity is
a Dependency Readiness result and an Owner handoff.

## 4. OWNER-DIRECTED RECOVERY DESIGN SUPERSEDE

- `P0S6_OFFLINE_REINSTALL_PROOF = SUPERSEDED_BY_FROZEN_IN_PLACE_NODE_MODULES`

The selected Recovery design moves Dependency Preparation completely outside
physical Runtime Attempt accounting. One online, lockfile-driven `npm ci`
materializes the complete dependency closure. After Dependency Readiness
passes, the later Runtime must consume the same `node_modules` from its original
path, with the same bytes and canonical manifest, without running `npm ci` and
without using `.npm-cache` to rebuild it.

Accordingly, a second clean offline reinstall from `.npm-cache` is not a
Runtime prerequisite. `.npm-cache` remains a generated preparation output, but
it is not Dependency Readiness proof and is not a future Runtime input. This
supersede does not weaken the frozen package, lockfile, npm package-integrity,
Electron binary-artifact, installed-tree, or manifest-integrity requirements.

The Architecture Owner explicitly superseded the prior offline-proof target.
The Current State, P0.S Feasibility Spike, Current Checkpoint, and Context
Handover are synchronized in the same governance commit that freezes this
Contract. The supersede and Dependency Preparation authority become effective
only when that single governance commit completes under the Freeze HEAD policy
in section 1.

## 5. Isolation Boundary and Proposed Generated Root

The single proposed generated root is:

`docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/`

All future Dependency Preparation inputs, generated dependencies, caches,
temporary files, logs, manifests, and Evidence must be contained under that
root. The exact allowed write surface is limited to Contract-owned input copies
and the following descendants of the proposed root:

- `node_modules/`
- `.npm-cache/`
- `.electron-cache/`
- `config/`
- `temp/`
- `evidence/<PreparationId>/`

The MEC-01 experiment root
`docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/` is
immutable. Its partial `node_modules`, `.npm-cache`, and `runtime-data` are
failed-attempt outputs and must not be copied, linked, imported, repaired, used
as a cache seed, or treated as readiness input or proof. MEC-01 source files,
Evidence, and every other existing file remain immutable.

The new generated root must not use junctions, links, or path traversal to
reach MEC-01, the Frozen Harness, Quarantine, another repository path, or a
machine-global cache. Environment-controlled npm cache, Electron cache, TEMP,
and TMP paths must resolve beneath the new root before preparation begins.
`HOME` and user-global configuration must not be modified.

### 5.1 Contract-Owned Environment

Before the preparation invocation, the effective environment must contain the
following exact values, with `<RecoveryRoot>` resolved to the canonical absolute
path of the proposed generated root:

| Setting | Required value |
|---|---|
| `npm_config_cache` | `<RecoveryRoot>/.npm-cache` |
| `electron_config_cache` | `<RecoveryRoot>/.electron-cache` |
| `npm_config_userconfig` | `<RecoveryRoot>/config/empty-user.npmrc` |
| `npm_config_globalconfig` | `<RecoveryRoot>/config/empty-global.npmrc` |
| `npm_config_registry` | `https://registry.npmjs.org/` |
| `TEMP` | `<RecoveryRoot>/temp` |
| `TMP` | `<RecoveryRoot>/temp` |
| `ELECTRON_INSTALL_PLATFORM` | `win32` |
| `ELECTRON_INSTALL_ARCH` | `x64` |

Both Contract-owned npmrc files must exist, be zero-byte regular files, and
have recorded SHA-256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
They must resolve beneath `<RecoveryRoot>/config/`.

The following variables must be absent or have an empty value, and that state
must be recorded before `npm ci`:

| Variable | Required state |
|---|---|
| `ELECTRON_MIRROR` | absent or empty |
| `ELECTRON_NIGHTLY_MIRROR` | absent or empty |
| `ELECTRON_CUSTOM_DIR` | absent or empty |
| `ELECTRON_CUSTOM_FILENAME` | absent or empty |
| `ELECTRON_CUSTOM_VERSION` | absent or empty |
| `electron_use_remote_checksums` | absent or empty |
| `force_no_cache` | absent or empty |
| `ELECTRON_GET_USE_PROXY` | absent or empty |
| `HTTP_PROXY` | absent or empty |
| `HTTPS_PROXY` | absent or empty |
| `ALL_PROXY` | absent or empty |
| `http_proxy` | absent or empty |
| `https_proxy` | absent or empty |
| `all_proxy` | absent or empty |

Preflight must inventory `.npmrc` files in the Recovery project and every
parent directory up to the filesystem root. If one exists, Evidence must prove
from the frozen effective-config snapshot that it did not participate or alter
registry, cache, scripts, lockfile, proxy, certificate, authentication, or
source selection. If that proof cannot be produced, classify
`AUTHORITY_BLOCKED` before invoking npm.

The effective npm configuration must be captured before preparation by a
non-mutating frozen mechanism and must prove the official registry, both
Contract-owned empty npmrc paths, the Contract-owned cache, no registry
override, no Electron mirror, no proxy variable, and unchanged requested URLs
from the frozen lockfile. The preparation must not read or modify a user npmrc,
global npmrc, user cache, global cache, `HOME`, or machine-global Electron
cache.

## 6. Frozen Dependency Inputs

The proposed preparation must use byte-identical copies of the existing
MEC-01 input files:

| Input | Source identity | Required SHA-256 |
|---|---|---|
| `package.json` | MEC-01 experiment source | `4486d5bab3bf14ff40626f7c607470cd888ca6c35105112c3f6d3d658ddb5b65` |
| `package-lock.json` | MEC-01 experiment source; lockfile version 3 | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |

The Electron npm wrapper identity is frozen as:

- package: `electron@35.7.5`
- package request URL:
  `https://registry.npmjs.org/electron/-/electron-35.7.5.tgz`
- package integrity:

`sha512-dnL+JvLraKZl7iusXTVTGYs10TKfzUi30uEDTqsmTm0guN9V2tbOjTzyIZbh9n3ygUjgEYyo+igAwMRXIi3IPw==`

The Electron binary artifact identity is independently frozen as:

| Field | Frozen value |
|---|---|
| Artifact | `electron-v35.7.5-win32-x64.zip` |
| Official requested URL | `https://github.com/electron/electron/releases/download/v35.7.5/electron-v35.7.5-win32-x64.zip` |
| Official checksum metadata URL | `https://github.com/electron/electron/releases/download/v35.7.5/SHASUMS256.txt` |
| Official checksum metadata SHA-256 | `6e379d0be079aac68d3b441d9d66c2dbef534b05a3336c23c35019e5b2261b15` |
| Original matching metadata line | `b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d *electron-v35.7.5-win32-x64.zip` |
| Required artifact SHA-256 | `b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d` |

The checksum metadata was read as `7598` bytes from the official GitHub
release URL during this documentation corrective. Its exact bytes produced the
metadata SHA-256 above, and exactly one line matched the target artifact.

The future preparation may follow normal HTTPS redirects from the official
GitHub release origin to GitHub's official release-asset delivery host. It must
not use an Electron mirror, custom filename or version, alternate requested
origin, or non-official rehosting. The actual cached ZIP must remain beneath
`<RecoveryRoot>/.electron-cache/`; its canonical absolute cache path, size, and
SHA-256 must be recorded. The actual SHA-256 must equal the required artifact
SHA-256 above.

The proposed platform is Windows x64. The preparation Evidence must record the
actual operating-system identity, architecture, Node executable identity and
version, npm executable identity and version, and PowerShell identity if a
future approved implementation uses it for orchestration. The MEC-01 recorded
preparation baseline is Node `v24.18.0`, npm `11.16.0`, and PowerShell `7.6.4`;
any proposed change must return to the Architecture Owner before the sole
preparation invocation and must not be silently substituted.

No version upgrade, dependency re-resolution, lockfile modification, package
substitution, alternate Electron version, override, or manual patch is allowed.
Only packages already resolved by the frozen lockfile and the exact official
Electron binary artifact above may be downloaded.

## 7. Single Dependency Preparation Model

Under this frozen Owner-approved authority, Dependency Preparation uses one
complete lockfile-driven online materialization in the isolated generated root.
The sole materialization command is:

```text
npm ci --ignore-scripts=false --foreground-scripts --no-audit --no-fund --cache .npm-cache --prefer-online
```

The command runs once from the proposed generated root with the frozen
`package.json` and `package-lock.json`. It must begin with an empty generated
`node_modules`, empty generated `.npm-cache`, and empty generated
`.electron-cache`; it may use the network only for frozen lockfile resolutions
and the frozen Electron binary artifact in section 6. The section 5 environment
contract must be established first and remain unchanged. The exact environment,
requested URLs, redirects, registries, hosts, package/artifact identities, and
a bounded download-source summary must be captured as Evidence. Normal HTTPS
or CDN redirects from the requested official origin are allowed only when the
complete redirect chain and final host are recorded.

Before `npm ci`, a static scan of the frozen `package-lock.json` must enumerate
every `hasInstallScript` entry. The only permitted current entry is
`node_modules/electron` for `electron@35.7.5`. A new or changed install-script
declaration is `AUTHORITY_BLOCKED`. After materialization, Evidence must record
the actual lifecycle-script list, package/version, lifecycle phase, command,
exit result, and bounded stdout/stderr. Any lifecycle script belonging to a
package other than `electron@35.7.5`, or any undeclared lifecycle script, forces
`INCONCLUSIVE / STOP`.

Install scripts are allowed only because the official Electron package needs
them to materialize its frozen distribution. No install script may run Shaco
Forge, the Harness Host, a Worker, a Client, an Electron Client process, or any
product Runtime. If an install script would cross that boundary, preparation
must stop.

After successful materialization, the exact read-only dependency-tree
validation command is:

```text
npm ls --all --json
```

This validation is not a second materialization and cannot repair or alter the
tree. Its raw structured output and exit code must be captured. No other npm
command is allowed. The command ledger must therefore show exactly one
`npm ci` materialization invocation and exactly one `npm ls` validation
invocation when preparation reaches tree validation.

The prepared, verified `node_modules` is the artifact proposed for freezing and
later use by a separately governed Recovery Execution Contract. A future
physical Runtime Attempt must not run `npm ci` again. Dependency Preparation
failure must stop before Runtime and cannot automatically fall through to a
Runtime runner.

## 8. Dependency Readiness Gate

`P0S6_DEPENDENCY_READINESS = PASS` requires every condition below:

1. The source paths, sizes, and SHA-256 identities of `package.json` and
   `package-lock.json` match section 6, and the copied inputs remain unchanged.
2. The sole `npm ci` invocation exits successfully with exit code `0`.
3. The effective npm configuration and environment match section 5. The
   registry is `https://registry.npmjs.org/`; userconfig/globalconfig are the
   Contract-owned empty files; cache/TEMP/TMP remain beneath RecoveryRoot; and
   no registry override, Electron mirror, custom artifact selector, or proxy is
   active.
4. `npm ls --all --json` completes and its structured `problems` collection is
   empty. A missing `problems` property is normalized to an empty collection
   while preserving the raw output. Recursive validation reports no required
   installed package as `missing`, `invalid`, or `extraneous`.
5. Packages that the frozen lockfile marks optional and whose `os` or `cpu`
   constraints are inapplicable to `win32-x64` may be normally omitted and
   must be listed as such; they are not failures. No other exemption exists.
   Any additional exemption requires a prior Contract amendment and cannot be
   introduced during execution.
6. The lockfile `hasInstallScript` inventory contains only
   `node_modules/electron`, and the actual lifecycle-script inventory and
   output contain only the declared `electron@35.7.5` installation activity.
7. Installed Electron npm wrapper version is exactly `35.7.5` and its package
   request/integrity identity matches section 6.
8. The requested Electron binary URL and filename match section 6, every
   redirect remains within the allowed official GitHub release-asset chain,
   and the actual cached ZIP SHA-256 is exactly
   `b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d`.
   Its size and canonical absolute cache path beneath RecoveryRoot are recorded.
9. The Spike-local executable exists at
   `node_modules/electron/dist/electron.exe`.
10. Electron `dist/version`, or an equivalent static distribution identity, is
   exactly `35.7.5`.
11. The SHA-256, byte size, and canonical relative path of `electron.exe` are
   recorded.
12. A canonical inventory covers every leaf entry in the complete
    `node_modules` tree, and the manifest's aggregate SHA-256 is recorded.
13. Every frozen lockfile package entry and every available `resolved` and
    `integrity` value is mapped to an installed package identity or an explicit
    root/non-package/inapplicable-platform classification. Successful npm
    integrity enforcement and the complete mapping must be recorded or
    independently verifiable.
14. Worktree and allowed-write Evidence proves there was no write to product
    source, Frozen Harness, MEC-01, existing Evidence, Quarantine, or any path
    outside the proposed generated root.
15. Requested package URLs remain the frozen lockfile sources. No mirror,
    registry override, proxy, custom Electron selector, or unofficial rehost
    participated.
16. Electron Client launch count is exactly `0`; no Shaco Forge Client,
    Harness Host, Worker, product Runtime, or other forbidden service started.
17. No H-05 or H-20 verdict or inference was produced.

### 8.1 Canonical Manifest Grammar

- Schema: `P0S6_NODE_MODULES_MANIFEST_V1`
- Storage path:
  `evidence/<PreparationId>/node-modules-manifest.tsv`
- Encoding: UTF-8 without BOM
- Line ending: LF
- File ending: exactly one final LF
- Aggregate: SHA-256 of the complete manifest bytes, including the final LF

The manifest is outside `node_modules` and never enters its own input. It must
include every leaf entry under `node_modules`; directories themselves are not
records because leaf paths implicitly define the directory structure.
`node_modules/.package-lock.json`, every `.bin` shim, empty files, binary files,
and executable files are included. Timestamps, ACLs, owner, Windows archive
flags, and all other unstable metadata are excluded. Windows `.exe`, `.cmd`,
and `.ps1` entries are ordinary regular files.

The first line must be exactly:

```text
P0S6_NODE_MODULES_MANIFEST_V1
```

Every subsequent line has one of these exact grammars, where `<TAB>` is one
byte `09`:

```text
F<TAB><BASE64URL_PATH><TAB><SIZE_DECIMAL><TAB><SHA256_LOWER_HEX>
L<TAB><BASE64URL_PATH><TAB><BASE64URL_RAW_TARGET>
J<TAB><BASE64URL_PATH><TAB><BASE64URL_RAW_TARGET>
R<TAB><BASE64URL_PATH><TAB><BASE64URL_RAW_REPARSE_IDENTITY>
```

`F` is a regular file, `L` is a symbolic link, `J` is a junction, and `R` is
another reparse point that cannot be safely classified. Link and reparse
entries are inspected without following them. For `L` and `J`, the target is
the exact stored raw target string, without path resolution. For `R`, the raw
identity string is the lowercase eight-digit reparse tag, a literal `:`, and
the lowercase hex of the raw reparse data buffer.

`PATH` is relative to the `node_modules` root, uses `/` separators, preserves
actual on-disk case, and is Unicode-normalized to NFC before validation and
encoding. `.`, `..`, absolute paths, empty path segments, NUL, and root escape
are forbidden. Two normalized paths that collide after Unicode full case
folding, or multiple entries with the same normalized path, force STOP. The
collision key uses Unicode 15.0 Default Case Folding full mappings (`C` and
`F`) over the NFC path, independent of locale.

The normalized path and raw target/identity strings are encoded as UTF-8 bytes
and then RFC 4648 Base64URL without padding. `SIZE_DECIMAL` is the exact file
byte length in decimal with no leading zero except the value `0`.
`SHA256_LOWER_HEX` is the SHA-256 of the raw file bytes as exactly 64 lowercase
hex digits. Records are sorted by the normalized path's UTF-8 bytes in unsigned
byte-ordinal order. Entry type does not participate in primary ordering.

### 8.2 Canonical Manifest Test Vector

This synthetic vector is computed entirely in memory and does not read or
create a real `node_modules` tree:

| Entry | Synthetic input |
|---|---|
| regular binary/executable | path `bin/tool.exe`; bytes `00 ff 10 0a 7f`; size `5`; SHA-256 `ebd3e2065c55138882bf5fe4a94b642fd7d63c31b50682e5b521ad2bf985e028` |
| empty regular file | path `empty.txt`; zero bytes; size `0`; SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| symbolic link | path `tool-link`; raw target `bin/tool.exe` |

The expected complete manifest bytes, expressed with `\t` for byte `09` and
`\n` for byte `0a`, are:

```text
P0S6_NODE_MODULES_MANIFEST_V1\nF\tYmluL3Rvb2wuZXhl\t5\tebd3e2065c55138882bf5fe4a94b642fd7d63c31b50682e5b521ad2bf985e028\nF\tZW1wdHkudHh0\t0\te3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nL\tdG9vbC1saW5r\tYmluL3Rvb2wuZXhl\n
```

The same `230` UTF-8 bytes as lowercase hex are:

```text
503053365f4e4f44455f4d4f44554c45535f4d414e49464553545f56310a4609596d6c754c335276623277755a58686c093509656264336532303635633535313338383832626635666534613934623634326664376436336333316235303638326535623532316164326266393835653032380a46095a57317764486b7564486830093009653362306334343239386663316331343961666266346338393936666239323432376165343165343634396239333463613439353939316237383532623835350a4c0964473976624331736157357209596d6c754c335276623277755a58686c0a
```

The expected aggregate SHA-256 is:

`a55f7fbd209f6f1ed1f84824de719b3667a776b4d2b898767bb1b3a91b513b70`

The calculation encodes the four displayed records with UTF-8 without BOM,
joins them with LF, appends one final LF, and hashes the resulting 230 bytes.

Dependency Readiness `PASS` must stop and return to the Architecture Owner. It
may produce only:

- `P0S6_DEPENDENCY_READINESS = PASS`
- `P0S6_READY_FOR_RECOVERY_EXECUTION_CONTRACT_PLANNING = YES`

It must not authorize `P0S6_RUNTIME` or `P0S6_THIRD_ATTEMPT`, classify `H05`
or `H20` as `PASS`, or set `P0S7_ALLOWED` to `YES`.

## 9. Budget and Invocation Accounting

- `DEPENDENCY_PREPARATION_INVOCATIONS_MAXIMUM = 1`
- `PHYSICAL_RUNTIME_ATTEMPTS_IN_THIS_CONTRACT = 0`
- `HISTORICAL_PHYSICAL_ATTEMPTS_USED = 2`
- `HISTORICAL_PHYSICAL_ATTEMPTS_REMAINING = 0`
- `GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`

The Dependency Preparation invocation is a separate pre-Runtime governance
unit and consumes no physical Runtime Attempt. If the invocation starts, it
consumes the complete Dependency Preparation budget whether it succeeds or
fails. Any failure or unproved PASS condition yields `INCONCLUSIVE`, stops, and
returns to the Architecture Owner. No package-by-package corrective download,
targeted tarball retry, second `npm ci`, cache-seeding retry, or automatic
corrective preparation is allowed.

If preparation fails, every partial `node_modules`, `.npm-cache`,
`.electron-cache`, `temp`, log, and manifest under RecoveryRoot is classified:

- `NON_READINESS`
- `NON_RUNTIME_INPUT`
- `NON_H05_H20_EVIDENCE`

Partial output must not be silently reused, promoted, repaired, or treated as a
seed. It must be preserved without automatic deletion until the Architecture
Owner gives an explicit disposition. Preservation is historical failure
containment only and grants no readiness, retry, Runtime, or Evidence status.
Even after preparation succeeds, `.npm-cache` is a generated provenance output
and is not Dependency Readiness proof or a future Runtime input.

Every future Runtime invocation must be explicitly recorded as
`Global Physical Attempt #3`. It can become eligible for authorization only
after Dependency Readiness `PASS` and through a separate Owner-approved
Recovery Execution Contract. This Contract cannot authorize that invocation.

## 10. Evidence Contract

The minimum Evidence for one future approved preparation is:

- `PreparationId`, Contract ID, and explicit authority identity;
- Git HEAD, branch, status, Frozen Harness HEAD, Harness version, and Harness
  lock identity;
- frozen source path, size, and SHA-256 for `package.json` and
  `package-lock.json`;
- platform, architecture, Node, npm, and orchestration-shell identities;
- canonical absolute RecoveryRoot and prepared `node_modules` paths;
- the complete section 5 environment-variable state, Contract-owned empty
  npmrc identities, discovered project/parent `.npmrc` inventory, and frozen
  effective npm configuration;
- the exact `npm ci` materialization command and invocation count, plus the
  exact `npm ls --all --json` validation command and invocation count;
- network download-source summary for every request, including requested URL,
  requested origin, HTTP redirect chain, final download URL and host, resolved
  package identity, response result, and failure;
- for the Electron binary artifact: requested official URL, redirect chain,
  final URL/host, actual SHA-256, byte size, and canonical absolute cache path;
- official `SHASUMS256.txt` URL, its SHA-256
  `6e379d0be079aac68d3b441d9d66c2dbef534b05a3336c23c35019e5b2261b15`,
  and the exact matching line from section 6;
- npm exit code and bounded relevant log;
- raw `npm ls --all --json`, its exit code, normalized empty `problems`
  collection, missing/invalid/extraneous counts, and the exact list of normally
  omitted inapplicable optional/os/cpu packages;
- lockfile `hasInstallScript` inventory and actual lifecycle-script package,
  version, phase, command, exit result, and bounded output;
- Electron npm wrapper, binary ZIP, distribution, and executable identities;
- canonical `node_modules` inventory/manifest and aggregate SHA-256;
- complete lockfile package/resolution/integrity mapping result;
- every permitted write path and any attempted path escape;
- Electron Client, Shaco Forge, Harness Host, Worker, and product Runtime
  launch counts;
- start and end timestamps;
- first failure boundary;
- Shaco Forge and Frozen Harness worktree snapshots before and after.

Evidence must state that it is Dependency Preparation Evidence, not Runtime,
H-05, H-20, Formal, Diagnostic, or P0.S-7 Evidence. It must contain no secret,
credential, reusable authentication material, or unnecessary machine-private
data.

### 10.1 Evidence and Ledger Precedence

Raw Evidence is an immutable observation and must never be edited to reconcile
a later status. The Contract invocation ledger is authoritative for preparation
invocation count and first failure boundary within this Recovery action. A
later explicitly accepted governance ledger is authoritative for global
physical-Attempt count, authority, and accepted Dependency Readiness status.

Summary, fallback, cached, and derived convenience fields are lower-priority
views and cannot override either ledger. Any conflict must be disclosed by
recording both values and the controlling ledger; the raw Evidence remains
unchanged. Dependency Readiness, invocation count, and first failure boundary
must be interpreted under this precedence. No inconsistency may be resolved by
rewriting Evidence, hiding a consumed invocation, or promoting a fallback value
to governance state.

## 11. Result Classification

### PASS

All section 8 conditions are proved after the single authorized preparation
invocation. Stop, preserve bounded Evidence, and return to the Architecture
Owner with only the two positive readiness fields allowed by section 8.

### INCONCLUSIVE

The authorized preparation invocation began, but npm failed, a dependency or
integrity relation failed or could not be proved, Electron identity was absent
or mismatched, the actual Electron ZIP hash differed from its frozen official
SHA-256, an undeclared lifecycle script ran, source neutrality failed after
invocation, the manifest was incomplete, an allowed-write boundary failed, or
any other PASS condition was not proved. Stop and return to the Architecture
Owner. Preserve partial output under section 9. `INCONCLUSIVE` is not H-05/H-20
`FAIL` and authorizes no retry or Runtime.

### AUTHORITY_BLOCKED

The action lacks an Owner-approved and frozen execution authority, a required
pre-invocation identity or platform does not match, the isolated root cannot be
established, the one-invocation budget is unavailable, or a requested action
exceeds this Contract. The same classification applies when the environment or
effective npm config is not neutral, a project/parent `.npmrc` cannot be proved
non-participating, the lockfile declares an unapproved install script, or the
four-document governance synchronization required by section 4 is incomplete.
Do not invoke npm. Return to the Architecture Owner.
`AUTHORITY_BLOCKED` consumes no preparation invocation and is not H-05/H-20
`FAIL`.

This Contract is no longer `AUTHORITY_BLOCKED` solely by draft or Owner-approval
status. After the governance Freeze commit completes, exactly one Dependency
Preparation invocation is authorized; invocations used remain `0`, and
Dependency Readiness remains `NOT_RUN`. Every other pre-invocation
`AUTHORITY_BLOCKED` condition in this Contract remains binding.

Classification and counts follow section 10.1 ledger precedence. A summary or
fallback field can neither convert `INCONCLUSIVE` to `PASS` nor erase a started
preparation invocation or its first failure boundary.

## 12. Stop Conditions

Stop immediately and return to the Architecture Owner when:

1. the Contract is not explicitly Owner-approved and frozen for preparation;
2. any frozen Git, Harness, package, lockfile, Electron, platform, or authority
   identity fails its required check;
3. the Electron binary requested URL or filename differs from section 6, a
   redirect leaves the allowed official GitHub release-asset chain, checksum
   metadata differs, or the actual ZIP SHA-256 is not exactly
   `b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d`;
4. effective npm config, a project/parent `.npmrc`, registry, cache, mirror,
   custom Electron selector, proxy, TEMP/TMP, or another environment input
   violates the section 5 source-neutrality contract;
5. the lockfile or actual lifecycle-script inventory contains an install script
   other than the declared `electron@35.7.5` script;
6. a second preparation invocation or package-by-package retry is requested;
7. `npm ci` exits nonzero, `npm ls --all --json` reports a problem, or the full
   dependency closure cannot be proved;
8. a package upgrade, re-resolution, substitution, override, lockfile change,
   or manual patch is required;
9. the canonical manifest grammar cannot classify every leaf, detects a path
   escape/case-fold collision/duplicate, or cannot reproduce its aggregate;
10. a write occurs or is attempted outside the proposed generated root;
11. MEC-01 partial output, existing Evidence, or Quarantine is requested as an
   input or proof;
12. Electron Client, Shaco Forge, Harness Host, Worker, or product Runtime would
   start;
13. H-05/H-20 classification, `run-spike.ps1`, static Client preparation,
   Runtime verification, Diagnostic, Formal, or P0.S-7 is requested;
14. a Runtime invocation, relocation/redirection of the prepared tree, or Global
    Physical Attempt #3 is requested;
15. bounded, truthful Evidence or the required invocation ledger cannot be
    produced;
16. Dependency Readiness reaches one permitted final classification.

No stop condition converts into a technical H-05/H-20 result, an automatic
corrective run, a Runtime handoff, or new execution authority.

## 13. Future Recovery Runtime Handoff Boundary

A future Recovery Execution Contract may be planned only after Dependency
Readiness `PASS`. It must:

- reference the canonical absolute path of the prepared `node_modules` and the
  exact canonical manifest accepted by Dependency Readiness;
- consume that dependency tree in place from the same original absolute path;
- before Runtime, independently recalculate the complete section 8 canonical
  manifest from that original path and require its aggregate SHA-256 to match;
- reverify the frozen package/lock SHA-256 values, Electron npm wrapper,
  Electron binary ZIP requested-source and SHA-256 identity, installed
  distribution version, executable path, size, and SHA-256;
- STOP on any manifest, package, lock, Electron artifact, distribution, or
  executable mismatch;
- use the frozen prepared `node_modules` without running `npm ci`, rebuilding
  from `.npm-cache`, or invoking any other dependency materialization command;
- for the first Recovery Runtime, forbid moving or copying `node_modules` and
  forbid junction, symbolic-link, `NODE_PATH`, module alias, loader remapping,
  or any other redirection to or from another location;
- preserve H-05/H-20 semantics, the exact 23 REQUIRED plus 4 Support Closure
  roster, all four Cordis omission requirements, the 45-second timeout, and
  `STATIC_ARTIFACT_SEMANTIC_TRANSFORMATION = FORBIDDEN`;
- identify any Runtime invocation as `Global Physical Attempt #3`.

If a later design requires relocation or redirection, another explicit Contract
must authorize that design and establish a new complete Dependency Readiness
result at the new topology. It cannot reuse or inherit this preparation PASS.

Whether a runner may be modified, the exact future Runtime command, and the
Runtime Attempt budget are outside this Contract and must be decided by that
separate Owner-approved Recovery Execution Contract. Dependency Readiness
`PASS` supplies a planning prerequisite only. This Contract selects and authorizes
no Runtime command.

## 14. Explicit Exclusions

This Contract does not authorize:

- Electron Client launch;
- `run-spike.ps1`;
- `prepare-static-client.mjs`;
- `verify-evidence.mjs`;
- Worker, Harness Host, Named Pipe, authentication, or Provider activity;
- H-05/H-20 Runtime or classification;
- a third physical Attempt or any other Runtime Attempt;
- modification of `package.json`, `package-lock.json`, resolved versions, or
  package metadata;
- use of MEC-01 partial `node_modules`, `.npm-cache`, or `runtime-data` as
  readiness input or proof;
- use of `.npm-cache` as offline-reinstall readiness proof or Runtime input;
- Electron mirrors, registry overrides, proxies, custom Electron artifact
  filename/version/directory, or unofficial artifact rehosting;
- relocation, copying, linking, aliasing, or redirection of a Dependency
  Readiness PASS tree into the first Recovery Runtime;
- Quarantine access or use;
- Formal, Diagnostic, P0.S-7, production implementation, or product Gate
  change;
- Commit of experiment outputs or Evidence;
- Push.

## 15. Owner Approval and Freeze Fields

- `P0S6_DRRC_CORRECTIVE = PASS`
- `P0S6_DRRC_F01_ELECTRON_BINARY_IDENTITY = APPLIED`
- `P0S6_DRRC_F02_MANIFEST_GRAMMAR = APPLIED`
- `P0S6_DRRC_F03_OFFLINE_PROOF_SUPERSEDE = APPLIED`
- `P0S6_DRRC_F04_IN_PLACE_HANDOFF = APPLIED`
- `P0S6_DRRC_F05_SOURCE_NEUTRALITY = APPLIED`
- `P0S6_DRRC_L01_LEDGER_PRECEDENCE = APPLIED`
- `P0S6_DRRC_CORRECTIVE_REREVIEW = PASS`
- `P0S6_DRRC_F01 = CLOSED`
- `P0S6_DRRC_F02 = CLOSED`
- `P0S6_DRRC_F03 = CLOSED`
- `P0S6_DRRC_F04 = CLOSED`
- `P0S6_DRRC_F05 = CLOSED`
- `P0S6_DRRC_L01 = CLOSED`
- `P0S6_DRRC_NEW_REQUIRED_FINDINGS = 0`
- `P0S6_DRRC_OWNER_DECISION = APPROVE_FOR_DEPENDENCY_PREPARATION_ONLY`
- `P0S6_DRRC_STATE = FROZEN_OWNER_APPROVED`
- `P0S6_DRRC_FREEZE_HEAD_POLICY = COMMIT_CONTAINING_OWNER_APPROVED_DRRC_AND_GOVERNANCE_SYNC`
- `P0S6_DEPENDENCY_PREPARATION = AUTHORIZED_SINGLE_INVOCATION`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_USED = 0`
- `P0S6_DEPENDENCY_READINESS = NOT_RUN`
- `P0S6_READY_FOR_DEPENDENCY_PREPARATION = YES`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`
- `P0S7_ALLOWED = NO`
- `P0S6_DRRC_PUSH = NOT_AUTHORIZED`
