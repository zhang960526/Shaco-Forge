using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;

namespace ShacoForge.NativeCarrier;

// OS Authenticode verification and public metadata only; no private-key API.
internal static class Authenticode
{
    [StructLayout(LayoutKind.Sequential)] private struct FileInfoData { public uint Size; public nint Path, Handle, Subject; }
    [StructLayout(LayoutKind.Sequential)] private struct TrustData
    {
        public uint Size; public nint Policy, Sip; public uint Ui, Revocation, Choice; public nint File;
        public uint Action; public nint State, Url; public uint Flags, Context; public nint Settings;
    }
    [StructLayout(LayoutKind.Sequential)] private struct SignerData
    {
        public uint Size, TimeLow, TimeHigh, CertCount; public nint Certificates; public uint Type;
        public nint Signer; public uint Error, CounterCount; public nint Counters, Chain;
    }
    [StructLayout(LayoutKind.Sequential)] private struct CertificatePrefix { public uint Size; public nint Certificate; }
    [StructLayout(LayoutKind.Sequential)] private struct CertificateContext { public uint Encoding; public nint Bytes; public uint Length; public nint Info, Store; }
    [DllImport("wintrust.dll", ExactSpelling = true)] private static extern int WinVerifyTrust(nint window, in Guid action, ref TrustData data);
    [DllImport("wintrust.dll", ExactSpelling = true)] private static extern nint WTHelperProvDataFromStateData(nint state);
    [DllImport("wintrust.dll", ExactSpelling = true)] private static extern nint WTHelperGetProvSignerFromChain(nint provider, uint signer, [MarshalAs(UnmanagedType.Bool)] bool counter, uint counterIndex);
    internal sealed record PublicCertificate(string Sha256, string Subject, string Issuer, string SerialNumber, string NotBefore, string NotAfter);
    internal sealed record Timestamp(PublicCertificate? Certificate, string[] SigningTimes, string Source);
    internal sealed record Result(string Status, string SignatureType, PublicCertificate? Signer, Timestamp Timestamp, string FileSha256, string WinTrustStatus);

    private static PublicCertificate? Certificate(SignerData signer)
    {
        if (signer.CertCount == 0 || signer.Certificates == 0) return null;
        var prefix = Marshal.PtrToStructure<CertificatePrefix>(signer.Certificates);
        if (prefix.Certificate == 0) return null;
        var context = Marshal.PtrToStructure<CertificateContext>(prefix.Certificate);
        if (context.Length == 0 || context.Length > 1_048_576) throw new IOException("SIGNATURE_CERTIFICATE_REJECTED");
        var bytes = new byte[context.Length]; Marshal.Copy(context.Bytes, bytes, 0, bytes.Length);
        using var certificate = X509CertificateLoader.LoadCertificate(bytes);
        return new(Convert.ToHexStringLower(SHA256.HashData(bytes)), certificate.Subject, certificate.Issuer,
            certificate.SerialNumber, certificate.NotBefore.ToUniversalTime().ToString("O"), certificate.NotAfter.ToUniversalTime().ToString("O"));
    }

    internal static Result Inspect(string input)
    {
        string path = System.IO.Path.GetFullPath(input);
        if (!System.IO.Path.IsPathFullyQualified(input) || (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0) throw new IOException("SIGNATURE_PATH_REJECTED");
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        string digest = Convert.ToHexStringLower(SHA256.HashData(stream));
        stream.Position = 0;
        using var reader = new BinaryReader(stream, System.Text.Encoding.UTF8, true);
        var absent = new Result("NotSigned", "None", null, new(null, [], "WINTRUST_VERIFIED_COUNTERSIGNER"), digest, "NO_EMBEDDED_SIGNATURE");
        if (stream.Length < 256 || reader.ReadUInt16() != 0x5a4d) return absent;
        stream.Position = 60; int pe = reader.ReadInt32();
        if (pe < 64 || pe > stream.Length - 160) return absent;
        stream.Position = pe; if (reader.ReadUInt32() != 0x00004550) return absent;
        stream.Position = pe + 24; ushort magic = reader.ReadUInt16();
        if (magic is not (0x10b or 0x20b)) return absent;
        stream.Position = pe + 24 + (magic == 0x20b ? 112 : 96) + 32;
        uint certificateOffset = reader.ReadUInt32(), certificateSize = reader.ReadUInt32();
        if (certificateOffset == 0 || certificateSize < 8 || (long)certificateOffset + certificateSize > stream.Length) return absent;
        nint name = Marshal.StringToCoTaskMemUni(path), info = Marshal.AllocHGlobal(Marshal.SizeOf<FileInfoData>());
        var file = new FileInfoData { Size = (uint)Marshal.SizeOf<FileInfoData>(), Path = name, Handle = stream.SafeFileHandle.DangerousGetHandle() };
        Marshal.StructureToPtr(file, info, false);
        var data = new TrustData { Size = (uint)Marshal.SizeOf<TrustData>(), Ui = 2, Revocation = 1, Choice = 1,
            File = info, Action = 1, Flags = 0x80 | 0x2000, Context = 1 };
        var action = new Guid("00AAC56B-CD44-11D0-8CC2-00C04FC295EE");
        try
        {
            int status = WinVerifyTrust(-1, in action, ref data);
            nint provider = data.State == 0 ? 0 : WTHelperProvDataFromStateData(data.State);
            nint signerPointer = provider == 0 ? 0 : WTHelperGetProvSignerFromChain(provider, 0, false, 0);
            var signer = signerPointer == 0 ? default : Marshal.PtrToStructure<SignerData>(signerPointer);
            nint counterPointer = signer.CounterCount == 0 ? 0 : WTHelperGetProvSignerFromChain(provider, 0, true, 0);
            var counter = counterPointer == 0 ? default : Marshal.PtrToStructure<SignerData>(counterPointer);
            string[] times = counterPointer == 0 || counter.Error != 0 ? [] : [DateTime.FromFileTimeUtc(((long)signer.TimeHigh << 32) | signer.TimeLow).ToString("O")];
            return new(status == 0 ? "Valid" : status == unchecked((int)0x80096010) ? "HashMismatch" : "NotTrusted", "Authenticode",
                Certificate(signer), new(counter.Error == 0 ? Certificate(counter) : null, times, "WINTRUST_VERIFIED_COUNTERSIGNER"), digest, $"0x{unchecked((uint)status):x8}");
        }
        finally { data.Action = 2; WinVerifyTrust(-1, in action, ref data); Marshal.FreeHGlobal(info); Marshal.FreeCoTaskMem(name); }
    }

    internal static Result VerifyInstaller(string artifact, string policyPath)
    {
        var result = Inspect(artifact);
        using var policy = JsonDocument.Parse(File.ReadAllText(policyPath, System.Text.Encoding.UTF8));
        if (result.Status == "NotSigned" || result.Signer is null) throw new IOException("SIGNATURE_MISSING");
        if (result.Status != "Valid") throw new IOException("SIGNATURE_INVALID");
        if (!policy.RootElement.GetProperty("certificateSha256").EnumerateArray().Any(item => item.GetString() == result.Signer.Sha256)) throw new IOException("SIGNER_NOT_ALLOWED");
        if (!policy.RootElement.GetProperty("timestampRequired").GetBoolean() || result.Timestamp.Certificate is null || result.Timestamp.SigningTimes.Length == 0) throw new IOException("SIGNATURE_TIMESTAMP_MISSING");
        return result;
    }
}
