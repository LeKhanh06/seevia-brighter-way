# Hội thoại và gợi ý động — 17/10/2026

Lưu ý cập nhật: kiểm thử provider và hành vi model Groq bên dưới là lịch sử trước khi chuyển. Cấu hình hiện tại dùng Cohere Command A; xem [hướng dẫn Cohere hiện hành](seevia-assistant.md). Chưa lấy các kết quả Groq làm bằng chứng Cohere hoạt động.

## Cơ chế đã bỏ

- Bỏ `initialQuestions` và các chip mở đầu cố định, không chỉ thay nội dung danh sách.
- Bỏ các phép đổi câu theo mẫu “Bạn muốn…” → “Tôi muốn…” và các phép viết lại theo chủ đề sản phẩm. Backend không chọn câu thay thế nếu loại gợi ý.
- Không có cây hội thoại, hàng đợi chủ đề, bộ ba loại câu bắt buộc hoặc câu mẫu fallback. Các đầu vào viết sẵn trong file `tests/` là ca đánh giá, không được import vào production.
- Không dùng regex kết thúc hội thoại để ép bộ gợi ý; model tự quyết định theo cuộc trò chuyện. Hàm nhận diện kết thúc cũ chỉ còn hỗ trợ xác nhận lời chào ngắn không cần trích nguồn, không chọn nội dung.

## Cơ chế hiện tại

Một lần gọi model Groq hiện có tạo `answer` rồi `suggested_questions`, cùng metadata nguồn/route đã có. Không thêm model, lời gọi sinh gợi ý, tóm tắt hay kiểm tra ngữ nghĩa riêng.

System prompt yêu cầu tự xem mục tiêu được nêu, nội dung answer/lịch sử đã giải quyết, điểm còn thiếu và dữ kiện hỗ trợ, nhưng không xuất quá trình phân tích. Mỗi gợi ý phải khác ý định và chưa được giải đáp; không tự chuyển chủ đề để đủ số lượng, không gán sở thích chưa xác nhận. Gợi ý rỗng được giữ rỗng.

Lịch sử gần đây gửi bằng các role user/assistant thực, sau khối dữ liệu tham khảo và trước câu hỏi hiện tại. Không gửi trùng câu hỏi trong khối dữ liệu. Tối đa sáu tin nhắn, mỗi tin tối đa 800 ký tự, tổng tối đa 3.200 ký tự; bỏ lượt cũ theo cặp nếu vượt ngân sách. `RECENT_SUGGESTIONS` tối đa sáu câu là lựa chọn đã hiển thị, tách riêng hoàn toàn với nội dung đã hỏi/đáp. Không lưu bộ nhớ dùng chung giữa phiên.

Backend chỉ chuẩn hóa định dạng/an toàn và lọc trùng. Ngoài chuẩn hóa hoa/thường, khoảng trắng, dấu câu, có so sánh tập từ sau khi bỏ phần dẫn nhập chung để loại câu gần như giống hệt. Đây là bộ lọc từ vựng, không phải bộ hiểu đồng nghĩa hoàn chỉnh. Gợi ý không đúng góc nhìn hoặc cấu trúc bị loại, không được viết lại hoặc bù câu khác. Trùng nội dung đã được giải đáp bằng cách diễn đạt khác vẫn chủ yếu dựa vào model và ngữ cảnh.

Khi Groq trả lỗi giới hạn số nguồn của schema, đã bỏ giới hạn ba nguồn không cần thiết: mọi ID vẫn phải thuộc các đoạn đã truy xuất. Nút trang vẫn được backend giới hạn theo yêu cầu điều hướng và registry. Giới hạn gợi ý cuối cùng tối đa ba được thực thi trong mã; tránh để lỗi phần gợi ý làm mất câu trả lời hợp lệ. Schema nghiêm ngặt vẫn giữ kiểu dữ liệu, required và additionalProperties.

Ngân sách completion tối đa 2.400 token, reasoning medium, không hiển thị suy luận. Đây là giới hạn trên để tránh JSON bị cắt; không tuyên bố tiết kiệm token. Không tự retry/fallback khi quota hoặc đầu ra lỗi.

