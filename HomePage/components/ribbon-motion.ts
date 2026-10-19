/**
 * SeeVia — Ribbon motion language (pure data + math, no DOM, SSR-safe).
 * One persistent set of 3 ribbons morphs between "poses" as the page scrolls.
 */

/* ---------- Motion tokens (mirrored as CSS vars in ribbon.css) ---------- */
export const MOTION = {
  micro: 200,
  hover: 300,
  reveal: 600,
  route: 450,
  ease: "cubic-bezier(0.2, 0.65, 0.25, 1)",
  /** seconds; larger = slower, more cinematic catch-up */
  damping: 0.16,
} as const;

/* ---------- Poses ---------- */
/** [x flow (1 = one full wave period), y (vh from centre), rotate (deg), scale, amplitude (scaleY mult), opacity] */
export type Pose = [number, number, number, number, number, number];

export type Stage =
  | "hero" | "heroDark" | "capabilities" | "experience" | "product" | "demo"
  | "about" | "community" | "partnership" | "radar";

export const RIBBONS = 3; // A = gradient band, B = pearl-glass band, C = signal line
export const FIELDS = 6;

/**
 * Light stages keep opacity low and push ribbons away from the text column.
 * Dark stages let them glow. Partnership = ribbons converge into one band,
 * radar = they flatten into a calm line.
 */
export const POSES: Record<Stage, Pose[]> = {
  hero:         [[0.05,  30, -10, 1.18, 1.08, 0.42], [0.32,  34,  -7, 1.22, 0.88, 0.32], [0.14,  24, -12, 1.16, 1.24, 0.50]],
  heroDark:     [[0.05,  28, -10, 1.18, 1.08, 0.75], [0.32,  34,  -7, 1.22, 0.88, 0.55], [0.14,  22, -12, 1.16, 1.24, 0.85]],
  capabilities: [[0.20, -34,   4, 0.90, 0.70, 0.30], [0.45, -28,   6, 1.00, 0.60, 0.22], [0.30, -38,   3, 1.00, 0.90, 0.38]],
  experience:   [[0.38,   2, -14, 1.25, 1.30, 0.32], [0.62,  10,   9, 1.20, 1.10, 0.24], [0.50,  -4, -12, 1.10, 1.40, 0.40]],
  product:      [[0.55,  12,  -4, 1.10, 1.00, 0.78], [0.80,  20,   5, 1.15, 0.90, 0.55], [0.66,   6,  -6, 1.05, 1.30, 0.85]],
  demo:         [[0.70,  34,   7, 0.95, 0.60, 0.30], [0.95,  30,  -5, 1.00, 0.70, 0.22], [0.82,  38,   5, 1.00, 0.80, 0.34]],
  about:        [[0.88, -12,  10, 1.30, 1.40, 0.62], [1.12, -4,  -8, 1.25, 1.20, 0.45], [1.00, -16,  12, 1.20, 1.50, 0.70]],
  community:    [[1.05,  22, -10, 1.00, 0.90, 0.30], [1.30,  28,   6, 1.05, 0.80, 0.24], [1.18,  18,  -9, 1.00, 1.00, 0.36]],
  partnership:  [[1.25,   0,   0, 1.40, 0.50, 0.70], [1.27,   2,   0, 1.40, 0.45, 0.50], [1.26,  -1,   0, 1.30, 0.55, 0.80]],
  radar:        [[1.40,   0,   0, 1.60, 0.15, 0.35], [1.42,   0,   0, 1.60, 0.12, 0.25], [1.41,   0,   0, 1.60, 0.10, 0.55]],
};

/** Pages without known sections cycle through these calm light poses. */
export const CYCLE: Stage[] = ["capabilities", "experience", "demo", "community"];

/** Existing class names on Home → stage. First match per selector. */
export const STAGE_SELECTORS: [string, Stage][] = [
  [".hero", "hero"],
  [".capabilities", "capabilities"],
  [".experience", "experience"],
  [".product-viewer", "product"],
  [".ai-demo", "demo"],
  [".about", "about"],
  [".community", "community"],
  [".partnership", "partnership"],
  [".radar-section", "radar"],
];

/** Extra continuous flow (periods) per ribbon across the whole document, so ribbons never freeze. */
export const DRIFT = [0.9, -0.6, 1.3];

export const isStage = (s: string | undefined): s is Stage => !!s && s in POSES;

/* ---------- Sampling ---------- */
export type Stop = { top: number; band: number; flat: number[] };

const smooth = (t: number) => t * t * (3 - 2 * t);
export const flatten = (poses: Pose[]) => poses.flat();

// Phase is periodic: interpolate across the nearest wrap so the wave never
// sweeps through an entire cycle and briefly reads as a straight diagonal.
const lerpPhase = (from: number, to: number, t: number) => {
  const delta = ((to - from + 0.5) % 1 + 1) % 1 - 0.5;
  return from + delta * t;
};

/**
 * Pose for a scroll marker. A stage is held steady; the morph to the next stage
 * happens in a band centred on the boundary, so reading areas stay calm.
 */
export function samplePoses(stops: Stop[], marker: number): number[] {
  const n = stops.length;
  if (!n) return flatten(POSES.capabilities);
  let k = 0;
  for (let i = 1; i < n; i++) if (marker >= stops[i].top - stops[i].band) k = i;
  if (k === 0) return stops[0].flat;
  const { top, band, flat } = stops[k];
  const t = (marker - (top - band)) / (2 * band);
  if (t >= 1) return flat;
  const e = smooth(Math.max(0, t));
  const prev = stops[k - 1].flat;
  return flat.map((v, i) =>
    i % 6 === 0 ? lerpPhase(prev[i], v, e) : prev[i] + (v - prev[i]) * e,
  );
}

/* ---------- Ribbon geometry (periodic → seamless when translated) ---------- */
// Shorter period gives the background several visible bends across a desktop
// viewport instead of one long diagonal sweep.
const PERIOD = 900, WIDTH = PERIOD * 4, STEP = 10;

function edges(cy: number, amp: number, thick: number, thickAmp: number, phase: number) {
  const top: [number, number][] = [], bot: [number, number][] = [];
  for (let x = 0; x <= WIDTH; x += STEP) {
    const u = (2 * Math.PI * x) / PERIOD;
    const y = cy + amp * (Math.sin(u + phase) + 0.25 * Math.sin(2 * u + 1.1 + phase));
    const th = thick * (1 + thickAmp * Math.sin(u + phase * 0.7 + 1.3));
    top.push([x, y]); bot.push([x, y + th]);
  }
  return { top, bot };
}
const pt = ([x, y]: [number, number]) => `${x},${y.toFixed(1)}`;

function band(...a: Parameters<typeof edges>) {
  const { top, bot } = edges(...a);
  return `M${top.map(pt).join("L")}L${bot.reverse().map(pt).join("L")}Z`;
}
function line(...a: Parameters<typeof edges>) {
  return `M${edges(...a).top.map(pt).join("L")}`;
}

export const RIBBON_VIEWBOX = `0 0 ${WIDTH} 900`;
export const RIBBON_PATHS = {
  a: band(430, 285, 88, 0.28, 0),
  b: band(470, 235, 62, 0.3, 2.1),
  c: line(430, 310, 0, 0, 1.0),
};
