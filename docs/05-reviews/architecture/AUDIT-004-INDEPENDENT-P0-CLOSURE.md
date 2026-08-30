# AUDIT-004 — Independent P0 Closure Audit

Status: COMPLETE (Reviewer verdict; Architecture Owner disposition pending)  
Reviewer: Independent Architecture Reviewer (not the P0-1..P0-7 Executor)  
Date: 2026-08-30  
Mode: Review only. No product code, Harness mutation, Spike, Named Pipe, Electron prototype, P0.5, or P1.

Result: `PASS_WITH_REQUIRED_CORRECTIONS`

---

# A. FINAL VERDICT

Verdict: **PASS_WITH_REQUIRED_CORRECTIONS**

P0_CLOSURE_AUDIT: **NOT_PASS**

ALLOW_P0S: **NO**

P0 found the right Spike questions and produced falsifiable experiments. One HIGH contract wording issue (F-01) must be corrected before Spike starts, otherwise H-01 / CORE_PATCH can false-fail or over-declare a Harness core patch.

---

# B. EXECUTIVE SUMMARY

P0 did complete fact discovery, scope freeze, dependency freeze, risk routing, and P0.S input freeze at architecture level.

Independently verified:

- Frozen Harness identity matches the claimed SHA, tag, package, and lockfile.
- Web Host plane and `standard` preset plane are separate.
- Client↔Host business contract is separable from Web transport.
- Trust, resume, cancel, approval/question waterfalls, and REQUIRED/OPTIONAL scope are correctly frozen.
- Named Pipe is not treated as a Harness official seam.
- Fallbacks preserve Desktop + Worker unless Owner re-approves Fallback B.

The remaining HIGH issue is not “P0 failed to investigate”. It is that H-01 / P0-6 currently conflate:

1. Cordis `webServer` service inject (hard on Connection / client-modules; optional on Gateway),
2. stock HTTP bind / HMR / token URL (`dsh-web-app`),
3. a non-listening composition stub.

Without that distinction, Spike pass/fail and CORE_PATCH meaning are not sharp enough.

---

# C. BASELINE INTEGRITY

Repository: `https://github.com/deepseek-ai/deepseek-harness.git`

Commit: `cd5ef8148158c3a752a658978873241fdf8e2bbc` (tag `dsh-v0.1.2-alpha.1`)

Package: `@deepseek-ai/dsh@0.1.2-alpha.1` and `@deepseek-ai/dsh-root@0.1.2-alpha.1`

Lockfile: `pnpm-lock.yaml` SHA256 `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1`

HarnessWorktreeClean: **YES** (`git status --porcelain` empty)

ShacoForgeWorktreeClean: **YES** (HEAD `352e35a`, porcelain empty at audit time)

Verdict: **PASS**

Additional identity sampled: Node engines `^22.19.0 || >=24.0.0`; `packageManager` `pnpm@11.7.0`. Electron is not recorded as Harness baseline.

---

# D. P0-1 REVIEW

Verdict: **PASS**

Findings:

- Exact SHA, package version, tag, Node, pnpm, TypeScript, lockfile hash, Windows 11 x64, git-worktree distribution, and clean worktree are frozen.
- Electron runtime is correctly omitted from Harness baseline; it belongs to Product runtime / P0.S / P0.5.
- No additional baseline identity is missing for Spike start (Worker Node pin comes from proven `WORKER_RUNTIME_STRATEGY`).

P0_1_REVIEW = PASS

---

# E. P0-2 REVIEW

Verdict: **PASS**

Source-sampled:

