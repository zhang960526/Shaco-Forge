# P0.S-6 Lockfile Integrity Corrective Contract

Status: `DRAFT_PLANNING_ONLY`

Contract ID: `P0S6-LICC-20260904-01`

Owner Approval: `NO`

Freeze Status: `NO`

Execution Authority: `NO`

## 目录

1. Contract 身份与草案权限
2. 当前权威状态与历史 provenance
3. 唯一目标与成功条件
4. 范围、非目标与禁止事项
5. 冻结工作区与输入身份
6. 规划期内存派生的预期候选身份
7. 独立执行根与写入隔离
8. Future preflight 与 Authority Gate
9. 单一 Verification/Materialization invocation 与预算
10. 官方 registry metadata 验证模型
11. 官方 tarball bytes 验证模型
12. Corrected lockfile byte-level 派生规则
13. 输入中立性与原始资料保护
14. Evidence Contract 与 finalization 顺序
15. Result Classification
16. Stop Conditions
17. Handoff Boundary
18. 静态验收 Contract
19. Owner Review Fields

## 1. Contract 身份与草案权限

- `P0S6_LICC_ID = P0S6-LICC-20260904-01`
- `P0S6_LICC_STATUS = DRAFT_PLANNING_ONLY`
- `P0S6_LICC_OWNER_APPROVED = NO`
- `P0S6_LICC_FROZEN = NO`
- `P0S6_LICC_EXECUTION_AUTHORITY = NO`
- `P0S6_LICC_VERIFICATION_EXECUTED = NO`
- `P0S6_LICC_CORRECTED_LOCKFILE_CREATED = NO`
- `P0S6_LICC_DEPENDENCY_PREPARATION_AUTHORIZED = NO`
- `P0S6_LICC_RECOVERY_RUNTIME_AUTHORIZED = NO`
- `P0S6_LICC_GLOBAL_PHYSICAL_ATTEMPT_3_AUTHORIZED = NO`
- `P0S7_ALLOWED = NO`

本文件只定义一个待独立审查的受限 Corrective Contract 草案。它本身不授权创建执行根、创建 runner、访问网络、获取 metadata 或 tarball、派生落盘 corrected lockfile、执行 npm、准备依赖、启动 Electron 或进入任何 Runtime。

在 Architecture Owner 明确批准并冻结本 Contract、给出可核验的执行 Authority identity，且所有 Future preflight 条件通过前，任何 LICC 执行请求都必须分类为 `AUTHORITY_BLOCKED`。草案中的 “future execution”“必须”“允许” 仅定义未来若获批后的边界，不构成当前执行授权。

## 2. 当前权威状态与历史 provenance

### 2.1 Planning baseline

- Project root: `D:\Project\Shaco-Forge`
- Branch: `master`
- Planning HEAD: `d93c78e0263ecddcbe5c63709652a86e1f1f5a9b`
- Planning parent: `86c156f1371af0429eed9de4b82a83198781ec62`
- Planning tracked state: `clean`
- Planning staged state: `clean`
- Existing untracked roots:
  - `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/`
  - `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/`

Planning HEAD 只证明本草案的起草上下文。未来执行必须由 Owner-approved/frozen disposition 另行冻结精确的 execution Authority HEAD；不得把本节 Planning HEAD 自动解释为执行 Authority。

### 2.2 当前 P0.S-6 状态

