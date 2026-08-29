# P0-2 Web + Standard Composition Map

Status: CLOSED / PASS  
Step: P0-2  
Verdict: PASS  
SelectedAt: 2026-08-29  
EvidenceClass: HARNESS_WEB_COMPOSITION_MAP  
Related: `P0-2-WEB-DUMP-DEFAULT-CONFIG.yml` (diagnostic dump only; not a stable API)

`dump-config` is discovery evidence. Authoritative composition is the frozen source YAML / profile / bundle / preset files named below.

`SHACO_FORGE_HOST_COMPOSITION_CANDIDATE` in section K is a design candidate only. It does not create `shaco-forge-host`. Feature REQUIRED/OPTIONAL freeze is P0-5.

## A. Frozen Baseline

| Field | Value |
|---|---|
| Repository | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Branch | `master` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Release | `dsh-v0.1.2-alpha.1` |
| PackageVersion | `0.1.2-alpha.1` |
| pnpm-lock.yaml SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| UpstreamPath | `D:\Project\Shaco-Forge-Upstream\deepseek-harness` |
| UpstreamCleanBefore | YES |
| UpstreamCleanAfter | YES |

## B. Discovery Method

1. Re-verify SHA, porcelain status, lockfile SHA256.
2. Activate `pnpm@11.7.0` via Corepack (`corepack pnpm`). Do not put pnpm on PATH; do not upgrade.
3. `corepack pnpm install --frozen-lockfile` inside the pinned worktree.
4. Trace CLI → profile template → bundle patches → standard preset source.
5. `dsh web --dump-default-config` with isolated `$DSH_HOME` (tsx source entry; no production `pnpm build`).
6. Compare dump rows to `packages/bundle/base/cordis.patch.yml`, `packages/bundle/web-app/cordis.patch.yml`, and `packages/preset/agent-presets/presets/standard/agent.cordis.yml`.
7. Locate command/tool names from plugin `src` registrations, not README.

Install notes (non-blocking):

- pnpm warned Linux-only `native/landlock-run` packages are unsupported on win32 x64.
- pnpm warned missing `apps/cli/lib/bin.js.EXE` (no production CLI build).
- Lefthook postinstall synced hooks under `.git`; worktree stayed CLEAN; lockfile hash unchanged.

Dump command:

```text
DSH_HOME=<isolated temp>
node --import tsx/esm apps/cli/src/bin.ts web --dump-default-config
```

`--dump-default-config` composes bundle layers only. It does **not** expand `standard` `agent.cordis.yml`. Preset composition is source-authoritative.

`!!js` expressions in the dump are unevaluated. Runtime `disabled` for platform-gated base rows (e.g. `bash-sandbox`) is therefore not resolved in the dump.

No Harness source, lockfile, or SHA was modified.

## C. Web Boot Chain

```text
dsh  (apps/cli/src/bin.ts)
  → parseDshArgs: `web` alias = `--profile web`  (apps/cli/src/args.ts)
  → runProfile / dump-config  (apps/cli/src/profile-boot.ts, dump-config.ts)
  → loadProfile / PROFILE_TEMPLATES.web  (packages/boot/app-boot/src/profile.ts)
       bundles: [@deepseek-ai/dsh-base, @deepseek-ai/dsh-web-app]
       patchReload: live
  → empty profile root cordis.yml
  → dsh-base cordis.patch.yml insert  (packages/bundle/base/cordis.patch.yml)
  → dsh-web-app cordis.patch.yml override + insert  (packages/bundle/web-app/cordis.patch.yml)
  → optional profile cordis.patch.yml, $DSH_HOME/cordis.patch.yml, --patch
  → boot Loader tree
  → web-startup parses --host/--port/--no-open/--trusted-host  (packages/bundle/web-app/src/startup.ts)
  → webserver bind  (dsh-host-webserver)
  → web-runtime: dist, URL line, openBrowser, webRuntime  (packages/bundle/web-app/src/index.ts)
  → connection node half binds gateway under /api; token URL  (dsh-client-connection)
  → client-modules composes window.__DSH_BOOT__
  → browser roster (dsh.client UI packages)
  → agent-presets default: standard  (per-session agent plane; not in dump tree)
```

Key files:

| Step | Path |
|---|---|
| CLI entry | `apps/cli/src/bin.ts` |
| Argv / web alias | `apps/cli/src/args.ts` |
| Profile boot | `apps/cli/src/profile-boot.ts` |
| Dump | `apps/cli/src/dump-config.ts` |
| Profile templates | `packages/boot/app-boot/src/profile.ts` |
| Base bundle | `packages/bundle/base/cordis.patch.yml` |
| Web bundle | `packages/bundle/web-app/cordis.patch.yml` |
| Web runtime plugin | `packages/bundle/web-app/src/index.ts` |
| Web flags | `packages/bundle/web-app/src/startup.ts` |
| Standard preset meta | `packages/preset/agent-presets/presets/standard/preset.yml` |
| Standard agent tree | `packages/preset/agent-presets/presets/standard/agent.cordis.yml` |

## D. Host / Application Composition (Plane A)

Dump provenance comments match source: base insert, then web-app patches (`disabled: true` on agent-plane tools) and web-app inserts.

ShacoClassification values are **P0-2 candidates**, not P0-5 feature freeze.

