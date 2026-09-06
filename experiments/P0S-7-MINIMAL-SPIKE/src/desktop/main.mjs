// NOT_PRODUCTION — explicit Desktop factory; import does not load Electron or connect IPC.
import { fileURLToPath } from "node:url";
import {
  assertCapability, assertContentRef, assertKnownDecision, assertPlainRecord,
} from "../control/contracts.mjs";
import { publicRejection, reject } from "../control/phase-a-policy.mjs";

const READINESS_CHANNEL = "shaco-spike:get-readiness";
const REQUEST_CHANNEL = "shaco-spike:request-sum3";
const RENDERER_URL = new URL("./index.html", import.meta.url).href;

export function desktopWindowOptions() {
  return Object.freeze({
    title: "Shaco Forge — Control Integration Candidate",
    width: 720,
    height: 480,
    show: false,
    webPreferences: Object.freeze({
      preload: fileURLToPath(new URL("./preload.cjs", import.meta.url)),
      partition: "shaco-spike-ed-c01",
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
      devTools: false,
    }),
  });
}

function assertMainFrameSender(event, window) {
  if (window.isDestroyed() || event.sender !== window.webContents
    || event.senderFrame !== window.webContents.mainFrame
    || event.senderFrame?.url !== RENDERER_URL) {
    reject("MESSAGE_REJECTED", "RENDERER_SENDER");
  }
}

function validateLaunchContext(context) {
  assertPlainRecord(context, [
    "authorizationContext", "endpoint", "endpointPolicyRef", "localIdentity",
    "expectedBrokerIdentity", "session", "taskInputRef", "timeoutMs",
  ], [], "DESKTOP_LAUNCH_CONTEXT");
  assertContentRef(context.taskInputRef, "DESKTOP_TASK_INPUT_REF");
  if (!Number.isSafeInteger(context.timeoutMs) || context.timeoutMs < 1 || context.timeoutMs > 30_000) {
    reject("UNBOUNDED_OR_INVALID_TIMEOUT", "DESKTOP_TIMEOUT");
  }
  return context;
}

export function createDesktopMain({ electronLoader, ipcClientFactory, launchGuard } = {}) {
  assertCapability(electronLoader, "SELECTED_ELECTRON_LOADER", ["load"]);
  assertCapability(ipcClientFactory, "DESKTOP_IPC_CLIENT_FACTORY", ["createClient"]);
  assertCapability(launchGuard, "DESKTOP_LAUNCH_GUARD", ["verify"]);
  let started = false;

  return Object.freeze({
    async start(rawContext) {
      if (started) reject("DUPLICATE_REQUEST", "DESKTOP_START");
      started = true;
      const context = validateLaunchContext(rawContext);
      const launchDecision = assertKnownDecision(
        await launchGuard.verify(context.authorizationContext), "DESKTOP_LAUNCH_GUARD",
      );
      const client = ipcClientFactory.createClient({
        endpoint: context.endpoint,
        endpointPolicyRef: context.endpointPolicyRef,
        localIdentity: context.localIdentity,
        expectedBrokerIdentity: context.expectedBrokerIdentity,
        session: context.session,
      });
      const authenticated = await client.connect({ timeoutMs: context.timeoutMs });
      if (authenticated?.status !== "AUTHENTICATED") {
        reject("AUTHENTICATION_BLOCKED", "DESKTOP_IPC_CONNECT");
      }

      const electron = await electronLoader.load({
        authorizationProofRef: launchDecision.proofRef,
      });
      const { app, BrowserWindow, ipcMain, session } = electron ?? {};
      if (!app || typeof BrowserWindow !== "function" || !ipcMain || !session) {
        reject("ELECTRON_RUNTIME_MISMATCH", "DESKTOP_START");
      }
      await app.whenReady();
      const desktopSession = session.fromPartition("shaco-spike-ed-c01");
      desktopSession.setPermissionCheckHandler(() => false);
      desktopSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
      desktopSession.on("will-download", event => event.preventDefault());
      const allowedResources = new Set([
        RENDERER_URL,
        new URL("./renderer.js", import.meta.url).href,
        new URL("./renderer.css", import.meta.url).href,
      ]);
      desktopSession.webRequest.onBeforeRequest((details, callback) => {
        callback({ cancel: !allowedResources.has(details.url) });
      });

      const window = new BrowserWindow(desktopWindowOptions());
      // Main owns visibility after the guarded start and initial renderer paint.
      // Showing the window never submits a task; the operator owns the single click.
      window.once("ready-to-show", () => {
        if (!window.isDestroyed()) window.show();
      });
      window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      window.webContents.on("will-navigate", event => event.preventDefault());
      window.webContents.on("will-attach-webview", event => event.preventDefault());
      let requestUsed = false;

      ipcMain.handle(READINESS_CHANNEL, event => {
        try {
          assertMainFrameSender(event, window);
          return Object.freeze({ ready: true, task: "SUM3", requestLimit: 1 });
        } catch (error) {
          return publicRejection(error);
        }
      });
      ipcMain.handle(REQUEST_CHANNEL, async event => {
        // Renderer forwards one explicit operator click; Main owns the REQUEST send/latch.
        try {
          assertMainFrameSender(event, window);
          if (requestUsed) reject("DUPLICATE_REQUEST", "DESKTOP_SUM3_REQUEST");
          requestUsed = true;
          await client.send("REQUEST", "WORKER", {
            operation: "SUM3",
            values: [2, 3, 5],
            taskInputRef: context.taskInputRef,
          });
          const accepted = await client.receive({
            expectedTypes: ["TASK_ACCEPTED", "REJECT", "ERROR"],
            timeoutMs: context.timeoutMs,
          });
          if (accepted.type !== "TASK_ACCEPTED") reject("MESSAGE_REJECTED", "TASK_ACCEPTED");
          const result = await client.receive({
            expectedTypes: ["RESULT", "REJECT", "ERROR"],
            timeoutMs: context.timeoutMs,
          });
          if (result.type !== "RESULT") reject("MESSAGE_REJECTED", "TASK_RESULT");
          return Object.freeze({
            accepted: true,
            correlationId: result.correlationId,
            result: result.payload,
          });
        } catch (error) {
          return publicRejection(error);
        }
      });
      window.once("closed", () => {
        ipcMain.removeHandler(READINESS_CHANNEL);
        ipcMain.removeHandler(REQUEST_CHANNEL);
        void client.close("DESKTOP_CLOSED");
      });
      // Desktop teardown never starts, stops, restarts, or owns the Worker.
      await window.loadFile(fileURLToPath(new URL("./index.html", import.meta.url)));
      return window;
    },
  });
}
