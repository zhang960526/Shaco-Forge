// NOT_PRODUCTION: disposable Windows Named Pipe ACL/auth/framing carrier.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ShacoForge.P0S3
{
    public static class WorkerCarrier
    {
        private const int ProtocolVersion = 1;
        private const int MaxFrameBytes = 262144;
        private const string DshInputPrefix = "P0S3_IN ";
        private const string DshOutputPrefix = "P0S3_FRAME ";
        private static readonly UTF8Encoding Utf8NoBom = new UTF8Encoding(false);
        private static readonly object WriteLock = new object();
        private static readonly BlockingCollection<string> DshResponses = new BlockingCollection<string>();
        private static readonly HashSet<string> UsedClientNonces = new HashSet<string>(StringComparer.Ordinal);
        private static readonly List<Dictionary<string, object>> Rejections = new List<Dictionary<string, object>>();
        private static int gatewayForwarded;
        private static int streamForwarded;
        private static int logicalFramesRead;
        private static int physicalReadOperations;
        private static int framesRequiringMultipleReads;
        private static int logicalFramesWritten;
        private static int fragmentedFrameWrites;
        private static bool finishRequested;

        private sealed class OversizeFrameException : Exception
        {
            public OversizeFrameException(int size) : base("Frame exceeds the configured maximum.")
            {
                Size = size;
            }

            public int Size { get; private set; }
        }

        public static int Run()
        {
            string pipeName = RequireEnvironment("P0S3_PIPE_NAME");
            string secret = RequireEnvironment("P0S3_EPHEMERAL_SECRET");
            string workerId = RequireEnvironment("P0S3_WORKER_ID");
            string endpointId = RequireEnvironment("P0S3_ENDPOINT_ID");
            string expectedSid = RequireEnvironment("P0S3_USER_SID");
            string readyFile = RequireEnvironment("P0S3_WORKER_READY_FILE");
            string summaryFile = RequireEnvironment("P0S3_WORKER_SUMMARY_FILE");
            string failureFile = RequireEnvironment("P0S3_WORKER_FAILURE_FILE");
            string dshReadyFile = RequireEnvironment("P0S3_DSH_READY_FILE");
            string dshFailureFile = RequireEnvironment("P0S3_DSH_FAILURE_FILE");

            Process dsh = null;
            bool dshGraceful = false;
            long workerCarrierPeakWorkingSetBytes = 0;
            long dshPeakWorkingSetBytes = 0;
            try
            {
                SecurityIdentifier currentSid = WindowsIdentity.GetCurrent().User;
                if (currentSid == null || !String.Equals(currentSid.Value, expectedSid, StringComparison.Ordinal))
                {
                    throw new InvalidOperationException("Current Windows SID does not match the runner identity.");
                }

                dsh = StartDsh();
                StartDshPumps(dsh);
                WaitForDshReady(dsh, dshReadyFile, dshFailureFile);

                bool firstServer = true;
                while (!finishRequested)
                {
                    PipeSecurity security = BuildPipeSecurity(currentSid);
                    using (NamedPipeServerStream server = NamedPipeServerStreamAcl.Create(
                        pipeName,
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
                        if (firstServer)
                        {
                            PipeSecurity effective = PipesAclExtensions.GetAccessControl(server);
                            WriteReadyEvidence(
                                readyFile,
                                currentSid,
                                effective,
                                dsh.Id,
                                pipeName,
                                workerId,
                                endpointId);
                            firstServer = false;
                        }

                        server.WaitForConnection();
                        HandleConnection(server, secret, workerId, endpointId, expectedSid, dsh);
                    }
                }

                workerCarrierPeakWorkingSetBytes = Process.GetCurrentProcess().PeakWorkingSet64;
                dshPeakWorkingSetBytes = dsh.PeakWorkingSet64;
                try
                {
                    dsh.StandardInput.WriteLine("P0S3_CONTROL_STOP");
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

                WriteJson(summaryFile, new Dictionary<string, object>
                {
                    ["classification"] = "NOT_PRODUCTION",
                    ["workerCarrierPid"] = Process.GetCurrentProcess().Id,
                    ["dshPid"] = dsh.Id,
                    ["dshExitCode"] = dsh.ExitCode,
                    ["dshGracefulStopObserved"] = dshGraceful,
                    ["workerCarrierPeakWorkingSetBytes"] = workerCarrierPeakWorkingSetBytes,
                    ["dshPeakWorkingSetBytes"] = dshPeakWorkingSetBytes,
                    ["gatewayForwardedCount"] = gatewayForwarded,
                    ["streamForwardedCount"] = streamForwarded,
                    ["logicalFramesRead"] = logicalFramesRead,
                    ["physicalReadOperations"] = physicalReadOperations,
                    ["framesRequiringMultipleReads"] = framesRequiringMultipleReads,
                    ["logicalFramesWritten"] = logicalFramesWritten,
                    ["fragmentedFrameWrites"] = fragmentedFrameWrites,
                    ["maxFrameBytes"] = MaxFrameBytes,
                    ["framePrefixBytes"] = 4,
                    ["rejections"] = Rejections,
                    ["pipeEndpointRedacted"] = true,
                    ["ephemeralSecretPersisted"] = false,
                    ["cookieUsed"] = false,
                });
                return 0;
            }
            catch (Exception error)
            {
                WriteJson(failureFile, new Dictionary<string, object>
                {
                    ["classification"] = "NOT_PRODUCTION",
                    ["workerCarrierPid"] = Process.GetCurrentProcess().Id,
                    ["errorType"] = error.GetType().Name,
                    ["message"] = error.Message,
                });
                if (dsh != null && !dsh.HasExited)
                {
                    try { dsh.Kill(true); } catch { }
                }
                return 1;
            }
            finally
            {
                if (dsh != null) dsh.Dispose();
            }
        }

        private static string RequireEnvironment(string name)
        {
            string value = Environment.GetEnvironmentVariable(name);
            if (String.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException("Required environment value is missing: " + name);
            }
            return value;
        }

        private static PipeSecurity BuildPipeSecurity(SecurityIdentifier sid)
        {
            PipeSecurity security = new PipeSecurity();
            security.SetAccessRuleProtection(true, false);
            security.SetOwner(sid);
            security.AddAccessRule(new PipeAccessRule(
                sid,
                PipeAccessRights.FullControl,
                AccessControlType.Allow));
            return security;
        }

        private static Process StartDsh()
        {
            ProcessStartInfo info = new ProcessStartInfo();
            info.FileName = RequireEnvironment("P0S3_NODE_PATH");
            info.WorkingDirectory = RequireEnvironment("P0S3_WORKSPACE_ROOT");
            info.UseShellExecute = false;
            info.CreateNoWindow = true;
            info.RedirectStandardInput = true;
            info.RedirectStandardOutput = true;
            info.RedirectStandardError = true;
            info.ArgumentList.Add(RequireEnvironment("P0S3_DSH_CLI"));
            info.ArgumentList.Add("--profile");
            info.ArgumentList.Add("shaco-host");
            info.Environment["DSH_HOME"] = RequireEnvironment("P0S3_RUNTIME_ROOT");
            info.Environment["DSH_TELEMETRY_DISABLED"] = "1";
            info.Environment["P0S3_DSH_READY_FILE"] = RequireEnvironment("P0S3_DSH_READY_FILE");
            info.Environment["P0S3_DSH_SUMMARY_FILE"] = RequireEnvironment("P0S3_DSH_SUMMARY_FILE");
            info.Environment["P0S3_DSH_FAILURE_FILE"] = RequireEnvironment("P0S3_DSH_FAILURE_FILE");
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

        private static void WaitForDshReady(Process dsh, string readyFile, string failureFile)
        {
            DateTime deadline = DateTime.UtcNow.AddSeconds(75);
            while (DateTime.UtcNow < deadline)
            {
                if (File.Exists(readyFile)) return;
                if (File.Exists(failureFile)) throw new InvalidOperationException("Frozen dsh Host reported a startup failure.");
                if (dsh.HasExited) throw new InvalidOperationException("Frozen dsh Host exited before readiness.");
                Thread.Sleep(100);
            }
            throw new TimeoutException("Frozen dsh Host did not reach readiness.");
        }

        private static void WriteReadyEvidence(
            string path,
            SecurityIdentifier sid,
            PipeSecurity effective,
            int dshPid,
            string pipeName,
            string workerId,
            string endpointId)
        {
            List<Dictionary<string, object>> rules = new List<Dictionary<string, object>>();
            AuthorizationRuleCollection accessRules = effective.GetAccessRules(true, true, typeof(SecurityIdentifier));
            foreach (PipeAccessRule rule in accessRules)
            {
                rules.Add(new Dictionary<string, object>
                {
                    ["identitySid"] = rule.IdentityReference.Value,
                    ["accessControlType"] = rule.AccessControlType.ToString(),
                    ["rights"] = rule.PipeAccessRights.ToString(),
                    ["isInherited"] = rule.IsInherited,
                });
            }
            bool currentUserOnly = rules.Count > 0
                && rules.All(rule => String.Equals((string)rule["identitySid"], sid.Value, StringComparison.Ordinal))
                && rules.All(rule => String.Equals((string)rule["accessControlType"], "Allow", StringComparison.Ordinal));

            WriteJson(path, new Dictionary<string, object>
            {
                ["classification"] = "NOT_PRODUCTION",
                ["workerCarrierPid"] = Process.GetCurrentProcess().Id,
                ["dshPid"] = dshPid,
                ["protocolVersion"] = ProtocolVersion,
                ["maxFrameBytes"] = MaxFrameBytes,
                ["framePrefixBytes"] = 4,
                ["pipeTransmissionMode"] = "Byte",
                ["pipeOptionsCurrentUserOnly"] = false,
                ["explicitProtectedCurrentUserAcl"] = true,
                ["currentUserSid"] = sid.Value,
                ["aclOwnerSid"] = effective.GetOwner(typeof(SecurityIdentifier)).Value,
                ["aclProtected"] = effective.AreAccessRulesProtected,
                ["aclSddl"] = effective.GetSecurityDescriptorSddlForm(AccessControlSections.Owner | AccessControlSections.Access),
                ["aclRules"] = rules,
                ["currentUserOnly"] = currentUserOnly,
                ["pipeEndpointHashPrefix"] = HashPrefix(pipeName),
                ["pipeEndpointRedacted"] = true,
                ["workerIdentityHashPrefix"] = HashPrefix(workerId),
                ["endpointIdentityHashPrefix"] = HashPrefix(endpointId),
                ["ephemeralSecretBytes"] = RequireEnvironment("P0S3_EPHEMERAL_SECRET").Length / 2,
                ["ephemeralSecretPersisted"] = false,
            });
        }

        private static void HandleConnection(
            NamedPipeServerStream pipe,
            string secret,
            string workerId,
            string endpointId,
            string expectedSid,
            Process dsh)
        {
            string serverNonce = RandomHex(32);
            string challengeId = Guid.NewGuid().ToString();
            WriteFrame(pipe, Serialize(new Dictionary<string, object>
            {
                ["type"] = "server-challenge",
                ["protocolVersion"] = ProtocolVersion,
                ["requestId"] = challengeId,
                ["workerIdentityHashPrefix"] = HashPrefix(workerId),
                ["endpointIdentityHashPrefix"] = HashPrefix(endpointId),
                ["serverNonce"] = serverNonce,
            }));

            string authRaw;
            try
            {
                authRaw = ReadFrame(pipe);
            }
            catch (OversizeFrameException error)
            {
                Reject(pipe, "oversize-frame", null, error.Size);
                return;
            }
            catch (JsonException)
            {
                Reject(pipe, "malformed-frame", null, null);
                return;
            }
            catch (EndOfStreamException)
            {
                return;
            }

            string clientNonce;
            string requestId;
            using (JsonDocument authDocument = JsonDocument.Parse(authRaw))
            {
                JsonElement auth = authDocument.RootElement;
                string type = GetString(auth, "type");
                requestId = GetString(auth, "requestId");
                if (!String.Equals(type, "client-auth", StringComparison.Ordinal))
                {
                    Reject(pipe, "unauthenticated-request", requestId, null);
                    return;
                }
                if (!Guid.TryParse(requestId, out _))
                {
                    Reject(pipe, "invalid-correlation-id", requestId, null);
                    return;
                }
                if (GetInt32(auth, "protocolVersion") != ProtocolVersion)
                {
                    Reject(pipe, "protocol-version-mismatch", requestId, null);
                    return;
                }
                if (!String.Equals(GetString(auth, "workerId"), workerId, StringComparison.Ordinal))
                {
                    Reject(pipe, "worker-identity-mismatch", requestId, null);
                    return;
                }
                if (!String.Equals(GetString(auth, "endpointId"), endpointId, StringComparison.Ordinal))
                {
                    Reject(pipe, "endpoint-identity-mismatch", requestId, null);
                    return;
                }
                if (!String.Equals(GetString(auth, "userSid"), expectedSid, StringComparison.Ordinal))
                {
                    Reject(pipe, "user-sid-mismatch", requestId, null);
                    return;
                }
                if (!String.Equals(GetString(auth, "serverNonce"), serverNonce, StringComparison.Ordinal))
                {
                    Reject(pipe, "replayed-handshake", requestId, null);
                    return;
                }
                clientNonce = GetString(auth, "clientNonce");
                if (String.IsNullOrWhiteSpace(clientNonce) || UsedClientNonces.Contains(clientNonce))
                {
                    Reject(pipe, "replayed-handshake", requestId, null);
                    return;
                }
                string expectedProof = ComputeProof(
                    secret,
                    ProtocolVersion,
                    expectedSid,
                    workerId,
                    endpointId,
                    requestId,
                    clientNonce,
                    serverNonce);
                if (!FixedTimeEquals(expectedProof, GetString(auth, "proof")))
                {
                    Reject(pipe, "invalid-proof", requestId, null);
                    return;
                }
            }

            UsedClientNonces.Add(clientNonce);
            WriteFrame(pipe, Serialize(new Dictionary<string, object>
            {
                ["type"] = "authentication-complete",
                ["requestId"] = requestId,
                ["authenticated"] = true,
                ["gatewayForwardedCount"] = gatewayForwarded,
            }));

            using (CancellationTokenSource responseCancellation = new CancellationTokenSource())
            {
                Task responsePump = Task.Run(() => PumpDshResponses(pipe, responseCancellation.Token));
                try
                {
                    while (pipe.IsConnected && !finishRequested)
                    {
                        string raw;
                        try
                        {
                            raw = ReadFrame(pipe);
                        }
                        catch (OversizeFrameException error)
                        {
                            Reject(pipe, "oversize-frame", null, error.Size);
                            break;
                        }
                        catch (JsonException)
                        {
                            Reject(pipe, "malformed-frame", null, null);
                            break;
                        }
                        catch (EndOfStreamException)
                        {
                            break;
                        }

                        using (JsonDocument document = JsonDocument.Parse(raw))
                        {
                            JsonElement frame = document.RootElement;
                            string type = GetString(frame, "type");
                            string frameRequestId = GetString(frame, "requestId");
                            if (!Guid.TryParse(frameRequestId, out _))
                            {
                                Reject(pipe, "invalid-correlation-id", frameRequestId, null);
                                break;
                            }
                            if (String.Equals(type, "rpc-call", StringComparison.Ordinal))
                            {
                                string channel = GetString(frame, "channel");
                                string endpoint = GetString(frame, "endpoint");
                                if (!String.Equals(channel, "/api", StringComparison.Ordinal)
                                    || !String.Equals(endpoint, "agentPresets/list", StringComparison.Ordinal))
                                {
                                    Reject(pipe, "endpoint-not-allowlisted", frameRequestId, null);
                                    break;
                                }
                                gatewayForwarded += 1;
                                SendToDsh(dsh, raw);
                            }
                            else if (String.Equals(type, "stream-open", StringComparison.Ordinal))
                            {
                                if (!String.Equals(GetString(frame, "endpoint"), "p0s3/basic-stream", StringComparison.Ordinal))
                                {
                                    Reject(pipe, "stream-endpoint-not-allowlisted", frameRequestId, null);
                                    break;
                                }
                                streamForwarded += 1;
                                SendToDsh(dsh, raw);
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
                                    ["gatewayForwardedCount"] = gatewayForwarded,
                                    ["streamForwardedCount"] = streamForwarded,
                                    ["rejectionCount"] = Rejections.Count,
                                }));
                                finishRequested = true;
                                break;
                            }
                            else
                            {
                                Reject(pipe, "unsupported-authenticated-frame", frameRequestId, null);
                                break;
                            }
                        }
                    }
                }
                finally
                {
                    responseCancellation.Cancel();
                    try { responsePump.Wait(2000); } catch { }
                }
            }
        }

        private static void PumpDshResponses(NamedPipeServerStream pipe, CancellationToken cancellationToken)
        {
            try
            {
                while (!cancellationToken.IsCancellationRequested && pipe.IsConnected)
                {
                    string encoded = DshResponses.Take(cancellationToken);
                    string raw = Utf8NoBom.GetString(Convert.FromBase64String(encoded));
                    WriteFrame(pipe, raw);
                }
            }
            catch (OperationCanceledException) { }
            catch (IOException) { }
        }

        private static void SendToDsh(Process dsh, string raw)
        {
            string encoded = Convert.ToBase64String(Utf8NoBom.GetBytes(raw));
            lock (dsh)
            {
                dsh.StandardInput.WriteLine(DshInputPrefix + encoded);
                dsh.StandardInput.Flush();
            }
        }

        private static string ReadFrame(Stream stream)
        {
            int frameReads = 0;
            byte[] header = ReadExactly(stream, 4, ref frameReads);
            int length = header[0] | (header[1] << 8) | (header[2] << 16) | (header[3] << 24);
            if (length <= 0 || length > MaxFrameBytes) throw new OversizeFrameException(length);
            byte[] payload = ReadExactly(stream, length, ref frameReads);
            logicalFramesRead += 1;
            physicalReadOperations += frameReads;
            if (frameReads > 2) framesRequiringMultipleReads += 1;
            string raw = Utf8NoBom.GetString(payload);
            using (JsonDocument.Parse(raw)) { }
            return raw;
        }

        private static byte[] ReadExactly(Stream stream, int length, ref int readOperations)
        {
            byte[] buffer = new byte[length];
            int offset = 0;
            while (offset < length)
            {
                int read = stream.Read(buffer, offset, length - offset);
                readOperations += 1;
                if (read == 0) throw new EndOfStreamException();
                offset += read;
            }
            return buffer;
        }

        private static void WriteFrame(Stream stream, string raw)
        {
            byte[] payload = Utf8NoBom.GetBytes(raw);
            if (payload.Length > MaxFrameBytes) throw new OversizeFrameException(payload.Length);
            byte[] header = BitConverter.GetBytes(payload.Length);
            lock (WriteLock)
            {
                stream.Write(header, 0, 2);
                stream.Flush();
                Thread.Sleep(2);
                stream.Write(header, 2, 2);
                stream.Flush();
                Thread.Sleep(2);
                int offset = 0;
                int[] chunks = new int[] { 5, 11, payload.Length };
                foreach (int requested in chunks)
                {
                    if (offset >= payload.Length) break;
                    int size = Math.Min(requested, payload.Length - offset);
                    stream.Write(payload, offset, size);
                    stream.Flush();
                    offset += size;
                    if (offset < payload.Length) Thread.Sleep(1);
                }
                logicalFramesWritten += 1;
                fragmentedFrameWrites += 1;
            }
        }

        private static void Reject(Stream pipe, string reason, string requestId, int? observedSize)
        {
            Dictionary<string, object> record = new Dictionary<string, object>
            {
                ["sequence"] = Rejections.Count + 1,
                ["reason"] = reason,
                ["gatewayForwardedCountAtDecision"] = gatewayForwarded,
                ["authenticated"] = false,
            };
            if (observedSize.HasValue) record["observedFrameBytes"] = observedSize.Value;
            Rejections.Add(record);
            try
            {
                WriteFrame(pipe, Serialize(new Dictionary<string, object>
                {
                    ["type"] = "authentication-rejected",
                    ["requestId"] = requestId,
                    ["reason"] = reason,
                    ["gatewayForwardedCount"] = gatewayForwarded,
                }));
            }
            catch { }
        }

        private static string ComputeProof(
            string secret,
            int protocolVersion,
            string sid,
            string workerId,
            string endpointId,
            string requestId,
            string clientNonce,
            string serverNonce)
        {
            string canonical = String.Join("\n", new string[]
            {
                protocolVersion.ToString(), sid, workerId, endpointId,
                requestId, clientNonce, serverNonce,
            });
            using (HMACSHA256 hmac = new HMACSHA256(Convert.FromHexString(secret)))
            {
                return Convert.ToHexString(hmac.ComputeHash(Utf8NoBom.GetBytes(canonical))).ToLowerInvariant();
            }
        }

        private static bool FixedTimeEquals(string expected, string actual)
        {
            if (String.IsNullOrWhiteSpace(actual)) return false;
            byte[] left;
            byte[] right;
            try
            {
                left = Convert.FromHexString(expected);
                right = Convert.FromHexString(actual);
            }
            catch
            {
                return false;
            }
            return CryptographicOperations.FixedTimeEquals(left, right);
        }

        private static string GetString(JsonElement element, string property)
        {
            JsonElement value;
            if (!element.TryGetProperty(property, out value) || value.ValueKind != JsonValueKind.String) return String.Empty;
            return value.GetString() ?? String.Empty;
        }

        private static int GetInt32(JsonElement element, string property)
        {
            JsonElement value;
            int result;
            if (!element.TryGetProperty(property, out value) || !value.TryGetInt32(out result)) return Int32.MinValue;
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
            JsonSerializerOptions options = new JsonSerializerOptions { WriteIndented = true };
            File.WriteAllText(path, JsonSerializer.Serialize(value, options) + Environment.NewLine, Utf8NoBom);
        }
    }
}
