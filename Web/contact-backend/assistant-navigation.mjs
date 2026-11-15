import pages from "../src/support/pages.json" with { type: "json" };
import { normalize } from "./assistant-knowledge.mjs";

// Repair positive page directions only; preserve aliases quoted in a correction
// and ordinary mentions of the product itself.
export function canonicalPageReferences(text) {
  let result = text;
  for (const page of Object.values(pages)) {
    for (const alias of [...page.aliases].sort((a, b) => b.length - a.length)) {
      if (normalize(alias) === normalize(page.title)) continue;
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(
        new RegExp(
          `((?:tại|trên|đến|mở|xem|vào)\\s+(?:trang|mục)\\s+[«“"']?)${escaped}(?=[»”"'.,!?\\s]|$)`,
          "giu",
        ),
        `$1${page.title}`,
      );
    }
  }
  return result;
}

export function verifiedNameCorrection(message, history = []) {
  if (!/\b(sai|nham|khong phai|sua lai|menu ghi)\b/.test(normalize(message)))
    return null;
  const prior =
    history.filter((turn) => turn.role === "assistant").at(-1)?.content || "";
  for (const [id, page] of Object.entries(pages)) {
    if (!normalize(message).includes(normalize(page.title))) continue;
    const alias = page.aliases.find(
      (alias) =>
        normalize(alias) !== normalize(page.title) &&
        normalize(prior).includes(`trang ${normalize(alias)}`),
    );
    if (alias)
      return {
        id: `correction-${id}`,
        title: "Đối chiếu tên trang trong câu trả lời trước",
        page: id,
        kind: "website",
        source: "Menu chính thức và lịch sử hội thoại",
        facts: `Người dùng sửa đúng: câu trả lời trước dùng tên trang «${alias}», nhưng tên menu chính thức là «${page.title}». Cần thừa nhận đã gọi sai và sửa thành «${page.title}». Đây là sửa tên trang, không đổi tên sản phẩm.`,
      };
  }
  return null;
}

export function hasUnverifiedPath(text) {
  const paths = [
    ...text.matchAll(/(?:^|[\s("'«])\/(?:[a-z0-9_-]+\/?)+(?:#[a-z0-9_-]+)?/giu),
  ].map((match) => match[0].replace(/^[\s("'«]+/, ""));
  return paths.some(
    (path) => !Object.values(pages).some((page) => page.href === path),
  );
}

// Only explicit requests for a destination enable navigation, never ordinary feature questions.
export function requestedPages(message, history = []) {
  const text = normalize(message);
  if (!isNavigationQuestion(message)) return [];
  const match = (value) =>
    Object.entries(pages)
      .map(([id, page]) => ({
        id,
        score: Math.max(
          0,
          ...page.aliases.map((alias) => {
            const phrase = normalize(alias);
            return ` ${value} `.includes(` ${phrase} `) ? phrase.length : 0;
          }),
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  let matches = match(text);
  if (
    !matches.length &&
    (/\b(trang do|trang nay|cai do)\b/.test(text) ||
      /^(xem |doc |toi xem |toi doc )?o dau$/.test(text))
  ) {
    matches = match(
      normalize(
        history.filter((turn) => turn.role === "user").at(-1)?.content || "",
      ),
    );
  }
  return matches.slice(0, 2).map((entry) => entry.id);
}

export function isNavigationQuestion(message) {
  return /\b(trang|website|link|duong dan|o dau|cho nao|vao dau|xem o|doc o)\b/.test(
    normalize(message).replace(
      /\b(gay trang|trang thai|tinh trang|trang giay)\b/g,
      " ",
    ),
  );
}

export function navigationKnowledge(ids, includeDirectory = false) {
  if (!ids.length && includeDirectory)
    return [
      {
        id: "route-directory",
        title: "Danh mục điều hướng đã xác minh",
        page: "contact",
        kind: "website",
        source: "Menu và router SeeVia",
        facts: `Danh mục trang chính thức: ${Object.values(pages)
          .map((page) => `${page.title}: ${page.description}`)
          .join(
            "; ",
          )}. Nếu không thấy trang được hỏi trong danh mục, nói chưa xác minh có trang đó; không tạo URL hoặc khẳng định chức năng. Có thể đề xuất trang gần nhất theo mục đích đã xác minh, không coi đó là trang người dùng yêu cầu.`,
      },
    ];
  return ids.map((id) => ({
    id: `route-${id}`,
    title: pages[id].title,
    page: id,
    kind: "website",
    source: "Danh mục trang SeeVia đã xác minh từ mã nguồn",
    facts: `Tên điều hướng chính thức: «${pages[id].title}». Đường dẫn đã xác minh: ${pages[id].href}. Mục đích: ${pages[id].description} ID: ${id}. Các tên tương đương chỉ để nhận diện ý định: ${pages[id].aliases.join(", ")}; không dùng chúng làm tên trang khi chỉ dẫn. Nếu người dùng dùng tên khác, làm rõ tên chính thức. Liên kết do giao diện tạo từ ID, không tự viết URL.`,
  }));
}
