import { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { beforeLanguageChange, useLanguage } from "../i18n/language";
import { splitHeading } from "./wordReveal";
import { navigateTo, pageOrder } from "../navigation";
import { createProgressGlitter } from "./progressGlitter";
import "./SiteMotion.css";

function normalizedPath(path: string) {
  return new URL(path, window.location.href).pathname.replace(/\/$/, "") || "/";
}

type AmbientSection = {
  host: HTMLElement;
  tone: "dark" | "light";
  density: number;
};

const AMBIENT_SECTIONS: Array<{
  selector: string;
  tone: AmbientSection["tone"];
  density: number;
}> = [
  { selector: ".hero", tone: "dark", density: 9 },
  { selector: ".capabilities", tone: "light", density: 5 },
  { selector: ".product-viewer", tone: "dark", density: 8 },
  { selector: ".ai-demo", tone: "light", density: 5 },
  { selector: ".about", tone: "dark", density: 7 },
  { selector: ".community", tone: "light", density: 5 },
  { selector: ".radar-section", tone: "dark", density: 7 },
  { selector: ".product-hero", tone: "light", density: 7 },
  { selector: ".product-design", tone: "dark", density: 10 },
  { selector: ".product-technology", tone: "dark", density: 10 },
  { selector: ".product-progress", tone: "dark", density: 7 },
  { selector: ".product-colors", tone: "light", density: 5 },
  { selector: ".product-faq", tone: "light", density: 5 },
  { selector: ".product-contact", tone: "light", density: 5 },
  { selector: ".technology-hero", tone: "dark", density: 10 },
  { selector: ".tech-anatomy", tone: "light", density: 5 },
  { selector: ".tech-conversation", tone: "light", density: 5 },
  { selector: ".tech-processing", tone: "dark", density: 9 },
  { selector: ".tech-flow", tone: "light", density: 5 },
  { selector: ".tech-transparency", tone: "light", density: 5 },
  { selector: ".about-editorial .ab-hero", tone: "light", density: 5 },
  { selector: ".about-editorial .ab-why", tone: "dark", density: 8 },
  { selector: ".about-editorial .ab-evidence", tone: "light", density: 5 },
  { selector: ".about-editorial .ab-direction", tone: "dark", density: 8 },
  { selector: ".about-editorial .ab-founders", tone: "light", density: 5 },
  { selector: ".about-editorial .ab-connect", tone: "light", density: 5 },
  { selector: ".cp-hero", tone: "dark", density: 10 },
  { selector: ".cp-understand", tone: "light", density: 5 },
  { selector: ".cp-stories", tone: "light", density: 5 },
  { selector: ".cp-ecosystem", tone: "dark", density: 7 },
  { selector: ".np-hero", tone: "dark", density: 10 },
  { selector: ".np-feature", tone: "light", density: 5 },
  { selector: ".np-journal", tone: "light", density: 5 },
  { selector: ".np-perspective", tone: "dark", density: 7 },
  { selector: ".pt-hero", tone: "dark", density: 10 },
  { selector: ".pt-directions", tone: "light", density: 5 },
  { selector: ".pt-directory", tone: "light", density: 5 },
  { selector: ".pt-process", tone: "dark", density: 7 },
  { selector: ".pt-connect", tone: "dark", density: 7 },
  { selector: ".ct-hero", tone: "dark", density: 10 },
  { selector: ".ct-letter", tone: "light", density: 5 },
  { selector: ".ct-explore", tone: "light", density: 5 },
  { selector: ".qv-overview-hero", tone: "dark", density: 10 },
  { selector: ".qv-overview-closing", tone: "light", density: 5 },
];

/** Clipped photo frames whose image may drift with scroll. */
const PARALLAX_FRAMES = [
  "main .community-placeholder", "main .cp-hero figure", "main .cp-story-image",
  "main .np-feature figure", "main .np-row-image", "main .tech-closeup-photo",
];

const GLOW_SELECTORS = [
  ".capabilities", ".product-viewer", ".ai-demo", ".about", ".community",
  ".product-design", ".product-technology", ".tech-anatomy", ".tech-processing",
  ".ab-why", ".cp-hero", ".np-hero", ".pt-hero", ".ct-hero",
];


gsap.registerPlugin(ScrollTrigger);

let pageLenis: Lenis | null = null;
export const getPageLenis = () => pageLenis;

export default function SiteMotion({ routeKey }: { routeKey: string }) {
  const sparkleLayer = useRef<HTMLCanvasElement>(null);
  const language = useLanguage();

  // Every page outside home gets the homepage's title motion: words rise out of a mask, one by one.
  useLayoutEffect(() => {
    // ScrollTrigger remembers scroll positions per URL and restores them on refresh,
    // which reopened revisited pages halfway down. Navigation owns scroll position instead.
    ScrollTrigger.clearScrollMemory("manual");
    if (routeKey === "/") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>("main h1, main h2"),
    ).filter((el) => !el.querySelector("a, button, input, select, textarea, img, svg"));
    const splits = headings.map((el) => ({ el, ...splitHeading(el) }));
    // Pure CSS rise (see .sv-split in SiteMotion.css): no style reads during the page swap.
    splits.forEach(({ el, words }) => {
      words.forEach((word, i) => word.style.setProperty("--w", String(i)));
      el.classList.add("sv-split");
    });
    const show = (el: Element) => el.classList.add("is-in");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          show(target);
          observer.unobserve(target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    const frame = requestAnimationFrame(() =>
      splits.forEach(({ el }) => {
        if (el.tagName === "H1") show(el);
        else observer.observe(el);
      }),
    );
    const restore = () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      splits.forEach(({ el, restore }) => {
        el.classList.remove("sv-split", "is-in");
        restore();
      });
      splits.length = 0;
    };
    const stop = beforeLanguageChange(restore);
    return () => {
      stop();
      restore();
    };
  }, [routeKey, language]);

  useLayoutEffect(() => {
    const sections = AMBIENT_SECTIONS.flatMap(({ selector, tone, density }) => {
      const host = document.querySelector<HTMLElement>(`main ${selector}`);
      return host ? [{ host, tone, density }] : [];
    });
    const footer = document.querySelector<HTMLElement>("#root .footer");
    if (footer) sections.push({ host: footer, tone: "dark", density: 5 });
    sections.forEach(({ host }) => host.classList.add("site-ambient-section"));
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const glowSections = sections.filter(({ host }) => host.matches(GLOW_SELECTORS.join(",")));
    const glows = glowSections.map(({ host, tone }) => {
      const glow = document.createElement("div");
      glow.className = `site-ambient-glow site-ambient-glow--${tone}`;
      glow.setAttribute("aria-hidden", "true");
      glow.append(document.createElement("i"), document.createElement("i"));
      host.prepend(glow);
      return glow;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        target.classList.toggle("site-motion-in-view", isIntersecting);
      });
    }, { rootMargin: "100px 0px", threshold: 0.01 });
    const syncMotion = () => {
      observer.disconnect();
      glowSections.forEach(({ host }) => {
        host.classList.remove("site-motion-in-view");
        if (!reducedMotion.matches) observer.observe(host);
      });
    };
    syncMotion();
    reducedMotion.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncMotion);
      glows.forEach((glow) => glow.remove());
      sections.forEach(({ host }) => host.classList.remove("site-ambient-section", "site-motion-in-view"));
    };
  }, [routeKey]);

  useLayoutEffect(() => {
    if (routeKey === "/") return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
    pageLenis = lenis;
    const progressGlitter = createProgressGlitter();

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0;
      progressGlitter.update(progress);
    };
    frame = requestAnimationFrame(tick);
    addEventListener("scroll", updateProgress, { passive: true });
    addEventListener("resize", updateProgress);
    updateProgress();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", updateProgress);
      removeEventListener("resize", updateProgress);
      progressGlitter.remove();
      if (pageLenis === lenis) pageLenis = null;
      lenis.destroy();
    };
  }, [routeKey]);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    // Animate content, never section wrappers that contain sticky layouts.
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main h3, main p, main li, main small, main .eyebrow, main article, main figure, main .ab-evidence-story, main .cp-story-image, main .np-row-image, main .tech-closeup-photo, main .technology-cards article, main .ct-form, main .ct-note, main .pt-direction, main .pt-step",
      ),
    );
    // Masked headings have no visible area while pending, so they are watched through their parent.
    const proxies = new Map<Element, HTMLElement[]>();
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            (proxies.get(target) ?? [target]).forEach((item) =>
              item.classList.remove("site-motion-pending"),
            );
            proxies.delete(target);
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
      proxies.clear();
      reveal();
      if (motion.matches) return;
      elements.forEach((element) => {
        // The homepage headings and sections use their own GSAP timelines.
        if (routeKey === "/") return;
        // Live regions, dialogs and form controls must never be hidden.
        if (element.closest("dialog, [aria-live], form, nav, .header")) return;
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
            `${Math.min(siblings.indexOf(element), 3) * 70}ms`,
          );
          element.classList.add("site-motion-target", "site-motion-pending");
          const heading = element.matches("h2, h3") && element.parentElement;
          if (heading) {
            element.classList.add("site-motion-heading");
            proxies.set(heading, [...(proxies.get(heading) ?? []), element]);
            observer.observe(heading);
          } else observer.observe(element);
        }
      });
    };
    // Everything set up here sits below the fold, so it can wait until the page-change
    // crossfade has played instead of adding work to the frame that swaps the page.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(setup, { timeout: 600 })
      : window.setTimeout(setup, 300);
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
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      observer.disconnect();
      reveal();
      motion.removeEventListener("change", setup);
      document.removeEventListener("focusin", reveal);
      window.removeEventListener("hashchange", onHash);
    };
  }, [routeKey]);

  // Photographs drift a few pixels against the scroll, giving each page quiet depth.
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const frames = Array.from(
      document.querySelectorAll<HTMLElement>(PARALLAX_FRAMES.join(",")),
    ).filter((frame) => frame.querySelector("img"));
    frames.forEach((frame) => frame.classList.add("site-parallax"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const middle = innerHeight / 2;
      frames.forEach((frame) => {
        const box = frame.getBoundingClientRect();
        if (box.bottom < -120 || box.top > innerHeight + 120) return;
        const offset = (box.top + box.height / 2 - middle) / innerHeight;
        const travel = Math.min(28, box.height * 0.04);
        frame.style.setProperty("--parallax-y", `${(offset * -travel).toFixed(2)}px`);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      frames.forEach((frame) => {
        frame.classList.remove("site-parallax");
        frame.style.removeProperty("--parallax-y");
      });
    };
  }, [routeKey]);

  useEffect(() => {
    const canvas = sparkleLayer.current;
    const context = canvas?.getContext("2d");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || !context) return;

    type Sparkle = {
      x: number;
      y: number;
      dx: number;
      dy: number;
      age: number;
      lifetime: number;
      size: number;
      rotation: number;
      color: string;
    };
    const sparkles: Sparkle[] = [];
    const palette = ["#405ffa", "#7fd3de", "#bfc9fc", "#cec4fb"];
    let frame = 0;
    let lastSpawn = 0;
    let lastFrame = 0;
    let pixelRatio = 1;

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    const animate = (now: number) => {
      frame = 0;
      const delta = Math.min(now - (lastFrame || now), 32);
      lastFrame = now;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = sparkles.length - 1; i >= 0; i -= 1) {
        const sparkle = sparkles[i];
        sparkle.age += delta;
        if (sparkle.age >= sparkle.lifetime) {
          sparkles.splice(i, 1);
          continue;
        }
        sparkle.x += sparkle.dx * delta;
        sparkle.y += sparkle.dy * delta;
        sparkle.dx *= 0.99;
        sparkle.dy -= 0.00045 * delta;
        const progress = sparkle.age / sparkle.lifetime;
        const opacity = Math.sin(Math.PI * progress) * 0.72;
        context.save();
        context.translate(sparkle.x, sparkle.y);
        context.rotate(sparkle.rotation + progress * 0.6);
        context.globalAlpha = opacity;
        context.fillStyle = sparkle.color;
        context.beginPath();
        context.moveTo(0, -sparkle.size * 1.8);
        context.lineTo(sparkle.size * 0.45, -sparkle.size * 0.45);
        context.lineTo(sparkle.size * 1.8, 0);
        context.lineTo(sparkle.size * 0.45, sparkle.size * 0.45);
        context.lineTo(0, sparkle.size * 1.8);
        context.lineTo(-sparkle.size * 0.45, sparkle.size * 0.45);
        context.lineTo(-sparkle.size * 1.8, 0);
        context.lineTo(-sparkle.size * 0.45, -sparkle.size * 0.45);
        context.closePath();
        context.fill();
        context.strokeStyle = "#f6f8ff";
        context.lineWidth = 0.55;
        context.stroke();
        context.restore();
      }
      if (sparkles.length) frame = requestAnimationFrame(animate);
      else lastFrame = 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || performance.now() - lastSpawn < 18)
        return;
      lastSpawn = performance.now();
      const count = Math.random() > 0.55 ? 2 : 1;
      for (let i = 0; i < count; i += 1) {
        sparkles.push({
          x: event.clientX + (Math.random() - 0.5) * 10,
          y: event.clientY + (Math.random() - 0.5) * 10,
          dx: (Math.random() - 0.5) * 0.07,
          dy: -0.015 - Math.random() * 0.045,
          age: 0,
          lifetime: 360 + Math.random() * 300,
          size: 1.1 + Math.random() * 1.7,
          rotation: Math.random() * Math.PI,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
      if (sparkles.length > 42) sparkles.splice(0, sparkles.length - 42);
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const clearSparkles = () => {
      sparkles.length = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    // Cursor sparkles are switched off; the canvas stays for the swipe handler below.
    const glitterEnabled = () => false;
    const syncGlitter = () => {
      clearSparkles();
      if (glitterEnabled()) {
        resize();
        window.addEventListener("pointermove", onPointerMove, {
          passive: true,
        });
      } else {
        window.removeEventListener("pointermove", onPointerMove);
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    if (glitterEnabled()) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }
    window.addEventListener("blur", clearSparkles);
    reducedMotion.addEventListener("change", syncGlitter);

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
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", clearSparkles);
      reducedMotion.removeEventListener("change", syncGlitter);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
      clearSparkles();
    };
  }, []);

  return (
    <>
      <canvas
        ref={sparkleLayer}
        className="site-cursor-sparkle"
        aria-hidden="true"
      />
    </>
  );
}
