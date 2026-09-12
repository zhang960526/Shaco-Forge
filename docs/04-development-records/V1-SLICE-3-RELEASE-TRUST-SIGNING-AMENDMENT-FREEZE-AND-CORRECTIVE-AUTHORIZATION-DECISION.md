# V1-SLICE-3 Release Trust / Signing Amendment Freeze and Corrective Authorization Decision

| Field | Value |
|---|---|
| Decision ID | `V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-FREEZE-CORRECTIVE-AUTH-20260912-01` |
| Document Type | `OWNER_AMENDMENT_FREEZE_AND_CORRECTIVE_AUTHORIZATION` |
| Status | `OWNER_ACCEPTED_CORRECTIVE_AUTHORIZED_NOT_STARTED` |
| Date | `2026-09-12` |
| Independent Review | [REVIEW-031 PASS](../05-reviews/architecture/AUDIT-031-V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-INDEPENDENT-REVIEW.md) |
| Frozen Amendment | [V1-SLICE-3 Release Trust / Signing Requirement Amendment](../03-v1.0-plan/V1-SLICE-3-RELEASE-TRUST-SIGNING-REQUIREMENT-AMENDMENT-CANDIDATE.md) |
| Parent Contract | [V1-SLICE-3 Packaging / Compatibility / Release Architecture Contract](../03-v1.0-plan/V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md) |
| Parent Contract SHA-256 | `35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76` |

## 1. Architecture Owner decision

Architecture Owner accepts `REVIEW-031 / PASS`, with no Blocking Findings, and
freezes Amendment
`V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-20260912-01` as the local Signing /
Release Trust authority over the Frozen Parent Contract. The Amendment is now
effective. Parent Contract source bytes, identity and historical status remain
unchanged.

```text
AMENDMENT_ARCHITECTURE_REVIEW = PASS
AMENDMENT_REVIEW_BLOCKING_FINDINGS = NONE
ARCHITECTURE_OWNER_AMENDMENT_FREEZE = ACCEPTED
AMENDMENT_STATUS = FROZEN_FOR_IMPLEMENTATION
AMENDMENT_EFFECTIVE = YES
PARENT_CONTRACT_STATUS = FROZEN_FOR_IMPLEMENTATION / UNCHANGED
PARENT_CONTRACT_SHA256 = 35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76
```

## 2. Frozen V1 release policy

```text
V1_RELEASE_DISTRIBUTION_MODEL = GITHUB_OPEN_SOURCE_RELEASE
RELEASE_TRUST_MODE = GITHUB_OPEN_SOURCE_UNSIGNED | TRUSTED_AUTHENTICODE
ACTIVE_V1_RELEASE_TRUST_MODE = GITHUB_OPEN_SOURCE_UNSIGNED
RELEASE_TRUST_MODE_AUTHORITY = IMMUTABLE_RELEASE_BUILD_AUTHORITY
TRUSTED_CA_AUTHENTICODE_SIGNING_REQUIRED_FOR_V1 = NO
GITHUB_OPEN_SOURCE_UNSIGNED = ACTIVE_V1_RELEASE_TRUST_MODE
TRUSTED_AUTHENTICODE = SUPPORTED_BUT_NOT_REQUIRED_FOR_GITHUB_OPEN_SOURCE_V1
TRUSTED_CA_AUTHENTICODE_PRODUCTION_SIGNING = DEFERRED_RELEASE_HARDENING
WINDOWS_PUBLISHER_IDENTITY = DEFERRED_RELEASE_HARDENING
SMARTSCREEN_REPUTATION_HARDENING = DEFERRED_RELEASE_HARDENING
```

GitHub unsigned V1 must verify exact source commit/tag, release manifest,
installer and artifact SHA-256, packaged-file manifest, Frozen Harness identity,
component/release identities, compatibility and transaction safety. It does not
provide Windows Authenticode publisher authenticity:

```text
PUBLISHER_AUTHENTICITY_VIA_WINDOWS_AUTHENTICODE = NOT_PROVIDED
WINDOWS_TRUSTED_PUBLISHER_IDENTITY = NOT_PROVIDED
SMARTSCREEN_REPUTATION = NOT_GUARANTEED
```

Release and Product surfaces must not claim Verified Publisher, Trusted
Publisher, SmartScreen bypass, or Production Authenticode signing.

## 3. Exact local supersede and preserved clauses

This freeze accepts only the Amendment's exact local supersede:

1. Parent §9 unconditional Production Signing requirement becomes mode-specific.
2. Parent §13 STEP2 unconditional signature gate becomes mode-specific while
   packaged-file integrity remains fail closed.
3. Parent §13 STEP3 `signature` identity is required only in
   `TRUSTED_AUTHENTICODE`; all other identity reconciliation remains required.
