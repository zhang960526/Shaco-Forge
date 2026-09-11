using System.Diagnostics;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text.Json;
using ShacoForge.NativeCarrier;

if (args.Length > 0 && args[0] == "--fixture") { IsolatedBoundary.Run(args); return; }

// NOT_SHIPPED: isolated OS verification; no production known-folder override.
string boundary = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "dist", "slice3-step2-native-tests"));
Directory.CreateDirectory(boundary);
if (args.Length == 2 && args[0] == "--fence-child")
{
    string isolated = Path.GetFullPath(args[1]);
    if (!isolated.StartsWith(boundary + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new Exception("TEST_BOUNDARY_REJECTED");
    RuntimeFence.Apply(isolated, WindowsIdentity.GetCurrent().User!);
    Environment.Exit(37);
}
string root = Path.Combine(boundary, Guid.NewGuid().ToString("N"));
var sid = WindowsIdentity.GetCurrent().User ?? throw new Exception("SID unavailable");
var acl = new DirectorySecurity();
acl.SetOwner(sid);
acl.SetAccessRuleProtection(true, false);
acl.AddAccessRule(new FileSystemAccessRule(sid, FileSystemRights.FullControl,
    InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.None, AccessControlType.Allow));
new DirectoryInfo(root).Create(acl);
string executable = Path.Combine(root, "fixture.exe");
File.Copy(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "cmd.exe"), executable);
bool Launch(string path)
{
    try
    {
        using var child = Process.Start(new ProcessStartInfo(path, "/c exit 0") { UseShellExecute = false, CreateNoWindow = true })!;
        if (!child.WaitForExit(5000)) throw new Exception("FIXTURE_TIMEOUT");
        return child.ExitCode == 0;
    }
    catch (System.ComponentModel.Win32Exception error) when (error.NativeErrorCode == 5) { return false; }
}
if (!Launch(executable)) throw new Exception("INITIAL_FIXTURE_FAILED");
string original = RuntimeFence.Capture(root, sid);
using (var fenceChild = Process.Start(new ProcessStartInfo(Environment.ProcessPath!, "--fence-child \"" + root + "\"") { UseShellExecute = false, CreateNoWindow = true })!)
{
    if (!fenceChild.WaitForExit(10000) || fenceChild.ExitCode != 37) throw new Exception("FENCE_CHILD_FAILED");
}
RuntimeFence.Verify(root, sid);
if (Launch(executable)) throw new Exception("FENCED_EXECUTION_ALLOWED");
// ACL authority survives the caller and covers replacement files by inheritance.
File.Copy(executable, Path.Combine(root, "restored.exe"));
RuntimeFence.Verify(root, sid);
if (Launch(Path.Combine(root, "restored.exe"))) throw new Exception("RESTORED_EXECUTION_ALLOWED");
if (File.ReadAllBytes(executable).Length == 0) throw new Exception("BACKUP_READ_FAILED");
RuntimeFence.Release(root, original);
if (!Launch(executable) || !Launch(Path.Combine(root, "restored.exe"))) throw new Exception("UNFENCE_FAILED");
Console.WriteLine(JsonSerializer.Serialize(new { result = "PASS", root, currentUserOnly = true,
    fenceCallerExited = true, initialExecution = true, fencedExecution = false, inheritedFenceExecution = false, backupReadable = true,
    releaseExecution = true, implementation = "shared RuntimeFence.cs", productionDataWrites = 0 }));
