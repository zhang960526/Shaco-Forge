import { execFile } from "node:child_process";
import { createHash, createPublicKey, verify as verifySignature } from "node:crypto";
import { appendFile, lstat, open, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { isDeepStrictEqual, promisify } from "node:util";
import { fileURLToPath } from "node:url";

export const RUNNER_VERSION = "P0S6-TVEC-RUNNER-1.0.0";
export const AUTHORITY_HEAD = "001a1e495617b211e1cd1702d5895a4c31f314ea";
export const INVOCATION_ID = "P0S6-TVEC-INVOCATION-20260904-01";

// Keep the legacy field/argument name; its value denotes an immutable anchor,
// never the required current tip. The exact Anchor is Owner-approved and fixed.
const AUTHORITY_ANCHOR = AUTHORITY_HEAD;
const SNAPSHOT_CONTRACT_ID = "P0S6-TVEC-EXECUTION-SNAPSHOT-CORRECTIVE-20260904-01";
// Approved by P0S6-TVEC-SNAPSHOT-TRUST-ROOT-PUBLIC-KEY-OA-20260905-01.
// Do not obtain a replacement key from the Binding, Manifest, argv, or environment.
const SNAPSHOT_OWNER_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEALN26KG2VWx5YM9MXwGTf2wgAdfMKrjPid6481q+goNg=
-----END PUBLIC KEY-----
`;
// Fingerprint domain: SHA-256 of DER SubjectPublicKeyInfo, not PEM text.
const SNAPSHOT_OWNER_PUBLIC_KEY_DER_SHA256 = "AE69609986B819AF66F3E9D7DE5D10E2BE893CC7CF1E7B3F146DD2B72D7AF30C";
const execFileAsync = promisify(execFile);

const ACTIVATION_DECISION_ID = "P0S6-TVEC-EA-ACTIVATION-20260904-01";
const METADATA_URL = "https://registry.npmjs.org/env-paths/2.2.1";
const EXPECTED_TARBALL_URL = "https://registry.npmjs.org/env-paths/-/env-paths-2.2.1.tgz";
const PACKAGE_NAME = "env-paths";
const PACKAGE_VERSION = "2.2.1";
const PACKAGE_LOCK_PATH = "node_modules/env-paths";
const MAX_METADATA_BYTES = 1024 * 1024;
const MAX_TARBALL_BYTES = 16 * 1024 * 1024;
const ALLOWED_CLASSIFICATIONS = new Set([
  "PASS",
  "INCONCLUSIVE",
  "INPUT_MISMATCH",
  "AUTHORITY_BLOCKED",
]);

const RUNNER_PATH = fileURLToPath(import.meta.url);
const RUNNER_DIRECTORY = path.dirname(RUNNER_PATH);
const EXECUTION_DIRECTORY = path.resolve(RUNNER_DIRECTORY, "..");
const REPOSITORY_ROOT = path.resolve(RUNNER_DIRECTORY, "../../../../../..");
const EXECUTION_ROOT = path.join(EXECUTION_DIRECTORY, "root");
const MANIFEST_PATH = path.join(EXECUTION_DIRECTORY, "manifest", "frozen-input-manifest.json");
const INVOCATION_IDENTITY_PATH = path.join(
  EXECUTION_DIRECTORY,
  "invocation",
  "invocation-identity.json",
);
const EXECUTION_ROOT_IDENTITY_PATH = path.join(EXECUTION_DIRECTORY, "execution-root-identity.json");
const RUNNER_IDENTITY_PATH = path.join(RUNNER_DIRECTORY, "runner-identity.json");
const SNAPSHOT_BINDING_PATH = path.join(EXECUTION_DIRECTORY, "snapshot", "snapshot-binding.json");

class GateError extends Error {
  constructor(classification, gate, message) {
    super(message);
    this.name = "GateError";
    this.classification = classification;
    this.gate = gate;
  }
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function sha512(bytes) {
  return createHash("sha512").update(bytes).digest("hex").toUpperCase();
}

function sha512Sri(bytes) {
  return `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
}

function sha1(bytes) {
  return createHash("sha1").update(bytes).digest("hex");
}

function utcNow() {
  return new Date().toISOString();
}

function normalizeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\\")) {
    throw new GateError("AUTHORITY_BLOCKED", "INPUT_MANIFEST", "Invalid repository-relative path");
  }

  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(value)) {
    throw new GateError("AUTHORITY_BLOCKED", "INPUT_MANIFEST", `Path traversal is prohibited: ${value}`);
  }

  return normalized;
}

