# V1-SLICE-3 Packaging / Compatibility / Release Architecture Contract

| Field | Value |
|---|---|
| Document Role | `V1_SLICE_3_FROZEN_ARCHITECTURE_CONTRACT` |
| Status | `FROZEN_FOR_IMPLEMENTATION` |
| Date | `2026-09-11` |
| Slice | `V1-SLICE-3 = PACKAGING / COMPATIBILITY / RELEASE` |
| Architecture Re-entry | `AUTHORIZED` |
| Planning | `COMPLETED` |
| Review Chain | `REVIEW-028 / FAIL` → `REVIEW-028B / PASS` |
| Architecture Review Blocking Findings | `NONE` |
| S3-AR-001 | `CLOSED_BY_TARGETED_REREVIEW_AND_OWNER_ACCEPTANCE` |
| Architecture Owner Freeze | `ACCEPTED` |
| Freeze Decision | [V1-SLICE-3 Contract Freeze and Step1 Authorization](../04-development-records/V1-SLICE-3-CONTRACT-FREEZE-AND-STEP1-AUTHORIZATION-DECISION.md) |
| Implementation | `AUTHORIZED_NOT_STARTED` |
| Step1 | `PACKAGED_RUNTIME_FOUNDATION / AUTHORIZED_NOT_STARTED` |
| Step2 | `COMPATIBILITY_DISTRIBUTION_UPGRADE_SAFETY / NOT_AUTHORIZED` |
| Step3 | `PACKAGED_RUNTIME_CUMULATIVE_ACCEPTANCE / NOT_AUTHORIZED` |
| Provider Gate | `NO` |
| Signing Execution | `NO` |
| Slice Closure | `NO` |

本文是 Slice3 唯一的 frozen Architecture Contract。它细化现有 P0.5、P6A、P7 与
累计回归 authority 在 Slice3 中的消费方式，不取代 Current State。本次 Governance
Freeze 只授权未来执行 Step1 `PACKAGED_RUNTIME_FOUNDATION`；不表示 Step1 已开始或
PASS，不授权 Step2、Step3、Provider、Signing execution 或 Fresh Windows，也不关闭
REVIEW-012 F-05、任何 Slice3 Step 或 Slice3。

```text
SLICE3_ARCHITECTURE_AND_CONTRACT_CANDIDATE_PERSISTENCE = COMPLETED
SLICE3_ARCHITECTURE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
SLICE3_ARCHITECTURE_REVIEW = PASS_AFTER_S3_AR_001_TARGETED_REREVIEW
SLICE3_ARCHITECTURE_REVIEW_BLOCKING_FINDINGS = NONE
S3_AR_001 = CLOSED_BY_TARGETED_REREVIEW_AND_OWNER_ACCEPTANCE
SLICE3_IMPLEMENTATION = AUTHORIZED_NOT_STARTED
SLICE3_STEP1_IMPLEMENTATION_AUTHORIZATION = YES
SLICE3_STEP1 = PACKAGED_RUNTIME_FOUNDATION / AUTHORIZED_NOT_STARTED
SLICE3_STEP2 = COMPATIBILITY_DISTRIBUTION_UPGRADE_SAFETY / NOT_AUTHORIZED
SLICE3_STEP3 = PACKAGED_RUNTIME_CUMULATIVE_ACCEPTANCE / NOT_AUTHORIZED
PROVIDER_GATE_AUTHORIZATION = NO
SIGNING_EXECUTION_AUTHORIZATION = NO
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
```

[REVIEW-028](../05-reviews/architecture/AUDIT-028-V1-SLICE-3-ARCHITECTURE-CONTRACT-INDEPENDENT-REVIEW.md)
对原始 Candidate 返回 `FAIL`，唯一 Blocking Finding 为 `S3-AR-001`；该历史 Verdict
保持不变。[REVIEW-028B](../05-reviews/architecture/AUDIT-028B-V1-SLICE-3-S3-AR-001-TARGETED-CORRECTIVE-REREVIEW.md)
确认 Corrective `PASS` 且 Blocking Findings `NONE`。Architecture Owner 随后接受该
Re-Review、关闭 S3-AR-001、冻结本 Contract，并只授权尚未开始的 Step1。F-05 仍是
`OPEN_KNOWN_CONSTRAINT`，既有 Signing boundary 保持不变。

## 1. Authority and observed entry baseline

本 Candidate 读取并消费以下现有 authority，不创建第二套 Current State、Development
Map、Compatibility Contract 或 Packaging authority：

- [Document Map](../00-governance/SHACO-FORGE-DOCUMENT-MAP.md)、
  [Documentation Rules](../00-governance/SHACO-FORGE-DOCUMENT-RULES.md) 与
  [Current State](../00-governance/SHACO-FORGE-CURRENT-STATE.md)；
