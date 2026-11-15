import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const requests = [];
  let release;
  const turns = [
    {
      answer: "SeeVia định hướng hỗ trợ đọc và hiểu thông tin.",
      suggested_questions: ["Camera của kính hoạt động khi nào?"],
    },
    {
      answer: "Theo thiết kế dự kiến, camera xử lý ảnh theo yêu cầu.",
      suggested_questions: ["Tôi muốn biết ảnh được xử lý ra sao"],
    },
    {
      answer: "Hiện chưa có giá bán được xác nhận.",
      suggested_questions: ["Tôi muốn biết về trạng thái dự án"],
    },
    {
      answer: "Bạn muốn hỏi về phần nào?",
      clarify: true,
      suggested_questions: ["Về camera", "Về OCR"],
    },
    {
      answer: "Chưa có dữ liệu để trả lời câu hỏi đó.",
      suggested_questions: { malformed: true },
    },
    { answer: "Cảm ơn bạn. Chào bạn!", suggested_questions: [] },
  ];
  await page.route("**/api/assistant**", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true, provider: "cohere" } });
    requests.push(route.request().postDataJSON());
    const turn = turns[requests.length - 1];
    if (requests.length === 2)
      await new Promise((resolve) => {
        release = resolve;
      });
    return route.fulfill({
      json: {
        ok: true,
        aiGenerated: true,
        sources: [],
        pageIds: [],
        clarify: false,
        ...turn,
      },
    });
  });
  await page.goto(process.env.BASE_URL || "http://127.0.0.1:5173/");
  await page
    .getByRole("button", { name: "Mở hỗ trợ SeeVia", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".sv-support-availability"),
  );
  const field = page.locator("#seevia-support-question");
  const send = async (text) => {
    const before = requests.length;
    await field.fill(text);
    await field.press("Enter");
    await page.waitForFunction(
      (n) =>
        document.querySelectorAll(".sv-support-turn-assistant").length === n,
      before + 1,
    );
    assert.equal(requests.length, before + 1);
  };
  await send("SeeVia có những chức năng gì?");
  const chip = page.getByRole("button", {
    name: "Camera của kính hoạt động khi nào?",
    exact: true,
  });
  await chip.evaluate((el) => {
    el.click();
    el.click();
    el.click();
  });
  await page.waitForFunction(() =>
    document.querySelector(".sv-support-working"),
  );
  assert.equal(
    requests.length,
    2,
    "Rapid clicks must send exactly one request",
  );
  assert(await chip.isDisabled());
  assert.equal(requests[1].message, "Camera của kính hoạt động khi nào?");
  assert.deepEqual(requests[1].recentSuggestions, [
    "Camera của kính hoạt động khi nào?",
  ]);
  assert.equal(requests[1].history.length, 2);
  assert(
    !requests[1].history.some(
      (turn) => turn.role === "user" && turn.content === requests[1].message,
    ),
  );
  release();
  await page.locator(".sv-support-turn-assistant").nth(1).waitFor();
  assert.equal(await chip.count(), 0, "Previous choices must be replaced");
  await send("Giá kính bao nhiêu?");
  await send("Còn cái đó thì sao?");
  assert(
    await page.getByRole("button", { name: "Về OCR", exact: true }).isVisible(),
  );
  await send("Ngày mai giá vàng thế nào?");
  assert.equal(
    await page.locator(".sv-support-suggestions").count(),
    0,
    "Malformed suggestions must not hide a valid answer or trigger starter fallbacks",
  );
  await send("Cảm ơn, tạm biệt");
  assert.equal(await page.locator(".sv-support-suggestions").count(), 0);
  assert.equal(requests.length, 6);
  assert(
    requests.every(
      (request) =>
        request.history.length <= 6 && request.recentSuggestions.length <= 6,
    ),
  );
  await page.keyboard.press("Tab");
  assert.equal(requests.length, 6, "Re-render/focus must not call the API");
  // A separate browser session must start with empty history.
  const other = await browser.newPage();
  await other.route("**/api/assistant**", (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true } });
    const body = route.request().postDataJSON();
    assert.deepEqual(body.history, []);
    assert.deepEqual(body.recentSuggestions, []);
    return route.fulfill({
      json: {
        ok: true,
        aiGenerated: true,
        answer: "Chào bạn.",
        sources: [],
        pageIds: [],
        suggested_questions: [],
      },
    });
  });
  await other.goto(process.env.BASE_URL || "http://127.0.0.1:5173/");
  await other
    .getByRole("button", { name: "Mở hỗ trợ SeeVia", exact: true })
    .click();
  await other.waitForFunction(
    () => !document.querySelector(".sv-support-availability"),
  );
  await other.locator("#seevia-support-question").fill("Xin chào");
  await other.locator("#seevia-support-question").press("Enter");
  await other.locator(".sv-support-turn-assistant").waitFor();
  console.log(
    "PASS: six-turn UI fixture, direct suggestion send, duplicate-click guard, evolving choices, malformed/empty choices, context bounds, session isolation. No live inference claimed.",
  );
} finally {
  await browser.close();
}
