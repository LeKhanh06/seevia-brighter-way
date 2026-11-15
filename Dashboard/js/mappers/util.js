/*
 * Tiện ích chung của lớp chuyển đổi (mapper): chịu được thiếu/null/0, không tạo NaN.
 * Mapper nhận phản hồi API thô → trả cấu trúc hiển thị (chuỗi đã định dạng + nhãn + tooltip).
 */
import { vi, fill } from "../i18n/vi.js";
import { fmtDec, fmtInt, toNum, DASH } from "../lib/format.js";
import { weekdayOf } from "../core/period.js";

export const obj = v => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
export const arr = v => (Array.isArray(v) ? v : []);

// Thẻ chỉ số hiển thị: nhãn + tooltip lấy từ i18n theo định nghĩa `def` ({label, tip}).
export const metric = (def, value, foot = null, extra = {}) => ({ label: def.label, tip: def.tip, value, foot, ...extra });

// Mức thay đổi so với kỳ trước: {dir: up|down|flat, text}; thiếu dữ liệu → null.
export function delta(value, kind, compare) {
  const n = toNum(value);
  if (n === null) return null;
  const abs = Math.abs(n);
  const unit = kind === "pct" ? "%" : kind === "points" ? ` ${vi.overview.pointsUnit}` : "";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const body = kind === "pct" ? fmtDec(abs) : kind === "points" ? fmtDec(abs) : fmtInt(abs);
  return { dir: n > 0 ? "up" : n < 0 ? "down" : "flat", text: `${sign}${body}${unit}`, suffix: fill(vi.overview.deltaSuffix, { compare }) };
}

// Nhãn trục X: giờ → "07h"; ≤ 7 ngày → T2…CN; dài hơn → số ngày trong tháng.
export function bucketLabel(bucket, granularity, count) {
  if (!bucket) return DASH;
  if (granularity === "hour") { const h = /T(\d{2})/.exec(bucket)?.[1]; return h ? `${h}h` : DASH; }
  const date = String(bucket).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return DASH;
  return count <= 7 ? vi.weekdayShort[weekdayOf(date)] : String(Number(date.slice(8)));
}
export const bucketTitle = (bucket, granularity, count) => {
  if (granularity === "hour") return bucketLabel(bucket, granularity, count);
  const date = String(bucket).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${vi.weekdayShort[weekdayOf(date)]} ${date.slice(8)}/${date.slice(5, 7)}` : DASH;
};
