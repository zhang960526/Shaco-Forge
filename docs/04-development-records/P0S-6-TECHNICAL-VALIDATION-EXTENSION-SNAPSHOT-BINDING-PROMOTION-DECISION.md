# P0.S-6 Technical Validation Extension Snapshot Binding Promotion Decision

## Decision Identity

- Decision ID: `P0S6-TVEC-SNAPSHOT-BINDING-PROMOTION-20260905-01`
- Document Type: `SNAPSHOT_BINDING_PROMOTION_DECISION`
- Status: `DRAFT_FOR_INDEPENDENT_REVIEW`
- Date: `2026-09-05`

## 依据与原因

本次依据用户本轮提供的唯一可信状态及本地 Binding 文件内容执行 Corrected Binding Promotion，不引用旧对话历史。用户报告 Final Preflight 的 `FIRST_FAILURE_BOUNDARY` 为 `EXECUTION_SNAPSHOT`：Runner 正式读取 `execution/snapshot/snapshot-binding.json`，该入口仍引用旧的待冻结 Payload。

正式执行入口必须引用最终冻结 Snapshot。因此，仅将已批准的 `snapshot-binding.corrected.json` 按原始字节复制到 `snapshot-binding.json`。本记录的独立审查状态保持 `DRAFT_FOR_INDEPENDENT_REVIEW`。

以下 `execution/` 相对路径均基于仓库目录 `docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/`。

## Promotion 前后 Binding

| 项目 | 旧正式 Binding | Corrected Binding / Promotion 后正式 Binding |
| --- | --- | --- |
| 文件 | `execution/snapshot/snapshot-binding.json` | 源：`execution/snapshot/snapshot-binding.corrected.json`；目标：`execution/snapshot/snapshot-binding.json` |
| Payload 状态 | `DRAFT_FOR_FINAL_FREEZE_REVIEW` | `OWNER_APPROVED_AND_FROZEN` |
| Envelope `status` | `SIGNED_NOT_VERIFIED` | `OWNER_APPROVED_AND_FROZEN` |
| Binding 文件 SHA-256 | `AFC25874FCB99880CE3750865338A14CE2478FEF2B596E760AC73ACE16AF28ED` | `E781C25F663065F1DE6B0E4F53DBFF32E8E27C5053E8EB6725D59E35CA6E07AD` |
| Snapshot Reference | `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` | `sha256:F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |

用户所述旧 Binding 的 `DRAFT_FOR_FINAL_FREEZE_REVIEW` 对应文件中的 `payloadStatus` 及 `currentState.payloadStatus`。外层 Envelope 状态单独记录如上。

## Promotion 规则

1. 只提升已批准、状态为 `OWNER_APPROVED_AND_FROZEN` 的 Corrected Binding。
2. 采用完整文件的原始字节复制，不解析后重写 JSON，不调整字段、换行或编码。
3. Corrected Payload、Corrected Signature、Corrected Snapshot Reference 和全部 Component hashes 均保持不变。
4. 保留 Corrected Binding 中指向 corrected payload 与 corrected signature 的路径，以及内嵌 Payload 和 Signature。
5. 不修改 Runner、Manifest 或任何 Identity；不重新签名，不读取 private key。
6. 本次仅创建本记录并替换正式 Binding 入口。

## 保持不变的 Corrected 链

| 项目 | 值 |
| --- | --- |
| Payload 文件 | `execution/snapshot/snapshot-binding.corrected.payload.json` |
| Payload SHA-256 | `F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Signature 文件 | `execution/snapshot/snapshot-binding.corrected.signature` |
| Signature SHA-256 | `16F5B0ECDD464D2F1D8A4109FCFB616D5F9DD580148BE8E5310D534ABC1B87AB` |
| Snapshot Reference | `sha256:F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Public Key Fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Fingerprint Domain | `DER SubjectPublicKeyInfo SHA-256` |
| Authority Anchor | `001a1e495617b211e1cd1702d5895a4c31f314ea` |

以下 Component hashes 从 Corrected Binding 原样保留；本次未运行组件验证流程。

| Component | SHA-256 |
| --- | --- |
| `RUNNER` | `DDC871A3970D064D5D26D0A1B5D668F6518C9EDFB23F37092D58FE72A3FC8A38` |
| `RUNNER_IDENTITY` | `88A40DFEE0758965A3B0C9EA09ADD5239EA99C4F5A119992D4044F8BFDCAE381` |
| `EXECUTION_ROOT_IDENTITY` | `AC4D73DB00AC69D421FD3C143B4672A80A90445FCB471095845DA0B720029574` |
| `INVOCATION_IDENTITY` | `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |
| `FROZEN_INPUT_MANIFEST` | `3B8774242BFEF5B3074555542AB86D43419F88D1BF4DADE3250902AA0E8FAA9F` |

## 文件检查与执行边界

本次文件检查仅限于：正式入口与 Corrected Binding 的字节一致性、文件 SHA-256、Corrected Payload / Signature 文件哈希未变、两个写入文件的严格 UTF-8 解码、无 BOM 和疑似乱码扫描，以及只读 `git status`。这些文件检查不构成项目 Verification、签名验证或 Final Preflight。

Promotion 完成后，正式入口保留 Corrected Binding 的以下状态，不将其提升为验证通过：

- `status`: `OWNER_APPROVED_AND_FROZEN`
- `payloadStatus`: `OWNER_APPROVED_AND_FROZEN`
- `signatureStatus`: `NEW_OWNER_SIGNATURE_ATTACHED_NOT_VERIFIED`
- `currentState.verification`: `NOT_EXECUTED`
- `currentState.finalPreflight`: `NOT_EXECUTED`
- `currentState.invocation`: `NOT_STARTED`
- `currentState.invocationConsumed`: `false`
- `currentState.startBoundary`: `NOT_CROSSED`

本次未执行 Verification、Final Preflight、Invocation、network、metadata、tarball、candidate、commit 或 push；未重新签名，未读取 private key。用户报告的 Final Preflight 阻塞未在本次重跑或判定解除。

工作区在本次开始前已有修改和未跟踪文件；本次仅对上述两个授权目标进行写入，不将既有工作区状态归属于本次 Promotion。
