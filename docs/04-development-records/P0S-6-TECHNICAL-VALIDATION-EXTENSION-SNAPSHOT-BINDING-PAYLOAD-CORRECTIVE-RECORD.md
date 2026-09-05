# P0.S-6 Technical Validation Extension Snapshot Binding Payload Corrective Record

## 本次范围与当前结果

| 字段 | 值 |
| --- | --- |
| Record ID | `P0S6-TVEC-SNAPSHOT-BINDING-PAYLOAD-CORRECTIVE-20260905-01` |
| Record Type | `SNAPSHOT_BINDING_PAYLOAD_CORRECTIVE_RECORD` |
| Date | `2026-09-05` |
| Status | `PAYLOAD_REGENERATED_PENDING_OWNER_SIGNATURE` |
| Authorization Source | 用户本次 Snapshot Binding Payload Corrective 指令 |
| Failure Boundary Supplied by Owner | `EXECUTION_SNAPSHOT` |
| New Signature Status | `NOT_CREATED_PENDING_OWNER_LOCAL_SIGNING` |
| New Binding Envelope Status | `NOT_CREATED_PENDING_NEW_OWNER_SIGNATURE` |
| New Final Freeze Approval Status | `PENDING_NEW_SIGNATURE_AND_ENVELOPE_IDENTITIES` |

本次依据用户提供的当前状态及工作区现有工件，新增独立 Payload，仅修正顶层 `$.status`。旧已签名 Payload、旧签名、旧 Binding Envelope 和旧 Final Freeze Approval 均保留原件。

新 Payload 内部的 `OWNER_APPROVED_AND_FROZEN` 是本次指令要求的签名前授权状态字段。该字段自身不构成新链的独立 Final Freeze Approval。本记录不是批准决定，不声明阻断已解除，也不声明 Final Preflight 或 Verification 通过。

## 新 Payload 的精确身份

本记录中的 `execution/` 路径均相对于 `docs/04-development-records/experiments/P0S-6-TECHNICAL-VALIDATION-EXTENSION/`。

| 对象 | 精确值 |
| --- | --- |
| 新 Payload / Owner 唯一签名输入文件 | `execution/snapshot/snapshot-binding.corrected.payload.json` |
| Payload Bytes | `2226` |
| Payload SHA-256 | `F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Snapshot Reference | `sha256:F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| Payload Status | `OWNER_APPROVED_AND_FROZEN` |
| Payload Record Type | `EXECUTION_SNAPSHOT_BINDING` |
| Payload Schema Version | `1.0.0` |
| Binding Contract ID | `P0S6-TVEC-SNAPSHOT-BINDING-20260905-01` |
| Snapshot Contract ID | `P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTIVE-20260904-01` |
| Invocation ID | `P0S6-TVEC-INVOCATION-20260904-01` |
| Encoding | `UTF-8 without BOM` |
| Object Key Order | `RECURSIVE_LEXICOGRAPHIC_ASCII` |
| Separators | item `,` / key-value `:` |
| Insignificant Whitespace / Trailing Newline | `false` / `false` |
| Hash Domain / Signature Domain | `EXACT_DECODED_PAYLOAD_BYTES` |

Snapshot Reference 的摘要为上述文件精确字节的 SHA-256，使用大写十六进制。Binding 文件哈希、签名文件哈希以及本记录哈希均不得替代该摘要。

## 唯一变更与原件保留

```text
$.status:
DRAFT_FOR_FINAL_FREEZE_REVIEW -> OWNER_APPROVED_AND_FROZEN
```

生成方式：只读取得原 Payload 字节，在新缓冲区中替换唯一的完整状态 token，以新文件名独占创建。没有将解析后的 JSON 重新序列化作为写入内容。

旧 token 起始偏移为 `1692`（零起始字节偏移），长度 `40` 字节；新 token 长度 `36` 字节，因此 Payload 从 `2230` 字节变为 `2226` 字节。恢复该 token 后可逐字节重建旧 Payload；前后其余字节完全一致。

| 保留原件 | Bytes | SHA-256 |
| --- | --- | --- |
| `execution/snapshot/snapshot-binding.payload.json` | `2230` | `7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` |
| `execution/snapshot/snapshot-binding.json` | `6321` | `AFC25874FCB99880CE3750865338A14CE2478FEF2B596E760AC73ACE16AF28ED` |
| `execution/snapshot/snapshot-binding.signature` | `64` | `48366C3186685FF9241218BD828F5588FD397B2C15335BA02560EBA12E7E2FF8` |

旧 Snapshot Reference `sha256:7C01C2A09A66DBA5046AFF6B12865890E547A1C55588068AC66BA428CC8F5151` 和旧签名仅属于旧字节，不能用于新 Payload。旧 Final Freeze Approval 不转移到新 Payload，也不回写旧批准记录。

