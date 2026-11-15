import { useEffect } from "react";

/**
 * Engine chuyển động cho Homepage (không phụ thuộc thư viện):
 *  1. Reveal theo từng loại phần tử (words / mask / clip / left / right / zoom / line / rise), có so le.
 *  2. Tiến trình cuộn --sp (0→1) trên từng section + parallax nhiều lớp qua --py (dùng `translate`).
 *  3. Con trỏ: parallax hero (--mx/--my) và đèn pha iridescent trên thẻ khả năng.
 * Chỉ động vào transform/opacity/CSS variables. Tắt hoàn toàn khi prefers-reduced-motion.
 */
const DEFAULT =
  "main > section:not(.hero) > :not(svg):not(.radar-field):not(.journey):not(.sv-fx):not(.sv-ribbon):not([data-sv-curve]):not(.capability-grid)";

// [selector, kiểu reveal, luôn ẩn-rồi-hiện kể cả khi đã nằm trong khung nhìn]
const MAP: [string, string, boolean?][] = [
  [".experience .eyebrow", "rise"],
  [".experience h2", "words"],
  [".experience-copy", "rise"],
  [".partnership > :not(.journey):not(.sv-fx):not([data-sv-curve])", "rise"],
];

// [selector, độ sâu parallax theo chiều cao màn hình] — âm = ngược chiều cuộn
const DEPTH: [string, number][] = [
  [".experience h2", -0.05], [".experience-copy", 0.04],
];

function splitWords(el: HTMLElement) {
  if (el.dataset.split) return;
  el.dataset.split = "1";
  let n = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((c) => {
      if (c.nodeType === 3) {
        const text = c.textContent || "";
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return void frag.append(part);
          const w = document.createElement("span");
          const i = document.createElement("span");
          w.className = "sv-w";
          i.style.setProperty("--wi", String(n++));
          i.textContent = part;
          w.append(i);
          frag.append(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && (c as Element).tagName !== "BR") walk(c);
    });
  };
  walk(el);
}

export default function useReveal() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};

    const setup = () => {
      cleanup();
      if (motion.matches) return;
      const cl: (() => void)[] = [];
      const targets = new Set<HTMLElement>();
      const always = new Set<HTMLElement>();
      const timers: number[] = [];

      document.querySelectorAll<HTMLElement>(DEFAULT).forEach((el, i) => {
        el.dataset.rv = "rise";
        el.style.setProperty("--rv-i", String(i % 4));
        targets.add(el);
      });
      MAP.forEach(([sel, kind, force]) =>
        document.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
          el.dataset.rv = kind;
          el.style.setProperty("--rv-i", String(i));
          if (kind === "words") splitWords(el);
          targets.add(el);
          if (force || kind === "words") always.add(el);
        }),
      );

      // ---- reveal ----
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            el.classList.remove("rv-pending");
            io.unobserve(el);
            timers.push(window.setTimeout(() => el.classList.add("rv-done"), 2200));
          }),
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
      );
      targets.forEach((el) => {
        if (always.has(el) || el.getBoundingClientRect().top > innerHeight) {
          el.classList.add("rv-pending");
          io.observe(el);
        } else el.classList.add("rv-done");
      });
      const onFocus = (e: FocusEvent) =>
        targets.forEach((el) => el.contains(e.target as Node) && el.classList.remove("rv-pending"));
      document.addEventListener("focusin", onFocus);

      // ---- cuộn: tiến trình section + parallax ----
      const secs = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
      const layers: { el: HTMLElement; d: number; sec: HTMLElement | null }[] = [];
      DEPTH.forEach(([sel, d]) =>
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          el.setAttribute("data-depth", "");
          layers.push({ el, d, sec: el.closest("main > section") });
        }),
      );
      let raf = 0;
      const tick = () => {
        raf = 0;
        const vh = innerHeight, k = innerWidth < 760 ? 0.4 : 1;
        secs.forEach((s) => {
          const r = s.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
          s.style.setProperty("--sp", p.toFixed(4));
          layers.forEach((l) => l.sec === s && l.el.style.setProperty("--py", `${((p - 0.5) * l.d * vh * k).toFixed(1)}px`));
        });
      };
      const queue = () => { if (!raf) raf = requestAnimationFrame(tick); };
      addEventListener("scroll", queue, { passive: true });
      addEventListener("resize", queue);
      tick();

      // ---- con trỏ ----
      const hero = document.querySelector<HTMLElement>(".hero");
      const onHero = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || !hero) return;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
        hero.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5) * 2));
      };
      hero?.addEventListener("pointermove", onHero);
      const onCard = (e: PointerEvent) => {
        const c = (e.target as HTMLElement).closest<HTMLElement>(".capability");
        if (!c) return;
        const r = c.getBoundingClientRect();
        c.style.setProperty("--cx", `${e.clientX - r.left}px`);
        c.style.setProperty("--cy", `${e.clientY - r.top}px`);
      };
      document.addEventListener("pointermove", onCard, { passive: true });

      cleanup = () => {
        io.disconnect();
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        document.removeEventListener("focusin", onFocus);
        removeEventListener("scroll", queue);
        removeEventListener("resize", queue);
        hero?.removeEventListener("pointermove", onHero);
        document.removeEventListener("pointermove", onCard);
        targets.forEach((el) => el.classList.remove("rv-pending", "rv-done"));
        cl.forEach((f) => f());
        cleanup = () => {};
      };
    };

    setup();
    motion.addEventListener("change", setup);
    return () => { motion.removeEventListener("change", setup); cleanup(); };
  }, []);
}
