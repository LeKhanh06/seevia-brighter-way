/* Khung trang: thanh trên, thanh bên, tiêu đề trang (tiêu đề trái; chọn kỳ + Xuất CSV phải). */
import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { vi } from "../i18n/vi.js";
import { rangeText, rangeFor } from "../core/period.js";
import { NAV_ORDER, ROUTES } from "../registry.js";
import { currentTheme, onThemeChange } from "../core/theme.js";
import { CONFIG } from "../config.js";
import { initialOf } from "../lib/format.js";

const logoUrl = new URL("../../assets/seevia-logo.png", import.meta.url).href;

export function themeButton(onToggle) {
  const btn = h("button", { class: "icon-button theme-toggle", type: "button", onClick: onToggle });
  const sync = () => {
    const dark = currentTheme() === "dark";
    const label = dark ? vi.header.themeToLight : vi.header.themeToDark;
    btn.replaceChildren(icon(dark ? "sun" : "moon", { size: 20 }));
    btn.setAttribute("aria-label", label);
    btn.dataset.tooltip = label;
  };
  sync();
  return { el: btn, sync };
}

// Menu thả xuống của avatar: bàn phím (↑ ↓ Home End Enter Esc Tab), đóng khi bấm ra ngoài.
function accountMenu({ user, onLogout }) {
  const name = h("div", { class: "menu-name" }), email = h("div", { class: "menu-email" });
  const avatar = h("span", { class: "avatar", "aria-hidden": "true" });
  const menuAvatar = h("span", { class: "avatar", "aria-hidden": "true" });
  const button = h("button", { class: "avatar-button", type: "button", "aria-haspopup": "menu", "aria-expanded": "false", "aria-controls": "account-menu", "aria-label": vi.menu.open }, avatar);
  const items = [
    h("a", { class: "menu-item", role: "menuitem", tabindex: "-1", href: "#profile" }, icon("accounts", { size: 18 }), vi.menu.profile),
    h("button", { class: "menu-item", type: "button", role: "menuitem", tabindex: "-1", onClick: () => { close(false); onLogout(); } }, icon("logout", { size: 18 }), vi.menu.logout),
  ];
  const menu = h("div", { class: "menu", id: "account-menu", role: "menu", hidden: true, "aria-label": vi.menu.open }, h("div", { class: "menu-head" }, menuAvatar, h("div", { class: "menu-who" }, name, email)), h("div", { class: "menu-sep", role: "separator" }), ...items);
  const wrap = h("div", { class: "menu-wrap" }, button, menu);

  const setUser = u => { name.textContent = u?.display_name || vi.app.admin; email.textContent = u?.email_masked || ""; avatar.textContent = menuAvatar.textContent = initialOf(u); };
  const isOpen = () => !menu.hidden;
  function open() { menu.hidden = false; void menu.offsetWidth; menu.classList.add("is-open"); button.setAttribute("aria-expanded", "true"); items[0].focus(); }
  function close(restore = true) {
    if (!isOpen()) return;
    menu.classList.remove("is-open"); button.setAttribute("aria-expanded", "false");
    setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 150);
    if (restore) button.focus();
  }
  button.addEventListener("click", () => (isOpen() ? close() : open()));
  button.addEventListener("keydown", e => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!isOpen()) open(); } });
  menu.addEventListener("keydown", e => {
    const i = items.indexOf(document.activeElement);
    const move = n => { e.preventDefault(); items[(n + items.length) % items.length].focus(); };
    if (e.key === "ArrowDown") move(i + 1); else if (e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0); else if (e.key === "End") move(items.length - 1);
    else if (e.key === "Escape") { e.preventDefault(); close(); } else if (e.key === "Tab") close(false);
  });
  items[0].addEventListener("click", () => close(false));
  document.addEventListener("click", e => { if (isOpen() && !wrap.contains(e.target)) close(false); });
  addEventListener("hashchange", () => close(false));
  setUser(user);
  return { el: wrap, setUser };
}

export function buildTopbar({ onToggleTheme, onMenu, onLogout, user }) {
  const theme = themeButton(onToggleTheme);
  onThemeChange(theme.sync);
  const menu = h("button", { class: "icon-button menu-button", type: "button", "aria-controls": "sidebar", "aria-expanded": "false", "aria-label": vi.nav.menu, onClick: onMenu }, icon("menu", { size: 22 }));
  const account = accountMenu({ user, onLogout });
  const el = h("header", { class: "topbar" }, menu,
    h("a", { class: "brand", href: "#overview", "aria-label": `${vi.app.name} ${vi.app.admin} — ${vi.routes.overview.title}` }, h("img", { src: logoUrl, alt: vi.app.name, height: 40 }), h("span", null, vi.app.admin)),
    h("div", { class: "topbar-actions" }, theme.el, account.el));
  return { el, setUser: account.setUser, menu };
}

