import { useEffect } from "react";
import "./SiteMotion.css";

export default function SiteMotion() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    // Animate content, never section wrappers that contain sticky layouts.
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main h2, main h3, main figure, main .ab-evidence-story, main .cp-story-image, main .np-row-image, main .tech-closeup-photo, main .technology-cards article, main .ct-form, main .pt-direction, main .pt-step",
      ),
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.classList.remove("site-motion-pending");
            observer.unobserve(target);
          }
        }),
      { threshold: 0.05 },
    );
    const reveal = () =>
      elements.forEach((element) =>
        element.classList.remove("site-motion-pending"),
      );
    const setup = () => {
      observer.disconnect();
      reveal();
      if (motion.matches) return;
      elements.forEach((element) => {
        if (element.matches("figure, .cp-story-image, .np-row-image")) {
          element.classList.add("site-motion-media");
        }
        // Existing page reveals already animate these elements and ancestors.
        if (
          element.closest(
            ".reveal-pending, .ab-pending, .cp-pending, .np-pending, .pt-pending, .site-motion-pending",
          ) ||
          getComputedStyle(element).position === "sticky"
        )
          return;
        if (element.getBoundingClientRect().top > innerHeight) {
          const siblings = Array.from(element.parentElement?.children ?? []);
          element.style.setProperty(
            "--motion-delay",
            `${Math.min(siblings.indexOf(element), 3) * 65}ms`,
          );
          element.classList.add("site-motion-target", "site-motion-pending");
          observer.observe(element);
        }
      });
    };
    setup();
    motion.addEventListener("change", setup);
    document.addEventListener("focusin", reveal);
    const onHash = () => {
      reveal();
      requestAnimationFrame(() => {
        const id = decodeURIComponent(location.hash.slice(1));
        if (id) document.getElementById(id)?.scrollIntoView();
      });
    };
    window.addEventListener("hashchange", onHash);
    if (location.hash) onHash();
    return () => {
      observer.disconnect();
      reveal();
      motion.removeEventListener("change", setup);
      document.removeEventListener("focusin", reveal);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  return null;
}
