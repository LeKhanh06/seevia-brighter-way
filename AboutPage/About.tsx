import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import "./styles/About.css";
import markup from "./aboutContent.html?raw";
const storyImages = import.meta.glob<string>(
  [
    "./assets/about-hero.jpg",
    "./assets/story-01.jpg",
    "./assets/story-02.webp",
    "./assets/story-03.png",
    "./assets/story-05.jpg",
  ],
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);
const content = markup.replace(
  /src="(\.\/assets\/[^"]+)"/g,
  (_, path: string) => `src="${storyImages[path]}"`,
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
