param(
  [Parameter(Mandatory = $true)]
  [string]$FrozenHarnessRoot,

  [string]$ElectronExe = ''
)

# NOT_PRODUCTION: authoritative P0.S-5 evidence runner.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$experimentRoot = $PSScriptRoot
$repoRoot = (Resolve-Path (Join-Path $experimentRoot '..\..\..\..')).Path
$runId = [guid]::NewGuid().ToString('N')
$runtimeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("shaco-forge-p0s5-{0}" -f $runId)
$runRoot = Join-Path $runtimeRoot 'run'
$discoveryRoot = Join-Path $runtimeRoot 'discovery'
$desktopRoot = Join-Path $runRoot 'desktops'
$evidenceRoot = Join-Path $experimentRoot 'evidence'
$electronUserData = Join-Path $runtimeRoot 'electron-user-data'
$nodePath = (Get-Command node -ErrorAction Stop).Source
$pwshPath = (Get-Command pwsh.exe -ErrorAction Stop).Source
$cliBin = Join-Path $FrozenHarnessRoot 'apps\cli\lib\bin.js'
$workerScript = Join-Path $experimentRoot 'worker-carrier.ps1'
$desktopMain = Join-Path $experimentRoot 'desktop-main.mjs'
$verifier = Join-Path $evidenceRoot 'verify-summary.ps1'
$expectedShacoHead = 'c51d6107eb6da3379490fcb9d8a9eecb4e63e647'
$expectedHarnessHead = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
$expectedLockSha = '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1'
$rawEventFiles = [System.Collections.Generic.List[string]]::new()
$processRecords = [System.Collections.Generic.List[object]]::new()
$scenarioResults = [ordered]@{}
$replayCaptureFiles = @{}
$desktopOrdinal = 0
$worker1 = $null
$worker2 = $null
$runnerStage = 'baseline-validation'
$activeDesktops = [System.Collections.Generic.List[object]]::new()

if ([string]::IsNullOrWhiteSpace($ElectronExe)) {
  $ElectronExe = Join-Path (Split-Path -Parent $experimentRoot) 'P0S-2-ELECTRON-CLIENT-BOOT\node_modules\electron\dist\electron.exe'
}

function Write-Utf8Json([string]$Path, [object]$Value) {
  [System.IO.Directory]::CreateDirectory((Split-Path -Parent $Path)) | Out-Null
  $json = $Value | ConvertTo-Json -Depth 80
  [System.IO.File]::WriteAllText($Path, "$json`n", $utf8NoBom)
}

function Read-Json([string]$Path) {
  return [System.IO.File]::ReadAllText($Path, $utf8NoBom) | ConvertFrom-Json -Depth 80
}

function New-RandomHex([int]$ByteCount) {
  $bytes = [byte[]]::new($ByteCount)
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  return [Convert]::ToHexString($bytes).ToLowerInvariant()
}

function Get-HashPrefix([string]$Value) {
  $hash = [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($Value))
  return [Convert]::ToHexString($hash).ToLowerInvariant().Substring(0, 16)
}

function Start-RedirectedProcess(
  [string]$FileName,
  [string[]]$Arguments,
  [string]$WorkingDirectory,
  [hashtable]$Environment
) {
  $info = [System.Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $FileName
  $info.WorkingDirectory = $WorkingDirectory
  $info.UseShellExecute = $false
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $info.CreateNoWindow = $true
  foreach ($argument in $Arguments) { $info.ArgumentList.Add($argument) }
  foreach ($entry in $Environment.GetEnumerator()) { $info.Environment[$entry.Key] = [string]$entry.Value }
  $process = [System.Diagnostics.Process]::new()
  $process.StartInfo = $info
  if (-not $process.Start()) { throw "Failed to start process: $FileName" }
  return $process
}

function Wait-ForFile(
  [string]$Path,
  [int]$TimeoutSeconds,
  [System.Diagnostics.Process]$Process = $null,
  [string]$FailurePath = ''
) {
  $deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)
  while ([DateTimeOffset]::UtcNow -lt $deadline) {
    if (Test-Path -LiteralPath $Path -PathType Leaf) { return }
    if (-not [string]::IsNullOrWhiteSpace($FailurePath) -and (Test-Path -LiteralPath $FailurePath -PathType Leaf)) {
      throw "Child process reported failure: $FailurePath`n$([System.IO.File]::ReadAllText($FailurePath))"
    }
    if ($null -ne $Process -and $Process.HasExited) {
      throw "Process $($Process.Id) exited before writing $Path (exit $($Process.ExitCode))."
    }
    Start-Sleep -Milliseconds 100
  }
  throw "Timed out waiting for $Path"
}

