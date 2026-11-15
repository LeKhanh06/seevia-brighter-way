import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  createChatStore,
  buildApiContext,
  hasUnansweredQuestion,
  STORAGE_KEY,
  LIMITS,
  DEFAULT_TITLE,
} from "../src/support/chatSessions.ts";
import {
  createAssistantHandler,
  validateQuestion,
} from "../contact-backend/assistant.mjs";

// ---- Công cụ giả lập -------------------------------------------------------
const memoryStorage = (quotaChars = Infinity) => {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem(k, v) {
      if (v.length > quotaChars) throw new DOMException("quota", "QuotaExceededError");
      map.set(k, v);
    },
    removeItem: (k) => map.delete(k),
  };
};
const clock = (start = 1_800_000_000_000) => {
  let t = start;
  const now = () => t;
  now.advance = (ms) => (t += ms);
  return now;
};
let counter = 0;
const uid = () => `id-${++counter}`;
const open = (storage, now = clock(), extra = {}) =>
  createChatStore({ storage, now, uid, target: null, ...extra });

// Mô phỏng một lượt hỏi–đáp như giao diện sẽ làm.
function exchange(store, question, answer, suggestions = []) {
  const sid = store.getSnapshot().activeId;
  const ctx = store.buildApiContext(sid);
  store.append({ role: "user", content: question }, sid);
  store.append({ role: "assistant", content: answer, kind: "answer" }, sid);
  store.setSuggestions(suggestions, sid);
  return ctx;
}
const welcome = (store) => {
  store.append({ role: "assistant", content: "SeeVia xin chào!", kind: "welcome" });
  store.setSuggestions(["SeeVia dành cho ai?", "Kính SeeVia định làm được gì?", "Dự án đang ở giai đoạn nào?"]);
};

// ---- 1–3. Đóng/mở, chuyển trang, tải lại ----------------------------------
test("đóng/mở chatbot không đổi gì: trạng thái nằm trong store, không trong component", () => {
  const store = open(memoryStorage());
  welcome(store);
  exchange(store, "SeeVia là gì?", "SeeVia là ý tưởng kính thông minh.", ["Ai dùng được?"]);
  const before = store.getSnapshot();
  // "Đóng" và "mở" widget chỉ là đổi cờ giao diện; store không có thao tác nào tương ứng.
  assert.equal(store.getSnapshot(), before, "snapshot ổn định khi không có thay đổi");
  assert.equal(store.getActive().messages.length, 3);
});

test("tải lại website / chuyển trang: khôi phục đúng tin nhắn, gợi ý và ngữ cảnh", () => {
  const storage = memoryStorage();
  const first = open(storage);
  welcome(first);
  exchange(first, "SeeVia dành cho ai?", "Cho người khiếm thị.", ["Kính hoạt động ra sao?", "Có thay gậy trắng không?"]);
  const id = first.getSnapshot().activeId;

  const reloaded = open(storage); // trang mới, bộ nhớ RAM trống, chỉ còn localStorage
  assert.equal(reloaded.getSnapshot().activeId, id, "không tạo phiên mới");
  const active = reloaded.getActive();
  assert.deepEqual(
    active.messages.map((m) => [m.role, m.kind ?? null]),
    [["assistant", "welcome"], ["user", null], ["assistant", "answer"]],
  );
  assert.deepEqual(active.suggestions, ["Kính hoạt động ra sao?", "Có thay gậy trắng không?"]);
  assert.deepEqual(reloaded.buildApiContext().history, [
    { role: "user", content: "SeeVia dành cho ai?" },
    { role: "assistant", content: "Cho người khiếm thị." },
  ]);
  // Lời chào không bị tạo lại, nên không tốn thêm một lượt gọi Cohere.
  assert.equal(active.messages.filter((m) => m.kind === "welcome").length, 1);
});

test("câu hỏi đang chờ trả lời bị gián đoạn được nhận biết sau khi tải lại", () => {
  const storage = memoryStorage();
  const a = open(storage);
  a.append({ role: "user", content: "Kính có chống nước không?" });
  const b = open(storage);
  assert.equal(hasUnansweredQuestion(b.getActive()), true);
  b.append({ role: "assistant", content: "Chưa có thông tin.", kind: "answer" });
  assert.equal(hasUnansweredQuestion(b.getActive()), false);
});

