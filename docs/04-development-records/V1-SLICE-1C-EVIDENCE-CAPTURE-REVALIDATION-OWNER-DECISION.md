# V1-SLICE-1C Evidence Capture Revalidation Owner Decision

Decision ID: V1-SLICE-1C-EVIDENCE-CAPTURE-REVALIDATION-20260908-01
Document Type: OWNER_CORRECTIVE_REVALIDATION_DECISION
Status: OWNER_APPROVED_BOUNDED_ONE_TIME
Date: 2026-09-08
Authority source: Architecture Owner's explicit decision in the current implementation task.

## Decision

EVIDENCE_CAPTURE_REVALIDATION_SCOPE_CONFIRMATION = APPROVED
CORRECTIVE_REVALIDATION_ATTEMPT = ATTEMPT_2
TOTAL_REAL_SESSION_ATTEMPT_CAP = 2
ATTEMPT_1 = CONSUMED
ATTEMPT_1_HISTORY = IMMUTABLE
ATTEMPT_1_GATE_RESULT = NOT_PROVEN
ATTEMPT_1_FAILURE_CLASS = EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE
ATTEMPT_2 = AUTHORIZED_ONCE
ATTEMPT_2_PURPOSE = FRESH_END_TO_END_LIVE_EVIDENCE_REVALIDATION
ATTEMPT_3 = PROHIBITED
ARCHITECTURE_CONTRACT_CHANGE_REQUIRED = NO
PRODUCT_ARCHITECTURE_CHANGED = NO
BUDGET_EXPANSION = NO
STAGING = NO
COMMIT = NO
PUSH = NO
INDEPENDENT_REVIEW = NOT_STARTED

This is a one-time corrective evidence revalidation using the remaining second
and final real Session attempt. It is not a MODEL_TOOL_SELECTION_NOT_OBSERVED
retry. The ordinary retry rule remains unchanged. No approval of architecture
changes, Multi-Agent, direct business RPC, a second Client/Remote, or closure is
provided. No PASS is inferred from this decision.

## Baselines and immutable first attempt

Product: D:/Project/Shaco-Forge, branch master, HEAD 2dcc47ff6ca393a4334cc6d7135d8c0b38f2f854.
Frozen Harness: D:/Project/Shaco-Forge-Upstream/deepseek-harness, clean detached
HEAD cd5ef8148158c3a752a658978873241fdf8e2bbc, packages 0.1.2-alpha.1.
Toolchain: Node 22.19.0, Electron 35.7.5.

Attempt #1 run: 54e248ff-305c-4fa3-bcab-a616872a0a3f.
Session hash: 2a1f4d236134f09e76ed251cd1efd14f66e41f0c3d1398596e8cde841fdce809.
Request hash: f82f27992130808a93238aa4cd1e26c17a61a6d9ec13a27b38fcf7d731638779.
Its original ledger row, reported Provider-timeout outcome and existing diagnostic
correction remain unchanged. Owner failure classification is supplementary
reconciliation metadata, never a rewrite of the original row.

| Immutable artifact under evidence/V1-SLICE-1C/runtime | Bytes | SHA-256 |
|---|---:|---|
| 54e248ff-305c-4fa3-bcab-a616872a0a3f.json | 31201 | 314fb7e3b983e26b54ca7288605a8205bc1e004a0fe8f79d11d3252c55093e25 |
| 54e248ff-305c-4fa3-bcab-a616872a0a3f-summary.json | 1787 | 83d9c57b98dac66b050d43eda5fd51c64ce343c5e52bf3ea4c72dbc6dbc72d35 |
| 54e248ff-postmortem.json | 1482 | 4dbd21b60351e03390bac391b09f978d2e92e9daf2abcfeaa1a0473114950be5 |
| provider-budget.json | 1158 | dbc0b325f30d85695201a6d6629693d20e2387d7236a0d9e81cd5b39b867fecc |

The existing ledger bytes are additionally preserved as
[original ledger snapshot](evidence/V1-SLICE-1C/runtime/attempt1-ledger-before-owner-revalidation.json).
The complete file/hash baseline is [recorded here](evidence/V1-SLICE-1C/runtime/revalidation-authority-baseline.json).
Runtime and postmortem files above are read-only historical artifacts.

## Observer corrective and evidence limits

The live observer read payload.args.address instead of the public
payload.args.request.address for session/follow. The first real Composer Prompt
was accepted and the Provider completed one read Tool/result and a completed
turn, with Tool and final Assistant marker matches. Workspace contents were
unchanged. Those facts were established postmortem; the live semantic sequence
and final rendered-UI proof were not retained. Attempt #1 remains NOT_PROVEN
and consumes one Provider Session attempt permanently.

