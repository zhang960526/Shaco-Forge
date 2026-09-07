using System.Buffers.Binary;
using System.IO.Pipes;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using Microsoft.Win32.SafeHandles;

namespace ShacoForge.NativeCarrier;

internal static class Program
{
    private const int MaxJsonFrame = 262_144;
    private const int BootstrapTimeoutMs = 5_000;
    private const int AuthHandshakeTimeoutMs = 5_000;
    private const int FrameCompletionTimeoutMs = 5_000;
    private const string ProtocolVersion = "1";
    private const string ClientDomain = "shaco-forge/client-auth/v1";
    private const string ServerDomain = "shaco-forge/server-auth/v1";
    private static readonly HashSet<string> BusinessTypes = new(StringComparer.Ordinal)
    {
        "unary-request", "unary-response", "stream-open", "stream-credit",
        "stream-item", "stream-end", "stream-error", "stream-cancel"
    };

    [DllImport("ucrtbase.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern nint _get_osfhandle(int fileDescriptor);

    public static async Task<int> Main()
    {
        Bootstrap? bootstrap = null;
        try
        {
            using FileStream secretChannel = OpenExtraStream(3, FileAccess.Read);
            using JsonDocument bootstrapDocument = await ReadFrameAsync(secretChannel, BootstrapTimeoutMs);
            bootstrap = ParseBootstrap(bootstrapDocument.RootElement);
            secretChannel.Close();

            SecurityIdentifier currentSid = WindowsIdentity.GetCurrent().User
                ?? throw new InvalidOperationException("Current Windows identity has no user SID.");
            string pipeName = $"shaco-forge-v1-{Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant()}";
            string fullEndpoint = $@"\\.\pipe\{pipeName}";
            string endpointId = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fullEndpoint))).ToLowerInvariant();
            PipeSecurity requestedSecurity = BuildPipeSecurity(currentSid);

            using NamedPipeServerStream server = NamedPipeServerStreamAcl.Create(
                pipeName,
                PipeDirection.InOut,
                1,
                PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous | PipeOptions.FirstPipeInstance | PipeOptions.WriteThrough,
                65_536,
                65_536,
                requestedSecurity,
                HandleInheritability.None,
                (PipeAccessRights)0);

            AclEvidence acl = InspectAcl(server, currentSid);
            if (!acl.Verified)
            {
                throw new UnauthorizedAccessException("Named Pipe post-create ACL verification failed.");
            }

            using (FileStream controlChannel = OpenExtraStream(4, FileAccess.Write))
            {
                await WriteFrameAsync(controlChannel, new
                {
                    type = "helper-ready",
                    helperPid = Environment.ProcessId,
                    pipeEndpoint = fullEndpoint,
                    endpointId,
                    pipeEndpointHashPrefix = HashPrefix(fullEndpoint),
                    currentUserSidHashPrefix = HashPrefix(currentSid.Value),
                    aclOwnerSidHashPrefix = acl.OwnerHashPrefix,
                    aclProtected = acl.Protected,
                    inheritanceDisabled = acl.Protected,
                    currentUserAllowRule = acl.CurrentUserAllowRule,
                    unintendedBroadAllowRule = acl.UnintendedBroadAllowRule,
                    firstPipeInstance = true,
                    randomEntropyBits = 128,
                    postCreateInspection = acl.Verified,
                });
            }

            using Stream relayInput = Console.OpenStandardInput();
            using Stream relayOutput = Console.OpenStandardOutput();
            using CancellationTokenSource relayLifetime = new();
            // Worker owns this inherited pipe. EOF also ends an unconnected Helper
            // when Windows terminates Worker without running its signal handlers.
            // Run the synchronous inherited-handle read off the accept thread.
            Task<JsonDocument> firstWorkerFrame = Task.Run(() => ReadRelayFrameAsync(relayInput, relayLifetime.Token));
            Task accept = server.WaitForConnectionAsync(relayLifetime.Token);
            if (await Task.WhenAny(accept, firstWorkerFrame) == firstWorkerFrame)
            {
                using JsonDocument prematureFrame = await firstWorkerFrame;
                throw new InvalidDataException("Worker sent business data before Pipe connection.");
            }
            await accept;
            Task authentication = AuthenticateAsync(server, bootstrap, endpointId);
            if (await Task.WhenAny(authentication, firstWorkerFrame) == firstWorkerFrame)
            {
                using JsonDocument prematureFrame = await firstWorkerFrame;
                throw new InvalidDataException("Worker sent business data before mutual authentication.");
            }
            await authentication;

            Task clientToWorker = RelayFramesAsync(server, relayOutput, relayLifetime.Token);
            Task workerToClient = RelayFramesAsync(relayInput, server, relayLifetime.Token, firstWorkerFrame);
            Task completedRelay = await Task.WhenAny(clientToWorker, workerToClient);
            relayLifetime.Cancel();
            if (completedRelay.IsFaulted) await completedRelay;
            Task relayShutdown = Task.WhenAll(clientToWorker, workerToClient);
            if (await Task.WhenAny(relayShutdown, Task.Delay(1_000)) == relayShutdown)
            {
                try { await relayShutdown; } catch (OperationCanceledException) { }
            }
            return 0;
        }
        catch (OperationCanceledException)
        {
            Console.Error.WriteLine("SHACO_FORGE_NATIVE_CARRIER_FAILED timeout");
            return 2;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine($"SHACO_FORGE_NATIVE_CARRIER_FAILED {error.GetType().Name}: {Redact(error.Message)}");
            return 1;
        }
        finally
        {
            if (bootstrap is not null) CryptographicOperations.ZeroMemory(bootstrap.Secret);
        }
    }

    private static FileStream OpenExtraStream(int descriptor, FileAccess access)
    {
        nint handle = _get_osfhandle(descriptor);
        if (handle == -1 || handle == 0) throw new IOException($"Inherited fd {descriptor} is unavailable.");
        return new FileStream(new SafeFileHandle(handle, ownsHandle: true), access, 4096, isAsync: false);
    }

    private static Bootstrap ParseBootstrap(JsonElement root)
    {
        if (root.GetProperty("type").GetString() != "helper-bootstrap") throw new InvalidDataException("Invalid helper bootstrap type.");
        string secretHex = RequiredString(root, "secret");
        if (secretHex.Length != 64) throw new InvalidDataException("Epoch secret must contain 32 bytes.");
        byte[] secret;
        try { secret = Convert.FromHexString(secretHex); }
        catch (FormatException) { throw new InvalidDataException("Epoch secret encoding is invalid."); }
        return new Bootstrap(
            secret,
            RequiredString(root, "workerInstanceId"),
            RequiredString(root, "credentialEpoch"));
    }

    private static string RequiredString(JsonElement root, string name)
    {
        if (!root.TryGetProperty(name, out JsonElement value) || value.ValueKind != JsonValueKind.String)
            throw new InvalidDataException($"Missing bootstrap field {name}.");
        string? text = value.GetString();
        if (string.IsNullOrWhiteSpace(text)) throw new InvalidDataException($"Empty bootstrap field {name}.");
        return text;
    }

    private static PipeSecurity BuildPipeSecurity(SecurityIdentifier sid)
    {
        PipeSecurity security = new();
        security.SetAccessRuleProtection(isProtected: true, preserveInheritance: false);
        security.SetOwner(sid);
        security.AddAccessRule(new PipeAccessRule(sid, PipeAccessRights.FullControl, AccessControlType.Allow));
        return security;
    }

    private static AclEvidence InspectAcl(NamedPipeServerStream server, SecurityIdentifier currentSid)
    {
        PipeSecurity effective = server.GetAccessControl();
        SecurityIdentifier owner = effective.GetOwner(typeof(SecurityIdentifier)) as SecurityIdentifier
            ?? throw new UnauthorizedAccessException("Named Pipe owner SID is unavailable.");
        AuthorizationRuleCollection rules = effective.GetAccessRules(includeExplicit: true, includeInherited: true, typeof(SecurityIdentifier));
        bool currentAllow = false;
        bool broadAllow = false;
        foreach (PipeAccessRule rule in rules)
        {
            bool sameUser = rule.IdentityReference is SecurityIdentifier identity && identity.Equals(currentSid);
            if (rule.AccessControlType == AccessControlType.Allow && sameUser && !rule.IsInherited
                && (rule.PipeAccessRights & PipeAccessRights.FullControl) == PipeAccessRights.FullControl)
            {
                currentAllow = true;
            }
            else if (rule.AccessControlType == AccessControlType.Allow)
            {
                broadAllow = true;
            }
        }
        bool verified = owner.Equals(currentSid) && effective.AreAccessRulesProtected && currentAllow && !broadAllow;
        return new AclEvidence(verified, effective.AreAccessRulesProtected, currentAllow, broadAllow, HashPrefix(owner.Value));
    }

    private static async Task AuthenticateAsync(Stream stream, Bootstrap bootstrap, string endpointId)
    {
        using CancellationTokenSource handshake = new(AuthHandshakeTimeoutMs);
        string challengeId = Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();
        string serverNonce = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        await WriteFrameAsync(stream, new
        {
            type = "server-challenge",
            protocolVersion = ProtocolVersion,
            workerInstanceId = bootstrap.WorkerInstanceId,
            endpointId,
            credentialEpoch = bootstrap.CredentialEpoch,
            challengeId,
            serverNonce,
        }, handshake.Token);

        using JsonDocument authDocument = await ReadFrameAsync(stream, AuthHandshakeTimeoutMs, handshake.Token);
        JsonElement auth = authDocument.RootElement;
        if (auth.GetProperty("type").GetString() != "client-auth") throw new UnauthorizedAccessException("CLIENT_AUTH required.");
        string clientNonce = RequiredString(auth, "clientNonce");
        string clientInstanceId = RequiredString(auth, "clientInstanceId");
        string clientProof = RequiredString(auth, "clientProof");
        string[] fields =
        {
            ProtocolVersion, bootstrap.WorkerInstanceId, endpointId, bootstrap.CredentialEpoch,
            challengeId, serverNonce, clientNonce, clientInstanceId,
        };
        byte[] expectedClient = Hmac(bootstrap.Secret, ClientDomain, fields);
        byte[] receivedClient;
        try { receivedClient = Convert.FromHexString(clientProof); }
        catch (FormatException) { throw new UnauthorizedAccessException("Client proof encoding is invalid."); }
        if (receivedClient.Length != expectedClient.Length || !CryptographicOperations.FixedTimeEquals(receivedClient, expectedClient))
            throw new UnauthorizedAccessException("Client proof is invalid.");

        string serverProof = Convert.ToHexString(Hmac(bootstrap.Secret, ServerDomain, fields)).ToLowerInvariant();
        await WriteFrameAsync(stream, new { type = "server-auth", serverProof }, handshake.Token);
    }

    private static byte[] Hmac(byte[] secret, string domain, IReadOnlyList<string> fields)
    {
        using MemoryStream transcript = new();
        WriteTranscriptField(transcript, domain);
        foreach (string field in fields) WriteTranscriptField(transcript, field);
        using HMACSHA256 hmac = new(secret);
        return hmac.ComputeHash(transcript.ToArray());
    }

    private static void WriteTranscriptField(Stream stream, string value)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(value);
        Span<byte> length = stackalloc byte[4];
        BinaryPrimitives.WriteUInt32LittleEndian(length, checked((uint)bytes.Length));
        stream.Write(length);
        stream.Write(bytes);
    }

    private static async Task RelayFramesAsync(Stream input, Stream output, CancellationToken cancellationToken, Task<JsonDocument>? firstFrame = null)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            using JsonDocument frame = await (firstFrame ?? ReadRelayFrameAsync(input, cancellationToken));
            firstFrame = null;
            JsonElement root = frame.RootElement;
            if (root.ValueKind != JsonValueKind.Object
                || !root.TryGetProperty("type", out JsonElement typeElement)
                || typeElement.ValueKind != JsonValueKind.String
                || !BusinessTypes.Contains(typeElement.GetString() ?? string.Empty))
            {
                throw new InvalidDataException("Invalid carrier business envelope.");
            }
            await WriteRawFrameAsync(output, Encoding.UTF8.GetBytes(root.GetRawText()), cancellationToken);
        }
    }

    private static async Task<JsonDocument> ReadRelayFrameAsync(Stream stream, CancellationToken outer)
    {
        byte[] lengthBytes = new byte[4];
        int first = await stream.ReadAsync(lengthBytes.AsMemory(0, 1), outer);
        if (first == 0) throw new EndOfStreamException("Carrier relay closed.");
        using CancellationTokenSource completion = CancellationTokenSource.CreateLinkedTokenSource(outer);
        Task<JsonDocument> readRemainder = CompleteRelayFrameAsync(stream, lengthBytes, completion.Token);
        Task timeout = Task.Delay(FrameCompletionTimeoutMs, outer);
        if (await Task.WhenAny(readRemainder, timeout) == readRemainder) return await readRemainder;
        completion.Cancel();
        outer.ThrowIfCancellationRequested();
        throw new TimeoutException("Carrier frame completion timed out.");
    }

    private static async Task<JsonDocument> CompleteRelayFrameAsync(Stream stream, byte[] lengthBytes, CancellationToken cancellationToken)
    {
        await stream.ReadExactlyAsync(lengthBytes.AsMemory(1), cancellationToken);
        int length = checked((int)BinaryPrimitives.ReadUInt32LittleEndian(lengthBytes));
        if (length <= 0 || length > MaxJsonFrame) throw new InvalidDataException("JSON frame length is outside the allowed range.");
        byte[] payload = new byte[length];
        await stream.ReadExactlyAsync(payload, cancellationToken);
        try { return JsonDocument.Parse(payload); }
        catch (JsonException) { throw new InvalidDataException("Malformed JSON carrier frame."); }
    }

    private static async Task<JsonDocument> ReadFrameAsync(Stream stream, int timeoutMs, CancellationToken outer = default)
    {
        using CancellationTokenSource timeout = CancellationTokenSource.CreateLinkedTokenSource(outer);
        timeout.CancelAfter(timeoutMs);
        byte[] lengthBytes = new byte[4];
        await stream.ReadExactlyAsync(lengthBytes, timeout.Token);
        int length = checked((int)BinaryPrimitives.ReadUInt32LittleEndian(lengthBytes));
        if (length <= 0 || length > MaxJsonFrame) throw new InvalidDataException("JSON frame length is outside the allowed range.");
        byte[] payload = new byte[length];
        await stream.ReadExactlyAsync(payload, timeout.Token);
        try { return JsonDocument.Parse(payload); }
        catch (JsonException) { throw new InvalidDataException("Malformed JSON carrier frame."); }
    }

    private static async Task WriteFrameAsync(Stream stream, object value, CancellationToken cancellationToken = default)
    {
        byte[] payload = JsonSerializer.SerializeToUtf8Bytes(value);
        await WriteRawFrameAsync(stream, payload, cancellationToken);
    }

    private static async Task WriteRawFrameAsync(Stream stream, byte[] payload, CancellationToken cancellationToken)
    {
        if (payload.Length <= 0 || payload.Length > MaxJsonFrame) throw new InvalidDataException("JSON frame length is outside the allowed range.");
        byte[] prefix = new byte[4];
        BinaryPrimitives.WriteUInt32LittleEndian(prefix, checked((uint)payload.Length));
        await stream.WriteAsync(prefix, cancellationToken);
        await stream.WriteAsync(payload, cancellationToken);
        await stream.FlushAsync(cancellationToken);
    }

    private static string HashPrefix(string value)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value))).ToLowerInvariant()[..16];

    private static string Redact(string message)
        => message.Replace("\\\\.\\pipe\\", "[pipe-redacted]", StringComparison.OrdinalIgnoreCase);

    private sealed record Bootstrap(byte[] Secret, string WorkerInstanceId, string CredentialEpoch);
    private sealed record AclEvidence(bool Verified, bool Protected, bool CurrentUserAllowRule, bool UnintendedBroadAllowRule, string OwnerHashPrefix);
}
