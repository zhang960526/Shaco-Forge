# Shaco Forge — V1-SLICE-1A Independent Review

| Field | Value |
|---|---|
| Review ID | `REVIEW-012` |
| Review Name | `V1-SLICE-1A Independent Review` |
| Review Scope | `ORIGINAL_IMPLEMENTATION_PLUS_THEME_FOUNDATION_CORRECTIVE` |
| Persisted Status | `COMPLETE / PASS / OWNER_ACCEPTED` |
| Review Date | `2026-09-07` |
| Reviewer | `Independent / READ-ONLY` |
| Repository Record Type | `FAITHFUL_PERSISTED_REVIEW / OWNER_CLOSURE_RECORD` |

## 1. Provenance

This document faithfully persists the completed external Independent Review
supplied to the Architecture Owner. The closure executor is not the Independent
Reviewer and did not reinterpret the verdict. The Reviewer made no repository
modification. The persistence and Owner Closure changes recorded here occurred
only after the Review had completed and do not retroactively belong to its
reviewed Product Source range.

## 2. Review Verdict

```text
REVIEW_VERDICT = PASS
SLICE = V1-SLICE-1A
REVIEW_SCOPE = ORIGINAL_IMPLEMENTATION_PLUS_THEME_FOUNDATION_CORRECTIVE
FIRST_FAILURE_BOUNDARY = NONE
BLOCKING_FINDINGS = NONE
MAJOR_FINDINGS = NONE
NEXT_RECOMMENDATION = OWNER_CLOSURE_AND_COMMIT
```

The original Slice 1A Gate and the Theme Foundation Corrective Gate both passed.
There are four `MINOR` and six `INFO` Findings. Every Finding is retained below;
none is a blocking or major Finding, and none is silently treated as resolved.

## 3. Independent Verification Summary

| Verification area | Result |
|---|---|
| Desktop / Worker / Host process separation | `PASS` |
| Harness ownership boundary | `PASS` |
| Control Store | `NOT_CREATED` |
| Physical Carrier | `NOT_IMPLEMENTED / SLICE_1B_GATED` |
| `packages/contracts` real bootstrap consumers | `PASS` |
| Electron security boundary | `PASS` |
| Frozen Harness exact commit, tag, package and clean worktree | `PASS` |
| Real `dsh --profile` Host launch | `PASS` |
| Host readiness | `PASS` |
| Real Client `AppWebEntry` mount | `PASS` |
| React composition | `18.3.1 / PASS` |
| Runtime DOM evidence | `PASS` |
| V1.0 Reduced View | `PASS` |
| Truthful connection state | `PASS` |
| Theme Foundation | `PASS` |
| Independent typecheck / build / unit / Worker smoke / Electron smoke / static verification reruns | `PASS` |

The bootstrap channel remains a supervisor-only bootstrap channel and is not
the final physical carrier. The real pinned Harness Client is mounted without
creating a second Harness Appearance/settings truth.

## 4. Findings and Dispositions

### F-01 — Runtime checkout identity is not validated

- Severity: `MINOR`
- Finding: Runtime overlay / Client composition only validates release/package
  version, not checkout git commit identity at runtime.
- Disposition: `NON_BLOCKING`
- Carry-forward: Slice 3 Packaging / bundled Harness identity contract.
- Status: `OPEN_CARRY_FORWARD`

### F-02 — Absolute-input validation semantics

- Severity: `MINOR`
- Finding: Absolute-path validation occurs after `resolve()`, so the
  absolute-input check does not enforce its documented meaning.
- Disposition: `NON_BLOCKING`
- Carry-forward: correct when the relevant path/config boundary is next touched.
- Status: `OPEN_CARRY_FORWARD`

### F-03 — Host readiness marker parse hardening

- Severity: `MINOR`
- Finding: Host stdout readiness marker `JSON.parse` has no `try/catch`.
- Disposition: `NON_BLOCKING`
- Carry-forward: Worker / Carrier / lifecycle hardening.
- Status: `OPEN_CARRY_FORWARD`

### F-04 — WorkerSupervisor terminal mapping and timeout

- Severity: `MINOR`
- Finding: `WorkerSupervisor` has no child-exit terminal mapping or startup
  timeout.
- Disposition: `NON_BLOCKING`
- Carry-forward: later Worker lifecycle / reconnect work.
- Status: `OPEN_CARRY_FORWARD`

### F-05 — Pinned Client CSP constraint

- Severity: `INFO`
- Finding: the current pinned Client composition requires CSP `unsafe-eval` /
  `unsafe-inline`.
- Disposition: `KNOWN_CONSTRAINT`
- Carry-forward: do not patch the Frozen Harness merely for Slice 1A; reassess
  at packaging/security compatibility work.
- Status: `OPEN_KNOWN_CONSTRAINT`

### F-06 — Trusted Main message rendering

- Severity: `INFO`
- Finding: truthful-state uses `innerHTML` for a trusted Main message.
- Disposition: `FUTURE_HARDENING`
- Status: `OPEN_CARRY_FORWARD`