- `PROFILE_TEMPLATES.web` = `dsh-base` + `dsh-web-app`.
- `packages/preset/agent-presets/presets/standard/agent.cordis.yml` remounts `tool-pwsh` / `tool-fs` / `tool-fs-search` / `tool-ask-user` / continuable `tool-subagent`; does **not** restore `tool-str-replace-editor`.
- Web patch disables host-plane agent tools including `tool-pwsh` and `tool-str-replace-editor`.
- JSONL is the default persistence row in `dsh-base`.
- `sandbox-local` win32 chain is `['windows-acl']`; Landlock is Linux.
- Dynamic Cordis layers (tool-cordis / host-runner / client-runner / ui-cordis) are separated.
- webserver / web-runtime / HMR / token URL classified WEB_TRANSPORT_ONLY.
- Host candidate does not copy `dsh-web-app` as the Shaco Host.

P0-2 `STANDARD_REQUIRED` vs P0-5 OPTIONAL is not a contradiction: census vs product classification. P0-5 I already says Spike mounts unmodified `standard` while product acceptance uses the REQUIRED subset.

P0_2_REVIEW = PASS

---

# F. P0-3 REVIEW

Verdict: **PASS**

Q1 Business vs Web transport: **YES, separable.** Typert/Remote/Gateway vs HTTP/WS/SSE/`/plugins`.

Q2 Desktop resume authority: **NO.** Host `ctx.agents.resume`; no Client `session/resume`.

Q3 Transport disconnect auto-cancel Agent: **NO coupling found.** `session/cancel` → `agent.cancel`; disconnect aborts pumps/generation only.

Q4 Approval pending redelivery + first-result-wins: **YES.** Gateway `pendingRemoteEvents` redelivered to new `$events` clients; settled ids are no-ops.

Q5 User Question waterfall: **YES.** Same `$events` waterfall/result machinery; separate event/service.

Q6 Binary/exact surface: **YES.** `/api/session.export` ZIP; module bytes are Web routes; images are JSON/base64.

Q7 Current Client boot still depends on Host graph / `/plugins`: **YES** for stock Web. `loadBundle` / `__DSH_TRANSPORT__` exist as unproven alternate seams.

Minor: section D says 71 unary endpoints; section Q says “72 unary calls” (F-04).

P0_3_REVIEW = PASS

---

# G. P0-4 REVIEW

Verdict: **PASS**

Q1 Gateway assumes transport already authenticated: **YES.** Gateway validates contract; `requestRejection` is the Web adapter.

Q2 BrowserAuth cannot prove Windows user / legitimate Worker: **YES.** Cookie proves signing-secret possession for an authority.

Q3 Settings persistence depends on loopback / `ownsHost`: **YES.** Client capability, not Host ACL.

Q4 Future non-Web carrier must authenticate before Gateway: **YES.**

Q5 Compatibility handshake is not identity: **YES.** Explicitly separated in P0-4 U / P0.5.

P0_4_REVIEW = PASS

---

# H. P0-5 REVIEW

Verdict: **PASS**

REQUIRED covers the Desktop→Workspace→Session→Agent loop, DeepSeek credentials/model, persistent session, streaming, pwsh, read/write/edit, grep/glob, ask_user_question, permission presets, approval, Settings persistence, credentials set/unset, shipped `standard`, core in-process continuable subagent/control, Desktop close/crash Worker survival, reconnect, Worker restart recovery, no Desktop resume, disconnect ≠ cancel, fail-closed compatibility, no-system-Node packaged product.

Goal / Workflow / Ralph / Jobs / Plan / Compact / Export / Images / Skills / web tools are **not** all REQUIRED.

Codex / Claude Code / ACP / SDK are DEFERRED.

Harness Goal/Jobs/Workflow ≠ Shaco 1.1 Automation Domain.

MEDIUM: L.2 lists `dsh-session-query-sqlite` as a REQUIRED Host package while content search is OPTIONAL and `openAt: never` (F-03).

P0_5_REVIEW = PASS

---

# I. P0-6 REVIEW

Verdict: **PASS** (with HIGH wording correction F-01)

A. No REQUIRED Feature is currently proven to need only a FORBIDDEN internal seam.

B. Preview seams are labeled PREVIEW_PUBLIC_API, not stable official API.