4. Parent §15 signing authorization becomes a Blocking Gate only when immutable
   Release Policy selects `TRUSTED_AUTHENTICODE`.

All other Parent clauses remain frozen and normative, including the six-identity
compatibility matrix, Control Store ownership, per-user installer, package/runtime
integrity, DRAIN, backup/update/restore/uninstall, F-05, three-Step structure,
Step1 baseline, Step3 packaged cumulative acceptance and Slice4 Fresh Windows
acceptance. Carrier, Frozen Harness, `MAX_JSON_FRAME`, Provider and private-key
boundaries are unchanged.

## 4. Sole corrective authorization

Architecture Owner authorizes only the next Product Source Corrective required to
implement `GITHUB_OPEN_SOURCE_UNSIGNED` as the immutable active release mode:

```text
V1_SLICE_3_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE_AUTHORIZATION = YES
IMPLEMENTATION_CORRECTIVE_STATUS = AUTHORIZED_NOT_STARTED
```

The corrective must implement this exact dispatch:

```text
IMMUTABLE_RELEASE_POLICY = GITHUB_OPEN_SOURCE_UNSIGNED
  -> AUTHENTICODE = NOT_REQUIRED
  -> INSTALLER_RELEASE_SHA_MANIFEST_ARTIFACT_INVENTORY = STRICTLY_VERIFIED
  -> COMPATIBILITY_AND_TRANSACTION_SAFETY = STRICTLY_VERIFIED

IMMUTABLE_RELEASE_POLICY = TRUSTED_AUTHENTICODE
  -> WINVERIFYTRUST = REQUIRED
  -> SIGNER_CERTIFICATE_SHA256_ALLOWLIST = REQUIRED
  -> TIMESTAMP = REQUIRED
  -> SIGNED_INSTALLER_DIGEST = REQUIRED
```

`RELEASE_TRUST_MODE_AUTHORITY = IMMUTABLE_RELEASE_BUILD_AUTHORITY` remains
mandatory. User command-line, environment, Settings or runtime toggles are
forbidden, including `--skip-signature`, `ALLOW_UNSIGNED` and
`disable-signature=true`. Trusted Authenticode support must not be deleted or
downgraded.

This authorization does not start the corrective. It does not authorize changes
to compatibility identities, Control Store schema/ownership, DRAIN, backup,
restore, uninstall, Carrier, Harness, `MAX_JSON_FRAME`, F-05, Step1, Step3 or
Slice4. It does not authorize an updater, channel, release server, Sigstore,
TUF, SLSA, marketplace/store integration, runtime signature bypass or broader
trust framework.

## 5. Step, execution and deferred boundary

```text
V1_SLICE_3_STEP1_BASELINE = 99561f80629a8f9640af702fe322996bcc850906
V1_SLICE_3_STEP2 = CORRECTIVE_AUTHORIZED_NOT_STARTED
V1_SLICE_3_STEP2_BASELINE = NOT_FROZEN
V1_SLICE_3_STEP2_FINAL_INDEPENDENT_REVIEW = NOT_STARTED
V1_SLICE_3_STEP2_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
V1_SLICE_3_CLOSURE = NO
PROVIDER_GATE_AUTHORIZATION = NO
PROVIDER_RUN_COUNT = 0
SIGNING_EXECUTION_AUTHORIZATION = NO
SIGNING_RUN_COUNT = 0
V1_SLICE_4 = NOT_STARTED
```

Deferred and known-issue dispositions remain:

```text
TRUSTED_CA_AUTHENTICODE_PRODUCTION_SIGNING = DEFERRED_RELEASE_HARDENING
WINDOWS_PUBLISHER_IDENTITY = DEFERRED_RELEASE_HARDENING
SMARTSCREEN_REPUTATION_HARDENING = DEFERRED_RELEASE_HARDENING
BUG_S3S2_001 = OPEN / NON_BLOCKING_CARRY_FORWARD
NODE_SQLITE_EXPERIMENTAL_RISK = NON_BLOCKING / DEFERRED
CSP_UNSAFE_EVAL_INLINE_REMOVAL = DEFERRED_SECURITY_HARDENING
```

## 6. Current route and batch boundary

```text
V1_CURRENT_STEP = V1_SLICE_3_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE_AUTHORIZED_NOT_STARTED
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_3_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE
READY_FOR_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE = YES
```

This Governance batch changes documentation only. Product Source, Frozen Harness,
Parent Contract, Step1 baseline and historical Evidence are unchanged. Runtime,
Build, Tests, Packaging, Signing, Provider and Fresh Windows are `NOT RUN`. This
Decision authorizes a separately scoped future corrective batch; it performs no
corrective implementation and does not close Step2 or authorize Step3.
