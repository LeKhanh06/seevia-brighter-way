# Ngôn ngữ VI / EN

[Tài liệu dự án](../../README.md)

Header chuyển ngôn ngữ ngay trên trang qua `useLanguage()` và `setLanguage()` trong `language.ts`. Lựa chọn được lưu dưới khóa `seevia-language` trong `localStorage`; khi trình duyệt không cho lưu, lựa chọn vẫn hoạt động trong phiên trang hiện tại. Thuộc tính `lang` của trang và tiêu đề tab cập nhật cùng ngôn ngữ. Đường dẫn không thay đổi.

## Chỉnh sửa bản dịch

`en.json` chứa các cặp **nội dung tiếng Việt → bản dịch tiếng Anh**, bao gồm nội dung trang, nhãn trợ năng, hội thoại, ghi chú tin tức và chính sách. Khi thêm hoặc sửa một đoạn tiếng Việt trong component/data, cập nhật mục tương ứng ở đây. Tên riêng và liên kết nguồn giữ nguyên khi phù hợp.

Các chuỗi ghép động như nhãn đọc bài, vị trí thành phần kính được xử lý trong `language.ts`. `LanguageEffects.tsx` quản lý tiêu đề tab theo đường dẫn.

## Cách hoạt động

JSX runtime dịch văn bản và mô tả trợ năng trong quá trình React render. ID, key, ref, sự kiện, giá trị biểu mẫu và trạng thái ứng dụng được giữ nguyên. Các đoạn HTML tĩnh của About/Policy được dịch trong template tách biệt rồi render lại qua React, không sửa trực tiếp DOM đang do React quản lý.

Dùng `translate="no"` cho nội dung do người dùng nhập; phần xem trước lời nhắn đã áp dụng. Các tiêu đề trong tệp tải xuống dùng ngôn ngữ đang chọn, còn lời nhắn gốc giữ nguyên. Chức năng này không gọi dịch vụ dịch bên ngoài và không cần API key dịch thuật.

`vite.config.ts` và `tsconfig.json` cấu hình runtime cục bộ. Runtime được loại khỏi bước prebundle thư viện để giữ chung trạng thái ngôn ngữ và hỗ trợ cập nhật mã khi phát triển.

## Kiểm tra

Chạy `node tests/language-check.mjs` từ thư mục gốc khi Vite hoạt động tại cổng 5176. Kiểm tra bao gồm 11 đường dẫn, chuyển ngôn ngữ qua lại, ghi nhớ lựa chọn, giữ/tải bản nháp, tìm kiếm và hội thoại trên ba kích thước màn hình. Có thể đặt `BASE_URL` để kiểm tra bản preview hoặc cổng khác.
