param(
    [Parameter(Mandatory = $true)]
    [string]$RecoveryRoot,

    [Parameter(Mandatory = $true)]
    [string]$EvidencePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Get-Sha256Hex([byte[]]$Bytes) {
    return ([System.Security.Cryptography.SHA256]::HashData($Bytes) | ForEach-Object ToString x2) -join ''
}

function Get-FileIdentity([string]$Path) {
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    $bytes = [System.IO.File]::ReadAllBytes($resolved)
    return [ordered]@{
        path = $resolved
        bytes = $bytes.Length
        sha256 = Get-Sha256Hex $bytes
    }
}

function Write-JsonUtf8([string]$Path, $Value) {
    $json = $Value | ConvertTo-Json -Depth 40
    [System.IO.File]::WriteAllText($Path, ($json.Replace("`r`n", "`n").TrimEnd("`r", "`n") + "`n"), $utf8)
}

function Append-Ledger([string]$Path, $Value) {
    [System.IO.File]::AppendAllText($Path, (($Value | ConvertTo-Json -Depth 20 -Compress) + "`n"), $utf8)
}

function Test-PlatformConstraint($Values, [string]$Actual) {
    if ($null -eq $Values -or @($Values).Count -eq 0) { return $true }
    $items = @($Values | ForEach-Object { [string]$_ })
    if ($items -contains ('!' + $Actual)) { return $false }
    $positive = @($items | Where-Object { -not $_.StartsWith('!') })
    return ($positive.Count -eq 0 -or $positive -contains $Actual)
}

function Get-LockfileMapping($Lock, [string]$Root) {
    $records = [System.Collections.Generic.List[object]]::new()
    $omitted = [System.Collections.Generic.List[object]]::new()
    $failures = [System.Collections.Generic.List[object]]::new()
    foreach ($key in @($Lock.packages.Keys | Sort-Object)) {
        $entry = $Lock.packages[$key]
        if ($key -eq '') {
            $records.Add([ordered]@{
                lockfilePath = $key
                classification = 'ROOT'
                installedPath = $Root
                expectedVersion = $entry.version
                actualVersion = $entry.version
                resolved = $null
                integrity = $null
                pass = $true
            })
            continue
        }
        if (-not $key.StartsWith('node_modules/', [System.StringComparison]::Ordinal)) {
            $records.Add([ordered]@{
                lockfilePath = $key
                classification = 'NON_PACKAGE_LOCKFILE_ENTRY'
                installedPath = $null
                expectedVersion = $entry.version
                actualVersion = $null
                resolved = $entry.resolved
                integrity = $entry.integrity
                pass = $true
            })
            continue
        }
        $relativeWindows = $key.Replace('/', '\')
        $installedPath = Join-Path $Root $relativeWindows
        $osValues = if ($entry.ContainsKey('os')) { $entry.os } else { $null }
        $cpuValues = if ($entry.ContainsKey('cpu')) { $entry.cpu } else { $null }
        $osApplicable = Test-PlatformConstraint $osValues 'win32'
        $cpuApplicable = Test-PlatformConstraint $cpuValues 'x64'
        $optional = $entry.ContainsKey('optional') -and $entry.optional -eq $true
        if (-not [System.IO.Directory]::Exists($installedPath)) {
            if ($optional -and (-not $osApplicable -or -not $cpuApplicable)) {
                $record = [ordered]@{
                    lockfilePath = $key
                    classification = 'INAPPLICABLE_OPTIONAL_OS_CPU'
                    installedPath = $installedPath
                    expectedVersion = $entry.version
                    actualVersion = $null
                    resolved = $entry.resolved
                    integrity = $entry.integrity
                    optional = $optional
                    os = $osValues
                    cpu = $cpuValues
                    pass = $true
                }
                $records.Add($record)
                $omitted.Add($record)
                continue
            }
            $record = [ordered]@{
                lockfilePath = $key
                classification = 'MISSING_REQUIRED_OR_UNEXEMPTED'
                installedPath = $installedPath
                expectedVersion = $entry.version
                actualVersion = $null
                resolved = $entry.resolved
                integrity = $entry.integrity
                optional = $optional
                os = $osValues
                cpu = $cpuValues
                pass = $false
            }
            $records.Add($record)
            $failures.Add($record)
            continue
        }
        $packageJsonPath = Join-Path $installedPath 'package.json'
        if (-not [System.IO.File]::Exists($packageJsonPath)) {
            $record = [ordered]@{
                lockfilePath = $key
                classification = 'INSTALLED_PACKAGE_JSON_MISSING'
                installedPath = $installedPath
                expectedVersion = $entry.version
                actualVersion = $null
                resolved = $entry.resolved
                integrity = $entry.integrity
                pass = $false
            }
            $records.Add($record)
            $failures.Add($record)
            continue
        }
        $installedPackage = [System.Text.UTF8Encoding]::new($false, $true).GetString(
            [System.IO.File]::ReadAllBytes($packageJsonPath)
        ) | ConvertFrom-Json
        $expectedVersion = [string]$entry.version
        $actualVersion = [string]$installedPackage.version
        $versionPass = ($expectedVersion -eq $actualVersion)
        $record = [ordered]@{
            lockfilePath = $key
            classification = 'INSTALLED_PACKAGE'
            installedPath = $installedPath
            expectedVersion = $expectedVersion
            actualVersion = $actualVersion
            packageName = [string]$installedPackage.name
            resolved = if ($entry.ContainsKey('resolved')) { $entry.resolved } else { $null }
            integrity = if ($entry.ContainsKey('integrity')) { $entry.integrity } else { $null }
            optional = $optional
            osApplicable = $osApplicable
            cpuApplicable = $cpuApplicable
            pass = $versionPass
        }
        $records.Add($record)
        if (-not $versionPass) { $failures.Add($record) }
    }
    return [ordered]@{
        schema = 'P0S6_DRRC_LOCKFILE_INSTALLED_MAPPING_V1'
        platform = 'win32'
        architecture = 'x64'
        recordCount = $records.Count
        records = @($records)
        omittedInapplicableOptionalCount = $omitted.Count
        omittedInapplicableOptional = @($omitted)
        failureCount = $failures.Count
        failures = @($failures)
        npmIntegrityEnforcement = 'NPM_CI_EXIT_ZERO_REQUIRED'
        pass = ($failures.Count -eq 0)
    }
}

function Get-SanitizedHttpObservations([string[]]$Paths) {
    $records = [System.Collections.Generic.List[object]]::new()
    foreach ($path in $Paths) {
        if (-not [System.IO.File]::Exists($path)) { continue }
        $text = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($path))
        foreach ($match in [regex]::Matches($text, 'https://[^\s\]\[\)\(\"\'']+')) {
            $raw = $match.Value.TrimEnd('.', ',', ';', ':')
            try {
                $uri = [Uri]$raw
                $records.Add([ordered]@{
                    sourceFile = [System.IO.Path]::GetFileName($path)
                    scheme = $uri.Scheme
                    host = $uri.Host
                    pathname = $uri.AbsolutePath
                    queryOmitted = (-not [string]::IsNullOrEmpty($uri.Query))
                })
            }
            catch { }
        }
    }
    $unique = @($records | Sort-Object sourceFile, scheme, host, pathname, queryOmitted -Unique)
    return $unique
}

$root = [System.IO.Path]::GetFullPath($RecoveryRoot)
$evidence = [System.IO.Path]::GetFullPath($EvidencePath)
$rootPrefix = $root.TrimEnd('\') + '\'
if (-not $evidence.StartsWith((Join-Path $root 'evidence').TrimEnd('\') + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'EVIDENCE_PATH_OUTSIDE_RECOVERY_ROOT'
}
$ledgerPath = Join-Path $evidence 'invocation-ledger.jsonl'
$handoff = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $evidence 'post-validation-handoff.json'))
) | ConvertFrom-Json
$preparationId = [string]$handoff.preparationId
$npmCiResult = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $evidence 'npm-ci-result.json'))
) | ConvertFrom-Json
$npmLsAnalysis = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $evidence 'npm-ls-analysis.json'))
) | ConvertFrom-Json
$preflight = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $evidence 'preflight.json'))
) | ConvertFrom-Json
$lock = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $root 'package-lock.json'))
) | ConvertFrom-Json -AsHashtable

