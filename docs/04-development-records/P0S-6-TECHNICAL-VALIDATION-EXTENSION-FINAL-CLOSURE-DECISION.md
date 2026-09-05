# P0.S-6 Technical Validation Extension Final Closure Decision

## 1. Decision Identity

| Field | Value |
|---|---|
| Decision ID | `P0S6-TVEC-FINAL-CLOSURE-20260905-01` |
| Document Type | `FINAL_CLOSURE_DECISION` |
| Status | `CLOSED` |
| Decision Date | `2026-09-05` |
| Decision Authority | 用户本次明确的最终治理关闭指令 |
| Scope | P0.S-6 Technical Validation Extension 最终治理关闭 |

本决定依据用户提供的当前最终状态及现存执行证据，记录 P0.S-6 Technical Validation Extension 的最终关闭。它是治理关闭记录，不修改代码，不应用 Candidate，不授权依赖准备、Runtime 或 P0.S-7，也不重新运行 Verification。

## 2. Original Goal

**Original Goal:** 验证 `env-paths@2.2.1` integrity mismatch。

在受控范围内核对官方 registry metadata、实际 tarball identity 和 source / DRRC lockfile integrity，验证 corrected lockfile candidate 的派生结果。目标限于完整性验证与候选工件生成，不包含将 Candidate 应用于任何 lockfile。

## 3. Execution

**Execution:** Single Invocation PASS。

| Field | Final Result |
|---|---|
| Invocation | `P0S6-TVEC-INVOCATION-20260904-01` |
| Execution Result | `PASS` |
| Classification | `PASS` |
| Verification | `COMPLETED` |
| Runner Process Launch Count | `1` |
| Process Exit Code | `0` |
| Start Boundary | `CROSSED` |
| Invocation Consumed | `YES` |
| Invocation Start | `2026-09-05T05:59:18.129Z` |
| Invocation Finalized | `2026-09-05T05:59:19.816Z` |
| Metadata Requests | `1` |
| Tarball Requests | `1` |
| Candidate Count | `1` |
| Retry / Resume / Reuse | `0` / `0` / `0` |

上述时间来自已存在的 ledger 和 audit；Invocation ID 中的 `20260904` 不替代实际执行日期。单次 Invocation 已完成并形成唯一 `PASS` 终态，本记录不创建第二次 Invocation，不恢复或复用已消耗的执行预算。

## 4. Evidence

以下引用均为已有 Evidence。本次仅只读核对文件及 SHA-256，不重新下载 metadata / tarball，不重新派生 Candidate，不改写 Evidence。

| Evidence | File | SHA-256 |
|---|---|---|
| metadata evidence | [metadata-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/metadata-evidence.json) | `646A19E57D61E18D0C1F23982EBDC73D48283EA73F96A4DB2A41700D0392EDFD` |
| tarball evidence | [tarball-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/tarball-evidence.json) | `83AF206607AAD4C3813437BCEBF7C8B2C1ADD43E152EE4346EDFEC42263DF621` |
| integrity comparison | [controlled-verification-audit.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/controlled-verification-audit.json) 的 `integrityComparison` | `0C6CF2A0673A22FC8232D942A8206ADBE5324FFCF7B518B8B66B2B372FECECEA` |
| candidate derivation evidence | [candidate-evidence.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/candidate-evidence.json) | `C1D458EBA8A0E44E211D3E224CC6000D4DE175E64B09F7DB53070C6D81486F16` |
| candidate | [package-lock.corrected.candidate.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/package-lock.corrected.candidate.json) | `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B` |
| classification | [classification.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/classification.json) | `BB436391F1013AE9CFB7EC2DCC46516400821AB3FA87E02383230A42F9851082` |
| final summary | [final-summary.json](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/final-summary.json) | `47E353AD6DCD0E1D63E68B5D8EC800893C5A7EAE7BD23FA4299D7BCD94D6894F` |
| invocation lifecycle | [invocation-ledger.jsonl](experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/execution/root/invocation-ledger.jsonl) | `9F62819B023C640FBB0FE547F77DB4CD96B248529851B95E5130EBA681E45D79` |

执行过程、架构问题和 Corrective 的完整上下文见 [Execution Journey Log](P0S-6-EXECUTION-JOURNEY-LOG.md) 与 [Lessons Learned](P0S-6-TECHNICAL-VALIDATION-EXTENSION-LESSONS-LEARNED.md)。本决定不回写这些历史记录，也不覆盖原 Invocation 的历史分类。

## 5. Final Finding

**Metadata integrity equals tarball integrity.**

**Lockfile integrity differs.**

