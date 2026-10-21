import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import Button from "../src/components/Button";
import {
  features,
  milestones,
  principles,
  questions,
  technologies,
} from "./data/productData";
import "./styles/Product.css";

const glassesAngles = [
  { name: "Mặt trước", image: "/images/kinh/mat2.png" },
  { name: "Mặt trên", image: "/images/kinh/mat1.png?v=20261021-2023" },
  { name: "Mặt dưới", image: "/images/kinh/mat3.png" },
  { name: "Bên phải và bên trái", image: "/images/kinh/mat.png" },
];

const colors = [
  {
    name: "Lunar Silver",
    vi: "Bạc ánh ngọc trai",
    hex: "#DEE2E8",
    image: "/images/kinh/mausac1.png",
    focusY: "39%",
    description:
      "Sạch sẽ, tinh tế và nhẹ nhàng. Bề mặt satin giúp kính trông cao cấp mà không quá bóng hay giống thiết bị y tế.",
  },
  {
    name: "Graphite Black",
    vi: "Đen than chì",
    hex: "#383A41",
    image: "/images/kinh/mausac3.png",
    focusY: "36%",
    description:
      "Sang trọng, mạnh mẽ và mang cảm giác công nghệ. Màu chủ đạo của phiên bản tiêu chuẩn.",
  },
  {
    name: "Crimson Rose",
    vi: "Đỏ rượu trầm",
    hex: "#A52C48",
    image: "/images/kinh/mausac2.png",
    focusY: "46%",
    description:
      "Tạo dấu ấn riêng cho SeeVia giữa các dòng kính công nghệ. Có cá tính nhưng không quá chói.",
  },
  {
    name: "Mist Blue",
    vi: "Xanh lam nhạt",
    hex: "#8FC7F4",
    image: "/images/kinh/mausac.png",
    focusY: "43%",
    description:
      "Hiện đại, dịu mắt và thân thiện. Vừa mang tính công nghệ vừa gần gũi với người dùng.",
  },
];