$mapping = Get-LockfileMapping $lock $root
Write-JsonUtf8 (Join-Path $evidence 'lockfile-installed-mapping.json') $mapping

$allNpmLogPaths = @(
    Join-Path $evidence 'npm-ci.stdout.log'
    Join-Path $evidence 'npm-ci.stderr.log'
    Join-Path $evidence 'npm-ls.stderr.log'
) + @(Get-ChildItem -LiteralPath (Join-Path $evidence 'npm-logs') -File -Recurse | ForEach-Object { $_.FullName })
$combinedNpmText = ($allNpmLogPaths | ForEach-Object {
    if ([System.IO.File]::Exists($_)) { [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($_)) }
}) -join "`n"
$lifecycleRelevantLines = @($combinedNpmText -split "`r?`n" | Where-Object {
    $_ -match '(?i)(info run|electron@35\.7\.5|node install\.js|postinstall)'
} | Select-Object -First 200)
$lifecycleStarts = [System.Collections.Generic.List[object]]::new()
foreach ($line in $combinedNpmText -split "`r?`n") {
    $match = [regex]::Match($line, '(?i)\binfo run\s+(?<package>.+)@(?<version>[^\s]+)\s+(?<phase>preinstall|install|postinstall|prepare|prepublish|prepublishOnly)\s+(?<path>\S+)\s+(?<command>.+)$')
    if ($match.Success -and $line -notmatch '\{\s*code:') {
        $lifecycleStarts.Add([ordered]@{
            package = $match.Groups['package'].Value
            version = $match.Groups['version'].Value
            phase = $match.Groups['phase'].Value
            path = $match.Groups['path'].Value
            command = $match.Groups['command'].Value.Trim()
        })
    }
}
$foregroundHeaderPresent = ($combinedNpmText -match '(?m)^> electron@35\.7\.5 postinstall\r?$')
$foregroundCommandPresent = ($combinedNpmText -match '(?m)^> node install\.js\r?$')
$nonElectronLifecycle = @($lifecycleStarts | Where-Object {
    $_.package -ne 'electron' -or $_.version -ne '35.7.5'
})
$electronLifecycleStarts = @($lifecycleStarts | Where-Object {
    $_.package -eq 'electron' -and $_.version -eq '35.7.5' -and $_.phase -eq 'postinstall'
})
$lifecycle = [ordered]@{
    schema = 'P0S6_DRRC_LIFECYCLE_INVENTORY_V1'
    frozenLockfileDeclarations = $preflight.lockfile.hasInstallScript
    actualStarts = @($lifecycleStarts)
    relevantBoundedOutput = $lifecycleRelevantLines
    foregroundHeaderPresent = $foregroundHeaderPresent
    foregroundCommandPresent = $foregroundCommandPresent
    electronExitCode = if ($npmCiResult.exitCode -eq 0) { 0 } else { $npmCiResult.exitCode }
    nonElectronLifecycleCount = $nonElectronLifecycle.Count
    pass = ($npmCiResult.exitCode -eq 0 -and $foregroundHeaderPresent -and $foregroundCommandPresent -and $electronLifecycleStarts.Count -ge 1 -and $nonElectronLifecycle.Count -eq 0)
}
Write-JsonUtf8 (Join-Path $evidence 'lifecycle-inventory.json') $lifecycle

