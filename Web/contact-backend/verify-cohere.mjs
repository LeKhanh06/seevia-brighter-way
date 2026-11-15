// Live verification against the real Cohere API (no mock, no fallback provider).
// Usage: node --env-file=contact-backend/.env contact-backend/verify-cohere.mjs
// It sends questions that are NOT in the knowledge base or any sample list, then
// reports for every turn where the request went: received -> Cohere request ->
// Cohere HTTP status -> model result -> validation -> response. A turn passes only
// when Cohere was called and the reply is marked aiGenerated.
import { createServer } from "node:http";
import { assistantConfig, createAssistantHandler } from "./assistant.mjs";

if (!assistantConfig().ready) {
  console.error(
    "Chưa kiểm thử Cohere thật: cần COHERE_API_KEY và model Cohere hợp lệ trong contact-backend/.env; Vercel cần thêm Redis limiter.",
  );
  process.exitCode = 2;
} else {
  const events = [];
  const server = createServer(
    createAssistantHandler({ log: (event) => events.push(event) }),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const scenarios = [
    {
      name: "Hội thoại nhiều lượt, câu tiếp nối",
      turns: [
        "Kính này có giúp người lớn tuổi bị mắt kém dùng được không?",
        "Tại sao?",
        "Giải thích cách khác",
        "Tóm tắt giúp SeeVia trong hai câu",
      ],
    },
    {
      name: "Câu hỏi mới, phản biện, xã giao, ngoài phạm vi",
      turns: [
        "Dự án này lấy cảm hứng từ đâu vậy?",
        "Tôi nghĩ SeeVia đã bán rồi mà, đúng không?",
        "Hôm nay mình hơi mệt",
        "Viết giúp mình bài thơ về mùa thu",
      ],
    },
  ];
  let failures = 0;
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const scenario of scenarios) {
      console.log(`\n=== ${scenario.name}`);
      const history = [];
      const shown = [];
      for (const message of scenario.turns) {
        events.length = 0;
        const response = await fetch(`${base}/api/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history, recentSuggestions: shown.slice(-6) }),
        });
        const data = await response.json();
        const stages = events.map((event) => event.stage);
        const request = events.find((event) => event.stage === "cohere_request");
        const result = events.find((event) => event.stage === "cohere_result");
        const calledCohere = stages.includes("cohere_http");
        const ok = response.ok && data.aiGenerated === true && calledCohere;
        if (!ok) failures++;
        console.log(`\nBạn: ${message}`);
        console.log(
          `  ${ok ? "OK " : "LỖI"} HTTP ${response.status} | Cohere được gọi: ${calledCohere ? "có" : "KHÔNG"} (${events.filter((e) => e.stage === "cohere_request").length} lần) | intent=${data.intent} basis=${data.basis ?? "-"}`,
        );
        console.log(`  luồng: ${stages.join(" -> ")}`);
        if (request)
          console.log(
            `  gửi lên Cohere: facts=[${request.factIds.join(", ")}] lịch sử=${request.historyTurns} lượt, prompt=${request.systemChars} ký tự`,
          );
        if (result) console.log(`  Cohere: finish=${result.finish} tokens=${JSON.stringify(result.tokens)}`);
        const blocked = events.find((event) => event.stage === "validation_failed" || (event.stage === "response" && event.status >= 400));
        if (!ok && blocked) console.log(`  bị chặn ở bước: ${blocked.stage}${blocked.code ? ` (${blocked.code})` : ""}`);
        if (data.answer) console.log(`  SeeVia: ${data.answer}`);
        if (data.suggested_questions?.length) console.log(`  gợi ý: ${data.suggested_questions.join(" | ")}`);
        if (response.ok) {
          shown.push(...(data.suggested_questions || []));
          history.push(
            { role: "user", content: message },
            { role: "assistant", content: data.answer },
          );
        }
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  console.log(failures ? `\n${failures} lượt không đạt.` : "\nTất cả các lượt đều do Cohere tạo ra.");
  process.exitCode = failures ? 1 : 0;
}