function resolveRepositoryPath(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const resolved = path.resolve(REPOSITORY_ROOT, ...normalized.split("/"));
  const relation = path.relative(REPOSITORY_ROOT, resolved);
  if (relation === ".." || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    throw new GateError("AUTHORITY_BLOCKED", "INPUT_MANIFEST", `Path escapes repository: ${relativePath}`);
  }
  return resolved;
}

async function readJson(filePath, gate) {
  let bytes;
  try {
    bytes = await readFile(filePath);
  } catch (error) {
    throw new GateError("AUTHORITY_BLOCKED", gate, `Required JSON is unavailable: ${error.message}`);
  }

  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch (error) {
    throw new GateError("AUTHORITY_BLOCKED", gate, `Required JSON is invalid: ${error.message}`);
  }
}

async function writeExclusive(filePath, bytes) {
  await writeFile(filePath, bytes, { flag: "wx" });
}

async function writeJsonExclusive(filePath, value) {
  const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
  await writeExclusive(filePath, bytes);
  return {
    path: path.relative(REPOSITORY_ROOT, filePath).split(path.sep).join("/"),
    bytes: bytes.length,
    sha256: sha256(bytes),
  };
}

async function appendLedger(event, details = {}) {
  const record = Buffer.from(
    `${JSON.stringify({ timestamp: utcNow(), invocationId: INVOCATION_ID, event, ...details })}\n`,
    "utf8",
  );
  await appendFile(path.join(EXECUTION_ROOT, "invocation-ledger.jsonl"), record);
}