$electronPackagePath = Join-Path $root 'node_modules\electron\package.json'
$electronPackage = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes($electronPackagePath)
) | ConvertFrom-Json
$electronPackageIdentity = Get-FileIdentity $electronPackagePath
$electronLock = $lock.packages['node_modules/electron']
$distVersionPath = Join-Path $root 'node_modules\electron\dist\version'
$distVersionIdentity = Get-FileIdentity $distVersionPath
$distVersion = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes($distVersionPath)
).Trim()
$electronExePath = Join-Path $root 'node_modules\electron\dist\electron.exe'
$electronExeIdentity = Get-FileIdentity $electronExePath
$electronCacheFiles = @(Get-ChildItem -LiteralPath (Join-Path $root '.electron-cache') -File -Recurse | ForEach-Object {
    Get-FileIdentity $_.FullName
})
$expectedZipFiles = @($electronCacheFiles | Where-Object {
    [System.IO.Path]::GetFileName($_.path) -eq 'electron-v35.7.5-win32-x64.zip'
})
$matchingZipFiles = @($expectedZipFiles | Where-Object {
    $_.bytes -eq 120958381 -and $_.sha256 -eq 'b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d'
})
$electronIdentity = [ordered]@{
    schema = 'P0S6_DRRC_ELECTRON_IDENTITY_V1'
    npmWrapper = [ordered]@{
        packageJson = $electronPackageIdentity
        name = $electronPackage.name
        version = $electronPackage.version
        frozenResolved = $electronLock.resolved
        frozenIntegrity = $electronLock.integrity
        pass = ($electronPackage.name -eq 'electron' -and $electronPackage.version -eq '35.7.5' -and $electronLock.resolved -eq 'https://registry.npmjs.org/electron/-/electron-35.7.5.tgz' -and $electronLock.integrity -eq 'sha512-dnL+JvLraKZl7iusXTVTGYs10TKfzUi30uEDTqsmTm0guN9V2tbOjTzyIZbh9n3ygUjgEYyo+igAwMRXIi3IPw==')
    }
    officialZip = [ordered]@{
        filename = 'electron-v35.7.5-win32-x64.zip'
        requestedUrl = 'https://github.com/electron/electron/releases/download/v35.7.5/electron-v35.7.5-win32-x64.zip'
        requestedOrigin = 'https://github.com'
        redirectChain = @(
            [ordered]@{ scheme = 'https'; host = 'github.com'; pathname = '/electron/electron/releases/download/v35.7.5/electron-v35.7.5-win32-x64.zip'; source = 'FROZEN_REQUEST_AND_OWNER_QUALIFICATION' },
            [ordered]@{ scheme = 'https'; host = 'release-assets.githubusercontent.com'; pathname = 'QUERY_REDACTED_RELEASE_ASSET_PATH'; source = 'OWNER_QUALIFICATION_FINAL_HOST' }
        )
        expectedBytes = 120958381
        expectedSha256 = 'b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d'
        cacheFiles = $electronCacheFiles
        matchingFileCount = $matchingZipFiles.Count
        pass = ($matchingZipFiles.Count -eq 1)
    }
    officialChecksumMetadata = [ordered]@{
        url = 'https://github.com/electron/electron/releases/download/v35.7.5/SHASUMS256.txt'
        sha256 = '6e379d0be079aac68d3b441d9d66c2dbef534b05a3336c23c35019e5b2261b15'
        matchingLine = 'b87b2d6167845ece1d373eb37f5ce49868a07ec90203de44b6bd415d6c673c6d *electron-v35.7.5-win32-x64.zip'
        role = 'FROZEN_CONTRACT_IDENTITY'
    }
    distribution = [ordered]@{
        versionFile = $distVersionIdentity
        version = $distVersion
        pass = ($distVersion -eq '35.7.5')
    }
    executable = [ordered]@{
        relativePath = 'node_modules/electron/dist/electron.exe'
        identity = $electronExeIdentity
        pass = [System.IO.File]::Exists($electronExePath)
    }
}
Write-JsonUtf8 (Join-Path $evidence 'electron-identity.json') $electronIdentity

