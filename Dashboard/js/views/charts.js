/*
 * Biểu đồ SVG/HTML tự vẽ. Chỉ dùng biến màu CSS (qua class), chữ trục luôn ≥ 12px thật
 * vì SVG được vẽ theo bề rộng pixel của khung chứa và vẽ lại khi đổi kích thước.
 */
import { h, s } from "../lib/dom.js";
import { vi, fill } from "../i18n/vi.js";
import { emptyState } from "./components.js";

export const CHART_HEIGHT = 240;

// Khung biểu đồ tự vẽ lại theo bề rộng; dừng quan sát khi bị gỡ khỏi trang.
function responsive(draw, height = CHART_HEIGHT) {
  const box = h("div", { class: "chart-box", style: { height: `${height}px` } });
  let last = 0;
  const paint = () => {
    const width = Math.floor(box.clientWidth);
    if (!width || width === last) return;
    last = width;
    const svg = draw(width, height);
    if (!box.dataset.drawn) { box.dataset.drawn = "1"; svg.classList.add("is-entering"); }   // hiệu ứng vẽ chỉ chạy lần đầu
    box.replaceChildren(svg);
  };
  const ro = new ResizeObserver(() => { if (!box.isConnected && last) { ro.disconnect(); return; } paint(); });
  ro.observe(box);
  queueMicrotask(paint);
  return box;
}

function niceScale(max) {
  if (!(max > 0)) return { max: 3, step: 1 };
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const m of [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10]) {
    const step = m * pow;
    if (Math.ceil(max / step - 1e-9) <= 4 && Math.ceil(max / step - 1e-9) >= 3) return { max: step * Math.ceil(max / step - 1e-9), step };
  }
  const step = pow * 2;
  return { max: Math.ceil(max / step) * step, step };
}

// Bảng số liệu: thu vào nút "Xem bảng số liệu" (trình đọc màn hình vẫn đọc được).
export function tableToggle({ caption, headers, rows }) {
  return h("details", { class: "chart-data" },
    h("summary", { class: "button button-ghost" }, vi.chart.viewTable),
    h("div", { class: "table-scroll", tabindex: "0", role: "region", "aria-label": caption }, h("table", { class: "data-table compact" },
      h("caption", { class: "sr-only" }, caption),
      h("thead", null, h("tr", null, headers.map((t, i) => h("th", { scope: "col", class: i ? "num" : "" }, t)))),
      h("tbody", null, rows.map(r => h("tr", null, r.map((c, i) => (i ? h("td", { class: "num" }, c) : h("th", { scope: "row" }, c)))))))));
}

