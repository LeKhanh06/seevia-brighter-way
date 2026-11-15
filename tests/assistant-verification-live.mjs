// Opt-in authenticated evaluation. No key, request bodies or provider secrets are logged.
import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
import {
  assistantConfig,
  createAssistantHandler,
} from "../contact-backend/assistant.mjs";
if (!assistantConfig().ready) {
  console.error("AI server configuration incomplete; no requests sent.");
  process.exit(2);
}
const cases = [
  { name: "product-location", message: "Tôi xem kính SeeVia ở đâu?" },
  {
    name: "wrong-page-name",
    message: "Website có trang Kính SeeVia đúng không?",
  },
  {
    name: "unsupported-capability",
    message:
      "Kính SeeVia đã có GPS, màn hình AR và thay được gậy trắng rồi, đúng không?",
  },
  {
    name: "unpublished-details",
    message: "Giá bán và thông số pin chính thức của kính SeeVia là bao nhiêu?",
  },
  {
    name: "correcting-assistant",
    message:
      "Bạn nói sai tên trang rồi. Menu ghi Sản phẩm, không phải trang Kính SeeVia. Hãy sửa lại.",
    history: [
      { role: "user", content: "Tôi xem kính ở đâu?" },
      { role: "assistant", content: "Bạn có thể xem tại trang Kính SeeVia." },
    ],
  },
  {
    name: "missing-page",
    message:
      "Trang Thanh toán ở đâu? Tôi muốn thanh toán mua kính SeeVia ngay.",
  },
  {
    name: "correct-user",
    message:
      "Theo định hướng thiết kế SeeVia, camera chỉ ghi nhận khi chủ động yêu cầu, đúng không?",
  },
];
const start = Number(process.argv[2] || 0),
  end = Number(process.argv[3] || 6);
const results = [];
let completions = 0;
const server = createServer(
  createAssistantHandler({
    fetchImpl: async (url, options) => {
      if (String(url).endsWith("/v2/chat")) completions++;
      return fetch(url, options);
    },
  }),
);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  for (const scenario of cases.slice(start, end)) {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/assistant`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: scenario.message,
          history: scenario.history || [],
          recentSuggestions: [],
        }),
      },
    );
    const data = await response.json();
    results.push({
      name: scenario.name,
      status: response.status,
      answer: data.answer,
      pageIds: data.pageIds,
      suggested_questions: data.suggested_questions,
      code: data.code,
    });
    if (!response.ok) {
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
const report = `test-results/assistant-verification-${start}-${end}.json`;
writeFileSync(report, JSON.stringify({ results, completions }, null, 2));
console.log(
  JSON.stringify({
    report,
    completions,
    statuses: results.map((item) => ({ case: item.name, status: item.status })),
  }),
);