export function buildSidebar({ onLogout }) {
  const items = [];
  let group;
  for (const id of NAV_ORDER) {
    const def = ROUTES[id];
    if (def.group !== group) {
      group = def.group;
      if (group) items.push(h("li", { class: "nav-heading", "aria-hidden": "true" }, vi.nav.groups[group]));
    }
    items.push(h("li", null, h("a", { class: "nav-link", href: `#${id}`, dataset: { route: id } }, icon(def.icon, { size: 20, cls: "nav-icon" }), h("span", null, vi.routes[id].title))));
  }
  return h("nav", { "aria-label": vi.nav.label },
    h("ul", { class: "nav-list" }, h("span", { class: "nav-indicator", "aria-hidden": "true" }), items),
    h("button", { class: "nav-link nav-logout", type: "button", onClick: onLogout }, icon("logout", { size: 20, cls: "nav-icon" }), h("span", null, vi.nav.logout)),
    CONFIG.USE_MOCK ? h("div", { class: "mock-tag" }, vi.mockTag) : null);
}

export function setActiveNav(root, id) {
  const active = ROUTES[id]?.parent || id;
  let current = null;
  root.querySelectorAll("[data-route]").forEach(a => { if (a.dataset.route === active) { a.setAttribute("aria-current", "page"); current = a; } else a.removeAttribute("aria-current"); });
  // Thanh chỉ báo trượt tới mục active (lần đầu đặt thẳng vào vị trí, không chạy hiệu ứng).
  const bar = root.querySelector(".nav-indicator");
  if (!bar) return;
  if (!current) { bar.style.opacity = "0"; return; }
  bar.style.opacity = "1";
  bar.style.height = `${current.offsetHeight}px`;
  bar.style.transform = `translateY(${current.offsetTop}px)`;
  if (!bar.dataset.ready) requestAnimationFrame(() => { bar.dataset.ready = "1"; });
}

function periodSelect(ctx, onPeriod) {
  const p = ctx.period;
  const optionKeys = ["today", "week", "month"];
  const options = optionKeys.map(k => h("option", { value: k, selected: p.period === k }, `${vi.periods[k]} ${rangeText(rangeFor(k))}`));
  if (p.period === "custom") options.push(h("option", { value: "custom", selected: true }, `${vi.periods.custom} ${rangeText(p)}`));
  return h("div", { class: "period-select" }, icon("calendar", { size: 18 }),
    h("span", { class: "period-text" }, `${vi.periods[p.period]} `, h("b", null, rangeText(p))),
    icon("chevron-down", { size: 16, cls: "select-caret" }),
    h("select", { id: "period-select", class: "period-native", "aria-label": vi.header.periodLabel, onChange: e => onPeriod(e.target.value) }, options));
}

export function pageHead(def, ctx, { onPeriod, onExport }) {
  const route = vi.routes[def.id] || { title: vi.app.notFoundTitle };
  const parent = def.parent && vi.routes[def.parent];
  const crumb = (href, label) => [h("a", { href }, label), icon("chevron-right", { size: 14 })];
  const breadcrumb = def.detail ? h("nav", { class: "breadcrumb", "aria-label": "Đường dẫn" }, crumb(`#${def.parent}`, parent.title), h("span", { "aria-current": "page" }, ctx.params[0] || ""))
    : def.id === "profile" ? h("nav", { class: "breadcrumb", "aria-label": vi.profile.breadcrumb }, crumb("#overview", vi.routes.overview.title), h("span", { "aria-current": "page" }, route.title)) : null;
  const title = def.detail ? ctx.params[0] || route.title : route.title;
  const actions = [];
  if (def.period) actions.push(periodSelect(ctx, onPeriod));
  if (def.export) actions.push(h("button", { class: "button button-outline export-button", type: "button", id: "export-csv", onClick: onExport }, icon("download", { size: 18 }), h("span", null, vi.header.exportCsv)));
  return h("div", { class: "page-head" },
    h("div", { class: "page-title" }, breadcrumb,
      h("h1", null, def.dot ? h("i", { class: `title-dot cat-${def.dot}`, "aria-hidden": "true" }) : null, h("span", null, title), route.badge ? h("span", { class: `badge badge-core cat-${def.dot || 1}` }, route.badge) : null),
      route.subtitle ? h("p", null, route.subtitle) : null),
    actions.length ? h("div", { class: "page-actions" }, ...actions) : null);
}
