# P0-1 Harness Baseline Manifest

Status: FROZEN  
Step: P0-1  
Verdict: PASS  
SelectedAt: 2026-08-29T22:28:27+08:00  
EvidenceClass: HARNESS_BASELINE_MANIFEST

This file is the Shaco Forge V1.0 exact DeepSeek Harness baseline identity.

After P0-1 PASS, this exact baseline is the official upstream pin for:

P0, P0.S, P0.5, P1, P2, P3, P4, P5, P6A, P6B, P7, P8.

Without a new Architecture Decision, the following are forbidden:

- `git pull master` on the pinned worktree for the purpose of tracking latest
- automatically following newest Harness
- `pnpm update`
- lockfile mutation
- switching Harness SHA
- modifying upstream source and still calling it this frozen baseline

## Frozen Identity

| Field | Value |
|---|---|
| HarnessRepository | `https://github.com/deepseek-ai/deepseek-harness.git` |
| HarnessBranch | `master` |
| HarnessCommit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| HarnessCommitDate | `2026-08-28T00:57:43+08:00` (`2026-08-27T16:57:43Z`) |
| HarnessCommitSubject | `Merge pull request #3248 from deepseek-harness/release/dsh-0.1.2-alpha.1` |
| HarnessRelease | git tag `dsh-v0.1.2-alpha.1` (exact match on HEAD) |
| HarnessPackageVersion | `0.1.2-alpha.1` (`@deepseek-ai/dsh` and `@deepseek-ai/dsh-root`) |
| RequiredNodeVersion | `^22.19.0 \|\| >=24.0.0` (`engines.node` in root `package.json`) |
| CurrentLocalNodeVersion | `v24.18.0` |
| PnpmVersion | required `pnpm@11.7.0` (`packageManager`); local pnpm `NOT_ON_PATH` |
| TypeScriptVersion | declared `^6.0.3`; lockfile pin `typescript@6.0.3` |
| Lockfile | `pnpm-lock.yaml` (`lockfileVersion: '9.0'`, size 765312 bytes) |
| pnpm-lock.yaml SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| HarnessDistribution | `git-worktree` |
| WindowsVersion | Microsoft Windows 11 专业版 `10.0.26200` (Build 26200) |
| CpuArch | AMD64 / X64 |
| UpstreamWorktreeStatus | CLEAN |
| UpstreamRemoteOrigin | `https://github.com/deepseek-ai/deepseek-harness.git` |
| UpstreamPath | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| CHANGED_SINCE_PREVIOUS_AUDIT | NO |

Previous audit reference (not itself the freeze until this file existed):

- commit `cd5ef8148158c3a752a658978873241fdf8e2bbc`
- release `dsh@0.1.2-alpha.1`

This P0-1 freeze re-confirmed the same official `master` SHA and package version from a fresh official clone plus GitHub REST verification. It does not copy the old SHA from memory.

## Verification

| Check | Result |
|---|---|
| Official remote URL is `deepseek-ai/deepseek-harness` | YES |
| Worktree is not a fork / mirror / third-party tree | YES |
| `HEAD` == `origin/master` | YES (`0 0` left-right count at clone time) |
| GitHub REST `GET /repos/deepseek-ai/deepseek-harness/commits/master` SHA | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Local source modifications | NONE |
| P0-1 build performed | NO (identity capture did not require build) |
| Lockfile mutated | NO |

## Post-clone fetch note

A later `git fetch origin master` / `git ls-remote` from this machine failed with:

`schannel: failed to receive handshake, SSL/TLS connection failed`

The freeze still used official identity because:

1. The worktree was created by cloning `https://github.com/deepseek-ai/deepseek-harness.git` immediately before inspection.
2. GitHub REST confirmed live official `master` SHA equals local `HEAD`.

The upstream worktree was not modified to work around TLS.

## Gate Snapshot At Freeze

```text
HARNESS_OFFICIAL_REMOTE_VERIFIED = YES
HARNESS_EXACT_COMMIT_CAPTURED = YES
HARNESS_PACKAGE_VERSION_CAPTURED = YES
HARNESS_LOCKFILE_IDENTITY_CAPTURED = YES
HARNESS_RUNTIME_REQUIREMENTS_CAPTURED = YES
WINDOWS_BASELINE_CAPTURED = YES
CPU_ARCH_CAPTURED = YES
UPSTREAM_WORKTREE_CLEAN = YES
HARNESS_BASELINE_MANIFEST_WRITTEN = YES
P0_BASELINE_FROZEN = YES
SHACO_FORGE_V1_0_P0_1 = PASS
SHACO_FORGE_V1_0_P0 = NOT_PASS
```

P0-2 through P0-7 were not executed.
