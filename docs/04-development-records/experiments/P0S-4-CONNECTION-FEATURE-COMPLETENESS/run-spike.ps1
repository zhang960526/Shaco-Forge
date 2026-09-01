param(
  [Parameter(Mandatory = $true)]
  [string]$FrozenHarnessRoot,

  [string]$ElectronExe = ''
)

# NOT_PRODUCTION: disposable P0.S-4 evidence runner.
$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$experimentRoot = $PSScriptRoot
$runId = [guid]::NewGuid().ToString('N')
$runtimeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("shaco-forge-p0s4-{0}" -f $runId)
$profileRoot = Join-Path $runtimeRoot 'profiles\shaco-host'
$bundleRoot = Join-Path $profileRoot 'node_modules\@shaco-forge\not-production-p0s4-host-bundle'
$workspaceRoot = Join-Path $runtimeRoot 'workspace'
$runRoot = Join-Path $runtimeRoot 'run'
$evidenceRoot = Join-Path $experimentRoot 'evidence'
$workerReadyFile = Join-Path $runRoot 'worker-ready.json'
$workerSummaryFile = Join-Path $runRoot 'worker-summary.json'
$workerFailureFile = Join-Path $runRoot 'worker-failure.json'
$dshReadyFile = Join-Path $runRoot 'dsh-ready.json'
$dshSummaryFile = Join-Path $runRoot 'dsh-summary.json'
$dshFailureFile = Join-Path $runRoot 'dsh-failure.json'
$electronResultFile = Join-Path $runRoot 'electron-result.json'
$electronProgressFile = Join-Path $runRoot 'electron-progress.json'
$nodePath = (Get-Command node -ErrorAction Stop).Source
$cliBin = Join-Path $FrozenHarnessRoot 'apps\cli\lib\bin.js'
$workerScript = Join-Path $experimentRoot 'worker-carrier.ps1'
$electronMain = Join-Path $experimentRoot 'electron-main.mjs'
$expectedShacoHead = 'e1270ce2251b03972f33f32088a09408cd3880ef'
$expectedHarnessHead = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
$expectedLockSha = '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1'

if ([string]::IsNullOrWhiteSpace($ElectronExe)) {
  $ElectronExe = Join-Path (Split-Path -Parent $experimentRoot) 'P0S-2-ELECTRON-CLIENT-BOOT\node_modules\electron\dist\electron.exe'
}

function Write-Utf8Json([string]$Path, [object]$Value) {
  [System.IO.Directory]::CreateDirectory((Split-Path -Parent $Path)) | Out-Null
  $json = $Value | ConvertTo-Json -Depth 40
  [System.IO.File]::WriteAllText($Path, "$json`n", $utf8NoBom)
}

function Read-Json([string]$Path) {
  return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 40
}

function New-RandomHex([int]$ByteCount) {
  $bytes = [byte[]]::new($ByteCount)
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  return [Convert]::ToHexString($bytes).ToLowerInvariant()
}

function Get-HashPrefix([string]$Value) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  $hash = [System.Security.Cryptography.SHA256]::HashData($bytes)
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
  foreach ($argument in $Arguments) {
    $info.ArgumentList.Add($argument)
  }
  foreach ($entry in $Environment.GetEnumerator()) {
    $info.Environment[$entry.Key] = [string]$entry.Value
  }
  $process = [System.Diagnostics.Process]::new()
  $process.StartInfo = $info
  if (-not $process.Start()) {
    throw "Failed to start process: $FileName"
  }
  return $process
}

function Wait-ForFileOrExit(
  [System.Diagnostics.Process]$Process,
  [string]$SuccessFile,
  [string]$FailureFile,
  [int]$TimeoutSeconds
) {
  $deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)
  while ([DateTimeOffset]::UtcNow -lt $deadline) {
    if (Test-Path -LiteralPath $SuccessFile) { return }
    if (Test-Path -LiteralPath $FailureFile) {
      throw "Child process reported failure: $FailureFile"
    }
    if ($Process.HasExited) {
      throw "Child process exited before writing $SuccessFile (exit $($Process.ExitCode))."
    }
    Start-Sleep -Milliseconds 100
  }
  throw "Timed out waiting for $SuccessFile"
}

