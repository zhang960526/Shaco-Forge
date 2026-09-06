// NOT_PRODUCTION / SOURCE_ONLY / NOT_COMPILED / NOT_EXECUTED.
// This source is the documented Windows OS boundary. A future approved broker host
// must bind it to the JSON contract, be independently identified, and fail closed.

using System;
using System.Collections.Concurrent;
using System.ComponentModel;
using System.IO.Pipes;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;
using System.Threading;
using Microsoft.Win32.SafeHandles;

namespace ShacoForge.P0S7.WindowsControl;

public sealed record ParentIdentity(
    uint Pid,
    ulong ProcessStartTimeFileTime,
    string ExecutablePath,
    string ExecutableRef);

public sealed record ProcessIdentity(
    uint Pid,
    ulong ProcessStartTimeFileTime,
    string ExecutablePath,
    string ExecutableRef,
    string TokenSid,
    ParentIdentity Parent,
    uint Generation);

public sealed record ExpectedProcessIdentity(
    uint Pid,
    ulong ProcessStartTimeFileTime,
    string ExecutablePath,
    string ExecutableRef,
    string TokenSid,
    ParentIdentity Parent,
    uint Generation);

public sealed record NamedPipePeerAttestation(
    string Status,
    string ConnectionId,
    ProcessIdentity Peer,
    string ObserverRef,
    string EndpointPolicyRef);

public sealed class WindowsBoundaryException : Exception
{
    public string Code { get; }

    public WindowsBoundaryException(string code) : base(code)
    {
        Code = code;
    }
}

public sealed class WindowsControlBoundary : IDisposable
{
    private const uint ProcessTerminate = 0x0001;
    private const uint ProcessSetQuota = 0x0100;
    private const uint ProcessQueryInformation = 0x0400;
    private const uint ProcessQueryLimitedInformation = 0x1000;
    private const uint TokenQuery = 0x0008;
    private const uint Th32csSnapProcess = 0x00000002;
    private const uint WaitObject0 = 0x00000000;
    private const uint WaitTimeout = 0x00000102;
    private const uint JobObjectExtendedLimitInformation = 9;
    private const uint JobObjectLimitActiveProcess = 0x00000008;
    private const uint JobObjectLimitKillOnJobClose = 0x00002000;
    private const int TokenUserClass = 1;

    private readonly ConcurrentDictionary<string, SafeJobHandle> _ownedJobs = new();
    private bool _disposed;

    public NamedPipeServerStream CreateCurrentUserOnlyPipe(string pipeName)
    {
        ThrowIfDisposed();
        if (string.IsNullOrWhiteSpace(pipeName)
            || pipeName.Length > 128
            || pipeName.Contains("\\", StringComparison.Ordinal)
            || pipeName.Contains("/", StringComparison.Ordinal))
        {
            throw new WindowsBoundaryException("PIPE_NAME_INVALID");
        }

        return new NamedPipeServerStream(
            pipeName,
            PipeDirection.InOut,
            1,
            PipeTransmissionMode.Byte,
            PipeOptions.Asynchronous | PipeOptions.WriteThrough | PipeOptions.CurrentUserOnly,
            4096,
            4096);
    }

    public ProcessIdentity InspectProcess(
        uint pid,
        uint generation,
        string executableRef,
        string parentExecutableRef)
    {
        ThrowIfDisposed();
        if (pid == 0 || generation == 0) throw new WindowsBoundaryException("PROCESS_KEY_INVALID");
        RequireContentRef(executableRef);
        RequireContentRef(parentExecutableRef);

        // Token SID inspection requires the explicit process query boundary.
        // Access denial is fatal; never retry with a weaker identity check.
        using SafeProcessHandle process = NativeMethods.OpenProcess(
            ProcessQueryInformation | ProcessQueryLimitedInformation,
            false,
            pid);
        if (process.IsInvalid) ThrowWin32("OPEN_PROCESS_FAILED");

        string path = QueryExecutablePath(process);
        ulong startTime = QueryStartTime(process);
        string sid = QueryProcessTokenSid(process);
        uint parentPid = QueryParentPid(pid);
        using SafeProcessHandle parent = NativeMethods.OpenProcess(
            ProcessQueryLimitedInformation,
            false,
            parentPid);
        if (parent.IsInvalid) ThrowWin32("OPEN_PARENT_PROCESS_FAILED");

        var parentIdentity = new ParentIdentity(
            parentPid,
            QueryStartTime(parent),
            QueryExecutablePath(parent),
            parentExecutableRef);
        return new ProcessIdentity(
            pid,
            startTime,
            path,
            executableRef,
            sid,
            parentIdentity,
            generation);
    }

