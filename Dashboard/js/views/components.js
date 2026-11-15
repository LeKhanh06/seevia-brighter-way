/* Thành phần giao diện dùng chung. Chỉ nhận dữ liệu đã chuẩn hóa từ mapper và dựng DOM. */
import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { vi, fill } from "../i18n/vi.js";

// ---- Nhãn chỉ số + tooltip "Tác dụng" ------------------------------------------------------
// tip: { how, use } (Cách tính / Tác dụng) hoặc chuỗi.
export const tipButton = tip => {
  const t = typeof tip === "string" ? { how: tip } : tip;
  const label = [t.how && `${vi.tooltip.how}: ${t.how}`, t.use && `${vi.tooltip.use}: ${t.use}`].filter(Boolean).join(" ");
  return h("button", { class: "info-tip", type: "button", "aria-label": label, dataset: { tooltip: t.how || "", tooltipUse: t.use || "" } }, icon("info", { size: 15 }));
};

export const estimateTag = () => h("span", { class: "tag tag-estimate", dataset: { tooltip: vi.report.estimateTip } }, vi.report.estimate);

export function labelRow(m, cls = "kpi-label") {
  return h("div", { class: cls }, h("span", { class: "label-text" }, m.label), m.tip ? tipButton(m.tip) : null, m.estimate ? estimateTag() : null);
}

// "▲ 8% so với tuần trước" (biểu tượng + chữ, không chỉ dựa vào màu).
export function deltaLine(d) {
  if (!d) return null;
  return h("div", { class: ["delta", `delta-${d.dir}`] }, icon(d.dir === "down" ? "tri-down" : d.dir === "up" ? "tri-up" : "dash", { size: 12 }), h("b", null, d.text), h("span", null, ` ${d.suffix}`));
}

export function kpiCard(m) {
  return h("article", { class: "card kpi-card" },
    labelRow(m), h("div", { class: "kpi-value" }, m.value), deltaLine(m.delta), m.foot ? h("div", { class: "kpi-foot" }, m.foot) : null);
}
export const kpiGrid = (cards, cols = 3) => h("div", { class: ["kpi-grid", `cols-${cols}`] }, cards.map(kpiCard));

// Chỉ số nằm trong thẻ lớn (nhãn nhỏ, số đậm).
export function metricBlock(m, cls = "") {
  return h("div", { class: ["metric", cls] }, labelRow(m, "metric-label"), h("div", { class: "metric-value" }, m.value), deltaLine(m.delta), m.foot ? h("div", { class: "metric-foot" }, m.foot) : null);
}
export const metricGrid = (metrics, cls = "") => h("div", { class: ["metric-grid", cls], style: { "--n": metrics.length } }, metrics.map(m => metricBlock(m)));

export function section({ title, subtitle, id, cls = "", headExtra, tip }, ...children) {
  return h("section", { class: ["card", "panel", cls], "aria-labelledby": id },
    title ? h("header", { class: "panel-head" }, h("div", null, h("h2", { id }, title, tip ? tipButton(tip) : null), subtitle ? h("p", { class: "panel-sub" }, subtitle) : null), headExtra || null) : null,
    ...children);
}

export const notice = message => h("div", { class: "notice", role: "note" }, icon("alert", { size: 18 }), h("span", null, message));
export const badge = (label, tone = "accent") => h("span", { class: ["badge", `badge-${tone}`] }, label);
export const statusDot = ({ label, tone }, variant = "") => h("span", { class: ["status", `status-${tone}`, variant && `status-${variant}`] }, h("i", { class: "status-dot", "aria-hidden": "true" }), h("span", null, label));

// ---- Trạng thái rỗng / lỗi / đang tải -------------------------------------------------------
export function emptyState(message = vi.states.emptyMessage) {
  return h("div", { class: "state state-empty", role: "status" }, icon("inbox", { size: 28 }), h("p", null, message));
}
export function errorState({ message, onRetry }) {
  return h("div", { class: "state state-error card", role: "alert" },
    icon("alert", { size: 30 }), h("h2", null, vi.states.errorTitle), h("p", null, message),
    onRetry ? h("button", { class: "button button-primary", type: "button", onClick: onRetry }, icon("refresh", { size: 16 }), vi.states.retry) : null);
}

