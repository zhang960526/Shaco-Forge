# V1-SLICE-2 Step 1 Owner Closure and Freeze Decision

Decision ID: `V1-SLICE-2-STEP1-OWNER-CLOSURE-FREEZE-20260909-01`

Document Type: `ARCHITECTURE_OWNER_STEP_CLOSURE_AND_BASELINE_FREEZE`

Status: `OWNER_ACCEPTED_CLOSED_FROZEN`

Date: `2026-09-09`

## 1. Decision

The Architecture Owner accepts REVIEW-023, the complete V1-SLICE-2 Step 1
implementation and its preserved Evidence history. Step 1 is closed and its
reviewed baseline is frozen by the single Closure commit. This decision does
not authorize Step 2, Step 3 or Provider execution.

```text
REVIEW_023 = PASS
STEP1_IMPLEMENTATION_REVIEW_BLOCKING_FINDINGS = NONE
STEP1_IMPLEMENTATION = ACCEPTED
STEP1_REQUIRED_GATES = G01_G22_PASS
STEP1_CANONICAL_RUNTIME = PASS
STEP1_REGRESSION = PASS
STEP1_PROVIDER_RUNS = 0
STEP1_OWNER_CLOSURE = ACCEPTED
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP1_RESULT = PASS
V1_SLICE_2_STEP1_BASELINE = FROZEN_BY_THIS_CLOSURE_COMMIT
V1_SLICE_2_STEP1_ADDITIONAL_IMPLEMENTATION = NONE
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = CONSUMED
V1_SLICE_2_ARCHITECTURE_CONTRACT = FROZEN
V1_SLICE_2_CARRIER_LIFECYCLE_AMENDMENT = FROZEN
```

The immutable Git identity of this decision is the commit containing this
document. `FROZEN_BY_THIS_CLOSURE_COMMIT` intentionally avoids an impossible
self-referential commit SHA inside that same commit and does not require a
second commit.

Formal Review authority:
[REVIEW-023](../05-reviews/architecture/AUDIT-023-V1-SLICE-2-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md).

## 2. Acceptance basis

Owner Closure is based on the supplied Independent Implementation Review
verdict and the following accepted facts:

1. `REVIEW_VERDICT = PASS` against Product HEAD
   `f4cf53efcef8bf83c2a5361f5128e5eeae99a2cd` and the exact reviewed 40-path
   dirty range (14 tracked modified, 26 untracked).
2. The frozen Harness is
   `cd5ef8148158c3a752a658978873241fdf8e2bbc` and CLEAN.
3. Architecture Contract, Worker authority, Windows Job, authority mutex,
   lifecycle discovery and credential issuance are `PASS`.
4. G01 through G22 are all confirmed `PASS`; G15 root cause is `PROVEN` and
   its Owner-authorized corrective is `PASS`.
5. Canonical runtime, regression, Provider boundary, Evidence, historical
   preservation and governance are `PASS`.
6. Provider runs are zero and Blocking Findings are `NONE`.
7. The regression security risk is `LOW`.

No Product runtime, Electron runtime, Worker runtime, Native Helper runtime,
Provider, Prompt or Tool execution was repeated during Closure.

## 3. Accepted frozen security state

```text
V1_LOCAL_TRUST_PRINCIPAL = CURRENT_WINDOWS_USER_SID
SAME_USER_HOST_COMPROMISE = OUT_OF_SCOPE
AUTHENTICATED_CARRIER = USER_BOUNDARY + FRESH_CAPABILITY_POSSESSION
PRODUCT_BINARY_IDENTITY_REQUIRED_FOR_V1_LOCAL_AUTHORIZATION = NO
BROKER_V1 = DO_NOT_CREATE
ASYMMETRIC_AUTHORITY_PROTOCOL_V1 = DO_NOT_CREATE
PRODUCT_LAUNCH_GRANT_V1 = DO_NOT_CREATE
WINDOWS_SERVICE_V1 = OUT_OF_SCOPE
WIRE_HMAC_CHANGED = NO
```

