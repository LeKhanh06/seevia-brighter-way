/* Các trang: Cộng đồng & Thiết bị, Thời điểm, Chất lượng & tốc độ, Gắn bó, An toàn. */
import { vi, fill } from "../i18n/vi.js";
import { fmtInt, fmtPct, fmtDec, fmtDuration, fmtMs, fmtMinutes, fmtFraction, ratio, toNum, DASH } from "../lib/format.js";
import { compareName } from "../core/period.js";
import { arr, obj, metric, delta, bucketLabel, bucketTitle } from "./util.js";
import { weekdayOf } from "../core/period.js";

// ---- Cộng đồng & Thiết bị -----------------------------------------------------------------
export function mapCommunity(raw) {
  const c = vi.community, r = obj(raw);
  const rate = toNum(r.install_success_rate) ?? (ratio(r.install_successes, r.install_attempts) === null ? null : ratio(r.install_successes, r.install_attempts) * 100);
  const topError = arr(r.install_errors)[0];
  const installFoot = toNum(r.install_attempts) === null ? null
    : topError ? fill(c.installFoot, { ok: fmtInt(r.install_successes), total: fmtInt(r.install_attempts), error: c.setupErrors[topError.code] || topError.code, count: fmtInt(topError.count) })
      : fill(c.installFootNoError, { ok: fmtInt(r.install_successes), total: fmtInt(r.install_attempts) });
  const m = vi.metrics;
  const sessions = toNum(r.glasses_sessions);
  return {
    cards: [
      metric(m.install_success, fmtPct(rate), installFoot, { estimate: Boolean(r.install_success_rate_is_estimate) }),
      metric(m.install_time, fmtDuration(r.install_p50_seconds), c.installTimeFoot),
      metric(m.emergency_contact, fmtFraction(r.emergency_contact_accounts, r.total_accounts), ratio(r.emergency_contact_accounts, r.total_accounts) === null ? null : fill(c.emergencyFoot, { pct: fmtPct(Math.round(ratio(r.emergency_contact_accounts, r.total_accounts) * 100)) })),
      metric(m.disconnects, fmtDec(r.disconnects_per_device_per_day), c.disconnectsFoot),
      metric(m.battery20, fmtDuration(r.battery_to_20_p50_seconds), c.batteryFoot),
      metric(m.glasses_sessions, sessions === null ? DASH : fill(c.sessionsValue, { count: fmtInt(sessions) }), toNum(r.glasses_session_seconds) === null ? null : fill(c.sessionsFoot, { duration: fmtDuration(r.glasses_session_seconds) }) + (toNum(r.glasses_active_days) === null ? "" : fill(c.sessionsDays, { days: fmtInt(r.glasses_active_days) }))),
    ],
    csv: {
      headers: ["Chỉ số", "Giá trị"],
      rows: [["Tỷ lệ cài đặt kính thành công (%)", rate ?? ""], ["Thời gian cài đặt kính (giây)", r.install_p50_seconds ?? ""], ["Tài khoản có liên hệ khẩn cấp", r.emergency_contact_accounts ?? ""], ["Tổng tài khoản", r.total_accounts ?? ""],
        ["Mất kết nối / ngày", r.disconnects_per_device_per_day ?? ""], ["Dùng đến khi pin còn 20% (giây)", r.battery_to_20_p50_seconds ?? ""], ["Số phiên kết nối kính", r.glasses_sessions ?? ""], ["Tổng thời gian kết nối kính (giây)", r.glasses_session_seconds ?? ""]],
    },
  };
}

