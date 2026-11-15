/* Trang Tổng quan, 4 trang chức năng, Cộng đồng & Thiết bị, Thời điểm, Chất lượng, Gắn bó, An toàn. */
import { h, fragment } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { vi, fill } from "../i18n/vi.js";
import { lineChart, barChart, heatmap, donut, stackedBar } from "./charts.js";
import { tipButton, kpiGrid, metricBlock, metricGrid, section, notice, badge, emptyState, labelRow, deltaLine, dataTable, statusDot } from "./components.js";

const seeAll = (href, label) => h("div", { class: "panel-foot" }, h("a", { class: "link-arrow", href }, label, icon("arrow-up-right", { size: 16 })));

// ---- Tổng quan ------------------------------------------------------------------------------
export function viewOverview(vm) {
  const o = vi.overview;
  let active = "uses";
  const host = h("div", { class: "chart-host" });
  const tabs = h("div", { class: "tab-metrics", role: "group", "aria-label": o.usageTitle });

  const draw = () => {
    const names = vm.summary.names;
    host.replaceChildren(vm.summary.hasSeries
      ? lineChart({ series: vm.summary.series[active], names, ariaLabel: fill(o.chartAria, { metric: vm.summary.tabs.find(t => t.key === active).label, current: names.current, previous: names.previous }) })
      : emptyState());
    tabs.querySelectorAll(".tab-metric").forEach(el => {
      const on = el.dataset.key === active;
      el.classList.toggle("is-active", on);
      el.querySelector(".metric-select").setAttribute("aria-pressed", String(on));
    });
  };
  vm.summary.tabs.forEach(t => {
    const select = () => { active = t.key; draw(); };
    const el = h("div", { class: "metric tab-metric", dataset: { key: t.key }, onClick: e => { if (!e.target.closest(".info-tip")) select(); } },
      labelRow(t, "metric-label"),
      h("button", { class: "metric-select", type: "button", "aria-pressed": "false" }, h("span", { class: "metric-value" }, t.value), deltaLine(t.delta), t.foot ? h("span", { class: "metric-foot" }, t.foot) : null));
    tabs.append(el);
  });
  draw();

  const summary = section({ title: o.usageTitle, subtitle: vm.summary.subtitle, id: "ov-usage", cls: "overview-summary" }, tabs, host, seeAll("#quality", o.seeQuality));

  const groups = section({ title: o.groupsTitle, subtitle: o.groupsSub, id: "ov-groups", cls: "fill" },
    donut({ items: vm.groups.items, total: vm.groups.total, centerUnit: o.total, ariaLabel: o.groupsTitle }),
    seeAll("#see-read", o.seeGroup));

  const topRows = vm.top.rows.map(r => [r.label, { text: r.usesText, bar: r.bar }, r.completion]);
  const top = section({ title: o.topTitle, subtitle: o.topSub, id: "ov-top", cls: "fill" },
    dataTable({ caption: o.topTitle, columns: [{ key: "f", label: o.colFeature }, { key: "u", label: o.colUses, align: "end" }, { key: "c", label: o.colCompletion, align: "end" }], rows: topRows }),
    seeAll("#see-read", o.seeAllFeatures));

  const attention = section({ title: o.attentionTitle, subtitle: o.attentionSub, id: "ov-attn" },
    vm.attention.length
      ? h("ul", { class: "attention-list" }, vm.attention.map(a => h("li", null, icon("alert", { size: 18, cls: "tone-warn" }), h("span", null, a.text), a.href ? h("a", { href: a.href }, vi.common.view) : null)))
      : emptyState(o.attentionEmpty),
    seeAll("#errors", o.seeErrors));

  return h("div", { class: "stack-y" }, summary, h("div", { class: "grid-2" }, groups, top), attention);
}

// ---- 4 trang chức năng ----------------------------------------------------------------------
const dagger = () => h("sup", { class: "dagger", "aria-label": "thử nghiệm có kiểm soát", dataset: { tooltip: vi.report.experimentalNote } }, vi.report.experimentalMark);

