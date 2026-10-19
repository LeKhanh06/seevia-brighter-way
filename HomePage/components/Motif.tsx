/**
 * Họa tiết riêng cho từng section sau hero (thuần trang trí, aria-hidden):
 *  - ripple:  sóng âm lan tỏa  → "chuyển điều xung quanh thành lời nói" (Experience)
 *  - braille: chữ nổi SEEVIA   → cộng đồng người khiếm thị (Community)
 *  - journey: đường đi có chấm dẫn → "mở lối hành trình" (Partnership)
 */

// Braille: dot 1-3 là cột trái (trên→dưới), dot 4-6 là cột phải.
const SEEVIA: number[][] = [
  [2, 3, 4], // S
  [1, 5], // E
  [1, 5], // E
  [1, 2, 3, 6], // V
  [2, 4], // I
  [1], // A
];

function Ripple() {
  return (
    <svg className="sv-motif sv-motif-ripple" viewBox="0 0 800 800" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx="400" cy="400" r="150" style={{ ["--i" as string]: i } as React.CSSProperties} />
        ))}
      </g>
      <circle cx="400" cy="400" r="7" fill="currentColor" />
    </svg>
  );
}

function Braille() {
  return (
    <svg className="sv-motif sv-motif-braille" viewBox="0 0 600 80" aria-hidden="true" focusable="false">
      {SEEVIA.map((cell, ci) =>
        [1, 2, 3, 4, 5, 6].map((dot) => {
          const col = dot <= 3 ? 0 : 1;
          const row = (dot - 1) % 3;
          const on = cell.includes(dot);
          return (
            <circle
              key={`${ci}-${dot}`}
              className={on ? "sv-bdot sv-bdot-on" : "sv-bdot"}
              cx={ci * 100 + col * 34 + 20}
              cy={row * 26 + 14}
              r="7"
              style={{ ["--i" as string]: ci } as React.CSSProperties}
            />
          );
        }),
      )}
    </svg>
  );
}

function Journey() {
  const d = "M-40 470C220 470 260 200 520 260S820 520 1000 300S1180 140 1240 130";
  return (
    <svg
      className="sv-motif sv-motif-journey"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sv-journey-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6CD6FC" />
          <stop offset=".5" stopColor="#B5B6FC" />
          <stop offset="1" stopColor="#E5C6FC" />
        </linearGradient>
      </defs>
      <path className="sv-journey-guide" d={d} fill="none" stroke="#B5B6FC" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 14" />
      <path className="sv-journey-trail" d={d} pathLength={1} fill="none" stroke="url(#sv-journey-grad)" strokeWidth="3" strokeLinecap="round" />
      <circle className="sv-journey-halo" cx="1240" cy="130" r="14" fill="#6CD6FC" />
      <circle className="sv-journey-dot" cx="1240" cy="130" r="7" fill="#F5F4FF" />
    </svg>
  );
}

export default function Motif({ variant }: { variant: "ripple" | "braille" | "journey" }) {
  if (variant === "ripple") return <Ripple />;
  if (variant === "braille") return <Braille />;
  return <Journey />;
}
