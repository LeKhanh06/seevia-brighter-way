import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import Button from "../src/components/Button";
import { ProcessingOverview } from "./components/ProcessingOverview";
import CloseupParts from "./components/CloseupParts";
import ConversationDemo from "./components/ConversationDemo";
import useTechnologyReveal from "./useTechnologyReveal";
import { steps } from "./data/technologyData";
import "./styles/Technology.css";
import "./styles/TechnologyLayout.css";
function FlowIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    microphone: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0014 0M12 18v3" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    analysis: (
      <>
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    speaker: (
      <>
        <path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export default function Technology() {
  useTechnologyReveal();
  const [notice, setNotice] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    document.title = "Công nghệ SeeVia — Từ điều nhìn thấy, đến điều nghe hiểu";
    const show = () => {
      setNotice(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(false), 5000);
    };
    window.addEventListener("seevia:unavailable", show);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("seevia:unavailable", show);
    };
  }, []);
  return (
    <div className="technology-page">
      <a className="skip-link" href="#technology-main">
        Đến nội dung chính
      </a>
      <Header active="technology" />
      <main id="technology-main">
        <section className="technology-hero">
          <div className="technology-hero-rings" aria-hidden="true" />
          <i className="technology-hero-glow technology-hero-glow--a" aria-hidden="true" />
          <i className="technology-hero-glow technology-hero-glow--b" aria-hidden="true" />
          <div className="tech-container technology-hero-layout">
            <div className="technology-hero-title">
              <h1>
                Từ điều nhìn thấy,
                <br />
                <span>Đến điều nghe hiểu</span>
              </h1>
              <p className="technology-hero-tagline">Camera · AI · Giọng nói tiếng Việt</p>
            </div>
            <p>
              Công nghệ chỉ có ý nghĩa khi thông tin trở nên dễ tiếp cận. SeeVia
              kết hợp camera, AI và giọng nói để chuyển hình ảnh thành lời, theo
              cách dễ hiểu nhất.
            </p>
          </div>
        </section>
        <CloseupParts />
        <section className="tech-flow tech-section">
          <div className="tech-container">
            <p className="eyebrow">LUỒNG HOẠT ĐỘNG</p>
            <h2>
              Bốn bước từ một câu nói
              <br />
              đến một câu trả lời.
            </h2>
            <div className="tech-flow-grid">
              {steps.map((s, i) => (
                <article key={s.title}>
                  <div className="flow-icon">
                    <FlowIcon name={s.icon} />
                  </div>
                  <small>BƯỚC 0{i + 1}</small>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <ProcessingOverview />
        <section className="tech-conversation tech-section">
          <div className="tech-container tech-conversation-layout">
            <div>
              <p className="eyebrow">MỘT YÊU CẦU, MỘT CHỨC NĂNG PHÙ HỢP</p>
              <h2>
                Bạn chỉ cần nói
                <br />
                điều mình cần.
              </h2>
              <p className="tech-lead">
                Thay vì phải chọn công cụ phù hợp cho từng tình huống, bạn đưa
                ra yêu cầu bằng giọng nói. SeeVia hướng đến việc tự xác định
                cách hỗ trợ phù hợp.
              </p>
              <p className="tech-caption">
                Hội thoại bên cạnh chỉ là minh họa cách tương tác.
              </p>
            </div>
            <ConversationDemo />
          </div>
        </section>
        <section className="tech-transparency">
          <div className="tech-container">
            <div>
              <p className="eyebrow">MINH BẠCH & CHỦ ĐỘNG</p>
              <h2>
                Minh bạch về những điều
                <br />
                chưa chắc chắn.
              </h2>
              <p>
                SeeVia là dự án đang phát triển. Chúng tôi sẽ công bố kết quả
                kiểm chứng khi đã có dữ liệu thử nghiệm cùng người dùng. SeeVia
                hướng đến bổ sung, không thay thế gậy trắng hay kỹ năng định
                hướng của bạn.
              </p>
            </div>
            <Button to="feedback">Tham gia góp ý</Button>
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
