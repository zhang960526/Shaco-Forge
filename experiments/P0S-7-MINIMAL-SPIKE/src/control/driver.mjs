// NOT_PRODUCTION — ED-C01 one-shot control flow; no operation occurs at import.
import { assertCapability, assertPlainRecord } from "./contracts.mjs";
import { compareEdC01Result } from "./sum3-oracle.mjs";
import { reject } from "./phase-a-policy.mjs";

export const ED_C01_DRIVER_STATES = Object.freeze([
  "CREATED", "PREFLIGHT", "SLOT_CONSUMED", "WORKER_STARTING", "WORKER_READY",
  "DESKTOP_STARTING", "AWAITING_TASK_ACCEPTED", "AWAITING_RELEASE",
  "EXECUTION_RELEASED", "RESULT_DURABLE", "DESKTOP_CLOSING", "WORKER_STOPPING",
  "FINALIZING", "COMPLETED", "FAILED_CONTAINED", "FAILED_UNKNOWN",
]);

export const STARTUP_ORDER = "WORKER_THEN_DESKTOP";

function validateRunContext(context) {
  assertPlainRecord(context, [
    "caseId", "correlationId", "preflightContext", "workerLaunch", "desktopLaunch",
    "timeouts", "finalizationInput",
  ], [], "DRIVER_RUN_CONTEXT");
  assertPlainRecord(context.timeouts, [
    "workerReadyMs", "taskMs", "desktopCloseObservationMs", "gracefulStopMs",
    "containmentMs", "finalizationMs",
  ], [], "DRIVER_TIMEOUTS");
  const limits = {
    workerReadyMs: 30_000,
    taskMs: 5_000,
    desktopCloseObservationMs: 2_000,
    gracefulStopMs: 10_000,
    containmentMs: 5_000,
    finalizationMs: 30_000,
  };
  for (const [name, maximum] of Object.entries(limits)) {
    const value = context.timeouts[name];
    if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
      reject("UNBOUNDED_OR_INVALID_TIMEOUT", name);
    }
  }
  return context;
}