async function invocationBoundaryWasCrossed() {
  try {
    const bytes = await readFile(path.join(EXECUTION_ROOT, "invocation-ledger.jsonl"));
    return bytes.includes(Buffer.from('"event":"INVOCATION_START_BOUNDARY_CROSSED"', "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function readLocalGit(args) {
  // Read-only local plumbing: no shell, replacement objects, injected Git config,
  // optional locks, prompts, or lazy fetching from a promisor remote.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.toUpperCase().startsWith("GIT_")),
  );
  Object.assign(env, { GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0" });
  const { stdout } = await execFileAsync(
    "git",
    ["--no-replace-objects", "--no-optional-locks", "-c", "protocol.allow=never", ...args],
    { cwd: REPOSITORY_ROOT, env, encoding: "utf8", timeout: 10000, maxBuffer: 1024 * 1024, windowsHide: true },
  );
  return stdout.trim();
}

async function validateAuthorityAnchor() {
  try {
    // Legacy grafts and shallow history cannot establish the required real lineage.
    const graftPath = await readLocalGit(["rev-parse", "--git-path", "info/grafts"]);
    try {
      await lstat(path.resolve(REPOSITORY_ROOT, graftPath));
      throw new GateError("AUTHORITY_BLOCKED", "AUTHORITY_ANCHOR", "Git grafts are prohibited");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if ((await readLocalGit(["rev-parse", "--is-shallow-repository"])) !== "false") {
      throw new GateError("AUTHORITY_BLOCKED", "AUTHORITY_ANCHOR", "Complete local history is required");
    }
    const currentHead = await readLocalGit(["rev-parse", "--verify", "HEAD^{commit}"]);
    if (!/^[0-9a-f]{40}$/u.test(currentHead) || !/^[0-9a-f]{40}$/u.test(AUTHORITY_ANCHOR)) {
      throw new GateError("AUTHORITY_BLOCKED", "AUTHORITY_ANCHOR", "Invalid commit identity");
    }
    // Exit 0 means the Anchor is an ancestor (including itself, per Contract §8).
    // Non-ancestor, missing objects, timeout, and Git failure all block authority.
    await readLocalGit(["merge-base", "--is-ancestor", AUTHORITY_ANCHOR, currentHead]);
    return currentHead;
  } catch (error) {
    if (error instanceof GateError) throw error;
    throw new GateError("AUTHORITY_BLOCKED", "AUTHORITY_ANCHOR", "Local Anchor ancestry could not be established");
  }
}

function decodeSnapshotBase64(value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Missing signed Snapshot data");
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.toString("base64") !== value) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Non-canonical Snapshot base64");
  }
  return bytes;
}

async function readSnapshotFile(filePath) {
  const info = await lstat(filePath);
  if (!info.isFile() || info.isSymbolicLink() || (await realpath(filePath)) !== filePath) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Snapshot path is not a canonical regular file");
  }
  return readFile(filePath);
}

// Signed governance-record entry point. Envelope: { payload, signature }, both
// canonical base64; Ed25519 signs the exact payload bytes, not reserialized JSON.
// Payload: { recordType: "EXECUTION_SNAPSHOT_BINDING", status:
// "OWNER_APPROVED_AND_FROZEN", contractId, authorityAnchor, invocationId, files }.
// files contains exactly the five roles below, each with path, bytes and sha256.
// The signed payload's SHA-256 is its immutable content reference. Signing occurs
// AFTER Runner/Identities/Manifest freeze; no final hash is backfilled into Runner.
// The approved launcher must independently authenticate this Runner and retain
// the approved Binding reference; a program cannot authenticate its own verifier.
async function validateExecutionSnapshot() {
  try {
    if (typeof SNAPSHOT_OWNER_PUBLIC_KEY_PEM !== "string" || !SNAPSHOT_OWNER_PUBLIC_KEY_PEM) {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Owner-approved Snapshot public key is not configured");
    }
    const key = createPublicKey(SNAPSHOT_OWNER_PUBLIC_KEY_PEM);
    if (key.asymmetricKeyType !== "ed25519") {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Snapshot key must be Ed25519");
    }
    if (sha256(key.export({ format: "der", type: "spki" })) !== SNAPSHOT_OWNER_PUBLIC_KEY_DER_SHA256) {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Snapshot public key fingerprint mismatch");
    }
    const envelope = JSON.parse((await readSnapshotFile(SNAPSHOT_BINDING_PATH)).toString("utf8"));
    const payload = decodeSnapshotBase64(envelope?.payload);
    const signature = decodeSnapshotBase64(envelope?.signature);
    if (signature.length !== 64 || !verifySignature(null, payload, key, signature)) {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Snapshot Owner signature mismatch");
    }
    const binding = JSON.parse(payload.toString("utf8"));
    const expectedPaths = {
      RUNNER: RUNNER_PATH,
      RUNNER_IDENTITY: RUNNER_IDENTITY_PATH,
      EXECUTION_ROOT_IDENTITY: EXECUTION_ROOT_IDENTITY_PATH,
      INVOCATION_IDENTITY: INVOCATION_IDENTITY_PATH,
      FROZEN_INPUT_MANIFEST: MANIFEST_PATH,
    };
    if (
      binding?.recordType !== "EXECUTION_SNAPSHOT_BINDING" ||
      binding.status !== "OWNER_APPROVED_AND_FROZEN" ||
      binding.contractId !== SNAPSHOT_CONTRACT_ID ||
      binding.authorityAnchor !== AUTHORITY_ANCHOR ||
      binding.invocationId !== INVOCATION_ID ||
      !isDeepStrictEqual(Object.keys(binding.files ?? {}).sort(), Object.keys(expectedPaths).sort())
    ) {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Snapshot authorization or component set mismatch");
    }
    const files = {};
    for (const [role, filePath] of Object.entries(expectedPaths)) {
      const entry = binding.files[role];
      const relativePath = path.relative(REPOSITORY_ROOT, filePath).split(path.sep).join("/");
      if (
        entry?.path !== relativePath || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0 ||
        typeof entry.sha256 !== "string" || !/^[0-9A-F]{64}$/u.test(entry.sha256)
      ) {
        throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", `Malformed Snapshot component: ${role}`);
      }
      const content = await readSnapshotFile(filePath);
      if (content.length !== entry.bytes || sha256(content) !== entry.sha256) {
        throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", `Snapshot bytes mismatch: ${role}`);
      }
      const value = role === "RUNNER" ? null : JSON.parse(content.toString("utf8"));
      if (role !== "RUNNER" && (value === null || typeof value !== "object" || Array.isArray(value))) {
        throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", `Invalid Snapshot JSON object: ${role}`);
      }
      files[role] = { ...entry, content, value };
    }
    const runnerIdentity = files.RUNNER_IDENTITY.value;
    if (
      runnerIdentity.recordType !== "FROZEN_RUNNER_IDENTITY" || runnerIdentity.status !== "FROZEN" ||
      runnerIdentity.version !== RUNNER_VERSION || runnerIdentity.path !== files.RUNNER.path ||
      runnerIdentity.bytes !== files.RUNNER.bytes || runnerIdentity.sha256 !== files.RUNNER.sha256
    ) {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Runner Identity does not describe the signed Runner");
    }
    for (const role of ["RUNNER_IDENTITY", "EXECUTION_ROOT_IDENTITY", "INVOCATION_IDENTITY"]) {
      if (files[role].value.authorityHead !== AUTHORITY_ANCHOR || files[role].value.invocationId !== INVOCATION_ID) {
        throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", `Snapshot Identity authority mismatch: ${role}`);
      }
    }
    return { reference: `sha256:${sha256(payload)}`, files };
  } catch (error) {
    if (error instanceof GateError) throw error;
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", "Snapshot Binding is unavailable or invalid");
  }
}

async function verifyFrozenFileIdentity(entry) {
  if (
    entry === null ||
    typeof entry !== "object" ||
    typeof entry.path !== "string" ||
    !Number.isSafeInteger(entry.bytes) ||
    entry.bytes < 0 ||
    !/^[0-9A-F]{64}$/u.test(entry.sha256)
  ) {
    throw new GateError("AUTHORITY_BLOCKED", "INPUT_MANIFEST", "Malformed frozen file identity");
  }

  const absolutePath = resolveRepositoryPath(entry.path);
  const fileInfo = await lstat(absolutePath);
  if (!fileInfo.isFile() || fileInfo.isSymbolicLink()) {
    throw new GateError("INPUT_MISMATCH", "INPUT_MANIFEST", `Frozen input is not a regular file: ${entry.path}`);
  }

  const bytes = await readFile(absolutePath);
  if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) {
    throw new GateError("INPUT_MISMATCH", "INPUT_MANIFEST", `Frozen input identity mismatch: ${entry.path}`);
  }

  return { ...entry, absolutePath, content: bytes };
}

async function verifyExecutionRoot(rootIdentity) {
  const expectedRelative = path.relative(REPOSITORY_ROOT, EXECUTION_ROOT).split(path.sep).join("/");
  if (
    rootIdentity.identityStatus !== "FROZEN" ||
    rootIdentity.repositoryRelativePath !== expectedRelative ||
    rootIdentity.canonicalPath !== EXECUTION_ROOT ||
    rootIdentity.existenceState !== "CREATED_EMPTY" ||
    rootIdentity.symlinkState !== "NO" ||
    rootIdentity.junctionState !== "NO" ||
    rootIdentity.reparseState !== "NO" ||
    rootIdentity.traversalState !== "NO_TRAVERSAL_COMPONENTS"
  ) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_ROOT", "Execution Root identity is not frozen as required");
  }

  const rootStat = await lstat(EXECUTION_ROOT);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_ROOT", "Execution Root is not a regular directory");
  }
  if ((await realpath(EXECUTION_ROOT)) !== EXECUTION_ROOT) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_ROOT", "Execution Root canonical path mismatch");
  }
  if ((await readdir(EXECUTION_ROOT)).length !== 0) {
    throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_ROOT", "Execution Root must be empty before Invocation start");
  }
}