- [V1.0 Master Goal](../01-product/SHACO-FORGE-V1.0-MASTER-GOAL.md) 与
  [V1.0 Development Map](SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md)；
- [Slice2 Owner Closure / Freeze Decision](../04-development-records/V1-SLICE-2-OWNER-CLOSURE-AND-FREEZE-DECISION.md)；
- [Frozen V1 Cumulative Regression Closure Gate](../00-governance/SHACO-FORGE-V1-CUMULATIVE-REGRESSION-CLOSURE-GATE.md)；
- [V1.0 Technical Implementation Baseline](../02-architecture/SHACO-FORGE-V1.0-TECHNICAL-IMPLEMENTATION-BASELINE.md)、
  [System Architecture](../02-architecture/SHACO-FORGE-SYSTEM-ARCHITECTURE.md)、
  [Desktop / Worker Boundary](../02-architecture/SHACO-FORGE-DESKTOP-WORKER-BOUNDARY.md)、
  [Harness Integration Boundary](../02-architecture/SHACO-FORGE-HARNESS-INTEGRATION-BOUNDARY.md)、
  [Data Ownership](../02-architecture/SHACO-FORGE-DATA-OWNERSHIP.md) 与
  [Security Model](../02-architecture/SHACO-FORGE-SECURITY-MODEL.md)；
- [P0.5 Compatibility / Version Candidate](P05-COMPATIBILITY-VERSION.md)、
  [P6A Durability / Recovery](P6A-DURABILITY-RECOVERY.md) 与
  [P7 Packaging / Security / Upgrade](P7-PACKAGING-SECURITY-UPGRADE.md)；
- [P0.S Feasibility Spike](P0S-FEASIBILITY-SPIKE.md)、
  [P0.S-7 Architecture Planning Decision](../04-development-records/P0S-7-ARCHITECTURE-PLANNING-DECISION.md)
  与 [P0.S-7 Final Closure Decision](../04-development-records/P0S-7-CONTROLLED-AGENT-EXECUTION-ARCHITECTURE-VALIDATION-FINAL-CLOSURE-DECISION.md)
  中 packaged runtime、path、identity、integrity、signing 与 Product Runtime 未执行边界；
- [ADR-0004 Pin Harness / Fail Closed](../02-architecture/decisions/ADR-0004-PIN-HARNESS-BASELINE-AND-FAIL-CLOSED-UPGRADES.md)；
- [P0-7 Risk Register / P0.S Input Freeze](../06-testing-acceptance/evidence/P0-7-RISK-REGISTER-AND-P0S-INPUT-FREEZE.md) 中 Packaging、Upgrade、P0.5 与 P7 输入；
- [AUDIT-017](../05-reviews/architecture/AUDIT-017-V1-SLICE-1C-INDEPENDENT-IMPLEMENTATION-REVIEW.md)
  的 NF-1 / NF-3 / NF-4 与
  [REVIEW-012](../05-reviews/architecture/AUDIT-012-V1-SLICE-1A-INDEPENDENT-REVIEW.md)
  的 F-05；
- 当前根、Desktop、Worker package manifest，以及 `scripts/build.mjs`、
  `scripts/runtime-paths.mjs`、`apps/desktop/src/main/main.ts`、
  `apps/desktop/src/main/worker-supervisor.ts`、`apps/desktop/index.html`、
  `apps/worker/src/config.ts`、`apps/worker/src/harness-runtime.ts`、
  `apps/worker/src/profile.ts` 与 `apps/worker/src/index.ts` 的最小只读范围。

Entry facts：Slice1 与 Slice2 均为 `PASS / CLOSED / FROZEN`；Slice2 Closure 为
`YES`；Frozen Harness 是 commit
`cd5ef8148158c3a752a658978873241fdf8e2bbc`、`CLEAN / READ_ONLY`；Slice3
Architecture re-entry 与 Planning 已获授权，Implementation 尚未授权。

现有 Product source 是已冻结能力的开发态 composition，不是 Slice3 packaged
runtime。当前 supervisor 依赖显式绝对路径输入，开发构建从 Harness checkout
物化 runtime overlay；这些是 Slice3 要替换的 development seams，不得成为 release
fallback。P0.S 的 package 规划与风险证据是设计输入，不是当前 Product packaged
runtime 已完成的证明。

## 2. Candidate goal and closure meaning

Slice3 Candidate Goal：将已冻结的 Slice1 + Slice2 产品能力转换为一个 Windows x64
Release Candidate，同时满足：

```text
SELF_CONTAINED
+ IDENTITY_VERIFIED
+ COMPATIBILITY_CHECKED
+ FAIL_CLOSED
+ SAFE_INSTALL_UPDATE_RESTORE
```

