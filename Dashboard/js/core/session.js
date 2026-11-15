/*
 * Phiên đăng nhập: token giữ trong bộ nhớ và sessionStorage (đóng tab là mất).
 * Mật khẩu không bao giờ được lưu. Hết hạn → isSignedIn() trả false và router đưa về #login.
 */
const KEY = "seevia-session";
let memory = null;

function read() {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(KEY);
    memory = raw ? JSON.parse(raw) : null;
  } catch { memory = null; }
  return memory;
}

export function setSession({ token, expiresIn, user }) {
  memory = { token, user: user || null, expiresAt: expiresIn ? Date.now() + Number(expiresIn) * 1000 : null };
  try { sessionStorage.setItem(KEY, JSON.stringify(memory)); } catch { /* sessionStorage bị chặn: vẫn dùng bộ nhớ */ }
}

export function clearSession() {
  memory = null;
  try { sessionStorage.removeItem(KEY); } catch { /* bỏ qua */ }
}

export function getSession() {
  const s = read();
  if (s?.expiresAt && Date.now() >= s.expiresAt) { clearSession(); return null; }
  return s;
}
export const getToken = () => getSession()?.token ?? null;
export const isSignedIn = () => Boolean(getToken());
export const getUser = () => getSession()?.user ?? null;
export function updateUser(user) { const s = read(); if (s) { s.user = user; setSession({ token: s.token, user, expiresIn: s.expiresAt ? (s.expiresAt - Date.now()) / 1000 : null }); } }
