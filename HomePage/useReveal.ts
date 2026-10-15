import { useEffect } from "react";

export default function useReveal() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main > section:not(.hero) > :not(svg):not(.radar-field), .footer-main",
      ),
    );
    let observer: IntersectionObserver | undefined;
    const clear = () => {
      observer?.disconnect();
      elements.forEach((el) => el.classList.remove("reveal-pending"));
    };
    const setup = () => {
      clear();
      if (motion.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("reveal-pending");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
      );
      elements.forEach((el) => {
        if (el.getBoundingClientRect().top > innerHeight) {
          el.classList.add("reveal-target", "reveal-pending");
          observer!.observe(el);
        }
      });
    };
    setup();
    motion.addEventListener("change", setup);
    const onFocus = (e: FocusEvent) => {
      elements.forEach((el) => {
        if (el.contains(e.target as Node))
          el.classList.remove("reveal-pending");
      });
    };
    document.addEventListener("focusin", onFocus);
    return () => {
      clear();
      motion.removeEventListener("change", setup);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);
}