- `P0S6_DRRC_STATE = EXHAUSTED_INCONCLUSIVE`
- `P0S6_DEPENDENCY_PREPARATION = EXHAUSTED`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_USED = 1`
- `P0S6_DEPENDENCY_PREPARATION_INVOCATIONS_REMAINING = 0`
- `P0S6_DEPENDENCY_READINESS = INCONCLUSIVE`
- `P0S6_DEPENDENCY_READINESS_FIRST_FAILURE_BOUNDARY = NPM_CI`
- `P0S6_DEPENDENCY_READINESS_FAILURE_CODE = EINTEGRITY`
- `P0S6_FROZEN_LOCKFILE_ENV_PATHS_INTEGRITY_MISMATCH = CONFIRMED`
- `P0S6_ENV_PATHS_CORRECTIVE_INTEGRITY_FROZEN = NO`
- `P0S6_LOCKFILE_INTEGRITY_CORRECTIVE_CONTRACT_PLANNING = AUTHORIZED_BOUNDED_GOVERNANCE_ONLY_CONTRACT_ONLY`
- `P0S6_LOCKFILE_CORRECTIVE_IMPLEMENTATION = NOT_AUTHORIZED`
- `P0S6_DEPENDENCY_PREPARATION_RETRY = NOT_AUTHORIZED`
- `P0S6_RECOVERY_RUNTIME = NOT_AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = NOT_AUTHORIZED`
- `P0S_INBOX_CLIENT_MODULES_PASS = NOT_PROVEN`
- `P0S_CORDIS_OMISSION_PASS = NOT_PROVEN`
- `CLIENT_MODULE_CORE_PATCH_REQUIRED = UNRESOLVED`
- `P0S7_ALLOWED = NO`

### 2.3 DRRC provenance

- DRRC Contract: `P0S6-DRRC-20260904-01`
- Historical Owner Disposition: `P0S6-DRRC-OD-20260904-PS765-01`
- Preparation ID: `aa96b746-eeca-4a65-a846-ecf5c753e6ab`
- Preparation result: `INCONCLUSIVE`
- First failure boundary: `NPM_CI`
- Failure code: `EINTEGRITY`
- Historical execution Node: `v24.18.0`
- Historical npm: `11.16.0`
- Historical received tarball bytes reported by npm: `3411`

`P0S6-DRRC-OD-20260904-PS765-01` 仅是历史 provenance。它的单次 Dependency Preparation 权限已耗尽，不批准、继承或补充 LICC 执行权限，也不能把 npm error 文本、既有 partial cache 或历史响应提升为 corrected integrity 权威。

## 3. 唯一目标与成功条件

本 Contract 只解决一个问题：在一次独立、受限、非 npm 的 future invocation 中，证明 `env-paths@2.2.1` 官方 registry metadata 与官方 tarball exact bytes 的身份；只有该证明全部通过后，才从冻结 source lockfile bytes 派生一个新的 `corrected-package-lock.json` artifact。

LICC 的完整成功条件同时包含：

1. 官方 metadata 的 package identity、tarball URL、integrity 与 shasum 均满足本 Contract；
2. 本次取得的 exact tarball bytes 同时通过 metadata `dist.integrity` 与 `dist.shasum`；
3. tar/gzip 可解析、archive path 安全，且 archive 内 `package/package.json` 的 name/version 匹配；
4. verified official SRI 精确等于本 Contract 的 expected candidate；
5. corrected lockfile 由冻结 source bytes 做一次等长的 byte-level exact replacement，满足全部 byte identity 与 semantic diff Gate；
6. Evidence 完整，且原 lockfile、DRRC frozen copy、历史 Evidence 和其他受保护输入均未修改。

规划期计算出的 candidate hash 只是 frozen expected candidate。它不能替代 future 官方 metadata/tarball verification，也不能单独授权或证明 corrected artifact。

## 4. 范围、非目标与禁止事项

本 Contract 不得：

- 修改、覆盖、rename、move 或删除 MEC-01 source `package-lock.json`；
- 修改、覆盖、rename、move 或删除 DRRC frozen `package-lock.json`；
- 重写、补写、修复、清理或规范化历史 Evidence；
- 执行 `npm ci`、`npm install`、`npm ls` 或任何 npm/package-manager 命令；
- 创建或准备 `node_modules`、完整依赖树或 npm cache；
- 启动 Electron、Shaco Forge Client、Harness Host、Worker 或产品 Runtime；
- 执行或判断 H-05/H-20；
- 授权 Recovery Runtime 或 Global Physical Attempt #3；
- 改变 `P0S_INBOX_CLIENT_MODULES_PASS`、`P0S_CORDIS_OMISSION_PASS` 或 `CLIENT_MODULE_CORE_PATCH_REQUIRED`；
- 开始、批准或解锁 P0.S-7；
- 使用第三方公开 lockfile、npm error 文本、DRRC partial cache/tarball 或 Quarantine 作为修改权威；
- 执行 package script、archive 内代码或下载得到的任意程序；
- Commit 或 Push。

## 5. 冻结工作区与输入身份

### 5.1 Source lockfile

| Field | Frozen value |
|---|---|
| Absolute path | `D:\Project\Shaco-Forge\docs\04-development-records\experiments\P0S-6-MINIMAL-CLIENT-MODULES\package-lock.json` |
| Canonical relative path | `docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/package-lock.json` |
| Byte length | `30829` |
| SHA-256 | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |
| Encoding profile | UTF-8 without BOM; LF; exactly one final LF |
| `lockfileVersion` | `3` |

### 5.2 DRRC frozen copy

| Field | Frozen value |
|---|---|
| Absolute path | `D:\Project\Shaco-Forge\docs\04-development-records\experiments\P0S-6-DEPENDENCY-READINESS-RECOVERY\package-lock.json` |
| Canonical relative path | `docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/package-lock.json` |
| Byte length | `30829` |
| SHA-256 | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |
| Relation to source | byte-identical |

DRRC frozen copy 是受保护的 historical copy，不是 future corrected output path，也不得成为写入目标。

### 5.3 `env-paths` frozen entry

| Field | Frozen value |
|---|---|
| Package path | `node_modules/env-paths` |
| Version | `2.2.1` |
| Resolved URL | `https://registry.npmjs.org/env-paths/-/env-paths-2.2.1.tgz` |
| Current integrity | `sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgALwKNZ0cf2uqan5GLuS2A==` |
| Current integrity occurrence count in source bytes | `1` |
| Expected candidate occurrence count in source bytes | `0` |

未来执行还必须冻结和验证 Node version `v24.18.0`。Node executable canonical path、byte length、SHA-256、file/product version 与 Authenticode 状态必须写入 future preflight；任何版本差异均为 `AUTHORITY_BLOCKED`，不得静默替换。

### 5.4 Frozen DRRC Evidence identities

Evidence root:

`docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/evidence/aa96b746-eeca-4a65-a846-ecf5c753e6ab`