function Get-DescendantProcessIds([int]$ProcessId) {
  $found = [System.Collections.Generic.List[int]]::new()
  $pending = [System.Collections.Generic.Queue[int]]::new()
  $pending.Enqueue($ProcessId)
  while ($pending.Count -gt 0) {
    $parent = $pending.Dequeue()
    try {
      Get-CimInstance Win32_Process -Filter "ParentProcessId = $parent" -ErrorAction Stop | ForEach-Object {
        $childId = [int]$_.ProcessId
        if (-not $found.Contains($childId)) {
          $found.Add($childId)
          $pending.Enqueue($childId)
        }
      }
    } catch {
      # A process may exit while the snapshot is being collected.
    }
  }
  return $found.ToArray()
}

function Stop-ExactProcessTree([System.Diagnostics.Process]$Process) {
  if ($null -eq $Process -or $Process.HasExited) { return }
  try {
    $Process.Kill($true)
    $Process.WaitForExit(10000) | Out-Null
  } catch {
    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
  }
}

function Test-ProcessExited([int]$ProcessId) {
  return $null -eq (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Get-TcpListeners([int[]]$ProcessIds) {
  $rows = [System.Collections.Generic.List[object]]::new()
  foreach ($processId in $ProcessIds) {
    try {
      Get-NetTCPConnection -State Listen -OwningProcess $processId -ErrorAction Stop | ForEach-Object {
        $rows.Add([ordered]@{
          localAddress = $_.LocalAddress
          localPort = $_.LocalPort
          owningProcess = $_.OwningProcess
        })
      }
    } catch {
      # Empty is the expected state for the Worker and Electron application.
    }
  }
  return $rows.ToArray()
}

function Invoke-DshValidation {
  $process = Start-RedirectedProcess $nodePath @($cliBin, '--profile', 'shaco-host', '--dump-config') $workspaceRoot @{
    DSH_HOME = $runtimeRoot
    DSH_TELEMETRY_DISABLED = '1'
  }
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.WaitForExit()
  $stdout = $stdoutTask.GetAwaiter().GetResult()
  $stderr = $stderrTask.GetAwaiter().GetResult()
  return [ordered]@{
    exitCode = $process.ExitCode
    profileName = 'shaco-host'
    hasBase = $stdout.Contains("name: '@deepseek-ai/dsh-agent-loop'")
    hasLocalBundle = $stdout.Contains('@shaco-forge/not-production-p0s4-host-bundle')
    hasDshWebApp = $stdout.Contains("name: '@deepseek-ai/dsh-web-app'")
    hasHostWebserver = $stdout.Contains("name: '@deepseek-ai/dsh-host-webserver'")
    hasClientHmr = $stdout.Contains("name: '@deepseek-ai/dsh-client-hmr'")
    stderrEmpty = [string]::IsNullOrWhiteSpace($stderr)
  }
}

if (-not $IsWindows) { throw 'P0.S-4 requires real Windows Named Pipes and ACLs.' }
if (-not (Test-Path -LiteralPath $cliBin -PathType Leaf)) { throw "Frozen dsh launcher not found: $cliBin" }
if (-not (Test-Path -LiteralPath $ElectronExe -PathType Leaf)) { throw "Electron executable not found: $ElectronExe" }
if ((git rev-parse HEAD).Trim() -ne $expectedShacoHead) { throw 'Shaco HEAD mismatch.' }
if ((git branch --show-current).Trim() -ne 'master') { throw 'Shaco branch mismatch.' }
$harnessHead = (git -c "safe.directory=$FrozenHarnessRoot" -C $FrozenHarnessRoot rev-parse HEAD).Trim()
$harnessStatusBefore = @(git -c "safe.directory=$FrozenHarnessRoot" -C $FrozenHarnessRoot status --porcelain=v1)
$lockSha = (Get-FileHash -LiteralPath (Join-Path $FrozenHarnessRoot 'pnpm-lock.yaml') -Algorithm SHA256).Hash.ToLowerInvariant()
$harnessPackage = (Get-Content -LiteralPath (Join-Path $FrozenHarnessRoot 'apps\cli\package.json') -Raw | ConvertFrom-Json).version
if ($harnessHead -ne $expectedHarnessHead) { throw 'Harness HEAD mismatch.' }
if ($harnessStatusBefore.Count -ne 0) { throw 'Harness worktree is not clean before the Spike.' }
if ($lockSha -ne $expectedLockSha) { throw 'Harness lock hash mismatch.' }
if ($harnessPackage -ne '0.1.2-alpha.1') { throw 'Harness package version mismatch.' }

[System.IO.Directory]::CreateDirectory($profileRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($bundleRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($workspaceRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($runRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($evidenceRoot) | Out-Null
Copy-Item -LiteralPath (Join-Path $experimentRoot 'profile\package.json') -Destination (Join-Path $profileRoot 'package.json')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'profile\cordis.patch.yml') -Destination (Join-Path $profileRoot 'cordis.patch.yml')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\package.json') -Destination (Join-Path $bundleRoot 'package.json')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\cordis.patch.yml') -Destination (Join-Path $bundleRoot 'cordis.patch.yml')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\connection-compatibility.mjs') -Destination (Join-Path $bundleRoot 'connection-compatibility.mjs')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\carrier-gateway.mjs') -Destination (Join-Path $bundleRoot 'carrier-gateway.mjs')

$validation = Invoke-DshValidation
if (($validation.exitCode -ne 0) -or
    (-not $validation.hasBase) -or
    (-not $validation.hasLocalBundle) -or
    $validation.hasDshWebApp -or
    $validation.hasHostWebserver -or
    $validation.hasClientHmr) {
  throw 'Host profile validation failed closed.'
}

$pipeName = "shaco-forge-p0s4-$([guid]::NewGuid().ToString('N'))"
$ephemeralSecret = New-RandomHex 32
$workerId = [guid]::NewGuid().ToString()
$endpointId = [guid]::NewGuid().ToString()
$currentSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$pwshPath = (Get-Command pwsh.exe -ErrorAction Stop).Source
$workerProcess = $null
$electronProcess = $null
$workerStdoutTask = $null
$workerStderrTask = $null
$electronStdoutTask = $null
$electronStderrTask = $null
$listenerSnapshot = @()
$startedAt = [DateTimeOffset]::UtcNow

try {
  $workerProcess = Start-RedirectedProcess $pwshPath @('-NoLogo', '-NoProfile', '-NonInteractive', '-File', $workerScript) $experimentRoot @{
    P0S4_PIPE_NAME = $pipeName
    P0S4_EPHEMERAL_SECRET = $ephemeralSecret
    P0S4_WORKER_ID = $workerId
    P0S4_ENDPOINT_ID = $endpointId
    P0S4_USER_SID = $currentSid
    P0S4_WORKER_READY_FILE = $workerReadyFile
    P0S4_WORKER_SUMMARY_FILE = $workerSummaryFile
    P0S4_WORKER_FAILURE_FILE = $workerFailureFile
    P0S4_DSH_READY_FILE = $dshReadyFile
    P0S4_DSH_SUMMARY_FILE = $dshSummaryFile
    P0S4_DSH_FAILURE_FILE = $dshFailureFile
    P0S4_NODE_PATH = $nodePath
    P0S4_DSH_CLI = $cliBin
    P0S4_RUNTIME_ROOT = $runtimeRoot
    P0S4_WORKSPACE_ROOT = $workspaceRoot
  }
  $workerStdoutTask = $workerProcess.StandardOutput.ReadToEndAsync()
  $workerStderrTask = $workerProcess.StandardError.ReadToEndAsync()
  Wait-ForFileOrExit $workerProcess $workerReadyFile $workerFailureFile 90
  $workerReady = Read-Json $workerReadyFile
  $dshReady = Read-Json $dshReadyFile

  $electronEnvironment = @{
    P0S4_PIPE_NAME = $pipeName
    P0S4_EPHEMERAL_SECRET = $ephemeralSecret
    P0S4_WORKER_ID = $workerId
    P0S4_ENDPOINT_ID = $endpointId
    P0S4_USER_SID = $currentSid
    P0S4_WORKER_PROCESS_ID = $workerProcess.Id
    P0S4_DSH_PROCESS_ID = $workerReady.dshPid
    P0S4_ELECTRON_RESULT_FILE = $electronResultFile
    P0S4_ELECTRON_PROGRESS_FILE = $electronProgressFile
    P0S4_ELECTRON_USER_DATA = (Join-Path $runRoot 'electron-user-data')
    P0S4_PICKER_SUCCESS_PATH = $workspaceRoot
    ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
  }
  $electronProcess = Start-Process -FilePath $ElectronExe `
    -ArgumentList @($electronMain) `
    -WorkingDirectory $experimentRoot `
    -Environment $electronEnvironment `
    -PassThru
  Start-Sleep -Milliseconds 1000
  $listenerSnapshot = @(Get-TcpListeners @($workerProcess.Id, [int]$workerReady.dshPid, $electronProcess.Id))

  if (-not $electronProcess.WaitForExit(300000)) {
    throw 'Electron Main timed out.'
  }
  if ($electronProcess.ExitCode -ne 0) {
    Write-Utf8Json (Join-Path $runRoot 'electron-launch-failure.json') ([ordered]@{
      classification = 'NOT_PRODUCTION'
      exitCode = $electronProcess.ExitCode
      stdout = '<NOT_REDIRECTED>'
      stderr = '<NOT_REDIRECTED>'
    })
    throw "Electron Main exited with code $($electronProcess.ExitCode)."
  }
  Wait-ForFileOrExit $electronProcess $electronResultFile (Join-Path $runRoot 'electron-failure.json') 5
  if (-not $workerProcess.WaitForExit(30000)) {
    throw 'Worker carrier did not exit after the finish frame.'
  }
  if ($workerProcess.ExitCode -ne 0) {
    throw "Worker carrier exited with code $($workerProcess.ExitCode)."
  }

  $electronResult = Read-Json $electronResultFile
  $workerSummary = Read-Json $workerSummaryFile
  $dshSummary = Read-Json $dshSummaryFile
  $electronStdout = ''
  $electronStderr = ''
  $workerStdout = $workerStdoutTask.GetAwaiter().GetResult()
  $workerStderr = $workerStderrTask.GetAwaiter().GetResult()

  $allPids = @(
    [int]$workerProcess.Id
    [int]$workerReady.dshPid
    [int]$electronResult.processTopology.electronMainPid
    [int]$electronResult.processTopology.rendererPid
  ) + @($electronResult.processTopology.electronApplicationPids | ForEach-Object { [int]$_ })
  $allPids = @($allPids | Sort-Object -Unique)
  Start-Sleep -Milliseconds 500
  $residualPids = @($allPids | Where-Object { -not (Test-ProcessExited $_) })
  $harnessStatusAfter = @(git -c "safe.directory=$FrozenHarnessRoot" -C $FrozenHarnessRoot status --porcelain=v1)

  $sourceHashes = [ordered]@{}
  Get-ChildItem -LiteralPath $experimentRoot -Recurse -File | Where-Object {
    $_.FullName -notlike "$evidenceRoot*"
  } | Sort-Object FullName | ForEach-Object {
    $relative = [System.IO.Path]::GetRelativePath($experimentRoot, $_.FullName).Replace('\', '/')
    $sourceHashes[$relative] = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  }

  $negativePass = @($electronResult.authentication.negative.results | Where-Object {
    $_.gatewayDispatchCount -ne 0
  }).Count -eq 0 -and $electronResult.authentication.negative.preGatewayStatus.gatewayDispatchCount -eq 0
  $resultPass = ($electronResult.result -eq 'PASS') -and
    $workerReady.currentUserOnly -and
    $workerReady.aclProtected -and
    $negativePass -and
    ($workerSummary.gatewayForwardedCount -eq $dshSummary.gatewayDispatchCount) -and
    ($workerSummary.streamForwardedCount -eq $dshSummary.streamOpenCount) -and
    ($workerSummary.maxDshResponseQueueDepth -le $workerSummary.dshResponseQueueCapacity) -and
    ($dshSummary.maxStreamCreditsObserved -le $dshReady.streamCreditLimit) -and
    ($electronResult.boundedResources.finalResourceCleanupPass) -and
    ($electronResult.boundedResources.finalActiveStreams -eq 0) -and
    ($electronResult.boundedResources.finalActiveBinaries -eq 0) -and
    ($listenerSnapshot.Count -eq 0) -and
    ($residualPids.Count -eq 0) -and
    ($harnessStatusAfter.Count -eq 0) -and
    [string]::IsNullOrWhiteSpace($electronStdout) -and
    [string]::IsNullOrWhiteSpace($electronStderr) -and
    [string]::IsNullOrWhiteSpace($workerStdout) -and
    [string]::IsNullOrWhiteSpace($workerStderr)

  $summary = [ordered]@{
    classification = 'NOT_PRODUCTION'
    runId = $runId
    result = if ($resultPass) { 'PASS' } else { 'FAIL' }
    startedAt = $startedAt.ToString('o')
    completedAt = [DateTimeOffset]::UtcNow.ToString('o')
    runtimeRoot = '<TEMP>\shaco-forge-p0s4-<RUN_ID>'
    baseline = [ordered]@{
      shacoBranch = (git branch --show-current).Trim()
      shacoHead = (git rev-parse HEAD).Trim()
      harnessHead = $harnessHead
      harnessPackage = $harnessPackage
      harnessLockSha256 = $lockSha
      harnessCleanBefore = $harnessStatusBefore.Count -eq 0
      harnessCleanAfter = $harnessStatusAfter.Count -eq 0
      nodeVersion = (node --version).Trim()
      electronVersion = '35.7.5'
      windowsVersion = [System.Environment]::OSVersion.VersionString
      powerShellVersion = $PSVersionTable.PSVersion.ToString()
    }
    identities = [ordered]@{
      currentUserSidHashPrefix = Get-HashPrefix $currentSid
      workerIdentityHashPrefix = Get-HashPrefix $workerId
      endpointIdentityHashPrefix = Get-HashPrefix $endpointId
      pipeEndpointHashPrefix = Get-HashPrefix $pipeName
      pipeEndpointRedacted = $true
      ephemeralSecretPersisted = $false
      browserAuthCookieUsed = $false
    }
    profileValidation = $validation
    workerReady = $workerReady
    dshReady = $dshReady
    electron = $electronResult
    worker = $workerSummary
    dsh = $dshSummary
    tcp = [ordered]@{
      matchingListenersDuringRun = $listenerSnapshot
      noMatchingTcpListener = $listenerSnapshot.Count -eq 0
    }
    processCleanup = [ordered]@{
      observedPids = $allPids
      residualPids = $residualPids
      noResidualProcesses = $residualPids.Count -eq 0
    }
    gates = [ordered]@{
      realWindowsNamedPipe = $true
      currentUserSidAcl = $workerReady.currentUserOnly -and $workerReady.aclProtected
      authenticationBeforeGateway = $negativePass
      rendererIsolated = -not $electronResult.rendererIsolation.directNamedPipeAccess -and -not $electronResult.rendererIsolation.reusableWorkerCredentialExposed
      p0sUnaryPass = $electronResult.unary.pass
      p0sStreamPass = $electronResult.streams.normal.pass -and $electronResult.streams.producerError.pass -and $electronResult.streams.consumerCancel.pass -and $electronResult.streams.concurrent.pass -and $electronResult.streams.backpressure.pass -and $electronResult.streams.connectionLoss.pass
      p0sEventGenerationPass = $electronResult.events.pass
      p0sApprovalPass = $electronResult.approval.pass
      p0sUserQuestionPass = $electronResult.userQuestion.pass
      p0sCancelPass = $electronResult.explicitCancel.pass
      p0sBinaryCarrierPass = $electronResult.binary.pass
      p0sNativePickerOrEquivalentPass = $electronResult.nativePicker.pass
      p0s4NoDuplicateApprovalSettlement = $electronResult.approval.hostSettlementCount -eq 1 -and $electronResult.approval.durableDecisionCount -eq 1
      p0s4NoDuplicateUserQuestionSettlement = $electronResult.userQuestion.hostSettlementCount -eq 1
      p0sLocalCarrierFeasible = $electronResult.unary.pass -and $electronResult.streams.normal.pass -and $electronResult.events.pass
      partialFrameAssembly = $workerSummary.framesRequiringMultipleReads -gt 0 -and $electronResult.framing.parser.parserPartialWaits -gt 0
      boundedQueuesAndFrames = $workerSummary.maxDshResponseQueueDepth -le $workerSummary.dshResponseQueueCapacity -and $dshSummary.maxStreamCreditsObserved -le $dshReady.streamCreditLimit -and $dshSummary.maxBinaryCreditsObserved -le 4 -and $dshSummary.binaryPeakChunkBytes -le $dshReady.binaryChunkBytes -and $electronResult.boundedResources.finalResourceCleanupPass -and $electronResult.boundedResources.finalActiveStreams -eq 0 -and $electronResult.boundedResources.finalActiveBinaries -eq 0
      malformedAndOversizeFailClosed = $negativePass
      noBrowserAuthCookie = -not $electronResult.authentication.browserAuthCookieUsed
      noStockWebStack = -not $validation.hasDshWebApp -and -not $validation.hasHostWebserver
      noTcpListener = $listenerSnapshot.Count -eq 0
      noResidualProcesses = $residualPids.Count -eq 0
      harnessFinalClean = $harnessStatusAfter.Count -eq 0
    }
    adapters = @(
      [ordered]@{
        surface = 'Electron Main Named Pipe Connection adapter'
        purpose = 'Map authenticated local pipe frames to Connection Fetch and Gateway wireStream'
        publicOrPreviewSeamUsed = 'HostConnectionService package-root API; TypertGateway.wireStream'
        notProduction = $true
        productionImpact = 'NONE'
        changesDesktopWorkerArchitecture = $false
        corePatchRequired = $false
      }
      [ordered]@{
        surface = 'P0.S-4 deterministic Remote/Exact fixture'
        purpose = 'Reproduce stream end/error and exact binary edge cases through real dispatch'
        publicOrPreviewSeamUsed = 'TypertRemoteService/Remote; connection.fetch.register'
        notProduction = $true
        productionImpact = 'NONE'
        changesDesktopWorkerArchitecture = $false
        corePatchRequired = $false
      }
      [ordered]@{
        surface = 'Desktop generation adapter'
        purpose = 'Publish connection/reset only after real $events.ready'
        publicOrPreviewSeamUsed = '$events via TypertGateway.wireStream'
        notProduction = $true
        productionImpact = 'NONE'
        changesDesktopWorkerArchitecture = $false
        corePatchRequired = $false
      }
      [ordered]@{
        surface = 'Electron native picker adapter'
        purpose = 'Desktop-equivalent real Windows directory selection'
        publicOrPreviewSeamUsed = 'Electron dialog.showOpenDialog'
        notProduction = $true
        productionImpact = 'NONE'
        changesDesktopWorkerArchitecture = $false
        corePatchRequired = $false
      }
    )
    sourceSha256 = $sourceHashes
    outputStreamsEmpty = [ordered]@{
      electronStdout = [string]::IsNullOrWhiteSpace($electronStdout)
      electronStderr = [string]::IsNullOrWhiteSpace($electronStderr)
      workerStdout = [string]::IsNullOrWhiteSpace($workerStdout)
      workerStderr = [string]::IsNullOrWhiteSpace($workerStderr)
    }
  }
  Write-Utf8Json (Join-Path $evidenceRoot 'summary.json') $summary
  $summary | ConvertTo-Json -Depth 40
  if (-not $resultPass) { exit 1 }
} finally {
  if ($null -ne $electronProcess) { Stop-ExactProcessTree $electronProcess }
  if ($null -ne $workerProcess) { Stop-ExactProcessTree $workerProcess }
  if (Test-Path -LiteralPath $workerReadyFile) {
    try {
      $cleanupReady = Read-Json $workerReadyFile
      Stop-Process -Id ([int]$cleanupReady.dshPid) -Force -ErrorAction SilentlyContinue
    } catch {
      # Best-effort exact cleanup for a child whose parent already exited.
    }
  }
  $ephemeralSecret = $null
  $pipeName = $null
}
