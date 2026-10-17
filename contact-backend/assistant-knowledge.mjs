import pages from "../src/support/pages.json" with { type: "json" };
import { userFlowKnowledge } from "./assistant-user-flows.mjs";
import {
  conversationIntent,
  isDiscourseFollowup,
  stripDiscourse,
} from "./assistant-context.mjs";

// Curated from approved website copy and the owner's project document.
// Research assignments, projected prices/specifications and third-party results are excluded.
export const knowledge = [
  {
    id: "source-discrepancies",
    title: "Điểm chưa thống nhất về tiến độ và tên gọi",
    page: "productPage",
    kind: "website",
    source: "Hero trang chủ; ProductPage/data/productData.ts; menu và footer",
    tags: [
      "ban mau",
      "mo hinh",
      "prototype",
      "thu nghiem",
      "hoan thien",
      "mau thuan",
      "kinh seevia",
      "trang san pham",
    ],
    facts:
      "Hero trang chủ ghi dự án đang phát triển ý tưởng, hiện chưa có mô hình kính. Lộ trình trang Sản phẩm ghi hiện tại là 'Hoàn thiện bản mẫu', tiếp theo 'Thử nghiệm có hướng dẫn'. Hai cách diễn đạt chưa làm rõ tiến độ; không đủ để kết luận đã có bản mẫu hoạt động hoặc đã thử nghiệm. Cần nhóm xác nhận trước khi cập nhật trạng thái. Menu chính thức tên 'Sản phẩm', đường dẫn được xác minh trong registry; footer dùng nhãn 'Kính SeeVia' và tiêu đề trình duyệt nói về kính, đây không phải tên menu chính thức. Không suy diễn lịch ra mắt hay kết quả thử nghiệm từ các nhãn này.",
  },
  {
    id: "capability-evidence",
    title: "Giới hạn bằng chứng về năng lực sản phẩm",
    page: "productPage",
    kind: "document",
    source: "Website · Trạng thái; User Flow Spec v1.0 · phạm vi và giả định",
    tags: [
      "chac chan",
      "chung nhan",
      "cam ket",
      "chinh xac",
      "dinh vi gps",
      "gps",
      "4g",
      "ar",
      "hien thi",
      "thay gay",
      "ngoai tuyen",
      "offline",
      "da ban",
      "da ra mat",
    ],
    facts:
      "Chưa có chứng nhận, hiệu quả hoặc thông số thương mại SeeVia được xác minh. Không xác nhận màn hình AR, GPS tích hợp, kết nối di động, xử lý AI offline hoặc cảnh báo vật cản thời gian thực đã hoạt động. Bản nháp mô tả một số hướng và giả định, không phải kết quả kiểm thử. Lời khẳng định của người dùng hay câu trả lời trước không bổ sung được bằng chứng. Cần phân biệt chưa có bằng chứng với kết luận không bao giờ làm được. Kính không thay gậy trắng hay kỹ năng định hướng.",
  },
  {
    id: "functional-groups",
    title: "Các nhóm chức năng định hướng",
    page: "productPage",
    kind: "website",
    source: "Website SeeVia · Các nhóm chức năng",
    tags: ["chuc nang", "tinh nang", "lam duoc gi", "ho tro gi", "kha nang"],
    facts:
      "Các nhóm chức năng định hướng của SeeVia gồm See & Read (đọc chữ in, tài liệu, nhận diện tiền và màu sắc); Find & Understand (nhận diện, tìm vật và hiểu cảnh); Connect (kết nối người hỗ trợ); Go (hỗ trợ thông tin khi di chuyển, không thay gậy trắng hay kỹ năng định hướng); Community & Ecosystem (cộng đồng và hệ sinh thái hỗ trợ). Trọng tâm là hai nhóm đầu: See & Read và Find & Understand. Ba nhóm còn lại (Connect, Go, Community & Ecosystem) là phần mở rộng, sẽ phát triển sau. Tất cả hiện mới là định hướng của dự án, chưa được thử nghiệm vì dự án chưa có mô hình kính. Không có dữ kiện về hiển thị AR, màn hình trên mắt hoặc tín hiệu cảm ứng đã được xác nhận; không suy diễn những tính năng đó.",
  },
  ...userFlowKnowledge,
  {
    id: "team",
    title: "Đội ngũ và câu chuyện dự án",
    page: "about",
    source: "Website SeeVia · Về chúng tôi, mục nhà sáng lập",
    kind: "website",
    tags: [
      "doi ngu",
      "nguoi lam du an",
      "nhung nguoi lam",
      "sang lap",
      "founder",
      "nhom phat trien",
      "thanh vien",
      "background",
    ],
    facts:
      "Trang Về chúng tôi giới thiệu câu chuyện, lý do và định hướng phát triển SeeVia, cùng mục nhà sáng lập. Mục nhà sáng lập hiện dùng các vị trí giữ chỗ, chưa công bố tên, chân dung và vai trò thực tế. Không coi số thứ tự giữ chỗ là danh tính đã xác minh. Có thể xem trang Về chúng tôi hoặc liên hệ đội ngũ để hỏi thông tin chưa công bố; không tự đặt tên hoặc chức danh.",
  },
  {
    id: "mission",
    title: "Sứ mệnh SeeVia",
    page: "about",
    source: "Website SeeVia · Về chúng tôi",
    kind: "website",
    tags: [
      "seevia la gi",
      "gioi thieu",
      "muc tieu",
      "su menh",
      "cau chuyen",
      "y nghia",
      "kinh ai",
    ],
    facts:
      "SeeVia là dự án kính AI hỗ trợ thị giác hướng đến người khiếm thị và suy giảm thị lực tại Việt Nam. Mục tiêu là mở rộng khả năng tiếp cận thông tin, sự tự chủ, phẩm giá và kết nối cộng đồng. Đồng hành, không quyết định thay người dùng.",
  },
  {
    id: "status",
    title: "Trạng thái dự án",
    page: "productPage",
    source: "Website SeeVia · Hero và Sản phẩm; chỉ dẫn chủ dự án",
    kind: "website",
    tags: [
      "da co chua",
      "mo hinh",
      "ban mau",
      "prototype",
      "tien do",
      "khi nao",
      "ra mat",
      "mo ban",
      "mua",
      "co hang",
      "thuong mai",
    ],
    facts:
      "Thông tin đang được chủ dự án duyệt trên website: Dự án đang phát triển ý tưởng. Hiện chưa có mô hình kính. SeeVia chưa phải sản phẩm thương mại đã phát hành. Ảnh, sơ đồ, thiết kế và mô phỏng không chứng minh đã có thiết bị hoàn thiện. Không xác nhận ngày ra mắt, số lượng thiết bị, khả năng nhận diện hoặc lời hứa cung cấp sản phẩm từ các kế hoạch trong tài liệu.",
  },
  {
    id: "users",
    title: "Người dùng định hướng",
    page: "about",
    source: "Tài liệu SeeVia · Nhóm người dùng và giả thuyết MVP",
    kind: "document",
    tags: [
      "ai dung",
      "danh cho ai",
      "nguoi dung",
      "nhin kem",
      "khiem thi",
      "hoc sinh",
      "sinh vien",
      "phu huynh",
      "nguoi than",
    ],
    facts:
      "SeeVia hướng đến người khiếm thị và suy giảm thị lực tại Việt Nam. Tài liệu định hướng kiểm chứng MVP trước với người trẻ nhìn kém đang học hoặc làm việc, đã quen smartphone/công nghệ trợ năng; nhóm hỗ trợ là học sinh, sinh viên khiếm thị tại trường hoặc cơ sở hỗ trợ. Đây là định hướng nghiên cứu, không phải xác nhận đã tuyển người hoặc có kết quả pilot.",
  },
  {
    id: "see-read",
    title: "See & Read · Đọc và nhận diện",
    page: "productPage",
    source: "Tài liệu SeeVia · Phạm vi MVP; website · Khả năng hỗ trợ",
    kind: "document",
    tags: [
      "see read",
      "doc",
      "chu",
      "sach",
      "tai lieu",
      "giay to",
      "doc chu",
      "ocr",
      "tien",
      "menh gia",
      "mau sac",
      "nhan san pham",
      "bien bao",
    ],
    facts:
      "Nhóm See & Read định hướng giúp tiếp cận chữ in, văn bản, tài liệu, nhãn và biển báo tiếng Việt; nhận diện tiền và màu sắc theo nội dung giới thiệu. Đọc chữ và nhận diện tiền Việt Nam là hướng cốt lõi cần kiểm chứng. Không có độ chính xác hay hiệu năng SeeVia được xác nhận trong nguồn này.",
  },
  {
    id: "find-understand",
    title: "Find & Understand · Tìm và hiểu",
    page: "productPage",
    source: "Tài liệu SeeVia · Giải pháp tối thiểu; website · Khả năng hỗ trợ",
    kind: "document",
    tags: [
      "find understand",
      "tim",
      "do vat",
      "chia khoa",
      "mo ta",
      "xung quanh",
      "khong gian",
      "nhan dien vat",
      "hieu moi truong",
    ],
    facts:
      "Find & Understand định hướng nhận biết đồ vật phổ biến, tìm đồ vật và vị trí tương đối, mô tả ngắn gọn môi trường theo yêu cầu. Đây là định hướng phát triển và kiểm chứng; không phải nhận diện trực tiếp đang chạy trên website. Không có bảo đảm kết quả nhận diện hay độ chính xác đo khoảng cách.",
  },
  {
    id: "connect",
    title: "Connect · Kết nối",
    page: "productPage",
    source: "Website SeeVia · Khả năng hỗ trợ; tài liệu · Lộ trình mở rộng",
    kind: "document",
    tags: [
      "connect",
      "ket noi",
      "goi dien",
      "sos",
      "nghe nhac",
      "tro ly",
      "nguoi than",
      "lien lac",
    ],
    facts:
      "Connect là nhóm định hướng kết nối gồm gọi điện, SOS, nhạc và trợ lý AI trong tầm nhìn giới thiệu trên website. Tài liệu xem nhiều chức năng liên lạc và đa phương tiện là lộ trình mở rộng, không phải toàn bộ đã hoàn thiện trong MVP. Không xác nhận SOS hoạt động, định vị được hoặc thay thế dịch vụ khẩn cấp.",
  },
  {
    id: "go",
    title: "Go · Hỗ trợ di chuyển",
    page: "productPage",
    source: "Tài liệu SeeVia · Giới hạn an toàn; website · Di chuyển",
    kind: "document",
    tags: [
      "go",
      "di chuyen",
      "di duong",
      "chi duong",
      "dat xe",
      "vat can",
      "an toan",
      "gay trang",
      "dinh huong",
      "canh bao",
    ],
    facts:
      "Go là định hướng hỗ trợ thông tin di chuyển, chỉ đường bằng âm thanh và hỗ trợ đặt xe trong tầm nhìn sản phẩm. Hỗ trợ vật cản chỉ là hướng thử nghiệm trong môi trường kiểm soát; không có chứng cứ cho an toàn điều hướng độc lập. SeeVia không thay gậy trắng hoặc kỹ năng định hướng và di chuyển. Không đưa chỉ dẫn đường đi trực tiếp hoặc bảo đảm tránh va chạm.",
  },
  {
    id: "ecosystem",
    title: "Community & Ecosystem",
    page: "community",
    source:
      "Tài liệu SeeVia · Vietnam Accessibility Platform; website · Cộng đồng",
    kind: "document",
    tags: [
      "community",
      "ecosystem",
      "cong dong",
      "he sinh thai",
      "viec lam",
      "quan ly thiet bi",
      "app",
      "ung dung",
      "cau chuyen",
    ],
    facts:
      "SeeVia hướng đến hệ sinh thái kính–ứng dụng–website, hỗ trợ quản lý thiết bị, kết nối người thân và cộng đồng; nội dung giới thiệu có kết nối cơ hội việc làm. Đây là tầm nhìn mở rộng, không xác nhận app hoặc mạng lưới việc làm đã vận hành. Trang Cộng đồng có câu chuyện và nguồn tư liệu hiện có.",
  },
  {
    id: "technology",
    title: "Công nghệ và luồng tương tác",
    page: "technology",
    source: "Tài liệu SeeVia · Luồng MVP; website · Công nghệ",
    kind: "document",
    tags: [
      "cong nghe",
      "hoat dong",
      "cach dung",
      "camera",
      "micro",
      "giong noi",
      "tieng viet",
      "ai",
      "ocr",
      "xu ly",
      "nut bam",
    ],
    facts:
      "Định hướng SeeVia kết hợp thị giác máy tính, OCR và tương tác giọng nói tiếng Việt. Luồng dự kiến: người dùng chủ động nhấn nút/đưa yêu cầu, camera ghi nhận khung cảnh khi được yêu cầu, hệ thống xử lý và phản hồi âm thanh. Website chỉ có kịch bản mô phỏng viết sẵn, không dùng camera hay chạy nhận diện thật. Không công bố cấu hình phần cứng, thời lượng pin hoặc độ trễ chưa kiểm chứng.",
  },
  {
    id: "trial",
    title: "Hỏi về trải nghiệm dự án",
    page: "contact",
    source: "Website SeeVia · Đồng hành và Liên hệ",
    kind: "website",
    tags: [
      "dang ky",
      "dung thu",
      "trai nghiem",
      "thu kinh",
      "pilot",
      "mien phi",
      "cho muon",
      "giu suat",
    ],
    facts:
      "Người quan tâm có thể dùng biểu mẫu Liên hệ để hỏi hoặc bày tỏ quan tâm đến trải nghiệm và dự án. Chương trình bản mẫu chỉ được giới thiệu khi được xác nhận. Không tự xác nhận đã đăng ký, được giữ suất, có kính dùng thử, miễn phí, ngày tổ chức hoặc lịch trả lời. Không lấy mốc dự kiến trong bản tổng hợp làm lịch đã công bố.",
  },
  {
    id: "contact",
    title: "Liên hệ đội ngũ",
    page: "contact",
    source: "Website SeeVia · Liên hệ",
    kind: "website",
    tags: [
      "lien he",
      "truc tiep",
      "nguoi that",
      "gap nhom",
      "nguoi phu trach",
      "gap nguoi",
      "email",
      "zalo",
      "so dien thoai",
      "ib",
      "ho tro",
      "nhan vien",
    ],
    facts:
      "Kênh được xác minh là trang /lien-he, có biểu mẫu soạn và xem trước lời nhắn; gửi qua Mailgun khi backend sẵn sàng, hoặc sao chép/tải bản nháp khi chưa gửi được. Đây không phải live chat, không bảo đảm nhận phản hồi ngay. Không có email, số điện thoại hay Zalo công khai được xác minh trong nguồn này. AI không tự gửi biểu mẫu hoặc chuyển hội thoại đến nhóm.",
  },
  {
    id: "limits",
    title: "Thông tin chưa công bố",
    page: "faq",
    source: "Website SeeVia · Trạng thái phát triển; giới hạn nguồn đã duyệt",
    kind: "website",
    tags: [
      "gia",
      "bao nhieu",
      "gia tien",
      "bao hanh",
      "thong so",
      "pin",
      "do chinh xac",
      "hieu nang",
      "chung nhan",
      "khuyen mai",
      "phi",
      "ship",
    ],
    facts:
      "Chưa có giá bán, giá gói dịch vụ, ngày bán, chính sách bảo hành thương mại, chứng nhận, thông số hoặc hiệu năng sản phẩm được xác minh. Dự toán, giá linh kiện, mục tiêu nghiên cứu và số liệu về đối thủ trong tài liệu không phải thông tin thương mại của SeeVia. Khi được hỏi hãy nói chưa có thông tin xác nhận và gợi ý liên hệ đội ngũ; không suy đoán.",
  },
  {
    id: "partnership",
    title: "Đồng hành và hợp tác",
    page: "partnership",
    source: "Website SeeVia · Đối tác; tài liệu · Kênh dự kiến",
    kind: "website",
    tags: [
      "doi tac",
      "hop tac",
      "tai tro",
      "dong hanh",
      "truong",
      "to chuc",
      "doanh nghiep",
      "dong gop",
    ],
    facts:
      "Trang Đối tác chỉ giới thiệu hướng đồng hành, thử nghiệm, kết nối, nguồn lực và chuyên môn; KHÔNG có biểu mẫu riêng trên trang Đối tác. Biểu mẫu gửi đề xuất nằm ở trang Liên hệ. Có thể gửi lời nhắn về nhu cầu, mục tiêu và nguồn lực để nhóm xem xét, không xác nhận đã được chấp thuận hoặc có suất thử. Các trường, trung tâm và tổ chức được nhắc trong tài liệu không mặc nhiên là đối tác đã ký hoặc nhà tài trợ. Không có quy trình cam kết thử nghiệm với người dùng đã được xác nhận trong dữ liệu này.",
  },
  {
    id: "privacy",
    title: "Riêng tư và trợ năng",
    page: "privacy",
    source: "Website SeeVia · Chính sách và mô phỏng",
    kind: "website",
    tags: [
      "rieng tu",
      "du lieu",
      "bao mat",
      "ghi hinh",
      "tro nang",
      "ban phim",
      "screen reader",
      "giam chuyen dong",
    ],
    facts:
      "Chatbot website nhận văn bản người dùng nhập và gửi câu hỏi, lịch sử ngắn, nguồn liên quan tới Cohere khi nhấn Gửi. Văn bản CÓ THỂ chứa dữ liệu cá nhân nếu người dùng tự nhập; không khẳng định không thu thập dữ liệu hoặc tự ngăn được nội dung nhạy cảm. Lời nhắc không gửi nội dung nhạy cảm là khuyến nghị, không phải bảo đảm kỹ thuật. Lịch sử trò chuyện được lưu trong bộ nhớ trình duyệt (localStorage) trên chính thiết bị đang dùng: vẫn còn khi đóng chatbot hoặc tải lại trang, tự xóa sau ba mươi ngày, và người dùng có thể xóa từng cuộc trò chuyện hoặc toàn bộ lịch sử; chatbot không lưu hội thoại vào cơ sở dữ liệu trên máy chủ. Chưa xác minh chính sách lưu dữ liệu riêng của tài khoản Cohere, không hứa nhà cung cấp không lưu. Widget không bật camera, nhận ảnh, tự phát âm thanh hay tự chuyển trang. Camera trên kính là thiết kế khác: ghi nhận theo yêu cầu; bản nháp OCR có khung hình xem trước để căn giấy, chưa phải năng lực hay chính sách dữ liệu đã được kiểm chứng. Website hỗ trợ bàn phím/giảm chuyển động; chưa có chứng nhận trợ năng xác minh.",
  },
  {
    id: "news",
    title: "Bài viết và tư liệu",
    page: "news",
    source: "Website SeeVia · Tin tức",
    kind: "website",
    tags: [
      "tin tuc",
      "bai viet",
      "tin moi",
      "nguon",
      "tai lieu tham khao",
      "nghien cuu",
    ],
    facts:
      "Trang Tin tức tập hợp bài viết tham khảo và ghi chú dự án, có bộ lọc và tìm kiếm. Nghiên cứu và kết quả của sản phẩm bên ngoài chỉ là bối cảnh, không phải kết quả thử nghiệm hoặc chứng nhận của SeeVia.",
  },
];