function Wait-ExactExit([int]$ProcessId, [datetime]$StartTimeUtc, [int]$TimeoutSeconds = 10) {
  $deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)
  while ([DateTimeOffset]::UtcNow -lt $deadline) {
    $current = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($null -eq $current) { return $true }
    if ([Math]::Abs(($current.StartTime.ToUniversalTime() - $StartTimeUtc).TotalMilliseconds) -gt 10) { return $true }
    Start-Sleep -Milliseconds 100
  }
  return $false
}

function Assert-ExactProcess([System.Diagnostics.Process]$Process, [datetime]$ExpectedStartTimeUtc) {
  $current = Get-Process -Id $Process.Id -ErrorAction Stop
  if ([Math]::Abs(($current.StartTime.ToUniversalTime() - $ExpectedStartTimeUtc).TotalMilliseconds) -gt 10) {
    throw "PID/start-time identity mismatch for process $($Process.Id)."
  }
}

function Force-KillExactTree([System.Diagnostics.Process]$Process, [datetime]$ExpectedStartTimeUtc) {
  Assert-ExactProcess $Process $ExpectedStartTimeUtc
  $Process.Kill($true)
  if (-not $Process.WaitForExit(10000)) { throw "Exact process tree $($Process.Id) did not exit after force-kill." }
}

