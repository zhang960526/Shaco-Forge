# V1-SLICE-3 Release Trust Product Source Corrective Implementation Record

Date: 2026-09-12

Verdict: `PASS`

State: `CORRECTIVE_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW`

## Authority

- Entry HEAD: `bc7ca960a23842c31602591f2300624ac8557cf6`
- Parent Contract SHA-256: `35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76`
- Frozen Amendment ID: `V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-20260912-01`
- Frozen Amendment SHA-256: `41d59115bca2c67ca45fc86ea13638be74325f7aa46850e7b61f5dd73af08596`
- Frozen Harness HEAD: `cd5ef8148158c3a752a658978873241fdf8e2bbc` (`READ_ONLY / CLEAN`)

Frozen Amendment、Parent Contract、REVIEW-031、Frozen Harness 与历史 Step2 Evidence 均未修改。

## 实现

`release-manifest.json` 新增必填 `ReleaseTrustMode`，只允许
`GITHUB_OPEN_SOURCE_UNSIGNED` 与 `TRUSTED_AUTHENTICODE`。当前 V1 构建在源码内固定为
`GITHUB_OPEN_SOURCE_UNSIGNED`；不存在 CLI、环境变量、Settings、注册表或隐藏 UI override。
缺失或未知值均由 release validation fail closed。

Product-owned `verifyInstallerReleaseTrust` 是唯一运行时分派点。两种模式都重新计算并绑定
installer SHA-256。GitHub unsigned 模式允许 `NotSigned`，但不声明 publisher authenticity；
trusted 模式原样调用现有 `verifyAuthenticode`，继续要求 WinVerifyTrust、signer SHA-256
allowlist、timestamp 与 digest。installer initial gate、transaction initialize/check 均消费该
同一 helper。

NSIS 从已验证 release manifest 接收 compile-time define：unsigned 模式不编译 mandatory
验签路径，trusted 模式保留原验签路径；missing/unknown mode 在编译期失败。没有第二份
installer script，也没有 runtime bypass。

为兼容唯一冻结的 pre-amendment Step1 artifact，增加 exact-artifact compatibility-only reader：
它只接受原始 `STEP1_ARTIFACT` 摘要与旧 schema，不放宽任何当前 release manifest 校验。
冻结 Step1 临时包指针部分文件被外部清理后，测试夹具只从两个可用来源选择与冻结
`packaged-files.json` 的 path/size/SHA-256 全部相符的字节重建隔离副本；冻结 Evidence 不变。

## 候选与绑定

- Result: `GITHUB_OPEN_SOURCE_UNSIGNED_INSTALLER_CANDIDATE`
- Path: `D:\Project\Shaco-Forge\dist\installers\Shaco-Forge-1.0.0-dev.1-1789189887035-github-unsigned.exe`
- Bytes: `162941739`
- Installer SHA-256: `6ebe10b302e3b0df7caa11ba74729bc52e7f6ed60b1f66d16edeb19697c119da`
- Release manifest digest: `ed3ad8dfe55702f9723b9bf160a47affd1ceae2977ea574566609c78ee30419b`
- Packaged artifact digest: `5563534484f65d0eb0b7cf31cc880dc4df5dafe947ca2fe81c3f56d6970b370f`
- Publisher authenticity: `NOT_PROVIDED`
- SmartScreen reputation: `NOT_GUARANTEED`
- Release trust policy satisfied: `true`
- Step2 review pending: `true`
- Final release ready: `false`

外层 Evidence 同时绑定 installer SHA-256、release manifest digest、packaged artifact digest
与 ReleaseTrustMode；没有创建 installer self-hash 循环，也未声称安装器能独立验证 GitHub
服务器上的 hash 真实性。

## 验证

最终 `FINAL_SOURCE_INVENTORY` 包含 177 个 Product Source 文件，清单文件 SHA-256 为
`3077e8bf3ed5e8731f9e9fc663be252bef2adf811b5fa9e3c1eab76d444daa48`。23 项 required
gate 的 sourceBefore/sourceAfter 均为该值且全部 `PASS`。详情见
[Evidence README](evidence/V1-SLICE-3/RELEASE-TRUST-CORRECTIVE/S3RTC-20260912-01/README.md)
与 [final-gate-results.json](evidence/V1-SLICE-3/RELEASE-TRUST-CORRECTIVE/S3RTC-20260912-01/final-gate-results.json)。

专项结果：

```text
GITHUB_UNSIGNED_RELEASE_POLICY_VERIFIED = PASS
INSTALLER_SHA256_AND_RELEASE_MANIFEST_BOUND = PASS
SIGNING_INTEGRATION_VERIFIED = PASS
TRUSTED_AUTHENTICODE_REGRESSION = PASS
USER_RUNTIME_TRUST_MODE_TOGGLE = ABSENT
PRODUCTION_TRUSTED_CA_SIGNING_EXECUTED = NOT_REQUIRED_FOR_GITHUB_OPEN_SOURCE_UNSIGNED
PROVIDER_RUN_COUNT = 0
SIGNING_RUN_COUNT = 0
REAL_PRODUCT_DATA_ROOT_WRITES = 0
```

## 保留状态

`TRUSTED_CA_AUTHENTICODE_PRODUCTION_SIGNING`、`WINDOWS_PUBLISHER_IDENTITY` 与
`SMARTSCREEN_REPUTATION_HARDENING` 保持 `DEFERRED_RELEASE_HARDENING`；
`BUG_S3S2_001` 保持 `OPEN / NON_BLOCKING_CARRY_FORWARD`；Node SQLite experimental risk
保持 `NON_BLOCKING / DEFERRED`；CSP unsafe directive removal 保持
`DEFERRED_SECURITY_HARDENING`。

新非阻断 finding：历史 Step1 Evidence 指向可被系统清理的临时 package root，现已观察到
其中部分文件丢失。冻结清单与身份 envelope 仍完整，且本批能以精确 hash 重建测试副本；
建议后续为冻结 package bytes 增加不可变归档。此 finding 不改变 Frozen Step1 authority。

## 治理终点

```text
V1_SLICE_3_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE = PASS
V1_SLICE_3_STEP2 = CORRECTIVE_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW
V1_SLICE_3_STEP2_FINAL_INDEPENDENT_REVIEW = NOT_STARTED
V1_SLICE_3_STEP2_OWNER_CLOSURE = NOT_PERFORMED
V1_SLICE_3_STEP2_BASELINE = NOT_FROZEN
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
V1_SLICE_3_CLOSURE = NO
V1_SLICE_4 = NOT_STARTED
V1_CURRENT_NEXT_ACTION = INDEPENDENT_REVIEW_OF_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE
```
