# P0-4 — Authentication and Trust Surface

Status: `CLOSED / PASS`
Scope: P0-4 only
Frozen Harness: `deepseek-ai/deepseek-harness@cd5ef8148158c3a752a658978873241fdf8e2bbc`

## A. Frozen Baseline

| Item | Verified value |
|---|---|
| Repository | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Commit | `cd5ef8148158c3a752a658978873241fdf8e2bbc` |
| Release | `dsh-v0.1.2-alpha.1` |
| Package | `@deepseek-ai/dsh@0.1.2-alpha.1` |
| `pnpm-lock.yaml` SHA256 | `506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1` |
| Upstream clean before audit | YES |
| Upstream clean after audit/tests | YES |
| Build executed | NO |
| Targeted tests | 14 files / 205 tests passed |

All source paths below are relative to
`D:\Project\Shaco-Forge-Upstream\deepseek-harness`.

## B. Discovery Sources

Evidence priority was frozen source, route registration and tests. The audit
traced:

1. Web bind and authenticated URL publication.
2. Process launch token exchange and BrowserAuth cookie verification.
3. `/api` and WebSocket Host/Origin fencing.
4. Client loopback classification and its settings dependency.
5. Gateway dispatch below authenticated and alternate carrier seams.
6. Exact Fetch, static/module/HMR, credentials and directory picker surfaces.

No Harness source, dependency, lockfile or SHA was changed. P0-5, P0.S and P1
were not executed.

## C. Current Trust Architecture

```text
dsh web process
  ├─ binds HTTP to 127.0.0.1 by default
  ├─ creates a process-root launch token
  └─ loads/creates a persistent BrowserAuth HMAC secret
          │
          ▼
printed/opened http://127.0.0.1:<port>/?token=<launch-token>
          │  GET / + valid token
          ▼
303 Location: / + authority-bound HttpOnly SameSite=Strict cookie
          │
          ├─ authenticated index/boot page
          ├─ same-origin Fetch → Host/Origin fence → cookie → /api bridge
          └─ WebSocket upgrade → Host/Origin fence → cookie → Remote mux
                                                        │
                                                        ▼
                                               Typert Gateway
                                                        │
                                                        ▼
                                      Host controllers / Cordis services
```

The answer to “why does `dsh web` trust a browser request?” is the conjunction,
not just a cookie:

1. Stock Web binds only to loopback by default; the CLI currently rejects
   `--host 0.0.0.0`.
2. Initial index access requires the process launch token or an existing valid
   cookie.
3. API and mux requests must name a loopback/configured Host, must not be
   explicitly cross-site, and any supplied Origin must name the same authority.
4. API and mux requests must also carry the signed, unexpired,
   authority-bound BrowserAuth cookie.
5. Only after those Web-adapter checks does the request reach Gateway. Gateway
   validates the Remote contract, not caller identity.

The trust layers are:

| Layer | Current fact | Web-specific? |
|---|---|---|
| Process / Host binding | `127.0.0.1:3080` default; stock CLI rejects all-interface bind | YES |
| Browser session authentication | launch-token exchange to signed cookie | YES |
| Request Host / Origin trust | DNS-rebinding and cross-site fence | YES |
| Loopback classification | shared hostname predicate; Client derives privileged capability | PARTLY |
| API authentication | `/api` prefix runs `requestRejection` before dispatch | YES adapter |
| WebSocket authentication | upgrade runs the same rejection once | YES |
| Exact Fetch authentication | exact `/api/*` route is selected below authenticated prefix | YES adapter |
| Static/plugin trust | index authenticated; non-index and plugin/HMR bytes public | YES |
| Client capability/settings trust | non-loopback Client suppresses Host settings reads/writes | Client policy |
| Alternate `rpc.call/open` trust | logical seam assumes the carrier/composition already authenticated | NO, but responsibility is external |

## D. Launch Token Flow

```text
BrowserAuth.create(ctx.root, credentials, maxAgeDays)
  → processLaunchToken(ctx.root)
  → 32 random bytes, base64url, cached in WeakMap by root Context
  → connection.authenticatedUrl(cleanBaseUrl)
  → GET /?token=<token>
  → frontend-static calls connection.authorizeIndex
  → BrowserAuth.authorizeIndex validates GET + root + one exact token + Host authority
  → signed cookie issued
  → 303 Location: /, Cache-Control: no-store, Referrer-Policy: no-referrer
  → clean index request uses cookie
  → later same-origin Fetch and WebSocket carry cookie
```

| Property | Frozen behavior | Evidence |
|---|---|---|
| Generation | `randomBytes(32)` in `processLaunchToken` | `packages/client/connection/src/browser-auth.ts` |
| Owner/lifetime | WeakMap key is root application Context; stable across Connection reloads in one process root; changes on process restart | browser-auth source/tests |
| One-time? | NO. The same token can mint multiple cookies while the process root lives | browser-auth source/tests |
| Explicit token expiry | NONE; effective lifetime is the process-root lifetime | browser-auth source |
| Query | sole name `token`; authenticated URL resets path to `/`, clears search/hash, then sets it | browser-auth source |
| Valid exchange | only `GET /`, exactly one token value, parseable Host authority, timing-safe equality | browser-auth source |
| Invalid/stale token | 401 unless a valid cookie is already present; valid cookie with a stale token gets a clean 303 | browser-auth tests |
| URL cleanup | 303 to `/`; `no-store`; `no-referrer` | browser-auth source/tests |
| Refresh | token is not needed after cookie issuance; ordinary refresh uses cookie | browser-auth tests |
| Publication | printed to console and optionally handed to a scrubbed browser-launch helper | `packages/bundle/web-app/src/index.ts` |

`authorizeIndex` does not call `isTrustedApiRequest`. It validates that a Host
authority exists and binds the cookie to it, but it does not require that
authority to be loopback or in `trustedHosts`. `/api` and mux independently
enforce that fence.

## E. BrowserAuth Cookie Contract

