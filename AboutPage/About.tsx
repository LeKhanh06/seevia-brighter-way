import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import "./styles/About.css";
import markup from "./aboutContent.html?raw";
import aboutHero from "./assets/about-hero.jpg";
import story01 from "./assets/story-01.jpg";
import story02 from "./assets/story-02.webp";
import story03 from "./assets/story-03.png";
import story05 from "./assets/story-05.jpg";

const aboutImages: Record<string, string> = {
  "./assets/about-hero.jpg": aboutHero,
  "./assets/story-01.jpg": story01,
  "./assets/story-02.webp": story02,
  "./assets/story-03.png": story03,
  "./assets/story-05.jpg": story05,
  ...import.meta.glob<string>("./assets/founders/*.jpg", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};
const anonymousFounder = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196 196"><rect width="196" height="196" fill="#e8eef8"/><circle cx="98" cy="76" r="29" fill="#9ba9c4"/><path d="M34 177c0-35 29-63 64-63s64 28 64 63" fill="#9ba9c4"/></svg>`,
)}`;
const content = markup.replace(
  /(<img\b[^>]*?\bsrc=")(\.\/assets\/[^"]+)(")/g,
  (_, before: string, path: string, after: string) => {
    const image = aboutImages[path];
    const isFounder = path.startsWith("./assets/founders/");
    const source = image ?? (isFounder ? anonymousFounder : path);
    return before + source + after;
  },
);

export default function About() {
  const [notice, setNotice] = useState(false);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      main.current?.querySelectorAll<HTMLElement>(
        ".ab-section-heading, .ab-needs article, .ab-evidence-story, .ab-principles article, .ab-founder-grid article, .ab-connect > *",
      ) ?? [],
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.classList.remove("ab-pending");
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.08 },
    );
    if (!motion.matches) {
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top > window.innerHeight) {
          element.classList.add("ab-reveal", "ab-pending");
          observer.observe(element);
        }
      });
    }
    const revealAll = () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("ab-pending"));
    };
    const revealFocused = (event: FocusEvent) => {
      elements.forEach((element) => {
        if (element.contains(event.target as Node)) {
          element.classList.remove("ab-pending");
        }
      });
    };
    motion.addEventListener("change", revealAll);
    document.addEventListener("focusin", revealFocused);
    return () => {
      revealAll();
      motion.removeEventListener("change", revealAll);
      document.removeEventListener("focusin", revealFocused);
    };
  }, []);
  useEffect(() => {
    document.title = "Về chúng tôi — SeeVia";
    const show = () => setNotice(true);
    window.addEventListener("seevia:unavailable", show);
    return () => window.removeEventListener("seevia:unavailable", show);
  }, []);
  return (
    <div className="about-page">
      <a className="skip-link" href="#about-main">
        Đến nội dung chính
      </a>
      <Header active="about" />
      <main
        ref={main}
        id="about-main"
        className="about-editorial"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <Footer />
      {notice && (
        <div className="notice visible" role="status">
          Nội dung đang được hoàn thiện
          <button aria-label="Đóng thông báo" onClick={() => setNotice(false)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
