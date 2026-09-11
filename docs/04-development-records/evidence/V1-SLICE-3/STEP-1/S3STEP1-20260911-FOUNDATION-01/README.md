# Slice3 Step1 implementation evidence

Run: `S3STEP1-20260911-FOUNDATION-01`

Status: `PASS / IMPLEMENTED_WAITING_INDEPENDENT_REVIEW`

This directory records Executor implementation and testing. It is not an
Independent Review, Owner closure, immutable Slice3 RC or Fresh Windows acceptance.

[Entry baseline](entry-baseline.json) records the clean entry commit, frozen
Contract and read-only Harness. [Test summary](test-summary.json) is the append-only
attempt ledger; command logs and per-attempt results are under `logs/` and `runs/`.
Failed attempts remain evidence, even after a correction succeeds. Development
packages and startup probes do not substitute for the complete final dedicated gate.

The first staged whitespace check found extra blank EOF lines in six successful
command logs. [Its failure](staging-whitespace-attempt-1.json) is retained.
[Exact original log bytes](raw-command-log-bytes.json) are preserved losslessly as
Base64 with SHA-256 and byte counts; only the readable `.log` copies have their EOF
normalized. Each archive entry also binds its display copy digest. Failed command
logs, Product source and packaged bytes are unchanged by this presentation fix.

The packaging runs retain release, file and artifact identity manifests plus the
implementation source inventory. The artifact identity binds actual release files
and both manifest digests, without claiming a signed installer identity. Generated
binary packages are local build outputs under the recorded `dist/packaging/` path.

## Environment and packaging diagnostics

- The sandbox account's known-folder/profile mismatch was rejected. In the normal
  Codex child context, native and asynchronous `realpath` exposed MSIX LocalCache
  redirection; the product correctly rejected it. See the `home-*-diagnostic.json`
  records. The logical path returned by JavaScript's non-native synchronous helper
  was insufficient evidence and was not accepted as a product correction.
- `failed-desktop-policy-driver.ps1` preserves the unsuccessful documented Windows
  process-policy experiment. It did not solve this host's virtualization.
- The test-only `scripts/windows-desktop-test.ps1` obtains the existing current-user
  Explorer desktop automation object and launches a hidden bounded test driver.
  This follows Microsoft's [Explorer launch method](https://devblogs.microsoft.com/oldnewthing/20131118-00/?p=2643).
  Product code does not use Explorer or change its home policy. Launch receipts
  record actual results. This is the current machine, not Fresh Windows acceptance.
- `profile-resolution-diagnostic.json` records a real `MODULE_NOT_FOUND` from the
  original release profile location. The profile now lives under `harness/profiles/`
  so ordinary Node resolution reaches sealed `harness/node_modules/` dependencies.
- `native-cache-diagnostic.json` records an attempted native dependency cache write
  under the deliberately wrong ambient LOCALAPPDATA fixture. The frozen dependency
  already supports `NARB_DISABLE_NATIVE_CACHE=1`; packaged Host environment now
  forces that setting and removes ambient NARB overrides. No upstream bytes are
  patched. The temporary failed-attempt cache was removed within its verified scope.

- Startup probe 4 reached real packaged Worker/Host readiness, then Desktop exceeded
  its 150-second test timeout during repeated serial integrity scans. Its first
  cleanup also failed while the detached Worker finished initialization. The failed
  ledger is preserved. `recover-probe-4.ps1` and `probe-4-recovery.json` record the
  subsequent exact PID/start-time/image verification, process-tree termination and
  deletion of only that attempt's new home and Electron profile.
- Hashing now uses at most eight concurrent readers, still hashing every byte and
  sorting the final inventory deterministically. `inventory-performance.json`
  verifies all 44,240 entries unchanged in 11.5 seconds on this machine. No cached
  digest is accepted. Dedicated cleanup now retries authenticated discovery within
  one bounded window. The profile-path evidence is also checked against the actual
  canonical profile junction instead of relying on the logged label alone.

- Cumulative `smoke:slice2-step2` attempt 1 timed out because the old evidence
  driver dereferenced `userLoop.evidence` while the ordinary full observer was
  absent. Its retained `failed-connected-snapshot.json` shows Product CONNECTED
  but no Renderer snapshot. The Step2 and Step3 explicit test drivers now opt in
  to full bounded observation. They keep the existing prompt-count assertions;
  missing observation is not silently treated as proof of zero prompts. The
  complete final-source regression is rerun after this fixture correction.

## Scope

Post-gate cleanup attempt 1 removed the bounded current-run test directories and
archived the final Electron screenshots, then stopped before deleting a failed
install store because pnpm had also created an unexpected `files/` directory.
[The failed assertion and effects](cleanup-attempt-1.json) and
[original driver](cleanup-attempt-1-driver.mjs) are retained. The failed driver did
not emit a per-path removal receipt. Recovery verified zero remaining temporary
roots in the same name/time scope, rechecked archived screenshots and zero Product
processes, and inspected every store directory for canonical paths, reparse points,
empty contents and creation within the failed install's time window. Only that
generated store was then removed. [Final cleanup](final-cleanup.json) records PASS;
the binary package and intermediate build outputs remain available for review.

Provider calls: **0**. Signing calls: **0**. No installer transaction, update,
backup/restore, uninstall, Step2, Slice3 Step3, Slice4, Independent Review or closure
is performed. F-05 remains open and its CSP is unchanged. NF-4 remains deferred;
the Carrier public contract and 262144-byte frame cap are unchanged.

Final-source gates passed. See [complete report](final-report.md), [file list](modified-files.json), [Executor consistency check](final-validation.json), [cleanup](final-cleanup.json) and [review handoff](review-handoff.md).
