import { useEffect, useLayoutEffect } from "react";
import Lenis from "lenis";
import { navigateTo, pageOrder } from "../navigation";
import "./SiteMotion.css";

function normalizedPath(path: string) {
  return new URL(path, window.location.href).pathname.replace(/\/$/, "") || "/";
}

export default function SiteMotion({ routeKey }: { routeKey: string }) {
  useLayoutEffect(() => {
    if (routeKey === "/") return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [routeKey]);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    // Animate content, never section wrappers that contain sticky layouts.
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main h2, main h3, main article, main figure, main .ab-evidence-story, main .cp-story-image, main .np-row-image, main .tech-closeup-photo, main .technology-cards article, main .ct-form, main .ct-note, main .pt-direction, main .pt-step",
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
        // The homepage headings and sections use their own GSAP timelines.
        if (routeKey === "/") return;
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
  }, [routeKey]);

  useEffect(() => {
    let touchStart: {
      x: number;
      y: number;
      time: number;
      target: EventTarget | null;
    } | null = null;
    const ignoredSwipeTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return true;
      if (
        target.closest(
          "a,button,input,textarea,select,summary,label,[role='button'],[role='link'],[role='dialog'],dialog,[contenteditable='true'],.sv-support,.scene3d,.radar-field,canvas,header,footer,[data-page-swipe-ignore]",
        )
      )
        return true;
      for (let node: Element | null = target; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (
          /(auto|scroll)/.test(style.overflowX) &&
          node.scrollWidth > node.clientWidth + 12
        )
          return true;
      }
      return false;
    };
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchStart = null;
        return;
      }
      const touch = event.touches[0];
      if (
        touch.clientX < 28 ||
        touch.clientX > innerWidth - 28 ||
        ignoredSwipeTarget(event.target) ||
        !(event.target as Element | null)?.closest("main")
      ) {
        touchStart = null;
        return;
      }
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: performance.now(),
        target: event.target,
      };
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (
        !touchStart ||
        event.changedTouches.length !== 1 ||
        ignoredSwipeTarget(touchStart.target)
      ) {
        touchStart = null;
        return;
      }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const elapsed = performance.now() - touchStart.time;
      touchStart = null;
      if (Math.abs(dx) < 96 || Math.abs(dy) > 72 || elapsed > 850) return;
      const current = pageOrder.findIndex(
        (path) => normalizedPath(path) === normalizedPath(location.pathname),
      );
      const next = current + (dx < 0 ? 1 : -1);
      if (current >= 0 && next >= 0 && next < pageOrder.length)
        navigateTo(pageOrder[next]);
    };
    const onTouchCancel = () => {
      touchStart = null;
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  return null;
}
