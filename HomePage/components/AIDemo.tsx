import { useRef, useState } from "react";
import Button from "../../src/components/Button";
import { scenarios } from "../homeData";
import "../styles/ai-photos.css";
function PhotoScene({ scene }: { scene: (typeof scenarios)[number] }) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  return (
    <div className="photo-stage">
      <div className="photo-topline">
        MÔ PHỎNG <span>{loaded ? "Vùng quét minh họa" : "Chờ ảnh"}</span>
      </div>
      <div className="photo-wrap">
        {!missing && (
          <img
            src={scene.image}
            alt={scene.alt}
            onLoad={() => setLoaded(true)}
            onError={() => setMissing(true)}
          />
        )}
        {!loaded && <p className="photo-missing">Ảnh đang được bổ sung</p>}
        {loaded && (
          <>
            <div className="photo-scan" aria-hidden="true" />
            {scene.boxes.map((box, idx) => (
                <div
                  key={box.label}
                  className={`photo-box ${box.y < 8 ? "photo-box-label-below" : ""} ${scene.id === "surroundings" && box.label === "Trụ cứu hỏa" ? "photo-box-label-bottom" : ""}`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    ["--i" as string]: idx,
                  } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <span>{box.label}</span>
                </div>
              ))}
          </>
        )}
      </div>
      <div className="simulation-toolbar">
        <span className="simulation-scene">{scene.title}</span>
      </div>
    </div>
  );
}
export default function AIDemo() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const scene = scenarios[index];
  return (
    <section className="ai-demo section-pad" id="technology">
      <div className="ai-copy">
        <p className="simulation-index" aria-hidden="true">
          SEEVIA / VISION LAB <span>0{index + 1} — 03</span>
        </p>
        <h2 className="eyebrow">MÔ PHỎNG GÓC NHÌN CỦA AI</h2>
        <p className="demo-intro">
          Bạn hãy chọn một tình huống để xem SeeVia thu thập thông tin và phản
          hồi như thế nào.
        </p>
        <div className="tabs" role="tablist" aria-label="Tình huống mô phỏng">
          {scenarios.map((s, i) => (
            <button
              ref={(el) => {
                tabs.current[i] = el;
              }}
              key={s.id}
              id={`tab-${s.id}`}
              role="tab"
              aria-selected={index === i}
              aria-controls="ai-panel"
              tabIndex={index === i ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                let next = i;
                if (e.key === "ArrowRight") next = (i + 1) % scenarios.length;
                else if (e.key === "ArrowLeft")
                  next = (i + scenarios.length - 1) % scenarios.length;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = scenarios.length - 1;
                else return;
                e.preventDefault();
                setIndex(next);
                tabs.current[next]?.focus();
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="speech" aria-live="polite">
          <strong>SEEVIA NÓI</strong>
          <p key={scene.id}>{scene.response}</p>
        </div>
        <p className="demo-note">
          Mô phỏng minh họa, không phải kết quả thực tế của sản phẩm.
        </p>
        <Button to="technology">Tìm hiểu công nghệ</Button>
      </div>
      <div
        id="ai-panel"
        role="tabpanel"
        aria-labelledby={`tab-${scene.id}`}
        tabIndex={0}
        className="ai-visual"
      >
        {<PhotoScene key={scene.id} scene={scene} />}
      </div>
    </section>
  );
}
