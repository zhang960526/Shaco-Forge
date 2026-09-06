# P0.S-6 Minimal Client Modules

Status: `NOT_PRODUCTION`  
Contract: `P0S6-MEC-20260903-01`  
Slice: `ONE_FIXED_CLIENT_BOOT_SLICE`

This bounded spike tests only H-05 and H-20. It statically assembles the exact
23 REQUIRED Client modules plus the four frozen Support Closure modules from
the real built artifacts at Frozen Harness commit
`cd5ef8148158c3a752a658978873241fdf8e2bbc`.

The product graph omits `cordis-host-runner` runtime activation,
`cordis-client-runner`, `ui-cordis`, and `tool-cordis`. The existing
`api-remotes/client` descriptor contribution for `cordis-host-runner/remote`
is inventoried as static BFF metadata, not runner activation.

The shell uses the accepted P0.S-2 Electron 35.7.5 custom-scheme and
`AppWebEntry` boot seam with `nodeIntegration=false`, `contextIsolation=true`,
and `sandbox=true`. Client bundle bytes are copied without semantic patching.
The vendored Cordis loader's existing dynamic evaluator therefore requires a
bounded `script-src 'unsafe-eval'` CSP allowance in this disposable shell; the
spike records that implementation constraint instead of transforming the
artifact.

The only authorized top-level command is:

```powershell
pwsh -NoProfile -File .\run-spike.ps1 -AttemptId <new-uuid>
```

One invocation consumes Primary Attempt #1. Do not run a smoke invocation,
the internal preparation script, Electron, or the verifier separately.

