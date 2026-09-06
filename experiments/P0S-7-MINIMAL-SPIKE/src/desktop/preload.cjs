// NOT_PRODUCTION — private Electron bridge; loaded only by an approved Desktop.
"use strict";
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("shacoSpike", Object.freeze({
  // No arbitrary channel/payload, Node, shell, filesystem, process, or Worker lifecycle API.
  getReadiness: () => ipcRenderer.invoke("shaco-spike:get-readiness"),
  requestSum3: () => ipcRenderer.invoke("shaco-spike:request-sum3"),
}));
