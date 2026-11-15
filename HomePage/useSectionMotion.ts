import { useEffect } from "react";

/** Cập nhật --sp cho hai section; useHomeMotion xử lý hiệu ứng chữ. */
export default function useSectionMotion() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const secs = Array.from(document.querySelectorAll<HTMLElement>(".experience, #partnership"));

    let raf = 0;
    const tick = () => {
      raf = 0;
      if (motion.matches) return;
      const vh = innerHeight;
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        s.style.setProperty("--sp", Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(4));
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, []);
}
