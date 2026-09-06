param(
    [Parameter(Mandatory = $true)]
    [string]$RecoveryRoot
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
    $json = $Value | ConvertTo-Json -Depth 20
    $text = $json.Replace("`r`n", "`n").TrimEnd("`r", "`n") + "`n"
    [System.IO.File]::WriteAllText($Path, $text, $utf8)
}

$root = [System.IO.Path]::GetFullPath($RecoveryRoot)
$repo = (git rev-parse --show-toplevel | Out-String).Trim().Replace('/', '\')
$mecRoot = Join-Path $repo 'docs\04-development-records\experiments\P0S-6-MINIMAL-CLIENT-MODULES'
$harnessRoot = 'D:\Project\Shaco-Forge-Upstream\deepseek-harness'
$pwshPath = (Resolve-Path -LiteralPath (Get-Process -Id $PID).Path).Path
$nodePath = 'D:\Development\nodejs\node.exe'
$npmLauncher = 'D:\Development\nodejs\npm.cmd'
$npmPackageJson = 'D:\Development\nodejs\node_modules\npm\package.json'

$npmVersion = ([System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes($npmPackageJson)
) | ConvertFrom-Json).version

$sourcePreflightPath = Join-Path $mecRoot 'evidence\76bc4e8a-fb0c-4e92-a750-b555e6a57e41\preflight.json'
$sourcePreflight = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes($sourcePreflightPath)
) | ConvertFrom-Json

$sourceFiles = @($sourcePreflight.sourceFiles | ForEach-Object {
    $identity = Get-FileIdentity (Join-Path $mecRoot $_.path)
    [ordered]@{
        path = $_.path
        bytes = $identity.bytes
        expectedSha256 = $_.sha256
        actualSha256 = $identity.sha256
        match = ($identity.sha256 -eq $_.sha256)
    }
})

$protectedDefinitions = @(
    [ordered]@{
        path = Join-Path $repo 'docs\03-v1.0-plan\P0S-6-MINIMAL-EXECUTION-CONTRACT.md'
        expectedSha256 = '2ee6e755a7694acda4b30e2bbaf698ae4ebafe84dec7bc102dbbe2d29318325d'
    },
    [ordered]@{
        path = Join-Path $mecRoot 'evidence\999bbd1e-9301-49ad-9021-30da7c879f9e\attempt.json'
        expectedSha256 = 'bdcbd0579238f07fff28e420b1529cf9cf13fe38652cb6d18dd5d0bc11a77d46'
    },
    [ordered]@{
        path = Join-Path $mecRoot 'evidence\76bc4e8a-fb0c-4e92-a750-b555e6a57e41\attempt.json'
        expectedSha256 = 'c6646264f2cb6e20d59d6dc913d8dc1753557b192a472ccc48c16b09a6107a88'
    },
    [ordered]@{
        path = $sourcePreflightPath
        expectedSha256 = 'bc1dfb1e1f2537e2f1f8eb999b21037af4c662053637ec3d84199388d7fc03e5'
    }
)

$protectedFiles = @($protectedDefinitions | ForEach-Object {
    $identity = Get-FileIdentity $_.path
    [ordered]@{
        path = $_.path
        bytes = $identity.bytes
        expectedSha256 = $_.expectedSha256
        actualSha256 = $identity.sha256
        match = ($identity.sha256 -eq $_.expectedSha256)
    }
})

$packageIdentity = Get-FileIdentity (Join-Path $root 'package.json')
$lockIdentity = Get-FileIdentity (Join-Path $root 'package-lock.json')
$userNpmrcIdentity = Get-FileIdentity (Join-Path $root 'config\empty-user.npmrc')
$globalNpmrcIdentity = Get-FileIdentity (Join-Path $root 'config\empty-global.npmrc')
$lock = [System.Text.UTF8Encoding]::new($false, $true).GetString(
    [System.IO.File]::ReadAllBytes((Join-Path $root 'package-lock.json'))
) | ConvertFrom-Json -AsHashtable

$installScripts = @()
foreach ($key in $lock.packages.Keys) {
    $entry = $lock.packages[$key]
    if ($entry.ContainsKey('hasInstallScript') -and $entry.hasInstallScript -eq $true) {
        $installScripts += [ordered]@{
            path = $key
            version = $entry.version
            resolved = $entry.resolved
            integrity = $entry.integrity
            hasInstallScript = $true
        }
    }
}