| Property | Frozen behavior |
|---|---|
| Cookie name | `dsh-auth-` + base64url SHA-256 of canonical request authority |
| Payload | `{version:1, authority, issuedAt, expiresAt}` |
| Encoding/signing | `v1.<base64url(JSON)>.<base64url(HMAC-SHA256)>` |
| Signing secret | 32 random bytes in credential record `client-connection/browser-session`, grant payload version 1 |
| Secret storage | active credential provider; Web default persists the record in `$DSH_HOME/.credentials.yaml` |
| Default lifetime | absolute 30 days (`cookieMaxAgeDays`), not sliding |
| Attributes | `Max-Age`, `Path=/`, `Expires`, `HttpOnly`, `SameSite=Strict` |
| `Secure` | NO; explicitly absent in source test |
| `Domain` | absent, so browser host-only behavior applies |
| Verification | parse Host authority → derive cookie name → verify HMAC timing-safely → exact authority → timestamp and configured maximum |
| Missing/malformed/tampered/expired | authentication false; caller answers 401 |
| Process restart | old cookie remains valid when it is still unexpired, fits the active `cookieMaxAgeDays`, and the same persistent signing record and authority remain |
| Secret deletion | current activation retains loaded secret; next activation creates a new secret and invalidates old cookies |
| Invalid stored record | Connection activation fails loudly; record is not silently replaced |

The cookie proves possession of a token at issuance time, or later possession
of the bearer cookie, and that a process with access to the same persistent
BrowserAuth signing secret minted it for the named authority. It does **not**
prove:

- Windows/OS user identity;
- that the requester is a browser rather than another HTTP client;
- loopback origin or network peer address;
- the current Host process instance;
- the identity or integrity of JavaScript issuing the request.

Loopback/Host/Origin trust is a separate fence. The persistent secret also means
the cookie is a Harness-home browser-session credential, not a current-process
identity proof.

## F. Host / Origin Trust

`isTrustedApiRequest` is a Web request fence, explicitly not authentication.
It does not inspect the remote socket address.

Evaluation order:

1. `Host` must exist and parse as an HTTP authority.
2. Parsed hostname must be loopback or match `trustedHosts`.
3. `Sec-Fetch-Site: cross-site` is denied.
4. If `Origin` exists, `new URL(origin).host` must equal parsed Host `.host`.
5. Missing Origin is accepted.

| Case | Result before cookie check | Notes |
|---|---|---|
| `localhost[:port]` | ALLOW | WHATWG normalization handles case/default port |
| `127.0.0.1[:port]` | ALLOW | whole normalized `127/8` accepted |
| `[::1][:port]` | ALLOW | bracketed normalized form |
| LAN IP | DENY unless listed in `trustedHosts` | port-less entry matches any port |
| Custom hostname | DENY unless listed | exact-port or hostname-wide entry |
| Missing Origin | ALLOW | Host fence remains mandatory |
| Empty Origin value | DENY | URL parse fails |
| Origin `null` | DENY | opaque/file/sandbox origin |
| Literal `file://` Origin | DENY | empty origin host cannot equal API Host |
| Same authority, different scheme | ALLOW by this function | comparison is `.host`, not scheme |
| `Sec-Fetch-Site: cross-site` | DENY | regardless of Origin |
| Missing/malformed/untrusted Host | DENY | 403 from requestRejection |
| Browser WebSocket | same rules on upgrade | browser normally supplies Origin; absent is still accepted by source |

`trustedHosts` entries must be canonical bare `host` or `host:port`
authorities. Paths, user-info, whitespace, dangling/zero-padded ports,
hex-IPv4 and noncanonical IPv6 fail plugin activation. A port-less entry grants
that hostname on any port; an explicit port grants exactly that authority.

The Web runtime can derive non-internal LAN IPv4 literals for an
all-interfaces composition, but the stock `dsh web` CLI currently refuses
`--host 0.0.0.0` for remote-code-execution safety. `--trusted-host` changes
the authority fence; it does not by itself widen the socket bind.

### Electron custom scheme

There is no custom-Electron-scheme test or explicit scheme allowlist in this
baseline. Deterministic source behavior is:

- absent Origin can pass if Host is allowed;
- `Origin: null`, the usual opaque/file shape, fails;
- a parseable custom-scheme Origin passes only if its `.host` equals the API
  Host and it is not marked cross-site;
- current default unary and mux URL builders fall back to
  `http://dsh.internal` / `ws://dsh.internal` for a `null` page origin unless
  custom transport hooks are installed.

Actual Electron header and custom-scheme classification is
`UNKNOWN / REQUIRES_SPIKE`.

Evidence:

- `packages/client/connection/src/api-request-trust.ts`
- `packages/client/connection/tests/api-request-trust.host.spec.ts`
- `packages/bundle/web-app/src/startup.ts`
- `packages/bundle/web-app/src/index.ts`
- `packages/bundle/web-app/tests/trusted-hosts.spec.ts`

## G. Loopback Classifier

| Field | Value |
|---|---|
| Function | `isLoopbackHostname(hostname)` |
| Source | `packages/client/connection/src/loopback-hostname.ts` |
| Input contract | normalized WHATWG URL hostname; IPv6 remains bracketed |
| Accepted | `localhost`, `[::1]`, and four decimal IPv4 parts in `127/8`, each 0–255 |
| Rejected examples | `remote.localhost`, unbracketed `::1`, `128.0.0.1`, short/malformed/out-of-range `127.*` |
| Direct callers | Host `isTrustedApiRequest`; Client Connection `isLoopback` derivation |

Client `ctx.connection.isLoopback` is true when any of:

- custom transport declares `ownsHost: true`;
- no browser `location` exists;
- `location.hostname` passes `isLoopbackHostname`.

`ownsHost` is a composition assertion and privileged-UI capability signal. It
is not cryptographic peer authentication and Gateway never verifies it.

## H. Loopback Dependency Map