C. Forbidden list correctly covers `packages/**/src`, in-process `boot()`, production tsx Host, direct Harness data mutation, second Agent Loop, Desktop-owned resume, Named Pipe as Harness extension.

D. Recommended adapters isolate preview risk without a third architecture.

Inaccuracy: P0-6 says Connection / client-modules / **api-gateway** currently `inject` `webServer`. Source: Connection and modules **hard-inject** `webServer`; Gateway `static inject = ['typert']` and only optionally `ctx.inject(['connection', 'webServer'])` for the mux.

P0_6_REVIEW = PASS

---

# J. P0-7 REVIEW

Verdict: **PASS** (H-01 fail meaning must be tightened; F-01)

- Architecture-critical unknowns are covered (HOST/CLIENT/CARRIER/TRUST/SESSION/PICKER/CORDIS/PACKAGING/LIFECYCLE/UPGRADE/DEPENDENCY).
- 66 rows are detailed, not fake-complete duplicates.
- No BLOCKER rows; remaining unknowns are correctly `OPEN_FOR_P0S` or later.
- Optional product features are excluded from Hard Gates.
- P0.5 / P1 / P7 routing is coherent.

P0_7_REVIEW = PASS

---

# K. P0.S HYPOTHESIS REVIEW

| Id | Action | Reason |
|---|---|---|
| H-01 | **MODIFY** | Necessary and Spike-provable, but “without WebServer” is ambiguous vs Cordis inject vs HTTP stack. Fail meaning must match RISK-HOST-01. |
| H-02 | KEEP | Full unmodified `standard`; product pass = REQUIRED tools. |
| H-03 | KEEP | Electron Renderer boot is architecture-critical and falsifiable. |
| H-04 | KEEP | Settings not-memory canary is the right trust/product canary. |
| H-05 | KEEP | Stock boot still uses Host `/plugins`; Spike must prove alternate bytes. |
| H-06 | KEEP | `rpc.call` exists; Pipe is unproven. Falsifiable unary round-trip. |
| H-07 | **MODIFY** | Client `rpc.open` is optional; Web uses Gateway mux. Prove via `__DSH_TRANSPORT__.openStream` / Host `wireStream`. |
| H-08 | KEEP | Generation/ready/reset must survive carrier replacement. |
| H-09 | KEEP | Approval reconnect without duplicate settlement. Host-death persistence is correctly out of scope. |
| H-10 | KEEP | Same waterfall class as approval; REQUIRED. |
| H-11 | KEEP | Explicit cancel vs disconnect. |
| H-12 | KEEP | No Desktop resume authority. |
| H-13 | KEEP | Binary carrier independent of OPTIONAL `/export` UI. |
| H-14 | KEEP | Local trust before Gateway; cookie not product identity. |
| H-15 | KEEP | Renderer isolation. |
| H-16 | KEEP | Native picker or documented Desktop equivalent. |
| H-17 | KEEP | Close/crash Worker survival. |
| H-18 | KEEP | Second Desktop must not create a second Worker/control authority. |
| H-19 | KEEP | Worker restart ≠ Desktop reconnect. |
| H-20 | KEEP | Cordis omission vs hidden boot dependency. |
| H-21 | KEEP | Feasibility of no system Node, not P7 installer. |
| H-22 | KEEP | Feasibility of no system pnpm. |
| H-23 | KEEP | One Worker runtime ABI strategy; must not remain UNRESOLVED. |
| H-24 | KEEP | Controlled DSH_HOME. |
| H-25 | KEEP | Windows natives / ACL / pwsh paths; no Landlock-on-Windows. |
| H-26 | KEEP | Inventory YES/NO per area; do not infer NONE. |

REMOVE: none. ADD: none. H-01/H-07 are wording/method corrections, not new hypotheses.

---

# L. P0.S HARD GATE REVIEW

MissingHardGate: **NONE** for architecture-critical REQUIRED behavior. Close/Stop/Exit three-way UX remains P1, with close/crash survival already gated.

