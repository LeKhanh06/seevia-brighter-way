# Trang Cộng đồng

Đường dẫn: `/cong-dong` · [Tài liệu dự án](../README.md)

Header, Footer và font chữ dùng chung với các trang khác.

- `Community.tsx`: bốn phần nội dung và bộ lọc ba nhóm câu chuyện.
- `styles/Community.css`: giao diện riêng trong `.cp-main`, responsive và reduced motion.
- `assets/`: bốn ảnh tư liệu được tách từ `SeeVia_Cong_dong.html` do người dùng cung cấp.
- `storyLinks.ts`: liên kết nguồn bài viết tương ứng, giữ nguyên từ file mẫu.

Trang không có biểu mẫu riêng hoặc FAQ. CTA Hero dẫn tới các câu chuyện. Phần hệ sinh thái là định hướng phát triển, không giới thiệu là hệ thống đã hoàn thiện.

Bố cục dùng một trục tiêu đề và đoạn dẫn bên trái. Câu chuyện hiển thị theo hàng ảnh–chữ cùng tỉ lệ. Nút điều hướng cao 38px, font 13px và mũi tên SVG 16px đồng nhất với trang Về chúng tôi. Bộ lọc dùng gạch dưới để phân biệt với CTA. Animation gồm mở ảnh Hero, xuất hiện khi cuộn và hé ảnh từng câu chuyện; hỗ trợ reduced motion và bàn phím.

Liên kết Cộng đồng từ menu, footer, homepage và trang Về chúng tôi dẫn tới trang này. Kiểm tra bằng `node tests/community-check.mjs` khi Vite chạy ở cổng 5176, hoặc đặt `BASE_URL` để đổi cổng.
