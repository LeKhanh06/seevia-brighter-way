import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createProgressGlitter } from "../src/components/progressGlitter";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/** Lenis dùng chung, để sau này lớp chuyển trang có thể stop()/scrollTo(). */
let lenis: Lenis | null = null;
export const getLenis = () => lenis;

const q = <T extends HTMLElement = HTMLElement>(
  sel: string,
  root: ParentNode = document,
) => Array.from(root.querySelectorAll<T>(sel));

const HEADINGS = [
  ".hero h1",
  ".experience h2",
  ".product-caption h2",
  ".belief h2",
  ".about-copy h2",
  ".community h2",
  ".partnership h2",
  ".radar-copy h2",
];
/** Các tiêu đề có timeline riêng, không dùng reveal tự động. */
const MANUAL = new Set([".hero h1"]);

const AURAS: [string, "light" | "dark"][] = [
  [".hero", "dark"],
  [".product-viewer", "dark"],
  [".about", "dark"],
  [".partnership", "dark"],
];

/** Mỗi section (trừ hero, product-viewer đang pin) "nở" từ thẻ bo góc ra full-bleed. */
const SEAMS = [
  ".capabilities",
  ".experience",
  ".ai-demo",
  ".about",
  ".community",
  ".partnership",
  ".radar-section",
];

/**
 * Tách tiêu đề thành từng từ để làm text-mask reveal.
 * Giữ nguyên <br> và thẻ lồng (<em>); đặt aria-label để đọc màn hình vẫn đọc cả câu.
 */
function splitWords(el: HTMLElement) {
  const original = el.innerHTML;
  const label = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const outer = document.createElement("span");
          outer.className = "sv-w";
          outer.setAttribute("aria-hidden", "true");
          const inner = document.createElement("span");
          inner.className = "sv-wi";
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.parentNode!.replaceChild(frag, child);
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        (child as HTMLElement).tagName !== "BR"
      ) {
        walk(child);
      }
    });
  };
  walk(el);
  el.setAttribute("aria-label", label);
  return {
    words: q(".sv-wi", el),
    restore: () => {
      el.innerHTML = original;
      el.removeAttribute("aria-label");
    },
  };
}

