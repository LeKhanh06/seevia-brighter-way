# Trang Tin tức

Đường dẫn: `/tin-tuc` · [Tài liệu dự án](../README.md)

Dùng Header/Footer và font chữ chung của SeeVia.

- `News.tsx`: bố cục, sáu bài viết, bộ lọc chủ đề, tìm kiếm Việt/Anh không phân biệt dấu và hộp đọc ba bài từ dự án.
- `notes.ts`: ba bài “Từ SeeVia” được biên soạn lại theo `NỘI DUNG TỔNG HỢP (1).docx`: phạm vi bản mẫu, thiết kế tương tác và kế hoạch kiểm chứng. Tiêu đề, mô tả ngắn, nhãn chủ đề và nội dung đọc đầy đủ nằm cùng một nguồn dữ liệu.
- `sourceLinks.ts`: liên kết ba tin bên ngoài được chuyển từ `SeeVia_Tin_tuc.html` do người dùng cung cấp.
- `assets/`: ảnh tư liệu tách từ file mẫu. Ảnh kính Meta là sản phẩm bên ngoài, không phải SeeVia.
- `styles/News.css`: giao diện có phạm vi riêng, responsive và hỗ trợ giảm chuyển động.

Ngày đăng và nội dung tin theo bản HTML được cung cấp. Đây là danh sách biên tập tĩnh, không phải nguồn tin cập nhật tự động. Tìm kiếm/bộ lọc chạy trong trình duyệt; bài bên ngoài dẫn tới nguồn gốc. Ghi chú SeeVia trình bày định hướng, không phải thông báo ra mắt.

Các tài liệu HTML/DOCX gốc được dùng để biên tập nội dung, không cần có trên máy để chạy ứng dụng. Khi sửa bài, cập nhật cả [bản dịch](../src/i18n/README.md).

Kiểm tra: `node tests/news-check.mjs` khi Vite chạy cổng 5176; có thể đặt `BASE_URL` để đổi cổng.
