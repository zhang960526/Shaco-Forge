# P0.S-5 Desktop Independence and Reconnect Spike

Classification: `NOT_PRODUCTION`

This directory contains the disposable Windows-only P0.S-5 proof. It keeps
the authoritative Frozen Harness Host in an external Worker process tree and
uses Electron only as a projection client:

```text
sandboxed Renderer
  -> allowlisted preload IPC
  -> Electron Main
  -> authenticated current-user Named Pipe
  -> Worker Carrier
  -> inherited child stdio
  -> frozen dsh Host
```

The formal runner proves whole-Desktop close and crash independence,
single-instance ownership, reconnect without Agent resume, approval and
question replay safety, and a real Worker process-tree force-kill/restart while
the same Electron OS process remains alive. Graceful Worker stop is recorded
separately and is never used to derive the Worker crash/restart hard gate.

The Frozen Harness exposes Connection Client behavior, generation/client
identity, real `$events.ready`, Gateway, and Host lifecycle seams. It does not
emit a named reset wire event. Real transport loss, Worker identity changes,
authenticated generation replacement, and real ready events causally drive a
test-owned Desktop-equivalent projection invalidation, repull request, and Host
truth rebuild. These adapters are `NOT_PRODUCTION`.

Run from PowerShell 7 on Windows:

```powershell
./run-spike.ps1 -FrozenHarnessRoot D:\Project\Shaco-Forge-Upstream\deepseek-harness
```

The run is non-interactive (`USER_UI_ACTIONS_REQUIRED = NONE`). Synthetic UI
actions are dispatched through the real Renderer, preload, Main, Carrier, and
Gateway path. The runner writes one run-scoped set of raw records under
`evidence/`; `verify-summary.ps1` derives all gates from those records.