// ---- 3–4. Cuộc trò chuyện mới, không mất lịch sử cũ -----------------------
test("chỉ 'Cuộc trò chuyện mới' mới tạo phiên khác, phiên cũ được giữ nguyên", () => {
  const storage = memoryStorage();
  const store = open(storage);
  welcome(store);
  exchange(store, "SeeVia là gì?", "Ý tưởng kính thông minh.", ["Ai dùng?"]);
  const oldId = store.getSnapshot().activeId;
  const oldMessages = structuredClone(store.getActive().messages);

  const fresh = store.startNewSession();
  assert.notEqual(fresh.id, oldId);
  assert.equal(store.getSnapshot().activeId, fresh.id);
  assert.deepEqual(fresh.messages, []);
  assert.deepEqual(fresh.suggestions, []);
  assert.deepEqual(store.buildApiContext(), { history: [], recentSuggestions: [] }, "ngữ cảnh cũ không rò sang phiên mới");

  // Phiên cũ còn nguyên, truy cập lại được, kể cả sau khi tải lại trang.
  const reloaded = open(storage);
  assert.equal(reloaded.getSnapshot().activeId, fresh.id);
  const old = reloaded.getSession(oldId);
  assert.deepEqual(old.messages, oldMessages);
  assert.deepEqual(old.suggestions, ["Ai dùng?"]);
  assert.deepEqual(reloaded.listSessions().map((s) => [s.id, s.title]), [[oldId, "SeeVia là gì?"]]);
});

test("bấm 'Cuộc trò chuyện mới' khi phiên hiện tại còn trống không sinh phiên rác", () => {
  const store = open(memoryStorage());
  welcome(store);
  const id = store.getSnapshot().activeId;
  store.startNewSession();
  store.startNewSession();
  assert.equal(store.getSnapshot().activeId, id);
  assert.equal(store.getSnapshot().sessions.length, 1);
  assert.equal(store.getActive().title, DEFAULT_TITLE);
});

test("khôi phục cuộc trò chuyện cũ, Cohere lại hiểu đúng ngữ cảnh của phiên đó", () => {
  const storage = memoryStorage();
  const store = open(storage);
  exchange(store, "Kính SeeVia giúp gì khi đọc chữ?", "Hỗ trợ đọc chữ là một định hướng dự kiến.", ["Có đọc được biển hiệu không?"]);
  const first = store.getSnapshot().activeId;
  store.startNewSession();
  exchange(store, "Dự án có bán chưa?", "Chưa có bản thương mại.", []);
  assert.equal(store.listSessions().length, 2);

  assert.equal(store.switchTo(first), true);
  assert.equal(store.getSnapshot().activeId, first);
  assert.deepEqual(store.getActive().suggestions, ["Có đọc được biển hiệu không?"]);
  assert.match(store.buildApiContext().history[0].content, /đọc chữ/);
  assert.equal(store.switchTo("khong-ton-tai"), false);
  assert.equal(store.getSnapshot().activeId, first);

  // Tiếp tục ở phiên cũ rồi tải lại: vẫn ở phiên cũ.
  exchange(store, "Tại sao?", "Vì người dùng cần đọc thông tin in.", []);
  assert.equal(open(storage).getSnapshot().activeId, first);
});

test("trả lời đến muộn sau khi bấm 'Cuộc trò chuyện mới' vẫn vào đúng phiên đã hỏi", () => {
  const store = open(memoryStorage());
  const asked = store.getSnapshot().activeId;
  store.append({ role: "user", content: "Câu hỏi dài cần chờ" }, asked);
  const fresh = store.startNewSession();
  assert.notEqual(fresh.id, asked);
  store.append({ role: "assistant", content: "Trả lời đến muộn", kind: "answer" }, asked);
  store.setSuggestions(["Gợi ý muộn"], asked);
  assert.deepEqual(store.getSession(fresh.id).messages, []);
  assert.deepEqual(store.getSession(fresh.id).suggestions, []);
  assert.equal(store.getSession(asked).messages.length, 2);
  // Phiên đã bị xóa thì tin đến muộn bị bỏ, không nổi lên phiên khác.
  store.remove(asked);
  store.append({ role: "assistant", content: "Mồ côi" }, asked);
  assert.ok(store.getSnapshot().sessions.every((s) => s.messages.every((m) => m.content !== "Mồ côi")));
});

