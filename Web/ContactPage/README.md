# Liên hệ

Đường dẫn: `/lien-he` · [Tài liệu dự án](../README.md)

Trang dùng Header/Footer chung và nội dung biên tập từ `SeeVia_Lien_he.html`. Kênh gửi email qua Mailgun được cấu hình tại `contact-backend`; xem [hướng dẫn backend](../contact-backend/README.md) để chạy server.

Biểu mẫu cho chọn chủ đề; tên, email hợp lệ và lời nhắn đều bắt buộc. Lời nhắn tối đa 3000 ký tự. Bản nháp có thể xem trong dialog, sao chép và tải tệp văn bản. Khi backend sẵn sàng, người dùng có thể xác nhận gửi email trong dialog; thông báo cảm ơn chỉ hiện sau khi API xác nhận thành công. Lỗi gửi giữ nguyên nội dung; khi backend không khả dụng, trang vẫn cho lưu bản nháp. Không có FAQ. Hiệu ứng mở đầu tôn trọng thiết lập giảm chuyển động.

`Contact.tsx` quản lý giao diện và trạng thái; `contactApi.ts` dựng địa chỉ API từ `VITE_CONTACT_API_BASE` nếu được cấu hình. Việc chuyển VI/EN không dịch lời nhắn người dùng nhập. Kiểm tra giao diện gửi bằng `node tests/contact-send-check.mjs` với phản hồi giả lập, không gửi email thật.
