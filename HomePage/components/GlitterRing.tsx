import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#7fd3de", "#bfc9fc", "#cec4fb"];
const RINGS = [58, 178, 298, 418]; // cùng đơn vị viewBox với Radar.tsx
const VIEW = 880;

type P = {
  x: number; y: number; vx: number; vy: number;
  age: number; max: number; size: number;
  color: string; phase: number; star: boolean;
};

/** Kim tuyến: hạt sáng bung ra quanh các vòng tròn, đúng tại đầu tia quét. */
export default function GlitterRing() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const field = canvas.parentElement!;
    const trail = field.querySelector<HTMLElement>(".radar-trail");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const ps: P[] = [];
    let size = 0, dpr = 1, raf = 0, last = 0, visible = true, carry = 0;

    const resize = () => {
      size = field.offsetWidth;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const headAngle = () => {
      if (!trail) return 0;
      const m = new DOMMatrix(getComputedStyle(trail).transform);
      return Math.atan2(m.b, m.a); // radian, chiều kim đồng hồ từ đỉnh
    };

    const spawn = (head: number, k: number, c: number) => {
      const onRing = Math.random() < 0.6;
      const r = onRing
        ? (RINGS[(Math.random() * RINGS.length) | 0] + (Math.random() - 0.5) * 8) * k
        : (30 + Math.random() * 400) * k;
      const a = head - Math.pow(Math.random(), 2) * (onRing ? 0.05 : 0.3);
      const out = (6 + Math.random() * 22) * k;
      const sz = (0.8 + Math.random() * 1.9) * Math.max(k, 0.7);
      ps.push({
        x: c + r * Math.sin(a), y: c - r * Math.cos(a),
        vx: Math.sin(a) * out + (Math.random() - 0.5) * 10,
        vy: -Math.cos(a) * out + (Math.random() - 0.5) * 10 - 4,
        age: 0, max: 0.8 + Math.random() * 1.1, size: sz,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        phase: Math.random() * 6.28, star: sz > 1.7,
      });
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      const k = size / VIEW, c = size / 2;
      carry += dt * 110; // hạt / giây
      while (carry >= 1 && ps.length < 240) { spawn(headAngle(), k, c); carry--; }
      carry %= 1;

      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "lighter";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.age += dt;
        if (p.age >= p.max) { ps.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.985; p.vy *= 0.985;
        const t = p.age / p.max;
        const tw = 0.6 + 0.4 * Math.sin(p.phase + p.age * 16);
        ctx.globalAlpha = Math.sin(Math.PI * t) * tw;
        ctx.fillStyle = ctx.strokeStyle = p.color;
        if (p.star) {
          const L = p.size * 3.2;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - L, p.y); ctx.lineTo(p.x + L, p.y);
          ctx.moveTo(p.x, p.y - L); ctx.lineTo(p.x, p.y + L);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, size, size);
      ps.length = 0;
      if (motion.matches) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    resize();
    start();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(field);
    const ro = new ResizeObserver(resize);
    ro.observe(field);
    motion.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      motion.removeEventListener("change", start);
    };
  }, []);

  return <canvas ref={ref} className="glitter" />;
}