Slice3 Closure 必须在当前受控环境针对实际 packaged runtime 执行完整累计 V1 chain；
不得以 Slice2 历史 PASS、开发态 repository path 或单独 package-start smoke 替代。
Fresh Windows final acceptance 属于 Slice4。

## 3. Candidate scope and non-goals

### 3.1 In scope

- Windows x64 单一 Release Candidate；
- bundled Worker Node、bundled pinned Harness、product-owned runtime paths；
- controlled per-user `DSH_HOME`；
- release manifest、packaged-file integrity manifest 与 immutable artifact digest；
- 六身份 compatibility matrix、pre-write fail-closed；
- 单一 installer / distributable strategy、release integrity 与 signing integration boundary；
- installer-driven drain、backup、install、validate、commit、restore 与 uninstall；
- packaged runtime cumulative acceptance；
- AUDIT-017 NF-1 / NF-3、NF-4 carry-forward measurement 与 REVIEW-012 F-05
  final-source disposition。

### 3.2 Non-goals

- 不重新实现 Slice1 / Slice2，不创建第二 Harness 或第二业务 truth；
- 不创建第二 Provider / Model / Credential / Workspace / Session / Conversation truth；
- 不执行 Fresh Windows final acceptance、fresh-machine V1 closure 或 P8 final closure；
- 不执行 real Provider Agent turn；
- 不做 Visual Polish；
- 不做 auto-update daemon、release server、delta update、multiple release channels；
- 不要求 ARM64，不引入 Windows System Service 或 login auto-start；
- 不承诺 Harness data down-migration 或 arbitrary user downgrade；
- 不承诺 arbitrary third-party plugin compatibility；
- 不无 Evidence 扩张 Carrier public Contract，不修改 `MAX_JSON_FRAME = 262144`；
- 不实现未来 Automation / Multi-Agent 能力；
- 不因未来能力引入新的核心架构依赖或 speculative packaging framework。

## 4. Runtime and truth ownership

Shaco Forge owns：

- packaging layout 与 installer；
- bundled Worker Node 与 bundled Harness release bytes；
- Desktop、Worker、native runtime assets 与 release manifest；
- packaged artifact identity、integrity validation 与 compatibility enforcement；
- controlled `DSH_HOME` path selection and injection；
- update、drain、backup、restore、uninstall orchestration；
- Shaco Control Store、Product logs 与 diagnostics。

Harness remains the sole owner of：

- Provider、Model、Credential；
- Workspace、Session、Conversation；
- Tool、Permission、Approval、Question；
- Harness profiles / in-box composition semantics；
- Harness 持久化业务数据与格式语义。

Shaco 可备份和逐字节恢复 Harness-owned durable bytes，但不得解释、复制或迁移成
第二业务 truth。Control Store 只持有 product/control-plane metadata 与 Harness
identity reference。

## 5. Packaged runtime contract candidate

### 5.1 Required runtime properties

```text
PLATFORM = win32
ARCH = x64
NO_SYSTEM_NODE_DEPENDENCY
NO_SYSTEM_PNPM_DEPENDENCY
BUNDLED_WORKER_NODE = 22.19.0 / win32 / x64
BUNDLED_PINNED_HARNESS = @deepseek-ai/dsh@0.1.2-alpha.1
HARNESS_BASELINE_COMMIT = cd5ef8148158c3a752a658978873241fdf8e2bbc
HARNESS_LAUNCH_SEAM = dsh --profile
CONTROLLED_DSH_HOME
```

Release runtime 不得使用 runtime `tsx`、`ts-node`、Harness source deep import、
development repository absolute-path fallback，或 PATH-first Node / Harness discovery。
Electron embedded Node 不替代 Worker Node。所有 native/helper/spawn target 必须来自
manifest-declared product-owned real filesystem path，并针对真正加载它的 runtime ABI
验证。

Production Harness profile identity 使用稳定 Product identity `shaco-forge`；不得继续
使用 `shaco-forge-v1-slice-1b`、`V1-SLICE-*` 或其他历史 Slice label 作为 production
runtime identity。历史 Evidence 与 Review 中的旧 label 保持原文。

### 5.2 Install root and data root separation

Candidate layout：

```text
Product Install Root/
  Desktop/
  Worker/
  runtime/node.exe
  harness/
  native/
  release-manifest.json
  packaged-files.json

%LOCALAPPDATA%/Shaco Forge/
  dsh/                 # controlled DSH_HOME; Harness-owned durable truth
  control/             # Shaco Control Store
  logs/
  diagnostics/
  backup/<transaction-id>/
```

`%LOCALAPPDATA%\Shaco Forge` 的选择依据是现有 Slice2 authority 已将
`%LOCALAPPDATA%\Shaco Forge\logs` 作为 Product-owned log location；Slice3 Candidate
将同一 Windows current-user Local Application Data known-folder 扩展为统一 Product
Data Root。这里的环境变量写法只用于文档显示；实现必须通过受控 Windows known-folder
resolution 得到 canonical absolute path，不信任调用者任意提供的替代根。

