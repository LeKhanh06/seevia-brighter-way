# Gửi lời nhắn qua Mailgun

Backend dùng Node.js 24 và HTTP API Mailgun, không cần thêm thư viện. Khóa chỉ nằm trong `contact-backend/.env` đã được `.gitignore` loại trừ; tuyệt đối không đặt vào biến `VITE_*`. Xem [tài liệu dự án](../README.md).

## Chạy local

1. Tạo `contact-backend/.env` theo [`.env.example`](.env.example) nếu chưa có, điền domain, khóa, vùng Mailgun và địa chỉ nhận `MAIL_TO`. Không ghi đè file đã có cấu hình. Trình duyệt không được chọn người nhận.
2. Chạy `npm run server` ở thư mục gốc. Server mặc định `http://127.0.0.1:3001`.
3. Chạy Vite như trước. `/api` được proxy tới backend. Nếu đổi cổng frontend, thêm origin chính xác vào `ALLOWED_ORIGIN`.

Trang Liên hệ kiểm tra `/api/contact/status`. Nếu cấu hình server chưa đủ hoặc không kết nối được, vẫn cho lưu bản nháp; nếu sẵn sàng, nút **Gửi lời nhắn** xuất hiện trong hộp xem lại. Thông báo thành công chỉ được hiển thị sau khi Mailgun chấp nhận email, không khẳng định thư đã được giao vào inbox.

## Chạy bản build

Chạy `npm run build`, rồi `npm run server`. Backend phục vụ cả `dist` và API trên cùng địa chỉ; mở `/lien-he`. Khi triển khai lên hosting Node, đặt `HOST=0.0.0.0`, `PORT` theo nền tảng, và cấu hình domain/origin thật. Nếu frontend ở hosting riêng, đặt `VITE_CONTACT_API_BASE=https://your-backend.example` trước khi build và thêm origin frontend vào `ALLOWED_ORIGIN` của backend. Hosting tĩnh đơn thuần không chạy được server Node.

`TRUST_PROXY` mặc định `false`. Chỉ bật nếu ứng dụng nằm sau proxy tin cậy, không thể truy cập trực tiếp và proxy ghi lại `X-Forwarded-For`; mã sử dụng địa chỉ gần proxy nhất để giới hạn tần suất. Bộ đếm nằm trong RAM, phù hợp một tiến trình; nhiều instance cần bộ đếm chung.

Sandbox Mailgun chỉ gửi đến người nhận đã xác minh. Domain riêng cần xác minh DNS và chọn đúng vùng US/EU. Xem [tài liệu Mailgun HTTP API](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/send-http).

## Kiểm tra

- `npm run test:mail`: kiểm thử API/nhà cung cấp giả lập, không gửi thư.
- `node tests/contact-send-check.mjs`: kiểm tra giao diện bằng phản hồi giả lập, không gửi thư.
- `node --env-file=contact-backend/.env contact-backend/send-test.mjs`: **gửi một thư thật** tới `MAIL_TO`, chỉ chạy khi muốn kiểm tra.

API kiểm tra nội dung, giới hạn 5 lần / 10 phút / IP, giới hạn kích thước, honeypot và origin. Email người gửi là `Reply-To` nếu được nhập; Mailgun luôn dùng địa chỉ From của domain. Theo dõi mở/nhấp bị tắt; lỗi trả về không chứa thông tin bí mật hoặc phản hồi chi tiết của nhà cung cấp.
