/*
 * Dữ liệu mẫu cho USE_MOCK = true. Mọi giá trị là SỐ THÔ như API thật (giây, %, mili giây, ISO),
 * không có chuỗi định dạng. Con số của tuần mẫu khớp bản thiết kế Mockup.
 * File này không phụ thuộc DOM/trình duyệt để mock-server/server.js dùng lại được.
 */
export const MOCK_CREDENTIALS = Object.freeze({ email: "admin@seevia.vn", password: "SeeVia@2026", token: "mock-token" });
export const MOCK_ADMIN = Object.freeze({
  id: "AD-0001", display_name: "Khánh Hà", email_masked: "kh***@gmail.com", role: "admin_readonly", timezone: "Asia/Ho_Chi_Minh",
  created_at: "2026-11-01", last_login_at: "2026-11-15T08:02:00+07:00",
});

export const WEEK_USES = [40, 52, 47, 60, 55, 25, 22];
export const WEEK_PREV = [36, 45, 50, 52, 48, 28, 21];
export const WEEK_OWNERS = [2, 3, 2, 3, 3, 1, 1];
export const HOUR_SHAPE = [1, 0, 0, 0, 0, 2, 5, 12, 18, 15, 9, 7, 6, 5, 7, 11, 16, 20, 17, 14, 8, 5, 3, 1];
export const BASE_USES = 301;
export const BASE_USAGE_SECONDS = 34800;

export const GROUP_USES = { see_read: 148, find: 71, connect: 58, go: 21 };
export const TOP_FEATURES = [
  { key: "ocr", uses: 81, completion_rate: 88 }, { key: "space", uses: 38, completion_rate: 92 }, { key: "money", uses: 31, completion_rate: 94 },
  { key: "ask", uses: 25, completion_rate: 88 }, { key: "chat", uses: 24, completion_rate: 92 },
];

const F = (key, uses, uses_unit, completion_rate, first_audio_p50_ms, errors, details, is_experimental = false) =>
  ({ key, uses, uses_unit, completion_rate, first_audio_p50_ms, errors, is_experimental, details });

export const REPORTS = {
  "see-read": {
    summary: { uses: 148, share_of_total_pct: 49, completion_rate: 89, usage_seconds: 11100 },
    features: [
      F("ocr", 81, "uses", 88, 1900, 0, { rejected_images: 14, avg_retries: 1.3, processing_p50_seconds: 3.4 }),
      F("ocr_live", 11, "sessions", null, null, 0, { framing_p50_seconds: 8, avg_session_seconds: 160 }),
      F("money", 31, "uses", 94, 1600, 0, { uncertain_rate_pct: 13, rejected_images: 4 }),
      F("ask", 25, "uses", 88, 2300, 0, { rejected_images: 3, duration_p50_seconds: 9 }),
    ],
  },
  find: {
    summary: { uses: 71, share_of_total_pct: 24, completion_rate: 88, usage_seconds: 4800 },
    features: [
      F("find", 17, "uses", 82, 2600, 0, { rejected_images: 3, duration_p50_seconds: 8 }),
      F("space", 38, "uses", 92, 2200, 0, { rejected_images: 2, duration_p50_seconds: 12 }),
      F("hazard", 16, "uses", 88, 1900, 0, { rejected_images: 1, duration_p50_seconds: 6 }, true),
    ],
  },
  connect: {
    summary: { uses: 58, share_of_total_pct: 19, completion_rate: 86, usage_seconds: 7800 },
    features: [
      F("chat", 24, "uses", 92, 2000, 0, { web_lookup_rate_pct: 21, duration_p50_seconds: 11 }),
      F("family", 19, "uses", 79, 1800, 0, { cancel_in_window_pct: 16, reask_pct: 12, confirm_p50_seconds: 9 }),
      F("internet_call", 6, "calls", null, null, 0, { answer_rate_pct: 67, avg_call_seconds: 240, connection_errors: 1 }),
      F("music", 9, "uses", 89, 2400, 0, { avg_play_seconds: 1080, cancel_rate_pct: 7 }),
    ],
  },
  go: {
    summary: { uses: 21, share_of_total_pct: 7, alert_mode_seconds: 12000, alerts_per_hour: 14 },
    features: [
      F("directions", 9, "uses", 89, 2500, 0, { avg_trip_seconds: 720, cancel_midway_pct: 11 }),
      F("ride", 4, "uses", 75, 2800, 0, { avg_booking_seconds: 180, cancel_midway_pct: 25 }),
      F("alert_mode", 8, "activations", null, null, 0, { total_on_seconds: 12000, alerts_per_hour: 14 }),
    ],
  },
};
// Các khóa là số đếm (cần nhân theo kỳ); còn lại là tỷ lệ/thời gian thường thì giữ nguyên.
export const COUNT_KEYS = new Set(["uses", "errors", "rejected_images", "connection_errors", "usage_seconds", "alert_mode_seconds", "total_on_seconds"]);

