param(
  [Parameter(Mandatory = $true)]
  [string]$FrozenHarnessRoot,

  [int]$FirstObservationSeconds = 20,

  [int]$SecondObservationSeconds = 10
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$experimentRoot = $PSScriptRoot
$runtimeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("shaco-forge-p0s1-{0}" -f [guid]::NewGuid().ToString('N'))
$profileRoot = Join-Path $runtimeRoot 'profiles\shaco-host'
$bundleRoot = Join-Path $profileRoot 'node_modules\@shaco-forge\not-production-p0s1-host-bundle'
$workspaceRoot = Join-Path $runtimeRoot 'workspace'
$cliBin = Join-Path $FrozenHarnessRoot 'apps\cli\lib\bin.js'
$nodePath = (Get-Command node -ErrorAction Stop).Source

function Write-Utf8Json([string]$Path, [object]$Value) {
  $parent = Split-Path -Parent $Path
  [System.IO.Directory]::CreateDirectory($parent) | Out-Null
  $json = $Value | ConvertTo-Json -Depth 30
  [System.IO.File]::WriteAllText($Path, "$json`n", $utf8NoBom)
}

function Start-DshProcess([string[]]$Arguments, [hashtable]$Environment) {
  $info = [System.Diagnostics.ProcessStartInfo]::new()
  $info.FileName = $nodePath
  $info.WorkingDirectory = $workspaceRoot
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
    throw 'Failed to start the frozen dsh launcher.'
  }
  return $process
}

function Invoke-DshValidation {
  $process = Start-DshProcess @($cliBin, '--profile', 'shaco-host', '--dump-config') @{
    DSH_HOME = $runtimeRoot
  }
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.WaitForExit()
  $stdout = $stdoutTask.GetAwaiter().GetResult()
  $stderr = $stderrTask.GetAwaiter().GetResult()
  [System.IO.File]::WriteAllText((Join-Path $runtimeRoot 'dump-config.stdout.txt'), $stdout, $utf8NoBom)
  [System.IO.File]::WriteAllText((Join-Path $runtimeRoot 'dump-config.stderr.txt'), $stderr, $utf8NoBom)
  return [ordered]@{
    command = "$nodePath $cliBin --profile shaco-host --dump-config"
    exitCode = $process.ExitCode
    hasBase = $stdout.Contains("name: '@deepseek-ai/dsh-agent-loop'")
    hasLocalBundle = $stdout.Contains("@shaco-forge/not-production-p0s1-host-bundle")
    hasDshWebApp = $stdout.Contains("name: '@deepseek-ai/dsh-web-app'")
    hasHostWebserver = $stdout.Contains("name: '@deepseek-ai/dsh-host-webserver'")
    hasClientHmr = $stdout.Contains("name: '@deepseek-ai/dsh-client-hmr'")
    hasClientModules = $stdout.Contains("name: '@deepseek-ai/dsh-client-modules'")
    stderr = $stderr
  }
}

function Get-ProcessListeners([int]$ProcessId) {
  $rows = [System.Collections.Generic.List[object]]::new()
  try {
    Get-NetTCPConnection -State Listen -OwningProcess $ProcessId -ErrorAction Stop | ForEach-Object {
      $rows.Add([ordered]@{
        localAddress = $_.LocalAddress
        localPort = $_.LocalPort
        owningProcess = $_.OwningProcess
      })
    }
  } catch {
    # No rows is the expected result for this non-listening Host profile.
  }
  return ,$rows.ToArray()
}

function Get-ChildProcessRows([int]$ProcessId) {
  $rows = [System.Collections.Generic.List[object]]::new()
  try {
    Get-CimInstance Win32_Process -Filter "ParentProcessId = $ProcessId" -ErrorAction Stop | ForEach-Object {
      $rows.Add([ordered]@{
        processId = [int]$_.ProcessId
        name = [string]$_.Name
      })
    }
  } catch {
    # An empty snapshot is expected after the safe one-shot tool probes finish.
  }
  return ,$rows.ToArray()
}

