export const principles = [
  {
    title: "Thoải mái",
    description: "Hướng đến cảm giác tự nhiên khi đeo suốt ngày dài.",
  },
  {
    title: "Kín đáo",
    description:
      "Dáng kính gọn gàng, để bạn tự tin ở lớp học, nơi làm việc và nơi sinh hoạt công cộng.",
  },
  {
    title: "Dễ làm quen",
    description: "Thao tác đơn giản bằng nút bấm và giọng nói.",
  },
];
const detailImageVersion = "20261021-2208";
const detailImage = (filename: string) =>
  `/images/kinh/${filename}?v=${detailImageVersion}`;

export const features = [
  {
    title: "Camera trước",
    description: "Hai camera tích hợp gọn ở hai đầu phía trước kính.",
    image: detailImage("ok_cam.png"),
  },
  {
    title: "Đệm mũi",
    description: "Cặp đệm mũi có thể điều chỉnh để kính ôm vừa khuôn mặt.",
    image: detailImage("ok_demmui.png"),
  },
  {
    title: "Cụm nút bên phải",
    description: "Gồm nút đa năng hình tròn và nút điều khiển bo tròn.",
    image: detailImage("ok_bonut.png"),
  },
  {
    title: "Microphone",
    description: "Khe microphone nằm dọc theo hai bên gọng kính.",
    image: detailImage("ok_mic.png"),
  },
  {
    title: "Loa",
    description: "Các khe loa được bố trí ở hai bên gọng.",
    image: detailImage("ok_loa.png"),
  },
  {
    title: "Cổng sạc USB-C",
    description: "Cổng sạc USB-C nằm dưới gọng bên phải.",
    image: detailImage("ok_sac.png"),
  },
  {
    title: "Đèn báo LED",
    description: "Đèn báo nhỏ trên gọng kính cho biết trạng thái pin.",
    note: "Pin chưa đầy: đèn đỏ · Pin đầy: đèn xanh.",
    image: detailImage("ok_led.png"),
  },
  {
    title: "Gọng kính",
    description: "Góc nhìn từ trên cho thấy hai càng gọng, cụm nút bên phải và phần đệm mũi.",
    image: detailImage("mat1.png"),
  },
];
export const technologies = [
  {
    label: "ĐỌC",
    title: "Văn bản & Tài liệu",
    description: "Đọc chữ tức thời và phân tích tài liệu bằng OCR.",
  },
  {
    label: "NHẬN DIỆN",
    title: "Đồ vật & Tiền Việt",
    description: "Nhận diện vật thể phổ biến và tiền tệ.",
  },
  {
    label: "HIỂU CẢNH",
    title: "Môi trường & Hình ảnh",
    description: "Mô tả thông tin trong hình ảnh và khung cảnh xung quanh.",
  },
  {
    label: "ĐIỀU KHIỂN",
    title: "Giọng nói & Nút bấm",
    description: "Ra lệnh bằng giọng nói, có phím chức năng vật lý.",
  },
];
export const milestones = [
  ["HIỆN TẠI", "Hoàn thiện bản mẫu"],
  ["TIẾP THEO", "Thử nghiệm có hướng dẫn"],
  ["SAU ĐÓ", "Cải tiến theo phản hồi"],
  ["CHƯA XÁC ĐỊNH", "Ra mắt & phân phối"],
];
export const questions = [
  [
    "SeeVia đã được bán chưa?",
    "SeeVia là dự án đang phát triển và chưa mở bán, chưa có giá bán chính thức.",
  ],
  [
    "Khi nào SeeVia ra mắt?",
    "Hiện chưa có thông tin về thời điểm ra mắt. Thông tin sẽ được cập nhật sau.",
  ],
  [
    "Làm sao để tham gia thử nghiệm hoặc góp ý?",
    "Bạn có thể kết nối với SeeVia qua mục Liên hệ hoặc cộng đồng khi các kênh này được hoàn thiện.",
  ],
  [
    "Camera có luôn hoạt động không?",
    "Không. Theo định hướng thiết kế, camera chỉ ghi nhận hình ảnh khi bạn chủ động yêu cầu.",
  ],
];