function Get-TrackedTreeDigest([string]$Repository) {
  $builder = [System.Text.StringBuilder]::new()
  $files = @(git -c "safe.directory=$($Repository.Replace('\','/'))" -C $Repository ls-files)
  foreach ($relative in $files | Sort-Object) {
    $path = Join-Path $Repository $relative
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Tracked file missing: $path" }
    $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    [void]$builder.Append($relative.Replace('\','/')).Append("`0").Append($hash).Append("`n")
  }
  $digest = [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($builder.ToString()))
  return [Convert]::ToHexString($digest).ToLowerInvariant()
}

function Get-ProtectedDigest {
  $targets = @(
    'docs\04-development-records\experiments\P0S-1-HOST-PROFILE-FEASIBILITY',
    'docs\04-development-records\experiments\P0S-2-ELECTRON-CLIENT-BOOT',
    'docs\04-development-records\experiments\P0S-3-LOCAL-CARRIER-AND-TRUST',
    'docs\04-development-records\experiments\P0S-4-CONNECTION-FEATURE-COMPLETENESS',
    'docs\06-testing-acceptance\evidence\P0S-1-HOST-PROFILE-FEASIBILITY-EVIDENCE.md',
    'docs\06-testing-acceptance\evidence\P0S-2-ELECTRON-CLIENT-BOOT-EVIDENCE.md',
    'docs\06-testing-acceptance\evidence\P0S-3-LOCAL-CARRIER-AND-TRUST-EVIDENCE.md',
    'docs\06-testing-acceptance\evidence\P0S-4-CONNECTION-FEATURE-COMPLETENESS-EVIDENCE.md'
  )
  $builder = [System.Text.StringBuilder]::new()
  foreach ($target in $targets) {
    $path = Join-Path $repoRoot $target
    $files = if (Test-Path -LiteralPath $path -PathType Container) {
      Get-ChildItem -LiteralPath $path -Recurse -File | Sort-Object FullName
    } else {
      @(Get-Item -LiteralPath $path)
    }
    foreach ($file in $files) {
      $relative = [System.IO.Path]::GetRelativePath($repoRoot, $file.FullName).Replace('\','/')
      $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
      [void]$builder.Append($relative).Append("`0").Append($hash).Append("`n")
    }
  }
  $digest = [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($builder.ToString()))
  return [Convert]::ToHexString($digest).ToLowerInvariant()
}

function Initialize-WorkerProfile([string]$WorkerRoot) {
  $profileRoot = Join-Path $WorkerRoot 'profiles\shaco-host'
  $bundleRoot = Join-Path $profileRoot 'node_modules\@shaco-forge\not-production-p0s5-host-bundle'
  [System.IO.Directory]::CreateDirectory($bundleRoot) | Out-Null
  Copy-Item -LiteralPath (Join-Path $experimentRoot 'profile\package.json') -Destination (Join-Path $profileRoot 'package.json')
  Copy-Item -LiteralPath (Join-Path $experimentRoot 'profile\cordis.patch.yml') -Destination (Join-Path $profileRoot 'cordis.patch.yml')
  foreach ($name in @('package.json','cordis.patch.yml','connection-compatibility.mjs','carrier-gateway.mjs')) {
    Copy-Item -LiteralPath (Join-Path $experimentRoot "bundle\$name") -Destination (Join-Path $bundleRoot $name)
  }
  [System.IO.Directory]::CreateDirectory((Join-Path $WorkerRoot 'workspace')) | Out-Null
}

function Start-Worker([string]$Name) {
  $workerRoot = Join-Path $runtimeRoot $Name
  $workerRun = Join-Path $workerRoot 'run'
  [System.IO.Directory]::CreateDirectory($workerRun) | Out-Null
  Initialize-WorkerProfile $workerRoot
  $workerInstanceId = [guid]::NewGuid().ToString()
  $endpointId = [guid]::NewGuid().ToString()
  $credentialEpoch = [guid]::NewGuid().ToString()
  $secret = New-RandomHex 32
  $pipeName = "shaco-forge-p0s5-$([guid]::NewGuid().ToString('N'))"
  $readyFile = Join-Path $workerRun 'worker-ready.json'
  $summaryFile = Join-Path $workerRun 'worker-summary.json'
  $failureFile = Join-Path $workerRun 'worker-failure.json'
  $dshReadyFile = Join-Path $workerRun 'dsh-ready.json'
  $dshSummaryFile = Join-Path $workerRun 'dsh-summary.json'
  $dshFailureFile = Join-Path $workerRun 'dsh-failure.json'
  $workerEventsFile = Join-Path $workerRun 'worker-events.ndjson'
  $hostEventsFile = Join-Path $workerRun 'host-events.ndjson'
  $credentialFile = Join-Path $workerRun "credential-$credentialEpoch.json"
  $discoveryFile = Join-Path $discoveryRoot 'worker-discovery.json'
  $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
  $process = Start-RedirectedProcess $pwshPath @('-NoLogo','-NoProfile','-NonInteractive','-File',$workerScript) $experimentRoot @{
    P0S5_PIPE_NAME = $pipeName
    P0S5_EPHEMERAL_SECRET = $secret
    P0S5_WORKER_INSTANCE_ID = $workerInstanceId
    P0S5_ENDPOINT_ID = $endpointId
    P0S5_CREDENTIAL_EPOCH = $credentialEpoch
    P0S5_USER_SID = $sid
    P0S5_CREDENTIAL_FILE = $credentialFile
    P0S5_DISCOVERY_FILE = $discoveryFile
    P0S5_WORKER_READY_FILE = $readyFile
    P0S5_WORKER_SUMMARY_FILE = $summaryFile
    P0S5_WORKER_FAILURE_FILE = $failureFile
    P0S5_WORKER_EVENTS_FILE = $workerEventsFile
    P0S5_HOST_EVENTS_FILE = $hostEventsFile
    P0S5_DSH_READY_FILE = $dshReadyFile
    P0S5_DSH_SUMMARY_FILE = $dshSummaryFile
    P0S5_DSH_FAILURE_FILE = $dshFailureFile
    P0S5_NODE_PATH = $nodePath
    P0S5_DSH_CLI = $cliBin
    P0S5_RUNTIME_ROOT = $workerRoot
    P0S5_WORKSPACE_ROOT = (Join-Path $workerRoot 'workspace')
  }
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  Wait-ForFile $readyFile 90 $process $failureFile
  $descriptor = Read-Json $readyFile
  $rawEventFiles.Add($workerEventsFile)
  $rawEventFiles.Add($hostEventsFile)
  return [pscustomobject]@{
    Name = $Name
    Process = $process
    ProcessStartTimeUtc = $process.StartTime.ToUniversalTime()
    Descriptor = $descriptor
    ReadyFile = $readyFile
    SummaryFile = $summaryFile
    FailureFile = $failureFile
    CredentialFile = $credentialFile
    DiscoveryFile = $discoveryFile
    WorkerEventsFile = $workerEventsFile
    HostEventsFile = $hostEventsFile
    StdoutTask = $stdoutTask
    StderrTask = $stderrTask
    AuthorityStartedAtUtc = [datetime]::Parse($descriptor.publishedAtUtc).ToUniversalTime()
    AuthorityEndedAtUtc = $null
    EndReason = $null
  }
}

function Start-Desktop([string]$ScenarioId, [string]$Action, [hashtable]$Extra = @{}) {
  $script:desktopOrdinal += 1
  $name = '{0:D2}-{1}-{2}' -f $script:desktopOrdinal, $ScenarioId, $Action
  $result = Join-Path $desktopRoot "$name-result.json"
  $events = Join-Path $desktopRoot "$name-events.ndjson"
  $environment = @{
    P0S5_ACTION = $Action
    P0S5_SCENARIO_ID = $ScenarioId
    P0S5_DESKTOP_RESULT_FILE = $result
    P0S5_DESKTOP_EVENTS_FILE = $events
    P0S5_ELECTRON_USER_DATA = $electronUserData
    P0S5_DISCOVERY_ROOT = $discoveryRoot
    P0S5_PWSH_PATH = $pwshPath
    ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
  }
  foreach ($entry in $Extra.GetEnumerator()) { $environment[$entry.Key] = [string]$entry.Value }
  $process = Start-Process -FilePath $ElectronExe -ArgumentList @($desktopMain) -WorkingDirectory $experimentRoot `
    -Environment $environment -WindowStyle Hidden -PassThru
  $record = [pscustomobject]@{
    Name = $name
    ScenarioId = $ScenarioId
    Action = $Action
    Process = $process
    ProcessStartTimeUtc = $process.StartTime.ToUniversalTime()
    ResultFile = $result
    EventFile = $events
  }
  $activeDesktops.Add($record)
  $rawEventFiles.Add($events)
  return $record
}

function Read-DesktopResult([object]$Desktop, [bool]$WaitForExit = $true, [int]$TimeoutSeconds = 60) {
  Wait-ForFile $Desktop.ResultFile $TimeoutSeconds $Desktop.Process
  $result = Read-Json $Desktop.ResultFile
  if ($result.result -ne 'PASS' -and $result.result -ne 'READY') {
    throw "Desktop scenario failed: $($Desktop.Name)`n$([System.IO.File]::ReadAllText($Desktop.ResultFile))"
  }
  if ($WaitForExit) {
    if (-not $Desktop.Process.WaitForExit($TimeoutSeconds * 1000)) { throw "Desktop did not exit: $($Desktop.Name)" }
    if ($Desktop.Process.ExitCode -ne 0) { throw "Desktop exited nonzero: $($Desktop.Name) = $($Desktop.Process.ExitCode)" }
  }
  return $result
}

function Add-DesktopProcessRecord([object]$Desktop, [string]$EndReason) {
  $processRecords.Add([ordered]@{
    kind = 'desktop'
    scenarioId = $Desktop.ScenarioId
    action = $Desktop.Action
    pid = $Desktop.Process.Id
    startTimeUtc = $Desktop.ProcessStartTimeUtc.ToString('o')
    endReason = $EndReason
    exited = $Desktop.Process.HasExited
  })
}

function Invoke-DesktopComplete([string]$ScenarioId, [string]$Action, [hashtable]$Extra = @{}) {
  $desktop = Start-Desktop $ScenarioId $Action $Extra
  $result = Read-DesktopResult $desktop $true
  Add-DesktopProcessRecord $desktop 'graceful-exit'
  return [pscustomobject]@{ Desktop = $desktop; Result = $result }
}

function Invoke-PendingPath([string]$ScenarioId, [string]$Kind, [string]$Termination) {
  $label = "$Kind-$Termination"
  $captureFile = Join-Path $runRoot "$ScenarioId-old-envelope.json"
  $oldDesktop = Start-Desktop $ScenarioId 'pending-capture' @{
    P0S5_PENDING_KIND = $Kind
    P0S5_LABEL = $label
    P0S5_CAPTURE_FILE = $captureFile
    P0S5_TERMINATION = $Termination
  }
  $oldResult = Read-DesktopResult $oldDesktop ($Termination -eq 'close') 60
  if ($Termination -eq 'crash') {
    Force-KillExactTree $oldDesktop.Process $oldDesktop.ProcessStartTimeUtc
    Add-DesktopProcessRecord $oldDesktop 'force-kill'
  } else {
    Add-DesktopProcessRecord $oldDesktop 'graceful-exit'
  }
  $new = Invoke-DesktopComplete $ScenarioId 'pending-settle' @{
    P0S5_PENDING_KIND = $Kind
    P0S5_OLD_ENVELOPE_FILE = $captureFile
  }
  $script:replayCaptureFiles[$ScenarioId] = $captureFile
  return [ordered]@{
    kind = $Kind
    termination = $Termination
    oldDesktop = $oldResult
    newDesktop = $new.Result
  }
}

if (-not $IsWindows) { throw 'P0.S-5 requires real Windows process and Named Pipe behavior.' }
if (-not (Test-Path -LiteralPath $ElectronExe -PathType Leaf)) { throw "Electron executable not found: $ElectronExe" }
if (-not (Test-Path -LiteralPath $cliBin -PathType Leaf)) { throw "Frozen dsh launcher not found: $cliBin" }
if ((git -C $repoRoot rev-parse HEAD).Trim() -ne $expectedShacoHead) { throw 'Shaco HEAD mismatch.' }
if ((git -C $repoRoot branch --show-current).Trim() -ne 'master') { throw 'Shaco branch mismatch.' }
$harnessSafe = $FrozenHarnessRoot.Replace('\','/')
$harnessHead = (git -c "safe.directory=$harnessSafe" -C $FrozenHarnessRoot rev-parse HEAD).Trim()
$harnessStatusBefore = @(git -c "safe.directory=$harnessSafe" -C $FrozenHarnessRoot status --porcelain=v1)
$harnessPackage = (Get-Content -LiteralPath (Join-Path $FrozenHarnessRoot 'apps\cli\package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
$lockSha = (Get-FileHash -LiteralPath (Join-Path $FrozenHarnessRoot 'pnpm-lock.yaml') -Algorithm SHA256).Hash.ToLowerInvariant()
if ($harnessHead -ne $expectedHarnessHead) { throw 'Harness HEAD mismatch.' }
if ($harnessStatusBefore.Count -ne 0) { throw 'Harness worktree is not clean before P0.S-5.' }
if ($harnessPackage -ne '0.1.2-alpha.1') { throw 'Harness package mismatch.' }
if ($lockSha -ne $expectedLockSha) { throw 'Harness lock hash mismatch.' }

$protectedDigestBefore = Get-ProtectedDigest
$harnessTreeDigestBefore = Get-TrackedTreeDigest $FrozenHarnessRoot
[System.IO.Directory]::CreateDirectory($runRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($discoveryRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($desktopRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($evidenceRoot) | Out-Null
$startedAt = [DateTimeOffset]::UtcNow

try {
  $worker1 = Start-Worker 'worker-1'

  $s01Old = Invoke-DesktopComplete 'S01' 'start-running-close' @{ P0S5_LABEL = 'turn-close' }
  $s01New = Invoke-DesktopComplete 'S01' 'verify-running' @{ P0S5_LABEL = 'turn-close' }
  $scenarioResults['S01_DESKTOP_CLOSE'] = [ordered]@{ oldDesktop = $s01Old.Result; newDesktop = $s01New.Result }

  $s02Control = Join-Path $runRoot 's02-primary-exit.control'
  $s02Primary = Start-Desktop 'S02' 'hold' @{ P0S5_CONTROL_FILE = $s02Control }
  $s02PrimaryResult = Read-DesktopResult $s02Primary $false
  $s02Secondary = Start-Desktop 'S02' 'hold' @{ P0S5_CONTROL_FILE = (Join-Path $runRoot 'unused-secondary.control') }
  $s02SecondaryResult = Read-DesktopResult $s02Secondary $true
  Add-DesktopProcessRecord $s02Secondary 'single-instance-denied'
  [System.IO.File]::WriteAllText($s02Control, "exit`n", $utf8NoBom)
  if (-not $s02Primary.Process.WaitForExit(30000)) { throw 'S02 primary did not exit after exact control marker.' }
  Add-DesktopProcessRecord $s02Primary 'graceful-exit'
  $scenarioResults['S02_SECOND_DESKTOP'] = [ordered]@{ primary = $s02PrimaryResult; secondary = $s02SecondaryResult }

  $s03Old = Start-Desktop 'S03' 'start-running-hold' @{ P0S5_LABEL = 'turn-crash' }
  $s03OldResult = Read-DesktopResult $s03Old $false
  Force-KillExactTree $s03Old.Process $s03Old.ProcessStartTimeUtc
  Add-DesktopProcessRecord $s03Old 'force-kill'
  $s03New = Invoke-DesktopComplete 'S03' 'verify-running' @{ P0S5_LABEL = 'turn-crash' }
  $scenarioResults['S03_DESKTOP_CRASH'] = [ordered]@{ oldDesktop = $s03OldResult; newDesktop = $s03New.Result }

  $s04 = Invoke-DesktopComplete 'S04' 'cancel-running' @{ P0S5_LABEL = 'turn-crash' }
  $scenarioResults['S04_EXPLICIT_CANCEL'] = $s04.Result

  $scenarioResults['S05_APPROVAL_CLOSE'] = Invoke-PendingPath 'S05' 'approval' 'close'
  $scenarioResults['S06_APPROVAL_CRASH'] = Invoke-PendingPath 'S06' 'approval' 'crash'
  $scenarioResults['S07_QUESTION_CLOSE'] = Invoke-PendingPath 'S07' 'question' 'close'
  $scenarioResults['S08_QUESTION_CRASH'] = Invoke-PendingPath 'S08' 'question' 'crash'

  $oldDiscoveryCopy = Join-Path $runRoot 'worker-1-discovery.json'
  $oldCredentialCopy = Join-Path $runRoot 'worker-1-credential.json'
  Copy-Item -LiteralPath $worker1.ReadyFile -Destination $oldDiscoveryCopy
  Copy-Item -LiteralPath $worker1.CredentialFile -Destination $oldCredentialCopy

  $s09PrecrashFile = Join-Path $runRoot 's09-precrash.json'
  $s09LostFile = Join-Path $runRoot 's09-lost.json'
  $s09Desktop = Start-Desktop 'S09' 'worker-crash-monitor' @{
    P0S5_LABEL = 'turn-worker-crash'
    P0S5_PRECRASH_FILE = $s09PrecrashFile
    P0S5_LOST_FILE = $s09LostFile
  }
  Wait-ForFile $s09PrecrashFile 60 $s09Desktop.Process
  $s09Precrash = Read-Json $s09PrecrashFile
  $worker1DshPid = [int]$worker1.Descriptor.dshPid
  $worker1DshStart = [datetime]::Parse($worker1.Descriptor.dshStartTimeUtc).ToUniversalTime()
  $worker1CrashInitiatedAt = [DateTimeOffset]::UtcNow
  Force-KillExactTree $worker1.Process $worker1.ProcessStartTimeUtc
  if (-not (Wait-ExactExit $worker1DshPid $worker1DshStart 10)) { throw 'Worker 1 dsh remained as an orphan authority.' }
  $worker1AuthorityEndedAtUtc = [DateTimeOffset]::UtcNow
  $worker1.AuthorityEndedAtUtc = $worker1AuthorityEndedAtUtc.UtcDateTime
  $worker1.EndReason = 'force-kill-entire-process-tree'
  Wait-ForFile $s09LostFile 15 $s09Desktop.Process
  $s09Lost = Read-Json $s09LostFile

  $worker2 = Start-Worker 'worker-2'
  $worker2CarrierStartedAtUtc = [DateTimeOffset]::new($worker2.ProcessStartTimeUtc, [TimeSpan]::Zero)
  if ($worker2CarrierStartedAtUtc.UtcTicks -lt $worker1AuthorityEndedAtUtc.UtcTicks) {
    throw "Worker authority lifecycle overlap was not zero: oldEnd=$($worker1AuthorityEndedAtUtc.ToString('o')) newCarrierStart=$($worker2CarrierStartedAtUtc.ToString('o'))"
  }
  $s09Final = Read-DesktopResult $s09Desktop $true 60
  Add-DesktopProcessRecord $s09Desktop 'graceful-exit-after-self-reconnect'
  $scenarioResults['S09_WORKER_CRASH_RESTART'] = [ordered]@{
    precrash = $s09Precrash
    lost = $s09Lost
    final = $s09Final
    forceKill = $true
    gracefulStopUsed = $false
    crashInitiatedAtUtc = $worker1CrashInitiatedAt.ToString('o')
  }

  $staleEnvelopeFile = $replayCaptureFiles['S05']
  $s10 = Invoke-DesktopComplete 'S10' 'stale-worker-probes' @{
    P0S5_OLD_DISCOVERY_FILE = $oldDiscoveryCopy
    P0S5_OLD_CREDENTIAL_FILE = $oldCredentialCopy
    P0S5_OLD_ENVELOPE_FILE = $staleEnvelopeFile
  }
  $scenarioResults['S10_STALE_WORKER'] = $s10.Result

  $s11 = Invoke-DesktopComplete 'S11' 'graceful-worker-stop'
  $scenarioResults['S11_GRACEFUL_WORKER_STOP_SUPPORT'] = $s11.Result
  if (-not $worker2.Process.WaitForExit(30000)) { throw 'Worker 2 did not exit after supporting graceful stop.' }
  if ($worker2.Process.ExitCode -ne 0) { throw "Worker 2 graceful exit was nonzero: $($worker2.Process.ExitCode)" }
  $worker2.AuthorityEndedAtUtc = [DateTime]::UtcNow
  $worker2.EndReason = 'graceful-stop-supporting-scenario'

  $worker2Stdout = $worker2.StdoutTask.GetAwaiter().GetResult()
  $worker2Stderr = $worker2.StderrTask.GetAwaiter().GetResult()
  if (-not [string]::IsNullOrWhiteSpace($worker2Stdout) -or -not [string]::IsNullOrWhiteSpace($worker2Stderr)) {
    throw 'Worker 2 emitted unexpected stdout/stderr outside the carrier protocol.'
  }

  $processRecords.Add([ordered]@{
    kind = 'worker-authority'
    workerInstanceId = $worker1.Descriptor.workerInstanceId
    carrierPid = $worker1.Process.Id
    carrierStartTimeUtc = $worker1.ProcessStartTimeUtc.ToString('o')
    dshPid = $worker1.Descriptor.dshPid
    dshStartTimeUtc = $worker1.Descriptor.dshStartTimeUtc
    authorityStartUtc = $worker1.ProcessStartTimeUtc.ToString('o')
    authorityEndUtc = $worker1.AuthorityEndedAtUtc.ToString('o')
    endReason = $worker1.EndReason
    forceKill = $true
    gracefulStop = $false
    carrierExited = $worker1.Process.HasExited
    dshExited = (Wait-ExactExit $worker1DshPid $worker1DshStart 1)
  })
  $processRecords.Add([ordered]@{
    kind = 'worker-authority'
    workerInstanceId = $worker2.Descriptor.workerInstanceId
    carrierPid = $worker2.Process.Id
    carrierStartTimeUtc = $worker2.ProcessStartTimeUtc.ToString('o')
    dshPid = $worker2.Descriptor.dshPid
    dshStartTimeUtc = $worker2.Descriptor.dshStartTimeUtc
    authorityStartUtc = $worker2.ProcessStartTimeUtc.ToString('o')
    authorityEndUtc = $worker2.AuthorityEndedAtUtc.ToString('o')
    endReason = $worker2.EndReason
    forceKill = $false
    gracefulStop = $true
    carrierExited = $worker2.Process.HasExited
    dshExited = (Wait-ExactExit ([int]$worker2.Descriptor.dshPid) ([datetime]::Parse($worker2.Descriptor.dshStartTimeUtc).ToUniversalTime()) 10)
  })

  $harnessStatusAfter = @(git -c "safe.directory=$harnessSafe" -C $FrozenHarnessRoot status --porcelain=v1)
  $protectedDigestAfter = Get-ProtectedDigest
  $harnessTreeDigestAfter = Get-TrackedTreeDigest $FrozenHarnessRoot
  if ($harnessStatusAfter.Count -ne 0 -or $harnessTreeDigestBefore -ne $harnessTreeDigestAfter) {
    throw 'Frozen Harness changed during P0.S-5.'
  }
  if ($protectedDigestBefore -ne $protectedDigestAfter) { throw 'Protected P0.S-1 through P0.S-4 artifacts changed.' }

  $events = [System.Collections.Generic.List[object]]::new()
  foreach ($path in $rawEventFiles | Sort-Object -Unique) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    foreach ($line in [System.IO.File]::ReadLines($path, $utf8NoBom)) {
      if ([string]::IsNullOrWhiteSpace($line)) { continue }
      $events.Add(($line | ConvertFrom-Json -Depth 80))
    }
  }
  $orderedEvents = @($events | Sort-Object @{Expression={ [datetime]::Parse($_.utc).ToUniversalTime() }}, source, sourceSequence)
  $eventsPath = Join-Path $evidenceRoot 'events.ndjson'
  $builder = [System.Text.StringBuilder]::new()
  for ($index = 0; $index -lt $orderedEvents.Count; $index += 1) {
    $event = $orderedEvents[$index]
    $event | Add-Member -NotePropertyName globalSequence -NotePropertyValue ($index + 1) -Force
    [void]$builder.Append(($event | ConvertTo-Json -Depth 80 -Compress)).Append("`n")
  }
  [System.IO.File]::WriteAllText($eventsPath, $builder.ToString(), $utf8NoBom)

  Write-Utf8Json (Join-Path $evidenceRoot 'processes.json') $processRecords
  Write-Utf8Json (Join-Path $evidenceRoot 'scenario-results.json') $scenarioResults
  $hostTruth = @($orderedEvents | Where-Object { $_.source -eq 'host-harness' -or $_.type -in @('host_truth_received','host_truth_rebuilt') })
  Write-Utf8Json (Join-Path $evidenceRoot 'host-truth.json') $hostTruth
  $envelopes = @(
    foreach ($key in @('S05_APPROVAL_CLOSE','S06_APPROVAL_CRASH','S07_QUESTION_CLOSE','S08_QUESTION_CRASH')) {
      $pathResult = $scenarioResults[$key]
      [ordered]@{
        scenario = $key
        kind = $pathResult.kind
        termination = $pathResult.termination
        oldEnvelope = $pathResult.oldDesktop.capturedEnvelope
        currentEnvelope = $pathResult.newDesktop.currentEnvelope.envelope
        oldProbe = $pathResult.newDesktop.oldEnvelopeProbe
        duplicateProbe = $pathResult.newDesktop.duplicateProbe
      }
    }
  )
  Write-Utf8Json (Join-Path $evidenceRoot 'envelopes.json') $envelopes

  $runnerStage = 'source-hash-capture'
  $sourceHashes = [ordered]@{}
  Get-ChildItem -LiteralPath $experimentRoot -Recurse -File | Where-Object {
    $_.FullName -notlike "$evidenceRoot*" -or $_.FullName -eq $verifier
  } | Sort-Object FullName | ForEach-Object {
    $relative = [System.IO.Path]::GetRelativePath($experimentRoot, $_.FullName).Replace('\','/')
    $sourceHashes[$relative] = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  }
  $electronPackageFile = Join-Path (Split-Path -Parent (Split-Path -Parent $ElectronExe)) 'package.json'
  if (-not (Test-Path -LiteralPath $electronPackageFile -PathType Leaf)) {
    throw "Electron package metadata was not found: $electronPackageFile"
  }
  $electronVersion = (Read-Json $electronPackageFile).version
  if ([string]::IsNullOrWhiteSpace($electronVersion)) {
    throw "Electron package metadata did not contain a version: $electronPackageFile"
  }

  $runnerStage = 'run-manifest-write'
  Write-Utf8Json (Join-Path $evidenceRoot 'run-manifest.json') ([ordered]@{
    classification = 'NOT_PRODUCTION'
    runId = $runId
    formalRun = $true
    startedAt = $startedAt.ToString('o')
    completedAt = [DateTimeOffset]::UtcNow.ToString('o')
    runtimeRoot = '<TEMP>\shaco-forge-p0s5-<RUN_ID>'
    baseline = [ordered]@{
      shacoBranch = (git -C $repoRoot branch --show-current).Trim()
      shacoHead = (git -C $repoRoot rev-parse HEAD).Trim()
      harnessHead = $harnessHead
      harnessPackage = $harnessPackage
      harnessLockSha256 = $lockSha
      harnessCleanBefore = $harnessStatusBefore.Count -eq 0
      harnessCleanAfter = $harnessStatusAfter.Count -eq 0
      harnessTrackedTreeDigestBefore = $harnessTreeDigestBefore
      harnessTrackedTreeDigestAfter = $harnessTreeDigestAfter
      protectedP0S1ThroughP0S4DigestBefore = $protectedDigestBefore
      protectedP0S1ThroughP0S4DigestAfter = $protectedDigestAfter
      nodeVersion = (node --version).Trim()
      electronVersion = $electronVersion
      powerShellVersion = $PSVersionTable.PSVersion.ToString()
      windowsVersion = [System.Environment]::OSVersion.VersionString
    }
    constraints = [ordered]@{
      userUiActionsRequired = 'NONE'
      providerUsed = $false
      externalNetworkUsed = $false
      browserAuthConstructed = $false
      stockWebStarted = $false
      tcpListenerStarted = $false
      runnerWorkerReplacementNotificationSent = $false
      gracefulWorkerStopUsedAsHardGate = $false
      desktopEquivalentInvalidationAdapter = 'NOT_PRODUCTION'
      constantResetEvidenceAllowed = $false
    }
    sourceSha256 = $sourceHashes
  })

  $runnerStage = 'independent-verifier'
  & $verifier
  if ($LASTEXITCODE -ne 0) { throw 'P0.S-5 independent verifier failed.' }
} catch {
  Write-Error "P0.S-5 runner failed at stage '$runnerStage': $($_.Exception.Message)"
  throw
} finally {
  foreach ($desktop in $activeDesktops) {
    if ($null -ne $desktop.Process -and -not $desktop.Process.HasExited) {
      try { Force-KillExactTree $desktop.Process $desktop.ProcessStartTimeUtc } catch { }
    }
  }
  foreach ($worker in @($worker1, $worker2)) {
    if ($null -ne $worker -and $null -ne $worker.Process -and -not $worker.Process.HasExited) {
      try { Force-KillExactTree $worker.Process $worker.ProcessStartTimeUtc } catch { }
    }
  }
}
