// Explicit authenticated check; never run as part of the ordinary fixture suite.
import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
import {
  createAssistantHandler,
  assistantConfig,
} from "../contact-backend/assistant.mjs";

if (!assistantConfig().ready) {
  console.error("Server AI configuration is incomplete; no live request sent.");
  process.exit(2);
}
const label = process.argv[2] || "after";
const usage = [];
const rows = [];
const server = createServer(
  createAssistantHandler({
    fetchImpl: async (url, options) => {
      const result = await fetch(url, options);
      if (String(url).endsWith("/v2/chat")) {
        const copy = await result
          .clone()
          .json()
          .catch(() => ({}));
        usage.push({
          ...(copy.usage || { status: result.status }),
          finish: copy.finish_reason,
          output: copy.message?.content?.find((part) => part.type === "text")
            ?.text,
        });
      }
      return result;
    },
  }),
);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const history = [],
  recentSuggestions = [];
try {
  for (const message of [
    "SeeVia có những chức năng gì?",
    "Camera của kính hoạt động khi nào?",
    "Còn cái đó thì sao?",
    "Giá kính bao nhiêu?",
    "Ngày mai giá vàng tăng hay giảm?",
    "Cảm ơn, tôi không cần hỏi thêm. Tạm biệt!",
  ]) {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/assistant`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history
            .slice(-6)
            .map((turn) => ({ ...turn, content: turn.content.slice(0, 530) })),
          ...(label === "before"
            ? {}
            : { recentSuggestions: recentSuggestions.slice(-6) }),
        }),
      },
    );
    const data = await response.json();
    rows.push({
      message,
      status: response.status,
      answer: data.answer,
      suggested_questions: data.suggested_questions ?? data.suggestions,
      code: data.code,
    });
    if (!response.ok) {
      process.exitCode = 1;
      break;
    }
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: data.answer },
    );
    recentSuggestions.push(
      ...(data.suggested_questions ?? data.suggestions ?? []),
    );
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
writeFileSync(
  `test-results/assistant-conversation-${label}.json`,
  JSON.stringify({ rows, usage }, null, 2),
);
console.log(
  JSON.stringify({
    label,
    turns: rows.length,
    modelCalls: usage.length,
    statuses: rows.map((row) => row.status),
    promptTokens: usage.reduce(
      (sum, item) => sum + (item.prompt_tokens || 0),
      0,
    ),
    completionTokens: usage.reduce(
      (sum, item) => sum + (item.completion_tokens || 0),
      0,
    ),
    report: `test-results/assistant-conversation-${label}.json`,
  }),
);