Install Root 只持有 release bytes，不持有 mutable user data。Installer binary
replacement 不得覆盖 Product Data Root。Runtime overlay、approved executable profile
bytes 或可执行配置若需要物化，必须在 Install Root 的 release-owned area 或另一个
manifest-bound、不可被普通 durable data 替换的 product-owned runtime area；不得将
可执行 runtime overlay 混入 controlled `DSH_HOME` 的普通可变数据。

### 5.3 Packaging tool selection constraints

本 Candidate 不冻结工具品牌。后续 Step1 只能选择一个能证明以下条件的最小工具链：

- 支持 Windows x64、单一 per-user installer/distributable strategy；
- 能保留 Electron Main / Preload / Renderer 边界与真实磁盘 native/spawn layout；
- 能显式包含 exact Worker Node、Harness bytes、native/helper 与静态 Client assets；
- 能生成确定性的 file inventory / digest 输入并接入 Authenticode signing；
- 无 install-time dependency download，无 system Node / pnpm / Harness 发现；
- 不为未来 channel、daemon、delta 或 server 能力引入新框架。

工具选择、版本、锁定方式与选择证据属于 Step1 implementation record；在 Independent
Architecture Review 与 Owner acceptance 前不得安装 dependency 或执行选择。

## 6. Controlled DSH_HOME contract candidate

Worker 是 packaged mode 下 `DSH_HOME` 的唯一 Product-side resolver/injector：

1. 从 Windows current-user Local Application Data known-folder 解析
   `%LOCALAPPDATA%\Shaco Forge\dsh`；
2. canonicalize 后验证它是稳定、per-user、可写且位于预期 Product Data Root 内；
3. 验证目录及敏感 backup 的 current-user ACL，不接受 shared、install-root、cwd、temp
   或意外 junction/reparse redirection；
4. 将 canonical path 作为 compatibility attestation 的 `dshHome`；
5. 只在启动 pinned `dsh --profile shaco-forge` child 时显式注入 `DSH_HOME`。

Packaged mode 禁止 ambient `DSH_HOME` 或 Desktop caller path 的静默 fallback。
Development/test mode 可继续使用显式隔离绝对路径，但必须通过明确 mode boundary 与
release code path 分开，不能被 packaged runtime 自动采用。

`DSH_HOME` path control 不改变业务 truth ownership：Credential、Settings、Session、
Attachment、Profile 等内容仍由 Harness 定义与持久化；Shaco 只负责选择、保护、备份
和逐字节恢复这个 durable universe。

## 7. Compatibility and pre-write fail-closed

### 7.1 Six handshake identities

继续消费且只保留 P0.5 的六个 version identities：

1. `ProductVersion`
2. `DesktopVersion`
3. `WorkerVersion`
4. `CarrierVersion`
5. `HarnessBaselineVersion`
6. `ControlStoreSchemaVersion`

`ElectronVersion`、Worker Node Version、platform、arch、native ABI 和 packaging tool
version 属于 release manifest/runtime metadata，不扩张所有 handshake。

### 7.2 Matrix rules

每个 release manifest 必须声明 Product release 与 Desktop/Worker/Carrier/Harness/
Control Store 的允许关系。V1 保守策略如下：

- Product、Desktop、Worker 必须匹配 manifest 明确允许的 release tuple；
- Carrier major 必须兼容，具体版本必须落在 Desktop/Worker 都声明支持的集合；
- Harness package version + exact commit 必须与 release baseline 完全一致；
- Worker 必须明确支持当前 Control Store schema；
- normalized `dshHome` 必须与 Worker 解析并 attested 的 current-user durable universe
  完全一致；
- unknown、missing、unparseable 或未列组合一律 fail closed。

最低 mismatch taxonomy：

```text
PRODUCT_RELEASE_MISMATCH
DESKTOP_TOO_OLD
WORKER_TOO_OLD
WORKER_TOO_NEW
DESKTOP_WORKER_MISMATCH
CARRIER_UNSUPPORTED
HARNESS_BASELINE_MISMATCH
CONTROL_SCHEMA_UNSUPPORTED
DSH_HOME_MISMATCH
UPGRADE_IN_PROGRESS
RESTORE_REQUIRED
RELEASE_INTEGRITY_FAILURE
```

Compatibility validation 必须发生在 fresh attachment credential 可用于 Agent write
之前，且早于任何 Harness user-data write。Mismatch 时不得建立 Agent write path，
不得写 Harness user data；只允许 Contract 明确列出的安全只读 diagnostics：版本/
manifest validation result、非敏感 runtime state、经过脱敏的错误码与 log location。
UI 必须返回 actionable reason，不得降级到另一个 Node、Harness、home 或旧 Carrier。

