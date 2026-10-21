import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./useHomeMotion";

gsap.registerPlugin(ScrollTrigger);

const STEP_SECONDS = 0.9;
/** Responds the moment the swipe lands, then settles softly onto the scene (ease-out cubic). */
const STEP_EASE = (t: number) => 1 - Math.pow(1 - t, 3);
const AUTOPLAY_MS = 3400;

/** One scrubbed timeline keeps forward and reverse scene changes in sync with scroll. */
export default function useStoryHero(count: number) {
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [live, setLive] = useState(true);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const force = new URLSearchParams(location.search).get("motion") === "on";
    if (reduce && !force) {
      root.classList.add("is-static");
      setLive(false);
      return () => root.classList.remove("is-static");
    }
    root.classList.add("is-live");

    const header = document.querySelector<HTMLElement>(".header");
    const setHeader = () => root.style.setProperty("--sh-header", `${header?.offsetHeight ?? 0}px`);
    setHeader();
    addEventListener("resize", setHeader);

    const scenes = Array.from(root.querySelectorAll<HTMLElement>(".sh-scene"));
    const parts = scenes.map((scene) => ({
      scene,
      copy: Array.from(scene.querySelectorAll<HTMLElement>(".sh-copy > *")),
      visual: scene.querySelector<HTMLElement>(".sh-visual"),
    }));

    const ctx = gsap.context(() => {
      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(scenes[0], { autoAlpha: 1 });
      scenes.forEach((scene, index) => gsap.set(scene, { zIndex: index + 1 }));

      gsap.fromTo(parts[0].copy,
        { autoAlpha: 0, x: (item: number) => item === 1 ? -46 : -26, y: 12, filter: "blur(4px)" },
        { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: 1.1, stagger: .12, delay: .18, ease: "power2.out" },
      );

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          // The scroll glide is already eased; extra scrub lag only adds a slow, dragging tail.
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActive(Math.min(count - 1, Math.round(self.progress * (count - 1))));
            setCompleted(self.progress >= .96);
          },
          onRefresh: (self) => setCompleted(self.progress >= .96),
        },
      });

      for (let index = 0; index < count - 1; index += 1) {
        const leaving = parts[index];
        const entering = parts[index + 1];
        const at = index;
        const direction = index % 2 === 0 ? 1 : -1;
        const copyTravel = (item: number) => item === 1 ? 46 : 28;
        timeline.to(leaving.copy, {
          autoAlpha: 0, x: (item: number) => -direction * copyTravel(item) * .7,
          y: -10, filter: "blur(4px)", duration: .58, stagger: .025,
        }, at + .08);
        if (leaving.visual) {
          timeline.to(leaving.visual, { autoAlpha: 0, scale: 1.035, xPercent: direction * 1.5, duration: .72 }, at + .12);
        }
        timeline.fromTo(entering.scene,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: .72, immediateRender: false },
          at + .2,
        );
        if (entering.visual) {
          timeline.fromTo(entering.visual,
            { autoAlpha: 0, scale: 1.03, xPercent: -direction * 1 },
            { autoAlpha: 1, scale: 1, xPercent: 0, duration: .78, immediateRender: false },
            at + .22,
          );
        }
        timeline.fromTo(entering.copy,
          { autoAlpha: 0, x: (item: number) => direction * copyTravel(item), y: 12, filter: "blur(4px)" },
          { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: .7, stagger: .045, immediateRender: false },
          at + .3,
        );
        timeline.to(leaving.scene, { autoAlpha: 0, duration: .28 }, at + .72);
      }
      triggerRef.current = timeline.scrollTrigger ?? null;

      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top+=120",
        onToggle: (self) => html.classList.toggle("sv-story-active", self.isActive),
        onRefresh: (self) => html.classList.toggle("sv-story-active", self.isActive),
      });

      const scrub = {
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: .7,
        invalidateOnRefresh: true,
      };
      gsap.timeline({ scrollTrigger: scrub, defaults: { ease: "none" } })
        .fromTo(".sh-bg__wash", { xPercent: 0, scale: 1 }, { xPercent: -7, scale: 1.08 }, 0)
        .fromTo(".sh-bg__glow--a", { xPercent: -10, yPercent: 0 }, { xPercent: 42, yPercent: 24 }, 0)
        .fromTo(".sh-bg__glow--b", { xPercent: 0, yPercent: 8 }, { xPercent: -40, yPercent: -20 }, 0)
        .fromTo(".sh-bg__glow--c", { xPercent: 0 }, { xPercent: 25, yPercent: -20 }, 0)
        .fromTo(".sh-panorama img", { scale: 1.02, xPercent: 0 }, { scale: 1.1, xPercent: -3 }, 0)
        .fromTo(".sh-braille img", { scale: 1.04, yPercent: 2 }, { scale: 1.1, yPercent: -3 }, 0)
        .fromTo(".sh-community img", { scale: 1.02, yPercent: 2, transformOrigin: "50% 0%" }, { scale: 1.06, yPercent: 0, transformOrigin: "50% 0%" }, 0);
    }, root);

    return () => {
      removeEventListener("resize", setHeader);
      triggerRef.current = null;
      ctx.revert();
      html.classList.remove("sv-story-active");
      root.classList.remove("is-live");
    };
  }, [count]);

  const goTo = useCallback((index: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const y = st.start + ((st.end - st.start) * index) / (count - 1);
    const currentIndex = Math.round(((scrollY - st.start) / (st.end - st.start)) * (count - 1));
    // Jumping several scenes (progress dots) takes a little longer, never a multiple of one step.
    const duration = STEP_SECONDS + 0.3 * Math.max(0, Math.abs(index - currentIndex) - 1);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration, easing: STEP_EASE, force: true });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, [count]);

  /* One gesture = one scene. A gesture ends only after the wheel/touch goes quiet, so trackpad
     inertia can never skip a scene or carry the page past the hero. Idle time advances scenes. */
  useEffect(() => {
    if (!live) return;
    let lockUntil = 0;
    let glideUntil = 0;
    let target = -1;
    let idle = 0;
    let lastWheel = 0;
    let wheelUsed = false;
    let lastSize = 0;
    let peak = 0;
    let floor = Infinity;
    let touchY: number | null = null;
    let touchUsed = false;
    const inside = (st: ScrollTrigger) => scrollY >= st.start - 4 && scrollY <= st.end + 4;
    const current = (st: ScrollTrigger) =>
      Math.max(0, Math.min(count - 1, Math.round(((scrollY - st.start) / (st.end - st.start)) * (count - 1))));
    /** While a glide is still in flight, count from its destination rather than the half-way scroll position. */
    const base = (st: ScrollTrigger) => (performance.now() < glideUntil ? target : current(st));
    /** True when a move in this direction belongs to the hero (without moving anything). */
    const owns = (direction: 1 | -1) => {
      const st = triggerRef.current;
      if (!st || !inside(st)) return false;
      const next = base(st) + direction;
      return next >= 0 && next <= count - 1;
    };
    /** Moves one scene if possible. "pass" lets the page scroll normally (before the first / after the last scene);
        "edge" swallows a gesture that tries to leave the hero while the last glide is still landing. */
    const step = (direction: 1 | -1): "moved" | "busy" | "edge" | "pass" => {
      const st = triggerRef.current;
      if (!st || !inside(st)) return "pass";
      const now = performance.now();
      const next = base(st) + direction;
      // Leaving the hero only happens once the last glide has fully landed, so a quick
      // second swipe on the first/last scene can never carry the page into the next section.
      if (next < 0 || next > count - 1) return now < glideUntil ? "edge" : "pass";
      if (now < lockUntil) return "busy";
      target = next;
      // Keep one gesture on one chapter until most of its transition has played.
      lockUntil = now + STEP_SECONDS * 700;
      glideUntil = now + STEP_SECONDS * 1000 + 120;
      goTo(next);
      return "moved";
    };
    const autoplay = () => {
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (document.visibilityState === "visible") step(1);
        autoplay();
      }, AUTOPLAY_MS);
    };
    const hold = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const onWheel = (event: WheelEvent) => {
      autoplay();
      if (event.ctrlKey) return;
      const now = performance.now();
      const size = Math.abs(event.deltaY);
      // A new swipe starts after a short pause, or when the wheel clearly speeds up again while
      // inertia is fading. Small jitter in trackpad inertia must not count as a second swipe, and
      // neither may a pause caused by a busy frame (the tail then arrives no stronger than before).
      const paused = event.timeStamp - lastWheel > 160;
      const fresh = (paused && (now > lockUntil || size > lastSize * 1.5))
        || (now > lockUntil && size > 24 && size > floor * 3);
      lastWheel = event.timeStamp;
      lastSize = size;
      // The floor only follows the fading tail after the peak, never the gentle start of the swipe.
      if (fresh || size >= peak) {
        peak = size;
        floor = size;
      } else floor = Math.min(floor, size);
      if (fresh) wheelUsed = false;
      // The rest of a gesture that already changed scene is swallowed, even at the first/last scene.
      if (wheelUsed) return hold(event);
      if (Math.abs(event.deltaY) < 2) return;
      const result = step(event.deltaY > 0 ? 1 : -1);
      if (result === "pass") return;
      // A swipe that lands while the previous scene is still settling is kept alive, so it
      // moves on as soon as the lock opens instead of being silently dropped.
      if (result !== "busy") wheelUsed = true;
      hold(event);
    };
    const onTouchStart = (event: TouchEvent) => {
      autoplay();
      touchY = event.touches[0]?.clientY ?? null;
      touchUsed = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (touchUsed) return event.preventDefault();
      if (touchY === null) return;
      const delta = touchY - (event.touches[0]?.clientY ?? touchY);
      // Hold the page still while the finger is still deciding, so it cannot drift past a scene.
      if (Math.abs(delta) < 24) {
        if (delta !== 0 && owns(delta > 0 ? 1 : -1)) event.preventDefault();
        return;
      }
      const result = step(delta > 0 ? 1 : -1);
      if (result === "pass") return;
      if (result !== "busy") touchUsed = true;
      event.preventDefault();
    };
    const onKey = (event: KeyboardEvent) => {
      autoplay();
      const field = (event.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]");
      if (field || event.altKey || event.ctrlKey || event.metaKey) return;
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key) && !event.shiftKey ? 1
        : ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey) ? -1 : 0;
      if (direction && step(direction) !== "pass") event.preventDefault();
    };
    const onPointer = () => autoplay();

    autoplay();
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      clearTimeout(idle);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [live, count, goTo]);

  return { rootRef, active: live ? active : -1, completed: live ? completed : true, live, goTo };
}
