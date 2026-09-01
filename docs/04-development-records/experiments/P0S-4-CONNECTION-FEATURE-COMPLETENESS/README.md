# P0.S-4 Connection Feature Completeness Spike

Classification: `NOT_PRODUCTION`

This directory contains a disposable Windows-only proof for the frozen
P0.S-4 Connection contract. It extends the P0.S-3 carrier shape without
modifying P0.S-3 or the frozen Harness checkout:

```text
sandboxed Electron Renderer
  -> one allowlisted preload method / Electron IPC
  -> Electron Main
  -> authenticated Windows Named Pipe
  -> protected-current-user carrier helper
  -> inherited child stdio
  -> dsh --profile shaco-host
  -> public/preview Connection, Gateway, Remote and exact Fetch seams
```

The runner proves real Harness unary dispatch; complete stream lifecycle,
error, cancellation, concurrency, connection-loss and backpressure behavior;
`$events` generations and their causal Desktop projection resets; approval and user-question replay safety; explicit
`session/cancel`; exact binary bytes; and Electron's documented native
directory picker. Negative authentication, framing, route and binary cases
must fail closed.

The Named Pipe remains `SHACO_CUSTOM_CARRIER_PLUGIN`. The carrier, Electron
adapter, deterministic Remote/exact fixture and desktop generation adapter are
all `NOT_PRODUCTION`. They use package-root or preview/public Harness seams and
do not patch Harness Core or change the frozen Desktop + Worker architecture.

The frozen Harness does not emit a wire event named `connection/reset` in this
proof. Each valid real `$events.ready` is instead the sole cause of one
test-owned Desktop-equivalent projection invalidation and repull request. The
adapter allocates the generation only after ready arrives and records the
ready client hash, generation, reset action, invalidation, and repull causal
links. Summary counts are derived from those records rather than constants.

## Run

Run from PowerShell 7 on Windows:

```powershell
./run-spike.ps1 -FrozenHarnessRoot D:\Project\Shaco-Forge-Upstream\deepseek-harness
```

The test is intentionally interactive only for the real native-picker gate.
When `P0.S-4 Directory Success` appears, the user must choose the current run's
already-selected temporary `workspace` directory. When `P0.S-4 Directory
Cancel` appears, the user must cancel it. The runner does not synthesize either
UI action and no project or private directory should be selected.

The Electron window otherwise stays hidden. Its sandboxed Renderer is a
self-contained `data:` document with a `default-src 'none'` CSP, injected only
with the fixed one-shot bridge call by Electron Main. Renderer evidence records
that Node globals, pipe details, transport handles, credentials and arbitrary
filesystem capabilities are absent.

The runner writes a redacted machine result to `evidence/summary.json`. It does
not persist the ephemeral authentication secret, current-user SID or complete
pipe endpoint. It also records SHA-256 values for every experiment source file
outside `evidence/`.

Each Electron run also creates
`<TEMP>/shaco-forge-p0s4-<runId>/p0s4-runtime-marker.json`, binding the exact
directory name and run ID to the `SHACO_FORGE_P0S4_RUNTIME` marker. Corrective
cleanup must first resolve and validate exact paths, persist repository
evidence, confirm process exit, and only then remove those runtime directories.

Verify the final evidence independently:

```powershell
./evidence/verify-summary.ps1
```

The verifier checks every recorded gate, exact binary sizes, replay-safe
settlement counts, bounded queues/credits/chunks, process cleanup, frozen
Harness cleanliness, redaction flags and all recorded source hashes.
