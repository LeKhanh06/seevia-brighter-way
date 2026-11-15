/*
 * Điểm vào: dựng khung, điều hướng theo hash, tải dữ liệu qua api → mappers → views.
 * View không biết dữ liệu đến từ mock hay API thật.
 */
import { CONFIG } from "./config.js";
import { h } from "./lib/dom.js";
import { vi } from "./i18n/vi.js";
import { api, ApiError, setUnauthorizedHandler } from "./api/client.js";
import { isSignedIn, setSession, clearSession, getUser, updateUser } from "./core/session.js";
import { parseHash, buildHash, go } from "./core/router.js";
import { resolvePeriod, rememberPeriod, periodName, compareName, periodFileTag, todayISO, addDays } from "./core/period.js";
import { initTheme, toggleTheme } from "./core/theme.js";
import { initTooltips } from "./core/tooltip.js";
import { downloadCsv, downloadBlob } from "./core/csv.js";
import { stagger, countUp } from "./core/motion.js";
import { ROUTES, apiQuery } from "./registry.js";
import { buildTopbar, buildSidebar, setActiveNav, pageHead } from "./views/shell.js";
import { skeletonPage, errorState } from "./views/components.js";
import { viewLogin } from "./views/admin.js";

const topbarHost = document.querySelector("#topbar");
const sidebarHost = document.querySelector("#sidebar");
const scrim = document.querySelector("#scrim");
const main = document.querySelector("#main");

let seq = 0;               // chỉ kết quả của lần tải mới nhất được vẽ
let current = null;        // {def, ctx, vm} của trang đang xem (cho Xuất CSV)
let topbar;
let lastValues = null;   // giá trị KPI lần trước của cùng một trang (để chuyển mượt khi đổi kỳ)

// ---- Khung ---------------------------------------------------------------------------------
function openMenu(open) {
  sidebarHost.classList.toggle("open", open);
  scrim.hidden = !open;
  topbar?.menu.setAttribute("aria-expanded", String(open));
  topbar?.menu.setAttribute("aria-label", open ? vi.nav.closeMenu : vi.nav.menu);
  if (open) sidebarHost.querySelector(".nav-link")?.focus();
}

async function logout() {
  try { await api.post("/admin/auth/logout", {}, { auth: false, retry: false, timeoutMs: 4000 }); } catch { /* vẫn đăng xuất phía trình duyệt */ }
  clearSession();
  openMenu(false);
  go("#login");
}

function mountChrome() {
  if (topbar) return;
  topbar = buildTopbar({ onToggleTheme: toggleTheme, onMenu: () => openMenu(!sidebarHost.classList.contains("open")), onLogout: logout, user: getUser() });
  topbarHost.replaceChildren(...topbar.el.childNodes);
  topbarHost.className = topbar.el.className;
  sidebarHost.replaceChildren(buildSidebar({ onLogout: logout }));
}

setUnauthorizedHandler(() => { openMenu(false); if (parseHash().id !== "login") go("#login"); });
scrim.addEventListener("click", () => openMenu(false));
document.addEventListener("keydown", e => { if (e.key === "Escape" && sidebarHost.classList.contains("open")) { openMenu(false); topbar?.menu.focus(); } });
matchMedia("(min-width: 1280px)").addEventListener("change", e => { if (e.matches) openMenu(false); });

// ---- Ngữ cảnh trang -------------------------------------------------------------------------
function makeCtx(route, def) {
  const period = def.period ? resolvePeriod(route.query) : null;
  const ctx = {
    logout,
    id: route.id, def, params: route.params, query: route.query, period, yesterday: addDays(todayISO(), -1),
    periodLabel: period ? { period: periodName(period), compare: compareName(period) } : null,
    // Đổi một phần tham số trong URL (lọc, sắp xếp, trang…). null = xóa tham số.
    setQuery(patch, { keepPage = false } = {}) {
      const q = new URLSearchParams(location.hash.split("?")[1] || "");
      for (const [k, v] of Object.entries(patch)) (v === null || v === undefined || v === "" ? q.delete(k) : q.set(k, String(v)));
      if (!keepPage && !("page" in patch)) q.delete("page");
      go(buildHash(route.id, route.params, Object.fromEntries(q)));
    },
  };
  return ctx;
}

