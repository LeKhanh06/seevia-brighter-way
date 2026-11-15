// Stateless helpers: each request carries only its own bounded session context.
export const questionKey = (value) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("vi")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
const plainText = (value) =>
  questionKey(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

// This only identifies conversational requests; the model still writes the reply
// and chooses any follow-up questions from the retrieved project facts.
export function conversationIntent(message) {
  const text = plainText(message);
  if (/^(?:hello|hi|hey|xin chao|chao|chao ban|alo|alo seevia)$/.test(text))
    return "greeting";
  if (
    /\b(goi y|cau hoi mau|cau hoi goi y|cau hoi tiep)\b/.test(text) &&
    /\b(dau|hien thi|o dau|khong thay|khong co|cho toi|cho minh|cau hoi|hoi gi|hoi ve|hoi them|noi dung|nen|them)\b/.test(text)
  )
    return "suggestions";
  if (/\b(?:nen|co the) hoi gi\b/.test(text)) return "suggestions";
  return null;
}

// Short turns that only make sense relative to the previous answer ("Chi tiết
// hơn", "Tại sao?", "Tóm tắt lại"). They never name a topic themselves, so the
// topic must come from history; this only detects the dialogue act.
const DISCOURSE_PATTERNS = [
  /^(?:chi tiet|ro|cu the|day du|dai|ngan|gon|de hieu|don gian)(?: hon| them| chut)?$/,
  /^(?:tai sao|vi sao|vi the nao|sao lai vay|sao vay|nghia la sao|y ban la gi|y la sao)$/,
  /^(?:con gi nua|con nua khong|con gi khac|tiep di|tiep tuc|nua di|noi tiep|vay con)$/,
  /^(?:cho )?(?:minh |toi )?(?:xin )?(?:mot )?vi du(?: di| nhe| duoc| dc)?$/,
  /^(?:(?:tom tat|noi lai|giai thich lai|noi ngan gon|noi de hieu|giai thich de hieu|so sanh)(?: giup| cho)?(?: minh| toi)?(?: nhe| di| lai| hon| ngan gon| dc| thoi| nha)*)$/,
  /^(?:giai thich|noi|tra loi)(?: (?:lai|ky|ro|chi tiet|ngan gon|de hieu|don gian))(?: hon)?(?: giup| cho)?(?: minh| toi)?(?: nhe)?$/,
  /^(?:giai thich|noi|dien dat|trinh bay|tra loi)(?: lai)? (?:theo )?cach khac(?: duoc khong| di| nhe| giup| cho)*(?: minh| toi)?$/,
  /^(?:noi|dien dat) khac di$/,
  /^(?:the (?:con|thi sao|nao)|con .{1,30} thi sao)$/,
];
export function isDiscourseFollowup(message = "") {
  const text = plainText(message);
  if (!text || text.split(" ").length > 9) return false;
  return DISCOURSE_PATTERNS.some((pattern) => pattern.test(text));
}
export const stripDiscourse = (text) =>
  text
    .replace(
      /\b(chi tiet|ro hon|cu the|tom tat|noi lai|giai thich|de hieu|ngan gon|tai sao|vi sao|con gi nua|giup|minh|toi|nhe|hon|lai|di)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();

// Fast semantic guards for obvious dialogue acts and clearly external tasks.
// Contextual or unfamiliar requests are left for the existing grounded model call.
export function classifyFastIntent(message) {
  const text = plainText(message);
  const words = text.split(" ").filter(Boolean);
  const social =
    /^(?:hello|hi|hey|xin chao|chao|chao ban|alo|alo seevia)$/.test(text) ||
    (words.length <= 12 &&
      /^(?:ban|minh)\s+(?:(?:co\s+)?khoe(?:\s+khong)?|(?:da\s+)?an com(?:\s+chua)?|ten gi|la ai|(?:co\s+)?biet nau an|thich gi|co the lam gi)(?:\s|$)/.test(
        text,
      ));
  if (social) return "SOCIAL";

  if (
    /\b(?:thoi tiet|du bao thoi tiet|nhiet do ngoai troi|troi (?:co )?mua|hom nay (?:co )?mua|troi nang)\b/.test(
      text,
    )
  )
    return "OUT_OF_SCOPE";
  if (
    /\d\s*(?:[+*/=^]|-|×|÷|chia|nhan)\s*\d/.test(text) ||
    /\b(?:giai phuong trinh|bai toan|phep tinh|dao ham|can bac hai)\b/.test(
      text,
    )
  )
    return "OUT_OF_SCOPE";
  if (
    /\b(?:chinh tri|tong thong|bau cu|quoc hoi|chinh phu|chinh sach nha nuoc)\b/.test(
      text,
    )
  )
    return "OUT_OF_SCOPE";
  return null;
}

// Cheap, bounded responses for common social turns; other conversational
// language is left to the grounded model rather than guessed by keywords.
export function fastIntentReply(message, intent) {
  if (intent === "OUT_OF_SCOPE")
    return "Mình là trợ lý AI của SeeVia, chuyên hỗ trợ thông tin về dự án kính thông minh dành cho người khiếm thị. Câu hỏi này nằm ngoài phạm vi hỗ trợ của mình; bạn có thể hỏi mình về SeeVia nhé!";
  if (intent !== "SOCIAL") return null;
  const text = plainText(message);
  if (/\b(khoe|an com)\b/.test(text))
    return "Mình là trợ lý AI của SeeVia nên không có sức khỏe hay ăn uống như con người. Mình chuyên hỗ trợ thông tin về dự án kính thông minh dành cho người khiếm thị; bạn có thể hỏi mình về SeeVia nhé!";
  if (/\b(ten gi|la ai)\b/.test(text))
    return "Mình là trợ lý AI của SeeVia, có thể hỗ trợ bạn tìm hiểu thông tin về dự án. Bạn muốn hỏi điều gì về SeeVia?";
  if (/\b(nau an|thich gi|co the lam gi)\b/.test(text))
    return "Mình không nấu ăn hay có sở thích như con người; mình là trợ lý AI của SeeVia và tập trung hỗ trợ thông tin về dự án.";
  return "Chào bạn! Mình là trợ lý AI của SeeVia, sẵn sàng hỗ trợ bạn tìm hiểu về dự án.";
}
const topicKey = (text) =>
  questionKey(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(
      /\b(toi|minh|muon|biet|them|ve|co|thong tin|nao|khac|khong|xin|vui long|giai thich|the nao|nhu the nao|khi nao|luc nao|duoc|cho|hoi)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
function nearDuplicate(first, second) {
  const a = new Set(topicKey(first).split(" ").filter(Boolean)),
    b = new Set(topicKey(second).split(" ").filter(Boolean));
  if (a.size < 3 || b.size < 3) return false;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return (
    intersection / new Set([...a, ...b]).size >= 0.88 ||
    intersection / Math.min(a.size, b.size) >= 0.8
  );
}
export function boundedContext(message, history = []) {
  const turns = history.map((turn) => ({
    role: turn.role,
    content: turn.content.trim().slice(0, 800),
  }));
  if (
    turns.at(-1)?.role === "user" &&
    questionKey(turns.at(-1).content) === questionKey(message)
  )
    turns.pop();
  const recent = turns.slice(-6);
  while (recent.reduce((sum, turn) => sum + turn.content.length, 0) > 3200) {
    recent.splice(
      0,
      recent[0]?.role === "user" && recent[1]?.role === "assistant" ? 2 : 1,
    );
  }
  return recent;
}
export function filterSuggestions(
  value,
  { message = "", history = [], recentSuggestions = [] } = {},
) {
  if (!Array.isArray(value)) return [];
  const seen = new Set(
    [
      message,
      ...history
        .filter((turn) => turn.role === "user")
        .map((turn) => turn.content),
      ...recentSuggestions,
    ].map(questionKey),
  );
  const result = [];
  const prior = [
    message,
    ...history
      .filter((turn) => turn.role === "user")
      .map((turn) => turn.content),
    ...recentSuggestions,
  ];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const text = item.trim().replace(/\s+/g, " ");
    if (
      !text ||
      text.length > 120 ||
      /https?:|www\.|javascript:|<|>|\]\(/i.test(text) ||
      /^(bạn|quý khách)\b/iu.test(text) ||
      /câu hỏi nào khác|thông tin gì khác|muốn biết (?:gì|thêm chi tiết nào)/iu.test(
        text,
      )
    )
      continue;
    const key = questionKey(text);
    if (
      !key ||
      seen.has(key) ||
      [...prior, ...result].some((previous) => nearDuplicate(text, previous))
    )
      continue;
    seen.add(key);
    result.push(text);
    if (result.length === 3) break;
  }
  return result;
}
export const isConversationEnd = (message) => {
  const text = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (
    !message.includes("?") &&
    (/^(cam on( ban| nhe| nhieu)?|tam biet|bye|ket thuc)$/.test(text) ||
      /(?:^|\s)(tam biet|khong can hoi them|khong can nua)$/.test(text))
  );
};