    public NamedPipePeerAttestation InspectNamedPipeClient(
        NamedPipeServerStream server,
        string connectionId,
        string observerRef,
        string endpointPolicyRef,
        ExpectedProcessIdentity expected)
    {
        ThrowIfDisposed();
        ArgumentNullException.ThrowIfNull(server);
        if (!server.IsConnected) throw new WindowsBoundaryException("PIPE_NOT_CONNECTED");
        RequireLabel(connectionId);
        RequireContentRef(observerRef);
        RequireContentRef(endpointPolicyRef);

        if (!NativeMethods.GetNamedPipeClientProcessId(server.SafePipeHandle, out uint pid) || pid == 0)
        {
            ThrowWin32("PIPE_CLIENT_PID_UNAVAILABLE");
        }

        ProcessIdentity observed = InspectProcess(
            pid,
            expected.Generation,
            expected.ExecutableRef,
            expected.Parent.ExecutableRef);
        string impersonatedSid = string.Empty;
        server.RunAsClient(() =>
        {
            using WindowsIdentity identity = WindowsIdentity.GetCurrent(TokenAccessLevels.Query);
            impersonatedSid = identity.User?.Value ?? string.Empty;
        });
        if (string.IsNullOrEmpty(impersonatedSid)
            || !string.Equals(impersonatedSid, observed.TokenSid, StringComparison.Ordinal))
        {
            throw new WindowsBoundaryException("PIPE_CLIENT_TOKEN_SID_MISMATCH");
        }

        VerifyExpected(expected, observed);
        return new NamedPipePeerAttestation(
            "OS_IDENTITY_VERIFIED",
            connectionId,
            observed,
            observerRef,
            endpointPolicyRef);
    }

    public ProcessIdentity InspectNamedPipeServer(
        SafePipeHandle clientPipeHandle,
        ExpectedProcessIdentity expected)
    {
        ThrowIfDisposed();
        ArgumentNullException.ThrowIfNull(clientPipeHandle);
        if (clientPipeHandle.IsInvalid
            || !NativeMethods.GetNamedPipeServerProcessId(clientPipeHandle, out uint pid)
            || pid == 0)
        {
            ThrowWin32("PIPE_SERVER_PID_UNAVAILABLE");
        }
        ProcessIdentity observed = InspectProcess(
            pid,
            expected.Generation,
            expected.ExecutableRef,
            expected.Parent.ExecutableRef);
        VerifyExpected(expected, observed);
        return observed;
    }

    public string CreateOwnedJob(uint maximumActiveProcesses)
    {
        ThrowIfDisposed();
        if (maximumActiveProcesses == 0 || maximumActiveProcesses > 16)
        {
            throw new WindowsBoundaryException("JOB_PROCESS_LIMIT_INVALID");
        }

        SafeJobHandle job = NativeMethods.CreateJobObject(IntPtr.Zero, null);
        if (job.IsInvalid) ThrowWin32("CREATE_JOB_FAILED");
        var limits = new JobObjectExtendedLimitInformation
        {
            BasicLimitInformation = new JobObjectBasicLimitInformation
            {
                LimitFlags = JobObjectLimitActiveProcess | JobObjectLimitKillOnJobClose,
                ActiveProcessLimit = maximumActiveProcesses,
            },
        };
        int size = Marshal.SizeOf<JobObjectExtendedLimitInformation>();
        IntPtr buffer = Marshal.AllocHGlobal(size);
        try
        {
            Marshal.StructureToPtr(limits, buffer, false);
            if (!NativeMethods.SetInformationJobObject(
                job,
                JobObjectExtendedLimitInformation,
                buffer,
                (uint)size))
            {
                ThrowWin32("SET_JOB_LIMITS_FAILED");
            }
        }
        finally
        {
            Marshal.FreeHGlobal(buffer);
        }

        string ownershipToken = "job-" + Guid.NewGuid().ToString("N");
        if (!_ownedJobs.TryAdd(ownershipToken, job))
        {
            job.Dispose();
            throw new WindowsBoundaryException("JOB_OWNERSHIP_REGISTRATION_FAILED");
        }
        return ownershipToken;
    }

