# P0.S-3 Local Carrier + Trust Spike

Classification: `NOT_PRODUCTION`

This directory contains a disposable Windows-only feasibility probe for:

```text
Electron Renderer
  -> allowlisted preload / Electron IPC
  -> Electron Main
  -> Windows Named Pipe (length-prefixed JSON)
  -> NOT_PRODUCTION current-user ACL carrier helper
  -> inherited child stdio
  -> dsh --profile shaco-host
  -> Harness Typert Gateway
```

The Named Pipe is classified as `SHACO_CUSTOM_CARRIER_PLUGIN`. The carrier
helper and deterministic basic-stream producer are Spike adapters, not
production components. Unary calls use the frozen Harness Gateway
`agentPresets/list` path. The stream probe proves only concurrent framing,
ordering, and channel isolation; it does not prove the P0.S-4 stream contract.

Run from PowerShell:

```powershell
./run-spike.ps1 -FrozenHarnessRoot D:\Project\Shaco-Forge-Upstream\deepseek-harness
```

The runner writes a redacted machine result to `evidence/summary.json`. It
never persists the ephemeral authentication secret or the complete pipe path.