Closure preserves this accepted V1 boundary. It does not reintroduce Product
binary identity as a local authorization hard gate and does not create a
Broker, asymmetric authority protocol, Product Launch Grant or Windows Service.

## 4. Historical truth

The initial Step 1 long-running implementation attempt is preserved as:

```text
INITIAL_STEP1_LONG_RUNNING_ATTEMPT = STOPPED_BLOCKED
FIRST_BLOCKER = G15_BOUNDED_STOP_NOT_DELIVERED_DURING_ELECTRON_TEARDOWN
INITIAL_MAJOR_CORRECTIVE = 4/4_EXHAUSTED
G15_CORRECTIVE_AUTHORITY = ARCHITECTURE_OWNER_AUTHORIZED
G15_ROOT_CAUSE = BUSY_SWALLOWED_ON_SINGLE_LIFECYCLE_PIPE
G15_CORRECTIVE_RESULT = PASS
```

The frozen baseline includes both Evidence groups. The nine JSON files under
`STEP1-20260909-IMPLEMENTATION-01` remain the historical failed implementation
Evidence. The ten JSON files under `STEP1-20260909-G15-CORRECTIVE-01` remain the
successful corrective and final implementation Evidence. This Closure does not
rewrite the sequence as if the first implementation attempt passed.

## 5. Non-blocking finding dispositions

All findings retain Reviewer severity `INFO`.

```text
NF_R1 = ACCEPTED_INFO
NF_R2 = ACCEPTED_INFO
NF_R3 = CARRY_FORWARD_NONBLOCKING_DIAGNOSTIC
NF_R4 = DEFERRED_CODE_HYGIENE
NF_R5 = ACCEPTED_BOUNDED_FAIL_SAFE_BEHAVIOR
```

- NF-R1: Win32 Job source audit plus combined runtime evidence is sufficient;
  the G13 death chain need not uniquely isolate the Job mechanism for Closure.
- NF-R2: the PID-only exit poll may conservatively extend to eight seconds
  under theoretical PID reuse; it remains fail-safe with no orphan risk.
- NF-R3: benign `Carrier closed by Desktop` stderr is carried forward to later
  logging or experience cleanup.
- NF-R4: historical `ParseBootstrap` dead code is deferred; frozen Product
  bytes are not changed for code hygiene during Closure.
- NF-R5: the two-second in-flight health-probe wait is accepted bounded
  fail-safe behavior and does not permit blind retry or false success.

## 6. Immutable reviewed set

Before any Closure governance edit, SHA-256 was computed for all 37 immutable
reviewed files. After the seven permitted governance-path edits and before the
Closure commit, every file was recomputed and matched its pre-Closure bytes and
SHA-256 exactly.

