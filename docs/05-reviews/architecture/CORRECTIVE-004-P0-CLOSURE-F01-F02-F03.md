# CORRECTIVE-004 — P0 Closure F-01 / F-02 / F-03 (Executor)

Status: APPLIED — pending Independent Corrective Review  
Date: 2026-08-30  
Authority: `AUDIT-004-INDEPENDENT-P0-CLOSURE.md`  
Does not set `P0_CLOSURE_AUDIT = PASS`. Does not authorize `BEGIN P0.S`.

## Scope

Documentation / Contract / Evidence wording only against frozen Harness
`cd5ef8148158c3a752a658978873241fdf8e2bbc`. No P0 re-investigation, no P0.S,
no Harness source/lockfile/baseline change, no Desktop+Worker architecture
change, no feature-scope change.

## F-01

Separated Layer A (Cordis `webServer` service inject), Layer B (stock
`dsh-web-app` browser-facing HTTP/Web product stack), and Layer C (Spike
candidate compatibility service / adapter / stub). Gateway does not
hard-inject `webServer`. Connection/modules inject is `OPEN_FOR_P0S`, not
`KNOWN_CORE_PATCH_REQUIRED`. `CORE_PATCH_REQUIREMENT` remains
`POSSIBLE_REQUIRES_P0S`.

H-01 PASS / `PROVEN_WITH_CONSTRAINT` / FAIL rewritten. Gate
`P0S_HOST_PROFILE_FEASIBLE` is not “no Cordis service named `webServer`”.
H-26 inventory records per-area `*_CORE_PATCH_REQUIRED` plus
`ADAPTER_OR_STUB_USED` (Surface / Why / PublicOrPreviewSeamUsed /
ProductionImpact). Adapter/stub is not a Core Patch.

## F-02

H-07 is the streaming **contract**, not “Named Pipe must implement Client
`rpc.open`”. Client `rpc.open` is optional. Compatible seams include
`__DSH_TRANSPORT__.openStream` and Host `wireStream`. Gate remains
`P0S_STREAM_PASS`.

## F-03

`dsh-session-query-sqlite` is CONDITIONAL / OPTIONAL (SES-10, `openAt: never`).
Default persistence remains JSONL. Not a V1.0 REQUIRED Host package.

## Low (optional)

- F-04: P0-3 Q unary count reconciled to D-census 71;
  `UNARY_COUNT_NON_AUTHORITATIVE` as an architecture gate.
- F-05: `P0S_STANDARD_PRESET_TOOLS_PRESENT` annotated — shipped `standard`
  load plus REQUIRED subset; Jobs/Goal/Workflow/Ralph/Plan/Skills/web tools
  are not Product Release Hard Gates.

## Project state after this corrective

- P0-1 .. P0-7 = PASS
- `P0_EXECUTOR_WORK = CLOSED`
- `INDEPENDENT_P0_CLOSURE_AUDIT = PENDING_CORRECTIVE_REVIEW`
- `P0S = NOT_STARTED`
- `ALLOW_P0S = NO`

Next: INDEPENDENT P0 CLOSURE CORRECTIVE REVIEW. Not executed here.
