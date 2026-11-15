/*
 * Hiệu ứng vào trang: xuất hiện lần lượt (tối đa 8 khối) và số KPI chạy từ giá trị cũ/0 đến giá trị mới.
 * Chỉ động vào class và nội dung chữ; toàn bộ thời gian/độ trễ chỉnh trong css/motion.css.
 * Tắt hoàn toàn khi người dùng bật prefers-reduced-motion.
 */
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOKEN = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
const COUNT_MS = 600;

const parse = t => {
  const frac = t.includes(",") ? t.split(",")[1].length : 0;
  return { value: Number(t.replace(/\./g, "").replace(",", ".")), frac, pad: !/[.,]/.test(t) && t.length > 1 && t.startsWith("0") ? t.length : 0 };
};
const render = (n, { frac, pad }) => {
  const s = n.toLocaleString("vi-VN", { minimumFractionDigits: frac, maximumFractionDigits: frac });
  return pad ? s.padStart(pad, "0") : s;
};

// Khối đầu tiên của trang hiện lần lượt cách nhau 40 ms (tối đa 8 khối).
export function stagger(root) {
  if (reduced()) return;
  const items = [];
  for (const child of root.children) {
    if (child.matches(".kpi-grid, .grid-2, .detail-grid")) items.push(...child.children); else items.push(child);
  }
  items.slice(0, 8).forEach((el, i) => { el.style.setProperty("--i", i); el.classList.add("enter-item"); });
}

// Chạy số cho các ô KPI. `previous` (Map khóa → chữ cũ) cho phép chuyển mượt khi đổi kỳ; trả về Map mới.
export function countUp(root, previous = null) {
  const next = new Map();
  const els = [...root.querySelectorAll(".kpi-value, .metric-value")];
  els.forEach((el, i) => {
    const label = el.closest(".kpi-card, .metric")?.querySelector(".label-text")?.textContent ?? "";
    const key = `${i}|${label}`;
    const finalText = el.textContent;
    next.set(key, finalText);
    if (reduced()) return;
    const to = finalText.match(TOKEN);
    if (!to) return;
    const from = previous?.get(key)?.match(TOKEN);
    const specs = to.map(parse);
    const starts = from && from.length === to.length ? from.map(t => parse(t).value) : to.map(() => 0);
    if (specs.every((s, k) => s.value === starts[k])) return;
    const parts = finalText.split(TOKEN);
    const duration = previous ? 400 : COUNT_MS;
    const t0 = performance.now();
    const frame = now => {
      const p = Math.min(1, (now - t0) / duration), e = 1 - (1 - p) ** 3;
      el.textContent = parts.map((txt, k) => txt + (k < specs.length ? (p === 1 ? to[k] : render(starts[k] + (specs[k].value - starts[k]) * e, specs[k])) : "")).join("");
      if (p < 1 && el.isConnected) requestAnimationFrame(frame); else el.textContent = finalText;
    };
    requestAnimationFrame(frame);
  });
  return next;
}