| Evidence | Bytes | SHA-256 |
|---|---:|---|
| `classification.json` | 303 | `21757cd251e91d674dbb3287e1f21957ce2a135e49732e9d87c49369d69a58a2` |
| `effective-config.json` | 4221 | `199d283e6e78cbf9b23107f744ad48c2233d6fc4cdb14ef8ab8050db63b50c01` |
| `invocation-ledger.jsonl` | 774 | `09e33d3a859b2f6e4317de363d954d50d1be2efd54dacfdb39827f7b1aef071a` |
| `network-sockets.json` | 427 | `24bab97f4996aefa1ee6e4f7cfd19c28a1eea9e80a1a3d46918712c9baf26990` |
| `npm-ci-result.json` | 1048 | `aab3eb0f6387c1114dc1d5c2a9a62beb78e1962bc15f0f8e2f7e7908ed052340` |
| `npm-ci.stderr.log` | 8751 | `b0102f2cdccbbb8f680721aa34c282f433a370cd92ccb08747ee9e325d0f42ca` |
| `npm-ci.stdout.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `npm-logs/2026-09-04T04_09_20_273Z-debug-0.log` | 12298 | `904b18150231a5f42f56f8bfa21859c1cafd4ee838e6f7de8ff6a661bad4101b` |
| `preflight.json` | 9295 | `3b839eb09127bfa76588052dbf07643005cf1b0300b615ffd9e9e7ae173bdd83` |
| `static-gates.json` | 2039 | `7b11c2b05a5498f9184946c0d2232cccb11ea11d06cd06334b444ebcdb381593` |

这些文件仅提供 mismatch 的历史 provenance。它们必须保持 byte-identical，不能单独证明 official candidate，也不能成为 future tarball 或 corrected lockfile 输入。

## 6. 规划期内存派生的预期候选身份

### 6.1 Exact replacement strings

Frozen old完整字符串：

```text
sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgALwKNZ0cf2uqan5GLuS2A==
```

Frozen expected candidate完整字符串：

```text
sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgAlwKNZ0cf2uqan5GLuS2A==
```

两字符串等长，唯一文本差异是 `UgALw` → `UgAlw`。

### 6.2 Prospective corrected lockfile identity

以下结果来自本轮对冻结 source bytes 的只读、内存内 exact replacement，不存在 corrected lockfile 落盘：

| Field | Frozen expected value |
|---|---|
| Source byte length | `30829` |
| Source SHA-256 | `3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd` |
| Old string occurrence count | `1` |
| Candidate string occurrence count in source | `0` |
| Expected corrected byte length | `30829` |
| Expected corrected SHA-256 | `324021454db0194ec09934351591192248911cc0a016856aeff23af2ac93046b` |
| Expected corrected SHA-512 raw hex | `fc86db4543662fb10e15978a6ae96264ca5f2f3caeaa9d4262f9d697c3951b3f3968cd0804d0c58049694b8269d79eb5b9a3eada6b1540226f3e3a8ecb5f9d29` |
| Expected corrected SHA-512 Base64 | `/IbbRUNmL7EOFZeKauliZMpfLzyuqp1CYvnWl8OVGz85aM0IBNDFgElpS4Jp1561uaPq2msVQCJvPjqOy1+dKQ==` |
| Expected byte diff count | `1` |
| Zero-based byte offset | `11305` |
| Human-readable location | line `319`, column `94` (both one-based) |
| Source byte | `0x4C` (`L`) |
| Corrected byte | `0x6C` (`l`) |
| Expected semantic diff path | `node_modules/env-paths.integrity` |
| Exact JSON Pointer | `/packages/node_modules~1env-paths/integrity` |

The expected corrected SHA-512 Base64 value must be recomputed during future execution from the exact corrected bytes. The authoritative frozen hash for the prospective artifact is the raw-hex SHA-512 and SHA-256 above; a Base64 rendering is not used as an independent acceptance authority.

除 `/packages/node_modules~1env-paths/integrity` 外，未来 semantic diff 必须为空。JSON object 比较必须证明 root name、lockfileVersion、package names、versions、resolved URLs、dependency graph、flags、license、engines 及其他字段全部不变。

规划期 expected identity 不得跳过第 10、11 节的官方验证。Future verified metadata SRI 与 tarball computed SRI 必须先共同确认 candidate，之后才可派生 artifact。

## 7. 独立执行根与写入隔离

未来 proposed LICC root：

`docs/04-development-records/experiments/P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE/`

Canonical absolute proposed root：

`D:\Project\Shaco-Forge\docs\04-development-records\experiments\P0S-6-LOCKFILE-INTEGRITY-CORRECTIVE`

本轮不得创建该目录。未来只有经 Owner-approved/frozen execution authority 才能创建它；所有 runner、raw responses、derived verification、ledger、classification 与 corrected artifact 必须位于该独立 root 内。

未来 LICC 不得写入、复用或链接到：

- MEC-01 experiment root；
- exhausted DRRC RecoveryRoot；
- DRRC partial `.npm-cache`、`temp`、`.electron-cache` 或 `node_modules`；
- MEC-01 `node_modules` 或 `.npm-cache`；
- 产品目录或 Frozen Harness；
- Quarantine；
- 用户级、全局或本机其他 npm/Electron cache；
- proposed LICC root 之外的任何路径。

禁止 junction、symbolic link、hard link、reparse-point escape 与 path traversal。Future preflight 必须解析 root 及其所有待写路径的 canonical absolute path，并证明它们都位于 proposed LICC root 内。

## 8. Future preflight 与 Authority Gate

Future execution 进入 invocation boundary 前必须以只读方式证明：

1. Contract ID 精确匹配；Contract 已被 Architecture Owner 明确批准、冻结并授予本次 LICC execution authority；
2. 精确 branch、execution Authority HEAD 与 parent 符合 Owner-frozen disposition，tracked/staged state clean；
3. 初始 untracked state 只包含 Owner disposition 接受的既有 roots 与空的/新建 LICC root；
4. Project root、source path、DRRC frozen copy path 与 Evidence root 的 canonical identity 匹配；
5. 两份 lockfile 的 path、bytes、SHA-256、lockfileVersion 和 byte-identical relation 均匹配第 5 节；
6. `node_modules/env-paths` 的 version、resolved、current integrity 与 occurrence counts 匹配；
7. 第 5.4 节十份 historical Evidence 的 bytes 和 SHA-256 全部匹配；
8. Node 精确为 `v24.18.0`，并记录 executable identity；
9. proposed root 不包含既有 response、tarball、corrected lockfile、cache seed 或可被复用的 partial result；
10. runner 源文件只使用 Node built-in modules，runner exact path、bytes 和 SHA-256 已由 Owner-approved execution disposition 冻结；
11. npm/package-manager executable 不会被调用，child process creation 被禁止；
12. network source 只包含第 10 节 metadata URL 和由本次 raw metadata 给出的第 11 节 tarball URL。

任一 Authority、workspace、runner 或 scope 条件失败时，必须在 network/materialization boundary 前停止并分类 `AUTHORITY_BLOCKED`。任一 source lockfile identity 或 occurrence 条件失败时分类 `INPUT_MISMATCH`，且不得取得 metadata/tarball 或创建 corrected artifact。

## 9. 单一 Verification/Materialization invocation 与预算

Future execution model 冻结为一个 top-level Node `v24.18.0` process，按顺序完成 metadata capture、tarball capture/verification 和条件式 corrected lockfile materialization。它不得生成子进程，不得调用 npm CLI、项目 Node script、Electron 或任何下载内容。

拟议 invocation shape：

```text
<frozen-node-v24.18.0> <LICCRoot>/runner/verify-and-materialize.mjs --contract-id P0S6-LICC-20260904-01
```

本草案不创建 runner，也不授权上述命令。Runner 的 exact bytes、SHA-256 与 execution Authority HEAD 必须在未来 Owner-approved/frozen disposition 中补齐；缺失时为 `AUTHORITY_BLOCKED`。

| Budget | Maximum |
|---|---:|
| Verification/Materialization invocations | `1` |
| Metadata logical GET | `1` |
| Tarball logical GET | `1` |
| Automatic/manual retry | `0` |
| npm command count | `0` |
| `npm ci` count | `0` |
| `npm install` count | `0` |
| Electron launch count | `0` |
| Physical Runtime Attempt count | `0` |

一个 logical GET 可包含最多 `5` 个显式记录的 HTTPS redirect hops；redirect follow-up 属于同一个 logical GET，不构成 retry。连接重试、状态码重试、断流重试、range/resume、第二次下载和 cache fallback 均禁止。

通过 preflight 并写入 `INVOCATION_BOUNDARY_CROSSED` ledger record 后，完整 invocation budget 即计为 used `1`，无论后续 PASS、INCONCLUSIVE 或 INPUT_MISMATCH。任何第二次 invocation 请求必须分类 `AUTHORITY_BLOCKED` 并返回 Architecture Owner。

Future runner 只可使用 Node built-in `https`、`tls`、`crypto`、`fs`、`path`、`url`、`zlib`、`buffer` 及实现受限 tar parsing 所需的语言标准能力。禁止第三方 module、npm cache、HTTP proxy、credential、cookie、custom CA、mirror 和 alternate registry。

## 10. 官方 registry metadata 验证模型

唯一 metadata requested URL：

`https://registry.npmjs.org/env-paths/2.2.1`