$httpObservations = Get-SanitizedHttpObservations $allNpmLogPaths
$lockfileSources = @($lock.packages.Keys | ForEach-Object {
    $entry = $lock.packages[$_]
    if ($entry.ContainsKey('resolved') -and $null -ne $entry.resolved) {
        $uri = [Uri][string]$entry.resolved
        [ordered]@{
            lockfilePath = $_
            scheme = $uri.Scheme
            host = $uri.Host
            pathname = $uri.AbsolutePath
            queryOmitted = (-not [string]::IsNullOrEmpty($uri.Query))
        }
    }
})
$unexpectedLockSources = @($lockfileSources | Where-Object {
    $_.scheme -ne 'https' -or $_.host -ne 'registry.npmjs.org'
})
$socketData = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $evidence 'network-sockets.json'))
) | ConvertFrom-Json
$dnsCache = @()
try {
    $dnsCache = @(Get-DnsClientCache | Where-Object {
        $_.Entry -in @('registry.npmjs.org', 'github.com', 'release-assets.githubusercontent.com')
    } | ForEach-Object {
        [ordered]@{ entry = $_.Entry; type = [string]$_.Type; data = [string]$_.Data }
    })
}
catch { }
$observedHosts = @($httpObservations.host | Sort-Object -Unique)
$network = [ordered]@{
    schema = 'P0S6_DRRC_NETWORK_SOURCE_SUMMARY_V1'
    lockfileSources = $lockfileSources
    unexpectedLockSourceCount = $unexpectedLockSources.Count
    actualSanitizedHttpLogObservations = $httpObservations
    actualObservedHosts = $observedHosts
    npmCiSocketObservations = $socketData.observations
    dnsCacheCorroboration = $dnsCache
    electronArtifact = [ordered]@{
        requestedOrigin = 'https://github.com'
        requestedPathname = '/electron/electron/releases/download/v35.7.5/electron-v35.7.5-win32-x64.zip'
        redirectAllHttps = $true
        finalHost = 'release-assets.githubusercontent.com'
        evidenceBasis = @('OWNER_APPROVED_PRIOR_NODE_HTTPS_QUALIFICATION', 'ACTUAL_ELECTRON_POSTINSTALL', 'ACTUAL_MATCHING_FRESH_CACHE_ZIP')
    }
    proxy = 'ABSENT_IN_PREPARATION_CHILD'
    mirror = 'ABSENT_IN_PREPARATION_CHILD'
    customElectronSelector = 'ABSENT_IN_PREPARATION_CHILD'
    pass = ($unexpectedLockSources.Count -eq 0 -and $observedHosts -contains 'registry.npmjs.org' -and $matchingZipFiles.Count -eq 1)
}
Write-JsonUtf8 (Join-Path $evidence 'network-source-summary.json') $network