The corrective binds the actual public wrapper, records bounded Session hashes,
rejects malformed ordinary addresses, requires matching follow binding before
submission, and persists rendered marker-match metadata. Existing affected
regressions and the complete 112/112 unit roster passed. Real zero-Prompt run
43988e6d-bcea-46b4-8f1f-954f1f05f84f proved corrected Session/follow binding with
unchanged budget bytes. These checks must be repeated after the policy corrective
before the authorized submission; historical tests alone cannot authorize it.

## Eligibility and one-time consumption

At decision time: attempts used = 1, remaining = 1. The narrow route requires
exactly the consumed first attempt, its identity-matched immutable artifacts,
verified completed read/result/marker postmortem, NOT_PROVEN live gate and
EVIDENCE_CAPTURE_IMPLEMENTATION_FAILURE, this valid decision identity, completed
observer corrective, affected/full tests and all required regression/preflight
checks, a new real zero-Prompt binding validation with unchanged ledger bytes,
clean Frozen Harness, unchanged six frozen documents and zero Product residuals.
No staging, commit or push is allowed.

The second runtime must use a new run ID, temporary Workspace, marker, Workspace
identity, Session and request identity through real AppWebEntry DOM only. Reserve
durably before Send; emitted Prompt consumes the final attempt. Authority has
explicit eligible/reserved/consumed state and cannot be reused by another process.
Missing or reset ledgers fail closed. No generic force, ignoreBudget or reset flag
is authorized. Existing strict non-submitted reservation reconciliation may not
hide any emitted Prompt. Provider, Tool, mutating or subagent failures grant no
additional attempt. No third attempt is permitted under any outcome.

## Required outcome

Only same-run live Prompt acceptance, ordered turn/step/chunk/read/result/final/end,
completed turn, marker hashes and rendered Assistant match, unchanged Workspace,
healthy Carrier within 262144 bytes, no lost/duplicate terminal or evidence,
no mutating/delegating Tool or child spawn, and required regressions may establish
PASS and IMPLEMENTED_WAITING_INDEPENDENT_REVIEW. Postmortem cannot fill missing
live evidence. A second capture failure stops as EVIDENCE_CAPTURE_REVALIDATION_FAILED
and SHACO_IMPLEMENTATION_FAILURE. Missing Tool is INCONCLUSIVE_MODEL_BEHAVIOR.
Provider, human interaction and Carrier boundaries retain their original classes.

## Full inherited uncommitted implementation worktree

This is the complete inherited 26-file implementation at authorization capture.
All legal work and history must be preserved while applying the authorized
corrective. Subsequent corrective deltas are recorded in the Implementation Record.