test("xóa một phiên và xóa toàn bộ lịch sử chỉ xảy ra khi người dùng chủ động gọi", () => {
  const storage = memoryStorage();
  const store = open(storage);
  exchange(store, "A?", "a", []);
  store.startNewSession();
  exchange(store, "B?", "b", []);
  const [b, a] = store.listSessions();
  store.remove(a.id);
  assert.deepEqual(store.listSessions().map((s) => s.id), [b.id]);
  store.clearAll();
  assert.equal(storage.map.size === 1 && !storage.getItem(STORAGE_KEY).includes("B?"), true);
  assert.equal(store.listSessions().length, 0);
  assert.equal(store.getActive().messages.length, 0);
});

// ---- 5. Giới hạn, riêng tư, độ bền ----------------------------------------
test("giới hạn số phiên: bỏ phiên cũ nhất, không bao giờ bỏ phiên đang mở", () => {
  const now = clock();
  const store = open(memoryStorage(), now);
  const ids = [];
  for (let i = 0; i < LIMITS.maxSessions + 5; i++) {
    now.advance(1000);
    exchange(store, `Câu ${i}`, `Đáp ${i}`, []);
    ids.push(store.getSnapshot().activeId);
    store.startNewSession();
  }
  now.advance(1000);
  exchange(store, "Câu cuối", "Đáp cuối", []);
  const active = store.getSnapshot().activeId;
  const kept = store.getSnapshot().sessions.map((s) => s.id);
  assert.ok(kept.length <= LIMITS.maxSessions);
  assert.ok(kept.includes(active));
  assert.ok(!kept.includes(ids[0]), "phiên cũ nhất bị loại");
  assert.ok(kept.includes(ids.at(-1)), "phiên gần nhất còn");
});

test("giới hạn số tin trong một phiên và độ dài từng tin", () => {
  const store = open(memoryStorage());
  for (let i = 0; i < LIMITS.maxMessages + 10; i++)
    store.append({ role: i % 2 ? "assistant" : "user", content: `Tin ${i}` });
  const { messages } = store.getActive();
  assert.equal(messages.length, LIMITS.maxMessages);
  assert.equal(messages.at(-1).content, `Tin ${LIMITS.maxMessages + 9}`);
  store.append({ role: "assistant", content: "x".repeat(10_000) });
  assert.equal(store.getActive().messages.at(-1).content.length, LIMITS.maxContent);
  assert.equal(store.append({ role: "user", content: "   " }), null);
});

test("tổng dung lượng bị chặn, phiên đang mở không bị mất", () => {
  const now = clock();
  const storage = memoryStorage();
  const store = open(storage, now);
  const big = "Nội dung dài. ".repeat(160);
  for (let s = 0; s < 18; s++) {
    now.advance(1000);
    for (let i = 0; i < 6; i++) store.append({ role: i % 2 ? "assistant" : "user", content: big });
    store.startNewSession();
  }
  assert.ok(storage.getItem(STORAGE_KEY).length <= LIMITS.maxTotalChars);
  assert.equal(store.getSnapshot().sessions.some((s) => s.id === store.getSnapshot().activeId), true);
});

test("hết dung lượng localStorage: loại phiên cũ để ghi tiếp, rồi mới chuyển sang RAM", () => {
  const storage = memoryStorage(2500);
  const now = clock();
  const store = open(storage, now);
  for (let i = 0; i < 3; i++) {
    now.advance(1000);
    exchange(store, `Câu hỏi số ${i}`, "Trả lời ".repeat(60), []);
    store.startNewSession();
  }
  assert.equal(store.getSnapshot().persistent, true);
  assert.ok(storage.getItem(STORAGE_KEY).length <= 2500);

  const tiny = memoryStorage(10); // không ghi nổi dù một phiên
  const memOnly = open(tiny);
  memOnly.append({ role: "user", content: "Vẫn chat được" });
  assert.equal(memOnly.getSnapshot().persistent, false);
  assert.equal(memOnly.getActive().messages.length, 1);
  memOnly.append({ role: "assistant", content: "Ổn", kind: "answer" });
  assert.equal(memOnly.getActive().messages.length, 2, "không văng lỗi, không mất tin trong phiên");
});

