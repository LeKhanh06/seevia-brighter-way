/* Trang quản trị chỉ xem: Lỗi hệ thống, Tài khoản, Thiết bị, chi tiết, Cấu hình — và Đăng nhập. */
import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { vi } from "../i18n/vi.js";
import { dataTable, pager, searchBox, selectChip, section, statusDot, emptyState } from "./components.js";
import { CONFIG } from "../config.js";

const link = (href, label) => h("a", { class: "table-link", href }, label);
const toolbar = (...c) => h("div", { class: "toolbar" }, ...c);

// Bấm lại cột đang sắp xếp thì đảo chiều; cột mới bắt đầu tăng dần. Tham số gửi lên API (server sắp xếp).
function sorter(vm, ctx) {
  return key => ctx.setQuery({ sort: key, order: vm.page.sort === key && vm.page.order === "asc" ? "desc" : "asc", page: null });
}
const sortState = vm => (vm.page.sort ? { key: vm.page.sort, order: vm.page.order } : null);
const pagerOf = (vm, ctx) => pager({ ...vm.page, onPage: p => ctx.setQuery({ page: p === 1 ? null : p }, { keepPage: true }) });

export function viewErrors(vm, ctx) {
  const e = vi.errors, f = vm.filters;
  return h("div", { class: "stack-y" },
    toolbar(
      selectChip({ id: "f-group", label: e.filterGroup, value: f.group, options: f.groups, onChange: v => ctx.setQuery({ group: v === "all" ? null : v, page: null }) }),
      f.firmwares ? selectChip({ id: "f-firmware", label: e.filterFirmware, value: f.firmware, options: f.firmwares, onChange: v => ctx.setQuery({ firmware_version: v === "all" ? null : v, page: null }) }) : null),
    section({ cls: "flush", id: "er-table" },
      dataTable({
        caption: vi.routes.errors.title, columns: vm.columns, sort: sortState(vm), onSort: sorter(vm, ctx),
        rows: vm.rows.map(r => [r.code, r.feature, r.group, r.count, { text: r.change, tone: r.tone }, r.last]),
      }), pagerOf(vm, ctx)));
}

export function viewAccounts(vm, ctx) {
  const a = vi.accounts, f = vm.filters;
  return h("div", { class: "stack-y" },
    toolbar(
      searchBox({ id: "q-accounts", label: a.searchLabel, placeholder: a.searchPlaceholder, value: f.q, onSearch: v => ctx.setQuery({ q: v || null, page: null }) }),
      selectChip({ id: "f-status", label: a.statusLabel, value: f.status, options: f.statuses, onChange: v => ctx.setQuery({ status: v === "all" ? null : v, page: null }) })),
    section({ cls: "flush", id: "ac-table" },
      dataTable({
        caption: vi.routes.accounts.title, columns: vm.columns, sort: sortState(vm), onSort: sorter(vm, ctx),
        rows: vm.rows.map(r => [link(`#account-detail/${encodeURIComponent(r.id)}`, r.id), r.email, r.created, { node: statusDot(r.status) }, r.glasses]),
      }), pagerOf(vm, ctx)));
}

// Thẻ thông tin: lưới đều, nhãn nhỏ + giá trị cỡ thông tin; email dài cắt bằng "…" và có tooltip.
const fieldsPanel = fields => h("section", { class: "card panel info-card" },
  h("dl", { class: "info-grid" }, fields.map(f => h("div", { class: "info-item" },
    h("dt", null, f.label),
    h("dd", null,
      f.chip ? statusDot(f.chip, "chip")
        : f.ellipsis ? h("span", { class: "ellipsis", tabindex: "0", dataset: { tooltip: f.value, tooltipUse: "" } }, f.value)
          : f.href ? h("a", { href: f.href }, f.value) : f.value)))));

export function viewAccountDetail(vm) {
  const a = vi.accounts;
  return h("div", { class: "stack-y" }, fieldsPanel(vm.fields),
    h("h2", { class: "section-title" }, a.linkedTitle),
    section({ cls: "flush", id: "ad-glasses" }, dataTable({
      caption: a.linkedTitle, emptyText: a.linkedEmpty,
      columns: [{ key: "id", label: a.linkedCols.id }, { key: "fw", label: a.linkedCols.firmware }, { key: "st", label: a.linkedCols.status }, { key: "last", label: a.linkedCols.last }],
      rows: vm.glasses.map(g => [link(`#device-detail/${encodeURIComponent(g.id)}`, g.id), g.firmware, { node: statusDot(g.status) }, g.last]),
    })));
}

