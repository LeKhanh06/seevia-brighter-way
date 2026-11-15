import { useEffect, useLayoutEffect, useRef } from "react";
import {
  CYCLE, DRIFT, FIELDS, MOTION, POSES, RIBBONS, RIBBON_PATHS, RIBBON_VIEWBOX,
  STAGE_SELECTORS, flatten, isStage, samplePoses,
  type Stage, type Stop,
} from "./ribbon-motion";

/**
 * Persistent background layer. Mount ONCE, outside the animated route outlet,
 * so ribbons survive page changes and morph to the new page's first pose
 * instead of the screen resetting.
 * Only transform + opacity are written, from a single rAF loop.
 */
const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

const resolve = (el: HTMLElement, stage: Stage): Stage =>
  stage === "hero" && !el.classList.contains("vision-hero") ? "heroDark" : stage;

function collect(): { el: HTMLElement; stage: Stage }[] {
  const out: { el: HTMLElement; stage: Stage }[] = [];
  const tagged = document.querySelectorAll<HTMLElement>("[data-ribbon]");
  if (tagged.length) {
    tagged.forEach((el, i) =>
      out.push({ el, stage: resolve(el, isStage(el.dataset.ribbon) ? el.dataset.ribbon : CYCLE[i % CYCLE.length]) }),
    );
    return out;
  }
  for (const [sel, stage] of STAGE_SELECTORS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) out.push({ el, stage: resolve(el, stage) });
  }
  if (out.length) return out;
  document
    .querySelectorAll<HTMLElement>("main > section")
    .forEach((el, i) => out.push({ el, stage: CYCLE[i % CYCLE.length] }));
  return out;
}

