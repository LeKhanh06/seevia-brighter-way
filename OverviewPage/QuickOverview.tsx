import { useEffect } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { translate, useLanguage } from "../src/i18n/language";
import { pageRegistry } from "../src/navigation";
import aboutHero from "../AboutPage/assets/about-hero.jpg";
import Arrow from "../src/components/Arrow";
import "./styles/overview-tactile.css";

type Row = { title: string; text: string; points?: string[] };

// All four moments belong to the MVP (See & Read, Find & Understand), so each carries a dome tile.
const moments: Row[] = [
  {
    title: "Đọc thông tin trước mắt.",
    text: "SeeVia hướng tới đọc văn bản và tài liệu bằng công nghệ nhận dạng chữ OCR, rồi trả lời bằng âm thanh tiếng Việt khi người dùng yêu cầu.",
    points: ["Văn bản và tài liệu", "Nhãn và chữ in trong sinh hoạt"],
  },
  {
    title: "Nhận biết tiền Việt.",
    text: "Nhận diện tiền Việt là một trong những chức năng được giới thiệu cho kính SeeVia.",
  },
  {
    title: "Tìm một đồ vật quen thuộc.",
    text: "Định hướng Tìm & Hiểu bao gồm nhận diện vật thể phổ biến và tìm đồ vật trong khung cảnh.",
  },
  {
    title: "Mô tả khung cảnh xung quanh.",
    text: "SeeVia hướng tới mô tả thông tin trong hình ảnh và môi trường bằng lời nói khi người dùng yêu cầu.",
  },
];

function Points({ items }: { items: string[] }) {
  return (
    <ul className="ov-points">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function QuickOverview() {
  const language = useLanguage();

  useEffect(() => {
    document.title = translate("Tổng quan nhanh về SeeVia", language);
  }, [language]);

  return (
    <div className="quick-overview-page ov">
      <a className="skip-link" href="#overview-main">
        Đến nội dung chính
      </a>
      <Header active="overview" />
      <main id="overview-main">
        <section className="ov-hero" aria-labelledby="qv-hero-title">
          <h1 id="qv-hero-title">Kính trợ lý thị giác SeeVia.</h1>
          <p>
            Dự án phát triển bản mẫu kính ứng dụng AI, hướng tới việc đọc chữ,
            nhận biết đồ vật và mô tả xung quanh theo yêu cầu của người dùng.
          </p>
          <a className="button" href="#qv-intro">
            Tìm hiểu dự án <Arrow />
          </a>
        </section>

        <section className="ov-intro" id="qv-intro" aria-labelledby="qv-intro-title">
          <div className="ov-head">
            <h2 id="qv-intro-title">Thêm thông tin, thêm lựa chọn.</h2>
            <p>
              Đọc một tờ giấy, phân biệt đồ vật hay hiểu khung cảnh xung quanh
              đều cần thông tin. SeeVia hướng đến việc đưa những thông tin ấy
              thành lời nói theo yêu cầu của người dùng.
            </p>
          </div>
          <div className="ov-pair">
            <figure className="ov-photo">
              <img
                src={aboutHero}
                alt="Các thành viên cơ sở Ánh Dương tại TP.HCM quây quần trò chuyện quanh bàn"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                Ảnh tư liệu tại cơ sở Ánh Dương, TP.HCM; không mô tả hoạt động
                của SeeVia. Ảnh: Nguyễn Đạt /{" "}
                <a
                  href="https://vietnamnews.vn/sunday/features/427554/blind-man-s-massage-centres-provide-light-to-members.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Việt Nam News ↗
                </a>
              </figcaption>
            </figure>
            <div className="ov-belief">
              <h3>Đồng hành, không quyết định thay.</h3>
              <p>
                SeeVia hướng đến cung cấp thông tin để người dùng lựa chọn theo
                nhu cầu của mình.
              </p>
              <Points items={["Sự tự chủ", "Phẩm giá", "Quyền tiếp cận"]} />
            </div>
          </div>
        </section>

        <section className="ov-moments" id="qv-moments" aria-labelledby="qv-moments-title">
          <div className="ov-head">
            <h2 id="qv-moments-title">Đọc, nhận biết, hiểu cảnh.</h2>
            <p>
              Các tình huống này minh họa những chức năng được giới thiệu trên
              trang Sản phẩm. Chúng đang trong quá trình phát triển bản mẫu, chưa
              phải tính năng đã được kiểm chứng.
            </p>
          </div>
          <ol className="ov-walk">
            {moments.map((row) => (
              <li key={row.title}>
                <span className="tile tile-dome" aria-hidden="true" />
                <h3>{row.title}</h3>
                <div>
                  <p>{row.text}</p>
                  {row.points && <Points items={row.points} />}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="ov-path" id="qv-path" aria-labelledby="qv-path-title">
          <div className="ov-head">
            <h2 id="qv-path-title">Từ bản mẫu đến thử nghiệm.</h2>
            <p>
              SeeVia đang hoàn thiện bản mẫu. Các bước tiếp theo là thử nghiệm có
              hướng dẫn và cải tiến theo phản hồi; thời điểm ra mắt chưa được xác
              định.
            </p>
          </div>
          <ol className="ov-steps">
            <li className="is-now">
              <span className="tile tile-dome" aria-hidden="true" />
              <h3>Bản mẫu đang được hoàn thiện.</h3>
              <p>
                Bản mẫu hướng đến camera theo yêu cầu, microphone, nút bấm và
                phản hồi âm thanh bằng tiếng Việt.
              </p>
              <Points items={["Camera theo yêu cầu", "Nút bấm và lệnh giọng nói"]} />
              <strong className="ov-status">HIỆN TẠI</strong>
            </li>
            <li>
              <span className="tile tile-rib" aria-hidden="true" />
              <h3>Thử nghiệm có hướng dẫn.</h3>
              <p>
                Giai đoạn tiếp theo là thử nghiệm có hướng dẫn, rồi cải tiến bản
                mẫu theo phản hồi. Lịch dùng thử chưa được công bố.
              </p>
              <Points items={["Cải tiến theo phản hồi", "Ra mắt: chưa xác định"]} />
              <strong className="ov-status">TIẾP THEO</strong>
            </li>
          </ol>
        </section>

        <section className="ov-close" id="overview-next" aria-labelledby="qv-closing-title">
          <div className="ov-close-copy">
            <h2 id="qv-closing-title">Tìm hiểu thêm về SeeVia.</h2>
            <p>
              Xem chi tiết thiết kế, công nghệ và tiến trình trên trang Sản phẩm;
              hoặc gửi câu hỏi, góp ý qua trang Liên hệ.
            </p>
            <div className="ov-actions">
              <a className="button" href={pageRegistry.productPage.href}>
                Xem trang Sản phẩm <Arrow />
              </a>
              <a className="button button-outline" href={pageRegistry.contact.href}>
                Liên hệ SeeVia <Arrow />
              </a>
            </div>
          </div>
          <div className="ov-status-slab">
            <h3>Chưa công bố lịch ra mắt.</h3>
            <p>
              SeeVia đang hoàn thiện bản mẫu, chưa mở bán và chưa có giá bán chính
              thức.
            </p>
            <Points
              items={[
                "Sơ đồ và tương tác trên website là minh họa định hướng",
                "Kính được định hướng bổ sung thông tin, không thay thế gậy trắng hoặc kỹ năng định hướng",
              ]}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
