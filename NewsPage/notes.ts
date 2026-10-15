export const notes = {
  voice: {
    title: "Vì sao SeeVia ưu tiên đọc văn bản tiếng Việt?",
    summary:
      "Bản mẫu đầu tiên tập trung vào đọc chữ, nhận biết đồ vật và thông tin thường ngày, trước khi mở rộng sang những tác vụ phức tạp hơn.",
    label: "Phạm vi bản mẫu",
    artwork: "Aa",
    paragraphs: [
      "Một trang tài liệu, nhãn sản phẩm hay bảng thông báo đều chứa thông tin cần dùng trong học tập và công việc. SeeVia chọn bắt đầu từ những tình huống cụ thể này: giúp người dùng tiếp nhận chữ in và thông tin thị giác qua lời đọc, thay vì phải chuyển qua nhiều công cụ hoặc nhờ người khác đọc hộ.",
      "Trong phạm vi bản mẫu đầu tiên, nhóm ưu tiên đọc văn bản, tài liệu, nhận biết đồ vật và hỏi đáp về hình ảnh. Tiếng Việt có dấu, tiền Việt Nam và các vật dụng quen thuộc là những bối cảnh cần được kiểm tra trực tiếp, không chỉ dừng ở việc hệ thống có thể trả lời bằng tiếng Việt.",
      "Nhóm dự kiến ưu tiên thử nghiệm với người trẻ nhìn kém đang học tập hoặc làm việc, đã có kinh nghiệm sử dụng smartphone hay công nghệ hỗ trợ. Học sinh, sinh viên khiếm thị tại trường và trung tâm là nhóm thử nghiệm bổ sung. Đây là lựa chọn ban đầu cần kiểm chứng; kết quả của từng nhóm sẽ cần được xem xét riêng.",
      "Việc thu hẹp phạm vi giúp nhóm tập trung đo độ chính xác, mức trợ giúp cần thiết và khả năng hoàn thành một việc cụ thể. Điều hướng độc lập và các tác vụ liên quan đến an toàn di chuyển không được xem là năng lực đã bảo đảm của bản mẫu. SeeVia hướng đến bổ sung thông tin, không thay thế gậy trắng hay kỹ năng định hướng.",
    ],
  },
  control: {
    title: "Một nút bấm, một yêu cầu: cách tương tác SeeVia theo đuổi",
    summary:
      "Nhấn nút, nói điều cần biết và nghe phản hồi. Luồng tương tác được thiết kế để giảm phụ thuộc vào màn hình và giữ quyền chủ động cho người đeo.",
    label: "Thiết kế tương tác",
    artwork: "○",
    paragraphs: [
      "Với SeeVia, người dùng không cần bắt đầu bằng việc tìm một biểu tượng trên màn hình. Luồng tương tác cốt lõi được xác định trong tài liệu dự án là: nhấn nút, nói yêu cầu, hệ thống xử lý và trả lời bằng âm thanh. Camera, microphone và nút điều khiển cùng phục vụ luồng này.",
      "Ví dụ, khi muốn đọc một tờ thông báo, người đeo hướng kính về phía văn bản, nhấn nút và đưa ra yêu cầu. Hình ảnh được dùng làm đầu vào cho bước nhận dạng và phân tích; kết quả sau đó được chuyển thành lời đọc. Đây là cách tương tác dự kiến của bản mẫu, chưa phải cam kết về tốc độ hay độ chính xác trong mọi tình huống.",
      "Camera được định hướng chỉ ghi nhận khi người dùng chủ động yêu cầu, thay vì quay liên tục. Để cách dùng này rõ ràng, nhóm cần kiểm chứng cả tín hiệu báo đã nhận lệnh, trạng thái xử lý và thời điểm tác vụ kết thúc. Một câu trả lời đúng vẫn chưa đủ nếu người đeo không biết thiết bị đang làm gì.",
      "Bên cạnh thao tác, cách xử lý, lưu trữ và xóa dữ liệu cần được làm rõ trước khi thử nghiệm với người dùng. Mục tiêu của thiết kế là giảm thao tác phải ghi nhớ, đồng thời giúp người đeo hiểu và kiểm soát từng lần tương tác với kính.",
    ],
  },
  pilot: {
    title: "SeeVia dự kiến kiểm chứng bản mẫu như thế nào?",
    summary:
      "Đánh giá từ việc người dùng có hoàn thành tác vụ, cần bao nhiêu trợ giúp và có tiếp tục sử dụng — thay vì chỉ hỏi họ có thích thiết bị hay không.",
    label: "Kế hoạch kiểm chứng",
    artwork: "01",
    paragraphs: [
      "Một bản trình diễn chạy được chưa cho biết thiết bị có hữu ích trong cuộc sống hay không. Tài liệu dự án đặt ra ba câu hỏi để kiểm chứng: người dùng có thực sự gặp khó khăn đó, SeeVia có giúp họ làm việc ấy thuận tiện hơn và họ có muốn tiếp tục sử dụng hay không.",
      "Trước khi đưa kính vào một tình huống thử nghiệm, nhóm dự kiến tìm hiểu cách người tham gia đang đọc tài liệu, nhận biết đồ vật hoặc tiếp cận thông tin. Cách làm hiện tại là mốc so sánh, để nhận ra thiết bị hỗ trợ được ở đâu và có tạo thêm thao tác bất tiện hay không.",
      "Khi thử bản mẫu, các chỉ số cần theo dõi gồm khả năng hoàn thành nhiệm vụ, thời gian thực hiện, lỗi nhận dạng, số lần cần trợ giúp và mức độ dễ sử dụng. Việc người tham gia còn chủ động dùng thiết bị sau giai đoạn làm quen cũng quan trọng hơn một lời nhận xét tích cực ngay sau buổi giới thiệu.",
      "Đây là kế hoạch kiểm chứng, không phải báo cáo kết quả đã đạt được. Nhóm cần xác nhận điều kiện thử nghiệm, sự đồng ý của người tham gia và cách xử lý dữ liệu trước khi triển khai. Những phản hồi thu được sẽ là cơ sở để điều chỉnh tính năng, trải nghiệm và phạm vi bản mẫu trước khi mở rộng.",
    ],
  },
};