IncorrectHardGate: **H-01 / `P0S_HOST_PROFILE_FEASIBLE` wording** if read as “no Cordis `webServer` service may exist”. That is stricter than the architecture intent.

OptionalFeatureWronglyHard: **NO.** Jobs/Goal/Workflow/Ralph/Plan/Export/Images/Skills/web tools are not Hard Gates. `P0S_STANDARD_PRESET_TOOLS_PRESENT` means mount shipped `standard` (no copy), not product-require every standard tool.

RecommendedCorrections:

- Annotate `P0S_HOST_PROFILE_FEASIBLE`: no stock HTTP/HMR/token URL; stub `webServer` = PROVEN_WITH_CONSTRAINT.
- Annotate `P0S_STREAM_PASS`: do not require Client `rpc.open`.
- Keep nested: `NODE_INTEGRATION_REQUIRED = NO`, `CURRENT_USER_ONLY`, `COOKIE_NOT_PRODUCT_IDENTITY`, `RENDERER_DIRECT_PIPE_ACCESS = NO`.

---

# M. FALLBACK REVIEW

Primary: Electron Renderer → Preload/IPC → Main → Named Pipe → Worker Harness Host. **Still reasonable.** Pipe is Shaco-owned, not a Harness extension.

FallbackA: private loopback HTTP Worker. **Keeps Desktop + Worker.** Must re-satisfy local trust; BrowserAuth is reference only.

FallbackB: Host in Electron Main. **Correctly Owner-gated** because it breaks Close Window ≠ Worker stop.

ThirdFallbackRequired: **NO**

Verdict: **PASS**

---

# N. P0.5 INPUT READINESS

P05_INPUT_READY = **YES**

Missing: **NONE** that blocks P0.5 design after P0.S. Six handshake identities, HarnessBaseline SHA+package, lockfile, session/credentials/workspace/projcache versions, fail-closed, backup, no down-migration, disk-full / backup-fail / upgrade-crash are recorded. Node runtime pin correctly waits for `WORKER_RUNTIME_STRATEGY`.

---

# O. P1 INPUT READINESS

P1_INPUT_READY = **YES**

Missing: **NONE** that blocks later P1 freeze. Worker authority, Desktop projection, one Worker per user, logical vs process identity, single-Desktop policy, discovery, Close/Stop/Exit, carrier adapter, Renderer isolation, local trust, data ownership, resume/approval/question authority, child ownership, error taxonomy, handshake boundary, P0.S constraints are recorded as inputs, not as a frozen P1 contract.

---

# P. P7 ROUTING REVIEW

P7_ROUTING_READY = **YES**

Findings: installer, signing, AV, production asar/native closure, backup/upgrade implementation, fresh-machine final acceptance, diagnostics, hardening are correctly P7. P0.S packaging gates are feasibility-only.

---

# Q. CORE PATCH REVIEW

CORE_PATCH_REQUIREMENT: **POSSIBLE_REQUIRES_P0S**

CorrectClassification = **YES**

Reason: Connection/modules hard-inject `webServer`. That is not yet a proven need to patch Harness core. A profile/bundle adapter, stub service, or Shaco plugin may suffice. Gateway already uses optional inject. No source evidence of KNOWN_REQUIRED.

---

# R. MISSING PRE-SPIKE FACTS

**NONE** that block Spike design.

Known-but-unproven items (inject, Pipe, Electron boot, Settings canary, picker, packaging ABI) are correctly Spike hypotheses.

F-01 is a **pass-fail wording** issue, not a missing census fact.

---

# S. FALSE-CONFIDENCE FINDINGS

P0 generally does **not** treat these as proven:

- public export ≠ cross-process
- `rpc.open` exists ≠ Pipe feasible
- Client package exists ≠ Electron boots
- Settings Remote exists ≠ custom scheme persists
- JSONL exists ≠ packaging is simple
- Node runs ≠ native ABI correct
- same Windows user ≠ Worker identity
- first-answer-wins ≠ reconnect UI cannot duplicate
- no current patch ≠ never need patch

