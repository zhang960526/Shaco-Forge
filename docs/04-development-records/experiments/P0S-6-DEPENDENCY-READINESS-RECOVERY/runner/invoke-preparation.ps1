param(
    [Parameter(Mandatory = $true)]
    [string]$RecoveryRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Write-JsonUtf8([string]$Path, $Value) {
    $json = $Value | ConvertTo-Json -Depth 30
    [System.IO.File]::WriteAllText($Path, ($json.Replace("`r`n", "`n").TrimEnd("`r", "`n") + "`n"), $utf8)
}

function Append-Ledger([string]$Path, $Value) {
    $line = ($Value | ConvertTo-Json -Depth 20 -Compress) + "`n"
    [System.IO.File]::AppendAllText($Path, $line, $utf8)
}

function Get-RecursiveNpmLsAnalysis($Root) {
    $problems = [System.Collections.Generic.List[string]]::new()
    $missing = [System.Collections.Generic.List[string]]::new()
    $invalid = [System.Collections.Generic.List[string]]::new()
    $extraneous = [System.Collections.Generic.List[string]]::new()
    $state = @{ visited = 0 }
    function Visit-Node($Node, [string]$Path) {
        if ($null -eq $Node) { return }
        $state.visited++
        $properties = $Node.PSObject.Properties
        if ($null -ne $properties['problems'] -and $null -ne $Node.problems) {
            foreach ($problem in @($Node.problems)) { $problems.Add([string]$problem) }
        }
        if ($null -ne $properties['missing'] -and $Node.missing -eq $true) { $missing.Add($Path) }
        if ($null -ne $properties['invalid'] -and $Node.invalid -eq $true) { $invalid.Add($Path) }
        if ($null -ne $properties['extraneous'] -and $Node.extraneous -eq $true) { $extraneous.Add($Path) }
        if ($null -ne $properties['dependencies'] -and $null -ne $Node.dependencies) {
            foreach ($dependency in $Node.dependencies.PSObject.Properties) {
                Visit-Node $dependency.Value ($Path + '/node_modules/' + $dependency.Name)
            }
        }
    }
    Visit-Node $Root ''
    return [ordered]@{
        nodeCount = $state.visited
        problems = @($problems | Sort-Object -Unique)
        problemCount = @($problems | Sort-Object -Unique).Count
        missing = @($missing | Sort-Object -Unique)
        missingCount = @($missing | Sort-Object -Unique).Count
        invalid = @($invalid | Sort-Object -Unique)
        invalidCount = @($invalid | Sort-Object -Unique).Count
        extraneous = @($extraneous | Sort-Object -Unique)
        extraneousCount = @($extraneous | Sort-Object -Unique).Count
    }
}

function New-NpmProcessInfo([string]$Root, [string]$EvidencePath, [string]$CommandLine) {
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $env:ComSpec
    $psi.Arguments = '/d /s /c "' + $CommandLine + '"'
    $psi.WorkingDirectory = $Root
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    $removed = [System.Collections.Generic.List[string]]::new()
    $exactRemove = @(
        'ELECTRON_MIRROR', 'ELECTRON_NIGHTLY_MIRROR', 'ELECTRON_CUSTOM_DIR',
        'ELECTRON_CUSTOM_FILENAME', 'ELECTRON_CUSTOM_VERSION',
        'electron_use_remote_checksums', 'force_no_cache', 'ELECTRON_GET_USE_PROXY',
        'ELECTRON_CACHE', 'ELECTRON_OVERRIDE_DIST_PATH', 'NODE_PATH', 'NODE_OPTIONS',
        'NODE_EXTRA_CA_CERTS', 'NODE_TLS_REJECT_UNAUTHORIZED', 'NODE_USE_ENV_PROXY',
        'NODE_COMPILE_CACHE', 'NODE_DEBUG', 'SSL_CERT_FILE', 'SSL_CERT_DIR',
        'SSLKEYLOGFILE', 'OPENSSL_CONF', 'NPM_TOKEN', 'NODE_AUTH_TOKEN', 'DEBUG'
    )
    foreach ($key in @($psi.Environment.Keys)) {
        $lower = $key.ToLowerInvariant()
        $shouldRemove = $lower.StartsWith('npm_config_', [System.StringComparison]::Ordinal) -or
            $lower.StartsWith('electron_', [System.StringComparison]::Ordinal) -or
            $lower.Contains('proxy') -or
            $exactRemove.Where({ $_.ToLowerInvariant() -eq $lower }).Count -gt 0
        if ($shouldRemove) {
            $removed.Add($key)
            [void]$psi.Environment.Remove($key)
        }
    }

    $psi.Environment['npm_config_cache'] = Join-Path $Root '.npm-cache'
    $psi.Environment['electron_config_cache'] = Join-Path $Root '.electron-cache'
    $psi.Environment['npm_config_userconfig'] = Join-Path $Root 'config\empty-user.npmrc'
    $psi.Environment['npm_config_globalconfig'] = Join-Path $Root 'config\empty-global.npmrc'
    $psi.Environment['npm_config_registry'] = 'https://registry.npmjs.org/'
    $psi.Environment['TEMP'] = Join-Path $Root 'temp'
    $psi.Environment['TMP'] = Join-Path $Root 'temp'
    $psi.Environment['ELECTRON_INSTALL_PLATFORM'] = 'win32'
    $psi.Environment['ELECTRON_INSTALL_ARCH'] = 'x64'
    $psi.Environment['npm_config_loglevel'] = 'http'
    $psi.Environment['npm_config_logs_dir'] = Join-Path $EvidencePath 'npm-logs'
    $psi.Environment['npm_config_update_notifier'] = 'false'
    $psi.Environment['npm_config_progress'] = 'false'
    $psi.Environment['npm_config_color'] = 'false'
    $psi.Environment['npm_config_audit'] = 'false'
    $psi.Environment['npm_config_fund'] = 'false'

    return [ordered]@{
        processInfo = $psi
        removedNames = @($removed | Sort-Object -Unique)
    }
}

function Invoke-NpmRaw(
    [string]$Root,
    [string]$EvidencePath,
    [string]$CommandLine,
    [string]$StdoutPath,
    [string]$StderrPath
) {
    $spec = New-NpmProcessInfo $Root $EvidencePath $CommandLine
    $psi = $spec.processInfo
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $psi
    $stdoutStream = [System.IO.FileStream]::new($StdoutPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read)
    $stderrStream = [System.IO.FileStream]::new($StderrPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::Read)
    $startedUtc = [DateTimeOffset]::UtcNow.ToString('o')
    try {
        [void]$process.Start()
        $stdoutCopy = $process.StandardOutput.BaseStream.CopyToAsync($stdoutStream)
        $stderrCopy = $process.StandardError.BaseStream.CopyToAsync($stderrStream)
        $socketObservations = @{}
        $samplerErrors = [System.Collections.Generic.List[string]]::new()
        while (-not $process.HasExited) {
            try {
                $rows = @(Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name)
                $descendants = [System.Collections.Generic.HashSet[int]]::new()
                [void]$descendants.Add($process.Id)
                $changed = $true
                while ($changed) {
                    $changed = $false
                    foreach ($row in $rows) {
                        if ($descendants.Contains([int]$row.ParentProcessId) -and $descendants.Add([int]$row.ProcessId)) {
                            $changed = $true
                        }
                    }
                }
                $names = @{}
                foreach ($row in $rows) { $names[[int]$row.ProcessId] = [string]$row.Name }
                foreach ($connection in @(Get-NetTCPConnection -State Established -ErrorAction Stop)) {
                    if ($descendants.Contains([int]$connection.OwningProcess) -and [int]$connection.RemotePort -eq 443) {
                        $key = "$($connection.OwningProcess)|$($connection.RemoteAddress)|$($connection.RemotePort)"
                        if (-not $socketObservations.ContainsKey($key)) {
                            $socketObservations[$key] = [ordered]@{
                                firstObservedUtc = [DateTimeOffset]::UtcNow.ToString('o')
                                processId = [int]$connection.OwningProcess
                                processName = $names[[int]$connection.OwningProcess]
                                remoteAddress = [string]$connection.RemoteAddress
                                remotePort = [int]$connection.RemotePort
                            }
                        }
                    }
                }
            }
            catch {
                $samplerErrors.Add($_.Exception.GetType().Name)
            }
            Start-Sleep -Milliseconds 100
        }
        $process.WaitForExit()
        [System.Threading.Tasks.Task]::WaitAll(@($stdoutCopy, $stderrCopy))
        $endedUtc = [DateTimeOffset]::UtcNow.ToString('o')
        return [ordered]@{
            command = $CommandLine
            startedUtc = $startedUtc
            endedUtc = $endedUtc
            exitCode = $process.ExitCode
            processId = $process.Id
            removedEnvironmentNames = $spec.removedNames
            homePreserved = ($psi.Environment['HOME'] -eq $env:HOME)
            stdoutPath = $StdoutPath
            stderrPath = $StderrPath
            socketObservations = @($socketObservations.Values)
            samplerErrors = @($samplerErrors | Sort-Object -Unique)
        }
    }
    finally {
        $stdoutStream.Dispose()
        $stderrStream.Dispose()
        $process.Dispose()
    }
}

$root = [System.IO.Path]::GetFullPath($RecoveryRoot)
$staticGatesPath = Join-Path $root 'config\static-gates.json'
if (-not [System.IO.File]::Exists($staticGatesPath)) { throw 'STATIC_GATES_EVIDENCE_MISSING' }
$staticGates = [System.Text.UTF8Encoding]::new($false, $true).GetString([System.IO.File]::ReadAllBytes($staticGatesPath)) | ConvertFrom-Json
if ($staticGates.allPass -ne $true) { throw 'STATIC_GATES_NOT_PASS' }
if (@(Get-ChildItem -LiteralPath (Join-Path $root 'node_modules') -Force).Count -ne 0) { throw 'NODE_MODULES_NOT_EMPTY_AT_BOUNDARY' }
if (@(Get-ChildItem -LiteralPath (Join-Path $root '.npm-cache') -Force).Count -ne 0) { throw 'NPM_CACHE_NOT_EMPTY_AT_BOUNDARY' }
if (@(Get-ChildItem -LiteralPath (Join-Path $root '.electron-cache') -Force).Count -ne 0) { throw 'ELECTRON_CACHE_NOT_EMPTY_AT_BOUNDARY' }
if (@(git diff --name-only).Count -ne 0 -or @(git diff --cached --name-only).Count -ne 0) { throw 'TRACKED_OR_STAGED_DRIFT_AT_BOUNDARY' }
if ((git rev-parse HEAD | Out-String).Trim() -ne '86c156f1371af0429eed9de4b82a83198781ec62') { throw 'HEAD_DRIFT_AT_BOUNDARY' }

$preparationId = [Guid]::NewGuid().ToString()
$boundaryUtc = [DateTimeOffset]::UtcNow.ToString('o')
$evidencePath = Join-Path $root ('evidence\' + $preparationId)
[void][System.IO.Directory]::CreateDirectory($evidencePath)
$ledgerPath = Join-Path $evidencePath 'invocation-ledger.jsonl'
Append-Ledger $ledgerPath ([ordered]@{
    sequence = 1
    event = 'DEPENDENCY_PREPARATION_INVOCATION_BOUNDARY_CROSSED'
    utc = $boundaryUtc
    preparationId = $preparationId
    contractId = 'P0S6-DRRC-20260904-01'
    ownerDispositionId = 'P0S6-DRRC-OD-20260904-PS765-01'
    started = 1
    used = 1
    remaining = 0
    physicalRuntimeAttemptsConsumed = 0
})

foreach ($name in @('preflight.json', 'effective-config.json', 'static-gates.json')) {
    [System.IO.File]::Copy((Join-Path $root ('config\' + $name)), (Join-Path $evidencePath $name), $false)
}
[void][System.IO.Directory]::CreateDirectory((Join-Path $evidencePath 'npm-logs'))

$npmCiCommand = 'npm ci --ignore-scripts=false --foreground-scripts --no-audit --no-fund --cache .npm-cache --prefer-online'
$npmCiActual = 'D:\Development\nodejs\npm.cmd ci --ignore-scripts=false --foreground-scripts --no-audit --no-fund --cache .npm-cache --prefer-online'
$npmCi = Invoke-NpmRaw $root $evidencePath $npmCiActual (Join-Path $evidencePath 'npm-ci.stdout.log') (Join-Path $evidencePath 'npm-ci.stderr.log')
$npmCi.command = $npmCiCommand
Write-JsonUtf8 (Join-Path $evidencePath 'npm-ci-result.json') $npmCi
Write-JsonUtf8 (Join-Path $evidencePath 'network-sockets.json') ([ordered]@{
    schema = 'P0S6_DRRC_NETWORK_SOCKET_OBSERVATIONS_V1'
    command = $npmCiCommand
    observations = $npmCi.socketObservations
    samplerErrors = $npmCi.samplerErrors
})
Append-Ledger $ledgerPath ([ordered]@{
    sequence = 2
    event = 'NPM_CI_COMPLETED'
    utc = $npmCi.endedUtc
    command = $npmCiCommand
    invocationCount = 1
    exitCode = $npmCi.exitCode
    used = 1
    remaining = 0
})

if ($npmCi.exitCode -ne 0) {
    $classification = [ordered]@{
        preparationId = $preparationId
        dependencyReadiness = 'INCONCLUSIVE'
        firstFailureBoundary = 'NPM_CI'
        partialOutputDisposition = @('NON_READINESS', 'NON_RUNTIME_INPUT', 'NON_H05_H20_EVIDENCE')
        readyForRecoveryExecutionContractPlanning = $false
    }
    Write-JsonUtf8 (Join-Path $evidencePath 'classification.json') $classification
    Append-Ledger $ledgerPath ([ordered]@{
        sequence = 3
        event = 'FINAL_CLASSIFICATION'
        utc = [DateTimeOffset]::UtcNow.ToString('o')
        dependencyReadiness = 'INCONCLUSIVE'
        firstFailureBoundary = 'NPM_CI'
        used = 1
        remaining = 0
    })
    $classification | ConvertTo-Json -Depth 10
    exit 20
}

$npmLsCommand = 'npm ls --all --json'
$npmLsActual = 'D:\Development\nodejs\npm.cmd ls --all --json'
$npmLs = Invoke-NpmRaw $root $evidencePath $npmLsActual (Join-Path $evidencePath 'npm-ls.stdout.json') (Join-Path $evidencePath 'npm-ls.stderr.log')
$npmLs.command = $npmLsCommand
Write-JsonUtf8 (Join-Path $evidencePath 'npm-ls-result.json') $npmLs
Append-Ledger $ledgerPath ([ordered]@{
    sequence = 3
    event = 'NPM_LS_COMPLETED'
    utc = $npmLs.endedUtc
    command = $npmLsCommand
    invocationCount = 1
    exitCode = $npmLs.exitCode
    used = 1
    remaining = 0
})

$npmLsParseError = $null
$npmLsAnalysis = $null
try {
    $npmLsText = [System.Text.UTF8Encoding]::new($false, $true).GetString([System.IO.File]::ReadAllBytes((Join-Path $evidencePath 'npm-ls.stdout.json')))
    $npmLsJson = $npmLsText | ConvertFrom-Json
    $npmLsAnalysis = Get-RecursiveNpmLsAnalysis $npmLsJson
}
catch {
    $npmLsParseError = $_.Exception.GetType().Name
    $npmLsAnalysis = [ordered]@{
        nodeCount = 0
        problems = @()
        problemCount = 0
        missing = @()
        missingCount = 0
        invalid = @()
        invalidCount = 0
        extraneous = @()
        extraneousCount = 0
    }
}
$npmLsAnalysis['parseError'] = $npmLsParseError
$npmLsAnalysis['exitCode'] = $npmLs.exitCode
$npmLsAnalysis['pass'] = ($npmLs.exitCode -eq 0 -and $null -eq $npmLsParseError -and $npmLsAnalysis.problemCount -eq 0 -and $npmLsAnalysis.missingCount -eq 0 -and $npmLsAnalysis.invalidCount -eq 0 -and $npmLsAnalysis.extraneousCount -eq 0)
Write-JsonUtf8 (Join-Path $evidencePath 'npm-ls-analysis.json') $npmLsAnalysis

if ($npmLsAnalysis.pass -ne $true) {
    $classification = [ordered]@{
        preparationId = $preparationId
        dependencyReadiness = 'INCONCLUSIVE'
        firstFailureBoundary = 'NPM_LS_VALIDATION'
        partialOutputDisposition = @('NON_READINESS', 'NON_RUNTIME_INPUT', 'NON_H05_H20_EVIDENCE')
        readyForRecoveryExecutionContractPlanning = $false
    }
    Write-JsonUtf8 (Join-Path $evidencePath 'classification.json') $classification
    Append-Ledger $ledgerPath ([ordered]@{
        sequence = 4
        event = 'FINAL_CLASSIFICATION'
        utc = [DateTimeOffset]::UtcNow.ToString('o')
        dependencyReadiness = 'INCONCLUSIVE'
        firstFailureBoundary = 'NPM_LS_VALIDATION'
        used = 1
        remaining = 0
    })
    $classification | ConvertTo-Json -Depth 10
    exit 21
}

$handoff = [ordered]@{
    preparationId = $preparationId
    evidencePath = $evidencePath
    invocationBoundaryUtc = $boundaryUtc
    npmCiExitCode = $npmCi.exitCode
    npmLsExitCode = $npmLs.exitCode
    status = 'READY_FOR_STATIC_POST_VALIDATION'
    used = 1
    remaining = 0
}
Write-JsonUtf8 (Join-Path $evidencePath 'post-validation-handoff.json') $handoff
Append-Ledger $ledgerPath ([ordered]@{
    sequence = 4
    event = 'NPM_TREE_VALIDATED_READY_FOR_STATIC_POST_VALIDATION'
    utc = [DateTimeOffset]::UtcNow.ToString('o')
    used = 1
    remaining = 0
})
$handoff | ConvertTo-Json -Depth 10