export const pageIds = Object.keys(pages);
export const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const expand = (value) =>
  normalize(value)
    .replace(/\bmk\b/g, "minh")
    .replace(/\bntn\b/g, "nhu the nao")
    .replace(/\bko\b|\bkhong a\b/g, "khong")
    .replace(/\bdc\b/g, "duoc")
    .replace(/\bsp\b/g, "san pham");
// Topic text carried over for turns that depend on earlier context: the last two
// visitor questions plus the last assistant answer, so "Chi tiết hơn" or
// "Tại sao?" keeps the subject the visitor was actually discussing.
function contextTopic(history = []) {
  const users = history.filter((turn) => turn.role === "user").slice(-2);
  const assistant = history.filter((turn) => turn.role === "assistant").slice(-1);
  return expand([...users, ...assistant].map((turn) => turn.content).join(" "));
}
const CAPABILITY_QUESTION =
  /\b(?:ho tro|giup|lam|dung de|co the|co nhung|gom|chuc nang|tinh nang|kha nang|tien ich)\b.{0,30}\b(?:gi|nao|nhung gi|viec gi|viec nao|nhung viec|nhung chuc nang|nhung tinh nang)\b/;
export function retrieve(question, history = []) {
  const intent = conversationIntent(question);
  const discourse = isDiscourseFollowup(question) && history.length > 0;
  const current = expand(discourse ? stripDiscourse(expand(question)) : question);
  const previous = discourse
    ? contextTopic(history)
    : expand(
        history
          .filter((turn) => turn.role === "user")
          .slice(-1)
          .map((turn) => turn.content)
          .join(" "),
      );
  const score = (text, tags) =>
    tags.reduce((sum, tag) => {
      const phrase = normalize(tag);
      return (
        sum +
        (` ${text} `.includes(` ${phrase} `)
          ? phrase.includes(" ")
            ? 5
            : 2
          : 0)
      );
    }, 0);
  const continuing = discourse || isContextFollowup(current);
  const contextWeight = discourse ? 3 : continuing ? 1 : 0;
  // "SeeVia hỗ trợ những việc gì?", "giúp được gì", "có những chức năng nào":
  // a general capability question. The words "hỗ trợ" alone would otherwise
  // match the contact entry, so the functional groups are boosted and the
  // generic "hỗ trợ" is ignored for contact in this case.
  const capability = CAPABILITY_QUESTION.test(` ${current} `);
  const ranked = knowledge
    .map((item, index) => ({
      item,
      index,
      score:
        score(
          capability && item.id === "contact"
            ? current.replace(/\bho tro\b/g, " ")
            : current,
          item.tags,
        ) *
          3 +
        score(previous, item.tags) * contextWeight +
        (capability && item.id === "functional-groups" ? 40 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map((item) => item.item);
  // For a greeting or a request for question ideas, offer broad verified context
  // without making the development status the dominant answer to a meta request.
  if (intent && ranked.length === 0) {
    const ids =
      intent === "greeting"
        ? ["mission", "functional-groups", "users"]
        : [
            "mission",
            "functional-groups",
            "users",
            "see-read",
            "find-understand",
            "go",
            "status",
          ];
    return ids.map((id) =>
      knowledge.find((item) => item.id === id),
    );
  }
  // A question with no keyword match is still sent to the model with the broad
  // verified overview, so it can reason from real project facts (and say what is
  // not confirmed) instead of receiving no evidence at all. This is context, not
  // an answer: the model decides what, if anything, is relevant.
  if (ranked.length === 0) {
    const overview = ["status", "mission", "functional-groups", "users"]
      .map((id) => knowledge.find((item) => item.id === id))
      .filter(Boolean);
    return overview;
  }
  // Status is authoritative when the query concerns project facts.
  return [
    ...new Map(
      [knowledge.find((item) => item.id === "status"), ...ranked].map(
        (item) => [item.id, item],
      ),
    ).values(),
  ];
}

function isContextFollowup(text) {
  const words = text.split(" ").filter(Boolean);
  return (
    words.length <= 10 &&
    /\b(no|it|they|that|this|cai do|cai nay|tiep|con|vay|nhu vay|the con)\b/.test(
      text,
    )
  );
}

export function hasRelevantKnowledge(question, history = []) {
  const discourse = isDiscourseFollowup(question) && history.length > 0;
  const current = expand(question);
  const previous = discourse
    ? contextTopic(history)
    : expand(
        history
          .filter((turn) => turn.role === "user")
          .slice(-1)
          .map((turn) => turn.content)
          .join(" "),
      );
  const matches = (text) =>
    knowledge.some((item) =>
      item.tags.some((tag) => {
        const phrase = normalize(tag);
        return ` ${text} `.includes(` ${phrase} `);
      }),
    );
  return (
    matches(current) ||
    ((discourse || isContextFollowup(current)) && matches(previous))
  );
}
