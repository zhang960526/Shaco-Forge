using System.Diagnostics;
using System.Security.AccessControl;
using System.Security.Principal;

namespace ShacoForge.NativeCarrier;

// Windows file protection only. ProductControl supplies the fixed managed root;
// the non-shipped native test executable supplies its explicit isolated root.
internal static class RuntimeFence
{
    internal static string Capture(string root, SecurityIdentifier sid)
    {
        var directory = new DirectoryInfo(root);
        var acl = directory.GetAccessControl();
        if (!sid.Equals(acl.GetOwner(typeof(SecurityIdentifier))) || !acl.AreAccessRulesProtected)
            throw new IOException("RUNTIME_FENCE_OWNER_REJECTED");
        if (acl.GetAccessRules(true, true, typeof(SecurityIdentifier)).Cast<FileSystemAccessRule>()
            .Any(rule => rule.AccessControlType == AccessControlType.Allow && !sid.Equals(rule.IdentityReference)))
            throw new IOException("RUNTIME_FENCE_SHARED_ROOT_REJECTED");
        return acl.GetSecurityDescriptorSddlForm(AccessControlSections.Access);
    }

    internal static void Apply(string root, SecurityIdentifier sid)
    {
        var directory = new DirectoryInfo(root);
        var acl = directory.GetAccessControl();
        acl.AddAccessRule(new FileSystemAccessRule(sid, FileSystemRights.ExecuteFile,
            InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit,
            PropagationFlags.None, AccessControlType.Deny));
        directory.SetAccessControl(acl);
        Verify(root, sid);
    }

    internal static void Verify(string root, SecurityIdentifier sid)
    {
        void Check(FileSystemInfo item)
        {
            if ((item.Attributes & FileAttributes.ReparsePoint) != 0) throw new IOException("RUNTIME_FENCE_REPARSE_REJECTED");
            FileSystemSecurity acl = item is DirectoryInfo directory ? directory.GetAccessControl() : ((FileInfo)item).GetAccessControl();
            if (!acl.GetAccessRules(true, true, typeof(SecurityIdentifier)).Cast<FileSystemAccessRule>().Any(rule =>
                rule.AccessControlType == AccessControlType.Deny && sid.Equals(rule.IdentityReference)
                && (rule.FileSystemRights & FileSystemRights.ExecuteFile) != 0)) throw new IOException("RUNTIME_FENCE_INCOMPLETE");
            if (item is DirectoryInfo dir) foreach (var child in dir.EnumerateFileSystemInfos()) Check(child);
        }
        Check(new DirectoryInfo(root));
    }

    internal static void Release(string root, string originalDacl)
    {
        var directory = new DirectoryInfo(root);
        var acl = directory.GetAccessControl();
        acl.SetSecurityDescriptorSddlForm(originalDacl, AccessControlSections.Access);
        var sid = WindowsIdentity.GetCurrent().User ?? throw new IOException("RUNTIME_FENCE_SID_UNAVAILABLE");
        var rules = acl.GetAccessRules(true, true, typeof(SecurityIdentifier)).Cast<FileSystemAccessRule>().ToArray();
        if (!acl.AreAccessRulesProtected || rules.Any(rule => rule.AccessControlType == AccessControlType.Allow && !sid.Equals(rule.IdentityReference))
            || !rules.Any(rule => rule.AccessControlType == AccessControlType.Allow && sid.Equals(rule.IdentityReference) && (rule.FileSystemRights & FileSystemRights.FullControl) == FileSystemRights.FullControl))
            throw new IOException("RUNTIME_FENCE_RESTORE_ACL_REJECTED");
        directory.SetAccessControl(acl);
    }

    internal static int ProcessCount(string root, bool requestDesktopClose)
    {
        int count = 0;
        foreach (var process in Process.GetProcesses())
        {
            using (process)
            {
                string? image;
                try { image = process.MainModule?.FileName; }
                catch (Exception error) when (error is System.ComponentModel.Win32Exception or InvalidOperationException) { continue; }
                if (image is null || !image.StartsWith(Path.TrimEndingDirectorySeparator(root) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) continue;
                count++;
                if (requestDesktopClose && Path.GetFileName(image).Equals("Shaco Forge.exe", StringComparison.OrdinalIgnoreCase))
                {
                    try { process.CloseMainWindow(); }
                    catch (InvalidOperationException) { }
                }
            }
        }
        return count;
    }
}
