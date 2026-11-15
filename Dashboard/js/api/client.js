/*
 * Nơi DUY NHẤT gọi mạng của dashboard (các lớp khác không dùng fetch).
 *  - Gắn Authorization: Bearer <token>.
 *  - Timeout, lỗi mạng, 401 (xóa phiên, về #login), 403, 5xx; GET thử lại 1 lần khi mạng/timeout/5xx.
 *  - Hủy yêu cầu cũ cùng `group` khi người dùng đổi trang hoặc đổi kỳ.
 *  - USE_MOCK = true → dữ liệu mẫu (js/api/mock/) trả về đúng cùng hình dạng như API thật.
 */
import { CONFIG } from "../config.js";
import { getToken, clearSession } from "../core/session.js";
import { handleMock } from "./mock/handler.js";

export class ApiError extends Error {
  constructor(kind, { status = 0, code = "", message = "" } = {}) {
    super(message || code || kind);
    this.name = "ApiError";
    this.kind = kind;       // network | timeout | aborted | http
    this.status = status;
    this.code = code;
  }
}

// Chế độ dữ liệu mẫu: kiểm tra chéo các con số một lần khi tải (lỗi ra console).
if (CONFIG.USE_MOCK) import("./mock/validate.js").then(m => m.reportMockProblems()).catch(() => {});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = fn => { onUnauthorized = fn; };

const inflight = new Map();
const wait = (ms, signal) => new Promise((resolve, reject) => {
  const t = setTimeout(resolve, ms);
  signal?.addEventListener("abort", () => { clearTimeout(t); reject(new ApiError("aborted")); }, { once: true });
});

function toQuery(query = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function send(method, path, { query, body, signal, timeoutMs, accept = "application/json" }) {
  const timeout = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; timeout.abort(); }, timeoutMs);
  const onAbort = () => timeout.abort();
  if (signal) signal.aborted ? timeout.abort() : signal.addEventListener("abort", onAbort, { once: true });
  try {
    if (CONFIG.USE_MOCK) {
      await wait(CONFIG.MOCK_LATENCY_MS, timeout.signal);
      const res = handleMock({ method, path, query: query || {}, body, token: getToken() });
      return { status: res.status, json: res.body, blob: null };
    }
    const headers = { Accept: accept };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`${CONFIG.API_BASE_URL.replace(/\/$/, "")}${path}${toQuery(query)}`, {
      method, headers, signal: timeout.signal, body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "omit", cache: "no-store",
    });
    if (accept !== "application/json" && response.ok) return { status: response.status, json: null, blob: await response.blob() };
    let json = null;
    try { json = await response.json(); } catch { /* thân phản hồi không phải JSON */ }
    return { status: response.status, json, blob: null };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError("timeout");
    if (signal?.aborted || error?.name === "AbortError") throw new ApiError("aborted");
    throw new ApiError("network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

async function request(method, path, options = {}) {
  const { group, signal: external, auth = true, retry = method === "GET" } = options;
  const controller = new AbortController();
  if (group) { inflight.get(group)?.abort(); inflight.set(group, controller); }
  if (external) external.aborted ? controller.abort() : external.addEventListener("abort", () => controller.abort(), { once: true });
  const timeoutMs = options.timeoutMs ?? CONFIG.REQUEST_TIMEOUT_MS;

  try {
    let attempt = 0;
    for (;;) {
      attempt += 1;
      let result;
      try {
        result = await send(method, path, { ...options, signal: controller.signal, timeoutMs });
      } catch (error) {
        if (retry && attempt === 1 && (error.kind === "network" || error.kind === "timeout")) { await wait(400, controller.signal); continue; }
        throw error;
      }
      const { status, json, blob } = result;
      if (status >= 200 && status < 300) return blob ?? json;
      if (status === 401 && auth) { clearSession(); onUnauthorized(); }
      if (status >= 500 && retry && attempt === 1) { await wait(400, controller.signal); continue; }
      throw new ApiError("http", { status, code: json?.error?.code || "", message: json?.error?.message || "" });
    }
  } finally {
    if (group && inflight.get(group) === controller) inflight.delete(group);
  }
}

export const api = {
  get: (path, query, options = {}) => request("GET", path, { ...options, query }),
  post: (path, body, options = {}) => request("POST", path, { ...options, body }),
  // Tải CSV từ chính endpoint thống kê khi CONFIG.CSV_SERVER_EXPORT = true.
  getCsv: (path, query, options = {}) => request("GET", path, { ...options, query: { ...query, format: "csv" }, accept: "text/csv" }),
};
