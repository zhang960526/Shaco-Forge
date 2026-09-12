# V1-SLICE-3 Release Trust / Signing Requirement Amendment

| Field | Value |
|---|---|
| Amendment ID | `V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-20260912-01` |
| Document Type | `SLICE3_RELEASE_TRUST_SIGNING_REQUIREMENT_CONTRACT_AMENDMENT` |
| Status | `FROZEN_FOR_IMPLEMENTATION` |
| Date | `2026-09-12` |
| Parent Contract | [V1-SLICE-3 Packaging / Compatibility / Release Architecture Contract](V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md) |
| Parent Contract SHA-256 | `35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76` |
| Scope | `SIGNING_AND_RELEASE_TRUST_ONLY` |
| Independent Targeted Architecture Review | [REVIEW-031](../05-reviews/architecture/AUDIT-031-V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-INDEPENDENT-REVIEW.md) / `PASS` |
| Architecture Owner Freeze | [Accepted](../04-development-records/V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-FREEZE-AND-CORRECTIVE-AUTHORIZATION-DECISION.md) |
| Implementation Corrective | `REQUIRED / AUTHORIZED_NOT_STARTED` |

本文采用既有 [Slice2 Carrier Lifecycle Amendment](V1-SLICE-2-CARRIER-LIFECYCLE-AMENDMENT.md)
的局部 amendment authority 模型：Parent Contract 保持 frozen、原文与历史语义不被
改写；本 Amendment 只包含下文精确列出的 Signing / Release Trust delta，不形成第二套
完整 Slice3 Contract。[REVIEW-031](../05-reviews/architecture/AUDIT-031-V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-INDEPENDENT-REVIEW.md)
已返回 `PASS / BLOCKING_FINDINGS_NONE`，Architecture Owner 已接受并 freeze；本 Amendment
现为 active local authority。

```text
AMENDMENT_ARCHITECTURE_REVIEW = PASS
AMENDMENT_REVIEW_BLOCKING_FINDINGS = NONE
AMENDMENT_ID = V1-SLICE-3-RELEASE-TRUST-SIGNING-AMENDMENT-20260912-01
ARCHITECTURE_OWNER_AMENDMENT_FREEZE = ACCEPTED
AMENDMENT_STATUS = FROZEN_FOR_IMPLEMENTATION
AMENDMENT_EFFECTIVE = YES
PARENT_CONTRACT = V1-SLICE-3-PACKAGING-COMPATIBILITY-RELEASE-ARCHITECTURE-CONTRACT-CANDIDATE.md
PARENT_CONTRACT_SHA256 = 35152ace7e1bb85ad6ecec801e20202d55ee960acb2137340ae932777da1bf76
V1_RELEASE_DISTRIBUTION_MODEL = GITHUB_OPEN_SOURCE_RELEASE
TRUSTED_CA_CODE_SIGNING = NOT_A_V1_PRODUCT_REQUIREMENT
TRUSTED_CA_AUTHENTICODE_SIGNING_REQUIRED_FOR_V1 = NO
UNSIGNED_WINDOWS_GITHUB_RELEASE_ALLOWED = YES
GITHUB_OPEN_SOURCE_UNSIGNED = ACTIVE_V1_RELEASE_TRUST_MODE
TRUSTED_AUTHENTICODE_SIGNING = DEFERRED_RELEASE_HARDENING
SIGNING_INTEGRATION = RETAINED
TRUSTED_AUTHENTICODE_MODE = SUPPORTED_BUT_NOT_REQUIRED_FOR_GITHUB_OPEN_SOURCE_V1
V1_SLICE_3_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE_AUTHORIZATION = YES
V1_SLICE_3_STEP2 = CORRECTIVE_AUTHORIZED_NOT_STARTED
V1_SLICE_3_STEP3 = NOT_AUTHORIZED
```

## 1. Architecture Owner product decision and rationale

V1 的实际发行模型是源码公开于 GitHub、Windows 打包产物发布于 GitHub Releases 的
开源发行，不是 Microsoft Store 商品。Architecture Owner 不计划为 V1 购买商业或
trusted CA Code Signing Certificate。V1 的首要目标仍是证明最薄、真实、可运行的端到端
产品链路；[V1 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md) 要求 fresh
Windows 用户可以 install、launch、使用 Worker/Harness、recover、通过兼容的 pinned
release update，并对不兼容 identity fail closed，但没有要求 commercial trusted-CA
publisher identity。

