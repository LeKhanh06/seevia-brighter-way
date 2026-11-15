# Trang sản phẩm SeeVia

Đường dẫn: `/san-pham` · [Tài liệu dự án](../README.md)

```text
ProductPage/
  Product.tsx                 # Bố cục, góc nhìn kính và FAQ
  styles/Product.css          # Giao diện và responsive
  data/productData.ts         # Nội dung, chức năng, tiến trình và câu hỏi
```

Header, Footer và Button dùng chung nằm ở `src/components/`.
Quy tắc liên kết được quản lý ở `src/navigation.ts`.

Sửa nội dung trong `data/productData.ts`, bố cục trong `Product.tsx` và kiểu trình bày trong `styles/Product.css`. Ảnh kính do nhóm cung cấp nằm tại `public/images/kinh/`.

Mục Thiết kế tự động chuyển qua bốn ảnh riêng theo thứ tự mặt trước (`mat2.png`), mặt trên (`mat1.png`), mặt dưới (`mat3.png`) và hai mặt bên phải–trái (`mat.png`). Ảnh luôn được hiển thị trọn vẹn trong khung. Khi chọn một bộ phận trong danh sách bên dưới, ảnh cận cảnh tương ứng lấy từ các file `ok_*.png` trong `public/images/kinh/`; riêng mục Gọng kính dùng ảnh `mat1.png` để thấy đầy đủ hai càng gọng. Mục Màu sắc dùng bốn ảnh `mausac1.png`, `mausac3.png`, `mausac2.png` và `mausac.png`.

Các nút Thiết kế và Màu sắc dẫn tới `#design` và `#colors`; Công nghệ dẫn tới `/cong-nghe`. Nút trao đổi trải nghiệm và chia sẻ nhu cầu dẫn tới trang Liên hệ, không xác nhận đăng ký dùng thử. Nội dung tiếng Anh nằm trong [bộ bản dịch](../src/i18n/README.md).
