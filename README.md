# SeeVia

**See a brighter way.**

SeeVia — A project developing AI-powered visual assistance glasses within a glasses–app–web ecosystem. Combining computer vision, OCR, and Vietnamese voice interaction, SeeVia aims to help blind and low-vision people in Vietnam access information, live more independently, and connect with their communities.

Website giới thiệu dự án kính trợ lý thị giác SeeVia dành cho người khiếm thị và người suy giảm thị lực tại Việt Nam. Dự án kết hợp nội dung sản phẩm, công nghệ, câu chuyện cộng đồng và kênh liên hệ trong một website song ngữ Việt–Anh.

SeeVia đang trong giai đoạn phát triển bản mẫu, chưa có mô hình kính. Những tình huống AI trong phần mô phỏng ở trang chủ là kịch bản viết sẵn, không dùng camera hay nhận diện thật. Riêng **trợ lý SeeVia AI** (nút "Hỏi SeeVia AI") là chatbot chạy thật qua Cohere: chỉ nhận văn bản, trả lời dựa trên nội dung dự án đã được duyệt và không bật camera.

## Điểm chính

- Giao diện responsive theo SeeVia Design System (nền pearl #F6F8FF, sapphire #405FFA, cyan #09BBC8, mint #D9FCED, ink Twilight Indigo #3B3664); hiệu ứng có hỗ trợ giảm chuyển động.
- Chuyển **VI | EN** ngay trên trang, ghi nhớ lựa chọn ngôn ngữ và giữ nguyên lời nhắn đang soạn.
- Khám phá thiết kế kính, luồng xử lý thông tin và hội thoại minh họa.
- Câu chuyện cộng đồng, tin tức có nguồn dẫn, bộ lọc và tìm kiếm bằng cả hai ngôn ngữ.
- Biểu mẫu liên hệ có xem trước, sao chép, tải bản nháp và gửi email qua Mailgun khi backend được cấu hình.
- Hai trang chính sách riêng, có mục lục và chức năng In/Lưu PDF.
- Trợ lý **SeeVia AI** trả lời câu hỏi về dự án bằng tiếng Việt, gợi ý câu hỏi tiếp theo, lưu lịch sử trò chuyện trên thiết bị (xem [CHAT_HISTORY.md](CHAT_HISTORY.md)) và trả lời trung thực khi dự án chưa xác nhận một thông tin.

## Công nghệ

| Thành phần | Công nghệ                                   |
| ---------- | ------------------------------------------- |
| Giao diện  | React 19, TypeScript, Vite                  |
| Trình bày  | CSS, Lora, Playfair Display, Be Vietnam Pro |
| Song ngữ   | Bộ bản dịch và JSX runtime trong `src/i18n` |
| Gửi email  | Node.js HTTP server, Mailgun HTTP API       |
| Trợ lý AI  | Cohere (model `command-a-03-2025`), Node.js |
| Kiểm tra   | Playwright với Chrome, Node.js Test Runner  |

## Chạy nhanh

Cần **Node.js 24** và npm. Các lệnh dưới đây chạy ở thư mục gốc dự án.

```bash
git clone https://github.com/LeKhanh06/seevia-brighter-way.git
cd seevia-brighter-way
npm ci
npm run dev -- --port 5176 --strictPort
```

Mở **http://127.0.0.1:5176**. Toàn bộ các trang dùng chung một ứng dụng; không cần cài thư viện hay chạy riêng từng thư mục.

### Bật gửi email

Tạo `contact-backend/.env` theo [file cấu hình mẫu](contact-backend/.env.example), điền cấu hình Mailgun và địa chỉ nhận thư của bạn. Không ghi đè `.env` nếu đã có cấu hình.

Mở terminal thứ hai tại thư mục gốc:

```bash
npm run server
```

Backend chạy mặc định tại **http://127.0.0.1:3001**. Vite chuyển tiếp các yêu cầu `/api` đến backend. Nếu backend chưa sẵn sàng, trang Liên hệ vẫn cho soạn và lưu bản nháp.

Xem [hướng dẫn backend](contact-backend/README.md) để cấu hình domain, origin và triển khai.

### Bật trợ lý SeeVia AI

Trợ lý dùng cùng backend. Thêm vào `contact-backend/.env` (không đặt trong biến `VITE_*`):

```text
COHERE_API_KEY=...           # bắt buộc
COHERE_MODEL=command-a-03-2025   # tùy chọn, hiện chỉ hỗ trợ model này
```

Không có khóa Cohere hợp lệ thì nút chat hiện "AI chưa kết nối" và không có câu trả lời nào được tạo. Chi tiết giới hạn tần suất, Redis trên Vercel và cách thêm kiến thức: xem [hướng dẫn backend](contact-backend/README.md#trợ-lý-seevia-ai).

### Bản build

```bash
npm run build
npm run server
```

Mở **http://127.0.0.1:3001** để chạy website đã build cùng API. `npm run preview` chỉ xem giao diện build, không tự chạy backend gửi thư.

## Các trang

| Trang              | Đường dẫn             | Tài liệu                                   |
| ------------------ | --------------------- | ------------------------------------------ |
| Trang chủ          | `/`                   | `HomePage/`                                |
| Tổng quan nhanh    | `/tong-quan`          | `OverviewPage/`                            |
| Sản phẩm           | `/san-pham`           | [ProductPage](ProductPage/README.md)       |
| Công nghệ          | `/cong-nghe`          | [TechnologyPage](TechnologyPage/README.md) |
| Về chúng tôi       | `/ve-chung-toi`       | [AboutPage](AboutPage/README.md)           |
| Cộng đồng          | `/cong-dong`          | [CommunityPage](CommunityPage/README.md)   |
| Tin tức            | `/tin-tuc`            | [NewsPage](NewsPage/README.md)             |
| Đối tác            | `/doi-tac`            | [PartnerPage](PartnerPage/README.md)       |
| Liên hệ            | `/lien-he`            | [ContactPage](ContactPage/README.md)       |
| Chính sách bảo mật | `/chinh-sach-bao-mat` | [PolicyPage](PolicyPage/README.md)         |
| Điều khoản sử dụng | `/dieu-khoan-su-dung` | [PolicyPage](PolicyPage/README.md)         |

Đường dẫn `/thong-tin` giữ trang thông tin sử dụng tổng hợp. Menu, footer và các đích điều hướng dùng chung được quản lý tại `src/navigation.ts`.

## Cấu trúc dự án

```text
seevia-brighter-way/
├── HomePage/             # Trang chủ và các mô phỏng tương tác
├── ProductPage/          # Thiết kế, màu kính, tính năng và FAQ
├── TechnologyPage/       # Thành phần kính và luồng xử lý
├── AboutPage/            # Dự án, tư liệu và nhóm sáng lập
├── CommunityPage/        # Câu chuyện cộng đồng
├── NewsPage/             # Tin tham khảo và ghi chú dự án
├── PartnerPage/          # Hướng hợp tác và đầu mối đề xuất
├── ContactPage/          # Biểu mẫu và bản nháp lời nhắn
├── PolicyPage/           # Chính sách bảo mật, điều khoản
├── contact-backend/      # API gửi email, trợ lý SeeVia AI, cấu hình riêng và kiểm thử
├── src/
│   ├── components/       # Header, Footer, Button, animation chung
│   ├── i18n/             # Chuyển ngôn ngữ và bản dịch
│   ├── styles/           # CSS dùng chung
│   ├── support/          # Lịch sử chat, danh mục trang cho trợ lý
│   ├── navigation.ts    # Đích điều hướng
│   └── main.tsx         # Chọn trang theo đường dẫn
├── public/images/       # Logo và ảnh tĩnh
└── tests/               # Kiểm tra trình duyệt
```

## Chỉnh sửa nội dung

- Trang chủ: `HomePage/homeData.ts` và các component trong `HomePage/`.
- Sản phẩm, công nghệ: các file `data/` trong thư mục tương ứng.
- Về chúng tôi, chính sách: các file HTML nội dung bên trong `AboutPage/` và `PolicyPage/`.
- Tin tức: `NewsPage/notes.ts`, `NewsPage/sourceLinks.ts` và `NewsPage/News.tsx`.
- Bản dịch: `src/i18n/en.json`; xem [hướng dẫn song ngữ](src/i18n/README.md).

Khi thay ảnh trong mô phỏng AI, cập nhật cả lời phản hồi và vùng đánh dấu để khớp với ảnh. Khi thêm nội dung tiếng Việt, bổ sung bản dịch tiếng Anh tương ứng.

## Kiểm tra

Chạy Vite tại cổng **5176** như hướng dẫn trên và cài Google Chrome, sau đó mở terminal khác:

| Lệnh                                | Nội dung kiểm tra                                            |
| ----------------------------------- | ------------------------------------------------------------ |
| `npm run build`                     | TypeScript và bản build                                      |
| `npm run test:mail`                 | API, kiểm tra dữ liệu và Mailgun giả lập; không gửi thư thật |
| `npm run test:assistant`            | Trợ lý SeeVia AI với Cohere giả lập; không gọi Cohere thật   |
| `node tests/site-check.mjs`         | Các trang, liên kết nội bộ và responsive                     |
| `node tests/language-check.mjs`     | VI/EN, giữ bản nháp, tìm kiếm và hội thoại                   |
| `node tests/contact-send-check.mjs` | Gửi thư giả lập, trạng thái thành công/lỗi                   |
| `node tests/check.mjs`              | Trang chủ, menu, bàn phím và hiệu ứng                        |
| `node tests/hero-check.mjs`         | Các điểm tương tác trong Hero                                |
| `node tests/community-check.mjs`    | Bộ lọc câu chuyện và bố cục cộng đồng                        |
| `node tests/news-check.mjs`         | Tìm kiếm, bộ lọc và hộp đọc bài viết                         |

Các bài kiểm tra trình duyệt hỗ trợ biến `BASE_URL` khi dùng cổng khác. Ảnh kiểm tra được ghi vào `test-results/`, không đưa lên GitHub.

## Triển khai và cấu hình bí mật

### Vercel

Dự án có `vercel.json` và API serverless tại `api/contact.mjs`. Chọn preset **Vite**, build `npm run build`, output `dist`, Node.js **24.x**. Các trang nội dung được rewrite về `index.html`; API gửi thư vẫn có đường dẫn riêng. Không chạy `npm run server` trên Vercel.

Khai báo `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_REGION`, `MAIL_FROM` và `MAIL_TO` trong Environment Variables của dự án Vercel; khóa API phải là biến bí mật phía server. Để bật trợ lý SeeVia AI, khai báo thêm `COHERE_API_KEY`, `ASSISTANT_REDIS_REST_URL` và `ASSISTANT_REDIS_REST_TOKEN`: trên Vercel trợ lý bắt buộc có bộ đếm Redis dùng chung, thiếu thì trợ lý báo chưa kết nối. Khi frontend và API cùng domain, để trống `VITE_CONTACT_API_BASE`. `.vercelignore` loại `.env`, kết quả kiểm thử và các file local khỏi gói upload.

Sau khi triển khai, kiểm tra `/lien-he`, `/api/contact/status` và mở lại trực tiếp các đường dẫn con để xác nhận routing. Xem [tài liệu backend](contact-backend/README.md) về giới hạn gửi thư.

### Các nền tảng khác

- Backend Node có thể phục vụ cả thư mục `dist` và API trên cùng domain. Cấu hình biến môi trường trên hosting theo [tài liệu backend](contact-backend/README.md).
- Nếu frontend và backend ở hai domain khác nhau, đặt `VITE_CONTACT_API_BASE` trước khi build và khai báo origin frontend tại backend.
- Hosting tĩnh không chạy được API Node. Bản hiện tại dùng đường dẫn từ gốc domain và điều hướng nhiều trang; cần cấu hình SPA fallback và điều chỉnh base path nếu triển khai trong một thư mục con như GitHub Pages project site.
- `.env` thật không được đưa lên GitHub. Chỉ commit các file `.env.example` không có khóa. Không đặt khóa Mailgun trong biến `VITE_*` vì các biến này được đưa vào frontend.

## Phạm vi nội dung và tư liệu

Ảnh nhiều góc kính, bốn ảnh chụp cận thành phần, các màu ngoài burgundy và thông tin đầy đủ của năm nhà sáng lập chưa được cung cấp; giao diện giữ vị trí chờ tương ứng. Tin tức là danh sách biên tập tĩnh. Các đơn vị ở trang Đối tác là đầu mối đề xuất, chưa phải đối tác đã xác nhận.

Ảnh, bài báo và tư liệu bên ngoài được ghi nguồn trên trang. Việc có trong repository không mặc nhiên cấp quyền tái sử dụng các tư liệu đó; kiểm tra quyền sử dụng của từng nguồn trước khi tái xuất bản. Repository hiện chưa có file `LICENSE`.