## 8. Release and packaged artifact identity

Slice2 frozen source/composition identity 仅是 Build Provenance，不是 production runtime
identity。Slice3 artifact 必须生成独立的：

- stable Product/release identity；
- Product/Desktop/Worker/Carrier/Harness/Control Store component relations；
- Electron、Worker Node、native ABI、packaging tool runtime metadata；
- platform / arch；
- packaged-file path、size 与 cryptographic digest manifest；
- exact source commit、lock identity、Slice2 source/composition provenance；
- release-manifest digest；
- final installer/distributable immutable artifact digest。

Inside-package manifest 不自称覆盖最终外层 installer bytes。最终 artifact digest 与
签名结果由 release Evidence 绑定到 manifest digest，避免循环 identity。任何 missing、
extra、modified 或 wrong-platform file 都是 `RELEASE_INTEGRITY_FAILURE`，不得启动
Agent write path。

## 9. Installer, integrity and signing boundary

V1 只允许一个 Windows x64、per-user product architecture 优先的 installer /
distributable strategy。不得引入 Windows Service、auto-update daemon、release server、
delta patch、multiple channels 或 ARM64 gate。

Packaged artifact integrity 必须在 install/update 与 packaged startup 的适当边界验证。
Production release signing 是 Slice3 / P7 release requirement；Slice3 最终 Evidence
必须保留 signed installer identity、signature validation result、certificate public
identity / timestamp metadata 与 artifact digest。

Production private signing key 是 Owner/Human-controlled boundary。Codex 与 Product
repository 不得生成、读取、复制、打印、记录或保存 private key。实际 signing action
需要独立明确授权，不由本 Planning Candidate 或后续普通 implementation authorization
隐式授权；没有 Owner-controlled signing Evidence 时不得声称 production release
signing gate 已通过。

Uninstall 必须先有界 drain/stop Worker，再移除当前 manifest-owned install bytes。
默认保留 Product Data Root、controlled `DSH_HOME` 与 backup；删除 durable user data
只能由用户显式选择并单独确认，不能作为普通 uninstall 的静默副作用。

## 10. Update / backup / restore contract candidate

唯一最小 installer-driven transaction：

```text
IDLE
-> CHECKING
-> DRAINING
-> BACKING_UP
-> INSTALLING
-> MIGRATING/VALIDATING as applicable
-> COMMITTED
```

Failure path：

```text
FAILED
-> RESTORING
-> RESTORED
or
-> RESTORE_FAILED
```

`ABORTED` 只用于 install 前的用户/策略取消。状态必须持久化在 Shaco Control Store 或
等价的 Product-owned transaction journal，不能写入 Harness business truth。

Preconditions：

- compatibility、source/target release identity 与 artifact integrity 先通过；
- `DRAINING` 必须拒绝新 mutation 并确认 Worker/Harness 已到可备份边界；
- DRAIN 成功后才可继续；
- backup 必须覆盖 pre-upgrade controlled `DSH_HOME` durable content、Shaco Control
  Store，以及恢复旧 release 所需的 transaction metadata；
- backup 必须验证完整性、可读性、容量与 current-user ACL 后才可进入 INSTALL；
- disk full、backup failed、backup corrupt、Worker crash during backup 均不得进入
  INSTALL。

Restore unit 是旧 binary/runtime 与 pre-upgrade durable backup 的一致 pair。失败时停止
new version，恢复旧 binary/runtime，再逐字节恢复 backup 并验证旧版本启动所需
identity。V1 不承诺 Harness data down-migration，不支持 arbitrary user downgrade；只
允许 compatibility matrix 明确支持的 update/restore route。

## 11. Packaged cumulative regression protocol

Frozen [Cumulative Regression Closure Gate](../00-governance/SHACO-FORGE-V1-CUMULATIVE-REGRESSION-CLOSURE-GATE.md)
保持不变。Slice3 final Closure 必须：

```text
execute the cumulative V1 chain against packaged runtime
```

Gate ledger 必须逐项分类：

- `REPRODUCIBLE`：每个相关 Closure 在当前 packaged runtime 重跑；
- `EXPENSIVE_EXTERNAL_PROVIDER_DEPENDENT`：只有 Contract 真正要求且获得单独 Provider
  Gate authorization 才运行；
- `NOT_PRACTICALLY_REPEATABLE`：只能验证 frozen Evidence 的文件 identity / SHA /
  baseline，并记录 `NOT_RERUN`，不得伪写本次 PASS。

Reproducible chain 从真实 packaged Product startup 开始，累计 Slice1 + Slice2 的
Worker authority、Harness Host、authenticated Carrier、Electron、close/crash survival、
reattach/reconnect、generation fencing、read-only repull、cold projection、Full Shaco
native/interaction 能力，并加入 Slice3 self-contained paths、identity、compatibility、
integrity 与 update-safety gates，最后 bounded cleanup。

