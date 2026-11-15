/*
 * Toàn bộ chữ hiển thị của dashboard (tiếng Việt). Sửa nhãn, chú thích, tooltip "Tác dụng"
 * ở đây mà không cần đụng vào logic. Chuỗi có {tên} sẽ được thay bằng giá trị khi hiển thị.
 */
export const fill = (template, values = {}) => String(template).replace(/\{(\w+)\}/g, (_, k) => (values[k] ?? ""));

// m(nhãn, cách tính, tác dụng): tooltip hiển thị hai mục "Cách tính" và "Tác dụng".
const m = (label, how, use) => ({ label, tip: { how, use } });

export const vi = {
  app: { name: "SeeVia", admin: "Admin", title: "SeeVia · Admin", notFoundTitle: "Không tìm thấy", skipToContent: "Bỏ qua điều hướng" },

  nav: {
    label: "Điều hướng Admin", logout: "Đăng xuất", menu: "Mở danh mục", closeMenu: "Đóng danh mục",
    groups: { features: "Báo cáo chức năng", analytics: "Phân tích", admin: "Quản trị" },
  },

  header: {
    exportCsv: "Xuất CSV", exportBusy: "Đang xuất…", periodLabel: "Kỳ báo cáo",
    themeToDark: "Chế độ tối", themeToLight: "Chế độ sáng",
    account: "Tài khoản Admin", back: "Quay lại",
  },

  routes: {
    overview: { title: "Tổng quan", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    "see-read": { title: "Đọc & Nhận diện", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)", badge: "Giá trị lõi" },
    find: { title: "Tìm & Hiểu", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)", badge: "Giá trị lõi" },
    connect: { title: "Kết nối", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    go: { title: "Di chuyển", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    community: { title: "Cộng đồng & Thiết bị", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    time: { title: "Thời điểm", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    quality: { title: "Chất lượng & tốc độ", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    engagement: { title: "Gắn bó", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    safety: { title: "An toàn", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    accounts: { title: "Tài khoản", subtitle: "Dữ liệu danh sách do hệ thống ghi nhận" },
    "account-detail": { title: "Chi tiết tài khoản" },
    devices: { title: "Thiết bị", subtitle: "Dữ liệu danh sách do hệ thống ghi nhận" },
    "device-detail": { title: "Chi tiết thiết bị" },
    errors: { title: "Lỗi hệ thống", subtitle: "Số liệu tổng hợp toàn hệ thống · Giờ Việt Nam (UTC+7)" },
    config: { title: "Cấu hình", subtitle: "Tài khoản đăng nhập Admin Web." },
    login: { title: "Đăng nhập" },
    profile: { title: "Hồ sơ quản trị viên" },
  },

  menu: { open: "Menu tài khoản", profile: "Hồ sơ quản trị viên", logout: "Đăng xuất" },
  mockTag: "Dữ liệu mẫu",
  profile: {
    infoTitle: "Thông tin tài khoản", name: "Họ tên", email: "Email", role: "Vai trò", created: "Ngày tạo tài khoản", lastLogin: "Đăng nhập gần nhất", timezone: "Múi giờ",
    roles: { admin_readonly: "Quản trị viên (chỉ xem)" }, roleChip: "Quản trị viên", readOnlyChip: "Chỉ xem",
    timezones: { "Asia/Ho_Chi_Minh": "Việt Nam (UTC+7)" }, logout: "Đăng xuất", seeProfile: "Xem hồ sơ quản trị viên", breadcrumb: "Đường dẫn",
  },
  sectionTips: {
    heat: m("Lượt theo khung giờ × thứ", "24 khung giờ 0h–23h theo giờ Việt Nam (UTC+7); một lượt tính vào khung giờ lúc bắt đầu. Ngày 00:00–23:59, tuần từ Thứ Hai đến Chủ Nhật; lượt vắt qua nửa đêm tính vào ngày bắt đầu.", "Ô đậm hơn là nhiều lượt hơn.").tip,
    byDay: m("Lượt theo ngày", "Tổng lượt mỗi ngày, ngày tính theo giờ Việt Nam.", "Cho thấy nhịp dùng trong kỳ.").tip,
    engagement: m("Chủ kính hoạt động theo ngày", "Số chủ kính có ít nhất 1 lượt sử dụng trong ngày; chỉ kết nối kính thì không tính.", "Cho thấy mức duy trì theo ngày.").tip,
    outcomes: m("Lượt sử dụng", "Đếm trên lượt sử dụng (không phải tác vụ): mỗi lượt kết thúc ở một trong sáu trạng thái hoàn thành, thất bại, hủy, không xác nhận hoặc bỏ cuộc.", "Cho thấy tỷ lệ hoàn thành, thất bại, hủy.").tip,
    attempts: m("Chỉ ghi nhận", "Đếm trên lượt ghi nhận, gồm cả hỏi lại, ảnh bị từ chối, bị ngắt. Chưa phải lượt sử dụng: người dùng thử lại ngay thì lần thử mới được tính.", "Cho thấy người dùng vấp ở đâu.").tip,
    levels: m("Phân bố mức cảnh báo", "Bốn mức: 0 Safe, 1 Danger, 2 High Danger, 3 Critical; tỷ lệ trên tổng số cảnh báo.", "Chỉ cho biết tần suất, không cho biết cảnh báo đúng hay sai.").tip,
    errorCount: m("Số lượt", "Số lượt lỗi đếm trên lượt ghi nhận, gồm cả hỏi lại, ảnh bị từ chối, bị ngắt.", "Phát hiện mã lỗi phổ biến.").tip,
  },
  periods: { today: "Hôm nay", week: "Tuần này", month: "Tháng này", custom: "Tùy chỉnh" },
  compare: { today: "hôm qua", week: "tuần trước", month: "tháng trước", custom: "kỳ trước" },
  weekdayShort: { 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7", 7: "CN" },
  weekdayLong: { 1: "Thứ Hai", 2: "Thứ Ba", 3: "Thứ Tư", 4: "Thứ Năm", 5: "Thứ Sáu", 6: "Thứ Bảy", 7: "Chủ Nhật" },

  states: {
    loading: "Đang tải số liệu…",
    emptyTitle: "Chưa có dữ liệu", emptyMessage: "Chưa có dữ liệu trong kỳ này.",
    emptyList: "Không có kết quả phù hợp.",
    errorTitle: "Không tải được số liệu", retry: "Thử lại",
    errors: {
      network: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
      timeout: "Máy chủ phản hồi quá chậm. Vui lòng thử lại.",
      forbidden: "Tài khoản này không có quyền xem trang này.",
      notFound: "Không tìm thấy dữ liệu yêu cầu.",
      server: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
      generic: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    },
    notFoundMessage: "Đường dẫn này không tồn tại.", backHome: "Về Tổng quan",
  },

  tooltip: { how: "Cách tính", use: "Tác dụng" },
  chart: { viewTable: "Xem bảng số liệu", uses: "lượt", legendCurrent: "{label}", noData: "Chưa có dữ liệu để vẽ biểu đồ." },
  table: { sortBy: "Sắp xếp theo {label}", prev: "Trang trước", next: "Trang sau", range: "{from}–{to} / {total}", clearFilters: "Xóa bộ lọc" },
  common: { all: "Tất cả", view: "Xem", stateOnline: "Online", stateOffline: "Offline" },

  login: {
    title: "Đăng nhập Admin", subtitle: "Dành cho nhóm vận hành SeeVia.",
    email: "Email", emailPlaceholder: "ten@vidu.com", password: "Mật khẩu", submit: "Đăng nhập", submitting: "Đang đăng nhập…",
    invalid: "Email hoặc mật khẩu không đúng.", network: "Không kết nối được máy chủ. Vui lòng thử lại.",
    mockHint: "Chế độ dữ liệu mẫu · Email: {email} · Mật khẩu: {password}",
  },

  // ---- Nhãn + tooltip "Tác dụng" cho từng chỉ số --------------------------------------------
  metrics: {
    // Tổng quan
    uses: m("Lượt sử dụng", "Một lần chủ kính gọi một chức năng và đi đến kết cục cuối: hoàn thành, thất bại, hủy, không xác nhận hoặc bỏ cuộc. Không tính nhấn dưới 0,3 giây, âm báo tự phát và các bước trung gian.", "Cho biết mức độ sử dụng SeeVia của toàn hệ thống."),
    active_owners: m("Chủ kính hoạt động", "Số tài khoản không trùng có ít nhất 1 lượt sử dụng trong kỳ.", "Cho biết có bao nhiêu chủ kính thực sự dùng SeeVia."),
    completion_rate: m("Tỷ lệ hoàn thành", "Số tác vụ hoàn thành chia tổng số tác vụ.", "Cho biết SeeVia tự làm xong việc cho người dùng ở mức nào."),
    usage_time: m("Thời gian sử dụng", "Tổng thời lượng các lượt cộng phút phiên live và cuộc gọi; phần trùng nhau chỉ tính một lần. Dưới 60 phút hiện “x phút”, từ 60 phút hiện “x giờ y phút”.", "Cho biết người dùng dành bao nhiêu thời gian với SeeVia, không phải thời gian đeo kính."),
    usage_per_owner: m("TB mỗi chủ kính", "Tổng thời gian sử dụng chia số chủ kính hoạt động.", "Cho biết mức dùng của một chủ kính điển hình."),
    // Trang chức năng
    share_of_total: m("Lượt sử dụng", "Số lượt của nhóm chức năng; phần trăm là tỷ lệ trên tổng lượt toàn hệ thống.", "Cho biết nhóm chức năng này được dùng nhiều đến đâu."),
    completion: m("Hoàn thành", "Số tác vụ trong nhóm hoàn thành chia tổng số tác vụ của nhóm.", "Cho biết chức năng nào hay dở dang."),
    alert_time: m("Thời gian bật cảnh báo vật cản", "Tổng thời gian chế độ cảnh báo vật cản được bật, cộng dồn các lần bật.", "Cho biết chế độ này được dùng bao lâu."),
    alerts_per_hour: m("Số cảnh báo mỗi giờ", "Tổng số cảnh báo chia tổng số giờ bật.", "Chỉ cho biết tần suất, không cho biết cảnh báo đúng hay sai."),
    // Bảng chức năng
    col_feature: m("Chức năng", "Tên chức năng.", "Xác định dòng số liệu."),
    col_uses: m("Lượt sử dụng", "Số lượt dùng chức năng trong kỳ; phiên, cuộc gọi hoặc lần bật được ghi kèm đơn vị.", "So sánh mức dùng giữa các chức năng."),
    col_completion: m("Hoàn thành", "Số tác vụ hoàn thành chia tổng số tác vụ. Dấu — nghĩa là chức năng không tính hoàn thành theo lượt.", "Phát hiện chức năng hay dở dang."),
    col_first_audio: m("Chờ nghe tiếng đầu", "Mức chờ mà 50% lượt không vượt quá (p50), từ lúc nhả nút đến tiếng đầu tiên.", "Đo tốc độ phản hồi."),
    col_errors: m("Lỗi", "Số lượt gặp lỗi kỹ thuật có mã lỗi, đếm trên lượt ghi nhận.", "Phát hiện chức năng hay lỗi."),
    // Cộng đồng & Thiết bị
    install_success: m("Tỷ lệ cài đặt kính thành công", "Số lần cài đặt đến khi kính báo “Glasses Online” chia số lần bắt đầu cài đặt. Lỗi theo mã: mạng 5 GHz, không tìm thấy kính, yêu cầu liên kết hết hạn.", "Cho biết bước cài đặt kính có khó với người dùng không."),
    install_time: m("Thời gian cài đặt kính", "Số phút từ lúc bắt đầu cài đặt đến khi kính báo “SeeVia đã sẵn sàng”. p50 là mức mà 50% lượt cài đặt không vượt quá.", "Cho biết cài đặt mất bao lâu."),
    emergency_contact: m("Tài khoản có liên hệ khẩn cấp", "Số tài khoản có ít nhất 1 liên hệ khẩn cấp chia TỔNG SỐ TÀI KHOẢN. Chỉ đếm có hoặc không, không hiển thị tên hay số điện thoại.", "Đánh giá mức sẵn sàng của luồng SOS."),
    disconnects: m("Mất kết nối / ngày", "Số sự kiện “Mất kết nối mạng” mỗi ngày (không phải trung bình mỗi kính).", "Phản ánh độ ổn định kết nối."),
    battery20: m("Dùng đến khi pin còn 20%", "Số phút từ lúc bật kính đến lúc kính báo pin còn 20%. p50 là mức mà 50% lần không vượt quá.", "Cho biết thời lượng pin thực tế."),
    glasses_sessions: m("Kết nối kính", "Số phiên kính kết nối với server, tổng thời gian kết nối và số ngày có hoạt động. Không phải thời gian đeo kính.", "Cho biết mức kết nối của thiết bị."),
    // Thời điểm
    peak_hours: m("Giờ cao điểm", "Khung giờ có nhiều lượt nhất. 24 khung 0h–23h theo giờ Việt Nam (UTC+7); lượt tính vào khung giờ lúc bắt đầu.", "Giúp lên lịch bảo trì và hỗ trợ."),
    busiest_day: m("Ngày dùng nhiều nhất", "Ngày trong tuần có nhiều lượt nhất. Ngày tính 00:00–23:59 giờ Việt Nam, tuần từ Thứ Hai đến Chủ Nhật; lượt vắt qua nửa đêm tính vào ngày bắt đầu.", "Cho biết nhịp dùng theo tuần."),
    weekend: m("Cuối tuần", "Tổng lượt vào Thứ Bảy và Chủ Nhật.", "So sánh mức dùng cuối tuần với ngày thường."),
    // Chất lượng & tốc độ
    first_try_rate: m("Hoàn thành ngay lần đầu", "Số tác vụ hoàn thành ngay lần đầu chia tổng số tác vụ.", "Cho biết người dùng có phải thử lại không."),
    avg_retries: m("Số lần thử lại TB", "Trung bình số lần thử lại mỗi tác vụ; đếm trên lượt ghi nhận.", "Cho biết mức khó dùng."),
    abandon_rate: m("Tỷ lệ bỏ cuộc", "Số tác vụ bỏ cuộc chia tổng số tác vụ: kính hỏi lại hoặc từ chối ảnh rồi người dùng không thử lại.", "Phát hiện chỗ người dùng bị kẹt."),
    first_audio_p50: m("Chờ nghe tiếng đầu (thường, p50)", "p50 là mức chờ mà 50% lượt không vượt quá, tính từ lúc nhả nút đến tiếng đầu tiên.", "Đo độ trễ của một lượt bình thường."),
    first_audio_p90: m("Chờ nghe tiếng đầu (chậm, p90)", "p90 là mức chờ mà 90% lượt không vượt quá, tính từ lúc nhả nút đến tiếng đầu tiên: 9 trong 10 lượt không chờ lâu hơn mức này.", "Đo độ trễ ở những lượt chậm."),
    final_p50: m("Chờ đến kết quả cuối (thường, p50)", "p50 là thời gian mà 50% lượt không vượt quá, từ lúc nhả nút đến kết quả cuối.", "Đo tổng thời gian chờ của người dùng."),
    // Gắn bó
    active_today: m("Hoạt động hôm nay (DAU)", "DAU: số chủ kính hoạt động hôm nay. “Hoạt động” là có ít nhất 1 lượt sử dụng; kính chỉ kết nối thì không tính.", "Đo mức duy trì theo ngày."),
    active_week: m("Hoạt động tuần này (WAU)", "WAU: số chủ kính hoạt động trong tuần này (ít nhất 1 lượt sử dụng; chỉ kết nối kính thì không tính).", "Đo mức duy trì theo tuần."),
    active_month: m("Hoạt động tháng này (MAU)", "MAU: số chủ kính hoạt động trong tháng này (ít nhất 1 lượt sử dụng; chỉ kết nối kính thì không tính).", "Đo mức duy trì theo tháng."),
    new_users: m("Người dùng mới", "Số tài khoản mới tạo trong kỳ.", "Theo dõi tăng trưởng."),
    active_glasses: m("Kính có hoạt động", "Số kính có ít nhất 1 lượt sử dụng trong kỳ trên tổng số kính; kính chỉ kết nối thì không tính.", "Cho biết bao nhiêu kính đang được dùng."),
    avg_active_days: m("Số ngày sử dụng TB", "Trung bình số ngày có hoạt động của mỗi chủ kính trong kỳ.", "Cho biết mức đều đặn khi dùng."),
    // An toàn
    sos_count: m("Số lần", "Tổng mọi lần kích hoạt Khẩn cấp (SOS) trong kỳ, gồm cả lần bị hủy trong 5 giây.", "Theo dõi mức dùng SOS."),
    sos_result: m("Thành công / thất bại", "Số lần SOS gửi thành công và thất bại. Tỷ lệ tính trên các lần không bị hủy trong 5 giây.", "Đánh giá độ tin cậy luồng SOS."),
    sos_confirm: m("Thời gian đến khi xác nhận (thường)", "p50 là thời gian từ lúc kích hoạt đến khi có người nghe hoặc xác nhận.", "Đo SOS được tiếp nhận nhanh đến đâu."),
    sos_cancelled: m("Bị hủy trong 5 giây", "Số lần SOS bị hủy ngay trong 5 giây đầu.", "Phát hiện bấm nhầm."),
    sessions: m("Số phiên", "Số lần chế độ cảnh báo vật cản được bật.", "Theo dõi mức dùng cảnh báo vật cản live."),
    total_on: m("Tổng phút bật", "Tổng số phút chế độ cảnh báo vật cản được bật.", "Cho biết chế độ này được dùng bao lâu."),
    alerts_hour: m("Cảnh báo / giờ", "Tổng số cảnh báo chia tổng số giờ bật.", "Chỉ cho biết tần suất, không cho biết cảnh báo đúng hay sai."),
  },

  // Chỉ số chi tiết của từng chức năng (khóa = tên trường trong API).
  details: {
    rejected_images: m("Ảnh bị từ chối", "Số ảnh bị từ chối vì quá mờ hoặc quá tối, kính nhắc chụp lại.", "Cho biết chất lượng ảnh người dùng chụp."),
    avg_retries: m("Thử lại TB", "Trung bình số lần thử lại một tác vụ, đếm trên lượt ghi nhận.", "Cho biết mức khó dùng."),
    processing_p50_seconds: m("Xử lý thường mất", "p50: thời gian xử lý ảnh mà 50% lượt không vượt quá.", "Đo tốc độ xử lý."),
    framing_p50_seconds: m("Căn khung thường mất", "p50: thời gian căn khung chữ vào đúng vị trí mà 50% phiên không vượt quá.", "Đo độ khó khi căn khung."),
    avg_session_seconds: m("Phiên TB", "Thời lượng trung bình của một phiên đọc chữ live.", "Cho biết người dùng đọc live bao lâu."),
    uncertain_rate_pct: m("Chưa chắc chắn", "Số lần kính chưa chắc chắn về mệnh giá (uncertain) chia số lượt nhận tiền.", "Cho biết độ tin cậy khi nhận tiền."),
    duration_p50_seconds: m("Thường kéo dài", "p50: thời lượng một lượt mà 50% lượt không vượt quá.", "Cho biết một lượt mất bao lâu."),
    web_lookup_rate_pct: m("Tỷ lệ cần tra web", "Số lượt trò chuyện cần tra web chia tổng số lượt trò chuyện.", "Cho biết nhu cầu thông tin ngoài."),
    cancel_in_window_pct: m("Hủy trong cửa sổ", "Số lượt bị hủy trong thời gian cho phép hủy chia tổng số lượt.", "Phát hiện gọi hoặc nhắn nhầm."),
    reask_pct: m("Hỏi lại", "Số lượt kính phải hỏi lại người dùng chia tổng số lượt.", "Cho biết kính nghe rõ đến đâu."),
    confirm_p50_seconds: m("Đến khi xác nhận (thường)", "p50: thời gian từ lúc yêu cầu đến khi người dùng xác nhận.", "Đo độ nhanh của bước xác nhận."),
    answer_rate_pct: m("Nghe máy", "Số cuộc gọi Internet được nghe máy chia tổng số cuộc gọi (đi và đến).", "Cho biết cuộc gọi có kết nối được không."),
    avg_call_seconds: m("Thời lượng TB", "Thời lượng trung bình của một cuộc gọi Internet.", "Cho biết cuộc gọi kéo dài bao lâu."),
    connection_errors: m("Lỗi kết nối", "Số cuộc gọi bị lỗi kết nối.", "Phát hiện vấn đề mạng khi gọi."),
    avg_play_seconds: m("Thời lượng TB", "Thời lượng nghe nhạc trung bình mỗi lượt.", "Cho biết người dùng nghe nhạc bao lâu."),
    avg_trip_seconds: m("Mỗi lần dẫn đường trung bình", "Thời gian trung bình của một lần dẫn đường.", "Cho biết một chuyến đi dài bao lâu."),
    avg_booking_seconds: m("Mỗi lần đặt xe trung bình", "Thời gian trung bình để hoàn tất một lần đặt xe.", "Cho biết đặt xe mất bao lâu."),
    cancel_midway_pct: m("Người dùng hủy giữa chừng", "Số lượt người dùng hủy khi đang thực hiện chia tổng số lượt.", "Phát hiện chỗ người dùng bỏ dở."),
    cancel_rate_pct: m("Tỷ lệ hủy", "Số lượt bị hủy chia tổng số lượt.", "Cho biết nhạc có bị hủy nhiều không."),
    total_on_seconds: m("Tổng thời gian bật", "Tổng thời gian chế độ được bật, cộng dồn các lần bật.", "Cho biết chế độ này được dùng bao lâu."),
  },
  topErrorNote: "Lỗi phổ biến: {code} · {count} lượt",
  alertsPerHourNote: "{value} cảnh báo mỗi giờ",

  // Khớp theo khóa chức năng của API.
  features: {
    ocr: "Đọc chữ", ocr_live: "Đọc chữ live", money: "Nhận tiền", ask: "Hỏi ảnh",
    find: "Tìm đồ", space: "Mô tả cảnh", hazard: "Hỏi vật cản",
    chat: "Trò chuyện", family: "Gọi người thân / nhắn tin / đọc tin", internet_call: "Gọi qua Internet", music: "Nhạc",
    directions: "Dẫn đường", ride: "Đặt xe", alert_mode: "Cảnh báo vật cản liên tục",
  },
  usesUnit: { uses: "", sessions: " phiên", calls: " cuộc", activations: " lần bật" },
  groups: { see_read: "Đọc & Nhận diện", find: "Tìm & Hiểu", connect: "Kết nối", go: "Di chuyển", community: "Cộng đồng & Thiết bị", sos: "Khẩn cấp (SOS)" },

  report: {
    detailsTitle: "Chi tiết từng chức năng",
    experimentalMark: "†",
    experimentalNote: "† An toàn · thử nghiệm có kiểm soát: chức năng liên quan an toàn, đang thử nghiệm.",
    estimate: "Chưa chắc", estimateTip: "Con số này là ước tính, chưa đủ dữ liệu để chắc chắn.",
    shareFoot: "{value} tổng lượt", completionFoot: "Tính trên tác vụ",
    usageFoot: { "see-read": "Gồm phiên đọc chữ live", find: "Tổng thời lượng các lượt", connect: "Gồm cuộc gọi Internet" },
    goFoot: { alert_time: "Cộng dồn các lần bật", alerts_per_hour: "Trung bình các lần bật" },
    connectNote: { before: "Khẩn cấp (SOS) tách riêng: xem trang ", link: "An toàn", after: "." },
  },

  overview: {
    usageTitle: "Lượt sử dụng", compareTitle: "{period} so với {compare}", deltaSuffix: "so với {compare}", pointsUnit: "điểm",
    seeQuality: "Xem chất lượng & tốc độ",
    groupsTitle: "Theo nhóm chức năng", groupsSub: "Tỷ lệ lượt sử dụng", seeGroup: "Xem báo cáo nhóm",
    topTitle: "Chức năng dùng nhiều nhất", topSub: "Xếp theo lượt sử dụng", colFeature: "Chức năng", colUses: "Lượt", colCompletion: "Hoàn thành", seeAllFeatures: "Xem tất cả chức năng",
    attentionTitle: "Cần chú ý", attentionSub: "Điểm bất thường trong kỳ", seeErrors: "Xem lỗi hệ thống", attentionEmpty: "Không có điểm bất thường trong kỳ.",
    legendUnit: "lượt", total: "lượt",
    seriesLabel: { uses: "lượt", active_owners: "chủ kính hoạt động", completion_rate: "% hoàn thành", usage_seconds: "thời gian sử dụng" },
    chartAria: "Biểu đồ {metric}, {current} so với {previous}",
    attention: {
      error_increase: "Lỗi {error} khi {feature} tăng {delta} lần so với {compare}.",
      sos: "Có {count} lần SOS, {cancelled} lần bị hủy trong 5 giây.",
      device_offline: "Kính {device} offline từ {since}.",
    },
    sinceLastNight: "tối qua", errorLabels: { net_timeout: "mạng" },
    featureActions: { ocr: "đọc chữ", ocr_live: "đọc chữ live", money: "nhận tiền", ask: "hỏi ảnh", find: "tìm đồ", space: "mô tả cảnh", chat: "trò chuyện", directions: "dẫn đường" },
  },

  community: {
    installFoot: "{ok}/{total} lần cài đặt đến khi kính online · lỗi: {error} {count}",
    installFootNoError: "{ok}/{total} lần cài đặt đến khi kính online",
    installTimeFoot: "thường (p50)",
    emergencyFoot: "{pct} tổng tài khoản",
    disconnectsFoot: "sự kiện mỗi ngày",
    batteryFoot: "thường (p50)",
    sessionsValue: "{count} phiên", sessionsFoot: "Tổng {duration} · không phải thời gian đeo", sessionsDays: " · {days} ngày hoạt động",
    setupErrors: { wifi_5ghz: "mạng 5 GHz", glasses_not_found: "không tìm thấy kính", link_request_expired: "yêu cầu liên kết hết hạn" },
  },

  time: {
    peakFoot: "Và {range} giờ các ngày trong tuần", hoursUnit: "giờ", usesFoot: "{value} lượt", weekendFoot: "T7 + CN", usesWord: "{value} lượt",
    heatTitle: "Lượt theo khung giờ × thứ",
    heatCell: "{weekday}, {hour}h: {value} lượt", dayTitle: "Lượt theo ngày", dayTable: { day: "Ngày", uses: "Lượt" }, hourColumn: "Giờ",
    dayCell: "{label}: {value} lượt",
  },

  quality: {
    completionTitle: "Hoàn thành tác vụ", completionSub: "{period} so với {compare}", pointsDelta: "{value} điểm", deltaTail: "so với {compare}",
    speedTitle: "Tốc độ phản hồi", speedSub: "Thời gian từ lúc người dùng nhả nút", 
    outcomesTitle: "Lượt sử dụng · {total} lượt",
    attemptsTitle: "Chỉ ghi nhận · {total} lượt",
    colState: "Trạng thái", colCount: "Số lượt", colShare: "Tỷ lệ (trên lượt)", colShareAttempts: "Tỷ lệ (trên lượt ghi nhận)",
    foot: { rate: "Tính trên tác vụ", firstTry: "Tính trên tác vụ", retries: "Đếm trên lượt ghi nhận", abandon: "Tính trên tác vụ" },
    outcomes: {
      completed: ["Hoàn thành", "Kính đã đọc xong kết quả cho người dùng."],
      completed_early: ["Hoàn thành – dừng sớm", "Người dùng dừng khi đã nghe đủ thông tin."],
      failed: ["Thất bại", "Lỗi kỹ thuật, có mã lỗi (xem trang Lỗi hệ thống)."],
      cancelled: ["Hủy", "Người dùng chủ động hủy."],
      unconfirmed: ["Không xác nhận", "Cuộc gọi hoặc tin nhắn chờ xác nhận nhưng hết giờ."],
      abandoned: ["Bỏ cuộc", "Kính hỏi lại hoặc từ chối ảnh, rồi người dùng không thử lại."],
    },
    attempts: {
      reask: ["Hỏi lại", "Kính chưa nghe rõ nên hỏi lại người dùng."],
      image_rejected: ["Ảnh bị từ chối", "Ảnh quá mờ hoặc quá tối nên chưa dùng được, kính nhắc chụp lại."],
      interrupted: ["Bị ngắt", "Người dùng ngắt lời kính giữa chừng."],
    },
  },

  engagement: {
    foot: { active_today: "Hôm nay", active_week: "Tuần này", active_month: "Tháng này", new_users: "Trong kỳ", active_glasses: "Trong kỳ", avg_active_days: "Mỗi chủ kính" },
    chartTitle: "Chủ kính hoạt động theo ngày", 
    cell: "{label}: {value} chủ kính", columnDay: "Ngày", columnOwners: "Chủ kính",
  },

  safety: {
    sosTitle: "Khẩn cấp (SOS)", liveTitle: "Cảnh báo vật cản live", modeLabel: "alert_mode",
    modes: { controlled_trial: "An toàn · thử nghiệm có kiểm soát" },
    distributionTitle: "Phân bố mức cảnh báo",
    levels: { 0: "0 · Safe", 1: "1 · Danger", 2: "2 · High Danger", 3: "3 · Critical" },
    levelText: "{label} · {pct}", resultValue: "{success} / {failed}", resultFoot: "{pct} thành công", secondsSuffix: "",
  },

  errors: {
    filterGroup: "Nhóm", filterFirmware: "Phiên bản",
    cols: { code: "Mã lỗi", feature: "Chức năng", group: "Nhóm", count: "Số lượt", change: "So với {compare}", last: "Lần gần nhất" },
    groupOptions: ["See & Read", "Find & Understand", "Connect", "Go", "Community & Ecosystem"],
  },

  accounts: {
    searchPlaceholder: "Tìm theo mã tài khoản", searchLabel: "Tìm theo mã tài khoản", statusLabel: "Trạng thái",
    cols: { id: "Mã tài khoản", email: "Email (ẩn một phần)", created: "Ngày tạo", status: "Trạng thái", glasses: "Số kính liên kết" },
    statuses: { active: "Hoạt động", suspended: "Tạm ngưng" },
    breadcrumb: "Tài khoản", emailLabel: "Email", createdLabel: "Ngày tạo", statusField: "Trạng thái", glassesLabel: "Số kính liên kết",
    linkedTitle: "Kính liên kết", linkedCols: { id: "Mã kính", firmware: "Phiên bản firmware", status: "Trạng thái", last: "Lần kết nối gần nhất" }, linkedEmpty: "Chưa liên kết kính nào",
  },

  devices: {
    searchPlaceholder: "Tìm theo mã kính", searchLabel: "Tìm theo mã kính", statusLabel: "Trạng thái", firmwareLabel: "Phiên bản",
    cols: { id: "Mã kính", firmware: "Phiên bản firmware", status: "Trạng thái", last: "Lần kết nối gần nhất", account: "Mã tài khoản liên kết" },
    statuses: { online: "Online", offline: "Offline" },
    breadcrumb: "Thiết bị", firmwareLabel2: "Phiên bản firmware", statusField: "Trạng thái", lastLabel: "Lần kết nối gần nhất", accountLabel: "Tài khoản liên kết",
    recentTitle: "Lỗi gần đây", recentCols: { code: "Mã lỗi", feature: "Chức năng", at: "Thời điểm" }, recentEmpty: "Chưa có lỗi gần đây.",
  },

  config: { adminTitle: "Tài khoản admin", cols: { email: "Email", created: "Ngày tạo", lastLogin: "Lần đăng nhập gần nhất" } },
};
