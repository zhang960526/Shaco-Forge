// NOT_PRODUCTION: disposable Windows Worker authority and Named Pipe carrier.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ShacoForge.P0S5
{
    public static class WorkerCarrier
    {
        private const int ProtocolVersion = 1;
        private const int MaxFrameBytes = 262144;
        private const int ResponseQueueCapacity = 64;
        private const string DshInputPrefix = "P0S5_IN ";
        private const string DshOutputPrefix = "P0S5_FRAME ";
        private static readonly UTF8Encoding Utf8NoBom = new UTF8Encoding(false);
        private static readonly object WriteLock = new object();
        private static readonly object DshWriteLock = new object();
        private static readonly object EventWriteLock = new object();
        private static readonly BlockingCollection<string> DshResponses = new BlockingCollection<string>(ResponseQueueCapacity);
        private static readonly HashSet<string> UsedClientNonces = new HashSet<string>(StringComparer.Ordinal);
        private static readonly List<Dictionary<string, object>> Rejections = new List<Dictionary<string, object>>();
        private static int eventSequence;
        private static int gatewayForwarded;
        private static int streamForwarded;
        private static int connectionCount;
        private static int connectionLossCount;
        private static bool finishRequested;
        private static IntPtr dshJob = IntPtr.Zero;

        [StructLayout(LayoutKind.Sequential)]
        private struct JOBOBJECT_BASIC_LIMIT_INFORMATION
        {
            public long PerProcessUserTimeLimit;
            public long PerJobUserTimeLimit;
            public uint LimitFlags;
            public UIntPtr MinimumWorkingSetSize;
            public UIntPtr MaximumWorkingSetSize;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint PriorityClass;
            public uint SchedulingClass;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct IO_COUNTERS
        {
            public ulong ReadOperationCount;
            public ulong WriteOperationCount;
            public ulong OtherOperationCount;
            public ulong ReadTransferCount;
            public ulong WriteTransferCount;
            public ulong OtherTransferCount;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
        {
            public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
            public IO_COUNTERS IoInfo;
            public UIntPtr ProcessMemoryLimit;
            public UIntPtr JobMemoryLimit;
            public UIntPtr PeakProcessMemoryUsed;
            public UIntPtr PeakJobMemoryUsed;
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr CreateJobObject(IntPtr jobAttributes, string name);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool SetInformationJobObject(IntPtr job, int informationClass, IntPtr information, uint length);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);

        [DllImport("kernel32.dll")]
        private static extern bool CloseHandle(IntPtr handle);

        public static int Run()
        {
            Process dsh = null;
            string workerStage = "identity-validation";
            try
            {
                string expectedSid = RequireEnvironment("P0S5_USER_SID");
                SecurityIdentifier currentSid = WindowsIdentity.GetCurrent().User;
                if (currentSid == null || !String.Equals(currentSid.Value, expectedSid, StringComparison.Ordinal))
                {
                    throw new InvalidOperationException("Current SID does not match the runner identity.");
                }

                workerStage = "dsh-start";
                dshJob = CreateKillOnCloseJob();
                dsh = StartDsh();
                if (!AssignProcessToJobObject(dshJob, dsh.Handle))
                {
                    throw new InvalidOperationException("Failed to place dsh in the Worker Carrier job object: " + Marshal.GetLastWin32Error());
                }
                StartDshPumps(dsh);
                WaitForDshReady(dsh);
                workerStage = "worker-publication";
                PublishWorker(currentSid, dsh);
                workerStage = "pipe-listen";
                AppendEvent("worker_authority_started", new Dictionary<string, object>
                {
                    ["carrierPid"] = Process.GetCurrentProcess().Id,
                    ["dshPid"] = dsh.Id,
                    ["dshAssignedToKillOnCloseJob"] = true,
                });

                while (!finishRequested)
                {
                    PipeSecurity security = BuildSecurity(currentSid);
                    using (NamedPipeServerStream server = NamedPipeServerStreamAcl.Create(
                        RequireEnvironment("P0S5_PIPE_NAME"),
                        PipeDirection.InOut,
                        1,
                        PipeTransmissionMode.Byte,
                        PipeOptions.Asynchronous,
                        65536,
                        65536,
                        security,
                        HandleInheritability.None,
                        (PipeAccessRights)0))
                    {
                        server.WaitForConnection();
                        connectionCount += 1;
                        AppendEvent("pipe_transport_connected", new Dictionary<string, object>
                        {
                            ["connectionOrdinal"] = connectionCount,
                        });
                        HandleConnection(server, currentSid.Value, dsh);
                    }
                }

                bool dshGraceful = false;
                try
                {
                    dsh.StandardInput.WriteLine("P0S5_CONTROL_STOP");
                    dsh.StandardInput.Flush();
                    dshGraceful = dsh.WaitForExit(20000);
                }
                catch
                {
                    dshGraceful = false;
                }
                if (!dsh.HasExited)
                {
                    dsh.Kill(true);
                    dsh.WaitForExit(10000);
                }

                AppendEvent("worker_authority_ended", new Dictionary<string, object>
                {
                    ["carrierPid"] = Process.GetCurrentProcess().Id,
                    ["dshPid"] = dsh.Id,
                    ["reason"] = "graceful-stop",
                });
                WriteJson(RequireEnvironment("P0S5_WORKER_SUMMARY_FILE"), new Dictionary<string, object>
                {
                    ["classification"] = "NOT_PRODUCTION",
                    ["workerInstanceId"] = RequireEnvironment("P0S5_WORKER_INSTANCE_ID"),
                    ["carrierPid"] = Process.GetCurrentProcess().Id,
                    ["dshPid"] = dsh.Id,
                    ["dshExitCode"] = dsh.ExitCode,
                    ["dshGracefulStopObserved"] = dshGraceful,
                    ["gatewayForwardedCount"] = gatewayForwarded,
                    ["streamForwardedCount"] = streamForwarded,
                    ["connectionCount"] = connectionCount,
                    ["connectionLossCount"] = connectionLossCount,
                    ["rejections"] = Rejections,
                    ["pipeEndpointRedacted"] = true,
                    ["credentialPersistedInEvidence"] = false,
                    ["dshAssignedToKillOnCloseJob"] = true,
                });
                return 0;
            }
            catch (Exception error)
            {
                WriteJson(RequireEnvironment("P0S5_WORKER_FAILURE_FILE"), new Dictionary<string, object>
                {
                    ["classification"] = "NOT_PRODUCTION",
                    ["workerInstanceId"] = Environment.GetEnvironmentVariable("P0S5_WORKER_INSTANCE_ID"),
                    ["carrierPid"] = Process.GetCurrentProcess().Id,
                    ["workerStage"] = workerStage,
                    ["errorType"] = error.GetType().Name,
                    ["message"] = error.Message,
                    ["detail"] = error.ToString(),
                });
                if (dsh != null && !dsh.HasExited)
                {
                    try { dsh.Kill(true); } catch { }
                }
                return 1;
            }
            finally
            {
                if (dshJob != IntPtr.Zero) CloseHandle(dshJob);
                if (dsh != null) dsh.Dispose();
            }
        }

        private static IntPtr CreateKillOnCloseJob()
        {
            IntPtr job = CreateJobObject(IntPtr.Zero, null);
            if (job == IntPtr.Zero) throw new InvalidOperationException("CreateJobObject failed.");
            JOBOBJECT_EXTENDED_LIMIT_INFORMATION information = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION();
            information.BasicLimitInformation.LimitFlags = 0x00002000;
            int length = Marshal.SizeOf<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>();
            IntPtr pointer = Marshal.AllocHGlobal(length);
            try
            {
                Marshal.StructureToPtr(information, pointer, false);
                if (!SetInformationJobObject(job, 9, pointer, (uint)length))
                {
                    throw new InvalidOperationException("SetInformationJobObject failed: " + Marshal.GetLastWin32Error());
                }
                return job;
            }
            catch
            {
                CloseHandle(job);
                throw;
            }
            finally
            {
                Marshal.FreeHGlobal(pointer);
            }
        }

        private static string RequireEnvironment(string name)
        {
            string value = Environment.GetEnvironmentVariable(name);
            if (String.IsNullOrWhiteSpace(value)) throw new InvalidOperationException("Missing environment value: " + name);
            return value;
        }

        private static PipeSecurity BuildSecurity(SecurityIdentifier sid)
        {
            PipeSecurity security = new PipeSecurity();
            security.SetAccessRuleProtection(true, false);
            security.SetOwner(sid);
            security.AddAccessRule(new PipeAccessRule(sid, PipeAccessRights.FullControl, AccessControlType.Allow));
            return security;
        }

        private static FileSecurity BuildFileSecurity(SecurityIdentifier sid)
        {
            FileSecurity security = new FileSecurity();
            security.SetAccessRuleProtection(true, false);
            security.SetOwner(sid);
            security.AddAccessRule(new FileSystemAccessRule(sid, FileSystemRights.FullControl, AccessControlType.Allow));
            return security;
        }

        private static void SecureFile(string path, SecurityIdentifier sid)
        {
            Exception lastError = null;
            for (int attempt = 1; attempt <= 10; attempt += 1)
            {
                try
                {
                    new FileInfo(path).SetAccessControl(BuildFileSecurity(sid));
                    return;
                }
                catch (Exception error) when (error is UnauthorizedAccessException || error is IOException)
                {
                    lastError = error;
                    Thread.Sleep(50);
                }
            }
            throw new IOException("Could not apply the current-user-only file ACL after bounded retries: " + path, lastError);
        }

        private static Process StartDsh()
        {
            ProcessStartInfo info = new ProcessStartInfo();
            info.FileName = RequireEnvironment("P0S5_NODE_PATH");
            info.WorkingDirectory = RequireEnvironment("P0S5_WORKSPACE_ROOT");
            info.UseShellExecute = false;
            info.CreateNoWindow = true;
            info.RedirectStandardInput = true;
            info.RedirectStandardOutput = true;
            info.RedirectStandardError = true;
            info.ArgumentList.Add(RequireEnvironment("P0S5_DSH_CLI"));
            info.ArgumentList.Add("--profile");
            info.ArgumentList.Add("shaco-host");
            info.Environment["DSH_HOME"] = RequireEnvironment("P0S5_RUNTIME_ROOT");
            info.Environment["DSH_TELEMETRY_DISABLED"] = "1";
            foreach (string name in new string[]
            {
                "P0S5_DSH_READY_FILE", "P0S5_DSH_SUMMARY_FILE", "P0S5_DSH_FAILURE_FILE",
                "P0S5_HOST_EVENTS_FILE", "P0S5_WORKER_INSTANCE_ID"
            })
            {
                info.Environment[name] = RequireEnvironment(name);
            }
            Process process = new Process();
            process.StartInfo = info;
            process.EnableRaisingEvents = true;
            if (!process.Start()) throw new InvalidOperationException("Failed to start frozen dsh launcher.");
            return process;
        }

        private static void StartDshPumps(Process dsh)
        {
            dsh.OutputDataReceived += delegate(object sender, DataReceivedEventArgs args)
            {
                if (args.Data == null || !args.Data.StartsWith(DshOutputPrefix, StringComparison.Ordinal)) return;
                DshResponses.Add(args.Data.Substring(DshOutputPrefix.Length));
            };
            dsh.ErrorDataReceived += delegate { };
            dsh.BeginOutputReadLine();
            dsh.BeginErrorReadLine();
        }

        private static void WaitForDshReady(Process dsh)
        {
            string readyFile = RequireEnvironment("P0S5_DSH_READY_FILE");
            string failureFile = RequireEnvironment("P0S5_DSH_FAILURE_FILE");
            DateTime deadline = DateTime.UtcNow.AddSeconds(75);
            while (DateTime.UtcNow < deadline)
            {
                if (File.Exists(readyFile)) return;
                if (File.Exists(failureFile)) throw new InvalidOperationException("Frozen dsh Host reported startup failure.");
                if (dsh.HasExited) throw new InvalidOperationException("Frozen dsh Host exited before readiness.");
                Thread.Sleep(100);
            }
            throw new TimeoutException("Frozen dsh Host did not reach readiness.");
        }

        private static void PublishWorker(SecurityIdentifier sid, Process dsh)
        {
            string credentialPath = RequireEnvironment("P0S5_CREDENTIAL_FILE");
            string discoveryPath = RequireEnvironment("P0S5_DISCOVERY_FILE");
            Directory.CreateDirectory(Path.GetDirectoryName(credentialPath));
            Dictionary<string, object> credential = new Dictionary<string, object>
            {
                ["classification"] = "NOT_PRODUCTION",
                ["credentialEpoch"] = RequireEnvironment("P0S5_CREDENTIAL_EPOCH"),
                ["secret"] = RequireEnvironment("P0S5_EPHEMERAL_SECRET"),
                ["userSid"] = sid.Value,
            };
            File.WriteAllText(credentialPath, Serialize(credential) + "\n", Utf8NoBom);
            SecureFile(credentialPath, sid);

            Process carrier = Process.GetCurrentProcess();
            Dictionary<string, object> descriptor = new Dictionary<string, object>
            {
                ["classification"] = "NOT_PRODUCTION",
                ["workerInstanceId"] = RequireEnvironment("P0S5_WORKER_INSTANCE_ID"),
                ["carrierPid"] = carrier.Id,
                ["carrierStartTimeUtc"] = carrier.StartTime.ToUniversalTime().ToString("o"),
                ["dshPid"] = dsh.Id,
                ["dshStartTimeUtc"] = dsh.StartTime.ToUniversalTime().ToString("o"),
                ["endpointId"] = RequireEnvironment("P0S5_ENDPOINT_ID"),
                ["pipeName"] = RequireEnvironment("P0S5_PIPE_NAME"),
                ["credentialEpoch"] = RequireEnvironment("P0S5_CREDENTIAL_EPOCH"),
                ["credentialPath"] = credentialPath,
                ["publishedAtUtc"] = DateTime.UtcNow.ToString("o"),
                ["dshAssignedToKillOnCloseJob"] = true,
            };
            string temporary = discoveryPath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            File.WriteAllText(temporary, Serialize(descriptor) + "\n", Utf8NoBom);
            SecureFile(temporary, sid);
            File.Move(temporary, discoveryPath, true);
            WriteJson(RequireEnvironment("P0S5_WORKER_READY_FILE"), descriptor);
        }

        private static void HandleConnection(NamedPipeServerStream pipe, string expectedSid, Process dsh)
        {
            string workerInstanceId = RequireEnvironment("P0S5_WORKER_INSTANCE_ID");
            string endpointId = RequireEnvironment("P0S5_ENDPOINT_ID");
            string credentialEpoch = RequireEnvironment("P0S5_CREDENTIAL_EPOCH");
            string secret = RequireEnvironment("P0S5_EPHEMERAL_SECRET");
            string serverNonce = RandomHex(32);
            string challengeId = Guid.NewGuid().ToString();
            WriteFrame(pipe, Serialize(new Dictionary<string, object>
            {
                ["type"] = "server-challenge",
                ["protocolVersion"] = ProtocolVersion,
                ["requestId"] = challengeId,
                ["workerIdentityHashPrefix"] = HashPrefix(workerInstanceId),
                ["endpointIdentityHashPrefix"] = HashPrefix(endpointId),
                ["credentialEpochHashPrefix"] = HashPrefix(credentialEpoch),
                ["serverNonce"] = serverNonce,
            }));

            string authRaw;
            try
            {
                authRaw = ReadFrame(pipe);
            }
            catch (Exception error)
            {
                Reject(pipe, "invalid-auth-frame", null, error.GetType().Name);
                return;
            }

            string requestId;
            string clientNonce;
            using (JsonDocument document = JsonDocument.Parse(authRaw))
            {
                JsonElement auth = document.RootElement;
                requestId = GetString(auth, "requestId");
                clientNonce = GetString(auth, "clientNonce");
                if (!String.Equals(GetString(auth, "type"), "client-auth", StringComparison.Ordinal))
                {
                    Reject(pipe, "unauthenticated-request", requestId, null);
                    return;
                }
                if (!Guid.TryParse(requestId, out _) || GetInt32(auth, "protocolVersion") != ProtocolVersion)
                {
                    Reject(pipe, "invalid-auth-envelope", requestId, null);
                    return;
                }
                if (!String.Equals(GetString(auth, "workerInstanceId"), workerInstanceId, StringComparison.Ordinal)
                    || !String.Equals(GetString(auth, "endpointId"), endpointId, StringComparison.Ordinal)
                    || !String.Equals(GetString(auth, "userSid"), expectedSid, StringComparison.Ordinal)
                    || !String.Equals(GetString(auth, "credentialEpoch"), credentialEpoch, StringComparison.Ordinal))
                {
                    Reject(pipe, "stale-or-wrong-identity", requestId, null);
                    return;
                }
                lock (UsedClientNonces)
                {
                    if (String.IsNullOrWhiteSpace(clientNonce) || !UsedClientNonces.Add(clientNonce))
                    {
                        Reject(pipe, "replayed-client-nonce", requestId, null);
                        return;
                    }
                }
                string expectedProof = ComputeProof(secret, expectedSid, workerInstanceId, endpointId, requestId, clientNonce, serverNonce);
                if (!FixedTimeEquals(expectedProof, GetString(auth, "proof")))
                {
                    Reject(pipe, "invalid-proof", requestId, null);
                    return;
                }
            }

            WriteFrame(pipe, Serialize(new Dictionary<string, object>
            {
                ["type"] = "authentication-complete",
                ["requestId"] = requestId,
                ["workerIdentityHashPrefix"] = HashPrefix(workerInstanceId),
                ["endpointIdentityHashPrefix"] = HashPrefix(endpointId),
                ["credentialEpochHashPrefix"] = HashPrefix(credentialEpoch),
                ["gatewayDispatchCount"] = gatewayForwarded,
            }));
            AppendEvent("pipe_authenticated", new Dictionary<string, object>
            {
                ["connectionOrdinal"] = connectionCount,
                ["workerInstanceId"] = workerInstanceId,
            });

            HashSet<string> activeStreams = new HashSet<string>(StringComparer.Ordinal);
            using (CancellationTokenSource cancellation = new CancellationTokenSource())
            {
                Task pump = Task.Run(() => PumpDshResponses(pipe, cancellation.Token));
                try
                {
                    while (pipe.IsConnected && !finishRequested)
                    {
                        string raw;
                        try { raw = ReadFrame(pipe); }
                        catch (EndOfStreamException) { break; }
                        catch (IOException) { break; }
                        catch (Exception error)
                        {
                            Reject(pipe, "invalid-authenticated-frame", null, error.GetType().Name);
                            break;
                        }
                        using (JsonDocument frameDocument = JsonDocument.Parse(raw))
                        {
                            JsonElement frame = frameDocument.RootElement;
                            string type = GetString(frame, "type");
                            string frameRequestId = GetString(frame, "requestId");
                            if (!Guid.TryParse(frameRequestId, out _))
                            {
                                Reject(pipe, "invalid-correlation-id", frameRequestId, null);
                                break;
                            }
                            if (String.Equals(type, "rpc-call", StringComparison.Ordinal))
                            {
                                string endpoint = GetString(frame, "endpoint");
                                if (!String.Equals(GetString(frame, "channel"), "/api", StringComparison.Ordinal)
                                    || !IsAllowedRpcEndpoint(endpoint))
                                {
                                    Reject(pipe, "endpoint-not-allowlisted", frameRequestId, endpoint);
                                    break;
                                }
                                gatewayForwarded += 1;
                                SendToDsh(dsh, raw);
                            }
                            else if (String.Equals(type, "stream-open", StringComparison.Ordinal))
                            {
                                string endpoint = GetString(frame, "endpoint");
                                string streamId = GetString(frame, "streamId");
                                if (!String.Equals(endpoint, "$events", StringComparison.Ordinal) || !Guid.TryParse(streamId, out _))
                                {
                                    Reject(pipe, "stream-not-allowlisted", frameRequestId, endpoint);
                                    break;
                                }
                                activeStreams.Add(streamId);
                                streamForwarded += 1;
                                SendToDsh(dsh, raw);
                            }
                            else if (String.Equals(type, "stream-credit", StringComparison.Ordinal)
                                || String.Equals(type, "stream-cancel", StringComparison.Ordinal))
                            {
                                string streamId = GetString(frame, "streamId");
                                if (!activeStreams.Contains(streamId))
                                {
                                    Reject(pipe, "unknown-stream-id", frameRequestId, null);
                                    break;
                                }
                                SendToDsh(dsh, raw);
                                if (String.Equals(type, "stream-cancel", StringComparison.Ordinal)) activeStreams.Remove(streamId);
                            }
                            else if (String.Equals(type, "diagnostic-status", StringComparison.Ordinal))
                            {
                                SendToDsh(dsh, raw);
                            }
                            else if (String.Equals(type, "carrier-finish", StringComparison.Ordinal))
                            {
                                WriteFrame(pipe, Serialize(new Dictionary<string, object>
                                {
                                    ["type"] = "carrier-finished",
                                    ["requestId"] = frameRequestId,
                                }));
                                finishRequested = true;
                                break;
                            }
                            else
                            {
                                Reject(pipe, "unsupported-authenticated-frame", frameRequestId, type);
                                break;
                            }
                        }
                    }
                }
                finally
                {
                    if (!finishRequested)
                    {
                        connectionLossCount += 1;
                        AppendEvent("pipe_transport_lost", new Dictionary<string, object>
                        {
                            ["connectionOrdinal"] = connectionCount,
                            ["activeStreamCount"] = activeStreams.Count,
                        });
                        foreach (string streamId in activeStreams)
                        {
                            SendToDsh(dsh, Serialize(new Dictionary<string, object>
                            {
                                ["type"] = "stream-cancel",
                                ["requestId"] = Guid.NewGuid().ToString(),
                                ["streamId"] = streamId,
                                ["reason"] = "connection-loss",
                            }));
                        }
                    }
                    cancellation.Cancel();
                    try { pump.Wait(2000); } catch { }
                }
            }
        }

        private static void PumpDshResponses(NamedPipeServerStream pipe, CancellationToken token)
        {
            try
            {
                while (!token.IsCancellationRequested && pipe.IsConnected)
                {
                    string raw = DshResponses.Take(token);
                    WriteFrame(pipe, Encoding.UTF8.GetString(Convert.FromBase64String(raw)));
                }
            }
            catch (OperationCanceledException) { }
            catch (IOException) { }
        }

        private static void SendToDsh(Process dsh, string raw)
        {
            string encoded = Convert.ToBase64String(Utf8NoBom.GetBytes(raw));
            lock (DshWriteLock)
            {
                dsh.StandardInput.WriteLine(DshInputPrefix + encoded);
                dsh.StandardInput.Flush();
            }
        }

        private static string ReadFrame(Stream stream)
        {
            byte[] header = ReadExactly(stream, 4);
            int length = header[0] | (header[1] << 8) | (header[2] << 16) | (header[3] << 24);
            if (length <= 0 || length > MaxFrameBytes) throw new InvalidDataException("Invalid frame length.");
            byte[] payload = ReadExactly(stream, length);
            string raw = Utf8NoBom.GetString(payload);
            using (JsonDocument.Parse(raw)) { }
            return raw;
        }

        private static byte[] ReadExactly(Stream stream, int length)
        {
            byte[] value = new byte[length];
            int offset = 0;
            while (offset < length)
            {
                int read = stream.Read(value, offset, length - offset);
                if (read == 0) throw new EndOfStreamException();
                offset += read;
            }
            return value;
        }

        private static void WriteFrame(Stream stream, string raw)
        {
            byte[] payload = Utf8NoBom.GetBytes(raw);
            if (payload.Length > MaxFrameBytes) throw new InvalidDataException("Frame exceeds maximum.");
            byte[] header = BitConverter.GetBytes(payload.Length);
            lock (WriteLock)
            {
                stream.Write(header, 0, header.Length);
                stream.Write(payload, 0, payload.Length);
                stream.Flush();
            }
        }

        private static bool IsAllowedRpcEndpoint(string endpoint)
        {
            return String.Equals(endpoint, "$events/result", StringComparison.Ordinal)
                || String.Equals(endpoint, "session/cancel", StringComparison.Ordinal)
                || String.Equals(endpoint, "agentPresets/list", StringComparison.Ordinal)
                || endpoint.StartsWith("p0s5Fixture/", StringComparison.Ordinal);
        }

        private static void Reject(Stream pipe, string reason, string requestId, string detail)
        {
            Dictionary<string, object> record = new Dictionary<string, object>
            {
                ["sequence"] = Rejections.Count + 1,
                ["reason"] = reason,
                ["gatewayForwardedCountAtDecision"] = gatewayForwarded,
                ["authenticated"] = false,
            };
            if (!String.IsNullOrWhiteSpace(detail)) record["detail"] = detail;
            Rejections.Add(record);
            AppendEvent("carrier_rejection", record);
            try
            {
                WriteFrame(pipe, Serialize(new Dictionary<string, object>
                {
                    ["type"] = "authentication-rejected",
                    ["requestId"] = requestId,
                    ["reason"] = reason,
                    ["gatewayDispatchCount"] = gatewayForwarded,
                }));
            }
            catch { }
        }

        private static string ComputeProof(string secret, string sid, string worker, string endpoint, string requestId, string clientNonce, string serverNonce)
        {
            string canonical = String.Join("\n", new string[]
            {
                ProtocolVersion.ToString(), sid, worker, endpoint, requestId, clientNonce, serverNonce,
            });
            using (HMACSHA256 hmac = new HMACSHA256(Convert.FromHexString(secret)))
            {
                return Convert.ToHexString(hmac.ComputeHash(Utf8NoBom.GetBytes(canonical))).ToLowerInvariant();
            }
        }

        private static bool FixedTimeEquals(string expected, string actual)
        {
            if (String.IsNullOrWhiteSpace(actual)) return false;
            try
            {
                return CryptographicOperations.FixedTimeEquals(Convert.FromHexString(expected), Convert.FromHexString(actual));
            }
            catch { return false; }
        }

        private static string GetString(JsonElement element, string property)
        {
            if (!element.TryGetProperty(property, out JsonElement value) || value.ValueKind != JsonValueKind.String) return String.Empty;
            return value.GetString() ?? String.Empty;
        }

        private static int GetInt32(JsonElement element, string property)
        {
            if (!element.TryGetProperty(property, out JsonElement value) || !value.TryGetInt32(out int result)) return Int32.MinValue;
            return result;
        }

        private static string RandomHex(int bytes)
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(bytes)).ToLowerInvariant();
        }

        private static string HashPrefix(string value)
        {
            return Convert.ToHexString(SHA256.HashData(Utf8NoBom.GetBytes(value))).ToLowerInvariant().Substring(0, 16);
        }

        private static string Serialize(object value)
        {
            return JsonSerializer.Serialize(value);
        }

        private static void WriteJson(string path, object value)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            string temporary = path + "." + Process.GetCurrentProcess().Id + "." + Guid.NewGuid().ToString("N") + ".tmp";
            File.WriteAllText(temporary, JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }) + "\n", Utf8NoBom);
            File.Move(temporary, path, true);
        }

        private static void AppendEvent(string type, IDictionary<string, object> details)
        {
            Dictionary<string, object> value = new Dictionary<string, object>
            {
                ["recordId"] = Guid.NewGuid().ToString(),
                ["source"] = "worker-carrier",
                ["sourceSequence"] = Interlocked.Increment(ref eventSequence),
                ["monotonicTicks"] = Stopwatch.GetTimestamp().ToString(),
                ["utc"] = DateTime.UtcNow.ToString("o"),
                ["workerInstanceId"] = Environment.GetEnvironmentVariable("P0S5_WORKER_INSTANCE_ID"),
                ["type"] = type,
            };
            foreach (KeyValuePair<string, object> item in details) value[item.Key] = item.Value;
            lock (EventWriteLock)
            {
                File.AppendAllText(RequireEnvironment("P0S5_WORKER_EVENTS_FILE"), Serialize(value) + "\n", Utf8NoBom);
            }
        }
    }
}
