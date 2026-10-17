# Rà soát căn cứ và điều hướng chatbot — 17/10/2026

Lưu ý: các kết quả kiểm thử Groq trong tài liệu này là lịch sử trước khi chuyển provider. Chúng không xác minh chất lượng hoặc khả năng kết nối của Cohere Command A. Cấu hình hiện tại và lệnh kiểm tra mới nằm trong [hướng dẫn Cohere](seevia-assistant.md).

## Nguồn điều hướng thống nhất

`src/support/pages.json` chứa tên chính thức, URL, mục đích và cách gọi tương đương. `src/navigation.ts` lấy URL từ đây; router trong `src/main.tsx` dùng cùng registry và menu Header lấy tên từ registry. Chatbot cũng đọc đúng file này. FAQ là mục `#product-faq` trên trang Sản phẩm, không phải trang riêng. Không thêm trang hoặc thay thứ tự/thiết kế website.

Tên dùng để điều hướng là **Sản phẩm**, URL `/san-pham`. “Kính SeeVia” là tên sản phẩm và một nhãn ở footer/tiêu đề trình duyệt. Alias giúp hiểu câu hỏi nhưng không thay tên chính thức. Các tên khác được đồng bộ: Công nghệ, Về chúng tôi, Cộng đồng, Tin tức, Đối tác, Liên hệ, chính sách và điều khoản. Các nhãn biên tập ở footer được giữ nguyên.

## Sai lệch và điểm chưa thống nhất đã phát hiện

| Nguồn                                             | Phát hiện                                                                                                        | Cách xử lý trong chatbot                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Registry chatbot cũ và Header                     | “Kính SeeVia”, “Công nghệ SeeVia”, “Về SeeVia”, “Đồng hành cùng SeeVia”… không phải nhãn menu chính              | Dùng tên Header đã xác minh, giữ cách gọi cũ như alias                                                                                |
| Hero trang chủ và lộ trình Sản phẩm               | Hero: chưa có mô hình kính; lộ trình: “Hoàn thiện bản mẫu”, tiếp theo “Thử nghiệm có hướng dẫn”                  | Ghi nhận khác biệt cách diễn đạt; không suy ra đã có bản mẫu hoạt động hay đã thử nghiệm. Chưa xác nhận được tiến độ thực tế với nhóm |
| User Flow Spec v1.0                               | Bản nháp có giả định và mô tả kỹ thuật; có chỗ dùng ngôn ngữ đã có firmware                                      | Không biến thành khả năng sản phẩm đã kiểm chứng; giữ cảnh báo trạng thái và nguồn mâu thuẫn                                          |
| FAQ sản phẩm và Contact hiện tại                  | FAQ nói kết nối khi kênh hoàn thiện; Contact đã có biểu mẫu, xem trước, lưu bản nháp và gửi khi backend sẵn sàng | Mô tả đúng hành động hiện hữu; không bảo đảm thư đã chuyển tới người nhận hoặc phản hồi ngay                                          |
| CTA “Trao đổi về trải nghiệm” và các flow dự kiến | CTA tới Liên hệ, không phải hệ thống đặt suất thử                                                                | Chỉ bày tỏ quan tâm qua form; không xác nhận có kính dùng thử, suất hoặc lịch                                                         |
| About / Partner                                   | Nhà sáng lập là placeholder; các đầu mối đối tác là đề xuất                                                      | Không bịa danh tính, vai trò, đối tác ký kết hoặc tài trợ                                                                             |
| Bộ nhận diện điều hướng                           | “gậy trắng” bỏ dấu thành “gay trang”, bị nhận nhầm là trang web                                                  | Loại các cụm gậy trắng/trạng thái/trang giấy khỏi tín hiệu điều hướng                                                                 |

Không sửa nội dung công khai để che các khác biệt trên. Cần chủ dự án xác nhận tiến độ, tên/ảnh/vai trò thành viên, chương trình thử nghiệm và quan hệ đối tác trước khi nâng trạng thái trong dữ liệu.

## Hành vi mới

System prompt yêu cầu kiểm tra tiền đề, điều chỉnh lịch sự khi sai/chưa có căn cứ, phân biệt dữ kiện/suy luận/đề xuất, và chấp nhận sửa sai nếu người dùng có căn cứ. Người dùng nói đúng thì trả lời trực tiếp. Quy tắc áp dụng cho cả answer và suggested_questions.

