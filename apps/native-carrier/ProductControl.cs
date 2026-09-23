using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Text.Json;

namespace ShacoForge.NativeCarrier;

// Windows-only path, ACL and durable-rename primitives. No Agent semantics.
internal static class ProductControl
{
    private static string Local => ProductHome.KnownFolder(new Guid("F1B32785-6FBA-4FCF-9D55-7B8E7F157091"));
    private static string Root => Path.Combine(Local, "Shaco Forge");
    private static string Install => Path.Combine(Local, "Programs", "Shaco Forge");
    private static bool Inside(string root, string path) => path.Equals(root, StringComparison.OrdinalIgnoreCase)
        || path.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);

    internal static object Select(string installRoot)
    {
        string product = Root;
        ProductHome.CheckAncestors(product);
        string install = Path.GetFullPath(installRoot);
        if (!Path.IsPathFullyQualified(installRoot) || Inside(product, install) || Inside(install, product)) throw new IOException("DSH_HOME_PATH_REJECTED");
        if (Directory.Exists(product)) ProductHome.RequirePrivate(new DirectoryInfo(product));
        foreach (string child in new[] { "dsh", "control", "backup" })
        {
            string path = Path.Combine(product, child);
            ProductHome.CheckAncestors(path);
            if (Directory.Exists(path)) ProductHome.RequirePrivate(new DirectoryInfo(path));
        }
        string dsh = Path.Combine(product, "dsh");
        if (Directory.Exists(dsh)) ProductHome.RequirePrivate(new DirectoryInfo(dsh));
        return new { productDataRoot = product, dshHome = dsh, controlRoot = Path.Combine(product, "control"),
            backupRoot = Path.Combine(product, "backup"), installRoot = Path.Combine(Local, "Programs", "Shaco Forge"),
            canonical = true, source = "SHGetKnownFolderPath_CURRENT_USER", writes = 0 };
    }
    private static string Managed(string input)
    {
        string path = Path.GetFullPath(input);
        if (!Path.IsPathFullyQualified(input) || (!Inside(Root, path) && !Inside(Install, path))) throw new IOException("CONTROL_PATH_REJECTED");
        ProductHome.CheckAncestors(path);
        return path;
    }
    internal static object Protect(string input)
    {
        string path = Managed(input);
        string boundary = Inside(Root, path) ? Root : Install;
        // Build one level at a time with the intended ACL at creation time.
        var missing = new Stack<string>();
        for (string? item = path; item is not null && Inside(boundary, item) && !Directory.Exists(item); item = Path.GetDirectoryName(item)) missing.Push(item);
        while (missing.Count != 0) ProductHome.CreatePrivate(missing.Pop());
        ProductHome.RequirePrivate(new DirectoryInfo(path));
        return new { canonical = true, currentUserOnly = true };
    }
    internal static object VerifyTree(string input) => ControlFilePrimitives.VerifyTree(Managed(input));
    internal static object PublishJournal(string input)
    {
        string directory = Managed(input);
        if (!directory.Equals(Path.Combine(Root, "control"), StringComparison.OrdinalIgnoreCase)) throw new IOException("CONTROL_JOURNAL_ROOT_REJECTED");
        Protect(directory);
        return ControlFilePrimitives.PublishJournal(directory, Console.In.ReadToEnd());
    }
    internal static object Fence(string operation)
    {
        string root = Managed(Path.Combine(Install, "current"));
        ProductHome.RequirePrivate(new DirectoryInfo(root));
        if (operation == "capture") return new { dacl = RuntimeFence.Capture(root, WindowsAuthority.Sid) };
        if (operation == "apply") { RuntimeFence.Apply(root, WindowsAuthority.Sid); return new { fenced = true }; }
        if (operation == "verify") { RuntimeFence.Verify(root, WindowsAuthority.Sid); return new { fenced = true }; }
        if (operation == "release")
        {
            string original = Console.In.ReadToEnd();
            if (original.Length > 65536) throw new IOException("RUNTIME_FENCE_METADATA_REJECTED");
            RuntimeFence.Release(root, original); return new { fenced = false };
        }
        if (operation == "processes" || operation == "close-desktop")
            return new { processCount = RuntimeFence.ProcessCount(root, operation == "close-desktop") };
        throw new IOException("RUNTIME_FENCE_OPERATION_REJECTED");
    }
    internal static object WindowsSystemPath() => new { powershell = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell", "v1.0", "powershell.exe") };
    internal static object AssertRegistrationClear()
    {
        using var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\ShacoForge");
        if (key is not null) throw new IOException("PRODUCT_REGISTRATION_ALREADY_EXISTS");
        return new { absent = true, writes = 0 };
    }
    internal static object ValidateRegistration(string version, bool remove)
    {
        const string registryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\ShacoForge";
        using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(registryPath))
        {
            if (key is null) return new { absent = true, writes = 0 };
            var expected = new Dictionary<string, object> {
                ["DisplayName"] = "Shaco Forge", ["DisplayVersion"] = version, ["Publisher"] = "Shaco Forge",
                ["InstallLocation"] = Path.Combine(Install, "current"), ["UninstallString"] = "\"" + Path.Combine(Install, "installer.exe") + "\" /UNINSTALL",
                ["NoModify"] = 1, ["NoRepair"] = 1,
            };
            if (key.GetSubKeyNames().Length != 0 || key.GetValueNames().Any(name => !expected.TryGetValue(name, out var value) || !Equals(key.GetValue(name), value)))
                throw new IOException("PRODUCT_REGISTRATION_OWNERSHIP_REJECTED");
        }
        if (remove) Microsoft.Win32.Registry.CurrentUser.DeleteSubKey(registryPath, false);
        return new { owned = true, removed = remove };
    }
    internal static object Register(string version)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(version, "^[0-9A-Za-z.-]{1,60}$")) throw new IOException("PRODUCT_VERSION_REJECTED");
        string installer = Path.Combine(Install, "installer.exe");
        Managed(installer);
        using var key = Microsoft.Win32.Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\ShacoForge");
        key.SetValue("DisplayName", "Shaco Forge");
        key.SetValue("DisplayVersion", version);
        key.SetValue("Publisher", "Shaco Forge");
        key.SetValue("InstallLocation", Path.Combine(Install, "current"));
        key.SetValue("UninstallString", "\"" + installer + "\" /UNINSTALL");
        key.SetValue("NoModify", 1, Microsoft.Win32.RegistryValueKind.DWord);
        key.SetValue("NoRepair", 1, Microsoft.Win32.RegistryValueKind.DWord);
        return new { perUser = true, registered = true };
    }
    internal static object Unregister()
    {
        Microsoft.Win32.Registry.CurrentUser.DeleteSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\ShacoForge", false);
        return new { perUser = true, registered = false };
    }
}
