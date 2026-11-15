/*
 * Định tuyến theo hash:  #route/tham-số?khóa=giá-trị
 * Ví dụ: #overview?period=week · #account-detail/TK-0001 · #accounts?q=tk&page=2
 */
export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  const [id, ...params] = pathPart.split("/").filter(Boolean).map(part => { try { return decodeURIComponent(part); } catch { return part; } });
  return { id: id || "overview", params, query: new URLSearchParams(queryPart) };
}

export function buildHash(id, params = [], query = {}) {
  const path = [id, ...params.map(encodeURIComponent)].join("/");
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined && v !== "") q.set(k, String(v));
  const qs = q.toString();
  return `#${path}${qs ? `?${qs}` : ""}`;
}

// Đổi hash. replace = true thì không thêm mục vào lịch sử (dùng khi chuẩn hóa URL).
export function go(hash, { replace = false } = {}) {
  if (replace) history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
  else location.hash = hash;
}
