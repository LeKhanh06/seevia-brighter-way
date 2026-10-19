import { navigate, type Destination } from "../navigation";
import Logo from "./Logo";
const groups: { title: string; links: [string, Destination?][] }[] = [
  {
    title: "KHÁM PHÁ SEEVIA",
    links: [
      ["Trang chủ", "home"],
      ["Tổng quan nhanh", "overview"],
      ["Kính SeeVia", "product"],
      ["Công nghệ", "technology"],
      ["Các khả năng hỗ trợ", "capabilities"],
    ],
  },
  {
    title: "GÓC NHÌN",
    links: [
      ["Về cộng đồng", "community"],
      ["Tin tức", "news"],
    ],
  },
  {
    title: "HỖ TRỢ & KẾT NỐI",
    links: [
      ["Câu hỏi thường gặp", "faq"],
      ["Góp ý", "feedback"],
      ["Liên hệ", "contact"],
      ["Hợp tác", "partnership"],
    ],
  },
  {
    title: "VỀ DỰ ÁN",
    links: [
      ["Về chúng tôi", "about"],
      ["Câu chuyện", "story"],
      ["Sứ mệnh và tầm nhìn", "mission"],
      ["Nhóm phát triển", "founders"],
    ],
  },
];
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a href="/" aria-label="SeeVia — Trang chủ"><Logo /></a>
          <p>
            Hướng đến trải nghiệm dễ tiếp cận, sự tự chủ và kết nối trong cuộc
            sống.
          </p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2>{g.title}</h2>
            {g.links.map(([label, to]) => (
              <button key={label} onClick={() => navigate(to)}>
                {label}
              </button>
            ))}
          </nav>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© 2026 SeeVia. Kính trợ lý AI cho cuộc sống độc lập hơn.</p>
        <button onClick={() => navigate("privacy")}>Chính sách bảo mật</button>
        <button onClick={() => navigate("terms")}>Điều khoản sử dụng</button>
      </div>
    </footer>
  );
}
