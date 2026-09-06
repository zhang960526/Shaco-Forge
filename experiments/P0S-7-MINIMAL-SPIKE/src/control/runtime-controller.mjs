// NOT_PRODUCTION — composes the selected Windows helper into Driver lifecycle actions.
import { assertCapability, assertPlainRecord, immutableCopy } from "./contracts.mjs";
import { reject } from "./phase-a-policy.mjs";

function validateResource(result, kind) {
  if (result?.status !== "LAUNCHED_IN_OWNED_JOB" || !result.identity
    || typeof result.resourceOwnershipRef !== "string") {
    reject("CONTROLLED_LAUNCH_NOT_ESTABLISHED", kind);
  }
  return Object.freeze({
    kind,
    identity: immutableCopy(result.identity),
    resourceOwnershipRef: result.resourceOwnershipRef,
  });
}

export function createRuntimeController({ windowsControl, desktopCloseController, observer } = {}) {
  assertCapability(windowsControl, "WINDOWS_CONTROL", [
    "launchControlled", "inspectProcess", "assertResourceOwnership", "observeExit", "boundedStop",
  ]);
  assertCapability(desktopCloseController, "DESKTOP_CLOSE_CONTROLLER", ["requestClose"]);
  assertCapability(observer, "BOUNDED_OBSERVER", ["waitForDesktopExit", "waitObservationWindow"]);
  let worker = null;
  let desktop = null;

  return Object.freeze({
    async launchWorker({ launch, launchPermitRef }) {
      if (worker !== null) reject("DUPLICATE_REQUEST", "WORKER_LAUNCH");
      worker = validateResource(await windowsControl.launchControlled({
        kind: "WORKER",
        launch,
        launchPermitRef,
        childProcessLimit: 0,
        externalNetwork: "FORBIDDEN",
      }), "WORKER");
      return worker;
    },

    async launchDesktop({ launch, launchPermitRef, worker: expectedWorker }) {
      if (worker === null || expectedWorker?.resourceOwnershipRef !== worker.resourceOwnershipRef) {
        reject("WORKER_NOT_READY_FOR_DESKTOP", "DESKTOP_LAUNCH");
      }
      if (desktop !== null) reject("DUPLICATE_REQUEST", "DESKTOP_LAUNCH");
      desktop = validateResource(await windowsControl.launchControlled({
        kind: "DESKTOP",
        launch,
        launchPermitRef,
        workerLifecycleAuthority: "NONE",
      }), "DESKTOP");
      return desktop;
    },

    async requestDesktopClose({ desktop: expectedDesktop }) {
      if (desktop === null
        || expectedDesktop?.resourceOwnershipRef !== desktop.resourceOwnershipRef) {
        reject("RESOURCE_OWNERSHIP_UNKNOWN", "DESKTOP_CLOSE");
      }
      await windowsControl.assertResourceOwnership(desktop);
      const result = await desktopCloseController.requestClose({ desktop });
      if (result?.status !== "CLOSE_REQUESTED") {
        reject("DESKTOP_CLOSE_NOT_REQUESTED", "DESKTOP_CLOSE");
      }
      return result;
    },

    async observeDesktopClosedWorkerStable({
      desktop: expectedDesktop,
      worker: expectedWorker,
      observationMs,
    }) {
      if (expectedDesktop?.resourceOwnershipRef !== desktop?.resourceOwnershipRef
        || expectedWorker?.resourceOwnershipRef !== worker?.resourceOwnershipRef
        || observationMs !== 2_000) {
        reject("RESOURCE_OR_OBSERVATION_MISMATCH", "DESKTOP_CLOSE_OBSERVATION");
      }
      const desktopExit = await observer.waitForDesktopExit({ desktop, timeoutMs: observationMs });
      if (desktopExit?.status !== "OS_EXIT_OBSERVED") {
        reject("DESKTOP_EXIT_NOT_OBSERVED", "DESKTOP_CLOSE_OBSERVATION");
      }
      await observer.waitObservationWindow({ durationMs: observationMs });
      const workerAttestation = await windowsControl.inspectProcess(worker.identity);
      if (workerAttestation.status !== "OS_IDENTITY_VERIFIED"
        || workerAttestation.peer.pid !== worker.identity.pid
        || workerAttestation.peer.processStartTimeFileTime
          !== worker.identity.processStartTimeFileTime
        || workerAttestation.peer.generation !== worker.identity.generation) {
        reject("WORKER_IDENTITY_CHANGED_AFTER_DESKTOP_CLOSE", "DESKTOP_CLOSE_OBSERVATION");
      }
      return Object.freeze({ status: "DESKTOP_EXITED_WORKER_IDENTITY_STABLE" });
    },

    observeWorkerExit({ worker: expectedWorker, timeoutMs }) {
      if (expectedWorker?.resourceOwnershipRef !== worker?.resourceOwnershipRef) {
        reject("RESOURCE_OWNERSHIP_UNKNOWN", "WORKER_EXIT_OBSERVATION");
      }
      return windowsControl.observeExit({ identity: worker.identity, timeoutMs });
    },

    async containOwnedResources({ resources, timeoutMs, firstFailure }) {
      if (!Array.isArray(resources) || resources.length > 2
        || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5_000) {
        reject("UNBOUNDED_CONTAINMENT", "CONTAINMENT");
      }
      const outcomes = [];
      const perResourceTimeout = Math.max(1, Math.floor(timeoutMs / Math.max(1, resources.length)));
      for (const resource of [...resources].reverse()) {
        try {
          await windowsControl.assertResourceOwnership(resource);
          const outcome = await windowsControl.boundedStop({
            identity: resource.identity,
            resourceOwnershipRef: resource.resourceOwnershipRef,
            timeoutMs: perResourceTimeout,
            reason: firstFailure?.code ?? "FAILURE",
          });
          outcomes.push(Object.freeze({
            resourceOwnershipRef: resource.resourceOwnershipRef,
            terminalState: outcome.status === "OS_EXIT_OBSERVED"
              || outcome.status === "CONTAINED_JOB_TERMINATED"
              ? "OS_EXIT_OBSERVED" : "UNKNOWN",
          }));
        } catch {
          outcomes.push(Object.freeze({
            resourceOwnershipRef: resource.resourceOwnershipRef,
            terminalState: "UNKNOWN",
          }));
        }
      }
      return Object.freeze({
        status: outcomes.every(item => item.terminalState === "OS_EXIT_OBSERVED")
          ? "CONTAINED" : "UNKNOWN",
        resources: Object.freeze(outcomes),
      });
    },
  });
}
