import axios from "axios";
import { pushToast } from "../utils/toastBus";
import { logError } from "../utils/logger";
import { createRequestId, getSessionId } from "../utils/requestIds";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

api.interceptors.request.use((config) => {
  const headers = config.headers || {};
  headers["x-request-id"] = createRequestId();
  headers["x-session-id"] = getSessionId();
  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const method = String(config.method || "get").toLowerCase();
    const status = error?.response?.status || 0;

    const retryableMethod = ["get", "head", "options"].includes(method);
    const retryableStatus = status === 0 || status >= 500 || status === 429;

    config.__retryCount = config.__retryCount || 0;

    if (retryableMethod && retryableStatus && config.__retryCount < 2) {
      config.__retryCount += 1;
      const delayMs = 250 * (2 ** (config.__retryCount - 1));
      await wait(delayMs);
      return api(config);
    }

    pushToast("Request failed. Please retry.");
    logError("api", error, { url: config.url, method, status });
    return Promise.reject(error);
  }
);

export const postBehaviorBatch = (payload) => api.post("/api/behavior/log", payload);
export const fetchAnalytics = () => api.get("/api/analytics/summary");
export const fetchLiveLogs = () => api.get("/api/analytics/prediction-logs");
export const fetchBehaviorHeatmap = () => api.get("/api/analytics/behavior-heatmap");
export const analyzeTextEmotion = (text) => api.post("/api/emotion/text", { text });
export const analyzeFrameEmotion = (frameBase64) => api.post("/api/emotion/webcam", { frame_base64: frameBase64 });
