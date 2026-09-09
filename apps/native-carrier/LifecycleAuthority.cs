using System.IO.Pipes;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ShacoForge.NativeCarrier;

internal static partial class Program
{
    private sealed class Reservation : IDisposable
    {
        internal required WindowsAuthority.ProcessIdentity Peer;
        internal required Bootstrap Credential;
        internal readonly CancellationTokenSource Lifetime = new(5_000);
        internal readonly TaskCompletionSource<bool> Authenticated = new(TaskCreationOptions.RunContinuationsAsynchronously);
        internal string? ClientInstanceId;
        public void Dispose() { CryptographicOperations.ZeroMemory(Credential.Secret); Lifetime.Cancel(); }
    }

    private sealed class Authority
    {
        internal required string WorkerInstanceId;
        internal required string DshHome;
        internal required JsonElement WorkerRuntime;
        internal required WindowsAuthority.ProcessIdentity Worker;
        internal required WindowsAuthority.ProcessIdentity Host;
        internal required object HostPreflight;
        internal required Stream Input;
        internal required Stream Output;
        internal required NamedPipeServerStream Carrier;
        internal required string Endpoint;
        internal required string EndpointId;
        internal readonly object Sync = new();
        internal readonly SemaphoreSlim OutputLock = new(1);
        internal readonly SemaphoreSlim CarrierWriteLock = new(1);
        internal readonly CancellationTokenSource Lifetime = new();
        internal readonly HashSet<string> DesktopInstances = new(StringComparer.Ordinal);
        internal readonly HashSet<string> Nonces = new(StringComparer.Ordinal);
        internal Reservation? Pending;
        internal string State = "DETACHED";
        internal string? ClientInstanceId;
        internal long LastHeartbeat = Environment.TickCount64;
        internal int DispatchCount;
        internal int RejectedOldFrames;
        internal int Detaches;
        internal TaskCompletionSource<bool>? Reset;

        internal bool Healthy()
        {
            if (Lifetime.IsCancellationRequested || Environment.TickCount64 - Interlocked.Read(ref LastHeartbeat) > 2_500) return false;
            try { return WindowsAuthority.InspectProcess(Worker.Pid) == Worker && WindowsAuthority.InspectProcess(Host.Pid) == Host; }
            catch { return false; }
        }

        internal object Status() => new {
            type = "authority-status", protocolVersion = "1", workerInstanceId = WorkerInstanceId,
            dshHome = DshHome,
            workerRuntime = WorkerRuntime,
            worker = Worker, host = Host, helper = WindowsAuthority.InspectProcess((uint)Environment.ProcessId),
            healthy = Healthy(), state = State, hostPreflight = HostPreflight,
            job = new { ownerPid = Worker.Pid, hostContained = true, helperContained = true, helperSetupHandleClosed = true, killOnClose = true },
            mutex = new { ownerPid = Environment.ProcessId, soleSteadyStateHolder = "HELPER" },
            dispatchCount = DispatchCount, rejectedOldFrames = RejectedOldFrames, detaches = Detaches,
        };
        internal async Task SendWorker(object frame)
        {
            await OutputLock.WaitAsync(Lifetime.Token);
            try { await WriteFrameAsync(Output, frame, Lifetime.Token); }
            finally { OutputLock.Release(); }
        }
        internal async Task SendWorkerFrame(JsonElement frame)
        {
            await OutputLock.WaitAsync(Lifetime.Token);
            try
            {
                await WriteFrameAsync(Output, new { type = "attachment-frame", clientInstanceId = ClientInstanceId }, Lifetime.Token);
                await WriteRawFrameAsync(Output, Encoding.UTF8.GetBytes(frame.GetRawText()), Lifetime.Token);
            }
            finally { OutputLock.Release(); }
        }
    }

