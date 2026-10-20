// Trợ lý trò chuyện MÔ PHỎNG: câu trả lời soạn sẵn theo từ khoá — KHÔNG phải AI thật.
// Hàm thuần để kiểm thử.

import { normalizeText } from './commands.js';

const WEEKDAYS = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];
const JOKES = [
  'Cà phê nói với đường: nhờ có bạn mà cuộc đời mình bớt đắng đấy.',
  'Hỏi: cái gì đi mãi mà không đến nơi? Đáp: cái đồng hồ, kim cứ đi vòng vòng mà vẫn ở yên trên tường.',
  'Cô giáo hỏi: nếu em có hai quả cam và cho bạn một quả thì còn mấy? Học sinh đáp: dạ còn một quả và một người bạn ạ.',
];

export const CHAT_GREETING =
  'Chào bạn, mình là trợ lý đồng hành của SeeVia trong bản mô phỏng. Bạn có thể hỏi giờ giấc, ngày tháng, hoặc trò chuyện nhẹ nhàng.';

/**
 * @param {string} raw
 * @param {{now?:Date, jokeIndex?:number, distToCrossing?:number}} ctx
 * @returns {{text:string, jokeIndex?:number}}
 */
export function chatReply(raw, ctx = {}) {
  const now = ctx.now ?? new Date();
  const t = normalizeText(raw);
  const pad = (n) => String(n);
  if (!t) return { text: 'Mình đang nghe đây. Bạn muốn nói gì?' };
  if (/tam biet|\bbye\b|hen gap lai/.test(t)) return { text: 'Tạm biệt bạn, hẹn gặp lại. Chúc bạn một ngày thật nhiều năng lượng.' };
  if (/cam on|\bthanks?\b/.test(t)) return { text: 'Không có gì ạ. Mình luôn ở đây khi bạn cần.' };
  if (/may gio|bay gio la/.test(t)) return { text: `Bây giờ là ${pad(now.getHours())} giờ ${pad(now.getMinutes())} phút.` };
  if (/ngay (may|bao nhieu)|hom nay (la )?(thu|ngay)|thu may/.test(t)) {
    return { text: `Hôm nay là ${WEEKDAYS[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}.` };
  }
  if (/ban (la ai|ten (gi|la gi))|ai day/.test(t)) {
    return { text: 'Mình là trợ lý trò chuyện trong bản mô phỏng SeeVia. Mình trả lời bằng những câu soạn sẵn, không phải AI thật.' };
  }
  if (/troi|thoi tiet|nang|mua\b/.test(t)) {
    return { text: 'Trong cảnh mô phỏng này, trời nắng nhẹ và buổi sáng khá mát. Mình không có dữ liệu thời tiết thật.' };
  }
  if (/dang o dau|vi tri|minh o dau/.test(t)) {
    const d = ctx.distToCrossing;
    return { text: d == null ? 'Bạn đang ở trên một con phố mô phỏng.' : `Bạn đang ở trên một con phố mô phỏng, cách vạch sang đường khoảng ${Math.max(1, Math.round(d))} mét.` };
  }
  if (/chuyen (cuoi|vui)|ke chuyen|cau do|vui di/.test(t)) {
    const i = ((ctx.jokeIndex ?? -1) + 1) % JOKES.length;
    return { text: JOKES[i], jokeIndex: i };
  }
  if (/\b(buon|met moi|chan|co don|lo lang|stress)\b/.test(t)) {
    return { text: 'Mình rất tiếc khi nghe vậy. Bạn có thể kể thêm nếu muốn. Mình cũng có thể phát nhạc nhẹ hoặc giúp bạn gọi cho người thân.' };
  }
  if (/khoe khong|the nao|co on khong/.test(t)) return { text: 'Mình khoẻ, cảm ơn bạn đã hỏi. Còn bạn, sáng nay thế nào?' };
  if (/^(xin )?chao|\bhello\b|\bhi\b/.test(t)) return { text: CHAT_GREETING };
  return {
    text: 'Mình là bản mô phỏng nên chỉ trả lời được một số câu như chào hỏi, giờ giấc, ngày tháng và trò chuyện nhẹ. Bạn thử hỏi “mấy giờ rồi” hoặc “kể chuyện vui” nhé.',
  };
}