| Capability | Dependency | Effect |
|---|---|---|
| API Host fence | direct classifier call | loopback Host accepted without `trustedHosts` |
| Client privileged capability | direct classifier call | sets `connection.isLoopback` |
| Settings read/persistence UI | `connection.isLoopback` | Host mirror/writes vs terminal unavailable memory mode |
| Settings schema/secret-slot view | same settings mirror | non-loopback Client does not request Host descriptors |
| Theme/locale/model/preset/permission settings scopes | settings binder | inherit the same availability/write policy |
| Credentials Remote | no direct loopback check | any authenticated API caller can call describe/set/unset; Web Search settings code still calls `credentials.describe` even when its Settings scope is unavailable |
| Settings Remote/native open methods | no Host-side loopback check | direct authenticated callers can invoke them |
| Session/workspace/filesystem Remote methods | no direct loopback check | controller business checks only |
| Directory picker backend | separate `webServer.host === '127.0.0.1'` check | selects native vs browse once at boot |
| Web `trustedHosts` | separate authority list | non-loopback Host can pass API fence; does not set Client `isLoopback` |
| Experimental worker transport | `ownsHost: true` | makes settings privileged off-loopback; bypass trust rests on owner composition |

The loopback classifier is therefore both a Web Host fence input and a Client
capability canary. It is not a general Host authorization service.

## I. Settings Trust Behavior

`SETTINGS_PERSISTENCE_DEPENDS_ON_LOOPBACK = YES`.

Exact dependency:

```text
location.hostname / transport.ownsHost / no-location
  → client Connection.isLoopback
  → ui-settings apply + SettingsScopeBinder.bind
  → persistence = "host" or "memory"
```

| Behavior | Trusted loopback / ownsHost / non-browser | Non-loopback served page |
|---|---|---|
| `settings.describe` | called through Remote | not called |
| Namespace values/schema | Host redacted view available | unavailable |
| Host writes | `update/replace/mutate` enabled when Host says writable | no Remote write; local methods settle as no-op |
| Snapshot | loading/ready, Host revision and writable flag | `status:"unavailable"`, `mode:"memory"`, `writable:false` |
| Persistence target | Web default `$DSH_HOME/settings.yaml` | no Host persistence |
| In-memory replacement store | NO general replacement document is implemented | “memory” mode is terminally unavailable, not a local settings database |
| Secret fields | Host `describe({redactSecrets:true})`; only `{path,set}` metadata | no Host descriptor fetched |
| Native document open | UI lacks mirror facts; Host Remote itself has no loopback guard | direct authenticated Remote remains technically callable |

The Web default `settings-file` provider is writable, hot-reloaded and writes
atomically with requested owner-only modes (`0600` file, `0700` directory).
The loopback decision occurs in the Client Settings scope layer, not in
`SettingsController` or the settings provider. Consequently, an authenticated
non-loopback caller that bypasses the stock UI can directly call Settings
Remote methods. It does not suppress the separate Credentials Remote:
`WebSearchCardController` performs `credentials.describe` on construction even
when its Settings scope is unavailable. The Settings restriction is
capability/UI containment, not a server-side authorization boundary.

Evidence:

- `packages/client/connection/src/client/index.ts`
- `packages/client/ui-settings/src/client/index.ts`
- `packages/client/ui-settings/src/client/settings-mirror.ts`
- `packages/client/ui-settings/src/client/settings-scope.ts`
- `packages/client/ui-settings/tests/settings-mirror.client.spec.ts`
- `packages/client/ui-settings/tests/settings-scope.client.spec.ts`
- `packages/client/ui-settings-plugins/src/client/web-search-card-controller.ts`
- `packages/client/ui-settings-plugins/tests/stores.client.spec.ts`
- `packages/api/settings-controller/src/index.ts`
- `packages/settings/settings-file/src/index.ts`

## J. API Authentication Pipeline

```text
node:http request
  → WebServer longest route: prefix /api
  → connection.requestRejection(req)
       1. isTrustedApiRequest(req, trustedHosts)      failure 403
       2. browserAuth.isAuthenticated(req)            failure 401
  → HTTP bridge buffers body (default maximum 300 MiB)
  → createSharedFetchHandler
       exact registered Fetch route first
       otherwise registered Gateway interceptor
  → RPC handler checks POST, endpoint, application/json, JSON and envelope
  → Typert Gateway claims endpoint and validates exact arguments/descriptor
  → Host controller/Cordis service
```

`requestRejection` checks:

| Input | Checked there? |
|---|---|
| BrowserAuth cookie | YES |
| Host | YES |
| Origin | YES when supplied |
| `Sec-Fetch-Site` | YES; explicit cross-site denied |
| `trustedHosts` | YES |
| loopback | YES, as Host hostname classification |
| remote socket address | NO |
| method | NO; route/RPC layer checks later |
| content type | NO; RPC layer checks later |
| launch token/query | NO |
| endpoint/body/business authorization | NO; later layers |

Gateway has no caller identity, role or browser-session object. It assumes its
invocation/open seam is authorized and performs contract lookup, validation,
scope resolution and business dispatch. Controllers enforce domain invariants,
not transport caller identity.

## K. Remote Mux Trust

| Property | Frozen behavior |
|---|---|
| Route | exact upgrade `/api/remote.mux` |
| Authentication point | Gateway upgrade handler calls `connection.requestRejection(req)` before `ws.handleUpgrade` |
| Cookie | browser WebSocket handshake supplies authority cookie automatically |
| Host/Origin | same Host/Origin/Fetch-metadata fence as unary |
| Trust failure | raw HTTP 401 Unauthorized or 403 Forbidden, `Connection: close`, then socket ends |
| Accepted connection | `RemoteStreamMuxConnection` is created after WebSocket upgrade |
| Connection generation | not created merely by upgrade; Client generation becomes ready when `$events` yields its `ready` frame |
| Per-message checks | stream frame schema, endpoint and Gateway contract validation |
| Re-authentication | NONE after establishment; cookie/Host/Origin are not rechecked per frame |
| Socket loss | all active stream signals aborted; Client reconnect opens a new socket and therefore re-runs upgrade auth |

