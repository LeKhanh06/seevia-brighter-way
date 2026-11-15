// Tìm kiếm trên website: các trang trong pages.json cộng các chủ đề trỏ thẳng tới từng phần của trang.
// Từ khoá chủ đề lấy đúng theo nội dung đang có trên trang; khi nội dung trang đổi thì cập nhật ở đây.
import pageRegistry from "./pages.json";

export type SearchEntry = { title: string; description: string; href: string; aliases: string[] };

const topics: SearchEntry[] = [
  {
    title: "Màu sắc",
    description: "Bốn màu kính: Bạc ánh ngọc trai, Đen than chì, Đỏ rượu trầm, Xanh lam nhạt.",
    href: "/san-pham#colors",
    aliases: [
      "màu", "màu sắc", "màu kính", "phiên bản màu",
      "bạc", "bạc ánh ngọc trai", "lunar silver", "silver",
      "đen", "đen than chì", "graphite black", "black",
      "đỏ", "đỏ rượu", "đỏ rượu trầm", "đỏ đô", "crimson rose", "red",
      "xanh", "xanh lam", "xanh lam nhạt", "mist blue", "blue",
      "colors", "colour",
    ],
  },
  {
    title: "Thiết kế kính",
    description: "Camera trước, đệm mũi, cụm nút, microphone, loa, cổng sạc USB-C, đèn LED và gọng kính.",
    href: "/san-pham#design",
    aliases: [
      "thiết kế", "chi tiết", "camera", "camera trước", "đệm mũi", "nút", "nút bấm", "cụm nút",
      "microphone", "micro", "mic", "loa", "âm thanh", "cổng sạc", "sạc", "usb-c", "usb",
      "pin", "đèn", "đèn báo", "led", "gọng", "gọng kính", "thoải mái", "kín đáo", "design",
    ],
  },
  {
    title: "Khả năng hỗ trợ",
    description: "Đọc chữ, nhận diện tiền và màu sắc, tìm đồ vật, mô tả xung quanh, gọi điện, SOS, chỉ đường.",
    href: "/#capabilities",
    aliases: [
      "chức năng", "khả năng", "đọc chữ", "đọc văn bản", "nhận diện", "nhận diện tiền", "tiền", "tiền việt",
      "tìm đồ vật", "đồ vật", "mô tả", "mô tả xung quanh", "gọi điện", "sos", "khẩn cấp", "nhạc",
      "chỉ đường", "di chuyển", "đặt xe", "dẫn đường", "features",
    ],
  },
  {
    title: "Câu hỏi thường gặp",
    description: "Giải đáp về kính SeeVia trên trang Sản phẩm.",
    href: "/san-pham#product-faq",
    aliases: ["câu hỏi", "hỏi đáp", "giải đáp", "faq"],
  },
  {
    title: "Gửi góp ý",
    description: "Biểu mẫu gửi lời nhắn và góp ý cho đội ngũ SeeVia.",
    href: "/lien-he#letter",
    aliases: ["góp ý", "phản hồi", "lời nhắn", "gửi thư", "email", "feedback"],
  },
  {
    title: "Đội ngũ sáng lập",
    description: "Những người đứng sau dự án SeeVia.",
    href: "/ve-chung-toi#founders",
    aliases: ["sáng lập", "người sáng lập", "đội ngũ", "nhóm", "thành viên", "founders"],
  },
  {
    title: "Câu chuyện SeeVia",
    description: "Vì sao SeeVia ra đời.",
    href: "/ve-chung-toi#story",
    aliases: ["câu chuyện", "vì sao", "lý do", "story"],
  },
  {
    title: "Sứ mệnh",
    description: "Sứ mệnh và định hướng của dự án.",
    href: "/ve-chung-toi#mission",
    aliases: ["sứ mệnh", "tầm nhìn", "định hướng", "mission"],
  },
];

export const searchEntries: SearchEntry[] = [...Object.values(pageRegistry), ...topics];

/** Chữ thường, bỏ dấu tiếng Việt, gộp khoảng trắng. */
export const searchText = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Chữ thường, giữ dấu (để "đỏ" không trùng "đó", "màu" không trùng "mẫu"). */
const accentText = (value: string) =>
  value.toLocaleLowerCase("vi").normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const words = (s: string) => s.split(" ").filter(Boolean);

type Prepared = { entry: SearchEntry; title: string; aliases: string[]; all: string; allWords: string[] };
const prepare = (norm: (s: string) => string): Prepared[] =>
  searchEntries.map((entry) => {
    const title = norm(entry.title);
    const aliases = entry.aliases.map(norm);
    const all = `${title} ${aliases.join(" ")} ${norm(entry.description)}`;
    return { entry, title, aliases, all, allWords: words(all) };
  });
// Chuẩn hoá sẵn một lần, cả bản giữ dấu lẫn bản bỏ dấu.
const plain = prepare(searchText);
const accented = prepare(accentText);

/**
 * Xếp hạng theo từng từ, không phân biệt dấu:
 * cả cụm trùng tiêu đề/từ khoá > cả cụm nằm trong nội dung > mọi từ đều có (trùng nguyên từ hơn trùng đầu từ).
 * Một từ khớp khi nó trùng hẳn một từ của mục, hoặc là đầu của một từ dài (từ ≥ 3 ký tự, để "do" không khớp "dong").
 */
export function searchSite(query: string, limit = 6): SearchEntry[] {
  const q = searchText(query);
  if (!q) return [];
  // Gõ có dấu thì so khớp đúng dấu trước; không ra gì (hoặc gõ không dấu) mới so khớp bỏ dấu.
  const qa = accentText(query);
  const typedAccents = qa !== q;
  const found = typedAccents ? rank(accented, qa) : [];
  return (found.length ? found : rank(plain, q)).slice(0, limit);
}

function rank(list: Prepared[], q: string): SearchEntry[] {
  const qWords = words(q);
  const results: { entry: SearchEntry; score: number }[] = [];
  for (const p of list) {
    let score = 0;
    if (p.title === q || p.aliases.includes(q)) score += 100;
    else if (p.title.startsWith(q) || p.aliases.some((a) => a.startsWith(q))) score += 60;
    else if (` ${p.all} `.includes(` ${q} `)) score += 40;
    let allFound = true;
    for (const w of qWords) {
      if (p.allWords.includes(w)) score += 6;
      else if (w.length >= 3 && p.allWords.some((x) => x.startsWith(w))) score += 3;
      else allFound = false;
    }
    if (!allFound && score < 40) continue;
    results.push({ entry: p.entry, score });
  }
  // Một trang có thể xuất hiện ở cả mục trang lẫn mục chủ đề: giữ lần có điểm cao nhất.
  const seen = new Set<string>();
  return results
    .sort((a, b) => b.score - a.score)
    .filter((r) => !seen.has(r.entry.href) && seen.add(r.entry.href))
    .map((r) => r.entry);
}
