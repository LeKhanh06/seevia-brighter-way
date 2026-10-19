import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { translate, useLanguage } from "../src/i18n/language";
import { pageRegistry } from "../src/navigation";
import aboutHero from "../AboutPage/assets/about-hero.jpg";
import Ribbon from "../HomePage/components/Ribbon";
import "./styles/QuickOverview.css";

const starStyles = Array.from({ length: 14 }, (_, index) => ({
  left: `${4 + ((index * 37) % 91)}%`,
  top: `${8 + ((index * 53) % 82)}%`,
  width: `${index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1}px`,
  height: `${index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1}px`,
  animationDelay: `-${((index * 1.27) % 7).toFixed(2)}s`,
  animationDuration: `${4 + (index % 5)}s`,
})) as CSSProperties[];

function Stars() {
  return <div className="qv-stars" aria-hidden="true">{starStyles.map((style, index) => <i key={index} style={style} />)}</div>;
}

type StoryCardProps = {
  tag: string;
  number: string;
  title: ReactNode;
  text: string;
  points?: string[];
  statValue?: string;
  statLabel?: string;
  variant?: string;
  delay?: number;
};

function StoryCard({ tag, number, title, text, points = [], statValue, statLabel, variant = "", delay = 0 }: StoryCardProps) {
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    card.style.setProperty("--ry", `${((x - .5) * 3).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${((.5 - y) * 2).toFixed(2)}deg`);
  };
  const onPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--ry", "0deg");
    event.currentTarget.style.setProperty("--rx", "0deg");
  };

  return (
    <article
      className={`qv-story-card qv-reveal ${variant}`}
      style={{ "--qv-delay": delay } as CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="qv-card-top">
        <span className="qv-card-tag">{tag}</span>
        <span className="qv-card-num">{number}</span>
      </div>
      <h3 className="qv-rv" style={{ "--qv-i": 1 } as CSSProperties}>{title}</h3>
      <p className="qv-card-text qv-rv" style={{ "--qv-i": 2 } as CSSProperties}>{text}</p>
      {points.length > 0 && (
        <ul className="qv-card-points">
          {points.map((point, index) => <li className="qv-rv" style={{ "--qv-i": index + 3 } as CSSProperties} key={point}>{point}</li>)}
        </ul>
      )}
      {statValue && <div className="qv-card-stat qv-rv" style={{ "--qv-i": points.length + 3 } as CSSProperties}>
        <strong>{statValue}</strong>
        {statLabel && <span>{statLabel}</span>}
      </div>}
    </article>
  );
}

function SectionKicker({ number, children }: { number: string; children: ReactNode }) {
  return <p className="qv-section-kicker"><span>{number}</span>{children}</p>;
}

