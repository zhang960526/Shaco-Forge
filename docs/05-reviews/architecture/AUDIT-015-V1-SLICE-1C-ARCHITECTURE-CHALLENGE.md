# Shaco Forge — V1-SLICE-1C Architecture Challenge

| Field | Value |
|---|---|
| Audit ID | `AUDIT-015` |
| Review Role | `INDEPENDENT_ARCHITECTURE_CHALLENGE` |
| Review Date | `2026-09-08` |
| Review Scope | `V1-SLICE-1C_EMBEDDED_REAL_HARNESS_USER_LOOP_CONTRACT` |
| Persisted Status | `COMPLETE / PASS` |
| Product Tests Executed | `NO` |
| Repository Record Type | `FAITHFUL_PERSISTED_ARCHITECTURE_CHALLENGE` |

本文忠实持久化 Architecture Owner 提供的 Claude Opus 5 Independent Architecture
Challenge 结论及其 non-blocking findings。它是 Architecture Challenge 记录，不是
Product Implementation Review，不声称 Challenge 运行了 Product tests、Harness
runtime、Provider、Prompt 或 Tool。

## 1. Verdict

```text
ARCHITECTURE_CHALLENGE_VERDICT = PASS
BLOCKING_FINDINGS = NONE
1C_SCOPE_VERDICT = EMBEDDED_REAL_HARNESS_USER_LOOP = YES
SHELL_BOUNDARY = PASSIVE_TRUTHFUL_WRAPPER = ACCEPT
FUNCTIONAL_REUSE = APPWEBENTRY = YES
IMPLEMENTATION_READINESS = READY_TO_PERSIST_1C_CONTRACT
```

Challenge 认为 1C 可以以 mounted AppWebEntry 为 primary real-user-loop owner，
通过 Frozen 1B authenticated Carrier 复用 Harness-owned Workspace、Session、Prompt、
stream、Tool/Result、Approval/Question、Provider/model/credential 与 Permission。

`READY_TO_PERSIST_1C_CONTRACT` 只表示允许忠实持久化 Contract；不等于
Implementation started、Implementation allowed 或 Implementation PASS。

## 2. Non-Blocking Findings

以下 C-1 至 C-7 是必须写入 Contract 的内容修正，不是 Blocking architecture
defects。对应修正已持久化至
[1C Contract](../../03-v1.0-plan/V1-SLICE-1C-EMBEDDED-REAL-HARNESS-USER-LOOP-CONTRACT.md)。

### C-1 — UI allocation / Sidebar reconciliation

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

1C 使用 `PASSIVE_TRUTHFUL_WRAPPER`，Project/Session navigation 委托给真实
AppWebEntry；external public control seam 缺失时不使用 private `ctx`。Final
V1-SLICE-1 Sidebar、Session projection、Native Picker 与 Settings integration
requirements 仍为 open，延后至尚未冻结命名的 bounded Slice-1 integration gate。

### C-2 — MAX_JSON_FRAME compatibility

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

`MAX_JSON_FRAME = 262144` 保持不变。Controlled proof 主动保持 Prompt、marker 与
Tool result 远小于 cap；若真实合法 frame 超限，必须
`CARRIER_CONTRACT_AMENDMENT_REQUIRED`，不得 silent raise 或发明 chunk protocol。

### C-3 — Tool-selection nondeterminism

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

冻结最多两次真实 Session attempts。首次健康但未选择 read tool 保留
`MODEL_TOOL_SELECTION_NOT_OBSERVED`；第二次仍未观察到 Tool 时结果为
`INCONCLUSIVE_MODEL_BEHAVIOR`，不得 fake PASS。

### C-4 — Full-loop concurrency / lifecycle

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

Gate 限定一个 active Agent Turn，同时允许同一 AppWebEntry 的正常 background
streams。必须复用 1B credits、queue capacity、single pull 与 three-source
cancellation，并验证无 overflow、orphan、terminal loss 或 credit violation。

### C-5 — Second Client evidence risk

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

Evidence 必须 observation-only，并来自同一 mounted AppWebEntry/Preload/Main/
Carrier/Worker/Host context。第二 AppWebEntry、第二 Client connection、第二 Remote
context 与 direct test `session/prompt` 均禁止。

### C-6 — Provider/network vs Product failure classification

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

Credential 缺失、Provider misconfiguration、Provider/network failures 分别使用
Contract 指定的 Harness-domain classification；Carrier、Renderer、Worker、bridge、
framing、stream/tool transport、truthfulness、secret 与 evidence-context defects 才
属于 Shaco Product Failure。

### C-7 — Approval/Question settlement determinism

**Disposition: `CONTRACT_CONTENT_CORRECTED / NON_BLOCKING`**

Approval/Question 在 1C 为 conditional。自然触发时必须使用真实 `$events`
waterfall、真实 UI、exactly one settlement，并让 original await resume；禁止
duplicate settlement/replay，也不得故意制造危险升级以取得 Evidence。

## 3. Challenge Boundary

```text
CHALLENGE_RAN_PRODUCT_TESTS = NO
CHALLENGE_RAN_PROVIDER = NO
CHALLENGE_SENT_PROMPT = NO
CHALLENGE_MUTATED_WORKSPACE_OR_SESSION = NO
CHALLENGE_CLAIMS_IMPLEMENTATION_PASS = NO
```

Challenge 的 PASS 仅评价已决定 Architecture 在修正 Contract content 后是否可被
持久化。它不验证实现，也不关闭 1C 或完整 Slice 1。

## 4. Final Audit State

```text
ARCHITECTURE_CHALLENGE_VERDICT = PASS
BLOCKING_FINDINGS = NONE
C_1_THROUGH_C_7 = CONTRACT_CONTENT_CORRECTIONS_NON_BLOCKING
READY_TO_PERSIST_1C_CONTRACT = YES
V1_SLICE_1C_IMPLEMENTATION = NOT_STARTED
NEXT_ACTION = TARGETED_DELTA_REVIEW_V1_SLICE_1C_CONTRACT
```
