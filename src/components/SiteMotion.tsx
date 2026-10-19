import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Lenis from "lenis";
import Sparkles from "../../HomePage/components/Sparkles";
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
  { selector: ".np-sources", tone: "dark", density: 7 },
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

const STAR_STYLES: CSSProperties[] = Array.from({ length: 18 }, (_, index) => ({
  left: `${4 + (index * 37) % 92}%`,
  top: `${8 + (index * 53) % 84}%`,
  animationDelay: `-${(index * 1.37).toFixed(2)}s`,
  animationDuration: `${7 + (index % 5) * 1.8}s`,
  "--star-mid-x": `${index % 2 ? 10 : -8}px`,
  "--star-mid-y": `${index % 3 ? -7 : 9}px`,
  "--star-drift-x": `${index % 2 ? 22 : -18}px`,
  "--star-drift-y": `${index % 3 ? -16 : 20}px`,
}) as CSSProperties);

export default function SiteMotion({ routeKey }: { routeKey: string }) {
  const sparkleLayer = useRef<HTMLCanvasElement>(null);
  const [ambientSections, setAmbientSections] = useState<AmbientSection[]>([]);

  useLayoutEffect(() => {
    const sections = AMBIENT_SECTIONS.flatMap(({ selector, tone, density }) => {
      const host = document.querySelector<HTMLElement>(`main ${selector}`);
      return host ? [{ host, tone, density }] : [];
    });
    const footer = document.querySelector<HTMLElement>("#root .footer");
    if (footer) sections.push({ host: footer, tone: "dark", density: 5 });
    sections.forEach(({ host }) => host.classList.add("site-ambient-section"));
    setAmbientSections(sections);
    return () => {
      sections.forEach(({ host }) => host.classList.remove("site-ambient-section"));
    };
  }, [routeKey]);

  useLayoutEffect(() => {
    if (routeKey === "/") return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
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
    const palette = ["#426af8", "#6cd6fc", "#b5b6fc", "#e5c6fc"];
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
        context.strokeStyle = "#f5f4ff";
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

    const glitterEnabled = () => !reducedMotion.matches;
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
      {ambientSections.map(({ host, tone, density }) =>
        createPortal(
          <>
            <div className={`site-ambient-glow site-ambient-glow--${tone}`} aria-hidden="true">
              <i />
              <i />
            </div>
            {tone === "dark" && (
              <div className="site-ambient-stars" aria-hidden="true">
                {STAR_STYLES.map((style, index) => <i key={index} style={style} />)}
              </div>
            )}
            <Sparkles tone={tone} density={density} />
          </>,
          host,
          host.className,
        ),
      )}
      <canvas
        ref={sparkleLayer}
        className="site-cursor-sparkle"
        aria-hidden="true"
      />
    </>
  );
}