    public void AssignExactProcessToOwnedJob(
        string ownershipToken,
        ExpectedProcessIdentity expected)
    {
        ThrowIfDisposed();
        SafeJobHandle job = RequireOwnedJob(ownershipToken);
        ProcessIdentity observed = InspectProcess(
            expected.Pid,
            expected.Generation,
            expected.ExecutableRef,
            expected.Parent.ExecutableRef);
        VerifyExpected(expected, observed);
        using SafeProcessHandle process = NativeMethods.OpenProcess(
            ProcessQueryLimitedInformation | ProcessSetQuota | ProcessTerminate,
            false,
            expected.Pid);
        if (process.IsInvalid) ThrowWin32("OPEN_PROCESS_FOR_JOB_FAILED");
        if (!NativeMethods.AssignProcessToJobObject(job, process))
        {
            ThrowWin32("ASSIGN_PROCESS_TO_JOB_FAILED");
        }
    }

    public string ObserveExactProcessExit(ExpectedProcessIdentity expected, uint timeoutMilliseconds)
    {
        ThrowIfDisposed();
        if (timeoutMilliseconds == 0 || timeoutMilliseconds > 30000)
        {
            throw new WindowsBoundaryException("EXIT_TIMEOUT_INVALID");
        }
        ProcessIdentity before = InspectProcess(
            expected.Pid,
            expected.Generation,
            expected.ExecutableRef,
            expected.Parent.ExecutableRef);
        VerifyExpected(expected, before);
        using SafeProcessHandle process = NativeMethods.OpenProcess(
            0x00100000 | ProcessQueryLimitedInformation,
            false,
            expected.Pid);
        if (process.IsInvalid) ThrowWin32("OPEN_PROCESS_FOR_WAIT_FAILED");
        uint wait = NativeMethods.WaitForSingleObject(process, timeoutMilliseconds);
        return wait switch
        {
            WaitObject0 => "OS_EXIT_OBSERVED",
            WaitTimeout => "STILL_RUNNING",
            _ => throw new WindowsBoundaryException("PROCESS_WAIT_FAILED"),
        };
    }

    public void TerminateOwnedJob(string ownershipToken, uint exitCode)
    {
        ThrowIfDisposed();
        SafeJobHandle job = RequireOwnedJob(ownershipToken);
        if (!NativeMethods.TerminateJobObject(job, exitCode))
        {
            ThrowWin32("TERMINATE_OWNED_JOB_FAILED");
        }
    }

    public void ReleaseOwnedJob(string ownershipToken)
    {
        ThrowIfDisposed();
        if (!_ownedJobs.TryRemove(ownershipToken, out SafeJobHandle? job))
        {
            throw new WindowsBoundaryException("RESOURCE_OWNERSHIP_UNKNOWN");
        }
        job.Dispose();
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        foreach ((string key, SafeJobHandle job) in _ownedJobs)
        {
            if (_ownedJobs.TryRemove(key, out _)) job.Dispose();
        }
    }

    private static void VerifyExpected(ExpectedProcessIdentity expected, ProcessIdentity observed)
    {
        if (expected.Pid != observed.Pid
            || expected.ProcessStartTimeFileTime != observed.ProcessStartTimeFileTime
            || expected.Generation != observed.Generation
            || !string.Equals(expected.ExecutablePath, observed.ExecutablePath, StringComparison.OrdinalIgnoreCase)
            || !string.Equals(expected.ExecutableRef, observed.ExecutableRef, StringComparison.Ordinal)
            || !string.Equals(expected.TokenSid, observed.TokenSid, StringComparison.Ordinal)
            || expected.Parent.Pid != observed.Parent.Pid
            || expected.Parent.ProcessStartTimeFileTime != observed.Parent.ProcessStartTimeFileTime
            || !string.Equals(expected.Parent.ExecutablePath, observed.Parent.ExecutablePath, StringComparison.OrdinalIgnoreCase)
            || !string.Equals(expected.Parent.ExecutableRef, observed.Parent.ExecutableRef, StringComparison.Ordinal))
        {
            throw new WindowsBoundaryException("PROCESS_IDENTITY_MISMATCH");
        }
    }