因此，把 Production trusted-CA Authenticode execution 作为 V1 Step2 不可替代的
blocking gate，与实际产品发行模型不一致。本 Amendment 修正该 mismatch，同时明确
保留已完成的 signing integration，不把 digest 完整性描述成 publisher authenticity。

## 2. Precisely superseded Parent Contract clauses

本 Amendment 已生效，并仅局部 supersede Parent Contract 中以下 signing 语义：

1. **§9 “Installer, integrity and signing boundary” 第二段**：将“Production release
   signing 是 Slice3 / P7 release requirement”以及无 production signing Evidence
   不得通过 release signing gate 的无条件要求，替换为 §4 的 Release Trust Mode 条件规则。
2. **§13 STEP2 Acceptance candidate 第三项**：保留 packaged-file integrity fail-closed；
   将 signature verification 与 Owner-controlled signed installer Evidence 的无条件
   blocking 要求，替换为 §5 和 §6 的 mode-specific acceptance。
3. **§13 STEP3 Acceptance candidate 第五项中的 `signature` identity**：仅在 immutable
   Release Policy 选择 `TRUSTED_AUTHENTICODE` 时为必需对账项；其他 frozen source、
   Evidence、Harness、manifest 与 artifact digest identity 对账要求不变。
4. **§15 signing stop/authorization 条款中的适用范围**：private key 与 signing execution
   仍为 Owner/Human-controlled boundary，但只在 Release Policy 选择
   `TRUSTED_AUTHENTICODE` 时成为 blocking gate；`GITHUB_OPEN_SOURCE_UNSIGNED` 不需要
   signing execution，也不由普通 implementation authorization 隐式执行 signing。

上述 supersede 由 REVIEW-031 PASS 和 Architecture Owner freeze 生效；Parent Contract
继续保持原有 frozen authority、文件字节与 SHA-256。本文件不得被解释为改写 Parent
Contract 的其他段落或其历史状态。

## 3. Preserved Parent Contract and product boundaries

除 §2 精确列出的 signing delta 外，Parent Contract 全部保留，尤其包括：

- §1 authority / entry baseline、§2 V1 boundaries、§3 ownership、§4 packaged runtime、
  §5 path、§6 Control Store、§7 六身份 compatibility matrix、§8 release identity；
- §9 的 Windows x64 per-user installer architecture、package/runtime integrity、
  uninstall/data-preservation 与 private-key handling boundary；
- §10 update/backup/restore transaction、§11 failure matrix、§12 acceptance ownership；
- §13 的三个且仅三个 implementation Steps，以及 compatibility、Control Store、DRAIN、
  backup、update、restore、uninstall、F-05 和 cumulative acceptance gates；
- §14 Slice4 Fresh Windows boundary、§15 除精确 signing delta 外的 authorization/stop
  conditions、§16 validation boundary。

以下跨文档边界也完全不变：Frozen Harness baseline、Carrier public Contract、
`MAX_JSON_FRAME = 262144`、Control Store ownership、六身份原则、Step1 frozen baseline、
F-05 Owner disposition、Provider authorization、Step3 scope 与 Slice4 scope。不得借本
Amendment 引入 marketplace/store/cloud signing、复杂 channel/trust framework 或第四个
implementation Step。

## 4. Minimal Release Trust Modes

V1 只定义两个 Release Trust Mode，当前 active mode 为
`GITHUB_OPEN_SOURCE_UNSIGNED`：

```text
RELEASE_TRUST_MODE = GITHUB_OPEN_SOURCE_UNSIGNED | TRUSTED_AUTHENTICODE
ACTIVE_V1_RELEASE_TRUST_MODE = GITHUB_OPEN_SOURCE_UNSIGNED
RELEASE_TRUST_MODE_AUTHORITY = IMMUTABLE_RELEASE_BUILD_AUTHORITY
USER_RUNTIME_TRUST_MODE_TOGGLE = FORBIDDEN
```

Release Trust Mode 必须由不可变的 release/build authority 固定，例如 release manifest
或与 packaged release 绑定的 policy。它不是 debug bypass，也不得由用户、命令行、环境
变量、Settings 或运行时配置切换。生产代码不得提供 `--skip-signature`、
`ALLOW_UNSIGNED`、`disable-signature=true` 或同等旁路。

### 4.1 `GITHUB_OPEN_SOURCE_UNSIGNED`

这是 GitHub Open Source V1 的正式 Release Policy。Release Evidence 至少必须绑定：