export function viewDevices(vm, ctx) {
  const d = vi.devices, f = vm.filters;
  return h("div", { class: "stack-y" },
    toolbar(
      searchBox({ id: "q-devices", label: d.searchLabel, placeholder: d.searchPlaceholder, value: f.q, onSearch: v => ctx.setQuery({ q: v || null, page: null }) }),
      selectChip({ id: "f-dstatus", label: d.statusLabel, value: f.status, options: f.statuses, onChange: v => ctx.setQuery({ status: v === "all" ? null : v, page: null }) }),
      f.firmwares ? selectChip({ id: "f-dfirmware", label: d.firmwareLabel, value: f.firmware, options: f.firmwares, onChange: v => ctx.setQuery({ firmware_version: v === "all" ? null : v, page: null }) }) : null),
    section({ cls: "flush", id: "dv-table" },
      dataTable({
        caption: vi.routes.devices.title, columns: vm.columns, sort: sortState(vm), onSort: sorter(vm, ctx),
        rows: vm.rows.map(r => [link(`#device-detail/${encodeURIComponent(r.id)}`, r.id), r.firmware, { node: statusDot(r.status) }, r.last, r.account]),
      }), pagerOf(vm, ctx)));
}

export function viewDeviceDetail(vm) {
  const d = vi.devices;
  return h("div", { class: "stack-y" }, fieldsPanel(vm.fields),
    h("h2", { class: "section-title" }, d.recentTitle),
    section({ cls: "flush", id: "dd-errors" }, dataTable({
      caption: d.recentTitle, emptyText: d.recentEmpty,
      columns: [{ key: "c", label: d.recentCols.code }, { key: "f", label: d.recentCols.feature }, { key: "t", label: d.recentCols.at }],
      rows: vm.errors.map(e => [e.code, e.feature, e.at]),
    })));
}

export function viewConfig(vm) {
  const c = vi.config;
  return h("div", { class: "stack-y" }, h("div", { class: "section-row" }, h("h2", { class: "section-title" }, c.adminTitle), h("a", { class: "link-arrow", href: "#profile" }, vi.profile.seeProfile, icon("arrow-up-right", { size: 16 }))),
    section({ cls: "flush", id: "cf-table" }, dataTable({
      caption: c.adminTitle,
      columns: [{ key: "e", label: c.cols.email }, { key: "c", label: c.cols.created }, { key: "l", label: c.cols.lastLogin }],
      rows: vm.rows.map(r => [r.email, r.created, r.lastLogin]),
    })));
}

// ---- Đăng nhập ------------------------------------------------------------------------------
export async function viewLogin({ onSubmit }) {
  const l = vi.login;
  const error = h("p", { class: "form-error", role: "alert", id: "login-error", hidden: true });
  const email = h("input", { id: "login-email", name: "email", type: "email", autocomplete: "username", required: true, placeholder: l.emailPlaceholder });
  const password = h("input", { id: "login-password", name: "password", type: "password", autocomplete: "current-password", required: true });
  const submit = h("button", { class: "button button-primary button-block", type: "submit" }, l.submit);
  let hint = null;
  if (CONFIG.USE_MOCK) {
    const { MOCK_CREDENTIALS: c } = await import("../api/mock/data.js");
    hint = h("p", { class: "panel-note" }, l.mockHint.replace("{email}", c.email).replace("{password}", c.password));
  }
  const form = h("form", { class: "card login-card", novalidate: false, onSubmit: async e => {
    e.preventDefault();
    error.hidden = true; submit.disabled = true; submit.textContent = l.submitting;
    const message = await onSubmit(email.value.trim(), password.value);
    password.value = "";
    submit.disabled = false; submit.textContent = l.submit;
    if (message) { error.textContent = message; error.hidden = false; password.focus(); }
  } },
  h("img", { class: "login-logo", src: new URL("../../assets/seevia-logo.png", import.meta.url).href, alt: vi.app.name }),
  h("h1", null, l.title), h("p", { class: "login-sub" }, l.subtitle),
  h("label", { for: "login-email" }, l.email), email,
  h("label", { for: "login-password" }, l.password), password,
  error, submit, hint);
  return h("div", { class: "login-shell" }, form);
}

// ---- Hồ sơ quản trị viên (chỉ xem) ----------------------------------------------------------
export function viewProfile(vm, ctx) {
  const p = vi.profile;
  if (!vm.found) return emptyState();
  return h("div", { class: "profile-page stack-y" },
    h("section", { class: "card profile-header" },
      h("span", { class: "avatar avatar-xl", "aria-hidden": "true" }, vm.initial),
      h("div", { class: "profile-id" }, h("h2", null, vm.name), h("p", { class: "profile-email" }, vm.email),
        h("div", { class: "chips" }, vm.chips.map(c => h("span", { class: ["chip", `chip-${c.tone}`] }, c.label)))),
      h("button", { class: "button button-outline button-sm", type: "button", onClick: ctx.logout }, icon("logout", { size: 16 }), p.logout)),
    h("section", { class: "card panel profile-info", "aria-labelledby": "pf-info" },
      h("h2", { id: "pf-info", class: "profile-info-title" }, p.infoTitle),
      h("dl", { class: "info-rows" }, vm.rows.map(r => h("div", { class: "info-row" }, h("dt", null, r.label), h("dd", null, r.value))))));
}
