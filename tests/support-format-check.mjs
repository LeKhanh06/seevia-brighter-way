import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const body =
    "Đoạn mở đầu.\\n\\n- **Đọc chữ** theo yêu cầu\\n- Hiểu hình ảnh\\n\\n1. Đặt câu hỏi\\n2. Nghe phản hồi\\n\\nXem [Sản phẩm](/san-pham).";
  let answer = body;
  await page.route("**/api/assistant**", (route) =>
    route.fulfill({
      json:
        route.request().method() === "GET"
          ? { available: true }
          : {
              ok: true,
              aiGenerated: true,
              answer,
              sources: [],
              pageIds: [],
              suggested_questions: [],
            },
    }),
  );
  await page.goto(process.env.BASE_URL || "http://127.0.0.1:5173/");
  await page
    .getByRole("button", { name: "Mở hỗ trợ SeeVia", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".sv-support-availability"),
  );
  assert.equal(await page.locator(".sv-support-suggestions").count(), 0);
  await page
    .locator("#seevia-support-question")
    .fill("Tôi muốn xem trang Sản phẩm");
  await page.locator("#seevia-support-question").press("Enter");
  const content = page.locator(".sv-support-message-content");
  await content.waitFor();
  assert.equal(await content.locator("ul li").count(), 2);
  assert.equal(await content.locator("ol li").count(), 2);
  assert.equal(await content.locator("strong").innerText(), "Đọc chữ");
  assert.equal(await content.locator("a").getAttribute("href"), "/san-pham");
  assert(!(await content.innerText()).includes("\\n"));
  assert.equal(
    await page.locator(".sv-support-suggestions").count(),
    0,
    "No fallback after empty model choices",
  );
  assert.equal(new URL(page.url()).pathname, "/");
  await content.locator("a").click();
  await page.waitForURL("**/san-pham");
  await page
    .getByRole("button", { name: "Mở hỗ trợ SeeVia", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".sv-support-availability"),
  );
  answer = '{"answer":"Do not display JSON"}';
  await page.locator("#seevia-support-question").fill("Tiếp theo");
  await page.locator("#seevia-support-question").press("Enter");
  await page.locator(".sv-support-error").waitFor();
  assert.equal(
    await page.locator(".sv-support-turn-assistant").count(),
    0,
    "Raw JSON must not render",
  );
  console.log(
    "PASS: paragraphs, escaped newlines, unordered/ordered lists, bold, verified clickable route, empty suggestions and raw JSON rejection on mobile.",
  );
} finally {
  await browser.close();
}