export const COMMUNITY = {
  install_attempts: 5, install_successes: 4, install_success_rate: 80, install_errors: [{ code: "wifi_5ghz", count: 1 }], install_p50_seconds: 720,
  emergency_contact_accounts: 2, disconnects_per_device_per_day: 1.4, battery_to_20_p50_seconds: 13800,
  glasses_sessions: 27, glasses_session_seconds: 112500, glasses_active_days: 6,
};

export const QUALITY = {
  completion: { rate: 87, rate_change_points: 2, first_try_rate: 71, first_try_change_points: 1, avg_retries: 1.3, abandon_rate: 6 },
  speed: { first_audio_p50_ms: 2100, first_audio_p90_ms: 4600, final_result_p50_ms: 9000 },
  outcomes: [["completed", 232], ["completed_early", 32], ["failed", 18], ["cancelled", 9], ["unconfirmed", 4], ["abandoned", 6]],
  attempts: [["reask", 41], ["image_rejected", 27], ["interrupted", 9]],
};

export const SAFETY = {
  sos: { count: 3, success: 2, failed: 0, confirm_p50_seconds: 9, cancelled_within_5s: 1 },
  live: { sessions: 8, total_on_seconds: 12000, alerts_per_hour: 14, alerts: 47, shares: [58, 27, 11, 4] },
};

// Nguồn lỗi duy nhất: bảng Lỗi hệ thống và cột "Lỗi" của các trang nhóm cùng đọc từ đây (tổng = 13).
export const ERROR_ROWS = [
  { code: "net_timeout", feature: "ocr", group: "See & Read", count: 4, change: 3, last_seen: "2026-11-15T08:31:00+07:00", firmware_version: "v0" },
  { code: "net_timeout", feature: "money", group: "See & Read", count: 1, change: 1, last_seen: "2026-11-14T10:20:00+07:00", firmware_version: "v0" },
  { code: "net_timeout", feature: "ask", group: "See & Read", count: 1, change: 0, last_seen: "2026-11-13T15:02:00+07:00", firmware_version: "v0" },
  { code: "net_timeout", feature: "find", group: "Find & Understand", count: 1, change: 0, last_seen: "2026-11-12T09:45:00+07:00", firmware_version: "v0" },
  { code: "net_timeout", feature: "space", group: "Find & Understand", count: 1, change: 0, last_seen: "2026-11-11T16:30:00+07:00", firmware_version: "v0" },
  { code: "phone_no_callback", feature: "family", group: "Connect", count: 2, change: 1, last_seen: "2026-11-14T19:05:00+07:00", firmware_version: "v0" },
  { code: "tts_fail", feature: "chat", group: "Connect", count: 1, change: 0, last_seen: "2026-11-13T10:12:00+07:00", firmware_version: "v0" },
  { code: "call_connect_fail", feature: "internet_call", group: "Connect", count: 1, change: 0, last_seen: "2026-11-12T20:15:00+07:00", firmware_version: "v0" },
  { code: "nav_route_fail", feature: "directions", group: "Go", count: 1, change: -1, last_seen: "2026-11-12T17:40:00+07:00", firmware_version: "v0" },
];

export const ACCOUNTS = [
  { id: "TK-0001", email_masked: "ng***@gmail.com", created_at: "2026-11-02", status: "active", glasses_count: 1 },
  { id: "TK-0002", email_masked: "mi***@gmail.com", created_at: "2026-11-05", status: "active", glasses_count: 1 },
  { id: "TK-0003", email_masked: "tr***@gmail.com", created_at: "2026-11-09", status: "active", glasses_count: 1 },
  { id: "TK-0004", email_masked: "ha***@gmail.com", created_at: "2026-11-12", status: "active", glasses_count: 0 },
];

export const DEVICES = [
  { id: "KINH-01", firmware_version: "v0", status: "online", last_seen_at: "2026-11-15T08:42:00+07:00", account_id: "TK-0001" },
  { id: "KINH-02", firmware_version: "v0", status: "offline", last_seen_at: "2026-11-14T21:10:00+07:00", account_id: "TK-0002" },
  { id: "KINH-03", firmware_version: "v0", status: "online", last_seen_at: "2026-11-15T08:15:00+07:00", account_id: "TK-0003" },
];
export const DEVICE_ERRORS = {
  "KINH-01": [{ code: "net_timeout", feature: "ocr", occurred_at: "2026-11-15T08:31:00+07:00" }],
  "KINH-02": [{ code: "phone_no_callback", feature: "Gọi người thân", occurred_at: "2026-11-14T19:05:00+07:00" }],
  "KINH-03": [],
};

export const ADMIN_ACCOUNTS = [
  { email_masked: "kh***@gmail.com", created_at: "2026-11-01", last_login_at: "2026-11-15T08:02:00+07:00" },
  { email_masked: "ki***@gmail.com", created_at: "2026-11-01", last_login_at: "2026-11-14T22:40:00+07:00" },
];
