using System.ComponentModel;
using System.IO.Pipes;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace ShacoForge.NativeCarrier;

// Concrete Windows lifecycle primitives; no credential or business RPC surface.
internal static class WindowsAuthority
{
    internal static readonly SecurityIdentifier Sid = WindowsIdentity.GetCurrent().User
        ?? throw new UnauthorizedAccessException("CURRENT_USER_UNAVAILABLE");
    private static readonly string UserKey = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(Sid.Value))).ToLowerInvariant();
    internal static string LifecycleName => $"shaco-forge-lifecycle-v1-{UserKey}";
    internal static string MutexName => $"Local\\shaco-forge-authority-v1-{UserKey}";

    internal sealed record ProcessIdentity(uint Pid, string StartTime);
    internal static ProcessIdentity InspectProcess(uint pid)
    {
        using SafeProcessHandle process = OpenProcess(0x1000 | 0x100000, false, pid);
        long start = 0;
        if (process.IsInvalid || WaitForSingleObject(process.DangerousGetHandle(), 0) != 258
            || !GetProcessTimes(process, out start, out _, out _, out _)) Fail("PROCESS_IDENTITY_UNAVAILABLE");
        return new(pid, start.ToString(System.Globalization.CultureInfo.InvariantCulture));
    }

    internal static ProcessIdentity Peer(SafePipeHandle pipe, bool server)
    {
        uint pid;
        bool ok = server ? GetNamedPipeServerProcessId(pipe, out pid) : GetNamedPipeClientProcessId(pipe, out pid);
        if (!ok || pid == 0) Fail("PIPE_PEER_UNAVAILABLE");
        return InspectProcess(pid);
    }

    internal static object Platform(uint pid)
    {
        nint mutex = OpenMutexW(0x100000 | 0x20000, false, MutexName);
        if (mutex == 0 && Marshal.GetLastWin32Error() != 2) Fail("AUTHORITY_MUTEX_AMBIGUOUS");
        bool exists = mutex != 0;
        if (exists) CloseHandle(mutex);
        bool available = WaitNamedPipeW($@"\\.\pipe\{LifecycleName}", 1);
        int pipeError = available ? 0 : Marshal.GetLastWin32Error();
        return new { process = InspectProcess(pid), lifecycleName = LifecycleName, mutexExists = exists, lifecycleBusy = pipeError is 121 or 231 };
    }

    internal static object InspectPipe(SafePipeHandle pipe)
    {
        var acl = InspectAcl(pipe);
        return new { peer = Peer(pipe, true), acl };
    }

    internal sealed record AclProof(bool Verified, bool Protected, bool CurrentUserOnly, bool InheritanceDisabled, bool OtherUserGrantedAccess);
    internal static AclProof InspectAcl(SafeHandle handle)
    {
        GetKernelObjectSecurity(handle, 0x5, null, 0, out uint needed);
        if (needed == 0) Fail("PIPE_ACL_UNAVAILABLE");
        byte[] bytes = new byte[needed];
        if (!GetKernelObjectSecurity(handle, 0x5, bytes, needed, out _)) Fail("PIPE_ACL_UNAVAILABLE");
        RawSecurityDescriptor sd = new(bytes, 0);
        bool protectedAcl = (sd.ControlFlags & ControlFlags.DiscretionaryAclProtected) != 0;
        bool currentOnly = sd.DiscretionaryAcl is { Count: 1 } && sd.DiscretionaryAcl[0] is CommonAce ace
            && ace.AceQualifier == AceQualifier.AccessAllowed && ace.SecurityIdentifier.Equals(Sid)
            && (ace.AceFlags & AceFlags.Inherited) == 0 && (ace.AccessMask & (int)PipeAccessRights.FullControl) == (int)PipeAccessRights.FullControl;
        bool verified = sd.Owner?.Equals(Sid) == true && protectedAcl && currentOnly;
        if (!verified) throw new UnauthorizedAccessException("PIPE_ACL_INVALID");
        // Deterministic non-admin ACL evaluation, not a second-user login.
        // The model includes a different user and standard broad group SIDs.
        var otherTokenSids = new[] { new SecurityIdentifier("S-1-5-21-0-0-0-424242"),
            new SecurityIdentifier(WellKnownSidType.WorldSid, null),
            new SecurityIdentifier(WellKnownSidType.AuthenticatedUserSid, null),
            new SecurityIdentifier(WellKnownSidType.BuiltinUsersSid, null) };
        bool otherGranted = sd.DiscretionaryAcl!.Cast<GenericAce>().OfType<CommonAce>().Any(rule =>
            rule.AceQualifier == AceQualifier.AccessAllowed && otherTokenSids.Any(sid => sid.Equals(rule.SecurityIdentifier))
            && (rule.AccessMask & (int)PipeAccessRights.ReadWrite) != 0);
        return new(verified, protectedAcl, currentOnly, true, otherGranted);
    }

    internal static NamedPipeServerStream CreatePipe(string name)
    {
        PipeSecurity security = new();
        security.SetOwner(Sid);
        security.SetAccessRuleProtection(true, false);
        security.AddAccessRule(new PipeAccessRule(Sid, PipeAccessRights.FullControl, AccessControlType.Allow));
        var pipe = NamedPipeServerStreamAcl.Create(name, PipeDirection.InOut, 1, PipeTransmissionMode.Byte,
            PipeOptions.Asynchronous | PipeOptions.FirstPipeInstance | PipeOptions.WriteThrough, 65536, 65536,
            security, HandleInheritability.None, (PipeAccessRights)0);
        try { InspectAcl(pipe.SafePipeHandle); return pipe; }
        catch { pipe.Dispose(); throw; }
    }

    // Mutex ownership is thread-affine. This thread is the only steady-state
    // holder, in the Worker-lifetime Helper, including across async continuations.
    internal sealed class AuthorityMutex : IDisposable
    {
        private readonly ManualResetEventSlim release = new();
        private readonly Thread owner;
        internal AuthorityMutex()
        {
            using ManualResetEventSlim acquired = new();
            Exception? failure = null;
            owner = new Thread(() =>
            {
                nint descriptor = 0, mutex = 0;
                bool held = false;
                try
                {
                    if (!ConvertStringSecurityDescriptorToSecurityDescriptorW($"O:{Sid.Value}D:P(A;;GA;;;{Sid.Value})", 1, out descriptor, out _)) Fail("MUTEX_ACL_FAILED");
                    SecurityAttributes attributes = new() { Length = Marshal.SizeOf<SecurityAttributes>(), Descriptor = descriptor };
                    mutex = CreateMutexW(ref attributes, false, MutexName);
                    if (mutex == 0) Fail("AUTHORITY_MUTEX_AMBIGUOUS");
                    uint result = WaitForSingleObject(mutex, 0);
                    held = result is 0 or 128;
                    if (result == 128) throw new InvalidOperationException("ABANDONED_AUTHORITY_FAIL_CLOSED");
                    if (result != 0) throw new InvalidOperationException("AUTHORITY_ALREADY_HELD");
                }
                catch (Exception error) { failure = error; }
                finally { if (descriptor != 0) LocalFree(descriptor); acquired.Set(); }
                if (failure is null) release.Wait();
                if (held) ReleaseMutex(mutex);
                if (mutex != 0) CloseHandle(mutex);
            }) { IsBackground = true, Name = "Shaco authority mutex owner" };
            owner.Start();
            acquired.Wait();
            if (failure is not null) { owner.Join(); throw failure; }
        }
        public void Dispose() { release.Set(); owner.Join(); release.Dispose(); }
    }

    // Bootstrap-only Job setup. The final non-inheritable handle is duplicated
    // into Worker; Helper closes its setup handle before AUTHORITY_READY.
    internal sealed class WorkerJob : IDisposable
    {
        private nint job;
        internal WorkerJob(uint workerPid)
        {
            job = CreateJobObjectW(0, null);
            if (job == 0) Fail("CREATE_JOB_FAILED");
            JobLimits limits = new();
            limits.Basic.Flags = 0x2000;
            if (!SetInformationJobObject(job, 9, ref limits, (uint)Marshal.SizeOf<JobLimits>())) Fail("JOB_KILL_ON_CLOSE_FAILED");
            using SafeProcessHandle worker = OpenProcess(0x40 | 0x1000, false, workerPid);
            if (worker.IsInvalid || !DuplicateHandle(GetCurrentProcess(), job, worker.DangerousGetHandle(), out _, 0, false, 2)) Fail("WORKER_JOB_OWNERSHIP_FAILED");
            Assign((uint)Environment.ProcessId);
        }
        internal void Assign(uint pid)
        {
            using SafeProcessHandle process = OpenProcess(0x100 | 1 | 0x1000, false, pid);
            if (process.IsInvalid || !AssignProcessToJobObject(job, process) || !IsProcessInJob(process, job, out bool contained) || !contained) Fail("JOB_CONTAINMENT_FAILED");
        }
        public void Dispose() { if (job != 0) { CloseHandle(job); job = 0; } }
    }

    private static void Fail(string code) => throw new Win32Exception(Marshal.GetLastWin32Error(), code);
    [StructLayout(LayoutKind.Sequential)] private struct SecurityAttributes { internal int Length; internal nint Descriptor; internal int Inherit; }
    [StructLayout(LayoutKind.Sequential)] private struct BasicLimits { internal long ProcessTime, JobTime; internal uint Flags; internal nuint MinWorkingSet, MaxWorkingSet; internal uint ActiveProcessLimit; internal nuint Affinity; internal uint Priority, Scheduling; }
    [StructLayout(LayoutKind.Sequential)] private struct IoCounters { internal ulong ReadOps, WriteOps, OtherOps, ReadBytes, WriteBytes, OtherBytes; }
    [StructLayout(LayoutKind.Sequential)] private struct JobLimits { internal BasicLimits Basic; internal IoCounters Io; internal nuint ProcessMemory, JobMemory, PeakProcess, PeakJob; }
    [DllImport("kernel32.dll", SetLastError = true)] private static extern SafeProcessHandle OpenProcess(uint access, bool inherit, uint pid);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool GetProcessTimes(SafeProcessHandle process, out long start, out long exit, out long kernel, out long user);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool GetNamedPipeClientProcessId(SafePipeHandle pipe, out uint pid);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool GetNamedPipeServerProcessId(SafePipeHandle pipe, out uint pid);
    [DllImport("advapi32.dll", SetLastError = true)] private static extern bool GetKernelObjectSecurity(SafeHandle handle, uint info, byte[]? descriptor, uint length, out uint needed);
    [DllImport("advapi32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern bool ConvertStringSecurityDescriptorToSecurityDescriptorW(string sddl, uint revision, out nint descriptor, out uint length);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern nint CreateMutexW(ref SecurityAttributes attributes, bool owned, string name);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern nint OpenMutexW(uint access, bool inherit, string name);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern uint WaitForSingleObject(nint handle, uint milliseconds);
    [DllImport("kernel32.dll")] private static extern bool ReleaseMutex(nint handle);
    [DllImport("kernel32.dll")] private static extern bool CloseHandle(nint handle);
    [DllImport("kernel32.dll")] private static extern nint LocalFree(nint handle);
    [DllImport("kernel32.dll")] private static extern nint GetCurrentProcess();
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern nint CreateJobObjectW(nint attributes, string? name);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool SetInformationJobObject(nint job, int informationClass, ref JobLimits limits, uint length);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool DuplicateHandle(nint sourceProcess, nint source, nint targetProcess, out nint target, uint access, bool inherit, uint options);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool AssignProcessToJobObject(nint job, SafeProcessHandle process);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool IsProcessInJob(SafeProcessHandle process, nint job, out bool result);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern bool WaitNamedPipeW(string name, uint timeout);
}
