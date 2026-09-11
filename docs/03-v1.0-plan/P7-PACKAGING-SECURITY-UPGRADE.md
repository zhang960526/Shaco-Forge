# P7 — Packaging / Security / Upgrade / Operability

Status: FROZEN_FOR_IMPLEMENTATION / STEP1_AUTHORIZED_NOT_STARTED

Productionize installer, signing, security verification, upgrade/backup/restore,
diagnostics/redaction, uninstall and Worker lifecycle during update. Historical
P0.S evidence and constraints are inputs; because the accepted P0.S record did
not execute Product Runtime, they do not substitute for Slice3 packaged-runtime
acceptance.

The detailed Slice3 specialization is now persisted in the
[V1-SLICE-3 Architecture Contract](V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md).
REVIEW-028 returned historical `FAIL` with sole Blocking Finding `S3-AR-001`;
REVIEW-028B returned `PASS`, and Architecture Owner accepted it, closed only
S3-AR-001, froze the Slice3 Contract and authorized Step1 as
`AUTHORIZED_NOT_STARTED`. This does not authorize Step2/Step3 or signing execution,
close REVIEW-012 F-05 or a Slice3 Step, or replace this roadmap authority.

Gate placeholders: `FRESH_INSTALL_PASS`, `SECURITY_PASS`, `UPDATE_COMPATIBILITY_PASS`, `BACKUP_RESTORE_PASS`, `OPERABILITY_PASS`.

## Detailed Contract

The detailed Slice3 Contract is frozen for implementation. Only future Step1
implementation is authorized; this Governance batch does not start it. F-05
technical work remains Step2 and unauthorized, while residual-risk acceptance
remains Architecture Owner-only. Production signing execution requires separate
authorization and remains `NO`.