- exact source commit 与 tag；
- immutable release manifest 及其 digest；
- packaged artifact digest 与 installer SHA-256；
- packaged-file path / size / SHA-256 manifest；
- Frozen Harness exact identity；
- platform / arch；
- Product、release 与 component identities；
- 六身份 compatibility matrix；
- package/runtime integrity；
- update、backup、restore、uninstall safety；
- 可审查的 release Evidence。

该模式的声明边界是：

```text
WINDOWS_TRUSTED_PUBLISHER_IDENTITY = NOT_PROVIDED
AUTHENTICODE_SIGNATURE = NOT_REQUIRED
WINDOWS_SMARTSCREEN_REPUTATION = NOT_GUARANTEED
VERIFIED_PUBLISHER_CLAIM = FORBIDDEN
TRUSTED_WINDOWS_PUBLISHER_CLAIM = FORBIDDEN
SMARTSCREEN_BYPASS_CLAIM = FORBIDDEN
PRODUCTION_AUTHENTICODE_SIGNED_CLAIM = FORBIDDEN
```

### 4.2 `TRUSTED_AUTHENTICODE`

该模式保留并继续支持现有能力：WinVerifyTrust、public certificate SHA-256 allowlist、
certificate public identity、trusted signature、timestamp verification、signature failure
handling 以及 signed installer identity/digest 与 release Evidence 对账。只有 immutable
Release Policy 选择该模式时，trusted signature、allowlisted publisher identity、timestamp
和 signing Evidence 才是 Blocking Gate。

未来若 Owner 提供 trusted signer，可经明确 authority 重新启用该模式；private key 仍不得
由 Codex、Product repository 或普通 runtime 生成、读取、复制、打印、记录或保存。

## 5. Integrity and publisher-authenticity boundary

`GITHUB_OPEN_SOURCE_UNSIGNED` 可以通过 SHA-256、manifest 与 provenance Evidence 证明：

- 下载的 asset 是否是 release authority 预期的 bytes；
- packaged bytes 是否匹配 release manifest；
- exact source/build provenance；
- package 内部 payload integrity 与 identity consistency。

它不能通过 Windows Authenticode 证明该 EXE 一定由 Shaco Forge 的受信任发布者签发。
SHA-256 是完整性标识，不是 CA publisher identity 的替代品。V1 明确接受这一边界：

```text
PUBLISHER_AUTHENTICITY_VIA_WINDOWS_AUTHENTICODE = NOT_PROVIDED
GITHUB_UNSIGNED_DISTRIBUTION_LIMITATION = ACCEPTED_OPEN_SOURCE_DISTRIBUTION_LIMITATION
```

Release 文案、安装器 UI、Product UI 与 Evidence 必须诚实保持该边界，不得伪装
Verified Publisher 或暗示 SmartScreen reputation/bypass 保证。

## 6. Frozen Step2 signing/release-trust acceptance

当前 GitHub Open Source V1 的 Step2 signing-related acceptance 为：

```text
SIGNING_INTEGRATION_VERIFIED = PASS
GITHUB_UNSIGNED_RELEASE_POLICY_VERIFIED = PASS
INSTALLER_SHA256_AND_RELEASE_MANIFEST_BOUND = PASS
PRODUCTION_TRUSTED_CA_SIGNING_EXECUTED = NOT_REQUIRED_FOR_GITHUB_OPEN_SOURCE_UNSIGNED
```

`SIGNING_INTEGRATION_VERIFIED` 必须确认现有 WinVerifyTrust、allowlist、timestamp、failure
handling 与 Trusted Authenticode mode 未被删除或降级。其余两个 PASS 必须来自未来
Product Source Corrective 和相应 Evidence，不能由本文档静态声明代替。

兼容性、Control Store、DRAIN、backup、update、restore、uninstall、F-05、dedicated gates、
full regression、packaged cumulative non-Provider chain、Independent Review 和 Owner closure
等其他 Step2 Gate 全部保持；本 Amendment freeze 本身不关闭 Step2。

## 7. Future implementation corrective

当前 Product production installer 会 mandatory reject unsigned installer。Architecture
Owner 已授权后续独立批次执行最小 Product Source Corrective；本批次尚未开始。Corrective
必须：

1. 从 immutable release manifest / packaged release policy 读取并验证 Release Trust Mode；
2. 在 `GITHUB_OPEN_SOURCE_UNSIGNED` 下，以 installer SHA-256、release-manifest binding、
   packaged-file inventory、provenance、compatibility 与 transaction safety 作为正式 gate；
3. 在 `TRUSTED_AUTHENTICODE` 下继续 mandatory WinVerifyTrust、certificate SHA-256
   allowlist、timestamp 与 signed-installer digest gate；