test("dữ liệu hỏng hoặc kho bị chặn không làm vỡ chatbot", () => {
  const corrupt = memoryStorage();
  corrupt.map.set(STORAGE_KEY, "{không phải json");
  const a = open(corrupt);
  assert.equal(a.getActive().messages.length, 0);

  const wrongShape = memoryStorage();
  wrongShape.map.set(STORAGE_KEY, JSON.stringify({ v: 1, activeId: "x", sessions: [null, 7, { id: "s", updatedAt: 1_800_000_000_000, messages: [{ role: "hacker", content: "x" }, { role: "user", content: "Giữ" }] }] }));
  const b = open(wrongShape);
  assert.deepEqual(b.getActive().messages.map((m) => m.content), ["Giữ"]);

  const blocked = {
    getItem() { throw new Error("SecurityError"); },
    setItem() { throw new Error("SecurityError"); },
    removeItem() { throw new Error("SecurityError"); },
  };
  const c = open(blocked);
  c.append({ role: "user", content: "Trong RAM" });
  assert.equal(c.getActive().messages.length, 1);
  assert.equal(c.getSnapshot().persistent, false);

  const none = open(null);
  none.append({ role: "user", content: "Không có storage" });
  assert.equal(none.getActive().messages.length, 1);
});

test("phiên quá 30 ngày tự hết hạn; phiên mới hơn vẫn còn", () => {
  const storage = memoryStorage();
  const now = clock();
  const store = open(storage, now);
  exchange(store, "Cũ", "cũ", []);
  const oldId = store.getSnapshot().activeId;
  now.advance(20 * 86400000);
  store.startNewSession();
  exchange(store, "Mới hơn", "mới", []);
  now.advance(15 * 86400000); // phiên đầu 35 ngày, phiên hai 15 ngày
  const later = open(storage, now);
  assert.equal(later.getSession(oldId), undefined);
  assert.deepEqual(later.listSessions().map((s) => s.title), ["Mới hơn"]);
});

test("quyền riêng tư: không lưu trường giống bí mật, chỉ chứa nội dung chat", () => {
  const storage = memoryStorage();
  const store = open(storage);
  store.append({
    role: "assistant",
    content: "Xin chào",
    kind: "answer",
    apiKey: "sk-should-not-persist",
    authorization: "Bearer abc",
    sources: [{ id: "status", title: "Tình trạng" }],
    onClick: () => {},
  });
  const raw = storage.getItem(STORAGE_KEY);
  assert.ok(!/sk-should|Bearer|apiKey|authorization/i.test(raw));
  assert.ok(raw.includes("Tình trạng"), "dữ liệu giao diện nhỏ vẫn được giữ");
  assert.ok(!/COHERE|MAILGUN/i.test(raw));
});

test("nhiều tab: tab kia ghi thì tab này được đồng bộ, không ghi đè lịch sử của nhau", () => {
  const storage = memoryStorage();
  const bus = new EventTarget();
  const tabA = createChatStore({ storage, now: clock(), uid, target: bus });
  const tabB = open(storage);
  tabB.append({ role: "user", content: "Từ tab B" });
  tabA.append({ role: "user", content: "Từ tab A" });
  const merged = open(storage).getActive().messages.map((m) => m.content);
  assert.deepEqual(merged, ["Từ tab B", "Từ tab A"], "mutate đọc bản mới nhất trước khi ghi");
  let notified = 0;
  tabA.subscribe(() => notified++);
  tabB.startNewSession();
  bus.dispatchEvent(Object.assign(new Event("storage"), { key: STORAGE_KEY }));
  assert.equal(notified, 1);
  assert.equal(tabA.getSnapshot().activeId, tabB.getSnapshot().activeId);
  tabA.dispose();
});

// ---- 6. Ngữ cảnh gửi Cohere -----------------------------------------------
test("ngữ cảnh gửi Cohere: bỏ lời chào/lỗi, tối đa 6 lượt, ≤3200 ký tự, trả lời cũ được rút gọn", () => {
  const store = open(memoryStorage());
  welcome(store);
  for (let i = 0; i < 5; i++) {
    store.append({ role: "user", content: `Câu hỏi ${i}` });
    store.append({ role: "assistant", content: `Đáp ${i} ` + "dài ".repeat(400), kind: "answer" });
  }
  store.append({ role: "user", content: "Câu lỗi" });
  store.append({ role: "assistant", content: "Có lỗi xảy ra", kind: "error" });
  const { history } = store.buildApiContext();
  assert.ok(history.length <= 6);
  assert.ok(history.every((t) => !/xin chào|Có lỗi/i.test(t.content)));
  assert.ok(history.reduce((n, t) => n + t.content.length, 0) <= 3200);
  const assistants = history.filter((t) => t.role === "assistant");
  assert.ok(assistants.slice(0, -1).every((t) => t.content.length <= 400), "đáp cũ ≤400");
  assert.ok(assistants.at(-1).content.length > 400, "đáp gần nhất giữ gần đầy đủ");
  assert.deepEqual(Object.keys(history[0]).sort(), ["content", "role"], "không rò id/at/nguồn");
  assert.equal(history[0].role, "user", "không bắt đầu bằng nửa cặp đáp mồ côi");
});