## 保持一致的绑定字段

以下组件路径、字节数及哈希完整保留自原 Payload。本次仅检查 Payload 声明与用户给定冻结值一致，未执行 Runner 的组件 Verification。

| Component | Path | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `RUNNER` | `execution/runner/verify-env-paths-integrity.mjs` | `33726` | `DDC871A3970D064D5D26D0A1B5D668F6518C9EDFB23F37092D58FE72A3FC8A38` |
| `RUNNER_IDENTITY` | `execution/runner/runner-identity.json` | `688` | `88A40DFEE0758965A3B0C9EA09ADD5239EA99C4F5A119992D4044F8BFDCAE381` |
| `EXECUTION_ROOT_IDENTITY` | `execution/execution-root-identity.json` | `1420` | `AC4D73DB00AC69D421FD3C143B4672A80A90445FCB471095845DA0B720029574` |
| `INVOCATION_IDENTITY` | `execution/invocation/invocation-identity.json` | `389` | `4E353B8339385F19F0988E54C5B7104E80FE4ECAE8015AF778844AAD1EA519F4` |
| `FROZEN_INPUT_MANIFEST` | `execution/manifest/frozen-input-manifest.json` | `15121` | `3B8774242BFEF5B3074555542AB86D43419F88D1BF4DADE3250902AA0E8FAA9F` |

| 字段 | 保持值 |
| --- | --- |
| Authority Anchor | `001a1e495617b211e1cd1702d5895a4c31f314ea` |
| Trust Root Algorithm | `Ed25519` |
| Public Key Fingerprint | `AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C` |
| Fingerprint Domain | `DER SubjectPublicKeyInfo SHA-256` |
| Public Key Approval Record ID | `P0S6-TVEC-SNAPSHOT-TRUST-ROOT-PUBLIC-KEY-OA-20260905-01` |
| Public Key Approval Record SHA-256 | `B26AFE3023955450F24128CECC640AD95343D69DDD1CAFD3BFD1A5A83AD41412` |
| Key Source | `INDEPENDENT_OWNER_APPROVAL_PINNED_IN_RUNNER` |
| Key Override | `PROHIBITED` |
| Reference Mechanism | `GOVERNANCE_RECORD_HASH` |
| Invocation Model / State | `SINGLE_INVOCATION` / `NOT_STARTED` |
| Invocation Consumed / Start Boundary | `false` / `NOT_CROSSED` |
| Retry / Resume / Second Invocation | `0` / `0` / `0` |
| Reuse | `PROHIBITED` |

整个 `trustRoot`、`files`、`invocation` 对象以及所有其他非 `status` 字段均保持一致；Payload schema、属性集合、排序和格式未改变。

## Owner 本地签名交接

1. Owner 在本地受控签名环境使用现有已批准的 Ed25519 私钥。私钥由 Owner 控制，不交给 Codex，不进入仓库、命令输出、日志或交接记录。本次没有查找、读取或使用私钥。
2. 唯一签名输入为 `execution/snapshot/snapshot-binding.corrected.payload.json` 的原始 `2226` 字节。Owner 在签名前确认文件长度及 SHA-256 与本记录一致；任何不匹配均停止签名。
3. 使用标准 Ed25519 对这些精确字节签名。不签 SHA-256 文本、摘要字节、Snapshot Reference 字符串、Base64 文本或重新序列化的 JSON；不采用调用方预哈希。签名期间及之后不得改变 Payload，包括换行、BOM、空白或编码。
4. Owner 返回新的原始 `64` 字节签名，可保存为独立的新文件 `execution/snapshot/snapshot-binding.corrected.signature`。该文件当前尚未创建；不得覆盖或复用 `snapshot-binding.signature`。
5. 交接签名时附带非秘密信息：`Ed25519`、批准的公钥指纹、签名输入路径、`2226` 字节、上述新 Payload SHA-256 及 Snapshot Reference。签名完成并不自动构成新 Final Freeze Approval。

## Binding Envelope 更新要求

严格保留以下顺序：

```text
新 Payload [已生成]
  -> 新 Snapshot Reference [已计算]
  -> Owner 本地新 Signature [待完成]
  -> 新 Binding Envelope [待新签名]
  -> 新 Final Freeze Approval [待完整精确身份]
```

收到真实新签名后，另行生成 `execution/snapshot/snapshot-binding.corrected.json`。本轮不提前创建含空签名、假签名或旧签名的 Envelope。

基于现有 Envelope schema，新 Envelope 的更新要求为：