Metadata logical GET 必须：

1. 直接由 Node built-in HTTPS 发起，请求 `Accept-Encoding: identity`，不发送认证、cookie 或 npm-specific credential；
2. 保存 final `200` response body 的 exact bytes 为 `registry-metadata.raw.json`，不得 pretty-print、重排、重编码或重序列化；
3. 对每个 request/redirect hop 记录 requested URL、status、`Location`、resolved next URL、UTC request/response timestamps；
4. 记录 final URL、final host、HTTP status、content type、content encoding、response byte length、raw response SHA-256 与 TLS protocol；
5. 要求每一 hop 都是 HTTPS，且 final host 精确为 `registry.npmjs.org`；
6. 要求 final HTTP status 为 `200`，body 完整，且 raw bytes 可作为 UTF-8 JSON object 解析；
7. 对 metadata body 使用受限最大 `1 MiB`；超限或 incomplete body 为 `INCONCLUSIVE`；
8. 不得用历史 npm log、第三方 lockfile、cache 或预设 candidate 填充、替换或修复任何 metadata 字段。

从本次 raw metadata 提取并记录：

- `name`
- `version`
- `dist.integrity`
- `dist.shasum`
- `dist.tarball`
- `dist.unpackedSize`，若存在则记录 exact JSON value；
- metadata 内 key 为 `signatures` 或 `provenance` 的字段，按 JSON Pointer 与原始 JSON value 原样记录；
- 任何等价 attestation/provenance link 字段若存在，也按 JSON Pointer 与原始 value 记录。

