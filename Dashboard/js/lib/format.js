/*
 * Định dạng hiển thị theo locale vi-VN. Backend chỉ trả giá trị thô; mọi chuỗi như
 * "1.284", "4 phút", "96,4%" đều do file này tạo. Giá trị null/thiếu/NaN luôn ra "—".
 */
import { CONFIG } from "../config.js";

export const DASH = "—";
const nf = new Intl.NumberFormat(CONFIG.LOCALE);
const nf1 = new Intl.NumberFormat(CONFIG.LOCALE, { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat(CONFIG.LOCALE, { maximumFractionDigits: 2 });

export const toNum = v => (v === null || v === undefined || v === "" || typeof v === "boolean" ? null : Number.isFinite(Number(v)) ? Number(v) : null);

export function fmtInt(v) { const n = toNum(v); return n === null ? DASH : nf.format(Math.round(n)); }
export function fmtDec(v, digits = 1) { const n = toNum(v); return n === null ? DASH : (digits === 2 ? nf2 : nf1).format(n); }
export function fmtPct(v) { const n = toNum(v); return n === null ? DASH : `${nf1.format(n)}%`; }
export function ratio(a, b) { const x = toNum(a), y = toNum(b); return x === null || y === null || y === 0 ? null : x / y; }
export function fmtFraction(a, b) { const x = toNum(a), y = toNum(b); return x === null || y === null ? DASH : `${nf.format(x)}/${nf.format(y)}`; }
export function fmtSigned(v) {
  const n = toNum(v);
  if (n === null) return DASH;
  return n > 0 ? `+${nf.format(n)}` : n < 0 ? `−${nf.format(Math.abs(n))}` : "0";
}

// Thời lượng từ số giây: "9 giây", "2,1 giây", "4 phút", "2 phút 40 giây", "3 giờ 05 phút".
export function fmtDuration(seconds) {
  const n = toNum(seconds);
  if (n === null || n < 0) return DASH;
  if (n < 60) return `${nf1.format(Math.round(n * 10) / 10)} giây`;
  const total = Math.round(n);
  const hours = Math.floor(total / 3600), minutes = Math.floor((total % 3600) / 60), secs = total % 60;
  if (hours > 0) return minutes ? `${hours} giờ ${String(minutes).padStart(2, "0")} phút` : `${hours} giờ`;
  return secs ? `${minutes} phút ${secs} giây` : `${minutes} phút`;
}
export const fmtMs = ms => { const n = toNum(ms); return n === null ? DASH : fmtDuration(n / 1000); };
// Chỉ phút (cho trường "Tổng phút bật": 200 phút).
export function fmtMinutes(seconds) { const n = toNum(seconds); return n === null ? DASH : `${nf.format(Math.round(n / 60))} phút`; }

const parts = (date, options) => {
  const out = {};
  for (const p of new Intl.DateTimeFormat("en-GB", { timeZone: CONFIG.TIMEZONE, hourCycle: "h23", ...options }).formatToParts(date)) out[p.type] = p.value;
  return out;
};
const isDateOnly = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const parseDate = v => { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };

// "2026-11-02" hoặc ISO có giờ → "02/11/2026".
export function fmtDate(value) {
  if (!value) return DASH;
  if (isDateOnly(value)) { const [y, m, d] = value.split("-"); return `${d}/${m}/${y}`; }
  const date = parseDate(value);
  if (!date) return DASH;
  const p = parts(date, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${p.day}/${p.month}/${p.year}`;
}
export function fmtDateTime(value) {
  const date = value && !isDateOnly(value) ? parseDate(value) : null;
  if (!date) return DASH;
  const p = parts(date, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}
// "15/11 08:31"
export function fmtShortDateTime(value) {
  const date = value && !isDateOnly(value) ? parseDate(value) : null;
  if (!date) return DASH;
  const p = parts(date, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`;
}
export function hourOf(value) { const d = parseDate(value); return d ? Number(parts(d, { hour: "2-digit" }).hour) : null; }
export function isoDay(value) { const d = parseDate(value); if (!d) return null; const p = parts(d, { day: "2-digit", month: "2-digit", year: "numeric" }); return `${p.year}-${p.month}-${p.day}`; }

// Trục biểu đồ: số giây → "2 giờ" / "30 phút".
export function fmtAxisSeconds(v) {
  const n = toNum(v);
  if (n === null) return DASH;
  return n >= 3600 ? `${nf1.format(n / 3600)} giờ` : `${nf.format(Math.round(n / 60))} phút`;
}

// Chuỗi hiển thị an toàn cho văn bản thô từ API (mã lỗi, firmware...).
export const text = v => (v === null || v === undefined || v === "" ? DASH : String(v));

// Luôn 1 chữ số thập phân ("2,0 giây") — dùng cho cột "Chờ nghe tiếng đầu".
export function fmtMsFixed(ms) {
  const n = toNum(ms);
  return n === null ? DASH : `${new Intl.NumberFormat(CONFIG.LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n / 1000)} giây`;
}

// Chữ cái đầu của tên hiển thị (dùng cho avatar).
export const initialOf = user => (String(user?.display_name || user?.email_masked || "").trim().charAt(0) || "A").toLocaleUpperCase("vi");
