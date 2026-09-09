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

## V1 Local Trust Principal

```text
LOCAL_TRUST_PRINCIPAL = CURRENT_WINDOWS_USER_SID
```

`CURRENT_WINDOWS_USER` is the V1 local inter-process OS security principal.
Product binary identity is `NOT_V1_LOCAL_AUTHORIZATION_ROOT`.

## V1 Same-User Boundary

```text
SAME_USER_HOST_COMPROMISE = OUT_OF_SCOPE
```

This class includes deliberate legal-protocol impersonation by a same-SID
process, same-SID attack topology using an internal Product binary,
`PROCESS_VM_READ`, `PROCESS_VM_WRITE`, `PROCESS_DUP_HANDLE`, debugger/injection
access, theft of memory/secrets/handles from a legitimate Product process, a
compromised current-user token and deliberate same-SID denial of service.

If resistance to this class is required in the future, it triggers a Whole-V1
OS-principal isolation reassessment. It is not a local Step 1 requirement.

## Authenticated Carrier Meaning

```text
AUTHENTICATED_CARRIER = USER_BOUNDARY + FRESH_CAPABILITY_POSSESSION
WORKER_AUTHORITY_IDENTITY = workerInstanceId
PROCESS_INSTANCE_BINDING = actual PID + process start time
AUTHORITY_EXCLUSIVITY = Helper mutex + FirstPipeInstance + Worker Job
PRODUCT_BINARY_IDENTITY = NOT_V1_LOCAL_AUTHORIZATION_ROOT
```

The current-user-only OS boundary and fresh per-attachment capability form the
V1 Carrier authentication claim. PID plus process start time binds a concrete
process instance and protects against PID reuse; it is not Product binary
identity.

Renderer remains untrusted. Its isolation comes from its sandbox, the narrow
Main/Preload allowlist and zero direct lifecycle/Carrier access, not from a
different Windows SID.

## Worker Baseline

- run as current user, not Windows System Service in V1.0
- Windows sandbox semantics must be evaluated as Windows ACL/restricted-token behavior, not Linux Landlock assumptions
- credentials remain Worker/Harness-side
- logs/support artifacts redact secrets
- capability child environment policy must be defined in P1

## Plugin Baseline

V1.0 release default: official in-box composition only. Arbitrary external plugin trust/isolation is not a product promise.