4. 确认不存在用户可启用的 unsigned/signature bypass；
5. 生成 targeted Evidence，再交 Independent Implementation Review 与 Owner closure。

```text
IMPLEMENTATION_CORRECTIVE_REQUIRED = YES
IMPLEMENTATION_CORRECTIVE_AUTHORIZATION = YES
IMPLEMENTATION_CORRECTIVE_STATUS = AUTHORIZED_NOT_STARTED
PRODUCT_SOURCE_CHANGE_IN_THIS_BATCH = NO
RUNTIME_BUILD_TEST_PACKAGING_SIGNING_IN_THIS_BATCH = NOT_RUN
```

## 8. Step3 and Slice4 obligations

Step3 仍是 `PACKAGED_RUNTIME_CUMULATIVE_ACCEPTANCE / NOT_AUTHORIZED`，必须对最终 immutable
Windows x64 RC 执行 packaged cumulative acceptance。本 Amendment 不缩小其 scope，也不
把 Step2 的既有测试结果冒充 Step3 Evidence。

Slice4 仍负责 Fresh Windows final acceptance，并必须实际验证 unsigned GitHub release：

- 可以安装，且 Windows warning / unknown publisher 行为被诚实记录；
- Product 不伪装 Trusted Publisher；
- 安装后 runtime 正常；
- 完整 V1 install → launch → Worker/Harness use → recover → compatible pinned update →
  incompatible identity fail-closed 链路 PASS。

Unsigned release 不取消或弱化 Fresh Windows 测试。

## 9. Deferred and retained issues

```text
DEFERRED_RELEASE_HARDENING:
- TRUSTED_CA_AUTHENTICODE_PRODUCTION_SIGNING
- WINDOWS_PUBLISHER_IDENTITY
- SMARTSCREEN_REPUTATION_HARDENING

BUG_S3S2_001 = OPEN / NON_BLOCKING_CARRY_FORWARD
NODE_SQLITE_EXPERIMENTAL_RISK = NON_BLOCKING / DEFERRED
CSP_UNSAFE_EVAL_INLINE_REMOVAL = DEFERRED_SECURITY_HARDENING
```

Deferred 表示当前 V1 不把这些项目作为 GitHub Open Source release 的 blocking gate，
不表示风险或工作不存在。[F-05 Security Disposition and Signing Gate Decision](../04-development-records/V1-SLICE-3-STEP2-F05-SECURITY-DISPOSITION-AND-SIGNING-GATE-DECISION.md)
继续作为 F-05、Node SQLite 与 CSP residual-risk 的历史/现行 authority；其中 §5/§6 的
“signing-only remaining gate”语义，在本 Amendment 生效后仅按本文 §2 的精确范围被
局部取代。[Issue and Bug Index](../04-development-records/ISSUE-AND-BUG-INDEX.md) 与
[BUG-S3S2-001 Incident](../04-development-records/incidents/BUG-S3S2-001-WINDOWS-CREDENTIAL-RENAME.md)
保持不变。

## 10. Frozen authority and authorization boundary

```text
INDEPENDENT_TARGETED_ARCHITECTURE_REVIEW = REVIEW-031 / PASS
AMENDMENT_REVIEW_BLOCKING_FINDINGS = NONE
AMENDMENT_FREEZE = ACCEPTED
AMENDMENT_EFFECTIVE = YES
IMPLEMENTATION_CORRECTIVE_AUTHORIZATION = YES
IMPLEMENTATION_CORRECTIVE_STATUS = AUTHORIZED_NOT_STARTED
STEP2_CLOSURE = NO
STEP2_BASELINE = NOT_FROZEN
STEP3_AUTHORIZATION = NO
SLICE3_CLOSURE = NO
PROVIDER_AUTHORIZATION = NO
SIGNING_EXECUTION_AUTHORIZATION = NO
READY_FOR_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE = YES
NEXT_ACTION = EXECUTE_V1_SLICE_3_RELEASE_TRUST_IMPLEMENTATION_CORRECTIVE
```

REVIEW-031 已确认：精确 supersede 范围没有扩大；Integrity 与 Publisher Authenticity
没有混淆；两个 mode 足够且没有 runtime bypass；Trusted Authenticode 能力被保留；
Step2 其他 gate、Step3 和 Slice4 未被削弱；deferred/known issues 仍在 authority chain 中。
Owner freeze 与 corrective authorization 不等于 Corrective 已开始，不关闭 Step2、不冻结
Step2 baseline、不授权 Step3/Provider/Signing，也不开始 Slice4。
