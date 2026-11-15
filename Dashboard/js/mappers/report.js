/* Bốn trang chức năng (Đọc & Nhận diện, Tìm & Hiểu, Kết nối, Di chuyển) dùng chung một cấu trúc. */
import { vi, fill } from "../i18n/vi.js";
import { fmtInt, fmtPct, fmtDec, fmtDuration, fmtMinutes, fmtMsFixed, toNum, DASH } from "../lib/format.js";
import { arr, obj, metric } from "./util.js";

// Thứ tự chức năng và chỉ số chi tiết đúng như bản thiết kế.
const PAGES = {
  "see-read": { features: ["ocr", "ocr_live", "money", "ask"], cards: ["share_of_total", "completion", "usage_time"] },
  find: { features: ["find", "space", "hazard"], cards: ["share_of_total", "completion", "usage_time"] },
  connect: { features: ["chat", "family", "internet_call", "music"], cards: ["share_of_total", "completion", "usage_time"], connectLink: true },
  go: { features: ["directions", "ride", "alert_mode"], cards: ["share_of_total", "alert_time", "alerts_per_hour"] },
};
const DETAILS = {
  ocr: ["rejected_images", "avg_retries", "processing_p50_seconds"], ocr_live: ["framing_p50_seconds", "avg_session_seconds"],
  money: ["uncertain_rate_pct", "rejected_images"], ask: ["rejected_images", "duration_p50_seconds"],
  find: ["rejected_images", "duration_p50_seconds"], space: ["rejected_images", "duration_p50_seconds"], hazard: ["rejected_images", "duration_p50_seconds"],
  chat: ["web_lookup_rate_pct", "duration_p50_seconds"], family: ["cancel_in_window_pct", "reask_pct", "confirm_p50_seconds"],
  internet_call: ["answer_rate_pct", "avg_call_seconds", "connection_errors"], music: ["avg_play_seconds", "cancel_rate_pct"],
  directions: ["avg_trip_seconds", "cancel_midway_pct"], ride: ["avg_booking_seconds", "cancel_midway_pct"], alert_mode: ["total_on_seconds"],
};
const detailValue = (feature, field, v) => {
  if (feature === "alert_mode" && field === "total_on_seconds") return fmtMinutes(v);
  if (field.endsWith("_pct")) return fmtPct(v);
  if (field.endsWith("_seconds")) return fmtDuration(v);
  if (field === "avg_retries") return fmtDec(v);
  return fmtInt(v);
};
const TOP_ERROR = new Set(["family"]);   // S25: "lỗi theo mã" hiện trong thẻ Gọi người thân / nhắn tin / đọc tin
const usesText = f => { const n = toNum(f?.uses); return n === null ? DASH : `${fmtInt(n)}${vi.usesUnit[f?.uses_unit] ?? ""}`; };

export function makeReportMapper(route) {
  const cfg = PAGES[route];
  return function mapReport(raw) {
    const s = obj(raw?.summary), r = vi.report;
    const byKey = Object.fromEntries(arr(raw?.features).map(f => [f.key, f]));
    const cardOf = {
      share_of_total: () => metric(vi.metrics.share_of_total, fmtInt(s.uses), toNum(s.share_of_total_pct) === null ? null : fill(r.shareFoot, { value: fmtPct(s.share_of_total_pct) })),
      completion: () => metric(vi.metrics.completion, fmtPct(s.completion_rate), r.completionFoot, { estimate: Boolean(s.completion_rate_is_estimate) }),
      usage_time: () => metric(vi.metrics.usage_time, fmtDuration(s.usage_seconds), r.usageFoot[route]),
      alert_time: () => metric(vi.metrics.alert_time, fmtDuration(s.alert_mode_seconds), r.goFoot.alert_time),
      alerts_per_hour: () => metric(vi.metrics.alerts_per_hour, fmtInt(s.alerts_per_hour), r.goFoot.alerts_per_hour),
    };
    const features = cfg.features.map(key => {
      const f = byKey[key] || {};
      const details = obj(f.details);
      return {
        key, name: vi.features[key] || key, experimental: Boolean(f.is_experimental),
        row: {
          uses: usesText(f), completion: fmtPct(f.completion_rate), firstAudio: toNum(f.first_audio_p50_ms) === null ? DASH : fmtMsFixed(f.first_audio_p50_ms), errors: fmtInt(f.errors),
        },
        metrics: (DETAILS[key] || []).map(field => metric(vi.details[field], detailValue(key, field, details[field]), null, { estimate: Boolean(details[`${field}_is_estimate`]) })),
        note: key === "alert_mode" && toNum(details.alerts_per_hour) !== null ? fill(vi.alertsPerHourNote, { value: fmtInt(details.alerts_per_hour) })
          : TOP_ERROR.has(key) && f.top_error ? fill(vi.topErrorNote, { code: f.top_error.code, count: fmtInt(f.top_error.count) }) : null,
      };
    });
    const anyExperimental = features.some(f => f.experimental);
    return {
      cards: cfg.cards.map(k => cardOf[k]()),
      features,
      notice: null,
      footnote: anyExperimental ? r.experimentalNote : null,
      connectLink: Boolean(cfg.connectLink),
      isEmpty: !arr(raw?.features).length,
      csv: {
        headers: ["Chức năng", "Lượt sử dụng", "Đơn vị lượt", "Hoàn thành (%)", "Chờ nghe tiếng đầu (ms)", "Lỗi"],
        rows: cfg.features.map(key => { const f = byKey[key] || {}; return [vi.features[key] || key, f.uses ?? "", f.uses_unit ?? "", f.completion_rate ?? "", f.first_audio_p50_ms ?? "", f.errors ?? ""]; }),
      },
    };
  };
}