function Invoke-HostRun([int]$RunNumber, [int]$ObservationSeconds) {
  $runRoot = Join-Path $runtimeRoot ("run-{0}" -f $RunNumber)
  [System.IO.Directory]::CreateDirectory($runRoot) | Out-Null
  $readyFile = Join-Path $runRoot 'ready.json'
  $failureFile = Join-Path $runRoot 'failure.json'
  $heartbeatFile = Join-Path $runRoot 'heartbeat.json'
  $disposedFile = Join-Path $runRoot 'disposed.json'
  $stopFile = Join-Path $runRoot 'stop.request'
  $startedAt = [DateTimeOffset]::UtcNow

  $process = Start-DshProcess @($cliBin, '--profile', 'shaco-host') @{
    DSH_HOME = $runtimeRoot
    P0S1_READY_FILE = $readyFile
    P0S1_FAILURE_FILE = $failureFile
    P0S1_HEARTBEAT_FILE = $heartbeatFile
    P0S1_DISPOSED_FILE = $disposedFile
    P0S1_STOP_FILE = $stopFile
    P0S1_WORKSPACE = $workspaceRoot
    DSH_TELEMETRY_DISABLED = '1'
  }
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $processName = $process.ProcessName

  $deadline = [DateTimeOffset]::UtcNow.AddSeconds(60)
  while (-not (Test-Path -LiteralPath $readyFile) -and -not (Test-Path -LiteralPath $failureFile) -and -not $process.HasExited) {
    if ([DateTimeOffset]::UtcNow -ge $deadline) {
      break
    }
    Start-Sleep -Milliseconds 200
  }

  $ready = Test-Path -LiteralPath $readyFile
  $failure = Test-Path -LiteralPath $failureFile
  $aliveAtReady = -not $process.HasExited
  $readyAt = [DateTimeOffset]::UtcNow
  $listenersAtReady = if ($aliveAtReady) { Get-ProcessListeners $process.Id } else { @() }
  $childrenAtReady = if ($aliveAtReady) { Get-ChildProcessRows $process.Id } else { @() }

  if ($ready -and $aliveAtReady) {
    $observationDeadline = [DateTimeOffset]::UtcNow.AddSeconds($ObservationSeconds)
    while ([DateTimeOffset]::UtcNow -lt $observationDeadline -and -not $process.HasExited) {
      Start-Sleep -Milliseconds 250
    }
  }

  $aliveAfterObservation = -not $process.HasExited
  $listenersAfterObservation = if ($aliveAfterObservation) { Get-ProcessListeners $process.Id } else { @() }
  $childrenAfterObservation = if ($aliveAfterObservation) { Get-ChildProcessRows $process.Id } else { @() }
  if (-not $process.HasExited) {
    [System.IO.File]::WriteAllText($stopFile, "stop`n", $utf8NoBom)
    if (-not $process.WaitForExit(30000)) {
      Stop-Process -Id $process.Id -Force
      $process.WaitForExit()
    }
  }

  $stdout = $stdoutTask.GetAwaiter().GetResult()
  $stderr = $stderrTask.GetAwaiter().GetResult()
  [System.IO.File]::WriteAllText((Join-Path $runRoot 'stdout.txt'), $stdout, $utf8NoBom)
  [System.IO.File]::WriteAllText((Join-Path $runRoot 'stderr.txt'), $stderr, $utf8NoBom)

  $readyEvidence = if ($ready) { Get-Content -Raw -LiteralPath $readyFile | ConvertFrom-Json -Depth 30 } else { $null }
  $failureEvidence = if ($failure) { Get-Content -Raw -LiteralPath $failureFile | ConvertFrom-Json -Depth 30 } else { $null }
  $disposed = Test-Path -LiteralPath $disposedFile

  return [ordered]@{
    runNumber = $RunNumber
    command = "$nodePath $cliBin --profile shaco-host"
    pid = $process.Id
    processName = $processName
    startedAt = $startedAt.ToString('o')
    readyObservedAt = $readyAt.ToString('o')
    observationSeconds = $ObservationSeconds
    ready = $ready
    failure = $failure
    aliveAtReady = $aliveAtReady
    aliveAfterObservation = $aliveAfterObservation
    listenersAtReady = $listenersAtReady
    listenersAfterObservation = $listenersAfterObservation
    childrenAtReady = $childrenAtReady
    childrenAfterObservation = $childrenAfterObservation
    gracefulStopRequested = Test-Path -LiteralPath $stopFile
    gracefulDisposalObserved = $disposed
    exitCode = $process.ExitCode
    readyEvidence = $readyEvidence
    failureEvidence = $failureEvidence
    stdout = $stdout
    stderr = $stderr
  }
}

if (-not (Test-Path -LiteralPath $cliBin -PathType Leaf)) {
  throw "Frozen built dsh launcher not found: $cliBin"
}
if (Test-Path -LiteralPath $runtimeRoot) {
  throw "Refusing to reuse runtime path: $runtimeRoot"
}

[System.IO.Directory]::CreateDirectory($profileRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($bundleRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($workspaceRoot) | Out-Null
Copy-Item -LiteralPath (Join-Path $experimentRoot 'profile\package.json') -Destination (Join-Path $profileRoot 'package.json')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'profile\cordis.patch.yml') -Destination (Join-Path $profileRoot 'cordis.patch.yml')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\package.json') -Destination (Join-Path $bundleRoot 'package.json')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\cordis.patch.yml') -Destination (Join-Path $bundleRoot 'cordis.patch.yml')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\connection-compatibility.mjs') -Destination (Join-Path $bundleRoot 'connection-compatibility.mjs')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\question-answerer.mjs') -Destination (Join-Path $bundleRoot 'question-answerer.mjs')
Copy-Item -LiteralPath (Join-Path $experimentRoot 'bundle\probe.mjs') -Destination (Join-Path $bundleRoot 'probe.mjs')

$validation = Invoke-DshValidation
$firstRun = Invoke-HostRun 1 $FirstObservationSeconds
$secondRun = Invoke-HostRun 2 $SecondObservationSeconds
$result = [ordered]@{
  classification = 'NOT_PRODUCTION'
  runtimeRoot = $runtimeRoot
  frozenHarnessRoot = (Resolve-Path -LiteralPath $FrozenHarnessRoot).Path
  nodePath = $nodePath
  cliBin = $cliBin
  profileName = 'shaco-host'
  profileIdentity = '@shaco-forge/not-production-p0s1-host-profile'
  bundleIdentity = '@shaco-forge/not-production-p0s1-host-bundle'
  validation = $validation
  runs = @($firstRun, $secondRun)
}
Write-Utf8Json (Join-Path $runtimeRoot 'spike-result.json') $result
$result | ConvertTo-Json -Depth 30