| Component | Package | SourcePath | Plane | LoadedBy | EnabledInWeb | Purpose | RuntimeOrUI | DependsOnWebTransport | DependsOnBrowser | RequiredByStandardPreset | ShacoClassification | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| timer | `@deepseek-ai/cordis-plugin-timer` | `vendor/timer` | HOST | dsh-base | YES | Cordis timer | Runtime | NO | NO | NO | CORE_HOST | base YAML; dump |
| hmr (host plugin reload) | `@deepseek-ai/cordis-plugin-hmr` | `vendor/hmr` | HOST | dsh-base | NO (`disabled: true`) | Host module reload opt-in | Runtime | NO | NO | NO | DEFER_OR_REMOVE | base YAML disabled |
| llm + deepseek adapter | `@deepseek-ai/dsh-llm`, `dsh-llm-deepseek`, `dsh-deepseek-llm-api-extensions`, `dsh-llm-retry`, `dsh-llm-pi-ai` | `packages/**/llm*` | HOST | dsh-base | YES | Model routes | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| session | `@deepseek-ai/dsh-session` | `packages/session/session` | HOST | dsh-base | YES | Session domain | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| session-log-deepseek | `@deepseek-ai/dsh-session-log-deepseek` | session-log package | HOST | dsh-base | YES | Log format | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| typert + loader | `@deepseek-ai/dsh-typert-registry`, `dsh-typert-loader` | `packages/typert/*` | HOST | dsh-base | YES | Typed remote registry | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| typert-gateway | `@deepseek-ai/dsh-api-gateway` | `packages/api/gateway` | HOST | dsh-base | YES | API Gateway | Runtime | NO (logic); YES if served over HTTP | NO | NO | CORE_HOST | base YAML; spike if carrier changes |
| session-title (+ llm) | `@deepseek-ai/dsh-session-title`, `dsh-session-title-first-prompt-llm` | session-title packages | HOST | dsh-base | YES | Titles | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| user-questions | `@deepseek-ai/dsh-user-questions` | `packages/interaction` | HOST | dsh-base | YES | Ask-user channel service | Runtime | NO | NO | YES (tool-ask-user consumes it) | CORE_HOST | base YAML; standard mounts tool |
| agent | `@deepseek-ai/dsh-agent` | `packages/agent` | HOST | dsh-base | YES | Agent identity | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| agent-default-model | `@deepseek-ai/dsh-agent-default-model` | agent-default-model | HOST | dsh-base | YES | Default `deepseek-official` / `deepseek-v4-flash` | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| jobs registry | `@deepseek-ai/dsh-jobs-local` | `packages/jobs` | HOST | dsh-base | YES | Background job registry | Runtime | NO | NO | YES (tool-jobs) | CORE_HOST | web YAML comment; dump keeps row |
| settings | `@deepseek-ai/dsh-settings-file` | `$DSH_HOME/settings.yaml` plugin | HOST | dsh-base | YES | Settings document | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| credentials | `@deepseek-ai/dsh-credentials-local` | credentials-local | HOST | dsh-base | YES | Credential store | Runtime | NO | NO | NO | CORE_HOST | base YAML; no api-credentials-controller package |
| session-persistence-jsonl | `@deepseek-ai/dsh-session-persistence-jsonl` | `packages/session/session-persistence-jsonl` | HOST | dsh-base | YES | Default session persistence | Runtime | NO | NO | NO | CORE_HOST | base YAML; dump |
| attachment-local | `@deepseek-ai/dsh-attachment-local` | attachment-local | HOST | dsh-base | YES | Image bytes | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| session-query-sqlite | `@deepseek-ai/dsh-session-query-sqlite` | session-query-sqlite | HOST | dsh-base; web restates | YES mounted; search off | Query index; `openAt: never`, `:memory:` | Runtime | NO | NO | NO | OPTIONAL_PRODUCT_CAPABILITY | base+web YAML; not session persistence |
| storage stack | `dsh-storage`, `dsh-storage-json`, `dsh-storage-domain` | storage packages | HOST | dsh-base | YES | KV / domains | Runtime | NO | NO | NO | CORE_HOST | base YAML `backend: json` |
| session-projection (+ cache) | `dsh-session-projection`, `dsh-session-projection-cache` | projection packages | HOST | dsh-base | YES | List/projection | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| session-telemetry-otel | `@deepseek-ai/dsh-session-telemetry-otel` | telemetry | HOST | dsh-base | YES unless env disable | OTLP | Runtime | NO | NO | NO | OPTIONAL_PRODUCT_CAPABILITY | base YAML |
| subprocess | `@deepseek-ai/dsh-subprocess-local` | subprocess-local | HOST | dsh-base | YES | Child spawn | Runtime | NO | NO | YES (shell) | CORE_HOST | base YAML |
| sandbox | `@deepseek-ai/dsh-sandbox-local` | `packages/sandbox/sandbox-local` | HOST | dsh-base | YES | Platform sandbox selector | Runtime | NO | NO | YES | CORE_HOST | win32 → windows-acl |
| sandbox-policy | `@deepseek-ai/dsh-sandbox-policy` | sandbox-policy | HOST | dsh-base | YES | Mode | Runtime | NO | NO | YES | CORE_HOST | default workspace-write |
| bash-sandbox | `@deepseek-ai/dsh-bash-sandbox` | bash-sandbox | HOST | dsh-base | runtime `disabled` on win32 | POSIX sandbox executor | Runtime | NO | NO | POSIX shell | CORE_HOST (POSIX) | `!!js process.platform === 'win32'` |
| pwsh-sandbox | `@deepseek-ai/dsh-pwsh-sandbox` | pwsh-sandbox | HOST | dsh-base | runtime enabled on win32 | Windows sandbox executor | Runtime | NO | NO | win32 shell | CORE_HOST (Windows) | `!!js process.platform !== 'win32'` |
| approval | `@deepseek-ai/dsh-user-approval` | user-approval | HOST | dsh-base | YES | Approval policy | Runtime | NO | NO | YES | CORE_HOST | base YAML |
| permission | `@deepseek-ai/dsh-permission-presets` | `packages/interaction/permission-presets` | HOST | dsh-base | YES | Presets + `/permission` | Runtime | NO | NO | NO (host command) | CORE_HOST | base YAML; `/permission` |
| shell-env | `@deepseek-ai/dsh-shell-env` | shell-env | HOST | dsh-base | YES | Host env registry | Runtime | NO | NO | YES (shell tools) | CORE_HOST | web YAML: must stay host |
| skill registry | `@deepseek-ai/dsh-skill` | skill | HOST | dsh-base | YES | Skill catalog | Runtime | NO | NO | YES | CORE_HOST | web YAML comment |
| commands registry | `@deepseek-ai/dsh-commands` | `packages/interaction/commands` | HOST | dsh-base | YES | Slash registry | Runtime | NO | NO | YES | CORE_HOST | commands/src/index.ts |
| command-feedback | `@deepseek-ai/dsh-command-feedback` | command-feedback | HOST | dsh-base | YES | `/feedback` | Runtime | NO | NO | NO | CORE_HOST | not disabled by web |
| goal + driver | `dsh-goal`, `dsh-goal-round-driver` | goal packages | HOST | dsh-base | YES | Goal domain | Runtime | NO | NO | YES | OPTIONAL_PRODUCT_CAPABILITY | host stays; command/tool in preset |
| token-meter | `@deepseek-ai/dsh-token-meter` | token-meter | HOST | dsh-base | YES | Context meter | Runtime | NO | NO | YES (compaction) | CORE_HOST | web YAML comment |
| subagent registry + spawn/fork | `dsh-subagent`, `dsh-subagent-spawn-in-process`, `dsh-subagent-fork-in-process` | subagent packages | HOST | dsh-base | YES | Delegation backends | Runtime | NO | NO | YES | CORE_HOST | web YAML: stay host |
| tool-subagent-report | `@deepseek-ai/dsh-tool-subagent-report` | tool-subagent-report | HOST | dsh-base | YES | Continuable `report` setup | Runtime | NO | NO | implicit for continuable children | CORE_HOST | web YAML: not moved to preset |
| timeout/spill/checkpoint | timeout-policy, spill-*, session-checkpoint-policy | various | HOST | dsh-base | YES | Runtime policy | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| repeat-tool-reminder | `@deepseek-ai/dsh-repeat-tool-reminder` | reminder | HOST | dsh-base | YES | Repeat warnings | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| web service + search/fetch providers | `dsh-web`, `dsh-web-search-deepseek`, `dsh-web-fetch-http` | `packages/web/*` | HOST | dsh-base | YES | HTTP search/fetch backends | Runtime | NO | NO | YES (tool-web) | CORE_HOST | base YAML; not browser transport |
| tools registry | `@deepseek-ai/dsh-tools` | tools | HOST | dsh-base; web restates mode | YES | Tool registry | Runtime | NO | NO | YES | CORE_HOST | dump `DSH_TOOLS_MODE` |
| system-prompt | `@deepseek-ai/dsh-system-prompt` | system-prompt | HOST | dsh-base; web persona | YES | Prompt assembly | Runtime | NO | NO | YES | CORE_HOST | web restates persona |
| agent-loop | `@deepseek-ai/dsh-agent-loop` | agent-loop | HOST | dsh-base | YES `agents: []` | Web creates sessions on request | Runtime | NO | NO | NO | CORE_HOST | base YAML |
| fs-sandbox + observation | `dsh-fs-sandbox`, `dsh-fs-observation-policy` | fs packages | HOST | dsh-base | YES | Sandboxed fs | Runtime | NO | NO | YES | CORE_HOST | base YAML |
| plugin-package-inventory-deepseek | `@deepseek-ai/dsh-plugin-package-inventory-deepseek` | inventory | HOST | dsh-base | YES | Package inventory | Runtime | NO | NO | NO | OPTIONAL_PRODUCT_CAPABILITY | base YAML |
| session-controller | `@deepseek-ai/dsh-api-session-controller` | `packages/api/session-controller` | HOST | dsh-web-app | YES | Session Remote | Runtime | NO (RPC); HTTP today | NO | NO | CORE_HOST | web-app YAML |
| settings-controller | `@deepseek-ai/dsh-api-settings-controller` | `packages/api/settings-controller` | HOST | dsh-web-app | YES | Settings Remote | Runtime | same | NO | NO | CORE_HOST | web-app YAML |
| workspace-controller | `@deepseek-ai/dsh-api-workspace-controller` | `packages/api/workspace-controller` | HOST | dsh-web-app | YES | Workspace Remote | Runtime | same | NO | NO | CORE_HOST | web-app YAML |
| workspace + references | `dsh-workspace`, `dsh-session-reference`, `dsh-file-reference-local` | workspace/reference | HOST | dsh-web-app | YES | Workspace/refs | Runtime | NO | NO | NO | CORE_HOST | web-app YAML |
| plugin-inventory | `@deepseek-ai/dsh-host-plugin-inventory` | host-plugin-inventory | HOST | dsh-web-app | YES | Loader projection | Runtime | NO | NO | NO | OPTIONAL_PRODUCT_CAPABILITY | web-app YAML |
| directory-picker | `@deepseek-ai/dsh-host-directory-picker-auto` | `packages/host/directory-picker-auto` | HOST | dsh-web-app | YES | native vs browse | Runtime+UI pair | browse yes | browse yes | NO | UNKNOWN_REQUIRES_SPIKE | resolve.ts win32 native if loopback |
| subagent-model-selection-settings | `@deepseek-ai/dsh-tool-subagent/model-selection-settings` | tool-subagent | HOST | dsh-web-app | YES | Settings ns | Runtime | NO | NO | YES (standard `modelSelectionSettings: true`) | OPTIONAL_PRODUCT_CAPABILITY | web-app YAML |
| code-runtime | `@deepseek-ai/dsh-code-runtime-worker-thread` | code-runtime | HOST | dsh-web-app | YES | Worker-thread code runtime | Runtime | NO | NO | NO (PTC preset) | OPTIONAL_PRODUCT_CAPABILITY | web-app insert; not in standard YAML |
| message-feedback | `@deepseek-ai/dsh-message-feedback` | message-feedback | HOST | dsh-web-app | YES | Like/dislike | Runtime | NO | NO | NO | OPTIONAL_PRODUCT_CAPABILITY | web-app YAML |
| session-stats | `@deepseek-ai/dsh-session-stats` | session-stats | HOST | dsh-web-app | YES | Chat stats | Runtime | NO | NO | NO | OPTIONAL_PRODUCT_CAPABILITY | web-app YAML |
| session-log-download | `@deepseek-ai/dsh-session-log-export` | `packages/session-query/session-log-export` | HOST+Web | dsh-web-app | YES | `/export` + ZIP Fetch | Runtime+UI | YES | YES | NO | WEB_TRANSPORT_ONLY | export command + Fetch route |
| cordis-host-runner | `@deepseek-ai/dsh-cordis-host-runner` | cordis-host-runner | HOST | dsh-web-app | YES | Live Cordis host inspect/run | Runtime | NO | NO | NO (cordis preset uses tool-cordis) | OPTIONAL_PRODUCT_CAPABILITY | web-app YAML; Dynamic Cordis |
| web-startup | `@deepseek-ai/dsh-web-app/startup` | `packages/bundle/web-app/src/startup.ts` | HOST | dsh-web-app | YES | CLI flags | Runtime | YES | NO | NO | WEB_TRANSPORT_ONLY | startup.ts |
| webserver | `@deepseek-ai/dsh-host-webserver` | host-webserver | HOST | dsh-web-app | YES | HTTP server | Runtime | YES | YES | NO | WEB_TRANSPORT_ONLY | web-app YAML |
| web-runtime | `@deepseek-ai/dsh-web-app` | `packages/bundle/web-app/src/index.ts` | HOST | dsh-web-app | YES | Dist, URL, openBrowser, `webRuntime` | Runtime | YES | YES | NO | WEB_TRANSPORT_ONLY | web-app YAML + index.ts |
| client-hmr | `@deepseek-ai/dsh-client-hmr` | `packages/client/hmr` | HOST node half | dsh-web-app | YES mounted; idle without `dev:web` | Client bundle poll + SSE | Runtime | YES | YES | NO | WEB_TRANSPORT_ONLY | YAML comment; hmr/src/index.ts |
| modules | `@deepseek-ai/dsh-client-modules` | `packages/client/modules` | HOST+Client | dsh-web-app | YES | `__DSH_BOOT__` graph | Runtime+UI | YES (as web) | YES | NO | UNKNOWN_REQUIRES_SPIKE | modules/src/index.ts |
| connection | `@deepseek-ai/dsh-client-connection` | `packages/client/connection` | HOST+Client | dsh-web-app | YES | Gateway `/api`, token, cookie | Runtime+UI | YES today | YES | NO | UNKNOWN_REQUIRES_SPIKE | YAML inject webRuntime; P0.S carrier |
| api-remotes | `@deepseek-ai/dsh-api-remotes` | `packages/api/remotes` | HOST+Client | dsh-web-app | YES | Generated remotes | Runtime+UI | via connection | YES | NO | CORE_HOST / DESKTOP_CLIENT split | P0-3 enumerates surface |
| agent-presets | `@deepseek-ai/dsh-agent-presets` | `packages/preset/agent-presets` | HOST roster | dsh-web-app | YES `default: standard` | Preset roster | Runtime | NO | NO | YES | CORE_HOST | web-app YAML |