缺失的可选 signatures/provenance 字段必须记录为 `present = false`，不得伪造空签名、空 provenance 或验证成功。Raw metadata 是字段内容的最终取证来源。

Metadata identity Gate：

- `name = env-paths`
- `version = 2.2.1`
- `dist.tarball = https://registry.npmjs.org/env-paths/-/env-paths-2.2.1.tgz`
- `dist.integrity` 是单一、可解析的 `sha512-Base64` SRI；
- `dist.shasum` 是可解析的 40 位 SHA-1 lower hex；
- `dist.integrity` 精确等于第 6.1 节 expected candidate。

Tarball requested URL 必须直接来自本次 raw metadata 的 `dist.tarball`。执行器不得用 hard-coded URL 替代 metadata authority；Contract 中的 frozen URL 只充当 equality Gate。

## 11. 官方 tarball bytes 验证模型

Metadata identity Gate 全部通过后，future invocation 才可发起唯一 tarball logical GET。它必须使用本次 raw metadata 的 `dist.tarball` exact string，不得使用 exhausted DRRC partial tarball、任何 npm cache、machine cache、历史 response 或第三方副本。

Tarball GET 必须：

1. 使用 Node built-in HTTPS 与 `Accept-Encoding: identity`；
2. 保存 final `200` body exact bytes 为 `env-paths-2.2.1.tgz`，不做传输后重编码或修复；
3. 记录完整 redirect chain、final URL、final host、HTTP status、content type、content encoding、TLS protocol、timestamps 与 byte length；
4. 要求每一 hop 都是 HTTPS，且 final host 精确为 `registry.npmjs.org`；
5. 使用受限最大 `16 MiB`；body incomplete、超限、网络/TLS 不可用或非 `200` 均为 `INCONCLUSIVE`；
6. 对 exact saved bytes 计算并记录：
   - SHA-512 raw hex；
   - SHA-512 Base64；
   - SRI `sha512-Base64`；
   - SHA-1 raw lower hex；
   - byte length；
   - SHA-256，作为 Evidence file identity；
7. 验证 computed SRI 精确等于本次 metadata `dist.integrity`；
8. 验证 computed SHA-1 精确等于本次 metadata `dist.shasum`；
9. 再次验证 computed SRI 精确等于第 6.1 节 expected candidate。

### 11.1 Archive safety 与 package identity

Runner 必须只在内存中 gunzip 和解析 tar headers，不得 extract archive。它必须：

- 验证 gzip 与 tar 结构完整、checksum/header/block 关系可解析；
- 处理并验证 tar path、USTAR prefix，以及 PAX/GNU long-path 信息；
- 拒绝 absolute path、drive/UNC path、NUL、空 segment、`.`、`..`、反斜杠绕过、Unicode/path normalization escape；
- 对 symlink/hardlink target 进行同等 escape 检查，即使不提取；
- 禁止执行 lifecycle/package script 或 archive 内任何代码；
- 精确读取 archive entry `package/package.json` 的 bytes，解析为 JSON；
- 要求 package JSON `name = env-paths` 且 `version = 2.2.1`；
- 记录 package JSON entry path、byte length、SHA-256、name 与 version；
- 不得把 archive 中的 scripts、files 或 metadata 当作可执行输入。

Future tarball 只能分类为：

- `CORRECTIVE_PROVENANCE_EVIDENCE`
- `NON_NPM_CACHE`
- `NON_RUNTIME_INPUT`
- `NON_H05_H20_EVIDENCE`

后续 Dependency Preparation 不得将该 Evidence tarball 作为 cache seed、offline source 或 installed dependency input，除非新的独立 Owner-approved Contract 明确改变该限制。

## 12. Corrected lockfile byte-level 派生规则

只有第 10 节 metadata Gate 与第 11 节 tarball byte/archive Gate 全部 PASS，verified SRI 又精确等于 expected candidate 后，future invocation 才可进入 corrected lockfile 派生阶段。

派生必须：

