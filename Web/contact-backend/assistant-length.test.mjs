import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { SYSTEM } from "../contact-backend/assistant-prompt.mjs";
import { createAssistantHandler } from "../contact-backend/assistant.mjs";

test("prompt giới hạn cứng độ dài và dặn viết số đếm bằng chữ", () => {
  assert.match(SYSTEM, /NEVER exceed 2000 characters/);
  assert.match(SYSTEM, /Write small counts in words/);
});

test("câu trả lời quá dài bị loại rồi được yêu cầu viết lại ngắn hơn", async (t) => {
  const env = { COHERE_API_KEY: "k", COHERE_MODEL: "command-a-03-2025" };
  const seen = [];
  const good = "Nhóm Go hỗ trợ thông tin di chuyển và chỉ đường bằng âm thanh. Đây là tính năng thử nghiệm.";
  const body = (answer) => ({
    finish_reason: "COMPLETE",
    message: { content: [{ type: "text", text: JSON.stringify({
      answer, intent: "IN_SCOPE", basis: "inference", clarify: false,
      sourceIds: [], pageIds: [], suggested_questions: [] }) }] },
  });
  const handler = createAssistantHandler({
    env,
    fetchImpl: async (url, request) => {
      if (String(url).includes("/v1/models/"))
        return Response.json({ name: env.COHERE_MODEL, endpoints: ["chat"], is_deprecated: false });
      seen.push(JSON.parse(request.body));
      return Response.json(body(seen.length === 1 ? "Rất dài. ".repeat(400) : good));
    },
  });
  const server = createServer(handler);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Chi tiết hơn", history: [
      { role: "user", content: "SeeVia có hỗ trợ di chuyển như thế nào?" },
      { role: "assistant", content: "Nhóm Go hỗ trợ thông tin di chuyển." }] }),
  });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(seen.length, 2);
  assert.match(seen[1].messages[0].content, /previous JSON was rejected \(schema_or_grounding\)/);
  assert.match(seen[1].messages[0].content, /under 1800 characters/);
  assert.equal(seen[0].max_tokens, 1400);
});
