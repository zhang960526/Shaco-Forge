# S3RTC-20260912-01 Release Trust Corrective Evidence

Verdict: `PASS`

Final source inventory SHA-256: `3077e8bf3ed5e8731f9e9fc663be252bef2adf811b5fa9e3c1eab76d444daa48`

Final required gate matrix: `23 / 23 PASS`

现有 Step3 composition gate 已在最终源码上重新 freeze 并返回
`S3G02 CONTROLLED_FINAL_COMPOSITION_GENERATION FROZEN`；其输出位于 `composition/`。

## Evidence index

- `authority-and-run-summary.json`: entry/Frozen authorities、验收状态、候选身份与运行计数。
- `final-source-inventory.json`: 177 个最终 Product Source 文件的 SHA-256 清单。
- `final-gate-results.json`: 23 项最终接受门禁及其 exact attempt/log。
- `command-matrix.json`: 所有尝试，包括失败尝试；每项记录 sourceBefore/sourceAfter。
- `logs/`: 每次门禁的完整 stdout/stderr。
- `runs/package-runtime-2/`: 最终 release manifest、artifact identity、source inventory、packaged files。
- `runs/package-installer-1/`: installer candidate 与 `release-trust-binding.json`。
- `runs/test-installer-1/installer-verification.json`: unsigned/trusted/NSIS/no-toggle 验证。
- `runs/smoke-slice3-step2-2/step2-integration.json`: compatibility、transaction、backup、restore、uninstall、cleanup。
- `FAILED-ATTEMPTS.md`: 已保留失败尝试与处置。
- `composition/`: 现有 Step3 composition gate 的最终源码绑定输出。

`logs/` 是运行器逐字节保留的 stdout/stderr，包含工具原生 CRLF 与末尾空行；这些原始
Evidence 不做 whitespace 规范化。排除 `logs/` 后，staged diff whitespace check 为 PASS。

根目录的 `release-manifest.json`、`artifact-identity.json`、`installer-candidate.json` 与
`release-trust-binding.json` 是对应最终 run 文件的逐字节副本，便于独立复核。

## Acceptance

```text
ACTIVE_RELEASE_TRUST_MODE = GITHUB_OPEN_SOURCE_UNSIGNED
GITHUB_UNSIGNED_RELEASE_POLICY_VERIFIED = PASS
INSTALLER_SHA256_AND_RELEASE_MANIFEST_BOUND = PASS
SIGNING_INTEGRATION_VERIFIED = PASS
TRUSTED_AUTHENTICODE_REGRESSION = PASS
USER_RUNTIME_TRUST_MODE_TOGGLE = ABSENT
PRODUCTION_TRUSTED_CA_SIGNING_EXECUTED = NOT_REQUIRED_FOR_GITHUB_OPEN_SOURCE_UNSIGNED
PROVIDER_RUN_COUNT = 0
SIGNING_RUN_COUNT = 0
REAL_PRODUCT_DATA_ROOT_WRITES = 0
FRESH_WINDOWS = NOT_RUN
```

最终安装器未执行；trusted fixture 仅被构建和静态/纯验证，不属于发布候选。测试使用
OS temp isolated roots，`CLEANUP = PASS` 且 `productAuthorityExists = false`。
