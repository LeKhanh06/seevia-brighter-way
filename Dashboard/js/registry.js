/*
 * Bảng đăng ký trang: mỗi route khai báo endpoint (lớp dữ liệu), mapper (lớp chuyển đổi) và view (lớp giao diện).
 * Thêm/bớt trang chỉ cần sửa file này.
 */
import { CONFIG } from "./config.js";
import { mapOverview } from "./mappers/overview.js";
import { makeReportMapper } from "./mappers/report.js";
import { mapCommunity, mapTime, mapQuality, mapEngagement, mapSafety } from "./mappers/analytics.js";
import { mapErrors, mapAccounts, mapAccountDetail, mapDevices, mapDeviceDetail, mapConfig, mapProfile } from "./mappers/admin.js";
import { viewOverview, viewReport, viewCommunity, viewTime, viewQuality, viewEngagement, viewSafety } from "./views/reports.js";
import { viewErrors, viewAccounts, viewAccountDetail, viewDevices, viewDeviceDetail, viewConfig, viewProfile } from "./views/admin.js";

const stat = name => () => `/admin/stats/${name}`;
const report = (id, dot) => ({ id, group: "features", icon: id, endpoint: stat(id), map: makeReportMapper(id), view: viewReport, period: true, export: true, skeleton: "charts", dot });

export const ROUTES = {
  overview: { id: "overview", group: null, icon: "overview", endpoint: stat("overview"), map: mapOverview, view: viewOverview, period: true, export: true, skeleton: "overview" },
  "see-read": report("see-read", 1),
  find: report("find", 2),
  connect: report("connect", 3),
  go: report("go", 4),
  community: { id: "community", group: "features", icon: "community", endpoint: stat("community"), map: mapCommunity, view: viewCommunity, period: true, export: true, skeleton: "cards6", dot: 5 },
  time: { id: "time", group: "analytics", icon: "time", endpoint: stat("time"), map: mapTime, view: viewTime, period: true, export: true, skeleton: "charts" },
  quality: { id: "quality", group: "analytics", icon: "quality", endpoint: stat("quality"), map: mapQuality, view: viewQuality, period: true, export: true, skeleton: "charts" },
  engagement: { id: "engagement", group: "analytics", icon: "engagement", endpoint: stat("engagement"), map: mapEngagement, view: viewEngagement, period: true, export: true, skeleton: "cards6" },
  safety: { id: "safety", group: "analytics", icon: "safety", endpoint: stat("safety"), map: mapSafety, view: viewSafety, period: true, export: true, skeleton: "charts" },
  accounts: { id: "accounts", group: "admin", icon: "accounts", endpoint: () => "/admin/accounts", map: mapAccounts, view: viewAccounts, list: ["q", "status", "sort", "order", "page", "page_size"], export: true, skeleton: "list" },
  "account-detail": { id: "account-detail", group: null, parent: "accounts", endpoint: ctx => `/admin/accounts/${encodeURIComponent(ctx.params[0] || "")}`, map: mapAccountDetail, view: viewAccountDetail, skeleton: "detail", detail: true },
  devices: { id: "devices", group: "admin", icon: "devices", endpoint: () => "/admin/devices", map: mapDevices, view: viewDevices, list: ["q", "status", "firmware_version", "sort", "order", "page", "page_size"], export: true, skeleton: "list" },
  "device-detail": { id: "device-detail", group: null, parent: "devices", endpoint: ctx => `/admin/devices/${encodeURIComponent(ctx.params[0] || "")}`, map: mapDeviceDetail, view: viewDeviceDetail, skeleton: "detail", detail: true },
  errors: { id: "errors", group: "admin", icon: "errors", endpoint: stat("errors"), map: mapErrors, view: viewErrors, period: true, export: true, list: ["group", "firmware_version", "sort", "order", "page", "page_size"], skeleton: "list" },
  profile: { id: "profile", group: null, endpoint: () => "/admin/auth/me", map: mapProfile, view: viewProfile, skeleton: "detail", detail: false },
  config: { id: "config", group: "admin", icon: "config", endpoint: () => "/admin/config", map: mapConfig, view: viewConfig, export: true, skeleton: "list" },
};

// Thứ tự thanh điều hướng.
export const NAV_ORDER = ["overview", "see-read", "find", "connect", "go", "community", "time", "quality", "engagement", "safety", "accounts", "devices", "errors", "config"];

// Tham số gửi lên API: kỳ (nếu trang theo kỳ) + các khóa lọc/sắp xếp/phân trang của danh sách.
export function apiQuery(def, ctx, { page, pageSize } = {}) {
  const q = {};
  if (def.period) { q.period = ctx.period.period; q.from = ctx.period.from; q.to = ctx.period.to; }
  for (const key of def.list || []) { const v = ctx.query.get(key); if (v) q[key] = v; }
  if (def.list) { q.page_size = pageSize || ctx.query.get("page_size") || CONFIG.PAGE_SIZE; if (page) q.page = page; }
  return q;
}