    private static string QueryExecutablePath(SafeProcessHandle process)
    {
        uint capacity = 32768;
        var builder = new StringBuilder((int)capacity);
        if (!NativeMethods.QueryFullProcessImageName(process, 0, builder, ref capacity))
        {
            ThrowWin32("PROCESS_PATH_UNAVAILABLE");
        }
        return builder.ToString();
    }

    private static ulong QueryStartTime(SafeProcessHandle process)
    {
        if (!NativeMethods.GetProcessTimes(
            process,
            out FileTime creation,
            out _,
            out _,
            out _))
        {
            ThrowWin32("PROCESS_START_TIME_UNAVAILABLE");
        }
        return ((ulong)creation.High << 32) | creation.Low;
    }

    private static string QueryProcessTokenSid(SafeProcessHandle process)
    {
        // TOKEN_QUERY suffices for TokenUser; no token adjustment or impersonation rights.
        if (!NativeMethods.OpenProcessToken(process, TokenQuery, out SafeAccessTokenHandle token))
        {
            ThrowWin32("OPEN_PROCESS_TOKEN_FAILED");
        }
        using (token)
        {
            NativeMethods.GetTokenInformation(token, TokenUserClass, IntPtr.Zero, 0, out uint length);
            if (length == 0) ThrowWin32("TOKEN_USER_SIZE_FAILED");
            IntPtr buffer = Marshal.AllocHGlobal((int)length);
            try
            {
                if (!NativeMethods.GetTokenInformation(
                    token,
                    TokenUserClass,
                    buffer,
                    length,
                    out _))
                {
                    ThrowWin32("TOKEN_USER_READ_FAILED");
                }
                TokenUser user = Marshal.PtrToStructure<TokenUser>(buffer);
                return new SecurityIdentifier(user.User.Sid).Value;
            }
            finally
            {
                Marshal.FreeHGlobal(buffer);
            }
        }
    }

    private static uint QueryParentPid(uint pid)
    {
        using SafeSnapshotHandle snapshot = NativeMethods.CreateToolhelp32Snapshot(Th32csSnapProcess, 0);
        if (snapshot.IsInvalid) ThrowWin32("PROCESS_SNAPSHOT_FAILED");
        var entry = new ProcessEntry32 { Size = (uint)Marshal.SizeOf<ProcessEntry32>() };
        if (!NativeMethods.Process32First(snapshot, ref entry)) ThrowWin32("PROCESS_ENUMERATION_FAILED");
        do
        {
            if (entry.ProcessId == pid)
            {
                if (entry.ParentProcessId == 0) throw new WindowsBoundaryException("PARENT_PROCESS_UNKNOWN");
                return entry.ParentProcessId;
            }
        }
        while (NativeMethods.Process32Next(snapshot, ref entry));
        throw new WindowsBoundaryException("PROCESS_NOT_IN_SNAPSHOT");
    }

    private SafeJobHandle RequireOwnedJob(string token)
    {
        RequireLabel(token);
        if (!_ownedJobs.TryGetValue(token, out SafeJobHandle? job) || job.IsInvalid || job.IsClosed)
        {
            throw new WindowsBoundaryException("RESOURCE_OWNERSHIP_UNKNOWN");
        }
        return job;
    }

    private static void RequireContentRef(string value)
    {
        if (value is null || value.Length != 71 || !value.StartsWith("sha256:", StringComparison.Ordinal))
        {
            throw new WindowsBoundaryException("CONTENT_REF_INVALID");
        }
        for (int index = 7; index < value.Length; index++)
        {
            char c = value[index];
            if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')))
            {
                throw new WindowsBoundaryException("CONTENT_REF_INVALID");
            }
        }
    }