async function verifyInvocationIdentity(invocation) {
  const expected = {
    recordType: "FROZEN_INVOCATION_IDENTITY",
    model: "SINGLE_INVOCATION",
    invocationId: INVOCATION_ID,
    state: "NOT_STARTED",
    consumed: false,
    startBoundary: "NOT_CROSSED",
    retry: 0,
    resume: 0,
    reuse: "PROHIBITED",
    secondInvocation: 0,
    executionAuthority: "YES",
    authorityHead: AUTHORITY_HEAD,
  };
  if (!isDeepStrictEqual(invocation, expected)) {
    throw new GateError("AUTHORITY_BLOCKED", "INVOCATION_IDENTITY", "Invocation identity mismatch");
  }
}

async function runPreflight() {
  const expectedArguments = [
    "--execute",
    "--invocation-id",
    INVOCATION_ID,
    "--authority-head",
    AUTHORITY_HEAD,
  ];
  if (!isDeepStrictEqual(process.argv.slice(2), expectedArguments)) {
    throw new GateError("AUTHORITY_BLOCKED", "INVOCATION_ARGUMENTS", "Exact frozen invocation arguments are required");
  }

  if ((await realpath(RUNNER_PATH)) !== RUNNER_PATH) {
    throw new GateError("AUTHORITY_BLOCKED", "RUNNER_IDENTITY", "Runner path is not canonical");
  }
  const currentHead = await validateAuthorityAnchor();
  const snapshot = await validateExecutionSnapshot();
  // Parse only the exact Manifest bytes authenticated by the external trust root.
  const manifestBytes = snapshot.files.FROZEN_INPUT_MANIFEST.content;
  const manifest = snapshot.files.FROZEN_INPUT_MANIFEST.value;
  if (
    manifest.recordType !== "FROZEN_INPUT_MANIFEST" ||
    manifest.status !== "FROZEN" ||
    manifest.authorityHead !== AUTHORITY_HEAD ||
    manifest.activationDecisionId !== ACTIVATION_DECISION_ID ||
    manifest.runner?.version !== RUNNER_VERSION ||
    manifest.invocation?.invocationId !== INVOCATION_ID
  ) {
    throw new GateError("AUTHORITY_BLOCKED", "INPUT_MANIFEST", "Frozen Input Manifest header mismatch");
  }

  if (!Array.isArray(manifest.inputs) || manifest.inputs.length === 0) {
    throw new GateError("AUTHORITY_BLOCKED", "INPUT_MANIFEST", "Frozen Input Manifest has no inputs");
  }

  for (const role of ["RUNNER", "RUNNER_IDENTITY", "EXECUTION_ROOT_IDENTITY", "INVOCATION_IDENTITY"]) {
    const frozen = snapshot.files[role];
    const matches = manifest.inputs.filter((entry) => entry?.role === role);
    if (matches.length !== 1 || matches[0].path !== frozen.path ||
        matches[0].bytes !== frozen.bytes || matches[0].sha256 !== frozen.sha256) {
      throw new GateError("AUTHORITY_BLOCKED", "EXECUTION_SNAPSHOT", `Manifest does not match Snapshot: ${role}`);
    }
  }

  const resolvedInputs = [];
  for (const entry of manifest.inputs) {
    resolvedInputs.push(await verifyFrozenFileIdentity(entry));
  }

  const runnerInput = resolvedInputs.find((entry) => entry.role === "RUNNER");
  if (!runnerInput || runnerInput.absolutePath !== RUNNER_PATH) {
    throw new GateError("AUTHORITY_BLOCKED", "RUNNER_IDENTITY", "Runner is not bound by the Frozen Input Manifest");
  }

  const rootIdentity = snapshot.files.EXECUTION_ROOT_IDENTITY.value;
  await verifyExecutionRoot(rootIdentity);

  const invocationIdentity = snapshot.files.INVOCATION_IDENTITY.value;
  await verifyInvocationIdentity(invocationIdentity);

  const budget = manifest.budget;
  const expectedBudget = {
    invocation: 1,
    metadataRequest: 1,
    tarballRequest: 1,
    candidate: 1,
    retry: 0,
    resume: 0,
    reuse: 0,
    currentConsumed: 0,
  };
  if (!isDeepStrictEqual(budget, expectedBudget)) {
    throw new GateError("AUTHORITY_BLOCKED", "BUDGET", "Budget identity mismatch");
  }

  return {
    currentHead,
    snapshotReference: snapshot.reference,
    manifest,
    manifestBytes,
    manifestSha256: sha256(manifestBytes),
    resolvedInputs,
  };
}

