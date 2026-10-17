// Curated source data, not executable instructions. Draft flows are not verified capabilities.
const source =
  "SeeVia – User Flow Spec v1.0 · 11/10/2026 · bản nháp chờ nhóm review";
const draft =
  "Đây là luồng thiết kế dự kiến trong bản nháp, chưa phải tính năng đã triển khai hoặc được kiểm chứng. ";
export const userFlowKnowledge = [
  {
    id: "flow-status",
    title: "Phạm vi và độ tin cậy của User Flow Spec",
    page: "technology",
    sections: "Mục 1, 16–17",
    tags: [
      "user flow",
      "flow",
      "mvp",
      "ban nhap",
      "gia dinh",
      "pham vi",
      "da lam duoc",
    ],
    facts:
      draft +
      "Tài liệu mô tả onboarding, đọc văn bản, mô tả không gian, nhận diện vật thể, nhận diện tiền, hỏi đáp hình ảnh, lỗi và SOS cơ bản. Các giả định, tiêu chí nghiệm thu, thời gian phản hồi và mục tiêu pilot chưa phải kết quả đo. Dẫn đường thời gian thực, gọi điện, phát nhạc, chữ viết tay, wake word, rung và kết nối di động nằm ngoài phạm vi MVP của bản nháp. Các nguồn còn khác nhau về STT/TTS, vai trò app và cảm biến ánh sáng. Không dùng tài liệu này để nâng trạng thái dự án, khẳng định thông số hoặc đổi model của chatbot website.",
  },
  {
    id: "flow-onboarding",
    title: "Luồng dự kiến: thiết lập và thao tác",
    page: "technology",
    sections: "Mục 3–8, F0",
    tags: [
      "cai dat",
      "setup",
      "onboarding",
      "ket noi",
      "wifi",
      "wi fi",
      "hotspot",
      "talkback",
      "nut bam",
      "giu nut",
      "thao tac",
      "cach dung",
    ],
    facts:
      draft +
      "Thiết kế ưu tiên giọng nói: giữ nút, nói, nhả nút rồi nghe phản hồi qua loa trên gọng. App dự kiến hỗ trợ thiết lập mạng và liên kết kính, có khả năng dùng với TalkBack; đây vẫn là giả định cần xác nhận. Sau thiết lập, tác vụ thường ngày dự kiến đi qua mạng tới server, không cần nhìn màn hình điện thoại. Có thể nhờ người hỗ trợ thiết lập. Nhấn ngắn để dừng đọc, thao tác kiểm tra trạng thái và cử chỉ SOS còn là đề xuất cần xác nhận firmware; không hướng dẫn như thao tác đang hoạt động trên sản phẩm thực tế.",
  },
  {
    id: "flow-reading",
    title: "Luồng dự kiến: đọc nhanh và đọc tài liệu",
    page: "productPage",
    sections: "Mục 9, F1",
    tags: [
      "giay",
      "trang giay",
      "nghieng",
      "can chinh",
      "doc nhanh",
      "doc tai lieu",
      "ocr",
      "can giay",
      "can trang",
      "doc lai",
      "doc tiep",
      "tom tat",
      "chu viet tay",
      "doc thuoc",
    ],
    facts:
      draft +
      "Đọc nhanh hướng tới chữ ngắn trên nhãn hoặc biển. Khi đọc trang giấy bị lệch hoặc nghiêng, bản nháp dự kiến một phiên căn chỉnh: gửi khung hình xem trước, hướng dẫn bằng âm thanh để dịch giấy trái/phải, lên/xuống, gần/xa hoặc giữ yên, rồi chụp ảnh rõ khi chất lượng đạt để OCR. Đây là hướng dẫn người dùng căn giấy, KHÔNG phải bằng chứng đã có tự động xoay ảnh hoặc đã đọc được mọi góc nghiêng. Đọc lại, đọc tiếp, đọc hết hoặc tóm tắt là nhánh dự kiến; thời gian lưu chưa xác nhận. Chữ viết tay ngoài MVP. Không có số liệu tốc độ/độ chính xác OCR đã kiểm chứng. Ví dụ nhãn thuốc chỉ là kịch bản, không phải hướng dẫn dùng thuốc hoặc kết quả nhận diện thật; cần kiểm tra lại nhãn với người hỗ trợ/chuyên gia thích hợp.",
  },
  {
    id: "flow-scene",
    title: "Luồng dự kiến: mô tả không gian và vật thể",
    page: "productPage",
    sections: "Mục 10–11, F2–F3",
    tags: [
      "mo ta khong gian",
      "truoc mat",
      "xung quanh",
      "nhan dien vat",
      "dang cam",
      "tim vat",
      "chia khoa",
      "dan duong",
      "vat can",
    ],
    facts:
      draft +
      "Mô tả không gian dựa trên ảnh tĩnh, không phải cảnh báo vật cản liên tục hay dẫn đường thời gian thực. Không dùng khoảng cách ước lượng từ ảnh làm chỉ dẫn di chuyển an toàn; kính không thay gậy trắng và kỹ năng định hướng. Nhận diện vật dự kiến nói tên trước, rồi chi tiết; tìm vật là nhánh khuyến nghị, không phải khả năng đã kiểm chứng. Khi ảnh mờ hoặc không chắc, thiết kế yêu cầu nói rõ giới hạn và đề nghị chụp lại thay vì đoán.",
  },
  {
    id: "flow-money",
    title: "Luồng dự kiến: nhận diện tiền",
    page: "productPage",
    sections: "Mục 12, F4",
    tags: [
      "nhan dien tien",
      "menh gia",
      "tien thoi",
      "dem tien",
      "tien viet",
      "ngoai te",
      "to tien",
    ],
    facts:
      draft +
      "Luồng hướng tới nhận mệnh giá tiền Việt Nam từ ảnh. Khi ảnh không rõ hoặc chưa đủ chắc chắn, thiết kế yêu cầu không đoán mệnh giá và xin kiểm tra lại. Đếm nhiều tờ, cộng tổng, xử lý ngoại tệ và ngưỡng chắc chắn vẫn là giả định cần xác nhận. Các tỷ lệ đúng, thời gian và bộ thử trong tài liệu là tiêu chí nghiệm thu dự kiến, chưa phải kết quả hay cam kết. Chatbot website không xem được tờ tiền và không thực hiện giao dịch.",
  },
  {
    id: "flow-vqa",
    title: "Luồng dự kiến: hỏi đáp về hình ảnh",
    page: "technology",
    sections: "Mục 13, F5",
    tags: [
      "hoi dap hinh anh",
      "vqa",
      "mau ao",
      "han su dung",
      "hoi tiep",
      "anh cu",
      "nhan dang danh tinh",
      "gui anh",
      "camera",
    ],
    facts:
      draft +
      "Luồng kính dự kiến trả lời câu hỏi cụ thể về nội dung nhìn thấy, như màu sắc hoặc chữ trên vật; nếu câu hỏi mơ hồ thì hỏi lại, nếu ảnh thiếu thông tin thì nói không thấy thay vì bịa. Dùng ảnh cũ cho câu hỏi tiếp và thời gian giữ ảnh còn là giả định. Nhận dạng danh tính người không nằm trong luồng này. Đây là mô tả thiết kế kính; chatbot website hiện chỉ trả lời về dự án, không nhận ảnh, bật camera hoặc phân tích cảnh thực tế.",
  },
  {
    id: "flow-errors-sos",
    title: "Luồng dự kiến: phản hồi lỗi và SOS",
    page: "productPage",
    sections: "Mục 5, 14–16, F6–F7",
    tags: [
      "mat mang",
      "offline",
      "loi",
      "pin yeu",
      "thieu sang",
      "am bao",
      "sos",
      "khan cap",
      "dinh vi",
      "sms",
      "gps",
      "huy sos",
    ],
    facts:
      draft +
      "Thiết kế lỗi ưu tiên âm báo và lời giải thích khi mất mạng, ảnh mờ, không nghe rõ, máy chủ bận hoặc pin yếu. Không đồng nghĩa AI hoạt động offline; LED, đo pin, ngưỡng cảnh báo và thời gian chờ còn cần xác nhận. SOS dự kiến có bước hủy trước khi gửi tới liên hệ đã cài; vị trí dự kiến lấy từ điện thoại qua app, không phải GPS tích hợp đã được xác minh trên kính. Cử chỉ kích hoạt, SMS, quyền định vị, ảnh kèm cảnh báo và xử lý lỗi đều chưa được xác nhận. Không khẳng định đã gửi SOS, bảo đảm cứu trợ hay coi chatbot là kênh khẩn cấp; widget không có chức năng gửi SOS hoặc liên hệ thay người dùng.",
  },
].map(({ sections, ...entry }) => ({
  ...entry,
  kind: "document",
  source: `${source} · ${sections}`,
}));
