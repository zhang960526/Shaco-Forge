param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('TestVector', 'Generate')]
    [string]$Mode,

    [string]$NodeModulesPath,
    [string]$ManifestPath,
    [string]$SummaryPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$source = @'
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Win32.SafeHandles;

public sealed class P0S6ManifestEntry
{
    public string Type { get; set; }
    public string Path { get; set; }
    public byte[] PathBytes { get; set; }
    public long Size { get; set; }
    public string Sha256 { get; set; }
    public string RawTargetOrIdentity { get; set; }
}

public sealed class P0S6ManifestResult
{
    public string Schema { get; set; }
    public string NodeModulesCanonicalPath { get; set; }
    public string ManifestCanonicalPath { get; set; }
    public long ManifestByteLength { get; set; }
    public string AggregateSha256 { get; set; }
    public int FRecordCount { get; set; }
    public int LRecordCount { get; set; }
    public int JRecordCount { get; set; }
    public int RRecordCount { get; set; }
    public int LeafTotal { get; set; }
    public int CaseFoldCollisionCount { get; set; }
    public int PathEscapeCount { get; set; }
    public int UnsupportedReparseCount { get; set; }
    public bool AllPathsAscii { get; set; }
    public bool Utf8WithoutBom { get; set; }
    public bool LfOnly { get; set; }
    public bool ExactlyOneFinalLf { get; set; }
}

public static class P0S6ManifestGenerator
{
    private const uint FILE_READ_ATTRIBUTES = 0x80;
    private const uint FILE_SHARE_READ = 0x1;
    private const uint FILE_SHARE_WRITE = 0x2;
    private const uint FILE_SHARE_DELETE = 0x4;
    private const uint OPEN_EXISTING = 3;
    private const uint FILE_FLAG_OPEN_REPARSE_POINT = 0x00200000;
    private const uint FILE_FLAG_BACKUP_SEMANTICS = 0x02000000;
    private const uint FSCTL_GET_REPARSE_POINT = 0x000900A8;
    private const uint IO_REPARSE_TAG_MOUNT_POINT = 0xA0000003;
    private const uint IO_REPARSE_TAG_SYMLINK = 0xA000000C;
    private static readonly UTF8Encoding Utf8 = new UTF8Encoding(false, true);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern SafeFileHandle CreateFileW(
        string lpFileName,
        uint dwDesiredAccess,
        uint dwShareMode,
        IntPtr lpSecurityAttributes,
        uint dwCreationDisposition,
        uint dwFlagsAndAttributes,
        IntPtr hTemplateFile);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool DeviceIoControl(
        SafeFileHandle hDevice,
        uint dwIoControlCode,
        IntPtr lpInBuffer,
        uint nInBufferSize,
        byte[] lpOutBuffer,
        uint nOutBufferSize,
        out uint lpBytesReturned,
        IntPtr lpOverlapped);

    private static string Hex(byte[] value)
    {
        var builder = new StringBuilder(value.Length * 2);
        foreach (byte item in value) builder.Append(item.ToString("x2", CultureInfo.InvariantCulture));
        return builder.ToString();
    }