Residual: H-01 “without WebServer” can be misread as already knowing the Connection plugin cannot load, hence core patch. That over-reads P0-6.

---

# T. OVER-DESIGN FINDINGS

- 66-row risk register is detailed; not fake completeness (F-06 LOW).
- 26 Hard Gates map to architecture, not OPTIONAL product features.
- P0.5 six identities are not excessive.
- Adapter advice is bounded.
- 1.1/1.2 content is not polluting 1.0 REQUIRED scope.

No over-design FAIL.

---

# U. FINDINGS

## F-01

FindingId: F-01  
Severity: **HIGH**  
AffectedPhase: P0-6 / P0-7 / H-01 / H-26 / P0.S-1  
Problem: P0-6/P0-7 lump Gateway with Connection/modules as hard `webServer` inject. H-01 says “Host without WebServer” without distinguishing Cordis service inject, HTTP bind, and `dsh-web-app`.  
Evidence: `packages/client/connection/src/index.ts` `inject = ['webServer', 'credentials']`; `packages/client/modules/src/index.ts` `static inject = ['webServer', 'loader']`; `packages/api/gateway/src/index.ts` `static inject = ['typert']` plus optional `ctx.inject(['connection', 'webServer'], ...)`. RISK-HOST-01 fail condition already says “only behind dsh-web-app / unacceptable core patch”.  
WhyItMatters: Spike can false-fail a valid stub, or declare CORE_PATCH too early.  
RequiredCorrection: Rewrite H-01 / `P0S_HOST_PROFILE_FEASIBLE` / P0-6 inject sentence as specified in V.  
WhenToCorrect: **Before P0.S starts.**

## F-02

FindingId: F-02  
Severity: **MEDIUM**  
AffectedPhase: H-07 / P0.S-3/4  
Problem: Stream proof must not assume Client `rpc.open`.  
Evidence: `ClientConnectionRpc.open?` is optional; “Browser transports omit this method”; Client `apply()` uses `__DSH_TRANSPORT__.openStream`.  
WhyItMatters: Named Pipe Spike could chase the wrong seam.  
RequiredCorrection: H-07 pass via `__DSH_TRANSPORT__.openStream` and/or Host `wireStream.open`.  
WhenToCorrect: At P0.S-3/4 start; may be annotated with F-01.

## F-03

FindingId: F-03  
Severity: **MEDIUM**  
AffectedPhase: P0-5 L.2 / P0.S-1 / P2  
Problem: `dsh-session-query-sqlite` is in REQUIRED Host roster while search is OPTIONAL and `openAt: never`.  
Evidence: P0-5 L.2; base YAML session-query-sqlite comment; P0-2 OPTIONAL_PRODUCT_CAPABILITY.  
WhyItMatters: Host composition may over-retain an unused search index.  
RequiredCorrection: Mark CONDITIONAL/OPTIONAL unless Spike proves a REQUIRED list/history dependency.  
WhenToCorrect: P0.S-1 Host inventory / P2.

## F-04

FindingId: F-04  
Severity: **LOW**  
AffectedPhase: P0-3  
Problem: 71 vs 72 unary count.  
Evidence: P0-3 D vs Q.  
WhyItMatters: Completeness noise only. H-06 already uses representative calls.  
RequiredCorrection: Reconcile the count.  
WhenToCorrect: Anytime.

## F-05

FindingId: F-05  
Severity: **LOW**  
AffectedPhase: H-02 gate name  
Problem: Gate name sounds like every standard tool is a Hard Gate.  
Evidence: P0-5 I already forbids a reduced preset during Spike while keeping OPTIONAL product.  
WhyItMatters: Naming only.  
RequiredCorrection: Optional rename/note.  
WhenToCorrect: Optional.