1. 重新读取第 5.1 节 source lockfile exact bytes；
2. 重新验证 path、byte length `30829`、SHA-256、UTF-8 without BOM、LF、final LF 与 `lockfileVersion = 3`；
3. 在 source bytes 中精确匹配第 6.1 节 old完整字符串，occurrence count 必须为 `1`；
4. candidate完整字符串在 source bytes 中 occurrence count 必须为 `0`；
5. replacement value 必须直接使用 verified metadata/tarball SRI，并要求它等于 Contract expected candidate；
6. 只做等长 byte-level exact replacement；禁止 JSON parse + reserialize 作为写入方法；
7. 在内存中先完成所有 byte diff、hash、JSON validity 与 semantic diff 验证；
8. 仅在内存 Gate 全部通过后，以 exclusive-create 方式写入新文件 `corrected-package-lock.json`；
9. 不覆盖任何现有 path，不使用原 lockfile 的 rename/move/delete，不用临时文件替换原文件；
10. 写入后重新读取 output exact bytes并复核全部 identity；
11. output byte length 必须为 `30829`；
12. output SHA-256 与 SHA-512 必须精确等于第 6.2 节 frozen expected values；
13. source/output byte diff count 必须为 `1`；
14. 唯一 diff 必须位于 zero-based byte offset `11305`，为 `0x4C` → `0x6C`；
15. human-readable location 必须为第 `319` 行、第 `94` 列；
16. output 必须是有效 JSON，`lockfileVersion` 必须仍为 `3`；
17. 唯一 semantic diff 必须是 `node_modules/env-paths.integrity`，JSON Pointer 为 `/packages/node_modules~1env-paths/integrity`；
18. name、version、resolved、dependency graph 与所有其他 bytes/fields 必须不变；
19. 记录 corrected artifact byte length、SHA-256、SHA-512 与完整 byte/semantic diff Evidence。

如果任何 in-memory Gate 失败，不得创建 corrected artifact。如果 exclusive create 或 post-write verification 失败，保留已经产生的 partial output，不得自动删除、覆盖、rename、修复或提升为 frozen corrected lockfile，并分类 `INCONCLUSIVE` 或 `INPUT_MISMATCH`。

## 13. 输入中立性与原始资料保护

Future execution 前后必须对以下对象记录 path、bytes、SHA-256，并证明未修改：

- source lockfile；
- DRRC frozen lockfile copy；
- 第 5.4 节十份 historical Evidence；
- Contract frozen input documents；
- Shaco Forge tracked/staged worktree；
- Frozen Harness HEAD、lock identity 与 worktree status。

不得递归读取、hash、inventory 或使用：

- DRRC RecoveryRoot `.npm-cache/`、`temp/`、`.electron-cache/`、`node_modules/`；
- MEC-01 `node_modules/`、`.npm-cache/`；
- Quarantine；
- 本机其他 npm/Electron cache。

这些禁止目录的未修改性由 allowed-write enforcement、process capability restriction、canonical path checks、前后 Git状态及 proposed LICC root 内完整 write ledger 证明，不通过递归读取受保护内容来证明。

所有失败时产生的 partial LICC outputs 必须原样保留、明确标注未完成状态，不得自动删除、修复、作为 retry input 或作为后续 Contract 输入。一次失败不恢复 invocation budget。

## 14. Evidence Contract 与 finalization 顺序

所有 derived text Evidence 必须为 UTF-8 without BOM、LF、文件末尾单个 LF、无 trailing whitespace。Raw HTTP body 和 tarball 保持 exact response bytes，不做编码或换行变换。每个 finalized file 必须记录 canonical relative path、byte length 与 SHA-256；tarball 和 corrected lockfile 还必须记录本 Contract 要求的额外 hashes。

| Order | Evidence | Role | Encoding / bytes | Immutability and hash rule |
|---:|---|---|---|---|
| 1 | `preflight.json` | Authority、workspace、Node、runner、source 与 protected identities | UTF-8 JSON | invocation boundary 前 final；final 后 immutable；记录 SHA-256 |
| 2 | `invocation-ledger.jsonl` | invocation count、logical GET count、phase、failure boundary 与 final classification precedence | UTF-8 JSONL | execution 中 append-only；final record 后 immutable；记录 SHA-256 |
| 3 | `registry-metadata.raw.json` | final `200` metadata body exact bytes | opaque exact HTTP body；必须可解析为 UTF-8 JSON | response 完整后先 final；不得重写；记录 bytes/SHA-256 |
| 4 | `registry-metadata-verification.json` | URL/redirect/TLS/HTTP/raw hash、字段提取与 metadata Gates | UTF-8 JSON | raw metadata final 后生成；final 后 immutable；记录 SHA-256 |
| 5 | `env-paths-2.2.1.tgz` | final `200` tarball body exact bytes | opaque binary | response 完整后先 final；不得重写；记录 bytes/SHA-256/SHA-512/SHA-1 |
| 6 | `tarball-verification.json` | hash equality、archive safety、package identity 与 tarball classification | UTF-8 JSON | tarball final 后生成；final 后 immutable；记录 SHA-256 |
| 7 | `source-lockfile-identity.json` | source/DRRC copy identity、entry与 occurrence counts | UTF-8 JSON | upstream verification PASS 后再次捕获；final 后 immutable；记录 SHA-256 |
| 8 | `corrected-package-lock.json` | 条件式新 corrected artifact | source bytes profile；UTF-8 without BOM/LF | 仅 upstream verification PASS 后 exclusive-create；final 后 immutable；记录 bytes/SHA-256/SHA-512 |
| 9 | `byte-diff.json` | source/output完整 byte diff | UTF-8 JSON | corrected artifact final 后生成；final 后 immutable；记录 SHA-256 |
| 10 | `semantic-diff.json` | parsed object 的唯一 semantic diff | UTF-8 JSON | corrected artifact final 后生成；final 后 immutable；记录 SHA-256 |
| 11 | `corrected-lockfile-identity.json` | corrected path、bytes、hashes、JSON/profile与 Gate 汇总 | UTF-8 JSON | byte/semantic diff final 后生成；final 后 immutable；记录 SHA-256 |
| 12 | `classification.json` | 最终 PASS/INCONCLUSIVE/INPUT_MISMATCH/AUTHORITY_BLOCKED 与 Evidence inventory | UTF-8 JSON | ledger final record 后最后生成；final 后 immutable；自身 SHA-256 在 out-of-band final report 返回 |