// ---- Thời điểm ----------------------------------------------------------------------------
export function mapTime(raw) {
  const t = vi.time, r = obj(raw), peak = obj(r.peak_hours), best = obj(r.busiest_weekday);
  const range = (a, b) => (toNum(a) === null || toNum(b) === null ? null : `${a}–${b}`);
  const primary = range(peak.start_hour, peak.end_hour), secondary = range(peak.secondary_start_hour, peak.secondary_end_hour);
  const cards = [
    metric(vi.metrics.peak_hours, primary ? `${primary} ${t.hoursUnit}` : DASH, secondary ? fill(t.peakFoot, { range: secondary }) : null),
    metric(vi.metrics.busiest_day, vi.weekdayLong[best.weekday] || DASH, toNum(best.uses) === null ? null : fill(t.usesFoot, { value: fmtInt(best.uses) })),
    metric(vi.metrics.weekend, toNum(r.weekend_uses) === null ? DASH : fill(t.usesWord, { value: fmtInt(r.weekend_uses) }), t.weekendFoot),
  ];
  const hm = obj(r.heatmap), cells = arr(hm.cells);
  const weekdays = arr(hm.weekdays).length ? hm.weekdays : cells.map((_, i) => i + 1);
  const hours = arr(hm.hours).length ? hm.hours : Array.from({ length: 24 }, (_, i) => i);
  const max = Math.max(0, ...cells.flat().map(v => toNum(v) ?? 0));
  const heat = {
    hours, max,
    rows: cells.map((row, i) => ({
      label: vi.weekdayShort[weekdays[i]] || DASH,
      cells: arr(row).map((v, h) => {
        const value = toNum(v) ?? 0;
        return { value, level: max ? value / max : 0, tip: fill(t.heatCell, { weekday: vi.weekdayShort[weekdays[i]] || "", hour: hours[h], value: fmtInt(value) }) };
      }),
    })),
  };
  const days = arr(r.by_day);
  const bars = days.map(d => ({
    label: days.length <= 7 ? vi.weekdayShort[d.weekday ?? weekdayOf(d.date)] || DASH : String(Number(String(d.date).slice(8))),
    title: bucketTitle(d.date, "day", 1), value: toNum(d.uses) ?? 0, tip: fill(t.dayCell, { label: bucketTitle(d.date, "day", 1), value: fmtInt(d.uses) }),
  }));
  return {
    cards, heat, hasHeat: heat.rows.length > 0 && max > 0, bars, hasBars: bars.length > 0 && bars.some(b => b.value > 0),
    csv: { headers: ["Ngày", "Thứ", "Lượt"], rows: days.map(d => [d.date, d.weekday ?? "", d.uses ?? ""]) },
  };
}

// ---- Chất lượng & tốc độ ------------------------------------------------------------------
const OUTCOME_TONE = { completed: "good", completed_early: "good", failed: "bad", cancelled: "neutral", unconfirmed: "warn", abandoned: "warn" };
export function mapQuality(raw, ctx) {
  const q = vi.quality, r = obj(raw), c = obj(r.completion), s = obj(r.speed), compare = compareName(ctx.period), m = vi.metrics;
  const total = toNum(r.total_uses), attemptsTotal = toNum(r.attempts_total);
  const listRows = (items, dict, valueKey, tones) => {
    const rows = arr(items);
    const max = Math.max(0, ...rows.map(i => toNum(i[valueKey]) ?? 0));
    return rows.map(i => ({
      title: dict[i.key]?.[0] || i.key, desc: dict[i.key]?.[1] || "", tone: tones?.[i.key] || "warn",
      count: fmtInt(i[valueKey]), share: fmtPct(i.share_pct), bar: max ? (toNum(i[valueKey]) ?? 0) / max : 0,
    }));
  };
  return {
    completion: [
      metric(vi.metrics.completion_rate, fmtPct(c.rate), q.foot.rate, { delta: delta(c.rate_change_points, "points", compare) }),
      metric(m.first_try_rate, fmtPct(c.first_try_rate), q.foot.firstTry, { delta: delta(c.first_try_change_points, "points", compare) }),
      metric(m.avg_retries, fmtDec(c.avg_retries), q.foot.retries), metric(m.abandon_rate, fmtPct(c.abandon_rate), q.foot.abandon),
    ],
    speed: [metric(m.first_audio_p50, fmtMs(s.first_audio_p50_ms)), metric(m.first_audio_p90, fmtMs(s.first_audio_p90_ms)), metric(m.final_p50, fmtMs(s.final_result_p50_ms))],
    outcomes: { colShare: q.colShare, title: fill(q.outcomesTitle, { total: fmtInt(total) }), rows: listRows(r.outcomes, q.outcomes, "uses", OUTCOME_TONE) },
    attempts: { colShare: q.colShareAttempts, title: fill(q.attemptsTitle, { total: fmtInt(attemptsTotal) }), rows: listRows(r.attempts, q.attempts, "count") },
    csv: {
      headers: ["Nhóm", "Mục", "Số lượt", "Tỷ lệ (%)"],
      rows: [...arr(r.outcomes).map(o => ["Lượt sử dụng", q.outcomes[o.key]?.[0] || o.key, o.uses ?? "", o.share_pct ?? ""]), ...arr(r.attempts).map(o => ["Chỉ ghi nhận", q.attempts[o.key]?.[0] || o.key, o.count ?? "", o.share_pct ?? ""])],
    },
  };
}