| Path | Bytes | Pre/Post SHA-256 | Result |
|---|---:|---|---|
| `apps/desktop/src/main/carrier-client.ts` | 16544 | `e3d4c3686a9225098bb3820b44bf777ef7d59b5df767f651955611e98027f1b2` | EXACT_MATCH |
| `apps/desktop/src/main/lifecycle-client.ts` | 6606 | `d780f11a0a554875d68804d550d5b23f7d9eac2a26d8da80073141bc11ec1f88` | EXACT_MATCH |
| `apps/desktop/src/main/main.ts` | 16293 | `e4389abd6f16834f9c7e088d0555f778bcd397eb3843c354426bf7cc96f1b6dc` | EXACT_MATCH |
| `apps/desktop/src/main/worker-supervisor.test.ts` | 3756 | `1d1f9b32507761518f418e5201295a8b72ec4d5bdd0ebadf4dfee2054ac35a22` | EXACT_MATCH |
| `apps/desktop/src/main/worker-supervisor.ts` | 11105 | `690393538bcfe825a7b54d0704a554574a7210a2147ca5601d741828954d494b` | EXACT_MATCH |
| `apps/desktop/test-fixtures/step1-authority-negative.ps1` | 2121 | `d049073f20c0bef41649556ce3b91f7ac753a4f4baae32ccda0b71dae349a61a` | EXACT_MATCH |
| `apps/desktop/test-fixtures/step1-lifecycle-main.mjs` | 1511 | `a607d46ed8df4063acb9259ab5f2f9ce3f988d89138f56650c4da892922143c0` | EXACT_MATCH |
| `apps/native-carrier/LifecycleAuthority.cs` | 17356 | `f775cb6e31e84a33b4cb05a6ae8e6ca371ed5bc1154a3c2199a48ab4ccf577d1` | EXACT_MATCH |
| `apps/native-carrier/Program.cs` | 13487 | `336719a63dc932600904f0d5da3029cb6d7b260c12b8a9d1b5b30941d5da01c7` | EXACT_MATCH |
| `apps/native-carrier/WindowsAuthority.cs` | 12259 | `330b4ee0e99daf359f7db32aac269c173d71e3f7e77821b8040b0a5a33b97b64` | EXACT_MATCH |
| `apps/worker/host-profile/carrier-gateway.mjs` | 8679 | `9594ded08ec7dd6042dd6fce9c2f974b14d09fa45206a482f6aef769e16ffbb3` | EXACT_MATCH |
| `apps/worker/src/index.ts` | 16370 | `a83e09fac149dd26d4dd2f7d660d944810c9132cbef57638642c7af49acd9112` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/attachment-sequence.json` | 24253 | `b8a30ed7b776a7c954a3be7e83d4394e146ad474ebe44667619f59619de55009` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/authority-identity.json` | 44360 | `25947dc165a6bbcd3da4e5512aa9c19e03fba10db33a2826c469052ba663b723` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/electron-regression.json` | 20642 | `aa17a2350ac4e6609d8a58f6f8fc6f804d21a658a212e101820cee1a9ca52978` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/g15-root-cause.json` | 3248 | `7b4f9b6aa69fea5a785610fb5adcc9d777dbe75812a7a270aaefa7996a42809f` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/g15-stop-delivery.json` | 2100 | `14d54c2d06802b58f1307a321b9ac65c4fa2f69c6324f9e4de616dce4990c376` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/redaction-summary.json` | 1007 | `cb9efa84f4363201000f26d6ca0a231a9cef454fc123c6b8643ef16cce4e4f44` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/remaining-gates.json` | 1774 | `fc131159435a6e40c5ad2f3677ed313163227a149de279670ef5abc31f6e38af` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/run-manifest.json` | 3363 | `d9ea39c0600558c9d19da9269700f115ff57cf3a1566a0d55b1842ac010b6316` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/security-negative-results.json` | 43469 | `a4eb6cc1f488a2b515284873644cdd41413e9136bee5baf361304050ac3234cf` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-G15-CORRECTIVE-01/test-summary.json` | 1494 | `48b50c554d37d311f482b144875dc2097ef715a5f1f9df3a31f2c9bd326b4d78` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/attachment-sequence.json` | 29867 | `127648c48794c33812a068c93df12c86183bedd3f43723fe00e7418c793688be` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/authority-identity.json` | 8461 | `a8e294365dacddc199117b6725318a3cc33c8559be90af4d441ef54ddbdf48d7` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/electron-regression.json` | 20607 | `42c208eb44146a08266097baf88e8945ccfcc11d5cfefefda5da129ae8a5aba9` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/gate-results.json` | 4449 | `290863742c1ae754a0ad00565d9df7a45605c0f04d83bc73a0e3a5b5cc5a951c` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/process-lifecycle.json` | 42542 | `be707adcfe6f8d1a4b26255759f06cc92f057eb02d3b297f9236344aa4fc958d` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/redaction-summary.json` | 5210 | `6335495ebbaeb8b82fb0d261a0542c967db9fc61a11a53d1e6242c2250544403` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/run-manifest.json` | 34775 | `795e09f5a8ed0b612f53398ce508edaf45b58172bb910e7cfe0115174a357165` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/security-negative-results.json` | 28255 | `e1e0e6932c0bcb26611227295f6bf49fde7585da49747553c264080af55b1933` | EXACT_MATCH |
| `docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-IMPLEMENTATION-01/test-summary.json` | 6296 | `0ff47bc8b36099058c09b09db3acfd46d87c12d6f7be1d1738f690af857d2db9` | EXACT_MATCH |
| `docs/04-development-records/V1-SLICE-2-STEP1-WORKER-AUTHORITY-TRUSTED-DISCOVERY-IMPLEMENTATION-RECORD.md` | 31178 | `0cbfee1a9200b3f91772bd833bcf4774fc1e2d608669aebfb641137cab528089` | EXACT_MATCH |
| `package.json` | 1626 | `145164ddb2dcf7e020db74ed0f35f618304fc6853986a06d50c6a471428ab472` | EXACT_MATCH |
| `scripts/smoke-carrier.mjs` | 1946 | `c7eaabd412fb4be96aefaf70b3c5e3c044cc87b871b751a34edf32ea839b682c` | EXACT_MATCH |
| `scripts/smoke-electron.mjs` | 6307 | `7423b0c04df066695d24979abd9a5a2e7a0b16446d81fc40911fd9487369cc03` | EXACT_MATCH |
| `scripts/smoke-slice2-step1.mjs` | 66241 | `4752a83a9a48c782b67684165207e87c3e58a3733b5fb2220dfc231686fb0b36` | EXACT_MATCH |
| `scripts/smoke-worker.mjs` | 2595 | `e39099bf048d8e984adf1d938704359f4c9f89b751014b73f9c4e3480462a8ac` | EXACT_MATCH |