export default function Product() {
  const [feature, setFeature] = useState(0);
  const [notice, setNotice] = useState(false);
  const [color, setColor] = useState(0);
  const [angle, setAngle] = useState(0);
  const illustrationRef = useRef<HTMLDivElement | null>(null);
  const selectedFeature = features[feature];
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    document.title = "Kính SeeVia — Một chiếc kính, nhiều cách nhìn thế giới";
    const show = () => {
      setNotice(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(false), 5000);
    };
    window.addEventListener("seevia:unavailable", show);
    return () => {
      window.removeEventListener("seevia:unavailable", show);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    const illustration = illustrationRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!illustration || reducedMotion.matches) return;

    let visible = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      clearInterval(interval);
      interval = undefined;
    };
    const update = () => {
      if (!visible || document.hidden) {
        stop();
      } else if (!interval) {
        interval = setInterval(() => {
          setAngle((current) => (current + 1) % glassesAngles.length);
        }, 3800);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });
    observer.observe(illustration);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      stop();
    };
  }, []);
  return (
    <div className="product-page">
      <a className="skip-link" href="#product-main">
        Đến nội dung chính
      </a>
      <Header active="product" />
      <main id="product-main">
        <section className="product-hero">
          <div className="product-hero-rings" aria-hidden="true" />
          <svg
            className="product-watermark"
            viewBox="-35 0 1000 380"
            aria-hidden="true"
          >
            <defs>
              <filter
                id="wordmark-outline"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
                colorInterpolationFilters="sRGB"
              >
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="0.8"
                  result="expanded"
                />
                <feComposite
                  in="expanded"
                  in2="SourceAlpha"
                  operator="out"
                  result="outline"
                />
                <feFlood floodColor="#6b6890" />
                <feComposite in2="outline" operator="in" />
              </filter>
            </defs>
            <text
              x="0"
              y="285"
              fill="#6b6890"
              filter="url(#wordmark-outline)"
              style={{
                fontFamily: "Playfair Display, Georgia, serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 300,
              }}
            >
              SeeVia
            </text>
          </svg>
          <div className="product-container">
            <h1>
              Một chiếc kính,
              <br />
              nhiều cách nhìn thế giới.
            </h1>
            <p>
              Kính trợ lý thị giác SeeVia: nhẹ nhàng trên khuôn mặt, lặng lẽ
              lắng nghe
              <br className="desktop-break" /> và chỉ lên tiếng khi bạn cần.
            </p>
            <div className="product-hero-actions">
              <Button light to="design">Thiết kế</Button>
              <Button light to="colors">Màu sắc</Button>
              <Button light to="technology">Công nghệ</Button>
              <Button outline to="contact">Trao đổi về trải nghiệm</Button>
            </div>
          </div>
        </section>

        <section className="product-design product-container" id="design">
          <div className="product-design-copy">
            <p className="eyebrow">THIẾT KẾ</p>
            <h2>
              Công nghệ chỉ có ích
              <em>khi bạn quên rằng mình đang đeo nó.</em>
            </h2>
            <ol className="design-principles">
              {principles.map((p, i) => (
                <li key={p.title}>
                  <span aria-hidden="true">0{i + 1}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="product-design-visual">
            <div className="device-card">
              <div
                className="device-illustration"
                ref={illustrationRef}
                role="img"
                aria-label={`Kính SeeVia nhìn từ ${glassesAngles[angle].name.toLowerCase()}`}
              >
                {glassesAngles.map((view, index) => (
                  <div
                    className={`device-angle-slide${angle === index ? " active" : ""}${index === 2 ? " device-angle-slide--underside" : ""}`}
                    aria-hidden="true"
                    key={view.name}
                  >
                    <img src={view.image} alt="" decoding="async" />
                  </div>
                ))}
              </div>
              <p className="device-version-note">
                Bản thiết kế V1 · Hình ảnh minh họa, chưa phải phiên bản hoàn thiện.
              </p>
              <div className="device-detail">
                <div className="device-detail-copy" aria-live="polite">
                  <span>CHI TIẾT {String(feature + 1).padStart(2, "0")}</span>
                  <h3>{selectedFeature.title}</h3>
                  <p>{selectedFeature.description}</p>
                  {"note" in selectedFeature && selectedFeature.note && (
                    <p className="device-detail-note">{selectedFeature.note}</p>
                  )}
                </div>
                <div
                  className="device-detail-photo"
                  role="img"
                  aria-label={selectedFeature.title === "Gọng kính"
                    ? "Ảnh kính SeeVia nhìn từ trên, thể hiện hai càng gọng"
                    : `Ảnh cận cảnh ${selectedFeature.title} trên kính SeeVia`}
                >
                  <img
                    src={selectedFeature.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="device-features">
                {features.map((f, i) => (
                  <button
                    type="button"
                    key={f.title}
                    className={feature === i ? "selected" : ""}
                    aria-pressed={feature === i}
                    onClick={() => setFeature(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <h3>{f.title}</h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="product-colors" id="colors">
          <div className="product-container colors-layout">
            <figure>
              {colors.map((c, i) => (
                <img
                  key={c.name}
                  src={c.image}
                  alt={i === color ? `Kính SeeVia màu ${c.name}, ${c.vi.toLowerCase()}.` : ""}
                  aria-hidden={i !== color}
                  className={i === color ? "active" : undefined}
                  style={{ objectPosition: `center ${c.focusY}` }}
                  loading={i === 0 ? undefined : "lazy"}
                />
              ))}
            </figure>
            <div>
              <p className="eyebrow">MÀU SẮC</p>
              <h2>
                Đa dạng sắc màu,
                <br />
                trọn vẹn cá tính
              </h2>
              <div className="color-detail" aria-live="polite">
                <h3>
                  {colors[color].name}
                  <span>{colors[color].vi}</span>
                </h3>
                <p>{colors[color].description}</p>
              </div>
              <div className="color-options" role="group" aria-label="Màu kính">
                {colors.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`color-option${i === color ? " selected" : ""}`}
                    aria-pressed={i === color}
                    onClick={() => setColor(i)}
                  >
                    <span style={{ background: c.hex }} />
                    <small>{c.name}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="product-technology">
          <div className="product-container">
            <p className="eyebrow">CÔNG NGHỆ TRONG KÍNH</p>
            <h2>
              Một chạm, một câu nói.
              <br />
              <span className="technology-answer">Một câu trả lời.</span>
            </h2>
            <p className="product-tech-intro">
              Một thiết bị duy nhất, hoạt động bằng giọng nói: nhìn giúp bạn,
              hiểu điều bạn cần và trả lời bằng âm thanh, khi bạn yêu cầu.
            </p>
            <div className="technology-cards">
              {technologies.map((t) => (
                <article
                  key={t.label}
                  onPointerMove={(event) => {
                    if (event.pointerType !== "mouse") return;
                    const bounds = event.currentTarget.getBoundingClientRect();
                    event.currentTarget.style.setProperty("--card-glow-x", `${event.clientX - bounds.left}px`);
                    event.currentTarget.style.setProperty("--card-glow-y", `${event.clientY - bounds.top}px`);
                  }}
                >
                  <p className="eyebrow">{t.label}</p>
                  <h3>
                    {t.label === "HIỂU CẢNH" ? (
                      <>
                        Môi trường &amp;
                        <br />
                        <span className="keep-phrase">Hình ảnh</span>
                      </>
                    ) : (
                      t.title
                    )}
                  </h3>
                  <p>{t.description}</p>
                </article>
              ))}
            </div>
            <Button light to="technology">Xem chi tiết</Button>
          </div>
        </section>

        <section className="product-progress">
          <div className="product-container">
            <p className="eyebrow">TIẾN TRÌNH PHÁT TRIỂN</p>
            <h2>Từng bước đưa SeeVia đến gần bạn.</h2>
            <ol>
              {milestones.map(([title, description], i) => (
                <li key={title} aria-current={i === 0 ? "step" : undefined}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="product-faq" id="product-faq">
          <div className="product-container faq-layout">
            <div>
              <p className="eyebrow">CÂU HỎI THƯỜNG GẶP</p>
              <h2>
                Điều bạn có thể
                <br />
                đang thắc mắc.
              </h2>
            </div>
            <div className="faq-questions">
              {questions.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="product-contact">
          <div className="product-container">
            <div>
              <h2>Bạn cần SeeVia hỗ trợ điều gì?</h2>
              <p>Chia sẻ nhu cầu để chúng tôi hiểu rõ.</p>
            </div>
            <Button to="feedback">Chia sẻ nhu cầu của bạn</Button>
          </div>
        </section>
      </main>
      <Footer />
      <div
        className={`notice ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            Nội dung đang được hoàn thiện
            <button
              aria-label="Đóng thông báo"
              onClick={() => setNotice(false)}
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  );
}