Tên trang trong lời chỉ dẫn tích cực được chuẩn hóa từ alias; mô tả sản phẩm thông thường và alias được trích trong câu sửa sai không bị thay bừa. Khi người dùng sửa đúng tên menu và lịch sử chứa tên alias sai, backend tạo căn cứ sửa sai từ registry, bảo đảm có lời thừa nhận ngắn. Đường dẫn trong văn bản không có trong registry bị từ chối; nút liên kết chỉ lấy ID và URL trong registry, không dùng URL do model tạo.

Nếu không tìm thấy trang được hỏi, model nhận danh mục trang thật và được yêu cầu nêu giới hạn, có thể chỉ phương án gần nhất đúng mục đích; không tạo checkout, trang bán hàng hoặc chức năng không tồn tại. Giữ điều hướng chỉ khi người dùng hỏi nơi xem. Giữ quản lý ngữ cảnh, gợi ý động, liên hệ độc lập và các kiểm tra bảo mật. Một completion cho mỗi lượt; không thêm model hoặc dịch vụ kiểm chứng.

Gợi ý có tiền đề bản mẫu đang sẵn có, mua ngay hoặc thao tác camera trong app chưa được xác nhận được loại; “tính năng hiện có” đổi thành “tính năng dự kiến”. Các bộ lọc này không phải bộ kiểm chứng ngữ nghĩa tổng quát và không bảo đảm mọi câu trả lời/gợi ý luôn đúng.

## Kiểm tra đã thực hiện

- Build production, kiểm thử backend và hồi quy trình duyệt: menu/VI–EN, 11 route desktop/mobile, 41 liên kết, widget/keyboard, ngữ cảnh 6 lượt và liên hệ.
- Test mã kiểm tra registry dùng chung, alias đúng trang, không nhầm gậy trắng thành trang web, không fallback theo lịch sử khi người dùng nêu trang lạ, guard URL lạ, giữ mô tả sản phẩm, căn cứ sửa sai và truy xuất các tuyên bố chưa có bằng chứng.
- Groq thật trả HTTP 200 cho cả bảy loại tình huống ở các đợt kiểm tra: nơi xem sản phẩm; tên trang sai; tiền đề GPS/AR/thay gậy trắng; giá/thông số chưa công bố; sửa câu trả lời trước; trang Thanh toán không có; nhận định đúng về camera.
- Các batch ban đầu gặp quota HTTP 429, đã dừng đúng và không tự retry/fallback. Những tình huống còn lại được kiểm tra riêng sau đó. Báo cáo từng lượt ở `test-results/assistant-verification-*.json` (Git ignore, chỉ câu hỏi kiểm thử công khai; không có khóa).
- Ví dụ thực tế sau sửa: “Bạn nói đúng, tôi đã gọi sai tên trang trước đó. Bạn có thể xem tại trang «Sản phẩm».” Với camera: “Theo thiết kế hiện tại của SeeVia, camera chỉ ghi nhận khung cảnh khi người dùng chủ động yêu cầu.”

Chưa xác minh phần cứng thật, chứng nhận, kết quả pilot, thư được nhận hoặc quan hệ đối tác. Chưa kiểm tra screen reader thủ công/thiết bị vật lý. Kết quả model có tính biến thiên; không tuyên bố loại bỏ hoàn toàn sai sót, đồng nghĩa hoặc tiền đề sai.

## File thay đổi

- `src/support/pages.json`, `src/navigation.ts`, `src/main.tsx`, `src/components/Header.tsx`.
- `contact-backend/assistant-navigation.mjs`, `assistant-prompt.mjs`, `assistant-knowledge.mjs`, `assistant-context.mjs`, `assistant.mjs`, `assistant.test.mjs`.
- `tests/assistant-verification-live.mjs`, tài liệu này và liên kết trong `docs/seevia-assistant.md`.

Checkpoint trước sửa: `test-results/verification-audit-before-*.zip`, không chứa `.env` hoặc khóa. Backend phải khởi động lại để nạp bản sửa; Vercel cần redeploy nếu muốn cập nhật bản đang công khai.
