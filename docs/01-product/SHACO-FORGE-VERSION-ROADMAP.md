# Shaco Forge Version Roadmap

Status: DRAFT-FROZEN-BASELINE

## V1.0 — DeepSeek Harness Desktop Baseline

Must achieve:

- Electron Desktop
- Independent per-user long-running Worker
- Worker as Harness Host
- Harness Client reuse where feasible
- Core Agent feature parity only
- Desktop close/crash while Worker survives
- Reconnect and truthful projection
- Session durability / cold resume
- Windows packaging without user-installed Node/pnpm/Harness
- Minimal Shaco Control Store
- Security / local trust / version compatibility
- Limited plugin scope
- Pinned Harness upgrade policy
- Fresh final acceptance

## V1.1 — Automation Agent

Planned product-owned domain:

- AutomationDefinition
- AutomationRun
- Task / Step / Attempt
- Planner / dynamic decomposition
- Artifact / Evidence
- Retry / Timeout
- Pause / Resume / Cancel
- Scheduler / Trigger
- Durable approvals
- Crash recovery
- Long-running unattended execution

Harness Workflow/Jobs/Goal/Schedule may be execution capabilities but are not the authoritative Automation domain.

## V1.2 — Multi-Model Deliberation & Review

Planned:

- Planner → Executor → Independent Reviewer → Corrective → Re-review
- Multi-Agent Council
- Synthesizer / Critic / Final Reviser
- Provider/capability child integration: DeepSeek / Codex / Claude / ACP / DSH SDK / others

## V1.3 — Candidate

- Feedback
- Experience
- Cross-session memory
- Learning / distillation integration

Not frozen.