| Path | Bytes | SHA-256 before this corrective |
|---|---:|---|
| .gitignore | 299 | 47ec3b39da17b6454d5b34ceed347f0e5c0d1bbf5108b00e6e3e5c4eaee2a452 |
| apps/desktop/index.html | 2703 | 5471a71581e3acc0fee5b59255d2f78f34a4dd218ffec2c14c5fa6b17a530480 |
| apps/desktop/scripts/prepare-harness-client.mjs | 8361 | 7e29374a710fdf0fe1bef0f9aef264432366d73517b264f8ec693897828abe61 |
| apps/desktop/src/main/carrier-client.ts | 15707 | 0100d9ffc024ae5d4e67f14fa279ce1538b023c4298eec41ba040f923b4ba787 |
| apps/desktop/src/main/main.ts | 15778 | 7d9247c7b491fc8073058edd64de0743722a539f8e76048b22bb6cc3b2a2a8ae |
| apps/desktop/src/renderer/global.d.ts | 1554 | d0fc37842369b2ee481bb14da016e85d65037389db62dca16f96541b66aaf826 |
| apps/desktop/src/renderer/main.ts | 8800 | 6c1336e545dfde0f55af5d4fe0a7ede2ef694d9fa4a8cdf3b659c67510c60027 |
| apps/desktop/src/renderer/transport.ts | 4299 | 0e36a3785c0bfd411030e9481226dce944f3050b4216b91fcf2c530799bd6a6f |
| apps/desktop/tsconfig.test.json | 334 | b3dba2b152dc14ee9dcd0d044f7d1bb4f750eb977f15a1d64306685ba4061b67 |
| apps/worker/src/profile.ts | 4298 | 55c107bc75f475dc11c06f99c1a2447ae318f8f9be0e5fa7580da6883c2686c4 |
| docs/00-governance/SHACO-FORGE-CURRENT-STATE.md | 52574 | ca9e3231e1ef786705dff512be101ce2836f9c4c768bae150966b2d41f204e25 |
| docs/00-governance/SHACO-FORGE-DOCUMENT-MAP.md | 20638 | faa16786b6ec0c0a61818604d94fc086e93280f2571784740e1ba0c8c8f91eed |
| docs/04-development-records/DEVELOPMENT-LOG.md | 74973 | 169337816eb68bdf564e7eb13283d55a08aa9556595825acdc39bc14440d7062 |
| package.json | 1551 | af32c93057518603b36c1b0b4e2b5547aac0e3788195dd5237b37d42d71333f0 |
| scripts/smoke-worker.mjs | 5453 | ab4f10c006b86473be53e72283a204e75cae3ff144da40e2dd11b313751aa817 |
| apps/desktop/src/main/frame-observation.test.ts | 1162 | 393b30af30486f71cee48ef1e82a042b1bd5969f0ef5051716266cbf400fd12b |
| apps/desktop/src/renderer/shell-bootstrap.ts | 464 | a986a3399cba1df949ff52e43a2758aa25cd80ced629ec91239a45ddb0829d1a |
| apps/desktop/src/renderer/user-loop-evidence.ts | 15345 | f3d19e653c2971ffb5a130de14d15774dc83529d175747b53932f50d3c4c44fd |
| apps/desktop/tests/user-loop-evidence.test.ts | 15885 | 6b3eabea256f956ce7264604013c171ddfa54b8297964bb4a814088ada02c4bc |
| docs/04-development-records/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-IMPLEMENTATION-RECORD.md | 45968 | 8324ea2bd1a37866b6bbc320d5b7df464ada9764616731dbde9c56845a2b781e |
| docs/06-testing-acceptance/evidence/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-EVIDENCE.md | 24040 | d92d4ca6b4ccc8a71020b58c1eeaf88b09d3a103c96125bb3c12ffac44dcbd6d |
| scripts/electron-user-loop.mjs | 15967 | 8d6093fc43c609eea8ae025b093eb215a7fc5e67901c837301ebc8cfa5531302 |
| scripts/smoke-user-loop.mjs | 8717 | c77e4a3bf0776502add259875b07a7ce4f7b22a9e1c28154a5f6260c95ea17f5 |
| scripts/user-loop-policy.mjs | 8347 | 7acf949bdaad062607178a445fa3a9e0e8fc1c4727ebc5c4fe1e81c2219f3add |
| scripts/user-loop-policy.test.mjs | 15538 | 37006a787928b0114faf4020715136c9cde9648ec2578b2f7b868488c7962631 |
| scripts/verify-user-loop-hygiene.mjs | 3439 | 5c79256a4d7b4015022a215cd1009ba1d7fdad73baf1fd5c72a7e9212e55ea06 |

## Frozen document byte baseline

These exact current bytes must remain unchanged; this decision does not edit them.

| Path | SHA-256 |
|---|---|
| docs/01-product/SHACO-FORGE-UI-DESIGN-SPEC.md | 2195174452d573980e0a8cc89b18658ec077adca92864017a140382f4d54b230 |
| docs/03-v1.0-plan/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-CONTRACT.md | dced0828a8ea97d834fdc01cd46b1c54fd5a09a7f2a4509d3e815135edaaf005 |
| docs/04-development-records/V1-SLICE-1C-FROZEN-HARNESS-USER-LOOP-SOURCE-CONFIRMATION.md | 4ee209d01f956eb28d9908412e3a711af4e59f0ef8ac5f6b54ccf0f4af8c5620 |
| docs/04-development-records/V1-SLICE-1C-IMPLEMENTATION-AUTHORIZATION-OWNER-DECISION.md | c9075a5d226f77d46d7c928258c3effd9fce2655149c47e0b19360ac3c68a5cd |
| docs/05-reviews/architecture/AUDIT-015-V1-SLICE-1C-ARCHITECTURE-CHALLENGE.md | fbed6bed171bc86a540b2d5e1c4e1fddb9d21e8a2a93913810ec029005942c08 |
| docs/05-reviews/architecture/AUDIT-016-V1-SLICE-1C-CONTRACT-TARGETED-DELTA-REVIEW.md | 06621c4f2de7ac9beaa54397fd634e9d8169b0da14cc0b31bfbdcf73b63985cf |
