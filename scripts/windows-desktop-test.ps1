param(
    [ValidateSet('packaged-startup-probe', 'smoke:packaged-runtime')]
    [string]$Command = 'packaged-startup-probe',
    [switch]$Child,
    [string]$Receipt
)
$ErrorActionPreference = 'Stop'
# Test driver only: Explorer supplies the current user's ordinary desktop context.
# No token/job/ACL alteration and no change to the packaged Product's home policy.
# https://devblogs.microsoft.com/oldnewthing/20131118-00/?p=2643
$testRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$testEvidence = Join-Path $testRoot 'docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01'
$testPowerShell = 'C:\Users\18902\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe'
if ($Child) {
    if ([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Receipt)) -ne $testEvidence) { throw 'Receipt outside evidence root' }
    Set-Location -LiteralPath $testRoot
    $env:SHACO_FORGE_PNPM_ENTRY = 'C:/Users/18902/AppData/Local/Temp/shaco-forge-v1-slice-1a-toolchain/corepack/v1/pnpm/11.7.0/bin/pnpm.cjs'
    $env:SHACO_FORGE_GIT = 'D:/Development/Git/cmd/git.exe'
    $env:SHACO_FORGE_POWERSHELL = $testPowerShell
    $env:SHACO_FORGE_STEP1_FINAL = '1'
    $env:SHACO_FORGE_DESKTOP_TEST_ENVIRONMENT = 'CURRENT_USER_EXPLORER_DESKTOP'
    $testExitCode = 1
    try {
        & 'C:/Users/18902/AppData/Local/Temp/shaco-forge-v1-slice-1a-toolchain/node-v22.19.0-win-x64/node.exe' scripts/slice3-step1-command.mjs $Command
        $testExitCode = $LASTEXITCODE
    } finally {
        $receiptValue = @{ command = $Command; exitCode = $testExitCode; environment = 'CURRENT_USER_EXPLORER_DESKTOP'; driverPid = $PID } | ConvertTo-Json
        [IO.File]::WriteAllText($Receipt, $receiptValue + "`n", [Text.UTF8Encoding]::new($false))
    }
    exit $testExitCode
}
$Receipt = Join-Path $testEvidence ('desktop-launch-' + [guid]::NewGuid().ToString('N') + '.json')
$desktopHwnd = 0
$desktopWindow = (New-Object -ComObject Shell.Application).Windows().FindWindowSW(0, 0, 8, [ref]$desktopHwnd, 1)
if ($null -eq $desktopWindow -or $desktopWindow.FullName -notlike '*\explorer.exe') { throw 'Current-user Explorer desktop unavailable' }
$arguments = '-NoProfile -File "' + $PSCommandPath + '" -Command "' + $Command + '" -Child -Receipt "' + $Receipt + '"'
$desktopWindow.Document.Application.ShellExecute($testPowerShell, $arguments, $testRoot, 'open', 0)
$deadline = [DateTime]::UtcNow.AddMinutes(20)
while (!(Test-Path -LiteralPath $Receipt)) {
    if ([DateTime]::UtcNow -ge $deadline) { throw 'Desktop test receipt timeout; inspect recorded test processes' }
    Start-Sleep -Seconds 1
}
$result = [IO.File]::ReadAllText($Receipt, [Text.Encoding]::UTF8) | ConvertFrom-Json
$result | ConvertTo-Json
exit $result.exitCode