Invalid text/binary protocol frames are a protocol close (1008/1003), distinct
from authentication rejection. Heartbeat Ping keeps transport liveness but is
not identity proof.

Evidence:

- `packages/api/gateway/src/index.ts`
- `packages/api/gateway/src/stream-server.ts`
- `packages/api/gateway/src/client/stream-client.ts`
- `packages/api/gateway/tests/gateway-stream.host.spec.ts`

## L. Exact Fetch Trust

| Route | Auth hook | Host | Origin | Cookie | Browser-only? | Public? |
|---|---|---|---|---|---|---|
| `/api/<Remote>` | `/api` prefix `requestRejection` | required/allowed | same authority if supplied | required | NO; browser Fetch is the stock caller | NO |
| `/api/remote.mux` | explicit upgrade `requestRejection` | required/allowed | same authority if supplied | required | NO; browser WebSocket is the stock caller | NO |
| `/api/session.export` GET/HEAD | inherited `/api` prefix before exact route selection | YES | YES | YES | NO; browser download is the stock caller | NO |

The frozen graph has one registered exact product Fetch route:
`/api/session.export`. It is not protected merely because its string starts
with `/api`; it is protected because the registered Web `/api` prefix calls
`requestRejection` before `createSharedFetchHandler` selects exact routes.

## M. Static / Plugin Asset Trust

| Surface | Authenticated? | Content/trust fact |
|---|---|---|
| SPA `/` and `/index.html` | YES: token exchange or BrowserAuth cookie | rendered boot page, module graph injections and executable bootstrap |
| Non-index static JS/CSS/assets | NO | build artifacts; public fallback files; no user secret is intended |
| Static source maps | NO | public when present; may contain `sourcesContent` |
| `/plugins/??...&rev=...` combo JS | NO | Host-selected generated concatenation of active client package bundles; executable in Client |
| Plugin combo source maps | NO | generated indexed maps, potentially including source content |
| `/plugins/events` HMR SSE | NO | public graph snapshot and `{id,rev}` rebuild notices; dev channel |
| `window.__DSH_BOOT__` graph | index-authenticated | dynamic roster/ordering/revisions/URLs, not credentials or auth metadata |
| Dynamic Cordis `getClientCode` | authenticated Remote, not `/plugins` | separate dynamic-code management surface |

The source deliberately treats non-index assets and module bytes as public
code, not as secrets. Their safety currently depends on code provenance and on
the deployment reachability posture; default loopback prevents remote network
access but does not prevent another local process from reading them. If a
custom composition exposes the server, these routes are network-public because
they contain no Connection auth hook.

Authentication of the index does not authenticate every script response.
Instead, the authenticated page receives a Host-composed graph and executes
public revision-addressed bytes. A Desktop package must preserve trusted byte
provenance; “public on loopback” is not an IPC identity model.

Evidence:

- `packages/host/frontend-static/src/index.ts`
- `packages/host/frontend-static/tests/frontend-static.spec.ts`
- `packages/client/modules/src/index.ts`
- `packages/client/hmr/src/index.ts`

## N. Non-Web `rpc.call/open` Trust Seam

`AUTHENTICATION_RESPONSIBILITY`:

```text
served Web:
  CONNECTION WEB ADAPTER (Host/Origin + BrowserAuth)

alternate/in-process/custom transport:
  CALLER-PROVIDED TRANSPORT / COMPOSITION

Gateway:
  assumes the invocation/open is already authorized
```

Facts:

- `ClientConnectionRpc.call/open` carries channel, endpoint, payload and
  cancellation only. It carries no identity/authentication parameter.
- `ConnectionFetchHandler.fetch` is documented for already-authenticated
  requests and does not call `requestRejection`.
- `TypertGateway.wireStream.open` directly opens logical streams and performs
  no caller authentication.
- `__DSH_TRANSPORT__.fetch/openStream/loadBundle` replaces Web Fetch/WebSocket
  and may assert `ownsHost`; Connection does not authenticate those hooks.
- The experimental WebWorker composition calls
  `createSharedFetchHandler('/api').fetch` and `wireStream.open` directly. It
  retries Web-route 401/403 through that direct lane because the page spawned
  and owns the Worker. This is evidence of the seam, not proof for Electron or
  cross-process Desktop trust.

`requestRejection` belongs to Web route adapters, not to the business
Connection/Gateway abstraction. Any local carrier must authenticate before
calling the already-authenticated handlers.

Evidence:

- `packages/client/connection/src/rpc.ts`
- `packages/client/connection/src/rpc-host.ts`
- `packages/client/connection/src/client/rpc.ts`
- `packages/client/connection/src/client/index.ts`
- `packages/api/gateway/src/index.ts`
- `packages/experimental/webworker-runtime/src/worker-host.ts`
- `packages/experimental/webworker-runtime/src/transport/tunnel.ts`
- `packages/experimental/webworker-runtime/src/client/index.ts`

## O. Component Trust Boundary

