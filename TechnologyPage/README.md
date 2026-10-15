# Trang Công nghệ

Đường dẫn: `/cong-nghe` · [Tài liệu dự án](../README.md)

Sáu phần: Hero, phân tích thành phần kính, luồng hoạt động, xử lý thông tin, hội thoại và minh bạch. Dùng chung bảng màu burgundy–đen than–kem với các trang khác.

- `Technology.tsx`: bố cục trang và thông báo chức năng chưa hoàn thiện.
- `styles/Technology.css`: CSS có phạm vi riêng, responsive và reduced motion.
- `styles/TechnologyLayout.css`: lưới nội dung chung, phối màu và bố cục các phần mới.
- `components/CloseupParts.tsx`: bốn khối ảnh cận và chú giải hiện sẵn, thay cho sơ đồ chung. Chưa có ảnh chụp thật của bốn thành phần; xem [hướng dẫn ảnh](assets/README.md) để thêm theo tên tương ứng.
- `components/ProcessingOverview.tsx`: phân biệt bước OCR, AI và giọng đọc.
- `data/technologyData.ts`: nội dung các bước, thành phần và tình huống hội thoại.
- `components/ConversationDemo.tsx`: bốn tình huống có bối cảnh, phản hồi cụ thể và câu hỏi tiếp nối. Mỗi lần đổi tình huống sẽ bắt đầu hội thoại mới; các nút tạm khóa khi đang xử lý.
- `useTechnologyReveal.ts`: hiệu ứng xuất hiện khi cuộn, hỗ trợ bàn phím và chế độ giảm chuyển động.

Không truy cập camera, microphone hay dịch vụ AI thật. Bối cảnh và lời đáp được viết sẵn để minh họa. Menu Công nghệ và nút Tìm hiểu công nghệ từ homepage dẫn tới `/cong-nghe`. Header, Footer và Button dùng chung trong `src/components/`.

Nút góp ý dẫn tới `/lien-he#letter`. Bản dịch của các tình huống và lời đáp nằm trong [bộ bản dịch](../src/i18n/README.md).
