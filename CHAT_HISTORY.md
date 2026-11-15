# Lưu lịch sử hội thoại SeeVia AI

Lớp lưu trữ nằm ở `src/support/chatSessions.ts`. Lớp này chỉ nằm ở frontend và không đổi hợp đồng API: `/api/assistant` vẫn nhận `message`, `history` (≤ 6 lượt, ≤ 3200 ký tự) và `recentSuggestions` (≤ 6). Backend và dữ kiện của trợ lý được mô tả trong [contact-backend/README.md](contact-backend/README.md#trợ-lý-seevia-ai).

## Cách hoạt động

- **Một store duy nhất ngoài component.** Đóng/mở chatbot chỉ đổi cờ giao diện (`open`), không chạm store. Chuyển trang trong SPA không làm mất state; tải lại trang thì khôi phục từ `localStorage` (khóa `seevia.chat.v1`).
- **Chỉ `startNewSession()` mới tạo phiên khác.** Phiên cũ được giữ riêng, xem lại bằng `listSessions()` và `switchTo(id)`. Nếu phiên hiện tại chưa có câu hỏi nào thì dùng lại, không sinh phiên rỗng.
- **Khôi phục đầy đủ:** tin nhắn, lời chào (không gọi lại Cohere `mode: "welcome"`), gợi ý đang hiển thị và `recentSuggestions`.
- **Tiết kiệm token:** `buildApiContext()` bỏ lời chào và thông báo lỗi, giữ tối đa 6 lượt gần nhất, câu trả lời cũ rút còn 400 ký tự, câu trả lời gần nhất giữ tới 800 ký tự để các câu như "Tại sao?" vẫn hiểu.
- **Quyền riêng tư và dung lượng:** chỉ lưu trên thiết bị; không lưu khóa, token hay các trường tên giống bí mật. Tối đa 20 phiên, 80 tin/phiên, 2400 ký tự/tin, ~300 KB tổng, tự hết hạn sau 30 ngày. Hết dung lượng thì loại phiên cũ nhất (không bao giờ loại phiên đang mở); không ghi được thì chạy trong RAM (`persistent = false`).
- **`clearAll()`** xóa toàn bộ lịch sử trên thiết bị, dành cho nút "Xóa lịch sử" trong cài đặt/quyền riêng tư.

## Vì sao lịch sử chỉ giữ 30 ngày

Chatbot nhận văn bản tự do nên người dùng có thể gõ cả thông tin riêng tư, và lịch sử nằm trong trình duyệt của thiết bị. Tự xóa sau 30 ngày để hội thoại cũ không nằm lại vô thời hạn, nhất là trên máy dùng chung hoặc máy mượn. Mốc này đủ dài để người dùng quay lại xem câu trả lời trước đó, đồng thời giữ kho lưu không đầy (xem giới hạn 20 phiên và khoảng 300 KB ở trên). Con số 30 là lựa chọn thiết kế, không phải ràng buộc kỹ thuật; nếu đổi, cập nhật cả giao diện (dòng "tự xóa sau 30 ngày" trong Lịch sử) và dữ kiện "Riêng tư" của trợ lý trong `contact-backend/assistant-knowledge.mjs`.

## Đã nối vào widget

`src/components/SeeViaSupport.tsx` dùng `chatStore` (qua `src/support/chatStore.ts`) thay cho `useState` của tin nhắn và gợi ý:

- Nút **Xóa hội thoại** đổi thành **Cuộc trò chuyện mới**; phiên cũ nằm trong nút **Lịch sử (n)** (mở lại, xóa từng phiên, xóa toàn bộ).
- Câu hỏi bị gián đoạn (đóng trang, mất kết nối) hiện lại khối lỗi kèm nút **Thử lại câu hỏi** sau khi mở lại chatbot.
- Lời chào và câu hỏi gợi ý mở đầu chỉ gọi Cohere khi phiên còn trống; phiên đã có gợi ý thì khôi phục, không gọi lại.
- Sửa luôn các chuỗi bị lỗi `?` trong liên kết trang ("Trang bạn đang tìm", "Mở trang …", mũi tên ↗).
- `SeeViaSupport.css` chỉ thêm khối class `sv-support-history*` và `sv-support-topline-actions` ở cuối file.

## Kiểm thử

`node --test tests/chat-sessions.test.mjs` (Node ≥ 22.18, chạy trực tiếp file `.ts`). 21 kiểm thử gồm: đóng/mở, tải lại, câu hỏi bị gián đoạn, phiên mới, không sinh phiên rỗng, khôi phục phiên cũ, trả lời đến muộn, xóa chủ động, giới hạn phiên/tin/dung lượng, hết quota, dữ liệu hỏng, kho bị chặn, hết hạn, không lưu bí mật, đồng bộ nhiều tab, ngữ cảnh gửi Cohere, tương thích `validateQuestion`, và một lượt gọi thật qua `createAssistantHandler` (Cohere giả lập) kiểm tra `CONVERSATION_HISTORY` sau khi tải lại.
