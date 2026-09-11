# V1-SLICE-3 Step1 Package Content Closure Corrective Implementation Record

Status: CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW

Parent: [REVIEW-029](../05-reviews/architecture/AUDIT-029-V1-SLICE-3-STEP1-INDEPENDENT-IMPLEMENTATION-REVIEW.md) / FAIL / S3S1-IR-001 HIGH BLOCKING. Architecture Owner authorized this bounded corrective only.

旧 scripts/package-runtime.mjs 从 overlay 顶层全部包起步，导致开发/测试与不相关 SDK 资产进入产品。已替换为真实 CLI/profile/bootstrap roots → production dependency graph → closure-only materialization。只遍历 dependencies、适用 optionalDependencies、required peers，保持 Frozen Harness / public dsh CLI / shaco-forge profile 语义。来源身份、父链、内容裁剪和最终 Node 解析均有 machine-readable proof。

最终得到 14 个 root、505 个包身份、2398 条边、523 个物理包目录，闭包外为零；四个明确禁止包均不存在。早期真实桌面探针发现仓库祖先可选 peer 污染，已将最终输出隔离并验证 ancestry，无 App/Harness 代码修改。

全部 18 个最终 Gate 重新 PASS，source inventory = 0562c111dbea6afb68be52de3d287f3db7f79cc3254806566466023d43684f07。专项 closure tests、真实 Worker/Harness、ordinary/evidence-observer Desktop、identity negatives、controlled home、完整性和清理均通过。所有失败与诊断限制保留，不以历史 PASS 替代。

- [完整最终报告](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-CLOSURE-CORRECTIVE-01/final-report.md)
- [Graph / roots / package comparison / manifests](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-CLOSURE-CORRECTIVE-01/README.md)
- [失败历史](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-CLOSURE-CORRECTIVE-01/failed-attempts.json)
- [最终一致性验证](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-CLOSURE-CORRECTIVE-01/final-validation.json)
- [Targeted re-review handoff](evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-CLOSURE-CORRECTIVE-01/review-handoff.md)

源码改动仅在直接相关 packaging / test / smoke / verification scripts。治理仅同步本 Finding 的六份活动 authority；原实施记录和 FOUNDATION-01 证据未改。新文本 UTF-8 without BOM，修改文件逐项检查乱码。未新增 Provider、Signing、installer、update/backup/restore/uninstall closure、Step2/Step3 或 Fresh Windows 工作。

REVIEW-029 保持历史 FAIL；S3S1-IR-001 只到 CORRECTIVE_IMPLEMENTED_WAITING_TARGETED_REREVIEW。NF1/NF3 只保留 READY_FOR_OWNER_CLOSURE，NF4/F05 边界不变。Owner closure NOT_PERFORMED，Step1 baseline NOT_FROZEN，Step2/Step3 NOT_AUTHORIZED。