```text
PROVIDER_GATE_AUTHORIZATION = NO
```

若未来 Contract 真的要求 active real Agent turn，Executor 必须停止并返回：

```text
PROVIDER_GATE_AUTHORIZATION_REQUIRED
```

## 12. Carry-forward disposition plan

### 12.1 AUDIT-017 NF-1 — target Step1

普通 Product runtime 只保留必要 transport；完整 bounded Evidence Observer 只在显式
evidence/user-loop mode 安装。Step1 必须证明普通 packaged startup 未启用完整 observer，
而 evidence mode 保持既有脱敏、容量与不改变业务值的边界。

### 12.2 AUDIT-017 NF-3 — target Step1

Production artifact/profile/runtime identity 从历史 Slice labels 迁移到 stable Product /
Release identity。历史 Evidence、Review 和 frozen records 中的旧 label 保持原文；迁移
不得用于改写历史或形成第二 Harness profile truth。

### 12.3 AUDIT-017 NF-4 — carry forward to Step3 measurement only

```text
MAX_JSON_FRAME = 262144
PROTOCOL_CONTRACT_CHANGE = NO
```

Step3 在真实 packaged cumulative runtime 中重新测量 frame maximum、headroom 与场景。
无新 Evidence 不修改 frame cap 或 Carrier public Contract；若实测不能满足现有 cap，
停止并返回 Architecture Owner，不在 Slice3 implementation 中自行扩约。

### 12.4 REVIEW-012 F-05 — target Step2

本次基于当前最终 Full Shaco source 的只读重新评估确认 F-05 仍适用：
`apps/desktop/index.html` 与 `apps/desktop/src/main/main.ts` 均仍声明 CSP
`unsafe-eval` / `unsafe-inline`。因此状态保持 `OPEN_KNOWN_CONSTRAINT`，不得假定已关闭。

S3-AR-001 的 Owner-only Gate 固定如下：

```text
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
F05_STATUS = OPEN_KNOWN_CONSTRAINT
F05_CLOSURE_BY_EXECUTOR = FORBIDDEN
F05_CLOSURE_BY_REVIEWER = FORBIDDEN
F05_RESIDUAL_RISK_ACCEPTANCE_OWNER = ARCHITECTURE_OWNER_ONLY
STEP2_CLOSURE_WITHOUT_F05_OWNER_DISPOSITION = FORBIDDEN
```

Step2 Executor 只能收集 Evidence 并提出 Technical Disposition Candidate；Independent
Reviewer 只能验证技术事实、Evidence 完整性和风险边界。最终 F-05 Security
Disposition 以及任何 residual-risk acceptance 只能由 Architecture Owner 明确作出。
在 Owner 明确接受前，测试 PASS、Implementation Review PASS 或普通 implementation
authorization 均不得自动关闭 F-05 或 Step2。

#### PATH A — EXCEPTION REMOVED

Step2 Implementation 可尝试通过 Shaco-owned build / composition / packaging 移除对
`script-src 'unsafe-eval'` 与 `style-src 'unsafe-inline'` 中适用例外的需求。成功时，
Executor 只能返回：

```text
F05_TECHNICAL_DISPOSITION_CANDIDATE = EXCEPTION_REMOVED
```

并提交 final composition Evidence、exact CSP、regression、Renderer isolation 和
packaged runtime Evidence。Independent Reviewer 可验证这些技术事实；但只有
Architecture Owner 明确接受后，`F05_STATUS = CLOSED` 才成立。测试 PASS 本身不关闭
F-05。

#### PATH B — RESIDUAL EXCEPTION REQUIRED

若最终 composition 仍需要一个或多个 CSP 例外，Executor 只能返回：

```text
F05_TECHNICAL_DISPOSITION_CANDIDATE = RESIDUAL_EXCEPTION_REQUIRED
```

Evidence 必须逐项记录：exactly which directive remains、why each directive is
necessary、`unsafe-eval` 是否保留、`unsafe-inline` 是否保留、无 external script
source、无 external style source、Renderer `nodeIntegration = OFF`、
`contextIsolation = ON`、`sandbox = ON`、final packaged composition identity、release
security impact、minimum residual exception 与 residual risk。这仍只是 Technical
Disposition Candidate；最终只能由 Architecture Owner 明确给出：

```text
F05_SECURITY_DISPOSITION = ARCHITECTURE_OWNER_ACCEPTED
or
F05_SECURITY_DISPOSITION = ARCHITECTURE_OWNER_REJECTED
```

普通 implementation authorization 与 Independent Review PASS 均不隐含接受。Owner
未明确接受时，`F05_STATUS = OPEN_KNOWN_CONSTRAINT` 且 `STEP2_CLOSURE = FORBIDDEN`。