| Component | Current trust assumption | Authenticates caller | Authorizes operation | Web-specific? | Loopback-specific? | Browser-specific? | Reusable for Desktop? | Replacement needed? |
|---|---|---|---|---|---|---|---|---|
| Connection Web route | request reached selected Web Host and has cookie | `requestRejection` | endpoint/method checks only | YES | Host allow | YES | logical seam only | YES, auth adapter |
| Gateway | caller is already trusted by carrier | nobody | descriptor/scope/business validation, not caller ACL | NO | NO | NO | YES | trusted ingress required |
| Session Controller | authenticated Connection may address session operations | upstream carrier | session/domain invariants | NO | NO | NO | YES | NO inside trusted boundary |
| Workspace | same | upstream carrier | workspace/domain invariants | NO | NO | NO | YES | NO inside trusted boundary |
| Settings Host controller | same; no per-caller locality check | upstream carrier | provider writability/revision/schema | NO | NO server-side | NO | YES | Client trust signal must be reliable |
| Settings Client | `isLoopback` means privileged surface is appropriate | page authority/custom `ownsHost` | suppresses Host calls when false | PARTLY | YES | current derivation | YES conditionally | YES for Desktop classification |
| Credentials | any authenticated Connection can describe/set/unset | upstream carrier | provider source writability; secret write-only | NO | NO | NO | YES | protect carrier/Renderer seam |
| Directory Picker | backend selected once from bind/SSH/display | upstream carrier | capability kind and path validation | PARTLY | bind-specific | presentation pair | YES conditionally | prove Desktop equivalent |
| Commands | authenticated caller may list/execute | upstream carrier | command lookup/handler | NO | NO | NO | YES | NO inside trusted boundary |
| Approval | authenticated event Client may answer pending event | upstream carrier | stable event id/client id; first result wins | NO | NO | NO | YES | carrier trust/reconnect proof |
| User Questions | same live waterfall trust | upstream carrier | item/event correlation; first result wins | NO | NO | NO | YES | carrier trust/reconnect proof |
| Export | authenticated `/api` exact Fetch | Web Connection prefix | query/session existence | YES route | Host fence | browser caller | semantics/bytes conditionally | YES |
| Client Modules | authenticated index chooses graph; bytes public | index BrowserAuth only | active Loader graph/revisions | YES delivery | reachability only | script loader | graph potentially | trusted byte source required |
| Plugin Routes | public generated bundles/HMR | nobody | exact revision/resource lookup | YES | reachability only | current loaders | not as-is | YES |
| Web Runtime | default loopback, URL/token handoff, trusted Host snapshot | composition | bind/config validation | YES | YES default | YES | NO | remove or keep only fallback |

Evidence for controller rows is the corresponding source listed in section Y;
none receives a transport caller principal from Gateway.

## P. Credential Trust Surface

| Question | Frozen fact |
|---|---|
| Default storage | inherited process env (read-only, highest) → `$DSH_HOME/.credentials.yaml` managed file → project/user `.env` fallbacks |
| BrowserAuth secret | grant record in the same managed credentials document |
| Client plaintext read | NO Remote method returns a secret |
| Remote API | `credentials.describe(refs≤64)`, `set(ref,value)`, `unset(ref)` |
| Describe result | `configured`, optional `source`, `writable`; field-by-field projection |
| Secret write | plaintext crosses Client→Host only for `set`; failures omit it |
| Source restrictions | inherited process-env values are visibly read-only; managed file can override lower `.env` fallbacks |
| Loopback dependency | none in Host controller/provider |
| Web protection | common Host/Origin fence plus BrowserAuth cookie |
| Non-Web protection | caller-provided carrier must protect the already-authenticated seam |
| File protection | provider requests `0600` file/`0700` directory and rejects broad POSIX mode; Windows mode check is skipped because ACLs are not represented by POSIX mode |

An authenticated non-loopback caller accepted through `trustedHosts` can
technically call credential mutation Remotes directly. The stock non-loopback
Settings scope suppresses Settings transport, but not Credentials:
`WebSearchCardController` still calls `credentials.describe`; rendered save
availability then depends on the card/scope state. This is not a Host
authorization check. Cookie auth is the only caller-authentication protection
on the served Web Remote; provider precedence and writability are business
write constraints.

On Windows, confidentiality therefore depends on the effective filesystem ACL
and process/user context of the Harness home. The source does not claim an
explicit Windows ACL descriptor for `.credentials.yaml`.

Evidence:

- `packages/api/settings-controller/src/credentials.ts`
- `packages/api/settings-controller/tests/credentials-controller.host.spec.ts`
- `packages/credentials/credentials-local/src/index.ts`
- `packages/bundle/base/cordis.patch.yml`

## Q. Directory Picker Trust Surface

| Topic | Frozen behavior |
|---|---|
| Transport | authenticated Typert Remote: `directoryPicker/pick`, `list`, `createDirectory` |
| Per-request loopback check | NONE in controller |
| Auto selection | sampled once at boot from Web bind, Host platform, SSH env and Linux display/chooser |
| Windows + loopback + no SSH | native `IFileOpenDialog` backend |
| all-interface bind or SSH | browse backend |
| Linux native | requires loopback, no SSH, DISPLAY/WAYLAND and Zenity/KDialog |
| Browse authority | Host filesystem listing and child-directory creation; fully qualified paths; whole-filesystem scope subject to OS permissions |
| Native authority | opens chooser on Host display; request cancellation closes/terminates helper |
| Authentication | common Connection Web auth only |

The native choice means “the deployment is loopback and attended”, not “this
specific caller was proven local”. The browse backend is intentionally usable
by remote clients and exposes Host filesystem navigation under the Host
process's OS permissions. Stock `dsh web` currently prevents all-interface
binding through its CLI, but the backend and custom-composition path exist.

`RequiresP0S = YES`: prove the packaged Windows selection/equivalent,
cancellation, and caller trust when no Web bind exists.

Evidence:

- `packages/host/directory-picker-auto/src/resolve.ts`
- `packages/host/directory-picker-auto/src/index.ts`
- `packages/host/directory-picker-auto/tests/resolve.spec.ts`
- `packages/host/directory-picker-native/src/index.ts`
- `packages/host/directory-picker-browse/src/index.ts`
- `packages/api/workspace-controller/src/directory-picker.ts`

## R. Current Web Security Guarantees

| Guarantee | Current provider | Scope/limit |
|---|---|---|
| Default remote-network non-reachability | WebServer `127.0.0.1` default; CLI rejects `0.0.0.0` | local processes can still connect |
| Launch possession before first index | 256-bit process launch token | reusable for process lifetime; printed URL is bearer material |
| Persistent browser session | HMAC cookie, absolute expiry | bearer session; not OS/process identity |
| Authority binding | cookie name/payload include Host authority | same durable secret accepts an otherwise-valid cookie across process restart |
| DNS-rebinding defense | mandatory Host fence | checks authority, not socket peer |
| Cross-site defense | Sec-Fetch-Site and optional Origin check | absent Origin accepted; comparison is host only |
| API/mux/exact Fetch authentication | `requestRejection` before dispatch/upgrade | no per-operation principal/ACL |
| Remote UI settings restriction | Client loopback capability | UI-side only; direct Remote remains callable |
| Secret non-disclosure | settings redaction and credential write-only API | authenticated caller can still mutate writable values |
| Public bytes treated as non-secret | static/plugin/HMR routes lack auth | source/module graph may be disclosed |
| Executable module provenance | Host active Loader graph + revisioned captured artifacts | byte route itself is public |
| Request resource bound | `/api` buffered-body maximum, stream cancellation | limit is large (300 MiB default); not identity |