Host-plane rows **disabled by web-app** (agent tools moved to presets): see section F.

## E. Standard Preset Composition (Plane B)

| Field | Value |
|---|---|
| PresetName | `standard` (display 标准模式) |
| PresetDefinitionPath | `packages/preset/agent-presets/presets/standard/preset.yml` |
| Agent composition | `packages/preset/agent-presets/presets/standard/agent.cordis.yml` |
| Roster default | web-app `agent-presets.config.default: standard` |
| Trust | shipped `system` root (`includeShippedRoot`) |
| Provider/model | none in preset; host `agent-default-model` is `deepseek-official` / `deepseek-v4-flash` |

### Agent runtime components (standard YAML)

Persona, agent-instructions, platform shell tool, fs tools, jobs tool, skills, goal command+tool, isolated plan-mode, isolated compaction, isolated delegation/workflow, ask-user, todo, tool-web (`fetch: true`).

### Tools (model-facing names from plugin source)

| Plugin row | Package | Model tool names | Class |
|---|---|---|---|
| tool-bash | `@deepseek-ai/dsh-tool-bash` | `bash` | STANDARD_REQUIRED on POSIX; disabled `!!js process.platform === 'win32'` |
| tool-pwsh | `@deepseek-ai/dsh-tool-pwsh` | `pwsh` | STANDARD_REQUIRED on Windows; disabled `!!js process.platform !== 'win32'` |
| tool-fs | `@deepseek-ai/dsh-tool-fs` | `read`, `read_image`, `write`, `edit` | STANDARD_REQUIRED |
| tool-fs-search | `@deepseek-ai/dsh-tool-fs-search` | `grep`, `glob` | STANDARD_REQUIRED |
| tool-jobs | `@deepseek-ai/dsh-tool-jobs` | `job_output`, `job_list`, `job_kill` | STANDARD_REQUIRED |
| tool-skill | `@deepseek-ai/dsh-tool-skill` | `skill` | STANDARD_REQUIRED |
| skill-filesystem | `@deepseek-ai/dsh-skill-filesystem` | (discovery, not a tool name) | STANDARD_REQUIRED |
| tool-goal | `@deepseek-ai/dsh-tool-goal` | `get_goal`, `create_goal`, `update_goal` | STANDARD_REQUIRED in this preset |
| plan-mode | `@deepseek-ai/dsh-plan-mode` | `exit_plan_mode` | STANDARD_REQUIRED in this preset |
| tool-subagent | `@deepseek-ai/dsh-tool-subagent` | `subagent` (+ `list_subagent_models` when `modelSelectionSettings: true`) | STANDARD_REQUIRED |
| tool-subagent-fork | same package | `subagent_fork` | STANDARD_REQUIRED; **continuable** (differs from disabled base `one-shot`) |
| tool-subagent-control | `@deepseek-ai/dsh-tool-subagent-control` | `send_message`, `interrupt_agent` | STANDARD_REQUIRED |
| tool-subagent-list-agents | `.../list-agents` | `list_agents` | STANDARD_REQUIRED |
| tool-workflow | `@deepseek-ai/dsh-tool-workflow` | `workflow` (default `toolName`) | STANDARD_REQUIRED in this preset |
| tool-ralph | `@deepseek-ai/dsh-tool-ralph` | `ralph` | STANDARD_REQUIRED in this preset |
| tool-ask-user | `@deepseek-ai/dsh-tool-ask-user` | `ask_user_question` | STANDARD_REQUIRED |
| tool-todo | `@deepseek-ai/dsh-tool-todo` | `todo_write` | STANDARD_REQUIRED |
| tool-web | `@deepseek-ai/dsh-tool-web` | `web_search`, `web_fetch` (`fetch: true`) | STANDARD_REQUIRED |
| tool-subagent-codex | `@deepseek-ai/dsh-tool-subagent` | `subagent_codex` | STANDARD_OPTIONAL / disabled; needs extra bundle |
| tool-subagent-claude-code | `@deepseek-ai/dsh-tool-subagent` | `subagent_claude_code` | STANDARD_OPTIONAL / disabled; needs extra bundle |