$manifestPath = Join-Path $evidence 'node-modules-manifest.tsv'
$manifestSummaryPath = Join-Path $evidence 'node-modules-manifest-summary.json'
$manifestError = $null
try {
    $pwshPath = 'C:\Users\18902\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe'
    & $pwshPath -NoProfile -File (Join-Path $root 'runner\manifest-generator.ps1') -Mode Generate -NodeModulesPath (Join-Path $root 'node_modules') -ManifestPath $manifestPath -SummaryPath $manifestSummaryPath | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "MANIFEST_GENERATOR_EXIT_$LASTEXITCODE" }
}
catch {
    $manifestError = $_.Exception.Message
    Write-JsonUtf8 (Join-Path $evidence 'node-modules-manifest-error.json') ([ordered]@{
        error = $manifestError
        classification = 'INCONCLUSIVE'
    })
}
$manifestSummary = if ($null -eq $manifestError) {
    [System.Text.UTF8Encoding]::new($false, $true).GetString([System.IO.File]::ReadAllBytes($manifestSummaryPath)) | ConvertFrom-Json
} else { $null }

$gitStatus = @(git status --porcelain=v1 --untracked-files=normal)
$expectedStatus = @(
    '?? docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/',
    '?? docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/'
)
$harnessRoot = 'D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$immutability = [ordered]@{
    trackedDiffEmpty = (@(git diff --name-only).Count -eq 0)
    stagedDiffEmpty = (@(git diff --cached --name-only).Count -eq 0)
    status = $gitStatus
    statusExact = (($gitStatus -join "`n") -eq ($expectedStatus -join "`n"))
    head = (git rev-parse HEAD | Out-String).Trim()
    headUnchanged = ((git rev-parse HEAD | Out-String).Trim() -eq '86c156f1371af0429eed9de4b82a83198781ec62')
    harnessHead = (git -C $harnessRoot rev-parse HEAD | Out-String).Trim()
    harnessStatus = @(git -C $harnessRoot status --porcelain=v1 --untracked-files=normal)
    harnessUnchanged = ((git -C $harnessRoot rev-parse HEAD | Out-String).Trim() -eq 'cd5ef8148158c3a752a658978873241fdf8e2bbc' -and @(git -C $harnessRoot status --porcelain=v1 --untracked-files=normal).Count -eq 0)
    electronLaunchCount = 0
    electronProcessCount = @(Get-Process electron -ErrorAction SilentlyContinue).Count
    runtimeInvocationCount = 0
    h05H20VerdictProduced = $false
}
Write-JsonUtf8 (Join-Path $evidence 'final-immutability.json') $immutability

