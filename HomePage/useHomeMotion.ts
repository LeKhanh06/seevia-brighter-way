import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

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
  ".ai-demo-title",
  ".belief h2",
  ".about-copy h2",
  ".community h2",
  ".partnership h2",
];
/** Các tiêu đề có timeline riêng, không dùng reveal tự động. */
const MANUAL = new Set([".hero h1"]);

/**
 * Các section xếp chồng: section sau trượt lên phủ section trước ngay tại chỗ.
 * Hai section cuối (partnership, radar) và footer cuộn bình thường.
 */
// Kiểu cuộn xếp chồng đã tắt theo yêu cầu: các section cuộn bình thường.
// Muốn bật lại, liệt kê selector các section ở đây (vd ".capabilities", ".experience").
export const HOME_STACK: string[] = [];

/** Dính mỗi section ngay dưới header; section cao hơn màn hình dính ở mép dưới để vẫn đọc hết. */
function setupStack(root: HTMLElement, stack: string[]) {
  const main = document.querySelector<HTMLElement>("main");
  const header = document.querySelector<HTMLElement>(".header");
  const secs = stack.map((sel) => document.querySelector<HTMLElement>(sel)).filter(
    (el): el is HTMLElement => !!el,
  );
  if (!main || !secs.length) return () => {};
  root.classList.add("sv-stack");
  secs.forEach((s) => s.classList.add("sv-stack-item"));

  const layout = () => {
    const headerH = header?.offsetHeight ?? 0;
    root.style.setProperty("--sv-header-h", `${headerH}px`);
    // Vị trí tự nhiên (khi chưa dính) để dải điều hướng cuộn tới đúng chỗ.
    let y = main.getBoundingClientRect().top + window.scrollY;
    Array.from(main.children).forEach((child) => {
      const el = child as HTMLElement;
      if (secs.includes(el)) {
        el.style.top = `${Math.min(headerH, innerHeight - el.offsetHeight)}px`;
        el.dataset.svScrollTo = String(Math.max(0, Math.round(y - headerH)));
      }
      y += el.offsetHeight;
    });
  };
  // offsetTop của section đang dính bị lệch, nên đo lại từ đầu main mỗi lần.
  layout();
  const ro = new ResizeObserver(() => layout());
  secs.forEach((s) => ro.observe(s));
  if (header) ro.observe(header);
  addEventListener("resize", layout);
  addEventListener("load", layout);
  document.fonts?.ready.then(layout);
  ScrollTrigger.addEventListener("refresh", layout);
  return () => {
    ro.disconnect();
    removeEventListener("resize", layout);
    removeEventListener("load", layout);
    ScrollTrigger.removeEventListener("refresh", layout);
    root.classList.remove("sv-stack");
    root.style.removeProperty("--sv-header-h");
    secs.forEach((s) => {
      s.classList.remove("sv-stack-item");
      s.style.removeProperty("top");
      delete s.dataset.svScrollTo;
    });
  };
}

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

/** `stack`: các section xếp chồng khi cuộn (mặc định từ hero tới community). */
export default function useHomeMotion({ stack = HOME_STACK }: { stack?: string[] } = {}) {
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

    /* ---------- Tách chữ tiêu đề ---------- */
    const heads = new Map<string, HTMLElement[]>();
    HEADINGS.forEach((sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) return;
      const { words, restore } = splitWords(el);
      heads.set(sel, words);
      cleanups.push(restore);
    });

    /* ---------- Xếp chồng section ---------- */
    cleanups.push(setupStack(root, stack));

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
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

      /* ---------- HERO: ribbon + intro (chỉ khi dùng hero cũ) ---------- */
      const h1 = heads.get(".hero h1") ?? [];
      if (document.querySelector(".hero")) {
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
      }

      /* ---------- CAPABILITIES ---------- */
      gsap.fromTo(
        ".capabilities .line-label",
        { opacity: 0, y: 8, "--line": 0 },
        {
          opacity: 1,
          y: 0,
          "--line": 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".capabilities",
            start: "top bottom",
            once: true,
          },
        },
      );
      gsap.from(".capability", {
        y: 14,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.05,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".capabilities",
          start: "top bottom",
          once: true,
        },
      });

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
      // Plays once and stays: scrolling back up must not fade the caption away again.
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: ".product-viewer",
            start: "top 75%",
            once: true,
          },
        })
        .fromTo(
          ".product-viewer > .eyebrow",
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.8 },
          0,
        )
        .fromTo(
          ".product-caption p",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.25,
        )
        .fromTo(
          ".product-ellipses",
          { scaleX: 0.6, scaleY: 0.55, opacity: 0.15 },
          { scaleX: 1.03, scaleY: 1, opacity: 1, duration: 1.4, ease: "expo.out" },
          0.2,
        )
        .fromTo(
          ".product-stage > span",
          { scale: 0.9, opacity: 0.15 },
          { scale: 1, opacity: 1, duration: 1 },
          0.35,
        );

      /* ---------- AI DEMO ---------- */
      gsap
        .timeline({
          scrollTrigger: { trigger: ".ai-demo", start: "top 85%", once: true },
        })
        // The heading itself rises word by word (HEADINGS); the rest follows in a calm cascade.
        .from(".ai-demo-heading > :not(h2)", {
          opacity: 0,
          y: 22,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform,opacity",
        })
        .from(
          ".ai-demo .tabs button",
          {
            opacity: 0,
            y: 16,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
          },
          0.35,
        )
        .from(
          ".ai-visual",
          {
            opacity: 0,
            y: 36,
            scale: 0.98,
            duration: 1.1,
            ease: "expo.out",
            clearProps: "transform,opacity",
          },
          0.5,
        )
        .from(
          ".ai-copy > *",
          {
            opacity: 0,
            y: 18,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
          },
          0.7,
        );
      /* ---------- ABOUT ---------- */
      gsap
        .timeline({
          scrollTrigger: { trigger: ".about", start: "top 70%", once: true },
        })
        .from(".belief", {
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
