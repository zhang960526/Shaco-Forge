param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$')]
  [string]$AttemptId
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$startedAt = [DateTimeOffset]::UtcNow
$spikeRoot = (Split-Path -Parent $MyInvocation.MyCommand.Path)
$shacoRoot = (Resolve-Path (Join-Path $spikeRoot '..\..\..\..')).Path
$harnessRoot = 'D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$expectedBranch = 'master'
$productBaselineHead = 'cada37727af3f99da77f50353924af80f917b688'
$contractFreezeHead = '45a3ccfc46d3fdc9a156b28c8b1f59af7e257af3'
$executionAuthorityHead = '6fd8bbd3e39ff17c5bc76bc447898dd5b7b72e7c'
$expectedHarnessHead = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
$expectedHarnessVersion = '0.1.2-alpha.1'
$expectedHarnessLockSha256 = '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1'
$node = 'D:\Development\nodejs\node.exe'
$npm = 'D:\Development\nodejs\npm.cmd'
$evidenceRoot = Join-Path $spikeRoot 'evidence'
$evidenceDir = Join-Path $evidenceRoot $AttemptId
$runtimeAttemptDir = Join-Path (Join-Path $spikeRoot 'runtime-data') $AttemptId
$cacheDir = Join-Path $spikeRoot '.npm-cache'
$electronCacheRoot = 'C:\Users\18902\AppData\Local\electron\Cache'
$p0s2Cache = Join-Path $shacoRoot 'docs\04-development-records\experiments\P0S-2-ELECTRON-CLIENT-BOOT\.npm-cache'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$sourceFiles = @(
  'README.md',
  'package.json',
  'package-lock.json',
  'contract-roster.json',
  'run-spike.ps1',
  'prepare-static-client.mjs',
  'electron-main.mjs',
  'preload.cjs',
  'verify-evidence.mjs',
  'src/shell-bootstrap.js',
  'src/renderer-probe.js'
)
$generatedRoots = @('node_modules', '.npm-cache', 'client-dist', 'runtime-data', 'evidence')
$internalCommands = @(
  'npm ci --offline --ignore-scripts=false --no-audit --no-fund --cache .npm-cache',
  'node .\prepare-static-client.mjs',
  'electron .\electron-main.mjs --attempt-id=<AttemptId>',
  'node .\verify-evidence.mjs <AttemptId>'
)
$exactTopLevelCommand = "pwsh -NoProfile -File .\run-spike.ps1 -AttemptId $AttemptId"
$electronInvocationCount = 0
$timeoutTriggered = $false
$electronExitCode = $null
$verifierExitCode = $null
$phase = 'RUNNER_PREFLIGHT'
$runnerExitCode = 1
$verification = $null
$preflight = $null
$worktreeAfter = $null
$harnessAfter = $null
$errorRecord = $null

function Write-Utf8Json([string]$Path, $Value) {
  $json = $Value | ConvertTo-Json -Depth 30
  [System.IO.File]::WriteAllText($Path, "$json`n", $utf8NoBom)
}

