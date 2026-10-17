import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
const base = process.env.BASE_URL || "http://127.0.0.1:5173";
mkdirSync("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Deterministic UI fixture: never infer local credential state or call paid services.
  await page.route("**/api/assistant/status", (route) =>
    route.fulfill({ json: { available: false, provider: "cohere" } }),
  );
  await page.goto(base);
  assert.equal(
    await page.locator(".sv-support-panel").count(),
    0,
    "Dialog must not affect other dialogs while closed",
  );
  let posts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/assistant") && request.method() === "POST")
      posts++;
  });
  const open = async () =>
    page.getByRole("button", { name: "Mở hỗ trợ SeeVia", exact: true }).click();
  await open();
  await page.waitForFunction(
    () => document.querySelector(".sv-support-panel")?.open,
  );
  assert(
    await page
      .locator("#seevia-support-question")
      .evaluate((el) => el === document.activeElement),
  );
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    assert(
      await page.evaluate(() =>
        document
          .querySelector(".sv-support-panel")
          .contains(document.activeElement),
      ),
      "Focus escaped modal",
    );
  }
  await page.keyboard.press("Escape");
  assert(
    await page
      .locator(".sv-support-launcher")
      .evaluate((el) => el === document.activeElement),
  );
  await open();
  await page.locator(".sv-support-footer a").click();
  await page.waitForURL("**/lien-he");
  assert.equal(posts, 0, "Human contact must not require AI");
  assert(await page.locator(".ct-form").isVisible());
  await open();
  // Explicit unavailable fixture; this is not a live provider test.
  await page.waitForFunction(() =>
    document
      .querySelector(".sv-support-availability")
      ?.textContent.includes("Chưa kết nối"),
  );
  assert.equal(await page.locator(".sv-support-turn-assistant").count(), 0);
  assert.equal(
    await page.locator(".sv-support-transcript").evaluate((el) => el.scrollTop),
    0,
    "Empty chat must open at the introduction",
  );
  assert(await page.getByRole("button", { name: "Gửi câu hỏi" }).isDisabled());
  await page
    .locator("#seevia-support-question")
    .fill("SeeVia hoạt động ra sao?");
  await page.getByRole("button", { name: "Gửi câu hỏi" }).click();
  await page.locator(".sv-support-error").waitFor();
  assert.equal(
    await page.locator("#seevia-support-question").inputValue(),
    "SeeVia hoạt động ra sao?",
  );
  assert.equal(
    posts,
    0,
    "Unavailable AI must explain the issue without a fake request or lost draft",
  );
  await page.keyboard.press("Escape");

  // UI fixtures below simulate success/failures; they are not live Cohere verification.
  let outcome = "success";
  await page.route("**/api/assistant**", async (route) => {
    if (new URL(route.request().url()).pathname.endsWith("/status"))
      return route.fulfill({ json: { available: true, provider: "cohere" } });
    if (outcome === "offline") return route.abort();
    if (outcome === "quota")
      return route.fulfill({
        status: 429,
        json: { ok: false, code: "quota_exceeded", retryAfter: 1 },
      });
    if (outcome === "bad-route")
      return route.fulfill({
        json: {
          ok: true,
          aiGenerated: true,
          answer: "Thử nghiệm.",
          sources: [],
          pageIds: ["https://evil.example"],
          suggested_questions: [],
        },
      });
    return route.fulfill({
      json: {
        ok: true,
        aiGenerated: true,
        answer:
          "SeeVia là dự án hỗ trợ tiếp cận thông tin. <img src=x onerror=alert(1)>",
        sources: [
          {
            id: "mission",
            title: "Sứ mệnh",
            label: "Website SeeVia · Về chúng tôi",
            kind: "website",
            pageId: "about",
          },
        ],
        pageIds: [],
        suggested_questions: ["SeeVia hướng đến ai?"],
      },
    });
  });
  await page.goto(base);
  await open();
  await page.waitForFunction(
    () => document.querySelector(".sv-support-availability") === null,
  );
  assert.equal(
    await page.locator(".sv-support-suggestions").count(),
    0,
    "No canned starter questions",
  );
  await page.locator("#seevia-support-question").fill("SeeVia la gi?");
  await page.locator("#seevia-support-question").press("Enter");
  await page.locator(".sv-support-turn-assistant").waitFor();
  assert.equal(
    await page.locator(".sv-support-turn-assistant img").count(),
    0,
    "AI output must be text, not injected HTML",
  );
  assert.equal(new URL(page.url()).pathname, "/", "Never auto-navigate");
  assert.equal(
    await page.locator(".sv-support-page-links, .sv-support-sources").count(),
    0,
    "Direct answers must not display navigation or references",
  );
  const chips = page.locator(".sv-support-suggestions button");
  assert((await chips.count()) > 0);
  assert.equal(
    await page
      .locator(".sv-support-suggestions")
      .evaluate((el) => getComputedStyle(el).flexWrap),
    "nowrap",
  );
  await page.screenshot({ path: "test-results/support-desktop.png" });
  await page.keyboard.press("Escape");
  await page.goto(base + "/ve-chung-toi");

  for (const failure of ["quota", "offline", "bad-route"]) {
    outcome = failure;
    await open();
    await page.waitForFunction(
      () => !document.querySelector(".sv-support-availability"),
    );
    await page
      .locator("#seevia-support-question")
      .fill("Giá kính đã công bố chưa?");
    await page.getByRole("button", { name: "Gửi câu hỏi" }).click();
    await page.locator(".sv-support-error").waitFor();
    assert.equal(await page.locator(".sv-support-turn-assistant").count(), 0);
    assert.equal(
      await page.locator('.sv-support-panel a[href^="https:"]').count(),
      0,
    );
    if (failure === "quota")
      assert(
        (await page.locator(".sv-support-error").innerText()).includes(
          "hạn mức sử dụng",
        ),
      );
    await page.keyboard.press("Escape");
    await page.goto(base + "/ve-chung-toi");
  }
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(base);
  await mobile.getByRole("button", { name: "Mở hỗ trợ SeeVia" }).tap();
  for (const [width, height] of [
    [320, 640],
    [390, 844],
    [768, 1024],
    [844, 390],
  ]) {
    await mobile.setViewportSize({ width, height });
    await mobile.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const box = await mobile.locator(".sv-support-panel").boundingBox();
    assert(
      box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= width + 1 &&
        box.y + box.height <= height + 1,
      `Panel clipped at ${width}x${height}`,
    );
    assert(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.screenshot({ path: "test-results/support-mobile.png" });
  await mobile.getByRole("button", { name: "Thu gọn hỗ trợ SeeVia" }).tap();
  assert.equal(await mobile.locator(".sv-support-panel").count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: explicit unavailable fixture; immediate human contact; modal focus/Escape; fixture replies, sources and safe page cards; quota/offline/unsafe response handling; mobile/touch/landscape; no runtime errors. No live AI response was simulated as a real integration.",
  );
} finally {
  await browser.close();
}
