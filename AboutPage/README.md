# Về chúng tôi

Đường dẫn: `/ve-chung-toi` · [Tài liệu dự án](../README.md)

## Cấu trúc

| File                | Vai trò                                                     |
| ------------------- | ----------------------------------------------------------- |
| `About.tsx`         | Header/Footer chung, nạp nội dung và ảnh, hiệu ứng khi cuộn |
| `aboutContent.html` | Nội dung giới thiệu, tư liệu, nhóm sáng lập và liên kết     |
| `styles/About.css`  | Giao diện trong phạm vi `.about-editorial`                  |
| `assets/`           | Ảnh riêng của trang                                         |

Trang có sáu phần: mở đầu, lý do phát triển, bốn câu chuyện tư liệu, định hướng, năm nhà sáng lập và kết nối. Hero dùng gradient kem; hai phần lý do và định hướng dùng nền tối với sắc đỏ đô. Font chữ và các nút theo hệ thống chung.

## Ảnh và nội dung

Ảnh mở đầu là `about-hero.jpg`: sinh hoạt tại cơ sở Ánh Dương, TP.HCM, ghi nguồn Việt Nam News và tác giả Nguyễn Đạt.

Bốn câu chuyện sử dụng `story-01.jpg`, `story-05.jpg`, `story-02.webp` và `story-03.png`, với nguồn và liên kết riêng. Các ảnh đang dùng không có logo báo đóng trên ảnh. Mục nhóm sáng lập dùng năm ảnh chân dung cục bộ trong `assets/founders/`, theo thứ tự Phạm Ngọc Hương, Hồ Hoàng Luân, Lữ Kim Luân, Nguyễn Thị Lệ Khanh và Nguyễn Lý Diệu Anh. Ảnh chân dung không được đưa lên GitHub; khi không có ảnh, trang hiển thị hình đại diện ẩn danh. Tên, vai trò và phạm vi phụ trách được căn thành các hàng đều nhau.

Các anchor chính: `#story`, `#evidence`, `#mission`, `#vision`, `#founders`, `#about-listen`. CTA cuối dẫn tới `/cong-dong` và `/doi-tac`.

Khi thay ảnh, thêm đường dẫn tương ứng vào danh sách import trong `About.tsx` và cập nhật alt, chú thích, nguồn. Nội dung tiếng Anh được quản lý ở [bộ bản dịch](../src/i18n/README.md).