```text
IMMUTABLE_REVIEWED_FILES_MATCHED = 37/37
PRODUCT_IMPLEMENTATION_CHANGED_DURING_CLOSURE = NO
IMPLEMENTATION_RECORD_CHANGED_DURING_CLOSURE = NO
EVIDENCE_CHANGED_DURING_CLOSURE = NO
```

## 7. Governance state and next action

```text
V1_SLICE_2_STEP1_INDEPENDENT_IMPLEMENTATION_REVIEW = PASS
V1_SLICE_2_STEP1_IMPLEMENTATION_REVIEW_BLOCKING_FINDINGS = NONE
V1_SLICE_2_STEP1_OWNER_CLOSURE = ACCEPTED
V1_SLICE_2_STEP1_IMPLEMENTATION_AUTHORIZATION = CONSUMED
V1_SLICE_2_STEP1_ADDITIONAL_IMPLEMENTATION = NONE
V1_SLICE_2_STEP1 = PASS / CLOSED / FROZEN
V1_SLICE_2_STEP1_RESULT = PASS
V1_SLICE_2_STEP1_IMPLEMENTATION_RESULT = PASS
V1_SLICE_2_STEP1_BASELINE = FROZEN
V1_SLICE_2_IMPLEMENTATION = IN_PROGRESS
V1_SLICE_2 = IN_PROGRESS
V1_SLICE_2_STEP2 = NOT_AUTHORIZED
V1_SLICE_2_STEP3 = NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
V1_CURRENT_STEP = V1_SLICE_2_STEP1_CLOSED_PENDING_STEP2_ENTRY_DECISION
V1_CURRENT_NEXT_ACTION = ARCHITECTURE_OWNER_ASSESS_V1_SLICE_2_STEP2_ENTRY
```

Step 2 remains separately gated. This Closure grants no Step 2 implementation
authority and creates no Step 2 implementation prompt.
