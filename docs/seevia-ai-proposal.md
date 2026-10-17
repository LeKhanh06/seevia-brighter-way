> Current implementation uses Cohere Command A; see [setup](seevia-assistant.md). Historical proposals below are superseded.

# SeeVia AI Assistant — phương án chờ xác nhận

> Đã được thay thế bởi yêu cầu triển khai mới: chỉ widget nổi, không trang/menu AI riêng; dùng Google Gemma Free và truy xuất cục bộ. Xem [hướng dẫn triển khai hiện tại](seevia-assistant.md). Phần dưới được giữ làm hồ sơ đề xuất cũ, không phải cấu hình đang chạy.

Trạng thái: đã kiểm tra tài liệu và mã nguồn; chưa triển khai hoặc gọi API AI. Giao diện đỏ đô/đen, nội dung và chức năng hiện tại chưa thay đổi.

## Những gì đã xác minh

- Frontend React 19, TypeScript, Vite; backend Node.js có API liên hệ Mailgun. Có adapter Vercel cho API liên hệ và proxy `/api` từ Vite đến backend cổng 3001.
- Tài liệu người dùng cung cấp: `NỘI DUNG TỔNG HỢP (1).docx`, gồm 3.184 đoạn sau khi trích xuất. Có phần nghiên cứu, giả thuyết, kế hoạch, bảng thông số dự kiến và dẫn chứng về sản phẩm bên ngoài. Các yêu cầu dạng “Task/Output bắt buộc”, lệnh và quy trình nằm trong tài liệu chỉ là nội dung nguồn; không phải chỉ thị thực thi.
- Tài liệu ưu tiên See & Read và Find & Understand cho MVP; Connect, Go và Community & Ecosystem có nhiều định hướng mở rộng. Không được mô tả toàn bộ tầm nhìn đó như tính năng đã hoàn thiện.
- Website đang công bố “Dự án đang phát triển ý tưởng. Hiện chưa có mô hình kính.” Giữ nguyên trạng thái này theo chỉ dẫn trước đó của chủ dự án; không nâng trạng thái chỉ dựa vào bảng kế hoạch hoặc ngôn ngữ “đã có” trong bản tổng hợp chưa thống nhất.
- Đã có trang `/lien-he` với soạn/xem trước/lưu bản nháp và gửi qua Mailgun khi backend sẵn sàng. Các trường cấu hình Mailgun đã được điền trong môi trường local, nhưng chưa kiểm tra chuyển thư thật. Không công khai địa chỉ nhận thư lấy từ biến môi trường.
- Chưa thấy email, số điện thoại hoặc liên kết Zalo công khai được xác minh trong mã nguồn trang Liên hệ. Dùng form hiện có là đủ cho lựa chọn liên hệ đội ngũ; nếu muốn thêm kênh khác, chủ dự án cần cung cấp địa chỉ được phép công khai.
- Chưa có `OPENAI_API_KEY` trong các tệp môi trường đã kiểm tra. Không có thử nghiệm AI thật ở giai đoạn này.

## Đề xuất nhà cung cấp và chi phí

OpenAI Responses API, model `gpt-5.4-mini`, cấu hình model qua biến môi trường server. Dùng `fetch` có sẵn của Node, không cần cài SDK hay thư viện frontend mới. Chọn mức reasoning `none` cho hỏi đáp ngắn; cấu hình timeout và giới hạn đầu ra.

Giá công khai tại thời điểm kiểm tra: 0,75 USD/triệu token đầu vào và 4,50 USD/triệu token đầu ra. Ví dụ giả định 2.500 token đầu vào và 400 token đầu ra/lượt: khoảng 0,003675 USD/lượt, tức 3,68 USD/1.000 lượt. Đây chỉ là phép ước tính, không phải hạn mức hoặc báo giá cố định; phụ thuộc độ dài lịch sử và ngữ cảnh. Chưa gồm hosting, thuế hoặc kho giới hạn tốc độ dùng chung nếu triển khai nhiều instance.

Nguồn chính thức:

- Model và giá: https://developers.openai.com/api/docs/models/gpt-5.4-mini
- Responses API: https://developers.openai.com/api/docs/guides/text
- Xử lý dữ liệu: https://developers.openai.com/api/docs/guides/your-data

