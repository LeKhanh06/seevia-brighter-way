export const capabilities = [
  {
    title: "Đọc &\nNhận diện",
    description: "Đọc chữ, nhận diện tiền và màu sắc.",
    icon: "document",
  },
  {
    title: "Tìm &\nHiểu",
    description: "Tìm đồ vật, mô tả xung quanh.",
    icon: "search",
  },
  {
    title: "Kết nối",
    description: "Gọi điện, SOS, nhạc và AI.",
    icon: "phone",
  },
  {
    title: "Di chuyển",
    description: "Chỉ đường bằng âm thanh, hỗ trợ đặt xe.",
    icon: "navigation",
  },
  {
    title: "Cộng đồng",
    description: "Quản lý thiết bị, kết nối và việc làm.",
    icon: "person",
  },
];
export const scenarios = [
  {
    id: "text",
    title: "Đọc chữ",
    response:
      "Thẻ lên máy bay Vietnam Airlines. Từ Hồ Chí Minh City đến Hà Nội. Chuyến bay VN272, ngày 20 tháng 8. Giờ lên máy bay 18 giờ 20. Cửa lên máy bay 06, hạng Economy Class.",
    alt: "Hai thẻ lên máy bay Vietnam Airlines, thông tin hành khách đã được che.",
    image: "/images/ai-boarding-pass.jpg",
    boxes: [{ x: 30, y: 25, w: 38, h: 43, label: "Thông tin chuyến bay" }],
  },
  {
    id: "money",
    title: "Nhận diện tiền",
    response: "Đây là tờ tiền mệnh giá năm mươi nghìn đồng.",
    alt: "Tờ tiền Việt Nam mệnh giá 50.000 đồng trên mặt bàn gỗ.",
    image: "/images/ai-money.jpg",
    boxes: [{ x: 4, y: 8, w: 92, h: 85, label: "50.000 đồng" }],
  },
  {
    id: "surroundings",
    title: "Mô tả xung quanh",
    response:
      "Bên trái có xe máy đỗ trên vỉa hè. Phía trước có người đi bộ. Bên phải có lối lát nổi, một cột biển và nắp hố ga nằm trên lối lát. Trên lòng đường có xe máy và xe đạp.",
    alt: "Vỉa hè có xe máy đỗ bên trái, người đi bộ phía trước, lối lát nổi và cột biển bên phải; ngoài đường có xe máy và xe đạp.",
    image: "/images/ai-street.jpg",
    boxes: [
      { x: 4, y: 46, w: 34, h: 37, label: "Xe máy đỗ" },
      { x: 56, y: 42, w: 5, h: 20, label: "Người đi bộ" },
      { x: 72.3, y: 8.5, w: 2.5, h: 62.5, label: "Cột biển" },
      { x: 62, y: 62, w: 10.5, h: 4, label: "Nắp hố ga" },
    ],
  },
];
