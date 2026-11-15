import { vi, fill } from "../i18n/vi.js";
import { fmtInt, fmtPct, fmtDuration, fmtAxisSeconds, fmtDate, toNum, DASH, ratio, fmtDateTime, isoDay } from "../lib/format.js";
import { periodName, compareName } from "../core/period.js";
import { arr, obj, delta, bucketLabel, bucketTitle } from "./util.js";

function largestRemainder(values, total) {
  if (!total) return values.map(() => 0);
  const raw = values.map(v => (v / total) * 100), out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i] += 1; left -= 1; } });
  return out;
}

const SERIES = [
  { key: "uses", def: vi.metrics.uses, field: "uses", fmt: fmtInt, axis: fmtInt, csv: "Lượt sử dụng" },
  { key: "active_owners", def: vi.metrics.active_owners, field: "active_owners", fmt: fmtInt, axis: fmtInt, csv: "Chủ kính hoạt động" },
  { key: "completion_rate", def: vi.metrics.completion_rate, field: "completion_rate", fmt: fmtPct, axis: v => `${Math.round(v)}%`, csv: "Tỷ lệ hoàn thành (%)" },
  { key: "usage_seconds", def: vi.metrics.usage_time, field: "usage_seconds", fmt: fmtDuration, axis: fmtAxisSeconds, csv: "Thời gian sử dụng (giây)" },
];

function attentionText(item, ctx) {
  const o = vi.overview, compare = compareName(ctx.period);
  switch (item.type) {
    case "error_increase":
      return fill(o.attention.error_increase, {
        error: o.errorLabels[item.error_code] || item.error_code || DASH,
        feature: o.featureActions[item.feature] || item.feature || DASH, delta: fmtInt(item.delta), compare,
      });
    case "sos": return fill(o.attention.sos, { count: fmtInt(item.count), cancelled: fmtInt(item.cancelled) });
    case "device_offline": {
      const day = isoDay(item.since), hour = Number((String(item.since).match(/T(\d{2})/) || [])[1]);
      const yesterday = ctx.yesterday && day === ctx.yesterday;
      const since = yesterday && hour >= 18 ? o.sinceLastNight : fmtDateTime(item.since);
      return fill(o.attention.device_offline, { device: item.device_id || DASH, since });
    }
    default: return null;
  }
}
const attentionHref = item => (item.type === "error_increase" ? "#errors" : item.type === "sos" ? "#safety" : item.type === "device_offline" && item.device_id ? `#device-detail/${encodeURIComponent(item.device_id)}` : null);

export function mapOverview(raw, ctx) {
  const t = obj(raw?.totals), points = arr(raw?.series?.points), granularity = raw?.series?.granularity;
  const compare = compareName(ctx.period);
  const hasSeries = points.length > 0;
  const deltas = {
    uses: delta(t.uses_change_pct, "pct", compare), active_owners: delta(t.active_owners_change, "count", compare),
    completion_rate: delta(t.completion_rate_change_points, "points", compare), usage_seconds: delta(t.usage_seconds_change_pct, "pct", compare),
  };
  const tabs = SERIES.map(s => ({
    key: s.key, label: s.def.label, tip: s.def.tip,
    value: s.key === "usage_seconds" ? fmtDuration(t.usage_seconds) : s.key === "completion_rate" ? fmtPct(t.completion_rate) : fmtInt(t[s.field]),
    delta: deltas[s.key],
    foot: s.key === "usage_seconds" && toNum(t.usage_seconds_per_owner) !== null ? `${vi.metrics.usage_per_owner.label}: ${fmtDuration(t.usage_seconds_per_owner)}` : null,
  }));
  const series = Object.fromEntries(SERIES.map(s => [s.key, {
    unit: vi.overview.seriesLabel[s.key], fmtValue: s.fmt, fmtAxis: s.axis,
    points: points.map(p => ({
      label: bucketLabel(p.bucket, granularity, points.length), title: bucketTitle(p.bucket, granularity, points.length),
      current: toNum(p[s.field]), previous: toNum(p[`${s.field}_prev`]),
    })),
  }]));

  // Tổng kỳ = các nhóm + SOS; phần trăm làm tròn bằng phương pháp phần dư lớn nhất để cộng lại đúng 100%.
  const groupRows = arr(raw?.groups).map(g => ({ key: g.key, label: vi.groups[g.key] || g.key, uses: toNum(g.uses) ?? 0 }));
  const sos = toNum(raw?.sos_uses);
  if (sos !== null && sos > 0) groupRows.push({ key: "sos", label: vi.groups.sos, uses: sos });
  const groupTotal = toNum(t.uses) ?? groupRows.reduce((a, g) => a + g.uses, 0);
  const pcts = largestRemainder(groupRows.map(g => g.uses), groupTotal);

  const top = arr(raw?.top_features).map(f => ({ label: vi.features[f.key] || f.key, uses: toNum(f.uses) ?? 0, completion: fmtPct(f.completion_rate) }));
  const topMax = Math.max(...top.map(f => f.uses), 0);

  const attention = arr(raw?.attention).map(item => ({ text: attentionText(item, ctx), href: attentionHref(item) })).filter(a => a.text);

  return {
    summary: {
      subtitle: fill(vi.overview.compareTitle, { period: periodName(ctx.period), compare }),
      names: { current: periodName(ctx.period), previous: compare.charAt(0).toUpperCase() + compare.slice(1) }, tabs, series, hasSeries,
    },
    groups: {
      total: groupTotal > 0 ? fmtInt(groupTotal) : DASH,
      items: groupRows.map((g, i) => ({ ...g, share: ratio(g.uses, groupTotal), pct: groupTotal ? fmtPct(pcts[i]) : DASH })),
    },
    top: { rows: top.map(f => ({ ...f, usesText: fmtInt(f.uses), bar: topMax ? f.uses / topMax : 0 })) },
    attention,
    csv: {
      headers: ["Mốc thời gian", ...SERIES.flatMap(s => [s.csv, `${s.csv} · kỳ trước`])],
      rows: points.map(p => [p.bucket, ...SERIES.flatMap(s => [p[s.field] ?? "", p[`${s.field}_prev`] ?? ""])]),
    },
  };
}