若 Shaco-owned build / composition / packaging 无法满足目标，并且关闭或合理处置
F-05 需要修改 Frozen Harness，Executor 必须停止：

```text
STOPPED_FOR_ARCHITECTURE_OWNER
REASON = FROZEN_HARNESS_CHANGE_REQUIRED
```

不得自行修改 Frozen Harness。

## 13. Three implementation steps and acceptance candidates

以下三个 implementation Step 已随本 Contract 冻结；只授权 Step1，且 Step1 仍为
`AUTHORIZED_NOT_STARTED`。Step2 与 Step3 继续 `NOT_AUTHORIZED`。

### STEP1 — PACKAGED_RUNTIME_FOUNDATION

Scope：bundled Worker Node、bundled Harness、product-owned runtime paths、controlled
`DSH_HOME`、release manifest、packaged artifact identity、NF-1、NF-3 与 packaged
startup foundation。

Acceptance candidate：

- Windows x64 staged/distributable runtime 从 product-owned paths 启动 Desktop、Worker
  与 pinned Harness，实际进程证明无 system Node / pnpm / Harness 与 repo/cache fallback；
- Worker 只用 bundled Node 和官方 `dsh --profile shaco-forge` seam；
- Install Root / Product Data Root 分离，Worker resolve/inject/ACL/path mismatch 正负例
  均 fail closed；
- manifest 与 packaged-file inventory 覆盖 Desktop、Worker、Node、Harness、native/
  helper、Client assets、platform/arch、component/provenance identities；
- wrong/missing/extra file、wrong Node/Harness、PATH-only availability 均拒绝启动 write
  path；
- NF-1 与 NF-3 按 §12 完成并有 Evidence；
- dedicated packaged startup gate、full build/typecheck/unit/static 与适用的累计
  non-Provider regression 通过后，交 Independent Implementation Review；不得仅凭
  development smoke 关闭 Step1。

### STEP2 — COMPATIBILITY_DISTRIBUTION_UPGRADE_SAFETY

Scope：compatibility/fail-closed、installer、release integrity、signing integration
boundary、backup、update、restore、uninstall 与 REVIEW-012 F-05 technical disposition
candidate / Owner-only security disposition gate。

Acceptance candidate：

- 六身份 matrix 与所有 §7 mismatch 正反例在 Agent write / Harness write 前生效；
- 单一 per-user Windows x64 installer 完成 install/update/uninstall ownership，默认
  uninstall 保留 durable data；
- packaged-file integrity 与 signature verification fail closed；Owner-controlled signed
  installer Evidence 能与 manifest/artifact digest 对账；
- state transaction、DRAIN、verified backup、install、validate、commit、failure restore
  的成功与故障注入 Evidence 完整；disk full / backup fail/corrupt / Worker crash during
  backup 均证明未进入 INSTALL；
- restore 证明旧 binaries/runtime + pre-upgrade durable backup 成对恢复，不声称
  down-migration 或 arbitrary downgrade；
- F-05 按 §12.4 只由 Executor 给出基于最终 composition 的
  `F05_TECHNICAL_DISPOSITION_CANDIDATE` 及完整 Evidence；Independent Reviewer 只验证
  技术事实和风险边界；需要 Harness change 时返回 Owner，而不是越界实施；
- Architecture Owner 必须对 F-05 Security Disposition / residual risk 作出单独明确
  接受；在该 Owner disposition 前，F-05 保持 `OPEN_KNOWN_CONSTRAINT`，Step2 不得关闭；
- dedicated gates、full regression 与 packaged cumulative non-Provider chain 通过，
  再交 Independent Implementation Review；该 Review PASS 也不能代替 F-05 Owner
  disposition。

### STEP3 — PACKAGED_RUNTIME_CUMULATIVE_ACCEPTANCE

Scope：packaged runtime dedicated gates、full build/typecheck/unit/static、complete
reproducible cumulative V1 non-Provider chain、frozen identity validation、artifact
identity/integrity、NF-4 measurement、bounded cleanup、final Evidence 与 independent
implementation/closure review handoff。

Acceptance candidate：

- 对最终 immutable Windows x64 RC 执行，而不是 staging substitute 或 repository path；
- current packaged Step1 + Step2 dedicated gates 全部真实 PASS；
- full build、typecheck、unit、static 与 complete reproducible cumulative V1
  non-Provider chain 全部真实 PASS；
- 所有使用的 frozen source/Evidence、Harness、manifest、signature、artifact digest
  identity 对账；
- NF-4 只测量并记录实际 maximum/headroom，保持 `262144` 与 Carrier Contract 不变；
- process、temporary transaction state 与 test-only data bounded cleanup；durable backup/
  Evidence 按 Contract 保留；