$npmrcScannedPaths = @()
$npmrcFound = @()
$cursor = [System.IO.DirectoryInfo]::new($root)
while ($null -ne $cursor) {
    $candidate = Join-Path $cursor.FullName '.npmrc'
    $npmrcScannedPaths += $candidate
    if ([System.IO.File]::Exists($candidate)) {
        $identity = Get-FileIdentity $candidate
        $npmrcFound += $identity
    }
    $cursor = $cursor.Parent
}

$contractForbiddenVariables = @(
    'ELECTRON_MIRROR',
    'ELECTRON_NIGHTLY_MIRROR',
    'ELECTRON_CUSTOM_DIR',
    'ELECTRON_CUSTOM_FILENAME',
    'ELECTRON_CUSTOM_VERSION',
    'electron_use_remote_checksums',
    'force_no_cache',
    'ELECTRON_GET_USE_PROXY',
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'ALL_PROXY',
    'http_proxy',
    'https_proxy',
    'all_proxy'
)
$additionalNeutralizedPatterns = @(
    'proxy',
    'node_path',
    'node_options',
    'node_extra_ca_certs',
    'node_tls_reject_unauthorized',
    'node_use_env_proxy',
    'node_compile_cache',
    'node_debug',
    'ssl_cert_file',
    'ssl_cert_dir',
    'sslkeylogfile',
    'openssl_conf',
    'npm_token',
    'node_auth_token'
)
$parentEnvironmentNamesToRemove = @()
foreach ($item in Get-ChildItem Env:) {
    $lower = $item.Name.ToLowerInvariant()
    if ($lower.StartsWith('npm_config_', [System.StringComparison]::Ordinal) -or
        $contractForbiddenVariables.Where({ $_.ToLowerInvariant() -eq $lower }).Count -gt 0 -or
        $additionalNeutralizedPatterns.Where({ $lower -like ('*' + $_ + '*') }).Count -gt 0) {
        $parentEnvironmentNamesToRemove += $item.Name
    }
}

$effectiveConfig = [ordered]@{
    schema = 'P0S6_DRRC_EFFECTIVE_CONFIG_V1'
    recoveryRoot = $root
    homePolicy = 'PRESERVE_PARENT_HOME_UNCHANGED'
    requiredEnvironment = [ordered]@{
        npm_config_cache = Join-Path $root '.npm-cache'
        electron_config_cache = Join-Path $root '.electron-cache'
        npm_config_userconfig = Join-Path $root 'config\empty-user.npmrc'
        npm_config_globalconfig = Join-Path $root 'config\empty-global.npmrc'
        npm_config_registry = 'https://registry.npmjs.org/'
        TEMP = Join-Path $root 'temp'
        TMP = Join-Path $root 'temp'
        ELECTRON_INSTALL_PLATFORM = 'win32'
        ELECTRON_INSTALL_ARCH = 'x64'
    }
    contractForbiddenVariables = @($contractForbiddenVariables | ForEach-Object {
        [ordered]@{ name = $_; childState = 'ABSENT' }
    })
    additionalNeutrality = [ordered]@{
        removedParentVariableNames = @($parentEnvironmentNamesToRemove | Sort-Object -Unique)
        nodePath = 'ABSENT'
        nodeOptions = 'ABSENT'
        tlsInjection = 'ABSENT'
        authTokenVariables = 'ABSENT'
        registryOverride = 'ABSENT_EXCEPT_REQUIRED_OFFICIAL_REGISTRY'
    }
    npmrcInventory = [ordered]@{
        scannedPaths = $npmrcScannedPaths
        found = $npmrcFound
        contractUserNpmrc = $userNpmrcIdentity
        contractGlobalNpmrc = $globalNpmrcIdentity
    }
    frozenCommand = 'npm ci --ignore-scripts=false --foreground-scripts --no-audit --no-fund --cache .npm-cache --prefer-online'
    validationCommand = 'npm ls --all --json'
    networkQualification = [ordered]@{
        status = 'PASS'
        authorityInput = 'OWNER_PROVIDED_PRIOR_READ_ONLY_QUALIFICATION'
        retryAuthorized = $false
        finalElectronAssetHost = 'release-assets.githubusercontent.com'
    }
}

