import { useEffect, useRef } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import organizations from "./organizations.json";
import "./Partner.css";

const directions = [
  [
    "Thử nghiệm",
    "Trường học & trung tâm",
    "Cùng trải nghiệm bản mẫu có hướng dẫn, ghi nhận nhu cầu học tập và những điều cần cải thiện.",
  ],
  [
    "Kết nối",
    "Hội & mạng lưới cộng đồng",
    "Gặp gỡ người tham gia phù hợp, hiểu thêm cách công nghệ được sử dụng trong đời sống.",
  ],
  [
    "Nguồn lực",
    "Quỹ & doanh nghiệp",
    "Trao đổi khả năng hỗ trợ thiết bị, chi phí thử nghiệm và cách sử dụng nguồn lực.",
  ],
  [
    "Chuyên môn",
    "Trường đại học & vườn ươm",
    "Góp sức về công nghệ, thiết kế tiếp cận và chuẩn bị điều kiện vận hành.",
  ],
];
const steps = [
  ["Lắng nghe", "Trao đổi nhu cầu, đối tượng và bối cảnh cần hỗ trợ."],
  ["Thống nhất", "Làm rõ phạm vi, đầu mối, sự đồng ý và cách xử lý dữ liệu."],
  [
    "Thử nghiệm",
    "Trải nghiệm có hướng dẫn, ghi nhận điều hữu ích và bất tiện.",
  ],
  ["Hoàn thiện", "Chia sẻ kết quả, điều chỉnh và cùng chọn bước tiếp theo."],
];
function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 15 15 5M5 5h10v10" />
    </svg>
  );
}
export default function Partner() {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = "Đối tác & đồng hành — SeeVia";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pt-pending");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    const elements =
      main.current?.querySelectorAll<HTMLElement>(
        ".pt-direction, .pt-step, .pt-directory details",
      ) ?? [];
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add("pt-pending");
        observer.observe(element);
      }
    });
    const reveal = () =>
      elements.forEach((element) => element.classList.remove("pt-pending"));
    main.current?.addEventListener("focusin", reveal);
    const current = main.current;
    return () => {
      observer.disconnect();
      reveal();
      current?.removeEventListener("focusin", reveal);
    };
  }, []);
  return (
    <div className="partner-page">
      <a className="skip-link" href="#partner-main">
        Đến nội dung chính
      </a>
      <Header active="partnership" />
      <main className="pt" id="partner-main" ref={main}>
        <section className="pt-hero">
          <div className="pt-hero-copy">
            <h1>
              Những kết nối
              <br />
              <em>mở ra khả năng.</em>
            </h1>
            <p>
              SeeVia mong được đồng hành cùng những đơn vị cùng quan tâm đến khả
              năng tiếp cận. Bắt đầu từ nhu cầu thật, cùng làm một điều hữu ích.
            </p>
            <a className="pt-action" href="#directions">
              Khám phá hướng đồng hành <Arrow />
            </a>
          </div>
        </section>
        <section className="pt-section pt-directions" id="directions">
          <div className="pt-heading">
            <p className="pt-eyebrow">HƯỚNG ĐỒNG HÀNH</p>
            <h2>
              Mỗi thế mạnh,
              <br />
              <em>một cách góp sức.</em>
            </h2>
            <p>
              Nhà trường, cộng đồng và doanh nghiệp có thể tham gia từ chuyên
              môn và nguồn lực của mình.
            </p>
          </div>
          <div className="pt-direction-grid">
            {directions.map(([title, label, body], i) => (
              <article className="pt-direction" key={title}>
                <span className="pt-index">0{i + 1}</span>
                <h3>{title}</h3>
                <p className="pt-label">{label}</p>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="pt-section pt-directory" id="organizations">
          <div className="pt-heading">
            <p className="pt-eyebrow">NHỮNG KẾT NỐI MONG MUỐN</p>
            <h2>
              Gần hơn với
              <br />
              <em>trải nghiệm thật.</em>
            </h2>
            <p>
              Các đơn vị dưới đây là đầu mối đề xuất trong kế hoạch phát triển,
              chưa phải đối tác đã xác nhận.
            </p>
            <a className="pt-action" href="/cong-dong">
              Góc nhìn cộng đồng <Arrow />
            </a>
          </div>
          <div className="pt-organizations">
            {organizations.map(({ text, links }) => (
              <details key={text[0]}>
                <summary>
                  <span className="pt-index">{text[0]}</span>
                  <span>
                    <span className="pt-org-name">{text[1]}</span>
                    <span className="pt-org-role">{text[2]}</span>
                  </span>
                  <svg
                    className="pt-plus"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M4 10h12M10 4v12" />
                  </svg>
                </summary>
                <div className="pt-org-content">
                  <h3>{text[4]}</h3>
                  <p>{text[5]}</p>
                  <p className="pt-org-note">Cần trao đổi: {text[7]}</p>
                  {links[0] && (
                    <a
                      className="pt-source"
                      href={links[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tìm hiểu đơn vị <Arrow />
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="pt-section pt-process">
          <div className="pt-heading">
            <p className="pt-eyebrow">CÁCH CÙNG LÀM</p>
            <h2>
              Đi từng bước.
              <br />
              <em>Cùng nhau.</em>
            </h2>
          </div>
          <div className="pt-steps">
            {steps.map(([title, body], i) => (
              <article className="pt-step" key={title}>
                <span className="pt-index">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className="pt-principles">
            <span>Tự nguyện tham gia</span>
            <span>Trung thực về giới hạn</span>
            <span>Làm rõ quyền riêng tư</span>
          </div>
        </section>
        <section className="pt-section pt-connect">
          <div>
            <h2>Hiểu SeeVia trước khi đồng hành.</h2>
            <p>
              Tìm hiểu dự án, công nghệ và những nhu cầu mà chúng tôi đang hướng
              đến.
            </p>
          </div>
          <div className="pt-connect-actions">
            <a className="pt-action" href="/ve-chung-toi">
              Về chúng tôi <Arrow />
            </a>
            <a className="pt-action" href="/cong-nghe">
              Khám phá công nghệ <Arrow />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