function requestOfficialBytes(urlString, maximumBytes, evidenceType) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:" || parsed.hostname !== "registry.npmjs.org") {
      reject(new GateError("INPUT_MISMATCH", "NETWORK", `Non-official ${evidenceType} URL`));
      return;
    }

    const requestedAt = utcNow();
    const request = https.get(
      parsed,
      {
        headers: {
          Accept: evidenceType === "metadata" ? "application/json" : "application/octet-stream",
          "Accept-Encoding": "identity",
          "User-Agent": `${RUNNER_VERSION} (${INVOCATION_ID})`,
        },
        agent: false,
      },
      (response) => {
        const chunks = [];
        let total = 0;
        response.on("data", (chunk) => {
          total += chunk.length;
          if (total > maximumBytes) {
            request.destroy(new GateError("INCONCLUSIVE", "NETWORK", `${evidenceType} response exceeds byte limit`));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          const body = Buffer.concat(chunks);
          resolve({
            requestedUrl: urlString,
            requestedAt,
            receivedAt: utcNow(),
            statusCode: response.statusCode,
            headers: response.headers,
            body,
            remoteAddress: response.socket?.remoteAddress ?? null,
            tlsProtocol: response.socket?.getProtocol?.() ?? null,
            authorizedTls: response.socket?.authorized ?? false,
          });
        });
      },
    );
    request.setTimeout(30000, () => {
      request.destroy(new GateError("INCONCLUSIVE", "NETWORK", `${evidenceType} request timed out`));
    });
    request.on("error", (error) => {
      reject(error instanceof GateError ? error : new GateError("INCONCLUSIVE", "NETWORK", error.message));
    });
  });
}