### NOT_IN_STANDARD (present elsewhere)

| Item | Where | Notes |
|---|---|---|
| `str_replace_editor` / `tool-str-replace-editor` | `minimal` preset only among shipped presets; host row disabled by web | **Not restored by standard**. Standard uses `tool-fs` `edit`/`write`. |
| `tool-cordis` | `cordis` preset | Dynamic Cordis model tools |
| persistent bash/pwsh (`dsh-terminal`, `tool-*-persistent`) | `minimal` | Not standard |
| PTC `run_code` presentation | `ptc` preset | Not standard |

### Commands (standard-scoped)

| Command | Plugin | Class |
|---|---|---|
| `/goal` | `@deepseek-ai/dsh-command-goal` | STANDARD_REQUIRED in this preset |
| `/plan` | `@deepseek-ai/dsh-plan-mode` | STANDARD_REQUIRED in this preset |
| `/compact` | `@deepseek-ai/dsh-command-compact` | STANDARD_REQUIRED in this preset |

### Permission

Not a preset row. Host `permission` + `approval` + `sandbox-policy`. Standard agents inherit host permission. `/permission` is host-global.

### Plan / Goal / Workflow relation

- Goal **service** stays host; preset adds `/goal` + goal tools.
- Plan **state** is isolated per preset mount (`cordis:group` + `isolate.planMode`).
- Workflow **engine** is isolated in the preset delegation group; host does not keep a populated workflow registry for web sessions.
- Subagent **registry/backends** stay host; preset adds tools.