### Guarantees required after Web removal

| Guarantee | Why needed | Currently provided by | Desktop replacement? | P0.S proof? |
|---|---|---|---|---|
| Only intended local product/user can reach Host authority | controllers include shell/filesystem/credentials | bind + token/cookie | YES | YES |
| Authenticate before Gateway invoke/open | Gateway has no caller identity | Web requestRejection | YES | YES |
| Bind connection to intended Worker instance | cookie does not prove current process | Web reachability/authority only, incompletely | YES | YES |
| Preserve Renderer credential separation | current cookie is HttpOnly | browser cookie store | YES | YES |
| Enforce one trust level for unary, streams and exact/binary | every path reaches sensitive Host state | `/api` + mux hooks | YES | YES |
| Re-establish trust on reconnect | new WebSocket re-runs upgrade auth | Web handshake | YES | YES |
| Reliable privileged-capability classification | settings changes with `isLoopback` | page hostname/ownsHost | YES | YES |
| Trusted Client module bytes/graph | modules execute in privileged Client | Host graph + packaged bundle | YES | YES |
| Bound malformed/large input and cancellation | local peer can exhaust Worker | bridge/protocol limits | YES | YES |
| Preserve secret redaction/write-only response | avoid Client plaintext reads | Host controllers | KEEP | conformance |

## S. Web Trust Mechanisms to Remove

| Mechanism | Primary no-Web carrier | Reason / fallback |
|---|---|---|
| Launch-token URL and token query bootstrap | REMOVE, guarantee REPLACE | no browser navigation; `FALLBACK_A_RELEVANT` |
| BrowserAuth cookie as product identity | REMOVE, guarantee REPLACE | not OS/Worker identity; `FALLBACK_A_RELEVANT` |
| Host-header DNS-rebinding fence | REMOVE from non-HTTP carrier | replace with endpoint/peer/instance binding; `FALLBACK_A_RELEVANT` |
| Browser Origin / Fetch-Metadata fence | REMOVE from non-browser carrier | replace with trusted ingress isolation; `FALLBACK_A_RELEVANT` |
| Web `trustedHosts` authority config | REMOVE from primary carrier | keep only for approved HTTP fallback/reverse-proxy use |
| Browser default Fetch/WebSocket cookie attachment | REMOVE | custom transport must authenticate explicitly |
| URL cleanup redirect / browser opener | REMOVE | browser bootstrap only |
| Client hostname as settings trust canary | REPLACE | Desktop needs an authoritative capability signal |
| `ownsHost` self-assertion | UNKNOWN as production trust input | useful composition hint, not identity proof |

Fallback A (Worker-private loopback HTTP) must not casually delete the existing
launch token, BrowserAuth, Host, Origin, trusted-host and upgrade checks. Their
exact reuse or constrained replacement remains a P0.S/P1 decision.

## T. Local Carrier Trust Requirements

Requirements only; no protocol, ACL descriptor, naming, nonce, encryption or
framing design is frozen here.

1. Only the intended authorized local user/product path may establish a
   Host-authoritative connection.
2. Authentication must complete before any Gateway unary invocation, stream
   open, event answer, exact/binary handler or module-byte request.
3. The authenticated channel must bind to the intended live Worker instance;
   stale endpoint/process discovery must not silently connect to another
   authority.
4. Renderer code must not receive a reusable Worker authentication secret.
   Compromise of a content page must not automatically become unrestricted
   Worker credential possession.
5. The Main→Worker boundary and any Renderer→Main broker must preserve the
   intended operation boundary; a caller-supplied transport hook or
   `ownsHost=true` is not sufficient proof.
6. Unary, streams, approval/question results, cancellation and binary paths
   require the same peer trust. No direct “already authenticated” lane may be
   reachable by an unverified peer.
7. Reconnect must perform a fresh trust decision before publishing a new
   Connection generation.
8. Privileged Client capability, especially Host settings persistence, must
   derive from trusted composition state rather than an accidental custom
   scheme hostname.
9. Client graph and executable module bytes must come from the intended signed
   or packaged/Worker-authoritative source, with revision/integrity semantics
   sufficient to reject stale or foreign code.
10. Input size, concurrent stream, cancellation and malformed-frame limits
    must remain enforceable even though the carrier is local.
11. Harness settings, credentials and session authority remain Worker/Host
    owned; Desktop does not create a second credential or authorization truth.

## U. Identity vs Compatibility

| Concern | What it proves | What it does not prove |
|---|---|---|
| Authentication / identity | caller and Worker belong to the intended trust relationship/instance | protocol/schema/version compatibility |
| P0.5 compatibility handshake | Desktop, Worker, carrier, Harness baseline and data schema are mutually supported | that the process answering is the authorized Worker |

`WorkerVersion compatible` is not identity proof. “Same authorized Windows
user” is not version compatibility. Both gates are required before Agent write
authority, but they must have distinct evidence and failure meanings.

## V. Current Trust Failure Surface