$gitStatus = @(git status --porcelain=v1 --untracked-files=normal)
$expectedStatus = @(
    '?? docs/04-development-records/experiments/P0S-6-DEPENDENCY-READINESS-RECOVERY/',
    '?? docs/04-development-records/experiments/P0S-6-MINIMAL-CLIENT-MODULES/'
)
$harnessLock = Get-FileIdentity (Join-Path $harnessRoot 'pnpm-lock.yaml')
$pwshItem = Get-Item -LiteralPath $pwshPath
$pwshSignature = Get-AuthenticodeSignature -LiteralPath $pwshPath

$gates = [ordered]@{
    currentDirectory = ((Get-Location).Path -eq $repo)
    branch = ((git branch --show-current | Out-String).Trim() -eq 'master')
    head = ((git rev-parse HEAD | Out-String).Trim() -eq '86c156f1371af0429eed9de4b82a83198781ec62')
    contractSha256 = ((Get-FileHash -LiteralPath (Join-Path $repo 'docs\03-v1.0-plan\P0S-6-DEPENDENCY-READINESS-RECOVERY-CONTRACT.md') -Algorithm SHA256).Hash.ToLowerInvariant() -eq '5382c001c8e6445507e807633b98f7d44acfc40e409960b8fc6055241d4e47eb')
    trackedDiffEmpty = (@(git diff --name-only).Count -eq 0)
    stagedDiffEmpty = (@(git diff --cached --name-only).Count -eq 0)
    statusExact = (($gitStatus -join "`n") -eq ($expectedStatus -join "`n"))
    powershellOwnerDisposition = ($PSVersionTable.PSVersion.ToString() -eq '7.6.5' -and $PSVersionTable.PSEdition -eq 'Core' -and [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture.ToString() -eq 'X64' -and (Get-FileHash -LiteralPath $pwshPath -Algorithm SHA256).Hash.ToLowerInvariant() -eq '362a356ce7f0940ec74f73a8fc2c990a2cc24a38a11c90bbd8eca947110ad139')
    nodeIdentity = ($nodePath -eq (Resolve-Path -LiteralPath $nodePath).Path -and $((Get-Item -LiteralPath $nodePath).VersionInfo.FileVersion) -eq '24.18.0')
    npmIdentity = ($npmVersion -eq '11.16.0')
    frozenPackage = ($packageIdentity.bytes -eq 325 -and $packageIdentity.sha256 -eq '4486d5bab3bf14ff40626f7c607470cd888ca6c35105112c3f6d3d658ddb5b65')
    frozenLock = ($lockIdentity.bytes -eq 30829 -and $lockIdentity.sha256 -eq '3c7449945b509028c025f2a747b0c9b4f74be260cc3cde8ca07e9d5dddee33fd')
    frozenMecSources = (@($sourceFiles | Where-Object { -not $_.match }).Count -eq 0)
    frozenProtectedFiles = (@($protectedFiles | Where-Object { -not $_.match }).Count -eq 0)
    harnessHead = ((git -C $harnessRoot rev-parse HEAD | Out-String).Trim() -eq 'cd5ef8148158c3a752a658978873241fdf8e2bbc')
    harnessDetached = ([string]::IsNullOrEmpty((git -C $harnessRoot branch --show-current | Out-String).Trim()))
    harnessClean = (@(git -C $harnessRoot status --porcelain=v1 --untracked-files=normal).Count -eq 0)
    harnessLock = ($harnessLock.sha256 -eq '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1')
    npmrcNeutral = ($npmrcFound.Count -eq 0)
    emptyUserNpmrc = ($userNpmrcIdentity.bytes -eq 0 -and $userNpmrcIdentity.sha256 -eq 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    emptyGlobalNpmrc = ($globalNpmrcIdentity.bytes -eq 0 -and $globalNpmrcIdentity.sha256 -eq 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    nodeModulesEmpty = (@(Get-ChildItem -LiteralPath (Join-Path $root 'node_modules') -Force).Count -eq 0)
    npmCacheEmpty = (@(Get-ChildItem -LiteralPath (Join-Path $root '.npm-cache') -Force).Count -eq 0)
    electronCacheEmpty = (@(Get-ChildItem -LiteralPath (Join-Path $root '.electron-cache') -Force).Count -eq 0)
    lockfileJsonValid = ($lock.lockfileVersion -eq 3)
    installScriptAllowlist = ($installScripts.Count -eq 1 -and $installScripts[0].path -eq 'node_modules/electron' -and $installScripts[0].version -eq '35.7.5' -and $installScripts[0].resolved -eq 'https://registry.npmjs.org/electron/-/electron-35.7.5.tgz' -and $installScripts[0].integrity -eq 'sha512-dnL+JvLraKZl7iusXTVTGYs10TKfzUi30uEDTqsmTm0guN9V2tbOjTzyIZbh9n3ygUjgEYyo+igAwMRXIi3IPw==')
}
$allPass = (@($gates.GetEnumerator() | Where-Object { $_.Value -ne $true }).Count -eq 0)

$preflight = [ordered]@{
    schema = 'P0S6_DRRC_PREPARATION_PREFLIGHT_V1'
    contractId = 'P0S6-DRRC-20260904-01'
    ownerDispositionId = 'P0S6-DRRC-OD-20260904-PS765-01'
    capturedUtc = [DateTimeOffset]::UtcNow.ToString('o')
    authority = [ordered]@{
        branch = (git branch --show-current | Out-String).Trim()
        head = (git rev-parse HEAD | Out-String).Trim()
        parent = (git rev-parse HEAD^ | Out-String).Trim()
        contractSha256 = (Get-FileHash -LiteralPath (Join-Path $repo 'docs\03-v1.0-plan\P0S-6-DEPENDENCY-READINESS-RECOVERY-CONTRACT.md') -Algorithm SHA256).Hash.ToLowerInvariant()
        initialNetworkQualification = 'PASS'
    }
    machine = [ordered]@{
        userContext = 'CURRENT_INTERACTIVE_OWNER_MACHINE_USER'
        os = [System.Environment]::OSVersion.VersionString
        osArchitecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
        powershell = [ordered]@{
            version = $PSVersionTable.PSVersion.ToString()
            edition = $PSVersionTable.PSEdition
            architecture = [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture.ToString()
            canonicalPath = $pwshPath
            bytes = $pwshItem.Length
            sha256 = (Get-FileHash -LiteralPath $pwshPath -Algorithm SHA256).Hash.ToLowerInvariant()
            fileVersion = $pwshItem.VersionInfo.FileVersion
            productVersion = $pwshItem.VersionInfo.ProductVersion
            authenticode = $pwshSignature.Status.ToString()
            signer = if ($pwshSignature.SignerCertificate) { $pwshSignature.SignerCertificate.Subject } else { $null }
        }
        node = [ordered]@{
            canonicalPath = (Resolve-Path -LiteralPath $nodePath).Path
            fileVersion = (Get-Item -LiteralPath $nodePath).VersionInfo.FileVersion
            productVersion = (Get-Item -LiteralPath $nodePath).VersionInfo.ProductVersion
        }
        npm = [ordered]@{
            launcher = $npmLauncher
            cliPackageJson = $npmPackageJson
            version = $npmVersion
        }
    }
    recoveryRoot = $root
    nodeModulesCanonicalPath = [System.IO.Path]::GetFullPath((Join-Path $root 'node_modules'))
    gitStatus = $gitStatus
    frozenInputs = [ordered]@{
        packageJson = $packageIdentity
        packageLockJson = $lockIdentity
        sourceFiles = $sourceFiles
        protectedFiles = $protectedFiles
        harness = [ordered]@{
            root = $harnessRoot
            head = (git -C $harnessRoot rev-parse HEAD | Out-String).Trim()
            branch = (git -C $harnessRoot branch --show-current | Out-String).Trim()
            status = @(git -C $harnessRoot status --porcelain=v1 --untracked-files=normal)
            lock = $harnessLock
        }
    }
    lockfile = [ordered]@{
        version = $lock.lockfileVersion
        packageEntryCount = $lock.packages.Count
        hasInstallScript = $installScripts
    }
    prohibitedHistoricalInputs = [ordered]@{
        mecNodeModules = 'NOT_ACCESSED_AS_INPUT'
        mecNpmCache = 'NOT_ACCESSED_AS_INPUT'
        machineElectronCache = 'NOT_ACCESSED_AS_INPUT'
        quarantine = 'NOT_ACCESSED'
    }
    gates = $gates
    allPass = $allPass
}

Write-JsonUtf8 (Join-Path $root 'config\effective-config.json') $effectiveConfig
Write-JsonUtf8 (Join-Path $root 'config\preflight.json') $preflight
$preflight | ConvertTo-Json -Depth 20

if (-not $allPass) {
    throw 'P0S6 DRRC pre-invocation preflight failed.'
}
