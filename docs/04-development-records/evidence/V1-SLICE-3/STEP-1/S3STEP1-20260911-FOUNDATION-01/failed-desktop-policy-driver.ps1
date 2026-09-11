param(
    [ValidateSet('packaged-startup-probe', 'smoke:packaged-runtime')]
    [string]$Command = 'packaged-startup-probe'
)
$ErrorActionPreference = 'Stop'
# Test driver only. Run with the user's approved normal Windows test context.
# This opts out of the calling MSIX desktop app's filesystem virtualization;
# it does not change a token, job, ACL, product home rule or product executable.
# https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute
Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
public static class ShacoDesktopTest {
    [StructLayout(LayoutKind.Sequential)] struct StartupInfo {
        public int Size; public IntPtr Reserved, Desktop, Title;
        public int X, Y, XSize, YSize, XChars, YChars, Fill, Flags;
        public short ShowWindow, ReservedSize;
        public IntPtr ReservedBytes, Input, Output, Error;
    }
    [StructLayout(LayoutKind.Sequential)] struct StartupInfoEx { public StartupInfo Info; public IntPtr Attributes; }
    [StructLayout(LayoutKind.Sequential)] struct ProcessInfo { public IntPtr Process, Thread; public uint ProcessId, ThreadId; }
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool InitializeProcThreadAttributeList(IntPtr list, int count, int flags, ref IntPtr size);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool UpdateProcThreadAttribute(IntPtr list, uint flags, IntPtr attribute, IntPtr value, IntPtr size, IntPtr previous, IntPtr returned);
    [DllImport("kernel32.dll")] static extern void DeleteProcThreadAttributeList(IntPtr list);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateProcessW(string app, StringBuilder command, IntPtr processAttributes, IntPtr threadAttributes, bool inherit, uint flags, IntPtr environment, string cwd, ref StartupInfoEx startup, out ProcessInfo process);
    [DllImport("kernel32.dll")] static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool GetExitCodeProcess(IntPtr process, out uint code);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
    public static int Run(string app, string arguments, string cwd) {
        IntPtr size = IntPtr.Zero;
        InitializeProcThreadAttributeList(IntPtr.Zero, 1, 0, ref size);
        IntPtr list = Marshal.AllocHGlobal(size), value = Marshal.AllocHGlobal(4);
        bool initialized = false;
        ProcessInfo process = new ProcessInfo();
        try {
            if (!InitializeProcThreadAttributeList(list, 1, 0, ref size)) throw new Win32Exception();
            initialized = true;
            Marshal.WriteInt32(value, 1); // PROCESS_CREATION_DESKTOP_APP_BREAKAWAY_ENABLE_PROCESS_TREE
            if (!UpdateProcThreadAttribute(list, 0, (IntPtr)0x20012, value, (IntPtr)4, IntPtr.Zero, IntPtr.Zero)) throw new Win32Exception();
            StartupInfoEx startup = new StartupInfoEx();
            startup.Info.Size = Marshal.SizeOf<StartupInfoEx>();
            startup.Info.Flags = 1; // STARTF_USESHOWWINDOW, SW_HIDE
            startup.Attributes = list;
            if (!CreateProcessW(app, new StringBuilder("\"" + app + "\" " + arguments), IntPtr.Zero, IntPtr.Zero, false,
                0x08080000, IntPtr.Zero, cwd, ref startup, out process)) throw new Win32Exception();
            while (WaitForSingleObject(process.Process, 1000) == 258) {}
            if (!GetExitCodeProcess(process.Process, out uint code)) throw new Win32Exception();
            return checked((int)code);
        } finally {
            if (process.Thread != IntPtr.Zero) CloseHandle(process.Thread);
            if (process.Process != IntPtr.Zero) CloseHandle(process.Process);
            if (initialized) DeleteProcThreadAttributeList(list);
            Marshal.FreeHGlobal(list); Marshal.FreeHGlobal(value);
        }
    }
}
'@
$testRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$testNode = 'C:\Users\18902\AppData\Local\Temp\shaco-forge-v1-slice-1a-toolchain\node-v22.19.0-win-x64\node.exe'
$env:SHACO_FORGE_DESKTOP_TEST_ENVIRONMENT = 'WINDOWS_DESKTOP_APP_POLICY_ENABLE_PROCESS_TREE'
exit [ShacoDesktopTest]::Run($testNode, ('"scripts/slice3-step1-command.mjs" "' + $Command + '"'), $testRoot)