function requireSuccessfulResponse(response, evidenceType) {
  if (response.statusCode !== 200) {
    throw new GateError("INCONCLUSIVE", "NETWORK", `${evidenceType} status is ${response.statusCode}`);
  }
  if (response.headers.location !== undefined) {
    throw new GateError("INPUT_MISMATCH", "NETWORK", `${evidenceType} redirect is prohibited`);
  }
  if (response.headers["content-encoding"] !== undefined && response.headers["content-encoding"] !== "identity") {
    throw new GateError("INPUT_MISMATCH", "NETWORK", `${evidenceType} content encoding is not identity`);
  }
  if (!response.authorizedTls) {
    throw new GateError("INCONCLUSIVE", "NETWORK", `${evidenceType} TLS is not authorized`);
  }
}

function publicResponseEvidence(response) {
  return {
    requestedUrl: response.requestedUrl,
    requestedAt: response.requestedAt,
    receivedAt: response.receivedAt,
    statusCode: response.statusCode,
    headers: response.headers,
    bytes: response.body.length,
    sha256: sha256(response.body),
    remoteAddress: response.remoteAddress,
    tlsProtocol: response.tlsProtocol,
    authorizedTls: response.authorizedTls,
  };
}

function verifyMetadata(response) {
  requireSuccessfulResponse(response, "metadata");
  let metadata;
  try {
    metadata = JSON.parse(response.body.toString("utf8"));
  } catch (error) {
    throw new GateError("INPUT_MISMATCH", "METADATA", `Metadata JSON is invalid: ${error.message}`);
  }

  const integrity = metadata?.dist?.integrity;
  const shasum = metadata?.dist?.shasum;
  const tarball = metadata?.dist?.tarball;
  if (
    metadata?.name !== PACKAGE_NAME ||
    metadata?.version !== PACKAGE_VERSION ||
    typeof integrity !== "string" ||
    !/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(integrity) ||
    typeof shasum !== "string" ||
    !/^[0-9a-f]{40}$/u.test(shasum) ||
    tarball !== EXPECTED_TARBALL_URL
  ) {
    throw new GateError("INPUT_MISMATCH", "METADATA", "Official metadata identity mismatch");
  }

  return { metadata, integrity, shasum, tarball };
}

function verifyTarball(response, metadataIdentity) {
  requireSuccessfulResponse(response, "tarball");
  const computedIntegrity = sha512Sri(response.body);
  const computedShasum = sha1(response.body);
  if (computedIntegrity !== metadataIdentity.integrity || computedShasum !== metadataIdentity.shasum) {
    throw new GateError("INPUT_MISMATCH", "TARBALL", "Tarball bytes do not match official metadata hashes");
  }
  return {
    sha1: computedShasum,
    sha256: sha256(response.body),
    sha512: sha512(response.body),
    integrity: computedIntegrity,
  };
}

function deriveCandidate(sourceBytes, verifiedIntegrity) {
  let sourceJson;
  try {
    sourceJson = JSON.parse(sourceBytes.toString("utf8"));
  } catch (error) {
    throw new GateError("INPUT_MISMATCH", "CANDIDATE", `Source lockfile JSON is invalid: ${error.message}`);
  }

  const packageEntry = sourceJson?.packages?.[PACKAGE_LOCK_PATH];
  if (
    packageEntry?.version !== PACKAGE_VERSION ||
    packageEntry?.resolved !== EXPECTED_TARBALL_URL ||
    typeof packageEntry?.integrity !== "string"
  ) {
    throw new GateError("INPUT_MISMATCH", "CANDIDATE", "Source lockfile package identity mismatch");
  }

  const oldIntegrityBytes = Buffer.from(packageEntry.integrity, "utf8");
  const newIntegrityBytes = Buffer.from(verifiedIntegrity, "utf8");
  if (oldIntegrityBytes.length !== newIntegrityBytes.length) {
    throw new GateError("INPUT_MISMATCH", "CANDIDATE", "Integrity replacement changes byte length");
  }

  const firstOffset = sourceBytes.indexOf(oldIntegrityBytes);
  const secondOffset = firstOffset < 0 ? -1 : sourceBytes.indexOf(oldIntegrityBytes, firstOffset + 1);
  if (firstOffset < 0 || secondOffset >= 0) {
    throw new GateError("INPUT_MISMATCH", "CANDIDATE", "Source integrity occurrence count is not exactly one");
  }

  const candidate = Buffer.from(sourceBytes);
  newIntegrityBytes.copy(candidate, firstOffset);
  const candidateJson = JSON.parse(candidate.toString("utf8"));
  const expectedJson = structuredClone(sourceJson);
  expectedJson.packages[PACKAGE_LOCK_PATH].integrity = verifiedIntegrity;
  if (!isDeepStrictEqual(candidateJson, expectedJson)) {
    throw new GateError("INPUT_MISMATCH", "CANDIDATE", "Candidate semantic diff exceeds verified integrity field");
  }

  const byteDiffs = [];
  for (let index = 0; index < sourceBytes.length; index += 1) {
    if (sourceBytes[index] !== candidate[index]) {
      byteDiffs.push({ offset: index, sourceByte: sourceBytes[index], candidateByte: candidate[index] });
    }
  }

  return {
    candidate,
    oldIntegrity: packageEntry.integrity,
    newIntegrity: verifiedIntegrity,
    replacementOffset: firstOffset,
    byteDiffs,
  };
}

