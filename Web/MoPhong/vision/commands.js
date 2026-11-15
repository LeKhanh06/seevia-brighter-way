// Phân tích lệnh nói/gõ tiếng Việt thành ý định (intent). Hàm thuần — có thể kiểm thử.
// Đây là so khớp từ khoá đơn giản cho bản mô phỏng, KHÔNG phải hiểu ngôn ngữ bằng AI.

/** Bỏ dấu, hạ chữ thường, gọn khoảng trắng — để "Gọi điện cho mẹ" và "goi dien cho me" đều khớp. */
export function normalizeText(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const has = (t, re) => re.test(t);

/**
 * @param {string} text
 * @param {{destinations?: {key:string, words:string[]}[]}} ctx  danh sách điểm đến để khớp lệnh chỉ đường
 * @returns {{intent:string, arg?:string}}
 */
export function parseCommand(text, ctx = {}) {
  const t = normalizeText(text);
  if (!t) return { intent: 'unknown' };

  // ("nhắc lại" và "nhạc" đều thành "nhac" sau khi bỏ dấu — kiểm tra nhắc lại trước)
  if (has(t, /nhac lai|noi lai|nghe lai|lap lai/)) return { intent: 'repeat' };

  // Nhạc
  if (has(t, /\b(dung|tat|tam dung)\b.*\bnhac\b|\bnhac\b.*\b(dung|tat)\b/)) return { intent: 'music_stop' };
  if (has(t, /bai (tiep|ke|sau)|chuyen bai|nhac khac|qua bai/)) return { intent: 'music_next' };
  if (has(t, /(to|lon) (len|hon)|tang (am )?luong/)) return { intent: 'vol_up' };
  if (has(t, /(nho|be) (di|hon|xuong)|giam (am )?luong/)) return { intent: 'vol_down' };
  if (has(t, /\b(phat|bat|mo|nghe)\b.*\bnhac\b|\bnhac\b/)) return { intent: 'music_play' };

  // Chỉ đường / đặt xe
  if (has(t, /(dung|huy|thoi|tat) (chi duong|dan duong|di)\b|khong di nua/)) return { intent: 'nav_stop' };
  if (has(t, /(huy|bo) (xe|chuyen)/)) return { intent: 'ride_cancel' };
  if (has(t, /\b(xe|tai xe)\s+(da\s+)?(den|toi|dau)\b|chuyen di|trang thai (xe|chuyen)/)) return { intent: 'ride_status' };
  if (has(t, /\b(dat xe|goi xe|grab|taxi|xe om)\b/)) return { intent: 'ride' };
  if (has(t, /\b(chi duong|dan duong|di den|di toi|dua toi|duong (di|den|toi)|tim duong)\b/)) {
    for (const d of ctx.destinations ?? []) {
      if (d.words.some((w) => t.includes(normalizeText(w)))) return { intent: 'nav', arg: d.key };
    }
    return { intent: 'nav' };
  }

  // Tìm đồ cá nhân
  if (has(t, /\b(tim|o dau|dau roi)\b/)) {
    if (has(t, /chia khoa/)) return { intent: 'find', arg: 'keys' };
    if (has(t, /\bvi\b|bop/)) return { intent: 'find', arg: 'wallet' };
    if (has(t, /dien thoai|\bdt\b|may dien thoai/)) return { intent: 'find', arg: 'phone' };
  }

  // Đọc & nhìn
  if (has(t, /doc (bien|chu|bang|bien hieu)|bien hieu|ghi gi|chu gi|doc cho toi/)) return { intent: 'read_sign' };
  if (has(t, /nhan dien|day la (cai )?gi|truoc mat|phia truoc|cai gi (day|kia)|vat gi/)) return { intent: 'identify' };
  if (has(t, /xung quanh|quanh day|mo ta (canh|khung canh|cho toi)|mo ta/)) return { intent: 'scan' };

  // Khác
  if (has(t, /nhac lai|noi lai|nghe lai|lap lai/)) return { intent: 'repeat' };
  if (has(t, /huong dan|tro giup|lam duoc gi|chuc nang|\bhelp\b/)) return { intent: 'help' };

  return { intent: 'unknown' };
}

/** Câu trả lời tự nhiên khi không hiểu lệnh. */
export const UNKNOWN_COMMAND =
  'Bản mô phỏng chưa hiểu lệnh này. Bạn có thể thử: "nhận diện", "mô tả xung quanh", "đọc biển hiệu", "tìm chìa khoá", "chỉ đường đến nhà thuốc", "đặt xe", "phát nhạc".';
