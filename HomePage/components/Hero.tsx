import { useEffect, useRef, useState } from "react";
import Button from "../../src/components/Button";
const objects = [
  {
    label: "Cầu thang · 2 m",
    x: 67,
    y: 22,
    response: "Cầu thang xuống, cách 2 mét phía trước.",
  },
  {
    label: "Xe máy · bên phải",
    x: 78,
    y: 44,
    response: "Xe máy đang tới từ bên phải, cách 4 mét.",
  },
  {
    label: "Chị Lan",
    x: 63,
    y: 53,
    response: "Chị Lan đứng phía trước, đang mỉm cười với bạn.",
  },
  {
    label: "Nhà thuốc An Khang",
    x: 70,
    y: 73,
    response: "Biển hiệu: Nhà thuốc An Khang, mở cửa đến 21 giờ.",
  },
  {
    label: "Cửa ra vào",
    x: 51,
    y: 17,
    response: "Cửa ra vào, bên trái, đang mở.",
  },
];
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const [response, setResponse] = useState("Cửa ra vào phía trước, đang mở.");
  useEffect(() => {
    const hero = ref.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      clientX = 0,
      clientY = 0,
      tracked = false;
    const illuminate = (x: number, y: number) => {
      const rect = hero.getBoundingClientRect();
      let best = -1,
        distance = Infinity;
      objects.forEach((obj, i) => {
        const d = Math.hypot(
          (obj.x / 100) * rect.width - x,
          (obj.y / 100) * rect.height + 10 - y,
        );
        labels.current[i]?.style.setProperty(
          "--visibility",
          String(Math.max(0, 1 - d / 230)),
        );
        if (d < distance) {
          distance = d;
          best = i;
        }
      });
      if (best >= 0 && distance < 130) setResponse(objects[best].response);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      hero.style.setProperty("--lx", "66%");
      hero.style.setProperty("--ly", "34%");
      tracked = false;
      labels.current.forEach((el) => el?.style.removeProperty("--visibility"));
    };
    const update = () => {
      const r = hero.getBoundingClientRect(),
        x = clientX - r.left,
        y = clientY - r.top;
      hero.style.setProperty("--lx", `${x}px`);
      hero.style.setProperty("--ly", `${y}px`);
      illuminate(x, y);
      frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (motion.matches || event.pointerType !== "mouse") return;
      clientX = event.clientX;
      clientY = event.clientY;
      tracked = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const reposition = () => {
      if (tracked && !motion.matches) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(update);
      }
    };
    const leave = () => {
      tracked = false;
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, { passive: true });
    motion.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
      motion.removeEventListener("change", reset);
    };
  }, []);
  return (
    <section ref={ref} className="hero" id="home">
      <div className="hero-rings" aria-hidden="true" />
      <div className="light" aria-hidden="true" />
      <div
        className="hero-objects"
        role="group"
        aria-label="Các tình huống minh họa SeeVia"
      >
        {objects.map((obj, i) => (
          <button
            key={obj.label}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="hero-object"
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
            onFocus={() => setResponse(obj.response)}
            onClick={() => setResponse(obj.response)}
          >
            <span aria-hidden="true">✦</span>
            {obj.label}
          </button>
        ))}
      </div>
      <div className="hero-content">
        <p className="eyebrow hero-label">KÍNH TRỢ LÝ THỊ GIÁC THÔNG MINH</p>
        <h1>
          Không chỉ là tầm nhìn.
          <br />
          <em>Là cả một thế giới.</em>
        </h1>
        <div className="speech">
          <strong>SEEVIA NÓI · MÔ PHỎNG</strong>
          <p aria-live="polite" aria-atomic="true">
            {response}
          </p>
        </div>
        <Button to="productPage">Khám phá sản phẩm</Button>
        <p className="hero-development">
          Dự án đang phát triển ý tưởng. Hiện chưa có mô hình kính.
        </p>
      </div>
    </section>
  );
}