export default function RibbonField() {
  const root = useRef<HTMLDivElement>(null);

  useIsoLayout(() => {
    const field = root.current!;
    const rib = Array.from(field.querySelectorAll<SVGSVGElement>(".ribbon"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const lite = matchMedia("(max-width: 760px)");
    document.documentElement.classList.add("ribbon-on");
    const hasHomeHero = Boolean(document.querySelector(".hero:not(.vision-hero)"));
    document.documentElement.classList.toggle("ribbon-home-hero", hasHomeHero);
    field.dataset.homeHero = String(hasHomeHero);

    // Keep the full page's ribbon language, while the hero uses a quieter
    // orbital motif instead of the oversized diagonal bands.
    let stops: Stop[] = [];
    let vh = innerHeight, docH = 1;
    let cur: number[] = [], raf = 0, last = 0, measureRaf = 0;

    const apply = (v: number[]) => {
      for (let i = 0; i < RIBBONS; i++) {
        const b = i * 6;
        const x = ((v[b] % 1) + 1) % 1;
        const el = rib[i];
        // One full path period is half the SVG width; move within that span
        // so the repeating wave stays seamless at every phase.
        el.style.transform =
          `translate3d(${(-25 * x).toFixed(3)}%,calc(${v[b + 1].toFixed(3)}vh - 50%),0) ` +
          `rotate(${v[b + 2].toFixed(3)}deg) scale(${v[b + 3].toFixed(4)},${(v[b + 3] * v[b + 4]).toFixed(4)})`;
        el.style.opacity = (v[b + 5] * (lite.matches ? 0.85 : 1)).toFixed(3);
      }
    };

    const target = () => {
      const sy = scrollY;
      const t = samplePoses(stops, sy + vh * 0.5).slice();
      const p = sy / Math.max(1, docH - vh);
      for (let i = 0; i < RIBBONS; i++) t[i * 6] += p * DRIFT[i];
      return t;
    };

    const measure = () => {
      measureRaf = 0;
      vh = innerHeight;
      docH = document.documentElement.scrollHeight;
      const sy = scrollY;
      const raw = collect()
        .map(({ el, stage }) => {
          const r = el.getBoundingClientRect();
          return { top: r.top + sy, h: r.height, stage };
        })
        .sort((a, b) => a.top - b.top);
      stops = raw.map((s, i) => ({
        top: s.top,
        band: i === 0 ? 0 : Math.max(40, Math.min(vh * 0.45, raw[i - 1].h * 0.4, s.h * 0.4)),
        flat: flatten(POSES[s.stage]),
      }));
      if (!cur.length) cur = target(); // first paint: no catch-up animation
      motion.matches ? staticPose() : wake();
    };
    const scheduleMeasure = () => { if (!measureRaf) measureRaf = requestAnimationFrame(measure); };

    const tick = (ts: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts;
      const k = 1 - Math.exp(-dt / MOTION.damping);
      const tgt = target();
      let moving = false;
      for (let i = 0; i < FIELDS * RIBBONS; i++) {
        const d = tgt[i] - cur[i];
        cur[i] += d * k;
        if (Math.abs(d) > 0.0008) moving = true;
      }
      apply(cur);
      if (moving) raf = requestAnimationFrame(tick); else last = 0;
    };
    const wake = () => { if (!raf && !motion.matches) raf = requestAnimationFrame(tick); };

    const staticPose = () => { cur = flatten(POSES.hero); apply(cur); };

    const onMotionChange = () => (motion.matches ? staticPose() : (cur = target(), wake()));

    measure();
    apply(cur);

    addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", scheduleMeasure);
    addEventListener("load", scheduleMeasure);
    motion.addEventListener("change", onMotionChange);
    lite.addEventListener("change", scheduleMeasure);
    document.fonts?.ready.then(scheduleMeasure);
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);
    // route / content swaps that keep body height identical
    const appRoot = document.getElementById("root");
    const mo = new MutationObserver(scheduleMeasure);
    if (appRoot) mo.observe(appRoot, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measureRaf);
      removeEventListener("scroll", wake);
      removeEventListener("resize", scheduleMeasure);
      removeEventListener("load", scheduleMeasure);
      motion.removeEventListener("change", onMotionChange);
      lite.removeEventListener("change", scheduleMeasure);
      ro.disconnect();
      mo.disconnect();
      document.documentElement.classList.remove("ribbon-on");
      document.documentElement.classList.remove("ribbon-home-hero");
    };
  }, []);

  return (
    <div ref={root} className="ribbon-field" aria-hidden="true">
      <svg className="ribbon ribbon--a" viewBox={RIBBON_VIEWBOX} focusable="false">
        <defs>
          {/* reflect over half a period → colour is periodic, so the wrap is invisible */}
          <linearGradient id="sv-rg-a" gradientUnits="userSpaceOnUse" x1="0" x2="720" y1="0" y2="0" spreadMethod="reflect">
            <stop offset="0" stopColor="#7fd3de" />
            <stop offset=".45" stopColor="#405ffa" />
            <stop offset=".8" stopColor="#bfc9fc" />
            <stop offset="1" stopColor="#cec4fb" />
          </linearGradient>
        </defs>
        <path d={RIBBON_PATHS.a} fill="url(#sv-rg-a)" />
      </svg>
      <svg className="ribbon ribbon--b" viewBox={RIBBON_VIEWBOX} focusable="false">
        <defs>
          <linearGradient id="sv-rg-b" gradientUnits="userSpaceOnUse" x1="0" x2="720" y1="0" y2="0" spreadMethod="reflect">
            <stop offset="0" stopColor="#cec4fb" />
            <stop offset=".5" stopColor="#bfc9fc" />
            <stop offset="1" stopColor="#f6f8ff" />
          </linearGradient>
        </defs>
        <path d={RIBBON_PATHS.b} fill="url(#sv-rg-b)" />
      </svg>
      <svg className="ribbon ribbon--c" viewBox={RIBBON_VIEWBOX} focusable="false">
        <path d={RIBBON_PATHS.c} fill="none" stroke="#7fd3de" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