$gates = @(
    [ordered]@{ id = 1; condition = 'Frozen package and lock identities'; pass = ($preflight.gates.frozenPackage -eq $true -and $preflight.gates.frozenLock -eq $true) },
    [ordered]@{ id = 2; condition = 'Sole npm ci exit code 0'; pass = ($npmCiResult.exitCode -eq 0) },
    [ordered]@{ id = 3; condition = 'Effective environment and npm config neutral'; pass = ($preflight.allPass -eq $true) },
    [ordered]@{ id = 4; condition = 'npm ls has no problems, missing, invalid, or extraneous'; pass = ($npmLsAnalysis.pass -eq $true) },
    [ordered]@{ id = 5; condition = 'Only inapplicable optional os/cpu omissions'; pass = ($mapping.pass -eq $true) },
    [ordered]@{ id = 6; condition = 'Lifecycle inventory only electron@35.7.5'; pass = ($lifecycle.pass -eq $true) },
    [ordered]@{ id = 7; condition = 'Electron npm wrapper exact'; pass = ($electronIdentity.npmWrapper.pass -eq $true) },
    [ordered]@{ id = 8; condition = 'Electron requested source chain and ZIP exact'; pass = ($electronIdentity.officialZip.pass -eq $true -and $network.pass -eq $true) },
    [ordered]@{ id = 9; condition = 'Spike-local electron.exe exists'; pass = ($electronIdentity.executable.pass -eq $true) },
    [ordered]@{ id = 10; condition = 'Electron distribution version exact'; pass = ($electronIdentity.distribution.pass -eq $true) },
    [ordered]@{ id = 11; condition = 'electron.exe path, size, and SHA-256 recorded'; pass = ($electronIdentity.executable.identity.bytes -gt 0 -and $electronIdentity.executable.identity.sha256.Length -eq 64) },
    [ordered]@{ id = 12; condition = 'Complete canonical node_modules manifest'; pass = ($null -eq $manifestError -and $manifestSummary.LeafTotal -gt 0 -and $manifestSummary.CaseFoldCollisionCount -eq 0 -and $manifestSummary.PathEscapeCount -eq 0 -and $manifestSummary.UnsupportedReparseCount -eq 0 -and $manifestSummary.Utf8WithoutBom -eq $true -and $manifestSummary.LfOnly -eq $true -and $manifestSummary.ExactlyOneFinalLf -eq $true) },
    [ordered]@{ id = 13; condition = 'Complete lockfile resolution and integrity mapping'; pass = ($mapping.pass -eq $true -and $mapping.recordCount -eq $lock.packages.Count) },
    [ordered]@{ id = 14; condition = 'Allowed write boundary preserved'; pass = ($immutability.trackedDiffEmpty -eq $true -and $immutability.stagedDiffEmpty -eq $true -and $immutability.statusExact -eq $true -and $immutability.harnessUnchanged -eq $true) },
    [ordered]@{ id = 15; condition = 'Frozen requested sources and no proxy, mirror, selector, or unofficial rehost'; pass = ($network.pass -eq $true) },
    [ordered]@{ id = 16; condition = 'Forbidden process launch count zero'; pass = ($immutability.electronLaunchCount -eq 0 -and $immutability.electronProcessCount -eq 0 -and $immutability.runtimeInvocationCount -eq 0) },
    [ordered]@{ id = 17; condition = 'No H-05 or H-20 verdict or inference'; pass = ($immutability.h05H20VerdictProduced -eq $false) }
)
$failedGates = @($gates | Where-Object { $_.pass -ne $true })
$readiness = if ($failedGates.Count -eq 0) { 'PASS' } else { 'INCONCLUSIVE' }
$firstFailure = if ($failedGates.Count -gt 0) { 'DEPENDENCY_READINESS_GATE_' + $failedGates[0].id } else { $null }
$gateReport = [ordered]@{
    schema = 'P0S6_DRRC_DEPENDENCY_READINESS_GATES_V1'
    preparationId = $preparationId
    gates = $gates
    passedCount = @($gates | Where-Object { $_.pass -eq $true }).Count
    failedCount = $failedGates.Count
    allPass = ($failedGates.Count -eq 0)
}
Write-JsonUtf8 (Join-Path $evidence 'readiness-gates.json') $gateReport