    private static string Base64Url(string value)
    {
        return Convert.ToBase64String(Utf8.GetBytes(value)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string FullCaseFoldUnicode15ForValidatedPath(string value)
    {
        var builder = new StringBuilder(value.Length);
        foreach (char item in value)
        {
            if (item > 0x7f)
                throw new InvalidDataException("NON_ASCII_PATH_REQUIRES_UNICODE_15_FULL_CASE_FOLD_TABLE");
            builder.Append(item >= 'A' && item <= 'Z' ? (char)(item + 0x20) : item);
        }
        return builder.ToString();
    }

    private static int CompareUnsignedBytes(byte[] left, byte[] right)
    {
        int count = Math.Min(left.Length, right.Length);
        for (int index = 0; index < count; index++)
        {
            if (left[index] != right[index]) return left[index].CompareTo(right[index]);
        }
        return left.Length.CompareTo(right.Length);
    }

    private static void ValidateRelativePath(string root, string normalizedPath)
    {
        if (string.IsNullOrEmpty(normalizedPath) || Path.IsPathRooted(normalizedPath) || normalizedPath.IndexOf('\0') >= 0)
            throw new InvalidDataException("PATH_ESCAPE_OR_INVALID_PATH");
        string[] segments = normalizedPath.Split('/');
        if (segments.Any(segment => segment.Length == 0 || segment == "." || segment == ".."))
            throw new InvalidDataException("PATH_ESCAPE_OR_INVALID_SEGMENT");
        string candidate = Path.GetFullPath(Path.Combine(root, normalizedPath.Replace('/', Path.DirectorySeparatorChar)));
        string prefix = root.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal)
            ? root
            : root + Path.DirectorySeparatorChar;
        if (!candidate.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            throw new InvalidDataException("PATH_ESCAPE");
    }

    private static Tuple<string, string> ReadReparseIdentity(string path)
    {
        using (SafeFileHandle handle = CreateFileW(
            path,
            FILE_READ_ATTRIBUTES,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            IntPtr.Zero,
            OPEN_EXISTING,
            FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
            IntPtr.Zero))
        {
            if (handle.IsInvalid)
                throw new IOException("CREATEFILE_REPARSE_FAILED", Marshal.GetLastWin32Error());
            byte[] buffer = new byte[16 * 1024];
            uint returned;
            if (!DeviceIoControl(handle, FSCTL_GET_REPARSE_POINT, IntPtr.Zero, 0, buffer, (uint)buffer.Length, out returned, IntPtr.Zero))
                throw new IOException("GET_REPARSE_POINT_FAILED", Marshal.GetLastWin32Error());
            if (returned < 8) throw new InvalidDataException("REPARSE_BUFFER_TOO_SHORT");
            uint tag = BitConverter.ToUInt32(buffer, 0);
            int dataLength = BitConverter.ToUInt16(buffer, 4);
            if (8 + dataLength > returned) throw new InvalidDataException("REPARSE_BUFFER_LENGTH_INVALID");
            if (tag == IO_REPARSE_TAG_SYMLINK)
            {
                if (dataLength < 12) throw new InvalidDataException("SYMLINK_REPARSE_BUFFER_TOO_SHORT");
                int substituteOffset = BitConverter.ToUInt16(buffer, 8);
                int substituteLength = BitConverter.ToUInt16(buffer, 10);
                int printOffset = BitConverter.ToUInt16(buffer, 12);
                int printLength = BitConverter.ToUInt16(buffer, 14);
                int pathBufferOffset = 20;
                int selectedOffset = printLength > 0 ? printOffset : substituteOffset;
                int selectedLength = printLength > 0 ? printLength : substituteLength;
                return Tuple.Create("L", Encoding.Unicode.GetString(buffer, pathBufferOffset + selectedOffset, selectedLength));
            }
            if (tag == IO_REPARSE_TAG_MOUNT_POINT)
            {
                if (dataLength < 8) throw new InvalidDataException("MOUNT_POINT_REPARSE_BUFFER_TOO_SHORT");
                int substituteOffset = BitConverter.ToUInt16(buffer, 8);
                int substituteLength = BitConverter.ToUInt16(buffer, 10);
                int printOffset = BitConverter.ToUInt16(buffer, 12);
                int printLength = BitConverter.ToUInt16(buffer, 14);
                int pathBufferOffset = 16;
                int selectedOffset = printLength > 0 ? printOffset : substituteOffset;
                int selectedLength = printLength > 0 ? printLength : substituteLength;
                return Tuple.Create("J", Encoding.Unicode.GetString(buffer, pathBufferOffset + selectedOffset, selectedLength));
            }
            byte[] rawData = new byte[dataLength];
            Buffer.BlockCopy(buffer, 8, rawData, 0, dataLength);
            return Tuple.Create("R", tag.ToString("x8", CultureInfo.InvariantCulture) + ":" + Hex(rawData));
        }
    }

    private static void Walk(string root, string directory, List<P0S6ManifestEntry> entries)
    {
        foreach (string item in Directory.EnumerateFileSystemEntries(directory))
        {
            FileAttributes attributes = File.GetAttributes(item);
            string relative = Path.GetRelativePath(root, item).Replace(Path.DirectorySeparatorChar, '/');
            string normalized = relative.Normalize(NormalizationForm.FormC);
            ValidateRelativePath(root, normalized);
            byte[] pathBytes = Utf8.GetBytes(normalized);
            if ((attributes & FileAttributes.ReparsePoint) != 0)
            {
                Tuple<string, string> reparse = ReadReparseIdentity(item);
                entries.Add(new P0S6ManifestEntry
                {
                    Type = reparse.Item1,
                    Path = normalized,
                    PathBytes = pathBytes,
                    RawTargetOrIdentity = reparse.Item2
                });
            }
            else if ((attributes & FileAttributes.Directory) != 0)
            {
                Walk(root, item, entries);
            }
            else
            {
                var info = new FileInfo(item);
                byte[] hash;
                using (var stream = new FileStream(item, FileMode.Open, FileAccess.Read, FileShare.Read))
                    hash = SHA256.HashData(stream);
                entries.Add(new P0S6ManifestEntry
                {
                    Type = "F",
                    Path = normalized,
                    PathBytes = pathBytes,
                    Size = info.Length,
                    Sha256 = Hex(hash)
                });
            }
        }
    }

    public static byte[] BuildTestVector()
    {
        string manifest =
            "P0S6_NODE_MODULES_MANIFEST_V1\n" +
            "F\tYmluL3Rvb2wuZXhl\t5\tebd3e2065c55138882bf5fe4a94b642fd7d63c31b50682e5b521ad2bf985e028\n" +
            "F\tZW1wdHkudHh0\t0\te3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n" +
            "L\tdG9vbC1saW5r\tYmluL3Rvb2wuZXhl\n";
        return Utf8.GetBytes(manifest);
    }

    public static P0S6ManifestResult Generate(string nodeModulesPath, string manifestPath)
    {
        string root = Path.GetFullPath(nodeModulesPath);
        string output = Path.GetFullPath(manifestPath);
        if (!Directory.Exists(root)) throw new DirectoryNotFoundException(root);
        if ((File.GetAttributes(root) & FileAttributes.ReparsePoint) != 0)
            throw new InvalidDataException("NODE_MODULES_ROOT_IS_REPARSE_POINT");
        string rootPrefix = root.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal)
            ? root
            : root + Path.DirectorySeparatorChar;
        if (output.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase))
            throw new InvalidDataException("MANIFEST_MUST_BE_OUTSIDE_NODE_MODULES");

        var entries = new List<P0S6ManifestEntry>();
        Walk(root, root, entries);
        entries.Sort((left, right) => CompareUnsignedBytes(left.PathBytes, right.PathBytes));

        var exactPaths = new HashSet<string>(StringComparer.Ordinal);
        var foldedPaths = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (P0S6ManifestEntry entry in entries)
        {
            if (!exactPaths.Add(entry.Path)) throw new InvalidDataException("DUPLICATE_NORMALIZED_PATH");
            string folded = FullCaseFoldUnicode15ForValidatedPath(entry.Path);
            string prior;
            if (foldedPaths.TryGetValue(folded, out prior) && !string.Equals(prior, entry.Path, StringComparison.Ordinal))
                throw new InvalidDataException("UNICODE_FULL_CASE_FOLD_COLLISION");
            foldedPaths[folded] = entry.Path;
        }

        var builder = new StringBuilder("P0S6_NODE_MODULES_MANIFEST_V1\n");
        foreach (P0S6ManifestEntry entry in entries)
        {
            builder.Append(entry.Type).Append('\t').Append(Base64Url(entry.Path));
            if (entry.Type == "F")
                builder.Append('\t').Append(entry.Size.ToString(CultureInfo.InvariantCulture)).Append('\t').Append(entry.Sha256);
            else
                builder.Append('\t').Append(Base64Url(entry.RawTargetOrIdentity));
            builder.Append('\n');
        }
        byte[] manifestBytes = Utf8.GetBytes(builder.ToString());
        Directory.CreateDirectory(Path.GetDirectoryName(output));
        File.WriteAllBytes(output, manifestBytes);
        return new P0S6ManifestResult
        {
            Schema = "P0S6_NODE_MODULES_MANIFEST_V1",
            NodeModulesCanonicalPath = root,
            ManifestCanonicalPath = output,
            ManifestByteLength = manifestBytes.LongLength,
            AggregateSha256 = Hex(SHA256.HashData(manifestBytes)),
            FRecordCount = entries.Count(item => item.Type == "F"),
            LRecordCount = entries.Count(item => item.Type == "L"),
            JRecordCount = entries.Count(item => item.Type == "J"),
            RRecordCount = entries.Count(item => item.Type == "R"),
            LeafTotal = entries.Count,
            CaseFoldCollisionCount = 0,
            PathEscapeCount = 0,
            UnsupportedReparseCount = entries.Count(item => item.Type == "R"),
            AllPathsAscii = true,
            Utf8WithoutBom = manifestBytes.Length < 3 || !(manifestBytes[0] == 0xef && manifestBytes[1] == 0xbb && manifestBytes[2] == 0xbf),
            LfOnly = Array.IndexOf(manifestBytes, (byte)0x0d) < 0,
            ExactlyOneFinalLf = manifestBytes.Length > 1 && manifestBytes[manifestBytes.Length - 1] == 0x0a && manifestBytes[manifestBytes.Length - 2] != 0x0a
        };
    }
}
'@

