const KEY = "seevia-theme";
const media = matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();

const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const currentTheme = () => document.documentElement.dataset.theme || "light";
function set(theme) { document.documentElement.dataset.theme = theme; listeners.forEach(fn => fn(theme)); }

// Theo hệ điều hành cho đến khi người dùng tự chọn.
export function initTheme() {
  set(stored() || (media.matches ? "dark" : "light"));
  media.addEventListener("change", e => { if (!stored()) set(e.matches ? "dark" : "light"); });
}
export function toggleTheme() {
  animateOnce();
  const next = currentTheme() === "dark" ? "light" : "dark";
  set(next);
  try { localStorage.setItem(KEY, next); } catch { /* bỏ qua */ }
}
export const onThemeChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };

// Hiệu ứng đổi màu chỉ chạy khi người dùng bấm, không chạy lúc tải trang.
function animateOnce() {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  setTimeout(() => root.classList.remove("theme-anim"), 320);
}
