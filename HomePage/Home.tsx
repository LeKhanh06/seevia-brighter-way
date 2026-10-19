import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import Button from "../src/components/Button";
import Hero from "./components/Hero";
import AIDemo from "./components/AIDemo";
import Radar from "./components/Radar";
import Motif from "./components/Motif";
import { capabilities } from "./homeData";
import "./styles/Home.css";
import "./styles/hero-effects.css";
import "./styles/hero-polish.css";
import "./styles/capabilities.css";
import "./styles/experience.css";
import "./styles/product-design.css";
import "./styles/about.css";
import "./styles/partnership.css";
import "./styles/radar.css";
import "./styles/animations.css";
import "./styles/home-motion.css";
import useHomeMotion from "./useHomeMotion";
function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    document: (
      <>
        <rect x="7" y="4" width="18" height="25" rx="3" />
        <path d="M11 10H21M11 14H21M11 18H21M11 22H17" />
      </>
    ),
    search: (
      <>
        <circle cx="14" cy="14" r="9" />
        <path d="M21 21L29 29" />
      </>
    ),
    phone: (
      <>
        <path d="M8 5L4 9C4 20 13 28 24 28L28 24L21 18L17 22C13 20 10 17 9 13L13 10Z" />
        <path d="M19 5C25 5 28 9 28 15M19 10C22 10 24 12 24 15" />
      </>
    ),
    navigation: <path d="M4 14L29 5L21 29L16 18Z" />,
    person: (
      <>
        <circle cx="16" cy="10" r="5" />
        <path d="M7 28V25C7 16 25 16 25 25V28Z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
export default function Home() {
  useHomeMotion();
  const [notice, setNotice] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
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
    <>
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>
      <Header />
      <main id="main">
        <Hero />
        <section className="capabilities" id="capabilities">
          <h2 className="eyebrow line-label">KHẢ NĂNG HỖ TRỢ</h2>
          <div className="capability-grid">
            {capabilities.map((c, i) => (
              <article className="capability" key={c.title}>
                <span className="number">0{i + 1}</span>
                <div className="icon-bubble">
                  <Icon name={c.icon} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <span className="short-line" />
              </article>
            ))}
          </div>
        </section>
        <section className="experience section-pad" id="product">
          <Motif variant="ripple" />
          <div>
            <p className="eyebrow">TRẢI NGHIỆM SẢN PHẨM</p>
            <h2>
              Một cách khác
              <br />
              để cảm nhận thế giới
            </h2>
          </div>
          <div className="experience-copy">
            <span className="short-line" />
            <p>
              Không chỉ tiếp nhận thông tin bằng hình ảnh. SeeVia hướng đến việc
              chuyển những điều xung quanh thành lời nói, giúp người khiếm thị
              và suy giảm thị lực chủ động khám phá thế giới theo cách của riêng
              mình.
            </p>
          </div>
        </section>
        <section className="product-viewer">
          <p className="eyebrow">KÍNH SEEVIA / KHÁM PHÁ THIẾT KẾ</p>
          <div
            className="product-stage"
            role="img"
            aria-label="Vùng chờ ảnh hoặc mô hình kính SeeVia"
          >
            <div className="product-ellipses" aria-hidden="true" />
            <span>Ảnh kính đang được bổ sung</span>
          </div>
          <div className="product-caption">
            <h2>Khám phá từng đường nét</h2>
            <p>
              Một thiết kế hướng đến sự thoải mái, tự nhiên và là người bạn đồng
              hành giúp cuộc sống trở nên độc lập.
            </p>
          </div>
        </section>
        <AIDemo />
        <section className="about section-pad" id="about">
          <div className="belief">
            <div className="belief-glow" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <p className="eyebrow">NIỀM TIN CỦA SEEVIA</p>
            <h2>
              Công nghệ
              <br />
              bắt đầu từ
              <br />
              con người.
            </h2>
            <div>
              <span className="short-line" />
              <p>Sự tự chủ, phẩm giá và quyền tiếp cận.</p>
            </div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">VỀ CHÚNG TÔI</p>
            <h2>Ai cũng có quyền khám phá.</h2>
            <p>
              SeeVia là dự án AI hỗ trợ thị giác hướng đến người khiếm thị tại
              Việt Nam. Chúng tôi tin rằng khả năng tiếp cận không nên là một
              đặc quyền, mà là điểm khởi đầu của mọi trải nghiệm.
            </p>
            <hr />
            <h3>Đồng hành, không quyết định thay.</h3>
            <p>
              SeeVia hướng đến cung cấp thông tin để người dùng lựa chọn theo
              nhu cầu của mình. Sự thấu hiểu và tôn trọng khác biệt dẫn đường
              cho định hướng phát triển dự án.
            </p>
            <Button light to="about">
              Xem thêm về SeeVia
            </Button>
          </div>
        </section>
        <section className="community section-pad" id="community">
          <Motif variant="braille" />
          <div>
            <p className="eyebrow">GÓC NHÌN TỪ CỘNG ĐỒNG</p>
            <h2>
              Mỗi câu chuyện đều
              <br />
              đáng được lắng nghe.
            </h2>
            <p>
              Khám phá những câu chuyện và trải nghiệm đời thường của người
              khiếm thị, người suy giảm thị lực — để hiểu hơn về góc nhìn và nhu
              cầu của họ.
            </p>
            <Button to="community">Tìm hiểu cộng đồng</Button>
          </div>
          <div className="community-placeholder">
            <img
              src="/images/community.jpg"
              alt="Một giáo viên hướng dẫn hai học sinh học chữ nổi trong lớp học."
              loading="lazy"
            />
          </div>
        </section>
        <section className="partnership section-pad" id="partnership">
          <p className="eyebrow">ĐỒNG HÀNH & PHÁT TRIỂN</p>
          <h2>CÙNG SEEVIA MỞ LỐI HÀNH TRÌNH</h2>
          <p>
            SeeVia đang hoàn thiện kính trợ lý thị giác dành cho người khiếm thị
            và người suy giảm thị lực. Hãy đăng ký trải nghiệm bản mẫu khi
            chương trình được xác nhận, hoặc kết nối với SeeVia để cùng phát
            triển giải pháp sát với nhu cầu thực tế.
          </p>
          <div className="cta-pair">
            <Button light to="contact">
              Trao đổi về trải nghiệm
            </Button>
            <Button outline to="partnership">
              Liên hệ hợp tác
            </Button>
          </div>
        </section>
        <Radar />
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
    </>
  );
}
