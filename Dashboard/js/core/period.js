/*
 * Kỳ báo cáo theo giờ Việt Nam. Kỳ nằm trong URL hash (#overview?period=week) để tải lại
 * hoặc chia sẻ link vẫn đúng; from/to là ngày ISO (YYYY-MM-DD).
 */
import { CONFIG } from "../config.js";
import { vi, fill } from "../i18n/vi.js";

const STORE = "seevia-period";
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const pad = n => String(n).padStart(2, "0");
const utc = iso => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const fromUtc = ms => { const d = new Date(ms); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };

export const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const addDays = (iso, n) => fromUtc(utc(iso) + n * 86400000);
export const weekdayOf = iso => { const d = new Date(utc(iso)).getUTCDay(); return d === 0 ? 7 : d; }; // 1 = Thứ Hai … 7 = Chủ Nhật
export const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86400000) + 1;
const monthEnd = iso => { const [y, m] = iso.split("-").map(Number); return fromUtc(Date.UTC(y, m, 0)); };

function range(period, today) {
  if (period === "today") return { from: today, to: today };
  if (period === "month") return { from: `${today.slice(0, 7)}-01`, to: monthEnd(today) };
  const from = addDays(today, 1 - weekdayOf(today));
  return { from, to: addDays(from, 6) };
}

export function resolvePeriod(query) {
  const today = todayISO();
  let period = query.get("period") || "";
  if (!["today", "week", "month", "custom"].includes(period)) { try { period = sessionStorage.getItem(STORE) || "week"; } catch { period = "week"; } }
  if (period === "custom") {
    const from = query.get("from"), to = query.get("to");
    if (ISO.test(from || "") && ISO.test(to || "") && from <= to) return { period, from, to };
    period = "week";
  }
  return { period, ...range(period, today) };
}
export function rememberPeriod(period) { try { sessionStorage.setItem(STORE, period); } catch { /* bỏ qua */ } }
export const periodQuery = p => (p.period === "custom" ? { period: "custom", from: p.from, to: p.to } : { period: p.period });
export const apiPeriodParams = p => ({ period: p.period, from: p.from, to: p.to });

const dm = iso => { const [, m, d] = iso.split("-"); return `${Number(d)} thg ${Number(m)}`; };
const dmy = iso => `${dm(iso)}, ${iso.slice(0, 4)}`;
export function rangeText({ from, to }) {
  if (from === to) return dmy(from);
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${dmy(from)} – ${dmy(to)}`;
  if (from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8))} – ${Number(to.slice(8))} thg ${Number(to.slice(5, 7))}, ${to.slice(0, 4)}`;
  return `${dm(from)} – ${dmy(to)}`;
}
export const periodName = p => vi.periods[p.period];
export const compareName = p => vi.compare[p.period];
export const periodTitle = (p) => fill(vi.overview.compareTitle, { period: periodName(p), compare: compareName(p) });
export const periodFileTag = p => `${p.from}-${p.to}`;

// Khoảng ngày của từng loại kỳ (dùng để ghi chú ngày vào từng lựa chọn trong ô chọn kỳ).
export const rangeFor = (period, today = todayISO()) => range(period, today);