### Other shipped presets (not expanded as Web default)

| Id | Path | Role |
|---|---|---|
| `ptc` | `presets/ptc/` | Standard capabilities + PTC presentation |
| `minimal` | `presets/minimal/` | Persistent shell + `str_replace_editor` |
| `cordis` | `presets/cordis/` | Standard-like + `tool-cordis` + composition skills |

## F. Web-disabled / Preset-restored Capabilities

Verified on frozen source + dump. Not copied from prior audit.

### Disabled on Web host plane (`packages/bundle/web-app/cordis.patch.yml`, dump `disabled: true`)

`tool-bash`, `tool-pwsh`, `tool-jobs`, `tool-fs`, `tool-fs-search`, `tool-str-replace-editor`, `skill-filesystem`, `tool-skill`, `command-goal`, `tool-goal`, `plan-mode`, `compaction-basic`, `command-compact`, `tool-result-pruner`, `tool-subagent-control`, `tool-subagent-list-agents`, `tool-subagent`, `tool-subagent-fork`, `workflow-worker-thread`, `tool-workflow`, `tool-ralph`, `agent-instructions`, `tool-todo`, `tool-web`.

Host rows **kept** (not disabled): `jobs`, `skill`, `goal`, `goal-round-driver`, `token-meter`, `subagent` + spawn/fork backends, `tool-subagent-report`, `shell-env`, `commands`, `command-feedback`, `permission`, `approval`, `sandbox*`, persistence, LLM, gateway, etc.

