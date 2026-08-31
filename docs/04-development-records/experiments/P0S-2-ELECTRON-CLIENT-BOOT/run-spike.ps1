$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$spikeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$shacoRoot = (Resolve-Path (Join-Path $spikeRoot '..\..\..\..')).Path
$harnessRoot = 'D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$expectedShaco = '292213a6b44b89c1513beab4c3b86d580d843830'
$expectedHarness = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
$node = 'D:\Development\nodejs\node.exe'
$npm = 'D:\Development\nodejs\npm.cmd'

if ((git -C $shacoRoot rev-parse HEAD).Trim() -ne $expectedShaco) {
  throw 'Shaco Forge HEAD 与 P0.S-2 冻结基线不一致。'
}
foreach ($row in @(git -C $shacoRoot status --porcelain)) {
  if ([string]::IsNullOrWhiteSpace($row)) { continue }
  $path = $row.Substring(3).Trim().Replace('\', '/')
  if ($path.Contains(' -> ')) { $path = $path.Split(' -> ')[-1] }
  $allowed = $path.StartsWith('docs/04-development-records/experiments/P0S-2-ELECTRON-CLIENT-BOOT/') `
    -or $path -eq 'docs/06-testing-acceptance/evidence/P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md' `
    -or $path -eq 'docs/00-governance/SHACO-FORGE-CURRENT-STATE.md' `
    -or $path -eq 'docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md' `
    -or $path -eq 'docs/03-v1.0-plan/P0S-FEASIBILITY-SPIKE.md' `
    -or $path -eq 'docs/04-development-records/DEVELOPMENT-LOG.md'
  if (-not $allowed) {
    throw "Shaco Forge 存在 P0.S-2 允许范围外的修改：$path"
  }
}
if ((git -c "safe.directory=$harnessRoot" -C $harnessRoot rev-parse HEAD).Trim() -ne $expectedHarness) {
  throw 'Harness HEAD 与 P0.S-2 冻结基线不一致。'
}
if (@(git -c "safe.directory=$harnessRoot" -C $harnessRoot status --porcelain).Count -ne 0) {
  throw 'Harness 工作树不干净，拒绝运行。'
}

Push-Location $spikeRoot
try {
  $env:Path = "D:\Development\nodejs;D:\Development\Git\cmd;C:\Windows\System32;C:\Windows;$env:Path"
  if (-not (Test-Path -LiteralPath (Join-Path $spikeRoot 'node_modules\electron\dist\electron.exe'))) {
    & $npm install --ignore-scripts=false --no-audit --no-fund --cache .npm-cache
    if ($LASTEXITCODE -ne 0) { throw "npm install 失败：$LASTEXITCODE" }
  }
  & $node .\prepare-client.mjs
  if ($LASTEXITCODE -ne 0) { throw "Client 组装失败：$LASTEXITCODE" }

  $canary = "p0s2-$([guid]::NewGuid().ToString('N'))"
  $electron = Join-Path $spikeRoot 'node_modules\electron\dist\electron.exe'
  $writeProcess = Start-Process -FilePath $electron `
    -ArgumentList @('.\electron-main.mjs', '--run-mode=write', "--canary=$canary") `
    -WorkingDirectory $spikeRoot -WindowStyle Hidden -Wait -PassThru
  if ($writeProcess.ExitCode -ne 0) { throw "Electron write 进程失败：$($writeProcess.ExitCode)" }
  $readProcess = Start-Process -FilePath $electron `
    -ArgumentList @('.\electron-main.mjs', '--run-mode=read', "--canary=$canary") `
    -WorkingDirectory $spikeRoot -WindowStyle Hidden -Wait -PassThru
  if ($readProcess.ExitCode -ne 0) { throw "Electron read 进程失败：$($readProcess.ExitCode)" }
  & $node .\verify-evidence.mjs
  if ($LASTEXITCODE -ne 0) { throw "证据复核失败：$LASTEXITCODE" }
} finally {
  Pop-Location
}
