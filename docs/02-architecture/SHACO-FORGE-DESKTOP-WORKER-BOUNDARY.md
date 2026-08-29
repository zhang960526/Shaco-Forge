# Desktop / Worker Boundary

Status: ACTIVE-PRE-P1

## Desktop May

- render Harness-derived state
- initiate requests through supported Client/Host contract
- request approval/cancel/user actions
- manage windows/native picker/clipboard/notification/external-link through allowlisted native bridge
- start/discover/stop Worker through Supervisor

## Desktop Must Not

- declare Agent success independently
- mutate Harness Session directly outside supported Host contract
- execute production tools itself
- own credentials
- become durable runtime truth
- replay side-effect commands after ambiguous disconnect without querying Host state

## Worker Owns

- Harness Host lifecycle
- runtime authority
- session/persistence execution
- tool/approval/subagent/workflow runtime
- product control-store access
- capability child process ownership
- graceful drain/stop/update boundaries

## Product Exit Semantics

- Close Window: UI closes; Worker continues.
- Stop Worker: stop background runtime; Desktop may remain open and show stopped state.
- Exit Shaco Forge: graceful stop Worker + close Desktop.

These semantics are accepted and must be formalized in P1/P8.