export default function useHomeMotion() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("sv-home-active");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    // Chỉ để TEST: thêm ?motion=on vào URL để xem animation dù hệ điều hành đang tắt chuyển động.
    const force = new URLSearchParams(location.search).get("motion") === "on";
    if (force) root.classList.add("sv-motion-on");
    // Tôn trọng reduced-motion: giữ bảng màu mới, không chạy animation nào.
    if (reduce.matches && !force) {
      return () => root.classList.remove("sv-home-active");
    }

    const cleanups: (() => void)[] = [];

    /* ---------- Cuộn mượt (Lenis, đồng bộ với ScrollTrigger) ---------- */
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    });

    /* ---------- Thanh tiến trình cuộn (gradient chữ ký) ---------- */
    const progressGlitter = createProgressGlitter();
    cleanups.push(() => progressGlitter.remove());

    /* ---------- Tách chữ tiêu đề ---------- */
    const heads = new Map<string, HTMLElement[]>();
    HEADINGS.forEach((sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) return;
      const { words, restore } = splitWords(el);
      heads.set(sel, words);
      cleanups.push(restore);
    });

    /* ---------- Aura gradient chuyển động theo tiến trình cuộn ---------- */
    AURAS.forEach(([sel, tone]) => {
      const sec = document.querySelector<HTMLElement>(sel);
      if (!sec) return;
      const aura = document.createElement("div");
      aura.className = `sv-aura sv-aura--${tone}`;
      aura.setAttribute("aria-hidden", "true");
      aura.innerHTML = "<i></i><i></i><i></i>";
      sec.classList.add("sv-has-aura");
      sec.prepend(aura);
      cleanups.push(() => {
        aura.remove();
        sec.classList.remove("sv-has-aura");
      });
    });

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const progressState = { value: 0 };
      gsap.to(progressState, {
        value: 1,
        ease: "none",
        onUpdate: () => progressGlitter.update(progressState.value),
        scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
      });

      /* Aura: blob trôi ngược chiều nhau khi cuộn */
      AURAS.forEach(([sel]) => {
        const sec = document.querySelector<HTMLElement>(sel);
        const blobs = sec ? q(".sv-aura i", sec) : [];
        if (!sec || !blobs.length) return;
        gsap.fromTo(
          blobs,
          {
            xPercent: (i: number) => [-12, 10, -6][i],
            yPercent: (i: number) => [-8, 10, 6][i],
            scale: 0.9,
          },
          {
            xPercent: (i: number) => [14, -12, 10][i],
            yPercent: (i: number) => [10, -10, -8][i],
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          },
        );
      });

      /* ---------- Chuyển mục: section "nở" ra từ thẻ bo góc ---------- */
      mm.add({ mob: "(max-width: 760px)" }, (c) => {
        const mob = !!c.conditions?.mob;
        SEAMS.forEach((sel) =>
          gsap.fromTo(
            sel,
            {
              scale: mob ? 0.95 : 0.9,
              borderRadius: mob ? "22px 22px 0px 0px" : "44px 44px 0px 0px",
              transformOrigin: "50% 0%",
            },
            {
              scale: 1,
              borderRadius: "0px 0px 0px 0px",
              ease: "none",
              scrollTrigger: {
                trigger: sel,
                start: "top bottom",
                end: "top 30%",
                scrub: true,
              },
            },
          ),
        );
      });

      /* ---------- Tiêu đề: text mask reveal ---------- */
      heads.forEach((words, sel) => {
        if (MANUAL.has(sel)) return;
        gsap.from(words, {
          yPercent: 115,
          rotate: 4,
          transformOrigin: "0% 100%",
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: sel, start: "top 85%", once: true },
        });
      });

      /* ---------- HERO: ribbon + intro ---------- */
      const h1 = heads.get(".hero h1") ?? [];
      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 0.15 })
        .from(".hero-label", { opacity: 0, x: -30, duration: 0.9 })
        .from(
          h1,
          {
            yPercent: 115,
            rotate: 4,
            transformOrigin: "0% 100%",
            duration: 1.3,
            ease: "expo.out",
            stagger: 0.08,
          },
          "-=0.6",
        )
        .from(
          ".hero-content .button",
          { opacity: 0, y: 24, duration: 0.8 },
          "-=0.65",
        );

      const heroScroll = {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to(".hero-content", {
        y: -70,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: heroScroll,
      });

      /* Ba nét sóng lượn liên tục giữa hai đường cong ban đầu. */
      document
        .querySelectorAll<SVGPathElement>(".hero .sv-ribbon-path")
        .forEach((path, index) => {
          const alternate = path.dataset.d2;
          if (!alternate) return;
          gsap.to(path, {
            attr: { d: alternate },
            duration: [11, 14, 17][index] ?? 14,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

      /* Skew theo vận tốc cuộn: chữ "kéo" nhẹ khi cuộn nhanh */
      const words = q(".sv-w");
      if (lenis && words.length) {
        const setSkew = gsap.quickSetter(words, "skewY", "deg");
        const proxy = { v: 0 };
        lenis.on("scroll", ({ velocity }: { velocity: number }) => {
          const t = gsap.utils.clamp(-5, 5, velocity * 0.15);
          if (Math.abs(t) > Math.abs(proxy.v)) {
            proxy.v = t;
            setSkew(t);
            gsap.to(proxy, {
              v: 0,
              duration: 0.9,
              ease: "power3.out",
              overwrite: true,
              onUpdate: () => setSkew(proxy.v),
            });
          }
        });
      }

      /* Tiêu đề trôi chậm hơn nội dung: tạo chiều sâu */
      [
        ".experience h2",
        ".community h2",
        ".partnership h2",
        ".radar-copy h2",
      ].forEach((sel) =>
        gsap.fromTo(
          sel,
          { y: 45 },
          {
            y: -45,
            ease: "none",
            scrollTrigger: {
              trigger: sel,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        ),
      );

      /* ---------- CAPABILITIES ---------- */
      gsap.fromTo(
        ".capabilities .line-label",
        { opacity: 0, y: 20, "--line": 0 },
        {
          opacity: 1,
          y: 0,
          "--line": 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".capabilities",
            start: "top 80%",
            once: true,
          },
        },
      );
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".capability-grid",
            start: "top 85%",
            once: true,
          },
        })
        .from(".capability", {
          y: 80,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform,opacity",
        })
        .from(
          ".capability .icon-bubble",
          {
            scale: 0.4,
            rotate: -40,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)",
            stagger: 0.12,
            clearProps: "transform,opacity",
          },
          0.15,
        )
        .from(
          ".capability .number",
          {
            opacity: 0,
            x: -18,
            duration: 0.8,
            stagger: 0.12,
            clearProps: "transform,opacity",
          },
          0.1,
        )
        .from(
          ".capability .short-line",
          {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 0.9,
            stagger: 0.12,
            clearProps: "transform",
          },
          0.6,
        );

      /* ---------- EXPERIENCE ---------- */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".experience",
            start: "top 75%",
            once: true,
          },
        })
        .from(".experience .eyebrow", {
          opacity: 0,
          y: 20,
          duration: 0.9,
          ease: "power3.out",
        })
        .from(
          ".experience-copy .short-line",
          {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 1,
            ease: "expo.out",
          },
          0.3,
        )
        .from(
          ".experience-copy p",
          { opacity: 0, y: 30, duration: 1, ease: "power3.out" },
          0.4,
        );
      gsap.fromTo(
        ".experience-copy",
        { y: 50 },
        {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: ".experience",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      /* ---------- PARTNERSHIP: hành trình, chấm dẫn đi theo tiến trình cuộn ---------- */
      const guide = document.querySelector<SVGPathElement>(".sv-journey-guide");
      const trail = document.querySelector<SVGPathElement>(".sv-journey-trail");
      const dot = document.querySelector<SVGCircleElement>(".sv-journey-dot");
      const halo = document.querySelector<SVGCircleElement>(".sv-journey-halo");
      if (guide && trail && dot && halo) {
        const len = guide.getTotalLength();
        trail.style.strokeDasharray = "1";
        const place = (p: number) => {
          const pt = guide.getPointAtLength(p * len);
          dot.setAttribute("cx", String(pt.x));
          dot.setAttribute("cy", String(pt.y));
          halo.setAttribute("cx", String(pt.x));
          halo.setAttribute("cy", String(pt.y));
          trail.style.strokeDashoffset = String(1 - p);
        };
        place(0);
        ScrollTrigger.create({
          trigger: ".partnership",
          start: "top 85%",
          end: "center 35%",
          onUpdate: (self) => place(self.progress),
          onRefresh: (self) => place(self.progress),
        });
        gsap.fromTo(
          ".sv-motif-journey",
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: ".partnership",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      /* ---------- PRODUCT VIEWER: sticky storytelling ---------- */
      mm.add(
        {
          pin: "(min-width: 1025px) and (min-height: 860px)",
          flow: "(max-width: 1024px), (max-height: 859px)",
        },
        (c) => {
          const pin = !!c.conditions?.pin;
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: pin
                ? {
                    trigger: ".product-viewer",
                    start: "top top",
                    end: "+=85%",
                    pin: true,
                    scrub: 0.6,
                    anticipatePin: 1,
                  }
                : {
                    trigger: ".product-viewer",
                    start: "top 70%",
                    end: "bottom 60%",
                    scrub: 0.6,
                  },
            })
            .fromTo(
              ".product-ellipses",
              { scaleX: 0.6, scaleY: 0.55, opacity: 0.15 },
              { scaleX: 1.03, scaleY: 1, opacity: 1, duration: 1 },
              0,
            )
            .fromTo(
              ".product-viewer > .eyebrow",
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, duration: 0.35 },
              0,
            )
            .fromTo(
              ".product-stage > span",
              { scale: 0.9, opacity: 0.15 },
              { scale: 1, opacity: 1, duration: 0.7 },
              0.1,
            )
            .fromTo(
              ".product-caption p",
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.3 },
              0.68,
            );
        },
      );

      /* ---------- AI DEMO: Lens Reveal ---------- */
      gsap
        .timeline({
          scrollTrigger: { trigger: ".ai-demo", start: "top 72%", once: true },
        })
        .from(".ai-copy > *:not(.tabs)", {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform,opacity",
        })
        .from(
          ".ai-copy .tabs button",
          {
            opacity: 0,
            scale: 0.85,
            y: 12,
            duration: 0.7,
            ease: "back.out(1.5)",
            stagger: 0.07,
            clearProps: "transform,opacity",
          },
          0.25,
        )
        .fromTo(
          ".ai-visual",
          { clipPath: "circle(0% at 50% 50%)" },
          {
            clipPath: "circle(75% at 50% 50%)",
            duration: 1.5,
            ease: "power3.inOut",
            clearProps: "clipPath",
          },
          0.1,
        );
      gsap.fromTo(
        ".ai-visual",
        { y: 40 },
        {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ".ai-demo",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      mm.add("(hover: hover) and (pointer: fine)", () => {
        const box = document.querySelector<HTMLElement>(".ai-visual");
        if (!box) return;
        gsap.set(box, { transformPerspective: 900 });
        const rx = gsap.quickTo(box, "rotationX", {
          duration: 0.8,
          ease: "power3",
        });
        const ry = gsap.quickTo(box, "rotationY", {
          duration: 0.8,
          ease: "power3",
        });
        const move = (e: PointerEvent) => {
          const r = box.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        box.addEventListener("pointermove", move);
        box.addEventListener("pointerleave", leave);
        return () => {
          box.removeEventListener("pointermove", move);
          box.removeEventListener("pointerleave", leave);
        };
      });

      /* ---------- ABOUT ---------- */
      gsap
        .timeline({
          scrollTrigger: { trigger: ".about", start: "top 70%", once: true },
        })
        .from(".belief", {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          clearProps: "transform,opacity",
        })
        .from(".belief .eyebrow", { opacity: 0, y: 20, duration: 0.9 }, 0.2)
        .from(
          ".belief .short-line",
          {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 1,
            ease: "expo.out",
          },
          0.7,
        )
        .from(".belief > div p", { opacity: 0, y: 20, duration: 0.9 }, 0.9)
        .from(
          ".about-copy > .eyebrow",
          { opacity: 0, y: 20, duration: 0.9 },
          0.2,
        )
        .from(
          ".about-copy > p:not(.eyebrow)",
          { opacity: 0, y: 28, duration: 1, stagger: 0.15 },
          0.5,
        )
        .from(
          ".about-copy hr",
          {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 1.1,
            ease: "expo.out",
          },
          0.8,
        )
        .from(".about-copy h3", { opacity: 0, y: 20, duration: 0.9 }, 1)
        .from(".about-copy .button", { opacity: 0, y: 20, duration: 0.9 }, 1.2);
      gsap.fromTo(
        ".belief",
        { "--ring": 0 },
        {
          "--ring": 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".about",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      /* ---------- COMMUNITY: image reveal ---------- */
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: ".community",
            start: "top 72%",
            once: true,
          },
        })
        .from(".community .eyebrow", { opacity: 0, y: 20, duration: 0.9 })
        .from(
          ".community p:not(.eyebrow)",
          { opacity: 0, y: 28, duration: 1 },
          0.35,
        )
        .from(".community .button", { opacity: 0, y: 24, duration: 0.9 }, 0.5)
        .fromTo(
          ".community-placeholder",
          { clipPath: "inset(0% 0% 100% 0% round 0px 48px 0px 48px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px 48px 0px 48px)",
            duration: 1.5,
            ease: "expo.inOut",
            clearProps: "clipPath",
          },
          0.1,
        );
      gsap.fromTo(
        ".community-placeholder img",
        { scale: 1.28, yPercent: -6 },
        {
          scale: 1.14,
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".community",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      /* ---------- PARTNERSHIP ---------- */
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: ".partnership",
            start: "top 70%",
            once: true,
          },
        })
        .from(".partnership > .eyebrow", { opacity: 0, y: 20, duration: 0.9 })
        .from(
          ".partnership > p:not(.eyebrow)",
          { opacity: 0, y: 30, duration: 1 },
          0.5,
        )
        .from(
          ".partnership .button",
          { opacity: 0, duration: 0.9, stagger: 0.15, ease: "back.out(1.4)" },
          0.8,
        );

      /* ---------- RADAR ---------- */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".radar-section",
            start: "top 65%",
            once: true,
          },
        })
        .from(
          ".radar g circle",
          {
            scale: 0,
            svgOrigin: "400 400",
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.15,
          },
          0,
        )
        .from(".radar-trail", { opacity: 0, duration: 1.6 }, 0.3)
        .from(
          ".radar-copy p",
          { opacity: 0, y: 30, duration: 1, ease: "power3.out" },
          0.3,
        )
        .from(
          ".radar-copy .button",
          { opacity: 0, y: 24, duration: 0.9, ease: "power3.out" },
          0.5,
        );
      gsap.fromTo(
        ".radar",
        { scale: 0.92 },
        {
          scale: 1.06,
          ease: "none",
          scrollTrigger: {
            trigger: ".radar-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        ".radar-copy",
        { y: 30 },
        {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ".radar-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      /* ---------- Nút "từ tính" (chỉ chuột, không chạm) ---------- */
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const off: (() => void)[] = [];
        q(".button").forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          btn.addEventListener("pointermove", move);
          btn.addEventListener("pointerleave", leave);
          off.push(() => {
            btn.removeEventListener("pointermove", move);
            btn.removeEventListener("pointerleave", leave);
          });
        });
        return () => off.forEach((f) => f());
      });

      // Pin phải được tính trước các trigger phía sau nó.
      ScrollTrigger.sort();
    }, document.body);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
      ctx.revert();
      cleanups.reverse().forEach((fn) => fn());
      root.classList.remove("sv-home-active", "sv-motion-on");
    };
  }, []);
}
