# SeeVia Admin Dashboard

Frontend tĩnh (HTML, CSS, JavaScript ES module), không build. Chỉ xem, không có nút tạo/sửa/xóa.

## Chạy
Mở thư mục `Dashboard/` bằng Live Server hoặc `python -m http.server 8765`, rồi mở `http://127.0.0.1:8765/`. (ES module không chạy qua `file://`.)
Mặc định `USE_MOCK = true`; thông tin đăng nhập mẫu hiện trên màn hình đăng nhập.

## Ghép backend (không phải sửa giao diện)
1. `js/config.js`: `USE_MOCK = false`, `API_BASE_URL = "<địa chỉ API>"` (cần CORS nếu khác origin).
2. Backend làm theo `docs/API_CONTRACT.md`.
Dashboard dùng toàn đường dẫn tương đối nên đặt dưới đường dẫn con (base path) vẫn chạy.

## Kiến trúc 3 lớp
| Lớp | Thư mục | Vai trò |
|---|---|---|
| Dữ liệu | `js/api/` | `client.js` là nơi duy nhất gọi `fetch` (token, timeout, 401/403/5xx, thử lại GET 1 lần, hủy yêu cầu cũ). `api/mock/` là dữ liệu mẫu cùng hình dạng API thật. |
| Chuyển đổi | `js/mappers/` | Phản hồi API → cấu trúc hiển thị (định dạng vi-VN, null/0 → "—", nhãn + tooltip). |
| Giao diện | `js/views/` | Chỉ nhận dữ liệu đã chuẩn hóa và dựng DOM (không `innerHTML`). |

Khác: `js/registry.js` (route → endpoint/mapper/view), `js/i18n/vi.js` (toàn bộ chữ + tooltip "Tác dụng"), `js/core/` (router hash, kỳ, phiên, theme, CSV, tooltip), `css/tokens.css` (nơi duy nhất định nghĩa màu).

URL: `#overview?period=week`, `#accounts?q=tk&status=active&sort=created_at&order=desc&page=2`, `#account-detail/TK-0001`.

## Ghi chú
- `docs/METRICS.md`: bảng chỉ số (tên, trường API, đơn vị, cách tính) sinh từ `js/i18n/vi.js`.
- `css/motion.css`: hiệu ứng; chỉnh thời gian ở `--dur-*`, `--ease`. Tự tắt khi bật giảm chuyển động.
- Chế độ dữ liệu mẫu hiện nhãn "Dữ liệu mẫu" ở chân sidebar; tắt khi `USE_MOCK = false`.
- `tools/check-routes.mjs`: duyệt mọi route bằng Chrome headless, báo lỗi nếu chữ/tooltip chứa "[object", "undefined", "NaN" và chạy kiểm tra chéo số liệu mẫu (`js/api/mock/validate.js`). Chạy: `node tools/check-routes.mjs`.
