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
import glassesDiagram from "./assets/glasses-diagram.png";
import glassesBurgundy from "./assets/glasses-burgundy.png";
import "./styles/Product.css";

export default function Product() {
  const [feature, setFeature] = useState<number | null>(null);
  const [notice, setNotice] = useState(false);
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
                <feFlood floodColor="#74798c" />
                <feComposite in2="outline" operator="in" />
              </filter>
            </defs>
            <text
              x="0"
              y="285"
              fill="#74798c"
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
            <h2>Công nghệ chỉ có ích khi bạn quên rằng mình đang đeo nó.</h2>
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
              <div className="device-illustration">
                <img
                  src={glassesDiagram}
                  alt="Sơ đồ kính SeeVia với bốn vị trí: camera, microphone, nút điều khiển và phản hồi âm thanh."
                />
                {features.map((f, i) => (
                  <button
                    className={`device-hotspot ${feature === i ? "selected" : ""}`}
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                    key={f.title}
                    aria-label={`Vị trí ${i + 1}: ${f.title}`}
                    aria-pressed={feature === i}
                    onClick={() => setFeature(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="device-features">
                {features.map((f, i) => (
                  <button
                    key={f.title}
                    className={feature === i ? "selected" : ""}
                    aria-pressed={feature === i}
                    onClick={() => setFeature(i)}
                  >
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{f.title}</h3>
                      <p>{f.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="feature-feedback" aria-live="polite">
                {feature === null
                  ? "Chọn một vị trí để khám phá thiết kế."
                  : `${features[feature].title}: ${features[feature].description}`}
              </p>
            </div>
            <div
              className="product-angle-placeholder"
              role="img"
              aria-label="Vùng chờ bộ ảnh kính SeeVia từ nhiều góc"
            >
              <span>Ảnh các góc nhìn đang được bổ sung</span>
            </div>
          </div>
        </section>

        <section className="product-colors" id="colors">
          <div className="product-container colors-layout">
            <figure>
              <img
                src={glassesBurgundy}
                alt="Bản vẽ gọng kính SeeVia màu burgundy."
              />
            </figure>
            <div>
              <p className="eyebrow">MÀU SẮC</p>
              <h2>
                Đa dạng sắc màu,
                <br />
                trọn vẹn cá tính
              </h2>
              <div className="color-options" role="group" aria-label="Màu kính">
                <button
                  className="color-option selected"
                  aria-label="Burgundy, màu đang hiển thị"
                  aria-pressed="true"
                >
                  <span style={{ background: "#7a1823" }} />
                  <small>Burgundy</small>
                </button>
                {[1, 2, 3].map((i) => (
                  <button
                    disabled
                    className="color-option"
                    key={i}
                    aria-label="Màu đang được hoàn thiện"
                  >
                    <span />
                    <small>Chưa có</small>
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
