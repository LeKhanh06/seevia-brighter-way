import { useEffect } from "react";
export default function useTechnologyReveal() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".technology-page .tech-section h2, .technology-page .tech-flow-grid article, .technology-page .tech-processing-grid article, .technology-page .tech-closeup, .technology-page .tech-chat, .technology-page .tech-transparency .tech-container",
      ),
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("tech-hidden");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    function clear() {
      observer.disconnect();
      elements.forEach((el) => el.classList.remove("tech-hidden"));
    }
    if (!motion.matches)
      elements.forEach((el, i) => {
        if (el.getBoundingClientRect().top > innerHeight) {
          el.classList.add("tech-reveal", "tech-hidden");
          el.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`);
          observer.observe(el);
        }
      });
    motion.addEventListener("change", clear);
    const focus = (e: FocusEvent) =>
      elements.forEach((el) => {
        if (el.contains(e.target as Node)) el.classList.remove("tech-hidden");
      });
    document.addEventListener("focusin", focus);
    return () => {
      clear();
      motion.removeEventListener("change", clear);
      document.removeEventListener("focusin", focus);
    };
  }, []);
}
