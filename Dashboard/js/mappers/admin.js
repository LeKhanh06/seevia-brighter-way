/* Các trang quản trị chỉ xem: Lỗi hệ thống, Tài khoản, Thiết bị, chi tiết, Cấu hình. */
import { vi, fill } from "../i18n/vi.js";
import { initialOf, fmtInt, fmtDate, fmtDateTime, fmtShortDateTime, fmtSigned, toNum, text } from "../lib/format.js";
import { compareName } from "../core/period.js";
import { arr, obj } from "./util.js";
import { CONFIG } from "../config.js";

const pageInfo = (raw, ctx) => {
  const total = toNum(raw?.total) ?? arr(raw?.items).length;
  const pageSize = toNum(raw?.page_size) ?? CONFIG.PAGE_SIZE;
  const page = toNum(raw?.page) ?? 1;
  return { total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)), sort: ctx.query.get("sort") || null, order: ctx.query.get("order") === "desc" ? "desc" : "asc" };
};
const opts = (values, fallback = []) => [...new Set([...(arr(values).length ? arr(values) : fallback)])].map(v => ({ value: String(v), label: String(v) }));
// Bộ lọc phiên bản chỉ xuất hiện khi dữ liệu có từ 2 phiên bản trở lên.
const versionOptions = values => { const o = opts(values); return o.length >= 2 ? [{ value: "all", label: vi.common.all }, ...o] : null; };

// ---- Lỗi hệ thống (một bảng mã lỗi) -------------------------------------------------------
export function mapErrors(raw, ctx) {
  const e = vi.errors;
  const items = arr(raw?.items);
  return {
    page: { ...pageInfo(raw, ctx), sort: ctx.query.get("sort") || "count", order: ctx.query.get("sort") ? (ctx.query.get("order") === "asc" ? "asc" : "desc") : "desc" },
    filters: {
      group: ctx.query.get("group") || "all", firmware: ctx.query.get("firmware_version") || "all",
      groups: [{ value: "all", label: vi.common.all }, ...opts(raw?.available_groups, e.groupOptions)],
      firmwares: versionOptions(raw?.available_firmware_versions),
    },
    columns: [
      { key: "code", label: e.cols.code, sortable: true }, { key: "feature", label: e.cols.feature, sortable: true }, { key: "group", label: e.cols.group, sortable: true },
      { key: "count", label: e.cols.count, sortable: true, align: "end", tip: vi.sectionTips.errorCount }, { key: "change", label: fill(e.cols.change, { compare: compareName(ctx.period) }), sortable: true, align: "end" },
      { key: "last_seen", label: e.cols.last, sortable: true },
    ],
    rows: items.map(i => {
      const change = toNum(i.change);
      return { code: text(i.code), feature: vi.features[i.feature] || text(i.feature), group: text(i.group), count: fmtInt(i.count), change: fmtSigned(i.change), tone: change > 0 ? "bad" : change < 0 ? "good" : "neutral", last: fmtShortDateTime(i.last_seen) };
    }),
    csv: {
      headers: ["Mã lỗi", "Chức năng", "Nhóm", "Số lượt", "Thay đổi so với kỳ trước", "Lần gần nhất"],
      rows: items.map(i => [i.code ?? "", vi.features[i.feature] || i.feature || "", i.group ?? "", i.count ?? "", i.change ?? "", i.last_seen ?? ""]),
    },
  };
}

// ---- Tài khoản ----------------------------------------------------------------------------
const accountStatus = s => ({ label: vi.accounts.statuses[s] || text(s), tone: s === "active" ? "good" : "neutral" });
export function mapAccounts(raw, ctx) {
  const a = vi.accounts, items = arr(raw?.items);
  return {
    page: pageInfo(raw, ctx),
    filters: { q: ctx.query.get("q") || "", status: ctx.query.get("status") || "all", statuses: [{ value: "all", label: vi.common.all }, ...Object.entries(a.statuses).map(([value, label]) => ({ value, label }))] },
    columns: [
      { key: "id", label: a.cols.id, sortable: true }, { key: "email", label: a.cols.email }, { key: "created_at", label: a.cols.created, sortable: true },
      { key: "status", label: a.cols.status, sortable: true }, { key: "glasses_count", label: a.cols.glasses, sortable: true, align: "end" },
    ],
    rows: items.map(i => ({ id: text(i.id), email: text(i.email_masked), created: fmtDate(i.created_at), status: accountStatus(i.status), glasses: fmtInt(i.glasses_count) })),
    csv: {
      headers: ["Mã tài khoản", "Email (ẩn một phần)", "Ngày tạo", "Trạng thái", "Số kính liên kết"],
      rows: items.map(i => [i.id ?? "", i.email_masked ?? "", i.created_at ?? "", a.statuses[i.status] || i.status || "", i.glasses_count ?? ""]),
    },
  };
}