async function executeInvocation(preflight) {
  const ledgerPath = path.join(EXECUTION_ROOT, "invocation-ledger.jsonl");
  const ledgerHandle = await open(ledgerPath, "wx");
  await ledgerHandle.writeFile(
    `${JSON.stringify({
      timestamp: utcNow(),
      invocationId: INVOCATION_ID,
      event: "INVOCATION_START_BOUNDARY_CROSSED",
      authorityHead: AUTHORITY_HEAD,
      runnerVersion: RUNNER_VERSION,
    })}\n`,
    "utf8",
  );
  await ledgerHandle.close();

  await writeJsonExclusive(path.join(EXECUTION_ROOT, "authority-evidence.json"), {
    recordType: "AUTHORITY_EVIDENCE",
    activationDecisionId: ACTIVATION_DECISION_ID,
    authorityHead: AUTHORITY_HEAD,
    invocationId: INVOCATION_ID,
    runnerVersion: RUNNER_VERSION,
    executionAuthority: "YES",
    verificationExecutedBeforeInvocation: "NO",
    p0s7Allowed: "NO",
  });
  await writeJsonExclusive(path.join(EXECUTION_ROOT, "input-manifest-evidence.json"), {
    recordType: "INPUT_MANIFEST_EVIDENCE",
    path: path.relative(REPOSITORY_ROOT, MANIFEST_PATH).split(path.sep).join("/"),
    bytes: preflight.manifestBytes.length,
    sha256: preflight.manifestSha256,
    inputCount: preflight.resolvedInputs.length,
    result: "PASS",
  });

  await appendLedger("METADATA_REQUEST_STARTED", { request: 1, maximum: 1, url: METADATA_URL });
  const metadataResponse = await requestOfficialBytes(METADATA_URL, MAX_METADATA_BYTES, "metadata");
  await writeExclusive(path.join(EXECUTION_ROOT, "registry-metadata.raw.json"), metadataResponse.body);
  const metadataIdentity = verifyMetadata(metadataResponse);
  await writeJsonExclusive(path.join(EXECUTION_ROOT, "metadata-evidence.json"), {
    recordType: "METADATA_EVIDENCE",
    response: publicResponseEvidence(metadataResponse),
    identity: {
      name: metadataIdentity.metadata.name,
      version: metadataIdentity.metadata.version,
      integrity: metadataIdentity.integrity,
      shasum: metadataIdentity.shasum,
      tarball: metadataIdentity.tarball,
    },
    result: "PASS",
  });
  await appendLedger("METADATA_IDENTITY_VERIFIED", { result: "PASS" });

  await appendLedger("TARBALL_REQUEST_STARTED", {
    request: 1,
    maximum: 1,
    url: metadataIdentity.tarball,
  });
  const tarballResponse = await requestOfficialBytes(metadataIdentity.tarball, MAX_TARBALL_BYTES, "tarball");
  await writeExclusive(path.join(EXECUTION_ROOT, "env-paths-2.2.1.tgz"), tarballResponse.body);
  const tarballIdentity = verifyTarball(tarballResponse, metadataIdentity);
  await writeJsonExclusive(path.join(EXECUTION_ROOT, "tarball-evidence.json"), {
    recordType: "TARBALL_EVIDENCE",
    response: publicResponseEvidence(tarballResponse),
    identity: tarballIdentity,
    result: "PASS",
  });
  await writeJsonExclusive(path.join(EXECUTION_ROOT, "network-evidence.json"), {
    recordType: "NETWORK_EVIDENCE",
    boundary: "OFFICIAL_NPM_REGISTRY_ONLY",
    metadataRequestCount: 1,
    tarballRequestCount: 1,
    retryCount: 0,
    metadata: publicResponseEvidence(metadataResponse),
    tarball: publicResponseEvidence(tarballResponse),
    result: "PASS",
  });
  await appendLedger("TARBALL_IDENTITY_VERIFIED", { result: "PASS" });

  const sourceEntry = preflight.resolvedInputs.find((entry) => entry.role === "SOURCE_LOCKFILE");
  if (!sourceEntry) {
    throw new GateError("AUTHORITY_BLOCKED", "CANDIDATE", "Source lockfile is absent from manifest");
  }
  const derivation = deriveCandidate(sourceEntry.content, metadataIdentity.integrity);
  const candidatePath = path.join(EXECUTION_ROOT, "package-lock.corrected.candidate.json");
  await writeExclusive(candidatePath, derivation.candidate);
  await writeJsonExclusive(path.join(EXECUTION_ROOT, "candidate-evidence.json"), {
    recordType: "CANDIDATE_EVIDENCE",
    source: {
      path: sourceEntry.path,
      bytes: sourceEntry.content.length,
      sha256: sha256(sourceEntry.content),
      sha512: sha512(sourceEntry.content),
    },
    candidate: {
      path: path.relative(REPOSITORY_ROOT, candidatePath).split(path.sep).join("/"),
      bytes: derivation.candidate.length,
      sha256: sha256(derivation.candidate),
      sha512: sha512(derivation.candidate),
    },
    semanticDiff: ["/packages/node_modules~1env-paths/integrity"],
    replacementOffset: derivation.replacementOffset,
    oldIntegrity: derivation.oldIntegrity,
    newIntegrity: derivation.newIntegrity,
    byteDiffs: derivation.byteDiffs,
    result: "PASS",
  });
  await appendLedger("CANDIDATE_DERIVED", { result: "PASS", candidateCount: 1 });

  await writeJsonExclusive(path.join(EXECUTION_ROOT, "classification.json"), {
    recordType: "TERMINAL_CLASSIFICATION",
    invocationId: INVOCATION_ID,
    classification: "PASS",
    verificationExecuted: "YES",
    p0s7Allowed: "NO",
  });
  await writeJsonExclusive(path.join(EXECUTION_ROOT, "final-summary.json"), {
    recordType: "FINAL_SUMMARY",
    invocationId: INVOCATION_ID,
    runnerVersion: RUNNER_VERSION,
    classification: "PASS",
    metadataRequestCount: 1,
    tarballRequestCount: 1,
    candidateCount: 1,
    retryCount: 0,
    sourceLockfileModified: false,
    dependencyPreparationAuthorized: false,
    runtimeAuthorized: false,
    p0s7Allowed: false,
  });
  await appendLedger("INVOCATION_FINALIZED", { classification: "PASS" });
  return "PASS";
}