### F-07 — Theme smoke query seam

- Severity: `INFO`
- Finding: the theme smoke query seam is bounded evidence-mode only.
- Disposition: `ACCEPTED_FOR_TESTING`
- Carry-forward: do not evolve it into a general production debug interface.
- Status: `ACCEPTED_CONSTRAINT`

### F-08 — Enumerated hardcode scan

- Severity: `INFO`
- Finding: `verify-theme` hardcode scanning uses an enumerated source list.
- Disposition: `FUTURE_HARDENING`
- Carry-forward: when Renderer source expands, prefer a
  directory-wide-minus-theme-mapping scan.
- Status: `OPEN_CARRY_FORWARD`

### F-09 — Historical Document Map state blocks

- Severity: `INFO`
- Finding: Document Map contains historical `V1_IMPLEMENTATION_STARTED = NO`
  blocks.
- Disposition: `HISTORICAL_CONTEXT`
- Carry-forward: Current State remains the current Runtime status authority.
- Status: `RETAINED_HISTORICAL_CONTEXT`

### F-10 — Disabled/unwired controls at the 1A boundary

- Severity: `INFO`
- Finding: `+ New Chat` is disabled and Settings is not wired in the Slice 1A
  disconnected state.
- Disposition: `EXPECTED_1A_BOUNDARY`
- Carry-forward: activate in later real Project / Session / Settings work.
- Status: `OPEN_EXPECTED_BOUNDARY`

## 5. Carry-forward Routing

| Finding | Primary route | Closure meaning |
|---|---|---|
| F-01 | Slice 3 | Packaging / bundled Harness identity contract |
| F-02 | Immediate future | Next change to the relevant path/config boundary |
| F-03 | 1B / lifecycle | Carrier and Host readiness hardening |
| F-04 | 1B / lifecycle | Worker terminal mapping, timeout and reconnect |
| F-05 | Slice 3 | Packaging/security compatibility constraint |
| F-06 | Future hardening | Trusted-message DOM rendering |
| F-07 | Future hardening | Keep the evidence-only seam bounded |
| F-08 | Future hardening | Broaden scanning when Renderer source expands |
| F-09 | Future hardening | Preserve historical context; use Current State as authority |
| F-10 | Slice 2, after real 1B lifecycle seams | Project / Session / Settings activation |

## 6. Accepted Slice 1A Result

```text
Electron = 35.7.5
Worker_Node = 22.19.0
pnpm = 11.7.0
TypeScript = 6.0.3
React = 18.3.1
Frozen_Harness_commit = cd5ef8148158c3a752a658978873241fdf8e2bbc
Frozen_Harness_release = dsh-v0.1.2-alpha.1
Harness_launch = dsh --profile
Client_package = @deepseek-ai/dsh-client-web@0.1.2-alpha.1
Client_export = AppWebEntry
REAL_PINNED_HARNESS_CLIENT_MOUNTED = YES
THEME_ARCHITECTURE = SEMANTIC_DESIGN_TOKENS
THEME_MODE_MODEL = LIGHT | DARK | SYSTEM
THEME_RUNTIME_SWITCH_CAPABLE = YES
V1_0_INITIAL_THEME = LIGHT
VISIBLE_APPEARANCE_SETTINGS_IN_V1_0 = NO
```

Reduced View retains visible New Chat, Project Directory and Settings surfaces;
Automation, Agent Collaboration and Knowledge Base are absent. The Chat layout
is centered, no permanent Inspector exists, and the connection state is
truthful.

## 7. Remaining Unproven Scope

Slice 1A does not prove the physical carrier; full Workspace or Session
lifecycle; prompt execution; streaming; Tool / Result; Approval / Question;
reconnect; full Worker lifecycle/discovery; packaging; installer; production
bundled Node; production bundled Harness; production controlled `DSH_HOME`;
full Shell/Harness theme unification; or the complete Settings Surface. These
remain open and must not be inferred as `PASS` from Slice 1A closure.

## 8. Architecture Owner Closure

```text
V1_SLICE_1A_INDEPENDENT_REVIEW = PASS
V1_SLICE_1A_REVIEW_FIRST_FAILURE_BOUNDARY = NONE
V1_SLICE_1A_BLOCKING_FINDINGS = NONE
V1_SLICE_1A_MAJOR_FINDINGS = NONE
V1_SLICE_1A_THEME_FOUNDATION_CORRECTIVE = PASS
V1_SLICE_1A_OWNER_CLOSURE = ACCEPTED
V1_SLICE_1A = CLOSED
V1_SLICE_1A_BASELINE = FROZEN
```

This closes only internal Step 1A. `V1-SLICE-1` remains open, and Slice 1B is
`NOT_STARTED`. The next action is preparation for V1-SLICE-1B Authenticated
Physical Carrier + Real Client ↔ Host Communication; no Slice 1B implementation
is authorized or performed by this closure.