### Restored by `standard` `agent.cordis.yml`

All of the disabled tool/command rows above **except**:

- `tool-str-replace-editor` — **not** in standard.
- Host `agent-instructions` is disabled globally; standard mounts its **own** `agent-instructions` row.

Material delta vs disabled base `tool-subagent-fork`: standard sets `backgroundMode: continuable` (base dump still shows `one-shot` on the disabled host row).

Standard also adds `tool-ask-user` (never a base web host tool row).

## G. Client Composition

Web-app `dsh.client` roster (dump ids `ui-*`, `locale`, `modules`, `connection`, `api-remotes`, `cordis-client-runner`). These are Desktop-reusable **only as Harness Client packages**, not as the Electron shell.

| Id | Package | Role | ShacoClassification |
|---|---|---|---|
| modules | `@deepseek-ai/dsh-client-modules` | `__DSH_BOOT__` | UNKNOWN_REQUIRES_SPIKE |
| connection | `@deepseek-ai/dsh-client-connection` | Fetch/SSE client | UNKNOWN_REQUIRES_SPIKE |
| api-remotes | `@deepseek-ai/dsh-api-remotes` | Client remotes | DESKTOP_CLIENT |
| cordis-client-runner | `@deepseek-ai/dsh-cordis-client-runner` | Client Cordis | OPTIONAL_PRODUCT_CAPABILITY |
| ui-theme, locale, ui-layout, ui-renderer | client-ui-* | Shell chrome | DESKTOP_CLIENT |
| ui-session, ui-sidebar, ui-chat, ui-conversation | client-ui-* | Session UI | DESKTOP_CLIENT |
| ui-settings* | client-ui-settings* | Settings | DESKTOP_CLIENT |
| ui-approval | client-ui-approval | Approval UI | DESKTOP_CLIENT |
| ui-tool | client-ui-tool | Tool cards | DESKTOP_CLIENT |
| ui-workspace | client-ui-workspace | Workspace UI | DESKTOP_CLIENT |
| ui-commands, ui-input-trigger | client-ui-* | `/` pipeline | DESKTOP_CLIENT |
| ui-skill, ui-subagent, ui-reference | client-ui-* | @ mentions | DESKTOP_CLIENT |
| ui-attachment | client-ui-attachment | Attachments | DESKTOP_CLIENT |
| ui-brand-official | client-ui-brand-official | Brand | OPTIONAL_PRODUCT_CAPABILITY |
| ui-deliverables | client-ui-deliverables | Produced files | OPTIONAL_PRODUCT_CAPABILITY |
| ui-trajectory | client-ui-trajectory | Trajectory | OPTIONAL_PRODUCT_CAPABILITY |
| ui-message-feedback | client-ui-message-feedback | Feedback strip | OPTIONAL_PRODUCT_CAPABILITY |
| ui-model-selection | client-ui-model-selection | `/model` popupSelect | DESKTOP_CLIENT |
| ui-permission | client-ui-permission-presets | Permission UI | DESKTOP_CLIENT |
| ui-agent-preset | client-ui-agent-preset | Preset picker | DESKTOP_CLIENT |
| ui-plan | client-ui-plan | Plan seat | DESKTOP_CLIENT |
| ui-user-questions | client-ui-user-questions | Questions UI | DESKTOP_CLIENT |
| ui-jobs | client-ui-jobs | Jobs header | OPTIONAL_PRODUCT_CAPABILITY |
| ui-goal | client-ui-goal | Goal bar | OPTIONAL_PRODUCT_CAPABILITY |
| ui-workflow-run | client-ui-workflow-run | Workflow node | OPTIONAL_PRODUCT_CAPABILITY |
| ui-cordis | `@deepseek-ai/dsh-client-ui-cordis` | Cordis UI | OPTIONAL_PRODUCT_CAPABILITY |
| ui-settings-plugins / plugin-inventory | settings plugins | Plugin config UI | OPTIONAL_PRODUCT_CAPABILITY |

