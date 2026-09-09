# V1-SLICE-2 Step 1 Control Server Attestation Source Confirmation

Document Type: SOURCE_CONFIRMATION_RECORD
Status: PASS
Run ID: STEP1-20260909-SERVER-ATTESTATION-01
Date: 2026-09-09 (Asia/Shanghai)

## A. Source confirmation result

SOURCE_CONFIRMATION_RESULT = PASS

GET_NAMED_PIPE_SERVER_PROCESS_ID_EXECUTION = PASS
SERVER_PID_MATCH = PASS
SERVER_PROCESS_START_MATCH = PASS
SERVER_EXECUTABLE_PATH_MATCH = PASS
CURRENT_USER_PROTECTED_PIPE = PASS
SERVER_IDENTITY_MISMATCH_REJECTED = PASS
CONTROL_SERVER_ATTESTATION_SOURCE_CONFIRMATION = PASS

## B. Baseline

- Product branch: master
- Product HEAD: 20864fbd3c545eacc3baefd68faf71330a3d2d53
- Initial tracked diff: NONE
- Initial staged diff: NONE
- Frozen Harness HEAD: cd5ef8148158c3a752a658978873241fdf8e2bbc
- Frozen Harness state: CLEAN
- Existing eleven untracked diagnostic/evidence files: preserved without modification

## C. Diagnostic execution

The diagnostic server was a child PowerShell process explicitly started and tracked by the probe. The parent probe process connected as the Named Pipe client. From its own connected client handle, it called `GetNamedPipeServerProcessId`, then used the returned PID with `OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION)`, `QueryFullProcessImageNameW`, and `GetProcessTimes`.

- Attempts: 1
- Distinct approaches: 1
- Client connection: ESTABLISHED
- Actual server PID: 55008
- Observed server PID: 55008
- Actual canonical executable path: `C:\Users\18902\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe`
- Observed canonical executable path: `C:\Users\18902\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe`
- Actual creation time identity (UTC FILETIME): 134333950536800077
- Observed creation time identity (UTC FILETIME): 134333950536800077

The positive expected identity was accepted. A deliberately incorrect expected PID, creation time, and executable path were passed through the same verification function and rejected.

## D. Pipe security

The diagnostic server created the Named Pipe with the explicit SDDL form `O:<current-user-SID>D:P(A;;GA;;;<current-user-SID>)`. Runtime inspection of the pipe kernel object's security descriptor established:

- Owner SID matches current user: YES
- DACL protected: YES
- Explicit ACE count: 1
- All allowed ACEs scoped to current user: YES
- Inherited ACE present: NO
- Everyone or Authenticated Users ACE present: NO

The random diagnostic pipe name is omitted from evidence.

## E. Process hygiene

The diagnostic server exited naturally with exit code 0. Remaining probe process PIDs: NONE. The probe did not terminate any unrelated process.

No Electron Product Desktop, Worker, Harness Host, Native Carrier production Helper, Provider, Agent turn, Prompt, or Tool was started. No Product runtime scenario or `smoke:user-loop` was executed.

## F. Scope boundary

This record confirms only the execution availability and composition of the Windows API/process-identity primitive for a connected Named Pipe client handle.

It is not:

- a Product identity implementation;
- a Step 1 implementation PASS;
- a fake-server Product runtime PASS;
- an Independent Review;
- a Frozen Contract change.

No Product source, Frozen Contract, or Frozen Harness file was modified. No dependency was added. No file was staged, committed, or pushed.

## G. Evidence

Evidence root: `D:\Project\Shaco-Forge\docs\04-development-records\evidence\V1-SLICE-2\STEP-1\STEP1-20260909-SERVER-ATTESTATION-01`

Required evidence files:

- `run-manifest.json`
- `server-attestation-result.json`
- `test-summary.json`
- `redaction-summary.json`

## H. Next action

NEXT_ACTION = PERSIST_STEP1_DESKTOP_PRODUCT_IDENTITY_BINDING_DECISION

Stop after this bounded source confirmation. Do not resume Step 1 implementation from this record alone.
