export const steps = [
  {
    title: "Người dùng yêu cầu",
    description:
      "Nhấn nút và nói điều mình cần, ví dụ “Đọc giúp tôi nội dung này”.",
    icon: "microphone",
  },
  {
    title: "Camera ghi nhận hình ảnh",
    description:
      "Camera chỉ hoạt động khi có yêu cầu và chụp lại khung cảnh phía trước.",
    icon: "camera",
  },
  {
    title: "Hệ thống phân tích",
    description:
      "AI, thị giác máy tính và OCR xử lý hình ảnh để hiểu nội dung.",
    icon: "analysis",
  },
  {
    title: "Phản hồi bằng giọng nói",
    description: "Kết quả được đọc lại bằng tiếng Việt qua loa của kính.",
    icon: "speaker",
  },
];
export const components = [
  {
    title: "Camera kích hoạt theo yêu cầu",
    description:
      "Camera không ghi nhận liên tục. Kính chỉ chụp hình khi người dùng nhấn nút và đưa ra yêu cầu.",
    footnote:
      "Nhằm giúp người dùng chủ động kiểm soát khi nào hình ảnh được thu nhận.",
    visual: "camera",
  },
  {
    title: "AI & thị giác máy tính",
    description:
      "Hệ thống phân tích hình ảnh để nhận biết đồ vật, bối cảnh và những thông tin cần thiết cho yêu cầu của bạn.",
    footnote: "Khả năng nhận biết được kiểm chứng dần cùng người dùng thực tế.",
    visual: "ai",
  },
  {
    title: "OCR — nhận dạng chữ",
    description:
      "Chuyển chữ in trong tài liệu, nhãn thuốc, biển báo thành văn bản để đọc thành tiếng, hướng đến tiếng Việt có dấu.",
    footnote:
      "Chữ nhỏ, bề mặt phản chiếu hoặc thiếu sáng có thể ảnh hưởng kết quả.",
    visual: "ocr",
  },
  {
    title: "Tương tác giọng nói",
    description:
      "Bạn nói điều mình cần; hệ thống hiểu yêu cầu và phản hồi bằng giọng đọc tiếng Việt.",
    footnote:
      "Cách tương tác tiếp tục được hoàn thiện theo phản hồi của người dùng.",
    visual: "voice",
  },
];
export const conversations = [
  {
    question: "Đọc giúp tôi nội dung này.",
    category: "Đọc chữ",
    scene: "Trên bàn · Một tờ thông báo",
    label: "Đọc văn bản",
    answer:
      "Thông báo ghi: “Thư viện mở cửa từ 8 giờ đến 17 giờ, từ thứ Hai đến thứ Sáu.”",
    followup: "Thứ Bảy có mở cửa không?",
    reply:
      "Thông báo chỉ ghi lịch từ thứ Hai đến thứ Sáu, chưa có thông tin về thứ Bảy.",
  },
  {
    question: "Tìm giúp tôi chai nước.",
    category: "Tìm đồ vật",
    scene: "Trên bàn · Chai nước cạnh quyển sách",
    label: "Tìm đồ vật",
    answer: "Có một chai nước ở bên phải khung hình, cạnh quyển sách trên bàn.",
    followup: "Chai nước ở bên nào của quyển sách?",
    reply: "Chai nước nằm bên phải quyển sách trong hình ảnh vừa ghi nhận.",
  },
  {
    question: "Phía trước có gì?",
    category: "Mô tả xung quanh",
    scene: "Trong phòng · Bàn, ghế và cửa sổ",
    label: "Hiểu bối cảnh",
    answer:
      "Phía trước là một chiếc bàn và hai chiếc ghế. Bên trái có cửa sổ đang mở.",
    followup: "Trên bàn có gì?",
    reply:
      "Trên bàn có một quyển sách và một chai nước. Các vật nhỏ hơn trong hình chưa nhìn rõ.",
  },
  {
    question: "Đây là tờ tiền bao nhiêu?",
    category: "Nhận diện tiền",
    scene: "Trên tay · Một tờ tiền Việt Nam",
    label: "Nhận diện tiền",
    answer:
      "Trong tình huống này, tờ tiền có mệnh giá 100.000 đồng, tức một trăm nghìn đồng.",
    followup: "Bạn có kiểm tra được tiền thật không?",
    reply:
      "Không. Nhận diện mệnh giá qua hình ảnh không xác minh được tiền thật hay tiền giả.",
  },
];
