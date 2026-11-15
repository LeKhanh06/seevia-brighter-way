/* Bộ icon SVG đồng bộ (lưới 24px, nét 1.8). Không dùng ký tự gõ trực tiếp như ▲ ▼ → ☰. */
import { s } from "./dom.js";

const P = d => ["path", { d }];
const C = (cx, cy, r) => ["circle", { cx, cy, r }];
const R = (x, y, width, height, rx = 0) => ["rect", { x, y, width, height, rx }];

const SHAPES = {
  overview: [R(3, 3, 7, 7, 1.5), R(14, 3, 7, 7, 1.5), R(3, 14, 7, 7, 1.5), R(14, 14, 7, 7, 1.5)],
  "see-read": [P("M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"), P("M14 3v5h5M9 13h6M9 17h4")],
  find: [C(11, 11, 6.5), P("m16 16 4.5 4.5")],
  connect: [P("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z")],
  go: [P("M3 11 21 3l-8 18-2-8z")],
  community: [C(9, 8, 3), P("M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1"), C(17, 9, 2.5), P("M17 14a4 4 0 0 1 4 4v1")],
  time: [C(12, 12, 9), P("M12 7v5l3 2")],
  quality: [C(12, 12, 9), P("m8 12 3 3 5-6")],
  engagement: [P("M3 12h4l3-8 4 16 3-8h4")],
  safety: [P("M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"), P("M12 8v5M12 16.5h.01")],
  accounts: [R(3, 5, 18, 14, 2), C(9, 11, 2), P("M6 17c.5-2 2-3 3-3s2.5 1 3 3M14 10h4M14 14h4")],
  devices: [C(6.5, 14, 3.5), C(17.5, 14, 3.5), P("M10 13.5c1.3-1 2.7-1 4 0M3 14 5 6M21 14l-2-8")],
  errors: [P("M10.3 4 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"), P("M12 9v4M12 16.5h.01")],
  config: [P("M4 7h10M18 7h2M4 17h2M10 17h10"), C(16, 7, 2), C(8, 17, 2)],
  logout: [P("M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M9 12h10")],
  download: [P("M12 4v11m0 0 4-4m-4 4-4-4M5 20h14")],
  "chevron-down": [P("m6 9 6 6 6-6")],
  "chevron-up": [P("m6 15 6-6 6 6")],
  "chevron-left": [P("m15 6-6 6 6 6")],
  "chevron-right": [P("m9 6 6 6-6 6")],
  "arrow-up-right": [P("M7 17 17 7M8 7h9v9")],
  menu: [P("M4 6h16M4 12h16M4 18h16")],
  x: [P("M6 6l12 12M18 6 6 18")],
  sun: [C(12, 12, 4), P("M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4")],
  moon: [P("M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z")],
  info: [C(12, 12, 9), P("M12 11v5M12 7.5h.01")],
  calendar: [R(3, 5, 18, 16, 2), P("M8 3v4M16 3v4M3 10h18")],
  alert: [C(12, 12, 9), P("M12 7.5v5.5M12 16.5h.01")],
  refresh: [P("M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6")],
  search: [C(11, 11, 6.5), P("m16 16 4.5 4.5")],
  inbox: [P("m4 13 2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5")],
  "tri-up": [["path", { d: "M12 7 19 17H5z", fill: "currentColor", stroke: "none" }]],
  "tri-down": [["path", { d: "M12 17 5 7h14z", fill: "currentColor", stroke: "none" }]],
  dash: [P("M6 12h12")],
};

export function icon(name, { size = 20, cls = "" } = {}) {
  const shapes = SHAPES[name] || [];
  return s("svg", {
    class: ["icon", cls], width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false",
  }, shapes.map(([tag, attrs]) => s(tag, attrs)));
}