function Get-Sha256([string]$Path) {
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Invoke-Git([string]$Repository, [string[]]$Arguments, [switch]$SafeDirectory) {
  $gitArguments = @()
  if ($SafeDirectory) { $gitArguments += @('-c', "safe.directory=$($Repository.Replace('\', '/'))") }
  $gitArguments += @('-C', $Repository)
  $gitArguments += $Arguments
  $output = @(& git @gitArguments 2>&1)
  if ($LASTEXITCODE -ne 0) { throw "git $($Arguments -join ' ') failed: $($output -join [Environment]::NewLine)" }
  return ($output -join "`n").Trim()
}

function Get-WorktreeSnapshot([string]$Repository, [switch]$SafeDirectory) {
  $head = Invoke-Git $Repository @('rev-parse', 'HEAD') -SafeDirectory:$SafeDirectory
  $branch = Invoke-Git $Repository @('branch', '--show-current') -SafeDirectory:$SafeDirectory
  $statusText = Invoke-Git $Repository @('status', '--short', '--untracked-files=normal') -SafeDirectory:$SafeDirectory
  $status = [string[]]@(
    if (-not [string]::IsNullOrWhiteSpace($statusText)) {
      $statusText -split "`n"
    }
  )
  return [pscustomobject][ordered]@{
    head = $head
    branch = $branch
    status = [string[]]@($status)
  }
}

function Assert-ShacoScope($Snapshot) {
  if ($null -eq $Snapshot -or $Snapshot.PSObject.Properties.Name -notcontains 'status') {
    throw 'Shaco Forge 工作树快照缺少 status 集合。'
  }
  $status = @($Snapshot.status)
  foreach ($row in $status) {
    if ($row.Length -lt 4) { throw "无法解析 Git 状态行：$row" }
    $path = $row.Substring(3).Trim().Replace('\', '/')
    if ($path.Contains(' -> ')) { $path = $path.Split(' -> ')[-1] }
    if (-not $path.StartsWith('docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/')) {
      throw "Shaco Forge 存在允许目录外的修改：$path"
    }
  }
}

function Assert-SourceSet {
  foreach ($relativePath in $sourceFiles) {
    $path = Join-Path $spikeRoot $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "缺少契约源文件：$relativePath" }
  }
  $actual = @(Get-ChildItem -LiteralPath $spikeRoot -Force -Recurse -File | ForEach-Object {
    $relative = [System.IO.Path]::GetRelativePath($spikeRoot, $_.FullName).Replace('\', '/')
    $top = $relative.Split('/')[0]
    if ($generatedRoots -notcontains $top) { $relative }
  } | Where-Object { $null -ne $_ } | Sort-Object)
  $expected = @($sourceFiles | ForEach-Object { $_.Replace('\', '/') } | Sort-Object)
  if (($actual -join "`n") -ne ($expected -join "`n")) {
    throw "实验源文件集合不精确。Expected=$($expected -join ','); Actual=$($actual -join ',')"
  }
}

function Get-SourceHashes {
  return @($sourceFiles | ForEach-Object {
    $normalized = $_.Replace('\', '/')
    [ordered]@{ path = $normalized; sha256 = Get-Sha256 (Join-Path $spikeRoot $_) }
  })
}

if (Test-Path -LiteralPath $evidenceDir) {
  throw "AttemptId 已存在，拒绝复用：$AttemptId"
}

New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null
try {
  Assert-SourceSet
  $shacoBefore = Get-WorktreeSnapshot $shacoRoot
  Assert-ShacoScope $shacoBefore
  $harnessBefore = Get-WorktreeSnapshot $harnessRoot -SafeDirectory
  $attemptStartHead = $shacoBefore.head
  if ($shacoBefore.branch -ne $expectedBranch) { throw "主仓库分支不匹配：$($shacoBefore.branch)" }
  if ($attemptStartHead -ne $executionAuthorityHead) { throw "AttemptStartHead != ExecutionAuthorityHead" }
  if ($harnessBefore.head -ne $expectedHarnessHead) { throw "Frozen Harness HEAD 不匹配：$($harnessBefore.head)" }
  if (@($harnessBefore.status).Count -ne 0) { throw 'Frozen Harness 工作树不干净。' }
  $harnessPackage = Get-Content -LiteralPath (Join-Path $harnessRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $harnessLockSha256 = Get-Sha256 (Join-Path $harnessRoot 'pnpm-lock.yaml')
  if ($harnessPackage.version -ne $expectedHarnessVersion) { throw "Frozen Harness version 不匹配：$($harnessPackage.version)" }
  if ($harnessLockSha256 -ne $expectedHarnessLockSha256) { throw "Frozen Harness lock SHA256 不匹配：$harnessLockSha256" }

  $nodeVersion = (& $node --version).Trim()
  if ($LASTEXITCODE -ne 0 -or $nodeVersion -ne 'v24.18.0') { throw "Node 准备条件不匹配：$nodeVersion" }
  $npmVersion = (& $npm --version).Trim()
  if ($LASTEXITCODE -ne 0 -or $npmVersion -ne '11.16.0') { throw "npm 准备条件不匹配：$npmVersion" }
  $pwshVersion = "$($PSVersionTable.PSVersion)"
  if ($pwshVersion -ne '7.6.4') { throw "PowerShell 准备条件不匹配：$pwshVersion" }

  $lock = Get-Content -LiteralPath (Join-Path $spikeRoot 'package-lock.json') -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable -Depth 100
  $electronLock = $lock['packages']['node_modules/electron']
  if ($electronLock['version'] -ne '35.7.5' `
    -or $electronLock['integrity'] -ne 'sha512-dnL+JvLraKZl7iusXTVTGYs10TKfzUi30uEDTqsmTm0guN9V2tbOjTzyIZbh9n3ygUjgEYyo+igAwMRXIi3IPw==') {
    throw 'package-lock.json 未冻结到 electron@35.7.5 精确身份。'
  }
  $electronArchives = @(Get-ChildItem -LiteralPath $electronCacheRoot -Filter 'electron-v35.7.5-win32-x64.zip' -File -Recurse)
  if ($electronArchives.Count -lt 1) { throw '本地 Electron 35.7.5 archive cache 不可用。' }

  $preflight = [ordered]@{
    schemaVersion = 1
    contractId = 'P0S6-MEC-20260903-01'
    attemptId = $AttemptId
    productBaselineHead = $productBaselineHead
    contractFreezeHead = $contractFreezeHead
    executionAuthorityHead = $executionAuthorityHead
    attemptStartHead = $attemptStartHead
    branch = $shacoBefore.branch
    harnessHead = $harnessBefore.head
    harnessVersion = $harnessPackage.version
    harnessLockSha256 = $harnessLockSha256
    worktreeBefore = $shacoBefore
    harnessWorktreeBefore = $harnessBefore
    exactTopLevelCommand = $exactTopLevelCommand
    internalCommands = $internalCommands
    sourceFiles = Get-SourceHashes
    preparationMachine = [ordered]@{
      powershell = $pwshVersion
      node = $nodeVersion
      npm = $npmVersion
      electronPackage = $electronLock['version']
      electronPackageIntegrity = $electronLock['integrity']
      localElectronArchiveCount = $electronArchives.Count
      localElectronArchiveSha256 = Get-Sha256 $electronArchives[0].FullName
    }
    authorizedRuntime = [ordered]@{
      electronClientBootCount = 1
      hiddenWindow = $true
      hardTimeoutSeconds = 45
      worker = $false
      harnessHost = $false
      namedPipe = $false
      authentication = $false
      provider = $false
      stockWebServer = $false
    }
  }
  Write-Utf8Json (Join-Path $evidenceDir 'preflight.json') $preflight

  $phase = 'DEPENDENCY_SETUP'
  if (-not (Test-Path -LiteralPath $cacheDir)) {
    if (-not (Test-Path -LiteralPath $p0s2Cache -PathType Container)) { throw 'P0.S-2 accepted local npm cache seed is unavailable.' }
    Copy-Item -LiteralPath $p0s2Cache -Destination $cacheDir -Recurse -Force
  }
  New-Item -ItemType Directory -Path $runtimeAttemptDir -Force | Out-Null
  $env:Path = "D:\Development\nodejs;D:\Development\Git\cmd;C:\Windows\System32;C:\Windows;$env:Path"
  $env:npm_config_cache = $cacheDir
  $env:ELECTRON_CACHE = $electronCacheRoot
  $env:TEMP = $runtimeAttemptDir
  $env:TMP = $runtimeAttemptDir
  Push-Location $spikeRoot
  try {
    $npmOutput = @(& $npm ci --offline --ignore-scripts=false --no-audit --no-fund --cache $cacheDir 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "npm ci 失败：$($npmOutput | Select-Object -Last 8 | Out-String)" }
  } finally {
    Pop-Location
  }
  $electron = Join-Path $spikeRoot 'node_modules\electron\dist\electron.exe'
  if (-not (Test-Path -LiteralPath $electron -PathType Leaf)) { throw 'Spike-local Electron executable 不存在。' }
  $installedElectron = Get-Content -LiteralPath (Join-Path $spikeRoot 'node_modules\electron\package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($installedElectron.version -ne '35.7.5') { throw "Spike-local Electron version 不匹配：$($installedElectron.version)" }

  $phase = 'STATIC_PREPARATION'
  $env:P0S6_HARNESS_ROOT = $harnessRoot
  Push-Location $spikeRoot
  try {
    $prepareOutput = @(& $node .\prepare-static-client.mjs 2>&1)
    if ($LASTEXITCODE -ne 0) { throw "静态 Client 组装失败：$($prepareOutput | Select-Object -Last 8 | Out-String)" }
  } finally {
    Pop-Location
  }

  $phase = 'FINAL_STATIC_REVIEW'
  $buildManifest = Get-Content -LiteralPath (Join-Path $spikeRoot 'client-dist\build-manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($buildManifest.productGraph.requiredCount -ne 23 `
    -or $buildManifest.productGraph.supportClosureCount -ne 4 `
    -or $buildManifest.productGraph.totalCount -ne 27 `
    -or $buildManifest.artifactAssembly.staticArtifactSemanticTransformation -ne $false `
    -or $buildManifest.omissions.Count -ne 4) {
    throw '最终静态复核未满足 23 + 4 graph、四项 omission 或零语义转换边界。'
  }
  $harnessStaticCheck = Get-WorktreeSnapshot $harnessRoot -SafeDirectory
  if ($harnessStaticCheck.head -ne $expectedHarnessHead -or @($harnessStaticCheck.status).Count -ne 0) {
    throw '最终静态复核发现 Frozen Harness 漂移。'
  }
  $shacoStaticCheck = Get-WorktreeSnapshot $shacoRoot
  Assert-ShacoScope $shacoStaticCheck
  if ($shacoStaticCheck.head -ne $executionAuthorityHead) { throw '最终静态复核发现主仓库 HEAD 漂移。' }

  $phase = 'ELECTRON_CLIENT_BOOT'
  $electronInvocationCount = 1
  $electronProcess = Start-Process -FilePath $electron `
    -ArgumentList @('.\electron-main.mjs', "--attempt-id=$AttemptId") `
    -WorkingDirectory $spikeRoot -WindowStyle Hidden -PassThru
  $exited = $electronProcess.WaitForExit(45000)
  if (-not $exited) {
    $timeoutTriggered = $true
    & taskkill.exe /PID $electronProcess.Id /T /F 2>&1 | Out-Null
    $electronProcess.WaitForExit()
    $electronExitCode = 124
  } else {
    $electronExitCode = $electronProcess.ExitCode
  }

  $phase = 'EVIDENCE_VERIFICATION'
  Push-Location $spikeRoot
  try {
    $verifyOutput = @(& $node .\verify-evidence.mjs $AttemptId 2>&1)
    $verifierExitCode = $LASTEXITCODE
  } finally {
    Pop-Location
  }
  if (-not (Test-Path -LiteralPath (Join-Path $evidenceDir 'verification.json') -PathType Leaf)) {
    throw "verifier 未生成 verification.json：$($verifyOutput | Select-Object -Last 8 | Out-String)"
  }
  $verification = Get-Content -LiteralPath (Join-Path $evidenceDir 'verification.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $runnerExitCode = if ($verification.result -in @('PASS', 'PROVEN_WITH_CONSTRAINT')) { 0 } else { 1 }
} catch {
  $errorRecord = [ordered]@{
    phase = $phase
    type = $_.Exception.GetType().FullName
    message = $_.Exception.Message
  }
  $runnerExitCode = 1
} finally {
  try {
    $worktreeAfter = Get-WorktreeSnapshot $shacoRoot
    Assert-ShacoScope $worktreeAfter
  } catch {
    if ($null -eq $errorRecord) {
      $errorRecord = [ordered]@{ phase = 'FINAL_WORKTREE_CHECK'; type = $_.Exception.GetType().FullName; message = $_.Exception.Message }
    }
    $runnerExitCode = 1
  }
  try {
    $harnessAfter = Get-WorktreeSnapshot $harnessRoot -SafeDirectory
    if ($harnessAfter.head -ne $expectedHarnessHead -or @($harnessAfter.status).Count -ne 0) { throw 'Frozen Harness final identity/cleanliness failed.' }
  } catch {
    if ($null -eq $errorRecord) {
      $errorRecord = [ordered]@{ phase = 'FINAL_HARNESS_CHECK'; type = $_.Exception.GetType().FullName; message = $_.Exception.Message }
    }
    $runnerExitCode = 1
  }

  $endAt = [DateTimeOffset]::UtcNow
  $aggregate = if ($null -ne $verification) { $verification.result } else { 'INCONCLUSIVE' }
  $h05 = if ($null -ne $verification) { $verification.h05 } else { 'INCONCLUSIVE' }
  $h20 = if ($null -ne $verification) { $verification.h20 } else { 'INCONCLUSIVE' }
  $firstFailure = if ($null -ne $verification) { $verification.firstFailureBoundary } else { $phase }
  $retryCandidate = if ($null -ne $verification) { $verification.retryEligibilityCandidate } else {
    if ($phase -in @('DEPENDENCY_SETUP', 'STATIC_PREPARATION', 'FINAL_STATIC_REVIEW', 'RUNNER_PREFLIGHT')) { 'PRE_HYPOTHESIS' } else { 'NONE' }
  }
  if ($null -ne $errorRecord) {
    $aggregate = 'INCONCLUSIVE'
    $h05 = 'INCONCLUSIVE'
    $h20 = 'INCONCLUSIVE'
    $firstFailure = $errorRecord.phase
  }
  $attempt = [ordered]@{
    schemaVersion = 1
    notProduction = $true
    contractId = 'P0S6-MEC-20260903-01'
    attemptId = $AttemptId
    productBaselineHead = $productBaselineHead
    contractFreezeHead = $contractFreezeHead
    executionAuthorityHead = $executionAuthorityHead
    attemptStartHead = if ($null -ne $preflight) { $preflight.attemptStartHead } else { $null }
    harnessHead = if ($null -ne $preflight) { $preflight.harnessHead } else { $null }
    startedAtUtc = $startedAt.ToString('o')
    completedAtUtc = $endAt.ToString('o')
    durationMs = [Math]::Round(($endAt - $startedAt).TotalMilliseconds)
    exactTopLevelCommand = $exactTopLevelCommand
    runnerInvocationCount = 1
    primaryAttemptsUsed = 1
    physicalAttemptsUsed = 1
    physicalAttemptsRemaining = 1
    correctiveAttemptExecuted = $false
    electronInvocationCount = $electronInvocationCount
    electronExitCode = $electronExitCode
    verifierExitCode = $verifierExitCode
    runnerExitCode = $runnerExitCode
    hardTimeoutSeconds = 45
    timeoutTriggered = $timeoutTriggered
    h05 = $h05
    h20 = $h20
    aggregateResult = $aggregate
    firstFailureBoundary = $firstFailure
    retryEligibilityCandidate = $retryCandidate
    clientModuleCorePatchRequired = if ($null -ne $verification) { $verification.clientModuleCorePatchRequired } else { 'NO' }
    corePatchEquivalent = if ($null -ne $verification) { $verification.corePatchEquivalent } else { 'NO' }
    staticArtifactSemanticTransformation = $false
    adapterStubInventory = if ($null -ne $verification) { $verification.adapterStubInventory } else { @() }
    worktreeAfter = $worktreeAfter
    harnessWorktreeAfter = $harnessAfter
    error = $errorRecord
  }
  Write-Utf8Json (Join-Path $evidenceDir 'attempt.json') $attempt

  $evidenceInventory = @(Get-ChildItem -LiteralPath $evidenceDir -File | Sort-Object Name | ForEach-Object {
    [ordered]@{ file = $_.Name; bytes = $_.Length; sha256 = Get-Sha256 $_.FullName }
  })
  $generatedDirectories = @($generatedRoots | Where-Object { Test-Path -LiteralPath (Join-Path $spikeRoot $_) })
  $finalResult = [ordered]@{
    verdict = "P0S6_PRIMARY_ATTEMPT = $aggregate"
    aggregateResult = $aggregate
    h05 = $h05
    h20 = $h20
    attemptId = $AttemptId
    exactTopLevelCommand = $exactTopLevelCommand
    runnerInvocationCount = 1
    physicalAttemptsUsed = 1
    physicalAttemptsRemaining = 1
    attempt2Executed = $false
    startedAtUtc = $startedAt.ToString('o')
    completedAtUtc = $endAt.ToString('o')
    runnerExitCode = $runnerExitCode
    electronExitCode = $electronExitCode
    timeoutTriggered = $timeoutTriggered
    firstFailureBoundary = $firstFailure
    retryEligibilityCandidate = $retryCandidate
    executionAuthorityHead = $executionAuthorityHead
    attemptStartHead = if ($null -ne $preflight) { $preflight.attemptStartHead } else { $null }
    harnessHead = if ($null -ne $preflight) { $preflight.harnessHead } else { $null }
    worktreeAfter = $worktreeAfter
    harnessWorktreeAfter = $harnessAfter
    evidence = $evidenceInventory
    generatedDirectories = $generatedDirectories
    verification = $verification
    error = $errorRecord
  }
  Write-Output "P0S6_FINAL_RESULT_JSON=$($finalResult | ConvertTo-Json -Depth 30 -Compress)"
}

exit $runnerExitCode
