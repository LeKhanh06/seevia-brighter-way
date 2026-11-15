/*
 * Tooltip dùng chung: [data-tooltip] (chuỗi ngắn, cho biểu đồ) và nút .info-tip (tiêu đề "Tác dụng" + nội dung).
 * Hoạt động với chuột, bàn phím (focus) và cảm ứng (chạm để bật/tắt); Esc để đóng.
 */
import { h } from "../lib/dom.js";
import { vi } from "../i18n/vi.js";

export function initTooltips() {
  const tip = h("div", { class: "tooltip", role: "tooltip", id: "global-tooltip", hidden: true });
  document.body.append(tip);
  let owner = null;

  const hide = () => { tip.hidden = true; owner?.removeAttribute("aria-describedby"); owner = null; };
  function show(target) {
    const body = target.dataset.tooltip;
    if (!body) return;
    const use = target.dataset.tooltipUse;
    // Chỉ chuỗi thuần (textContent), không bao giờ nối phần tử DOM hay mảng thành chuỗi.
    const nodes = [];
    if (use === undefined) nodes.push(h("span", null, body));
    else {
      if (body) nodes.push(h("strong", null, vi.tooltip.how), h("span", null, body));
      if (use) nodes.push(h("strong", null, vi.tooltip.use), h("span", null, use));
    }
    tip.replaceChildren(...nodes);
    tip.hidden = false;
    owner?.removeAttribute("aria-describedby");
    owner = target; target.setAttribute("aria-describedby", tip.id);
    const box = target.getBoundingClientRect(), w = tip.offsetWidth, hgt = tip.offsetHeight;
    const left = Math.min(innerWidth - w - 8, Math.max(8, box.left + box.width / 2 - w / 2));
    const above = box.top - hgt - 10;
    tip.style.left = `${left}px`;
    tip.style.top = `${above >= 8 ? above : box.bottom + 10}px`;
  }
  const targetOf = e => e.target.closest?.("[data-tooltip]");

  document.addEventListener("pointerover", e => { if (e.pointerType !== "touch") { const t = targetOf(e); if (t) show(t); } });
  document.addEventListener("pointerout", e => { if (e.pointerType !== "touch" && targetOf(e)) hide(); });
  document.addEventListener("focusin", e => { const t = targetOf(e); if (t) show(t); });
  document.addEventListener("focusout", e => { if (targetOf(e)) hide(); });
  document.addEventListener("click", e => {
    const t = targetOf(e);
    if (t?.classList.contains("info-tip")) { owner === t && !tip.hidden ? hide() : show(t); } else if (!t) hide();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
  addEventListener("hashchange", hide);
  addEventListener("scroll", hide, true);
}