const deviceStatus = s => ({ label: vi.devices.statuses[s] || text(s), tone: s === "online" ? "good" : "neutral" });
const linkedGlasses = list => arr(list).map(g => ({ id: text(g.id), firmware: text(g.firmware_version), status: deviceStatus(g.status), last: fmtDateTime(g.last_seen_at) }));

export function mapAccountDetail(raw) {
  const a = vi.accounts, r = obj(raw);
  return {
    id: text(r.id), found: Boolean(r.id),
    fields: [
      { label: a.emailLabel, value: text(r.email_masked), ellipsis: true }, { label: a.createdLabel, value: fmtDate(r.created_at) },
      { label: a.statusField, chip: accountStatus(r.status) }, { label: a.glassesLabel, value: fmtInt(r.glasses_count) },
    ],
    glasses: linkedGlasses(r.glasses),
    csv: null,
  };
}

// ---- Thiết bị -----------------------------------------------------------------------------
export function mapDevices(raw, ctx) {
  const d = vi.devices, items = arr(raw?.items);
  return {
    page: pageInfo(raw, ctx),
    filters: {
      q: ctx.query.get("q") || "", status: ctx.query.get("status") || "all", firmware: ctx.query.get("firmware_version") || "all",
      statuses: [{ value: "all", label: vi.common.all }, ...Object.entries(d.statuses).map(([value, label]) => ({ value, label }))],
      firmwares: versionOptions(raw?.available_firmware_versions),
    },
    columns: [
      { key: "id", label: d.cols.id, sortable: true }, { key: "firmware_version", label: d.cols.firmware, sortable: true }, { key: "status", label: d.cols.status, sortable: true },
      { key: "last_seen_at", label: d.cols.last, sortable: true }, { key: "account_id", label: d.cols.account },
    ],
    rows: items.map(i => ({ id: text(i.id), firmware: text(i.firmware_version), status: deviceStatus(i.status), last: fmtDateTime(i.last_seen_at), account: text(i.account_id) })),
    csv: {
      headers: ["Mã kính", "Firmware", "Trạng thái", "Lần kết nối gần nhất", "Mã tài khoản liên kết"],
      rows: items.map(i => [i.id ?? "", i.firmware_version ?? "", d.statuses[i.status] || i.status || "", i.last_seen_at ?? "", i.account_id ?? ""]),
    },
  };
}

export function mapDeviceDetail(raw) {
  const d = vi.devices, r = obj(raw);
  return {
    id: text(r.id), found: Boolean(r.id),
    fields: [
      { label: d.firmwareLabel2, value: text(r.firmware_version) }, { label: d.statusField, chip: deviceStatus(r.status) },
      { label: d.lastLabel, value: fmtDateTime(r.last_seen_at) }, { label: d.accountLabel, value: text(r.account_id), href: r.account_id ? `#account-detail/${encodeURIComponent(r.account_id)}` : null },
    ],
    errors: arr(r.recent_errors).map(e => ({ code: text(e.code), feature: text(e.feature), at: fmtShortDateTime(e.occurred_at) })),
    csv: null,
  };
}

// ---- Cấu hình -----------------------------------------------------------------------------
export function mapConfig(raw) {
  const items = arr(raw?.admin_accounts);
  return {
    rows: items.map(i => ({ email: text(i.email_masked), created: fmtDate(i.created_at), lastLogin: fmtDateTime(i.last_login_at) })),
    csv: { headers: ["Email", "Ngày tạo", "Lần đăng nhập gần nhất"], rows: items.map(i => [i.email_masked ?? "", i.created_at ?? "", i.last_login_at ?? ""]) },
  };
}

// ---- Hồ sơ quản trị viên (GET /admin/auth/me) ---------------------------------------------
export function mapProfile(raw) {
  const p = vi.profile, u = obj(raw?.user);
  return {
    found: Boolean(raw?.user), initial: initialOf(u), name: text(u.display_name), email: text(u.email_masked),
    chips: [{ label: p.roleChip, tone: "accent" }, { label: p.readOnlyChip, tone: "neutral" }],
    rows: [
      { label: p.name, value: text(u.display_name) }, { label: p.email, value: text(u.email_masked) },
      { label: p.role, value: p.roles[u.role] || text(u.role) }, { label: p.created, value: fmtDate(u.created_at) },
      { label: p.lastLogin, value: fmtDateTime(u.last_login_at).slice(0, 16) }, { label: p.timezone, value: p.timezones[u.timezone] || text(u.timezone) },
    ],
    user: raw?.user || null, csv: null,
  };
}