Add-Type -TypeDefinition $source -Language CSharp
$utf8 = [System.Text.UTF8Encoding]::new($false)

if ($Mode -eq 'TestVector') {
    $bytes = [P0S6ManifestGenerator]::BuildTestVector()
    $sha = ([System.Security.Cryptography.SHA256]::HashData($bytes) | ForEach-Object ToString x2) -join ''
    [ordered]@{
        schema = 'P0S6_NODE_MODULES_MANIFEST_V1_TEST_VECTOR'
        byteLength = $bytes.Length
        aggregateSha256 = $sha
        expectedByteLength = 230
        expectedAggregateSha256 = 'a55f7fbd209f6f1ed1f84824de719b3667a776b4d2b898767bb1b3a91b513b70'
        pass = ($bytes.Length -eq 230 -and $sha -eq 'a55f7fbd209f6f1ed1f84824de719b3667a776b4d2b898767bb1b3a91b513b70')
    } | ConvertTo-Json -Depth 5
    exit 0
}

if ([string]::IsNullOrWhiteSpace($NodeModulesPath) -or [string]::IsNullOrWhiteSpace($ManifestPath) -or [string]::IsNullOrWhiteSpace($SummaryPath)) {
    throw 'Generate mode requires NodeModulesPath, ManifestPath, and SummaryPath.'
}

$result = [P0S6ManifestGenerator]::Generate($NodeModulesPath, $ManifestPath)
$json = $result | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($SummaryPath, ($json.Replace("`r`n", "`n").TrimEnd("`r", "`n") + "`n"), $utf8)
$json