## H. Web Transport Only

| Component | Evidence | Notes |
|---|---|---|
| webserver | web-app YAML `dsh-host-webserver`; default `127.0.0.1:3080` | HTTP bind |
| web-runtime | `packages/bundle/web-app/src/index.ts` | frontend dist, `printUrl`, `openBrowser`, `webRuntime.trustedHosts` |
| openBrowser | startup `--no-open`; `open` package spawn; SSH suppresses | Desktop must not require OS browser |
| token URL | `connection.authenticatedUrl` → `?token=`; `TOKEN_QUERY = 'token'` in `packages/client/connection/src/browser-auth.ts` | Cookie after index authorize; P0-4 for trust |
| client-hmr | always mounted; idle without `pnpm run dev:web` | Dev-only in practice |
| frontend-static | mounted by web-runtime | Serves `dsh-web-frontend/dist` |
| session-log ZIP `/export` | session-log-export Fetch route | Browser download |

Removing these without a replacement carrier is **UNKNOWN_REQUIRES_SPIKE** (P0.S), not a P0-2 product decision.

## I. Persistence / Windows Facts

### Persistence

| Kind | Package | In web composition? |
|---|---|---|
| **Default session persistence** | `@deepseek-ai/dsh-session-persistence-jsonl` `root: !!js dshHomePath('sessions')` | YES (base) |
| Session search/index SQLite | `@deepseek-ai/dsh-session-query-sqlite` `path: ':memory:'` `openAt: never` | YES mounted; content search **off** |
| Session persistence SQLite | `@deepseek-ai/dsh-session-persistence-sqlite` | **NO** — package exists, not in base/web YAML |
| KV storage | `dsh-storage-json` under `dshHomePath('storages')` | YES |

Do not treat repository presence of SQLite persistence as Web default.

### Windows

| Topic | Fact |
|---|---|
| WindowsShell | Host `tool-pwsh` disabled on web; **standard remounts** `tool-pwsh` with `disabled: !!js process.platform !== 'win32'`. Executor `pwsh-sandbox` enabled on win32. |
| WindowsSandbox | `dsh-sandbox-local` `win32: ['windows-acl']` → `@deepseek-ai/dsh-sandbox-windows-acl`. Enforcement `partial`. |
| Linux-only | `native/landlock-run` (bwrap/landlock). **Not** a Windows REQUIRED row. pnpm install skipped those optional platform packages. |
| bash on Windows | `tool-bash` / `bash-sandbox` gated off win32 at runtime. |
| Directory picker | `directory-picker-auto` assumes native chooser on win32 when loopback and not SSH (`packages/host/directory-picker-auto/src/resolve.ts`). |

## J. Dynamic Cordis Findings

| Component | Status | CurrentRole | LikelyShacoClassification |
|---|---|---|---|
| tool-cordis | PRESENT in **cordis preset only**; NOT in standard; NOT in web dump | Model tools to read/mount live Cordis | OPTIONAL_PRODUCT_CAPABILITY / DEFER_OR_REMOVE for V1 core |
| cordis-host-runner | PRESENT in web-app host insert | Host-side Cordis runner | OPTIONAL_PRODUCT_CAPABILITY; omit-safety = UNKNOWN_REQUIRES_SPIKE |
| cordis-client-runner | PRESENT in web-app client roster | Client Cordis runner | OPTIONAL_PRODUCT_CAPABILITY; same |
| ui-cordis | PRESENT in web-app client roster | Cordis tool cards | OPTIONAL_PRODUCT_CAPABILITY |

Web Host still mounts Cordis **runners + UI** even when default preset is `standard` (no `tool-cordis`). Whether Worker can drop them is a spike, not a P0-2 freeze.

Host `cordis-plugin-hmr` remains `disabled: true` (not Dynamic Cordis).

## K. Command Registration Findings

Mechanism:

1. Host registry `@deepseek-ai/dsh-commands` (`ctx.commands.register`, name without slash, `/^[a-z][a-z0-9_-]*$/`).
2. Plugins register at apply time, globally or under agent/preset scope.
3. Web UI `ui-commands` + `ui-input-trigger` discover the registry; some commands (`/model`) register on **client** `commandUi`, not the host registry.
4. Dump does not list command names. Names come from plugin source.

CURRENT_COMMAND_REGISTRATION_MAP:

| Command | Plane | Status |
|---|---|---|
| `/feedback` | HOST (`command-feedback`) | DISCOVERED |
| `/permission` | HOST (`permission-presets`) | DISCOVERED |
| `/export` | WEB host (`session-log-export`); Fetch ZIP | DISCOVERED; Web-specific |
| `/goal` | STANDARD preset (`command-goal`) | DISCOVERED |
| `/plan` | STANDARD preset (`plan-mode`) | DISCOVERED |
| `/compact` | STANDARD preset (`command-compact`) | DISCOVERED |
| `/model` | CLIENT (`ui-model-selection` `commandUi`) | DISCOVERED |