**Difference:** `UgALw` vs `UgAlw`。

| Compared Object | Integrity Fragment | Finding |
|---|---|---|
| Source lockfile | `UgALw` | 与 metadata / tarball 不一致 |
| DRRC lockfile | `UgALw` | 与 source 一致，与 metadata / tarball 不一致 |
| Metadata | `UgAlw` | 与实际 tarball integrity 一致 |
| Tarball | `UgAlw` | 实际字节计算所得 integrity 与 metadata 一致 |
| Candidate | `UgAlw` | 与 metadata / tarball 一致，未应用 |

metadata、tarball 和 Candidate 的完整 integrity 为：

```text
sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgAlwKNZ0cf2uqan5GLuS2A==
```

source / DRRC lockfile 仍保留的完整 integrity 为：

```text
sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgALwKNZ0cf2uqan5GLuS2A==
```

差异是区分大小写的 `L` 与 `l`。PASS 表明受控完整性验证和 Candidate 派生通过，不表示 source / DRRC lockfile 的差异已被应用修复。

## 6. Candidate Disposition

**Candidate:** `generated_not_applied`。

**Generated only. Not applied.**

已有 Candidate 数量为 `1`，长度为 `30829` bytes，SHA-256 为 `324021454DB0194EC09934351591192248911CC0A016856AEFF23AF2AC93046B`。它仅作为已生成的验证工件保留。

Candidate 与 source 的唯一语义差异为 `/packages/node_modules~1env-paths/integrity`。从零起算的字节 offset `11305`，source 为 `76`（`L`），Candidate 为 `108`（`l`）。该描述是两份既有文件的比较，不是对 source lockfile 的写入。

| Lockfile | State | SHA-256 |
|---|---|---|
| [Source lockfile](experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json) | `UNCHANGED` | `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD` |
| [DRRC lockfile](experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json) | `UNCHANGED` | `3C7449945B509028C025F2A747B0C9B4F74BE260CC3CDE8CA07E9D5DDDEE33FD` |

本决定不批准或执行 Candidate application，不声明任何 lockfile 已修改。

## 7. Safety Boundary

- **No source modification.** Source 和 DRRC lockfile 均保持 `UNCHANGED`；本次仅新增治理文档，不修改源代码或执行工件。
- **No Runtime.** Runtime 为 `NOT_ENTERED`，不授权或执行依赖准备、npm install / npm ci 或 Runtime 验证。
- **No P0.S-7.** `P0S7_ALLOWED = NO`，不进入或授权 P0.S-7。

本次不修改 Runner、Manifest、Binding、Payload、signature、任何 Identity、Candidate 或 lockfile。关闭记录不扩大 Verification Scope，不恢复 Invocation 预算，不将技术验证 PASS 转化为后续阶段执行权限。

## 8. Final Closure Decision and Final State

依据已完成的 Single Invocation、`PASS` 执行结果与分类、完整 Evidence 和明确的 Candidate disposition，记录 P0.S-6 Technical Validation Extension 的最终治理关闭。

```text
P0S6_STATE = CLOSED
P0S7_ALLOWED = NO
```

| Final State Field | Value |
|---|---|
| Decision Status | `CLOSED` |
| Verification | `COMPLETED` |
| Execution Result | `PASS` |
| Classification | `PASS` |
| Candidate | `generated_not_applied` |
| Source Lockfile | `UNCHANGED` |
| DRRC Lockfile | `UNCHANGED` |
| Runtime | `NOT_ENTERED` |
| P0S6_STATE | `CLOSED` |
| P0S7_ALLOWED | `NO` |

上述状态由本关闭决定记录；本次不修改其他治理状态文件。治理关闭不等于 Candidate 已应用，也不证明依赖安装或 Runtime 已通过。

## 9. File Creation Checks and Unexecuted Actions

本次仅新增本文件，以 UTF-8 without BOM、LF 保存。检查方式为：严格 UTF-8 解码、BOM 与疑似乱码扫描、必需字段及相对链接检查、文件 SHA-256 复算、既有 Evidence 和 lockfile 的只读哈希 / integrity 比对，以及修改前后工作区文件哈希和 `git status` 检查。这些文档及证据一致性检查不构成新的项目 Verification。

本次未修改任何既有文件；未运行或导入 Runner，未重跑 Final Preflight / Verification，未启动 Invocation，未访问网络或下载 metadata / tarball，未生成、修改或应用 Candidate，未读取私钥或签名，未修改 lockfile，未执行 npm、依赖准备、Runtime 或 P0.S-7；未 commit，未 push。