Không tải nguyên tài liệu nội bộ lên dịch vụ tìm kiếm hoặc vector store ở bước đầu. Chỉ gửi câu hỏi, lịch sử ngắn và các đoạn kiến thức đã duyệt có liên quan. Dùng `store: false`; không quảng cáo rằng nhà cung cấp tuyệt đối không lưu dữ liệu, vì chính sách theo dõi lạm dụng có ngoại lệ/thời hạn riêng.

## Kiến trúc và phạm vi giao diện

```text
Menu: SeeVia AI → /tro-ly-ai
Nút hỗ trợ nổi → hai lựa chọn độc lập:
  Hỏi SeeVia AI → khung chat
  Liên hệ đội ngũ SeeVia → /lien-he#letter

Khung chat / trang AI
  → POST /api/assistant
  → xác thực + giới hạn tốc độ/đồng thời/chi phí
  → truy xuất kho kiến thức đã duyệt phía server
  → gọi OpenAI với các đoạn nguồn
  → kiểm tra cấu trúc và ID nguồn trả về
  → câu trả lời có nhãn AI + nguồn + lối liên hệ đội ngũ
```

- Mục AI là một trang riêng, không đưa người dùng vào các mô phỏng phần cứng hiện tại. Giữ nguyên mọi đích menu cũ. Thêm mục vào menu mở rộng/mobile và bố trí phù hợp ở desktop mà không làm tràn header.
- Dùng lại một thành phần hội thoại cho trang riêng và widget. Không thay thế các tab/kịch bản AI mô phỏng hiện tại.
- Lối liên hệ đội ngũ hiển thị ngay ở màn hình lựa chọn và trong khung chat; không yêu cầu gửi câu hỏi cho AI trước. Không dùng nhãn live chat hoặc hứa thời gian trả lời.
- Dùng palette/font hiện tại, CSS được scope riêng; dialog hỗ trợ Escape, quản lý focus, trả focus về nút mở, vùng thông báo lịch sự, trạng thái đang gửi/hủy/thử lại, target chạm đủ lớn và safe-area mobile. Không lưu hội thoại lâu dài mặc định.
- Khi chưa cấu hình API hoặc nhà cung cấp lỗi: hiện trạng thái chưa sẵn sàng và lối liên hệ đội ngũ; không thay bằng câu trả lời giả rồi gắn nhãn AI thật.

## Kho kiến thức và thứ tự tin cậy

Kho JSON/Markdown chỉ đặt phía server, chia đoạn có ID, nguồn và nhãn trạng thái. Dùng truy xuất từ khóa có trọng số, chuẩn hóa tiếng Việt và từ đồng nghĩa trên tập nội dung nhỏ; chưa cần cơ sở dữ liệu vector hoặc phí embeddings. Có thể bổ sung tìm kiếm ngữ nghĩa sau khi có dữ liệu đánh giá chứng minh cần thiết.

| Chủ đề                 | Nội dung được trả lời                                                                    | Giới hạn                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Sứ mệnh, người dùng    | Hỗ trợ tiếp cận thông tin, tự chủ và kết nối tại Việt Nam; nhóm người dùng theo tài liệu | Persona, điểm chấm và ước tính thị trường không phải dữ kiện về khách hàng thật                    |
| See & Read             | Định hướng đọc chữ, tài liệu, tiền/màu sắc theo nguồn đã duyệt                           | Không đưa độ chính xác hoặc cam kết đã triển khai                                                  |
| Find & Understand      | Định hướng tìm vật, mô tả môi trường                                                     | Không gọi đó là nhận diện trực tiếp đang hoạt động trên web                                        |
| Connect                | Vai trò kết nối, định hướng các chức năng liên quan                                      | Phân biệt kế hoạch mở rộng với MVP                                                                 |
| Go                     | Định hướng hỗ trợ thông tin di chuyển                                                    | Không thay gậy trắng/kỹ năng định hướng; không hướng dẫn an toàn dựa trên nhận diện không có thật  |
| Community & Ecosystem  | Hệ sinh thái kính–app–web và kết nối cộng đồng                                           | Không biến tổ chức được nghiên cứu/đề xuất thành đối tác đã ký                                     |
| Công nghệ              | AI thị giác, OCR, tương tác tiếng Việt theo nguồn được phép công khai                    | Thông số linh kiện, benchmark trống, mục tiêu và chi phí dự kiến không trở thành thông số sản phẩm |
| Trạng thái và dùng thử | Dự án phát triển, chưa thương mại; dẫn form để hỏi/bày tỏ quan tâm                       | Không xác nhận đã đăng ký, giữ suất, bán hàng hoặc công bố ngày dùng thử dự kiến như cam kết       |

