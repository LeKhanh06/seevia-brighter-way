import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import hero from "./assets/community-01.jpg";
import runners from "./assets/community-02.jpg";
import gathering from "./assets/community-03.jpg";
import experience from "./assets/community-04.jpg";
import { storyLinks } from "./storyLinks";
import "./styles/Community.css";

const categories = [
  "Tất cả",
  "Thể thao & kết nối",
  "Giao lưu cộng đồng",
  "Chia sẻ & thấu hiểu",
];
const stories = [
  {
    category: 1,
    image: runners,
    title: "Chạy cùng nhau, gặp thêm bạn mới.",
    description:
      "Tại CLB Blind Runners, người khiếm thị và tình nguyện viên cùng tập luyện, trò chuyện và chia sẻ niềm vui qua những buổi chạy.",
    source: "Tất Sơn / Báo ảnh Việt Nam · 2024",
    alt: "Thành viên Blind Runners cùng người đồng hành chuẩn bị chạy",
  },
  {
    category: 2,
    image: gathering,
    title: "Gặp nhau trên một sân chơi chung.",
    description:
      "Các đơn vị Hội Người mù tại Hà Nội cùng tham gia giao lưu văn hóa, trò chơi kiến thức và thi đấu bóng đá tại Đông Anh.",
    source: "Hội Người mù thành phố Hà Nội · 2023",
    alt: "Hội viên tham gia giao lưu văn hóa và thể thao tại Đông Anh",
  },
  {
    category: 3,
    image: experience,
    title: "Khi người khiếm thị là người hướng dẫn.",
    description:
      "Tại “Trải nghiệm bóng tối”, học sinh và sinh viên khiếm thị hướng dẫn khách thực hành, chia sẻ kỹ năng từ trải nghiệm của mình.",
    source: "Công Đạt / Báo ảnh Việt Nam · 2025",
    alt: "Khách tham gia làm chuỗi hạt tại sự kiện Trải nghiệm bóng tối",
  },
];

