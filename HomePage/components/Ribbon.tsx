import { useId } from "react";

/** Dải sóng trang trí chuyển động liên tục trong hero trang chủ. */
export default function Ribbon({ variant }: { variant: "hero" }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      className={`sv-ribbon sv-ribbon-${variant}`}
      viewBox="0 -24 1200 648"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6CD6FC" />
          <stop offset=".38" stopColor="#426AF8" />
          <stop offset=".72" stopColor="#B5B6FC" />
          <stop offset="1" stopColor="#E5C6FC" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E5C6FC" />
          <stop offset=".5" stopColor="#B5B6FC" />
          <stop offset="1" stopColor="#6CD6FC" />
        </linearGradient>
      </defs>
      <g className="sv-ribbon-g" fill="none" strokeLinecap="round">
        <path
          className="sv-ribbon-path"
          pathLength={1}
          d="M-60 470C170 150 430 110 570 300S900 540 1260 150"
          data-d2="M-60 400C200 240 400 40 570 240S940 600 1260 230"
          stroke={`url(#${id}-a)`}
          strokeWidth="34"
          opacity=".9"
        />
        <path
          className="sv-ribbon-path"
          pathLength={1}
          d="M-60 540C240 330 400 330 600 420S980 470 1260 300"
          data-d2="M-60 470C220 410 420 250 600 350S960 560 1260 390"
          stroke={`url(#${id}-b)`}
          strokeWidth="16"
          opacity=".7"
        />
        <path
          className="sv-ribbon-path"
          pathLength={1}
          d="M-60 90C200 220 360 40 640 120S1000 260 1260 60"
          data-d2="M-60 160C220 50 380 210 640 70S1000 150 1260 150"
          stroke={`url(#${id}-a)`}
          strokeWidth="8"
          opacity=".55"
        />
      </g>
    </svg>
  );
}
