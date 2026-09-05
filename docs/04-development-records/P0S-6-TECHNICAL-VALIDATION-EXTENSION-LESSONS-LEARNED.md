# P0.S-6 Technical Validation Extension Lessons Learned

| Field | Value |
|---|---|
| Record Date | `2026-09-05` |
| Record Type | `LESSONS_LEARNED_RECORD` |
| Invocation | `P0S6-TVEC-INVOCATION-20260904-01` |
| Result | `PASS` |
| Classification | `PASS` |
| Candidate | `generated_not_applied` |
| Phase Closure Performed | `NO` |

本记录依据用户本轮提供的唯一可信状态与现存执行证据编写，不使用旧对话历史。用途是总结架构问题、Bug、Corrective 和最终验证结果；仅生成最终记录，不关闭 Phase，不改变既有 Phase 状态，不创建新的执行权限。完整 Timeline 和 Evidence SHA-256 见 [Execution Journey Log](P0S-6-EXECUTION-JOURNEY-LOG.md#11-technical-validation-extension-final-evidence-synchronization)。

## 1. Git SHA Self-Reference

**Problem:** Git SHA self-reference

**Root Cause:** Commit hash circular dependency

Execution Identity 包含其所在 commit 的 SHA，同时门禁要求 `current HEAD == authorityHead`。写入 SHA 会改变文件内容、tree 和 commit 对象，生成另一个 SHA；再次回填仍会产生新 SHA，冻结无法收敛。

**Correction:** Authority Anchor

使用已独立批准的固定 commit `001a1e495617b211e1cd1702d5895a4c31f314ea` 作为治理历史基线，验证当前 HEAD 为该 Anchor 或其后代。后续冻结记录可以推进 HEAD，无需改写 Anchor。Git commit identity 与文件 SHA-256 是不同身份域。

**Lesson:** 身份依赖必须单向。文件不回填包含自身内容的 commit SHA；后生成的 Binding / Approval 摘要也不回填到上游 Runner、Identity 或 Manifest。Anchor ancestry 只证明治理来源，还需独立认证执行字节。

**Evidence:** [Authority Anchor Correction](P0S-6-TECHNICAL-VALIDATION-EXTENSION-AUTHORITY-ANCHOR-CORRECTION-DECISION.md)、[Anchor Selection Owner Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-AUTHORITY-ANCHOR-SELECTION-OWNER-APPROVAL-DECISION.md)。

## 2. Manifest Self Trust

**Problem:** Manifest self trust

**Root Cause:** 可变 Manifest 与执行文件的内部哈希相互匹配，只能说明自洽。后代提交可同时修改 Runner、Identity 和 Manifest，重算哈希后仍满足 ancestry，无法独立证明这些字节得到 Owner 批准。

**Correction:** Execution Snapshot + Binding

将 Runner、Runner Identity、Execution Root Identity、Invocation Identity 和 Frozen Input Manifest 的精确路径、字节数、SHA-256 放入 Snapshot，由 Binding、Owner 批准和独立固定的 Snapshot Reference 认证。执行前同时检查 Anchor、选定 Snapshot 和全部组件身份。

**Lesson:** 哈希证明内容身份，独立批准证明允许使用哪份内容；这两个结论不能互相替代。冻结顺序为 Anchor → Runner → Identities → Manifest → Binding → final review / Owner freeze → Final Preflight。任一上游字节改变都需要相应下游身份重新生成和批准。

**Evidence:** [Execution Snapshot Correction](P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-CORRECTION-DECISION.md)、[Snapshot Binding Contract](../03-v1.0-plan/P0S-6-TECHNICAL-VALIDATION-EXTENSION-EXECUTION-SNAPSHOT-BINDING-CONTRACT.md)、[Freeze Plan](P0S-6-TECHNICAL-VALIDATION-EXTENSION-FINAL-SNAPSHOT-FREEZE-PLAN-DECISION.md)。

## 3. Missing Execution Trust Root

**Problem:** Missing execution trust root

**Root Cause:** 信任模型已定义，但具体 Owner 公钥尚未配置；早期 Runner 中 `SNAPSHOT_OWNER_PUBLIC_KEY_PEM = null`，不能完成签名验证和最终字节冻结。设计批准没有自动提供具体 key、signature 或选定的 Snapshot Reference。

**Correction:** Ed25519 Owner Signature

通过独立 Owner Approval 固定公钥身份，使用 Ed25519 验证精确 Payload bytes。批准的公钥指纹为 `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C`，域为 `DER SubjectPublicKeyInfo SHA-256`。私钥保持 Owner 控制，不进入仓库或日志。Snapshot Reference 仍需独立批准和固定，不能只从待验证 Binding 自声明中获得。

**Lesson:** 公钥信任、签名有效性、获准 Snapshot 的精确选择必须分别落实。Runner 字节批准也不等同于全部启动条件成立：Runner Final Freeze Approval 明确保留了独立 Owner Freeze Approval / Reference 检查边界，不能用文档状态掩盖该实现事实。

**Evidence:** [Trust Root Selection](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-SELECTION-DECISION.md)、[Public Key Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-TRUST-ROOT-PUBLIC-KEY-APPROVAL-RECORD.md)、[Runner Final Freeze Approval](P0S-6-TECHNICAL-VALIDATION-EXTENSION-RUNNER-FINAL-FREEZE-APPROVAL-DECISION.md)。最终 audit 的 `preLaunch.signatureValid = true` 是已有检查结果，本次未重跑验签。

## 4. Payload Status Mismatch

**Problem:** Payload status mismatch

**Root Cause:** 外部 Freeze Approval 已记录批准，签名覆盖的 Payload 却仍为 `DRAFT_FOR_FINAL_FREEZE_REVIEW`。批准文档和 Envelope 的状态不会改变签名载荷内的状态；门禁读取实际 Payload 时仍在 `EXECUTION_SNAPSHOT` 边界阻断。

**Correction:** Payload → Reference → Signature → Binding regeneration

独立生成 corrected Payload，仅修改顶层 `$.status` 为 `OWNER_APPROVED_AND_FROZEN`；重算 Snapshot Reference，再获得新的 Owner Signature，最后重新组装 Binding，并以新链的精确身份完成适用批准。旧签名和旧批准不能自动迁移到新字节。

| Identity | Corrected Value |
|---|---|
| Payload Bytes | `2226` |
| Payload SHA-256 | `F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Snapshot Reference | `sha256:F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Signature Bytes | `64` |
| Signature SHA-256 | `16F5B0ECDD464D2F1D8A4109FCFB616D5F9DD580148BE8E5310D534ABC1B87AB` |
| Binding SHA-256 | `E781C25F663065F1DE6B0E4F53DBFF32E8E27C5053E8EB6725D59E35CA6E07AD` |

**Lesson:** 状态字段也是签名数据。签名后的字段、换行、BOM、空白和编码改变都会产生新字节身份；必须按依赖链重新生成。记录“已批准”与实际签名内容符合门禁条件需要分别核对。早期 Payload Corrective Record 只完成 Payload 和签名交接，不因此被追溯视为完成签名或通过验证。

**Evidence:** [Payload Corrective Record](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-PAYLOAD-CORRECTIVE-RECORD.md)、[Corrected Payload](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.corrected.payload.json)、[Corrected Binding](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.corrected.json)。

## 5. Old Binding Entrypoint

**Problem:** Old Binding entrypoint

**Root Cause:** corrected Binding 已形成，Runner 固定读取的 `execution/snapshot/snapshot-binding.json` 却仍指向旧 Payload。新工件存在不代表实际启动入口已使用它，历史 Final Preflight 因此仍停在 `EXECUTION_SNAPSHOT`。

**Correction:** Corrected Binding Promotion

将已批准的 `snapshot-binding.corrected.json` 原始字节复制到正式 `snapshot-binding.json` 入口；保留 corrected Payload / Signature 路径、Reference 和组件哈希。两个 Binding 当前均为 `6351` bytes，SHA-256 均为 `E781C25F663065F1DE6B0E4F53DBFF32E8E27C5053E8EB6725D59E35CA6E07AD`。该步骤没有修改 Runner 或降低检查条件。

**Lesson:** 检查实际读取路径及该路径的精确字节，不能只检查旁路文件。Promotion、批准和 Preflight 是不同事件：Promotion Record 保留其 `DRAFT_FOR_INDEPENDENT_REVIEW` 状态及当时未重跑 Preflight 的事实，最后的 PASS 应引用后续 audit。

**Evidence:** [Binding Promotion Decision](P0S-6-TECHNICAL-VALIDATION-EXTENSION-SNAPSHOT-BINDING-PROMOTION-DECISION.md)、[正式 Binding](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/snapshot/snapshot-binding.json)、[Controlled Verification Audit](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/controlled-verification-audit.json)。

## 6. Final Validation and Remaining Boundary

| Field | Result |
|---|---|
| Invocation | `P0S6-TVEC-INVOCATION-20260904-01` |
| Result | `PASS` |
| Classification | `PASS` |
| Final Preflight / preLaunch | 已有 audit 记录 `PASS`，`2026-09-05T05:58:39.596Z` |
| Invocation Start | `2026-09-05T05:59:18.129Z` |
| Invocation Finalized | `2026-09-05T05:59:19.816Z` |
| Invocation / metadata / tarball / candidate count | `1` / `1` / `1` / `1` |
| Retry / Resume / Reuse | `0` / `0` / `0` |
| Candidate | `generated_not_applied` |
| Source Lockfile Modified | `false` |
| Phase Closure Performed by This Record | `NO` |

最终 Evidence：

- **metadata evidence：** [metadata-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/metadata-evidence.json)，`env-paths@2.2.1`，官方 registry 响应 HTTP `200`，身份结果 `PASS`。
- **tarball evidence：** [tarball-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/tarball-evidence.json)，HTTP `200`，实际 tarball integrity 与 metadata 一致，结果 `PASS`。
- **integrity comparison：** [controlled-verification-audit.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/controlled-verification-audit.json) 的 `integrityComparison` 表明 metadata = tarball = candidate；source / DRRC lockfile 的原 integrity 与之不匹配。
- **candidate：** [candidate-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/candidate-evidence.json) 与 [package-lock.corrected.candidate.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/package-lock.corrected.candidate.json)。candidate SHA-256 为 `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B`；仅 `/packages/node_modules~1env-paths/integrity` 存在语义差异，offset `11305` 的 `L` / `l` 是两份文件的比较结果。Candidate 已生成但未应用。
- **终态：** [classification.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/classification.json)、[final-summary.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/final-summary.json) 与 [invocation-ledger.jsonl](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/invocation-ledger.jsonl) 一致记录 `PASS`。

source / DRRC lockfile SHA-256 均保持 `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD`。不声明 lockfile 已修改，不把 Candidate 生成等同于修复已应用，不把本次技术验证 PASS 等同于依赖安装、Runtime 或 P0.S-7 已通过或已获授权。

## 7. Recording and Validation Practice

历史阻断、Corrective 交接、冻结批准、入口 Promotion、Final Preflight 和 Invocation 终态各自保留证据，不用后续 PASS 覆盖早期真实结果。冻结 Identity / Binding 中的 `NOT_STARTED`、`EMPTY`、`NOT_EXECUTED` 描述生成时快照；执行后的事实写入 ledger、audit 和最终记录，不回写冻结输入。

本次文档检查使用严格 UTF-8 解码、UTF-8 without BOM / LF 检查、乱码扫描、链接及必需字段检查、既有 Evidence 文件哈希复算、integrity 和 candidate 差异的只读比对，并以修改前后文件哈希及 `git status` 核对范围。这些检查不构成重新运行项目 Verification。

本次仅更新 Journey Log 并新增本文；未修改 Runner、Manifest、Binding、Payload、signature、Identity、Candidate 或 lockfile；未运行 Runner、Final Preflight、Verification、Invocation、网络请求、npm、依赖准备、Runtime 或 P0.S-7；未签名或读取私钥，未生成或应用 Candidate，未关闭 Phase，未 commit，未 push。