| Condition | HTTP/runtime result | Client-visible behavior | Connection closed? |
|---|---|---|---|
| Invalid launch token, no valid cookie | index 401, no-store text | reopen printed URL message | request only |
| Stale token with valid cookie | 303 to clean `/` | transparent cleanup | request only |
| Missing cookie on trusted API Host | HTTP 401 `unauthorized` | unary transport failure | request only |
| Invalid/tampered/expired cookie | HTTP 401 | same | request only |
| Missing/malformed/untrusted Host | HTTP 403 before cookie | `forbidden` transport failure | request only |
| Cross-site marker or mismatched/opaque Origin | HTTP 403 | transport failure | request only |
| Malformed `trustedHosts` config | plugin activation throws | Web boot fails/no ready URL | application startup affected |
| Invalid BrowserAuth credential record | Connection activation throws | Web boot fails | application startup affected |
| Non-loopback Settings UI | no wire call; terminal unavailable/memory snapshot | settings controls unavailable/not writable | NO |
| WebSocket untrusted Host/Origin | HTTP upgrade 403 + close | socket fails before opening; reconnecting state | candidate socket |
| WebSocket missing/invalid cookie | HTTP upgrade 401 + close | same | candidate socket |
| Authenticated malformed mux frame | WS close 1008/1003 | carrier error/reconnect | YES |
| Export untrusted Host/Origin | inherited HTTP 403 | export HEAD/download error | request only |
| Export missing/invalid cookie | inherited HTTP 401 | export error string | request only |

Evidence:

- BrowserAuth and request-trust tests.
- Connection node-half tests.
- Gateway stream tests.
- Settings scope/mirror tests.
- Export route and Client controller source.

## W. P0.S Trust Inputs

| Input | Known fact | Unknown | Why spike | Proof required | Failure meaning |
|---|---|---|---|---|---|
| Electron custom scheme classification | file/null Origin fails Web fence; custom transport hooks exist | actual Electron origin, headers, URL builders and capability signal | settings and API boot can silently degrade/fail | packaged custom-scheme negative/positive matrix | primary Desktop boot/trust design invalid |
| Settings persistence | stock Client requires `isLoopback`/`ownsHost` for Host mode | authoritative Desktop signal without spoofable page state | hard trust canary | mutate setting, restart Desktop/Worker, verify `$DSH_HOME/settings.yaml` and no memory mode | custom-scheme trust integration failed |
| No-cookie Connection | direct unary/stream seams work without cookie and assume prior trust | production pre-Gateway authentication | cookie cannot be product identity | positive intended peer and negative unauthorized peer before any Gateway call | primary carrier unsafe |
| Local carrier peer identity | Gateway has no principal | same-user/product/Worker-instance proof | Host capabilities are high impact | prove intended peer accepted, other/stale peer denied | cannot freeze carrier security |
| Renderer isolation | Browser cookie is HttpOnly but page can issue same-origin calls | Electron broker exposure and secret possession | renderer compromise must not own Worker credential | sandboxed renderer cannot open carrier/read reusable secret; allowlisted operations work | Desktop boundary unsafe |
| Main→Worker trust | alternate hooks are caller/composition assertions | mutual responsibilities and startup ordering | direct handler assumes authenticated | unauthorized Main/peer tests and intended Worker binding | direct lane cannot ship |
| Reconnect trust | new Web socket rechecks auth; logical generation has no identity | re-auth across channel/Worker restart | stale trust must not carry | force loss/restart and show trust before new ready generation | reconnect may attach wrong Worker |
| Binary carrier trust | export exact Fetch inherits `/api`; modules are public Web bytes | binary replacement and memory/backpressure policy | binary must not bypass identity | stream/cancel/error/unauthorized binary tests | split trust boundary |
| Dynamic Client module trust | index graph authenticated, combo bytes public and revisioned | packaged/static split and provenance | executable code owns Client authority | boot full in-box graph with foreign/stale bytes rejected | module supply chain unsafe |
| Directory picker trust | Web bind selects native/browse; controller has no per-call locality check | packaged Windows picker and broker policy | chooser/filesystem are privileged | attended native + cancel + denied untrusted caller + browse policy tests | native/filesystem boundary unsafe |
| Fallback A private loopback HTTP | current Web checks are complete and reusable | private bind, lifecycle, token delivery and Electron cookie behavior | fallback must not weaken current posture | negative Host/Origin/cookie/mux/export tests in packaged fallback | fallback not acceptable |

## X. Unknowns

1. Exact Electron custom-scheme Origin/Fetch-Metadata/cookie behavior.
2. Exact local-carrier peer and Worker-instance authentication mechanism.
3. Exact Renderer→Main and Main→Worker authorization split.
4. Whether `ownsHost` remains only a capability declaration or is replaced by
   another trusted Client boot fact.
5. Packaged Client module provenance/revision strategy without public routes.
6. Binary carrier shape and limits.
7. Windows effective ACL inherited by Harness settings/credential documents.
8. Fallback A token/cookie delivery and private-bind composition.

These are P0.S/P1 inputs. No final SID ACL, pipe name, secret/nonce, encryption,
mutual-auth, CSP, preload allowlist or carrier framing is frozen by P0-4.

## Y. Evidence Paths

Primary trust and Connection:

- `packages/client/connection/src/browser-auth.ts`
- `packages/client/connection/src/api-request-trust.ts`
- `packages/client/connection/src/loopback-hostname.ts`
- `packages/client/connection/src/index.ts`
- `packages/client/connection/src/rpc.ts`
- `packages/client/connection/src/rpc-host.ts`
- `packages/client/connection/src/client/index.ts`
- `packages/client/connection/src/client/rpc.ts`
- `packages/client/connection/tests/browser-auth.host.spec.ts`
- `packages/client/connection/tests/api-request-trust.host.spec.ts`
- `packages/client/connection/tests/loopback-hostname.client.spec.ts`
- `packages/client/connection/tests/node-half.host.spec.ts`

Web runtime and assets:

- `packages/bundle/web-app/cordis.patch.yml`
- `packages/bundle/web-app/src/startup.ts`
- `packages/bundle/web-app/src/index.ts`
- `packages/bundle/web-app/tests/trusted-hosts.spec.ts`
- `packages/host/webserver/src/index.ts`
- `packages/host/frontend-static/src/index.ts`
- `packages/host/frontend-static/tests/frontend-static.spec.ts`
- `packages/client/modules/src/index.ts`
- `packages/client/hmr/src/index.ts`

