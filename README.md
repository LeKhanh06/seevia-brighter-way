# SeeVia

**See a brighter way.**

SeeVia — A project developing AI-powered visual assistance glasses within a glasses–app–web ecosystem. Combining computer vision, OCR, and Vietnamese voice interaction, SeeVia aims to help blind and low-vision people in Vietnam access information, live more independently, and connect with their communities.

Website giới thiệu dự án kính trợ lý thị giác SeeVia dành cho người khiếm thị và người suy giảm thị lực tại Việt Nam. Dự án kết hợp nội dung sản phẩm, công nghệ, câu chuyện cộng đồng và kênh liên hệ trong một website song ngữ Việt–Anh.

SeeVia đang trong giai đoạn phát triển bản mẫu. Những tình huống AI trên website là mô phỏng được viết sẵn, không sử dụng camera hoặc mô hình AI trực tiếp.

## Điểm chính

- Giao diện responsive với bảng màu đỏ đô, đen than và kem; hiệu ứng có hỗ trợ giảm chuyển động.
- Chuyển **VI | EN** ngay trên trang, ghi nhớ lựa chọn ngôn ngữ và giữ nguyên lời nhắn đang soạn.
- Khám phá thiết kế kính, luồng xử lý thông tin và hội thoại minh họa.
- Câu chuyện cộng đồng, tin tức có nguồn dẫn, bộ lọc và tìm kiếm bằng cả hai ngôn ngữ.
- Biểu mẫu liên hệ có xem trước, sao chép, tải bản nháp và gửi email qua Mailgun khi backend được cấu hình.
- Hai trang chính sách riêng, có mục lục và chức năng In/Lưu PDF.

## Công nghệ

| Thành phần | Công nghệ                                   |
| ---------- | ------------------------------------------- |
| Giao diện  | React 19, TypeScript, Vite                  |
| Trình bày  | CSS, Lora, Playfair Display, Be Vietnam Pro |
| Song ngữ   | Bộ bản dịch và JSX runtime trong `src/i18n` |
| Gửi email  | Node.js HTTP server, Mailgun HTTP API       |
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

Xem [hướng dẫn Mailgun](contact-backend/README.md) để cấu hình domain, origin và triển khai.

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
├── contact-backend/      # API gửi email, cấu hình riêng và kiểm thử
├── src/
│   ├── components/       # Header, Footer, Button, animation chung
│   ├── i18n/             # Chuyển ngôn ngữ và bản dịch
│   ├── styles/           # CSS dùng chung
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
| `node tests/site-check.mjs`         | Các trang, liên kết nội bộ và responsive                     |
| `node tests/language-check.mjs`     | VI/EN, giữ bản nháp, tìm kiếm và hội thoại                   |
| `node tests/contact-send-check.mjs` | Gửi thư giả lập, trạng thái thành công/lỗi                   |
| `node tests/check.mjs`              | Trang chủ, menu, bàn phím và hiệu ứng                        |
| `node tests/hero-check.mjs`         | Các điểm tương tác trong Hero                                |
| `node tests/community-check.mjs`    | Bộ lọc câu chuyện và bố cục cộng đồng                        |
| `node tests/news-check.mjs`         | Tìm kiếm, bộ lọc và hộp đọc bài viết                         |

Các bài kiểm tra trình duyệt hỗ trợ biến `BASE_URL` khi dùng cổng khác. Ảnh kiểm tra được ghi vào `test-results/`, không đưa lên GitHub.

## Triển khai và cấu hình bí mật

- Backend Node có thể phục vụ cả thư mục `dist` và API trên cùng domain. Cấu hình biến môi trường trên hosting theo [tài liệu backend](contact-backend/README.md).
- Nếu frontend và backend ở hai domain khác nhau, đặt `VITE_CONTACT_API_BASE` trước khi build và khai báo origin frontend tại backend.
- Hosting tĩnh không chạy được API Node. Bản hiện tại dùng đường dẫn từ gốc domain và điều hướng nhiều trang; cần cấu hình SPA fallback và điều chỉnh base path nếu triển khai trong một thư mục con như GitHub Pages project site.
- `.env` thật không được đưa lên GitHub. Chỉ commit các file `.env.example` không có khóa. Không đặt khóa Mailgun trong biến `VITE_*` vì các biến này được đưa vào frontend.

## Phạm vi nội dung và tư liệu

Ảnh nhiều góc kính, bốn ảnh chụp cận thành phần, các màu ngoài burgundy và thông tin đầy đủ của năm nhà sáng lập chưa được cung cấp; giao diện giữ vị trí chờ tương ứng. Tin tức là danh sách biên tập tĩnh. Các đơn vị ở trang Đối tác là đầu mối đề xuất, chưa phải đối tác đã xác nhận.

Ảnh, bài báo và tư liệu bên ngoài được ghi nguồn trên trang. Việc có trong repository không mặc nhiên cấp quyền tái sử dụng các tư liệu đó; kiểm tra quyền sử dụng của từng nguồn trước khi tái xuất bản. Repository hiện chưa có file `LICENSE`.