    private static async Task<int> RunAuthorityAsync()
    {
        Authority? authority = null;
        try
        {
            using var bootstrapInput = OpenExtraStream(3, FileAccess.Read);
            using var document = await ReadFrameAsync(bootstrapInput, BootstrapTimeoutMs);
            var root = document.RootElement;
            if (RequiredString(root, "type") != "authority-bootstrap") throw new InvalidDataException("AUTHORITY_BOOTSTRAP_REQUIRED");
            string workerId = RequiredString(root, "workerInstanceId");
            var worker = WindowsAuthority.InspectProcess(root.GetProperty("workerPid").GetUInt32());
            bootstrapInput.Close();
            using var mutex = new WindowsAuthority.AuthorityMutex();
            using var setupJob = new WindowsAuthority.WorkerJob(worker.Pid);
            using Stream input = Console.OpenStandardInput();
            using Stream output = Console.OpenStandardOutput();
            using var initialControl = OpenExtraStream(4, FileAccess.Write);
            await WriteFrameAsync(initialControl, new { type = "helper-initialized", helperPid = Environment.ProcessId });
            using var hostDocument = await ReadFrameAsync(input, 60_000);
            var hostFrame = hostDocument.RootElement;
            if (RequiredString(hostFrame, "type") != "authority-host") throw new InvalidDataException("HOST_ASSIGNMENT_REQUIRED");
            var host = WindowsAuthority.InspectProcess(hostFrame.GetProperty("hostPid").GetUInt32());
            setupJob.Assign(host.Pid);
            setupJob.Dispose();
            await WriteFrameAsync(initialControl, new { type = "host-contained" });
            using var readiness = await ReadFrameAsync(input, 60_000);
            if (RequiredString(readiness.RootElement, "type") != "authority-ready") throw new InvalidDataException("HOST_READINESS_REQUIRED");
            string carrierName = $"shaco-forge-v1-{Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant()}";
            string endpoint = $@"\\.\pipe\{carrierName}";
            using var carrier = WindowsAuthority.CreatePipe(carrierName);
            using var lifecycle = WindowsAuthority.CreatePipe(WindowsAuthority.LifecycleName);
            authority = new Authority {
                WorkerInstanceId = workerId, DshHome = RequiredString(root, "dshHome"), WorkerRuntime = root.GetProperty("workerRuntime").Clone(), Worker = worker, Host = host,
                HostPreflight = readiness.RootElement.GetProperty("hostPreflight").Clone(),
                Input = input, Output = output, Carrier = carrier, Endpoint = endpoint,
                EndpointId = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(endpoint))).ToLowerInvariant(),
            };
            await WriteFrameAsync(initialControl, new { type = "authority-ready", status = authority.Status() });
            initialControl.Close();
            var workerRead = Task.Run(() => WorkerFrames(authority));
            var control = LifecycleConnections(authority, lifecycle);
            var connections = CarrierConnections(authority);
            await await Task.WhenAny(workerRead, control, connections);
            return 0;
        }
        catch (Exception error)
        {
            // Never emit raw OS exception messages: they can contain endpoints.
            string code = error.Message == "ABANDONED_AUTHORITY_FAIL_CLOSED" ? "ABANDONED_AUTHORITY_FAIL_CLOSED" : "WORKER_AUTHORITY_FAILURE";
            Console.Error.WriteLine($"{code} {error.GetType().Name} hresult={error.HResult} at={error.TargetSite?.Name}");
            return 1;
        }
        finally { authority?.Lifetime.Cancel(); authority?.Pending?.Dispose(); }
    }

    private static async Task WorkerFrames(Authority a)
    {
        for (;;)
        {
            using var document = await ReadRelayFrameAsync(a.Input, a.Lifetime.Token);
            var frame = document.RootElement;
            string type = RequiredString(frame, "type");
            if (type == "authority-heartbeat") { Interlocked.Exchange(ref a.LastHeartbeat, Environment.TickCount64); continue; }
            if (type == "attachment-reset") { a.Reset?.TrySetResult(true); continue; }
            if (type != "attachment-frame") throw new InvalidDataException("WORKER_RELAY_ENVELOPE_INVALID");
            string client = RequiredString(frame, "clientInstanceId");
            using var business = await ReadRelayFrameAsync(a.Input, a.Lifetime.Token);
            await a.CarrierWriteLock.WaitAsync(a.Lifetime.Token);
            try
            {
                if (a.State != "ATTACHED" || a.ClientInstanceId != client) { a.RejectedOldFrames++; continue; }
                await WriteRawFrameAsync(a.Carrier, Encoding.UTF8.GetBytes(business.RootElement.GetRawText()), a.Lifetime.Token);
            }
            catch (IOException) { a.Pending?.Lifetime.Cancel(); }
            finally { a.CarrierWriteLock.Release(); }
        }
    }

    private static async Task LifecycleConnections(Authority a, NamedPipeServerStream pipe)
    {
        for (;;)
        {
            await pipe.WaitForConnectionAsync(a.Lifetime.Token);
            Reservation? issued = null;
            try
            {
                WindowsAuthority.InspectAcl(pipe.SafePipeHandle);
                var peer = WindowsAuthority.Peer(pipe.SafePipeHandle, false);
                using var document = await ReadFrameAsync(pipe, 5_000, a.Lifetime.Token);
                var request = document.RootElement;
                string action = RequiredString(request, "type");
                string? rejection = null;
                if (RequiredString(request, "protocolVersion") != "1") rejection = "WORKER_VERSION_INCOMPATIBLE";
                else if (request.GetProperty("pid").GetUInt32() != peer.Pid || RequiredString(request, "startTime") != peer.StartTime) rejection = "LIFECYCLE_PEER_MISMATCH";
                else if (!a.Healthy()) rejection = "WORKER_AUTHORITY_FAILURE";
                if (rejection is not null) { await ReplyAndWaitForClose(pipe, new { type = "rejected", reason = rejection }); continue; }
                if (action == "discover") { await ReplyAndWaitForClose(pipe, a.Status()); continue; }
                if (action == "stop-authority")
                {
                    if (RequiredString(request, "workerInstanceId") != a.WorkerInstanceId) throw new InvalidDataException("WORKER_IDENTITY_MISMATCH");
                    await ReplyAndWaitForClose(pipe, new { type = "stopping" });
                    await a.SendWorker(new { type = "stop-authority" });
                    return;
                }
                if (action != "attach") throw new InvalidDataException("LIFECYCLE_OPERATION_NOT_ALLOWED");
                string desktop = RequiredString(request, "desktopInstanceId");
                string nonce = RequiredString(request, "nonce");
                lock (a.Sync)
                {
                    if (a.State != "DETACHED") rejection = "BUSY";
                    else if (!Guid.TryParse(desktop, out _) || nonce.Length != 64 || !nonce.All(Uri.IsHexDigit)
                        || a.DesktopInstances.Contains(desktop) || a.Nonces.Contains(nonce)) rejection = "LIFECYCLE_FRESHNESS_REJECTED";
                    // Bounded fail-closed epoch rather than an unbounded nonce store.
                    else if (a.DesktopInstances.Count >= 4096) rejection = "AUTHORITY_ATTACHMENT_LIMIT";
                    else
                    {
                        a.DesktopInstances.Add(desktop); a.Nonces.Add(nonce);
                        issued = new Reservation { Peer = peer, Credential = new Bootstrap(RandomNumberGenerator.GetBytes(32), a.WorkerInstanceId, Guid.NewGuid().ToString()) };
                        a.Pending = issued;
                        a.State = "CREDENTIAL_ISSUED";
                    }
                }
                if (rejection is not null) { await ReplyAndWaitForClose(pipe, new { type = "rejected", reason = rejection }); continue; }
                await WriteFrameAsync(pipe, new {
                    type = "credential-issued", status = a.Status(), pipeEndpoint = a.Endpoint, endpointId = a.EndpointId,
                    credentialEpoch = issued!.Credential.CredentialEpoch, secret = Convert.ToHexString(issued.Credential.Secret).ToLowerInvariant(),
                }, issued.Lifetime.Token);
                byte[] eof = new byte[1];
                using var controlLifetime = CancellationTokenSource.CreateLinkedTokenSource(a.Lifetime.Token, issued.Lifetime.Token);
                var disconnected = pipe.ReadAsync(eof, controlLifetime.Token).AsTask();
                var completed = await Task.WhenAny(disconnected, issued.Authenticated.Task);
                if (completed == disconnected) { await disconnected; issued.Dispose(); }
                else await issued.Authenticated.Task;
                controlLifetime.Cancel();
                try { await disconnected; } catch (OperationCanceledException) { }
            }
            catch (Exception error) when (error is IOException or OperationCanceledException or InvalidDataException or UnauthorizedAccessException or JsonException)
            { issued?.Dispose(); }
            finally
            {
                if (issued is not null && a.State == "CREDENTIAL_ISSUED")
                {
                    lock (a.Sync) { issued.Dispose(); a.Pending = null; a.State = "DETACHED"; }
                }
                // Read EOF may mark PipeStream Broken (IsConnected=false).
                // A completed accept still requires Disconnect before reuse.
                pipe.Disconnect();
            }
        }
    }

    private static async Task ReplyAndWaitForClose(NamedPipeServerStream pipe, object response)
    {
        using var timeout = new CancellationTokenSource(5_000);
        await WriteFrameAsync(pipe, response, timeout.Token);
        // DisconnectNamedPipe discards unread outbound bytes. Wait for the
        // validated client's close acknowledgement before recycling this instance.
        byte[] acknowledgement = new byte[1];
        int received = await pipe.ReadAsync(acknowledgement, timeout.Token);
        if (received != 0) throw new InvalidDataException("LIFECYCLE_CLOSE_REQUIRED");
    }

    private static async Task CarrierConnections(Authority a)
    {
        for (;;)
        {
            await a.Carrier.WaitForConnectionAsync(a.Lifetime.Token);
            Reservation? reservation;
            lock (a.Sync) { reservation = a.Pending; if (reservation is not null) a.State = "AUTHENTICATING"; }
            bool authenticated = false;
            try
            {
                if (reservation is null || reservation.Lifetime.IsCancellationRequested || !a.Healthy()) throw new UnauthorizedAccessException("NO_LIVE_RESERVATION");
                var peer = WindowsAuthority.Peer(a.Carrier.SafePipeHandle, false);
                if (peer != reservation.Peer) throw new UnauthorizedAccessException("CARRIER_PEER_MISMATCH");
                using var authLifetime = CancellationTokenSource.CreateLinkedTokenSource(a.Lifetime.Token, reservation.Lifetime.Token);
                await AuthenticateAsync(a.Carrier, reservation.Credential, a.EndpointId, client => reservation.ClientInstanceId = client, authLifetime.Token);
                CryptographicOperations.ZeroMemory(reservation.Credential.Secret);
                reservation.Lifetime.CancelAfter(Timeout.Infinite);
                a.ClientInstanceId = reservation.ClientInstanceId;
                a.State = "ATTACHED";
                authenticated = true;
                await a.SendWorker(new { type = "attachment-start", clientInstanceId = a.ClientInstanceId });
                reservation.Authenticated.TrySetResult(true);
                for (;;)
                {
                    using var frame = await ReadRelayFrameAsync(a.Carrier, reservation.Lifetime.Token);
                    string type = RequiredString(frame.RootElement, "type");
                    if (!BusinessTypes.Contains(type) || !a.Healthy()) throw new InvalidDataException("CARRIER_FRAME_REJECTED");
                    a.DispatchCount++;
                    await a.SendWorkerFrame(frame.RootElement);
                }
            }
            catch (Exception error) when (error is IOException or OperationCanceledException or UnauthorizedAccessException or InvalidDataException or TimeoutException)
            { reservation?.Authenticated.TrySetResult(false); }
            finally
            {
                a.State = "DETACHING";
                reservation?.Dispose();
                string? oldClient = a.ClientInstanceId;
                a.ClientInstanceId = null;
                if (authenticated)
                {
                    a.Reset = new(TaskCreationOptions.RunContinuationsAsynchronously);
                    await a.SendWorker(new { type = "attachment-end", clientInstanceId = oldClient });
                    await a.Reset.Task.WaitAsync(TimeSpan.FromSeconds(5), a.Lifetime.Token);
                    a.Reset = null;
                }
                await a.CarrierWriteLock.WaitAsync(a.Lifetime.Token);
                try { a.Carrier.Disconnect(); }
                finally { a.CarrierWriteLock.Release(); }
                lock (a.Sync) { a.Pending = null; a.Detaches++; a.State = "DETACHED"; }
            }
        }
    }
}
