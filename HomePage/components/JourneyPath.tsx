import { useEffect, useState } from "react";

const D =
  "M-20 640 C 230 625 360 95 760 95 C 1040 95 1110 480 1400 480 C 1570 480 1500 40 1650 -20";

/** Đường cong "hành trình" nằm SAU chữ: mờ dần ở vùng có chữ, có vệt sáng + sao chổi chạy dọc. */
export default function JourneyPath() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  return (
    <div className="journey" aria-hidden="true">
      <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="journey-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#6cd6fc" />
            <stop offset=".55" stopColor="#b5b6fc" />
            <stop offset="1" stopColor="#e5c6fc" />
          </linearGradient>
          <radialGradient id="journey-spark">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset=".35" stopColor="#6cd6fc" stopOpacity=".5" />
            <stop offset="1" stopColor="#6cd6fc" stopOpacity="0" />
          </radialGradient>
          <filter id="journey-blur" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <path className="journey-glow" d={D} filter="url(#journey-blur)" />
        <path id="journey-line" className="journey-line" d={D} pathLength={1} />
        {!still && (
          <>
            <path
              className="journey-run"
              d={D}
              pathLength={1}
              strokeDasharray="0.1 1.1"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0.1"
                to="-0.9"
                dur="11s"
                repeatCount="indefinite"
              />
            </path>
            <g>
              <circle r="16" fill="url(#journey-spark)" />
              <circle r="3.2" fill="#fff" data-sv-orb="" />
              <animateMotion dur="11s" repeatCount="indefinite">
                <mpath href="#journey-line" />
              </animateMotion>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
