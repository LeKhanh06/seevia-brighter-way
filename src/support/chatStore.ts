import { createChatStore } from "./chatSessions";

// Một instance dùng chung cho cả website: chuyển trang không làm mất hội thoại,
// tải lại trang thì khôi phục từ localStorage.
export const chatStore = createChatStore({
  target: typeof window === "undefined" ? null : window,
});
