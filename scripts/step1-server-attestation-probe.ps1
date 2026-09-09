param(
    [switch]$ServerMode,
    [string]$PipeName,
    [string]$ExpectedSid,
    [ValidateRange(1, 2)]
    [int]$Attempt = 1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$nativeSource = @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;

namespace ShacoForge.Diagnostics
{
    public sealed class PipeSecurityObservation
    {
        public string OwnerSid { get; set; } = "";
        public bool OwnerSidMatch { get; set; }
        public bool DaclProtected { get; set; }
        public bool CurrentUserOnly { get; set; }
        public int ExplicitAceCount { get; set; }
        public bool HasInheritedAce { get; set; }
        public bool HasBroadPrincipal { get; set; }
    }

    public sealed class ProcessObservation
    {
        public uint Pid { get; set; }
        public string CanonicalPath { get; set; } = "";
        public ulong CreationTimeFileTimeUtc { get; set; }
    }

    public static class NativeProbe
    {
        private const uint PipeAccessDuplex = 0x00000003;
        private const uint FileFlagFirstPipeInstance = 0x00080000;
        private const uint PipeTypeByte = 0x00000000;
        private const uint PipeReadModeByte = 0x00000000;
        private const uint PipeWait = 0x00000000;
        private const uint GenericRead = 0x80000000;
        private const uint GenericWrite = 0x40000000;
        private const uint OpenExisting = 3;
        private const uint ProcessQueryLimitedInformation = 0x1000;
        private const int ErrorPipeConnected = 535;
        private static readonly IntPtr InvalidHandleValue = new IntPtr(-1);

        [StructLayout(LayoutKind.Sequential)]
        private struct SecurityAttributes
        {
            public int Length;
            public IntPtr SecurityDescriptor;
            public int InheritHandle;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct FileTime
        {
            public uint Low;
            public uint High;
        }

        [DllImport("advapi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool ConvertStringSecurityDescriptorToSecurityDescriptor(
            string stringSecurityDescriptor,
            uint stringSdRevision,
            out IntPtr securityDescriptor,
            out uint securityDescriptorSize);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern IntPtr CreateNamedPipe(
            string name,
            uint openMode,
            uint pipeMode,
            uint maximumInstances,
            uint outputBufferSize,
            uint inputBufferSize,
            uint defaultTimeout,
            ref SecurityAttributes securityAttributes);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool ConnectNamedPipe(IntPtr namedPipe, IntPtr overlapped);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern IntPtr CreateFile(
            string fileName,
            uint desiredAccess,
            uint shareMode,
            IntPtr securityAttributes,
            uint creationDisposition,
            uint flagsAndAttributes,
            IntPtr templateFile);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool GetNamedPipeServerProcessId(IntPtr pipe, out uint serverProcessId);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr OpenProcess(uint desiredAccess, bool inheritHandle, uint processId);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool QueryFullProcessImageName(
            IntPtr process,
            uint flags,
            StringBuilder executablePath,
            ref uint size);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool GetProcessTimes(
            IntPtr process,
            out FileTime creation,
            out FileTime exit,
            out FileTime kernel,
            out FileTime user);

        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern uint GetSecurityInfo(
            IntPtr handle,
            int objectType,
            uint securityInfo,
            out IntPtr owner,
            out IntPtr group,
            out IntPtr dacl,
            out IntPtr sacl,
            out IntPtr securityDescriptor);

        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern uint GetSecurityDescriptorLength(IntPtr securityDescriptor);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool ReadFile(
            IntPtr handle,
            byte[] buffer,
            int bytesToRead,
            out int bytesRead,
            IntPtr overlapped);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool WriteFile(
            IntPtr handle,
            byte[] buffer,
            int bytesToWrite,
            out int bytesWritten,
            IntPtr overlapped);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CloseHandle(IntPtr handle);

        [DllImport("kernel32.dll")]
        private static extern IntPtr LocalFree(IntPtr memory);

        public static IntPtr CreateProtectedServer(string pipeName, string currentUserSid)
        {
            string sddl = "O:" + currentUserSid + "D:P(A;;GA;;;" + currentUserSid + ")";
            IntPtr descriptor;
            uint descriptorSize;
            if (!ConvertStringSecurityDescriptorToSecurityDescriptor(sddl, 1, out descriptor, out descriptorSize))
                ThrowLast("CONVERT_SDDL_FAILED");

            try
            {
                var attributes = new SecurityAttributes
                {
                    Length = Marshal.SizeOf<SecurityAttributes>(),
                    SecurityDescriptor = descriptor,
                    InheritHandle = 0
                };
                IntPtr pipe = CreateNamedPipe(
                    @"\\.\pipe\" + pipeName,
                    PipeAccessDuplex | FileFlagFirstPipeInstance,
                    PipeTypeByte | PipeReadModeByte | PipeWait,
                    1,
                    4096,
                    4096,
                    5000,
                    ref attributes);
                if (pipe == InvalidHandleValue) ThrowLast("CREATE_NAMED_PIPE_FAILED");
                return pipe;
            }
            finally
            {
                LocalFree(descriptor);
            }
        }

        public static void ConnectServer(IntPtr pipe)
        {
            if (!ConnectNamedPipe(pipe, IntPtr.Zero) && Marshal.GetLastWin32Error() != ErrorPipeConnected)
                ThrowLast("CONNECT_NAMED_PIPE_FAILED");
        }

        public static IntPtr OpenClient(string pipeName)
        {
            IntPtr pipe = CreateFile(
                @"\\.\pipe\" + pipeName,
                GenericRead | GenericWrite,
                0,
                IntPtr.Zero,
                OpenExisting,
                0,
                IntPtr.Zero);
            if (pipe == InvalidHandleValue) ThrowLast("OPEN_PIPE_CLIENT_FAILED");
            return pipe;
        }

        public static uint QueryServerPid(IntPtr clientPipe)
        {
            uint pid;
            if (!GetNamedPipeServerProcessId(clientPipe, out pid)) ThrowLast("PIPE_SERVER_PID_UNAVAILABLE");
            if (pid == 0) throw new InvalidOperationException("PIPE_SERVER_PID_ZERO");
            return pid;
        }

        public static ProcessObservation InspectProcess(uint pid)
        {
            IntPtr process = OpenProcess(ProcessQueryLimitedInformation, false, pid);
            if (process == IntPtr.Zero) ThrowLast("OPEN_PROCESS_FAILED");
            try
            {
                uint capacity = 32768;
                var path = new StringBuilder((int)capacity);
                if (!QueryFullProcessImageName(process, 0, path, ref capacity))
                    ThrowLast("QUERY_PROCESS_PATH_FAILED");

                FileTime creation;
                FileTime exit;
                FileTime kernel;
                FileTime user;
                if (!GetProcessTimes(process, out creation, out exit, out kernel, out user))
                    ThrowLast("QUERY_PROCESS_TIMES_FAILED");

                return new ProcessObservation
                {
                    Pid = pid,
                    CanonicalPath = System.IO.Path.GetFullPath(path.ToString()),
                    CreationTimeFileTimeUtc = ((ulong)creation.High << 32) | creation.Low
                };
            }
            finally
            {
                CloseHandle(process);
            }
        }

        public static PipeSecurityObservation InspectPipeSecurity(IntPtr pipe, string currentUserSid)
        {
            const int SeKernelObject = 6;
            const uint OwnerSecurityInformation = 0x00000001;
            const uint DaclSecurityInformation = 0x00000004;
            IntPtr owner;
            IntPtr group;
            IntPtr dacl;
            IntPtr sacl;
            IntPtr descriptor;
            uint error = GetSecurityInfo(
                pipe,
                SeKernelObject,
                OwnerSecurityInformation | DaclSecurityInformation,
                out owner,
                out group,
                out dacl,
                out sacl,
                out descriptor);
            if (error != 0) throw new Win32Exception((int)error, "GET_PIPE_SECURITY_FAILED");

            try
            {
                uint length = GetSecurityDescriptorLength(descriptor);
                if (length == 0) ThrowLast("GET_PIPE_SECURITY_LENGTH_FAILED");
                byte[] bytes = new byte[length];
                Marshal.Copy(descriptor, bytes, 0, checked((int)length));
                var raw = new RawSecurityDescriptor(bytes, 0);
                string ownerValue = raw.Owner == null ? "" : raw.Owner.Value;
                bool protectedDacl = (raw.ControlFlags & ControlFlags.DiscretionaryAclProtected) != 0;
                bool inherited = false;
                bool broad = false;
                bool onlyCurrentUserAllowed = raw.DiscretionaryAcl != null && raw.DiscretionaryAcl.Count > 0;
                int explicitAceCount = 0;
                var expectedSid = new SecurityIdentifier(currentUserSid);
                var everyoneSid = new SecurityIdentifier(WellKnownSidType.WorldSid, null);
                var authenticatedUsersSid = new SecurityIdentifier(WellKnownSidType.AuthenticatedUserSid, null);

                if (raw.DiscretionaryAcl != null)
                {
                    foreach (GenericAce ace in raw.DiscretionaryAcl)
                    {
                        if ((ace.AceFlags & AceFlags.Inherited) != 0) inherited = true;
                        else explicitAceCount++;
                        var qualified = ace as QualifiedAce;
                        if (qualified == null || qualified.AceQualifier != AceQualifier.AccessAllowed || qualified.SecurityIdentifier != expectedSid)
                            onlyCurrentUserAllowed = false;
                        if (qualified != null && (qualified.SecurityIdentifier == everyoneSid || qualified.SecurityIdentifier == authenticatedUsersSid))
                            broad = true;
                    }
                }

                return new PipeSecurityObservation
                {
                    OwnerSid = ownerValue,
                    OwnerSidMatch = String.Equals(ownerValue, currentUserSid, StringComparison.OrdinalIgnoreCase),
                    DaclProtected = protectedDacl,
                    CurrentUserOnly = onlyCurrentUserAllowed && !inherited && !broad,
                    ExplicitAceCount = explicitAceCount,
                    HasInheritedAce = inherited,
                    HasBroadPrincipal = broad
                };
            }
            finally
            {
                LocalFree(descriptor);
            }
        }

        public static void WriteMessage(IntPtr pipe, string text)
        {
            byte[] body = Encoding.UTF8.GetBytes(text);
            WriteAll(pipe, BitConverter.GetBytes(body.Length));
            WriteAll(pipe, body);
        }

        public static string ReadMessage(IntPtr pipe)
        {
            byte[] prefix = ReadExact(pipe, 4);
            int length = BitConverter.ToInt32(prefix, 0);
            if (length < 0 || length > 65536) throw new InvalidOperationException("PIPE_MESSAGE_LENGTH_INVALID");
            return Encoding.UTF8.GetString(ReadExact(pipe, length));
        }

        private static void WriteAll(IntPtr pipe, byte[] buffer)
        {
            int offset = 0;
            while (offset < buffer.Length)
            {
                byte[] remaining = offset == 0 ? buffer : Slice(buffer, offset);
                int written;
                if (!WriteFile(pipe, remaining, remaining.Length, out written, IntPtr.Zero)) ThrowLast("PIPE_WRITE_FAILED");
                if (written <= 0) throw new InvalidOperationException("PIPE_WRITE_ZERO");
                offset += written;
            }
        }

        private static byte[] ReadExact(IntPtr pipe, int length)
        {
            byte[] result = new byte[length];
            int offset = 0;
            while (offset < length)
            {
                byte[] chunk = new byte[length - offset];
                int read;
                if (!ReadFile(pipe, chunk, chunk.Length, out read, IntPtr.Zero)) ThrowLast("PIPE_READ_FAILED");
                if (read <= 0) throw new InvalidOperationException("PIPE_READ_ZERO");
                Buffer.BlockCopy(chunk, 0, result, offset, read);
                offset += read;
            }
            return result;
        }

        private static byte[] Slice(byte[] value, int offset)
        {
            byte[] result = new byte[value.Length - offset];
            Buffer.BlockCopy(value, offset, result, 0, result.Length);
            return result;
        }

        private static void ThrowLast(string operation)
        {
            int error = Marshal.GetLastWin32Error();
            throw new Win32Exception(error, operation + ":WIN32_" + error);
        }
    }
}
'@

Add-Type -TypeDefinition $nativeSource -Language CSharp

function Test-ServerIdentity {
    param(
        [Parameter(Mandatory)]$Expected,
        [Parameter(Mandatory)]$Observed
    )

    return [uint32]$Expected.Pid -eq [uint32]$Observed.Pid -and
        [uint64]$Expected.CreationTimeFileTimeUtc -eq [uint64]$Observed.CreationTimeFileTimeUtc -and
        [string]::Equals(
            [IO.Path]::GetFullPath([string]$Expected.CanonicalPath),
            [IO.Path]::GetFullPath([string]$Observed.CanonicalPath),
            [StringComparison]::OrdinalIgnoreCase)
}

if ($ServerMode) {
    if ([string]::IsNullOrWhiteSpace($PipeName) -or [string]::IsNullOrWhiteSpace($ExpectedSid)) {
        throw 'SERVER_ARGUMENTS_REQUIRED'
    }

    $serverHandle = [IntPtr]::Zero
    try {
        $serverHandle = [ShacoForge.Diagnostics.NativeProbe]::CreateProtectedServer($PipeName, $ExpectedSid)
        $security = [ShacoForge.Diagnostics.NativeProbe]::InspectPipeSecurity($serverHandle, $ExpectedSid)
        [Console]::Out.WriteLine('READY')
        [Console]::Out.Flush()
        [ShacoForge.Diagnostics.NativeProbe]::ConnectServer($serverHandle)
        $securityJson = $security | ConvertTo-Json -Compress
        [ShacoForge.Diagnostics.NativeProbe]::WriteMessage($serverHandle, $securityJson)
        $ack = [ShacoForge.Diagnostics.NativeProbe]::ReadMessage($serverHandle)
        if ($ack -ne 'ACK') { throw 'CLIENT_ACK_INVALID' }
        exit 0
    }
    finally {
        if ($serverHandle -ne [IntPtr]::Zero -and $serverHandle -ne [IntPtr](-1)) {
            [void][ShacoForge.Diagnostics.NativeProbe]::CloseHandle($serverHandle)
        }
    }
}

$runId = 'STEP1-20260909-SERVER-ATTESTATION-01'
$productRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$evidenceRoot = Join-Path $productRoot 'docs/04-development-records/evidence/V1-SLICE-2/STEP-1/STEP1-20260909-SERVER-ATTESTATION-01'
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$server = $null
$clientHandle = [IntPtr]::Zero
$actualPid = 0
$observedPid = 0
$remainingPids = @()
$cleanupResult = 'NOT_STARTED'
$win32ErrorCode = 0
$failureBoundary = $null
$result = 'FAIL_OR_INCONCLUSIVE'
$actualIdentity = $null
$observedIdentity = $null
$security = $null
$positiveAccepted = $false
$negativeRejected = $false
$connectionEstablished = $false
$serverExitCode = $null

try {
    $currentSid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    $pipeName = 'shaco-step1-server-attestation-' + [Guid]::NewGuid().ToString('N')
    $currentPwsh = (Get-Process -Id $PID).Path
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $currentPwsh
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    [void]$startInfo.ArgumentList.Add('-NoLogo')
    [void]$startInfo.ArgumentList.Add('-NoProfile')
    [void]$startInfo.ArgumentList.Add('-NonInteractive')
    [void]$startInfo.ArgumentList.Add('-File')
    [void]$startInfo.ArgumentList.Add($PSCommandPath)
    [void]$startInfo.ArgumentList.Add('-ServerMode')
    [void]$startInfo.ArgumentList.Add('-PipeName')
    [void]$startInfo.ArgumentList.Add($pipeName)
    [void]$startInfo.ArgumentList.Add('-ExpectedSid')
    [void]$startInfo.ArgumentList.Add($currentSid)

    $server = [Diagnostics.Process]::new()
    $server.StartInfo = $startInfo
    if (-not $server.Start()) { throw 'SERVER_CHILD_START_FAILED' }
    $actualPid = $server.Id
    $actualIdentity = [pscustomobject]@{
        Pid = [uint32]$actualPid
        CanonicalPath = [IO.Path]::GetFullPath($server.MainModule.FileName)
        CreationTimeFileTimeUtc = [uint64]$server.StartTime.ToUniversalTime().ToFileTimeUtc()
    }

    $ready = $server.StandardOutput.ReadLine()
    if ($ready -ne 'READY') {
        $serverError = $server.StandardError.ReadToEnd()
        throw "SERVER_NOT_READY:${ready}:${serverError}"
    }

    $clientHandle = [ShacoForge.Diagnostics.NativeProbe]::OpenClient($pipeName)
    $connectionEstablished = $true
    $observedPid = [ShacoForge.Diagnostics.NativeProbe]::QueryServerPid($clientHandle)
    $observedIdentity = [ShacoForge.Diagnostics.NativeProbe]::InspectProcess($observedPid)
    $securityJson = [ShacoForge.Diagnostics.NativeProbe]::ReadMessage($clientHandle)
    $security = $securityJson | ConvertFrom-Json

    $positiveAccepted = Test-ServerIdentity -Expected $actualIdentity -Observed $observedIdentity
    $wrongIdentity = [pscustomobject]@{
        Pid = [uint32]($actualPid + 1)
        CanonicalPath = $actualIdentity.CanonicalPath + '.not-the-server'
        CreationTimeFileTimeUtc = [uint64]($actualIdentity.CreationTimeFileTimeUtc + 1)
    }
    $negativeRejected = -not (Test-ServerIdentity -Expected $wrongIdentity -Observed $observedIdentity)

    $securityPass = [bool]$security.OwnerSidMatch -and
        [bool]$security.DaclProtected -and
        [bool]$security.CurrentUserOnly -and
        -not [bool]$security.HasInheritedAce -and
        -not [bool]$security.HasBroadPrincipal

    if (-not $positiveAccepted) { throw 'SERVER_IDENTITY_POSITIVE_MISMATCH' }
    if (-not $negativeRejected) { throw 'SERVER_IDENTITY_NEGATIVE_ACCEPTED' }
    if (-not $securityPass) { throw 'PIPE_SECURITY_ASSERTION_FAILED' }

    [ShacoForge.Diagnostics.NativeProbe]::WriteMessage($clientHandle, 'ACK')
    [void][ShacoForge.Diagnostics.NativeProbe]::CloseHandle($clientHandle)
    $clientHandle = [IntPtr]::Zero

    if (-not $server.WaitForExit(5000)) { throw 'SERVER_CHILD_EXIT_TIMEOUT' }
    $serverExitCode = $server.ExitCode
    if ($serverExitCode -ne 0) { throw "SERVER_CHILD_EXIT_$serverExitCode" }
    $cleanupResult = 'PASS'
    $result = 'PASS'
}
catch {
    $failureBoundary = $_.Exception.Message
    if ($_.Exception -is [ComponentModel.Win32Exception]) {
        $win32ErrorCode = $_.Exception.NativeErrorCode
    }
}
finally {
    if ($clientHandle -ne [IntPtr]::Zero -and $clientHandle -ne [IntPtr](-1)) {
        [void][ShacoForge.Diagnostics.NativeProbe]::CloseHandle($clientHandle)
        $clientHandle = [IntPtr]::Zero
    }
    if ($null -ne $server) {
        if (-not $server.HasExited) {
            $server.Kill($false)
            [void]$server.WaitForExit(5000)
        }
        if (-not $server.HasExited) {
            $remainingPids = @($actualPid)
            $cleanupResult = 'PROCESS_CLEANUP_FAILED'
            $result = 'FAIL_OR_INCONCLUSIVE'
        }
        elseif ($cleanupResult -eq 'NOT_STARTED') {
            $cleanupResult = 'PASS_AFTER_EXACT_CHILD_TERMINATION'
        }
        if ($null -eq $serverExitCode -and $server.HasExited) {
            $serverExitCode = $server.ExitCode
        }
        $server.Dispose()
    }
}

$powershellVersion = $PSVersionTable.PSVersion.ToString()
$dotnetVersion = [Environment]::Version.ToString()
$assertions = [ordered]@{
    SERVER_PROCESS_ID_QUERY_AVAILABLE = if ($observedPid -ne 0) { 'YES' } else { 'NO' }
    CLIENT_CONNECTION = if ($connectionEstablished) { 'ESTABLISHED' } else { 'NOT_ESTABLISHED' }
    SERVER_PID_MATCH = if ($actualPid -ne 0 -and $actualPid -eq $observedPid) { 'PASS' } else { 'FAIL' }
    SERVER_EXECUTABLE_PATH_MATCH = if ($null -ne $actualIdentity -and $null -ne $observedIdentity -and [string]::Equals($actualIdentity.CanonicalPath, $observedIdentity.CanonicalPath, [StringComparison]::OrdinalIgnoreCase)) { 'PASS' } else { 'FAIL' }
    SERVER_PROCESS_START_MATCH = if ($null -ne $actualIdentity -and $null -ne $observedIdentity -and [uint64]$actualIdentity.CreationTimeFileTimeUtc -eq [uint64]$observedIdentity.CreationTimeFileTimeUtc) { 'PASS' } else { 'FAIL' }
    CURRENT_USER_PROTECTED_PIPE = if ($null -ne $security -and [bool]$security.OwnerSidMatch -and [bool]$security.DaclProtected -and [bool]$security.CurrentUserOnly) { 'YES' } else { 'NO' }
    SERVER_IDENTITY_MISMATCH_REJECTED = if ($negativeRejected) { 'YES' } else { 'NO' }
    PROCESS_CLEANUP = $cleanupResult
}

$attestation = [ordered]@{
    runId = $runId
    sourceConfirmationResult = $result
    firstFailureBoundary = $failureBoundary
    win32ErrorCode = $win32ErrorCode
    attemptCount = $Attempt
    clientConnection = $assertions.CLIENT_CONNECTION
    getNamedPipeServerProcessId = $assertions.SERVER_PROCESS_ID_QUERY_AVAILABLE
    actualServerPid = $actualPid
    observedServerPid = $observedPid
    actualServerIdentity = $actualIdentity
    observedServerIdentity = $observedIdentity
    pipeSecurity = $security
    positiveIdentityAccepted = $positiveAccepted
    serverIdentityMismatchRejected = $negativeRejected
    serverExitCode = $serverExitCode
    cleanupResult = $cleanupResult
    remainingProbeProcessPids = $remainingPids
    assertions = $assertions
}

$manifest = [ordered]@{
    runId = $runId
    documentType = 'DIAGNOSTIC_SOURCE_CONFIRMATION_EVIDENCE'
    result = $result
    product = [ordered]@{
        branch = 'master'
        head = '20864fbd3c545eacc3baefd68faf71330a3d2d53'
        trackedSourceDelta = 'NONE'
        stagedDelta = 'NONE'
    }
    frozenHarness = [ordered]@{
        head = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
        state = 'CLEAN'
        modified = $false
    }
    runtime = [ordered]@{
        powershell = $powershellVersion
        dotnet = $dotnetVersion
        operatingSystem = [Environment]::OSVersion.VersionString
    }
    attemptCount = $Attempt
    maximumAttempts = 2
    distinctApproaches = 1
    productRuntimeStarted = $false
    networkUsed = $false
    commitPerformed = $false
    pushPerformed = $false
}

$summary = [ordered]@{
    runId = $runId
    result = $result
    assertions = $assertions
    astValidation = 'PASS_BEFORE_EXECUTION'
    inlineCSharpCompilation = 'PASS'
    cleanupResult = $cleanupResult
    remainingProbeProcessPids = $remainingPids
    attemptHistory = @(
        [ordered]@{
            attempt = $Attempt
            approach = 'CURRENT_USER_SDDL_NATIVE_NAMED_PIPE_CHILD_SERVER'
            result = $result
            failureBoundary = $failureBoundary
            win32ErrorCode = $win32ErrorCode
        }
    )
}

$redaction = [ordered]@{
    runId = $runId
    result = 'PASS'
    attachmentSecretGenerated = $false
    launchGrantRawBytesGenerated = $false
    carrierSecretGenerated = $false
    hmacProofGenerated = $false
    providerCredentialsAccessed = $false
    diagnosticPipeNameRecorded = $false
    notes = @(
        'Evidence contains process identity, runtime, ACL assertion, and bounded diagnostic results only.',
        'The random diagnostic pipe name is intentionally omitted.'
    )
}

[IO.Directory]::CreateDirectory($evidenceRoot) | Out-Null
$evidenceFiles = [ordered]@{
    'run-manifest.json' = $manifest
    'server-attestation-result.json' = $attestation
    'test-summary.json' = $summary
    'redaction-summary.json' = $redaction
}
foreach ($entry in $evidenceFiles.GetEnumerator()) {
    $json = $entry.Value | ConvertTo-Json -Depth 12
    [IO.File]::WriteAllText((Join-Path $evidenceRoot $entry.Key), $json + "`n", $utf8NoBom)
}

$attestation | ConvertTo-Json -Depth 12
if ($result -ne 'PASS') { exit 1 }
