// Opt-in live evaluation, not a production dialogue tree or expected question list.
import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
import {
  assistantConfig,
  createAssistantHandler,
} from "../contact-backend/assistant.mjs";
import { boundedContext } from "../contact-backend/assistant-context.mjs";
if (!assistantConfig().ready) {
  console.error("Missing server configuration; no API call.");
  process.exit(2);
}
const results = [];
let calls = 0;
const providerFailures = [];
const completions = [];
const requestTrace = [];
const server = createServer(
  createAssistantHandler({
    fetchImpl: async (url, options) => {
      if (String(url).endsWith("/v2/chat")) {
        calls++;
        const messages = JSON.parse(options.body).messages;
        requestTrace.push({
          roles: messages.map((item) => item.role),
          current: messages.at(-1)?.content,
        });
      }
      const response = await fetch(url, options);
      if (String(url).endsWith("/v2/chat") && response.ok) {
        const data = await response.clone().json();
        completions.push({
          finish: data.finish_reason,
          output: data.message?.content?.find((part) => part.type === "text")
            ?.text,
          usage: data.usage,
        });
      }
      if (!response.ok) {
        const data = await response
          .clone()
          .json()
          .catch(() => ({}));
        providerFailures.push({
          status: response.status,
          code: data.error?.code,
          message: data.error?.message?.replaceAll(
            process.env.COHERE_API_KEY,
            "[REDACTED]",
          ),
        });
      }
      return response;
    },
  }),
);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const sessions = [
  {
    goal: "greeting then explicit request for suggestions",
    inputs: ["hello", "bạn không gợi ý câu hỏi à"],
  },
  {
    goal: "request suggestions after a previous reply without suggestions",
    initialHistory: [
      { role: "user", content: "hello" },
      { role: "assistant", content: "Xin chào! Nếu bạn có câu hỏi cụ thể hơn, hãy cho tôi biết." },
    ],
    inputs: ["bạn không gợi ý câu hỏi à"],
  },
  {
    goal: "independent reading",
    inputs: [
      "Tôi nhìn kém và cần đọc giấy tờ ở chỗ làm. SeeVia dự kiến giúp được gì?",
      "Còn khi giấy bị nghiêng?",
      null,
    ],
  },
  {
    goal: "change of goal and clarification",
    inputs: [
      "Tôi đại diện một nhóm sinh viên muốn đồng hành, cần bắt đầu thế nào?",
      "Thôi, không bàn hợp tác nữa. Tôi muốn hiểu quyền riêng tư của camera.",
      "Ý tôi là dữ liệu chat trên web này, không phải camera của kính.",
    ],
  },
];
try {
  const selected =
    process.argv[2] === "change"
      ? sessions.slice(3)
      : process.argv[2] === "reading"
        ? sessions.slice(2, 3)
        : process.argv[2] === "greeting"
          ? sessions.slice(0, 2)
        : sessions;
  for (const session of selected) {
    const history = [...(session.initialHistory ?? [])],
      recentSuggestions = [],
      turns = [];
    for (const input of session.inputs) {
      const suggested = turns.at(-1)?.suggested_questions?.[0];
      const message =
        input ?? suggested ?? "Tôi muốn hỏi cách điều khiển việc đọc.";
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}/api/assistant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: boundedContext(message, history),
            recentSuggestions: recentSuggestions.slice(-6),
          }),
        },
      );
      const data = await response.json();
      turns.push({
        message,
        selectedModelSuggestion: input === null && !!suggested,
        status: response.status,
        answer: data.answer,
        suggested_questions: data.suggested_questions,
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
      recentSuggestions.push(...data.suggested_questions);
    }
    results.push({ goal: session.goal, turns });
    if (session.goal === "greeting then explicit request for suggestions") {
      const [greeting, followUp] = turns;
      if (
        !followUp?.answer ||
        followUp.answer === greeting?.answer ||
        !/gợi ý|câu hỏi/iu.test(followUp.answer)
      ) {
        process.exitCode = 1;
      }
    }
    if (
      session.goal === "request suggestions after a previous reply without suggestions" &&
      (!/gợi ý|câu hỏi/iu.test(turns[0]?.answer || "") ||
        !turns[0]?.suggested_questions?.length)
    ) {
      process.exitCode = 1;
    }
    if (process.exitCode) break;
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
const report = `test-results/assistant-dynamic-live-${process.argv[2] || "all"}-${Date.now()}.json`;
writeFileSync(
  report,
  JSON.stringify({ results, calls, providerFailures, completions, requestTrace }, null, 2),
);
console.log(
  JSON.stringify({
    report,
    calls,
    sessions: results.map((session) => ({
      goal: session.goal,
      statuses: session.turns.map((turn) => turn.status),
    })),
  }),
);
