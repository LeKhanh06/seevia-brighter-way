# Backend: gửi lời nhắn (Mailgun) và trợ lý SeeVia AI

Backend dùng Node.js 24, HTTP API Mailgun và HTTP API Cohere, không cần thêm thư viện. Tài liệu này có hai phần: gửi lời nhắn qua Mailgun và [trợ lý SeeVia AI](#trợ-lý-seevia-ai). Khóa chỉ nằm trong `contact-backend/.env` đã được `.gitignore` loại trừ; tuyệt đối không đặt vào biến `VITE_*`. Xem [tài liệu dự án](../README.md).

## Chạy local

1. Tạo `contact-backend/.env` theo [`.env.example`](.env.example) nếu chưa có, điền domain, khóa, vùng Mailgun và địa chỉ nhận `MAIL_TO`. Không ghi đè file đã có cấu hình. Trình duyệt không được chọn người nhận.
2. Chạy `npm run server` ở thư mục gốc. Server mặc định `http://127.0.0.1:3001`.
3. Chạy Vite như trước. `/api` được proxy tới backend. Nếu đổi cổng frontend, thêm origin chính xác vào `ALLOWED_ORIGIN`.

Trang Liên hệ kiểm tra `/api/contact/status`. Nếu cấu hình server chưa đủ hoặc không kết nối được, vẫn cho lưu bản nháp; nếu sẵn sàng, nút **Gửi lời nhắn** xuất hiện trong hộp xem lại. Thông báo thành công chỉ được hiển thị sau khi Mailgun chấp nhận email, không khẳng định thư đã được giao vào inbox.

## Chạy bản build

Chạy `npm run build`, rồi `npm run server`. Backend phục vụ cả `dist` và API trên cùng địa chỉ; mở `/lien-he`. Khi triển khai lên hosting Node, đặt `HOST=0.0.0.0`, `PORT` theo nền tảng, và cấu hình domain/origin thật. Nếu frontend ở hosting riêng, đặt `VITE_CONTACT_API_BASE=https://your-backend.example` trước khi build và thêm origin frontend vào `ALLOWED_ORIGIN` của backend. Hosting tĩnh đơn thuần không chạy được server Node.

`TRUST_PROXY` mặc định `false`. Chỉ bật nếu ứng dụng nằm sau proxy tin cậy, không thể truy cập trực tiếp và proxy ghi lại `X-Forwarded-For`; mã sử dụng địa chỉ gần proxy nhất để giới hạn tần suất. Bộ đếm nằm trong RAM, phù hợp một tiến trình; nhiều instance cần bộ đếm chung.

Sandbox Mailgun chỉ gửi đến người nhận đã xác minh. Domain riêng cần xác minh DNS và chọn đúng vùng US/EU. Xem [tài liệu Mailgun HTTP API](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/send-http).

## Vercel

`api/contact.mjs` dùng lại handler từ `server.mjs`, hỗ trợ body JSON đã được Vercel phân tích. Trợ lý SeeVia AI là một hàm riêng, `api/assistant.mjs`, dùng lại `createAssistantHandler` từ `contact-backend/assistant.mjs` và luôn đặt `TRUST_PROXY=true` (Vercel là proxy tin cậy nên bộ đếm lấy IP từ `X-Forwarded-For`). Cả hai hàm có `maxDuration` 30 giây trong `vercel.json`. Đường dẫn `/api/assistant/status` được rewrite sang `/api/assistant?assistant_status=1`, tương tự `/api/contact/status`; khi chạy local bằng `npm run server`, `server.mjs` tự định tuyến cả `/api/assistant` và `/api/assistant/status`. `vercel.json` cấu hình luồng kiểm tra trạng thái, route API và fallback các trang React. Function không gọi `listen()` và không phục vụ thư mục `dist`; phần giao diện do Vercel phục vụ riêng.

Đặt các biến `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_REGION`, `MAIL_FROM`, `MAIL_TO` ở Environment Variables trên Vercel; để dùng trợ lý, thêm `COHERE_API_KEY`, `ASSISTANT_REDIS_REST_URL`, `ASSISTANT_REDIS_REST_TOKEN`. Không upload `.env`. Dùng cùng domain cho giao diện/API thì không cần `VITE_CONTACT_API_BASE` hoặc origin bổ sung. Adapter Vercel dùng IP từ proxy nền tảng cho bộ đếm.

Giới hạn RAM chỉ áp dụng trên từng instance đang hoạt động, không phải hạn mức chung cho mọi function. Nếu cần chống spam xuyên instance, dùng bộ đếm chia sẻ hoặc quy tắc ở tầng nền tảng.

## Kiểm tra

- `npm run test:mail`: kiểm thử API/nhà cung cấp giả lập, không gửi thư.
- `node tests/contact-send-check.mjs`: kiểm tra giao diện bằng phản hồi giả lập, không gửi thư.
- `node --env-file=contact-backend/.env contact-backend/send-test.mjs`: **gửi một thư thật** tới `MAIL_TO`, chỉ chạy khi muốn kiểm tra.

API kiểm tra nội dung, giới hạn 5 lần / 10 phút / IP, giới hạn kích thước, honeypot và origin. Email người gửi là `Reply-To` nếu được nhập; Mailgun luôn dùng địa chỉ From của domain. Theo dõi mở/nhấp bị tắt; lỗi trả về không chứa thông tin bí mật hoặc phản hồi chi tiết của nhà cung cấp.

## Trợ lý SeeVia AI

Chatbot trên website gọi `POST /api/assistant` và `GET /api/assistant/status` (mã trong `assistant.mjs`, được `server.mjs` định tuyến). Mọi câu trả lời do Cohere viết; không có câu trả lời mẫu hay nhà cung cấp dự phòng. Khi thiếu cấu hình, server trả lỗi 503 `not_configured` và không gọi nhà cung cấp.

### Cấu hình

| Biến | Ý nghĩa |
| --- | --- |
| `COHERE_API_KEY` | Bắt buộc. Chỉ đặt ở server, không đặt trong `VITE_*`. |
| `COHERE_MODEL` | Tùy chọn, mặc định và hiện chỉ hỗ trợ `command-a-03-2025`. |
| `ASSISTANT_REDIS_REST_URL`, `ASSISTANT_REDIS_REST_TOKEN` | Bộ đếm giới hạn tần suất dùng chung. **Bắt buộc trên Vercel** (`VERCEL=1`), tùy chọn khi chạy local. Phải là địa chỉ `https`. |
| `ASSISTANT_RATE_SALT` | Tùy chọn. Muối để băm IP trong bộ đếm; mặc định dùng khóa Cohere. |
| `ASSISTANT_LOG=1` | Bật log có cấu trúc (mã yêu cầu, giai đoạn, thời gian, token; không ghi nội dung câu hỏi, khóa hay IP). |
| `VITE_ASSISTANT_API_BASE` | Dùng khi frontend và backend khác domain; nếu bỏ trống, frontend dùng `VITE_CONTACT_API_BASE`. |

`ALLOWED_ORIGIN` và `TRUST_PROXY` hoạt động như phần Mailgun ở trên.

### Giới hạn

- Câu hỏi tối đa 1000 ký tự; lịch sử gửi kèm tối đa 6 lượt, 3200 ký tự; gợi ý gần đây tối đa 6.
- Mỗi IP tối đa 6 yêu cầu mỗi phút và 40 mỗi ngày; toàn hệ thống tối đa 150 mỗi ngày. Chỉ tối đa 2 yêu cầu suy luận chạy cùng lúc.
- Câu trả lời tối đa 2000 ký tự (1400 token đầu ra). Câu trả lời sai lược đồ hoặc không có căn cứ bị loại và mô hình được yêu cầu viết lại đúng một lần; nếu vẫn không đạt, giao diện báo chưa có câu trả lời xác minh được.
- Lỗi hạn mức Cohere (429) trả về thời gian chờ và không được thử lại.

### Cách trợ lý chọn dữ kiện

`assistant-knowledge.mjs` chứa các mục kiến thức đã duyệt. Mỗi mục có `id`, `title`, `tags` (từ khóa không dấu, viết thường) và `facts`. Hàm `retrieve` chấm điểm theo `tags` rồi gửi tối đa bốn mục cùng mục `status` cho mô hình; câu hỏi không khớp mục nào nhận phần tổng quan (`status`, `mission`, `functional-groups`, `users`). Mô hình chỉ được trích dẫn mục có trong dữ kiện gửi kèm.

Khi thêm hoặc sửa kiến thức:

- Viết `facts` bằng câu đầy đủ, nêu rõ cái gì đã xác nhận và cái gì mới là định hướng. Không thêm giá, ngày, thông số hay đối tác chưa xác nhận.
- Thêm `tags` theo cách người dùng thật sự hỏi. Một từ chung như "hỗ trợ" có thể kéo nhầm mục khác; đã có nhận diện câu hỏi chung về khả năng ("hỗ trợ những việc gì", "làm được gì") để ưu tiên nhóm chức năng.
- Giữ nội dung quyền riêng tư khớp với hành vi thật của giao diện (lịch sử lưu trên thiết bị, tự xóa sau 30 ngày; xem [CHAT_HISTORY.md](../CHAT_HISTORY.md)).
- Quy tắc giọng văn và định dạng nằm ở `assistant-prompt.mjs`; danh mục trang hợp lệ nằm ở `src/support/pages.json`.

### Kiểm tra

- `npm run test:assistant`: kiểm thử với Cohere giả lập, không gọi Cohere thật.
- `node --env-file=contact-backend/.env contact-backend/verify-cohere.mjs`: **gọi Cohere thật** với các câu hỏi ngoài danh sách mẫu và in từng giai đoạn của mỗi lượt; tiêu tốn hạn mức, chỉ chạy khi muốn kiểm tra.
