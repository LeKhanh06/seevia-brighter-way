import { useEffect, useRef, useState } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import glasses from "./assets/news-01.png";
import books from "./assets/news-03.jpg";
import education from "./assets/news-04.webp";
import { sourceLinks } from "./sourceLinks";
import { notes } from "./notes";
import "./styles/News.css";
import { translate, useLanguage } from "../src/i18n/language";

const categories = ["Tất cả", "Công nghệ", "Khả năng tiếp cận", "Từ SeeVia"];
const articles = [
  {
    id: "meta",
    category: 1,
    date: "11.03.2026",
    title: "Be My Eyes mở rộng kết nối hỗ trợ trên kính Meta",
    description:
      "Nhóm liên hệ tin cậy và hỗ trợ dịch vụ được đưa vào trải nghiệm trên kính thông minh.",
    image: glasses,
    alt: "Kính Ray-Ban Meta trong thông cáo Be My Eyes",
    source: "Be My Eyes",
    href: sourceLinks[0],
  },
  {
    id: "books",
    category: 2,
    date: "19.01.2026",
    title: "Sao Mai giới thiệu SM Readmate và Thư viện Sách Tiếp Cận",
    description:
      "Hướng dẫn tìm, tải, đọc và quản lý sách dành cho giáo viên và học viên tại ba đơn vị.",
    image: books,
    alt: "Buổi giới thiệu phần mềm và thư viện sách tại Trường Nguyễn Đình Chiểu",
    source: "Trung tâm Sao Mai",
    href: sourceLinks[1],
  },
  {
    id: "education",
    category: 2,
    date: "21.04.2025",
    title: "UNICEF: công nghệ số mở thêm cơ hội học tập hòa nhập",
    description:
      "Tiếp cận an toàn, phù hợp và hòa nhập là điều kiện để công nghệ mang lại lợi ích cho trẻ em khuyết tật.",
    image: education,
    alt: "Đại diện UNICEF cùng trẻ em trong tư liệu về giáo dục hòa nhập",
    source: "UNICEF Việt Nam",
    href: sourceLinks[2],
  },
  {
    id: "voice",
    category: 3,
    date: notes.voice.label,
    title: notes.voice.title,
    description: notes.voice.summary,
    image: "",
    alt: "",
    source: "SeeVia",
    href: "",
  },
  {
    id: "control",
    category: 3,
    date: notes.control.label,
    title: notes.control.title,
    description: notes.control.summary,
    image: "",
    alt: "",
    source: "SeeVia",
    href: "",
  },
  {
    id: "pilot",
    category: 3,
    date: notes.pilot.label,
    title: notes.pilot.title,
    description: notes.pilot.summary,
    image: "",
    alt: "",
    source: "SeeVia",
    href: "",
  },
];
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
function Arrow() {
  return (
    <svg
      className="np-arrow"
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

export default function News() {
  useLanguage();
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState("");
  const [note, setNote] = useState<keyof typeof notes | null>(null);
  const [notice, setNotice] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const shown = articles.filter(
    (article) =>
      (!filter || filter === article.category) &&
      normalize(
        `${article.title} ${article.description} ${article.source} ${translate(article.title, "en")} ${translate(article.description, "en")} ${translate(article.source, "en")}`,
      ).includes(normalize(search.trim())),
  );
  useEffect(() => {
    document.title = "Tin tức & Góc nhìn — SeeVia";
    const unavailable = () => setNotice(true);
    const shortcut = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !dialog.current?.open &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName ?? "",
        ) &&
        !(document.activeElement as HTMLElement)?.isContentEditable
      ) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("seevia:unavailable", unavailable);
    document.addEventListener("keydown", shortcut);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      main.current?.querySelectorAll<HTMLElement>(".np-reveal") ?? [],
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("np-pending");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    if (!motion.matches)
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top > innerHeight) {
          element.classList.add("np-pending");
          observer.observe(element);
        }
      });
    const reveal = () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("np-pending"));
    };
    const focus = (event: FocusEvent) =>
      elements.forEach((element) => {
        if (element.contains(event.target as Node))
          element.classList.remove("np-pending");
      });
    motion.addEventListener("change", reveal);
    document.addEventListener("focusin", focus);
    return () => {
      reveal();
      motion.removeEventListener("change", reveal);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("keydown", shortcut);
      window.removeEventListener("seevia:unavailable", unavailable);
    };
  }, []);
  useEffect(() => {
    if (note && !dialog.current?.open) dialog.current?.showModal();
  }, [note]);
  return (
    <div className="news-page">
      <a className="skip-link" href="#news-main">
        Đến nội dung chính
      </a>
      <Header active="news" />
      <main className="np-main" id="news-main" ref={main}>
        <section className="np-hero">
          <div className="np-container">
            <h1>
              Những chuyển động.
              <br />
              <em>Những góc nhìn mới.</em>
            </h1>
            <p>
              Tin tức về công nghệ hỗ trợ, khả năng tiếp cận và những điều
              SeeVia đang theo đuổi.
            </p>
            <a className="np-action np-action-light" href="#journal">
              Khám phá bài viết <Arrow />
            </a>
          </div>
        </section>
        <section className="np-feature np-section" id="featured">
          <div className="np-container">
            <article className="np-feature-grid np-reveal">
              <figure>
                <a
                  href={sourceLinks[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={glasses}
                    alt="Cận cảnh người đeo kính thông minh Ray-Ban trong thông cáo Be My Eyes"
                    fetchPriority="high"
                  />
                </a>
                <figcaption>
                  Ảnh: Be My Eyes · Sản phẩm trong ảnh không phải kính SeeVia.
                </figcaption>
              </figure>
              <div className="np-feature-copy">
                <p className="np-meta">
                  CÔNG NGHỆ HỖ TRỢ <span>11.03.2026</span>
                </p>
                <h2>
                  Kính thông minh mở thêm cách
                  <br />
                  <em>kết nối với người hỗ trợ.</em>
                </h2>
                <p>
                  Theo công bố của Be My Eyes, kết nối tới nhóm liên hệ tin cậy
                  và các đơn vị hỗ trợ dịch vụ được mở rộng qua kính Ray-Ban
                  Meta và Oakley Meta.
                </p>
                <a
                  className="np-action"
                  href={sourceLinks[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Đọc thông cáo gốc <Arrow />
                </a>
                <small>
                  Tin tham khảo từ Be My Eyes, không phải tính năng của SeeVia.
                </small>
              </div>
            </article>
          </div>
        </section>
        <section className="np-journal np-section" id="journal">
          <div className="np-container">
            <header className="np-heading">
              <h2>Tin tức và ghi chú</h2>
            </header>
            <div className="np-tools">
              <div
                className="np-filters"
                role="group"
                aria-label="Lọc bài viết theo chủ đề"
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
              <label className="np-search" htmlFor="news-search">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden="true"
                >
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <path d="m13 13 4 4" />
                </svg>
                <span className="np-sr-only">Tìm trong bài viết</span>
                <input
                  id="news-search"
                  ref={searchInput}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm bài viết…"
                  autoComplete="off"
                />
              </label>
            </div>
            <p className="np-result" role="status" aria-live="polite">
              {shown.length} bài viết
            </p>
            <div className="np-articles">
              {shown.map((article) => (
                <article className="np-row" key={article.id}>
                  {article.href ? (
                    <a
                      className="np-row-image"
                      href={article.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Đọc bài: ${article.title}`}
                    >
                      <img
                        src={article.image}
                        alt={article.alt}
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <button
                      className={`np-note-art np-note-${article.id}`}
                      onClick={() => setNote(article.id as keyof typeof notes)}
                      aria-label={`Đọc ghi chú: ${article.title}`}
                    >
                      <span aria-hidden="true">
                        {notes[article.id as keyof typeof notes].artwork}
                      </span>
                      <small>SEEVIA / GHI CHÚ</small>
                    </button>
                  )}
                  <div className="np-row-copy">
                    <p className="np-meta">
                      {categories[article.category]} <span>{article.date}</span>
                    </p>
                    <h3>
                      {article.href ? (
                        <a
                          href={article.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {article.title}
                        </a>
                      ) : (
                        <button
                          onClick={() =>
                            setNote(article.id as keyof typeof notes)
                          }
                        >
                          {article.title}
                        </button>
                      )}
                    </h3>
                    <p>{article.description}</p>
                    <small>
                      {article.source}
                      {article.href
                        ? " · Tin tham khảo"
                        : " · Định hướng dự án"}
                    </small>
                  </div>
                  {article.href ? (
                    <a
                      className="np-open"
                      href={article.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Đọc nguồn ${article.source}`}
                    >
                      <Arrow />
                    </a>
                  ) : (
                    <button
                      className="np-open"
                      onClick={() => setNote(article.id as keyof typeof notes)}
                      aria-label={`Mở ghi chú: ${article.title}`}
                    >
                      <Arrow />
                    </button>
                  )}
                </article>
              ))}
            </div>
            {!shown.length && (
              <div className="np-empty">
                <h3>Chưa có bài phù hợp.</h3>
                <p>Thử từ khóa khác hoặc xem lại tất cả bài viết.</p>
                <button
                  className="np-action"
                  onClick={() => {
                    setSearch("");
                    setFilter(0);
                    searchInput.current?.focus();
                  }}
                >
                  Xem tất cả <Arrow />
                </button>
              </div>
            )}
          </div>
        </section>
        <section className="np-perspective np-section" id="perspective">
          <div className="np-container">
            <h2>
              Công nghệ thay đổi.
              <br />
              <em>Ai sẽ được tiếp cận?</em>
            </h2>
            <p>
              Với SeeVia, tính hữu ích cần được đánh giá từ nhu cầu thực tế và
              trải nghiệm của người dùng.
            </p>
            <div className="np-actions">
              <a className="np-action np-action-light" href="/ve-chung-toi">
                Hiểu thêm về SeeVia <Arrow />
              </a>
              <a className="np-action np-action-light" href="/cong-dong">
                Góc nhìn cộng đồng <Arrow />
              </a>
            </div>
          </div>
        </section>
        <section className="np-sources">
          <div className="np-container">
            <p>
              Tin tham khảo được tóm tắt từ nguồn ghi kèm, với ngày đăng theo
              bài gốc. Ghi chú “Từ SeeVia” trình bày định hướng dự án, không
              phải thông báo ra mắt. Sản phẩm, tổ chức và hình ảnh bên ngoài
              không hàm ý quan hệ hợp tác với SeeVia. Danh sách này không cập
              nhật tự động.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <dialog
        className="np-dialog"
        ref={dialog}
        aria-labelledby="news-note-title"
        onClose={() => setNote(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <button
          className="np-dialog-close"
          aria-label="Đóng bài viết"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        <p className="np-eyebrow">
          TỪ SEEVIA / {note ? notes[note].label : ""}
        </p>
        <h2 id="news-note-title">{note ? notes[note].title : ""}</h2>
        {note &&
          notes[note].paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        <small>
          Biên soạn từ tài liệu dự án SeeVia. Nội dung trình bày định hướng và
          kế hoạch kiểm chứng.
        </small>
      </dialog>
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
