import { useLayoutEffect, useRef, useState } from "react";
import "./SectionRail.css";

type Stop = { target: HTMLElement; label: string };

function getStops(): Stop[] {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return [];

  const sections = Array.from(
    main.querySelectorAll<HTMLElement>("section"),
  ).filter(
    (section) =>
      !section.parentElement?.closest("section") &&
      section.getBoundingClientRect().height > 80,
  );
  const stops = sections.map((section, index) => {
    const heading = section.querySelector<HTMLElement>("h1, h2");
    return {
      target: section.closest<HTMLElement>(".pin-spacer") ?? section,
      label:
        heading?.textContent?.trim().replace(/\s+/g, " ") ||
        `Phần ${index + 1}`,
    };
  });

  if (
    !stops.length ||
    stops[0].target.getBoundingClientRect().top -
      main.getBoundingClientRect().top >
      120
  ) {
    stops.unshift({
      target: main,
      label: main.querySelector("h1")?.textContent?.trim() || "Đầu trang",
    });
  }
  return stops;
}

export default function SectionRail({ routeKey }: { routeKey: string }) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [active, setActive] = useState(0);
  const stopsRef = useRef<Stop[]>([]);

  useLayoutEffect(() => {
    const nextStops = getStops();
    stopsRef.current = nextStops;
    setStops(nextStops);
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = window.innerHeight * 0.38;
      let nextActive = 0;
      stopsRef.current.forEach((stop, index) => {
        if (stop.target.getBoundingClientRect().top <= marker)
          nextActive = index;
      });
      setActive((current) => (current === nextActive ? current : nextActive));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [routeKey]);

  return (
    <div className="tactile-strip">
      {stops.length > 0 && (
        <nav
          className="section-rail"
          aria-label="Điều hướng các phần trong trang"
        >
          {stops.map((stop, index) => (
            <button
              className={`section-rail__stop${index === active ? " is-active" : index < active ? " is-passed" : ""}`}
              key={`${routeKey}-${index}`}
              type="button"
              aria-label={`Đến ${stop.label}`}
              aria-current={index === active ? "location" : undefined}
              title={stop.label}
              onClick={() => {
                const top =
                  stop.target.getBoundingClientRect().top + window.scrollY - 72;
                window.scrollTo({
                  top: Math.max(0, top),
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "instant"
                    : "smooth",
                });
              }}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
