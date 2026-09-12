# Failed Attempts

失败尝试均保留在 `command-matrix.json`、`logs/` 或本记录；没有用旧源码 PASS 代替最终重跑。

1. 一次 Windows 路径 escaping 导致的 patch context miss；未修改文件。
2. ambient Node v24 typecheck 不符合冻结工具链；改用固定 Node v22.19.0。
3. 未提供 `SHACO_FORGE_HARNESS_ROOT` 的直接 build 失败；统一运行器固定只读 Harness 路径。
4. 首次沙箱内 `smoke:electron` 的 GPU 子进程以 `0xC0000135` 退出；同源码沙箱外重跑 PASS。
5. 首版 Evidence runner 未预建 Step1/Step2 evidence dirs，Slice2 Step3 PNG 写入 `ENOENT`；修正 runner 并作废该源码清单。
6. 当前严格 manifest validator 拒绝冻结 pre-amendment Step1 包；增加仅接受 exact `STEP1_ARTIFACT` 的 compatibility reader。
7. compatibility reader 初版 type union/替换错误导致 typecheck 失败；修正类型与调用点。
8. Step1 fixture entrance 仍调用严格 current verifier；改为 exact frozen reader。
9. restored-source 最终断言仍调用严格 current verifier；改为 exact frozen reader。
10. 已有 native publish 声称 self-contained 但缺少 `hostpolicy.dll`；加入 `PublishSelfContained=true` 显式属性和产物断言。
11. 冻结 Step1 Evidence 所指 temp package root 被外部清理，仅残留部分文件；新增 path/size/SHA-256 精确重建隔离夹具，冻结 Evidence 未改。
12. 一轮最终 `smoke:slice3-step2` 在上述 temp bytes 缺失时失败；修正夹具后最终同源 attempt 2 PASS。
13. 首轮最终矩阵的固定 pnpm 11.7.0 临时路径被外部清理，`typecheck` 在测试前报 `MODULE_NOT_FOUND`；切换到同版本稳定 cache 路径，重新冻结源码并从第 1 项重跑 23 项全部 PASS。

被取代的 source inventory 均以 `failed-attempt-source-inventory-<sha256>.json` 保留。