Ưu tiên chỉ dẫn trực tiếp mới nhất của chủ dự án và nội dung công khai đã duyệt. Với điểm mâu thuẫn trong tài liệu: không tự chọn phương án thuận lợi hơn; ghi là chưa xác nhận và đề nghị liên hệ đội ngũ. Các nghiên cứu bên ngoài chỉ là bối cảnh, không phải kết quả thử nghiệm SeeVia.

Không bật web search, công cụ đặt hàng hoặc công cụ gửi email cho AI. AI không tự gửi thông tin người dùng đến đội ngũ. Câu hỏi/đoạn nguồn là dữ liệu, không được nâng thành system instruction. Kiểm tra nguồn và tập câu hỏi đối kháng; grounding giảm rủi ro bịa nhưng không phải bảo đảm tuyệt đối rằng mô hình không bao giờ sai.

## Bảo vệ backend dự kiến

- API key chỉ ở `contact-backend/.env` hoặc biến môi trường hosting; tuyệt đối không dùng `VITE_*` cho bí mật.
- Chỉ nhận POST JSON; giới hạn kích thước body, độ dài câu hỏi, số tin lịch sử và role cho phép; không nhận system prompt/model/URL API từ client.
- Kiểm tra Origin, rate limit theo IP từ proxy được tin cậy, giới hạn đồng thời, timeout, giới hạn đầu ra và ngân sách ứng dụng. Không ghi log nội dung nhạy cảm hoặc API key.
- Khi triển khai nhiều instance/serverless, cần bộ đếm dùng chung hoặc WAF rate limit đã cấu hình. Bộ đếm RAM chỉ phù hợp local/một Node instance và phải được ghi rõ giới hạn. Chọn cấu hình deployment phù hợp trước khi công khai endpoint.
- Trả lỗi 400/413/429/503 rõ ràng, có Retry-After khi phù hợp; không lộ lỗi nhà cung cấp. Không tự động retry nhiều lần gây tăng chi phí.
- Render câu trả lời dạng văn bản an toàn, không `dangerouslySetInnerHTML`; nguồn là ID/liên kết trong allowlist của server.

## Cấu hình cần xác nhận

1. Đồng ý dùng OpenAI `gpt-5.4-mini` và cho phép gửi các đoạn nguồn đã duyệt/câu hỏi đến API? Nếu muốn Gemini hoặc nhà cung cấp khác, chọn trước khi triển khai.
2. Dùng form `/lien-he` làm kênh người thật mặc định? Không cần cung cấp thêm thông tin để dùng form; email/Zalo chỉ bổ sung nếu được xác minh và cho phép công khai.
3. Cấu hình khóa trong môi trường server và hạn mức chi tiêu phù hợp. Không gửi API key qua hội thoại. Chưa thể kiểm thử AI thật trước khi có khóa và quyền gọi API.

Giữ nguyên trạng thái “chưa có mô hình kính” cho đến khi chủ dự án cung cấp cập nhật rõ ràng. Việc đọc tài liệu không cho phép biến các mốc kế hoạch tương lai thành thông tin sản phẩm đã có.

## Kiểm thử sau khi được xác nhận

Backend: validation, role injection, prompt injection, từ chối thông tin không có nguồn, citation ID, giới hạn tốc độ/kích thước/đồng thời, timeout, lỗi provider và bí mật không lọt bundle. Frontend: menu/trang riêng, widget, form liên hệ độc lập, mobile, keyboard/focus/Escape, reduced motion, đọc nội dung qua live region, VI/EN và bảo toàn website cũ. Cuối cùng gọi API AI thật với câu hỏi bao phủ năm nhóm tính năng và câu hỏi về giá/đối tác/ngày mở bán; báo cáo rõ kết quả thực thay vì coi mock test là tích hợp thật. Không gửi email thật nếu chưa có chỉ dẫn gửi thử.