// ---- Gắn bó -------------------------------------------------------------------------------
export function mapEngagement(raw) {
  const e = vi.engagement, r = obj(raw), m = vi.metrics;
  const days = arr(r.daily);
  const bars = days.map(d => ({
    label: bucketLabel(d.date, "day", days.length), title: bucketTitle(d.date, "day", 1), value: toNum(d.active_owners) ?? 0,
    tip: fill(e.cell, { label: bucketTitle(d.date, "day", 1), value: fmtInt(d.active_owners) }),
  }));
  return {
    cards: [
      metric(m.active_today, fmtInt(r.active_today), e.foot.active_today), metric(m.active_week, fmtInt(r.active_week), e.foot.active_week), metric(m.active_month, fmtInt(r.active_month), e.foot.active_month),
      metric(m.new_users, fmtInt(r.new_users), e.foot.new_users), metric(m.active_glasses, fmtFraction(r.active_glasses, r.total_glasses), e.foot.active_glasses),
      metric(m.avg_active_days, toNum(r.avg_active_days) === null ? DASH : `${fmtDec(r.avg_active_days)} / ${fmtInt(r.period_days)}`, e.foot.avg_active_days),
    ],
    bars, hasBars: bars.some(b => b.value > 0),
    csv: { headers: ["Ngày", "Chủ kính hoạt động"], rows: days.map(d => [d.date, d.active_owners ?? ""]) },
  };
}

// ---- An toàn ------------------------------------------------------------------------------
export function mapSafety(raw) {
  const sf = vi.safety, r = obj(raw), sos = obj(r.sos), live = obj(r.alert_live), m = vi.metrics;
  const levels = arr(live.levels).map(l => ({
    level: l.level, label: sf.levels[l.level] ?? String(l.level), share: toNum(l.share_pct) ?? 0, pct: fmtPct(l.share_pct), count: toNum(l.count),
    text: fill(sf.levelText, { label: sf.levels[l.level] ?? String(l.level), pct: fmtPct(l.share_pct) }),
  }));
  return {
    sos: [
      metric(m.sos_count, fmtInt(sos.count)),
      metric(m.sos_result, toNum(sos.success) === null && toNum(sos.failed) === null ? DASH : fill(sf.resultValue, { success: fmtInt(sos.success), failed: fmtInt(sos.failed) }),
        ratio(sos.success, (toNum(sos.success) ?? 0) + (toNum(sos.failed) ?? 0)) === null ? null : fill(sf.resultFoot, { pct: fmtPct(Math.round(ratio(sos.success, (toNum(sos.success) ?? 0) + (toNum(sos.failed) ?? 0)) * 100)) })),
      metric(m.sos_confirm, fmtDuration(sos.confirm_p50_seconds)), metric(m.sos_cancelled, fmtInt(sos.cancelled_within_5s)),
    ],
    live: [metric(m.sessions, fmtInt(live.sessions)), metric(m.total_on, fmtMinutes(live.total_on_seconds)), metric(m.alerts_hour, fmtInt(live.alerts_per_hour))],
    mode: live.alert_mode ? { code: live.alert_mode, label: sf.modes[live.alert_mode] || live.alert_mode } : null,
    levels, hasLevels: levels.some(l => l.share > 0),
    csv: {
      headers: ["Nhóm", "Chỉ số", "Giá trị"],
      rows: [["SOS", "Số lần", sos.count ?? ""], ["SOS", "Thành công", sos.success ?? ""], ["SOS", "Thất bại", sos.failed ?? ""], ["SOS", "Thời gian đến khi xác nhận (giây)", sos.confirm_p50_seconds ?? ""], ["SOS", "Bị hủy trong 5 giây", sos.cancelled_within_5s ?? ""],
        ["Cảnh báo vật cản live", "Số phiên", live.sessions ?? ""], ["Cảnh báo vật cản live", "Tổng thời gian bật (giây)", live.total_on_seconds ?? ""], ["Cảnh báo vật cản live", "Cảnh báo / giờ", live.alerts_per_hour ?? ""],
        ...arr(live.levels).map(l => ["Phân bố mức cảnh báo", sf.levels[l.level] ?? l.level, l.share_pct ?? ""])],
    },
  };
}
