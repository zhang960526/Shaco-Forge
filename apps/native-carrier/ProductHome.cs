using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Principal;

namespace ShacoForge.NativeCarrier;

// Thin Windows known-folder/ACL adapter. Worker alone selects and injects DSH_HOME.
internal static class ProductHome
{
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = true)]
    private static extern int SHGetKnownFolderPath(in Guid id, uint flags, nint token, out nint path);

    private static string KnownFolder(Guid id)
    {
        int result = SHGetKnownFolderPath(in id, 0, 0, out nint pointer);
        if (result != 0) Marshal.ThrowExceptionForHR(result);
        try { return Path.GetFullPath(Marshal.PtrToStringUni(pointer) ?? throw new IOException("KNOWN_FOLDER_UNAVAILABLE")); }
        finally { Marshal.FreeCoTaskMem(pointer); }
    }

    private static bool Inside(string root, string path) => path.Equals(root, StringComparison.OrdinalIgnoreCase)
        || path.StartsWith(Path.TrimEndingDirectorySeparator(root) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);

    internal static object Inspect() => new {
        localApplicationData = KnownFolder(new Guid("F1B32785-6FBA-4FCF-9D55-7B8E7F157091")),
        userProfile = KnownFolder(new Guid("5E6C858F-0E22-4760-9AFE-EA3317B67173")),
        source = "SHGetKnownFolderPath_CURRENT_USER"
    };

    private static void CheckAncestors(string path)
    {
        for (DirectoryInfo? dir = new(path); dir is not null; dir = dir.Parent)
            if (dir.Exists && (dir.Attributes & FileAttributes.ReparsePoint) != 0) throw new IOException("DSH_HOME_REPARSE_REJECTED");
    }

    private static void RequirePrivate(DirectoryInfo dir)
    {
        DirectorySecurity acl = dir.GetAccessControl();
        if (!WindowsAuthority.Sid.Equals(acl.GetOwner(typeof(SecurityIdentifier))) || !acl.AreAccessRulesProtected)
            throw new UnauthorizedAccessException("DSH_HOME_ACL_REJECTED");
        var rules = acl.GetAccessRules(true, true, typeof(SecurityIdentifier)).Cast<FileSystemAccessRule>().ToArray();
        if (!rules.Any(rule => rule.AccessControlType == AccessControlType.Allow && rule.IdentityReference.Equals(WindowsAuthority.Sid)
                && (rule.FileSystemRights & FileSystemRights.FullControl) == FileSystemRights.FullControl)
            || rules.Any(rule => rule.AccessControlType == AccessControlType.Allow && !rule.IdentityReference.Equals(WindowsAuthority.Sid)))
            throw new UnauthorizedAccessException("DSH_HOME_SHARED_ACL_REJECTED");
    }

    private static void CreatePrivate(string path)
    {
        CheckAncestors(path);
        DirectoryInfo dir = new(path);
        if (!dir.Exists)
        {
            DirectorySecurity acl = new();
            acl.SetOwner(WindowsAuthority.Sid);
            acl.SetAccessRuleProtection(true, false);
            acl.AddAccessRule(new FileSystemAccessRule(WindowsAuthority.Sid, FileSystemRights.FullControl,
                InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.None, AccessControlType.Allow));
            dir.Create(acl);
        }
        CheckAncestors(path);
        RequirePrivate(dir);
    }

    internal static object Resolve(string installRoot, string callerCwd, string? expected = null)
    {
        string local = KnownFolder(new Guid("F1B32785-6FBA-4FCF-9D55-7B8E7F157091"));
        string user = KnownFolder(new Guid("5E6C858F-0E22-4760-9AFE-EA3317B67173"));
        string product = Path.Combine(local, "Shaco Forge");
        string dsh = Path.Combine(product, "dsh");
        CheckAncestors(local);
        if (!Path.IsPathFullyQualified(local) || local.StartsWith(@"\\", StringComparison.Ordinal)
            || !Inside(user, local) || Inside(Path.Combine(local, "Temp"), product)
            || Inside(Path.GetFullPath(installRoot), product) || Inside(product, Path.GetFullPath(installRoot))
            || Inside(Path.GetFullPath(callerCwd), dsh) || Inside(dsh, Path.GetFullPath(callerCwd))
            || expected is not null && !Path.GetFullPath(expected).Equals(dsh, StringComparison.OrdinalIgnoreCase))
            throw new IOException("DSH_HOME_PATH_REJECTED");
        CreatePrivate(product);
        CreatePrivate(dsh);
        string probe = Path.Combine(dsh, ".shaco-write-probe-" + Guid.NewGuid().ToString("N"));
        using (new FileStream(probe, FileMode.CreateNew, FileAccess.Write, FileShare.None, 1, FileOptions.DeleteOnClose)) { }
        CheckAncestors(dsh);
        return new { dshHome = dsh, productDataRoot = product, knownFolder = local, canonical = true,
            currentUserOnly = true, writable = true, reparseRejected = true, source = "SHGetKnownFolderPath_CURRENT_USER" };
    }
}
