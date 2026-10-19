import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Sparkles, { type Pt } from "./Sparkles";
import useSectionMotion from "../useSectionMotion";

/**
 * Hạt sáng chạy ĐÚNG trên đường Ribbon C (đường gợn sóng của RibbonField).
 * Dùng getScreenCTM() nên vẫn bám theo đường khi nó biến hình / trôi theo cuộn.
 */
const RIBBON_W = 2880; // WIDTH trong ribbon-motion.ts (PERIOD * 2)
let path: SVGPathElement | null = null;
let total = 0;
const ribbonOrb = (now: number): Pt | null => {
  if (!path || !path.isConnected) {
    path = document.querySelector<SVGPathElement>(".ribbon--c path");
    total = path ? path.getTotalLength() : 0;
  }
  if (!path || !total) return null;
  const svg = path.ownerSVGElement;
  if (svg && getComputedStyle(svg).display === "none") return null; // mobile: ribbon C bị ẩn
  const m = path.getScreenCTM();
  if (!m || !m.a) return null;
  const t = (now / 18000) % 1; // 18 giây một lượt qua màn hình
  const sx = innerWidth * (-0.05 + 1.1 * t);
  const x = Math.min(RIBBON_W, Math.max(0, new DOMPoint(sx, innerHeight / 2).matrixTransform(m.inverse()).x));
  let L = (x / RIBBON_W) * total;
  let p = path.getPointAtLength(L);
  for (let i = 0; i < 3; i++) { L = Math.min(total, Math.max(0, L + (x - p.x))); p = path.getPointAtLength(L); }
  const s = new DOMPoint(p.x, p.y).matrixTransform(m);
  return { x: s.x, y: s.y, a: Math.min(1, t / 0.08, (1 - t) / 0.08) };
};

export default function MotionLayer() {
  useSectionMotion();
  const [h, setH] = useState<{ exp: HTMLElement | null; par: HTMLElement | null }>(
    { exp: null, par: null },
  );
  useEffect(() => {
    const q = (s: string) => document.querySelector<HTMLElement>(s);
    setH({ exp: q(".experience"), par: q("#partnership") });
  }, []);

  return (
    <>
      {h.exp && createPortal(<Sparkles tone="light" density={5} />, h.exp)}
      {h.par && createPortal(<Sparkles density={14} getPoint={ribbonOrb} orb />, h.par)}
    </>
  );
}