// Trang theo kỳ luôn có kỳ trong URL để tải lại/chia sẻ link vẫn đúng.
function normalizeUrl(route, def) {
  if (!def?.period) return route;
  const p = resolvePeriod(route.query);
  const q = Object.fromEntries(route.query);
  if (q.period === p.period && (p.period !== "custom" || (q.from === p.from && q.to === p.to))) { rememberPeriod(p.period); return route; }
  const next = { ...q, period: p.period }; delete next.from; delete next.to;
  if (p.period === "custom") { next.from = p.from; next.to = p.to; }
  rememberPeriod(p.period);
  go(buildHash(route.id, route.params, next), { replace: true });
  return parseHash();
}

function onPeriodChange(route, value) {
  rememberPeriod(value);
  const q = Object.fromEntries(route.query);
  delete q.from; delete q.to; delete q.page;
  go(buildHash(route.id, route.params, { ...q, period: value }));
}

// ---- Tải + vẽ -------------------------------------------------------------------------------
function errorMessage(error) {
  const e = vi.states.errors;
  if (error instanceof ApiError) {
    if (error.kind === "network") return e.network;
    if (error.kind === "timeout") return e.timeout;
    if (error.status === 403) return e.forbidden;
    if (error.status === 404) return e.notFound;
    if (error.status >= 500) return e.server;
  }
  return e.generic;
}

async function renderPage({ soft = false } = {}) {
  const mine = ++seq;
  let route = parseHash();

  if (!isSignedIn() && route.id !== "login") { go("#login", { replace: true }); route = parseHash(); }
  else if (isSignedIn() && route.id === "login") { go("#overview", { replace: true }); route = parseHash(); }

  document.body.classList.toggle("is-login", route.id === "login");
  topbarHost.hidden = sidebarHost.hidden = route.id === "login";
  if (route.id === "login") return renderLogin();
  mountChrome();

  const def = ROUTES[route.id];
  if (!def) {
    document.title = `${vi.app.name} · ${vi.app.notFoundTitle}`;
    main.replaceChildren(h("div", { class: "card state" }, h("h1", null, vi.app.notFoundTitle), h("p", null, vi.states.notFoundMessage), h("a", { class: "button button-primary", href: "#overview" }, vi.states.backHome)));
    return;
  }
  route = normalizeUrl(route, def);
  const ctx = makeCtx(route, def);
  document.title = `${vi.app.name} · ${def.detail ? ctx.params[0] || vi.routes[def.id].title : vi.routes[def.id].title}`;
  setActiveNav(sidebarHost, def.id);
  openMenu(false);

  const focusedId = document.activeElement?.id;
  let body = main.querySelector("#page-body");
  if (!soft || !body) {
    body = h("div", { id: "page-body", class: "page-body" });
    main.replaceChildren(pageHead(def, ctx, { onPeriod: v => onPeriodChange(route, v), onExport: () => exportCsv() }), body);
    window.scrollTo(0, 0);
    body.append(skeletonPage(def.skeleton));
  } else body.setAttribute("aria-busy", "true");
  restoreFocus(focusedId);

  try {
    const raw = await api.get(def.endpoint(ctx), apiQuery(def, ctx), { group: "page" });
    if (mine !== seq) return;
    const vm = def.map(raw, ctx);
    if (def.id === "profile" && vm.user) { updateUser(vm.user); topbar?.setUser(vm.user); }
    current = { def, ctx, vm };
    const view = def.view(vm, ctx);
    body.replaceChildren(view);
    body.removeAttribute("aria-busy");
    if (!soft) {
      stagger(view);
      const same = lastValues?.id === def.id ? lastValues.map : null;
      lastValues = { id: def.id, map: countUp(view, same) };
    }
    restoreFocus(focusedId);
  } catch (error) {
    if (error instanceof ApiError && error.kind === "aborted") return;
    if (mine !== seq) return;
    current = null;
    body.replaceChildren(errorState({ message: errorMessage(error), onRetry: () => renderPage() }));
    body.removeAttribute("aria-busy");
  }
}