function Arrow() {
  return (
    <svg
      className="cp-arrow"
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

export default function Community() {
  const [filter, setFilter] = useState(0);
  const [notice, setNotice] = useState(false);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = "Cộng đồng — SeeVia";
    const show = () => setNotice(true);
    window.addEventListener("seevia:unavailable", show);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      main.current?.querySelectorAll<HTMLElement>(".cp-reveal") ?? [],
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("cp-pending");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    if (!motion.matches)
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top > innerHeight) {
          element.classList.add("cp-pending");
          observer.observe(element);
        }
      });
    const revealAll = () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("cp-pending"));
    };
    const focus = (event: FocusEvent) =>
      elements.forEach((element) => {
        if (element.contains(event.target as Node))
          element.classList.remove("cp-pending");
      });
    motion.addEventListener("change", revealAll);
    document.addEventListener("focusin", focus);
    return () => {
      revealAll();
      motion.removeEventListener("change", revealAll);
      document.removeEventListener("focusin", focus);
      window.removeEventListener("seevia:unavailable", show);
    };
  }, []);

  return (
    <div className="community-page">
      <a className="skip-link" href="#community-main">
        Đến nội dung chính
      </a>
      <Header active="community" />
      <main className="cp-main" id="community-main" ref={main}>
        <section className="cp-hero">
          <div className="cp-container">
            <h1>
              Mỗi trải nghiệm,
              <br />
              <em>một góc nhìn quý giá.</em>
            </h1>
            <p className="cp-hero-intro">
              Một buổi chạy cùng nhau. Một cuộc giao lưu. Khám phá những cách
              cộng đồng người khiếm thị gặp gỡ, sẻ chia và tham gia đời sống.
            </p>
            <a className="cp-action cp-action-outline" href="#stories">
              Khám phá câu chuyện <Arrow />
            </a>
            <figure>
              <img
                src={hero}
                alt="Thành viên CLB Blind Runners cùng người đồng hành chạy qua Nhà hát Lớn Hà Nội"
                fetchPriority="high"
              />
              <figcaption>
                <span>CLB Blind Runners, Hà Nội · 2024</span>
                <a
                  href={storyLinks[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ảnh: Tất Sơn / Báo ảnh Việt Nam <Arrow />
                </a>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="cp-understand cp-section" id="understand">
          <div className="cp-container cp-reveal">
            <div className="cp-heading">
              <h2>
                Mỗi người có một
                <br />
                <em>cách trải nghiệm cuộc sống.</em>
              </h2>
              <p>
                Không có một trải nghiệm đại diện cho tất cả người khiếm thị. Để
                hiểu điều người khác cần, hãy bắt đầu bằng một cuộc trò chuyện.
              </p>
            </div>
            <div className="cp-principles">
              {[
                [
                  "Hỏi trước khi hỗ trợ",
                  "Hỏi người đối diện có cần giúp đỡ và muốn được hỗ trợ như thế nào.",
                ],
                [
                  "Mô tả rõ ràng",
                  "Dùng lời nói cụ thể, tránh chỉ tay hoặc mặc định người khác đã hiểu.",
                ],
                [
                  "Tôn trọng lựa chọn",
                  "Để mỗi người chủ động quyết định khi nào và bằng cách nào họ muốn tham gia.",
                ],
              ].map(([title, description], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cp-stories cp-section" id="stories">
          <div className="cp-container">
            <div className="cp-heading cp-reveal">
              <h2>
                Những cuộc gặp,
                <br />
                <em>những câu chuyện thật.</em>
              </h2>
            </div>
            <div
              className="cp-filters"
              role="group"
              aria-label="Lọc câu chuyện"
            >
              {categories.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={filter === index}
                  onClick={() => setFilter(index)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className={`cp-story-grid ${filter ? "is-filtered" : ""}`}>
              {stories
                .filter((story) => !filter || story.category === filter)
                .map((story) => (
                  <article className="cp-story cp-reveal" key={story.category}>
                    <a
                      className="cp-story-image"
                      href={storyLinks[story.category - 1]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Đọc bài: ${story.title}`}
                    >
                      <img src={story.image} alt={story.alt} loading="lazy" />
                      <span>
                        <Arrow />
                      </span>
                    </a>
                    <div className="cp-story-copy">
                      <h3>{story.title}</h3>
                      <p className="cp-category">
                        {categories[story.category]}
                      </p>
                      <p>{story.description}</p>
                      <a
                        className="cp-action cp-action-outline"
                        href={storyLinks[story.category - 1]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Đọc câu chuyện <Arrow />
                      </a>
                      <small className="cp-source">{story.source}</small>
                    </div>
                  </article>
                ))}
            </div>
            <p className="cp-source-note">
              Tư liệu từ nguồn độc lập. Các nhân vật và tổ chức trong bài không
              được giới thiệu là người dùng, đối tác hay đơn vị thử nghiệm
              SeeVia.
            </p>
          </div>
        </section>

        <section className="cp-ecosystem cp-section" id="ecosystem">
          <div className="cp-container cp-reveal">
            <div className="cp-heading">
              <h2>
                Từ nhu cầu của bạn,
                <br />
                <em>đến cách công nghệ hỗ trợ.</em>
              </h2>
              <p>
                Kính, ứng dụng và website là ba phần trong định hướng phát triển
                SeeVia. Trải nghiệm của cộng đồng giúp nhóm xác định điều cần ưu
                tiên và điều chỉnh.
              </p>
            </div>
            <div className="cp-ecosystem-grid">
              {[
                [
                  "Kính SeeVia",
                  "Ghi nhận hình ảnh theo yêu cầu, phản hồi bằng âm thanh.",
                  "/san-pham",
                ],
                [
                  "Ứng dụng",
                  "Định hướng hỗ trợ thiết lập thiết bị và cá nhân hóa trải nghiệm.",
                  "",
                ],
                [
                  "Website",
                  "Chia sẻ thông tin dự án, tư liệu và góc nhìn từ cộng đồng.",
                  "/ve-chung-toi",
                ],
              ].map(([title, description, href], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  {href ? (
                    <a className="cp-action cp-action-outline" href={href}>
                      Tìm hiểu thêm <Arrow />
                    </a>
                  ) : (
                    <small>Đang trong định hướng phát triển</small>
                  )}
                </article>
              ))}
            </div>
            <p className="cp-ecosystem-note">
              Mô hình phát triển dự kiến; chưa phải hệ thống đã triển khai đầy
              đủ.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      {notice && (
        <div className="notice visible" role="status">
          Nội dung đang được hoàn thiện
          <button aria-label="Đóng thông báo" onClick={() => setNotice(false)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