Finalization 规则：

1. Raw metadata 必须先于 metadata derived verification finalization；
2. Exact tarball 必须先于 tarball derived verification finalization；
3. Metadata 与 tarball verification 均 PASS 前不得创建 corrected lockfile；
4. Corrected lockfile 必须先于 byte diff、semantic diff 与 corrected identity finalization；
5. `classification.json` 必须最后 finalization，并列出每个已存在 Evidence 的 path、bytes、SHA-256、finalizedUtc 与 immutable state；
6. PASS 必须包含表中全部文件；非 PASS 可以缺少尚未达到 phase 的文件，但必须在 ledger/classification 中明确列出 absence reason；
7. Evidence 之间冲突时，exact raw bytes 优先于 derived verification，append-only ledger 优先于 summary count；不得通过编辑 raw Evidence 消除冲突；
8. Evidence 不得包含 secret、credential、cookie、authentication token 或不必要的 machine-private data。

## 15. Result Classification

### 15.1 PASS

只有以下条件全部满足才能分类 `PASS`：

- 官方 metadata URL、name、version、tarball、integrity 与 shasum 全部匹配；
- tarball computed SRI 等于 metadata `dist.integrity`；
- tarball computed SHA-1 等于 metadata `dist.shasum`；
- tar/gzip、archive path 与 `package/package.json` name/version 全部匹配；
- verified official SRI 等于 Contract expected candidate；
- corrected lockfile bytes、hashes、唯一 byte diff 与唯一 semantic diff 全部匹配；
- 第 14 节 PASS Evidence 全部存在、finalized、hash-complete；
- source inputs、DRRC frozen copy、historical Evidence、governance inputs 与 Frozen Harness 未修改；
- invocation、network、npm、Electron、Runtime 与 write budgets 未超限。

### 15.2 INCONCLUSIVE

以下情况分类 `INCONCLUSIVE`：

- 官方 URL、DNS、TLS 或网络不可用；
- metadata 或 tarball 无法完整取得；
- HTTP body、raw Evidence、redirect/TLS/HTTP记录不完整；
- response 超过受限大小，连接中断或无法判定 exact bytes；
- JSON、gzip、tar 或受限 archive parser 因执行基础设施故障而不能完成，但未证明输入本身 mismatch；
- Evidence finalization、exclusive create、fsync/readback 或受限执行基础设施失败；
- 已开始 invocation 的其他非确定性故障使 PASS 无法证明。

`INCONCLUSIVE` 不得创建或提升 corrected lockfile，不恢复 invocation budget，不授权 retry、Dependency Preparation、Runtime 或 P0.S-7。

### 15.3 INPUT_MISMATCH

以下情况分类 `INPUT_MISMATCH`：

- source/DRRC lockfile path、bytes、SHA-256、lockfileVersion、entry identity 或 occurrence count 不匹配；
- historical Evidence identity 不匹配；
- metadata name、version 或 tarball URL 不匹配；
- metadata SRI 不等于 Contract expected candidate；
- computed tarball SRI 或 SHA-1 不等于本次 raw metadata；
- archive path 不安全，tar/gzip invalid，或 package name/version 不匹配；
- corrected output 不满足 exact byte length/hash、单字节 diff、offset/byte value或 JSON validity；
- semantic diff 出现 `node_modules/env-paths.integrity` 以外的任何变化；
- 原 input 或 historical Evidence 发生修改。

发生 `INPUT_MISMATCH` 时不得创建或提升 canonical corrected lockfile；已产生的 partial Evidence/output 原样保留并返回 Architecture Owner。

### 15.4 AUTHORITY_BLOCKED

以下情况分类 `AUTHORITY_BLOCKED`：

- Contract 尚未 Owner-approved、frozen 或未获得明确 LICC execution authority；
- execution Authority HEAD、branch、workspace root、Node/runner identity 不匹配；
- requested action 扩张出第 3、4 节范围；
- 需要第二次 invocation、logical GET retry 或 cache fallback；
- 请求修改/替换任一原 `package-lock.json`；
- 请求执行 npm、Dependency Preparation、Electron、Runtime、H-05/H-20 或 P0.S-7；
- 请求访问 forbidden cache、Recovery partial output 或 Quarantine；
- proposed root/write isolation 无法建立。

当前 Draft 的 execution classification 必须是 `AUTHORITY_BLOCKED`。这不影响 `P0S6_LICC_READY_FOR_INDEPENDENT_REVIEW = YES`。