    private static void RequireLabel(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 128)
        {
            throw new WindowsBoundaryException("LABEL_INVALID");
        }
        foreach (char c in value)
        {
            if (!(char.IsAsciiLetterOrDigit(c) || c is '.' or '_' or ':' or '-'))
            {
                throw new WindowsBoundaryException("LABEL_INVALID");
            }
        }
    }

    private void ThrowIfDisposed()
    {
        if (_disposed) throw new ObjectDisposedException(nameof(WindowsControlBoundary));
    }

    private static void ThrowWin32(string code)
    {
        throw new WindowsBoundaryException(code + ":WIN32_" + Marshal.GetLastWin32Error());
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct FileTime { public uint Low; public uint High; }

    [StructLayout(LayoutKind.Sequential)]
    private struct SidAndAttributes { public IntPtr Sid; public uint Attributes; }

    [StructLayout(LayoutKind.Sequential)]
    private struct TokenUser { public SidAndAttributes User; }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct ProcessEntry32
    {
        public uint Size;
        public uint Usage;
        public uint ProcessId;
        public IntPtr DefaultHeapId;
        public uint ModuleId;
        public uint Threads;
        public uint ParentProcessId;
        public int BasePriority;
        public uint Flags;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)] public string ExecutableFile;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct IoCounters
    {
        public ulong ReadOperationCount;
        public ulong WriteOperationCount;
        public ulong OtherOperationCount;
        public ulong ReadTransferCount;
        public ulong WriteTransferCount;
        public ulong OtherTransferCount;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JobObjectBasicLimitInformation
    {
        public long PerProcessUserTimeLimit;
        public long PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize;
        public UIntPtr MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public IntPtr Affinity;
        public uint PriorityClass;
        public uint SchedulingClass;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JobObjectExtendedLimitInformation
    {
        public JobObjectBasicLimitInformation BasicLimitInformation;
        public IoCounters IoInfo;
        public UIntPtr ProcessMemoryLimit;
        public UIntPtr JobMemoryLimit;
        public UIntPtr PeakProcessMemoryUsed;
        public UIntPtr PeakJobMemoryUsed;
    }

    private sealed class SafeJobHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        private SafeJobHandle() : base(true) { }
        protected override bool ReleaseHandle() => NativeMethods.CloseHandle(handle);
    }

    private sealed class SafeSnapshotHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        private SafeSnapshotHandle() : base(true) { }
        protected override bool ReleaseHandle() => NativeMethods.CloseHandle(handle);
    }

    private static class NativeMethods
    {
        [DllImport("kernel32.dll", SetLastError = true)]
        internal static extern SafeProcessHandle OpenProcess(uint access, bool inherit, uint pid);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool QueryFullProcessImageName(
            SafeProcessHandle process,
            uint flags,
            StringBuilder path,
            ref uint size);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetProcessTimes(
            SafeProcessHandle process,
            out FileTime creation,
            out FileTime exit,
            out FileTime kernel,
            out FileTime user);

        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool OpenProcessToken(
            SafeProcessHandle process,
            uint access,
            out SafeAccessTokenHandle token);

        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetTokenInformation(
            SafeAccessTokenHandle token,
            int informationClass,
            IntPtr information,
            uint informationLength,
            out uint returnLength);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetNamedPipeClientProcessId(
            SafePipeHandle pipe,
            out uint clientProcessId);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetNamedPipeServerProcessId(
            SafePipeHandle pipe,
            out uint serverProcessId);

        [DllImport("kernel32.dll", SetLastError = true)]
        internal static extern SafeSnapshotHandle CreateToolhelp32Snapshot(uint flags, uint pid);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool Process32First(SafeSnapshotHandle snapshot, ref ProcessEntry32 entry);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool Process32Next(SafeSnapshotHandle snapshot, ref ProcessEntry32 entry);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        internal static extern SafeJobHandle CreateJobObject(IntPtr securityAttributes, string? name);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool SetInformationJobObject(
            SafeJobHandle job,
            uint informationClass,
            IntPtr information,
            uint informationLength);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool AssignProcessToJobObject(SafeJobHandle job, SafeProcessHandle process);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool TerminateJobObject(SafeJobHandle job, uint exitCode);

        [DllImport("kernel32.dll", SetLastError = true)]
        internal static extern uint WaitForSingleObject(SafeProcessHandle handle, uint milliseconds);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool CloseHandle(IntPtr handle);
    }
}