test("recentSuggestions được khôi phục và giới hạn để tránh lặp gợi ý", () => {
  const store = open(memoryStorage());
  for (let i = 0; i < 4; i++) store.setSuggestions([`Gợi ý ${i}a`, `Gợi ý ${i}b`]);
  const ctx = store.buildApiContext();
  assert.equal(ctx.recentSuggestions.length, 6);
  assert.deepEqual(store.getActive().suggestions, ["Gợi ý 3a", "Gợi ý 3b"]);
  assert.deepEqual(ctx.recentSuggestions.slice(-2), ["Gợi ý 3a", "Gợi ý 3b"]);
});

test("ngữ cảnh luôn qua được validateQuestion của backend", () => {
  const store = open(memoryStorage());
  for (let i = 0; i < 12; i++) {
    store.append({ role: "user", content: "Câu hỏi " + "x".repeat(900) });
    store.append({ role: "assistant", content: "Trả lời " + "y".repeat(2300), kind: "answer" });
    store.setSuggestions(["Gợi ý " + "z".repeat(150), "Gợi ý ngắn"]);
  }
  const ctx = store.buildApiContext();
  const body = { message: "Tại sao?", ...ctx };
  assert.ok(validateQuestion(body), "history/recentSuggestions không vượt hạn mức server");
  assert.equal(buildApiContext(undefined).history.length, 0);
});

// ---- Tích hợp với handler thật (Cohere giả lập) ----------------------------
test("sau khi tải lại, câu 'Tại sao?' tới Cohere kèm đúng nội dung đã trao đổi", async (t) => {
  const storage = memoryStorage();
  const before = open(storage);
  exchange(before, "Kính SeeVia hỗ trợ ai?", "SeeVia hướng tới người khiếm thị.", ["Có thay gậy trắng không?"]);

  const after = open(storage); // tải lại
  const sid = after.getSnapshot().activeId;
  const ctx = after.buildApiContext(sid);

  const env = { COHERE_API_KEY: "test-key", COHERE_MODEL: "command-a-03-2025" };
  const seen = [];
  const handler = createAssistantHandler({
    env,
    fetchImpl: async (url, request) => {
      if (String(url).endsWith(`/v1/models/${env.COHERE_MODEL}`))
        return Response.json({ name: env.COHERE_MODEL, endpoints: ["chat"], is_deprecated: false });
      seen.push(JSON.parse(request.body));
      return Response.json({
        finish_reason: "COMPLETE",
        message: { content: [{ type: "text", text: JSON.stringify({
          answer: "Vì mục tiêu của SeeVia là hỗ trợ người khiếm thị trong sinh hoạt.",
          intent: "IN_SCOPE", basis: "inference", clarify: false,
          sourceIds: [], pageIds: [], suggested_questions: [],
        }) }] },
      });
    },
  });
  const server = createServer(handler);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Tại sao?", ...ctx }),
  });
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  assert.equal(data.aiGenerated, true);
  const system = seen[0].messages[0].content;
  const payload = JSON.parse(system.split("\n").at(-1));
  assert.deepEqual(payload.CONVERSATION_HISTORY, [
    { role: "user", content: "Kính SeeVia hỗ trợ ai?" },
    { role: "assistant", content: "SeeVia hướng tới người khiếm thị." },
  ]);
  assert.deepEqual(payload.RECENT_SUGGESTIONS, ["Có thay gậy trắng không?"]);
  assert.equal(seen[0].messages[1].content, "Tại sao?");
});

test("trang gợi ý (pageIds) của câu trả lời được giữ qua lần tải lại", () => {
  const storage = memoryStorage();
  const a = open(storage);
  a.append({ role: "assistant", content: "Xem trang Liên hệ.", kind: "answer", pageIds: ["contact"] });
  const b = open(storage);
  assert.deepEqual(b.getActive().messages[0].pageIds, ["contact"]);
});