- gate classification ledger 明确区分三类，Provider 保持 NO；
- 生成 final Evidence 并交 Independent Implementation / Closure Review；该 handoff 本身
  不等于 Slice3 PASS、CLOSED、FROZEN 或 Owner Closure。

不得增加第四个 implementation Step。若实施前独立审查证明存在不可避免的新独立
Contract boundary，只能把理由返回 Architecture Owner，不能自行扩大 Scope。

## 14. Slice4 boundary

Slice3 只生产 Release Candidate，并在当前受控环境验证 packaged runtime。它不得执行
或宣称 Fresh Windows final acceptance、fresh-machine V1 closure 或 P8 final closure。

Slice4 才负责：

```text
Fresh Windows
-> install
-> startup
-> complete cumulative V1 acceptance
-> cleanup
```

## 15. Authorization and stop conditions

REVIEW-028B 已确认 S3-AR-001 Corrective `PASS`，Architecture Owner 已接受并冻结本
Contract。唯一授权是未来执行 Step1 `PACKAGED_RUNTIME_FOUNDATION`；本次 Governance
Freeze 不开始 Step1 implementation。

```text
REVIEW_028 = FAIL / HISTORICAL_PARENT_REVIEW
REVIEW_028B = PASS
SLICE3_ARCHITECTURE_REVIEW = PASS_AFTER_S3_AR_001_TARGETED_REREVIEW
SLICE3_ARCHITECTURE_REVIEW_BLOCKING_FINDINGS = NONE
S3_AR_001 = CLOSED_BY_TARGETED_REREVIEW_AND_OWNER_ACCEPTANCE
SLICE3_ARCHITECTURE_CONTRACT = FROZEN_FOR_IMPLEMENTATION
SLICE3_IMPLEMENTATION = AUTHORIZED_NOT_STARTED
SLICE3_STEP1_IMPLEMENTATION_AUTHORIZATION = YES
SLICE3_STEP1 = PACKAGED_RUNTIME_FOUNDATION / AUTHORIZED_NOT_STARTED
SLICE3_STEP2 = COMPATIBILITY_DISTRIBUTION_UPGRADE_SAFETY / NOT_AUTHORIZED
SLICE3_STEP3 = PACKAGED_RUNTIME_CUMULATIVE_ACCEPTANCE / NOT_AUTHORIZED
SLICE3_CLOSURE = NO
SLICE4 = NOT_STARTED
PROVIDER_GATE_AUTHORIZATION = NO
SIGNING_EXECUTION_AUTHORIZATION = NO
REVIEW_012_F_05 = OPEN_KNOWN_CONSTRAINT
F05_SECURITY_DISPOSITION = PENDING_ARCHITECTURE_OWNER_ACCEPTANCE
F05_STATUS = OPEN_KNOWN_CONSTRAINT
F05_CLOSURE_BY_EXECUTOR = FORBIDDEN
F05_CLOSURE_BY_REVIEWER = FORBIDDEN
F05_RESIDUAL_RISK_ACCEPTANCE_OWNER = ARCHITECTURE_OWNER_ONLY
STEP2_CLOSURE_WITHOUT_F05_OWNER_DISPOSITION = FORBIDDEN
V1_CURRENT_NEXT_ACTION = EXECUTE_V1_SLICE_3_STEP1_PACKAGED_RUNTIME_FOUNDATION
```

若需要重新设计 Slice1/Slice2、修改 Frozen Harness、改变业务 truth ownership、修改
Carrier public Contract、修改 `MAX_JSON_FRAME`、执行 Provider/signing/Fresh Windows，
或引入新的核心架构依赖，Executor 必须停止并返回 Architecture Owner。

若 F-05 disposition 需要 Frozen Harness change，必须以
`STOPPED_FOR_ARCHITECTURE_OWNER / FROZEN_HARNESS_CHANGE_REQUIRED` 停止。Production
private signing key 继续仅由 Owner/Human 控制；普通 implementation authorization 不等于
signing authorization；没有 Owner-controlled signing Evidence，不得宣称 Signing Gate
PASS。

## 16. Governance freeze validation boundary

本次只允许 Review/Owner Decision 持久化、Freeze/authorization metadata 与 Current
next-action 治理同步，以及 Markdown local-link、UTF-8/BOM/mojibake、secret/redaction、
diff whitespace、changed-file scope 与 authority consistency 静态检查。REVIEW-028B 仅按
Owner 提供的外部只读 Review transcript 持久化，不是本 Executor 的新 Review run。
Runtime、Build、Typecheck、Unit、Electron、Worker、Harness Runtime、Provider、Packaging、
Installer、Signing、Migration、Backup / Restore 与 Fresh Windows 全部 `NOT RUN`；不得把
静态文档检查写成 implementation PASS。