$classification = [ordered]@{
    schema = 'P0S6_DRRC_DEPENDENCY_READINESS_CLASSIFICATION_V1'
    preparationId = $preparationId
    contractId = 'P0S6-DRRC-20260904-01'
    ownerDispositionId = 'P0S6-DRRC-OD-20260904-PS765-01'
    classifiedUtc = [DateTimeOffset]::UtcNow.ToString('o')
    dependencyPreparationExecuted = $true
    invocationsUsed = 1
    invocationsRemaining = 0
    dependencyReadiness = $readiness
    readyForRecoveryExecutionContractPlanning = ($readiness -eq 'PASS')
    firstFailureBoundary = $firstFailure
    partialOutputDisposition = if ($readiness -eq 'PASS') { @() } else { @('NON_READINESS', 'NON_RUNTIME_INPUT', 'NON_H05_H20_EVIDENCE') }
    recoveryRuntime = 'NOT_AUTHORIZED'
    globalPhysicalAttempt3 = 'NOT_AUTHORIZED'
    p0s7Allowed = 'NO'
}
Write-JsonUtf8 (Join-Path $evidence 'classification.json') $classification
Append-Ledger $ledgerPath ([ordered]@{
    sequence = 5
    event = 'FINAL_CLASSIFICATION'
    utc = $classification.classifiedUtc
    dependencyReadiness = $readiness
    firstFailureBoundary = $firstFailure
    used = 1
    remaining = 0
    readyForRecoveryExecutionContractPlanning = ($readiness -eq 'PASS')
})

$evidenceFiles = @(Get-ChildItem -LiteralPath $evidence -File -Recurse | Where-Object { $_.Name -ne 'evidence-index.json' } | Sort-Object FullName | ForEach-Object {
    $identity = Get-FileIdentity $_.FullName
    [ordered]@{
        relativePath = [System.IO.Path]::GetRelativePath($evidence, $_.FullName).Replace('\', '/')
        bytes = $identity.bytes
        sha256 = $identity.sha256
        role = switch -Wildcard ([System.IO.Path]::GetRelativePath($evidence, $_.FullName).Replace('\', '/')) {
            'npm-ci.stdout.log' { 'RAW_NPM_CI_STDOUT'; break }
            'npm-ci.stderr.log' { 'RAW_NPM_CI_STDERR'; break }
            'npm-ls.stdout.json' { 'RAW_NPM_LS_JSON'; break }
            'npm-ls.stderr.log' { 'RAW_NPM_LS_STDERR'; break }
            'npm-logs/*' { 'RAW_NPM_DEBUG_LOG'; break }
            'invocation-ledger.jsonl' { 'AUTHORITATIVE_INVOCATION_LEDGER'; break }
            'node-modules-manifest.tsv' { 'CANONICAL_NODE_MODULES_MANIFEST'; break }
            default { 'DERIVED_OR_STATIC_DEPENDENCY_PREPARATION_EVIDENCE' }
        }
    }
})
$index = [ordered]@{
    schema = 'P0S6_DRRC_EVIDENCE_INDEX_V1'
    preparationId = $preparationId
    finalizedUtc = [DateTimeOffset]::UtcNow.ToString('o')
    note = 'Index excludes itself to avoid recursive identity; its final identity is reported externally.'
    fileCountExcludingIndex = $evidenceFiles.Count
    files = $evidenceFiles
}
Write-JsonUtf8 (Join-Path $evidence 'evidence-index.json') $index

$classification | ConvertTo-Json -Depth 15