DynamicCommandsStillRequiringP0_5:

- Live slash catalog after session + preset + user presets + skills.
- Any plugin-contributed commands not in the files above.
- Desktop equivalent of `/export` if ZIP Fetch is removed.

Do not assume additional names.

## L. Shaco Forge Host Composition Candidate

DESIGN CANDIDATE only. No `shaco-forge-host` created.

### KEEP IN WORKER HOST

LLM/session/agent/agent-loop, typert+gateway+controllers (RPC face), JSONL persistence, storage, projection, credentials, settings, sandbox-local+windows-acl+pwsh-sandbox, approval, permission, jobs registry, skill registry, commands registry, subagent registry+spawn/fork+report, token-meter, user-questions, goal domain (if product keeps goals), web search/fetch **providers** (not HTTP GUI), tools registry, system-prompt, fs-sandbox, subprocess, shell-env, agent-presets roster, workspace + session/file reference.

### KEEP THROUGH STANDARD PRESET

`tool-pwsh`/`tool-bash` (platform), `tool-fs`+search, `tool-jobs`, skills, goal command+tools, plan-mode, compaction trio, subagent tools (spawn/fork/control/list), workflow+ralph, todo, ask-user, tool-web with fetch, persona/agent-instructions.

### MOVE TO DESKTOP CLIENT

Harness `dsh.client` UI packages listed in G, reused as Client projection — not rewritten as a second Agent RPC. Electron shell itself is P0.S/P4.

### REMOVE WEB TRANSPORT

Candidate removals **if** P0.S proves an alternate carrier + boot:

webserver, web-runtime (`openBrowser`, `printUrl`, frontend-static dist serving), token query URL, client-hmr, browser-only session-log ZIP `/export`.

Do not remove Connection/Gateway **semantics** — only the HTTP physical mapping, pending spike.

### OPTIONAL / DEFER

Jobs/goal/workflow/ralph UI and tools as product optional (still in standard today — P0-5 decides REQUIRED). message-feedback, session-stats, telemetry, plugin-inventory UI, brand, deliverables, trajectory, PTC/code-runtime, cordis preset + tool-cordis, ui-cordis, host/client cordis runners, sqlite session persistence package, session-query content search (`openAt: never`).

### UNKNOWN_REQUIRES_SPIKE

See section L of unknowns (P0.S input).

## M. Unknowns Requiring P0.S

| ID | Question |
|---|---|
| P0S-COMP-01 | Can Worker boot Host without `dsh-host-webserver` / web-runtime while keeping Gateway + remotes? |
| P0S-COMP-02 | What physical carrier replaces `/api` + token URL + cookie (`dsh-client-connection` node half)? |
| P0S-COMP-03 | Is `window.__DSH_BOOT__` / `dsh-client-modules` required inside Electron, or is there another Client boot? |
| P0S-COMP-04 | Can `client-hmr` be omitted in packaged Desktop? |
| P0S-COMP-05 | Directory picker: native vs browse vs Electron dialog on Windows. |
| P0S-COMP-06 | Can `cordis-host-runner` / `cordis-client-runner` / `ui-cordis` be dropped if Dynamic Cordis is deferred? |
| P0S-COMP-07 | Does Connection trust fence still work if `webRuntime.trustedHosts` / loopback HTTP is gone? (also P0-4) |
| P0S-COMP-08 | Frontend dist serving vs bundling Client into Electron. |

## N. Gate Results

```text
FROZEN_BASELINE_REVERIFIED = YES
UPSTREAM_WORKTREE_CLEAN_BEFORE = YES
UPSTREAM_WORKTREE_CLEAN_AFTER = YES
WEB_BOOT_CHAIN_TRACED = YES
WEB_PROFILE_COMPOSITION_ENUMERATED = YES
HOST_PLANE_ENUMERATED = YES
STANDARD_PRESET_LOCATED = YES
STANDARD_PRESET_COMPOSITION_ENUMERATED = YES
STANDARD_PRESET_TOOL_PLANE_KNOWN = YES
WEB_DISABLED_TOOL_LINES_IDENTIFIED = YES
CLIENT_PLANE_ENUMERATED = YES
WEB_TRANSPORT_ONLY_PLANE_ENUMERATED = YES
PERSISTENCE_DEFAULT_IDENTIFIED = YES
WINDOWS_PLATFORM_COMPOSITION_IDENTIFIED = YES
DYNAMIC_CORDIS_LAYERS_IDENTIFIED = YES
COMMAND_REGISTRATION_MECHANISM_IDENTIFIED = YES
SHACO_FORGE_HOST_COMPOSITION_CANDIDATE_WRITTEN = YES
P0S_UNKNOWN_INPUTS_RECORDED = YES
P0_2_EVIDENCE_WRITTEN = YES
P0_WEB_COMPOSITION_KNOWN = YES
P0_STANDARD_PRESET_KNOWN = YES
SHACO_FORGE_V1_0_P0_2 = PASS
SHACO_FORGE_V1_0_P0 = NOT_PASS
```

P0-3 was not executed.
