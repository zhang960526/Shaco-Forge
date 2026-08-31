# P0.S-2 Electron Client Boot Spike

> **NOT_PRODUCTION**：该目录仅用于 P0.S-2 可行性实验，不是 Shaco Forge 产品代码，也不得直接进入 P0.S-3。

Status: PASS / CLOSED（2026-08-31）

- `SHACO_FORGE_V1_0_P0S_2 = PASS`
- `P0S2_STATE = CLOSED`
- `P0S2_TECHNICAL_DISPOSITION = ACCEPT_PROVEN_WITH_CONSTRAINT`
- `ARCHITECTURE_OWNER_P0S2_CONSTRAINTS_ACCEPTED = YES`
- `CLIENT_BOOT_CORE_PATCH_REQUIRED = NO`
- P0.S 仍为 `IN_PROGRESS`；P0.S-3 仍为 `NOT_STARTED`。

本实验验证以下最小闭环：

1. Electron 通过受控 `shaco-forge://client/` 协议加载冻结 Harness Client；
2. Harness `AppWebEntry`、真实 Client bundle graph 与内置 keyless fixture 完成启动；
3. 会话列表可进入实际聊天界面；
4. `ctx.remote.settings` 经白名单 capability adapter 到达真实 Harness `FileSettingsProvider`；
5. 两个互相独立的 Electron 进程对同一个 `settings.yaml` 写后读；
6. Renderer 保持 `nodeIntegration=false`、`contextIsolation=true`、`sandbox=true`，且没有直接 Worker transport 或凭据能力；
7. 全程不启动 stock `dsh-web-app` HTTP 服务，也不创建 TCP listener。

## 运行

本次冻结实跑环境为 Windows x64 桌面会话、PowerShell 7.6.4、Node.js 24.18.0、npm 11.16.0。运行机还必须具备 Git，并能只读访问冻结在 `D:\Project\Shaco-Forge-Upstream\deepseek-harness` 的 Harness 工作树；这些绝对路径是本次 Spike 的冻结输入，不是产品运行时契约。实验不要求全局安装 Electron，`package.json` 仅批准固定版本 `electron@35.7.5` 的安装脚本。

在本目录执行：

```powershell
.\run-spike.ps1
```

脚本会核验冻结基线、安装固定版本 Electron、从只读 Harness 工作树组装临时 Client 产物，并先后运行 write/read 两个 Electron 进程。机读结果写入 `evidence/`，运行时 Client 与持久化文件分别写入被忽略的 `client-dist/`、`runtime-data/`。构建适配器会精确识别 vendored plugin loader 中违反严格 CSP 的动态函数构造，并将该路径替换为 fail-closed 拒绝；它不修改 Harness，也不放宽 `script-src`。

默认冻结输入：

- Shaco Forge：`292213a6b44b89c1513beab4c3b86d580d843830`
- DeepSeek Harness：`cd5ef8148158c3a752a658978873241fdf8e2bbc`
- Harness package version：`0.1.2-alpha.1`
- Electron：`35.7.5`

## Review 与 Closure

AUDIT-006 独立确认了 Executor 结论、H-03、H-04、H-15 boot wiring、
双进程 Settings canary 和 Electron 安全边界，且没有 Blocking Finding。
Architecture Owner 仅为 P0.S-2 接受 strict-CSP loader 与 Settings
capability adapter 约束；preload bridge、冻结 `?fixture` 和 `ownsHost`
hook 均分类为 `NON_CORE_ADAPTER`。F-05 路由 P4，F-09 路由 P1/P7，正式
Carrier/trust wiring 仍路由 P0.S-3/P1。

Review：`docs/05-reviews/architecture/AUDIT-006-P0S2-INDEPENDENT-REVIEW.md`

Evidence：`docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md`

正式关闭不改变本目录的 `NOT_PRODUCTION` 属性，也没有在本轮启动
P0.S-3。