## Kiến thức và hiển thị

- Bổ sung từ khóa và mô tả nguồn về giấy lệch/nghiêng, căn giấy bằng hướng dẫn âm thanh; phân biệt với việc tự động xoay ảnh đã triển khai.
- Làm rõ Đối tác không có form riêng, form nằm tại Liên hệ; không hứa có chương trình thử nghiệm hay quy trình chấp nhận đề xuất.
- Làm rõ dữ liệu chat người dùng nhập có thể chứa dữ liệu cá nhân; lời nhắc không gửi nội dung nhạy cảm không phải cơ chế ngăn tự động. Không bảo đảm Groq không lưu dữ liệu.
- `AssistantMessage.tsx` hiển thị đoạn văn, ngắt dòng, danh sách đánh số/gạch đầu dòng, chữ đậm/code và liên kết nội bộ chỉ từ registry. React render an toàn, không dùng HTML thô, không thêm dependency.
- Backend và frontend chặn answer chứa JSON thô. Chuẩn hóa dấu xuống dòng bị escape thêm một lớp. Gợi ý trống/lỗi thì ẩn, không render JSON.

## Kiểm tra và giới hạn thực tế

- Build production; 31 kiểm thử backend; các kiểm thử trình duyệt về định dạng mobile, hội thoại sáu lượt, bấm nhanh, thay/ẩn gợi ý, session riêng, nguồn/route không an toàn và lỗi API.
- Hồi quy 11 trang VI/EN và desktop/mobile, 41 liên kết nội bộ đều đạt.
- `assistant-dynamic-live.mjs` dùng hai mục tiêu/thứ tự hỏi khác nhau: đọc giấy tờ (hỏi tiếp ngắn và bấm gợi ý do model tự sinh), và hợp tác → bỏ qua gợi ý để chuyển sang quyền riêng tư → đính chính phạm vi dữ liệu chat. Không so khớp gợi ý với danh sách kỳ vọng.
- Groq thật đã chạy được ba lượt đọc tài liệu, có lượt sử dụng gợi ý thật; cũng đã chạy được ba lượt của nhánh đổi mục tiêu trong một đợt. Đợt cuối nhánh đổi mục tiêu bị quota ở lượt thứ ba, dừng đúng không retry. Các thay đổi kiểm thử sau cùng không được coi là đã có kiểm chứng API thành công cho mọi nhánh.
- Quan sát thực tế: có lượt trả [], có lượt tạo câu mới và theo câu hỏi ngắn; cũng còn lượt gợi ý gần lặp ý, gợi ý chưa đủ căn cứ hoặc câu trả lời chưa bám sát hết nguồn. Đã bổ sung nguồn, chỉ dẫn và lọc trùng nhưng KHÔNG tuyên bố loại bỏ hoàn toàn những lỗi ngữ nghĩa này. Không coi HTTP 200 là bằng chứng mọi nội dung đều đúng.
- Các lỗi provider/validation gặp trong quá trình rà soát (429 quota, 400 giới hạn schema, 502 đầu ra) được ghi trong báo cáo dưới `test-results/assistant-dynamic-live-*.json`; các báo cáo là dữ liệu thử công khai, không chứa khóa. Phiên bản script hiện tại ghi tên có timestamp để giữ kết quả từng đợt.

## File thay đổi

- `contact-backend/assistant-context.mjs`, `assistant-prompt.mjs`, `assistant-format.mjs` (mới), `assistant.mjs`, `assistant-knowledge.mjs`, `assistant-user-flows.mjs`, `assistant.test.mjs`.
- `src/components/AssistantMessage.tsx` (mới), `SeeViaSupport.tsx`, `SeeViaSupport.css`.
- `tests/support-widget-check.mjs`, `support-format-check.mjs` (mới), `assistant-dynamic-live.mjs` (mới).
- Tài liệu này và `docs/seevia-assistant.md`.

Checkpoint: `test-results/dynamic-context-before-*.zip`, không có `.env`. Không đổi model/provider, không thêm thư viện, không đổi thiết kế các trang.

Tài liệu API đối chiếu: https://console.groq.com/docs/structured-outputs