Gateway, Fetch and alternate carrier:

- `packages/api/gateway/src/index.ts`
- `packages/api/gateway/src/stream-server.ts`
- `packages/api/gateway/src/client/stream-client.ts`
- `packages/api/gateway/tests/gateway-stream.host.spec.ts`
- `packages/session-query/session-log-export/src/index.ts`
- `packages/session-query/session-log-export/tests/route.host.spec.ts`
- `packages/experimental/webworker-runtime/src/worker-host.ts`
- `packages/experimental/webworker-runtime/src/transport/tunnel.ts`
- `packages/experimental/webworker-runtime/src/client/index.ts`
- `packages/experimental/webworker-runtime/tests/transport/tunnel-server.spec.ts`

Settings, credentials and picker:

- `packages/client/ui-settings/src/client/index.ts`
- `packages/client/ui-settings/src/client/settings-mirror.ts`
- `packages/client/ui-settings/src/client/settings-scope.ts`
- `packages/client/ui-settings/tests/settings-mirror.client.spec.ts`
- `packages/client/ui-settings/tests/settings-scope.client.spec.ts`
- `packages/client/ui-settings-plugins/src/client/web-search-card-controller.ts`
- `packages/client/ui-settings-plugins/tests/stores.client.spec.ts`
- `packages/api/settings-controller/src/index.ts`
- `packages/api/settings-controller/src/credentials.ts`
- `packages/api/settings-controller/tests/settings-controller.host.spec.ts`
- `packages/api/settings-controller/tests/credentials-controller.host.spec.ts`
- `packages/settings/settings-file/src/index.ts`
- `packages/credentials/credentials-local/src/index.ts`
- `packages/host/directory-picker-auto/src/resolve.ts`
- `packages/host/directory-picker-auto/src/index.ts`
- `packages/host/directory-picker-auto/tests/resolve.spec.ts`
- `packages/host/directory-picker-native/src/index.ts`
- `packages/host/directory-picker-browse/src/index.ts`
- `packages/api/workspace-controller/src/directory-picker.ts`

Targeted commands:

```text
corepack pnpm exec vitest run
  packages/client/connection/tests/browser-auth.host.spec.ts
  packages/client/connection/tests/api-request-trust.host.spec.ts
  packages/client/connection/tests/loopback-hostname.client.spec.ts
  packages/client/connection/tests/node-half.host.spec.ts
  packages/api/gateway/tests/gateway-stream.host.spec.ts
  packages/client/ui-settings/tests/settings-scope.client.spec.ts
  packages/client/ui-settings/tests/settings-mirror.client.spec.ts
  packages/api/settings-controller/tests/settings-controller.host.spec.ts
  packages/api/settings-controller/tests/credentials-controller.host.spec.ts
  packages/host/directory-picker-auto/tests/resolve.spec.ts
  packages/host/frontend-static/tests/frontend-static.spec.ts
  packages/session-query/session-log-export/tests/route.host.spec.ts
  packages/experimental/webworker-runtime/tests/transport/tunnel-server.spec.ts
Result: Test Files 13 passed; Tests 149 passed

corepack pnpm exec vitest run
  packages/client/ui-settings-plugins/tests/stores.client.spec.ts
Result: Test Files 1 passed; Tests 56 passed

Aggregate: Test Files 14 passed; Tests 205 passed
```

## Z. Gate Results

| Gate | Result |
|---|---|
| FROZEN_BASELINE_REVERIFIED | YES |
| UPSTREAM_WORKTREE_CLEAN_BEFORE | YES |
| UPSTREAM_WORKTREE_CLEAN_AFTER | YES |
| LAUNCH_TOKEN_FLOW_ENUMERATED | YES |
| BROWSER_AUTH_COOKIE_CONTRACT_KNOWN | YES |
| HOST_ORIGIN_TRUST_MAP_KNOWN | YES |
| LOOPBACK_CLASSIFIER_LOCATED | YES |
| LOOPBACK_DEPENDENCY_MAP_KNOWN | YES |
| SETTINGS_TRUST_BEHAVIOR_KNOWN | YES |
| SETTINGS_PERSISTENCE_DEPENDS_ON_LOOPBACK_IDENTIFIED | YES |
| API_AUTH_PIPELINE_ENUMERATED | YES |
| MUX_TRUST_CONTRACT_ENUMERATED | YES |
| EXACT_FETCH_TRUST_ENUMERATED | YES |
| PUBLIC_ASSET_TRUST_MODEL_KNOWN | YES |
| NON_WEB_CONNECTION_TRUST_SEAM_IDENTIFIED | YES |
| COMPONENT_TRUST_BOUNDARIES_ENUMERATED | YES |
| CREDENTIAL_TRUST_SURFACE_IDENTIFIED | YES |
| DIRECTORY_PICKER_TRUST_SURFACE_IDENTIFIED | YES |
| CURRENT_WEB_SECURITY_GUARANTEES_ENUMERATED | YES |
| WEB_TRUST_MECHANISMS_TO_REMOVE_ENUMERATED | YES |
| LOCAL_CARRIER_TRUST_REQUIREMENTS_WRITTEN | YES |
| IDENTITY_VS_COMPATIBILITY_BOUNDARY_WRITTEN | YES |
| CURRENT_TRUST_FAILURE_SURFACE_ENUMERATED | YES |
| P0S_TRUST_INPUTS_WRITTEN | YES |
| P0_4_EVIDENCE_WRITTEN | YES |
| CURRENT_STATE_UPDATED | YES |
| DEVELOPMENT_LOG_UPDATED | YES |
| P0_4_STATUS_UPDATED | YES |

`P0_TRUST_SURFACE_KNOWN = YES`
`P0_LOOPBACK_CLASSIFIER_LOCATED = YES`
`SHACO_FORGE_V1_0_P0_4 = PASS`
`SHACO_FORGE_V1_0_P0 = NOT_PASS`
