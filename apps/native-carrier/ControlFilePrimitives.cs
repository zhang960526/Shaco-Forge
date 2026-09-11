using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Text.Json;

namespace ShacoForge.NativeCarrier;

// Shared OS primitives; callers must first enforce their production or explicit
// non-shipped isolated root boundary.
internal static class ControlFilePrimitives
{
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool MoveFileEx(string source, string destination, uint flags);
    internal static object VerifyTree(string path)
    {
        ProductHome.RequirePrivate(new DirectoryInfo(path));
        int checkedCount = 0;
        void Check(FileSystemInfo item)
        {
            if ((item.Attributes & FileAttributes.ReparsePoint) != 0) throw new IOException("CONTROL_REPARSE_REJECTED");
            FileSystemSecurity acl = item is DirectoryInfo directory ? directory.GetAccessControl() : ((FileInfo)item).GetAccessControl();
            if (!WindowsAuthority.Sid.Equals(acl.GetOwner(typeof(SecurityIdentifier)))) throw new IOException("CONTROL_OWNER_REJECTED");
            var rules = acl.GetAccessRules(true, true, typeof(SecurityIdentifier)).Cast<FileSystemAccessRule>().ToArray();
            if (!rules.Any(rule => rule.AccessControlType == AccessControlType.Allow && rule.IdentityReference.Equals(WindowsAuthority.Sid))
                || rules.Any(rule => rule.AccessControlType == AccessControlType.Allow && !rule.IdentityReference.Equals(WindowsAuthority.Sid))) throw new IOException("CONTROL_ACL_REJECTED");
            checkedCount++;
            if (item is DirectoryInfo dir) foreach (var child in dir.EnumerateFileSystemInfos()) Check(child);
        }
        Check(new DirectoryInfo(path));
        return new { currentUserOnly = true, checkedCount, reparse = false };
    }
    internal static object PublishJournal(string directory, string value)
    {
        if (Encoding.UTF8.GetByteCount(value) > 262144) throw new IOException("CONTROL_JOURNAL_SIZE_REJECTED");
        using var parsed = JsonDocument.Parse(value);
        if (!parsed.RootElement.TryGetProperty("state", out _) || !parsed.RootElement.TryGetProperty("id", out _)) throw new IOException("CONTROL_JOURNAL_INVALID");
        string target = Path.Combine(directory, "upgrade-journal.json");
        if (File.Exists(target) && (File.GetAttributes(target) & FileAttributes.ReparsePoint) != 0) throw new IOException("CONTROL_JOURNAL_REPARSE_REJECTED");
        string pending = Path.Combine(directory, "journal-" + Guid.NewGuid().ToString("N") + ".tmp");
        using (var stream = new FileStream(pending, FileMode.CreateNew, FileAccess.Write, FileShare.None, 4096, FileOptions.WriteThrough))
        {
            stream.Write(new UTF8Encoding(false, true).GetBytes(value));
            stream.Flush(true);
        }
        // MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH.
        if (!MoveFileEx(pending, target, 0x1 | 0x8)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        return new { durable = true, replacement = "MOVEFILE_WRITE_THROUGH", currentUserOnly = true };
    }
}
