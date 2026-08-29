# Shaco Forge Security Model

Status: ACTIVE-PRE-P1

## Primary Trust Boundary

The highest-risk component is the Worker, because it may access filesystem, shell, tools, credentials, plugins, provider network and child processes.

## Renderer Baseline

- `nodeIntegration = off`
- `contextIsolation = on`
- sandbox enabled
- preload allowlist only
- no arbitrary IPC invoke
- controlled custom scheme candidate
- external navigation/openExternal/clipboard/drag-drop restricted

## Local Carrier Baseline

P0.S/P1 must prove/freeze:

- current Windows user SID ACL
- Renderer cannot access Worker pipe directly
- Worker identity != PID-only identity
- endpoint / stale-worker handling
- compatibility handshake before Agent write path
- Browser cookie is not the product identity for Named Pipe
- payload limits / framing / DoS controls

## Worker Baseline

- run as current user, not Windows System Service in V1.0
- Windows sandbox semantics must be evaluated as Windows ACL/restricted-token behavior, not Linux Landlock assumptions
- credentials remain Worker/Harness-side
- logs/support artifacts redact secrets
- capability child environment policy must be defined in P1

## Plugin Baseline

V1.0 release default: official in-box composition only. Arbitrary external plugin trust/isolation is not a product promise.