const sk = (cls = "") => h("div", { class: ["skeleton", cls], "aria-hidden": "true" });
const skCard = (h2 = 96) => h("div", { class: "card skeleton-card", style: { "--h": `${h2}px` } }, sk("sk-line sk-short"), sk("sk-line sk-value"), sk("sk-line sk-mid"));
export function skeletonPage(kind = "cards3") {
  const wrap = (...c) => h("div", { class: "skeleton-page", role: "status", "aria-busy": "true", "aria-live": "polite" }, h("span", { class: "sr-only" }, vi.states.loading), ...c);
  const block = hgt => h("div", { class: "card skeleton-card", style: { "--h": `${hgt}px` } }, sk("sk-line sk-mid"), sk("sk-block"));
  switch (kind) {
    case "cards6": return wrap(h("div", { class: "kpi-grid cols-3" }, Array.from({ length: 6 }, () => skCard())), block(240));
    case "overview": return wrap(block(400), h("div", { class: "grid-2" }, block(240), block(240)), block(180));
    case "list": return wrap(h("div", { class: "toolbar" }, sk("sk-chip sk-wide"), sk("sk-chip")), block(240));
    case "detail": return wrap(block(120), block(160));
    case "charts": return wrap(h("div", { class: "kpi-grid cols-3" }, Array.from({ length: 3 }, () => skCard())), block(240), block(240));
    default: return wrap(h("div", { class: "kpi-grid cols-3" }, Array.from({ length: 3 }, () => skCard())), block(200), block(200));
  }
}

// ---- Bảng ----------------------------------------------------------------------------------
// cells: chuỗi | Node | { text, bar (0–1), tone }. Chỉ cột đang sắp xếp mới hiện biểu tượng sắp xếp.
export function dataTable({ columns, rows, caption, sort, onSort, emptyText = vi.states.emptyList }) {
  if (!rows.length) return emptyState(emptyText);
  const th = col => {
    const active = col.sortable && sort?.key === col.key;
    const ariaSort = active ? (sort.order === "desc" ? "descending" : "ascending") : (col.sortable ? "none" : null);
    const label = col.tip ? h("span", { class: "th-inner" }, col.label, tipButton(col.tip)) : col.label;
    return h("th", { scope: "col", class: [col.align === "end" ? "num" : "", active ? "is-sorted" : ""], aria: ariaSort ? { sort: ariaSort } : null },
      col.sortable
        ? h("button", { class: "sort-button", type: "button", "aria-label": fill(vi.table.sortBy, { label: col.label }), onClick: () => onSort?.(col.key) },
          h("span", null, col.label), active ? icon(sort.order === "desc" ? "chevron-down" : "chevron-up", { size: 14 }) : null)
        : label);
  };
  const cell = (c, col) => {
    const spec = c !== null && typeof c === "object" && !(c instanceof Node) ? c : { text: c };
    return h("td", { class: [col.align === "end" ? "num" : "", spec.bar !== undefined ? "has-bar" : "", spec.tone ? `tone-${spec.tone}` : ""], style: spec.bar !== undefined ? { "--bar": `${Math.round(spec.bar * 100)}%` } : null },
      spec.node ?? spec.text);
  };
  return h("div", { class: "table-scroll", tabindex: "0", role: "region", "aria-label": caption }, h("table", { class: "data-table" },
    h("caption", { class: "sr-only" }, caption),
    h("thead", null, h("tr", null, columns.map(th))),
    h("tbody", null, rows.map(r => h("tr", null, r.map((c, i) => cell(c, columns[i])))))));
}

export function pager({ page, pages, total, pageSize, onPage }) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1, to = Math.min(total, page * pageSize);
  return h("nav", { class: "pager", "aria-label": "Phân trang" },
    h("span", { class: "pager-info" }, fill(vi.table.range, { from, to, total })),
    h("button", { class: "icon-button", type: "button", disabled: page <= 1, "aria-label": vi.table.prev, onClick: () => onPage(page - 1) }, icon("chevron-left", { size: 18 })),
    h("button", { class: "icon-button", type: "button", disabled: page >= pages, "aria-label": vi.table.next, onClick: () => onPage(page + 1) }, icon("chevron-right", { size: 18 })));
}

// ---- Điều khiển bộ lọc ---------------------------------------------------------------------
export function searchBox({ id, label, placeholder, value, onSearch }) {
  const input = h("input", { id, type: "search", class: "search-input", value: value || "", placeholder, autocomplete: "off", spellcheck: "false", "aria-label": label });
  let timer;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => onSearch(input.value.trim()), 350); });
  input.addEventListener("keydown", e => { if (e.key === "Enter") { clearTimeout(timer); onSearch(input.value.trim()); } });
  return h("label", { class: "search-box", for: id }, icon("search", { size: 18 }), input);
}

// Hộp chọn dạng "Nhãn: Giá trị" — chỉ một mũi tên xổ xuống.
export function selectChip({ id, label, value, options, onChange }) {
  const select = h("select", { id, class: "select-native", onChange: e => onChange(e.target.value) },
    options.map(o => h("option", { value: o.value, selected: o.value === value }, o.label)));
  return h("div", { class: "select-chip" }, h("label", { for: id }, `${label}:`), select, icon("chevron-down", { size: 16, cls: "select-caret" }));
}
