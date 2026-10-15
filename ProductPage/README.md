# Trang sản phẩm SeeVia

Đường dẫn: `/san-pham` · [Tài liệu dự án](../README.md)

```text
ProductPage/
  Product.tsx                 # Bố cục, điểm tương tác và FAQ
  styles/Product.css          # Giao diện và responsive
  data/productData.ts         # Nội dung, chức năng, tiến trình và câu hỏi
  assets/glasses-diagram.png  # Sơ đồ kính trích xuất từ PDF
  assets/glasses-burgundy.png # Bản màu burgundy trích xuất từ PDF
```

Header, Footer và Button dùng chung nằm ở `src/components/`.
Quy tắc liên kết được quản lý ở `src/navigation.ts`.

Sửa nội dung trong `data/productData.ts`, bố cục trong `Product.tsx` và kiểu trình bày trong `styles/Product.css`. Ảnh riêng của trang đặt tại `assets/` và được Vite xử lý khi build.

Chưa có ảnh kính nhiều góc hoặc các màu ngoài burgundy. Các vùng này giữ trạng thái chờ; không giả lập mô hình 360° hay gửi đăng ký thành công.

Các nút Thiết kế và Màu sắc dẫn tới `#design` và `#colors`; Công nghệ dẫn tới `/cong-nghe`. Nút trao đổi trải nghiệm và chia sẻ nhu cầu dẫn tới trang Liên hệ, không xác nhận đăng ký dùng thử. Nội dung tiếng Anh nằm trong [bộ bản dịch](../src/i18n/README.md).
