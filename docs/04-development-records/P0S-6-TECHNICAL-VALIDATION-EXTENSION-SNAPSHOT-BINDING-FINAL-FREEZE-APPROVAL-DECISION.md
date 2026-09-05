# P0.S-6 Technical Validation Extension Snapshot Binding Final Freeze Approval Decision

## Record Identity

| 字段 | 值 |
| --- | --- |
| Decision ID | `P0S6-TVEC-SNAPSHOT-BINDING-FINAL-FREEZE-OA-20260905-01` |
| Document Type | `OWNER_APPROVAL_DECISION_RECORD` |
| Status | `OWNER_APPROVED_AND_FROZEN` |
| Decision Date | `2026-09-05` |
| Approval Authority | Owner（用户本次明确批准指令） |
| Approval Scope | exact Binding bytes、Payload Reference、Ed25519 Signature、Public Key fingerprint、Component hashes、Invocation identity 和 Snapshot Reference |

## Owner Approval Decision and State Transition

Owner 批准并冻结本记录列明的精确 Snapshot Binding、Payload Reference、既有 Ed25519 签名、公钥指纹、全部组件哈希、Invocation identity 和 Snapshot Reference。批准仅适用于下述精确字节身份及 Authority Anchor。

本决定记录该 Snapshot Binding 的治理批准状态转换：

```text
SIGNED_NOT_VERIFIED
        ↓
OWNER_APPROVED_AND_FROZEN
```

`OWNER_APPROVED_AND_FROZEN` 为本批准记录确立的状态。状态转换通过本独立 Decision 记录，不回写 Binding 或 Payload。原始 Binding 的 `status = SIGNED_NOT_VERIFIED`、Payload 的 `status = DRAFT_FOR_FINAL_FREEZE_REVIEW` 及既有签名均保持原始字节。

本次批准不重新签名，不修改 Runner 的检查条件，不声明既有 `EXECUTION_SNAPSHOT` 阻断已解除，也不产生新的验签、Verification 或 Final Preflight 通过结论。Invocation Start Boundary 不因本记录而跨越。

## Exact Binding and Snapshot Reference

本记录中的 `execution/` 路径均相对于仓库目录 `docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/`。

| 批准对象 | 精确值 |
| --- | --- |
| Authority Anchor | `001a1e495617b211e1cd1702d5895a4c31f314ea` |
| Binding | `execution/snapshot/snapshot-binding.json` |
| Binding Bytes | `6321` |
| Binding SHA-256 | `AFC25874FCB99880CE3750865338A14CE2478FEF2B596E760AC73ACE16AF28ED` |
| Payload | `execution/snapshot/snapshot-binding.payload.json` |
| Payload Bytes | `2230` |
| Payload SHA-256 | `7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| Payload Reference | `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| Snapshot Reference | `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| Payload Record Type | `EXECUTION_SNAPSHOT_BINDING` |
| Payload Schema Version | `1.0.0` |
| Binding Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-20260905-01` |
| Snapshot Contract ID | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTIVE-20260904-01` |

Binding SHA-256 的哈希域为 Binding 文件的精确字节。Payload Reference 与 Snapshot Reference 指向相同的原始 Payload 精确字节，其哈希域为 `EXACT_DECODED_PAYLOAD_BYTES`。这些身份不使用本 Decision 的文件哈希，不进行循环回填或 Payload 重新序列化。

## Approved Signature and Trust Root

| 批准对象 | 精确值 |
| --- | --- |
| Signature Algorithm | `Ed25519` |
| Signature File | `execution/snapshot/snapshot-binding.signature` |
| Signature Bytes | `64` |
| Signature SHA-256 | `48366C3186685FF9241218BD828F5588FD397B2C15335BA02560EBA12E7E2FF8` |
| Signature Encoding in Binding | `BASE64_RFC4648_STANDARD_PADDED` |
| Signature Domain | `EXACT_DECODED_PAYLOAD_BYTES` |
| Public Key Fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Public Key Fingerprint Domain | `DER SubjectPublicKeyInfo SHA-256` |

本决定批准 Binding 已附加的上述精确 Ed25519 签名及公钥指纹。签名文件、Binding 内嵌签名及公钥配置不因本记录改变。本次不读取 private key，不重新签名，不执行 Ed25519 验签。

## Approved Component Hashes and Invocation Identity

以下路径、字节数和 SHA-256 取自所批准的原始 Payload，作为本决定的精确批准对象。

| Component | 路径 | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `RUNNER` | `execution/runner/verify-env-paths-integrity.mjs` | `33726` | `DDC871A3970D064D5D26D0A1B5D668F6518C9EDFB23F37092D58FE72A3FC8A38` |
| `RUNNER_IDENTITY` | `execution/runner/runner-identity.json` | `688` | `88A40DFEE0758965A3B0C9EA09ADD5239EA99C4F5A119992D4044F8BFDCAE381` |
| `EXECUTION_ROOT_IDENTITY` | `execution/execution-root-identity.json` | `1420` | `AC4D73DB00AC69D421FD3C143B4672A80A90445FCB471095845DA0B720029574` |
| `INVOCATION_IDENTITY` | `execution/invocation/invocation-identity.json` | `389` | `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |
| `FROZEN_INPUT_MANIFEST` | `execution/manifest/frozen-input-manifest.json` | `15121` | `3B8774242BFEF5B3074555542AB86D43419F88D1BF4DADE3250902AA0E8FAA9F` |

| Invocation 字段 | 批准或保持值 |
| --- | --- |
| Invocation ID | `P0S6-TVEC-INVOCATION-20260904-01` |
| Invocation Identity | `execution/invocation/invocation-identity.json` |
| Invocation Identity SHA-256 | `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |
| Model | `SINGLE_INVOCATION` |
| State | `NOT_STARTED` |
| Consumed | `false` |
| Start Boundary | `NOT_CROSSED` |
| Retry | `0` |
| Resume | `0` |
| Reuse | `PROHIBITED` |
| Second Invocation | `0` |

## Preserved Boundary

`P0S6_STATE = CLOSED`

`P0S7_ALLOWED = NO`

Verification Goal、Scope、Budget、Network Boundary 和 Invocation Boundary 均保持不变。本决定不增加或消耗 Invocation、metadata、tarball、candidate、retry、resume 或 reuse 预算，不授权 P0.S-7。

本次仅创建状态批准记录，不执行 Invocation 或 Verification，不运行 Runner，不重新执行 Final Preflight；既有检查结果不由本记录改写或豁免。

## Creation Scope and Unexecuted Actions

本次只新增本 Decision Markdown 文件，使用 UTF-8 without BOM。记录创建检查限于批准身份的只读字节/哈希核对、新文件内容、SHA-256、UTF-8 编码、乱码扫描，以及只读 git status 和冻结文件未改动检查。

本次未修改 Binding、Payload、签名文件、Runner、Manifest、任何 Identity 或 lockfile；未读取 private key，未重新签名，未执行 Verification、Invocation 或 Final Preflight。

本次未访问 network，未下载 metadata 或 tarball，未创建 candidate，未 commit 或 push。