export default function QuickOverview() {
  const language = useLanguage();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = translate("Tổng quan nhanh về SeeVia", language);
  }, [language]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    const elements = Array.from(main.querySelectorAll<HTMLElement>(".qv-reveal"));
    const pending = elements.filter((element) => element.getBoundingClientRect().top > window.innerHeight * .86);
    pending.forEach((element) => element.classList.add("qv-pending"));
    if (!("IntersectionObserver" in window)) {
      pending.forEach((element) => element.classList.remove("qv-pending"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("qv-pending");
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
    pending.forEach((element) => observer.observe(element));
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      event.target.closest(".qv-pending")?.classList.remove("qv-pending");
    };
    const revealAll = () => pending.forEach((element) => element.classList.remove("qv-pending"));
    document.addEventListener("focusin", revealFocused);
    reducedMotion.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      revealAll();
      document.removeEventListener("focusin", revealFocused);
      reducedMotion.removeEventListener("change", revealAll);
    };
  }, []);

  return (
    <div className="quick-overview-page">
      <a className="skip-link" href="#overview-main">Đến nội dung chính</a>
      <Header active="overview" />
      <main id="overview-main" ref={mainRef}>
        <section className="qv-editorial-hero" aria-labelledby="qv-hero-title">
          <Stars />
          <Ribbon variant="hero" />
          <div className="qv-container qv-hero-layout">
            <div className="qv-hero-content">
              <SectionKicker number="SEEVIA">TỔNG QUAN</SectionKicker>
              <h1 id="qv-hero-title">Kính trợ lý thị giác SeeVia.</h1>
              <p className="qv-hero-intro">Dự án phát triển bản mẫu kính ứng dụng AI, hướng tới việc đọc chữ, nhận biết đồ vật và mô tả xung quanh theo yêu cầu của người dùng.</p>
              <a className="qv-button qv-button-primary" href="#qv-intro">Tìm hiểu dự án <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>

        <section className="qv-intro-section" id="qv-intro" aria-labelledby="qv-intro-title">
          <div className="qv-container">
            <div className="qv-section-heading qv-intro-heading qv-reveal">
              <div><SectionKicker number="01">VÌ SAO CÓ SEEVIA</SectionKicker><h2 id="qv-intro-title">Thêm thông tin, thêm lựa chọn.</h2></div>
              <p>Đọc một tờ giấy, phân biệt đồ vật hay hiểu khung cảnh xung quanh đều cần thông tin. SeeVia hướng đến việc đưa những thông tin ấy thành lời nói theo yêu cầu của người dùng.</p>
            </div>
            <div className="qv-intro-grid">
              <figure className="qv-documentary qv-reveal">
                <img src={aboutHero} alt="Các thành viên cơ sở Ánh Dương tại TP.HCM quây quần trò chuyện quanh bàn" loading="lazy" decoding="async" />
                <figcaption>Ảnh tư liệu tại cơ sở Ánh Dương, TP.HCM; không mô tả hoạt động của SeeVia. Ảnh: Nguyễn Đạt / <a href="https://vietnamnews.vn/sunday/features/427554/blind-man-s-massage-centres-provide-light-to-members.html" target="_blank" rel="noopener noreferrer">Việt Nam News ↗</a></figcaption>
              </figure>
              <StoryCard
                tag="NIỀM TIN CỦA SEEVIA" number="01 / 04" variant="qv-card-belief" delay={1}
                title="Đồng hành, không quyết định thay."
                text="SeeVia hướng đến cung cấp thông tin để người dùng lựa chọn theo nhu cầu của mình."
                points={["Sự tự chủ", "Phẩm giá", "Quyền tiếp cận"]}
              />
            </div>
          </div>
        </section>

        <section className="qv-moments-section" id="qv-moments" aria-labelledby="qv-moments-title">
          <Stars />
          <div className="qv-container">
            <div className="qv-section-heading qv-moments-heading qv-reveal">
              <div><SectionKicker number="02">HƯỚNG CÔNG NGHỆ</SectionKicker><h2 id="qv-moments-title">Đọc, nhận biết, hiểu cảnh.</h2></div>
              <p>Các tình huống này minh họa những chức năng được giới thiệu trên trang Sản phẩm. Chúng đang trong quá trình phát triển bản mẫu, chưa phải tính năng đã được kiểm chứng.</p>
            </div>
            <div className="qv-moments-grid">
              <StoryCard
                tag="ĐỌC CHỮ" number="01 / 04" variant="qv-card-feature" delay={0}
                title="Đọc thông tin trước mắt."
                text="SeeVia hướng tới đọc văn bản và tài liệu bằng công nghệ nhận dạng chữ OCR, rồi trả lời bằng âm thanh tiếng Việt khi người dùng yêu cầu."
                points={["Văn bản và tài liệu", "Nhãn và chữ in trong sinh hoạt"]}
                statValue="OCR" statLabel="công nghệ được giới thiệu trên trang Sản phẩm"
              />
              <StoryCard
                tag="NHẬN DIỆN" number="02 / 04" variant="qv-card-moment qv-card-moment-pearl" delay={1}
                title="Nhận biết tiền Việt."
                text="Nhận diện tiền Việt là một trong những chức năng được giới thiệu cho kính SeeVia."
              />
              <StoryCard
                tag="TÌM ĐỒ VẬT" number="03 / 04" variant="qv-card-moment" delay={2}
                title="Tìm một đồ vật quen thuộc."
                text="Định hướng Tìm & Hiểu bao gồm nhận diện vật thể phổ biến và tìm đồ vật trong khung cảnh."
              />
              <StoryCard
                tag="HIỂU CẢNH" number="04 / 04" variant="qv-card-wide" delay={0}
                title="Mô tả khung cảnh xung quanh."
                text="SeeVia hướng tới mô tả thông tin trong hình ảnh và môi trường bằng lời nói khi người dùng yêu cầu."
              />
            </div>
          </div>
        </section>

        <section className="qv-path-section" id="qv-path" aria-labelledby="qv-path-title">
          <div className="qv-container">
            <div className="qv-section-heading qv-path-heading qv-reveal">
              <div><SectionKicker number="03">TIẾN TRÌNH PHÁT TRIỂN</SectionKicker><h2 id="qv-path-title">Từ bản mẫu đến thử nghiệm.</h2></div>
              <p>SeeVia đang hoàn thiện bản mẫu. Các bước tiếp theo là thử nghiệm có hướng dẫn và cải tiến theo phản hồi; thời điểm ra mắt chưa được xác định.</p>
            </div>
            <div className="qv-path-grid">
              <StoryCard
                tag="HIỆN TẠI" number="01 / 02" variant="qv-card-priority" delay={0}
                title="Bản mẫu đang được hoàn thiện."
                text="Bản mẫu hướng đến camera theo yêu cầu, microphone, nút bấm và phản hồi âm thanh bằng tiếng Việt."
                points={["Camera theo yêu cầu", "Nút bấm và lệnh giọng nói"]}
              />
              <StoryCard
                tag="TIẾP THEO" number="02 / 02" variant="qv-card-expansion" delay={1}
                title="Thử nghiệm có hướng dẫn."
                text="Giai đoạn tiếp theo là thử nghiệm có hướng dẫn, rồi cải tiến bản mẫu theo phản hồi. Lịch dùng thử chưa được công bố."
                points={["Cải tiến theo phản hồi", "Ra mắt: chưa xác định"]}
              />
            </div>
          </div>
        </section>

        <section className="qv-closing-section" id="overview-next" aria-labelledby="qv-closing-title">
          <Stars />
          <div className="qv-container qv-closing-layout">
            <div className="qv-closing-copy qv-reveal">
              <SectionKicker number="04">BƯỚC TIẾP THEO</SectionKicker>
              <h2 id="qv-closing-title">Tìm hiểu thêm về SeeVia.</h2>
              <p>Xem chi tiết thiết kế, công nghệ và tiến trình trên trang Sản phẩm; hoặc gửi câu hỏi, góp ý qua trang Liên hệ.</p>
              <div className="qv-closing-actions">
                <a className="qv-button qv-button-primary" href={pageRegistry.productPage.href}>Xem trang Sản phẩm <span aria-hidden="true">↗</span></a>
                <a className="qv-button qv-button-outline" href={pageRegistry.contact.href}>Liên hệ SeeVia <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <StoryCard
              tag="THÔNG TIN HIỆN TẠI" number="04 / 04" variant="qv-card-status" delay={1}
              title="Chưa công bố lịch ra mắt."
              text="SeeVia đang hoàn thiện bản mẫu, chưa mở bán và chưa có giá bán chính thức."
              points={["Sơ đồ và tương tác trên website là minh họa định hướng", "Kính được định hướng bổ sung thông tin, không thay thế gậy trắng hoặc kỹ năng định hướng"]}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
