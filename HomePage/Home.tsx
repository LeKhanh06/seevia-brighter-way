import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import Button from "../src/components/Button";
import Hero from "./components/Hero";
import AIDemo from "./components/AIDemo";
import Radar from "./components/Radar";
import { capabilities } from "./homeData";
import "./styles/ai-photos.css";
import "./styles/home-tactile.css";

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
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

// See & Read and Find & Understand are the MVP; the rest are stated future directions.
const MVP = new Set(["document", "search"]);

export default function Home() {
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
      <main id="main" className="home">
        <Hero />
        <section className="capabilities" id="capabilities">
          <div className="walk-head">
            <h2>Khả năng hỗ trợ</h2>
            <ul className="walk-legend">
              <li>
                <span className="tile tile-dome" aria-hidden="true" />
                Ưu tiên trong bản MVP
              </li>
              <li>
                <span className="tile tile-rib" aria-hidden="true" />
                Định hướng mở rộng
              </li>
            </ul>
          </div>
          <ol className="walk">
            {capabilities.map((c) => {
              const mvp = MVP.has(c.icon);
              return (
                <li className={`walk-slab${mvp ? " is-mvp" : ""}`} key={c.title}>
                  <span
                    className={`tile ${mvp ? "tile-dome" : "tile-rib"}`}
                    aria-hidden="true"
                  />
                  <span className="walk-icon">
                    <Icon name={c.icon} />
                  </span>
                  <h3>{c.title.replace("\n", " ")}</h3>
                  <p>{c.description}</p>
                  <span className="sr-only">
                    {mvp ? "Ưu tiên trong bản MVP" : "Định hướng mở rộng"}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="walk-note">
            Nhận biết vật cản chỉ được thử nghiệm trong môi trường có kiểm soát.
            SeeVia không thay thế gậy trắng hoặc kỹ năng định hướng và di
            chuyển.
          </p>
        </section>
        <section className="experience" id="product">
          <h2>
            Một cách khác
            <br />
            để cảm nhận thế giới
          </h2>
          <p>
            Không chỉ tiếp nhận thông tin bằng hình ảnh. SeeVia hướng đến việc
            chuyển những điều xung quanh thành lời nói, giúp người khiếm thị và
            suy giảm thị lực chủ động khám phá thế giới theo cách của riêng
            mình.
          </p>
        </section>
        <AIDemo />
        <section className="product-viewer">
          <div className="product-caption">
            <h2>Khám phá từng đường nét</h2>
            <p>
              Một thiết kế hướng đến sự thoải mái, tự nhiên và là người bạn đồng
              hành giúp cuộc sống trở nên độc lập.
            </p>
            <Button to="productPage">Khám phá sản phẩm</Button>
          </div>
          <div
            className="product-stage"
            role="img"
            aria-label="Vùng chờ ảnh hoặc mô hình kính SeeVia"
          >
            <svg viewBox="0 0 400 160" aria-hidden="true">
              <path d="M20 70H72M328 70H380" />
              <rect x="72" y="40" width="110" height="74" rx="30" />
              <rect x="218" y="40" width="110" height="74" rx="30" />
              <path d="M182 64C192 54 208 54 218 64" />
            </svg>
            <span>Ảnh kính đang được bổ sung</span>
          </div>
        </section>
        <section className="about" id="about">
          <div className="about-statement">
            <h2>
              Công nghệ bắt đầu từ <em>con người.</em>
            </h2>
            <p>Sự tự chủ, phẩm giá và quyền tiếp cận.</p>
          </div>
          <div className="about-copy">
            <h3>Ai cũng có quyền khám phá.</h3>
            <p>
              SeeVia là dự án AI hỗ trợ thị giác hướng đến người khiếm thị tại
              Việt Nam. Chúng tôi tin rằng khả năng tiếp cận không nên là một
              đặc quyền, mà là điểm khởi đầu của mọi trải nghiệm.
            </p>
            <h3>Đồng hành, không quyết định thay.</h3>
            <p>
              SeeVia hướng đến cung cấp thông tin để người dùng lựa chọn theo
              nhu cầu của mình. Sự thấu hiểu và tôn trọng khác biệt dẫn đường
              cho định hướng phát triển dự án.
            </p>
            <Button to="about">Xem thêm về SeeVia</Button>
          </div>
        </section>
        <section className="community" id="community">
          <figure className="community-photo">
            <img
              src="/images/community.jpg"
              alt="Một giáo viên hướng dẫn hai học sinh học chữ nổi trong lớp học."
              loading="lazy"
            />
          </figure>
          <div className="community-copy">
            <h2>Mỗi câu chuyện đều đáng được lắng nghe.</h2>
            <p>
              Khám phá những câu chuyện và trải nghiệm đời thường của người
              khiếm thị, người suy giảm thị lực — để hiểu hơn về góc nhìn và nhu
              cầu của họ.
            </p>
            <Button to="community">Tìm hiểu cộng đồng</Button>
          </div>
        </section>
        <section className="partnership" id="partnership">
          <h2>Cùng SeeVia mở lối hành trình</h2>
          <p>
            SeeVia đang hoàn thiện kính trợ lý thị giác dành cho người khiếm thị
            và người suy giảm thị lực. Hãy đăng ký trải nghiệm bản mẫu khi
            chương trình được xác nhận, hoặc kết nối với SeeVia để cùng phát
            triển giải pháp sát với nhu cầu thực tế.
          </p>
          <div className="cta-pair">
            <Button to="contact">Trao đổi về trải nghiệm</Button>
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