## F-06

FindingId: F-06  
Severity: **LOW**  
AffectedPhase: P0-7  
Problem: Register is large.  
Evidence: 66 rows; 37 OPEN_FOR_P0S map to H-01..H-26.  
WhyItMatters: Readability, not missing or duplicate architecture risk.  
RequiredCorrection: None required.  
WhenToCorrect: n/a

---

# V. REQUIRED CORRECTIONS

## BLOCKER

NONE

## HIGH

**F-01** — Before P0.S, Architecture Owner must accept this freeze text (or equivalent):

1. P0-6: Official **Connection** and **client-modules** Host plugins **hard-inject** `webServer`. **Gateway** only optionally injects `connection` + `webServer` to register the Web mux. Logical Gateway invoke/stream/`$events` do not hard-require HTTP.
2. H-01 / `P0S_HOST_PROFILE_FEASIBLE` PASS: long-running Host preserves required Gateway/Remote/runtime surfaces **without stock `dsh-web-app` HTTP bind, HMR, token URL, or browser opener**.
3. A Cordis `webServer` **stub that does not serve product HTTP** is `PROVEN_WITH_CONSTRAINT`, not automatic FAIL and not silent CORE_PATCH.
4. H-01 FAIL: required surfaces exist only behind stock `dsh-web-app` and cannot be reconstructed by documented profile/bundle/adapter at acceptable cost.
5. H-26 still inventories YES/NO per area; stub vs adapter vs patch must be explicit.

## MEDIUM (necessary)

**F-02** — Annotate H-07 / `P0S_STREAM_PASS`: Client `rpc.open` is optional; prove streams through `__DSH_TRANSPORT__.openStream` and/or Host `wireStream`.

**F-03** — Do not treat `session-query-sqlite` as a V1.0 REQUIRED package unless Spike proves a REQUIRED-feature dependency.

---

# W. FINAL P0 GATE REVIEW

| Gate | Audit |
|---|---|
| P0_BASELINE_FROZEN | PASS |
| P0_WEB_COMPOSITION_KNOWN | PASS |
| P0_STANDARD_PRESET_KNOWN | PASS |
| P0_CLIENT_HOST_CONTRACT_KNOWN | PASS |
| P0_EXACT_FETCH_ROUTES_ENUMERATED | PASS |
| P0_TRUST_SURFACE_KNOWN | PASS |
| P0_LOOPBACK_CLASSIFIER_LOCATED | PASS |
| P0_CORE_PARITY_SCOPE_FROZEN | PASS |
| P0_DEPENDENCY_BOUNDARY_FROZEN | PASS |
| P0_UPSTREAM_RISK_REGISTER_FROZEN | PASS |
| P0S_HYPOTHESIS_MATRIX_FROZEN | FAIL (H-01 fail meaning not sharp — F-01) |
| P0S_HARD_GATES_FROZEN | FAIL (same H-01 wording — F-01) |
| P0S_FAILURE_BRANCH_FROZEN | PASS |
| P05_INPUTS_FROZEN | PASS |
| P1_INPUTS_FROZEN | PASS |
| P7_INPUTS_RECORDED | PASS |
| P0S_SPIKE_INPUT_FROZEN | FAIL (blocked by F-01) |
| P0_EVIDENCE_CONTRADICTIONS | PASS (71/72 and sqlite roster are LOW/MEDIUM, not architecture contradictions) |

---

# X. FINAL READINESS

SHACO_FORGE_V1_0_P0_CLOSURE = **NOT_PASS**

SHACO_FORGE_V1_0_P0S_READY_TO_BEGIN = **NO**

NEXT_ACTION = **P0_CORRECTIVE**

FindingId: **F-01** (HIGH; F-02/F-03 may be annotated in the same corrective note)

After Owner accepts F-01, Independent Closure may be marked PASS and P0.S may begin. Do not re-execute P0-1..P0-7. Do not start P0.S in this round.
