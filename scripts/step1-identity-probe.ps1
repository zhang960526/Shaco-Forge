param(
    [Parameter(Mandatory = $true)][string]$EvidencePath,
    [Parameter(Mandatory = $true)][ValidateRange(1, 3)][int]$Attempt
)

# NOT_PRODUCTION: a bounded identity prerequisite probe, not the S6 gate.
# No Product authority, attachment credential, Harness or Provider is started.
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskElectron = Join-Path $taskRoot 'node_modules/.pnpm/electron@35.7.5/node_modules/electron/dist/electron.exe'
$taskFixture = Join-Path $taskRoot 'apps/desktop/test-fixtures/step1-non-product-peer.cjs'
$taskEvidence = [IO.Path]::GetFullPath($EvidencePath)
if (-not $taskEvidence.StartsWith($taskRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Evidence must remain within the Product workspace.'
}
if (Test-Path -LiteralPath $taskEvidence) { throw 'Do not overwrite previous probe evidence.' }

Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Win32.SafeHandles;
public static class Step1IdentityProbeNative {
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetNamedPipeClientProcessId(SafePipeHandle pipe, out uint pid);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(uint access, bool inherit, uint pid);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool QueryFullProcessImageName(IntPtr process, uint flags, StringBuilder path, ref uint size);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetProcessTimes(IntPtr process, out long created, out long exited, out long kernel, out long user);
    [DllImport("kernel32.dll")]
    private static extern bool CloseHandle(IntPtr handle);
    public static uint PeerPid(SafePipeHandle pipe) {
        uint pid;
        if (!GetNamedPipeClientProcessId(pipe, out pid)) throw new Win32Exception();
        return pid;
    }
    public static string[] Identity(uint pid) {
        IntPtr process = OpenProcess(0x1000, false, pid);
        if (process == IntPtr.Zero) throw new Win32Exception();
        try {
            uint size = 32768;
            var path = new StringBuilder((int)size);
            long created, exited, kernel, user;
            if (!QueryFullProcessImageName(process, 0, path, ref size)) throw new Win32Exception();
            if (!GetProcessTimes(process, out created, out exited, out kernel, out user)) throw new Win32Exception();
            return new string[] { path.ToString(), created.ToString() };
        } finally { CloseHandle(process); }
    }
}
'@

$taskPipe = $null
$taskChild = $null
$taskResult = [ordered]@{
    probe = 'STEP1_DEV_PRODUCT_IDENTITY_PREREQUISITE'
    attempt = $Attempt
    timestampUtc = [DateTime]::UtcNow.ToString('o')
    result = 'PROBE_FAILED'
    step1Gate = 'NOT_EXECUTED'
    productCodeStarted = $false
    workerHostHelperStarted = $false
    providerRun = $false
    secretRedacted = $true
    pipeEndpointRedacted = $true
}
try {
    $taskSid = [Security.Principal.WindowsIdentity]::GetCurrent().User
    $taskAcl = New-Object IO.Pipes.PipeSecurity
    $taskAcl.SetAccessRuleProtection($true, $false)
    $taskAcl.SetOwner($taskSid)
    $taskAcl.AddAccessRule([IO.Pipes.PipeAccessRule]::new($taskSid, [IO.Pipes.PipeAccessRights]::FullControl, [Security.AccessControl.AccessControlType]::Allow))
    $taskPipeName = 'shaco-step1-identity-probe-' + [Guid]::NewGuid().ToString('N')
    $taskPipe = [IO.Pipes.NamedPipeServerStreamAcl]::Create($taskPipeName, [IO.Pipes.PipeDirection]::InOut, 1, [IO.Pipes.PipeTransmissionMode]::Byte, [IO.Pipes.PipeOptions]::Asynchronous, 4096, 4096, $taskAcl, [IO.HandleInheritability]::None, [IO.Pipes.PipeAccessRights]0)
    $taskEffectiveAcl = [IO.Pipes.PipesAclExtensions]::GetAccessControl($taskPipe)
    $taskResult.currentUserDaclProtected = $taskEffectiveAcl.AreAccessRulesProtected -and $taskEffectiveAcl.GetOwner([Security.Principal.SecurityIdentifier]).Equals($taskSid)
    $taskStart = New-Object Diagnostics.ProcessStartInfo
    $taskStart.FileName = $taskElectron
    $taskStart.Arguments = '"' + $taskFixture + '"'
    $taskStart.UseShellExecute = $false
    $taskStart.CreateNoWindow = $true
    $taskStart.RedirectStandardOutput = $true
    $taskStart.RedirectStandardError = $true
    $taskStart.EnvironmentVariables.Clear()
    foreach ($taskKey in @('SystemRoot', 'WINDIR', 'TEMP', 'TMP')) {
        $taskValue = [Environment]::GetEnvironmentVariable($taskKey)
        if ($null -ne $taskValue) { $taskStart.EnvironmentVariables[$taskKey] = $taskValue }
    }
    $taskStart.EnvironmentVariables['ELECTRON_RUN_AS_NODE'] = '1'
    $taskStart.EnvironmentVariables['SHACO_STEP1_IDENTITY_PROBE_PIPE'] = '\\.\pipe\' + $taskPipeName
    $taskAccept = $taskPipe.BeginWaitForConnection($null, $null)
    $taskChild = [Diagnostics.Process]::Start($taskStart)
    $taskResult.peerPid = $taskChild.Id
    if (-not $taskAccept.AsyncWaitHandle.WaitOne(10000)) { throw 'Probe connection deadline exceeded.' }
    $taskPipe.EndWaitForConnection($taskAccept)
    $taskAccept.AsyncWaitHandle.Close()
    $taskPeerPid = [Step1IdentityProbeNative]::PeerPid($taskPipe.SafePipeHandle)
    $taskIdentity = [Step1IdentityProbeNative]::Identity($taskPeerPid)
    $taskResult.pipePeerPidMatchesTrackedChild = $taskPeerPid -eq $taskChild.Id
    $taskResult.creationTimeMatchesTrackedChild = [long]$taskIdentity[1] -eq $taskChild.StartTime.ToUniversalTime().ToFileTimeUtc()
    $taskResult.peerCreationTimeUtc = [DateTime]::FromFileTimeUtc([long]$taskIdentity[1]).ToString('o')
    $taskResult.canonicalImagePath = $taskIdentity[0]
    $taskResult.sameImageAsProductLauncher = [IO.Path]::GetFullPath($taskIdentity[0]).Equals([IO.Path]::GetFullPath($taskElectron), [StringComparison]::OrdinalIgnoreCase)
    $taskVersion = [Diagnostics.FileVersionInfo]::GetVersionInfo($taskIdentity[0])
    $taskResult.imageProductName = $taskVersion.ProductName
    $taskResult.imageFileVersion = $taskVersion.FileVersion
    $taskResult.imageSha256 = (Get-FileHash -LiteralPath $taskIdentity[0] -Algorithm SHA256).Hash
    $taskBytes = New-Object byte[] 128
    $taskRead = $taskPipe.BeginRead($taskBytes, 0, $taskBytes.Length, $null, $null)
    if (-not $taskRead.AsyncWaitHandle.WaitOne(3000)) { throw 'Probe message deadline exceeded.' }
    $taskCount = $taskPipe.EndRead($taskRead)
    $taskRead.AsyncWaitHandle.Close()
    $taskResult.nonProductFixtureMessageObserved = [Text.Encoding]::UTF8.GetString($taskBytes, 0, $taskCount) -eq "non-product-identity-probe`n"
    $taskPipe.WriteByte(1)
    $taskPipe.Flush()
    $taskPipe.Dispose()
    $taskPipe = $null
    if (-not $taskChild.WaitForExit(5000)) { throw 'Probe child exit deadline exceeded.' }
    $taskResult.peerExitCode = $taskChild.ExitCode
    if (-not ($taskResult.currentUserDaclProtected -and $taskResult.pipePeerPidMatchesTrackedChild -and $taskResult.creationTimeMatchesTrackedChild -and $taskResult.sameImageAsProductLauncher -and $taskResult.nonProductFixtureMessageObserved -and $taskChild.ExitCode -eq 0)) {
        throw 'Identity probe observation mismatch.'
    }
    $taskResult.result = 'IDENTITY_GAP_REPRODUCED'
} catch {
    # Exception messages can contain endpoint or input bytes; retain type only.
    $taskResult.failureType = $_.Exception.GetType().FullName
    $taskResult.failureLine = $_.InvocationInfo.ScriptLineNumber
} finally {
    if ($null -ne $taskPipe) { $taskPipe.Dispose() }
    if ($null -ne $taskChild -and -not $taskChild.HasExited) {
        $taskChild.Kill()
        $null = $taskChild.WaitForExit(5000)
    }
    $taskResult.remainingTrackedPids = @()
    if ($null -ne $taskChild -and -not $taskChild.HasExited) {
        $taskResult.remainingTrackedPids = @($taskChild.Id)
        $taskResult.result = 'PROCESS_CLEANUP_FAILED'
    }
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($taskEvidence)) | Out-Null
    [IO.File]::WriteAllText($taskEvidence, ($taskResult | ConvertTo-Json -Depth 8) + "`n", [Text.UTF8Encoding]::new($false, $true))
    if ($null -ne $taskChild) { $taskChild.Dispose() }
}
$taskResult | ConvertTo-Json -Depth 8
if ($taskResult.result -ne 'IDENTITY_GAP_REPRODUCED') { exit 1 }