// ---- Biểu đồ đường (Tổng quan): kỳ này + kỳ trước (nét đứt) -------------------------------
export function lineChart({ series, names, ariaLabel }) {
  const pts = series.points;
  if (!pts.length || !pts.some(p => p.current !== null)) return emptyState(vi.chart.noData);

  const legend = h("div", { class: "legend" },
    h("span", { class: "legend-item" }, h("i", { class: "legend-line current" }), names.current),
    h("span", { class: "legend-item" }, h("i", { class: "legend-line previous" }), names.previous));

  const box = responsive((W, H) => {
    const L = 48, R = 14, T = 14, B = 30, plotW = W - L - R, plotH = H - T - B;
    const values = pts.flatMap(p => [p.current, p.previous]).filter(v => v !== null);
    const { max, step } = niceScale(Math.max(...values, 0));
    const x = i => (pts.length === 1 ? L + plotW / 2 : L + (plotW * i) / (pts.length - 1));
    const y = v => T + plotH * (1 - v / max);
    const path = key => {
      let d = "", pen = false;
      pts.forEach((p, i) => { const v = p[key]; if (v === null) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `; pen = true; });
      return d.trim();
    };
    const grid = [], ticks = [];
    for (let v = 0; v <= max + 1e-9; v += step) {
      grid.push(s("line", { class: "grid-line", x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      ticks.push(s("text", { class: "axis-text", x: L - 8, y: y(v) + 4, "text-anchor": "end" }, series.fmtAxis(v)));
    }
    const every = Math.max(1, Math.ceil(pts.length / Math.max(1, Math.floor(plotW / 40))));
    const xlabels = pts.map((p, i) => (i % every === 0 ? s("text", { class: "axis-text", x: x(i), y: H - 8, "text-anchor": "middle" }, p.label) : null));
    const dots = pts.map((p, i) => {
      if (p.current === null) return null;
      const tip = `${p.title}: ${series.fmtValue(p.current)}${p.previous !== null ? ` · ${names.previous}: ${series.fmtValue(p.previous)}` : ""}`;
      return s("circle", { class: "chart-dot", cx: x(i), cy: y(p.current), r: pts.length > 14 ? 3.5 : 5, tabindex: 0, role: "img", "aria-label": tip, dataset: { tooltip: tip } });
    });
    const first = pts.findIndex(p => p.current !== null);
    const lastIdx = pts.length - 1 - [...pts].reverse().findIndex(p => p.current !== null);
    const area = `${path("current")} L${x(lastIdx).toFixed(1)} ${y(0)} L${x(first).toFixed(1)} ${y(0)} Z`;
    return s("svg", { class: "chart-svg", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "group", "aria-label": ariaLabel },
      grid, ticks, s("path", { class: "chart-area", d: area }), pts.some(p => p.previous !== null) ? s("path", { class: "chart-line-prev", d: path("previous") }) : null,
      s("path", { class: "chart-line", d: path("current"), pathLength: 1 }), dots, xlabels);
  });

  const table = tableToggle({
    caption: ariaLabel, headers: [vi.time.dayTable.day, names.current, names.previous],
    rows: pts.map(p => [p.title, p.current === null ? "—" : series.fmtValue(p.current), p.previous === null ? "—" : series.fmtValue(p.previous)]),
  });
  return h("div", { class: "chart-wrap" }, legend, box, table);
}

// ---- Biểu đồ cột (Gắn bó, Thời điểm) -----------------------------------------------------
export function barChart({ bars, ariaLabel, valueHeader, dayHeader = vi.time.dayTable.day }) {
  if (!bars.length) return emptyState(vi.chart.noData);
  const peak = bars.reduce((best, b, i) => (b.value > bars[best].value ? i : best), 0);
  const box = responsive((W, H) => {
    const L = 8, R = 8, T = 30, B = 30, plotW = W - L - R, base = H - B, plotH = base - T;
    const max = Math.max(...bars.map(b => b.value), 1);
    const slot = plotW / bars.length, bw = Math.max(4, Math.min(56, slot * 0.46));
    const grid = [0, 1, 2, 3].map(k => s("line", { class: "grid-line", x1: L, x2: W - R, y1: base - (plotH * k) / 3 + (k === 0 ? 0 : 0), y2: base - (plotH * k) / 3 }));
    const every = Math.max(1, Math.ceil(bars.length / Math.max(1, Math.floor(plotW / 30))));
    const showValues = slot >= 26;
    const items = bars.map((b, i) => {
      const bh = b.value > 0 ? Math.max(3, (b.value / max) * plotH) : 0, cx = L + slot * i + slot / 2;
      return s("g", null,
        bh ? s("rect", { class: ["chart-bar", i === peak ? "is-peak" : ""], x: cx - bw / 2, y: base - bh, width: bw, height: bh, rx: Math.min(10, bw / 2), tabindex: 0, role: "img", "aria-label": b.tip, dataset: { tooltip: b.tip }, style: { "--i": i } }) : null,
        showValues ? s("text", { class: "bar-value", x: cx, y: base - bh - 8, "text-anchor": "middle" }, String(b.value)) : null,
        i % every === 0 ? s("text", { class: "axis-text", x: cx, y: H - 8, "text-anchor": "middle" }, b.label) : null);
    });
    return s("svg", { class: "chart-svg", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "group", "aria-label": ariaLabel }, grid, items);
  });
  const table = tableToggle({ caption: ariaLabel, headers: [dayHeader, valueHeader], rows: bars.map(b => [b.title, b.value]) });
  return h("div", { class: "chart-wrap" }, box, table);
}

// ---- Heatmap giờ × thứ ---------------------------------------------------------------------
export function heatmap({ heat, ariaLabel }) {
  const axis = new Set([0, 6, 12, 18, 23]);
  const head = h("div", { class: "heat-row heat-head" }, h("span", { class: "heat-label" }),
    heat.hours.map(hr => h("span", { class: "heat-hour" }, axis.has(hr) ? `${hr}h` : "")));
  const rows = heat.rows.map(r => h("div", { class: "heat-row" }, h("span", { class: "heat-label" }, r.label),
    r.cells.map(c => h("span", { class: "heat-cell", style: { "--a": (0.07 + c.level * 0.93).toFixed(3) }, dataset: { tooltip: c.tip }, "aria-label": c.tip }))));
  const grid = h("div", { class: "heat-scroll" }, h("div", { class: "heatmap", role: "img", "aria-label": ariaLabel }, head, rows));
  const scale = h("div", { class: "heat-scale", "aria-hidden": "true" }, h("span", null, "0"), h("i", { class: "heat-ramp" }), h("span", null, String(heat.max)));
  const table = tableToggle({
    caption: ariaLabel, headers: [vi.time.hourColumn, ...heat.rows.map(r => r.label)],
    rows: heat.hours.map((hr, i) => [`${hr}h`, ...heat.rows.map(r => r.cells[i]?.value ?? 0)]),
  });
  return h("div", { class: "chart-wrap" }, grid, scale, table);
}

// ---- Donut (Tổng quan: theo nhóm chức năng) ----------------------------------------------
export function donut({ items, total, centerUnit, ariaLabel }) {
  const sum = items.reduce((a, i) => a + i.uses, 0);
  const R = 70, C = 92;
  let offset = 0;
  const segs = sum ? items.map((it, idx) => {
    const len = (it.uses / sum) * 100;
    const el = s("circle", {
      class: `donut-seg cat-${idx + 1}`, cx: C, cy: C, r: R, pathLength: 100, "stroke-dasharray": `${len} ${100 - len}`, "stroke-dashoffset": -offset,
      tabindex: 0, role: "img", "aria-label": `${it.label}: ${it.pct}`, dataset: { tooltip: `${it.label}: ${it.uses} ${vi.chart.uses} (${it.pct})` },
    });
    offset += len;
    return el;
  }) : [s("circle", { class: "donut-empty", cx: C, cy: C, r: R })];
  const svg = s("svg", { class: "donut-svg", viewBox: "0 0 184 184", role: "group", "aria-label": ariaLabel },
    s("g", { transform: `rotate(-90 ${C} ${C})` }, segs),
    s("text", { class: "donut-total", x: C, y: C + 2, "text-anchor": "middle" }, total),
    s("text", { class: "donut-unit", x: C, y: C + 22, "text-anchor": "middle" }, centerUnit));
  const legend = h("ul", { class: "donut-legend" }, items.map((it, idx) => h("li", null, h("span", { class: "legend-item" }, h("i", { class: `swatch cat-${idx + 1}` }), it.label), h("strong", null, it.pct))));
  return h("div", { class: "donut-row" }, svg, legend);
}

// ---- Thanh xếp chồng (An toàn: phân bố mức cảnh báo) --------------------------------------
export function stackedBar({ levels, ariaLabel }) {
  const bar = h("div", { class: "stack-bar", role: "img", "aria-label": `${ariaLabel}: ${levels.map(l => l.text).join(", ")}` },
    levels.filter(l => l.share > 0).map(l => h("span", { class: `stack-seg lvl-${l.level}`, style: { "--w": `${l.share}%` }, dataset: { tooltip: l.text } })));
  const legend = h("ul", { class: "stack-legend" }, levels.map(l => h("li", { class: "legend-item" }, h("i", { class: `swatch lvl-${l.level}` }), l.text)));
  return h("div", { class: "stack" }, bar, legend);
}