## 16. Stop Conditions

出现以下任一情况必须立即停止，finalize 当时已有的 bounded Evidence，并返回 Architecture Owner：

1. 未满足 Owner approval/freeze/execution authority；
2. 任一 workspace、Git、Node、runner、source、DRRC copy 或 Evidence identity Gate 失败；
3. 任一 write path 不在 LICC root 内，或发现 link/reparse/path escape；
4. 请求使用 npm、cache、partial tarball、third-party lockfile、Quarantine 或历史 candidate；
5. 需要第二次 invocation、retry、resume 或 range request；
6. metadata URL、redirect、final host、HTTP/TLS、body 或 identity Gate 失败；
7. tarball download、hash、archive safety 或 package identity Gate 失败；
8. verified official SRI 不等于 expected candidate；
9. corrected replacement occurrence count、byte/hash/diff/JSON/semantic Gate 失败；
10. 任一原 lockfile、historical Evidence、governance input、产品目录或 Frozen Harness 被修改；
11. runner 将调用 child process、package script、npm、Electron、Worker、Harness Host 或 Runtime；
12. bounded truthful Evidence 无法完成；
13. 获得任一最终 classification。

Stop 不得自动转为 retry、corrective download、Dependency Preparation、Runtime、Global Physical Attempt #3 或新的 Contract authority。

## 17. Handoff Boundary

Future LICC `PASS` 最多只能产生：

- `P0S6_LOCKFILE_INTEGRITY_CORRECTIVE = PASS`
- `P0S6_CORRECTED_LOCKFILE_FROZEN = YES`
- `P0S6_READY_FOR_CORRECTED_DEPENDENCY_PREPARATION_CONTRACT_PLANNING = YES`

LICC `PASS` 不能产生、推断或授权：

- `P0S6_DEPENDENCY_READINESS = PASS`
- `P0S6_RECOVERY_RUNTIME = AUTHORIZED`
- `P0S6_GLOBAL_PHYSICAL_ATTEMPT_3 = AUTHORIZED`
- `P0S_INBOX_CLIENT_MODULES_PASS = PASS`
- `P0S_CORDIS_OMISSION_PASS = PASS`
- `CLIENT_MODULE_CORE_PATCH_REQUIRED = NO`
- `P0S7_ALLOWED = YES`

未来 corrected Dependency Preparation 必须由新的独立、Architecture Owner-approved/frozen Contract 授权。该 Contract 必须引用 `corrected-package-lock.json` 的 exact canonical path、byte length、SHA-256、SHA-512 以及本 LICC PASS Evidence identity；它不得继承 DRRC 已耗尽的 invocation，也不得将本 LICC tarball Evidence 用作 cache seed。

## 18. 静态验收 Contract

本 Draft 交付前必须证明：

1. 只新增本 Contract 文件；
2. Contract 为 UTF-8 without BOM、仅 LF、文件末尾单个 LF；
3. trailing whitespace 与疑似乱码扫描均为零命中；
4. 必需章节、冻结字段、分类、Evidence、Handoff 与 Owner Review fields 完整；
5. Draft 中不存在 LICC 正向执行授权；
6. source/candidate occurrence counts 可重复为 `1`/`0`；
7. prospective corrected bytes 可重复得到第 6.2 节 identity；
8. prospective byte diff 精确为 `1`，位置/byte value 匹配；
9. prospective semantic diff 精确为一个 integrity 字段；
10. frozen DRRC Contract、治理输入、MEC-01、两份 lockfile 与十份 historical Evidence 未修改；
11. 未递归读取或使用 forbidden cache/partial output/Quarantine；
12. tracked/staged diff 为空；
13. 最终 Git status 只比起始状态新增本 Contract，两个既有 untracked roots 保持原状态；
14. 未执行网络、npm、项目 Node script、Dependency Preparation、Electron、build、test、Commit 或 Push；
15. 返回本 Contract 自身 byte length 与 SHA-256，供独立审查。

本节静态验收只验证草案及规划期内存推导，不执行第 9 至 12 节的 future Verification/Materialization。

## 19. Owner Review Fields

- `P0S6_LICC_ID = P0S6-LICC-20260904-01`
- `P0S6_LICC_STATUS = DRAFT_PLANNING_ONLY`
- `P0S6_LICC_OWNER_APPROVED = NO`
- `P0S6_LICC_FROZEN = NO`
- `P0S6_LICC_EXECUTION_AUTHORITY = NO`
- `P0S6_LICC_VERIFICATION_EXECUTED = NO`
- `P0S6_LICC_CORRECTED_LOCKFILE_CREATED = NO`
- `P0S6_LICC_DEPENDENCY_PREPARATION_AUTHORIZED = NO`
- `P0S6_LICC_RECOVERY_RUNTIME_AUTHORIZED = NO`
- `P0S6_LICC_GLOBAL_PHYSICAL_ATTEMPT_3_AUTHORIZED = NO`
- `P0S6_LICC_READY_FOR_INDEPENDENT_REVIEW = YES`
- `P0S7_ALLOWED = NO`
- `COMMIT_PERFORMED = NO`
- `PUSH_PERFORMED = NO`
