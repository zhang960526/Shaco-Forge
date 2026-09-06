// NOT_PRODUCTION — browser-only UI; no Node/Electron imports.
"use strict";

const requestButton = document.getElementById("request-sum3");
const requestView = document.getElementById("request-view");
const resultView = document.getElementById("result-view");
const statusView = document.getElementById("status-view");

requestView.textContent = "SUM3 · [2, 3, 5]";
resultView.textContent = "未执行";
statusView.textContent = "Phase A：仅静态源码，执行未授权。";
requestButton.disabled = true;
let requestUsed = false;
let sessionReady = false;

async function initializeReadiness() {
  if (!window.shacoSpike
    || typeof window.shacoSpike.getReadiness !== "function"
    || typeof window.shacoSpike.requestSum3 !== "function") {
    statusView.textContent = "受限 Desktop bridge 不可用。";
    return;
  }
  try {
    const readiness = await window.shacoSpike.getReadiness();
    if (readiness?.ready === true && readiness.task === "SUM3" && readiness.requestLimit === 1) {
      sessionReady = true;
      requestButton.disabled = false;
      statusView.textContent = "受控会话已就绪；请手动点击提交一次请求。";
      return;
    }
  } catch {
    // The UI remains denied; details stay in the independently controlled evidence path.
  }
  statusView.textContent = "执行未授权或会话未认证。";
}

// Only an explicit operator click requests work; readiness and window display never do.
requestButton.addEventListener("click", async event => {
  if (!event.isTrusted || !sessionReady || requestButton.disabled) return;
  if (requestUsed || !window.shacoSpike) {
    statusView.textContent = "重复请求已拒绝。";
    return;
  }
  requestUsed = true;
  requestButton.disabled = true;
  try {
    const response = await window.shacoSpike.requestSum3();
    if (response?.accepted !== true) {
      statusView.textContent = "请求已拒绝。";
      return;
    }
    // Display only the authenticated Main response; the independent Driver owns the oracle verdict.
    const result = response.result;
    if (result?.operation !== "SUM3" || result.count !== 3
      || !Number.isSafeInteger(result.sum)) {
      statusView.textContent = "结果不符合任务约束。";
      return;
    }
    resultView.textContent = "count=" + result.count + ", sum=" + result.sum;
    statusView.textContent = "已收到结果；最终结论由独立证据收口确定。";
  } catch {
    statusView.textContent = "请求未完成。";
  }
});

// Read-only bridge readiness; do not submit a request during initialization.
void initializeReadiness();