async function finalizeFailure(error, invocationStarted) {
  const classification =
    error instanceof GateError && ALLOWED_CLASSIFICATIONS.has(error.classification)
      ? error.classification
      : "INCONCLUSIVE";
  const gate = error instanceof GateError ? error.gate : "UNHANDLED";
  const message = error instanceof Error ? error.message : String(error);

  if (invocationStarted) {
    try {
      await appendLedger("INVOCATION_STOPPED", { classification, gate, message });
      await writeJsonExclusive(path.join(EXECUTION_ROOT, "classification.json"), {
        recordType: "TERMINAL_CLASSIFICATION",
        invocationId: INVOCATION_ID,
        classification,
        gate,
        message,
        verificationExecuted: "YES",
        p0s7Allowed: "NO",
      });
      await writeJsonExclusive(path.join(EXECUTION_ROOT, "final-summary.json"), {
        recordType: "FINAL_SUMMARY",
        invocationId: INVOCATION_ID,
        runnerVersion: RUNNER_VERSION,
        classification,
        gate,
        message,
        retryCount: 0,
        sourceLockfileModified: false,
        dependencyPreparationAuthorized: false,
        runtimeAuthorized: false,
        p0s7Allowed: false,
      });
    } catch (evidenceError) {
      process.stderr.write(
        `${JSON.stringify({ classification: "INCONCLUSIVE", gate: "EVIDENCE", message: evidenceError.message })}\n`,
      );
      return "INCONCLUSIVE";
    }
  }

  process.stderr.write(`${JSON.stringify({ classification, gate, message, invocationStarted })}\n`);
  return classification;
}

async function main() {
  let invocationStarted = false;
  try {
    const preflight = await runPreflight();
    const classification = await executeInvocation(preflight);
    process.stdout.write(`${classification}\n`);
    process.exitCode = classification === "PASS" ? 0 : 2;
  } catch (error) {
    invocationStarted = await invocationBoundaryWasCrossed();
    const classification = await finalizeFailure(error, invocationStarted);
    process.exitCode = classification === "PASS" ? 0 : 2;
  }
}

await main();