export function createEdC01Driver({
  preflight,
  evidence,
  runtimeControl,
  controlChannel,
  bootstrapDecision,
} = {}) {
  assertCapability(preflight, "PREFLIGHT", ["evaluate"]);
  assertCapability(evidence, "DRIVER_EVIDENCE", [
    "recordAndFlush", "recordFailureAndFlush", "finalize",
  ]);
  assertCapability(runtimeControl, "WINDOWS_RUNTIME_CONTROL", [
    "launchWorker", "launchDesktop", "requestDesktopClose",
    "observeDesktopClosedWorkerStable", "observeWorkerExit", "containOwnedResources",
  ]);
  assertCapability(controlChannel, "DRIVER_CONTROL_CHANNEL", [
    "awaitWorkerReady", "awaitTaskAccepted", "releaseOnce", "awaitResult",
    "stopOnce", "awaitStopAck",
  ]);
  if (!bootstrapDecision) reject("BOOTSTRAP_DECISION_MISSING", "DRIVER_CREATE");

  let state = "CREATED";
  // Independent of containment state: attempted launch does not prove startup completed.
  let launchStage = "NOT_ATTEMPTED";
  let runUsed = false;
  let releaseUsed = false;
  let stopUsed = false;
  let finalizationAttempted = false;
  let firstFailure = null;
  const resources = [];
  const terminalStates = new Map();

  function addResource(resource) {
    resources.push(resource);
    terminalStates.set(resource.resourceOwnershipRef, "UNKNOWN");
  }

  function finalizationResources() {
    return Object.freeze(resources.map(resource => Object.freeze({
      resourceOwnershipRef: resource.resourceOwnershipRef,
      terminalState: terminalStates.get(resource.resourceOwnershipRef) ?? "UNKNOWN",
    })));
  }

  async function persist(kind, facts) {
    const result = await evidence.recordAndFlush({ kind, state, facts, bootstrapDecision });
    if (result?.status !== "DURABLE" || typeof result.eventRef !== "string") {
      reject("EVIDENCE_NOT_DURABLE", kind);
    }
    return result;
  }

  async function contain(error, context) {
    if (firstFailure === null) firstFailure = error;
    try {
      await evidence.recordFailureAndFlush({
        error: firstFailure,
        state,
        caseId: context.caseId,
        correlationId: context.correlationId,
      });
    } catch {
      // The writer owns independent fallback handling. Never replace firstFailure.
    }
    try {
      const outcome = await runtimeControl.containOwnedResources({
        resources: Object.freeze([...resources]),
        timeoutMs: context.timeouts.containmentMs,
        firstFailure,
      });
      for (const resource of outcome?.resources ?? []) {
        if (terminalStates.has(resource.resourceOwnershipRef)) {
          terminalStates.set(resource.resourceOwnershipRef, resource.terminalState);
        }
      }
      state = outcome?.status === "CONTAINED" ? "FAILED_CONTAINED" : "FAILED_UNKNOWN";
    } catch {
      state = "FAILED_UNKNOWN";
    }
    if (!finalizationAttempted) {
      finalizationAttempted = true;
      try {
        await evidence.finalize({
          ...context.finalizationInput,
          driverState: state,
          launchStage,
          firstFailure,
          resources: finalizationResources(),
        });
      } catch {
        // No second finalization attempt; the original failure remains authoritative.
      }
    }
    throw firstFailure;
  }

  return Object.freeze({
    inspect() {
      return Object.freeze({ state, runUsed, releaseUsed, stopUsed, startupOrder: STARTUP_ORDER });
    },

    async run(rawContext) {
      if (runUsed) reject("DRIVER_RETRY_RESUME_REUSE_FORBIDDEN", "ED_C01_DRIVER");
      runUsed = true;
      const context = validateRunContext(rawContext);
      try {
        state = "PREFLIGHT";
        const preflightDecision = await preflight.evaluate(context.preflightContext);
        if (preflightDecision?.status !== "ALLOW") reject("PREFLIGHT_BLOCKED", "DRIVER_LAUNCH");
        state = "SLOT_CONSUMED";
        await persist("LAUNCH_INTENT", { preflightDecision });

        state = "WORKER_STARTING";
        launchStage = "STARTING";
        const worker = await runtimeControl.launchWorker({
          launch: context.workerLaunch,
          launchPermitRef: preflightDecision.launchPermitRef,
        });
        addResource(worker);
        await controlChannel.awaitWorkerReady({
          worker,
          correlationId: context.correlationId,
          timeoutMs: context.timeouts.workerReadyMs,
        });
        state = "WORKER_READY";
        await persist("WORKER_READY", { worker });

        state = "DESKTOP_STARTING";
        const desktop = await runtimeControl.launchDesktop({
          launch: context.desktopLaunch,
          launchPermitRef: preflightDecision.launchPermitRef,
          worker,
        });
        addResource(desktop);
        launchStage = "STARTED";
        await persist("DESKTOP_STARTED", { desktop, worker });

        state = "AWAITING_TASK_ACCEPTED";
        const accepted = await controlChannel.awaitTaskAccepted({
          correlationId: context.correlationId,
          timeoutMs: context.timeouts.taskMs,
        });
        state = "AWAITING_RELEASE";
        const intent = await persist("EXECUTION_INTENT", { accepted });
        if (releaseUsed) reject("DUPLICATE_RELEASE", "ED_C01_RELEASE");
        releaseUsed = true;
        await controlChannel.releaseOnce({
          correlationId: context.correlationId,
          executionIntentRef: intent.eventRef,
        });

        state = "EXECUTION_RELEASED";
        const result = await controlChannel.awaitResult({
          correlationId: context.correlationId,
          timeoutMs: context.timeouts.taskMs,
        });
        compareEdC01Result(result, context.correlationId);
        await persist("RESULT", { result });
        state = "RESULT_DURABLE";

        state = "DESKTOP_CLOSING";
        await runtimeControl.requestDesktopClose({ desktop });
        await runtimeControl.observeDesktopClosedWorkerStable({
          desktop,
          worker,
          observationMs: context.timeouts.desktopCloseObservationMs,
        });
        terminalStates.set(desktop.resourceOwnershipRef, "OS_EXIT_OBSERVED");
        await persist("DESKTOP_CLOSED_WORKER_STABLE", { desktop, worker });

        if (stopUsed) reject("DUPLICATE_STOP", "ED_C01_STOP");
        stopUsed = true;
        state = "WORKER_STOPPING";
        await controlChannel.stopOnce({ correlationId: context.correlationId, reason: "COMPLETED" });
        await controlChannel.awaitStopAck({
          correlationId: context.correlationId,
          timeoutMs: context.timeouts.gracefulStopMs,
        });
        const exit = await runtimeControl.observeWorkerExit({
          worker,
          timeoutMs: context.timeouts.gracefulStopMs,
        });
        if (exit?.status !== "OS_EXIT_OBSERVED") {
          reject("WORKER_EXIT_NOT_OBSERVED", "ED_C01_STOP");
        }
        terminalStates.set(worker.resourceOwnershipRef, "OS_EXIT_OBSERVED");
        await persist("WORKER_OS_EXIT", { worker, exit });

        state = "FINALIZING";
        finalizationAttempted = true;
        const finalization = await evidence.finalize({
          ...context.finalizationInput,
          driverState: "COMPLETED",
          launchStage,
          firstFailure: null,
          resources: finalizationResources(),
        });
        if (finalization?.evidenceStatus !== "FINALIZED") {
          reject("FINALIZATION_INCOMPLETE", "ED_C01_FINALIZATION");
        }
        state = "COMPLETED";
        return Object.freeze({ status: "COMPLETED", finalization });
      } catch (error) {
        return contain(error, context);
      }
    },
  });
}