| 字段 | 要求 |
| --- | --- |
| `payload` | 新 Payload 精确字节的 RFC 4648 标准带 padding Base64 |
| `payloadPath` | 新 Payload 的仓库相对路径 |
| `payloadBytes` | `2226` |
| `payloadSha256` | `F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| `payloadStatus` / `currentState.payloadStatus` | `OWNER_APPROVED_AND_FROZEN` |
| `snapshotReference` | `sha256:F5AA75F8C210EE8646ABFBCD67482D4E246F38869FD8BF9ECC005B2A58A22F91` |
| `snapshotReferenceStatus` | `COMPUTED_FROM_EXACT_PAYLOAD_BYTES` |
| `signature` | Owner 新签名原始 64 字节的 RFC 4648 标准带 padding Base64 |
| `signaturePath` | 新签名独立文件的仓库相对路径 |
| `signatureBytes` | 收到后确认原始签名为 `64` 字节 |
| `signatureSha256` | 收到后对真实新签名的原始字节重新计算，不使用旧值 |
| `signatureStatus` / `currentState.signature` | 如尚未验签，明确记录 `NEW_OWNER_SIGNATURE_ATTACHED_NOT_VERIFIED` |
| Envelope `status` | 如仅组装而未验签，记录 `SIGNED_NOT_VERIFIED`，不得自称最终已批准 |
| `currentState.payload` | 如保留该说明字段，记录 `REGENERATED_STATUS_ONLY` |
| Approval / independently pinned reference 状态字段 | 按真实阶段记录，批准及独立保留新 Reference 前不得宣称完成 |

`payloadIdentity`、canonicalization、算法、哈希域、签名域、Trust Root、公钥指纹、Anchor、Invocation Identity 和组件哈希全部保持一致。所有重复的 Payload 身份及状态字段必须同步到新 Payload，不得留下旧摘要、旧字节数或旧 draft 状态。原签名不得复制到新 Envelope。

组装后应检查 Base64 解码结果与新 Payload / 新签名输入逐字节一致，并单独计算完整新 Envelope 文件的 bytes 和 SHA-256，交由 Owner 审批。此处为待执行要求，本轮未进行组装或验签；Verification 禁令不因本记录解除。

现有 Runner 固定读取 `execution/snapshot/snapshot-binding.json`。独立的新 Envelope 文件在该路径受控切换之前不会被 Runner 使用。本轮未切换该入口；后续切换需保留旧 Envelope 的精确原件，以新链完成后的批准字节落位，不能通过修改 Runner 或任何冻结组件改变入口。

## 新 Final Freeze Approval 要求

新签名和新 Envelope 形成后，由 Owner 以独立的新批准记录明确绑定以下完整集合：

- 新 Payload 路径、`2226` 字节、SHA-256、新 Snapshot Reference、状态、schema、Record Type、Contract IDs 和 canonicalization。
- 新签名文件、Ed25519 算法、原始 `64` 字节、真实签名 SHA-256 和签名域。
- 新签名承载 Envelope 的精确路径、bytes 和 SHA-256；不得沿用旧 Envelope 身份。
- 已批准的 Public Key Fingerprint / Trust Root、Authority Anchor、Invocation ID / Identity 和全部组件路径、bytes、SHA-256。

新的批准记录必须在上述身份全部确定后由 Owner 明确批准；旧批准不能迁移、原地改写或代替新批准。批准的新 Snapshot Reference 还需由现有独立可信批准/启动路径保留，不能仅依赖 Envelope 自声明，也不能回填到冻结 Runner、Identity 或 Manifest。

本记录不执行 Final Freeze Approval，不创建最终已批准 Binding，不产生任何验签或 Final Preflight 通过结论。

## 新增文件、检查方式及未执行事项

本次仅新增两个文件：

- `execution/snapshot/snapshot-binding.corrected.payload.json`：独立新 Payload，仅改变 `$.status`。
- 本 Markdown 记录：精确身份、Owner 签名输入、Binding 更新要求及新 Final Freeze Approval 交接要求。

工件级检查方式：严格 UTF-8 解码、无 BOM 检查、JSON 解析及递归字段比较、反向 token 替换后逐字节相等检查、canonicalization 格式检查、落盘字节数 / SHA-256 复算，以及本次新增文件的乱码字符扫描。对旧 Payload / Envelope / signature 的保留检查仅为本地字节及哈希检查，不进行密码学验签或 Runner Verification。

未修改 Runner、任何 Identity、Manifest、lockfile、Authority Anchor、Public Key、旧 Payload、旧 signature、旧 Binding 或旧 Final Freeze Approval。

未读取 private key；未签名；未生成 fake signature；未创建新签名文件、新 Binding Envelope 或新 Final Freeze Approval。

未执行 Verification、密码学验签、Final Preflight、Invocation、network、metadata、tarball、candidate、commit 或 push。
