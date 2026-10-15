import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./SiteInformation.css";
export default function SiteInformation() {
  useEffect(() => {
    document.title = "Thông tin sử dụng website — SeeVia";
  }, []);
  return (
    <>
      <Header />
      <main className="site-information">
        <h1>Thông tin sử dụng website</h1>
        <section id="privacy">
          <h2>Chính sách bảo mật</h2>
          <p>
            Biểu mẫu Liên hệ cho phép lưu bản nháp hoặc gửi lời nhắn qua Mailgun
            khi kênh gửi sẵn sàng. Nội dung chỉ được chuyển đi khi bạn chọn Gửi
            lời nhắn. Tên và email không bắt buộc.
          </p>
          <p>
            Khi chọn sao chép hoặc tải về, nội dung được lưu vào bộ nhớ tạm hoặc
            tệp trên thiết bị của bạn. Các liên kết nguồn mở website bên ngoài,
            nơi có chính sách riêng.
          </p>
          <p>
            Xem chi tiết về dữ liệu gửi qua Mailgun tại trang Chính sách bảo
            mật.
          </p>
        </section>
        <section id="terms">
          <h2>Điều khoản sử dụng</h2>
          <p>
            SeeVia đang phát triển bản mẫu. Nội dung công nghệ và hướng hợp tác
            thể hiện định hướng dự án, không phải cam kết về sản phẩm thương
            mại, lịch dùng thử hay quan hệ đối tác đã xác nhận.
          </p>
          <p>
            Các phần hội thoại và tương tác trên website là minh họa. Kính hướng
            đến bổ sung thông tin, không thay thế gậy trắng hoặc kỹ năng định
            hướng.
          </p>
          <p>
            Ảnh và bài viết tư liệu có nguồn riêng. Nhân vật trong tư liệu không
            mặc nhiên là người dùng, nhà sáng lập hoặc đối tác SeeVia.
          </p>
        </section>
        <a href="/lien-he">Đến trang Liên hệ ↗</a>
      </main>
      <Footer />
    </>
  );
}
