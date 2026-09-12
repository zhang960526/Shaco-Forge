# BUG-S3S2-001 — Windows credential atomic rename refusal in cumulative regression

Status: OPEN / NON_BLOCKING_CARRY_FORWARD

Review Disposition: `NON_BLOCKING_CARRY_FORWARD` by
[REVIEW-030](../../05-reviews/architecture/AUDIT-030-V1-SLICE-3-STEP2-PRE-SIGNING-INDEPENDENT-REVIEW.md)

Carry-forward Target: `Slice3 Step3 cumulative observation + Slice4 Fresh Windows real acceptance`

## Discovered At / Phase

2026-09-12, V1-SLICE-3 Step2 non-Provider cumulative regression of the frozen Slice2 Step3 UI.
This incident is not an authorization to start Slice3 Step3 or modify Frozen Harness.

## Severity / Impact

Medium: the cumulative gate failed while saving or removing a synthetic local credential.
The UI displayed the existing save-failure message and did not claim successful persistence.
No Provider call, production credential operation or secret-value diagnostic occurred.
Final non-human acceptance still requires the original UI assertions to pass; this record is not a gate waiver.

## Symptom / Expected / Actual

Expected: the public credential mutation acknowledges success, then the UI projects its configured status.
Observed formal attempts 1, 2 and 3 failed at CREDENTIAL_UNSET; attempt 6 failed at CREDENTIAL_SET.
Earlier intervening diagnostics and formal attempt 5 passed without Product/Harness source changes.
All failures and process cleanup are retained in the [Step2 attempt ledger](../evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/test-summary.json).

## Root Cause Evidence

An explicit non-shipped observer of completed public RPC responses reproduced an unset failure:
`credentials/unset` returned `ok:false`, code `credential-rejected`, with Windows `EPERM` on the
same-directory rename of the temporary credentials YAML over the existing credentials YAML.
The observed target had Archive attributes, not ReadOnly. No file contents were read for that check.

The rejected rename is confirmed. The process or filesystem condition that refused replacement is
NOT_ESTABLISHED; antivirus, watchers and UI scheduling are not asserted as proven causes.
The error is in the frozen public persistence call and is accurately surfaced by the Shaco UI.
The earlier set/unset timeouts did not capture their RPC errors and cannot all be retrospectively assigned this cause.

Exact reproduction evidence: [diagnostic run](../evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/credential-diagnostic-v2-1789145476693/diagnostic-result.json)
and its `step2/credential-rpc-*.json` files. These contain public metadata/error messages, never credential values.

## Attempts / Mitigation

1. Earlier public-RPC and debugger diagnostics passed but did not establish the intermittent failure source.
2. Completed-RPC observation with the original UI timing reproduced the rejected rename under the checkout's
   `node_modules/.step2-runtime-*` fixture. The diagnostic failed and cleaned all test authority processes.
3. The same diagnostic runner and original UI assertions passed with only the mutable fixture relocated to
   OS temp `shaco-forge-slice2-cumulative-*`. Full cold attach, Desktop crash, Carrier recovery, Worker replacement
   and cleanup passed in [the relocated diagnostic](../evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/credential-diagnostic-v2-1789145620575/diagnostic-result.json).
4. The non-shipped cumulative test runner now uses that external temporary root to separate mutable test data
   from checkout/package discovery and watchers. Production files, Frozen Harness and UI assertions are unchanged.
   Full source-bound final regression after this test-source change passed on inventory 4d0c14740d3adc4216690d27b167397e13b6f7cf177d0419fc03de7db747dc39. The observed platform issue remains OPEN.

## Why This Is Not a Closure

Changing fixture location is a test-isolation improvement, not a proved fix to the platform's replacement behavior.
There is no automatic credential replay, retry-until-success inside the gate, disabled assertion, file-write
monkey patch, modified Harness or host security setting. A final PASS records that run's result only.
If a production recurrence requires a Frozen Harness correction, the executor must stop for Architecture Owner.

## Regression / Architecture Impact

Use the same-source final `smoke:slice2-step2`, `smoke:slice2-step3`, interactions/full-Shaco and Step2 gates
listed in the [final command matrix](../evidence/V1-SLICE-3/STEP-2/S3STEP2-20260911-SAFETY-01/FINAL-COMMAND-MATRIX.md).
No contract or ADR change is proposed. Owner assessment must retain the Windows rename recurrence risk.

## Closure Evidence

None. OPEN; no root-process identification or production-platform fix is claimed.

The Windows `EPERM` rename was observed in the checkout/node_modules fixture and the
same chain passed after OS-temp isolation. Production Known Folder reproduction evidence
does not exist. The failure explicitly rejects rather than silently corrupting data, and
the responsible process/filesystem condition remains unproven. If a future production-path
reproduction requires a Frozen Harness change, stop for the Architecture Owner. REVIEW-030
does not close this bug.