function restoreFocus(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el && el !== document.activeElement && /^(INPUT|SELECT|BUTTON)$/.test(el.tagName) && !el.disabled) {
    el.focus({ preventScroll: true });
    if (el.type === "search") el.setSelectionRange?.(el.value.length, el.value.length);
  }
}

// Lọc/sắp xếp/phân trang chỉ đổi query → tải lại phần thân, giữ nguyên tiêu đề và ô đang gõ.
let lastBase = "";
function onHashChange() {
  const route = parseHash();
  const base = `${route.id}/${route.params.join("/")}|${route.query.get("period") || ""}|${route.query.get("from") || ""}|${route.query.get("to") || ""}`;
  const def = ROUTES[route.id];
  const soft = Boolean(def?.list || def?.period) && base === lastBase && Boolean(main.querySelector("#page-body"));
  lastBase = base;
  renderPage({ soft });
}

// ---- Xuất CSV -------------------------------------------------------------------------------
async function exportCsv() {
  if (!current) return;
  const { def, ctx } = current;
  const button = document.querySelector("#export-csv");
  button.disabled = true;
  const tag = def.period ? periodFileTag(ctx.period) : todayISO();
  const filename = `seevia-${def.id}-${tag}.csv`;
  try {
    if (CONFIG.CSV_SERVER_EXPORT) {
      downloadBlob(filename, await api.getCsv(def.endpoint(ctx), apiQuery(def, ctx, { page: null }), { group: "export" }));
    } else if (def.list) {
      // Danh sách phân trang phía server: gom từng trang (tối đa 100 dòng/trang) rồi ghép lại.
      const first = current.vm.csv;
      const rows = [];
      let page = 1, total = Infinity;
      while (rows.length < total && page <= 200) {
        const raw = await api.get(def.endpoint(ctx), apiQuery(def, ctx, { page, pageSize: 100 }), { group: "export" });
        const vm = def.map(raw, ctx);
        rows.push(...vm.csv.rows);
        total = Number(raw?.total) || rows.length;
        if (!vm.csv.rows.length) break;
        page += 1;
      }
      downloadCsv(filename, first.headers, rows);
    } else {
      downloadCsv(filename, current.vm.csv.headers, current.vm.csv.rows);
    }
  } catch (error) {
    if (!(error instanceof ApiError && error.kind === "aborted")) alert(errorMessage(error));
  } finally { button.disabled = false; }
}

// ---- Đăng nhập ------------------------------------------------------------------------------
async function renderLogin() {
  document.title = `${vi.app.name} · ${vi.routes.login.title}`;
  const view = await viewLogin({
    async onSubmit(email, password) {
      try {
        const res = await api.post("/admin/auth/login", { email, password }, { auth: false, retry: false });
        setSession({ token: res.token, expiresIn: res.expires_in, user: res.user });
        go("#overview");
        return null;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return vi.login.invalid;
        if (error instanceof ApiError && (error.kind === "network" || error.kind === "timeout")) return vi.login.network;
        return vi.states.errors.generic;
      }
    },
  });
  main.replaceChildren(view);
  view.querySelector("input")?.focus();
}

// ---- Khởi động ------------------------------------------------------------------------------
initTheme();
initTooltips();
window.addEventListener("hashchange", onHashChange);
onHashChange();
if (isSignedIn() && !getUser()?.display_name) api.get("/admin/auth/me", undefined, { retry: false }).then(r => { updateUser(r.user); topbar?.setUser(r.user); }).catch(() => {});