export function viewReport(vm, ctx) {
  const r = vi.report;
  const nameCell = f => h("span", null, f.name, f.experimental ? [" ", dagger()] : null);
  const table = section({ cls: "flush", id: "rp-table" },
    dataTable({
      caption: vi.routes[ctx.def.id].title,
      columns: [
        { key: "f", label: vi.metrics.col_feature.label, tip: vi.metrics.col_feature.tip }, { key: "u", label: vi.metrics.col_uses.label, tip: vi.metrics.col_uses.tip },
        { key: "c", label: vi.metrics.col_completion.label, tip: vi.metrics.col_completion.tip }, { key: "a", label: vi.metrics.col_first_audio.label, tip: vi.metrics.col_first_audio.tip },
        { key: "e", label: vi.metrics.col_errors.label, tip: vi.metrics.col_errors.tip },
      ],
      rows: vm.features.map(f => [nameCell(f), f.row.uses, f.row.completion, f.row.firstAudio, f.row.errors]),
    }));
  const details = h("div", { class: "detail-grid" }, vm.features.map(f => h("section", { class: "card detail-card" },
    h("h3", null, f.name, f.experimental ? [" ", dagger()] : null),
    h("div", { class: "metric-grid detail-metrics" }, f.metrics.map(m => metricBlock(m))), f.note ? h("p", { class: "panel-note" }, f.note) : null)));
  return h("div", { class: "stack-y" },
    kpiGrid(vm.cards, 3), table,
    h("h2", { class: "section-title" }, r.detailsTitle), details,
    vm.footnote ? h("p", { class: "footnote" }, vm.footnote) : null,
    vm.connectLink ? h("p", { class: "footnote" }, r.connectNote.before, h("a", { href: "#safety" }, r.connectNote.link), r.connectNote.after) : null);
}

export const viewCommunity = vm => h("div", { class: "stack-y" }, kpiGrid(vm.cards, 3));

// ---- Thời điểm ------------------------------------------------------------------------------
export function viewTime(vm) {
  const t = vi.time;
  return h("div", { class: "stack-y" },
    kpiGrid(vm.cards, 3),
    section({ title: t.heatTitle, tip: vi.sectionTips.heat, id: "tm-heat" }, vm.hasHeat ? heatmap({ heat: vm.heat, ariaLabel: t.heatTitle }) : emptyState()),
    section({ title: t.dayTitle, tip: vi.sectionTips.byDay, id: "tm-day" }, vm.hasBars ? barChart({ bars: vm.bars, ariaLabel: t.dayTitle, valueHeader: t.dayTable.uses }) : emptyState()));
}

// ---- Chất lượng & tốc độ --------------------------------------------------------------------
function outcomeTable(group, caption) {
  const q = vi.quality;
  return dataTable({
    caption, columns: [{ key: "s", label: q.colState }, { key: "n", label: q.colCount, align: "end" }, { key: "r", label: group.colShare, align: "end" }],
    rows: group.rows.map(r => [
      { node: h("div", { class: "outcome" }, h("i", { class: `status-dot tone-bg-${r.tone}`, "aria-hidden": "true" }), h("div", null, h("strong", null, r.title), h("span", { class: "outcome-desc" }, r.desc))) },
      { text: r.count, bar: r.bar }, r.share]),
  });
}
export function viewQuality(vm, ctx) {
  const q = vi.quality, period = ctx.periodLabel;
  return h("div", { class: "stack-y" },
    section({ title: q.completionTitle, subtitle: fill(q.completionSub, period), id: "q-comp" }, metricGrid(vm.completion, "cols-4")),
    section({ title: q.speedTitle, subtitle: q.speedSub, id: "q-speed" }, metricGrid(vm.speed, "cols-3")),
    h("div", { class: "grid-2" },
      section({ title: vm.outcomes.title, tip: vi.sectionTips.outcomes, id: "q-out", cls: "fill" }, vm.outcomes.rows.length ? outcomeTable(vm.outcomes, vm.outcomes.title) : emptyState()),
      section({ title: vm.attempts.title, tip: vi.sectionTips.attempts, id: "q-att", cls: "fill" }, vm.attempts.rows.length ? outcomeTable(vm.attempts, vm.attempts.title) : emptyState())));
}

// ---- Gắn bó ---------------------------------------------------------------------------------
export function viewEngagement(vm) {
  const e = vi.engagement;
  return h("div", { class: "stack-y" }, kpiGrid(vm.cards, 3),
    section({ title: e.chartTitle, tip: vi.sectionTips.engagement, id: "en-chart" }, vm.hasBars ? barChart({ bars: vm.bars, ariaLabel: e.chartTitle, valueHeader: e.columnOwners }) : emptyState()));
}

// ---- An toàn --------------------------------------------------------------------------------
export function viewSafety(vm) {
  const sf = vi.safety;
  const live = section({
    title: sf.liveTitle, id: "sf-live",
    headExtra: vm.mode ? h("div", { class: "mode-tag" }, h("code", null, sf.modeLabel), badge(vm.mode.label, "warn")) : null,
  }, metricGrid(vm.live, "cols-3"),
  h("h3", { class: "sub-title" }, sf.distributionTitle, tipButton(vi.sectionTips.levels)),
  vm.hasLevels ? stackedBar({ levels: vm.levels, ariaLabel: sf.distributionTitle }) : emptyState());
  return h("div", { class: "stack-y" },
    section({ title: sf.sosTitle, id: "sf-sos", cls: "panel-sos" }, metricGrid(vm.sos, "cols-4")), live);
}
