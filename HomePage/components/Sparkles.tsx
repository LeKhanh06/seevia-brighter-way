import { useEffect, useRef } from "react";

export type Pt = { x: number; y: number; a: number }; // toạ độ client, a = độ hiện (0–1)
type Props = {
  tone?: "dark" | "light";
  density?: number;
  /** trả về điểm (toạ độ client) mà vệt kim tuyến sẽ bám theo */
  getPoint?: (now: number) => Pt | null;
  /** vẽ thêm một hạt sáng ngọc trai tại điểm đó */
  orb?: boolean;
};
const DARK = ["#ffffff", "#ecfafb", "#7fd3de", "#bfc9fc", "#cec4fb"];
const LIGHT = ["#405ffa", "#9aa8fa", "#bfc9fc", "#b3a2f8", "#7fd3de"];
type P = {
  x: number; y: number; vx: number; vy: number; age: number; max: number;
  size: number; color: string; phase: number; star: boolean; tw: number; amb: boolean;
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export default function Sparkles({ tone = "dark", density = 8, getPoint, orb }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!, host = cv.parentElement!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pal = tone === "dark" ? DARK : LIGHT;
    const maxA = tone === "dark" ? 0.85 : 0.5;
    const ps: P[] = [];
    let w = 0, h = 0, raf = 0, last = 0, visible = false, carry = 0, px = NaN, py = NaN;
    const small = () => innerWidth < 760;
    const want = () => Math.round(density * (small() ? 0.45 : 1));
    const mk = (x: number, y: number, o: Partial<P> = {}): P => ({
      x, y, vx: rnd(-5, 5), vy: rnd(-8, -2), age: 0, max: rnd(4, 9), size: rnd(0.7, 2),
      color: pal[(Math.random() * pal.length) | 0], phase: rnd(0, 6.28),
      star: Math.random() < 0.3, tw: rnd(2, 6), amb: true, ...o,
    });
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; px = py = NaN; return; }
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;

      let amb = 0;
      for (const p of ps) if (p.amb) amb++;
      if (amb < want() && Math.random() < dt * want() * 0.6) ps.push(mk(rnd(0, w), rnd(0, h)));

      let o: { x: number; y: number; a: number } | null = null;
      if (getPoint) {
        const g = getPoint(now);
        if (g && g.a > 0.02) {
          const c = cv.getBoundingClientRect();
          o = { x: g.x - c.left, y: g.y - c.top, a: g.a };
          if (o.x < -40 || o.x > w + 40 || o.y < -40 || o.y > h + 40) o = null;
        }
      }
      if (o && !isNaN(px)) {
        const dx = o.x - px, dy = o.y - py, sp = Math.hypot(dx, dy) / dt;
        if (sp > 8 && sp < 3000) {
          carry += dt * (small() ? 22 : 46) * o.a;
          while (carry >= 1 && ps.length < 280) {
            carry--;
            const a = rnd(0, 6.28), d = rnd(3, 17) * Math.sqrt(Math.random());
            ps.push(mk(o.x + Math.cos(a) * d, o.y + Math.sin(a) * d, {
              vx: (-dx / dt) * 0.05 + rnd(-9, 9), vy: (-dy / dt) * 0.05 + rnd(-12, 4),
              max: rnd(0.9, 1.9), size: rnd(0.6, 1.8), amb: false, star: Math.random() < 0.22, tw: rnd(10, 18),
            }));
          }
          if (Math.random() < dt * 1.4 * o.a)
            ps.push(mk(o.x + rnd(-18, 18), o.y + rnd(-18, 18), {
              size: rnd(3, 5), star: true, amb: false, max: rnd(1, 1.7), color: "#ffffff", vx: 0, vy: -4, tw: 6,
            }));
        }
      }
      px = o ? o.x : NaN; py = o ? o.y : NaN;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = tone === "dark" ? "lighter" : "source-over";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.age += dt;
        if (p.age >= p.max) { ps.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.amb) { p.x = (p.x + w) % w; p.y = (p.y + h) % h; } else { p.vx *= 0.98; p.vy *= 0.98; }
        const t = p.age / p.max;
        ctx.globalAlpha = Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(p.phase + p.age * p.tw)) * maxA;
        ctx.fillStyle = ctx.strokeStyle = p.color;
        if (p.star) {
          const L = p.size * 3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - L, p.y); ctx.lineTo(p.x + L, p.y);
          ctx.moveTo(p.x, p.y - L); ctx.lineTo(p.x, p.y + L);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.2832); ctx.fill();
      }
      if (orb && o) {
        // hạt ngọc trai: quầng iridescent mềm + lõi trắng
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, 26);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.25, "rgba(127, 211, 222, 0.45)");
        g.addColorStop(0.6, "rgba(191, 201, 252, 0.16)");
        g.addColorStop(1, "rgba(191, 201, 252, 0)");
        ctx.globalAlpha = o.a;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(o.x, o.y, 26, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(o.x, o.y, 3, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      cancelAnimationFrame(raf);
      ps.length = 0; px = py = NaN;
      resize(); ctx.clearRect(0, 0, w, h);
      if (motion.matches) return;
      for (let i = 0; i < want(); i++) { const p = mk(rnd(0, w), rnd(0, h)); p.age = rnd(0, p.max); ps.push(p); }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    start();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    motion.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      motion.removeEventListener("change", start);
    };
  }, [tone, density, getPoint, orb]);

  return <canvas ref={ref} className="sv-fx" aria-hidden="true" />;
}
